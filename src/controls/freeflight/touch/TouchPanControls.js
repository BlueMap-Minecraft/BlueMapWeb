import {MathUtils, Vector2} from "three";

export class TouchPanControls {

    static tempVec2_1 = new Vector2();

    /**
     * @param hammer {Hammer.Manager}
     * @param speed {number}
     * @param stiffness {number}
     */
    constructor(hammer, speed, stiffness) {
        this.hammer = hammer;
        this.manager = null;

        this.moving = false;
        this.lastPosition = new Vector2();
        this.deltaPosition = new Vector2();

        this.speed = speed;
        this.stiffness = stiffness;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;

        this.hammer.on("movestart", this.onTouchDown);
        this.hammer.on("movemove", this.onTouchMove);
        this.hammer.on("moveend", this.onTouchUp);
        this.hammer.on("movecancel", this.onTouchUp);
    }

    stop() {
        this.hammer.off("movestart", this.onTouchDown);
        this.hammer.off("movemove", this.onTouchMove);
        this.hammer.off("moveend", this.onTouchUp);
        this.hammer.off("movecancel", this.onTouchUp);
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.deltaPosition.x === 0 && this.deltaPosition.y === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.rotation += this.deltaPosition.x * this.speed * this.stiffness;
        this.manager.angle -= this.deltaPosition.y * this.speed * this.stiffness;

        this.deltaPosition.multiplyScalar(1 - smoothing);
        if (this.deltaPosition.lengthSq() < 0.0001) {
            this.deltaPosition.set(0, 0);
        }
    }

    reset() {
        this.deltaPosition.set(0, 0);
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchDown = evt => {
        if (evt.pointerType === "mouse") return;

        this.moving = true;
        this.deltaPosition.set(0, 0);
        this.lastPosition.set(evt.center.x, evt.center.y);
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchMove = evt => {
        if (evt.pointerType === "mouse") return;

        let position = TouchPanControls.tempVec2_1.set(evt.center.x, evt.center.y);

        if(this.moving){
            this.deltaPosition.sub(position).add(this.lastPosition);
        }

        this.lastPosition.copy(position);
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchUp = evt => {
        if (evt.pointerType === "mouse") return;

        this.moving = false;
    }

}