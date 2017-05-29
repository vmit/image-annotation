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