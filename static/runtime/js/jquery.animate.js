//
// programatic API for animate.css
// Justin (justin.yip@me.com)
//
define(function(require){

  var _ = require('../../vendor/underscore/underscore');
  var $ = require('../../vendor/jquery/dist/jquery');

  var EVENTS = 'removeAnimate webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

  $.fn.addAnimate = function(name, options, callback){

    // 只传两个参数，如果第二个参数是函数，则认为是callback
    if ( $.isFunction(options) ) {
      callback = options;
      options = null;
    }
    // defaults
    options = _.defaults(options || {}, {
      reverse: false,
      duration: 1000, // ms
      infinite: false
    });

    // stop current animation
    this.removeAnimate();

    // 动画完成事件Promise化
    var animationend = new Promise(function(resolve, reject){
      // this.one(EVENTS, function(){
      //   // 取消监听
      //   this.off(EVENTS);
      //   // 完成
      //   resolve();
      // }.bind(this));
      this.one(EVENTS, resolve);
    }.bind(this));

    // timeout pormise
    var timeoutPromise = new Promise(function(resolve, reject){
      var timeout = setTimeout(resolve, options.duration + 100);
      this.data('timeout', timeout);
    }.bind(this));

    // 拼出动画class
    var animate_class =['animated', name].join(' ');

    // 通过添加class执行动画
    this.addClass(animate_class).data('animate-class', animate_class);

    // 动画完成或计时器超时，任一条件达成，此机制用于处理android的动画完成函数回调不及时的问题
    return Promise.race([animationend, timeoutPromise])
    .then(function(){
      callback && callback();
    });
  }

  $.fn.removeAnimate = function(){

    this.trigger('removeAnimate');

    clearTimeout( this.data('timeout') );

    this.removeClass( this.data('animate-class') );
  }
});
