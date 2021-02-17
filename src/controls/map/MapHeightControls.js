import {MathUtils, Vector2} from "three";

export class MapHeightControls {

    /**
     * @param cameraHeightStiffness {number}
     * @param targetHeightStiffness {number}
     */
    constructor(cameraHeightStiffness, targetHeightStiffness) {
        this.manager = null;

        this.cameraHeightStiffness = cameraHeightStiffness;
        this.targetHeightStiffness = targetHeightStiffness;
        this.maxAngle = Math.PI / 2;

        this.targetHeight = 0;
        this.cameraHeight = 0;

        this.lastTarget = new Vector2();
        this.lastTargetTerrainHeight = 0;

        this.minCameraHeight = 0;
        this.distanceTagretHeight = 0;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;
    }

    stop() {}

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {

        // adjust target height
        this.updateHeights(delta, map);
        this.manager.position.y = Math.max(this.manager.position.y, this.getSuggestedHeight());
    }

    updateHeights(delta, map) {
        //target height
        let targetSmoothing = this.targetHeightStiffness / (16.666 / delta);
        targetSmoothing = MathUtils.clamp(targetSmoothing, 0, 1);

        let targetTerrainHeight = this.lastTargetTerrainHeight;
        if (this.lastTarget.x !== this.manager.position.x || this.lastTarget.y !== this.manager.position.z){
            targetTerrainHeight = map.terrainHeightAt(this.manager.position.x, this.manager.position.z) || 0;
            this.lastTargetTerrainHeight = targetTerrainHeight;
            this.lastTarget.set(this.manager.position.x, this.manager.position.z);
        }

        let targetDelta = targetTerrainHeight - this.targetHeight;
        this.targetHeight += targetDelta * targetSmoothing;
        if (Math.abs(targetDelta) < 0.001) this.targetHeight = targetTerrainHeight;

        // camera height
        this.minCameraHeight = 0;
        if (this.maxAngle >= 0.1) {
            let cameraSmoothing = this.cameraHeightStiffness / (16.666 / delta);
            cameraSmoothing = MathUtils.clamp(cameraSmoothing, 0, 1);

            let cameraTerrainHeight = map.terrainHeightAt(this.manager.camera.position.x, this.manager.camera.position.z) || 0;

            let cameraDelta = cameraTerrainHeight - this.cameraHeight;
            this.cameraHeight += cameraDelta * cameraSmoothing;
            if (Math.abs(cameraDelta) < 0.001) this.cameraHeight = cameraTerrainHeight;

            let maxAngleHeight = Math.cos(this.maxAngle) * this.manager.distance;
            this.minCameraHeight = this.cameraHeight - maxAngleHeight + 1;
        }

        // adjust targetHeight by distance
        this.distanceTagretHeight = Math.max(MathUtils.lerp(this.targetHeight, 0, this.manager.distance / 500), 0);
    }

    getSuggestedHeight() {
        return Math.max(this.distanceTagretHeight, this.minCameraHeight);
    }

}