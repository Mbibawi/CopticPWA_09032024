type seasonalPrayers = {
    Season: string,
    AR: string,
    CA?: string,
    FR?: string,
    EN?: string,
    COP?: string
};
const giakiAll: seasonalPrayers[] = [
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
const closingHymnAll: seasonalPrayers[] = [
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


var giaki ={} as seasonalPrayers,
closingHymn ={} as seasonalPrayers;

let allSeasonalPrayers:[seasonalPrayers, seasonalPrayers[]][] = [[giaki, giakiAll]];

function setSeasonalTextForAll(season:string){
allSeasonalPrayers
    .forEach(seasonal => {
       Object.assign(seasonal[0], setSeasonalText(seasonal[1], season));
    });
setClosingHymn();
};

function setSeasonalText(arrayAll: seasonalPrayers[], season:string):seasonalPrayers {
    let found:seasonalPrayers;
        
    found = arrayAll.find(resp => resp.Season === season);

    if (!found
        && (copticReadingsDate === copticFeasts.PalmSunday && todayDate.getHours() > 15)
        || HolyWeek.indexOf(copticReadingsDate) > -1) 
        
        found = arrayAll.find(resp => resp.Season === Seasons.CrossFeast);
        
    if (!found) 
    found = arrayAll.find(resp => resp.Season === Seasons.NoSeason);
    if (found) return found;
}

function setClosingHymn(day?: number, month?: number) {
    if (!day) day = Number(copticDay) - 1;
    if (!month) month = Number(copticMonth);
    let daysNumber: number = day + ((month - 1) * 30);
    console.log(daysNumber);
    Object.assign(closingHymn, getHymn(daysNumber))
    
    function getHymn(daysNumber: number) {
        console.log(daysNumber);
        if (daysNumber < 38 || daysNumber >= 282) {
            console.log('we are between 12/10 and 09/02');
            return closingHymnAll[0]; //River litany
        } else if (daysNumber >= 38 && daysNumber < 129) {
            console.log('we are between 10/02 and 10/05');
            return closingHymnAll[1]; //Plants litany
        } else if (daysNumber >= 129) {
            console.log('we are between 11/05 and 11/10');
            return closingHymn[2]; //Harvest litany
        }
    }
};
    


