

console.log('hi')


const express = require('express')
const app = express()
const exphbs  = require('express-handlebars');
const path  = require('path');
const bodyParser = require('body-parser');

var config=null;
try {
    config = require('./config/config.js');
    if (config.config)
        config = config.config;       
} catch (error) {
    config = require('./config/config.json');
}


const initiaization = require('./init.js');

const jsReportApp= (function(){
    
    var appModule = initiaization.create( config);
    appModule.rendering = require('./rendering').init(); 
    appModule.parseOptions = function(data){
        var val = data.find(x => x.key === 'options').value;
        if (typeof val ==="string"){
            return JSON.parse(val);
        }
        else{
            return val;
        }
    }

    appModule.getTemplateOptions = function (templateId) {
        var data = jsReportApp.getTemplate(templateId);
        if (typeof data === "string") {
            data = JSON.parse(data);
        }
        var options = jsReportApp.parseOptions(data);
        return options;
    }

    
    return appModule;
})();


const handlebars = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        section: function(name, options){ //todo ... do I need this anymore?
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        layoutsDir: path.join(__dirname, "views/layouts"),
        defaultLayout: 'main'
    }
});


//Init express APP
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use('/static', express.static('public'));
//Publish node modeules
app.use('/node_modules/monaco-editor', express.static(__dirname + '/node_modules/monaco-editor'));
app.use('/node_modules/tinymce', express.static(__dirname + '/node_modules/tinymce'));

app.use(bodyParser.json({limit: '15mb'}));
app.use(bodyParser.urlencoded({
    limit: '15 mb', 
    extended: false,

  }));



//Routing

/**
 * Home view
 */
app.get('/', function (req, res) {
    res.render('home', {layout: 'main'});
});

// TODO: toto treba doriešiť... typicky je parametrom idčko šablony a data formou post/get
app.get('/render-report/:templateId', function (req, res) {
    var templateId=req.params.templateId;
    var parameters = req.query;
    var templateData = jsReportApp.getTemplate(templateId);
    if (typeof templateData === "string") {
        templateData = JSON.parse(templateData);
    }
    var options= jsReportApp.parseOptions(templateData);
    if (options && options.dataSourceId)
    {
        var data = jsReportApp.dataProviderStores[options.dataStore||'default'].getData(options.dataSourceId, parameters);
        jsReportApp.rendering.renderTemplate(res, templateData, data);
    }
});


/**
 * Preview for template
 */
app.post('/preview', function (req, res) {
    var templateId=req.params.id;
    var options= jsReportApp.getTemplateOptions(templateId);
    if (options && options.dataSourceId)
    {
        var demoData = jsReportApp.dataProviderStores[options.dataStore||'default'].getDemoData(options.dataSourceId);
        jsReportApp.rendering.renderTemplate(res, req.body, demoData);
    }
});

app.get('/getTemplate/:id', function(req,res){
    //  console.log('req:getTemplate');
        res.contentType('json');
        var data = jsReportApp.getTemplate(req.params.id);
        res.send(data);
}
);

app.get('/getTemplateDataParams/:id', function(req,res){
    //console.log('req:getTemplateParams');
    res.contentType('json');
    var templateId;

    var options= jsReportApp.getTemplateOptions(templateId);
    if (options && options.dataSourceId)
    {
        var data = jsReportApp.dataProviderStores[options.dataStore||'default'].getDemoData(options.dataSourceId);
        res.send(jsReportApp.createDataParametersForExample(data));
    }
}
);



app.post('/setTemplate/:id', function(req,res){
    console.log('req:setTemplate');
    jsReportApp.setTemplate(req.params.id,req.body );
    res.contentType('text');
    res.send('OK');
}
);


app.get('/edit/:id', function (req, res) {
    console.log('req:edit');
    res.contentType('html');
    res.render('editTemplate', { layout: 'main', requestUrl: '/edit', templateId:req.params.id, language: jsReportApp.language, localization: JSON.stringify(jsReportApp.localization)})
});

app.listen(8080, () => console.log('app running'))



