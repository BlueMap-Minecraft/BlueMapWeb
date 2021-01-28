import {MathUtils, Vector3} from "three";
import {dispatchEvent} from "../util/Utils";
import {Map} from "../map/Map";

export class ControlsManager {

	/**
	 * @param mapViewer {MapViewer}
	 * @param camera {THREE.Camera}
	 */
	constructor(mapViewer, camera) {
		Object.defineProperty( this, 'isControlsManager', { value: true } );

		this.mapViewer = mapViewer;
		this.camera = camera;

		this.positionValue = new Vector3(0, 0, 0);

		this.rotationValue = 0;
		this.angleValue = 0;

		this.distanceValue = 500;

		this.orthoValue = 0;

		this.valueChanged = true;
		this.lastMapUpdatePosition = this.positionValue.clone();

		this.controlsValue = null;

		this.updateCamera();
	}

	/**
	 * @param deltaTime {number}
	 * @param map {Map}
	 */
	update(deltaTime, map) {
		if (deltaTime > 50) deltaTime = 50; // assume min 20 UPS

		if (this.controlsValue && typeof this.controlsValue.update === "function")
			this.controlsValue.update(deltaTime, map);
	}

	updateCamera() {
		if (this.valueChanged) {
			// prevent problems with the rotation when the angle is 0 (top-down) or distance is 0 (first-person)
			let rotatableAngle = this.angleValue;
			if (Math.abs(rotatableAngle) <= 0.0001) rotatableAngle = 0.0001;
			let rotatableDistance = this.distanceValue;
			if (Math.abs(rotatableDistance) <= 0.0001) rotatableDistance = -0.0001;

			// fix distance for ortho-effect
			if (this.orthoValue > 0) {
				rotatableDistance = MathUtils.lerp(rotatableDistance, Math.max(rotatableDistance, 300), Math.pow(this.orthoValue, 8));
			}

			// calculate rotationVector
			let rotationVector = new Vector3(Math.sin(this.rotationValue), 0, -Math.cos(this.rotationValue)); // 0 is towards north
			let angleRotationAxis = new Vector3(0, 1, 0).cross(rotationVector);
			rotationVector.applyAxisAngle(angleRotationAxis, (Math.PI / 2) - rotatableAngle);
			rotationVector.multiplyScalar(rotatableDistance);

			// position camera
			this.camera.position.copy(this.positionValue).sub(rotationVector);
			this.camera.lookAt(this.positionValue);

			// update ortho
			this.camera.distance = this.distanceValue;
			this.camera.ortho = this.orthoValue;

			// optimize far/near planes
			if (this.orthoValue <= 0) {
				let near = MathUtils.clamp(this.distanceValue / 1000, 0.01, 1);
				let far = MathUtils.clamp(this.distanceValue * 2, Math.max(near + 1, 2000), this.distanceValue + 5000);
				if (far - near > 10000) near = far - 10000;
				this.camera.near = near;
				this.camera.far = far;
			} else {
				this.camera.near = 1;
				this.camera.far = rotatableDistance + 300;
			}

			// event
			dispatchEvent(this.mapViewer.events, "bluemapCameraMoved", {
				controlsManager: this,
				camera: this.camera
			});
		}

		// if the position changed, update map to show new position
		if (this.mapViewer.map) {
			let triggerDistance = 1;
			if (this.valueChanged) {
				triggerDistance = this.mapViewer.loadedHiresViewDistance * 0.8;
			}
			if (
				Math.abs(this.lastMapUpdatePosition.x - this.positionValue.x) >= triggerDistance ||
				Math.abs(this.lastMapUpdatePosition.z - this.positionValue.z) >= triggerDistance
			) {
				this.lastMapUpdatePosition = this.positionValue.clone();
				this.mapViewer.loadMapArea(this.positionValue.x, this.positionValue.z);
			}
		}

		this.valueChanged = false;
	}

	handleValueChange() {
		this.valueChanged = true;
	}

	/**
	 * @returns {number}
	 */
	get x() {
		return this.positionValue.x;
	}

	/**
	 * @param x {number}
	 */
	set x(x) {
		this.positionValue.x = x;
		this.handleValueChange();
	}

	/**
	 * @returns {number}
	 */
	get y() {
		return this.positionValue.y;
	}

	/**
	 * @param y {number}
	 */
	set y(y) {
		this.positionValue.y = y;
		this.handleValueChange();
	}

	/**
	 * @returns {number}
	 */
	get z() {
		return this.positionValue.z;
	}

	/**
	 * @param z {number}
	 */
	set z(z) {
		this.positionValue.z = z;
		this.handleValueChange();
	}

	/**
	 * @returns {Vector3}
	 */
	get position() {
		return this.positionValue;
	}

	/**
	 * @param position {Vector3}
	 */
	set position(position) {
		this.position.copy(position);
		this.handleValueChange();
	}

	/**
	 * @returns {number}
	 */
	get rotation() {
		return this.rotationValue;
	}

	/**
	 * @param rotation {number}
	 */
	set rotation(rotation) {
		this.rotationValue = rotation;
		this.handleValueChange();
	}

	/**
	 * @returns {number}
	 */
	get angle() {
		return this.angleValue;
	}

	/**
	 * @param angle {number}
	 */
	set angle(angle) {
		this.angleValue = angle;
		this.handleValueChange();
	}

	/**
	 * @returns {number}
	 */
	get distance() {
		return this.distanceValue;
	}

	/**
	 * @param distance {number}
	 */
	set distance(distance) {
		this.distanceValue = distance;
		this.handleValueChange();
	}

	/**
	 * @returns {number}
	 */
	get ortho() {
		return this.orthoValue;
	}

	/**
	 * @param ortho {number}
	 */
	set ortho(ortho) {
		this.orthoValue = ortho;
		this.handleValueChange();
	}

	/**
	 * @param controls {{
	 * 		start: function(controls: ControlsManager),
	 * 		stop: function(),
	 * 		update: function(deltaTime: number, map: Map)
	 * 	}}
	 */
	set controls(controls) {
		if (this.controlsValue && typeof this.controlsValue.stop === "function")
			this.controlsValue.stop();

		this.controlsValue = controls;

		if (this.controlsValue && typeof this.controlsValue.start === "function")
			this.controlsValue.start(this);
	}

	/**
	 * @returns {{
	 * 		start: function(controls: ControlsManager),
	 * 		stop: function(),
	 * 		update: function(deltaTime: number, map: Map)
	 * 	}}
	 */
	get controls() {
		return this.controlsValue;
	}

}