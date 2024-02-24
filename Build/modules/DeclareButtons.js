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
}
const btnMainMenu = new Button({
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
        if (localStorage.editingMode === "true")
            btnMainMenu.children.push(getEditModeButton());
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
            //We create html elements representing each of btnMain children. The created buttons will be appended to containerDiv directly
            btnMainMenu.children
                .map((btn) => {
                createMainPageButton(btn) //We create an HTML button 
                    .style.backgroundImage =
                    images[btnMainMenu.children.indexOf(btn)]; //We give it as background image, an image from the images list
            });
            function getBtnsDiv() {
                let btnsDiv = document.createElement('div');
                btnsDiv.id = 'btnsMainPageDiv';
                btnsDiv.style.display = 'grid';
                btnsDiv.style.gridTemplateColumns = ((100 / 3).toString() + "% ").repeat(3);
                containerDiv.appendChild(btnsDiv);
                return btnsDiv;
            }
            function createMainPageButton(btn) {
                let btnsDiv = containerDiv.querySelector('#btnsMainPageDiv');
                if (!btnsDiv)
                    btnsDiv = getBtnsDiv();
                return createBtn({
                    btn: btn,
                    btnsContainer: btnsDiv,
                    btnClass: "mainPageBtns",
                    clear: false,
                    onClick: () => onClickBtnFunction(btn),
                });
            }
            function onClickBtnFunction(btn) {
                if (!btn.children || btn.children.length === 0)
                    btn.onClick(true); //if btn doesn't have childre, we call its onClick() function beacuse the children of some btns are added when tis function is called. We pass 'true' as argument, because it makes the function return the children and do not execute until its end
                let parentHtmlBtn = containerDiv.querySelector("#" + btn.btnID);
                let backgroundImage;
                if (parentHtmlBtn)
                    backgroundImage = parentHtmlBtn.style.backgroundImage;
                (function showBtnPrayers() {
                    if (btn.children && !btn.prayersSequence)
                        return showChildButtons();
                    // if (!btn.prayersSequence || btn.prayersSequence.length < 1) return;
                    showChildButtonsOrPrayers(btn, true); //If btn does not have children, it means that it shows prayers. We pass it to showChildButtonsOrPrayers
                })();
                function showChildButtons() {
                    if (btn.children.length < 1)
                        return;
                    containerDiv.innerHTML = "";
                    btn.children
                        //for each child button of btn
                        .forEach((childBtn) => {
                        childBtn.parentBtn = btn;
                        //We create an html element representing this button and give it 'mainPageBtns', and append it to containerDiv. It will have as background, the same image as the background image of btn
                        createMainPageButton(childBtn)
                            .style.backgroundImage = backgroundImage;
                    });
                    let goBackBtns = [btnGoToPreviousMenu, btnMainMenu];
                    if (goBackBtns.includes(btn))
                        return;
                    goBackBtns
                        .forEach(btn => createMainPageButton(btn)
                        .style.backgroundImage = images[0]); //Finlay, we create an extra html button for btnGoToPreviousMenu and btnMainMenu, in order for the user to be able to navigate back to the btnMain menu of buttons
                }
                ;
            }
        })();
    },
});
const btnGoToPreviousMenu = new Button({
    btnID: "btnGoBack",
    label: { AR: "السابق", FR: "Retour", EN: "Go Back" },
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnMass = new Button({
    btnID: "btnMass",
    label: { AR: "القداسات", FR: "Messes" },
    onClick: (returnBtnChildren = false) => {
        btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
        if (returnBtnChildren)
            return btnMass.children;
    },
});
const btnIncenseOffice = new Button({
    btnID: "btnIncenseOffice",
    label: {
        AR: "رفع بخور باكر أو عشية",
        FR: "Office des Encens Aube et Vêpres",
    },
    onClick: (returnBtnChildren = false) => {
        //setting the children of the btnIncenseOffice. This must be done by the onClick() in order to reset them each time the button is clicked
        btnIncenseOffice.children = [btnIncenseDawn, btnIncenseVespers];
        //show or hide the PropheciesDawn button if we are in the Great Lent or JonahFast:
        //We will remove the Vespers Button during if we are during the Great Lent or the Jonah Fast, and we are not a Saturday
        if ((Season === Seasons.GreatLent || Season === Seasons.JonahFast) &&
            weekDay !== 6)
            btnIncenseOffice.children = btnIncenseOffice.children.filter((btn) => btn !== btnIncenseVespers);
        if (returnBtnChildren)
            return btnIncenseOffice.children;
    },
});
const btnIncenseDawn = new Button({
    btnID: "btnIncenseDawn",
    label: {
        AR: "بُخُورِ بَاكِرِ",
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
            prayersArray: gospelArray,
            languages: getLanguages(PrayersArraysKeys.find((array) => array[0] === gospelPrefix)[1]),
            container: btnDocFragment,
            isMass: true,
            clearContainer: false,
        });
        (function hideGodHaveMercyOnUsIfBishop() {
            let dataRoot = Prefix.commonPrayer +
                "PrayThatGodHaveMercyOnUs&D=$copticFeasts.AnyDay";
            let godHaveMercyHtml = selectElementsByDataSetValue(btnDocFragment, dataRoot, { startsWith: true }); //We select all the paragraphs not only the paragraph for the Bishop
            godHaveMercyHtml
                .filter((htmlRow) => godHaveMercyHtml.indexOf(htmlRow) > 0 &&
                godHaveMercyHtml.indexOf(htmlRow) !== godHaveMercyHtml.length - 2)
                .forEach((htmlRow) => htmlRow.remove());
            let godHaveMercy = findTable(dataRoot, CommonPrayersArray); //We get the entier table not only the second row. Notice that the first row of the table is the row containing the title
            if (!godHaveMercy)
                return console.log("Didn't find table Gode Have Mercy");
            addExpandablePrayer({
                insertion: godHaveMercyHtml[0].nextElementSibling,
                btnID: "godHaveMercy",
                label: {
                    AR: godHaveMercy[1][2],
                    FR: godHaveMercy[1][1], //this is the French text of the label
                },
                prayers: [godHaveMercy.slice(1, 4)],
                languages: btnMassUnBaptised.languages,
                dataGroup: dataRoot,
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
                    let efnotiNaynan = selectElementsByDataSetValue(btnDocFragment, Prefix.commonPrayer + "EfnotiNaynan&D=$copticFeasts.AnyDay", undefined, 'group');
                    let insertion = efnotiNaynan[efnotiNaynan.length - 1].nextSibling; //This is the end of the efnotiNaynan
                    let godHaveMercy = findTable(Prefix.incenseDawn + "GodHaveMercyOnUs&D=$Seasons.GreatLent", IncensePrayersArray);
                    if (!godHaveMercy)
                        return console.log("Didn't find God Have Mercy for Great Lent");
                    insertPrayersAdjacentToExistingElement({
                        tables: [godHaveMercy],
                        languages: prayersLanguages,
                        position: { beforeOrAfter: "beforebegin", el: insertion },
                        container: btnDocFragment,
                    });
                    let refrains = selectElementsByDataSetValue(btnDocFragment, Prefix.incenseDawn + "GodHaveMercyOnUsRefrain&D=$Seasons.GreatLent")
                        .filter((htmlRow) => htmlRow.classList.contains("Title"));
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
        AR: "بُخُورِ عَشِيَّةَ",
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
const btnMassStGregory = new Button({
    btnID: "btnMassStGregory",
    label: { AR: "غريغوري", FR: "Saint Gregory" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        //Setting the standard mass prayers sequence
        btnMassStGregory.prayersSequence = [
            ...MassPrayersSequences.MassStGregory,
            ...MassPrayersSequences.MassCallOfHolySpirit,
            ...MassPrayersSequences.MassLitanies,
            ...MassPrayersSequences.Communion,
        ];
        //removing irrelevant prayers from the array
        btnMassStGregory.prayersSequence.splice(btnMassStGregory.prayersSequence.indexOf(Prefix.massCommon + "CallOfTheHolySpiritPart1&D=$copticFeasts.AnyDay"), 9);
        scrollToTop();
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
        let redirectToList = [
            btnMassStBasil,
            btnMassStGregory,
            btnMassStCyril,
            btnMassStJohn,
        ];
        redirectToList.splice(redirectToList.indexOf(btn), 1); //We remove the btn of the mass from the redirection list
        redirectToList.splice(redirectToList.indexOf(btnMassStJohn), 1); //We remove the mass of st John
        let btnDocFragment = btn.docFragment;
        (function insertStBasilSecondReconciliationBtn() {
            if (btn !== btnMassStBasil)
                return;
            let secondBasilReconciliation = findTable(Prefix.massStBasil + "Reconciliation2&D=$copticFeasts.AnyDay", MassStBasilPrayersArray);
            if (!secondBasilReconciliation)
                return console.log("Didn't find reconciliation");
            let htmlBtn = addExpandablePrayer({
                insertion: selectElementsByDataSetValue(btnDocFragment, Prefix.massStBasil + "Reconciliation&D=$copticFeasts.AnyDay")[0].nextElementSibling,
                btnID: "secondStBasilReconciliation",
                label: {
                    FR: secondBasilReconciliation[0][2],
                    AR: secondBasilReconciliation[0][4],
                },
                prayers: [secondBasilReconciliation],
                languages: btn.languages,
            })[0];
            htmlBtn.addEventListener("click", () => {
                let dataGroup = Prefix.massStBasil + "Reconciliation&D=$copticFeasts.AnyDay";
                selectElementsByDataSetValue(containerDiv, dataGroup, undefined, 'group')
                    .forEach((row) => row.classList.toggle(hidden));
            });
        })();
        (function addRedirectionButtons() {
            //Adding 2 buttons to redirect the other masses at the begining of the Reconciliation
            redirectToAnotherMass([...redirectToList], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataSetValue(btnDocFragment, "Reconciliation&D=$copticFeasts.AnyDay", { includes: true })[0],
            }, "RedirectionToReconciliation");
            //Adding 2 buttons to redirect to the other masses at the Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon + "SpasmosAdamShort&D=$copticFeasts.AnyDay", { endsWith: true });
            redirectToAnotherMass([...redirectToList], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1],
            }, "RedirectionToAnaphora");
            //Adding 2 buttons to redirect to the other masses before Agios
            redirectToAnotherMass([...redirectToList], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataSetValue(btnDocFragment, getMassPrefix(btn.btnID) + "Agios&D=$copticFeasts.AnyDay")[0].previousElementSibling,
            }, "RedirectionToAgios");
            //Adding 2 buttons to redirect to the other masses before the Call upon the Holy Spirit
            redirectToAnotherMass([...redirectToList], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon +
                    "AssemblyResponseAmenAmenAmenWeProclaimYourDeath&D=$copticFeasts.AnyDay")[0],
            }, "RedirectionToLitanies");
            //Adding 2 buttons to redirect to the other masses before the Fraction Introduction
            redirectToAnotherMass([...redirectToList], {
                beforeOrAfter: "beforebegin",
                el: selectElementsByDataSetValue(btnDocFragment, "FractionIntroduction&D=$copticFeasts.AnyDay", { includes: true })[0],
            }, "RedirectionToFractionIntroduction");
        })();
        (function insertAdamAndWatesSpasmos() {
            //We insert it during the Saint Mary Fast and on every 21th of the coptic month
            let spasmosTitle = Prefix.massCommon + "SpasmosAdamLong";
            let anchorTitle = Prefix.massCommon + "DiaconResponseKissEachOther&D=$copticFeasts.AnyDay";
            insertSpasmos(spasmosTitle, selectElementsByDataSetValue(btnDocFragment, anchorTitle)[0]);
            anchorTitle = Prefix.massCommon + "SpasmosWatesShort&D=$copticFeasts.AnyDay";
            //Insert Wates Spasmoses
            insertSpasmos(spasmosTitle.replace("Adam", "Wates"), selectElementsByDataSetValue(btnDocFragment, anchorTitle)[0], true);
        })();
        function insertSpasmos(spasmosTitle, anchor, hideAnchor = false) {
            if (!anchor)
                return console.log('anhcor is not valid');
            let spasmos = MassCommonPrayersArray.find((tbl) => tbl[0][0].startsWith(spasmosTitle) &&
                isMultiDatedTitleMatching(tbl[0][0], Season));
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
                createdElements[0].addEventListener("click", () => selectElementsByDataSetValue(containerDiv, anchor.dataset.root).forEach((row) => row.classList.toggle(hidden)));
        }
        (function insertLitaniesIntroductionFromOtherMasses() {
            if (btn !== btnMassStBasil)
                return; //This button appears only in St Basil Mass
            let litaniesIntro = findTable(Prefix.massStGregory + "LitaniesIntroduction", MassStGregoryPrayersArray, { startsWith: true }) || undefined;
            if (!litaniesIntro)
                return console.log("Did not find the Litanies Introduction");
            let anchor = selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon + "LitaniesIntroduction&D=$copticFeasts.AnyDay")[0];
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
            litaniesIntro = findTable(Prefix.massStCyril + "LitaniesIntroduction", MassStCyrilPrayersArray, { startsWith: true });
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
        showFractionPrayersMasterButton(btn, Array.from(btnDocFragment.children)
            .find(child => child.id && child.id.startsWith(Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay")), { AR: "صلوات القسمة", FR: "Oraisons de la Fraction" }, "btnFractionPrayers", FractionsPrayersArray);
        (function insertCommunionChants() {
            //Inserting the Communion Chants after the Psalm 150
            let psalm = selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay");
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
        btnMassUnBaptised.children = btnMassUnBaptised.children.filter((btn) => ![
            btnReadingsGospelIncenseDawn,
            btnReadingsGospelIncenseVespers,
            btnReadingsGospelNight,
            btnReadingsPropheciesDawn,
        ].includes(btn));
        let btnsPrayersSequence = [
            ...MassPrayersSequences.MassUnbaptized,
        ];
        (function adaptFaybibiAndTayshoury() {
            btnMassUnBaptised.prayersSequence = adaptHallelujaFayBibiAndTayshoury();
            function adaptHallelujaFayBibiAndTayshoury() {
                //If we are not during a fast period or we are during a fast period but today is either Saturday or Sunday, or a Lord Feast, we will remove Hallelujah Ge Evmevi and Tishoury, in order to keep Hallelujah Faybibi and Tayshouri
                if (!isFast
                    ||
                        [0, 6].includes(weekDay)
                    ||
                        lordFeasts.find(date => [copticDate, copticReadingsDate].includes(date)))
                    return btnsPrayersSequence
                        .filter(title => ![Prefix.massCommon + "HallelujahFayBiBiFast&D=$copticFeasts.AnyDay", Prefix.massCommon + "Tishoury&D=$copticFeasts.AnyDay"].includes(splitTitle(title)[0]));
                //! If the function did not return before reaching this point, it means that are neccessarily on a fast day (isFast === true). This also necessarily means that we are not on the last day of Jonah Fast, because on this day, isFast is set to false
                if ([Seasons.GreatLent, Seasons.JonahFast].includes(Season)) {
                    //We are either during the week days of the Great Lent, or the 3 days of Jonah Fast
                    //Replacing "Halleljah Ge Evmevi" with "Halleluja E Ikhon"
                    btnsPrayersSequence[btnsPrayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBiFast&D=$copticFeasts.AnyDay")] = Prefix.massCommon + "HallelujahFayBiBi&D=$Seasons.GreatLent";
                }
                //We will remove 'Hellulja Fay Bibi'and keep only 'Hellulja Ge Evmev'i". We will also remove Tayshoury in order to keep only Tishoury 
                return btnsPrayersSequence
                    .filter(title => ![Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay", Prefix.massCommon + "Tayshoury&D=$copticFeasts.AnyDay"].includes(splitTitle(title)[0]));
            }
            ;
        })();
        (function insertHisFoundationsAndIGodHaveMercy() {
            if (!isFast || ![Seasons.GreatLent, Seasons.JonahFast].includes(Season))
                return; //The following only applies during the Great Lent the 3 days of Jonah Fast (not the 4th day) that's why we check if isFast === true
            btnMassUnBaptised.prayersSequence
                .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "AbsolutionForTheFather&D=$copticFeasts.AnyDay") + 1, //We insert it after "Sotis Ameen"
            0, Prefix.massCommon + "HisFoundations&D=$Seasons.GreatLent", Prefix.incenseDawn + "GodHaveMercyOnUsRefrain&D=$Seasons.GreatLent");
        })();
        scrollToTop();
        return btnMassUnBaptised.prayersSequence;
    },
    afterShowPrayers: () => {
        let btnDocFragment = btnMassUnBaptised.docFragment;
        (function hideGodHaveMercyOnUsIfBishop() {
            let dataRoot = Prefix.commonPrayer +
                "PrayThatGodHaveMercyOnUs&D=$copticFeasts.AnyDay";
            let godHaveMercyHtml = selectElementsByDataSetValue(btnDocFragment, dataRoot, { startsWith: true }); //We select all the paragraphs not only the paragraph for the Bishop
            godHaveMercyHtml
                .filter((div) => godHaveMercyHtml.indexOf(div) > 0 &&
                godHaveMercyHtml.indexOf(div) < godHaveMercyHtml.length - 1)
                .forEach((htmlRow) => htmlRow.remove());
            let godHaveMercy = findTable(dataRoot, CommonPrayersArray); //We get the entier table not only the second row. Notice that the first row of the table is the row containing the title
            if (!godHaveMercy)
                return console.log("Didn't find table Gode Have Mercy");
            addExpandablePrayer({
                insertion: godHaveMercyHtml[0].nextElementSibling,
                btnID: "godHaveMercy",
                label: {
                    AR: godHaveMercy[1][2],
                    FR: godHaveMercy[1][1], //this is the French text of the label
                },
                prayers: [godHaveMercy.slice(1, 4)],
                languages: btnMassUnBaptised.languages,
                dataGroup: dataRoot,
            });
        })();
        let readingsAnchor = selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon + "ReadingsPlaceHolder&D=$copticFeasts.AnyDay")[0]; //this is the html element before which we will insert all the readings and responses
        (function insertIntercessionsHymns() {
            let seasonalIntercessions = MassCommonPrayersArray.filter((table) => table[0][0].includes("ByTheIntercessionOf") &&
                (isMultiDatedTitleMatching(table[0][0], copticDate) ||
                    isMultiDatedTitleMatching(table[0][0], Season)));
            if (seasonalIntercessions.length < 1)
                return console.log("No Seasonsal Intercession Hymns");
            let stMary = selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon + "ByTheIntercessionOfStMary&D=$copticFeasts.AnyDay");
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
                        findTable(Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay", PraxisResponsesPrayersArray, { equal: true }) || undefined,
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
            let Agios = Prefix.massCommon + "Agios&D=$copticFeasts.";
            if ([copticFeasts.EntryToEgypt, copticFeasts.CanaWedding].includes(copticDate))
                Agios += Object.entries(copticFeasts).find(entry => entry[1] === copticDate)[0];
            else if ([copticFeasts.PalmSunday, copticFeasts.Ascension, copticFeasts.Pentecoste].includes(copticReadingsDate))
                Agios += Object.entries(copticFeasts).find(entry => entry[1] === copticReadingsDate)[0];
            else if ([Seasons.Nativity, Seasons.Baptism, Seasons.CrossFeast, Seasons.PentecostalDays].includes(Season))
                Agios = Agios.replace('copticFeasts', 'Seasons') + Object.entries(Seasons).find(entry => entry[1] === Season)[0];
            else
                Agios += "AnyDay";
            let AgiosTable = findTable(Agios, MassCommonPrayersArray, {
                equal: true,
            }) || undefined;
            if (!AgiosTable)
                return console.log("Didn't find the special Agios table in PrayersArray");
            (function adaptToAscension() {
                if (Season !== Seasons.PentecostalDays || Number(copticReadingsDate.split(Seasons.PentecostalDays)[1]) < 40)
                    return; //i.e. if we are between the Pentecoste & the Assumption feasts: day 40 to day 49
                let raisedAndAscended = findTable(Prefix.commonPrayer + "AgiosPart1&D=$copticFeasts.AnyDay", CommonPrayersArray, {
                    equal: true,
                })[3]; //This is the 3rd paragraph of the ordinary Agios Osios Hymn ('For He Raised and Ascended to the Heaveans'...etc.)
                if (!raisedAndAscended)
                    return;
                [4, 5, 6].forEach(index => AgiosTable[AgiosTable.length - index] = raisedAndAscended); //Replacing the 3 Agios paragraphs with the Ascension paragraph
            })();
            insertPrayersAdjacentToExistingElement({
                tables: [AgiosTable],
                languages: getLanguages(getArrayNameFromArray(MassCommonPrayersArray)),
                position: {
                    beforeOrAfter: "beforebegin",
                    el: readingsAnchor.nextElementSibling,
                },
                container: btnDocFragment,
            });
            //  oldAgios.forEach((div) => div.remove());
        })();
        (function insertSynaxarium() {
            let intro = { ...ReadingsIntrosAndEnds.synaxariumIntro };
            Object.entries(intro)
                .forEach(entry => intro[entry[0]] =
                entry[1]
                    .replace("theday", Number(copticDay).toString())
                    .replace("themonth", copticMonths[Number(copticMonth)][entry[0]]));
            insertMassReading(Prefix.synaxarium, ReadingsArrays.SynaxariumArray, intro, undefined, copticDate); //!Caution: we must pass the copticDate for the 'date' argument, otherwise it will be set to the copticReadingsDate by default, and we will get the wrong synaxarium
            //We will reverse the langauges
            let introHTML = selectElementsByDataSetValue(btnDocFragment, Prefix.synaxarium + "&D=" + copticDate)[1];
            if (!introHTML || introHTML.children.length < 1)
                return console.log('Didn\'t find the Synaxarium');
            introHTML.children[0].insertAdjacentElement("beforebegin", introHTML.children[0]);
        })();
        (function insertGospelReading() {
            getGospelReadingAndResponses({
                liturgy: Prefix.gospelMass,
                prayersArray: ReadingsArrays.GospelMassArray,
                languages: getLanguages(PrayersArraysKeys.find((array) => array[0] === Prefix.gospelMass)[1]),
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
            let masterBtnDiv, btnsDiv;
            (function createMasterButton() {
                masterBtnDiv = document.createElement("div"); //This is the div that will contain the master button which shows or hides the Book of Hours sub buttons
                masterBtnDiv.classList.add(inlineBtnsContainerClass);
                masterBtnDiv.id = "masterBOHBtn";
                btnsDiv = document.createElement("div"); //This is the div that contains the sub buttons for each Hour of the Book of Hours
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
                masterBtnDiv.prepend(createBtn({
                    btn: masterBtn,
                    btnsContainer: masterBtnDiv,
                    btnClass: inlineBtnClass,
                    clear: true,
                    onClick: masterBtn.onClick,
                })); //We add the master button to the bookOfHoursMasterDiv
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
                    let btnPrayers = btn.prayersSequence.map((title) => findTable(title, getTablesArrayFromTitlePrefix(title))); //We create an array containing all the tables includes in the button's prayersSequence.
                    //We will create an 'expandable' html button and div for the hour button
                    let createdElements = addExpandablePrayer({
                        insertion: btnDocFragment.children[0],
                        btnID: btn.btnID,
                        label: btn.label,
                        prayers: btnPrayers,
                        languages: btnBookOfHours.languages,
                    });
                    if (!createdElements[0])
                        return;
                    createdElements[0].addEventListener("click", () => hourBtnOnClick(createdElements[0].id)); //!Caution, we must ADD a new onClick eventListner because the created buton already have one attached to it when it was created by addExpandablePrayer(); 
                    btnsDiv.appendChild(createdElements[0]);
                    if (!createdElements[1])
                        return;
                    createdElements[1].dataset.group = createdElements[1].id;
                });
                //Finally we set the grid-Template for btnsDiv
                btnsDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsDiv, 3);
            })();
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
                else if (!isFast
                    ||
                        //We remove the 9th hour in the following days/periods
                        [0, 6].includes(weekDay) //Whatever the period, if we are a Saturday or a Sunday, we pray only the 3rd and 6th Hours
                )
                    hours.pop(); //we remove the 9th hour
                return hours;
            }
            ;
            async function hourBtnOnClick(hourBtnId) {
                let expandables = selectElementsByDataSetValue(containerDiv, 'HourExpandable', { endsWith: true }, 'group').filter(div => div.classList.contains('Expandable'));
                if (expandables.length < 1)
                    return;
                expandables
                    .forEach(expandable => expandable.id.startsWith(hourBtnId) ?
                    showOrHideHour(expandable)
                    : hideHour(expandable));
                function hideHour(expandable) {
                    if (expandable.classList.contains(hidden))
                        return;
                    expandable.classList.add(hidden);
                    Array.from(sideBarTitlesContainer.children)
                        .filter((div) => div.dataset.group === expandable.id)
                        .forEach(div => div.remove());
                }
                ;
                async function showOrHideHour(expandable) {
                    (async function showHour() {
                        if (expandable.classList.contains(hidden))
                            return;
                        let children = Array.from(expandable.children);
                        collapseAllTitles(children);
                        let rightSideBarTitles = await showTitlesInRightSideBar(children.filter(div => isTitlesContainer(div)).reverse(), undefined, false, expandable.id, false);
                        rightSideBarTitles
                            .forEach(titleDiv => titleDiv.classList.remove(hidden));
                        floatOnTop(btnsDiv, "5px"); //Making the hours buttons container float on top
                        masterBtnDiv.classList.add(hidden); //Hiding the master button
                        createFakeAnchor(expandable.id); //Jumbing to the begining of the expandable container
                    })();
                    (function hideHour() {
                        if (!expandable.classList.contains(hidden))
                            return;
                        btnsDiv.style.top = "";
                        btnsDiv.style.position = "";
                        masterBtnDiv.classList.remove(hidden);
                        createFakeAnchor(btnsDiv.id);
                        Array.from(sideBarTitlesContainer.children)
                            .filter((div) => div.dataset.group === expandable.id)
                            .forEach(div => div.remove());
                    })();
                }
                ;
            }
            ;
            function InsertHourFinalPrayers(hourBtn) {
                let Agios = Prefix.commonPrayer + "Agios&D=$copticFeasts.AnyDay", Kyrielison41Times = Prefix.commonPrayer + "Kyrielison41Times&D=$copticFeasts.AnyDay", KyrielisonIntro = Kyrielison41Times.replace("&D=", "NoMassIntro&D="), KyrielisonMassIntro = Kyrielison41Times.replace("&D=", "MassIntro&D="), HolyLordOfSabaot = Prefix.commonPrayer +
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
            readings = findMassReadingOtherThanGospel(readingPrefix, readingArray, { beforeOrAfter: "beforebegin", el: readingsAnchor }, btnDocFragment, false, date);
            if (!readings || readings.length === 0)
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
const btnMassBaptised = new Button({
    btnID: "btnMassBaptised",
    label: {
        AR: "قٌدَّاسِ المُؤْمِنينَ",
        FR: "Liturgie des Croyants",
        EN: "Baptized Mass",
    },
    parentBtn: btnMass,
    children: [btnMassStBasil, btnMassStGregory, btnMassStCyril], //We are removing Mass StJohn for now
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
            return console.log("Didn\'t find the prayersArray");
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
        btnReadingsGospelIncenseDawn.onClick(Prefix.gospelNight);
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
        findMassReadingOtherThanGospel(Prefix.propheciesDawn, ReadingsArrays.PropheciesDawnArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true);
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
    onClick: (returnBtnChildren = false) => {
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
                onClick: (returnBtnChildren = false) => {
                    if (returnBtnChildren)
                        return;
                    findMassReadingOtherThanGospel(Prefix.stPaul, ReadingsArrays.StPaulArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true);
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
                onClick: (returnBtnChildren = false) => {
                    if (returnBtnChildren)
                        return;
                    findMassReadingOtherThanGospel(Prefix.katholikon, ReadingsArrays.KatholikonArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true);
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
                onClick: (returnBtnChildren = false) => {
                    if (returnBtnChildren)
                        return;
                    findMassReadingOtherThanGospel(Prefix.praxis, ReadingsArrays.PraxisArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true);
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
                onClick: function (returnBtnChildren = false) {
                    if (returnBtnChildren)
                        return;
                    findMassReadingOtherThanGospel(Prefix.synaxarium, ReadingsArrays.SynaxariumArray, { beforeOrAfter: undefined, el: undefined }, containerDiv, true, copticDate); //!CAUTION: notice that we passed to the function the readingDate argument because during the GreatLent period and the Jonah Fast, the copticReadingsDate is formatted like 'GL10', we hence pass the copticDate to prevent the function from searching for the Synaxarium of the day by the copticReadingsDate
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
                onClick: (returnBtnChildren = false) => {
                    if (returnBtnChildren)
                        return;
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
            if (![Seasons.GreatLent, Seasons.JonahFast].includes(Season))
                return;
            if (copticReadingsDate === copticFeasts.Resurrection)
                return;
            (function ifWeAreNotASaturday() {
                if (weekDay === 6)
                    return;
                //We remove the Vespers because there are no Vespers during the Great Lent except for Saturday. Also there are no vespers during the Jonah Fast which lasts for 4 days from Monday to Thursday
                btnDayReadings.children = btnDayReadings.children.filter((btn) => btn !== btnReadingsGospelIncenseVespers);
                if (Season === Seasons.JonahFast)
                    return; ///The following concerns only the Great Lent
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
        if (returnBtnChildren)
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
        let OurFatherWhoArtInHeaven = Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay", AngelsPrayers = Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay", HailToYouMaria = Prefix.commonPrayer + "WeSaluteYouMary&D=$copticFeasts.AnyDay", WeExaltYou = Prefix.commonPrayer + "WeExaltYouStMary&D=$copticFeasts.AnyDay", Agios = Prefix.commonPrayer + "Agios&D=$copticFeasts.AnyDay", Kyrielison41Times = Prefix.commonPrayer + "Kyrielison41Times&D=$copticFeasts.AnyDay", KyrielisonIntro = Kyrielison41Times.replace("&D=", "NoMassIntro&D="), HolyLordOfSabaot = Prefix.commonPrayer + "HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay", Creed = Prefix.commonPrayer + "Creed&D=$copticFeasts.AnyDay", AllHoursFinalPrayer = Prefix.bookOfHours + "AllHoursFinalPrayer&D=$copticFeasts.AnyDay";
        btnBookOfHours.children = [];
        (function addAChildButtonForEachHour() {
            Object.entries(bookOfHours).forEach((entry) => {
                let hourName = entry[0], btnLabel = entry[1][1];
                let hourBtn = new Button({
                    btnID: "btn" + hourName,
                    label: btnLabel,
                    languages: btnBookOfHours.languages,
                    showPrayers: true,
                    onClick: (isMass = false) => hourBtnOnClick(hourBtn, hourName, isMass),
                    afterShowPrayers: () => hourBtnAfterShowPrayer(btnLabel),
                });
                btnBookOfHours.children.push(hourBtn);
            });
            function hourBtnAfterShowPrayer(btnLabel) {
                let children = Array.from(containerDiv.children).filter((div) => div.dataset.root);
                children.forEach((htmlRow) => ["Priest", "Diacon", "Assembly"].forEach((className) => htmlRow.classList.replace(className, "NoActor")));
                if (btnLabel !== bookOfHours.VeilHour[1])
                    return;
                //If we are in the 'Setar Hour', we need to remove from Psalm 118 all the paragraphs except paragraphs 20, 21, and 22. We will do this by adding a btn.afterShowPlayers function
                let psalm118 = children.filter((div) => div.dataset.root.startsWith(Prefix.bookOfHours + "Psalm118"));
                psalm118
                    .filter((div) => psalm118.indexOf(div) > 0 && psalm118.indexOf(div) < 20)
                    .forEach((div) => div.remove());
            }
            //Adding the onClick() property to the button
            function hourBtnOnClick(btn, hourName, isMass) {
                (function buildBtnPrayersSequence() {
                    //We will add the prayers sequence to btn.prayersSequence[]
                    btn.prayersSequence = Object.entries(bookOfHours)
                        .find((entry) => entry[0] === hourName)[1][0]
                        .map((title) => getSequence("Psalm" + title.toString()));
                    btn.prayersSequence.unshift(getSequence(hourName + "Title")); //This is the title of the hour prayer
                    ["Gospel", "Litanies"].forEach((title) => btn.prayersSequence.push(getSequence(hourName + title)));
                    //Then, we add the End of all Hours' prayers (ارحمنا يا الله ثم ارحمنا) except for the 1st and 2nd services of the Midnight Prayer
                    (function addFinalPrayersToSequence() {
                        if (isMass)
                            return; //!Important: If the onClick() method is called when the button is displayed in the Unbaptised Mass, we do not add anything else to the btn's prayersSequence
                        let btnLable = btn.label, HourIntro = [
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
                            endOfHourPrayersSequence.splice(0, 5, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven, getSequence(hourName + "2ndGospel"));
                            //Inserting the Priests Absolution at the end
                            endOfHourPrayersSequence.push(getSequence(hourName + "PriestsAbsolution"));
                        }
                        if ([
                            bookOfHours.FirstHour[1],
                            bookOfHours.TwelvethHour[1],
                            bookOfHours.MidNight3Hour[1],
                        ].includes(btnLable)) {
                            //If it is the 1st hour (Dawn) or the 12th Hour (Nighth) prayer: We add the End Of Hour Prayers
                            btn.prayersSequence.push(...endOfHourPrayersSequence);
                        }
                        else {
                            //If its is not the 1st Hour (Dawn) or the 12th Hour (Night), we insert only Kyrielison 41 times, and "Holy Lord of Sabaot" and "Our Father Who Art In Heavean"
                            btn.prayersSequence.push(KyrielisonIntro, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven);
                        }
                    })();
                })();
                function getSequence(replaceWith) {
                    return (Prefix.bookOfHours +
                        "&D=$copticFeasts.AnyDay".replace("&D=", replaceWith + "&D="));
                }
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
 * Makes a buttons div container floating on the top of the page
 * @param {HTMLDivElement} btnContainer - the buttons div container we want to make float;
 * @param {string} top - the value of the btnConainer.style.top
 */
function floatOnTop(btnContainer, top) {
    btnContainer.style.position = "fixed";
    btnContainer.style.top = top;
    btnContainer.style.justifySelf = "center";
}
;
/**
 * Fetchs and displaying any readings other than the Gospel and the Psalm
 * @param {string} readingPrefix
 * @param {string[][][]} readingArray - The array where the reading's texts are to be found
 * @param {HTMLElement} container - The container where the text will be displayed after fetched
 * @param {boolean} clearContainer - specifies whether the container should be cleared or not before the reading is displayed
 * @returns
 */
function findMassReadingOtherThanGospel(readingPrefix, readingArray, position, container = containerDiv, clearContainer = false, readingDate) {
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
    let reading = readingArray.find((table) => isMultiDatedTitleMatching(splitTitle(table[0][0])[0], readingDate));
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
        return prayersSequence; //If we are not calling the function within a mass/incense liturgy, we will not need to set the Psalm and Gospel Responses, we will return the prayersSequence array
    //setting the psalm and gospel responses
    (function setPsalmAndGospelResponses() {
        if (Number(copticDay) === 29 && [4, 5, 6].includes(Number(copticMonth)))
            return; //we are on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast), and Touba and Amshir (they are excluded because they precede the annonciation)
        let PsalmAndGospelResponses = PsalmAndGospelPrayersArray.filter((table) => isMultiDatedTitleMatching(table[0][0], copticDate) ||
            isMultiDatedTitleMatching(table[0][0], Season));
        let psalmResponse = PsalmAndGospelResponses.filter((table) => table[0][0].startsWith(Prefix.psalmResponse));
        let gospelResponse = PsalmAndGospelResponses.filter((table) => table[0][0].startsWith(Prefix.gospelResponse));
        if (Season === Seasons.GreatLent) {
            [0, 6].includes(weekDay)
                ? (gospelResponse = [
                    gospelResponse.find((table) => table[0][0].includes("Sundays&D=")),
                ])
                : (gospelResponse = gospelResponse =
                    [gospelResponse.find((table) => table[0][0].includes("Week&D="))]);
        }
        else if ([Seasons.JonahFast, Seasons.StMaryFast].includes(Season)
            ||
                [copticFeasts.EndOfGreatLentFriday, copticFeasts.LazarusSaturday,
                ].includes(copticReadingsDate)
            ||
                copticDate === copticFeasts.CanaWedding) {
            //For these occasions, there are different gospel responses for the Dawn Incense Office, and the Unbaptised Mass. We will filter the results
            let prefix = "";
            if (liturgy === Prefix.gospelDawn)
                prefix = 'Dawn';
            if (liturgy === Prefix.gospelMass)
                prefix = 'Mass';
            if (Season === Seasons.JonahFast)
                prefix += copticReadingsDate.split(Season)[1]; //There are different responses for the Dawn Gospel and the Mass Gospel for each day of the Jonah Fast. We will  add the number of the day of Jonah Fast: eg.: "Mass1&D=Jonah1&C=Title" (for 1st day of the Jonah Fast), Dawn2&D=Jonah2&C=Title", etc.
            (function ifGospelVespers() {
                //If the liturgy is Vespers incesnse, in some occasions there are specific gospel response for the Vespers
                if (liturgy !== Prefix.gospelVespers)
                    return;
                if (Season === Seasons.StMaryFast
                    ||
                        [copticFeasts.EndOfGreatLentFriday,
                            copticFeasts.LazarusSaturday,
                        ].includes(copticReadingsDate))
                    prefix = 'Vespers';
            })();
            gospelResponse = [
                gospelResponse.find((table) => table[0][0].includes(prefix + "&D=")),
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
    if (!args.prayersArray)
        return console.log("the button passed as argument does not have prayersArray");
    if (!args.languages)
        args.languages = getLanguages(getArrayNameFromArray(args.prayersArray));
    if (!args.gospelInsertionPoint)
        args.gospelInsertionPoint = selectElementsByDataSetValue(args.container, Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay")[0];
    //We start by inserting the standard Gospel Litany
    (function insertGospelLitany() {
        if (!args.isMass)
            return;
        let gospelLitanySequence = [
            Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay",
        ]; //This is the sequence of the Gospel Prayer/Litany for any liturgy
        let gospelLitanyPrayers = gospelLitanySequence.map((title) => findTable(title, CommonPrayersArray));
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
    let gospelIntroduction = selectElementsByDataSetValue(args.container, anchorDataRoot, undefined, 'group')
        .filter(div => !isCommentContainer(div)); //!We do not include the comments because if the user hides them, the index of the elements will change
    if (args.isMass && gospelIntroduction.length < 1)
        return console.log("gospelIntroduction.length = 0 ");
    let prayersSequence = setGospelPrayersSequence(args.liturgy, args.isMass); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']
    //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
    let date = copticReadingsDate;
    if (args.liturgy === Prefix.gospelVespers) {
        //date = getTomorowCopticReadingDate();
        //console.log(date);
    }
    let gospel = args.prayersArray
        .filter((table) => isMultiDatedTitleMatching(splitTitle(table[0][0])[0], date));
    if (gospel.length === 0)
        return console.log("gospel.length = 0"); //if no readings are returned from the filtering process, then we end the function
    /**
     * Appends the gospel and psalm readings before gospelInsertionPoint(which is an html element)
     */
    (function insertPsalmAndGospelReadings() {
        if (!args.isMass) {
            //If we are not showing the gospel reading in a Mass context (i.e., if the user is clicking on the 'Day Readings Button' to show the readings of the day). We will create a  div container  to which we will append the reading text. We will append the container div as first element of containerDiv
            containerDiv.append(document.createElement("div"));
            args.gospelInsertionPoint = containerDiv.children[0]; //We set args.gospelInsertionPoint as the container div we've just created.
        }
        gospel
            .forEach((table) => {
            //gospel[] should include 2 tables: the first table is the psalm and its title is like '....Psalm&D=...'. The 2nd is the gospel: its title is like '....Gospel&D=...'.
            let el; //!We, on purpose, created a new variable for the element before which we will show the reading, in order to keep args.gospelInsertionPoint unchanged because we need it later if we are within a Mass or liturgy context. 
            (function setInsertionPoint() {
                if (!args.isMass || table[0][0].includes("Gospel&D="))
                    //If we are not displaying the gospel in a Mass or a liturgy context, we don't need to insert the psalm. We will just show the text of the gospel reading itself. Hence, the div element will be same as args.gospelInsertionPoint
                    el = args.gospelInsertionPoint;
                else if (table[0][0].includes("Psalm&D="))
                    //We are within a Mass or liturgy context, and need to display the Psalm. We will hence change the place in which the text will be inserted.
                    el = gospelIntroduction[gospelIntroduction.length - 1];
            })();
            if (!el)
                return console.log('The insertion point is not valid');
            function getGospelOrPsalmTable() {
                //! We didn't push the array to the table directly because otherwise it will add a new row to the original table each time we click on the Unbaptised Mass button or the Gospel Reading button
                //We will include the gospel end: 'Glory To God Forever' and the Psalm End 'Hallelujah'
                if (table[0][0].includes('Gospel&D='))
                    return [...table, getReadingEnd(ReadingsIntrosAndEnds.gospelEnd)]; //We return a copy of the table not the original table in order to avoid modifying the original table.
                else if (table[0][0].includes('Psalm&D='))
                    return [...table, getReadingEnd(ReadingsIntrosAndEnds.psalmEnd)]; //We return a copy of the table not the original table in order to avoid modifying the original table.
                function getReadingEnd(end) {
                    //We will return an array (i.e., a new row in the table) containing the text of the "Gospel End" (Glory to God Forever) in each language. This array needs to be constructed like this: ['Row title', 'End text in Arabic, 'End text in French or whatever other western language', 'End text in English']
                    return [
                        //The first element of the array contains the title of the row
                        Prefix.same + '&C=ReadingEnd',
                        //The following elements represent the text of the 'Gospel End' in each language, in the same order as the languages passed in args.languages.
                        ...args.languages
                            .map(lang => end[lang])
                    ];
                }
                ;
            }
            ;
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
        if (!args.isMass)
            return; //If we are not calling the function with a Mass or a liturgy (Unbpaptized Mass, or Incense Dawn/Vespers) context, we will not insert the Gospel and Psalm responses 
        //Inserting the gospel response
        insertResponse(3, args.gospelInsertionPoint);
        //We remove the insertion point placeholder
        args.gospelInsertionPoint.remove();
        let gospelPrayer = selectElementsByDataSetValue(args.container, Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay"); //This is the 'Gospel Litany'. We will insert the Psalm response after its end
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
    /**
     * Returns the Coptic Date of for the next day. It is mainly needed for the Vespers Gospel
     */
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
        let cymbalsPlaceHolder = selectElementsByDataSetValue(btn.docFragment, Prefix.commonIncense + "CymbalVersesPlaceHolder&D=$copticFeasts.AnyDay")[0];
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
        let doxologiesPlaceHolder = selectElementsByDataSetValue(btn.docFragment, Prefix.commonIncense + "DoxologiesPlaceHolder&D=$copticFeasts.AnyDay")[0];
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
                tables.push(findTable(title, tablesArray, {
                    equal: true,
                }));
        });
        return tables;
    }
}
async function removeElementsByTheirDataRoot(container = containerDiv, dataRoot) {
    selectElementsByDataSetValue(container, dataRoot).forEach((el) => el.remove());
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
    if (!args.prayers)
        return console.log('No prayes table nor prayers sequence were provided');
    if (!args.insertion)
        return console.log("btnID = ", args.btnID);
    let btnExpand, htmlButton, expandableContainer;
    btnExpand = new Button({
        btnID: args.btnID,
        label: args.label,
        cssClass: inlineBtnClass,
        languages: args.languages,
        prayersSequence: args.prayers.map(tbl => tbl[0][0]),
        onClick: btnOnClick,
    });
    return createHtmlBtnAndExpandableDiv();
    function createHtmlBtnAndExpandableDiv() {
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
                if (args.dataGroup)
                    div.dataset.group = args.dataGroup;
                args.insertion.insertAdjacentElement("beforebegin", div); //Inserting the div containing the button as 1st element of containerDiv
                return div;
            }
            ;
        }
        ;
        function createExpandableContainer() {
            //We will create a newDiv to which we will append all the elements in order to avoid the reflow as much as possible
            let expandable = document.createElement("div");
            expandable.id = btnExpand.btnID + "Expandable";
            expandable.classList.add(hidden);
            expandable.classList.add("Expandable");
            expandable.style.display = "grid"; //This is important, otherwise the divs that will be add will not be aligned with the rest of the divs
            args.insertion.insertAdjacentElement("beforebegin", expandable);
            return expandable;
        }
        ;
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
    async function btnOnClick() {
        if (!expandableContainer)
            return console.log("no collapsable div was found");
        (function showPrayersInExpandableDiv() {
            if (expandableContainer.children.length > 0)
                return;
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
                .forEach((htmlTable) => setCSS(htmlTable));
        })();
        expandableContainer.classList.toggle(hidden);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUJ1dHRvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL0RlY2xhcmVCdXR0b25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sTUFBTTtJQWlCVixZQUFZLEdBQWU7UUFYbkIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQVlsQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7UUFDNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUNwQyxHQUFHLENBQUMsUUFBUTtZQUNWLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxTQUFTO0lB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