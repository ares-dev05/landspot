import RangeMetaData from './RangeMetaData';

const OPTION_META_SEPARATOR = 'BEGIN_OPTION_DESCRIPTION';
const VERBOSE = false;

export default class CatalogueMetaData {

	/**
	 * @param data {string}
	 */
	constructor(data) {
		/**
		 * @type RangeMetaData[]
		 * @private
		 */
		this._ranges = [];

		// Read the supplied metadata
		let facadeMetaRegion=true, pieces, range, house;

		const rows = data.split('\n');

		for (let i=0; i<rows.length; ++i) {
			const row = rows[i];

			if (row && row.length) {
				if (row.indexOf(OPTION_META_SEPARATOR)>=0) {
					/**
					 * 0. we are entering the option meta-data region
					 */
					facadeMetaRegion = false;
				}	else if (facadeMetaRegion) {
					/**
					 * 1. parse the facade meta data
					 */

					// break this row. Example:
					// vhe,Clendonvale,3948,Allegra Lux Q1,Double Storey,Arcadia|ARC,Broadway|BWY,Classique|CLQ,Florence|FLO,Hayman|HMN,Imperial|IMP,Lancaster|LAC,Patterson|PTS,Piermont|PIE,Sandpiper|SDP,Ultima|ULT,Urban|URB
					pieces = row.split(',');
					if (pieces && pieces.length>4) {
						range = this.fetchRangeType(pieces[1], pieces[4]);
						if (!range) {
							range = new RangeMetaData(pieces[0], pieces[1], pieces[4]);
							this._ranges.push(range);

							VERBOSE && console.log('	> created new range '+pieces[1]+'/'+pieces[4]);
						}

						range.addHouse(pieces);
					}
				}	else {
					/**
					 * 2. parse the option meta data
					 * @INFO: an option meta info can span multiple rows; we only parse _the first row_ as we are
					 * 	  not interested in, or able to display multiple rows
					 */

					// break this row. Example:
					// vhe;Henley Collection;Sahara 34;3902;3902HPG002;Provide Sahara 34- Leisure Option
					// STC;RANGE_NAME		;H_NAME   ;H_ID;OP_NAME   ;OP_DESC
					pieces = row.split(';');
					if (pieces && pieces.length>5 && this.isHenleyStateCode(pieces[0])) {
						this.fetchRanges(pieces[1]).forEach(function(range){
							// try to fetch the house by both ID and name
							house = range.fetchHouse(pieces[2]) ||
								range.fetchHouseById(pieces[3]);

							try {
								if (house) {
									house.addOptionName(pieces[4], pieces[5]);
								}
							}	catch(e) {
								VERBOSE && console.log('failed while parsing row ['+row+']');
								VERBOSE && console.log('pieces= '+pieces[4]+' --- '+pieces[5]);
								VERBOSE && console.log(e);
							}
						});
					}
				}
			}
		}
	}

	/**
	 * @private
	 * @param piece {string}
	 */
	isHenleyStateCode(piece)
	{
		return ['vhe', 'qhe'].indexOf(piece.toLowerCase()) >= 0;
	}

	/**
	 * @param name {string}
	 * @returns {boolean}
	 */
	hasRange(name)
	{
		return this.fetchRanges(name).length > 0;
	}

	/**
	 * @param rangeName {string}
	 * @param houseName {string}
	 * @returns {boolean}
	 */
	rangeHasHouse(rangeName, houseName)
	{
		// console.log("rangeHasHouse("+rangeName+", "+houseName+"): "+(fetchHouse(rangeName, houseName) != null));
		return this.fetchHouse(rangeName, houseName) !== null;
	}

	/**
	 * @param name {string}
	 * @param type {string}
	 * @returns {RangeMetaData|null}
	 */
	fetchRangeType(name, type)
	{
		const  result = this._ranges.find(range => range.isNamed(name) && range.isType(type));
		return result !== undefined ? result : null;
	}

	/**
	 * @param name {string} the range name we're looking for
	 * @return RangeMetaData[] a list of all the ranges with the indicated name (and possibly different types)
	 */
	fetchRanges(name)
	{
		return this._ranges.filter(range => range.isNamed(name));
	}

	/**
	 * @param rangeName {string}
	 * @param houseName {string}
	 * @return HouseMetaData the house data if it exists within the indicated range
	 */
	fetchHouse(rangeName, houseName)
	{
		const  range = this.fetchRanges(rangeName).find(range => range.hasHouse(houseName));
		return range !== undefined ? range.fetchHouse(houseName) : null;
	}

	/**
	 * @INFO: The new Henley TXT format contains some invalid binary characters in the
	 *		BEGIN_OPTION_DESCRIPTION line, which break the XML decoding; This this cleanup
	 *		function, we are replacing the BEGIN_OPTION_DESCRIPTION line with a new one that
	 *		doesn't contain the invalid characters
	 * @UNUSED: We're doing the cleanup in PHP instead
	public static function cleanupCompanyData(raw:String):String
	{
		trace("trying to cleanup data: "+raw.length);
		var start:int, end:int;
		if ((start=raw.indexOf(OPTION_META_SEPARATOR))>=0) {
			trace(" found option meta section, at "+start);
			// find the next newline
			end = raw.indexOf('\n', start);
			trace(" option meta line ends at "+end);
			raw = raw.substr(0, start) + OPTION_META_SEPARATOR + "\n" + raw.substr(start);
		}

		trace("completed cleanup: "+raw.length);

		return raw;
	}
	 */
}