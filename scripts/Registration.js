function Registration()
{
    var registrationThis = this;
    
    var sRegistrationDirectory = "file:///store/BlackBerry/system/appdata/rim/webstorage/Tasks";
    var sRegistrationFile = "Tasks.txt";
    
    var bTabBackupReady = false;
    var bTabChecklistsReady = false;
    var bTabStepsReady = false;
    var bTabTasksReady = false;
    var bTabTemplatesReady = false;
    var bTabArchiveReady = false;
    var bTabAchievementsReady = false;
    
    this.checkRegistration = function(eventDBReady, eventElementReady)
    {
        console.log("Registration.checkRegistration : start");
        
        if (eventElementReady == 'tabBackup')
        {
            console.log("Registration.checkRegistration : dbReady, tabBackup");
            bTabBackupReady = true;
        } // end if
        else if (eventElementReady == 'tabChecklists')
        {
            console.log("Registration.checkRegistration : dbReady, tabChecklists");
            bTabChecklistsReady = true;
        } // end else if
        else if (eventElementReady == 'tabSteps')
        {
            console.log("Registration.checkRegistration : dbReady, tabSteps");
            bTabStepsReady = true;
        } // end else if
        else if (eventElementReady == 'tabTasks')
        {
            console.log("Registration.checkRegistration : dbReady, tabTasks");
            bTabTasksReady = true;
        } // end else if
        else if (eventElementReady == 'tabTemplates')
        {
            console.log("Registration.checkRegistration : dbReady, tabTemplates");
            bTabTemplatesReady = true;
        }
        else if (eventElementReady == 'tabArchive')
        {
            console.log("Registration.checkRegistration : dbReady, tabArchive");
            bTabArchiveReady = true;
        } // end else if
        else if (eventElementReady == 'tabAchievements')
        {
            console.log("Registration.checkRegistration : dbReady, tabAchievements");
            bTabAchievementsReady = true;
        }; // end else if
        
        if ((bTabBackupReady == true) &&
            (bTabChecklistsReady == true) &&
            (bTabStepsReady == true) &&
            (bTabTasksReady == true) &&
            (bTabTemplatesReady == true) &&
            (bTabArchiveReady == true) &&
            (bTabAchievementsReady == true))
        {
            console.log("Registration.checkRegistration : findAchievement(1).dCompleted = " + findAchievement(1).dCompleted);
            console.log("Registration.checkRegistration : findAchievement(1).dCompleted.getTime() = " + findAchievement(1).dCompleted.getTime());
            
            if (bTrial)
            {
                if (findAchievement(3).dCompleted.getTime() == 0)
                {
                    markAchievementComplete(3);
                }; // end if
                
                var dCurrent = new Date();
                if (dCurrent.getTime() < (findAchievement(3).dCompleted.getTime() + 30*24*60*60*1000))
                {
                    blackberry.ui.dialog.customAskAsync("Bashbored Tasks trial version",
                                    ["Purchase full version","Continue trial"],
                                    function (iSelected)
                                    {
                                        if (iSelected == 0)
                                        {
                                            var url = "http://appworld.blackberry.com/webstore/content/84852";
                                            
                                            var args = new blackberry.invoke.BrowserArguments(url);
                                            blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
                                        }
                                    },
                                    {
                                        title : "Bashbored Tasks trial",
                                        size : blackberry.ui.dialog.SIZE_MEDIUM,
                                        position : blackberry.ui.dialog.CENTER
                                    });
                    
                    $(document).trigger("regReady");
                }
                else
                {
                    blackberry.ui.dialog.standardAskAsync("Trial period over.",
                                                          blackberry.ui.dialog.D_OK,
                                                          function (iSelectedIndex)
                                                          {
                                                            
                                                          },
                                                          {
                                                            title : "Trial expired.",
                                                            size : blackberry.ui.dialog.SIZE_SMALL,
                                                            position : blackberry.ui.dialog.CENTER
                                                          });
                }
            }
            else
            {
                $(document).trigger("regReady");
            }
            /*
            // check if app was ever registered for the first time
            if (findAchievement(1).dCompleted.getTime() > 0)
            {
                
            } // end if
            else
            {
                // app has not been registered before
                registrationThis.requestRegistration();
            }; // end else
            
            // TODO - parse through arrAchievements and add up all
            var iDaysAccumulated = 0;
            for (var i = 0; i < arrAchievements.length; i++)
            {
                if (arrAchievements[i].dCompleted.getTime() > 0)
                {
                    iDaysAccumulated += arrAchievements[i].iDayValue;
                }; // end if
            }; // end for
            var iExpirationDate = findAchievement(1).dCompleted.getTime() + (iDaysAccumulated*24*60*60*1000);
            var iCurrentDate = new Date();
            if (iExpirationDate > iCurrentDate);
            {
                $(document).trigger("regReady");
            }; // end if
            */
           
            
        }; // end if
                
        // TODO - generate registration code internally
        
        // TODO - check if registration code matches
    };    
    
    this.requestRegistration = function()
    {
        console.log("Registration.requestRegistration : start");
        
        var bConfirm1 = confirm("Bashbored Tasks requires registration to start. Would you like to proceed with registration?");
        
        if (bConfirm1 == true)
        {
            var sFirstName = prompt("Please enter your first name:");
            var sLastName = prompt("Please enter your last name:");
            var bConfirm2 = confirm("Please confirm that you agree to send your BlackBerry PIN and model to Bashbored. This information is required for registration.");
            
            if (bConfirm2 == true)
            {
                // compose message to send
                var messageRegistration = new blackberry.message.Message();
                messageRegistration.toRecipients = "bashbored@gmail.com";
                messageRegistration.subject = "Registration request: Bashbored Tasks";
                messageRegistration.body = "First name: " + sFirstName + "\r\n" +
                                           "Last name: " + sLastName + "\r\n" +
                                           "PIN: " + blackberry.identity.PIN + "\r\n" +
                                           "Model: " + blackberry.system.model + "\r\n" +
                                           "Software: " + blackberry.system.softwareVersion + "\r\n" +
                                           "Date: " + Date();
                messageRegistration.send();
                
                // delete message after being sent
                messageRegistration.remove();
                
                // update achievements
                markAchievementComplete(1);
            } // end if
            else
            {
                blackberry.app.exit(); 
            }; // end if (bConfirm2 == true)
        }
        else
        {
            blackberry.app.exit(); 
        }; // end if (bConfirm1 == true)
    }; // end this.requestRegistration()
    
    console.log("Registration : instance created");
};
