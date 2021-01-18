import {Marker} from "./Marker";
import {CSS2DObject} from "../util/CSS2DRenderer";
import {htmlToElement} from "../util/Utils";

export class HTMLMarker extends Marker {

    constructor(markerSet, id, parentObject) {
        super(markerSet, id);

        Object.defineProperty(this, 'isHTMLMarker', {value: true});
        Object.defineProperty(this, 'type', {value: "html"});

        this._markerElement = htmlToElement(`<div id="bm-marker-${this.id}" class="bm-marker-${this.type}"></div>`);
        this._markerElement.addEventListener('click', event => this.onClick(this.position));
        this._markerObject = new CSS2DObject(this._markerElement);
        this._markerObject.position.copy(this.position);
        this._markerObject.onBeforeRender = (renderer, scene, camera) => this._onBeforeRender(renderer, scene, camera);

        parentObject.add(this._markerObject);
    }

    update(markerData) {
        super.update(markerData);

        if (markerData.html) {
            this.html = markerData.html;
        }

        if (markerData.anchor) {
            this.setAnchor(parseInt(markerData.anchor.x), parseInt(markerData.anchor.y));
        }
    }

    _onBeforeRender(renderer, scene, camera) {
        super._onBeforeRender(renderer, scene, camera);

        this._markerElement.style.opacity = this._opacity;
        this._markerElement.setAttribute("data-distance", Math.round(this._distance));

        if (this._opacity <= 0){
            this._markerElement.style.pointerEvents = "none";
        } else {
            this._markerElement.style.pointerEvents = "auto";
        }
    }

    dispose() {
        this._markerObject.parent.remove(this._markerObject);

        super.dispose();
    }

    set html(html) {
        this._markerElement.innerHTML = html;
    }

    setAnchor(x, y) {
        this._markerObject.anchor.set(x, y);
    }

    setPosition(x, y, z) {
        super.setPosition(x, y, z);
        this._markerObject.position.set(x, y, z);
    }

}