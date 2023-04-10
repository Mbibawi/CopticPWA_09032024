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
const psalmResponsePrefix = 'PR_', gospelResponsePrefix = 'GR_', massCommonPrefix = 'MC_', commonPrayerPrefix = 'PC_', incenseDawnPrefix = 'ID_', incenseVespersPrefix = 'IV_', massStBasilPrefix = 'Basil_', massStCyrilPrefix = 'Cyril_', massStGregoryPrefix = 'Gregory_', massStJohnPrefix = 'John_', fractionPrayerPrefix = 'Fraction_', commonDoxologiesPrefix = 'DC_', commonIncensePrefix = 'IC_', communionPrefix = 'Communion_';
const btnClass = 'sideBarBtn';
const inlineBtnClass = 'inlineBtn';
const Readings = {
    BibleIntroFR: '',
    BibleIntroAR: 'قفوا بخوف أمام الله لنسمع الإنجيل المقدس، فصل من بشارة الإنجيل لمعلمنا مار ــــــــــ البشير، والتلميذ الطاهر، بركاته على جميعنا',
    GospelEndFR: '',
    GospelEndAR: '',
    GospelVespers: "RGIV",
    GospelDawn: "RGID",
    GospelMass: "RGM",
    GospelNight: "RGN",
    Psalm: "Psalm",
    StPaul: "RSP",
    StPaulIntroFR: '',
    StPaulIntroAR: '',
    StPaulEndFR: '',
    StPaulEndAR: 'نعمة الله الآب فلتكن مع جميعكم يا آبائي وإخوتي آمين',
    Katholikon: "RK",
    KatholikonIntroFR: '',
    KatholikonIntroAR: '',
    KatholikonEndFR: '',
    KatholikonEndAR: 'لا تحبو العالم ولا الأشياء التي في العالم لأن العالم يمضي وشهوته معه أما من يصنع مشيئة الله فيثبت إلى الأبد',
    Praxis: "RP",
    PraxisIntroFR: '',
    PraxisIntroAR: 'الإبركسيس فصل من أعمال آبائنا الرسل الأطهار، الحوارين، المشمولين بنعمة الروح القدس، بركتهم المقدسة فلتكن معكم يا آبائي واخوتي آمين',
    PraxisEndFR: '',
    PraxisEndAR: 'لم تزل كلمة الرب تنمو وتعتز وتكثر في هذا البيعة وكل بيعة يا آبائي وإخوتي آمين',
    Synaxarium: "RS",
    SynaxariumIntroFR: '',
    SynaxariumIntroAR: '',
    SynaxariumEndFR: '',
    SynaxariumEndAR: '',
    PropheciesDawn: "RPD", //Stands for Readings Prophecies Dawn 
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
    StMaryFast: 'StMFast',
    NativityFast: 'NF',
    Nativity: 'Nat',
    GreatLent: 'GL',
    PentecostalDays: 'Pntl',
    JonahFast: 'Jonah',
    ApostlesFast: 'Apost',
    Nayrouz: 'Nay',
    CrossFeast: 'Cross',
    Resurrection: 'Res',
    NoSeason: 'NoSpecificSeason',
};
const copticFeasts = {
    Nayrouz: '0101',
    StJohnBaptist: '0201',
    Cross: '1701',
    BeguiningNativityLent: '1603',
    NativityBaramoun: '2804',
    Nativity: '2904',
    Circumcision: '0605',
    BaptismBaramoun: '1005',
    Baptism: '1105',
    KanaGalil: '1305',
    EntryToTemple: '0806',
    EntryToEgypt: '2409',
    Annociation: '2907',
    Epiphany: '1312',
    StMaryFastVespers: '3010',
    StMaryFast: '0112',
    StMaryFeast: '1612',
    EndOfGreatLentFriday: Seasons.GreatLent + ' 49',
    LazarusSaturday: Seasons.GreatLent + '50',
    PalmSunday: Seasons.GreatLent + '8thSunday',
    Resurrection: Seasons.GreatLent + '56',
    Pentecoste: Seasons.Resurrection + '39',
    Ascension: Seasons.PentecostalDays + '7thSunday',
    Apostles: '0511',
};
const copticFasts = [
    Seasons.GreatLent,
    Seasons.NativityFast,
    Seasons.ApostlesFast,
    Seasons.StMaryFast,
    Seasons.JonahFast,
];
const allLanguages = ['AR', 'FR', 'COP', 'CA', 'EN'];
const userLanguages = ['AR', 'FR', 'COP'];
//if (localStorage.userLanguages) { console.log('there is user Lanugages', localStorage.userLanguages) };
//if (localStorage.showActors) { console.log('there is showActors', localStorage.showActors) };
if (localStorage.userLanguages === undefined) {
    localStorage.userLanguages = JSON.stringify(userLanguages);
}
;
const prayersLanguages = ['COP', 'FR', 'CA', 'AR'];
const readingsLanguages = ['AR', 'FR', 'EN'];
//VARS
let PrayersArray = [], CommonPrayersArray = [], //an array in which we will group all the common prayers of all the liturgies. It is a subset o PrayersArray
MassCommonPrayersArray = [], //an array in which we will save the commons prayers specific to the mass (like the Assembly, Espasmos, etc.)
MassStBasilPrayersArray = [], MassStGregoryPrayersArray = [], MassStCyrilPrayersArray = [], MassStJohnPrayersArray = [], FractionsPrayersArray = [], DoxologiesPrayersArray = [], IncensePrayersArray = [], CommunionPrayersArray = [], PsalmAndGospelPrayersArray = [];
let lastClickedButton;
let copticDate, copticMonth, copticDay, copticReadingsDate, Season, weekDay;
var todayDate;
let isFast;
let actors = ['Priest', 'Diacon', 'Assembly', 'Comment', 'CommentText'];
let showActors = new Map();
actors.map(actor => showActors.set(actor, true));
showActors.set(actors[3], false); //this is in order to initiate the app without the comments displayed. The user will activate it from the settings if he wants
showActors.set(actors[4], false); //same comment as above concerning the 'CommentText'
if (localStorage.showActors === undefined) {
    localStorage.showActors = JSON.stringify(Array.from(showActors));
}
;
let lordFeasts = [
    copticFeasts.Nativity, copticFeasts.Baptism, Seasons.Resurrection, copticFeasts.Ascension, copticFeasts.Epiphany, copticFeasts.Circumcision, copticFeasts.EntryToEgypt, copticFeasts.EntryToTemple
];
let textAmplified = new Map();
allLanguages.map(lang => textAmplified.set(lang, false));
if (localStorage.textAmplified === undefined) {
    localStorage.textAmplified = JSON.stringify(Array.from(textAmplified));
}
;
