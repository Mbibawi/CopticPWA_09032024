//CONSTANTS
const version = 'v5.0.0 (Major changes and fixes)';
const calendarDay = 24 * 60 * 60 * 1000; //this is a day in milliseconds
const containerDiv = document.getElementById('containerDiv');
const leftSideBar = document.getElementById('leftSideBar');
const sideBarBtnsContainer = leftSideBar.querySelector('#sideBarBtns');
const rightSideBar = document.getElementById('rightSideBar');
const sideBarTitlesContainer = rightSideBar.querySelector('#sideBarBtns');
const contentDiv = document.getElementById('content');
const toggleDevBtn = document.getElementById('toggleDev');
const inlineBtnsDiv = document.getElementById('inlineBtnsContainer');
const ResurrectionDates = ['2022-04-24', '2023-04-16', '2024-05-05', '2025-04-29', '2026-04-12', '2027-05-02', '2028-04-23', '2029-04-8', '2030-04-28']; // these are  the dates of the Ressurection feast caclulated from the end of the Jewish Pessah Feast as got from Google
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
/* function getPrefixes() {
    type prefix = { prefix?: string, array?: string[][][] }
    let prefixes: prefix[] = [];
    for (let pref in Prefix) {
        let newPrefix: prefix =
        {
            prefix: 'Prefix.' + pref,
            array:
                (() => {
                    let matching = Object.entries(PrayersArrays)
                        .filter(array => array[0].toLowerCase().startsWith(pref.toLowerCase()))[0];
                    if (matching) return matching[0];
                })()
        };
        console.log(newPrefix)
        prefixes.push(newPrefix)
    }
    console.log(prefixes.filter(el=>el.array))
} */
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
    placeHolder: 'PlaceHolder_'
};
const plusCharCode = 10133;
const btnClass = 'sideBarBtn';
const eighthNoteCode = 9834;
const beamedEighthNoteCode = 9835;
const inlineBtnClass = 'inlineBtn';
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
    Kiahk: 'Kiahk',
    Nativity: 'Nat',
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
const allLanguages = ['AR', 'FR', 'COP', 'CA', 'CF', 'EN']; //AR = Arabic, FR = French, COP = Coptic, CA = Coptic in Arabic characters, CF = Coptic in French characters, EN = English
const userLanguages = [];
if (localStorage.userLanguages !== null)
    localStorage.userLanguages = JSON.stringify(["AR", "FR", "COP"]);
JSON.parse(localStorage.userLanguages).forEach(lang => userLanguages.push(lang));
var defaultLanguage = userLanguages[0];
var foreingLanguage = userLanguages[1];
var copticLanguage = userLanguages[2];
const prayersLanguages = ['COP', foreingLanguage, 'CA', 'AR'];
const readingsLanguages = ['AR', foreingLanguage, 'EN'];
const displayModes = ['Normal', 'Presentation', 'Priest'];
const CommonPrayersArray = []; //an array in which we will group all the common prayers of all the liturgies. It is a subset o PrayersArray
const MassCommonPrayersArray = []; //an array in which we will save the commons prayers specific to the mass (like the Assembly, Espasmos, etc.)
const MassStBasilPrayersArray = [], MassStGregoryPrayersArray = [], MassStCyrilPrayersArray = [], MassStJohnPrayersArray = [], FractionsPrayersArray = [], DoxologiesPrayersArray = [], IncensePrayersArray = [], CommunionPrayersArray = [], PsalmAndGospelPrayersArray = [], CymbalVersesPrayersArray = [], PraxisResponsesPrayersArray = [], bookOfHoursPrayersArray = [], holyWeekPrayersArray = [];
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
    holyWeekPrayersArray: holyWeekPrayersArray
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
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21vZHVsZXMvRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF3QkEsV0FBVztBQUNYLE1BQU0sT0FBTyxHQUFXLGtDQUFrQyxDQUFDO0FBQzNELE1BQU0sV0FBVyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLCtCQUErQjtBQUNoRixNQUFNLFlBQVksR0FBbUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQW1CLENBQUM7QUFDL0YsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQW1CLENBQUM7QUFDN0UsTUFBTSxvQkFBb0IsR0FBa0IsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN0RixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBbUIsQ0FBQztBQUMvRSxNQUFNLHNCQUFzQixHQUFtQixZQUFZLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzFGLE1BQU0sVUFBVSxHQUFnQixRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRW5FLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFzQixDQUFDO0FBQy9FLE1BQU0sYUFBYSxHQUFnQixRQUFRLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbEYsTUFBTSxpQkFBaUIsR0FBYSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyx1SEFBdUg7QUFFMVIsTUFBTSxZQUFZLEdBQXlDO0lBQ3ZEO1FBQ0kscUVBQXFFO1FBQ3JF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