# create component

# Remix.create makes 'Button' itself as function to allow Button('click')
# If comonpnent's template is a url, call Button() will just return a reference Node
# After template settled, refs will create, and $(@node).replaceWith(newel), onDataArrive will called again
Button = Remix.create 

	### META
	By new 'Button' created, constructor ensures that
	@node = $.parseHTML(@template) # save node reference

	@destroy: (hard) ->
		@onDestroy?()
		
		# recursively remove node is not necessary, as parent's node removal will also remove child node
		# pass hard = true, if this is the true ROOT
		$(@node).remove() if hard

		# also if this comp has parent, deregister from parent

	# if template not loaded yet
	Button.once 'template-loaded', =>
		@onDataArrive()

	###

	template: """
		<button class="btn-primary" ref="button"></button>
	"""
	eventDSL:
		#<event type (space separated)>, <ref name>
		"click, button": "onButtonClick"

	onDataArrive: (data)->
		# this.button is the button ref
		$(this.button).text(data.title)

	onButtonClick: (e) ->
		# e is jquery event, and this is button component
		# we get button using this method
		$button = $(e.target)
		$button.trigger('custom-click')

	onDestroy: ->
		# remove all event handler
		# remove listened stores
		



# Use component
buttonNode = Button(title: 'HELLO!').node
$('body').append(buttonNode)

# Subsequence call to Button() will update buttonNode's value
Button(title: 'WORLD!')
Button(title: 'FOO!')

# Non-default button
specNode = Button(title: 'SPEC!', 'specid').node
$('body').append(specNode)

# destroy a component
Button(title: 'SPECFOO!', 'specid').destroy(true)

# Child vs Parent componet
Button = require('components/Button')

Alert = Remix.create
	remixChild:
		Button: Button # makes new 'Button' that default parent is 'Alert'

	template: """
		<div class="fixed-center">
			<div class="content" ref="content"></div>
			<div class="buttons-container" ref="btnContainer"></div>
		</div>
	"""

	eventDSL:
		# only event name, this is custom event propagated from child
		"custom-click" : "onOkClick"

	initialize: ->
		# even if template has not yet loaded, @node is already a dummy node
		$(@node).appendTo(document.body) # Alert will make self inserting to DOM

	# rel etc.. can be referenced 
	onNodeCreated: -> # onNodeCreated should called after template has loaded
		# call @Button will register parent with this button's instance
		# when parent destroy, parent will  destroy registered 'Button's as well
		$(@btnContainer).append(@Button(title: '确定', 'okbtn').node)
	
	onDataArrive: (data) ->
		# filtering data and passing to child, let child update itself

		# updating self
		$(@content).html($.parseHTML(data.content))

		# Most of time, we don't need to destroy unneeded child component
		# but if there's performance issue(large list of data), we should destroy the unneeded here
		@calculateAndDestroyUnneed()

	onOkClick: ->
		# dismiss
		@destroy()

Alert('你好')
Alert('世界')
Alert('嘿嘿', 'heiheiAlert')