//CONSTANTS
const version = "v5.3.5 (Fixes to the Book of Hours)";
const calendarDay = 24 * 60 * 60 * 1000; //this is a day in milliseconds
const containerDiv = document.getElementById("containerDiv");
const leftSideBar = document.getElementById("leftSideBar");
const sideBarBtnsContainer = leftSideBar.querySelector("#sideBarBtns");
const rightSideBar = document.getElementById("rightSideBar");
const sideBarTitlesContainer = rightSideBar.querySelector("#sideBarBtns");
const contentDiv = document.getElementById("content");
const toggleDevBtn = document.getElementById("toggleDev");
const expandableBtnsPannel = document.getElementById("inlineBtnsContainer");
const ResurrectionDates = [
    [2022, "2022-04-24"],
    [2023, "2023-04-16"],
    [2024, "2024-05-05"],
    [2025, "2025-04-29"],
    [2026, "2026-04-12"],
    [2027, "2027-05-02"],
    [2028, "2028-04-23"],
    [2029, "2029-04-08"],
    [2030, "2030-04-28"],
]; // these are  the dates of the Ressurection feast caclulated from the end of the Jewish Pessah Feast as got from Google
const copticMonths = [
    {
        //This is just added in order to count the months from 1 instead of 0
        AR: "none",
        FR: "none",
        EN: "none",
    },
    {
        AR: "توت",
        FR: "Tout",
        EN: "Tut",
    },
    {
        AR: "بابه",
        FR: "Bâbah",
        EN: "Babah",
    },
    {
        AR: "هاتور",
        FR: "Hâtour",
        EN: "Hatour",
    },
    {
        AR: "كيهك",
        FR: "Kiahk",
        EN: "Kiahk",
    },
    {
        AR: "طوبة",
        FR: "Toubah",
        EN: "Toubah",
    },
    {
        AR: "أمشير",
        FR: "Amshir",
        EN: "Amshir",
    },
    {
        AR: "برمهات",
        FR: "Baramhat",
        EN: "Baramhat",
    },
    {
        AR: "برمودة",
        FR: "Baramoudah",
        EN: "Baramudah",
    },
    {
        AR: "بشنس",
        FR: "Bachans",
        EN: "Bashans",
    },
    {
        AR: "بؤونة",
        FR: "Baounah",
        EN: "Baounah",
    },
    {
        AR: "أبيب",
        FR: "Abîb",
        EN: "Abib",
    },
    {
        AR: "مسرى",
        FR: "Misra",
        EN: "Mesra",
    },
    {
        AR: "نسي",
        FR: "Nassie",
        EN: "Nassie",
    },
];
const Prefix = {
    same: "S_",
    psalmResponse: "PR_",
    gospelResponse: "GR_",
    praxisResponse: "PRR_",
    massCommon: "MC_",
    commonPrayer: "PC_",
    incenseDawn: "ID_",
    incenseVespers: "IV_",
    massStBasil: "Basil_",
    massStCyril: "Cyril_",
    massStGregory: "Gregory_",
    massStJohn: "John_",
    fractionPrayer: "Fraction_",
    doxologies: "Dox_",
    commonIncense: "IC_",
    communion: "Communion_",
    hymns: "Hymns_",
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
    HolyWeek: "HW_",
    placeHolder: "PlaceHolder_",
    psalmody: "Psalmody_",
};
const plusCharCode = 10133;
const btnClass = "sideBarBtn";
const eighthNoteCode = 9834;
const beamedEighthNoteCode = 9835;
const inlineBtnClass = "inlineBtn";
const inlineBtnsContainerClass = "inlineBtns";
const hidden = "hiddenElement";
const ReadingsIntrosAndEnds = {
    gospelIntro: {
        AR: "قفوا بخوف أمام الله وانصتوا لنسمع الإنجيل المقدس، فصل من بشارة الإنجيل لمعلمنا مار (....) البشير، والتلميذ الطاهر، بركاته على جميعنا",
        FR: "Levons-nous avec crainte de Dieu pour écouter le Saint Évangile. Lecture du Saint évangile selon Saint (....), Que sa bénédiction soit sur nous tous, Amen !",
    },
    gospelEnd: {
        AR: "والمجد لله دائماً",
        FR: "Gloire à Dieu éternellement, Amen !",
    },
    stPaulIntro: {
        AR: "البولس فصل من رسالة معلمنا بولس الرسول  (الأولى/الثانية) إلى (......)، بركته على جميعنا آمين",
        FR: "Lecture de l’Epître de Saint Paul à () que sa bénédiction soit sur nous tous, Amen!",
        EN: "",
    },
    stPaulEnd: {
        AR: "نعمة الله الآب فلتكن معكم يا آبائي واختوي آمين.",
        FR: "Que la grâce de Dieu soit avec vous tous, mes père et mes frères, Amen!",
        EN: "",
    },
    katholikonIntro: {
        AR: "الكاثوليكون، فصل من رسالة القديس (الأولى/الثانية/الثالثة)  بركته على جميعنا آمين",
        FR: "Katholikon, (1ère/2ème/3ème) épître à l’Église Universelle de notre père St.(....), que sa bénédiction repose sur nous tous, Amen!",
        EN: "",
    },
    katholikonEnd: {
        AR: "لا تحبو العالم ولا الأشياء التي في العالم لأن العالم يمضي وشهوته معه أما من يصنع مشيئة الله فيثبت إلى الأبد",
        FR: "N’aimez pas le monde et ce qui est dans le monde, le monde passe, lui et sa convoitise, mais celui qui fait la volonté de Dieu demeure à jamais. Amen !",
        EN: "",
    },
    psalmIntro: {
        AR: "من مزامير تراتيل أبيناداوود النبي والملك، بركاته على جميعنا آمين.",
        FR: "Psaume de notre père David, le prophète et le roi, que sa bénédiction soit sur nous tous, Amen!",
        EN: "",
    },
    psalmEnd: {
        AR: "هلليلويا",
        FR: "Halleluja",
    },
    praxisIntro: {
        AR: "الإبركسيس فصل من أعمال آبائنا الرسل الأطهار، الحوارين، المشمولين بنعمة الروح القدس، بركتهم المقدسة فلتكن معكم يا آبائي واخوتي آمين.",
        FR: "Praxis, Actes de nos pères les apôtres, que leurs saintes bénédictions reposent sur nous. Amen!",
        EN: "",
    },
    praxisEnd: {
        AR: "لم تزل كلمة الرب تنمو وتعتز وتكثر في هذا البيعة وكل بيعة يا آبائي وإخوتي آمين.",
        FR: "La parole du Seigneur croît, se multiplie et s’enracine dans la sainte Église de Dieu. Amen!",
        EN: "",
    },
    synaxariumIntro: {
        AR: `اليوم theday من شهر themonth المبارك، أحسن الله استقباله وأعاده علينا وأنتم مغفوري الخطايا والآثام من قبل مراحم الرب يا آبائي واختوي آمين.`,
        FR: "Le theday du mois copte themonth ",
        EN: "We are the theday day of the themonth of () ",
    },
};
const bookOfHours = {
    //The first element is the array that will be populated with the text tables. The second element is the sequence of the hour's psalms
    FirstHour: [
        [1, 2, 3, 4, 5, 6, 8, 11, 12, 14, 15, 18, 24, 26, 62, 66, 69, 112, 142],
        {
            AR: "بَاكِرْ",
            FR: "Aube",
            EN: "Dawn",
        },
    ],
    ThirdHour: [
        [19, 22, 23, 25, 28, 29, 33, 40, 42, 44, 45, 46],
        {
            AR: "السَاعَةِ الثَالِثَةِ",
            FR: "3ème heure",
            EN: "Third Hour",
        },
    ],
    SixthHour: [
        [53, 56, 60, 62, 66, 69, 83, 84, 85, 86, 90, 92],
        {
            AR: "السَاعَةِ السَادِسَةِ",
            FR: "6ème heure",
            EN: "6th Hour",
        },
    ],
    NinethHour: [
        [95, 96, 97, 98, 99, 100, 109, 111, 112, 114, 115],
        {
            AR: "السَاعَةِ التَاسِعَةِ",
            FR: "9ème heure",
            EN: "9th Hour",
        },
    ],
    EleventhHour: [
        [116, 117, 119, 120, 121, 122, 124, 25, 26, 27, 28],
        {
            AR: "السَاعَةِ الحَادِيَةِ عَشْرِ (الغروب)",
            FR: "11ème heure",
            EN: "11th Hour",
        },
    ],
    TwelvethHour: [
        [129, 130, 131, 132, 133, 136, 137, 140, 141, 145, 146, 147],
        {
            AR: "السَاعَةِ الثانية عَشْرِ (النوم)",
            FR: "12ème heure",
            EN: "12th Hour",
        },
    ],
    VeilHour: [
        [
            4, 6, 12, 15, 24, 26, 66, 69, 22, 25, 29, 56, 85, 90, 98, 109, 114, 115,
            120, 128, 129, 130, 131, 132, 133, 136, 140, 147, 118,
        ],
        {
            AR: "صَلاةِ السِتَارْ",
            FR: "Femeture du voile",
            EN: "Closing of the Veil",
        },
    ],
    MidNight1Hour: [
        [3, 6, 12, 69, 85, 90, 116, 117, 118],
        {
            AR: "الخِدْمَة الأولى مِن صَلاةِ نِصْفِ الليل",
            FR: "Miniuit 1er service",
            EN: "Mid Night 1st Service",
        },
    ],
    MidNight2Hour: [
        [119, 120, 121, 122, 124, 25, 26, 27, 28],
        {
            AR: "الخِدْمَة الثانِيَة مِنْ صَلاةِ نِصْفِ الليل",
            FR: "Miniuit 2ème service",
            EN: "Mid Night 2nd Service",
        },
    ],
    MidNight3Hour: [
        [129, 130, 131, 132, 133, 136, 137, 140, 141, 145, 146, 147],
        {
            AR: "الخِدْمَة الثَالِثَةِ مِنْ صَلاةِ نِصْفِ الليل",
            FR: "Miniuit 3ème service",
            EN: "Mid Night 3rd Service",
        },
    ],
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
    StMaryFast: "StMFast",
    Nayrouz: "Nay",
    NativityFast: "NF",
    Kiahk: "KiahkAny",
    KiahkWeek1: "Kiahk1",
    KiahkWeek2: "Kiahk2",
    KiahkWeek3: "Kiahk3",
    KiahkWeek4: "Kiahk4",
    NativityParamoun: "NP",
    Nativity: "Nat",
    BaptismParamoun: "BP",
    Baptism: "Ba",
    GreatLent: "GL",
    HolyWeek: "HW",
    PentecostalDays: "Pntl",
    JonahFast: "Jonah",
    ApostlesFast: "Apost",
    CrossFeast: "Cross",
    NoSeason: "NoSpecificSeason",
};
const copticFeasts = {
    AnyDay: "AnyDay",
    Nayrouz: "0101",
    Cross: "1701",
    BeguiningNativityLent: "1603",
    NativityParamoun: "2804",
    Nativity: "2904",
    Circumcision: "0605",
    BaptismParamoun: "1005",
    Baptism: "1105",
    CanaWedding: "1305",
    EntryToTemple: "0806",
    EntryToEgypt: "2409",
    Annonciation: "2907",
    EndOfGreatLentFriday: Seasons.GreatLent + " 49",
    LazarusSaturday: Seasons.GreatLent + "50",
    PalmSunday: Seasons.GreatLent + "8thSunday",
    HolyMonday: Seasons.GreatLent + "52",
    HolyTuseday: Seasons.GreatLent + "53",
    HolyWednsday: Seasons.GreatLent + "54",
    HolyThursday: Seasons.GreatLent + "55",
    HolyFriday: Seasons.GreatLent + "56",
    HolySaturday: Seasons.GreatLent + "57",
    Resurrection: Seasons.GreatLent + "9thSunday",
    ThomasSunday: Seasons.PentecostalDays + "1stSunday",
    Ascension: Seasons.PentecostalDays + "7thSunday",
    Pentecoste: Seasons.PentecostalDays + "39",
    Apostles: "0511",
    StMaryFastVespers: "3010",
    StMaryFast: "0112",
    Epiphany: "1312",
    StMaryFeast: "1612",
    Coptic29th: "000000", //This value will be set to copticDate by setCopticDates() if today is 29th of the Coptic month and we are in a month where this feast is celebrated
};
const copticFasts = [
    Seasons.GreatLent,
    Seasons.NativityFast,
    Seasons.KiahkWeek1,
    Seasons.KiahkWeek2,
    Seasons.KiahkWeek3,
    Seasons.KiahkWeek4,
    Seasons.ApostlesFast,
    Seasons.StMaryFast,
    Seasons.JonahFast,
];
const saintsFeasts = {
    StJohnBaptist: "0201",
    FourCelestialBeings: "0803",
    TwentyFourPriests: "2403",
    StMaykel: "1203",
    StGabriel: "1310",
    StRaphael: "0313",
    StSourial: "2705",
    StMarc: "3008",
    StSteven: "0105",
    StSergeBacchus: "1002",
    StGeorge: "2708",
    StMina: "1503",
    StTheodor: "1205",
    StPhilopatir: "2503",
    StCome: "",
    OneHudredTwentyFourThousands: "",
    AbakirAndJohn: "",
    StDamienne: "",
    StBarbara: "",
    StMarina: "",
    StAnton: "2205",
    StBishoy: "0810",
    StShenoute: "",
    StTeji: "",
    StPersoma: "",
    StCyrilVI: "3004",
    StBishoyKamel: "1207",
    StMikaelMetropolis: "",
    StJustAnton: "", //St Just of the St. Anton
};
const AngelsFeasts = [
    saintsFeasts.StMaykel,
    saintsFeasts.StGabriel,
    saintsFeasts.StRaphael,
    saintsFeasts.StSourial,
];
const martyrsFeasts = [];
const allLanguages = ["AR", "FR", "COP", "CA", "CF", "EN"]; //AR = Arabic, FR = French, COP = Coptic, CA = Coptic in Arabic characters, CF = Coptic in French characters, EN = English
const userLanguages = [];
if (localStorage.userLanguages !== null)
    localStorage.userLanguages = JSON.stringify(["AR", "FR", "COP"]);
