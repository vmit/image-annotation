# Image Annotation Tool

Demo: TODO

### Usage
Include built js lib and set a container for the editor:
```html
<script src="build/image-annotation-editor.bundle.js"></script>
...
<div id="editor-container"></div>
```
Included js file exports a global variable (window.ImageAnnotationEditor) that we can instantiate.
```javascript
var container = document.getElementById('editor-container');
var editor = new ImageAnnotationEditor('http://example.com/image.png', [ /* shapes */ ]);

editor.render(container);
```

### Public Interface
##### ImageAnnotationEditor:

Property | Description
---------|------------
*(getter)* editor.**shapes** |  current list of shapes
*(setter)* editor.**annotationInterface** |  instance of ImageAnnotationEditor.AnnotationInterface

### Annotation Interface
TODO


### Hotkeys

- `d` remove active shape

##### Polygon:
- `c` close polygon
- `d` `z` remove active or last active point
- `Up` move up active point along the X-axis(`alt+Up` smaller amount, `alt+shift+Up` bigger amount)
- `Down` move down active point along the X-axis(`alt+Down` smaller amount, `alt+shift+Down` bigger amount)
- `Left` move left active point along the Y-axis(`alt+Left` smaller amount, `alt+shift+Left` bigger amount)
- `Right` move right active point along the Y-axis(`alt+Right` smaller amount, `alt+shift+Right` bigger amount)
