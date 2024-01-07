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

  private _any: any;

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
    this._any = btn.any;
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
  set any(any: any) {
    this._any = any;
  }
}

const btnMain: Button = new Button({
  btnID: "btnMain",
  label: {
    AR: "العودة إلى القائمة الرئيسية",
    FR: "Retour au menu principal",
    EN: "Back to the main menu",
  },
  onClick: () => {
    btnMain.children = [
      btnMass,
      btnIncenseOffice,
      btnDayReadings,
      btnBookOfHours,
      btnPsalmody,
    ];

    if (localStorage.editingMode === "true")
      btnMain.children.push(getEditModeButton());

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
      containerDiv.style.gridTemplateColumns = (
        (100 / 3).toString() + "% "
      ).repeat(3);

      //We create html elemements representing each of btnMain children. The created buttons will be appended to containerDiv directly
      btnMain.children
        .map((btn) => {
          return createBtn({
            btn: btn,
            btnsContainer: containerDiv,
            btnClass: "mainPageBtns",
            clear: true,
            onClick: () => onClickBtnFunction(btn),
          });
        })
        .map((htmlBtn) => {
          //For each btn created from the children of btnMain, we give it an image background from the images[] array of links
          htmlBtn.style.backgroundImage =
            images[Array.from(containerDiv.children).indexOf(htmlBtn)];
        });

      function onClickBtnFunction(btn: Button) {
        if (!btn.children || btn.children.length === 0)
          btn.onClick({ returnBtnChildren: true }); //if btn doesn't have childre, we call its onClick() function beacuse the children of some btns are added when tis function is called. We pass 'true' as argument, because it makes the function return the children and do not execute until its end
        let parentHtmlBtn = containerDiv.querySelector(
          "#" + btn.btnID
        ) as HTMLElement;
        let backgroundImage;

        if (parentHtmlBtn)
          backgroundImage = parentHtmlBtn.style.backgroundImage;

        containerDiv.innerHTML = "";

        if (
          !btn.children ||
          btn.children.length === 0 ||
          (btn.prayersSequence && btn.prayersSequence.length > 0)
        ) {
          showChildButtonsOrPrayers(btn); //If btn does not have children, it means that it shows prayers. We pass it to showChildButtonsOrPrayers
          return;
        }
        //else, we will show the btn children
        btn.children
          //for each child button of btn
          .map((childBtn) => {
            //We create an html element representing this button and give it 'mainPageBtns', and append it to containerDiv. It will have as background, the same image as the background image of btn
            createBtn({
              btn: childBtn,
              btnsContainer: containerDiv,
              btnClass: "mainPageBtns",
              clear: false,
              onClick: () => onClickBtnFunction(childBtn),
            }).style.backgroundImage = backgroundImage;
          });

        createBtn({
          btn: btnMain,
          btnsContainer: containerDiv,
          btnClass: "mainPageBtns",
        }).style.backgroundImage = images[0]; //Finlay, we create and extra html button for btnMain, in order for the user to be able to navigate back to the btnMain menu of buttons
      }
    })();
  },
});

const btnGoBack: Button = new Button({
  btnID: "btnGoBack",
  label: { AR: "السابق", FR: "Retour", EN: "Go Back" },
  onClick: () => {
    scrollToTop(); //scrolling to the top of the page
  },
});

const btnMass: Button = new Button({
  btnID: "btnMass",
  label: { AR: "القداسات", FR: "Messes" },
  onClick: (
    args: { returnBtnChildren?: boolean } = { returnBtnChildren: false }
  ) => {
    btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
    if (args.returnBtnChildren) return btnMass.children;
  },
});

const btnIncenseOffice: Button = new Button({
  btnID: "btnIncenseOffice",
  label: {
    AR: "رفع بخور باكر أو عشية",
    FR: "Office des Encens Aube et Vêpres",
  },
  onClick: (
    args: { returnBtnChildren?: boolean } = { returnBtnChildren: false }
  ) => {
    //setting the children of the btnIncenseOffice. This must be done by the onClick() in order to reset them each time the button is clicked
    btnIncenseOffice.children = [btnIncenseDawn, btnIncenseVespers];
    //show or hide the PropheciesDawn button if we are in the Great Lent or JonahFast:



    //We will remove the Vespers Button during if we are during the Great Lent or the Jonah Fast, and we are not a Saturday
    if (
      (Season === Seasons.GreatLent || Season === Seasons.JonahFast)
      &&
      (todayDate.getDay() !== 6))
        btnIncenseOffice.children = btnIncenseOffice.children.filter(btn => btn !== btnIncenseVespers);
  
    if (args.returnBtnChildren) return btnIncenseOffice.children;
  }
});

const btnIncenseDawn: Button = new Button({
  btnID: "btnIncenseDawn",
  label: {
    AR: "بخور باكر",
    FR: "Encens Aube",
  },
  showPrayers: true,
  languages: [...prayersLanguages],
  docFragment: new DocumentFragment(),
  onClick: (): string[] => {

    btnIncenseDawn.children = [btnReadingsGospelIncenseDawn];

    if (Season === Seasons.GreatLent || Season === Seasons.JonahFast) btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);//We add the prophecies button during the Great Leant and Jonah Fast

    btnIncenseDawn.prayersSequence =
      [...IncensePrayersSequence]
      .filter(title => !title.startsWith(Prefix.incenseVespers)); //We will remove all the Incense Vespers titles from the prayersSequence Array

    if (todayDate.getDay() === 6)
      //If we are a Saturday, we pray only the 'Departed Litany', we will hence remove the 'Sick Litany' and the 'Travellers Litany'
      btnIncenseDawn.prayersSequence.splice(
        btnIncenseDawn.prayersSequence.indexOf(
          Prefix.incenseDawn + "SickPrayer&D=$copticFeasts.AnyDay"),
        3,//We remove the SickPrayer, the TravelersParayer and the Oblations Prayer
        Prefix.incenseVespers + "DepartedPrayer&D=$copticFeasts.AnyDay"
      );
    else if (todayDate.getDay() === 0 || lordFeasts.includes(copticDate))
      //If we are a Sunday or the day is a Lord's Feast, or the oblation is present, we remove the 'Travellers Litany' and keep the 'Sick Litany' and the 'Oblation Litany'
      btnIncenseDawn.prayersSequence =
      btnIncenseDawn.prayersSequence
          .filter(tbl => !tbl[0][0]
            .startsWith(Prefix.incenseDawn + "TravelersPrayer&D=$copticFeasts.AnyDay"));

    scrollToTop();
    return btnIncenseDawn.prayersSequence;
  },
  afterShowPrayers: async (
    btn: Button = btnIncenseDawn,
    gospelPrefix:string = Prefix.gospelDawn,
    gospelArray: string[][][] = ReadingsArrays.GospelDawnArray
  ) => {
    let btnDocFragment = btn.docFragment;
   
    insertCymbalVersesAndDoxologies(btn);

    getGospelReadingAndResponses(
      {
        liturgy: gospelPrefix,
        btn: {
          prayersArray: gospelArray,
          languages: getLanguages(PrayersArraysKeys.find(array => array[0] === gospelPrefix)[1])
      },
        container: btnDocFragment,
        isMass:true,
        clearContainer:false
      }
    );

    (function hideGodHaveMercyOnUsIfBishop() {
      let dataRoot =
        Prefix.commonIncense +
        "PrayThatGodHaveMercyOnUsIfBishop&D=$copticFeasts.AnyDay";

      let godHaveMercyHtml: HTMLDivElement[] = selectElementsByDataRoot(
        btnDocFragment,
        dataRoot.split("IfBishop")[0],
        { startsWith: true }
      ); //We select all the paragraphs not only the paragraph for the Bishop
      godHaveMercyHtml
        .filter(
          (htmlRow) =>
            godHaveMercyHtml.indexOf(htmlRow) > 0 &&
            godHaveMercyHtml.indexOf(htmlRow) !== godHaveMercyHtml.length - 2
        )
        .forEach((htmlRow) => htmlRow.remove());

      let godHaveMercy: string[][] = IncensePrayersArray.find(
        (tbl) => tbl[1] && splitTitle(tbl[1][0])[0] === dataRoot
      ); //We get the whole table not only the second row. Notice that the first row of the table is the row containing the title

      if (!godHaveMercy || godHaveMercy.length < 1)
        return console.log("Didn't find table Gode Have Mercy");

      addExpandablePrayer({
        insertion: godHaveMercyHtml[0].nextElementSibling as HTMLDivElement,
        btnID: "godHaveMercy",
        label: {
          AR: godHaveMercy[1][4], //This is the arabic text of the lable
          FR: godHaveMercy[1][2], //this is the French text of the label
        },
        prayers: [[godHaveMercy[2], godHaveMercy[3]]], //We add only the second and third row, the 1st row is a comment from which we retrieved the text for the title
        languages: btnMassUnBaptised.languages,
      });
    })();

    (async function addGreatLentPrayers() {
      if (btn.btnID !== btnIncenseDawn.btnID) return;
      if (Season !== Seasons.GreatLent && Season !== Seasons.JonahFast) return;
      if (todayDate.getDay() > 0 && todayDate.getDay() < 6) {
        console.log("we are not a sunday");
        //We are neither a Saturday nor a Sunday, we will hence display the Prophecies dawn buton
        (function showPropheciesDawnBtn() {
          if (Season !== Seasons.GreatLent) return;
          //If we are during any day of the week, we will add the Prophecies readings to the children of the button
          if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) < 0)
            btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
        })();
        (async function insertEklonominTaghonata() {
          let efnotiNaynan: HTMLDivElement[] = selectElementsByDataRoot(
            btnDocFragment,
            Prefix.commonPrayer + "EfnotiNaynan&D=$copticFeasts.AnyDay",
            { startsWith: true }
          );

          let insertion = efnotiNaynan[efnotiNaynan.length - 1].nextSibling
            .nextSibling as HTMLElement; //This is the html div after "Kyrie Elison 3 times"
          let godHaveMercy: string[][] = btnIncenseDawn.prayersArray.find(
            (table) =>
              table[0][0].startsWith(
                Prefix.incenseDawn + "GodHaveMercyOnUs&D=$Seasons.GreatLent"
              )
          ); //This will give us all the prayers
          console.log("godHaveMercy =", godHaveMercy);

          insertPrayersAdjacentToExistingElement({
            tables: [godHaveMercy],
            languages: prayersLanguages,
            position: { beforeOrAfter: "beforebegin", el: insertion },
            container: btnDocFragment,
          });

          let refrains = selectElementsByDataRoot(
            btnDocFragment,
            Prefix.incenseDawn + "GodHaveMercyOnUsRefrain&D=$Seasons.GreatLent",
            { equal: true }
          ).filter((htmlRow) => htmlRow.classList.contains("Title"));
          refrains.forEach((htmlRow) => {
            if (refrains.indexOf(htmlRow) > 0) htmlRow.remove();
          });
        })();
      } else {
        if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1)
          btnIncenseDawn.children.splice(
            btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn),
            1
          );
      }
    })();

    (async function addExpandableBtnForAdamDoxolgies() {
      if (btn.btnID !== btnIncenseDawn.btnID) return;
      if (btnDocFragment.children.length === 0) return;

      addExpandablePrayer({
        insertion: btnDocFragment.children[0] as HTMLElement,
        btnID: "AdamDoxologies",
        label: {
          AR: "ذكصولوجيات باكر آدام",
          FR: "Doxologies Adam Aube",
        },
        prayers: DoxologiesPrayersArray.filter((table) =>
          table[0][0].startsWith(Prefix.doxologies + "AdamDawn")
        ),
        languages: btnIncenseDawn.languages,
      })[1];

      //finally we append the newDiv to containerDiv
      //btnIncenseDawn.docFragment.children[1].insertAdjacentElement('beforebegin', doxologiesDiv)
    })();
  },
});

