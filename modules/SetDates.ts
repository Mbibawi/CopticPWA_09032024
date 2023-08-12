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
	convertGregorianDateToCopticDate(today.getTime());
	//copticDate = convertGregorianDateToCopticDate(todayDate);
	Season = Seasons.NoSeason //this will be its default value unless it is changed by another function;
	//copticMonth = copticDate.slice(2, 4);
	copticReadingsDate = setSeasonAndCopticReadingsDate(copticDate);
	//copticDay = copticDate.slice(0, 2);
	isFast = (() => {
		if (copticFasts.indexOf(Season) > -1 || (Season != Seasons.PentecostalDays && weekDay === (3 || 5))) {
			//i.e. if we are in a fasting day 
			return true
		} else { return false };
	})();
	//Showing the dates and the version
	showDates();
	createFakeAnchor('homeImg');
};
/**
 * Converts the provided Gregorian date into Coptic Date
 * @param {number} today - a number reflecting a date, which we will convert into coptic date. If ommitted, it will be set to the current date 
 * @returns {[number[], string]} - an array containing as 1st element an array representing the coptic day, coptic month, and coptic year, the second elemement of the array is a string representing the copitc date formatted as 'DDMM'
 */
function convertGregorianDateToCopticDate(today?: number): [number[], string]{
	
	let tout1: number = new Date('1883.09.11').setUTCHours(0, 0, 0, 0); //this is the Gregorian date for the 1st of Tout of the Coptic year 1600 
	
	let year: number = 1600; //this is the coptic year starting on Sept 11, 1883
	
	today ?
		today = new Date(today).setHours(0, 0, 0, 0)
		: today = new Date().setHours(0, 0, 0, 0);
	
	let differenceInDays = (today - tout1) / calendarDay;

	let diffrenceInYears = Math.floor(differenceInDays / 365.25); //This gives the number of full Coptic years (based on 365.25 day/year)

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
	year += Math.floor(diffrenceInYears);

	copticDay = day.toString();
	if (day < 10) copticDay = '0' + copticDay;
	copticMonth = month.toString();
	if (month < 10) copticMonth = '0' + copticMonth;
	copticDate = copticDay + copticMonth;
	copticYear = year.toString();
	return [[day,month, year], copticDate]
}
/**
 * Converts the Gregorian date to a string expressing the coptic date (e.g.: "0207")
 * @param {Date} date  - a date value expressing any Gregorian calendar date
 * @returns {string} - a string expressing the coptic date
 */
function convertGregorianDateToCopticDate_OldNotUsedAnyMore(date: Date): string {
	let day: number = date.getDate();
	let month: number = date.getMonth() + 1; //we add one because the months count starts at 0
	let coptMonth: number, coptDay: number, dm: number[];
	if (month === 1) {
		day < 9 ? (dm = [22, 4]) : (dm = [-8, 5]);
	} else if (month === 2) {
		day < 7 ? (dm = [23, 5]) : (dm = [-7, 6]);
	} else if (month === 3) {
		day < 10 ? (dm = [21, 6]) : (dm = [-9, 7]);
		//console.log("march ", day + dm[0]);
	} else if (month === 4) {
		day < 9 ? (dm = [23, 7]) : (dm = [-8, 8]);
	} else if (month === 5) {
		day < 9 ? (dm = [23, 8]) : (dm = [-8, 9]);
	} else if (month === 6) {
		day < 8 ? (dm = [23, 9]) : (dm = [-7, 10]);
	} else if (month === 7) {
		day < 8 ? (dm = [23, 10]) : (dm = [-7, 11]);
	} else if (month === 8) {
		day < 7 ? (dm = [24, 11]) : (dm = [-6, 12]);
	} else if (month === 9) {
		if (day < 6) {
			dm = [25, 12];
		} else if (
			(day > 5 && day < 11) ||
			(day === 11 && date.getFullYear() % 4 === 3)
		) {
			//the 13th coptic month gets an additional 6th day every 4 years. It falls 1 year before the leap year of the Gregorian calendar. When we divide by 4, the remainder is 3
			dm = [-5, 13];
		} else {
			dm = [-10, 1];
		}
	} else if (month === 10) {
		day < 11 ? (dm = [20, 1]) : (dm = [-10, 2]);
	} else if (month === 11) {
		day < 11 ? (dm = [21, 2]) : (dm = [-9, 3]);
	} else if (month === 12) {
		day < 10 ? (dm = [21, 3]) : (dm = [-9, 4]);
	}
	setCopticDayAndMonth(dm);
	function setCopticDayAndMonth(daysMonth: number[]) {
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
		console.log(
			"original coptic day and month are: ",
			coptDay,
			coptMonth
		);
		date > new Date(date.getFullYear().toString() + "-02-28") &&
		month === 2
			? (coptDay = coptDay - 1)
			: coptDay;
		if (coptDay === 0) {
			coptDay = 30;
			coptMonth = coptMonth - 1;
		}
	};

	function getTwoDigitsStringFromNumber(n: number): string {
		if (n < 10) {
			return "0" + n.toString();
		} else {
			return n.toString();
		}
	};
	return (
		getTwoDigitsStringFromNumber(coptDay) +
		getTwoDigitsStringFromNumber(coptMonth)
	);
};
/**
 * Sets the coptic readings date according to the Katamaras
 * @param {string} coptDate  - a string expressing the coptic day and month (e.g.: "0306")
 * @returns {string} - a string expressing the coptic reading date (e.g.: "0512", "GreatLent20", "JonahFeast2", etc.)
 */
