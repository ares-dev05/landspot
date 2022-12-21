import * as THREE from 'three';
import {MeshLineMaterial} from 'three.meshline';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {GUI} from 'dat.gui';
import EventBase from '../../../../events/EventBase';
import Loader from '../../../../../../lotmix-sunpather/webgl-engine/js/loaders/loader';
import LotSurfaceBuilder from '../../../model/levels/3d/LotSurfaceBuilder';


// const SCALE = 2;
const SCALE = 100;
const DEBUG = false;

// Default texture offset used to help z-index sorting for overlapping meshes
// https://stackoverflow.com/a/25228048
const TEXTURE_OFFSET = 0.3;

// shadow settings
const SHADOW_CAMERA_HEIGHT = 18;
const SHADOW_BLUR = 4;
const SHADOW_DARKNESS = 1.6;
const SHADOW_OPACITY = 0.5;


export default class Lot3DView {

    /**
     * @param surfaceBuilder {LotSurfaceBuilder}
     * @param width {number}
     * @param height {number}
     */
    constructor(surfaceBuilder, width, height) {
        /**
         * @type {Node}
         * @private
         */
        this._container = null;

        /**
         * @type {LotSurfaceBuilder}
         * @private
         */
        this._surfaceBuilder = surfaceBuilder;
        this._surfaceBuilder.addEventListener(EventBase.CHANGE, this.surfaceModeChanged, this);
        this._surfaceBuilder.addEventListener(LotSurfaceBuilder.SHOW_CUT_AREA_CHANGE, this.showCutAreaChanged, this);

        /**
         * @type {PerspectiveCamera}
         * @private
         */
        this._camera = new THREE.PerspectiveCamera(45, width / height, 0.01 * SCALE, 100 * SCALE);
        this._camera.position.set(10 * SCALE, 7.5 * SCALE, 10 * SCALE);

        /**
         * @type {Scene} 3D Scene
         * @private
         */
        this._scene = new THREE.Scene();
        // this._scene.background = new THREE.Color( 0xaaaaaa, 0.5);

        /**
         * @type {DirectionalLight} This is the SUN
         * @private
         */
        this._directionalLight = new THREE.DirectionalLight( 0x888888, 1.5 );
        this._directionalLight.position.set(60 * SCALE, 40 * SCALE, 20 * SCALE);

        this._lightHolder = new THREE.Group();
        this._lightHolder.add(this._directionalLight);

        /**
         * @type {Group} The container, if you need to move the plane just move this
         * @private
         */
        this._shadowGroup = new THREE.Group();
        this._shadowGroup.position.y = - SHADOW_CAMERA_HEIGHT/8 * SCALE;

        /**
         * @type {AmbientLight}
         * @private
         */
        this._ambientLight = new THREE.AmbientLight(0x404040, 2);

        /**
         * @type {AxesHelper}
         * @private
         */
        this._axesHelper = new THREE.AxesHelper( 40 * SCALE );

        // Add objects to the scene
        this._scene.add(this._ambientLight);
        this._scene.add(this._lightHolder);
        this._scene.add(this._shadowGroup);
        this._setupShadowGroup();

        if (DEBUG) {
            this._scene.add(this._axesHelper);
        }

        /**
         * @type {WebGLRenderer}
         * @private
         */
        this._renderer = new THREE.WebGLRenderer( {antialias: true, alpha: true} );
        this._renderer.setPixelRatio( window.devicePixelRatio );
        this._renderer.setSize(width, height);
        //this._renderer.autoClear = false;
        //this._renderer.setClearColor(0x000000, 0.0);
        this._renderer.outputEncoding = THREE.sRGBEncoding;

        /**
         * @type {OrbitControls} Orbital controls for the view
         * @private
         */
        this._controls = null;

        /**
         * @type {Stats} 3D Stats to display
         * @private
         */
        this._stats = new Stats();

        /**
         * @type {GUI}
         * @private
         */
        this._gui = new GUI({autoPlace: false});
        this._setupGUI();

        /**
         * @type {*[]} all 3D Objects added to the scene
         * @private
         */
        this._objects   = [];

        /**
         * @type {*[]}
         * @private
         */
        this._cutObjects = [];

        /**
         * @type {TextureLoader}
         * @private
         */
        this._textureLoader = new THREE.TextureLoader();
        this._setupMaterials();

        /**
         * @type {Vector2}
         * @private
         */
        this._screenSize = new THREE.Vector2(640,480);

        /**
         * @type {MeshLineMaterial}
         * @private
         */
        this._fallLineMaterial = null;
    }

