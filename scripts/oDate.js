function oDate()
{
    var sDate = "";
    var arrDate = [];
    var iYear = 0;
    var iMonth = 0;
    var iDayOfMonth = 0;
    var iHours = 0;
    var iMinutes = 0;
    var iSeconds = 0;
    var iMilliseconds = 0;
    
    this.getMillisecondEquivalent = function()
    {
        var iReturn = iYear;
        
        iReturn = (iReturn - 1970)*365 + Math.floor((iReturn - 1968)/4); // convert year to number of days
        for (var i = iMonth; i >= 0; i--) // add days for the month
        {
            if ((i == 0) || (i == 2) || (i == 4) || (i == 6) || (i == 7) || (i == 9) || (i == 11))
            {
                iReturn += 31;
            }; // end if - January, March, May, July, August, October, December
            if ((i == 3) || (i == 5) || (i == 8) || (i == 10))
            {
                iReturn += 30;
            }; // end if - April, June, September, November
            if ((i == 1) && (iYear%4 == 0))
            {
                iReturn += 29;
            }
            else if ((i == 1) && (iYear%4 != 0))
            {
                iReturn += 28;
            }; // end if - February
        }; // end for
        iReturn = iReturn*24 + iHours; // convert days to hours
        iReturn = iReturn*60 + iMinutes // convert hours to minutes
        iReturn = iReturn*60 + iSeconds // convert minutes to seconds
        iReturn = iReturn*1000 + iMilliseconds // convert seconds to milliseconds
        
        return iReturn;
    }; // end .getMillisecondEquivalent
    
    this.setMillisecondEquivalent = function(iMillisecondEquivalent)
    {
        console.log("oDate.setMillisecondEquivalent: iMillisecondEquivalent = " + iMillisecondEquivalent);
                
        iSeconds = Math.floor(iMillisecondEquivalent/1000);
        iMilliseconds = iMillisecondEquivalent%1000;
        console.log("oDate.setMillisecondEquivalent: iMilliseconds = " + iMilliseconds);
        
        iMinutes = Math.floor(iSeconds/60);
        iSeconds = iSeconds%60;
        console.log("oDate.setMillisecondEquivalent: iSeconds = " + iSeconds);
                    
        iHours = Math.floor(iMinutes/60);
        iMinutes = iMinutes%60;
        console.log("oDate.setMillisecondEquivalent: iMinutes = " + iMinutes);
        
        iDayOfMonth = Math.floor(iHours/24);
        iHours = iHours%24;
        console.log("oDate.setMillisecondEquivalent: iHours = " + iHours);
        
        iYear = (Math.floor(iDayOfMonth/(365+365+365+366)))*4;
        iDayOfMonth = iDayOfMonth%(365+365+365+366);
        iYear = iYear + Math.floor(iDayOfMonth/365) + 1970;
        iDayOfMonth = iDayOfMonth%365;
        console.log("oDate.setMillisecondEquivalent: iYear = " + iYear);
        
        var bDaysLeft = true;
        while (bDaysLeft)
        {
            bDaysLeft = false;
            if (((iMonth == 0) || (iMonth == 2) || (iMonth == 4) || (iMonth == 6) || (iMonth == 7) || (iMonth == 9)) && (iDayOfMonth > 31))
            {
                iDayOfMonth -= 31;
                iMonth++;
                bDaysLeft = true;
            }
            else if (((iMonth == 3) || (iMonth == 5) || (iMonth == 8) || (iMonth == 10)) && (iDayOfMonth > 30))
            {
                iDayOfMonth -= 30;
                iMonth++;
                bDaysLeft = true;
            }
            else if ((iMonth == 1) && (iYear%4 == 0) && (iDayOfMonth > 29))
            {
                iDayOfMonth -= 29;
                iMonth = 2;
                bDaysLeft = true;
            }
            else if ((iMonth == 1) && (iYear%4 != 0) && (iDayOfMonth > 28))
            {
                iDayOfMonth -= 28;
                iMonth = 2;
                bDaysLeft = true;
            }; // end else-if
        }; // end while
        console.log("oDate.setMillisecondEquivalent: iMonth = " + iMonth);
        console.log("oDate.setMillisecondEquivalent: iDayOfMonth = " + iDayOfMonth);
    }; // end .setMillisecondEquivalent()
    
    this.setStringDate = function (sStringDate)
    {
        sDate = sStringDate;
        arrDate = sStringDate.split(" ");
        iYear = Number(arrDate[3]);
        switch (arrDate[1])
        {
            case "Jan" :
                iMonth = 0;
                break;
            case "Feb" :
                iMonth = 1;
                break;
            case "Mar" :
                iMonth = 2;
                break;
            case "Apr" :
                iMonth = 3;
                break;
            case "May" :
                iMonth = 4;
                break;
            case "Jun" :
                iMonth = 5;
                break;
            case "Jul" :
                iMonth = 6;
                break;
            case "Aug" :
                iMonth = 7;
                break;
            case "Sep" :
                iMonth = 8;
                break;
            case "Oct" :
                iMonth = 9;
                break;
            case "Nov" :
                iMonth = 10;
                break;
            case "Dec" :
                iMonth = 11;
                break;
        }; // end switch
        iDayOfMonth = Number(arrDate[2]);
        var arrTime = arrDate[4].split(":");
        iHours = Number(arrTime[0]);
        iMinutes = Number(arrTime[1]);
        iSeconds = Number(arrTime[2]);
        
        var iTimeZoneOffset = Number(arrDate[5].substr(4));
        if (arrDate[5].charAt(3) == "-")
        iTimeZoneOffset = 0 - iTimeZoneOffset;
    }; // end .setStringDate()
    
    this.toString = function()
    {
        var sReturn = "";
        
        sReturn = iYear + " " + iMonth + " " + iDayOfMonth + " " + iHours + ":" + iMinutes + ":" + iSeconds;
        
        return sReturn;
    };
}