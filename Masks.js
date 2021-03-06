function main() {
    if (app.documents.length === 0) return;
    if (targetLayerCount() === 0) return; // No layers selected
        
    activeDocument.suspendHistory('Mask Action', 'conditionSwitch(checkSelection(), checkLayerMask());');
}
    
function conditionSwitch(docHasSelection, layerHasMask) {
    if (docHasSelection) {
        if (layerHasMask) {
            replaceLayerMask();
        } else {
            maskFromSelection();
        }
    } else {
        if (layerHasMask) {
            removeLayerMask();
        } else {
            blankMask();
        }
    }
}
    
function sTID(id) { return app.stringIDToTypeID(id); }
function cTID(id) { return app.charIDToTypeID(id); }

function checkSelection() {
    try {
        activeDocument.selection.bounds;
        return true;
    } catch(e) {
        return false;
    }
}
    
function checkLayerMask() {
    var ref = new ActionReference();
    ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    var desc = executeActionGet(ref);
    return desc.getBoolean(sTID('hasUserMask'));
}
    
// Accounts for the presence of a background layer, which throws things off
function layerIndex(lyr) {
    var isBGLyr = false;
    try {
        activeDocument.backgroundLayer; // Fails if there is no background layer
        isBGLyr = true;
    } catch(e) { }
            
    return lyr.itemIndex - (isBGLyr ? 1 : 0);
}
    
function setFeather(amount) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIndex(cTID('Lyr '), layerIndex(activeDocument.activeLayer));
    desc.putReference(cTID('null'), ref);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(sTID('userMaskFeather'), cTID('#Pxl'), amount);
    desc.putObject(cTID('T   '), cTID('Lyr '), desc2);
        
    executeAction(cTID('setd'), desc, DialogModes.NO);
}
    
function replaceLayerMask() {
    ref = new ActionReference();
    ref.putIndex(cTID('Lyr '), layerIndex(activeDocument.activeLayer));
    var desc = executeActionGet(ref);
    var userMask = desc.getDouble(sTID('userMaskFeather'));
        
    setFeather(0);
    removeLayerMask();
    maskFromSelection();
    setFeather(userMask);
}
    
// Reference: https://forums.adobe.com/thread/1466887
function targetLayerCount() {
    var selectedLayers = [];
    var ref = new ActionReference();
    ref.putEnumerated(cTID('Dcmn'), cTID('Ordn'), cTID('Trgt'));
    var desc = executeActionGet(ref);
        
    return desc.hasKey(sTID('targetLayers')) ?
        desc.getList(sTID('targetLayers')).count :
        0;
}
        
function maskFromSelection(){
    var desc = new ActionDescriptor();
    desc.putClass(cTID('Nw  '), cTID('Chnl'));
    var ref = new ActionReference();
    ref.putEnumerated(cTID('Chnl'), cTID('Chnl'), cTID('Msk '));
    desc.putReference(cTID('At  '), ref);
    desc.putEnumerated(cTID('Usng'), cTID('UsrM'), cTID('RvlS'));
    executeAction(cTID('Mk  '), desc, DialogModes.NO);
        
    setFeather(0.3);
}
    
function removeLayerMask() {
    // target mask to remove
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(cTID('Chnl'), cTID('Chnl'), cTID('Msk '));
    desc.putReference(cTID('null'), ref);
    desc.putBoolean(cTID('MkVs'), false);
    executeAction(cTID('slct'), desc, DialogModes.NO);
        
    // remove it
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(cTID('Chnl'), cTID('Ordn'), cTID('Trgt'));
    desc.putReference(cTID('null'), ref);
    executeAction(cTID('Dlt '), desc, DialogModes.NO);
}
    
function blankMask() { 
    var desc = new ActionDescriptor();
    desc.putClass(cTID('Nw  '), cTID('Chnl'));
    var ref = new ActionReference();
    ref.putEnumerated(cTID('Chnl'), cTID('Chnl'), cTID('Msk '));
    desc.putReference(cTID('At  '), ref);
    desc.putEnumerated(cTID('Usng'), cTID('UsrM'), cTID('RvlA'));
    executeAction(cTID('Mk  '), desc, DialogModes.NO);
}
    
main();