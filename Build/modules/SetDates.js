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
    copticReadingsDate = getSeasonAndCopticReadingsDate(copticDate);
    setSeasonalTextForAll(Season); //!This must be called here after the dates and seasons were changed
    //Showing the dates and the version
    showDates();
    createFakeAnchor('homeImg');
    if (!copticReadingsDate)
        return console.log('copticReadingsDate was not property set = ', copticReadingsDate);
    //copticDay = copticDate.slice(0, 2);
    isFast = (() => {
        if (Season === Seasons.PentecostalDays)
            return false;
        else if (copticFasts.indexOf(Season) > -1)
            return true; //i.e. if we are during a fast period 
        else if (weekDay === (3 || 5))
            return true;
        else
            return false;
    })();
}
/**
 * Converts the provided Gregorian date into Coptic Date
 * @param {number} today - a number reflecting a date, which we will convert into coptic date. If ommitted, it will be set to the current date
 * @param {boolean} changeDates - tells whether the function should change the Coptic dates or should just return the new Coptic Date
 * @returns {[number[], string]} - an array containing as 1st element an array representing the coptic day, coptic month, and coptic year, the second elemement of the array is a string representing the copitc date formatted as 'DDMM'
 */
function convertGregorianDateToCopticDate(today, changeDates = true) {
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
    if (changeDates) {
        copticDay = day.toString();
        if (day < 10)
            copticDay = '0' + copticDay;
        copticMonth = month.toString();
        if (month < 10)
            copticMonth = '0' + copticMonth;
        copticDate = copticDay + copticMonth;
        copticYear = year.toString();
    }
    return [[day, month, year], copticDate];
}
/**
 * Converts the Gregorian date to a string expressing the coptic date (e.g.: "0207")
 * @param {Date} date  - a date value expressing any Gregorian calendar date
 * @returns {string} - a string expressing the coptic date
 */
function convertGregorianDateToCopticDate_OldNotUsedAnyMore(date) {
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
function getSeasonAndCopticReadingsDate(coptDate = copticDate, today = todayDate) {
    if (!coptDate)
        return console.log('coptDate is not valid = ', coptDate);
    let specialSeason = checkIfInASpecificSeason(today);
    if (specialSeason) {
        // it means we got a specific date for the Readings associated with a specific period (e.g.: Great Lent, PentecostalDays, etc.)
        return specialSeason;
    }
    else if (today.getDay() === 0) {
        // it means we are on an ordinary  Sunday (any sunday other than Great lent and Pentecostal period Sundays)
        // console.log('We are on a sunday')
        let sunday = checkWhichSundayWeAre(Number(copticDay), today.getDay());
        //the readings for the 5th sunday of any coptic month (other than the 5th sunday of the Great Lent or the Pentecostal Days) are the same. We will then retrieve the readings of the 5th sunday of the first coptic month (Tout)
        sunday === "5thSunday"
            ? (sunday = "01" + sunday)
            : (sunday = copticMonth + sunday);
        return sunday;
    }
    else {
        // it means we are in an ordinary day and we follow the ordinary readings calender, this should return a coptic date in a string of "DDMM"
        let date = copticReadingsDates.filter(datesArray => datesArray.indexOf(coptDate) > 0);
        if (date[0])
            return date[0][0];
        else
            return coptDate;
    }
}
;
/**
 * Checks which Sunday we are in the coptic month (i.e. is it the 1st Sunday? 2nd Sunday, etc.)
 * @param {number} day  - the day of the coptic month or the number of days since the beginning of a season like the Great Lent or the Pentecostal days
 * The function returns a string like "1stSunday", "2nd Sunday", etc.
 */
function checkWhichSundayWeAre(day, theWeekDay) {
    if (theWeekDay !== 0)
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
        return period + checkWhichSundayWeAre(days, weekDay);
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
function showDates(dateDiv = document.getElementById('dateDiv')) {
    if (!dateDiv) {
        dateDiv = containerDiv.insertAdjacentElement('beforebegin', document.createElement('div'));
        dateDiv.classList.add('dateDiv');
        dateDiv.id = 'dateDiv';
    }
    ;
    if (!dateDiv)
        return;
    //Inserting the Gregorian date
    let date = 'Date: ' +
        todayDate.getDate().toString() + '/' +
        (todayDate.getMonth() + 1).toLocaleString('en-US') + '/' +
        (todayDate.getFullYear() + 1).toString();
    insertDateBox(date, 'gregorianDateBox');
    //Inserting the home image after the dateBox
    if (!dateDiv.querySelector('#homeImg'))
        dateDiv.appendChild(document.getElementById('homeImg'));
    //Inserting the Coptic date
    date = 'Coptic Date: ' +
        copticDay + ' ' +
        copticMonths[Number(copticMonth)].EN + ' ' +
        copticYear + ' \n' +
        'Readings date: ' +
        (() => {
            if (copticReadingsDate.startsWith(Seasons.GreatLent))
                return 'Day ' + copticReadingsDate.split(Seasons.GreatLent)[1] + 'of the Great Lent';
            if (copticReadingsDate.startsWith(Seasons.PentecostalDays))
                return 'Day ' + copticReadingsDate.split(Seasons.PentecostalDays)[1] + ' of the 50 Pentecostal Days';
            if (copticReadingsDate.endsWith('Sunday')
                && copticMonths[Number(copticReadingsDate.slice(0, 2))])
                return copticMonths[Number(copticReadingsDate.slice(0, 2))].EN + ' ' + copticReadingsDate.slice(2, copticReadingsDate.length).split('Sunday')[0] + ' Sunday';
            if (copticMonths[Number(copticReadingsDate.slice(2, 4))])
                return copticReadingsDate.slice(0, 2) + ' ' +
                    copticMonths[Number(copticReadingsDate.slice(2, 4))].EN;
            return '';
        })();
    insertDateBox(date, 'copticDateBox');
    function insertDateBox(date, id) {
        let dateBox = document.getElementById(id);
        //Inserting a date box
        if (!dateBox) {
            dateBox = dateDiv.appendChild(document.createElement('div'));
            dateBox.id = id;
            dateBox.style.display = 'block !important';
            dateBox.classList.add('dateBox');
        }
        ;
        dateBox.innerHTML = ''; //we empty the div
        let p = dateBox.appendChild(document.createElement('p'));
        p.innerText = date;
    }
    //Inserting a creditials Div after containerDiv
    let credentialsDiv = containerDiv.insertAdjacentElement('afterend', document.createElement('div'));
    credentialsDiv.classList.add('credentialsDiv');
    credentialsDiv.id = 'credentialsDiv';
    credentialsDiv.style.padding = '3px 20px';
    credentialsDiv.innerText =
        "Today: " +
            todayDate.toString() +
            " .\n Season = " + Season +
            " .\n Version = " + version + '.\n' +
            'We ' + `${isFast ? 'are ' : 'are not '}` + 'during a fast period or on a fast day (Wednesday or Friday';
    return dateDiv;
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
    reloadScriptToBody(['PrayersArray']);
    Object.entries(PrayersArrays)
        .forEach((array) => PrayersArrays[array[0]] = []);
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
    let btns = [...btnDayReadings.children, btnReadingsGospelNight, btnReadingsPropheciesDawn];
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
                    result += '\tmissing: ' + btn.label.FR + '\nquery= ' + query + '\n';
                if (reading.length > 1)
                    result += '\textra table: ' + query;
            }
        });
    }
    //@ts-ignore
    console.save(result, 'testReadings Result.doc');
    changeDate(new Date());
}
function testDateFunction(date = new Date('2022.12.31')) {
    addConsoleSaveMethod(console);
    setCopticDates(date);
    let text = '';
    for (let i = 1; i < 800; i++) {
        changeDate(undefined, true, undefined, false);
        text += 'Gregorian = ' + todayDate.getDate().toString() + '/' + (todayDate.getMonth() + 1).toString() + '/' + todayDate.getFullYear().toString() + '\t';
        text += 'Coptic = ' + copticDate + '\t';
        text += 'Readings = ' + copticReadingsDate + '\n';
    }
    //@ts-ignore
    console.save(text, 'testDateFunction.doc');
    changeDate(new Date());
}
/**
 * It was created to reorganise the copticReadingsDates array. It was used once, and we will not most probably need to use it again. Will not delete it immediately though
 */
