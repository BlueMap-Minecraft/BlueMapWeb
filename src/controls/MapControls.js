import {MathUtils, MOUSE, Vector2, Vector3} from "three";
import {alert} from "../util/Utils";

export class MapControls {

    static STATES = {
        NONE: 0,
        MOVE: 1,
        ORBIT: 2
    };

    static KEYS = {
        LEFT: ["ArrowLeft", "a", "A", 37, 65],
        UP: ["ArrowUp", "w", "W", 38, 87],
        RIGHT: ["ArrowRight", "d", "D", 39, 68],
        DOWN: ["ArrowDown", "s", "S", 40, 83],
        ZOOM_IN: ["+"],
        ZOOM_OUT: ["-"]
    };

    static BUTTONS = {
        ORBIT: [MOUSE.RIGHT],
        MOVE: [MOUSE.LEFT]
    };

    static VECTOR2_ZERO = new Vector2(0, 0);

    /**
     * @param rootElement {Element}
     * @param hammerLib {Hammer.Manager}
     * @param events {EventTarget}
     */
    constructor(rootElement, hammerLib, events = null) {
        Object.defineProperty( this, 'isMapControls', { value: true } );

        this.rootElement = rootElement;
        this.hammer = hammerLib;
        this.events = events;

        /** @type {ControlsManager} */
        this.controls = null;

        this.targetPosition = new Vector3();
        this.positionTerrainHeight = false;

        this.targetDistance = 400;
        this.minDistance = 10;
        this.maxDistance = 10000;

        this.targetRotation = 0;

        this.targetAngle = 0;
        this.minAngle = 0;
        this.maxAngle = Math.PI / 2;
        this.maxAngleForZoom = this.maxAngle;

        this.state = MapControls.STATES.NONE;
        this.mouse = new Vector2();
        this.lastMouse = new Vector2();
        this.keyStates = {};
        this.touchStart = new Vector2();
        this.touchTiltStart = 0;
        this.lastTouchRotation = 0;
        this.touchZoomStart = 0;

    }

    /**
     * @param controls {ControlsManager}
     */
    start(controls) {
        this.controls = controls;

        this.targetPosition.copy(this.controls.position);
        this.positionTerrainHeight = false;

        this.targetDistance = this.controls.distance;
        this.targetDistance = MathUtils.clamp(this.targetDistance, this.minDistance, this.maxDistance);

        this.targetRotation = this.controls.rotation;

        this.targetAngle = this.controls.angle;

        this.updateZoom();

        // add events
        this.rootElement.addEventListener("wheel", this.onWheel, {passive: true})
        this.hammer.on('zoomstart', this.onTouchZoomDown);
        this.hammer.on('zoommove', this.onTouchZoomMove);
        this.rootElement.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        this.hammer.on('movestart', this.onTouchDown);
        this.hammer.on('movemove', this.onTouchMove);
        this.hammer.on('moveend', this.onTouchUp);
        this.hammer.on('movecancel', this.onTouchUp);
        this.hammer.on('tiltstart', this.onTouchTiltDown);
        this.hammer.on('tiltmove', this.onTouchTiltMove);
        this.hammer.on('tiltend', this.onTouchTiltUp);
        this.hammer.on('tiltcancel', this.onTouchTiltUp);
        this.hammer.on('rotatestart', this.onTouchRotateDown);
        this.hammer.on('rotatemove', this.onTouchRotateMove);
        this.hammer.on('rotateend', this.onTouchRotateUp);
        this.hammer.on('rotatecancel', this.onTouchRotateUp);
        window.addEventListener('contextmenu', this.onContextMenu);
    }

