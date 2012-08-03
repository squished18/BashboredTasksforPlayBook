var screenTemplates = (function ()
{
    var iTemplateFocused = null;
    var sSelectedElement = "";
    var bDialogOpen = false;
    
    return {        
        displayScreen : function ()
        {
            $('#divScreenTemplates').remove();
            $('#divDisplay').append("<div id='divScreenTemplates'></div>");
            
            var sOutputHTML = "<label id='labelTitle' class='label'>Templates Library</label><br>";
            sOutputHTML += "<button id='buttonBack' style='position:fixed; right:5px; top:5px; z-index:10'>Back</button><br>";
            
            if (arrTemplates.length > 0)
            {
                arrTemplates.sort(function(templateA,templateB){return templateA.sDescription.localeCompare(templateB.sDescription)});
                
                for (var i=0; i<arrTemplates.length; i++)
                {
                    sOutputHTML += "<button class='buttonCreateChecklist' id='buttonCreateChecklist"+i+"'>+</button>";
                    sOutputHTML += "<button class='buttonTemplate' id='buttonTemplate"+i+"' x-blackberry-focusable='true'>"+arrTemplates[i].sDescription+"</button><br>";
                };
            }; // end if
            sOutputHTML += "<button class='buttonCreateChecklist'>&nbsp</button>";
            sOutputHTML += "<button class='buttonTemplate' id='buttonNewTemplate' x-blackberry-focusable='true'>** new template **</button>";
            sOutputHTML += "<button id='buttonDelete' style='position:fixed; right:5px; bottom:5px'>Delete</button>";
            
            $('#divScreenTemplates').html(sOutputHTML);
        },
        startEventListeners : function ()
        {
            function clearEventListeners()
            {
                blackberry.app.event.onSwipeDown(null);
            }; // end clearEventListeners
        
            function newTemplate()
            {
                $('#divScreenTemplates').remove();
                clearEventListeners();
                
                // create new Template and assign unique TemplateID
                var templateNew = new oTemplate();
                templateNew.iTemplateID = iNextTemplateID;
                iNextTemplateID++;                
                arrTemplates.push(templateNew);
                
                // insert record for new oChecklist into database
                dbChecklistOpen.addTemplate(templateNew);
            
                // display screen to enter information for new Checklist
                var screenTemplateDetailNew = new screenTemplateDetail(arrTemplates[arrTemplates.length - 1]);
                screenTemplateDetailNew.displayScreen();
                screenTemplateDetailNew.startEventListeners();
            }; // end newTemplate()
            
            function clickButtonBack(eventClick)
            {
                $('#divScreenTemplates').remove();
                
                screenMainInstance.displayScreen();
                screenMainInstance.startEventListeners();
            }; // end clickButtonBack
            
            function clickButtonCreateChecklist(eventClick)
            {
                iTemplateFocused = (eventClick.currentTarget.getAttribute("id",0)).substr(21).valueOf();
                
                // ask user to confirm Description for new Checklist
                $('#dialogCreateChecklist').dialog(
                    {
                        autoOpen: false,
                        height: 250,
                        width: 500,
                        modal: true,
                        buttons :
                        {
                            "OK" : function()
                            {
                                var checklistNew = new oChecklist();
                                checklistNew.iChecklistID = iNextChecklistID;
                                iNextChecklistID++;
                                checklistNew.createFromTemplate(arrTemplates[iTemplateFocused], $('#fieldNewChecklistDescription').val());
                                
                                dbChecklistOpen.updateChecklist(checklistNew);
                                arrChecklists.push(checklistNew);
                                
                                $(this).dialog("close");
                                bDialogOpen = false;
                                
                                $('#divScreenTemplates').remove();
                                screenMainInstance.displayScreen();
                                screenMainInstance.startEventListeners();
                            },
                            "Cancel" : function()
                            {
                                $(this).dialog("close");
                                bDialogOpen = false;
                            }
                        }
                    }
                );
                
                $('#fieldNewChecklistDescription').val(arrTemplates[iTemplateFocused].sDescription);
                $("#dialogCreateChecklist").dialog("open");
                bDialogOpen = true;
            }; // end clickButtonCreateChecklist
            
            function clickButtonDelete(eventClick)
            {
                if (confirm("Delete selected Template?"))
                {
                    // delete oTemplate from database
                    dbChecklistOpen.deleteTemplate(arrTemplates[iTemplateFocused]);
                    
                    // remove oChecklist from arrChecklists
                    arrTemplates.splice(iTemplateFocused, 1);
                    iTemplateFocused = null;
                    sSelectedElement = "";
                    screenTemplates.displayScreen();
                    screenTemplates.startEventListeners();
                }; // end if
            }; // end clickButtonDelete
            
            function clickButtonTemplate(eventClick)
            {
                if ((eventClick.currentTarget.getAttribute("id",0)).substr(14).valueOf() == iTemplateFocused)
                {
                    // determine which template was clicked                 
                    iTemplateFocused = (eventClick.currentTarget.getAttribute("id",0)).substr(14).valueOf();                    
                    
                    // clear screenTemplates
                    $('#divScreenTemplates').remove();                    
                    clearEventListeners();
                    
                    // show screenTemplateDetail
                    var screenTemplateDetailNew = new screenTemplateDetail(arrTemplates[iTemplateFocused]);
                    screenTemplateDetailNew.displayScreen();
                    screenTemplateDetailNew.startEventListeners();
                    iTemplateFocused = null;
                    sSelectedElement = "";
                } // end if
                else
                {
                    iTemplateFocused = (eventClick.currentTarget.getAttribute("id",0)).substr(14).valueOf();
                    sSelectedElement = eventClick.currentTarget.getAttribute("id",0);
                    $("#" + eventClick.currentTarget.getAttribute("id",0)).css("border-width", "3px");
                    $('#buttonDelete').show();
                }; // end else                
            }; // end clickButtonTemplate
            
            $(document).unbind();
            $(document).click(function (evt)
            {
                if ((evt.target.id.substr(0,14) != "buttonTemplate") && (evt.target.id != "buttonDelete") && (bDialogOpen == false))
                {
                    $('.buttonTemplate').css("border-width", "1px");
                    iTemplateFocused = null;
                    sSelectedElement = "";
                    $('#buttonDelete').hide();
                }; // end if            
            }); // end .click
            $('#buttonBack').click(function (evt)
            {
                console.log("screenTemplates: event clickButtonBack");
                clickButtonBack(evt);
            }); // end .click
            $('#buttonDelete').click(function (evt)
            {
                console.log("screenTemplates: event clickButtonDelete");
                clickButtonDelete(evt);
            }); // end .click
            $('.buttonCreateChecklist').unbind();
            $('.buttonCreateChecklist').click(function (evt)
            {
                clickButtonCreateChecklist(evt);
            }); // end .click
            $('.buttonTemplate').unbind();
            $('.buttonTemplate').click(function (evt)
            {
                $('.buttonTemplate').css("border-width", "1px");
                $("#" + evt.target.id).css("border-width", "3px");
                    
                clickButtonTemplate(evt);
            }); // end .click
            $('#buttonNewTemplate').unbind();
            $('#buttonNewTemplate').click(function (evt)
                {
                    evt.stopPropagation();
                    newTemplate();
                }); // end .click
            
            $('#buttonDelete').hide();
        }
    };
})(); // end screenTemplates