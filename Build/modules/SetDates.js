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
    convertGregorianDateToCopticDate(today.getTime());
    //copticDate = convertGregorianDateToCopticDate(todayDate);
    Season = Seasons.NoSeason; //this will be its default value unless it is changed by another function;
    //copticMonth = copticDate.slice(2, 4);
    copticReadingsDate = setSeasonAndCopticReadingsDate(copticDate);
    //copticDay = copticDate.slice(0, 2);
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
    //Showing the dates and the version
    document.getElementById('homeImg').insertAdjacentElement('beforebegin', showDates());
}
;
/**
 * Converts the provided Gregorian date into Coptic Date
 * @param {number} today - a number reflecting a date, which we will convert into coptic date. If ommitted, it will be set to the current date
 * @returns {number[]} - an array containing the following elements: [coptic day, coptic month, coptic year ]
 */
function convertGregorianDateToCopticDate(today) {
    let tout1 = new Date('1883.09.11').setUTCHours(0, 0, 0, 0); //this is the Gregorian date for the 1st of Tout of the Coptic year 1600 
    let year = 1600; //this is the coptic year starting on Sept 11, 1883
    today ?
        today = new Date(today).setHours(0, 0, 0, 0)
        : today = new Date().setHours(0, 0, 0, 0);
    let differenceInDays = (today - tout1) / calendarDay;
    let diffrenceInYears = Math.floor(differenceInDays / 365.25); //This gives the number of full Coptic years (based on 365.25 day/year)
    let daysInCurrentYear = ((differenceInDays / 365.25) - Math.trunc(differenceInDays / 365.25)) * 365.25;
    if (daysInCurrentYear === 0)
        daysInCurrentYear += 1;
    daysInCurrentYear = Math.ceil(daysInCurrentYear);
    let month = daysInCurrentYear / 30;
    if (daysInCurrentYear / 30 === 0)
        month = 1;
    month = Math.ceil(month);
    let day = Math.ceil(daysInCurrentYear % 30);
    if (day > 30)
        day -= 30;
    if (daysInCurrentYear % 30 === 0)
        day = 30;
    if (new Date(today).getFullYear() % 4 !== 3
        && month === 13
        && day === 6) {
        //We are not in a leap year
        day = 1;
        month = 1;
        year += 1;
    }
    year += Math.floor(diffrenceInYears);
    copticDay = day.toString();
    if (day < 10)
        copticDay = '0' + copticDay;
    copticMonth = month.toString();
    if (month < 10)
        copticMonth = '0' + copticMonth;
    copticDate = copticDay + copticMonth;
    copticYear = year.toString();
    return [[day, month, year], copticDate];
}
/**
 * Converts the Gregorian date to a string expressing the coptic date (e.g.: "0207")
 * @param {Date} date  - a date value expressing any Gregorian calendar date
 * @returns {string} - a string expressing the coptic date
 */
