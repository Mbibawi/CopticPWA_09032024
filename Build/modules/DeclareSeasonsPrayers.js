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
let giaki = { Season: '', AR: '', FR: '', CA: '', COP: '', EN: '' }, closingHymn = { Season: '', AR: '', FR: '', CA: '', COP: '', EN: '' };
let allSeasonalPrayers = [[giaki, giakiAll], [closingHymn, closingHymnAll]];
setSeasonalTextForAll();
function setSeasonalTextForAll() {
    if (!Season)
        return console.log('The Season was not set');
    allSeasonalPrayers
        .forEach((seasonal) => setSeasonalText(seasonal[1], seasonal[0]));
}
function setSeasonalText(arrayAll, seasonal) {
    let found;
    let prayer = arrayAll.filter(resp => resp.Season == Season);
    if (prayer.length === 1)
        found = prayer[0];
    else if ((copticReadingsDate == copticFeasts.PalmSunday && todayDate.getHours() > 15)
        || HolyWeek.indexOf(copticReadingsDate) > -1)
        found = arrayAll.filter(resp => resp.Season == Seasons.CrossFeast)[0];
    else if (prayer.length === 0)
        found = arrayAll.filter(resp => resp.Season === Seasons.NoSeason)[0];
    if (found)
        for (let prop in found)
            seasonal[prop] = found[prop];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZVNlYXNvbnNQcmF5ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbW9kdWxlcy9EZWNsYXJlU2Vhc29uc1ByYXllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsTUFBTSxRQUFRLEdBQXNCO0lBQ2hDO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSxNQUFNO1FBQ1YsRUFBRSxFQUFFLE9BQU87UUFDWCxFQUFFLEVBQUUsVUFBVTtRQUNkLEVBQUUsRUFBRSxXQUFXO1FBQ2YsR0FBRyxFQUFFLE9BQU87S0FDZjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSxPQUFPO1FBQ1gsRUFBRSxFQUFFLFNBQVM7UUFDYixFQUFFLEVBQUUsT0FBTztRQUNYLEVBQUUsRUFBRSxXQUFXO1FBQ2YsR0FBRyxFQUFFLE9BQU87S0FDZjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBQ3ZCLEVBQUUsRUFBRSxXQUFXO1FBQ2YsRUFBRSxFQUFFLFNBQVM7UUFDYixFQUFFLEVBQUUsWUFBWTtRQUNoQixFQUFFLEVBQUUsb0JBQW9CO1FBQ3hCLEdBQUcsRUFBRSxPQUFPO0tBQ2Y7SUFDRDtRQUNJLE1BQU0sRUFBRSxPQUFPLENBQUMsZUFBZTtRQUMvQixFQUFFLEVBQUUsT0FBTztRQUNYLEVBQUUsRUFBRSxTQUFTO1FBQ2IsRUFBRSxFQUFFLGVBQWU7UUFDbkIsRUFBRSxFQUFFLGFBQWE7UUFDakIsR0FBRyxFQUFFLE9BQU87S0FDZjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVO1FBQzFCLEVBQUUsRUFBRSxTQUFTO1FBQ2IsRUFBRSxFQUFFLFFBQVE7UUFDWixFQUFFLEVBQUUsZ0JBQWdCO1FBQ3BCLEVBQUUsRUFBRSxtQkFBbUI7UUFDdkIsR0FBRyxFQUFFLE9BQU87S0FDZjtDQUNKLENBQUM7QUFDRixNQUFNLGNB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