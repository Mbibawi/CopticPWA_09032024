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
        AR: 'أتيت',
        CA: 'آك إي',
        FR: 'es venus',
        EN: '\'ve come',
        COP: 'ⲁⲕ̀\''
    },
    {
        Season: Seasons.Nativity,
        AR: 'ولِدت',
        CA: 'آك ماسف',
        FR: 'es né',
        EN: '\'ve born',
        COP: 'ⲁⲕ̀\''
    },
    {
        Season: Seasons.Baptism,
        AR: 'اعتَمَدُت',
        CA: 'آك أومس',
        FR: 'es baptisé',
        EN: '\'ve been baptized',
        COP: 'ⲁⲕ̀\''
    },
    {
        Season: Seasons.PentecostalDays,
        AR: 'قُمتَ',
        CA: 'آك تونك',
        FR: 'es ressuscité',
        EN: '\'ve raised',
        COP: 'ⲁⲕ̀\''
    },
    {
        Season: Seasons.CrossFeast,
        AR: 'صُلِبتَ',
        CA: 'آك آشك',
        FR: 'a été crucifié',
        EN: '\'ve been crossed',
        COP: 'ⲁⲕ̀\''
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
    }
];


let giaki: seasonalPrayers = {Season:'', AR: '', FR:'', CA:'', COP:'', EN:''},
closingHymn: seasonalPrayers = {Season:'', AR: '', FR:'', CA:'', COP:'', EN:''};

let allSeasonalPrayers = [[giaki, giakiAll], [closingHymn, closingHymnAll]];

setSeasonalTextForAll();
function setSeasonalTextForAll() {
    allSeasonalPrayers.forEach((seasonal) => setSeasonalText(seasonal[1] as seasonalPrayers[], seasonal[0] as seasonalPrayers));
}
       
function setSeasonalText(arrayAll: seasonalPrayers[], seasonal: seasonalPrayers) {
    let found:seasonalPrayers;
        let prayer = arrayAll.filter(resp => resp.Season == Season);
        if (prayer.length ===1) found = prayer[0];
        
        else if ((copticReadingsDate == copticFeasts.PalmSunday && todayDate.getHours() > 15)
            || HolyWeek.indexOf(copticReadingsDate) > -1) 
            found = arrayAll.filter(resp => resp.Season == Seasons.CrossFeast)[0];
        
        else if (prayer.length === 0) 
            found = arrayAll.filter(resp => resp.Season === Seasons.NoSeason)[0];
    
    if (found) for (let prop in found) seasonal[prop] = found[prop];
}



