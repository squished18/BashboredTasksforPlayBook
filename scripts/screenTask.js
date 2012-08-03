function screenTask(/*oTask*/ taskToEdit,
                    /*screenChecklist*/ screenChecklistInstancePass,
                    /*oChecklist*/ checklistToEdit)
{
    function clearEventListeners()
    {
        $(document).unbind('keypress');
    }; // end clearEventListeners
    
    this.displayScreen = function()
    {
        $('#divScreenTask').remove();
        $('#divDisplay').append("<div id='divScreenTask'></div>");
        
        // populate drop-down for iOrder number
        var sNumberOptions = "";
        for (var i = 1; i <= 100; i++)
        {
            sNumberOptions += "<option value=" + i + ">" + i + "</option>";
        } // end for
        var screenTaskHTML =
        "<div>" +
            "<label id='labelTaskOrder'>Order</label>" +
            "<select id='selectOrder' class='selectOrder'>" +
                sNumberOptions +
            "</select>" +
            "<button id='buttonBack2' style='position:fixed; right:5px'>Back</button><br>" +
            "<label for='fieldDescriptionTask' id='labelTaskDescription'>Task Description</label><br>" +
            "<textarea id='fieldDescriptionTask' style='width:70%;height:4.25em'></textarea><br>" +
            "<label for='inputDueDate' id='labelDueDate'>Due Date</label><br>" +
            "<input type='text' id='inputDueDate' class='datepicker'></input>" +
            "<button id='buttonClearDueDate' style='position:relative; margin-left:10px; border-radius:12px'>x</button><br>" +
            "<button id='buttonCompleted' class='buttonCheck2'></button>"+
            "<label>Completed</label><br>" +
            "<label id='labelDateCompleted' style='margin-left:10px'></label>" +
        "</div>";
        $('#divScreenTask').html(screenTaskHTML);
                        
        // initialize field values
        $('#selectOrder').val(taskToEdit.iOrder);
        $('#fieldDescriptionTask').val(taskToEdit.sDescription);
        var dSetDueDateField = new Date(taskToEdit.getDueDate());
        if (dSetDueDateField > 0)
        {
            $('#inputDueDate').val((dSetDueDateField.getMonth() + 1) + "/" + dSetDueDateField.getDate() + "/" + dSetDueDateField.getFullYear());
        }; // end if
        $('.datepicker').datepicker({showOtherMonths: true, selectOtherMonths: true});
        
        console.log("screenTask.displayScreen() : taskToEdit.dCompleted = " + taskToEdit.dCompleted);
        if (taskToEdit.dCompleted.getTime() == 0)
        {
            $('#buttonCompleted').html("&nbsp");            
        } // end if
        else
        {
            $('#buttonCompleted').html("X");
            console.log(taskToEdit.dCompleted);
            $('#labelDateCompleted').text(taskToEdit.dCompleted.toString());
        }; // end else
    }; // end .displayScreen()
    
    this.startEventListeners = function()
    {
        function clickButtonBack(eventClick)
        {          
            // check if Description field is empty
            if ($('#fieldDescriptionTask').val().length > 0)
            {
                // save values from form
                taskToEdit.iOrder = Number($('#selectOrder').val());
                taskToEdit.sDescription = $('#fieldDescriptionTask').val();
                taskToEdit.setDueDate(Date.parse($('#inputDueDate').val()));
                
                // update taskToEdit in database
                dbChecklistOpen.updateTask(taskToEdit);
                
                // resolve any iOrder conflicts created by adding the new task
                var arrTreeLevelConflictSearch = findArrTreeLevel(checklistToEdit.arrTasks, taskToEdit);
                resolveTaskConflicts(arrTreeLevelConflictSearch, taskToEdit);
                
                if (taskToEdit.dCompleted.getTime() == 0)
                {
                    // if Task is marked not complete, mark all parentTasks as not complete
                    if (taskToEdit.iParentTaskID > -1)
                    {
                        markParentsNotComplete(checklistToEdit, taskToEdit);
                    }; // end if
                } // end if
                else
                {
                    // if Task is marked complete, mark all subTasks as complete
                    if (taskToEdit.arrSubTasks.length > 0)
                    {
                        markSubTasksComplete(taskToEdit.arrSubTasks);
                    }; // end if
                }; // end else
                
                // return to screenChecklist
                $('.datepicker').datepicker('hide');
                $('#divScreenTask').remove();
                clearEventListeners();
                screenChecklistInstancePass.displayScreen(taskToEdit);
                screenChecklistInstancePass.startEventListeners();
            } // end if
            else
            {                
                // delete the task from the database
                dbChecklistOpen.deleteTask(taskToEdit);
                
                // delete the task from the Task tree
                var arrTaskTreeLevel = findArrTreeLevel(checklistToEdit.arrTasks, taskToEdit);
                var iTaskIndex = findTaskIndex(arrTaskTreeLevel, taskToEdit);
                arrTaskTreeLevel.splice(iTaskIndex,1);
                
                // return to screenChecklist
                $('#divScreenTask').remove();
                clearEventListeners();
                screenChecklistInstancePass.displayScreen();
                screenChecklistInstancePass.startEventListeners();
            } // end else
        }; // end clickButtonBack()
        
        function clickButtonCompleted(eventClick)
        {
            if (taskToEdit.dCompleted.getTime() == 0)
            {
                taskToEdit.dCompleted = new Date();
                $('#buttonCompleted').html("X");
                $('#labelDateCompleted').text(taskToEdit.dCompleted.toString());
            } // end if
            else
            {
                taskToEdit.dCompleted.setTime(0);
                $('#buttonCompleted').html("&nbsp");
                $('#labelDateCompleted').text("");
            }; // end else
        }; // end clickButtonCompleted
        
        function keypressEvent(eventKeyPressed)
        {
            if ((eventKeyPressed.which == 27) || (String.fromCharCode(eventKeyPressed.which) == "`")) // handle BACK key
            {
                clickButtonBack(eventKeyPressed);
            }; // end if BACK key
        } // end keyPressEvent()
        
        $(document).unbind();
        $(document).keypress(function (evt)
            {
                keypressEvent(evt);    
            }); // end .keypress() call
        $(document).click(function (evt)
            {
                console.log("screenTask : event document click");
                if ((evt.target.id.localeCompare("inputDueDate") != 0) &&
                    (evt.target.className.indexOf("ui-datepicker") == -1))
                {
                    $('.datepicker').datepicker("hide");
                }; // end if
            }); // end .click() call
        $('#buttonBack2').click(function (evt)
            {
                evt.stopPropagation();
                clickButtonBack(evt);
            }); // end .click() call
        $('#buttonCompleted').unbind();
        $('#buttonCompleted').click(function (evt)
            {
                clickButtonCompleted(evt);
            }); // end .click() call
        $('#fieldDescriptionTask').blur(function (evt)
            {
                console.log("screenTask : event fieldDescriptionTask blur");
            }); // end .blur() call
        // prevent the onscreen keyboard from popping up when the due date field is clicked
        $('#inputDueDate').focus(function (evt)
            {
                setTimeout(function ()
                           {
                                $('#inputDueDate').blur();
                           },
                           200);
            });
        $('#buttonClearDueDate').click(function (evt)
            {
                $('#inputDueDate').val("");
                // $('#inputDueDate').datepicker._clearDate();
            });
        setTimeout(function ()
        {
            $('#fieldDescriptionTask').focus();
            $('#fieldDescriptionTask').setCursorPosition(taskToEdit.sDescription.length);
        },
        200);
    }; // end .startEventListeners()
} // end screenTask object