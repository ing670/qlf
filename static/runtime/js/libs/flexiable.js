/**
 * Created by liuqingling on 16/4/21.
 */
module.exports=function(win){
    var dpr, rem, scale;
    var docEl = win.document.documentElement;
    var fontEl = win.document.createElement('style');
    var metaEl = win.document.querySelector('meta[name="viewport"]');
    dpr = win.devicePixelRatio || 1;
    scale = 1/dpr;
    //1rem=75.2px
    //console.log(docEl.clientWidth);
    rem = 375 * dpr / 10;
// 设置viewport，进行缩放，达到高清效果
    metaEl.setAttribute('content', 'width=' + dpr * docEl.clientWidth + ',initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale + ',user-scalable=no');
// 设置data-dpr属性，留作的css hack之用
    docEl.setAttribute('data-dpr', dpr);
// 动态写入样式
    docEl.firstElementChild.appendChild(fontEl);
    docEl.setAttribute('basefont',rem);
    docEl.setAttribute('style','font-size:'+rem+'px !important');
// 给js调用的，某一dpr下rem和px之间的转换函数
    win.rem2px = function(v) {
        v = parseFloat(v);
        return v * rem;
    };
    win.px2rem= function(v) {
        v = parseFloat(v);
        return v / rem;
    };
    win.dpr = dpr;
    win.rem = rem;
};
