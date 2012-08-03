function screenMain()
{
    var iChecklistFocused = null;
    var sSelectedElement = "";
    var bPollSearch = false;
    var sPreviousSearchValue = "";    
    
    function newChecklist()
    {
        $('#divScreenMain').remove();
        screenMainInstance.clearEventListeners();
        
        // create new Checklist and assign unique ChecklistID
        var checklistNew = new oChecklist();
        checklistNew.iChecklistID = iNextChecklistID;
        iNextChecklistID++;                
        arrChecklists.push(checklistNew);
        
        // insert record for new oChecklist into database
        dbChecklistOpen.updateChecklist(checklistNew);
        
        // display screen to enter information for new Checklist
        var screenChecklistNew = new screenChecklist(arrChecklists[arrChecklists.length - 1], screenMainInstance);
        screenChecklistNew.displayScreen();
        screenChecklistNew.startEventListeners();
    }; // end newChecklist
    
    function pollSearch()
    {
        // check if the value in fieldSearch has changed
        if ((bPollSearch) &&
            (sPreviousSearchValue.localeCompare($('#fieldSearch').val()) != 0))
        {
            $('.ulChecklist').show();
            if ($('#fieldSearch').val().length > 0)                        
            {
                var arrSearchWords = $('#fieldSearch').val().split(" ");
                                
                for (var i in arrChecklists)
                {
                    var bDoesNotMatch = false;
                    for (var j in arrSearchWords)
                    {
                        var regexpSearch = new RegExp("\\b"+arrSearchWords[j], "i");
                        
                        if (!(regexpSearch.test(arrChecklists[i].getDescription())))
                        {
                            bDoesNotMatch = true;
                        }; // end if
                    }; // end for
                    
                    if (bDoesNotMatch)
                    {
                        $('#ulChecklist'+i).hide();
                    }; // end if
                }; // end for
            }; // end if
            sPreviousSearchValue = $('#fieldSearch').val();
        }; // end if
        if (bPollSearch)
        {
            setTimeout(pollSearch, 500);
        }; // end if
    }; // end pollSearch
    
    this.clearEventListeners = function()
    {
        $(document).unbind('keypress');
        blackberry.app.event.onSwipeDown(null);
        bPollSearch = false;
    }; // end clearEventListeners
    
    this.displayScreen = function()
    {
        console.log("screenMain.displayScreen : start");
        
        $('#divScreenMain').remove();
        $('#divDisplay').append("<div id='divScreenMain'></div>");
        
        var sOutputHTML = "<label>Bashbored Tasks</label><br>";
        sOutputHTML += "<textarea id='fieldSearch' style='width:50%;height:1.25em' placeholder='search'></textarea>";
        sOutputHTML += "<button id='buttonClearSearch' style='position:relative; top:-10px; margin-left:10px; border-radius:12px'>x</button>";
        sOutputHTML += "<button id='buttonExit' style='position:fixed; right:5px; top:5px'>Exit</button>";
    
        if (arrChecklists.length > 0)
        {
            arrChecklists.sort(function(checklistA,checklistB){return checklistA.getDescription().localeCompare(checklistB.getDescription())});
            
            for (var i=0; i<arrChecklists.length; i++)
            {
                sOutputHTML += "<ul class='ulChecklist' id='ulChecklist"+i+"' x-blackberry-focusable='true'>"+arrChecklists[i].getDescription()+"</ul>"
            };
        } // end if
        sOutputHTML += "<ul class='ulChecklist' id='ulNewChecklist' x-blackberry-focusable='true'>** new checklist **</ul>";
        sOutputHTML += "<button id='buttonDelete' style='position:fixed; right:5px; bottom:5px'>Delete</button>";                
                
        $('#divScreenMain').html(sOutputHTML);
        $('#divScreenMain').show();
        $('#buttonDelete').hide();
        
        scroll(0,0);
        $('#fieldSearch').val(sPreviousSearchValue);
        // setting sPreviousSearchValue back to an empty string causes the
        // pollSearch function to trigger and filter the list of Checklists
        sPreviousSearchValue = ""; 
    }; // end displayScreen
    
    this.startEventListeners = function()
    {
        function clickButtonClearSearch(eventClick)
        {
            $('#fieldSearch').val("");
        }; // end clickButtonClearSearch()
        
        function clickButtonDelete(eventClick)
        {
            if (confirm("Delete selected Checklist?"))
            {
                // start: archive Checklist to text file
                // start: generate file name
                // generate date string
                var dCurrentDate = new Date();
                var iCurrentMonth = dCurrentDate.getMonth() + 1;
                var sCurrentMonth = "";
                if (iCurrentMonth > 9)
                    sCurrentMonth = iCurrentMonth.toString();
                else
                    sCurrentMonth = "0" + iCurrentMonth.toString();
                var iCurrentDay = dCurrentDate.getDate();
                var sCurrentDay = "";
                if (iCurrentDay > 9)
                    sCurrentDay = iCurrentDay.toString();
                else
                    sCurrentDay = "0" + iCurrentDay;
                        
                // strip periods from sDescription
                var sArchiveDescription = arrChecklists[iChecklistFocused].getDescription().replace(/[.]/gi, "");
                
                var sArchiveFileName = "/accounts/1000/shared/documents/BBTasks/" + dCurrentDate.getFullYear()
                                     + "-" + sCurrentMonth + "-" + sCurrentDay + " - " + sArchiveDescription + ".txt";
                console.log("screenMain.startEventListeners.clickButtonDelete : sArchiveFileName = " + sArchiveFileName);
                // end: generate file name
                
                // check if /BBTasks folder exists
                if (blackberry.io.dir.exists("/accounts/1000/shared/documents/BBTasks") == false)
                {
                    console.log("dbChecklist.exportDatabase : trying to create folder");
                    blackberry.io.dir.createNewDir("/accounts/1000/shared/documents/BBTasks/");
                    console.log("dbChecklist.exportDatabase : folder created");
                }; // end if
                console.log("screenMain.startEventListeners.clickButtonDelete : BBTasks folder exists");
                
                var sChecklistArchive = "";
                // parse through active tasks
                for (var i = 0; i < arrChecklists[iChecklistFocused].arrTasks.length; i++)
                {
                    sChecklistArchive += arrChecklists[iChecklistFocused].arrTasks[i].iOrder + " : "
                                       + arrChecklists[iChecklistFocused].arrTasks[i].sDescription + "\n";
                }; // end for
                
                // parse through archive
                for (var i = 0; i < arrChecklists[iChecklistFocused].arrArchive.length; i++)
                {
                    sChecklistArchive += arrChecklists[iChecklistFocused].arrArchive[i].dCompleted.toLocaleDateString() + " : "
                                       + arrChecklists[iChecklistFocused].arrArchive[i].sEntry + "\n";
                }; // end for
                
                console.log("screenMain.startEventListeners.clickButtonDelete : \n" + sChecklistArchive);
                
                // delete old archive file if it exists already
                if (blackberry.io.file.exists(sArchiveFileName) == true)
                {
                    // delete old version of schema.txt
                    blackberry.io.file.deleteFile(sArchiveFileName);
                    console.log(sArchiveFileName + " deleted");
                }; // end if
                
                // write string to file
                var blobWrite = blackberry.utils.stringToBlob(sChecklistArchive);
                blackberry.io.file.saveFile(sArchiveFileName, blobWrite);
        
                // end: archive Checklist to text file
                
                // delete oChecklist from database
                dbChecklistOpen.deleteChecklist(arrChecklists[iChecklistFocused]);
                
                // remove oChecklist from arrChecklists
                arrChecklists.splice(iChecklistFocused, 1);
                iChecklistFocused = null;
                screenMainInstance.displayScreen();
                screenMainInstance.startEventListeners();
            }; // end confirm
        }; // end clickButtonDelete
        
        function clickButtonExit(eventClick)
        {
            blackberry.app.exit(); 
        }; // end clickButtonExit()
        
        function clickULEvent(eventClick)
        {
            if ((eventClick.currentTarget.getAttribute("id",0)).substr(11).valueOf() == iChecklistFocused)
            {
                // determine which checklist was clicked                 
                iChecklistFocused = (eventClick.currentTarget.getAttribute("id",0)).substr(11).valueOf();
                
                console.log("clickEvent: iChecklistFocused = " + iChecklistFocused);
                
                // clear screenMain
                $('#divScreenMain').hide();
                // $('#divScreenMain').remove();
                screenMainInstance.clearEventListeners();
                
                // show screenChecklist
                var screenChecklistNew = new screenChecklist(arrChecklists[iChecklistFocused], screenMainInstance);
                screenChecklistNew.displayScreen();
                screenChecklistNew.startEventListeners();
                iChecklistFocused = null;
            } // end if
            else
            {
                iChecklistFocused = (eventClick.currentTarget.getAttribute("id",0)).substr(11).valueOf();
                $('#buttonDelete').show();
            }; // end else
        }; // end clickULEvent()
        
        function keypressEvent(eventKeyPressed)
        {
            if (String.fromCharCode(eventKeyPressed.which) == "c")
            {
                var sCommand = prompt("Command line:", "");
                if (sCommand === "clearbackup")
                {
                    dbChecklistOpen.clearBackup();
                }
                else if (sCommand === "reset")
                {
                    dbChecklistOpen.clearDatabase();
                    screenMainInstance.displayScreen();
                    screenMainInstance.startEventListeners();
                } // end if "reset"
                else if (sCommand === "export")
                {
                    dbChecklistOpen.exportDatabase(arrChecklists);
                } // end else-if "export"
                else
                {
                    alert('Command not recognized.');
                } // end else
            } // end if 'd' key
            // if 'n' key
            else if (String.fromCharCode(eventKeyPressed.which) == "n")
            {
                eventKeyPressed.preventDefault();
                
                newChecklist();
                return;
            } // end if 'n' key
            // if delete key
            else if ((eventKeyPressed.which == 8) && (iChecklistFocused != null))
            {
                clickButtonDelete(eventKeyPressed);
            } // end if delete key
            // if BACK key
            else if (eventKeyPressed.which == 27)
            {
                blackberry.app.exit(); 
            }; // end if BACK key
        }; // end keypressEvent        
        
        function mouseOverEvent(eventMouseOver)
        {
            if (sSelectedElement.length > 0)
            {
                $("#" + sSelectedElement).css("border-width", "1px");
            }; // end if
            $("#" + eventMouseOver.currentTarget.getAttribute("id",0)).css("border-width", "3px");
            sSelectedElement = eventMouseOver.currentTarget.getAttribute("id",0);
        };
    
        iChecklistFocused = null;
        $(document).unbind();
        $(document).keypress(function (evt)
        {
            // keypressEvent(evt);            
        }); // end .keypress
        // $(':not(.ulChecklist)').click(function (evt)
        $(document).click(function (evt)
        {
            if ((evt.target.id.substr(0,11) != "ulChecklist") && (evt.target.id != "buttonDelete"))
            {
                $('.ulChecklist').css("border-width", "1px");
                iChecklistFocused = null;
                sSelectedElement = "";
                $('#buttonDelete').hide();
            }; // end if
        }); // end .click
        $('.ulChecklist').unbind();
        $('.ulChecklist').click(function (evt)
        {
            clickULEvent(evt);
        }); // end .click
        $('#ulNewChecklist').unbind();
        $('#ulNewChecklist').click (function (evt)
        {
            evt.stopPropagation();
            newChecklist();
        }); // end .click
        $('.ulChecklist').mouseover(function (evt)
        {
           mouseOverEvent(evt); 
        }); // end .mouseover
        $('#buttonClearSearch').click(function (evt)
        {
            clickButtonClearSearch(evt);
        }); // end .click
        $('#buttonDelete').click(function (evt)
        {
            clickButtonDelete(evt);
        }); // end .click
        $('#buttonExit').click(function (evt)
        {
            evt.stopPropagation();
            $(document).bind("evtExitReady", clickButtonExit);
            autoBackup();
        }); // end .click
        // start the periodic polling to check if the search field has changed
        bPollSearch = true;
        pollSearch();        
        
        menuMain.startEventListeners();        
        // blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, function() {});
        
        console.log("screenMain.startEventListeners : event listeners started");
    };  // end .startEventListeners()
    
    console.log("screenMain : instance created");
}; //end screenMain

function startScreenMain()
{
    var bTabChecklistsReady = false;
    var bTabTasksReady = false;
    var bRegistrationOK = false;
    
    this.doIt = function(eventRegReady, eventElementReady)
    {
        autoBackup();
        $('#divScreenSplash').hide();
        screenMainInstance = new screenMain();
        screenMainInstance.displayScreen();
        screenMainInstance.startEventListeners();
    } // end this.doIt()
}; // end startScreenMain()


