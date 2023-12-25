//CONSTANTS
const version = 'v5.0.9 (Shortened the prefixes, made changes to the masses arrays in PrayersArray)';
const calendarDay = 24 * 60 * 60 * 1000; //this is a day in milliseconds
const containerDiv = document.getElementById('containerDiv');
const leftSideBar = document.getElementById('leftSideBar');
const sideBarBtnsContainer = leftSideBar.querySelector('#sideBarBtns');
const rightSideBar = document.getElementById('rightSideBar');
const sideBarTitlesContainer = rightSideBar.querySelector('#sideBarBtns');
const contentDiv = document.getElementById('content');
const toggleDevBtn = document.getElementById('toggleDev');
const expandableBtnsPannel = document.getElementById('inlineBtnsContainer');
const ResurrectionDates = [[2022, '2022-04-24'], [2023, '2023-04-16'], [2024, '2024-05-05'], [2025, '2025-04-29'], [2026, '2026-04-12'], [2027, '2027-05-02'], [2028, '2028-04-23'], [2029, '2029-04-08'], [2030, '2030-04-28']]; // these are  the dates of the Ressurection feast caclulated from the end of the Jewish Pessah Feast as got from Google
const copticMonths = [
    {
        //This is just added in order to count the months from 1 instead of 0
        AR: 'none',
        FR: 'none',
        EN: 'none'
    },
    {
        AR: "توت",
        FR: "Tout",
        EN: "Tut"
    },
    {
        AR: "بابه",
        FR: "Bâbah",
        EN: "Babah"
    },
    {
        AR: "هاتور",
        FR: "Hâtour",
        EN: "Hatour"
    },
    {
        AR: "كيهك",
        FR: "Kiahk",
        EN: "Kiahk"
    },
    {
        AR: "طوبة",
        FR: "Toubah",
        EN: "Toubah"
    },
    {
        AR: "أمشير",
        FR: "Amshir",
        EN: "Amshir"
    },
    {
        AR: "برمهات",
        FR: "Baramhat",
        EN: "Baramhat"
    },
    {
        AR: "برمودة",
        FR: "Baramoudah",
        EN: "Baramudah"
    },
    {
        AR: "بشنس",
        FR: "Bachans",
        EN: "Bashans"
    },
    {
        AR: "بؤونة",
        FR: "Baounah",
        EN: "Baounah"
    },
    {
        AR: "أبيب",
        FR: "Abîb",
        EN: "Abib"
    },
    {
        AR: "مسرى",
        FR: "Misra",
        EN: "Mesra"
    },
    {
        AR: "نسي",
        FR: "Nassie",
        EN: "Nassie"
    },
];
const Prefix = {
    same: 'S_',
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
    doxologies: 'Dox_',
    commonIncense: 'IC_',
    communion: 'Communion_',
    hymns: 'Hymns_',
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
    bookOfHours: "BOH_",
    HolyWeek: 'HW_',
    placeHolder: 'PlaceHolder_',
    psalmody: 'Psalmody_'
};
const plusCharCode = 10133;
const btnClass = 'sideBarBtn';
const eighthNoteCode = 9834;
const beamedEighthNoteCode = 9835;
const inlineBtnClass = 'inlineBtn';
const inlineBtnsContainerClass = 'inlineBtns';
const hidden = 'hiddenElement';
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
        FR: 'Halleluja',
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
        AR: `اليوم theday من شهر themonth المبارك، أحسن الله استقباله وأعاده علينا وأنتم مغفوري الخطايا والآثام من قبل مراحم الرب يا آبائي واختوي آمين.`,
        FR: 'Le theday du mois copte themonth ',
        EN: 'We are the theday day of the themonth of () ',
    },
};
const bookOfHoursLabels = [
    {
        id: 'Dawn',
        AR: 'باكر',
        FR: 'Aube',
        EN: 'Dawn'
    },
    {
        id: 'ThirdHour',
        AR: 'الساعة الثالثة',
        FR: '3ème heure',
        EN: 'Third Hour'
    },
    {
        id: 'SixthHour',
        AR: 'الساعة السادسة',
        FR: '6ème heure',
        EN: '6th Hour'
    },
    {
        id: 'NinethHour',
        AR: 'الساعة التاسعة',
        FR: '9ème heure',
        EN: '9th Hour'
    },
    {
        id: 'EleventhHour',
        AR: 'الساعة الحادية عشر (الغروب)',
        FR: '11ème heure',
        EN: '11th Hour'
    },
    {
        id: 'TwelvethHour',
        AR: 'الساعة الثانية عشر (النوم)',
        FR: '12ème heure',
        EN: '12th Hour'
    },
];
const bookOfHours = {
    DawnPrayersArray: [],
    DawnPrayersSequence: [],
    ThirdHourPrayersArray: [],
    ThirdHourPrayersSequence: [],
    SixthHourPrayersArray: [],
    SixthHourPrayersSequence: [],
    NinethHourPrayersArray: [],
    NinethHourPrayersSequence: [],
    EleventhHourPrayersArray: [],
    EleventhHourPrayersSequence: [],
    TwelvethHourPrayersArray: [],
    TwelvethHourPrayersSequence: [],
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
    Nayrouz: 'Nay',
    NativityFast: 'NF',
    KiahkWeek1: 'Kiahk1',
    KiahkWeek2: 'Kiahk2',
    Nativity: 'Nat',
    BaptismParamoun: 'BP',
    Baptism: 'Ba',
    GreatLent: 'GL',
    HolyWeek: 'HW',
    PentecostalDays: 'Pntl',
    JonahFast: 'Jonah',
    ApostlesFast: 'Apost',
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
    theTwentyNinethOfCopticMonth: '000000', //This value will be set to copticDate by setCopticDates() if today is 29th of the Coptic month and we are in a month where this feast is celebrated 
};
const copticFasts = [
    Seasons.GreatLent,
    Seasons.NativityFast,
    Seasons.KiahkWeek1,
    Seasons.KiahkWeek2,
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
const allLanguages = ['AR', 'FR', 'COP', 'CA', 'CF', 'EN']; //AR = Arabic, FR = French, COP = Coptic, CA = Coptic in Arabic characters, CF = Coptic in French characters, EN = English
const userLanguages = [];
if (localStorage.userLanguages !== null)
    localStorage.userLanguages = JSON.stringify(["AR", "FR", "COP"]);
JSON.parse(localStorage.userLanguages).forEach(lang => userLanguages.push(lang));
var defaultLanguage = userLanguages[0];
var foreingLanguage = userLanguages[1];
var copticLanguage = userLanguages[2];
var lastScrollTop = 0;
const prayersLanguages = ['COP', foreingLanguage, 'CA', 'AR'];
const readingsLanguages = ['AR', foreingLanguage, 'EN'];
const displayModes = ['Normal', 'Presentation', 'Priest'];
const CommonPrayersArray = []; //an array in which we will group all the common prayers of all the liturgies. It is a subset o PrayersArray
const MassCommonPrayersArray = []; //an array in which we will save the commons prayers specific to the mass (like the Assembly, Espasmos, etc.)
const MassStBasilPrayersArray = [], MassStGregoryPrayersArray = [], MassStCyrilPrayersArray = [], MassStJohnPrayersArray = [], FractionsPrayersArray = [], DoxologiesPrayersArray = [], IncensePrayersArray = [], CommunionPrayersArray = [], PsalmAndGospelPrayersArray = [], CymbalVersesPrayersArray = [], PraxisResponsesPrayersArray = [], bookOfHoursPrayersArray = [], HolyWeekPrayersArray = [], PsalmodyPrayersArray = [];
const PrayersArrays = {
    CommonPrayersArray: CommonPrayersArray,
    MassCommonPrayersArray: MassCommonPrayersArray,
    MassStBasilPrayersArray: MassStBasilPrayersArray,
    MassStGregoryPrayersArray: MassStGregoryPrayersArray,
    MassStCyrilPrayersArray: MassStCyrilPrayersArray,
    MassStJohnPrayersArray: MassStJohnPrayersArray,
    FractionsPrayersArray: FractionsPrayersArray,
    DoxologiesPrayersArray: DoxologiesPrayersArray,
    IncensePrayersArray: IncensePrayersArray,
    CommunionPrayersArray: CommunionPrayersArray,
    PsalmAndGospelPrayersArray: PsalmAndGospelPrayersArray,
    CymbalVersesPrayersArray: CymbalVersesPrayersArray,
    PraxisResponsesPrayersArray: PraxisResponsesPrayersArray,
    bookOfHoursPrayersArray: bookOfHoursPrayersArray,
    holyWeekPrayersArray: HolyWeekPrayersArray,
    psalmodyPrayersArray: PsalmodyPrayersArray
};
const lordGreatFeasts = [
    copticFeasts.Annonciation,
    copticFeasts.Nativity,
    copticFeasts.Baptism,
    copticFeasts.PalmSunday,
    copticFeasts.Resurrection,
    copticFeasts.Ascension,
    copticFeasts.Pentecoste,
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
        COP: 'Prêtre',
        AR: 'الكاهن',
    },
    {
        EN: 'Diacon',
        FR: 'Diacre',
        COP: 'Diacre',
        AR: 'الشماس',
    },
    {
        EN: 'Assembly',
        FR: 'Assemblée',
        COP: 'Assemblée',
        AR: 'الشعب',
    },
    {
        EN: 'Comments',
        FR: 'Commentaires',
        AR: 'تعليقات'
    },
    {
        EN: 'CommentText',
    },
    {
        EN: 'NoActor'
    }
]; //These are the names of the classes given to each row accordin to which we give a specific background color to the div element in order to show who tells the prayer
let showActors = [];
actors.map(actor => showActors.push([actor, true]));
showActors[3][1] = false; //this is in order to initiate the app without the comments displayed. The user will activate it from the settings if he wants
showActors[4][1] = false; //same comment as above concerning the 'CommentText'
if (localStorage.showActors === undefined) {
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
const PrayersArraysKeys = [
    [Prefix.praxisResponse, 'PraxisResponsesPrayersArray'],
    [Prefix.massCommon, 'MassCommonPrayersArray'],
    [Prefix.commonPrayer, 'CommonPrayersArray'],
    [Prefix.massStBasil, 'MassStBasilPrayersArray'],
    [Prefix.massStCyril, 'MassStCyrilPrayersArray'],
    [Prefix.massStGregory, 'MassStGregoryPrayersArray'],
    [Prefix.massStJohn, 'MassStJohnPrayersArray'],
    [Prefix.doxologies, 'DoxologiesPrayersArray'],
    [Prefix.communion, 'CommunionPrayersArray'],
    [Prefix.cymbalVerses, 'CymbalVersesPrayersArray'],
    [Prefix.bookOfHours, 'bookOfHoursPrayersArray'],
    [Prefix.HolyWeek, 'holyWeekPrayersArray'],
    [Prefix.incenseDawn, 'IncensePrayersArray'],
    [Prefix.incenseVespers, 'IncensePrayersArray'],
    [Prefix.commonIncense, 'IncensePrayersArray'],
    [Prefix.gospelMass, 'ReadingsArrays.GospelMassArray'],
    [Prefix.gospelDawn, 'ReadingsArrays.GospelDawnArray'],
    [Prefix.gospelVespers, 'ReadingsArrays.GospelVespersArray'],
    [Prefix.gospelNight, 'ReadingsArrays.GospelNightArray'],
    [Prefix.stPaul, 'ReadingsArrays.StPaulArray'],
    [Prefix.katholikon, 'ReadingsArrays.KatholikonArray'],
    [Prefix.praxis, 'ReadingsArrays.PraxisArray'],
    [Prefix.synaxarium, 'ReadingsArrays.SynaxariumArray'],
    [Prefix.psalmody, 'PsalmodyPrayersArray'],
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21vZHVsZXMvRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF3QkEsV0FBVztBQUNYLE1BQU0sT0FBTyxHQUFXLG9GQUFvRixDQUFDO0FBQzdHLE1BQU0sV0FBVyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLCtCQUErQjtBQUNoRixNQUFNLFlBQVksR0FBbUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQW1CLENBQUM7QUFDL0YsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQW1CLENBQUM7QUFDN0UsTUFBTSxvQkFBb0IsR0FBa0IsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN0RixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBbUIsQ0FBQztBQUMvRSxNQUFNLHNCQUFzQixHQUFtQixZQUFZLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzFGLE1BQU0sVUFBVSxHQUFnQixRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRW5FLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFzQixDQUFDO0FBQy9FLE1BQU0sb0JBQW9CLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6RixNQUFNLGlCQUFpQixHQUF1QixDQUFDLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFHLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyx1SEFBdUg7QUFFOVcsTUFBTSxZQUFZLEdBQXlDO0lBQ3ZEO1FBQ0kscUVBQXFFO1FBQ3JFLEVBQUUsRUFBRSxNQUFNO1FBQ1YsRUFBRSxFQUFFLE1BQU07UUFDVixFQUFFLEVBQUUsTUFBTTtLQUFDO0lBQ2Y7UUFDSSxFQUFFLEVBQUUsS0FBSztRQUNULEVBQUUsRUFBRSxNQUFNO1FBQ1YsRUFBRSxFQUFFLEtBQUs7S0FDWjtJQUNEO1FBQ0ksRUFBRSxFQUFFLE1BQU07UUFDVixFQUFFLEVBQUUsT0FBTztRQUNYLEVBQUUsRUFBRSxPQUFPO0tBQ2Q7SUFDRDtRQUNJLEVBQUUsRUFBRSxPQUFPO1FBQ1gsRUFBRSxFQUFFLFFBQVE7UUFDWixFQUFFLEVBQUUsUUFBUTtLQUNmO0lBQ0Q7UUFDSSxFQUFFLEVBQUUsTUFBTTtRQUNWLEVBQUUsRUFBRSxPQUFPO1FBQ1gsRUFBRSxFQUFFLE9BQU87S0FDZDtJQUNEO1FBQ0ksRUFBRSxFQUFFLE1BQU07UUFDVixFQUFFLEVBQUUsUUFBUTtRQUNaLEVBQUUsRUFBRSxRQUFRO0tBQ2Y7SUFDRDtRQUNJLEVBQUUsRUFBRSxPQUFPO1FBQ1gsRUFBRSxFQUFFLFFBQVE7UUFDWixFQUFFLEVBQUUsUUFBUTtLQUNmO0lBQ0Q7UUFDSSxFQUFFLEVBQUUsUUFBUTtRQUNaLEVBQUUsRUFBRSxVQUFVO1FBQ2QsRUFBRSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNJLEVBQUUsRUFBRSxRQUFRO1FBQ1osRUFBRSxFQUFFLFlBQVk7UUFDaEIsRUFBRSxFQUFFLFdBQVc7S0FDbEI7SUFDRDtRQUNJLEVBQUUsRUFBRSxNQUFNO1FBQ1YsRUFBRSxFQUFFLFNBQVM7UUFDYixFQUFFLEVBQUUsU0FBUztLQUNoQjtJQUNEO1FBQ0ksRUFBRSxFQUFFLE9BQU87UUFDWCxFQUFFLEVBQUUsU0FBUztRQUNiLEVBQUUsRUFBRSxTQUFTO0tBQ2hCO0lBQ0Q7UUFDSSxFQUFFLEVBQUUsTUFBTTtRQUNWLEVBQUUsRUFBRSxNQUFNO1FBQ1YsRUFBRSxFQUFFLE1BQU07S0FDYjtJQUNEO1FBQ0ksRUFBRSxFQUFFLE1BQU07UUFDVixFQUFFLEVBQUUsT0FBTztRQUNYLEVBQUUsRUFBRSxPQUFPO0tBQ2Q7SUFDRDtRQUNJLEVBQUUsRUFBRSxLQUFLO1FBQ1QsRUFBRSxFQUFFLFFBQVE7UUFDWixFQUFFLEVBQUUsUUFBUTtLQUNmO0NBRUosQ0FBQztBQUVGLE1BQU0sTUFBTSxHQUFHO0lBQ1gsSUFBSSxFQUFDLElBQUk7SUFDVCxhQUFhLEVBQUUsS0FBSztJQUNwQixjQUFjLEVBQUUsS0FBSztJQUNyQixjQUFjLEVBQUUsTUFBTTtJQUN0QixVQUFVLEVBQUUsS0FBSztJQUNqQixZQUFZLEVBQUUsS0FBSztJQUNuQixXQUFXLEVBQUUsS0FBSztJQUNsQixjQUFjLEVBQUUsS0FBSztJQUNyQixXQUFXLEVBQUUsUUFBUTtJQUNyQixXQUFXLEVBQUUsUUFBUTtJQUNyQixhQUFhLEVBQUUsVUFBVTtJQUN6QixVQUFVLEVBQUUsT0FBTztJQUNuQixjQUFjLEVBQUUsV0FBVztJQUMzQixVQUFVLEVBQUUsTUFBTTtJQUNsQixhQUFhLEVBQUUsS0FBSztJQUNwQixTQUFTLEVBQUUsWUFBWTtJQUN2QixLQUFLLEVBQUUsUUFBUTtJQUNmLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsVUFBVSxFQUFFLEtBQUs7SUFDakIsTUFBTSxFQUFFLEtBQUs7SUFDYixhQUFhLEVBQUUsT0FBTztJQUN0QixVQUFVLEVBQUUsT0FBTztJQUNuQixVQUFVLEVBQUUsTUFBTTtJQUNsQixXQUFXLEVBQUUsTUFBTTtJQUNuQixVQUFVLEVBQUUsS0FBSztJQUNqQixZQUFZLEVBQUUsS0FBSztJQUNuQixXQUFXLEVBQUUsTUFBTTtJQUNuQixRQUFRLEVBQUUsS0FBSztJQUNmLFdBQVcsRUFBRSxjQUFjO0lBQzNCLFFBQVEsRUFBRSxXQUFXO0NBQ3hCLENBQUM7QUFDRixNQUFNLFlBQVksR0FBVyxLQUFLLENBQUM7QUFDbkMsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzlCLE1BQU0sY0FBYyxHQUFXLElBQUksQ0FBQztBQUNwQyxNQUFNLG9CQUFvQixHQUFXLElBQUksQ0FBQztBQUMxQyxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7QUFDbkMsTUFBTSx3QkFBd0IsR0FBRyxZQUFZLENBQUM7QUFDOUMsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDO0FBQy9CLE1BQU0scUJBQXFCLEdBQUc7SUFDMUIsV0FBVyxFQUFFO1FBQ1QsRUFBRSxFQUFFLHNJQUFzSTtRQUMxSSxFQUFFLEVBQUMsOEpBQThKO0tBQ3BLO0lBQ0QsU0FBUyxFQUFFO1FBQ1AsRUFBRSxFQUFFLG1CQUFtQjtRQUN2QixFQUFFLEVBQUUscUNBQXFDO0tBQzVDO0lBQ0QsV0FBVyxFQUFFO1FBQ1QsRUFBRSxFQUFHLDhGQUE4RjtRQUNuRyxFQUFFLEVBQUUscUZBQXFGO1FBQ3pGLEVBQUUsRUFBQyxFQUFFO0tBQ1I7SUFDRCxTQUFTLEVBQUU7UUFDUCxFQUFFLEVBQUcsaURBQWlEO1FBQ3RELEVBQUUsRUFBRSx5RUFBeUU7UUFDN0UsRUFBRSxFQUFDLEVBQUU7S0FDUjtJQUNELGVBQWUsRUFBRTtRQUNiLEVBQUUsRUFBRSxrRkFBa0Y7UUFDdEYsRUFBRSxFQUFFLG9JQUFvSTtRQUN4SSxFQUFFLEVBQUMsRUFBRTtLQUNSO0lBQ0QsYUFBYSxFQUFFO1FBQ1gsRUFBRSxFQUFFLDZHQUE2RztRQUNqSCxFQUFFLEVBQUUseUpBQXlKO1FBQzdKLEVBQUUsRUFBQyxFQUFFO0tBQ1I7SUFDRCxVQUFVLEVBQUU7UUFDUixFQUFFLEVBQUUsbUVBQW1FO1FBQ3ZFLEVBQUUsRUFBRSxpR0FBaUc7UUFDckcsRUFBRSxFQUFDLEVBQUU7S0FDUjtJQUNELFFBQVEsRUFBRTtRQUNOLEVBQUUsRUFBRSxVQUFVO1FBQ2QsRUFBRSxFQUFFLFdBQVc7S0FDbEI7SUFDRCxXQUFXLEVBQUU7UUFDVCxFQUFFLEVBQUUscUlBQXFJO1FBQ3pJLEVBQUUsRUFBRSxpR0FBaUc7UUFDckcsRUFBRSxFQUFDLEVBQUU7S0FDUjtJQUNELFNBQVMsRUFBRTtRQUNQLEVBQUUsRUFBRSxnRkFBZ0Y7UUFDcEYsRUFBRSxFQUFFLDhGQUE4RjtRQUNsRyxFQUFFLEVBQUMsRUFBRTtLQUNSO0lBQ0QsZUFBZSxFQUFFO1FBQ2IsRUFBRSxFQUFFLDRJQUE0STtRQUNoSixFQUFFLEVBQUUsbUNBQW1DO1FBQ3ZDLEVBQUUsRUFBRSw4Q0FBOEM7S0FDckQ7Q0FDSixDQUFDO0FBQ0YsTUFBTSxpQkFBaUIsR0FBbUQ7SUFDdEU7UUFDRSxFQUFFLEVBQUUsTUFBTTtRQUNWLEVBQUUsRUFBRSxNQUFNO1FBQ1YsRUFBRSxFQUFFLE1BQU07UUFDVixFQUFFLEVBQUUsTUFBTTtLQUNYO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsV0FBVztRQUNmLEVBQUUsRUFBRSxnQkFBZ0I7UUFDcEIsRUFBRSxFQUFFLFlBQVk7UUFDaEIsRUFBRSxFQUFFLFlBQVk7S0FDakI7SUFDRDtRQUNFLEVBQUUsRUFBRSxXQUFXO1FBQ2YsRUFBRSxFQUFFLGdCQUFnQjtRQUNwQixFQUFFLEVBQUUsWUFBWTtRQUNoQixFQUFFLEVBQUUsVUFBVTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsWUFBWTtRQUNoQixFQUFFLEVBQUUsZ0JBQWdCO1FBQ3BCLEVBQUUsRUFBRSxZQUFZO1FBQ2hCLEVBQUUsRUFBRSxVQUFVO0tBQ2Y7SUFDRDtRQUNFLEVBQUUsRUFBRSxjQUFjO1FBQ2xCLEVBQUUsRUFBRSw2QkFBNkI7UUFDakMsRUFBRSxFQUFFLGFBQWE7UUFDakIsRUFBRSxFQUFFLFdBQVc7S0FDaEI7SUFDRDtRQUNFLEVBQUUsRUFBRSxjQUFjO1FBQ2xCLEVBQUUsRUFBRSw0QkFBNEI7UUFDaEMsRUFBRSxFQUFFLGFBQWE7UUFDakIsRUFBRSxFQUFFLFdBQVc7S0FDaEI7Q0FDSixDQUFDO0FBRUYsTUFBTSxXQUFXLEdBQUc7SUFDaEIsZ0JBQWdCLEVBQUUsRUFBRTtJQUNwQixtQkFBbUIsRUFBRSxFQUFFO0lBQ3ZCLHFCQUFxQixFQUFFLEVBQUU7SUFDekIsd0JBQXdCLEVBQUUsRUFBRTtJQUM1QixxQkFBcUIsRUFBRSxFQUFFO0lBQ3pCLHdCQUF3QixFQUFFLEVBQUU7SUFDNUIsc0JBQXNCLEVBQUUsRUFBRTtJQUMxQix5QkFBeUIsRUFBRSxFQUFFO0lBQzdCLHdCQUF3QixFQUFFLEVBQUU7SUFDNUIsMkJBQTJCLEVBQUUsRUFBRTtJQUMvQix3QkFBd0IsRUFBRSxFQUFFO0lBQzVCLDJCQUEyQixFQUFFLEVBQUU7Q0FDbEMsQ0FBQztBQUNGLE1BQU0sY0FBYyxHQUFHO0lBQ25CLFdBQVcsRUFBRSxFQUFFO0lBQ2YsZUFBZSxFQUFFLEVBQUU7SUFDbkIsV0FBVyxFQUFFLEVBQUU7SUFDZixlQUFlLEVBQUUsRUFBRTtJQUNuQixlQUFlLEVBQUUsRUFBRTtJQUNuQixrQkFBa0IsRUFBRSxFQUFFO0lBQ3RCLGVBQWUsRUFBRSxFQUFFO0lBQ25CLGdCQUFnQixFQUFFLEVBQUU7SUFDcEIsbUJBQW1CLEVBQUUsRUFBRTtDQUMxQixDQUFDO0FBQ0YsTUFBTSxPQUFPLEdBQUc7SUFDWixxSUFBcUk7SUFDckksVUFBVSxFQUFFLFNBQVM7SUFDckIsT0FBTyxFQUFFLEtBQUs7SUFDZCxZQUFZLEVBQUUsSUFBSTtJQUNsQixVQUFVLEVBQUUsUUFBUTtJQUNwQixVQUFVLEVBQUUsUUFBUTtJQUNwQixRQUFRLEVBQUUsS0FBSztJQUNmLGVBQWUsRUFBQyxJQUFJO0lBQ3BCLE9BQU8sRUFBQyxJQUFJO0lBQ1osU0FBUyxFQUFFLElBQUk7SUFDZixRQUFRLEVBQUUsSUFBSTtJQUNkLGVBQWUsRUFBRSxNQUFNO0lBQ3ZCLFNBQVMsRUFBRSxPQUFPO0lBQ2xCLFlBQVksRUFBRSxPQUFPO0lBQ3JCLFVBQVUsRUFBRSxPQUFPO0lBQ25CLFFBQVEsRUFBRSxrQkFBa0I7Q0FDL0IsQ0FBQztBQUNGLE1BQU0sWUFBWSxHQUFHO0lBQ2pCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsS0FBSyxFQUFFLE1BQU07SUFDYixxQkFBcUIsRUFBRSxNQUFNO0lBQzdCLGdCQUFnQixFQUFFLE1BQU07SUFDeEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsWUFBWSxFQUFFLE1BQU07SUFDcEIsZUFBZSxFQUFFLE1BQU07SUFDdkIsT0FBTyxFQUFFLE1BQU07SUFDZixXQUFXLEVBQUUsTUFBTTtJQUNuQixhQUFhLEVBQUUsTUFBTTtJQUNyQixZQUFZLEVBQUUsTUFBTTtJQUNwQixZQUFZLEVBQUUsTUFBTTtJQUNwQixvQkFBb0IsRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUs7SUFDL0MsZUFBZSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSTtJQUN6QyxVQUFVLEVBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxXQUFXO0lBQzNDLFVBQVUsRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDcEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSTtJQUNyQyxZQUFZLEVBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJO0lBQ3RDLFlBQVksRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDdEMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSTtJQUNwQyxZQUFZLEVBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJO0lBQ3RDLFlBQVksRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLFdBQVc7SUFDN0MsWUFBWSxFQUFFLE9BQU8sQ0FBQyxlQUFlLEdBQUcsV0FBVztJQUNuRCxTQUFTLEVBQUUsT0FBTyxDQUFDLGVBQWUsR0FBRyxXQUFXO0lBQ2hELFVBQVUsRUFBRSxPQUFPLENBQUMsZUFBZSxHQUFHLElBQUk7SUFDMUMsUUFBUSxFQUFFLE1BQU07SUFDaEIsaUJBQWlCLEVBQUUsTUFBTTtJQUN6QixVQUFVLEVBQUUsTUFBTTtJQUNsQixRQUFRLEVBQUUsTUFBTTtJQUNoQixXQUFXLEVBQUUsTUFBTTtJQUNuQiw0QkFBNEIsRUFBRSxRQUFRLEVBQUUscUpBQXFKO0NBQ2hNLENBQUM7QUFDRixNQUFNLFdBQVcsR0FBRztJQUNoQixPQUFPLENBQUMsU0FBUztJQUNqQixPQUFPLENBQUMsWUFBWTtJQUNwQixPQUFPLENBQUMsVUFBVTtJQUNsQixPQUFPLENBQUMsVUFBVTtJQUNsQixPQUFPLENBQUMsWUFBWTtJQUNwQixPQUFPLENBQUMsVUFBVTtJQUNsQixPQUFPLENBQUMsU0FBUztDQUNwQixDQUFDO0FBQ0YsTUFBTSxZQUFZLEdBQUc7SUFDakIsYUFBYSxFQUFFLE1BQU07SUFDckIsbUJBQW1CLEVBQUUsTUFBTTtJQUMzQixpQkFBaUIsRUFBRSxNQUFNO0lBQ3pCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsUUFBUSxFQUFFLE1BQU07SUFDaEIsY0FBYyxFQUFFLEVBQUU7SUFDbEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsTUFBTSxFQUFFLE1BQU07SUFDZCxTQUFTLEVBQUUsRUFBRTtJQUNiLFlBQVksRUFBRSxNQUFNO0lBQ3BCLE1BQU0sRUFBRSxFQUFFO0lBQ1YsNEJBQTRCLEVBQUUsRUFBRTtJQUNoQyxhQUFhLEVBQUUsRUFBRTtJQUNqQixVQUFVLEVBQUUsRUFBRTtJQUNkLFNBQVMsRUFBRSxFQUFFO0lBQ2IsUUFBUSxFQUFFLEVBQUU7SUFDWixPQUFPLEVBQUUsTUFBTTtJQUNmLFFBQVEsRUFBRSxFQUFFO0lBQ1osVUFBVSxFQUFFLEVBQUU7SUFDZCxNQUFNLEVBQUUsRUFBRTtJQUNWLFNBQVMsRUFBRSxFQUFFO0lBQ2IsU0FBUyxFQUFFLE1BQU07SUFDakIsYUFBYSxFQUFFLE1BQU07SUFDckIsa0JBQWtCLEVBQUUsRUFBRTtJQUN0QixXQUFXLEVBQUMsRUFBRSxDQUFDLDBCQUEwQjtDQUM1QyxDQUFDO0FBRUYsTUFBTSxZQUFZLEdBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUEsMEhBQTBIO0FBRS9MLE1BQU0sYUFBYSxHQUFhLEVBQUUsQ0FBQztBQUNuQyxJQUFJLFlBQVksQ0FBQyxhQUFhLEtBQUcsSUFBSTtJQUFFLFlBQVksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN4RyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFFakYsSUFBSSxlQUFlLEdBQVcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLElBQUksZUFBZSxHQUFXLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQyxJQUFJLGNBQWMsR0FBVyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUMsSUFBSSxhQUFhLEdBQVUsQ0FBQyxDQUFDO0FBRTdCLE1BQU0sZ0JBQWdCLEdBQWEsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4RSxNQUFNLGlCQUFpQixHQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsRSxNQUFNLFlBQVksR0FBRyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFFMUQsTUFBTSxrQkFBa0IsR0FBaUIsRUFBRSxDQUFDLENBQUMsNEdBQTRHO0FBQ3pKLE1BQU0sc0JBQXNCLEdBQWlCLEVBQUUsQ0FBQyxDQUFBLDZHQUE2RztBQUM3SixNQUFNLHVCQUF1QixHQUFpQixFQUFFLEVBQ3hDLHlCQUF5QixHQUFpQixFQUFFLEVBQzVDLHVCQUF1QixHQUFpQixFQUFFLEVBQzFDLHNCQUFzQixHQUFpQixFQUFFLEVBQ3pDLHFCQUFxQixHQUFpQixFQUFFLEVBQ3hDLHNCQUFzQixHQUFpQixFQUFFLEVBQ3pDLG1CQUFtQixHQUFpQixFQUFFLEVBQ3RDLHFCQUFxQixHQUFpQixFQUFFLEVBQ3hDLDBCQUEwQixHQUFpQixFQUFFLEVBQzdDLHdCQUF3QixHQUFpQixFQUFFLEVBQzNDLDJCQUEyQixHQUFpQixFQUFFLEVBQzlDLHVCQUF1QixHQUFpQixFQUFFLEVBQzFDLG9CQUFvQixHQUFpQixFQUFFLEVBQ3ZDLG9CQUFvQixHQUFpQixFQUFFLENBQUM7QUFDaEQsTUFBTSxhQUFhLEdBQ2Y7SUFDQSxrQkFBa0IsRUFBRSxrQkFBa0I7SUFDdEMsc0JBQXNCLEVBQUUsc0JBQXNCO0lBQzlDLHVCQUF1QixFQUFFLHVCQUF1QjtJQUNoRCx5QkFBeUIsRUFBRSx5QkFBeUI7SUFDcEQsdUJBQXVCLEVBQUUsdUJBQXVCO0lBQ2hELHNCQUFzQixFQUFFLHNCQUFzQjtJQUM5QyxxQkFBcUIsRUFBRSxxQkFBcUI7SUFDNUMsc0JBQXNCLEVBQUUsc0JBQXNCO0lBQzlDLG1CQUFtQixFQUFFLG1CQUFtQjtJQUN4QyxxQkFBcUIsRUFBRSxxQkFBcUI7SUFDNUMsMEJBQTBCLEVBQUMsMEJBQTBCO0lBQ3JELHdCQUF3QixFQUFDLHdCQUF3QjtJQUNqRCwyQkFBMkIsRUFBRSwyQkFBMkI7SUFDeEQsdUJBQXVCLEVBQUUsdUJBQXVCO0lBQ2hELG9CQUFvQixFQUFFLG9CQUFvQjtJQUMxQyxvQkFBb0IsRUFBRSxvQkFBb0I7Q0FDekMsQ0FBQztBQUVOLE1BQ0ksZUFBZSxHQUFHO0lBQ2QsWUFBWSxDQUFDLFlBQVk7SUFDekIsWUFBWSxDQUFDLFFBQVE7SUFDckIsWUFBWSxDQUFDLE9BQU87SUFDcEIsWUFBWSxDQUFDLFVBQVU7SUFDdkIsWUFBWSxDQUFDLFlBQVk7SUFDekIsWUFBWSxDQUFDLFNBQVM7SUFDdEIsWUFBWSxDQUFDLFVBQVU7Q0FDMUIsRUFFRCxlQUFlLEdBQUc7SUFDZCxZQUFZLENBQUMsUUFBUTtJQUNyQixZQUFZLENBQUMsWUFBWTtJQUN6QixZQUFZLENBQUMsWUFBWTtJQUN6QixZQUFZLENBQUMsYUFBYTtDQUM3QixFQUVELFVBQVUsR0FBRztJQUNULEdBQUcsZUFBZTtJQUNsQixHQUFHLGVBQWU7Q0FDckIsRUFFRCxRQUFRLEdBQUc7SUFDUCxZQUFZLENBQUMsVUFBVTtJQUN2QixZQUFZLENBQUMsV0FBVztJQUN4QixZQUFZLENBQUMsWUFBWTtJQUN6QixZQUFZLENBQUMsWUFBWTtJQUN6QixZQUFZLENBQUMsVUFBVTtDQUMxQixFQUNELGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDdkIsTUFBTTtBQUNOLElBQUksWUFBWSxHQUFpQixFQUFFLENBQUM7QUFDcEMsSUFBSSxpQkFBeUIsQ0FBQztBQUM5QixJQUFJLFlBQW9CLEVBQUUsNkRBQTZEO0FBQ25GLFVBQWtCLEVBQUUsc0hBQXNIO0FBQzFJLFdBQW1CLEVBQUUsdUJBQXVCO0FBQzVDLFNBQWlCLEVBQUUsdUJBQXVCO0FBQzFDLFVBQWtCLEVBQUUsdUJBQXVCO0FBQzNDLGtCQUEwQixFQUFFLGlJQUFpSTtBQUM3SixNQUFjLEVBQUUsaUlBQWlJO0FBQ2pKLE9BQWUsQ0FBQyxDQUFDLDRGQUE0RjtBQUNqSCxJQUFJLFNBQWUsQ0FBQztBQUNwQixJQUFJLE1BQWUsQ0FBQztBQUdwQixJQUFJLE1BQU0sR0FBWTtJQUNsQjtRQUNJLEVBQUUsRUFBRSxRQUFRO1FBQ1osRUFBRSxFQUFFLFFBQVE7UUFDWixHQUFHLEVBQUUsUUFBUTtRQUNiLEVBQUUsRUFBRSxRQUFRO0tBQ2Y7SUFDRDtRQUNJLEVBQUUsRUFBRSxRQUFRO1FBQ1osRUFBRSxFQUFFLFFBQVE7UUFDWixHQUFHLEVBQUUsUUFBUTtRQUNiLEVBQUUsRUFBRSxRQUFRO0tBQ2Y7SUFDRDtRQUNJLEVBQUUsRUFBRSxVQUFVO1FBQ2QsRUFBRSxFQUFFLFdBQVc7UUFDZixHQUFHLEVBQUUsV0FBVztRQUNoQixFQUFFLEVBQUUsT0FBTztLQUNkO0lBQ0Q7UUFDSSxFQUFFLEVBQUUsVUFBVTtRQUNkLEVBQUUsRUFBRSxjQUFjO1FBQ2xCLEVBQUUsRUFBRSxTQUFTO0tBQ2hCO0lBQ0Q7UUFDSSxFQUFFLEVBQUUsYUFBYTtLQUNwQjtJQUNEO1FBQ0ksRUFBRSxFQUFDLFNBQVM7S0FDZjtDQUNKLENBQUMsQ0FBQyxxS0FBcUs7QUFDeEssSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRCxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUEsOEhBQThIO0FBQ3ZKLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUUsQ0FBQyxvREFBb0Q7QUFDL0UsSUFBSSxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtJQUFFLFlBQVksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtDQUFDO0FBQUEsQ0FBQztBQUNuRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsSUFBSSxZQUFZLENBQUMsYUFBYSxLQUFLLFNBQVMsRUFBRTtJQUFFLFlBQVksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQTtDQUFFO0FBQUEsQ0FBQztBQUM3RyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVc7T0FDdEIsWUFBWSxDQUFDLFdBQVcsS0FBSyxXQUFXLEVBQUU7SUFDN0MsWUFBWSxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDOUM7QUFBQSxDQUFDO0FBQ0YsTUFBTSxpQkFBaUIsR0FBcUI7SUFDeEMsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLDZCQUE2QixDQUFDO0lBQ3RELENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQztJQUM3QyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUM7SUFDM0MsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLHlCQUF5QixDQUFDO0lBQy9DLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSx5QkFBeUIsQ0FBQztJQUMvQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsMkJBQTJCLENBQUM7SUFDbkQsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLHdCQUF3QixDQUFDO0lBQzdDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQztJQUM3QyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLENBQUM7SUFDM0MsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLDBCQUEwQixDQUFDO0lBQ2pELENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSx5QkFBeUIsQ0FBQztJQUMvQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsc0JBQXNCLENBQUM7SUFDekMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLHFCQUFxQixDQUFDO0lBQzNDLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQztJQUM5QyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUscUJBQXFCLENBQUM7SUFDN0MsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLGdDQUFnQyxDQUFDO0lBQ3JELENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxnQ0FBZ0MsQ0FBQztJQUNyRCxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsbUNBQW1DLENBQUM7SUFDM0QsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLGlDQUFpQyxDQUFDO0lBQ3ZELENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSw0QkFBNEIsQ0FBQztJQUM3QyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsZ0NBQWdDLENBQUM7SUFDckQsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLDRCQUE0QixDQUFDO0lBQzdDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxnQ0FBZ0MsQ0FBQztJQUNyRCxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsc0JBQXNCLENBQUM7Q0FDNUMsQ0FBQyJ9