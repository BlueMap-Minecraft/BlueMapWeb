import {MathUtils, Vector3} from "three";
import {dispatchEvent} from "../util/Utils";
import {Map} from "../map/Map";

export class ControlsManager {

	/**
	 * @param mapViewer {MapViewer}
	 * @param camera {CombinedCamera}
	 */
	constructor(mapViewer, camera) {
		Object.defineProperty( this, 'isControlsManager', { value: true } );

		this.mapViewer = mapViewer;
		this.camera = camera;

		this.position = new Vector3(0, 0, 0);
		this.rotation = 0;
		this.angle = 0;
		this.tilt = 0;

		this.lastPosition = this.position.clone();
		this.lastRotation = this.rotation;
		this.lastAngle = this.angle;
		this.lastDistance = this.distance;
		this.lastOrtho = this.ortho;
		this.lastTilt = this.tilt;

		this.lastMapUpdatePosition = this.position.clone();

		this.averageDeltaTime = 16;

		this._controls = null;

		// start
		this.distance = 300;
		this.position.set(0, 0, 0);
		this.rotation = 0;
		this.angle = 0;
		this.tilt = 0;
		this.ortho = 0;

		this.updateCamera();
	}

	/**
	 * @param deltaTime {number}
	 * @param map {Map}
	 */
	update(deltaTime, map) {
		if (deltaTime > 50) deltaTime = 50; // assume min 20 UPS
		this.averageDeltaTime = this.averageDeltaTime * 0.9 + deltaTime * 0.1; // average delta-time to avoid choppy controls on lag-spikes

		if (this._controls) this._controls.update(this.averageDeltaTime, map);

		this.updateCamera();
	}

	updateCamera() {
		let valueChanged = this.isValueChanged();

		if (valueChanged) {
			this.resetValueChanged();

			// wrap rotation
			while (this.rotation >= Math.PI) this.rotation -= Math.PI * 2;
			while (this.rotation <= -Math.PI) this.rotation += Math.PI * 2;

			// prevent problems with the rotation when the angle is 0 (top-down) or distance is 0 (first-person)
			let rotatableAngle = this.angle;
			if (Math.abs(rotatableAngle) <= 0.0001) rotatableAngle = 0.0001;
			else if (Math.abs(rotatableAngle) - Math.PI <= 0.0001) rotatableAngle = rotatableAngle - 0.0001;
			let rotatableDistance = this.distance;
			if (Math.abs(rotatableDistance) <= 0.0001) rotatableDistance = 0.0001;

			// fix distance for orthogonal-camera
			if (this.ortho > 0) {
				rotatableDistance = MathUtils.lerp(rotatableDistance, Math.max(rotatableDistance, 300), Math.pow(this.ortho, 8));
			}

			// calculate rotationVector
			let rotationVector = new Vector3(Math.sin(this.rotation), 0, -Math.cos(this.rotation)); // 0 is towards north
			let angleRotationAxis = new Vector3(0, 1, 0).cross(rotationVector);
			rotationVector.applyAxisAngle(angleRotationAxis, (Math.PI / 2) - rotatableAngle);
			rotationVector.multiplyScalar(rotatableDistance);

			// position camera
			this.camera.rotation.set(0, 0, 0);
			this.camera.position.copy(this.position).sub(rotationVector);
			this.camera.lookAt(this.position);
			this.camera.rotateZ(this.tilt + rotatableAngle < 0 ? Math.PI : 0);

			// optimize far/near planes
			if (this.ortho <= 0) {
				let near = MathUtils.clamp(rotatableDistance / 1000, 0.01, 1);
				let far = MathUtils.clamp(rotatableDistance * 2, Math.max(near + 1, 2000), rotatableDistance + 5000);
				if (far - near > 10000) near = far - 10000;
				this.camera.near = near;
				this.camera.far = far;
			} else if (this.angle === 0) {
				this.camera.near = 1;
				this.camera.far = rotatableDistance + 300;
			} else {
				this.camera.near = 1;
				this.camera.far = 100000;
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
			if (valueChanged) {
				triggerDistance = this.mapViewer.loadedLowresViewDistance * 0.8;
			}
			if (
				Math.abs(this.lastMapUpdatePosition.x - this.position.x) >= triggerDistance ||
				Math.abs(this.lastMapUpdatePosition.z - this.position.z) >= triggerDistance
			) {
				this.lastMapUpdatePosition = this.position.clone();
				this.mapViewer.loadMapArea(this.position.x, this.position.z);
			}
		}
	}

	isValueChanged() {
		return !(
			this.position.equals(this.lastPosition) &&
			this.rotation === this.lastRotation &&
			this.angle === this.lastAngle &&
			this.distance === this.lastDistance &&
			this.ortho === this.lastOrtho &&
			this.tilt === this.lastTilt
		);
	}

	resetValueChanged() {
		this.lastPosition.copy(this.position);
		this.lastRotation = this.rotation;
		this.lastAngle = this.angle;
		this.lastDistance = this.distance;
		this.lastOrtho = this.ortho;
		this.lastTilt = this.tilt;
	}

	/**
	 * @returns {number}
	 */
	get ortho() {
		return this.camera.ortho;
	}

	/**
	 * @param ortho {number}
	 */
	set ortho(ortho) {
		this.camera.ortho = ortho;
	}

	get distance() {
		return this.camera.distance;
	}

	set distance(distance) {
		this.camera.distance = distance;
	}

	/** @typedef ControlsLike {{
	 * 		start: function(controls: ControlsManager),
	 * 		stop: function(),
	 * 		update: function(deltaTime: number, map: Map)
	 * 	}}

	/**
	 * @param controls {ControlsLike}
	 */
	set controls(controls) {
		if (this._controls && this._controls.stop)
			this._controls.stop();

		this._controls = controls;

		if (this._controls && this._controls.start)
			this._controls.start(this);
	}

	/**
	 * @returns {ControlsLike}
	 */
	get controls() {
		return this._controls;
	}

}