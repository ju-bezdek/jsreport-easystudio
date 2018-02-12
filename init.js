var init = function(appModule,config){

    appModule.language =  config.language || "en-US";
    appModule.localization= config.localization;

    if (!config.templateStore.type){
        config.templateStore.type ="api ";
    }
    //Initialize template store
    if (config.templateStore.type ==="api")
    {
        if (!config.templateStore.url){
            throw "config.templateStore.url missing"
        }
        var Client = require('node-rest-client').Client;
        if (!config.templateStore.clientOptions){
            appModule.templateStoreClient = new Client();
        }else{
            appModule.templateStoreClient = new Client(config.templateStore.clientOptions);
        }
        appModule.templateStoreClient.registerMethod("getTemplateById", config.templateStore.url.replace(config.templateStore.idPlaceHolder || ":id", "${id}") , "GET");
        appModule.templateStoreClient.registerMethod("setTemplateById", config.templateStore.url.replace(config.templateStore.idPlaceHolder || ":id", "${id}") , "POST");

        appModule.getTemplate = function(id){
            appModule.templateStoreClient.methods["getTemplateById"]({ "path":{"id":id}},
                function (data, response) {
                    return data;
                }
            );
        };
        appModule.setTemplate = function(id, data){
            appModule.templateStoreClient.methods["setTemplateById"]({ "path":{"id":id}, "data":data},
                function (data, response) {
                    return response;
                }
            );
        };
    }
    else if (config.templateStore.type==="func"){
        appModule.getTemplate =config.templateStore.getTemplate;
        appModule.setTemplate =config.templateStore.setTemplate;
    }
    else{throw "invalid config.templateStore.type = "+config.templateStore.type+" ... but can be 'func' or 'api', nothing else";}

    //Initialize template store
    if (config.dataProviderStores)
    {
        appModule.dataProviderStores={};
        config.dataProviderStores.forEach(function(dsConfig, idx) {
            var ds = {};
            if (!dsConfig.id){ throw "Invalid dataProviderStore config : no Id set for" + JSON.stringify(dsConfig);}

            if (dsConfig.type==="api"){
                if (!dsConfig.url){
                    throw "config.dataProviderStores["+idx+"].url missing"
                }
                var Client = require('node-rest-client').Client;
                if (!dsConfig.clientOptions){
                    ds.dataProviderClient = new Client();
                }else{
                    ds.dataProviderClient = new Client(dsConfig.clientOptions);
                }
                ds.dataProviderClient.registerMethod("getTemplateData", dsConfig.url.replace(dsConfig.sourceIdPlaceHolder || ':sourceId', "${id}") , "GET");
        
                ds.getData = function(sourceId, parameters){
                    ds.dataProviderClient.methods["getTemplateData"]({ "path":{"id":sourceId}, parameters: parameters},
                        function (data, response) {
                            return data;
                        }
                    );
                };

            }
            else if (dsConfig.type==="func"){
                ds.getData =dsConfig.getData;
            }
            else{throw "config.dataProviderStores["+idx+"].type ="+config.templateStore.type+" ... but can be 'func' or 'api', nothing else";}

            if (dsConfig.getDemoData)
            {
                ds.getDemoData=dsConfig.getDemoData;
            }
            else{
                ds.getDemoData = ds.getData;
            }

            appModule.dataProviderStores[dsConfig.id]=ds;
        });
       
    }

    appModule.createDataParametersForExample =   function createDataParametersForExample(obj, renderingEngine, optionTypes){

        optionTypes=optionTypes || {
            handlebars:{
                fieldPlaceholder:"@@@field@@@",
                arrayStartPattern:"{{# forEach @@@field@@@ }}",
                arrayEndPattern:"{{/forEach}}",
                fieldPattern:"{{@@@field@@@}}"
            },
            jsrender:{
                fieldPlaceholder:"@@@field@@@",
                arrayStartPattern:"{{ for @@@field@@@ }}",
                arrayEndPattern:"{{/for}}",
                fieldPattern:"{{: @@@field@@@ }}"
            }
        };
    
        function createDataParametersForExampleCore (obj, path, group, options){
            var resArray = [];
            
    
            Object.keys(obj).forEach(function(p)
            {
                var currPath = path ?  path + '.' + p : p;
                if(Array.isArray(obj[p])){
                    var newGroup = {
                            start: options.arrayStartPattern.replace(options.fieldPlaceholder, currPath),
                            end: options.arrayEndPattern.replace(options.fieldPlaceholder, currPath)
                        };
                    resArray.push(
                        {
                            
                            caption:p+ '[]',
                            value: newGroup.start + "<br/><br/>"+newGroup.end,
                            //get schema only by first element
                            subItems: createDataParametersForExampleCore( obj[p][0],null,newGroup , options)
                        }
                    );
    
                }
                else if (typeof obj[p] ===typeof {} && obj[p]!==null)
                {
                    
                    var subItems = createDataParametersForExampleCore( obj[p],currPath,group, options);
                    resArray.push(
                        {caption: p, "subItems":subItems}
                    );
                }
                else
                {
                    resArray.push(
                        {
                            caption:p ,  
                            group:group,
                            value: options.fieldPattern.replace(options.fieldPlaceholder, currPath)
                        }
                    );
                }
            });
            return resArray;
        }
        
        var res = createDataParametersForExampleCore(obj, null,null, renderingEngine? optionTypes[renderingEngine]:optionTypes[Object.keys(optionTypes)[0]]);
        
        return res;
    };
   

    return appModule;
}

exports.init = init;
exports.create = function (config){ return init({}, config)};