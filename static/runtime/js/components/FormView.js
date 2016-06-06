// # FormView
//
// 表单组件，通过表单组件提交，修改数据
// ## 配置
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// components | object | true | 表单对各个字段,对应inputextview的配置
// collection | object | false | form提交对应的数据集属性
// url | string | false | form提交对应的url
//
// 例子：
//
// ```js
//    {
//        style: 'margin:10px',
//        id: 'FormView',
//        type: 'FormView',
//        "url": "",
//        "collection": {
//        "collection_id": "561b889ddb106a84d88c0c40",
//            "collection_name": "tttt",
//            "collection_type": "MongoRestCollection",
//            "collection_url": "/api/tttt/"
//        },
//        "components": [
//        {
//            "isUse": true,
//            "name": "fname",
//            "textType": "text",
//            "required": true,
//            "label": "",
//            "type": "InputTextView",
//            "placeholder": "请输入内容",
//            "key": 0,
//            "rows": 1
//        },
//        {
//            "isUse": true,
//            "name": "lname",
//            "textType": "text",
//            "required": true,
//            "label": "",
//            "type": "InputTextView",
//            "placeholder": "请输入内容",
//            "key": 1,
//            "rows": 1
//        }
//    ]
//    }
// ```
//
// 数据源
// 表单数据源分为两种类型：
//
//  1.在数据中心中创建数据模型，在app设计器中选择对应数据模型名称
//
//  2.输入参数定义对应url
//
// ## 事件
//
// ### 此组件监听的事件
// 事件 | 描述
// ----|------
// |
//
// ### 此组件发出的事件
// 事件 | 描述
// ----|-----
// 表单提交 | 提交表单时发出的事件

/**
 * Created by liuqingling on 15/10/9.
 */
