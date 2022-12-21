import SVGElement from "../display/base/SVGElement";

export default class SVGUtil {

    /**
     * @param xmlString {string}
     * @return {string}
     */
	static processXMLEntities(xmlString) {
		while(true){
			let entity = /<!ENTITY\s+(\w*)\s+"((?:.|\s)*?)"\s*>/.exec(xmlString);
			if(entity == null)
				break;

			let entityDeclaration = entity[0];
            let entityName = entity[1];
            let entityValue = entity[2];

			xmlString = xmlString.replace(entityDeclaration, "");
			xmlString = xmlString.replace(new RegExp("&"+entityName+";", "g"), entityValue);
		}

		return xmlString;
	}

	/**
     * @param s {string}
     * @return {string}
     */
	static processSpecialXMLEntities(s) {
        let _specialXMLEntities = {
            "quot": "\"",
            "amp" : "&",
            "apos" : "'",
            "lt" : "<",
            "gt" : ">",
            "nbsp" : " "
        };

        for(let entityName in _specialXMLEntities)
			s = s.replace(new RegExp("\\&"+entityName+";", "g"), _specialXMLEntities[entityName]);

		return s;
	}

    /**
     * @param s {string}
     * @return {string}
     */
	static replaceCharacterReferences(s) {
        s.match(/&#x[A-Fa-f0-9]+;/g).forEach(function(hexaUnicode){
            let hexaValue = /&#x([A-Fa-f0-9]+);/.exec(hexaUnicode)[1];
            s = s.replace(new RegExp("\\&#x"+hexaValue+";", "g"), String.fromCharCode(parseInt("0x"+hexaValue)));
		});

        s.match(/&#[0-9]+;/g).forEach(function(decimalUnicode){
            let decimalValue = /&#([0-9]+);/.exec(decimalUnicode)[1];
            s = s.replace(new RegExp("\\&#"+decimalValue+";", "g"), String.fromCharCode(parseInt(decimalValue)));
		});

		return s;
	}

    /**
     * @param s {string}
     * @return {string}
     */
	static prepareXMLText(s)
	{
		s = SVGUtil.processSpecialXMLEntities(s);
		s = s.replace(/(?:[ ]+(\n|\r)+[ ]*)|(?:[ ]*(\n|\r)+[ ]+)/g, " "); //Replace lines breaks with whitespace around it by single whitespace
		s = s.replace(/\n|\r|\t/g, ""); //Remove remaining line breaks and tabs
		return s;
	}

	/**
	 * @param obj {*}
	 * @return {boolean}
	 */
	static isSVGElement(obj)
	{
		try {
			return obj !== null && typeof obj.isType === 'function' && obj.isType(SVGElement.CLASS_TYPE);
		}	catch (e) {}

		return false;
	}
}