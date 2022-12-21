import * as THREE from 'three';
import {MeshLine} from 'three.meshline';

/**
 * A single surface displayed in the application
 */
export default class LotSurface {

    constructor() {
        /**
         * @type {number[]}
         * @private
         */
        this._vertices = [];

        /**
         * @type {number[]}
         * @private
         */
        this._uvs = [];

        /**
         * @type {number[]} Array of indices pointing to the vertices that make up the surface triangles.
         *                  Each group of 3 indices is a single triangle face
         * @private
         */
        this._triangles = [];
    }

    /**
     * @param points {number[][]}
     * @param scale {number}
     */
    addFromXZY(points, scale=1) {
        // Swap Y & Z in the vertices for correct display
        for (let i=0; i<points.length; ++i) {
            this.vertices[i*3  ]   = points[i][0] * scale;
            this.vertices[i*3+1]   = points[i][2] * scale;
            this.vertices[i*3+2]   = points[i][1] * scale;
            this.uvs[i*2]          = points[i][0];
            this.uvs[i*2+1]        = points[i][1];
        }
    }

    /**
     * @TODO: refactor and unite top function with this
     * @param points {number[][]}
     * @param scale {number}
     */
    addFromXZYVertical(points, scale=1) {
        // Swap Y & Z in the vertices for correct display
        for (let i=0; i<points.length; ++i) {
            this.vertices[i*3  ]   = points[i][0] * scale;
            this.vertices[i*3+1]   = points[i][2] * scale;
            this.vertices[i*3+2]   = points[i][1] * scale;
            this.uvs[i*2]          = points[i][0] + points[i][1];
            this.uvs[i*2+1]        = points[i][2];
        }
    }

    /**
     * @param delta {number[]}
     */
    translate(delta) {
        for (let i=0; i<this.vertices.length; i+=3) {
            this.vertices[i] += delta[0];
            this.vertices[i+1] += delta[1];
            this.vertices[i+2] += delta[2];
        }
    }

    /**
     * @param value {number[]}
     */
    set vertices(value) { this._vertices = value; }

    /**
     * @returns {number[]}
     */
    get vertices() { return this._vertices; }

    /**
     * @returns {number}
     */
    get vertexCount() { return this._vertices.length/3; }

    /**
     * @param value {number[]}
     */
    set uvs(value) { this._uvs = value; }

    /**
     * @returns {number[]}
     */
    get uvs() { return this._uvs; }

    /**
     * @returns {number[]}
     */
    get triangles() { return this._triangles; }

    /**
     * @param value {number[]}
     */
    set triangles(value) { this._triangles = value; }

    /**
     * @returns {BufferGeometry}
     */
    get surfaceGeometry() {
        const geometry = new THREE.BufferGeometry();

        geometry.setIndex(this.triangles);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(this.vertices, 3 ) );
        geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute(this.uvs, 2));
        geometry.computeVertexNormals();

        return geometry;
    }

    /**
     * @returns {*}
     */
    get lineGeometry() {
        const line = new MeshLine();
        line.setPoints(this.vertices);

        return line.geometry;
    }
}