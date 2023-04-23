const giakiAll = [
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
    }
];
let giaki = setSeasonalText(giakiAll);
let closingHym = setSeasonalText(closingHymnAll);
function setSeasonalText(arrayAll) {
    let prayer = arrayAll.filter(resp => resp.Season == Season);
    if (prayer) {
        return prayer[0];
    }
    else if ((copticReadingsDate == copticFeasts.PalmSunday && todayDate.getHours() > 15)
        || HolyWeek.indexOf(copticReadingsDate) > -1) {
        return arrayAll.filter(resp => resp.Season == Seasons.CrossFeast)[0];
    }
    else if (!prayer) {
        return arrayAll.filter(resp => resp.Season == Seasons.NoSeason)[0];
    }
}
;
