class Button {
  private _btnID: string;
  private _rootID: string;
  private _label: typeBtnLabel;
  private _parentBtn: Button;
  private _children: Button[];
  private _inlineBtns: Button[];
  private _prayersSequence: string[];
  private _retrieved: boolean = false;
  private _prayersArray: string[][][];
  private _titlesArray: string[][];
  private _languages: string[];
  private _onClick: Function;
  private _afterShowPrayers: Function;
  private _value: string;
  private _cssClass: string;
  private _showPrayers: boolean;
  private _pursue: boolean;
  private _docFragment: DocumentFragment;

  private _any: any;

  constructor(btn: typeButton) {
    this._btnID = btn.btnID;
    this._label = btn.label;
    this._rootID = btn.rootID;
    this._parentBtn = btn.parentBtn;
    this._children = btn.children;
    this._prayersSequence = btn.prayersSequence;
    this._retrieved = btn.retrieved;
    this._prayersArray = btn.prayersArray;
    this._titlesArray = btn.titlesArray;
    this._languages = btn.languages;
    this._onClick = btn.onClick;
    this._afterShowPrayers = btn.afterShowPrayers;
    this._showPrayers = btn.showPrayers;
    this._pursue = btn.pursue;
    this._value = btn.value;
    this._docFragment = btn.docFragment;
    this._any = btn.any;
    btn.cssClass
      ? (this._cssClass = btn.cssClass)
      : (this._cssClass = btnClass);
    this._inlineBtns = btn.inlineBtns;
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
  get titlesArray() {
    return this._titlesArray;
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
  get rootID() {
    return this._rootID;
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
  get pursue() {
    return this._pursue;
  }
  get value() {
    return this._value;
  }
  get cssClass() {
    return this._cssClass;
  }
  get inlineBtns() {
    return this._inlineBtns;
  }
  get docFragment() {
    return this._docFragment;
  }
  get any() {
    return this._any;
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
  set titlesArray(titles: string[][]) {
    this._titlesArray = titles;
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
  set pursue(pursue: boolean) {
    this._pursue = pursue;
  }
  set children(children: Button[]) {
    this._children = children;
  }
  set cssClass(cssClass: string) {
    this._cssClass = cssClass;
  }
  set inlineBtns(btns: Button[]) {
    this._inlineBtns = btns;
  }
  set docFragment(docFragment: DocumentFragment) {
    this._docFragment = docFragment;
  }
  set any(any: any) {
    this._any = any;
  }
}

const btnMain: Button = new Button({
  btnID: "btnMain",
  label: {
    defaultLanguage: "العودة إلى القائمة الرئيسية",
    foreignLanguage: "Retour au menu principal",
    otherLanguage: "Back to the main menu",
  },
  onClick: () => {
    btnMain.children = [btnMass, btnIncenseOffice, btnDayReadings, btnBookOfHours];


    (function showBtnsOnMainPage() {
      if (leftSideBar.classList.contains('extended')) return;//If the left side bar is not hidden, we do not show the buttons on the main page because it means that the user is using the buttons in the side bar and doesn't need to navigate using the btns in the main page
      
      let images: string[] = [
        'url(./assets/btnMassBackground.jpg)',
        'url(./assets/btnMassBackground.jpg)',
        'url(./assets/btnMassBackground.jpg)',
        'url(./assets/btnMassBackground.jpg)',
        'url(./assets/btnIncenseBackground.jpg)',
        'url(./assets/btnReadingsBackground.jpg)',
        'url(./assets/btnBOHBackground.jpg)',
      ];
      containerDiv.innerHTML = '';
      containerDiv.style.gridTemplateColumns = ((100 / 3).toString() + '% ').repeat(3);
    
      //We create html elemements representing each of btnMain children. The created buttons will be appended to containerDiv directly
      btnMain.children
        .map(btn => {
          return createBtn(
            btn,
            containerDiv,
            'mainPageBtns',
            true,
            () => onClickBtnFunction(btn)
          );
        })
        .map(htmlBtn => {
          //For each btn created from the children of btnMain, we give it an image background from the images[] array of links
          htmlBtn.style.backgroundImage = images[Array.from(containerDiv.children).indexOf(htmlBtn)];
        });
      
      function onClickBtnFunction(btn: Button) {
        if (!btn.children || btn.children.length === 0) btn.onClick({ returnBtnChildren: true });//if btn doesn't have childre, we call its onClick() function beacuse the children of some btns are added when tis function is called. We pass 'true' as argument, because it makes the function return the children and do not execute until its end
        let parentHtmlBtn = containerDiv.querySelector('#' + btn.btnID) as HTMLElement;
        let backgroundImage;

        if (parentHtmlBtn) backgroundImage = parentHtmlBtn.style.backgroundImage;

        containerDiv.innerHTML = "";
      
        if (!btn.children
          || btn.children.length === 0
          || (
            btn.prayersSequence
            && btn.prayersSequence.length > 0)) {
        
          showChildButtonsOrPrayers(btn)//If btn does not have children, it means that it shows prayers. We pass it to showChildButtonsOrPrayers
          return
        };
        //else, we will show the btn children
        btn.children
          //for each child button of btn
          .map(childBtn => {
            //We create an html element representing this button and give it 'mainPageBtns', and append it to containerDiv. It will have as background, the same image as the background image of btn
            createBtn(
              childBtn,
              containerDiv,
              'mainPageBtns',
              false,
              () => onClickBtnFunction(childBtn)
            )
              .style.backgroundImage = backgroundImage;
            
          });
      
        createBtn(btnMain, containerDiv, 'mainPageBtns').style.backgroundImage = images[0];//Finlay, we create and extra html button for btnMain, in order for the user to be able to navigate back to the btnMain menu of buttons
          
      };
    })();
  },
});

const btnGoBack: Button = new Button({
  btnID: "btnGoBack",
  label: { defaultLanguage: "السابق", foreignLanguage: "Retour", otherLanguage: "Go Back" },
  onClick: () => {
    scrollToTop(); //scrolling to the top of the page
  },
});

const btnMass: Button = new Button({
  btnID: "btnMass",
  label: { defaultLanguage: "القداسات", foreignLanguage: "Messes" },
  onClick: (args:{returnBtnChildren?:boolean}={returnBtnChildren:false}) => {
    btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
    if (args.returnBtnChildren) return btnMass.children;
  },
});

const btnIncenseOffice: Button = new Button({
  btnID: "btnIncenseOffice",
  label: {
    defaultLanguage: "رفع بخور باكر أو عشية",
    foreignLanguage: "Office des Encens Aube et Vêpres",
  },
  onClick: (args:{returnBtnChildren?:boolean}={returnBtnChildren:false}) => {
    //setting the children of the btnIncenseOffice. This must be done by the onClick() in order to reset them each time the button is clicked
    btnIncenseOffice.children = [btnIncenseDawn, btnIncenseVespers];
    //show or hide the PropheciesDawn button if we are in the Great Lent or JonahFast:
    if (args.returnBtnChildren) return btnIncenseOffice.children;
    if (Season === Seasons.GreatLent || Season === Seasons.JonahFast) {
      //we will remove the btnIncenseVespers from the children of btnIncenseOffice for all the days of the Week except Saturday because there is no Vespers incense office except on Saturday:
      if (
        todayDate.getDay() != 6 &&
        copticReadingsDate != copticFeasts.Resurrection
      ) {
        btnIncenseOffice.children.splice(
          btnIncenseOffice.children.indexOf(btnIncenseVespers),
          1
        );
      }

      // we will remove or add the Prophecies Readings button as a child to btnDayReadings depending on the day
      if (
        btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) === -1 && //The Prophecies button is not among the children of btnDayReadings
        todayDate.getDay() != 0 && //i.e., we are not a Sunday
        todayDate.getDay() != 6 //i.e., we are not a Saturday
      ) {
        //it means btnReadingsPropheciesDawn does not appear in the Incense Dawn buttons list (i.e., =-1), and we are neither a Saturday or a Sunday, which means that there are prophecies lectures for these days and we need to add the button in all the Day Readings Menu, and the Incense Dawn
        btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn); //We add the Prophecies button at the beginning of the btnIncenseDawn children[], i.e., we add it as the first button in the list of Incense Dawn buttons, the second one is the Gospel
      } else if (
        btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1 &&
        (todayDate.getDay() === 0 || //i.e., we are a Sunday
          todayDate.getDay() === 6) //i.e., we are a Saturday
      ) {
        //it means btnReadingsPropheciesDawn appears in the Incense Dawn buttons list, and we are either a Saturday or a Sunday, which means that there are no prophecies for these days and we need to remove the button from all the menus to which it had been added before
        btnIncenseDawn.children.splice(
          btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn),
          1
        );
      }
      //removing the vespers prayers if we are not a Saturday, and adding it if we aree
      if (
        btnDayReadings.children &&
        todayDate.getDay() != 6 &&
        btnDayReadings.children.indexOf(btnIncenseVespers) > -1
      ) {
        //it means we are not a Saturday. we need to remove the btnIncenseVespers because there are not vespers
        btnDayReadings.children.splice(
          btnDayReadings.children.indexOf(btnIncenseVespers),
          1
        );
      } else if (
        btnDayReadings.children &&
        todayDate.getDay() === 6 &&
        btnDayReadings.children.indexOf(btnIncenseVespers) === -1
      ) {
        //it means we are  a Saturday. we need to add the btnReadingsGospelIncenseVespers if missing
        btnDayReadings.children.splice(
          btnDayReadings.children.indexOf(btnReadingsGospelIncenseDawn),
          0,
          btnIncenseVespers
        );
      }
    }
  },
});

const btnIncenseDawn: Button = new Button({
  btnID: "btnIncenseDawn",
  rootID: "IncenseDawn",
  label: {
    defaultLanguage: "بخور باكر",
    foreignLanguage: "Encens Aube",
  },
  showPrayers: true,
  children: [], //we are initiating and empty array in order to avoid errors later
  languages: [...prayersLanguages],
  docFragment: new DocumentFragment(),
  onClick: (): string[] => {
    btnIncenseDawn.prayersSequence = [...IncensePrayersSequence];

(function removeIncenseVesperPrayers(){
  //We will remove all the Incense Vespers titles from the prayersSequence Array
  btnIncenseDawn.prayersSequence = btnIncenseDawn.prayersSequence.filter(title => !title.startsWith(Prefix.incenseVespers));

  //We will remove duplicate titles from the prayersSequence array
  btnIncenseDawn.prayersSequence.forEach(
    title =>
    {
      if (btnIncenseDawn.prayersSequence[btnIncenseDawn.prayersSequence.indexOf(title)] === btnIncenseDawn.prayersSequence[btnIncenseDawn.prayersSequence.indexOf(title) - 1])
        btnIncenseDawn.prayersSequence.splice(btnIncenseDawn.prayersSequence.indexOf(title), 1)
    });
})();

    btnIncenseDawn.prayersArray = [
      ...CommonPrayersArray,
      ...IncensePrayersArray.filter(table=>!table[0][0].startsWith(Prefix.incenseVespers)),
    ];//We need this to be done when the button is clicked, not when it is declared, because when declared, CommonPrayersArray and IncensePrayersArray are empty (they are popultated by a function in "main.js", which is loaded after "DeclareButtons.js")

    
    (function setBtnChildrenAndPrayers() {
      //We will set the children of the button:
      btnIncenseDawn.children = [btnReadingsGospelIncenseDawn];
      //we will also set the prayers of the Incense Dawn button
      btnIncenseDawn.prayersSequence = [...IncensePrayersSequence];
    })();

    (function adaptCymbalVerses() {
      let cymbals: string = Prefix.commonIncense ;
      //removing the non-relevant Cymbal prayers according to the day of the week: Wates/Adam
      if (todayDate.getDay() > 2) {
        //we are between Wednesday and Saturday, we keep only the "Wates" Cymbal prayers
        cymbals += "CymbalVersesAdam&D=$copticFeasts.AnyDay"
      } else {
        //we are Sunday, Monday, or Tuesday. We keep only the "Adam" Cymbal prayers
        cymbals += "CymbalVersesWates&D=$copticFeasts.AnyDay";
      }
      btnIncenseDawn.prayersSequence.splice(btnIncenseDawn.prayersSequence.indexOf(cymbals),1);
    })();
    scrollToTop();
    return btnIncenseDawn.prayersSequence;
  },
  afterShowPrayers: async () => {
    let btnDocFragment = btnIncenseDawn.docFragment;
    (async function addGreatLentPrayers() {
      if (Season !== Seasons.GreatLent || Season !== Seasons.JonahFast) return;
      if (todayDate.getDay() !== 0 && todayDate.getDay() !== 6) {
        //We are neither a Saturday nor a Sunday, we will hence display the Prophecies dawn buton
        (function showPropheciesDawnBtn() {
          if (Season !== Seasons.GreatLent) return;
          //If we are during any day of the week, we will add the Prophecies readings to the children of the button
          if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn)<0) btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
        })();
        (async function addEklonominTaghonata() {
          let efnotiNaynan: HTMLDivElement[] =
            selectElementsByDataRoot(btnDocFragment, Prefix.commonPrayer + 'EfnotiNaynan&D=$copticFeasts.AnyDay', { startsWith: true });
          
          let insertion = efnotiNaynan[efnotiNaynan.length - 1].nextSibling as HTMLElement; //This is the "Kyrie Elison 3 times"
          insertion.insertAdjacentElement('beforebegin', insertion.cloneNode(true) as HTMLElement);//We duplicated the "Kyrie Elison 3 times"
          let godHaveMercy: string[][][] = btnIncenseDawn.prayersArray.filter(table => table[0][0].startsWith(Prefix.incenseDawn + 'GodHaveMercyOnUs')); //This will give us all the prayers 
          let KyrieElieson:string[][] = btnIncenseDawn.prayersArray.filter(table => table[0][0] === Prefix.commonPrayer + 'KyrieElieson&D=$copticFeasts.AnyDay&C=Assembly')[0]; //This is "Kyrie Elison"
          let blocks: string[][][] = [];
          blocks.push(godHaveMercy[0]);//this is the comment at the begining
          for (let i = 2; i < godHaveMercy.length; i += 3){
            blocks.push([...godHaveMercy[1]]); //This is the refrain repated every 3 parts.We are pushing a copy of it, to avoid affecting it by the splice in the next step
            if(i>4) blocks[blocks.length-1].splice(0, 1);//This will remove the title from the refrain if it is not the 1st refrain (it removes the 1st row in the refrain table)
            blocks.push(godHaveMercy[i]);
            blocks.push(KyrieElieson);
            blocks.push(godHaveMercy[i+1]);
            blocks.push(KyrieElieson);
            blocks.push(godHaveMercy[i + 2]);
            if(i+2<(godHaveMercy.length -1)) blocks.push(KyrieElieson)
          }
          insertPrayersAdjacentToExistingElement(blocks, prayersLanguages, { beforeOrAfter: 'beforebegin', el: insertion });
        })();
        return
      } else {
        if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1) btnIncenseDawn.children.splice(btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn), 1);
      }
    })();

