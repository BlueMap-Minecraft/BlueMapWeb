import {MathUtils, Vector3, Vector4} from "three";
import {animate, dispatchEvent} from "../util/Utils";

export class Marker {

    static Source = {
        CUSTOM: 0,
        MARKER_FILE: 1
    }

    constructor(markerSet, id) {
        Object.defineProperty(this, 'isMarker', {value: true});

        this.manager = markerSet.manager;
        this.markerSet = markerSet;
        this.id = id;

        this._position = new Vector3();

        this._label = null;
        this.link = null;
        this.newTab = true;

        this.minDistance = 0.0;
        this.maxDistance = 100000.0;

        this.opacity = 1;

        this._source = Marker.Source.CUSTOM;

        this._onDisposal = [];

        this._distance = 0;
        this._opacity = 1;

        this._posRelativeToCamera = new Vector3();
        this._cameraDirection = new Vector3();
    }

    update(markerData) {
        this._source = Marker.Source.MARKER_FILE;

        if (markerData.position) {
            this.setPosition(parseFloat(markerData.position.x), parseFloat(markerData.position.y), parseFloat(markerData.position.z));
        } else {
            this.setPosition(0, 0, 0);
        }

        this.label = markerData.label ? markerData.label : null;
        this.link = markerData.link ? markerData.link : null;
        this.newTab = !!markerData.newTab;

        this.minDistance = parseFloat(markerData.minDistance ? markerData.minDistance : 0.0);
        this.maxDistance = parseFloat(markerData.maxDistance ? markerData.maxDistance : 100000.0);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
    }

    get position() {
        return this._position;
    }

    onClick(clickPosition){
        if (!dispatchEvent(this.manager.events, 'bluemapMarkerClick', {marker: this})) return;

        this.followLink();

        if (this.label){
            this.manager.showPopup(`<div class="bm-marker-label">${this.label}</div>`, clickPosition.x, clickPosition.y, clickPosition.z, true);
        }
    }

    followLink(){
        if (this.link){
            if (this.newTab){
                window.open(this.link, '_blank');
            } else {
                location.href = this.link;
            }
        }
    }

    _onBeforeRender(renderer, scene, camera) {

        //calculate "orthographic distance" to marker
        this._posRelativeToCamera.subVectors(this.position, camera.position);
        camera.getWorldDirection(this._cameraDirection);
        this._distance = this._posRelativeToCamera.dot(this._cameraDirection);

        //calculate opacity based on (min/max)distance
        this._opacity = Math.min(
            1 - MathUtils.clamp((this._distance - this.maxDistance) / (this.maxDistance * 2), 0, 1),
            MathUtils.clamp((this._distance - this.minDistance) / (this.minDistance * 2 + 1), 0, 1)
        ) * this.opacity;

    }

    blendIn(durationMs = 500, postAnimation = null){
        this.opacity = 0;
        animate(progress => {
            this.opacity = progress;
        }, durationMs, postAnimation);
    }

    blendOut(durationMs = 500, postAnimation = null){
        let startOpacity = this.opacity;
        animate(progress => {
            this.opacity = startOpacity * (1 - progress);
        }, durationMs, postAnimation);
    }

    set label(label){
        this._label = label;
    }

    get label(){
        return this._label;
    }

    set onDisposal(callback) {
        this._onDisposal.push(callback);
    }

    dispose() {
        this._onDisposal.forEach(callback => callback(this));
        delete this.markerSet._marker[this.id];
    }

    static normalizeColor(color){
        if (!color) color = {};

        color.r = Marker.normaliseNumber(color.r, 255, true);
        color.g = Marker.normaliseNumber(color.g, 0, true);
        color.b = Marker.normaliseNumber(color.b, 0, true);
        color.a = Marker.normaliseNumber(color.a, 1, false);

        color.rgb = (color.r << 16) + (color.g << 8) + (color.b);
        color.vec4 = new Vector4(color.r / 255, color.g / 255, color.b / 255, color.a);
        return color;
    }

    static normaliseNumber(nr, def, integer = false) {
        if (isNaN(nr)){
            if (integer) nr = parseInt(nr);
            else nr = parseFloat(nr);
            if (isNaN(nr)) return def;
            return nr;
        }

        if (integer) return Math.floor(nr);
        return nr;
    }

}