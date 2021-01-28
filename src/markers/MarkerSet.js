import {Object3D} from "three";

export class MarkerSet extends Object3D {

    /**
     * @param markerSetId {string}
     */
    constructor(markerSetId) {
        super();
        Object.defineProperty(this, 'isMarkerSet', {value: true});

        this.markerSetId = markerSetId;
        this.label = markerSetId;

        this.toggleable = true;
        this.defaultHide = false;
    }

    dispose() {
        super.dispose();

        this.children.forEach(child => {
            if (child.dispose) child.dispose();
        });
    }

}