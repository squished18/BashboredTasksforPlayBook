var arrAchievements = [];
var arrBackups = [];
var arrTemplates = [];
var arrChecklists = [];
var bTrial = false;
var dbChecklistOpen;
var screenMainInstance;
var registrationInstance;
var iNextAchievementID = 0;
var iNextTemplateID = 0;
var iNextStepID = 0;
var iNextChecklistID = 0;
var iNextTaskID = 0;
var iSchemaVersion = 6;
var sFilePath = "/accounts/1000/shared/documents/BBTasks";

var subtaskNew = null;

$(document).ready(function()
{
    // alert('start debug');
    
    $('#dialogCreateChecklist').hide();
    
    if (bTrial)
    {
        $('#buttonAppWorld').click(function (evt)
        {
            var url = "http://appworld.blackberry.com/webstore/content/84852";
            
            var args = new blackberry.invoke.BrowserArguments(url);
            blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
        });        
    }
    else
    {
        $('#buttonAppWorld').remove();
    }; // end else
    
    startScreenMainInstance = new startScreenMain();
    $(document).bind("regReady", startScreenMainInstance.doIt);
    
    registrationInstance = new Registration();
    $(document).bind("dbReady", registrationInstance.checkRegistration);
    
    // initalize database
    dbChecklistOpen = new dbChecklist();
    dbChecklistOpen.readDatabase(arrChecklists, arrAchievements);
});