    stop() {
        // remove events
        this.rootElement.removeEventListener("wheel", this.onWheel)
        this.hammer.off('zoomstart', this.onTouchZoomDown);
        this.hammer.off('zoommove', this.onTouchZoomMove);
        this.rootElement.addEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.hammer.on('movestart', this.onTouchDown);
        this.hammer.off('movemove', this.onTouchMove);
        this.hammer.off('moveend', this.onTouchUp);
        this.hammer.off('movecancel', this.onTouchUp);
        this.hammer.off('tiltstart', this.onTouchTiltDown);
        this.hammer.off('tiltmove', this.onTouchTiltMove);
        this.hammer.off('tiltend', this.onTouchTiltUp);
        this.hammer.off('tiltcancel', this.onTouchTiltUp);
        this.hammer.off('rotatestart', this.onTouchRotateDown);
        this.hammer.off('rotatemove', this.onTouchRotateMove);
        this.hammer.off('rotateend', this.onTouchRotateUp);
        this.hammer.off('rotatecancel', this.onTouchRotateUp);
        window.removeEventListener('contextmenu', this.onContextMenu);
    }

    /**
     * @param deltaTime {number}
     * @param map {Map}
     */
    update(deltaTime, map) {
        // == process mouse movements ==
        let deltaMouse = this.lastMouse.clone().sub(this.mouse);
        let moveDelta = new Vector2();

        // zoom keys
        if (this.keyStates.ZOOM_IN) {
            this.targetDistance *= 1 - 0.003 * deltaTime;
            this.updateZoom();
        }
        if (this.keyStates.ZOOM_OUT){
            this.targetDistance *= 1 + 0.003 * deltaTime;
            this.updateZoom();
        }

        // move
        if (this.state === MapControls.STATES.MOVE) {
            moveDelta.copy(deltaMouse);
        } else {
            if (this.keyStates.UP) moveDelta.y -= 20;
            if (this.keyStates.DOWN) moveDelta.y += 20;
            if (this.keyStates.LEFT) moveDelta.x -= 20;
            if (this.keyStates.RIGHT) moveDelta.x += 20;
        }

        if (moveDelta.x !== 0 || moveDelta.y !== 0) {
            moveDelta.rotateAround(MapControls.VECTOR2_ZERO, this.controls.rotation);
            this.targetPosition.set(
                this.targetPosition.x + (moveDelta.x * this.targetDistance / this.rootElement.clientHeight * 1.5),
                this.targetPosition.y,
                this.targetPosition.z + (moveDelta.y * this.targetDistance / this.rootElement.clientHeight * 1.5)
            );
        }

        this.updatePositionTerrainHeight(map);

        // tilt/pan
        if (this.state === MapControls.STATES.ORBIT) {
            if (deltaMouse.x !== 0) {
                this.targetRotation -= (deltaMouse.x / this.rootElement.clientHeight * Math.PI);
                this.wrapRotation();
            }

            if (deltaMouse.y !== 0) {
                this.targetAngle += (deltaMouse.y / this.rootElement.clientHeight * Math.PI);
                this.targetAngle = MathUtils.clamp(this.targetAngle, this.minAngle, this.maxAngleForZoom + 0.1);
            }
        }
        if (this.targetAngle > this.maxAngleForZoom) this.targetAngle -= (this.targetAngle - this.maxAngleForZoom) * 0.3;

        // == Smoothly apply target values ==
        let somethingChanged = false;

        // move
        let deltaPosition = this.targetPosition.clone().sub(this.controls.position);
        if (Math.abs(deltaPosition.x) > 0.01 || Math.abs(deltaPosition.y) > 0.001 || Math.abs(deltaPosition.z) > 0.01) {
            this.controls.position = this.controls.position.add(deltaPosition.multiplyScalar(0.015 * deltaTime));
            somethingChanged = true;
        }

        // rotation
        let deltaRotation = this.targetRotation - this.controls.rotation;
        if (Math.abs(deltaRotation) > 0.0001) {
            this.controls.rotation += deltaRotation * 0.015 * deltaTime;
            somethingChanged = true;
        }

        // angle
        let deltaAngle = this.targetAngle - this.controls.angle;
        if (Math.abs(deltaAngle) > 0.0001) {
            this.controls.angle += deltaAngle * 0.015 * deltaTime;
            somethingChanged = true;
        }

        // zoom
        let deltaDistance = this.targetDistance - this.controls.distance
        if (Math.abs(deltaDistance) > 0.001) {
            this.controls.distance += deltaDistance * 0.01 * deltaTime;
            somethingChanged = true;
        }

        // == Adjust camera height to terrain ==
        if (somethingChanged) {
            let y = 0;
            if (this.positionTerrainHeight !== false) {
                y = this.targetPosition.y;
                let deltaY = this.positionTerrainHeight - y;
                if (Math.abs(deltaY) > 0.001) {
                    y += deltaY * 0.01 * deltaTime;
                }
            }
            let minCameraHeight = map.terrainHeightAt(this.controls.camera.position.x, this.controls.camera.position.z) + ((this.minDistance - this.targetDistance) * 0.4) + 1;
            if (minCameraHeight > y) y = minCameraHeight;
            this.targetPosition.y = y;
        }

        // == Fix NaN's as a fail-safe ==
        if (isNaN(this.targetPosition.x)){
            alert(this.events, `Invalid targetPosition x: ${this.targetPosition.x}`, "warning");
            this.targetPosition.x = 0;
        }
        if (isNaN(this.targetPosition.y)){
            alert(this.events, `Invalid targetPosition y: ${this.targetPosition.y}`, "warning");
            this.targetPosition.y = 0;
        }
        if (isNaN(this.targetPosition.z)){
            alert(this.events, `Invalid targetPosition z: ${this.targetPosition.z}`, "warning");
            this.targetPosition.z = 0;
        }
        if (isNaN(this.targetDistance)){
            alert(this.events, `Invalid targetDistance: ${this.targetDistance}`, "warning");
            this.targetDistance = this.minDistance;
        }
        if (isNaN(this.targetRotation)){
            alert(this.events, `Invalid targetRotation: ${this.targetRotation}`, "warning");
            this.targetRotation = 0;
        }
        if (isNaN(this.targetAngle)){
            alert(this.events, `Invalid targetAngle: ${this.targetAngle}`, "warning");
            this.targetAngle = this.minAngle;
        }

        // == Remember last processed state ==
        this.lastMouse.copy(this.mouse);
    }

