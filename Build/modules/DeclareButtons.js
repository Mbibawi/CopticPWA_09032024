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
        btnMain.children = [btnMass, btnIncenseOffice, btnDayReadings, btnBookOfHours];
        (function showBtnsOnMainPage() {
            if (leftSideBar.classList.contains('extended'))
                return; //If the left side bar is not hidden, we do not show the buttons on the main page because it means that the user is using the buttons in the side bar and doesn't need to navigate using the btns in the main page
            let images = [
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
                return createBtn({
                    btn: btn,
                    btnsContainer: containerDiv,
                    btnClass: 'mainPageBtns',
                    clear: true,
                    onClick: () => onClickBtnFunction(btn)
                });
            })
                .map(htmlBtn => {
                //For each btn created from the children of btnMain, we give it an image background from the images[] array of links
                htmlBtn.style.backgroundImage = images[Array.from(containerDiv.children).indexOf(htmlBtn)];
            });
            function onClickBtnFunction(btn) {
                if (!btn.children || btn.children.length === 0)
                    btn.onClick({ returnBtnChildren: true }); //if btn doesn't have childre, we call its onClick() function beacuse the children of some btns are added when tis function is called. We pass 'true' as argument, because it makes the function return the children and do not execute until its end
                let parentHtmlBtn = containerDiv.querySelector('#' + btn.btnID);
                let backgroundImage;
                if (parentHtmlBtn)
                    backgroundImage = parentHtmlBtn.style.backgroundImage;
                containerDiv.innerHTML = "";
                if (!btn.children
                    || btn.children.length === 0
                    || (btn.prayersSequence
                        && btn.prayersSequence.length > 0)) {
                    showChildButtonsOrPrayers(btn); //If btn does not have children, it means that it shows prayers. We pass it to showChildButtonsOrPrayers
                    return;
                }
                ;
                //else, we will show the btn children
                btn.children
                    //for each child button of btn
                    .map(childBtn => {
                    //We create an html element representing this button and give it 'mainPageBtns', and append it to containerDiv. It will have as background, the same image as the background image of btn
                    createBtn({
                        btn: childBtn,
                        btnsContainer: containerDiv,
                        btnClass: 'mainPageBtns',
                        clear: false,
                        onClick: () => onClickBtnFunction(childBtn)
                    })
                        .style.backgroundImage = backgroundImage;
                });
                createBtn({ btn: btnMain, btnsContainer: containerDiv, btnClass: 'mainPageBtns' }).style.backgroundImage = images[0]; //Finlay, we create and extra html button for btnMain, in order for the user to be able to navigate back to the btnMain menu of buttons
            }
            ;
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
        btnIncenseDawn.prayersSequence =
            [...IncensePrayersSequence]
                .filter(title => !title.startsWith(Prefix.incenseVespers)); //We will remove all the Incense Vespers titles from the prayersSequence Array
        btnIncenseDawn.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.IncensePrayersArray.filter(table => !table[0][0].startsWith(Prefix.incenseVespers)),
        ]; //We need this to be done when the button is clicked, not when it is declared, because when declared, CommonPrayersArray and IncensePrayersArray are empty (they are popultated by a function in "main.js", which is loaded after "DeclareButtons.js")
        scrollToTop();
        return btnIncenseDawn.prayersSequence;
    },
    afterShowPrayers: async (btn = btnIncenseDawn, gospelButton = btnReadingsGospelIncenseDawn) => {
        let btnDocFragment = btn.docFragment;
        insertCymbalVersesAndDoxologies(btn);
        getGospelReadingAndResponses(gospelButton.onClick({ returnGospelPrefix: true }), gospelButton, btnDocFragment);
        (function hideGodHaveMercyOnUsIfBishop() {
            let dataRoot = Prefix.commonIncense + "PrayThatGodHaveMercyOnUsIfBishop&D=$copticFeasts.AnyDay";
            let godHaveMercyHtml = selectElementsByDataRoot(btnDocFragment, dataRoot.split('IfBishop')[0], { startsWith: true }); //We select all the paragraphs not only the paragraph for the Bishop
            godHaveMercyHtml
                .filter(htmlRow => godHaveMercyHtml.indexOf(htmlRow) > 0
                && godHaveMercyHtml.indexOf(htmlRow) !== godHaveMercyHtml.length - 2)
                .forEach(htmlRow => htmlRow.remove());
            let godHaveMercy = IncensePrayersArray.find(tbl => tbl[1] && splitTitle(tbl[1][0])[0] === dataRoot); //We get the whole table not only the second row. Notice that the first row of the table is the row containing the title
            if (!godHaveMercy || godHaveMercy.length < 1)
                return console.log('Didn\'t find table Gode Have Mercy');
            addExpandablePrayer({
                insertion: godHaveMercyHtml[0].nextElementSibling,
                btnID: 'godHaveMercy',
                label: {
                    AR: godHaveMercy[1][4],
                    FR: godHaveMercy[1][2], //this is the French text of the label
                },
                prayers: [[godHaveMercy[2], godHaveMercy[3]]],
                languages: btnMassUnBaptised.languages
            });
        })();
        (async function addGreatLentPrayers() {
            if (btn.btnID !== btnIncenseDawn.btnID)
                return;
            if (Season !== Seasons.GreatLent && Season !== Seasons.JonahFast)
                return;
            if (todayDate.getDay() > 0 && todayDate.getDay() < 6) {
                console.log('we are not a sunday');
                //We are neither a Saturday nor a Sunday, we will hence display the Prophecies dawn buton
                (function showPropheciesDawnBtn() {
                    if (Season !== Seasons.GreatLent)
                        return;
                    //If we are during any day of the week, we will add the Prophecies readings to the children of the button
                    if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) < 0)
                        btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
                })();
                (async function insertEklonominTaghonata() {
                    let efnotiNaynan = selectElementsByDataRoot(btnDocFragment, Prefix.commonPrayer + 'EfnotiNaynan&D=$copticFeasts.AnyDay', { startsWith: true });
                    let insertion = efnotiNaynan[efnotiNaynan.length - 1].nextSibling.nextSibling; //This is the html div after "Kyrie Elison 3 times"
                    let godHaveMercy = btnIncenseDawn.prayersArray.find(table => table[0][0].startsWith(Prefix.incenseDawn + 'GodHaveMercyOnUs&D=$Seasons.GreatLent')); //This will give us all the prayers 
                    console.log('godHaveMercy =', godHaveMercy);
                    insertPrayersAdjacentToExistingElement({
                        tables: [godHaveMercy],
                        languages: prayersLanguages,
                        position: { beforeOrAfter: 'beforebegin', el: insertion }, container: btnDocFragment
                    });
                    let refrains = selectElementsByDataRoot(btnDocFragment, Prefix.incenseDawn + 'GodHaveMercyOnUsRefrain&D=$Seasons.GreatLent', { equal: true }).filter(htmlRow => htmlRow.classList.contains('Title'));
                    refrains.forEach(htmlRow => { if (refrains.indexOf(htmlRow) > 0)
                        htmlRow.remove(); });
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
                prayers: PrayersArrays.DoxologiesPrayersArray.filter(table => table[0][0].startsWith(Prefix.doxologies + 'AdamDawn')),
                languages: btnIncenseDawn.languages
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
        btnIncenseVespers.prayersSequence =
            [...IncensePrayersSequence]
                .filter(title => title !== Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay"
                && !title.startsWith(Prefix.incenseDawn));
        btnIncenseVespers.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.IncensePrayersArray.filter(table => !table[0][0].startsWith(Prefix.incenseDawn)),
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
                Prefix.massCommon + "TheHolyBodyAndTheHolyBlodPart3&D=$copticFeasts.AnyDay",
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
        let massButtons = [btnMassStBasil, btnMassStGregory, btnMassStCyril, btnMassStJohn];
        massButtons.splice(massButtons.indexOf(btn), 1);
        massButtons.splice(massButtons.indexOf(btnMassStJohn), 1);
        let btnDocFragment = btn.docFragment;
        (function insertStBasilSecondReconciliationBtn() {
            if (btn !== btnMassStBasil)
                return;
            let reconciliation = PrayersArrays.MassStBasilPrayersArray.find(table => table[0][0].startsWith(Prefix.massStBasil + 'Reconciliation2'));
            if (!reconciliation)
                return console.log('Didn\'t find reconciliation');
            let htmlBtn = addExpandablePrayer({
                insertion: selectElementsByDataRoot(btnDocFragment, 'Reconciliation&D=$copticFeasts.AnyDay', { includes: true })[0].nextElementSibling,
                btnID: 'secondStBasilReconciliation',
                label: {
                    AR: reconciliation[0][2],
                    FR: reconciliation[0][4]
                },
                prayers: [reconciliation],
                languages: btn.languages
            })[0];
            htmlBtn.addEventListener('click', () => {
                let reconciliation = Array.from(containerDiv.querySelectorAll('.Row'));
                reconciliation
                    .filter(row => row.dataset.group === Prefix.massStBasil + 'Reconciliation&D=$copticFeasts.AnyDay')
                    .forEach(row => {
                    row.classList.toggle(hidden);
                });
            });
        })();
        showFractionPrayersMasterButton(btn, selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'FractionPrayerPlaceholder&D=$copticFeasts.AnyDay', { equal: true })[0], { AR: "صلوات القسمة", FR: "Oraisons de la Fraction" }, "btnFractionPrayers", PrayersArrays.FractionsPrayersArray);
        (function addRedirectionButtons() {
            //Adding 2 buttons to redirect the other masses at the begining of the Reconciliation
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataRoot(btnDocFragment, 'Reconciliation&D=$copticFeasts.AnyDay', { includes: true })[0],
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the other masses at the Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'SpasmosAdamShort&D=$copticFeasts.AnyDay', { endsWith: true });
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the other masses before Agios
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "beforebegin",
                el: selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'Agios&D=$copticFeasts.AnyDay', { equal: true })[0].previousElementSibling,
            }, 'RedirectionToAgios');
            //Adding 2 buttons to redirect to the other masses before the Call upon the Holy Spirit
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'AssemblyResponseAmenAmenAmenWeProclaimYourDeath&D=$copticFeasts.AnyDay', { equal: true })[0],
            }, 'RedirectionToLitanies');
            //Adding 2 buttons to redirect to the other masses before the Fraction Introduction
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "beforebegin",
                el: selectElementsByDataRoot(btnDocFragment, 'FractionIntroduction&D=$copticFeasts.AnyDay', { includes: true })[0],
            }, 'RedirectionToFractionIntroduction');
        })();
        (function insertAdamAndWatesSpasmos() {
            //We insert it during the Saint Mary Fast and on every 21th of the coptic month
            let spasmosTitle = Prefix.massCommon + "SpasmosAdamLong";
            insertSpasmos(spasmosTitle, Prefix.massCommon + "DiaconResponseKissEachOther&D=");
            //Insert Wates Spasmoses
            insertSpasmos(spasmosTitle.replace('Adam', 'Wates'), Prefix.massCommon + "SpasmosWatesShort", true);
        })();
        function insertSpasmos(spasmosTitle, anchorTitle, hideAnchor = false) {
            let spasmos = MassCommonPrayersArray
                .filter(tbl => tbl[0][0].startsWith(spasmosTitle)
                && selectFromMultiDatedTitle(splitTitle(tbl[0][0])[0], Season))[0];
            if (!spasmos)
                return console.log('didn\'t find spasmos with title = ', spasmosTitle);
            let anchor = selectElementsByDataRoot(btnDocFragment, anchorTitle, { startsWith: true })[0];
            if (!anchor)
                console.log('didn\'t find anchor : ', anchorTitle);
            let createdElements = addExpandablePrayer({
                insertion: anchor,
                btnID: spasmosTitle.split('&D=')[0],
                label: {
                    AR: spasmos[0][btn.languages.indexOf(defaultLanguage) + 1],
                    FR: spasmos[0][btn.languages.indexOf(foreingLanguage) + 1]
                },
                prayers: [spasmos],
                languages: btn.languages
            });
            if (hideAnchor)
                createdElements[0]
                    .addEventListener('click', () => selectElementsByDataRoot(containerDiv, anchor.dataset.root, { equal: true })
                    .forEach(row => row.classList.toggle(hidden)));
        }
        ;
        (function insertCommunionChants() {
            //Inserting the Communion Chants after the Psalm 150
            let psalm = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay", { equal: true });
            let filtered = PrayersArrays.CommunionPrayersArray.filter(tbl => {
                selectFromMultiDatedTitle(tbl[0][0], copticDate) === true
                    || selectFromMultiDatedTitle(tbl[0][0], Season) === true;
            });
            if (filtered.length === 0)
                filtered = PrayersArrays.CommunionPrayersArray.filter(tbl => selectFromMultiDatedTitle(tbl[0][0], copticFeasts.AnyDay) === true);
            showMultipleChoicePrayersButton({
                filteredPrayers: filtered,
                btn: btn,
                btnLabels: {
                    AR: 'مدائح التوزيع',
                    FR: 'Chants de la communion'
                },
                masterBtnID: 'communionChants',
                anchor: psalm[psalm.length - 1]
            });
        })();
        (function insertLitaniesIntroductionFromOtherMasses() {
            if (btn !== btnMassStBasil)
                return; //This button appears only in St Basil Mass
            let litaniesIntro = PrayersArrays.MassStGregoryPrayersArray.find(tbl => tbl[0][0].startsWith(Prefix.massStGregory + "LitaniesIntroduction"));
            if (!litaniesIntro)
                return console.log('Did not find the Litanies Introduction');
            let anchor = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "LitaniesIntroduction&D=$copticFeasts.AnyDay", { equal: true })[0];
            if (!anchor)
                return console.log('Di not find the Anchor');
            let createdElements = addExpandablePrayer({
                insertion: anchor,
                btnID: 'btnStGregoryLitaniesIntro',
                label: {
                    AR: "طلبات القداس الغريوري",
                    FR: 'Litanies de St. Gregory'
                },
                prayers: [litaniesIntro],
                languages: btn.languages
            });
            //Adding the St Cyril Litanies Introduction to the St. Basil Mass only. St Gregory Mass has its own intro, and we do not of course add it to St Cyrill since it is already included
            litaniesIntro =
                PrayersArrays.MassStCyrilPrayersArray
                    .find(tbl => splitTitle(tbl[0][0])[0].startsWith(Prefix.massStCyril + "LitaniesIntroduction"));
            litaniesIntro = structuredClone(litaniesIntro);
            console.log(litaniesIntro[litaniesIntro.length - 1]);
            litaniesIntro.splice(litaniesIntro.length - 1, 1); //We remove the last row in the table of litaniesIntro because it is the "As it were, let it always be.../كما كان هكذا يكون/tel qu'il fût ainsi soit-il..."
            if (litaniesIntro.length === 0)
                console.log('Did not find the St Cyril Litanies Introduction');
            //We will create the expandable div and its button, but will append the button to the div
            let btnsDiv = createdElements[0]
                .parentElement;
            btnsDiv
                .appendChild(addExpandablePrayer({
                insertion: anchor,
                btnID: 'btnStCyrilLitaniesIntro',
                label: {
                    AR: 'طلبات القداس الكيرلسي',
                    FR: 'Litanies de la messe de Saint Cyril'
                },
                prayers: [litaniesIntro],
                languages: btnMassStCyril.languages
            })[0] //this is the buton created by addExpandablePrayer
            );
            //We add to each button a 'click' event listner that will hide the other litanies
            Array.from(btnsDiv.children).forEach(child => child.addEventListener('click', () => toggleOtherLitanies(child.id)));
            btnsDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsDiv, 3);
            function toggleOtherLitanies(btnID) {
                let div = Array
                    .from(containerDiv.querySelectorAll('.Expandable'))
                    .find(btn => btn.id.includes('LitaniesIntro') && !btn.id.startsWith(btnID));
                if (div && !div.classList.contains(hidden))
                    div.classList.add(hidden);
            }
            ;
        })();
        (function removeNonRelevantSeasonalLitany() {
            let seasonal = Array.from(btnDocFragment.querySelectorAll('.Row'));
            seasonal = seasonal.filter(row => row.dataset.root.includes('SeasonalLitanyOf'));
            let dataRoot;
            if (closingHymn.Season === closingHymnAll[0].Season)
                dataRoot = 'SeasonalLitanyOfThe' + closingHymn.Season; //River
            else if (closingHymn.Season === closingHymnAll[1].Season)
                dataRoot = 'SeasonalLitanyOfThe' + closingHymn.Season; //Plants
            else if (closingHymn.Season === closingHymnAll[2].Season)
                dataRoot = 'SeasonalLitanyOfThe' + closingHymn.Season; //Hervest
            seasonal.filter(row => !row.dataset.root.includes(dataRoot)).forEach(row => row.remove());
            ;
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
        alert('The prayers of this mass have not yet been added. We hope they will be ready soon');
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
        btnMassUnBaptised.prayersSequence = [...MassPrayersSequences.MassUnbaptized];
        //Adding children buttons to btnMassUnBaptised
        btnMassUnBaptised.children = [...btnDayReadings.children];
        btnMassUnBaptised.children.splice(0, 1);
        btnMassUnBaptised.children.splice(btnMassUnBaptised.children.length - 1, 1);
        //Replacing AllelujaFayBabi according to the day
        (function replaceAllelujahFayBabi() {
            if ((Season === Seasons.GreatLent
                || Season === Seasons.JonahFast)
                && todayDate.getDay() !== 0
                && todayDate.getDay() !== 6) {
                //Inserting "Alleluja E Ikhon" before "Allelujah Fay Bibi"
                btnMassUnBaptised
                    .prayersSequence
                    .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 2, Prefix.massCommon + "HallelujahFayBiBiGreatLent&D=$Seasons.GreatLent");
                //Removing "Allelujah Fay Bibi" and "Allelujha Ge Ef Mev'i"
                btnMassUnBaptised
                    .prayersSequence
                    .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 1);
            }
            else if ((isFast
                && todayDate.getDay() !== 0
                && todayDate.getDay() !== 6)
                || (Season === Seasons.NoSeason
                    && (todayDate.getDay() === 3
                        || todayDate.getDay() === 5))) {
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
            let dataRoot = Prefix.commonIncense + "PrayThatGodHaveMercyOnUsIfBishop&D=$copticFeasts.AnyDay";
            let godHaveMercyHtml = selectElementsByDataRoot(btnDocFragment, dataRoot.split('IfBishop')[0], { startsWith: true }); //We select all the paragraphs not only the paragraph for the Bishop
            godHaveMercyHtml
                .filter(htmlRow => godHaveMercyHtml.indexOf(htmlRow) > 0
                && godHaveMercyHtml.indexOf(htmlRow) < godHaveMercyHtml.length - 1)
                .forEach(htmlRow => htmlRow.remove());
            let godHaveMercy = IncensePrayersArray.find(tbl => tbl[1] && splitTitle(tbl[1][0])[0] === dataRoot); //We get the whole table not only the second row. Notice that the first row of the table is the row containing the title
            if (!godHaveMercy)
                return console.log('Didn\'t find table Gode Have Mercy');
            addExpandablePrayer({
                insertion: godHaveMercyHtml[0].nextElementSibling,
                btnID: 'godHaveMercy',
                label: {
                    AR: godHaveMercy[1][4],
                    FR: godHaveMercy[1][2], //this is the French text of the label
                },
                prayers: [[godHaveMercy[2], godHaveMercy[3]]],
                languages: btnMassUnBaptised.languages
            });
        })();
        if (Season === Seasons.GreatLent
            || Season === Seasons.JonahFast) {
            //Inserting psaume 'His Foundations In the Holy Montains' before the absolution prayers
            insertPrayersAdjacentToExistingElement({
                tables: btnMassUnBaptised.prayersArray
                    .filter(table => splitTitle(table[0][0])[0] === Prefix.massCommon + "HisFoundationsInTheHolyMountains&D=GreatLent"),
                languages: btnMassUnBaptised.languages,
                position: {
                    beforeOrAfter: 'beforebegin',
                    el: selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "AbsolutionForTheFather&D=$copticFeasts.AnyDay", { equal: true })[0]
                },
                container: btnDocFragment
            });
        }
        let readingsAnchor = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'ReadingsPlaceHolder&D=&D=$copticFeasts.AnyDay', { equal: true })[0]; //this is the html element before which we will insert all the readings and responses
        let reading;
        (function insertStPaulReading() {
            reading = ReadingsArrays.StPaulArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.stPaul + '&D=' + copticReadingsDate);
            reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            //adding the  end of the St Paul reading
            if (reading.length === 0)
                return;
            //Adding the reading end
            reading.push([[splitTitle(reading[0][0][0])[0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.stPaulEnd.AR, ReadingsIntrosAndEnds.stPaulEnd.FR, ReadingsIntrosAndEnds.stPaulEnd.EN]]);
            //Inserting the reading intro after the title
            reading[0].splice(1, 0, [
                splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro',
                ReadingsIntrosAndEnds.stPaulIntro.AR,
                ReadingsIntrosAndEnds.stPaulIntro.FR,
                ReadingsIntrosAndEnds.stPaulIntro.EN
            ]); //We replace the first row in the first table of reading (which is the title of the Praxis, with the introduction table
            insertPrayersAdjacentToExistingElement({
                tables: reading,
                languages: readingsLanguages,
                position: { beforeOrAfter: 'beforebegin', el: readingsAnchor },
                container: btnDocFragment
            });
        })();
        (function insertKatholikon() {
            reading = ReadingsArrays.KatholikonArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.katholikon + '&D=' + copticReadingsDate);
            if (reading.length === 0)
                return;
            reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            //ading the introduction and the end of the Katholikon
            reading.push([[
                    splitTitle(reading[0][0][0])[0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.katholikonEnd.AR, ReadingsIntrosAndEnds.katholikonEnd.FR, ReadingsIntrosAndEnds.katholikonEnd.EN
                ]]);
            //Inserting the reading intro after the title
            reading[0].splice(1, 0, [splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.katholikonIntro.AR, ReadingsIntrosAndEnds.katholikonIntro.FR, ReadingsIntrosAndEnds.katholikonIntro.EN
            ]); //We replace the second row in the table of reading (which is the title of the Katholikon, with the introduction table)
            insertPrayersAdjacentToExistingElement({
                tables: reading,
                languages: readingsLanguages,
                position: { beforeOrAfter: 'beforebegin', el: readingsAnchor },
                container: btnDocFragment
            });
        })();
        (function insertPraxis() {
            reading = ReadingsArrays.PraxisArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.praxis + '&D=' + copticReadingsDate);
            if (reading.length === 0)
                return;
            reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            reading.push([[splitTitle(reading[0][0][0])[0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.praxisEnd.AR, ReadingsIntrosAndEnds.praxisEnd.FR, ReadingsIntrosAndEnds.praxisEnd.EN]]);
            //Inserting the reading intro after the title
            reading[0].splice(1, 0, [splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.praxisIntro.AR, ReadingsIntrosAndEnds.praxisIntro.FR, ReadingsIntrosAndEnds.praxisIntro.EN]); //We replace the first row in the first table of reading (which is the title of the Praxis, with the introduction table
            insertPrayersAdjacentToExistingElement({
                tables: reading,
                languages: readingsLanguages,
                position: { beforeOrAfter: 'beforebegin', el: readingsAnchor },
                container: btnDocFragment
            });
            (function insertPraxisResponse() {
                let praxis = selectElementsByDataRoot(btnDocFragment, Prefix.praxis + '&D=', { startsWith: true }); //This is the praxis reading
                if (praxis.length === 0)
                    return;
                let annualResponse; //This is the praxis response for any ordinary day (it is included by default)
                (function moveAnnualResponseBeforePraxis() {
                    //Moving the annual response
                    annualResponse = selectElementsByDataRoot(btnDocFragment, Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay", { equal: true });
                    if (!annualResponse || annualResponse.length === 0)
                        return console.log('error: annual = ', annualResponse);
                    annualResponse
                        .forEach(htmlRow => praxis[0].insertAdjacentElement('beforebegin', htmlRow));
                })();
                let response = PrayersArrays
                    .PraxisResponsesPrayersArray
                    .filter(table => selectFromMultiDatedTitle(table[0][0], copticDate)
                    || selectFromMultiDatedTitle(table[0][0], Season));
                if (!response || response.length === 0)
                    return;
                (function insertSpecialResponse() {
                    if (Season === Seasons.GreatLent) {
                        //If a Praxis response was found
                        // The query should yield to  2 tables ('Sundays', and 'Week') for this season. We will keep the relevant one accoding to the date
                        if (todayDate.getDay() === 0
                            || todayDate.getDay() === 6)
                            response = [response.find(table => table[0][0].includes('Sundays&D='))];
                        else
                            response = [response.find(table => table[0][0].includes('Week&D='))];
                    }
                    ;
                    insertPrayersAdjacentToExistingElement({
                        tables: response,
                        languages: prayersLanguages,
                        position: { beforeOrAfter: 'beforebegin', el: annualResponse[0] },
                        container: btnDocFragment
                    });
                    //We remove the first 2 rows of the Annual response
                    annualResponse.forEach(htmlRow => { if (annualResponse.indexOf(htmlRow) < 2)
                        htmlRow.remove(); });
                })();
            })();
        })();
        (function insertSynaxarium() {
            reading = ReadingsArrays.SynaxariumArray.filter(table => splitTitle(table[0][0])[0] === Prefix.synaxarium + '&D=' + copticDate);
            if (reading.length === 0)
                return;
            reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            reading[0].splice(1, 0, [
                splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.synaxariumIntro.FR.replace('theday', Number(copticDay).toString()).replace('themonth', copticMonths[Number(copticMonth)].FR),
                ReadingsIntrosAndEnds.synaxariumIntro.AR.replace('theday', Number(copticDay).toString()).replace('themonth', copticMonths[Number(copticMonth)].AR),
                ReadingsIntrosAndEnds.synaxariumIntro.EN.replace('theday', Number(copticDay).toString()).replace('themonth', copticMonths[Number(copticMonth)].EN),
            ]);
            reading[0].splice(0, 1, [
                splitTitle(reading[0][0][0])[0] + '&C=Title',
                'Synixaire' + '\n' + Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].FR,
                'السنكسار' + '\n' + Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].AR,
            ]);
            let praxisElements = selectElementsByDataRoot(btnDocFragment, Prefix.praxis + '&D=', { startsWith: true });
            if (praxisElements.length === 0)
                return;
            let anchor = {
                beforeOrAfter: 'beforebegin',
                el: praxisElements[praxisElements.length - 1].nextElementSibling,
            };
            reading
                .forEach(table => {
                table
                    .map(row => {
                    return createHtmlElementForPrayer({
                        tblRow: row,
                        languagesArray: ['FR', 'AR'],
                        position: anchor
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
                        beforeOrAfter: 'beforebegin',
                        el: readingsAnchor
                    },
                    container: btnDocFragment
                });
            }
        })();
        (function insertGospelReading() {
            //Inserting the Gospel Reading
            getGospelReadingAndResponses(Prefix.gospelMass, {
                prayersArray: ReadingsArrays.GospelMassArray,
                languages: readingsLanguages
            }, btnDocFragment);
        })();
        (async function insertBookOfHoursButton() {
            if (copticReadingsDate === copticFeasts.Resurrection
                || copticDate === copticFeasts.Nativity
                || copticDate === copticFeasts.Baptism)
                //In these feasts we don't pray any hour
                return;
            let hoursBtns = btnBookOfHours.onClick(true); //We get buttons for the relevant hours according to the day
            if (!hoursBtns)
                return;
            (function selectRelevantHoursAccordingToTheDay() {
                //args.mass is a boolean that tells whether the button prayersArray should include all the hours of the Book Of Hours, or only those pertaining to the mass according to the season and the day on which the mass is celebrated
                let hours = [hoursBtns[1], hoursBtns[2], hoursBtns[3]]; //Those are the 3rd, 6th and 9th hours
                if ((Season === Seasons.GreatLent
                    || Season === Seasons.JonahFast)
                    && todayDate.getDay() !== 0
                    && todayDate.getDay() !== 6)
                    //We are during the Great Lent, we pray the 3rd, 6th, 9th, 11th, and 12th hours
                    hours.push(hoursBtns[4], hoursBtns[5]);
                else if (todayDate.getDay() === 0
                    || todayDate.getDay() === 6 //Whatever the period, if we are a Saturday or a Sunday, we pray only the 3rd and 6th Hours
                    || lordFeasts.indexOf(copticDate) > -1
                    || Season === Seasons.PentecostalDays
                    || Season === Seasons.Nayrouz
                    || Season === Seasons.CrossFeast
                    || (!isFast
                        && todayDate.getDay() !== 3
                        && todayDate.getDay() !== 5))
                    //We are a Sunday or a Saturday, or during the 50 Pentecostal days, or on a Lord Feast day, or we are during a no fast period
                    hours.pop(); //we remove the 9th hour
                hoursBtns = hours;
            })();
            let masterBtnDiv = document.createElement('div'); //This is the div that will contain the master button which shows or hides the Book of Hours sub buttons
            masterBtnDiv.classList.add(inlineBtnsContainerClass);
            masterBtnDiv.id = 'masterBOHBtn';
            let btnsDiv = document.createElement('div'); //This is the div that contains the sub buttons for each Hour of the Book of Hours
            btnsDiv.classList.add(inlineBtnsContainerClass);
            btnsDiv.classList.add(hidden);
            let masterBtn = new Button({
                btnID: 'BOH_Master',
                label: {
                    AR: 'الأجبية',
                    FR: 'Agpia'
                },
                onClick: () => {
                    //We toggle the div containing the buttons for each hour
                    btnsDiv.classList.toggle(hidden);
                    if (btnsDiv.classList.contains(hidden)) {
                        btnsDiv.style.top = '';
                        btnsDiv.style.position = '';
                        createFakeAnchor(btnsDiv.id);
                    }
                    ;
                }
            });
            masterBtnDiv
                .prepend(createBtn({ btn: masterBtn, btnsContainer: masterBtnDiv, btnClass: inlineBtnClass, clear: true, onClick: masterBtn.onClick })); //We add the master button to the bookOfHoursMasterDiv
            let createdElements;
            //We will create a button and an expandable div for each hour
            hoursBtns
                .reverse() //We reverse the buttons in order to get them arranged in the order from right to left (i.e: 3rdHour, 6thHour, etc.)
                .forEach(async (btn) => {
                btn.onClick(true); //We call the onClick() method of the btn in order to build its prayersSequence and prayersArray properties
                InsertHourFinalPrayers(btn); //Inserting Kyrielison 41 times, Agios, Holy God of Sabaot, etc.
                //We will filter the btn.prayersSequence in order to keep only those prayers tables (string[][]) matching the btn.prayersSequence order
                let filteredPrayers = btn.prayersSequence
                    .map(title => {
                    return btn.prayersArray
                        .filter(tbl => splitTitle(tbl[0][0])[0] === title)[0];
                });
                //We will create an 'expandable' html button and div for the hour button
                createdElements =
                    addExpandablePrayer({
                        insertion: btnDocFragment.children[0],
                        btnID: btn.btnID,
                        label: btn.label,
                        prayers: filteredPrayers,
                        languages: btnBookOfHours.languages
                    });
                addOnClickToHourBtn(createdElements[0]);
                btnsDiv.appendChild(createdElements[0]); //We add all the buttons to the same div instead of 3 divs;
                collapseAllTitles(Array.from(createdElements[1].children)); //We collapse all the titles
                if (localStorage.displayMode === displayModes[1]) {
                    //If we are in the 'Presentation Mode'
                    Array.from(createdElements[1].querySelectorAll('div.Row'))
                        .filter((row) => row.dataset.root.includes('HourPsalm') || row.dataset.root.includes('EndOfHourPrayer'))
                        .forEach(row => row.remove()); //we remove all the psalms and keep only the Gospel and the Litanies,
                    Array.from(sideBarTitlesContainer.children)
                        .filter((row) => row.dataset.root.includes('HourPsalm')
                        || row.dataset.root.includes('EndOfHourPrayer'))
                        .forEach(row => row.remove()); //We do the same for the titles
                }
                ;
            });
            function addOnClickToHourBtn(hourBtn) {
                hourBtn
                    .addEventListener('click', async () => {
                    Array.from(containerDiv.children)
                        .filter(div => div.id.endsWith('Expandable'))
                        .forEach((expandableDiv) => {
                        if (!expandableDiv.id.startsWith(hourBtn.id)
                            && !expandableDiv.classList.contains(hidden)) {
                            //This is the container of another hour than the hour linked to the button (btn), we hidde any such container in ordr to keep only the prayers of the button's hour
                            expandableDiv.classList.add(hidden);
                            collapseAllTitles(Array.from(expandableDiv.children));
                            hideOrShowAllTitlesInAContainer(expandableDiv, true);
                        }
                        else if (expandableDiv.id.startsWith(hourBtn.id)) {
                            //this is the container of the prayers related to the button
                            if (!expandableDiv.classList.contains(hidden)) {
                                makeExpandableButtonContainerFloatOnTop(btnsDiv, '5px');
                                masterBtnDiv.classList.add(hidden);
                                createFakeAnchor(expandableDiv.id);
                            }
                            else {
                                btnsDiv.style.top = '';
                                btnsDiv.style.position = '';
                                masterBtnDiv.classList.remove(hidden);
                                createFakeAnchor(btnsDiv.id);
                            }
                            ;
                        }
                    });
                });
            }
            ;
            btnDocFragment.prepend(btnsDiv);
            btnDocFragment.prepend(masterBtnDiv);
            btnsDiv.style.display = 'grid';
            btnsDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsDiv, 3);
            function InsertHourFinalPrayers(hourBtn) {
                let Agios = Prefix.commonPrayer + 'HolyGodHolyPowerfull&D=$copticFeasts.AnyDay', Kyrielison41Times = Prefix.commonPrayer + 'Kyrielison41Times&D=$copticFeasts.AnyDay', KyrielisonIntro = Kyrielison41Times.replace('&D=', 'NoMassIntro&D='), KyrielisonMassIntro = Kyrielison41Times.replace('&D=', 'MassIntro&D='), HolyLordOfSabaot = Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay', HailToYouMaria = Prefix.commonPrayer + 'WeSaluteYouMary&D=$copticFeasts.AnyDay', WeExaltYou = Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Creed = Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay', OurFatherWhoArtInHeaven = Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay';
                let litanies, lastLitany, sequence;
                litanies = hourBtn.prayersSequence.filter(title => title.includes('HourLitanies'));
                lastLitany = litanies[litanies.length - 1];
                //!CAUTION, the order of the buttons in hourBtn is reversed (eg.: [9th, 6th, 3rd] instead of [3rd, 6th, 9th])
                if (hoursBtns.indexOf(hourBtn) === 0) {
                    //This is the last hour because the ours are inversed
                    hourBtn.prayersArray.push(CommonPrayersArray
                        .filter(tbl => splitTitle(tbl[0][0])[0] === KyrielisonMassIntro)[0]);
                    sequence =
                        [
                            WeExaltYou,
                            Creed,
                            KyrielisonMassIntro,
                            Kyrielison41Times,
                            HolyLordOfSabaot,
                            OurFatherWhoArtInHeaven
                        ];
                }
                else if (hoursBtns.indexOf(hourBtn) === 1) {
                    //this is the before last
                    sequence =
                        [
                            Agios,
                            OurFatherWhoArtInHeaven,
                            HailToYouMaria
                        ];
                }
                else {
                    //Any other hour before the 2 last
                    sequence =
                        [
                            KyrielisonIntro,
                            Kyrielison41Times,
                            HolyLordOfSabaot,
                            OurFatherWhoArtInHeaven
                        ];
                }
                ;
                insertCommonPrayer(hourBtn, sequence, lastLitany);
                function insertCommonPrayer(btn, titles, lastLitany) {
                    if (!titles || titles.length === 0)
                        return console.log('no sequence');
                    btn.prayersSequence.splice(btn.prayersSequence.indexOf(lastLitany) + 1, 0, ...titles);
                }
            }
            ;
            //Collapsing all the Titles
            collapseAllTitles(Array.from(btnDocFragment.children));
            btnDocFragment.getElementById('masterBOHBtn').classList.toggle(hidden); //We remove hidden from btnsDiv
        })();
    }
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
            languages: ['FR', "AR"],
            onClick: function () {
                //We can't use an arrow function here because we need to use this
                this.prayersSequence = [Prefix.synaxarium + '&D=' + copticDate];
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
            prayersSequence: [Prefix.gospelMass + "Psalm", Prefix.gospelMass + "Gospel"],
            prayersArray: ReadingsArrays.GospelMassArray,
            languages: [...readingsLanguages],
            onClick: () => {
                scrollToTop(); //scrolling to the top of the page
            },
        })
    ],
    label: {
        AR: "قراءات اليوم",
        FR: "Lectures du jour",
        EN: "Day's Readings"
    },
    onClick: (args = { returnBtnChildren: false }) => {
        if (Season === Seasons.HolyWeek) {
            //We should put here child buttons for the Holy Week prayers and readings
            let div = document.createElement('div');
            div.innerText = 'We are during the Holy Week, there are no readings, please go to the Holy Week Prayers';
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
        btn.prayersSequence = [Prefix.gospelVespers + "Psalm&D=", Prefix.gospelVespers + "Gospel&D="]; //!We need this to be set when the button is clicked not when it is declared because we add the date to it, which changes its value each time the button is clicked
        console.log('this = ', this);
        btnReadingsGospelIncenseVespers.prayersArray = ReadingsArrays.GospelVespersArray;
        if (args && args.returnGospelPrefix)
            return Prefix.gospelVespers; //!this must come after the prayersArray has been set
        let date = getTomorowCopticReadingDate();
        console.log(date);
        if (args && args.returnDate)
            return date;
        //We add the psalm reading to the begining of the prayersSequence
        btn.prayersSequence = btn.prayersSequence.map(title => title += date);
        scrollToTop(); //scrolling to the top of the page
        function getTomorowCopticReadingDate() {
            let today = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).
            return getSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today.getTime(), false)[1], today);
        }
        ;
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
    prayersSequence: [Prefix.gospelNight + "Psalm", Prefix.gospelNight + "Gospel"],
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
    btnID: 'btnBookOfHours',
    label: { AR: 'الأجبية', FR: 'Agpia', EN: 'Book of Hours' },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: (returnBtnChildren = false) => {
        let Kenin = Prefix.commonPrayer + 'NowAlwaysAndForEver&D=$copticFeasts.AnyDay', ZoksaPatri = Prefix.commonPrayer + 'GloryToTheFatherTheSonAndTheSpirit&D=$copticFeasts.AnyDay', gospelEnd = Prefix.bookOfHours + 'GospelEnd&D=$copticFeasts.AnyDay', OurFatherWhoArtInHeaven = Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay', AngelsPrayers = Prefix.commonPrayer + 'AngelsPrayer&D=$copticFeasts.AnyDay', HailToYouMaria = Prefix.commonPrayer + 'WeSaluteYouMary&D=$copticFeasts.AnyDay', WeExaltYou = Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Agios = Prefix.commonPrayer + 'HolyGodHolyPowerfull&D=$copticFeasts.AnyDay', Kyrielison41Times = Prefix.commonPrayer + 'Kyrielison41Times&D=$copticFeasts.AnyDay', KyrielisonIntro = Kyrielison41Times.replace('&D=', 'NoMassIntro&D='), HolyLordOfSabaot = Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay', Creed = Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay', Hallelujah = Prefix.bookOfHours + 'PsalmEnd&D=$copticFeasts.AnyDay', EndOfAllHours = Prefix.bookOfHours + '1stHourEndOfAllHoursPrayer&D=$copticFeasts.AnyDay', HourIntro = [
            Prefix.commonPrayer + 'ThanksGivingPart1&D=$copticFeasts.AnyDay',
            Prefix.commonPrayer + 'ThanksGivingPart2&D=$copticFeasts.AnyDay',
            Prefix.commonPrayer + 'ThanksGivingPart3&D=$copticFeasts.AnyDay',
            Prefix.commonPrayer + 'ThanksGivingPart4&D=$copticFeasts.AnyDay',
            Prefix.bookOfHours + 'AnyHourPsalm50&D=$copticFeasts.AnyDay'
        ], DawnPsalms = [
            Prefix.bookOfHours + '6thHourPsalm62&D=$copticFeasts.AnyDay',
            Prefix.bookOfHours + '6thHourPsalm66&D=$copticFeasts.AnyDay',
            Prefix.bookOfHours + '6thHourPsalm69&D=$copticFeasts.AnyDay',
            Prefix.bookOfHours + '9thHourPsalm112&D=$copticFeasts.AnyDay',
        ];
        btnBookOfHours.children = [];
        let commonPrayers = getCommonPrayers();
        function getCommonPrayers() {
            let commonPrayers = [
                ...CommonPrayersArray
                    .filter(table => splitTitle(table[0][0])[0] === ZoksaPatri
                    || splitTitle(table[0][0])[0] === Kenin
                    || splitTitle(table[0][0])[0] === HolyLordOfSabaot
                    || splitTitle(table[0][0])[0] === HailToYouMaria
                    || splitTitle(table[0][0])[0] === WeExaltYou
                    || splitTitle(table[0][0])[0] === Creed
                    || splitTitle(table[0][0])[0] === OurFatherWhoArtInHeaven
                    || splitTitle(table[0][0])[0] === AngelsPrayers
                    || splitTitle(table[0][0])[0] === Kyrielison41Times
                    || splitTitle(table[0][0])[0] === KyrielisonIntro
                    || splitTitle(table[0][0])[0] === Agios
                    || splitTitle(table[0][0])[0] === Agios.replace('Part1', 'Part2')
                    || new RegExp(Prefix.commonPrayer + 'ThanksGivingPart\\d{1}\\&D\\=\\$copticFeasts.AnyDay').test(splitTitle(table[0][0])[0]))
            ];
            commonPrayers.push(...PrayersArrays.bookOfHoursPrayersArray
                .filter(tbl => splitTitle(tbl[0][0])[0] === HourIntro[HourIntro.length - 1] //this is Psalm 50
                || splitTitle(tbl[0][0])[0] === gospelEnd
                || splitTitle(tbl[0][0])[0] === Hallelujah
                || splitTitle(tbl[0][0])[0] === EndOfAllHours));
            return commonPrayers;
        }
        ;
        (function addAChildButtonForEachHour() {
            for (let hour in bookOfHours) {
                if (!hour.endsWith('PrayersArray'))
                    continue;
                let hourName = hour.split('PrayersArray')[0];
                let hourBtn = new Button({
                    btnID: 'btn' + hourName,
                    label: {
                        AR: bookOfHoursLabels.filter(label => label.id === hourName)[0].AR,
                        FR: bookOfHoursLabels.filter(label => label.id === hourName)[0].FR
                    },
                    languages: btnBookOfHours.languages,
                    showPrayers: true,
                    onClick: (returnBtnChildren = false) => hourBtnOnClick(hourBtn, returnBtnChildren),
                    afterShowPrayers: () => Array.from(containerDiv.querySelectorAll('.Row'))
                        .forEach(htmlRow => {
                        htmlRow.classList.replace('Priest', 'NoActor');
                        htmlRow.classList.replace('Diacon', 'NoActor');
                        htmlRow.classList.replace('Assembly', 'NoActor');
                    })
                });
                //Adding the onClick() property to the button
                function hourBtnOnClick(btn, returnBtnChildren = false) {
                    (function buildBtnPrayersSequence() {
                        //We will add the prayers sequence to btn.prayersSequence[]
                        let endOfHourPrayers = [AngelsPrayers, Agios, Agios.replace('Part1', 'Part2'), OurFatherWhoArtInHeaven, HailToYouMaria, WeExaltYou, Creed, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven];
                        btn.prayersSequence =
                            bookOfHours[hour]
                                .map(table => splitTitle(table[0][0])[0]); //we add all the titles to the prayersSequence
                        (function addCommonSequences() {
                            if (returnBtnChildren)
                                return;
                            btn.prayersSequence
                                .splice(1, 0, ...HourIntro); //We also add the titles in HourIntro before the 1st element of btn.prayersSequence[]
                            if (btn.btnID !== Object.keys(bookOfHours)[0].split('PrayersArray')[0]
                                && btn.btnID !== Object.keys(bookOfHours)[10].split('PrayersArray')[0]) {
                                //If its is not the 1st Hour (Dawn) or the 12th Hour (Night), we insert only Kyrielison 41 times, and "Holy Lord of Sabaot" and "Our Father Who Art In Heavean"  
                                btn.prayersSequence
                                    .splice(btn.prayersSequence.length - 1, 0, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven);
                                //Then, we finally add the 'End of all Hours' prayers (ارحمنا يا الله ثم ارحمنا)
                                btn.prayersSequence.push(EndOfAllHours);
                            }
                            ;
                            if (btn.btnID === Object.keys(bookOfHours)[0].split('PrayersArray')[0]) {
                                //If it is the 1st hour (Dawn) prayer:
                                //We add the psalms borrowed from the 6ths and 9th hour: Psalms 66, 69, 122 etc.), before pasalm 142
                                btn.prayersSequence
                                    .splice(btn.prayersSequence.indexOf(Prefix.bookOfHours + '1stHourPsalm142&D=$copticFeasts.AnyDay'), 0, ...DawnPsalms);
                                //We add the whole set of prayers included in the endOfHoursPrayers array
                                btn.prayersSequence
                                    .splice(btn.prayersSequence.indexOf(Prefix.bookOfHours + "1stHourEndOfHourPrayer1&D=$copticFeasts.AnyDay"), 0, ...endOfHourPrayers);
                            }
                            ;
                            if (btn.btnID === Object.keys(bookOfHours)[10].split('PrayersArray')[0]) {
                                //It is the 12th (Night) Hour
                                btn.prayersSequence.push(EndOfAllHours);
                                //We add the whole set of prayers included in the edofHoursPrayers array. We make a copy of the array
                                let copy = [...endOfHourPrayers];
                                //we remove the Angels Prayer
                                copy.splice(0, 1);
                                btn.prayersSequence.splice(btn.prayersSequence.indexOf(Prefix.bookOfHours + '12thHourEndOfHourPrayer&D=$copticFeasts.AnyDay'), 0, ...copy);
                            }
                        })();
                    })();
                    (function insertZoksaPatryInBtnPrayersSequence() {
                        let litanies = btn.prayersSequence
                            .filter(title => title.includes('Litanies'));
                        let prayer;
                        litanies
                            .forEach(tblTitle => {
                            if (litanies.indexOf(tblTitle) === 0)
                                return; //this is the title of the litanies section
                            if (litanies.indexOf(tblTitle) === 1
                                || litanies.indexOf(tblTitle) === 4)
                                prayer = ZoksaPatri; //If it is the 1st or 4th litany (litanies[0] is the title), we insert Zoksa patry
                            else if (litanies.indexOf(tblTitle) !== litanies.length - 1)
                                prayer = Kenin; //If it is not the last litnay
                            btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, prayer);
                        });
                    })();
                    (function insertPsalmAndGospelEndsInBtnPrayersSequence() {
                        btn.prayersSequence
                            .filter(title => title.includes('Psalm')
                            || title.includes('Gospel&D=$copticFeasts.AnyDay'))
                            .forEach(tblTitle => {
                            if (tblTitle.includes('Gospel')
                                && btn.prayersSequence[btn.prayersSequence.indexOf(tblTitle) + 1] !== gospelEnd) //Inserting the Gosepl End
                             {
                                btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, gospelEnd);
                            }
                            else if (tblTitle.includes('Psalm')
                                && btn.prayersSequence[btn.prayersSequence.indexOf(tblTitle) + 1] !== Hallelujah) {
                                btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, Hallelujah);
                            }
                            ;
                        });
                    })();
                    (function pushCommonPrayersToBtnPrayersArray() {
                        btn.prayersArray = [...bookOfHours[hour]].concat([...commonPrayers]);
                        if (btn.btnID === 'Dawn') {
                            btn.prayersArray
                                .push(...DawnPsalms
                                .map(psalm => PrayersArrays.bookOfHoursPrayersArray
                                .filter(tbl => splitTitle(tbl[0][0])[0] === psalm)[0]));
                        }
                        ;
                    })();
                }
                ;
                btnBookOfHours.children.push(hourBtn);
            }
            ;
        })();
        if (returnBtnChildren)
            return btnBookOfHours.children;
        scrollToTop();
        return btnBookOfHours.prayersSequence;
    }
});
/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayers(liturgy) {
    //this function sets the date or the season for the Psalm response and the gospel response
    const prayersSequence = [
        Prefix.psalmResponse + '&D=',
        liturgy + 'Psalm&D=',
        liturgy + 'Gospel&D=',
        Prefix.gospelResponse + '&D='
    ]; //This is the generic sequence for the prayers related to the lecture of the gospel at any liturgy (mass, incense office, etc.). The OnClick function triggered by the liturgy, adds the dates of the readings and of the psalm and gospel responses
    let date;
    let psalmResponse = prayersSequence[0], gospelResponse = prayersSequence[3];
    //setting the psalm and gospel responses
    (function setPsalmAndGospelResponses() {
        if (lordFeasts.indexOf(copticDate) > -1) {
            //This means we are on a Lord Feast, there is always a specific gospel and psalm response for these feasts, even when it falls during the Great Lent (Annonciation does sometimes)
            addDate(copticDate);
        }
        else if (Number(copticDay) === 29
            && [4, 5, 6].indexOf(Number(copticMonth)) < 0) {
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
        else if (Season === Seasons.Kiahk) {
            // we are during Kiahk month: the first 2 weeks have their own gospel response, and the second 2 weeks have another gospel response
            if (checkWhichSundayWeAre(Number(copticDay), todayDate.getDay()) === ("1stSunday" || "2ndSunday")) {
                gospelResponse = gospelResponse.replace("&D=", "1&D=");
            }
            else {
                gospelResponse = gospelResponse.replace("&D=", "2&D=");
            }
            ;
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
                todayDate.getDay() === 0
                    || todayDate.getDay() === 6
                    ? (gospelResponse = gospelResponse.replace("&D=", "Sundays&D="))
                    : gospelResponse = gospelResponse.replace("&D=", "Week&D=");
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
    ;
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
            btnID: "GoTo_" + btn.btnID.split('btn')[1] + "_From_" + position.el.dataset.root,
            label: {
                AR: btn.label.AR,
                FR: btn.label.FR,
            },
            cssClass: inlineBtnClass,
            onClick: () => {
                showChildButtonsOrPrayers(btn); //We simulated as if btn itself has been clicked, which will show all its prayers, children, etc.
                //if there is an element in containerDiv having the same data-root as targetElement
                if (containerDiv.querySelector('#' + btnsContainerID))
                    createFakeAnchor(btnsContainerID);
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
        return console.log('the button passed as argument does not have prayersArray');
    if (!gospelInsertionPoint)
        gospelInsertionPoint =
            selectElementsByDataRoot(container, Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay", { equal: true })[0];
    //We start by inserting the standard Gospel Litany
    (function insertGospelLitany() {
        let gospelLitanySequence = [
            Prefix.commonPrayer + "GospelPrayer&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "GospelIntroduction&D=$copticFeasts.AnyDay",
        ]; //This is the sequence of the Gospel Prayer/Litany for any liturgy
        let gospelLitanyPrayers = gospelLitanySequence
            .map(title => findTableInPrayersArray(title, PrayersArrays.CommonPrayersArray));
        if (!gospelLitanyPrayers || gospelLitanyPrayers.length === 0)
            return;
        insertPrayersAdjacentToExistingElement({
            tables: gospelLitanyPrayers,
            languages: prayersLanguages,
            position: {
                beforeOrAfter: 'beforebegin',
                el: gospelInsertionPoint
            },
            container: container
        });
    })();
    if (new Map(JSON.parse(localStorage.showActors)).get("Diacon") === false)
        return alert("Diacon Prayers are set to hidden, we cannot show the gospel"); //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers
    let anchorDataRoot = Prefix.commonPrayer + 'GospelIntroduction&D=$copticFeasts.AnyDay';
    let gospelIntroduction = selectElementsByDataRoot(container, anchorDataRoot, { equal: true });
    if (gospelIntroduction.length === 0)
        return console.log('gospelIntroduction.length = 0 ', gospelIntroduction);
    let responses = setGospelPrayers(liturgy); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']
    //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
    let date = copticReadingsDate;
    if (liturgy === Prefix.gospelVespers) {
        date = btnReadingsGospelIncenseVespers.onClick({ returnDate: true });
    }
    ;
    let gospel = btn.prayersArray.filter((table) => splitTitle(table[0][0])[0] === responses[1] + date //this is the pasalm text
        || splitTitle(table[0][0])[0] === responses[2] + date //this is the gospel itself
    ); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####". We should get a string[][][] of 2 elements: a table for the Psalm, and a table for the Gospel
    if (gospel.length === 0)
        return console.log('gospel.length = 0'); //if no readings are returned from the filtering process, then we end the function
    /**
     * Appends the gospel and psalm readings before gospelInsertionPoint(which is an html element)
     */
    (function insertPsalmAndGospel() {
        gospel
            .forEach((table) => {
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
                    beforeOrAfter: 'beforebegin',
                    el: el
                },
                container: container
            });
        });
    })();
    (function insertPsalmAndGospelResponses() {
        //Inserting the gospel response
        insertGospelOrPsalmResponse(3, Prefix.gospelResponse, gospelInsertionPoint);
        //We remove the insertion point placeholder
        gospelInsertionPoint.remove();
        let gospelPrayer = selectElementsByDataRoot(container, Prefix.commonPrayer + 'GospelPrayer&D=$copticFeasts.AnyDay', { equal: true }); //This is the 'Gospel Litany'. We will insert the Psalm response after its end
        if (!gospelPrayer)
            return;
        insertGospelOrPsalmResponse(0, Prefix.psalmResponse, gospelPrayer[gospelPrayer.length - 2].nextElementSibling);
    })();
    function insertGospelOrPsalmResponse(index, prefix, insertion) {
        let response = PrayersArrays.PsalmAndGospelPrayersArray
            .find(tbl => tbl[0][0].split('&D=')[0] === responses[index].split('&D=')[0]
            && selectFromMultiDatedTitle(tbl[0][0], responses[index].split('&D=')[1])); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (!response || response.length === 0)
            //If no specresponse response is found, we will get the 'annual' gospel response
            response =
                PrayersArrays.PsalmAndGospelPrayersArray
                    .find(tbl => splitTitle(tbl[0][0])[0] === prefix + '&D=$copticFeasts.AnyDay');
        if (!response || response.length === 0)
            return;
        insertPrayersAdjacentToExistingElement({
            tables: [response],
            languages: prayersLanguages,
            position: {
                beforeOrAfter: "beforebegin",
                el: insertion,
            },
            container: container
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
        prayersArray.map(table => {
            if (selectFromMultiDatedTitle(table[0][0], date) === true && !filtered.has(table))
                filtered.add(table);
        });
    }
    ;
    showMultipleChoicePrayersButton({
        filteredPrayers: Array.from(filtered),
        btn: btn,
        btnLabels: label,
        masterBtnID: masterBtnID,
        anchor: anchor
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
    if (!tableTitle.includes('&D='))
        return false;
    tableTitle = splitTitle(tableTitle)[0].split("&D=")[1];
    let dates = tableTitle.split("||");
    let parseDate = dates
        .map(date => {
        if (date.startsWith('$'))
            date = eval(date.replace('$', ''));
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
        return console.log('btn.docFragment is undefined = ', btn.docFragment);
    (async function InsertCymbalVerses() {
        let cymbalsPlaceHolder = selectElementsByDataRoot(btn.docFragment, Prefix.commonIncense + "CymbalVersesPlaceHolder&D=$copticFeasts.AnyDay", { equal: true })[0];
        if (!cymbalsPlaceHolder)
            return console.log('Didn\'t find cymbalsPlaceHolder');
        if (!cymbalsPlaceHolder)
            return console.log('We didn\'t find the cymbal verses placeholder');
        let sequence = [
            Prefix.cymbalVerses + "Wates&D=$copticFeasts.AnyDay",
            Prefix.cymbalVerses + "&D=$copticFeasts.AnyDay"
        ];
        if (todayDate.getDay() > 2)
            sequence[0] = sequence[0].replace('Wates&D', 'Adam&D');
        let feast;
        feast = Object.entries(copticFeasts).find(entry => entry[1] === copticDate); //We check if today is a feast
        if (!feast)
            feast = Object.entries(copticFeasts).find(entry => entry[1] === copticReadingsDate); //We also check by the copticReadingsDate because some feast are referrenced by the copticReadings date : eg. Pntl39
        if (!feast)
            feast = Object.entries(Seasons).find(entry => entry[1] === Season);
        if (feast)
            insertFeastInSequence(sequence, feast[1], 1);
        let cymbals = [];
        let cymbalTable;
        sequence
            .map(cymbalsTitle => {
            if (cymbalsTitle.startsWith('&Insert='))
                cymbalTable = PrayersArrays.CymbalVersesPrayersArray
                    .find(tbl => selectFromMultiDatedTitle(tbl[0][0], cymbalsTitle.split('&Insert=')[1]));
            else
                cymbalTable = findTableInPrayersArray(cymbalsTitle, PrayersArrays.CymbalVersesPrayersArray, { equal: true });
            cymbals.push(cymbalTable);
        });
        if (cymbals.length < 1)
            return console.log('cymbals= ', cymbals);
        insertPrayersAdjacentToExistingElement({
            tables: cymbals,
            languages: btn.languages,
            position: { beforeOrAfter: 'beforebegin', el: cymbalsPlaceHolder.nextElementSibling },
            container: btn.docFragment
        });
    })();
    (async function InsertCommonDoxologies() {
        let doxologiesPlaceHolder = selectElementsByDataRoot(btn.docFragment, Prefix.commonIncense + "DoxologiesPlaceHolder&D=$copticFeasts.AnyDay", { equal: true })[0];
        if (!doxologiesPlaceHolder)
            return console.log('Didn\'t find doxologiesPlaceholder');
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
            Prefix.doxologies + "EndOfDoxologiesWates&D=$copticFeasts.AnyDay"
        ];
        if (btn.btnID === btnIncenseVespers.btnID)
            sequence[0] = sequence[0].replace('Dawn', 'Vespers');
        let feast;
        //if the copticDate is a feast
        let excludeFeast = [saintsFeasts.StMina, saintsFeasts.StGeorge, saintsFeasts.StMarc, saintsFeasts.StMaykel]; //Those saints feast will be excluded because the doxologies of those saints are included by default
        if (excludeFeast.indexOf(copticDate) < 0)
            feast = Object.entries(saintsFeasts)
                .find(entry => entry[1] === copticDate);
        if (feast)
            insertFeastInSequence(sequence, feast[1], 1);
        feast = Object.entries(copticFeasts).find(entry => entry[1] === copticDate);
        //Else if the copticReadingsDate is a feast
        if (!feast)
            feast = Object.entries(copticFeasts).find(entry => entry[1] === copticReadingsDate);
        if (!feast)
            feast = Object.entries(Seasons).find(entry => entry[1] === Season);
        if (feast)
            insertFeastInSequence(sequence, feast[1], 0);
        let doxologies = [];
        sequence
            .map(doxologyTitle => {
            if (doxologyTitle.startsWith('&Insert='))
                PrayersArrays.DoxologiesPrayersArray
                    .filter(tbl => selectFromMultiDatedTitle(tbl[0][0], doxologyTitle.split('&Insert=')[1]))
                    .forEach(doxology => doxologies.push(doxology)); //!CAUTION: we must use 'filter' not 'find' because for certain feasts there are more than one doxology
            else
                doxologies
                    .push(findTableInPrayersArray(doxologyTitle, PrayersArrays.DoxologiesPrayersArray, { equal: true }));
        });
        if (doxologies.length === 0)
            return console.log('doxologies = ', doxologies);
        console.log('doxologies = ', doxologies);
        if (Season === Seasons.GreatLent) {
            //For the Great Lent, there is a doxology for the Sundays and 4 doxologies for the week days
            if (todayDate.getDay() === 0 || todayDate.getDay() === 6)
                doxologies = doxologies
                    .filter(tbl => tbl[0][0].includes('Seasons.GreatLent'))
                    .filter(tbl => !tbl[0][0].includes('Week'));
            else
                doxologies = doxologies
                    .filter(tbl => tbl[0][0].includes('Seasons.GreatLent'))
                    .filter(tbl => !tbl[0][0].includes('Sundays'));
        }
        ;
        insertPrayersAdjacentToExistingElement({
            tables: doxologies,
            languages: btn.languages,
            position: { beforeOrAfter: 'beforebegin', el: doxologiesPlaceHolder.nextElementSibling },
            container: btn.docFragment
        });
    })();
    function insertFeastInSequence(sequence, feastString, index) {
        if (lordFeasts.indexOf(feastString) < 0
            && Season !== Seasons.PentecostalDays)
            sequence.splice(index, 0, '&Insert=' + feastString);
        else
            sequence.splice(index, 1, '&Insert=' + feastString);
    }
}
;
async function removeElementsByTheirDataRoot(container = containerDiv, dataRoot) {
    selectElementsByDataRoot(container, dataRoot, { equal: true })
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
function addExpandablePrayer(args) {
    // if(!prayers || prayers.length ===0) return console.log(prayers);
    if (!args.insertion)
        return console.log('btnID = ', args.btnID);
    let btnDiv = document.createElement("div"); //Creating a div container in which the btn will be displayed
    btnDiv.classList.add(inlineBtnsContainerClass);
    args.insertion.insertAdjacentElement("beforebegin", btnDiv); //Inserting the div containing the button as 1st element of containerDiv
    let btnExpand = new Button({
        btnID: args.btnID,
        label: args.label,
        cssClass: inlineBtnClass,
        languages: args.languages,
        onClick: btnOnClick
    });
    return createBtnAndExpandableDiv();
    function createBtnAndExpandableDiv() {
        let createdButton = createBtn({ btn: btnExpand, btnsContainer: btnDiv, btnClass: btnExpand.cssClass, clear: true, onClick: btnExpand.onClick }); //creating the html element representing the button. Notice that we give it as 'click' event, the btn.onClick property, otherwise, the createBtn will set it to the default call back function which is showChildBtnsOrPrayers(btn, clear)
        createdButton.classList.add('expand'); //We need this class in order to retrieve the btn in Display Presentation Mode
        //We will create a newDiv to which we will append all the elements in order to avoid the reflow as much as possible
        let prayersContainerDiv = document.createElement('div');
        prayersContainerDiv.id = btnExpand.btnID + 'Expandable';
        prayersContainerDiv.classList.add(hidden);
        prayersContainerDiv.classList.add('Expandable');
        prayersContainerDiv.style.display = 'grid'; //This is important, otherwise the divs that will be add will not be aligned with the rest of the divs
        args.insertion.insertAdjacentElement('beforebegin', prayersContainerDiv);
        //We will create a div element for each row of each table in btn.prayersArray
        args.prayers.map(table => {
            showPrayers({
                wordTable: table,
                languages: btnExpand.languages,
                position: prayersContainerDiv,
                container: prayersContainerDiv,
                clearContainerDiv: false,
                clearRightSideBar: false
            });
        });
        Array.from(prayersContainerDiv.children)
            .filter(child => isTitlesContainer(child))
            .forEach(child => {
            addDataGroupsToContainerChildren(child.classList[child.classList.length - 1], prayersContainerDiv);
        });
        return [createdButton, prayersContainerDiv];
    }
    ;
    async function btnOnClick() {
        let prayersContainerDiv = containerDiv.querySelector('#' + btnExpand.btnID + 'Expandable');
        if (!prayersContainerDiv)
            return console.log('no collapsable div was found');
        prayersContainerDiv.classList.toggle(hidden);
        //Making the children classList match prayersContainerDiv classList
        if (prayersContainerDiv.classList.contains(hidden))
            hideOrShowAllTitlesInAContainer(prayersContainerDiv, true);
        else
            hideOrShowAllTitlesInAContainer(prayersContainerDiv, false);
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUJ1dHRvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL0RlY2xhcmVCdXR0b25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sTUFBTTtJQWlCVixZQUFZLEdBQWU7UUFYbkIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQVlsQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7UUFDNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDcEIsR0FBRyxDQUFDLFFBQVE7WUFDVixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNB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