const giakiAll = [
    {
        Season: 'Normal',
        AR: 'أتيت',
        CA: 'آك إي',
        FR: 'es venus',
        EN: '\'ve come',
        COP: 'ⲁⲕ̀\''
    },
    {
        Season: 'Resurrection',
        AR: 'قمت',
        CA: 'آك تونك',
        FR: 'es ressuscité',
        EN: '\'ve raised',
        COP: 'ⲁⲕ̀\''
    }
];
const closingHymnAll = [
    //This is the variable part of 'Amin Alleluia Zoksa Patri...' closing hymn
    {
        Season: 'Normal',
        AR: '',
        CA: '',
        FR: '',
        EN: '',
        COP: ''
    },
    {
        Season: 'Resurrection',
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
    if (Season == Seasons.PentecostalDays) {
        return arrayAll[1];
    }
    else {
        return arrayAll[0];
    }
}
;
