let _instanceKey = Symbol();
let FRAME_RATE	 = 30;

export default class ProcessExecutor
{
	static get instance() {
		if (!this[_instanceKey]) {
			 this[_instanceKey] = new ProcessExecutor(_instanceKey);
		}

		return this[_instanceKey];
	}

	constructor(constructKey)
	{
		if (_instanceKey!==constructKey)
			throw new Error("The class 'ProcessExecutor' is a singleton.");

        /**
         * @type {Array} Vector.<Process>
         * @private
         */
        this._processes = [];

        /**
         * @type {Number}
         * @private
         */
        this._percentFrameProcessingTime = 0.25;

        /**
         * @type {boolean}
         * @private
         */
        this._running = false;

        /**
         * @type {number}
         * @private
         */
        this._intervalId = -1;
    }

    /**
     * @return {Number}
     */
	get percentFrameProcessingTime() { return this._percentFrameProcessingTime; }

    /**
     * @param value {Number}
     */
	set percentFrameProcessingTime(value) { this._percentFrameProcessingTime = value; }

    /**
     * @return {Number}
     */
	get internalFrameProcessingTime() { return 1000 / FRAME_RATE * this._percentFrameProcessingTime; }

    /**
     * @return {number}
     */
	static get frameDuration() { return 1000 / FRAME_RATE; }

    /**
	 * start execution
     */
	start() {
		if (this._running===false && this._processes.length>0) {
			this._running = true;
			let _this = this;
			this._intervalId = setInterval(
				function() {_this.processFrameHandler();},
				ProcessExecutor.frameDuration
			);
		}
	}

    /**
	 * stop execution
     */
	stop() {
		if (this._running===true && this._processes.length===0) {
			this._running = false;
			clearInterval(this._intervalId);
		}
	}

    /**
     * @param process {Process}
     */
	addProcess(process) {
		this._processes.push(process);
		this.start();
	}

    /**
     * @param process {Process}
     * @return {boolean}
     */
	containsProcess(process) { return this._processes.indexOf(process) !== -1; }

    /**
     * @param process {Process}
     */
	removeProcess(process) {
		let index = this._processes.indexOf(process);

		if (index>=0) {
            this._processes.splice(index, 1);
			this.stop();
        }
	}

    /**
	 * process for one frame
     */
	processFrameHandler() {
		let timePerProcess = this.internalFrameProcessingTime / this._processes.length;

		for (let i=this._processes.length-1; i>=0; --i) {
            ProcessExecutor.executeProcess(this._processes[i], timePerProcess);
		}
	}

    /**
     * @param process {Process}
     * @param duration {Number}
     */
	static executeProcess(process, duration) {
		let endTime = (new Date().getTime()) + duration;

        /**
         * @type {Function}
         */
		do {
			if(process.executeLoop()===true)
				break;
		}	while((new Date().getTime()) < endTime);
	}
}