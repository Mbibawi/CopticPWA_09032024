//TYPES
type typeBtnLabel = {
  AR?: string;
  FR?: string;
  EN?: string;
};
type typeButton = {
  btnID: string; //the id is used to exclude a button from being displayed in certain scenarios: like the Go Back button in some cases
  label: typeBtnLabel; //contains the text (in different languages) that is displayed in the html element created to show the button
  parentBtn?: Button; //a button that when clicked our button (which is its child) is displayed
  children?: Button[]; //a list of child buttons that are displayed in the left side bar when the button is clicked
  inlineBtns?: Button[]; //a list of button that are shown in the main area above the text (the buttons in the children[] list of buttons are shown in the left side-bar)
  prayersSequence?: string[]; //the sequence of prayers that will be dispolayed when the button is clicked. Each "prayer" is a string representing an id (the id corresponds to the title of one of tables in the Word document from which the text was extracted). A function loops the prayersArray (see below) and looks for an array of string[][] which 1st element is = to the "prayer". If it finds it, the text is retrieved and shown in html elements
  prayersArray?: string[][][]; //an array containing all the Word tables retrived from the Word document. Each table is a string[][], where each string[] element is a row of the table. Each row is structred like ['prayer id', 'prayer text in a given language', 'prayer text in another language', etc.]. prayersArray is the array where the text of the button's prayers will be looked for when the button is clicked.
  retrieved?: boolean; //not used any more but kept in case
  languages?: string[]; //the list of languages in which the prayers that will be shown by the button are available (for example, the button showing the gospel will not have the coptic language in its languages[] because the text extracted from the ppt slides was only available in Arabic, French and English)
  onClick?: Function; //a function that is called when the html element created for the button is clicked
  afterShowPrayers?: Function; //a function that will be called after the prayers of the button are processed and appended as html children of containerDiv
  cssClass?: string; //the CSS class that will be added to the html element created to display the button
  showPrayers?: boolean; //Tells whether to show the button's prayers when it is clicked. We need it in some scenarios where the button.onClick() function calls showPrayers(), and we don't hence need showChildButtonsOrPrayers() to call it again
  pursue?: boolean; //this is a boolean that will tell the showchildButtonsOrPrayers() whether to continue after calling the onClick() property of the button
  docFragment?: DocumentFragment;
  any?: any;
};
//CONSTANTS
const version: string =
  "v5.6.7 (Fixes to the Great Lent calculation, + some CSS)";
const calendarDay: number = 24 * 60 * 60 * 1000; //this is a day in milliseconds
const containerDiv: HTMLDivElement = document.getElementById(
  "containerDiv") as HTMLDivElement;
const leftSideBar = document.getElementById("leftSideBar") as HTMLDivElement;
const sideBarBtnsContainer: HTMLDivElement =
  leftSideBar.querySelector("#sideBarBtns");
const rightSideBar = document.getElementById("rightSideBar") as HTMLDivElement;
const sideBarTitlesContainer: HTMLDivElement =
  rightSideBar.querySelector("#sideBarBtns");
const contentDiv: HTMLElement = document.getElementById("content");

const toggleDevBtn = document.getElementById("toggleDev") as HTMLButtonElement;
const expandableBtnsPannel: HTMLElement = document.getElementById(
  "inlineBtnsContainer"
);
const ResurrectionDates: number[][] = [
  [2019, 4, 28],
  [2020, 4, 19],
  [2021, 5, 2],
  [2022, 4, 24],
  [2023, 4, 16],
  [2024, 5, 5],
  [2025, 4, 20],
  [2026, 4, 12],
  [2027, 5, 2],
  [2028, 4, 16],
  [2029, 4, 8],
  [2030, 4, 28],
  [2031, 4, 13],
  [2032, 5, 2],
  [2033, 4, 24],
  [2034, 4, 9],
  [2035, 4, 29],
  [2036, 4, 20],
  [2037, 4, 5],
  [2038, 4, 25],
  [2039, 4, 17],
  [2040, 5, 6],
  [2041, 4, 21],
  [2042, 4, 13],
  [2043, 5, 3],
  [2044, 4, 24],
  [2045, 4, 9],
  [2046, 4, 29],
  [2047, 4, 21],
  [2048, 4, 5],
  [2049, 4, 25],
  [2050, 4, 17],
]; // these are  the dates of the Ressurection feast got from خدمة الشماس والألحان للمعلم فرج عبد المسيح الطبعة 14 سنة 2019

const copticMonths: { AR: string; FR: string; EN: string }[] = [
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
  HolyWeek: "HW_", //Stands for Holy Week
  placeHolder: "PlaceHolder_",
  psalmody: "Psalmody_",
  prayersArray: 'PrayersArray_',
};
const plusCharCode: number = 10133;
const btnClass = "sideBarBtn";
const eighthNoteCode: number = 9834;
const beamedEighthNoteCode: number = 9835;
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

