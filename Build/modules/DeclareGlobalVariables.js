//CONSTANTS
const calendarDay = 24 * 60 * 60 * 1000; //this is a day in milliseconds
const containerDiv = document.getElementById('TargetDiv');
const leftSideBar = document.getElementById('leftSideBar');
const rightSideBar = document.getElementById('rightSideBar');
const contentDiv = document.getElementById('content');
const sideBarBtn = document.getElementById('opensidebar');
const toggleDevBtn = document.getElementById('toggleDev');
const inlineBtnsDiv = document.getElementById('inlineBtnsContainer');
const ResurrectionDates = ["2023-04-16", "2024-05-05", "2025-04-29", "2026-04-12", "2027-05-02", "2028-04-23", "2029-04-8", "2030-04-28"]; // these are  the dates of the Ressurection feast caclulated from the end of the Jewish Pessah Feast as got from Google
const Prefix = {
    psalmResponse: 'PR_',
    gospelResponse: 'GR_',
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
    agbeya: "BOP_", //Stands for Book Of Prayers
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
    stPaulEnd: {
        AR: 'نعمة الله الآب فلتكن معكم يا آبائي واختوي آمين.',
        FR: ''
    },
    katholikonIntro: {
        AR: '',
        Fr: '',
    },
    katholikonEnd: {
        AR: 'لا تحبو العالم ولا الأشياء التي في العالم لأن العالم يمضي وشهوته معه أما من يصنع مشيئة الله فيثبت إلى الأبد',
        Fr: '',
    },
    psalmIntro: {
        AR: 'من مزامير تراتيل أبيناداوود النبي والملك، بركاته على جميعنا آمين.',
        Fr: '',
    },
    psalmEnd: {
        AR: 'هلليلويا',
        Fr: '',
    },
    praxisIntro: {
        AR: 'الإبركسيس فصل من أعمال آبائنا الرسل الأطهار، الحوارين، المشمولين بنعمة الروح القدس، بركتهم المقدسة فلتكن معكم يا آبائي واخوتي آمين.',
        Fr: '',
    },
    praxisEnd: {
        AR: 'لم تزل كلمة الرب تنمو وتعتز وتكثر في هذا البيعة وكل بيعة يا آبائي وإخوتي آمين.',
        Fr: '',
    },
    synaxariumIntro: {
        AR: 'اليوم () من شهر () المبارك، أحسن الله استقباله وأعاده علينا وأنتم مغفوري الخطايا والآثام من قبل مراحم الرب يا آبائي واختوي آمين.',
        Fr: '',
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
    Kiahk: '0004',
    NativityFast: 'NF',
    Nativity: 'Nat',
    GreatLent: 'GL',
    PentecostalDays: 'Pntl',
    JonahFast: 'Jonah',
    ApostlesFast: 'Apost',
    Nayrouz: 'Nay',
    CrossFeast: 'CrossFeast',
    NoSeason: 'NoSpecificSeason',
};
const copticFeasts = {
    Nayrouz: '0101',
    StJohnBaptist: '0201',
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
    theTwentyNinethOfCopticMonth: '2900'
};
const copticFasts = [
    Seasons.GreatLent,
    Seasons.NativityFast,
    Seasons.ApostlesFast,
    Seasons.StMaryFast,
    Seasons.JonahFast,
];
const saintsFeasts = {
    stJohnBaptist: '',
    stGeorges: '',
    stMina: '',
    stPhilopatir: '',
    stPaul: '',
    stMarina: '',
    stDemiane: '',
    stCyrilVI: '',
    stBishoyKamel: '',
    stBishoy: '',
};
const allLanguages = ['AR', 'FR', 'COP', 'CA', 'CF', 'EN']; //AR = Arabic, FR = French, COP = Coptic, CA = Coptic in Arabic characters, CF = Coptic in French characters, EN = English
const userLanguages = ['AR', 'FR', 'COP'];
//if (localStorage.userLanguages) { console.log('there is user Lanugages', localStorage.userLanguages) };
//if (localStorage.showActors) { console.log('there is showActors', localStorage.showActors) };
if (localStorage.userLanguages === undefined) {
    localStorage.userLanguages = JSON.stringify(userLanguages);
}
; //We check that there isn't already a setting stored in the localStorage
const prayersLanguages = ['COP', 'FR', 'CA', 'AR'];
const readingsLanguages = ['AR', 'FR', 'EN'];
const displayModes = ['Normal', 'Presentation', 'Priest'];
//VARS
let PrayersArray = [], CommonPrayersArray = [], //an array in which we will group all the common prayers of all the liturgies. It is a subset o PrayersArray
MassCommonPrayersArray = [], //an array in which we will save the commons prayers specific to the mass (like the Assembly, Espasmos, etc.)
MassStBasilPrayersArray = [], MassStGregoryPrayersArray = [], MassStCyrilPrayersArray = [], MassStJohnPrayersArray = [], FractionsPrayersArray = [], DoxologiesPrayersArray = [], IncensePrayersArray = [], CommunionPrayersArray = [], PsalmAndGospelPrayersArray = [], cymbalVersesArray = [];
let lastClickedButton;
let copticDate, //The Coptic date is stored in a string not in a number like the gregorian date, this is to avoid complex calculations
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
let lordGreatFeasts = [copticFeasts.Annonciation, copticFeasts.Nativity, copticFeasts.Baptism, copticFeasts.PalmSunday, copticFeasts.Resurrection, copticFeasts.Ascension, copticFeasts.Pentecoste];
let lordMinorFeasts = [copticFeasts.Epiphany, copticFeasts.Circumcision, copticFeasts.EntryToEgypt, copticFeasts.EntryToTemple];
let lordFeasts = [...lordGreatFeasts, ...lordMinorFeasts];
let textAmplified = new Map();
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
