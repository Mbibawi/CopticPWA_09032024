/**
 * a function that runs at the beginning and sets some global dates like the coptic date (as a string), today's Gregorian date (as a Date), the day of the week (as a number), the Season (a string), etc.
 * @param {Date} today  - a Gregorian date provided by the user or set automatically to the date of today if missing
 */
async function setCopticDates(today?: Date) {

  todayDate = today || (() => {
    if (localStorage.selectedDate) localStorage.removeItem("selectedDate"); //We do this in order to reset the local storage 'selectedDate' when setCopticDates() is called without a date passed to it
    return new Date()
  })();

  weekDay = todayDate.getDay();
  convertGregorianDateToCopticDate(todayDate, true);

  Season = Seasons.NoSeason; //this will be its default value unless it is changed by another function;
  copticReadingsDate = getSeasonAndCopticReadingsDate(copticDate) as string;
  if (checkIf29thOfCopticMonth()) copticFeasts.Coptic29th = copticDate; //If we are on the 29th of the coptic Month, we will set the value of copticFeasts.Cotpic29th to today's copticDate in order to able to retrieve the prayers of this day

  await setSeasonalTextForAll(Season); //!This must be called here after the dates and seasons were changed
  reloadScriptToBody(["PrayersArray"]);
  createFakeAnchor("homeImg");
  if (!copticReadingsDate)
    return console.log(
      "copticReadingsDate was not property set = ",
      copticReadingsDate
    );
  //copticDay = copticDate.slice(0, 2);
  isFast = (() => {
    if (Season === Seasons.PentecostalDays)
      return false;
    else if (copticFasts.indexOf(Season) > -1)
      return true; //i.e. if we are obviously during a fast period
    else if ([3, 5].includes(weekDay))
      return true;//We are not during a fast period but we are a Wednesday or a Friday. Notice that we excluded the Pentecostal period case from the begining
    else return false;
  })();
  //Showing the dates and the version
  showDates(); //!Caution: showDates must come after isFast is set.
}
/**
 * Converts a date
 * @param {number[]} copticDate - the copticDate for which we want to get the gregorian date, it must be formatted as [day, month, year]
 * @returns
 */
function convertCopticDateToGregorianDate(
  copticDate: number[],
  gregorianDate?: number
) {
  if (!copticDate || copticDate.length < 3) return;

  let currentCopticDate = convertGregorianDateToCopticDate()[0]; //This will give a [day, month, year] array

  let yearsDifference = copticDate[2] - currentCopticDate[2];
  let monthsDifference = copticDate[1] - currentCopticDate[1];
  let daysDifference = copticDate[0] - currentCopticDate[0];

  let calendarDaysDifference =
    (yearsDifference * 365 + monthsDifference * 30 + daysDifference) *
    calendarDay;

  calendarDaysDifference = calendarDaysDifference + yearsDifference / 4; //Leap years

  if (!gregorianDate) gregorianDate = todayDate.getDate();

  gregorianDate = gregorianDate - calendarDaysDifference;

  return gregorianDate;
}
/**
 * Converts the provided Gregorian date into Coptic Date
 * @param {number} today - a number reflecting a date, which we will convert into coptic date. If ommitted, it will be set to the current date
 * @param {boolean} changeDates - tells whether the function should change the Coptic dates or should just return the new Coptic Date
 * @returns {[number[], string]} - an array containing as 1st element a number[] = [day, month, year] representing the coptic day, coptic month, and coptic year, the second elemement of the array is a string representing the copitc date formatted as 'DDMM'
 */
