// VideoView
// ============
// ##author pengguangzong
//
// 视频显示视图，配置参数如下：
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// src | string | true | 来源
// type | string | true | 视频格式类型
// autoplay | boolean | false | 是否自动播放，默认为false
// controls | boolean | false | 是否显示播放控件，默认为true
// height | number | true | 视频控件的高度
// width | number | false | 视频空间的宽度，默认为100%
define(['./BaseView'], function(BaseView) {

  return BaseView.extend({

      type: 'VideoView',
      videoIframeUrl: null,
      options: {},
      /**
      * 此实现方式，性能比较好，但要写很多代码
      */
      render: function() {
          this.$el.empty();
          var videoSrc = this.options.src,
              iframeSrc = null;
              $div = $('<div class="video-div"></div>'); // FIXME 不需要再多一层dom结构

          if(videoSrc.indexOf('qq.com') != -1) {
              var vid = videoSrc.substr(videoSrc.indexOf('vid=') + 4, 11);
              if(vid) {
                  iframeSrc = "http://v.qq.com/iframe/player.html?vid=" + vid + "&amp;auto=0";
              }
          }else if (videoSrc.indexOf('v.youku.com') != -1) {
              var vid  = '';
              if(videoSrc.indexOf("==")){
                   vid = videoSrc.substring(videoSrc.indexOf("id_") + 3, videoSrc.indexOf("=="));
              }else{
                  vid = videoSrc.substring(videoSrc.indexOf("id_") + 3, videoSrc.indexOf(".html"));
              }
              iframeSrc = "http://player.youku.com/embed/" + vid;
          }else if(videoSrc.indexOf('tudou.com') != -1) {
              var vid = videoSrc.substring(videoSrc.lastIndexOf(".html") - 11, videoSrc.lastIndexOf(".html"));
              if(vid) {
                  iframeSrc = "http://www.tudou.com/programs/view/html5embed.action?code=" + vid;
              }
          }


          if(iframeSrc) {
              var $iframe = $('<iframe class="iframe-src" src="' + iframeSrc + '" frameborder="0" scrolling="no"></iframe>');

              $div.append($iframe);
          }else {
              var $h4 = $('<h4 class="video-h4"></h4>');

              if(videoSrc) {
                  $h4.text('不支持此地址');
              }else {
                  $h4.text('请输入视频地址');
              }
              $div.append($h4);
          }

          this.$el.append($div);
          return this;
      }

  });
});
