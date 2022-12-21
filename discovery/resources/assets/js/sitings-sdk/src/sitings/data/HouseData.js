import Logger from '../../utils/Logger';
import HouseSvgParser from '../../data/HouseSvgParser';

export default class HouseData extends HouseSvgParser {

	/**
	 * @param id {string|null}
	 * @param name {string|null}
	 * @param houseData {string|null}
	 * @param areaData {string|null}
	 * @param asynchronous {boolean}
	 * @param rangeLogo {string}
	 */
	constructor(id, name=null, houseData=null, areaData=null, asynchronous=false, rangeLogo=null)
	{
		super(id, name, houseData, areaData, asynchronous);

		this._rangeLogo = rangeLogo;
	}

	/**
	 * @returns {string}
	 */
	get rangeLogo() { return this._rangeLogo; }

	/**
	 * @returns {boolean}
	 */
	get isXMLFormat() { return false; }

	throwAreaDataParseError()
	{
		Logger.log('\t\tError parsing area data on house name='+this.name+', id='+this.id);
	}

	getFacade(id)
	{
		for (let i=0; i<this.facades.length; ++i) {
			if (this.facades[i].id === id ) {
				return this.facades[i];
			}
		}

		return null;
	}

	getOption(id)
	{
		for (let i=0; i<this.options.length; ++i) {
			if (this.options[i].id === id) {
				return this.options[i];
			}
		}

		return null;
	}

	onAfterParse()
	{
		Logger.log('\tHouse.Parsing '+this.name, this._metaData);
		super.onAfterParse();
	}
}
