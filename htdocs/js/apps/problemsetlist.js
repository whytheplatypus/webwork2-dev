/*  problemsetlist.js:
   This is the base javascript code for the ProblemSetList.pm (Homework Editor3).  This sets up the View and ....
  
*/


$(function(){
    
    // get usernames and keys from hidden variables and set up webwork object:
    var myUser = document.getElementById("hidden_user").value;
    var mySessionKey = document.getElementById("hidden_key").value;
    var myCourseID = document.getElementById("hidden_courseID").value;
    // check to make sure that our credentials are available.
    if (myUser && mySessionKey && myCourseID) {
        webwork.requestObject.user = myUser;
        webwork.requestObject.session_key = mySessionKey;
        webwork.requestObject.courseID = myCourseID;
    } else {
        alert("missing hidden credentials: user "
            + myUser + " session_key " + mySessionKey
            + " courseID" + myCourseID, "alert-error");
    }

    var HomeworkEditorView = webwork.ui.WebPage.extend({
	tagName: "div",
        initialize: function(){
	    webwork.ui.WebPage.prototype.initialize.apply(this);
	    _.bindAll(this, 'render');  // include all functions that need the this object
	    var self = this;
            this.collection = new webwork.ProblemSetList();
            
            
            this.render();
            
            
            this.collection.fetch();
            
            this.collection.on('fetchSuccess', function () {
                console.log("Yeah, downloaded successfully!");
                console.log(this.collection);
                $("#left-column").html("<div style='font-size:110%; font-weight:bold'>Homework Sets</div><div id='probSetList' class='btn-group btn-group-vertical'></div>");
                this.collection.each(function (model) {
                    var setName =  model.get("set_id");
                    $("#probSetList").append("<div class='ps-drag btn' id='HW-" + setName + "'>" + setName + "</div>")
                    $("div#HW-" + setName ).click(function(evt) {
                        if (self.objectDragging) return;
                        $('#hwedTabs a[href="#details"]').tab('show');
                        self.showDetails($(evt.target).attr("id").split("HW-")[1]);
                        });
                    
                });
                $(".ps-drag").draggable({revert: "valid", start: function (event,ui) { self.objectDragging=true;},
                                        stop: function(event, ui) {self.objectDragging=false;}});
                
                
                self.setListView = new SetListView({collection: self.collection, el:$("div#list")});
                }, this);
        },
        render: function(){
	    var self = this; 
	    
	    // Create an announcement pane for successful messages.
	    
	    this.announce = new webwork.ui.Closeable({id: "announce-bar"});
	    this.announce.$el.addClass("alert-success");
	    this.$el.append(this.announce.el)
	    $("button.close",this.announce.el).click(function () {self.announce.close();}); // for some reason the event inside this.announce is not working  this is a hack.
            //this.announce.delegateEvents();
	    
   	    // Create an announcement pane for successful messages.
	    
	    this.errorPane = new webwork.ui.Closeable({id: "error-bar", classes: ["alert-error"]});
	    this.$el.append(this.errorPane.el)
	    $("button.close",this.errorPane.el).click(function () {self.errorPane.close();}); // for some reason the event inside this.announce is not working  this is a hack.
	    
	    
   	    this.helpPane = new webwork.ui.Closeable({display: "block",text: $("#homeworkEditorHelp").html(),id: "helpPane"});
	    this.$el.append(this.helpPane.el)
	    $("button.close",this.helpPane.el).click(function () {self.helpPane.close();}); // for some reason the event inside this.announce is not working  this is a hack.
            
            this.$el.append("<div class='row'><div id='left-column' class='span3'>Loading Homework Sets...<img src='/webwork2_files/images/ajax-loader-small.gif'></div><div id='tab-container' class='span9'></div></div>");
            
            $("#tab-container").append(_.template($("#tab-setup").html()));
            $('#hwedTabs a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
            
            
            this.calendarView = new CalendarView();
            $("#cal").append(this.calendarView.el);
            $("body").droppable();  // This helps in making drags return to their original place.
            
            new SettingsView({el: $("#settings")});

            
            
        },
        showDetails: function(setName)  {  // Show the details of the set with name: setName
            var self = this;
            var _model = self.collection.find(function(model) {return model.get("set_id")===setName;});
            this.detailView = new HWDetailView({model: _model, el: $("#details")});
        }
    });
    
    var HWDetailRowView = Backbone.View.extend({
        className: "set-detail-row",
        tagName: "tr",
        initialize: function () {
            _.bindAll(this,'render','edit');
            this.property = this.options.property;
            this.dateRE =/(\d\d\/\d\d\/\d\d\d\d)\sat\s((\d\d:\d\d)([apAP][mM])\s([a-zA-Z]{3}))/;
            this.render();
            return this;
        },
        render: function() {
            this.$el.html("<td>" + this.property + "</td><td id='value-col'> " + this.model.get(this.property) + "</td><td><button class='edit-button'>Edit</button>");
        }
        ,
        events: {
            "click .edit-button": "edit"
        },
        edit: function(evt){
            var value; 
            switch(this.property){
                case "set_header":
                case "hardcopy_header":
                    value = this.$("#value-col").html();
                    this.$("#value-col").html("<input type='text' size='20' id='edit-box'></input>");
                    this.$("input#edit-box").val(value);
                break;
                case "open_date":
                case "due_date":
                case "answer_date":

                    var dateParts = this.dateRE.exec(this.$("#value-col").html());
                    theDate = dateParts[1];
                    theTime = dateParts[2];
                    this.$("#value-col").html("<input type='text' size='20' id='edit-box'></input>");
                    this.$("input#edit-box").val(theDate);
                    this.$("input#edit-box").datepicker({showButtonPanel: true});
                    
                    break;
            
            }
        }
        });
    
    var HWProblemView = Backbone.View.extend({
        className: "set-detail-problem-view",
        tagName: "div",
        
        initialize: function () {
            _.bindAll(this,"render");
            var self = this;
            this.render();
            this.model.on('rendered', function () {
                self.$el.html(self.model.get("data"));
            })
        },
        render: function () {
            this.$el.html(this.model.get("path"));
            this.model.render();
        }
    
    
    });
    
    var HWDetailView = Backbone.View.extend({
        className: "set-detail-view",
        tagName: "div",
        initialize: function () {
            _.bindAll(this,'render');
            var self = this;
            this.render();
            this.problemPathList = new webwork.ProblemSetPathList();
            this.problemPathList.fetch(this.model.get("set_id"));
            this.problemPathList.on("fetchSuccess",function () {
                var hwDetailDiv = $("#hw-detail-problems");
                self.problemPathList.each(function(_problem){
                    var hwpv = new HWProblemView({model: new webwork.Problem({path: _problem.get("path")})});
                    hwDetailDiv.append(hwpv.el);
//                $("#hw-detail-problems").html((self.problemPathList.map(function(ProblemSet) {return ProblemSet.get("path");})).join(","));
                });
            
            });
            return this;
        },
        render: function () {
            var self = this;
            this.$el.html(_.template($("#HW-detail-template").html()))
            _(this.model.attributes).each(function(value,key) { $("#detail-table").append((new HWDetailRowView({model: self.model, property: key})).el)});
            return this;
        }
    });
    
    var SetListRowView = Backbone.View.extend({
        className: "set-list-row",
        tagName: "tr",
        initialize: function () {
            _.bindAll(this,'render');
            var self = this;
            this.render();
            return this;
        },
        render: function () {
            var self = this;
            this.$el.append((_(["set_id","open_date","due_date","answer_date"]).map(function(v) {return "<td>" + self.model.get(v) + "</td>";})).join(""));
        }
        });
    
    var SetListView = Backbone.View.extend({
        className: "set-list-view",
        initialize: function () {
            _.bindAll(this, 'render');  // include all functions that need the this object
            var self = this;
        
            this.render();
            return this;
        },
        render: function () {
            var self = this;
            this.$el.append("<table id='set-list-table' class='table table-bordered'><thead><tr><th>Name</th><th>Open Date</th><th>Due Date</th><th>Answer Date</th></tr></thead><tbody></tbody></table>");
            var tab = $("#set-list-table");
            this.collection.each(function(m){
                tab.append((new SetListRowView({model: m})).el);
            });
            
        }
    });

    var CalendarDayView = Backbone.View.extend({ // This displays a day in the Calendar
        tagName: "td",
        className: "calendar-day",
        initialize: function (){
            _.bindAll(this, 'render');  // include all functions that need the this object
	    var self = this;
            this.today = this.options.today; 
            this.render();
            return this;
        },
        render: function () {
            var self = this;
            var str = (this.model.getDate()==1)? this.model.toString("MMM dd") : this.model.toString("dd");
            this.$el.html(str);
            this.$el.attr("id","date-" + this.model.toString("yyyy-MM-dd"));
            if (this.today.getMonth()===this.model.getMonth()){this.$el.addClass("this-month");}
            if (this.today.diffDays(this.model)===0){this.$el.addClass("today");}
            this.$el.droppable({
                hoverClass: "highlight-day",
                drop: function( event, ui ) {
                    App.dragging = true; 
                    //$(this).addClass("ui-state-highlight");
                    console.log( "Dropped on " + self.$el.attr("id"));
                    }
                });
            return this;
        }
    });
      
      
    var CalendarRowView = Backbone.View.extend({  // This displays a row of the Calendar
        tagName: "tr",
        className: "calendar-row",
        initialize: function (){
            _.bindAll(this, 'render');  // include all functions that need the this object
	    if (this.options) {this.week=this.options.week; this.today = this.options.today;}
            this.render();
            return this; 
        },
        render: function () {
            var self = this;
            _(this.week).each(function(date) {
                var calendarDay = new CalendarDayView({model: date, today: self.today});
                self.$el.append(calendarDay.el);
            });
            return this;
            }
        });
    
    var CalendarView = Backbone.View.extend({
        tagName: "table",
        className: "calendar",
        initialize: function (){
            _.bindAll(this, 'render');  // include all functions that need the this object
	    var self = this;
            var theDate = this.date;; 
            if (this.options.date) {theDate = this.options.date;}
            if (! theDate) { theDate = new XDate();}
            this.date = new XDate(theDate.getFullYear(),theDate.getMonth(),theDate.getDate());  // For the calendar, ignore the time part of the date object.
            
            this.render();
            return this;
            
        },
        render: function () {
            // The collection is a array of rows containing the day of the current month.
            
            
            var firstOfMonth = new XDate(this.date.getFullYear(),this.date.getMonth(),1);
            var firstWeekOfMonth = firstOfMonth.clone().addDays(-1*firstOfMonth.getDay());
            
            this.$el.html(_.template($("#calendarHeader").html()));
                        
            for(var i = 0; i<6; i++){ var theWeek = [];
                for(var j = 0; j < 7; j++){
                 theWeek.push(firstWeekOfMonth.clone().addDays(j+7*i));
                }
                var calendarWeek = new CalendarRowView({week: theWeek,today: this.date});
                this.$el.append(calendarWeek.el);                
            }
            return this;   
        }
    });
    
    var SettingsRowView = Backbone.View.extend({
        tagName: "tr",
        initialize: function () {
            _.bindAll(this, 'render','editRow');  // include all functions that need the this object
            this.render();
        },
        render: function () {
            this.$el.html("<td class='srv-name'> " + this.model.get("name") + "</td><td class='srv-value'> " + this.model.get("value") + "</td>");
            return this;
            
        },
        events: {"click .srv-value": "editRow"},
        editRow: function () {
            var tableCell = this.$(".srv-value");
            var value = tableCell.html();
            tableCell.html("<input class='srv-edit-box' size='20' type='text'></input>");
            var inputBox = this.$(".srv-edit-box");
            inputBox.val(value);
            inputBox.click(function (event) {event.stopPropagation();});
            this.$(".srv-edit-box").focusout(function() {
                tableCell.html(inputBox.val());
                model.set("value",inputBox.val());  // should validate here as well.  
                
                // need to also set the property on the server or 
                });
        }
        
        
        });
    
    var SettingsView = Backbone.View.extend({
        className: "settings-view",
        initialize: function () {
            _.bindAll(this, 'render');  // include all functions that need the this object
            this.render();
        },
        render: function () {
            this.$el.html("<table class='table bordered-table'><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody></tbody></table>");
            var tab = this.$("table");
            webwork.HomeworkEditor.settings.each(function(setting){ tab.append((new SettingsRowView({model: setting})).el)});
            
        }
        });
    
    var App = new HomeworkEditorView({el: $("div#mainDiv")});
});

webwork.Property = Backbone.Model.extend({
    defaults: {
        name: "",
        internal_name: "",
        value: 0,
        unit: ""
    }
    });

// Perhaps there is a better way to do this in order to validate the properties. 

webwork.PropertyList = Backbone.Collection.extend({ model: webwork.Property});

webwork.HomeworkEditor = {settings: new webwork.PropertyList([
        new webwork.Property({name: "Time the Assignment is Due", internal_name: "time_assign_due", value: "11:59PM"}),
        new webwork.Property({name: "When does the Assignment Open", internal_name: "assign_open_prior_to_due", value: "1 week"}),
        new webwork.Property({name: "When do the Answers Open", internal_name: "answers_open_after_due", value: "2 days"}),
        new webwork.Property({name: "Assignments have Reduced Credit", internal_name: "reduced_credit", value: true}),
        new webwork.Property({name: "Amount of time for reduced Credit", internal_name: "reduced_credit_time", value: "3 days"}),
                                                              ])};