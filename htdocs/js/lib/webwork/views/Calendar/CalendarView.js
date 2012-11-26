define(['Backbone', 'underscore', 'XDate', './CalendarRowView'], function(Backbone, _, XDate, CalendarRowView) {
	CalendarView = Backbone.View.extend({
        tagName: "div",
        className: "calendar",
        initialize: function (){
            _.bindAll(this, 'render','updateAssignments');  // include all functions that need the this object
    	    var self = this;
            
            /* Clean this up.  what is the difference between theDate and this.options.date
            *  probably _.extend(this,this.options) will suffice.
            */

            var theDate = this.date;


            this.parent = this.options.parent; 
            this.collection = this.parent.collection;
            if (this.options.date) {theDate = this.options.date;}
            this.viewType = (this.options.viewType)? (this.options.viewType): "month";  // viewType is either "month" or "week"
            

            if (! theDate) { theDate = new XDate();}
            this.date = new XDate(theDate.getFullYear(),theDate.getMonth(),theDate.getDate());  // For the calendar, ignore the time part of the date object.
            
            var firstOfMonth = new XDate(this.date.getFullYear(),this.date.getMonth(),1);

            if (this.viewType === "month"){
               this.firstDayOfCalendar = firstOfMonth.clone().addDays(-1*firstOfMonth.getDay());  
            } else {
                this.firstDayOfCalendar = this.date.clone().addDays(-1*this.date.getDay());
            }


            this.updateAssignments();

            this.render();
            return this;


        },               // This needs to determine the visual bars on the calendar. 
        updateAssignments: function() 
        {
 
            var sets = this.collection.sortBy(function (_set) { return new XDate(_set.get("open_date"))});
//            console.log(sets.map(function(_set) {return _set.get("set_id")}));


            var n = 0; 
            var slot = [];
            slot[0]=[];
            while (sets.length>0){
                var s = sets.pop();
                var k = 0; 
                var foundSlot = false; 
                while(slot[k].length > 0){
                    if (!(_(slot[k]).any(function (_set) { return s.overlaps(_set)}))) {
                        foundSlot = true;
                        slot[k].push(s);
                        break;
                    } 
                    k++;
                }
                if (!foundSlot){
                   slot[k].push(s);
                   slot[k+1] = [];
                    n++;
                }
                /*_(slot).each(function(set,i){
                    console.log(i + " " + _(set).map(function(s){return s.get("set_id")}));
                }); */

            }    
            slot.pop();  // there's always an empty array at the end. 

            this.timeSlot = slot;

            
        },
        render: function () {
            var self = this;
            // The collection is a array of rows containing the day of the current month.
            
           this.$el.html(_.template($("#calendarButtons").html()));
            this.$el.append("<table id='calendar-table' class='table-bordered'></table>")
            var calendarTable = this.$('#calendar-table');
            calendarTable.append(_.template($("#calendarHeader").html()));
                        
            if (this.viewType === "month"){            
                for(var i = 0; i<6; i++){ var theWeek = [];
                    for(var j = 0; j < 7; j++){
                     theWeek.push(this.firstDayOfCalendar.clone().addDays(j+7*i));
                    }
                    var calendarWeek = new CalendarRowView({week: theWeek, calendar: this});
                    calendarTable.append(calendarWeek.el);                
                }
            } else {
                var theWeek = [];

                for(var j = 0; j < 7; j++){
                    theWeek.push(this.firstDayOfCalendar.clone().addDays(j));
                }
                var calendarWeek = new CalendarRowView({week: theWeek, calendar: this});
                calendarTable.append(calendarWeek.el);                
            }

                    // The following adds buttons for the go ahead and back by two weeks.  

        
        this.$el.append(calendarTable.el);
        this.$el.append(_.template($("#calendarButtons").html()));
        $(".previous-week").on("click", function () {
            self.date.addDays(-7); 
            self.firstDayOfCalendar.addDays(-7); 
            self.update();
        });

        $(".next-week").on("click", function () {
            self.date.addDays(7); 
            self.firstDayOfCalendar.addDays(7); 
            self.update();
        });

        $(".view-week").on("click",function() {
            self.viewType = "week";
            self.update(); 
        });
        $(".view-month").on("click",function() {
            self.viewType = "month";
            self.update(); 
        });


            return this;   
        },
        update: function ()
        {
            console.log(this.date);
            //this.updateAssignments();
            this.render();
             this.parent.dispatcher.trigger("calendar-change");
           
        }

    });
	return CalendarView;
});