// @ts-check 
//"use strict";
(function (window) {
    var jsReportEasyStudioEditor = {


        constants: {
            divId: "jsReportEasyStudioEditor",

            wysiwygEditorId: "jsReportEasyStudioEditor-wysiwygEditor",
            navId: "jsReportEasyStudioEditor-Nav",
            codeDivId: "jsReportEasyStudioEditor-CodeEditor",
            mainMenuDivId: "jsReportEasyStudioEditor-MainMenu",
            subMenuDivId: "jsReportEasyStudioEditor-SubMenu",
            submenuItemClass: "jsReportEasyStudioEditor-submenu",
            submenuItemIdPrefix: "jsReportEasyStudioEditor-smItem",
            submenuListClass: "jsReportEasyStudioEditor-list",
            codeEditorDivId: "jsReportEasyStudioEditor-codeEditorDiv",
            wysiwygDivId: "jsReportEasyStudioEditor-wysiwygDiv",
            wysiwygEditorDivId: "jsReportEasyStudioEditor-wysiwygEditorDiv",
            saveButtonId: "jsReportEasyStudioEditor-SaveButton",
           wysiwygButtonId: "jsReportEasyStudioEditor-WisiwigButton",
            codeButtonId: "jsReportEasyStudioEditor-CodeButton",
            saveSuccessClass: "saveSuccess",
            saveErrorClass: "saveError",
            saveWorkingClass: "saveWorking",
            wysiwygEditorButton: "wysiwygEditorButton",
            codeEditorButton: "codeEditorButton"

        },
        /**
         * Dafault language (key must be prezent in localizedTexts)
         */
        language: "en-US",
        localizedTexts: {
            "en-US": {
                code: "Code",
                editor: "Editor",
                insertData: "Insert datafield",
                save: "Save",
                cantInsertHere: "Can't insert this element here",
                preview: "Preview",
                body:"Body",
                header:"Header",
                footer:"Footer",
                options:"Configuration"
            },
            "sk": {
                code: "Zdrojový kód",
                editor: "Editor",
                insertData: "Vložiť dátové pole",
                save: "Uložiť",
                cantInsertHere: "Sem nie je možné vložiť tento prvok",
                preview: "Ukážka",
                body:"Hlavná šablóna",
                header:"Hlavička",
                footer:"Pätička",
                options:"Nastavenia"
            }
        },

        /**
         * list of templetes in {key:"idOfTemplate", value:"html", caption:"optional... caption to be shown in toolbar"}
         */
        templateEditorData: [],

        /**
         * Regex patterns for indetifiing view engine control nodes like #if,#foreach ...
         */
        controlNodesPatterns: [
            /{{[#|/]\w+.*/
        ],

        /**
         *wysiwygEditor reference (expecting tinyMce)
         */
        wisiwygEditor: null, //somebody shoult set this

        /**
         * code editor refernce (expecting Monaco)
         */
        codeEditor: null, //somebody shoult set this

        /**
         * if set, this function will be caled after editor is initialized
         */
        onLoad: null, //somebody shold set this

        getControlNodes: function () {
            var contenDom = jsReportEasyStudioEditor.wisiwygEditor.getBody();
            var n, a = [],
                walk = document.createTreeWalker(contenDom, NodeFilter.SHOW_TEXT, null, false);
            while (n = walk.nextNode()) {
                jsReportEasyStudioEditor.controlNodesPatterns.forEach(function (pattern) {
                    if (n.textContent && n.textContent.match(pattern)) {
                        a.push(n);
                    }
                })
            }
            return a;
        },

        currentTemplateKey: null,

        refreshCurrentTemplateValueFromEditor: function (data) {
            if (this.currentTemplateKey) {
                if (data || this.data) {
                    this.setTemplateValue(this.currentTemplateKey, data || this.getDataFromEditor());
                } else {
                    console.log('please set getDataFromEditor function to jsReportEasyStudioEditor: jsReportEasyStudioEditor.getDataFromEditor = function(htmlData){} ')
                }
            }
        },

        /**
         * resets template to editors
         */
        resetTempleteData: function () {
            jsReportEasyStudioEditor.setTemplate(jsReportEasyStudioEditor.currentTemplateKey, true);
        },
        /**
         * method to set particular template from templateData, input is key variable from list of templates
         */
        setTemplate: function (templateKey, doNotChangeEditor) {
            var submenu = document.getElementById(this.constants.subMenuDivId);
            if (this.currentTemplateKey === null) {
                if (typeof templateKey == 'number') {
                    templateKey = this.templateEditorData[templateKey].key;
                }

                [].forEach.call(submenu.getElementsByClassName(this.constants.submenuItemClass), function (el) {
                    var itemTemplateId = el.getAttribute('templateId');
                    if (el.getAttribute('templateId') == templateKey) {
                        el.classList.add('active');
                    } else {
                        if (el.classList.contains('active')) {
                            el.classList.remove('active');
                            this.currentTemplateKey = itemTemplateId;
                        }
                    }
                });
                //Get data from editor before overriding it
                this.refreshCurrentTemplateValueFromEditor();
            }



            this.currentTemplateKey = templateKey;
            var template = this.getTemplate(templateKey);
            //Set data to editor

            if ((!template.type || template.type.toLowerCase() == 'html') && !template.disableEditor) { //defaukt is html
                if (!doNotChangeEditor) {
                    document.getElementById(this.constants.wysiwygEditorButton).removeAttribute("disabled");
                    document.getElementById(this.constants.wysiwygEditorButton).click();
                }

                if (this.loadDataToWisiwygEditor) {
                    this.loadDataToWisiwygEditor(template.value, template.type || 'html');
                } else {
                    console.log('please set loadDataToWisiwygEditor function to jsReportEasyStudioEditor: jsReportEasyStudioEditor.loadDataToWisiwygEditor = function(htmlData){} ')
                }
            } else {
                if (!doNotChangeEditor) {
                    document.getElementById(this.constants.codeEditorButton).click();
                    document.getElementById(this.constants.wysiwygEditorButton).setAttribute("disabled", "disabled");
                }
            }

            if (this.loadDataToCodeEditor) {

                var data = '';
                if (typeof template.value == 'string') {
                    data = template.value;
                } else {
                    data = JSON.stringify(template.value, null, 4);
                }

                this.loadDataToCodeEditor(data, template.type || 'html');
            } else {
                console.log('please set loadDataToCodeEditor function to jsReportEasyStudioEditor: jsReportEasyStudioEditor.loadDataToCodeEditor = function(htmlData){} ')
            }
        },

        setTemplateValue: function (templateKey, val) {

            for (var i in this.templateEditorData) {
                if (i == templateKey || this.templateEditorData[i]['key'] == templateKey) {
                    this.templateEditorData[i].value = val;
                    break;
                }
            }
        },




        wait: function (show_hide) {
            var waitId = 'jsReportEasyStudioEditorWait';

            var waitDiv = document.getElementById(waitId);

            if (!waitDiv && show_hide) {
                waitDiv = document.createElement('div');
                waitDiv.id = waitId;
                var loader = document.createElement('div');
                loader.className = 'loader';
                waitDiv.appendChild(loader);

                var rootDiv = document.getElementById(this.constants.divId);
                rootDiv.appendChild(waitDiv);
            }

            if (waitDiv && show_hide) {
                waitDiv.className = "overlay";

            } else if (waitDiv && !show_hide) {
                waitDiv.className = "hidden";
            }

        },

        showPreview: function (data, fileName) {

            var previewId = 'jsReportEasyStudioEditorPreview';

            var canPreviewContent = fileName.toLowerCase().indexOf("pdf") > 0 || fileName.toLowerCase().indexOf("text") > 0 || fileName.toLowerCase().indexOf("html") > 0 || fileName.toLowerCase().indexOf("txt") > 0;
            if (canPreviewContent) {
                var waitDiv = document.getElementById(previewId);

                if (!waitDiv) {
                    waitDiv = document.createElement('div');
                    waitDiv.id = previewId;
                    waitDiv.className = "overlay";
                    var ifrmDiv = document.createElement("div");
                    ifrmDiv.innerHTML = '<span class="close">&times;</span>';
                    var span = ifrmDiv.getElementsByClassName("close")[0];

                    var url = URL.createObjectURL(data);
                    span.attributes['blob-url'] = url;
                    span.onclick = function () {
                        var xdiv = document.getElementById(previewId);
                        xdiv.parentElement.removeChild(xdiv);
                        window.URL.revokeObjectURL(this.attributes['blob-url']);

                    };
                    waitDiv.appendChild(ifrmDiv);
                    ifrmDiv.className = "iframe-div"
                    var ifrm = document.createElement("iframe");
                    ifrm.setAttribute("src", url);

                    ifrmDiv.appendChild(ifrm);

                    var rootDiv = document.getElementById(this.constants.divId);
                    rootDiv.appendChild(waitDiv);
                }
            } else {
                this.saveByteArray(data, fileName);
            }


        },

        /**
         * Saves file
         * @param {byteArray} data 
         * @param {string} name fileName
         */
        saveByteArray: (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            return function (data, name) {

                if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE
                    window.navigator.msSaveOrOpenBlob(data);
                } else {
                    var url = URL.createObjectURL(data);
                    a.href = url;
                    a.download = name;
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
            };
        }()),

        getTemplate: function (templateKey) {
            for (var i in this.templateEditorData) {
                if (i == templateKey || this.templateEditorData[i]['key'] == templateKey) {

                    return this.templateEditorData[i];
                }
            }
        },

        addSnippets: function (data) {
            if (!this.wisiwygEditor) {
                throw 'wisiwygEditor property must be set before adding snippets';
            }

            var addButton = function (root, data) {
                if (!data.caption) {
                    throw 'Snippet generation: each item must have caption property !';
                }
                var res = {
                    text: data.caption
                };
                if (data['subItems']) {
                    for (var idx in data.subItems) {
                        addButton(res, data.subItems[idx]);
                    }
                } else if (data['value']) {
                    res.onclick = function () {
                        jsReportEasyStudioEditor.insertDataParam(data['value'], data.group);
                    }
                }
                if (!root['menu'] || (root['menu'] && root['menu'].constructor != Array)) {
                    root['menu'] = [];
                }
                root['menu'].push(res);
            }
            var rootMenuButton = {
                type: 'menubutton',
                text: this.localizedTexts[this.language].insertData,
                icon: false,
                menu: []

            }
            for (var i in data) {
                var item = data[i];
                addButton(rootMenuButton, item);
            }
            this.wisiwygEditor.addButton('insertDatafield', rootMenuButton);

            (function () {
                //Hack --- refresh button ... see https://stackoverflow.com/questions/36411839/proper-way-of-modifying-toolbar-after-init-in-tinymce
                // get an instance of the editor
                var editor = jsReportEasyStudioEditor.wisiwygEditor; //or tinymce.editors[0], or loop, whatever


                //the button now becomes
                var button = editor.buttons['insertDatafield'];

                //find the buttongroup in the toolbar found in the panel of the theme
                var bg = editor.theme.panel.find('toolbar buttongroup')[0];

                //without this, the buttons look weird after that
                bg._lastRepaintRect = bg._layoutRect;

                //append the button to the group
                bg.append(button);
            })();
        },

        insertDataParam: function (dataParam, group) {
            var isInGroup = false;
            if (group) {
                var curNode = jsReportEasyStudioEditor.wisiwygEditor.selection.getNode();
                var foundNode = null;
                var curNodeContainer = jsReportEasyStudioEditor.wisiwygEditor.selection.getRng().endContainer;
                if (curNode.hasChildNodes()) {
                    var found = -1;

                    for (var i in curNode.childNodes) {
                        if (curNode.childNodes[i].textContent) {
                            if (curNode.childNodes[i] == curNodeContainer) {
                                curNode = curNodeContainer;
                                break;
                            }
                        }
                    }
                }
                isInGroup = false;
                if (curNode.textContent.indexOf(group.start) !== -1 || curNode.textContent.indexOf(group.end) !== -1) {
                    jsReportEasyStudioEditor.wisiwygEditor.notificationManager.open({
                        text: jsReportEasyStudioEditor.localizedTexts[jsReportEasyStudioEditor.language]['cantInsertHere']
                    });
                    return;
                }


                var tw = new tinymce.dom.TreeWalker(curNode);

                var iNode = {
                    id: ""
                };
                var endCounter = 0;

                while (iNode && iNode.id !== "tinymce" && iNode.tagName !== "head") {
                    if (iNode.textContent && iNode.textContent.indexOf(group.start) !== -1) {
                        if (endCounter == 0) {
                            isInGroup = true;
                            break;
                        } else {
                            endCounter--;
                        }

                    }
                    if (iNode.textContent && iNode.textContent.indexOf(group.end) !== -1) {
                        endCounter++;
                    }

                    iNode = tw.prev()
                }


                if (!isInGroup) {
                    jsReportEasyStudioEditor.wisiwygEditor.insertContent('<div>' + group.start + '<p>' + dataParam + '</p>' + group.end + '</div>');

                } else {
                    jsReportEasyStudioEditor.wisiwygEditor.insertContent(dataParam);
                }
            } else {
                jsReportEasyStudioEditor.wisiwygEditor.insertContent(dataParam);
            }

        },

        renderTemplateDataParts: function (selector) {
            //fix pre staršie prehliadače ... podpora tretieho parametra
            var passiveSupported = false;
            try {
                var options = Object.defineProperty({}, "passive", {
                    get: function () {
                        passiveSupported = true;
                    }
                });

                window.addEventListener("test", options, options);
                window.removeEventListener("test", options, options);
            } catch (err) {
                passiveSupported = false;
            }
            //end fix
            var subMenuDiv = document.getElementById(selector);
            var ul = document.createElement('ul');
            ul.className = this.constants.submenuListClass;
            subMenuDiv.appendChild(ul);
            var handleClick = function () {
                jsReportEasyStudioEditor.currentTemplate = this.getAttribute('templateId');
                jsReportEasyStudioEditor.setTemplate(this.getAttribute('templateId'));
                [].forEach.call(this.parentElement.children, function (child) {
                    child.classList.remove('active')
                });
                this.classList.add('active');
            };
            this.templateEditorData.forEach(function (item) {
                var ele = document.createElement('li');

                ele.className = jsReportEasyStudioEditor.constants.submenuItemClass;
                ele.id = jsReportEasyStudioEditor.constants.submenuItemIdPrefix + item.key;
                ele.setAttribute('templateId', item.key);
                var anchor = document.createElement('a');
                anchor.href = "#";
                ele.appendChild(anchor);
                var localizeCaption = jsReportEasyStudioEditor.localizedTexts[jsReportEasyStudioEditor.language][item.key]
                anchor.appendChild(document.createTextNode(item.caption || localizeCaption|| item.key));
                ul.appendChild(ele);

                ele.addEventListener("click", handleClick, passiveSupported ? {
                    passive: true
                } : false);
            });
        },

        /** 
         * Loads data into editor
         * @data: data in format [ { key: id, value:"some html", caption:"optional user friednly name of section"}, ... ] 
         */
        loadData: function (data) {
            for (var k in data) {
                if (!data[k].value) {
                    throw "invalid data... no value in data at: " + k;
                }
            }
            if (!data || !data[0].key || !data[0].value) {
                throw "";
            }
            this.templateEditorData = data;


            this.renderTemplateDataParts(this.constants.subMenuDivId);
            this.setTemplate(data[0].key);

        },

        save: function (data) {
            jsReportEasyStudioEditor.wait(true);
            try {
                setTimeout( function(){
                    jsReportEasyStudioEditor.saveMethod(data|| this.templateEditorData);
                    jsReportEasyStudioEditor.wait(false);
                }, 0 );

            } catch (error) {
                console.log(error);
                this.saveError();
                jsReportEasyStudioEditor.wait(false);
            }
        },


      

        /** 
         * Inits editor in concrete div
         * @divId: 
         */
        createEditor: function (divId) {
            this.mainDiv = divId;
            var addRef = function (src) {
                var headTag = document.getElementsByTagName("head")[0];
                var jqTag = document.createElement('script');
                jqTag.type = 'text/javascript';
                jqTag.src = src;
                headTag.appendChild(jqTag);
            };
            var addCss = function (src) {
                var headTag = document.getElementsByTagName("head")[0];
                var jqTag = document.createElement('link');
                jqTag.type = 'text/css';
                jqTag.rel = "stylesheet"
                jqTag.href = src;
                headTag.appendChild(jqTag);
            };

            var addEle = function (root, type, id, className) {
                var res = document.createElement(type);
                if (id) {
                    res.id = id;
                }
                if (className) {
                    res.classList.add(className);
                }
                root.appendChild(res);
                return res;
            };

            if (typeof window['jQuery'] == 'undefined') {
                addRef('../static/js/jquery.min.js')
            }

            addRef('../node_modules/monaco-editor/min/vs/loader.js');
            addRef('../node_modules/tinymce/tinymce.min.js');
            
            addRef('../static/js/editor.toolbar.js');
            addRef('../static/js/promise.min.js');

            var mainDivEle = document.getElementById(this.mainDiv);
            //Create navigation

            var mainMenuDiv = addEle(mainDivEle, 'div', this.constants.mainMenuDivId, 'nav');
            var mainMenuUl = addEle(mainMenuDiv, 'ul');
            var mainMenuSaveLi = addEle(mainMenuUl, 'li', this.constants.saveButtonId, 'actionButton');
            var mainMenuSaveLink = addEle(mainMenuSaveLi, 'a');
            this.saveButton = mainMenuSaveLink;
            mainMenuSaveLink.href = "#";
            mainMenuSaveLink.onclick = function () {
                jsReportEasyStudioEditor.save(jsReportEasyStudioEditor.templateEditorData);
            }
            mainMenuSaveLink.appendChild(document.createTextNode(this.localizedTexts[this.language].save));
            var mainMenuEditorLi = addEle(mainMenuUl, 'li', this.constants.wisiwigButtonId, 'actionButton');

            var mainMenuEditorLink = addEle(mainMenuEditorLi, 'a');
            mainMenuEditorLink.id = this.constants.wysiwygEditorButton;
            mainMenuEditorLink.href = "#";
            mainMenuEditorLink.classList.add('active')
            mainMenuEditorLink.appendChild(document.createTextNode(this.localizedTexts[this.language].editor));
            mainMenuEditorLink.setAttribute('show', '#' + this.constants.wysiwygDivId);

            var mainMenuCodeLi = addEle(mainMenuUl, 'li', this.constants.codeButtonId, 'actionButton');
            var mainMenuCodeLink = addEle(mainMenuCodeLi, 'a');
            mainMenuCodeLink.id = this.constants.codeEditorButton;
            mainMenuCodeLink.href = "#";
            mainMenuCodeLink.appendChild(document.createTextNode(this.localizedTexts[this.language].code));
            mainMenuCodeLink.setAttribute('show', '#' + this.constants.codeDivId);

            var RequestFile = function (url, data, responseType) {

                function parseResponseHeaders(headerStr) {
                    var headers = {};
                    if (!headerStr) {
                        return headers;
                    }
                    var headerPairs = headerStr.split('\u000d\u000a');
                    for (var i = 0; i < headerPairs.length; i++) {
                        var headerPair = headerPairs[i];
                        // Can't use split() here because it does the wrong thing
                        // if the header value has the string ": " in it.
                        var index = headerPair.indexOf('\u003a\u0020');
                        if (index > 0) {
                            var key = headerPair.substring(0, index);
                            var val = headerPair.substring(index + 2);
                            headers[key] = val;
                        }
                    }
                    return headers;
                }

                var request = new XMLHttpRequest(),
                    file, fileURL;
                request.open("POST", url);
                request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                request.responseType = "arraybuffer";
                request.send(JSON.stringify(data));

                jsReportEasyStudioEditor.wait(true);
                request.onreadystatechange = function () {
                    if (request.readyState === 4) {
                        jsReportEasyStudioEditor.wait(false);
                        var header = parseResponseHeaders(request.getAllResponseHeaders());
                        //can preview context?
                        var contType = header["content-type"];
                        var extension = (contType.indexOf('application/') == 0 && contType.substr('application/'.length)) || (contType.indexOf('text/') == 0 && "txt")
                        var fileName = "";
                        if (extension) fileName = 'preview.' + extension;
                        var data = new Blob([new Uint8Array(request.response)], {
                            type: contType
                        });
                        jsReportEasyStudioEditor.showPreview(data, fileName);

                    }
                };
            };

            var mainMenuPreviewLi = addEle(mainMenuUl, 'li', this.constants.codeButtonId, 'actionButton');
            var mainMenuPreviewLink = addEle(mainMenuPreviewLi, 'a');
            mainMenuPreviewLink.href = "#";
            mainMenuPreviewLink.appendChild(document.createTextNode(this.localizedTexts[this.language].preview));
            mainMenuPreviewLink.onclick = function () {
                RequestFile('/preview', jsReportEasyStudioEditor.templateEditorData, 'application/pdf') //TODO: vyčistiť!!!  formát predsa neviem dopretu !!!

            }


            //Create submenu


            var subMenuDiv = addEle(mainDivEle, 'div', this.constants.subMenuDivId);

            //create editors

            var divEle = addEle(mainDivEle, 'div', this.constants.divId);

            var wisiwygDiv = addEle(divEle, 'div', this.constants.wysiwygDivId);
            var wisiwygEditorDiv = addEle(wisiwygDiv, 'div', this.constants.wysiwygEditorId);
            var codeDiv = addEle(divEle, 'div', this.constants.codeDivId, 'hidden'); // start inwysiwyg by default
            var codeEditorDiv = addEle(codeDiv, 'div', this.constants.codeEditorDivId); // start inwysiwyg by default

            addRef('../static/js/monaco.init.js');
            addRef('../static/js/tinymce.init.js');

            addCss('../static/css/editor-styles.css')

        }
    };
    window['jsReportEasyStudioEditor'] = jsReportEasyStudioEditor;

})(window);