(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.FastestValidator = factory());
}(this, (function () { 'use strict';

	function isObjectHasKeys(v) {
		if (typeof v !== "object" || Array.isArray(v) || v == null) { return false; }
		return Object.keys(v).length > 0;
	}

	function deepExtend(destination, source, options) {
		if ( options === void 0 ) options = {};

		for (var property in source) {
			if (isObjectHasKeys(source[property])) {
				destination[property] = destination[property] || {};
				deepExtend(destination[property], source[property], options);
			} else {
				if (options.skipIfExist === true && destination[property] !== undefined) { continue; }
				destination[property] = source[property];
			}
		}
		return destination;
	}

	var deepExtend_1 = deepExtend;

	function convertible(value) {
		if (value === undefined) { return ""; }
		if (value === null) { return ""; }
		if (typeof value.toString === "function") { return value; }
		return typeof value;
	}

	var replace = function (string, searchValue, newValue) { return string.replace(searchValue, convertible(newValue)); };

	var messages = {
		required: "The '{field}' field is required.",

		string: "The '{field}' field must be a string.",
		stringEmpty: "The '{field}' field must not be empty.",
		stringMin: "The '{field}' field length must be greater than or equal to {expected} characters long.",
		stringMax: "The '{field}' field length must be less than or equal to {expected} characters long.",
		stringLength: "The '{field}' field length must be {expected} characters long.",
		stringPattern: "The '{field}' field fails to match the required pattern.",
		stringContains: "The '{field}' field must contain the '{expected}' text.",
		stringEnum: "The '{field}' field does not match any of the allowed values.",
		stringNumeric: "The '{field}' field must be a numeric string.",
		stringAlpha: "The '{field}' field must be an alphabetic string.",
		stringAlphanum: "The '{field}' field must be an alphanumeric string.",
		stringAlphadash: "The '{field}' field must be an alphadash string.",
		stringHex: "The '{field}' field must be a hex string.",
		stringSingleLine: "The '{field}' field must be a single line string.",
		stringBase64: "The '{field}' field must be a base64 string.",

		number: "The '{field}' field must be a number.",
		numberMin: "The '{field}' field must be greater than or equal to {expected}.",
		numberMax: "The '{field}' field must be less than or equal to {expected}.",
		numberEqual: "The '{field}' field must be equal to {expected}.",
		numberNotEqual: "The '{field}' field can't be equal to {expected}.",
		numberInteger: "The '{field}' field must be an integer.",
		numberPositive: "The '{field}' field must be a positive number.",
		numberNegative: "The '{field}' field must be a negative number.",

		array: "The '{field}' field must be an array.",
		arrayEmpty: "The '{field}' field must not be an empty array.",
		arrayMin: "The '{field}' field must contain at least {expected} items.",
		arrayMax: "The '{field}' field must contain less than or equal to {expected} items.",
		arrayLength: "The '{field}' field must contain {expected} items.",
		arrayContains: "The '{field}' field must contain the '{expected}' item.",
		arrayUnique: "The '{actual}' value in '{field}' field does not unique the '{expected}' values.",
		arrayEnum: "The '{actual}' value in '{field}' field does not match any of the '{expected}' values.",

		tuple: "The '{field}' field must be an array.",
		tupleEmpty: "The '{field}' field must not be an empty array.",
		tupleLength: "The '{field}' field must contain {expected} items.",

		boolean: "The '{field}' field must be a boolean.",

		currency: "The '{field}' must be a valid currency format",

		date: "The '{field}' field must be a Date.",
		dateMin: "The '{field}' field must be greater than or equal to {expected}.",
		dateMax: "The '{field}' field must be less than or equal to {expected}.",

		enumValue: "The '{field}' field value '{expected}' does not match any of the allowed values.",

		equalValue: "The '{field}' field value must be equal to '{expected}'.",
		equalField: "The '{field}' field value must be equal to '{expected}' field value.",

		forbidden: "The '{field}' field is forbidden.",

		function: "The '{field}' field must be a function.",

		email: "The '{field}' field must be a valid e-mail.",
		emailEmpty: "The '{field}' field must not be empty.",
		emailMin: "The '{field}' field length must be greater than or equal to {expected} characters long.",
		emailMax: "The '{field}' field length must be less than or equal to {expected} characters long.",

		luhn: "The '{field}' field must be a valid checksum luhn.",

		mac: "The '{field}' field must be a valid MAC address.",

		object: "The '{field}' must be an Object.",
		objectStrict: "The object '{field}' contains forbidden keys: '{actual}'.",
		objectMinProps: "The object '{field}' must contain at least {expected} properties.",
		objectMaxProps: "The object '{field}' must contain {expected} properties at most.",

		url: "The '{field}' field must be a valid URL.",
		urlEmpty: "The '{field}' field must not be empty.",

		uuid: "The '{field}' field must be a valid UUID.",
		uuidVersion: "The '{field}' field must be a valid UUID version provided.",

		classInstanceOf: "The '{field}' field must be an instance of the '{expected}' class.",

		objectID: "The '{field}' field must be an valid ObjectID",
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var any = function(/*{ schema, messages }, path, context*/) {
		var src = [];
		src.push("\n\t\treturn value;\n\t");

		return {
			source: src.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var array = function (ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];

		src.push(("\n\t\tif (!Array.isArray(value)) {\n\t\t\t" + (this.makeError({ type: "array", actual: "value", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\n\t\tvar len = value.length;\n\t"));

		if (schema.empty === false) {
			src.push(("\n\t\t\tif (len === 0) {\n\t\t\t\t" + (this.makeError({ type: "arrayEmpty", actual: "value", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.min != null) {
			src.push(("\n\t\t\tif (len < " + (schema.min) + ") {\n\t\t\t\t" + (this.makeError({ type: "arrayMin", expected: schema.min, actual: "len", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.max != null) {
			src.push(("\n\t\t\tif (len > " + (schema.max) + ") {\n\t\t\t\t" + (this.makeError({ type: "arrayMax", expected: schema.max, actual: "len", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.length != null) {
			src.push(("\n\t\t\tif (len !== " + (schema.length) + ") {\n\t\t\t\t" + (this.makeError({ type: "arrayLength", expected: schema.length, actual: "len", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.contains != null) {
			src.push(("\n\t\t\tif (value.indexOf(" + (JSON.stringify(schema.contains)) + ") === -1) {\n\t\t\t\t" + (this.makeError({ type: "arrayContains", expected: JSON.stringify(schema.contains), actual: "value", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.unique === true) {
			src.push(("\n\t\t\tif(len > (new Set(value)).size) {\n\t\t\t\t" + (this.makeError({ type: "arrayUnique", expected: "Array.from(new Set(value.filter((item, index) => value.indexOf(item) !== index)))", actual: "value", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.enum != null) {
			var enumStr = JSON.stringify(schema.enum);
			src.push(("\n\t\t\tfor (var i = 0; i < value.length; i++) {\n\t\t\t\tif (" + enumStr + ".indexOf(value[i]) === -1) {\n\t\t\t\t\t" + (this.makeError({ type: "arrayEnum", expected: "\"" + schema.enum.join(", ") + "\"", actual: "value[i]", messages: messages })) + "\n\t\t\t\t}\n\t\t\t}\n\t\t"));
		}

		if (schema.items != null) {
			src.push("\n\t\t\tvar arr = value;\n\t\t\tvar parentField = field;\n\t\t\tfor (var i = 0; i < arr.length; i++) {\n\t\t\t\tvalue = arr[i];\n\t\t");

			var itemPath = path + "[]";
			var rule = this.getRuleFromSchema(schema.items);
			// eslint-disable-next-line quotes
			var innerSource = "arr[i] = " + (context.async ? "await " : "") + "context.fn[%%INDEX%%](arr[i], (parentField ? parentField : \"\") + \"[\" + i + \"]\", parent, errors, context)";
			src.push(this.compileRule(rule, context, itemPath, innerSource, "arr[i]"));
			src.push("\n\t\t\t}\n\t\t");
			src.push("\n\t\treturn arr;\n\t");
		} else {
			src.push("\n\t\treturn value;\n\t");
		}

		return {
			source: src.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var boolean_1 = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];
		var sanitized = false;

		src.push("\n\t\tvar origValue = value;\n\t");

		if (schema.convert === true) {
			sanitized = true;
			src.push("\n\t\t\tif (typeof value !== \"boolean\") {\n\t\t\t\tif (\n\t\t\t\tvalue === 1\n\t\t\t\t|| value === \"true\"\n\t\t\t\t|| value === \"1\"\n\t\t\t\t|| value === \"on\"\n\t\t\t\t) {\n\t\t\t\t\tvalue = true;\n\t\t\t\t} else if (\n\t\t\t\tvalue === 0\n\t\t\t\t|| value === \"false\"\n\t\t\t\t|| value === \"0\"\n\t\t\t\t|| value === \"off\"\n\t\t\t\t) {\n\t\t\t\t\tvalue = false;\n\t\t\t\t}\n\t\t\t}\n\t\t");
		}

		src.push(("\n\t\tif (typeof value !== \"boolean\") {\n\t\t\t" + (this.makeError({ type: "boolean",  actual: "origValue", messages: messages })) + "\n\t\t}\n\t\t\n\t\treturn value;\n\t"));

		return {
			sanitized: sanitized,
			source: src.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var _class = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;
		var index = ref.index;

		var src = [];

		var className = schema.instanceOf.name ? schema.instanceOf.name : "<UnknowClass>";
		if (!context.customs[index]) { context.customs[index] = { schema: schema }; }
		else { context.customs[index].schema = schema; }

		src.push(("\n\t\tif (!(value instanceof context.customs[" + index + "].schema.instanceOf))\n\t\t\t" + (this.makeError({ type: "classInstanceOf",  actual: "value", expected: "'" + className + "'", messages: messages })) + "\n\t"));

		src.push("\n\t\treturn value;\n\t");

		return {
			source: src.join("\n")
		};
	};

	var custom = function (ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;
		var index = ref.index;

		var src = [];

		src.push(("\n\t\t" + (this.makeCustomValidator({ fnName: "check", path: path, schema: schema, messages: messages, context: context, ruleIndex: index })) + "\n\t\treturn value;\n\t"));

		return {
			source: src.join("\n")
		};
	};

	var CURRENCY_REGEX = "(?=.*\\d)^(-?~1|~1-?)(([0-9]\\d{0,2}(~2\\d{3})*)|0)?(\\~3\\d{1,2})?$";
	/**	Signature: function(value, field, parent, errors, context)
	 */

	var currency = function (ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var currencySymbol = schema.currencySymbol || null;
		var thousandSeparator = schema.thousandSeparator || ",";
		var decimalSeparator = schema.decimalSeparator || ".";
		var customRegex = schema.customRegex;
		var isCurrencySymbolMandatory = !schema.symbolOptional;
		var finalRegex = CURRENCY_REGEX.replace(/~1/g, currencySymbol ? (("\\" + currencySymbol + ((isCurrencySymbolMandatory ? "" : "?")))) : "")
			.replace("~2", thousandSeparator)
			.replace("~3", decimalSeparator);


		var src = [];

		src.push(("\n\t\tif (!value.match(" + (customRegex || new RegExp(finalRegex)) + ")) {\n\t\t\t" + (this.makeError({ type: "currency", actual: "value", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\n\t\treturn value;\n\t"));

		return {
			source: src.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var date = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];
		var sanitized = false;

		src.push("\n\t\tvar origValue = value;\n\t");

		if (schema.convert === true) {
			sanitized = true;
			src.push("\n\t\t\tif (!(value instanceof Date)) {\n\t\t\t\tvalue = new Date(value);\n\t\t\t}\n\t\t");
		}

		src.push(("\n\t\tif (!(value instanceof Date) || isNaN(value.getTime()))\n\t\t\t" + (this.makeError({ type: "date",  actual: "origValue", messages: messages })) + "\n\n\t\treturn value;\n\t"));

		return {
			sanitized: sanitized,
			source: src.join("\n")
		};
	};

	var PRECISE_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var BASIC_PATTERN = /^\S+@\S+\.\S+$/;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var email = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];

		var pattern = schema.mode == "precise" ? PRECISE_PATTERN : BASIC_PATTERN;
		var sanitized = false;

		src.push(("\n\t\tif (typeof value !== \"string\") {\n\t\t\t" + (this.makeError({ type: "string",  actual: "value", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\t"));

		if (!schema.empty) {
			src.push(("\n\t\t\tif (value.length === 0) {\n\t\t\t\t" + (this.makeError({ type: "emailEmpty", actual: "value", messages: messages })) + "\n\t\t\t\treturn value;\n\t\t\t}\n\t\t"));
		} else {
			src.push("\n\t\t\tif (value.length === 0) return value;\n\t\t");
		}

		if (schema.normalize) {
			sanitized = true;
			src.push("\n\t\t\tvalue = value.trim().toLowerCase();\n\t\t");
		}

		if (schema.min != null) {
			src.push(("\n\t\t\tif (value.length < " + (schema.min) + ") {\n\t\t\t\t" + (this.makeError({ type: "emailMin", expected: schema.min, actual: "value.length", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.max != null) {
			src.push(("\n\t\t\tif (value.length > " + (schema.max) + ") {\n\t\t\t\t" + (this.makeError({ type: "emailMax", expected: schema.max, actual: "value.length", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		src.push(("\n\t\tif (!" + (pattern.toString()) + ".test(value)) {\n\t\t\t" + (this.makeError({ type: "email",  actual: "value", messages: messages })) + "\n\t\t}\n\n\t\treturn value;\n\t"));

		return {
			sanitized: sanitized,
			source: src.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var _enum = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var enumStr = JSON.stringify(schema.values || []);
		return {
			source: ("\n\t\t\tif (" + enumStr + ".indexOf(value) === -1)\n\t\t\t\t" + (this.makeError({ type: "enumValue", expected: "\"" + schema.values.join(", ") + "\"", actual: "value", messages: messages })) + "\n\t\t\t\n\t\t\treturn value;\n\t\t")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var equal = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];

		if (schema.field) {
			if (schema.strict) {
				src.push(("\n\t\t\t\tif (value !== parent[\"" + (schema.field) + "\"])\n\t\t\t"));
			} else {
				src.push(("\n\t\t\t\tif (value != parent[\"" + (schema.field) + "\"])\n\t\t\t"));
			}
			src.push(("\n\t\t\t\t" + (this.makeError({ type: "equalField",  actual: "value", expected: JSON.stringify(schema.field), messages: messages })) + "\n\t\t"));
		} else {
			if (schema.strict) {
				src.push(("\n\t\t\t\tif (value !== " + (JSON.stringify(schema.value)) + ")\n\t\t\t"));
			} else {
				src.push(("\n\t\t\t\tif (value != " + (JSON.stringify(schema.value)) + ")\n\t\t\t"));
			}
			src.push(("\n\t\t\t\t" + (this.makeError({ type: "equalValue",  actual: "value", expected: JSON.stringify(schema.value), messages: messages })) + "\n\t\t"));
		}

		src.push("\n\t\treturn value;\n\t");

		return {
			source: src.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var forbidden = function checkForbidden(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];

		src.push("\n\t\tif (value !== null && value !== undefined) {\n\t");

		if (schema.remove) {
			src.push("\n\t\t\treturn undefined;\n\t\t");

		} else {
			src.push(("\n\t\t\t" + (this.makeError({ type: "forbidden",  actual: "value", messages: messages })) + "\n\t\t"));
		}

		src.push("\n\t\t}\n\n\t\treturn value;\n\t");

		return {
			source: src.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var _function = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		return {
			source: ("\n\t\t\tif (typeof value !== \"function\")\n\t\t\t\t" + (this.makeError({ type: "function",  actual: "value", messages: messages })) + "\n\n\t\t\treturn value;\n\t\t")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var multi = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];

		src.push("\n\t\tvar prevErrLen = errors.length;\n\t\tvar errBefore;\n\t\tvar hasValid = false;\n\t\tvar newVal = value;\n\t");

		for (var i = 0; i < schema.rules.length; i++) {
			src.push("\n\t\t\tif (!hasValid) {\n\t\t\t\terrBefore = errors.length;\n\t\t");

			var rule = this.getRuleFromSchema(schema.rules[i]);
			src.push(this.compileRule(rule, context, path, ("var tmpVal = " + (context.async ? "await " : "") + "context.fn[%%INDEX%%](value, field, parent, errors, context);"), "tmpVal"));
			src.push("\n\t\t\t\tif (errors.length == errBefore) {\n\t\t\t\t\thasValid = true;\n\t\t\t\t\tnewVal = tmpVal;\n\t\t\t\t}\n\t\t\t}\n\t\t");
		}

		src.push("\n\t\tif (hasValid) {\n\t\t\terrors.length = prevErrLen;\n\t\t}\n\n\t\treturn newVal;\n\t");

		return {
			source: src.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var number = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];

		src.push("\n\t\tvar origValue = value;\n\t");

		var sanitized = false;
		if (schema.convert === true) {
			sanitized = true;
			src.push("\n\t\t\tif (typeof value !== \"number\") {\n\t\t\t\tvalue = Number(value);\n\t\t\t}\n\t\t");
		}

		src.push(("\n\t\tif (typeof value !== \"number\" || isNaN(value) || !isFinite(value)) {\n\t\t\t" + (this.makeError({ type: "number",  actual: "origValue", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\t"));

		if (schema.min != null) {
			src.push(("\n\t\t\tif (value < " + (schema.min) + ") {\n\t\t\t\t" + (this.makeError({ type: "numberMin", expected: schema.min, actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.max != null) {
			src.push(("\n\t\t\tif (value > " + (schema.max) + ") {\n\t\t\t\t" + (this.makeError({ type: "numberMax", expected: schema.max, actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		// Check fix value
		if (schema.equal != null) {
			src.push(("\n\t\t\tif (value !== " + (schema.equal) + ") {\n\t\t\t\t" + (this.makeError({ type: "numberEqual", expected: schema.equal, actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		// Check not fix value
		if (schema.notEqual != null) {
			src.push(("\n\t\t\tif (value === " + (schema.notEqual) + ") {\n\t\t\t\t" + (this.makeError({ type: "numberNotEqual", expected: schema.notEqual, actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		// Check integer
		if (schema.integer === true) {
			src.push(("\n\t\t\tif (value % 1 !== 0) {\n\t\t\t\t" + (this.makeError({ type: "numberInteger",  actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		// Check positive
		if (schema.positive === true) {
			src.push(("\n\t\t\tif (value <= 0) {\n\t\t\t\t" + (this.makeError({ type: "numberPositive",  actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		// Check negative
		if (schema.negative === true) {
			src.push(("\n\t\t\tif (value >= 0) {\n\t\t\t\t" + (this.makeError({ type: "numberNegative",  actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		src.push("\n\t\treturn value;\n\t");

		return {
			sanitized: sanitized,
			source: src.join("\n")
		};
	};

	// Quick regex to match most common unquoted JavaScript property names. Note the spec allows Unicode letters.
	// Unmatched property names will be quoted and validate slighly slower. https://www.ecma-international.org/ecma-262/5.1/#sec-7.6
	var identifierRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;

	// Regex to escape quoted property names for eval/new Function
	var escapeEvalRegex = /["'\\\n\r\u2028\u2029]/g;

	/* istanbul ignore next */
	function escapeEvalString(str) {
		// Based on https://github.com/joliss/js-string-escape
		return str.replace(escapeEvalRegex, function (character) {
			switch (character) {
			case "\"":
			case "'":
			case "\\":
				return "\\" + character;
				// Four possible LineTerminator characters need to be escaped:
			case "\n":
				return "\\n";
			case "\r":
				return "\\r";
			case "\u2028":
				return "\\u2028";
			case "\u2029":
				return "\\u2029";
			}
		});
	}

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var object = function (ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var sourceCode = [];

		sourceCode.push(("\n\t\tif (typeof value !== \"object\" || value === null || Array.isArray(value)) {\n\t\t\t" + (this.makeError({ type: "object", actual: "value", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\t"));

		var subSchema = schema.properties || schema.props;
		if (subSchema) {
			sourceCode.push("var parentObj = value;");
			sourceCode.push("var parentField = field;");

			var keys = Object.keys(subSchema);

			for (var i = 0; i < keys.length; i++) {
				var property = keys[i];

				var name = escapeEvalString(property);
				var safeSubName = identifierRegex.test(name) ? ("." + name) : ("['" + name + "']");
				var safePropName = "parentObj" + safeSubName;
				var newPath = (path ? path + "." : "") + property;

				sourceCode.push(("\n// Field: " + (escapeEvalString(newPath))));
				sourceCode.push(("field = parentField ? parentField + \"" + safeSubName + "\" : \"" + name + "\";"));
				sourceCode.push(("value = " + safePropName + ";"));

				var rule = this.getRuleFromSchema(subSchema[property]);
				var innerSource = "\n\t\t\t\t" + safePropName + " = " + (context.async ? "await " : "") + "context.fn[%%INDEX%%](value, field, parentObj, errors, context);\n\t\t\t";
				sourceCode.push(this.compileRule(rule, context, newPath, innerSource, safePropName));
			}

			// Strict handler
			if (schema.strict) {
				var allowedProps = Object.keys(subSchema);

				sourceCode.push(("\n\t\t\t\tfield = parentField;\n\t\t\t\tvar invalidProps = [];\n\t\t\t\tvar props = Object.keys(parentObj);\n\n\t\t\t\tfor (let i = 0; i < props.length; i++) {\n\t\t\t\t\tif (" + (JSON.stringify(allowedProps)) + ".indexOf(props[i]) === -1) {\n\t\t\t\t\t\tinvalidProps.push(props[i]);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tif (invalidProps.length) {\n\t\t\t"));
				if (schema.strict == "remove") {
					sourceCode.push("\n\t\t\t\t\tinvalidProps.forEach(function(field) {\n\t\t\t\t\t\tdelete parentObj[field];\n\t\t\t\t\t});\n\t\t\t\t");
				} else {
					sourceCode.push(("\n\t\t\t\t\t" + (this.makeError({ type: "objectStrict", expected: "\"" + allowedProps.join(", ") + "\"", actual: "invalidProps.join(', ')", messages: messages })) + "\n\t\t\t\t"));
				}
				sourceCode.push("\n\t\t\t\t}\n\t\t\t");
			}
		}

		if (schema.minProps != null || schema.maxProps != null) {
			// We recalculate props, because:
			//	- if strict equals 'remove', we want to work on
			//	the payload with the extra keys removed,
			//	- if no strict is set, we need them anyway.
			if (schema.strict) {
				sourceCode.push(("\n\t\t\t\tprops = Object.keys(" + (subSchema ? "parentObj" : "value") + ");\n\t\t\t"));
			} else {
				sourceCode.push(("\n\t\t\t\tvar props = Object.keys(" + (subSchema ? "parentObj" : "value") + ");\n\t\t\t\t" + (subSchema ? "field = parentField;" : "") + "\n\t\t\t"));
			}
		}

		if (schema.minProps != null) {
			sourceCode.push(("\n\t\t\tif (props.length < " + (schema.minProps) + ") {\n\t\t\t\t" + (this.makeError({ type: "objectMinProps", expected: schema.minProps, actual: "props.length", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.maxProps != null) {
			sourceCode.push(("\n\t\t\tif (props.length > " + (schema.maxProps) + ") {\n\t\t\t\t" + (this.makeError({ type: "objectMaxProps", expected: schema.maxProps, actual: "props.length", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (subSchema) {
			sourceCode.push("\n\t\t\treturn parentObj;\n\t\t");
		} else {
			sourceCode.push("\n\t\t\treturn value;\n\t\t");
		}

		return {
			source: sourceCode.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var objectID = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;
		var index = ref.index;

		var src = [];

		if (!context.customs[index]) { context.customs[index] = { schema: schema }; }
		else { context.customs[index].schema = schema; }

		src.push(("\n\t\tconst ObjectID = context.customs[" + index + "].schema.ObjectID;\n\t\tif (!ObjectID.isValid(value)) {\n\t\t\t" + (this.makeError({ type: "objectID", actual: "value", messages: messages })) + "\n\t\t\treturn;\n\t\t}\n\t"));

		if (schema.convert === true) { src.push("return new ObjectID(value)"); }
		else if (schema.convert === "hexString") { src.push("return value.toString()"); }
		else { src.push("return value"); }

		return {
			source: src.join("\n")
		};
	};

	var NUMERIC_PATTERN = /^-?[0-9]\d*(\.\d+)?$/;
	var ALPHA_PATTERN = /^[a-zA-Z]+$/;
	var ALPHANUM_PATTERN = /^[a-zA-Z0-9]+$/;
	var ALPHADASH_PATTERN = /^[a-zA-Z0-9_-]+$/;
	var HEX_PATTERN = /^[0-9a-fA-F]+$/;
	var BASE64_PATTERN = /^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var string = function checkString(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];
		var sanitized = false;

		if (schema.convert === true) {
			sanitized = true;
			src.push("\n\t\t\tif (typeof value !== \"string\") {\n\t\t\t\tvalue = String(value);\n\t\t\t}\n\t\t");
		}

		src.push(("\n\t\tif (typeof value !== \"string\") {\n\t\t\t" + (this.makeError({ type: "string", actual: "value", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\n\t\tvar origValue = value;\n\t"));

		if (schema.trim) {
			sanitized = true;
			src.push("\n\t\t\tvalue = value.trim();\n\t\t");
		}

		if (schema.trimLeft) {
			sanitized = true;
			src.push("\n\t\t\tvalue = value.trimLeft();\n\t\t");
		}

		if (schema.trimRight) {
			sanitized = true;
			src.push("\n\t\t\tvalue = value.trimRight();\n\t\t");
		}

		if (schema.padStart) {
			sanitized = true;
			var padChar = schema.padChar != null ? schema.padChar : " ";
			src.push(("\n\t\t\tvalue = value.padStart(" + (schema.padStart) + ", " + (JSON.stringify(padChar)) + ");\n\t\t"));
		}

		if (schema.padEnd) {
			sanitized = true;
			var padChar$1 = schema.padChar != null ? schema.padChar : " ";
			src.push(("\n\t\t\tvalue = value.padEnd(" + (schema.padEnd) + ", " + (JSON.stringify(padChar$1)) + ");\n\t\t"));
		}

		if (schema.lowercase) {
			sanitized = true;
			src.push("\n\t\t\tvalue = value.toLowerCase();\n\t\t");
		}

		if (schema.uppercase) {
			sanitized = true;
			src.push("\n\t\t\tvalue = value.toUpperCase();\n\t\t");
		}

		if (schema.localeLowercase) {
			sanitized = true;
			src.push("\n\t\t\tvalue = value.toLocaleLowerCase();\n\t\t");
		}

		if (schema.localeUppercase) {
			sanitized = true;
			src.push("\n\t\t\tvalue = value.toLocaleUpperCase();\n\t\t");
		}

		src.push("\n\t\t\tvar len = value.length;\n\t");

		if (schema.empty === false) {
			src.push(("\n\t\t\tif (len === 0) {\n\t\t\t\t" + (this.makeError({ type: "stringEmpty",  actual: "value", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.min != null) {
			src.push(("\n\t\t\tif (len < " + (schema.min) + ") {\n\t\t\t\t" + (this.makeError({ type: "stringMin", expected: schema.min, actual: "len", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.max != null) {
			src.push(("\n\t\t\tif (len > " + (schema.max) + ") {\n\t\t\t\t" + (this.makeError({ type: "stringMax", expected: schema.max, actual: "len", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.length != null) {
			src.push(("\n\t\t\tif (len !== " + (schema.length) + ") {\n\t\t\t\t" + (this.makeError({ type: "stringLength", expected: schema.length, actual: "len", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.pattern != null) {
			var pattern = schema.pattern;
			if (typeof schema.pattern == "string")
				{ pattern = new RegExp(schema.pattern, schema.patternFlags); }

			var patternValidator = "\n\t\t\tif (!" + (pattern.toString()) + ".test(value))\n\t\t\t\t" + (this.makeError({ type: "stringPattern", expected: ("\"" + (pattern.toString().replace(/"/g, "\\$&")) + "\""), actual: "origValue", messages: messages })) + "\n\t\t";

			src.push(("\n\t\t\tif (" + (schema.empty) + " === true && len === 0) {\n\t\t\t\t// Do nothing\n\t\t\t} else {\n\t\t\t\t" + patternValidator + "\n\t\t\t}\n\t\t"));
		}

		if (schema.contains != null) {
			src.push(("\n\t\t\tif (value.indexOf(\"" + (schema.contains) + "\") === -1) {\n\t\t\t\t" + (this.makeError({ type: "stringContains", expected: "\"" + schema.contains + "\"", actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.enum != null) {
			var enumStr = JSON.stringify(schema.enum);
			src.push(("\n\t\t\tif (" + enumStr + ".indexOf(value) === -1) {\n\t\t\t\t" + (this.makeError({ type: "stringEnum", expected: "\"" + schema.enum.join(", ") + "\"", actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if (schema.numeric === true) {
			src.push(("\n\t\t\tif (!" + (NUMERIC_PATTERN.toString()) + ".test(value) ) {\n\t\t\t\t" + (this.makeError({ type: "stringNumeric",  actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if(schema.alpha === true) {
			src.push(("\n\t\t\tif(!" + (ALPHA_PATTERN.toString()) + ".test(value)) {\n\t\t\t\t" + (this.makeError({ type: "stringAlpha",  actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if(schema.alphanum === true) {
			src.push(("\n\t\t\tif(!" + (ALPHANUM_PATTERN.toString()) + ".test(value)) {\n\t\t\t\t" + (this.makeError({ type: "stringAlphanum",  actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if(schema.alphadash === true) {
			src.push(("\n\t\t\tif(!" + (ALPHADASH_PATTERN.toString()) + ".test(value)) {\n\t\t\t\t" + (this.makeError({ type: "stringAlphadash",  actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if(schema.hex === true) {
			src.push(("\n\t\t\tif(value.length % 2 !== 0 || !" + (HEX_PATTERN.toString()) + ".test(value)) {\n\t\t\t\t" + (this.makeError({ type: "stringHex",  actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		if(schema.singleLine === true) {
			src.push(("\n\t\t\tif(value.includes(\"\\n\")) {\n\t\t\t\t" + (this.makeError({ type: "stringSingleLine", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}


		if(schema.base64 === true) {
			src.push(("\n\t\t\tif(!" + (BASE64_PATTERN.toString()) + ".test(value)) {\n\t\t\t\t" + (this.makeError({ type: "stringBase64",  actual: "origValue", messages: messages })) + "\n\t\t\t}\n\t\t"));
		}

		src.push("\n\t\treturn value;\n\t");

		return {
			sanitized: sanitized,
			source: src.join("\n")
		};
	};

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var tuple = function (ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];

		if (schema.items != null) {
			if (!Array.isArray(schema.items)) {
				throw new Error(("Invalid '" + (schema.type) + "' schema. The 'items' field must be an array."));
			}

			if (schema.items.length === 0) {
				throw new Error(("Invalid '" + (schema.type) + "' schema. The 'items' field must not be an empty array."));
			}
		}

		src.push(("\n\t\tif (!Array.isArray(value)) {\n\t\t\t" + (this.makeError({ type: "tuple", actual: "value", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\n\t\tvar len = value.length;\n\t"));


		if (schema.empty === false) {
			src.push(("\n\t\t\tif (len === 0) {\n\t\t\t\t" + (this.makeError({ type: "tupleEmpty", actual: "value", messages: messages })) + "\n\t\t\t\treturn value;\n\t\t\t}\n\t\t"));
		}

		if (schema.items != null) {
			src.push(("\n\t\t\tif (" + (schema.empty) + " !== false && len === 0) {\n\t\t\t\treturn value;\n\t\t\t}\n\n\t\t\tif (len !== " + (schema.items.length) + ") {\n\t\t\t\t" + (this.makeError({type: "tupleLength", expected: schema.items.length, actual: "len", messages: messages})) + "\n\t\t\t\treturn value;\n\t\t\t}\n\t\t"));

			src.push("\n\t\t\tvar arr = value;\n\t\t\tvar parentField = field;\n\t\t");

			for (var i = 0; i < schema.items.length; i++) {
				src.push(("\n\t\t\tvalue = arr[" + i + "];\n\t\t"));

				var itemPath = path + "[" + i + "]";
				var rule = this.getRuleFromSchema(schema.items[i]);
				var innerSource = "\n\t\t\tarr[" + i + "] = " + (context.async ? "await " : "") + "context.fn[%%INDEX%%](arr[" + i + "], (parentField ? parentField : \"\") + \"[\" + " + i + " + \"]\", parent, errors, context);\n\t\t";
				src.push(this.compileRule(rule, context, itemPath, innerSource, ("arr[" + i + "]")));
			}
			src.push("\n\t\treturn arr;\n\t");
		} else {
			src.push("\n\t\treturn value;\n\t");
		}

		return {
			source: src.join("\n")
		};
	};

	var PATTERN = /^https?:\/\/\S+/;
	//const PATTERN = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
	//const PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var url = function (ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];

		src.push(("\n\t\tif (typeof value !== \"string\") {\n\t\t\t" + (this.makeError({ type: "string", actual: "value", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\t"));

		if (!schema.empty) {
			src.push(("\n\t\t\tif (value.length === 0) {\n\t\t\t\t" + (this.makeError({ type: "urlEmpty", actual: "value", messages: messages })) + "\n\t\t\t\treturn value;\n\t\t\t}\n\t\t"));
		} else {
			src.push("\n\t\t\tif (value.length === 0) return value;\n\t\t");
		}

		src.push(("\n\t\tif (!" + (PATTERN.toString()) + ".test(value)) {\n\t\t\t" + (this.makeError({ type: "url", actual: "value", messages: messages })) + "\n\t\t}\n\n\t\treturn value;\n\t"));

		return {
			source: src.join("\n"),
		};
	};

	var PATTERN$1 = /^([0-9a-f]{8}-[0-9a-f]{4}-[1-6][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}|[0]{8}-[0]{4}-[0]{4}-[0]{4}-[0]{12})$/i;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var uuid = function(ref, path) {
		var schema = ref.schema;
		var messages = ref.messages;

		var src = [];
		src.push(("\n\t\tif (typeof value !== \"string\") {\n\t\t\t" + (this.makeError({ type: "string",  actual: "value", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\n\t\tvar val = value.toLowerCase();\n\t\tif (!" + (PATTERN$1.toString()) + ".test(val)) {\n\t\t\t" + (this.makeError({ type: "uuid",  actual: "value", messages: messages })) + "\n\t\t\treturn value;\n\t\t}\n\n\t\tconst version = val.charAt(14) | 0;\n\t"));

		if(parseInt(schema.version) < 7) {
			src.push(("\n\t\t\tif (" + (schema.version) + " !== version) {\n\t\t\t\t" + (this.makeError({ type: "uuidVersion", expected: schema.version, actual: "version", messages: messages })) + "\n\t\t\t\treturn value;\n\t\t\t}\n\t\t"));
		}

		src.push(("\n\t\tswitch (version) {\n\t\tcase 0:\n\t\tcase 1:\n\t\tcase 2:\n\t\tcase 6:\n\t\t\tbreak;\n\t\tcase 3:\n\t\tcase 4:\n\t\tcase 5:\n\t\t\tif ([\"8\", \"9\", \"a\", \"b\"].indexOf(val.charAt(19)) === -1) {\n\t\t\t\t" + (this.makeError({ type: "uuid",  actual: "value", messages: messages })) + "\n\t\t\t}\n\t\t}\n\n\t\treturn value;\n\t"));

		return {
			source: src.join("\n")
		};
	};

	var PATTERN$2 = /^((([a-f0-9][a-f0-9]+[-]){5}|([a-f0-9][a-f0-9]+[:]){5})([a-f0-9][a-f0-9])$)|(^([a-f0-9][a-f0-9][a-f0-9][a-f0-9]+[.]){2}([a-f0-9][a-f0-9][a-f0-9][a-f0-9]))$/i;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	var mac = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		return {
			source: ("\n\t\t\tif (typeof value !== \"string\") {\n\t\t\t\t" + (this.makeError({ type: "string",  actual: "value", messages: messages })) + "\n\t\t\t\treturn value;\n\t\t\t}\n\n\t\t\tvar v = value.toLowerCase();\n\t\t\tif (!" + (PATTERN$2.toString()) + ".test(v)) {\n\t\t\t\t" + (this.makeError({ type: "mac",  actual: "value", messages: messages })) + "\n\t\t\t}\n\t\t\t\n\t\t\treturn value;\n\t\t")
		};
	};

	/**
	 * Luhn algorithm checksum https://en.wikipedia.org/wiki/Luhn_algorithm
	 * Credit Card numbers, IMEI numbers, National Provider Identifier numbers and others
	 * @param value
	 * @param schema
	 * @return {boolean|{actual, expected, type}|ValidationError}
	 *
	 *	Signature: function(value, field, parent, errors, context)
	 */
	var luhn = function(ref, path, context) {
		var schema = ref.schema;
		var messages = ref.messages;

		return {
			source: ("\n\t\t\tif (typeof value !== \"string\") {\n\t\t\t\t" + (this.makeError({ type: "string",  actual: "value", messages: messages })) + "\n\t\t\t\treturn value;\n\t\t\t}\n\n\t\t\tif (typeof value !== \"string\")\n\t\t\t\tvalue = String(value);\n\n\t\t\tval = value.replace(/\\D+/g, \"\");\n\n\t\t\tvar array = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];\n\t\t\tvar len = val ? val.length : 0,\n\t\t\t\tbit = 1,\n\t\t\t\tsum = 0;\n\t\t\twhile (len--) {\n\t\t\t\tsum += !(bit ^= 1) ? parseInt(val[len], 10) : array[val[len]];\n\t\t\t}\n\n\t\t\tif (!(sum % 10 === 0 && sum > 0)) {\n\t\t\t\t" + (this.makeError({ type: "luhn",  actual: "value", messages: messages })) + "\n\t\t\t}\n\n\t\t\treturn value;\n\t\t")
		};
	};

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
	}

	// globals window
	var prettier, prettierOpts;
	var hljs, hljsOpts;

	var prettier_1 = function(source) {
		if (!prettier) {
			prettier = commonjsRequire();
			prettierOpts = {
				parser: "babel",
				useTabs: false,
				printWidth: 120,
				trailingComma: "none",
				tabWidth: 4,
				singleQuote: false,
				semi: true,
				bracketSpacing: true
			};

			hljs = commonjsRequire();
			hljsOpts = {
				language: "js",
				theme: hljs.fromJson({
					keyword: ["white", "bold"],
					built_in: "magenta",
					literal: "cyan",
					number: "magenta",
					regexp: "red",
					string: ["yellow", "bold"],
					symbol: "plain",
					class: "blue",
					attr: "plain",
					function: ["white", "bold"],
					title: "plain",
					params: "green",
					comment: "grey"
				})
			};
		}

		var res = prettier.format(source, prettierOpts);
		return hljs.highlight(res, hljsOpts);
	};

	var AsyncFunction;
	try {
		AsyncFunction = (new Function("return Object.getPrototypeOf(async function(){}).constructor"))();
	} catch(err) { /* async is not supported */}




	function loadMessages() {
		return Object.assign({} , messages);
	}

	function loadRules() {
		return {
			any: any,
			array: array,
			boolean: boolean_1,
			class: _class,
			custom: custom,
			currency: currency,
			date: date,
			email: email,
			enum: _enum,
			equal: equal,
			forbidden: forbidden,
			function: _function,
			multi: multi,
			number: number,
			object: object,
			objectID: objectID,
			string: string,
			tuple: tuple,
			url: url,
			uuid: uuid,
			mac: mac,
			luhn: luhn
		};
	}

	/**
	 * Fastest Validator
	 */
	var Validator = function Validator(opts) {
		this.opts = {};
		this.defaults = {};
		this.messages = loadMessages();
		this.rules = loadRules();
		this.aliases = {};
		this.cache = new Map();

		if (opts) {
			deepExtend_1(this.opts, opts);
			if (opts.defaults) { deepExtend_1(this.defaults, opts.defaults); }

			if (opts.messages) {
				for (var messageName in opts.messages) { this.addMessage(messageName, opts.messages[messageName]); }
			}

			if (opts.aliases) {
				for (var aliasName in opts.aliases) { this.alias(aliasName, opts.aliases[aliasName]); }
			}

			if (opts.customRules) {
				for (var ruleName in opts.customRules) { this.add(ruleName, opts.customRules[ruleName]); }
			}

			if (opts.plugins) {
				var plugins = opts.plugins;
				if (!Array.isArray(plugins)) { throw new Error("Plugins type must be array"); }
				plugins.forEach(this.plugin.bind(this));
			}

			/* istanbul ignore next */
			if (this.opts.debug) {
				var formatter = function (code) { return code; };
				if (typeof window === "undefined") {
					formatter = prettier_1;
				}

				this._formatter = formatter;
			}
		}
	};

	/**
		 * Validate an object by schema
		 *
		 * @param {Object} obj
		 * @param {Object} schema
		 * @returns {Array<Object>|boolean}
		 */
	Validator.prototype.validate = function validate (obj, schema) {
		var check = this.compile(schema);
		return check(obj);
	};

	/**
		 * Wrap a source code with `required` & `optional` checker codes.
		 * @param {Object} rule
		 * @param {String} innerSrc
		 * @param {String?} resVar
		 * @returns {String}
		 */
	Validator.prototype.wrapRequiredCheckSourceCode = function wrapRequiredCheckSourceCode (rule, innerSrc, context, resVar) {
		var src = [];
		var handleNoValue;

		var skipUndefinedValue = rule.schema.optional === true || rule.schema.type === "forbidden";
		var skipNullValue = rule.schema.optional === true || rule.schema.nullable === true || rule.schema.type === "forbidden";

		if (rule.schema.default != null) {
			// We should set default-value when value is undefined or null, not skip! (Except when null is allowed)
			skipUndefinedValue = false;
			if (rule.schema.nullable !== true) { skipNullValue = false; }

			var defaultValue;
			if (typeof rule.schema.default === "function") {
				if (!context.customs[rule.index]) { context.customs[rule.index] = {}; }
				context.customs[rule.index].defaultFn = rule.schema.default;
				defaultValue = "context.customs[" + (rule.index) + "].defaultFn()";
			} else {
				defaultValue = JSON.stringify(rule.schema.default);
			}

			handleNoValue = "\n\t\t\t\tvalue = " + defaultValue + ";\n\t\t\t\t" + resVar + " = value;\n\t\t\t";

		} else {
			handleNoValue = this.makeError({ type: "required", actual: "value", messages: rule.messages });
		}


		src.push(("\n\t\t\t" + ("if (value === undefined) { " + (skipUndefinedValue ? "\n// allow undefined\n" : handleNoValue) + " }") + "\n\t\t\t" + ("else if (value === null) { " + (skipNullValue ? "\n// allow null\n" : handleNoValue) + " }") + "\n\t\t\t" + (innerSrc ? ("else { " + innerSrc + " }") : "") + "\n\t\t"));
		return src.join("\n");
	};

	/**
		 * Compile a schema
		 *
		 * @param {Object} schema
		 * @throws {Error} Invalid schema
		 * @returns {Function}
		 */
	Validator.prototype.compile = function compile (schema) {
		if (schema === null || typeof schema !== "object") {
			throw new Error("Invalid schema.");
		}

		var self = this;
		var context = {
			index: 0,
			async: schema.$$async === true,
			rules: [],
			fn: [],
			customs: {},
			utils: {
				replace: replace,
			},
		};
		this.cache.clear();
		delete schema.$$async;

		/* istanbul ignore next */
		if (context.async && !AsyncFunction) {
			throw new Error("Asynchronous mode is not supported.");
		}

		if (schema.$$root !== true) {
			if (Array.isArray(schema)) {
				var rule$1 = this.getRuleFromSchema(schema);
				schema = rule$1.schema;
			} else {
				var prevSchema = Object.assign({}, schema);
				schema = {
					type: "object",
					strict: prevSchema.$$strict,
					properties: prevSchema
				};

				delete prevSchema.$$strict;
			}
		}

		var sourceCode = [
			"var errors = [];",
			"var field;",
			"var parent = null;" ];

		var rule = this.getRuleFromSchema(schema);
		sourceCode.push(this.compileRule(rule, context, null, ((context.async ? "await " : "") + "context.fn[%%INDEX%%](value, field, null, errors, context);"), "value"));

		sourceCode.push("if (errors.length) {");
		sourceCode.push("\n\t\t\treturn errors.map(err => {\n\t\t\t\tif (err.message) {\n\t\t\t\t\terr.message = context.utils.replace(err.message, /\\{field\\}/g, err.field);\n\t\t\t\t\terr.message = context.utils.replace(err.message, /\\{expected\\}/g, err.expected);\n\t\t\t\t\terr.message = context.utils.replace(err.message, /\\{actual\\}/g, err.actual);\n\t\t\t\t}\n\n\t\t\t\treturn err;\n\t\t\t});\n\t\t");

		sourceCode.push("}");
		sourceCode.push("return true;");

		var src = sourceCode.join("\n");

		var FnClass = context.async ? AsyncFunction : Function;
		var checkFn = new FnClass("value", "context", src);

		/* istanbul ignore next */
		if (this.opts.debug) {
			console.log(this._formatter("// Main check function\n" + checkFn.toString())); // eslint-disable-line no-console
		}

		this.cache.clear();

		var resFn = function (data, opts) {
			context.data = data;
			if (opts && opts.meta)
				{ context.meta = opts.meta; }
			return checkFn.call(self, data, context);
		};
		resFn.async = context.async;
		return resFn;
	};

	/**
		 * Compile a rule to source code.
		 * @param {Object} rule
		 * @param {Object} context
		 * @param {String} path
		 * @param {String} innerSrc
		 * @param {String} resVar
		 * @returns {String}
		 */
	Validator.prototype.compileRule = function compileRule (rule, context, path, innerSrc, resVar) {
		var sourceCode = [];

		var item = this.cache.get(rule.schema);
		if (item) {
			// Handle cyclic schema
			rule = item;
			rule.cycle = true;
			rule.cycleStack = [];
			sourceCode.push(this.wrapRequiredCheckSourceCode(rule, ("\n\t\t\t\tvar rule = context.rules[" + (rule.index) + "];\n\t\t\t\tif (rule.cycleStack.indexOf(value) === -1) {\n\t\t\t\t\trule.cycleStack.push(value);\n\t\t\t\t\t" + (innerSrc.replace(/%%INDEX%%/g, rule.index)) + "\n\t\t\t\t\trule.cycleStack.pop(value);\n\t\t\t\t}\n\t\t\t"), context, resVar));

		} else {
			this.cache.set(rule.schema, rule);
			rule.index = context.index;
			context.rules[context.index] = rule;

			var customPath = path != null ? path : "$$root";

			context.index++;
			var res = rule.ruleFunction.call(this, rule, path, context);
			res.source = res.source.replace(/%%INDEX%%/g, rule.index);
			var FnClass = context.async ? AsyncFunction : Function;
			var fn = new FnClass("value", "field", "parent", "errors", "context", res.source);
			context.fn[rule.index] = fn.bind(this);
			sourceCode.push(this.wrapRequiredCheckSourceCode(rule, innerSrc.replace(/%%INDEX%%/g, rule.index), context, resVar));
			sourceCode.push(this.makeCustomValidator({vName: resVar, path: customPath, schema: rule.schema, context: context, messages: rule.messages, ruleIndex: rule.index}));

			/* istanbul ignore next */
			if (this.opts.debug) {
				console.log(this._formatter("// Context.fn[" + (rule.index) + "]\n" + fn.toString())); // eslint-disable-line no-console
			}
		}

		return sourceCode.join("\n");
	};

	/**
		 * Create a rule instance from schema definition.
		 * @param {Object} schema
		 * @returns {Object} rule
		 */
	Validator.prototype.getRuleFromSchema = function getRuleFromSchema (schema) {
			var this$1 = this;

		if (typeof schema === "string") {
			schema = this.parseShortHand(schema);
		} else if (Array.isArray(schema)) {
			if (schema.length == 0)
				{ throw new Error("Invalid schema."); }

			schema = {
				type: "multi",
				rules: schema
			};

			// Check 'optional' flag
			var isOptional = schema.rules
				.map(function (s) { return this$1.getRuleFromSchema(s); })
				.every(function (rule) { return rule.schema.optional == true; });
			if (isOptional)
				{ schema.optional = true; }
		}

		if (schema.$$type) {
			var type = schema.$$type;
			var otherShorthandProps = this.getRuleFromSchema(type).schema;
			delete schema.$$type;
			var props = Object.assign({}, schema);

			for (var key in schema) {  // clear object without changing reference
				delete schema[key];
			}

			deepExtend_1(schema, otherShorthandProps, { skipIfExist: true });
			schema.props = props;
		}

		var alias = this.aliases[schema.type];
		if (alias) {
			delete schema.type;
			schema = deepExtend_1(schema, alias, { skipIfExist: true });
		}

		var ruleFunction = this.rules[schema.type];
		if (!ruleFunction)
			{ throw new Error("Invalid '" + schema.type + "' type in validator schema."); }

		var rule = {
			messages: Object.assign({}, this.messages, schema.messages),
			schema: deepExtend_1(schema, this.defaults[schema.type], { skipIfExist: true }),
			ruleFunction: ruleFunction,
		};

		return rule;
	};

	/**
		 * Parse rule from shorthand string
		 * @param {String} str shorthand string
		 * @param {Object} schema schema reference
		 */

	Validator.prototype.parseShortHand = function parseShortHand (str) {
		var p = str.split("|").map(function (s) { return s.trim(); });
		var type = p[0];
		var schema;
		if (type.endsWith("[]")) {
			schema = this.getRuleFromSchema({ type: "array", items: type.slice(0, -2) }).schema;
		} else {
			schema = {
				type: p[0],
			};
		}

		p.slice(1).map(function (s) {
			var idx = s.indexOf(":");
			if (idx !== -1) {
				var key = s.substr(0, idx).trim();
				var value = s.substr(idx + 1).trim();
				if (value === "true" || value === "false")
					{ value = value === "true"; }
				else if (!Number.isNaN(Number(value))) {
					value = Number(value);
				}
				schema[key] = value;
			} else {
				// boolean value
				if (s.startsWith("no-")) { schema[s.slice(3)] = false; }
				else { schema[s] = true; }
			}
		});

		return schema;
	};

	/**
		 * Generate error source code.
		 * @param {Object} opts
		 * @param {String} opts.type
		 * @param {String} opts.field
		 * @param {any} opts.expected
		 * @param {any} opts.actual
		 * @param {Object} opts.messages
		 */
	Validator.prototype.makeError = function makeError (ref) {
			var type = ref.type;
			var field = ref.field;
			var expected = ref.expected;
			var actual = ref.actual;
			var messages = ref.messages;

		var o = {
			type: ("\"" + type + "\""),
			message: ("\"" + (messages[type]) + "\""),
		};
		if (field) { o.field = "\"" + field + "\""; }
		else { o.field = "field"; }
		if (expected != null) { o.expected = expected; }
		if (actual != null) { o.actual = actual; }

		var s = Object.keys(o)
			.map(function (key) { return (key + ": " + (o[key])); })
			.join(", ");

		return ("errors.push({ " + s + " });");
	};

	/**
		 * Generate custom validator function source code.
		 * @param {Object} opts
		 * @param {String} opts.vName
		 * @param {String} opts.fnName
		 * @param {String} opts.ruleIndex
		 * @param {String} opts.path
		 * @param {Object} opts.schema
		 * @param {Object} opts.context
	 	 * @param {Object} opts.messages
		 */
	Validator.prototype.makeCustomValidator = function makeCustomValidator (ref) {
			var vName = ref.vName; if ( vName === void 0 ) vName = "value";
			var fnName = ref.fnName; if ( fnName === void 0 ) fnName = "custom";
			var ruleIndex = ref.ruleIndex;
			var path = ref.path;
			var schema = ref.schema;
			var context = ref.context;
			var messages = ref.messages;

		var ruleVName = "rule" + ruleIndex;
		var fnCustomErrorsVName = "fnCustomErrors" + ruleIndex;
		if (typeof schema[fnName] == "function") {
			if (context.customs[ruleIndex]) {
				context.customs[ruleIndex].messages = messages;
				context.customs[ruleIndex].schema = schema;
			}
			else { context.customs[ruleIndex] = { messages: messages, schema: schema }; }

			if (this.opts.useNewCustomCheckerFunction) {
				return ("\n               \t\tconst " + ruleVName + " = context.customs[" + ruleIndex + "];\n\t\t\t\t\tconst " + fnCustomErrorsVName + " = [];\n\t\t\t\t\t" + vName + " = " + (context.async ? "await " : "") + ruleVName + ".schema." + fnName + ".call(this, " + vName + ", " + fnCustomErrorsVName + " , " + ruleVName + ".schema, \"" + path + "\", parent, context);\n\t\t\t\t\tif (Array.isArray(" + fnCustomErrorsVName + " )) {\n                  \t\t" + fnCustomErrorsVName + " .forEach(err => errors.push(Object.assign({ message: " + ruleVName + ".messages[err.type], field }, err)));\n\t\t\t\t\t}\n\t\t\t\t");
			}

			var result = "res_" + ruleVName;
			return ("\n\t\t\t\tconst " + ruleVName + " = context.customs[" + ruleIndex + "];\n\t\t\t\tconst " + result + " = " + (context.async ? "await " : "") + ruleVName + ".schema." + fnName + ".call(this, " + vName + ", " + ruleVName + ".schema, \"" + path + "\", parent, context);\n\t\t\t\tif (Array.isArray(" + result + ")) {\n\t\t\t\t\t" + result + ".forEach(err => errors.push(Object.assign({ message: " + ruleVName + ".messages[err.type], field }, err)));\n\t\t\t\t}\n\t\t");
		}
		return "";
	};

	/**
		 * Add a custom rule
		 *
		 * @param {String} type
		 * @param {Function} fn
		 */
	Validator.prototype.add = function add (type, fn) {
		this.rules[type] = fn;
	};

	/**
		 * Add a message
		 *
		 * @param {String} name
		 * @param {String} message
		 */
	Validator.prototype.addMessage = function addMessage (name, message) {
		this.messages[name] = message;
	};

	/**
		 * create alias name for a rule
		 *
		 * @param {String} name
		 * @param validationRule
		 */
	Validator.prototype.alias = function alias (name, validationRule) {
		if (this.rules[name]) { throw new Error("Alias name must not be a rule name"); }
		this.aliases[name] = validationRule;
	};

	/**
		 * Add a plugin
		 *
		 * @param {Function} fn
		 */
	Validator.prototype.plugin = function plugin (fn) {
		if (typeof fn !== "function") { throw new Error("Plugin fn type must be function"); }
		return fn(this);
	};

	var validator = Validator;

	var fastestValidator = validator;

	return fastestValidator;

})));
//# sourceMappingURL=index.js.map