const bookOfHours: {
  //The 1st element of each hour is a sequence representing the number of psalms in their order (eg.: [10, 11, 12, etc.] which means, Psalm 10, Psalm 11, Psalm 12, etc.). The 2nd element is the label of the button that will be created for this hour
  FirstHour: [number[], typeBtnLabel];
  ThirdHour: [number[], typeBtnLabel];
  SixthHour: [number[], typeBtnLabel];
  NinethHour: [number[], typeBtnLabel];
  EleventhHour: [number[], typeBtnLabel];
  TwelvethHour: [number[], typeBtnLabel];
  VeilHour: [number[], typeBtnLabel];
  MidNight1Hour: [number[], typeBtnLabel];
  MidNight2Hour: [number[], typeBtnLabel];
  MidNight3Hour: [number[], typeBtnLabel]
} = {
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
  PraxisArrayFR: [] as string[][][],
  KatholikonArrayFR: [] as string[][][],
  StPaulArrayFR: [] as string[][][],
  SynaxariumArrayFR: [] as string[][][],
  GospelMassArrayFR: [] as string[][][],
  GospelVespersArrayFR: [] as string[][][],
  GospelDawnArrayFR: [] as string[][][],
  GospelNightArrayFR: [] as string[][][],
  PropheciesDawnArrayFR: [] as string[][][],
};
const Seasons = {
  //Seasons are periods of more than 1 day, for which we have specific prayers (e.g.: cymbal verses, doxologies, praxis response, etc.)
  StMaryFast: "StMFast", //stands for Saint Mary Feast
  Nayrouz: "Nay", //Stands for Nayrouz from 1 Tout to 16 Tout
  NativityFast: "NF", //(from 16 Hatour until 28 Kiahk included) stands for Nativity Fast
  Kiahk: "Khk", //The whole month of Kiahk
  KiahkWeek1: "Khk1", //1st Week of Kiahk
  KiahkWeek2: "Khk2", //2nd Week of Kiahk
  KiahkWeek3: "Khk3", //3rd Week of Kiahk
  KiahkWeek4: "Khk4", //4th Week of Kiahk
  NativityParamoun: "NP", //either 2804 before 3 PM or 26, 27 and 2804 if 2904 is a Monday, or 27 and 28 if 2904 is a Sunday
  Nativity: "Nat", //from 28 Kiahk afternoon to 6 Toubi
  BaptismParamoun: "BP", //If the Baptism Feast comes a Monday or a Sunday , the Baptism Paramoun is 3 or 2 days
  Baptism: "Ba", //from 11 Toubi until 12 Toubi
  GreatLent: "GL", // Stand for Great Lent
  HolyWeek: "HW", //Stands for Holy Week
  PentecostalDays: "Pntl", //(from the Holy Saturday Afternoon, until the 7th Sunday)  Stands for Pentecostal Days
  JonahFast: "JFast", //Stands for Jonah Feast
  JonahFeast: "JFeast", //Stands for Jonah Feast
  ApostlesFast: "Apost", //Stands for Apostles Feast
  CrossFeast: "Cross", //Stands for Cross Feast
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
  PalmSunday: Seasons.GreatLent + "7thSunday",
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
  OneHudredTwentyFourThousands: "", //The 144000 chast
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
  StMikaelMetropolis: "", //St Mikhael the Metropolis of Assiut
  StJustAnton: "", //St Just of the St. Anton
};

const AngelsFeasts: string[] = [
  saintsFeasts.StMaykel,
  saintsFeasts.StGabriel,
  saintsFeasts.StRaphael,
  saintsFeasts.StSourial,
];

const martyrsFeasts: string[] = [];

const nonCopticLanguages = [['AR', 'Arabic'], ['FR', 'French'], ['EN', 'English']];
const copticLanguages = [['COP', 'Coptic'], ['CA', 'قبطي مُعَرَبْ'], ['CF', 'Copte en charachères français']];
const allLanguages: string[][] = [...nonCopticLanguages, ...copticLanguages];




var defaultLanguage: string = setLanguage(0, 'your default', nonCopticLanguages) || 'AR';
var foreingLanguage: string = setLanguage(1, 'a foreign', nonCopticLanguages);
var copticLanguage: string = setLanguage(2, 'the characters in which you want the coptic text to be displayed', copticLanguages);


localStorage.userLanguages = JSON.stringify([defaultLanguage, foreingLanguage, copticLanguage]);//We do this in case it has been changed


