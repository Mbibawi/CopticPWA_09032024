//CONSTANTS
const version = "v5.6.3 (Added buttons to the Book of Hours, changes to the \"Multiple Choice\" button)";
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
    [2019, "04-28"],
    [2020, "04-19"],
    [2021, "05-02"],
    [2022, "04-24"],
    [2023, "04-16"],
    [2024, "05-05"],
    [2025, "04-20"],
    [2026, "04-12"],
    [2027, "05-02"],
    [2028, "04-16"],
    [2029, "04-08"],
    [2030, "04-28"],
    [2031, "04-13"],
    [2032, "05-02"],
    [2033, "04-24"],
    [2034, "04-09"],
    [2035, "04-29"],
    [2036, "04-20"],
    [2037, "04-05"],
    [2038, "04-25"],
    [2039, "04-17"],
    [2040, "05-06"],
    [2041, "04-21"],
    [2042, "04-13"],
    [2043, "05-03"],
    [2044, "04-24"],
    [2045, "04-09"],
    [2046, "04-29"],
    [2047, "04-21"],
    [2048, "04-05"],
    [2049, "04-25"],
    [2050, "04-17"],
]; // these are  the dates of the Ressurection feast got from خدمة الشماس والألحان للمعلم فرج عبد المسيح الطبعة 14 سنة 2019
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
        EN: ""
    },
    gospelEnd: {
        AR: "والمَجْدُ لِلّهِ دَائِمَاً",
        FR: "Gloire à Dieu éternellement, Amen !",
        EN: "Glory to God Forever"
    },
    stPaulIntro: {
        AR: "البُولِسْ فُصْلٌ مِنْ رِسَالَةِ مُعَلِمِنَا بُولِسَ الرَسُولِ  (الأولى/الثانية) إلى (......)، بَرَكَتْهُ عَلى جَمِيعِنَا آمْينْ.",
        FR: "Lecture de l’Epître de Saint Paul à () que sa bénédiction soit sur nous tous, Amen!",
        EN: "",
    },
    stPaulEnd: {
        AR: "نِعْمَةِ اللّهِ الآبِ فَلْتَكُنْ مَعْكُمْ يا آبَائِي وإخْوَتِي آمْينْ.",
        FR: "Que la grâce de Dieu soit avec vous tous, mes père et mes frères, Amen!",
        EN: "",
    },
    katholikonIntro: {
        AR: "الكَاثُولِيكُون، فَصْلٌ مِنْ رِسَالَةِ القِدِّيسِ (....) (الأولى/الثانية/الثالثة)  بَرَكَتْهُ عَلَى جَمِيعِنَا آمْينْ",
        FR: "Katholikon, (1ère/2ème/3ème) épître à l’Église Universelle de notre père St.(....), que sa bénédiction repose sur nous tous, Amen!",
        EN: "",
    },
    katholikonEnd: {
        AR: "لا تُحِبُّو العَالَمَ ولا الأَشْيَاءَ التِي في العَالَمِ لأَنَّ العَالَمَ يَمْضِي وشَهْوَتَهُ مَعَهُ أَمَّا مَنْ يَصْنَعَ مَشِيئَةَ اللّهِ فَيَثْبُتُ إلى الأَبَدِ.",
        FR: "N’aimez pas le monde et ce qui est dans le monde, le monde passe, lui et sa convoitise, mais celui qui fait la volonté de Dieu demeure à jamais. Amen !",
        EN: "",
    },
    psalmIntro: {
        AR: "مِنْ مَزامِيرِ وتَراتِيلِ أَبِينَادَاوودُ الَنبِيِّ والمَلْكِ، بَرَكَاتُهُ عَلَى جَمِيعِنَا آمْينْ.",
        FR: "Psaume de notre père David, le prophète et le roi, que sa bénédiction soit sur nous tous, Amen!",
        EN: "",
    },
    psalmEnd: {
        AR: "هَلَِيلُويا",
        FR: "Alléluia",
        EN: "Hallelujah",
    },
    praxisIntro: {
        AR: "الإبركسيس فَصْلٌ مِنْ أَعْمَالِ آبِائِنَا الرُسُلِ الأَطْهَارِ، الحَوارِيِّنَ، المَشْمُولِينَ بِنِعْمَةِ الرُّوحِ القُدُسِ، بَرَكَتْهُمُ المُقَدَّسَةِ فَلْتَكُنْ مَعْكُمْ يا آبَائِي وإخْوَتِي آمْينْ.",
        FR: "Praxis, Actes de nos pères les apôtres, que leurs saintes bénédictions reposent sur nous. Amen!",
        EN: "",
    },
    praxisEnd: {
        AR: "لَمْ تَزَلْ كَلِمَةُ الرَبِّ تَنْموُ وتَعْتَزُ وتَكْثُر في هَذِه البَيْعَةِ وكُلِّ بَيْعَةٍ يا آبَائِي وإخْوَتِي آمين.",
        FR: "La parole du Seigneur croît, se multiplie et s’enracine dans la sainte Église de Dieu. Amen!",
        EN: "",
    },
    synaxariumIntro: {
        AR: `اليوم theday من شهر themonth المبارك، أحسن الله استقباله وأعاده علينا وأَنْتُمْ مَغْفُورِي الخَطَايَا والآثَامِ مِنْ قِبَلْ مَرَاحِمْ الرَبِّ يا آبَائِي وإخْوتِي آمين.`,
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
        [116, 117, 119, 120, 121, 122, 124, 125, 127, 128],
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
    Kiahk: "Khk",
    KiahkWeek1: "Khk1",
    KiahkWeek2: "Khk2",
    KiahkWeek3: "Khk3",
    KiahkWeek4: "Khk4",
    NativityParamoun: "NP",
    Nativity: "Nat",
    BaptismParamoun: "BP",
    Baptism: "Ba",
    GreatLent: "GL",
    HolyWeek: "HW",
    PentecostalDays: "Pntl",
    JonahFast: "JFast",
    JonahFeast: "JFeast",
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
    Seasons.NativityFast,
    Seasons.KiahkWeek1,
    Seasons.KiahkWeek2,
    Seasons.KiahkWeek3,
    Seasons.KiahkWeek4,
    Seasons.JonahFast,
    Seasons.GreatLent,
    Seasons.ApostlesFast,
    Seasons.StMaryFast,
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
const nonCopticLanguages = [['AR', 'Arabic'], ['FR', 'French'], ['EN', 'English']];
const copticLanguages = [['COP', 'Coptic'], ['CA', 'قبطي مُعَرَبْ'], ['CF', 'Copte en charachères français']];
const allLanguages = [...nonCopticLanguages, ...copticLanguages];
var defaultLanguage = setLanguage(0, 'your default', nonCopticLanguages) || 'AR';
var foreingLanguage = setLanguage(1, 'a foreign', nonCopticLanguages);
var copticLanguage = setLanguage(2, 'the characters in which you want the coptic text to be displayed', copticLanguages);
localStorage.userLanguages = JSON.stringify([defaultLanguage, foreingLanguage, copticLanguage]); //We do this in case it has been changed
function setLanguage(index, text, languages) {
    let userLanguages = [];
    if (localStorage.userLanguages)
        userLanguages = JSON.parse(localStorage.userLanguages);
    if (userLanguages[index])
        return userLanguages[index]; //We return the value storaged in the localStorage if it is null. When it is null, it means that the user had willingly ignored setting the foreign language when he installed the app for the first time. We do this for any other language than the default language because it must be set.
    if (index > 0 && userLanguages[index] === null)
        return userLanguages[index];
    let choices = languages.map(lang => lang[1]);
    if (defaultLanguage && index < 2)
        choices.splice(choices.indexOf(languages.find(lang => lang[0] === defaultLanguage)[1]), 1); //If the function is called while the defaultLanguage was set, we remove the chosen language from the list
    let choice = prompt('Choose ' + text + ' language from the following: ', choices.join(', '));
    if (!choice || !choices.includes(choice))
        return undefined;
    let found = allLanguages.find(lang => lang[1] === choice);
    if (!found)
        return undefined;
    userLanguages[index] = found[0];
    return userLanguages[index];
}
const prayersLanguages = ["COP", "FR", "CA", "AR"];
const readingsLanguages = ["AR", "FR", "EN"];
var lastScrollTop = 0;
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
        AR: "الكاهن",
    },
    {
        EN: "Diacon",
        FR: "Diacre",
        AR: "الشماس",
    },
    {
        EN: "Assembly",
        FR: "Assemblée",
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
allLanguages.map((lang) => textAmplified.push([lang[0], false]));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21vZHVsZXMvRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF3QkEsV0FBVztBQUNYLE1BQU0sT0FBTyxHQUNiLHdGQUF3RixDQUFDO0FBQ3pGLE1BQU0sV0FBVyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLCtCQUErQjtBQUNoRixNQUFNLFlBQVksR0FBbUIsUUFBUSxDQUFDLGNBQWMsQ0FDMUQsY0FBYyxDQUFtQixDQUFDO0FBQ3BDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFtQixDQUFDO0FBQzdFLE1BQU0sb0JBQW9CLEdBQ3hCLFdBQVcsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDNUMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQW1CLENBQUM7QUFDL0UsTUFBTSxzQkFBc0IsR0FDMUIsWUFBWSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3QyxNQUFNLFVBQVUsR0FBZ0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVuRSxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBc0IsQ0FBQztBQUMvRSxNQUFNLG9CQUFvQixHQUFnQixRQUFRLENBQUMsY0FBYyxDQUMvRCxxQkFBcUIsQ0FDdEIsQ0FBQztBQUNGLE1BQU0saUJBQWlCLEdBQXVCO0lBQzVDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztJQUNmLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztDQUNoQixDQUFDLENBQUMsd0hBQXdIO0FBRTNILE1BQU0sWUFBWSxHQUE2QztJQUM3RDtRQUNFLHFFQUFxRTtRQUNyRSxFQUFFLEVBQUUsTUFBTTtRQUNWLEVB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