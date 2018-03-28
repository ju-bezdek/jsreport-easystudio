exports = {
    "templateStore":{
        "type":"func",
        /**
         * Function returns array of objects like 
         * [
         * {id:null, 
                name:"",
                lastModiftime:null,
                comment:"",
                templateParts:[
                {"key": "body", "value":"<h1>hello body</h1>"},
                {"key": "header", "value":"<h1>hello header</h1>"}, //optional
                {"key": "footer", "value":"<h1>hello footer</h1>"}, //optional
                {"key": "options", "type":"JSON", "value": JSON.stringify({ 'output':'pdf', 'margin':'null' , 'format':'A4', dataSourceId:"demo", dataStore:"demo" })} //optional but recomended
                ]}
            ]
         */
        getTemplate:function(id){
            return JSON.stringify([
                {"key": "body", "value":"<h1>hello body</h1>", "caption":"Main body of document"},
                {"key": "header", "value":"<h1>hello header</h1>", "caption":"Header"}, //optional
                {"key": "footer", "value":"<h1>hello footer</h1>", "caption":"Footer"}, //optional
                {"key": "options", "type":"JSON", "value":"{ output:'pdf', margin:'', format:'A4'}", "caption":"Configuration"} //optional but recomended
            ]);
        },
        setTemplate:function(id, data){
            //Write great things here
        }
    },

    /**
     * List of dataProviderStores... they can be referenced in configuration options
     */
    "dataProviderStores":[
        {
            "id":"main",
            "type":"api",
            "url":"http://localhost/getData/:sourceId?:parameters",
            "sourceIdPlaceHolder":":sourceId",
            "templateDataUrl":"http://localhost/getData/:sourceId?contextentity=0"
        },
        {
            "id":"demo",
            "type":"func",
            getData: function (sourceId,parameters){
                return {"this_is":"cool new object filled with data", "and":{"data":"objects","plus":[{"arrays": "of objects"}]}}; 
            },
            //This is optional... getData without parameters is called by default
            getDemoData: function(sourceId){
                return {"demo":"object"};
            }
        },
        {
            "id":"demo_api_full",
            "type":"api",
            clientOptions: {
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
                    secureOptions: constants.SSL_OP_NO_TLSv1_2,
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