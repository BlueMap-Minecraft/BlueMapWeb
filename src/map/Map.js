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
import {
	ClampToEdgeWrapping,
	Color,
	FileLoader,
	FrontSide,
	NearestFilter,
	NearestMipMapLinearFilter,
	Raycaster,
	Scene,
	ShaderMaterial,
	Texture,
	Vector3,
	VertexColors
} from "three";
import {alert, dispatchEvent, generateCacheHash, hashTile, stringToImage, vecArrToObj} from "../util/Utils";
import {TileManager} from "./TileManager";
import {TileLoader} from "./TileLoader";
import {LowresTileLoader} from "./LowresTileLoader";

export class Map {

	/**
	 * @param id {string}
	 * @param dataUrl {string}
	 * @param events {EventTarget}
	 */
	constructor(id, dataUrl, events = null) {
		Object.defineProperty( this, 'isMap', { value: true } );

		this.events = events;

		this.data = {
			id: id,
			sorting: 0,
			dataUrl: dataUrl,
			settingsUrl: dataUrl + "settings.json",
			texturesUrl: dataUrl + "textures.json",
			name: id,
			startPos: {x: 0, z: 0},
			skyColor: new Color(),
			ambientLight: 0,
			hires: {
				tileSize: {x: 32, z: 32},
				scale: {x: 1, z: 1},
				translate: {x: 2, z: 2}
			},
			lowres: {
				tileSize: {x: 32, z: 32},
				scale: {x: 1, z: 1},
				translate: {x: 2, z: 2}
			}
		};

		this.raycaster = new Raycaster();

		/** @type {ShaderMaterial[]} */
		this.hiresMaterial = null;
		/** @type {ShaderMaterial} */
		this.lowresMaterial = null;
		/** @type {Texture[]} */
		this.loadedTextures = [];

		/** @type {TileManager} */
		this.hiresTileManager = null;
		/** @type {TileManager} */
		this.lowresTileManager = null;
	}

	/**
	 * Loads textures and materials for this map so it is ready to load map-tiles
	 * @param hiresVertexShader {string}
	 * @param hiresFragmentShader {string}
	 * @param lowresVertexShader {string}
	 * @param lowresFragmentShader {string}
	 * @param uniforms {object}
	 * @param tileCacheHash {number}
	 * @returns {Promise<void>}
	 */
	load(hiresVertexShader, hiresFragmentShader, lowresVertexShader, lowresFragmentShader, uniforms, tileCacheHash = 0) {
		this.unload()

		let settingsPromise = this.loadSettings();
		let textureFilePromise = this.loadTexturesFile();

		this.lowresMaterial = this.createLowresMaterial(lowresVertexShader, lowresFragmentShader, uniforms);

		return Promise.all([settingsPromise, textureFilePromise])
            .then(values => {
                let textures = values[1];
                if (textures === null) throw new Error("Failed to parse textures.json!");

                this.hiresMaterial = this.createHiresMaterial(hiresVertexShader, hiresFragmentShader, uniforms, textures);

                this.hiresTileManager = new TileManager(new Scene(), new TileLoader(`${this.data.dataUrl}tiles/0/`, this.hiresMaterial, this.data.hires, tileCacheHash), this.onTileLoad("hires"), this.onTileUnload("hires"), this.events);
                this.lowresTileManager = new TileManager(new Scene(), new LowresTileLoader(`${this.data.dataUrl}tiles/1/`, lowresVertexShader, lowresFragmentShader, tileCacheHash), this.onTileLoad("lowres"), this.onTileUnload("lowres"), this.events);

                this.hiresTileManager.scene.autoUpdate = false;
                this.lowresTileManager.scene.autoUpdate = false;

                alert(this.events, `Map '${this.data.id}' is loaded.`, "fine");
            });
	}

