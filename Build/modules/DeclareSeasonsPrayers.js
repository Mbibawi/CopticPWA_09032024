const giakiAll = [
    {
        Season: Seasons.NoSeason,
        AR: 'لأنكَ أتيْتَ وخَلصْتَنا',
        CA: 'جي آك إي أكسوتي إمّون',
        FR: 'car Tu es venu et nous as sauvés',
        EN: 'for You\'ve come and saved us',
        COP: 'ϫⲉ ⲁⲕ̀\' ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.Nativity,
        AR: 'لأنكَ ولِدتَ وخَلصْتَنا',
        CA: 'جي آك ماسف أكسوتي إمّون',
        FR: 'car Tu es né et nous as sauvés',
        EN: 'for You\'ve born and saved us',
        COP: 'ϫⲉ ⲁⲕ̀\' ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.Baptism,
        AR: 'لأنكَ اعتمدت وخَلصْتَنا',
        CA: 'جي آك أومس أكسوتي إمّون',
        FR: 'car Tu es baptisé et nous as sauvés',
        EN: 'for You\'ve been baptized and saved us',
        COP: 'ϫⲉ ⲁⲕ̀\' ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.PentecostalDays,
        AR: 'لأنكَ قُمتَ وخَلصْتَنا',
        CA: 'جي آك تونك أكسوتي إمّون',
        FR: 'car Tu es ressuscité et nous as sauvés',
        EN: 'for You\'ve raised and saved us',
        COP: 'ϫⲉ ⲁⲕⲧⲱⲛⲕ ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.CrossFeast,
        AR: 'لأنكَ صُلبتَ وخَلصْتَنا',
        CA: 'جي آك آشك أكسوتي إمّون',
        FR: 'car Tu as été crucifié et nous as sauvés',
        EN: 'for You\'ve been crucified and saved us',
        COP: 'ϫⲉ ⲁⲕ̀\' ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
];
const closingHymnAll = [
    //This is the variable part of 'Amin Alleluia Zoksa Patri...' closing hymn
    {
        Season: 'River',
        AR: 'بارك مياه الأنهار',
        CA: 'اسمو إنيمؤو إمبيف يارو',
        FR: 'bénis les eaux des fleuves',
        EN: '',
        COP: 'Ⲥ̀ⲙⲟⲩ ⲉ̀ⲛⲓⲙⲱⲟⲩ ⲙ̀ⲫⲓⲁⲣⲟⲩ'
    },
    {
        Season: 'Plants',
        AR: 'بارك الزروع والعشب',
        CA: 'اسمو إينيسيتي نيم نيسيم',
        FR: 'Bénis les semences et les fourrages',
        EN: '',
        COP: 'Ⲥ̀ⲙⲟⲩ ⲉ̀ⲛⲓⲥⲓϯ ⲛⲉⲙ ⲛⲓⲥⲓⲙ'
    },
    {
        Season: 'Harvest',
        AR: 'بارك أهوية السماء',
        CA: 'اسمو إي إنيائير إنتي إتفي',
        FR: 'Bénis les pluies',
        EN: '',
        COP: 'Ⲥ̀ⲙⲟⲩ ⲉ̀ⲛⲓⲁⲏⲣ ⲛ̀ⲧⲉ ⲧ̀ⲫⲉ'
    },
    {
        Season: 'Resurrection',
        AR: 'ملك المجد قام من بين الأموات',
        CA: 'إبؤورو إنتي إبؤ أو آفطونف إيفول خين نيئثموؤت',
        FR: 'le roi de gloire est résuscité le troisième jour',
        EN: '',
        COP: 'Ⲁϥⲧⲱⲛϥ ⲉ̀ⲃⲟⲗ ϧⲉⲛ ⲛⲏⲉⲑⲙⲱⲟⲩⲧ ϧⲉⲛ ⲡⲓⲉ̀ϩⲟⲟⲩ'
    }
];
var giaki = {}, closingHymn = {};
let allSeasonalPrayers = [[giaki, giakiAll]];
function setSeasonalTextForAll(season) {
    allSeasonalPrayers
        .forEach(seasonal => {
        Object.assign(seasonal[0], setSeasonalText(seasonal[1], season));
    });
    setClosingHymn();
}
;
function setSeasonalText(arrayAll, season) {
    if (!arrayAll)
        return;
    let found;
    //If we are a Sunday, giAki will be ge aktonk as during the Pentecostal Days
    if (todayDate.getDay() === 0)
        return arrayAll.find(resp => resp.Season === Seasons.PentecostalDays);
    found = arrayAll.find(resp => resp.Season === season);
    if (!found
        && (copticReadingsDate === copticFeasts.PalmSunday && todayDate.getHours() > 15)
        || HolyWeek.indexOf(copticReadingsDate) > -1)
        found = arrayAll.find(resp => resp.Season === Seasons.CrossFeast);
    if (!found)
        found = arrayAll.find(resp => resp.Season === Seasons.NoSeason);
    if (found)
        return found;
}
function setClosingHymn(day, month) {
    let index;
    if (checkIf29thOfCopticMonth || Season === Seasons.PentecostalDays)
        index = closingHymnAll.indexOf(closingHymnAll.find(hymn => hymn.Season === 'Resurrection'));
    else
        index = getAgricultureSeason(day, month);
    Object.assign(closingHymn, closingHymnAll[index]);
}
;
function getAgricultureSeason(day, month) {
    if (!day)
        day = Number(copticDay) - 1;
    if (!month)
        month = Number(copticMonth);
    let daysNumber = day + ((month - 1) * 30);
    console.log(daysNumber);
    if (daysNumber < 38 || daysNumber >= 282) {
        console.log('we are between 12/10 and 09/02');
        return 0; //River litany
    }
    else if (daysNumber >= 38 && daysNumber < 129) {
        console.log('we are between 10/02 and 10/05');
        return 1; //Plants litany
    }
    else if (daysNumber >= 129) {
        console.log('we are between 11/05 and 11/10');
        return 2; //Harvest litany
    }
}
function checkIf29thOfCopticMonth() {
    let day = Number(copticDay), month = Number(copticMonth);
    if (day !== 29 || (month > 3 && month < 8))
        return false;
    else
        return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZVNlYXNvbnNQcmF5ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbW9kdWxlcy9EZWNsYXJlU2Vhc29uc1ByYXllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsTUFBTSxRQUFRLEdBQXNCO0lBQ2hDO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHVCQUF1QjtRQUMzQixFQUFFLEVBQUUsa0NBQWtDO1FBQ3RDLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUsZ0NBQWdDO1FBQ3BDLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBQ3ZCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUscUNBQXFDO1FBQ3pDLEVBQUUsRUFBRSx3Q0FBd0M7UUFDNUMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBRUksTUFBTSxFQUFFLE9BQU8sQ0FBQyxlQUFlO1FBQy9CLEVBQUUsRUFBRSx3QkFBd0I7UUFDNUIsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUsd0NBQXdDO1FBQzVDLEVBQUUsRUFBRSxpQ0FBaUM7UUFDckMsR0FBRyxFQUFFLHVCQUF1QjtLQUMvQjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVO1FBQzFCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHdCQUF3QjtRQUM1QixFQUFFLEVBQUUsMENBQTBDO1FBQzlDLEVBQUUs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