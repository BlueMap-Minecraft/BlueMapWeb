import {MathUtils} from "three";

export class TouchAngleControls {

    /**
     * @param hammer {Hammer.Manager}
     * @param speed {number}
     * @param stiffness {number}
     */
    constructor(hammer, speed, stiffness) {
        this.hammer = hammer;
        this.manager = null;

        this.moving = false;
        this.lastY = 0;
        this.deltaAngle = 0;

        this.speed = speed;
        this.stiffness = stiffness;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;

        this.hammer.on("tiltstart", this.onTouchDown);
        this.hammer.on("tiltmove", this.onTouchMove);
        this.hammer.on("tiltend", this.onTouchUp);
        this.hammer.on("tiltcancel", this.onTouchUp);
    }

    stop() {
        this.hammer.off("tiltstart", this.onTouchDown);
        this.hammer.off("tiltmove", this.onTouchMove);
        this.hammer.off("tiltend", this.onTouchUp);
        this.hammer.off("tiltcancel", this.onTouchUp);
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.deltaAngle === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.angle += this.deltaAngle * smoothing * this.speed;

        this.deltaAngle *= 1 - smoothing;
        if (Math.abs(this.deltaAngle) < 0.0001) {
            this.deltaAngle = 0;
        }
    }

    reset() {
        this.deltaAngle = 0;
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchDown = evt => {
        this.moving = true;
        this.deltaAngle = 0;
        this.lastY = evt.center.y;
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchMove = evt => {
        if(this.moving){
            this.deltaAngle -= evt.center.y - this.lastY;
        }

        this.lastY = evt.center.y;
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchUp = evt => {
        this.moving = false;
    }

}