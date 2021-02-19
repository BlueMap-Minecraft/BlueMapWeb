import {pathFromCoords} from "../util/Utils";
import {BufferGeometryLoader, FileLoader, Mesh} from "three";

export class TileLoader {

    /**
     * @param tilePath {string}
     * @param material {THREE.Material | THREE.Material[]}
     * @param tileSettings {{
	 *      tileSize: {x: number, z: number},
	 *	    scale: {x: number, z: number},
     *      translate: {x: number, z: number}
     * }}
     * @param layer {number}
     */
    constructor(tilePath, material, tileSettings, layer = 0) {
        Object.defineProperty( this, 'isTileLoader', { value: true } );

        this.tilePath = tilePath;
        this.material = material;
        this.tileSettings = tileSettings;

        this.layer = layer;

        this.fileLoader = new FileLoader();
        this.fileLoader.setResponseType('json');

        this.bufferGeometryLoader = new BufferGeometryLoader();
    }

    load = (tileX, tileZ) => {
        return new Promise((resolve, reject) => {
            this.fileLoader.load(this.tilePath + pathFromCoords(tileX, tileZ) + '.json',
                geometryJson => {
                    if (!geometryJson.type || geometryJson.type !== 'BufferGeometry') reject({status: "empty"});

                    let geometry = this.bufferGeometryLoader.parse(geometryJson);

                    let object = new Mesh(geometry, this.material);
                    if (this.layer) object.layers.set(this.layer);

                    let tileSize = this.tileSettings.tileSize;
                    let translate = this.tileSettings.translate;
                    let scale = this.tileSettings.scale;
                    object.position.set(tileX * tileSize.x + translate.x, 0, tileZ * tileSize.z + translate.z);
                    object.scale.set(scale.x, 1, scale.z);

                    object.userData.tileUrl = this.tilePath + pathFromCoords(tileX, tileZ) + '.json';

                    object.updateMatrixWorld(true);

                    resolve(object);
                },
                () => {},
                reject
            );
        });
    }

}