    insertCymbalVersesAndDoxologiesForFeastsAndSeasons(btnIncenseDawn.docFragment);

    getGospelReadingAndResponses(
      Prefix.gospelDawn,
      btnReadingsGospelIncenseDawn,
      btnIncenseDawn.docFragment
    );
    (async function addInlineBtnForAdamDoxolgies() {
      if (btnIncenseDawn.docFragment.children.length === 0) return;

      let doxologiesDiv:HTMLDivElement = addExpandablePrayer(
        btnIncenseDawn.docFragment.children[0] as HTMLElement,
        "AdamDoxologies",
        {
        defaultLanguage: "ذكصولوجيات باكر آدام",
        foreignLanguage: "Doxologies Adam Aube",
      },
        DoxologiesPrayersArray.filter(table => table[0][0].startsWith(Prefix.commonDoxologies + 'Adam')),
      btnIncenseDawn.languages
      )[1];

                //finally we append the newDiv to containerDiv
                //btnIncenseDawn.docFragment.children[1].insertAdjacentElement('beforebegin', doxologiesDiv)
    })();
  },
});

const btnIncenseVespers: Button = new Button({
  btnID: "btnIncenseVespers",
  label: {
    defaultLanguage: "بخور عشية",
    foreignLanguage: "Incense Vespers",
  },
  showPrayers: true,
  docFragment: new DocumentFragment(),
  languages: [...prayersLanguages],
  onClick: (): string[] => {
    btnIncenseVespers.prayersSequence = [...IncensePrayersSequence];
    (function removeIncenseDawnPrayers(){
      //We will remove all the Incense Vespers titles from the prayersSequence Array
      btnIncenseVespers.prayersSequence = btnIncenseVespers.prayersSequence.filter(title => !title.startsWith(Prefix.incenseDawn));
    
      //We will remove duplicate titles from the prayersSequence array
      btnIncenseVespers.prayersSequence.forEach(
        title =>
        {
          if (btnIncenseVespers.prayersSequence[btnIncenseVespers.prayersSequence.indexOf(title)] === btnIncenseVespers.prayersSequence[btnIncenseVespers.prayersSequence.indexOf(title) - 1])
            btnIncenseVespers.prayersSequence.splice(btnIncenseVespers.prayersSequence.indexOf(title), 1)
        });
    })();

    btnIncenseVespers.prayersArray = [
      ...CommonPrayersArray,
      ...IncensePrayersArray,
    ];
    (function removingNonRelevantLitanies() {
      //removing the Sick Litany
      btnIncenseVespers.prayersSequence.splice(
        btnIncenseVespers.prayersSequence.indexOf("  ID_SickPrayerPart1&D=$copticFeasts.AnyDay"),
        5
      );

      //removing the Travelers Litany from IncenseVespers prayers
      btnIncenseVespers.prayersSequence.splice(
        btnIncenseVespers.prayersSequence.indexOf(Prefix.incenseDawn + "TravelersPrayerPart1&D=$copticFeasts.AnyDay"),
        5
      );

      //removing the Oblations Litany from IncenseVespers paryers
      btnIncenseVespers.prayersSequence.splice(
        btnIncenseVespers.prayersSequence.indexOf(Prefix.incenseDawn + "OblationsPrayerPart1&D=$copticFeasts.AnyDay"),
        5
      );
      //removing the Dawn Doxology for St. Mary
      btnIncenseVespers.prayersSequence.splice(
        btnIncenseVespers.prayersSequence.indexOf(Prefix.incenseDawn + "DoxologyWatesStMary&D=$copticFeasts.AnyDay"),
        1
      );

      //removing the Angels' prayer
      btnIncenseVespers.prayersSequence.splice(
        btnIncenseVespers.prayersSequence.indexOf(Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay"),
        1
      );
    })();

    (function adaptCymbalVerses() {
      //removing the non-relevant Cymbal prayers according to the day of the week: Wates/Adam
      if (todayDate.getDay() > 2) {
        //we are between Wednesday and Saturday, we keep only the "Wates" Cymbal prayers
        btnIncenseVespers.prayersSequence.splice(
          btnIncenseVespers.prayersSequence.indexOf(Prefix.commonIncense + "CymbalVersesAdam&D=$copticFeasts.AnyDay"),
          1
        );
      } else {
        //we are Sunday, Monday, or Tuesday. We keep only the "Adam" Cymbal prayers
        btnIncenseVespers.prayersSequence.splice(
          btnIncenseVespers.prayersSequence.indexOf(Prefix.commonIncense + "CymbalVersesWates&D=$copticFeasts.AnyDay"),
          1
        );
      }
    })();

    (function addGreatLentPrayers() {
      if (
        Season === Seasons.GreatLent &&
        todayDate.getDay() != 0 &&
        todayDate.getDay() != 6
      ) {
        //We will then add the GreatLent  Doxologies to the Doxologies before the first Doxology of St. Mary
        (function addGreatLentDoxologies() {
          let index = btnIncenseDawn.prayersSequence.indexOf(
            Prefix.incenseVespers + "DoxologyVespersWatesStMary&D=$ copticFeasts.AnyDay"
          );
          let doxologies: string[] = [];
          DoxologiesPrayersArray.map((p) =>
            /DC_\d{1}\&D\=GLWeek/.test(p[0][0])
              ? doxologies.push(p[0][0])
              : "do nothing"
          );
          if (todayDate.getDay() != 0 && todayDate.getDay() != 6) {
            btnIncenseVespers.prayersSequence.splice(index, 0, ...doxologies);
          } else if (todayDate.getDay() === (0 || 6)) {
            btnIncenseVespers.prayersSequence.splice(index, 0, "DC_&D=GLSundays");
          }
        })();
      }
    })();
    scrollToTop();
    return btnIncenseVespers.prayersSequence;
  },
  afterShowPrayers: async () => {
    insertCymbalVersesAndDoxologiesForFeastsAndSeasons(btnIncenseVespers.docFragment);
    getGospelReadingAndResponses(
      Prefix.gospelVespers,
      btnReadingsGospelIncenseVespers,
      btnIncenseVespers.docFragment
    );
  },
});

const btnMassStCyril: Button = new Button({
  btnID: "btnMassStCyril",
  rootID: "StCyril",
  label: { defaultLanguage: "كيرلسي", foreignLanguage: "Saint Cyril", otherLanguage: "St Cyril" },
  docFragment: new DocumentFragment(),
  showPrayers: true, //we set it to false in order to escape showing the prayers again after inserting the redirection buttons. The showPrayers() function is called by onClick()
  languages: [...prayersLanguages],
  onClick: (): string[] => {
    btnMassStCyril.prayersArray = [
      ...CommonPrayersArray,
      ...MassCommonPrayersArray,
      ...MassStCyrilPrayersArray,
    ];
    if (btnMassStCyril.retrieved === true) {
      //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
      //sbtnMassStCyril.prayersSequence = btnsPrayersSequences[btns.indexOf(btnMassStCyril)];
      return;
    }
    //Setting the standard mass prayers sequence
    btnMassStCyril.prayersSequence = [
      ...MassPrayersSequences.MassCommonIntro,
      ...MassPrayersSequences.MassStCyril,
      ...[
        Prefix.massCommon + "TheHolyBodyAndTheHolyBlodPart3&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "BlockIriniPassi&D=$copticFeasts.AnyDay",
        Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay",
        Prefix.massCommon + "Confession&D=$copticFeasts.AnyDay",
      ],
      ...MassPrayersSequences.Communion,
    ];
    btnsPrayersSequences.splice(btns.indexOf(btnMassStCyril), 1, btnMassStCyril.prayersSequence);
    btnMassStCyril.retrieved = true;
    return btnMassStCyril.prayersSequence;
  },
  afterShowPrayers: async () => {
    btnMassStBasil.afterShowPrayers(btnMassStCyril);
  },
});

const btnMassStGregory: Button = new Button({
  btnID: "btnMassStGregory",
  rootID: "StGregory",
  label: { defaultLanguage: "غريغوري", foreignLanguage: "Saint Gregory" },
  docFragment: new DocumentFragment(),
  showPrayers: true, //we set it to false in order to escape showing the prayers again after inserting the redirection buttons. The showPrayers() function is called by onClick()
  languages: [...prayersLanguages],
  onClick: (): string[] => {
    btnMassStGregory.prayersArray = [
      ...CommonPrayersArray,
      ...MassCommonPrayersArray,
      ...MassStGregoryPrayersArray,
    ];
    if (btnMassStGregory.retrieved === true) {
      //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
     // btnMassStGregory.prayersSequence = btnsPrayersSequences[btns.indexOf(btnMassStGregory)];
      return;
    }
    //Setting the standard mass prayers sequence
    btnMassStGregory.prayersSequence = [
      ...MassPrayersSequences.MassCommonIntro,
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
    btnsPrayersSequences.splice(btns.indexOf(btnMassStGregory), 1, btnMassStGregory.prayersSequence);
    btnMassStGregory.retrieved = true;
    return btnMassStGregory.prayersSequence;
  },
  afterShowPrayers: async () => {
    btnMassStBasil.afterShowPrayers(btnMassStGregory);
  },
});

const btnMassStBasil: Button = new Button({
  btnID: "btnMassStBasil",
  rootID: "StBasil",
  label: { defaultLanguage:"باسيلي", foreignLanguage: "Saint Basil", otherLanguage: "St Basil" },
  docFragment: new DocumentFragment(),
  showPrayers: true, //we set it to false in order to escape showing the prayers again after inserting the redirection buttons. The showPrayers() function is called by onClick()
  languages: [...prayersLanguages],
  onClick: (): string[] => {
    btnMassStBasil.prayersArray = [
      ...CommonPrayersArray,
      ...MassCommonPrayersArray,
      ...MassStBasilPrayersArray,
    ];
    if (btnMassStBasil.retrieved === true) {
      //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
      //btnMassStBasil.prayersSequence = btnsPrayersSequences[btns.indexOf(btnMassStBasil)];
      return;
    }
    //Setting the standard mass prayers sequence
    btnMassStBasil.prayersSequence = [
      ...MassPrayersSequences.MassCommonIntro,
      ...MassPrayersSequences.MassStBasil,
      ...MassPrayersSequences.MassCallOfHolySpirit,
      ...MassPrayersSequences.MassLitanies,
      ...MassPrayersSequences.Communion,
    ];

    //We scroll to the beginning of the page after the prayers have been displayed
    scrollToTop();
    btnsPrayersSequences.splice(btns.indexOf(btnMassStBasil), 1, btnMassStBasil.prayersSequence);
    btnMassStBasil.retrieved = true;
    return btnMassStBasil.prayersSequence;
  },
  afterShowPrayers: async (btn: Button = btnMassStBasil) => {
    let massButtons: Button[] =
      [btnMassStBasil, btnMassStGregory, btnMassStCyril, btnMassStJohn];
    massButtons.splice(massButtons.indexOf(btn), 1);
    massButtons.splice(massButtons.indexOf(btnMassStJohn), 1); 
    
    let btnDocFragment = btn.docFragment;

    showFractionPrayersMasterButton(
      btn,
      selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'FractionPrayerPlaceholder&D=$copticFeasts.AnyDay', {equal:true})[0],
      { defaultLanguage: "صلوات القسمة", foreignLanguage: "Oraisons de la Fraction" },
      "btnFractionPrayers",
    FractionsPrayersArray);

    (function addRedirectionButtons() {
      //Adding 3 buttons to redirect to the other masses (St. Gregory, St. Cyril, or St. John)
      redirectToAnotherMass(
        [...massButtons],
        {
          beforeOrAfter: "afterend",
          el: selectElementsByDataRoot(btnDocFragment, 'Reconciliation&D=$copticFeasts.AnyDay', {includes:true})[0],
        },
        'RedirectionToReconciliation'
      );

      //Adding 2 buttons to redirect to the St Cyrill or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
      let select = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=$copticFeasts.AnyDay', {endsWith:true});
      redirectToAnotherMass(
        [...massButtons],
        {
          beforeOrAfter: "afterend",
          el: select[select.length - 1]
        },
        'RedirectionToAnaphora'
      );

      //Adding 2 buttons to redirect to the St Cyril or St Gregory before Agios
      redirectToAnotherMass(
        [...massButtons],
        {
          beforeOrAfter: "beforebegin",
          el: selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'Agios&D=$copticFeasts.AnyDay', {equal: true})[0],
        },
        'RedirectionToAgios'
      )
    })();

    (function insertStMaryAdamSpasmos() {
      //We insert it during the Saint Mary Fast and on every 21th of the coptic month
      let spasmos = PrayersArray.filter(table => table[0][0] === Prefix.massCommon + "StMaryAdamSpasmos&D=$Seasons.StMaryFast&C=Title");
      if (!spasmos) return
      let anchor = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "DiaconResponseKissEachOther&D=$copticFeasts.AnyDay", {equal:true})[0];
      
      addExpandablePrayer(
        anchor,
        'StMaryAdamSpasmos',
        {
          defaultLanguage: "افرحي يا مريم",
          foreignLanguage: "Réjouis-toi Marie"
        },
        spasmos,
        btnMassStBasil.languages
      )[1];
    })();

    (function insertCommunionChants() {
      //Inserting the Communion Chants after the Psalm 150
      let psalm = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay", {equal:true});
  
      let filtered: string[][][] = CommunionPrayersArray.filter(tbl => {
        selectFromMultiDatedTitle(tbl[0][0], copticDate) === true
          || selectFromMultiDatedTitle(tbl[0][0], Season) === true
      });
  
      if (filtered.length === 0) filtered = CommunionPrayersArray.filter(tbl => selectFromMultiDatedTitle(tbl[0][0], copticFeasts.AnyDay) === true);
      
      
      showMultipleChoicePrayersButton(
        filtered,
        btn,
        {
          defaultLanguage: 'مدائح التوزيع',
          foreignLanguage: 'Chants de la communion'
        },
        'communionChants',
        undefined,
        psalm[psalm.length-1] as HTMLElement
      )
    })();

    (function insertIndeedWePrayYou() {
      if (btn !== btnMassStBasil) return; //This button appears only in St Basil Mass

      let prayers: string[][][] = MassStGregoryPrayersArray.filter(tbl => tbl[0][0].startsWith(Prefix.massStGregory + "LitaniesIntroductionPart"));

      if (prayers.length === 0) return;
      
      let kyrielieson = CommonPrayersArray.filter(tbl => tbl[0][0] ===
        Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay&C=Assembly")[0];
      
      for (let i = 1; i < prayers.length; i+=2){
        prayers.splice(i, 0, kyrielieson);
      }
    


      let kyrielieson3Times = CommonPrayersArray.filter(tbl => tbl[0][0] === Prefix.commonPrayer+"KyrieEliesonThreeTimes&D=$copticFeasts.AnyDay&C=Assembly")[0];
      
      prayers.push(kyrielieson3Times);

      let anchor = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon+"LitaniesIntroduction&D=$copticFeasts.AnyDay", {equal:true})[0];
        
      if (!anchor) return console.log('no anchor');
      addExpandablePrayer(anchor,
        'btnIndeedWePrayYou',
        {
        defaultLanguage: "...نعم نسألك أيها المسيح إلهنا",
        foreignLanguage: 'Oui, nous t\'implorons ô Christ notre Dieu...'
      },
        prayers,
        btn.languages
      )
    })();
  },
});

