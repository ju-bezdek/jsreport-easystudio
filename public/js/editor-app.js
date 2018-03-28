 // @ts-check 


 if (easyAppState.localization) {
  jsReportEasyStudioEditor.localizedTexts= Object.assign(jsReportEasyStudioEditor.localizedTexts, easyAppState.localization);
 }
 jsReportEasyStudioEditor.language = easyAppState.language;

 //common after load data logic
 var afterLoadData = function(dataJson){
  var data = dataJson;
  if (typeof dataJson == 'string') {
    data= JSON.parse(dataJson);
  }
  var nameField = $('#name-field')[0];
  if (easyAppState.localization && easyAppState.localization[easyAppState.language] )
     nameField.placeholder= easyAppState.localization[easyAppState.language]['newNamePlaceholder'] || nameField.placeholder;
  if (data.name)
     nameField.value=data.name;

  jsReportEasyStudioEditor.loadData(dataJson);
  jQuery.get('../getTemplateDataParams/' + easyAppState.templateId, null, function (dataJson) {
    if (typeof dataJson == 'string') {
      dataJson = JSON.parse(dataJson);
    }
    jsReportEasyStudioEditor.addSnippets(dataJson);
  });
 };



//Swich ... diferent logic for new template and for editing existing
 if (easyAppState.templateId) {
   //New template
   jsReportEasyStudioEditor.onLoad = function () {
     jQuery.get('../getTemplate/' + easyAppState.templateId, null, function (dataJson) {
      afterLoadData(dataJson);
     });
     
   };
   jsReportEasyStudioEditor.saveMethod = function (data) {
    if (!data.name){
      var nameField = $('#name-field')[0];
      data.name=nameField.placeholder;
     }
     $.ajax({
       type: 'POST',
       data: JSON.stringify(data),
       contentType: 'application/json',
       url: '../setTemplate/' + data.id,
       success: function (response) {
         data.id = response.id;
       }
     });
     return true;
   };
 }
 else {
   //edit existing tempplate
   jsReportEasyStudioEditor.onLoad = function () {
     jQuery.get('../getNewTemplate', null, function (dataJson) {
      afterLoadData(dataJson);
   })};
   jsReportEasyStudioEditor.saveMethod = function (data) {
    if (!data.name){
      var nameField = $('#name-field')[0];
      data.name=nameField.placeholder;
     }
     $.ajax({
       type: 'POST',
       data: JSON.stringify(data),
       contentType: 'application/json',
       url: '../new',
       success: function (response) {
         //data.id = response.id;
         if(response.id!==undefined &&response.id!==null){
           history.pushState(null, "List", "../list");
           window.location.replace(window.location.toString().replace('/list', "/edit/"+response.id));
         }
       }
     });
     return true;
   };
 }

 jsReportEasyStudioEditor.createEditor('editor');

$('#name-field').change(
 function(){
   jsReportEasyStudioEditor.template.name =  this.value;
  }
  );