    /**
     * @returns {WebGLRenderer}
     */
    get renderer() { return this._renderer; }

    /**
     * @returns {Node}
     */
    get container() { return this._container; }

    /**
     * @param container {Node}
     */
    set container(container) {
        if (this._container === container) {
            return;
        }

        if (this._container) {
            try {
                this._container.removeChild(this._renderer.domElement);
                this._container.removeChild(this._stats.dom);
            }   catch (e) {/**/}

            if (this._controls) {
                this._controls.dispose();
                this._controls = null;
            }
        }

        this._container = container;

        if (this._container) {
            this._renderer.domElement.className = 'threed-canvas';
            this._container.appendChild(this._renderer.domElement);
            this._container.appendChild(this._stats.dom);

            if (DEBUG) {
                const guiParent = this._container.parentNode;
                guiParent.insertBefore(this._gui.domElement, guiParent.firstChild);
            }

            this._controls = new OrbitControls(this._camera, this._renderer.domElement);
            this._controls.minPolarAngle = 0.05 * Math.PI / 2;
            this._controls.maxPolarAngle = 0.75 * Math.PI / 2;
            this._controls.enableZoom = true;
            this._controls.enableDamping = true;
            this._controls.dampingFactor = 0.2;
            this._controls.target = new THREE.Vector3(0, 0, 0);

            this._animate();
        }
    }

    /**
     * @returns {boolean}
     */
    get canAnimate() { return this._container !== null; }

    /**
     * Update the displayed surface when another oen is selected
     * @public
     */
    surfaceModeChanged() {
        this.addSurface(this._surfaceBuilder.currentSurface);
    }

    /**
     * Hide / Show the
     */
    showCutAreaChanged() {
        if (this._surfaceBuilder.showCutSurface) {
            this._cutObjects.forEach(object => this._scene.add(object));
        }   else {
            this._cutObjects.forEach(object => this._scene.remove(object));
        }
    }

    /**
     * @param width {number}
     * @param height {number}
     */
    resize(width, height) {
        width  = Math.max(width, 100);
        height = Math.max(height, 100);

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._screenSize.set(width, height);
        this._renderer.setSize(width, height);
    }

    /**
     * @param mesh
     * @param cutObject
     * @return {*}
     */
    addToScene(mesh, cutObject=false) {
        !cutObject && this._objects.push(mesh);
         cutObject && this._cutObjects.push(mesh);

        if (!cutObject || this._surfaceBuilder.showCutSurface) {
            this._scene.add(mesh);
        }

        return mesh;
    }