const btnMassStJohn: Button = new Button({
  btnID: "btnMassStJohn",
  label: { defaultLanguage: "القديس يوحنا", foreignLanguage: "Saint Jean" },
  docFragment: new DocumentFragment(),
  showPrayers: false, //we set it to false in order to escape showing the prayers again after inserting the redirection buttons. The showPrayers() function is called by onClick()
  prayersSequence: [],
  onClick: () => {
    alert('The prayers of this mass have not yet been added. We hope they will be ready soon')
    return //until we add the text of this mass
    btnMassStJohn.prayersArray = [
      ...CommonPrayersArray,
      ...MassCommonPrayersArray,
      ...MassStJohnPrayersArray,
    ];

    scrollToTop(); //scrolling to the top of the page

    btnsPrayersSequences.splice(btns.indexOf(btnMassStJohn), 1, btnMassStJohn.prayersSequence);
    btnMassStJohn.retrieved = true;
    return btnMassStJohn.prayersSequence
  },
  afterShowPrayers: async () => {
    btnMassStBasil.afterShowPrayers(btnMassStJohn);
  },
});

const goToAnotherMass: Button[] = [
  new Button({
    btnID: "btnGoToStBasilReconciliation",
    label: { defaultLanguage: " باسيلي", foreignLanguage: " Saint Basil" },
    cssClass: inlineBtnClass,
    onClick: () => {
      showChildButtonsOrPrayers(btnMassStBasil);
    },
  }),
  new Button({
    btnID: "btnGoToStGregoryReconciliation",
    label: { defaultLanguage: "غريغوري", foreignLanguage: " Saint Gregory" },
    cssClass: inlineBtnClass,
    onClick: () => {
      showChildButtonsOrPrayers(btnMassStGregory);
    },
  }),
  new Button({
    btnID: "btnGoToStCyrilReconciliation",
    label: { defaultLanguage: "كيرلسي", foreignLanguage: "Saint Cyril" },
    cssClass: inlineBtnClass,
    onClick: () => {
      showChildButtonsOrPrayers(btnMassStCyril);
    },
  }),
  new Button({
    btnID: "btnGoToStJeanReconciliation",
    label: { defaultLanguage: "القديس يوحنا", foreignLanguage: "Saint Jean" },
    cssClass: inlineBtnClass,
    rootID: "StJohn",
    parentBtn: btnMass,
    onClick: () => {
      showChildButtonsOrPrayers(btnMassStJohn);
    },
  }),
];

