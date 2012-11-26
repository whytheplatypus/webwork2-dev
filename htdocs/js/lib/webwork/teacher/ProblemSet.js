/*
 * The core model for a ProblemSet in config. 
 *
 * */
define(['Backbone', 'underscore','config','XDate'], function(Backbone, _, config,XDate){


    var ProblemSet = Backbone.Model.extend({
        defaults:{
            set_id: "",
            set_header: "",
            hardcopy_header: "",
            open_date: "",
            due_date: "",
            answer_date: "",
            visible: 0,
            enable_reduced_scoring: 0,
            assignment_type: "",
            attempts_per_version: -1,
            time_interval: 0,
            versions_per_interval: 0,
            version_time_limit: 0,
            version_creation_time: 0,
            problem_randorder: 0,
            version_last_attempt_time: 0,
            problems_per_page: 1,
            hide_score: "N",
            hide_score_by_problem: "N",
            hide_work: "N",
            time_limit_cap: "0",
            restrict_ip: "No",
            relax_restrict_ip: "No",
            restricted_login_proctor: "No",
            visible_to_students: "Yes",

        },
        initialize: function(){
            this.on('change',this.update);
        _.extend(Backbone.Validation.patterns, { "wwdate": /(\d?\d\/\d?\d\/\d{4})\sat\s(\d?\d:\d\d[aApP][mM])\s\w{3}/}); 
        _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);          

        },
        validation: {
            open_date: {pattern: "wwdate"},
            due_date: {pattern: "wwdate"},
            answer_date: {pattern: "wwdate"}
        },
        descriptions:  {
            set_id: "Homework Set Name",
            set_header: "Header File for Homework Set",
            hardcopy_header: "Header File for A Hardcopy of the Homework Set",
            open_date: "Date and Time that the Homework Set opens",
            due_date: "Date and Time that the Homework Set is due",
            answer_date: "Date and time that the answers are made available",
            visible: "Visible to Students",
            enable_reduced_scoring: "Is reduced scoring available?",
            assignment_type: "Type of the Assignment",
            attempts_per_version: "Number of Attempts Per Version",
            time_interval: "Time Interval for something???",
            versions_per_interval: "Versions per Interval ???",
            version_time_limit: "Version Time Limit",
            version_creation_time: "Version Creation Time",
            problem_randorder: "View Problems in a Random Order",
            version_last_attempt_time: "Version last attempt time????",
            problems_per_page: "Number of Problems Per Page",
            hide_score: "Hide the Score to the Student",
            hide_score_by_problem: "Hide the Score by Problem?",
            hide_work: "Hide the Work?",
            time_limit_cap: "Time Limit Cap???",
            restrict_ip: "Restrict by IP Address???",
            relax_restrict_ip: "Relax Restrict IP???",
            restricted_login_proctor: "Restricted to Login Proctor",
            visible_to_students: "Visible to Students?",
        },
        types: {
            set_id: "string",
            set_header: "filepath",
            hardcopy_header: "filepath",
            open_date: "datetime",
            due_date: "datetime",
            answer_date: "datetime",
            visible: "opt('yes','no')",
            enable_reduced_scoring: "opt('yes','no')",
            assignment_type: "opt('homework','gateway/quiz','proctored gateway/quiz')",
            attempts_per_version: "int(0+)",
            time_interval: "time(0+)",
            versions_per_interval: "int(0+)",
            version_time_limit: "time(0+)",
            version_creation_time: "time(0+)",
            problem_randorder: "opt('yes','no')",
            version_last_attempt_time: "time(0+)",
            problems_per_page: "int(1+)",
            hide_score: "opt('yes','no')",
            hide_score_by_problem: "opt('yes','no')",
            hide_work: "opt('yes','no')",
            time_limit_cap: "opt('yes','no')",
            restrict_ip: "opt('yes','no')",
            relax_restrict_ip: "opt('yes','no')",
            restricted_login_proctor: "opt('yes','no')",
            visible_to_students: "opt('yes','no')",
        },
        update: function(){
            
            console.log("in config.ProblemSet update");
            var self = this;
            var requestObject = {
                "xml_command": 'updateSetProperties'
            };
            _.extend(requestObject, this.attributes);
            _.defaults(requestObject, config.requestObject);

            $.post(config.webserviceURL, requestObject, function(data){
                console.log(data);
                var response = $.parseJSON(data);
                
    	    self.trigger("success","problem_set_changed",self)
            });
        },
        fetch: function()
        {
            var self=this;
            var requestObject = { xml_command: "getSet"};
            _.extend(requestObject, this.attributes);
            _.defaults(requestObject, config.requestObject);

            $.get(config.webserviceURL, requestObject,
                function (data) {

                    var response = $.parseJSON(data);
                    console.log(response);
                    _.extend(self.attributes,response.result_data);
                });       
        },

        /* This returns a boolean if the current hw set is open.  The date can be passed in either as a native 
        * Date object, XDate object or webwork date object. The parameter reducedCredit is the number of mins of reduced 
        * credit time available. 
        */
        isDueOn: function (_date,reducedCredit){
            var date = new XDate(_date);
            var dueDate = new XDate(this.get("due_date"));
            var reducedDate = new XDate(dueDate.getTime()-1000*60*reducedCredit);
            return ((date.getMonth()===reducedDate.getMonth()) && (date.getDate()===reducedDate.getDate()) && (date.getFullYear() ===reducedDate.getFullYear()));
        },
        isOpen: function (_date,reducedCredit){
            var date = new XDate(_date);
            var openDate = new XDate(this.get("open_date"));
            var dueDate = new XDate(this.get("due_date"));
            var reducedDate = new XDate(dueDate.getTime()-1000*60*reducedCredit);
            return ((date >openDate) && (date < reducedDate));

        },
        isInReducedCredit: function (_date,reducedCredit){
            var date = new XDate(_date);
            var openDate = new XDate(this.get("open_date"));
            var dueDate = new XDate(this.get("due_date"));
            var reducedDate = new XDate(dueDate.getTime()-1000*60*reducedCredit);
            return ((date >reducedDate) && (date < dueDate));

        },
        overlaps: function (_set){
            var openDate1 = new XDate(this.get("open_date"));
            var dueDate1 = new XDate(this.get("due_date"));
            var openDate2 = new XDate(_set.get("open_date"));
            var dueDate2 = new XDate(_set.get("due_date"));
            return (openDate1<openDate2)?(dueDate1>openDate2):(dueDate2>openDate1);
        },
        countSetUsers: function ()
        {
            var self=this;
            var requestObject = { xml_command: "listSetUsers"};
            _.extend(requestObject, this.attributes);
            _.defaults(requestObject, config.requestObject);

            $.get(config.webserviceURL, requestObject, function (data) {

                    var response = $.parseJSON(data);
                    console.log(response);
                    
                    self.trigger("countUsers",response.result_data);

                });        
        }

    });
     


    return ProblemSet;
});
    
    