import FallLineModel from './FallLineModel';
import Geom from '../../../../utils/Geom';
import ChangeDispatcher from '../../../../events/ChangeDispatcher';
import Point from '../../../../geom/Point';
import EventBase from '../../../../events/EventBase';

export default class FallTopologyModel extends ChangeDispatcher {

	// step in meters
	static get STEP() {return 0.5;}

	// maximum fall that we calculate for a lot
	static get FALL_LIMIT() { return 10; }

	/**
	 * @param levels {LotTopographyModel}
	 */
	constructor (levels) {
		super();

		/**
		 * @type {number}
		 * @public
		 */
		this.FALL = 0.2;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._enabled = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._invalidated = false;

		/**
		 * @type {LotTopographyModel}
		 * @private
		 */
		this._levels = levels;
		this._levels.addEventListener(EventBase.CHANGE, this.levelsChanged, this);

		/**
		 * @type {FallLineModel[]}
		 * @private
		 */
		this._lines	= [];
	}

	/**
	 * @return {FallLineModel[]}
	 * @public
	 */
	get lines() {
		return this._lines;
	}

	/**
	 * @return {LotTopographyModel}
	 * @private
	 */
	get levels() {
		return this._levels;
	}

	/**
	 * @return {SurfaceInterpolator}
	 * @private
	 */
	get interpolator() {
		return this._levels ? this._levels.interpolator : null;
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	get enabled() {
		return this._enabled;
	}

	/**
	 * @param v {boolean}
	 * @public
	 */
	set enabled(v) {
		if (this._enabled !== v) {
			this._enabled = v;

			if (this._enabled) {
				this.invalidate();
			}	else {
				this.onChange();
			}
		}
	}

	/**
	 * @param e {EventBase}
	 * @public
	 */
	levelsChanged(e) {
		this.invalidate();
	}

	/**
	 * @private
	 */
	invalidate() {
		if (!this._invalidated) {
			this._invalidated = true;
			// @TODO: optimize
			this.revalidate();
		}
	}

	/**
	 * @private
	 */
	revalidate() {
		this._invalidated = false;

		if (this.enabled && this.levels && this.interpolator) {
			this.recalculate();
		}	else {
			this._lines = [];
		}

		this.onChange();
	}

	/**
	 * Expand this fall line into the lot from its start point
	 * @private
	 */
	recalculate() {
		// reset the existing lines
		this._lines = [];

		// Independently add fall lines for each area of the interpolated surface
		this.interpolator.subSurfaces.forEach(
			surface => this.processSection(surface.points, surface.interpolator)
		);

		// start processing the fall lines one after the other;
		this._lines.forEach(line => this.processFallLine(line));
	}

	/**
	 * @param points {LevelPointModel[]}
	 * @param interpolator {AbstractInterpolator}
	 * @INFO: in this implementation, the algorithm doesn't work if it has multiple hills/valleys.
	 */
	processSection(points, interpolator) {
		if (!points || !points.length) {
			return;
		}

		// 1. search for the highest & lowest points in the lot
		/**
		 * @type LevelPointModel
		 */
		let highLevel;
		/**
		 * @type LevelPointModel
		 */
		let lowLevel;
		let direction;

		points.forEach(point => {
			if (!highLevel || point.height > highLevel.height)
				highLevel = point;
			if (!lowLevel || point.height < lowLevel.height)
				lowLevel = point;
		});

		const high = highLevel.position.clone();
		let low =  lowLevel.position.clone();

		// calculate the fall direction in the lot (i.e. the slope between the lowest and highest points)
		direction = Geom.angleBetween(low.x, low.y, high.x, high.y);

		// calculate the normal to the left plane ( -90 degrees from the fall slope )
		direction -= Math.PI / 2;

		// 2. determine the highest and lowest height values that we will look for
		const fallHigh = Math.floor(highLevel.height / this.FALL) * this.FALL;
		const fallLow = Math.ceil(lowLevel.height / this.FALL) * this.FALL;
		let count = Math.round((fallHigh-fallLow) / this.FALL);

		// cases when we don't calculate
		if (fallHigh - fallLow > FallTopologyModel.FALL_LIMIT) {
			return;
		}

		let level;
		let k;
		let kstep;
		let bits;
		let search;

		// 3. determine the points on the fall line where all the fall levels are
		for (level = fallLow; count >= 0; --count, level += this.FALL) {
			// do a binary search between low, high to find the start of the [level] fall line
			for (k = 0, kstep = 1, bits = 16; bits > 0; --bits, kstep /= 2) {
				if (k + kstep <= 1) {
					// interpolate between low and high with the k+kstep factor
					search = interpolator.interpolatePoint(
						Geom.interpolatePoints(low, high, k + kstep)
					);

					// as we're searching from low -> high, we don't want to go over level
					if (search <= level) {
						k += kstep;

						// check if we are in 'near' distance of the level (1mm), and halt the search if we are
						if (Geom.close(search, level))
							break;
					}
				}
			}

			// the fall line starts at K distance between (low, high);
			// calculate the new low point at that position, and add the fall line
			low = Geom.interpolatePoints(low, high, k);
			this._lines.push(new FallLineModel(level, low.clone(), direction, interpolator));
		}
	}

	/**
	 * @param line {FallLineModel}
	 * @private
	 */
	processFallLine(line) {
		// process both half-planes
		this.processFallLinePlane(line, true);
		this.processFallLinePlane(line, false);
	}

	/**
	 * process the fall line in one of the half-planes that are defined by the lot's fall slope
	 * @param line {FallLineModel} the fall line to process
	 * @param leftPlane {boolean} indicates if we're in the left (true) or right (false) plane of the drop slope
	 */
	processFallLinePlane(line, leftPlane) {
		let direction;
		let C;
		let low;
		let high;
		let arcHalf;
		let k;
		let kStep;
		let bits;
		let search;
		let searchLimit = 1024;

		direction = leftPlane ? line.leftDirection : line.rightDirection;
		C = line.start;
		arcHalf = Geom.deg2rad(75);	// for a total of 150 degrees

		// at each step of the search, we move [STEP] away from the centre to find the point where
		// the height is line.level, in a 180 degree arc. We look at the ends of the arc to determine how the land climbs along
		// it, and do a binary search between the low and high ends of the arc. After we find each new position, we update the direction
		// to indicate how we moved from the old one. We stop AFTER we added the first point that's outside the lot,
		do {
			// look at the two ends of the 180 degree arc with the center at [centre] to see how the land slopes across it
			if (line.interpolator.interpolatePoint(this.arc(C, direction - arcHalf)) < line.interpolator.interpolatePoint(this.arc(C, direction + arcHalf))) {
				// the angle with the low level is to the left
				low = direction - arcHalf;
				high = direction + arcHalf;
			}	else {
				// the angle with the low level is to the right
				low = direction + arcHalf;
				high = direction - arcHalf;
			}

			// do a binary search between the [low, high] angles to determine where on the arc the next point of the fall line is
			// searching on 8 bits gives us an accuracy of 2*arcHalf / 256 = ~0.7 degrees; at a 0.5m step, this is an accuracy of about 6cm
			for (k = 0, kStep = 1, bits = 8; bits > 0 && kStep > 0; --bits, kStep = Math.min(kStep / 2, 1 - k)) {
				if (k + kStep <= 1) {
					// interpolate between low and high with the k+kstep factor
					search = line.interpolator.interpolatePoint(
						this.arc(C, Geom.getWeighedValue(low, high, k + kStep))
					);

					// as we're searching from low -> high, we don't want to go over level
					if (search <= line.level) {
						k += kStep;

						// check if we are in 'near' distance of the level (1mm), and halt the search if we are
						//if ( Geom.near( search, line.level ) )
						//	break;
					}
				}
			}

			// we found the new position in the fall line; add it, and update both the centre and the search direction
			direction = Geom.getWeighedValue(low, high, k);
			C = this.arc(C, direction);

			line.addHalfPlanePoint(C.clone(), leftPlane);

			// halt the execution when we get to a point that's outside of the lot
		}	while (line.interpolator.containsPoint(C) && --searchLimit > 0);
	}

	arc(C, angle) {
		return new Point(C.x + Math.cos(angle) * FallTopologyModel.STEP, C.y + Math.sin(angle) * FallTopologyModel.STEP);
	}

	/**
	 * recordState
	 * returns a data structure containing all the parameters representing this object's state
	 * @public
	 */
	recordState() {
		return {isEnabled: this._enabled};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state) {
		this.enabled = !!(state && state.isEnabled);
	}
}