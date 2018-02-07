(function (map, less) {
	var components = {},
		
		generatorForm = $('#generator-form'),
		formVersion = $('#form-version'),
		formBg = $('#form-bg'),
		formColor = $('#form-color'),
		formClass = $('#form-class'),
		
		outputStyleDefault = $('#output-style-default'),
		outputStyleThemed = $('#output-style-themed'),
		outputDefault = $('#output-default'),
		outputThemed = $('#output-themed'),
		
		hexRegex = /^([a-f0-9]{3}|[a-f0-9]{6})$/i;
	
	function slugify (str) {
		return str.replace(/\./g, '-');
	}
	
	for (var i=0; i<map.length; i++) {
		var key = slugify(map[i])
		components[key] = $('#component-' + key).html();
	}
	
	components.license = $('#component-license').html();
	components.fixed = $('#component-fixed').html();
	
	$(generatorForm).on('submit', function (e) {
		e.preventDefault();
		
		if (hexRegex.test($(formBg).val()) && hexRegex.test($(formColor).val()) && $(formClass).val() != '') {
			var lessFixedStr = components.fixed +
					components[slugify($(formVersion).val())],
				
				lessGenerateDefault = '.btn-' + $(formClass).val() +
					'{#generate > .default(@main-bg: #' + $(formBg).val() +
					'; @main-color: #' + $(formColor).val() + ';);}',
				
				lessGenerateThemed =  '.btn-' + $(formClass).val() +
					'{#generate > .default(@main-bg: #' + $(formBg).val() +
					'; @main-color: #' + $(formColor).val() + ';);' +
					'#generate > .themed(@main-bg: #' + $(formBg).val() + ';);}',
				
				regexCustomClass = new RegExp('-' + $(formClass).val(), 'g');
			
			$(outputStyleDefault).add(outputStyleThemed).empty();
			$(outputDefault).add(outputThemed).val('');
			
			less.render(lessFixedStr + lessGenerateDefault).then(function (output) {
				$(outputDefault).val(output.css);
				
				$(outputStyleDefault).html(function (index, content) {
					return content + output.css.replace(regexCustomClass, '-custom-default');
				});
			});
			
			less.render(lessFixedStr + lessGenerateThemed).then(function (output) {
				$(outputThemed).val(output.css);
				
				$(outputStyleThemed).html(function (index, content) {
					return content + output.css.replace(regexCustomClass, '-custom-themed');
				});
			});
		}
	});
})(map, less);
