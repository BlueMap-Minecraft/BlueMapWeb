import {
	PerspectiveCamera,
	WebGLRenderer,
	Vector2, Raycaster, Layers, Scene
} from "three";
import {Map} from "./map/Map";
import {SkyboxScene} from "./skybox/SkyboxScene";
import {ControlsManager} from "./controls/ControlsManager";
import {MapControls} from "./controls/MapControls";
import Stats from "./util/Stats";
import {alert, dispatchEvent, elementOffset, htmlToElement} from "./util/Utils";
import {TileManager} from "./map/TileManager";
import {HIRES_VERTEX_SHADER} from "./map/hires/HiresVertexShader";
import {HIRES_FRAGMENT_SHADER} from "./map/hires/HiresFragmentShader";
import {LOWRES_VERTEX_SHADER} from "./map/lowres/LowresVertexShader";
import {LOWRES_FRAGMENT_SHADER} from "./map/lowres/LowresFragmentShader";
import {CombinedCamera} from "./util/CombinedCamera";
import {CSS2DRenderer} from "./util/CSS2DRenderer";

export class MapViewer {

	static InteractionType = {
		LEFTCLICK: 0,
		RIGHTCLICK: 1
	};

	/**
	 * @param element {Element}
	 * @param dataUrl {string}
	 * @param liveApiUrl {string}
	 * @param events {EventTarget}
	 */
	constructor(element, dataUrl = "data/", liveApiUrl = "live/", events = element) {
		Object.defineProperty( this, 'isMapViewer', { value: true } );

		this.rootElement = element;
		this.events = events;

		this.dataUrl = dataUrl;
		this.liveApiUrl = liveApiUrl;

		this.stats = new Stats();
		this.stats.hide();

		this.superSamplingValue = 1;
		this.loadedCenter = new Vector2(0, 0);
		this.loadedHiresViewDistance = 200;
		this.loadedLowresViewDistance = 2000;

		// uniforms
		this.uniforms = {
			sunlightStrength: { value: 1 },
			ambientLight: { value: 0 },
			hiresTileMap: {
				value: {
					map: null,
					size: TileManager.tileMapSize,
					scale: new Vector2(1, 1),
					translate: new Vector2(),
					pos: new Vector2(),
				}
			}
		};

		// renderer
		this.renderer = new WebGLRenderer({
			antialias: true,
			sortObjects: true,
			preserveDrawingBuffer: true,
			logarithmicDepthBuffer: true,
		});
		this.renderer.autoClear = false;
		this.renderer.uniforms = this.uniforms;

		// CSS2D renderer
		this.css2dRenderer = new CSS2DRenderer();

		this.skyboxScene = new SkyboxScene();

		this.camera = new CombinedCamera(75, 1, 0.1, 10000, 0);
		this.skyboxCamera = new PerspectiveCamera(75, 1, 0.1, 10000);

		this.hammer = new Hammer.Manager(this.rootElement);
		this.initializeHammer();

		this.controlsManager = new ControlsManager(this, this.camera);
		this.controlsManager.controls = new MapControls(this.rootElement, this.hammer, this.events);

		this.raycaster = new Raycaster();
		this.raycaster.layers.enableAll();
		this.raycaster.params.Line2 = {threshold: 20}

		/** @type {Map} */
		this.map = null;

		this.markerScene = new Scene();

		this.lastFrame = 0;

		// initialize
		this.initializeRootElement();

		// handle some events
		window.addEventListener("resize", this.handleContainerResize);

		// start render-loop
		requestAnimationFrame(this.renderLoop);
	}

	initializeHammer() {
		let touchTap = new Hammer.Tap({ event: 'tap', pointers: 1, taps: 1, threshold: 2 });
		let touchMove = new Hammer.Pan({ event: 'move', direction: Hammer.DIRECTION_ALL, threshold: 0 });
		let touchTilt =  new Hammer.Pan({ event: 'tilt', direction: Hammer.DIRECTION_VERTICAL, pointers: 2, threshold: 0 });
		let touchRotate = new Hammer.Rotate({ event: 'rotate', pointers: 2, threshold: 10 });
		let touchZoom = new Hammer.Pinch({ event: 'zoom', pointers: 2, threshold: 0 });

		touchTilt.recognizeWith(touchRotate);
		touchTilt.recognizeWith(touchZoom);
		touchRotate.recognizeWith(touchZoom);

		this.hammer.add(touchTap);
		this.hammer.add(touchMove);
		this.hammer.add(touchTilt);
		this.hammer.add(touchRotate);
		this.hammer.add(touchZoom);
	}

	/**
	 * Initializes the root-element
	 */
	initializeRootElement() {
		this.rootElement.innerHTML = "";

		let outerDiv = htmlToElement(`<div style="position: relative; width: 100%; height: 100%; overflow: hidden;"></div>`);
		this.rootElement.appendChild(outerDiv)
		this.hammer.on('tap', event => {
			let rootOffset = elementOffset(this.rootElement);
			this.handleMapInteraction(new Vector2(
				((event.center.x - rootOffset.top) / this.rootElement.clientWidth) * 2 - 1,
				-((event.center.y - rootOffset.left) / this.rootElement.clientHeight) * 2 + 1
			));
		});

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
		this.renderer.setPixelRatio(window.devicePixelRatio * this.superSamplingValue);

		this.css2dRenderer.setSize(this.rootElement.clientWidth, this.rootElement.clientHeight);

		this.camera.aspect = this.rootElement.clientWidth / this.rootElement.clientHeight;
		this.camera.updateProjectionMatrix();
	};