    updateZoom() {
        this.targetDistance = MathUtils.clamp(this.targetDistance, this.minDistance, this.maxDistance);
        this.updateMaxAngleForZoom();
        this.targetAngle = MathUtils.clamp(this.targetAngle, this.minAngle, this.maxAngleForZoom);
    }

    updateMaxAngleForZoom() {
        this.maxAngleForZoom =
            MathUtils.clamp(
                (1 - Math.pow((this.targetDistance - this.minDistance) / (500 - this.minDistance), 0.5)) * this.maxAngle,
                this.minAngle,
                this.maxAngle
            );
    }

    updatePositionTerrainHeight(map) {
        this.positionTerrainHeight = map.terrainHeightAt(this.targetPosition.x, this.targetPosition.z);
    }

    wrapRotation() {
        while (this.targetRotation >= Math.PI) {
            this.targetRotation -= Math.PI * 2;
            this.controls.rotation -= Math.PI * 2;
        }
        while (this.targetRotation <= -Math.PI) {
            this.targetRotation += Math.PI * 2;
            this.controls.rotation += Math.PI * 2;
        }
    }

    onKeyDown = evt => {
        let key = evt.key || evt.keyCode;
        for (let action in MapControls.KEYS){
            if (!MapControls.KEYS.hasOwnProperty(action)) continue;
            if (MapControls.KEYS[action].includes(key)){
                this.keyStates[action] = true;
            }
        }
    };

    onKeyUp = evt => {
        let key = evt.key || evt.keyCode;
        for (let action in MapControls.KEYS){
            if (!MapControls.KEYS.hasOwnProperty(action)) continue;
            if (MapControls.KEYS[action].includes(key)){
                this.keyStates[action] = false;
            }
        }
    };

