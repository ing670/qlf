/**
 * Created by liuqingling on 16/6/5.
 */

define(['./BaseView', 'jquery'], (BaseView, $)=> {
    require('../../css/header.less');
    let html=`<div class="headview">
                <div class="left">返回</div>
                 <div class="title">SUI Mobile</div>
                <div class="right">关于</div>
            </div>`;
    return BaseView.extend({
        events:{
            'click .left':'leftClick',
            'click .right':'rightClick',

        },
        type: "HeadView",
        render: function(){
            console.log('fuck HeadView')
            this.$el.append(html);
            return this;
        },
        leftClick:(e)=>{
            Backbone.history.navigate('#test?flag=checked',{
                trigger:true
            });
        },
        rightClick:(e)=>{
            alert('right');
        }
    });

});
