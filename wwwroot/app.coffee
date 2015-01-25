Remix = require('../Remix')
Alert = Remix.create
	template: """
		<h1></h1>
	"""
	onNodeCreated: ->
		@node.appendTo(document.body)
	render: (data) ->
		@node.text(data)

Alert('abc')

window.Remix = Remix
window.Alert = Alert