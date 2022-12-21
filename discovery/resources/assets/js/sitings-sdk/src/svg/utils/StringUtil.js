export default class StringUtil
{
	/**
	*	Removes whitespace from the front and the end of the specified
	*	string.
	*
	*	@param input {string} The string whose beginning and ending whitespace will
	*	will be removed.
	*	@param char {string}
	*
	*	@return {string} A string with whitespace removed from the begining and end
	*/
	static trim(input, char=" ")
	{
		return StringUtil.ltrim(StringUtil.rtrim(input, char), char);
	}

	/**
	*	Removes whitespace from the front of the specified string.
	*
	*	@param input {string} The string whose beginning whitespace will will be removed.
	*	@param char {string}
	*
	*	@return {string }A string with whitespace removed from the begining
	*/
	static ltrim(input, char=" ")
	{
		for(let i = 0; i < input.length; i++)
		{
			if(input.charAt(i) !== char)
			{
				return input.substring(i);
			}
		}
		return "";
	}

	/**
	*	Removes whitespace from the end of the specified string.
	*
	*	@param input {string} The string whose ending whitespace will will be removed.
	*	@param char {string}
	*
	*	@return {string} A string with whitespace removed from the end
	*/
	static rtrim(input, char=" ")
	{
		for(let i = input.length; i > 0; i--)
		{
			if(input.charAt(i-1) !== char)
			{
				return input.substring(0, i);
			}
		}

		return "";
	}

	/**
	*	Removes all instances of the remove string in the input string.
	*
	*	@param input {string} The string that will be checked for instances of remove
	*	string
	*
	*	@param remove {string} The string that will be removed from the input string.
	*
	*	@return {string} A string with the remove string removed.
	*/
	static remove(input, remove)
	{
		return StringUtil.replace(input, remove, "");
	}

	/**
	*	Replaces all instances of the replace string in the input string
	*	with the replaceWith string.
	*
	*	@param input {string} The string that instances of replace string will be
	*	replaces with removeWith string.
	*
	*	@param replace {string} The string that will be replaced by instances of
	*	the replaceWith string.
	*
	*	@param replaceWith {string} The string that will replace instances of replace
	*	string.
	*
	*	@returns {string} A new string with the replace string replaced with the
	*	replaceWith string.
	*/
	static replace(input, replace, replaceWith)
	{
		//change to StringBuilder
		let sb = "";
		let found = false;

		let sLen = input.length;
		let rLen = replace.length;

		for (let i = 0; i < sLen; i++)
		{
			if(input.charAt(i) === replace.charAt(0))
			{
				found = true;
				for(let j = 0; j < rLen; j++)
				{
					if(!(input.charAt(i + j) === replace.charAt(j)))
					{
						found = false;
						break;
					}
				}

				if(found)
				{
					sb += replaceWith;
					i = i + (rLen - 1);
					continue;
				}
			}
			sb += input.charAt(i);
		}

		return sb;
	}


	/**
	* @method shrinkSequencesOf (Groleau)
	* @description Shrinks all sequences of a given character in a string to one
	* @param s (string) original string
	* @param ch (string) character to be found
	* @return (string) string with sequences shrunk
	*/
	static shrinkSequencesOf(s, ch) {
		let len = s.length;
        let idx = 0;
        let idx2;
        let rs = "";

		while ((idx2 = s.indexOf(ch, idx) + 1) !== 0) {
			// include string up to first character in sequence
			rs += s.substring(idx, idx2);
			idx = idx2;

			// remove all subsequent characters in sequence
			while ((s.charAt(idx) === ch) && (idx < len)) idx++;
		}
		return rs + s.substring(idx, len);
	}
}