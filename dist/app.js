/*
 * Author: ronhng
 * Version: 0.0.1
 * Compile Date: 2015-10-10 14:01
*/ 
(function() {
  var Alert, Button, Dialog, DialogFrom, Remix;

  Remix = require('../Remix');

  Alert = Remix.create('Alert', {
    template: "<h1></h1>",
    onNodeCreated: function() {
      return this.node.appendTo(document.body);
    },
    render: function(data) {
      return this.node.text(data);
    }
  });

  Button = Remix.create({
    template: "<button class=\"btn-primary\" ref=\"button\"></button>",
    remixEvent: {
      'click': "onClick"
    },
    onClick: function(e) {
      var _ref, _ref1;
      if ((_ref = this.data) != null ? _ref.callback : void 0) {
        return (_ref1 = this.data) != null ? typeof _ref1.callback === "function" ? _ref1.callback() : void 0 : void 0;
      }
    },
    render: function(data) {
      this.data = data;
      if (data.name) {
        return this.node.text(data.name);
      }
    }
  });

  Dialog = Remix.create({
    remixChild: {
      Button: Button
    },
    template: "<div class=\"fixed-center\">\n	<div class=\"content\" ref=\"content\"></div>\n	<div class=\"buttons-container\" ref=\"btnContainer\">\n		<div remix=\"Button\" data-name=\"helloBtn1\" data-callback=\"@btnCallback\" key=\"btn1\"></div>\n		<div remix=\"Button\"></div>\n	</div>\n</div>\n<h3>TITLE</h3>",
    remixEvent: {
      'button-clicked': 'onCustomEvent'
    },
    onCustomEvent: function() {
      return alert('Custom Event');
    },
    onNodeCreated: function() {
      return this.node.appendTo(document.body);
    },
    render: function(data) {
      this.content.html(data.html);
      return this.Button({
        name: data.button,
        callback: data.callback
      });
    },
    btnCallback: function() {
      return alert('btncb');
    }
  });

  Dialog({
    html: "<h2 data-a='adsf' data-b='eoiue'>This is Dialog</h2>",
    button: '确认',
    callback: function() {
      return Dialog({
        html: 'CALLBACK!'
      });
    }
  });

  setTimeout(function() {
    return Dialog({
      html: "<h2>Changed Dialog</h2>",
      button: '取消'
    });
  }, 2000);

  DialogFrom = window.d = Remix.create({
    template: "/from.html"
  });

  DialogFrom();

  window.Remix = Remix;

  window.Alert = Alert;

  window.Dialog = Dialog;

  window.Button = Button;

}).call(this);
