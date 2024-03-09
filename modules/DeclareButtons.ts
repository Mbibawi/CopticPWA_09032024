class Button {
  private _btnID: string;
  private _label: typeBtnLabel;
  private _parentBtn: Button;
  private _children: Button[];
  private _prayersSequence: string[];
  private _retrieved: boolean = false;
  private _prayersArray: string[][][];
  private _languages: string[];
  private _onClick: Function;
  private _afterShowPrayers: Function;
  private _cssClass: string;
  private _showPrayers: boolean;
  private _docFragment: DocumentFragment;



  constructor(btn: typeButton) {
    this._btnID = btn.btnID;
    this._label = btn.label;
    this._parentBtn = btn.parentBtn;
    this._children = btn.children;
    this._prayersSequence = btn.prayersSequence;
    this._retrieved = btn.retrieved;
    this._prayersArray = btn.prayersArray;
    this._languages = btn.languages;
    this._onClick = btn.onClick;
    this._afterShowPrayers = btn.afterShowPrayers;
    this._showPrayers = btn.showPrayers;
    this._docFragment = btn.docFragment;
    btn.cssClass
      ? (this._cssClass = btn.cssClass)
      : (this._cssClass = btnClass);
  }
  //Getters
  get btnID() {
    return this._btnID;
  }
  get children() {
    return this._children;
  }
  get prayersSequence() {
    return this._prayersSequence;
  }
  get retrieved() {
    return this._retrieved;
  }
  get prayersArray() {
    return this._prayersArray;
  }
  get languages() {
    return this._languages;
  }
  get label() {
    return this._label;
  }
  get parentBtn() {
    return this._parentBtn;
  }
  get onClick() {
    return this._onClick;
  }
  get afterShowPrayers() {
    return this._afterShowPrayers;
  }
  get showPrayers() {
    return this._showPrayers;
  }
  get cssClass() {
    return this._cssClass;
  }
  get docFragment() {
    return this._docFragment;
  }

  //Setters
  set btnID(id) {
    this._btnID = id;
  }
  set label(lbl: typeBtnLabel) {
    this._label = lbl;
  }
  set parentBtn(parentBtn: Button) {
    this._parentBtn = parentBtn;
  }
  set prayersSequence(btnPrayers: string[]) {
    this._prayersSequence = btnPrayers;
  }
  set retrieved(retrieved) {
    this._retrieved = retrieved;
  }
  set prayersArray(btnPrayersArray: string[][][]) {
    this._prayersArray = btnPrayersArray;
  }
  set languages(btnLanguages: string[]) {
    this._languages = btnLanguages;
  }
  set onClick(fun: Function) {
    this._onClick = fun;
  }
  set afterShowPrayers(fun: Function) {
    this._afterShowPrayers = fun;
  }
  set showPrayers(showPrayers: boolean) {
    this._showPrayers = showPrayers;
  }
  set children(children: Button[]) {
    this._children = children;
  }
  set cssClass(cssClass: string) {
    this._cssClass = cssClass;
  }

  set docFragment(docFragment: DocumentFragment) {
    this._docFragment = docFragment;
  }
}

const btnMainMenu: Button = new Button({
  btnID: "btnMain",
  label: {
    AR: "العودة إلى القائمة الرئيسية",
    FR: "Retour au menu principal",
    EN: "Back to the main menu",
  },
  onClick: () => {
    btnMainMenu.children = [
      btnMass,
      btnIncenseOffice,
      btnDayReadings,
      btnBookOfHours,
      btnPsalmody,
    ];

    if (Season === Seasons.HolyWeek) btnMainMenu.children = [
      btnHolyWeek(), btnMass, btnBookOfHours
    ]

    function btnHolyWeek(): Button {
      //The buttons tree is structured this way: btnMaster=> btnPassOver=> [btnDay, btnEvening]=>[btn1stHour, btn3rdHour, etc.]
      let btnPassOver = new Button({
        btnID: 'btnPassover',
        label: { AR: 'البصخة المقدسة', FR: 'Pessah' },
        onClick: () => btnPassOver.children = [getDayAndEveningBtns('D'), getDayAndEveningBtns('E')].filter(btn => btn),//We remove undefined elements
      });//btnPassOver shows Day and Evening buttons

      let btnMaster = new Button({
        btnID: 'btnHolyWeek',
        label: { AR: 'طقس اسبوع الآلام', FR: 'Rite de la semaine sainte' },
        children: [btnPassOver]
      });

      return btnMaster;//btnMaster shows btnPassOver

      function getDayAndEveningBtns(shift: string) {
        if (shift === 'E' && todayDate.getDay() === 5) return undefined;
        if (shift === 'D' && [0, 6].includes(todayDate.getDay())) return undefined;

        let labels: [string, typeBtnLabel][] = [
          ['D', { AR: 'بصخة الصباح', FR: 'Matin' }], ['E', { AR: 'بصخة المساء', FR: 'Soir' }]];

        let btn = new Button({
          btnID: 'btnPassover' + shift,
          label: labels.find(lable => lable[0] === shift)[1],
          parentBtn: btnPassOver,
          onClick: () => btn.children = getPassoverHoursBtns(shift, btn),
        });
        return btn;//btn shows a btn for each hour according to whether we are in the 'Day' or 'Evening' Passover liturgy
      }

      function getPassoverHoursBtns(shift: string, btn: Button): Button[] {
        if (btn.children) return;
        let days: [string, string, string][] =
          [
            ['Sunday', 'الأحد', 'dimanche'],
            ['Monday', 'الإثنين', 'lundi'],
            ['Tuesday', 'الثلاثاء', 'mardi'],
            ['Wednesday', 'الأربعاء', 'mercredi'],
            ['Thursday', 'الخميس', 'jeudi'],
            ['Friday', 'الجمعة', 'vendredi'],
            ['Saturday', 'السبت', 'samedi'],
          ];


        let dayPrayers = ReadingsArrays.GospelNightArrayFR.filter(table =>
          table[0][0].startsWith(Prefix.HolyWeek)
          &&
          table[0][0].includes('&D=' + copticReadingsDate));


        let hours: { prefix: string, lable: typeBtnLabel }[] = [
          {
            prefix: '1H',
            lable: { AR: 'الأولى', FR: 'Première heure' }
          },
          {
            prefix: '3H',
            lable: { AR: 'الساعة الثالثة', FR: 'Troisième heure' }
          },
          {
            prefix: '6H',
            lable: { AR: 'الساعة السادسة', FR: 'Sixième heure' }
          },
          {
            prefix: '9H',
            lable: { AR: 'الساعة التاسعة', FR: 'Neuvième heure' }
          },
          {
            prefix: '11H',
            lable: { AR: 'الساعة الحادية عشر', FR: 'Onzième heure' }
          },
          {
            prefix: '12H',
            lable: { AR: 'الساعة الثانية عشر', FR: 'Douzième heure' }
          },
        ];

        hours.forEach(hour => {
          if (shift === 'D') {
            hour.lable.AR += ' من يوم ' + days[todayDate.getDay()][1];
            hour.lable.FR += ' du ' + days[todayDate.getDay()][2];
          }
          else {
            hour.lable.AR += ' من ليلة ' + days[todayDate.getDay() + 1][1];
            hour.lable.FR += ' de la veille du ' + days[todayDate.getDay() + 1][2];
          }
        })

        return hours.map(hour => createHourBtn(hour.prefix, hour.lable, dayPrayers)).filter(btn => btn);//We remove any undefined buttons

        function createHourBtn(hour: string, label: typeBtnLabel, dayPrayers: string[][][]): Button {
          if (hour === '12H' && todayDate.getDay() !== 5) return undefined;//The 12th hour is only for Friday

          if (['1H', '3H', '6H'].includes(hour) && todayDate.getDay() === 0) return undefined;//On plam Sunday we start at the 9th hour

          let btnHour = new Button({
            btnID: 'btn' + hour,
            label: label,
            parentBtn: btn,
            languages: prayersLanguages,
            docFragment: new DocumentFragment(),
            showPrayers: true,
            onClick: () => btnHour.prayersSequence = getPrayersSequence(),
            afterShowPrayers: () => afterShowPrayers(hour, dayPrayers),
          });
          return btnHour;

          function getPrayersSequence(): string[] {
            if (btnHour.prayersSequence) return btnHour.prayersSequence;
            if (shift === 'D') return HolyWeekPrayersSequences.PassOver;

            let title = Prefix.HolyWeek + "DayLitany&D=$Seasons.HolyWeek";
            let sequence = [...HolyWeekPrayersSequences.PassOver];
            sequence.splice(sequence.indexOf(title), 1, title.replace('Day', 'Evening1'), title.replace('Day', 'Evening2'), title.replace('Day', 'Evening3'));

            return sequence
          }

          function afterShowPrayers(hour: string, dayPrayers: string[][][]) {

            let coptGospel: string[][],
              arabicGospel: string[][],
              psalm: string[][],
              Commentary: string[][],
              khinEfran: string[][],
              psalmPlaceHolder: HTMLDivElement,
              gospelPlaceHolder: HTMLDivElement, commentaryPlaceHolder: HTMLDivElement,
              khinEfranPlaceHolder: HTMLDivElement;

            type readingKey = [string[][], string];
            let readings: { gospel: readingKey, psalm: readingKey, commentary: readingKey, khinefranD: readingKey, khinefranE: readingKey } =
            {
              gospel: [undefined, 'Gospel'],
              psalm: [undefined, 'Psalm'],
              commentary: [undefined, 'Commentary'],
              khinefranD: [undefined, 'KhinEfranInTetriaysDay&D=$Seasons.HolyWeek'],
              khinefranE: [undefined, 'KhinEfranInTetriaysEvening&D=$Seasons.HolyWeek']
            };

            (function getTables() {
              Object.entries(readings)
                .forEach(entry => entry[1][0] = findReading(entry[1][1]));

              function findReading(reading: string): string[][] {
                let tbl: string[][] = findTable(hour + shift + reading, dayPrayers, { includes: true }) || undefined;
                if (!tbl) tbl = findTable(Prefix.HolyWeek + reading, HolyWeekPrayersArray) || undefined;
                return tbl
              }


              coptGospel = structuredClone(readings.gospel[0]);
              if (coptGospel) coptGospel.forEach(row =>
                prayersLanguages
                  .filter(lang => lang !== 'COP')
                  .forEach(lang => row[prayersLanguages.indexOf(lang) + 1] = ''));

              arabicGospel = structuredClone(readings.gospel[0]);
              arabicGospel.forEach(row => prayersLanguages
                .filter(lang => ['COP', 'CA'].includes(lang))
                .forEach(lang => row[prayersLanguages.indexOf(lang) + 1] = ''));

              khinEfran = [...findTable(Prefix.HolyWeek + 'KhinEfranIntro&D=$Seasons.HolyWeek', HolyWeekPrayersArray) || undefined]
              if (shift === 'D') khinEfran.push(...readings.khinefranD[0]);
              if (shift === 'E') khinEfran.push(...readings.khinefranE[0])
            })();

            type placeHolder = [HTMLElement, string]
            let placeHolders: { psalm: placeHolder, gospel: placeHolder, commentary: placeHolder, khinEfran: placeHolder } =
            {
              psalm: [psalmPlaceHolder, 'CopticPsalm'],
              gospel: [gospelPlaceHolder, 'CopticGospel'], commentary: [commentaryPlaceHolder, 'GospelCommentary'],
              khinEfran: [khinEfranPlaceHolder, 'KhinEfran'],
            };

            (function getPlaceHolders() {
              Object.entries(placeHolders)
                .forEach(entry => {
                  entry[1][0] = selectElementsByDataSetValue(btnHour.docFragment, Prefix.HolyWeek + entry[1][1] + 'PlaceHolder&D=$Seasons.HolyWeek', undefined, 'root')[0]
                })

            })();

            (function insertTablesInPlaceHolders() {
              [
                [arabicGospel, placeHolders.gospel[0]],
                [coptGospel, placeHolders.gospel[0]],
                [psalm, placeHolders.psalm[0]],
                [Commentary, placeHolders.commentary[0]],
                [khinEfran, placeHolders.khinEfran[0]]
              ]
                .forEach(reading => {
                  insertPrayersAdjacentToExistingElement({
                    tables: [reading[0] as string[][]],
                    languages: prayersLanguages,
                    container: btnHour.docFragment,
                    position: { el: reading[1] as HTMLElement, beforeOrAfter: 'beforebegin' }
                  })

                });
            })();

          }
        };
      }

    }

    if (localStorage.editingMode === "true")
      btnMainMenu.children.push(getEditModeButton());

    if (Season === Seasons.KiahkWeek1 || Season === Seasons.KiahkWeek2)
      btnPsalmody.label = {
        AR: "الإبصلمودية الكيهكية",
        FR: "Psalmodie de Kiahk",
      };

    (function showBtnsOnMainPage() {
      if (leftSideBar.classList.contains("extended")) return; //If the left side bar is not hidden, we do not show the buttons on the main page because it means that the user is using the buttons in the side bar and doesn't need to navigate using the btns in the main page

      let images: string[] = [
        "url(./assets/btnMassBackground.jpg)",
        "url(./assets/btnMassBackground.jpg)",
        "url(./assets/btnMassBackground.jpg)",
        "url(./assets/btnMassBackground.jpg)",
        "url(./assets/btnMassBackground.jpg)",
        "url(./assets/btnMassBackground.jpg)",
        "url(./assets/btnIncenseBackground.jpg)",
        "url(./assets/btnReadingsBackground.jpg)",
        "url(./assets/btnBOHBackground.jpg)",
        "url(./assets/btnBOHBackground.jpg)",
      ];

      containerDiv.innerHTML = "";
      //We create html elements representing each of btnMain children. The created buttons will be appended to containerDiv directly
      btnMainMenu.children
        .map((btn) => {
          createMainPageButton(btn) //We create an HTML button 
            .style.backgroundImage =
            images[btnMainMenu.children.indexOf(btn)];//We give it as background image, an image from the images list
        });

      function getBtnsDiv(): HTMLDivElement {
        let btnsDiv = document.createElement('div');
        btnsDiv.id = 'btnsMainPageDiv'
        btnsDiv.style.display = 'grid';

        btnsDiv.style.gridTemplateColumns = (
          (100 / 3).toString() + "% "
        ).repeat(3);
        containerDiv.appendChild(btnsDiv);
        return btnsDiv
      }

      function createMainPageButton(btn: Button)
        : HTMLButtonElement {
        let btnsDiv = containerDiv.querySelector('#btnsMainPageDiv') as HTMLDivElement;
        if (!btnsDiv) btnsDiv = getBtnsDiv();
        return createBtn({
          btn: btn,
          btnsContainer: btnsDiv,
          btnClass: "mainPageBtns",
          clear: false,
          onClick: () => onClickBtnFunction(btn),
        }) as HTMLButtonElement
      }

      function onClickBtnFunction(btn: Button) {
        if (!btn.children || btn.children.length === 0)
          btn.onClick(true); //if btn doesn't have childre, we call its onClick() function beacuse the children of some btns are added when tis function is called. We pass 'true' as argument, because it makes the function return the children and do not execute until its end

        let parentHtmlBtn = containerDiv.querySelector(
          "#" + btn.btnID
        ) as HTMLElement;
        let backgroundImage;

        if (parentHtmlBtn)
          backgroundImage = parentHtmlBtn.style.backgroundImage;

        (function showBtnPrayers() {
          if (btn.children && !btn.prayersSequence) return showChildButtons();
          // if (!btn.prayersSequence || btn.prayersSequence.length < 1) return;
          showChildButtonsOrPrayers(btn, true); //If btn does not have children, it means that it shows prayers. We pass it to showChildButtonsOrPrayers

        })();

        function showChildButtons() {
          if (btn.children.length < 1) return;
          containerDiv.innerHTML = "";
          btn.children
            //for each child button of btn
            .forEach((childBtn) => {
              childBtn.parentBtn = btn;
              //We create an html element representing this button and give it 'mainPageBtns', and append it to containerDiv. It will have as background, the same image as the background image of btn
              createMainPageButton(childBtn)
                .style.backgroundImage = backgroundImage;
            });
          let goBackBtns =
            [btnGoToPreviousMenu, btnMainMenu];
          if (goBackBtns.includes(btn)) return;

          goBackBtns
            .forEach(btn =>
              createMainPageButton(btn)
                .style.backgroundImage = images[0]) //Finlay, we create an extra html button for btnGoToPreviousMenu and btnMainMenu, in order for the user to be able to navigate back to the btnMain menu of buttons

        };
      }

    })();
  },
});

