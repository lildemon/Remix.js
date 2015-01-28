Remix = require('remix')

window.Module = Remix.create
	remixEvent:
		'click, [ref="ok"]': 'okclick'
	okclick: ->
		alert 'ok'
	render: ->
		@counter.val('hello')