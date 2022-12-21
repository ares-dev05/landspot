import {
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  WebGLRenderer,
  Raycaster,
  Vector2,
} from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

window.texturedMode = true;

export default class Viewer {
  constructor(container) {
    this.container = container;
    window.viewer = this;
    this.init();
  }

  initGUI() {
  }

  init() {
    console.trace('qwe');
    // CAMERA
    window.camera = this.camera = new PerspectiveCamera(
      45,
      this.container.offsetWidth / this.container.offsetHeight,
      2,
      200,
    );
    this.camera.position.set(-13, 11, 60);

    // SCENE
    window.scene = this.scene = new Scene();

    this.scene.add(this.camera);

    // RENDERER
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(
      this.container.offsetWidth,
      this.container.offsetHeight,
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // LIGHT
    this.initLight();

    // CONTROLS
    this.initControls();

    // ADD ON SCENE
    this.container.appendChild(this.renderer.domElement);

    // RESIZE EVENT
    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.animate();
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.maxPolarAngle = 1.4;
    this.controls.maxDistance = 70;
    this.controls.minDistance = 20;
  }

  initLight() {
    this.light = new HemisphereLight(0xaaaaaa, 0x888888, 0.2); // 0.2
    this.light.name = 'HemisphereLight';
    this.scene.add(this.light);

    this.directionalLight = new DirectionalLight(0xffffff, 0.3);
    this.directionalLight.name = 'DirectionalLight';
    this.directionalLight.position.set(0, 80, 0);

    // Shadow Part
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera = this.camera.clone();
    this.directionalLight.shadow.mapSize.width = 4096;
    this.directionalLight.shadow.mapSize.height = 4096;
    this.directionalLight.shadow.camera.near = 1; // default
    this.directionalLight.shadow.camera.far = 1000; // default
    this.directionalLight.shadow.bias = -0.0007;

    // Shadow Part - END
    this.directionalLightNoShadow = new DirectionalLight(0xffffff, 0.05);
    this.directionalLightNoShadow.name = 'DirectionalLightNoShadow';
    this.directionalLightNoShadow.position.set(0, 90, 0);

    const sunSphere = new Mesh(
      new SphereGeometry(1, 32, 32),
      new MeshBasicMaterial({ color: new Color(0xffc824) }),
    );
    sunSphere.name = 'sunSphere';
    sunSphere.position.set(0, 19.5, 0);
    this.sunSphere = sunSphere;
    this.directionalLight.add(sunSphere);

    this.sunPlane = new Object3D();
    this.sunPlane.name = 'sunPlane';
    this.sunPlane.rotation.z = 0.8;
    this.sunPlane.add(sunSphere);
    this.sunPlane.add(this.directionalLight);
    this.sunPlane.add(this.directionalLightNoShadow);

    this.scene.add(this.sunPlane);
  }

  addInteriorPL() {
    this.IntPLightList = new Object3D();
    this.IntPLightList.position.set(-2.44, 0, -3.08);
    this.IntPLightList.name = 'Interior PL';

    let pointLight = new PointLight(0xffffff, 0.05);
    pointLight.name = 'PointLight1';
    pointLight.position.set(2.2, 1.2, -3.6);
    this.IntPLightList.add(pointLight);

    pointLight = new PointLight(0xffffff, 0.05);
    pointLight.name = 'PointLight2';
    pointLight.position.set(-2.5, 1.2, -3.6);
    this.IntPLightList.add(pointLight);

    this.model.add(this.IntPLightList);
  }

  addExteriorPL() {
    this.PLightList = new Object3D();
    this.PLightList.position.set(-2.44, 0, -3.08);
    this.PLightList.name = 'Exterior PL';

    let pointLight = new PointLight(0xffffff, 0.05);
    pointLight.name = 'PointLight1';
    pointLight.position.set(0, 2.2, -15);
    this.PLightList.add(pointLight);

    pointLight = new PointLight(0xffffff, 0.05);
    pointLight.name = 'PointLight2';
    pointLight.position.set(0, 2.2, 15);
    this.PLightList.add(pointLight);

    pointLight = new PointLight(0xffffff, 0.05);
    pointLight.name = 'PointLight3';
    pointLight.position.set(-10.5, 2.2, 0);
    this.PLightList.add(pointLight);

    pointLight = new PointLight(0xffffff, 0.05);
    pointLight.name = 'PointLight4';
    pointLight.position.set(10.5, 2.2, 0);
    this.PLightList.add(pointLight);

    this.model.add(this.PLightList);
  }

  onWindowResize() {
    this.camera.aspect =
      this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.offsetWidth,
      this.container.offsetHeight,
    );
    this.directionalLight.shadow.camera = this.camera.clone();
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate();
    });

    this.sunPlane.rotation.z = 1.59 - window.coeff;

    this.lightIntensity();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  lightIntensity() {
    if (window.coeff < 1.6) {
      this.light.intensity = 0.05 + (window.coeff / 1.6) * 0.75;
      this.directionalLight.intensity = 0.05 + (window.coeff / 1.6) * 0.35 + 0.15;
      this.directionalLightNoShadow.intensity = (window.coeff / 1.6) * 0.05;
    } else {
      const coff = window.coeff - 1.6;

      this.light.intensity = 0.8 - (coff / 1.6) * 0.75;
      this.directionalLight.intensity = 0.4 - (coff / 1.6) * 0.3 + 0.15;
      this.directionalLightNoShadow.intensity = 0.05 - (coff / 1.6) * 0.05;
    }
  }
}
