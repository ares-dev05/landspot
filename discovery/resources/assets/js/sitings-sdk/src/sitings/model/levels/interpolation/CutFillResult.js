export default class CutFillResult {

	/**
	 * @param average {number}
	 * @param low {number}
	 * @param high {number}
	 * @param surface {number}
	 */
	constructor (average = 0, low = 0, high = 0, surface=0) {
		/**
		 * @type {number}
		 * @private
		 */
		this._average = average;

		/**
		 * @type {number}
		 * @private
		 */
		this._low     = low;

		/**
		 * @type {number}
		 * @private
		 */
		this._high    = high;

		/**
		 * @type {number}
		 * @private
		 */
		this._surface = surface;

		/**
		 * @type {number}
		 * @private
		 */
		this._cutRatio = 0.5;

		/**
		 * @type {number}
		 * @private
		 */
		this._level = 0;

		/**
		 * @type {LevelPointModel[]}
		 * @private
		 */
		this._samplePoints = [];
	}

	/**
	 * @return {number}
	 */
	get average() { return this._average; }

	/**
	 * @param v {number}
	 */
	set average(v) { this._average=v; }

	/**
	 * @return {number}
	 */
	get low() { return this._low; }

	/**
	 * @param v {number}
	 */
	set low(v) { this._low=v; }

	/**
	 * Base level in the lot
	 * @return {number}
	 */
	get base() { return this._low; }

	/**
	 * @return {number}
	 */
	get high() { return this._high; }

	/**
	 * @param v {number}
	 */
	set high(v) { this._high=v; }

	/**
	 * @return {number}
	 */
	get totalFall() { return this._high - this._low; }

	/**
	 * @return {number}
	 */
	get cutRatio() { return this._cutRatio; }

	/**
	 * @return {number}
	 */
	get level() { return this._level; }

	/**
	 * @return {LevelPointModel[]}
	 */
	get samplePoints() { return this._samplePoints; }

	/**
	 * @return {LevelPointModel[]}
	 */
	get cutSamplePoints() {
		return this._samplePoints.filter(
			point => point.height >= this.level
		);
	}

	/**
	 * @return {number}
	 */
	get surface() { return this._surface; }

	/**
	 * @param value {number}
	 */
	set surface(value) { this._surface=value; }

	/**
	 * Calculate the volume differential for the given surface (in cubic meters)
	 * @return {number}
	 */
	get volumeDifference() { return (this.average - this.level) * this.surface; }

	/**
	 * @param cutRatio
	 */
	setRatio(cutRatio) {
		this._cutRatio = cutRatio;
		// Update the construction level based on the given cut ratio
		this._level = this.base + 2 * (this.average - this.base) * ( 1 - cutRatio );
	}

	logData() {
		console.log('Cut Fill Results: ', {
			base: this.base,
			high: this.high,
			average: this.average,
			cut: this.cutRatio,
			level: this.level,
			volume: this.volumeDifference,
			surface: this.surface
		}, );
	}
}