function convertGregorianDateToCopticDate(
  date?: Date,
  changeDates: boolean = true
): [number[], string] {
  let today: number;
  let tout1: number = Date.UTC(1883, 8, 11, 0, 0, 0,0); //this is the Gregorian date for the 1st of Tout of the Coptic year 1600. We compensate the diffrence (50 minutes + 39 seconds) in order to get the time at 01:00:00 GMT

  let year: number = 1600; //this is the coptic year starting on Sept 11, 1883

  date
    ? today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0,0)
    : today = new Date().setUTCHours(0,0,0,0);

  let differenceInDays = (today - tout1) / calendarDay;

  let diffrenceInYears = Math.floor(differenceInDays / 365.25); //This gives the number of full Coptic years (based on 365.25 day/year)


  year += diffrenceInYears;

  let daysInCurrentYear =
    (differenceInDays - (diffrenceInYears * 365.25));

  daysInCurrentYear = Math.ceil(daysInCurrentYear+1);//Why +1? I don't know. Need to sort it out to know why the dates don't match unless I add 1


  let month = daysInCurrentYear / 30;
  if (daysInCurrentYear / 30 === 0) month = 1;
  month = Math.ceil(month);


  let day = Math.ceil(daysInCurrentYear % 30);
  if (day > 30) day -= 30;
  if (daysInCurrentYear % 30 === 0) day = 30;

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
function getSeasonAndCopticReadingsDate(
  coptDate: string = copticDate,
  today: Date = todayDate
): string | void {
  if (!coptDate) return console.log("coptDate is not valid = ", coptDate);

  let specialSeason: string = checkIfInASpecificSeason(today);
  if (specialSeason) {
    // it means we got a specific date for the Readings associated with a specific period (e.g.: Great Lent, PentecostalDays, etc.)
    return specialSeason;
  } else if (today.getDay() === 0) {
    // it means we are on an ordinary  Sunday (any sunday other than Great lent and Pentecostal period Sundays)
    // console.log('We are on a sunday')
    let sunday: string = checkWhichSundayWeAre(Number(copticDay), today.getDay());
    //the readings for the 5th sunday of any coptic month (other than the 5th sunday of the Great Lent or the Pentecostal Days) are the same. We will then retrieve the readings of the 5th sunday of the first coptic month (Tout)
    sunday === "5thSunday"
      ? (sunday = "01" + sunday)
      : (sunday = copticMonth + sunday);
    return sunday;
  } else {
    // it means we are in an ordinary day and we follow the ordinary readings calender, this should return a coptic date in a string of "DDMM"
    let date: string[] =
      copticReadingsDates
        .find(datesArray => datesArray.includes(coptDate));
    if (date) return date[0];
    else return coptDate;
  }
}
/**
 * Checks which Sunday we are in the coptic month (i.e. is it the 1st Sunday? 2nd Sunday, etc.)
 * @param {number} day  - the day of the coptic month or the number of days since the beginning of a season like the Great Lent or the Pentecostal days
 * The function returns a string like "1stSunday", "2nd Sunday", etc.
 */
function checkWhichSundayWeAre(day: number, theWeekDay: number = 0): string {
  if (theWeekDay !== 0) return;
  let n: number = day;
  if (Season === Seasons.GreatLent) n = n - 2; //The counting of the nubmer of days during the Great Lent starts from the Saturday preceding the first day of the Great Lent (which is a Monday). We hence substract 2 from the number of days elapsed in order to count for the 2 extra days added to the actual number of days elapsed since the begining of the Great Lent
  n = Math.ceil(Math.abs(n) / 7); //We use Math.abs in order to deal with cases where the difference is <0
  let sunday: string = n.toString();
  if (n === 1 || (n > 20 && n % 10 === 1)) sunday = sunday + "stSunday";
  else if (n === 2 || (n > 20 && n % 10 === 2)) sunday = sunday + "ndSunday";
  else if (n === 3 || (n > 20 && n % 10 === 3)) sunday = sunday + "rdSunday";
  else sunday = sunday + "thSunday";
  return sunday;
}
/**
 * It takes the date of today and checks whether according the Resurrection date this year, we are during an unfixed season like Great Lent, Pentecostal days or Apostles feast, etc.
 * @param {Date} today  - is the date of today according to the Gregorian calendar (it can be any day of the year if the user had manually set it)
 * @returns {string} - a string expressing the readings date . It will be added to the id of the reading in order to retrieve the coptic readings of the day
 */