const btnMassUnBaptised: Button = new Button({
  btnID: "btnMassUnBaptised",
  label: {
    defaultLanguage: "قداس الموعوظين",
    foreignLanguage: "Messe des non baptisés",
    otherLanguage: "Unbaptised Mass",
  },
  docFragment: new DocumentFragment(),
  showPrayers: true,
  prayersArray: [...PrayersArray],
  languages: [...prayersLanguages],
  onClick: () => {
    //The prayers sequence must be set when the button is clicked
    btnMassUnBaptised.prayersSequence = [...MassPrayersSequences.MassUnbaptized],
    //Adding children buttons to btnMassUnBaptised
    btnMassUnBaptised.children = [...btnDayReadings.children];
    btnMassUnBaptised.children.splice(0, 1);
    btnMassUnBaptised.children.splice(btnMassUnBaptised.children.length-1, 1);
    
    
        //Adding the creed and 
          (function addCreed() {
                  btnMassUnBaptised.prayersSequence.unshift(Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay')
          })();

    //Replacing AllelujaFayBabi according to the day
        (function replaceAllelujahFayBabi() {
          if ((Season === Seasons.GreatLent
              || Season === Seasons.JonahFast)
              && todayDate.getDay() !== 0
              && todayDate.getDay() !== 6) {
              //Inserting "Alleluja E Ikhon" before "Allelujah Fay Bibi"
              btnMassUnBaptised
                  .prayersSequence
                  .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"),
                      2,
                      Prefix.massCommon + "HallelujahFayBiBiGreatLent&D=$Seasons.GreatLent");
              //Removing "Allelujah Fay Bibi" and "Allelujha Ge Ef Mev'i"
              btnMassUnBaptised
                  .prayersSequence
                  .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 1);
          }
          else if (
              (isFast
                  && todayDate.getDay() !== 0
                  && todayDate.getDay() !== 6)
              || (Season === Seasons.NoSeason
                  && (todayDate.getDay() === 3
                      || todayDate.getDay() === 5))
              ) {
              //Removing Hellelujah Fay Bibi
              btnMassUnBaptised
                  .prayersSequence
                  .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 1);
              //Remove TayShouray
              btnMassUnBaptised
                  .prayersSequence
                  .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "Tayshoury&D=$copticFeasts.AnyDay"), 1);
          }
          else {
              //Removing 'Hallelujah Ji Efmefi'
              btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay") + 1, 1);
              //Remove Tishoury
              btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "Tishoury&D=$copticFeasts.AnyDay"), 1);
          }
      })();
          scrollToTop();
          return btnMassUnBaptised.prayersSequence;
        },
  afterShowPrayers: () => {
    let btnDocFragment = btnMassUnBaptised.docFragment;

    (function hideGodHaveMercyOnUsIfBishop() {
      let dataRoot = Prefix.massCommon + "PrayThatGodHaveMercyOnUsIfBishop&D=$copticFeasts.AnyDay";
      
      let godHaveMercyHtml = selectElementsByDataRoot(btnDocFragment, dataRoot, {equal:true});
     
      let godHaveMercy = btnMassUnBaptised.prayersArray.filter(tbl => tbl[1] && splitTitle(tbl[1][0])[0] === dataRoot);
      
      if (godHaveMercy.length < 1) return;
            
      let createdDiv = addExpandablePrayer(
        godHaveMercyHtml[0] as HTMLDivElement,
        'godHaveMercy',
        {
          defaultLanguage: godHaveMercy[0][1][4],
          foreignLanguage: godHaveMercy[0][1][2],
        },
        [[godHaveMercy[0][1], godHaveMercy[0][2]]],
        btnMassUnBaptised.languages
      )[1];
      
      createdDiv.classList.add('Row');
      createdDiv.classList.add(hidden);
  
      godHaveMercyHtml.forEach(
        (row: HTMLDivElement) => row.remove()
      );

    })();

    if (Season === Seasons.GreatLent
      || Season === Seasons.JonahFast) {
      //Inserting psaume 'His Foundations In the Holy Montains' before the absolution prayers
      insertPrayersAdjacentToExistingElement(
        btnMassUnBaptised.prayersArray
          .filter(
            table => splitTitle(table[0][0])[0] === Prefix.massCommon + "HisFoundationsInTheHolyMountains&D=GreatLent"),
        btnMassUnBaptised.languages,
        {
          beforeOrAfter: 'beforebegin',
          el: selectElementsByDataRoot(btnDocFragment, Prefix.massCommon+"AbsolutionForTheFather&D=$copticFeasts.AnyDay", {equal:true})[0]
        }
      )
        }
    let anchor: HTMLElement = selectElementsByDataRoot(btnDocFragment,  Prefix.commonPrayer+'HolyGodHolyPowerfull&D=$copticFeasts.AnyDay', {equal:true})[0]; //this is the html element before which we will insert all the readings and responses
      let reading: string[][][];
    (function insertStPaulReading() {
      reading = ReadingsArrays.StPaulArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.stPaul + '&D=' + copticReadingsDate);

      reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)

        //adding the  end of the St Paul reading
        if (reading.length === 0) return;

      //Adding the reading end
            reading.push([[splitTitle(reading[0][0][0])[0]  + '&C=ReadingEnd', ReadingsIntrosAndEnds.stPaulEnd.AR, ReadingsIntrosAndEnds.stPaulEnd.FR, ReadingsIntrosAndEnds.stPaulEnd.EN]]);

      //Inserting the reading intro after the title
      reading[0].splice(1, 0, [
        splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro',
        ReadingsIntrosAndEnds.stPaulIntro.AR,
        ReadingsIntrosAndEnds.stPaulIntro.FR,
        ReadingsIntrosAndEnds.stPaulIntro.EN
      ]);//We replace the first row in the first table of reading (which is the title of the Praxis, with the introduction table
                    
            insertPrayersAdjacentToExistingElement(reading, readingsLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
    })();   
    (function insertKatholikon() {
      reading = ReadingsArrays.KatholikonArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.katholikon + '&D=' + copticReadingsDate);

      if (reading.length === 0) return;

      reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)

      //ading the introduction and the end of the Katholikon
      reading.push([[
        splitTitle(reading[0][0][0])[0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.katholikonEnd.AR, ReadingsIntrosAndEnds.katholikonEnd.FR, ReadingsIntrosAndEnds.katholikonEnd.EN
      ]]);

      //Inserting the reading intro after the title
      reading[0].splice(1, 0,
        [splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.katholikonIntro.AR, ReadingsIntrosAndEnds.katholikonIntro.FR, ReadingsIntrosAndEnds.katholikonIntro.EN
        ]);//We replace the second row in the table of reading (which is the title of the Katholikon, with the introduction table)

      insertPrayersAdjacentToExistingElement(reading, readingsLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
    })();   
    (function insertPraxis() {
      reading = ReadingsArrays.PraxisArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.praxis + '&D=' + copticReadingsDate);
      
      if (reading.length === 0) return;

      reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)

        reading.push([[splitTitle(reading[0][0][0])[0]  + '&C=ReadingEnd', ReadingsIntrosAndEnds.praxisEnd.AR, ReadingsIntrosAndEnds.praxisEnd.FR, ReadingsIntrosAndEnds.praxisEnd.EN]])
      
      //Inserting the reading intro after the title
      reading[0].splice(1, 0, [splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.praxisIntro.AR, ReadingsIntrosAndEnds.praxisIntro.FR, ReadingsIntrosAndEnds.praxisIntro.EN]);//We replace the first row in the first table of reading (which is the title of the Praxis, with the introduction table

            insertPrayersAdjacentToExistingElement(reading, readingsLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
            
      (function insertPraxisResponse() {
        let praxis: HTMLElement[] =
          selectElementsByDataRoot(btnMassUnBaptised.docFragment, Prefix.praxis + '&D=', { startsWith: true });
        
        if (praxis.length === 0) return;

        let response: string[][][] = PrayersArray
          .filter(table =>
          table[0][0].startsWith(Prefix.praxisResponse)
          && (
            eval(splitTitle(table[0][0])[0].split('&D=')[1].replace('$', '')) === copticDate
            || eval(splitTitle(table[0][0])[0].split('&D=')[1].replace('$', '')) === Season
          ));
          if(response.length===0){
            //If we are not on a a cotpic feast or a Season, We will look in the saints feasts
            response = PrayersArray.filter(table =>
              table[0][0].startsWith(Prefix.praxisResponse)
              && Object.entries(saintsFeasts).filter(entry=> entry[1] === eval(splitTitle(table[0][0])[0].split('&D=')[1].replace('$', ''))).length>0)
          }
        if (response.length > 0) {
          //If a Praxis response was found
          if (Season === Seasons.GreatLent) {
            // The query should yield to  2 tables ('Sundays', and 'Week') for this season. We will keep the relevant one accoding to the date
            if (todayDate.getDay() === 0
              || todayDate.getDay() === 6)
              response = response.filter(table => table[0][0].includes('Sundays&D='));
            else response = response.filter(table => table[0][0].includes('Week&D='));
          };
          insertPrayersAdjacentToExistingElement(response, prayersLanguages, { beforeOrAfter: 'beforebegin', el: praxis[0] });
        };

        //Moving the annual response
        let noSeasonResponse: HTMLElement[] = selectElementsByDataRoot(btnDocFragment, Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay", {equal:true});

        if(!noSeasonResponse || noSeasonResponse.length ===0) return console.log('error: annual = ', noSeasonResponse);
        
        noSeasonResponse.forEach(htmlRow => praxis[0].insertAdjacentElement('beforebegin', htmlRow));

      })();
    })();
    (function insertSynaxarium() {
      reading = ReadingsArrays.SynaxariumArray.filter(table => splitTitle(table[0][0])[0] === Prefix.synaxarium + '&D=' + copticDate);

      if (reading.length === 0) return;

      reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)

      reading[0].splice(1, 0, [
        splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.synaxariumIntro.FR.replace('theday', Number(copticDay).toString()).replace('themonth', 
        copticMonths[Number(copticMonth)].FR),

        ReadingsIntrosAndEnds.synaxariumIntro.AR.replace('theday', Number(copticDay).toString()).replace('themonth', copticMonths[Number(copticMonth)].AR),

        ReadingsIntrosAndEnds.synaxariumIntro.EN.replace('theday', Number(copticDay).toString()).replace('themonth', copticMonths[Number(copticMonth)].EN),
      ]);

      //Replacing the title row of the table with a new title row
        /*let details: string[] = [
          splitTitle(reading[0][0][0])[0],
          Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].FR + '\n' + reading[0][0][1].replace('\n', '&&&').split('&&&')[1],
          Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].AR + '\n' + reading[0][0][2].replace('\n', '&&&').split('&&&')[1]
        ];*/ //This row includes the details of the Synaxarium of the day, I need to think if I should insert it
    
      reading[0].splice(0, 1,
        [
          splitTitle(reading[0][0][0])[0] + '&C=Title',
          'Synixaire' + '\n' +  Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].FR,
          'السنكسار' + '\n' + Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].AR ,
        ]);
      
      let praxisElements: HTMLElement[] =
        selectElementsByDataRoot(btnMassUnBaptised.docFragment, Prefix.praxis + '&D=', { startsWith: true });

      if (praxisElements.length === 0) return;
      let anchor:{beforeOrAfter:InsertPosition, el:HTMLElement} = {
        beforeOrAfter: 'beforebegin',
        el: praxisElements[praxisElements.length-1].nextElementSibling as HTMLElement,
      };

      reading
        .forEach(table => {
          table
            .map(row => {
              return createHtmlElementForPrayer(
                row,
                ['FR', 'AR'],
                undefined,
                anchor)
            });
        });
      
    })();
    (function insertPentecostalHymns() {
      if (Season !== Seasons.PentecostalDays) return;
      let hymns: string[][][] = PrayersArray.filter((table) => table[0][0].startsWith("PentecostalHymns&D=$Seasons.PentecostalDays"));
      if (hymns.length > 0) {
        insertPrayersAdjacentToExistingElement(hymns, prayersLanguages, { beforeOrAfter: 'beforebegin', el: anchor })
      }
    })();
    (function insertGospelReading() {
      //We will create a facke btn
                  //Inserting the Gospel Reading
                  getGospelReadingAndResponses(
                    Prefix.gospelMass,
                    //We create a fake button to pass as argument because no declared button has the Gospel prayersArray and the languages
                    new Button({ btnID: 'Fake', label: {defaultLanguage: 'Fake', foreignLanguage:'Fake'}, prayersArray: ReadingsArrays.GospelMassArray, languages: readingsLanguages}),
                    btnMassUnBaptised.docFragment
                  );
    })();   
    (async function insertBookOfHoursButton() {

      if (copticReadingsDate === copticFeasts.Resurrection
        || copticDate === copticFeasts.Nativity
        || copticDate === copticFeasts.Baptism)
        //In these feasts we don't pray any hour
        return;  
      
      let hoursBtns:Button[] = btnBookOfHours.onClick(true); //We get buttons for the relevant hours according to the day
      if (!hoursBtns) return;

      (function filterHours() {
        //args.mass is a boolean that tells whether the button prayersArray should include all the hours of the Book Of Hours, or only those pertaining to the mass according to the season and the day on which the mass is celebrated
        let hours = [hoursBtns[1], hoursBtns[2], hoursBtns[3]];//Those are the 3rd, 6th and 9th hours
      
        if ((Season === Seasons.GreatLent
        || Season === Seasons.JonahFast)
          && todayDate.getDay() !== 0
          && todayDate.getDay() !== 6)
          //We are during the Great Lent, we pray the 3rd, 6th, 9th, 11th, and 12th hours
          hours.push(hoursBtns[4], hoursBtns[5]);
        

        else if (
          todayDate.getDay() === 0
          || todayDate.getDay() === 6 //Whatever the period, if we are a Saturday or a Sunday, we pray only the 3rd and 6th Hours
          || lordFeasts.indexOf(copticDate) > -1
          ||!isFast)
          //We are a Sunday or a Saturday, or during the 50 Pentecostal days, or on a Lord Feast day, or we are during a no fast period
          hours.pop();//we remove the 9th hour
        
        hoursBtns = hours
      })();

      let bookOfHoursMasterDiv = document.createElement('div');//This is the div that will contain the master button which shows or hides the Book of Hours sub buttons
      bookOfHoursMasterDiv.classList.add('inlineBtns');
      bookOfHoursMasterDiv.id = 'masterBOHBtn';

      let btnsDiv: HTMLDivElement = document.createElement('div');//This is the div that contains the sub buttons for each Hour of the Book of Hours
      btnsDiv.classList.add('inlineBtns');
      btnsDiv.classList.add(hidden);

      let masterBtn = new Button({
        btnID: 'BOH_Master',
        label: {
          defaultLanguage: 'الأجبية',
          foreignLanguage: 'Agpia'
        },
        onClick: () => { btnsDiv.classList.toggle(hidden) }
      });
      
      bookOfHoursMasterDiv.prepend(createBtn(masterBtn, bookOfHoursMasterDiv, 'inlineBtn', true, masterBtn.onClick));//We add the master button as 1st element of bookOfHoursMasterDiv

      let createdElements: [HTMLElement, HTMLDivElement];

              //We will create a button and an expandable div for each hour
      hoursBtns
      .reverse() //We reverse the buttons in order to get them arranged in the order from right to left (i.e: 3rdHour, 6thHour, etc.)
        .forEach(async (btn) => {
          btn.onClick(true);//We call the onClick() function of the btn in order to build its prayersSequence and prayersArray properties

          //We will filter the btn.prayersArray in order to keep only those prayers tables (string[][]) matching the btn.prayersSequence order
          let filteredPrayers:string[][][] =  btn.prayersSequence
          .map(title => {
            return btn.prayersArray
              .filter(tbl => splitTitle(tbl[0][0])[0] === title)[0]; 
          });
  
          createdElements = addExpandablePrayer(
            btnDocFragment.children[0] as HTMLDivElement,
            'bookOfHours' + btn.btnID,
            btn.label,
            filteredPrayers,
            btnBookOfHours.languages
      );
             
          btnsDiv.appendChild(createdElements[0]);//We add all the buttons to the same div instead of 3 divs;

          createdElements[0].addEventListener(
            'click',
              ()=>showTitles('#bookOfHours' + btn.btnID + 'Expandable'));

          async function showTitles(id: string) {
            //!CAUTION: we had to pass the id of the expandable Div instead of the div itself, because the refrence to the div is not maintained for each button. It keeps the reference to the last created button. Until we find a way to bind it, we use the id of the createdContainer in order to retrieve it later
            let BOHContainer = containerDiv.querySelector(id);
                let sideBarChildren = Array.from(sideBarTitlesContainer.children) as HTMLDivElement[];
                //We remove the already existing title for this hour
            
            //When the button is clicked, we remove all the book of hours titles
            sideBarChildren.filter(htmlDiv => htmlDiv.dataset.group.startsWith(Prefix.bookOfHours))
              .forEach(titleDiv => titleDiv.remove());
            
            if (!BOHContainer.classList.contains(hidden)){
              //If BOHContainer is not hidden, we add its titles to the right sideBar
              let btnTitles =
                Array.from(BOHContainer.children)
                .filter((htmlRow: HTMLDivElement) => htmlRow.classList.contains('Title') || htmlRow.classList.contains('SubTitle')) as HTMLDivElement[];


            let addedTitles = await showTitlesInRightSideBar(btnTitles, undefined, false, BOHContainer.id);
            addedTitles
              .reverse()
              .forEach(titleDiv => {
                //Moving the title to the top of the sideBar menu, and giving each of them a data-group = 'bookOfHoursTitle'
                  sideBarTitlesContainer.prepend(titleDiv);
              });
            }
  
                //hiding the expandable divs of the other buttons, if they were expanded before
            hideOtherExpandables();
            function hideOtherExpandables(){
                    let expandables =
                    Array.from(containerDiv.children)
                      .filter((htmlRow: HTMLDivElement) =>
                        htmlRow.id.endsWith('Expandable')) as HTMLDivElement[];
                  if (expandables.length === 0) return;
            expandables
              .forEach(container => {
                        if (container.id === 'bookOfHours' + btn.btnID + 'Expandable') return;
                        container.classList.add(hidden);
              })
            };
};
              
              createdElements[1]
                .querySelectorAll('div.SubTitle')
                .forEach((subTitle: HTMLElement) => collapseText(subTitle, createdElements[1]));

                if (localStorage.displayMode === displayModes[1]) {
                  //If we are in the 'Presentation Mode'
                  Array.from(createdElements[1].querySelectorAll('div.Row'))
                    .filter((row: HTMLElement) => row.dataset.root.includes('HourPsalm') || row.dataset.root.includes('EndOfHourPrayer'))
                    .forEach(row => row.remove());//we remove all the psalms and keep only the Gospel and the Litanies,
                  Array.from(sideBarTitlesContainer.children)
                    .filter((row: HTMLDivElement) =>
                      row.dataset.root.includes('HourPsalm')
                    || row.dataset.root.includes('EndOfHourPrayer'))
                    .forEach(row => row.remove());//We do the same for the titles
          };
          
          }
      )

      btnDocFragment.prepend(btnsDiv);
      btnDocFragment.prepend(bookOfHoursMasterDiv);
      btnsDiv.style.display = 'grid';
      let x = hoursBtns.length;
      if (x > 3) x = 3;//we limit the number of columns to 3
      if (x>1) btnsDiv.style.gridTemplateColumns = ((100/x).toString() + '% ').repeat(x)
    })();

    
    //Collapsing all the Titles
    collapseAllTitles(
      Array.from(btnDocFragment.children) as HTMLDivElement[]);

    btnMassUnBaptised.docFragment.getElementById('masterBOHBtn').classList.toggle(hidden);//We remove hidden from btnsDiv
    
  }
});