function setLanguage(index: number, text: string, languages: string[][]): string {
  let userLanguages: string[] = [];

  if (localStorage.userLanguages) userLanguages = JSON.parse(localStorage.userLanguages) as string[];

  if (userLanguages[index]) return userLanguages[index];//We return the value storaged in the localStorage if it is null. When it is null, it means that the user had willingly ignored setting the foreign language when he installed the app for the first time. We do this for any other language than the default language because it must be set.

  if (index > 0 && userLanguages[index] === null) return userLanguages[index];

  let choices = languages.map(lang => lang[1]);

  if (defaultLanguage && index < 2) choices.splice(choices.indexOf(languages.find(lang => lang[0] === defaultLanguage)[1]), 1)//If the function is called while the defaultLanguage was set, we remove the chosen language from the list


  let choice = prompt('Choose ' + text + ' language from the following: ', choices.join(', '));

  if (!choice || !choices.includes(choice)) return undefined;


  let found = allLanguages.find(lang => lang[1] === choice);
  if (!found) return undefined;

  userLanguages[index] = found[0];
  return userLanguages[index];

}

const prayersLanguages: string[] = ["COP", "FR", "CA", "AR"];
const readingsLanguages: string[] = ["AR", "FR", "EN"];

var lastScrollTop: number = 0;

const displayModes = ["Normal", "Presentation", "Priest"];

const CommonPrayersArray: string[][][] = []; //an array in which we will group all the common prayers of all the liturgies. It is a subset o PrayersArray
const MassCommonPrayersArray: string[][][] = []; //an array in which we will save the commons prayers specific to the mass (like the Assembly, Espasmos, etc.)
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
  BookOfHoursPrayersArray: string[][][] = [],
  HolyWeekPrayersArray: string[][][] = [],
  PsalmodyPrayersArray: string[][][] = [];
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
],
  MinorLordFeasts = [
    copticFeasts.Epiphany,
    copticFeasts.Circumcision,
    copticFeasts.CanaWedding,
    copticFeasts.EntryToEgypt,
    copticFeasts.EntryToTemple,
  ],
  lordFeasts = [...GreatLordFeasts, ...MinorLordFeasts],
  HolyWeek = [
    copticFeasts.HolyMonday,
    copticFeasts.HolyTuseday,
    copticFeasts.HolyWednsday,
    copticFeasts.HolyThursday,
    copticFeasts.HolyFriday,
  ],
  textAmplified = [];
//VARS
let PrayersArrayFR: string[][][] = [];
let lastClickedButton: Button;
let selectedDate: number, //This is the date that the user might have manually selected
  copticDate: string, //The Coptic date is stored in a string not in a number like the gregorian date, this is to avoid complex calculations
  copticMonth: string, //same comment as above
  copticDay: string, //same comment as above
  copticYear: string, //same comment as above
  copticReadingsDate: string, //This is the date of the day's readings (gospel, Katholikon, praxis, etc.). It does not neceissarly correspond to the copticDate
  Season: string, //This is a value telling whether we are during a special period of the year like the Great Lent or the 50 Pentecostal days, etc.
  weekDay: number; //This is today's day of the week (Sunday, Monday, etc.) expressed in number starting from 0
var todayDate: Date;
let isFast: boolean;
type Actor = { EN: string; FR?: string; AR?: string };

let actors: Actor[] = [
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
const PrayersArraysKeys: [string, string, Function][] = [
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
    "ReadingsArrays.GospelMassArrayFR",
    () => ReadingsArrays.GospelMassArrayFR,
  ],
  [
    Prefix.gospelDawn,
    "ReadingsArrays.GospelDawnArrayFR",
    () => ReadingsArrays.GospelDawnArrayFR,
  ],
  [
    Prefix.gospelVespers,
    "ReadingsArrays.GospelVespersArrayFR",
    () => ReadingsArrays.GospelVespersArrayFR,
  ],
  [
    Prefix.gospelNight,
    "ReadingsArrays.GospelNightArrayFR",
    () => ReadingsArrays.GospelNightArrayFR,
  ],
  [
    Prefix.stPaul,
    "ReadingsArrays.StPaulArrayFR",
    () => ReadingsArrays.StPaulArrayFR,
  ],
  [
    Prefix.katholikon,
    "ReadingsArrays.KatholikonArrayFR",
    () => ReadingsArrays.KatholikonArrayFR,
  ],
  [
    Prefix.praxis,
    "ReadingsArrays.PraxisArrayFR",
    () => ReadingsArrays.PraxisArrayFR,
  ],

  [
    Prefix.synaxarium,
    "ReadingsArrays.SynaxariumArrayFR",
    () => ReadingsArrays.SynaxariumArrayFR,
  ],
  [
    Prefix.propheciesDawn,
    "ReadingsArrays.PropheciesDawnArrayFR",
    () => ReadingsArrays.PropheciesDawnArrayFR,
  ],
  [Prefix.psalmody, "PsalmodyPrayersArray", () => PsalmodyPrayersArray],
  [Prefix.prayersArray, 'PrayersArrayFR', () => PrayersArrayFR],
];
