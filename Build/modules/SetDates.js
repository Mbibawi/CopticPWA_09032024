setCopticDates();
/**
 * a function that runs at the beginning and sets some global dates like the coptic date (as a string), today's Gregorian date (as a Date), the day of the week (as a number), the Season (a string), etc.
 * @param {Date} today  - a Gregorian date provided by the user or set automatically to the date of today if missing
 */
async function setCopticDates(today) {
    today ? (todayDate = today) : (todayDate = new Date());
    weekDay = todayDate.getDay();
    copticDate = convertGregorianDateToCopticDate(todayDate);
    Season = Seasons.NoSeason; //this will be its default value unless it is changed by another function;
    copticMonth = copticDate.slice(2, 4);
    copticReadingsDate = setSeasonAndCopticReadingsDate(copticDate);
    copticDay = copticDate.slice(0, 2);
    isFast = (() => {
        if (copticFasts.indexOf(Season) > -1 || (Season != Seasons.PentecostalDays && weekDay === (3 || 5))) {
            //i.e. if we are in a fasting day 
            return true;
        }
        else {
            return false;
        }
        ;
    })();
    showDates();
}
;
/**
 * Converts the Gregorian date to a string expressing the coptic date (e.g.: "0207")
 * @param {Date} date  - a date value expressing any Gregorian calendar date
 * @returns {string} - a string expressing the coptic date
 */
function convertGregorianDateToCopticDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1; //we add one because the months count starts at 0
    let coptMonth, coptDay, dm;
    if (month === 1) {
        day < 9 ? (dm = [22, 4]) : (dm = [-8, 5]);
    }
    else if (month === 2) {
        day < 7 ? (dm = [23, 5]) : (dm = [-7, 6]);
    }
    else if (month === 3) {
        day < 10 ? (dm = [21, 6]) : (dm = [-9, 7]);
        //console.log("march ", day + dm[0]);
    }
    else if (month === 4) {
        day < 9 ? (dm = [23, 7]) : (dm = [-8, 8]);
    }
    else if (month === 5) {
        day < 9 ? (dm = [23, 8]) : (dm = [-8, 9]);
    }
    else if (month === 6) {
        day < 8 ? (dm = [23, 9]) : (dm = [-7, 10]);
    }
    else if (month === 7) {
        day < 8 ? (dm = [23, 10]) : (dm = [-7, 11]);
    }
    else if (month === 8) {
        day < 7 ? (dm = [5, 11]) : (dm = [-6, 12]);
    }
    else if (month === 9) {
        if (day < 6) {
            dm = [25, 12];
        }
        else if ((day > 5 && day < 11) ||
            (day === 11 && date.getFullYear() % 4 === 3)) {
            //the 13th coptic month gets an additional 6th day every 4 years. It falls 1 year before the leap year of the Gregorian calendar. When we divide by 4, the remainder is 3
            dm = [-5, 13];
        }
        else {
            dm = [-10, 1];
        }
    }
    else if (month === 10) {
        day < 11 ? (dm = [20, 1]) : (dm = [-10, 2]);
    }
    else if (month === 11) {
        day < 11 ? (dm = [21, 2]) : (dm = [-9, 3]);
    }
    else if (month === 12) {
        day < 10 ? (dm = [21, 3]) : (dm = [-9, 4]);
    }
    setCopticDayAndMonth(dm);
    function setCopticDayAndMonth(daysMonth) {
        coptDay = day + daysMonth[0];
        coptMonth = daysMonth[1];
    }
    if (coptDay > 30) {
        console.log("copt day > 30", coptDay, coptMonth);
        coptDay = 1;
        coptMonth = coptMonth + 1;
    }
    if (date.getFullYear() % 4 === 0) {
        console.log("we are in a leap year");
        // we first check that we are in a leap year. Then we check that the day is after Feb 28th. If this is the case, we add 1 to the coptDay
        console.log("original coptic day and mont are ", coptDay, coptMonth);
        date > new Date(date.getFullYear().toString() + "-02-28") &&
            month === 2
            ? (coptDay = coptDay - 1)
            : coptDay;
        if (coptDay === 0) {
            coptDay = 30;
            coptMonth = coptMonth - 1;
        }
    }
    ;
    function getTwoDigitsStringFromNumber(n) {
        if (n < 10) {
            return "0" + n.toString();
        }
        else {
            return n.toString();
        }
    }
    ;
    return (getTwoDigitsStringFromNumber(coptDay) +
        getTwoDigitsStringFromNumber(coptMonth));
}
;
/**
 * Sets the coptic readings date according to the Katamaras
 * @param {string} coptDate  - a string expressing the coptic day and month (e.g.: "0306")
 * @returns {string} - a string expressing the coptic reading date (e.g.: "0512", "GreatLent20", "JonahFeast2", etc.)
 */
