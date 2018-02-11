

console.log('hi')

function findInArrayByKey(array, key){
    for (let index = 0; index < array.length; index++) {
        if (array[index].key==key){
            return array[index];
        }
    }
}

var jsreport = require('jsreport-core')({
    tasks:{
    "strategy": "in-process"
    },
    "phantom": {   
        "defaultPhantomjsVersion": "2.1.1"
      }
});
var bodyParser = require('body-parser');
var renderingHelpers = require('./public/js/rendering.helpers');
var fs = require('fs');



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
        options['phantom'] = options.specialSettings;
        options.recipe = "phantom-pdf";
        options['phantom'].header= findInArrayByKey(templates,'header').value,
        options['phantom'].footer= findInArrayByKey(templates,'footer').value
        return options;
    },
    "html-to-xlsx":function(options,templates){
        options['html-to-xlsx'] = options.specialSettings;
        options.recipe = "html-to-xlsx";
        return options;
    },
    "html-to-text":function(options,templates){
        options['text'] = options.specialSettings;
        options.recipe = "html-to-text";
        return options;
    },
    "html-embedded-in-docx":function(options,templates){
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
        return this[this.extractKey(options)](options,templates);
    }

};

function render(res, templates, data, options){
    

    return jsreport.init().then( function(){
    if (!options){
        options = {
            engine:'handlebars'
        }
    }
    var customOptions = findInArrayByKey(templates,'options').value;
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
        content: findInArrayByKey(templates,'body').value,
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

/** 
 * Creates array of posible report parameters for particular object example
*/
function createDataParametersForExample(obj, renderingEngine, optionTypes){

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
}

testObj = 
    {
        lev1:
            {
                lev2:
                    {
                        lev3:
                            {
                                p1: "1",
                                p2: 2
                            }, pl2: 2
                    },
                pl1: "l1_p1",
                listOfParams: [
                    {param1:"A", value:"B"},
                    {param1:"A", value:"B", specialParam:"XXX"},
                ]
            }
    };


const express = require('express')
const app = express()
var exphbs  = require('express-handlebars');
var path  = require('path');


var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        layoutsDir: path.join(__dirname, "views/layouts"),
        
        defaultLayout: 'main'
        

    }
});


data=`[
    {"key": "body", "value":"<h1>hello body</h1>", "caption":"Šablóna"},
    {"key": "header", "value":"<h1>hello header</h1>", "caption":"Hlavička"},
    {"key": "footer", "value":"<h1>hello footer</h1>", "caption":"Pätička"},
    {"key": "options", "type":"JSON", "value":`+JSON.stringify({ output:'pdf', margin:'', format:'A4',width :"",height :"",orientation :"" ,specialSettings:{engine:'handlebars', recipe:'phantom'}})+`, "caption":"Konfigurácia"}
]`;

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use('/static', express.static('public'));


/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
  }));


app.get('/', function (req, res) {
    res.render('home', {layout: 'main'});
});

// TODO: toto treba doriešiť... typicky je parametrom idčko šablony a data formou post/get
app.get('/render', function (req, res) {
    res.contentType("application/pdf");
    render(res);
});


// respond with "hello world" when a GET request is made to the homepage
app.post('/preview', function (req, res) {
    res.contentType("application/pdf");
    render(res, req.body, testObj);
});

app.get('/getTemplate/:id', function(req,res){
    console.log('req:getTemplate');
    if ( parseInt(req.params.id)>0){
        res.contentType('json');
        res.send(data);
    }
    else{
        res.contentType('text');
        res.send('');
    }
}
);

app.get('/getTemplateDataParams/:id', function(req,res){
    console.log('req:getTemplateParams');
    if ( parseInt(req.params.id)>0){
        res.contentType('json');
        res.send(createDataParametersForExample(testObj));
    }
    else{
        res.contentType('text');
        res.send('');
    }
}
);



app.post('/setTemplate/:id', function(req,res){
    console.log('req:setTemplate');
    if ( parseInt(req.params.id)>0){
        data = req.body;
        console.log(data);
        res.contentType('text');
        res.send('OK');
    }
    else{
        res.contentType('text');
        res.send('invalid id');
    }
}
);


app.get('/edit/:id', function (req, res) {
    console.log('req:edit');
    res.contentType('html');
    res.render('editTemplate', { layout: 'main', requestUrl: '/edit', templateId:req.params.id})
});

app.use('/node_modules/monaco-editor', express.static(__dirname + '/node_modules/monaco-editor'));
app.use('/node_modules/tinymce', express.static(__dirname + '/node_modules/tinymce'));


app.listen(8080, () => console.log('app running'))

