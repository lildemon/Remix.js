/*
 * Author: ronhng
 * Version: 0.0.1
 * Compile Date: 2015-10-10 14:01
*/ 
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/packed/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Remix;

	Remix = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"remix\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	window.Module = Remix.create({
	  remixEvent: {
	    'click, ok': 'okclick'
	  },
	  remixChild: {
	    Spaner: Remix.create({
	      render: function() {
	        return this.node.text(this.state.h2);
	      }
	    })
	  },
	  okclick: function() {
	    this.counting();
	    return this.Spaner({
	      h2: 'HEIHEI'
	    });
	  },
	  initialRender: function() {
	    this.refs.dummy.empty();
	    return this.include(this.refs.dummy, Remix.create({
	      template: '<h3>' + Math.random() * 100000 + '</h3>',
	      onDestroy: function() {
	        return console.log('random destroy');
	      },
	      render: function() {
	        return setTimeout((function(_this) {
	          return function() {
	            return _this.node.text('sdlkfj');
	          };
	        })(this), 1000);
	      }
	    }));
	  },
	  render: function() {
	    return this.refs.counter.val(this.state.value);
	  },
	  counting: function() {
	    clearInterval(this.timer);
	    this.second = 0;
	    return this.timer = setInterval((function(_this) {
	      return function() {
	        return _this.setState({
	          value: _this.second++
	        });
	      };
	    })(this), 1000);
	  }
	});

	Module({}, null, document.getElementById('module'));


/***/ }
/******/ ]);