// ImageUploadView
// author Vicent
// 图片上传控件，选择本地图片后会在屏幕上有预览，点击图片删除当前图片
define(['require', './BaseView'], function(require, BaseView) {
  var _ = require("underscore");
  var _this = null;
  return BaseView.extend({
    type: 'ImageUploadView',

    events: {
      "click img": "imgClick"
    },

    input: null,
    preview: null,
    uploadView: null,
    contentView: null,
    imgArray: [],

    initialize: function() {

      Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
          this.splice(index, 1);
        }
      };
    },
    onDataBind: function () {
      this.render();
    },
    remove: function() {
      //解绑
      this.input.unbind("change", this.handleFiles);
      this.$el.remove();
    },

    render: function() {
      this.$el.empty();
      _this = this;
      this.input = $('<input class="input-image-upload" type="file" id="Files" name="files[]" accept="image/*" multiple />');
      this.inputEdit = $('<input class="input-image-upload" type="file"  name="files[]" accept="image/*" style="z-index:2" />');

      //绑定事件
      this.input.bind("change", this.handleFiles);
      this.inputEdit.bind("change", this.handleFiles);

      this.preview = $('<div class="image-preview" />');
      var addView = $("<div class='image-upload'>+</div>");
      this.uploadView = $("<div class='image-add' ></div>");
      this.contentView = $("<div class='image-upload-content'></div>");

      // FIXME 写死的字体大小和样式，明明有个image-upload的class不用
      var editView = $("<div class='image-upload' style='font-size:16px'>修改</div>")

      var model = this.getModel();
      if ( model && this.options.key) {
        var pictureurl = model.get(this.options.key) || "";
        if (typeof pictureurl == "string") {
          this.pictureurl = pictureurl;
        } else if (_.isArray(pictureurl)) {
          this.pictureurl = pictureurl[0];
        }
        this.isEdit = true;
        this.uploadView.append(this.inputEdit);
        this.uploadView.append(editView);
        this.createImage({
          dataUrl: this.pictureurl
        });
      } else {
        this.uploadView.append(this.input);
        this.uploadView.append(addView);
      }

      this.contentView.append(this.preview).append(this.uploadView);
      var rootView = $("<div class='image-upload-view'></div>");
      var $label = $('<label></label>');
      if (this.options.label && this.options.layout != "noLabel") {
        $label.text(this.isEdit ? "图片" : this.options.label);
        rootView.append($label);
      }

      if (this.options.layout == "horizontal") {
        // 水平布局的表单
        rootView.addClass('label-inline');
      } else if (this.options.layout == "vertical") {
        // 垂直布局的表单
        rootView.addClass('label-block');
        $label.addClass('form-label-bg');
      } else if (this.options.layout == "noLabel") {
        //   rootView.addClass('label-none');
        rootView.addClass('label-inline');
      }


      //rootView.append(this.preview).append(this.uploadView);
      rootView.append(this.contentView);
      this.$el.append(rootView);

      return this;
    },

    imagefiles: [],
    imageLoader: function () {
      var imageLoader =function (file, onImageLoad, id) {
        this.file = file;
        this.id = id;
        // this.onImageLoad = onImageLoad;
        var reader = new FileReader();
        reader.onload = function (e) {
          this.dataUrl = e.target.result;
          onImageLoad(this);
        }.bind(this);
        reader.readAsDataURL(file);
      }
      // imageLoader.prototype.onFileload = function (e) {
      //     this.dataUrl = e.target.result;
      //     this.onImageLoad(this);
      // }
      return imageLoader;
    },
    handleFiles: function() {
      var files = _this.isEdit? _this.inputEdit[0].files: _this.input[0].files;
      var output = [];

      for (var i = 0, f; f = files[i]; i++) {
        var imageType = /image.*/;

        if (!f.type.match(imageType)) {
          continue;
        }
        var id = Math.random() * new Date();
        // var imagefile = {
        //   _id: _id,
        //   file: f
        // };
        var imageLoader = _this.imageLoader();
        new imageLoader(f, function (data) {
          _this.addImage(data);
          // _.find(_this.imagefiles, function(each){ return each.id == data.id;}).src = data.dataUrl;
          // imagefile.src = data.dataUrl;
        }, id);
        // _this.imagefiles.push(imagefile);
        // reader.readAsDataURL(f);
        // if (_this.imagefiles.length >= _this.options.max - 1) {
        //   _this.hideAdd();
        //   return;
        // }
      }
    },
    createImage: function (data) {
      if (this.isEdit) {
        //编辑模式只有一张图片
        this.preview.empty();
        this.imagefiles = [];
      }
      this.imagefiles.push({
        src: data.dataUrl,
        _id: data.id,
        file: data.file
      });
      var img = $('<img />');
      img.attr('src', data.dataUrl);
      img.attr('_id', data.id);
      this.preview.append(img);
    },
    addImage: function(data) {
      if (this.imagefiles.length >= this.options.max-1) {
        if (this.imagefiles.length == this.options.max-1) {
          this.createImage(data);
          this.hideAdd();
          return;
        }
        return;
      }
      this.createImage(data);
    },

    imgClick: function(e) {
      this._modalAtlasList();
      // var data = $(e.currentTarget).attr('src').toString();
      // var _id = $(e.currentTarget).attr('_id').toString();
      // this.imgArray.remove(data);
      // this.imagefiles = this.imagefiles.filter(function(it, i, arr) {
      //   return it._id != _id;
      // });
      // e.currentTarget.remove();
      // this.input.val('');
      // if (this.imgArray.length < this.options.max) {
      //   this.showAdd();
      //   return;
      // }
    },

    hideAdd: function() {
      this.uploadView.css({
        display: 'none'
      });
    },
    showAdd: function() {
      this.uploadView.css({
        display: 'block'
      });
    },
    getDataBindPhotoKey: function () {
      return this.pictureurl;
    },
    getValue: function() {
      var files = [];
      this.imagefiles.forEach(function(it, index, a) {
        files[index] = it.file;
      });
      return files;
    },


    //弹出幻灯片
    _modalAtlasList: function() {
      var windowWidth = window.innerWidth,
        $atlas_list = $('<div class="atlas-list" style="text-align: center"></div>'),
        $atlas_top = $('<div class="atlas-top"></div>'),
        $atlas_top_back = $('<a class="atlas-top-back" href="javascript:void(0);"></a>'),
        $atlas_top_delete = $('<a class="atlas-top-delete  glyphicon glyphicon-trash" href="javascript:void(0);"></a>'),
        description = "";
        atlas_footer = [
          '<p class="atlas-footer-p-top">',
          '<span class="atlas-span-current">1</span>',
          '<span class="atlas_span_total">/' + this.imagefiles.length + '</span>',
          '</p>',
        ].join(''),
        $atlas_footer = $(atlas_footer),
        slick_out_wrapper = [
          '<div class="slick-out-wraper">',
          '<div class="slick-container" style="width: ' + window.innerWidth + 'px"></div>',
          '</div>'
        ].join(''),
        $slick_out_wrapper = $(slick_out_wrapper);

      //返回按钮
      $atlas_top_back.on('click', function(event) {
        $atlas_list.css({
          "transition": "all 0.5s ease",
          "-webkit-transition": "all 0.5s ease",
          "transform": "translate3d(" + (windowWidth) + "px, 0, 0)"
        });
        window.setTimeout(function() {
          $atlas_list.remove();
        }, 600);
      });
      var _this = this;
      $atlas_top_delete.on('click',function(event){
        var index = parseInt($atlas_list.find('.atlas-span-current').text());
        // FIXME 硬编码的消息应该作为消息配置放入，考虑组件的国际化
        library.MessageBox("提示","要删除这张照片吗？",[{leftText:"删除",callback:function(){
          // var _id = _this.imagefiles[index-1]._id;
          // var data =_this.imagefiles[index-1].src;
          // _this.imgArray.remove(data);
          // _this.imagefiles = _this.imagefiles.filter(function(it, i, arr) {
          //   return it._id != _id;
          // });
          _this.preview.find("img").eq(index-1).remove();
          _this.imagefiles.splice(index-1, 1);
          _this.showAdd();
          // e.currentTarget.remove();
          // $('#'+_this.imagefiles[index-1]._id).remove();
          // $(".slick-imagediv").find("img").eq(index).remove();
          // _this.input.val('');
          // if (_this.imgArray.length < _this.options.max) {
          //   _this.showAdd();
          //   return;
          // }
          $atlas_list.css({
            "transition": "all 0.5s ease",
            "-webkit-transition": "all 0.5s ease",
            "transform": "translate3d(" + (windowWidth) + "px, 0, 0)"
          });
          window.setTimeout(function() {
            $atlas_list.remove();

          }, 600);
        }},{rightText:"取消",callback:function(){
        }}]);

      });
      $atlas_top.append($atlas_top_back);
      $atlas_top.append($atlas_footer);
      $atlas_top.append($atlas_top_delete);
      $atlas_list.append($atlas_top).append($slick_out_wrapper);
      $('body').append($atlas_list);

      // create slick instance
      var $slick_el = $atlas_list.find('.slick-container');
      this.slick = $slick_el.slick({
        lazyLoad: 'ondemand',
        autoplay: false,
        swipeToSlide: true,
        dots: false,
        speed: 100,
        adaptiveHeight: true
      });

      if (this.imagefiles) {
        var me = this;
        setTimeout(function() {
          me.imagefiles.forEach(function(item, index) {
            $slick_el.slick('slickAdd', me._createAtlasItem(item));
          });
          $slick_el.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
            var description = '';
            var current = nextSlide + 1;
            $atlas_list.find('.atlas-footer-h').text(description);
            $atlas_list.find('.atlas-span-current').text(current);
            $atlas_list.find('.atlas-span-current').attr("_id", 23); // FIXME 写死的id？
          });
        }, 0);
      }

      //动画效果
      $atlas_list.css({
        "transition": "none",
        "-webkit-transition": "none",
        "transform": "translate3d(" + (windowWidth) + "px, 0, 0)"
      });

      window.setTimeout(function() {
        $atlas_list.css({
          "transition": "all 0.5s ease",
          "-webkit-transition": "all 0.5s ease",
          "transform": "translate3d(0, 0, 0)"
        });
      }, 30);
    },
    _createAtlasItem: function(item) {
        var carouselItem = [
            '<div class="slick-imagediv">',
                '<img class="slick-img" src="' + item.src + '" id="'+ item._id+'"/>',
            '</div>'
        ].join('');
        return $(carouselItem)[0];
    },
  });
});
