import {MathUtils} from "three";

export class TouchZoomControls {

    /**
     * @param hammer {Hammer.Manager}
     */
    constructor(hammer) {
        this.hammer = hammer;
        this.manager = null;

        this.moving = false;
        this.deltaZoom = 1;
        this.lastZoom = 1;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;

        this.hammer.on("zoomstart", this.onTouchDown);
        this.hammer.on("zoommove", this.onTouchMove);
        this.hammer.on("zoomend", this.onTouchUp);
        this.hammer.on("zoomcancel", this.onTouchUp);
    }

    stop() {
        this.hammer.off("zoomstart", this.onTouchDown);
        this.hammer.off("zoommove", this.onTouchMove);
        this.hammer.off("zoomend", this.onTouchUp);
        this.hammer.off("zoomcancel", this.onTouchUp);
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.deltaZoom === 1) return;

        this.manager.distance /= this.deltaZoom;
        this.deltaZoom = 1;
    }

    reset() {
        this.deltaZoom = 1;
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchDown = evt => {
        this.moving = true;
        this.lastZoom = 1;
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchMove = evt => {
        if(this.moving){
            this.deltaZoom *= evt.scale / this.lastZoom;
        }

        this.lastZoom = evt.scale;
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchUp = evt => {
        this.moving = false;
    }

}