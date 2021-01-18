import {ClampToEdgeWrapping, LinearFilter, Texture} from "three";

export class TileMap {

    static EMPTY = "#000";
    static LOADED = "#fff";

    constructor(width, height) {
        this.canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        this.canvas.width = width;
        this.canvas.height = height;

        this.tileMapContext = this.canvas.getContext('2d', {
            alpha: false,
            willReadFrequently: true,
        });

        this.texture = new Texture(this.canvas);
        this.texture.generateMipmaps = false;
        this.texture.magFilter = LinearFilter;
        this.texture.minFilter = LinearFilter;
        this.texture.wrapS = ClampToEdgeWrapping;
        this.texture.wrapT = ClampToEdgeWrapping;
        this.texture.flipY = false;
        this.texture.needsUpdate = true;
    }

    setAll(state) {
        this.tileMapContext.fillStyle = state;
        this.tileMapContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.texture.needsUpdate = true;
    }

    setTile(x, z, state) {
        this.tileMapContext.fillStyle = state;
        this.tileMapContext.fillRect(x, z, 1, 1);

        this.texture.needsUpdate = true;
    }

}