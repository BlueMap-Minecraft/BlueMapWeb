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
import {pathFromCoords} from "../util/Utils";
import {
    TextureLoader,
    Mesh,
    PlaneBufferGeometry,
    VertexColors,
    FrontSide,
    ShaderMaterial,
    NearestFilter,
    ClampToEdgeWrapping,
    NearestMipMapLinearFilter,
    RepeatWrapping,
} from "three";

export class LowresTileLoader {

    constructor(tilePath, vertexShader, fragmentShader, tileCacheHash = 0, layer = 0) {
        Object.defineProperty( this, 'isLowresTileLoader', { value: true } );

        this.tilePath = tilePath;
        this.layer = layer;
        this.tileCacheHash = tileCacheHash;

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.textureLoader = new TextureLoader();
        this.geometry = new PlaneBufferGeometry(
            500, 500,
            100, 100
        );
        this.geometry.deleteAttribute('normal');
        this.geometry.deleteAttribute('uv');
        this.geometry.rotateX(-Math.PI / 2);
        this.geometry.translate(250, 0, 250);
    }

    load = (tileX, tileZ) => {
        let tileUrl = this.tilePath + pathFromCoords(tileX, tileZ) + '.png';

        return new Promise((resolve, reject) => {
            this.textureLoader.load(tileUrl + '?' + this.tileCacheHash,
                texture => {
                    texture.anisotropy = 1;
                    texture.generateMipmaps = false;
                    texture.magFilter = NearestFilter;
                    texture.minFilter = texture.generateMipmaps ? NearestMipMapLinearFilter : NearestFilter;
                    texture.wrapS = ClampToEdgeWrapping;
                    texture.wrapT = ClampToEdgeWrapping;
                    texture.flipY = false;
                    texture.flatShading = true;

                    let material = new ShaderMaterial({
                        uniforms: {
                            textureImage: {
                                type: 't',
                                value: texture
                            }
                        },
                        vertexShader: this.vertexShader,
                        fragmentShader: this.fragmentShader,
                        transparent: false,
                        depthWrite: true,
                        depthTest: true,
                        vertexColors: VertexColors,
                        side: FrontSide,
                        wireframe: false,
                    });

                    let object = new Mesh(this.geometry, material);
                    if (this.layer) object.layers.set(this.layer);

                    let tileSize = {x:500, z:500};
                    let translate = {x:0, z:0};
                    let scale = {x:1, z:1};
                    object.position.set(tileX * tileSize.x + translate.x, 0, tileZ * tileSize.z + translate.z);
                    object.scale.set(scale.x, 1, scale.z);

                    object.userData.tileUrl = tileUrl;

                    object.updateMatrixWorld(true);

                    resolve(object);
                },
                undefined,
                reject
            );
        });
    }

}
