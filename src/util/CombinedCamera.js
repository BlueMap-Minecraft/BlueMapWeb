import {MathUtils, Matrix4, PerspectiveCamera} from "three";

export class CombinedCamera extends PerspectiveCamera {

    /**
     * @param fov {number}
     * @param aspect {number}
     * @param near {number}
     * @param far {number}
     * @param ortho {number}
     */
    constructor(fov, aspect, near, far, ortho) {
        super(fov, aspect, near, far);

        this.ortho = ortho;
        this.distance = 1;
    }

    updateProjectionMatrix() {
        if (!this.ortographicProjection)
            this.ortographicProjection = new Matrix4();

        if (!this.perspectiveProjection)
            this.perspectiveProjection = new Matrix4();

        //copied from PerspectiveCamera
        const near = this.near;
        let top = near * Math.tan( MathUtils.DEG2RAD * 0.5 * this.fov ) / this.zoom;
        let height = 2 * top;
        let width = this.aspect * height;
        let left = - 0.5 * width;
        const view = this.view;

        if ( this.view !== null && this.view.enabled ) {

            const fullWidth = view.fullWidth,
                fullHeight = view.fullHeight;

            left += view.offsetX * width / fullWidth;
            top -= view.offsetY * height / fullHeight;
            width *= view.width / fullWidth;
            height *= view.height / fullHeight;

        }

        const skew = this.filmOffset;
        if ( skew !== 0 ) left += near * skew / this.getFilmWidth();

        // this part different to PerspectiveCamera
        let normalizedOrtho = -Math.pow(this.ortho - 1, 6) + 1;
        let orthoTop = Math.max(this.distance, 0.0001) * Math.tan( MathUtils.DEG2RAD * 0.5 * this.fov ) / this.zoom;
        let orthoHeight = 2 * orthoTop;
        let orthoWidth = this.aspect * orthoHeight;
        let orthoLeft = - 0.5 * orthoWidth;

        this.perspectiveProjection.makePerspective( left, left + width, top, top - height, near, this.far );
        this.ortographicProjection.makeOrthographic( orthoLeft, orthoLeft + orthoWidth, orthoTop, orthoTop - orthoHeight, near, this.far );

        for (let i = 0; i < 16; i++){
            this.projectionMatrix.elements[i] = (this.perspectiveProjection.elements[i] * (1 - normalizedOrtho)) + (this.ortographicProjection.elements[i] * normalizedOrtho);
        }
        // to here

        this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

    }

    /**
     * @returns {boolean}
     */
    get isPerspectiveCamera() {
        return this.ortho < 1;
    }

    /**
     * @returns {boolean}
     */
    get isOrthographicCamera() {
        return !this.isPerspectiveCamera;
    }

    /**
     * @returns {string}
     */
    get type() {
        return this.isPerspectiveCamera ? 'PerspectiveCamera' : 'OrthographicCamera';
    }

    /**
     * @param type {string}
     */
    set type(type) {
        //ignore
    }

}