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
    convertGregorianDateToCopticDate(today.getTime(), true);
    Season = Seasons.NoSeason; //this will be its default value unless it is changed by another function;
    copticReadingsDate = getSeasonAndCopticReadingsDate(copticDate);
    if (checkIf29thOfCopticMonth())
        copticFeasts.theTwentyNinethOfCopticMonth = copticDate;
    await setSeasonalTextForAll(Season); //!This must be called here after the dates and seasons were changed
    reloadScriptToBody(['PrayersArray']);
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
    //Showing the dates and the version
    showDates(); //!Caution: showDates must come after isFast is set.
}
/**
 * Converts a date
 * @param {number[]} copticDate - the copticDate for which we want to get the gregorian date, it must be formatted as [day, month, year]
 * @returns
 */
function convertCopticDateToGregorianDate(copticDate, gregorianDate) {
    if (!copticDate || copticDate.length < 3)
        return;
    let currentCopticDate = convertGregorianDateToCopticDate()[0]; //This will give a [day, month, year] array
    let yearsDifference = copticDate[2] - currentCopticDate[2];
    let monthsDifference = copticDate[1] - currentCopticDate[1];
    let daysDifference = copticDate[0] - currentCopticDate[0];
    let calendarDaysDifference = ((yearsDifference * 365) + (monthsDifference * 30) + daysDifference) * calendarDay;
    calendarDaysDifference = calendarDaysDifference + (yearsDifference / 4); //Leap years
    if (!gregorianDate)
        gregorianDate = todayDate.getDate();
    gregorianDate = gregorianDate - calendarDaysDifference;
    return gregorianDate;
}
/**
 * Converts the provided Gregorian date into Coptic Date
 * @param {number} today - a number reflecting a date, which we will convert into coptic date. If ommitted, it will be set to the current date
 * @param {boolean} changeDates - tells whether the function should change the Coptic dates or should just return the new Coptic Date
 * @returns {[number[], string]} - an array containing as 1st element a number[] = [day, month, year] representing the coptic day, coptic month, and coptic year, the second elemement of the array is a string representing the copitc date formatted as 'DDMM'
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
    else if (weekDay === 0) {
        // it means we are on an ordinary  Sunday (any sunday other than Great lent and Pentecostal period Sundays)
        // console.log('We are on a sunday')
        let sunday = checkWhichSundayWeAre(Number(copticDay), weekDay);
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
function checkWhichSundayWeAre(day, theWeekDay = 0) {
    if (theWeekDay !== 0)
        return;
    let n = day;
    if (Season === Seasons.GreatLent)
        n = n - 2; //The counting of the nubmer of days during the Great Lent starts from the Saturday preceding the first day of the Great Lent (which is a Monday). We hence substract 2 from the number of days elapsed in order to count for the 2 extra days added to the actual number of days elapsed since the begining of the Great Lent
    n = Math.abs(Math.ceil(n / 7)); //We use Math.abs in order to deal with cases where the difference is <0
    let sunday = n.toString();
    if (n === 1 || (n > 20 && n % 10 === 1))
        sunday = sunday + "stSunday";
    else if (n === 2 || (n > 20 && n % 10 === 2))
        sunday = sunday + "ndSunday";
    else if (n === 3 || (n > 20 && n % 10 === 3))
        sunday = sunday + "rdSunday";
    else
        sunday = sunday + "thSunday";
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
    let resurrectionDate = ResurrectionDates.find(date => date[0] === today.getFullYear())[1];
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
    else if (difference > 65 && difference < 70) {
        //We are in the Jonah Feast days (3 days + 1)
        //The Jonah feast starts 15 days before the begining of the Great Lent
        //I didn't find the readings for this period in the Power Point presentations
        Season = Seasons.JonahFast;
        return isItSundayOrWeekDay(Seasons.JonahFast, Math.abs(70 - difference), weekDay);
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
    else if (difference < 0 && Math.abs(difference) < 50) {
        difference;
        // we are during the 50 Pentecostal days
        Season = Seasons.PentecostalDays;
        return isItSundayOrWeekDay(Seasons.PentecostalDays, Math.abs(difference), weekDay);
    }
    else if (difference < 0 && Math.abs(difference) > 49
        && Number(copticMonth) > convertGregorianDateToCopticDate(resDate, false)[0][1] //This is the coptic month for the Resurrection day
        && (Number(copticMonth) < 11
            ||
                (Number(copticMonth) === 11 && Number(copticDay) < 5) //This is the Apostles Feast
        )) {
        //We are more than 50 days after Resurrection, which means that we are during the Apostles lent (i.e. the coptic date is before 05/11 which is the date of the Apostles Feast)
        Season = Seasons.ApostlesFast;
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
        let sunday = checkWhichSundayWeAre(Number(copticDay) - weekDay);
        //We are during the month of Kiahk which starts on 16 Hatour and ends on 29 Kiahk
        if (sunday === '1stSunday' || sunday === '2ndSunday')
            Season = Seasons.KiahkWeek1;
        else if (sunday === '3rdSunday' || sunday === '4thSunday')
            Season = Seasons.KiahkWeek2;
    }
    else if (Number(copticMonth) === 3 && Number(copticDay) > 15) {
        //We are during the Nativity Fast which starts on 16 Hatour and ends on 29 Kiahk, but we are not during the month of Kiahk
        Season = Seasons.NativityFast;
    }
    else if ((copticDate === copticFeasts.NativityParamoun && todayDate.getHours() < 15)
        ||
            (['2604', '2704'].includes(copticDate)
                && todayDate.getDay() === 5) //It means that 2804 is either a Saturday or a Sunday. In this case, the Paramoun starts from the preceding Friday
    ) {
        //We are on the day before the Nativity Feast (28 Kiahk), and we are in the morning, it is the Parmoun of the Nativity
        Season = Seasons.NativityParamoun;
        return copticFeasts.NativityParamoun;
    }
    else if ((copticDate === copticFeasts.NativityParamoun && todayDate.getHours() > 15)
        || (Number(copticMonth) === 4 && Number(copticDay) > 28)
        || (Number(copticMonth) === 5 && Number(copticDay) < 7)) {
        Season = Seasons.Nativity; //From 28 Kiahk afternoon to Circumsion (6 Toubi)
    }
    else if ((copticDate === copticFeasts.BaptismParamoun
        && todayDate.getHours() < 15)
        ||
            (['0805', '0905'].includes(copticDate)
                && todayDate.getDay() === 5)) {
        //This means that  we are Friday and the Baptism feast (11 Toubah) is either next Monday or Sunday, which means that the Baptism Paramoun will be either 3 or 2 days (Friday, Saturday and Sunday, or Friday and Saturday)
        Season = Seasons.BaptismParamoun;
        return copticFeasts.BaptismParamoun; //The readings during the Baptism Paramoun are those of 10 Toubah
    }
    else if (copticDate === copticFeasts.BaptismParamoun
        && todayDate.getHours() > 15) {
        //If we are on the Baptism Paramoun after 3PM, we will pray the Baptism ceremony
        Season = Seasons.Baptism;
        return copticFeasts.Baptism;
    }
    else if ((Number(copticMonth) === 5 && Number(copticDay) > 10 && Number(copticDay) < 14)) {
        //We are during the 3 days of Baptism Feast
        Season = Seasons.Baptism;
    }
    else if (Number(copticMonth) === 1 && Number(copticDay) < 17) {
        Season = Seasons.Nayrouz;
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
        (todayDate.getFullYear()).toString();
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
async function changeDate(date, next = true, days = 1, showAlert = true) {
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
    await setCopticDates(todayDate);
    PrayersArrays.forEach(array => array = []);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0RGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL1NldERhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOzs7R0FHRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsS0FBWTtJQUN6QyxJQUFJLENBQUMsS0FBSyxFQUNWO1FBQ0MsS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbkIsSUFBRyxZQUFZLENBQUMsWUFBWTtZQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQywySEFBMkg7S0FDbE07SUFDRCxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXhELE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBLENBQUMsMEVBQTBFO0lBQ3BHLGtCQUFrQixHQUFHLDhCQUE4QixDQUFDLFVBQVUsQ0FBVyxDQUFDO0lBQzFFLElBQUcsd0JBQXdCLEVBQUU7UUFBRSxZQUFZLENBQUMsNEJBQTRCLEdBQUcsVUFBVSxDQUFDO0lBRXRGLE1BQU0scUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxvRUFBb0U7SUFDekcsa0JBQWtCLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQyxrQkFBa0I7UUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUM5RyxxQ0FBcUM7SUFDckMsTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFO1FBQ2QsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLGVBQWU7WUFBRSxPQUFPLEtBQUssQ0FBQzthQUNoRCxJQUFJLFdBQVcs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