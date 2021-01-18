import {Marker} from "./Marker";
import {
    Color,
    DoubleSide, ExtrudeBufferGeometry,
    Mesh,
    Object3D, ShaderMaterial,
    Shape,
    Vector2
} from "three";
import {LineMaterial} from "../util/lines/LineMaterial";
import {LineGeometry} from "../util/lines/LineGeometry";
import {Line2} from "../util/lines/Line2";
import {MARKER_FILL_FRAGMENT_SHADER} from "./shader/MarkerFillFragmentShader";
import {MARKER_FILL_VERTEX_SHADER} from "./shader/MarkerFillVertexShader";

export class ExtrudeMarker extends Marker {

    constructor(markerSet, id, parentObject) {
        super(markerSet, id);
        Object.defineProperty(this, 'isExtrudeMarker', {value: true});
        Object.defineProperty(this, 'type', {value: "extrude"});

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
        this.minHeight = markerData.minHeight ? parseFloat(markerData.minHeight) : 0.0;
        this.maxHeight = markerData.maxHeight ? parseFloat(markerData.maxHeight) : 255.0;
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

        this._markerFillMaterial.uniforms.markerColor.value.copy(color.vec4);
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
     * Sets the min-height of this marker
     * @param height {number}
     */
    set minHeight(height) {
        this._minHeight = height;
    }

    /**
     * Sets the max-height of this marker
     * @param height {number}
     */
    set maxHeight(height) {
        this._markerObject.position.y = height + 0.01;
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

        this._markerObject.position.x = this.position.x + 0.01;
        this._markerObject.position.z = this.position.z + 0.01;

        let maxY = this._markerObject.position.y;
        let minY = this._minHeight;
        let depth = maxY - minY;

        let shape = new Shape(points);

        // border-line
        if (this._markerLineMaterial.opacity > 0) {
            let points3d = [];
            points.forEach(point => points3d.push(point.x, 0, point.y));
            points3d.push(points[0].x, 0, points[0].y)

            const preRenderHook = line => renderer => {
                renderer.getSize(line.material.resolution);
            };

            let topLineGeo = new LineGeometry()
            topLineGeo.setPositions(points3d);
            topLineGeo.translate(-this.position.x, 0, -this.position.z);
            let topLine = new Line2(topLineGeo, this._markerLineMaterial);
            topLine.computeLineDistances();
            topLine.onBeforeRender = preRenderHook(topLine);
            this._markerObject.add(topLine);

            let bottomLine = topLine.clone();
            bottomLine.position.y = -depth;
            bottomLine.computeLineDistances();
            bottomLine.onBeforeRender = preRenderHook(bottomLine);
            this._markerObject.add(bottomLine);

            points.forEach(point => {
                let pointLineGeo = new LineGeometry();
                pointLineGeo.setPositions([
                    point.x, 0, point.y,
                    point.x, -depth, point.y
                ])
                pointLineGeo.translate(-this.position.x, 0, -this.position.z);
                let pointLine = new Line2(pointLineGeo, this._markerLineMaterial);
                pointLine.computeLineDistances();
                pointLine.onBeforeRender = preRenderHook(pointLine);
                pointLine.marker = this;
                this._markerObject.add(pointLine);
            });
        }

        // fill
        if (this._markerFillMaterial.uniforms.markerColor.value.w > 0) {
            let fillGeo = new ExtrudeBufferGeometry(shape, {
                steps: 1,
                depth: depth,
                bevelEnabled: false
            });
            fillGeo.rotateX(Math.PI / 2); //make y to z
            fillGeo.translate(-this.position.x, 0, -this.position.z);
            let fill = new Mesh(fillGeo, this._markerFillMaterial);
            fill.onBeforeRender = (renderer, scene, camera) => this._onBeforeRender(renderer, scene, camera);
            fill.marker = this;
            this._markerObject.add(fill);
        }

        // put render-hook on line (only) if there is no fill
        else if (this._markerObject.children.length > 0) {
            let oldHook = this._markerObject.children[0].onBeforeRender;
            this._markerObject.children[0].onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
                this._onBeforeRender(renderer, scene, camera);
                oldHook(renderer, scene, camera, geometry, material, group);
            }
        }
    }

}