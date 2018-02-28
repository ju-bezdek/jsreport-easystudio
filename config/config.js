//This is just config.js example for demo and testing purpose 
global.memoryData={};
global.demoTemplate=JSON.stringify({id:null, 
    name:"",
    lastModiftime:null,
    comment:"",
    templateParts:[
    {"key": "body", "value":"<h1>hello body</h1>"},
    {"key": "header", "value":"<h1>hello header</h1>"}, //optional
    {"key": "footer", "value":"<h1>hello footer</h1>"}, //optional
    {"key": "options", "type":"JSON", "value": JSON.stringify(
        {
            "output": "pdf",
            "dataSourceId": "demo",
            "dataStore": "demo",
            "specialSettings":{
                "orientation":"landscape",
                "format":"A4",
                "headerHeight":"3cm",
                "footerHeight":"3cm",
                "margin":"1cm"
            }
        }
    )} //optional but recomended
]});

exports.config = {
    //Do not set this, unles you want add or override certain language
    "localization":null,
    "language":"en-US",
    "templateStore":{
        "type":"func",


        /**
         * returns array like [{"id":1, "name":"First template"}]
         */
        getAllTemplates:function(){
            var res =[];
            if (global.memoryData){
                var keys  = Object.getOwnPropertyNames(global.memoryData);

                for (let index = 0; index < keys.length; index++) {
                    let key = keys[index];
                    res.push(global.memoryData[key]);
                }
            }
            return res;
        },
         /**
         * Function returns array of objects like [
            {"key": "body", "value":"<h1>hello body</h1>", "caption":"optional caption... for stadard keys use rather localization"},
            {"key": "header", "value":"<h1>hello header</h1>" },
            {"key": "footer", "value":"<h1>hello footer</h1>"},
            {"key": "options", "type":"JSON", "value":"{ output:'pdf', margin:'', format:'A4'}"}
            @param {Number} id 
        ]
         */
        getTemplate:function(id){
            return (global.memoryData||{})[id] || global.demoTemplate;
        },
        getNewTemplate:function(){
            return global.demoTemplate;
        },
        setTemplate:function(id, data){
            //Write great things here


            if (!data){
                delete global.memoryData[id];
            }
            else{
                if (!id){
                    id = Object.keys(global.memoryData).length
                    data.id=id;
                }
                if (!global.memoryData){
                    global.memoryData={};
                }
                global.memoryData[id] = data 
                return data;
            }
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
                return {"peram1":"cool new object filled with data", "para2":{"data":"objects","plus":[{"pole": "of objects and"}, {"arrays": "of its items"}]}}; 
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