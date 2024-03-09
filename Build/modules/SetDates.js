/**
 * a function that runs at the beginning and sets some global dates like the coptic date (as a string), today's Gregorian date (as a Date), the day of the week (as a number), the Season (a string), etc.
 * @param {Date} today  - a Gregorian date provided by the user or set automatically to the date of today if missing
 */
async function setCopticDates(today) {
    todayDate = today || (() => {
        if (localStorage.selectedDate)
            localStorage.removeItem("selectedDate"); //We do this in order to reset the local storage 'selectedDate' when setCopticDates() is called without a date passed to it
        return new Date();
    })();
    weekDay = todayDate.getDay();
    convertGregorianDateToCopticDate(todayDate, true);
    Season = Seasons.NoSeason; //this will be its default value unless it is changed by another function;
    copticReadingsDate = getSeasonAndCopticReadingsDate(copticDate);
    if (checkIf29thOfCopticMonth())
        copticFeasts.Coptic29th = copticDate; //If we are on the 29th of the coptic Month, we will set the value of copticFeasts.Cotpic29th to today's copticDate in order to able to retrieve the prayers of this day
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
            return true; //i.e. if we are obviously during a fast period
        else if ([3, 5].includes(weekDay))
            return true; //We are not during a fast period but we are a Wednesday or a Friday. Notice that we excluded the Pentecostal period case from the begining
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
function convertGregorianDateToCopticDate(date, changeDates = true) {
    let today;
    let tout1 = Date.UTC(1883, 8, 11, 0, 0, 0, 0); //this is the Gregorian date for the 1st of Tout of the Coptic year 1600. We compensate the diffrence (50 minutes + 39 seconds) in order to get the time at 01:00:00 GMT
    let year = 1600; //this is the coptic year starting on Sept 11, 1883
    date
        ? today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
        : today = new Date().setUTCHours(0, 0, 0, 0);
    let differenceInDays = (today - tout1) / calendarDay;
    let diffrenceInYears = Math.floor(differenceInDays / 365.25); //This gives the number of full Coptic years (based on 365.25 day/year)
    year += diffrenceInYears;
    let daysInCurrentYear = (differenceInDays - (diffrenceInYears * 365.25));
    daysInCurrentYear = Math.ceil(daysInCurrentYear + 1); //Why +1? I don't know. Need to sort it out to know why the dates don't match unless I add 1
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
    n = Math.ceil(Math.abs(n) / 7); //We use Math.abs in order to deal with cases where the difference is <0
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
    let resurrectionDate = ResurrectionDates.find((date) => date[0] === today.getFullYear());
    //We create a new Date from the selected resurrection date, and will set its hour to UTC 0
    let resurrection = Date.UTC(resurrectionDate[0], resurrectionDate[1] - 1, resurrectionDate[2], 0, 0, 0, 0);
    //We create a new date equal to "today", and will set its hour to 0
    let todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
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
    let date;
    Season = Seasons.NoSeason;
    (function ifResurrection() {
        if (difference < 0)
            return;
        if (difference > 1)
            return;
        if (difference === 1 && todayDate.getHours() > 15)
            return;
        //If we are Saturday (which means that difference = 1) and we are after 3 PM, we will retrieve the readings of the Resurrection because we use to celebrate the Resurrection Mass on Saturday evening not on Sunday itself
        Season = Seasons.PentecostalDays; //we set teh Season value
        date = isItSundayOrWeekDay(Seasons.GreatLent, 58, weekDay);
    })();
    (function ifJonahFast() {
        if (difference > 68)
            return;
        if (difference < 65)
            return;
        //We are in the Jonah Fast days (3 days + 1)
        //The Jonah feast starts 15 days before the begining of the Great Lent
        difference === 65
            ? Season = Seasons.JonahFeast //We are on the Jonah Feast
            : Season = Seasons.JonahFast; //We are during the 3 days of Jonah Fast
        date = isItSundayOrWeekDay(Seasons.JonahFast, Math.abs(69 - difference), weekDay);
    })();
    (function ifGreatLentPreparation() {
        if (![57, 56].includes(difference))
            return; //the 57th and the 56th days before Resurrection correspond to the Saturday and the Sunday preceding the first day of the Great Lent (which is a Monday = Resurrection - 55 days). The readings of those 2 days are linked to the Great Lent Season.
        date = Seasons.GreatLent + (58 - difference).toString();
    })();
    (function ifGreatLent() {
        if (difference < 1)
            return; //If <1 it means we are after the Great Lent Preiod (potentially during the Pentecostal days, or on the Resurrection day itself)
        if (difference > 55)
            return; //it means we are before the begining of the Great Lent
        //We are during the Great Lent period which counts 56 days from the Saturday preceding the 1st Sunday (which is the begining of the so called "preparation week") until the Resurrection day
        if (copticDate === "1007")
            Season =
                Seasons.CrossFeast; //! CAUTION: This must come BEFORE Seasons.GreatLent because the cross feast is celebrated twice, one of which during the Great Lent (10 Bramhat). If we do not place this 'else if' condition before the Great Lent season, it will never be fulfilled during the Great Lent
        else if (difference < 7 || (difference === 7 && todayDate.getHours() > 12))
            Season =
                Seasons.HolyWeek; //i.e., if we are between Monday and Friday of the Holy Week or if we are on Palm Sunday afternoon
        else
            Season = Seasons.GreatLent;
        date = isItSundayOrWeekDay(Seasons.GreatLent, 58 - difference, weekDay);
    })();
    (function ifPentecostalPeriod() {
        if (difference > 0)
            return;
        if (Math.abs(difference) > 49)
            return;
        // we are during the 50 Pentecostal days
        Season = Seasons.PentecostalDays;
        date = isItSundayOrWeekDay(Seasons.PentecostalDays, Math.abs(difference), weekDay);
    })();
    (function ifApostlesFast() {
        if (difference > 0)
            return; //This means that we are before the Ressurrection Feast, and probably still during the Great Lent
        if (Math.abs(difference) < 49)
            return; //this means that we are still during the Pentecostal Period
        if (Number(copticMonth) > 11)
            return;
        if (Number(copticMonth) === 11 && Number(copticDay) > 4)
            return; //We are after the Apostles Feast
        //We are more than 50 days after Resurrection, which means that we are during the Apostles lent (i.e. the coptic date is before 05/11 which is the date of the Apostles Feast)
        Season = Seasons.ApostlesFast;
    })();
    (function ifStMaryFast() {
        if (Number(copticMonth) !== 12)
            return;
        if (Number(copticDay) > 15)
            return;
        //We are between 01/12 and 15/12, which means that we are during St Mary's Fast
        Season = Seasons.StMaryFast;
    })();
    (function ifNayrouzOrCrossFeast() {
        if (Number(copticMonth) !== 1)
            return;
        if (Number(copticDay) > 19)
            return;
        if (Number(copticDay) < 17)
            Season = Seasons.Nayrouz;
        else if (Number(copticDay) > 16)
            Season = Seasons.CrossFeast;
    })();
    (function ifNativityFast() {
        if (Number(copticMonth) !== 3)
            return;
        if (Number(copticDay) < 16)
            return;
        //We are during the Nativity Fast which starts on 16 Hatour and ends on 29 Kiahk, but we are not during the month of Kiahk. Note that Kiahk is a different Season
        Season = Seasons.NativityFast;
    })();
    (function ifEarlyKiahk() {
        if (copticDate !== "3003")
            return;
        if (weekDay !== 0)
            return;
        //If 30th of Hatour is a Sunday, it means that Kiahk will have only 3 Sundays before Kiahk 28th (i.e., on the 7th, 14th && 21th). We hence consider that 30th of Hatour is the 1st Sunday of Kiahk
        Season = Seasons.KiahkWeek1;
        date = checkWhichSundayWeAre(7, 0);
    })();
    (function ifKiahk() {
        //!Caution this must come before isNativityParamoun() and isNativityFeast()
        if (Number(copticMonth) !== 4)
            return;
        if (Number(copticDay) > 27)
            return; //We are either in the Paramoun or during the Feast
        date = getKiahkWeek();
        function getKiahkWeek() {
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
            ].find((el) => el[0] === sunday)[1]; //We set the Season accroding to the value of sunday
            if (weekDay === 0)
                return sunday; //!Caution: we need to return the value of Sunday (which will set the readings for this day not only the Season), because it is modified when Kiahk has only 3 Sundays. We do this for the Sundays only because the readings of the other days are not affected. It is just the Season that changes.
        }
    })();
    (function ifNativityParamoun() {
        if (todayDate.getMonth() !== 0)
            return; //If we are not in January
        if (todayDate.getDate() > 6)
            return; //If we are after January 6th;
        if (todayDate.getDate() === 6 && todayDate.getHours() > 15)
            return; //The Nativity Feast has been fixed to January 7th which is Kiahk 28th not Kiahk 29th. We use to celebrate the Nativity Mass on January 6 late afternoon
        if (copticDate === copticFeasts.NativityParamoun && todayDate.getHours() > 15)
            return;
        if (([4, 5].includes(todayDate.getDate()) && weekDay === 5) //If January 4 or January 5, is a Friday, it means that the Feast (i.e., January 7th) will be a Monday or a Sunday. In both cases, the Paramoun will start on Friday
            ||
                (todayDate.getDate() === 5 && weekDay === 6) //If January 5, is a Saturday, it means that the Nativity Feast (i.e., January 7th will be a Monday), the Paramoun will start on January 4th throughout January 6
            ||
                (todayDate.getDate() === 6 && todayDate.getHours() < 15) //!The Nativity Feast has been fixed to January 7th which corresponds to Kiahk 28th instead of Kiahk 29th. That's why the Paramoun will end in January 6 afternoon. In fact we use to celebrate the Mass in the late evening of January 6th
            ||
                (["2604", "2704"].includes(copticDate) && weekDay === 5)
            ||
                (copticDate === "2704" && weekDay === 6)
        //We are on the day before the Nativity Feast (28 Kiahk), and we are in the morning, it is the Parmoun of the Nativity
        ) {
            Season = Seasons.NativityParamoun;
            date = copticFeasts.NativityParamoun;
        }
    })();
    (function ifNativityFeast() {
        if (todayDate.getMonth() !== 0)
            return; //We are not in January
        if (Number(copticMonth) === 5 && Number(copticDay) > 5)
            return;
        if (isNativityFeast())
            Season = Seasons.Nativity;
        function isNativityFeast() {
            if ((copticDate === copticFeasts.NativityParamoun &&
                todayDate.getHours() > 15)
                ||
                    (todayDate.getDate() === 6 && todayDate.getHours() > 15) //This is because the Nativity feast has been fixed to 7 January although it should actually come on January 8th (Kiahk 29th)
                ||
                    (todayDate.getDate() === 7)
                ||
                    (Number(copticDay) >= 29) //This impliedly means that we are in Kiahk because the function returns if we are after the 6th of Toubah
                ||
                    (Number(copticDay) < 7) //This impliedly means that we are during Toubah (before the 6th of Toubah) since January starts in the last week of Kiahk
            ) {
                return true;
            }
        }
    })();
    (function ifBaptismeParamoun() {
        if (Number(copticMonth) !== 5)
            return;
        if (Number(copticDay) > 10)
            return;
        if (Number(copticDay) < 8)
            return;
        if (copticDate === copticFeasts.BaptismParamoun &&
            todayDate.getHours() >= 15)
            return;
        if ((["0805", "0905"].includes(copticDate) && weekDay === 5) //i.e. if 08 Toubah or 09 Toubah is a Friday, it will mark the begining of the Parmoun because 11 Toubah will either be a Sunday or a Monday
            ||
                (copticDate === "0905" && weekDay === 6) //If Toubah 9th is a Saturday, it means that the Feast started on Friday 08 Toubah and continues until 10 Toubah evening
            ||
                (copticDate === copticFeasts.BaptismParamoun &&
                    todayDate.getHours() < 15)) {
            Season = Seasons.BaptismParamoun;
            date = copticFeasts.BaptismParamoun;
        }
        ; //The readings during all the Baptism Paramoun are those of 10 Toubah
    })();
    (function ifBaptismFeast() {
        if (Number(copticMonth) !== 5)
            return;
        if (Number(copticDay) > 12)
            return;
        if (Number(copticDay) >= 11) //i.e., from 11 to 13 Toubah 
            Season = Seasons.Baptism;
        if (copticDate === copticFeasts.BaptismParamoun &&
            todayDate.getHours() > 15) {
            //We are on the Baptism Parmoun after 3PM, we use to celebrate the Baptism Mass in the late evening
            Season = Seasons.Baptism;
            date = copticFeasts.Baptism;
        }
    })();
    return date;
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
        todayDate.getDate().toLocaleString() +
        "/" +
        (todayDate.getMonth() + 1).toString() +
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
                        " of the Great Lent");
                if (copticReadingsDate.startsWith(Seasons.PentecostalDays))
                    return ("Day " +
                        copticReadingsDate.split(Seasons.PentecostalDays)[1] +
                        " of the 50 Pentecostal Days");
                if (copticReadingsDate.startsWith(Seasons.JonahFast))
                    return ("Day " +
                        copticReadingsDate.split(Seasons.JonahFast)[1] +
                        " of Jonah Fast");
                if (copticReadingsDate.endsWith("Sunday") &&
                    copticMonths[Number(copticReadingsDate.slice(0, 2))])
                    return (copticMonths[Number(copticReadingsDate.slice(0, 2))].EN +
                        " " +
                        copticReadingsDate
                            .slice(2, copticReadingsDate.length)
                            .split("Sunday")[0] +
                        " Sunday");
                if (copticMonths[Number(copticMonth)])
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
    (function insertCredentials() {
        let credentialsDiv = document.getElementById('credentialsDiv');
        if (!credentialsDiv) {
            //Inserting a creditials Div after containerDiv
            credentialsDiv = containerDiv.insertAdjacentElement("afterend", document.createElement("div"));
            credentialsDiv.classList.add("credentialsDiv");
            credentialsDiv.id = "credentialsDiv";
            credentialsDiv.style.padding = "3px 20px";
        }
        ;
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
    })();
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
        if (!todayDate || checkIfDateIsToday(date))
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
    if (!date
        ||
            (date.getDate() === new Date().getDate()
                &&
                    date.getMonth() === new Date().getMonth()
                &&
                    date.getFullYear() === new Date().getFullYear()))
        return true; //If the date argument is not valid,  or if the date argument refers to the same day, month and year as today, we will return true which means that todayDate will be set to today's date
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
function testDateFunction(date = new Date("2020.12.31")) {
    addConsoleSaveMethod(console);
    setCopticDates(date);
    let text = "";
    for (let i = 1; i < 1500; i++) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0RGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL1NldERhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsS0FBWTtJQUV4QyxTQUFTLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ3pCLElBQUksWUFBWSxDQUFDLFlBQVk7WUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsMkhBQTJIO1FBQ25NLE9BQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQTtJQUNuQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsT0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3QixnQ0FBZ0MsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFbEQsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQywwRUFBMEU7SUFDckcsa0JBQWtCLEdBQUcsOEJBQThCLENBQUMsVUFBVSxDQUFXLENBQUM7SUFDMUUsSUFBSSx3QkFBd0IsRUFBRTtRQUFFLFlBQVksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLENBQUMsd0tBQXdLO0lBRTlPLE1BQU0scUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxvRUFBb0U7SUFDekcsa0JBQWtCLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQyxrQkFBa0I7UUFDckIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUNoQiw0Q0FBNEMsRUFDNUMsa0JBQWtCLENBQ25CLENBQUM7SUFDSixxQ0FBcUM7SUFDckMsTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFO1FBQ2IsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLGVBQWU7WUFDcEMsT0FBTyxLQUFLLENBQUM7YUFDVixJQUFJLFdB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