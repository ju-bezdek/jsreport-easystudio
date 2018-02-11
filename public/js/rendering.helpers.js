/**
 * object that holds all rendering helpers
 */
var renderingHelpers = {
/**
 * returns functions in string as required for jsreport.net
 * @param {string} engine 
 */
  getEngineHelpersString: function (engine){
    var helpers = this.allEngineHelpers[engine];
    var res='';

    if(helpers)
    {
      for(var i in helpers){
        res=res+('\n'+helpers[i]).replace('function (', 'function '+ i + ' (')
      }
    }
    else{
      console.log( 'No helpers methods defined for engine ' + engine);
    }
    return res;
  },

  allEngineHelpers:{
    handlebars:{

      forEach:   function    (items, options) {

        var ret,repeatingTableStart, repeatingTableEnd = "";
        if(!items || items.length<1){
          return "";}
          
        var curItemRes  = options.fn(items[0]);
        if ( items.length>1 && curItemRes.toLowerCase().substring("table")!==-1){ //optimalization ... skip if no table in text, or exatly one item...
          var tbodyRegex = /<[ ]*tbody[ ]*>/gi;
          var tbodyEndRegex = /<\/[ ]*tbody[ ]*>/gi;
          var startMatch = tbodyRegex.exec(curItemRes);
          if (startMatch!==null && startMatch.length>=1){ 
            if (tbodyRegex.lastIndex==startMatch.index +startMatch[0].length ){  //exactly one match is expecting... otherwise there are two or more tables and you dont wanna break it
              var endMatch = tbodyEndRegex.exec(curItemRes);
              if (tbodyEndRegex.lastIndex==endMatch.index+endMatch[0].length){  //exactly one match is expecting... 
                repeatingTableStart = curItemRes.substring(0, startMatch.index+  startMatch[0].length) //everything until ... <tbody>ˇ included
                repeatingTableEnd = curItemRes.substring(endMatch.index) //everything after ˇ</tbody> ...included 
                curItemRes = curItemRes.substring(0, endMatch.index);
              }
            }
          }
        }
        ret = curItemRes;
      
        for(var i=1, j=items.length; i<j; i++) {
          curItemRes =  options.fn(items[i]);
      
          curItemRes=curItemRes.replace(repeatingTableStart,'');
          if (i<j-1) curItemRes=curItemRes.replace(repeatingTableEnd,'');
          ret = ret +curItemRes;
        }
      
        return ret;
      }

    }
  }
}

exports.allEngineHelpers = renderingHelpers.allEngineHelpers;

exports.getEngineHelpersString = renderingHelpers.getEngineHelpersString;
