/**
 * a function that runs at the beginning and sets some global dates like the coptic date (as a string), today's Gregorian date (as a Date), the day of the week (as a number), the Season (a string), etc.
 * @param {Date} today  - a Gregorian date provided by the user or set automatically to the date of today if missing
 */
async function setCopticDates(today) {
    if (!today) {
        today = new Date();
        if (localStorage.selectedDate)
            localStorage.removeItem("selectedDate"); //We do this in order to reset the local storage 'selectedDate' when setCopticDates() is called without a date passed to it
    }
    todayDate = today;
    weekDay = todayDate.getDay();
    convertGregorianDateToCopticDate(today.getTime(), true);
    Season = Seasons.NoSeason; //this will be its default value unless it is changed by another function;
    copticReadingsDate = getSeasonAndCopticReadingsDate(copticDate);
    if (checkIf29thOfCopticMonth())
        copticFeasts.Coptic29th = copticDate;
    await setSeasonalTextForAll(Season); //!This must be called here after the dates and seasons were changed
    reloadScriptToBody(["PrayersArray"]);
    createFakeAnchor("homeImg");
    if (!copticReadingsDate)
        return console.log("copticReadingsDate was not property set = ", copticReadingsDate);
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
    let calendarDaysDifference = (yearsDifference * 365 + monthsDifference * 30 + daysDifference) *
        calendarDay;
    calendarDaysDifference = calendarDaysDifference + yearsDifference / 4; //Leap years
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
    let tout1 = new Date("1883.09.11").setUTCHours(0, 0, 0, 0); //this is the Gregorian date for the 1st of Tout of the Coptic year 1600
    let year = 1600; //this is the coptic year starting on Sept 11, 1883
    today
        ? (today = new Date(today).setHours(0, 0, 0, 0))
        : (today = new Date().setHours(0, 0, 0, 0));
    let differenceInDays = (today - tout1) / calendarDay;
    let diffrenceInYears = Math.floor(differenceInDays / 365.25); //This gives the number of full Coptic years (based on 365.25 day/year)
    year += diffrenceInYears;
    let daysInCurrentYear = (differenceInDays / 365.25 - Math.trunc(differenceInDays / 365.25)) *
        365.25;
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
    if (new Date(today).getFullYear() % 4 !== 3 && month === 13 && day === 6) {
        //We are not in a leap year
        day = 1;
        month = 1;
        year += 1;
    }
    let dayString = day.toString().padStart(2, "0");
    let monthString = month.toString().padStart(2, "0");
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
        return console.log("coptDate is not valid = ", coptDate);
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
        let date = copticReadingsDates
            .find(datesArray => datesArray.includes(coptDate));
        if (date)
            return date[0];
        else
            return coptDate;
    }
}
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
/**
 * It takes the date of today and checks whether according the Resurrection date this year, we are during an unfixed season like Great Lent, Pentecostal days or Apostles feast, etc.
 * @param {Date} today  - is the date of today according to the Gregorian calendar (it can be any day of the year if the user had manually set it)
 * @returns {string} - a string expressing the readings date . It will be added to the id of the reading in order to retrieve the coptic readings of the day
 */