const btnMassBaptised: Button = new Button({
  btnID: "btnMassBaptised",
  label: {
    defaultLanguage: "قداس المؤمنين",
    foreignLanguage: "Messe des Croyants",
    otherLanguage: "Baptized Mass",
  },
  parentBtn: btnMass,
  children: [btnMassStBasil, btnMassStCyril, btnMassStGregory, btnMassStJohn],
});

const btnDayReadings: Button = new Button({
  btnID: "btnDayReadings",
  children: [
    new Button({
      btnID: "btnReadingsStPaul",
      label: {
        defaultLanguage: "البولس",
        foreignLanguage: "Epître de Saint Paul",
        otherLanguage: "Pauline Epistle",
      },
      showPrayers: true,
      prayersSequence: [Prefix.stPaul],
      prayersArray: ReadingsArrays.StPaulArray,
      languages: [...readingsLanguages],
      onClick: () => {
        scrollToTop(); //scrolling to the top of the page
      },
    }),
    new Button({
      btnID: "btnReadingsKatholikon",
      label: {
        defaultLanguage: "الكاثوليكون",
        foreignLanguage: "Katholikon",
      },
      showPrayers: true,
      prayersSequence: [Prefix.katholikon],
      prayersArray: ReadingsArrays.KatholikonArray,
      languages: [...readingsLanguages],
      onClick: () => {
        scrollToTop(); //scrolling to the top of the page
      },
    }),    
    new Button({
      btnID: "btnReadingsPraxis",
      label: {
        defaultLanguage: "الإبركسيس",
        foreignLanguage: "Praxis",
      },
      showPrayers: true,
      prayersSequence: [Prefix.praxis],
      prayersArray: ReadingsArrays.PraxisArray,
      languages: [...readingsLanguages],
      onClick: () => {
        scrollToTop(); //scrolling to the top of the page
      },
    }), 
    new Button({
      btnID: "btnReadingsSynaxarium",
      label: {
        defaultLanguage: "السنكسار",
        foreignLanguage: "Synaxarium",
      },
      showPrayers: true,
      prayersArray: ReadingsArrays.SynaxariumArray,
      languages: ['FR', "AR"],
      onClick: function (this:Button) {
        //We can't use an arrow function here because we need to use this
        this.prayersSequence = [Prefix.synaxarium + '&D=' + copticDate];
          scrollToTop(); //scrolling to the top of the page
      },
    }), 
    new Button({
      btnID: "btnReadingsGospelMass",
      label: {
        defaultLanguage: "إنجيل القداس",
        foreignLanguage: "l'Evangile",
        otherLanguage: "Gospel",
      },
      showPrayers: true,
      prayersSequence: [Prefix.gospelMass + "Psalm", Prefix.gospelMass + "Gospel"],
      prayersArray: ReadingsArrays.GospelMassArray,
      languages: [...readingsLanguages],
      onClick: () => {
        scrollToTop(); //scrolling to the top of the page
      },
    })],
  label: {
    defaultLanguage: "قراءات اليوم", foreignLanguage: "Lectures du jour",
    otherLanguage: "Day's Readings"
  },
        onClick: (args:{returnBtnChildren?:boolean}={returnBtnChildren:false}) => {
        if (Season === Seasons.HolyWeek) {
                        //We should put here child buttons for the Holy Week prayers and readings
                        let div = document.createElement('div');
                        div.innerText = 'We are during the Holy Week, there are no readings, please go to the Holy Week Prayers'
                        containerDiv.appendChild(div);
                        return
          }
    //We set the btnDayReadings.children[] property
          if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseDawn) < 0) btnDayReadings.children.unshift(btnReadingsGospelIncenseDawn);
          
          if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers) < 0) btnDayReadings.children.unshift(btnReadingsGospelIncenseVespers);
          if (args.returnBtnChildren) return btnDayReadings.children;
    if (
      Season === Seasons.GreatLent &&
      todayDate.getDay() != 6 &&
      copticReadingsDate !== copticFeasts.Resurrection
    ) {
      //we are during the Great Lent and we are not a Saturday
      if (
        btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers) > -1
      ) {
        //There is no Vespers office: we remove the Vespers Gospel from the list of buttons
        btnDayReadings.children.splice(
          btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers),
          1
        );
      }
      //If, in additon, we are not a Sunday (i.e., we are during any week day other than Sunday and Saturday), we will  add the Prophecies button to the list of buttons
      if (todayDate.getDay() != 0) {
        //We are not a Sunday:
        if (btnDayReadings.children.indexOf(btnReadingsPropheciesDawn) === -1) {
          btnDayReadings.children.unshift(btnReadingsPropheciesDawn);
        }
        //since we  are not a Sunday, we will also remove the Night Gospel if included
        if (btnDayReadings.children.indexOf(btnReadingsGospelNight) > -1) {
          btnDayReadings.children.splice(
            btnDayReadings.children.indexOf(btnReadingsGospelNight),
            1
          );
        }
      } else if (
        todayDate.getDay() === 0 &&
        copticReadingsDate != copticFeasts.Resurrection
      ) {
        //However, if we are a Sunday, we add the Night Gospel to the readings list of buttons
        if (btnDayReadings.children.indexOf(btnReadingsGospelNight) === -1) {
          // (we do not add it to the Unbaptized mass menu because it is not read during the mass)
          btnDayReadings.children.push(btnReadingsGospelNight);
        }
      }
    }
  },
});



const btnReadingsGospelIncenseVespers: Button = new Button({
  btnID: "btnReadingsGospelIncenseVespers",
  label: {
    defaultLanguage: "إنجيل عشية",
    foreignLanguage: "Evangile  Vêpres",
    otherLanguage: "Vespers Gospel",
  },
  showPrayers: true,
  prayersSequence: [Prefix.gospelVespers + "Psalm", Prefix.gospelVespers + "Gospel"],
  prayersArray: ReadingsArrays.GospelVespersArray,
  languages: [...readingsLanguages],
  onClick: (returnDate:boolean = false) => {

    let date: string = getTomorowCopticReadingDate()
    function getTomorowCopticReadingDate():string{
    let today: Date = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).


    return getSeasonAndCopticReadingsDate(
      convertGregorianDateToCopticDate(today.getTime(), false)
        //Notice that we pass changeDate argument as 'false' in order to avoid changing the dates
      
      [1],
      today
      )
    };
    console.log(date);
    
    if (returnDate) return date;
    //We add the psalm reading to the begining of the prayersSequence
    btnReadingsGospelIncenseVespers.prayersSequence[0]=Prefix.gospelVespers + "Psalm&D=" + date;
    btnReadingsGospelIncenseVespers.prayersSequence[1]=Prefix.gospelVespers + "Gospel&D=" + date;
    scrollToTop(); //scrolling to the top of the page
  },
});

const btnReadingsGospelIncenseDawn: Button = new Button({
  btnID: "btnReadingsGospelIncenseDawn",
  label: {
    defaultLanguage: "إنجيل باكر",
    foreignLanguage: "Evangile Aube",
    otherLanguage: "Gospel Dawn",
  },
  showPrayers: true,
  prayersSequence: [Prefix.gospelDawn + "Psalm", Prefix.gospelDawn + "Gospel"],
  prayersArray: ReadingsArrays.GospelDawnArray,
  languages: [...readingsLanguages],
  onClick: () => {
    scrollToTop(); //scrolling to the top of the page
  },
});

const btnReadingsGospelNight: Button = new Button({
  btnID: "btnReadingsGospelNight",
  label: {
    defaultLanguage: "إنجيل المساء",
    foreignLanguage: "Evangile du Soir",
    otherLanguage: "Night Gospel",
  },
  showPrayers: true,
  prayersSequence: [Prefix.gospelNight + "Psalm", Prefix.gospelNight + "Gospel"],
  prayersArray: ReadingsArrays.GospelNightArray,
  languages: [...readingsLanguages],
  onClick: () => {
    scrollToTop(); //scrolling to the top of the page
  },
});

const btnReadingsPropheciesDawn: Button = new Button({
  btnID: "btnReadingsPropheciesDawn",
  label: {
    defaultLanguage: "نبوات باكر",
    foreignLanguage: "Propheties Matin",
  },
  showPrayers: true,
  parentBtn: btnIncenseDawn,
  prayersSequence: [Prefix.propheciesDawn],
  prayersArray: ReadingsArrays.PropheciesDawnArray,
  languages: [...readingsLanguages],
  onClick: () => {
    scrollToTop(); //scrolling to the top of the page
  },
});

