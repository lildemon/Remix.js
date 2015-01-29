Remix = require('remix')

window.Module = Remix.create
	remixEvent:
		'click, ok': 'okclick'
	remixChild:
		Spaner: Remix.create
			render: ->
				@node.text(@state.h2)
	okclick: ->
		@counting()
		@Spaner({h2: 'HEIHEI'})

	initialRender: ->
		# @state avaliable, some time this is desired place
		# include, but not replace
		@refs.dummy.empty()
		@include @refs.dummy, Remix.create
			template: '<h3>' + Math.random() * 100000 +'</h3>'
			onDestroy: ->
				console.log 'random destroy'
			render: ->
				setTimeout =>
					@node.text('sdlkfj')
				, 1000

	render: ->
		# render does not dealing with 业务
		# render need to render 'state' out
		@refs.counter.val(@state.value)


	
	counting: ->
		clearInterval(@timer)
		@second = 0
		@timer = setInterval =>
			@setState
				value: @second++
		, 1000

Module({}, null, document.getElementById('module'))