function checkIfInASpecificSeason(today) {
    let readingsDate;
    //We filter the ResurrectionDates array for the resurrection date for the current year:
    let resurrectionDate = ResurrectionDates.find((date) => date[0] === today.getFullYear())[1];
    //We create a new Date from the selected resurrection date, and will set its hour to UTC 0
    let resurrection = new Date(resurrectionDate).setHours(0, 0, 0, 0);
    //We create a new date equal to "today", and will set its hour to 0
    let todayUTC = new Date(today).setHours(0, 0, 0, 0);
    readingsDate = checkForUnfixedEvent(todayUTC, //this is a number reflecting the date of today at UTC 0 hour
    resurrection, //we get a number reflecting the resurrection date at UTC 0 hour
    today.getDay() //we get the day of the week as a number starting from 0
    );
    return readingsDate;
}
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
        if (copticDate === "1007")
            Season =
                Seasons.CrossFeast; //! CAUTION: This must come BEFORE Seasons.GreatLent because the cross feast is celebrated twice, one of which during the Great Lent (10 Bramhat). If we do not place this 'else if' condition before the Great Lent season, it will never be fulfilled during the Great Lent
        else if (difference < 7 || (difference === 7 && todayDate.getHours() > 12))
            Season =
                Seasons.HolyWeek; //i.e., if we are between Monday and Friday of the Holy Week or if we are on Palm Sunday afternoon
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
    else if (difference < 0 &&
        Math.abs(difference) > 49 &&
        Number(copticMonth) >
            convertGregorianDateToCopticDate(resDate, false)[0][1] && //This is the coptic month for the Resurrection day
        (Number(copticMonth) < 11 ||
            (Number(copticMonth) === 11 && Number(copticDay) < 5)) //This is the Apostles Feast
    ) {
        //We are more than 50 days after Resurrection, which means that we are during the Apostles lent (i.e. the coptic date is before 05/11 which is the date of the Apostles Feast)
        Season = Seasons.ApostlesFast;
    }
    else if (Number(copticMonth) === 12 && Number(copticDay) < 16) {
        //We are during the St Mary Fast
        Season = Seasons.StMaryFast;
    }
    else if (Number(copticMonth) === 1 && Number(copticDay) < 20) {
        if (Number(copticDay) < 17)
            Season = Seasons.Nayrouz;
        else if (Number(copticDay) > 16)
            Season = Seasons.CrossFeast;
    }
    else if (copticDate === "3003" && todayDate.getDay() === 0) {
        //If 30th of Hatour is a Sunday, it means that Kiahk will have only 3 Sundays before Kiahk 28th (i.e., on the 7th, 14th && 21th). We hence consider that 30th of Hatour is the 1st Sunday of Kiahk
        Season = Seasons.KiahkWeek1;
        return checkWhichSundayWeAre(7, 0);
    }
    else if (Number(copticMonth) === 4
        ||
            (Number(copticMonth) === 5 && Number(copticDay) < 7)) {
        if (isNativityParamoun()) {
            Season = Seasons.NativityParamoun;
            return copticFeasts.NativityParamoun;
        }
        else if (isNativityFeast())
            Season = Seasons.Nativity;
        else
            return otherKiahkDays();
        function isNativityParamoun() {
            //!Caution: this must come before the Kiahk Season
            //If we are before January 7th
            if ((copticDate === copticFeasts.NativityParamoun &&
                todayDate.getHours() < 15)
                ||
                    (todayDate.getDate() === 6 && todayDate.getHours() < 15) //The Nativity Feast has been fixed to January 7th, we will consider that January 6th is the Paramoun regardless of whether it is the 28th or the 27th of Kiahk
                ||
                    ([4, 5].includes(todayDate.getDate()) && todayDate.getDay() === 5) //If January 4 or January 5, is a Friday, it means that the Feast (i.e., January 7th) will be a Monday or a Sunday. In both cases, the Paramoun will start on Friday
                ||
                    (todayDate.getDate() === 5 && todayDate.getDay() === 6) //If January 5, is a Saturday, it means that the Nativity Feast (i.e., January 7th will be a Monday), the Paramoun will start on January 4th throughout January 6
                ||
                    (["2604", "2704"].includes(copticDate) && todayDate.getDay() === 5)
                ||
                    (copticDate === "2704" && todayDate.getDay() === 6 && todayDate.getHours() < 15) //!The Nativity Feast has been fixed to January 7th which corresponds to Kiahk 28th instead of Kiahk 29th. That's why the Paramoun will end in the afternoon
            //We are on the day before the Nativity Feast (28 Kiahk), and we are in the morning, it is the Parmoun of the Nativity
            )
                return true;
        }
        function isNativityFeast() {
            if ((copticDate === copticFeasts.NativityParamoun &&
                todayDate.getHours() > 15)
                ||
                    (todayDate.getMonth() === 0 && todayDate.getDate() === 6 && todayDate.getHours() > 15) //This is because the Nativity feast has been fixed to 7 January although it should actually come on January 8th (Kiahk 29th)
                ||
                    (Number(copticMonth) === 4 && Number(copticDay) >= 29)
                ||
                    (Number(copticMonth) === 5 && Number(copticDay) < 7) //From 29 Kiahk afternoon to Circumsion (6 Toubi)
            ) {
                return true;
            }
        }
        function otherKiahkDays() {
            if (Number(copticMonth) !== 4)
                return; //This function applies only if we are during the month of Kiahk
            let sunday;
            if ([0, 7, 14, 21].includes(Number(copticDay) - weekDay))
                //When the 1st of Kiahk is a Monday, Kiahk will have only 3 Sundays before Kiahk 28th (i.e., on the 7th, the 14th, and the 21th of Kiahk), we will hence consider that the 30th of Hatour is the 1st Sunday of Kiahk, and will count Kiahk's Sundays from 2
                sunday = checkWhichSundayWeAre(Number(copticDay) + 7 - weekDay);
            else
                sunday = checkWhichSundayWeAre(Number(copticDay) - weekDay);
            Season = [
                ["1stSunday", Seasons.KiahkWeek1],
                ["2ndSunday", Seasons.KiahkWeek2],
                ["3rdSunday", Seasons.KiahkWeek3],
                ["4thSunday", Seasons.KiahkWeek4],
            ].find((el) => el[0] === sunday)[1];
            if (weekDay === 0)
                return sunday; //!Caution: we need to return the value of Sunday (which will set the readings for this day not only the Season), because it is modified when Kiahk has only 3 Sundays. We do this for the Sundays only because the readings of the other days are not affected. It is just the Season that changes.
        }
    }
    else if (Number(copticMonth) === 3 && Number(copticDay) > 15) {
        //We are during the Nativity Fast which starts on 16 Hatour and ends on 29 Kiahk, but we are not during the month of Kiahk
        Season = Seasons.NativityFast;
    }
    else if ((copticDate === copticFeasts.BaptismParamoun &&
        todayDate.getHours() < 15)
        ||
            (["0805", "0905"].includes(copticDate) && todayDate.getDay() === 5)
        ||
            (copticDate === "0905" && todayDate.getDay() === 6)) {
        //This means that  we are Friday and the Baptism feast (11 Toubah) is either next Monday or Sunday, which means that the Baptism Paramoun will be either 3 or 2 days (Friday, Saturday and Sunday, or Friday and Saturday)
        Season = Seasons.BaptismParamoun;
        return copticFeasts.BaptismParamoun; //The readings during the Baptism Paramoun are those of 10 Toubah
    }
    else if (copticDate === copticFeasts.BaptismParamoun &&
        todayDate.getHours() > 15) {
        //If we are on the Baptism Paramoun after 3PM, we will pray the Baptism ceremony
        Season = Seasons.Baptism;
        return copticFeasts.Baptism;
    }
    else if (Number(copticMonth) === 5 &&
        Number(copticDay) > 10 &&
        Number(copticDay) < 14) {
        //We are during the 3 days of Baptism Feast
        Season = Seasons.Baptism;
    }
    else if (Number(copticMonth) === 1 && Number(copticDay) < 17) {
        Season = Seasons.Nayrouz;
    }
}
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
/**
 * Shows the dates (Gregorian, coptic, coptic readings etc.), in an html element in the Temporary Dev Area
 */
