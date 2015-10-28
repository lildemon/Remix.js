/*
 * Author: ronhng
 * Version: 0.0.1
 * Compile Date: 2015-10-10 14:01
*/ 
// Generated by CoffeeScript 1.7.1
(function() {
  var __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function(factory) {
    if (typeof define === 'function' && (define.amd != null)) {
      define(['jquery'], factory);
    } else if (typeof exports === 'object') {
      module.exports = factory(require('jquery'));
    } else {
      this['Remix'] = factory(jQuery);
    }
  })(function($) {
    var Component, Events, GlobalComp, Log, Module, Remix, moduleKeywords;
    Events = {
      bind: function(ev, callback) {
        var evs, name, _base, _i, _len;
        evs = ev.split(' ');
        if (!this.hasOwnProperty('_callbacks')) {
          this._callbacks || (this._callbacks = {});
        }
        for (_i = 0, _len = evs.length; _i < _len; _i++) {
          name = evs[_i];
          (_base = this._callbacks)[name] || (_base[name] = []);
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
        var args, callback, ev, list, _i, _len, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        ev = args.shift();
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return;
        }
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          callback = list[_i];
          if (callback.apply(this, args) === false) {
            break;
          }
        }
        return true;
      },
      unbind: function(ev, callback) {
        var cb, evs, i, list, name, _i, _j, _len, _len1, _ref;
        if (arguments.length === 0) {
          this._callbacks = {};
          return this;
        }
        if (!ev) {
          return this;
        }
        evs = ev.split(' ');
        for (_i = 0, _len = evs.length; _i < _len; _i++) {
          name = evs[_i];
          list = (_ref = this._callbacks) != null ? _ref[name] : void 0;
          if (!list) {
            continue;
          }
          if (!callback) {
            delete this._callbacks[name];
            continue;
          }
          for (i = _j = 0, _len1 = list.length; _j < _len1; i = ++_j) {
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
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
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
        var key, value, _ref;
        if (!obj) {
          throw new Error('include(obj) requires obj');
        }
        for (key in obj) {
          value = obj[key];
          if (__indexOf.call(moduleKeywords, key) < 0) {
            this.prototype[key] = value;
          }
        }
        if ((_ref = obj.included) != null) {
          _ref.apply(this);
        }
        return this;
      };

      Module.extend = function(obj) {
        var key, value, _ref;
        if (!obj) {
          throw new Error('extend(obj) requires obj');
        }
        for (key in obj) {
          value = obj[key];
          if (__indexOf.call(moduleKeywords, key) < 0) {
            this[key] = value;
          }
        }
        if ((_ref = obj.extended) != null) {
          _ref.apply(this);
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
    Component = (function(_super) {
      __extends(Component, _super);

      Component.include(Events);

      Component.extend(Events);

      Component.loadTemplate = function(template) {
        var errHandle, xhr;
        if (typeof template === 'string') {
          if (!!~template.indexOf('<')) {
            return this.templateNode = $($.parseHTML(template));
          } else {
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
          }
        } else if (template.nodeType && template.nodeType === 1) {
          return this.templateNode = template;
        } else {
          return this.noTemplate = true;
        }
      };

      function Component(node) {
        if (this.constructor.noTemplate) {
          if (node == null) {
            throw 'No template component must created with node';
          }
          this.node = $(node);
        }
        this.child_components = {};
        this._parseRemixChild();
        this._parseNode();
        this.initialize();
      }

      Component.prototype.initialize = function() {};

      Component.prototype.onNodeCreated = function() {};

      Component.prototype.addChild = function(name, childMix) {
        return this[name] = childMix.setParent(this);
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

      Component.prototype.include = function(el, comp) {
        var inst;
        if (comp == null) {
          comp = el;
          el = this.node;
        }
        if (typeof comp === 'function') {
          inst = comp();
          if (inst.node) {
            el.append(inst.node);
          } else {
            el.append(inst);
          }
          return inst.delegateTo(this);
        } else if (comp instanceof Component) {
          return el.append(comp.node);
        } else {
          return el.append(comp);
        }
      };

      Component.prototype.append = function() {
        return this.include.apply(this, arguments);
      };

      Component.prototype.empty = function() {
        return this.node.empty();
      };

      Component.prototype.destroy = function(noRemove) {
        var $id, comp, key, keyedComp, _ref;
        if (typeof this.onDestroy === "function") {
          this.onDestroy();
        }
        if (!noRemove) {
          this.node.remove();
        }
        _ref = this.child_components;
        for ($id in _ref) {
          if (!__hasProp.call(_ref, $id)) continue;
          keyedComp = _ref[$id];
          for (key in keyedComp) {
            if (!__hasProp.call(keyedComp, key)) continue;
            comp = keyedComp[key];
            comp.destroy(true);
          }
        }
        this.off();
        this.node.off();
        return this.parent._delChildComp(this.constructor, this.key);
      };

      Component.prototype._optimistRender = function(state) {
        var whenReady;
        this.state = state;
        whenReady = (function(_this) {
          return function() {
            _this.render(state);
            return setTimeout(_this.proxy(_this._clearComps), 0);
          };
        })(this);
        if (this.constructor.templateNode || this.constructor.noTemplate) {
          whenReady();
        } else {
          this.constructor.one('template-loaded', (function(_this) {
            return function() {
              _this._parseNode();
              return whenReady();
            };
          })(this));
        }
        return this.node;
      };

      Component.prototype._getChildComp = function(CompClass, key) {
        var _ref, _ref1;
        return (_ref = this.child_components) != null ? (_ref1 = _ref[CompClass.$id]) != null ? _ref1[key] : void 0 : void 0;
      };

      Component.prototype._getAllChildComp = function(CompClass) {
        var allComp, comp, id, key, keymap, _ref, _ref1, _ref2;
        if (CompClass) {
          _ref1 = (_ref = this.child_components) != null ? _ref[CompClass.$id] : void 0;
          for (key in _ref1) {
            comp = _ref1[key];
            return comp;
          }
        } else {
          allComp = [];
          _ref2 = this.child_components;
          for (id in _ref2) {
            keymap = _ref2[id];
            for (key in keymap) {
              comp = keymap[key];
              allComp.push(comp);
            }
          }
          return allComp;
        }
      };

      Component.prototype._clearComps = function() {
        var comp, _i, _len, _ref;
        _ref = this._getAllChildComp();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          comp = _ref[_i];
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
        var keyedComp, _base, _name;
        keyedComp = (_base = this.child_components)[_name = CompClass.$id] || (_base[_name] = {});
        if (keyedComp[key] != null) {
          throw "child component already exist!";
        }
        keyedComp[key] = comp;
        return comp;
      };

      Component.prototype._delChildComp = function(CompClass, key) {
        var _ref, _ref1;
        return (_ref = this.child_components) != null ? (_ref1 = _ref[CompClass.$id]) != null ? delete _ref1[key] : void 0 : void 0;
      };

      Component.prototype._parseRemixChild = function() {
        var comp, key, _ref, _results;
        if (this.remixChild && typeof this.remixChild === 'object') {
          _ref = this.remixChild;
          _results = [];
          for (key in _ref) {
            comp = _ref[key];
            _results.push(this.addChild(key, comp));
          }
          return _results;
        }
      };

      Component.prototype._parseNode = function() {
        var nodeReady, oldNode;
        nodeReady = (function(_this) {
          return function() {
            _this._parseRefs();
            _this._parseRemix();
            _this._parseEvents();
            return _this.onNodeCreated();
          };
        })(this);
        if (this.constructor.templateNode) {
          oldNode = this.node;
          this.node = this.constructor.templateNode.clone();
          if (oldNode) {
            oldNode.replaceWith(this.node);
          }
          return nodeReady();
        } else if (this.constructor.noTemplate) {
          return nodeReady();
        } else {
          return this.node = $($.parseHTML('<span class="loading">loading..</span>'));
        }
      };

      Component.prototype._parseRefs = function() {
        return this.node.find('[ref]').not(this.node.find('[remix] [ref]')).each((function(_this) {
          return function(i, el) {
            var $this;
            $this = $(el);
            return _this[$this.attr('ref')] = $this;
          };
        })(this));
      };

      Component.prototype._parseRemix = function() {
        var handleRemixNode;
        handleRemixNode = (function(_this) {
          return function(el) {
            var $el, key, propName, remixedComponent, state, val;
            $el = $(el);
            state = $el.data();
            for (key in state) {
              val = state[key];
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
                        throw "" + propName + " does not exist";
                      }
                    };
                  })(propName);
                }
              }
            }
            remixedComponent = _this[$el.attr('remix')](state, $el.attr('key'), el);
            if (!remixedComponent.constructor.noTemplate) {
              return $el.replaceWith(remixedComponent.node);
            }
          };
        })(this);
        return this.node.find('[remix]').not(this.node.find('[remix] [remix]')).each(function() {
          return handleRemixNode(this);
        });

        /*
        			parseNode = (childNode) =>
        				$(childNode).children().each (i, el) =>
        					if $(el).is '[remix]'
        						handleRemixNode(el)
        					else
        						 * TODO: performance hit, use nodeType detect?
        						parseNode(el)
        
        			parseNode @node
         */
      };

      Component.prototype._parseEvents = function() {
        var eventStr, eventType, handleEvent, handler, selector, _ref, _ref1, _results;
        if (this.remixEvent && typeof this.remixEvent === 'object') {
          _ref = this.remixEvent;
          _results = [];
          for (eventStr in _ref) {
            handler = _ref[eventStr];
            _ref1 = eventStr.split(','), eventType = _ref1[0], selector = _ref1[1];
            eventType = $.trim(eventType);
            selector = $.trim(selector);
            handleEvent = (function(_this) {
              return function(handler) {
                return function(e) {
                  var _ref2;
                  e.stopPropagation();
                  return (_ref2 = _this[handler]) != null ? _ref2.call(_this, e) : void 0;
                };
              };
            })(this)(handler);
            if (selector) {
              _results.push(this.node.on(eventType, selector, handleEvent));
            } else {
              _results.push(this.node.on(eventType, handleEvent));
            }
          }
          return _results;
        }
      };

      return Component;

    })(Module);
    GlobalComp = new Component();
    Remix = (function(_super) {
      __extends(Remix, _super);

      function Remix() {
        return Remix.__super__.constructor.apply(this, arguments);
      }

      Remix.include(Events);

      Remix.id_counter = 1;

      Remix.create = function(name, definition) {
        var NewComp, NewRemix, setParent;
        if (definition == null) {
          definition = name;
          name = null;
        }
        NewComp = (function(_super1) {
          __extends(NewComp, _super1);

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
          CompProxy = function(state, key, node) {
            var comp;
            if (!key) {
              key = '$default';
            }
            comp = parent._getChildComp(NewComp, key);
            if (!comp) {
              comp = new NewComp(node);
              comp.parent = parent;
              comp.creator = CompProxy;
              comp.key = key;
              parent._regChildComp(comp, NewComp, key);
            }
            comp._optimistRender(state);
            return comp;
          };
          CompProxy.setParent = setParent;
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
