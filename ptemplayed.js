/* @preserve
/* my version of https://github.com/archan937/templayed.js/ 
/* The fastest and smallest Mustache compliant Javascript templating library written in 1806 bytes (uncompressed)
/* (c) Paul Engel (Internetbureau Holder B.V.)
*/

/*jshint laxcomma:true, laxbreak: true, asi:true */
;(function() {

	function templayed (template, vars) {
		var get = function(path) {
				var i = 1
				path = path.replace(/\.\.\//g, function() { i++; return ''; })
				var js = ['vars[vars.length - ', i, ']']
				var keys = (path == "." ? [] : path.split("."))
				var j = 0
				for (; j < keys.length; j++) js.push('.' + keys[j])
				/*
					- allow function as property everywhere
					- pass vars as function argument for all function calls
						var foo = {
							bar: function(blaah) {
								console.log(blaah === foo); // true
							}
						}
				*/
				return '(function(x) {return x&&x.call ? x.call(vars[vars.length - 1], vars[0]) : x;})('+js.join('')+')'
			}

		var tag = function(template) {
			return template.replace(/\{\{(!|&|\{)?\s*(.*?)\s*}}+/g, function(match, operator, context) {
				if (operator == "!") return ''
				var i = inc++
				return ['"; var s', i, ' = ', get(context), '; s', i,' = ( s', i,' || s', i,' == 0 ? s', i,': "") + ""; s += ',
					(operator ? ('s' + i) : '(/[&"><]/.test(s' + i + ') ? s' + i + '.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/>/g,"&gt;").replace(/</g,"&lt;") : s' + i + ')'), ' + "'].join('')
				})
			}

		var block = function(template) {
			return tag(template.replace(/\{\{(\^|#)(.*?)}}(.*?)\{\{\/\2}}/g, function(match, operator, key, context) {
				var i = inc++
				return ['"; var o', i, ' = ', get(key), '; ', (
					operator == "^"
					?	['if ((o', i, ' instanceof Array) ? !o', i, '.length : !o', i, ') { s += "', block(context), '"; } ']
					// use truthy/falsy for # ^|#
					:	['if ( !(o', i, ' instanceof Array) && o', i, ') { s += "', block(context), '"; } else if (o', i, ') { for (var i', i, ' = 0; i', i, ' < o',
						i, '.length; i', i, '++) { vars.push(o', i, '[i', i, ']); s += "', block(context), '"; vars.pop(); }}']
				).join(''), '; s += "'].join('')
				}))
			}

		var inc = 0

		return new Function("vars", 'vars = [vars]; var s = "' + block(template.replace(/"/g, '\\"').replace(/\n/g, '\\n')) + '"; return s;');
	}

	if (typeof define === 'function' && define.amd) {
		define(function() {
			return templayed;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = templayed
	} else {
		this.ptemplayed = templayed
	}

}).call(this);