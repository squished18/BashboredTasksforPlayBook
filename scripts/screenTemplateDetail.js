function screenTemplateDetail(/*oTemplate*/ templateToEdit)
{
    var screenTemplateDetailThis = this;
    var sDOMStepClicked = "";
    var arrStepFocused = [];    
    var stepToEdit = null;
    var sDOMActiveStep = "";
    
    var iSubStepIndent = 20;
    
    function clearEventListeners()
    {
        blackberry.app.event.onSwipeDown(null);
    }; // end clearEventListeners()
    
    function newStep(iDefaultOrder, bSubStep)
    {        
        $('#divScreenTemplateDetail').remove();
        clearEventListeners();
        
        // add new oStep object to current oTemplate
        var stepNew = new oStep();
        stepNew.iStepID = iNextStepID;
        iNextStepID++;
        stepNew.iOrder = iDefaultOrder;
        
        // check if adding to an existing Step or creating a new root-level Step
        if (stepToEdit != null)
        {
            if (bSubStep == true)
            {
                stepNew.iParentStepID = stepToEdit.iStepID;
                stepToEdit.arrSubSteps.push(stepNew);
            }
            else // end if
            {
                stepNew.iParentStepID = stepToEdit.iParentStepID;
                var arrTreeLevelMovement = findTemplateTreeLevel(templateToEdit.arrSteps, stepToEdit);
                arrTreeLevelMovement.push(stepNew);
            }; // end else
        } // end if
        else
        {
            templateToEdit.arrSteps.push(stepNew);
        }; // end else
        
        // add new oStep to database
        dbChecklistOpen.addStep(templateToEdit, stepNew);
        
        // display screenStep
        arrStepFocused = [];
        var screenStepNew = new screenStep(stepNew, screenTemplateDetailThis, templateToEdit);
        screenStepNew.displayScreen();
        screenStepNew.startEventListeners();
    }; // end newStep()
    
    function sortSteps()
    {
        function sortSubSteps(stepToSort)
        {
            stepToSort.arrSubSteps.sort(function (stepA, stepB)
                {
                    return stepA.iOrder - stepB.iOrder;
                });
            
            // update iPrevStepID and iNextStepID as these pointers may need to be updated because the Step order
            // may now be completely different than before
            if (stepToSort.arrSubSteps.length > 0)
            {
                stepToSort.arrSubSteps[0].iPrevStepID = -1;
                stepToSort.arrSubSteps[stepToSort.arrSubSteps.length - 1].iNextStepID = -1;
            }; // end if
            if (stepToSort.arrSubSteps.length > 1)
            {
                for (var i = 0; i < (stepToSort.arrSubSteps.length - 1); i++)
                {
                    stepToSort.arrSubSteps[i].iNextStepID = stepToSort.arrSubSteps[i+1].iStepID;
                }; // end for
                for (var i = 1; i < stepToSort.arrSubSteps.length; i++)
                {
                    stepToSort.arrSubSteps[i].iPrevStepID = stepToSort.arrSubSteps[i-1].iStepID;
                }; // end for
            }; // end if

            for (var i = 0; i < stepToSort.arrSubSteps.length; i++)
            {
                if (stepToSort.arrSubSteps[i].arrSubSteps.length > 0)
                {
                    sortSubSteps(stepToSort.arrSubSteps[i]);
                }; // end if
            }; // end for            
        }; // end sortSubSteps()
        
        templateToEdit.arrSteps.sort(function(stepA, stepB)
            {
                return stepA.iOrder - stepB.iOrder;
            });
        // update iPrevStepID and iNextStepID as these pointers may need to be updated because the Step order
        // may now be completely different than before
        if (templateToEdit.arrSteps.length > 0)
        {
            templateToEdit.arrSteps[0].iPrevStepID = -1;
            templateToEdit.arrSteps[templateToEdit.arrSteps.length-1].iNextStepID = -1;
        }; // end if
        if (templateToEdit.arrSteps.length > 1)
        {
            for (var i = 0; i < (templateToEdit.arrSteps.length - 1); i++)
                {
                    templateToEdit.arrSteps[i].iNextStepID = templateToEdit.arrSteps[i+1].iStepID;
                }; // end for
            for (var i = 1; i < templateToEdit.arrSteps.length; i++)
                {
                    templateToEdit.arrSteps[i].iPrevStepID = templateToEdit.arrSteps[i-1].iStepID;
                }; // end for
        }; // end if
        
        // sort subSteps
        for (var i = 0; i < templateToEdit.arrSteps.length; i++)
        {
            if (templateToEdit.arrSteps[i].arrSubSteps.length > 0)
            {
                sortSubSteps(templateToEdit.arrSteps[i]);
            }; // end if
        }; // end for
    }; // end sortSteps()
    
    this.displayScreen = function (stepActive)
    {
        sDOMActiveStep = "";
        
        function displaySubSteps(arrSubStepsPass, arrIndexPass)
        {
            var sSubStepHTML = "";
            var sIndexHeader = "" + arrIndexPass[0];
            
            for (var j = 1; j < arrIndexPass.length; j++)
            {
                sIndexHeader += "_" + arrIndexPass[j];
            }; // end for
            
            for (var i = 0; i < arrSubStepsPass.length; i++)
            {
                // draw each subStep
                sSubStepHTML += "<div id='divStep" + sIndexHeader + "_" + i + "' class='divStep' style='padding-left:" + iSubStepIndent + "px'>";
                sSubStepHTML += "<button id='buttonCheckStep" + sIndexHeader + "_" + i + "' class='buttonCheckStep'></button>";
                sSubStepHTML += "<button id='buttonStep" + sIndexHeader + "_" + i + "' class='buttonStep'>" +
                                arrSubStepsPass[i].iOrder + " : " + arrSubStepsPass[i].sDescription + "</button><br>";
                                
                // check if there is an active Step
                if (!(stepActive === undefined))
                {
                    // check if the active Step matches the Step currently being drawn
                    if (stepActive.iStepID == arrSubStepsPass[i].iStepID)
                    {
                        sDOMActiveStep = "#buttonStep" + sIndexHeader + "_" + i;
                    }; // end if
                }; // end if
                
                // draw sub-steps, if any
                if (arrSubStepsPass[i].arrSubSteps.length > 0)
                {
                    var arrIndexPassNext = arrIndexPass.slice(0);
                    arrIndexPassNext.push(i);
                    sSubStepHTML += displaySubSteps(arrSubStepsPass[i].arrSubSteps, arrIndexPassNext);                    
                }; // end if
                
                sSubStepHTML += "</div>";
            }; // end for
            
            return sSubStepHTML;
        }; // end displaySubSteps
        
        sortSteps();
        
        $('#divScreenTemplateDetail').remove();
        $('#divDisplay').append("<div id='divScreenTemplateDetail'></div>");
        
        var sScreenTemplateHTML =
        "<div>" +
            "<label id='labelDescription' class='label'>Template Description</label>" +
            "<button id='buttonBack' style='position:fixed; right:5px; top:5px; z-index:10'>Back</button><br>" +
            "<textarea id='fieldDescription' style='width:85%;height:1.25em' x-blackberry-initialFocus='true'></textarea>" +
        "</div>" +
        "<div id='treefieldTemplate'>" +        
        "</div>";
        $('#divScreenTemplateDetail').html(sScreenTemplateHTML);
                
        // draw treefieldTemplate
        var sTreeFieldTemplateHTML = "";
        for (var i = 0; i < templateToEdit.arrSteps.length; i++)
        {
            // draw each Step
            sTreeFieldTemplateHTML += "<div id='divStep" + i + "' class='divStep'>";
            sTreeFieldTemplateHTML += "<button id=\'buttonCheck" + i + "\' class='buttonCheck'></button>" +
                          "<button class='buttonStep' id='buttonStep" + i + "'>" +
                          templateToEdit.arrSteps[i].iOrder + " : " + templateToEdit.arrSteps[i].sDescription +
                          "</button><br>";
            // check if there is an active Step
            if (!(stepActive === undefined))
            {
                // check if the active Step matches the Step currently being drawn
                if (stepActive.iStepID == templateToEdit.arrSteps[i].iStepID)
                {
                    sDOMActiveStep = "#buttonStep" + i;
                }; // end if
            }; // end if
            
            // draw subSteps
            if (templateToEdit.arrSteps[i].arrSubSteps.length > 0)
            {
                var arrIndexStart = [];
                arrIndexStart.push(i);
                sTreeFieldTemplateHTML += displaySubSteps(templateToEdit.arrSteps[i].arrSubSteps, arrIndexStart);
            }; // end if
            
            sTreeFieldTemplateHTML += "</div>";
        }; // end for
        sTreeFieldTemplateHTML += "<button id='buttonCheckStep" + i + "\' class='buttonCheckStep'></button>" +
                                      "<button class='buttonStepNew' id='buttonStepNew'>** new step **</button>" +
                                      "<br>";
        sTreeFieldTemplateHTML += "<hr/>";
        sTreeFieldTemplateHTML += "<input id='buttonMoveUp' class='buttonMove' type='image' src='icons/arrow-up.png' style='position:fixed; right:70px; top:" + (screen.height/2 - 97) + "px'/>";
        sTreeFieldTemplateHTML += "<input id='buttonInsertSub' class='buttonMove' type='image' src='icons/insert-sub.png' style='position:fixed; right:70px; top:" + (screen.height/2 - 30) + "px'/>";
        sTreeFieldTemplateHTML += "<input id='buttonInsert' class='buttonMove' type='image' src='icons/insert.png' style='position:fixed; right:70px; top:" + (screen.height/2 + 30) + "px'/>";
        sTreeFieldTemplateHTML += "<input id='buttonMoveDown' class='buttonMove' type='image' src='icons/arrow-down.png' style='position:fixed; right:70px; top:" + (screen.height/2 + 97) + "px'/>";
        sTreeFieldTemplateHTML += "<input id='buttonMoveRight' class='buttonMove' type='image' src='icons/arrow-right.png' style='position:fixed; right:5px; top:" + screen.height/2 + "px'/>";
        sTreeFieldTemplateHTML += "<input id='buttonMoveLeft' class='buttonMove' type='image' src='icons/arrow-left.png' style='position:fixed; right:135px; top:" + screen.height/2 + "px'/>";
        sTreeFieldTemplateHTML += "<button id='buttonDelete2' style='position:fixed; right:5px; bottom:5px'>Delete</button>";        
        $('#treefieldTemplate').html(sTreeFieldTemplateHTML);
        
        console.log("screenTemplateDetail.displayScreen : HTML loaded");
        
        // start: initialize field values
        $('#fieldDescription').val(templateToEdit.sDescription);
        
        $('.buttonMove').hide();
        $('#buttonDelete2').hide();
    }; // end this.displayScreen()
    
    this.startEventListeners = function ()
    {
        function clickButtonBack(eventClick)
        {
            if ($('#fieldDescription').val().length > 0)
            {
                templateToEdit.sDescription = $('#fieldDescription').val();
                var iScreenWidth = screen.width;
                $('#divScreenTemplateDetail').css('position', 'relative');
                $('#divScreenTemplateDetail').animate({"left" : ("+=" + iScreenWidth)}, 500, 'swing',
                                                 function()
                                                 {
                                                    $('#divScreenTemplateDetail').remove();
                                                    clearEventListeners();
                                                    
                                                    // write templateToEdit to database
                                                    dbChecklistOpen.updateTemplate(templateToEdit);
                                                    
                                                    screenTemplates.displayScreen();
                                                    screenTemplates.startEventListeners();
                                                 });
            } // end if string length > 0
            else
            {
                alert('A Description must be entered in order to close this template.');
            }; // end else
        }; // end clickButtonBack()
        
        function clickButtonDelete(eventClick)
        {
            if (confirm("Delete selected step?"))
            {                                    
                // delete oTask from database
                dbChecklistOpen.deleteStep(stepToEdit);            
                
                // remove oTask from templateToEdit.arrSteps
                var arrStepTreeLevel = findStepTreeLevel(templateToEdit.arrSteps, stepToEdit);
                arrStepTreeLevel.splice(arrStepFocused[arrStepFocused.length-1], 1);
                arrStepFocused = [];
                screenTemplateDetailThis.displayScreen();
                screenTemplateDetailThis.startEventListeners();                
            }; // end confirm
        }; // end clickButtonDelete
        
        function clickButtonInsert(eventClick)
        {
            newStep(stepToEdit.iOrder + 1);
        }; // end clickButtonInsert()
        
        function clickButtonInsertSub(eventClick)
        {
            newStep(1, true);
        }; // end clickButtonInsertSub()
        
        function clickButtonMoveDown (eventClick)
        {
            var arrTreeLevelMovement = findStepTreeLevel(templateToEdit.arrSteps, stepToEdit);
            
            // check if there is a step below the current one
            if (arrStepFocused[arrStepFocused.length-1] < (arrTreeLevelMovement.length-1))
            {
                // if incrementing the current step iOrder will cause it to conflict
                // with the iOrder of the next step, then swap the two steps
                var stepNext = findStepInTree(arrTreeLevelMovement, stepToEdit.iNextStepID);
                if (stepToEdit.iOrder + 1 == stepNext.iOrder)
                {
                    // swap the iOrder numbers on both steps
                    var iOrderSwap = stepToEdit.iOrder;
                    stepToEdit.iOrder = stepNext.iOrder;
                    stepNext.iOrder = iOrderSwap;
                    
                    // swap the two steps in the array
                    var stepSwap = stepToEdit;
                    arrTreeLevelMovement.splice(arrStepFocused[arrStepFocused.length-1], 1);
                    arrTreeLevelMovement.splice((arrStepFocused[arrStepFocused.length-1]+1), 0, stepSwap);
                                       
                    // start: swap the two steps on the screen
                    var DOMDiv1ID = $("#divStep" + generateIDSuffix(arrStepFocused));
                    var arrModifyArrStepFocused = arrStepFocused.slice(0);
                    arrModifyArrStepFocused[arrModifyArrStepFocused.length-1]++;
                    var DOMDiv2ID = $("#divStep" + generateIDSuffix(arrModifyArrStepFocused));
                    
                    DOMDiv2ID.animate({"top" : ("-=" + DOMDiv1ID.outerHeight(true))}, 500, 'swing',
                        function ()
                        {
                        });
                    DOMDiv1ID.animate({"top" : ("+=" + DOMDiv2ID.outerHeight(true))}, 500, 'swing',
                        function ()
                        {                
                            // refresh the display
                            screenTemplateDetailThis.displayScreen(stepToEdit);
                            screenTemplateDetailThis.startEventListeners();
                        });                    
                    // end: swap the two steps on the screen
                    
                    // update the database
                    dbChecklistOpen.updateStep(stepNext);
                    dbChecklistOpen.updateStep(stepToEdit);                    
                } // end if
                else
                {
                    stepToEdit.iOrder++;
                    // update the screen
                    $("#"+sDOMStepClicked).html(stepToEdit.iOrder + " : " + stepToEdit.sDescription);
                    // update the database
                    dbChecklistOpen.updateStep(stepToEdit);
                } // end else
            } // end if
            else // the step is the lowest one on the list
            {
                stepToEdit.iOrder++;
                // update the screen
                $("#"+sDOMStepClicked).html(stepToEdit.iOrder + " : " + stepToEdit.sDescription);
                // update the database
                dbChecklistOpen.updateStep(stepToEdit);
            }; // end else            
        }; // end clickButtonMoveDown()
        
        function clickButtonMoveLeft (eventClick)
        {                    
            // the Step can only be moved to the left if it is a subStep
            if (arrStepFocused.length > 1)
            {
                // find the array of Steps and subSteps that need to be edited
                var arrStepsNewLevel = templateToEdit.arrSteps;
                var iIndexOldParent = arrStepFocused[0];
                var stepOldParent = templateToEdit.arrSteps[iIndexOldParent];
                stepToEdit.iParentStepID = -1;
                stepToEdit.iOrder = stepOldParent.iOrder + 1;
                for (var i = 1; i < (arrStepFocused.length - 1); i++)
                {
                    stepToEdit.iParentStepID = arrStepsNewLevel[arrStepFocused[i-1]].iStepID;
                    arrStepsNewLevel = arrStepsNewLevel[arrStepFocused[i-1]].arrSubSteps;
                    iIndexOldParent = arrStepFocused[i];
                    stepOldParent = arrStepsNewLevel[iIndexOldParent];
                    stepToEdit.iOrder = stepOldParent.iOrder + 1;
                }; // end for
                
                // move the Step from its current array to the same array as the parentStep
                arrStepsNewLevel.splice(iIndexOldParent+1,0,stepToEdit);
                arrStepsNewLevel[iIndexOldParent].arrSubSteps.splice(arrStepFocused[arrStepFocused.length-1],1);
                
                resolveStepConflicts(arrStepsNewLevel, stepToEdit);
                
                // animate the shift left on the screen
                var DOMDiv1ID = $("#divStep" + generateIDSuffix(arrStepFocused));
                DOMDiv1ID.animate({"left" : ("-=" + iSubStepIndent + "px")}, 250, 'swing',
                function ()
                {                
                    // refresh the display
                    screenTemplateDetailThis.displayScreen(stepToEdit);
                    screenTemplateDetailThis.startEventListeners();
                });
                
                // update the database
                dbChecklistOpen.updateStep(stepToEdit);
            }; // end if
        }; // end clickButtonMoveLeft()
        
        function clickButtonMoveRight(eventClick)
        {
            // the Step can only be moved to the right if it has a sibling Step above it
            if (stepToEdit.iPrevStepID > -1)
            {                
                // find the array of Steps and subSteps that need to be edited
                var arrStepsToEdit = templateToEdit.arrSteps;
                for (var i = 1; i < arrStepFocused.length; i++)
                {
                    arrStepsToEdit = arrStepsToEdit[arrStepFocused[i-1]].arrSubSteps;
                }; // end for
                var arrSubStepsToEdit = arrStepsToEdit[arrStepFocused[arrStepFocused.length-1]-1].arrSubSteps;
                
                // adjust the parameters of the stepToEdit
                stepToEdit.iParentStepID = stepToEdit.iPrevStepID;
                if (arrSubStepsToEdit.length > 0)
                {
                    stepToEdit.iOrder = arrSubStepsToEdit[arrSubStepsToEdit.length-1].iOrder + 1;
                    stepToEdit.iPrevStepID = arrSubStepsToEdit[arrSubStepsToEdit.length-1].iStepID;
                    stepToEdit.iNextStepID = -1;
                }
                else
                {
                    stepToEdit.iOrder = 1;
                    stepToEdit.iPrevStepID = -1;
                    stepToEdit.iNextStepID = -1;
                }
                
                // move the Step from its current array to the subStep array of the parentStep
                arrSubStepsToEdit.push(stepToEdit);
                arrStepsToEdit.splice(arrStepFocused[arrStepFocused.length-1],1);
                
                // animate the shift right on the screen
                var DOMDiv1ID = $("#divStep" + generateIDSuffix(arrStepFocused));
                DOMDiv1ID.animate({"left" : ("+=" + iSubStepIndent + "px")}, 250, 'swing',
                function ()
                {                
                    // refresh the display
                    screenTemplateDetailThis.displayScreen(stepToEdit);
                    screenTemplateDetailThis.startEventListeners();
                });
                
                // update the database
                dbChecklistOpen.updateStep(stepToEdit);
            }; // end if
        }; // end clickButtonMoveRight()
        
        function clickButtonMoveUp(eventClick)
        {
            var arrTreeLevelMovement = findStepTreeLevel(templateToEdit.arrSteps, stepToEdit);
            
            // check if iOrder is already the minimum value
            if (stepToEdit.iOrder > 1)
            {
                // search to see if there are any steps displayed above the current one
                if (arrStepFocused[arrStepFocused.length-1] > 0) // check if there are any steps above this selected one
                {
                    var stepPrev = findStepInTree(arrTreeLevelMovement, stepToEdit.iPrevStepID);
                    // check if the previous step is directly above the selected one
                    if (stepToEdit.iOrder == stepPrev.iOrder + 1)
                    {
                        // swap the two Steps
                        
                        // swap the iOrder number of both steps
                        var iOrderSwap = stepToEdit.iOrder;
                        stepToEdit.iOrder = stepPrev.iOrder;
                        stepPrev.iOrder = iOrderSwap;                        
                        
                        // swap the two steps in the array
                        var stepSwap = stepToEdit;
                        arrTreeLevelMovement.splice(arrStepFocused[arrStepFocused.length-1], 1);
                        arrTreeLevelMovement.splice((arrStepFocused[arrStepFocused.length-1]-1), 0, stepSwap);
                        
                        // start: swap the two steps on the screen
                        var DOMDiv1ID = $("#divStep" + generateIDSuffix(arrStepFocused));
                        var arrModifyArrStepFocused = arrStepFocused.slice(0);
                        arrModifyArrStepFocused[arrModifyArrStepFocused.length-1]--;
                        var DOMDiv2ID = $("#divStep" + generateIDSuffix(arrModifyArrStepFocused));
                        
                        DOMDiv2ID.animate({"top" : ("+=" + DOMDiv1ID.outerHeight(true))}, 500, 'swing',
                        function ()
                        {
                        });
                        DOMDiv1ID.animate({"top" : ("-=" + DOMDiv2ID.outerHeight(true))}, 500, 'swing',
                        function ()
                        {
                            // refresh the display
                            screenTemplateDetailThis.displayScreen(stepToEdit);
                            screenTemplateDetailThis.startEventListeners();
                        });
                        
                        // update the database
                        dbChecklistOpen.updateStep(stepToEdit);
                        dbChecklistOpen.updateStep(stepPrev);
                    } // end if
                    else
                    {
                        stepToEdit.iOrder--;
                        // update the screen
                        $("#"+sDOMStepClicked).html(stepToEdit.iOrder + " : " + stepToEdit.sDescription);
                    }; // end else
                } // end if
                else
                {
                    stepToEdit.iOrder--;
                    // update the screen
                    $("#"+sDOMStepClicked).html(stepToEdit.iOrder + " : " + stepToEdit.sDescription);
                }; // end else
            }; // end if
        }; // end clickButtonMoveUp()
        
        function clickButtonStep(eventClick)
        {
            eventClick.preventDefault();
            
            // determine which Step was clicked
            // get path through the Step tree
            sDOMStepClicked = eventClick.currentTarget.getAttribute("id",0);
            var arrStepClicked = sDOMStepClicked.substr(10).split("_");
            for (var i = 0; i < arrStepClicked.length; i++)
            {
                arrStepClicked[i] = parseInt(arrStepClicked[i]);
            }; // end for
            
            // check if the user clicked on the same Step twice in a row
            var bSecondClickOnStep = true;
            if (arrStepClicked.length == arrStepFocused.length)
            {
                for (var i = 0; i < arrStepClicked.length; i++)
                {
                    if (arrStepClicked[i] != arrStepFocused[i])
                    {
                        bSecondClickOnStep = false;
                    }; // end if
                }; // end for
            }
            else
            {
                bSecondClickOnStep = false;
            }; // end if
            
            if (bSecondClickOnStep)
            {
                // clear arrStepFocused flag
                arrStepFocused = [];
                
                // clear screenTemplateDetails
                $('#divScreenTemplateDetail').remove();
                clearEventListeners();

                // show screenStep
                var screenStepNew = new screenStep(stepToEdit, screenTemplateDetailThis, templateToEdit);
                screenStepNew.displayScreen();
                screenStepNew.startEventListeners();                
            } // end if
            else
            {
                arrStepFocused = arrStepClicked;
                stepToEdit = traverseStepTree(templateToEdit.arrSteps, arrStepClicked);
                
                // clear bold text from previous selections
                $('.buttonStep').css("border-width", "1px");
                // clear up/down buttons from previous selections
                $('.buttonMove').hide();
                
                // bold the selected Template
                var sStepDOMId = "#" + eventClick.currentTarget.getAttribute("id",0);
                $(sStepDOMId).css("border-width", "3px");
                                            
                $('.buttonMove').css({opacity : 0.0});
                $('.buttonMove').show();
                $('.buttonMove').fadeTo(500, 1.0);                
                $('#buttonDelete2').show();                
            }; // end else
        }; // end click ButtonStep
        
        function clickButtonStepNew(eventClick)
        {
            if (templateToEdit.arrSteps.length > 0)
            {
                newStep(templateToEdit.arrSteps[templateToEdit.arrSteps.length - 1].iOrder + 1);
            } // end if
            else
            {
                newStep(1);
            }; // end else
        }; // end clickButtonStepNew()
        
        $(document).unbind();
        $(document).click(function(evt)
            {
                console.log("screenTemplateDetail : event document click");
                if ((evt.target.id.substr(0,10) != "buttonStep") && (evt.target.className != "buttonMove") && (arrStepFocused.length > 0))
                {
                    $('.buttonStep').css("border-width", "1px");
                    $('.buttonMove').fadeTo(250, 0.0,
                                           function ()
                                           {
                                                $('.buttonMove').hide();
                                           });
                    
                    stepToEdit = null;
                    arrStepFocused = [];
                    $('#buttonDelete2').hide();
                }; // end if
            }); // end .click
        $('#fieldDescription').blur(function (evt)
            {
                console.log("screenTemplateDetail : event fieldDescription blur");
                // save value of Template Description
                templateToEdit.sDescription = $('#fieldDescription').val();
                dbChecklistOpen.updateTemplate(templateToEdit);
            }); // end .blur
        $('.buttonStep').click(function (evt)
            {
                console.log("screenTemplateDetail : event clickButtonStep");
                clickButtonStep(evt);
            }); // end .click bind        
        $('#buttonStepNew').unbind();
        $('#buttonStepNew').click(function (evt)
        {
            console.log("screenTemplateDetail : event clickButtonStepNew");
            clickButtonStepNew(evt);            
        }); // end #buttonStepNew.click
        $('#buttonBack').unbind();
        $('#buttonBack').click(function (evt)
        {
            console.log("screenTemplateDetail : event clickButtonBackTemplateDetail");
            clickButtonBack(evt);
        });        
        $('.buttonMove').unbind();
        $('#buttonMoveUp').click(function (evt)
            {
                console.log("screenTemplateDetail : event clickButtonMoveUp");
                clickButtonMoveUp(evt);
            }); // end #buttonMoveUp.click()
        $('#buttonMoveDown').click(function (evt)
            {
                console.log("screenTemplateDetail : event clickButtonMoveDown");
                clickButtonMoveDown(evt);
            }); // end #buttonMoveDown.click()
        $('#buttonMoveLeft').click(function (evt)
            {
                console.log("screenTemplateDetail : event clickButtonMoveLeft");
                clickButtonMoveLeft(evt);
            }); // end #buttonMoveLeft.click()
        $('#buttonMoveRight').click(function (evt)
        {
            console.log("screenTemplateDetail : event clickButtonMoveRight");
            clickButtonMoveRight(evt);
        }); // end #buttonMoveRight.click()
        $('#buttonInsertSub').click(function (evt)
            {
                console.log("screenTemplateDetail : event clickButtonInsertSub");
                clickButtonInsertSub(evt);
            }); // end #buttonInsertSub.click()
        $('#buttonInsert').click(function (evt)
            {
                console.log("screenTemplateDetail : event clickButtonInsert");
                clickButtonInsert(evt);
            }); // end #buttonInsert.click()
        $('#buttonDelete2').click(function (evt)
            {
                console.log("screenTemplateDetail : event clickButtonDelete");
                clickButtonDelete(evt);
            });
        
        if (sDOMActiveStep.length > 0)
        {
            if (($(sDOMActiveStep).offset().top < $(document).scrollTop()) ||
                ($(sDOMActiveStep).offset().top + $(sDOMActiveStep).height() > $(document).scrollTop() + screen.height))
            {
                console.log("screenTemplateDetail : scroll statement issued");
                scroll(0, $(sDOMActiveStep).offset().top - (screen.height / 2));
                console.log("screenTemplateDetail : scroll complete");
            }; // end if
        }; // end if
        
        if (templateToEdit.sDescription.length == 0)
        {
            setTimeout(function ()
            {
                console.log("screenTemplate : fieldDescription focus called");
                $('#fieldDescription').focus();
            },
            200);
        }; // end if
        
        // if an active Step was passed when drawing the screen, enable that Step again
        if (sDOMActiveStep.length > 0)
        {
            setTimeout(function ()
            {
                $(sDOMActiveStep).click();
            },
            200);
        }
    }; // end this.startEventListeners()
}; // end screenTemplateDetail()