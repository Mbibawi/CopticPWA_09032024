/**
 * a function that runs at the beginning and sets some global dates like the coptic date (as a string), today's Gregorian date (as a Date), the day of the week (as a number), the Season (a string), etc.
 * @param {Date} today  - a Gregorian date provided by the user or set automatically to the date of today if missing
 */
async function setCopticDates(today) {
    if (!today) {
        today = new Date();
        if (localStorage.selectedDate)
            localStorage.removeItem('selectedDate'); //We do this in order to reset the local storage 'selectedDate' when setCopticDates() is called without a date passed to it
    }
    todayDate = today;
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
    setCopticDates(todayDate);
    setSeasonalTextForAll();
    reloadScriptToBody(['PrayersArray']);
    allSubPrayersArrays.forEach((subArray) => {
        for (let i = subArray.length - 1; i >= 0; i--)
            subArray.splice(i, 1);
    });
    populatePrayersArrays();
    if (checkIfDateIsToday(todayDate)) {
        localStorage.removeItem('selectedDate');
    }
    else {
        //If todayDate is not equal to the date of today (not same day and same month and same year), we store the manually selected date in the local storage
        localStorage.selectedDate = todayDate.getTime().toString();
    }
    console.log(todayDate);
    alert('Date was successfully change to ' + todayDate.getDate().toString() + "/" + todayDate.getMonth().toString() + "/" + todayDate.getFullYear().toString() + " which corresponds to " + copticDate + " of the coptic calendar ");
    return todayDate;
}
/**
 * Checks whether the date passed to it is today
 * @param {Date} storedDate  - The date which we want to check if it corresponds to today
 * @returns {boolean} - returns true if storedDate is same as today
 */
function checkIfDateIsToday(date) {
    let newDate = new Date();
    if (date.getDate() === newDate.getDate()
        && date.getMonth() === newDate.getMonth()
        && date.getFullYear() === newDate.getFullYear()) {
        return true;
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0RGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL1NldERhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsS0FBWTtJQUN6QyxJQUFJLENBQUMsS0FBSyxFQUNWO1FBQ0MsS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbkIsSUFBRyxZQUFZLENBQUMsWUFBWTtZQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQywySEFBMkg7S0FDbE07SUFDRCxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsVUFBVSxHQUFHLGdDQUFnQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pELE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBLENBQUMsMEVBQTBFO0lBQ3BHLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyQyxrQkFBa0IsR0FBRyw4QkFBOEIsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoRSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFO1FBQ2QsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDbEcsa0NBQWtDO1lBQ2xDLE9BQU8sSUFBSSxDQUFBO1NBQ1g7YUFBSTtZQUFDLE9BQU8sS0FBSyxDQUFBO1NBQUM7UUFBQSxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUE7SUFDSixTQUFTLEVBQUUsQ0FBQztBQUNiLENBQUM7QUFBQSxDQUFDO0FBQ0Y7Ozs7R0FJRztBQUNILFNBQVMsZ0NBQWdDLENBQUMsSUFBVTtJQUNuRCxJQUFJLEdBQUcsR0FBVyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakMsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGlEQUFpRDtJQUMxRixJQUFJLFNBQWlCLEVBQUUsT0FBZSxFQUFFLEVBQVksQ0FBQztJQUNyRCxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDaEIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMxQztTQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUN2QixHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MscUNBQXFDO0tBQ3JDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMxQztTQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDMUM7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzNDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM1QztTQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0M7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsSUFBSSxHQUFHLEdBQUcsQ0FB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