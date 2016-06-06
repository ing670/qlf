/**
 * openAPI collection，根据配置适配
 *
 */
define(['./RemoteCollection', 'underscore'], function(RemoteCollection, _) {


  return RemoteCollection.extend({
      getCommonHeaders: function() {
          var commonHeaders = {};
          if (_.isEmpty($.trim(sessionStorage.user))) {
              // 重新登录 返回
            //   if (window.app.mode == "production") {
            //       window.location.href = window.app.defaultPage;
            //   }
          }
          var user = JSON.parse(sessionStorage.user);
          // if (!user.uap_token) {
              // 重新登录 返回window.app.defaultPage
          // }
          commonHeaders["uap_dataSource"] = user.uap_dataSource;
          commonHeaders["uap_usercode"] = user.uap_usercode;
          commonHeaders["uap_token"] = user.uap_token;
          return commonHeaders;
      },
      getInitFetchOption: function(fetchOption) {
          var commonHeaders = this.getCommonHeaders();
          fetchOption = fetchOption || {};

          if (this.options && this.options.config) {
              this.options.config.fetchOption = this.options.config.fetchOption || {};
              // 把传入的 fetchOption 与 config.fetchOption 合并 合并规则：传入的覆盖配置的
              // FIXME 此处__.default方法不满足要求 此为暂时解决方案
              this.options.config.fetchOption.headers = this.options.config.fetchOption.headers || {};
              this.options.config.fetchOption.headers = _.defaults(commonHeaders,this.options.config.fetchOption.headers);
              fetchOption = _.defaults(fetchOption,this.options.config.fetchOption);
          }
          return fetchOption;
      },
      fetch: function(config) {
        var fetchOption = this.getInitFetchOption(config && config.fetchOption);

        if (this.options.config.require == "data" && (!fetchOption.data || _.isEmpty(fetchOption.data))) {
            this.attributes = [];
            return false;
        }
        if (this.options.config && this.options.config.dataType) {
            if (this.options.config.dataType == "string" && fetchOption.data && typeof fetchOption.data != "string") {
                fetchOption.data = JSON.stringify(fetchOption.data);
            }
        };
        RemoteCollection.prototype.fetch.apply(this,[fetchOption]);
    },
    //FIXME parse方法需要配置每个collection都不一样
    parse: function(response) {
        if (response.statuscode == 0) {
            if (response.data) {
                response.data = JSON.parse(response.data);
            }
            library.Toast("查询成功", 2000);
            if (!_.isEmpty(response.data) && this.options.config.parseOption) {
                // 如果返回来的数据key是number要对其进行处理，如果key也是一个要展示的值则处理成如下
                // {"0603": "9100.00000000"} => {"_k1":"0603","_v1":"9100.00000000"}
                // 暂时只支持这一种情况 如果更复杂需要让调用者写一个适配器传进来处理自己的数据
                if (this.options.config.parseOption == "pairs") {
                    var data = {};
                    var keys = _.keys(response.data);
                    for (var i = 0; i < keys.length; i++) {
                        data["_k" + i] = keys[i];
                        data["_v" + i] = response.data[keys[i]];
                    }
                    return data;
                } else {
                    return response.data[this.options.config.parseOption];
                }
            } else {
                return response.data;
            }
        } else if (response.statuscode == "100301" || response.statuscode == 100301) {
            if (window.app.mode == "production") {
                window.location.href = window.app.defaultPage;
                return null;
            }
        } else {
            library.Toast('错误代码:' + response.statuscode + " 错误信息:" + response.errormsg, 3000);
            console.warn('错误代码:' + response.statuscode + " 错误信息:" + response.errormsg);
            return [];
        }

    }
  });

});
