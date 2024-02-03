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
        if (localStorage.editingMode === "true")
            btnMain.children.push(getEditModeButton());
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
        //We will remove the Vespers Button during if we are during the Great Lent or the Jonah Fast, and we are not a Saturday
        if ((Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
            weekDay !== 6)
            btnIncenseOffice.children = btnIncenseOffice.children.filter((btn) => btn !== btnIncenseVespers);
        if (args.returnBtnChildren)
            return btnIncenseOffice.children;
    },
});
const btnIncenseDawn = new Button({
    btnID: "btnIncenseDawn",
    label: {
        AR: "بخور باكر",
        FR: "Encens Aube",
    },
    showPrayers: true,
    languages: [...prayersLanguages],
    docFragment: new DocumentFragment(),
    onClick: () => {
        btnIncenseDawn.children = [btnReadingsGospelIncenseDawn];
        if (Season === Seasons.GreatLent || Season === Seasons.JonahFast)
            btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn); //We add the prophecies button during the Great Leant and Jonah Fast
        btnIncenseDawn.prayersSequence = [...IncensePrayersSequence].filter((title) => !title.startsWith(Prefix.incenseVespers)); //We will remove all the Incense Vespers titles from the prayersSequence Array
        if (weekDay === 6)
            //If we are a Saturday, we pray only the 'Departed Litany', we will hence remove the 'Sick Litany' and the 'Travellers Litany'
            btnIncenseDawn.prayersSequence.splice(btnIncenseDawn.prayersSequence.indexOf(Prefix.incenseDawn + "SickPrayer&D=$copticFeasts.AnyDay"), 3, //We remove the SickPrayer, the TravelersParayer and the Oblations Prayer
            Prefix.incenseVespers + "DepartedPrayer&D=$copticFeasts.AnyDay");
        else if (weekDay === 0 || lordFeasts.includes(copticDate))
            //If we are a Sunday or the day is a Lord's Feast, or the oblation is present, we remove the 'Travellers Litany' and keep the 'Sick Litany' and the 'Oblation Litany'
            btnIncenseDawn.prayersSequence = btnIncenseDawn.prayersSequence.filter((tbl) => !tbl[0][0].startsWith(Prefix.incenseDawn + "TravelersPrayer&D=$copticFeasts.AnyDay"));
        scrollToTop();
        return btnIncenseDawn.prayersSequence;
    },
    afterShowPrayers: async (btn = btnIncenseDawn, gospelPrefix = Prefix.gospelDawn, gospelArray = ReadingsArrays.GospelDawnArray) => {
        let btnDocFragment = btn.docFragment;
        insertCymbalVersesAndDoxologies(btn);
        getGospelReadingAndResponses({
            liturgy: gospelPrefix,
            btn: {
                prayersArray: gospelArray,
                languages: getLanguages(PrayersArraysKeys.find((array) => array[0] === gospelPrefix)[1]),
            },
            container: btnDocFragment,
            isMass: true,
            clearContainer: false,
        });
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
            if (weekDay > 0 && weekDay < 6) {
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
            if (btn !== btnIncenseDawn)
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
                prayers: DoxologiesPrayersArray.filter((table) => table[0][0].startsWith(Prefix.doxologies + "AdamDawn")),
                languages: btnIncenseDawn.languages,
            })[1];
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
        scrollToTop();
        return btnIncenseVespers.prayersSequence;
    },
    afterShowPrayers: async () => {
        btnIncenseDawn.afterShowPrayers(btnIncenseVespers, Prefix.gospelVespers, ReadingsArrays.GospelVespersArray);
    },
});
const btnMassStCyril = new Button({
    btnID: "btnMassStCyril",
    label: { AR: "كيرلسي", FR: "Saint Cyril", EN: "St Cyril" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
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
        //We create a list of the masses to which we will insert redirection button
        let massButtons = [
            btnMassStBasil,
            btnMassStGregory,
            btnMassStCyril,
            btnMassStJohn,
        ];
        massButtons.splice(massButtons.indexOf(btn), 1); //We remove the btn of the mass from the redirection list
        massButtons.splice(massButtons.indexOf(btnMassStJohn), 1); //We remove the mass of st John
        let btnDocFragment = btn.docFragment;
        (function insertReconcilationEnd() {
            //We insert the sequence with which the reconciliation ends
            let anchor = selectElementsByDataRoot(btnDocFragment, "Reconciliation&D=", { includes: true });
            if (!anchor || anchor.length < 1)
                return console.log("didn't find anchor");
            insertPrayersAdjacentToExistingElement({
                tables: [
                    findTableInPrayersArray(Prefix.massCommon + "EndOfReconciliation&D=$copticFeasts.AnyDay", MassCommonPrayersArray, { equal: true }),
                ],
                languages: prayersLanguages,
                position: {
                    beforeOrAfter: "beforebegin",
                    el: anchor[anchor.length - 1].nextElementSibling,
                },
                container: btnDocFragment,
            });
        })();
        (function insertStBasilSecondReconciliationBtn() {
            if (btn !== btnMassStBasil)
                return;
            let secondBasilReconciliation = findTableInPrayersArray(Prefix.massStBasil + "Reconciliation2", MassStBasilPrayersArray, { startsWith: true });
            if (!secondBasilReconciliation)
                return console.log("Didn't find reconciliation");
            let htmlBtn = addExpandablePrayer({
                insertion: selectElementsByDataRoot(btnDocFragment, Prefix.massStBasil + "Reconciliation&D=$copticFeasts.AnyDay", { equal: true })[0].nextElementSibling,
                btnID: "secondStBasilReconciliation",
                label: {
                    AR: secondBasilReconciliation[0][2],
                    FR: secondBasilReconciliation[0][4],
                },
                prayers: [secondBasilReconciliation],
                languages: btn.languages,
            })[0];
            htmlBtn.addEventListener("click", () => {
                Array.from(containerDiv.children)
                    .filter((row) => row.dataset.group &&
                    row.dataset.group ===
                        Prefix.massStBasil + "Reconciliation&D=$copticFeasts.AnyDay")
                    .forEach((row) => row.classList.toggle(hidden));
                //    insertReconcilationEnd();
            });
        })();
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
            let spasmos = MassCommonPrayersArray.find((tbl) => tbl[0][0].startsWith(spasmosTitle) &&
                isMultiDatedTitleMatching(tbl[0][0], Season));
            if (!spasmos)
                return console.log("didn't find spasmos with title = ", spasmosTitle);
            let anchor = selectElementsByDataRoot(btnDocFragment, anchorTitle, {
                startsWith: true,
            })[0]; //!In the St Basil Mass, there are 2 Reconciliation prayers, each having its own
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
        (function insertLitaniesIntroductionFromOtherMasses() {
            if (btn !== btnMassStBasil)
                return; //This button appears only in St Basil Mass
            let litaniesIntro = findTableInPrayersArray(Prefix.massStGregory + "LitaniesIntroduction", MassStGregoryPrayersArray, { startsWith: true }) || undefined;
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
            litaniesIntro = findTableInPrayersArray(Prefix.massStCyril + "LitaniesIntroduction", MassStCyrilPrayersArray, { startsWith: true });
            if (!litaniesIntro.length)
                console.log("Did not find the St Cyril Litanies Introduction");
            if (litaniesIntro) {
                litaniesIntro = structuredClone(litaniesIntro).splice(litaniesIntro.length - 1, 1); //We remove the last row in the table of litaniesIntro because it is the "As it were, let it always be.../كما كان هكذا يكون/tel qu'il fût ainsi soit-il..."
            }
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
        showFractionPrayersMasterButton(btn, selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay", { equal: true })[0], { AR: "صلوات القسمة", FR: "Oraisons de la Fraction" }, "btnFractionPrayers", FractionsPrayersArray);
        (function insertCommunionChants() {
            //Inserting the Communion Chants after the Psalm 150
            let psalm = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay", { equal: true });
            let filtered = CommunionPrayersArray.filter((tbl) => isMultiDatedTitleMatching(tbl[0][0], copticDate) === true ||
                isMultiDatedTitleMatching(tbl[0][0], Season) === true);
            if (filtered.length === 0)
                filtered = CommunionPrayersArray.filter((tbl) => isMultiDatedTitleMatching(tbl[0][0], copticFeasts.AnyDay) === true);
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
        scrollToTop(); //scrolling to the top of the page
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
        //Adding children buttons to btnMassUnBaptised
        btnMassUnBaptised.children = [
            ...btnDayReadings.onClick({ returnBtnChildren: true }),
        ];
        btnMassUnBaptised.children = btnMassUnBaptised.children.filter((btn) => ![
            btnReadingsGospelIncenseDawn,
            btnReadingsGospelIncenseVespers,
            btnReadingsGospelNight,
            btnReadingsPropheciesDawn,
        ].includes(btn));
        btnMassUnBaptised.prayersSequence = [
            ...MassPrayersSequences.MassUnbaptized,
        ];
        //Replacing AllelujaFayBabi according to the day
        (function replaceAllelujahFayBabi() {
            if ((Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
                weekDay !== 0 &&
                weekDay !== 6) {
                //Inserting "Alleluja E Ikhon" before "Allelujah Fay Bibi"
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 2, Prefix.massCommon + "HallelujahFayBiBiGreatLent&D=$Seasons.GreatLent");
                //Removing "Allelujah Fay Bibi" and "Allelujha Ge Ef Mev'i"
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 1);
            }
            else if ((isFast && weekDay !== 0 && weekDay !== 6) ||
                (Season === Seasons.NoSeason && (weekDay === 3 || weekDay === 5))) {
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
        (function insertHisFoundationsInTheHolyMountain() {
            if (![Seasons.GreatLent, Seasons.JonahFast].includes(Season))
                return;
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
        })();
        let readingsAnchor = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "ReadingsPlaceHolder&D=&D=$copticFeasts.AnyDay", { equal: true })[0]; //this is the html element before which we will insert all the readings and responses
        (function insertIntercessionsHymns() {
            let seasonalIntercessions = MassCommonPrayersArray.filter((table) => table[0][0].includes("ByTheIntercessionOf") &&
                (isMultiDatedTitleMatching(table[0][0], copticDate) ||
                    isMultiDatedTitleMatching(table[0][0], Season)));
            if (seasonalIntercessions.length < 1)
                return console.log("No Seasonsal Intercession Hymns");
            let stMary = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "ByTheIntercessionOfStMary&D=$copticFeasts.AnyDay", { equal: true });
            if (!stMary)
                return;
            insertPrayersAdjacentToExistingElement({
                tables: getUniqueValuesFromArray(seasonalIntercessions.reverse()),
                languages: getLanguages(getArrayNameFromArray(MassCommonPrayersArray)),
                position: {
                    beforeOrAfter: "afterend",
                    el: stMary[stMary.length - 1],
                },
                container: btnDocFragment,
            });
        })();
        (function insertStPaulReading() {
            insertMassReading(Prefix.stPaul, ReadingsArrays.StPaulArray, ReadingsIntrosAndEnds.stPaulIntro, ReadingsIntrosAndEnds.stPaulEnd);
        })();
        (function insertKatholikon() {
            insertMassReading(Prefix.katholikon, ReadingsArrays.KatholikonArray, ReadingsIntrosAndEnds.katholikonIntro, ReadingsIntrosAndEnds.katholikonEnd);
        })();
        (function insertPraxis() {
            (function insertPraxisResponse() {
                //!Caution, we must start by inserting the Praxis Response before inserting the Praxis reading
                let annualResponseHTML = insertPrayersAdjacentToExistingElement({
                    tables: [
                        findTableInPrayersArray(Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay", PraxisResponsesPrayersArray, { equal: true }) || undefined,
                    ],
                    languages: getLanguages(PrayersArraysKeys.find((array) => array[2]() === PraxisResponsesPrayersArray)[1]),
                    position: {
                        beforeOrAfter: "beforebegin",
                        el: readingsAnchor,
                    },
                    container: btnDocFragment,
                })[0];
                let specialResponse = PraxisResponsesPrayersArray.filter((table) => isMultiDatedTitleMatching(table[0][0], copticDate) ||
                    isMultiDatedTitleMatching(table[0][0], Season));
                if (specialResponse.length === 0)
                    return console.log("Did not find any specific praxis response");
                if (Season === Seasons.GreatLent) {
                    //If a Praxis response was found
                    // The query should yield to  2 tables ('Sundays', and 'Week') for this season. We will keep the relevant one accoding to the date
                    if (weekDay === 0 || weekDay === 6)
                        specialResponse = [
                            specialResponse.find((table) => table[0][0].includes("Sundays&D=")),
                        ];
                    else
                        specialResponse = [
                            specialResponse.find((table) => table[0][0].includes("Week&D=")),
                        ];
                }
                //We insert the special response between the first and 2nd rows
                let specialResponseHTML = insertPrayersAdjacentToExistingElement({
                    tables: getUniqueValuesFromArray(specialResponse),
                    languages: prayersLanguages,
                    position: {
                        beforeOrAfter: "beforebegin",
                        el: annualResponseHTML[2], //This is the 'Ek Esmaroot' part of the annual response
                    },
                    container: btnDocFragment,
                });
                //We move 'Sheri Ne Maria' after the title of the special response
                specialResponseHTML[0][0].insertAdjacentElement("afterend", annualResponseHTML[1]);
                //We remove the title of the annual response
                annualResponseHTML[0].remove();
            })();
            ///Then we insert the Praxis reading
            insertMassReading(Prefix.praxis, ReadingsArrays.PraxisArray, ReadingsIntrosAndEnds.praxisIntro, ReadingsIntrosAndEnds.praxisEnd);
        })();
        (function insertSepcialAgiosIfFeast() {
            let Agios, oldAgios = selectElementsByDataRoot(btnDocFragment, Prefix.commonPrayer + "HolyGodHolyPowerfull&D=$copticFeasts.AnyDay", { equal: true });
            if (!oldAgios || oldAgios.length < 1)
                return console.log("did not find Agios");
            if (Season === Seasons.Nativity)
                Agios = "Agios&D=$Seasons.Nativity";
            else if (Season === Seasons.PentecostalDays)
                Agios = "Agios&D=$Seasons.PentecostalDays";
            else if (Season === Seasons.Baptism)
                Agios = "Agios&D=Seaons.Baptism";
            else if (Season === Seasons.CrossFeast)
                Agios = "Agios&D=Seaons.CrossFeast";
            if (!Agios)
                return;
            Agios = Prefix.massCommon + Agios;
            let AgiosTable = findTableInPrayersArray(Agios, MassCommonPrayersArray, {
                equal: true,
            }) || undefined;
            if (!AgiosTable)
                return console.log("Didn't find the special Agios table in PrayersArray");
            if (Number(copticReadingsDate.split(Seasons.PentecostalDays)[1]) > 39) {
                //We are between the Pentecoste & the Assumption feasts
                let raisedAndAscended = findTableInPrayersArray(oldAgios[1].id, PrayersArray, { equal: true })[3]; //This is the 3rd paragraph of the ordinary Agios Osios Hymn ('For He Raised and Ascended to the Heaveans'...etc.)
                if (!raisedAndAscended)
                    return;
                for (let i = 1; i < 4; i++)
                    AgiosTable.splice(AgiosTable.length - i, 1, raisedAndAscended);
            }
            insertPrayersAdjacentToExistingElement({
                tables: [AgiosTable],
                languages: getLanguages(getArrayNameFromArray(MassCommonPrayersArray)),
                position: {
                    beforeOrAfter: "beforebegin",
                    el: oldAgios[0],
                },
                container: btnDocFragment,
            });
            oldAgios.forEach((div) => div.remove());
        })();
        (function insertSynaxarium() {
            let intro = ReadingsIntrosAndEnds.synaxariumIntro;
            intro.AR.replace("theday", Number(copticDay).toString()).replace("themonth", copticMonths[Number(copticMonth)].AR);
            intro.FR = intro.FR.replace("theday", Number(copticDay).toString()).replace("themonth", copticMonths[Number(copticMonth)].FR);
            intro.EN.replace("theday", Number(copticDay).toString()).replace("themonth", copticMonths[Number(copticMonth)].EN);
            insertMassReading(Prefix.synaxarium, ReadingsArrays.SynaxariumArray, intro, undefined, copticDate); //!Caution: we must pass the copticDate for the 'date' argument, otherwise it will be set to the copticReadingsDate by default, and we will get the wrong synaxarium
            //We will reverse the langauges
            let introHTML = selectElementsByDataRoot(btnDocFragment, Prefix.synaxarium + "&D=" + copticDate, { equal: true })[1];
            introHTML.children[0].insertAdjacentElement("beforebegin", introHTML.children[1]);
        })();
        (function insertGospelReading() {
            getGospelReadingAndResponses({
                liturgy: Prefix.gospelMass,
                btn: {
                    prayersArray: ReadingsArrays.GospelMassArray,
                    languages: getLanguages(PrayersArraysKeys.find((array) => array[0] === Prefix.gospelMass)[1]),
                },
                container: btnDocFragment,
                isMass: true,
                clearContainer: false,
            });
        })();
        (async function insertBookOfHoursButton() {
            if ([
                copticFeasts.Resurrection,
                copticFeasts.Nativity,
                copticFeasts.Baptism,
            ].includes(copticReadingsDate))
                //In these feasts we don't pray any hour
                return alert("We do not pray the Book of Hours prayers on the Ressurection, Nativity (Kiahk 29th), and Baptism (Toubi 11th) feasts' masses");
            let hoursBtns = btnBookOfHours.onClick(true); //We get buttons for the relevant hours according to the day
            if (!hoursBtns)
                return;
            hoursBtns = selectRelevantHoursAccordingToTheDay();
            function selectRelevantHoursAccordingToTheDay() {
                //args.mass is a boolean that tells whether the button prayersArray should include all the hours of the Book Of Hours, or only those pertaining to the mass according to the season and the day on which the mass is celebrated
                let hours = [hoursBtns[1], hoursBtns[2], hoursBtns[3]]; //Those are the 3rd, 6th and 9th hours
                if ([
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
                //We remove the 9th hour in the following days/periods
                [0, 6].includes(weekDay) || //Whatever the period, if we are a Saturday or a Sunday, we pray only the 3rd and 6th Hours
                    lordFeasts.includes(copticDate) || //This is a Lord Feast. We remove the 9th hour
                    [
                        Seasons.Nativity,
                        Seasons.Baptism,
                        Seasons.PentecostalDays,
                        Seasons.Nayrouz,
                        Seasons.CrossFeast,
                    ].includes(Season) || //These are feast/joyfull seasons
                    (!isFast && ![3, 5].includes(weekDay)) //We are not during a feast or joyfull season, but we are not neither a Wednesday nor a Firday
                )
                    hours.pop(); //we remove the 9th hour
                return hours;
            }
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
                if (localStorage.displayMode === displayModes[1])
                    //If we are in the 'Presentation Mode', we remove all the psalms and keep only the Gospel and the Litanies
                    btn.prayersSequence
                        .filter((title) => title.includes("Psalm"))
                        .forEach((title) => btn.prayersSequence.splice(btn.prayersSequence.indexOf(title), 1));
                let btnPrayers = btn.prayersSequence.map((title) => findTableInPrayersArray(title, getTablesArrayFromTitlePrefix(title))); //We create an array containing all the tables includes in the button's prayersSequence.
                //We will create an 'expandable' html button and div for the hour button
                let createdElements = addExpandablePrayer({
                    insertion: btnDocFragment.children[0],
                    btnID: btn.btnID,
                    label: btn.label,
                    prayers: btnPrayers,
                    languages: btnBookOfHours.languages,
                });
                addOnClickToHourBtn(createdElements[0]); //This is the button that will show or hid each hour's button
                btnsDiv.appendChild(createdElements[0]); //We add all the buttons to the same div instead of 3 divs;
                collapseAllTitles(Array.from(createdElements[1].children)); //We collapse all the titles
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
                insertCommonPrayer(hourBtn, sequence, hourBtn.prayersSequence.find((title) => title.includes("HourLitanies&D=")));
                function insertCommonPrayer(btn, titles, litanies) {
                    if (!titles || titles.length === 0)
                        return console.log("no sequence");
                    btn.prayersSequence.splice(btn.prayersSequence.indexOf(litanies) + 1, 0, ...titles);
                }
            }
        })();
        function insertMassReading(readingPrefix, readingArray, readingIntro, readingEnd, date = copticReadingsDate) {
            let readings, language = getLanguages(PrayersArraysKeys.find((array) => array[0] === readingPrefix)[1]);
            readings = fetchMassReadingOtherThanGospel(readingPrefix, readingArray, { beforeOrAfter: "beforebegin", el: readingsAnchor }, btnDocFragment, false, date);
            if (readings.length === 0)
                return;
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
                    languages: language,
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
                    languages: language,
                    position: { beforeOrAfter: "beforebegin", el: readingsAnchor },
                    container: btnDocFragment,
                });
        }
        //Collapsing all the Titles
        collapseAllTitles(Array.from(btnDocFragment.children));
        let BOHMasterButton = btnDocFragment.getElementById("masterBOHBtn");
        if (BOHMasterButton)
            BOHMasterButton.classList.toggle(hidden); //We remove hidden from btnsDiv
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
const btnReadingsGospelIncenseVespers = new Button({
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
const btnReadingsGospelIncenseDawn = new Button({
    btnID: "btnReadingsGospelIncenseDawn",
    label: {
        AR: "إنجيل باكر",
        FR: "Evangile Aube",
        EN: "Gospel Dawn",
    },
    showPrayers: true,
    onClick: (gospelPrefix = Prefix.gospelDawn) => {
        let prayersArray = PrayersArraysKeys.find((entry) => entry[0] === gospelPrefix);
        if (!prayersArray)
            return;
        containerDiv.innerHTML = "";
        getGospelReadingAndResponses({
            liturgy: gospelPrefix,
            btn: {
                prayersArray: prayersArray[2](),
                languages: getLanguages(prayersArray[1]),
            },
            container: containerDiv,
            isMass: false,
            clearContainer: true,
        });
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
    onClick: () => {
        btnReadingsGospelIncenseDawn.onClick(Prefix.gospelNight, ReadingsArrays.GospelNightArray);
    },
});
const btnReadingsPropheciesDawn = new Button({
    btnID: "btnReadingsPropheciesDawn",
    label: {
        AR: "نبوات باكر",
        FR: "Propheties Matin",
    },
    showPrayers: true,
    onClick: () => {
        fetchMassReadingOtherThanGospel(Prefix.propheciesDawn, ReadingsArrays.PropheciesDawnArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true);
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnDayReadings = new Button({
    btnID: "btnDayReadings",
    label: {
        AR: "قراءات اليوم",
        FR: "Lectures du jour",
        EN: "Day's Readings",
    },
    onClick: (args = { returnBtnChildren: false }) => {
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
                    fetchMassReadingOtherThanGospel(Prefix.stPaul, ReadingsArrays.StPaulArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true);
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
                    fetchMassReadingOtherThanGospel(Prefix.katholikon, ReadingsArrays.KatholikonArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true);
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
                    fetchMassReadingOtherThanGospel(Prefix.praxis, ReadingsArrays.PraxisArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true);
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
                onClick: function () {
                    fetchMassReadingOtherThanGospel(Prefix.synaxarium, ReadingsArrays.SynaxariumArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true, copticDate); //!CAUTION: notice that we passed to the function the readingDate argument because during the GreatLent period and the Jonah Fast, the copticReadingsDate is formatted like 'GL10', we hence pass the copticDate to prevent the function from searching for the Synaxarium of the day by the copticReadingsDate
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
                    btnReadingsGospelIncenseDawn.onClick(Prefix.gospelMass, ReadingsArrays.GospelMassArray);
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
            if (Season !== Seasons.GreatLent ||
                copticReadingsDate === copticFeasts.Resurrection)
                return;
            (function ifWeAreNotASaturday() {
                if (weekDay === 6)
                    return;
                //We remove the Vespers because there are no Vespers during the Great Lent except for Saturday
                btnDayReadings.children = btnDayReadings.children.filter((btn) => btn !== btnIncenseVespers);
                //If we are a Sunday and the GospelNight button is not included, we will add it.
                if (weekDay === 0 &&
                    !btnDayReadings.children.includes(btnReadingsGospelNight))
                    btnDayReadings.children.push(btnReadingsGospelNight);
                (function ifWeAreNotASunday() {
                    if (weekDay === 0)
                        return;
                    //If we are not a Sunday (i.e., we are during any week day other than Sunday and Saturday), we will  add the Prophecies button to the list of buttons
                    if (!btnDayReadings.children.includes(btnReadingsPropheciesDawn))
                        btnDayReadings.children.unshift(btnReadingsPropheciesDawn);
                    //Also if we  are not a Sunday, we will remove the Night Gospel, if included
                    btnDayReadings.children = btnDayReadings.children.filter((btn) => btn !== btnReadingsGospelNight);
                })();
            })();
        })();
        if (args.returnBtnChildren)
            return btnDayReadings.children;
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
            Object.entries(bookOfHours).forEach((entry) => {
                let hourName = entry[0];
                let hourBtn = new Button({
                    btnID: "btn" + hourName,
                    label: entry[1][1],
                    languages: btnBookOfHours.languages,
                    showPrayers: true,
                    onClick: (isMass = false) => hourBtnOnClick(hourBtn, hourName, isMass),
                    afterShowPrayers: () => Array.from(containerDiv.querySelectorAll(".Row")).forEach((htmlRow) => {
                        htmlRow.classList.replace("Priest", "NoActor");
                        htmlRow.classList.replace("Diacon", "NoActor");
                        htmlRow.classList.replace("Assembly", "NoActor");
                    }),
                });
                btnBookOfHours.children.push(hourBtn);
            });
            //Adding the onClick() property to the button
            function hourBtnOnClick(btn, hourName, isMass) {
                (function buildBtnPrayersSequence() {
                    let titleTemplate = Prefix.bookOfHours + "&D=$copticFeasts.AnyDay";
                    //We will add the prayers sequence to btn.prayersSequence[]
                    btn.prayersSequence = Object.entries(bookOfHours)
                        .find((entry) => entry[0] === hourName)[1][0]
                        .map((title) => titleTemplate.replace("&D=", "Psalm" + title.toString() + "&D="));
                    ["Gospel", "Litanies"].forEach((title) => btn.prayersSequence.push(titleTemplate.replace("&D=", hourName + title + "&D=")));
                    btn.prayersSequence.unshift(titleTemplate.replace("&D=", hourName + "Title" + "&D=")); //This is the title of the hour prayer
                    //Then, we add the End of all Hours' prayers (ارحمنا يا الله ثم ارحمنا) except for the 1st and 2nd services of the Midnight Prayer
                    (function addFinalPrayersToSequence() {
                        if (isMass)
                            return; //!Important: If the onClick() method is called when the button is displayed in the Unbaptised Mass, we do not add anything else to the btn's prayersSequence
                        let HourIntro = [
                            Prefix.commonPrayer +
                                "ThanksGivingPart1&D=$copticFeasts.AnyDay",
                            Prefix.commonPrayer +
                                "ThanksGivingPart2&D=$copticFeasts.AnyDay",
                            Prefix.commonPrayer +
                                "ThanksGivingPart3&D=$copticFeasts.AnyDay",
                            Prefix.commonPrayer +
                                "ThanksGivingPart4&D=$copticFeasts.AnyDay",
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
                        if (btn.label === bookOfHours.TwelvethHour[1])
                            endOfHourPrayersSequence.splice(0, 1); //If it is the 12th (Night) Hour, we remove the Angels Prayer from endOfHourPrayersSequence
                        if (btn.label === bookOfHours.MidNight3Hour[1]) {
                            endOfHourPrayersSequence = [
                                Kyrielison41Times,
                                Agios,
                                OurFatherWhoArtInHeaven,
                                titleTemplate.replace("&D=", hourName + "2ndGospel" + "&D="),
                                Creed,
                                KyrielisonIntro,
                                Kyrielison41Times,
                                HolyLordOfSabaot,
                                OurFatherWhoArtInHeaven,
                            ];
                        }
                        btn.prayersSequence.splice(1, 0, ...HourIntro); //We  add the titles of the HourIntro before the 1st element of btn.prayersSequence[]
                        if ([
                            bookOfHours.FirstHour[1],
                            bookOfHours.TwelvethHour[1],
                            bookOfHours.MidNight3Hour[1],
                        ].includes(btn.label)) {
                            //If it is the 1st hour (Dawn) or the 12th Hour (Nighth) prayer: We add the End Of Hour Prayers
                            btn.prayersSequence.push(...endOfHourPrayersSequence);
                        }
                        else {
                            //If its is not the 1st Hour (Dawn) or the 12th Hour (Night), we insert only Kyrielison 41 times, and "Holy Lord of Sabaot" and "Our Father Who Art In Heavean"
                            btn.prayersSequence.push(KyrielisonIntro, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven);
                        }
                        if (btn.label === bookOfHours.VeilHour[1]) {
                            //If we are in the Setar Hour, we need to remove from Psalm 118 all the paragraphs except paragraphs 20, 21, and 22. We will do this by adding a btn.afterShowPlayers function
                            btn.afterShowPrayers = () => {
                                let psalm118 = Array.from(containerDiv.children).filter((child) => child.dataset.root.startsWith(Prefix.bookOfHours + "Psalm118"));
                                psalm118
                                    .filter((div) => psalm118.indexOf(div) > 0 && psalm118.indexOf(div) < 20)
                                    .forEach((div) => div.remove());
                            };
                        }
                        if (![
                            bookOfHours.MidNight1Hour[1],
                            bookOfHours.MidNight2Hour[1],
                        ].includes(btn.label))
                            btn.prayersSequence.push(titleTemplate.replace("&D=", hourName + "EndOfHourPrayer" + "&D="), AllHoursFinalPrayer);
                    })();
                })();
            }
        })();
        if (returnBtnChildren)
            return btnBookOfHours.children;
        scrollToTop();
        return btnBookOfHours.prayersSequence;
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
function fetchMassReadingOtherThanGospel(readingPrefix, readingArray, position, container = containerDiv, clearContainer = false, readingDate) {
    //@ts-ignore
    if (clearContainer)
        container.innerHTML = "";
    if (container.children.length === 0)
        container.appendChild(document.createElement("div"));
    if (!position.el)
        position.el = container.children[0];
    if (!position.beforeOrAfter)
        position.beforeOrAfter = "beforebegin";
    if (!readingDate)
        readingDate = copticReadingsDate;
    let reading = readingArray.find((table) => table[0][0].includes("&D=" + readingDate));
    if (!reading)
        return console.log("Did not find a reading for the current copticReadingsDate");
    return insertPrayersAdjacentToExistingElement({
        tables: [reading],
        languages: getLanguages(PrayersArraysKeys.find((array) => array[0] === readingPrefix)[1]),
        position: position,
        container: containerDiv,
    });
}
/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayersSequence(liturgy, isMass) {
    //this function sets the date or the season for the Psalm response and the gospel response
    const prayersSequence = [
        Prefix.psalmResponse + "&D=$copticFeasts.AnyDay",
        liturgy + "Psalm&D=",
        liturgy + "Gospel&D=",
        Prefix.gospelResponse + "&D=$copticFeasts.AnyDay", //This is its default value
    ]; //This is the generic sequence for the prayers related to the lecture of the gospel at any liturgy (mass, incense office, etc.). The OnClick function triggered by the liturgy, adds the dates of the readings and of the psalm and gospel responses
    if (!isMass)
        return prayersSequence; //If we are not calling the function within a mass liturgy, we will not need to set the Psalm and Gospel Responses, we will return the prayersSequence array
    //setting the psalm and gospel responses
    (function setPsalmAndGospelResponses() {
        if (Number(copticDay) === 29 && [4, 5, 6].includes(Number(copticMonth)))
            return; //we are on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast), and Touba and Amshir (they are excluded because they precede the annonciation)
        let PsalmAndGospelResponses = PsalmAndGospelPrayersArray.filter((table) => isMultiDatedTitleMatching(table[0][0], copticDate) ||
            isMultiDatedTitleMatching(table[0][0], Season));
        let psalmResponse = PsalmAndGospelResponses.filter((table) => table[0][0].startsWith(Prefix.psalmResponse));
        let gospelResponse = PsalmAndGospelResponses.filter((table) => table[0][0].startsWith(Prefix.gospelResponse));
        if (Season === Seasons.StMaryFast) {
            //we are during the Saint Mary Fast. There are diffrent gospel responses for Incense Dawn & Vespers
            todayDate.getHours() < 15
                ? (gospelResponse = [
                    gospelResponse.find((table) => table[0][0].includes("Dawn&D=")),
                ])
                : (gospelResponse = [
                    gospelResponse.find((table) => table[0][0].includes("Vespers&D=")),
                ]);
        }
        else if ([
            copticFeasts.EndOfGreatLentFriday,
            copticFeasts.LazarusSaturday,
        ].includes(copticReadingsDate) &&
            todayDate.getHours() > 15) {
            gospelResponse = [
                gospelResponse.find((table) => table[0][0].includes("Vespers&D=")),
            ];
        }
        else if (Season === Seasons.GreatLent) {
            [0, 6].includes(weekDay)
                ? (gospelResponse = [
                    gospelResponse.find((table) => table[0][0].includes("Sundays&D=")),
                ])
                : (gospelResponse = gospelResponse =
                    [gospelResponse.find((table) => table[0][0].includes("Week&D="))]);
        }
        else if (Season === Seasons.JonahFast) {
            gospelResponse = [
                gospelResponse.find((table) => table[0][0].includes(copticReadingsDate.split(Season)[1] + "&D=")),
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
async function getGospelReadingAndResponses(args) {
    if (!args.container)
        args.container = containerDiv;
    if (args.container === containerDiv && args.clearContainer)
        args.container.innerHTML = "";
    if (args.container.children.length === 0)
        args.container.appendChild(document.createElement("div"));
    if (!args.btn.prayersArray)
        return console.log("the button passed as argument does not have prayersArray");
    if (!args.btn.languages)
        args.btn.languages = getLanguages(getArrayNameFromArray(args.btn.prayersArray));
    if (!args.gospelInsertionPoint)
        args.gospelInsertionPoint = selectElementsByDataRoot(args.container, Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay", { equal: true })[0];
    //We start by inserting the standard Gospel Litany
    (function insertGospelLitany() {
        if (!args.isMass)
            return;
        let gospelLitanySequence = [
            Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay",
        ]; //This is the sequence of the Gospel Prayer/Litany for any liturgy
        let gospelLitanyPrayers = gospelLitanySequence.map((title) => findTableInPrayersArray(title, CommonPrayersArray));
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
    if (args.isMass &&
        new Map(JSON.parse(localStorage.showActors)).get("Diacon") === false)
        return alert("Diacon Prayers are set to hidden, we cannot show the gospel"); //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers
    let anchorDataRoot = Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay";
    let gospelIntroduction = selectElementsByDataRoot(args.container, anchorDataRoot, { equal: true });
    if (args.isMass && gospelIntroduction.length === 0)
        return console.log("gospelIntroduction.length = 0 ", gospelIntroduction);
    let prayersSequence = setGospelPrayersSequence(args.liturgy, args.isMass); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']
    //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
    let date = copticReadingsDate;
    if (args.liturgy === Prefix.gospelVespers) {
        date = getTomorowCopticReadingDate();
        console.log(date);
    }
    let gospel = args.btn.prayersArray.filter((table) => splitTitle(table[0][0])[0] === prayersSequence[1] + date || //this is the pasalm text
        splitTitle(table[0][0])[0] === prayersSequence[2] + date //this is the gospel itself
    ); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####". We should get a string[][][] of 2 elements: a table for the Psalm, and a table for the Gospel
    if (gospel.length === 0)
        return console.log("gospel.length = 0"); //if no readings are returned from the filtering process, then we end the function
    /**
     * Appends the gospel and psalm readings before gospelInsertionPoint(which is an html element)
     */
    (function insertPsalmAndGospel() {
        if (!args.isMass) {
            containerDiv.append(document.createElement("div"));
            args.gospelInsertionPoint = containerDiv.children[0];
        }
        gospel.forEach((table) => {
            let el; //this is the element before which we will insert the Psaml or the Gospel
            if (!args.isMass || splitTitle(table[0][0])[0].includes("Gospel&D="))
                //This is the Gospel itself, we insert it before the gospel response
                el = args.gospelInsertionPoint;
            else if (splitTitle(table[0][0])[0].includes("Psalm&D="))
                el = gospelIntroduction[gospelIntroduction.length - 1];
            if (!el)
                return;
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
        if (!args.isMass)
            return;
        //Inserting the gospel response
        insertResponse(3, args.gospelInsertionPoint);
        //We remove the insertion point placeholder
        args.gospelInsertionPoint.remove();
        let gospelPrayer = selectElementsByDataRoot(args.container, Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay", { equal: true }); //This is the 'Gospel Litany'. We will insert the Psalm response after its end
        if (!gospelPrayer)
            return;
        insertResponse(0, gospelPrayer[gospelPrayer.length - 1]
            .previousElementSibling); //Inserting Psalm Response if any
        function insertResponse(index, insertion) {
            let response = PsalmAndGospelPrayersArray.find((tbl) => splitTitle(tbl[0][0])[0] === prayersSequence[index]); //!Caution: this must be an '===' search operator not startWith() because otherwise, 'NativitayParamoun' will be selected for the 'Nativity' Season, and 'Baptism Paramoun' might be selected for the 'Baptism' Season if their tables in PrayersArray are before those of the relevant table
            if (!response || response.length === 0)
                return;
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
    function getTomorowCopticReadingDate() {
        let today = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).
        return getSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today.getTime(), false)[1], today);
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
    if (Number(copticDay) === 29 && ![4, 5, 6].includes(Number(copticMonth)))
        filterPrayersArray(copticFeasts.Coptic29th, prayersArray, filtered); //We start by adding the fraction of the 29th of each coptic month if we are on the 29th of the month
    //console.log('filteredSet = ', filtered)
    filterPrayersArray(copticDate, prayersArray, filtered); //we then add the fractions (if any) having the same date as the current copticDate
    filterPrayersArray(Season, prayersArray, filtered); //We then add the fractions (if any) having a date = to the current Season
    filterPrayersArray(copticFeasts.AnyDay, prayersArray, filtered); //We finally add the fractions having as date copticFeasts.AnyDay
    function filterPrayersArray(date, prayersArray, filtered) {
        prayersArray.map((table) => {
            if (!table)
                return;
            if (isMultiDatedTitleMatching(table[0][0], date) === true &&
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
function isMultiDatedTitleMatching(tableTitle, coptDate = copticDate) {
    if (!tableTitle.includes("&D="))
        return false; //This means that the title does not specify any date for the prayer.
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
function dateIsRelevant(date, coptDate = copticDate) {
    if (date.startsWith("$"))
        date = eval(date.replace("$", ""));
    if (!date)
        return console.log("date is not valid: ", date);
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
async function insertCymbalVersesAndDoxologies(btn) {
    if (!btn.docFragment)
        return console.log("btn.docFragment is undefined = ", btn.docFragment);
    let dayFeasts = (() => {
        let feast = [];
        let relevant = Object.entries(copticFeasts).find((entry) => [copticDate, copticReadingsDate].includes(entry[1])); //We check if today is a feast. We also check by the copticReadingsDate because some feast are referrenced by the copticReadings date : eg. Pntl39
        if (relevant)
            feast.push(relevant[1]); //We push the date
        relevant = Object.entries(Seasons).find((entry) => entry[1] === Season); //We check also for the season
        if (Season !== Seasons.NoSeason)
            feast.push(Season); //We also push the Season
        if (feast.length > 0)
            return getUniqueValuesFromArray(feast);
    })();
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
        //If we are during any of the Lord Feasts (or any season where we follow the same pattern), we add "Jesus Christ is the same for ever...",
        if ([...lordFeasts, copticFeasts.Coptic29th].includes(copticDate) ||
            [Seasons.Nativity, Seasons.Baptism, Seasons.PentecostalDays].includes(Season))
            sequence.push(Prefix.cymbalVerses + "LordFeastsEnd&D=$copticFeasts.AnyDay");
        if (weekDay > 2)
            sequence[0] = sequence[0].replace("Wates&D", "Adam&D");
        if (dayFeasts)
            dayFeasts.forEach((feast) => [
                ...lordFeasts,
                Seasons.Nativity,
                Seasons.Baptism,
                Seasons.PentecostalDays,
            ].includes(feast) //During Seasons.Nativity (i.e., between Nativity and Circumcision) and Seasons.Baptism(from Baptism to Cana Wedding), the Cymbals verses follow the pattern of any Lord Feast: it starts with "Amoyni Marin..." or "Ten O'osht", then the cymbal verses of the feast, and finally, the "Eb'oro enti ti hirini". We will hence remove the 2nd element from the sequence
                ? insertFeastInSequence(sequence, feast, 1, 1)
                : insertFeastInSequence(sequence, feast, 1, 0)); //We always start with 'Amoyni Marin...' or with 'Tin O'osht...', so we will insert the feast element before the 2nd element, and will not delete anything
        let cymbals = processSequence(sequence, CymbalVersesPrayersArray);
        if (cymbals.length < 1)
            return console.log("no cymbals were found by the provided sequence: ", sequence);
        insertPrayersAdjacentToExistingElement({
            tables: getUniqueValuesFromArray(cymbals),
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
        if (btn === btnIncenseVespers)
            sequence[0] = sequence[0].replace("Dawn", "Vespers");
        let excludedFeasts = [
            saintsFeasts.StMaykel,
            saintsFeasts.StMarc,
            saintsFeasts.StGeorge,
            saintsFeasts.StMina,
        ]; //Those saints feast will be excluded because the doxologies of those saints are already included by default
        if (dayFeasts) {
            let index = 2;
            dayFeasts.forEach((feast) => {
                if ([
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
                ].includes(feast))
                    index = 0; //If one of the dates in feast[] corresponds to a one of th 'Lord's Feasts', it means we are in a Lord Feast. the doxologies of the feast will be placed at the begining of the doxologies. We follow the same rule for the doxologies of the PentecostalDays and the month of Kiahk
                else if (excludedFeasts.includes(feast)) {
                    let feastIndex = sequence.indexOf(feast);
                    sequence.splice(2, 0, sequence[feastIndex]); //If it is one of the doxologies already included by default, we place it after St. Maykel
                    sequence.splice(feastIndex + 1, 1); //We then delete the element itself
                    index = undefined; //We set index to undefined in order to prevent insertFeastSequence from inserting any element in sequence
                }
                else if (AngelsFeasts.includes(feast))
                    index = 1;
                insertFeastInSequence(sequence, feast, index, 0);
            });
        }
        let doxologies = processSequence(sequence, DoxologiesPrayersArray);
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
            tables: getUniqueValuesFromArray(doxologies),
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
     * @param {string} feastDate - the string representing the feast or the season
     * @param {number} index - the index at which the new placeholder element will be inserted.
     */
    function insertFeastInSequence(sequence, feastDate, index, remove) {
        if (!index && index !== 0)
            return;
        sequence.splice(index, remove, "&Insert=" + feastDate);
    }
    /**
     * Searchs in tablesArray for the tables matching each title in sequence, which is a string[] of titles, and returns a string[][][] of the tables found in the
     * @param {string[]} sequence - An arry of titles that we will be looking for tables matching each of them in tablesArray[][]
     * @param {string[][][]} tablesArray - The array containg the text tables in which we will be looking for the tables[][] having titles matching the titles in sequence[]
     * @returns {string[][][]} - an array of the tables[][] found
     */
    function processSequence(sequence, tablesArray) {
        let tables = [];
        sequence.map((title) => {
            if (title.startsWith("&Insert="))
                tablesArray
                    //!CAUTION: we must use 'filter' not 'find' because for certain feasts there are more than one doxology
                    .filter((tbl) => isMultiDatedTitleMatching(tbl[0][0], title.split("&Insert=")[1]))
                    .forEach((tbl) => tables.push(tbl));
            else
                tables.push(findTableInPrayersArray(title, tablesArray, {
                    equal: true,
                }));
        });
        return tables;
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