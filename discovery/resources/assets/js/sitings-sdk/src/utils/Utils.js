import * as PIXI from 'pixi.js';

export default class Utils
{
	/**
	 * @param value {*}
	 * @return {string}
	 */
	static colorCode(value) {
		if (isNaN(value)) {
			return value;
		}	else {
			return '#' + Number(value).toString(16).padStart(6, '0');
		}
	}

	/**
	 * zero-division safe percentage / progress calculation
	 * @param l {number}
	 * @param t {number}
	 * @return {number}
	 */
	static percentage(l, t) { return t > 0 ? l / t : 0; }

	/**
	 * @param v {number}
	 * @returns {string}
	 */
	static fx1(v) { return Utils.trim(v, 1) + "";}
    /**
     * @param v {number}
     * @return {string}
     */
	static fx2(v) { return Utils.trim( v, 2 ) + ""; }
    /**
     * @param v {number}
     * @return {string}
     */
    static fx3(v) { return Utils.trim( v, 3 ) + ""; }
    /**
     * @param v {number}
     * @return {string}
     */
    static fx4(v) { return Utils.trim( v, 4 ) + ""; }
    /**
     * @param v {number}
     * @return {string}
     */
    static fx5(v) { return Utils.trim( v, 5 ) + ""; }

    /**
     * @param v {number}
     * @return {string}
     */
    static fxd(v) { return Utils.fx3(v); }

    /**
	 * fixed to [decimals] decimal places
     * @param number {number}
	 * @param decimals {number}
     * @return {number}
     */
    static trim( number, decimals=9) {
		return Number(number.toFixed(decimals));
	}

    /**
     * fixed to 8 decimal places
     * @param number {number}
     * @return {number}
     */
    static trim8(number) {
		return Number(number.toFixed(8));
	}

	/**
	 * @param value {number}
	 * @param min {number}
	 * @param max {number}
	 * @returns {number}
	 */
	static minmax(value, min, max) {
    	return Math.max(min, Math.min(value, max));
	}

	/**
	 * Process the svg layer id into a readable name, by removing prefixes and unwanted characters
	 *
	 * @param v {string}
	 * @return string
	 */
	static svgIdToName(v)
	{
		return v.toUpperCase()
				.replace(/X5F_/gi,'')
				.replace('FACADE_', '')
				.replace('OPTION_', '')
				.replace(/_/gi, ' ');
	}

    /**
     * @param input {string}
     * @return {string}
     */
	static sentenceCase(input)
	{
		if (input && input.length>=1) {
			return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
		}
		return "";
	}

    /**
     * @param object {*}
     * @param paramName {string}
     * @param defaultValue {*}
     * @return {*}
     */
	static param(object, paramName, defaultValue=null)
	{
		return object && object.hasOwnProperty(paramName) ? object[paramName] : defaultValue;
	}

    /**
     * @param rgbCode {string}
     * @return {number}
     */
	static color(rgbCode) {
		return Number( "0x"+rgbCode );
	}

	/**
	 * Alters the position of an object so that its coordinates as viewed from the global coordinate space are integers
	 *
	 * @param object {PIXI.DisplayObject}
	 */
	static fixIntegerPosition(object)
	{
		if (!object || !object.parent) {
			return;
		}

		// Round the coordinates in the global space
		const global = object.getGlobalPosition();
		global.x = Math.round(global.x);
		global.y = Math.round(global.y);

		// Update the local coordinates
		const local = object.parent.toLocal(global);
		object.x = local.x;
		object.y = local.y;
	}

	/**
	 * @param color {number}
	 * @param width {number}
	 * @param height {number}
	 * @param block {PIXI.Graphics}
	 * @param x {number}
	 * @param y {number}
	 * @param alpha {number}
	 * @return {PIXI.Graphics}
	 */
	static colorBlock(color, width, height, block=null, x=0, y=0, alpha=1)
	{
		block = block || new PIXI.Graphics();
		block.beginFill(color, alpha);
		block.drawRect(x,y,width,height);
		block.endFill();

		return block;
	}

	/*
	public static function outlinedColorBlock(
		color:uint,
		lineColor:uint,
		width:Number,
		height:Number,
		block:Shape=null,
		startx:Number=0,
		starty:Number=0,
		alpha:Number=1
	):Shape
	{
		if ( !block ) block = new Shape();
		block.graphics.lineStyle( 1, lineColor, 1, false, LineScaleMode.NONE, CapsStyle.SQUARE, JointStyle.MITER );
		block.graphics.beginFill(color, alpha);
		block.graphics.drawRect(startx,starty,width,height);
		block.graphics.endFill();
		return block;
	}

	public static function makeButton(
		obj:Sprite,
		cb:Function,
		mouseChildren:Boolean=false
	):void	{
		obj.mouseEnabled = true;
		obj.mouseChildren = mouseChildren;
		obj.buttonMode = true;
		obj.addEventListener(MouseEvent.CLICK,cb);
	}
	*/

	/**
	 * @return {number}
	 */
	static now() {
		return (new Date()).getTime();
	}

    /**
     * @param date {Date}
	 * @param separator {string}
     * @return {string}
     */
	static formatDate(date=null, separator=".")
	{
		if (!date) {
			date = new Date();
		}

		return [
			Utils.addLeadZeros(date.getMonth()+1),
			Utils.addLeadZeros(date.getDate()),
			date.getFullYear()
		].join(separator);
	}

    /**
     * @param seconds {number}
     * @return {string}
     */
	static formatTime(seconds)
	{
		return Utils.addLeadZeros(Math.floor(seconds/60))+":"+Utils.addLeadZeros(seconds%60);
	}

    /**
     * @param v {number}
     * @param positions {number}
     * @return {string}
     */
	static addLeadZeros(v, positions=2)
	{
		let v_str = v+"";
		while ( v_str.length < positions ) v_str = "0"+v_str;
		return v_str;
	}

	/**
	 * @param obj {*}
	 */
	static removeParentOfChild(obj)
	{
		try {
			if (obj && obj.parent) {
				obj.parent.removeChild(obj);
			}
		}	catch (e) {
		}
	}

	/**
	 * @param obj {*}
	 */
	static removeChildrenOfParent(obj)
	{
		try {
			obj.removeChildren();
		}	catch (e) {
			// no-op
		}
	}

	/*
	public static function scaleToFit(
		obj:DisplayObject,
		w:Number, h:Number
	):void {
		obj.scaleX = obj.scaleY = 1;
		obj.scaleX = obj.scaleY = Math.min( w/obj.width, h/obj.height );
	}
	public static function centre(
		obj:DisplayObject,
		w:Number, h:Number
	):void {
		var bounds:Rectangle = obj.getBounds(obj);

		obj.x = ( w - obj.width  ) * .5 - bounds.x;
		obj.y = ( h - obj.height ) * .5 - bounds.y;
	}
	public static function scaleAndCenter(
		obj:DisplayObject,
		w:Number, h:Number
	):void {
		if ( obj.width==0 || obj.height==0 ) return;

		scaleToFit(obj, w, h);
		centre(obj, w, h);
	}
	*/
}