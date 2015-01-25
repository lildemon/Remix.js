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

	remixEvent:
		'click': "onClick"

	onClick: (e) ->
		if @data?.callback
			@data?.callback?()
		alert('BUTTON')
		@nodeTrigger('button-clicked')


	render: (data) ->
		@data = data
		if(data.name)
			@node.text(data.name)

Dialog = Remix.create
	remixChild:
		Button: Button

	template: """
		<div class="fixed-center">
			<div class="content" ref="content"></div>
			<div class="buttons-container" ref="btnContainer">
				<div remix="Button" data-name="helloBtn1" data-callback="@btnCallback" key="btn1"></div>
				<div remix="Button"></div>
			</div>
		</div>
		<h3>TITLE</h3>
	"""

	remixEvent:
		
		'button-clicked': 'onCustomEvent'
		'click, .buttons-container': 'onContainerClick'

	onContainerClick: ->
		alert('container click')

	onCustomEvent: ->
		alert('Custom Event')

	onNodeCreated: ->
		#@btnContainer.append(@Button('HELLO').node)
		@node.appendTo(document.body)

	render: (data) ->
		@content.html(data.html)
		@Button({name: data.button, callback: data.callback}, 'btn1')

	btnCallback: ->
		alert('btncb')

Dialog 
	html: """
		<h2 data-a='adsf' data-b='eoiue'>This is Dialog</h2>
	"""
	button: '确认'
	callback: ->
		alert('sdf')

setTimeout ->
	Dialog 
		html: """
			<h2>Changed Dialog</h2>
		"""
		button: '取消'
, 2000

DialogFrom = window.d =  Remix.create
	template: "/from.html"

DialogFrom()

window.Remix = Remix
window.Alert = Alert
window.Dialog = Dialog
window.Button = Button