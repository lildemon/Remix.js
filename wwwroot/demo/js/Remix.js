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
      logPrefix: '(App)',
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

      Component.templateLoaded = false;

      Component.loadTemplate = function(templateStr) {
        var errHandle, xhr;
        if (typeof templateStr === 'string') {
          if (!!~templateStr.indexOf('<')) {
            this.templateNode = $($.parseHTML(templateStr));
            return this.templateLoaded = true;
          } else {
            xhr = $.get(templateStr);
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
                _this.templateLoaded = true;
                return _this.trigger('template-loaded');
              };
            })(this));
          }
        } else {
          return this.templateLoaded = true;
        }
      };

      function Component() {
        this.child_components = {};
        this._parseRemixChild();
        this._parseTemplate();
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
          el.append(inst.node);
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

      Component.prototype._optimistRender = function(data) {
        var whenReady;
        this.data = data;
        whenReady = (function(_this) {
          return function() {
            _this.render(data);
            return setTimeout(_this.proxy(_this._clearComps), 0);
          };
        })(this);
        if (this.constructor.templateLoaded) {
          whenReady();
        } else {
          this.constructor.one('template-loaded', (function(_this) {
            return function() {
              _this._parseTemplate();
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

      Component.prototype._parseTemplate = function() {
        var oldNode;
        if (this.constructor.templateLoaded) {
          oldNode = this.node;
          if (this.constructor.templateNode) {
            this.node = this.constructor.templateNode.clone();
          } else {
            this.node = $({});
          }
          if (oldNode) {
            oldNode.replaceWith(this.node);
          }
          this._parseRefs();
          this._parseRemix();
          this._parseEvents();
          return this.onNodeCreated();
        } else {
          return this.node = $($.parseHTML('<span class="loading">loading..</span>'));
        }
      };

      Component.prototype._parseRefs = function() {
        return this.node.find('[ref]').each((function(_this) {
          return function(i, el) {
            var $this;
            $this = $(el);
            return _this[$this.attr('ref')] = $this;
          };
        })(this));
      };

      Component.prototype._parseRemix = function() {
        return this.node.find('[remix]').each((function(_this) {
          return function(i, el) {
            var $this, data, key, newVal, val;
            $this = $(el);
            data = $this.data('remix');
            if (!data) {
              data = $this.data();
              for (key in data) {
                val = data[key];
                if (val.indexOf('@') === 0) {
                  newVal = (function(val) {
                    return function() {
                      var funName;
                      funName = val.substring(1);
                      if (_this[funName]) {
                        return _this[funName]();
                      } else {
                        throw "" + funName + " does not exist";
                      }
                    };
                  })(val);
                  data[key] = newVal;
                }
              }
            }
            return $this.replaceWith(_this[$this.attr('remix')]($this.data('remix') || $this.data(), $this.attr('key')).node);
          };
        })(this));
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
          CompProxy = function(data, key) {
            var comp;
            if (!key) {
              key = '$default';
            }
            comp = parent._getChildComp(NewComp, key);
            if (!comp) {
              comp = new NewComp();
              comp.parent = parent;
              comp.creator = CompProxy;
              comp.key = key;
              parent._regChildComp(comp, NewComp, key);
            }
            comp._optimistRender(data);
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