function showDates(dateDiv = document.getElementById("dateDiv")) {
    if (!dateDiv) {
        dateDiv = containerDiv.insertAdjacentElement("beforebegin", document.createElement("div"));
        dateDiv.classList.add("dateDiv");
        dateDiv.id = "dateDiv";
    }
    if (!dateDiv)
        return;
    //Inserting the Gregorian date
    let date = "Date: " +
        todayDate.getDate().toString() +
        "/" +
        (todayDate.getMonth() + 1).toLocaleString("en-US") +
        "/" +
        todayDate.getFullYear().toString();
    insertDateBox(date, "gregorianDateBox");
    //Inserting the home image after the dateBox
    if (!dateDiv.querySelector("#homeImg"))
        dateDiv.appendChild(document.getElementById("homeImg"));
    //Inserting the Coptic date
    date =
        "Coptic Date: " +
            copticDay +
            " " +
            copticMonths[Number(copticMonth)].EN +
            " " +
            copticYear +
            " \n" +
            "Readings date: " +
            (() => {
                if (copticReadingsDate.startsWith(Seasons.GreatLent))
                    return ("Day " +
                        copticReadingsDate.split(Seasons.GreatLent)[1] +
                        "of the Great Lent");
                if (copticReadingsDate.startsWith(Seasons.PentecostalDays))
                    return ("Day " +
                        copticReadingsDate.split(Seasons.PentecostalDays)[1] +
                        " of the 50 Pentecostal Days");
                if (copticReadingsDate.endsWith("Sunday") &&
                    copticMonths[Number(copticReadingsDate.slice(0, 2))])
                    return (copticMonths[Number(copticReadingsDate.slice(0, 2))].EN +
                        " " +
                        copticReadingsDate
                            .slice(2, copticReadingsDate.length)
                            .split("Sunday")[0] +
                        " Sunday");
                if (copticMonths[Number(copticReadingsDate.slice(2, 4))])
                    return (copticReadingsDate.slice(0, 2) +
                        " " +
                        copticMonths[Number(copticReadingsDate.slice(2, 4))].EN);
                return "";
            })();
    insertDateBox(date, "copticDateBox");
    function insertDateBox(date, id) {
        let dateBox = document.getElementById(id);
        //Inserting a date box
        if (!dateBox) {
            dateBox = dateDiv.appendChild(document.createElement("div"));
            dateBox.id = id;
            dateBox.style.display = "block !important";
            dateBox.classList.add("dateBox");
        }
        dateBox.innerHTML = ""; //we empty the div
        let p = dateBox.appendChild(document.createElement("p"));
        p.innerText = date;
    }
    //Inserting a creditials Div after containerDiv
    let credentialsDiv = containerDiv.insertAdjacentElement("afterend", document.createElement("div"));
    credentialsDiv.classList.add("credentialsDiv");
    credentialsDiv.id = "credentialsDiv";
    credentialsDiv.style.padding = "3px 20px";
    credentialsDiv.innerText =
        "Today: " +
            todayDate.toString() +
            " .\n Season = " +
            Season +
            " .\n Version = " +
            version +
            ".\n" +
            "We " +
            `${isFast ? "are " : "are not "}` +
            "during a fast period or on a fast day (Wednesday or Friday";
    return dateDiv;
}
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
    PrayersArrays.forEach((array) => (array = []));
    populatePrayersArrays();
    if (checkIfDateIsToday(todayDate)) {
        localStorage.removeItem("selectedDate");
    }
    else {
        //If todayDate is not equal to the date of today (not same day and same month and same year), we store the manually selected date in the local storage
        localStorage.selectedDate = todayDate.getTime().toString();
    }
    console.log(todayDate);
    if (showAlert)
        alert("Date was successfully changed to " +
            todayDate.getDate().toString() +
            "/" +
            (todayDate.getMonth() + 1).toString() +
            "/" +
            todayDate.getFullYear().toString() +
            " which corresponds to " +
            copticDate +
            " of the coptic calendar ");
    return todayDate;
}
/**
 * Checks whether the date passed to it is today
 * @param {Date} storedDate  - The date which we want to check if it corresponds to today
 * @returns {boolean} - returns true if storedDate is same as today
 */
