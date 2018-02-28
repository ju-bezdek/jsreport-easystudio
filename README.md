# jsreport-easyStudio

Simplified node.js studio for editing jsReport templates.

Check out the [jsReport](https://github.com/jsreport) project on [GitHub repository](https://jsreport.net)

[>> Live demo <<](https://jsreport-easystudio.azurewebsites.net/new)

(preview feature currently does't work since I wasn't able to figure out how to get it work on Azure:)

### Supported output types:
- pdf
- xlsx
- docx
- html
- txt

### Integraded designer
Integrated designer is based on [TinyMCE](http://tinymce.com/) WYSIWYG editor 

It automaticaly generates avalible fields into menu, based on demo data you can provide

![Datafields](/Docs/easyStudio_insertField.gif)

You can also insert, edit, and even paste images from clipboard

![Copy&Paste](/Docs/easyStudio_Images.gif)

Editor has integraded preview

![Preview](/Docs/easyStudio_editPreview.gif)

### Intrgrated code editor
Integrated editor is based on [monaco-editor](https://github.com/Microsoft/monaco-editor) ... powerfull code editor used in [Visual Studio Code](https://code.visualstudio.com)!

![Copy&Paste](/Docs/easyStudio_codeEditor.gif)


## Configuration

Config with json:
```javascript
{
    "templateStore":{ 
        "type":"api",
        "url":"localhost/getTemplate/:id", //base endpoint
        "urlAll":"localhost/getAllTemplates", //endpoint returning all avalible tempkates
        "urlNew":"localhost/getNewTemplate", //endpoint returing initial template
        "idPlaceHolder":":id", //string to be replaced by Id of template
        "clientOptions":null //node-rest-client options
    },
    "dataProviderStores":[
        {
            "id":"main",
            "type":"api", //api | func (only for .js config)
            "url":"localhost/getData/:sourceId?:parameters",
            "sourceIdPlaceHolder":":sourceId",
            "parametersPlaceholder":":parameters"
        }
    ]
}
```

You can set clientOptions for advanced settind like authorization, proxy settings etd. Check out [node-rest-client](https://www.npmjs.com/package/node-rest-client)

Json should have some templateStore configured.
It is expected thad these endpoints will return Json in structire like this:

```javascript
        [
            {
                "id":null, 
                "name":"",
                "lastModiftime":null,
                "comment":"",
                "templateParts":[
                {"key": "body", "value":"<h1>hello body</h1>"},
                {"key": "header", "value":"<h1>hello header</h1>"}, //optional
                {"key": "footer", "value":"<h1>hello footer</h1>"}, //optional
                {"key": "options", "type":"JSON", "value":" ...json..." } //optional but recomended
                ]
            }
        ]
```

For save you should use POST to "url"

GET on "urlNew" should return new template. If not implemented, default empty template is used.

GET on "urlAll" should return structure like this:

```json
    [
        {
            "id":1, 
            "name":"First template"
        },
        //...
    ]
```

Alternatively you can configure app alse by javacsript file named config.js. In this case you can set your own javascript methods. Take a look at: [_example_config.js](config/_example_config.js)

##User configuration

Configuration can be set in Options TAB (template part). 
It has to be in JSON format and must contains this parameters:
```JSON
{
    "output": "pdf",
    "dataStore": "demoProvider",
    "dataSourceId": "demo"
}
```

* output - one of supported file format [ pdf | xlsx | docx | txt | html ]
* dataStore - id of dataProviderStore defined in config [see config](#configuration)
* dataSourceId - id of datasource, that is dataStore mentioned above capable provide:) ... basicaly it's the first parameter that will be pass into getData() function -in case of 'func' dataProviderType, or will be replaced in the url for sourceIdPlaceHolder - in case of 'api' dataProviderType.

###Pdf specific configuration

You can enhance basic configuration mentioned above by these 'PDF specific' parameters:

* margin - px or cm specification of margin used from page borders, you can also pass an Object or JSON object string for better control of each margin side. ex: 
```JSON
    { 
        "top": "5px", 
        "left": "10px", 
        "right": "10px", 
        "bottom": "5px" 
    }
```
* format - predefined page sizes containing A3, A4, A5, Legal, Letter
* width - px or cm page width, takes precedence over paper format
* height - px or cm page height, takes precedence over paper format
* orientation - portrait or landscape orientation
* headerHeight - px or cm height of the header in the page
* footerHeight - px or cm height of the footer in the page
* printDelay - delay between rendering a page and printing into pdf, this is useful when printing animated content like charts
* blockJavaScript - block executing javascript
* waitForJS - true/false <<WARNING!>> use this only if there is something like this in body of template:
```HTML
<script>
    // do some calculations or something async
    setTimeout(function() {
        window.JSREPORT_READY_TO_START = true; //this will start the pdf printing
    }, 500);
    ...
</script>
```

Example:
```JSON

{
    "output": "pdf",
    "dataSourceId": "demo",
    "dataStore": "demo",
    "specialSettings":{
        "orientation":"landscape",
        "format":"A3",
        "headerHeight":"5cm",
        "footerHeight":"0cm",
        "margin":"1cm"
    }
}
```

Read more in original jsReport [phantom-pdf recipe learn section](https://jsreport.net/learn/phantom-pdf)

## Usage

```url
http://your-server/render-report/:templateId?dataSourceParams

example:
http://your-server/render-report/100?param1=value1&papram2=value2...
```

## Roadmap
- allow to render POSTing data
- configure template parameters, and ask for them before rendering
- better support for excel files
- special handlebars helpers for inline calculations
- migration to React or Angular