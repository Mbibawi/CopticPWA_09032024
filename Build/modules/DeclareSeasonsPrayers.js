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
        COP: 'ϫⲉ ⲁⲕ̀\' ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
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
        AR: '',
        CA: '',
        FR: '',
        EN: '',
        COP: ''
    },
    {
        Season: 'Plants',
        AR: '',
        CA: '',
        FR: '',
        EN: '',
        COP: ''
    },
    {
        Season: 'Harvest',
        AR: '',
        CA: '',
        FR: '',
        EN: '',
        COP: ''
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
    let found;
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
    if (!day)
        day = Number(copticDay) - 1;
    if (!month)
        month = Number(copticMonth);
    let daysNumber = day + ((month - 1) * 30);
    console.log(daysNumber);
    Object.assign(closingHymn, getHymn(daysNumber));
    function getHymn(daysNumber) {
        console.log(daysNumber);
        if (daysNumber < 38 || daysNumber >= 282) {
            console.log('we are between 12/10 and 09/02');
            return closingHymnAll[0]; //River litany
        }
        else if (daysNumber >= 38 && daysNumber < 129) {
            console.log('we are between 10/02 and 10/05');
            return closingHymnAll[1]; //Plants litany
        }
        else if (daysNumber >= 129) {
            console.log('we are between 11/05 and 11/10');
            return closingHymn[2]; //Harvest litany
        }
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZVNlYXNvbnNQcmF5ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbW9kdWxlcy9EZWNsYXJlU2Vhc29uc1ByYXllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsTUFBTSxRQUFRLEdBQXNCO0lBQ2hDO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHVCQUF1QjtRQUMzQixFQUFFLEVBQUUsa0NBQWtDO1FBQ3RDLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUsZ0NBQWdDO1FBQ3BDLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBQ3ZCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUscUNBQXFDO1FBQ3pDLEVBQUUsRUFBRSx3Q0FBd0M7UUFDNUMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBRUksTUFBTSxFQUFFLE9BQU8sQ0FBQyxlQUFlO1FBQy9CLEVBQUUsRUFBRSx3QkFBd0I7UUFDNUIsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUsd0NBQXdDO1FBQzVDLEVBQUUsRUFBRSxpQ0FBaUM7UUFDckMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVO1FBQzFCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHdCQUF3QjtRQUM1QixFQUFFLEVBQUUsMENBQTBDO1FBQzlDLEVBQUUs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