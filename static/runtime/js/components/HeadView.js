/**
 * Created by liuqingling on 16/6/5.
 */

define(['./BaseView', 'jquery'], (BaseView, $)=> {
    require('../../css/header.less');
    let html=`<div class="headview">
                <div class="left">返回</div>
                 <h1>服务日志</h1>
                <div class="right">关于</div>
            </div>`;
    return BaseView.extend({
        events:{
            'click .left':'leftClick',
            'click .right':'rightClick',
        },
        type: "HeadView",
        render: function(){
            this.$el.append(html);
            return this;
        },
        leftClick:function(e){
            Backbone.history.navigate('#test',{
                trigger:true
            });
        },
        rightClick:function(e){
            alert('right');
        }
    });

});
