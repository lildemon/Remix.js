Remix = require('remix')

window.Module = Remix.create
	remixEvent:
		'click, [ref="ok"]': 'okclick'
	remixChild:
		Spaner: Remix.create
			template: '<h2>Remixed</h2>'
	okclick: ->
		alert 'ok'
	render: ->
		@counter.val('hello')