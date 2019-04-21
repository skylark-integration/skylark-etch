define([
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
