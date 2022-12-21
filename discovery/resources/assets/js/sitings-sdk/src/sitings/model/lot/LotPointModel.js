import Point from '../../../geom/Point';
import ModelEvent from '../../events/ModelEvent';
import EventBase from '../../../events/EventBase';

export default class LotPointModel extends Point {

	static get DISPLACE() 		{ return 'opm.Displace'; }
	static get MOVE_COMPLETE()	{ return 'opm.moveComplete'; }

	/**
	 * @param x {number}
	 * @param y {number}
	 * @param context {*}
	 */
	constructor( x=0, y=0, context=null)
	{
		super(x, y, context);
		/**
		 * @type {number}
		 * @public
		 */
		this.numParents = 0;
	}

	/**
	 * trigger the deletion of this point from the lot
	 */
	deletePoint()
	{
		if (this.hasEventListener(ModelEvent.DELETE)) {
			this.dispatchEvent(new ModelEvent(ModelEvent.DELETE, this));
		}
	}

	/**
	 * called from the controller/view when a drag action completes
	 */
	moveComplete()
	{
		if (this.hasEventListener(LotPointModel.MOVE_COMPLETE)) {
			this.dispatchEvent(new EventBase(LotPointModel.MOVE_COMPLETE, this));
		}
	}
}