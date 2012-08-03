function findAchievement(iAchievementID)
{
    for (var i = 0; i < arrAchievements.length; i++)
    {
        if (iAchievementID == arrAchievements[i].iAchievementID)
        {
            return arrAchievements[i];
        }; // end if
    }; // end for
    return null;
}; // end findAchievement()

function initAchievements()
{
    console.log("dbChecklist, initAchievements : start");
    
    var achievementToAdd = null;
    
    if (findAchievement(1) == null)
    {
        achievementToAdd = new oAchievement();
        achievementToAdd.iAchievementID = 1;
        achievementToAdd.sDescription = "request registration";
        achievementToAdd.iDayValue = 365;
        dbChecklistOpen.addAchievement(achievementToAdd);
    }; // end if
    
    if (findAchievement(2) == null)
    {
        achievementToAdd = new oAchievement();
        achievementToAdd.iAchievementID = 2;
        achievementToAdd.sDescription = "entered registration code";
        achievementToAdd.iDayValue = 30;
        dbChecklistOpen.addAchievement(achievementToAdd);
    }; // end if
    
    if (findAchievement(3) == null)
    {
        achievementToAdd = new oAchievement();
        achievementToAdd.iAchievementID = 3;
        achievementToAdd.sDescription = "app start date";
        achievementToAdd.iDayValue = 0;
        dbChecklistOpen.addAchievement(achievementToAdd);
    }
}; // end initAchievements()

function markAchievementComplete(iAchievementID)
{
    var achievementCompleted = findAchievement(iAchievementID);
    
    // mark completed in arrAchievements
    achievementCompleted.dCompleted = new Date();  
    console.log("markAchievementComplete : achievementCompleted.dCompleted = " + achievementCompleted.dCompleted.toString());
    
    // mark completed in the database
    dbChecklistOpen.completeAchievement(iAchievementID, achievementCompleted.dCompleted);
};
