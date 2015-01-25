Remix = require('../Remix')
Alert = Remix.create
	template: """
		<h1></h1>
	"""
	onNodeCreated: ->
		@node.appendTo(document.body)
	render: (data) ->
		@node.text(data)

#Alert('abc')

Button = Remix.create
	template: """
		<button class="btn-primary" ref="button"></button>
	"""
	render: (data) ->
		@node.text(data)

Dialog = Remix.create
	remixChild:
		Button: Button

	template: """
		<div class="fixed-center">
			<div class="content" ref="content"></div>
			<div class="buttons-container" ref="btnContainer">
				<div remix="Button" data-remix="HEULLO" key="btn1"></div>
				<div remix="Button" data-remix="HEUsdfLLO"></div>
			</div>
		</div>
		<h3>TITLE</h3>
	"""
	onNodeCreated: ->
		#@btnContainer.append(@Button('HELLO').node)
		@node.appendTo(document.body)

	render: (data) ->
		@content.html(data.html)
		#@Button(data.button)

Dialog 
	html: """
		<h2 data-a='adsf' data-b='eoiue'>This is Dialog</h2>
	"""
	button: '确认'

setTimeout ->
	Dialog 
		html: """
			<h2>Changed Dialog</h2>
		"""
		button: '取消'
, 2000

window.Remix = Remix
window.Alert = Alert
window.Dialog = Dialog
window.Button = Button