function setSeasonAndCopticReadingsDate(coptDate: string = copticDate, today: Date = todayDate): string {
	let specialSeason: string = checkIfInASpecificSeason(today);
	if (specialSeason) {
		// it means we got a specific date for the Readings associated with a specific period (e.g.: Great Lent, PentecostalDays, etc.)
		return specialSeason;
	} else if (today.getDay() === 0) {
		// it means we are on an ordinary  Sunday (any sunday other than Great lent and Pentecostal period Sundays)
		// console.log('We are on a sunday')
		let sunday: string = checkWhichSundayWeAre(
			Number(coptDate.slice(0, 2))
		);
		//the readings for the 5th sunday of any coptic month (other than the 5th sunday of the Great Lent or the Pentecostal Days) are the same. We will then retrieve the readings of the 5th sunday of the first coptic month (Tout)
		sunday === "5thSunday"
			? (sunday = "01" + sunday)
			: (sunday = copticMonth + sunday);
		return sunday;
	} else {
		// it means we are in an ordinary day and we follow the ordinary readings calender, this should return a coptic date in a string of "DDMM"
		let date: string[][] = copticReadingsDates.filter(d => d[0] === coptDate);
		if (date[0]) {
			return date[0][1]
		} else {
			return coptDate
		}
	}
};
/**
 * Checks which Sunday we are in the coptic month (i.e. is it the 1st Sunday? 2nd Sunday, etc.)
 * @param {number} day  - the day of the coptic month or the number of days since the beginning of a season like the Great Lent or the Pentecostal days
 * The function returns a string like "1stSunday", "2nd Sunday", etc.
 */
