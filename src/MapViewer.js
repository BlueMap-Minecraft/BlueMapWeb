/*
 * This file is part of BlueMap, licensed under the MIT License (MIT).
 *
 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
 * Copyright (c) contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import {Color, PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer} from "three";
import {Map} from "./map/Map";
import {SkyboxScene} from "./skybox/SkyboxScene";
import {ControlsManager} from "./controls/ControlsManager";
import Stats from "./util/Stats";
import {alert, dispatchEvent, elementOffset, htmlToElement} from "./util/Utils";
import {TileManager} from "./map/TileManager";
import {HIRES_VERTEX_SHADER} from "./map/hires/HiresVertexShader";
import {HIRES_FRAGMENT_SHADER} from "./map/hires/HiresFragmentShader";
import {LOWRES_VERTEX_SHADER} from "./map/lowres/LowresVertexShader";
import {LOWRES_FRAGMENT_SHADER} from "./map/lowres/LowresFragmentShader";
import {CombinedCamera} from "./util/CombinedCamera";
import {CSS2DRenderer} from "./util/CSS2DRenderer";
import {MarkerSet} from "./markers/MarkerSet";

export class MapViewer {

	/**
	 * @param element {Element}
	 * @param events {EventTarget}
	 */
	constructor(element, events = element) {
		Object.defineProperty( this, 'isMapViewer', { value: true } );

		this.rootElement = element;
		this.events = events;

		this.data = {
			map: null,
			camera: null,
			controlsManager: null,
			uniforms: {
				sunlightStrength: { value: 1 },
				ambientLight: { value: 0 },
				skyColor: { value: new Color(0.5, 0.5, 1) },
				hiresTileMap: {
					value: {
						map: null,
						size: TileManager.tileMapSize,
						scale: new Vector2(1, 1),
						translate: new Vector2(),
						pos: new Vector2(),
					}
				}
			},
			superSampling: 1,
			loadedCenter: new Vector2(0, 0),
			loadedHiresViewDistance: 200,
			loadedLowresViewDistance: 2000,
		}

		this.stats = new Stats();
		this.stats.hide();

		// renderer
		this.renderer = new WebGLRenderer({
			antialias: true,
			sortObjects: true,
			preserveDrawingBuffer: true,
			logarithmicDepthBuffer: true,
		});
		this.renderer.autoClear = false;
		this.renderer.uniforms = this.data.uniforms;

		// CSS2D renderer
		this.css2dRenderer = new CSS2DRenderer();

		this.skyboxScene = new SkyboxScene(this.data.uniforms);

		this.camera = new CombinedCamera(75, 1, 0.1, 10000, 0);
		this.skyboxCamera = new PerspectiveCamera(75, 1, 0.1, 10000);

		this.controlsManager = new ControlsManager(this, this.camera);

		this.raycaster = new Raycaster();
		this.raycaster.layers.enableAll();
		this.raycaster.params.Line2 = {threshold: 20}

		/** @type {Map} */
		this.map = null;

		this.markers = new MarkerSet("bm-root");

		this.lastFrame = 0;

		// initialize
		this.initializeRootElement();

		// handle window resizes
		window.addEventListener("resize", this.handleContainerResize);

		// start render-loop
		requestAnimationFrame(this.renderLoop);
	}

	/**
	 * Initializes the root-element
	 */
	initializeRootElement() {
		this.rootElement.innerHTML = "";

		let outerDiv = htmlToElement(`<div style="position: relative; width: 100%; height: 100%; overflow: hidden;"></div>`);
		this.rootElement.appendChild(outerDiv);

		// 3d-canvas
		outerDiv.appendChild(this.renderer.domElement);

		// html-markers
		this.css2dRenderer.domElement.style.position = 'absolute';
		this.css2dRenderer.domElement.style.top = '0';
		this.css2dRenderer.domElement.style.left = '0';
		this.css2dRenderer.domElement.style.pointerEvents = 'none';
		outerDiv.appendChild(this.css2dRenderer.domElement);

		// performance monitor
		outerDiv.appendChild(this.stats.dom);

		this.handleContainerResize();
	}

	/**
	 * Updates the render-resolution and aspect ratio based on the size of the root-element
	 */
	handleContainerResize = () => {
		this.renderer.setSize(this.rootElement.clientWidth, this.rootElement.clientHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio * this.superSampling);

		this.css2dRenderer.setSize(this.rootElement.clientWidth, this.rootElement.clientHeight);

		this.camera.aspect = this.rootElement.clientWidth / this.rootElement.clientHeight;
		this.camera.updateProjectionMatrix();
	};

	/**
	 * Triggers an interaction on the screen (map), e.g. a mouse-click.
	 *
	 * This will first attempt to invoke the onClick() method on the Object3D (e.g. Markers) that has been clicked.
	 * And if none of those consumed the event, it will fire a <code>bluemapMapInteraction</code> event.
	 *
	 * @param screenPosition {Vector2} - Clicked position on the screen (usually event.x, event.y)
	 * @param data {object} - Custom event data that will be added to the interaction-event
	 */
	handleMapInteraction(screenPosition, data = {}) {
		let rootOffset = elementOffset(this.rootElement);
		let normalizedScreenPos = new Vector2(
			((screenPosition.x - rootOffset.top) / this.rootElement.clientWidth) * 2 - 1,
			-((screenPosition.y - rootOffset.left) / this.rootElement.clientHeight) * 2 + 1
		);

		if (this.map && this.map.isLoaded){
			this.raycaster.setFromCamera(normalizedScreenPos, this.camera);

			// check Object3D interactions
			let intersects = this.raycaster.intersectObjects([this.map.hiresTileManager.scene, this.map.lowresTileManager.scene, this.markers], true);
			let hit = null;
			let lowresHit = null;
			let hiresHit = null;
			let covered = false;
			for (let i = 0; i < intersects.length; i++) {
				if (intersects[i].object){
					let object = intersects[i].object;

					// check if deeply-visible
					let parent = object;
					let visible = parent.visible;
					while (visible && parent.parent){
						parent = parent.parent;
						visible = parent.visible;
					}

					if (visible) {
						if (!hit) hit = intersects[i];

						// find root-scene
						let parentRoot = object;
						while(parentRoot.parent) parentRoot = parentRoot.parent;

						if (parentRoot === this.map.lowresTileManager.scene) {
							if (!lowresHit) lowresHit = intersects[i];
						}

						if (parentRoot === this.map.hiresTileManager.scene) {
							if (!hiresHit) hiresHit = intersects[i];
						}

						if (!covered || (object.material && !object.material.depthTest)) {
							if (object.onClick && object.onClick({
								data: data,
								intersection: intersects[i]
							})) return;
						}

						if (parentRoot !== this.map.lowresTileManager.scene) {
							covered = true;
						}
					}
				}
			}

			// fire event
			dispatchEvent(this.events, "bluemapMapInteraction", {
				data: data,
				hit: hit,
				hiresHit: hiresHit,
				lowresHit: lowresHit,
				intersections: intersects,
				ray: this.raycaster.ray
			});
		}
	}

	/**
	 * @private
	 * The render-loop to update and possibly render a new frame.
	 * @param now {number} the current time in milliseconds
	 */
	renderLoop = (now) => {
		requestAnimationFrame(this.renderLoop);

		// calculate delta time
		if (this.lastFrame <= 0) this.lastFrame = now;
		let delta = now - this.lastFrame;
		this.lastFrame = now;

		// update stats
		this.stats.begin();

		// update controls
		if (this.map != null) {
			this.controlsManager.update(delta, this.map);
		}

		// render
		this.render(delta);

		// update stats
		this.stats.update();
	};

	/**
	 * @private
	 * Renders a frame
	 * @param delta {number}
	 */
	render(delta) {
		dispatchEvent(this.events, "bluemapRenderFrame", {
			delta: delta,
		});

		//prepare camera
		this.camera.updateProjectionMatrix();
		this.skyboxCamera.rotation.copy(this.camera.rotation);
		this.skyboxCamera.updateProjectionMatrix();

		//render
		this.renderer.clear();

		this.renderer.render(this.skyboxScene, this.skyboxCamera);
		this.renderer.clearDepth();

		if (this.map && this.map.isLoaded) {
			//update uniforms
			this.data.uniforms.hiresTileMap.value.pos.copy(this.map.hiresTileManager.centerTile);

			this.renderer.render(this.map.lowresTileManager.scene, this.camera);
			this.renderer.clearDepth();

			if (this.controlsManager.distance < 2000) {
				this.renderer.render(this.map.hiresTileManager.scene, this.camera);
			}
		}

		// render markers
		this.renderer.render(this.markers, this.camera);
		this.css2dRenderer.render(this.markers, this.camera);
	}

	/**
	 * Changes / Sets the map that will be loaded and displayed
	 * @param map {Map}
	 * @returns Promise<void>
	 */
	switchMap(map = null) {
		if (this.map && this.map.isMap) this.map.unload();

		this.map = map;

		if (this.map && this.map.isMap) {
			return map.load(HIRES_VERTEX_SHADER, HIRES_FRAGMENT_SHADER, LOWRES_VERTEX_SHADER, LOWRES_FRAGMENT_SHADER, this.data.uniforms)
				.then(() => {
					for (let texture of this.map.loadedTextures){
						this.renderer.initTexture(texture);
					}

					this.data.uniforms.skyColor.value = map.data.skyColor;
					this.data.uniforms.ambientLight.value = map.data.ambientLight;
					this.data.uniforms.hiresTileMap.value.map = map.hiresTileManager.tileMap.texture;
					this.data.uniforms.hiresTileMap.value.scale.set(map.data.hires.tileSize.x, map.data.hires.tileSize.z);
					this.data.uniforms.hiresTileMap.value.translate.set(map.data.hires.translate.x, map.data.hires.translate.z);

					setTimeout(this.updateLoadedMapArea);

					dispatchEvent(this.events, "bluemapMapChanged", {
						map: map
					});
				})
				.catch(error => {
					alert(this.events, error, "error");
				});
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * Loads the given area on the map (and unloads everything outside that area)
	 * @param centerX {number}
	 * @param centerZ {number}
	 * @param hiresViewDistance {number?}
	 * @param lowresViewDistance {number?}
	 */
	loadMapArea(centerX, centerZ, hiresViewDistance = -1, lowresViewDistance = -1) {
		this.data.loadedCenter.set(centerX, centerZ);
		if (hiresViewDistance >= 0) this.data.loadedHiresViewDistance = hiresViewDistance;
		if (lowresViewDistance >= 0) this.data.loadedLowresViewDistance = lowresViewDistance;

		this.updateLoadedMapArea();
	}

	/**
	 * @private
	 */
	updateLoadedMapArea = () => {
		if (!this.map) return;
		this.map.loadMapArea(this.data.loadedCenter.x, this.data.loadedCenter.y, this.data.loadedHiresViewDistance, this.data.loadedLowresViewDistance);
	}

	/**
	 * @returns {number}
	 */
	get superSampling() {
		return this.data.superSampling;
	}

	/**
	 * @param value {number}
	 */
	set superSampling(value) {
		this.data.superSampling = value;
		this.handleContainerResize();
	}

	/**
	 * @returns {CombinedCamera}
	 */
	get camera() {
		return this._camera;
	}

	/**
	 * @param value {CombinedCamera}
	 */
	set camera(value) {
		this._camera = value;
		this.data.camera = value.data;
	}

	/**
	 * @returns {ControlsManager}
	 */
	get controlsManager() {
		return this._controlsManager;
	}

	/**
	 * @param value {ControlsManager}
	 */
	set controlsManager(value) {
		this._controlsManager = value;
		this.data.controlsManager = value.data;
	}

	/**
	 * @returns {Map}
	 */
	get map() {
		return this._map;
	}

	/**
	 * @param value {Map}
	 */
	set map(value) {
		this._map = value;
		if (value) this.data.map = value.data;
	}

}
