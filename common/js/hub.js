var QueryString = function (){
    /* This function is anonymous, is executed immediately and 
     the return value is assigned to QueryString!
     */
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

var userID = QueryString.ID;

function jsonCallback(data){
    console.log("console.log()");
    goCompile(data);
/*        $.each(data.sites, function (key, val) {
//            console.log(data); get entire sites: <array>
//            if (val.titolo !== '') {
//                // avoid empty news
//            }
        });*/
    return;
};    
function getNews(urlJson){
    $('<div></div>').attr('id','spinner')
                    .appendTo('body');
    $.ajax({
        type: 'GET',
        url: urlJson,
        crossDomain: true,
        jsonp: false,
        cache: true,
        jsonpCallback: 'jsonCallback',
        dataType: 'jsonp',
        success: function (json) { console.log('success!'); },
        error: function (e) { console.log(e.message); },
        complete: function (jqXHR, textStatus ) { 
            $("#spinner").remove();
            slideShow();
        }
    });
};

    
function goCompile(returnData) {
//            $.getJSON(returnedData, function (data){
    var theCompiledHtml = theTemplate(returnData);
    $('.content-placeholder').html(theCompiledHtml);
}

(function (exports) { //        var socket = io.connect(socketURI);
    var socket = io();
    socket.on('connection', function (data) {
        console.log('socket connection on');
    });

    socket.on(userID + '-left', function (data) {
        console.log(userID + ' left connect!');
        $(".prev").trigger('click');
    });

    socket.on(userID + '-right', function (data) {
        console.log(userID + ' right connect!');
        $(".next").trigger('click');
    });

    socket.on(userID + '-refresh2', function (data) {
        console.log('refresh2');
    });
    //zoom *****
    socket.on(userID + '-zoom', function (data) {
    });
    
    socket.on(userID + '-find', function (data) {
        
    });
    exports.socket = socket;
})(window);

var theTemplateScript = $("#example-template").html();
var theTemplate = Handlebars.compile(theTemplateScript);
// limit an array to a maximum of elements (from the start)
Handlebars.registerHelper('limit', function (arr, limit) {
// remove this line if you don't want the lodash/underscore dependency
//  if (!_.isArray(arr)) { return []; }
    return arr.slice(0, limit);
});

Handlebars.registerHelper('log', function (sth) {
    console.log(sth)
});

Handlebars.registerHelper('eachProperty', function(context, options) {
    var ret = "";
    for(var prop in context) {
        ret = ret + options.fn({property:prop,value:context[prop]});
    }
    return ret;
});

$(function(){
    $('.next,.prev').click(function(ev){
        boolean = true;
//        $(this).addClass('test');
        event.target.id == "nextFoto" ?  boolean = true : false;
        Slide(boolean);
    });
//    returnData = getNews('http://www.hubanero.it/digitalmenu/backend/public/getmenu/1/1/');
    returnData = getNews('http://localhost:8000/articolo/getjson');
    
});
