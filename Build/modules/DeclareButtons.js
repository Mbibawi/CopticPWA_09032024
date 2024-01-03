class Button {
    constructor(btn) {
        this._retrieved = false;
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
    set label(lbl) {
        this._label = lbl;
    }
    set parentBtn(parentBtn) {
        this._parentBtn = parentBtn;
    }
    set prayersSequence(btnPrayers) {
        this._prayersSequence = btnPrayers;
    }
    set retrieved(retrieved) {
        this._retrieved = retrieved;
    }
    set prayersArray(btnPrayersArray) {
        this._prayersArray = btnPrayersArray;
    }
    set languages(btnLanguages) {
        this._languages = btnLanguages;
    }
    set onClick(fun) {
        this._onClick = fun;
    }
    set afterShowPrayers(fun) {
        this._afterShowPrayers = fun;
    }
    set showPrayers(showPrayers) {
        this._showPrayers = showPrayers;
    }
    set children(children) {
        this._children = children;
    }
    set cssClass(cssClass) {
        this._cssClass = cssClass;
    }
    set docFragment(docFragment) {
        this._docFragment = docFragment;
    }
    set any(any) {
        this._any = any;
    }
}
const btnMain = new Button({
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
        if (localStorage.editingMode === "true") {
            let editMode = new Button({
                btnID: "btnEditMode",
                label: {
                    AR: "تعديل النص",
                    FR: "Enter Editing Mode",
                    EN: "Enter Editing Mode",
                },
                onClick: () => {
                    //@ts-ignore
                    if (!console.save)
                        addConsoleSaveMethod(console); //We are adding a save method to the console object
                    containerDiv.innerHTML = "";
                    containerDiv.dataset.editingMode = "true";
                    if (document.getElementById("selectArray"))
                        return; //Si un select element is already appended, we return
                    let editable = [
                        "Choose from the list",
                        "NewTable",
                        'Fun("arrayName", "Table\'s Title")',
                        "testEditingArray",
                        "PrayersArray",
                        "ReadingsArrays.GospelDawnArray",
                        "ReadingsArrays.GospelMassArray",
                        "ReadingsArrays.GospelNightArray",
                        "ReadingsArrays.GospelVespersArray",
                        "ReadingsArrays.KatholikonArray",
                        "ReadingsArrays.PraxisArray",
                        "ReadingsArrays.PropheciesDawnArray",
                        "ReadingsArrays.StPaulArray",
                        "ReadingsArrays.SynaxariumArray",
                    ];
                    let select = document.createElement("select"), option;
                    select.id = "selectArray";
                    select.style.backgroundColor = "ivory";
                    select.style.height = "16pt";
                    editable.forEach((name) => {
                        option = document.createElement("option");
                        option.innerText = name;
                        option.contentEditable = "true";
                        select.add(option);
                    });
                    document
                        .getElementById("homeImg")
                        .insertAdjacentElement("afterend", select);
                    select.addEventListener("change", () => startEditingMode({ select: select }));
                },
            });
            btnMain.children.push(editMode);
        }
        if (Season === Seasons.KiahkWeek1 || Season === Seasons.KiahkWeek2)
            btnPsalmody.label = {
                AR: "الإبصلمودية الكيهكية",
                FR: "Psalmodie de Kiahk",
            };
        (function showBtnsOnMainPage() {
            if (leftSideBar.classList.contains("extended"))
                return; //If the left side bar is not hidden, we do not show the buttons on the main page because it means that the user is using the buttons in the side bar and doesn't need to navigate using the btns in the main page
            let images = [
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
            containerDiv.style.gridTemplateColumns = ((100 / 3).toString() + "% ").repeat(3);
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
            function onClickBtnFunction(btn) {
                if (!btn.children || btn.children.length === 0)
                    btn.onClick({ returnBtnChildren: true }); //if btn doesn't have childre, we call its onClick() function beacuse the children of some btns are added when tis function is called. We pass 'true' as argument, because it makes the function return the children and do not execute until its end
                let parentHtmlBtn = containerDiv.querySelector("#" + btn.btnID);
                let backgroundImage;
                if (parentHtmlBtn)
                    backgroundImage = parentHtmlBtn.style.backgroundImage;
                containerDiv.innerHTML = "";
                if (!btn.children ||
                    btn.children.length === 0 ||
                    (btn.prayersSequence && btn.prayersSequence.length > 0)) {
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
const btnGoBack = new Button({
    btnID: "btnGoBack",
    label: { AR: "السابق", FR: "Retour", EN: "Go Back" },
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnMass = new Button({
    btnID: "btnMass",
    label: { AR: "القداسات", FR: "Messes" },
    onClick: (args = { returnBtnChildren: false }) => {
        btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
        if (args.returnBtnChildren)
            return btnMass.children;
    },
});
const btnIncenseOffice = new Button({
    btnID: "btnIncenseOffice",
    label: {
        AR: "رفع بخور باكر أو عشية",
        FR: "Office des Encens Aube et Vêpres",
    },
    onClick: (args = { returnBtnChildren: false }) => {
        //setting the children of the btnIncenseOffice. This must be done by the onClick() in order to reset them each time the button is clicked
        btnIncenseOffice.children = [btnIncenseDawn, btnIncenseVespers];
        //show or hide the PropheciesDawn button if we are in the Great Lent or JonahFast:
        if (args.returnBtnChildren)
            return btnIncenseOffice.children;
        if (Season === Seasons.GreatLent || Season === Seasons.JonahFast) {
            //we will remove the btnIncenseVespers from the children of btnIncenseOffice for all the days of the Week except Saturday because there is no Vespers incense office except on Saturday:
            if (todayDate.getDay() != 6 &&
                copticReadingsDate != copticFeasts.Resurrection) {
                btnIncenseOffice.children.splice(btnIncenseOffice.children.indexOf(btnIncenseVespers), 1);
            }
            // we will remove or add the Prophecies Readings button as a child to btnDayReadings depending on the day
            if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) === -1 && //The Prophecies button is not among the children of btnDayReadings
                todayDate.getDay() != 0 && //i.e., we are not a Sunday
                todayDate.getDay() != 6 //i.e., we are not a Saturday
            ) {
                //it means btnReadingsPropheciesDawn does not appear in the Incense Dawn buttons list (i.e., =-1), and we are neither a Saturday or a Sunday, which means that there are prophecies lectures for these days and we need to add the button in all the Day Readings Menu, and the Incense Dawn
                btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn); //We add the Prophecies button at the beginning of the btnIncenseDawn children[], i.e., we add it as the first button in the list of Incense Dawn buttons, the second one is the Gospel
            }
            else if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1 &&
                (todayDate.getDay() === 0 || //i.e., we are a Sunday
                    todayDate.getDay() === 6) //i.e., we are a Saturday
            ) {
                //it means btnReadingsPropheciesDawn appears in the Incense Dawn buttons list, and we are either a Saturday or a Sunday, which means that there are no prophecies for these days and we need to remove the button from all the menus to which it had been added before
                btnIncenseDawn.children.splice(btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn), 1);
            }
            //removing the vespers prayers if we are not a Saturday, and adding it if we aree
            if (btnDayReadings.children &&
                todayDate.getDay() != 6 &&
                btnDayReadings.children.indexOf(btnIncenseVespers) > -1) {
                //it means we are not a Saturday. we need to remove the btnIncenseVespers because there are not vespers
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnIncenseVespers), 1);
            }
            else if (btnDayReadings.children &&
                todayDate.getDay() === 6 &&
                btnDayReadings.children.indexOf(btnIncenseVespers) === -1) {
                //it means we are  a Saturday. we need to add the btnReadingsGospelIncenseVespers if missing
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelIncenseDawn), 0, btnIncenseVespers);
            }
        }
    },
});
const btnIncenseDawn = new Button({
    btnID: "btnIncenseDawn",
    label: {
        AR: "بخور باكر",
        FR: "Encens Aube",
    },
    showPrayers: true,
    children: [],
    languages: [...prayersLanguages],
    docFragment: new DocumentFragment(),
    onClick: () => {
        btnIncenseDawn.prayersSequence = [...IncensePrayersSequence].filter((title) => !title.startsWith(Prefix.incenseVespers)); //We will remove all the Incense Vespers titles from the prayersSequence Array
        if (todayDate.getDay() === 6)
            //If we are a Saturday, we pray only the 'Departed Litany', we will hence remove the 'Sick Litany' and the 'Travellers Litany'
            btnIncenseDawn.prayersSequence.splice(btnIncenseDawn.prayersSequence.indexOf(Prefix.incenseDawn + "SickPrayer&D=$copticFeasts.AnyDay"), 3, Prefix.incenseVespers + "DepartedPrayer&D=$copticFeasts.AnyDay");
        else if (todayDate.getDay() === 0 || lordFeasts.indexOf(copticDate) > -1)
            //If we are a Sunday or the day is a Lord's Feast, or the oblation is present, we remove the 'Travellers Litany' and keep the 'Sick Litany' and the 'Oblation Litany'
            btnIncenseDawn.prayersSequence.splice(btnIncenseDawn.prayersSequence.indexOf(Prefix.incenseDawn + "TravelersPrayer&D=$copticFeasts.AnyDay"), 1);
        else
            ;
        btnIncenseDawn.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.IncensePrayersArray.filter((table) => !table[0][0].startsWith(Prefix.incenseVespers)),
        ]; //We need this to be done when the button is clicked, not when it is declared, because when declared, CommonPrayersArray and IncensePrayersArray are empty (they are popultated by a function in "main.js", which is loaded after "DeclareButtons.js")
        if (todayDate.getDay() === 6)
            btnIncenseDawn.prayersArray.push(PrayersArrays.IncensePrayersArray.find((table) => table[0][0].startsWith(Prefix.incenseVespers + "DepartedPrayer&D=$copticFeasts.AnyDay"))); //i.e., if we are a Saturday, we include the 'Departed Litany' in the prayersArray of the button
        scrollToTop();
        return btnIncenseDawn.prayersSequence;
    },
    afterShowPrayers: async (btn = btnIncenseDawn, gospelButton = btnReadingsGospelIncenseDawn) => {
        let btnDocFragment = btn.docFragment;
        insertCymbalVersesAndDoxologies(btn);
        getGospelReadingAndResponses(gospelButton.onClick({ returnGospelPrefix: true }), gospelButton, btnDocFragment);
        (function hideGodHaveMercyOnUsIfBishop() {
            let dataRoot = Prefix.commonIncense +
                "PrayThatGodHaveMercyOnUsIfBishop&D=$copticFeasts.AnyDay";
            let godHaveMercyHtml = selectElementsByDataRoot(btnDocFragment, dataRoot.split("IfBishop")[0], { startsWith: true }); //We select all the paragraphs not only the paragraph for the Bishop
            godHaveMercyHtml
                .filter((htmlRow) => godHaveMercyHtml.indexOf(htmlRow) > 0 &&
                godHaveMercyHtml.indexOf(htmlRow) !== godHaveMercyHtml.length - 2)
                .forEach((htmlRow) => htmlRow.remove());
            let godHaveMercy = IncensePrayersArray.find((tbl) => tbl[1] && splitTitle(tbl[1][0])[0] === dataRoot); //We get the whole table not only the second row. Notice that the first row of the table is the row containing the title
            if (!godHaveMercy || godHaveMercy.length < 1)
                return console.log("Didn't find table Gode Have Mercy");
            addExpandablePrayer({
                insertion: godHaveMercyHtml[0].nextElementSibling,
                btnID: "godHaveMercy",
                label: {
                    AR: godHaveMercy[1][4],
                    FR: godHaveMercy[1][2], //this is the French text of the label
                },
                prayers: [[godHaveMercy[2], godHaveMercy[3]]],
                languages: btnMassUnBaptised.languages,
            });
        })();
        (async function addGreatLentPrayers() {
            if (btn.btnID !== btnIncenseDawn.btnID)
                return;
            if (Season !== Seasons.GreatLent && Season !== Seasons.JonahFast)
                return;
            if (todayDate.getDay() > 0 && todayDate.getDay() < 6) {
                console.log("we are not a sunday");
                //We are neither a Saturday nor a Sunday, we will hence display the Prophecies dawn buton
                (function showPropheciesDawnBtn() {
                    if (Season !== Seasons.GreatLent)
                        return;
                    //If we are during any day of the week, we will add the Prophecies readings to the children of the button
                    if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) < 0)
                        btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
                })();
                (async function insertEklonominTaghonata() {
                    let efnotiNaynan = selectElementsByDataRoot(btnDocFragment, Prefix.commonPrayer + "EfnotiNaynan&D=$copticFeasts.AnyDay", { startsWith: true });
                    let insertion = efnotiNaynan[efnotiNaynan.length - 1].nextSibling
                        .nextSibling; //This is the html div after "Kyrie Elison 3 times"
                    let godHaveMercy = btnIncenseDawn.prayersArray.find((table) => table[0][0].startsWith(Prefix.incenseDawn + "GodHaveMercyOnUs&D=$Seasons.GreatLent")); //This will give us all the prayers
                    console.log("godHaveMercy =", godHaveMercy);
                    insertPrayersAdjacentToExistingElement({
                        tables: [godHaveMercy],
                        languages: prayersLanguages,
                        position: { beforeOrAfter: "beforebegin", el: insertion },
                        container: btnDocFragment,
                    });
                    let refrains = selectElementsByDataRoot(btnDocFragment, Prefix.incenseDawn + "GodHaveMercyOnUsRefrain&D=$Seasons.GreatLent", { equal: true }).filter((htmlRow) => htmlRow.classList.contains("Title"));
                    refrains.forEach((htmlRow) => {
                        if (refrains.indexOf(htmlRow) > 0)
                            htmlRow.remove();
                    });
                })();
            }
            else {
                if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1)
                    btnIncenseDawn.children.splice(btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn), 1);
            }
        })();
        (async function addExpandableBtnForAdamDoxolgies() {
            if (btn.btnID !== btnIncenseDawn.btnID)
                return;
            if (btnDocFragment.children.length === 0)
                return;
            addExpandablePrayer({
                insertion: btnDocFragment.children[0],
                btnID: "AdamDoxologies",
                label: {
                    AR: "ذكصولوجيات باكر آدام",
                    FR: "Doxologies Adam Aube",
                },
                prayers: PrayersArrays.DoxologiesPrayersArray.filter((table) => table[0][0].startsWith(Prefix.doxologies + "AdamDawn")),
                languages: btnIncenseDawn.languages,
            })[1];
            //finally we append the newDiv to containerDiv
            //btnIncenseDawn.docFragment.children[1].insertAdjacentElement('beforebegin', doxologiesDiv)
        })();
    },
});
const btnIncenseVespers = new Button({
    btnID: "btnIncenseVespers",
    label: {
        AR: "بخور عشية",
        FR: "Incense Vespers",
    },
    showPrayers: true,
    docFragment: new DocumentFragment(),
    languages: [...prayersLanguages],
    onClick: () => {
        btnIncenseVespers.prayersSequence = [...IncensePrayersSequence].filter((title) => title !== Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay" &&
            !title.startsWith(Prefix.incenseDawn));
        btnIncenseVespers.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.IncensePrayersArray.filter((table) => !table[0][0].startsWith(Prefix.incenseDawn)),
        ];
        scrollToTop();
        return btnIncenseVespers.prayersSequence;
    },
    afterShowPrayers: async () => {
        btnIncenseDawn.afterShowPrayers(btnIncenseVespers, btnReadingsGospelIncenseVespers);
    },
});
const btnMassStCyril = new Button({
    btnID: "btnMassStCyril",
    label: { AR: "كيرلسي", FR: "Saint Cyril", EN: "St Cyril" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStCyril.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.MassCommonPrayersArray,
            ...PrayersArrays.MassStCyrilPrayersArray,
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
const btnMassStGregory = new Button({
    btnID: "btnMassStGregory",
    label: { AR: "غريغوري", FR: "Saint Gregory" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStGregory.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.MassCommonPrayersArray,
            ...PrayersArrays.MassStGregoryPrayersArray,
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
        btnMassStGregory.prayersSequence.splice(btnMassStGregory.prayersSequence.indexOf(Prefix.massCommon + "CallOfTheHolySpiritPart1&D=$copticFeasts.AnyDay"), 9);
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
const btnMassStBasil = new Button({
    btnID: "btnMassStBasil",
    label: { AR: "باسيلي", FR: "Saint Basil", EN: "St Basil" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStBasil.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.MassCommonPrayersArray,
            ...PrayersArrays.MassStBasilPrayersArray,
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
        // btnsPrayersSequences.splice(btns.indexOf(btnMassStBasil), 1, btnMassStBasil.prayersSequence);
        // btnMassStBasil.retrieved = true;
        return btnMassStBasil.prayersSequence;
    },
    afterShowPrayers: async (btn = btnMassStBasil) => {
        let massButtons = [
            btnMassStBasil,
            btnMassStGregory,
            btnMassStCyril,
            btnMassStJohn,
        ];
        massButtons.splice(massButtons.indexOf(btn), 1);
        massButtons.splice(massButtons.indexOf(btnMassStJohn), 1);
        let btnDocFragment = btn.docFragment;
        (function insertStBasilSecondReconciliationBtn() {
            if (btn !== btnMassStBasil)
                return;
            let reconciliation = PrayersArrays.MassStBasilPrayersArray.find((table) => table[0][0].startsWith(Prefix.massStBasil + "Reconciliation2"));
            if (!reconciliation)
                return console.log("Didn't find reconciliation");
            let htmlBtn = addExpandablePrayer({
                insertion: selectElementsByDataRoot(btnDocFragment, "Reconciliation&D=$copticFeasts.AnyDay", { includes: true })[0].nextElementSibling,
                btnID: "secondStBasilReconciliation",
                label: {
                    AR: reconciliation[0][2],
                    FR: reconciliation[0][4],
                },
                prayers: [reconciliation],
                languages: btn.languages,
            })[0];
            htmlBtn.addEventListener("click", () => {
                let reconciliation = Array.from(containerDiv.querySelectorAll(".Row"));
                reconciliation
                    .filter((row) => row.dataset.group ===
                    Prefix.massStBasil + "Reconciliation&D=$copticFeasts.AnyDay")
                    .forEach((row) => {
                    row.classList.toggle(hidden);
                });
            });
        })();
        showFractionPrayersMasterButton(btn, selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay", { equal: true })[0], { AR: "صلوات القسمة", FR: "Oraisons de la Fraction" }, "btnFractionPrayers", PrayersArrays.FractionsPrayersArray);
        (function addRedirectionButtons() {
            //Adding 2 buttons to redirect the other masses at the begining of the Reconciliation
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataRoot(btnDocFragment, "Reconciliation&D=$copticFeasts.AnyDay", { includes: true })[0],
            }, "RedirectionToReconciliation");
            //Adding 2 buttons to redirect to the other masses at the Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "SpasmosAdamShort&D=$copticFeasts.AnyDay", { endsWith: true });
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1],
            }, "RedirectionToAnaphora");
            //Adding 2 buttons to redirect to the other masses before Agios
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataRoot(btnDocFragment, getMassPrefix(btn.btnID) + "Agios&D=$copticFeasts.AnyDay", { equal: true })[0].previousElementSibling,
            }, "RedirectionToAgios");
            //Adding 2 buttons to redirect to the other masses before the Call upon the Holy Spirit
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataRoot(btnDocFragment, Prefix.massCommon +
                    "AssemblyResponseAmenAmenAmenWeProclaimYourDeath&D=$copticFeasts.AnyDay", { equal: true })[0],
            }, "RedirectionToLitanies");
            //Adding 2 buttons to redirect to the other masses before the Fraction Introduction
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "beforebegin",
                el: selectElementsByDataRoot(btnDocFragment, "FractionIntroduction&D=$copticFeasts.AnyDay", { includes: true })[0],
            }, "RedirectionToFractionIntroduction");
        })();
        (function insertAdamAndWatesSpasmos() {
            //We insert it during the Saint Mary Fast and on every 21th of the coptic month
            let spasmosTitle = Prefix.massCommon + "SpasmosAdamLong";
            insertSpasmos(spasmosTitle, Prefix.massCommon + "DiaconResponseKissEachOther&D=");
            //Insert Wates Spasmoses
            insertSpasmos(spasmosTitle.replace("Adam", "Wates"), Prefix.massCommon + "SpasmosWatesShort", true);
        })();
        function insertSpasmos(spasmosTitle, anchorTitle, hideAnchor = false) {
            let spasmos = MassCommonPrayersArray.filter((tbl) => tbl[0][0].startsWith(spasmosTitle) &&
                selectFromMultiDatedTitle(splitTitle(tbl[0][0])[0], Season))[0];
            if (!spasmos)
                return console.log("didn't find spasmos with title = ", spasmosTitle);
            let anchor = selectElementsByDataRoot(btnDocFragment, anchorTitle, {
                startsWith: true,
            })[0];
            if (!anchor)
                console.log("didn't find anchor : ", anchorTitle);
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
                createdElements[0].addEventListener("click", () => selectElementsByDataRoot(containerDiv, anchor.dataset.root, {
                    equal: true,
                }).forEach((row) => row.classList.toggle(hidden)));
        }
        (function insertCommunionChants() {
            //Inserting the Communion Chants after the Psalm 150
            let psalm = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay", { equal: true });
            let filtered = PrayersArrays.CommunionPrayersArray.filter((tbl) => selectFromMultiDatedTitle(tbl[0][0], copticDate) === true ||
                selectFromMultiDatedTitle(tbl[0][0], Season) === true);
            if (filtered.length === 0)
                filtered = PrayersArrays.CommunionPrayersArray.filter((tbl) => selectFromMultiDatedTitle(tbl[0][0], copticFeasts.AnyDay) === true);
            showMultipleChoicePrayersButton({
                filteredPrayers: filtered,
                btn: btn,
                btnLabels: {
                    AR: "مدائح التوزيع",
                    FR: "Chants de la communion",
                },
                masterBtnID: "communionChants",
                anchor: psalm[psalm.length - 1],
            });
        })();
        (function insertLitaniesIntroductionFromOtherMasses() {
            if (btn !== btnMassStBasil)
                return; //This button appears only in St Basil Mass
            let litaniesIntro = PrayersArrays.MassStGregoryPrayersArray.find((tbl) => tbl[0][0].startsWith(Prefix.massStGregory + "LitaniesIntroduction"));
            if (!litaniesIntro)
                return console.log("Did not find the Litanies Introduction");
            let anchor = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "LitaniesIntroduction&D=$copticFeasts.AnyDay", { equal: true })[0];
            if (!anchor)
                return console.log("Di not find the Anchor");
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
            litaniesIntro = PrayersArrays.MassStCyrilPrayersArray.find((tbl) => splitTitle(tbl[0][0])[0].startsWith(Prefix.massStCyril + "LitaniesIntroduction"));
            litaniesIntro = structuredClone(litaniesIntro);
            litaniesIntro.splice(litaniesIntro.length - 1, 1); //We remove the last row in the table of litaniesIntro because it is the "As it were, let it always be.../كما كان هكذا يكون/tel qu'il fût ainsi soit-il..."
            if (litaniesIntro.length === 0)
                console.log("Did not find the St Cyril Litanies Introduction");
            //We will create the expandable div and its button, but will append the button to the div
            let btnsDiv = createdElements[0].parentElement;
            btnsDiv.appendChild(addExpandablePrayer({
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
            Array.from(btnsDiv.children).forEach((child) => child.addEventListener("click", () => toggleOtherLitanies(child.id)));
            btnsDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsDiv, 3);
            function toggleOtherLitanies(btnID) {
                let div = Array.from(containerDiv.querySelectorAll(".Expandable")).find((btn) => btn.id.includes("LitaniesIntro") && !btn.id.startsWith(btnID));
                if (div && !div.classList.contains(hidden))
                    div.classList.add(hidden);
            }
        })();
        (function removeNonRelevantSeasonalLitany() {
            let seasonal = Array.from(btnDocFragment.querySelectorAll(".Row"));
            seasonal = seasonal.filter((row) => row.dataset.root.includes("SeasonalLitanyOf"));
            let dataRoot;
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
const btnMassStJohn = new Button({
    btnID: "btnMassStJohn",
    label: { AR: "القديس يوحنا", FR: "Saint Jean" },
    docFragment: new DocumentFragment(),
    showPrayers: false,
    prayersSequence: [],
    onClick: () => {
        alert("The prayers of this mass have not yet been added. We hope they will be ready soon");
        return; //until we add the text of this mass
        btnMassStJohn.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.MassCommonPrayersArray,
            ...PrayersArrays.MassStJohnPrayersArray,
        ];
        scrollToTop(); //scrolling to the top of the page
        btnsPrayersSequences.splice(btns.indexOf(btnMassStJohn), 1, btnMassStJohn.prayersSequence);
        btnMassStJohn.retrieved = true;
        return btnMassStJohn.prayersSequence;
    },
    afterShowPrayers: async () => {
        btnMassStBasil.afterShowPrayers(btnMassStJohn);
    },
});
const goToAnotherMass = [
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
const btnMassUnBaptised = new Button({
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
            if ((Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
                todayDate.getDay() !== 0 &&
                todayDate.getDay() !== 6) {
                //Inserting "Alleluja E Ikhon" before "Allelujah Fay Bibi"
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 2, Prefix.massCommon + "HallelujahFayBiBiGreatLent&D=$Seasons.GreatLent");
                //Removing "Allelujah Fay Bibi" and "Allelujha Ge Ef Mev'i"
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 1);
            }
            else if ((isFast && todayDate.getDay() !== 0 && todayDate.getDay() !== 6) ||
                (Season === Seasons.NoSeason &&
                    (todayDate.getDay() === 3 || todayDate.getDay() === 5))) {
                //Removing Hellelujah Fay Bibi
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 1);
                //Remove TayShouray
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "Tayshoury&D=$copticFeasts.AnyDay"), 1);
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
            let dataRoot = Prefix.commonIncense +
                "PrayThatGodHaveMercyOnUsIfBishop&D=$copticFeasts.AnyDay";
            let godHaveMercyHtml = selectElementsByDataRoot(btnDocFragment, dataRoot.split("IfBishop")[0], { startsWith: true }); //We select all the paragraphs not only the paragraph for the Bishop
            godHaveMercyHtml
                .filter((htmlRow) => godHaveMercyHtml.indexOf(htmlRow) > 0 &&
                godHaveMercyHtml.indexOf(htmlRow) < godHaveMercyHtml.length - 1)
                .forEach((htmlRow) => htmlRow.remove());
            let godHaveMercy = IncensePrayersArray.find((tbl) => tbl[1] && splitTitle(tbl[1][0])[0] === dataRoot); //We get the whole table not only the second row. Notice that the first row of the table is the row containing the title
            if (!godHaveMercy)
                return console.log("Didn't find table Gode Have Mercy");
            addExpandablePrayer({
                insertion: godHaveMercyHtml[0].nextElementSibling,
                btnID: "godHaveMercy",
                label: {
                    AR: godHaveMercy[1][4],
                    FR: godHaveMercy[1][2], //this is the French text of the label
                },
                prayers: [[godHaveMercy[2], godHaveMercy[3]]],
                languages: btnMassUnBaptised.languages,
            });
        })();
        if (Season === Seasons.GreatLent || Season === Seasons.JonahFast) {
            //Inserting psaume 'His Foundations In the Holy Montains' before the absolution prayers
            insertPrayersAdjacentToExistingElement({
                tables: btnMassUnBaptised.prayersArray.filter((table) => splitTitle(table[0][0])[0] ===
                    Prefix.massCommon + "HisFoundationsInTheHolyMountains&D=GreatLent"),
                languages: btnMassUnBaptised.languages,
                position: {
                    beforeOrAfter: "beforebegin",
                    el: selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "AbsolutionForTheFather&D=$copticFeasts.AnyDay", { equal: true })[0],
                },
                container: btnDocFragment,
            });
        }
        let readingsAnchor = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "ReadingsPlaceHolder&D=&D=$copticFeasts.AnyDay", { equal: true })[0]; //this is the html element before which we will insert all the readings and responses
        let reading;
        (function insertStPaulReading() {
            reading = ReadingsArrays.StPaulArray.filter((tbl) => splitTitle(tbl[0][0])[0] ===
                Prefix.stPaul + "&D=" + copticReadingsDate);
            reading = reading.map((tbl) => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            //adding the  end of the St Paul reading
            if (reading.length === 0)
                return;
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
            reading = ReadingsArrays.KatholikonArray.filter((tbl) => splitTitle(tbl[0][0])[0] ===
                Prefix.katholikon + "&D=" + copticReadingsDate);
            if (reading.length === 0)
                return;
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
            reading = ReadingsArrays.PraxisArray.filter((tbl) => splitTitle(tbl[0][0])[0] ===
                Prefix.praxis + "&D=" + copticReadingsDate);
            if (reading.length === 0)
                return;
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
                let praxis = selectElementsByDataRoot(btnDocFragment, Prefix.praxis + "&D=", { startsWith: true }); //This is the praxis reading
                if (praxis.length === 0)
                    return;
                let annualResponse; //This is the praxis response for any ordinary day (it is included by default)
                (function moveAnnualResponseBeforePraxis() {
                    //Moving the annual response
                    annualResponse = selectElementsByDataRoot(btnDocFragment, Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay", { equal: true });
                    if (!annualResponse || annualResponse.length === 0)
                        return console.log("error: annual = ", annualResponse);
                    annualResponse.forEach((htmlRow) => praxis[0].insertAdjacentElement("beforebegin", htmlRow));
                })();
                let response = PrayersArrays.PraxisResponsesPrayersArray.filter((table) => selectFromMultiDatedTitle(table[0][0], copticDate) ||
                    selectFromMultiDatedTitle(table[0][0], Season));
                if (!response || response.length === 0)
                    return;
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
                    insertPrayersAdjacentToExistingElement({
                        tables: response,
                        languages: prayersLanguages,
                        position: { beforeOrAfter: "beforebegin", el: annualResponse[0] },
                        container: btnDocFragment,
                    });
                    //We remove the first 2 rows of the Annual response
                    annualResponse.forEach((htmlRow) => {
                        if (annualResponse.indexOf(htmlRow) < 2)
                            htmlRow.remove();
                    });
                })();
            })();
        })();
        (function insertSynaxarium() {
            reading = ReadingsArrays.SynaxariumArray.filter((table) => splitTitle(table[0][0])[0] === Prefix.synaxarium + "&D=" + copticDate);
            if (reading.length === 0)
                return;
            reading = reading.map((tbl) => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            reading[0].splice(1, 0, [
                splitTitle(reading[0][0][0])[0] + "&C=ReadingIntro",
                ReadingsIntrosAndEnds.synaxariumIntro.FR.replace("theday", Number(copticDay).toString()).replace("themonth", copticMonths[Number(copticMonth)].FR),
                ReadingsIntrosAndEnds.synaxariumIntro.AR.replace("theday", Number(copticDay).toString()).replace("themonth", copticMonths[Number(copticMonth)].AR),
                ReadingsIntrosAndEnds.synaxariumIntro.EN.replace("theday", Number(copticDay).toString()).replace("themonth", copticMonths[Number(copticMonth)].EN),
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
            let praxisElements = selectElementsByDataRoot(btnDocFragment, Prefix.praxis + "&D=", { startsWith: true });
            if (praxisElements.length === 0)
                return;
            let anchor = {
                beforeOrAfter: "beforebegin",
                el: praxisElements[praxisElements.length - 1]
                    .nextElementSibling,
            };
            let titleBase;
            reading.forEach((table) => {
                titleBase = splitTitle(table[0][0])[0];
                table.map((row) => {
                    if (!row[0].startsWith(Prefix.same))
                        titleBase = row[0];
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
            if (Season !== Seasons.PentecostalDays)
                return;
            let hymns = PrayersArray.filter((table) => table[0][0].startsWith("PentecostalHymns&D=$Seasons.PentecostalDays"));
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
            //Inserting the Gospel Reading
            getGospelReadingAndResponses(Prefix.gospelMass, {
                prayersArray: ReadingsArrays.GospelMassArray,
                languages: readingsLanguages,
            }, btnDocFragment);
        })();
        (async function insertBookOfHoursButton() {
            if (copticReadingsDate === copticFeasts.Resurrection ||
                copticDate === copticFeasts.Nativity ||
                copticDate === copticFeasts.Baptism)
                //In these feasts we don't pray any hour
                return;
            let hoursBtns = btnBookOfHours.onClick(true); //We get buttons for the relevant hours according to the day
            if (!hoursBtns)
                return;
            (function selectRelevantHoursAccordingToTheDay() {
                //args.mass is a boolean that tells whether the button prayersArray should include all the hours of the Book Of Hours, or only those pertaining to the mass according to the season and the day on which the mass is celebrated
                let hours = [hoursBtns[1], hoursBtns[2], hoursBtns[3]]; //Those are the 3rd, 6th and 9th hours
                if ((Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
                    todayDate.getDay() !== 0 &&
                    todayDate.getDay() !== 6)
                    //We are during the Great Lent, we pray the 3rd, 6th, 9th, 11th, and 12th hours
                    hours.push(hoursBtns[4], hoursBtns[5]);
                else if (todayDate.getDay() === 0 ||
                    todayDate.getDay() === 6 || //Whatever the period, if we are a Saturday or a Sunday, we pray only the 3rd and 6th Hours
                    lordFeasts.indexOf(copticDate) > -1 ||
                    Season === Seasons.PentecostalDays ||
                    Season === Seasons.Nayrouz ||
                    Season === Seasons.CrossFeast ||
                    (!isFast && todayDate.getDay() !== 3 && todayDate.getDay() !== 5))
                    //We are a Sunday or a Saturday, or during the 50 Pentecostal days, or on a Lord Feast day, or we are during a no fast period
                    hours.pop(); //we remove the 9th hour
                hoursBtns = hours;
            })();
            let masterBtnDiv = document.createElement("div"); //This is the div that will contain the master button which shows or hides the Book of Hours sub buttons
            masterBtnDiv.classList.add(inlineBtnsContainerClass);
            masterBtnDiv.id = "masterBOHBtn";
            let btnsDiv = document.createElement("div"); //This is the div that contains the sub buttons for each Hour of the Book of Hours
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
            masterBtnDiv.prepend(createBtn({
                btn: masterBtn,
                btnsContainer: masterBtnDiv,
                btnClass: inlineBtnClass,
                clear: true,
                onClick: masterBtn.onClick,
            })); //We add the master button to the bookOfHoursMasterDiv
            //We will create a button and an expandable div for each hour
            hoursBtns
                .reverse() //We reverse the buttons in order to get them arranged in the order from right to left (i.e: 3rdHour, 6thHour, etc.)
                .forEach(async (btn) => {
                btn.onClick(true); //We call the onClick() method of the btn in order to build its prayersSequence and prayersArray properties. Notice that we passs
                InsertHourFinalPrayers(btn); //Inserting Kyrielison 41 times, Agios, Holy God of Sabaot, etc.
                let btnPrayers = btn.prayersSequence
                    .map(title => findTableInPrayersArray(title, getTablesArrayFromTitlePrefix(title))); //We create an array containing all the tables includes in the button's prayersSequence.
                //We will create an 'expandable' html button and div for the hour button
                let createdElements = addExpandablePrayer({
                    insertion: btnDocFragment.children[0],
                    btnID: btn.btnID,
                    label: btn.label,
                    prayers: btnPrayers,
                    languages: btnBookOfHours.languages,
                });
                addOnClickToHourBtn(createdElements[0]);
                btnsDiv.appendChild(createdElements[0]); //We add all the buttons to the same div instead of 3 divs;
                collapseAllTitles(Array.from(createdElements[1].children)); //We collapse all the titles
                if (localStorage.displayMode === displayModes[1]) {
                    //If we are in the 'Presentation Mode'
                    Array.from(createdElements[1].querySelectorAll("div.Row"))
                        .filter((row) => row.dataset.root.includes("HourPsalm") ||
                        row.dataset.root.includes("EndOfHourPrayer"))
                        .forEach((row) => row.remove()); //we remove all the psalms and keep only the Gospel and the Litanies,
                    Array.from(sideBarTitlesContainer.children)
                        .filter((row) => row.dataset.root.includes("HourPsalm") ||
                        row.dataset.root.includes("EndOfHourPrayer"))
                        .forEach((row) => row.remove()); //We do the same for the titles
                }
            });
            function addOnClickToHourBtn(hourBtn) {
                hourBtn.addEventListener("click", async () => {
                    Array.from(containerDiv.children)
                        .filter((div) => div.id.endsWith("Expandable"))
                        .forEach((expandableDiv) => {
                        if (!expandableDiv.id.startsWith(hourBtn.id) &&
                            !expandableDiv.classList.contains(hidden)) {
                            //This is the container of another hour than the hour linked to the button (btn), we hidde any such container in ordr to keep only the prayers of the button's hour
                            expandableDiv.classList.add(hidden);
                            collapseAllTitles(Array.from(expandableDiv.children));
                            hideOrShowAllTitlesInAContainer(expandableDiv, true);
                        }
                        else if (expandableDiv.id.startsWith(hourBtn.id)) {
                            //this is the container of the prayers related to the button
                            if (!expandableDiv.classList.contains(hidden)) {
                                makeExpandableButtonContainerFloatOnTop(btnsDiv, "5px");
                                masterBtnDiv.classList.add(hidden);
                                createFakeAnchor(expandableDiv.id);
                            }
                            else {
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
            btnsDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsDiv, 3);
            function InsertHourFinalPrayers(hourBtn) {
                let Agios = Prefix.commonPrayer + "HolyGodHolyPowerfull&D=$copticFeasts.AnyDay", Kyrielison41Times = Prefix.commonPrayer + "Kyrielison41Times&D=$copticFeasts.AnyDay", KyrielisonIntro = Kyrielison41Times.replace("&D=", "NoMassIntro&D="), KyrielisonMassIntro = Kyrielison41Times.replace("&D=", "MassIntro&D="), HolyLordOfSabaot = Prefix.commonPrayer +
                    "HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay", HailToYouMaria = Prefix.commonPrayer + "WeSaluteYouMary&D=$copticFeasts.AnyDay", WeExaltYou = Prefix.commonPrayer + "WeExaltYouStMary&D=$copticFeasts.AnyDay", Creed = Prefix.commonPrayer + "Creed&D=$copticFeasts.AnyDay", OurFatherWhoArtInHeaven = Prefix.commonPrayer +
                    "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay";
                //!CAUTION, the order of the buttons in hourBtn is reversed (eg.: [9th, 6th, 3rd] instead of [3rd, 6th, 9th])
                let sequence;
                if (hoursBtns.indexOf(hourBtn) === 0) {
                    sequence = [
                        WeExaltYou,
                        Creed,
                        KyrielisonMassIntro,
                        Kyrielison41Times,
                        HolyLordOfSabaot,
                        OurFatherWhoArtInHeaven,
                    ];
                }
                else if (hoursBtns.indexOf(hourBtn) === 1) {
                    //this is the before last
                    sequence = [Agios, OurFatherWhoArtInHeaven, HailToYouMaria];
                }
                else {
                    //Any other hour before the 2 last
                    sequence = [
                        KyrielisonIntro,
                        Kyrielison41Times,
                        HolyLordOfSabaot,
                        OurFatherWhoArtInHeaven,
                    ];
                }
                insertCommonPrayer(hourBtn, sequence, hourBtn.prayersSequence.find(title => title.includes("HourLitanies&D=")));
                function insertCommonPrayer(btn, titles, litanies) {
                    if (!titles || titles.length === 0)
                        return console.log("no sequence");
                    btn.prayersSequence.splice(btn.prayersSequence.indexOf(litanies) + 1, 0, ...titles);
                }
            }
            //Collapsing all the Titles
            collapseAllTitles(Array.from(btnDocFragment.children));
            btnDocFragment.getElementById("masterBOHBtn").classList.toggle(hidden); //We remove hidden from btnsDiv
        })();
    },
});
const btnMassBaptised = new Button({
    btnID: "btnMassBaptised",
    label: {
        AR: "قداس المؤمنين",
        FR: "Messe des Croyants",
        EN: "Baptized Mass",
    },
    parentBtn: btnMass,
    children: [btnMassStBasil, btnMassStCyril, btnMassStGregory, btnMassStJohn],
});
const btnDayReadings = new Button({
    btnID: "btnDayReadings",
    children: [
        new Button({
            btnID: "btnReadingsStPaul",
            label: {
                AR: "البولس",
                FR: "Epître de Saint Paul",
                EN: "Pauline Epistle",
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
                AR: "الكاثوليكون",
                FR: "Katholikon",
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
                AR: "الإبركسيس",
                FR: "Praxis",
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
                AR: "السنكسار",
                FR: "Synaxarium",
            },
            showPrayers: true,
            prayersArray: ReadingsArrays.SynaxariumArray,
            languages: ["FR", "AR"],
            onClick: function () {
                //We can't use an arrow function here because we need to use this
                this.prayersSequence = [Prefix.synaxarium + "&D=" + copticDate];
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
            prayersSequence: [
                Prefix.gospelMass + "Psalm",
                Prefix.gospelMass + "Gospel",
            ],
            prayersArray: ReadingsArrays.GospelMassArray,
            languages: [...readingsLanguages],
            onClick: () => {
                scrollToTop(); //scrolling to the top of the page
            },
        }),
    ],
    label: {
        AR: "قراءات اليوم",
        FR: "Lectures du jour",
        EN: "Day's Readings",
    },
    onClick: (args = { returnBtnChildren: false }) => {
        if (Season === Seasons.HolyWeek) {
            //We should put here child buttons for the Holy Week prayers and readings
            let div = document.createElement("div");
            div.innerText =
                "We are during the Holy Week, there are no readings, please go to the Holy Week Prayers";
            containerDiv.appendChild(div);
            return;
        }
        //We set the btnDayReadings.children[] property
        if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseDawn) < 0)
            btnDayReadings.children.unshift(btnReadingsGospelIncenseDawn);
        if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers) < 0)
            btnDayReadings.children.unshift(btnReadingsGospelIncenseVespers);
        if (args.returnBtnChildren)
            return btnDayReadings.children;
        if (Season === Seasons.GreatLent &&
            todayDate.getDay() != 6 &&
            copticReadingsDate !== copticFeasts.Resurrection) {
            //we are during the Great Lent and we are not a Saturday
            if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers) > -1) {
                //There is no Vespers office: we remove the Vespers Gospel from the list of buttons
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers), 1);
            }
            //If, in additon, we are not a Sunday (i.e., we are during any week day other than Sunday and Saturday), we will  add the Prophecies button to the list of buttons
            if (todayDate.getDay() != 0) {
                //We are not a Sunday:
                if (btnDayReadings.children.indexOf(btnReadingsPropheciesDawn) === -1) {
                    btnDayReadings.children.unshift(btnReadingsPropheciesDawn);
                }
                //since we  are not a Sunday, we will also remove the Night Gospel if included
                if (btnDayReadings.children.indexOf(btnReadingsGospelNight) > -1) {
                    btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelNight), 1);
                }
            }
            else if (todayDate.getDay() === 0 &&
                copticReadingsDate != copticFeasts.Resurrection) {
                //However, if we are a Sunday, we add the Night Gospel to the readings list of buttons
                if (btnDayReadings.children.indexOf(btnReadingsGospelNight) === -1) {
                    // (we do not add it to the Unbaptized mass menu because it is not read during the mass)
                    btnDayReadings.children.push(btnReadingsGospelNight);
                }
            }
        }
    },
});
const btnReadingsGospelIncenseVespers = new Button({
    btnID: "btnReadingsGospelIncenseVespers",
    label: {
        AR: "إنجيل عشية",
        FR: "Evangile  Vêpres",
        EN: "Vespers Gospel",
    },
    showPrayers: true,
    languages: [...readingsLanguages],
    onClick: (args) => {
        let btn = btnReadingsGospelIncenseVespers;
        btn.prayersSequence = [
            Prefix.gospelVespers + "Psalm&D=",
            Prefix.gospelVespers + "Gospel&D=",
        ]; //!We need this to be set when the button is clicked not when it is declared because we add the date to it, which changes its value each time the button is clicked
        console.log("this = ", this);
        btnReadingsGospelIncenseVespers.prayersArray =
            ReadingsArrays.GospelVespersArray;
        if (args && args.returnGospelPrefix)
            return Prefix.gospelVespers; //!this must come after the prayersArray has been set
        let date = getTomorowCopticReadingDate();
        console.log(date);
        if (args && args.returnDate)
            return date;
        //We add the psalm reading to the begining of the prayersSequence
        btn.prayersSequence = btn.prayersSequence.map((title) => (title += date));
        scrollToTop(); //scrolling to the top of the page
        function getTomorowCopticReadingDate() {
            let today = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).
            return getSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today.getTime(), false)[1], today);
        }
    },
});
const btnReadingsGospelIncenseDawn = new Button({
    btnID: "btnReadingsGospelIncenseDawn",
    label: {
        AR: "إنجيل باكر",
        FR: "Evangile Aube",
        EN: "Gospel Dawn",
    },
    showPrayers: true,
    prayersSequence: [Prefix.gospelDawn + "Psalm", Prefix.gospelDawn + "Gospel"],
    languages: [...readingsLanguages],
    onClick: (args) => {
        btnReadingsGospelIncenseDawn.prayersArray = ReadingsArrays.GospelDawnArray;
        if (args && args.returnGospelPrefix)
            return Prefix.gospelDawn; //! This must come after the prayersArray has been set
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnReadingsGospelNight = new Button({
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
    languages: [...readingsLanguages],
    onClick: () => {
        btnReadingsGospelNight.prayersArray = ReadingsArrays.GospelNightArray;
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnReadingsPropheciesDawn = new Button({
    btnID: "btnReadingsPropheciesDawn",
    label: {
        AR: "نبوات باكر",
        FR: "Propheties Matin",
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
const btnBookOfHours = new Button({
    btnID: "btnBookOfHours",
    label: { AR: "الأجبية", FR: "Agpia", EN: "Book of Hours" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    children: [],
    onClick: (returnBtnChildren = false) => {
        if (btnBookOfHours.children.length > 1)
            return btnBookOfHours.children;
        let OurFatherWhoArtInHeaven = Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay", AngelsPrayers = Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay", HailToYouMaria = Prefix.commonPrayer + "WeSaluteYouMary&D=$copticFeasts.AnyDay", WeExaltYou = Prefix.commonPrayer + "WeExaltYouStMary&D=$copticFeasts.AnyDay", Agios = Prefix.commonPrayer + "HolyGodHolyPowerfull&D=$copticFeasts.AnyDay", Kyrielison41Times = Prefix.commonPrayer + "Kyrielison41Times&D=$copticFeasts.AnyDay", KyrielisonIntro = Kyrielison41Times.replace("&D=", "NoMassIntro&D="), HolyLordOfSabaot = Prefix.commonPrayer + "HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay", Creed = Prefix.commonPrayer + "Creed&D=$copticFeasts.AnyDay", AllHoursFinalPrayer = Prefix.bookOfHours + "AllHoursFinalPrayer&D=$copticFeasts.AnyDay";
        btnBookOfHours.children = [];
        (function addAChildButtonForEachHour() {
            Object.entries(bookOfHours)
                .filter(entry => entry[0].endsWith("PrayersArray"))
                .forEach((entry) => {
                let hourName = entry[0].split("PrayersArray")[0];
                let hourBtn = new Button({
                    btnID: "btn" + hourName,
                    label: {
                        AR: bookOfHoursLabels.find((label) => label.id === hourName).AR ||
                            "",
                        FR: bookOfHoursLabels.find((label) => label.id === hourName)[0] ||
                            "",
                    },
                    languages: btnBookOfHours.languages,
                    showPrayers: true,
                    prayersArray: [...entry[1]],
                    onClick: (isMass = false) => hourBtnOnClick(hourBtn, hourName, isMass),
                    afterShowPrayers: () => Array.from(containerDiv.querySelectorAll(".Row"))
                        .forEach(htmlRow => {
                        htmlRow.classList.replace("Priest", "NoActor");
                        htmlRow.classList.replace("Diacon", "NoActor");
                        htmlRow.classList.replace("Assembly", "NoActor");
                    }),
                });
                btnBookOfHours.children.push(hourBtn);
            });
            if (returnBtnChildren)
                return btnBookOfHours.children;
            scrollToTop();
            return btnBookOfHours.prayersSequence;
            //Adding the onClick() property to the button
            function hourBtnOnClick(btn, hourName, isMass) {
                (function buildBtnPrayersSequence() {
                    //We will add the prayers sequence to btn.prayersSequence[]
                    btn.prayersSequence = [
                        ...Object.entries(bookOfHours)
                            .find(entry => entry[0] === hourName + "PrayersSequence")[1],
                    ];
                    let titleTemplate = Prefix.bookOfHours + "&D=$copticFeasts.AnyDay";
                    btn.prayersSequence
                        .forEach(title => (btn.prayersSequence[btn.prayersSequence.indexOf(title)] =
                        titleTemplate.replace("&D=", "Psalm" + title.toString() + '&D=')));
                    ['Gospel', 'Litanies', 'EndOfHourPrayer'].forEach((title) => btn.prayersSequence.push(titleTemplate.replace("&D=", hourName + title + '&D=')));
                    btn.prayersSequence.unshift(titleTemplate.replace('&D=', hourName + 'Title' + '&D=')); //This is the title of the hour prayer
                    (function addFinalPrayersToSequence() {
                        if (isMass)
                            return; //!Important: If the onClick() method is called when the button is displayed in the Unbaptised Mass, we do not add anything else to the btn's prayersSequence
                        //Then, we add the End of all Hours' prayers (ارحمنا يا الله ثم ارحمنا)
                        btn.prayersSequence.push(AllHoursFinalPrayer);
                        let HourIntro = [
                            Prefix.commonPrayer + "ThanksGivingPart1&D=$copticFeasts.AnyDay",
                            Prefix.commonPrayer + "ThanksGivingPart2&D=$copticFeasts.AnyDay",
                            Prefix.commonPrayer + "ThanksGivingPart3&D=$copticFeasts.AnyDay",
                            Prefix.commonPrayer + "ThanksGivingPart4&D=$copticFeasts.AnyDay",
                            Prefix.bookOfHours + "Psalm50&D=$copticFeasts.AnyDay",
                        ], endOfHourPrayersSequence = [
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
                        if (btn.prayersArray !== bookOfHours.FirstHourPrayersArray
                            && btn.prayersArray !== bookOfHours.TwelvethHourPrayersArray) {
                            //If its is not the 1st Hour (Dawn) or the 12th Hour (Night), we insert only Kyrielison 41 times, and "Holy Lord of Sabaot" and "Our Father Who Art In Heavean"
                            btn.prayersSequence.splice(btn.prayersSequence.length - 2, 0, KyrielisonIntro, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven);
                        }
                        if (btn.prayersArray === bookOfHours.FirstHourPrayersArray) {
                            //If it is the 1st hour (Dawn) prayer:
                            //We add the psalms borrowed from the 6ths and 9th hour: Psalms 66, 69, 122 etc.), before pasalm 142
                            let DawnPsalms = [62, 66, 69, 112];
                            let psalm142 = btn.prayersSequence.indexOf(Prefix.bookOfHours + "Psalm142&D=$copticFeasts.AnyDay");
                            DawnPsalms
                                .reverse()
                                .forEach(title => btn.prayersSequence.splice(psalm142, 0, titleTemplate.replace('&D=', 'Psalm' + title.toString() + '&D=')));
                            btn.prayersSequence.splice(btn.prayersSequence.length - 2, 0, ...endOfHourPrayersSequence);
                        }
                        if (btn.prayersArray === bookOfHours.TwelvethHourPrayersArray)
                            //It is the 12th (Night) Hour
                            btn.prayersSequence.splice(btn.prayersSequence.length - 2, 0, ...[...endOfHourPrayersSequence].splice(0, 1)); //we remove the Angels Prayer from endOfHourPrayersSequence
                    })();
                })();
            }
        })();
    },
});
const btnPsalmody = new Button({
    btnID: "btnPsalmody",
    label: {
        AR: "الإبصلمودية السنوية",
        FR: "Psalmodie",
    },
    languages: [...prayersLanguages],
    showPrayers: true,
    onClick: () => {
        btnPsalmody.prayersArray = PrayersArrays.psalmodyPrayersArray;
        btnPsalmody.prayersSequence = PsalmodyPrayersSequences.PsalmodyYear;
        if (Season === Seasons.KiahkWeek1 || Season === Seasons.KiahkWeek2)
            btnPsalmody.prayersSequence = PsalmodyPrayersSequences.PsalmodyKiahk;
    },
});
/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayers(liturgy) {
    //this function sets the date or the season for the Psalm response and the gospel response
    const prayersSequence = [
        Prefix.psalmResponse + "&D=",
        liturgy + "Psalm&D=",
        liturgy + "Gospel&D=",
        Prefix.gospelResponse + "&D=",
    ]; //This is the generic sequence for the prayers related to the lecture of the gospel at any liturgy (mass, incense office, etc.). The OnClick function triggered by the liturgy, adds the dates of the readings and of the psalm and gospel responses
    let date;
    let psalmResponse = prayersSequence[0], gospelResponse = prayersSequence[3];
    //setting the psalm and gospel responses
    (function setPsalmAndGospelResponses() {
        if (lordFeasts.indexOf(copticDate) > -1) {
            //This means we are on a Lord Feast, there is always a specific gospel and psalm response for these feasts, even when it falls during the Great Lent (Annonciation does sometimes)
            addDate(copticDate);
        }
        else if (Number(copticDay) === 29 &&
            [4, 5, 6].indexOf(Number(copticMonth)) < 0) {
            //we are on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast), and Touba and Amshir (they are excluded because they precede the annonciation)
            addDate(copticFeasts.theTwentyNinethOfCopticMonth);
        }
        else if (Season === Seasons.StMaryFast) {
            //we are during the Saint Mary Fast. There are diffrent gospel responses for Incense Dawn & Vespers
            if (todayDate.getHours() < 15) {
                gospelResponse === gospelResponse.replace("&D=", "Dawn&D=");
            }
            else {
                gospelResponse === gospelResponse.replace("&D=", "Vespers&D=");
            }
            addDate(Season);
        }
        else if ((Season === Seasons.KiahkWeek1 || Season === Seasons.KiahkWeek2) &&
            (Number(copticDay) < 28 ||
                (Number(copticDay) === 28 && todayDate.getHours() < 13))) {
            // we are during Kiahk month: the first 2 weeks have their own gospel response, and the second 2 weeks have another gospel response
            Season === Seasons.KiahkWeek1
                ? (gospelResponse = gospelResponse.replace("&D=", "1&D="))
                : (gospelResponse = gospelResponse.replace("&D=", "2&D="));
            addDate(Season);
        }
        else if (Season === Seasons.GreatLent) {
            //we are during the Great Lent period
            if (copticReadingsDate === copticFeasts.EndOfGreatLentFriday) {
                if (todayDate.getHours() > 15) {
                    //We are in the vespers of Lazarus Saturday
                    gospelResponse = gospelResponse.replace("&D=", "Vespers&D=");
                    addDate(copticFeasts.LazarusSaturday);
                }
                else {
                    //We are in the morning
                    addDate(copticFeasts.EndOfGreatLentFriday);
                }
            }
            else if (copticReadingsDate === copticFeasts.LazarusSaturday) {
                if (todayDate.getHours() < 15) {
                    //We are in the morning
                    addDate(copticFeasts.LazarusSaturday);
                }
                else {
                    //We are in the Vespers of the Palm Sunday
                    gospelResponse = gospelResponse.replace("&D=", "Vespers&D=");
                    addDate(copticFeasts.PalmSunday);
                }
            }
            else
                todayDate.getDay() === 0 || todayDate.getDay() === 6
                    ? (gospelResponse = gospelResponse.replace("&D=", "Sundays&D="))
                    : (gospelResponse = gospelResponse.replace("&D=", "Week&D="));
            addDate(Season);
        }
        else if (Season === Seasons.JonahFast) {
            gospelResponse = gospelResponse.replace("&D=", copticReadingsDate.split(Season)[1] + "&D=");
            addDate(Season);
        }
        else if (Season !== Seasons.NoSeason) {
            addDate(Season);
        }
        else if (Season === Seasons.NoSeason) {
            addDate(copticFeasts.AnyDay);
        }
    })();
    function addDate(date) {
        prayersSequence[0] = psalmResponse + date;
        prayersSequence[3] = gospelResponse + date;
    }
    return prayersSequence;
}
let btnsPrayersSequences = [];
let btns = [
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
async function redirectToAnotherMass(btns, position, btnsContainerID) {
    if (!position.el)
        return;
    let redirectTo = [];
    btns.map((btn) => {
        //for each button in the btns array, we will create a fake Button and will set its onClick property to a function that retrieves the text of the concerned mass
        let newBtn = new Button({
            btnID: "GoTo_" +
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
async function getGospelReadingAndResponses(liturgy, btn, container, gospelInsertionPoint) {
    if (!container)
        container = containerDiv;
    if (!btn.prayersArray)
        return console.log("the button passed as argument does not have prayersArray");
    if (!gospelInsertionPoint)
        gospelInsertionPoint = selectElementsByDataRoot(container, Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay", { equal: true })[0];
    //We start by inserting the standard Gospel Litany
    (function insertGospelLitany() {
        let gospelLitanySequence = [
            Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay",
        ]; //This is the sequence of the Gospel Prayer/Litany for any liturgy
        let gospelLitanyPrayers = gospelLitanySequence.map((title) => findTableInPrayersArray(title, PrayersArrays.CommonPrayersArray));
        if (!gospelLitanyPrayers || gospelLitanyPrayers.length === 0)
            return;
        insertPrayersAdjacentToExistingElement({
            tables: gospelLitanyPrayers,
            languages: prayersLanguages,
            position: {
                beforeOrAfter: "beforebegin",
                el: gospelInsertionPoint,
            },
            container: container,
        });
    })();
    if (new Map(JSON.parse(localStorage.showActors)).get("Diacon") === false)
        return alert("Diacon Prayers are set to hidden, we cannot show the gospel"); //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers
    let anchorDataRoot = Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay";
    let gospelIntroduction = selectElementsByDataRoot(container, anchorDataRoot, {
        equal: true,
    });
    if (gospelIntroduction.length === 0)
        return console.log("gospelIntroduction.length = 0 ", gospelIntroduction);
    let responses = setGospelPrayers(liturgy); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']
    //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
    let date = copticReadingsDate;
    if (liturgy === Prefix.gospelVespers) {
        date = btnReadingsGospelIncenseVespers.onClick({ returnDate: true });
    }
    let gospel = btn.prayersArray.filter((table) => splitTitle(table[0][0])[0] === responses[1] + date || //this is the pasalm text
        splitTitle(table[0][0])[0] === responses[2] + date //this is the gospel itself
    ); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####". We should get a string[][][] of 2 elements: a table for the Psalm, and a table for the Gospel
    if (gospel.length === 0)
        return console.log("gospel.length = 0"); //if no readings are returned from the filtering process, then we end the function
    /**
     * Appends the gospel and psalm readings before gospelInsertionPoint(which is an html element)
     */
    (function insertPsalmAndGospel() {
        gospel.forEach((table) => {
            let el; //this is the element before which we will insert the Psaml or the Gospel
            if (splitTitle(table[0][0])[0].includes("Gospel&D="))
                //This is the Gospel itself, we insert it before the gospel response
                el = gospelInsertionPoint;
            else if (splitTitle(table[0][0])[0].includes("Psalm&D="))
                el = gospelIntroduction[gospelIntroduction.length - 1];
            if (!el)
                return;
            insertPrayersAdjacentToExistingElement({
                tables: [table],
                languages: btn.languages,
                position: {
                    beforeOrAfter: "beforebegin",
                    el: el,
                },
                container: container,
            });
        });
    })();
    (function insertPsalmAndGospelResponses() {
        //Inserting the gospel response
        insertGospelOrPsalmResponse(3, Prefix.gospelResponse, gospelInsertionPoint);
        //We remove the insertion point placeholder
        gospelInsertionPoint.remove();
        let gospelPrayer = selectElementsByDataRoot(container, Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay", { equal: true }); //This is the 'Gospel Litany'. We will insert the Psalm response after its end
        if (!gospelPrayer)
            return;
        insertGospelOrPsalmResponse(0, Prefix.psalmResponse, gospelPrayer[gospelPrayer.length - 2].nextElementSibling);
    })();
    function insertGospelOrPsalmResponse(index, prefix, insertion) {
        let response = PrayersArrays.PsalmAndGospelPrayersArray.find((tbl) => tbl[0][0].split("&D=")[0] === responses[index].split("&D=")[0] &&
            selectFromMultiDatedTitle(tbl[0][0], responses[index].split("&D=")[1])); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (!response || response.length === 0)
            //If no specresponse response is found, we will get the 'annual' gospel response
            response = PrayersArrays.PsalmAndGospelPrayersArray.find((tbl) => splitTitle(tbl[0][0])[0] === prefix + "&D=$copticFeasts.AnyDay");
        if (!response || response.length === 0)
            return;
        insertPrayersAdjacentToExistingElement({
            tables: [response],
            languages: prayersLanguages,
            position: {
                beforeOrAfter: "beforebegin",
                el: insertion,
            },
            container: container,
        });
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
function showFractionPrayersMasterButton(btn, anchor, label, masterBtnID, prayersArray) {
    let filtered = new Set();
    if (Number(copticDay) === 29 && Number(copticMonth) !== 4)
        filterPrayersArray(copticFeasts.theTwentyNinethOfCopticMonth, prayersArray, filtered); //We start by adding the fraction of the 29th of each coptic month if we are on the 29th of the month
    //console.log('filteredSet = ', filtered)
    filterPrayersArray(copticDate, prayersArray, filtered); //we then add the fractions (if any) having the same date as the current copticDate
    filterPrayersArray(Season, prayersArray, filtered); //We then add the fractions (if any) having a date = to the current Season
    filterPrayersArray(copticFeasts.AnyDay, prayersArray, filtered); //We finally add the fractions having as date copticFeasts.AnyDay
    function filterPrayersArray(date, prayersArray, filtered) {
        prayersArray.map((table) => {
            if (selectFromMultiDatedTitle(table[0][0], date) === true &&
                !filtered.has(table))
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
function getBtnGospelPrayersArray(btn, readingsArray) {
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
function selectFromMultiDatedTitle(tableTitle, coptDate = copticDate) {
    if (!tableTitle.includes("&D="))
        return false;
    tableTitle = splitTitle(tableTitle)[0].split("&D=")[1];
    let dates = tableTitle.split("||");
    let parseDate = dates.map((date) => {
        if (date.startsWith("$"))
            date = eval(date.replace("$", ""));
        if (!date)
            return false;
        if (date === coptDate)
            return true;
        else
            return false;
    });
    if (parseDate.includes(true))
        return true;
    else
        return false;
}
/**
 * Inserts the Incense Office Doxologies And Cymbal Verses according to the Coptic feast or season
 * @param {HTMLElement | DocumentFragment} container - The HtmlElement in which the btn prayers are displayed and to which they are appended
 */
async function insertCymbalVersesAndDoxologies(btn) {
    if (!btn.docFragment)
        return console.log("btn.docFragment is undefined = ", btn.docFragment);
    (async function InsertCymbalVerses() {
        let cymbalsPlaceHolder = selectElementsByDataRoot(btn.docFragment, Prefix.commonIncense + "CymbalVersesPlaceHolder&D=$copticFeasts.AnyDay", { equal: true })[0];
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
        let feast;
        feast = Object.entries(copticFeasts).find((entry) => entry[1] === copticDate); //We check if today is a feast
        if (!feast)
            feast = Object.entries(copticFeasts).find((entry) => entry[1] === copticReadingsDate); //We also check by the copticReadingsDate because some feast are referrenced by the copticReadings date : eg. Pntl39
        if (!feast)
            feast = Object.entries(Seasons).find((entry) => entry[1] === Season);
        if (feast)
            insertFeastInSequence(sequence, feast[1], 1);
        let cymbals = [];
        let cymbalTable;
        sequence.map((cymbalsTitle) => {
            if (cymbalsTitle.startsWith("&Insert="))
                //i.e., if this is the placeholder element that we inserted for the current feast or Season
                cymbalTable = PrayersArrays.CymbalVersesPrayersArray.find((tbl) => selectFromMultiDatedTitle(tbl[0][0], cymbalsTitle.split("&Insert=")[1]));
            else
                cymbalTable = findTableInPrayersArray(cymbalsTitle, PrayersArrays.CymbalVersesPrayersArray, { equal: true });
            if (cymbalTable)
                cymbals.push(cymbalTable);
        });
        if (cymbals.length < 1)
            return console.log("cymbals= ", cymbals);
        insertPrayersAdjacentToExistingElement({
            tables: cymbals,
            languages: btn.languages,
            position: {
                beforeOrAfter: "beforebegin",
                el: cymbalsPlaceHolder.nextElementSibling,
            },
            container: btn.docFragment,
        });
    })();
    (async function InsertCommonDoxologies() {
        let doxologiesPlaceHolder = selectElementsByDataRoot(btn.docFragment, Prefix.commonIncense + "DoxologiesPlaceHolder&D=$copticFeasts.AnyDay", { equal: true })[0];
        if (!doxologiesPlaceHolder)
            return console.log("Didn't find doxologiesPlaceholder");
        if (!doxologiesPlaceHolder)
            return;
        let sequence = [
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
        let feast;
        //if the copticDate is a feast
        let excludeFeast = [
            saintsFeasts.StMaykel,
            saintsFeasts.StMarc,
            saintsFeasts.StGeorge,
            saintsFeasts.StMina,
        ]; //Those saints feast will be excluded because the doxologies of those saints are included by default
        if (excludeFeast.indexOf(copticDate) < 0)
            feast = Object.entries(saintsFeasts).find((entry) => entry[1] === copticDate);
        if (feast)
            insertFeastInSequence(sequence, feast[1], 1);
        if (excludeFeast.indexOf(copticDate) > 0) {
            //If today is the feast of the saints included in excludeFeast. ! Notice that we start from 1 not from 0 because 0 is St. Maykel feast and it is already the first doxology in the saints doxologies
            let doxologyIndex = excludeFeast.indexOf(copticDate) + 2;
            sequence.splice(2, 0, sequence[doxologyIndex]); //We insert the doxology after St. Maykel doxology
            sequence.splice(doxologyIndex + 1, 1); //We remove the original doxolgoy from the sequence
        }
        feast = Object.entries(copticFeasts).find((entry) => entry[1] === copticDate);
        //Else if the copticReadingsDate is a feast
        if (!feast)
            feast = Object.entries(copticFeasts).find((entry) => entry[1] === copticReadingsDate);
        if (!feast)
            feast = Object.entries(Seasons).find((entry) => entry[1] === Season);
        if (feast)
            insertFeastInSequence(sequence, feast[1], 0);
        let doxologies = [];
        sequence.map((doxologyTitle) => {
            if (doxologyTitle.startsWith("&Insert="))
                PrayersArrays.DoxologiesPrayersArray.filter((tbl) => selectFromMultiDatedTitle(tbl[0][0], doxologyTitle.split("&Insert=")[1])).forEach((doxology) => doxologies.push(doxology));
            //!CAUTION: we must use 'filter' not 'find' because for certain feasts there are more than one doxology
            else
                doxologies.push(findTableInPrayersArray(doxologyTitle, PrayersArrays.DoxologiesPrayersArray, { equal: true }));
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
                el: doxologiesPlaceHolder.nextElementSibling,
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
    function insertFeastInSequence(sequence, feastString, index) {
        if (lordFeasts.indexOf(feastString) < 0 &&
            Season !== Seasons.PentecostalDays)
            sequence.splice(index, 0, "&Insert=" + feastString);
        else
            sequence.splice(index, 1, "&Insert=" + feastString);
    }
}
async function removeElementsByTheirDataRoot(container = containerDiv, dataRoot) {
    selectElementsByDataRoot(container, dataRoot, { equal: true }).forEach((el) => el.remove());
}
/**
 * Adds a button that when clicked shows or hides certain prayers from containerDiv
 * @param {HTMLElement} insertion - the html element before which the button will be inserted
 * @param {string} btnID - the id of the html element button that will be created
 * @param {typeBtnLabel} label - the label of the button that will be created
 * @param {string[][][]} prayers - the prayers that will shown or hidden or shown
 * @returns {HTMLDivElement} - the created div element that contains the prayers, and will be hidden or shown when the button is clicked
 */
function addExpandablePrayer(args) {
    // if(!prayers || prayers.length ===0) return console.log(prayers);
    if (!args.insertion)
        return console.log("btnID = ", args.btnID);
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
    function createBtnAndExpandableDiv() {
        let createdButton = createBtn({
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
            .filter((child) => isTitlesContainer(child))
            .forEach((child) => {
            addDataGroupsToContainerChildren(child.classList[child.classList.length - 1], prayersContainerDiv);
        });
        return [createdButton, prayersContainerDiv];
    }
    async function btnOnClick() {
        let prayersContainerDiv = containerDiv.querySelector("#" + btnExpand.btnID + "Expandable");
        if (!prayersContainerDiv)
            return console.log("no collapsable div was found");
        prayersContainerDiv.classList.toggle(hidden);
        //Making the children classList match prayersContainerDiv classList
        if (prayersContainerDiv.classList.contains(hidden))
            hideOrShowAllTitlesInAContainer(prayersContainerDiv, true);
        else
            hideOrShowAllTitlesInAContainer(prayersContainerDiv, false);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUJ1dHRvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL0RlY2xhcmVCdXR0b25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sTUFBTTtJQWlCVixZQUFZLEdBQWU7UUFYbkIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQVlsQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7UUFDNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDcEIsR0FBRyxDQUFDLFFBQVE7WUFDVixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNB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