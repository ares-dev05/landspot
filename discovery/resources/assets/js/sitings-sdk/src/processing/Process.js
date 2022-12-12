import ProcessExecutor from "./ProcessExecutor";

export default class Process
{
	static get CONTINUE() { return 0; }
	static get SKIP_FRAME() { return 1; }
	static get COMPLETE() { return 2; }

    /**
     * @param startFunction {Function}
     * @param loopFunction {Function}
     * @param completeFunction {Function}
	 * @param scope {Object}
     */
	constructor(startFunction, loopFunction, completeFunction, scope)
	{
        /**
         * @type {Function}
         * @private
         */
		this._startFunction = startFunction;

        /**
         * @type {Function}
         * @private
         */
        this._loopFunction = loopFunction;

        /**
         * @type {Function}
         * @private
         */
        this._completeFunction = completeFunction;

		/**
		 * @type {Object}
		 * @private
		 */
		this._scope = scope;

        /**
         * @type {boolean}
         * @private
         */
        this._isComplete = false;

        /**
         * @type {boolean}
         * @private
         */
        this._isRunning = false;
	}

    /**
     * @return {Function}
     */
	get loopFunction() { return this._loopFunction; }
    /**
     * @return {Function}
     */
	get completeFunction() { return this._completeFunction; }
    /**
     * @return {Function}
     */
	get startFunction() { return this._startFunction; }

    /**
     * @return {boolean}
     */
	get isComplete() { return this._isComplete; }

    /**
     * @return {boolean}
     */
	get isRunning() { return this._isRunning; }

    /**
	 * starts the process
	 * @return {void}
     */
	start() {
		if(this._isRunning)
			throw new Error("This process is already running.");

		if(this._isComplete)
			throw new Error("This process is complete.");

        this._isRunning = true;

		if(this.startFunction != null)
            this.startFunction.call(this._scope);

		ProcessExecutor.instance.addProcess(this);
	}

	execute() {
		if(this.startFunction != null)
            this.startFunction.call(this._scope);

		while(this.loopFunction.call(this._scope) !== Process.COMPLETE)
		{}

		this.complete();
	}

	stop() {
		this._isRunning = false;

		ProcessExecutor.instance.removeProcess(this);
	}

	complete() {
		this._isRunning = false;
        this._isComplete = true;

		if(this.completeFunction != null)
            this.completeFunction.call(this._scope);

		ProcessExecutor.instance.removeProcess(this);
	}

	reset() {
		if(this._isRunning)
			this.stop();

        this._isComplete = false;
	}

    /**
     * @return {Boolean} indicating if the execution should continue (false) or stop (true)
     */
	executeLoop() {
        let r = this.loopFunction.call(this._scope);
		if (r===Process.COMPLETE)
			this.complete();
		return !!r;
	}
}