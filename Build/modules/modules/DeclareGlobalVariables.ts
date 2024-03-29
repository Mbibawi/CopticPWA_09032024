//TYPES
type typeBtnLabel = {
    AR: string,
    FR: string,
    EN?: string
}
type typeButton = {
    btnID: string, //the id is used to exclude a button from being displayed in certain scenarios: like the Go Back button in some cases
    label: typeBtnLabel, //contains the text (in different languages) that is displayed in the html element created to show the button
    rootID?: string, //not used yet
    parentBtn?: Button, //a button that when clicked our button (which is its child) is displayed
    children?: Button[], //a list of child buttons that are displayed in the left side bar when the button is clicked
    inlineBtns?: Button[], //a list of button that are shown in the main area above the text (the buttons in the children[] list of buttons are shown in the left side-bar)
    prayersSequence?: string[], //the sequence of prayers that will be dispolayed when the button is clicked. Each "prayer" is a string representing an id (the id corresponds to the title of one of tables in the Word document from which the text was extracted). A function loops the prayersArray (see below) and looks for an array of string[][] which 1st element is = to the "prayer". If it finds it, the text is retrieved and shown in html elements 
    prayersArray?: string[][][], //an array containing all the Word tables retrived from the Word document. Each table is a string[][], where each string[] element is a row of the table. Each row is structred like ['prayer id', 'prayer text in a given language', 'prayer text in another language', etc.]. prayersArray is the array where the text of the button's prayers will be looked for when the button is clicked.
    titlesArray?:string[][], //an array that contains the prayers which id ends with 'Title'
    retrieved?:boolean, //not used any more but kept in case
    languages?: string[], //the list of languages in which the prayers that will be shown by the button are available (for example, the button showing the gospel will not have the coptic language in its languages[] because the text extracted from the ppt slides was only available in Arabic, French and English)
    onClick?: Function, //a function that is called when the html element created for the button is clicked
    afterShowPrayers?: Function, //a function that will be called after the prayers of the button are processed and appended as html children of containerDiv
    value?: string, //not used
    cssClass?: string, //the CSS class that will be added to the html element created to display the button
    showPrayers?: boolean; //Tells whether to show the button's prayers when it is clicked. We need it in some scenarios where the button.onClick() function calls showPrayers(), and we don't hence need showChildButtonsOrPrayers() to call it again
    pursue?: boolean; //this is a boolean that will tell the showchildButtonsOrPrayers() whether to continue after calling the onClick() property of the button
    docFragment?: DocumentFragment;
    any?: any
};
//CONSTANTS
const version: string = 'v4.9.5 (added the readings of 1703)';
const calendarDay: number = 24 * 60 * 60 * 1000; //this is a day in milliseconds
const containerDiv: HTMLDivElement = document.getElementById('containerDiv') as HTMLDivElement;
const leftSideBar: HTMLElement = document.getElementById('leftSideBar');
const rightSideBar: HTMLElement = document.getElementById('rightSideBar');
const contentDiv: HTMLElement = document.getElementById('content');
const sideBarBtn = document.getElementById('opensidebar') as HTMLButtonElement;
const toggleDevBtn = document.getElementById('toggleDev') as HTMLButtonElement;
const inlineBtnsDiv: HTMLElement = document.getElementById('inlineBtnsContainer');
const ResurrectionDates: string[] = ['2022-04-24', '2023-04-16', '2024-05-05', '2025-04-29', '2026-04-12', '2027-05-02', '2028-04-23', '2029-04-8', '2030-04-28']; // these are  the dates of the Ressurection feast caclulated from the end of the Jewish Pessah Feast as got from Google
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
    propheciesDawn: "RPD_", //Stands for Readings Prophecies Dawn 
    stPaul: "RSP_", //Stands for Readings St Paul
    katholikon: "RK_", //Stands for Readings Katholikon
    praxis: "RP_", //Stands for Readings Praxis
    gospelVespers: "RGIV_", //Stands for Readings Gospel Incense Vespers
    gospelDawn: "RGID_", //Stands for Redings Gospel Incense Dawn
    gospelMass: "RGM_", //Readings Gospel Mass
    gospelNight: "RGN_", //Stands for Readings Gospel Night
    synaxarium: "RS_", //Stands for Readings Synaxarium
    cymbalVerses: "CV_", //Stands for Cymbal Verses
    bookOfHours: "BOH_", //Stands for Book Of Prayers
};

