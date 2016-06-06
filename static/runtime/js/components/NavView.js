define(['./BaseView'], function(BaseView){

  return BaseView.extend({

    type: 'NavView',

    defaults: {
      title: '导航栏'
    },

    render: function(){

      // 文本容器
      var text_el = document.createElement('div');
      this.el.appendChild(text_el);

      // 文本节点
      this.textNode = document.createTextNode(this.options.title || '');
      text_el.appendChild(this.textNode);

      return this;
    }

  });
});