	/**
	 * @param screenPos {{x: number, y:number}}
	 * @param interactionType {number}
	 */
	handleMapInteraction(screenPos, interactionType = MapViewer.InteractionType.LEFTCLICK) {
		if (this.map && this.map.isLoaded){
			this.raycaster.setFromCamera(screenPos, this.camera);

			let lowresLayer = new Layers();
			lowresLayer.set(2);

			// check marker interactions
			let intersects = this.raycaster.intersectObjects([this.map.scene, this.markerScene], true);
			let covered = false;
			for (let i = 0; i < intersects.length; i++) {
				if (intersects[i].object){
					let object = intersects[i].object;
					if (object.visible) {
						if (!covered || (object.material && !object.material.depthTest)) {
							if (object.onClick({
								interactionType: interactionType,
								intersection: intersects[i]
							})) return;
							covered = true;
						} else if (!intersects[i].object.layers.test(lowresLayer)) {
							covered = true;
						}
					}
				}
			}

		}
	}

	updateLoadedMapArea = () => {
		if (!this.map) return;

		this.map.loadMapArea(this.loadedCenter.x, this.loadedCenter.y, this.loadedHiresViewDistance, this.loadedLowresViewDistance);
	}

	/**
	 * The render-loop to update and possibly render a new frame.
	 * @param now {number} the current time in milliseconds
	 */
	renderLoop = (now) => {
		requestAnimationFrame(this.renderLoop);

		// calculate delta time
		if (this.lastFrame <= 0) { this.lastFrame = now; }
		let delta = now - this.lastFrame;
		this.lastFrame = now;

		// update stats
		this.stats.begin();

		// update controls
		if (this.map != null) {
			this.controlsManager.update(delta, this.map);
			this.controlsManager.updateCamera();
		}

		// render
		this.render(delta);

		// update stats
		this.stats.update();
	};

	/**
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

		/*
		Layers:
		0 - always visible objects
		1 - hires layer
		2 - lowres layer
		*/

		if (this.map && this.map.isLoaded) {
			//update uniforms
			this.uniforms.hiresTileMap.value.pos.copy(this.map.hiresTileManager.centerTile);

			this.camera.layers.set(2);
			this.renderer.render(this.map.scene, this.camera);
			this.renderer.clearDepth();
			this.camera.layers.set(0);
			if (this.controlsManager.distance < 2000) this.camera.layers.enable(1);
			this.renderer.render(this.map.scene, this.camera);
			//this.renderer.render(this.map.markerManager.objectMarkerScene, this.camera);
			//this.css2dRenderer.render(this.map.markerManager.elementMarkerScene, this.camera);
		}

		// render markers
		this.renderer.render(this.markerScene, this.camera);
		this.css2dRenderer.render(this.markerScene, this.camera);
	}

	/**
	 * Changes / Sets the map that will be loaded and displayed
	 * @param map {Map}
	 */
	setMap(map = null) {
		if (this.map && this.map.isMap) this.map.unload();

		this.map = map;

		if (this.map && this.map.isMap) {
			return map.load(HIRES_VERTEX_SHADER, HIRES_FRAGMENT_SHADER, LOWRES_VERTEX_SHADER, LOWRES_FRAGMENT_SHADER, this.uniforms)
				.then(() => {
					this.skyboxScene.ambientLight = map.ambientLight;
					this.skyboxScene.skyColor = map.skyColor;

					this.uniforms.ambientLight.value = map.ambientLight;
					this.uniforms.hiresTileMap.value.map = map.hiresTileManager.tileMap.texture;
					this.uniforms.hiresTileMap.value.scale.set(map.hires.tileSize.x, map.hires.tileSize.z);
					this.uniforms.hiresTileMap.value.translate.set(map.hires.translate.x, map.hires.translate.z);

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
	 * @param centerX {number}
	 * @param centerZ {number}
	 * @param hiresViewDistance {number}
	 * @param lowresViewDistance {number}
	 */
	loadMapArea(centerX, centerZ, hiresViewDistance = -1, lowresViewDistance = -1) {
		this.loadedCenter.set(centerX, centerZ);
		if (hiresViewDistance >= 0) this.loadedHiresViewDistance = hiresViewDistance;
		if (lowresViewDistance >= 0) this.loadedLowresViewDistance = lowresViewDistance;

		this.updateLoadedMapArea();
	}

	/**
	 * @returns {number}
	 */
	get superSampling() {
		return this.superSamplingValue;
	}

	/**
	 * @param value {number}
	 */
	set superSampling(value) {
		this.superSamplingValue = value;
		this.handleContainerResize();
	}

	// --------------------------

	/**
	 * Applies a loaded settings-object (settings.json)
	 * @param settings {{maps: {}}}
	 */
	applySettings(settings) {

		// reset maps
		this.maps.forEach(map => map.dispose());
		this.maps = [];

		// create maps
		if (settings.maps !== undefined){
			for (let mapId in settings.maps) {
				if (!settings.maps.hasOwnProperty(mapId)) continue;

				let mapSettings = settings.maps[mapId];
				if (mapSettings.enabled)
					this.maps.push(new Map(mapId, this.dataUrl + mapId + "/", this.rootElement));
			}
		}

		// sort maps
		this.maps.sort((map1, map2) => {
			let sort = settings.maps[map1.id].ordinal - settings.maps[map2.id].ordinal;
			if (isNaN(sort)) return 0;
			return sort;
		});
	}

}
