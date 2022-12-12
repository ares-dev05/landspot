import Viewer from '../viewer/viewer';
import AppBuilder from './AppBuilder/AppBuilder';

import * as THREE from 'three';

window['THREE'] = THREE;

export default class App {
  constructor(container, api) {
    this.viewer = new Viewer(container);
    this.appBuilder = new AppBuilder(this.viewer, api);
    this.appBuilder.init();
    this.currInteriorDot = 'dot1';

    this.api = api;

    this.view = 'isometric';
    this.isMirrored = false;

    window.m = this.revertHouse.bind(this);
  }

  changeView(view, dot) {
    this.view = view;

    if (view === 'isometric') {
      this.viewer.camera.position.set(-13, 11, 60);
      this.viewer.controls.target.multiplyScalar(0);
      this.viewer.controls.maxDistance = 70;
      this.viewer.controls.minDistance = 20;
      this.viewer.controls.maxPolarAngle = 1.4;
      this.viewer.controls.rotateSpeed = 1;
      this.viewer.camera.near = 3;
      this.viewer.camera.far = 200;
      this.viewer.controls.enableZoom = true;
      this.viewer.camera.updateProjectionMatrix();

      this.viewChanged = false;
    } else {
      if (this.api.lot === 'small') {
        setTimeout(() => {
          this.viewer.camera.position.multiplyScalar(0.78);
          this.viewer.controls.target.multiplyScalar(0.78);
          this.viewer.controls.enabled = true;
        }, 1);
      }

      this.viewChanged = true;

      const wrapperRotation = this.viewer.scene.getObjectByName('Wrapper')
        .rotation;

      this.currInteriorDot = dot;

      if (this.isMirrored) {
        this.viewer.model.updateMatrixWorld(true);

        const dot_camera = this.viewer.model.getObjectByName(
          `${this.currInteriorDot}_camera`,
        );
        this.viewer.camera.position.copy(
          this.viewer.model.localToWorld(dot_camera.position.clone()),
        );

        const dot_target = this.viewer.model.getObjectByName(
          `${this.currInteriorDot}_target`,
        );
        this.viewer.controls.target.copy(
          this.viewer.model.localToWorld(dot_target.position.clone()),
        );
      } else {
        this.viewer.camera.position.applyEuler(wrapperRotation);
        this.viewer.controls.target.applyEuler(wrapperRotation);
      }

      this.revertHouse();
      this.revertHouse();

      this.viewer.controls.maxDistance = 70;
      this.viewer.controls.minDistance = 0;
      this.viewer.controls.maxPolarAngle = 1.7;
      this.viewer.controls.rotateSpeed = 0.5;
      this.viewer.controls.enableZoom = false;
      this.viewer.camera.near = 0.1;
      this.viewer.camera.far = 30;
      this.viewer.camera.updateProjectionMatrix();
    }
  }

  revertHouse() {
    this.isMirrored = !this.isMirrored;

    this.viewer.model.position.x *= -1;
    this.viewer.model.scale.x *= -1;

    if (this.view === 'interior') {
      this.viewer.model.updateMatrixWorld(true);

      const dot_camera = this.viewer.model.getObjectByName(
        `${this.currInteriorDot}_camera`,
      );
      this.viewer.camera.position.copy(
        this.viewer.model.localToWorld(dot_camera.position.clone()),
      );

      const dot_target = this.viewer.model.getObjectByName(
        `${this.currInteriorDot}_target`,
      );
      this.viewer.controls.target.copy(
        this.viewer.model.localToWorld(dot_target.position.clone()),
      );
    }
  }

  resize() {
    this.viewer.onWindowResize();
  }
}