    /**
     * @param lotGeometry {LotGeometry}
     * @param clearExisting {boolean}
     */
    addSurface(lotGeometry, clearExisting=true) {
        console.log('addSurface ', lotGeometry);

        if (clearExisting) {
            this._objects.forEach(object => this._scene.remove(object));
            this._cutObjects.forEach(object => this._scene.remove(object));

            this._objects = [];
            this._cutObjects = [];
        }

        // skip if a null geometry is passed
        if (!lotGeometry) {
            return;
        }

        // add the lot surface
        this.addToScene(new THREE.Mesh(lotGeometry.lotSurface.surfaceGeometry, this._grassMaterial));

        // add the lot bottom; we mirror it on the Y axis so that it will cast a shadow
        this.addToScene(new THREE.Mesh(lotGeometry.lotBottom.surfaceGeometry, this._bottomMaterial)).scale.y = -1;

        // add the lot outside
        this.addToScene(new THREE.Mesh(lotGeometry.outsideSurface.surfaceGeometry, this._crustMaterial));

        // add the lot outline
        this.addToScene(new THREE.Mesh(lotGeometry.lotOutline.lineGeometry, this.solidLineMaterial));

        // add the pad surface
        if (lotGeometry.padSurface) {
            // this.addToScene(new THREE.Mesh(lotGeometry.padSurface.surfaceGeometry, this._dirtMaterial));

            // Add the slab walls
            this.addToScene(new THREE.Mesh(lotGeometry.padSurface.vertical.surfaceGeometry, this._dirtMaterial));
            // Add the slab surface
            this.addToScene(new THREE.Mesh(lotGeometry.padSurface.horizontal, this._dirtMaterial));
        }

        // add the cut surface (if it exists)
        if (lotGeometry.cutSurface) {
            this.addToScene(new THREE.Mesh(lotGeometry.cutSurface, this._cutMaterial), true);
        }

        if (lotGeometry.cutLines) {
            lotGeometry.cutLines.forEach(
                cutLine => this.addToScene(new THREE.Mesh(cutLine.lineGeometry, this.fallLineMaterial), true)
            );
        }

        // add all the fall lines
        if (lotGeometry.fallLines) {
            lotGeometry.fallLines.forEach(
                fallLine => {
                    this.addToScene(new THREE.Mesh(fallLine.lineGeometry, this.fallLineMaterial));
                }
            );
        }

        // add the retaining walls
        if (lotGeometry.retainingWalls) {
            lotGeometry.retainingWalls.forEach(
                wall => {
                    this.addToScene(new THREE.Mesh(wall.surfaceGeometry, this._wallMaterial));
                }
            );
        }

        // add the batter areas
        if (lotGeometry.batterAreas) {
            lotGeometry.batterAreas.forEach(
                area => {
                    this.addToScene(new THREE.Mesh(area.surfaceGeometry, this._batterMaterial));
                }
            );
        }

        if (lotGeometry.sitePiers) {
            lotGeometry.sitePiers.forEach(
                pier => this.addToScene(new THREE.Mesh(pier, this._slabMaterial))
            );
        }

        // add the slabs
        if (lotGeometry.slabSurfaces) {
            lotGeometry.slabSurfaces.forEach(
                surface => {
                    // Add the slab walls
                    this.addToScene(new THREE.Mesh(surface.vertical.surfaceGeometry, this._slabMaterial));
                    // Add the slab surface
                    this.addToScene(new THREE.Mesh(surface.horizontal, this._slabMaterial));
                }
            );
        }

        // add the driveway
        if (lotGeometry.drivewaySurface) {
            this.addToScene(new THREE.Mesh(lotGeometry.drivewaySurface.surfaceGeometry, this._drivewayMaterial));
        }

        if (lotGeometry.hasHouseModel) {
            /**
             * @type {Loader}
             */
            const loader = new Loader({
                setUploaded: () => {},
                direction: 'West',
                lot: '3d-envelope',
                scale: lotGeometry.scaleUp,
                xPosition: lotGeometry.houseTransform ? lotGeometry.houseTransform.tx : 0,
                zPosition: lotGeometry.houseTransform ? lotGeometry.houseTransform.ty : 0,
                yPosition: lotGeometry.slabLevel * lotGeometry.scaleUp,
                onLoaded: (houseModel) => {
                    console.log('received ', houseModel);
                    this.addToScene(houseModel);
                },
            });
            loader.loadModel('/sitings/assets', '/sitings/assets/draco/');
        }
    }

    /**
     * @private
     */
    _animate() {
        if (this.canAnimate) {
            this._scheduleAnimate();

            this._stats.update();
            this._controls.update();
            if (this._fallLineMaterial) {
                this._fallLineMaterial.uniforms.dashOffset.value -= 0.001;
            }

            this._lightHolder.quaternion.copy(this._camera.quaternion);
            this._renderer.render( this._scene, this._shadowCamera );

            // remove the background
            const initialBackground = this._scene.background;
            this._scene.background = null;

            // force the depthMaterial to everything
            this._scene.overrideMaterial = this._depthMaterial;
            
            // set renderer clear alpha
            const initialClearAlpha = this._renderer.getClearAlpha();
            this._renderer.setClearAlpha( 0 );

            // render to the render target to get the depths
            this._renderer.setRenderTarget( this._renderTarget );
            this._renderer.render( this._scene, this._shadowCamera );

            // and reset the override material
            this._scene.overrideMaterial = null;

            this._blurShadow(SHADOW_BLUR);
            //this._blurShadow(SHADOW_BLUR/2);
            this._blurShadow(SHADOW_BLUR/4);
            this._blurShadow(SHADOW_BLUR/16);
            // a second pass to reduce the artifacts; (0.4 is the minimum blur amount so that the artifacts are gone)
            //this._blurShadow(SHADOW_BLUR * 0.4);

            // reset and render the normal scene
            this._renderer.setRenderTarget( null );
            this._renderer.setClearAlpha( initialClearAlpha );
            this._scene.background = initialBackground;

            // Render back the full scene
            this.renderer.render(this._scene, this._camera);
        }
    }

    /**
     * @private
     */
    _scheduleAnimate() {
        window.requestAnimationFrame(() => this._animate());
    }