function checkWhichSundayWeAre(day: number): string {
	if (weekDay !== 0) return;
	let n: number = day;
	if (Season === Seasons.GreatLent)
		n = n - 2;
	n = Math.ceil(n / 7);
	let sunday: string = n.toString();
	if (n === 1 || (n > 20 && n % 10 === 1)) {
		sunday = sunday + "stSunday";
	} else if (n === 2 || (n > 20 && n % 10 === 2)) {
		sunday = sunday + "ndSunday";
	} else if (n === 3 || (n > 20 && n % 10 === 3)) {
		sunday = sunday + "rdSunday";
	} else {
		sunday = sunday + "thSunday";
	}
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
	let resurrectionDate: string = ResurrectionDates.filter(date => new Date(date).getFullYear() === today.getFullYear())[0];

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
		//return copticFeasts.Resurrection; //we get the reading of Resurrection although we are still Saturday
	} else if (difference >= 1 && difference < 58) {
		//We are during the Great Lent period which counts 56 days from the Saturday preceding the 1st Sunday (which is the begining of the so called "preparation week") until the Resurrection day
		Season = Seasons.GreatLent;
		if ((difference < 7 && difference > 1)
			|| difference === 7 && todayDate.getHours() > 12) {
			//i.e., if we are between Monday and Friday of the Holy Week or if we are on Palm Sunday afternoon
			Season = Seasons.HolyWeek
		}
		return isItSundayOrWeekDay(Seasons.GreatLent, 58 - difference, weekDay);
	} else if (difference > 65 && difference < 70) {
		//We are in the Jonah Feast days (3 days + 1)
		//The Jonah feast starts 15 days before the begining of the Great Lent
		//I didn't find the readings for this period in the Power Point presentations
		Season = Seasons.JonahFast;
		return isItSundayOrWeekDay(Seasons.JonahFast, Math.abs(70 - difference), weekDay);
	} else if (difference < 0 && Math.abs(difference) < 50) {
		difference
		// we are during the 50 Pentecostal days
		Season = Seasons.PentecostalDays;
		return isItSundayOrWeekDay(
			Seasons.PentecostalDays,
			Math.abs(difference),
			weekDay
		);
	}else if (Number(copticMonth) === 12 && Number(copticDay) < 16) {
		//We are during the St Mary Fast
		Season = Seasons.StMaryFast;
	} else if (Number(copticMonth) === 4 && Number(copticDay) < 29) {
		//We are during the month of Kiahk which starts on 16 Hatour and ends on 29 Kiahk
		Season = Seasons.Kiahk;
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
		(Number(copticMonth) === 5 && Number(copticDay) === 10 && todayDate.getHours() > 15) ||
		(Number(copticMonth) === 5 && Number(copticDay) > 10 && Number(copticDay) < 13)) {
		//We are between the Nativity and the Baptism
		Season = Seasons.Baptism;
	} else if (Number(copticMonth) === 1 && Number(copticDay) < 17) {
		Season = Seasons.Nayrouz;
	} else if (Number(copticMonth) === 1 && Number(copticDay) > 16 && Number(copticDay) > 20) {
		Season = Seasons.CrossFeast;
	} else if (
		difference < 0 && Math.abs(difference) > 49
		&& (
			Number(copticMonth) < 11
		||
			(Number(copticMonth) === 11 && Number(copticDay) < 5)
		)
	) {
		//IMPORTANT ! this must come after all the cases preceding the begining of the Great Lent (otherwise, the 3rd condition: copticMonth <11, will be fulfilled and we will fall into this else if statement)
		//We are more than 50 days after Resurrection, which means that we are potentially during the Apostles Lent
			// We are during the Apostles lent (i.e. the coptic date is before 05/11 which is the date of the Apostles Feast)
			//I didn't find specific readings for this period. I assume there are no specific reading and we follow the ordinary readings. This needs however to be checked that's why I kept this "else if" case
			Season = Seasons.ApostlesFast;
			//My understanding is that the readings during the Apostle fast follow the coptic calendar as any ordinary day. If not, we may activate the return value below
			return //We are for now blocking the next return until we see if there are special readings
			return isItSundayOrWeekDay(
				Seasons.ApostlesFast,
				Math.abs(difference) - 49,
				weekDay
			);	
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
		return period + checkWhichSundayWeAre(days);
	} else {
		// we are not a sunday
		return period + days.toString();
	}
};
/**
 * Shows the dates (Gregorian, coptic, coptic readings etc.), in an html element in the Temporary Dev Area
 */
function showDates(dateDiv?:HTMLDivElement):HTMLDivElement {
	if (!dateDiv) dateDiv = document.getElementById('dateDiv') as HTMLDivElement;
	if (!dateDiv) dateDiv = containerDiv.insertAdjacentElement('beforebegin', document.createElement('div')) as HTMLDivElement;
	dateDiv.classList.add('dateDiv');
	if (dateDiv && dateDiv.children.length > 0) return;
	
	//Inserting the Gregorian date
	let date:string = 'Date: ' +
	todayDate.getDate().toString() + '/' +
	(todayDate.getMonth()+1).toLocaleString('en-US') + '/' +
	(todayDate.getFullYear() + 1).toString()
	
	insertDateBox(date);
	//Inserting the home image after the dateBox
	dateDiv.appendChild(document.getElementById('homeImg'));
	//Inserting the Coptic date
	date = 'Coptic Date: ' +
	copticDay + ' ' +
	copticMonths[Number(copticMonth)].EN + ' ' +
		copticYear + ' \n' +
		'Readings date: ' + copticReadingsDate.slice(0, 2) + ' ' +
		copticMonths[Number(copticReadingsDate.slice(2, 4))].EN;
	
	insertDateBox(date);

	function insertDateBox(date: string) {
		//Inserting a date box
		let dateBox = dateDiv.appendChild(document.createElement('div'));
		dateBox.style.display = 'block !important';
		let p = dateBox.appendChild(document.createElement('p'))
		p.classList.add('dateBox');
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
function changeDate(
	date?: Date,
	next: boolean = true,
	days: number = 1,
	showAlert:boolean = true
  ): Date {
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
	setCopticDates(todayDate);
	setSeasonalTextForAll();
	reloadScriptToBody(['PrayersArray']);
	allSubPrayersArrays.forEach((subArray) => {
		for (let i = subArray.length - 1; i >= 0; i--) subArray.splice(i, 1)});
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
				
				if (reading.length < 1) result += '\tmissing: ' + btn.label.foreignLanguage + '\nquery= ' + query + '\n';
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