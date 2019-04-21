/**
 * skylark-etch - A version of etch.js that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-etch/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-etch/etch',[
	"skylark-langx/skylark",
	"skylark-langx/langx"
],function(skylark,langx) {
	'use strict';

	var models = {},
		views = {},
		collections = {},
		etch = {};

	// versioning as per semver.org
	etch.VERSION = '0.6.3';


	// tack on models, views, etc... as well as init function
	langx.extend(etch, {
		models: models,
		views: views,
		collections: collections,
	});


	return langx.attach(skylark,"itg.etch",etch);
});

define('skylark-etch/config',[
  "./etch"
],function(etch){
  return etch.config = {
    // selector to specify editable elements   
    selector: '.editable',
      
    // Named sets of buttons to be specified on the editable element
    // in the markup as "data-button-class"   
    buttonClasses: {
      'default': ['save'],
      'all': [
        'bold', 
        'superscript',
        'subscript', 
        'italic', 
        'underline', 
        "heading",
        "justify-left",
        "justify-center",
        "justify-right",
        'unordered-list', 
        'ordered-list', 
        'link', 
        'clear-formatting', 
        'save'
      ],
      'title': [
        'bold', 
        'superscript',
        'subscript', 
        'italic', 
        'underline', 
        'save'
      ]
    }
  };

 })
;
define('skylark-etch/models/Editor',[
	"skylark-backbone/Model",
	"../etch"
],function(Model,etch){
  	return etch.models.Editor = Model;
});

define('skylark-etch/views/Editor',[
  "skylark-langx/langx",
  "skylark-underscore/underscore",
  "skylark-backbone/View",
  "../etch"
],function(langx,_,View,etch) {
  
  return etch.views.Editor = View.extend({
    initialize: function() {
      this.$el = $(this.el);
            
      // Model attribute event listeners:
      _.bindAll(this, 'changeButtons', 'changePosition', 'changeEditable', 'insertImage');
      this.model.bind('change:buttons', this.changeButtons);
      this.model.bind('change:position', this.changePosition);
      this.model.bind('change:editable', this.changeEditable);

      // Init Routines:
      this.changeEditable();
    },

    events: {
      'click .etch-bold': 'toggleBold',
      'click .etch-superscript': 'toggleSuperscript',
      'click .etch-subscript': 'toggleSubscript',
      'click .etch-italic': 'toggleItalic',
      'click .etch-underline': 'toggleUnderline',
      'click .etch-heading': 'toggleHeading',
      'click .etch-unordered-list': 'toggleUnorderedList',
      'click .etch-justify-left': 'justifyLeft',
      'click .etch-justify-center': 'justifyCenter',
      'click .etch-justify-right': 'justifyRight',
      'click .etch-ordered-list': 'toggleOrderedList',
      'click .etch-link': 'toggleLink',
      'click .etch-image': 'getImage',
      'click .etch-save': 'save',
      'click .etch-clear-formatting': 'clearFormatting'
    },
        
    changeEditable: function() {
      this.setButtonClass();
      // Im assuming that Ill add more functionality here
    },

    setButtonClass: function() {
      // check the button class of the element being edited and set the associated buttons on the model
      var editorModel = this.model;
      var buttonClass = editorModel.get('editable').attr('data-button-class') || 'default';
      editorModel.set({ buttons: etch.config.buttonClasses[buttonClass] });
    },

    changeButtons: function() {
      // render the buttons into the editor-panel
      this.$el.empty();
      var view = this;
      var buttons = this.model.get('buttons');
            
      // hide editor panel if there are no buttons in it and exit early
      if (!buttons.length) { $(this.el).hide(); return; }
            
      _.each(this.model.get('buttons'), function(button){
        var $buttonEl = $('<a href="#" class="etch-editor-button etch-'+ button +'" title="'+ button.replace('-', ' ') +'"><span></span></a>');
        view.$el.append($buttonEl);
      });
            
      $(this.el).show('fast');
    },

    changePosition: function() {
      // animate editor-panel to new position
      var pos = this.model.get('position');
      this.$el.animate({'top': pos.y, 'left': pos.x}, { queue: false });
    },
        
    wrapSelection: function(selectionOrRange, elString, cb) {
      // wrap current selection with elString tag
      var range = selectionOrRange === Range ? selectionOrRange : selectionOrRange.getRangeAt(0);
      var el = document.createElement(elString);
      range.surroundContents(el);
    },
        
    clearFormatting: function(e) {
      e.preventDefault();
      document.execCommand('removeFormat', false, null);
    },
        
    toggleBold: function(e) {
      e.preventDefault();
      document.execCommand('bold', false, null);
    },

    toggleSubscript: function(e) {
      e.preventDefault();
      document.execCommand('subscript', false, null);
    },

    toggleSuperscript: function(e) {
      e.preventDefault();
      document.execCommand('superscript', false, null);
    },

    toggleItalic: function(e) {
      e.preventDefault();
      document.execCommand('italic', false, null);
    },

    toggleUnderline: function(e) {
      e.preventDefault();
      document.execCommand('underline', false, null);
    },
        
    toggleHeading: function(e) {
      e.preventDefault();
      var range = window.getSelection().getRangeAt(0);
      var wrapper = range.commonAncestorContainer.parentElement
      if ($(wrapper).is('h3')) {
        $(wrapper).replaceWith(wrapper.textContent)
        return;
      }
      var h3 = document.createElement('h3');
      range.surroundContents(h3);
    },

    urlPrompt: function(callback) {
      // This uses the default browser UI prompt to get a url.
      // Override this function if you want to implement a custom UI.
        
      var url = prompt('Enter a url', 'http://');
      
      if (null === url) {
          return;
      }
        
      // Ensure a new link URL starts with http:// or https:// 
      // before it's added to the DOM.
      //
      // NOTE: This implementation will disallow relative URLs from being added
      // but will make it easier for users typing external URLs.
      if (/^((http|https)...)/.test(url)) {
        callback(url);
      } else {
        callback("http://" + url);
      }
    },
    
    toggleLink: function(e) {
      e.preventDefault();
      var range = window.getSelection().getRangeAt(0);

      // are we in an anchor element?
      if (range.startContainer.parentNode.tagName === 'A' || range.endContainer.parentNode.tagName === 'A') {
        // unlink anchor
        document.execCommand('unlink', false, null);
      } else {
        // promt for url and create link
        this.urlPrompt(function(url) {
          document.execCommand('createLink', false, url);
        });
      }
    },

    toggleUnorderedList: function(e) {
      e.preventDefault();
      document.execCommand('insertUnorderedList', false, null);
    },

    toggleOrderedList: function(e){
      e.preventDefault();
      document.execCommand('insertOrderedList', false, null);
    },
        
    justifyLeft: function(e) {
      e.preventDefault();
      document.execCommand('justifyLeft', false, null);
    },

    justifyCenter: function(e) {
      e.preventDefault();
      document.execCommand('justifyCenter', false, null);
    },

    justifyRight: function(e) {
      e.preventDefault();
      document.execCommand('justifyRight', false, null);
    },

    getImage: function(e) {
      e.preventDefault();

      // call startUploader with callback to handle inserting it once it is uploaded/cropped
      this.startUploader(this.insertImage);
    },
        
    startUploader: function(cb) {
      // initialize Image Uploader
      var model = new models.ImageUploader();
      var view = new views.ImageUploader({model: model});
            
      // stash a reference to the callback to be called after image is uploaded
      model._imageCallback = function(image) {
        view.startCropper(image, cb);
      };


      // stash reference to saved range for inserting the image once its 
      this._savedRange = window.getSelection().getRangeAt(0);

      // insert uploader html into DOM
      $('body').append(view.render().el);
    },
        
    insertImage: function(image) {
      // insert image - passed as a callback to startUploader
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(this._savedRange);
            
      var attrs = {
        'editable': this.model.get('editable'),
        'editableModel': this.model.get('editableModel')
      };
            
      _.extend(attrs, image);

      var model = new models.EditableImage(attrs);
      var view = new views.EditableImage({model: model});
      this._savedRange.insertNode($(view.render().el).addClass('etch-float-left')[0]);
    },
        
    save: function(e) {
      e.preventDefault();
      var editableModel = this.model.get('editableModel');
      editableModel.trigger('save');
    }
  });
  });
  
define('skylark-etch/editableInit',[
  "./etch"
],function(etch){
  var models = etch.models,
      views = etch.views;

  return etch.editableInit = function(e) {

    e.stopPropagation();
    var target = e.target || e.srcElement;
    var $editable = $(target).etchFindEditable();
    $editable.attr('contenteditable', true);

    // if the editor isn't already built, build it
    var $editor = $('.etch-editor-panel');
    var editorModel = $editor.data('model');
    if (!$editor.length) {
      $editor = $('<div class="etch-editor-panel">');
      var editorAttrs = { editable: $editable, editableModel: this.model };
      document.body.appendChild($editor[0]);
      $editor.etchInstantiate({classType: 'Editor', attrs: editorAttrs});
      editorModel = $editor.data('model');

    // check if we are on a new editable
    } else if ($editable[0] !== editorModel.get('editable')[0]) {
      // set new editable
      editorModel.set({
        editable: $editable,
        editableModel: this.model
      });
    }
    
    // Firefox seems to be only browser that defaults to `StyleWithCSS == true`
    // so we turn it off here. Plus a try..catch to avoid an error being thrown in IE8.
    try {
      document.execCommand('StyleWithCSS', false, false);
    }
    catch (err) {
      // expecting to just eat IE8 error, but if different error, rethrow
      if (err.message !== "Invalid argument.") {
        throw err;
      }
    }

    if (models.EditableImage) {
      // instantiate any images that may be in the editable
      var $imgs = $editable.find('img');
      if ($imgs.length) {
        var attrs = { editable: $editable, editableModel: this.model };
        $imgs.each(function() {
          var $this = $(this);
          if (!$this.data('editableImageModel')) {
            var editableImageModel =  new models.EditableImage(attrs);
            var editableImageView = new views.EditableImage({model: editableImageModel, el: this, tagName: this.tagName});
            $this.data('editableImageModel', editableImageModel);
          }
        });
      }
    }

    // listen for mousedowns that are not coming from the editor
    // and close the editor
    // unbind first to make sure we aren't doubling up on listeners
    $('body').unbind('mousedown.editor').bind('mousedown.editor', function(e) {
      // check to see if the click was in an etch tool
      var target = e.target || e.srcElement;
      if ($(target).not('.etch-editor-panel, .etch-editor-panel *, .etch-image-tools, .etch-image-tools *').length) {
        // remove editor
        $editor.remove();
                  
                  
        if (models.EditableImage) {
          // unblind the image-tools if the editor isn't active
          $editable.find('img').unbind('mouseenter');

          // remove any latent image tool model references
          $(etch.config.selector+' img').data('editableImageModel', false)
        }
                  
        // once the editor is removed, remove the body binding for it
        $(this).unbind('mousedown.editor');
      }
    });

    editorModel.set({position: {x: e.pageX - 15, y: e.pageY - 80}});
  };
});
define('skylark-etch/helper',[
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
define('skylark-etch/main',[
	"./etch",
	"./config",
	"./models/Editor",
	"./views/Editor",
	"./editableInit",
	"./helper"
],function(etch){
	return etch;
});
define('skylark-etch', ['skylark-etch/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-etch.js.map
