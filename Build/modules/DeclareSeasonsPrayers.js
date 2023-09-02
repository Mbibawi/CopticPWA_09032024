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
        Season: Seasons.NoSeason,
        AR: '',
        CA: '',
        FR: '',
        EN: '',
        COP: ''
    },
    {
        Season: Seasons.PentecostalDays,
        AR: '',
        CA: '',
        FR: '',
        EN: '',
        COP: ''
    },
    {
        Season: Seasons.PentecostalDays,
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
        console.log('giaki = ', seasonal[0]);
    });
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
function setClosingHymn(coptDay, coptMonth) {
    let month = Number(copticMonth);
    let daysFromYearBegining;
    let daysNumber = getDaysNumber();
    function getDaysNumber() {
        if (coptMonth > 1)
            return ((coptMonth - 1) * 30) + Number(coptDay - 1);
        if (month === 1)
            return Number(coptDay - 1);
    }
    console.log('daysNumber = ', daysNumber);
    if (daysNumber >= 280 && daysNumber < 38) {
        console.log('we are between 12/10 && 09/02');
        return closingHymnAll[2];
    }
    else if (daysNumber >= 38 && daysNumber < 129) {
        console.log('we are between 10/02 && 10/05');
        return closingHymnAll[1];
    }
    else if (daysNumber >= 129 && daysNumber < 280) {
        console.log('we are between 11/05 && 11/10');
        return closingHymn[0];
    }
    ;
    console.log(daysNumber);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZVNlYXNvbnNQcmF5ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbW9kdWxlcy9EZWNsYXJlU2Vhc29uc1ByYXllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsTUFBTSxRQUFRLEdBQXNCO0lBQ2hDO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHVCQUF1QjtRQUMzQixFQUFFLEVBQUUsa0NBQWtDO1FBQ3RDLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUsZ0NBQWdDO1FBQ3BDLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBQ3ZCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUscUNBQXFDO1FBQ3pDLEVBQUUsRUFBRSx3Q0FBd0M7UUFDNUMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBRUksTUFBTSxFQUFFLE9BQU8sQ0FBQyxlQUFlO1FBQy9CLEVBQUUsRUFBRSx3QkFBd0I7UUFDNUIsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUsd0NBQXdDO1FBQzVDLEVBQUUsRUFBRSxpQ0FBaUM7UUFDckMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVO1FBQzFCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHdCQUF3QjtRQUM1QixFQUFFLEVBQUUsMENBQTBDO1FBQzlDLEVBQUUs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