function setSeasonAndCopticReadingsDate(coptDate, today = todayDate) {
    if (!coptDate)
        return;
    let specialSeason = checkIfInASpecificSeason(today);
    if (specialSeason) {
        // it means we got a specific date for the Readings associated with a specific period (e.g.: Great Lent, PentecostalDays, etc.)
        return specialSeason;
    }
    else if (today.getDay() === 0) {
        // it means we are on an ordinary  Sunday (any sunday other than Great lent and Pentecostal period Sundays)
        // console.log('We are on a sunday')
        let sunday = checkWhichSundayWeAre(Number(coptDate.slice(0, 2)));
        //the readings for the 5th sunday of any coptic month (other than the 5th sunday of the Great Lent or the Pentecostal Days) are the same. We will then retrieve the readings of the 5th sunday of the first coptic month (Tout)
        sunday === "5thSunday"
            ? (sunday = "01" + sunday)
            : (sunday = copticMonth + sunday);
        return sunday;
    }
    else {
        // it means we are in an ordinary day and we follow the ordinary readings calender, this should return a coptic date in a string of "DDMM"
        let date = copticReadingsDates.filter(d => d[0] === coptDate);
        if (date[0]) {
            return date[0][1];
        }
        else {
            return coptDate;
        }
    }
}
;
/**
 * Checks which Sunday we are in the coptic month (i.e. is it the 1st Sunday? 2nd Sunday, etc.)
 * @param {number} day  - the day of the coptic month or the number of days since the beginning of a season like the Great Lent or the Pentecostal days
 * The function returns a string like "1stSunday", "2nd Sunday", etc.
 */
function checkWhichSundayWeAre(day) {
    let n = Math.ceil(day / 7);
    let sunday = n.toString();
    if (n === 1 || (n > 20 && n % 10 === 1)) {
        sunday = sunday + "stSunday";
    }
    else if (n === 2 || (n > 20 && n % 10 === 2)) {
        sunday = sunday + "ndSunday";
    }
    else if (n === 3 || (n > 20 && n % 10 === 3)) {
        sunday = sunday + "rdSunday";
    }
    else {
        sunday = sunday + "thSunday";
    }
    return sunday;
}
;
/**
 * It takes the date of today and checks whether according the Resurrection date this year, we are during an unfixed season like Great Lent, Pentecostal days or Apostles feast, etc.
 * @param {Date} today  - is the date of today according to the Gregorian calendar (it can be any day of the year if the user had manually set it)
 * @returns {string} - a string expressing the readings date . It will be added to the id of the reading in order to retrieve the coptic readings of the day
 */
function checkIfInASpecificSeason(today) {
    let readingsDate;
    //We filter the ResurrectionDates array for the resurrection date for the current year: 
    let resurrectionDate = ResurrectionDates.filter(date => new Date(date).getFullYear() === today.getFullYear())[0];
    //We create a new Date from the selected resurrection date, and will set its hour to UTC 0
    let resurrection = new Date(resurrectionDate).setUTCHours(0, 0, 0, 0);
    //We create a new date equal to "today", and will set its hour to 0
    let todayUTC = new Date(today).setUTCHours(0, 0, 0, 0);
    readingsDate = checkForUnfixedEvent(todayUTC, //this is a number reflecting the date of today at UTC 0 hour
    resurrection, //we get a number reflecting the resurrection date at UTC 0 hour
    today.getDay() //we get the day of the week as a number starting from 0
    );
    ;
    return readingsDate;
}
;
/**
 * Checks whether we are during the Great Lent Period, the Pentecoste days or any season
 * @param {number} today  - is a number of milliseconds equal to the date of today at UTC 0 hours
 *
 * @param {number} resDate  - is a number of milliseconds equal to date of Resurrection in current year at UTC 0 hours
 * @param {number} weekDay - is a number expressing which day of the week we are (e.g.: Sunday = 0)
 * @returns {string} - which is equal to the season: e.g.: "Resurrection", "GreatLent30", "Pentecoste20", etc.
 */