JSON.parse(localStorage.userLanguages).forEach((lang) => userLanguages.push(lang));
var defaultLanguage = userLanguages[0];
var foreingLanguage = userLanguages[1];
var copticLanguage = userLanguages[2];
var lastScrollTop = 0;
const prayersLanguages = ["COP", foreingLanguage, "CA", "AR"];
const readingsLanguages = ["AR", foreingLanguage, "EN"];
const displayModes = ["Normal", "Presentation", "Priest"];
const CommonPrayersArray = []; //an array in which we will group all the common prayers of all the liturgies. It is a subset o PrayersArray
const MassCommonPrayersArray = []; //an array in which we will save the commons prayers specific to the mass (like the Assembly, Espasmos, etc.)
const MassStBasilPrayersArray = [], MassStGregoryPrayersArray = [], MassStCyrilPrayersArray = [], MassStJohnPrayersArray = [], FractionsPrayersArray = [], DoxologiesPrayersArray = [], IncensePrayersArray = [], CommunionPrayersArray = [], PsalmAndGospelPrayersArray = [], CymbalVersesPrayersArray = [], PraxisResponsesPrayersArray = [], BookOfHoursPrayersArray = [], HolyWeekPrayersArray = [], PsalmodyPrayersArray = [];
const PrayersArrays = [
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
    BookOfHoursPrayersArray,
    HolyWeekPrayersArray,
    PsalmodyPrayersArray,
]; //All these arrays are populated by elements from PrayersArray
const GreatLordFeasts = [
    copticFeasts.Annonciation,
    copticFeasts.Nativity,
    copticFeasts.Baptism,
    copticFeasts.PalmSunday,
    copticFeasts.Resurrection,
    copticFeasts.Ascension,
    copticFeasts.Pentecoste,
], MinorLordFeasts = [
    copticFeasts.Epiphany,
    copticFeasts.Circumcision,
    copticFeasts.CanaWedding,
    copticFeasts.EntryToEgypt,
    copticFeasts.EntryToTemple,
], lordFeasts = [...GreatLordFeasts, ...MinorLordFeasts], HolyWeek = [
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
        EN: "Priest",
        FR: "Prêtre",
        COP: "Prêtre",
        AR: "الكاهن",
    },
    {
        EN: "Diacon",
        FR: "Diacre",
        COP: "Diacre",
        AR: "الشماس",
    },
    {
        EN: "Assembly",
        FR: "Assemblée",
        COP: "Assemblée",
        AR: "الشعب",
    },
    {
        EN: "Comments",
        FR: "Commentaires",
        AR: "تعليقات",
    },
    {
        EN: "CommentText",
    },
    {
        EN: "NoActor",
    },
]; //These are the names of the classes given to each row accordin to which we give a specific background color to the div element in order to show who tells the prayer
let showActors = [];
actors.map((actor) => showActors.push([actor, true]));
showActors[3][1] = false; //this is in order to initiate the app without the comments displayed. The user will activate it from the settings if he wants
showActors[4][1] = false; //same comment as above concerning the 'CommentText'
if (localStorage.showActors === undefined) {
    localStorage.showActors = JSON.stringify(showActors);
}
allLanguages.map((lang) => textAmplified.push([lang, false]));
if (localStorage.textAmplified === undefined) {
    localStorage.textAmplified = JSON.stringify(textAmplified);
}
if (!localStorage.displayMode || localStorage.displayMode === "undefined") {
    localStorage.displayMode = displayModes[0];
}
const PrayersArraysKeys = [
    //!Caution: we needed to make the last element a function that returns the array instead of referrecing the array itself, because when the DeclareGlobalVariables.js file is loaded, the ReadingsPrayersArrays are still empty since the readings texts files are not loaded yet
    [
        Prefix.praxisResponse,
        "PraxisResponsesPrayersArray",
        () => PraxisResponsesPrayersArray,
    ],
    [
        Prefix.psalmResponse,
        "PsalmAndGospelPrayersArray",
        () => PsalmAndGospelPrayersArray,
    ],
    [
        Prefix.gospelResponse,
        "PsalmAndGospelPrayersArray",
        () => PsalmAndGospelPrayersArray,
    ],
    [Prefix.massCommon, "MassCommonPrayersArray", () => MassCommonPrayersArray],
    [Prefix.commonPrayer, "CommonPrayersArray", () => CommonPrayersArray],
    [
        Prefix.massStBasil,
        "MassStBasilPrayersArray",
        () => MassStBasilPrayersArray,
    ],
    [
        Prefix.massStCyril,
        "MassStCyrilPrayersArray",
        () => MassStCyrilPrayersArray,
    ],
    [
        Prefix.massStGregory,
        "MassStGregoryPrayersArray",
        () => MassStGregoryPrayersArray,
    ],
    [Prefix.massStJohn, "MassStJohnPrayersArray", () => MassStJohnPrayersArray],
    [Prefix.doxologies, "DoxologiesPrayersArray", () => DoxologiesPrayersArray],
    [Prefix.communion, "CommunionPrayersArray", () => CommunionPrayersArray],
    [Prefix.fractionPrayer, "FractionsPrayersArray", () => FractionsPrayersArray],
    [
        Prefix.cymbalVerses,
        "CymbalVersesPrayersArray",
        () => CymbalVersesPrayersArray,
    ],
    [
        Prefix.bookOfHours,
        "BookOfHoursPrayersArray",
        () => BookOfHoursPrayersArray,
    ],
    [Prefix.HolyWeek, "HolyWeekPrayersArray", () => HolyWeekPrayersArray],
    [Prefix.incenseDawn, "IncensePrayersArray", () => IncensePrayersArray],
    [Prefix.incenseVespers, "IncensePrayersArray", () => IncensePrayersArray],
    [Prefix.commonIncense, "IncensePrayersArray", () => IncensePrayersArray],
    [
        Prefix.gospelMass,
        "ReadingsArrays.GospelMassArray",
        () => ReadingsArrays.GospelMassArray,
    ],
    [
        Prefix.gospelDawn,
        "ReadingsArrays.GospelDawnArray",
        () => ReadingsArrays.GospelDawnArray,
    ],
    [
        Prefix.gospelVespers,
        "ReadingsArrays.GospelVespersArray",
        () => ReadingsArrays.GospelVespersArray,
    ],
    [
        Prefix.gospelNight,
        "ReadingsArrays.GospelNightArray",
        () => ReadingsArrays.GospelNightArray,
    ],
    [
        Prefix.stPaul,
        "ReadingsArrays.StPaulArray",
        () => ReadingsArrays.StPaulArray,
    ],
    [
        Prefix.katholikon,
        "ReadingsArrays.KatholikonArray",
        () => ReadingsArrays.KatholikonArray,
    ],
    [
        Prefix.praxis,
        "ReadingsArrays.PraxisArray",
        () => ReadingsArrays.PraxisArray,
    ],
    [
        Prefix.synaxarium,
        "ReadingsArrays.SynaxariumArray",
        () => ReadingsArrays.SynaxariumArray,
    ],
    [
        Prefix.propheciesDawn,
        "ReadingsArrays.PropheciesDawnArray",
        () => ReadingsArrays.PropheciesDawnArray,
    ],
    [Prefix.psalmody, "PsalmodyPrayersArray", () => PsalmodyPrayersArray],
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21vZHVsZXMvRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF3QkEsV0FBVztBQUNYLE1BQU0sT0FBTyxHQUNYLHFDQUFxQyxDQUFDO0FBQ3hDLE1BQU0sV0FBVyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLCtCQUErQjtBQUNoRixNQUFNLFlBQVksR0FBbUIsUUFBUSxDQUFDLGNBQWMsQ0FDMUQsY0FBYyxDQUNHLENBQUM7QUFDcEIsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQW1CLENBQUM7QUFDN0UsTUFBTSxvQkFBb0IsR0FDeEIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM1QyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBbUIsQ0FBQztBQUMvRSxNQUFNLHNCQUFzQixHQUMxQixZQUFZLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzdDLE1BQU0sVUFBVSxHQUFnQixRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRW5FLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFzQixDQUFDO0FBQy9FLE1BQU0sb0JBQW9CLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQy9ELHFCQUFxQixDQUN0QixDQUFDO0FBQ0YsTUFBTSxpQkFBaUIsR0FBdUI7SUFDNUMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO0lBQ3BCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQztJQUNwQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUM7SUFDcEIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO0lBQ3BCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FB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