define(['./ContainerView'],function(ContainerView){


    return ContainerView.extend({
        type:'FormView',
        isContainer:true,
        formstyle:"",
        designerCanDragIn:true,
        tagName :"form",
        events: {
            //属性:方法名
            "submit form": "onSubmit"
        },
        params:{},
        imagekey:null,
        hasImage:false,
        _getparams:function(){
          var fields = "";
          for(var i=0;i<this.components.length;i++){
            if(!this.components[i].options.key)
              continue;//无key排除

            if (this.components[i].options.type=='ImageUploadView') {
                var files = this.components[i].getValue();
                if (files) {
                    this.imagekey=this.components[i].options.key;
                }
                var length = files.length
                var min = this.components[i].options.min
                if (length < min) {
                    library.Toast("至少上传" + min + "张图片",2000);
                    return false;
                }

            }


            if(this.components[i].options.required&&!this.components[i].getValue()){
              this.doing = false;
              if (fields.length > 0) {
                fields += ",";
              }
              fields += this.components[i].options.label ? ("'" + this.components[i].options.label + "'") : '';
              //library.Toast("您还有字段" + str + "必须填写",2000);
              // library.MessageBox("提示",""+this.components[i].options.label?this.components[i].options.label:'您还有字段'+"必须填写",[{leftText:"确定",callback:function(){}},{rightText:"取消",callback:function(){}}]);
              //return false;
            }else if(!this.components[i].getValue()){
              continue;
            }
            this.params[this.components[i].options.key] = this.components[i].getValue();
            //解析提交表单时的配置的参数
            var result = window.context.getConvertContent(this,this.options.param);
            //添加隐藏字段的内容
            if(result){
              $.each(JSON.parse(result),function(key,value){
                  this.params[key] = value;
              }.bind(this));
            }
          }
          if (fields.length > 0) {
            library.Toast("您还有字段" + fields + "必须填写",2000);
            return false;
          }
          return true;
        },
        _uploadImage:function(){
            var data = new FormData();
            var files=this.params[this.imagekey];
            for (var i = 0; i < files.length; i++) {
              data.append('files', files[i]);
            }

            if(files&&files.length)
              $.ajax({
                type: 'POST',
                url:this.options.upURL || "/api/photos/"+app._id,
                data: data,
                cache: false,
                contentType: false,
                processData: false
              })
              .done(function(data, textStatus, response) {
                var images=data.map(function(i){
                  return i.image;
                });

                if (_.isEmpty(images)) {
                  var ImageUploadView = _.find(this.components, function (each) {
                      return each.options.type == "ImageUploadView"
                    })
                  this.params[this.imagekey] = ImageUploadView.getDataBindPhotoKey();
                } else {
                  this.params[this.imagekey]= images;
                }

              }.bind(this))
              .fail(function(jqXHR, textStatus, errorThrown){
                alert('很抱歉，上传图片失败，请稍候再试！');
              }).always(function(){
                this._postdate();
              }.bind(this));
            else
              this._postdate();

        },
        _getCollectionByCollectionName: function(collectionName) {
          var Collection;
          var _Collection = window.library.getCollection(collectionName);
          try {
            Collection = new _Collection();
          } catch (e) {
            alert(e);
          } finally {}
          return Collection;
        },
        _getCollection: function() {
            var result;
            var collectionOption=app.collections?app.collections[this.options.collection_name]:null
            if(!collectionOption){
                //alert(this.options.collection_name+"数据源不存，请确认是否被删除或修改。")
                return;
            }
            /*result = this._getCollectionByCollectionName(collectionOption.type)
              if (result){
                collectionOption.url&&(result.url = collectionOption.url)
                result.id = collectionOption.id
            }*/
            if (window.application) {
              result = window.application.getCollection(collectionOption.name) || this._getCollectionByCollectionType(
                collectionOption.type, collectionOption);
            }
            return result;
        },
        getModelByParamId: function () {
          var page = this.getPage();
          var model_id = page.params['id'];
          if (model_id) {
            var collection = this._getCollection();
            if (page.options.parentPage == "PageDetailView") {
              //已经是详情页，表单设置为put模式, 对页面的model修改
              this.isFormEdit = true;
              //将表单的model清空,
              this.model = null;

            } else {
              //如果是普通页面则根据id判断表单的collection是否存在model
              collection.fetch({
                data: {_id: model_id}, // FIXME 此时不能断定主键参数名已定是_id，应该使用idAttribute
                success: function (collection) {
                  //返回只有一条数据collection集合(id)
                  var model = collection.models[0];
                  if (model) {
                    (model.get(model["idAttribute"]) == model_id) && (this.isFormEdit = true);
                    this.setModel(model);
                  }
                }.bind(this),
                error: function () {
                  this.isFormEdit = false;
                }.bind(this)
              })
            }

          }
        },
        onRender: function () {
          //监听页面的onResume
          this.getModelByParamId();
          var page = this.getPage();
          this.listenTo(page, 'page:resume', function () {
            // 根据路由参数id获取model
            this.getModelByParamId();
          })
        },
        successHandler: function (me) {
          //解析提交成功时的配置的参数
          me.options.successConf.param = context.getConvertContent(me,me.options.successConf.param);
          me.doing=false;
          if(me.options.successConf.hasMsg&&me.options.successConf.isJumlink){
            var link;
            if(me.options.successConf.navigate=='inside'){
               link=function(){
                 if (!me.options.successConf.inside || me.options.successConf.inside.indexOf('javascript') > -1 ) {
                   return ;
                 }
                 Backbone.history.navigate(me.options.successConf.inside + "?_refresh=true",{trigger:true});
               }
            }else if(me.options.successConf.navigate=='outside'){
               link=function(){
                location.href=me.options.successConf.outside;
               }
            }
            library.Toast(me.options.successConf.massage?me.options.successConf.massage:'提交成功',2000);
            link();

            //library.MessageBox("提示",me.options.successConf.massage?me.options.successConf.massage:'提交成功',[{leftText:"确定",callback:link},{rightText:"取消",callback:function(){}}]);
          }else if(me.options.successConf.hasMsg){
            library.Toast(me.options.successConf.massage?me.options.successConf.massage:'提交成功',2000);
            location.reload();
            //library.MessageBox("提示",me.options.successConf.massage?me.options.successConf.massage:'提交成功',[{leftText:"确定",callback:function(){location.reload();}},{rightText:"取消",callback:function(){}}]);
          }else if(me.options.successConf.isJumlink){
            var link;
            if(me.options.successConf.navigate=='inside'){
               link=function(){
                 Backbone.history.navigate(me.options.successConf.inside + "?_refresh=true",true);
               }
            }else if(me.options.successConf.navigate=='outside'){
               link=function(){
                location.href=me.options.successConf.outside;
               }
            }
            library.Toast(me.options.successConf.massage?me.options.successConf.massage:'提交成功',2000);
            link();
            // library.MessageBox("提示",me.options.successConf.massage?me.options.successConf.massage:'提交成功',[{leftText:"确定",callback:link},{rightText:"取消",callback:function(){}}]);
          }else {
            library.Toast(me.options.successConf.massage?me.options.successConf.massage:'提交成功',2000);
            location.reload();
            //library.MessageBox("提示",me.options.successConf.massage?me.options.successConf.massage:'提交成功',[{leftText:"确定",callback:function(){location.reload();}},{rightText:"取消",callback:function(){}}]);
          }
        },
        errorHandler: function (me) {
          //解析提交失败时配置的参数
          me.options.errorConf.param = context.getConvertContent(me,me.options.errorConf.param);
          me.doing=false;
          if(me.options.errorConf.hasMsg&&me.options.errorConf.isJumlink){
            var link;
            if(me.options.errorConf.navigate=='inside'){
               link=function(){
                 Backbone.history.navigate(me.options.errorConf.inside,{trigger:true});
               }
            }else if(me.options.errorConf.navigate=='outside'){
               link=function(){
                location.href=me.options.errorConf.outside;
               }
            }
            library.Toast(me.options.errorConf.massage?me.options.errorConf.massage:'提交失败',2000);
            link();
            // library.MessageBox("提示",me.options.errorConf.massage?me.options.errorConf.massage:'提交失败',[{leftText:"确定",callback:link},{rightText:"取消",callback:function(){}}]);
          }else if(me.options.errorConf.hasMsg){
            // library.MessageBox("提示",me.options.errorConf.massage?me.options.errorConf.massage:'提交失败',[{leftText:"确定",callback:function(){location.replace();}},{rightText:"取消",callback:function(){}}]);
            library.Toast(me.options.errorConf.massage?me.options.errorConf.massage:'提交失败',2000);
            location.reload();
          }else if(me.options.errorConf.isJumlink){
            var link;
            if(me.options.errorConf.navigate=='inside'){
               link=function(){
                 Backbone.history.navigate(me.options.errorConf.inside,{trigger:true});
               }
            }else if(me.options.errorConf.navigate=='outside'){
               link=function(){
                location.href=me.options.errorConf.outside;
               }
            }
            library.Toast(me.options.errorConf.massage?me.options.errorConf.massage:'提交失败',2000);
            link();
            //library.Toast("提示",me.options.errorConf.massage?me.options.errorConf.massage:'提交失败',[{leftText:"确定",callback:link},{rightText:"取消",callback:function(){}}]);
          }else {
            library.Toast(me.options.errorConf.massage?me.options.errorConf.massage:'提交失败',2000);
            location.reload();
            //library.MessageBox("提示",me.options.errorConf.massage?me.options.errorConf.massage:'提交失败',[{leftText:"确定",callback:function(){location.reload();}},{rightText:"取消",callback:function(){}}]);
          }
        },
        _postdate:function(){
          var me=this;
          console.log(me);
          //isFormEdit 标记是否处于put状态
          if (this.isFormEdit) {
            var model = this.getModel();
            model && _.each(this.params, function (each, key) {
                model.set(key, each)
            })
            model.save("", "", {
              success: function () {
                this.successHandler(me)
              }.bind(this),
              error:function () {
                this.errorHandler(me)
              }.bind(this)
            });
            return;
          }

          this.collection = this._getCollection();
          this.collection.create(this.params, {
              "success": function(model, response) {
                this.successHandler(me)
              }.bind(this),
              "error": function(model, response) {
                this.errorHandler(me)
              }.bind(this)
          });
        },
        onSubmit: function(e) {
          if(!this.doing){
            this.doing=true;
            e.preventDefault();
            if(this._getparams()){
              this.imagekey?this._uploadImage():this._postdate();
            }
          }
          return false;
        },
        render:function(){
          this.$el.empty();
          // this.el.style=this.formstyle; 覆盖baseview SetStyle ???
          this.components.forEach(function(component){
              this.$el.append(this._getComponents(component.render()).el);
          }.bind(this));
          this.$el.off("submit").on("submit", this.onSubmit.bind(this));
          return this;
        },
        _getComponents:function(component){
          if (this.compositeHandler)
            component = this.compositeHandler(component)
          return component;
        },
        getValue:function(){
            var params = {};
            for(var i=0;i<this.components.length;i++){
              params[this.components[i].options.key] = this.components[i].getValue();
            }
            return params;
        }
    });

});