    onWheel = evt => {
        let delta = evt.deltaY;
        if (evt.deltaMode === WheelEvent.DOM_DELTA_PIXEL) delta *= 0.01;
        if (evt.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 0.33;

        this.targetDistance *= Math.pow(1.5, delta);
        this.updateZoom();
    }

    onMouseDown = evt => {
        if (this.state !== MapControls.STATES.NONE) return;

        if (MapControls.BUTTONS.MOVE.includes(evt.button)) {
            this.state = MapControls.STATES.MOVE;
            evt.preventDefault();
        }
        if (MapControls.BUTTONS.ORBIT.includes(evt.button)) {
            this.state = MapControls.STATES.ORBIT;
            evt.preventDefault();
        }
    };

    onMouseMove = evt => {
        this.mouse.set(evt.clientX, evt.clientY);

        if (this.state !== MapControls.STATES.NONE){
            evt.preventDefault();
        }
    };

    onMouseUp = evt => {
        if (this.state === MapControls.STATES.NONE) return;

        if (MapControls.BUTTONS.MOVE.includes(evt.button)) {
            if (this.state === MapControls.STATES.MOVE) this.state = MapControls.STATES.NONE;
            evt.preventDefault();
        }
        if (MapControls.BUTTONS.ORBIT.includes(evt.button)) {
            if (this.state === MapControls.STATES.ORBIT) this.state = MapControls.STATES.NONE;
            evt.preventDefault();
        }
    };

    onTouchDown = evt => {
        if (evt.pointerType === "mouse") return;

        this.touchStart.set(this.targetPosition.x, this.targetPosition.z);
        this.state = MapControls.STATES.MOVE;
    };

    onTouchMove = evt => {
        if (evt.pointerType === "mouse") return;
        if (this.state !== MapControls.STATES.MOVE) return;

        let touchDelta = new Vector2(evt.deltaX, evt.deltaY);

        if (touchDelta.x !== 0 || touchDelta.y !== 0) {
            touchDelta.rotateAround(MapControls.VECTOR2_ZERO, this.controls.rotation);

            this.targetPosition.x = this.touchStart.x - (touchDelta.x * this.targetDistance / this.rootElement.clientHeight * 1.5);
            this.targetPosition.z = this.touchStart.y - (touchDelta.y * this.targetDistance / this.rootElement.clientHeight * 1.5);
        }
    };

    onTouchUp = evt => {
        if (evt.pointerType === "mouse") return;

        this.state = MapControls.STATES.NONE;
    };

    onTouchTiltDown = () => {
        this.touchTiltStart = this.targetAngle;
        this.state = MapControls.STATES.ORBIT;
    };

    onTouchTiltMove = evt => {
        if (this.state !== MapControls.STATES.ORBIT) return;

        this.targetAngle = this.touchTiltStart - (evt.deltaY / this.rootElement.clientHeight * Math.PI);
        this.targetAngle = MathUtils.clamp(this.targetAngle, this.minAngle, this.maxAngleForZoom + 0.1);
    };

    onTouchTiltUp = () => {
        this.state = MapControls.STATES.NONE;
    };

    onTouchRotateDown = evt => {
        this.lastTouchRotation = evt.rotation;
        this.state = MapControls.STATES.ORBIT;
    };

    onTouchRotateMove = evt => {
        if (this.state !== MapControls.STATES.ORBIT) return;

        let delta = evt.rotation - this.lastTouchRotation;
        this.lastTouchRotation = evt.rotation;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        this.targetRotation -= (delta * (Math.PI / 180)) * 1.4;
        this.wrapRotation();
    };

    onTouchRotateUp = () => {
        this.state = MapControls.STATES.NONE;
    };

    onTouchZoomDown = () => {
        this.touchZoomStart = this.targetDistance;
    };

    onTouchZoomMove = evt => {
        this.targetDistance = this.touchZoomStart / evt.scale;
        this.updateZoom();
    };
    
    onContextMenu = evt => {
        evt.preventDefault();
    }

}