const btnGoToPreviousMenu: Button = new Button({
  btnID: "btnGoBack",
  label: { AR: "السابق", FR: "Retour", EN: "Go Back" },
  onClick: () => {
    scrollToTop(); //scrolling to the top of the page
  },
});

const btnMass: Button = new Button({
  btnID: "btnMass",
  label: { AR: "القداسات", FR: "Messes" },
  onClick: (returnBtnChildren: boolean = false) => {
    btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
    if (returnBtnChildren) return btnMass.children;
  },
});

const btnIncenseOffice: Button = new Button({
  btnID: "btnIncenseOffice",
  label: {
    AR: "رفع بخور باكر أو عشية",
    FR: "Office des Encens Aube et Vêpres",
  },
  onClick: (returnBtnChildren: boolean = false) => {
    //setting the children of the btnIncenseOffice. This must be done by the onClick() in order to reset them each time the button is clicked
    btnIncenseOffice.children = [btnIncenseDawn, btnIncenseVespers];
    //show or hide the PropheciesDawn button if we are in the Great Lent or JonahFast:

    //We will remove the Vespers Button during if we are during the Great Lent or the Jonah Fast, and we are not a Saturday
    if (
      (Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
      weekDay !== 6
    )
      btnIncenseOffice.children = btnIncenseOffice.children.filter(
        (btn) => btn !== btnIncenseVespers
      );

    if (returnBtnChildren) return btnIncenseOffice.children;
  },
});

const btnIncenseDawn: Button = new Button({
  btnID: "btnIncenseDawn",
  label: {
    AR: "بُخُورِ بَاكِرِ",
    FR: "Encens Aube",
  },
  showPrayers: true,
  languages: [...prayersLanguages],
  docFragment: new DocumentFragment(),
  onClick: (): string[] => {
    btnIncenseDawn.children = [btnReadingsGospelIncenseDawn];

    if (Season === Seasons.GreatLent || Season === Seasons.JonahFast)
      btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn); //We add the prophecies button during the Great Leant and Jonah Fast

    btnIncenseDawn.prayersSequence = [...IncensePrayersSequence].filter(
      (title) => !title.startsWith(Prefix.incenseVespers)
    ); //We will remove all the Incense Vespers titles from the prayersSequence Array

    if (weekDay === 6)
      //If we are a Saturday, we pray only the 'Departed Litany', we will hence remove the 'Sick Litany' and the 'Travellers Litany'
      btnIncenseDawn.prayersSequence.splice(
        btnIncenseDawn.prayersSequence.indexOf(
          Prefix.incenseDawn + "SickPrayer&D=$copticFeasts.AnyDay"
        ),
        3, //We remove the SickPrayer, the TravelersParayer and the Oblations Prayer
        Prefix.incenseVespers + "DepartedPrayer&D=$copticFeasts.AnyDay"
      );
    else if (weekDay === 0 || lordFeasts.includes(copticDate))
      //If we are a Sunday or the day is a Lord's Feast, or the oblation is present, we remove the 'Travellers Litany' and keep the 'Sick Litany' and the 'Oblation Litany'
      btnIncenseDawn.prayersSequence = btnIncenseDawn.prayersSequence.filter(
        (tbl) =>
          !tbl[0][0].startsWith(
            Prefix.incenseDawn + "TravelersPrayer&D=$copticFeasts.AnyDay"
          )
      );

    scrollToTop();
    return btnIncenseDawn.prayersSequence;
  },
  afterShowPrayers: async (
    btn: Button = btnIncenseDawn,
    gospelPrefix: string = Prefix.gospelDawn,
    gospelArray: string[][][] = ReadingsArrays.GospelDawnArrayFR
  ) => {
    let btnDocFragment = btn.docFragment;

    insertCymbalVersesAndDoxologies(btn);

    getGospelReadingAndResponses({
      liturgy: gospelPrefix,
      prayersArray: gospelArray,
      languages: getLanguages(
        PrayersArraysKeys.find((array) => array[0] === gospelPrefix)[1]
      ),
      container: btnDocFragment,
      isMass: true,
      clearContainer: false,
    });

    (function hideGodHaveMercyOnUsIfBishop() {
      let dataRoot =
        Prefix.commonPrayer +
        "PrayThatGodHaveMercyOnUs&D=$copticFeasts.AnyDay";

      let godHaveMercyHtml: HTMLDivElement[] = selectElementsByDataSetValue(
        btnDocFragment,
        dataRoot,
        { startsWith: true }
      ); //We select all the paragraphs not only the paragraph for the Bishop

      godHaveMercyHtml
        .filter(
          (htmlRow) =>
            godHaveMercyHtml.indexOf(htmlRow) > 0 &&
            godHaveMercyHtml.indexOf(htmlRow) !== godHaveMercyHtml.length - 2
        )
        .forEach((htmlRow) => htmlRow.remove());

      let godHaveMercy: string[][] = findTable(dataRoot, CommonPrayersArray) as string[][]; //We get the entier table not only the second row. Notice that the first row of the table is the row containing the title

      if (!godHaveMercy)
        return console.log("Didn't find table Gode Have Mercy");

      addExpandablePrayer({
        insertion: godHaveMercyHtml[0].nextElementSibling as HTMLDivElement,
        btnID: "godHaveMercy",
        label: {
          AR: godHaveMercy[1][2], //This is the arabic text of the lable
          FR: godHaveMercy[1][1], //this is the French text of the label
        },
        prayers: [godHaveMercy.slice(1, 4)], //We add only the 1st to 3rd rows: the 1st row is a comment from which we retrieved the text for the title, the 2nd and 3rd row is also a comment
        languages: btnMassUnBaptised.languages,
        dataGroup: dataRoot,
      });
    })();

    (async function addGreatLentPrayers() {
      if (btn.btnID !== btnIncenseDawn.btnID) return;
      if (![Seasons.GreatLent, Seasons.JonahFast].includes(Season)) return;
      if (weekDay > 0 && weekDay < 6) {
        console.log("we are not a sunday");
        //We are neither a Saturday nor a Sunday, we will hence display the Prophecies dawn buton
        (function showPropheciesDawnBtn() {
          if (Season !== Seasons.GreatLent) return;
          //If we are during any day of the week, we will add the Prophecies readings to the children of the button
          if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) < 0)
            btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
        })();
        (async function insertEklonominTaghonata() {
          let efnotiNaynan: HTMLDivElement[] = selectElementsByDataSetValue(
            btnDocFragment,
            Prefix.commonPrayer + "EfnotiNaynan&D=$copticFeasts.AnyDay", undefined, 'group'
          );

          let insertion = efnotiNaynan[efnotiNaynan.length - 1].nextSibling as HTMLElement; //This is the end of the efnotiNaynan
          let godHaveMercy = findTable(Prefix.incenseDawn + "GodHaveMercyOnUs&D=$Seasons.GreatLent", IncensePrayersArray);

          if (!godHaveMercy) return console.log("Didn't find God Have Mercy for Great Lent");

          insertPrayersAdjacentToExistingElement({
            tables: [godHaveMercy],
            languages: prayersLanguages,
            position: { beforeOrAfter: "beforebegin", el: insertion },
            container: btnDocFragment,
          });

          //We will remove all the refrains except the 1st one
          let refrains = selectElementsByDataSetValue(
            btnDocFragment,
            Prefix.incenseDawn + "GodHaveMercyOnUsRefrain&D=$Seasons.GreatLent")
            .filter((htmlRow) => htmlRow.classList.contains("Title"));

          refrains.forEach((htmlRow) => {
            if (refrains.indexOf(htmlRow) > 0) htmlRow.remove();
          });
        })();
      } else {
        //If we are Saturday or Sunday, we remove the "Prophecies Dawn" button from the readings' buttons
        if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1)
          btnIncenseDawn.children.splice(
            btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn),
            1
          );
      }
    })();

    (async function addExpandableBtnForAdamDoxolgies() {
      //We add an expandable button for the Incense Dawn Adam Doxologies
      if (btn !== btnIncenseDawn) return;
      if (btnDocFragment.children.length === 0) return;

      addExpandablePrayer({
        insertion: btnDocFragment.children[0] as HTMLElement,
        btnID: "AdamDoxologies",
        label: {
          AR: "ذكصولوجيات باكر آدام",
          FR: "Doxologies Adam Aube",
        },
        prayers: DoxologiesPrayersArray.filter((table) =>
          table[0][0].startsWith(Prefix.doxologies + "AdamDawn")),
        languages: btnIncenseDawn.languages,
      })[1];
    })();
  },
});

const btnIncenseVespers: Button = new Button({
  btnID: "btnIncenseVespers",
  label: {
    AR: "بُخُورِ عَشِيَّةَ",
    FR: "Incense Vespers",
  },
  showPrayers: true,
  docFragment: new DocumentFragment(),
  languages: [...prayersLanguages],
  onClick: (): string[] => {
    btnIncenseVespers.prayersSequence = [...IncensePrayersSequence].filter(
      (title) =>
        title !== Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay" &&
        !title.startsWith(Prefix.incenseDawn)
    );

    scrollToTop();
    return btnIncenseVespers.prayersSequence;
  },
  afterShowPrayers: async () => {
    btnIncenseDawn.afterShowPrayers(
      btnIncenseVespers,
      Prefix.gospelVespers,
      ReadingsArrays.GospelVespersArrayFR
    );
  },
});

const btnMassStCyril: Button = new Button({
  btnID: "btnMassStCyril",
  label: { AR: "كيرلسي", FR: "Saint Cyril", EN: "St Cyril" },
  docFragment: new DocumentFragment(),
  showPrayers: true, //we set it to false in order to escape showing the prayers again after inserting the redirection buttons. The showPrayers() function is called by onClick()
  languages: [...prayersLanguages],
  onClick: (): string[] => {
    //Setting the standard mass prayers sequence
    btnMassStCyril.prayersSequence = [
      ...MassPrayersSequences.MassStCyril,
      ...[
        Prefix.massCommon +
        "AgiosPart3&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "BlockIriniPassi&D=$copticFeasts.AnyDay",
        Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay",
        Prefix.massCommon + "Confession&D=$copticFeasts.AnyDay",
      ],
      ...MassPrayersSequences.Communion,
    ];

    return btnMassStCyril.prayersSequence;
  },
  afterShowPrayers: async () => {
    btnMassStBasil.afterShowPrayers(btnMassStCyril);
  },
});

const btnMassStGregory: Button = new Button({
  btnID: "btnMassStGregory",
  label: { AR: "غريغوري", FR: "Saint Gregory" },
  docFragment: new DocumentFragment(),
  showPrayers: true, //we set it to false in order to escape showing the prayers again after inserting the redirection buttons. The showPrayers() function is called by onClick()
  languages: [...prayersLanguages],
  onClick: (): string[] => {
    //Setting the standard mass prayers sequence
    btnMassStGregory.prayersSequence = [
      ...MassPrayersSequences.MassStGregory,
      ...MassPrayersSequences.MassCallOfHolySpirit,
      ...MassPrayersSequences.MassLitanies,
      ...MassPrayersSequences.Communion,
    ];

    //removing irrelevant prayers from the array
    btnMassStGregory.prayersSequence.splice(
      btnMassStGregory.prayersSequence.indexOf(
        Prefix.massCommon + "CallOfTheHolySpiritPart1&D=$copticFeasts.AnyDay"
      ),
      9
    );
    scrollToTop();

    return btnMassStGregory.prayersSequence;
  },
  afterShowPrayers: async () => {
    btnMassStBasil.afterShowPrayers(btnMassStGregory);
  },
});

