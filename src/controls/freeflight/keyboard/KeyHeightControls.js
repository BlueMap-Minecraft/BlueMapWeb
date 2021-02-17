import {MathUtils} from "three";
import {KeyCombination} from "../../KeyCombination";

export class KeyHeightControls {

    static KEYS = {
        UP: [
            new KeyCombination("Space"),
            new KeyCombination("PageUp")
        ],
        DOWN: [
            new KeyCombination("ShiftLeft"),
            new KeyCombination("PageDown")
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

        this.deltaY = 0;

        this.up = false;
        this.down = false;

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
        if (this.up) this.deltaY += 1;
        if (this.down) this.deltaY -= 1;

        if (this.deltaY === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.position.y += this.deltaY * smoothing * this.speed * delta * 0.06;

        this.deltaY *= 1 - smoothing;
        if (Math.abs(this.deltaY) < 0.0001) {
            this.deltaY = 0;
        }
    }

    /**
     * @param evt {KeyboardEvent}
     */
    onKeyDown = evt => {
        if (KeyCombination.oneUp(evt, ...KeyHeightControls.KEYS.UP)){
            this.up = true;
            evt.preventDefault();
        }
        else if (KeyCombination.oneUp(evt, ...KeyHeightControls.KEYS.DOWN)){
            this.down = true;
            evt.preventDefault();
        }
    }

    /**
     * @param evt {KeyboardEvent}
     */
    onKeyUp = evt => {
        if (KeyCombination.oneUp(evt, ...KeyHeightControls.KEYS.UP)){
            this.up = false;
        }
        if (KeyCombination.oneUp(evt, ...KeyHeightControls.KEYS.DOWN)){
            this.down = false;
        }
    }

}