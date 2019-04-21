/**
 * skylark-etch - A version of etch.js that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-etch/
 * @license MIT
 */
!function(e,t){var n=t.define,i=t.require,a="function"==typeof n&&n.amd,l=!a&&"undefined"!=typeof exports;if(!a&&!n){var o={};n=t.define=function(e,t,n){"function"==typeof n?(o[e]={factory:n,deps:t.map(function(t){return function(e,t){if("."!==e[0])return e;var n=t.split("/"),i=e.split("/");n.pop();for(var a=0;a<i.length;a++)"."!=i[a]&&(".."==i[a]?n.pop():n.push(i[a]));return n.join("/")}(t,e)}),resolved:!1,exports:null},i(e)):o[e]={factory:null,resolved:!0,exports:n}},i=t.require=function(e){if(!o.hasOwnProperty(e))throw new Error("Module "+e+" has not been defined");var n=o[e];if(!n.resolved){var a=[];n.deps.forEach(function(e){a.push(i(e))}),n.exports=n.factory.apply(t,a)||null,n.resolved=!0}return n.exports}}if(!n)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(e,t){e("skylark-etch/etch",["skylark-langx/skylark","skylark-langx/langx"],function(e,t){"use strict";var n={VERSION:"0.6.3"};return t.extend(n,{models:{},views:{},collections:{}}),t.attach(e,"itg.etch",n)}),e("skylark-etch/config",["./etch"],function(e){return e.config={selector:".editable",buttonClasses:{default:["save"],all:["bold","superscript","subscript","italic","underline","heading","justify-left","justify-center","justify-right","unordered-list","ordered-list","link","clear-formatting","save"],title:["bold","superscript","subscript","italic","underline","save"]}}}),e("skylark-etch/models/Editor",["skylark-backbone/Model","../etch"],function(e,t){return t.models.Editor=e}),e("skylark-etch/views/Editor",["skylark-langx/langx","skylark-underscore/underscore","skylark-backbone/View","../etch"],function(e,t,n,i){return i.views.Editor=n.extend({initialize:function(){this.$el=$(this.el),t.bindAll(this,"changeButtons","changePosition","changeEditable","insertImage"),this.model.bind("change:buttons",this.changeButtons),this.model.bind("change:position",this.changePosition),this.model.bind("change:editable",this.changeEditable),this.changeEditable()},events:{"click .etch-bold":"toggleBold","click .etch-superscript":"toggleSuperscript","click .etch-subscript":"toggleSubscript","click .etch-italic":"toggleItalic","click .etch-underline":"toggleUnderline","click .etch-heading":"toggleHeading","click .etch-unordered-list":"toggleUnorderedList","click .etch-justify-left":"justifyLeft","click .etch-justify-center":"justifyCenter","click .etch-justify-right":"justifyRight","click .etch-ordered-list":"toggleOrderedList","click .etch-link":"toggleLink","click .etch-image":"getImage","click .etch-save":"save","click .etch-clear-formatting":"clearFormatting"},changeEditable:function(){this.setButtonClass()},setButtonClass:function(){var e=this.model,t=e.get("editable").attr("data-button-class")||"default";e.set({buttons:i.config.buttonClasses[t]})},changeButtons:function(){this.$el.empty();var e=this,n=this.model.get("buttons");n.length?(t.each(this.model.get("buttons"),function(t){var n=$('<a href="#" class="etch-editor-button etch-'+t+'" title="'+t.replace("-"," ")+'"><span></span></a>');e.$el.append(n)}),$(this.el).show("fast")):$(this.el).hide()},changePosition:function(){var e=this.model.get("position");this.$el.animate({top:e.y,left:e.x},{queue:!1})},wrapSelection:function(e,t,n){var i=e===Range?e:e.getRangeAt(0),a=document.createElement(t);i.surroundContents(a)},clearFormatting:function(e){e.preventDefault(),document.execCommand("removeFormat",!1,null)},toggleBold:function(e){e.preventDefault(),document.execCommand("bold",!1,null)},toggleSubscript:function(e){e.preventDefault(),document.execCommand("subscript",!1,null)},toggleSuperscript:function(e){e.preventDefault(),document.execCommand("superscript",!1,null)},toggleItalic:function(e){e.preventDefault(),document.execCommand("italic",!1,null)},toggleUnderline:function(e){e.preventDefault(),document.execCommand("underline",!1,null)},toggleHeading:function(e){e.preventDefault();var t=window.getSelection().getRangeAt(0),n=t.commonAncestorContainer.parentElement;if($(n).is("h3"))$(n).replaceWith(n.textContent);else{var i=document.createElement("h3");t.surroundContents(i)}},urlPrompt:function(e){var t=prompt("Enter a url","http://");null!==t&&(/^((http|https)...)/.test(t)?e(t):e("http://"+t))},toggleLink:function(e){e.preventDefault();var t=window.getSelection().getRangeAt(0);"A"===t.startContainer.parentNode.tagName||"A"===t.endContainer.parentNode.tagName?document.execCommand("unlink",!1,null):this.urlPrompt(function(e){document.execCommand("createLink",!1,e)})},toggleUnorderedList:function(e){e.preventDefault(),document.execCommand("insertUnorderedList",!1,null)},toggleOrderedList:function(e){e.preventDefault(),document.execCommand("insertOrderedList",!1,null)},justifyLeft:function(e){e.preventDefault(),document.execCommand("justifyLeft",!1,null)},justifyCenter:function(e){e.preventDefault(),document.execCommand("justifyCenter",!1,null)},justifyRight:function(e){e.preventDefault(),document.execCommand("justifyRight",!1,null)},getImage:function(e){e.preventDefault(),this.startUploader(this.insertImage)},startUploader:function(e){var t=new models.ImageUploader,n=new views.ImageUploader({model:t});t._imageCallback=function(t){n.startCropper(t,e)},this._savedRange=window.getSelection().getRangeAt(0),$("body").append(n.render().el)},insertImage:function(e){var n=window.getSelection();n.removeAllRanges(),n.addRange(this._savedRange);var i={editable:this.model.get("editable"),editableModel:this.model.get("editableModel")};t.extend(i,e);var a=new models.EditableImage(i),l=new views.EditableImage({model:a});this._savedRange.insertNode($(l.render().el).addClass("etch-float-left")[0])},save:function(e){e.preventDefault();var t=this.model.get("editableModel");t.trigger("save")}})}),e("skylark-etch/editableInit",["./etch"],function(e){var t=e.models,n=e.views;return e.editableInit=function(i){i.stopPropagation();var a=i.target||i.srcElement,l=$(a).etchFindEditable();l.attr("contenteditable",!0);var o=$(".etch-editor-panel"),r=o.data("model");if(o.length)l[0]!==r.get("editable")[0]&&r.set({editable:l,editableModel:this.model});else{o=$('<div class="etch-editor-panel">');var s={editable:l,editableModel:this.model};document.body.appendChild(o[0]),o.etchInstantiate({classType:"Editor",attrs:s}),r=o.data("model")}try{document.execCommand("StyleWithCSS",!1,!1)}catch(e){if("Invalid argument."!==e.message)throw e}if(t.EditableImage){var c=l.find("img");if(c.length){var d={editable:l,editableModel:this.model};c.each(function(){var e=$(this);if(!e.data("editableImageModel")){var i=new t.EditableImage(d);new n.EditableImage({model:i,el:this,tagName:this.tagName});e.data("editableImageModel",i)}})}}$("body").unbind("mousedown.editor").bind("mousedown.editor",function(n){var i=n.target||n.srcElement;$(i).not(".etch-editor-panel, .etch-editor-panel *, .etch-image-tools, .etch-image-tools *").length&&(o.remove(),t.EditableImage&&(l.find("img").unbind("mouseenter"),$(e.config.selector+" img").data("editableImageModel",!1)),$(this).unbind("mousedown.editor"))}),r.set({position:{x:i.pageX-15,y:i.pageY-80}})}}),e("skylark-etch/helper",["skylark-langx/langx","skylark-utils-dom/query","./etch"],function(e,t,n){t.fn.etchInstantiate=function(i,a){return this.each(function(){var l=t(this);i||(i={});var o={el:this,attrs:{}};e.extend(o,i);var r=new n.models[o.classType](o.attrs,o);if(e.isFunction(n.views[o.classType]))var s=new n.views[o.classType]({model:r,el:this,tagName:this.tagName});l.data({model:r}),l.data({view:s}),e.isFunction(a)&&a({model:r,view:s})})},t.fn.etchFindEditable=function(){var e=t(this);return e.is(n.config.selector)?e:e.closest(n.config.selector)}}),e("skylark-etch/main",["./etch","./config","./models/Editor","./views/Editor","./editableInit","./helper"],function(e){return e}),e("skylark-etch",["skylark-etch/main"],function(e){return e})}(n),!a){var r=i("skylark-langx/skylark");l?module.exports=r:t.skylarkjs=r}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-etch.js.map
