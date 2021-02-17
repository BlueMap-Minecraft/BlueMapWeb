import {MathUtils} from "three";
import {KeyCombination} from "../../KeyCombination";

export class KeyZoomControls {

    static KEYS = {
        IN: [
            new KeyCombination("NumpadAdd"),
        ],
        OUT: [
            new KeyCombination("NumpadSubtract"),
        ],
    }

    /**
     * @param target {EventTarget}
     * @param speed {number}
     * @param stiffness {number}
     */
    constructor(target, speed, stiffness) {
        this.target = target;
        this.manager = null;

        this.deltaZoom = 0;

        this.in = false;
        this.out = false;

        this.speed = speed;
        this.stiffness = stiffness;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;

        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    stop() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.in) this.deltaZoom += 1;
        if (this.out) this.deltaZoom -= 1;

        if (this.deltaZoom === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.distance *= Math.pow(1.5, this.deltaZoom * smoothing * this.speed * delta * 0.06);

        this.deltaZoom *= 1 - smoothing;
        if (Math.abs(this.deltaZoom) < 0.0001) {
            this.deltaZoom = 0;
        }
    }

    /**
     * @param evt {KeyboardEvent}
     */
    onKeyDown = evt => {
        if (KeyCombination.oneDown(evt, ...KeyZoomControls.KEYS.IN)){
            this.in = true;
            evt.preventDefault();
        }
        if (KeyCombination.oneDown(evt, ...KeyZoomControls.KEYS.OUT)){
            this.out = true;
            evt.preventDefault();
        }
    }

    /**
     * @param evt {KeyboardEvent}
     */
    onKeyUp = evt => {
        if (KeyCombination.oneUp(evt, ...KeyZoomControls.KEYS.IN)){
            this.in = false;
        }
        if (KeyCombination.oneUp(evt, ...KeyZoomControls.KEYS.OUT)){
            this.out = false;
        }
    }

}