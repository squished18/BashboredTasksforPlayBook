var menuChecklist = new function()
{
    this.hideMenuBar = function()
    {
        blackberry.app.event.onSwipeDown(menuChecklist.showMenuBar);
        document.removeEventListener("click", menuChecklist.hideMenuBar, false);
        $('#menuChecklist').animate({top : -100}, {queue : false});
    }; // end hideMenuBar()
    
    this.showMenuBar = function()
    {
        console.log("showMenuBar called");
        blackberry.app.event.onSwipeDown(menuChecklist.hideMenuBar);
        document.addEventListener("click", menuChecklist.hideMenuBar, false);
        $('#menuChecklist').animate({top : 0}, {queue : false});
    }; // end showMenuBar()
    
    this.archiveCompleted = function(checklistToArchive, screenChecklistThis)
    {
        function archiveCompletedSubTasks(arrTasksLevel, arrParentTaskDescriptions)
        {
            var i = 0;
            while (i < arrTasksLevel.length)
            {
                // archive completed subTasks
                if (arrTasksLevel[i].arrSubTasks.length > 0)
                {
                    arrNextParentTaskDescriptions = arrParentTaskDescriptions.slice(0);
                    arrNextParentTaskDescriptions.push(arrTasksLevel[i].sDescription);
                    archiveCompletedSubTasks(arrTasksLevel[i].arrSubTasks, arrNextParentTaskDescriptions);
                }; // end if
                
                if (arrTasksLevel[i].dCompleted.getTime() > 0)
                {
                    // remove Task from database
                    dbChecklistOpen.deleteTask(arrTasksLevel[i]);
                    
                    var archiveNew = new oArchive();
                    archiveNew.iChecklistID = checklistToArchive.iChecklistID;
                    archiveNew.dCompleted = arrTasksLevel[i].dCompleted;
                    for (j in arrParentTaskDescriptions)
                    {
                        archiveNew.sEntry += arrParentTaskDescriptions[j] + " >> ";
                    }
                    archiveNew.sEntry += arrTasksLevel[i].sDescription;
                    
                    checklistToArchive.arrArchive.push(archiveNew);
                    arrTasksLevel.splice(i,1);
                    
                    // add Archive to database
                    dbChecklistOpen.addArchive(archiveNew);     
                }
                else
                {
                    i++;
                }; // end if-else                
            }; // end while
        }; // end archiveCompletedSubTasks
        
        function compressOrderSubTasks(arrSubTasksToCompress)
        {
            for (var i = 0; i < arrSubTasksToCompress.length; i++)
            {
                arrSubTasksToCompress[i].iOrder = i + 1;
                dbChecklistOpen.updateTask(arrSubTasksToCompress[i]);
                
                if (arrSubTasksToCompress[i].arrSubTasks.length > 0)
                {
                    compressOrderSubTasks(arrSubTasksToCompress[i].arrSubTasks);
                }; // end if
            }; // end for
        }; // end compressOrderSubTasks
        
        // move all completed Tasks to Archive
        var i = 0;
        while (i < checklistToArchive.arrTasks.length)
        {
            // archive completed subTasks
            if (checklistToArchive.arrTasks[i].arrSubTasks.length > 0)
            {
                archiveCompletedSubTasks(checklistToArchive.arrTasks[i].arrSubTasks, [checklistToArchive.arrTasks[i].sDescription]);
            }; // end if
            
            if (checklistToArchive.arrTasks[i].dCompleted.getTime() > 0)
            {
                // remove Task from database
                dbChecklistOpen.deleteTask(checklistToArchive.arrTasks[i]);
                
                var archiveNew = new oArchive();
                archiveNew.iChecklistID = checklistToArchive.iChecklistID;
                archiveNew.dCompleted = checklistToArchive.arrTasks[i].dCompleted;
                archiveNew.sEntry = checklistToArchive.arrTasks[i].sDescription;
                
                checklistToArchive.arrArchive.push(archiveNew);
                checklistToArchive.arrTasks.splice(i,1);
                
                // add Archive to database
                dbChecklistOpen.addArchive(archiveNew);                            
            }
            else
            {
                i++;
            };
        }; // end while
        
        // clear current screenChecklist
        checklistToArchive.sDescription = $('#fieldDescription').val();
        $('#divScreenChecklist').remove();
        
        // compress the Order numbers of all the tasks
        for (var i = 0; i < checklistToArchive.arrTasks.length; i++)
        {
            checklistToArchive.arrTasks[i].iOrder = i + 1;
            dbChecklistOpen.updateTask(checklistToArchive.arrTasks[i]);
            
            if (checklistToArchive.arrTasks[i].arrSubTasks.length > 0)
            {
                compressOrderSubTasks(checklistToArchive.arrTasks[i].arrSubTasks);
            }; // end if
        }; // end for
        
        // re-draw screenChecklist
        var screenChecklistNew = new screenChecklist(checklistToArchive, screenMainInstance, dbChecklistOpen);
        screenChecklistNew.displayScreen();
        screenChecklistNew.startEventListeners();        
    }; // end archiveCompleted()
    
    this.createTemplate = function(checklistToReplicate)
    {
        function createSubSteps(arrSubTasks, arrSubSteps, iParentStepID, templateNew)
        {
            for (var i = 0 ; i < arrSubTasks.length; i++)
            {
                var stepNew = new oStep();
                stepNew.iStepID = iNextStepID;
                iNextStepID++;
                stepNew.sDescription = arrSubTasks[i].sDescription.concat("");
                stepNew.iOrder = arrSubTasks[i].iOrder;
                stepNew.iParentStepID = iParentStepID;
                if (i > 0)
                {
                    stepNew.iPrevStepID = arrSubSteps[i-1].iStepID;                    
                    if (i < arrSubTasks.length - 1)
                    {
                        arrSubSteps[i-1].iNextStepID = stepNew.iStepID;
                    }; // end if
                }; // end if
                
                // add new Step to data structure and database
                arrSubSteps.push(stepNew);
                dbChecklistOpen.addStep(templateNew, stepNew);
                
                if (arrSubTasks[i].arrSubTasks.length > 0)
                {
                    createSubSteps(arrSubTasks[i].arrSubTasks, arrSubSteps[i].arrSubSteps, arrSubSteps[i].iStepID, templateNew);
                }; // end if
            }; // end for
        }; // end createSubSteps()
        
        // search if there is already a Template with the same sDescription as the sDescription of
        // the Checklist being replicated
        var bDuplicateTemplate = false;
        var indexDuplicateTemplate = -1;
        var bOverwriteTemplate = true;
        for (var i = 0; i < arrTemplates.length; i++)
        {
            if (arrTemplates[i].sDescription == checklistToReplicate.sDescription)
            {
                bDuplicateTemplate = true;
                bOverwriteTemplate = false;
                indexDuplicateTemplate = i;
            }; // end if
        }; // end if
        if (bDuplicateTemplate)
        {
            blackberry.ui.dialog.standardAskAsync("A Template with the same Description already exists. Would you like to overwrite it?",
                                                  blackberry.ui.dialog.D_YES_NO,
                                                  function(indexSelected)
                                                  {
                                                    if (indexSelected == 0) // answer is 'yes'
                                                    {
                                                        bOverwriteTemplate = true;
                                                    }; // end if
                                                  },
                                                  {
                                                    title : "Duplicate Template exists",
                                                    size : blackberry.ui.dialog.SIZE_SMALL,
                                                    position : blackberry.ui.dialog.CENTER
                                                  });
        }; // end if
        if (bOverwriteTemplate)
        {
            // if there is a Template to overwrite, delete it from the data structure and
            // from the database
            if (bDuplicateTemplate)
            {
                dbChecklistOpen.deleteTemplate(arrTemplates[indexDuplicateTemplate]);
                arrTemplates.splice(indexDuplicateTemplate, 1);                
            };
            
            // create the new Template
            var templateNew = new oTemplate();
            templateNew.iTemplateID = iNextTemplateID;
            iNextTemplateID++;
            templateNew.sDescription = checklistToReplicate.getDescription();
            // replicate root-level Tasks into Steps
            for (var i = 0; i < checklistToReplicate.arrTasks.length; i++)
            {
                var stepNew = new oStep();
                stepNew.iStepID = iNextStepID;
                iNextStepID++;
                stepNew.sDescription = checklistToReplicate.arrTasks[i].sDescription.concat("");
                stepNew.iOrder = checklistToReplicate.arrTasks[i].iOrder;
                stepNew.iParentStepID = -1; // root node
                if (i > 0)
                {
                    stepNew.iPrevStepID = templateNew.arrSteps[i-1].iStepID;
                    if (i < checklistToReplicate.arrTasks.length - 1)
                    {
                        templateNew.arrSteps[i-1].iNextStepID = stepNew.iStepID;
                    }; // end if
                }; // end if
                
                // add new Step to the data structure and database
                templateNew.arrSteps.push(stepNew);
                dbChecklistOpen.addStep(templateNew, stepNew);
                
                // replicate subTasks into subSteps
                if (checklistToReplicate.arrTasks[i].arrSubTasks.length > 0)
                {
                    createSubSteps(checklistToReplicate.arrTasks[i].arrSubTasks,
                                   templateNew.arrSteps[i].arrSubSteps,
                                   templateNew.arrSteps[i].iStepID,
                                   templateNew);
                }; // end if                
            }; // end for
            
            dbChecklistOpen.addTemplate(templateNew);
            arrTemplates.push(templateNew);
            
            alert('New template created.');
        }; // end if
    }; // end this.createTemplate()
    
    this.exportHTML = function(checklistToExport)
    {
        var iSubTaskIndent = 20;
        
        var bFileAlreadyExists = false;
        var bOverwriteFile = false;
        // check if an export file with the same name already exists
        if (blackberry.io.file.exists(sFilePath + "/export-" + checklistToExport.getDescription() + ".html"))
        {
            bFileAlreadyExists = true;
        }; // end if
        
        // confirm to overwrite file
        if (bFileAlreadyExists)
        {
            if (confirm("An export file already exists. Overwrite?"))
            {
                bOverwriteFile = true;
            }; // end if
        };
        
        if (!(bFileAlreadyExists) || (bFileAlreadyExsits && bOverwriteFile))
        {
            function exportSubTasksHTML(arrSubTasks, iLevel)
            {
                var sExportReturn = "";
                
                for (var j in arrSubTasks)
                {
                    sExportReturn += "  <label style='padding-left:" + iLevel*iSubTaskIndent + "px'>" + "[  ] " + arrSubTasks[j].sDescription + "<label><br>\n";
                    if (arrSubTasks[j].arrSubTasks.length > 0)
                    {
                        sExportReturn = exportSubTasksHTML(arrSubTasks[j].arrSubTasks, iLevel+1);
                    }; // end if
                }; // end for
                
                return sExportReturn;
            }; // end exportSubTasksHTML
            
            var sExportHTML = "<!DOCTYPE html>\n\n";
            
            sExportHTML += "<html>\n";
            sExportHTML += "<head>\n";
            sExportHTML += "    <title>" + checklistToExport.getDescription() + "</title>\n";
            sExportHTML += "</head>\n\n";
            
            sExportHTML += "<body>\n";
            sExportHTML += "    <label>" + "Checklist: " + checklistToExport.getDescription() + "</label><br><br>\n";
            
            for (i in checklistToExport.arrTasks)
            {
                sExportHTML += "    <label>" + "[  ] " + checklistToExport.arrTasks[i].sDescription + "</label><br>\n";
                if (checklistToExport.arrTasks[i].arrSubTasks.length > 0)
                {
                    sExportHTML += exportSubTasksHTML(checklistToExport.arrTasks[i].arrSubTasks, 1);
                }; // end if
            }; // end for
            
            sExportHTML += "<br>\n";
            
            for (i in checklistToExport.arrArchive)
            {
                sExportHTML += "    <label>" + checklistToExport.arrArchive[i].dCompleted.toLocaleDateString() + " : " +
                                checklistToExport.arrArchive[i].sEntry + "<br>\n";
            }; // end for
            
            sExportHTML += "</body>\n";
            sExportHTML += "</html>\n";
            
            var blobWrite = blackberry.utils.stringToBlob(sExportHTML);
            blackberry.io.file.saveFile(sFilePath + "/export-" + checklistToExport.getDescription() + ".html", blobWrite);
            
            alert('Export to HTML completed.');
        }; // end if
    }; // end this.exportHTML()
}; // end menuChecklist