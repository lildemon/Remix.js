// Generated by CoffeeScript 1.12.4
(function() {
  var slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (function(factory) {
    if (typeof define === 'function' && (define.amd != null)) {
      define(['jquery'], factory);
    } else if (typeof exports === 'object') {
      module.exports = factory(require('jquery'));
    } else {
      this['Remix'] = factory(typeof jQuery === 'undefined' ? Zepto : jQuery);
    }
  })(function($) {
    var Component, Events, GlobalComp, Log, Module, Remix, moduleKeywords;
    Events = {
      bind: function(ev, callback) {
        var base, evs, j, len, name;
        evs = ev.split(' ');
        if (!this.hasOwnProperty('_callbacks')) {
          this._callbacks || (this._callbacks = {});
        }
        for (j = 0, len = evs.length; j < len; j++) {
          name = evs[j];
          (base = this._callbacks)[name] || (base[name] = []);
          this._callbacks[name].push(callback);
        }
        return this;
      },
      one: function(ev, callback) {
        var handler;
        return this.bind(ev, handler = function() {
          this.unbind(ev, handler);
          return callback.apply(this, arguments);
        });
      },
      trigger: function() {
        var args, callback, ev, j, len, list, ref1;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        ev = args.shift();
        list = (ref1 = this._callbacks) != null ? ref1[ev] : void 0;
        if (!list) {
          return;
        }
        for (j = 0, len = list.length; j < len; j++) {
          callback = list[j];
          if (callback.apply(this, args) === false) {
            break;
          }
        }
        return true;
      },
      unbind: function(ev, callback) {
        var cb, evs, i, j, k, len, len1, list, name, ref1;
        if (arguments.length === 0) {
          this._callbacks = {};
          return this;
        }
        if (!ev) {
          return this;
        }
        evs = ev.split(' ');
        for (j = 0, len = evs.length; j < len; j++) {
          name = evs[j];
          list = (ref1 = this._callbacks) != null ? ref1[name] : void 0;
          if (!list) {
            continue;
          }
          if (!callback) {
            delete this._callbacks[name];
            continue;
          }
          for (i = k = 0, len1 = list.length; k < len1; i = ++k) {
            cb = list[i];
            if (!(cb === callback)) {
              continue;
            }
            list = list.slice();
            list.splice(i, 1);
            this._callbacks[name] = list;
            break;
          }
        }
        return this;
      }
    };
    Events.on = Events.bind;
    Events.off = Events.unbind;
    Log = {
      trace: true,
      logPrefix: '(Remix)',
      log: function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        if (!this.trace) {
          return;
        }
        if (this.logPrefix) {
          args.unshift(this.logPrefix);
        }
        if (typeof console !== "undefined" && console !== null) {
          if (typeof console.log === "function") {
            console.log.apply(console, args);
          }
        }
        return this;
      }
    };
    moduleKeywords = ['included', 'extended'];
    Module = (function() {
      Module.include = function(obj) {
        var key, ref1, value;
        if (!obj) {
          throw new Error('include(obj) requires obj');
        }
        for (key in obj) {
          value = obj[key];
          if (indexOf.call(moduleKeywords, key) < 0) {
            this.prototype[key] = value;
          }
        }
        if ((ref1 = obj.included) != null) {
          ref1.apply(this);
        }
        return this;
      };

      Module.extend = function(obj) {
        var key, ref1, value;
        if (!obj) {
          throw new Error('extend(obj) requires obj');
        }
        for (key in obj) {
          value = obj[key];
          if (indexOf.call(moduleKeywords, key) < 0) {
            this[key] = value;
          }
        }
        if ((ref1 = obj.extended) != null) {
          ref1.apply(this);
        }
        return this;
      };

      Module.proxy = function(func) {
        return (function(_this) {
          return function() {
            return func.apply(_this, arguments);
          };
        })(this);
      };

      Module.prototype.proxy = function(func) {
        return (function(_this) {
          return function() {
            return func.apply(_this, arguments);
          };
        })(this);
      };

      function Module() {
        if (typeof this.init === "function") {
          this.init.apply(this, arguments);
        }
      }

      return Module;

    })();
    $.parseHTML = $.parseHTML || function(html) {
      return html;
    };
    Component = (function(superClass) {
      extend(Component, superClass);

      Component.include(Events);

      Component.extend(Events);

      Component.loadTemplate = function(template) {
        var errHandle, xhr;
        if (template == null) {
          this.noTemplate = true;
          return;
        }
        if (typeof template === 'string') {
          if (!!~template.indexOf('<')) {
            template = $.trim(template);
            return this.templateNode = $($.parseHTML(template));
          } else if (!!~template.indexOf('/')) {
            xhr = $.get(template);
            xhr.done((function(_this) {
              return function(html) {
                return _this.templateNode = $($.parseHTML(html));
              };
            })(this));
            errHandle = (function(_this) {
              return function() {
                return _this.templateNode = $($.parseHTML("<span>Error loading template: " + templateStr + " </span>"));
              };
            })(this);
            xhr.fail(errHandle);
            return xhr.complete((function(_this) {
              return function() {
                return _this.trigger('template-loaded');
              };
            })(this));
          } else {
            return this.templateNode = $(template);
          }
        } else {
          return this.templateNode = $(template);
        }

        /*
        			else if template.nodeType and template.nodeType is 1
        				@templateNode = template
        			else
        				throw 'What kind of template is this?'
         */
      };

      function Component(parent, node) {
        var runInit;
        this.parent = parent;
        if (node) {
          this.node = $(node);
        } else if (this.constructor.noTemplate) {
          throw 'No template component must created with node';
        }
        this._is_lazy_load = !(this.constructor.templateNode || this.constructor.noTemplate || this.constructor === Component);
        this.child_components = {};
        this.state = this._getInitialState();
        this.refs = {};
        this.childs = {};
        this._last_state_map = {};
        this._initialRender = true;
        this._parseRemixChild();
        this._parseNode();
        runInit = (function(_this) {
          return function() {
            _this._runMixinMethod('initialize');
            return _this.initialize();
          };
        })(this);
        if (this._is_lazy_load) {
          this.constructor.one('template-loaded', (function(_this) {
            return function() {
              _this._parseNode();
              return runInit();
            };
          })(this));
        } else {
          runInit();
        }
      }

      Component.prototype.initialize = function() {};

      Component.prototype.getInitialState = function() {};

      Component.prototype.onNodeCreated = function() {};

      Component.prototype.onTransclude = function() {};

      Component.prototype.addChild = function(name, childMix) {
        return this[name] = childMix.setParent(this);
      };

      Component.prototype.setState = function(state) {
        return this._optimistRender(state);
      };

      Component.prototype.render = function() {
        this.trigger('updated');
        return this.node;
      };

      Component.prototype.appendTo = function(node) {
        this.node.appendTo(node);
        return this;
      };

      Component.prototype.nodeTrigger = function() {
        return this.node.trigger.apply(this.node, arguments);
      };

      Component.prototype.delegateTo = function(parent) {
        this.parent._delChildComp(this.constructor, this.key);
        parent._regChildComp(this, this.constructor, this.key);
        this.parent = parent;
        this.creator = this.creator.setParent(parent);
        return this;
      };

      Component.prototype.delegate = function(child) {
        return child.delegateTo(this);
      };

      Component.prototype.append = function(comp, el) {
        if (el == null) {
          el = this.node;
        }
        if (typeof comp === 'function') {
          comp = comp();
          if (comp.node) {
            el.append(comp.node);
          } else {
            el.append(comp);
          }
          if (typeof comp.delegateTo === "function") {
            comp.delegateTo(this);
          }
        } else if (comp instanceof Component) {
          el.append(comp.node);
          comp.delegateTo(this);
        } else {
          el.append(comp);
        }
        return comp;
      };

      Component.prototype.include = function(comp, el) {
        if (el != null) {
          if (typeof el.empty === "function") {
            el.empty();
          }
        }
        comp = this.append.apply(this, arguments);
        setTimeout(this.proxy(this._clearComps), 0);
        return comp;
      };

      Component.prototype.empty = function() {
        return this.node.empty();
      };

      Component.prototype.destroy = function(noRemove) {
        var $id, comp, key, keyedComp, ref1;
        this._runMixinMethod('onDestroy');
        if (typeof this.onDestroy === "function") {
          this.onDestroy();
        }
        if (!noRemove) {
          this.node.remove();
        }
        ref1 = this.child_components;
        for ($id in ref1) {
          if (!hasProp.call(ref1, $id)) continue;
          keyedComp = ref1[$id];
          for (key in keyedComp) {
            if (!hasProp.call(keyedComp, key)) continue;
            comp = keyedComp[key];
            comp.destroy(true);
          }
        }
        this.off();
        this.node.off();
        return this.parent._delChildComp(this.constructor, this.key);
      };

      Component.prototype._getInitialState = function() {
        var j, len, mixinStates, ref1, s, state;
        state = {};
        mixinStates = this._runMixinMethod('getInitialState');
        if ($.isArray(mixinStates)) {
          ref1 = this._runMixinMethod('getInitialState');
          for (j = 0, len = ref1.length; j < len; j++) {
            s = ref1[j];
            $.extend(state, s);
          }
        }
        $.extend(state, this.getInitialState());
        return state;
      };

      Component.prototype._optimistRender = function(state) {
        var whenReady;
        if (typeof state === 'object') {
          $.extend(this.state, state);
        } else {
          this.state = state;
        }
        whenReady = (function(_this) {
          return function() {
            if (_this._initialRender) {
              if (typeof _this.initialRender === "function") {
                _this.initialRender(state);
              }
              _this._initialRender = false;
            }
            _this._runMixinMethod('render', state);
            _this._runRemixStateHandler(state);
            _this.render(state);
            return setTimeout(_this.proxy(_this._clearComps), 0);
          };
        })(this);
        if (this._is_lazy_load) {
          this.constructor.one('template-loaded', whenReady);
        } else {
          whenReady();
        }
        return this.node;
      };

      Component.prototype._getChildComp = function(CompClass, key) {
        var ref1, ref2;
        return (ref1 = this.child_components) != null ? (ref2 = ref1[CompClass.$id]) != null ? ref2[key] : void 0 : void 0;
      };

      Component.prototype._getAllChildComp = function(CompClass) {
        var allComp, comp, id, key, keymap, ref1, ref2, ref3, results;
        if (CompClass) {
          ref2 = (ref1 = this.child_components) != null ? ref1[CompClass.$id] : void 0;
          results = [];
          for (key in ref2) {
            comp = ref2[key];
            results.push(comp);
          }
          return results;
        } else {
          allComp = [];
          ref3 = this.child_components;
          for (id in ref3) {
            keymap = ref3[id];
            for (key in keymap) {
              comp = keymap[key];
              allComp.push(comp);
            }
          }
          return allComp;
        }
      };

      Component.prototype._clearComps = function() {
        var comp, j, len, ref1;
        ref1 = this._getAllChildComp();
        for (j = 0, len = ref1.length; j < len; j++) {
          comp = ref1[j];
          if (comp._preserve) {
            continue;
          }
          if (!$.contains(document.documentElement, comp.node[0])) {
            comp.destroy();
          }
        }
        return null;
      };

      Component.prototype._regChildComp = function(comp, CompClass, key) {
        var base, keyedComp, name1;
        keyedComp = (base = this.child_components)[name1 = CompClass.$id] || (base[name1] = {});
        if ((keyedComp[key] != null) && keyedComp[key] !== comp) {
          keyedComp[key].destroy();
        }
        keyedComp[key] = comp;
        return comp;
      };

      Component.prototype._delChildComp = function(CompClass, key) {
        var ref1, ref2;
        return (ref1 = this.child_components) != null ? (ref2 = ref1[CompClass.$id]) != null ? delete ref2[key] : void 0 : void 0;
      };

      Component.prototype._parseRemixChild = function() {
        var comp, key, ref1, results;
        if (this.remixChild && typeof this.remixChild === 'object') {
          ref1 = this.remixChild;
          results = [];
          for (key in ref1) {
            comp = ref1[key];
            results.push(this.addChild(key, comp));
          }
          return results;
        }
      };

      Component.prototype._parseNode = function() {
        var nodeReady, oldNode;
        nodeReady = (function(_this) {
          return function(oldNode) {
            _this._parseRefs();
            _this._runMixinMethod('onTransclude', oldNode);
            _this.onTransclude(oldNode);
            _this._parseRemix();
            _this._parseRemixBindState();
            _this._parseEvents();
            _this._runMixinMethod('onNodeCreated', oldNode);
            return _this.onNodeCreated(oldNode);
          };
        })(this);
        if (this.constructor.noTemplate) {
          nodeReady();
          return;
        }
        oldNode = this.node;
        if (this.constructor.templateNode) {
          this.node = this.constructor.templateNode.clone();
          if (oldNode) {
            oldNode.replaceWith(this.node);
          }
          return nodeReady(oldNode);
        } else {
          this.node = $($.parseHTML('<span class="loading">loading..</span>'));
          if (oldNode) {
            return oldNode.replaceWith(this.node);
          }
        }
      };

      Component.prototype._parseRefs = function() {
        var refnodes, remixnodes;
        refnodes = this.node.find('[ref]');
        remixnodes = this.node.find('[remix]');
        if (remixnodes.length) {
          refnodes = refnodes.not(remixnodes.find('[ref]'));
        }
        return refnodes.each((function(_this) {
          return function(i, el) {
            var $this;
            $this = $(el);
            return _this.refs[$this.attr('ref')] = $this;
          };
        })(this));
      };

      Component.prototype._parseRemix = function() {
        var handleRemixNode;
        handleRemixNode = (function(_this) {
          return function(el) {
            var $el, RemixClass, className, compBeforeRender, e, key, propName, remixedComponent, state, val;
            $el = $(el);
            try {
              state = $el.data();
              state = $.extend({}, state);
            } catch (error) {
              e = error;
              throw 'This build of Zepto does not support data() -> object';
            }
            for (key in state) {
              val = state[key];
              val = val + "";
              if (val.indexOf('@') === 0) {
                propName = val.substring(1);
                if (_this[propName] != null) {
                  state[key] = _this.proxy(_this[propName]);
                } else {
                  state[key] = (function(propName) {
                    return function() {
                      if (_this[propName]) {
                        return _this[propName]();
                      } else {
                        throw propName + " does not exist";
                      }
                    };
                  })(propName);
                }
              }
            }
            className = $el.attr('remix');
            RemixClass = _this[className];
            if (RemixClass == null) {
              if (Remix[className] != null) {
                RemixClass = _this.addChild(className, Remix[className]);
              } else {
                throw "Remixing child \"" + className + "\" does not exist";
              }
            }
            compBeforeRender = function(comp) {
              var refName;
              refName = $el.attr('ref');
              if (refName) {
                _this.refs[refName] = comp.node;
                return _this.childs[refName] = comp;
              }
            };
            return remixedComponent = RemixClass(state, $el.attr('key'), el, compBeforeRender);
          };
        })(this);
        return this.node.find('[remix]').not(this.node.find('[remix] [remix]')).each(function() {
          return handleRemixNode(this);
        });
      };

      Component.prototype._parseRemixBindState = function() {
        return this.node.on('change', (function(_this) {
          return function(e) {
            var $this, state_key, state_obj;
            if (e.target === e.currentTarget) {
              return;
            }
            e.stopPropagation();
            $this = $(e.target);
            state_key = $this.attr('remix-bind-state');
            if (state_key) {
              state_obj = {};
              state_obj[state_key] = $this.val();
              return _this.setState(state_obj);
            }
          };
        })(this));
      };

      Component.prototype._parseEvents = function() {
        var eventStr, eventType, handleEvent, handler, ref, ref1, ref2, refProp, results, selector;
        if (this.remixEvent && typeof this.remixEvent === 'object') {
          ref1 = this.remixEvent;
          results = [];
          for (eventStr in ref1) {
            handler = ref1[eventStr];
            ref2 = eventStr.split(','), eventType = ref2[0], selector = ref2[1], refProp = ref2[2];
            eventType = $.trim(eventType);
            if (selector != null) {
              selector = $.trim(selector);
              if (refProp == null) {
                refProp = selector;
                selector = null;
              } else {
                refProp = $.trim(refProp);
              }
            }
            handleEvent = (function(_this) {
              return function(handler) {
                return function(e) {
                  var selfHandler;
                  selfHandler = _this[handler];
                  if (selfHandler == null) {
                    throw "handler " + handler + " not found";
                  }
                  return selfHandler != null ? selfHandler.call(_this, e, $(e.currentTarget)) : void 0;
                };
              };
            })(this)(handler);
            ref = refProp ? (refProp === '@' ? this.node : this.refs[refProp]) : this.node;
            if (ref == null) {
              throw "Event's referencing node \"" + refProp + "\" does not exist";
            }
            if (selector) {
              results.push(ref.on(eventType, selector, handleEvent));
            } else {
              results.push(ref.on(eventType, handleEvent));
            }
          }
          return results;
        } else if (typeof this.remixEvent === 'function') {
          this.remixEvent = this.remixEvent();
          return this._parseEvents();
        }
      };

      Component.prototype._runMixinMethod = function() {
        var args, j, len, mixin, name, ref1, ref2, results;
        name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        if ($.isArray(this.mixins)) {
          ref1 = this.mixins;
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            mixin = ref1[j];
            results.push((ref2 = mixin[name]) != null ? typeof ref2.apply === "function" ? ref2.apply(this, args) : void 0 : void 0);
          }
          return results;
        }
      };

      Component.prototype._runRemixStateHandler = function(state) {
        var handler, key, results, val;
        if (this.remixStateHandler) {
          results = [];
          for (key in state) {
            val = state[key];
            handler = this.remixStateHandler[key];
            if (handler && val !== this._last_state_map[key]) {
              handler.call(this, val);
              results.push(this._last_state_map[key] = val);
            } else {
              results.push(void 0);
            }
          }
          return results;
        }
      };

      return Component;

    })(Module);
    GlobalComp = new Component();
    Remix = (function(superClass) {
      extend(Remix, superClass);

      function Remix() {
        return Remix.__super__.constructor.apply(this, arguments);
      }

      Remix.include(Events);

      Remix.id_counter = 1;

      Remix.create = function(name, definition) {
        var NewComp, NewRemix, j, key, len, mixin, ref1, setParent, val;
        if (definition == null) {
          definition = name;
          name = null;
        }
        if (!$.isArray(definition.mixins)) {
          definition.mixins = definition.mixins != null ? [definition.mixins] : [];
        }
        ref1 = definition.mixins;
        for (j = 0, len = ref1.length; j < len; j++) {
          mixin = ref1[j];
          for (key in mixin) {
            if (!hasProp.call(mixin, key)) continue;
            val = mixin[key];
            if ((Component.prototype[key] == null) && (definition[key] == null)) {
              definition[key] = val;
            }
          }
        }
        NewComp = (function(superClass1) {
          extend(NewComp, superClass1);

          function NewComp() {
            return NewComp.__super__.constructor.apply(this, arguments);
          }

          NewComp.include(definition);

          NewComp.loadTemplate(definition.template);

          NewComp.$id = Remix.id_counter++;

          return NewComp;

        })(Component);
        setParent = function(parent) {
          var CompProxy;
          CompProxy = function(state, key, node, callWithCompBeforeRender) {
            var comp;
            node = $(node).get(0);
            if (!key) {
              key = '$default';
            }
            comp = parent._getChildComp(NewComp, key);
            if (!comp) {
              comp = new NewComp(parent, node);
              comp.creator = CompProxy;
              comp.key = key;
              parent._regChildComp(comp, NewComp, key);
            }
            if (typeof callWithCompBeforeRender === "function") {
              callWithCompBeforeRender(comp);
            }
            comp._optimistRender(state);
            return comp;
          };
          CompProxy.setParent = setParent;
          CompProxy.bindNode = function(node, key) {
            return CompProxy({}, key, node);
          };
          CompProxy.get = function(key) {
            if (!key) {
              key = '$default';
            }
            return parent._getChildComp(NewComp, key);
          };
          CompProxy.getAll = function() {
            return parent._getAllChildComp(NewComp);
          };
          CompProxy.destroyAll = function() {
            return $.each(CompProxy.getAll(), function(i, comp) {
              return comp.destroy();
            });
          };
          CompProxy.extend = function(name, extend_def) {
            if (!extend_def) {
              extend_def = name;
              name = null;
            }
            extend_def = $.extend({}, definition, extend_def);
            return Remix.create(name, extend_def);
          };
          return CompProxy;
        };
        NewRemix = setParent(GlobalComp);
        if (name) {
          Remix[name] = NewRemix;
        }
        return NewRemix;
      };

      return Remix;

    })(Module);
    return Remix;
  });

}).call(this);