const btnClass = 'sideBarBtn';
const inlineBtnClass = 'inlineBtn';
const ReadingsIntrosAndEnds = {
    gospelIntro: {
        AR: 'قفوا بخوف أمام الله وانصتوا لنسمع الإنجيل المقدس، فصل من بشارة الإنجيل لمعلمنا مار (....) البشير، والتلميذ الطاهر، بركاته على جميعنا',
        FR:'Levons-nous avec crainte de Dieu pour écouter le Saint Évangile. Lecture du Saint évangile selon Saint (....), Que sa bénédiction soit sur nous tous, Amen !',
    },
    gospelEnd: {
        AR: 'والمجد لله دائماً',
        FR: 'Gloire à Dieu éternellement, Amen !',
    },
    stPaulIntro: {
        AR:  'البولس فصل من رسالة معلمنا بولس الرسول  (الأولى/الثانية) إلى (......)، بركته على جميعنا آمين',
        FR: 'Lecture de l’Epître de Saint Paul à () que sa bénédiction soit sur nous tous, Amen!',
        EN:'',
    },
    stPaulEnd: {
        AR:  'نعمة الله الآب فلتكن معكم يا آبائي واختوي آمين.',
        FR: 'Que la grâce de Dieu soit avec vous tous, mes père et mes frères, Amen!',
        EN:'',
    },
    katholikonIntro: {
        AR: 'الكاثوليكون، فصل من رسالة القديس (الأولى/الثانية/الثالثة)  بركته على جميعنا آمين',
        FR: 'Katholikon, (1ère/2ème/3ème) épître à l’Église Universelle de notre père St.(....), que sa bénédiction repose sur nous tous, Amen!',
        EN:'',
    },
    katholikonEnd: {
        AR: 'لا تحبو العالم ولا الأشياء التي في العالم لأن العالم يمضي وشهوته معه أما من يصنع مشيئة الله فيثبت إلى الأبد',
        FR: 'N’aimez pas le monde et ce qui est dans le monde, le monde passe, lui et sa convoitise, mais celui qui fait la volonté de Dieu demeure à jamais. Amen !',
        EN:'',
    },
    psalmIntro: {
        AR: 'من مزامير تراتيل أبيناداوود النبي والملك، بركاته على جميعنا آمين.',
        FR: 'Psaume de notre père David, le prophète et le roi, que sa bénédiction soit sur nous tous, Amen!',
        EN:''
    },
    psalmEnd: {
        AR: 'هلليلويا',
        FR: '',
    },
    praxisIntro: {
        AR: 'الإبركسيس فصل من أعمال آبائنا الرسل الأطهار، الحوارين، المشمولين بنعمة الروح القدس، بركتهم المقدسة فلتكن معكم يا آبائي واخوتي آمين.',
        FR: 'Praxis, Actes de nos pères les apôtres, que leurs saintes bénédictions reposent sur nous. Amen!',
        EN:'',
    },
    praxisEnd: {
        AR: 'لم تزل كلمة الرب تنمو وتعتز وتكثر في هذا البيعة وكل بيعة يا آبائي وإخوتي آمين.',
        FR: 'La parole du Seigneur croît, se multiplie et s’enracine dans la sainte Église de Dieu. Amen!',
        EN:'',
    },
    synaxariumIntro:  {
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
    StMaryFast: 'StMFast', //stands for Saint Mary Feast
    Kiahk: 'Kiahk',
    NativityFast: 'NF', //(from 16 Hatour until 28 Kiahk included) stands for Nativity Fast
    Nativity: 'Nat', //from 28 Kiahk afternoon to 6 Toubi
    Baptism:'Ba', //from 10 Toubi until 12 Toubi 
    GreatLent: 'GL', // Stand for Great Lent
    HolyWeek: 'HW', //Stands for Holy Week
    PentecostalDays: 'Pntl', //(from the Holy Saturday Afternoon, until the 7th Sunday)  Stands for Pentecostal Days
    JonahFast: 'Jonah', //Stands for Jonah Feast
    ApostlesFast: 'Apost', //Stands for Apostles Feast
    Nayrouz: 'Nay', //Stands for Nayrouz
    CrossFeast: 'Cross', //Stands for Cross Feast
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
    OneHudredTwentyFourThousands: '', //The 144000 chast
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
    StMikaelMetropolis: '',//St Mikhael the Metropolis of Assiut
    StJustAnton:'' //St Just of the St. Anton
};
const foreingLanguage:string = 'FR'
const allLanguages: string[] = ['AR', foreingLanguage, 'COP', 'CA', 'CF', 'EN'];//AR = Arabic, FR = French, COP = Coptic, CA = Coptic in Arabic characters, CF = Coptic in French characters, EN = English
const userLanguages: string[] = ['AR', foreingLanguage, 'COP'];
//if (localStorage.userLanguages) { console.log('there is user Lanugages', localStorage.userLanguages) };
//if (localStorage.showActors) { console.log('there is showActors', localStorage.showActors) };
if (localStorage.userLanguages === undefined) { localStorage.userLanguages = JSON.stringify(userLanguages) }; //We check that there isn't already a setting stored in the localStorage
const prayersLanguages: string[] = ['COP', foreingLanguage, 'CA', 'AR'];
const readingsLanguages: string[] = ['AR', foreingLanguage, 'EN'];
const displayModes = ['Normal', 'Presentation', 'Priest'];

const CommonPrayersArray: string[][][] = []; //an array in which we will group all the common prayers of all the liturgies. It is a subset o PrayersArray
const MassCommonPrayersArray: string[][][] = [];//an array in which we will save the commons prayers specific to the mass (like the Assembly, Espasmos, etc.)
const MassStBasilPrayersArray: string[][][] = [],
        MassStGregoryPrayersArray: string[][][] = [],
        MassStCyrilPrayersArray: string[][][] = [],
        MassStJohnPrayersArray: string[][][] = [],
        FractionsPrayersArray: string[][][] = [],
        DoxologiesPrayersArray: string[][][] = [],
        IncensePrayersArray: string[][][] = [],
        CommunionPrayersArray: string[][][] = [],
        PsalmAndGospelPrayersArray: string[][][] = [],
        CymbalVersesPrayersArray: string[][][] = [],
        PraxisResponsesPrayersArray: string[][][] = [],
        bookOfHoursPrayersArray: string[][][] = [];
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
    bookOfHoursPrayersArray];

