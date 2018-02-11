


(function(window){
    var eDiv=document.getElementById(jsReportEasyStudioEditor.constants.codeEditorDivId);
   
    require.config({ paths: { 'vs': '../node_modules/monaco-editor/min/vs' }});
    require(['vs/editor/editor.main'], function() {
        
        
        jsReportEasyStudioEditor.codeEditor = monaco.editor.create(eDiv, {
            
            language: 'html',
            //automaticLayout: true,
            scrollBeyondLastLine: false
        });
        jsReportEasyStudioEditor.loadDataToCodeEditor=function(data, lang){
            if (lang) {
                monaco.editor.setModelLanguage(jsReportEasyStudioEditor.codeEditor.getModel(), lang);
                if (lang.toLowerCase() == 'json'){
                    data = JSON.stringify(JSON.parse(data), null, 4);
                }
            }
            jsReportEasyStudioEditor.codeEditor.setValue(data)
        };

        jsReportEasyStudioEditor.codeEditor.getModel().onDidChangeContent(function(){ 
            jsReportEasyStudioEditor.refreshCurrentTemplateValueFromEditor(jsReportEasyStudioEditor.codeEditor.getValue());
        });
        
    });

    $('#' + jsReportEasyStudioEditor.constants.codeDivId).bind('onShown', function () {
        jsReportEasyStudioEditor.codeEditor.layout();
        jsReportEasyStudioEditor.resetTempleteData();
    });
    // $('#' + jsReportEasyStudioEditor.constants.codeDivId).bind('onHiden', function () {
    //     jsReportEasyStudioEditor.wisiwygEditor.setContent(jsReportEasyStudioEditor.codeEditor.getValue()); //TODO: hardcoded - expecting tinyMce !!!
        
    // });

    $('#' + jsReportEasyStudioEditor.constants.wysiwygDivId).bind('onBeforeHide', function () {
        var height = jsReportEasyStudioEditor.wisiwygEditor.editorContainer.clientHeight; //TODO: hardcoded - expecting tinyMce !!!
        var eDiv = document.getElementById(jsReportEasyStudioEditor.constants.codeEditorDivId);
        eDiv.setAttribute("style", "height:" + height + "px"); //set edior height acording to tinymce editor
        
    });

    
})(window);

