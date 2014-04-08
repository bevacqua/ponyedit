(function(window, document, ee) {
    'use strict';

    /* jshint validthis:true */
    var ponies = [];
    var wasCollapsed;
    var query = document.queryCommandValue.bind(document);
    var exec = document.execCommand.bind(document);
    var addEventListener = 'addEventListener';

    function find (element) {
        var i = 0;
        var len = ponies.length;
        var item;
        for(; i < len; i++) {
            item = ponies[i];
            if(item.element === element) {
                return item.editor;
            }
        }
    }

    function Editor (element, options) {
        var self = this;
        var opt = setOption.bind(self);

        ee.call(self, {
            wildcard: true // support wildcard listeners
        });

        self.state = { active: false };
        self.content = element;
        self.options = options || {};
        self.on('report.*', stateChange.bind(self));

        opt('htmlWrap', true);

        bindElements.call(self);
        buildPastebin.call(self);
        createEventBindings.call(self);

        ponies.push({ editor: self, element: element });
    }

    // extends EventEmitter2
    Editor.prototype = Object.create(ee.prototype);
    Editor.prototype.constructor = Editor;

    function setOption (name, defaultValue) {
        if (!(name in this.options)) {
            this.options[name] = defaultValue;
        }
    }

    function bindElements () {
        var self = this;
        var content = self.content;

        content.contentEditable = true;
        content.classList.add('py-editable');
    }

    function buildPastebin () {
        var self = this;
        var pastebin = document.createElement('textarea');
        pastebin.className = 'py-pastebin';
        self.pastebin = pastebin;

        document.body.appendChild(pastebin);
        document[addEventListener]('paste', pasteHandler.bind(self));
        document[addEventListener]('keydown', convertTabs.bind(self));
        document[addEventListener]('keypress', function (e) {

            if (((  (e.metaKey && !e.ctrlKey) ||
                    (e.ctrlKey && !e.metaKey)) && e.keyCode === 118)
                /* || (e.shiftKey && INSERT)*/) { // command-v, ctrl-v, shift-ins
                pasteHandler(e);
            }
        });
    }

    function pasteHandler (e) {
        var self = this;
        if (!isChildOf(self.content, e.target)) { return; }

        self.saveSelection();
        self.pastebin.focus();

        setTimeout(function () {
            self.restoreSelection(true);
            insertTextAtCaret(self.pastebin.value);
            self.pastebin.value = '';
        });
    }

    function convertTabs (e) {
        var self = this;
        if (!isChildOf(self.content, e.target)) { return; }

        if (e.keyCode === 9) {
            e.preventDefault();
            exec('insertHTML', false, '    ');
        }
    }

    function insertTextAtCaret (text) {
        var selection = window.getSelection();
        var range;
        var textNode;

        if (selection.getRangeAt && selection.rangeCount) {
            range = selection.getRangeAt(0);
            range.deleteContents();
            textNode = document.createTextNode(text);
            range.insertNode(textNode);
            selection.removeAllRanges();
            range = range.cloneRange();
            range.selectNode(textNode);
            range.collapse(false);
            selection.addRange(range);
        }
    }

    function createEventBindings () {
        var self = this;

        document[addEventListener]('keyup', function (e) {
            checkTextHighlighting.call(self, e);
        });
        document[addEventListener]('mousedown', function (e) {
            checkTextHighlighting.call(self, e);
        });
        document[addEventListener]('mouseup', function(e) {
            setTimeout(function () {
                checkTextHighlighting.call(self, e);
            }, 0);
        });
    }

    function checkTextHighlighting (e) {
        var self = this;

        if (isChildOf(self.popover, e.target) ||
            isChildOf(self.pickerContainer, e.target)) {
            return; // allow the event to go through
        }

        var selection = window.getSelection();
        self.saveSelection();

        // text is selected
        if (selection.isCollapsed === false) {
            self.currentNodeList = findNodes(self.content, selection.focusNode);

            // find if highlighting is in the editable area
            if (hasNode(self.currentNodeList, 'PONYEDIT')) {
                self.report();
            }
        }

        wasCollapsed = selection.isCollapsed;

        // report whether a selection exists
        self.emit('report.active', !wasCollapsed, 'active');
    }

    function findNodes (content, element) {
        var nodeNames = {};

        while (element.parentNode) {
            if (element === content ) {
                nodeNames.PONYEDIT = true;
            } else {
                nodeNames[element.nodeName] = true;
            }
            element = element.parentNode;
        }
        return nodeNames;
    }

    function isChildOf ( parent, element ) {

        while (element.parentNode) {
            if (element === parent) {
                return true;
            }
            if (element.parentNode === parent) {
                return true;
            }
            element = element.parentNode;
        }
    }

    function hasNode ( nodeList, name ) {
        return !!nodeList[name];
    }

    Editor.prototype.focus = function () {
        var range = document.createRange();
        var selection = window.getSelection();
        range.setStart(this.content, 0);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    Editor.prototype.html = function (value) {
        var self = this;

        if (value === void 0) {
            return fix(self.content.innerHTML);
        } else {
            self.content.innerHTML = fix(value);
        }

        // wrap the HTML in a div.
        function fix (html) {
            if (self.options.htmlWrap === false) { return html; }

            if (html.substr(0,5) !== '<div>') {
                html = '<div>' + html + '</div>';
            }
            return html;
        }
    };

    Editor.prototype.getSelection = function () {
        var self = this, range;
        var selection = window.getSelection();
        if (selection.getRangeAt && selection.rangeCount) {
            range = selection.getRangeAt(0);

            // only return something if selection is inside editor
            if (isChildOf(self.content, range.commonAncestorContainer)) {
                return selection;
            }
        }
    };

    Editor.prototype.getRange = function () {
        var self = this, range;
        var selection = self.getSelection();
        return selection ? selection.getRangeAt(0) : void 0;
    };

    Editor.prototype.saveSelection = function () {
        var self = this;
        var range = self.getRange();
        if (range !== void 0) {
            self.lastRange = range;
        }
    };

    Editor.prototype.restoreSelection = function (forget) {
        var self = this;
        var selection;
        var range = self.lastRange;
        if (range) {
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            if (forget === true) {
                self.lastRange = null;
            }
        }
    };

    var pickyClass = 'py-picky-element';
    var pickySize = 'py-picky-size';
    var pickyHeight = 'py-picky-height';
    var pickyAutoHeight = 'py-picky-height-auto';

    function getFocusParent (pony) {
        var sel = pony.getSelection();
        if (!sel) {
            return;
        }
        var range = sel.getRangeAt(0);
        var parent = sel.focusNode.parentNode;
        return parent;
    }

    function getPixels () {
        var parent = getFocusParent(this);
        if (parent) {
            return getPixelSize(parent);
        }
    }

    function getPixelSize (node) {
        var picky = node.classList.contains(pickySize), style;
        if (picky) {
            style = node.style;
        } else {
            style = window.getComputedStyle(node);
        }
        return parseInt(style.fontSize.replace(/px/i, ''), 10);
    }

    function getHeight () {
        var parent = getFocusParent(this);
        if (parent) {
            return getPixelHeight(parent);
        }
    }

    function getPixelHeight (node) {
        var auto = node.classList.contains(pickyAutoHeight);
        var picky = node.classList.contains(pickyHeight);
        if (picky && !auto) {
            return parseFloat(node.style.lineHeight, 10);
        }
        return 'auto';
    }

    function setPicky (data) {
        var pony = this;
        var sel = pony.getSelection();
        if (!sel) {
            return;
        }
        var range = sel.getRangeAt(0);
        var fragment = range.extractContents();
        var children = Array.prototype.slice.call(fragment.childNodes);
        if (children.length === 0) {
            return; // selection was empty
        }
        var child, i;
        for (i = children.length - 1; i >= 0; i--) {
            // inserting in reverse preserves order
            child = children[i];
            range.insertNode(child);
        }

        var startNode, endNode;

        cleanup(child.parentNode);
        recurse(children);

        range.setStart(startNode, null);
        range.setEnd(endNode, endNode.nodeName === '#text' ?
            endNode.textContent.length :
            endNode.childNodes.length
        );
        sel.removeAllRanges();
        sel.addRange(range);

        function cleanup (parent) {
            var children = parent.childNodes;
            var bastard, i;
            for (i = 0; i < children.length; i++) {
                bastard = children[i];

                // extractContents can leave empty bastard children behind
                if (bastard.nodeName === '#text' && !bastard.textContent.length) {
                    parent.removeChild(bastard);
                }
            }
        }

        function recurse (nodes) {
            var nodeList = Array.prototype.slice.call(nodes);
            nodeList.forEach(function (node) {
                var poc, wrapper;

                if (node.nodeName === '#text') {
                    poc = isPickyOnlyChild(node);
                    if (poc) { // update picky wrapper
                        setStyle(node.parentNode);
                    } else if (node.textContent.length) { // wrap in picky tag
                        wrapper = document.createElement('span');
                        node.parentNode.replaceChild(wrapper, node);
                        wrapper.appendChild(node);
                        setStyle(wrapper, node.parentNode);
                    }
                } else {
                    recurse(node.childNodes);
                }

                if (!startNode) startNode = wrapper || node;
                endNode = wrapper || node;
            });
        }

        function isPickyOnlyChild (node) {
            var dad = node.parentNode;
            var children = Array.prototype.slice.call(dad.childNodes);
            var poc = dad.classList.contains(pickyClass) && children.every(function (n) {
                return n === node || (n.nodeName === '#text' && !n.textContent.length);
            });
            return poc;
        }

        function setStyle (node, reference) {
            var size = data.fontSize;
            if (size === void 0) { // just use the computed size
                size = getPixelSize(node);
            }
            if (data.fontSizeOffset) {
                size += getPixelSize(reference || node);
            }
            node.classList.add(pickySize, pickyClass);
            node.style.fontSize = size + 'px';

            if (pony.options.pickyHeight !== true) {
                return;
            }

            var height = data.lineHeight;
            if (height !== void 0 && height !== 'auto') {
                node.classList.remove(pickyAutoHeight);
            } else {
                if (height === 'auto' || !node.style.lineHeight) {
                    node.classList.add(pickyAutoHeight);
                }
                if (node.classList.contains(pickyAutoHeight)) {
                    height = size > 32 ? size : size * 1.2;
                }
            }
            if (height !== void 0) {
                node.classList.add(pickyHeight, pickyClass);
                node.style.lineHeight = height + 'px';
            }
        }
    }

    // contentEditable commands

    Editor.prototype.execBold = function () {
        exec('bold', false);
    };
    Editor.prototype.execItalic = function () {
        exec('italic', false);
    };
    Editor.prototype.execSize = function (value) {
        if (this.options.pixels) {
            setPicky.call(this, { fontSize: value });
        } else {
            exec('fontSize', false, value);
        }
    };
    Editor.prototype.execHeight = function (value) {
        if (this.options.pixels && this.options.pickyHeight) {
            setPicky.call(this, { lineHeight: value });
        }
    };
    Editor.prototype.execSizeDecrease = function () {
        var value;

        if (this.options.pixels) {
            setPicky.call(this, { fontSize: -1, fontSizeOffset: true });
        } else {
            value = queries.fontSize.call(this) - 1;
            exec('fontSize', false, value);
        }
    };
    Editor.prototype.execSizeIncrease = function () {
        var value;

        if (this.options.pixels) {
            setPicky.call(this, { fontSize: 1, fontSizeOffset: true });
        } else {
            value = queries.fontSize.call(this) + 1;
            exec('fontSize', false, value);
        }
    };
    Editor.prototype.execType = function (value) {
        exec('fontName', false, value);
    };
    Editor.prototype.execColor = function (value) {
        exec('foreColor', false, value);
    };
    Editor.prototype.execAlignment = function (value) {
        var normalized = value[0].toUpperCase() + value.slice(1).toLowerCase();
        exec('justify' + normalized, false, null);
    };

    function command (action, prop) {
        return function (args, preserveSelection) {
            var self = this;
            self.restoreSelection(!preserveSelection);
            self['exec' + action].apply(self, args || []);
            self['report' + (prop || action)]();
        };
    }

    Editor.prototype.setBold = command('Bold');
    Editor.prototype.setItalic = command('Italic');
    Editor.prototype.setSize = command('Size');
    Editor.prototype.decreaseSize = command('SizeDecrease', 'Size');
    Editor.prototype.increaseSize = command('SizeIncrease', 'Size');
    Editor.prototype.setType = command('Type');
    Editor.prototype.setColor = command('Color');
    Editor.prototype.setAlignment = command('Alignment');
    Editor.prototype.setHeight = command('Height');

    // complex state queries
    var queries = {
        fontSize: function () {
            var value = this.options.pixels ?
                getPixels.call(this) :
                query('fontSize');

            return parseInt(value, 10);
        },
        lineHeight: function () {
            var value = this.options.pickyHeight ?
                getHeight.call(this) :
                0;

            return value;
        },
        alignment: function () {
            var lquery = query('justifyLeft');
            var cquery = query('justifyCenter');
            var rquery = query('justifyRight');
            if (lquery === 'true' || lquery === true) return 'left';
            if (cquery === 'true' || cquery === true) return 'center';
            if (rquery === 'true' || rquery === true) return 'right';
            return '';
        }
    };

    // property state emission

    function report (property, name, parse) {
        var rquotes = /^['"]|['"]$/g;
        var inspect = queries[property] || query;

        return function () {
            var self = this;
            var value = inspect.call(self, property);
            var ev = 'report.' + name;

            if (parse === 'bool') {
                value = value === 'true' || value === true;
            } else if (parse === 'int') {
                value = parseInt(value, 10);
            } else if (property === 'fontName') {
                value = value.replace(rquotes, '');
            }

            self.emit(ev, value, name);
            return value;
        };
    }

    function stateChange (value, prop) {
        var self = this;
        var key;

        if (prop === 'active' && value === false) {
            for (key in self.state) {
                delete self.state[prop];
            }
        }
        self.state[prop] = value;
    }

    Editor.prototype.reportBold = report('bold', 'bold', 'bool');
    Editor.prototype.reportItalic = report('italic', 'italic', 'bool');
    Editor.prototype.reportSize = report('fontSize', 'size', 'int');
    Editor.prototype.reportType = report('fontName', 'type');
    Editor.prototype.reportColor = report('foreColor', 'color');
    Editor.prototype.reportAlignment = report('alignment', 'alignment');
    Editor.prototype.reportHeight = report('lineHeight', 'height');
    Editor.prototype.report = function () {
        var self = this;
        self.reportBold();
        self.reportItalic();
        self.reportSize();
        self.reportType();
        self.reportColor();
        self.reportAlignment();
        self.reportHeight();
    };

    Editor.prototype.meta = {
        fontSizes: [1, 2, 3, 4, 5, 6, 7],
        fontPixels: [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 72],
        fontTypes: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier', 'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Palatino', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
        alignments: ['Left', 'Center', 'Right'],
        lineHeights: ['auto', 6, 8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72]
    };

    // lock down the meta options
    Object.freeze(Editor.prototype.meta);

    window.ponyedit = function (element) {
        if (element instanceof Editor) {
            return element;
        }
        return find(element);
    };

    window.ponyedit.meta = Editor.prototype.meta;
    window.ponyedit.init = function (element, options) {
        var instance = find(element);
        if (instance) {
            return instance;
        }
        return new Editor(element, options);
    };

})(window, document, EventEmitter2);
