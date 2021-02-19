import {MathUtils, Vector2} from "three";
import {animate, EasingFunctions, softMin} from "../../util/Utils";
import {KeyMoveControls} from "./keyboard/KeyMoveControls";
import {MouseRotateControls} from "./mouse/MouseRotateControls";
import {MouseAngleControls} from "./mouse/MouseAngleControls";
import {KeyHeightControls} from "./keyboard/KeyHeightControls";
import {TouchPanControls} from "./touch/TouchPanControls";

export class FreeFlightControls {

    /**
     * @param target {Element}
     */
    constructor(target) {
        this.target = target;
        this.manager = null;

        this.hammer = new Hammer.Manager(this.target);
        this.initializeHammer();

        this.keyMove = new KeyMoveControls(this.target, 0.5, 0.1);
        this.keyHeight = new KeyHeightControls(this.target, 0.5, 0.2);
        this.mouseRotate = new MouseRotateControls(this.target, 0.002, -0.003, -0.002, 0.5);
        this.mouseAngle = new MouseAngleControls(this.target, 0.002, -0.003, -0.002, 0.5);
        this.touchPan = new TouchPanControls(this.hammer, 0.005, 0.15);

        this.started = false;

        this.clickStart = new Vector2();
        this.moveSpeed = 0.5;

        this.animationTargetHeight = 0;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;

        this.keyMove.start(manager);
        this.keyHeight.start(manager);
        this.mouseRotate.start(manager);
        this.mouseAngle.start(manager);
        this.touchPan.start(manager);

        this.target.addEventListener("contextmenu", this.onContextMenu);
        this.target.addEventListener("mousedown", this.onMouseDown);
        this.target.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("wheel", this.onWheel, {passive: true});

        let startOrtho = this.manager.ortho;
        let startDistance = this.manager.distance;
        let startAngle = this.manager.angle;
        let startY = this.manager.position.y;

        let targetAngle = Math.PI / 2;

        animate(progress => {
            let smoothProgress = EasingFunctions.easeInOutQuad(progress);

            this.manager.ortho = MathUtils.lerp(startOrtho, 0, progress);
            this.manager.distance = MathUtils.lerp(startDistance, 0, smoothProgress);
            this.manager.angle = MathUtils.lerp(startAngle, targetAngle, smoothProgress);
            this.manager.position.y = MathUtils.lerp(startY, this.animationTargetHeight, smoothProgress);
        }, 500, () => {
            this.started = true;
        });
    }

    stop() {
        this.keyMove.stop();
        this.keyHeight.stop();
        this.mouseRotate.stop();
        this.mouseAngle.stop();
        this.touchPan.stop();

        this.target.removeEventListener("contextmenu", this.onContextMenu);
        this.target.removeEventListener("mousedown", this.onMouseDown);
        this.target.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("wheel", this.onWheel);

        this.started = false;
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (!this.started) {
            this.animationTargetHeight = map.terrainHeightAt(this.manager.position.x, this.manager.position.z) + 10;
            return;
        }

        this.keyMove.update(delta, map);
        this.keyHeight.update(delta, map);
        this.mouseRotate.update(delta, map);
        this.mouseAngle.update(delta, map);
        this.touchPan.update(delta, map);

        this.manager.angle = MathUtils.clamp(this.manager.angle, 0, Math.PI);
    }

    initializeHammer() {
        let touchMove = new Hammer.Pan({ event: 'move', pointers: 1, direction: Hammer.DIRECTION_ALL, threshold: 0 });
        this.hammer.add(touchMove);
    }

    onContextMenu = evt => {
        evt.preventDefault();
    }

    onMouseDown = evt => {
        this.clickStart.set(evt.x, evt.y);
    }

    onMouseUp = evt => {
        if (this.clickStart.x !== evt.x) return;
        if (this.clickStart.y !== evt.y) return;

        this.target.requestPointerLock();
    }

    onWheel = evt => {
        let delta = evt.deltaY;
        if (evt.deltaMode === WheelEvent.DOM_DELTA_PIXEL) delta *= 0.01;
        if (evt.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 0.33;

        this.moveSpeed *= Math.pow(1.5, -delta * 0.25);
        this.moveSpeed = MathUtils.clamp(this.moveSpeed, 0.05, 5);

        this.keyMove.speed = this.moveSpeed;
        this.keyHeight.speed = this.moveSpeed;
    }

}