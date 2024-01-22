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
        AR: 'لأنَّكَ أتيْتَ وخَلصْتَنا',
        CA: 'جي آك إي أكسوتي إمّون',
        FR: 'car Tu es venu et nous as sauvés',
        EN: 'for You\'ve come and saved us',
        COP: 'ϫⲉ ⲁⲕ̀\' ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.Nativity,
        AR: 'لأنَّكَ ولِدتَ وخَلصْتَنا',
        CA: 'جي آك ماسف أكسوتي إمّون',
        FR: 'car Tu es né et nous as sauvés',
        EN: 'for You\'ve born and saved us',
        COP: 'ϫⲉ ⲁⲩⲙⲁⲥⲕ ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.Baptism,
        AR: 'لأنَّكَ اعتمدت وخَلصْتَنا',
        CA: 'جي آك أومس أكسوتي إمّون',
        FR: 'car Tu es baptisé et nous as sauvés',
        EN: 'for You\'ve been baptized and saved us',
        COP: 'ϫⲉ ⲁⲕϭⲓⲱⲙⲥ ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
 
        Season: Seasons.PentecostalDays,
        AR: 'لأنَّكَ قُمتَ وخَلصْتَنا',
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
const closingHymnAll: seasonalPrayers[] = [
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


var giaki ={} as seasonalPrayers,
closingHymn ={} as seasonalPrayers;

let allSeasonalPrayers:[seasonalPrayers, seasonalPrayers[]][] = [[giaki, giakiAll]];

async function setSeasonalTextForAll(season:string){
allSeasonalPrayers
    .forEach(seasonal => {
       Object.assign(seasonal[0], setSeasonalText(seasonal[1], season));
    });
    setClosingHymn();
    
};

function setSeasonalText(arrayAll: seasonalPrayers[], season: string): seasonalPrayers {
    if (!arrayAll) return;
    let found: seasonalPrayers;
    //If we are a Sunday, giAki will be ge aktonk as during the Pentecostal Days
    if(todayDate.getDay() ===0) return arrayAll.find(resp => resp.Season === Seasons.PentecostalDays); 

    //If we it is the Circumcision Feast, giAki will be 'ge ak masf'
    if(copticDate ===copticFeasts.Circumcision) return arrayAll.find(resp => resp.Season === Seasons.Nativity);  
        
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
    let index: number;
    if (checkIf29thOfCopticMonth || Season === Seasons.PentecostalDays) index = closingHymnAll.indexOf(closingHymnAll.find(hymn => hymn.Season === 'Resurrection'));
    
    else index = getAgricultureSeason(day, month);

    Object.assign(closingHymn, closingHymnAll[index]);

};

function getAgricultureSeason(day?:number, month?:number):number {
    if (!day) day = Number(copticDay) - 1;
    if (!month) month = Number(copticMonth);
    let daysNumber: number = day + ((month - 1) * 30);
    console.log(daysNumber);
        if (daysNumber < 38 || daysNumber >= 282) {
            console.log('we are between 12/10 and 09/02');
            return 0; //River litany
        } else if (daysNumber >= 38 && daysNumber < 129) {
            console.log('we are between 10/02 and 10/05');
            return 1; //Plants litany
        } else if (daysNumber >= 129) {
            console.log('we are between 11/05 and 11/10');
            return 2;//Harvest litany
        }
}
    
function checkIf29thOfCopticMonth():boolean {
    if (Number(copticDay) !== 29
        || (Number(copticMonth) > 3 && Number(copticMonth) < 8)
    ) return false;
    else return true
}


