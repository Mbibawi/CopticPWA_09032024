//CONSTANTS
const version = "v5.2.0 (Fixes to the Book of Hours)";
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
        [],
        [1, 2, 3, 4, 5, 6, 8, 11, 12, 14, 15, 18, 24, 26, 142], {
            AR: "باكر",
            FR: "Aube",
            EN: "Dawn",
        }
    ],
    ThirdHour: [
        [],
        [19, 22, 23, 25, 28, 29, 33, 40, 42, 44, 45, 46],
        {
            AR: "الساعة الثالثة",
            FR: "3ème heure",
            EN: "Third Hour",
        }
    ],
    SixthHour: [
        [],
        [53, 56, 60, 62, 66, 69, 83, 84, 85, 86, 90, 92],
        {
            AR: "الساعة السادسة",
            FR: "6ème heure",
            EN: "6th Hour",
        }
    ],
    NinethHour: [
        [],
        [95, 96, 97, 98, 99, 100, 109, 111, 112, 114, 115],
        {
            AR: "الساعة التاسعة",
            FR: "9ème heure",
            EN: "9th Hour",
        }
    ],
    EleventhHour: [
        [],
        [116, 117, 119, 120, 121, 122, 124, 25, 26, 27, 28],
        {
            AR: "الساعة الحادية عشر (الغروب)",
            FR: "11ème heure",
            EN: "11th Hour",
        }
    ],
    TwelvethHour: [
        [],
        [129, 130, 131, 132, 136, 137, 140, 141, 145, 146, 147],
        {
            AR: "الساعة الثانية عشر (النوم)",
            FR: "12ème heure",
            EN: "12th Hour",
        }
    ],
    MidNightHour: [
        [],
        [14, 17, 20, 29, 72, 74, 101, 102, 118],
        {
            AR: "صلاة نصف الليل",
            FR: "Minuit",
            EN: "Mid Night",
        }
    ]
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
    KiahkWeek1: "Kiahk1",
    KiahkWeek2: "Kiahk2",
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
    theTwentyNinethOfCopticMonth: "000000", //This value will be set to copticDate by setCopticDates() if today is 29th of the Coptic month and we are in a month where this feast is celebrated
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
    StJohnBaptist: "0201",
    FourCelestialBeings: "0803",
    TwentyFourPriests: "2403",
    StMaykel: "1203",
    StGabriel: "1310",
    StRaphael: "0313",
    StSourial: "2705",
    StMarc: "3008",
    StSteven: "0105",
    StSergeBacchus: "",
    StGeorge: "2708",
    StMina: "1503",
    StTheodor: "",
    StPhilopatir: "2503",
    StCome: "",
    OneHudredTwentyFourThousands: "",
    AbakirAndJohn: "",
    StDamienne: "",
    StBarbara: "",
    StMarina: "",
    StAnton: "2205",
    StBishoy: "",
    StShenoute: "",
    StTeji: "",
    StPersoma: "",
    StCyrilVI: "3004",
    StBishoyKamel: "1207",
    StMikaelMetropolis: "",
    StJustAnton: "", //St Just of the St. Anton
};
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
    copticFeasts.EntryToTemple,
], lordFeasts = [...lordGreatFeasts, ...lordMinorFeasts], HolyWeek = [
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
    [Prefix.praxisResponse, "PraxisResponsesPrayersArray", PraxisResponsesPrayersArray],
    [Prefix.massCommon, "MassCommonPrayersArray", MassCommonPrayersArray],
    [Prefix.commonPrayer, "CommonPrayersArray", CommonPrayersArray],
    [Prefix.massStBasil, "MassStBasilPrayersArray", MassStBasilPrayersArray],
    [Prefix.massStCyril, "MassStCyrilPrayersArray", MassStCyrilPrayersArray],
    [Prefix.massStGregory, "MassStGregoryPrayersArray", MassStGregoryPrayersArray],
    [Prefix.massStJohn, "MassStJohnPrayersArray", MassStJohnPrayersArray],
    [Prefix.doxologies, "DoxologiesPrayersArray", DoxologiesPrayersArray],
    [Prefix.communion, "CommunionPrayersArray", CommunionPrayersArray],
    [Prefix.cymbalVerses, "CymbalVersesPrayersArray", CymbalVersesPrayersArray],
    [Prefix.bookOfHours, "BookOfHoursPrayersArray", BookOfHoursPrayersArray],
    [Prefix.HolyWeek, "HolyWeekPrayersArray", HolyWeekPrayersArray],
    [Prefix.incenseDawn, "IncensePrayersArray", IncensePrayersArray],
    [Prefix.incenseVespers, "IncensePrayersArray", IncensePrayersArray],
    [Prefix.commonIncense, "IncensePrayersArray", IncensePrayersArray],
    [Prefix.gospelMass, "ReadingsArrays.GospelMassArray", ReadingsArrays.GospelMassArray],
    [Prefix.gospelDawn, "ReadingsArrays.GospelDawnArray", ReadingsArrays.GospelDawnArray],
    [Prefix.gospelVespers, "ReadingsArrays.GospelVespersArray", ReadingsArrays.GospelVespersArray],
    [Prefix.gospelNight, "ReadingsArrays.GospelNightArray", ReadingsArrays.GospelNightArray],
    [Prefix.stPaul, "ReadingsArrays.StPaulArray", ReadingsArrays.StPaulArray],
    [Prefix.katholikon, "ReadingsArrays.KatholikonArray", ReadingsArrays.KatholikonArray],
    [Prefix.praxis, "ReadingsArrays.PraxisArray", ReadingsArrays.PraxisArray],
    [Prefix.synaxarium, "ReadingsArrays.SynaxariumArray", ReadingsArrays.SynaxariumArray],
    [Prefix.psalmody, "PsalmodyPrayersArray", PsalmodyPrayersArray],
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21vZHVsZXMvRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF3QkEsV0FBVztBQUNYLE1BQU0sT0FBTyxHQUFXLHFDQUFxQyxDQUFDO0FBQzlELE1BQU0sV0FBVyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLCtCQUErQjtBQUNoRixNQUFNLFlBQVksR0FBbUIsUUFBUSxDQUFDLGNBQWMsQ0FDMUQsY0FBYyxDQUNHLENBQUM7QUFDcEIsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQW1CLENBQUM7QUFDN0UsTUFBTSxvQkFBb0IsR0FDeEIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM1QyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBbUIsQ0FBQztBQUMvRSxNQUFNLHNCQUFzQixHQUMxQixZQUFZLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzdDLE1BQU0sVUFBVSxHQUFnQixRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRW5FLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFzQixDQUFDO0FBQy9FLE1BQU0sb0JBQW9CLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQy9ELHFCQUFxQixDQUN0QixDQUFDO0FBQ0YsTUFBTSxpQkFBaUIsR0FBdUI7SUFDNUMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO0lBQ3BCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQztJQUNwQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUM7SUFDcEIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO0lBQ3BCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FB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