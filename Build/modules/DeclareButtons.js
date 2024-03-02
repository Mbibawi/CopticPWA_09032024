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
            if (![Seasons.GreatLent, Seasons.JonahFast].includes(Season))
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
                    //We will remove all the refrains except the 1st one
                    let refrains = selectElementsByDataSetValue(btnDocFragment, Prefix.incenseDawn + "GodHaveMercyOnUsRefrain&D=$Seasons.GreatLent")
                        .filter((htmlRow) => htmlRow.classList.contains("Title"));
                    refrains.forEach((htmlRow) => {
                        if (refrains.indexOf(htmlRow) > 0)
                            htmlRow.remove();
                    });
                })();
            }
            else {
                //If we are Saturday or Sunday, we remove the "Prophecies Dawn" button from the readings' buttons
                if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1)
                    btnIncenseDawn.children.splice(btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn), 1);
            }
        })();
        (async function addExpandableBtnForAdamDoxolgies() {
            //We add an expandable button for the Incense Dawn Adam Doxologies
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
        (function insertStCyrilSecondReconciliationBtn() {
            if (btn !== btnMassStCyril)
                return;
            let secondCyrilReconciliation = findTable(Prefix.massStCyril + "Reconciliation2&D=$copticFeasts.AnyDay", MassStCyrilPrayersArray);
            if (!secondCyrilReconciliation)
                return console.log("Didn't find reconciliation");
            let htmlBtn = addExpandablePrayer({
                insertion: selectElementsByDataSetValue(btnDocFragment, Prefix.massStCyril + "Reconciliation&D=$copticFeasts.AnyDay")[0].nextElementSibling,
                btnID: "secondStBasilReconciliation",
                label: {
                    FR: secondCyrilReconciliation[0][2],
                    AR: secondCyrilReconciliation[0][4],
                },
                prayers: [secondCyrilReconciliation],
                languages: btn.languages,
            })[0];
            htmlBtn.addEventListener("click", () => {
                let dataGroup = Prefix.massStCyril + "Reconciliation&D=$copticFeasts.AnyDay";
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
        (function showFractionPrayersMasterButton() {
            //We will insert a button displaying a pannel of choices for the different Fraction prayers according to the day/season, etc.s
            showMultipleChoicePrayersButton({
                filteredPrayers: filter(),
                languages: prayersLanguages,
                btnLabels: { AR: "صلوات القسمة", FR: "Oraisons de la Fraction" },
                masterBtnID: "btnFractionPrayers",
                anchor: Array.from(btnDocFragment.children)
                    .find(child => child.id && child.id.startsWith(Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay")),
            });
            function filter() {
                let filtered = [];
                let dates = [copticDate, Season, copticFeasts.AnyDay];
                if (Number(copticDay) === 29 && ![4, 5, 6].includes(Number(copticMonth)))
                    dates.unshift(copticFeasts.Coptic29th);
                dates.forEach(date => filtered.push(...FractionsPrayersArray.filter(table => isMultiDatedTitleMatching(table[0][0], date))));
                return getUniqueValuesFromArray(filtered);
            }
            ;
        })();
        (function insertCommunionChants() {
            //Inserting the Communion Chants after the Psalm 150
            let psalm150 = selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay");
            let filtered = [];
            [copticDate, Season, copticFeasts.AnyDay]
                .forEach(date => {
                filtered.push(...CommunionPrayersArray.filter(table => isMultiDatedTitleMatching(table[0][0], date)));
            });
            showMultipleChoicePrayersButton({
                filteredPrayers: Array.from(new Set(filtered)),
                languages: btn.languages,
                btnLabels: {
                    AR: "مدائح التوزيع",
                    FR: "Chants de la communion",
                },
                masterBtnID: "communionChants",
                anchor: psalm150[psalm150.length - 1],
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
                else
                    return ifIsFast();
                function ifIsFast() {
                    if (!isFast)
                        return;
                    if ([Seasons.GreatLent, Seasons.JonahFast].includes(Season)) {
                        //We are either during the week days of the Great Lent, or the 3 days of Jonah Fast
                        [
                            ["HallelujahFayBiBiFast&D=$copticFeasts.AnyDay", "HallelujahFayBiBi&D=$Seasons.GreatLent"],
                            ["Tishoury&D=$copticFeasts.AnyDay", "EnsotyTishoury&D=$Seasons.GreatLent"]
                        ] //Replacing "Tishoury" with "Ensoty Tishoury"
                            .forEach(array => btnsPrayersSequence[btnsPrayersSequence.indexOf(Prefix.massCommon + array[0])] = Prefix.massCommon + array[1]);
                    }
                    //We will remove 'Hellulja Fay Bibi'and keep only 'Hellulja Ge Evmev'i". We will also remove Tayshoury in order to keep only Tishoury 
                    return btnsPrayersSequence
                        .filter(title => ![Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay", Prefix.massCommon + "Tayshoury&D=$copticFeasts.AnyDay"].includes(splitTitle(title)[0]));
                }
            }
            ;
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
        (function insertHisFoundationsAndIGodHaveMercy() {
            if (![Seasons.GreatLent, Seasons.JonahFast].includes(Season))
                return; //The following only applies during the Great Lent the 3 days of Jonah Fast (not the 4th day) that's why we check if isFast === true
            let titles = [
                Prefix.commonPrayer + "WeHaveBeenSavedWithYou&D=$copticFeasts.AnyDay",
                Prefix.massCommon + "HisFoundations&D=$Seasons.GreatLent",
                Prefix.incenseDawn + "GodHaveMercyOnUsRefrain&D=$Seasons.GreatLent",
            ];
            selectElementsByDataSetValue(btnDocFragment, titles[0], { equal: true }, 'root').forEach(el => el.remove()); //We remove the existing 'Sotis Amen' prayer
            let tables = titles.map(title => findTable(title, getTablesArrayFromTitlePrefix(title)) || undefined); //We retrieve the 3 tables by their titles
            if (!tables || tables.length < 1)
                return;
            let anchor = selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon + "AbsolutionForTheFather&D=$copticFeasts.AnyDay", { equal: true }, 'root')[0]; //This is the html element before which we will insert the retrived tables
            if (!anchor)
                return;
            insertPrayersAdjacentToExistingElement({
                tables: tables,
                languages: prayersLanguages,
                position: {
                    beforeOrAfter: 'beforebegin',
                    el: anchor
                },
                container: btnDocFragment
            });
        })();
        let readingsAnchor = selectElementsByDataSetValue(btnDocFragment, Prefix.massCommon + "ReadingsPlaceHolder&D=$copticFeasts.AnyDay")[0]; //this is the html element before which we will insert all the readings and responses
        (function insertIntercessionsHymns() {
            let seasonalIntercessions = MassCommonPrayersArray.filter((table) => table[0][0].includes("ByTheIntercessionOf") &&
                (isMultiDatedTitleMatching(table[0][0], copticDate) ||
                    isMultiDatedTitleMatching(table[0][0], Season)));
            if (seasonalIntercessions.length < 1)
                return console.log("No Seasonsal Intercession Hymns");
            let anchor = setAnchorAccordingToOccasion();
            if (!anchor)
                return;
            insertPrayersAdjacentToExistingElement({
                tables: getUniqueValuesFromArray(seasonalIntercessions),
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
                });
            })();
            function setAnchorAccordingToOccasion() {
                let title = Prefix.massCommon + "ByTheIntercessionOfStMary&D=$copticFeasts.AnyDay";
                if ([Seasons.JonahFast].includes(Season))
                    title = Prefix.massCommon + "ByTheIntercessionOfStJohnBaptist&D=$copticFeasts.AnyDay";
                let htmlDivs = selectElementsByDataSetValue(btnDocFragment, title);
                if (!htmlDivs || htmlDivs.length < 1)
                    return;
                return htmlDivs[htmlDivs.length - 1].nextElementSibling;
            }
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
                if (defaultLanguage === 'AR')
                    btnsDiv.dir = 'rtl';
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
                let sequence;
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
                }
                else if (hoursBtns.indexOf(hourBtn) === hoursBtns.length - 2) {
                    //this is the before last hour btn
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
    parentBtn: btnMainMenu,
    showPrayers: true,
    languages: [...prayersLanguages],
    children: [],
    onClick: (returnBtnChildren = false) => {
        if (btnBookOfHours.children.length > 1)
            return btnBookOfHours.children;
        let OurFatherWhoArtInHeaven = Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay", AngelsPrayers = Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay", HailToYouMaria = Prefix.commonPrayer + "WeSaluteYouMary&D=$copticFeasts.AnyDay", WeExaltYou = Prefix.commonPrayer + "WeExaltYouStMary&D=$copticFeasts.AnyDay", Agios = Prefix.commonPrayer + "Agios&D=$copticFeasts.AnyDay", Kyrielison41Times = Prefix.commonPrayer + "Kyrielison41Times&D=$copticFeasts.AnyDay", KyrielisonIntro = Kyrielison41Times.replace("&D=", "NoMassIntro&D="), HolyLordOfSabaot = Prefix.commonPrayer + "HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay", Creed = Prefix.commonPrayer + "Creed&D=$copticFeasts.AnyDay", AllHoursFinalPrayer = Prefix.bookOfHours + "AllHoursFinalPrayer&D=$copticFeasts.AnyDay";
        btnBookOfHours.children = [];
        (function addAChildButtonForEachHour() {
            (function addHoursBtns() {
                Object.entries(bookOfHours)
                    .forEach((entry) => {
                    let hourName = entry[0], btnLabel = entry[1][1];
                    let hourBtn = new Button({
                        btnID: "btn" + hourName,
                        label: btnLabel,
                        languages: btnBookOfHours.languages,
                        showPrayers: true,
                        parentBtn: btnBookOfHours,
                        onClick: (isMass = false) => hourBtnOnClick(hourBtn, hourName, isMass),
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
                function otherPrayerBtn(title) {
                    let table = findTable(title, BookOfHoursPrayersArray) || undefined;
                    if (!table)
                        return undefined;
                    return new Button({
                        btnID: "btnOtherPrayer" + otherPrayers.indexOf(title) + 1,
                        label: {
                            AR: table[0][btnBookOfHours.languages.indexOf('AR') + 1],
                            FR: table[0][btnBookOfHours.languages.indexOf('FR') + 1]
                        },
                        onClick: () => {
                            setCSS(showPrayers({
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
        else if ([Seasons.JonahFast, Seasons.JonahFeast, Seasons.StMaryFast].includes(Season)
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
        return getSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today, false)[1], today);
    }
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
        let matching = Object.entries(copticFeasts).find((entry) => [copticDate, copticReadingsDate].includes(entry[1])); //We check if today is a feast. We also check by the copticReadingsDate because some feast are referrenced by the copticReadings date : eg. Pntl39
        if (matching)
            feast.push(matching[1]); //We push the date
        matching = Object.entries(Seasons).find((entry) => entry[1] === Season); //We check also for the season
        if (matching)
            feast.push(matching[1]); //We push the Season
        if (feast.length > 0)
            return getUniqueValuesFromArray(feast);
    })();
    (async function InsertCymbalVerses() {
        let cymbalsAnchor = selectElementsByDataSetValue(btn.docFragment, Prefix.commonIncense + "CymbalVersesPlaceHolder&D=$copticFeasts.AnyDay")[0];
        if (!cymbalsAnchor)
            return console.log("We didn't find the cymbal verses placeholder");
        let cymbals;
        Season === Seasons.JonahFast
            ? cymbals = CommonPrayersArray.filter(table => table[0][0].startsWith(Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay")) //If we are during the Jonah Fast, the Cymbal Verses are not chanted, they are replaced by the Long Kyrielison
            : cymbals = getCymbalVerses();
        console.log('Cymbals = ', cymbals);
        if (cymbals.length < 1)
            return console.log("no cymbals were found by the provided sequence: ");
        insertPrayersAdjacentToExistingElement({
            tables: getUniqueValuesFromArray(cymbals),
            languages: btn.languages,
            position: {
                beforeOrAfter: "beforebegin",
                el: cymbalsAnchor.nextElementSibling,
            },
            container: btn.docFragment,
        });
        function getCymbalVerses() {
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
            return processSequence(sequence, CymbalVersesPrayersArray);
        }
    })();
    (async function InsertCommonDoxologies() {
        let doxologiesAnchor = selectElementsByDataSetValue(btn.docFragment, Prefix.commonIncense + "DoxologiesPlaceHolder&D=$copticFeasts.AnyDay")[0];
        if (!doxologiesAnchor)
            return console.log("Didn't find doxologiesPlaceholder");
        if (!doxologiesAnchor)
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
                    Seasons.JonahFast //The Jonah doxology comes before St. Mary Doxolgy according to some sources
                ].includes(feast))
                    index = 0; //If one of the dates in feast[] corresponds to a one of the 'Lord's Feasts', it means we are in a Lord Feast. the doxologies of the feast will be placed at the begining of the doxologies. We follow the same rule for the doxologies of the PentecostalDays and the month of Kiahk
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
                el: doxologiesAnchor.nextElementSibling,
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
        console.log(sequence);
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