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


var giaki ={} as seasonalPrayers,
closingHymn ={} as seasonalPrayers;

let allSeasonalPrayers:[seasonalPrayers, seasonalPrayers[]][] = [[giaki, giakiAll]];

function setSeasonalTextForAll(season:string){
allSeasonalPrayers
    .forEach(seasonal => {
        Object.assign(seasonal[0], setSeasonalText(seasonal[1], season));
        console.log('giaki = ', seasonal[0])
    });
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

function setClosingHymn(coptDay:number, coptMonth:number) {
    let month = Number(copticMonth);
    let daysFromYearBegining: number;
    let daysNumber: number = getDaysNumber();
    function getDaysNumber(){
    if (coptMonth > 1) return ((coptMonth - 1) * 30) + Number(coptDay-1);
        if (month === 1) return Number(coptDay - 1);
    }
    console.log('daysNumber = ', daysNumber);

    if (daysNumber >= 280 && daysNumber <38) {
        console.log('we are between 12/10 && 09/02'); return closingHymnAll[2];
    } else if (daysNumber >= 38 && daysNumber <129) {
        console.log('we are between 10/02 && 10/05'); return closingHymnAll[1];
    } else if (daysNumber >= 129 && daysNumber <280) {
        console.log('we are between 11/05 && 11/10'); return closingHymn[0];
    };
    
    


    
    console.log(daysNumber);
}

