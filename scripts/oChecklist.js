function oChecklist(bReadFromDatabase)
{
    var checklistThis = this;
    this.iChecklistID = -1;
    var sDescription = "";
    this.arrTasks = [];
    this.arrArchive = [];
    
    if (!(bReadFromDatabase == true))
    {
        dbChecklistOpen.addChecklist(checklistThis);
    }
    
    this.createFromTemplate = function(templatePass, sDescriptionPass)
    {
        function createSubTasks(arrSubTasks, arrSubSteps, iParentTaskID)
        {
            for (var i = 0; i < arrSubSteps.length; i++)
            {
                var taskNew = new oTask();
                taskNew.iTaskID = iNextTaskID;
                iNextTaskID++;
                taskNew.iParentTaskID = iParentTaskID;
                if (i > 0)
                {
                    taskNew.iPrevTaskID = arrSubTasks[i-1].iTaskID;
                    if (i < arrSubSteps.length - 1)
                    {
                        arrSubTasks[i-1].iNextTaskID = taskNew.iTaskID;
                        dbChecklistOpen.updateTask(arrSubTasks[i-1]);
                    }; // end if
                }; // end if                
                taskNew.iOrder = arrSubSteps[i].iOrder;
                taskNew.sDescription = arrSubSteps[i].sDescription;
                
                arrSubTasks.push(taskNew);
                dbChecklistOpen.addTask(checklistThis, taskNew);
                
                if (arrSubSteps[i].arrSubSteps.length > 0)
                {
                    createSubTasks(taskNew.arrSubTasks, arrSubSteps[i].arrSubSteps, taskNew.iTaskID);
                }; // end if
            }; // end for
        }; // end createSubTasks
        
        sDescription = sDescriptionPass.concat("");
        
        // parse through all Steps in the Template and create a new Task from each Step
        for (var i = 0; i < templatePass.arrSteps.length; i++)
        {
            var taskNew = new oTask();
            taskNew.iTaskID = iNextTaskID;
            iNextTaskID++;            
            if (i > 0)
            {
                taskNew.iPrevTaskID = checklistThis.arrTasks[i-1].iTaskID;
                if (i < templatePass.arrSteps.length - 1)
                {
                    checklistThis.arrTasks[i-1].iNextTaskID = taskNew.iTaskID;
                    dbChecklistOpen.updateTask(checklistThis.arrTasks[i-1]);
                }; // end if
            }; // end if
            taskNew.iOrder = templatePass.arrSteps[i].iOrder;
            taskNew.sDescription = templatePass.arrSteps[i].sDescription.concat("");
            
            checklistThis.arrTasks.push(taskNew);
            dbChecklistOpen.addTask(checklistThis, taskNew);
            
            if (templatePass.arrSteps[i].arrSubSteps.length > 0)
            {
                createSubTasks(taskNew.arrSubTasks, templatePass.arrSteps[i].arrSubSteps, taskNew.iTaskID);
            }; // end if
        }; // end for
        
        dbChecklistOpen.updateChecklist(checklistThis);
    }; // end this.createFromTemplate
    
    this.getDescription = function()
    {
        return sDescription.concat("");
    }; // end this.getDescription
    
    this.setDescription = function(sNewDescription)
    {
        sDescription = sNewDescription.concat("");
        dbChecklistOpen.updateChecklist(checklistThis);
    };
}; // end oChecklist()

// returns the array of tasks at the level of the Task to find (i.e. siblings and itself)
function findArrTreeLevel(arrTaskTree, taskToFind)
{
    var arrReturn = null;
    
    if (taskToFind == null)
    {
        return null;
    }
    else
    {
        if (taskToFind.iParentTaskID > -1)
        {
            return findTaskInTree(arrTaskTree, taskToFind.iParentTaskID).arrSubTasks;
        }
        else
        {
            return arrTaskTree;
        }; // end if-else
    }; // end if-else
    
    return null;
}; // end findArrTreeLevel

function findChecklistIndex(iChecklistIDToFind)
{
    var iCounter = 0;
    var bFound = false;
    while ((bFound == false) && (iCounter < arrChecklists.length))
    {
        if (arrChecklists[iCounter].iChecklistID == iChecklistIDToFind)
        {
            bFound = true;
        } // end if
        iCounter++;
    }; // end while
    
    if (bFound == true)
    {
        return (iCounter - 1);
    }
    else
    {
        return -1;
    };
    
    return -1;
}; // end findChecklistIndex()

function findTaskInTree(arrTaskTree, iTaskIDToFind)
{
    var i = 0;
    var taskFound = null;
       
    while ((taskFound == null) && (i < arrTaskTree.length))
    {
        if (arrTaskTree[i].iTaskID == iTaskIDToFind)
        {
            taskFound = arrTaskTree[i];
        }
        else
        {
            taskFound = findTaskInTree(arrTaskTree[i].arrSubTasks, iTaskIDToFind);
        }; // end if-else
        i++;
    }; // end while
    
    if (taskFound == null)
    {
        return null;
    }
    else
    {
        return taskFound;
    }
    
    return null;
}; // end findTaskInTree()

function generateIDSuffix(arrIndexes)
{
    var sReturn = arrIndexes[0].toString();
    for (var i = 1; i < arrIndexes.length; i++)
    {
        sReturn += "_" + arrIndexes[i].toString();
    }; // end for
    return sReturn;
}; // end generateIDSuffix()

function resolveTaskConflicts(arrTreeLevelConflictSearch, taskAdded)
{
    var bConflictFound = true;
    var iSearchConflict1 = findTaskIndex(arrTreeLevelConflictSearch, taskAdded.iTaskID);
    var iSearchConflict2 = 0;
    
    // search repeatedly until no more conflicts found
    while (bConflictFound == true)
    {
        bConflictFound = false;
        iSearchConflict2 = 0;                    
        while ((!bConflictFound) && (iSearchConflict2 < arrTreeLevelConflictSearch.length))
        {
            if ((arrTreeLevelConflictSearch[iSearchConflict2].iOrder == arrTreeLevelConflictSearch[iSearchConflict1].iOrder) &&
                (arrTreeLevelConflictSearch[iSearchConflict2].iTaskID != arrTreeLevelConflictSearch[iSearchConflict1].iTaskID))
            {                        
                bConflictFound = true;
                arrTreeLevelConflictSearch[iSearchConflict2].iOrder++;
                dbChecklistOpen.updateTask(arrTreeLevelConflictSearch[iSearchConflict2]);
                iSearchConflict1 = iSearchConflict2;
            }
            iSearchConflict2++;
        };
    }; 
}; // end resolveTaskConflicts()

function traverseTaskTree(arrTaskTree, arrIndexes)
{
    var taskReturn = arrTaskTree[arrIndexes[0]];

    for (var i = 1; i < arrIndexes.length; i++)
    {
        taskReturn = taskReturn.arrSubTasks[arrIndexes[i]];
    }; // end for
    
    return taskReturn;
}; // end traverseTaskTree()