function checkForUnfixedEvent(today, resDate, weekDay) {
    let difference = (resDate - today) / calendarDay; // we get the difference between the 2 dates in days
    //We initiate the Season to NoSeason
    Season = Seasons.NoSeason;
    if (difference === 0 || (difference === 1 && todayDate.getHours() > 15)) {
        //If we are Saturday (which means that difference = 1) and we are after 3 PM, we will retrieve the readings of the Resurrection because we use to celebrate the Resurrection Mass on Saturday evening not on Sunday itself
        Season = Seasons.PentecostalDays; //we set teh Season value
        return isItSundayOrWeekDay(Seasons.GreatLent, 58, weekDay);
        //return copticFeasts.Resurrection; //we get the reading of Resurrection although we are still Saturday
    }
    else if (difference >= 1 && difference < 58) {
        //We are during the Great Lent period which counts 56 days from the Saturday preceding the 1st Sunday (which is the begining of the so called "preparation week") until the Resurrection day
        Season = Seasons.GreatLent;
        if ((difference < 7 && difference > 1)
            || difference === 7 && todayDate.getHours() > 12) {
            //i.e., if we are between Monday and Friday of the Holy Week or if we are on Palm Sunday afternoon
            Season = Seasons.HolyWeek;
        }
        return isItSundayOrWeekDay(Seasons.GreatLent, 58 - difference, weekDay);
    }
    else if (difference > 65 && difference < 70) {
        //We are in the Jonah Feast days (3 days + 1)
        //The Jonah feast starts 15 days before the begining of the Great Lent
        //I didn't find the readings for this period in the Power Point presentations
        Season = Seasons.JonahFast;
        return isItSundayOrWeekDay(Seasons.JonahFast, Math.abs(70 - difference), weekDay);
    }
    else if (difference < 0 && Math.abs(difference) < 50) {
        difference;
        // we are during the 50 Pentecostal days
        Season = Seasons.PentecostalDays;
        return isItSundayOrWeekDay(Seasons.PentecostalDays, Math.abs(difference), weekDay);
    }
    else if (Number(copticMonth) === 12 && Number(copticDay) < 16) {
        //We are during the St Mary Fast
        Season = Seasons.StMaryFast;
    }
    else if (Number(copticMonth) === 4 && Number(copticDay) < 29) {
        //We are during the month of Kiahk which starts on 16 Hatour and ends on 29 Kiahk
        Season = Seasons.Kiahk;
    }
    else if (Number(copticMonth) === 3 && Number(copticDay) > 15) {
        //We are during the Nativity Fast which starts on 16 Hatour and ends on 29 Kiahk, but we are not during the month of Kiahk
        Season = Seasons.NativityFast;
    }
    else if (copticDate === copticFeasts.NativityParamoun && todayDate.getHours() < 15) {
        //We are on the day before the Nativity Feast (28 Kiahk), and we are in the morning, it is the Parmoun of the Nativity
        return copticFeasts.NativityParamoun;
    }
    else if ((copticDate === copticFeasts.NativityParamoun && todayDate.getHours() > 15)
        || (Number(copticMonth) === 4 && Number(copticDay) > 28)
        || (Number(copticMonth) === 5 && Number(copticDay) < 7)) {
        //We are on the day before the Nativity Feast, and we are in the afternoon we will set the Season as Nativity and the copticReadingsDate to those of nativity
        Season = Seasons.Nativity; //From 28 Kiahk afternoon to Circumsion (6 Toubi)
    }
    else if ((Number(copticMonth) === 5 && Number(copticDay) === 10 && todayDate.getHours() > 15) ||
        (Number(copticMonth) === 5 && Number(copticDay) > 10 && Number(copticDay) < 13)) {
        //We are between the Nativity and the Baptism
        Season = Seasons.Baptism;
    }
    else if (Number(copticMonth) === 1 && Number(copticDay) < 17) {
        Season = Seasons.Nayrouz;
    }
    else if (Number(copticMonth) === 1 && Number(copticDay) > 16 && Number(copticDay) > 20) {
        Season = Seasons.CrossFeast;
    }
    else if (difference < 0 && Math.abs(difference) > 49
        && (Number(copticMonth) < 11
            ||
                (Number(copticMonth) === 11 && Number(copticDay) < 5))) {
        //IMPORTANT ! this must come after all the cases preceding the begining of the Great Lent (otherwise, the 3rd condition: copticMonth <11, will be fulfilled and we will fall into this else if statement)
        //We are more than 50 days after Resurrection, which means that we are potentially during the Apostles Lent
        // We are during the Apostles lent (i.e. the coptic date is before 05/11 which is the date of the Apostles Feast)
        //I didn't find specific readings for this period. I assume there are no specific reading and we follow the ordinary readings. This needs however to be checked that's why I kept this "else if" case
        Season = Seasons.ApostlesFast;
        //My understanding is that the readings during the Apostle fast follow the coptic calendar as any ordinary day. If not, we may activate the return value below
        return; //We are for now blocking the next return until we see if there are special readings
        return isItSundayOrWeekDay(Seasons.ApostlesFast, Math.abs(difference) - 49, weekDay);
    }
}
;
/**
 * If we are  during a given priod or season (like Great Lent): if we are a Sunday, it checks which Sunday of the coptic month we are and adds it to the "period" string. Otherwise, it adds the number of days elapsed since the beginning of the period
 * @param {string} period  - the season or the period *@param {number} days  - the number of days elapsed since the beginning of a given season or period, e.g.:
 * @param {number} weekDay - the day of the week as a number (Sunday = 0)
 * @returns {string} - the period/season after adding either the Sunday or the number of days elapsed
 */
