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
    copticReadingsDate = getSeasonAndCopticReadingsDate(copticDate);
    if (checkIf29thOfCopticMonth())
        copticFeasts.theTwentyNinethOfCopticMonth = copticDate;
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
    year += diffrenceInYears;
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
    let dayString = day.toString().padStart(2, '0');
    let monthString = month.toString().padStart(2, '0');
    if (changeDates) {
        copticDay = dayString;
        copticMonth = monthString;
        copticDate = dayString + monthString;
        copticYear = year.toString();
    }
    return [[day, month, year], dayString + monthString];
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
    }
    else if (difference > 0 && difference < 58) {
        //We are during the Great Lent period which counts 56 days from the Saturday preceding the 1st Sunday (which is the begining of the so called "preparation week") until the Resurrection day
        if (copticDate === '1007')
            Season = Seasons.CrossFeast; //! CAUTION: This must come BEFORE Seasons.GreatLent because the cross feast is celebrated twice, one of which during the Great Lent (10 Bramhat). If we do not place this 'else if' condition before the Great Lent season, it will never be fulfilled during the Great Lent
        else if (difference < 7
            || (difference === 7 && todayDate.getHours() > 12))
            Season = Seasons.HolyWeek; //i.e., if we are between Monday and Friday of the Holy Week or if we are on Palm Sunday afternoon 
        else
            Season = Seasons.GreatLent;
        return isItSundayOrWeekDay(Seasons.GreatLent, 58 - difference, weekDay);
    }
    else if (difference > 65 && difference < 70) {
        //We are in the Jonah Feast days (3 days + 1)
        //The Jonah feast starts 15 days before the begining of the Great Lent
        //I didn't find the readings for this period in the Power Point presentations
        Season = Seasons.JonahFast;
        return isItSundayOrWeekDay(Seasons.JonahFast, Math.abs(70 - difference), weekDay);
    }
    else if (Math.abs(difference) < 50) {
        difference;
        // we are during the 50 Pentecostal days
        Season = Seasons.PentecostalDays;
        return isItSundayOrWeekDay(Seasons.PentecostalDays, Math.abs(difference), weekDay);
    }
    else if (Number(copticMonth) === 12 && Number(copticDay) < 16) {
        //We are during the St Mary Fast
        Season = Seasons.StMaryFast;
    }
    else if ((Number(copticMonth) === 1) && Number(copticDay) < 20) {
        if (Number(copticDay) < 17)
            Season = Seasons.Nayrouz;
        else if (Number(copticDay) > 16)
            Season = Seasons.CrossFeast;
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
    else if (difference < 0 && Math.abs(difference) > 49
        && (Number(copticMonth) < 11
            ||
                (Number(copticMonth) === 11 && Number(copticDay) < 5))) {
        //!CAUTION: this must come after all the cases preceding the begining of the Great Lent (otherwise, the 3rd condition: copticMonth <11, will be fulfilled and we will fall into this else if statement)
        //We are more than 50 days after Resurrection, which means that we are during the Apostles lent (i.e. the coptic date is before 05/11 which is the date of the Apostles Feast)
        //I didn't find specific readings for this period. I assume there are no specific reading and we follow the ordinary readings. This needs however to be checked that's why I kept this "else if" case
        Season = Seasons.ApostlesFast;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0RGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL1NldERhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOzs7R0FHRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsS0FBWTtJQUN6QyxJQUFJLENBQUMsS0FBSyxFQUNWO1FBQ0MsS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbkIsSUFBRyxZQUFZLENBQUMsWUFBWTtZQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQywySEFBMkg7S0FDbE07SUFDRCxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDbEQsMkRBQTJEO0lBQzNELE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBLENBQUMsMEVBQTBFO0lBQ3BHLGtCQUFrQixHQUFHLDhCQUE4QixDQUFDLFVBQVUsQ0FBVyxDQUFDO0lBQzFFLElBQUcsd0JBQXdCLEVBQUU7UUFBRSxZQUFZLENBQUMsNEJBQTRCLEdBQUcsVUFBVSxDQUFDO0lBRXRGLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsb0VBQW9FO0lBQ25HLG1DQUFtQztJQUNuQyxTQUFTLEVBQUUsQ0FBQztJQUNaLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQyxrQkFBa0I7UUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUM5RyxxQ0FBcUM7SUFDckMsTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFO1FBQ2QsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLGVBQWU7WUFBRSxPQUFPLEtBQUssQ0FBQzthQUNoRCxJQUFJLFdBQVcsQ0FBQyxPQUFPLENB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QyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQyxxQ0FBcUM7S0FDckM7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMxQztTQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0M7U0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO1NBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUs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