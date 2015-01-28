do (factory = ($) ->
	# From Spine.js
	Events =
		bind: (ev, callback) ->
			evs   = ev.split(' ')
			@_callbacks or= {} unless @hasOwnProperty('_callbacks')
			for name in evs
				@_callbacks[name] or= []
				@_callbacks[name].push(callback)
			this

		one: (ev, callback) ->
			@bind ev, handler = ->
				@unbind(ev, handler)
				callback.apply(this, arguments)

		trigger: (args...) ->
			ev   = args.shift()
			list = @_callbacks?[ev]
			return unless list
			for callback in list
				break if callback.apply(this, args) is false
			true

		unbind: (ev, callback) ->
			if arguments.length is 0
				@_callbacks = {}
				return this
			return this unless ev
			evs = ev.split(' ')
			for name in evs
				list = @_callbacks?[name]
				continue unless list
				unless callback
					delete @_callbacks[name]
					continue
				for cb, i in list when (cb is callback)
					list = list.slice()
					list.splice(i, 1)
					@_callbacks[name] = list
					break
			this

	Events.on  = Events.bind
	Events.off = Events.unbind

	Log =
		trace: true

		logPrefix: '(App)'

		log: (args...) ->
			return unless @trace
			if @logPrefix then args.unshift(@logPrefix)
			console?.log?(args...)
			this

	moduleKeywords = ['included', 'extended']

	class Module
		@include: (obj) ->
			throw new Error('include(obj) requires obj') unless obj
			for key, value of obj when key not in moduleKeywords
				@::[key] = value
			obj.included?.apply(this)
			this

		@extend: (obj) ->
			throw new Error('extend(obj) requires obj') unless obj
			for key, value of obj when key not in moduleKeywords
				@[key] = value
			obj.extended?.apply(this)
			this

		@proxy: (func) ->
			=> func.apply(this, arguments)

		proxy: (func) ->
			=> func.apply(this, arguments)

		constructor: ->
			@init?(arguments...)

	$.parseHTML = $.parseHTML or (html)->
		return html
	class Component extends Module
		@include Events
		@extend Events
		@templateLoaded = false
		@loadTemplate = (templateStr) ->
			if typeof templateStr is 'string'
				if !!~templateStr.indexOf('<')
					@templateNode = $($.parseHTML(templateStr))
					@templateLoaded = true
				else
					xhr = $.get templateStr
					xhr.done (html)=>
						@templateNode = $($.parseHTML(html))
					errHandle = =>
						@templateNode = $($.parseHTML("<span>Error loading template: #{templateStr} </span>"))
					xhr.fail errHandle
					xhr.complete =>
						@templateLoaded = true
						@.trigger('template-loaded')
						
					#xhr.error errHandle
			else
				#throw '无法解析template'
				@templateLoaded = true

		constructor: ->
			# constructor better not override by child component
			@child_components = {}
			@_parseRemixChild()
			@_parseTemplate()
			@initialize()

		initialize: ->
			# only Remix Child can be garenteed to be used

		onNodeCreated: ->
			# child component should use refs and assume event is alive
			# some parent comp might intrested on child comp's update
				# Panels().on('updated', @proxy(@updateTabs))

		addChild: (name, childMix) ->
			@[name] = childMix.setParent(@)

		render: ->
			# use ref, @node to update.. etc
			#@node
			@trigger('updated')
			@node

		appendTo: (node) ->
			@node.appendTo(node)
			this


		nodeTrigger: ->
			@node.trigger.apply(@node, arguments)

		delegateTo: (parent) ->
			@parent._delChildComp(@constructor, @key)
			parent._regChildComp(this, @constructor, @key)
			@parent = parent
			@creator = @creator.setParent(parent)
			this

		delegate: (child) ->
			child.delegateTo(this)

		include: (el, comp) ->
			unless comp?
				comp = el
				el = @node
			if typeof comp is 'function'
				inst = comp()
				el.append inst.node
				return inst.delegateTo(this)
			else if comp instanceof Component
				el.append comp.node
			else
				el.append comp

		append: -> @include.apply(this, arguments)

		empty: ->
			@node.empty()

		destroy: (noRemove) ->
			@onDestroy?()
			@node.remove() unless noRemove
			for own $id, keyedComp of @child_components
				for own key, comp of keyedComp
					comp.destroy(true) # to let comp unregister listener etc, but not need hard remove
			@off()
			@node.off()
			@parent._delChildComp(@constructor, @key)

		_optimistRender: (data) ->
			@data = data
			# check and get template
			whenReady = =>
				@render(data)
				setTimeout(@proxy(@_clearComps), 0)

			if @constructor.templateLoaded
				whenReady()
				
			else
				@constructor.one 'template-loaded', =>
					@_parseTemplate()
					whenReady()

			@node

		_getChildComp: (CompClass, key) ->
			# The class is unique identifier to this component
			@child_components?[ CompClass.$id ]?[key]

		_getAllChildComp: (CompClass) ->
			if CompClass
				return comp for key, comp of @child_components?[ CompClass.$id ]
			else
				allComp = []
				for id, keymap of @child_components
					for key, comp of keymap
						allComp.push comp
				return allComp

		_clearComps: ->
			for comp in @_getAllChildComp()
				continue if comp._preserve
				unless $.contains(document.documentElement, comp.node[0])
					comp.destroy()
			null

		_regChildComp: (comp, CompClass, key) ->
			keyedComp = @child_components[ CompClass.$id ] or= {}
			throw "child component already exist!" if keyedComp[key]?
			keyedComp[key] = comp
			comp

		_delChildComp: (CompClass, key) ->
			delete @child_components?[ CompClass.$id ]?[key]

		_parseRemixChild: ->
			if @remixChild and typeof @remixChild is 'object'
				for key, comp of @remixChild
					@addChild(key, comp)

		_parseTemplate: ->
			if @constructor.templateLoaded
				oldNode = @node
				if @constructor.templateNode
					@node = @constructor.templateNode.clone()
				else
					@node = $({})
				oldNode.replaceWith(@node) if oldNode
				@_parseRefs()
				@_parseRemix()
				@_parseEvents()
				@onNodeCreated()
			else
				@node = $($.parseHTML('<span class="loading">loading..</span>'))

		_parseRefs: ->
			@node.find('[ref]').each (i, el) =>
				$this = $(el)
				@[$this.attr('ref')] = $this

		_parseRemix: ->
			@node.find('[remix]').each (i, el) =>
				$this = $(el)
				data = $this.data('remix')
				unless data
					data = $this.data()
					for key, val of data
						if val.indexOf('@') is 0
							newVal = do (val) =>
								=>
									funName = val.substring(1)
									if @[funName] then @[funName]() else throw "#{funName} does not exist"
							data[key] = newVal

				$this.replaceWith(@[$this.attr('remix')]($this.data('remix') || $this.data(), $this.attr('key')).node)

		_parseEvents: ->
			# I'm lazy..
			# eventDSL should stop propagating events
			if @remixEvent and typeof @remixEvent is 'object'
				for eventStr, handler of @remixEvent
					[eventType, selector] = eventStr.split(',')
					eventType = $.trim(eventType)
					selector = $.trim(selector)
					handleEvent = do (handler) =>
						(e) =>
							e.stopPropagation()
							@[handler]?.call @, e
					if selector
						@node.on(eventType, selector, handleEvent)
					else
						@node.on(eventType, handleEvent)



	GlobalComp = new Component()

	class Remix extends Module
		@include Events
		@id_counter: 1
		@create: (name, definition)->
			# TODO: Abstract component that only accepts one child component
			unless definition?
				definition = name
				name = null
			class NewComp extends Component
				@include definition
				#@extend definition
				@loadTemplate(definition.template)
				@$id = Remix.id_counter++

			setParent = (parent)->
				CompProxy = (data, key) ->
					key = '$default' unless key
					comp = parent._getChildComp(NewComp, key)
					unless comp
						comp = new NewComp()
						comp.parent = parent
						comp.creator = CompProxy
						comp.key = key
						parent._regChildComp(comp, NewComp, key)

					comp._optimistRender(data)
					comp
				CompProxy.setParent = setParent
				CompProxy.get = (key) ->
					key = '$default' unless key
					parent._getChildComp(NewComp, key)
				CompProxy.getAll = ->
					parent._getAllChildComp(NewComp)
				CompProxy.destroyAll = ->
					$.each CompProxy.getAll(), (i, comp) ->
						comp.destroy()
				CompProxy

			NewRemix = setParent(GlobalComp)
			Remix[name] = NewRemix if name
			NewRemix

	Remix


) -> # factory become result of above
	# 请确保require环境正确地设置了'jquery'的别名alias
	if typeof define is 'function' and define.amd?
		define(['jquery'], factory)
	else if typeof exports is 'object'
		module.exports = factory(require('jquery'))
	else
		@['Remix'] = factory(jQuery)
	return