    _setupShadowGroup() {
        // the render target that will show the shadows in the plane texture
        this._renderTarget = new THREE.WebGLRenderTarget( 2048, 2048 );
        this._renderTarget.texture.generateMipmaps = false;

        // the render target that we will use to blur the first render target
        this._renderTargetBlur = new THREE.WebGLRenderTarget( 2048, 2048 );
        this._renderTargetBlur.texture.generateMipmaps = false;

        const PLANE_SIZE = 32 * SCALE; // 64 * SCALE;

        // make a plane and make it face up
        const planeGeometry = new THREE.PlaneGeometry( PLANE_SIZE, PLANE_SIZE ).rotateX( Math.PI / 2 );
        const planeMaterial = new THREE.MeshBasicMaterial( {
            map: this._renderTarget.texture,
            opacity: SHADOW_OPACITY,
            transparent: true,
            depthWrite: false,
        } );
        const plane = new THREE.Mesh( planeGeometry, planeMaterial );
        // make sure it's rendered after the fillPlane
        plane.renderOrder = 1;
        this._shadowGroup.add( plane );

        // the y from the texture is flipped!
        plane.scale.y = - 1;

        // the plane onto which to blur the texture
        this._blurPlane = new THREE.Mesh( planeGeometry );
        this._blurPlane.visible = false;
        this._shadowGroup.add(this._blurPlane);

        // the camera to render the depth material from
        this._shadowCamera = new THREE.OrthographicCamera(
            -PLANE_SIZE/2, PLANE_SIZE/2, PLANE_SIZE/2, - PLANE_SIZE/2,
            -SHADOW_CAMERA_HEIGHT*SCALE,
            SHADOW_CAMERA_HEIGHT*SCALE
        );
        this._shadowCamera.rotation.x = Math.PI / 2; // get the camera to look up
        this._shadowGroup.add(this._shadowCamera);

        // like MeshDepthMaterial, but goes from black to transparent
        this._depthMaterial = new THREE.MeshDepthMaterial();
        this._depthMaterial.userData.darkness = {value: SHADOW_DARKNESS};
        this._depthMaterial.onBeforeCompile = ( shader ) => {
            shader.uniforms.darkness = this._depthMaterial.userData.darkness;
            shader.fragmentShader = /* glsl */`
						uniform float darkness;
						${shader.fragmentShader.replace(
                'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
                'gl_FragColor = vec4( 0.0, 0.01, 0.04, ( 1.0 - fragCoordZ ) * darkness );'
            )}
					`;
        };

        this._depthMaterial.depthTest = false;
        this._depthMaterial.depthWrite = false;

        this._horizontalBlurMaterial = new THREE.ShaderMaterial(HorizontalBlurShader);
        this._horizontalBlurMaterial.depthTest = false;

        this._verticalBlurMaterial = new THREE.ShaderMaterial(VerticalBlurShader);
        this._verticalBlurMaterial.depthTest = false;
    }

    _blurShadow( amount ) {
        this._blurPlane.visible = true;

        // blur horizontally and draw in the renderTargetBlur
        this._blurPlane.material = this._horizontalBlurMaterial;
        this._blurPlane.material.uniforms.tDiffuse.value = this._renderTarget.texture;
        this._horizontalBlurMaterial.uniforms.h.value = amount * 1 / 256;

        this._renderer.setRenderTarget(this._renderTargetBlur);
        this._renderer.render(this._blurPlane, this._shadowCamera);

        // blur vertically and draw in the main renderTarget
        this._blurPlane.material = this._verticalBlurMaterial;
        this._blurPlane.material.uniforms.tDiffuse.value = this._renderTargetBlur.texture;
        this._verticalBlurMaterial.uniforms.v.value = amount * 1 / 256;

        this._renderer.setRenderTarget(this._renderTarget);
        this.renderer.render(this._blurPlane, this._shadowCamera);

        this._blurPlane.visible = false;
    }

