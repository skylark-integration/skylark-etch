define([
	"skylark-langx/langx",
	"skylark-utils-dom/query",
	"./etch"
],function(langx,$,etch){
  // jquery helper functions
  $.fn.etchInstantiate = function(options, cb) {
    return this.each(function() {
      var $el = $(this);
      options || (options = {});

      var settings = {
        el: this,
        attrs: {}
      }

      langx.extend(settings, options);

      var model = new etch.models[settings.classType](settings.attrs, settings);

      // initialize a view is there is one
      if (langx.isFunction(etch.views[settings.classType])) {
        var view = new etch.views[settings.classType]({model: model, el: this, tagName: this.tagName});
      }
           
      // stash the model and view on the elements data object
      $el.data({model: model});
      $el.data({view: view});

      if (langx.isFunction(cb)) {
        cb({model: model, view: view});
      }
    });
  }

  $.fn.etchFindEditable = function() {
    // function that looks for the editable selector on itself or its parents
    // and returns that el when it is found
    var $el = $(this);
    return $el.is(etch.config.selector) ? $el : $el.closest(etch.config.selector);
  }
  
});