	/**
	 * Loads the settings of this map
	 * @returns {Promise<void>}
	 */
	loadSettings() {
		return this.loadSettingsFile()
			.then(worldSettings => {
				this.data.name = worldSettings.name ? worldSettings.name : this.data.name;

				this.data.sorting = worldSettings.sorting ? worldSettings.sorting : this.data.sorting;

				this.data.startPos = {...this.data.startPos, ...vecArrToObj(worldSettings.startPos, true)};

				if (worldSettings.skyColor && worldSettings.skyColor.length >= 3) {
					this.data.skyColor.setRGB(
						worldSettings.skyColor[0],
						worldSettings.skyColor[1],
						worldSettings.skyColor[2]
					);
				}

				this.data.ambientLight = worldSettings.ambientLight ? worldSettings.ambientLight : this.data.ambientLight;

				if (worldSettings.hires === undefined) worldSettings.hires = {};
				if (worldSettings.lowres === undefined) worldSettings.lowres = {};

				this.data.hires = {
					tileSize: {...this.data.hires.tileSize, ...vecArrToObj(worldSettings.hires.tileSize, true)},
					scale: {...this.data.hires.scale, ...vecArrToObj(worldSettings.hires.scale, true)},
					translate: {...this.data.hires.translate, ...vecArrToObj(worldSettings.hires.translate, true)}
				};
				this.data.lowres = {
					tileSize: {...this.data.lowres.tileSize, ...vecArrToObj(worldSettings.lowres.tileSize, true)},
					scale: {...this.data.lowres.scale, ...vecArrToObj(worldSettings.lowres.scale, true)},
					translate: {...this.data.lowres.translate, ...vecArrToObj(worldSettings.lowres.translate, true)}
				};

				alert(this.events, `Settings for map '${this.data.id}' loaded.`, "fine");
			});
	}

	onTileLoad = layer => tile => {
		dispatchEvent(this.events, "bluemapMapTileLoaded", {
			tile: tile,
			layer: layer
		});
	}

	onTileUnload = layer => tile => {
		dispatchEvent(this.events, "bluemapMapTileUnloaded", {
			tile: tile,
			layer: layer
		});
	}

	/**
	 * @param x {number}
	 * @param z {number}
	 * @param hiresViewDistance {number}
	 * @param lowresViewDistance {number}
	 */
	loadMapArea(x, z, hiresViewDistance, lowresViewDistance) {
		if (!this.isLoaded) return;

		let hiresX = Math.floor((x - this.data.hires.translate.x) / this.data.hires.tileSize.x);
		let hiresZ = Math.floor((z - this.data.hires.translate.z) / this.data.hires.tileSize.z);
		let hiresViewX = Math.floor(hiresViewDistance / this.data.hires.tileSize.x);
		let hiresViewZ = Math.floor(hiresViewDistance / this.data.hires.tileSize.z);

		let lowresX = Math.floor((x - this.data.lowres.translate.x) / this.data.lowres.tileSize.x);
		let lowresZ = Math.floor((z - this.data.lowres.translate.z) / this.data.lowres.tileSize.z);
		let lowresViewX = Math.floor(lowresViewDistance / this.data.lowres.tileSize.x);
		let lowresViewZ = Math.floor(lowresViewDistance / this.data.lowres.tileSize.z);

		this.hiresTileManager.loadAroundTile(hiresX, hiresZ, hiresViewX, hiresViewZ);
		this.lowresTileManager.loadAroundTile(lowresX, lowresZ, lowresViewX, lowresViewZ);
	}

    /**
     * Loads the settings.json file for this map
     * @returns {Promise<Object>}
     */
    loadSettingsFile() {
        return new Promise((resolve, reject) => {
            alert(this.events, `Loading settings for map '${this.data.id}'...`, "fine");

            let loader = new FileLoader();
            loader.setResponseType("json");
            loader.load(this.data.settingsUrl + "?" + generateCacheHash(),
                resolve,
                () => {},
                () => reject(`Failed to load the settings.json for map: ${this.data.id}`)
            )
        });
    }

	/**
	 * Loads the textures.json file for this map
	 * @returns {Promise<Object>}
	 */
	loadTexturesFile() {
		return new Promise((resolve, reject) => {
			alert(this.events, `Loading textures for map '${this.data.id}'...`, "fine");

			let loader = new FileLoader();
			loader.setResponseType("json");
			loader.load(this.data.texturesUrl + "?" + generateCacheHash(),
				resolve,
				() => {},
				() => reject(`Failed to load the textures.json for map: ${this.data.id}`)
			)
		});
	}

