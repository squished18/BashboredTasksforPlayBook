var menuMain = new function()
{
    this.hideMenuBar = function()
    {
        blackberry.app.event.onSwipeDown(menuMain.showMenuBar);
        document.removeEventListener("click", menuMain.hideMenuBar, false);
        $('#menuMain').animate({top : -100}, {queue : false});
    }; // end hideMenuBar()    
    
    this.menuOptions = function()
    {
        blackberry.app.event.onSwipeDown(null);
        document.removeEventListener("click", menuMain.hideMenuBar, false);
        $('#menuMain').animate({top : -100}, {queue : false});
        screenMainInstance.clearEventListeners();
        $('#divScreenMain').remove();
        
        screenOptions.displayScreen();
        screenOptions.startEventListeners();
    }; // end menuOptions()
    
    this.menuTemplates = function()
    {
        blackberry.app.event.onSwipeDown(null);
        document.removeEventListener("click", menuMain.hideMenuBar, false);
        $('#menuMain').animate({top : -100}, {queue : false});
        $('#divScreenMain').remove();
        
        screenTemplates.displayScreen();
        screenTemplates.startEventListeners();
    }; // end menuTemplates()
    
    this.showMenuBar = function()
    {
        console.log("showMenuBar called");
        blackberry.app.event.onSwipeDown(menuMain.hideMenuBar);
        document.addEventListener("click", menuMain.hideMenuBar, false);
        $('#menuMain').animate({top : 0}, {queue : false});
    }; // end showMenuBar()
    
    this.startEventListeners = function ()
    {
        blackberry.app.event.onSwipeDown(menuMain.showMenuBar);

        $('#buttonContact').unbind();
        $('#buttonContact').click(function (evt)
        {
            var remote = new blackberry.transport.RemoteFunctionCall("blackberry/invoke/invoke");
            remote.addParam("appType", "mailto:bashbored@gmail.com?subject=Bashbored Tasks for BlackBerry PlayBook&body=");
            remote.makeAsyncCall();
        }); // end .click
        $('#buttonOptions').unbind();
        $('#buttonOptions').click(function (evt)
        {
            evt.stopPropagation();
            menuMain.menuOptions();
        }); // end .click
        $('#buttonTemplates').unbind();
        $('#buttonTemplates').click(function (evt)
        {
            evt.stopPropagation();
            menuMain.menuTemplates();
        }); // end .click
    }; // end startEventListeners
}; // end menuMain





