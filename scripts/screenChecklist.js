function screenChecklist(/*oChecklist*/ checklistToEdit,
                         /*screenMain*/ screenMainInstancePass)
{
    var screenChecklistThis = this;
    var sDOMTaskClicked = "";
    var arrTaskFocused = [];
    var taskToEdit = null;
    var sDOMActiveTask = "";
    
    var iSubTaskIndent = 20;
    
    function clearEventListeners()
    {
        $(document).unbind('keypress');
        blackberry.app.event.onSwipeDown(null);
    }; // end clearEventListeners()
    
    function newTask(iDefaultOrder, bSubTask)
    {
        $('#divScreenChecklist').remove();
        clearEventListeners();                    
        
        // add new oTask object to current oChecklist
        var taskNew = new oTask();
        taskNew.iTaskID = iNextTaskID;
        iNextTaskID++;
        taskNew.iOrder = iDefaultOrder;
        
        // check if editing an existing Task or creating a new one        
        if (taskToEdit != null)
        {
            if (bSubTask == true)
            {
                taskNew.iParentTaskID = taskToEdit.iTaskID;                
                taskToEdit.arrSubTasks.push(taskNew);
            } // end if
            else
            {
                taskNew.iParentTaskID = taskToEdit.iParentTaskID;
                var arrTreeLevelMovement = findArrTreeLevel(checklistToEdit.arrTasks, taskToEdit);
                arrTreeLevelMovement.push(taskNew);
            }; // end else
        } // end if
        else
        {
            checklistToEdit.arrTasks.push(taskNew);
        }; // end else
        
        // add new oTask to database
        dbChecklistOpen.addTask(checklistToEdit, taskNew);
        
        // display screenTask
        var screenTaskNew = new screenTask(taskNew, screenChecklistThis, checklistToEdit);
        
        screenTaskNew.displayScreen();
        screenTaskNew.startEventListeners();
    }; // end newTask()
    
    function sortTasks()
    {
        function sortSubTasks(taskToSort)
        {
            taskToSort.arrSubTasks.sort(function (taskA, taskB)
                {
                    return taskA.iOrder - taskB.iOrder;
                })
            
            // update iPrevTaskID and iNextTaskID as these pointers may need to be updated because the Task order
            // may now be completely different than before
            if (taskToSort.arrSubTasks.length > 0)
            {
                taskToSort.arrSubTasks[0].iPrevTaskID = -1;
                taskToSort.arrSubTasks[taskToSort.arrSubTasks.length - 1].iNextTaskID = -1;
            }; // end if
            if (taskToSort.arrSubTasks.length > 1)
            {
                for (var i = 0; i < (taskToSort.arrSubTasks.length - 1); i++)
                {
                    taskToSort.arrSubTasks[i].iNextTaskID = taskToSort.arrSubTasks[i+1].iTaskID;
                }; // end for
                for (var i = 1; i < taskToSort.arrSubTasks.length; i++)
                {
                    taskToSort.arrSubTasks[i].iPrevTaskID = taskToSort.arrSubTasks[i-1].iTaskID;
                }; // end for
            }; // end if
            
            for (var i = 0; i < taskToSort.arrSubTasks.length; i++)
            {
                if (taskToSort.arrSubTasks[i].arrSubTasks.length > 0)
                {
                    sortSubTasks(taskToSort.arrSubTasks[i]);
                }; // end if
            }; // end for
        }; // end sortSubTasks()
        
        checklistToEdit.arrTasks.sort(function(taskA, taskB)
            {
                return taskA.iOrder - taskB.iOrder;
            });
        // update iPrevTaskID and iNextTaskID as these pointers may need to be updated because the Task order
        // may now be completely different than before
        if (checklistToEdit.arrTasks.length > 0)
        {
            checklistToEdit.arrTasks[0].iPrevTaskID = -1;
            checklistToEdit.arrTasks[checklistToEdit.arrTasks.length-1].iNextTaskID = -1;
        }; // end if
        if (checklistToEdit.arrTasks.length > 1)
        {
            for (var i = 0; i < (checklistToEdit.arrTasks.length - 1); i++)
                {
                    checklistToEdit.arrTasks[i].iNextTaskID = checklistToEdit.arrTasks[i+1].iTaskID;
                }; // end for
            for (var i = 1; i < checklistToEdit.arrTasks.length; i++)
                {
                    checklistToEdit.arrTasks[i].iPrevTaskID = checklistToEdit.arrTasks[i-1].iTaskID;
                }; // end for
        }; // end if
        
        // sort subTasks
        for (var i = 0; i < checklistToEdit.arrTasks.length; i++)
        {
            if (checklistToEdit.arrTasks[i].arrSubTasks.length > 0)
            {
                sortSubTasks(checklistToEdit.arrTasks[i]);
            }; // end if
        }; // end for

    }; // end sortTasks()
    
    this.displayScreen = function(taskActive)
    {
        sDOMActiveTask = "";
        
        function displaySubTasks(arrSubTasksPass, arrIndexPass)
        {
            var subtaskChecklistHTML = "";
            var sIndexHeader = "" + arrIndexPass[0];
            
            for (var j = 1; j < arrIndexPass.length; j++)
            {
                sIndexHeader += "_" + arrIndexPass[j];
            }; // end for
            
            for (var i = 0; i < arrSubTasksPass.length; i++)
            {
                // draw each subTask
                subtaskChecklistHTML += "<div id='divTask" + sIndexHeader + "_" + i + "' class='divTask' style='padding-left:" + iSubTaskIndent + "px'>";
                subtaskChecklistHTML += "<button id='buttonCheck" + sIndexHeader + "_" + i + "' class='buttonCheck'></button>" +
                                        "<button class='buttonTask' id='buttonTask" + sIndexHeader + "_" + i + "'";
                var dCurrent = new Date();
                if ((arrSubTasksPass[i].getDueDate() > 0) &&
                    (arrSubTasksPass[i].dCompleted.getTime() == 0))
                {
                    if (arrSubTasksPass[i].getDueDate() > dCurrent.getTime())
                    {
                        subtaskChecklistHTML += "style='background-color:#99FF99'";
                    }; // end if
                    if ((arrSubTasksPass[i].getDueDate() < dCurrent.getTime()) &&
                        (arrSubTasksPass[i].getDueDate+24*60*60*1000 > dCurrent.getTime()))
                    {
                        subtaskChecklistHTML += "style='background-color:#FFFF99'";
                    }; // end if
                    if ((arrSubTasksPass[i].getDueDate()+24*60*60*1000) < dCurrent.getTime())
                    {
                        subtaskChecklistHTML += "style='background-color:#FF9999'";
                    }; // end if
                }; // end if                                 
                subtaskChecklistHTML += ">" + arrSubTasksPass[i].iOrder + " : " + arrSubTasksPass[i].sDescription +
                                        "</button><br>";
                                        
                // check if there is an active Task
                if (!(taskActive === undefined))
                {
                    // check if the active Task matches the Task currently being drawn
                    if (taskActive.iTaskID == arrSubTasksPass[i].iTaskID)
                    {
                        sDOMActiveTask = "#buttonTask" + sIndexHeader + "_" + i;
                    }; // end if
                }; // end if
                                        
                // draw sub-tasks, if any
                if (arrSubTasksPass[i].arrSubTasks.length > 0)
                {
                    var arrIndexPassNext = arrIndexPass.slice(0);
                    arrIndexPassNext.push(i);
                    subtaskChecklistHTML += displaySubTasks(arrSubTasksPass[i].arrSubTasks, arrIndexPassNext);
                }; // end if
                subtaskChecklistHTML += "</div>";
            }; // end for
            
            return subtaskChecklistHTML;
        }; // end displaySubTasks()
        
        sortTasks();
        
        $('#divScreenChecklist').remove();
        $('#divDisplay').append("<div id='divScreenChecklist'></div>");
        
        var screenChecklistHTML =
        "<div>" +
            "<label id='labelDescription' class='label'>Checklist Description</label>" +
            "<button id='buttonBack' style='position:fixed; right:5px; top:5px; z-index:10'>Back</button><br>" +
            "<textarea id='fieldDescription' style='width:85%;height:1.25em' x-blackberry-initialFocus='true'></textarea>" +
        "</div>" +
        "<div id='treefieldChecklist'>" +        
        "</div>";
        $('#divScreenChecklist').html(screenChecklistHTML);
        
        // draw treefieldChecklist
        var treefieldChecklistHTML = "";
        for (var i = 0; i < checklistToEdit.arrTasks.length; i++)
        {
            // draw each task
            treefieldChecklistHTML += "<div id='divTask" + i + "' class='divTask'>";
            treefieldChecklistHTML += "<button id=\'buttonCheck" + i + "\' class='buttonCheck'></button>" +
                                      "<button class='buttonTask' id='buttonTask" + i + "'";
            var dCurrent = new Date();
            if ((checklistToEdit.arrTasks[i].getDueDate() > 0) &&
                (checklistToEdit.arrTasks[i].dCompleted.getTime() == 0))
            {
                if (checklistToEdit.arrTasks[i].getDueDate() > dCurrent.getTime())
                {
                    treefieldChecklistHTML += " style='background-color:#99FF99'";
                }; // end if
                if ((checklistToEdit.arrTasks[i].getDueDate() < dCurrent.getTime()) &&
                    (checklistToEdit.arrTasks[i].getDueDate()+24*60*60*1000) > dCurrent.getTime())
                {
                    treefieldChecklistHTML += " style='background-color:#FFFF99'";
                }; // end if
                if ((checklistToEdit.arrTasks[i].getDueDate()+24*60*60*1000) < dCurrent.getTime())           
                {
                    treefieldChecklistHTML += " style='background-color:#FF9999'";
                }; // end if
            }; // end if
                
            treefieldChecklistHTML += ">" + checklistToEdit.arrTasks[i].iOrder + " : " + checklistToEdit.arrTasks[i].sDescription +
                                      "</button><br>";
            // check if there is an active Task
            if (!(taskActive === undefined))
            {
                // check if the active Task matches the Task currently being drawn
                if (taskActive.iTaskID == checklistToEdit.arrTasks[i].iTaskID)
                {
                    sDOMActiveTask = "#buttonTask" + i;
                }; // end if
            }; // end if
            
            // draw sub-tasks
            if (checklistToEdit.arrTasks[i].arrSubTasks.length > 0)
            {
                var arrIndexStart = [];
                arrIndexStart.push(i);
                treefieldChecklistHTML += displaySubTasks(checklistToEdit.arrTasks[i].arrSubTasks, arrIndexStart);
            }; // end if
            treefieldChecklistHTML += "</div>";
        }; // end for
        treefieldChecklistHTML += "<button id='buttonCheck" + i + "\' class='buttonCheck'></button>" +
                                      "<button class='buttonTaskNew' id='buttonTaskNew'>** new task **</button>" +
                                      "<br>";
        treefieldChecklistHTML += "<hr/><ul>";
        
        // draw Archive
        checklistToEdit.arrArchive.sort(function(archiveA, archiveB)
        {
            return (archiveA.dCompleted.getTime() - archiveB.dCompleted.getTime());
        }); // end .sort()
        
        for (var i = 0; i < checklistToEdit.arrArchive.length; i++)
        {
            treefieldChecklistHTML += "<li>" + checklistToEdit.arrArchive[i].dCompleted.toLocaleDateString() + " : " + checklistToEdit.arrArchive[i].sEntry + "</li>";
        }; // end for
        treefieldChecklistHTML += "</ul>";
        treefieldChecklistHTML += "<input id='buttonMoveUp' class='buttonMove' type='image' src='icons/arrow-up.png' style='position:fixed; right:70px; top:" + (screen.height/2 - 97) + "px'/>";
        treefieldChecklistHTML += "<input id='buttonInsertSub' class='buttonMove' type='image' src='icons/insert-sub.png' style='position:fixed; right:70px; top:" + (screen.height/2 - 30) + "px'/>";
        treefieldChecklistHTML += "<input id='buttonInsert' class='buttonMove' type='image' src='icons/insert.png' style='position:fixed; right:70px; top:" + (screen.height/2 + 30) + "px'/>";
        treefieldChecklistHTML += "<input id='buttonMoveDown' class='buttonMove' type='image' src='icons/arrow-down.png' style='position:fixed; right:70px; top:" + (screen.height/2 + 97) + "px'/>";
        treefieldChecklistHTML += "<input id='buttonMoveRight' class='buttonMove' type='image' src='icons/arrow-right.png' style='position:fixed; right:5px; top:" + screen.height/2 + "px'/>";
        treefieldChecklistHTML += "<input id='buttonMoveLeft' class='buttonMove' type='image' src='icons/arrow-left.png' style='position:fixed; right:135px; top:" + screen.height/2 + "px'/>";
        treefieldChecklistHTML += "<button id='buttonDelete2' style='position:fixed; right:5px; bottom:5px'>Delete</button>";
        $('#treefieldChecklist').html(treefieldChecklistHTML);
        
        // start: initialize field values
        
        $('#fieldDescription').val(checklistToEdit.getDescription());
        
        function initializeSubTaskCheckboxes(arrSubTasks, sHeader)
        {
            // iterate through all subTasks in the given array
            for (var i = 0; i < arrSubTasks.length; i++)
            {
                if (arrSubTasks[i].dCompleted.getTime() != 0)
                {
                    $('#buttonCheck'+sHeader+i).html("X");
                }
                else
                {
                    $('#buttonCheck'+sHeader+i).html("&nbsp");
                } // end if
                
                // recursively process all subTasks of the subTasks
                if (arrSubTasks[i].arrSubTasks.length > 0)
                {
                    initializeSubTaskCheckboxes(arrSubTasks[i].arrSubTasks, sHeader + i.toString() + "_");
                }; // end if
            }; // end for            
        }; // end initializeSubTaskCheckboxes()
        
        for (var i = 0; i < checklistToEdit.arrTasks.length; i++)
        {
            if (checklistToEdit.arrTasks[i].dCompleted.getTime() != 0)
            {
                $('#buttonCheck'+i).html("X");
            } // end if
            else
            {
                $('#buttonCheck'+i).html("&nbsp");
            } // end else
            
            if (checklistToEdit.arrTasks[i].arrSubTasks.length > 0)
            {
                initializeSubTaskCheckboxes(checklistToEdit.arrTasks[i].arrSubTasks, i.toString() + "_");
            };
        } // end for
        // end: initialize field values
                
        sDOMTaskClicked = "";
        arrTaskFocused = [];
        taskToEdit = null;
        
        $('#divScreenChecklist').css('left', '0');
        $('#divScreenChecklist').show();
        $('.buttonMove').hide();
        $('#buttonDelete2').hide();
        
        // if it's a new Checklist (i.e. the sDescription is blank), put the cursor in the sDescription field
        if (($('#fieldDescription').val().length > 0) == false)
        {
            console.log("screenChecklist : fieldDescription focus called");
            setTimeout(function ()
            {
                $('#fieldDescription').focus();
            },
            200);
        }; // end if    
    }; // end displayScreen
    
    this.startEventListeners = function()
    {
        function clickButtonBack(eventClick)
        {
            if ($('#fieldDescription').val().length > 0)
            {
                checklistToEdit.setDescription($('#fieldDescription').val());
                var iScreenWidth = screen.width;
                $('#divScreenChecklist').css('position', 'relative');
                $('#divScreenChecklist').animate({"left" : ("+=" + iScreenWidth)}, 500, 'swing',
                                                 function()
                                                 {
                                                    $('#divScreenChecklist').remove();
                                                    clearEventListeners();
                                                    
                                                    // write checklistToEdit to database
                                                    dbChecklistOpen.updateChecklist(checklistToEdit);
                                                    
                                                    screenMainInstancePass.displayScreen();
                                                    screenMainInstancePass.startEventListeners();
                                                 });
            } // end if string length > 0
            else
            {
                if (checklistToEdit.arrTasks.length > 0)
                {
                    alert('A Description must be entered in order to close this checklist.');
                } // end if
                else
                {
                    // delete the newly created Checklist
                    // delete the new Checklist from the database
                    dbChecklistOpen.deleteChecklist(checklistToEdit);
                    
                    // delete the new Checklist from arrChecklists
                    arrChecklists.splice(findChecklistIndex(checklistToEdit.iChecklistID), 1);
                    
                    // go back to screenMain
                    $('#divScreenChecklist').animate({"left" : ("+=" + iScreenWidth)}, 500, 'swing',
                                                 function()
                                                 {
                                                    $('#divScreenChecklist').remove();
                                                    clearEventListeners();                                                    
                                                    
                                                    screenMainInstancePass.displayScreen();
                                                    screenMainInstancePass.startEventListeners();
                                                 });
                }; // end else
            } // end else
        }; // end clickButtonBack()
        
        function clickButtonCheck(eventClick)
        {
            // determine which button was clicked
            var iButtonClicked = (eventClick.currentTarget.getAttribute("id",0)).substr(11).valueOf();
            var sButtonClickedID = eventClick.currentTarget.getAttribute("id",0);
            var arrButtonClicked = sButtonClickedID.substr(11).split("_");
            for (var i = 0; i < arrButtonClicked.length; i++)
            {
                arrButtonClicked[i] = parseInt(arrButtonClicked[i]);
            }; // end for
            
            // determine Task being checked
            var taskToEdit = traverseTaskTree(checklistToEdit.arrTasks, arrButtonClicked);
            
            // console.log("screenChecklist.clickButtonCheck : checklistToEdit.arrTasks[iButtonClicked].dCompleted =" + checklistToEdit.arrTasks[iButtonClicked].dCompleted);
            if (taskToEdit.dCompleted.getTime() == 0)
            {
                // mark all subTasks as completed first
                if (taskToEdit.arrSubTasks.length > 0)
                {
                    markSubTasksComplete(taskToEdit.arrSubTasks);
                }; // end if
                
                taskToEdit.dCompleted = new Date();                
            } // end if
            else
            {
                taskToEdit.dCompleted.setTime(0);
                
                // ensure all parentTasks are marked as not complete
                if (taskToEdit.iParentTaskID > -1)
                {
                    markParentsNotComplete(checklistToEdit, taskToEdit);
                }; // end if
            } // end else
            
            // refresh the screen
            screenChecklistThis.displayScreen();
            screenChecklistThis.startEventListeners();
                    
            // update database
            dbChecklistOpen.updateTask(taskToEdit);
        }; // end clickButtonCheck()
        
        function clickButtonDelete(eventClick)
        {
            if (confirm("Delete selected task?"))
            {                                    
                // delete oTask from database
                dbChecklistOpen.deleteTask(taskToEdit);            
                
                // remove oTask from checklistToEdit.arrTasks
                var arrTaskTreeLevel = findArrTreeLevel(checklistToEdit.arrTasks, taskToEdit);
                arrTaskTreeLevel.splice(arrTaskFocused[arrTaskFocused.length-1], 1);
                arrTaskFocused = [];
                screenChecklistThis.displayScreen();
                screenChecklistThis.startEventListeners();                
            }; // end confirm
        }; // end clickButtonDelete
        
        function clickButtonInsert(eventClick)
        {
            newTask(taskToEdit.iOrder + 1);
        }; // end clickButtonInsert
        
        function clickButtonInsertSub(eventClick)
        {
            newTask(1, true);
        }; // end clickButtonInsertSub
        
        function clickButtonMoveDown(eventClick)
        {
            var arrTreeLevelMovement = findArrTreeLevel(checklistToEdit.arrTasks, taskToEdit);
            
            // check if there is a task below the current one
            if (arrTaskFocused[arrTaskFocused.length-1] < (arrTreeLevelMovement.length-1))
            {
                // if incrementing the current task iOrder will cause it to conflict
                // with the iOrder of the next task, then swap the two tasks
                var taskNext = findTaskInTree(arrTreeLevelMovement, taskToEdit.iNextTaskID);
                if (taskToEdit.iOrder + 1 == taskNext.iOrder)
                {
                    // swap the iOrder numbers on both tasks
                    var iOrderSwap = taskToEdit.iOrder;
                    taskToEdit.iOrder = taskNext.iOrder;
                    taskNext.iOrder = iOrderSwap;
                    
                    // swap the two tasks in the array
                    var taskSwap = taskToEdit;
                    arrTreeLevelMovement.splice(arrTaskFocused[arrTaskFocused.length-1], 1);
                    arrTreeLevelMovement.splice((arrTaskFocused[arrTaskFocused.length-1]+1), 0, taskSwap);
                                       
                    // start: swap the two tasks on the screen
                    var DOMDiv1ID = $("#divTask" + generateIDSuffix(arrTaskFocused));
                    var arrModifyArrTaskFocused = arrTaskFocused.slice(0);
                    arrModifyArrTaskFocused[arrModifyArrTaskFocused.length-1]++;
                    var DOMDiv2ID = $("#divTask" + generateIDSuffix(arrModifyArrTaskFocused));
                    
                    DOMDiv2ID.animate({"top" : ("-=" + DOMDiv1ID.outerHeight(true))}, 500, 'swing',
                        function ()
                        {
                        });
                    DOMDiv1ID.animate({"top" : ("+=" + DOMDiv2ID.outerHeight(true))}, 500, 'swing',
                        function ()
                        {                
                            // refresh the display
                            screenChecklistThis.displayScreen(taskToEdit);
                            screenChecklistThis.startEventListeners();
                        });                    
                    // end: swap the two tasks on the screen
                    
                    // update the database
                    dbChecklistOpen.updateTask(taskNext);
                    dbChecklistOpen.updateTask(taskToEdit);                    
                } // end if
                else
                {
                    taskToEdit.iOrder++;
                    // update the screen
                    $("#"+sDOMTaskClicked).html(taskToEdit.iOrder + " : " + taskToEdit.sDescription);
                    // update the database
                    dbChecklistOpen.updateTask(taskToEdit);
                } // end else
            } // end if
            else // the task is the lowest one on the list
            {
                taskToEdit.iOrder++;
                // update the screen
                $("#"+sDOMTaskClicked).html(taskToEdit.iOrder + " : " + taskToEdit.sDescription);
                // update the database
                dbChecklistOpen.updateTask(taskToEdit);
            }; // end else            
        }; // end clickButtonMoveDown
        
        function clickButtonMoveLeft(eventClick)
        {
            // the Task can only be moved to the left if it is a subTask
            if (arrTaskFocused.length > 1)
            {
                // find the array of Tasks and subTasks that needs to be edited
                var arrTasksNewLevel = checklistToEdit.arrTasks;
                var iIndexOldParent = arrTaskFocused[0];
                var taskOldParent = checklistToEdit.arrTasks[iIndexOldParent];
                taskToEdit.iParentTaskID = -1;
                taskToEdit.iOrder = taskOldParent.iOrder + 1;
                for (var i = 1; i < (arrTaskFocused.length - 1); i++)
                {
                    taskToEdit.iParentTaskID = arrTasksNewLevel[arrTaskFocused[i-1]].iTaskID;
                    arrTasksNewLevel = arrTasksNewLevel[arrTaskFocused[i-1]].arrSubTasks;
                    iIndexOldParent = arrTaskFocused[i];
                    taskOldParent = arrTasksNewLevel[iIndexOldParent];
                    taskToEdit.iOrder = taskOldParent.iOrder + 1;
                }; // end for                
                
                // move the Task from its current array to the same array as the parentTask
                arrTasksNewLevel.splice(iIndexOldParent+1,0,taskToEdit);
                arrTasksNewLevel[iIndexOldParent].arrSubTasks.splice(arrTaskFocused[arrTaskFocused.length-1],1);
                
                resolveTaskConflicts(arrTasksNewLevel, taskToEdit);
                
                // animate the shift left on the screen
                var DOMDiv1ID = $("#divTask" + generateIDSuffix(arrTaskFocused));
                DOMDiv1ID.animate({"left" : ("-=" + iSubTaskIndent + "px")}, 250, 'swing',
                function ()
                {                
                    // refresh the display
                    screenChecklistThis.displayScreen(taskToEdit);
                    screenChecklistThis.startEventListeners();
                });
                
                // update the database
                dbChecklistOpen.updateTask(taskToEdit);
            }; // end if
        }; // end clickButtonMoveLeft()
        
        function clickButtonMoveRight(eventClick)
        {
            // the Task can only be moved to the right if it has a sibling Task above it
            if (taskToEdit.iPrevTaskID > -1)
            {
                // find the array of Tasks and subTasks that needs to be edited
                var arrTasksToEdit = checklistToEdit.arrTasks;
                for (var i = 1; i < arrTaskFocused.length; i++)
                {
                    arrTasksToEdit = arrTasksToEdit[arrTaskFocused[i-1]].arrSubTasks;
                }; // end for
                var arrSubTasksToEdit = arrTasksToEdit[arrTaskFocused[arrTaskFocused.length-1]-1].arrSubTasks;
                
                // adjust the parameters of the taskToEdit
                taskToEdit.iParentTaskID = taskToEdit.iPrevTaskID;
                if (arrSubTasksToEdit.length > 0)
                {
                    taskToEdit.iOrder = arrSubTasksToEdit[arrSubTasksToEdit.length-1].iOrder + 1;
                    taskToEdit.iPrevTaskID = arrSubTasksToEdit[arrSubTasksToEdit.length-1].iTaskID;
                    taskToEdit.iNextTaskID = -1;
                }
                else
                {
                    taskToEdit.iOrder = 1;
                    taskToEdit.iPrevTaskID = -1;
                    taskToEdit.iNextTaskID = -1;
                }
 
                // move the Task from its current array to the subTask array of the parentTask
                arrSubTasksToEdit.push(taskToEdit);
                arrTasksToEdit.splice(arrTaskFocused[arrTaskFocused.length-1],1);
                
                // if the Task is not complete, mark the parentTask as not complete
                if (taskToEdit.dCompleted.getTime() == 0)
                {
                    markParentsNotComplete(checklistToEdit, taskToEdit);
                }; // end if
                
                // animate the shift right on the screen
                var DOMDiv1ID = $("#divTask" + generateIDSuffix(arrTaskFocused));
                DOMDiv1ID.animate({"left" : ("+=" + iSubTaskIndent + "px")}, 250, 'swing',
                function ()
                {                
                    // refresh the display
                    screenChecklistThis.displayScreen(taskToEdit);
                    screenChecklistThis.startEventListeners();
                });
                
                // update the database
                dbChecklistOpen.updateTask(taskToEdit);

            }; // end if
        }; // end clickButtonMoveRight()
        
        function clickButtonMoveUp(eventClick)
        {
            var arrTreeLevelMovement = findArrTreeLevel(checklistToEdit.arrTasks, taskToEdit);
            
            // check if iOrder is already the minimum value
            if (taskToEdit.iOrder > 1)
            {
                // search to see if there are any tasks displayed above the current one
                if (arrTaskFocused[arrTaskFocused.length-1] > 0) // check if there are any tasks above this selected one
                {
                    var taskPrev = findTaskInTree(arrTreeLevelMovement, taskToEdit.iPrevTaskID);
                    // check if the previous task is directly above the selected one
                    if (taskToEdit.iOrder == taskPrev.iOrder + 1)
                    {
                        // swap the iOrder number of both tasks
                        var iOrderSwap = taskToEdit.iOrder;
                        taskToEdit.iOrder = taskPrev.iOrder;
                        taskPrev.iOrder = iOrderSwap;                        
                        
                        // swap the two tasks in the array
                        var taskSwap = taskToEdit;
                        arrTreeLevelMovement.splice(arrTaskFocused[arrTaskFocused.length-1], 1);
                        arrTreeLevelMovement.splice((arrTaskFocused[arrTaskFocused.length-1]-1), 0, taskSwap);
                        
                        // start: swap the two tasks on the screen
                        var DOMDiv1ID = $("#divTask" + generateIDSuffix(arrTaskFocused));
                        var arrModifyArrTaskFocused = arrTaskFocused.slice(0);
                        arrModifyArrTaskFocused[arrModifyArrTaskFocused.length-1]--;
                        var DOMDiv2ID = $("#divTask" + generateIDSuffix(arrModifyArrTaskFocused));
                        
                        DOMDiv2ID.animate({"top" : ("+=" + DOMDiv1ID.outerHeight(true))}, 500, 'swing',
                        function ()
                        {
                        });
                        DOMDiv1ID.animate({"top" : ("-=" + DOMDiv2ID.outerHeight(true))}, 500, 'swing',
                        function ()
                        {
                            // refresh the display
                            screenChecklistThis.displayScreen(taskToEdit);
                            screenChecklistThis.startEventListeners();
                        });
                        
                        // update the database
                        dbChecklistOpen.updateTask(taskToEdit);
                        dbChecklistOpen.updateTask(taskPrev);
                    }
                    else
                    {
                        taskToEdit.iOrder--;
                        // update the screen
                        $("#"+sDOMTaskClicked).html(taskToEdit.iOrder + " : " + taskToEdit.sDescription);
                    }; // end else
                }
                else
                {
                    taskToEdit.iOrder--;
                    // update the screen
                    $("#"+sDOMTaskClicked).html(taskToEdit.iOrder + " : " + taskToEdit.sDescription);
                }; // end else
            }; // end if
        }; // end clickButtonMoveUp
        
        function clickNewTask(eventClick)
        {
            if (checklistToEdit.arrTasks.length > 0)
            {
                newTask(checklistToEdit.arrTasks[checklistToEdit.arrTasks.length - 1].iOrder + 1);
            } // end if
            else
            {
                newTask(1);
            } // end else
        }; // end clickNewTask()
        
        function clickEventTask(eventClick)
        {
            eventClick.preventDefault();
            
            // determine which Task was clicked
            // get path through the Task tree
            sDOMTaskClicked = eventClick.currentTarget.getAttribute("id",0);
            var arrTaskClicked = sDOMTaskClicked.substr(10).split("_");
            for (var i = 0; i < arrTaskClicked.length; i++)
            {
                arrTaskClicked[i] = parseInt(arrTaskClicked[i]);
            }; // end for            
            
            // check if the user clicked on the same Task twice in a row
            var bSecondClickOnTask = true;
            if (arrTaskClicked.length == arrTaskFocused.length)
            {
                for (var i = 0; i < arrTaskClicked.length; i++)
                {
                    if (arrTaskClicked[i] != arrTaskFocused[i])
                    {
                        bSecondClickOnTask = false;
                    }; // end if
                }; // end for
            }
            else
            {
                bSecondClickOnTask = false;
            }; // end if
            
            if (bSecondClickOnTask) // a second click on the selected task
            {
                // clear arrTaskFocused flag
                arrTaskFocused = [];
                
                // clear screenChecklist
                $('#divScreenChecklist').remove();
                clearEventListeners();
                
                console.log("screenChecklist.clickEventTask : arrTaskClicked[arrTaskClicked.length-1] = " + arrTaskClicked[arrTaskClicked.length-1]);
                // show screenTask                
                var screenTaskNew = new screenTask(taskToEdit, screenChecklistThis, checklistToEdit);
                screenTaskNew.displayScreen();
                screenTaskNew.startEventListeners();
            } // end if
            else // the first click on a task
            {
                arrTaskFocused = arrTaskClicked;
                taskToEdit = traverseTaskTree(checklistToEdit.arrTasks, arrTaskClicked);
                
                // clear bold text from previous selections
                $('.buttonTask').css("border-width", "1px");
                // clear up/down buttons from previous selections
                $('.buttonMove').hide();
                
                // bold the selected Checklist
                var sTaskDOMId = "#" + eventClick.currentTarget.getAttribute("id",0);
                $(sTaskDOMId).css("border-width", "3px");
                            
                $('.buttonMove').css({opacity : 0.0});
                $('.buttonMove').show();
                $('.buttonMove').fadeTo(500, 1.0);                
                $('#buttonDelete2').show();
            } // end else
        }; // end clickEvent()
        
        function keypressEvent(eventKeyPressed)
        {
            if (String.fromCharCode(eventKeyPressed.which) == "n")
            {
                if (eventKeyPressed.target.nodeName.toLowerCase() != "input")
                {
                    eventKeyPressed.preventDefault();
                    newTask(checklistToEdit.arrTasks[checklistToEdit.arrTasks.length - 1].iOrder + 1);
                } // end if
            } // end if "n" key
            // if delete key            
            else if ((eventKeyPressed.which == 8) && (arrTaskFocused[0] != null))
            {
                clickButtonDelete(eventKeyPressed);
            } // else if delete key
            // if BACK key
            else if ((eventKeyPressed.which == 27) || (String.fromCharCode(eventKeyPressed.which) == "`"))
            {
                clickButtonBack(eventKeyPressed);
            }; // end if BACK key
        }; // end keypressEvent
        
        $(document).unbind();
        /*
        $(document).keypress(function (evt)
            {                
                console.log("screenChecklist : event keypress");
                keypressEvent(evt);
            }); // end .keypress() bind
        */
        $(document).click(function(evt)
            {
                console.log("screenChecklist : event document click");
                if ((evt.target.id.substr(0,10) != "buttonTask") && (evt.target.className != "buttonMove") && (arrTaskFocused.length > 0))
                {
                    $('.buttonTask').css("border-width", "1px");
                    $('.buttonMove').fadeTo(250, 0.0,
                                           function ()
                                           {
                                                $('.buttonMove').hide();
                                           });
                    
                    taskToEdit = null;
                    arrTaskFocused = [];
                    $('#buttonDelete2').hide();
                }; // end if
            }); // end .click
        $('#fieldDescription').unbind();
        $('#fieldDescription').click(function (evt)
            {
                console.log("screenChecklist : event fieldDescription click");
                evt.stopPropagation();
            }); // end .click
        $('#fieldDescription').blur(function (evt)
            {
                console.log("screenChecklist : event fieldDescription blur");
                // save value of Checklist Description 
                checklistToEdit.setDescription($('#fieldDescription').val());
                dbChecklistOpen.updateChecklist(checklistToEdit);
            }); // end .blur
        $('.buttonCheck').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonCheck");
                clickButtonCheck(evt);
            });       
        $('.buttonTask').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonTask");
                clickEventTask(evt);
            }); // end .click bind
        $('#buttonTaskNew').unbind();
        $('#buttonTaskNew').click(function (evt)
            {
                console.log("screenChecklist : event clickNewTask");
                clickNewTask(evt);
            });
        $('#buttonBack').unbind();
        $('#buttonBack').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonBack");
                clickButtonBack(evt);
            });
        $('.buttonMove').unbind();
        $('#buttonMoveUp').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonMoveUp");
                clickButtonMoveUp(evt);
            }); // end #buttonMoveUp.click()
        $('#buttonMoveDown').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonMoveDown");
                clickButtonMoveDown(evt);
            }); // end #buttonMoveDown.click()
        $('#buttonMoveLeft').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonMoveLeft");
                clickButtonMoveLeft(evt);
            }); // end #buttonMoveLeft.click()
        $('#buttonMoveRight').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonMoveRight");
                clickButtonMoveRight(evt);
            }); // end #buttonMoveRight.click()
        $('#buttonInsertSub').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonInsertSub");
                clickButtonInsertSub(evt);
            }); // end #buttonInsertSub.click()
        $('#buttonInsert').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonInsert");
                clickButtonInsert(evt);
            }); // end #buttonInsert.click()
        $('#buttonDelete2').click(function (evt)
            {
                console.log("screenChecklist : event clickButtonDelete");
                clickButtonDelete(evt);
            });

        // menu events
        blackberry.app.event.onSwipeDown(menuChecklist.showMenuBar);
        $('#buttonArchiveCompleted').unbind();
        $('#buttonArchiveCompleted').click(function (evt)
        {
            console.log("screenChecklist : event menu Archive Completed click");
            menuChecklist.archiveCompleted(checklistToEdit, screenChecklistThis);
        }); // end .click
        $('#buttonExportHTML').unbind();
        $('#buttonExportHTML').click(function (evt)
        {
            console.log("screenChecklist : event menu Export click");
            menuChecklist.exportHTML(checklistToEdit);
        }); // end .click
        $('#buttonCreateTemplate').unbind();
        $('#buttonCreateTemplate').click(function (evt)
        {
            console.log("screenChecklist : event menu Create Template click");
            menuChecklist.createTemplate(checklistToEdit);
        }); // end #buttonArchiveCompleted.click
        
        if (sDOMActiveTask.length > 0)
        {
            if (($(sDOMActiveTask).offset().top < $(document).scrollTop()) ||
                ($(sDOMActiveTask).offset().top + $(sDOMActiveTask).height() > $(document).scrollTop() + screen.height))
            {
                /* 
                $('body,html').animate(
                    { scrollTop : $(sDOMActiveTask).offset().top - (screen.height / 2) },
                    400);
                */
                scroll(0, $(sDOMActiveTask).offset().top - (screen.height / 2));
            }; // end if
        }; // end if
        
        // if an active Task was passed when drawing the screen, enable that Task again
        if (sDOMActiveTask.length > 0)
        {
            setTimeout(function ()
            {
                $(sDOMActiveTask).click();
            },
            200);
        }
    } // end startEventListeners
} // end screenChecklist