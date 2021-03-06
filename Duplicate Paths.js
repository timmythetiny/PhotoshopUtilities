function main() {
    if (app.documents.length === 0) return;
    accelerate();
    getDestinationDocument();
}
    
/*
Display a UI for selecting a document to duplicate to
 */
 function getDestinationDocument() {
    var window = new Window('dialog', 'Destination Document');
        
    // Add a dropdownlist to display open document names
    var documentNames = [];
    for (var i = 0; i < app.documents.length; ++i) {
        var doc = app.documents[i];
        if (doc !== app.activeDocument) {
            documentNames.push(doc.name);
        }
    }
    if (documentNames.length === 0) {
        alert('No other open documents.');
        return;
    }
    var dropdown = window.add('dropdownlist', undefined, documentNames);
    dropdown.selection = 0;
        
    // Standard Cancel and OK buttons
    var buttonGroup = window.add('group');
    buttonGroup.orientation = 'row';
    buttonGroup.alignChildren = 'right';
    var cancel = buttonGroup.add('button', undefined, 'Cancel');
    var okay = buttonGroup.add('button', undefined, 'OK');
        
    // Automatically bound to esc
    cancel.onClick = function() {
        window.close();
    };
            
    // Automatically bound to return
    okay.onClick = function() {
        window.close();
        // Fire off the actual path duplication process
        var to = app.documents.getByName(dropdown.selection.text);
        suspendFrom(to);
    };
            
    window.show();
}
    
/*
Suspends the history of the source document
 */
function suspendFrom(to) { // eslint-disable-line no-unused-vars
    app.activeDocument.suspendHistory('Send Paths', 'suspendTo(to);');
}
    
/*
Suspends the history of the destination document
 */
function suspendTo(to) { // eslint-disable-line no-unused-vars
    to.suspendHistory('Receive Paths', 'execute(to);');
}
    
/*
Duplicate paths from the active document to the user's selected document
 */
function execute(to) { // eslint-disable-line no-unused-vars
    var layer, path, i;
    var from = app.activeDocument;
    
    app.activeDocument = from;

    var layers = [];
    
    // For each path in document...
    for (i = 0; i < from.pathItems.length; ++i) {
        // Create a shape layer from the path and name it the same
        path = from.pathItems[i];
        selectPath(path.name);
        makeShapeLayer();
        layer = from.activeLayer;
        layer.name = path.name;
        layers.push(layer.duplicate(to, ElementPlacement.PLACEATBEGINNING));
        layer.remove();
    }
        
    app.activeDocument = to;

    // For layer in layers...
    for (i = 0; i < layers.length; ++i) {
        layer = layers[i];
        // Duplicate the vector shape to a path and remove the shape layer
        deselectPaths();
        to.activeLayer = layer;
        pathFromShapeLayer();
        path = to.pathItems.getByName(layer.name + ' Shape Path copy');
        path.name = layer.name;
        layer.remove();
    }
}
    

//////////////////////////////
// ScriptListener Functions //
//////////////////////////////

function cTID(id) { return app.charIDToTypeID(id); }
function sTID(id) { return app.stringIDToTypeID(id); }

function selectPath(name) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Path'), name);
    desc1.putReference(cTID('null'), ref1);
    app.executeAction(cTID('slct'), desc1, DialogModes.NO);
}
    
function makeShapeLayer() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(sTID('contentLayer'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    var desc3 = new ActionDescriptor();
    var desc4 = new ActionDescriptor();
    desc4.putDouble(cTID('Rd  '), 255);
    desc4.putDouble(cTID('Grn '), 255);
    desc4.putDouble(cTID('Bl  '), 255);
    desc3.putObject(cTID('Clr '), sTID('RGBColor'), desc4);
    desc2.putObject(cTID('Type'), sTID('solidColorLayer'), desc3);
    desc1.putObject(cTID('Usng'), sTID('contentLayer'), desc2);
    app.executeAction(cTID('Mk  '), desc1, DialogModes.NO);
}
    
function pathFromShapeLayer() {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(cTID('Path'));
    desc.putReference(cTID('null'), ref);
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Path'), cTID('Path'), sTID('vectorMask'));
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc.putReference(cTID('From'), ref1);
    desc.putBoolean(cTID('Dplc'), true);
    app.executeAction(cTID('Mk  '), desc, DialogModes.NO);
}
    
function deselectPaths() {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(cTID('Path'), cTID('Ordn'), cTID('Trgt'));
    desc.putReference(cTID('null'), ref);
    app.executeAction(cTID('Dslc'), desc, DialogModes.NO);
}
    
function accelerate() {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putProperty(cTID('Prpr'), cTID('PbkO'));
    ref.putEnumerated(cTID('capp'), cTID('Ordn'), cTID('Trgt'));
    desc.putReference(cTID('null'), ref );
    var pdesc = new ActionDescriptor();
    pdesc.putEnumerated(sTID('performance'), sTID('performance'), sTID('accelerated'));
    desc.putObject(cTID('T   '), cTID('PbkO'), pdesc );
    app.executeAction(cTID('setd'), desc, DialogModes.NO);
}
    
main();