const btnBookOfHours:Button =  new Button({
        btnID: 'btnBookOfHours',
        label: { defaultLanguage: 'الأجبية', foreignLanguage: 'Agpia', otherLanguage: 'Book of Hours'},
        docFragment:new DocumentFragment(),
        showPrayers: true,
        languages: [...prayersLanguages],
  onClick: (returnBtnChildren: boolean = false) => {
   let 
      Kenin: string =
        Prefix.commonPrayer + 'NowAlwaysAndForEver&D=$copticFeasts.AnyDay',
      ZoksaPatri: string =
        Prefix.commonPrayer + 'GloryToTheFatherTheSonAndTheSpirit&D=$copticFeasts.AnyDay',
      gospelEnd: string =
        Prefix.bookOfHours + 'GospelEnd&D=$copticFeasts.AnyDay',
      OurFatherWhoArtInHeaven:string =
       Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay',
      AngelsPrayers:string = Prefix.commonPrayer+'AngelsPrayer&D=$copticFeasts.AnyDay',
      HailToYouMaria:string = Prefix.commonPrayer+'WeSaluteYouMary&D=$copticFeasts.AnyDay',
      WeExaltYou:string =
        Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay',
     Agios: string =
       Prefix.commonPrayer + 'HolyGodHolyPowerfullPart1&D=$copticFeasts.AnyDay',
     Kyrielison41Times:string = Prefix.commonPrayer+'Kyrielison41Times&D=$copticFeasts.AnyDay',
      HolyLordOfSabaot :string=
        Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay',
      Creed:string =
        Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay',
      Hallelujah:string =
       Prefix.bookOfHours + 'PsalmEnd&D=$copticFeasts.AnyDay',
      EndOfAllHours:string = Prefix.bookOfHours + '1stHourEndOfAllHoursPrayer&D=$copticFeasts.AnyDay',
      HourIntro: string[] = [
        Prefix.commonPrayer + 'ThanksGivingPart1&D=$copticFeasts.AnyDay',
        Prefix.commonPrayer + 'ThanksGivingPart2&D=$copticFeasts.AnyDay',
        Prefix.commonPrayer + 'ThanksGivingPart3&D=$copticFeasts.AnyDay',
        Prefix.commonPrayer + 'ThanksGivingPart4&D=$copticFeasts.AnyDay',
        Prefix.bookOfHours + 'AnyHourPsalm50&D=$copticFeasts.AnyDay'
     ],
      DawnPsalms = [
        Prefix.bookOfHours + '6thHourPsalm62&D=$copticFeasts.AnyDay',
        Prefix.bookOfHours + '6thHourPsalm66&D=$copticFeasts.AnyDay',
        Prefix.bookOfHours + '6thHourPsalm69&D=$copticFeasts.AnyDay',
        Prefix.bookOfHours + '9thHourPsalm112&D=$copticFeasts.AnyDay',
      ];

    btnBookOfHours.children = [];
    let commonPrayers = getCommonPrayers();

    function getCommonPrayers(): string[][][] { 
      let commonPrayers:string[][][] = 
      [
         ...CommonPrayersArray
           .filter(table =>
               splitTitle(table[0][0])[0] === ZoksaPatri
         || splitTitle(table[0][0])[0] === Kenin
         || splitTitle(table[0][0])[0] === HolyLordOfSabaot
         || splitTitle(table[0][0])[0] === HailToYouMaria
         || splitTitle(table[0][0])[0] === WeExaltYou
         || splitTitle(table[0][0])[0] === Creed
         || splitTitle(table[0][0])[0] === OurFatherWhoArtInHeaven
         || splitTitle(table[0][0])[0] === AngelsPrayers
         || splitTitle(table[0][0])[0] === Kyrielison41Times
         || splitTitle(table[0][0])[0].startsWith(Agios.split('1&D')[0])
       || new RegExp(Prefix.commonPrayer + 'ThanksGivingPart\\d{1}\\&D\\=\\$copticFeasts.AnyDay').test(splitTitle(table[0][0])[0])
       || new RegExp(Agios + '\\d{1}\\&D\\=\\$copticFeasts.AnyDay').test(splitTitle(table[0][0])[0])
     )];

      commonPrayers.push(
        ...bookOfHoursPrayersArray
          .filter(tbl =>
            splitTitle(tbl[0][0])[0] === HourIntro[HourIntro.length - 1]//this is Psalm 50
            || splitTitle(tbl[0][0])[0] === gospelEnd
            || splitTitle(tbl[0][0])[0] === Hallelujah
            || splitTitle(tbl[0][0])[0] === EndOfAllHours
        ));
    return commonPrayers
    };

    (function addAChildButtonForEachHour() {
        for (let hour in bookOfHours) {
          if (!hour.endsWith('PrayersArray')) continue;

          let hourName = hour.split('PrayersArray')[0];

          let createdBtn = new Button({
            btnID: hourName,
            label: {
              defaultLanguage: bookOfHoursLabels.filter(label => label.id === hourName)[0].AR,
              foreignLanguage: bookOfHoursLabels.filter(label => label.id === hourName)[0].FR
            },
            languages: btnBookOfHours.languages,
            showPrayers: true,
            onClick: (returnBtnChildren:boolean=false)=>hourBtnOnClick(createdBtn, returnBtnChildren),
          });
          //Adding the onClick() property to the button
          function hourBtnOnClick(btn: Button, returnBtnChildren:boolean = false){
            (function buildBtnPrayersSequence() {
              //We will add the prayers sequence to btn.prayersSequence[]
              let endOfPrayer: string[] = [AngelsPrayers, Agios, Agios.replace('Part1', 'Part2'),OurFatherWhoArtInHeaven, HailToYouMaria, WeExaltYou, Creed, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven];

              btn.prayersSequence =
                bookOfHours[hour]
                  .map(table => splitTitle(table[0][0])[0]); //we add all the titles to the prayersSequence
             

              (function addCommonSequences() {
                if (returnBtnChildren) return;
                btn.prayersSequence.splice(1, 0, ...HourIntro);//We also add the titles in HourIntro before the 1st element of btn.prayersSequence[]
                if (btn.btnID !== Object.keys(bookOfHours)[0].split('PrayersArray')[0] && btn.btnID !== Object.keys(bookOfHours)[10].split('PrayersArray')[0]) {
                  //We don't add the End of All Hours Prayers to the 'Dawn' Prayer, because it is already attached to it by default (: its title includes '1stHour')
                  btn.prayersSequence
                    .splice(btn.prayersSequence.length - 1, 0, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven);
                  btn.prayersSequence.push(EndOfAllHours);
                };
              
                if (btn.btnID === Object.keys(bookOfHours)[0].split('PrayersArray')[0]) {
                  //Adding the repeated psalms (psalms that are found in the 6ths and 9th hour), before pasalm 122
                  btn.prayersSequence
                    .splice(btn.prayersSequence.indexOf(Prefix.bookOfHours + '1stHourPsalm142&D=$copticFeasts.AnyDay'), 0, ...DawnPsalms);

                  btn.prayersSequence
                    .splice(
                      btn.prayersSequence.indexOf(Prefix.bookOfHours + "1stHourEndOfHourPrayer1&D=$copticFeasts.AnyDay"), 0, ...endOfPrayer)
                };

                if (btn.btnID ===  Object.keys(bookOfHours)[10].split('PrayersArray')[0]) {
                  btn.prayersSequence.push(EndOfAllHours); //We add the end of hours prayer that we hadn't added before

                  let copy = [...endOfPrayer];

                  copy.splice(0, 1);
                  //we remove the Angels Prayer
                  btn.prayersSequence.splice(btn.prayersSequence.indexOf(Prefix.bookOfHours + '12thHourEndOfHourPrayer&D=$copticFeasts.AnyDay'), 0, ...copy)
                }
              })()
            })();
      
            (function insertZoksaPatri() {
              btn.prayersSequence
                .filter(title => title.includes('Litanies'))
                .forEach(
                  tblTitle => {
                  if (tblTitle.includes('Litanies1')
                    || tblTitle.includes('Litanies4'))
                  {
                      btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, ZoksaPatri)
                    } else if (
                    tblTitle.includes('Litanies2') //second litany
                    || tblTitle.includes('Litanies5') //5th litany
                    || (
                      tblTitle.includes('Litanies3')
                      && btn.prayersSequence[btn.prayersSequence.indexOf(tblTitle) + 1].includes('Litanies4')) //3rd litany if litanies are > 3
                  ){
                      btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, Kenin)
                  }
                  });
              })();

              (function insertPsalmAndGospelEnds() {
                btn.prayersSequence
                  .filter(
                    title => title.includes('Psalm')
                      || title.includes('Gospel&D=$copticFeasts.AnyDay')
                  )
                  .forEach(
                    tblTitle => {
                      if (
                        tblTitle.includes('Gospel')
                        && btn.prayersSequence[btn.prayersSequence.indexOf(tblTitle) + 1] !== gospelEnd) //Inserting the Gosepl End
                      {
                        btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, gospelEnd)
                      } else if (
                        tblTitle.includes('Psalm')
                        && btn.prayersSequence[btn.prayersSequence.indexOf(tblTitle) + 1] !== Hallelujah) {
                        btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, Hallelujah)
                      };
                    });
                  })();          
            (function pushCommonPrayers() {
              btn.prayersArray = [...bookOfHours[hour]];
                btn.prayersArray.push(...commonPrayers);
                if (btn.btnID === 'Dawn') {
                  btn.prayersArray
                    .push(
                      ...DawnPsalms
                        .map(psalm =>
                          bookOfHoursPrayersArray
                            .filter(tbl => splitTitle(tbl[0][0])[0] === psalm)[0])
                    );
                };
            })();
            
            (function removeActorsFromPrayersArrays() {
              //When showing just the Book of Prayers independant of any Mass context, we remove all the actors classes from the prayersArray of all the buttons
              if (returnBtnChildren || !btn.prayersArray) return; 
                  btn.prayersArray
                    .forEach(tbl => {
                      tbl.forEach(row => {
                        if (row[0].endsWith('&C=Title') || row[0].endsWith('&C=SubTitle')) return;
                        row[0] = splitTitle(row[0])[0];
                      });
                    });              
            })();
            };
          btnBookOfHours.children.push(createdBtn);
      };
    })();
    
    if (returnBtnChildren) return btnBookOfHours.children;
  

    scrollToTop();
    return btnBookOfHours.prayersSequence;
    }
    }
);

/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayers(liturgie: string): string[] {
  //this function sets the date or the season for the Psalm response and the gospel response
  let prayers = [...GospelPrayersSequence],
    date: string;

  let psalm: number = prayers.indexOf(Prefix.psalmResponse),
    gospel: number = prayers.indexOf(Prefix.gospelResponse);

  prayers.forEach((p) => (prayers[prayers.indexOf(p)] = p + "&D=")); //we add '&D=' to each element of prayer

  //we replace the word 'Mass' in 'ReadingsGospelMass' by the liturige, e.g.: 'IncenseDawn'
  prayers[psalm + 1] = prayers[psalm + 1].replace(Prefix.gospelMass, liturgie);
  prayers[psalm + 2] = prayers[psalm + 2].replace(Prefix.gospelMass, liturgie);
  //setting the psalm and gospel responses
  (function setPsalmAndGospelResponses() {
    if (lordFeasts.indexOf(copticDate) > -1) {
      //This means we are on a Lord Feast, there is always a specific gospel and psalm response for these feasts, even when it falls during the Great Lent (Annonciation does sometimes)
      date = copticDate;
      prayers[psalm] += date;
      prayers[gospel] += date;
    } else if (Number(copticDay) === 29
      && [4, 5, 6].indexOf(Number(copticMonth)) < 0) {
      //we are on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast), and Touba and Amshir (they are excluded because they precede the annonciation)
      date = copticFeasts.theTwentyNinethOfCopticMonth;
      prayers[psalm] += date;
      prayers[gospel] += date;
    } else if (Season === Seasons.StMaryFast) {
      //we are during the Saint Mary Fast. There are diffrent gospel responses for Incense Dawn & Vespers
      if (todayDate.getHours() < 15) {
        prayers[gospel] === prayers[gospel].replace("&D=", "Dawn&D=");
      } else {
        prayers[gospel] === prayers[gospel].replace("&D=", "Vespers&D=");
      }
      date = Season;
      prayers[psalm] += date;
      prayers[gospel] += date;
    } else if (Season === Seasons.Kiahk) {
      // we are during Kiahk month: the first 2 weeks have their own gospel response, and the second 2 weeks have another gospel response
      date = Season;
      if (
        checkWhichSundayWeAre(Number(copticDay)) === ("1stSunday" || "2ndSunday")
      ) {
        prayers[gospel] = prayers[gospel].replace("&D=", "1&D=");
      } else {
        prayers[gospel] = prayers[gospel].replace("&D=", "2&D=");
      }
      prayers[psalm] += "0000";
      prayers[gospel] += date;
    } else if (Season === Seasons.GreatLent) {
      //we are during the Great Lent period
      if (copticReadingsDate === copticFeasts.EndOfGreatLentFriday) {
        if (todayDate.getHours() > 15) {
          //We are in the vespers of Lazarus Saturday
          date = copticFeasts.LazarusSaturday;
          prayers[gospel] = prayers[gospel].replace("&D=", "Vespers&D=");
          date = copticFeasts.LazarusSaturday;
        } else {
          //We are in the morning
          date = copticFeasts.EndOfGreatLentFriday;
        }
        prayers[gospel] += date;
      }
      else if (copticReadingsDate === copticFeasts.LazarusSaturday) {
        if (todayDate.getHours() < 15) {
          //We are in the morning
          date = copticFeasts.LazarusSaturday;
        } else {
          //We are in the Vespers of the Palm Sunday
          date = copticFeasts.PalmSunday;
          prayers[gospel] = prayers[gospel].replace("&D=", "Vespers&D=");
        }
        prayers[psalm] += date;
        prayers[gospel] += date;
      } else {
        date = Seasons.GreatLent;
        todayDate.getDay() === 0
          || todayDate.getDay() === 6
          ? (prayers[gospel] = prayers[gospel].replace(
            "&D=",
            Seasons.GreatLent + "Sundays&D="
          ))
          : (prayers[gospel] = prayers[gospel].replace(
            "&D=",
            Seasons.GreatLent + "Week&D="
          ));
      }
      prayers[psalm] += copticFeasts.AnyDay;
      prayers[gospel] += date;
    } else if (Season === Seasons.JonahFast) {
      date = Season;
      prayers[gospel] = prayers[gospel].replace(
        "&D=",
        copticReadingsDate.split(Season)[1] + "&D="
      );
      prayers[psalm] += "0000";
      prayers[gospel] += date;
    } else if (Season === Seasons.PentecostalDays) {
      date = Seasons.PentecostalDays;
      prayers[psalm] += date;
      prayers[gospel] += date;
    } else if (Season === Seasons.NoSeason) {
      date = "0000";
      prayers[psalm] += date;
      prayers[gospel] += date;
    }
  })();
  return prayers;
}

