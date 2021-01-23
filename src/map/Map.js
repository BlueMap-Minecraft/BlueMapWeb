import {
	ClampToEdgeWrapping,
	FileLoader, FrontSide, NearestFilter, NearestMipMapLinearFilter, Raycaster,
	Scene, ShaderMaterial, Texture, Vector2, Vector3, VertexColors
} from "three";
import {alert, dispatchEvent, hashTile, stringToImage} from "../util/Utils";
import {TileManager} from "./TileManager";
import {TileLoader} from "./TileLoader";
import {MarkerManager} from "../markers/MarkerManager";

export class Map {

	constructor(id, dataUrl, events = null) {
		Object.defineProperty( this, 'isMap', { value: true } );

		this.id = id;
		this.events = events;
		this.dataUrl = dataUrl;

		this.name = this.id;
		this.world = "-";

		this.startPos = {x: 0, z: 0};
		this.skyColor = {r: 0, g: 0, b: 0};
		this.ambientLight = 0;

		this.hires = {
			tileSize: {x: 32, z: 32},
			scale: {x: 1, z: 1},
			translate: {x: 2, z: 2}
		};
		this.lowres = {
			tileSize: {x: 32, z: 32},
			scale: {x: 1, z: 1},
			translate: {x: 2, z: 2}
		};

		this.scene = new Scene();
		this.scene.autoUpdate = false;

		this.raycaster = new Raycaster();

		this.hiresMaterial = null;
		this.lowresMaterial = null;
		this.loadedTextures = [];

		this.hiresTileManager = null;
		this.lowresTileManager = null;

		this.markerManager = new MarkerManager(this.dataUrl + "../markers.json", this.id, this.events);
	}

