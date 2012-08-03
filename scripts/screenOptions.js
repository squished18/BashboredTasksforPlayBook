screenOptions =
{
    displayScreen : function ()
    {
        $('#divDisplay').append("<div id='divScreenOptions'></div>");
        
        var sOutputHTML = "<div>" +
            "<label id='labelTitle' class='label'>Options</label><br>" +
            "<label id='labelVersion' class='label'>v.4.2.11</label>" +
            "<button id='buttonBack' style='position:fixed; right:5px; top:5px; z-index:10'>Back</button><br><br>" +
        "</div><hr><br>";
        
        sOutputHTML += "<button id='buttonOptionsExport'>export</button><br><br>";
        sOutputHTML += "<button id='buttonOptionsImport'>import</button><br><br><hr>";
        sOutputHTML += "<label class='label'>Automatic Backup - Versions</label><br>";
        for (var i = 0; i < arrBackups.length; i++)
        {            
            sOutputHTML += "<button id='buttonRestore" + i + "' class='buttonRestore' style='margin-bottom:4px'>restore</button>";
            sOutputHTML += "<label>&nbsp&nbsp" + arrBackups[i].toDateString() + "</label><br>";
        };
        
        $('#divScreenOptions').html(sOutputHTML);        
    }, // end .displayScreen()
    
    startEventListeners : function ()
    {
        function clickButtonBack()
        {
            $('#divScreenOptions').remove();
            screenMainInstance.displayScreen();
            screenMainInstance.startEventListeners();
        }; // end clickButtonBack()
        
        $('#buttonBack').unbind();
        $('#buttonBack').click(function (evt)
        {
            console.log("screenOptions : event clickButtonBack");
            clickButtonBack();
        }); // end .click()
        
        $('#buttonOptionsExport').unbind();
        $('#buttonOptionsExport').click(function (evt)
        {
            dbChecklistOpen.exportDatabase();
        }); // end .click()
        
        $('#buttonOptionsImport').unbind();
        $('#buttonOptionsImport').click(function (evt)
        {
            var oOptions = {
                title : "Confirmation",
                size : blackberry.ui.dialog.SIZE_SMALL,
                position : blackberry.ui.dialog.CENTER
            };
            var iConfirm = blackberry.ui.dialog.standardAskAsync("Do you want to overwrite all current data?",
                                                                 blackberry.ui.dialog.D_YES_NO,
                                                                 function (index)
                                                                {
                                                                    if (index == 0)
                                                                    {
                                                                        dbChecklistOpen.importDatabase();
                                                                           
                                                                        clickButtonBack();
                                                                    }; // end if
                                                                },
                                                                oOptions); // end customAskAsync
        }); // end .click()
        
        $('.buttonRestore').unbind();
        // handles any of the buttonRestore buttons
        $('.buttonRestore').click(function (evt)
        {
            
            var iRestoreIndex = parseInt(evt.target.id.substr(13,1));
            
            var sBackupFolder = arrBackups[iRestoreIndex].getFullYear().toString();
            if (arrBackups[iRestoreIndex].getMonth() < 9)
            {
                sBackupFolder += "0";
            }; // end if
            sBackupFolder += (arrBackups[iRestoreIndex].getMonth() + 1);
            if (arrBackups[iRestoreIndex].getDate() < 10)
            {
                sBackupFolder += "0";
            }; // end if
            sBackupFolder += arrBackups[iRestoreIndex].getDate();
            
            blackberry.ui.dialog.standardAskAsync("Overwrite all data and restore from backup?\r\nBackup version: " + sBackupFolder,
                blackberry.ui.dialog.D_OK_CANCEL,
                function (iSelection)
                {
                    if (iSelection == 0) // blackberry.ui.dialog.C_OK = 0, but not supported on PlayBook yet
                    {
                        dbChecklistOpen.importDatabase(sBackupFolder);
                        
                        clickButtonBack();
                    };
                },
                {
                    title: "Restore from backup",
                    size: blackberry.ui.dialog.SIZE_SMALL,
                    position: blackberry.ui.dialog.CENTER
                });
        }); // end .click()
    } // end .startEventListeners()
}; // end screenOptions