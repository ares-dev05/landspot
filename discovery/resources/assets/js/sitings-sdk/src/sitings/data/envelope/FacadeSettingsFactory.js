 import AccountMgr from '../AccountMgr';
 import Builder from '../Builder';

export default class FacadeSettingsFactory {

	/**
	 * @return {[{text: string, value: number}]}
	 * @public
	 */
	static get slabHeights() {
		switch (AccountMgr.i.builder) {
			case Builder.BURBANK:
				// M-360/H-435/P-435/P-475/P-550/P-585/P-735
				return [
					// {text: "NO SLAB", value: 0},
					{text: 'M-360', value: 0.36},
					//{text: 'H-435', value: 0.435},
					{text: 'P-435', value: 0.435},
					{text: 'P-475', value: 0.475},
					{text: 'P-550', value: 0.55},
					{text: 'P-585', value: 0.585},
					{text: 'P-735', value: 0.735},
				];

			default:
				// @TODO: add heights for all builders
				return [
					// {text: "NO SLAB", value: 0},
					{text: '360mm', value: 0.36},
					//{text: 'H-435', value: 0.435},
					{text: '435mm', value: 0.435},
					{text: '475mm', value: 0.475},
					{text: '550mm', value: 0.55},
					{text: '585mm', value: 0.585},
					{text: '735mm', value: 0.735},
				];
		}
	}

	static get garageDropdowns() {
		// @TODO -> per-builder
		return [
			{text: '126mm', value: 0.126},
			{text: '212mm', value: 0.212},
			{text: '298mm', value: 0.298},
			{text: '384mm', value: 0.384},
			{text: '470mm', value: 0.47},
			{text: '556mm', value: 0.556},
		];
	}

	static get vegScrapeLevels() {
		return [
			{text: '0mm', value: 0.0},
			{text: '50mm', value: 0.05},
			{text: '55mm', value: 0.055},
			{text: '60mm', value: 0.06},
			{text: '65mm', value: 0.065},
			{text: '70mm', value: 0.07},
			{text: '75mm', value: 0.075},
			{text: '80mm', value: 0.08},
			{text: '85mm', value: 0.085},
			{text: '90mm', value: 0.09},
			{text: '95mm', value: 0.095},
			{text: '100mm', value: 0.1},
		];
	}

	/**
	 * @return {[{text: string, value: number}]}
	 * @public
	 */
	static get ceilingHeights() {
		switch (AccountMgr.i.builder) {
			// 2440, 2590 and 2740
			case Builder.BURBANK:
				return [
					{text: '2440mm', value: 0},
					{text: '2590mm', value: 0.15},
					{text: '2740mm', value: 0.30}
				];

			default:
				return [
					{text: '2440mm', value: 0},
					{text: '2590mm', value: 0.15},
					{text: '2740mm', value: 0.30}
				];
		}
	}
}