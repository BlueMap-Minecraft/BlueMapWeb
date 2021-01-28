import {MathUtils, Object3D, Vector3} from "three";

export class Marker extends Object3D {

    /**
     * @param markerId {string}
     */
    constructor(markerId) {
        super();
        Object.defineProperty(this, 'isMarker', {value: true});

        this.markerId = markerId;
        this.markerType = "marker";

    }

    dispose() {};

    /**
     * Updates this marker from the provided data object, usually parsed form json from a markers.json
     * @param markerData {object}
     */
    updateFromData(markerData) {}

    // -- helper methods --

    static _posRelativeToCamera = new Vector3();
    static _cameraDirection = new Vector3();

    /**
     * @param position {Vector3}
     * @param camera {THREE.Camera}
     * @param fadeDistanceMax {number}
     * @param fadeDistanceMin {number}
     * @returns {number} - opacity between 0 and 1
     */
    static calculateDistanceOpacity(position, camera, fadeDistanceMin, fadeDistanceMax) {
        //calculate "orthographic distance" to marker
        Marker._posRelativeToCamera.subVectors(position, camera.position);
        camera.getWorldDirection(Marker._cameraDirection);
        let distance = Marker._posRelativeToCamera.dot(Marker._cameraDirection);

        //calculate opacity based on (min/max)distance
        let minDelta = (distance - fadeDistanceMin) / fadeDistanceMin;
        let maxDelta = (distance - fadeDistanceMax) / (fadeDistanceMax * 0.5);
        return Math.min(
            MathUtils.clamp(minDelta, 0, 1),
            1 - MathUtils.clamp(maxDelta + 1, 0, 1)
        );
    }

}