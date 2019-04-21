define([
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