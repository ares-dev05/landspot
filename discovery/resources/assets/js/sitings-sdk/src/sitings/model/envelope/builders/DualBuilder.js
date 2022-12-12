import EnvelopeSegment from '../EnvelopeSegment';
import Point from '../../../../geom/Point';
import EventBase from '../../../../events/EventBase';
import EnvelopeBuilder from './EnvelopeBuilder';
import EnvelopeSide from './EnvelopeSide';


export default class DualBuilder extends EnvelopeBuilder {
	constructor() {
		super();
		/**
		 * @type {EnvelopeSide}
		 * @private
		 */
		this._left = null;
		this.left  = new EnvelopeSide();
		/**
		 * @type {EnvelopeSide}
		 * @private
		 */
		this._right = null;
		this.right  = new EnvelopeSide();
	}

	/**
	 * @return {EnvelopeSide}
	 * @public
	 */
	get left() {
		return this._left;
	}

	/**
	 * @param v {EnvelopeSide}
	 * @public
	 */
	set left(v)
	{
		if (this._left) {
			this._left.removeEventListener(EventBase.CHANGE, this.sideChanged, this);
		}
		this._left = v;
		if (this._left) {
			this._left.addEventListener(EventBase.CHANGE, this.sideChanged, this);
		}
	}

	/**
	 * @return {EnvelopeSide}
	 * @public
	 */
	get right() {
		return this._right;
	}

	/**
	 * @param v {EnvelopeSide}
	 * @public
	 */
	set right(v)
	{
		if (this._right) {
			this._right.removeEventListener(EventBase.CHANGE, this.sideChanged, this);
		}
		this._right = v;
		if (this._right) {
			this._right.addEventListener(EventBase.CHANGE, this.sideChanged, this);
		}
	}

	/**
	 * @private
	 */
	sideChanged() {
		this.rebuild();
	}

	/**
	 * rebuild the entire envelope structure
	 */
	rebuild() {
		if (!this.envelope)
			return;

		// try to analyse the lot
		if (!this.envelope.analyseLot())
			return;

		// clear the previously-built envelope
		this.envelope.clear();

		// construct the envelope on the lot, using the determined sides' heights & slopes

		// fetch the sorted points for the left & right sides
		const lotWidth = this.envelope.lotWidth;
		const l	=  this.left.sortedPoints;
		const r	= this.right.sortedPoints;
		let level;
		let dw;	// current height level

		// make sure the distance of the two sides isn't higher than the lot width
		if ((l.length || r.length) && (this.left.width + this.right.width <= lotWidth)) {
			let current = new Point();
			let next;
			let point;
			let i;
			let maxHeight = 0;

			if (l.length) {
				maxHeight = Math.max(maxHeight, l[l.length-1].height);
			}
			if (r.length) {
				maxHeight = Math.max(maxHeight, r[r.length-1].height);
			}

			// build the left side
			level = this.envelope.leftHeight;
			// trace("building left side; starting at level: "+level);
			current.y = -level;
			for (i = 0; i<l.length; ++i) {
				point = l[i];
				// determine the current height level
				level = this.envelope.leftHeight + Math.sin(this.envelope.leftSlope) * point.width;
				next = new Point(point.width, -level - point.height);
				this.envelope.add(new EnvelopeSegment(current, next));
				current	= next;
			}

			// Step 2: create a bridge between the left & right sides
			if (r.length) {
				level = this.envelope.rightHeight + Math.sin(this.envelope.rightSlope) * r[r.length-1].width;
				point = r[r.length-1];
				next = new Point(lotWidth - point.width, -level - point.height);
			}	else {
				level = this.envelope.rightHeight;
				next = new Point(lotWidth, -level - maxHeight);
				this.envelope.add(new EnvelopeSegment(current, next));
				current	= next;
			}

			// continue to the right side
			for (i = r.length - 1; i >= 0; --i) {
				dw = point.width - r[i].width;
				point = r[i];
				// determine the current height level of the ground at the current position
				level -= Math.sin(this.envelope.rightSlope) * dw;
				// trace("current level: "+level);
				next = new Point(lotWidth-point.width, -level - point.height);
				this.envelope.add(new EnvelopeSegment(current, next));
				current	= next;
			}

			// link right side to the ground
			this.envelope.add(new EnvelopeSegment(current, new Point(lotWidth, -this.envelope.rightHeight)));
		}

		// build the ground structure as a part of the envelope - this is though not included in the collision detection
		this.buildGroundStructure();

		this.onChange();
	}

	/**
	 * rebuild the ground without recalculating any of the lot parameters; this is used when the cut & fill are edited,
	 * effectively changing the pad level
	 */
	rebuildGround() {
		if (!this.envelope || !this.envelope.floorPosition)
			return;

		// clear the previously-built envelope
		this.envelope.clearGround();

		// re-create the ground structure
		this.buildGroundStructure();

		this.onChange();
	}

	/**
	 * build the ground structure using the topography that we calculated in the floor position model
	 */
	buildGroundStructure() {
		if (!this.envelope || !this.envelope.floorPosition)
			return;

		let current;
		let next;
		const topology = this.envelope.floorPosition;

		/** @Piece ground base level -> left side */
		next = new Point(0, -this.envelope.leftHeight);
		if (next.y !== 0) {
			this.envelope.add(new EnvelopeSegment(new Point(), next, true));
		}

		/** @Piece left side -> left pad ground level */
		current	= next;
		next = new Point(topology.padLeftDistance, -topology.groundLeftLevel);
		this.envelope.add(new EnvelopeSegment(current, next, true));

		/** @Piece left pad ground level -> pad level */
		current	= next;
		next = new Point(current.x, -topology.padLevel);
		this.envelope.add(new EnvelopeSegment(
			// segment points + is ground
			current, next, true,
			// is a retaining wall if the rise / drop is higher than the retaining wall threshold
			Math.abs(current.y - next.y) > topology.retainingWallThreshold
		));

		/** @Piece pad surface left->right */
		current	= next;
		next = new Point(topology.lotWidth - topology.padRightDistance, current.y);
		this.envelope.add(new EnvelopeSegment(current, next, true));

		/** @Piece pad level -> right pad ground level */
		current	= next;
		next = new Point(current.x, -topology.groundRightLevel);
		this.envelope.add(new EnvelopeSegment(
			// segment points + is ground
			current, next, true,
			// is a retaining wall if the rise / drop is higher than the retaining wall threshold
			Math.abs(current.y - next.y) > topology.retainingWallThreshold
		));

		/** @Piece right pad ground level -> right side */
		current	= next;
		next = new Point(topology.lotWidth, -this.envelope.rightHeight);
		this.envelope.add(new EnvelopeSegment(current, next, true));

		/** @Piece right side -> ground level */
		if (next.y !== 0) {
			current	= next;
			next = new Point(current.x, 0);
			this.envelope.add(new EnvelopeSegment(current, next, true));
		}

		/** @Piece: base level */
		this.envelope.add(new EnvelopeSegment(new Point(topology.lotWidth), new Point(), true));

		/** @Piece: land continuation */
		current	= new Point(topology.padLeftDistance, -topology.groundLeftLevel);
		next = new Point(topology.lotWidth - topology.padRightDistance, -topology.groundRightLevel);
		this.envelope.add(new EnvelopeSegment(current, next, true, false, true));
	}
}