import Loader from '../../loaders/loader';

export default class AppBuilder {
  constructor(viewer, api) {
    this.viewer = viewer;
    this.loader = new Loader(api, viewer);
  }

  init() {
    this.loader.loadModel(this.viewer.scene);
  }
}
