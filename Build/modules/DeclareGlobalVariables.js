//CONSTANTS
const version = 'v4.7.4 (Changed the settings button, some css and other fixes)';
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
    [Prefix.praxisResponse, PraxisResponsesPrayersArray],
    [Prefix.massCommon, MassCommonPrayersArray],
    [Prefix.commonPrayer, CommonPrayersArray],
    [Prefix.massStBasil, MassStBasilPrayersArray],
    [Prefix.massStCyril, MassStCyrilPrayersArray],
    [Prefix.massStGregory, MassStGregoryPrayersArray],
    [Prefix.massStJohn, MassStJohnPrayersArray],
    [Prefix.doxologies, DoxologiesPrayersArray],
    [Prefix.communion, CommunionPrayersArray],
    [Prefix.praxis, PraxisResponsesPrayersArray],
    [Prefix.cymbalVerses, CymbalVersesPrayersArray],
    [Prefix.bookOfHours, bookOfHoursPrayersArray],
    [Prefix.HolyWeek, holyWeekPrayersArray]
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21vZHVsZXMvRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF3QkEsV0FBVztBQUNYLE1BQU0sT0FBTyxHQUFXLGdFQUFnRSxDQUFDO0FBQ3pGLE1BQU0sV0FBVyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLCtCQUErQjtBQUNoRixNQUFNLFlBQVksR0FBbUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQW1CLENBQUM7QUFDL0YsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQW1CLENBQUM7QUFDN0UsTUFBTSxvQkFBb0IsR0FBa0IsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN0RixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBbUIsQ0FBQztBQUMvRSxNQUFNLHNCQUFzQixHQUFtQixZQUFZLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzFGLE1BQU0sVUFBVSxHQUFnQixRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRW5FLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFzQixDQUFDO0FBQy9FLE1BQU0sYUFBYSxHQUFnQixRQUFRLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbEYsTUFBTSxpQkFBaUIsR0FBYSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyx1SEFBdUg7QUFFMVIsTUFBTSxZQUFZLEdBQXlDO0lBQ3ZEO1FBQ0kscUVBQXFFO1FBQ3JF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