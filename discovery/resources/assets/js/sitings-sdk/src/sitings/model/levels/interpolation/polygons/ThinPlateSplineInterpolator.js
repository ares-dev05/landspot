import AbstractInterpolator from './AbstractInterpolator';
// import {inv} from 'mathjs';
import Geom from '../../../../../utils/Geom';

export default class ThinPlateSplineInterpolator extends AbstractInterpolator {

    constructor (points) {
        super(points);

        /**
         * @type {Float64Array}
         * @private
         */
        this._coeffs = [];

        /**
         * @type {boolean}
         * @private
         */
        this._valid = false;

        this._solve();
    }

    /**
     * @return {boolean}
     */
    get valid() { return this._valid; }

    /**
     * @return {Float64Array}
     */
    get coeffs() { return this._coeffs; }

    /**
     * @private
     */
    _solve() {
        const pointCount = this.points.length;

        // initialize a big zero matrix
        let A = [];
        for(let i = 0; i < pointCount + 3; i++) {
            A[i] = [];
            for(let j = 0; j < pointCount + 3; j++) {
                A[i][j] = 0;
            }
        }

        for(let i = 0; i < pointCount; i++){
            // top right part of matrix
            A[0][3 + i] = 1;
            A[1][3 + i] = this.points[i].position.x;
            A[2][3 + i] = this.points[i].position.y;

            // bottom left part of matrix
            A[3+i][0] = 1;
            A[3+i][1] = this.points[i].position.x;
            A[3+i][2] = this.points[i].position.y;
        }

        // the lower right part of the matrix
        for(let r = 0; r < pointCount; r++){
            for(let c = 0; c < pointCount; c++){
                A[r+3][c+3] = base_func(
                    this.points[r].position.x, this.points[r].position.y,
                    this.points[c].position.x, this.points[c].position.y,
                );
                A[c+3][r+3] = A[r+3][c+3];
            }
        }

        // Calculate the matrix inverse - if possible
        let invA;
        try { invA = Geom.invertMatrix(A); } catch (e) { /**/ }

        // If the matrix inverse can't be calculated, this interpolator cannot calculate the splines
        if (!invA) {
            this._valid = false;
            return;
        }

        // mark the interpolator as valid - the matrix inverse was successfully calculated
        this._valid = true;

        // compute coefficient arrays
        this._coeffs = new Float64Array(pointCount + 3);

        for(let r = 0; r < pointCount + 3; r++){
            for(let c = 0; c < pointCount; c++){
                this._coeffs[r] += invA[r][c+3] * this.points[c].height;
            }
        }
    }

    /**
     * Interpolates on the existing points and returns the value at position (x,y)
     * @param x {number} X coordinate of the point to interpolate
     * @param y {number} Y coordinate of the point to interpolate
     * @return {number} the interpolated value at the indicated position
     * @public
     */
    interpolate(x, y) {
        let height = this._coeffs[0] + this._coeffs[1] * x + this._coeffs[2] * y;

        for(let r = 0; r < this.points.length; r++){
            const tmp = base_func(x, y, this.points[r].position.x, this.points[r].position.y);
            height += this._coeffs[r + 3] * tmp;
        }

        return height;
    }
}

/**
 * @param x1 {number}
 * @param y1 {number}
 * @param x2 {number}
 * @param y2 {number}
 * @return {number}
 */
function base_func(x1, y1, x2, y2){
    if(x1 === x2 && y1 === y2) return 0;
    let dist = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    return dist * Math.log(dist);
}