const btnIncenseVespers: Button = new Button({
  btnID: "btnIncenseVespers",
  label: {
    AR: "بخور عشية",
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
      ReadingsArrays.GospelVespersArray);
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
      ...MassPrayersSequences.MassCommonIntro,
      ...MassPrayersSequences.MassStCyril,
      ...[
        Prefix.massCommon +
          "TheHolyBodyAndTheHolyBlodPart3&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "BlockIriniPassi&D=$copticFeasts.AnyDay",
        Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay",
        Prefix.massCommon + "Confession&D=$copticFeasts.AnyDay",
      ],
      ...MassPrayersSequences.Communion,
    ];
    /*     btnsPrayersSequences.splice(btns.indexOf(btnMassStCyril), 1, btnMassStCyril.prayersSequence);
    btnMassStCyril.retrieved = true; */
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
    /*     btnsPrayersSequences.splice(btns.indexOf(btnMassStGregory), 1, btnMassStGregory.prayersSequence);
    btnMassStGregory.retrieved = true;
 */
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
      ...MassPrayersSequences.MassCommonIntro,
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
    let massButtons: Button[] = [
      btnMassStBasil,
      btnMassStGregory,
      btnMassStCyril,
      btnMassStJohn,
    ];
    massButtons.splice(massButtons.indexOf(btn), 1);
    massButtons.splice(massButtons.indexOf(btnMassStJohn), 1);

    let btnDocFragment = btn.docFragment;

    (function insertStBasilSecondReconciliationBtn() {
      if (btn !== btnMassStBasil) return;
      let reconciliation = MassStBasilPrayersArray.find((table) =>
        table[0][0].startsWith(Prefix.massStBasil + "Reconciliation2")
      );
      if (!reconciliation) return console.log("Didn't find reconciliation");
      let htmlBtn = addExpandablePrayer({
        insertion: selectElementsByDataRoot(
          btnDocFragment,
          "Reconciliation&D=$copticFeasts.AnyDay",
          { includes: true }
        )[0].nextElementSibling as HTMLDivElement,
        btnID: "secondStBasilReconciliation",
        label: {
          AR: reconciliation[0][2],
          FR: reconciliation[0][4],
        },
        prayers: [reconciliation],
        languages: btn.languages,
      })[0];
      htmlBtn.addEventListener("click", () => {
        let reconciliation = Array.from(
          containerDiv.querySelectorAll(".Row")
        ) as HTMLDivElement[];
        reconciliation
          .filter(
            (row) =>
              row.dataset.group ===
              Prefix.massStBasil + "Reconciliation&D=$copticFeasts.AnyDay"
          )
          .forEach((row) => {
            row.classList.toggle(hidden);
          });
      });
    })();

    showFractionPrayersMasterButton(
      btn,
      selectElementsByDataRoot(
        btnDocFragment,
        Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay",
        { equal: true }
      )[0],
      { AR: "صلوات القسمة", FR: "Oraisons de la Fraction" },
      "btnFractionPrayers",
      FractionsPrayersArray
    );

    (function addRedirectionButtons() {
      //Adding 2 buttons to redirect the other masses at the begining of the Reconciliation
      redirectToAnotherMass(
        [...massButtons],
        {
          beforeOrAfter: "afterend",
          el: selectElementsByDataRoot(
            btnDocFragment,
            "Reconciliation&D=$copticFeasts.AnyDay",
            { includes: true }
          )[0],
        },
        "RedirectionToReconciliation"
      );

      //Adding 2 buttons to redirect to the other masses at the Anaphora prayer After "By the intercession of the Virgin St. Mary"
      let select = selectElementsByDataRoot(
        btnDocFragment,
        Prefix.massCommon + "SpasmosAdamShort&D=$copticFeasts.AnyDay",
        { endsWith: true }
      );
      redirectToAnotherMass(
        [...massButtons],
        {
          beforeOrAfter: "afterend",
          el: select[select.length - 1],
        },
        "RedirectionToAnaphora"
      );

      //Adding 2 buttons to redirect to the other masses before Agios
      redirectToAnotherMass(
        [...massButtons],
        {
          beforeOrAfter: "afterend",
          el: selectElementsByDataRoot(
            btnDocFragment,
            getMassPrefix(btn.btnID) + "Agios&D=$copticFeasts.AnyDay",
            { equal: true }
          )[0].previousElementSibling as HTMLElement,
        },
        "RedirectionToAgios"
      );

      //Adding 2 buttons to redirect to the other masses before the Call upon the Holy Spirit
      redirectToAnotherMass(
        [...massButtons],
        {
          beforeOrAfter: "afterend",
          el: selectElementsByDataRoot(
            btnDocFragment,
            Prefix.massCommon +
              "AssemblyResponseAmenAmenAmenWeProclaimYourDeath&D=$copticFeasts.AnyDay",
            { equal: true }
          )[0],
        },
        "RedirectionToLitanies"
      );

      //Adding 2 buttons to redirect to the other masses before the Fraction Introduction
      redirectToAnotherMass(
        [...massButtons],
        {
          beforeOrAfter: "beforebegin",
          el: selectElementsByDataRoot(
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

      insertSpasmos(
        spasmosTitle,
        Prefix.massCommon + "DiaconResponseKissEachOther&D="
      );
      //Insert Wates Spasmoses
      insertSpasmos(
        spasmosTitle.replace("Adam", "Wates"),
        Prefix.massCommon + "SpasmosWatesShort",
        true
      );
    })();

    function insertSpasmos(
      spasmosTitle: string,
      anchorTitle: string,
      hideAnchor: boolean = false
    ): HTMLElement | void {
      let spasmos: string[][] = MassCommonPrayersArray.filter(
        (tbl) =>
          tbl[0][0].startsWith(spasmosTitle) &&
          selectFromMultiDatedTitle(splitTitle(tbl[0][0])[0], Season)
      )[0];

      if (!spasmos)
        return console.log("didn't find spasmos with title = ", spasmosTitle);
      let anchor = selectElementsByDataRoot(btnDocFragment, anchorTitle, {
        startsWith: true,
      })[0];
      if (!anchor) console.log("didn't find anchor : ", anchorTitle);

      let createdElements = addExpandablePrayer({
        insertion: anchor,
        btnID: spasmosTitle.split("&D=")[0],
        label: {
          AR: spasmos[0][btn.languages.indexOf(defaultLanguage) + 1],
          FR: spasmos[0][btn.languages.indexOf(foreingLanguage) + 1],
        },
        prayers: [spasmos],
        languages: btn.languages,
      });
      if (hideAnchor)
        createdElements[0].addEventListener("click", () =>
          selectElementsByDataRoot(containerDiv, anchor.dataset.root, {
            equal: true,
          }).forEach((row) => row.classList.toggle(hidden))
        );
    }
    (function insertCommunionChants() {
      //Inserting the Communion Chants after the Psalm 150
      let psalm = selectElementsByDataRoot(
        btnDocFragment,
        Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay",
        { equal: true }
      );

      let filtered: string[][][] = CommunionPrayersArray.filter(
        (tbl) =>
          selectFromMultiDatedTitle(tbl[0][0], copticDate) === true ||
          selectFromMultiDatedTitle(tbl[0][0], Season) === true
      );

      if (filtered.length === 0)
        filtered = CommunionPrayersArray.filter(
          (tbl) =>
            selectFromMultiDatedTitle(tbl[0][0], copticFeasts.AnyDay) === true
        );

      showMultipleChoicePrayersButton({
        filteredPrayers: filtered,
        btn: btn,
        btnLabels: {
          AR: "مدائح التوزيع",
          FR: "Chants de la communion",
        },
        masterBtnID: "communionChants",
        anchor: psalm[psalm.length - 1] as HTMLElement,
      });
    })();

    (function insertLitaniesIntroductionFromOtherMasses() {
      if (btn !== btnMassStBasil) return; //This button appears only in St Basil Mass

      let litaniesIntro = findTableInPrayersArray(
        Prefix.massStGregory + "LitaniesIntroduction",
        MassStGregoryPrayersArray,
        { startsWith: true }) || undefined;

      if (!litaniesIntro) return console.log("Did not find the Litanies Introduction");

      let anchor = selectElementsByDataRoot(
        btnDocFragment,
        Prefix.massCommon + "LitaniesIntroduction&D=$copticFeasts.AnyDay",
        { equal: true }
      )[0];

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

      litaniesIntro = findTableInPrayersArray(
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
    AR: "قداس الموعوظين",
    FR: "Messe des non baptisés",
    EN: "Unbaptised Mass",
  },
  docFragment: new DocumentFragment(),
  showPrayers: true,
  languages: [...prayersLanguages],
  onClick: () => {
    //The prayersArray andprayersSequence must be set when the button is clicked

    btnMassUnBaptised.prayersArray = [...PrayersArray];
    btnMassUnBaptised.prayersSequence = [
      ...MassPrayersSequences.MassUnbaptized,
    ];
    //Adding children buttons to btnMassUnBaptised
    btnMassUnBaptised.children = [...btnDayReadings.children];
    btnMassUnBaptised.children.splice(0, 1);
    btnMassUnBaptised.children.splice(btnMassUnBaptised.children.length - 1, 1);

    //Replacing AllelujaFayBabi according to the day
    (function replaceAllelujahFayBabi() {
      if (
        (Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
        todayDate.getDay() !== 0 &&
        todayDate.getDay() !== 6
      ) {
        //Inserting "Alleluja E Ikhon" before "Allelujah Fay Bibi"
        btnMassUnBaptised.prayersSequence.splice(
          btnMassUnBaptised.prayersSequence.indexOf(
            Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"
          ),
          2,
          Prefix.massCommon + "HallelujahFayBiBiGreatLent&D=$Seasons.GreatLent"
        );
        //Removing "Allelujah Fay Bibi" and "Allelujha Ge Ef Mev'i"
        btnMassUnBaptised.prayersSequence.splice(
          btnMassUnBaptised.prayersSequence.indexOf(
            Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"
          ),
          1
        );
      } else if (
        (isFast && todayDate.getDay() !== 0 && todayDate.getDay() !== 6) ||
        (Season === Seasons.NoSeason &&
          (todayDate.getDay() === 3 || todayDate.getDay() === 5))
      ) {
        //Removing Hellelujah Fay Bibi
        btnMassUnBaptised.prayersSequence.splice(
          btnMassUnBaptised.prayersSequence.indexOf(
            Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"
          ),
          1
        );
        //Remove TayShouray
        btnMassUnBaptised.prayersSequence.splice(
          btnMassUnBaptised.prayersSequence.indexOf(
            Prefix.massCommon + "Tayshoury&D=$copticFeasts.AnyDay"
          ),
          1
        );
      } else {
        //Removing 'Hallelujah Ji Efmefi'
        btnMassUnBaptised.prayersSequence.splice(
          btnMassUnBaptised.prayersSequence.indexOf(
            Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"
          ) + 1,
          1
        );
        //Remove Tishoury
        btnMassUnBaptised.prayersSequence.splice(
          btnMassUnBaptised.prayersSequence.indexOf(
            Prefix.massCommon + "Tishoury&D=$copticFeasts.AnyDay"
          ),
          1
        );
      }
    })();
    scrollToTop();
    return btnMassUnBaptised.prayersSequence;
  },
  afterShowPrayers: () => {
    let btnDocFragment = btnMassUnBaptised.docFragment;

    (function hideGodHaveMercyOnUsIfBishop() {
      let dataRoot =
        Prefix.commonIncense +
        "PrayThatGodHaveMercyOnUsIfBishop&D=$copticFeasts.AnyDay";

      let godHaveMercyHtml: HTMLDivElement[] = selectElementsByDataRoot(
        btnDocFragment,
        dataRoot.split("IfBishop")[0],
        { startsWith: true }
      ); //We select all the paragraphs not only the paragraph for the Bishop

      godHaveMercyHtml
        .filter(
          (htmlRow) =>
            godHaveMercyHtml.indexOf(htmlRow) > 0 &&
            godHaveMercyHtml.indexOf(htmlRow) < godHaveMercyHtml.length - 1
        )
        .forEach((htmlRow) => htmlRow.remove());

      let godHaveMercy: string[][] = IncensePrayersArray.find(
        (tbl) => tbl[1] && splitTitle(tbl[1][0])[0] === dataRoot
      ); //We get the whole table not only the second row. Notice that the first row of the table is the row containing the title

      if (!godHaveMercy)
        return console.log("Didn't find table Gode Have Mercy");

      addExpandablePrayer({
        insertion: godHaveMercyHtml[0].nextElementSibling as HTMLDivElement,
        btnID: "godHaveMercy",
        label: {
          AR: godHaveMercy[1][4], //This is the arabic text of the lable
          FR: godHaveMercy[1][2], //this is the French text of the label
        },
        prayers: [[godHaveMercy[2], godHaveMercy[3]]], //We add only the second and third row, the 1st row is a comment from which we retrieved the text for the title
        languages: btnMassUnBaptised.languages,
      });
    })();

    if (Season === Seasons.GreatLent || Season === Seasons.JonahFast) {
      //Inserting psaume 'His Foundations In the Holy Montains' before the absolution prayers
      insertPrayersAdjacentToExistingElement({
        tables: btnMassUnBaptised.prayersArray.filter(
          (table) =>
            splitTitle(table[0][0])[0] ===
            Prefix.massCommon + "HisFoundationsInTheHolyMountains&D=GreatLent"
        ),
        languages: btnMassUnBaptised.languages,
        position: {
          beforeOrAfter: "beforebegin",
          el: selectElementsByDataRoot(
            btnDocFragment,
            Prefix.massCommon + "AbsolutionForTheFather&D=$copticFeasts.AnyDay",
            { equal: true }
          )[0],
        },
        container: btnDocFragment,
      });
    }
    let readingsAnchor: HTMLElement = selectElementsByDataRoot(
      btnDocFragment,
      Prefix.massCommon + "ReadingsPlaceHolder&D=&D=$copticFeasts.AnyDay",
      { equal: true }
    )[0]; //this is the html element before which we will insert all the readings and responses
    let reading: string[][][];

    (function insertIntercessionsHymns() {
      let seasonalIntercessions =
        MassCommonPrayersArray
          .filter(table =>
            table[0][0].includes('ByTheIntercessionOf')
            &&
            (
              selectFromMultiDatedTitle(table[0][0], copticDate)
              ||selectFromMultiDatedTitle(table[0][0], Season)
            )
        )
      if (seasonalIntercessions.length < 1) return console.log('No Seasonsal Intercession Hymns');
      
      let stMary = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "ByTheIntercessionOfStMary&D=$copticFeasts.AnyDay", { equal: true });

      if (!stMary) return;
      
      insertPrayersAdjacentToExistingElement({
        tables:seasonalIntercessions.reverse(),
        languages: getLanguages(getArrayNameFromArray(MassCommonPrayersArray)),
        position:{
          beforeOrAfter: 'afterend',
          el:stMary[stMary.length-1],
        },
        container:btnDocFragment
      })
    })();

    (function insertStPaulReading() {
      reading = ReadingsArrays.StPaulArray.filter(
        (tbl) =>
          splitTitle(tbl[0][0])[0] ===
          Prefix.stPaul + "&D=" + copticReadingsDate
      );

      reading = reading.map((tbl) => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)

      //adding the  end of the St Paul reading
      if (reading.length === 0) return;

      //Adding the reading end
      reading.push([
        [
          splitTitle(reading[0][0][0])[0] + "&C=ReadingEnd",
          ReadingsIntrosAndEnds.stPaulEnd.AR,
          ReadingsIntrosAndEnds.stPaulEnd.FR,
          ReadingsIntrosAndEnds.stPaulEnd.EN,
        ],
      ]);

      //Inserting the reading intro after the title
      reading[0].splice(1, 0, [
        splitTitle(reading[0][0][0])[0] + "&C=ReadingIntro",
        ReadingsIntrosAndEnds.stPaulIntro.AR,
        ReadingsIntrosAndEnds.stPaulIntro.FR,
        ReadingsIntrosAndEnds.stPaulIntro.EN,
      ]); //We replace the first row in the first table of reading (which is the title of the Praxis, with the introduction table

      insertPrayersAdjacentToExistingElement({
        tables: reading,
        languages: readingsLanguages,
        position: { beforeOrAfter: "beforebegin", el: readingsAnchor },
        container: btnDocFragment,
      });
    })();

    (function insertKatholikon() {
      reading = ReadingsArrays.KatholikonArray.filter(
        (tbl) =>
          splitTitle(tbl[0][0])[0] ===
          Prefix.katholikon + "&D=" + copticReadingsDate
      );

      if (reading.length === 0) return;

      reading = reading.map((tbl) => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)

      //ading the introduction and the end of the Katholikon
      reading.push([
        [
          splitTitle(reading[0][0][0])[0] + "&C=ReadingEnd",
          ReadingsIntrosAndEnds.katholikonEnd.AR,
          ReadingsIntrosAndEnds.katholikonEnd.FR,
          ReadingsIntrosAndEnds.katholikonEnd.EN,
        ],
      ]);

      //Inserting the reading intro after the title
      reading[0].splice(1, 0, [
        splitTitle(reading[0][0][0])[0] + "&C=ReadingIntro",
        ReadingsIntrosAndEnds.katholikonIntro.AR,
        ReadingsIntrosAndEnds.katholikonIntro.FR,
        ReadingsIntrosAndEnds.katholikonIntro.EN,
      ]); //We replace the second row in the table of reading (which is the title of the Katholikon, with the introduction table)

      insertPrayersAdjacentToExistingElement({
        tables: reading,
        languages: readingsLanguages,
        position: { beforeOrAfter: "beforebegin", el: readingsAnchor },
        container: btnDocFragment,
      });
    })();

    (function insertPraxis() {
      reading = ReadingsArrays.PraxisArray.filter(
        (tbl) =>
          splitTitle(tbl[0][0])[0] ===
          Prefix.praxis + "&D=" + copticReadingsDate
      );

      if (reading.length === 0) return;

      reading = reading.map((tbl) => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)

      reading.push([
        [
          splitTitle(reading[0][0][0])[0] + "&C=ReadingEnd",
          ReadingsIntrosAndEnds.praxisEnd.AR,
          ReadingsIntrosAndEnds.praxisEnd.FR,
          ReadingsIntrosAndEnds.praxisEnd.EN,
        ],
      ]);

      //Inserting the reading intro after the title
      reading[0].splice(1, 0, [
        splitTitle(reading[0][0][0])[0] + "&C=ReadingIntro",
        ReadingsIntrosAndEnds.praxisIntro.AR,
        ReadingsIntrosAndEnds.praxisIntro.FR,
        ReadingsIntrosAndEnds.praxisIntro.EN,
      ]); //We replace the first row in the first table of reading (which is the title of the Praxis, with the introduction table

      insertPrayersAdjacentToExistingElement({
        tables: reading,
        languages: readingsLanguages,
        position: { beforeOrAfter: "beforebegin", el: readingsAnchor },
        container: btnDocFragment,
      });

      (function insertPraxisResponse() {
        let praxis: HTMLElement[] = selectElementsByDataRoot(
          btnDocFragment,
          Prefix.praxis + "&D=",
          { startsWith: true }
        ); //This is the praxis reading

        if (praxis.length === 0) return console.log('Did not find the praxis');

        let annualResponse: HTMLElement[]; //This is the praxis response for any ordinary day (it is included by default)

        (function moveAnnualResponseBeforePraxis() {
          //Moving the annual response
          annualResponse = selectElementsByDataRoot(
            btnDocFragment,
            Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay",
            { equal: true }
          );

          if (!annualResponse || annualResponse.length === 0)
            return console.log("error: annual = ", annualResponse);

          annualResponse.forEach((htmlRow) =>
            praxis[0].insertAdjacentElement("beforebegin", htmlRow)
          );
        })();

        let response: string[][][] =
          PraxisResponsesPrayersArray
          .filter(table =>
            selectFromMultiDatedTitle(table[0][0], copticDate)
            ||
            selectFromMultiDatedTitle(table[0][0], Season)
        );

        if (!response || response.length === 0) return console.log('Did not find any specific praxis response');

        (function insertSpecialResponse() {
          if (Season === Seasons.GreatLent) {
            //If a Praxis response was found
            // The query should yield to  2 tables ('Sundays', and 'Week') for this season. We will keep the relevant one accoding to the date
            if (todayDate.getDay() === 0 || todayDate.getDay() === 6)
              response = [
                response.find((table) => table[0][0].includes("Sundays&D=")),
              ];
            else
              response = [
                response.find((table) => table[0][0].includes("Week&D=")),
              ];
          }
        })();

        
          //We insert the special response between the first and 2nd rows
          insertPrayersAdjacentToExistingElement({
            tables: response,
            languages: prayersLanguages,
            position: {
              beforeOrAfter: "beforebegin",
              el: annualResponse[2] //This is the 'Ek Esmaroot' part of the annual response
            },
            container: btnDocFragment,
          });

            //We remove the annual response title row
            annualResponse[0].remove();
            annualResponse[1].remove();
       
          /*
           !We need to check whether the 'Sheri Ni Maria' part should be kept or not. if so we will reinstate the code below
          
          //We remove the first row of the Annual response which is  'Sheri ni Maria' after the title of the specific response
          annualResponse[1].nextElementSibling.insertAdjacentElement('afterend', annualResponse[1]) */
        
      })();
    })();

    (function insertSynaxarium() {
      reading = ReadingsArrays.SynaxariumArray.filter(
        (table) =>
          splitTitle(table[0][0])[0] === Prefix.synaxarium + "&D=" + copticDate
      );

      if (reading.length === 0) return;

      reading = reading.map((tbl) => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)

      reading[0].splice(1, 0, [
        splitTitle(reading[0][0][0])[0] + "&C=ReadingIntro",
        ReadingsIntrosAndEnds.synaxariumIntro.FR.replace(
          "theday",
          Number(copticDay).toString()
        ).replace("themonth", copticMonths[Number(copticMonth)].FR),

        ReadingsIntrosAndEnds.synaxariumIntro.AR.replace(
          "theday",
          Number(copticDay).toString()
        ).replace("themonth", copticMonths[Number(copticMonth)].AR),

        ReadingsIntrosAndEnds.synaxariumIntro.EN.replace(
          "theday",
          Number(copticDay).toString()
        ).replace("themonth", copticMonths[Number(copticMonth)].EN),
      ]);

      reading[0].splice(0, 1, [
        splitTitle(reading[0][0][0])[0] + "&C=Title",
        "Synixaire" +
          "\n" +
          Number(copticDay).toString() +
          " " +
          copticMonths[Number(copticMonth)].FR,
        "السنكسار" +
          "\n" +
          Number(copticDay).toString() +
          " " +
          copticMonths[Number(copticMonth)].AR,
      ]);

      let praxisElements: HTMLElement[] = selectElementsByDataRoot(
        btnDocFragment,
        Prefix.praxis + "&D=",
        { startsWith: true }
      );

      if (praxisElements.length === 0) return;
      let anchor: { beforeOrAfter: InsertPosition; el: HTMLElement } = {
        beforeOrAfter: "beforebegin",
        el: praxisElements[praxisElements.length - 1]
          .nextElementSibling as HTMLElement,
      };
      let titleBase: string;
      reading.forEach((table) => {
        titleBase = splitTitle(table[0][0])[0];
        table.map((row) => {
          if (!row[0].startsWith(Prefix.same)) titleBase = row[0];
          return createHtmlElementForPrayer({
            tblRow: row,
            titleBase: titleBase,
            languagesArray: ["FR", "AR"],
            position: anchor,
          });
        });
      });
    })();

    (function insertPentecostalHymns() {
      if (Season !== Seasons.PentecostalDays) return;
      let hymns: string[][][] = PrayersArray.filter((table) =>
        table[0][0].startsWith("PentecostalHymns&D=$Seasons.PentecostalDays")
      );
      if (hymns.length > 0) {
        insertPrayersAdjacentToExistingElement({
          tables: hymns,
          languages: prayersLanguages,
          position: {
            beforeOrAfter: "beforebegin",
            el: readingsAnchor,
          },
          container: btnDocFragment,
        });
      }
    })();

    (function insertGospelReading() {
      getGospelReadingAndResponses(
        {
          liturgy: Prefix.gospelMass,
          btn: {
            prayersArray: ReadingsArrays.GospelMassArray,
            languages: getLanguages(PrayersArraysKeys.find(array => array[0] === Prefix.gospelMass)[1])
        },
          container: btnDocFragment,
          isMass: true,
          clearContainer: false
        }
      );
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
        return;

      let hoursBtns: Button[] = btnBookOfHours.onClick(true); //We get buttons for the relevant hours according to the day
      if (!hoursBtns) return;

      hoursBtns = selectRelevantHoursAccordingToTheDay();

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
          ![0, 6].includes(todayDate.getDay())
          //We are during the Great Lent or during the Nativity Paramoun or the Baptism Paramoun and today is a Friday. In such cases, we pray the 3rd, 6th, 9th, 11th, and 12th hours
        )
          hours.push(hoursBtns[4], hoursBtns[5]);
        else if (
          //We remove the 9th hour in the following days
          [0, 6].includes(todayDate.getDay()) || //Whatever the period, if we are a Saturday or a Sunday, we pray only the 3rd and 6th Hours
          lordFeasts.includes(copticDate) || //This is a Lord Feast. We remove the 9th hour
          [
            Seasons.Nativity,
            Seasons.Baptism,
            Seasons.PentecostalDays,
            Seasons.Nayrouz,
            Seasons.CrossFeast,
          ].includes(Season) || //These are joyfull seasons
          (!isFast && ![3, 5].includes(todayDate.getDay())) //We are not during a feast or joyfull season, but we are not neither a Wednesday nor a Firday
        )
          hours.pop(); //we remove the 9th hour

        return hours;
      }

      let masterBtnDiv = document.createElement("div"); //This is the div that will contain the master button which shows or hides the Book of Hours sub buttons
      masterBtnDiv.classList.add(inlineBtnsContainerClass);
      masterBtnDiv.id = "masterBOHBtn";

      let btnsDiv: HTMLDivElement = document.createElement("div"); //This is the div that contains the sub buttons for each Hour of the Book of Hours
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

      //We will create a button and an expandable div for each hour
      hoursBtns
        .reverse() //We reverse the buttons in order to get them arranged in the order from right to left (i.e: 3rdHour, 6thHour, etc.)
        .forEach(async (btn) => {
          btn.onClick(true); //We call the onClick() method of the btn in order to build its prayersSequence and prayersArray properties. Notice that we passs

          InsertHourFinalPrayers(btn); //Inserting Kyrielison 41 times, Agios, Holy God of Sabaot, etc.

          if (localStorage.displayMode === displayModes[1])
            //If we are in the 'Presentation Mode', we remove all the psalms and keep only the Gospel and the Litanies
            btn.prayersSequence
              .filter((title) => title.includes("Psalm"))
              .forEach((title) =>
                btn.prayersSequence.splice(
                  btn.prayersSequence.indexOf(title),
                  1
                )
              );

          let btnPrayers: string[][][] =
            btn.prayersSequence
              .map(title =>
              findTableInPrayersArray(
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

          addOnClickToHourBtn(createdElements[0]); //This is the button that will show or hid each hour's button

          btnsDiv.appendChild(createdElements[0]); //We add all the buttons to the same div instead of 3 divs;

          collapseAllTitles(
            Array.from(createdElements[1].children) as HTMLDivElement[]
          ); //We collapse all the titles
        });

      function addOnClickToHourBtn(hourBtn: HTMLElement) {
        hourBtn.addEventListener("click", async () => {
          Array.from(containerDiv.children)
            .filter((div) => div.id.endsWith("Expandable"))
            .forEach((expandableDiv: HTMLDivElement) => {
              if (
                !expandableDiv.id.startsWith(hourBtn.id) &&
                !expandableDiv.classList.contains(hidden)
              ) {
                //This is the container of another hour than the hour linked to the button (btn), we hidde any such container in ordr to keep only the prayers of the button's hour
                expandableDiv.classList.add(hidden);
                collapseAllTitles(
                  Array.from(expandableDiv.children) as HTMLDivElement[]
                );
                hideOrShowAllTitlesInAContainer(expandableDiv, true);
              } else if (expandableDiv.id.startsWith(hourBtn.id)) {
                //this is the container of the prayers related to the button
                if (!expandableDiv.classList.contains(hidden)) {
                  makeExpandableButtonContainerFloatOnTop(btnsDiv, "5px");
                  masterBtnDiv.classList.add(hidden);
                  createFakeAnchor(expandableDiv.id);
                } else {
                  btnsDiv.style.top = "";
                  btnsDiv.style.position = "";
                  masterBtnDiv.classList.remove(hidden);
                  createFakeAnchor(btnsDiv.id);
                }
              }
            });
        });
      }

      btnDocFragment.prepend(btnsDiv);
      btnDocFragment.prepend(masterBtnDiv);
      btnsDiv.style.display = "grid";
      btnsDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(
        btnsDiv,
        3
      );

      function InsertHourFinalPrayers(hourBtn: Button) {
        let Agios: string =
            Prefix.commonPrayer + "HolyGodHolyPowerfull&D=$copticFeasts.AnyDay",
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

        //!CAUTION, the order of the buttons in hourBtn is reversed (eg.: [9th, 6th, 3rd] instead of [3rd, 6th, 9th])

        let sequence: string[];

        if (hoursBtns.indexOf(hourBtn) === 0) {
          sequence = [
            WeExaltYou,
            Creed,
            KyrielisonMassIntro,
            Kyrielison41Times,
            HolyLordOfSabaot,
            OurFatherWhoArtInHeaven,
          ];
        } else if (hoursBtns.indexOf(hourBtn) === 1) {
          //this is the before last
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
          //Collapsing all the Titles
      collapseAllTitles(
        Array.from(btnDocFragment.children) as HTMLDivElement[]);
      btnDocFragment.getElementById("masterBOHBtn").classList.toggle(hidden); //We remove hidden from btnsDiv
  },
});

const btnMassBaptised: Button = new Button({
  btnID: "btnMassBaptised",
  label: {
    AR: "قداس المؤمنين",
    FR: "Messe des Croyants",
    EN: "Baptized Mass",
  },
  parentBtn: btnMass,
  children: [btnMassStBasil, btnMassStCyril, btnMassStGregory, btnMassStJohn],
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
    btnReadingsGospelIncenseDawn.onClick(
      Prefix.gospelVespers,
      ReadingsArrays.GospelVespersArray)
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
  onClick: (
    gospelPrefix: string = Prefix.gospelDawn,
    gospelArray: string[][][] = ReadingsArrays.GospelDawnArray) => {
    containerDiv.innerHTML = '';
  getGospelReadingAndResponses(
   {
      liturgy: gospelPrefix,
      btn:
      {
      prayersArray: gospelArray,
      languages: getLanguages(PrayersArraysKeys.find(array=>array[0]===gospelPrefix)[1])
      },
      container:containerDiv,
      isMass:false,
      clearContainer:true
    })
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
    btnReadingsGospelIncenseDawn.onClick(
      Prefix.gospelNight,
      ReadingsArrays.GospelNightArray)
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
    fetchMassReadingOtherThanGospel(Prefix.propheciesDawn, ReadingsArrays.PropheciesDawnArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true)
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
  onClick: (
    args: { returnBtnChildren?: boolean } = { returnBtnChildren: false }
  ) => {

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
        onClick: () => {
          fetchMassReadingOtherThanGospel(Prefix.stPaul, ReadingsArrays.StPaulArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true)
  
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
        onClick: () => {
          fetchMassReadingOtherThanGospel(Prefix.katholikon, ReadingsArrays.KatholikonArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true)
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
        onClick: () => {
          fetchMassReadingOtherThanGospel(Prefix.praxis, ReadingsArrays.PraxisArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true)
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
        onClick: function (this: Button) {
          fetchMassReadingOtherThanGospel(Prefix.synaxarium, ReadingsArrays.SynaxariumArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true, copticDate) //!CAUTION: notice that we passed to the function the readingDate argument because during the GreatLent period and the Jonah Fast, the copticReadingsDate is formatted like 'GL10', we hence pass the copticDate to prevent the function from searching for the Synaxarium of the day by the copticReadingsDate
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
  
        onClick: () => {
          btnReadingsGospelIncenseDawn.onClick(
            Prefix.gospelMass,
            ReadingsArrays.GospelMassArray)
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

    (function addGreatLentButtons() {
      if (Season !==Seasons.GreatLent || copticReadingsDate === copticFeasts.Resurrection) return;

      (function ifWeAreNotASaturday() {
        if (todayDate.getDay() === 6) return;

        //We remove the Vespers because there are no Vespers during the Great Lent except for Saturday
        btnDayReadings.children = btnDayReadings.children.filter(btn => btn !== btnIncenseVespers);

        //If we are a Sunday and the GospelNight button is not included, we will add it.
      
      if (todayDate.getDay() === 0
        && !btnDayReadings.children.includes(btnReadingsGospelNight))
        btnDayReadings.children.push(btnReadingsGospelNight);
      

        (function ifWeAreNotASunday() {
          if (todayDate.getDay() === 0) return;

          //If we are not a Sunday (i.e., we are during any week day other than Sunday and Saturday), we will  add the Prophecies button to the list of buttons
          if (!btnDayReadings.children.includes(btnReadingsPropheciesDawn))
            btnDayReadings.children.unshift(btnReadingsPropheciesDawn);


          //Also if we  are not a Sunday, we will remove the Night Gospel, if included
          btnDayReadings.children = btnDayReadings.children.filter(btn => btn !== btnReadingsGospelNight);
        })();
        
        
      })();

    })();

    if(Season === Seasons.PentecostalDays) btnDayReadings.children.filter(btn=>btn.btnID !=='btnReadingsSynaxarium');//The Synaxarium is not read during the Pentecostal period
    
    if (args.returnBtnChildren) return btnDayReadings.children;
  },
});


const btnBookOfHours: Button = new Button({
  btnID: "btnBookOfHours",
  label: { AR: "الأجبية", FR: "Agpia", EN: "Book of Hours" },
  docFragment: new DocumentFragment(),
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
        Prefix.commonPrayer + "HolyGodHolyPowerfull&D=$copticFeasts.AnyDay",
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
      Object.entries(bookOfHours).forEach((entry) => {
        let hourName = entry[0];
        let hourBtn = new Button({
          btnID: "btn" + hourName,
          label: entry[1][2],
          languages: btnBookOfHours.languages,
          showPrayers: true,
          prayersArray: [...entry[1][0]],
          onClick: (isMass: boolean = false) =>
            hourBtnOnClick(hourBtn, hourName, isMass),
          afterShowPrayers: () =>
            Array.from(
              containerDiv.querySelectorAll(
                ".Row"
              ) as NodeListOf<HTMLDivElement>
            ).forEach((htmlRow) => {
              htmlRow.classList.replace("Priest", "NoActor");
              htmlRow.classList.replace("Diacon", "NoActor");
              htmlRow.classList.replace("Assembly", "NoActor");
            }),
        });
        btnBookOfHours.children.push(hourBtn);
      });

      //Adding the onClick() property to the button
      function hourBtnOnClick(btn: Button, hourName: string, isMass: boolean) {
        (function buildBtnPrayersSequence() {
          let titleTemplate = Prefix.bookOfHours + "&D=$copticFeasts.AnyDay";
          //We will add the prayers sequence to btn.prayersSequence[]
          btn.prayersSequence = Object.entries(bookOfHours)
            .find((entry) => entry[0] === hourName)[1][1]
            .map((title) =>
              titleTemplate.replace("&D=", "Psalm" + title.toString() + "&D=")
            );

          ["Gospel", "Litanies", "EndOfHourPrayer"].forEach((title) =>
            btn.prayersSequence.push(
              titleTemplate.replace("&D=", hourName + title + "&D=")
            )
          );

          btn.prayersSequence.unshift(
            titleTemplate.replace("&D=", hourName + "Title" + "&D=")
          ); //This is the title of the hour prayer

          (function addFinalPrayersToSequence() {
            if (isMass) return; //!Important: If the onClick() method is called when the button is displayed in the Unbaptised Mass, we do not add anything else to the btn's prayersSequence

            //Then, we add the End of all Hours' prayers (ارحمنا يا الله ثم ارحمنا)
            btn.prayersSequence.push(AllHoursFinalPrayer);

            let HourIntro: string[] = [
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
              ];

            btn.prayersSequence.splice(1, 0, ...HourIntro); //We also add the titles of the HourIntro before the 1st element of btn.prayersSequence[]

            if (!btn.prayersArray || btn.prayersArray.length < 1) return;

            if (
              btn.prayersArray[0][0][0] !== bookOfHours.FirstHour[0][0][0][0] &&
              btn.prayersArray[0][0][0] !== bookOfHours.TwelvethHour[0][0][0][0]
            ) {
              //If its is not the 1st Hour (Dawn) or the 12th Hour (Night), we insert only Kyrielison 41 times, and "Holy Lord of Sabaot" and "Our Father Who Art In Heavean"
              btn.prayersSequence.splice(
                btn.prayersSequence.length - 2,
                0,
                KyrielisonIntro,
                Kyrielison41Times,
                HolyLordOfSabaot,
                OurFatherWhoArtInHeaven
              );
            }

            if (
              btn.prayersArray[0][0][0] === bookOfHours.FirstHour[0][0][0][0]
            ) {
              //If it is the 1st hour (Dawn) prayer:
              //We add the psalms borrowed from the 6ths and 9th hour: Psalms 66, 69, 122 etc.), before pasalm 142
              let DawnPsalms = [62, 66, 69, 112];
              let psalm142 = btn.prayersSequence.indexOf(
                Prefix.bookOfHours + "Psalm142&D=$copticFeasts.AnyDay"
              );

              DawnPsalms.reverse().forEach((title) =>
                btn.prayersSequence.splice(
                  psalm142,
                  0,
                  titleTemplate.replace(
                    "&D=",
                    "Psalm" + title.toString() + "&D="
                  )
                )
              );

              btn.prayersSequence.splice(
                btn.prayersSequence.length - 2,
                0,
                ...endOfHourPrayersSequence
              );
            }

            if (
              btn.prayersArray[0][0][0] === bookOfHours.TwelvethHour[0][0][0][0]
            )
              //It is the 12th (Night) Hour
              btn.prayersSequence.splice(
                btn.prayersSequence.length - 2,
                0,
                ...[...endOfHourPrayersSequence].splice(0, 1)
              ); //we remove the Angels Prayer from endOfHourPrayersSequence
          })();
        })();
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
 * Fetchs and displaying any readings other than the Gospel and the Psalm
 * @param {string} readingPrefix 
 * @param {string[][][]} readingArray - The array where the reading's texts are to be found
 * @param {HTMLElement} container - The container where the text will be displayed after fetched
 * @param {boolean} clearContainer - specifies whether the container should be cleared or not before the reading is displayed
 * @returns 
 */
function fetchMassReadingOtherThanGospel(readingPrefix:string, readingArray: string[][][], position:{beforeOrAfter:InsertPosition, el: HTMLElement}, container: HTMLElement = containerDiv, clearContainer:boolean = false, readingDate?:string) {
  if (clearContainer) container.innerHTML = '';
  if (container.children.length === 0) container.appendChild(document.createElement('div'));
  if (!position.el) position.el = container.children[0] as HTMLElement;
  if (!position.beforeOrAfter) position.beforeOrAfter = 'beforebegin';
  if (!readingDate) readingDate = copticReadingsDate;
  let reading =
    readingArray
      .find(table => table[0][0].includes('&D=' + readingDate));
  if (!reading) return console.log('Did not find a reading for the current copticReadingsDate');
    insertPrayersAdjacentToExistingElement(
    {
      tables: [reading],
      languages: getLanguages(PrayersArraysKeys.find(array => array[0] === readingPrefix)[1]),
      position:position,
      container: containerDiv
      }
  )
  
}

/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayersSequence(liturgy: string, isMass:boolean): string[] {
  //this function sets the date or the season for the Psalm response and the gospel response
  const prayersSequence: string[] = [
    Prefix.psalmResponse + '&D=$copticFeasts.AnyDay',//This is its default value
    liturgy + "Psalm&D=",
    liturgy + "Gospel&D=",
    Prefix.gospelResponse + '&D=$copticFeasts.AnyDay',//This is its default value
  ]; //This is the generic sequence for the prayers related to the lecture of the gospel at any liturgy (mass, incense office, etc.). The OnClick function triggered by the liturgy, adds the dates of the readings and of the psalm and gospel responses
  
  if (!isMass) return prayersSequence; //If we are not calling the function within a mass liturgy, we will not need to set the Psalm and Gospel Responses, we will return the prayersSequence array

  //setting the psalm and gospel responses
  (function setPsalmAndGospelResponses() {
    if (Number(copticDay) === 29 && [4, 5, 6].includes(Number(copticMonth))) return;  //we are on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast), and Touba and Amshir (they are excluded because they precede the annonciation)
    
    let PsalmAndGospelResponses =
      PsalmAndGospelPrayersArray
        .filter(table =>
          selectFromMultiDatedTitle(table[0][0], copticDate)
          ||
          selectFromMultiDatedTitle(table[0][0], Season)
        );

    let psalmResponse =
      PsalmAndGospelResponses
        .filter(table => table[0][0].startsWith(Prefix.psalmResponse));
    let gospelResponse =
      PsalmAndGospelResponses
        .filter(table => table[0][0].startsWith(Prefix.gospelResponse));

    if (Season === Seasons.StMaryFast) {
      //we are during the Saint Mary Fast. There are diffrent gospel responses for Incense Dawn & Vespers
      todayDate.getHours() < 15?
        gospelResponse = [gospelResponse.find(table => table[0][0].includes('Dawn&D='))]
      :
        gospelResponse = [gospelResponse.find(table => table[0][0].includes('Vespers&D='))];
    } else if (
      [copticFeasts.EndOfGreatLentFriday, copticFeasts.LazarusSaturday].includes(copticReadingsDate)
      &&
      todayDate.getHours() > 15){
      gospelResponse = [gospelResponse.find(table => table[0][0].includes('Vespers&D='))]
    } else if (Season === Seasons.GreatLent) {
      [0,6].includes(todayDate.getDay()) ?
        gospelResponse =[gospelResponse.find(table => table[0][0].includes('Sundays&D='))]
      :
        gospelResponse = gospelResponse =[gospelResponse.find(table => table[0][0].includes('Week&D='))]  
    } else if (Season === Seasons.JonahFast) {
      gospelResponse = [gospelResponse.find(table => table[0][0].includes(copticReadingsDate.split(Season)[1] + "&D="))]

    }
    
      if(psalmResponse.length>0 && psalmResponse[0].length>0) prayersSequence[0] = splitTitle(psalmResponse[0][0][0])[0];
      if (gospelResponse.length>0 && gospelResponse[0].length>0) prayersSequence[3] = splitTitle(gospelResponse[0][0][0])[0];
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
  isMass: boolean,
  liturgy: string,
  btn: Button | { prayersArray: string[][][]; languages?: string[] },
  container?: HTMLElement | DocumentFragment,
  gospelInsertionPoint?: HTMLElement,
  clearContainer?:boolean
}
) {
  if (!args.container) args.container = containerDiv;
  if(args.container === containerDiv && args.clearContainer) args.container.innerHTML= '';
  if (args.container.children.length === 0) args.container.appendChild(document.createElement('div'));
  if (!args.btn.prayersArray)
    return console.log(
      "the button passed as argument does not have prayersArray"
    );
  
  if (!args.btn.languages) args.btn.languages = getLanguages(getArrayNameFromArray(args.btn.prayersArray));

  if (!args.gospelInsertionPoint)
    args.gospelInsertionPoint = selectElementsByDataRoot(
      args.container,
      Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay",
      { equal: true }
    )[0];

  //We start by inserting the standard Gospel Litany
  (function insertGospelLitany() {
    if(!args.isMass) return
     let gospelLitanySequence = [
      Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay",
      Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay",
    ]; //This is the sequence of the Gospel Prayer/Litany for any liturgy

    let gospelLitanyPrayers =
      gospelLitanySequence
        .map(title =>
      findTableInPrayersArray(title, CommonPrayersArray)) as string[][][];

    if (!gospelLitanyPrayers || gospelLitanyPrayers.length === 0) return console.log('could not find the gospel litany');

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

  if (args.isMass && new Map(JSON.parse(localStorage.showActors)).get("Diacon") === false)
    return alert("Diacon Prayers are set to hidden, we cannot show the gospel"); //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers

  let anchorDataRoot =
    Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay";

  let gospelIntroduction =
    selectElementsByDataRoot(args.container, anchorDataRoot, { equal: true});

  if (args.isMass && gospelIntroduction.length === 0)
    return console.log("gospelIntroduction.length = 0 ", gospelIntroduction);

  let prayersSequence: string[] = setGospelPrayersSequence(args.liturgy, args.isMass); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']

  //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
  let date = copticReadingsDate;
  if (args.liturgy === Prefix.gospelVespers) {
    date = getTomorowCopticReadingDate();
    console.log(date);
  }
  

  let gospel: string[][][] =
    args.btn.prayersArray
      .filter(table =>
        splitTitle(table[0][0])[0] === prayersSequence[1] + date
        || //this is the pasalm text
      splitTitle(table[0][0])[0] === prayersSequence[2] + date //this is the gospel itself
  ); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####". We should get a string[][][] of 2 elements: a table for the Psalm, and a table for the Gospel

  if (gospel.length === 0) return console.log("gospel.length = 0"); //if no readings are returned from the filtering process, then we end the function

  /**
   * Appends the gospel and psalm readings before gospelInsertionPoint(which is an html element)
   */
  (function insertPsalmAndGospel() {
    if (!args.isMass) {
      containerDiv.append(document.createElement('div'));
      args.gospelInsertionPoint = containerDiv.children[0] as HTMLDivElement
    };
    gospel
      .forEach(table => {
      let el: HTMLElement; //this is the element before which we will insert the Psaml or the Gospel
      if (!args.isMass || splitTitle(table[0][0])[0].includes("Gospel&D="))
        //This is the Gospel itself, we insert it before the gospel response
        el = args.gospelInsertionPoint;
      else if (splitTitle(table[0][0])[0].includes("Psalm&D="))
        el = gospelIntroduction[gospelIntroduction.length - 1];

      if (!el) return;
      insertPrayersAdjacentToExistingElement({
        tables: [table],
        languages: args.btn.languages,
        position: {
          beforeOrAfter: "beforebegin",
          el: el,
        },
        container: args.container,
      });
    });
  })();

  (function insertPsalmAndGospelResponses() {
    if (!args.isMass) return;
    //Inserting the gospel response
    insertResponse(3, args.gospelInsertionPoint);

    //We remove the insertion point placeholder
    args.gospelInsertionPoint.remove();

    let gospelPrayer =
      selectElementsByDataRoot(args.container, Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay", { equal: true }); //This is the 'Gospel Litany'. We will insert the Psalm response after its end

    if (!gospelPrayer) return;

    insertResponse(0, gospelPrayer[gospelPrayer.length - 1].previousElementSibling as HTMLElement);//Inserting Psalm Response if any

    function insertResponse(
      index: number,
      insertion: HTMLElement
    ) {
      let response: string[][] =
        PsalmAndGospelPrayersArray
          .find(tbl =>
            tbl[0][0].startsWith(prayersSequence[index])); //we filter the PsalmAndGospelPrayersArray to get the relevant table
  
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

  function getTomorowCopticReadingDate(): string {
    let today: Date = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).

    return getSeasonAndCopticReadingsDate(
      convertGregorianDateToCopticDate(today.getTime(), false)[1],
      today
    ) as string;
  }

}

/**
 * Filters the FractionsPrayersArray and Insert a button (a "Master Button") in the specified place (i.e. the anchor). This button when clicked, opens a panel displaying buttons. Each button represents a Fraction. User choises a prayer by clicking on the button.
 * @param {Button} - btn
 * @param {HTMLElement} anchor - the html element after which the "Master Button" will be inserted
 * @param {typeBtnLabel} lable - the lable of the "Master Button"
 * @param {string} masterBtnID - the id that will be given to the html element created for the "Master Button"
 * @param {string[][][]} prayersArray - the array that will be filtered in order to retrieve the prayers that will be displayed by the buttons
 */
function showFractionPrayersMasterButton(
  btn: Button,
  anchor: HTMLElement,
  label: typeBtnLabel,
  masterBtnID: string,
  prayersArray: string[][][]
) {
  let filtered: Set<string[][]> = new Set();

  if (Number(copticDay) === 29 && Number(copticMonth) !== 4)
    filterPrayersArray(copticFeasts.Coptic29th, prayersArray, filtered); //We start by adding the fraction of the 29th of each coptic month if we are on the 29th of the month
  //console.log('filteredSet = ', filtered)

  filterPrayersArray(copticDate, prayersArray, filtered); //we then add the fractions (if any) having the same date as the current copticDate

  filterPrayersArray(Season, prayersArray, filtered); //We then add the fractions (if any) having a date = to the current Season

  filterPrayersArray(copticFeasts.AnyDay, prayersArray, filtered); //We finally add the fractions having as date copticFeasts.AnyDay

  function filterPrayersArray(
    date: string,
    prayersArray: string[][][],
    filtered: Set<string[][]>
  ) {
    prayersArray.map((table) => {
      if (
        selectFromMultiDatedTitle(table[0][0], date) === true &&
        !filtered.has(table)
      )
        filtered.add(table);
    });
  }
  showMultipleChoicePrayersButton({
    filteredPrayers: Array.from(filtered),
    btn: btn,
    btnLabels: label,
    masterBtnID: masterBtnID,
    anchor: anchor,
  });
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
  if (!tableTitle.includes("&D=")) return false;

  tableTitle = splitTitle(tableTitle)[0].split("&D=")[1];

  let dates = tableTitle.split("||");
  let parseDate =
    dates
      .map(date => {
        if (date === "$Seasons.Kiahk")
          return [Seasons.KiahkWeek1, Seasons.KiahkWeek2, Seasons.KiahkWeek3, Seasons.KiahkWeek4,
          ].includes(Season);

        if (date.startsWith("$")) date = eval(date.split('$')[1]);

        if (date && date === coptDate) return true;
        else return false;
  });

  if (parseDate.includes(true)) return true;
  else return false;
}

/**
 * Inserts the Incense Office Doxologies And Cymbal Verses according to the Coptic feast or season
 * @param {HTMLElement | DocumentFragment} container - The HtmlElement in which the btn prayers are displayed and to which they are appended
 */
async function insertCymbalVersesAndDoxologies(btn: Button) {
  if (!btn.docFragment)
    return console.log("btn.docFragment is undefined = ", btn.docFragment);

  (async function InsertCymbalVerses() {
    let cymbalsPlaceHolder: HTMLElement = selectElementsByDataRoot(
      btn.docFragment,
      Prefix.commonIncense + "CymbalVersesPlaceHolder&D=$copticFeasts.AnyDay",
      { equal: true }
    )[0];
    if (!cymbalsPlaceHolder)
      return console.log("Didn't find cymbalsPlaceHolder");

    if (!cymbalsPlaceHolder)
      return console.log("We didn't find the cymbal verses placeholder");

    let sequence = [
      Prefix.cymbalVerses + "Wates&D=$copticFeasts.AnyDay",
      Prefix.cymbalVerses + "&D=$copticFeasts.AnyDay",
    ];

    if (todayDate.getDay() > 2)
      sequence[0] = sequence[0].replace("Wates&D", "Adam&D");

    let feast: [string, string];

    feast = Object.entries(copticFeasts).find(
      (entry) => entry[1] === copticDate
    ); //We check if today is a feast

    if (!feast)
      feast = Object.entries(copticFeasts).find(
        (entry) => entry[1] === copticReadingsDate
      ); //We also check by the copticReadingsDate because some feast are referrenced by the copticReadings date : eg. Pntl39

    if (!feast)
      feast = Object.entries(Seasons).find((entry) => entry[1] === Season);
    if (feast) insertFeastInSequence(sequence, feast[1], 1);

    let cymbals: string[][][] = [];
    let cymbalTable: string[][];

    sequence.map((cymbalsTitle) => {
      if (cymbalsTitle.startsWith("&Insert="))
        //i.e., if this is the placeholder element that we inserted for the current feast or Season
        cymbalTable = CymbalVersesPrayersArray.find((tbl) =>
          selectFromMultiDatedTitle(
            tbl[0][0],
            cymbalsTitle.split("&Insert=")[1]
          )
        );
      else
        cymbalTable = findTableInPrayersArray(
          cymbalsTitle,
          CymbalVersesPrayersArray,
          { equal: true }
        ) as string[][];

      if (cymbalTable) cymbals.push(cymbalTable);
    });
    if (cymbals.length < 1) return console.log("cymbals= ", cymbals);

    insertPrayersAdjacentToExistingElement({
      tables: cymbals,
      languages: btn.languages,
      position: {
        beforeOrAfter: "beforebegin",
        el: cymbalsPlaceHolder.nextElementSibling as HTMLElement,
      },
      container: btn.docFragment,
    });
  })();

  (async function InsertCommonDoxologies() {
    let doxologiesPlaceHolder: HTMLElement = selectElementsByDataRoot(
      btn.docFragment,
      Prefix.commonIncense + "DoxologiesPlaceHolder&D=$copticFeasts.AnyDay",
      { equal: true }
    )[0];

    if (!doxologiesPlaceHolder)
      return console.log("Didn't find doxologiesPlaceholder");

    if (!doxologiesPlaceHolder) return;

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

    if (btn.btnID === btnIncenseVespers.btnID)
      sequence[0] = sequence[0].replace("Dawn", "Vespers");

    let feast: [string, string];
    //if the copticDate is a feast

    let excludeFeast = [
      saintsFeasts.StMaykel,
      saintsFeasts.StMarc,
      saintsFeasts.StGeorge,
      saintsFeasts.StMina,
    ]; //Those saints feast will be excluded because the doxologies of those saints are included by default

    if (excludeFeast.indexOf(copticDate) < 0)
      feast = Object.entries(saintsFeasts).find(
        (entry) => entry[1] === copticDate
      );

    if (feast) insertFeastInSequence(sequence, feast[1], 1);

    if (excludeFeast.indexOf(copticDate) > 0) {
      //If today is the feast of the saints included in excludeFeast. ! Notice that we start from 1 not from 0 because 0 is St. Maykel feast and it is already the first doxology in the saints doxologies

      let doxologyIndex = excludeFeast.indexOf(copticDate) + 2;
      sequence.splice(2, 0, sequence[doxologyIndex]); //We insert the doxology after St. Maykel doxology
      sequence.splice(doxologyIndex + 1, 1); //We remove the original doxolgoy from the sequence
    }

    feast = Object.entries(copticFeasts).find(
      (entry) => entry[1] === copticDate
    );
    //Else if the copticReadingsDate is a feast

    if (!feast)
      feast = Object.entries(copticFeasts).find(
        (entry) => entry[1] === copticReadingsDate
      );

    if (!feast)
      feast = Object.entries(Seasons).find((entry) => entry[1] === Season);

    if (feast) insertFeastInSequence(sequence, feast[1], 0);

    let doxologies: string[][][] = [];

    sequence.map((doxologyTitle) => {
      if (doxologyTitle.startsWith("&Insert="))
        DoxologiesPrayersArray
          //!CAUTION: we must use 'filter' not 'find' because for certain feasts there are more than one doxology
          .filter((tbl) =>
            selectFromMultiDatedTitle(
              tbl[0][0],
              doxologyTitle.split("&Insert=")[1]
            )
          )
          .forEach((doxology) => doxologies.push(doxology));
      else
        doxologies.push(
          findTableInPrayersArray(doxologyTitle, DoxologiesPrayersArray, {
            equal: true,
          }) as string[][]
        );
    });

    if (doxologies.length === 0)
      return console.log("Did not find any relevant doxologies");

    if (Season === Seasons.GreatLent) {
      //For the Great Lent, there is a doxology for the Sundays and 4 doxologies for the week days
      if (todayDate.getDay() === 0 || todayDate.getDay() === 6)
        doxologies = doxologies
          .filter((tbl) => tbl[0][0].includes("Seasons.GreatLent"))
          .filter((tbl) => !tbl[0][0].includes("Week"));
      else
        doxologies = doxologies
          .filter((tbl) => tbl[0][0].includes("Seasons.GreatLent"))
          .filter((tbl) => !tbl[0][0].includes("Sundays"));
    }

    if (Season === Seasons.KiahkWeek1 || Season === Seasons.KiahkWeek2)
      doxologies.splice(1, 6); //This is in order to remove the repetitive doxologies

    insertPrayersAdjacentToExistingElement({
      tables: doxologies,
      languages: btn.languages,
      position: {
        beforeOrAfter: "beforebegin",
        el: doxologiesPlaceHolder.nextElementSibling as HTMLElement,
      },
      container: btn.docFragment,
    });
  })();
  /**
   * Inserts a new element in the btn.prayersSequence[]. This elment will serve as a placeholder to insert the relevant prayers (Cymbal Verses or Doxologies) for the current season or feast
   * @param {string[]} sequence - the btn's prayers sequence in which the new placeholder element will be inserted
   * @param {string} feastString - the string representing the feast or the season
   * @param {number} index - the index at which the new placeholder element will be inserted.
   */
  function insertFeastInSequence(
    sequence: string[],
    feastString: string,
    index: number
  ) {
    if (
      lordFeasts.indexOf(feastString) < 0 &&
      Season !== Seasons.PentecostalDays
    )
      sequence.splice(index, 0, "&Insert=" + feastString);
    else sequence.splice(index, 1, "&Insert=" + feastString);
  }
}

async function removeElementsByTheirDataRoot(
  container = containerDiv,
  dataRoot: string
) {
  selectElementsByDataRoot(container, dataRoot, { equal: true }).forEach((el) =>
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
}): [HTMLElement, HTMLDivElement] | void {
  // if(!prayers || prayers.length ===0) return console.log(prayers);
  if (!args.insertion) return console.log("btnID = ", args.btnID);

  let btnDiv = document.createElement("div"); //Creating a div container in which the btn will be displayed
  btnDiv.classList.add(inlineBtnsContainerClass);

  args.insertion.insertAdjacentElement("beforebegin", btnDiv); //Inserting the div containing the button as 1st element of containerDiv

  let btnExpand = new Button({
    btnID: args.btnID,
    label: args.label,
    cssClass: inlineBtnClass,
    languages: args.languages,
    onClick: btnOnClick,
  });

  return createBtnAndExpandableDiv();

  function createBtnAndExpandableDiv(): [HTMLElement, HTMLDivElement] {
    let createdButton: HTMLElement = createBtn({
      btn: btnExpand,
      btnsContainer: btnDiv,
      btnClass: btnExpand.cssClass,
      clear: true,
      onClick: btnExpand.onClick,
    }); //creating the html element representing the button. Notice that we give it as 'click' event, the btn.onClick property, otherwise, the createBtn will set it to the default call back function which is showChildBtnsOrPrayers(btn, clear)

    createdButton.classList.add("expand"); //We need this class in order to retrieve the btn in Display Presentation Mode

    //We will create a newDiv to which we will append all the elements in order to avoid the reflow as much as possible
    let prayersContainerDiv = document.createElement("div");
    prayersContainerDiv.id = btnExpand.btnID + "Expandable";
    prayersContainerDiv.classList.add(hidden);
    prayersContainerDiv.classList.add("Expandable");
    prayersContainerDiv.style.display = "grid"; //This is important, otherwise the divs that will be add will not be aligned with the rest of the divs
    args.insertion.insertAdjacentElement("beforebegin", prayersContainerDiv);

    //We will create a div element for each row of each table in btn.prayersArray

    args.prayers.map((table) => {
      showPrayers({
        wordTable: table,
        languages: btnExpand.languages,
        position: prayersContainerDiv,
        container: prayersContainerDiv,
        clearContainerDiv: false,
        clearRightSideBar: false,
      });
    });

    Array.from(prayersContainerDiv.children)
      .filter((child) => isTitlesContainer(child as HTMLElement))
      .forEach((child) => {
        addDataGroupsToContainerChildren(
          child.classList[child.classList.length - 1],
          prayersContainerDiv
        );
      });
    return [createdButton, prayersContainerDiv];
  }

  async function btnOnClick(): Promise<HTMLElement[] | void> {
    let prayersContainerDiv = containerDiv.querySelector(
      "#" + btnExpand.btnID + "Expandable"
    ) as HTMLDivElement;

    if (!prayersContainerDiv)
      return console.log("no collapsable div was found");

    prayersContainerDiv.classList.toggle(hidden);
    //Making the children classList match prayersContainerDiv classList

    if (prayersContainerDiv.classList.contains(hidden))
      hideOrShowAllTitlesInAContainer(prayersContainerDiv, true);
    else hideOrShowAllTitlesInAContainer(prayersContainerDiv, false);
  }
}
