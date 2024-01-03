//CONSTANTS
const version = "v5.1.5 (Changes to the Book of Hours)";
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
const bookOfHoursLabels = [
    {
        id: "FirstHour",
        AR: "باكر",
        FR: "Aube",
        EN: "Dawn",
    },
    {
        id: "ThirdHour",
        AR: "الساعة الثالثة",
        FR: "3ème heure",
        EN: "Third Hour",
    },
    {
        id: "SixthHour",
        AR: "الساعة السادسة",
        FR: "6ème heure",
        EN: "6th Hour",
    },
    {
        id: "NinethHour",
        AR: "الساعة التاسعة",
        FR: "9ème heure",
        EN: "9th Hour",
    },
    {
        id: "EleventhHour",
        AR: "الساعة الحادية عشر (الغروب)",
        FR: "11ème heure",
        EN: "11th Hour",
    },
    {
        id: "TwelvethHour",
        AR: "الساعة الثانية عشر (النوم)",
        FR: "12ème heure",
        EN: "12th Hour",
    },
    {
        id: "MidNightHour",
        AR: "صلاة نصف الليل",
        FR: "Minuit",
        EN: "Mid Night",
    },
];
const bookOfHours = {
    FirstHourPrayersArray: [],
    FirstHourPrayersSequence: [1, 2, 3, 4, 5, 6, 8, 11, 12, 14, 15, 18, 24, 26, 142],
    ThirdHourPrayersArray: [],
    ThirdHourPrayersSequence: [19, 22, 23, 25, 28, 29, 33, 40, 42, 44, 45, 46],
    SixthHourPrayersArray: [],
    SixthHourPrayersSequence: [53, 52, 60, 62, 66, 69, 83, 84, 85, 86, 90, 92],
    NinethHourPrayersArray: [],
    NinethHourPrayersSequence: [95, 96, 97, 98, 99, 100, 109, 111, 112, 114, 115],
    EleventhHourPrayersArray: [],
    EleventhHourPrayersSequence: [
        116, 117, 119, 120, 121, 122, 124, 25, 26, 27, 28,
    ],
    TwelvethHourPrayersArray: [],
    TwelvethHourPrayersSequence: [
        129, 130, 131, 132, 136, 137, 140, 141, 145, 146, 147,
    ],
    MidNightHourPrayersArray: [],
    MidNightHourPrayersSequence: [14, 17, 20, 29, 72, 74, 101, 102, 118],
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
    psalmodyPrayersArray: PsalmodyPrayersArray,
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
    [Prefix.praxisResponse, "PraxisResponsesPrayersArray"],
    [Prefix.massCommon, "MassCommonPrayersArray"],
    [Prefix.commonPrayer, "CommonPrayersArray"],
    [Prefix.massStBasil, "MassStBasilPrayersArray"],
    [Prefix.massStCyril, "MassStCyrilPrayersArray"],
    [Prefix.massStGregory, "MassStGregoryPrayersArray"],
    [Prefix.massStJohn, "MassStJohnPrayersArray"],
    [Prefix.doxologies, "DoxologiesPrayersArray"],
    [Prefix.communion, "CommunionPrayersArray"],
    [Prefix.cymbalVerses, "CymbalVersesPrayersArray"],
    [Prefix.bookOfHours, "bookOfHoursPrayersArray"],
    [Prefix.HolyWeek, "holyWeekPrayersArray"],
    [Prefix.incenseDawn, "IncensePrayersArray"],
    [Prefix.incenseVespers, "IncensePrayersArray"],
    [Prefix.commonIncense, "IncensePrayersArray"],
    [Prefix.gospelMass, "ReadingsArrays.GospelMassArray"],
    [Prefix.gospelDawn, "ReadingsArrays.GospelDawnArray"],
    [Prefix.gospelVespers, "ReadingsArrays.GospelVespersArray"],
    [Prefix.gospelNight, "ReadingsArrays.GospelNightArray"],
    [Prefix.stPaul, "ReadingsArrays.StPaulArray"],
    [Prefix.katholikon, "ReadingsArrays.KatholikonArray"],
    [Prefix.praxis, "ReadingsArrays.PraxisArray"],
    [Prefix.synaxarium, "ReadingsArrays.SynaxariumArray"],
    [Prefix.psalmody, "PsalmodyPrayersArray"],
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21vZHVsZXMvRGVjbGFyZUdsb2JhbFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF3QkEsV0FBVztBQUNYLE1BQU0sT0FBTyxHQUFXLHVDQUF1QyxDQUFDO0FBQ2hFLE1BQU0sV0FBVyxHQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLCtCQUErQjtBQUNoRixNQUFNLFlBQVksR0FBbUIsUUFBUSxDQUFDLGNBQWMsQ0FDMUQsY0FBYyxDQUNHLENBQUM7QUFDcEIsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQW1CLENBQUM7QUFDN0UsTUFBTSxvQkFBb0IsR0FDeEIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM1QyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBbUIsQ0FBQztBQUMvRSxNQUFNLHNCQUFzQixHQUMxQixZQUFZLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzdDLE1BQU0sVUFBVSxHQUFnQixRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRW5FLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFzQixDQUFDO0FBQy9FLE1BQU0sb0JBQW9CLEdBQWdCLFFBQVEsQ0FBQyxjQUFjLENBQy9ELHFCQUFxQixDQUN0QixDQUFDO0FBQ0YsTUFBTSxpQkFBaUIsR0FBdUI7SUFDNUMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO0lBQ3BCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQztJQUNwQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUM7SUFDcEIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO0lBQ3BCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FB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