const btnMassStBasil: Button = new Button({
  btnID: "btnMassStBasil",
  label: { AR: "باسيلي", FR: "Saint Basil", EN: "St Basil" },
  docFragment: new DocumentFragment(),
  showPrayers: true, //we set it to false in order to escape showing the prayers again after inserting the redirection buttons. The showPrayers() function is called by onClick()
  languages: [...prayersLanguages],
  onClick: (): string[] => {
    //Setting the standard mass prayers sequence
    btnMassStBasil.prayersSequence = [
      ...MassPrayersSequences.MassStBasil,
      ...MassPrayersSequences.MassCallOfHolySpirit,
      ...MassPrayersSequences.MassLitanies,
      ...MassPrayersSequences.Communion,
    ];

    //We scroll to the beginning of the page after the prayers have been displayed
    scrollToTop();
    // btnsPrayersSequences.splice(btns.indexOf(btnMassStBasil), 1, btnMassStBasil.prayersSequence);
    // btnMassStBasil.retrieved = true;
    return btnMassStBasil.prayersSequence;
  },
  afterShowPrayers: async (btn: Button = btnMassStBasil) => {
    //We create a list of the masses to which we will insert redirection button
    let redirectToList: Button[] = [
      btnMassStBasil,
      btnMassStGregory,
      btnMassStCyril,
      btnMassStJohn,
    ];
    redirectToList.splice(redirectToList.indexOf(btn), 1); //We remove the btn of the mass from the redirection list
    redirectToList.splice(redirectToList.indexOf(btnMassStJohn), 1); //We remove the mass of st John

    let btnDocFragment = btn.docFragment;

    (function insertStBasilSecondReconciliationBtn() {
      if (btn !== btnMassStBasil) return;

      let secondBasilReconciliation = findTable(
        Prefix.massStBasil + "Reconciliation2&D=$copticFeasts.AnyDay",
        MassStBasilPrayersArray);

      if (!secondBasilReconciliation)
        return console.log("Didn't find reconciliation");


      let htmlBtn = addExpandablePrayer({
        insertion: selectElementsByDataSetValue(
          btnDocFragment,
          Prefix.massStBasil + "Reconciliation&D=$copticFeasts.AnyDay"
        )[0].nextElementSibling as HTMLDivElement, //We insert the button after the title
        btnID: "secondStBasilReconciliation",
        label:
        {
          FR: secondBasilReconciliation[0][2],
          AR: secondBasilReconciliation[0][4],
        },
        prayers: [secondBasilReconciliation],
        languages: btn.languages,
      })[0];
      htmlBtn.addEventListener("click", () => {
        let dataGroup =
          Prefix.massStBasil + "Reconciliation&D=$copticFeasts.AnyDay";
        selectElementsByDataSetValue(containerDiv, dataGroup, undefined, 'group')
          .forEach((row) => row.classList.toggle(hidden));
      });
    })();
    (function insertStCyrilSecondReconciliationBtn() {
      if (btn !== btnMassStCyril) return;

      let secondCyrilReconciliation = findTable(
        Prefix.massStCyril + "Reconciliation2&D=$copticFeasts.AnyDay",
        MassStCyrilPrayersArray);

      if (!secondCyrilReconciliation)
        return console.log("Didn't find reconciliation");

      let htmlBtn = addExpandablePrayer({
        insertion: selectElementsByDataSetValue(
          btnDocFragment,
          Prefix.massStCyril + "Reconciliation&D=$copticFeasts.AnyDay"
        )[0].nextElementSibling as HTMLDivElement, //We insert the button after the title
        btnID: "secondStBasilReconciliation",
        label:
        {
          FR: secondCyrilReconciliation[0][2],
          AR: secondCyrilReconciliation[0][4],
        },
        prayers: [secondCyrilReconciliation],
        languages: btn.languages,
      })[0];
      htmlBtn.addEventListener("click", () => {
        let dataGroup =
          Prefix.massStCyril + "Reconciliation&D=$copticFeasts.AnyDay";
        selectElementsByDataSetValue(containerDiv, dataGroup, undefined, 'group')
          .forEach((row) => row.classList.toggle(hidden));
      });
    })();

    (function addRedirectionButtons() {
      //Adding 2 buttons to redirect the other masses at the begining of the Reconciliation
      redirectToAnotherMass(
        [...redirectToList],
        {
          beforeOrAfter: "afterend",
          el: selectElementsByDataSetValue(
            btnDocFragment,
            "Reconciliation&D=$copticFeasts.AnyDay",
            { includes: true }
          )[0],
        },
        "RedirectionToReconciliation"
      );

      //Adding 2 buttons to redirect to the other masses at the Anaphora prayer After "By the intercession of the Virgin St. Mary"
      let select = selectElementsByDataSetValue(
        btnDocFragment,
        Prefix.massCommon + "SpasmosAdamShort&D=$copticFeasts.AnyDay",
        { endsWith: true }
      );
      redirectToAnotherMass(
        [...redirectToList],
        {
          beforeOrAfter: "afterend",
          el: select[select.length - 1],
        },
        "RedirectionToAnaphora"
      );

      //Adding 2 buttons to redirect to the other masses before Agios
      redirectToAnotherMass(
        [...redirectToList],
        {
          beforeOrAfter: "afterend",
          el: selectElementsByDataSetValue(
            btnDocFragment,
            getMassPrefix(btn.btnID) + "Agios&D=$copticFeasts.AnyDay",
          )[0].previousElementSibling as HTMLElement,
        },
        "RedirectionToAgios"
      );

      //Adding 2 buttons to redirect to the other masses before the Call upon the Holy Spirit
      redirectToAnotherMass(
        [...redirectToList],
        {
          beforeOrAfter: "afterend",
          el: selectElementsByDataSetValue(
            btnDocFragment,
            Prefix.massCommon +
            "AssemblyResponseAmenAmenAmenWeProclaimYourDeath&D=$copticFeasts.AnyDay",
          )[0],
        },
        "RedirectionToLitanies"
      );

      //Adding 2 buttons to redirect to the other masses before the Fraction Introduction
      redirectToAnotherMass(
        [...redirectToList],
        {
          beforeOrAfter: "beforebegin",
          el: selectElementsByDataSetValue(
            btnDocFragment,
            "FractionIntroduction&D=$copticFeasts.AnyDay",
            { includes: true }
          )[0],
        },
        "RedirectionToFractionIntroduction"
      );
    })();

    (function insertAdamAndWatesSpasmos() {
      //We insert it during the Saint Mary Fast and on every 21th of the coptic month
      let spasmosTitle: string = Prefix.massCommon + "SpasmosAdamLong";

      let anchorTitle = Prefix.massCommon + "DiaconResponseKissEachOther&D=$copticFeasts.AnyDay";

      insertSpasmos(
        spasmosTitle,
        selectElementsByDataSetValue(btnDocFragment, anchorTitle)[0]
      );
      anchorTitle = Prefix.massCommon + "SpasmosWatesShort&D=$copticFeasts.AnyDay"
      //Insert Wates Spasmoses
      insertSpasmos(
        spasmosTitle.replace("Adam", "Wates"),
        selectElementsByDataSetValue(btnDocFragment, anchorTitle)[0],
        true
      );
    })();

    function insertSpasmos(
      spasmosTitle: string,
      anchor: HTMLElement,
      hideAnchor: boolean = false
    ): HTMLElement | void {
      if (!anchor) return console.log('anhcor is not valid');

      let spasmos: string[][] = MassCommonPrayersArray.find(
        (tbl) =>
          tbl[0][0].startsWith(spasmosTitle) &&
          isMultiDatedTitleMatching(tbl[0][0], Season)
      );

      if (!spasmos)
        return console.log("didn't find spasmos with title = ", spasmosTitle);


      let createdElements = addExpandablePrayer({
        insertion: anchor,
        btnID: spasmosTitle.split("&D=")[0],
        label: {
          FR: spasmos[0][2],
          AR: spasmos[0][4],
        },
        prayers: [spasmos],
        languages: btn.languages,
      });

      if (hideAnchor)
        createdElements[0].addEventListener("click", () =>
          selectElementsByDataSetValue(containerDiv, anchor.dataset.root).forEach((row) => row.classList.toggle(hidden))
        );
    }

    (function insertLitaniesIntroductionFromOtherMasses() {
      if (btn !== btnMassStBasil) return; //This button appears only in St Basil Mass

      let litaniesIntro =
        findTable(
          Prefix.massStGregory + "LitaniesIntroduction",
          MassStGregoryPrayersArray,
          { startsWith: true }
        ) || undefined;

      if (!litaniesIntro)
        return console.log("Did not find the Litanies Introduction");

      let anchor = selectElementsByDataSetValue(
        btnDocFragment,
        Prefix.massCommon + "LitaniesIntroduction&D=$copticFeasts.AnyDay")[0];

      if (!anchor) return console.log("Di not find the Anchor");

      let createdElements = addExpandablePrayer({
        insertion: anchor,
        btnID: "btnStGregoryLitaniesIntro",
        label: {
          AR: "طلبات القداس الغريوري",
          FR: "Litanies de St. Gregory",
        },
        prayers: [litaniesIntro],
        languages: btn.languages,
      });
      //Adding the St Cyril Litanies Introduction to the St. Basil Mass only. St Gregory Mass has its own intro, and we do not of course add it to St Cyrill since it is already included

      litaniesIntro = findTable(
        Prefix.massStCyril + "LitaniesIntroduction",
        MassStCyrilPrayersArray,
        { startsWith: true }
      ) as string[][];

      if (!litaniesIntro.length)
        console.log("Did not find the St Cyril Litanies Introduction");

      if (litaniesIntro) {
        litaniesIntro = structuredClone(litaniesIntro).splice(
          litaniesIntro.length - 1,
          1
        ); //We remove the last row in the table of litaniesIntro because it is the "As it were, let it always be.../كما كان هكذا يكون/tel qu'il fût ainsi soit-il..."
      }

      //We will create the expandable div and its button, but will append the button to the div
      let btnsDiv = createdElements[0].parentElement as HTMLDivElement;
      btnsDiv.appendChild(
        addExpandablePrayer({
          insertion: anchor,
          btnID: "btnStCyrilLitaniesIntro",
          label: {
            AR: "طلبات القداس الكيرلسي",
            FR: "Litanies de la messe de Saint Cyril",
          },
          prayers: [litaniesIntro],
          languages: btnMassStCyril.languages,
        })[0] //this is the buton created by addExpandablePrayer
      );

      //We add to each button a 'click' event listner that will hide the other litanies
      Array.from(btnsDiv.children).forEach((child) =>
        child.addEventListener("click", () => toggleOtherLitanies(child.id))
      );

      btnsDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(
        btnsDiv,
        3
      );

      function toggleOtherLitanies(btnID: string) {
        let div = Array.from(containerDiv.querySelectorAll(".Expandable")).find(
          (btn) => btn.id.includes("LitaniesIntro") && !btn.id.startsWith(btnID)
        );

        if (div && !div.classList.contains(hidden)) div.classList.add(hidden);
      }
    })();

    (function removeNonRelevantSeasonalLitany() {
      let seasonal = Array.from(
        btnDocFragment.querySelectorAll(".Row")
      ) as HTMLDivElement[];
      seasonal = seasonal.filter((row) =>
        row.dataset.root.includes("SeasonalLitanyOf")
      );
      let dataRoot: string;
      if (closingHymn.Season === closingHymnAll[0].Season)
        dataRoot = "SeasonalLitanyOfThe" + closingHymn.Season; //River
      else if (closingHymn.Season === closingHymnAll[1].Season)
        dataRoot = "SeasonalLitanyOfThe" + closingHymn.Season; //Plants
      else if (closingHymn.Season === closingHymnAll[2].Season)
        dataRoot = "SeasonalLitanyOfThe" + closingHymn.Season; //Hervest

      seasonal
        .filter((row) => !row.dataset.root.includes(dataRoot))
        .forEach((row) => row.remove());
    })();

    (function showFractionPrayersMasterButton() {
      //We will insert a button displaying a pannel of choices for the different Fraction prayers according to the day/season, etc.s


      showMultipleChoicePrayersButton({
        filteredPrayers: filter(),
        languages: prayersLanguages,
        btnLabels: { AR: "صلوات القسمة", FR: "Oraisons de la Fraction" },
        masterBtnID: "btnFractionPrayers",
        anchor: Array.from(btnDocFragment.children)
          .find(child => child.id && child.id.startsWith(Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay")) as HTMLElement,
      });

      function filter(): string[][][] {
        let filtered: string[][][] = [];
        let dates = [copticDate, Season, copticFeasts.AnyDay];

        if (Number(copticDay) === 29 && ![4, 5, 6].includes(Number(copticMonth))) dates.unshift(copticFeasts.Coptic29th);

        dates.forEach(date =>
          filtered.push(...FractionsPrayersArray.filter(table => isMultiDatedTitleMatching(table[0][0], date)))
        );
        return getUniqueValuesFromArray(filtered) as string[][][];
      };

    })();


    (function insertCommunionChants() {
      //Inserting the Communion Chants after the Psalm 150
      let psalm150 = selectElementsByDataSetValue(
        btnDocFragment,
        Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay"
      );
      let filtered: string[][][] = [];
      [copticDate, Season, copticFeasts.AnyDay]
        .forEach(date => {
          filtered.push(...CommunionPrayersArray.filter(table => isMultiDatedTitleMatching(table[0][0], date)))
        });

      showMultipleChoicePrayersButton({
        filteredPrayers: getUniqueValuesFromArray(filtered) as string[][][],
        languages: btn.languages,
        btnLabels: {
          AR: "مدائح التوزيع",
          FR: "Chants de la communion",
        },
        masterBtnID: "communionChants",
        anchor: psalm150[psalm150.length - 1] as HTMLElement,
      });
    })();
  },
});

const btnMassStJohn: Button = new Button({
  btnID: "btnMassStJohn",
  label: { AR: "القديس يوحنا", FR: "Saint Jean" },
  docFragment: new DocumentFragment(),
  showPrayers: false, //we set it to false in order to escape showing the prayers again after inserting the redirection buttons. The showPrayers() function is called by onClick()
  prayersSequence: [],
  onClick: () => {
    alert(
      "The prayers of this mass have not yet been added. We hope they will be ready soon"
    );
    return; //until we add the text of this mass

    scrollToTop(); //scrolling to the top of the page

    btnMassStJohn.retrieved = true;
    return btnMassStJohn.prayersSequence;
  },
  afterShowPrayers: async () => {
    btnMassStBasil.afterShowPrayers(btnMassStJohn);
  },
});

const goToAnotherMass: Button[] = [
  new Button({
    btnID: "btnGoToStBasilReconciliation",
    label: { AR: " باسيلي", FR: " Saint Basil" },
    cssClass: inlineBtnClass,
    onClick: () => {
      showChildButtonsOrPrayers(btnMassStBasil);
    },
  }),
  new Button({
    btnID: "btnGoToStGregoryReconciliation",
    label: { AR: "غريغوري", FR: " Saint Gregory" },
    cssClass: inlineBtnClass,
    onClick: () => {
      showChildButtonsOrPrayers(btnMassStGregory);
    },
  }),
  new Button({
    btnID: "btnGoToStCyrilReconciliation",
    label: { AR: "كيرلسي", FR: "Saint Cyril" },
    cssClass: inlineBtnClass,
    onClick: () => {
      showChildButtonsOrPrayers(btnMassStCyril);
    },
  }),
  new Button({
    btnID: "btnGoToStJeanReconciliation",
    label: { AR: "القديس يوحنا", FR: "Saint Jean" },
    cssClass: inlineBtnClass,
    parentBtn: btnMass,
    onClick: () => {
      showChildButtonsOrPrayers(btnMassStJohn);
    },
  }),
];

const btnMassUnBaptised: Button = new Button({
  btnID: "btnMassUnBaptised",
  label: {
    AR: "قٌدَّاسِ المَوْعُوظِينَ",
    FR: "Liturgie du Verbe",
    EN: "Unbaptised Mass",
  },
  docFragment: new DocumentFragment(),
  showPrayers: true,
  languages: [...prayersLanguages],
  onClick: () => {
    //The prayersArray andprayersSequence must be set when the button is clicked

    //Adding children buttons to btnMassUnBaptised
    btnMassUnBaptised.children = [
      ...btnDayReadings.onClick(true),
    ];

    btnMassUnBaptised.children = btnMassUnBaptised.children.filter(
      (btn) =>
        ![
          btnReadingsGospelIncenseDawn,
          btnReadingsGospelIncenseVespers,
          btnReadingsGospelNight,
          btnReadingsPropheciesDawn,
        ].includes(btn)
    );

    let btnsPrayersSequence = [
      ...MassPrayersSequences.MassUnbaptized,
    ];

    (function adaptHallelujahFaybibiAndTayshoury() {

      btnMassUnBaptised.prayersSequence = adaptPrayersSequence();

      function adaptPrayersSequence(): string[] {
        //If we are not during a fast period or we are during a fast period but today is either Saturday or Sunday, or a Lord Feast, we will remove Hallelujah Ge Evmevi and Tishoury, in order to keep Hallelujah Faybibi and Tayshouri
        if (!isFast
          ||
          [0, 6].includes(weekDay)
          ||
          lordFeasts.find(date => [copticDate, copticReadingsDate].includes(date)))
          return btnsPrayersSequence
            .filter(title =>
              ![Prefix.massCommon + "HallelujahFayBiBiFast&D=$copticFeasts.AnyDay", Prefix.massCommon + "Tishoury&D=$copticFeasts.AnyDay"].includes(splitTitle(title)[0]));


        else return ifIsFast();

        function ifIsFast(): string[] {
          if (!isFast) return;
          if ([Seasons.GreatLent, Seasons.JonahFast].includes(Season)) {
            //We are either during the week days of the Great Lent, or the 3 days of Jonah Fast
            [
              ["HallelujahFayBiBiFast&D=$copticFeasts.AnyDay", "HallelujahFayBiBi&D=$Seasons.GreatLent"], //Replacing "Halleljah Ge Evmevi" with "Halleluja E Ikhon"
              ["Tishoury&D=$copticFeasts.AnyDay", "EnsotyTishoury&D=$Seasons.GreatLent"]]   //Replacing "Tishoury" with "Ensoty Tishoury"
              .forEach(array => btnsPrayersSequence[btnsPrayersSequence.indexOf(Prefix.massCommon + array[0])] = Prefix.massCommon + array[1]);
          }


          //We will remove 'Hellulja Fay Bibi'and keep only 'Hellulja Ge Evmev'i". We will also remove Tayshoury in order to keep only Tishoury 
          return btnsPrayersSequence
            .filter(title =>
              ![Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay", Prefix.massCommon + "Tayshoury&D=$copticFeasts.AnyDay"].includes(splitTitle(title)[0]));
        }
      };

    })();

    scrollToTop();
    return btnMassUnBaptised.prayersSequence;
  },
  afterShowPrayers: () => {
    let btnDocFragment = btnMassUnBaptised.docFragment;


    (function hideGodHaveMercyOnUsIfBishop() {
      let dataRoot =
        Prefix.commonPrayer +
        "PrayThatGodHaveMercyOnUs&D=$copticFeasts.AnyDay";

      let godHaveMercyHtml: HTMLDivElement[] = selectElementsByDataSetValue(
        btnDocFragment,
        dataRoot,
        { startsWith: true }
      ); //We select all the paragraphs not only the paragraph for the Bishop

      godHaveMercyHtml
        .filter(
          (div) =>
            godHaveMercyHtml.indexOf(div) > 0 &&
            godHaveMercyHtml.indexOf(div) < godHaveMercyHtml.length - 1
        )
        .forEach((htmlRow) => htmlRow.remove());

      let godHaveMercy: string[][] = findTable(dataRoot, CommonPrayersArray) as string[][]; //We get the entier table not only the second row. Notice that the first row of the table is the row containing the title

      if (!godHaveMercy)
        return console.log("Didn't find table Gode Have Mercy");

      addExpandablePrayer({
        insertion: godHaveMercyHtml[0].nextElementSibling as HTMLDivElement,
        btnID: "godHaveMercy",
        label: {
          AR: godHaveMercy[1][2], //This is the arabic text of the lable
          FR: godHaveMercy[1][1], //this is the French text of the label
        },
        prayers: [godHaveMercy.slice(1, 4)], //We add only the 1st to 3rd rows: the 1st row is a comment from which we retrieved the text for the title, the 2nd and 3rd row is also a comment
        languages: btnMassUnBaptised.languages,
        dataGroup: dataRoot,
      });
    })();

    (function insertHisFoundationsAndIGodHaveMercy() {
      if (![Seasons.GreatLent, Seasons.JonahFast].includes(Season)) return;//The following only applies during the Great Lent the 3 days of Jonah Fast (not the 4th day) that's why we check if isFast === true
      if ([6, 0].includes(todayDate.getDay())) return;

      let titles: string[] = [
        Prefix.commonPrayer + "WeHaveBeenSavedWithYou&D=$copticFeasts.AnyDay",
        Prefix.massCommon + "HisFoundations&D=$Seasons.GreatLent",
        Prefix.incenseDawn + "GodHaveMercyOnUsRefrain&D=$Seasons.GreatLent",
      ];

      selectElementsByDataSetValue(btnDocFragment, titles[0], { equal: true }, 'root').forEach(el => el.remove());//We remove the existing 'Sotis Amen' prayer

      let tables: string[][][] = titles.map(title => findTable(title, getTablesArrayFromTitlePrefix(title)) || undefined);//We retrieve the 3 tables by their titles

      if (!tables || tables.length < 1) return;

      let anchor = selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon + "AbsolutionForTheFather&D=$copticFeasts.AnyDay", { equal: true }, 'root')[0];//This is the html element before which we will insert the retrived tables
      if (!anchor) return;

      insertPrayersAdjacentToExistingElement(
        {
          tables: tables,
          languages: prayersLanguages,
          position: {
            beforeOrAfter: 'beforebegin',
            el: anchor
          },
          container: btnDocFragment
        }
      );
    })();

    let readingsAnchor: HTMLElement = selectElementsByDataSetValue(
      btnDocFragment,
      Prefix.massCommon + "ReadingsPlaceHolder&D=$copticFeasts.AnyDay"
    )[0]; //this is the html element before which we will insert all the readings and responses

    (function insertIntercessionsHymnsForSeasons() {
      let seasonalIntercessions = MassCommonPrayersArray.filter(
        (table) =>
          table[0][0].includes("ByTheIntercessionOf") &&
          (isMultiDatedTitleMatching(table[0][0], copticDate) ||
            isMultiDatedTitleMatching(table[0][0], Season))
      );
      if (seasonalIntercessions.length < 1)
        return console.log("No Seasonsal Intercession Hymns");

      let anchor = setAnchorAccordingToOccasion();

      if (!anchor) return;

      insertPrayersAdjacentToExistingElement({
        tables: getUniqueValuesFromArray(seasonalIntercessions) as string[][][],
        languages: getLanguages(getArrayNameFromArray(MassCommonPrayersArray)),
        position: {
          beforeOrAfter: "beforebegin",
          el: anchor,
        },
        container: btnDocFragment,
      });

      (function insertBiEhmotGharExpandable() {
        //After inserting the Intercessions hyms, we will isnert an expandable for Bi Ehmot Ghar

        addExpandablePrayer({
          btnID: 'btnBiEhmotGhar',
          insertion: readingsAnchor,
          prayers: [findTable(Prefix.massCommon + "BiEhmotGhar&D=$Seasons.GreatLent", MassCommonPrayersArray) || undefined],
          label: {
            AR: "بي إهموت غار",
            FR: "Ⲡⲓϩ̀ⲙⲟⲧ ⲅⲁⲣ"
          },
          languages: prayersLanguages
        })
      })();

      function setAnchorAccordingToOccasion(): HTMLDivElement {
        let title: string = Prefix.massCommon + "ByTheIntercessionOfStMary&D=$copticFeasts.AnyDay";

        if ([Seasons.JonahFast].includes(Season)) title = Prefix.massCommon + "ByTheIntercessionOfStJohnBaptist&D=$copticFeasts.AnyDay";

        let htmlDivs = selectElementsByDataSetValue(
          btnDocFragment,
          title);

        if (!htmlDivs || htmlDivs.length < 1) return;

        return htmlDivs[htmlDivs.length - 1].nextElementSibling as HTMLDivElement
      }
    })();



    (function insertStPaulReading() {
      insertMassReading(
        Prefix.stPaul,
        ReadingsArrays.StPaulArrayFR,
        ReadingsIntrosAndEnds.stPaulIntro,
        ReadingsIntrosAndEnds.stPaulEnd
      );
    })();

    (function insertKatholikon() {
      insertMassReading(
        Prefix.katholikon,
        ReadingsArrays.KatholikonArrayFR,
        ReadingsIntrosAndEnds.katholikonIntro,
        ReadingsIntrosAndEnds.katholikonEnd
      );
    })();

    (function insertPraxis() {
      (function insertPraxisResponse() {
        //!Caution, we must start by inserting the Praxis Response before inserting the Praxis reading

        let annualResponseHTML: HTMLElement[] =
          insertPrayersAdjacentToExistingElement({
            tables: [
              findTable(
                Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay",
                PraxisResponsesPrayersArray,
                { equal: true }
              ) || undefined,
            ],
            languages: getLanguages(
              PrayersArraysKeys.find(
                (array) => array[2]() === PraxisResponsesPrayersArray
              )[1]
            ),
            position: {
              beforeOrAfter: "beforebegin",
              el: readingsAnchor,
            },
            container: btnDocFragment,
          })[0];

        let specialResponse: string[][][] = PraxisResponsesPrayersArray.filter(
          (table) =>
            isMultiDatedTitleMatching(table[0][0], copticDate) ||
            isMultiDatedTitleMatching(table[0][0], Season)
        );

        if (specialResponse.length === 0)
          return console.log("Did not find any specific praxis response");

        if (Season === Seasons.GreatLent) {
          //If a Praxis response was found
          // The query should yield to  2 tables ('Sundays', and 'Week') for this season. We will keep the relevant one accoding to the date
          if (weekDay === 0 || weekDay === 6)
            specialResponse = [
              specialResponse.find((table) =>
                table[0][0].includes("Sundays&D=")
              ),
            ];
          else
            specialResponse = [
              specialResponse.find((table) => table[0][0].includes("Week&D=")),
            ];
        }

        //We insert the special response between the first and 2nd rows
        let specialResponseHTML = insertPrayersAdjacentToExistingElement({
          tables: getUniqueValuesFromArray(specialResponse) as string[][][], //We remove duplicates if any
          languages: prayersLanguages,
          position: {
            beforeOrAfter: "beforebegin",
            el: annualResponseHTML[2], //This is the 'Ek Esmaroot' part of the annual response
          },
          container: btnDocFragment,
        });

        //We move 'Sheri Ne Maria' after the title of the special response
        specialResponseHTML[0][0].insertAdjacentElement(
          "afterend",
          annualResponseHTML[1]
        );

        //We remove the title of the annual response
        annualResponseHTML[0].remove();
      })();

      ///Then we insert the Praxis reading
      insertMassReading(
        Prefix.praxis,
        ReadingsArrays.PraxisArrayFR,
        ReadingsIntrosAndEnds.praxisIntro,
        ReadingsIntrosAndEnds.praxisEnd
      );
    })();

    (function insertSepcialAgiosIfFeast() {
      let Agios: string = Prefix.massCommon + "Agios&D=$copticFeasts.";

      if ([copticFeasts.EntryToEgypt, copticFeasts.CanaWedding].includes(copticDate))
        Agios += Object.entries(copticFeasts).find(entry => entry[1] === copticDate)[0];
      else if ([copticFeasts.PalmSunday, copticFeasts.Ascension, copticFeasts.Pentecoste].includes(copticReadingsDate))
        Agios += Object.entries(copticFeasts).find(entry => entry[1] === copticReadingsDate)[0];
      else if ([Seasons.Nativity, Seasons.Baptism, Seasons.CrossFeast, Seasons.PentecostalDays].includes(Season))
        Agios = Agios.replace('copticFeasts', 'Seasons') + Object.entries(Seasons).find(entry => entry[1] === Season)[0];
      else Agios += "AnyDay";


      let AgiosTable =
        findTable(Agios, MassCommonPrayersArray, {
          equal: true,
        }) || undefined;

      if (!AgiosTable)
        return console.log(
          "Didn't find the special Agios table in PrayersArray"
        );

      (function adaptToAscension() {
        if (Season !== Seasons.PentecostalDays || Number(copticReadingsDate.split(Seasons.PentecostalDays)[1]) < 40) return;  //i.e. if we are between the Pentecoste & the Assumption feasts: day 40 to day 49
        let raisedAndAscended = findTable(Prefix.commonPrayer + "AgiosPart1&D=$copticFeasts.AnyDay", CommonPrayersArray, {
          equal: true,
        })[3] as string[]; //This is the 3rd paragraph of the ordinary Agios Osios Hymn ('For He Raised and Ascended to the Heaveans'...etc.)

        if (!raisedAndAscended) return;

        [4, 5, 6].forEach(index => AgiosTable[AgiosTable.length - index] = raisedAndAscended);//Replacing the 3 Agios paragraphs with the Ascension paragraph

      })();


      insertPrayersAdjacentToExistingElement({
        tables: [AgiosTable],
        languages: getLanguages(getArrayNameFromArray(MassCommonPrayersArray)),
        position: {
          beforeOrAfter: "beforebegin",
          el: readingsAnchor.nextElementSibling as HTMLDivElement,
        },
        container: btnDocFragment,
      });

      //  oldAgios.forEach((div) => div.remove());
    })();

    (function insertSynaxarium() {
      if(Season === Seasons.PentecostalDays) return;//We do not read the Synaxarium during the 50 Pentecostal days
      let intro = { ...ReadingsIntrosAndEnds.synaxariumIntro };
      Object.entries(intro)
        .forEach(entry =>
          intro[entry[0]] =
          entry[1]
            .replace("theday", Number(copticDay).toString())
            .replace("themonth",
              copticMonths[Number(copticMonth)][entry[0]]
            ));

      insertMassReading(
        Prefix.synaxarium,
        ReadingsArrays.SynaxariumArrayFR,
        intro,
        undefined,
        copticDate
      ); //!Caution: we must pass the copticDate for the 'date' argument, otherwise it will be set to the copticReadingsDate by default, and we will get the wrong synaxarium

      //We will reverse the langauges
      let introHTML = selectElementsByDataSetValue(
        btnDocFragment,
        Prefix.synaxarium + "&D=" + copticDate)[1];

      if (!introHTML || introHTML.children.length < 1) return console.log('Didn\'t find the Synaxarium');
      introHTML.children[0].insertAdjacentElement(
        "beforebegin",
        introHTML.children[0]
      );
    })();

    (function insertGospelReading() {
      getGospelReadingAndResponses({
        liturgy: Prefix.gospelMass,
        prayersArray: ReadingsArrays.GospelMassArrayFR,
        languages: getLanguages(
          PrayersArraysKeys.find((array) => array[0] === Prefix.gospelMass)[1]
        ),
        container: btnDocFragment,
        isMass: true,
        clearContainer: false,
      });
    })();

    (async function insertBookOfHoursButton() {
      if (
        [
          copticFeasts.Resurrection,
          copticFeasts.Nativity,
          copticFeasts.Baptism,
        ].includes(copticReadingsDate)
      )
        //In these feasts we don't pray any hour
        return alert(
          "We do not pray the Book of Hours prayers on the Ressurection, Nativity (Kiahk 29th), and Baptism (Toubi 11th) feasts' masses"
        );

      let hoursBtns: Button[] = btnBookOfHours.onClick(true); //We get buttons for the relevant hours according to the day
      if (!hoursBtns) return;

      hoursBtns = selectRelevantHoursAccordingToTheDay();

      let masterBtnDiv: HTMLDivElement,
        btnsDiv: HTMLDivElement;


      (function createMasterButton() {
        masterBtnDiv = document.createElement("div"); //This is the div that will contain the master button which shows or hides the Book of Hours sub buttons
        masterBtnDiv.classList.add(inlineBtnsContainerClass);
        masterBtnDiv.id = "masterBOHBtn";

        btnsDiv = document.createElement("div"); //This is the div that contains the sub buttons for each Hour of the Book of Hours
        if (defaultLanguage === 'AR') btnsDiv.dir = 'rtl';
        btnsDiv.style.display = "grid";
        btnsDiv.classList.add(inlineBtnsContainerClass);
        btnsDiv.classList.add(hidden);

        let masterBtn = new Button({
          btnID: "BOH_Master",
          label: {
            AR: "الأجبية",
            FR: "Agpia",
          },
          onClick: () => {
            //We toggle the div containing the buttons for each hour
            btnsDiv.classList.toggle(hidden);
            if (btnsDiv.classList.contains(hidden)) {
              btnsDiv.style.top = "";
              btnsDiv.style.position = "";
              createFakeAnchor(btnsDiv.id);
            }
          },
        });

        masterBtnDiv.prepend(
          createBtn({
            btn: masterBtn,
            btnsContainer: masterBtnDiv,
            btnClass: inlineBtnClass,
            clear: true,
            onClick: masterBtn.onClick,
          })
        ); //We add the master button to the bookOfHoursMasterDiv

        btnDocFragment.prepend(btnsDiv);
        btnDocFragment.prepend(masterBtnDiv);
      })();


      (function createHtmlButtonForEachHour() {
        //We will create an HTML div (role = button) and an expandable div for each hour
        hoursBtns
          .map((btn) => {
            btn.onClick(true); //We call the onClick() method of the btn in order to build its prayersSequence properties. Notice that we passs 'true' as argument to the onClick() function

            if (localStorage.displayMode === displayModes[1])
              //If we are in the 'Presentation Mode', we remove all the psalms and keep only the Gospel and the Litanies
              btn.prayersSequence = btn.prayersSequence
                .filter((title) => !title.includes("Psalm"));

            InsertHourFinalPrayers(btn); //Inserting Kyrielison 41 times, Agios, Holy God of Sabaot, etc.

            let btnPrayers: string[][][] =
              btn.prayersSequence.map(
                (title) =>
                  findTable(
                    title,
                    getTablesArrayFromTitlePrefix(title)
                  ) as string[][]
              ); //We create an array containing all the tables includes in the button's prayersSequence.

            //We will create an 'expandable' html button and div for the hour button
            let createdElements: [HTMLElement, HTMLDivElement] =
              addExpandablePrayer({
                insertion: btnDocFragment.children[0] as HTMLDivElement,
                btnID: btn.btnID,
                label: btn.label,
                prayers: btnPrayers,
                languages: btnBookOfHours.languages,
              }) as [HTMLElement, HTMLDivElement];

            if (!createdElements[0]) return;


            createdElements[0].addEventListener("click", () => hourBtnOnClick(createdElements[0].id));//!Caution, we must ADD a new onClick eventListner because the created buton already have one attached to it when it was created by addExpandablePrayer(); 

            btnsDiv.appendChild(createdElements[0]);

            if (!createdElements[1]) return;

            createdElements[1].dataset.group = createdElements[1].id;


          });

        //Finally we set the grid-Template for btnsDiv
        btnsDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(
          btnsDiv,
          3);
      })();

      function selectRelevantHoursAccordingToTheDay(): Button[] {
        //args.mass is a boolean that tells whether the button prayersArray should include all the hours of the Book Of Hours, or only those pertaining to the mass according to the season and the day on which the mass is celebrated
        let hours = [hoursBtns[1], hoursBtns[2], hoursBtns[3]]; //Those are the 3rd, 6th and 9th hours

        if (
          [
            Seasons.GreatLent,
            Seasons.JonahFast,
            Seasons.NativityParamoun,
            Seasons.BaptismParamoun,
          ].includes(Season) &&
          ![0, 6].includes(weekDay)
          //We are during the Great Lent or during the Nativity Paramoun or the Baptism Paramoun and today is a Friday. In such cases, we pray the 3rd, 6th, 9th, 11th, and 12th hours
        )
          hours.push(hoursBtns[4], hoursBtns[5]);
        else if (
          !isFast
          ||
          //We remove the 9th hour in the following days/periods
          [0, 6].includes(weekDay) //Whatever the period, if we are a Saturday or a Sunday, we pray only the 3rd and 6th Hours
        )
          hours.pop(); //we remove the 9th hour

        return hours;
      };

      async function hourBtnOnClick(hourBtnId: string) {
        let expandables = selectElementsByDataSetValue(containerDiv, 'HourExpandable', { endsWith: true }, 'group').filter(div => div.classList.contains('Expandable'));

        if (expandables.length < 1) return;

        expandables
          .forEach(expandable =>
            expandable.id.startsWith(hourBtnId) ?
              showOrHideHour(expandable)
              : hideHour(expandable)
          );

        function hideHour(expandable: HTMLDivElement) {
          if (expandable.classList.contains(hidden)) return;

          expandable.classList.add(hidden);

          Array.from(sideBarTitlesContainer.children)
            .filter((div: HTMLDivElement) => div.dataset.group === expandable.id)
            .forEach(div => div.remove());

        };

        async function showOrHideHour(expandable: HTMLDivElement) {
          (async function showHour() {

            if (expandable.classList.contains(hidden)) return;

            let children = Array.from(expandable.children) as HTMLDivElement[];

            collapseAllTitles(children);

            let rightSideBarTitles =
              await showTitlesInRightSideBar(
                children.filter(div => isTitlesContainer(div)).reverse(),
                undefined,
                false,
                expandable.id,
                false
              );

            rightSideBarTitles
              .forEach(titleDiv =>
                titleDiv.classList.remove(hidden));

            floatOnTop(btnsDiv, "5px");//Making the hours buttons container float on top

            masterBtnDiv.classList.add(hidden); //Hiding the master button

            createFakeAnchor(expandable.id); //Jumbing to the begining of the expandable container
          })();

          (function hideHour() {
            if (!expandable.classList.contains(hidden)) return;
            btnsDiv.style.top = "";
            btnsDiv.style.position = "";
            masterBtnDiv.classList.remove(hidden);
            createFakeAnchor(btnsDiv.id);
            Array.from(sideBarTitlesContainer.children)
              .filter((div: HTMLDivElement) => div.dataset.group === expandable.id)
              .forEach(div => div.remove());
          })();
        };

      };

      function InsertHourFinalPrayers(hourBtn: Button) {
        let Agios: string =
          Prefix.commonPrayer + "Agios&D=$copticFeasts.AnyDay",
          Kyrielison41Times: string =
            Prefix.commonPrayer + "Kyrielison41Times&D=$copticFeasts.AnyDay",
          KyrielisonIntro: string = Kyrielison41Times.replace(
            "&D=",
            "NoMassIntro&D="
          ),
          KyrielisonMassIntro: string = Kyrielison41Times.replace(
            "&D=",
            "MassIntro&D="
          ),
          HolyLordOfSabaot: string =
            Prefix.commonPrayer +
            "HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay",
          HailToYouMaria: string =
            Prefix.commonPrayer + "WeSaluteYouMary&D=$copticFeasts.AnyDay",
          WeExaltYou: string =
            Prefix.commonPrayer + "WeExaltYouStMary&D=$copticFeasts.AnyDay",
          Creed: string = Prefix.commonPrayer + "Creed&D=$copticFeasts.AnyDay",
          OurFatherWhoArtInHeaven: string =
            Prefix.commonPrayer +
            "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay";


        let sequence: string[];

        if (hoursBtns.indexOf(hourBtn) === hoursBtns.length - 1) {
          //This is the last hour btn
          sequence = [
            WeExaltYou,
            Creed,
            KyrielisonMassIntro,
            Kyrielison41Times,
            HolyLordOfSabaot,
            OurFatherWhoArtInHeaven,
          ];
        } else if (hoursBtns.indexOf(hourBtn) === hoursBtns.length - 2) {
          //this is the before last hour btn
          sequence = [Agios, OurFatherWhoArtInHeaven, HailToYouMaria];
        } else {
          //Any other hour before the 2 last
          sequence = [
            KyrielisonIntro,
            Kyrielison41Times,
            HolyLordOfSabaot,
            OurFatherWhoArtInHeaven,
          ];
        }

        insertCommonPrayer(
          hourBtn,
          sequence,
          hourBtn.prayersSequence.find((title) =>
            title.includes("HourLitanies&D=")
          )
        );

        function insertCommonPrayer(
          btn: Button,
          titles: string[],
          litanies: string
        ) {
          if (!titles || titles.length === 0) return console.log("no sequence");
          btn.prayersSequence.splice(
            btn.prayersSequence.indexOf(litanies) + 1,
            0,
            ...titles
          );
        }
      }
    })();

    function insertMassReading(
      readingPrefix: string,
      readingArray: string[][][],
      readingIntro: { AR: string; FR: string; EN: string },
      readingEnd: { AR: string; FR: string; EN: string },
      date: string = copticReadingsDate
    ) {
      let readings,
        language: string[] = getLanguages(
          PrayersArraysKeys.find((array) => array[0] === readingPrefix)[1]
        );

      readings = findMassReadingOtherThanGospel(
        readingPrefix,
        readingArray,
        { beforeOrAfter: "beforebegin", el: readingsAnchor },
        btnDocFragment,
        false,
        date
      ) as HTMLElement[][];

      if (!readings || readings.length === 0) return;

      if (readingIntro)
        //We start by inserting the introduction before the reading
        insertPrayersAdjacentToExistingElement({
          tables: [
            [
              [
                readings[0][0].dataset.root + "&C=ReadingIntro",
                readingIntro.AR,
                readingIntro.FR,
                readingIntro.EN,
              ],
            ],
          ],
          languages: ['AR', 'FR', 'EN'],
          position: { beforeOrAfter: "beforebegin", el: readings[0][1] },
          container: btnDocFragment,
        });

      if (readingEnd)
        //Then we insert the end of the reading
        insertPrayersAdjacentToExistingElement({
          tables: [
            [
              [
                readings[0][0].dataset.root + "&C=ReadingEnd",
                readingEnd.AR,
                readingEnd.FR,
                readingEnd.EN,
              ],
            ],
          ],
          languages: ['AR', 'FR', 'EN'],
          position: { beforeOrAfter: "beforebegin", el: readingsAnchor },
          container: btnDocFragment,
        });
    }
  },
});

const btnMassBaptised: Button = new Button({
  btnID: "btnMassBaptised",
  label: {
    AR: "قٌدَّاسِ المُؤْمِنينَ",
    FR: "Liturgie des Croyants",
    EN: "Baptized Mass",
  },
  parentBtn: btnMass,
  children: [btnMassStBasil, btnMassStGregory, btnMassStCyril], //We are removing Mass StJohn for now
});

const btnReadingsGospelIncenseVespers: Button = new Button({
  btnID: "btnReadingsGospelIncenseVespers",
  label: {
    AR: "إنجيل عشية",
    FR: "Evangile  Vêpres",
    EN: "Vespers Gospel",
  },
  showPrayers: true,
  onClick: () => {
    btnReadingsGospelIncenseDawn.onClick(Prefix.gospelVespers);
  },
});

const btnReadingsGospelIncenseDawn: Button = new Button({
  btnID: "btnReadingsGospelIncenseDawn",
  label: {
    AR: "إنجيل باكر",
    FR: "Evangile Aube",
    EN: "Gospel Dawn",
  },
  showPrayers: true,
  onClick: (gospelPrefix: string = Prefix.gospelDawn) => {
    let prayersArray: [string, string, Function] = PrayersArraysKeys.find((entry) => entry[0] === gospelPrefix);

    if (!prayersArray) return console.log("Didn\'t find the prayersArray");

    containerDiv.innerHTML = "";

    getGospelReadingAndResponses({
      liturgy: gospelPrefix,
      prayersArray: prayersArray[2](),
      languages: getLanguages(prayersArray[1]),
      container: containerDiv,
      isMass: false,
      clearContainer: true,
    });
    scrollToTop(); //scrolling to the top of the page
  },
});

const btnReadingsGospelNight: Button = new Button({
  btnID: "btnReadingsGospelNight",
  label: {
    AR: "إنجيل المساء",
    FR: "Evangile du Soir",
    EN: "Night Gospel",
  },
  showPrayers: true,
  prayersSequence: [
    Prefix.gospelNight + "Psalm",
    Prefix.gospelNight + "Gospel",
  ],
  onClick: () => {
    btnReadingsGospelIncenseDawn.onClick(Prefix.gospelNight);
  },
});

const btnReadingsPropheciesDawn: Button = new Button({
  btnID: "btnReadingsPropheciesDawn",
  label: {
    AR: "نبوات باكر",
    FR: "Propheties Matin",
  },
  showPrayers: true,
  onClick: () => {
    findMassReadingOtherThanGospel(
      Prefix.propheciesDawn,
      ReadingsArrays.PropheciesDawnArrayFR,
      { beforeOrAfter: undefined, el: undefined },
      containerDiv,
      true
    );
    scrollToTop(); //scrolling to the top of the page
  },
});

const btnDayReadings: Button = new Button({
  btnID: "btnDayReadings",
  label: {
    AR: "قراءات اليوم",
    FR: "Lectures du jour",
    EN: "Day's Readings",
  },
  onClick: (returnBtnChildren: boolean = false) => {
    //We set the button's children
    btnDayReadings.children = [
      btnReadingsGospelIncenseDawn,
      btnReadingsGospelIncenseVespers,
      new Button({
        btnID: "btnReadingsStPaul",
        label: {
          AR: "البولس",
          FR: "Epître de Saint Paul",
          EN: "Pauline Epistle",
        },
        showPrayers: true,
        onClick: (returnBtnChildren: boolean = false) => {
          if (returnBtnChildren) return;
          findMassReadingOtherThanGospel(
            Prefix.stPaul,
            ReadingsArrays.StPaulArrayFR,
            { beforeOrAfter: undefined, el: undefined },
            containerDiv,
            true
          );

          scrollToTop(); //scrolling to the top of the page
        },
      }),
      new Button({
        btnID: "btnReadingsKatholikon",
        label: {
          AR: "الكاثوليكون",
          FR: "Katholikon",
        },
        showPrayers: true,
        onClick: (returnBtnChildren: boolean = false) => {
          if (returnBtnChildren) return;

          findMassReadingOtherThanGospel(
            Prefix.katholikon,
            ReadingsArrays.KatholikonArrayFR,
            { beforeOrAfter: undefined, el: undefined },
            containerDiv,
            true
          );
          scrollToTop(); //scrolling to the top of the page
        },
      }),
      new Button({
        btnID: "btnReadingsPraxis",
        label: {
          AR: "الإبركسيس",
          FR: "Praxis",
        },
        showPrayers: true,
        onClick: (returnBtnChildren: boolean = false) => {
          if (returnBtnChildren) return;
          findMassReadingOtherThanGospel(
            Prefix.praxis,
            ReadingsArrays.PraxisArrayFR,
            { beforeOrAfter: undefined, el: undefined },
            containerDiv,
            true
          );
          scrollToTop(); //scrolling to the top of the page
        },
      }),
      new Button({
        btnID: "btnReadingsSynaxarium",
        label: {
          AR: "السنكسار",
          FR: "Synaxarium",
        },
        showPrayers: true,
        onClick: function (returnBtnChildren: boolean = false) {
          if (returnBtnChildren) return;
          findMassReadingOtherThanGospel(
            Prefix.synaxarium,
            ReadingsArrays.SynaxariumArrayFR,
            { beforeOrAfter: undefined, el: undefined },
            containerDiv,
            true,
            copticDate
          ); //!CAUTION: notice that we passed to the function the readingDate argument because during the GreatLent period and the Jonah Fast, the copticReadingsDate is formatted like 'GL10', we hence pass the copticDate to prevent the function from searching for the Synaxarium of the day by the copticReadingsDate
          scrollToTop(); //scrolling to the top of the page
        },
      }),
      new Button({
        btnID: "btnReadingsGospelMass",
        label: {
          AR: "إنجيل القداس",
          FR: "l'Evangile",
          EN: "Gospel",
        },
        showPrayers: true,

        onClick: (returnBtnChildren: boolean = false) => {
          if (returnBtnChildren) return;
          btnReadingsGospelIncenseDawn.onClick(Prefix.gospelMass);
          scrollToTop(); //scrolling to the top of the page
        },
      }),
    ];

    if (Season === Seasons.HolyWeek) {
      //We should put here child buttons for the Holy Week prayers and readings
      let div = document.createElement("div");
      div.innerText =
        "We are during the Holy Week, there are no readings, please go to the Holy Week Prayers";
      containerDiv.appendChild(div);
      return;
    }

    (function adaptToGreatLentAndJonahFast() {
      if (![Seasons.GreatLent, Seasons.JonahFast].includes(Season)) return;
      if (copticReadingsDate === copticFeasts.Resurrection) return;

      (function ifWeAreNotASaturday() {
        if (weekDay === 6) return;

        //We remove the Vespers because there are no Vespers during the Great Lent except for Saturday. Also there are no vespers during the Jonah Fast which lasts for 4 days from Monday to Thursday
        btnDayReadings.children = btnDayReadings.children.filter(
          (btn) => btn !== btnReadingsGospelIncenseVespers
        );

        if (Season === Seasons.JonahFast) return; ///The following concerns only the Great Lent

        //If we are a Sunday and the GospelNight button is not included, we will add it.
        if (
          weekDay === 0 &&
          !btnDayReadings.children.includes(btnReadingsGospelNight)
        )
          btnDayReadings.children.push(btnReadingsGospelNight);

        (function ifWeAreNotASunday() {
          if (weekDay === 0) return;

          //If we are not a Sunday (i.e., we are during any week day other than Sunday and Saturday), we will  add the Prophecies button to the list of buttons
          if (!btnDayReadings.children.includes(btnReadingsPropheciesDawn))
            btnDayReadings.children.unshift(btnReadingsPropheciesDawn);

          //Also if we  are not a Sunday, we will remove the Night Gospel, if included
          btnDayReadings.children = btnDayReadings.children.filter(
            (btn) => btn !== btnReadingsGospelNight
          );
        })();
      })();
    })();

    if (returnBtnChildren) return btnDayReadings.children;
  },
});

const btnBookOfHours: Button = new Button({
  btnID: "btnBookOfHours",
  label: { AR: "الأجبية", FR: "Agpia", EN: "Book of Hours" },
  docFragment: new DocumentFragment(),
  parentBtn: btnMainMenu,
  showPrayers: true,
  languages: [...prayersLanguages],
  children: [],
  onClick: (returnBtnChildren: boolean = false) => {
    if (btnBookOfHours.children.length > 1) return btnBookOfHours.children;

    let OurFatherWhoArtInHeaven: string =
      Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay",
      AngelsPrayers: string =
        Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay",
      HailToYouMaria: string =
        Prefix.commonPrayer + "WeSaluteYouMary&D=$copticFeasts.AnyDay",
      WeExaltYou: string =
        Prefix.commonPrayer + "WeExaltYouStMary&D=$copticFeasts.AnyDay",
      Agios: string =
        Prefix.commonPrayer + "Agios&D=$copticFeasts.AnyDay",
      Kyrielison41Times: string =
        Prefix.commonPrayer + "Kyrielison41Times&D=$copticFeasts.AnyDay",
      KyrielisonIntro: string = Kyrielison41Times.replace(
        "&D=",
        "NoMassIntro&D="
      ),
      HolyLordOfSabaot: string =
        Prefix.commonPrayer + "HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay",
      Creed: string = Prefix.commonPrayer + "Creed&D=$copticFeasts.AnyDay",
      AllHoursFinalPrayer: string =
        Prefix.bookOfHours + "AllHoursFinalPrayer&D=$copticFeasts.AnyDay";

    btnBookOfHours.children = [];

    (function addAChildButtonForEachHour() {
      (function addHoursBtns() {

        Object.entries(bookOfHours)
          .forEach((entry) => {
            let hourName = entry[0],
              btnLabel = entry[1][1];
            let hourBtn = new Button({
              btnID: "btn" + hourName,
              label: btnLabel,
              languages: btnBookOfHours.languages,
              showPrayers: true,
              parentBtn: btnBookOfHours,
              onClick: (isMass: boolean = false) =>
                hourBtnOnClick(hourBtn, hourName, isMass),
              afterShowPrayers: () => hourBtnAfterShowPrayer(btnLabel),
            });

            btnBookOfHours.children.push(hourBtn);
          });

      })();

      (function addOtherPrayersBtns() {
        let otherPrayers = [Prefix.bookOfHours + 'BeforeCommunion&D=$copticFeasts.AnyDay', Prefix.bookOfHours + 'AfterCommunion&D=$copticFeasts.AnyDay'];
        let otherPrayersBtn = new Button({
          btnID: 'otherPrayersBtn',
          label: {
            AR: 'صلوات أخرى',
            FR: 'Diverses prières',
            EN: 'Various Prayers'
          },
          children: otherPrayers.map(title => otherPrayerBtn(title))
        });

        btnBookOfHours.children.push(otherPrayersBtn);


        function otherPrayerBtn(title: string): Button {
          let table = findTable(title, BookOfHoursPrayersArray) || undefined;
          if (!table) return undefined;
          return new Button({
            btnID: "btnOtherPrayer" + otherPrayers.indexOf(title) + 1,
            label: {
              AR: table[0][btnBookOfHours.languages.indexOf('AR') + 1],
              FR: table[0][btnBookOfHours.languages.indexOf('FR') + 1]
            },
            onClick: () => {
              setCSS(
                showPrayers({
                  table: table,
                  languages: btnBookOfHours.languages,
                  container: containerDiv,
                  clearContainerDiv: true,
                  clearRightSideBar: true
                }) || []);
              scrollToTop();
            },
          });
        }
      })();



      function hourBtnAfterShowPrayer(btnLabel) {
        let children = Array.from(
          containerDiv.children as HTMLCollectionOf<HTMLDivElement>
        ).filter((div) => div.dataset.root);

        children.forEach((htmlRow) =>
          ["Priest", "Diacon", "Assembly"].forEach((className) =>
            htmlRow.classList.replace(className, "NoActor")
          )
        );

        if (btnLabel !== bookOfHours.VeilHour[1]) return;
        //If we are in the 'Setar Hour', we need to remove from Psalm 118 all the paragraphs except paragraphs 20, 21, and 22. We will do this by adding a btn.afterShowPlayers function
        let psalm118 = children.filter((div) =>
          div.dataset.root.startsWith(Prefix.bookOfHours + "Psalm118")
        );

        psalm118
          .filter(
            (div) => psalm118.indexOf(div) > 0 && psalm118.indexOf(div) < 20
          )
          .forEach((div) => div.remove());
      }

      //Adding the onClick() property to the button
      function hourBtnOnClick(btn: Button, hourName: string, isMass: boolean) {
        (function buildBtnPrayersSequence() {
          //We will add the prayers sequence to btn.prayersSequence[]
          btn.prayersSequence = Object.entries(bookOfHours)
            .find((entry) => entry[0] === hourName)[1][0]
            .map((title) => getSequence("Psalm" + title.toString()));

          btn.prayersSequence.unshift(getSequence(hourName + "Title")); //This is the title of the hour prayer

          ["Gospel", "Litanies"].forEach((title) =>
            btn.prayersSequence.push(getSequence(hourName + title))
          );

          //Then, we add the End of all Hours' prayers (ارحمنا يا الله ثم ارحمنا) except for the 1st and 2nd services of the Midnight Prayer

          (function addFinalPrayersToSequence() {
            if (isMass) return; //!Important: If the onClick() method is called when the button is displayed in the Unbaptised Mass, we do not add anything else to the btn's prayersSequence
            let btnLable = btn.label,
              HourIntro: string[] = [
                Prefix.commonPrayer +
                "ThanksGivingPart1&D=$copticFeasts.AnyDay",
                Prefix.commonPrayer +
                "ThanksGivingPart2&D=$copticFeasts.AnyDay",
                Prefix.commonPrayer +
                "ThanksGivingPart3&D=$copticFeasts.AnyDay",
                Prefix.commonPrayer +
                "ThanksGivingPart4&D=$copticFeasts.AnyDay",
                Prefix.bookOfHours + "Psalm50&D=$copticFeasts.AnyDay",
              ],
              endOfHourPrayersSequence: string[] = [
                AngelsPrayers,
                Agios,
                OurFatherWhoArtInHeaven,
                HailToYouMaria,
                WeExaltYou,
                Creed,
                KyrielisonIntro,
                Kyrielison41Times,
                HolyLordOfSabaot,
                OurFatherWhoArtInHeaven,
                getSequence(hourName + "EndOfHourPrayer"),
                AllHoursFinalPrayer,
                OurFatherWhoArtInHeaven,
              ];

            if (btnLable === bookOfHours.MidNight1Hour[1])
              HourIntro.push(getSequence(hourName + "WakeUpSonsOfLight")); //We add the 'Wake Up Sons of Light' for the 1st Service of Midnight

            if (btnLable === bookOfHours.TwelvethHour[1])
              endOfHourPrayersSequence.splice(0, 1); //If it is the 12th (Night) Hour, we remove the Angels Prayer from endOfHourPrayersSequence

            btn.prayersSequence.splice(1, 0, ...HourIntro); //We  add the titles of the HourIntro before the 1st element of btn.prayersSequence[]

            if (btnLable === bookOfHours.MidNight3Hour[1]) {
              //Removing all the prayers before the Creed (index = 4) and replacing them with other prayers
              endOfHourPrayersSequence.splice(
                0,
                5,
                Kyrielison41Times,
                HolyLordOfSabaot,
                OurFatherWhoArtInHeaven,
                getSequence(hourName + "2ndGospel")
              );
              //Inserting the Priests Absolution at the end
              endOfHourPrayersSequence.push(
                getSequence(hourName + "PriestsAbsolution")
              );
            }

            if (
              [
                bookOfHours.FirstHour[1],
                bookOfHours.TwelvethHour[1],
                bookOfHours.MidNight3Hour[1],
              ].includes(btnLable)
            ) {
              //If it is the 1st hour (Dawn) or the 12th Hour (Nighth) prayer: We add the End Of Hour Prayers
              btn.prayersSequence.push(...endOfHourPrayersSequence);
            } else {
              //If its is not the 1st Hour (Dawn) or the 12th Hour (Night), we insert only Kyrielison 41 times, and "Holy Lord of Sabaot" and "Our Father Who Art In Heavean"
              btn.prayersSequence.push(
                KyrielisonIntro,
                Kyrielison41Times,
                HolyLordOfSabaot,
                OurFatherWhoArtInHeaven
              );
            }
          })();
        })();
        function getSequence(replaceWith: string): string {
          return (
            Prefix.bookOfHours +
            "&D=$copticFeasts.AnyDay".replace("&D=", replaceWith + "&D=")
          );
        }
      }
    })();

    if (returnBtnChildren) return btnBookOfHours.children;

    scrollToTop();
    return btnBookOfHours.prayersSequence;
  },
});

const btnPsalmody: Button = new Button({
  btnID: "btnPsalmody",
  label: {
    AR: "الإبصلمودية السنوية",
    FR: "Psalmodie",
  },
  languages: [...prayersLanguages],
  showPrayers: true,
  onClick: () => {
    btnPsalmody.prayersSequence = PsalmodyPrayersSequences.PsalmodyYear;

    if (Season === Seasons.KiahkWeek1 || Season === Seasons.KiahkWeek2)
      btnPsalmody.prayersSequence = PsalmodyPrayersSequences.PsalmodyKiahk;
  },
});

/**
 * Makes a buttons div container floating on the top of the page
 * @param {HTMLDivElement} btnContainer - the buttons div container we want to make float;
 * @param {string} top - the value of the btnConainer.style.top
 */
function floatOnTop(
  btnContainer: HTMLDivElement,
  top: string
) {
  btnContainer.style.position = "fixed";
  btnContainer.style.top = top;
  btnContainer.style.justifySelf = "center";
};

/**
 * Fetchs and displaying any readings other than the Gospel and the Psalm
 * @param {string} readingPrefix
 * @param {string[][][]} readingArray - The array where the reading's texts are to be found
 * @param {HTMLElement} container - The container where the text will be displayed after fetched
 * @param {boolean} clearContainer - specifies whether the container should be cleared or not before the reading is displayed
 * @returns
 */
function findMassReadingOtherThanGospel(
  readingPrefix: string,
  readingArray: string[][][],
  position: { beforeOrAfter: InsertPosition; el: HTMLElement },
  container: HTMLElement | DocumentFragment = containerDiv,
  clearContainer: boolean = false,
  readingDate?: string
): HTMLElement[][] | void {
  //@ts-ignore
  if (clearContainer) container.innerHTML = "";
  if (container.children.length === 0)
    container.appendChild(document.createElement("div"));
  if (!position.el) position.el = container.children[0] as HTMLElement;
  if (!position.beforeOrAfter) position.beforeOrAfter = "beforebegin";
  if (!readingDate) readingDate = copticReadingsDate;

  let reading = readingArray.find((table) => isMultiDatedTitleMatching(splitTitle(table[0][0])[0], readingDate));

  if (!reading)
    return console.log(
      "Did not find a reading for the current copticReadingsDate"
    );
  return insertPrayersAdjacentToExistingElement({
    tables: [reading],
    languages: getLanguages(
      PrayersArraysKeys.find((array) => array[0] === readingPrefix)[1]
    ),
    position: position,
    container: containerDiv,
  });
}

/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayersSequence(liturgy: string, isMass: boolean): string[] {
  //this function sets the date or the season for the Psalm response and the gospel response
  const prayersSequence: string[] = [
    Prefix.psalmResponse + "&D=$copticFeasts.AnyDay", //This is its default value
    liturgy + "Psalm&D=",
    liturgy + "Gospel&D=",
    Prefix.gospelResponse + "&D=$copticFeasts.AnyDay", //This is its default value
  ]; //This is the generic sequence for the prayers related to the lecture of the gospel at any liturgy (mass, incense office, etc.). The OnClick function triggered by the liturgy, adds the dates of the readings and of the psalm and gospel responses

  if (!isMass) return prayersSequence; //If we are not calling the function within a mass/incense liturgy, we will not need to set the Psalm and Gospel Responses, we will return the prayersSequence array

  //setting the psalm and gospel responses
  (function setPsalmAndGospelResponses() {
      if (Number(copticDay) === 29 && [4, 5, 6].includes(Number(copticMonth)))
      return; //we are on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast), and Touba and Amshir (they are excluded because they precede the annonciation)

    let PsalmAndGospelResponses = PsalmAndGospelPrayersArray.filter(
      (table) =>
        isMultiDatedTitleMatching(table[0][0], copticDate) ||
        isMultiDatedTitleMatching(table[0][0], Season)
    );

    let psalmResponse = PsalmAndGospelResponses.filter((table) =>
      table[0][0].startsWith(Prefix.psalmResponse)
    );
    let gospelResponse = PsalmAndGospelResponses.filter((table) =>
      table[0][0].startsWith(Prefix.gospelResponse)
    );

    if (Season === Seasons.GreatLent) {
      [0, 6].includes(weekDay)
        ? (gospelResponse = [
          gospelResponse.find((table) => table[0][0].includes("Sundays&D=")),
        ])
        : (gospelResponse = gospelResponse =
          [gospelResponse.find((table) => table[0][0].includes("Week&D="))]);
    } else if (
      [Seasons.JonahFast, Seasons.JonahFeast, Seasons.StMaryFast].includes(Season)
      ||
      [copticFeasts.EndOfGreatLentFriday, copticFeasts.LazarusSaturday,
      ].includes(copticReadingsDate)
      ||
      copticDate === copticFeasts.CanaWedding) {
      //For these occasions, there are different gospel responses for the Dawn Incense Office, and the Unbaptised Mass. We will filter the results

      let prefix: string = "";
      if (liturgy === Prefix.gospelDawn) prefix = 'Dawn';
      if (liturgy === Prefix.gospelMass) prefix = 'Mass';

      if (Season === Seasons.JonahFast) prefix += copticReadingsDate.split(Season)[1];//There are different responses for the Dawn Gospel and the Mass Gospel for each day of the Jonah Fast. We will  add the number of the day of Jonah Fast: eg.: "Mass1&D=Jonah1&C=Title" (for 1st day of the Jonah Fast), Dawn2&D=Jonah2&C=Title", etc.

      (function ifGospelVespers() {
        //If the liturgy is Vespers incesnse, in some occasions there are specific gospel response for the Vespers
        if (liturgy !== Prefix.gospelVespers) return;

        if (
          Season === Seasons.StMaryFast
          ||
          [copticFeasts.EndOfGreatLentFriday,
          copticFeasts.LazarusSaturday,
          ].includes(copticReadingsDate))

          prefix = 'Vespers';
      })();


      gospelResponse = [
        gospelResponse.find((table) =>
          table[0][0].includes(prefix + "&D=")
        ),
      ];
    }

    if (psalmResponse.length > 0 && psalmResponse[0].length > 0)
      prayersSequence[0] = splitTitle(psalmResponse[0][0][0])[0];
    if (gospelResponse.length > 0 && gospelResponse[0].length > 0)
      prayersSequence[3] = splitTitle(gospelResponse[0][0][0])[0];
  })();

  return prayersSequence;
}

/**
 *
 * @param {HTMLDivElement} targetElement - the html child of containerDiv, in relation to which the newly created div containing the html buttons elements, will be placed according to a given position
 * @param {Button[]} btns - a list of Button for each we will create an inline redirection html button
 * @param {InsertPosition} position - an object providing the position where the newly created div containing the html elements, will be placed compared. The div is placed in a position (i.e., the beforeOrAfter property) in relation ton an html element in the containerDiv (el) which is the targetEelement
 *@param {string} btnsContainerID - the id of the div container to which the html buttons will be appended. This id may be needed to select the div after redirection
 */
async function redirectToAnotherMass(
  btns: Button[],
  position: { beforeOrAfter: InsertPosition; el: HTMLElement },
  btnsContainerID: string
) {
  if (!position.el) return;

  let redirectTo: Button[] = [];
  btns.map((btn) => {
    //for each button in the btns array, we will create a fake Button and will set its onClick property to a function that retrieves the text of the concerned mass
    let newBtn: Button = new Button({
      btnID:
        "GoTo_" +
        btn.btnID.split("btn")[1] +
        "_From_" +
        position.el.dataset.root,
      label: {
        AR: btn.label.AR,
        FR: btn.label.FR,
      },
      cssClass: inlineBtnClass,
      onClick: () => {
        showChildButtonsOrPrayers(btn); //We simulated as if btn itself has been clicked, which will show all its prayers, children, etc.

        //if there is an element in containerDiv having the same data-root as targetElement
        if (containerDiv.querySelector("#" + btnsContainerID))
          createFakeAnchor(btnsContainerID);
      },
    });
    redirectTo.push(newBtn);
  });
  insertRedirectionButtons(redirectTo, position, btnsContainerID);
}
/**
 * Scrolls to the top of containerDiv
 */
async function scrollToTop() {
  //We scroll to the beginning of the page after the prayers have been displayed
  createFakeAnchor("homeImg");
}

/**
 * Retrieves and adds html div elements representing the Gospel Litany, the Gospel and psalm introductions, and the Gospel and Psalm readings for a given liturgy
 * @param {string} liturgy - the prefix of the liturgie for which we want to retrieve the gospel reading
 * @param {Button | {prayersArray:string[][][], languages:string[]}} btn - the  button object or any object  having as property a string[][][] containing the the text of the gospel and the psalm, and a string[] containing the languages order of the gospel and psalm readings
 * @param {HTMLElement | DocumentFragment} container - the html element to which the html elements (i.e. div) containing the gospel will be appended after being created
 * @param {HTMLElement} gospelInsertionPoint - the html element in relation to which the created html elements will be inserted in the container
 * @returns
 */
async function getGospelReadingAndResponses(args: {
  isMass: boolean;
  liturgy: string;
  prayersArray: string[][][];
  languages: string[];
  container?: HTMLElement | DocumentFragment;
  gospelInsertionPoint?: HTMLElement;
  clearContainer?: boolean;
}) {
  if (!args.container) args.container = containerDiv;
  if (args.container === containerDiv && args.clearContainer)
    args.container.innerHTML = "";
  if (args.container.children.length === 0)
    args.container.appendChild(document.createElement("div"));
  if (!args.prayersArray)
    return console.log(
      "the button passed as argument does not have prayersArray"
    );

  if (!args.languages)
    args.languages = getLanguages(getArrayNameFromArray(args.prayersArray));

  if (!args.gospelInsertionPoint)
    args.gospelInsertionPoint = selectElementsByDataSetValue(
      args.container,
      Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay")[0];

  //We start by inserting the standard Gospel Litany
  (function insertGospelLitany() {
    if (!args.isMass) return;
    let gospelLitanySequence = [
      Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay",
      Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay",
    ]; //This is the sequence of the Gospel Prayer/Litany for any liturgy

    let gospelLitanyPrayers = gospelLitanySequence.map((title) =>
      findTable(title, CommonPrayersArray)
    ) as string[][][];

    if (!gospelLitanyPrayers || gospelLitanyPrayers.length === 0)
      return console.log("could not find the gospel litany");

    insertPrayersAdjacentToExistingElement({
      tables: gospelLitanyPrayers,
      languages: prayersLanguages,
      position: {
        beforeOrAfter: "beforebegin",
        el: args.gospelInsertionPoint,
      },
      container: args.container,
    });
  })();



 /*  if (args.isMass &&
    new Map(JSON.parse(localStorage.showActors)).get("Diacon") === false)
    return alert("Diacon Prayers are set to hidden, we cannot show the gospel"); //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers */

  let anchorDataRoot =
    Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay";

  let gospelIntroduction =
    selectElementsByDataSetValue(args.container, anchorDataRoot, undefined, 'group')
      .filter(div => !isCommentContainer(div));//!We do not include the comments because if the user hides them, the index of the elements will change


  if (args.isMass && gospelIntroduction.length < 1)
    return console.log("gospelIntroduction.length = 0 ");

  let prayersSequence: string[] = setGospelPrayersSequence(
    args.liturgy,
    args.isMass
  ); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']

  //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
  let date = copticReadingsDate;
  if (args.liturgy === Prefix.gospelVespers) {
    //date = getTomorowCopticReadingDate();
    //console.log(date);
  }

  let gospel: string[][][] =
    args.prayersArray
      .filter((table) =>
        isMultiDatedTitleMatching(splitTitle(table[0][0])[0], date));

  if (gospel.length === 0) return console.log("gospel.length = 0"); //if no readings are returned from the filtering process, then we end the function

  /**
   * Appends the gospel and psalm readings before gospelInsertionPoint(which is an html element)
   */
  (function insertPsalmAndGospelReadings() {
    if (!args.isMass) {
      //If we are not showing the gospel reading in a Mass context (i.e., if the user is clicking on the 'Day Readings Button' to show the readings of the day). We will create a  div container  to which we will append the reading text. We will append the container div as first element of containerDiv
      containerDiv.append(document.createElement("div"));
      args.gospelInsertionPoint = containerDiv.children[0] as HTMLDivElement;//We set args.gospelInsertionPoint as the container div we've just created.
    }
    gospel
      .forEach((table) => {
        //gospel[] should include 2 tables: the first table is the psalm and its title is like '....Psalm&D=...'. The 2nd is the gospel: its title is like '....Gospel&D=...'.

        let el: HTMLElement; //!We, on purpose, created a new variable for the element before which we will show the reading, in order to keep args.gospelInsertionPoint unchanged because we need it later if we are within a Mass or liturgy context. 

        (function setInsertionPoint() {
          if (!args.isMass || table[0][0].includes("Gospel&D="))
            //If we are not displaying the gospel in a Mass or a liturgy context, we don't need to insert the psalm. We will just show the text of the gospel reading itself. Hence, the div element will be same as args.gospelInsertionPoint
            el = args.gospelInsertionPoint;

          else if (table[0][0].includes("Psalm&D="))
            //We are within a Mass or liturgy context, and need to display the Psalm. We will hence change the place in which the text will be inserted.
            el = gospelIntroduction[gospelIntroduction.length - 1];
        })();

        if (!el) return console.log('The insertion point is not valid');

        function getGospelOrPsalmTable(): string[][] {
          //! We didn't push the array to the table directly because otherwise it will add a new row to the original table each time we click on the Unbaptised Mass button or the Gospel Reading button


          //We will include the gospel end: 'Glory To God Forever' and the Psalm End 'Hallelujah'


          if (table[0][0].includes('Gospel&D='))
            return [...table, getReadingEnd(ReadingsIntrosAndEnds.gospelEnd)]; //We return a copy of the table not the original table in order to avoid modifying the original table.
          else if (table[0][0].includes('Psalm&D='))
            return [...table, getReadingEnd(ReadingsIntrosAndEnds.psalmEnd)]; //We return a copy of the table not the original table in order to avoid modifying the original table.

          function getReadingEnd(end: { AR: string; FR: string; EN: string }): string[] {
            //We will return an array (i.e., a new row in the table) containing the text of the "Gospel End" (Glory to God Forever) in each language. This array needs to be constructed like this: ['Row title', 'End text in Arabic, 'End text in French or whatever other western language', 'End text in English']
            return [
              //The first element of the array contains the title of the row
              Prefix.same + '&C=ReadingEnd', //!Notice that we are giving it as class 'ReadingEnd'
              //The following elements represent the text of the 'Gospel End' in each language, in the same order as the languages passed in args.languages.
              ...args.languages
                .map(lang => end[lang])
            ];

          };
        };

        insertPrayersAdjacentToExistingElement({
          tables: [getGospelOrPsalmTable()],
          languages: args.languages,
          position: {
            beforeOrAfter: "beforebegin",
            el: el,
          },
          container: args.container,
        });
      });
  })();

  (function insertPsalmAndGospelResponses() {
    if (!args.isMass) return; //If we are not calling the function with a Mass or a liturgy (Unbpaptized Mass, or Incense Dawn/Vespers) context, we will not insert the Gospel and Psalm responses 
    //Inserting the gospel response
    insertResponse(3, args.gospelInsertionPoint);

    //We remove the insertion point placeholder
    args.gospelInsertionPoint.remove();

    let gospelPrayer = selectElementsByDataSetValue(
      args.container,
      Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay"); //This is the 'Gospel Litany'. We will insert the Psalm response after its end

    if (!gospelPrayer) return;

    insertResponse(
      0,
      gospelPrayer[gospelPrayer.length - 1]
        .previousElementSibling as HTMLElement
    ); //Inserting Psalm Response if any

    function insertResponse(index: number, insertion: HTMLElement) {
      let response: string[][] = PsalmAndGospelPrayersArray.find(
        (tbl) => splitTitle(tbl[0][0])[0] === prayersSequence[index]
      ); //!Caution: this must be an '===' search operator not startWith() because otherwise, 'NativitayParamoun' will be selected for the 'Nativity' Season, and 'Baptism Paramoun' might be selected for the 'Baptism' Season if their tables in PrayersArray are before those of the relevant table

      if (!response || response.length === 0) return;

      insertPrayersAdjacentToExistingElement({
        tables: [response],
        languages: prayersLanguages,
        position: {
          beforeOrAfter: "beforebegin",
          el: insertion,
        },
        container: args.container,
      });
    }
  })();

  /**
   * Returns the Coptic Date of for the next day. It is mainly needed for the Vespers Gospel
   */
  function getTomorowCopticReadingDate(): string {
    let today: Date = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).

    return getSeasonAndCopticReadingsDate(
      convertGregorianDateToCopticDate(today, false)[1],
      today
    ) as string;
  }
}


/**
 * Filters the array containing the gospel text for each liturgie (e.g., Incense Dawn, Vepspers, etc.) and returns the text of the gospel and the psaume. The fil
 * @param {Button} btn - the button of the liturgie within which we want to show the gospel text and the psaume text
 * @param {string[][][]} readingsArray - the array containing the text of the gospel and the psaume. Each element of this array repersents a table in the Word document from which the text was retrieved, and each element of each table[], represents a row of this table
 * @returns {string[][][]} - the result of the filtering operation. This normally returns an array of 2 tables: the first table represents the table of the psaume text, and the 2nd table represents the table of the gospel text
 */
function getBtnGospelPrayersArray(btn: Button, readingsArray): string[][][] {
  let gospel = readingsArray.filter((r) => {
    splitTitle(r[0][0][0])[0] === btn.prayersSequence[1] ||
      splitTitle(r[0][0][0])[0] === btn.prayersSequence[2];
  });
  return gospel;
}
/**
 * Takes a table title with muliple date values separated by '||', and checks if any of these dates include the date passed to it as coptDate
 * @param {string} tableTitle - a title of a table including multiple dates separated by '||'
 * @param {string} coptDate - the date that we want to check if it is included in the title. If omitted, it is given the value of the current copticDate
 * @returns {boolean} - return true if the date was found, and false otherwise
 */
function isMultiDatedTitleMatching(
  tableTitle: string,
  coptDate: string = copticDate
): boolean {
  if (!tableTitle.includes("&D=")) return false; //This means that the title does not specify any date for the prayer.

  tableTitle = splitTitle(tableTitle)[0].split("&D=")[1];

  return tableTitle
    .split("||")
    .map((date) => dateIsRelevant(date, coptDate))
    .includes(true);
}

/**
 * Checks if the date argument matches the copticDate or the Season
 * @param {string} date - the date string that we want to check if it matches the copticDate or the Season
 * @param {string} coptDate  - the copticDate (or the Season) with which we want the compare the date
 * @returns  {boolean}
 */
function dateIsRelevant(
  date: string,
  coptDate: string = copticDate
): boolean | void {
  if (date.startsWith("$")) date = eval(date.replace("$", ""));

  if (!date) return console.log("date is not valid: ", date);

  if (date === Seasons.Kiahk)
    return [
      Seasons.KiahkWeek1,
      Seasons.KiahkWeek2,
      Seasons.KiahkWeek3,
      Seasons.KiahkWeek4,
    ].includes(Season);

  return date === coptDate;
}

/**
 * Inserts the Incense Office Doxologies And Cymbal Verses according to the Coptic feast or season
 * @param {HTMLElement | DocumentFragment} container - The HtmlElement in which the btn prayers are displayed and to which they are appended
 */
async function insertCymbalVersesAndDoxologies(btn: Button) {
  if (!btn.docFragment)
    return console.log("btn.docFragment is undefined = ", btn.docFragment);

  let dayFeasts: string[] = (() => {
    let feast: string[] = [];
    let matching: [string, string] = Object.entries(copticFeasts).find(
      (entry) => [copticDate, copticReadingsDate].includes(entry[1])
    ); //We check if today is a feast. We also check by the copticReadingsDate because some feast are referrenced by the copticReadings date : eg. Pntl39

    if (matching) feast.push(matching[1]); //We push the date

    matching = Object.entries(Seasons).find((entry) => entry[1] === Season); //We check also for the season

    if (matching) feast.push(matching[1]); //We push the Season

    if (feast.length > 0) return getUniqueValuesFromArray(feast) as string[];
  })();

  (async function InsertCymbalVerses() {
    let cymbalsAnchor: HTMLElement = selectElementsByDataSetValue(
      btn.docFragment,
      Prefix.commonIncense + "CymbalVersesPlaceHolder&D=$copticFeasts.AnyDay")[0];

    if (!cymbalsAnchor)
      return console.log("We didn't find the cymbal verses placeholder");

    let cymbals: string[][][];

    Season === Seasons.JonahFast
      ? cymbals = CommonPrayersArray.filter(table => table[0][0].startsWith(Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay")) //If we are during the Jonah Fast, the Cymbal Verses are not chanted, they are replaced by the Long Kyrielison
      : cymbals = getCymbalVerses();
    console.log('Cymbals = ', cymbals);

    if (cymbals.length < 1)
      return console.log(
        "no cymbals were found by the provided sequence: "
      );

    insertPrayersAdjacentToExistingElement({
      tables: getUniqueValuesFromArray(cymbals) as string[][][],
      languages: btn.languages,
      position: {
        beforeOrAfter: "beforebegin",
        el: cymbalsAnchor.nextElementSibling as HTMLElement,
      },
      container: btn.docFragment,
    });

    function getCymbalVerses(): string[][][] {
      let sequence = [
        Prefix.cymbalVerses + "Wates&D=$copticFeasts.AnyDay",
        Prefix.cymbalVerses + "&D=$copticFeasts.AnyDay",
      ];

      //If we are during any of the Lord Feasts (or any season where we follow the same pattern), we add "Jesus Christ is the same for ever...",
      if (
        [...lordFeasts, copticFeasts.Coptic29th].includes(copticDate) ||
        [Seasons.Nativity, Seasons.Baptism, Seasons.PentecostalDays].includes(
          Season
        )
      )
        sequence.push(
          Prefix.cymbalVerses + "LordFeastsEnd&D=$copticFeasts.AnyDay"
        );

      if (weekDay > 2) sequence[0] = sequence[0].replace("Wates&D", "Adam&D");

      if (dayFeasts)
        dayFeasts.forEach((feast) =>
          [
            ...lordFeasts,
            Seasons.Nativity,
            Seasons.Baptism,
            Seasons.PentecostalDays,
          ].includes(feast) //During Seasons.Nativity (i.e., between Nativity and Circumcision) and Seasons.Baptism(from Baptism to Cana Wedding), the Cymbals verses follow the pattern of any Lord Feast: it starts with "Amoyni Marin..." or "Ten O'osht", then the cymbal verses of the feast, and finally, the "Eb'oro enti ti hirini". We will hence remove the 2nd element from the sequence
            ? insertFeastInSequence(sequence, feast, 1, 1)
            : insertFeastInSequence(sequence, feast, 1, 0)
        ); //We always start with 'Amoyni Marin...' or with 'Tin O'osht...', so we will insert the feast element before the 2nd element, and will not delete anything

      return processSequence(
        sequence,
        CymbalVersesPrayersArray
      );

    }

  })();

  (async function InsertCommonDoxologies() {
    let doxologiesAnchor: HTMLElement = selectElementsByDataSetValue(
      btn.docFragment,
      Prefix.commonIncense + "DoxologiesPlaceHolder&D=$copticFeasts.AnyDay")[0];

    if (!doxologiesAnchor)
      return console.log("Didn't find doxologiesPlaceholder");

    if (!doxologiesAnchor) return;

    let sequence: string[] = [
      Prefix.doxologies + "DawnWatesStMary&D=$copticFeasts.AnyDay",
      Prefix.doxologies + "StMaykel&D=$copticFeasts.AnyDay",
      Prefix.doxologies + "HeavenlyBeings&D=$copticFeasts.AnyDay",
      Prefix.doxologies + "Apostles&D=$copticFeasts.AnyDay",
      Prefix.doxologies + "StMarc&D=$copticFeasts.AnyDay",
      Prefix.doxologies + "StGeorge&D=$copticFeasts.AnyDay",
      Prefix.doxologies + "StMina&D=$copticFeasts.AnyDay",
      Prefix.doxologies + "EndOfDoxologiesWates&D=$copticFeasts.AnyDay",
    ];

    if (btn === btnIncenseVespers)
      sequence[0] = sequence[0].replace("Dawn", "Vespers");

    let excludedFeasts = [
      saintsFeasts.StMaykel,
      saintsFeasts.StMarc,
      saintsFeasts.StGeorge,
      saintsFeasts.StMina,
    ]; //Those saints feast will be excluded because the doxologies of those saints are already included by default

    if (dayFeasts) {
      let index: number = 2;
      dayFeasts.forEach((feast) => {
        if (
          [
            ...lordFeasts,
            Seasons.NativityParamoun,
            Seasons.Nativity,
            Seasons.BaptismParamoun,
            Seasons.Baptism,
            Seasons.KiahkWeek1,
            Seasons.KiahkWeek2,
            Seasons.KiahkWeek3,
            Seasons.KiahkWeek4,
            Seasons.PentecostalDays,
            Seasons.JonahFast //The Jonah doxology comes before St. Mary Doxolgy according to some sources
          ].includes(feast)
        )
          index = 0; //If one of the dates in feast[] corresponds to a one of the 'Lord's Feasts', it means we are in a Lord Feast. the doxologies of the feast will be placed at the begining of the doxologies. We follow the same rule for the doxologies of the PentecostalDays and the month of Kiahk
        else if (excludedFeasts.includes(feast)) {
          let feastIndex = sequence.indexOf(feast);
          sequence.splice(2, 0, sequence[feastIndex]); //If it is one of the doxologies already included by default, we place it after St. Maykel
          sequence.splice(feastIndex + 1, 1); //We then delete the element itself
          index = undefined; //We set index to undefined in order to prevent insertFeastSequence from inserting any element in sequence
        } else if (AngelsFeasts.includes(feast)) index = 1;

        insertFeastInSequence(sequence, feast, index, 0);
      });
    }

    let doxologies: string[][][] = processSequence(
      sequence,
      DoxologiesPrayersArray
    );

    if (doxologies.length === 0)
      return console.log("Did not find any relevant doxologies");

    if (Season === Seasons.GreatLent) {
      //For the Great Lent, there is a doxology for the Sundays and 4 doxologies for the week days
      if (weekDay === 0 || weekDay === 6)
        doxologies = doxologies
          .filter((tbl) => tbl[0][0].includes("Seasons.GreatLent"))
          .filter((tbl) => !tbl[0][0].includes("Week"));
      else
        doxologies = doxologies
          .filter((tbl) => tbl[0][0].includes("Seasons.GreatLent"))
          .filter((tbl) => !tbl[0][0].includes("Sundays"));
    }

    insertPrayersAdjacentToExistingElement({
      tables: getUniqueValuesFromArray(doxologies) as string[][][],
      languages: btn.languages,
      position: {
        beforeOrAfter: "beforebegin",
        el: doxologiesAnchor.nextElementSibling as HTMLElement,
      },
      container: btn.docFragment,
    });
  })();
  /**
   * Inserts a new element in the btn.prayersSequence[]. This elment will serve as a placeholder to insert the relevant prayers (Cymbal Verses or Doxologies) for the current season or feast
   * @param {string[]} sequence - the btn's prayers sequence in which the new placeholder element will be inserted
   * @param {string} feastDate - the string representing the feast or the season
   * @param {number} index - the index at which the new placeholder element will be inserted.
   */
  function insertFeastInSequence(
    sequence: string[],
    feastDate: string,
    index: number,
    remove: number
  ) {
    if (!index && index !== 0) return;
    sequence.splice(index, remove, "&Insert=" + feastDate);
  }

  /**
   * Searchs in tablesArray for the tables matching each title in sequence, which is a string[] of titles, and returns a string[][][] of the tables found in the
   * @param {string[]} sequence - An arry of titles that we will be looking for tables matching each of them in tablesArray[][]
   * @param {string[][][]} tablesArray - The array containg the text tables in which we will be looking for the tables[][] having titles matching the titles in sequence[]
   * @returns {string[][][]} - an array of the tables[][] found
   */
  function processSequence(sequence: string[], tablesArray: string[][][]) {
    console.log(sequence);
    let tables: string[][][] = [];

    sequence.map((title) => {
      if (title.startsWith("&Insert="))
        tablesArray
          //!CAUTION: we must use 'filter' not 'find' because for certain feasts there are more than one doxology
          .filter((tbl) =>
            isMultiDatedTitleMatching(tbl[0][0], title.split("&Insert=")[1])
          )
          .forEach((tbl) => tables.push(tbl));
      else
        tables.push(
          findTable(title, tablesArray, {
            equal: true,
          }) as string[][]
        );
    });

    return tables;
  }
}

async function removeElementsByTheirDataRoot(
  container = containerDiv,
  dataRoot: string
) {
  selectElementsByDataSetValue(container, dataRoot).forEach((el) =>
    el.remove()
  );
}
/**
 * Adds a button that when clicked shows or hides certain prayers from containerDiv
 * @param {HTMLElement} insertion - the html element before which the button will be inserted
 * @param {string} btnID - the id of the html element button that will be created
 * @param {typeBtnLabel} label - the label of the button that will be created
 * @param {string[][][]} prayers - the prayers that will shown or hidden or shown
 * @returns {HTMLDivElement} - the created div element that contains the prayers, and will be hidden or shown when the button is clicked
 */
function addExpandablePrayer(args: {
  insertion: HTMLElement;
  btnID: string;
  label: typeBtnLabel;
  prayers: string[][][];
  languages: string[];
  dataGroup?: string;
}): [HTMLElement, HTMLDivElement] | void {

  if (!args.prayers) return console.log('No prayes table nor prayers sequence were provided');
  if (!args.insertion) return console.log("btnID = ", args.btnID);

  let btnExpand: Button,
    htmlButton: HTMLElement,
    expandableContainer: HTMLDivElement;


  btnExpand = new Button({
    btnID: args.btnID,
    label: args.label,
    cssClass: inlineBtnClass,
    languages: args.languages,
    prayersSequence: args.prayers.map(tbl => tbl[0][0]),
    onClick: btnOnClick,
  });

  return createHtmlBtnAndExpandableDiv();

  function createHtmlBtnAndExpandableDiv(): [HTMLElement, HTMLDivElement] {
    htmlButton = createHtmlButon();
    expandableContainer = createExpandableContainer();

    function createHtmlButon() {
      let btnDiv = createDivForTheHtmlButon();

      let btn = createBtn({
        btn: btnExpand,
        btnsContainer: btnDiv,
        btnClass: btnExpand.cssClass,
        clear: true,
        onClick: btnExpand.onClick,
      }); //creating the html element representing the button. Notice that we give it as 'click' event, the btn.onClick property, otherwise, the createBtn will set it to the default call back function which is showChildBtnsOrPrayers(btn, clear)

      btn.classList.add("expand"); //We need this class in order to retrieve the btn in Display Presentation Mode
      return btn;

      function createDivForTheHtmlButon() {
        let div = document.createElement("div"); //Creating a div container in which the btn will be displayed
        div.classList.add(inlineBtnsContainerClass);

        if (args.dataGroup) div.dataset.group = args.dataGroup;

        args.insertion.insertAdjacentElement("beforebegin", div); //Inserting the div containing the button as 1st element of containerDiv
        return div
      };
    };
    function createExpandableContainer() {
      //We will create a newDiv to which we will append all the elements in order to avoid the reflow as much as possible
      let expandable = document.createElement("div");
      expandable.id = btnExpand.btnID + "Expandable";
      expandable.classList.add(hidden);
      expandable.classList.add("Expandable");
      expandable.style.display = "grid"; //This is important, otherwise the divs that will be add will not be aligned with the rest of the divs
      args.insertion.insertAdjacentElement("beforebegin", expandable);
      return expandable
    };


    //We will create a div element for each row of each table in btn.prayersArray


    // let htmlRows = Array.from(prayersContainerDiv.children) as HTMLDivElement[];
    // htmlRows
    //   .filter((div) => isTitlesContainer(div))
    //   .forEach((div) => {
    //     htmlRows.filter(d => d.dataset.root && d.dataset.root === div.dataset.root)
    //       .forEach(d => d.dataset.group = div.dataset.root);//We rename the dataset.group attribute for each nested table
    //   });

    return [htmlButton, expandableContainer];
  }

  async function btnOnClick(): Promise<HTMLElement[] | void> {
    if (!expandableContainer) return console.log("no collapsable div was found");

    (function showPrayersInExpandableDiv() {
      if (expandableContainer.children.length > 0) return;
      args.prayers
        .map(table => {
          return showPrayers({
            table: table,
            languages: args.languages,
            position: expandableContainer,
            container: expandableContainer,
            clearContainerDiv: false,
            clearRightSideBar: false
          });
        })
        .forEach((htmlTable: HTMLDivElement[]) => setCSS(htmlTable));
    })();

    expandableContainer.classList.toggle(hidden);

  }
}
