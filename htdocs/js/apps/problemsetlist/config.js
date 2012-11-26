define([], function(){
    var config = {
        requestObject: {
            "xml_command":"listLib",
            "pw":"",
            "password":"nothing",
            "session_key":document.getElementById("hidden_key").value,
            "user":document.getElementById("hidden_user").value,
            "library_name":"Library",
            "courseID":document.getElementById("hidden_courseID").value,
            "set":"set0",
            "new_set_name":"new set",
            "command":"buildtree"
        },
        webserviceURL: "/webwork2/instructorXMLHandler"
    };
    // Note: these are in the order given in the classlist format for LST files.  
    
 /*   config.userProps = [{shortName: "student_id", longName: "Student ID", regexp: "student"},
                         {shortName: "last_name", longName: "Last Name", regexp: "last"},
                         {shortName: "first_name", longName: "First Name", regexp: "first"},
                         {shortName: "status", longName: "Status", regexp: "status"},
                         {shortName: "comment", longName: "Comment", regexp: "comment"},
                         {shortName: "section", longName: "Section", regexp: "section" },
                         {shortName: "recitation", longName: "Recitation", regexp: "recitation"},
                         {shortName: "email_address", longName: "Email", regexp: "email"},
                         {shortName: "user_id", longName: "Login Name", regexp: "login"},
                         {shortName: "userpassword", longName: "Password", regexp: "pass"},
                         {shortName: "permission", longName: "Permission Level", regexp: "permission"}
                         ];
    
    config.userTableHeaders = [
                    { name: "Select", datatype: "boolean", editable: true},
            { name: "Action", datatype: "string", editable: true,
                        values: {"action1":"Change Password",
                            "action2":"Delete User","action3":"Act as User",
                            "action4":"Student Progess","action5":"Email Student"}
                    },
                    { label: "Login Name", name: "user_id", datatype: "string", editable: false },
                    { label: "Assigned Sets", name: "num_user_sets", datatype: "string", editable: false },
                    { label: "First Name", name: "first_name", datatype: "string", editable: true },
                    { label: "Last Name", name:"last_name", datatype: "string", editable: true },
                    { label: "Email", name: "email_address", datatype: "string", editable: true },
                    { label: "Student ID", name: "student_id", datatype: "string", editable: true },
                    { label: "Status", name: "status", datatype: "string", editable: true,
                        values : {
                            "en":"Enrolled",
                            "noten":"Not Enrolled"
                        }
                    },
                    { label: "Section", name: "section", datatype: "integer", editable: true },
                    { label: "Recitation", name: "recitation", datatype: "integer", editable: true },
                    { label: "Comment", name: "comment", datatype: "string", editable: true },
                    { label: "Permission", name: "permission", datatype: "integer", editable: true,
                        values : {
                            "-5":"guest","0":"Student","2":"login proctor",
                            "3":"grade proctor","5":"T.A.", "10": "Professor",
                            "20":"Admininistrator"
                }
            }
            
                ]; */
    return config;
});