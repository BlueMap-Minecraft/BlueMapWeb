import {HTMLMarker} from "./HTMLMarker";
import {dispatchEvent} from "../util/Utils";

export class POIMarker extends HTMLMarker {

    constructor(markerSet, id, parentObject) {
        super(markerSet, id, parentObject);
        this._markerElement.classList.add("bm-marker-poi");

        Object.defineProperty(this, 'isPOIMarker', {value: true});
    }

    update(markerData) {
        super.update(markerData);

        this.icon = markerData.icon ? markerData.icon : "assets/poi.svg";

        //backwards compatibility for "iconAnchor"
        if (!markerData.anchor) {
            if (markerData.iconAnchor) {
                this.setAnchor(parseInt(markerData.iconAnchor.x), parseInt(markerData.iconAnchor.y));
            }
        }
    }

    onClick(clickPosition) {
        if (!dispatchEvent(this.manager.events, 'bluemapMarkerClick', {marker: this})) return;

        this.followLink();

        this._markerElement.classList.add("bm-marker-poi-show-label");

        let onRemoveLabel = () => {
            this._markerElement.classList.remove("bm-marker-poi-show-label");
        };

        this.manager.events.addEventListener('bluemapPopupMarker', onRemoveLabel, {once: true});
        setTimeout(() => {
            this.manager.events.addEventListener('bluemapCameraMoved', onRemoveLabel, {once: true});
        }, 1000);
    }

    set label(label){
        this._label = label;

        this.updateHtml();
    }

    set icon(icon) {
        this._icon = icon;

        this.updateHtml();
    }

    updateHtml() {
        let labelHtml = '';
        if (this._label) labelHtml = `<div class="bm-marker-poi-label">${this._label}</div>`;

        this.html = `<img src="${this._icon}" alt="POI-${this.id}" draggable="false">${labelHtml}`;
    }

}