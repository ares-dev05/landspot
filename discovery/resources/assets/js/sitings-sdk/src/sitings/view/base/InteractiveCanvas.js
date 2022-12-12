import * as PIXI from 'pixi.js';
import Utils from "../../../utils/Utils";
import EventBase from "../../../events/EventBase";
import InteractiveCanvasEvent from "../../events/InteractiveCanvasEvent";
import ViewSettings from "../../global/ViewSettings";

/**
 * @type {{x: boolean, y: boolean}[]}
 * @private
const _coordDefinitions = [
	{	x:false,
		y:false
	},
	{	x:true,
		y:false
	},
	{	x:true,
		y:true
	},
	{	x:false,
		y:true
	}
];
 */

export default class InteractiveCanvas extends PIXI.Sprite {

	static get DISABLED() { return -1; }
	static get DRAG    () { return  0; }
	static get SELECT  () { return  1; }

	/**
	 * @param width
	 * @param height
	 * @param interaction {PIXI.interaction.InteractionManager}
	 */
	constructor(width, height, interaction=null)
	{
		super();

		/**
		 * @type {number}
		 * @private
		 */
		this._mode			= 0;

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._hitArea		=	new PIXI.Sprite();
		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._hitGraphics	=	Utils.colorBlock(0, width, height);
		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._selectionView	= new PIXI.Sprite();

		/**
		 * @type {Array}
		 * @private
		 */
		this._selection		= null;
		/**
		 * @type {Array}
		 * @private
		 */
		this._lines			= null;
		/**
		 * @type {Rectangle}
		 * @private
		 */
		this._rectangle		= null;

		/**
		 * @type {number}
		 * @private
		 */
		this._lastX			= 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._lastY			= 0;
		/**
		 * @type {boolean}
		 * @private
		 */
		this._didDrag		= false;

		/**
		 * @type {PIXI.interaction.InteractionManager}
		 * @private
		 */
		this._interaction	= interaction ? interaction : ViewSettings.i.interaction;

		// create the display list
		this._hitArea.addChild(this._hitGraphics);
		this._hitArea.alpha = 0;
		this._hitArea.addListener(EventBase.MOUSE_DOWN, this.mouseDown, this);
		this._hitArea.interactive = true;

		this.addChild(this._hitArea);
		this.addChild(this._selectionView);

		// disable by default
		this.mode	= InteractiveCanvas.DISABLED;
	}

	/**
	 * @param v {number}
	 */
	set mode(v)
	{
		this._mode			= v;

		this.interactive	=
		this.mouseEnabled 	=
		this.mouseChildren	= (v !== InteractiveCanvas.DISABLED);
	}

	/**
	 * @param canvas {Object}
	 */
	listenTo(canvas)
	{
		canvas.interactive = true;
		canvas.addListener(EventBase.MOUSE_DOWN, this.mouseDown, this);
	}

	/**
	 * @param w {number}
	 * @param h {number}
	 */
	resizeTo(w, h)
	{
		this._hitGraphics.clear();
		Utils.colorBlock(0, w, h, this._hitGraphics);
	}

	/**
	 * @param event {PIXI.InteractiveEvent}
	 * @private
	 */
	mouseDown(event)
	{
		this._interaction.addListener(EventBase.MOUSE_UP,		   this.mouseUp  , this);
		this._interaction.addListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp  , this);
		this._interaction.addListener(EventBase.MOUSE_MOVE,	   this.mouseMove, this);

		switch (this._mode) {
			case InteractiveCanvas.SELECT:
				// this.startSelection(event.data);
				break;

			case InteractiveCanvas.DRAG:
				this.startIDrag(event.data);
				break;

			default:
				// N/A
				break;
		}
	}

	/**
	 * @param event {PIXI.InteractiveEvent}
	 * @private
	 */
	mouseMove(event)
	{
		switch (this._mode) {
			case InteractiveCanvas.SELECT:
				// this.updateSelection(event);
				break;

			case InteractiveCanvas.DRAG:
				this.updateIDrag(event.data);
				break;

			default:
				// N/A
				break;
		}
	}

	/**
	 * @param event {PIXI.InteractiveEvent}
	 * @private
	 */
	mouseUp(event)
	{
		this._interaction.removeListener(EventBase.MOUSE_UP  , this.mouseUp  , this);
		this._interaction.removeListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp  , this);
		this._interaction.removeListener(EventBase.MOUSE_MOVE, this.mouseMove, this);

		switch (this._mode) {
			case InteractiveCanvas.SELECT:
				// this.stopSelection();
				break;

			case InteractiveCanvas.DRAG:
				this.stopIDrag(event.data);
				break;

			default:
				// N/A
				break;
		}
	}

	/**
	 * @param data {PIXI.InteractionData}
	 */
	startIDrag(data)
	{
		this._lastX		= data.global.x;
		this._lastY		= data.global.y;
		this._didDrag	= false;
	}

	/**
	 * @param data {PIXI.InteractionData}
	 */
	updateIDrag(data)
	{
		if (data.global.x !== this._lastX || data.global.y !== this._lastY ) {
			this.emit(
				InteractiveCanvasEvent.DRAG,
				new InteractiveCanvasEvent(
					InteractiveCanvasEvent.DRAG,
					data.global.x-this._lastX,
					data.global.y-this._lastY
				)
			);

			this._lastX	  = data.global.x;
			this._lastY	  = data.global.y;
			this._didDrag = true;
		}
	}

	/**
	 * @param data {PIXI.InteractionData}
	 */
	stopIDrag(data)
	{
		this._lastX = this._lastY = 0;

		if (!this._didDrag) {
			this.emit(
				InteractiveCanvasEvent.CLICK,
				new InteractiveCanvasEvent(
					InteractiveCanvasEvent.CLICK,
					data.global.x,
					data.global.y
				)
			);
		}
	}

	/*
	/// Selection functionality
	private function startSelection():void
	{
		Utils.removeChildrenOfParent( _selectionView );

		_selection	= [
			new OutlinePoint( mouseX, mouseY ),
			new OutlinePoint( mouseX, mouseY ),
			new OutlinePoint( mouseX, mouseY ),
			new OutlinePoint( mouseX, mouseY )
		];

		_lines		= [ ];

		for (var i:int=0; i<_selection.length; ++i)
		{
			_lines.push(
				_selectionView.addChild(
					new OutlineEdge(
						_selection[i],
						_selection[(i+1)%_selection.length]
					)
				)
			);
		}
	}
	private function updateSelection():void
	{
		var cx:Number = Math.min( Math.max( 0, mouseX ), _hitArea.width  );
		var cy:Number = Math.min( Math.max( 0, mouseY ), _hitArea.height );

		for (var i:int=0; i<_selection.length; ++i)
		{
			if ( _coordDefinitions[i].x )
				_selection[i].x = cx;
			if ( _coordDefinitions[i].y )
				_selection[i].y = cy;
		}
	}
	private function stopSelection():void
	{
		_rectangle	= new Rectangle(
			Math.min( _selection[0].x , _selection[1].x ),
			Math.min( _selection[0].y , _selection[3].y ),
			Math.abs( _selection[1].x - _selection[0].x ),
			Math.abs( _selection[3].y - _selection[0].y )
		);

		emit(EventBase.SELECT, new EventBase( EventBase.SELECT ) );
	}

	public function get selectionRect():Rectangle
	{
		return _rectangle;
	}
	 */
}