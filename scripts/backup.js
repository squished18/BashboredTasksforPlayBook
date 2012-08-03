// autoBackup() called at app startup and on app exit (when the Exit button is clicked)
function autoBackup()
{
    var dCurrent = new Date();
    var bBackupIsCurrent = false;
    var sBackupFolder = "";
    
    function triggerExitReady()
    {
        console.log("autoBackup triggerExitReady : trigger evtExitReady");
        $(document).trigger("evtExitReady");
    };    
    
    for (var i = 0; i < arrBackups.length; i++)
    {
        // delete any backup versions that are older than 28 days
        var iBackupVersionAge = dCurrent.getTime() - arrBackups[i].getTime();
        if (iBackupVersionAge > (28*24*60*60*1000))
        {
            sBackupFolder = arrBackups[i].getFullYear().toString();
            if (arrBackups[i].getMonth() < 9)
            {
                sBackupFolder += "0";
            }; // end if
            sBackupFolder += (arrBackups[i].getMonth() + 1);
            if (arrBackups[i].getDate() < 10)
            {
                sBackupFolder += "0";
            }; // end if
            sBackupFolder += arrBackups[i].getDate();
            
            // delete the folders that contain the backups
            blackberry.io.dir.deleteDirectory(sFilePath + "/backup/" + sBackupFolder, true);
            
            // delete the version from the database
            dbChecklistOpen.deleteBackup(arrBackups[i]);
            
            // delete the version from arrBackups
            arrBackups.splice(i,1);
        }; // end if
        
        // if the backup version age is less than 7 days, then there is a current version
        // and another one is not required
        if (iBackupVersionAge < (7*24*60*60*1000))
        {
            bBackupIsCurrent = true;
        }; // end if
    }; // end for
    
    // if there is no version less than 7 days in age, then create a new backup version
    if (bBackupIsCurrent == false)
    {
        // START - save backup version to file system
        sBackupFolder = dCurrent.getFullYear().toString();
        if (dCurrent.getMonth() < 9)
        {
            sBackupFolder += "0";
        }; // end if
        sBackupFolder += (dCurrent.getMonth() + 1);
        if (dCurrent.getDate() < 10)
        {
            sBackupFolder += "0";
        }; // end if
        sBackupFolder += dCurrent.getDate();
    
        // check if backup folder exists
        if (blackberry.io.dir.exists(sFilePath + "/backup") == false)
        {
            console.log("autoBackup : trying to create general backup folder");
            blackberry.io.dir.createNewDir(sFilePath + "/backup");
            console.log("autoBackup : general backup folder created");
        }; // end if
               
        if (blackberry.io.dir.exists(sFilePath + "/backup/" + sBackupFolder) == false)
        {
            console.log("autoBackup : trying to create folder for backup version - " + sFilePath + "/backup/" + sBackupFolder);
            blackberry.io.dir.createNewDir(sFilePath + "/backup/" + sBackupFolder);
            console.log("autoBackup : backup version folder created");
        }
        else
        {
            console.log("autoBackup : ERROR - backup version folder already exists - " + sFilePath + "/backup/" + sBackupFolder);
        }; // end if
        
        dbChecklistOpen.exportDatabase(sBackupFolder);
        // END - save backup version to file system
        
        // log backup version in tabBackup in database
        $(document).bind("evtAddBackupComplete", triggerExitReady);
        dbChecklistOpen.addBackup(dCurrent);
        
        // log backup version in arrBackups
        arrBackups.push(dCurrent);
        
    }
    else
    {
        console.log("autoBackup : trigger evtExitReady");
        $(document).trigger("evtExitReady");
    }; // end if-else
}; // end autoBackup()
