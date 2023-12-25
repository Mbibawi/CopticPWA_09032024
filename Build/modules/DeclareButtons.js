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
        if (Season === Seasons.KiahkWeek1 || Season === Seasons.KiahkWeek2)
            btnMain.children.push(btnKiahk);
        (function showBtnsOnMainPage() {
            if (leftSideBar.classList.contains('extended'))
                return; //If the left side bar is not hidden, we do not show the buttons on the main page because it means that the user is using the buttons in the side bar and doesn't need to navigate using the btns in the main page
            let images = [
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnIncenseBackground.jpg)',
                'url(./assets/btnReadingsBackground.jpg)',
                'url(./assets/btnBOHBackground.jpg)',
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
        if (todayDate.getDay() === 6)
            //If we are a Saturday, we pray only the 'Departed Litany', we will hence remove the 'Sick Litany' and the 'Travellers Litany'
            btnIncenseDawn.prayersSequence.splice(btnIncenseDawn.prayersSequence.indexOf(Prefix.incenseDawn + 'SickPrayer&D=$copticFeasts.AnyDay'), 3, Prefix.incenseVespers + 'DepartedPrayer&D=$copticFeasts.AnyDay');
        else if (todayDate.getDay() === 0 || lordFeasts.indexOf(copticDate) > -1)
            //If we are a Sunday or the day is a Lord's Feast, or the oblation is present, we remove the 'Travellers Litany' and keep the 'Sick Litany' and the 'Oblation Litany'
            btnIncenseDawn.prayersSequence.splice(btnIncenseDawn.prayersSequence.indexOf(Prefix.incenseDawn + 'TravelersPrayer&D=$copticFeasts.AnyDay'), 1);
        else
            ;
        btnIncenseDawn.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.IncensePrayersArray.filter(table => !table[0][0].startsWith(Prefix.incenseVespers)),
        ]; //We need this to be done when the button is clicked, not when it is declared, because when declared, CommonPrayersArray and IncensePrayersArray are empty (they are popultated by a function in "main.js", which is loaded after "DeclareButtons.js")
        if (todayDate.getDay() === 6)
            btnIncenseDawn.prayersArray.push(PrayersArrays.IncensePrayersArray.find(table => table[0][0].startsWith(Prefix.incenseVespers + 'DepartedPrayer&D=$copticFeasts.AnyDay'))); //i.e., if we are a Saturday, we include the 'Departed Litany' in the prayersArray of the button
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
                beforeOrAfter: "afterend",
                el: selectElementsByDataRoot(btnDocFragment, getMassPrefix(btn.btnID) + 'Agios&D=$copticFeasts.AnyDay', { equal: true })[0].previousElementSibling
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
            let filtered = PrayersArrays.CommunionPrayersArray.filter(tbl => selectFromMultiDatedTitle(tbl[0][0], copticDate) === true
                || selectFromMultiDatedTitle(tbl[0][0], Season) === true);
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
            let titleBase;
            reading
                .forEach(table => {
                titleBase = splitTitle(table[0][0])[0];
                table
                    .map(row => {
                    if (!row[0].startsWith(Prefix.same))
                        titleBase = row[0];
                    return createHtmlElementForPrayer({
                        tblRow: row,
                        titleBase: titleBase,
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
                //We will filter the btn.prayersArray in order to keep only those prayers tables (string[][]) matching the btn.prayersSequence order
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
                            if (litanies.indexOf(tblTitle) === 0 || litanies.indexOf(tblTitle) === litanies.length - 1)
                                return; //this is either the title of the litanies section, or the last litany. In both cases we do not insert anything after those paragraphs
                            if (litanies.indexOf(tblTitle) === 1
                                || litanies.indexOf(tblTitle) === 4)
                                prayer = ZoksaPatri; //If it is the 1st or 4th litany (litanies[0] is the title), we insert Zoksa patry
                            else
                                prayer = Kenin; //If it is not the first nor the 4th litany, the insert 'Kenin'
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
const btnKiahk = new Button({
    btnID: "btnKiahk",
    label: {
        AR: "تسبحة كيهك",
        FR: "Louanges de l'Avent",
    },
    onClick: () => {
        if (Season !== Seasons.KiahkWeek1 && Season !== Seasons.KiahkWeek2)
            return;
        btnKiahk.prayersArray = PrayersArrays.psalmodyPrayersArray;
        btnKiahk.prayersSequence = [Prefix.psalmody + 'KiahkChants&D=$Seasons.KiahkWeek1||$Seasons.KiahkWeek1'];
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
        else if ((Season === Seasons.KiahkWeek1 || Season === Seasons.KiahkWeek2) && (Number(copticDay) < 28 || (Number(copticDay) === 28 && todayDate.getHours() < 13))) {
            // we are during Kiahk month: the first 2 weeks have their own gospel response, and the second 2 weeks have another gospel response
            Season === Seasons.KiahkWeek1 ?
                gospelResponse = gospelResponse.replace('&D=', '1&D=')
                :
                    gospelResponse = gospelResponse.replace('&D=', '2&D=');
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
            if (cymbalsTitle.startsWith('&Insert=')) //i.e., if this is the placeholder element that we inserted for the current feast or Season
                cymbalTable = PrayersArrays.CymbalVersesPrayersArray
                    .find(tbl => selectFromMultiDatedTitle(tbl[0][0], cymbalsTitle.split('&Insert=')[1]));
            else
                cymbalTable = findTableInPrayersArray(cymbalsTitle, PrayersArrays.CymbalVersesPrayersArray, { equal: true });
            if (cymbalTable)
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
        let excludeFeast = [saintsFeasts.StMaykel, saintsFeasts.StMarc, saintsFeasts.StGeorge, saintsFeasts.StMina]; //Those saints feast will be excluded because the doxologies of those saints are included by default
        if (excludeFeast.indexOf(copticDate) < 0)
            feast = Object.entries(saintsFeasts)
                .find(entry => entry[1] === copticDate);
        if (feast)
            insertFeastInSequence(sequence, feast[1], 1);
        if (excludeFeast.indexOf(copticDate) > 0) {
            //If today is the feast of the saints included in excludeFeast. ! Notice that we start from 1 not from 0 because 0 is St. Maykel feast and it is already the first doxology in the saints doxologies
            let doxologyIndex = excludeFeast.indexOf(copticDate) + 2;
            sequence.splice(2, 0, sequence[doxologyIndex]); //We insert the doxology after St. Maykel doxology
            sequence.splice(doxologyIndex + 1, 1); //We remove the original doxolgoy from the sequence
        }
        ;
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
            return console.log('Did not find any relevant doxologies');
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
        if (Season === Seasons.KiahkWeek1 || Season === Seasons.KiahkWeek2)
            doxologies.splice(1, 6); //This is in order to remove the repetitive doxologies
        insertPrayersAdjacentToExistingElement({
            tables: doxologies,
            languages: btn.languages,
            position: { beforeOrAfter: 'beforebegin', el: doxologiesPlaceHolder.nextElementSibling },
            container: btn.docFragment
        });
    })();
    /**
     * Inserts a new element in the btn.prayersSequence[]. This elment will serve as a placeholder to insert the relevant prayers (Cymbal Verses or Doxologies) for the current season or feast
     * @param {string[]} sequence - the btn's prayers sequence in which the new placeholder element will be inserted
     * @param {string} feastString - the string representing the feast or the season
     * @param {number} index - the index at which the new placeholder element will be inserted.
     */
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