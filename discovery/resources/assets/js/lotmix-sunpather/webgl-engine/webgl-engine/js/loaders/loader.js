import HouseModel from '../../assets/model/house_v2.glb';
import {
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Group,
  Object3D,
  Raycaster,
  Vector2,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as HousesPotitions from '../interiorPositions';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

const setUpColors = [
  {
    color: 0xc9c9c9,
    metalness: 0.1,
    roughness: 0.45,
  },
  {
    color: 0xffffff,
    metalness: 0,
    roughness: 0.6,
    emissive: 0x353535,
  },
  {
    color: 0xf8f8f8,
    metalness: 0.2,
    roughness: 0.5,
    emissive: 0x767676,
  },
  {
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.6,
  },
  {
    color: 0xffffff,
    metalness: 0,
    roughness: 0.8,
  },
  {
    // 5
    color: 0xd9d9d9,
    metalness: 0.2,
    roughness: 0.6,
  },
  {
    // 6
    color: 0xbcbcbc,
    metalness: 0.3,
    roughness: 0.8,
  },
  {
    // 7
    color: 0x585858,
    metalness: 0.7,
    roughness: 0.7,
  },
  {
    // 8
    color: 0x585858,
    metalness: 0.7,
    roughness: 0.7,
  },
];

export default class Loader {
  constructor(api, viewer) {
    this.api = api;
    this.viewer = viewer;
  }

  loadModel() {
    const group = new Group();
    group.name = 'Wrapper';
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    // dracoLoader.setDecoderPath(
    //   'http://www.peacedonkey.com/demo/sunpather/draco/',
    // );
    dracoLoader.setDecoderPath('./draco/');

    loader.setDRACOLoader(dracoLoader);

    loader.load(
      // house,
      HouseModel,
      gltfModel => {
        const cylinder = new Mesh(
          new CylinderGeometry(18.5, 18.5, 1, 60),
          new MeshStandardMaterial({
            color: 0xb7b7b7,
            roughness: 1,
            metalness: 0.6,
            emissive : 0x595959
          }),
        );
        cylinder.name = 'Platform';
        cylinder.receiveShadow = true;
        cylinder.position.y = -0.62;
        group.add(cylinder);

        this.api.setUploaded(true);

        const model = gltfModel.scene;
        model.position.set(1.8, 0, 2.1);

        if (this.api.lot === 'small') {
          model.scale.set(0.8, 0.8, 0.8);
        } else if (this.api.lot === 'large') {
          model.scale.set(1.15, 1.15, 1.15);
        } else if (this.api.lot === '3d-envelope') {
          // TODO
        }

        window.objList = [cylinder];
        const raycaster = new Raycaster();

        if (this.viewer) {
          document.addEventListener('click', event => {
            if (event.target.tagName !== 'CANVAS') return;

            const mouse = new Vector2();

            mouse.x =
                (event.layerX / this.viewer.renderer.domElement.offsetWidth) * 2 -
                1;
            mouse.y =
                -(event.layerY / this.viewer.renderer.domElement.offsetHeight) * 2 +
                1;

            raycaster.setFromCamera(mouse, this.viewer.camera);
            const intersectsScene = raycaster.intersectObjects(window.objList);

            if (intersectsScene[0]) {

              if (this.element) this.element.remove();
              this.element = document.createElement("div");
              this.element.className = 'name-mesh'
              this.element.innerHTML = intersectsScene[0].object.name;
              document.getElementById('lotmix-sunpather').appendChild(this.element)
            }
          });
        }

        model.traverse(el => {
          if (el.isMesh) {
            window.objList.push(el);
            el.visible = true;

            el.material.roughness = 0.8;
            el.material.metalness = 0.2;

            if (!el.name.toLowerCase().includes('roof')) {
              el.castShadow = true;
              el.receiveShadow = true;
            }

            if (el.name.toLowerCase().includes('roof.00')) {
              el.material = new MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.5,
                roughness: 0.8,
                emissive: 0x222222,
              });
            }

            if (el.name === 'Floor') {
              el.material = new MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.3,
                roughness: 0.6,
                emissive: 0x222222,
              });
            }

            if (el.name === 'Wall_main_inside002') {
              el.material = new MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.3,
                roughness: 0.6,
              });
            }

            if (el.name === 'Door_5_Garage') {
              el.castShadow = false;
              el.receiveShadow = false;
              el.material = new MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.4,
                roughness: 0.5,
                emissive: 0x222222,
              });
            }

          if (el.name === 'roof_holder')
            el.material = new MeshStandardMaterial({
              color: 0xc9c9c9,
              roughness: 0.1,
              metalness: 0.45,
              emissive : 0x000000
            });
          }
          if (el.name === 'ground') {
            el.material = new MeshStandardMaterial({
              color: 0xabcbcbc,
              roughness: 1,
              metalness: 0.6,
              emissive : 0x000000
            });

            el.position.z = 1;
          }
          //---------------------------------
          if (el.name === 'Roof_export') {
            el.material = new MeshStandardMaterial({
              color: 0x575957,
              metalness: 0.7,
              roughness: 0.7,
              emissive : 0x474747
            });
          }
          if (el.name === 'roof_holder') {
            el.material = new MeshStandardMaterial(setUpColors[0]);
          }
          if (el.name === 'Door_5_Garage') {
            el.material = new MeshStandardMaterial({
              color: 0xc9c9c9,
              metalness: 0.1,
              roughness: 0.45,
              emissive : 0x000000
            });
          }
          if (el.name === 'Roof_copper_two_side_mat') {
            el.material = new MeshStandardMaterial({
              color: 0xf8f8f8,
              metalness: 0.2,
              roughness: 0.5,
              emissive : 0x767676
            });
          }
          if (
            el.name === 'Wall_main_outside' 
          ) {
            el.material = new MeshStandardMaterial({
              color: 0xcffffff,
              metalness: 0,
              roughness: 0.6,
              emissive : 0x353535
            });
          }
          if(el.name.toLowerCase().includes('wall_garage')){
            el.material = new MeshStandardMaterial({
              color: 0xcffffff,
              metalness: 0,
              roughness: 0.6,
              emissive : 0x353535
            });
          }
          if (
            el.name === 'Window_Panel' ||
            el.name === 'Door005_Door002'
          ) {
            el.material = new MeshStandardMaterial(setUpColors[2]);
          }
          if(el.name === 'Window_border'){
            el.material = new MeshStandardMaterial({
              color: 0xcf8f8f8,
              metalness: 0.2,
              roughness: 0.5,
              emissive : 0x767676
            });
          }
          if(el.name === 'Door_3_main'){
            el.material = new MeshStandardMaterial({
              color: 0xcf8f8f8,
              metalness: 0.2,
              roughness: 0.5,
              emissive : 0x767676
            });
          }
          if (el.name === 'Wall_main_inside002') {
            el.material = new MeshStandardMaterial(setUpColors[3]);
          }
          if (el.name === 'AIUE_V01_004_sockets') {
            el.material = new MeshStandardMaterial(setUpColors[4]);
          }
          if (el.name === 'Molding_floor') {
            el.material = new MeshStandardMaterial(setUpColors[4]);
          }
          if (el.name === 'AIUE_V01_001_Dishes') {
            el.material = new MeshStandardMaterial(setUpColors[6]);
          }
          if (el.name === 'AIUE_V01_004_woodenchair_002001') {
            el.material = new MeshStandardMaterial(setUpColors[4]);
          }
          if (el.name === 'Floor') {
            el.material = new MeshStandardMaterial(setUpColors[5]);
          }
          if (el.name === 'Slab') {
            el.material = new MeshStandardMaterial(setUpColors[5]);
          }
          if (el.name === 'AIUE_V01_001_Sofa3') {
            el.material = new MeshStandardMaterial(setUpColors[8]);
          }
        });

        if (this.api.direction === 'North-East') {
          group.rotation.y = -Math.PI / 4;
        } else if (this.api.direction === 'East') {
          group.rotation.y = -Math.PI / 2;
        } else if (this.api.direction === 'South-East') {
          group.rotation.y = (-Math.PI / 4) * 3;
        } else if (this.api.direction === 'South') {
          group.rotation.y = -Math.PI;
        } else if (this.api.direction === 'North-West') {
          group.rotation.y = Math.PI / 4;
        } else if (this.api.direction === 'West') {
          group.rotation.y = Math.PI / 2;
        } else if (this.api.direction === 'South-West') {
          group.rotation.y = (Math.PI / 4) * 3;
        }

        model.name = 'HouseModel';
        if (this.viewer) {
          this.viewer.model = model;
        }

        group.add(model);
        model.updateMatrixWorld();

        for (const dot in HousesPotitions.house_1) {
          const sphere_camera = new Object3D();
          sphere_camera.name = `${dot}_camera`;
          sphere_camera.position.copy(
            model.worldToLocal(HousesPotitions.house_1[dot].position.clone()),
          );
          model.add(sphere_camera);

          const sphere_target = new Object3D();
          sphere_target.name = `${dot}_target`;
          sphere_target.position.copy(
            model.worldToLocal(HousesPotitions.house_1[dot].target.clone()),
          );
          model.add(sphere_target);
        }

        if (this.viewer) {
          this.viewer.addExteriorPL();
          this.viewer.addInteriorPL();

          this.viewer.scene.add(group);
        }
      },
      xhr => {
        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      error => {
        console.log('An error happened');
      },
    );
  }
}