let btnsPrayersSequences: string[][]= [];
let btns: Button[] = [
  btnIncenseDawn,
  btnIncenseVespers,
  btnMassStCyril,
  btnMassStBasil,
  btnMassStGregory,
];

/**
 *
 * @param {HTMLDivElement} targetElement - the html child of containerDiv, in relation to which the newly created div containing the html buttons elements, will be placed according to a given position
 * @param {Button[]} btns - a list of Button for each we will create an inline redirection html button
 * @param {InsertPosition} position - an object providing the position where the newly created div containing the html elements, will be placed compared. The div is placed in a position (i.e., the beforeOrAfter property) in relation ton an html element in the containerDiv (el) which is the targetEelement
 *@param {string} btnsContainerID - the id of the div container to which the html buttons will be appended. This id may be needed to select the div after redirection
 */
async function redirectToAnotherMass(
  btns: Button[],
  position: { beforeOrAfter: InsertPosition, el:HTMLElement},
  btnsContainerID:string
) {
        if (!position.el) return;
        
  let redirectTo: Button[] = [];
  btns.map((btn) => {
    //for each button in the btns array, we will create a fake Button and will set its onClick property to a function that retrieves the text of the concerned mass
    let newBtn: Button = new Button({
      btnID: "GoTo" + position.el.dataset.root + "From" + btn.rootID,
      label: {
        defaultLanguage: btn.label.defaultLanguage,
        foreignLanguage: btn.label.foreignLanguage,
      },
      cssClass: inlineBtnClass,
      onClick: () => {
        showChildButtonsOrPrayers(btn); //We simulated as if btn itself has been clicked, which will show all its prayers, children, etc.
 
        //if there is an element in containerDiv having the same data-root as targetElement
        if (containerDiv.querySelector('#' + btnsContainerID)) createFakeAnchor(btnsContainerID);
      }
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
  createFakeAnchor('homeImg');
}


/**
 * Retrievs and adds html div elements representing the Gospel Litany, the Gospel and psalm introductions, and the Gospel and Psalm readings for a given liturgy 
 * @param {string} liturgy - the prefix of the liturgie for which we want to retrieve the gospel reading
 * @param {string[][][]} goseplReadingsArray - the array containing the gospel reading (gospel and psalm)
 * @param {string[]} languages - the languages sequence of the gospelReadingsArray
 * @param {HTMLElement | DocumentFragment} container - the html element to which the html elements (i.e. div) containing the gospel will be appended after being created
 * @param {HTMLElement} gospelInsertionPoint - the html element in relation to which the created html elements will be inserted in the container
 * @returns 
 */
async function getGospelReadingAndResponses(
  liturgy: string,
  btn: Button,
  container?: HTMLElement | DocumentFragment,
  gospelInsertionPoint?: HTMLElement
) {
  if (!container) container = containerDiv;

  if (!gospelInsertionPoint) gospelInsertionPoint =
    selectElementsByDataRoot(container, Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay", { equal: true })[0];


  //We start by inserting the standard Gospel Litany
  (function insertGospelLitany() {
    let gospelLitanySequence = [
      Prefix.commonPrayer + "GospelPrayerPart1&D=$copticFeasts.AnyDay",
      Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay",
      Prefix.commonPrayer + "GospelPrayerPart2&D=$copticFeasts.AnyDay",
      Prefix.commonPrayer + "GospelPrayerPart3&D=$copticFeasts.AnyDay",
      Prefix.commonPrayer + "GospelIntroductionPart1&D=$copticFeasts.AnyDay",
      Prefix.commonPrayer + "ZoksasiKyrie&D=$copticFeasts.AnyDay",
      Prefix.commonPrayer + "PsalmIntroduction&D=$copticFeasts.AnyDay",
      Prefix.commonPrayer + "GospelIntroductionPart2&D=$copticFeasts.AnyDay"
    ];//This is the sequence of the Gospel Prayer/Litany for any liturgy
  
    let gospelLitanyPrayers: string[][][] = [];
    gospelLitanyPrayers =
      gospelLitanySequence
        .map((title: string) => {
        return PrayersArray.filter(table =>
          splitTitle(table[0][0])[0] === title
        )[0];
      }
    );

    insertPrayersAdjacentToExistingElement(
      gospelLitanyPrayers,
      prayersLanguages,
      {
        beforeOrAfter: 'beforebegin',
        el: gospelInsertionPoint
      }
    );
  })();

  if (new Map(JSON.parse(localStorage.showActors)).get("Diacon") === false) {
    alert("Diacon Prayers are set to hidden, we cannot show the gospel");
    return;
  } //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers

  let anchorDataRoot = Prefix.commonPrayer + 'GospelIntroduction&D=$copticFeasts.AnyDay';
  

  let gospelIntroduction =
    selectElementsByDataRoot(container, anchorDataRoot, { equal: true });
  
  if (gospelIntroduction.length === 0) return console.log('gospelIntroduction.length = 0 ', gospelIntroduction);
  
  let responses: string[] = setGospelPrayers(liturgy); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']

  //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
  let date = copticReadingsDate;
  if(liturgy === Prefix.gospelVespers){
    date = btnReadingsGospelIncenseVespers.onClick(true)
  };

  let gospel: string[][][] = btn.prayersArray.filter(
    (table) =>
      splitTitle(table[0][0])[0] === responses[1] + date //this is the pasalm text
      || splitTitle(table[0][0])[0] === responses[2] + date //this is the gospel itself
  ); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####". We should get a string[][][] of 2 elements: a table for the Psalm, and a table for the Gospel

  if (gospel.length === 0) return console.log('gospel.length = 0');  //if no readings are returned from the filtering process, then we end the function
  
  gospel.forEach((table:string[][]) => {
    let el: HTMLElement; //this is the element before which we will insert the Psaml or the Gospel
    if (splitTitle(table[0][0])[0].includes("Gospel&D=")) {
      //This is the Gospel itself, we insert it before the gospel response
      el = gospelInsertionPoint;
    } else if (splitTitle(table[0][0])[0].includes("Psalm&D=")) {
      el = gospelIntroduction[gospelIntroduction.length-1];
    }
    if (!el) return;
    insertPrayersAdjacentToExistingElement(
      [table],
      btn.languages,
      {
        beforeOrAfter: 'beforebegin',
        el: el
      })
  });

    //We will insert the Gospel response
    (function insertGospeResponse() {
      let gospelResp: string[][][] = PsalmAndGospelPrayersArray.filter(
        (r) => r[0][0].split('&D=')[0] +'&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) === responses[3]
      ); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
      if (gospelResp.length===0) gospelResp = PrayersArray.filter(
        (r) => splitTitle(r[0][0])[0] ===  Prefix.commonPrayer + 'GospelResponse&D=$copticFeasts.AnyDay'
      );//If no specific gospel response is found, we will get the 'annual' gospel response

      insertPrayersAdjacentToExistingElement(
        gospelResp,
        prayersLanguages,
        {
          beforeOrAfter: "beforebegin",
          el: gospelInsertionPoint,
        }
      );
   
         //We will eventy remove the insertion point placeholder
            gospelInsertionPoint.remove();
    })();
  //We will insert the Psalm response
  (function insertPsalmResponse() {
    let gospelPrayer = selectElementsByDataRoot(container, Prefix.commonPrayer + 'GospelPrayer&D=$copticFeasts.AnyDay', { equal: true }); //This is the 'Gospel Litany'. We will insert the Psalm response after its end

    let psalmResp: string[][][] = PsalmAndGospelPrayersArray.filter(
      (r) => r[0][0].split('&D=')[0] +'&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) === responses[0]
    ); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'

    if (!psalmResp || !gospelPrayer) return;

    insertPrayersAdjacentToExistingElement(psalmResp, prayersLanguages,
      {
      beforeOrAfter: 'beforebegin',
      el: gospelPrayer[gospelPrayer.length - 2].nextElementSibling as HTMLElement
    })
  })();

}


/**
 * Filters the FractionsPrayersArray and Insert a button (a "Master Button") in the specified place (i.e. the anchor). This button when clicked, opens a panel displaying buttons. Each button represents a Fraction. User choises a prayer by clicking on the button. 
 * @param {Button} - btn
 * @param {HTMLElement} anchor - the html element after which the "Master Button" will be inserted
 * @param {typeBtnLabel} lable - the lable of the "Master Button"
 * @param {string} masterBtnID - the id that will be given to the html element created for the "Master Button"
 * @param {string[][][]} prayersArray - the array that will be filtered in order to retrieve the prayers that will be displayed by the buttons
 */
function showFractionPrayersMasterButton(btn: Button, anchor:HTMLElement, label:typeBtnLabel, masterBtnID:string, prayersArray:string[][][])  {
  let filtered: Set<string[][]> = new Set();

  if (Number(copticDay) === 29 && Number(copticMonth) !== 4)
    filterPrayersArray(copticFeasts.theTwentyNinethOfCopticMonth, prayersArray, filtered);//We start by adding the fraction of the 29th of each coptic month if we are on the 29th of the month
  //console.log('filteredSet = ', filtered)

  filterPrayersArray(copticDate, prayersArray, filtered); //we then add the fractions (if any) having the same date as the current copticDate

  filterPrayersArray(Season, prayersArray, filtered); //We then add the fractions (if any) having a date = to the current Season


  filterPrayersArray(copticFeasts.AnyDay, prayersArray, filtered); //We finally add the fractions having as date copticFeasts.AnyDay

  function filterPrayersArray(date: string, prayersArray:string[][][], filtered:Set<string[][]>){
    prayersArray.map(table => {
      if (selectFromMultiDatedTitle(table[0][0], date) === true && !filtered.has(table)) filtered.add(table);
    });
  };
  showMultipleChoicePrayersButton(
    Array.from(filtered),
    btn,
    label,
    masterBtnID,
    undefined,
    anchor
  );
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
function selectFromMultiDatedTitle(
  tableTitle: string,
  coptDate: string = copticDate
): boolean {
  if (!tableTitle.includes('&D=')) return false;
  tableTitle = splitTitle(tableTitle)[0].split("&D=")[1]; 
  let dates = tableTitle.split("||");
  if (
    dates.map(date => {
      if (date.startsWith('$')) {
        date = date.replace('$', '');
        if (!date) return false
        date = eval(date);
      };  
    if (date === coptDate) return true;
    else return false
    }).includes(true) 
  ) return true;
  else return false
}

/**
 * Inserts the Incense Office Doxologies And Cymbal Verses according to the Coptic feast or season
 * @param {HTMLElement | DocumentFragment} container - The HtmlElement in which the btn prayers are displayed and to which they are appended 
 */
async function insertCymbalVersesAndDoxologiesForFeastsAndSeasons(container:HTMLElement | DocumentFragment) {
  let containerChildren = Array.from(container.children) as HTMLDivElement[];
  if (copticDate === copticFeasts.Nayrouz) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.Nayrouz,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.Nayrouz,
      container: container,
    });
  } else if (copticDate === copticFeasts.Cross) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.Cross,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.Cross,
      container: container,
    });
  } else if (Season === Seasons.Kiahk) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: Seasons.Kiahk,
      container: container
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: Seasons.Kiahk,
      container: container
    });
  } else if (copticDate === copticFeasts.NativityParamoun) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.NativityParamoun,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.NativityParamoun,
      container: container,
    });
  } else if (copticDate === copticFeasts.Circumcision) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.Circumcision,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.Circumcision,
      container: container,
    });
  } else if (copticDate === copticFeasts.BaptismParamoun) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.BaptismParamoun,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.BaptismParamoun,
      container: container,
    });
  } else if (copticDate === copticFeasts.Baptism) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.Baptism,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.Baptism,
      container: container
    });
  } else if (copticDate === copticFeasts.CanaWedding) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.CanaWedding,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.CanaWedding,
      container: container,
    });
  } else if (copticDate === copticFeasts.EntryToTemple) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.EntryToTemple,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.EntryToTemple,
      container: container,
    });
  } else if (copticDate === copticFeasts.Annonciation) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.Annonciation,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.Annonciation,
      container: container,
    });
  } else if (copticReadingsDate === copticFeasts.LazarusSaturday) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.LazarusSaturday,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.LazarusSaturday,
      container: container,
    });
  } else if (copticReadingsDate === copticFeasts.PalmSunday) {
    //Palm Sunday must come before Great Lent
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.PalmSunday,
      container: container,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.PalmSunday,
      container: container,
    });
  } else if (Season === Seasons.GreatLent) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: Seasons.GreatLent,
      container: container,
      remove: true,
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: Seasons.GreatLent,
      container: container,
    });

  }else if (Season === Seasons.PentecostalDays) {
    //We will create a string variable that will hold the string expresion of the feast or the season
    let date: string =  'Seasons.PentecostalDays';//this is the initial value for the Pentescostal season
    if (copticReadingsDate === copticFeasts.Ascension
      || Number(copticReadingsDate.split(Seasons.PentecostalDays)[1]) > 39) date = 'copticFeasts.Ascension'//IMPORTANT ! This must come before the Pentecoste
    if (copticReadingsDate === copticFeasts.Pentecoste) date = 'copticFeasts.Pentecoste';//This is the value if we are on the Pentecoste
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: eval(date), //We evaluate the date string to get the value of the variable
      container:container,
    });
    //Inserting the doxologies
    insertDoxologiesForFeastsAndSeasons({
      coptDate: eval(date), //We evaluate the date string to get the value of the variable
      container: container,
    });
      (function replaceStMaykeVerse() {
        //We will replace the 'annual' cymbal verse of St. Maykel by the Pentecostal verse, and will move the verse
        let
          stMaykelAnnual = selectElementsByDataRoot(container, Prefix.commonIncense + 'CymablVersesCommon&D=$copticFeasts.AnyDay', { equal: true })[3],//this is the 'annual' Cymbal verse  of container

          stMaykelPentecostal = selectElementsByDataRoot(container, Prefix.cymbalVerses + 'StMaykel&D=$' + date, { equal: true })[0];//this is the newly inserted Cymbal verse
          
            stMaykelAnnual.insertAdjacentElement('beforebegin', stMaykelPentecostal);
              //Removing the Annual verse
        stMaykelAnnual.remove();
      
    })();
    (function InsertLordsFeastFinal() {
      //Inserting the Final Cymbal verses for the joyfull days and Lord's Feasts
      let final = CymbalVersesPrayersArray.filter(table => table[0][0] === Prefix.cymbalVerses + 'LordFeastsEnd&D=$copticFeasts.AnyDay&C=Title'),
        annualVerses = selectElementsByDataRoot(container, Prefix.commonIncense + 'CymablVersesCommon&D=$copticFeasts.AnyDay', { equal: true });//annualVereses[8] is the St. Markos annual verse, we will delete the annual verses after it
      for (let i = 13; i >6 ; i--) {
        annualVerses[i].remove();
      }
      insertPrayersAdjacentToExistingElement(final, btnIncenseDawn.languages, { beforeOrAfter: 'beforebegin', el: annualVerses[6].nextElementSibling as HTMLElement });
    })();
  }else if (copticDate === copticFeasts.EntryToEgypt) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.EntryToEgypt,
      container: container
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.EntryToEgypt,
      container: container
    });
  } else if (copticDate === copticFeasts.Epiphany) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.Epiphany,
      container: container
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.Epiphany,
      container: container
    });
  } else if (copticDate === copticFeasts.theTwentyNinethOfCopticMonth
    && [4, 5, 6].indexOf(Number(copticMonth)) < 0) {
    //Inserting Cymbal Verses
    insertCymbalVersesForFeastsAndSeasons({
      coptDate: copticFeasts.theTwentyNinethOfCopticMonth,
      container: container
    });
    insertDoxologiesForFeastsAndSeasons({
      coptDate: copticFeasts.theTwentyNinethOfCopticMonth,
      container: container
    });
  }
};


