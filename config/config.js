//This is just config.js example for demo and testing purpose 

global.demoTemplate=JSON.stringify([
    {"key": "body", "value":"<h1>hello body</h1>"},
    {"key": "header", "value":"<h1>hello header</h1>"}, //optional
    {"key": "footer", "value":"<h1>hello footer</h1>"}, //optional
    {"key": "options", "type":"JSON", "value": JSON.stringify({ 'output':'pdf', 'margin':'null' , 'format':'A4', dataSourceId:"demo", dataStore:"demo" })} //optional but recomended
]);

exports.config = {
    "localization":{
        "de": {
            code: "Code",
            editor: "Editor",
            insertData: "Datenfeld einfügen",
            save: "Sparen",
            cantInsertHere: "Dieses element kann nicht eingefügt hier werden",
            preview: "Vorschau"
        }
    },
    "language":"sk",
    "templateStore":{
        "type":"func",
        /**
         * Function returns array of objects like [
            {"key": "body", "value":"<h1>hello body</h1>", "caption":"Main body of document"},
            {"key": "header", "value":"<h1>hello header</h1>", "caption":"Header"},
            {"key": "footer", "value":"<h1>hello footer</h1>", "caption":"Footer"},
            {"key": "options", "type":"JSON", "value":"{ output:'pdf', margin:'', format:'A4'}", "caption":"Configuration"}
        ]
         */
        getTemplate:function(id){
            return (global.memoryData||{})[id] || global.demoTemplate;
        },
        setTemplate:function(id, data){
            //Write great things here
            if (!global.memoryData){
                global.memoryData={};
            }
            global.memoryData[id] = data 
            return true;
        }
    },

    /**
     * List of dataProviderStores... they can be referenced in configuration options
     */
    "dataProviderStores":[
        {
            "id":"default",
            "type":"api",
            "url":"localhost/getData/:sourceId?:parameters",
            "sourceIdPlaceHolder":":sourceId",
            "parametersPlaceholder":":parameters"
            
        },
        {
            "id":"demo",
            "type":"func",
            getData: function (sourceId,parameters){
                var res =  {"this_is":"cool new object filled with data", "and":{"data":"objects","plus":[{"arrays": "of objects and"}, {"arrays": "of its items"}]}};
                var keys  = Object.getOwnPropertyNames(parameters);
                for (let index = 0; index < keys.length; index++) {
                    const key = keys[index];
                    res[key]=parameters[key]
                }
                return res;
            },
            //This is optional... getData without parameters is called by default
            getDemoData: function(sourceId){
                return {"this_is":"cool new object filled with data", "and":{"data":"objects","plus":[{"arrays": "of objects and"}, {"arrays": "of its items"}]}}; 
            }
        },
        {
            "id":"demo_api_full",
            "type":"api",
            url:"prody.foo.com",
            clientOptions: { // options for node-rest-client... see documentation here: https://www.npmjs.com/package/node-rest-client
                // proxy configuration 
                proxy: {
                    host: "proxy.foo.com", // proxy host 
                    port: 8080, // proxy port 
                    user: "ellen", // proxy username if required 
                    password: "ripley" // proxy pass if required 
                },
                // aditional connection options passed to node http.request y https.request methods  
                // (ie: options to connect to IIS with SSL)	 
                connection: {
                    secureOptions: "SSL_OP_NO_TLSv1_2",//constants.SSL_OP_NO_TLSv1_2,
                    ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
                    honorCipherOrder: true
                },
                // will replace content-types used to match responses in JSON and XML parsers 
                mimetypes: {
                    json: ["application/json", "application/json;charset=utf-8"],
                    xml: ["application/xml", "application/xml;charset=utf-8"]
                },
                user: "admin", // basic http auth username if required 
                password: "123", // basic http auth password if required 
                requestConfig: {
                    timeout: 1000, //request timeout in milliseconds 
                    noDelay: true, //Enable/disable the Nagle algorithm 
                    keepAlive: true, //Enable/disable keep-alive functionalityidle socket. 
                    keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent 
                },
                responseConfig: {
                    timeout: 1000 //response timeout 
                }
            }
        }
    ]
}