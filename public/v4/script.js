(function (Sass) {
	Sass.setWorkerUrl('public/v4/sass.worker.js')

	function getDepsOnVersion (version) {
		var depUrl = 'https://cdn.jsdelivr.net/gh/twbs/bootstrap@' + version + '/scss/'
		var deps = [
			'_functions.scss',
			'_variables.scss',
			'mixins/_hover.scss',
			'mixins/_buttons.scss',
			'mixins/_box-shadow.scss',
			'mixins/_gradients.scss',
		]
		var depPromises = []
		var depResults = {}

		for (var i=0; i<deps.length; i++) {
			var depPromise = $.ajax({
				url: depUrl + deps[i],
				dataType: 'text',
				type: 'GET',
			})

			function depPromiseCallback (depIndex) {
				return function (data) {
					depResults[depIndex] = data
				}
			}

			depPromise.then(depPromiseCallback(deps[i]))
			depPromises.push(depPromise)
		}

		return $.when.apply($, depPromises).then(function () {
			var depContent = ''

			for (var i=0; i<deps.length; i++) {
				depContent += '\n' + depResults[deps[i]]
			}

			return $.when(depContent)
		})
	}

	$('#generator-form').on('submit', function (e) {
		e.preventDefault()

		var versionVal = $('#form-version').val()
		var colorVal = $('#form-color').val()
		var classVal = $('#form-class').val()
		classVal = slugify(classVal)

		var processModal = $('#process-modal')
		$(processModal).modal('show')

		var scssContent = '\n.btn-custom { @include button-variant(#' + colorVal + ', #' + colorVal + '); }'
		if ($(this).find('[name="form-outline"]').filter(':checked').val() == 'yes') {
			scssContent = '\n.btn-custom { @include button-outline-variant(#' + colorVal + '); }'
		}

		var promise = getDepsOnVersion(versionVal)
		promise.then(function (depContent) {
			depContent += scssContent

			var sassInstance = new Sass()

			sassInstance.compile(depContent, {
				style: Sass.style.expanded,
			}, function (result) {
				$('#output-text').val(result.text.replace(/\.btn-custom/g, '.btn-' + classVal))
				$('#output-style').html(result.text)
				$(processModal).modal('hide')

				sassInstance.destroy()
			})
		})
	}).on('reset', function () {
		$(this).find('[name="form-outline"][value="no"]').parent().trigger('click')
	})

	// https://gist.github.com/mathewbyrne/1280286
	function slugify (text) {
		return text.toString().toLowerCase()
			.replace(/\s+/g, '-')           // Replace spaces with -
			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
			.replace(/\-\-+/g, '-')         // Replace multiple - with single -
			.replace(/^-+/, '')             // Trim - from start of text
			.replace(/-+$/, '');            // Trim - from end of text
	}

})(Sass)
