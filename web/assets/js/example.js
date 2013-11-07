(function(window, document, ponyedit){
    'use strict';

    // get the element
    var editable = document.querySelector('.editable');

    // get our UI interaction elements
    var ui = document.querySelector('.ui');
    var uiBold = document.querySelector('.ui-bold');
    var uiItalic = document.querySelector('.ui-italic');
    var uiSizeUp = document.querySelector('.ui-size-up');
    var uiSizeDown = document.querySelector('.ui-size-down');

    // make it ponyeditable
    var pony = ponyedit.init(editable);

    // update the UI when state changes
    pony.on('report.*', update);

    // map attribute functions
    var enabled = {
        false: 'setAttribute',  // inactive sets disabled
        true: 'removeAttribute' // active removes disabled
    };

    function update (value, prop) {
        // set or remove disabled state
        ui[enabled[pony.state.active]]('disabled');

        // toggle bold css class
        uiBold.classList.toggle('ui-enabled', pony.state.bold);

        // toggle italics css class
        uiItalic.classList.toggle('ui-enabled', pony.state.italic);
    }

    // buttons to update state
    uiBold.addEventListener('click', function () { pony.setBold(); });
    uiItalic.addEventListener('click', function () { pony.setItalic(); });
    uiSizeUp.addEventListener('click', function () { pony.increaseSize(); });
    uiSizeDown.addEventListener('click', function () { pony.decreaseSize(); });

    // initialize ui
    update();

    // assign it to window so you can play in the console
    window.pony = pony;
})(window, document, ponyedit);