    _setupMaterials() {
        /**
         * @type {Texture}
         * @private
         */
        this._grassMap = this._textureLoader.load('/sitings/assets/textures/grass-map.jpg');
        this._grassMap.wrapS = THREE.RepeatWrapping;
        this._grassMap.wrapT = THREE.RepeatWrapping;
        this._grassMap.repeat.set( 5/SCALE, 5/SCALE );

        this._grassMaterial = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            color: 0x78a337,
            emissive: 0x000000,
            specular: 0x222222,
            vertexColors: false,
            flatShading: false,
            shininess: 20,
        });

        const handleColorChange = (color) => {
            return function ( value ) {
                if ( typeof value === 'string' ) {
                    value = value.replace( '#', '0x' );
                }
                color.setHex( value );
            };
        };

        /*
        const data = {
            color: this._grassMaterial.color.getHex(),
            emissive: this._grassMaterial.emissive.getHex(),
            specular: this._grassMaterial.specular.getHex(),
            map: null
        };

        const grassFolder = this._gui.addFolder( 'Grass Material' );
        grassFolder.addColor( data, 'color' ).onChange( handleColorChange( this._grassMaterial.color ) );
        grassFolder.addColor( data, 'emissive' ).onChange( handleColorChange( this._grassMaterial.emissive ) );
        grassFolder.addColor( data, 'specular' ).onChange( handleColorChange( this._grassMaterial.specular ) );
        grassFolder.add( this._grassMaterial, 'shininess', 0, 100 );
        grassFolder.add( this._grassMaterial, 'wireframe' );
        */

        this._crustMaterial = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            // color: 0x65532d,
            // color: 0x8d7e47,
            color: 0xfefefe,
            emissive: 0x444444,
            specular: 0x999999,
            vertexColors: false,
            flatShading: false,
            shininess: 10,
            // map: this._dirtMap,
        });

        this._wallMap = this._textureLoader.load('/sitings/assets/textures/wall-texture.png');
        this._wallMap.wrapS = THREE.RepeatWrapping;
        this._wallMap.wrapT = THREE.RepeatWrapping;
        this._wallMap.repeat.set(50/SCALE, 50/SCALE);
        this._wallMap.rotation = Math.PI / 2;

        this._wallMaterial = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            color: 0x777777,
            emissive: 0x080808,
            specular: 0x333333,
            vertexColors: false,
            flatShading: false,
            shininess: 15,
            map: this._wallMap,
            // We want to offset the Retaining Wall texture to the front in case it intersects with the grass / dirt
            polygonOffset: true,
            polygonOffsetFactor: -TEXTURE_OFFSET,
        });

        /**
         * @type {Texture}
         * @private
         */
        this._dirtMap = this._textureLoader.load('/sitings/assets/textures/dirt-texture.jpg');
        this._dirtMap.wrapS = THREE.RepeatWrapping;
        this._dirtMap.wrapT = THREE.RepeatWrapping;
        this._dirtMap.repeat.set( 5/SCALE, 5/SCALE );

        this._dirtMaterial = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            color: 0x8d7e47,
            emissive: 0x000000,
            specular: 0x222222,
            vertexColors: false,
            flatShading: false,
            shininess: 15,
            map: this._dirtMap,
            // We want to offset the Cut & Fill area in case it intersects with the crust:
            polygonOffset: true,
            polygonOffsetFactor: TEXTURE_OFFSET,
        });

        this._batterMaterial = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            color: 0xffffff,
            emissive: 0x080808,
            specular: 0x333333,
            vertexColors: false,
            flatShading: false,
            shininess: 10,
            map: this._dirtMap,
            // We want to offset the Cut & Fill area in case it intersects with the crust:
            polygonOffset: true,
            polygonOffsetFactor: TEXTURE_OFFSET,
        });

        const data2 = {
            color: this._dirtMaterial.color.getHex(),
            emissive: this._dirtMaterial.emissive.getHex(),
            specular: this._dirtMaterial.specular.getHex(),
            map: null
        };

        const dirtFolder = this._gui.addFolder( 'Ground' );
        dirtFolder.addColor( data2, 'color' ).onChange( handleColorChange( this._dirtMaterial.color ) );
        dirtFolder.addColor( data2, 'emissive' ).onChange( handleColorChange( this._dirtMaterial.emissive ) );
        dirtFolder.addColor( data2, 'specular' ).onChange( handleColorChange( this._dirtMaterial.specular ) );
        dirtFolder.add( this._dirtMaterial, 'shininess', 0, 100 );
        dirtFolder.add( this._dirtMaterial, 'wireframe' );

        /**
         * @type {MeshPhongMaterial}
         * @private
         */
        this._slabMaterial = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            color: 0x888888,
            // color: 0xFF0000,
            emissive: 0x000000,
            specular: 0x000000,
            vertexColors: false,
            flatShading: false,
            shininess: 0,
            // wireframe: true,
        });

        /**
         * @type {MeshPhongMaterial}
         * @private
         */
        this._cutMaterial = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            color: 0xFFDEDE,
            emissive: 0x000000,
            specular: 0x000000,
            vertexColors: false,
            flatShading: false,
            shininess: 0,
            opacity: 0.25,
            transparent: true,
        });

        /**
         * @type {MeshPhongMaterial}
         * @private
         */
        this._bottomMaterial = new THREE.MeshPhongMaterial( {
            side: THREE.FrontSide,
            color: 0xfefefe,
            emissive: 0x444444,
            specular: 0x999999,
            vertexColors: false,
            flatShading: false,
            shininess: 10,
        });

        /**
         * @type {MeshPhongMaterial}
         * @private
         */
        this._drivewayMaterial = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            color: 0xA0A0A0,
            // color: 0xFF0000,
            emissive: 0x111111,
            specular: 0x000000,
            vertexColors: false,
            flatShading: false,
            shininess: 0,
            // offset the driveway so it doesn't intersect with the crust
            polygonOffset: true,
            polygonOffsetFactor: TEXTURE_OFFSET,
            // wireframe: true,
        });

        const slabFolder = this._gui.addFolder( 'Slab' );
        slabFolder.add( this._slabMaterial, 'wireframe' );

        /**
         * @type {MeshLineMaterial}
         * @private
         */
        this._solidLineMaterial = null;

        /**
         * @type {MeshLineMaterial}
         * @private
         */
        this._fallLineMaterial = null;
    }

    /**
     * @returns {MeshLineMaterial}
     */
    get solidLineMaterial() {
        if (!this._solidLineMaterial) {
            this._solidLineMaterial = new MeshLineMaterial({
                color: new THREE.Color(0xFFFFFF),
                dashArray: 0.1,
                dashRatio: 1 / 3,
                side: THREE.DoubleSide,
                lineWidth: 0.05 * SCALE,
                resolution: this._screenSize,
                // We want to offset the Outline so that when it overlaps the lot surface, it is shown in front of it
                polygonOffset: true,
                polygonOffsetFactor: -2 * TEXTURE_OFFSET,
            });
        }

        return this._solidLineMaterial;
    }

    /**
     * @returns {MeshLineMaterial}
     */
    get fallLineMaterial() {
        if (!this._fallLineMaterial) {
            this._fallLineMaterial = new MeshLineMaterial({
                color: new THREE.Color(0xFFFFFF),
                dashArray: 0.05,
                dashRatio: 0.4,
                side: THREE.DoubleSide,
                lineWidth: 0.02 * SCALE,
                resolution: this._screenSize,
                opacity: 0.75,
                transparent: true,
            });
        }

        return this._fallLineMaterial;
    }

    /**
     * @private
     * @UNUSED
     */
    _setupGUI() {
        return;
        const cameraFolder = this._gui.addFolder('Camera');
        cameraFolder.add(this._camera.position, 'x', 0, 10 * SCALE);
        cameraFolder.add(this._camera.position, 'y', 0, 10 * SCALE);
        cameraFolder.add(this._camera.position, 'z', -10 * SCALE, 10 * SCALE);

        const ambientFolder = this._gui.addFolder('Ambient');
        ambientFolder.add(this._ambientLight, 'intensity', 0, 5);
        const ambient = {color: 0x404040};
        ambientFolder.addColor(ambient, 'color').onChange(() => this._ambientLight.color.set(ambient.color));

        const dirFolder = this._gui.addFolder('Directional');
        dirFolder.add(this._directionalLight, 'intensity', 0, 5);
        const dir = {color:0x888888};
        dirFolder.addColor(dir, 'color').onChange(() => this._directionalLight.color.set(dir.color));
        dirFolder.add(this._directionalLight.position, 'x', -4000, 4000);
        dirFolder.add(this._directionalLight.position, 'y', -4000, 4000);
        dirFolder.add(this._directionalLight.position, 'z', -4000, 4000);
    }
}

const HorizontalBlurShader = {

    uniforms: {
        'tDiffuse': { value: null },
        'h': { value: SCALE / 512.0 }
    },

    vertexShader: /* glsl */`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

    fragmentShader: /* glsl */`
		uniform sampler2D tDiffuse;
		uniform float h;

		varying vec2 vUv;

		void main() {
			vec4 sum = vec4( 0.0 );

			sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;
			sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
			sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;

			gl_FragColor = sum;
		}`
};

const VerticalBlurShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'v': { value: SCALE / 512.0 }
    },

    vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

    fragmentShader: /* glsl */`
		uniform sampler2D tDiffuse;
		uniform float v;
		varying vec2 vUv;

		void main() {
			vec4 sum = vec4( 0.0 );

			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;

			gl_FragColor = sum;
		}`
};