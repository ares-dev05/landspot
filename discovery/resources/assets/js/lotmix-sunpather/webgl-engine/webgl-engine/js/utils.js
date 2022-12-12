import { Group, Mesh, Object3D } from 'three';

const deepClone = object => {
  let newObject;

  if (object.isMesh) newObject = new Mesh(object.geometry, object.material);
  else if (object.isGroup) newObject = new Group();
  else if (object.isObject3D) newObject = new Object3D();

  newObject.name = object.name;

  newObject.up.copy(object.up);

  newObject.position.copy(object.position);
  newObject.quaternion.copy(object.quaternion);
  newObject.scale.copy(object.scale);

  newObject.matrix.copy(object.matrix);
  newObject.matrixWorld.copy(object.matrixWorld);

  newObject.matrixAutoUpdate = object.matrixAutoUpdate;
  newObject.matrixWorldNeedsUpdate = object.matrixWorldNeedsUpdate;

  newObject.visible = object.visible;

  newObject.castShadow = object.castShadow;
  newObject.receiveShadow = object.receiveShadow;

  newObject.frustumCulled = object.frustumCulled;

  newObject.userData = JSON.parse(JSON.stringify(object.userData));

  if (newObject.isMesh) {
    if (object.material.length) {
      newObject.material = object.material.map(material => material.clone());
    } else {
      newObject.material = object.material.clone();
    }

    newObject.geometry = object.geometry.clone();
  }

  newObject.children.slice().forEach(child => newObject.remove(child));
  object.children.forEach(child => newObject.add(deepClone(child)));

  return newObject;
};

export { deepClone };
