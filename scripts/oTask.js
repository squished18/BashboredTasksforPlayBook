function oTask()
{
    var dDueDate = new Date(0);
    
    this.iParentTaskID = -1; // default value of -1 signifies it is a root node
    this.iTaskID = -1; // default value of -1 signifies a TaskID has not been assigned
    this.iPrevTaskID = -1;
    this.iNextTaskID = -1;
    this.iOrder = -1; // default value of -1 signifies an Order has not been assigned
    this.sDescription = "";    
    this.dCompleted = new Date(0);
    this.arrSubTasks = [];
    
    this.getDueDate = function()
    {
        return dDueDate.getTime();
    }; // end this.getDueDate()
    
    // iNewDueDate is the new due date in milliseconds past Jan 1, 1970
    this.setDueDate = function(iNewDueDate)
    {
        dDueDate.setTime(iNewDueDate);
    }; // end this.setDueDate()
};

function findTaskIndex(arrTasks, iTaskIDToFind)
{
    var iCounter = 0;
    var bFound = false;
    while ((bFound == false) && (iCounter < arrTasks.length))
    {
        if (arrTasks[iCounter].iTaskID == iTaskIDToFind)
        {
            bFound = true;
        }; // end if
        iCounter++;
    }; // end while
    
    if (bFound == true)
    {
        return (iCounter - 1);
    }
    else
    {
        return -1;
    }
    
    return -1;
}; // end findTaskIndex()

function markParentsNotComplete(checklistToEdit, taskChild)
{
    var taskParentToCheck = findTaskInTree(checklistToEdit.arrTasks, taskChild.iParentTaskID);
    
    taskParentToCheck.dCompleted.setTime(0);
    dbChecklistOpen.updateTask(taskParentToCheck);
    
    if (taskParentToCheck.iParentTaskID > -1)
    {
        markParentsNotComplete(checklistToEdit, taskParentToCheck);
    }; // end if
}; // end markParentsNotComplete()
            
function markSubTasksComplete(arrSubTasks)
{
    for (var i = 0; i < arrSubTasks.length; i++)
    {
        // mark all subTasks of subTasks as completed
        if (arrSubTasks[i].arrSubTasks.length > 0)
        {
            markSubTasksComplete(arrSubTasks[i].arrSubTasks);
        }; // end if
        
        if (arrSubTasks[i].dCompleted.getTime() == 0)
        {
            arrSubTasks[i].dCompleted = new Date();
            dbChecklistOpen.updateTask(arrSubTasks[i]);
        }; // end if                    
    }; // end for
}; // end markSubTasksComplete()