	/**
	 * Loads textures and materials for this map so it is ready to load map-tiles
	 * @returns {Promise<void>}
	 */
	load(hiresVertexShader, hiresFragmentShader, lowresVertexShader, lowresFragmentShader, uniforms) {
		this.unload()

		let settingsFilePromise = this.loadSettingsFile();
		let textureFilePromise = this.loadTexturesFile();
		let markerUpdatePromise = this.markerManager.update();

		this.lowresMaterial = this.createLowresMaterial(lowresVertexShader, lowresFragmentShader, uniforms);

		let settingsPromise = settingsFilePromise
			.then(worldSettings => {
				this.name = worldSettings.name ? worldSettings.name : this.name;
				this.world = worldSettings.world ? worldSettings.world : this.world;

				this.startPos = {...this.startPos, ...worldSettings.startPos};
				this.skyColor = {...this.skyColor, ...worldSettings.skyColor};
				this.ambientLight = worldSettings.ambientLight ? worldSettings.ambientLight : 0;

				if (worldSettings.hires === undefined) worldSettings.hires = {};
				if (worldSettings.lowres === undefined) worldSettings.lowres = {};

				this.hires = {
					tileSize: {...this.hires.tileSize, ...worldSettings.hires.tileSize},
					scale: {...this.hires.scale, ...worldSettings.hires.scale},
					translate: {...this.hires.translate, ...worldSettings.hires.translate}
				};
				this.lowres = {
					tileSize: {...this.lowres.tileSize, ...worldSettings.lowres.tileSize},
					scale: {...this.lowres.scale, ...worldSettings.lowres.scale},
					translate: {...this.lowres.translate, ...worldSettings.lowres.translate}
				};
			});

		let mapPromise = Promise.all([settingsPromise, textureFilePromise])
            .then(values => {
                let textures = values[1];
                if (textures === null) throw new Error("Failed to parse textures.json!");

                this.hiresMaterial = this.createHiresMaterial(hiresVertexShader, hiresFragmentShader, uniforms, textures);

                this.hiresTileManager = new TileManager(this.scene, new TileLoader(`${this.dataUrl}hires/`, this.hiresMaterial, this.hires, 1), this.onTileLoad("hires"), this.onTileUnload("hires"), this.events);
                this.lowresTileManager = new TileManager(this.scene, new TileLoader(`${this.dataUrl}lowres/`, this.lowresMaterial, this.lowres, 2), this.onTileLoad("lowres"), this.onTileUnload("lowres"), this.events);

                alert(this.events, `Map '${this.id}' is loaded.`, "fine");
            });

		return Promise.all([mapPromise, markerUpdatePromise]);
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

	loadMapArea(x, z, hiresViewDistance, lowresViewDistance) {
		if (!this.isLoaded) return;

		let hiresX = Math.floor((x - this.hires.translate.x) / this.hires.tileSize.x);
		let hiresZ = Math.floor((z - this.hires.translate.z) / this.hires.tileSize.z);
		let hiresViewX = Math.floor(hiresViewDistance / this.hires.tileSize.x);
		let hiresViewZ = Math.floor(hiresViewDistance / this.hires.tileSize.z);

		let lowresX = Math.floor((x - this.lowres.translate.x) / this.lowres.tileSize.x);
		let lowresZ = Math.floor((z - this.lowres.translate.z) / this.lowres.tileSize.z);
		let lowresViewX = Math.floor(lowresViewDistance / this.lowres.tileSize.x);
		let lowresViewZ = Math.floor(lowresViewDistance / this.lowres.tileSize.z);

		this.hiresTileManager.loadAroundTile(hiresX, hiresZ, hiresViewX, hiresViewZ);
		this.lowresTileManager.loadAroundTile(lowresX, lowresZ, lowresViewX, lowresViewZ);
	}

    /**
     * Loads the settings.json file for this map
     * @returns {Promise<Object>}
     */
    loadSettingsFile() {
        return new Promise((resolve, reject) => {
            alert(this.events, `Loading settings for map '${this.id}'...`, "fine");

            let loader = new FileLoader();
            loader.setResponseType("json");
            loader.load(this.dataUrl + "../settings.json",
                settings => {
                    if (settings.maps && settings.maps[this.id]) {
                        resolve(settings.maps[this.id]);
                    } else {
                        reject(`the settings.json does not contain informations for map: ${this.id}`);
                    }
                },
                () => {},
                () => reject(`Failed to load the settings.json for map: ${this.id}`)
            )
        });
    }

	/**
	 * Loads the textures.json file for this map
	 * @returns {Promise<Object>}
	 */
	loadTexturesFile() {
		return new Promise((resolve, reject) => {
			alert(this.events, `Loading textures for map '${this.id}'...`, "fine");

			let loader = new FileLoader();
			loader.setResponseType("json");
			loader.load(this.dataUrl + "../textures.json",
				resolve,
				() => {},
				() => reject(`Failed to load the textures.json for map: ${this.id}`)
			)
		});
	}

	/**
	 * Creates a hires Material with the given textures
	 * @param vertexShader
	 * @param fragmentShader
	 * @param uniforms
	 * @param textures the textures
	 * @returns {ShaderMaterial[]} the hires Material (array because its a multi-material)
	 */
	createHiresMaterial(vertexShader, fragmentShader, uniforms, textures) {
		let materials = [];
		if (!Array.isArray(textures.textures)) throw new Error("Invalid texture.json: 'textures' is not an array!")
		for (let i = 0; i < textures.textures.length; i++) {
			let textureSettings = textures.textures[i];

			let color = textureSettings.color;
			if (!Array.isArray(color) || color.length < 4){
				color = [0, 0, 0, 0];
			}

			let opaque = color[3] === 1;
			let transparent = !!textureSettings.transparent;

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
			texture.needsUpdate = true;

			this.loadedTextures.push(texture);

			let material = new ShaderMaterial({
				uniforms: {
					...uniforms,
					textureImage: {
						type: 't',
						value: texture
					}
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

		this.markerManager.dispose();
	}

	/**
	 * Ray-traces and returns the terrain-height at a specific location, returns <code>false</code> if there is no map-tile loaded at that location
	 * @param x
	 * @param z
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

		let hiresTileHash = hashTile(Math.floor((x - this.hires.translate.x) / this.hires.tileSize.x), Math.floor((z - this.hires.translate.z) / this.hires.tileSize.z));
		let tile = this.hiresTileManager.tiles.get(hiresTileHash);
		if (!tile || !tile.model) {
			let lowresTileHash = hashTile(Math.floor((x - this.lowres.translate.x) / this.lowres.tileSize.x), Math.floor((z - this.lowres.translate.z) / this.lowres.tileSize.z));
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

	get isLoaded() {
		return !!(this.hiresMaterial && this.lowresMaterial);
	}

}
