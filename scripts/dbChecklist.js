/*
 
dbChecklist schema revisions

v.2 (used up to v.1.0.45)
tabChecklists (iChecklistID INTEGER,
    sDescription TEXT)
tabTasks (iTaskID INTEGER,
    iChecklistID INTEGER,
    iParentTaskID INTEGER,
    iSubTaskID INTEGER,
    iOrder INTEGER,
    sDescription TEXT,
    dCompleted INTEGER)
tabAchievements (iAchievementID INTEGER,
    sDescription TEXT,
    dCompleted INTEGER,
    iDayValue INTEGER)
    
v.3 (used to up v.2.0.3)
added new table tabSettings:
tabSettings (sSetting TEXT,
    sValue TEXT)
added new table tabArchive:
tabArchive (iChecklistID INTEGER,
    dCompleted INTEGER,
    sEntry TEXT)
    
v.4
added new fields to tabTasks (iNextTaskID INTEGER,
    iPrevTaskID INTEGER)

v.5
added new table tabBackup:
tabBackup (dVersion INTEGER)

v.6
added new table tabTemplates:
tabTemplates (iTemplateID INTEGER,
    sDescription TEXT)
added new table tabSteps:
tabSteps (iStepID INTEGER,
    iTemplateID INTEGER,
    iParentStepID INTEGER,
    iSubStepID INTEGER,
    iOrder INTEGER,
    sDescription TEXT)
*/

