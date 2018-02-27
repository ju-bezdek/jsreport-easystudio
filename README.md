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
Integrated editor is base on [monaco-editor](https://github.com/Microsoft/monaco-editor) ... powerfull code editor used in [Visual Studio Code](https://code.visualstudio.com)!

![Copy&Paste](/Docs/easyStudio_codeEditor.gif)


## Configuration

Config with json:
```json
{
    "templateStore":{ 
        "type":"api",
        "url":"localhost/getTemplate/:id",
        "urlAll":"localhost/getAllTemplates",
        "urlNew":"localhost/getNewTemplate",
        "idPlaceHolder":":id",
        "clientOptions":null
    },
    "dataProviderStores":[
        {
            "id":"main",
            "type":"api",
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

```json
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
        {...}
    ]
```

Alternatively you can configure app alse by javacsript file named config.js. In this case you can set your own javascript methods. Take a look at: [_example_config.js](config/_example_config.js)

##User configuration
 ...TODO...

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