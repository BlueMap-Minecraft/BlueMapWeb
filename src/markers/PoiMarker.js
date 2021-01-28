import {HtmlMarker} from "./HtmlMarker";

export class PoiMarker extends HtmlMarker {

    /**
     * @param markerId {string}
     */
    constructor(markerId) {
        super(markerId);
        Object.defineProperty(this, 'isPoiMarker', {value: true});
        this.markerType = "poi";

        this.html = `<img src="" alt="POI Icon (${this.markerId})" class="bm-marker-poi-icon" draggable="false" style="pointer-events: auto"><div class="bm-marker-poi-label"></div>`;

        this.iconElement = this.element.getElementsByTagName("img").item(0);
        this.labelElement = this.element.getElementsByTagName("div").item(0);

        this._lastIcon = null;
    }

    onClick(event) {
        if (this.hightlight) return;
        this.hightlight = true;

        let eventHandler = evt => {
            if (evt.path.includes(this.element)) return;

            this.hightlight = false;

            window.removeEventListener("mousedown", eventHandler);
            window.removeEventListener("touchstart", eventHandler);
            window.removeEventListener("keydown", eventHandler);
            window.removeEventListener("mousewheel", eventHandler);
        };

        setTimeout(function () {
            window.addEventListener("mousedown", eventHandler);
            window.addEventListener("touchstart", eventHandler);
            window.addEventListener("keydown", eventHandler);
            window.addEventListener("mousewheel", eventHandler);
        }, 0);

        return true;
    }

    set hightlight(highlight) {
        if (highlight) {
            this.element.classList.add("bm-marker-highlight");
        } else {
            this.element.classList.remove("bm-marker-highlight");
        }
    }

    get hightlight() {
        return this.element.classList.contains("bm-marker-highlight");
    }

    /**
     * @param markerData {{
     *      position: {x: number, y: number, z: number},
     *      anchor: {x: number, y: number},
     *      iconAnchor: {x: number, y: number},
     *      label: string,
     *      icon: string,
     *      link: string,
     *      newTab: boolean,
     *      minDistance: number,
     *      maxDistance: number
     * }}
     */
    updateFromData(markerData) {

        // update position
        let pos = markerData.position || {};
        this.position.setX(pos.x || 0);
        this.position.setY(pos.y || 0);
        this.position.setZ(pos.z || 0);

        // update anchor
        let anch = markerData.anchor || markerData.iconAnchor || {}; //"iconAnchor" for backwards compatibility
        this.anchor.setX(anch.x || 0);
        this.anchor.setY(anch.y || 0);

        // update label
        if (this.labelElement.innerHTML !== markerData.label){
            this.labelElement.innerHTML = markerData.label || "";
        }

        // update icon
        if (this._lastIcon !== markerData.icon){
            this.iconElement.src = markerData.icon || "assets/poi.svg";
            this._lastIcon = markerData.icon;
        }

        // update min/max distances
        this.fadeDistanceMin = markerData.minDistance || 0;
        this.fadeDistanceMax = markerData.maxDistance !== undefined ? markerData.maxDistance : Number.MAX_VALUE;

    }


}