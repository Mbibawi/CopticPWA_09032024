//CONSTANTS
const version = 'v4.1 (added inline mapping to complier)';
const calendarDay = 24 * 60 * 60 * 1000; //this is a day in milliseconds
const containerDiv = document.getElementById('containerDiv');
const leftSideBar = document.getElementById('leftSideBar');
const rightSideBar = document.getElementById('rightSideBar');
const contentDiv = document.getElementById('content');
const sideBarBtn = document.getElementById('opensidebar');
const toggleDevBtn = document.getElementById('toggleDev');
const inlineBtnsDiv = document.getElementById('inlineBtnsContainer');
const ResurrectionDates = ['2022-04-24', '2023-04-16', '2024-05-05', '2025-04-29', '2026-04-12', '2027-05-02', '2028-04-23', '2029-04-8', '2030-04-28']; // these are  the dates of the Ressurection feast caclulated from the end of the Jewish Pessah Feast as got from Google
const Prefix = {
    psalmResponse: 'PR_',
    gospelResponse: 'GR_',
    praxisResponse: 'PRR_',
    massCommon: 'MC_',
    commonPrayer: 'PC_',
    incenseDawn: 'ID_',
    incenseVespers: 'IV_',
    massStBasil: 'Basil_',
    massStCyril: 'Cyril_',
    massStGregory: 'Gregory_',
    massStJohn: 'John_',
    fractionPrayer: 'Fraction_',
    commonDoxologies: 'DC_',
    commonIncense: 'IC_',
    communion: 'Communion_',
    propheciesDawn: "RPD_",
    stPaul: "RSP_",
    katholikon: "RK_",
    praxis: "RP_",
    gospelVespers: "RGIV_",
    gospelDawn: "RGID_",
    gospelMass: "RGM_",
    gospelNight: "RGN_",
    synaxarium: "RS_",
    cymbalVerses: "CV_",
    bookOfHours: "BOH_", //Stands for Book Of Prayers
};
const btnClass = 'sideBarBtn';
const inlineBtnClass = 'inlineBtn';
const ReadingsIntrosAndEnds = {
    gospelIntro: {
        AR: 'قفوا بخوف أمام الله وانصتوا لنسمع الإنجيل المقدس، فصل من بشارة الإنجيل لمعلمنا مار () البشير، والتلميذ الطاهر، بركاته على جميعنا',
        FR: '',
    },
    gospelEnd: {
        AR: 'والمجد لله دائماً',
        FR: '',
    },
    stPaulIntro: {
        AR: 'البولس فصل من رسالة معلمنا بولس الرسول  (الأولى/الثانية) إلى ()، بركته على جميعنا آمين',
        FR: 'Lecture de l’Epître de Saint Paul à () que sa bénédiction soit sur nous tous, Amen!',
        EN: '',
    },
    stPaulEnd: {
        AR: 'نعمة الله الآب فلتكن معكم يا آبائي واختوي آمين.',
        FR: 'Que la grâce de Dieu soit avec vous tous, mes père et mes frères, Amen!',
        EN: '',
    },
    katholikonIntro: {
        AR: 'الكاثوليكون، فصل من رسالة القديس (الأولى/الثانية/الثالثة)  بركته على جميعنا آمين',
        FR: 'Katholikon, (1ère/2ème/3ème) épître à l’Église Universelle de notre père (St.), que sa bénédiction repose sur nous tous. Amen!',
        EN: '',
    },
    katholikonEnd: {
        AR: 'لا تحبو العالم ولا الأشياء التي في العالم لأن العالم يمضي وشهوته معه أما من يصنع مشيئة الله فيثبت إلى الأبد',
        FR: 'N’aimez pas le monde et ce qui est dans le monde, le monde passe, lui et sa convoitise, mais celui qui fait la volonté de Dieu demeure à jamais. Amen !',
        EN: '',
    },
    psalmIntro: {
        AR: 'من مزامير تراتيل أبيناداوود النبي والملك، بركاته على جميعنا آمين.',
        FR: 'Psaume de notre père David, le prophète et le roi, que sa bénédiction soit sur nous tous, Amen!',
        EN: ''
    },
    psalmEnd: {
        AR: 'هلليلويا',
        FR: '',
    },
    praxisIntro: {
        AR: 'الإبركسيس فصل من أعمال آبائنا الرسل الأطهار، الحوارين، المشمولين بنعمة الروح القدس، بركتهم المقدسة فلتكن معكم يا آبائي واخوتي آمين.',
        FR: 'Praxis, Actes de nos pères les apôtres, que leurs saintes bénédictions reposent sur nous. Amen!',
        EN: '',
    },
    praxisEnd: {
        AR: 'لم تزل كلمة الرب تنمو وتعتز وتكثر في هذا البيعة وكل بيعة يا آبائي وإخوتي آمين.',
        FR: 'La parole du Seigneur croît, se multiplie et s’enracine dans la sainte Église de Dieu. Amen!',
        EN: '',
    },
    synaxariumIntro: {
        AR: 'اليوم () من شهر () المبارك، أحسن الله استقباله وأعاده علينا وأنتم مغفوري الخطايا والآثام من قبل مراحم الرب يا آبائي واختوي آمين.',
        FR: '',
    },
};
const ReadingsArrays = {
    PraxisArray: [],
    KatholikonArray: [],
    StPaulArray: [],
    SynaxariumArray: [],
    GospelMassArray: [],
    GospelVespersArray: [],
    GospelDawnArray: [],
    GospelNightArray: [],
    PropheciesDawnArray: [],
};
const Seasons = {
    //Seasons are periods of more than 1 day, for which we have specific prayers (e.g.: cymbal verses, doxologies, praxis response, etc.)
    StMaryFast: 'StMFast',
    Kiahk: 'Kiahk',
    NativityFast: 'NF',
    Nativity: 'Nat',
    Baptism: 'Ba',
    GreatLent: 'GL',
    HolyWeek: 'HW',
    PentecostalDays: 'Pntl',
    JonahFast: 'Jonah',
    ApostlesFast: 'Apost',
    Nayrouz: 'Nay',
    CrossFeast: 'Cross',
    NoSeason: 'NoSpecificSeason',
};
const copticFeasts = {
    AnyDay: 'AnyDay',
    Nayrouz: '0101',
    Cross: '1701',
    BeguiningNativityLent: '1603',
    NativityParamoun: '2804',
    Nativity: '2904',
    Circumcision: '0605',
    BaptismParamoun: '1005',
    Baptism: '1105',
    CanaWedding: '1305',
    EntryToTemple: '0806',
    EntryToEgypt: '2409',
    Annonciation: '2907',
    EndOfGreatLentFriday: Seasons.GreatLent + ' 49',
    LazarusSaturday: Seasons.GreatLent + '50',
    PalmSunday: Seasons.GreatLent + '8thSunday',
    HolyMonday: Seasons.GreatLent + '52',
    HolyTuseday: Seasons.GreatLent + '53',
    HolyWednsday: Seasons.GreatLent + '54',
    HolyThursday: Seasons.GreatLent + '55',
    HolyFriday: Seasons.GreatLent + '56',
    HolySaturday: Seasons.GreatLent + '57',
    Resurrection: Seasons.GreatLent + '9thSunday',
    ThomasSunday: Seasons.PentecostalDays + "1stSunday",
    Ascension: Seasons.PentecostalDays + '7thSunday',
    Pentecoste: Seasons.PentecostalDays + '39',
    Apostles: '0511',
    StMaryFastVespers: '3010',
    StMaryFast: '0112',
    Epiphany: '1312',
    StMaryFeast: '1612',
    theTwentyNinethOfCopticMonth: '2900',
};
const copticFasts = [
    Seasons.GreatLent,
    Seasons.NativityFast,
    Seasons.Kiahk,
    Seasons.ApostlesFast,
    Seasons.StMaryFast,
    Seasons.JonahFast,
];
const saintsFeasts = {
    StJohnBaptist: '0201',
    FourCelestialBeings: '0803',
    TwentyFourPriests: '2403',
    StMaykel: '1203',
    StGabriel: '1310',
    StRaphael: '0313',
    StSourial: '2705',
    StMarc: '3008',
    StSteven: '0105',
    StSergeBacchus: '',
    StGeorge: '2708',
    StMina: '1503',
    StTheodor: '',
    StPhilopatir: '2503',
    StCome: '',
    OneHudredTwentyFourThousands: '',
    AbakirAndJohn: '',
    StDamienne: '',
    StBarbara: '',
    StMarina: '',
    StAnton: '2205',
    StBishoy: '',
    StShenoute: '',
    StTeji: '',
    StPersoma: '',
    StCyrilVI: '3004',
    StBishoyKamel: '1207',
    StMikaelMetropolis: '',
    StJustAnton: '' //St Just of the St. Anton
};
const foreingLanguage = 'FR';
const allLanguages = ['AR', foreingLanguage, 'COP', 'CA', 'CF', 'EN']; //AR = Arabic, FR = French, COP = Coptic, CA = Coptic in Arabic characters, CF = Coptic in French characters, EN = English
const userLanguages = ['AR', foreingLanguage, 'COP'];
//if (localStorage.userLanguages) { console.log('there is user Lanugages', localStorage.userLanguages) };
//if (localStorage.showActors) { console.log('there is showActors', localStorage.showActors) };
if (localStorage.userLanguages === undefined) {
    localStorage.userLanguages = JSON.stringify(userLanguages);
}
; //We check that there isn't already a setting stored in the localStorage
const prayersLanguages = ['COP', foreingLanguage, 'CA', 'AR'];
const readingsLanguages = ['AR', foreingLanguage, 'EN'];
const displayModes = ['Normal', 'Presentation', 'Priest'];
const CommonPrayersArray = []; //an array in which we will group all the common prayers of all the liturgies. It is a subset o PrayersArray
const MassCommonPrayersArray = []; //an array in which we will save the commons prayers specific to the mass (like the Assembly, Espasmos, etc.)
const MassStBasilPrayersArray = [], MassStGregoryPrayersArray = [], MassStCyrilPrayersArray = [], MassStJohnPrayersArray = [], FractionsPrayersArray = [], DoxologiesPrayersArray = [], IncensePrayersArray = [], CommunionPrayersArray = [], PsalmAndGospelPrayersArray = [], CymbalVersesPrayersArray = [], PraxisResponsesPrayersArray = [], bookOfHoursPrayersArray = [];
const allSubPrayersArrays = [
    CommonPrayersArray,
    MassCommonPrayersArray,
    MassStBasilPrayersArray,
    MassStGregoryPrayersArray,
    MassStCyrilPrayersArray,
    MassStJohnPrayersArray,
    FractionsPrayersArray,
    DoxologiesPrayersArray,
    IncensePrayersArray,
    CommunionPrayersArray,
    PsalmAndGospelPrayersArray,
    CymbalVersesPrayersArray,
    PraxisResponsesPrayersArray,
    bookOfHoursPrayersArray
];
const lordGreatFeasts = [
    copticFeasts.Annonciation,
    copticFeasts.Nativity,
    copticFeasts.Baptism,
    copticFeasts.PalmSunday,
    copticFeasts.Resurrection,
    copticFeasts.Ascension,
    copticFeasts.Pentecoste
], lordMinorFeasts = [
    copticFeasts.Epiphany,
    copticFeasts.Circumcision,
    copticFeasts.EntryToEgypt,
    copticFeasts.EntryToTemple
], lordFeasts = [
    ...lordGreatFeasts,
    ...lordMinorFeasts
], HolyWeek = [
    copticFeasts.HolyMonday,
    copticFeasts.HolyTuseday,
    copticFeasts.HolyWednsday,
    copticFeasts.HolyThursday,
    copticFeasts.HolyFriday,
], textAmplified = new Map();
//VARS
let PrayersArray = [];
let lastClickedButton;
let selectedDate, //This is the date that the user might have manually selected
copticDate, //The Coptic date is stored in a string not in a number like the gregorian date, this is to avoid complex calculations
copticMonth, //same comment as above
copticDay, //same comment as above
copticReadingsDate, //This is the date of the day's readings (gospel, Katholikon, praxis, etc.). It does not neceissarly correspond to the copticDate
Season, //This is a value telling whether we are during a special period of the year like the Great Lent or the 50 Pentecostal days, etc.
weekDay; //This is today's day of the week (Sunday, Monday, etc.) expressed in number starting from 0
var todayDate;
let isFast;
let actors = ['Priest', 'Diacon', 'Assembly', 'Comment', 'CommentText']; //These are the names of the classes given to each row accordin to which we give a specific background color to the div element in order to show who tells the prayer
let showActors = new Map();
actors.map(actor => showActors.set(actor, true));
showActors.set(actors[3], false); //this is in order to initiate the app without the comments displayed. The user will activate it from the settings if he wants
showActors.set(actors[4], false); //same comment as above concerning the 'CommentText'
if (localStorage.showActors === undefined) {
    localStorage.showActors = JSON.stringify(Array.from(showActors));
}
;
allLanguages.map(lang => textAmplified.set(lang, false));
if (localStorage.textAmplified === undefined) {
    localStorage.textAmplified = JSON.stringify(Array.from(textAmplified));
}
;
let displayMode = localStorage[0];
if (localStorage.displayMode == undefined) {
    localStorage.displayMode = displayMode;
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21vZHVsZXMvRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEyQkEsV0FBVztBQUNYLE1BQU0sT0FBTyxHQUFXLHlDQUF5QyxDQUFDO0FBQ2xFLE1BQU0sV0FBVyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLCtCQUErQjtBQUNoRixNQUFNLFlBQVksR0FBbUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQW1CLENBQUM7QUFDL0YsTUFBTSxXQUFXLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEUsTUFBTSxZQUFZLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDMUUsTUFBTSxVQUFVLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkUsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQXNCLENBQUM7QUFDL0UsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQXNCLENBQUM7QUFDL0UsTUFBTSxhQUFhLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNsRixNQUFNLGlCQUFpQixHQUFhLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLHVIQUF1SDtBQUMxUixNQUFNLE1BQU0sR0FBRztJQUNYLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLGNBQWMsRUFBRSxLQUFLO0lBQ3JCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLFlBQVksRUFBRSxLQUFLO0lBQ25CLFdBQVcsRUFBRSxLQUFLO0lBQ2xCLGNBQWMsRUFBRSxLQUFLO0lBQ3JCLFdBQVcsRUFBRSxRQUFRO0lBQ3JCLFdBQVcsRUFBRSxRQUFRO0lBQ3JCLGFBQWEsRUFBRSxVQUFVO0lBQ3pCLFVBQVUsRUFBRSxPQUFPO0lBQ25CLGNBQWMsRUFBRSxXQUFXO0lBQzNCLGdCQUFnQixFQUFFLEtBQUs7SUFDdkIsYUFBYSxFQUFFLEtBQUs7SUFDcEIsU0FBUyxFQUFFLFlBQVk7SUFDdkIsY0FBYyxFQUFFLE1BQU07SUFDdEIsTUFBTSxFQUFFLE1BQU07SUFDZCxVQUFVLEVBQUUsS0FBSztJQUNqQixNQUFNLEVBQUUsS0FBSztJQUNiLGFBQWEsRUFBRSxPQUFPO0lBQ3RCLFVBQVUsRUFBRSxPQUFPO0lBQ25CLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLFlBQVksRUFBRSxLQUFLO0lBQ25CLFdBQVcsRUFBRSxNQUFNLEVBQUUsNEJBQTRCO0NBQ3BELENBQUM7QUFFRixNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUM7QUFDOUIsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDO0FBQ25DLE1BQU0scUJBQXFCLEdBQUc7SUFDMUIsV0FBVyxFQUFFO1FBQ1QsRUFBRSxFQUFFLGtJQUFrSTtRQUN0SSxFQUFFLEVBQUMsRUFBRTtLQUNSO0lBQ0QsU0FBUyxFQUFFO1FBQ1AsRUFBRSxFQUFFLG1CQUFtQjtRQUN2QixFQUFFLEVBQUUsRUFBRTtLQUNUO0lBQ0QsV0FBVyxFQUFFO1FBQ1QsRUFBRSxFQUFHLHdGQUF3RjtRQUM3RixFQUFFLEVBQUUscUZBQXFGO1FBQ3pGLEVBQUUsRUFBQyxFQUFFO0tBQ1I7SUFDRCxTQUFTLEVBQUU7UUFDUCxFQUFFLEVBQUcsaURBQWlEO1FBQ3RELEVBQUUsRUFBRSx5RUFBeUU7UUFDN0UsRUFBRSxFQUFDLEVBQUU7S0FDUjtJQUNELGVBQWUsRUFBRTtRQUNiLEVBQUUsRUFBRSxrRkFBa0Y7UUFDdEYsRUFBRSxFQUFFLGdJQUFnSTtRQUNwSSxFQUFFLEVBQUMsRUFBRTtLQUNSO0lBQ0QsYUFBYSxFQUFFO1FBQ1gsRUFBRSxFQUFFLDZHQUE2RztRQUNqSCxFQUFFLEVBQUUseUpBQXlKO1FBQzdKLEVBQUUsRUFBQyxFQUFFO0tBQ1I7SUFDRCxVQUFVLEVBQUU7UUFDUixFQUFFLEVBQUUsbUVBQW1FO1FBQ3ZFLEVBQUUsRUFBRSxpR0FBaUc7UUFDckcsRUFBRSxFQUFDLEVBQUU7S0FDUjtJQUNELFFBQVEsRUFBRTtRQUNOLEVBQUUsRUFBRSxVQUFVO1FBQ2QsRUFBRSxFQUFFLEVBQUU7S0FDVDtJQUNELFdBQVcsRUFBRTtRQUNULEVBQUUsRUFBRSxxSUFBcUk7UUFDekksRUFBRSxFQUFFLGlHQUFpRztRQUNyRyxFQUFFLEVBQUMsRUFBRTtLQUNSO0lBQ0QsU0FBUyxFQUFFO1FBQ1AsRUFBRSxFQUFFLGdGQUFnRjtRQUNwRixFQUFFLEVBQUUsOEZBQThGO1FBQ2xHLEVBQUUsRUFBQyxFQUFFO0tBQ1I7SUFDRCxlQUFlLEVBQUc7UUFDZCxFQUFFLEVBQUUsa0lBQWtJO1FBQ3RJLEVBQUUsRUFBRSxFQUFFO0tBQ1Q7Q0FDSixDQUFDO0FBQ0YsTUFBTSxjQUFjLEdBQUc7SUFDbkIsV0FBVyxFQUFFLEVBQUU7SUFDZixlQUFlLEVBQUUsRUFBRTtJQUNuQixXQUFXLEVBQUUsRUFBRTtJQUNmLGVBQWUsRUFBRSxFQUFFO0lBQ25CLGVBQWUsRUFBRSxFQUFFO0lBQ25CLGtCQUFrQixFQUFFLEVBQUU7SUFDdEIsZUFBZSxFQUFFLEVBQUU7SUFDbkIsZ0JBQWdCLEVBQUUsRUFBRTtJQUNwQixtQkFBbUIsRUFBRSxFQUFFO0NBQzFCLENBQUM7QUFDRixNQUFNLE9BQU8sR0FBRztJQUNaLHFJQUFxSTtJQUNySSxVQUFVLEVBQUUsU0FBUztJQUNyQixLQUFLLEVBQUUsT0FBTztJQUNkLFlBQVksRUFBRSxJQUFJO0lBQ2xCLFFBQVEsRUFBRSxLQUFLO0lBQ2YsT0FBTyxFQUFDLElBQUk7SUFDWixTQUFTLEVBQUUsSUFBSTtJQUNmLFFBQVEsRUFBRSxJQUFJO0lBQ2QsZUFBZSxFQUFFLE1BQU07SUFDdkIsU0FBUyxFQUFFLE9BQU87SUFDbEIsWUFBWSxFQUFFLE9BQU87SUFDckIsT0FBTyxFQUFFLEtBQUs7SUFDZCxVQUFVLEVBQUUsT0FBTztJQUNuQixRQUFRLEVBQUUsa0JBQWtCO0NBQy9CLENBQUM7QUFDRixNQUFNLFlBQVksR0FBRztJQUNqQixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsTUFBTTtJQUNmLEtBQUssRUFBRSxNQUFNO0lBQ2IscUJBQXFCLEVBQUUsTUFBTTtJQUM3QixnQkFBZ0IsRUFBRSxNQUFNO0lBQ3hCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLGVBQWUsRUFBRSxNQUFNO0lBQ3ZCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsV0FBVyxFQUFFLE1BQU07SUFDbkIsYUFBYSxFQUFFLE1BQU07SUFDckIsWUFBWSxFQUFFLE1BQU07SUFDcEIsWUFBWSxFQUFFLE1BQU07SUFDcEIsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLO0lBQy9DLGVBQWUsRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDekMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsV0FBVztJQUMzQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJO0lBQ3BDLFdBQVcsRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDckMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSTtJQUN0QyxZQUFZLEVBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJO0lBQ3RDLFVBQVUsRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDcEMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSTtJQUN0QyxZQUFZLEVBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxXQUFXO0lBQzdDLFlBQVksRUFBRSxPQUFPLENBQUMsZUFBZSxHQUFHLFdBQVc7SUFDbkQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxlQUFlLEdBQUcsV0FBVztJQUNoRCxVQUFVLEVBQUUsT0FBTyxDQUFDLGVBQWUsR0FBRyxJQUFJO0lBQzFDLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLGlCQUFpQixFQUFFLE1BQU07SUFDekIsVUFBVSxFQUFFLE1BQU07SUFDbEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsV0FBVyxFQUFFLE1BQU07SUFDbkIsNEJBQTRCLEVBQUUsTUFBTTtDQUN2QyxDQUFDO0FBQ0YsTUFBTSxXQUFXLEdBQUc7SUFDaEIsT0FBTyxDQUFDLFNBQVM7SUFDakIsT0FBTyxDQUFDLFlBQVk7SUFDcEIsT0FBTyxDQUFDLEtBQUs7SUFDYixPQUFPLENBQUMsWUFBWTtJQUNwQixPQUFPLENBQUMsVUFBVTtJQUNsQixPQUFPLENBQUMsU0FBUztDQUNwQixDQUFDO0FBQ0YsTUFBTSxZQUFZLEdBQUc7SUFDakIsYUFBYSxFQUFFLE1BQU07SUFDckIsbUJBQW1CLEVBQUUsTUFBTTtJQUMzQixpQkFBaUIsRUFBRSxNQUFNO0lBQ3pCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsUUFBUSxFQUFFLE1BQU07SUFDaEIsY0FBYyxFQUFFLEVBQUU7SUFDbEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsTUFBTSxFQUFFLE1BQU07SUFDZCxTQUFTLEVBQUUsRUFBRTtJQUNiLFlBQVksRUFBRSxNQUFNO0lBQ3BCLE1BQU0sRUFBRSxFQUFFO0lBQ1YsNEJBQTRCLEVBQUUsRUFBRTtJQUNoQyxhQUFhLEVBQUUsRUFBRTtJQUNqQixVQUFVLEVBQUUsRUFBRTtJQUNkLFNBQVMsRUFBRSxFQUFFO0lBQ2IsUUFBUSxFQUFFLEVBQUU7SUFDWixPQUFPLEVBQUUsTUFBTTtJQUNmLFFBQVEsRUFBRSxFQUFFO0lBQ1osVUFBVSxFQUFFLEVBQUU7SUFDZCxNQUFNLEVBQUUsRUFBRTtJQUNWLFNBQVMsRUFBRSxFQUFFO0lBQ2IsU0FBUyxFQUFFLE1BQU07SUFDakIsYUFBYSxFQUFFLE1BQU07SUFDckIsa0JBQWtCLEVBQUUsRUFBRTtJQUN0QixXQUFXLEVBQUMsRUFBRSxDQUFDLDBCQUEwQjtDQUM1QyxDQUFDO0FBQ0YsTUFBTSxlQUFlLEdBQVUsSUFBSSxDQUFBO0FBQ25DLE1BQU0sWUFBWSxHQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBLDBIQUEwSDtBQUMxTSxNQUFNLGFBQWEsR0FBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDL0QseUdBQXlHO0FBQ3pHLCtGQUErRjtBQUMvRixJQUFJLFlBQVksQ0FBQyxhQUFhLEtBQUssU0FBUyxFQUFFO0lBQUUsWUFBWSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0NBQUU7QUFBQSxDQUFDLENBQUMsd0VBQXdFO0FBQ3RMLE1BQU0sZ0JBQWdCLEdBQWEsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4RSxNQUFNLGlCQUFpQixHQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsRSxNQUFNLFlBQVksR0FBRyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFFMUQsTUFBTSxrQkFBa0IsR0FBaUIsRUFBRSxDQUFDLENBQUMsNEdBQTRHO0FBQ3pKLE1BQU0sc0JBQXNCLEdBQWlCLEVBQUUsQ0FBQyxDQUFBLDZHQUE2RztBQUM3SixNQUFNLHVCQUF1QixHQUFpQixFQUFFLEVBQ3hDLHlCQUF5QixHQUFpQixFQUFFLEVBQzVDLHVCQUF1QixHQUFpQixFQUFFLEVBQzFDLHNCQUFzQixHQUFpQixFQUFFLEVBQ3pDLHFCQUFxQixHQUFpQixFQUFFLEVBQ3hDLHNCQUFzQixHQUFpQixFQUFFLEVBQ3pDLG1CQUFtQixHQUFpQixFQUFFLEVBQ3RDLHFCQUFxQixHQUFpQixFQUFFLEVBQ3hDLDBCQUEwQixHQUFpQixFQUFFLEVBQzdDLHdCQUF3QixHQUFpQixFQUFFLEVBQzNDLDJCQUEyQixHQUFpQixFQUFFLEVBQzlDLHVCQUF1QixHQUFpQixFQUFFLENBQUM7QUFDbkQsTUFBTSxtQkFBbUIsR0FBRztJQUN4QixrQkFBa0I7SUFDbEIsc0JBQXNCO0lBQ3RCLHVCQUF1QjtJQUN2Qix5QkFBeUI7SUFDekIsdUJBQXVCO0lBQ3ZCLHNCQUFzQjtJQUN0QixxQkFBcUI7SUFDckIsc0JBQXNCO0lBQ3RCLG1CQUFtQjtJQUNuQixxQkFBcUI7SUFDckIsMEJBQTBCO0lBQzFCLHdCQUF3QjtJQUN4QiwyQkFBMkI7SUFDM0IsdUJBQXVCO0NBQUMsQ0FBQztBQUU3QixNQUNJLGVBQWUsR0FBRztJQUNkLFlBQVksQ0FBQyxZQUFZO0lBQ3pCLFlBQVksQ0FBQyxRQUFRO0lBQ3JCLFlBQVksQ0FBQyxPQUFPO0lBQ3BCLFlBQVksQ0FBQyxVQUFVO0lBQ3ZCLFlBQVksQ0FBQyxZQUFZO0lBQ3pCLFlBQVksQ0FBQyxTQUFTO0lBQ3RCLFlBQVksQ0FBQyxVQUFVO0NBQzFCLEVBRUQsZUFBZSxHQUFHO0lBQ2QsWUFBWSxDQUFDLFFBQVE7SUFDckIsWUFBWSxDQUFDLFlBQVk7SUFDekIsWUFBWSxDQUFDLFlBQVk7SUFDekIsWUFBWSxDQUFDLGFBQWE7Q0FDN0IsRUFFRCxVQUFVLEdBQUc7SUFDVCxHQUFHLGVBQWU7SUFDbEIsR0FBRyxlQUFlO0NBQ3JCLEVBRUQsUUFBUSxHQUFHO0lBQ1AsWUFBWSxDQUFDLFVBQVU7SUFDdkIsWUFBWSxDQUFDLFdBQVc7SUFDeEIsWUFBWSxDQUFDLFlBQVk7SUFDekIsWUFBWSxDQUFDLFlBQVk7SUFDekIsWUFBWSxDQUFDLFVBQVU7Q0FDMUIsRUFDRCxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM5QixNQUFNO0FBQ04sSUFBSSxZQUFZLEdBQWlCLEVBQUUsQ0FBQztBQUNwQyxJQUFJLGlCQUF5QixDQUFDO0FBQzlCLElBQUksWUFBb0IsRUFBRSw2REFBNkQ7QUFDbkYsVUFBa0IsRUFBRSxzSEFBc0g7QUFDMUksV0FBbUIsRUFBRSx1QkFBdUI7QUFDNUMsU0FBaUIsRUFBRSx1QkFBdUI7QUFDMUMsa0JBQTBCLEVBQUUsaUlBQWlJO0FBQzdKLE1BQWMsRUFBRSxpSUFBaUk7QUFDakosT0FBZSxDQUFDLENBQUMsNEZBQTRGO0FBQ2pILElBQUksU0FBZSxDQUFDO0FBQ3BCLElBQUksTUFBZSxDQUFDO0FBQ3BCLElBQUksTUFBTSxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMscUtBQXFLO0FBQzlPLElBQUksVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDakQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQSw4SEFBOEg7QUFDL0osVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxvREFBb0Q7QUFDdEYsSUFBSSxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtJQUFFLFlBQVksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7Q0FBRTtBQUFBLENBQUM7QUFDaEgsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDekQsSUFBSSxZQUFZLENBQUMsYUFBYSxLQUFLLFNBQVMsRUFBRTtJQUFFLFlBQVksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUE7Q0FBRTtBQUFBLENBQUM7QUFDekgsSUFBSSxXQUFXLEdBQVcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLElBQUksWUFBWSxDQUFDLFdBQVcsSUFBSSxTQUFTLEVBQUU7SUFBQyxZQUFZLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTtDQUFDO0FBQUEsQ0FBQyJ9