	/**
	 * Creates a hires Material with the given textures
	 * @param vertexShader {string}
	 * @param fragmentShader {string}
	 * @param uniforms {object}
	 * @param textures {{
	 *     resourcePath: string,
	 *     color: number[],
	 *     halfTransparent: boolean,
	 *     texture: string
	 * }[]} the textures-data
	 * @returns {ShaderMaterial[]} the hires Material (array because its a multi-material)
	 */
	createHiresMaterial(vertexShader, fragmentShader, uniforms, textures) {
		let materials = [];
		if (!Array.isArray(textures)) throw new Error("Invalid texture.json: 'textures' is not an array!")
		for (let i = 0; i < textures.length; i++) {
			let textureSettings = textures[i];

			let color = textureSettings.color;
			if (!Array.isArray(color) || color.length < 4){
				color = [0, 0, 0, 0];
			}

			let opaque = color[3] === 1;
			let transparent = !!textureSettings.halfTransparent;

			let texture = new Texture();
			texture.image = stringToImage(textureSettings.texture);

			texture.anisotropy = 1;
			texture.generateMipmaps = opaque || transparent;
			texture.magFilter = NearestFilter;
			texture.minFilter = texture.generateMipmaps ? NearestMipMapLinearFilter : NearestFilter;
			texture.wrapS = ClampToEdgeWrapping;
			texture.wrapT = ClampToEdgeWrapping;
			texture.flipY = false;
			texture.flatShading = true;
			texture.image.addEventListener("load", () => texture.needsUpdate = true);

			this.loadedTextures.push(texture);

			let material = new ShaderMaterial({
				uniforms: {
					...uniforms,
					textureImage: {
						type: 't',
						value: texture
					},
					transparent: { value: transparent }
				},
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				transparent: transparent,
				depthWrite: true,
				depthTest: true,
				vertexColors: VertexColors,
				side: FrontSide,
				wireframe: false,
			});

			material.needsUpdate = true;
			materials[i] = material;
		}

		return materials;
	}

	/**
	 * Creates a lowres Material
	 * @param vertexShader {string}
	 * @param fragmentShader {string}
	 * @param uniforms {object}
	 * @returns {ShaderMaterial} the hires Material
	 */
	createLowresMaterial(vertexShader, fragmentShader, uniforms) {
		return new ShaderMaterial({
			uniforms: uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			transparent: false,
			depthWrite: true,
			depthTest: true,
			vertexColors: VertexColors,
			side: FrontSide,
			wireframe: false
		});
	}

	unload() {
		if (this.hiresTileManager) this.hiresTileManager.unload();
		this.hiresTileManager = null;

		if (this.lowresTileManager) this.lowresTileManager.unload();
		this.lowresTileManager = null;

		if (this.hiresMaterial) this.hiresMaterial.forEach(material => material.dispose());
		this.hiresMaterial = null;

		if (this.lowresMaterial) this.lowresMaterial.dispose();
		this.lowresMaterial = null;

		this.loadedTextures.forEach(texture => texture.dispose());
		this.loadedTextures = [];
	}

	/**
	 * Ray-traces and returns the terrain-height at a specific location, returns <code>false</code> if there is no map-tile loaded at that location
	 * @param x {number}
	 * @param z {number}
	 * @returns {boolean|number}
	 */
	terrainHeightAt(x, z) {
		if (!this.isLoaded) return false;

		this.raycaster.set(
			new Vector3(x, 300, z), // ray-start
			new Vector3(0, -1, 0) // ray-direction
		);
		this.raycaster.near = 1;
		this.raycaster.far = 300;
		this.raycaster.layers.enableAll();

		let hiresTileHash = hashTile(Math.floor((x - this.data.hires.translate.x) / this.data.hires.tileSize.x), Math.floor((z - this.data.hires.translate.z) / this.data.hires.tileSize.z));
		let tile = this.hiresTileManager.tiles.get(hiresTileHash);
		if (!tile || !tile.model) {
			let lowresTileHash = hashTile(Math.floor((x - this.data.lowres.translate.x) / this.data.lowres.tileSize.x), Math.floor((z - this.data.lowres.translate.z) / this.data.lowres.tileSize.z));
			tile = this.lowresTileManager.tiles.get(lowresTileHash);
		}

		if (!tile || !tile.model){
			return false;
		}

		try {
			let intersects = this.raycaster.intersectObjects([tile.model]);
			if (intersects.length > 0) {
				return intersects[0].point.y;
			}
		} catch (err) {
			return false;
		}
	}

	dispose() {
		this.unload();
	}

	/**
	 * @returns {boolean}
	 */
	get isLoaded() {
		return !!(this.hiresMaterial && this.lowresMaterial);
	}

}
