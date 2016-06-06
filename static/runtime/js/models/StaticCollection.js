define(['./BaseCollection','underscore'], function(BaseCollection, _) {

  return BaseCollection.extend({
    // for static collection mode has to set to `client`
    mode: "client",

    // stop it from making request，overridden for custom behavior.
    sync: function() {
      this.reset(this.models);
    }
  });
});