const
    lordGreatFeasts = [
        copticFeasts.Annonciation,
        copticFeasts.Nativity,
        copticFeasts.Baptism,
        copticFeasts.PalmSunday,
        copticFeasts.Resurrection,
        copticFeasts.Ascension,
        copticFeasts.Pentecoste
    ],

    lordMinorFeasts = [
        copticFeasts.Epiphany,
        copticFeasts.Circumcision,
        copticFeasts.EntryToEgypt,
        copticFeasts.EntryToTemple
    ],
    
    lordFeasts = [
        ...lordGreatFeasts,
        ...lordMinorFeasts
    ],

    HolyWeek = [
        copticFeasts.HolyMonday,
        copticFeasts.HolyTuseday,
        copticFeasts.HolyWednsday,
        copticFeasts.HolyThursday,
        copticFeasts.HolyFriday,
    ],
    textAmplified = new Map();
//VARS
let PrayersArray: string[][][] = []; 
let lastClickedButton: Button;
let selectedDate: number, //This is the date that the user might have manually selected
    copticDate: string, //The Coptic date is stored in a string not in a number like the gregorian date, this is to avoid complex calculations
    copticMonth: string, //same comment as above
    copticDay: string, //same comment as above
    copticReadingsDate: string, //This is the date of the day's readings (gospel, Katholikon, praxis, etc.). It does not neceissarly correspond to the copticDate
    Season: string, //This is a value telling whether we are during a special period of the year like the Great Lent or the 50 Pentecostal days, etc.
    weekDay: number; //This is today's day of the week (Sunday, Monday, etc.) expressed in number starting from 0
var todayDate: Date;
let isFast: boolean;
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
let showActors = new Map();
actors.map(actor => showActors.set(actor, true));
showActors.set(actors[3], false);//this is in order to initiate the app without the comments displayed. The user will activate it from the settings if he wants
showActors.set(actors[4], false); //same comment as above concerning the 'CommentText'
if (localStorage.showActors === undefined) { localStorage.showActors = JSON.stringify(Array.from(showActors)) };
allLanguages.map(lang => textAmplified.set(lang, false));
if (localStorage.textAmplified === undefined) { localStorage.textAmplified = JSON.stringify(Array.from(textAmplified)) };
if (localStorage.displayMode === 'undefined') {
    localStorage.displayMode = displayModes[0];
};