dbChecklist = function()
{
    var dbChecklistInstance = {};
    var dbChecklistThis = this;
    
    var arrSchema = [["tabSettings", ["sSetting", "TEXT"], ["sValue", "TEXT"]],
                     ["tabBackup", ["dVersion", "INTEGER"]],
                     ["tabChecklists", ["iChecklistID", "INTEGER"], ["sDescription", "TEXT"]],
                     ["tabTasks", ["iTaskID", "INTEGER"],
                                  ["iChecklistID", "INTEGER"],
                                  ["iParentTaskID", "INTEGER"],
                                  ["iPrevTaskID", "INTEGER"],
                                  ["iNextTaskID", "INTEGER"],
                                  ["iSubTaskID", "INTEGER"],
                                  ["iOrder", "INTEGER"],
                                  ["sDescription", "TEXT"],
                                  ["dDueDate", "INTEGER"],
                                  ["dCompleted", "INTEGER"]],
                     ["tabArchive", ["iChecklistID", "INTEGER"], ["dCompleted", "INTEGER"], ["sEntry", "INTEGER"]],
                     ["tabTemplates", ["iTemplateID", "INTEGER"], ["sDescription", "TEXT"]],
                     ["tabSteps", ["iStepID", "INTEGER"],
                                  ["iTemplateID", "INTEGER"],
                                  ["iParentStepID", "INTEGER"],
                                  ["iPrevStepID", "INTEGER"],
                                  ["iNextStepID", "INTEGER"],
                                  ["iSubStepID", "INTEGER"],
                                  ["iOrder", "INTEGER"],
                                  ["sDescription", "TEXT"]],
                     ["tabAchievements", ["iAchievementID", "INTEGER"],
                                         ["sDescription", "TEXT"],
                                         ["dCompleted", "INTEGER"],
                                         ["iDayValue", "INTEGER"]]];
    var arrTableChecked = [];
    // initialized arrTableChecked
    for (i in arrSchema)
    {
        arrTableChecked.push([]);
        for (j = 1; j < arrSchema[i].length; j++)
        {
            arrTableChecked[i].push(false);
        }; // end for
    }; // end for
    
    function checkTablesCreated()
    {        
        function checkTable(arrSchemaToCheck)
        {
            function alterTable(eventAlterTable, sTableName, sFieldName)
            {
                console.log("dbChecklist checkTablesCreated checkTable alterTable : start " + sTableName + " " + sFieldName);
                
                dbChecklistInstance.db.transaction(function (t)
                {
                    var sFieldType = "";
                    for (i in arrSchema)
                    {
                        if (arrSchema[i][0].localeCompare(sTableName) == 0)
                        {
                            for (j = 1; j < arrSchema[i].length; j++)
                            {
                                if (arrSchema[i][j][0].localeCompare(sFieldName) == 0)
                                {
                                    sFieldType = arrSchema[i][j][1].concat("");
                                }; // end if
                            }; // end for
                        }; // end if
                    }; // end for
                    var sSQL1 = "ALTER TABLE " + sTableName + " ADD " + sFieldName + " " + sFieldType;
                    t.executeSql(sSQL1, [], function(t,r){}, errorSQL);
                },
                errorTrans,
                function ()
                {
                    $("#divGlobalEvents").trigger("evtMarkTableCheckComplete", [sTableName, sFieldName]);
                }); // end transaction ALTER TABLE
            }; // end alterTable()
            
            function checkField(eventCheckField, sTableName, sFieldName)
            {
                console.log("dbChecklist checkTablesCreated checkTable checkField : start " + sTableName + " " + sFieldName);
                
                dbChecklistInstance.db.transaction(function (t)
                {
                    sSQL = "SELECT " + sTableName + "." + sFieldName + " FROM " + sTableName;
                    t.executeSql(sSQL, [],
                            function(t,r)
                            {
                                $("#divGlobalEvents").trigger("evtMarkTableCheckComplete", [sTableName, sFieldName]);
                            },
                            function(t,e)
                            {
                                console.log("dbChecklist.readDatabase checkTablesCreated : field not found = " + e.message);
                                $("#divGlobalEvents").trigger("evtAlterTable", [sTableName, sFieldName]);
                            }); // end SQL call to check for field
                },
                function(err)
                {
                },
                function()
                {
                }); // end database call
            }; // end checkField()
            
            $("#divGlobalEvents").unbind("evtAlterTable");
            $("#divGlobalEvents").bind("evtAlterTable", alterTable);
            $("#divGlobalEvents").unbind("evtCheckField");
            $("#divGlobalEvents").bind("evtCheckField", checkField);
            
            console.log("dbChecklist checkTablesCreated checkTable : start");
            
            // Create the table if it doesn't already exist in the schema.
            var sSQL = "CREATE TABLE IF NOT EXISTS " + arrSchemaToCheck[0] + " (";
            for (i = 1; i < arrSchemaToCheck.length; i++)
            {
                sSQL += arrSchemaToCheck[i][0];
                if (i < arrSchemaToCheck.length - 1)
                {
                    sSQL += ", ";
                }; // end if
            }; // end for
            sSQL += ")";
            dbChecklistInstance.db.transaction(function (t)
            {
                t.executeSql(sSQL, [], function(t,r){}, errorSQL);
            },
            errorTrans,
            function()
            {
                console.log("dbChecklist.readDatabase checkTablesCreated : " + arrSchemaToCheck[0] + " verified/created");
            });
            
            // Check if each of the fields specified in the schema array are present in the database table.
            // This is used when a database from an older schema is being upgraded.
            for (i = 1; i < arrSchemaToCheck.length; i++)
            {                
                $("#divGlobalEvents").trigger("evtCheckField", [arrSchemaToCheck[0].concat(""), arrSchemaToCheck[i][0]].concat(""));
            }; // end for
        }; // end checkTable()
        
        function markTableCheckComplete(evtCheckTableComplete, sTableName, sFieldName)
        {
            console.log("dbChecklist markTableCheckComplete : " + sTableName + " " + sFieldName);
            for (i in arrSchema)
            {
                if (arrSchema[i][0].localeCompare(sTableName) == 0)
                {
                    for (j=1; j <arrSchema[i].length; j++)
                    {
                        if (arrSchema[i][j][0].localeCompare(sFieldName) == 0)
                        {
                            arrTableChecked[i][j-1] = true;
                        }; // end if
                    }; // end for
                }; // end if
            }; // end for
            
            // check if all tables have been checked
            var bAllTablesChecked = true;
            for (i in arrTableChecked)
            {
                for (j in arrTableChecked[i])
                {
                    if (arrTableChecked[i][j] == false)
                    {
                        bAllTablesChecked = false;
                    }; // end if
                }; // end for
            }; // end for            
            if (bAllTablesChecked)
            {
                $("#divGlobalEvents").trigger("evtDBCheckTablesCompleted");
                $("#divGlobalEvents").unbind("evtMarkTableCheckComplete");
            }
        }; // end checkTableComplete
        
        $("#divGlobalEvents").bind("evtMarkTableCheckComplete", markTableCheckComplete);
        
        console.log("dbChecklist checkTablesCreated : start");
        
        for (i in arrSchema)
        {
            checkTable(arrSchema[i]);
        }; // end for        
        
        /*
        dbChecklistInstance.db.transaction(function(t)
        {
            t.executeSql('CREATE TABLE IF NOT EXISTS tabBackup (dVersion INTEGER)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        function ()
        {
            console.log("dbChecklist.readDatabase checkTablesCreated : tabBackup verified/created");
        }); // end check tabBackup
        
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('CREATE TABLE IF NOT EXISTS tabChecklists (iChecklistID INTEGER, ' +
                                                                   'sDescription TEXT)', [], function(t,r){}, errorSQL);            
        },
        errorTrans,
        function ()
        {
            console.log("dbChecklist.readDatabase checkTablesCreated : tabChecklists verified/created");
        }); // end check tabChecklists
        
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('CREATE TABLE IF NOT EXISTS tabTasks (iTaskID INTEGER, ' +
                                                              'iChecklistID INTEGER, ' +
                                                              'iParentTaskID INTEGER, ' +
                                                              'iPrevTaskID INTEGER, ' +
                                                              'iNextTaskID INTEGER, ' +
                                                              'iSubTaskID INTEGER, ' +                                                
                                                              'iOrder INTEGER, ' +
                                                              'sDescription TEXT, ' +
                                                              'dCompleted INTEGER)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        function ()
        {
            console.log("dbChecklist.readDatabase checkTablesCreated : tabTasks verified/created");
        }); // end .transaction()
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('CREATE TABLE IF NOT EXISTS tabArchive (iChecklistID INTEGER, ' +
                                                                'dCompleted INTEGER, ' +
                                                                'sEntry TEXT)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        function ()
        {
            console.log("dbChecklist.readDatabase checkTablesCreated : tabArchive verified/created");
        }); // end .transaction()    
        
        dbChecklistInstance.db.transaction(function(t)
        {
            t.executeSql('CREATE TABLE IF NOT EXISTS tabTemplates (iTemplateID INTEGER, sDescription TEXT)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        function ()
        {
            console.log("dbChecklist.readDatabase checkTablesCreated : tabTemplate verified/created");
        }); // end check tabTemplate
        
        dbChecklistInstance.db.transaction(function(t)
        {
            t.executeSql('CREATE TABLE IF NOT EXISTS tabSteps (iStepID INTEGER, ' +
                                'iTemplateID INTEGER, ' +
                                'iParentStepID INTEGER, ' +
                                'iPrevStepID INTEGER, ' +
                                'iNextStepID INTEGER, ' +
                                'iSubStepID INTEGER, ' +                                                
                                'iOrder INTEGER, ' +
                                'sDescription TEXT)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        function ()
        {
            console.log("dbChecklist.readDatabase checkTablesCreated : tabSteps verified/created");
        }); // end check tabSteps
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('CREATE TABLE IF NOT EXISTS tabAchievements (iAchievementID INTEGER, ' +
                                                                     'sDescription TEXT, ' +
                                                                     'dCompleted INTEGER, ' +
                                                                     'iDayValue INTEGER)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        function()
        {
            console.log("dbChecklist.readDatabase checkTablesCreated : tabAchievements verified/created");
        } // end successCallback
        ); // end .transaction()
        */
    }; // end checkTablesCreated()
        
    function loadInitialDBValues()
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql("INSERT INTO tabSettings (sSetting, sValue) VALUES ('schema_version', '2')", [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()        
    }; // end loadInitialDBValues
    
    function loadSampleDBValues()
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql("INSERT INTO tabChecklists (iChecklistID, sDescription) VALUES (1, 'Tap here twice to open this sample checklist.')", [], function(t,r){}, errorSQL);
            iNextChecklistID = 2;
        },
        errorTrans,
        successTrans
        ); // end .transaction()
    }; // end loadSampleDBValues
    
    function onDBCreate(dbCreated)
    {
        console.log("dbChecklist onDBCreate : start");
        
        dbCreated.transaction(function (t)
        {
            t.executeSql('CREATE TABLE tabSettings (sSetting TEXT, ' +
                                                   'sValue TEXT)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
        
        dbCreated.transaction(function (t)
        {
            t.executeSql('CREATE TABLE tabChecklists (iChecklistID INTEGER, ' +
                                                     'sDescription TEXT)', [], function(t,r){}, errorSQL);            
        },
        errorTrans,
        successTrans
        ); // end .transaction()
    
        dbCreated.transaction(function (t)
        {
            t.executeSql('CREATE TABLE tabTasks (iTaskID INTEGER, ' +
                                                'iChecklistID INTEGER, ' +
                                                'iParentTaskID INTEGER, ' +
                                                'iPrevTaskID INTEGER, ' +
                                                'iNextTaskID INTEGER, ' +
                                                'iSubTaskID INTEGER, ' +                                                
                                                'iOrder INTEGER, ' +
                                                'sDescription TEXT, ' +
                                                'dCompleted INTEGER)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
        
        dbCreated.transaction(function (t)
        {
            t.executeSql('CREATE TABLE tabArchive (iChecklistID INTEGER, ' +
                                                  'dCompleted INTEGER, ' +
                                                  'sEntry TEXT)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()        
        
        dbCreated.transaction(function (t)
        {
            t.executeSql('CREATE TABLE tabAchievements (iAchievementID INTEGER, ' +
                                                       'sDescription TEXT, ' +
                                                       'dCompleted INTEGER, ' +
                                                       'iDayValue INTEGER)', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        function()
        {
            console.log("dbChecklist onDBCreate : trigger evtDBOpen");
            $("#divGlobalEvents").trigger("evtDBOpen");
        } // end successCallback
        ); // end .transaction()        
    }; // end onDBCreate
    
    /*
    // based on code by Max Aller (nanodeath@gmail.com)
    function migrateDatabase()
    {   
        var arrMigrations = [];
        
        var assignMigration = function(number, func)
        {
            arrMigrations[number] = func;
        }; // end assignMigration()
        
        var doMigration = function(iVersion)
        {
            if (arrMigrations[iVersion])
            {
                var iNewVersion = Number(iVersion) + 1;
                dbChecklistInstance.db.changeVersion(dbChecklistInstance.db.version, String(iNewVersion), function (t)
                    {
                        console.log("dbChecklist, migrateDatabase(): iVersion = " + String(iNewVersion));
                        arrMigrations[iVersion](t);
                    },
                    errorTrans,
                    function()
                    {
                        alert('Database schema upgraded to version ' + String(iNewVersion) + '.');
                        doMigration(iVersion + 1);                        
                    } // end successCallback
                    ); // end .changeVersion
            } // end if arrMigrations[iVersion])
            else if (iVersion == iSchemaVersion)
            {
                $(document).trigger("dbReadyToRead");
            }
        } // end doMigration()
        
        assignMigration(1, function(t)
        {
            dbChecklistInstance.db.transaction(function (t)
            {
                t.executeSql('ALTER TABLE tabTasks ADD COLUMN dCompleted INTEGER', [], function(t,r){}, errorSQL);
            },
            errorTrans,
            successTrans
            );
            
            dbChecklistInstance.db.transaction(function (t)
            {
                t.executeSql('ALTER TABLE tabTasks ADD COLUMN iParentTaskID INTEGER', [], function(t,r){}, errorSQL);
            },
            errorTrans,
            successTrans
            );
            
            dbChecklistInstance.db.transaction(function (t)
            {
                t.executeSql('ALTER TABLE tabTasks ADD COLUMN iSubTaskID INTEGER', [], function(t,r){}, errorSQL);
            },
            errorTrans,
            successTrans
            );    
        }
        );
        
        console.log("dbChecklist, migrateDatabase(): dbChecklistInstance.db.version = " + dbChecklistInstance.db.version);
        doMigration(dbChecklistInstance.db.version);      
    } // end migrateDatabase()
    */
    
    this.addAchievement = function(achievementToAdd)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('INSERT INTO tabAchievements (iAchievementID, sDescription, dCompleted, iDayValue) VALUES (?, ?, ?, ?)',
                         [achievementToAdd.iAchievementID, achievementToAdd.sDescription, Date.parse(achievementToAdd.dCompleted.toString()), achievementToAdd.iDayValue],
                         function(t,r){},
                         errorSQL);
        },
        errorTrans,
        successTrans); // end .transaction()
        
        // add achievement to arrAchievements
        var i = 0;
        var bAchievementAdded = false;
        while ((i < arrAchievements.length) && (bAchievementAdded == false))
        {
            if (achievementToAdd.iAchievementID < arrAchievements[i].iAchievementID)
            {
                arrAchievements.splice(i, 0, achievementToAdd);
                bAchievementAdded = true;
            } // end if
            i++;
        }; // end while
        if (bAchievementAdded == false) // if the iAchievementID of the new achievement is greater than all achievementIDs
        {
            arrAchievements.push(achievementToAdd);
        }; // end if                
        
        // adjust iNextAchievementID
        if (iNextAchievementID <= achievementToAdd.iAchievementID)
        {
            iNextAchievementID = achievementToAdd.iAchievementID + 1;
        }; // end if
    }; // end addAchievement()
    
    this.addArchive = function(archiveToAdd)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('INSERT INTO tabArchive (iChecklistID, dCompleted, sEntry) VALUES (?, ?, ?)',
                         [archiveToAdd.iChecklistID, archiveToAdd.dCompleted.getTime(), archiveToAdd.sEntry],
                         function(t,r){},
                         errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
    }; // end addArchive()
        
    this.addBackup = function(dVersion)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('INSERT INTO tabBackup (dVersion) VALUES (?)',
                         [dVersion.getTime()],
                         function(t,r)
                         {
                            console.log("dbChecklist.addBackup : added " + dVersion.getTime());
                            console.log("dbChecklist.addBackup : trigger evtAddBackupComplete");
                            $(document).trigger("evtAddBackupComplete");
                         },
                         errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
    }; // end addBackup()
    
    this.addChecklist = function(checklistToAdd)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('INSERT INTO tabChecklists (iChecklistID, sDescription) VALUES (?, ?)',
                         [checklistToAdd.iChecklistID, checklistToAdd.getDescription()],
                         function(t,r){},
                         errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
    }; // end this.addChecklist()
    
    this.addStep = function(templateAssociated, stepToAdd)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('INSERT INTO tabSteps (iStepID, ' +
                                                'iTemplateID, ' +
                                                'iParentStepID, ' +
                                                'iPrevStepID, ' +
                                                'iNextStepID, ' +
                                                'iOrder, ' +
                                                'sDescription) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [stepToAdd.iStepID,
                         templateAssociated.iTemplateID,
                         stepToAdd.iParentStepID,
                         stepToAdd.iPrevStepID,
                         stepToAdd.iNextStepID,
                         stepToAdd.iOrder,
                         stepToAdd.sDescription],
                        function(t,r){},
                        errorSQL);
        },
        errorTrans,
        successTrans); // end .transaction()
    }; // end this.addStep()
    
    this.addTask = function(checklistAssociated, taskToAdd)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('INSERT INTO tabTasks (iParentTaskID, ' +
                                               'iTaskID, ' +
                                               'iChecklistID, ' +
                                               'iPrevTaskID, ' +
                                               'iNextTaskID, ' +
                                               'iOrder, ' +
                                               'sDescription, ' +
                                               'dDueDate, ' +
                                               'dCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [taskToAdd.iParentTaskID,
                         taskToAdd.iTaskID,
                         checklistAssociated.iChecklistID,
                         taskToAdd.iPrevTaskID,
                         taskToAdd.iNextTaskID,
                         taskToAdd.iOrder,
                         taskToAdd.sDescription,
                         taskToAdd.getDueDate(),
                         taskToAdd.dCompleted.getTime()],
                         function (t, r){},
                         errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
    }; // end this.addTask()
    
    this.addTemplate = function(templateToAdd)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('INSERT INTO tabTemplates (iTemplateID, ' +
                                                     'sDescription) VALUES (?, ?)',
                        [templateToAdd.iTemplateID,
                         templateToAdd.sDescription],
                        function(t,r) {},
                        errorSQL);
        },
        errorTrans,
        successTrans); // end .transaction()
    }; // end this.addTemplate()
    
    this.clearBackup = function()
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DELETE FROM tabBackup',
                         [],
                         function(t,r){},
                         errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
    }; // end this.clearBackup()
    
    this.clearDatabase = function()
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DROP TABLE IF EXISTS tabSettings', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans); // end .transaction()
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DROP TABLE IF EXISTS tabTasks', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans); // end .transaction()
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DROP TABLE IF EXISTS tabChecklists', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans); // end .transaction()
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DROP TABLE IF EXISTS tabSteps', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans); // end .transaction()
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DROP TABLE IF EXISTS tabTemplates', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans); // end .transaction()
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DROP TABLE IF EXISTS tabAchievements', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans); // end .transaction()
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DROP TABLE IF EXISTS tabArchive', [], function(t,r){}, errorSQL);
        },
        errorTrans,
        function ()
        {
            console.log("dbChecklist.clearDatabase : trigger evtDBCleared");
            $("#divGlobalEvents").trigger("evtDBCleared");
        }); // end .transaction()
        
    }; // end this.clearDatabase()
    
    this.completeAchievement = function(iAchievementID, dCompleted)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            console.log("executing completeAchievement : iAchievementID = " + iAchievementID);
            console.log("executing completeAchievement : dCompleted = " + dCompleted);
            console.log("executing completeAchievement : dCompleted.toString() = " + dCompleted.toString());
            console.log("executing completeAchievement : dCompleted.getTime() = " + dCompleted.getTime());
            t.executeSql('UPDATE tabAchievements SET dCompleted=? WHERE iAchievementID=?', [dCompleted.getTime(), iAchievementID], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans);
    }; // end this.completeAchievement()
    
    this.deleteBackup = function(backupToDelete)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DELETE FROM tabBackup WHERE dVersion=?', [backupToDelete.getTime()])
        },
        errorTrans,
        successTrans
        ); // end .transaction()
    }; // end deleteBackup()
    
    this.deleteChecklist = function(checklistToDelete)
    {
        console.log("dbChecklist.deleteChecklist : checklistToDelete.iChecklistID = " + checklistToDelete.iChecklistID);
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DELETE FROM tabArchive WHERE iChecklistID=?', [checklistToDelete.iChecklistID], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DELETE FROM tabTasks WHERE iChecklistID=?', [checklistToDelete.iChecklistID], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DELETE FROM tabChecklists WHERE iChecklistID=?', [checklistToDelete.iChecklistID], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
    }; // end this.deleteChecklist()
    
    this.deleteStep = function(stepToDelete)
    {
        for (var i = 0; i < stepToDelete.arrSubSteps.length; i++)
        {
            dbChecklistOpen.deleteStep(stepToDelete.arrSubSteps[i]);
        }; // end for
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DELETE FROM tabSteps WHERE iStepID=?', [stepToDelete.iStepID], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        );        
    }; // end this.deleteStep()
    
    this.deleteTask = function(taskToDelete)
    {
        for (var i = 0; i < taskToDelete.arrSubTasks.length; i++)
        {
            dbChecklistOpen.deleteTask(taskToDelete.arrSubTasks[i]);
        }; // end for
        
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DELETE FROM tabTasks WHERE iTaskID=?', [taskToDelete.iTaskID], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        );
    }; // end this.deleteTask()
    
    this.deleteTemplate = function(templateToDelete)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DELETE FROM tabSteps WHERE iTemplateID=?', [templateToDelete.iTemplateID], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('DELETE FROM tabTemplates WHERE iTemplateID=?', [templateToDelete.iTemplateID], function(t,r){}, errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction()        
    }; // end this.deleteTemplate()
    
    this.exportDatabase = function(sBackupFolder)
    {
        console.log("dbChecklist.exportDatabase : start");
        
        var sBackupPath = sFilePath;
        
        if (!(sBackupFolder === undefined))
        {
            sBackupPath += "/backup/" + sBackupFolder;
        }; // end if
        
        // check if /BBTasks folder exists
        if (blackberry.io.dir.exists(sBackupPath) == false)
        {
            console.log("dbChecklist.exportDatabase : trying to create folder");
            blackberry.io.dir.createNewDir(sBackupPath);
            console.log("dbChecklist.exportDatabase : folder created");
        }; // end if
        
        console.log("dbChecklist.exportDatabase : folder exists");
        
        // export schema
        if (blackberry.io.file.exists(sBackupPath + "/schema.txt") == true)
        {
            // delete old version of schema.txt
            blackberry.io.file.deleteFile(sBackupPath + "/schema.txt");
            console.log("schema.txt deleted");
        }; // end if

        console.log("dbChecklist.exportDatabase : checked if schema.txt deleted");
        
        var sSchemaExport = iSchemaVersion + ";\n" +
                            "tabSettings (sSetting TEXT, sValue TEXT);\n" +
                            "tabChecklists (iChecklistID INTEGER, sDescription TEXT);\n" +
                            "tabTasks (iParentTaskID INTEGER, " +
                                      "iTaskID INTEGER, " +
                                      "iChecklistID INTEGER, " +
                                      "iPrevTaskID INTEGER, " +
                                      "iNextTaskID INTEGER, " +
                                      "iOrder INTEGER, " +
                                      "sDescription TEXT, " +
                                      "dDueDate, INTEGER, " +
                                      "dCompleted, INTEGER);\n" +
                            "tabArchive (iChecklistID INTEGER, dCompleted INTEGER, sEntry TEXT);\n" +
                            "tabTemplates (iTemplateID INTEGER, sDescription TEXT);\n" +
                            "tabSteps (iStepID INTEGER, " +
                                        "iTemplateID INTEGER, " +
                                        "iParentStepID INTEGER, " +
                                        "iSubStepID INTEGER, " +
                                        "iOrder INTEGER, " +
                                        "sDescription TEXT);\n" +
                            "tabAchievements (iAchievement INTEGER, sDescription TEXT, dCompleted INTEGER, iDayValue INTEGER);\n";
        var blobWrite = blackberry.utils.stringToBlob(sSchemaExport);
        blackberry.io.file.saveFile(sBackupPath + "/schema.txt", blobWrite);
        
        console.log("dbChecklist.exportDatabase : schema.txt saved");
        
        // export tabSettings
        if (blackberry.io.file.exists(sBackupPath + "/tabSettings.csv") == true)
        {
            // delete old version of tabSettings.csv
            blackberry.io.file.deleteFile(sBackupPath + "/tabSettings.csv");
            console.log("tabSettings.csv deleted");
        } // end if
        var sTabSettingsExport = "sSetting|sValue;\n";
        // parse through tabSettings and add to sTabSettingsExport
        dbChecklistInstance.db.readTransaction(function (t)
        {
            t.executeSql('SELECT * FROM tabSettings', [], function(t,r)
            {
                for (var i = 0; i < r.rows.length; i++)
                {
                    sTabSettingsExport += r.rows.item(i).sSetting + "|" +
                                          r.rows.item(i).sValue + ";\n";
                } // end for
            },
            errorSQL); // end .executeSql
        },
        errorTrans,
        successTrans); // end readTransaction()
        blobWrite = blackberry.utils.stringToBlob(sTabSettingsExport);
        blackberry.io.file.saveFile(sBackupPath + "/tabSettings.csv", blobWrite);        
        
        // start: export tabChecklists and tabTasks
        if (blackberry.io.file.exists(sBackupPath + "/tabChecklists.csv") == true)
        {
            // delete old version of tabChecklists.csv
            blackberry.io.file.deleteFile(sBackupPath + "/tabChecklists.csv");
            console.log("tabChecklists.csv deleted");
        } // end if
        function exportSubTasks(arrSubTasksToExport, iChecklistIDPass)
        {
            var sTabSubTasksExport = "";
            
            for (var k = 0; k < arrSubTasksToExport.length; k++)
            {
                taskCurrent = arrSubTasksToExport[k];
                sTabSubTasksExport += String(taskCurrent.iTaskID) + "|"
                                + String(iChecklistIDPass) + "|"
                                + String(taskCurrent.iParentTaskID) + "|"
                                + String(taskCurrent.iPrevTaskID) + "|"
                                + String(taskCurrent.iNextTaskID) + "|"
                                + String(taskCurrent.iOrder) + "|"
                                + taskCurrent.sDescription + "|"
                                + taskCurrent.getDueDate() + "|"
                                + Date.parse(taskCurrent.dCompleted.toString()) + ";\n";
                if (taskCurrent.arrSubTasks.length > 0)
                {
                    sTabSubTasksExport += exportSubTasks(taskCurrent.arrSubTasks, iChecklistIDPass);
                }; // end if
            }; // end for
            
            return sTabSubTasksExport;
        }; // end exportSubTasks()
        var sTabChecklistsExport = "iChecklistID|sDescription;\n";
        var sTabTasksExport = "iTaskID|iChecklistID|iParentTaskID|iPrevTaskID|iNextTaskID|iOrder|sDescription|dDueDate|dCompleted;\n";
        for (var i = 0; i < arrChecklists.length; i++)
        {
            sTabChecklistsExport += String(arrChecklists[i].iChecklistID) + "|" + arrChecklists[i].getDescription() + ";\n";
            for (var j = 0; j < arrChecklists[i].arrTasks.length; j++)
            {
                var taskCurrent = arrChecklists[i].arrTasks[j];
                sTabTasksExport += String(taskCurrent.iTaskID) + "|"
                                + String(arrChecklists[i].iChecklistID) + "|"
                                + String(taskCurrent.iParentTaskID) + "|"
                                + String(taskCurrent.iPrevTaskID) + "|"
                                + String(taskCurrent.iNextTaskID) + "|"
                                + String(taskCurrent.iOrder) + "|"
                                + taskCurrent.sDescription + "|"
                                + taskCurrent.getDueDate() + "|"
                                + Date.parse(taskCurrent.dCompleted.toString()) + ";\n";
                if (taskCurrent.arrSubTasks.length > 0)
                {
                    sTabTasksExport += exportSubTasks(taskCurrent.arrSubTasks, arrChecklists[i].iChecklistID);
                }; // end if
            } // end for j
        }; // end for i
        blobWrite = blackberry.utils.stringToBlob(sTabChecklistsExport);
        blackberry.io.file.saveFile(sBackupPath + "/tabChecklists.csv", blobWrite);    
        
        // export tabTasks
        if (blackberry.io.file.exists(sBackupPath + "/tabTasks.csv") == true)
        {
            // delete old version of tabTasks.csv
            blackberry.io.file.deleteFile(sBackupPath + "/tabTasks.csv");
            console.log("tabTasks.csv deleted");
        }; //end if
        blobWrite = blackberry.utils.stringToBlob(sTabTasksExport);
        blackberry.io.file.saveFile(sBackupPath + "/tabTasks.csv", blobWrite);
        // end: export tabChecklists and tabTasks        
        
        // export tabArchive
        if (blackberry.io.file.exists(sBackupPath + "/tabArchive.csv") == true)
        {
            // delete old version of tabArchive.csv
            blackberry.io.file.deleteFile(sBackupPath + "/tabArchive.csv");
            console.log("tabArchive.csv deleted");
        }; // end if
        var sTabArchiveExport = "iChecklistID|dCompleted|sEntry;\n";
        dbChecklistInstance.db.readTransaction(function (t)
        {
            t.executeSql('SELECT * FROM tabArchive ORDER BY dCompleted', [], function(t,r)
                        {
                            for (var i = 0; i < r.rows.length; i++)
                            {
                                sTabArchiveExport += r.rows.item(i).iChecklistID + "|" +
                                                     r.rows.item(i).dCompleted + "|" +
                                                     r.rows.item(i).sEntry + ";\n";
                            }
                            
                            blobWrite = blackberry.utils.stringToBlob(sTabArchiveExport);
                            blackberry.io.file.saveFile(sBackupPath + "/tabArchive.csv", blobWrite);
                        },
                        errorSQL);
        },
        errorTrans,
        successTrans); // end .readTransaction()
        
        // start: export tabTemplates and tabSteps
        if (blackberry.io.file.exists(sBackupPath + "/tabTemplates.csv") == true)
        {
            // delete old version of tabChecklists.csv
            blackberry.io.file.deleteFile(sBackupPath + "/tabTemplates.csv");
            console.log("tabTemplates.csv deleted");
        } // end if
        function exportSubSteps(arrSubStepsToExport, iTemplateIDPass)
        {
            var sTabSubStepsExport = "";
            
            for (var k = 0; k < arrSubStepsToExport.length; k++)
            {
                stepCurrent = arrSubStepsToExport[k];
                sTabSubStepsExport += String(stepCurrent.iStepID) + "|"
                                + String(iTemplateIDPass) + "|"
                                + String(stepCurrent.iParentStepID) + "|"
                                + String(stepCurrent.iPrevStepID) + "|"
                                + String(stepCurrent.iNextStepID) + "|"
                                + String(stepCurrent.iOrder) + "|"
                                + stepCurrent.sDescription + ";\n";
                if (stepCurrent.arrSubSteps.length > 0)
                {
                    sTabSubStepsExport += exportSubSteps(taskCurrent.arrSubTasks, iTemplateIDPass);
                }; // end if
            }; // end for
            
            return sTabSubStepsExport;            
        }; // end exportSubSteps()
        var sTabTemplatesExport = "iTemplateID|sDescription;\n";
        var sTabStepsExport = "iStepID|iTemplateID|iParentStepID|iPrevStepID|iNextStepID|iOrder|sDescription;\n";
        for (var i = 0; i < arrTemplates.length; i++)
        {
            sTabTemplatesExport += String(arrTemplates[i].iTemplateID) + "|" + arrTemplates[i].sDescription + ";\n";
            for (var j = 0; j < arrTemplates[i].arrSteps.length; j++)
            {
                var stepCurrent = arrTemplates[i].arrSteps[j];
                sTabStepsExport += String(stepCurrent.iStepID) + "|"
                                + String(arrTemplates[i].iTemplateID) + "|"
                                + String(stepCurrent.iParentStepID) + "|"
                                + String(stepCurrent.iPrevStepID) + "|"
                                + String(stepCurrent.iNextStepID) + "|"
                                + String(stepCurrent.iOrder) + "|"
                                + stepCurrent.sDescription + ";\n";
                if (stepCurrent.arrSubSteps.length > 0)
                {
                    sTabStepsExport += exportSubSteps(stepCurrent.arrSubSteps, arrTemplates[i].iTemplateID);
                }; // end if
            } // end for j            
        }; // end for
        blobWrite = blackberry.utils.stringToBlob(sTabTemplatesExport);
        blackberry.io.file.saveFile(sBackupPath + "/tabTemplates.csv", blobWrite);
        // write tabSteps
        if (blackberry.io.file.exists(sBackupPath + "/tabSteps.csv") == true)
        {
            // delete old version of tabTasks.csv
            blackberry.io.file.deleteFile(sBackupPath + "/tabSteps.csv");
            console.log("tabSteps.csv deleted");
        }; //end if
        blobWrite = blackberry.utils.stringToBlob(sTabStepsExport);
        blackberry.io.file.saveFile(sBackupPath + "/tabSteps.csv", blobWrite);        
        // end: export tabTemplates and tabSteps
        
        // export tabAchievements
        if (blackberry.io.file.exists(sBackupPath + "/tabAchievements.csv") == true)
        {
            // delete old version of tabAchievements.csv
            blackberry.io.file.deleteFile(sBackupPath + "/tabAchievements.csv");
            console.log("tabAchievements.csv deleted");            
        }; // end if
        var sTabAchievementsExport = "iAchievementID|sDescription|dCompleted|iDayValue\n";
        // parse through tabAchievements and add to sTabAchievementsExport
        dbChecklistInstance.db.readTransaction(function (t)
        {
            t.executeSql('SELECT * FROM tabAchievements', [], function(t,r)
            {
                for (var i = 0; i < r.rows.length; i++)
                {
                    sTabAchievementsExport += r.rows.item(i).iAchievementID + "|" +
                                              r.rows.item(i).sDescription + "|" +
                                              r.rows.item(i).dCompleted + "|" +
                                              r.rows.item(i).iDayValue + ";\n";
                } // end for
                
                blobWrite = blackberry.utils.stringToBlob(sTabAchievementsExport);
                blackberry.io.file.saveFile(sBackupPath + "/tabAchievements.csv", blobWrite);
            },
            errorSQL); // end .executeSql                    
        },
        errorTrans,
        successTrans); // end readTransaction()
        
        if (sBackupFolder === undefined)
        {
            alert("Database export complete.");
        }; // end if
    }; // end this.exportDatabase
    
    this.importDatabase = function(sBackupFolder)
    {       
        // clearDatabase() -> checkTablesCreated() -> importDatabase()
        
        $("#divGlobalEvents").unbind("evtDBCheckTablesCompleted");
        $("#divGlobalEvents").bind("evtDBCheckTablesCompleted", function()
        {
            arrChecklists = [];
            arrAchievements = [];
            arrTemplates = [];
            iNextAchievementID = 0;
            iNextTemplateID = 0;
            iNextStepID = 0;
            iNextChecklistID = 0;
            iNextTaskID = 0;
            iImportSchemaVersion = iSchemaVersion;
            sDelimiter = '|';
            
            var sBackupPath = sFilePath;
            
            if (!(sBackupFolder === undefined))
            {
                sBackupPath += "/backup/" + sBackupFolder;
            }; // end if
            
            // import schema.txt
            if (blackberry.io.file.exists(sBackupPath + "/schema.txt") == true)
            {
                blackberry.io.file.readFile(sBackupPath + "/schema.txt",
                    function (fullPath, blobData)
                    {
                        var sStringData = blackberry.utils.blobToString(blobData);
                        var arrSchema = sStringData.split(";");
                        iImportSchemaVersion = parseInt(arrSchema[0]);
                        
                        if (iImportSchemaVersion <= 4)
                        {
                            sDelimiter = ",";
                        };
                        
                        console.log("dbChecklist.importDatabase : sStringData = " + sStringData);
                    },
                    false); // end readFile()
            }; // end if
            
            // import tabSettings.csv
            if (blackberry.io.file.exists(sBackupPath + "/tabSettings.csv") == true)
            {
                blackberry.io.file.readFile(sBackupPath + "/tabSettings.csv",
                    function (fullPath, blobData)
                    {
                        var sStringData = blackberry.utils.blobToString(blobData);
                        var arrImportSettings = sStringData.split(";");
                        
                        for (var i = 1; i < (arrImportSettings.length - 1); i++)
                        {
                            var arrImportSettingLine = arrImportSettings[i].split(sDelimiter);
                            
                            dbChecklistInstance.db.transaction(function (t)
                            {
                                t.executeSql("INSERT INTO tabSettings (sSetting, sValue) VALUES (?, ?)",
                                             [arrImportSettingLine[0], arrImportSettingLine[1]], function(t,r){}, errorSQL);
                            },
                            errorTrans,
                            successTrans);
                        }; // end for
                    },
                    false); // end readFile()
            }; // end if
            
            // import tabChecklists.csv
            if (blackberry.io.file.exists(sBackupPath + "/tabChecklists.csv") == true)
            {
                blackberry.io.file.readFile(sBackupPath + "/tabChecklists.csv",
                    function (fullPath, blobData)
                    {
                        var sStringData = blackberry.utils.blobToString(blobData);
                        var arrImportChecklists = sStringData.split(";");
                        
                        for (var i = 1; i < (arrImportChecklists.length - 1); i++)
                        {
                            var arrImportChecklistLine = arrImportChecklists[i].split(sDelimiter);
                            var checklistImportNew = new oChecklist();
                            
                            checklistImportNew.iChecklistID = parseInt(arrImportChecklistLine[0]);
                            if (checklistImportNew.iChecklistID >= iNextChecklistID)
                            {
                                iNextChecklistID = checklistImportNew.iChecklistID + 1;
                            }; // end if                        
                            checklistImportNew.setDescription(arrImportChecklistLine[1]);                            
                            // an updateChecklist() call is not required because the setDescription() call will update the database
                            
                            arrChecklists.push(checklistImportNew);
                        }; // end for                    
                    },
                    false); // end readFile()
            }; // end import tabChecklists.csv
            
            // import tabTasks.csv
            if (blackberry.io.file.exists(sBackupPath + "/tabTasks.csv") == true)
            {
                blackberry.io.file.readFile(sBackupPath + "/tabTasks.csv",
                    function (fullPath, blobData)
                    {
                        var sStringData = blackberry.utils.blobToString(blobData);
                        var arrImportTasks = sStringData.split(";");
                        
                        // flag which fields exist in tabTasks.csv
                        var iFieldChecklistID = -1;
                        var iFieldParentTaskID = -1;
                        var iFieldTaskID = -1;
                        var iFieldPrevTaskID = -1;
                        var iFieldNextTaskID = -1;
                        var iFieldOrder = -1;
                        var iFieldDescription = -1;
                        var iFieldDueDate = -1;
                        var iFieldCompleted = -1;
                        var arrImportTasksFields = arrImportTasks[0].split(sDelimiter);
                        for (var i = 0; i < arrImportTasksFields.length; i++)
                        {
                            if (arrImportTasksFields[i].localeCompare("iChecklistID") == 0)
                            {
                                iFieldChecklistID = i;
                            }; // end if
                            if (arrImportTasksFields[i].localeCompare("iParentTaskID") == 0)
                            {
                                iFieldParentTaskID = i;
                            }; // end if
                            if (arrImportTasksFields[i].localeCompare("iTaskID") == 0)
                            {
                                iFieldTaskID = i;
                            }; // end if
                            if (arrImportTasksFields[i].localeCompare("iPrevTaskID") == 0)
                            {
                                iFieldPrevTaskID = i;
                            }; // end if
                            if (arrImportTasksFields[i].localeCompare("iNextTaskID") == 0)
                            {
                                iFieldNextTaskID = i;
                            }; // end if
                            if (arrImportTasksFields[i].localeCompare("iOrder") == 0)
                            {
                                iFieldOrder = i;
                            }; // end if
                            if (arrImportTasksFields[i].localeCompare("sDescription") == 0)
                            {
                                iFieldDescription = i;
                            }; // end if
                            if (arrImportTasksFields[i].localeCompare("dDueDate") == 0)
                            {
                                iFieldDueDate = i;
                            }; // end if
                            if (arrImportTasksFields[i].localeCompare("dCompleted") == 0)
                            {
                                iFieldCompleted = i;
                            }; // end if   
                        }; // end for                    
                        
                        for (var i = 1; i < (arrImportTasks.length - 1); i++)
                        {
                            var arrImportTaskLine = arrImportTasks[i].split(sDelimiter);
                            var taskImportNew = new oTask();
                            
                            taskImportNew.iTaskID = parseInt(arrImportTaskLine[iFieldTaskID]);
                            if (taskImportNew.iTaskID >= iNextTaskID)
                            {
                                iNextTaskID = taskImportNew.iTaskID + 1;
                            }; // end if
                            if (iFieldParentTaskID > -1)
                            {
                                taskImportNew.iParentTaskID = parseInt(arrImportTaskLine[iFieldParentTaskID]);
                            }; // end if
                            taskImportNew.iOrder = parseInt(arrImportTaskLine[iFieldOrder]);
                            taskImportNew.sDescription = arrImportTaskLine[iFieldDescription];
                            if (iFieldDueDate > -1)
                            {
                                taskImportNew.setDueDate(parseInt(arrImportTaskLine[iFieldDueDate]));
                            }; // end if
                            if (iFieldCompleted > -1)
                            {
                                taskImportNew.dCompleted = new Date(parseInt(arrImportTaskLine[iFieldCompleted]));
                            }; // end if
                            
                            // insert Task into Checklist using iChecklistID
                            var checklistCurrent = arrChecklists[findChecklistIndex(parseInt(arrImportTaskLine[iFieldChecklistID]))];
                            dbChecklistThis.addTask(checklistCurrent, taskImportNew);
                            checklistCurrent.arrTasks.push(taskImportNew);
                        }; // end for
                        
                        // build the Tasks/subTasks tree structure
                        for (var i = 0; i < arrChecklists.length; i++)
                        {
                            var arrBuildTasksTree = [];
                            var j = 0;
                            while (arrChecklists[i].arrTasks.length > 0)
                            {
                                if (arrChecklists[i].arrTasks[j].iParentTaskID == -1)
                                {
                                    // the Task is a root Task
                                    arrBuildTasksTree.push(arrChecklists[i].arrTasks[j]);
                                    arrChecklists[i].arrTasks.splice(j,1);
                                    j = 0;
                                }
                                else
                                {
                                    // search for the parent Task
                                    var taskParent = findTaskInTree(arrBuildTasksTree, arrChecklists[i].arrTasks[j].iParentTaskID);
                                    
                                    if (taskParent != null)
                                    {
                                        taskParent.arrSubTasks.push(arrChecklists[i].arrTasks[j]);
                                        arrChecklists[i].arrTasks.splice(j,1);
                                        j = 0;
                                    }
                                    else
                                    {
                                        j++;
                                    }; // end if-else
                                }; // end if-else
                            }; // end while
                            arrChecklists[i].arrTasks = arrBuildTasksTree;
                        }; // end for
                    },
                    false); // end readFile()
            }; // end import tabTasks.csv
            
            // import tabArchive.csv
            if (blackberry.io.file.exists(sBackupPath + "/tabArchive.csv") == true)
            {
                blackberry.io.file.readFile(sBackupPath + "/tabArchive.csv",
                    function (fullPath, blobData)
                    {
                        var sStringData = blackberry.utils.blobToString(blobData);
                        var arrImportArchive = sStringData.split(";");
                        
                        for (var i = 1; i < (arrImportArchive.length - 1); i++)
                        {
                            var arrImportArchiveLine = arrImportArchive[i].split(sDelimiter);
                            var archiveImportNew = new oArchive();
                            
                            archiveImportNew.iChecklistID = parseInt(arrImportArchiveLine[0]);
                            archiveImportNew.dCompleted = new Date(parseInt(arrImportArchiveLine[1]));
                            archiveImportNew.sEntry = arrImportArchiveLine[2];
                            
                            // insert Archive into Checklist using iChecklistID
                            dbChecklistThis.addArchive(archiveImportNew);
                            arrChecklists[findChecklistIndex(archiveImportNew.iChecklistID)].arrArchive.push(archiveImportNew);
                        }; // end for
                    },
                    false); // end readFile()
            }; // end import tabArchive.csv
            
            // import tabTemplates.csv
            if (blackberry.io.file.exists(sBackupPath + "/tabTemplates.csv") == true)
            {
                blackberry.io.file.readFile(sBackupPath + "/tabTemplates.csv",
                    function (fullPath, blobData)
                    {
                        var sStringData = blackberry.utils.blobToString(blobData);
                        var arrImportTemplates = sStringData.split(";");
                        
                        for (var i = 1; i < (arrImportTemplates.length - 1); i++)
                        {
                            var arrImportTemplateLine = arrImportTemplates[i].split(sDelimiter);
                            var templateImportNew = new oTemplate();
                            
                            templateImportNew.iTemplateID = parseInt(arrImportTemplateLine[0]);
                            if (templateImportNew.iTemplateID >= iNextTemplateID)
                            {
                                iNextTemplateID = templateImportNew.iTemplateID + 1;
                            }; // end if                        
                            templateImportNew.sDescription = arrImportTemplateLine[1];
                            
                            dbChecklistThis.addTemplate(templateImportNew);
                            arrTemplates.push(templateImportNew);
                        }; // end for
                    },
                    false); // end readFile()
            }; // end import tabTemplates.csv
            
            // import tabSteps.csv
            if (blackberry.io.file.exists(sBackupPath + "/tabSteps.csv") == true)
            {
                blackberry.io.file.readFile(sBackupPath + "/tabSteps.csv",
                    function (fullPath, blobData)
                    {
                        var sStringData = blackberry.utils.blobToString(blobData);
                        var arrImportSteps = sStringData.split(";");
                        
                        // flag which fields exist in tabSteps.csv
                        var iFieldTemplateID = -1;
                        var iFieldParentStepID = -1;
                        var iFieldStepID = -1;
                        var iFieldPrevStepID = -1;
                        var iFieldNextStepID = -1;
                        var iFieldOrder = -1;
                        var iFieldDescription = -1;
                        var arrImportStepsFields = arrImportSteps[0].split(sDelimiter);
                        for (var i = 0; i < arrImportStepsFields.length; i++)
                        {
                            if (arrImportStepsFields[i].localeCompare("iTemplateID") == 0)
                            {
                                iFieldTemplateID = i;
                            }; // end if
                            if (arrImportStepsFields[i].localeCompare("iParentStepID") == 0)
                            {
                                iFieldParentStepID = i;
                            }; // end if
                            if (arrImportStepsFields[i].localeCompare("iStepID") == 0)
                            {
                                iFieldStepID = i;
                            }; // end if
                            if (arrImportStepsFields[i].localeCompare("iPrevStepID") == 0)
                            {
                                iFieldPrevStepID = i;
                            }; // end if
                            if (arrImportStepsFields[i].localeCompare("iNextStepID") == 0)
                            {
                                iFieldNextStepID = i;
                            }; // end if
                            if (arrImportStepsFields[i].localeCompare("iOrder") == 0)
                            {
                                iFieldOrder = i;
                            }; // end if
                            if (arrImportStepsFields[i].localeCompare("sDescription") == 0)
                            {
                                iFieldDescription = i;
                            }; // end if
                        }; // end for
                        
                        for (var i = 1; i < (arrImportSteps.length - 1); i++)
                        {
                            var arrImportStepLine = arrImportSteps[i].split(sDelimiter);
                            var stepImportNew = new oStep();
                            
                            stepImportNew.iStepID = parseInt(arrImportStepLine[iFieldStepID]);
                            if (stepImportNew.iStepID >= iNextStepID)
                            {
                                iNextStepID = stepImportNew.iStepID + 1;
                            }; // end if
                            if (iFieldParentStepID > -1)
                            {
                                stepImportNew.iParentStepID = parseInt(arrImportStepLine[iFieldParentStepID]);
                            }; // end if
                            stepImportNew.iOrder = parseInt(arrImportStepLine[iFieldOrder]);
                            stepImportNew.sDescription = arrImportStepLine[iFieldDescription];
                            
                            // insert Step into Template using iTemplateID
                            var templateCurrent = arrTemplates[findTemplateIndex(parseInt(arrImportStepLine[iFieldTemplateID]))];
                            dbChecklistThis.addStep(templateCurrent, stepImportNew);
                            templateCurrent.arrSteps.push(stepImportNew);
                        }; // end for
                        
                        // build the Steps/subSteps tree structure
                        for (var i = 0; i < arrTemplates.length; i++)
                        {
                            var arrBuildStepsTree = [];
                            var j = 0;
                            while (arrTemplates[i].arrSteps.length > 0)
                            {
                                if (arrTemplates[i].arrSteps[j].iParentStepID == -1)
                                {
                                    // the Step is a root-level Step
                                    arrBuildStepsTree.push(arrTemplates[i].arrSteps[j]);
                                    arrTemplates[i].arrSteps.splice(j,1);
                                    j = 0;
                                } // end if
                                else
                                {
                                    // search for the Parent step
                                    var stepParent = findStepInTree(arrBuildStepsTree, arrTemplates[i].arrSteps[j].iParentStepID);
                                    
                                    if (stepParent != null)
                                    {
                                        stepParent.arrSubSteps.push(arrTemplates[i].arrSteps[j]);
                                        arrTemplates[i].arrSteps.splice(j,1);
                                        j = 0;
                                    } // end if
                                    else
                                    {
                                        j++;
                                    }; // end else
                                }; // end else
                            }; // end while
                            arrTemplates[i].arrSteps = arrBuildStepsTree;
                        }; // end for
                    },
                    false); // end readFile()            
            }; // end import tabSteps.csv
            
            // import tabAchievements.csv
            if (blackberry.io.file.exists(sBackupPath + "/tabAchievements.csv") == true)
            {
                blackberry.io.file.readFile(sBackupPath + "/tabAchievements.csv",
                    function (fullPath, blobData)
                    {
                        var sStringData = blackberry.utils.blobToString(blobData);
                        var arrImportAchievements = sStringData.split(";");
                        
                        for (var i = 1; i < (arrImportAchievements.length - 1); i++)
                        {
                            var arrImportAchievementsLine = arrImportAchievements[i].split(sDelimiter);
                            var achievementImportNew = new oAchievement();
                            
                            achievementImportNew.iAchievementID = parseInt(arrImportAchievementsLine[0]);
                            if (achievementImportNew.iAchievementID >= iNextAchievementID)
                            {
                                iNextAchievementID = achievementImportNew.iAchievementID + 1;
                            }; // end if
                            achievementImportNew.sDescription = parseInt(arrImportAchievementsLine[1]);
                            achievementImportNew.dCompleted = new Date(parseInt(arrImportAchievementsLine[2]));
                            achievementImportNew.iDayValue = parseInt(arrImportAchievementsLine[3]);
                            
                            // insert Achievement into arrAchievements
                            dbChecklistThis.addAchievement(achievementImportNew);
                            arrAchievements.push(achievementImportNew);                        
                        }; // end for                                        
                        
                        alert('Database restore complete.');
                    },
                    false); // end readFile()
            }; // end if
        }); // end .bind "evtDBCheckTablesCompleted"
        
        $("#divGlobalEvents").unbind("evtDBCleared");
        $("#divGlobalEvents").bind("evtDBCleared", checkTablesCreated);
        
        dbChecklistThis.clearDatabase();
    }; // end this.importDatabase
    
    this.readDatabase = function(arrChecklists, arrAchievements)
    {       
        function readData()
        {           
            // read checklist data into arrChecklists
            dbChecklistInstance.db.readTransaction(function (t)
            {
                t.executeSql('SELECT * FROM tabChecklists', [], function (t, r)
                {
                    for (var i = 0; i < r.rows.length; i++)
                    {
                        var checklistNew = new oChecklist(true);
                        checklistNew.iChecklistID = r.rows.item(i).iChecklistID;
                        if (checklistNew.iChecklistID >= iNextChecklistID)
                        {
                            iNextChecklistID = checklistNew.iChecklistID + 1;
                        }; // end if
                        checklistNew.setDescription(r.rows.item(i).sDescription);
                        arrChecklists.push(checklistNew);
                    } // end for                    
                }, // end function(t, r)
                errorSQL); // end .executeSql            
            },
            errorTrans,
            function ()
            {
                console.log("dbChecklist.readDatabase readData : trigger dbReady tabChecklists");
                $(document).trigger("dbReady", ['tabChecklists']);                
            } // end function () for successCallback
            ); // end .readTransaction
            
            // read tasks data into arrChecklists.arrTasks
            dbChecklistInstance.db.readTransaction(function (t)
            {
                t.executeSql('SELECT * FROM tabTasks ORDER BY iOrder', [], function (t, r)
                {
                    for (var i = 0; i < r.rows.length; i++)
                    {
                        // build the new Task
                        var taskNew = new oTask();
                        taskNew.iTaskID = r.rows.item(i).iTaskID;
                        if (taskNew.iTaskID >= iNextTaskID)
                        {
                            iNextTaskID = taskNew.iTaskID + 1;
                        } // end if
                        if (r.rows.item(i).iParentTaskID != null)
                        {
                            taskNew.iParentTaskID = r.rows.item(i).iParentTaskID;
                        }; // end if
                        taskNew.iPrevTaskID = r.rows.item(i).iPrevTaskID;
                        taskNew.iNextTaskID = r.rows.item(i).iNextTaskID;
                        taskNew.iOrder = r.rows.item(i).iOrder;
                        taskNew.sDescription = r.rows.item(i).sDescription;
                        taskNew.setDueDate(r.rows.item(i).dDueDate);
                        taskNew.dCompleted = new Date(r.rows.item(i).dCompleted);
                        
                        // find checklist to add oTask to
                        // Just add the oTask in a one-dimensional array to the Checklist for now.
                        // The full tree structure will be built later
                        var iCounter = 0;
                        var iChecklistIDRead = r.rows.item(i).iChecklistID;
                        var checklistToAddTo = null;
                        while ((checklistToAddTo == null) && (iCounter < arrChecklists.length))
                        {
                            if (arrChecklists[iCounter].iChecklistID == iChecklistIDRead)
                            {
                                checklistToAddTo = arrChecklists[iCounter];
                            } // end if
                            iCounter++;
                        }; // end while
                        if (checklistToAddTo != null)
                        {
                            checklistToAddTo.arrTasks.push(taskNew);
                        }; // end if
                        
                    }; // end for
                    
                    // build the Tasks/subTasks tree structure
                    for (var i = 0; i < arrChecklists.length; i++)
                    {
                        var arrBuildTasksTree = [];
                        var j = 0;
                        while (arrChecklists[i].arrTasks.length > 0)
                        {
                            if (arrChecklists[i].arrTasks[j].iParentTaskID == -1)
                            {
                                // the Task is a root Task
                                arrBuildTasksTree.push(arrChecklists[i].arrTasks[j]);
                                arrChecklists[i].arrTasks.splice(j,1);
                                j = 0;
                            }
                            else
                            {
                                // search for the parent Task
                                var taskParent = findTaskInTree(arrBuildTasksTree, arrChecklists[i].arrTasks[j].iParentTaskID);
                                
                                if (taskParent != null)
                                {
                                    taskParent.arrSubTasks.push(arrChecklists[i].arrTasks[j]);
                                    arrChecklists[i].arrTasks.splice(j,1);
                                    j = 0;
                                }
                                else
                                {
                                    j++;
                                }; // end if-else
                            }; // end if-else
                        }; // end while
                        arrChecklists[i].arrTasks = arrBuildTasksTree;
                    }; // end for
                }, // end function (t, r)
                errorSQL
                ); // end .executeSql
            },
            errorTrans,
            function ()
            {
                console.log("dbChecklist.readDatabase readData : trigger dbReady tabTasks");
                $(document).trigger("dbReady", ['tabTasks']);                
            } // end successCallback
            ); // end .readTransaction for tabTasks
            
            // read templates data into arrTemplates
            dbChecklistInstance.db.readTransaction(function (t)
            {
                t.executeSql('SELECT * FROM tabTemplates', [], function (t,r)
                {
                    for (var i = 0; i < r.rows.length; i++)
                    {
                        var templateNew = new oTemplate();
                        templateNew.iTemplateID = r.rows.item(i).iTemplateID;
                        if (templateNew.iTemplateID >= iNextTemplateID)
                        {
                            iNextTemplateID = templateNew.iTemplateID + 1;
                        }; // end if
                        templateNew.sDescription = r.rows.item(i).sDescription;
                        arrTemplates.push(templateNew);
                    }; // end for
                },
                errorSQL); // end .executeSql
            },
            errorTrans,
            function ()
            {
                console.log("dbChecklist.readDatabase readData : trigger dbReady tabTemplates");
                $(document).trigger("dbReady", ['tabTemplates']);
            }); // end .readTransaction for tabTemplates
            
            // read steps data into arrTemplates.arrSteps
            dbChecklistInstance.db.readTransaction(function (t)
            {
                t.executeSql('SELECT * FROM tabSteps', [], function (t,r)
                {
                    for (var i = 0; i < r.rows.length; i++)
                    {
                        // build the new Step
                        var stepNew = new oStep();
                        stepNew.iStepID = r.rows.item(i).iStepID;
                        if (stepNew.iStepID >= iNextStepID)
                        {
                            iNextStepID = stepNew.iStepID + 1;
                        }; // end if
                        stepNew.iParentStepID = r.rows.item(i).iParentStepID;
                        stepNew.iPrevStepID = r.rows.item(i).iPrevStepID;
                        stepNew.iNextStepID = r.rows.item(i).iNextStepID;
                        stepNew.iOrder = r.rows.item(i).iOrder;
                        stepNew.sDescription = r.rows.item(i).sDescription;
                        
                        // find the Template to add the Step to
                        var iTemplateIndex = findTemplateIndex(r.rows.item(i).iTemplateID);
                        if (iTemplateIndex > -1)
                        {
                            arrTemplates[iTemplateIndex].arrSteps.push(stepNew);
                        }
                        else
                        {
                            console.log("dbChecklist.readData : ERROR - There is a Step in tabSteps that does not have a matching Template.");
                            console.log("dbChecklist.readDAta : iStepID = " + stepNew.iStepID);
                        }
                    }; // end for
                    
                    // build the Steps/subSteps tree structure
                    for (var i = 0; i < arrTemplates.length; i++)
                    {
                        var arrBuildStepsTree = [];
                        var j = 0;
                        
                        while (arrTemplates[i].arrSteps.length > 0)
                        {
                            if (arrTemplates[i].arrSteps[j].iParentStepID == -1)
                            {
                                // the Step is a root Step
                                arrBuildStepsTree.push(arrTemplates[i].arrSteps[j]);
                                arrTemplates[i].arrSteps.splice(j,1);
                                j = 0;
                            }
                            else
                            {
                                // search for the parent Step
                                var stepParent = findStepInTree(arrBuildStepsTree, arrTemplates[i].arrSteps[j].iParentStepID);
                                
                                if (stepParent != null)
                                {
                                    stepParent.arrSubSteps.push(arrTemplates[i].arrSteps[j]);
                                    arrTemplates[i].arrSteps.splice(j,1);
                                    j = 0;
                                }
                                else
                                {
                                    j++;
                                }; // end if-else
                            }
                        }; // end while
                        arrTemplates[i].arrSteps = arrBuildStepsTree;
                    }; // end for
                },
                errorSQL); // end .executeSql
            },
            errorTrans,
            function ()
            {
                console.log("dbChecklist.readDatabase readData : trigger dbReady tabSteps")
                $(document).trigger("dbReady", ['tabSteps']);
            }); // end .readTransaction for tabSteps
            
            // read archive data into arrArchive
            dbChecklistInstance.db.readTransaction(function (t)
            {
                t.executeSql('SELECT * FROM tabArchive ORDER BY dCompleted',
                             [],
                             function(t,r)
                             {
                                for (var i = 0; i < r.rows.length; i++)
                                {
                                    var archiveNew = new oArchive();
                                    
                                    archiveNew.iChecklistID = r.rows.item(i).iChecklistID;
                                    archiveNew.dCompleted = new Date(r.rows.item(i).dCompleted);
                                    archiveNew.sEntry = r.rows.item(i).sEntry;
                                    arrChecklists[findChecklistIndex(archiveNew.iChecklistID)].arrArchive.push(archiveNew);
                                }; // end for
                             },
                             errorSQL);
            },
            errorTrans,
            function ()
            {
                console.log("dbChecklist.readDatabase readData : trigger dbReady tabArchive");
                $(document).trigger("dbReady", ['tabArchive']);                
            } // end successCallback
            );
            
            // read achievements data into arrAchievements
            dbChecklistInstance.db.readTransaction(function (t)
            {
                t.executeSql('SELECT * FROM tabAchievements ORDER BY iAchievementID', [], function(t, r)
                {
                    for (var i = 0; i < r.rows.length; i++)
                    {
                        var achievementNew = new oAchievement();
                        
                        achievementNew.iAchievementID = r.rows.item(i).iAchievementID;
                        if (achievementNew.iAchievementID >= iNextAchievementID)
                        {
                            iNextAchievementID = achievementNew.iAchievementID + 1;
                        }; // end if
                        achievementNew.sDescription = r.rows.item(i).sDescription;
                        achievementNew.dCompleted = new Date(r.rows.item(i).dCompleted);
                        achievementNew.iDayValue = r.rows.item(i).iDayValue;                        
                        arrAchievements.push(achievementNew);
                        console.log("r.rows.item(i).dCompleted : " + r.rows.item(i).dCompleted);
                        console.log("achievement read from database : " +
                                    achievementNew.iAchievementID + ", " +
                                    achievementNew.sDescription + ", " +
                                    achievementNew.dCompleted.toString() + ", " +
                                    achievementNew.iDayValue);
                    }; // end for
                    
                    initAchievements();
                },
                errorSQL
                ); // end .executeSql
            },
            errorTrans,
            function ()
            {
                console.log("dbChecklist.readData : trigger dbReady tabAchievements");
                $(document).trigger("dbReady", ['tabAchievements']);                
            }
            ); // end .readTransaction tabAchievements
            
            // read backup versions into arrBackups
            dbChecklistInstance.db.readTransaction(function (t)
            {
                t.executeSql('SELECT * FROM tabBackup ORDER BY dVersion', [], function(t, r)
                {
                    for (var i = 0; i < r.rows.length; i++)
                    {
                        var backupVersionNew = new Date(r.rows.item(i).dVersion);
                        
                        arrBackups.push(backupVersionNew);
                    }; // end for
                },
                errorSQL
                ); // end .executeSql                
            },
            errorTrans,
            function ()
            {
                console.log("dbChecklist.readData : trigger dbReady tabBackup");
                $(document).trigger("dbReady", ['tabBackup']);     
            }); // end .readTransaction tabBackup
        }; // end readData()
        
        if (window.openDatabase)
        {
            console.log("dbChecklist.readDatabase : start");
            
            $("#divGlobalEvents").bind("evtDBOpen", checkTablesCreated);
            $("#divGlobalEvents").bind("evtDBCheckTablesCompleted", readData);
            
            try
            {
                dbChecklistInstance.db = window.openDatabase('dbChecklistMain',
                                                             "2",
                                                             'Bashbored Tasks database',
                                                             1*1024*1024,
                                                             function (dbCreatedPass)
                                                             {
                                                                onDBCreate(dbCreatedPass);
                                                                loadInitialDBValues();
                                                                loadSampleDBValues();
                                                             });
                
                console.log("dbChecklist.readDatabase : window.openDatabase called");
                
                // use .readTransaction to test if the database is ready to read
                dbChecklistInstance.db.readTransaction(function (t)
                {
                    t.executeSql('SELECT * FROM tabChecklists', [], function(t,r)
                    {
                        console.log("$('divGlobalEvents').trigger('evtDBOpen')");
                        $("#divGlobalEvents").trigger("evtDBOpen");
                    },
                    function(t,e){});
                },
                function(t){},
                successTrans
                ); // end .transaction
            }
            catch (e)
            {
                alert('Database does not match current version.');
                // the database does not open when opening according to the current version
                // dbChecklistInstance.db = window.openDatabase('dbChecklistMain', '', 'Bashbored Tasks database', 1*1024*1024, function(db){});
                // migrateDatabase();
            }
        }
        else
        {
            alert('This device does not have HTML5 Database support.');
        } // end if (window.openDatabase)
    } // end this.readDatabase()
    
    this.updateChecklist = function(checklistToWrite)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('UPDATE tabChecklists SET sDescription = ? WHERE iChecklistID = ?',
                         [checklistToWrite.getDescription(), checklistToWrite.iChecklistID],
                         function(t,r) {},
                         errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction
    }; // end this.updateChecklist()
        
    this.updateStep = function(stepToWrite)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('UPDATE tabSteps SET iParentStepID=?,' +
                                             'iPrevStepID=?,' +
                                             'iNextStepID=?,' +
                                             'sDescription=?,' +
                                             'iOrder=? ' +
                                             'WHERE iStepID = ?',
                         [stepToWrite.iParentStepID,
                          stepToWrite.iPrevStepID,
                          stepToWrite.iNextStepID,
                          stepToWrite.sDescription,
                          stepToWrite.iOrder,
                          stepToWrite.iStepID],
                         function(t,r) {},
                         errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction        
    }; // end this.updateStep()
    
    this.updateTask = function(taskToWrite)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('UPDATE tabTasks SET iParentTaskID=?,' +
                                             'iPrevTaskID=?,' +
                                             'iNextTaskID=?,' +
                                             'sDescription=?,' +
                                             'iOrder=?,' +
                                             'dDueDate=?,' +
                                             'dCompleted=? ' +
                                             'WHERE iTaskID = ?',
                         [taskToWrite.iParentTaskID,
                          taskToWrite.iPrevTaskID,
                          taskToWrite.iNextTaskID,
                          taskToWrite.sDescription,
                          taskToWrite.iOrder,
                          taskToWrite.getDueDate(),
                          taskToWrite.dCompleted.getTime(),
                          // Date.parse(taskToWrite.dCompleted.toString()),
                          taskToWrite.iTaskID],
                         function(t,r) {},
                         errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction
    }; // end this.updateTask()
        
    this.updateTemplate = function(templateToWrite)
    {
        dbChecklistInstance.db.transaction(function (t)
        {
            t.executeSql('UPDATE tabTemplates SET sDescription = ? WHERE iTemplateID = ?',
                         [templateToWrite.sDescription, templateToWrite.iTemplateID],
                         function(t,r) {},
                         errorSQL);
        },
        errorTrans,
        successTrans
        ); // end .transaction        
    }; // end this.updateTemplate
    
    function errorSQL(t, e)
    {
        alert(e.message);
    }; // end errorSQL
    
    function errorTrans(err)
    {
        alert(err.code + " " + err.message);
    }; // end errorTrans
    
    function successTrans()
    {
        // alert("successful transaction");
    }; // end successTrans
}; // end dbChecklist