/**
 * Searchs for the cymbal verses of a coptDate, and if found, insert them adjacent to the first element retrieved by a given "data-root" attribute
 * @param {string[][][]} cymbalVerses -  an array of filtered cymbal verses that will be inserted, if not provided, the cymbalVersesArray will be filtered by the coptDate value
 * @param {string} coptDate - string representing the day and month of the coptic calendar: "ddmm"
 * @param {InsertPosition} position - the insertio position of the cymbal verses
 * @param {boolean} remove - indicates whether to delete or not all the elements having the same data-root
 * @returns
 */
async function insertCymbalVersesForFeastsAndSeasons(param: {
  cymbalVerses?: string[][][];
  coptDate?: string;
  position?: InsertPosition;
  container?: HTMLElement | DocumentFragment
  remove?: Boolean;
}) {
  if (!param.coptDate) param.coptDate = copticDate;  
  if (!param.position) param.position = "beforebegin";
  if (!param.container) param.container = containerDiv;
  if (!param.remove) param.remove = true;
  
  let cymbalsTitle = selectElementsByDataRoot(param.container, Prefix.commonIncense + 'CymbalVerses', { equal: true })[0];//Retrieving the cymbal vereses of the feast or season

  //Retrieving the cymbal vereses of the feast or season
  if (!param.cymbalVerses) {
    param.cymbalVerses = CymbalVersesPrayersArray.filter(
      (tbl) =>
        eval(
          splitTitle(tbl[0][0])[0].split("&D=")[1].replace("$", "")
        ) ===
        param.coptDate
    );
  }

  if (!cymbalsTitle || !param.cymbalVerses) return;
  
  if (param.coptDate in lordGreatFeasts) {
    //If we are on a Lord Feast, we add "Eb'oro" to the end
    let endCymbals = CymbalVersesPrayersArray.filter(
      (tbl) =>
      splitTitle(tbl[0][0])[0] ===
        Prefix.cymbalVerses + "LordFeastsEnd&D=$copticFeasts.AnyDay"
    );
    if (
      param.coptDate === copticFeasts.Resurrection
      || param.coptDate === copticFeasts.Ascension
      ||param.coptDate === copticFeasts.Pentecoste
    ) {
      //Inserting the special Cymbal Verse for St. Maykel
      param.cymbalVerses = [
        ...param.cymbalVerses,
        ...CymbalVersesPrayersArray.filter(
          (tbl) =>
          splitTitle(tbl[0][0])[0] ==
            Prefix.cymbalVerses + "StMaykel&D=$copticFeasts.Resurrection "
        ),
      ];
    }
    if (endCymbals) {
      param.cymbalVerses = [...param.cymbalVerses, ...endCymbals];
    }
  }
        insertPrayersAdjacentToExistingElement(param.cymbalVerses,
                btnIncenseDawn.languages, {
    beforeOrAfter: param.position,
    el: cymbalsTitle as HTMLElement,
  });

  if (param.remove) {
    selectElementsByDataRoot(param.container, cymbalsTitle.dataset.root, {equal:true})
      .forEach(el => el.remove());
  }
}

async function insertDoxologiesForFeastsAndSeasons(param: {
  coptDate?: string;
  container?:HTMLElement | DocumentFragment
}) {
  if (!param.container) param.container = containerDiv;
  let containerChildren = Array.from(param.container.children) as HTMLDivElement[];
  let doxology: string[][][];
  doxology = DoxologiesPrayersArray.filter(
    (d) => 
      d[0][0]
      &&splitTitle(d[0][0].split('&D=')[1])[0]
      && eval(String(splitTitle(d[0][0].split('&D=')[1])[0].replace('$', ''))) ===
      param.coptDate
  );
  //If we are during the Great Lent, we will select the doxologies according to whether the day is a Saturday or a Sunday, or an ordinary week day
  if (param.coptDate === Seasons.GreatLent) {
    if (todayDate.getDay() === 0 || todayDate.getDay() === 6) {
      //We are during the Great Lent and the day is a Saturday or a Sunday
      doxology = doxology.filter(
        (d) => /GreatLentSundays\&D\=/.test(d[0][0]) === true
      );
    } else {
      doxology = doxology.filter(
        (d) => /GreatLentWeek\d{1}\&D\=/.test(d[0][0]) === true
      );
    }
  }
  if (doxology) {
    insertPrayersAdjacentToExistingElement(doxology,btnIncenseDawn.languages, {
      beforeOrAfter: "beforebegin",
      el: selectElementsByDataRoot(param.container, Prefix.incenseDawn + 'DoxologyWatesStMary&D=$copticFeasts.AnyDay', {equal:true})[0],
    });
  }
}
async function removeElementsByTheirDataRoot(container = containerDiv, dataRoot: string) {
  selectElementsByDataRoot(container, dataRoot, {equal:true})
    .forEach(el => el.remove());
}
/**
 * Adds a button that when clicked shows or hides certain prayers from containerDiv
 * @param {HTMLElement} insertion - the html element before which the button will be inserted
 * @param {string} btnID - the id of the html element button that will be created
 * @param {typeBtnLabel} label - the label of the button that will be created
 * @param {string[][][]} prayers - the prayers that will shown or hidden or shown
 * @returns {HTMLDivElement} - the created div element that contains the prayers, and will be hidden or shown when the button is clicked
 */
function addExpandablePrayer(insertion: HTMLElement, btnID: string, label: typeBtnLabel, prayers: string[][][], languages:string[]): [HTMLElement, HTMLDivElement] {
  
  let btnDiv = document.createElement("div"); //Creating a div container in which the btn will be displayed
  btnDiv.classList.add("inlineBtns");

  insertion.insertAdjacentElement("beforebegin", btnDiv); //Inserting the div containing the button as 1st element of containerDiv

  let btnExpand = new Button({
    btnID: btnID,
    label: label,
    cssClass: inlineBtnClass,
    languages: languages,
    onClick: ()=>{//We need to name this function because in some cases we need to remove the 'click' event-listner and replace it with another function
      let prayersContainerDiv = containerDiv.querySelector('#' + btnExpand.btnID + 'Expandable') as HTMLElement;
      if (!prayersContainerDiv) return console.log('no collapsable div was found');
      prayersContainerDiv.classList.toggle(hidden);
      //Making the children classList match prayersContainerDiv classList
      Array.from(prayersContainerDiv.children)
        .forEach(child => {
        if (prayersContainerDiv.classList.contains(hidden))
          child.classList.add(hidden);
        else child.classList.remove(hidden);
      }
      );
    },
  });

  let createdButton:HTMLElement = createBtn(btnExpand, btnDiv, btnExpand.cssClass, true, btnExpand.onClick); //creating the html element representing the button. Notice that we give it as 'click' event, the btn.onClick property, otherwise, the createBtn will set it to the default call back function which is showChildBtnsOrPrayers(btn, clear)

  //We will create a newDiv to which we will append all the elements in order to avoid the reflow as much as possible
    let prayersContainerDiv = document.createElement('div');
    prayersContainerDiv.id = btnExpand.btnID + 'Expandable';
    prayersContainerDiv.classList.add(hidden);
    prayersContainerDiv.style.display = 'grid'; //This is important, otherwise the divs that will be add will not be aligned with the rest of the divs
    insertion.insertAdjacentElement('beforebegin', prayersContainerDiv);

  
      //We will create a div element for each row of each table in btn.prayersArray
      prayers.forEach(table =>
        table.forEach(row =>
          createHtmlElementForPrayer(
                row,
                btnExpand.languages,
                undefined,
                prayersContainerDiv
          )
        ));
              return [createdButton, prayersContainerDiv]
}


