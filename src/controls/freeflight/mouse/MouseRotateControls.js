import {MathUtils} from "three";

export class MouseRotateControls {

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
        this.lastX = 0;
        this.deltaRotation = 0;

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
        if (this.deltaRotation === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.rotation += this.deltaRotation * smoothing;

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
     * @param evt {MouseEvent}
     */
    onMouseDown = evt => {
        this.moving = true;
        this.deltaRotation = 0;
        this.lastX = evt.x;
    }

    /**
     * @private
     * @param evt {MouseEvent}
     */
    onMouseMove = evt => {
        if (document.pointerLockElement) {
            this.deltaRotation -= evt.movementX * this.speedCapture;
        }

        else if(this.moving){
            if (evt.buttons === 1) {
                this.deltaRotation -= (evt.x - this.lastX) * this.speedLeft;
            } else {
                this.deltaRotation -= (evt.x - this.lastX) * this.speedRight;
            }
        }

        this.lastX = evt.x;
    }

    /**
     * @private
     * @param evt {MouseEvent}
     */
    onMouseUp = evt => {
        this.moving = false;
    }

}