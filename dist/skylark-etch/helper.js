/**
 * skylark-etch - A version of etch.js that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-etch/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-utils-dom/query","./etch"],function(e,t,s){t.fn.etchInstantiate=function(i,n){return this.each(function(){var a=t(this);i||(i={});var c={el:this,attrs:{}};e.extend(c,i);var l=new s.models[c.classType](c.attrs,c);if(e.isFunction(s.views[c.classType]))var o=new s.views[c.classType]({model:l,el:this,tagName:this.tagName});a.data({model:l}),a.data({view:o}),e.isFunction(n)&&n({model:l,view:o})})},t.fn.etchFindEditable=function(){var e=t(this);return e.is(s.config.selector)?e:e.closest(s.config.selector)}});
//# sourceMappingURL=sourcemaps/helper.js.map