function checkIfDateIsToday(date) {
    let newDate = new Date();
    if (date.getDate() === newDate.getDate() &&
        date.getMonth() === newDate.getMonth() &&
        date.getFullYear() === newDate.getFullYear()) {
        return true;
    }
    return false;
}
function testReadings() {
    addConsoleSaveMethod(console);
    let btns = [
        ...btnDayReadings.children,
        btnReadingsGospelNight,
        btnReadingsPropheciesDawn,
    ];
    let query, result = "";
    setCopticDates(new Date("2022.12.31"));
    for (let i = 1; i < 367; i++) {
        changeDate(undefined, true, undefined, false);
        result += "copticDate = " + copticDate + "\n";
        result += "copticReadingsDate = " + copticReadingsDate + "\n";
        if (weekDay === 0)
            result += "it is a Sunday \n";
        btns.forEach((btn) => {
            if (!(Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
                (btn === btnReadingsGospelNight || btn === btnReadingsPropheciesDawn))
                return;
            if ((Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
                (weekDay === 0 || weekDay === 6) &&
                btn === btnReadingsPropheciesDawn)
                return; //During the Great Lent and Jonah Fast, only the week-days have Prophecies Readings in the Incense Dawn office
            if (Season === Seasons.GreatLent &&
                weekDay !== 0 &&
                (btn === btnReadingsGospelIncenseVespers ||
                    btn === btnReadingsGospelNight))
                return; //During the Great Lent, only Sunday has Vespers (on Saturday afternoon), and Gospel Night (on Sunday afternoon)
            if (Season === Seasons.GreatLent &&
                weekDay === 0 &&
                btn === btnReadingsGospelIncenseVespers &&
                copticReadingsDate === "GL9thSunday")
                return; //no vespers for the Resurrection Sunday
            if (Season === Seasons.JonahFast &&
                weekDay !== 1 &&
                btn === btnReadingsGospelIncenseVespers)
                return; //During the Jonah Fast, only Monday has Vespers prayers
            if (Season === Seasons.HolyWeek)
                return; //No readings during the holy week
            if (btn.prayersArray && btn.prayersSequence) {
                query = btn.prayersSequence[0] + "&D=" + copticReadingsDate + "&C=";
                let reading = btn.prayersArray.filter((tbl) => tbl[0][0].startsWith(query));
                if (reading.length < 1)
                    result += "\tmissing: " + btn.label.FR + "\nquery= " + query + "\n";
                if (reading.length > 1)
                    result += "\textra table: " + query;
            }
        });
    }
    //@ts-ignore
    console.save(result, "testReadings Result.doc");
    changeDate(new Date());
}
function testDateFunction(date = new Date("2022.12.31")) {
    addConsoleSaveMethod(console);
    setCopticDates(date);
    let text = "";
    for (let i = 1; i < 800; i++) {
        changeDate(undefined, true, undefined, false);
        text +=
            "Gregorian = " +
                todayDate.getDate().toString() +
                "/" +
                (todayDate.getMonth() + 1).toString() +
                "/" +
                todayDate.getFullYear().toString() +
                "\t";
        text += "Coptic = " + copticDate + "\t";
        text += "Readings = " + copticReadingsDate + "\n";
    }
    //@ts-ignore
    console.save(text, "testDateFunction.doc");
    changeDate(new Date());
}
/**
 * It was created to reorganise the copticReadingsDates array. It was used once, and we will not most probably need to use it again. Will not delete it immediately though
 */
function groupReadingsDates() {
    let unique = new Set();
    let dates = [];
    copticReadingsDates.forEach((dateArray) => {
        if (unique.has(dateArray[1]))
            return;
        unique.add(dateArray[1]);
        dates.push([dateArray[1]]);
        copticReadingsDates
            .filter((array) => array[1] === dateArray[1])
            .forEach((arrayDate) => dates[dates.length - 1].push(arrayDate[0]));
    });
    console.log(dates);
    dates.forEach((groupArray) => {
        copticReadingsDates
            .filter((dateArray) => dateArray[1] === groupArray[0])
            .forEach((dateArray) => {
            console.log(dateArray[0]);
            if (groupArray.indexOf(dateArray[0]) < 0)
                console.log("something wrong", groupArray);
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0RGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL1NldERhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsS0FBWTtJQUN4QyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbkIsSUFBSSxZQUFZLENBQUMsWUFBWTtZQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQywySEFBMkg7S0FDcE07SUFDRCxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXhELE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsMEVBQTBFO0lBQ3JHLGtCQUFrQixHQUFHLDhCQUE4QixDQUFDLFVBQVUsQ0FBVyxDQUFDO0lBQzFFLElBQUksd0JBQXdCLEVBQUU7UUFBRSxZQUFZLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUVyRSxNQUFNLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsb0VBQW9FO0lBQ3pHLGtCQUFrQixDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUNyQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1QixJQUFJLENBQUMsa0JBQWtCO1FBQ3JCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FDaEIsNENBQTRDLEVBQzVDLGtCQUFrQixDQUNuQixDQUFDO0lBQ0oscUNBQXFDO0lBQ3JDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRTtRQUNiLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxlQUFlO1lBQUUsT0FBTyxLQUFLLENBQUM7YUFDaEQsSUFBSSxXQUFX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