function convertGregorianDateToCopticDate_Old(date) {
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
        day < 7 ? (dm = [24, 11]) : (dm = [-6, 12]);
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
        console.log("original coptic day and month are: ", coptDay, coptMonth);
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
function setSeasonAndCopticReadingsDate(coptDate = copticDate, today = todayDate) {
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
    if (weekDay !== 0)
        return;
    let n = day;
    if (Season === Seasons.GreatLent)
        n = n - 2;
    n = Math.ceil(n / 7);
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
    let resurrection = new Date(resurrectionDate).setHours(0, 0, 0, 0);
    //We create a new date equal to "today", and will set its hour to 0
    let todayUTC = new Date(today).setHours(0, 0, 0, 0);
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
    let difference = Math.floor((resDate - today) / calendarDay); // we get the difference between the 2 dates in days
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
function showDates(newDiv) {
    if (!newDiv)
        newDiv = document.getElementById('dateDiv');
    if (!newDiv)
        newDiv = document.createElement('div');
    newDiv.style.padding = '3px 20px';
    newDiv.id = 'dateDiv';
    newDiv.style.fontSize = '8pt';
    newDiv.innerText =
        "Today: " +
            todayDate.toString() +
            " , Coptic date :  " +
            copticDay +
            "/" +
            copticMonth +
            "/" +
            copticYear +
            ". Coptic Readings: " +
            copticReadingsDate +
            '.\n We ' + `${isFast ? 'are ' : 'are not '}` + 'during a fast period' +
            " . Season = " + Season +
            " . Version = " + version;
    return newDiv;
}
;
/**
 * Changes the current Gregorian date and adjusts the coptic date and the coptic readings date, etc.
 * @param {string} date  - allows the user to pass the Greogrian calendar day to which he wants the date to be set, as a string provided from an input box or by the date picker
 * @param {boolean} next  - used when the user wants to jumb forward or back by only one day
 * @param {number} days  - the number of days by which the user wants to jumb forward or back
 * @returns {Date} - the Gregorian date as set by the user
 */
function changeDate(date, next = true, days = 1, showAlert = true) {
    if (date) {
        if (checkIfDateIsToday(date))
            todayDate = new Date();
        else
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
    if (showAlert)
        alert('Date was successfully changed to ' + todayDate.getDate().toString() + "/" + (todayDate.getMonth() + 1).toString() + "/" + todayDate.getFullYear().toString() + " which corresponds to " + copticDate + " of the coptic calendar ");
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
function testReadings() {
    addConsoleSaveMethod(console);
    let btns = [btnReadingsGospelIncenseDawn, btnReadingsGospelIncenseVespers, btnReadingsGospelMass, btnReadingsGospelNight, btnReadingsKatholikon, btnReadingsPraxis, btnReadingsPropheciesDawn, btnReadingsStPaul, btnReadingsSynaxarium];
    let query, result = '';
    setCopticDates(new Date('2022.12.31'));
    for (let i = 1; i < 367; i++) {
        changeDate(undefined, true, undefined, false);
        result += 'copticDate = ' + copticDate + '\n';
        result += 'copticReadingsDate = ' + copticReadingsDate + '\n';
        if (weekDay === 0)
            result += 'it is a Sunday \n';
        btns.forEach(btn => {
            if ((!(Season === Seasons.GreatLent
                || Season === Seasons.JonahFast))
                && (btn === btnReadingsGospelNight
                    || btn === btnReadingsPropheciesDawn))
                return;
            if ((Season === Seasons.GreatLent
                || Season === Seasons.JonahFast)
                &&
                    (weekDay === 0
                        || weekDay === 6)
                &&
                    (btn === btnReadingsPropheciesDawn))
                return; //During the Great Lent and Jonah Fast, only the week-days have Prophecies Readings in the Incense Dawn office
            if (Season === Seasons.GreatLent
                && weekDay !== 0
                && (btn === btnReadingsGospelIncenseVespers
                    || btn === btnReadingsGospelNight))
                return; //During the Great Lent, only Sunday has Vespers (on Saturday afternoon), and Gospel Night (on Sunday afternoon)
            if (Season === Seasons.GreatLent
                && weekDay === 0
                && btn === btnReadingsGospelIncenseVespers
                && copticReadingsDate === 'GL9thSunday')
                return; //no vespers for the Resurrection Sunday
            if (Season === Seasons.JonahFast
                && weekDay !== 1
                && btn === btnReadingsGospelIncenseVespers)
                return; //During the Jonah Fast, only Monday has Vespers prayers
            if (Season === Seasons.HolyWeek)
                return; //No readings during the holy week
            if (btn.prayersArray && btn.prayersSequence) {
                query = btn.prayersSequence[0] + '&D=' + copticReadingsDate + '&C=';
                let reading = btn.prayersArray.filter(tbl => tbl[0][0].startsWith(query));
                if (reading.length < 1)
                    result += '\tmissing: ' + btn.label.foreignLanguage + '\nquery= ' + query + '\n';
                if (reading.length > 1)
                    result += '\textra table: ' + query;
            }
        });
    }
    //@ts-ignore
    console.save(result, 'testReadings Result.doc');
    changeDate(new Date());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0RGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL1NldERhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsS0FBWTtJQUN6QyxJQUFJLENBQUMsS0FBSyxFQUNWO1FBQ0MsS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbkIsSUFBRyxZQUFZLENBQUMsWUFBWTtZQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQywySEFBMkg7S0FDbE07SUFDRCxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDbEQsMkRBQTJEO0lBQzNELE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBLENBQUMsMEVBQTBFO0lBQ3BHLHVDQUF1QztJQUN2QyxrQkFBa0IsR0FBRyw4QkFBOEIsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoRSxxQ0FBcUM7SUFDckMsTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFO1FBQ2QsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDcEcsa0NBQWtDO1lBQ2xDLE9BQU8sSUFBSSxDQUFBO1NBQ1g7YUFBTTtZQUFFLE9BQU8sS0FBSyxDQUFBO1NBQUU7UUFBQSxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDTCxtQ0FBbUM7SUFDbkMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsU0FB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QUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMxQztTQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0M7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM1QztTQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDWixFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxD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