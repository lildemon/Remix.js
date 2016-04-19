do (factory = ($) ->

	# TODO: jQuery helper, remix-router

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

		logPrefix: '(Remix)'

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
		@loadTemplate = (template) ->
			unless template?
				@noTemplate = true
				return

			if typeof template is 'string'
				if !!~template.indexOf('<')
					template = $.trim(template)
					@templateNode = $($.parseHTML(template))
				else if !!~template.indexOf('/')
					xhr = $.get template
					xhr.done (html)=>
						@templateNode = $($.parseHTML(html))
					errHandle = =>
						@templateNode = $($.parseHTML("<span>Error loading template: #{templateStr} </span>"))
					xhr.fail errHandle
					xhr.complete =>
						@.trigger('template-loaded')
						
					#xhr.error errHandle
				else
					@templateNode = $(template)
			else
				@templateNode = $(template)
			###
			else if template.nodeType and template.nodeType is 1
				@templateNode = template
			else
				throw 'What kind of template is this?'
			###

		constructor: (parent, node) ->
			@parent = parent
			# constructor better not override by child component
			if node
				@node = $(node)
			else if @constructor.noTemplate
				throw 'No template component must created with node'

			@_is_lazy_load = !(@constructor.templateNode or @constructor.noTemplate or @constructor is Component)
			@child_components = {}
			@state = @_getInitialState()
			@refs = {}
			@childs = {}
			@_initialRender = true
			@_parseRemixChild()
			@_parseNode()

			runInit = =>
				@_runMixinMethod('initialize')
				@initialize()

			if @_is_lazy_load
				@constructor.one 'template-loaded', =>
					@_parseNode()
					runInit()
			else
				runInit()
		initialize: ->
			# only Remix Child can be garenteed to be used

		getInitialState: ->
			# blank

		onNodeCreated: ->
			# child component should use refs and assume event is alive
			# some parent comp might intrested on child comp's update
				# Panels().on('updated', @proxy(@updateTabs))

		onTransclude: ->
			# deprecate above

		addChild: (name, childMix) ->
			# add a Remix Component class to this instance, make this instance as its parent
			@[name] = childMix.setParent(this)

		setState: (state) ->
			@_optimistRender(state)

		render: ->
			# use ref, @node to update.. etc
			# @state will be avaliable
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

		append: (comp, el) ->
			unless el?
				el = @node
			if typeof comp is 'function'
				# NOTICE: Edge case when comp with default key already 'appended', which will be rerendered and append to new position
				comp = comp()
				if comp.node then el.append comp.node else el.append comp
				comp.delegateTo?(this)
			else if comp instanceof Component
				el.append comp.node
				comp.delegateTo(this)
			else
				el.append comp
			comp

		include: (comp, el) ->
			if el?
				el.empty?()
			comp = @append.apply(this, arguments)
			# reclaim memory after include
			setTimeout(@proxy(@_clearComps), 0)
			comp

		empty: ->
			@node.empty()

		destroy: (noRemove) ->
			@_runMixinMethod('onDestroy')
			@onDestroy?()
			@node.remove() unless noRemove
			for own $id, keyedComp of @child_components
				for own key, comp of keyedComp
					comp.destroy(true) # to let comp unregister listener etc, but not need hard remove
			@off()
			@node.off()
			@parent._delChildComp(@constructor, @key)

		_getInitialState: ->
			state = {}
			mixinStates = @_runMixinMethod('getInitialState')
			if $.isArray mixinStates
				for s in @_runMixinMethod('getInitialState')
					$.extend(state, s)
			$.extend(state, @getInitialState())
			state

		_optimistRender: (state) ->
			if typeof state is 'object'
				$.extend(@state, state)
			else
				@state = state
			# check and get template
			whenReady = =>
				if @_initialRender
					@initialRender?(state)
					@_initialRender = false
				@_runMixinMethod('render', state)
				@render(state)
				#setTimeout((=> @render(state)), 0) # render for nextTick to make sure parent initialized properly
				setTimeout(@proxy(@_clearComps), 0)

			if @_is_lazy_load
				@constructor.one 'template-loaded', whenReady
			else
				whenReady()

			@node

		_getChildComp: (CompClass, key) ->
			# The class is unique identifier to this component
			@child_components?[ CompClass.$id ]?[key]


		_getAllChildComp: (CompClass) ->
			if CompClass
				comp for key, comp of @child_components?[ CompClass.$id ]
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
			if keyedComp[key]? and keyedComp[key] isnt comp
				# Replace existing component
				keyedComp[key].destroy()
			keyedComp[key] = comp
			comp

		_delChildComp: (CompClass, key) ->
			delete @child_components?[ CompClass.$id ]?[key]

		_parseRemixChild: ->
			if @remixChild and typeof @remixChild is 'object'
				for key, comp of @remixChild
					@addChild(key, comp)

		_parseNode: ->
			nodeReady = (oldNode) =>
				@_parseRefs()

				# Transclude here to be able to access ref node and parse remix next
				@_runMixinMethod('onTransclude', oldNode)
				@onTransclude(oldNode)

				@_parseRemix()
				@_parseEvents()

				# TODO: deprecate onNodeCreated
				@_runMixinMethod('onNodeCreated', oldNode)
				@onNodeCreated(oldNode)

			if @constructor.noTemplate
				nodeReady()
				return

			oldNode = @node
			if @constructor.templateNode
				@node = @constructor.templateNode.clone() # TODO: node might be unnecessarily cloned, if template is 'string'
				oldNode.replaceWith(@node) if oldNode
				nodeReady(oldNode)
			else
				@node = $($.parseHTML('<span class="loading">loading..</span>'))
				oldNode.replaceWith(@node) if oldNode

		_parseRefs: ->
			refnodes = @node.find('[ref]')
			remixnodes = @node.find('[remix]')
			if remixnodes.length
				refnodes = refnodes.not(remixnodes.find('[ref]'))
			refnodes.each (i, el) =>
				$this = $(el)
				@refs[$this.attr('ref')] = $this

		_parseRemix: ->
			handleRemixNode = (el) =>
				$el = $(el)
				try
					state = $el.data()
					state = $.extend({}, state) # Zepto will clear data if manipulates $el node
				catch e
					throw 'This build of Zepto does not support data() -> object'
				for key, val of state
					val = val + ""
					if val.indexOf('@') is 0
						propName = val.substring(1)
						if @[propName]?
							state[key] = @proxy(@[propName])
						else
							state[key] = do (propName) =>
								=>
									if @[propName] then @[propName]() else throw "#{propName} does not exist"
				className = $el.attr('remix')
				RemixClass = @[className]
				unless RemixClass?
					if Remix[className]?
						RemixClass = @addChild(className, Remix[className])
					else
						throw "Remixing child \"#{className}\" does not exist"

				compBeforeRender = (comp) => # 在render之前保证parent已经有ref和childs引用，以免调用链中使用到
					refName = $el.attr 'ref'
					if refName
						@refs[refName] = comp.node
						# 如果remix对象有ref属性，把引用保存于childs中
						@childs[refName] = comp

				remixedComponent = RemixClass(state, $el.attr('key'), el, compBeforeRender) #replace happend in constructor
				#unless remixedComponent.constructor.noTemplate
				#	$el.replaceWith(remixedComponent.node)



			# TODO: is there a better selector?
			@node.find('[remix]').not(@node.find('[remix] [remix]')).each ->
				handleRemixNode(this)

			

		_parseEvents: ->
			# eventDSL should stop propagating events
			if @remixEvent and typeof @remixEvent is 'object'
				for eventStr, handler of @remixEvent
					[eventType, selector, refProp] = eventStr.split(',')
					eventType = $.trim(eventType)
					if selector?
						selector = $.trim(selector)
						unless refProp?
							refProp = selector
							selector = null
						else
							refProp = $.trim(refProp)
					handleEvent = do (handler) =>
						(e) =>
							# In zepto, tap event is capture on body, if touch event is stopPropagation, tap event will never fired
							# e.stopPropagation()
							selfHandler = @[handler]
							unless selfHandler?
								throw "handler #{handler} not found"
							selfHandler?.call @, e, $(e.currentTarget)
					ref = if refProp then (if refProp is '@' then @node else @refs[refProp]) else @node
					unless ref?
						throw "Event's referencing node \"#{refProp}\" does not exist"
					if selector
						ref.on(eventType, selector, handleEvent)
					else
						ref.on(eventType, handleEvent)

			else if typeof @remixEvent is 'function'
				@remixEvent = @remixEvent()
				@_parseEvents()

		_runMixinMethod: (name, args...) ->
			if $.isArray(@mixins)
				mixin[name]?.apply?(this, args) for mixin in @mixins


	GlobalComp = new Component()

	class Remix extends Module
		@include Events
		@id_counter: 1
		@create: (name, definition)->
			# TODO: Abstract component that only accepts one child component
			unless definition?
				definition = name
				name = null
			unless $.isArray(definition.mixins)
				definition.mixins = if definition.mixins? then [definition.mixins] else []

			# defferent from React.js, definition's method overrides mixin's
			# mixin provides dynamic behavior of component
			# http://blog.krawaller.se/posts/a-react-encapsulation-pattern/
			for mixin in definition.mixins
				for own key, val of mixin
					# mixin method should not override definitions and components original method
					# TODO: edge case, upcoming mixin wont override previous mixin method
					if not Component::[key]? and not definition[key]?
						definition[key] = val

			class NewComp extends Component
				@include definition # include is become prototype
				#@extend definition
				@loadTemplate(definition.template)
				@$id = Remix.id_counter++

			setParent = (parent)->
				CompProxy = (state, key, node, callWithCompBeforeRender) ->
					node = $(node).get(0)
					key = '$default' unless key
					comp = parent._getChildComp(NewComp, key)
					unless comp
						comp = new NewComp(parent, node)
						comp.creator = CompProxy
						comp.key = key
						parent._regChildComp(comp, NewComp, key)

					callWithCompBeforeRender?(comp)
					comp._optimistRender(state)
					comp
				CompProxy.setParent = setParent
				CompProxy.bindNode = (node, key) ->
					CompProxy({}, key, node)
					#CompProxy
				CompProxy.get = (key) ->
					key = '$default' unless key
					parent._getChildComp(NewComp, key)
				CompProxy.getAll = ->
					parent._getAllChildComp(NewComp)
				CompProxy.destroyAll = ->
					$.each CompProxy.getAll(), (i, comp) ->
						comp.destroy()
				CompProxy.extend = (name, extend_def) ->
					unless extend_def
						extend_def = name
						name = null
					extend_def = $.extend({}, definition, extend_def)
					Remix.create(name, extend_def)
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
		@['Remix'] = factory(if (typeof jQuery == 'undefined') then Zepto else jQuery)
	return