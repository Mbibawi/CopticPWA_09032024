//CONSTANTS
const version = 'v4.5.5 (substantial changes to the mass buttons afterShowPrayers() method, replaced class  \"TitleRow\" with \"Title\", some readings were updated, changes to the edit-mode functions)';
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
const plusCharCode = 10133;
const btnClass = 'sideBarBtn';
const inlineBtnClass = 'inlineBtn';
const ReadingsIntrosAndEnds = {
    gospelIntro: {
        AR: 'قفوا بخوف أمام الله وانصتوا لنسمع الإنجيل المقدس، فصل من بشارة الإنجيل لمعلمنا مار (....) البشير، والتلميذ الطاهر، بركاته على جميعنا',
        FR: 'Levons-nous avec crainte de Dieu pour écouter le Saint Évangile. Lecture du Saint évangile selon Saint (....), Que sa bénédiction soit sur nous tous, Amen !',
    },
    gospelEnd: {
        AR: 'والمجد لله دائماً',
        FR: 'Gloire à Dieu éternellement, Amen !',
    },
    stPaulIntro: {
        AR: 'البولس فصل من رسالة معلمنا بولس الرسول  (الأولى/الثانية) إلى (......)، بركته على جميعنا آمين',
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
        FR: 'Katholikon, (1ère/2ème/3ème) épître à l’Église Universelle de notre père St.(....), que sa bénédiction repose sur nous tous, Amen!',
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
const foreingLanguage = 'FR'; //'FR' stands for 'French'
const defaultLanguage = 'AR'; //'AR' stands for Arabic
const allLanguages = [defaultLanguage, foreingLanguage, 'COP', 'CA', 'CF', 'EN']; //AR = Arabic, FR = French, COP = Coptic, CA = Coptic in Arabic characters, CF = Coptic in French characters, EN = English
const userLanguages = [defaultLanguage, foreingLanguage, 'COP'];
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
], textAmplified = [];
//VARS
let PrayersArray = [];
let lastClickedButton;
let selectedDate, //This is the date that the user might have manually selected
copticDate, //The Coptic date is stored in a string not in a number like the gregorian date, this is to avoid complex calculations
copticMonth, //same comment as above
copticDay, //same comment as above
copticYear, //same comment as above
copticReadingsDate, //This is the date of the day's readings (gospel, Katholikon, praxis, etc.). It does not neceissarly correspond to the copticDate
Season, //This is a value telling whether we are during a special period of the year like the Great Lent or the 50 Pentecostal days, etc.
weekDay; //This is today's day of the week (Sunday, Monday, etc.) expressed in number starting from 0
var todayDate;
let isFast;
let actors = [
    {
        EN: 'Priest',
        FR: 'Prêtre',
        AR: 'الكاهن',
    },
    {
        EN: 'Diacon',
        FR: 'Diacre',
        AR: 'الشماس',
    },
    {
        EN: 'Assembly',
        FR: 'Assemblée',
        AR: 'الشعب',
    },
    {
        EN: 'Comments',
        FR: 'Commentaires',
        AR: 'تعليقات'
    },
    {
        EN: 'CommentText',
    }
]; //These are the names of the classes given to each row accordin to which we give a specific background color to the div element in order to show who tells the prayer
let showActors = [];
actors.map(actor => showActors.push([actor, true]));
showActors[3][1] = false; //this is in order to initiate the app without the comments displayed. The user will activate it from the settings if he wants
showActors[4][1] = false; //same comment as above concerning the 'CommentText'
if (localStorage.showActors === undefined
    || JSON.parse(localStorage.showActors)[0][0] !== showActors[0][0]) {
    localStorage.showActors = JSON.stringify(showActors);
}
;
allLanguages.map(lang => textAmplified.push([lang, false]));
if (localStorage.textAmplified === undefined) {
    localStorage.textAmplified = JSON.stringify(textAmplified);
}
;
if (!localStorage.displayMode
    || localStorage.displayMode === 'undefined') {
    localStorage.displayMode = displayModes[0];
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21vZHVsZXMvRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEyQkEsV0FBVztBQUNYLE1BQU0sT0FBTyxHQUFXLHlMQUF5TCxDQUFDO0FBQ2xOLE1BQU0sV0FBVyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLCtCQUErQjtBQUNoRixNQUFNLFlBQVksR0FBbUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQW1CLENBQUM7QUFDL0YsTUFBTSxXQUFXLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEUsTUFBTSxZQUFZLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDMUUsTUFBTSxVQUFVLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkUsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQXNCLENBQUM7QUFDL0UsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQXNCLENBQUM7QUFDL0UsTUFBTSxhQUFhLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNsRixNQUFNLGlCQUFpQixHQUFhLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLHVIQUF1SDtBQUMxUixNQUFNLE1BQU0sR0FBRztJQUNYLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLGNBQWMsRUFBRSxLQUFLO0lBQ3JCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLFVBQVUsRUFBRSxLQUFLO0lB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