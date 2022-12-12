export default class Logger {

	static get DEBUG() { return true; }

	static log(msg) {
		console.log(msg);
	}

	static logStack(msg) {
		console.trace(msg);
	}

	static throwMsg(msg)
	{
		if (Logger.DEBUG) {
			throw new Error(msg);
		}	else {
			Logger.logStack(msg);
		}
	}
}