function checkIfInASpecificSeason(today: Date): string {
  let readingsDate: string;
  //We filter the ResurrectionDates array for the resurrection date for the current year:
  let resurrectionDate: number[] = ResurrectionDates.find(
    (date) => date[0] === today.getFullYear()
  );

  //We create a new Date from the selected resurrection date, and will set its hour to UTC 0
  let resurrection = Date.UTC(resurrectionDate[0],resurrectionDate[1]-1, resurrectionDate[2], 0, 0, 0, 0);
  //We create a new date equal to "today", and will set its hour to 0
  
  let todayUTC: number = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  readingsDate = checkForUnfixedEvent(
    todayUTC, //this is a number reflecting the date of today at UTC 0 hour
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
function checkForUnfixedEvent(
  today: number,
  resDate: number,
  weekDay: number
): string {
  let difference = Math.floor((resDate - today) / calendarDay); // we get the difference between the 2 dates in days
  //We initiate the Season to NoSeason
  let date: string;
  Season = Seasons.NoSeason;

  (function ifResurrection() {
    if (difference < 0) return;
    if (difference > 1) return;
    if (difference === 1 && todayDate.getHours() > 15) return;

    //If we are Saturday (which means that difference = 1) and we are after 3 PM, we will retrieve the readings of the Resurrection because we use to celebrate the Resurrection Mass on Saturday evening not on Sunday itself
    Season = Seasons.PentecostalDays; //we set teh Season value
    date = isItSundayOrWeekDay(Seasons.GreatLent, 58, weekDay);
  })();

  (function ifJonahFast() {
    if (difference > 68) return;
    if (difference < 65) return;

    //We are in the Jonah Fast days (3 days + 1)
    //The Jonah feast starts 15 days before the begining of the Great Lent
    
    difference === 65
      ? Season = Seasons.JonahFeast//We are on the Jonah Feast
      : Season = Seasons.JonahFast; //We are during the 3 days of Jonah Fast
    date = isItSundayOrWeekDay(
      Seasons.JonahFast,
      Math.abs(69 - difference),
      weekDay
    );
  })();

  (function ifGreatLentPreparation() {
    if (![57, 56].includes(difference)) return; //the 57th and the 56th days before Resurrection correspond to the Saturday and the Sunday preceding the first day of the Great Lent (which is a Monday = Resurrection - 55 days). The readings of those 2 days are linked to the Great Lent Season.
    date = Seasons.GreatLent + (58-difference).toString();
  })();

  (function ifGreatLent() {
    if (difference < 1) return;//If <1 it means we are after the Great Lent Preiod (potentially during the Pentecostal days, or on the Resurrection day itself)
    if (difference > 55) return; //it means we are before the begining of the Great Lent
    //We are during the Great Lent period which counts 56 days from the Saturday preceding the 1st Sunday (which is the begining of the so called "preparation week") until the Resurrection day
    if (copticDate === "1007")
      Season =
        Seasons.CrossFeast; //! CAUTION: This must come BEFORE Seasons.GreatLent because the cross feast is celebrated twice, one of which during the Great Lent (10 Bramhat). If we do not place this 'else if' condition before the Great Lent season, it will never be fulfilled during the Great Lent
    else if (difference < 7 || (difference === 7 && todayDate.getHours() > 12))
      Season =
        Seasons.HolyWeek; //i.e., if we are between Monday and Friday of the Holy Week or if we are on Palm Sunday afternoon
    else Season = Seasons.GreatLent;

    date = isItSundayOrWeekDay(Seasons.GreatLent, 58 - difference, weekDay);

  })();

  (function ifPentecostalPeriod() {
    if (difference > 0) return;
    if (Math.abs(difference) > 49) return;
    // we are during the 50 Pentecostal days
    Season = Seasons.PentecostalDays;
    date = isItSundayOrWeekDay(
      Seasons.PentecostalDays,
      Math.abs(difference),
      weekDay
    );
  })();

  (function ifApostlesFast() {
    if (difference > 0) return; //This means that we are before the Ressurrection Feast, and probably still during the Great Lent
    if (Math.abs(difference) < 49) return; //this means that we are still during the Pentecostal Period
    if (Number(copticMonth) > 11) return;
    if (Number(copticMonth) === 11 && Number(copticDay) > 4) return; //We are after the Apostles Feast

    //We are more than 50 days after Resurrection, which means that we are during the Apostles lent (i.e. the coptic date is before 05/11 which is the date of the Apostles Feast)
    Season = Seasons.ApostlesFast;
  })();

  (function ifStMaryFast() {
    if (Number(copticMonth) !== 12) return;
    if (Number(copticDay) > 15) return;

    //We are between 01/12 and 15/12, which means that we are during St Mary's Fast
    Season = Seasons.StMaryFast;
  })();

  (function ifNayrouzOrCrossFeast() {
    if (Number(copticMonth) !== 1) return;
    if (Number(copticDay) > 19) return;

    if (Number(copticDay) < 17) Season = Seasons.Nayrouz;
    else if (Number(copticDay) > 16) Season = Seasons.CrossFeast;
  })();

  (function ifNativityFast() {
    if (Number(copticMonth) !== 3) return;
    if (Number(copticDay) < 16) return;

    //We are during the Nativity Fast which starts on 16 Hatour and ends on 29 Kiahk, but we are not during the month of Kiahk. Note that Kiahk is a different Season
    Season = Seasons.NativityFast;
  })();

  (function ifEarlyKiahk() {
    if (copticDate !== "3003") return;
    if (weekDay !== 0) return;

    //If 30th of Hatour is a Sunday, it means that Kiahk will have only 3 Sundays before Kiahk 28th (i.e., on the 7th, 14th && 21th). We hence consider that 30th of Hatour is the 1st Sunday of Kiahk
    Season = Seasons.KiahkWeek1;
    date = checkWhichSundayWeAre(7, 0);
  })();

  (function ifKiahk() {
    //!Caution this must come before isNativityParamoun() and isNativityFeast()
    if (Number(copticMonth) !== 4) return;
    if (Number(copticDay) > 27) return;//We are either in the Paramoun or during the Feast

    date = getKiahkWeek();

    function getKiahkWeek(): string {
      let sunday: string;
      if ([0, 7, 14, 21].includes(Number(copticDay) - weekDay))
        //When the 1st of Kiahk is a Monday, Kiahk will have only 3 Sundays before Kiahk 28th (i.e., on the 7th, the 14th, and the 21th of Kiahk), we will hence consider that the 30th of Hatour is the 1st Sunday of Kiahk, and will count Kiahk's Sundays from 2
        sunday = checkWhichSundayWeAre(Number(copticDay) + 7 - weekDay);

      else sunday = checkWhichSundayWeAre(Number(copticDay) - weekDay);


      Season = [
        ["1stSunday", Seasons.KiahkWeek1],
        ["2ndSunday", Seasons.KiahkWeek2],
        ["3rdSunday", Seasons.KiahkWeek3],
        ["4thSunday", Seasons.KiahkWeek4],
      ].find((el) => el[0] === sunday)[1]; //We set the Season accroding to the value of sunday

      if (weekDay === 0) return sunday; //!Caution: we need to return the value of Sunday (which will set the readings for this day not only the Season), because it is modified when Kiahk has only 3 Sundays. We do this for the Sundays only because the readings of the other days are not affected. It is just the Season that changes.
    }

  })();

  (function ifNativityParamoun() {
    if (todayDate.getMonth() !== 0) return;//If we are not in January
    if (todayDate.getDate() > 6) return; //If we are after January 6th;
    if (todayDate.getDate() === 6 && todayDate.getHours() > 15) return;//The Nativity Feast has been fixed to January 7th which is Kiahk 28th not Kiahk 29th. We use to celebrate the Nativity Mass on January 6 late afternoon
    if (copticDate === copticFeasts.NativityParamoun && todayDate.getHours() > 15) return;


    if (
      ([4, 5].includes(todayDate.getDate()) && weekDay === 5)//If January 4 or January 5, is a Friday, it means that the Feast (i.e., January 7th) will be a Monday or a Sunday. In both cases, the Paramoun will start on Friday
      ||
      (todayDate.getDate() === 5 && weekDay === 6) //If January 5, is a Saturday, it means that the Nativity Feast (i.e., January 7th will be a Monday), the Paramoun will start on January 4th throughout January 6
      ||
      (todayDate.getDate() === 6 && todayDate.getHours() < 15)//!The Nativity Feast has been fixed to January 7th which corresponds to Kiahk 28th instead of Kiahk 29th. That's why the Paramoun will end in January 6 afternoon. In fact we use to celebrate the Mass in the late evening of January 6th
      ||
      (["2604", "2704"].includes(copticDate) && weekDay === 5)
      ||
      (copticDate === "2704" && weekDay === 6)

      //We are on the day before the Nativity Feast (28 Kiahk), and we are in the morning, it is the Parmoun of the Nativity
    ) {
      Season = Seasons.NativityParamoun;
      date = copticFeasts.NativityParamoun
    }


  })();

  (function ifNativityFeast() {
    if (todayDate.getMonth() !== 0) return; //We are not in January
    if (Number(copticMonth) === 5 && Number(copticDay) > 5) return;

    if (isNativityFeast()) Season = Seasons.Nativity;


    function isNativityFeast(): boolean {
      if (
        (copticDate === copticFeasts.NativityParamoun &&
          todayDate.getHours() > 15)
        ||
        (todayDate.getDate() === 6 && todayDate.getHours() > 15)//This is because the Nativity feast has been fixed to 7 January although it should actually come on January 8th (Kiahk 29th)
        ||
        (todayDate.getDate() === 7)
        ||
        (Number(copticDay) >= 29) //This impliedly means that we are in Kiahk because the function returns if we are after the 6th of Toubah
        ||
        (Number(copticDay) < 7)//This impliedly means that we are during Toubah (before the 6th of Toubah) since January starts in the last week of Kiahk
      ) {
        return true;
      }
    }

  })();


  (function ifBaptismeParamoun() {
    if (Number(copticMonth) !== 5) return;
    if (Number(copticDay) > 10) return;
    if (Number(copticDay) < 8) return;
    if (copticDate === copticFeasts.BaptismParamoun &&
      todayDate.getHours() >= 15) return;

    if (
      (["0805", "0905"].includes(copticDate) && weekDay === 5)//i.e. if 08 Toubah or 09 Toubah is a Friday, it will mark the begining of the Parmoun because 11 Toubah will either be a Sunday or a Monday
      ||
      (copticDate === "0905" && weekDay === 6) //If Toubah 9th is a Saturday, it means that the Feast started on Friday 08 Toubah and continues until 10 Toubah evening
      ||
      (copticDate === copticFeasts.BaptismParamoun &&
        todayDate.getHours() < 15)
    ) {
      Season = Seasons.BaptismParamoun;
      date = copticFeasts.BaptismParamoun
    }; //The readings during all the Baptism Paramoun are those of 10 Toubah

  })();

  (function ifBaptismFeast() {
    if (Number(copticMonth) !== 5) return;
    if (Number(copticDay) > 12) return;

    if (Number(copticDay) >= 11)//i.e., from 11 to 13 Toubah 
      Season = Seasons.Baptism;

    if (copticDate === copticFeasts.BaptismParamoun &&
      todayDate.getHours() > 15) {
      //We are on the Baptism Parmoun after 3PM, we use to celebrate the Baptism Mass in the late evening
      Season = Seasons.Baptism;
      date = copticFeasts.Baptism
    }

  })();


  return date
};

/**
 * If we are  during a given priod or season (like Great Lent): if we are a Sunday, it checks which Sunday of the coptic month we are and adds it to the "period" string. Otherwise, it adds the number of days elapsed since the beginning of the period
 * @param {string} period  - the season or the period *@param {number} days  - the number of days elapsed since the beginning of a given season or period, e.g.:
 * @param {number} weekDay - the day of the week as a number (Sunday = 0)
 * @returns {string} - the period/season after adding either the Sunday or the number of days elapsed
 */
function isItSundayOrWeekDay(
  period: string,
  days: number,
  weekDay: number
): string {
  if (weekDay === 0) {
    //we are a Sunday
    return period + checkWhichSundayWeAre(days, weekDay);
  } else {
    // we are not a sunday
    return period + days.toString();
  }
}
/**
 * Shows the dates (Gregorian, coptic, coptic readings etc.), in an html element in the Temporary Dev Area
 */
function showDates(
  dateDiv: HTMLDivElement = document.getElementById("dateDiv") as HTMLDivElement
): HTMLDivElement {
  if (!dateDiv) {
    dateDiv = containerDiv.insertAdjacentElement(
      "beforebegin",
      document.createElement("div")
    ) as HTMLDivElement;
    dateDiv.classList.add("dateDiv");
    dateDiv.id = "dateDiv";
  }
  if (!dateDiv) return;

  //Inserting the Gregorian date
  let date: string =
    "Date: " +
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
        return (
          "Day " +
          copticReadingsDate.split(Seasons.GreatLent)[1] +
          " of the Great Lent"
        );

      if (copticReadingsDate.startsWith(Seasons.PentecostalDays))
        return (
          "Day " +
          copticReadingsDate.split(Seasons.PentecostalDays)[1] +
          " of the 50 Pentecostal Days"
        );

      if (copticReadingsDate.startsWith(Seasons.JonahFast))
        return (
          "Day " +
          copticReadingsDate.split(Seasons.JonahFast)[1] +
          " of Jonah Fast"
        );

      if (
        copticReadingsDate.endsWith("Sunday") &&
        copticMonths[Number(copticReadingsDate.slice(0, 2))]
      )
        return (
          copticMonths[Number(copticReadingsDate.slice(0, 2))].EN +
          " " +
          copticReadingsDate
            .slice(2, copticReadingsDate.length)
            .split("Sunday")[0] +
          " Sunday"
        );

      if (copticMonths[Number(copticMonth)])
        return (
          copticReadingsDate.slice(0, 2) +
          " " +
          copticMonths[Number(copticReadingsDate.slice(2, 4))].EN
        );

      return "";
    })();

  insertDateBox(date, "copticDateBox");

  function insertDateBox(date: string, id: string) {
    let dateBox: HTMLDivElement = document.getElementById(id) as HTMLDivElement;
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
    let credentialsDiv: HTMLElement = document.getElementById('credentialsDiv');
    if (!credentialsDiv) {
      //Inserting a creditials Div after containerDiv
      credentialsDiv = containerDiv.insertAdjacentElement(
        "afterend",
        document.createElement("div")
      ) as HTMLElement;
      credentialsDiv.classList.add("credentialsDiv");
      credentialsDiv.id = "credentialsDiv";
      credentialsDiv.style.padding = "3px 20px";
    };

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
  })()

  return dateDiv;
}

