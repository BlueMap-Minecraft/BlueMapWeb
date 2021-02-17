import {MathUtils} from "three";

export class TouchRotateControls {

    /**
     * @param hammer {Hammer.Manager}
     * @param speed {number}
     * @param stiffness {number}
     */
    constructor(hammer, speed, stiffness) {
        this.hammer = hammer;
        this.manager = null;

        this.moving = false;
        this.lastRotation = 0;
        this.deltaRotation = 0;

        this.speed = speed;
        this.stiffness = stiffness;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;

        this.hammer.on("rotatestart", this.onTouchDown);
        this.hammer.on("rotatemove", this.onTouchMove);
        this.hammer.on("rotateend", this.onTouchUp);
        this.hammer.on("rotatecancel", this.onTouchUp);
    }

    stop() {
        this.hammer.off("rotatestart", this.onTouchDown);
        this.hammer.off("rotatemove", this.onTouchMove);
        this.hammer.off("rotateend", this.onTouchUp);
        this.hammer.off("rotatecancel", this.onTouchUp);
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.deltaRotation === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.rotation += this.deltaRotation * smoothing * this.speed;

        this.deltaRotation *= 1 - smoothing;
        if (Math.abs(this.deltaRotation) < 0.0001) {
            this.deltaRotation = 0;
        }
    }

    reset() {
        this.deltaRotation = 0;
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchDown = evt => {
        this.moving = true;
        this.deltaRotation = 0;
        this.lastRotation = evt.rotation;
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchMove = evt => {
        if(this.moving){
            let delta = evt.rotation - this.lastRotation;
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;

            this.deltaRotation -= delta;
        }

        this.lastRotation = evt.rotation;
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchUp = evt => {
        this.moving = false;
    }

}