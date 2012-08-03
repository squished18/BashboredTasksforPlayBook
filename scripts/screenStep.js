function screenStep(/*oStep*/ stepToEdit,
                    /*screenTemplate*/ screenTemplateInstancePass,
                    /*oTempalte*/ templateToEdit)
{
    function clearEventListeners()
    {        
    }; // end clearEventListeners()
    
    this.displayScreen = function()
    {
        $('#divScreenStep').remove();
        $('#divDisplay').append("<div id='divScreenStep'></div>");
        
        // populate drop-down for iOrder number
        var sNumberOptions = "";
        for (var i = 1; i <= 100; i++)
        {
            sNumberOptions += "<option value=" + i + ">" + i + "</option>";
        } // end for
        
        var screenStepHTML =
        "<div>" +
            "<label id='labelStepOrder'>Order</label>" +
            "<select id='selectOrder' class='selectOrder'>" +
                sNumberOptions +
            "</select>" +
            "<button id='buttonBack2' style='position:fixed; right:5px'>Back</button><br>" +
            "<label for='fieldDescriptionStep' id='labelStepDescription'>Step Description</label><br>" +
            "<textarea id='fieldDescriptionStep' style='width:70%;height:4.25em'></textarea><br>" +
        "</div>";
        $('#divScreenStep').html(screenStepHTML);
        
        // initialize field values
        $('#selectOrder').val(stepToEdit.iOrder);
        $('#fieldDescriptionStep').val(stepToEdit.sDescription);        
    }; // end this.displayScreen()
    
    this.startEventListeners = function()
    {
        function clickButtonBack(clickEvent)
        {
            // check if Description field is empty
            if ($('#fieldDescriptionStep').val().length > 0)
            {
                // save values from form
                stepToEdit.iOrder = Number($('#selectOrder').val());
                stepToEdit.sDescription = $('#fieldDescriptionStep').val();
                
                // update stepToEdit in database
                dbChecklistOpen.updateStep(stepToEdit);

                // resolve any iOrder conflicts created by adding the new task
                var arrTreeLevelConflictSearch = findStepTreeLevel(templateToEdit.arrSteps, stepToEdit);
                resolveStepConflicts(arrTreeLevelConflictSearch, stepToEdit);
                
                // return to screenTemplateDetail
                $('#divScreenStep').remove();
                clearEventListeners();
                screenTemplateInstancePass.displayScreen(stepToEdit);
                screenTemplateInstancePass.startEventListeners();                
            } // end if
            else
            {
                // delete the Step from the database
                dbChecklistOpen.deleteStep(stepToEdit);
                
                // delete the Step from the Step tree
                var arrStepTreeLevel =  findTemplateTreeLevel(templateToEdit.arrSteps, stepToEdit);
                var iStepIndex = findStepIndex(arrStepTreeLevel, stepToEdit);
                arrStepTreeLevel.splice(iStepIndex, 1);
                
                // return to screenTemplateDetail
                $('#divScreenStep').remove();
                clearEventListeners();
                screenTemplateInstancePass.displayScreen();
                screenTemplateInstancePass.startEventListeners();
            }; // end else
        }; // end clickButtonBack()
        
        $('#buttonBack2').click(function (evt)
        {
            clickButtonBack(evt);
        }); // end #buttonBack2.click
        
        setTimeout(function ()
        {
            $('#fieldDescriptionStep').focus();
            $('#fieldDescriptionStep').setCursorPosition(stepToEdit.sDescription.length);
        },
        200);

    }; // end this.startEventListeners()
}; // end screenStep()