/**
 * Changes the current Gregorian date and adjusts the coptic date and the coptic readings date, etc.
 * @param {string} date  - allows the user to pass the Greogrian calendar day to which he wants the date to be set, as a string provided from an input box or by the date picker
 * @param {boolean} next  - used when the user wants to jumb forward or back by only one day
 * @param {number} days  - the number of days by which the user wants to jumb forward or back
 * @returns {Date} - the Gregorian date as set by the user
 */
async function changeDate(
  date?: Date,
  next: boolean = true,
  days: number = 1,
  showAlert: boolean = true
): Promise<Date> {
  if (date) {
    if (!todayDate || checkIfDateIsToday(date)) todayDate = new Date();
    else todayDate.setTime(new Date(date).getTime());
  } else {
    if (next) {
      todayDate.setTime(todayDate.getTime() + days * calendarDay); //advancing the date by the number of calendar years
    } else if (!next) {
      todayDate.setTime(todayDate.getTime() - days * calendarDay);
    }
  }
  await setCopticDates(todayDate);
  PrayersArrays.forEach((array) => (array = []));
  populatePrayersArrays();
  if (checkIfDateIsToday(todayDate)) {
    localStorage.removeItem("selectedDate");
  } else {
    //If todayDate is not equal to the date of today (not same day and same month and same year), we store the manually selected date in the local storage
    localStorage.selectedDate = todayDate.getTime().toString();
  }
  console.log(todayDate);
  if (showAlert)
    alert(
      "Date was successfully changed to " +
      todayDate.getDate().toString() +
      "/" +
      (todayDate.getMonth() + 1).toString() +
      "/" +
      todayDate.getFullYear().toString() +
      " which corresponds to " +
      copticDate +
      " of the coptic calendar "
    );
  return todayDate;
}

