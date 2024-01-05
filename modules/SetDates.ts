
/**
 * a function that runs at the beginning and sets some global dates like the coptic date (as a string), today's Gregorian date (as a Date), the day of the week (as a number), the Season (a string), etc.
 * @param {Date} today  - a Gregorian date provided by the user or set automatically to the date of today if missing
 */
async function setCopticDates(today?: Date) {
	if (!today)
	{
		today = new Date();
		if(localStorage.selectedDate) localStorage.removeItem('selectedDate'); //We do this in order to reset the local storage 'selectedDate' when setCopticDates() is called without a date passed to it
	}
	todayDate = today;
	weekDay = todayDate.getDay();
	convertGregorianDateToCopticDate(today.getTime(), true);

	Season = Seasons.NoSeason //this will be its default value unless it is changed by another function;
	copticReadingsDate = getSeasonAndCopticReadingsDate(copticDate) as string;
	if(checkIf29thOfCopticMonth()) copticFeasts.theTwentyNinethOfCopticMonth = copticDate;

	await setSeasonalTextForAll(Season); //!This must be called here after the dates and seasons were changed
	reloadScriptToBody(['PrayersArray']);
	createFakeAnchor('homeImg');
	if (!copticReadingsDate) return console.log('copticReadingsDate was not property set = ', copticReadingsDate);
	//copticDay = copticDate.slice(0, 2);
	isFast = (() => {
		if (Season === Seasons.PentecostalDays) return false;
		else if (copticFasts.indexOf(Season) > -1) return true; //i.e. if we are during a fast period 
		else if (weekDay === (3 || 5)) return true;
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
function convertCopticDateToGregorianDate(copticDate: number[], gregorianDate?:number) {
	if (!copticDate || copticDate.length < 3) return;
	
	let currentCopticDate = convertGregorianDateToCopticDate()[0]; //This will give a [day, month, year] array

	let yearsDifference = copticDate[2] - currentCopticDate[2];
	let monthsDifference = copticDate[1] - currentCopticDate[1];
	let daysDifference = copticDate[0] - currentCopticDate[0];

	let calendarDaysDifference = ((yearsDifference * 365) + (monthsDifference * 30) + daysDifference) * calendarDay;

	calendarDaysDifference = calendarDaysDifference + (yearsDifference / 4) //Leap years

	if (!gregorianDate) gregorianDate = todayDate.getDate();
	
	gregorianDate = gregorianDate - calendarDaysDifference;
	
	return gregorianDate

}
/**
 * Converts the provided Gregorian date into Coptic Date
 * @param {number} today - a number reflecting a date, which we will convert into coptic date. If ommitted, it will be set to the current date 
 * @param {boolean} changeDates - tells whether the function should change the Coptic dates or should just return the new Coptic Date
 * @returns {[number[], string]} - an array containing as 1st element a number[] = [day, month, year] representing the coptic day, coptic month, and coptic year, the second elemement of the array is a string representing the copitc date formatted as 'DDMM'
 */
function convertGregorianDateToCopticDate(today?: number, changeDates:boolean = true): [number[], string]{
	
	let tout1: number = new Date('1883.09.11').setUTCHours(0, 0, 0, 0); //this is the Gregorian date for the 1st of Tout of the Coptic year 1600 
	
	let year: number = 1600; //this is the coptic year starting on Sept 11, 1883
	
	today ?
		today = new Date(today).setHours(0, 0, 0, 0)
		: today = new Date().setHours(0, 0, 0, 0);
	
	let differenceInDays = (today - tout1) / calendarDay;

	let diffrenceInYears = Math.floor(differenceInDays / 365.25); //This gives the number of full Coptic years (based on 365.25 day/year)

	year += diffrenceInYears;

	let daysInCurrentYear = ((differenceInDays / 365.25) - Math.trunc(differenceInDays / 365.25)) * 365.25;
	if (daysInCurrentYear === 0) daysInCurrentYear += 1;
	daysInCurrentYear = Math.ceil(daysInCurrentYear);

	let month = daysInCurrentYear / 30;
	if (daysInCurrentYear / 30 === 0) month = 1;
	month = Math.ceil(month);

	let day = Math.ceil(daysInCurrentYear % 30);
	if (day > 30) day -= 30;
	if (daysInCurrentYear % 30 === 0) day = 30;

	if (new Date(today).getFullYear() % 4 !== 3
		&& month === 13
		&& day === 6) {
		//We are not in a leap year
		day = 1;
		month = 1;
		year += 1;
	}
	
	let dayString = day.toString().padStart(2, '0');
	let monthString = month.toString().padStart(2,'0')
	if(changeDates){
		copticDay = dayString;
		copticMonth = monthString;
		copticDate = dayString + monthString;
		copticYear = year.toString();
	}
	return [[day,month, year], dayString + monthString]
}

/**
 * Sets the coptic readings date according to the Katamaras
 * @param {string} coptDate  - a string expressing the coptic day and month (e.g.: "0306")
 * @returns {string} - a string expressing the coptic reading date (e.g.: "0512", "GreatLent20", "JonahFeast2", etc.)
 */
function getSeasonAndCopticReadingsDate(coptDate: string = copticDate, today: Date = todayDate): string | void {
	if (!coptDate) return console.log('coptDate is not valid = ', coptDate);
	
	let specialSeason: string = 	checkIfInASpecificSeason(today);
	if (specialSeason) {
		// it means we got a specific date for the Readings associated with a specific period (e.g.: Great Lent, PentecostalDays, etc.)
		return specialSeason;
	} else if (weekDay === 0) {
		// it means we are on an ordinary  Sunday (any sunday other than Great lent and Pentecostal period Sundays)
		// console.log('We are on a sunday')
		let sunday: string = checkWhichSundayWeAre(Number(copticDay),weekDay);
		//the readings for the 5th sunday of any coptic month (other than the 5th sunday of the Great Lent or the Pentecostal Days) are the same. We will then retrieve the readings of the 5th sunday of the first coptic month (Tout)
		sunday === "5thSunday"
			? (sunday = "01" + sunday)
			: (sunday = copticMonth + sunday);
		return sunday;
	} else {
		// it means we are in an ordinary day and we follow the ordinary readings calender, this should return a coptic date in a string of "DDMM"
		let date: string[][] = copticReadingsDates.filter(datesArray => datesArray.indexOf(coptDate)>0);
		if (date[0]) return date[0][0];
		else return coptDate;
	}
};
/**
 * Checks which Sunday we are in the coptic month (i.e. is it the 1st Sunday? 2nd Sunday, etc.)
 * @param {number} day  - the day of the coptic month or the number of days since the beginning of a season like the Great Lent or the Pentecostal days
 * The function returns a string like "1stSunday", "2nd Sunday", etc.
 */
function checkWhichSundayWeAre(day: number, theWeekDay:number=0): string
{
	if (theWeekDay !== 0) return;
	let n: number = day;
	if (Season === Seasons.GreatLent) n = n - 2; //The counting of the nubmer of days during the Great Lent starts from the Saturday preceding the first day of the Great Lent (which is a Monday). We hence substract 2 from the number of days elapsed in order to count for the 2 extra days added to the actual number of days elapsed since the begining of the Great Lent
	n = Math.abs(Math.ceil(n / 7));//We use Math.abs in order to deal with cases where the difference is <0
	let sunday: string = n.toString();
	if (n === 1 || (n > 20 && n % 10 === 1)) sunday = sunday + "stSunday";
	else if (n === 2 || (n > 20 && n % 10 === 2)) sunday = sunday + "ndSunday";
	else if (n === 3 || (n > 20 && n % 10 === 3))		sunday = sunday + "rdSunday";
	else sunday = sunday + "thSunday";
	return sunday;
};
/**
 * It takes the date of today and checks whether according the Resurrection date this year, we are during an unfixed season like Great Lent, Pentecostal days or Apostles feast, etc.
 * @param {Date} today  - is the date of today according to the Gregorian calendar (it can be any day of the year if the user had manually set it)
 * @returns {string} - a string expressing the readings date . It will be added to the id of the reading in order to retrieve the coptic readings of the day 
 */
function checkIfInASpecificSeason(today: Date): string {
	let readingsDate: string;
	//We filter the ResurrectionDates array for the resurrection date for the current year: 
	let resurrectionDate: string = ResurrectionDates.find(date => date[0] === today.getFullYear())[1];

	//We create a new Date from the selected resurrection date, and will set its hour to UTC 0
	let resurrection = new Date(resurrectionDate).setHours(0, 0, 0, 0);
	//We create a new date equal to "today", and will set its hour to 0
	let todayUTC:number = new Date(today).setHours(0, 0, 0, 0);
	readingsDate = checkForUnfixedEvent(
				todayUTC, //this is a number reflecting the date of today at UTC 0 hour
				resurrection, //we get a number reflecting the resurrection date at UTC 0 hour
				today.getDay() //we get the day of the week as a number starting from 0
			);
	;
	return readingsDate;
};
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
	let difference = Math.floor((resDate - today) / calendarDay) // we get the difference between the 2 dates in days
	//We initiate the Season to NoSeason
	Season = Seasons.NoSeason;

	if (difference === 0 || (difference === 1 && todayDate.getHours() > 15)) {
		//If we are Saturday (which means that difference = 1) and we are after 3 PM, we will retrieve the readings of the Resurrection because we use to celebrate the Resurrection Mass on Saturday evening not on Sunday itself
		Season = Seasons.PentecostalDays; //we set teh Season value
		return isItSundayOrWeekDay(Seasons.GreatLent, 58, weekDay);
	} else if (difference > 65 && difference < 70) {
		//We are in the Jonah Feast days (3 days + 1)
		//The Jonah feast starts 15 days before the begining of the Great Lent
		//I didn't find the readings for this period in the Power Point presentations
		Season = Seasons.JonahFast;
		return isItSundayOrWeekDay(Seasons.JonahFast, Math.abs(70 - difference), weekDay);
	} else if (difference >0 && difference < 58) {
		//We are during the Great Lent period which counts 56 days from the Saturday preceding the 1st Sunday (which is the begining of the so called "preparation week") until the Resurrection day
		if (copticDate === '1007')
			Season = Seasons.CrossFeast; //! CAUTION: This must come BEFORE Seasons.GreatLent because the cross feast is celebrated twice, one of which during the Great Lent (10 Bramhat). If we do not place this 'else if' condition before the Great Lent season, it will never be fulfilled during the Great Lent
	
		else if (difference < 7
			|| (difference === 7 && todayDate.getHours() > 12))
			Season = Seasons.HolyWeek; //i.e., if we are between Monday and Friday of the Holy Week or if we are on Palm Sunday afternoon 

		else Season = Seasons.GreatLent;
		
		return isItSundayOrWeekDay(Seasons.GreatLent, 58 - difference, weekDay);

	} else if (difference <0 && Math.abs(difference) < 50) {
		difference
		// we are during the 50 Pentecostal days
		Season = Seasons.PentecostalDays;
		return isItSundayOrWeekDay(
			Seasons.PentecostalDays,
			Math.abs(difference),
			weekDay
		);
	} else if (
		difference < 0 && Math.abs(difference) > 49
		&& Number(copticMonth) > convertGregorianDateToCopticDate(resDate, false)[0][1]//This is the coptic month for the Resurrection day
		&& (
			Number(copticMonth) < 11
		||
			(Number(copticMonth) === 11 && Number(copticDay) < 5) //This is the Apostles Feast
		)
	) {
		//We are more than 50 days after Resurrection, which means that we are during the Apostles lent (i.e. the coptic date is before 05/11 which is the date of the Apostles Feast)
			Season = Seasons.ApostlesFast;
	} else if (Number(copticMonth) === 12 && Number(copticDay) < 16) {
		//We are during the St Mary Fast
		Season = Seasons.StMaryFast;

	} else if ((Number(copticMonth) === 1) && Number(copticDay)<20) {
		if (Number(copticDay) < 17)
			Season = Seasons.Nayrouz;
		else if (Number(copticDay) > 16)
			Season = Seasons.CrossFeast;

	} else if (Number(copticMonth) === 4 && Number(copticDay) < 29) {
		let sunday = checkWhichSundayWeAre(Number(copticDay) - weekDay);
		//We are during the month of Kiahk which starts on 16 Hatour and ends on 29 Kiahk
		if (sunday === '1stSunday' || sunday === '2ndSunday') Season = Seasons.KiahkWeek1;
		else if (sunday === '3rdSunday' || sunday === '4thSunday') Season = Seasons.KiahkWeek2;
	} else if (Number(copticMonth) === 3 && Number(copticDay) > 15) {
		//We are during the Nativity Fast which starts on 16 Hatour and ends on 29 Kiahk, but we are not during the month of Kiahk
		Season = Seasons.NativityFast;

	} else if (copticDate === copticFeasts.NativityParamoun && todayDate.getHours() < 15) {
		//We are on the day before the Nativity Feast (28 Kiahk), and we are in the morning, it is the Parmoun of the Nativity
		return copticFeasts.NativityParamoun;
	} else if (
		(copticDate === copticFeasts.NativityParamoun && todayDate.getHours() > 15) 
		|| (Number(copticMonth) === 4 && Number(copticDay) > 28)
		||(Number(copticMonth) === 5 && Number(copticDay) < 7)) {
		//We are on the day before the Nativity Feast, and we are in the afternoon we will set the Season as Nativity and the copticReadingsDate to those of nativity
		Season = Seasons.Nativity; //From 28 Kiahk afternoon to Circumsion (6 Toubi)
	} else if (
		(copticDate === '0805' || copticDate === '0905')
		&& todayDate.getDay() === 5) {
		//This means that  we are Friday and the Baptism feast (11 Toubah) is either next Monday or Sunday, which means that the Baptism Paramoun will be either 3 or 2 days (Friday, Saturday and Sunday, or Friday and Saturday)
		Season = Seasons.BaptismParamoun;
		return '1005';//The readings during the Baptism Paramoun are those of 10 Toubah
	} else if (
		(Number(copticMonth) === 5 && Number(copticDay) === 10 && todayDate.getHours() > 15) ||
		(Number(copticMonth) === 5 && Number(copticDay) > 10 && Number(copticDay) < 13)) {
		//We are between the Nativity and the Baptism
		Season = Seasons.Baptism;
	} else if (Number(copticMonth) === 1 && Number(copticDay) < 17) {
		Season = Seasons.Nayrouz;
	} 
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
};
/**
 * Shows the dates (Gregorian, coptic, coptic readings etc.), in an html element in the Temporary Dev Area
 */
function showDates(dateDiv: HTMLDivElement = document.getElementById('dateDiv') as HTMLDivElement): HTMLDivElement {
	if (!dateDiv) {
		dateDiv = containerDiv.insertAdjacentElement('beforebegin', document.createElement('div')) as HTMLDivElement;
		dateDiv.classList.add('dateDiv');
		dateDiv.id = 'dateDiv'
	};
	if (!dateDiv) return;

	//Inserting the Gregorian date
	let date:string = 'Date: ' +
	todayDate.getDate().toString() + '/' +
	(todayDate.getMonth()+1).toLocaleString('en-US') + '/' +
	(todayDate.getFullYear()).toString()
	
	insertDateBox(date, 'gregorianDateBox');

	//Inserting the home image after the dateBox
	if (!dateDiv.querySelector('#homeImg')) dateDiv.appendChild(document.getElementById('homeImg'));
	
	//Inserting the Coptic date
	date = 'Coptic Date: ' +
	copticDay + ' ' +
	copticMonths[Number(copticMonth)].EN + ' ' +
		copticYear + ' \n' +
		'Readings date: ' +
		(() => {
		if (copticReadingsDate.startsWith(Seasons.GreatLent)) return 'Day ' + copticReadingsDate.split(Seasons.GreatLent)[1] + 'of the Great Lent';

		if (copticReadingsDate.startsWith(Seasons.PentecostalDays)) return 'Day ' + copticReadingsDate.split(Seasons.PentecostalDays)[1] + ' of the 50 Pentecostal Days';

				
		if (copticReadingsDate.endsWith('Sunday')
		&& copticMonths[Number(copticReadingsDate.slice(0, 2))]) return copticMonths[Number(copticReadingsDate.slice(0, 2))].EN + ' ' + copticReadingsDate.slice(2, copticReadingsDate.length).split('Sunday')[0] + ' Sunday';
		
		if (copticMonths[Number(copticReadingsDate.slice(2, 4))]) return copticReadingsDate.slice(0, 2) + ' ' +
			copticMonths[Number(copticReadingsDate.slice(2, 4))].EN;
		
		return '';
		})();
	
	insertDateBox(date, 'copticDateBox');

	function insertDateBox(date: string, id: string) {
		let dateBox: HTMLDivElement = document.getElementById(id) as HTMLDivElement;
		//Inserting a date box
		if(!dateBox){
			dateBox = dateDiv.appendChild(document.createElement('div'))
			dateBox.id = id
			dateBox.style.display = 'block !important';
			dateBox.classList.add('dateBox');
		};
		dateBox.innerHTML = ''; //we empty the div
		let p = dateBox.appendChild(document.createElement('p'));
		p.innerText = date;
	}
	
	//Inserting a creditials Div after containerDiv
	let credentialsDiv = containerDiv.insertAdjacentElement('afterend', document.createElement('div')) as HTMLElement;
	credentialsDiv.classList.add('credentialsDiv');
	credentialsDiv.id = 'credentialsDiv';
		credentialsDiv.style.padding = '3px 20px';
		credentialsDiv.innerText =
			"Today: " +
		todayDate.toString() +
		" .\n Season = " + Season +
		" .\n Version = " + version + '.\n' +
			'We ' + `${isFast ? 'are ' : 'are not '}` + 'during a fast period or on a fast day (Wednesday or Friday';

	return dateDiv
};

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
	showAlert:boolean = true
  ): Promise<Date> {
	if (date) {
		if (checkIfDateIsToday(date)) todayDate = new Date();
		else	todayDate.setTime(new Date(date).getTime());
	} else {
	  if (next) {
		todayDate.setTime(todayDate.getTime() + days * calendarDay); //advancing the date by the number of calendar years
	  } else if (!next) {
		todayDate.setTime(todayDate.getTime() - days * calendarDay);
	  }
	}
	await setCopticDates(todayDate);
	PrayersArrays.forEach(array => array = []);
	populatePrayersArrays();
	if (checkIfDateIsToday(todayDate)) {
		localStorage.removeItem('selectedDate');
	} else {
		//If todayDate is not equal to the date of today (not same day and same month and same year), we store the manually selected date in the local storage
		  localStorage.selectedDate = todayDate.getTime().toString();
	}	
	console.log(todayDate);
	if(showAlert) alert('Date was successfully changed to ' + todayDate.getDate().toString() + "/" + (todayDate.getMonth() +1).toString() +"/" + todayDate.getFullYear().toString() + " which corresponds to " + copticDate + " of the coptic calendar ")
	return todayDate;
}

/**
 * Checks whether the date passed to it is today
 * @param {Date} storedDate  - The date which we want to check if it corresponds to today
 * @returns {boolean} - returns true if storedDate is same as today
 */
function checkIfDateIsToday(date: Date):boolean {
	let newDate = new Date();
	if (date.getDate() === newDate.getDate()
		&& date.getMonth() === newDate.getMonth()
		&& date.getFullYear() === newDate.getFullYear()
	) {
		return true;
	}
	return false
}

function testReadings() {
	addConsoleSaveMethod(console);
	let btns: Button[] = [...btnDayReadings.children, btnReadingsGospelNight, btnReadingsPropheciesDawn];
	let query: string, result:string = '';
	setCopticDates(new Date('2022.12.31'));

	for (let i = 1; i < 367; i++){
		changeDate(undefined, true,undefined,false);
		result += 'copticDate = ' +  copticDate + '\n';
		result += 'copticReadingsDate = ' + copticReadingsDate + '\n';
		if(weekDay === 0) result += 'it is a Sunday \n'

		btns.forEach(btn => {
			if (
				(!(Season === Seasons.GreatLent
					|| Season === Seasons.JonahFast))
				&& (btn === btnReadingsGospelNight
					|| btn === btnReadingsPropheciesDawn))
				return;
			if (
				(Season === Seasons.GreatLent
					|| Season === Seasons.JonahFast)
				&&
				(weekDay === 0
					|| weekDay === 6)
				&&
				(btn === btnReadingsPropheciesDawn)
			) return; //During the Great Lent and Jonah Fast, only the week-days have Prophecies Readings in the Incense Dawn office
			if (
				Season === Seasons.GreatLent
				&& weekDay !== 0
				&& (btn === btnReadingsGospelIncenseVespers
					|| btn === btnReadingsGospelNight)
			) return; //During the Great Lent, only Sunday has Vespers (on Saturday afternoon), and Gospel Night (on Sunday afternoon)
			if (
				Season === Seasons.GreatLent
				&& weekDay === 0
				&& btn === btnReadingsGospelIncenseVespers
				&& copticReadingsDate === 'GL9thSunday'
			) return; //no vespers for the Resurrection Sunday
			if (
				Season === Seasons.JonahFast
				&& weekDay !== 1
				&& btn === btnReadingsGospelIncenseVespers
			) return; //During the Jonah Fast, only Monday has Vespers prayers
			if (Season === Seasons.HolyWeek) return;//No readings during the holy week
			if (btn.prayersArray && btn.prayersSequence) {
				query = btn.prayersSequence[0] + '&D=' + copticReadingsDate + '&C=';
				let reading: string[][][] = btn.prayersArray.filter(tbl => tbl[0][0].startsWith(query));
				
				if (reading.length < 1) result += '\tmissing: ' + btn.label.FR + '\nquery= ' + query + '\n';
				if (reading.length > 1) result += '\textra table: ' + query;
			}
		}
		);

	}
	//@ts-ignore
	console.save(result, 'testReadings Result.doc');

	changeDate(new Date());

}
function testDateFunction(date:Date=new Date('2022.12.31')) {
	addConsoleSaveMethod(console);

	setCopticDates(date);
	let text: string = '';
	for (let i = 1; i < 800; i++){
		changeDate(undefined, true, undefined, false);
		text += 'Gregorian = ' + todayDate.getDate().toString() + '/' + (todayDate.getMonth()+1).toString() + '/' + todayDate.getFullYear().toString() + '\t'
		text += 'Coptic = ' +  copticDate + '\t';
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
	let unique:Set<string>= new Set();
	let dates: string[][] = [];
	copticReadingsDates
		.forEach(dateArray => {
			if (unique.has(dateArray[1])) return;
			unique.add(dateArray[1]);
			dates.push([dateArray[1]]);
			copticReadingsDates
				.filter(array => array[1] === dateArray[1])
				.forEach(arrayDate => dates[dates.length - 1].push(arrayDate[0]))
		});
	console.log(dates);
	
	dates
		.forEach(groupArray => {
		copticReadingsDates
			.filter(dateArray => dateArray[1] === groupArray[0])
			.forEach(dateArray => {
				console.log(dateArray[0]);
				if (groupArray.indexOf(dateArray[0]) < 0) console.log('something wrong', groupArray);
			})
		
	})
	
}





