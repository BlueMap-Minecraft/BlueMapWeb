import {MathUtils} from "three";

export class MouseAngleControls {

    /**
     * @param target {EventTarget}
     * @param speedLeft {number}
     * @param speedRight {number}
     * @param speedCapture {number}
     * @param stiffness {number}
     */
    constructor(target, speedLeft, speedRight, speedCapture, stiffness) {
        this.target = target;
        this.manager = null;

        this.moving = false;
        this.lastY = 0;
        this.deltaAngle = 0;

        this.speedLeft = speedLeft;
        this.speedRight = speedRight;
        this.speedCapture = speedCapture;
        this.stiffness = stiffness;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;

        this.target.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
    }

    stop() {
        this.target.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.deltaAngle === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.angle += this.deltaAngle * smoothing;

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
     * @param evt {MouseEvent}
     */
    onMouseDown = evt => {
        this.moving = true;
        this.deltaAngle = 0;
        this.lastY = evt.y;
    }

    /**
     * @private
     * @param evt {MouseEvent}
     */
    onMouseMove = evt => {
        if (document.pointerLockElement) {
            this.deltaAngle += evt.movementY * this.speedCapture;
        }

        else if(this.moving){
            if (evt.buttons === 1) {
                this.deltaAngle += (evt.y - this.lastY) * this.speedLeft;
            } else {
                this.deltaAngle += (evt.y - this.lastY) * this.speedRight;
            }
        }

        this.lastY = evt.y;
    }

    /**
     * @private
     * @param evt {MouseEvent}
     */
    onMouseUp = evt => {
        this.moving = false;
    }

}