import {MathUtils} from "three";
import {KeyCombination} from "../../KeyCombination";

export class KeyAngleControls {

    static KEYS = {
        UP: [
            new KeyCombination("ArrowUp", KeyCombination.ALT),
            new KeyCombination("KeyW", KeyCombination.ALT),
            new KeyCombination("PageUp")
        ],
        DOWN: [
            new KeyCombination("ArrowDown", KeyCombination.ALT),
            new KeyCombination("KeyS", KeyCombination.ALT),
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

        this.deltaAngle = 0;

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
        if (this.up) this.deltaAngle -= 1;
        if (this.down) this.deltaAngle += 1;

        if (this.deltaAngle === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.angle += this.deltaAngle * smoothing * this.speed * delta * 0.06;

        this.deltaAngle *= 1 - smoothing;
        if (Math.abs(this.deltaAngle) < 0.0001) {
            this.deltaAngle = 0;
        }
    }

    /**
     * @param evt {KeyboardEvent}
     */
    onKeyDown = evt => {
        if (KeyCombination.oneDown(evt, ...KeyAngleControls.KEYS.UP)){
            this.up = true;
            evt.preventDefault();
        }
        if (KeyCombination.oneDown(evt, ...KeyAngleControls.KEYS.DOWN)){
            this.down = true;
            evt.preventDefault();
        }
    }

    /**
     * @param evt {KeyboardEvent}
     */
    onKeyUp = evt => {
        if (KeyCombination.oneUp(evt, ...KeyAngleControls.KEYS.UP)){
            this.up = false;
        }
        if (KeyCombination.oneUp(evt, ...KeyAngleControls.KEYS.DOWN)){
            this.down = false;
        }
    }

}