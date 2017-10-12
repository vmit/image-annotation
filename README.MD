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

- `D` remove active shape

##### Polygon:
- `C` close polygon
- `D` `Z` remove active or last active point
- `Tab` activate the next point
- `Shift+Tab` activate the previous point
- `Up` move up active point along the Y-axis(`ALT+Up` smaller amount, `ALT+Shift+Up` bigger amount)
- `Down` move down active point along the Y-axis(`ALT+Down` smaller amount, `ALT+Shift+Down` bigger amount)
- `Left` move left active point along the X-axis(`ALT+Left` smaller amount, `ALT+Shift+Left` bigger amount)
- `Right` move right active point along the X-axis(`ALT+Right` smaller amount, `ALT+Shift+Right` bigger amount)
