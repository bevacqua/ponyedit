(function(window, ponyedit){
    'use strict';

    // assign it to window so people can play in the console
    var editable = window.editable = document.querySelector('.editable');

    ponyedit.init(editable);
})(window, ponyedit);
