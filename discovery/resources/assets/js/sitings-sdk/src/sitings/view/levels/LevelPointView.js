import ModelEvent from '../../events/ModelEvent';
import LotPointView from '../lot/LotPointView';
import HighlightableModel from '../../../events/HighlightableModel';
import ThemeManager from '../theme/ThemeManager';
import Render from '../../global/Render';


export default class LevelPointView extends LotPointView {

	/**
	 * @param model {LevelPointModel}
	 * @param selectMode {boolean}
	 */
	constructor (model, selectMode=false) {
		super(model.position, false);

		/**
		 * @type {LevelPointModel}
		 * @private
		 */
		this._levelModel = model;
		this._levelModel.addEventListener(ModelEvent.DELETE, this.modelDeleted, this);
		this._levelModel.addEventListener(HighlightableModel.HIGHLIGHT_CHANGE, this.highlightChange, this);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._selectMode = selectMode;
	}

	/**
	 * @returns {LevelPointModel}
	 */
	get levelModel() { return this._levelModel; }

	/**
	 * @param p {LevelPointModel}
	 */
	set levelModel(p) { this._levelModel=p; }

	/**
	 * @returns {boolean}
	 */
	get selectMode() { return this._selectMode; }

	/**
	 * @param m {boolean}
	 */
	set selectMode(m) { this._selectMode=m; }

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @protected
	 */
	mouseDown(event)
	{
		if (!this._selectMode) {
			super.mouseDown(event);
		}
	}

	/**
	 * @private
	 */
	highlightChange() {
		this._drawControl();
	}

	/**
	 * @returns {number}
	 */
	get currentColor() {
		// return (this.levelModel && this.levelModel.highlight) ? ThemeManager.i.theme.getColor('color_class_2') : 0x222222;
		return (this.levelModel && this.levelModel.highlight) ? 0xc94742 : 0x0a75f0;
	}

	/**
	 * @returns {number}
	 */
	get currentAlpha() {
		return (this.levelModel && this.levelModel.highlight) ? 0.6 : 0.4;
	}

	/**
	 * @protected
	 */
	_drawControl() {
		const graphics = this._graphics;
		graphics.clear();

		// draw the hit area
		graphics.beginFill(this.currentColor, this.currentAlpha);
		graphics.drawCircle(0,0,13);
		graphics.endFill();

		let sz = 5;
		graphics.lineStyle(1.5, (this.levelModel && this.levelModel.highlight) ? 0xFFFFFF : this.currentColor, .7, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		graphics.moveTo(-sz, -sz);
		graphics.lineTo(sz, sz);
		graphics.moveTo(-sz, sz);
		graphics.lineTo(sz, -sz);
	}

	/**
	 * @param e {EventBase}
	 */
	modelDeleted(e) {
		if (this._levelModel) {
			this._levelModel.removeEventListener(ModelEvent.DELETE, this.modelDeleted, this);
			this._levelModel.removeEventListener(HighlightableModel.HIGHLIGHT_CHANGE, this.highlightChange, this);
			this._levelModel = null;
		}

		super.modelDeleted(e);
	}
}