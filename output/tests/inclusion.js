(function() {
  var Remix;

  Remix = require('remix');

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
          var _this = this;
          return setTimeout(function() {
            return _this.node.text('sdlkfj');
          }, 1000);
        }
      }));
    },
    render: function() {
      return this.refs.counter.val(this.state.value);
    },
    counting: function() {
      var _this = this;
      clearInterval(this.timer);
      this.second = 0;
      return this.timer = setInterval(function() {
        return _this.setState({
          value: _this.second++
        });
      }, 1000);
    }
  });

  Module({}, null, document.getElementById('module'));

}).call(this);
