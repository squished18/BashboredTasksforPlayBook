function oStep()
{
    this.iStepID = -1;
    this.iParentStepID = -1;
    this.iPrevStepID = -1;
    this.iNextStepID = -1;
    this.iOrder = -1;
    this.sDescription = "";
    this.arrSubSteps = [];
}; // end oStep()

function findStepIndex(arrSteps, iStepIDToFind)
{
    var iCounter = 0;
    var bFound = false;
    while ((bFound == false) && (iCounter < arrSteps.length))
    {
        if (arrSteps[iCounter].iStepID == iStepIDToFind)
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
}; // end findStepIndex()