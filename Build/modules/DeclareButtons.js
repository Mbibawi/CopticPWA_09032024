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
                return createBtn(btn, containerDiv, 'mainPageBtns', true, () => onClickBtnFunction(btn));
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
                    createBtn(childBtn, containerDiv, 'mainPageBtns', false, () => onClickBtnFunction(childBtn))
                        .style.backgroundImage = backgroundImage;
                });
                createBtn(btnMain, containerDiv, 'mainPageBtns').style.backgroundImage = images[0]; //Finlay, we create and extra html button for btnMain, in order for the user to be able to navigate back to the btnMain menu of buttons
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
            showMultipleChoicePrayersButton(filtered, btn, {
                AR: 'مدائح التوزيع',
                FR: 'Chants de la communion'
            }, 'communionChants', undefined, psalm[psalm.length - 1]);
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
            setGridColumnsNumber(btnsDiv, 3);
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
                    || (!isFast
                        && todayDate.getDay() !== 3
                        && todayDate.getDay() !== 5))
                    //We are a Sunday or a Saturday, or during the 50 Pentecostal days, or on a Lord Feast day, or we are during a no fast period
                    hours.pop(); //we remove the 9th hour
                hoursBtns = hours;
            })();
            let masterBtnDiv = document.createElement('div'); //This is the div that will contain the master button which shows or hides the Book of Hours sub buttons
            masterBtnDiv.classList.add('inlineBtns');
            masterBtnDiv.id = 'masterBOHBtn';
            let btnsDiv = document.createElement('div'); //This is the div that contains the sub buttons for each Hour of the Book of Hours
            btnsDiv.classList.add('inlineBtns');
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
                .prepend(createBtn(masterBtn, masterBtnDiv, 'inlineBtn', true, masterBtn.onClick)); //We add the master button to the bookOfHoursMasterDiv
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
                                makeExpandableButtonContainerFloatOnTop(btnsDiv, '10px');
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
            setGridColumnsNumber(btnsDiv, 3);
            function InsertHourFinalPrayers(hourBtn) {
                let Agios = Prefix.commonPrayer + 'HolyGodHolyPowerfullPart1&D=$copticFeasts.AnyDay', Kyrielison41Times = Prefix.commonPrayer + 'Kyrielison41Times&D=$copticFeasts.AnyDay', KyrielisonIntro = Kyrielison41Times.replace('&D=', 'NoMassIntro&D='), KyrielisonMassIntro = Kyrielison41Times.replace('&D=', 'MassIntro&D='), HolyLordOfSabaot = Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay', HailToYouMaria = Prefix.commonPrayer + 'WeSaluteYouMary&D=$copticFeasts.AnyDay', WeExaltYou = Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Creed = Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay', OurFatherWhoArtInHeaven = Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay';
                let litanies, lastLitany, sequence;
                litanies = hourBtn.prayersSequence.filter(title => title.includes('HourLitanies'));
                lastLitany = litanies[litanies.length - 1];
                //!CAUTION, the order of the buttons in hourBtn is reversed (eg.: [9th, 6th, 3rd] instead of [3rd, 6th, 9th])
                if (hoursBtns.indexOf(hourBtn) === 0) {
                    //This is the last hour
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
                            KyrielisonIntro,
                            Kyrielison41Times,
                            Agios,
                            Agios.replace('Part1', 'Part2'),
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
        let Kenin = Prefix.commonPrayer + 'NowAlwaysAndForEver&D=$copticFeasts.AnyDay', ZoksaPatri = Prefix.commonPrayer + 'GloryToTheFatherTheSonAndTheSpirit&D=$copticFeasts.AnyDay', gospelEnd = Prefix.bookOfHours + 'GospelEnd&D=$copticFeasts.AnyDay', OurFatherWhoArtInHeaven = Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay', AngelsPrayers = Prefix.commonPrayer + 'AngelsPrayer&D=$copticFeasts.AnyDay', HailToYouMaria = Prefix.commonPrayer + 'WeSaluteYouMary&D=$copticFeasts.AnyDay', WeExaltYou = Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Agios = Prefix.commonPrayer + 'HolyGodHolyPowerfullPart1&D=$copticFeasts.AnyDay', Kyrielison41Times = Prefix.commonPrayer + 'Kyrielison41Times&D=$copticFeasts.AnyDay', KyrielisonIntro = Kyrielison41Times.replace('&D=', 'NoMassIntro&D='), HolyLordOfSabaot = Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay', Creed = Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay', Hallelujah = Prefix.bookOfHours + 'PsalmEnd&D=$copticFeasts.AnyDay', EndOfAllHours = Prefix.bookOfHours + '1stHourEndOfAllHoursPrayer&D=$copticFeasts.AnyDay', HourIntro = [
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
    showMultipleChoicePrayersButton(Array.from(filtered), btn, label, masterBtnID, undefined, anchor);
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
        if (lordFeasts.indexOf(eval(feastString)) < 0
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
    btnDiv.classList.add("inlineBtns");
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
        let createdButton = createBtn(btnExpand, btnDiv, btnExpand.cssClass, true, btnExpand.onClick); //creating the html element representing the button. Notice that we give it as 'click' event, the btn.onClick property, otherwise, the createBtn will set it to the default call back function which is showChildBtnsOrPrayers(btn, clear)
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
            .filter(child => checkIfTitle(child))
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