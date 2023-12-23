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
    await setSeasonalTextForAll(Season); //!This must be called here after the dates and seasons were changed
    reloadScriptToBody(['PrayersArray']);
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
        let sunday = checkWhichSundayWeAre(Number(copticDay) - todayDate.getDay());
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
        && (Number(copticMonth) === 9
            ||
                Number(copticMonth) === 10
            ||
                (Number(copticMonth) === 11 && Number(copticDay) < 5))) {
        //!CAUTION: this must come after all the cases preceding the begining of the Great Lent (otherwise, the 3rd condition: copticMonth <11, will be fulfilled and we will fall into this else if statement)
        //We are more than 50 days after Resurrection, which means that we are during the Apostles lent (i.e. the coptic date is before 05/11 which is the date of the Apostles Feast)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0RGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL1NldERhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOzs7R0FHRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsS0FBWTtJQUN6QyxJQUFJLENBQUMsS0FBSyxFQUNWO1FBQ0MsS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbkIsSUFBRyxZQUFZLENBQUMsWUFBWTtZQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQywySEFBMkg7S0FDbE07SUFDRCxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDbEQsMkRBQTJEO0lBQzNELE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBLENBQUMsMEVBQTBFO0lBQ3BHLGtCQUFrQixHQUFHLDhCQUE4QixDQUFDLFVBQVUsQ0FBVyxDQUFDO0lBQzFFLElBQUcsd0JBQXdCLEVBQUU7UUFBRSxZQUFZLENBQUMsNEJBQTRCLEdBQUcsVUFBVSxDQUFDO0lBRXRGLE1BQU0scUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxvRUFBb0U7SUFDekcsa0JBQWtCLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLG1DQUFtQztJQUNuQyxTQUFTLEVBQUUsQ0FBQztJQUNaLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQyxrQkFBa0I7UUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUM5RyxxQ0FBcUM7SUFDckMsTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFO1FBQ2QsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLGVBQWU7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