/**
 * Checks whether the date passed to it is today
 * @param {Date} storedDate  - The date which we want to check if it corresponds to today
 * @returns {boolean} - returns true if storedDate is same as today
 */
function checkIfDateIsToday(date: Date): boolean {
  if (!date
    ||
    (
      date.getDate() === new Date().getDate()
      &&
      date.getMonth() === new Date().getMonth()
      &&
      date.getFullYear() === new Date().getFullYear()))
    return true; //If the date argument is not valid,  or if the date argument refers to the same day, month and year as today, we will return true which means that todayDate will be set to today's date

  return false;
}

function testReadings() {
  addConsoleSaveMethod(console);
  let btns: Button[] = [
    ...btnDayReadings.children,
    btnReadingsGospelNight,
    btnReadingsPropheciesDawn,
  ];
  let query: string,
    result: string = "";
  setCopticDates(new Date("2022.12.31"));

  for (let i = 1; i < 367; i++) {
    changeDate(undefined, true, undefined, false);
    result += "copticDate = " + copticDate + "\n";
    result += "copticReadingsDate = " + copticReadingsDate + "\n";
    if (weekDay === 0) result += "it is a Sunday \n";

    btns.forEach((btn) => {
      if (
        !(Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
        (btn === btnReadingsGospelNight || btn === btnReadingsPropheciesDawn)
      )
        return;
      if (
        (Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
        (weekDay === 0 || weekDay === 6) &&
        btn === btnReadingsPropheciesDawn
      )
        return; //During the Great Lent and Jonah Fast, only the week-days have Prophecies Readings in the Incense Dawn office
      if (
        Season === Seasons.GreatLent &&
        weekDay !== 0 &&
        (btn === btnReadingsGospelIncenseVespers ||
          btn === btnReadingsGospelNight)
      )
        return; //During the Great Lent, only Sunday has Vespers (on Saturday afternoon), and Gospel Night (on Sunday afternoon)
      if (
        Season === Seasons.GreatLent &&
        weekDay === 0 &&
        btn === btnReadingsGospelIncenseVespers &&
        copticReadingsDate === "GL9thSunday"
      )
        return; //no vespers for the Resurrection Sunday
      if (
        Season === Seasons.JonahFast &&
        weekDay !== 1 &&
        btn === btnReadingsGospelIncenseVespers
      )
        return; //During the Jonah Fast, only Monday has Vespers prayers
      if (Season === Seasons.HolyWeek) return; //No readings during the holy week
      if (btn.prayersArray && btn.prayersSequence) {
        query = btn.prayersSequence[0] + "&D=" + copticReadingsDate + "&C=";
        let reading: string[][][] = btn.prayersArray.filter((tbl) =>
          tbl[0][0].startsWith(query)
        );

        if (reading.length < 1)
          result += "\tmissing: " + btn.label.FR + "\nquery= " + query + "\n";
        if (reading.length > 1) result += "\textra table: " + query;
      }
    });
  }
  //@ts-ignore
  console.save(result, "testReadings Result.doc");

  changeDate(new Date());
}
function testDateFunction(date: Date = new Date("2020.12.31")) {
  addConsoleSaveMethod(console);

  setCopticDates(date);
  let text: string = "";
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
  let unique: Set<string> = new Set();
  let dates: string[][] = [];
  copticReadingsDates.forEach((dateArray) => {
    if (unique.has(dateArray[1])) return;
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
