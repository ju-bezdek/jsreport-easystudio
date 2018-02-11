

$(window).on("load",function(){
    var myId='my-tinymce-editor';
    var wysiwygDiv = document.getElementById(jsReportEasyStudioEditor.constants.wysiwygEditorId);
    var textArea = document.createElement('textarea');
    textArea.id=myId
   wysiwygDiv.appendChild(textArea);
    tinymce.init({
    selector: '#'+myId,
    height: 500,
    menubar: false,
    paste_data_images:true,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor textcolor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table contextmenu paste fullpage'
    ],
    table_advtab: false,
    branding: false,
    toolbar1: " | undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent  | forecolor backcolor ",

    toolbar2: " formatselect fontselect fontsizeselect | table | hr removeformat | subscript superscript | charmap  visualchars visualblocks nonbreaking  pagebreak ",


    content_css: [
      '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i'],
      setup: function (editor) {
        
        editor.on('change', function(e) {
          jsReportEasyStudioEditor.refreshCurrentTemplateValueFromEditor(jsReportEasyStudioEditor.wisiwygEditor.getContent());

        });

          jsReportEasyStudioEditor.wisiwygEditor =  editor;
          editor.on('init', function(args) {
            jsReportEasyStudioEditor.onLoad(); //dirty !!!
          });
        }
    });
    
    jsReportEasyStudioEditor.getDataFromEditor=function(){
      return jsReportEasyStudioEditor.wisiwygEditor.getContent();
      

    };

 
    $('#' + jsReportEasyStudioEditor.constants.wysiwygDivId).bind('onShown', function () {
      jsReportEasyStudioEditor.resetTempleteData();
  });

    jsReportEasyStudioEditor.loadDataToWisiwygEditor=function(data){
      jsReportEasyStudioEditor.wisiwygEditor.setContent(data); 
    };

    jsReportEasyStudioEditor.decode

  });


