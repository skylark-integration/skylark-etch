/**
 * skylark-etch - A version of etch.js that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-etch/
 * @license MIT
 */
define(["./etch"],function(e){var t=e.models,a=e.views;return e.editableInit=function(i){i.stopPropagation();var d=i.target||i.srcElement,o=$(d).etchFindEditable();o.attr("contenteditable",!0);var n=$(".etch-editor-panel"),l=n.data("model");if(n.length)o[0]!==l.get("editable")[0]&&l.set({editable:o,editableModel:this.model});else{n=$('<div class="etch-editor-panel">');var m={editable:o,editableModel:this.model};document.body.appendChild(n[0]),n.etchInstantiate({classType:"Editor",attrs:m}),l=n.data("model")}try{document.execCommand("StyleWithCSS",!1,!1)}catch(e){if("Invalid argument."!==e.message)throw e}if(t.EditableImage){var r=o.find("img");if(r.length){var s={editable:o,editableModel:this.model};r.each(function(){var e=$(this);if(!e.data("editableImageModel")){var i=new t.EditableImage(s);new a.EditableImage({model:i,el:this,tagName:this.tagName});e.data("editableImageModel",i)}})}}$("body").unbind("mousedown.editor").bind("mousedown.editor",function(a){var i=a.target||a.srcElement;$(i).not(".etch-editor-panel, .etch-editor-panel *, .etch-image-tools, .etch-image-tools *").length&&(n.remove(),t.EditableImage&&(o.find("img").unbind("mouseenter"),$(e.config.selector+" img").data("editableImageModel",!1)),$(this).unbind("mousedown.editor"))}),l.set({position:{x:i.pageX-15,y:i.pageY-80}})}});
//# sourceMappingURL=sourcemaps/editableInit.js.map
