import {Marker} from "./Marker";
import {
    Color,
    Object3D,
    Vector3,
} from "three";
import {LineMaterial} from "../util/lines/LineMaterial";
import {LineGeometry} from "../util/lines/LineGeometry";
import {Line2} from "../util/lines/Line2";

export class LineMarker extends Marker {

    constructor(markerSet, id, parentObject) {
        super(markerSet, id);
        Object.defineProperty(this, 'isLineMarker', {value: true});
        Object.defineProperty(this, 'type', {value: "line"});

        let lineColor = Marker.normalizeColor({});
        let lineWidth = 2;
        let depthTest = false;

        this._lineOpacity = 1;

        this._markerObject = new Object3D();
        this._markerObject.position.copy(this.position);
        parentObject.add(this._markerObject);

        this._markerLineMaterial = new LineMaterial({
            color: new Color(lineColor.rgb),
            opacity: lineColor.a,
            transparent: true,
            linewidth: lineWidth,
            depthTest: depthTest,
            vertexColors: false,
            dashed: false
        });
        this._markerLineMaterial.resolution.set(window.innerWidth, window.innerHeight);
    }

    update(markerData) {
        super.update(markerData);

        if (markerData.lineColor) this.lineColor = markerData.lineColor;

        this.lineWidth = markerData.lineWidth ? parseFloat(markerData.lineWidth) : 2;
        this.depthTest = !!markerData.depthTest;

        let points = [];
        if (Array.isArray(markerData.line)) {
            markerData.line.forEach(point => {
                points.push(new Vector3(parseFloat(point.x), parseFloat(point.y), parseFloat(point.z)));
            });
        }
        this.line = points;
    }

    _onBeforeRender(renderer, scene, camera) {
        super._onBeforeRender(renderer, scene, camera);

        this._markerLineMaterial.opacity = this._lineOpacity * this._opacity;
    }

    dispose() {
        this._markerObject.parent.remove(this._markerObject);
        this._markerObject.children.forEach(child => {
            if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
        });
        this._markerObject.clear();

        this._markerLineMaterial.dispose();

        super.dispose();
    }

    /**
     * Sets the line-color
     *
     * color-object format:
     * <code><pre>
     * {
     *     r: 0,    // int 0-255 red
     *     g: 0,    // int 0-255 green
     *     b: 0,    // int 0-255 blue
     *     a: 0     // float 0-1 alpha
     * }
     * </pre></code>
     *
     * @param color {Object}
     */
    set lineColor(color) {
        color = Marker.normalizeColor(color);

        this._markerLineMaterial.color.setHex(color.rgb);
        this._lineOpacity = color.a;
        this._markerLineMaterial.needsUpdate = true;
    }

    /**
     * Sets the width of the marker-line
     * @param width {number}
     */
    set lineWidth(width) {
        this._markerLineMaterial.linewidth = width;
        this._markerLineMaterial.needsUpdate = true;
    }

    /**
     * Sets if this marker can be seen through terrain
     * @param test {boolean}
     */
    set depthTest(test) {
        this._markerLineMaterial.depthTest = test;
        this._markerLineMaterial.needsUpdate = true;
    }

    get depthTest() {
        return this._markerLineMaterial.depthTest;
    }

    /**
     * Sets the points for the shape of this marker.
     * @param points {Vector3[]}
     */
    set line(points) {
        // remove old marker
        this._markerObject.children.forEach(child => {
            if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
        });
        this._markerObject.clear();

        if (points.length < 3) return;

        this._markerObject.position.copy(this.position);

        // line
        let points3d = [];
        points.forEach(point => points3d.push(point.x, point.y, point.z));
        let lineGeo = new LineGeometry();
        lineGeo.setPositions(points3d);
        lineGeo.translate(-this.position.x, -this.position.y, -this.position.z);
        let line = new Line2(lineGeo, this._markerLineMaterial);
        line.computeLineDistances();

        line.onBeforeRender = (renderer, camera, scene) => {
            this._onBeforeRender(renderer, camera, scene);
            renderer.getSize(line.material.resolution);
        }

        line.marker = this;
        this._markerObject.add(line);
    }

}