function isItSundayOrWeekDay(period, days, weekDay) {
    if (weekDay === 0) {
        //we are a Sunday
        return period + checkWhichSundayWeAre(days);
    }
    else {
        // we are not a sunday
        return period + days.toString();
    }
}
;
/**
 * Shows the dates (Gregorian, coptic, coptic readings etc.), in an html element in the Temporary Dev Area
 */
function showDates() {
    let newDiv;
    if (document.getElementById('dateDiv')) {
        newDiv = document.getElementById('dateDiv');
    }
    else {
        newDiv = document.createElement('div');
        newDiv.id = 'dateDiv';
    }
    newDiv.style.fontSize = '8pt';
    document.getElementById('homeImg').insertAdjacentElement('beforebegin', newDiv);
    newDiv.innerText =
        "Today: " +
            todayDate.toString() +
            " , Coptic:  " +
            copticDay +
            "/" +
            copticMonth +
            ". Readings =" +
            copticReadingsDate +
            '. And we ' + `${isFast ? 'are ' : 'are not '}` + 'during a fast period' +
            " . Season = " + Season +
            " . Version = " + version;
}
;
/**
 * Changes the current Gregorian date and adjusts the coptic date and the coptic readings date, etc.
 * @param {string} date  - allows the user to pass the Greogrian calendar day to which he wants the date to be set, as a string provided from an input box or by the date picker
 * @param {boolean} next  - used when the user wants to jumb forward or back by only one day
 * @param {number} days  - the number of days by which the user wants to jumb forward or back
 * @returns {Date} - the Gregorian date as set by the user
 */
function changeDate(date, next = true, days = 1) {
    if (date) {
        todayDate.setTime(new Date(date).getTime());
    }
    else {
        if (next) {
            todayDate.setTime(todayDate.getTime() + days * calendarDay); //advancing the date by the number of calendar years
        }
        else if (!next) {
            todayDate.setTime(todayDate.getTime() - days * calendarDay);
        }
    }
    console.log(todayDate);
    setCopticDates(todayDate);
    setSeasonalTextForAll();
    reloadScriptToBody(['PrayersArray']);
    allSubPrayersArrays.forEach((subArray) => {
        for (let i = subArray.length - 1; i >= 0; i--)
            subArray.splice(i, 1);
    });
    populatePrayersArrays();
    let newDate = new Date();
    if (todayDate.getDate() === newDate.getDate() &&
        todayDate.getMonth() === newDate.getMonth() &&
        todayDate.getFullYear() === newDate.getFullYear()) {
        //it means that todayDate = the date of today (same day, same month, same year), in this case we set the local storage to undefined
        localStorage.selectedDate = undefined;
    }
    else {
        //If todayDate is not equal to the date of today, we store the manually selected date in the local storage
        localStorage.selectedDate = todayDate.getTime();
    }
    return todayDate;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0RGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL1NldERhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGNBQWMsRUFBRSxDQUFDO0FBQ2pCOzs7R0FHRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsS0FBWTtJQUN6QyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkQsT0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3QixVQUFVLEdBQUcsZ0NBQWdDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekQsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUEsQ0FBQywwRUFBMEU7SUFDcEcsV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLGtCQUFrQixHQUFHLDhCQUE4QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hFLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDZCxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLGVBQWUsSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNsRyxrQ0FBa0M7WUFDbEMsT0FBTyxJQUFJLENBQUE7U0FDWDthQUFJO1lBQUMsT0FBTyxLQUFLLENBQUE7U0FBQztRQUFBLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUNKLFNBQVMsRUFBRSxDQUFDO0FBQ2IsQ0FBQztBQUFBLENBQUM7QUFDRjs7OztHQUlHO0FBQ0gsU0FBUyxnQ0FBZ0MsQ0FBQyxJQUFVO0lBQ25ELElBQUksR0FBRyxHQUFXLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQyxJQUFJLEtBQUssR0FBVyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsaURBQWlEO0lBQzFGLElBQUksU0FBaUIsRUFBRSxPQUFlLEVBQUUsRUFBWSxDQUFDO0lBQ3JELElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUNoQixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDMUM7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQyxxQ0FBcUM7S0FDckM7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMxQztTQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0M7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMzQztTQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDWixFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxD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