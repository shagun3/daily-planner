$(document).ready(function() {
    let tasks = JSON.parse(localStorage.getItem("tasks")); 
    
    function sortGeneral(a, b) {
        return (a < b) ? -1 : (a > b) ? 1 : 0;
    }
    
    function displayTasks() {
        let tasks = JSON.parse(localStorage.getItem("tasks"));
        if (tasks !== null) {
            
            tasks.sort((a,b) => {
                let aDateClean = a.taskDate.replace(/-/g, "");
                let bDateClean = b.taskDate.replace(/-/g, "");
                let aDate = parseInt(aDateClean);
                let bDate = parseInt(bDateClean);
                let aTimeClean = a.taskTime.replace(/:/g, "");
                let bTimeClean = b.taskTime.replace(/:/g, "");
                let aTime = parseInt(aTimeClean);
                let bTime = parseInt(bTimeClean);
                let aPriority = (a.taskPriority === "low") ? 3 : (a.taskPriority === "normal") ? 2 : 1;
                let bPriority = (b.taskPriority === "low") ? 3 : (b.taskPriority === "normal") ? 2 : 1;
                let aName = a.task.toLowerCase();
                let bName = b.task.toLowerCase();
                return sortGeneral(aDate, bDate) || sortGeneral(aTime, bTime) || sortGeneral(aPriority, bPriority) || sortGeneral(aName, bName);
            });
             
            /* ALTERNATIVE TO SORTING (a bit more messy):
            tasks.sort((a,b) => {
                let aDateClean = a.taskDate.replace(/-/g, "");
                let bDateClean = b.taskDate.replace(/-/g, "");
                let aDate = parseInt(aDateClean);
                let bDate = parseInt(bDateClean);
                let aTimeClean = a.taskTime.replace(/:/g, "");
                let bTimeClean = b.taskTime.replace(/:/g, "");
                let aTime = parseInt(aTimeClean);
                let bTime = parseInt(bTimeClean);
                let aName = a.task.toLowerCase();
                let bName = b.task.toLowerCase();
                if (aDate === bDate) {
                    if (aTime < bTime) return -1; 
                    if (aTime > bTime) return 1;
                    if (aTime === bTime) {
                        return (aName < bName) ? -1 : (aName > bName) ? 1 : 0;
                    }
                }
                return aDate - bDate;
            });  */
             
            $.each(tasks, function(index, elem) {
                $(".table").append(`<tr>
                                       <td>${elem.task} </td>
                                       <td>${elem.taskPriority} </td>
                                       <td>${elem.taskDate} </td>
                                       <td>${elem.taskTime} </td>
                                       <td><a class="edit-link" href="edit.html?id=${elem.id}">Edit</a> / <a id="remove" href="#remove"> Remove</a></td>
                                       </tr>`);
            });   
        }
    }
    
    function addTask(event) {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        (month < 10) ? month = "0" + month : month;
        let day = date.getDate();
        let hour = date.getHours();
        let minutes = date.getMinutes();
        let id = date.getTime();
        let dateNow = parseInt(String(year) + month + day);
        (minutes < 10) ? minutes = "0" + minutes : minutes;
        let timeNow = String(hour) + minutes;        
        
        let task = $("#task").val().trim();
        let taskPriority = $("#priority").val();
        let taskDate = $("#date").val(); //"2018-03-20"
        let dateCleaned = taskDate.replace(/-/g, "");
        let dateSet = parseInt(dateCleaned);
        let taskTime = $("#time").val(); // "01:00" / "13:00" 
        let timeCleaned = taskTime.split(":").join("");
        let timeSet = parseInt(timeCleaned);

        if ( !task ) {
            event.preventDefault();
            alert("Please insert a valid task!");  
        } else if (dateSet < dateNow) {
            event.preventDefault();
            alert("Your task date is messed up!");
        } else if (dateSet === dateNow && timeSet < timeNow) {
            event.preventDefault();
            alert("Your task time is messed up!");
        } else  {
            tasks = tasks || [] ; 
            let newTask = {
                id,
                task,
                taskPriority,
                taskDate,
                taskTime 
            };
            
            tasks.push(newTask);
            localStorage.setItem("tasks", JSON.stringify(tasks));
        } 
    }
    
    function changeTask(event) {
        let formerTaskId = $("#taskId").val();
        for (let i = 0; i < tasks.length; ++i) {
            if (tasks[i].id == formerTaskId) {
                tasks.splice(i, 1);
                break;
            }
        }
        addTask(event); 
    }
    
    function removeTask(id) {
        if (confirm("Are you sure you want to delete this task?")) {
            for (let i = 0; i < tasks.length; ++i) {
                if (tasks[i].id == id) {
                    tasks.splice(i, 1);
                    break;
                }
            }
            localStorage.setItem("tasks", JSON.stringify(tasks));
            window.location.reload();
        }
    }
    
    displayTasks();
    
    $("#task-form").submit(function(event) {
        addTask(event);
    });
    
    $("#task-form-edit").submit(function() {
        changeTask(event);
    });
    
    $(".disabled").click(function(event) {
        event.preventDefault();
    });
    
    $(document).on("click", "table tr", function() {
        let $targetName = $(event.target).prop("tagName"); 
        let $editElem = $(event.target).parent();
        if ( $targetName !== "A" && $targetName !== "TH" && $editElem.prop("tagName") === "TR") {
            $editElem.toggleClass("bg-warning");
            $("a.edit").toggleClass("disabled");
            
            $(".edit").click(function() {
                let tdHref = $editElem.children().eq(4);
                let idOnClick = tdHref.html().replace(/^<.*id=([\d]+).*/, "$1");
                localStorage.setItem("idToEdit", idOnClick);
                window.location.href = "edit.html";
                console.log("menu clicked");
            });
            
            //remove highlight if clicked outside of current item selected for edit
            $(document).click(function(event) {
                let $target = $(event.target).parent();
                if (! $target.is($editElem) && $editElem.hasClass("bg-warning")) {
                    $editElem.toggleClass("bg-warning");
                    $("a.edit").toggleClass("disabled");
                }
            });
        }
    });
    
    $(document).on("click", "#remove", function() {
        let idToDel = $(event.target).parent().html().replace(/^<.*id=([\d]+).*/, "$1");
        removeTask(idToDel);
    });
    
    $(".clearAll").click( function() {
        if(confirm("Are you sure you want to delete all tasks? This action cannot be undone!")) {
            localStorage.removeItem("tasks");
            localStorage.removeItem("idToEdit");
            window.location.reload();
        }   
    });
});
    
    function getQueryParam(name) {
           let wholeQuery = window.location.search.substring(1);
           let allParams = wholeQuery.split("&");
           for (let i = 0; i < allParams.length; ++i) {
                let query = allParams[i].split("=");
                if(query[0] == name){ 
                    return query[1];
                }
           }
    }
        
    function getTask() {
        let idOnClick =  localStorage.getItem("idToEdit");
        let idToEdit = getQueryParam("id") || idOnClick;
        console.log(idToEdit);
        let allTasks = JSON.parse(localStorage.getItem("tasks"));
        for (let i = 0; i < allTasks.length; ++i) {
            if (allTasks[i].id == idToEdit) { //== used because idToEdit is of type STRING, unlike id from tasks which is number!!!
                $("#task-form-edit #task").val(allTasks[i].task);
                $("#task-form-edit #priority").val(allTasks[i].taskPriority);
                $("#task-form-edit #date").val(allTasks[i].taskDate);
                $("#task-form-edit #time").val(allTasks[i].taskTime);
                $("#task-form-edit #taskId").val(idToEdit);
                break;
            }
        }     
    };
    
    if (window.location.href.indexOf("edit") > -1) {
        getTask();
    }
    