# ponyedit

An interface between `contentEditable` and your UI.

- [**Blog Post**](http://blog.ponyfoo.com/2013/11/08/angular-wysiwyg)
- [**Live Demo**](http://ponyedit.herokuapp.com)

Sample UI:

![ui.png][1]

Note that the UI is entirely decoupled from this library, and is defined in the sample [JS](https://github.com/bevacqua/ponyedit/blob/master/web/assets/js/example.js), [CSS](https://github.com/bevacqua/ponyedit/blob/master/web/assets/css/example.css), and [HTML](https://github.com/bevacqua/ponyedit/blob/master/web/views/index.jade)

## Install

Install with `bower`.

```shell
bower install --save ponyedit
```

Or, using `npm`.

```shell
npm install --save ponyedit
```

#### Dependencies

`ponyedit` depends on [EventEmitter2](https://github.com/hij1nx/EventEmitter2) because it follows the [Obey and Report](http://blog.ponyfoo.com/2013/10/25/event-emitter-obey-and-report) pattern.

## Usage

Check out [the example JS file](https://github.com/bevacqua/ponyedit/blob/master/web/assets/js/example.js), all that's needed is an element `ponyedit` can turn into `contentEditable`. Then it'll do most of the heavy lifting for us, sans the UI.

```js
var something = document.querySelector('selector');
var somepony = ponyedit.init(something, options);
var samepony = ponyedit(something);
```

We can now use `somepony` to listen for state changes on our editor, and apply changes to the content. If we want to set up a button to toggle italics, we could just use:

```js
var button = document.querySelector('selector');

button.addEventListener('click', function () {
  somepony.setBold();
});
```

Updating the UI state can be isolated as well. Say we want the button to say `'BOLD'` when something is bold, and `'turn bold on'`, when it isn't. That'd be pretty easy.

```js
somepony.on('report.bold', function (value) {
  button.innerText = value ? 'BOLD' : 'turn bold on';
});
```

Framework-less data binding! Sort of.

## Use Case

This might not be as powerful as some other open-source WYSIWYG editors, but its strong point in favor is that it can be completely decoupled from its UI. This enables us to pair it with a framework such as Angular, Knockout or Backbone, and we could spread the UI all over the place, without the editor knowing any of that.

The event-driven approach also makes it easy to plug into these databinding-type frameworks.

## API

All of `EventEmitter2`'s API is supported, as `ponyedit` extends its prototype. The only option passed to `EventEmitter2` is `wildcard: true`.

#### Options

Here are the default values.

```js
{
  htmlWrap: true,
  pixels: false,
  pickyHeight: false
}
```

The `pixels` option defaults to `false`, using `<font size='{n}'>` tags just like native `contentEditable` does. Setting it to `true` results in `<span class='py-pixels-element' style='font-size: {n}px;'>` tags instead.

The `pickyHeight` option may be used in addition to the `pixels` option to set line heights relatively to the font size. Furthermore, `pickyHeight` enables the `.execHeight(px)`, and `.setHeight(px)` API.

#### `.focus()`

Focuses the content editable at the beginning.

#### `.html(value)`

Similar to jQuery's method, gets or sets the HTML contents in our editable. If the `htmlWrap` option (enabled by default) is set to `true`, then the HTML will be wrapped in a `<div>` (if it's not already wrapped). This is generally useful because the first line can sometimes become a text node, while the rest of our content stays in paragraphs, but that behavior can vary among browsers.

#### `.getSelection()`

Gets the current selection, only if it's inside the content editable area of our element.

#### `.getRange()`

Gets the currently selected range of text, only if the selection is inside the content editable area of our element.
#### `.saveSelection()`

Takes the selection from `.getSelection` and saves it for later. It can be restored later. This also happens whenever the user selects text by hand (or unselects it).

#### `.restoreSelection(forget)`

Restores the last saved selection. If `forget` is `true`, then the saved selection is deleted. This helps because sometimes our UI will make the content editable lose focus, for example if we're using a `<select>` to pick a font. In those cases, we can save the selection right before, and then restore it right after.

#### `.exec` Commands

These methods just execute commands on the content editable.

- `.execBold()` Toggles bold formatting in the selection
- `.execItalic()` Toggles italic formatting in the selection
- `.execSize(value)` Sets font size to `value` for the selection
- `.execSizeDecrease()` Reduces font size by one for the selection
- `.execSizeIncrease()` Increases font size by one for the selection
- `.execType(value)` Sets the font name to `value` for the selection.
- `.execColor(value)` Sets the fore color to `value` for the selection.
- `.execAlignment(value)` Sets text alignment to `value` for the selection, `left`, `center`, or `right`.
- `.execHeight(value)` Sets line height to `value` for the selection. Value may be `'auto'`

#### `.set` State changes

These methods restore the latest selection, execute the appropriate `.exec` command, and emit an state update. All of these take two arguments. The first one is an array of arguments for the `.exec` command, and the second is whether the selection should be preserved (by default, it isn't).

- `.setBold(args, preserveSelection)`
- `.setItalic(args, preserveSelection)`
- `.setSize(args, preserveSelection)`
- `.decreaseSize(args, preserveSelection)`
- `.increaseSize(args, preserveSelection)`
- `.setType(args, preserveSelection)`
- `.setColor(args, preserveSelection)`
- `.setAlignment(args, preserveSelection)`
- `.setHeight(args, preserveSelection)`

Note that, in order to be future proof, these methods' `args` should be an array of arguments to pass to the `.exec` command. As such, setting the size should be invoked like this:

```js
ponyeditor.setSize([2]);
```

That'll end up invoking `ponyeditor.execSize(2)`.

#### `.report` Methods

These methods emit the state each particular property is in, or all of them at once with `.report()`.

- `.reportBold()`
- `.reportItalic()`
- `.reportSize()`
- `.reportType()`
- `.reportColor()`
- `.reportAlignment()` normalized to report one of `left`, `center`, `right`, or `''`
- `.reportHeight()`
- `.report()`

#### `.meta` Object

This object provides values you could use to populate lists, such as `fontSizes`, `fontTypes`, and `alignments`.

#### window.ponyedit(element)

Looks up and returns the `ponyeditor` object associated to the element.

#### window.ponyedit.meta

Convenience shortcut to `ponyeditor.meta`, without an instance.

#### window.ponyedit.init(element, options)

Creates a `ponyeditor` for the element, and sets `contentEditable` on for that element.

  [1]: http://i.imgur.com/NYNlIWg.png

# License

MIT
