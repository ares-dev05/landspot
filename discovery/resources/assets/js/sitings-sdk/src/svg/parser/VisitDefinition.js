
export default class VisitDefinition
{
    /**
     * @param node {Node}
     * @param onComplete {Function}
     * @constructor
     */
	constructor(node, onComplete = null){
        /**
         * @type {Element}
         */
		this.node = node;

        /**
         * @type {Function}
         */
		this.onComplete = onComplete;
	}
}