function groupReadingsDates() {
    let unique = new Set();
    let dates = [];
    copticReadingsDates
        .forEach(dateArray => {
        if (unique.has(dateArray[1]))
            return;
        unique.add(dateArray[1]);
        dates.push([dateArray[1]]);
        copticReadingsDates
            .filter(array => array[1] === dateArray[1])
            .forEach(arrayDate => dates[dates.length - 1].push(arrayDate[0]));
    });
    console.log(dates);
    dates
        .forEach(groupArray => {
        copticReadingsDates
            .filter(dateArray => dateArray[1] === groupArray[0])
            .forEach(dateArray => {
            console.log(dateArray[0]);
            if (groupArray.indexOf(dateArray[0]) < 0)
                console.log('something wrong', groupArray);
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0RGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL1NldERhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOzs7R0FHRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsS0FBWTtJQUN6QyxJQUFJLENBQUMsS0FBSyxFQUNWO1FBQ0MsS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbkIsSUFBRyxZQUFZLENBQUMsWUFBWTtZQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQywySEFBMkg7S0FDbE07SUFDRCxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDbEQsMkRBQTJEO0lBQzNELE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBLENBQUMsMEVBQTBFO0lBQ3BHLHVDQUF1QztJQUN2QyxrQkFBa0IsR0FBRyw4QkFBOEIsQ0FBQyxVQUFVLENBQVcsQ0FBQztJQUMxRSxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9FQUFvRTtJQUNuRyxtQ0FBbUM7SUFDbkMsU0FBUyxFQUFFLENBQUM7SUFDWixnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1QixJQUFJLENBQUMsa0JBQWtCO1FBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLDRDQUE0QyxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFDOUcscUNBQXFDO0lBQ3JDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRTtRQUNkLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxlQUFlO1lBQUUsT0FBTyxLQUFLLENBQUM7YUFDaEQsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFD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cUM7S0FDckM7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMxQztTQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0M7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENB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