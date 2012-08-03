function oTemplate()
{
    this.iTemplateID = -1;
    this.sDescription = "";
    this.arrSteps = [];
}; // end oTemplate

function findStepInTree(arrStepTree, iStepIDToFind)
{
    var i = 0;
    var stepFound = null;
    
    while ((stepFound == null) && (i < arrStepTree.length))
    {
        if (arrStepTree[i].iStepID == iStepIDToFind)
        {
            stepFound = arrStepTree[i];
        }
        else
        {
            stepFound = findStepInTree(arrStepTree[i].arrSubSteps, iStepIDToFind);
        } // end if-else
        i++;
    }; // end while
    
    if (stepFound == null)
    {
        return null;
    }
    else
    {
        return stepFound;
    }; // end if-else
    
    return null;
}; // end findStepInTree()

function findStepTreeLevel(arrStepTree, stepToFind)
{
    var arrReturn = null;
    
    if (stepToFind == null)
    {
        return null;
    } // end if
    else
    {
        if (stepToFind.iParentStepID > -1)
        {
            return findStepInTree(arrStepTree, stepToFind.iParentStepID).arrSubSteps;
        }
        else
        {
            return arrStepTree;
        }; // end else
    }; // else
    
    return null;
}; // end findStepTreeLevel

function findTemplateIndex(iTemplateIDToFind)
{
    var iCounter = 0;
    var bFound = false;
    
    while ((bFound == false) && (iCounter < arrTemplates.length))
    {
        if (arrTemplates[iCounter].iTemplateID == iTemplateIDToFind)
        {
            bFound = true;
        }
        iCounter++;
    }; // end while
    
    if (bFound)
    {
        return (iCounter - 1);
    } // end if
    else
    {
        return -1;
    }; // end else
    
    return -1;
}; // end findTemplateIndex()

function findTemplateTreeLevel(arrStepTree, stepToFind)
{
    var arrReturn = null;

    if (stepToFind == null)
    {
        return null;
    } // end if
    else
    {
        if (stepToFind.iParentStepID > -1)
        {
            return findStepInTree(arrStepTree, stepToFind.iParentStepID).arrSubSteps;
        } // end if
        else
        {
            return arrStepTree;
        }; // end else
    }; // end else
    
    return null;
}; // end findTemplateTreeLevel()

function resolveStepConflicts(arrTreeLevelConflictSearch, stepAdded)
{
    var bConflictFound = true;
    var iSearchConflict1 = findStepIndex(arrTreeLevelConflictSearch, stepAdded.iStepID);
    var iSearchConflict2 = 0;
    
    // search repeatedly until no more conflicts found
    while (bConflictFound == true)
    {
        bConflictFound = false;
        iSearchConflict2 = 0;                    
        while ((!bConflictFound) && (iSearchConflict2 < arrTreeLevelConflictSearch.length))
        {
            if ((arrTreeLevelConflictSearch[iSearchConflict2].iOrder == arrTreeLevelConflictSearch[iSearchConflict1].iOrder) &&
                (arrTreeLevelConflictSearch[iSearchConflict2].iStepID != arrTreeLevelConflictSearch[iSearchConflict1].iStepID))
            {                        
                bConflictFound = true;
                arrTreeLevelConflictSearch[iSearchConflict2].iOrder++;
                dbChecklistOpen.updateStep(arrTreeLevelConflictSearch[iSearchConflict2]);
                iSearchConflict1 = iSearchConflict2;
            }
            iSearchConflict2++;
        };
    }; 
}; // end resolveStepConflicts()

function traverseStepTree(arrStepTree, arrIndexes)
{
    var stepReturn = arrStepTree[arrIndexes[0]];

    for (var i = 1; i < arrIndexes.length; i++)
    {
        stepReturn = stepReturn.arrSubSteps[arrIndexes[i]];
    }; // end for
    
    return stepReturn;
}; // end traverseStepTree()
