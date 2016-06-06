/**
 * Created by liuqingling on 16/6/5.
 */

define(function(){
    require('../../css/loading');
    var $=require('jquery');
    return{
        showLoading:function(){
            console.log('showLoading');
            var loading='<div class="loader"><div class="loader-inner line-spin-fade-loader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>';
            $('body').append(loading);
        },
        hideLoading:function(){
            $('.loader').remove();
        }
    }

});
