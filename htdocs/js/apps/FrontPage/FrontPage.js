//require config
require.config({
    //baseUrl: "/webwork2_files/js/",
    paths: {
        "Backbone": "/webwork2_files/js/lib/webwork/components/backbone/Backbone",
        "backbone-validation":"/webwork2_files/js/lib/vendor/backbone-validation",
        "FileSaver": "/webwork2_files/js/lib/vendor/FileSaver",
        "BlobBuilder": "/webwork2_files/js/lib/vendor/BlobBuilder",
        "jquery-ui": "/webwork2_files/js/jquery-ui-1.9.0.custom/js/jquery-ui-1.9.0.custom.min",
        "WeBWorK-ui": "/webwork2_files/js/lib/webwork/WeBWorK-ui",
        "util":"/webwork2_files/js/lib/webwork/util",
        "underscore": "/webwork2_files/js/lib/webwork/components/underscore/underscore",
        "jquery": "/webwork2_files/js/lib/webwork/components/jquery/jquery",
        "EditableGrid":"/webwork2_files/js/lib/vendor/editablegrid-2.0.1/editablegrid",
        "bootstrap":"/webwork2_files/js/lib/vendor/bootstrap/js/bootstrap",
        //"jquery-ui": "../vendor/jquery/jquery-ui-1.8.16.custom.min",
        //"touch-pinch": "../vendor/jquery/jquery.ui.touch-punch",
        //"tabs": "../vendor/ui.tabs.closable",
        //this is important:
        "XDate":'/webwork2_files/js/lib/vendor/xdate',
        "config":"config"
    },
    //deps:['EditableGrid'],
    //callback:function(){console.log(EditableGrid)},
    urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 15,
    shim: {
        //ui specific shims:
        'jquery-ui': ['jquery'],

        //required shims
        'underscore': {
            exports: '_'
        },
        'Backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
        'backbone-validation':['Backbone'],
        
        'BlobBuilder': {
            exports: 'BlobBuilder'
        },

        "FileSaver":{
            exports: 'saveAs'
        },

        'XDate':{
            exports: 'XDate'
        },

        'bootstrap':['jquery']
        
    }
});

require(['Backbone', 
    'underscore',
    '../../lib/webwork/teacher/User', 
    '../../lib/webwork/teacher/ProblemSetList', 
    '../../lib/webwork/teacher/ProblemSetPathList',
    '../../lib/webwork/Problem',
    'FileSaver', 
    'BlobBuilder', 
    'EditableGrid', 
    '../../lib/webwork/views/WebPage',
    '../../lib/webwork/views/Closeable',
    '../../lib/webwork/views/Calendar/CalendarView',   
    'util', 
    'config', /*no exports*/, 
    'jquery-ui', 
    'bootstrap',
    'backbone-validation'], 
function(Backbone, _, User, ProblemSetList, ProblemSetPathList, Problem, saveAs, BlobBuilder, EditableGrid, WebPage, Closeable, CalendarView, util, config){

    var FrontPageCalenderView = WebPage.extend({
        tagName: "div",
        initialize: function(){
            WebPage.prototype.initialize.apply(this);
            _.bindAll(this, 'render');  // include all functions that need the this object
            var self = this;
            this.collection = new ProblemSetList();
            
            
            //this.render();
            
            
            this.collection.fetch();
            
            this.collection.on('fetchSuccess', function () {
                console.log("Yeah, downloaded successfully!");
                console.log(this.collection);
                this.render();
            }, this);
        },
        render: function(){
            this.calendarView = new CalendarView({collection: this.collection, view: "student"});
            $("#cal").html(this.calendarView.el);
        
            $(".calendar-day").droppable({  // This doesn't work right now.  
                hoverClass: "highlight-day",
                drop: function( event, ui ) {
                    App.dragging = true; 
                    //$(this).addClass("ui-state-highlight");
                    console.log( "Dropped on " + self.$el.attr("id"));
                }
            });    
                
            // Set the popover on the set name
            $("span.pop").popover({title: "Homework Set Details", placement: "top", offset: 10});
        },

    });

    var App = new FrontPageCalenderView({el: $("body")});
});