(function(){
    var jsreport = require('jsreport-core')({
        // tasks:{
        // "strategy": "in-process"
        // },
        // "phantom": {   
        //     "defaultPhantomjsVersion": "2.1.1"
        //   }
    });

    renderingHelpers = require('./public/js/rendering.helpers');

    var optionsTransformations={
        outputsConfigs : {
            "pdf":{recipe:"phantom-pdf", contentType:"application/pdf"}   ,
            "xlsx":{recipe:"html-to-xlsx", contentType:"application/xlsx"} ,
            "docx":{recipe: "html-embedded-in-docx", contentType:"application/xlsx"} ,
            "txt":{recipe: "html-to-text", contentType:"text/plain"} ,
            "html":{recipe: "Html", contentType:"text/html"} ,
        },
        extractKey:function(options){
    
            var output=options['output'];
            var recipe = options['recipe'];
            if (!recipe){
               
                recipe = this.outputsConfigs[output].recipe;
            }
             return recipe;
        },
        "phantom-pdf":function(options,templates){
            if (!options['phantom'] ){
                options['phantom'] ={};
            }
            
            options['phantom'] = options.specialSettings||{};
            options.recipe = "phantom-pdf";
            options['phantom'].header= templates.find(x => x.key === 'header').value,
            options['phantom'].footer= templates.find(x => x.key === 'footer').value
            return options;
        },
        "html-to-xlsx":function(options,templates){
            if (!options['html-to-xlsx']  ){
                options['html-to-xlsx']  ={};
            }
            options['html-to-xlsx'] = options.specialSettings;
            options.recipe = "html-to-xlsx";
            return options;
        },
        "html-to-text":function(options,templates){
            if (!options['text']  ){
                options['text']  ={};
            }
            options['text'] = options.specialSettings;
            options.recipe = "html-to-text";
            return options;
        },
        "html-embedded-in-docx":function(options,templates){
            if (!options["html-embedded-in-docx"]   ){
                options["html-embedded-in-docx"]  ={};
            }
            options["html-embedded-in-docx"] = options.specialSettings;
            options.recipe = "html-embedded-in-docx";
            return options;
        },
        "Html":function(options,templates){
            options['Html'] = options.specialSettings;
            options.recipe = "Html";
            return options;
        },
    
        transform:function(options,templates){
            if (!options)
            {options={}}
            return this[this.extractKey(options)](options,templates);
        }
    
    };
    
    function renderTemplate(res, templates, data, options){
        
    
        return this.jsreport.init().then( function(){
        if (!options){
            options = {
                engine:'handlebars'
            }
        }
        var customOptions = templates.find(x => x.key === 'options').value;
        if(customOptions){
            if (typeof customOptions ==="string"){
                 customOptions = JSON.parse(customOptions);
            }
        }
        var transformedOptions = optionsTransformations.transform(customOptions,templates);
        var contentType = optionsTransformations.outputsConfigs[customOptions.output].contentType
        res.contentType(contentType);
        options = Object.assign(options, transformedOptions);
        
        var templateData = {
            content: templates.find(x => x.key === 'body').value,
            engine: options.engine,
            recipe: options.recipe,
            helpers: renderingHelpers.getEngineHelpersString(options.engine)
            
        };
        templateData = Object.assign( options,templateData); //secod parameter has priority
        return jsreport.render({
                template: templateData,
                data: data,
            });
        }).then(function (output){
            //fs.writeFileSync('out.xlsx', output.content) 
            output.stream.pipe(res);
        });
    
    };

    
    exports.init = function() {return  { jsreport:jsreport, renderTemplate: renderTemplate, optionsTransformations: optionsTransformations}};
            
}());