import {Marker} from "./Marker";
import {
    Color,
    DoubleSide,
    Mesh,
    Object3D, ShaderMaterial,
    Shape,
    ShapeBufferGeometry,
    Vector2
} from "three";
import {LineMaterial} from "../util/lines/LineMaterial";
import {LineGeometry} from "../util/lines/LineGeometry";
import {Line2} from "../util/lines/Line2";
import {MARKER_FILL_FRAGMENT_SHADER} from "./shader/MarkerFillFragmentShader";
import {MARKER_FILL_VERTEX_SHADER} from "./shader/MarkerFillVertexShader";

export class ShapeMarker extends Marker {

    constructor(markerSet, id, parentObject) {
        super(markerSet, id);
        Object.defineProperty(this, 'isShapeMarker', {value: true});
        Object.defineProperty(this, 'type', {value: "shape"});

        let fillColor = Marker.normalizeColor({});
        let borderColor = Marker.normalizeColor({});
        let lineWidth = 2;
        let depthTest = false;

        this._lineOpacity = 1;
        this._fillOpacity = 1;

        this._markerObject = new Object3D();
        this._markerObject.position.copy(this.position);
        parentObject.add(this._markerObject);

        this._markerFillMaterial = new ShaderMaterial({
            vertexShader: MARKER_FILL_VERTEX_SHADER,
            fragmentShader: MARKER_FILL_FRAGMENT_SHADER,
            side: DoubleSide,
            depthTest: depthTest,
            transparent: true,
            uniforms: {
                markerColor: { value: fillColor.vec4 }
            }
        });

        this._markerLineMaterial = new LineMaterial({
            color: new Color(borderColor.rgb),
            opacity: borderColor.a,
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
        this.height = markerData.height ? parseFloat(markerData.height) : 0.0;
        this.depthTest = !!markerData.depthTest;

        if (markerData.fillColor) this.fillColor = markerData.fillColor;
        if (markerData.borderColor) this.borderColor = markerData.borderColor;

        this.lineWidth = markerData.lineWidth ? parseFloat(markerData.lineWidth) : 2;

        let points = [];
        if (Array.isArray(markerData.shape)) {
            markerData.shape.forEach(point => {
                points.push(new Vector2(parseFloat(point.x), parseFloat(point.z)));
            });
        }
        this.shape = points;
    }

    _onBeforeRender(renderer, scene, camera) {
        super._onBeforeRender(renderer, scene, camera);

        this._markerFillMaterial.uniforms.markerColor.value.w = this._fillOpacity * this._opacity;
        this._markerLineMaterial.opacity = this._lineOpacity * this._opacity;
    }

    dispose() {
        this._markerObject.parent.remove(this._markerObject);
        this._markerObject.children.forEach(child => {
            if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
        });
        this._markerObject.clear();

        this._markerFillMaterial.dispose();
        this._markerLineMaterial.dispose();

        super.dispose();
    }

    /**
     * Sets the fill-color
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
    set fillColor(color) {
        color = Marker.normalizeColor(color);

        this._markerFillMaterial.uniforms.markerColor.value = color.vec4;
        this._fillOpacity = color.a;
        this._markerFillMaterial.needsUpdate = true;
    }

    /**
     * Sets the border-color
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
    set borderColor(color) {
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
        this._markerFillMaterial.depthTest = test;
        this._markerFillMaterial.needsUpdate = true;

        this._markerLineMaterial.depthTest = test;
        this._markerLineMaterial.needsUpdate = true;
    }

    get depthTest() {
        return this._markerFillMaterial.depthTest;
    }

    /**
     * Sets the height of this marker
     * @param height {number}
     */
    set height(height) {
        this._markerObject.position.y = height;
    }

    /**
     * Sets the points for the shape of this marker.
     * @param points {Vector2[]}
     */
    set shape(points) {
        // remove old marker
        this._markerObject.children.forEach(child => {
            if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
        });
        this._markerObject.clear();

        if (points.length < 3) return;

        this._markerObject.position.x = this.position.x;
        this._markerObject.position.z = this.position.z;

        // border-line
        let points3d = [];
        points.forEach(point => points3d.push(point.x, 0, point.y));
        points3d.push(points[0].x, 0, points[0].y)
        let lineGeo = new LineGeometry()
        lineGeo.setPositions(points3d);
        lineGeo.translate(-this.position.x, 0.01456, -this.position.z);
        let line = new Line2(lineGeo, this._markerLineMaterial);
        line.onBeforeRender = renderer => renderer.getSize(line.material.resolution);
        line.computeLineDistances();
        line.marker = this;
        this._markerObject.add(line);

        // fill
        if (this._markerFillMaterial.uniforms.markerColor.value.w > 0) {
            let shape = new Shape(points);
            let fillGeo = new ShapeBufferGeometry(shape, 1);
            fillGeo.rotateX(Math.PI / 2); //make y to z
            fillGeo.translate(-this.position.x, 0.01456, -this.position.z);
            let fill = new Mesh(fillGeo, this._markerFillMaterial);
            fill.marker = this;
            this._markerObject.add(fill);
        }

        // put render-hook on first object
        if (this._markerObject.children.length > 0) {
            let oldHook = this._markerObject.children[0].onBeforeRender;
            this._markerObject.children[0].onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
                this._onBeforeRender(renderer, scene, camera);
                oldHook(renderer, scene, camera, geometry, material, group);
            }
        }
    }

}
