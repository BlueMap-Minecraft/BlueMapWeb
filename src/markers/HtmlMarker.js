import {Marker} from "./Marker";
import {CSS2DObject} from "../util/CSS2DRenderer";
import {htmlToElement} from "../util/Utils";

export class HtmlMarker extends Marker {

    /**
     * @param markerId {string}
     */
    constructor(markerId) {
        super(markerId);
        Object.defineProperty(this, 'isHtmlMarker', {value: true});
        this.markerType = "html";

        this.elementObject = new CSS2DObject(htmlToElement(`<div id="bm-marker-${this.markerId}" class="bm-marker-${this.markerType}"></div>`));
        this.elementObject.onBeforeRender = (renderer, scene, camera) => this.onBeforeRender(renderer, scene, camera);

        this.fadeDistanceMin = 0;
        this.fadeDistanceMax = Number.MAX_VALUE;

        this.addEventListener( 'removed', () => {
            if (this.element.parentNode) this.element.parentNode.removeChild(this.element);
        });

        this.add(this.elementObject);
    }

    onBeforeRender(renderer, scene, camera) {
        if (this.fadeDistanceMax === Number.MAX_VALUE && this.fadeDistanceMin <= 0){
            this.element.style.opacity = undefined;
        } else {
            this.element.style.opacity = Marker.calculateDistanceOpacity(this.position, camera, this.fadeDistanceMin, this.fadeDistanceMax).toString();
        }
    }

    /**
     * @returns {string}
     */
    get html() {
        return this.element.innerHTML;
    }

    /**
     * @param html {string}
     */
    set html(html) {
        this.element.innerHTML = html;
    }

    /**
     * @returns {THREE.Vector2}
     */
    get anchor() {
        return this.elementObject.anchor;
    }

    /**
     * @returns {Element}
     */
    get element() {
        return this.elementObject.element;
    }

    /**
     * @param markerData {{
     *      position: {x: number, y: number, z: number},
     *      anchor: {x: number, y: number},
     *      html: string,
     *      minDistance: number,
     *      maxDistance: number
     *      }}
     */
    updateFromData(markerData) {

        // update position
        let pos = markerData.position || {};
        this.position.setX(pos.x || 0);
        this.position.setY(pos.y || 0);
        this.position.setZ(pos.z || 0);

        // update anchor
        let anch = markerData.anchor || {};
        this.anchor.setX(anch.x || 0);
        this.anchor.setY(anch.y || 0);

        // update html
        if (this.element.innerHTML !== markerData.html){
            this.element.innerHTML = markerData.html;
        }

        // update min/max distances
        this.fadeDistanceMin = markerData.minDistance || 0;
        this.fadeDistanceMax = markerData.maxDistance !== undefined ? markerData.maxDistance : Number.MAX_VALUE;

    }

    dispose() {
        super.dispose();

        if (this.element.parentNode) this.element.parentNode.removeChild(this.element);
    }

}