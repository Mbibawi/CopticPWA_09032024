class Button {
    constructor(btn) {
        this._retrieved = false;
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
    set titlesArray(titles) {
        this._titlesArray = titles;
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
    set pursue(pursue) {
        this._pursue = pursue;
    }
    set children(children) {
        this._children = children;
    }
    set cssClass(cssClass) {
        this._cssClass = cssClass;
    }
    set inlineBtns(btns) {
        this._inlineBtns = btns;
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
        defaultLanguage: "العودة إلى القائمة الرئيسية",
        foreignLanguage: "Retour au menu principal",
        otherLanguage: "Back to the main menu",
    },
    onClick: () => {
        btnMain.children = [btnMass, btnIncenseOffice, btnDayReadings, btnBookOfHours];
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
        btnMain.children
            .map(btn => {
            return createBtn(btn, containerDiv, 'mainPageBtns', true, () => onClickBtnFunction(btn));
        })
            .map(htmlBtn => {
            //For each btn created from the children of btnMain, we give it an image background from the images[] array of links
            htmlBtn.style.backgroundImage = images[Array.from(containerDiv.children).indexOf(htmlBtn)];
        });
        function onClickBtnFunction(btn) {
            if (!btn.children)
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
    },
});
const btnGoBack = new Button({
    btnID: "btnGoBack",
    label: { defaultLanguage: "السابق", foreignLanguage: "Retour", otherLanguage: "Go Back" },
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnMass = new Button({
    btnID: "btnMass",
    label: { defaultLanguage: "القداسات", foreignLanguage: "Messes" },
    onClick: (args = { returnBtnChildren: false }) => {
        btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
        if (args.returnBtnChildren)
            return btnMass.children;
    },
});
const btnIncenseOffice = new Button({
    btnID: "btnIncenseOffice",
    label: {
        defaultLanguage: "رفع بخور باكر أو عشية",
        foreignLanguage: "Office des Encens Aube et Vêpres",
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
    rootID: "IncenseDawn",
    label: {
        defaultLanguage: "بخور باكر",
        foreignLanguage: "Encens Aube",
    },
    showPrayers: true,
    children: [],
    languages: [...prayersLanguages],
    docFragment: new DocumentFragment(),
    onClick: () => {
        btnIncenseDawn.prayersSequence = [...IncensePrayersSequence];
        (function removeIncenseVesperPrayers() {
            //We will remove all the Incense Vespers titles from the prayersSequence Array
            btnIncenseDawn.prayersSequence = btnIncenseDawn.prayersSequence.filter(title => !title.startsWith(Prefix.incenseVespers));
            //We will remove duplicate titles from the prayersSequence array
            btnIncenseDawn.prayersSequence.forEach(title => {
                if (btnIncenseDawn.prayersSequence[btnIncenseDawn.prayersSequence.indexOf(title)] === btnIncenseDawn.prayersSequence[btnIncenseDawn.prayersSequence.indexOf(title) - 1])
                    btnIncenseDawn.prayersSequence.splice(btnIncenseDawn.prayersSequence.indexOf(title), 1);
            });
        })();
        btnIncenseDawn.prayersArray = [
            ...CommonPrayersArray,
            ...IncensePrayersArray.filter(table => !table[0][0].startsWith(Prefix.incenseVespers)),
        ]; //We need this to be done when the button is clicked, not when it is declared, because when declared, CommonPrayersArray and IncensePrayersArray are empty (they are popultated by a function in "main.js", which is loaded after "DeclareButtons.js")
        (function setBtnChildrenAndPrayers() {
            //We will set the children of the button:
            btnIncenseDawn.children = [btnReadingsGospelIncenseDawn];
            //we will also set the prayers of the Incense Dawn button
            btnIncenseDawn.prayersSequence = [...IncensePrayersSequence];
        })();
        (function adaptCymbalVerses() {
            let cymbals = Prefix.commonIncense;
            //removing the non-relevant Cymbal prayers according to the day of the week: Wates/Adam
            if (todayDate.getDay() > 2) {
                //we are between Wednesday and Saturday, we keep only the "Wates" Cymbal prayers
                cymbals += "CymbalVersesAdam&D=$copticFeasts.AnyDay";
            }
            else {
                //we are Sunday, Monday, or Tuesday. We keep only the "Adam" Cymbal prayers
                cymbals += "CymbalVersesWates&D=$copticFeasts.AnyDay";
            }
            btnIncenseDawn.prayersSequence.splice(btnIncenseDawn.prayersSequence.indexOf(cymbals), 1);
        })();
        scrollToTop();
        return btnIncenseDawn.prayersSequence;
    },
    afterShowPrayers: async () => {
        let btnDocFragment = btnIncenseDawn.docFragment;
        (async function addGreatLentPrayers() {
            if (Season !== Seasons.GreatLent || Season !== Seasons.JonahFast)
                return;
            if (todayDate.getDay() !== 0 && todayDate.getDay() !== 6) {
                //We are neither a Saturday nor a Sunday, we will hence display the Prophecies dawn buton
                (function showPropheciesDawnBtn() {
                    if (Season !== Seasons.GreatLent)
                        return;
                    //If we are during any day of the week, we will add the Prophecies readings to the children of the button
                    if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) < 0)
                        btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
                })();
                (async function addEklonominTaghonata() {
                    let efnotiNaynan = selectElementsByDataRoot(btnDocFragment, Prefix.commonPrayer + 'EfnotiNaynan&D=$copticFeasts.AnyDay', { startsWith: true });
                    let insertion = efnotiNaynan[efnotiNaynan.length - 1].nextSibling; //This is the "Kyrie Elison 3 times"
                    insertion.insertAdjacentElement('beforebegin', insertion.cloneNode(true)); //We duplicated the "Kyrie Elison 3 times"
                    let godHaveMercy = btnIncenseDawn.prayersArray.filter(table => table[0][0].startsWith(Prefix.incenseDawn + 'GodHaveMercyOnUs')); //This will give us all the prayers 
                    let KyrieElieson = btnIncenseDawn.prayersArray.filter(table => table[0][0] === Prefix.commonPrayer + 'KyrieElieson&D=$copticFeasts.AnyDay&C=Assembly')[0]; //This is "Kyrie Elison"
                    let blocks = [];
                    blocks.push(godHaveMercy[0]); //this is the comment at the begining
                    for (let i = 2; i < godHaveMercy.length; i += 3) {
                        blocks.push([...godHaveMercy[1]]); //This is the refrain repated every 3 parts.We are pushing a copy of it, to avoid affecting it by the splice in the next step
                        if (i > 4)
                            blocks[blocks.length - 1].splice(0, 1); //This will remove the title from the refrain if it is not the 1st refrain (it removes the 1st row in the refrain table)
                        blocks.push(godHaveMercy[i]);
                        blocks.push(KyrieElieson);
                        blocks.push(godHaveMercy[i + 1]);
                        blocks.push(KyrieElieson);
                        blocks.push(godHaveMercy[i + 2]);
                        if (i + 2 < (godHaveMercy.length - 1))
                            blocks.push(KyrieElieson);
                    }
                    insertPrayersAdjacentToExistingElement(blocks, prayersLanguages, { beforeOrAfter: 'beforebegin', el: insertion });
                })();
                return;
            }
            else {
                if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1)
                    btnIncenseDawn.children.splice(btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn), 1);
            }
        })();
        insertCymbalVersesAndDoxologiesForFeastsAndSeasons(btnIncenseDawn.docFragment);
        getGospelReadingAndResponses(Prefix.gospelDawn, btnReadingsGospelIncenseDawn.prayersArray, btnReadingsGospelIncenseDawn.languages, btnIncenseDawn.docFragment);
        (async function addInlineBtnForAdamDoxolgies() {
            if (btnIncenseDawn.docFragment.children.length === 0)
                return;
            let doxologiesDiv = addExpandablePrayer(btnIncenseDawn.docFragment.children[0], "AdamDoxologies", {
                defaultLanguage: "ذكصولوجيات باكر آدام",
                foreignLanguage: "Doxologies Adam Aube",
            }, DoxologiesPrayersArray.filter(table => table[0][0].startsWith(Prefix.commonDoxologies + 'Adam')), btnIncenseDawn.languages)[1];
            //finally we append the newDiv to containerDiv
            //btnIncenseDawn.docFragment.children[1].insertAdjacentElement('beforebegin', doxologiesDiv)
        })();
    },
});
const btnIncenseVespers = new Button({
    btnID: "btnIncenseVespers",
    label: {
        defaultLanguage: "بخور عشية",
        foreignLanguage: "Incense Vespers",
    },
    showPrayers: true,
    docFragment: new DocumentFragment(),
    languages: [...prayersLanguages],
    onClick: () => {
        btnIncenseVespers.prayersSequence = [...IncensePrayersSequence];
        (function removeIncenseDawnPrayers() {
            //We will remove all the Incense Vespers titles from the prayersSequence Array
            btnIncenseVespers.prayersSequence = btnIncenseVespers.prayersSequence.filter(title => !title.startsWith(Prefix.incenseDawn));
            //We will remove duplicate titles from the prayersSequence array
            btnIncenseVespers.prayersSequence.forEach(title => {
                if (btnIncenseVespers.prayersSequence[btnIncenseVespers.prayersSequence.indexOf(title)] === btnIncenseVespers.prayersSequence[btnIncenseVespers.prayersSequence.indexOf(title) - 1])
                    btnIncenseVespers.prayersSequence.splice(btnIncenseVespers.prayersSequence.indexOf(title), 1);
            });
        })();
        btnIncenseVespers.prayersArray = [
            ...CommonPrayersArray,
            ...IncensePrayersArray,
        ];
        (function removingNonRelevantLitanies() {
            //removing the Sick Litany
            btnIncenseVespers.prayersSequence.splice(btnIncenseVespers.prayersSequence.indexOf("  ID_SickPrayerPart1&D=$copticFeasts.AnyDay"), 5);
            //removing the Travelers Litany from IncenseVespers prayers
            btnIncenseVespers.prayersSequence.splice(btnIncenseVespers.prayersSequence.indexOf(Prefix.incenseDawn + "TravelersPrayerPart1&D=$copticFeasts.AnyDay"), 5);
            //removing the Oblations Litany from IncenseVespers paryers
            btnIncenseVespers.prayersSequence.splice(btnIncenseVespers.prayersSequence.indexOf(Prefix.incenseDawn + "OblationsPrayerPart1&D=$copticFeasts.AnyDay"), 5);
            //removing the Dawn Doxology for St. Mary
            btnIncenseVespers.prayersSequence.splice(btnIncenseVespers.prayersSequence.indexOf(Prefix.incenseDawn + "DoxologyWatesStMary&D=$copticFeasts.AnyDay"), 1);
            //removing the Angels' prayer
            btnIncenseVespers.prayersSequence.splice(btnIncenseVespers.prayersSequence.indexOf(Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay"), 1);
        })();
        (function adaptCymbalVerses() {
            //removing the non-relevant Cymbal prayers according to the day of the week: Wates/Adam
            if (todayDate.getDay() > 2) {
                //we are between Wednesday and Saturday, we keep only the "Wates" Cymbal prayers
                btnIncenseVespers.prayersSequence.splice(btnIncenseVespers.prayersSequence.indexOf(Prefix.commonIncense + "CymbalVersesAdam&D=$copticFeasts.AnyDay"), 1);
            }
            else {
                //we are Sunday, Monday, or Tuesday. We keep only the "Adam" Cymbal prayers
                btnIncenseVespers.prayersSequence.splice(btnIncenseVespers.prayersSequence.indexOf(Prefix.commonIncense + "CymbalVersesWates&D=$copticFeasts.AnyDay"), 1);
            }
        })();
        (function addGreatLentPrayers() {
            if (Season === Seasons.GreatLent &&
                todayDate.getDay() != 0 &&
                todayDate.getDay() != 6) {
                //We will then add the GreatLent  Doxologies to the Doxologies before the first Doxology of St. Mary
                (function addGreatLentDoxologies() {
                    let index = btnIncenseDawn.prayersSequence.indexOf(Prefix.incenseVespers + "DoxologyVespersWatesStMary&D=$ copticFeasts.AnyDay");
                    let doxologies = [];
                    DoxologiesPrayersArray.map((p) => /DC_\d{1}\&D\=GLWeek/.test(p[0][0])
                        ? doxologies.push(p[0][0])
                        : "do nothing");
                    if (todayDate.getDay() != 0 && todayDate.getDay() != 6) {
                        btnIncenseVespers.prayersSequence.splice(index, 0, ...doxologies);
                    }
                    else if (todayDate.getDay() === (0 || 6)) {
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
        getGospelReadingAndResponses(Prefix.gospelVespers, btnReadingsGospelIncenseVespers.prayersArray, btnReadingsGospelIncenseVespers.languages, btnIncenseVespers.docFragment);
    },
});
const btnMassStCyril = new Button({
    btnID: "btnMassStCyril",
    rootID: "StCyril",
    label: { defaultLanguage: "كيرلسي", foreignLanguage: "Saint Cyril", otherLanguage: "St Cyril" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
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
const btnMassStGregory = new Button({
    btnID: "btnMassStGregory",
    rootID: "StGregory",
    label: { defaultLanguage: "غريغوري", foreignLanguage: "Saint Gregory" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
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
        btnMassStGregory.prayersSequence.splice(btnMassStGregory.prayersSequence.indexOf(Prefix.massCommon + "CallOfTheHolySpiritPart1&D=$copticFeasts.AnyDay"), 9);
        scrollToTop();
        btnsPrayersSequences.splice(btns.indexOf(btnMassStGregory), 1, btnMassStGregory.prayersSequence);
        btnMassStGregory.retrieved = true;
        return btnMassStGregory.prayersSequence;
    },
    afterShowPrayers: async () => {
        btnMassStBasil.afterShowPrayers(btnMassStGregory);
    },
});
const btnMassStBasil = new Button({
    btnID: "btnMassStBasil",
    rootID: "StBasil",
    label: { defaultLanguage: "باسيلي", foreignLanguage: "Saint Basil", otherLanguage: "St Basil" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
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
    afterShowPrayers: async (btn = btnMassStBasil) => {
        let massButtons = [btnMassStBasil, btnMassStGregory, btnMassStCyril, btnMassStJohn];
        massButtons.splice(massButtons.indexOf(btn), 1);
        massButtons.splice(massButtons.indexOf(btnMassStJohn), 1);
        let btnDocFragment = btn.docFragment;
        showFractionPrayersMasterButton(btn, selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'FractionPrayerPlaceholder&D=$copticFeasts.AnyDay', { equal: true })[0], { defaultLanguage: "صلوات القسمة", foreignLanguage: "Oraisons de la Fraction" }, "btnFractionPrayers", FractionsPrayersArray);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Gregory, St. Cyril, or St. John)
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataRoot(btnDocFragment, 'Reconciliation&D=$copticFeasts.AnyDay', { includes: true })[0],
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Cyrill or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=$copticFeasts.AnyDay', { endsWith: true });
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory before Agios
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "beforebegin",
                el: selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + 'Agios&D=$copticFeasts.AnyDay', { equal: true })[0],
            }, 'RedirectionToAgios');
        })();
        (function insertStMaryAdamSpasmos() {
            //We insert it during the Saint Mary Fast and on every 21th of the coptic month
            let spasmos = PrayersArray.filter(table => table[0][0] === Prefix.massCommon + "StMaryAdamSpasmos&D=$Seasons.StMaryFast&C=Title");
            if (!spasmos)
                return;
            let anchor = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "DiaconResponseKissEachOther&D=$copticFeasts.AnyDay", { equal: true })[0];
            addExpandablePrayer(anchor, 'StMaryAdamSpasmos', {
                defaultLanguage: "افرحي يا مريم",
                foreignLanguage: "Réjouis-toi Marie"
            }, spasmos, btnMassStBasil.languages)[1];
        })();
        (function insertCommunionChants() {
            //Inserting the Communion Chants after the Psalm 150
            let psalm = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay", { equal: true });
            let filtered = CommunionPrayersArray.filter(tbl => {
                selectFromMultiDatedTitle(tbl[0][0], copticDate) === true
                    || selectFromMultiDatedTitle(tbl[0][0], Season) === true;
            });
            if (filtered.length === 0)
                filtered = CommunionPrayersArray.filter(tbl => selectFromMultiDatedTitle(tbl[0][0], copticFeasts.AnyDay) === true);
            showMultipleChoicePrayersButton(filtered, btn, {
                defaultLanguage: 'مدائح التوزيع',
                foreignLanguage: 'Chants de la communion'
            }, 'communionChants', undefined, psalm[psalm.length - 1]);
        })();
        (function insertIndeedWePrayYou() {
            if (btn !== btnMassStBasil)
                return; //This button appears only in St Basil Mass
            let prayers = MassStGregoryPrayersArray.filter(tbl => tbl[0][0].startsWith(Prefix.massStGregory + "LitaniesIntroductionPart"));
            if (prayers.length === 0)
                return;
            let kyrielieson = CommonPrayersArray.filter(tbl => tbl[0][0] ===
                Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay&C=Assembly")[0];
            for (let i = 1; i < prayers.length; i += 2) {
                console.log('i=', i, 'payers[i] = ', prayers[i]);
                prayers.splice(i, 0, kyrielieson);
            }
            let kyrielieson3Times = CommonPrayersArray.filter(tbl => tbl[0][0] === Prefix.commonPrayer + "KyrieEliesonThreeTimes&D=$copticFeasts.AnyDay&C=Assembly")[0];
            prayers.push(kyrielieson3Times);
            console.log(prayers);
            let anchor = selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "LitaniesIntroduction&D=$copticFeasts.AnyDay", { equal: true })[0];
            if (!anchor)
                return console.log('no anchor');
            console.log('anchor = ', anchor);
            addExpandablePrayer(anchor, 'btnIndeedWePrayYou', {
                defaultLanguage: "...نعم نسألك أيها المسيح إلهنا",
                foreignLanguage: 'Oui, nous t\'implorons ô Christ notre Dieu...'
            }, prayers, btn.languages);
        })();
    },
});
const btnMassStJohn = new Button({
    btnID: "btnMassStJohn",
    label: { defaultLanguage: "القديس يوحنا", foreignLanguage: "Saint Jean" },
    docFragment: new DocumentFragment(),
    showPrayers: false,
    prayersSequence: [],
    onClick: () => {
        alert('The prayers of this mass have not yet been added. We hope they will be ready soon');
        return; //until we add the text of this mass
        btnMassStJohn.prayersArray = [
            ...CommonPrayersArray,
            ...MassCommonPrayersArray,
            ...MassStJohnPrayersArray,
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
const btnMassUnBaptised = new Button({
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
        btnMassUnBaptised.children.splice(btnMassUnBaptised.children.length - 1, 1);
        //Adding the creed and 
        (function addCreed() {
            btnMassUnBaptised.prayersSequence.unshift(Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay');
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
            let dataRoot = Prefix.massCommon + "PrayThatGodHaveMercyOnUsIfBishop&D=$copticFeasts.AnyDay";
            let godHaveMercyHtml = selectElementsByDataRoot(btnDocFragment, dataRoot, { equal: true });
            let godHaveMercy = btnMassUnBaptised.prayersArray.filter(tbl => tbl[1] && splitTitle(tbl[1][0])[0] === dataRoot);
            if (godHaveMercy.length < 1)
                return;
            let createdDiv = addExpandablePrayer(godHaveMercyHtml[0], 'godHaveMercy', {
                defaultLanguage: godHaveMercy[0][1][4],
                foreignLanguage: godHaveMercy[0][1][2],
            }, [[godHaveMercy[0][1], godHaveMercy[0][2]]], btnMassUnBaptised.languages)[1];
            createdDiv.classList.add('Row');
            createdDiv.children[0].classList.remove('collapsedTitle');
            //@ts-ignore
            createdDiv.children[0].dataset.root = dataRoot + 'Collapsable';
            godHaveMercyHtml.forEach((row) => row.remove());
        })();
        if (Season === Seasons.GreatLent
            || Season === Seasons.JonahFast) {
            //Inserting psaume 'His Foundations In the Holy Montains' before the absolution prayers
            insertPrayersAdjacentToExistingElement(btnMassUnBaptised.prayersArray
                .filter(table => splitTitle(table[0][0])[0] === Prefix.massCommon + "HisFoundationsInTheHolyMountains&D=GreatLent"), btnMassUnBaptised.languages, {
                beforeOrAfter: 'beforebegin',
                el: selectElementsByDataRoot(btnDocFragment, Prefix.massCommon + "AbsolutionForTheFather&D=$copticFeasts.AnyDay", { equal: true })[0]
            });
        }
        let anchor = selectElementsByDataRoot(btnDocFragment, Prefix.commonPrayer + 'HolyGodHolyPowerful&D=$copticFeasts.AnyDay', { equal: true })[0]; //this is the html element before which we will insert all the readings and responses
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
            insertPrayersAdjacentToExistingElement(reading, readingsLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
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
            insertPrayersAdjacentToExistingElement(reading, readingsLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
        })();
        (function insertPraxis() {
            reading = ReadingsArrays.PraxisArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.praxis + '&D=' + copticReadingsDate);
            if (reading.length === 0)
                return;
            reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            reading.push([[splitTitle(reading[0][0][0])[0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.praxisEnd.AR, ReadingsIntrosAndEnds.praxisEnd.FR, ReadingsIntrosAndEnds.praxisEnd.EN]]);
            //Inserting the reading intro after the title
            reading[0].splice(1, 0, [splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.praxisIntro.AR, ReadingsIntrosAndEnds.praxisIntro.FR, ReadingsIntrosAndEnds.praxisIntro.EN]); //We replace the first row in the first table of reading (which is the title of the Praxis, with the introduction table
            insertPrayersAdjacentToExistingElement(reading, readingsLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
            (function insertPraxisResponse() {
                let praxis = selectElementsByDataRoot(btnMassUnBaptised.docFragment, Prefix.praxis + '&D=', { startsWith: true });
                console.log('praxis readings ', praxis);
                if (praxis.length === 0)
                    return;
                let response = PrayersArray
                    .filter(table => table[0][0].startsWith(Prefix.praxisResponse)
                    && (eval(splitTitle(table[0][0])[0].split('&D=')[1].replace('$', '')) === copticDate
                        || eval(splitTitle(table[0][0])[0].split('&D=')[1].replace('$', '')) === Season));
                if (response.length === 0) {
                    //If we are not on a a cotpic feast or a Season, We will look in the saints feasts
                    response = PrayersArray.filter(table => table[0][0].startsWith(Prefix.praxisResponse)
                        && Object.entries(saintsFeasts).filter(entry => entry[1] === eval(splitTitle(table[0][0])[0].split('&D=')[1].replace('$', ''))).length > 0);
                }
                if (response.length > 0) {
                    console.log('praxis response = ', response);
                    //If a Praxis response was found
                    if (Season === Seasons.GreatLent) {
                        // The query should yield to  2 tables ('Sundays', and 'Week') for this season. We will keep the relevant one accoding to the date
                        if (todayDate.getDay() === 0
                            || todayDate.getDay() === 6)
                            response = response.filter(table => table[0][0].includes('Sundays&D='));
                        else
                            response = response.filter(table => table[0][0].includes('Week&D='));
                    }
                    ;
                    insertPrayersAdjacentToExistingElement(response, prayersLanguages, { beforeOrAfter: 'beforebegin', el: praxis[0] });
                }
                ;
                //Moving the annual response
                let noSeasonResponse = selectElementsByDataRoot(btnDocFragment, Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay", { equal: true });
                if (!noSeasonResponse || noSeasonResponse.length === 0)
                    return console.log('error: annual = ', noSeasonResponse);
                noSeasonResponse.forEach(htmlRow => praxis[0].insertAdjacentElement('beforebegin', htmlRow));
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
            //Replacing the title row of the table with a new title row
            /*let details: string[] = [
              splitTitle(reading[0][0][0])[0],
              Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].FR + '\n' + reading[0][0][1].replace('\n', '&&&').split('&&&')[1],
              Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].AR + '\n' + reading[0][0][2].replace('\n', '&&&').split('&&&')[1]
            ];*/ //This row includes the details of the Synaxarium of the day, I need to think if I should insert it
            reading[0].splice(0, 1, [
                splitTitle(reading[0][0][0])[0] + '&C=Title',
                'Synixaire' + '\n' + Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].FR,
                'السنكسار' + '\n' + Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].AR,
            ]);
            let praxisElements = selectElementsByDataRoot(btnMassUnBaptised.docFragment, Prefix.praxis + '&D=', { startsWith: true });
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
                    return createHtmlElementForPrayer(row, ['FR', 'AR'], undefined, anchor);
                });
            });
        })();
        (function insertPentecostalHymns() {
            if (Season !== Seasons.PentecostalDays)
                return;
            let hymns = PrayersArray.filter((table) => table[0][0].startsWith("PentecostalHymns&D=$Seasons.PentecostalDays"));
            if (hymns.length > 0) {
                insertPrayersAdjacentToExistingElement(hymns, prayersLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
            }
        })();
        (function insertGospelReading() {
            //Inserting the Gospel Reading
            getGospelReadingAndResponses(Prefix.gospelMass, ReadingsArrays.GospelMassArray, readingsLanguages, btnMassUnBaptised.docFragment);
        })();
        (async function insertBookOfHoursButton() {
            let hoursBtns = btnBookOfHours.onClick({ isMass: true }); //We get buttons for the relevant hours according to the day
            let bookOfHours = [];
            hoursBtns.forEach(btn => bookOfHours.push(...btn.prayersArray));
            console.log('bookOfHours', bookOfHours);
            let btnsDiv = document.createElement('div');
            btnsDiv.classList.add('inlineBtns');
            btnsDiv.id = 'bookOfHoursBtns';
            btnMassUnBaptised.docFragment.prepend(btnsDiv);
            let createdElements;
            let createdContainer;
            let createdButton;
            hoursBtns
                .reverse()
                .forEach(async (btn) => {
                btn.prayersArray =
                    btn.prayersArray
                        .filter(tbl => !tbl[0][0].includes('ThanksGiving') && !tbl[0][0].includes('Psalm50'));
                createdElements = addExpandablePrayer(btnMassUnBaptised.docFragment.children[1], //We insert the btn div after the 1st element which is btnsDiv that we created
                'bookOfHours' + btn.btnID, btn.label, btn.prayersArray, btnBookOfHours.languages);
                createdButton = createdElements[0];
                createdContainer = createdElements[1];
                btnsDiv.appendChild(createdButton); //We add all the buttons to the same div instead of 3 divs;
                createdButton.addEventListener('click', () => {
                    rightSideBar
                        .querySelectorAll('div[data-group="bookOfHoursTitle"]')
                        .forEach((titleDiv) => {
                        titleDiv.classList.toggle('collapsedTitle');
                    });
                });
                createdContainer
                    .querySelectorAll('div.SubTitle')
                    .forEach((subTitle) => collapseText(subTitle, createdContainer));
                if (localStorage.displayMode === displayModes[1]) {
                    //If we are in the 'Presentation Mode'
                    Array.from(createdContainer.querySelectorAll('div.Row'))
                        .filter((row) => row.dataset.root.includes('HourPsalm') || row.dataset.root.includes('EndOfHourPrayer'))
                        .forEach(row => row.remove()); //we remove all the psalms and keep only the Gospel and the Litanies,
                    Array.from(rightSideBar.querySelector('#sideBarBtns')
                        .querySelectorAll('div.Row'))
                        .filter((row) => row.dataset.root.includes('HourPsalm') || row.dataset.root.includes('EndOfHourPrayer'))
                        .forEach(row => row.remove()); //We do the same for the titles
                }
                //We will append the titles of the Book of Hours to the right side Bar, with a display 'none'
                let titles = await showTitlesInRightSideBar(createdContainer.querySelectorAll('div.SubTitle'), undefined, false);
                titles
                    .reverse()
                    .forEach((title) => {
                    title.dataset.group = 'bookOfHoursTitle';
                    title.style.display = 'block';
                    rightSideBar
                        .querySelector('#sideBarBtns')
                        .children[0]
                        .insertAdjacentElement('beforebegin', title);
                    title.classList.add('collapsedTitle'); //We add the 'collapsedTitle' class in order to match the status of createdContainer (i.e., hide the titles until the button is pressed)
                });
            });
            btnsDiv.style.display = 'grid';
            let x = hoursBtns.length;
            if (x > 3)
                x = 3; //we limit the number of columns to 3
            if (x > 1)
                btnsDiv.style.gridTemplateColumns = ((100 / x).toString() + '% ').repeat(x);
        })();
        //Collapsing all the Titles
        collapseAllTitles(Array.from(btnMassUnBaptised.docFragment.children));
        btnMassUnBaptised.docFragment.getElementById('bookOfHoursBtns').classList.toggle('collapsedTitle'); //We remove 'collapsedTitle' from btnsDiv
    }
});
const btnMassBaptised = new Button({
    btnID: "btnMassBaptised",
    label: {
        defaultLanguage: "قداس المؤمنين",
        foreignLanguage: "Messe des Croyants",
        otherLanguage: "Baptized Mass",
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
            onClick: function () {
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
        })
    ],
    label: {
        defaultLanguage: "قراءات اليوم", foreignLanguage: "Lectures du jour",
        otherLanguage: "Day's Readings"
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
        defaultLanguage: "إنجيل عشية",
        foreignLanguage: "Evangile  Vêpres",
        otherLanguage: "Vespers Gospel",
    },
    showPrayers: true,
    prayersSequence: [Prefix.gospelVespers + "Psalm", Prefix.gospelVespers + "Gospel"],
    prayersArray: ReadingsArrays.GospelVespersArray,
    languages: [...readingsLanguages],
    onClick: () => {
        let today = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).
        /* let date: string = setSeasonAndCopticReadingsDate(
           convertGregorianDateToCopticDate(today.getTime()),
           today
         );*/
        let date = setSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today.getTime())
            .splice(2, 1)
            .join(',')
            .replaceAll(',', ''), today);
        //We add the psalm reading to the begining of the prayersSequence
        btnReadingsGospelIncenseVespers.prayersSequence[0] = Prefix.gospelVespers + "Psalm&D=" + date;
        btnReadingsGospelIncenseVespers.prayersSequence[1] = Prefix.gospelVespers + "Gospel&D=" + date;
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnReadingsGospelIncenseDawn = new Button({
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
const btnReadingsGospelNight = new Button({
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
const btnReadingsPropheciesDawn = new Button({
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
const btnBookOfHours = new Button({
    btnID: 'btnBookOfHours',
    label: { defaultLanguage: 'الأجبية', foreignLanguage: 'Agpia', otherLanguage: 'Book of Hours' },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    children: [],
    onClick: (args = { isMass: false }) => {
        let Kenin = Prefix.commonPrayer + 'NowAlwaysAndForEver&D=$copticFeasts.AnyDay', ZoksaPatri = Prefix.commonPrayer + 'GloryToTheFatherTheSonAndTheSpirit&D=$copticFeasts.AnyDay', gospelEnd = Prefix.bookOfHours + 'GospelEnd&D=$copticFeasts.AnyDay', OurFatherWhoArtInHeaven = Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay', WeExaltYou = Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Agios = Prefix.commonPrayer + 'HolyGodHolyPowerfulPart', HolyLordOfSabaot = Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay', Creed = Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay', Hallelujah = Prefix.bookOfHours + 'PsalmEnd&D=$copticFeasts.AnyDay', HourIntro = [
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
                    || splitTitle(table[0][0])[0] === WeExaltYou
                    || splitTitle(table[0][0])[0] === Creed
                    || splitTitle(table[0][0])[0] === OurFatherWhoArtInHeaven
                    || new RegExp(Prefix.commonPrayer + 'ThanksGivingPart\\d{1}\\&D\\=\\$copticFeasts.AnyDay').test(splitTitle(table[0][0])[0])
                    || new RegExp(Agios + '\\d{1}\\&D\\=\\$copticFeasts.AnyDay').test(splitTitle(table[0][0])[0]))
            ];
            commonPrayers.push(...bookOfHoursPrayersArray
                .filter(tbl => splitTitle(tbl[0][0])[0] === HourIntro[HourIntro.length - 1] //this is Psalm 50
                || splitTitle(tbl[0][0])[0] === gospelEnd
                || splitTitle(tbl[0][0])[0] === Hallelujah));
            return commonPrayers;
        }
        ;
        (function appendChildButtonForEachHour() {
            let btn;
            for (let hour in bookOfHours) {
                if (!hour.endsWith('PrayersArray'))
                    continue;
                let hourName = hour.split('PrayersArray')[0];
                btn = {
                    btnID: hourName,
                    label: {
                        defaultLanguage: bookOfHoursLabels.filter(label => label.id === hourName)[0].AR,
                        foreignLanguage: bookOfHoursLabels.filter(label => label.id === hourName)[0].FR
                    },
                    prayersArray: [...bookOfHours[hour]],
                    prayersSequence: [],
                    languages: btnBookOfHours.languages,
                    showPrayers: true,
                };
                let createdBtn = new Button(btn);
                //Adding the onClick() property to the button
                createdBtn.onClick =
                    (args, newButton = createdBtn) => {
                        (function buildBtnPrayersSequence() {
                            newButton.prayersSequence =
                                newButton.prayersArray
                                    .map(table => splitTitle(table[0][0])[0]); //we add all the titles to the prayersSequence
                            newButton.prayersSequence.splice(1, 0, ...HourIntro); //We also add the titles in HourIntro before the 1st element of btn.prayersSequence[]
                            if (hourName === 'Dawn') {
                                //Adding the repeated psalms (psalms that are found in the 6ths and 9th hour), before pasalm 122
                                newButton.prayersSequence.splice(newButton.prayersSequence.indexOf(Prefix.bookOfHours + '1stHourPsalm142&D=$copticFeasts.AnyDay'), 0, ...DawnPsalms);
                            }
                            ;
                        })();
                        (function insertZoksaPatri() {
                            newButton.prayersSequence
                                .filter(title => title.includes('Litanies'))
                                .forEach(tblTitle => {
                                if (tblTitle.includes('Litanies1')
                                    || tblTitle.includes('Litanies4')) {
                                    newButton.prayersSequence.splice(newButton.prayersSequence.indexOf(tblTitle) + 1, 0, ZoksaPatri);
                                }
                                else if (tblTitle.includes('Litanies2') //second litany
                                    || tblTitle.includes('Litanies5') //5th litany
                                    || (tblTitle.includes('Litanies3')
                                        && newButton.prayersSequence[newButton.prayersSequence.indexOf(tblTitle) + 1].includes('Litanies4')) //3rd litany if litanies are > 3
                                ) {
                                    newButton.prayersSequence.splice(newButton.prayersSequence.indexOf(tblTitle) + 1, 0, Kenin);
                                }
                            });
                        })();
                        (function insertPsalmAndGospelEnds() {
                            newButton.prayersSequence
                                .filter(title => title.includes('Psalm')
                                || title.includes('Gospel&D=$copticFeasts.AnyDay'))
                                .forEach(tblTitle => {
                                if (tblTitle.includes('Gospel')
                                    && newButton.prayersSequence[newButton.prayersSequence.indexOf(tblTitle) + 1] != gospelEnd) //Inserting the Gosepl End
                                 {
                                    newButton.prayersSequence.splice(newButton.prayersSequence.indexOf(tblTitle) + 1, 0, gospelEnd);
                                }
                                else if (tblTitle.includes('Psalm')
                                    && newButton.prayersSequence[newButton.prayersSequence.indexOf(tblTitle) + 1] != Hallelujah) {
                                    newButton.prayersSequence.splice(newButton.prayersSequence.indexOf(tblTitle) + 1, 0, Hallelujah);
                                }
                                ;
                            });
                        })();
                        (function pushCommonPrayers() {
                            newButton.prayersArray.push(...commonPrayers);
                            if (hourName === 'Dawn') {
                                newButton.prayersArray
                                    .push(...DawnPsalms
                                    .map(psalm => bookOfHoursPrayersArray
                                    .filter(tbl => splitTitle(tbl[0][0])[0] === psalm)[0]));
                            }
                            ;
                        })();
                    };
                btnBookOfHours.children.push(createdBtn);
            }
            ;
        })();
        (function removeActorsFromPrayersArrays() {
            if (args.returnBtnChildren || args.isMass)
                return;
            btnBookOfHours.children
                .forEach(childBtn => {
                childBtn.prayersArray
                    .forEach(tbl => {
                    tbl.forEach(row => {
                        if (!row[0].endsWith('&C=Title') && !row[0].endsWith('&C=SubTitle')) {
                            row[0] = splitTitle(row[0])[0];
                            console.log(row[0]);
                        }
                    });
                });
            });
        })();
        if (args.returnBtnChildren)
            return btnBookOfHours.children;
        if (args.isMass) {
            //args.mass is a boolean that tells whether the button prayersArray should include all the hours of the Book Of Hours, or only those pertaining to the mass according to the season and the day on which the mass is celebrated
            let hours = [btnBookOfHours.children[1], btnBookOfHours.children[2], btnBookOfHours.children[3]]; //Those are the 3rd, 6th and 9th hours
            if (Season === Seasons.GreatLent) {
                //We are during the Great Lent, we pray the 3rd, 6th, 9th, 11th, and 12th hours
                if (todayDate.getDay() !== 0 && todayDate.getDay() !== 6)
                    hours.push(btnBookOfHours.children[4], btnBookOfHours.children[5]);
            }
            else if (Season === Seasons.PentecostalDays
                || todayDate.getDay() === 0
                || todayDate.getDay() === 6
                || lordFeasts.indexOf(copticDate) > -1) {
                //We are a Sunday or a Saturday, or during the 50 Pentecostal days, or on a Lord Feast day,
                hours.pop(); //we remove the 9th hour
            }
            return hours;
        }
        ;
        scrollToTop();
        return btnBookOfHours.prayersSequence;
    }
});
/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayers(liturgie) {
    //this function sets the date or the season for the Psalm response and the gospel response
    let prayers = [...GospelPrayersSequence], date;
    let psalm = prayers.indexOf(Prefix.psalmResponse), gospel = prayers.indexOf(Prefix.gospelResponse);
    prayers.forEach((p) => (prayers[prayers.indexOf(p)] = p + "&D=")); //we add '&D=' to each element of prayer
    //we replace the word 'Mass' in 'ReadingsGospelMass' by the liturige, e.g.: 'IncenseDawn'
    prayers[psalm + 1] = prayers[psalm + 1].replace(Prefix.gospelMass, liturgie);
    prayers[psalm + 2] = prayers[psalm + 2].replace(Prefix.gospelMass, liturgie);
    //setting the psalm and gospel responses
    if (lordFeasts.indexOf(copticDate) > -1) {
        //This means we are on a Lord Feast, there is always a specific gospel and psalm response for these feasts, even when it falls during the Great Lent (Annonciation does sometimes)
        date = copticDate;
        prayers[psalm] += date;
        prayers[gospel] += date;
    }
    else if (Number(copticDay) === 29
        && [4, 5, 6].indexOf(Number(copticMonth)) < 0) {
        //we are on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast), and Touba and Amshir (they are excluded because they precede the annonciation)
        date = copticFeasts.theTwentyNinethOfCopticMonth;
        prayers[psalm] += date;
        prayers[gospel] += date;
    }
    else if (Season === Seasons.StMaryFast) {
        //we are during the Saint Mary Fast. There are diffrent gospel responses for Incense Dawn & Vespers
        if (todayDate.getHours() < 15) {
            prayers[gospel] === prayers[gospel].replace("&D=", "Dawn&D=");
        }
        else {
            prayers[gospel] === prayers[gospel].replace("&D=", "Vespers&D=");
        }
        date = Season;
        prayers[psalm] += date;
        prayers[gospel] += date;
    }
    else if (Season === Seasons.Kiahk) {
        // we are during Kiahk month: the first 2 weeks have their own gospel response, and the second 2 weeks have another gospel response
        date = Season;
        if (checkWhichSundayWeAre(Number(copticDay)) === ("1stSunday" || "2ndSunday")) {
            prayers[gospel] = prayers[gospel].replace("&D=", "1&D=");
        }
        else {
            prayers[gospel] = prayers[gospel].replace("&D=", "2&D=");
        }
        prayers[psalm] += "0000";
        prayers[gospel] += date;
    }
    else if (Season === Seasons.GreatLent) {
        //we are during the Great Lent period
        if (copticReadingsDate === copticFeasts.EndOfGreatLentFriday) {
            if (todayDate.getHours() > 15) {
                //We are in the vespers of Lazarus Saturday
                date = copticFeasts.LazarusSaturday;
                prayers[gospel] = prayers[gospel].replace("&D=", "Vespers&D=");
                date = copticFeasts.LazarusSaturday;
            }
            else {
                //We are in the morning
                date = copticFeasts.EndOfGreatLentFriday;
            }
            prayers[gospel] += date;
        }
        else if (copticReadingsDate === copticFeasts.LazarusSaturday) {
            if (todayDate.getHours() < 15) {
                //We are in the morning
                date = copticFeasts.LazarusSaturday;
            }
            else {
                //We are in the Vespers of the Palm Sunday
                date = copticFeasts.PalmSunday;
                prayers[gospel] = prayers[gospel].replace("&D=", "Vespers&D=");
            }
            prayers[psalm] += date;
            prayers[gospel] += date;
        }
        else {
            date = Seasons.GreatLent;
            todayDate.getDay() === 0
                || todayDate.getDay() === 6
                ? (prayers[gospel] = prayers[gospel].replace("&D=", Seasons.GreatLent + "Sundays&D="))
                : (prayers[gospel] = prayers[gospel].replace("&D=", Seasons.GreatLent + "Week&D="));
        }
        prayers[psalm] += "0000";
        prayers[gospel] += date;
    }
    else if (Season === Seasons.JonahFast) {
        date = Season;
        prayers[gospel] = prayers[gospel].replace("&D=", copticReadingsDate.split(Season)[1] + "&D=");
        prayers[psalm] += "0000";
        prayers[gospel] += date;
    }
    else if (Season === Seasons.PentecostalDays) {
        date = Seasons.PentecostalDays;
        prayers[psalm] += date;
        prayers[gospel] += date;
    }
    else if (Season === Seasons.NoSeason) {
        date = "0000";
        prayers[psalm] += date;
        prayers[gospel] += date;
    }
    return prayers;
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
            btnID: "GoTo" + position.el.dataset.root + "From" + btn.rootID,
            label: {
                defaultLanguage: btn.label.defaultLanguage,
                foreignLanguage: btn.label.foreignLanguage,
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
 * Retrieves the gospel of the Vespers office by the date of the day following the current date. We need this because the date of the gospel is not the date of the date of the Vespers office in which it is read, but the date of the next day
 * @param {string} prayers -  prayers is a clone of Gospel[] where prayer[1] is the gospel reading which is like "RGIV" (which is the abreviation of  "Readings Gospel Incense Vespers"). We will add to it "&D=" + the date of the gospel that we will retrieve from setSeasonAndCopticReadingsDate()
 * @returns {string[]} - an array where prayers[1] has been completed with the proper date
 */
function getVespersGospel(prayers) {
    if (todayDate.getHours() > 15) {
        //we check that we are in the afternoon
        let date = new Date(todayDate.getTime() + calendarDay); //we create a date and sets it to the date of the next day
        /*let readingsDate = setSeasonAndCopticReadingsDate(
          convertGregorianDateToCopticDate(date)
        ); //we get the coptic date corresponding to the date we created, and pass it to setSeaonAndCopticReadingsDate() to retrieve the reading date from this function*/
        let readingsDate = setSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(date.getTime())
            .splice(2, 1)
            .join(',')
            .replaceAll(',', '')); //we get the coptic date corresponding to the date we created, and pass it to setSeaonAndCopticReadingsDate() to retrieve the reading date from this function
        prayers[1] += "&D=" + readingsDate; //we add the reading date to
        return prayers;
    }
    else {
        prayers[1] + "&D=" + copticReadingsDate;
        return prayers;
    }
}
async function getGospelReadingAndResponses(liturgy, goseplReadingsArray, languages, container, gospelInsertionPoint) {
    if (!container)
        container = containerDiv;
    if (!gospelInsertionPoint)
        gospelInsertionPoint =
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
        ]; //This is the sequence of the Gospel Prayer/Litany for any liturgy
        let gospelPrayers = [];
        gospelLitanySequence.forEach((title) => {
            gospelPrayers.push(PrayersArray.filter(table => splitTitle(table[0][0])[0] === title)[0]);
        });
        insertPrayersAdjacentToExistingElement(gospelPrayers, prayersLanguages, {
            beforeOrAfter: 'beforebegin',
            el: gospelInsertionPoint
        });
    })();
    if (new Map(JSON.parse(localStorage.showActors)).get("Diacon") === false) {
        alert("Diacon Prayers are set to hidden, we cannot show the gospel");
        return;
    } //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers
    let anchorDataRoot = Prefix.commonPrayer + 'GospelIntroduction&D=$copticFeasts.AnyDay';
    let gospelIntroduction = selectElementsByDataRoot(container, anchorDataRoot, { equal: true });
    if (gospelIntroduction.length === 0)
        return console.log('gospelIntroduction.length = 0 ', gospelIntroduction);
    let responses = setGospelPrayers(liturgy); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']
    //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
    let gospel = goseplReadingsArray.filter((table) => splitTitle(table[0][0])[0] === responses[1] + copticReadingsDate //this is the pasalm text
        || splitTitle(table[0][0])[0] === responses[2] + copticReadingsDate //this is the gospel itself
    ); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####". We should get a string[][][] of 2 elements: a table for the Psalm, and a table for the Gospel
    if (gospel.length === 0)
        return console.log('gospel.length = 0'); //if no readings are returned from the filtering process, then we end the function
    gospel.forEach((table) => {
        let el; //this is the element before which we will insert the Psaml or the Gospel
        if (splitTitle(table[0][0])[0].includes("Gospel&D=")) {
            //This is the Gospel itself, we insert it before the gospel response
            el = gospelInsertionPoint;
        }
        else if (splitTitle(table[0][0])[0].includes("Psalm&D=")) {
            el = gospelIntroduction[gospelIntroduction.length - 1];
        }
        if (!el)
            return;
        insertPrayersAdjacentToExistingElement([table], languages, {
            beforeOrAfter: 'beforebegin',
            el: el
        });
    });
    //We will insert the Gospel response
    (function insertGospeResponse() {
        let gospelResp = PsalmAndGospelPrayersArray.filter((r) => r[0][0].split('&D=')[0] + '&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) === responses[3]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (gospelResp.length === 0)
            gospelResp = PrayersArray.filter((r) => splitTitle(r[0][0])[0] === Prefix.commonPrayer + 'GospelResponse&D=$copticFeasts.AnyDay'); //If no specific gospel response is found, we will get the 'annual' gospel response
        insertPrayersAdjacentToExistingElement(gospelResp, prayersLanguages, {
            beforeOrAfter: "beforebegin",
            el: gospelInsertionPoint,
        });
        //We will eventy remove the insertion point placeholder
        gospelInsertionPoint.remove();
    })();
    //We will insert the Psalm response
    (function insertPsalmResponse() {
        let gospelPrayer = selectElementsByDataRoot(container, Prefix.commonPrayer + 'GospelPrayer&D=$copticFeasts.AnyDay', { equal: true }); //This is the 'Gospel Litany'. We will insert the Psalm response after its end
        let psalmResp = PsalmAndGospelPrayersArray.filter((r) => r[0][0].split('&D=')[0] + '&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) === responses[0]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (!psalmResp || !gospelPrayer)
            return;
        insertPrayersAdjacentToExistingElement(psalmResp, prayersLanguages, {
            beforeOrAfter: 'beforebegin',
            el: gospelPrayer[gospelPrayer.length - 2].nextElementSibling
        });
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
    if (dates.map(date => {
        if (date.startsWith('$')) {
            date = date.replace('$', '');
            if (!date)
                return false;
            date = eval(date);
        }
        ;
        if (date === coptDate)
            return true;
        else
            return false;
    }).includes(true))
        return true;
    else
        return false;
}
/**
 * Inserts the Incense Office Doxologies And Cymbal Verses according to the Coptic feast or season
 * @param {HTMLElement | DocumentFragment} container - The HtmlElement in which the btn prayers are displayed and to which they are appended
 */
async function insertCymbalVersesAndDoxologiesForFeastsAndSeasons(container) {
    let containerChildren = Array.from(container.children);
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
    }
    else if (copticDate === copticFeasts.Cross) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.Cross,
            container: container,
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.Cross,
            container: container,
        });
    }
    else if (Season === Seasons.Kiahk) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: Seasons.Kiahk,
            container: container
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: Seasons.Kiahk,
            container: container
        });
    }
    else if (copticDate === copticFeasts.NativityParamoun) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.NativityParamoun,
            container: container,
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.NativityParamoun,
            container: container,
        });
    }
    else if (copticDate === copticFeasts.Circumcision) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.Circumcision,
            container: container,
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.Circumcision,
            container: container,
        });
    }
    else if (copticDate === copticFeasts.BaptismParamoun) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.BaptismParamoun,
            container: container,
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.BaptismParamoun,
            container: container,
        });
    }
    else if (copticDate === copticFeasts.Baptism) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.Baptism,
            container: container,
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.Baptism,
            container: container
        });
    }
    else if (copticDate === copticFeasts.CanaWedding) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.CanaWedding,
            container: container,
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.CanaWedding,
            container: container,
        });
    }
    else if (copticDate === copticFeasts.EntryToTemple) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.EntryToTemple,
            container: container,
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.EntryToTemple,
            container: container,
        });
    }
    else if (copticDate === copticFeasts.Annonciation) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.Annonciation,
            container: container,
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.Annonciation,
            container: container,
        });
    }
    else if (copticReadingsDate === copticFeasts.LazarusSaturday) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.LazarusSaturday,
            container: container,
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.LazarusSaturday,
            container: container,
        });
    }
    else if (copticReadingsDate === copticFeasts.PalmSunday) {
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
    }
    else if (Season === Seasons.GreatLent) {
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
    }
    else if (Season === Seasons.PentecostalDays) {
        //We will create a string variable that will hold the string expresion of the feast or the season
        let date = 'Seasons.PentecostalDays'; //this is the initial value for the Pentescostal season
        if (copticReadingsDate === copticFeasts.Ascension
            || Number(copticReadingsDate.split(Seasons.PentecostalDays)[1]) > 39)
            date = 'copticFeasts.Ascension'; //IMPORTANT ! This must come before the Pentecoste
        if (copticReadingsDate === copticFeasts.Pentecoste)
            date = 'copticFeasts.Pentecoste'; //This is the value if we are on the Pentecoste
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: eval(date),
            container: container,
        });
        //Inserting the doxologies
        insertDoxologiesForFeastsAndSeasons({
            coptDate: eval(date),
            container: container,
        });
        (function replaceStMaykeVerse() {
            //We will replace the 'annual' cymbal verse of St. Maykel by the Pentecostal verse, and will move the verse
            let stMaykelAnnual = selectElementsByDataRoot(container, Prefix.commonIncense + 'CymablVersesCommon&D=$copticFeasts.AnyDay', { equal: true })[3], //this is the 'annual' Cymbal verse  of container
            stMaykelPentecostal = selectElementsByDataRoot(container, Prefix.cymbalVerses + 'StMaykel&D=$' + date, { equal: true })[0]; //this is the newly inserted Cymbal verse
            stMaykelAnnual.insertAdjacentElement('beforebegin', stMaykelPentecostal);
            //Removing the Annual verse
            stMaykelAnnual.remove();
        })();
        (function InsertLordsFeastFinal() {
            //Inserting the Final Cymbal verses for the joyfull days and Lord's Feasts
            let final = CymbalVersesPrayersArray.filter(table => table[0][0] === Prefix.cymbalVerses + 'LordFeastsEnd&D=$copticFeasts.AnyDay&C=Title'), annualVerses = selectElementsByDataRoot(container, Prefix.commonIncense + 'CymablVersesCommon&D=$copticFeasts.AnyDay', { equal: true }); //annualVereses[8] is the St. Markos annual verse, we will delete the annual verses after it
            for (let i = 13; i > 6; i--) {
                annualVerses[i].remove();
            }
            insertPrayersAdjacentToExistingElement(final, btnIncenseDawn.languages, { beforeOrAfter: 'beforebegin', el: annualVerses[6].nextElementSibling });
        })();
    }
    else if (copticDate === copticFeasts.EntryToEgypt) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.EntryToEgypt,
            container: container
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.EntryToEgypt,
            container: container
        });
    }
    else if (copticDate === copticFeasts.Epiphany) {
        //Inserting Cymbal Verses
        insertCymbalVersesForFeastsAndSeasons({
            coptDate: copticFeasts.Epiphany,
            container: container
        });
        insertDoxologiesForFeastsAndSeasons({
            coptDate: copticFeasts.Epiphany,
            container: container
        });
    }
    else if (copticDate === copticFeasts.theTwentyNinethOfCopticMonth
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
}
;
/**
 * Searchs for the cymbal verses of a coptDate, and if found, insert them adjacent to the first element retrieved by a given "data-root" attribute
 * @param {string[][][]} cymbalVerses -  an array of filtered cymbal verses that will be inserted, if not provided, the cymbalVersesArray will be filtered by the coptDate value
 * @param {string} coptDate - string representing the day and month of the coptic calendar: "ddmm"
 * @param {InsertPosition} position - the insertio position of the cymbal verses
 * @param {boolean} remove - indicates whether to delete or not all the elements having the same data-root
 * @returns
 */
async function insertCymbalVersesForFeastsAndSeasons(param) {
    if (!param.coptDate)
        param.coptDate = copticDate;
    if (!param.position)
        param.position = "beforebegin";
    if (!param.container)
        param.container = containerDiv;
    if (!param.remove)
        param.remove = true;
    let cymbalsTitle = selectElementsByDataRoot(param.container, Prefix.commonIncense + 'CymbalVerses', { equal: true })[0]; //Retrieving the cymbal vereses of the feast or season
    //Retrieving the cymbal vereses of the feast or season
    if (!param.cymbalVerses) {
        param.cymbalVerses = CymbalVersesPrayersArray.filter((tbl) => eval(splitTitle(tbl[0][0])[0].split("&D=")[1].replace("$", "")) ===
            param.coptDate);
    }
    if (!cymbalsTitle || !param.cymbalVerses)
        return;
    if (param.coptDate in lordGreatFeasts) {
        //If we are on a Lord Feast, we add "Eb'oro" to the end
        let endCymbals = CymbalVersesPrayersArray.filter((tbl) => splitTitle(tbl[0][0])[0] ===
            Prefix.cymbalVerses + "LordFeastsEnd&D=$copticFeasts.AnyDay");
        if (param.coptDate === copticFeasts.Resurrection
            || param.coptDate === copticFeasts.Ascension
            || param.coptDate === copticFeasts.Pentecoste) {
            //Inserting the special Cymbal Verse for St. Maykel
            param.cymbalVerses = [
                ...param.cymbalVerses,
                ...CymbalVersesPrayersArray.filter((tbl) => splitTitle(tbl[0][0])[0] ==
                    Prefix.cymbalVerses + "StMaykel&D=$copticFeasts.Resurrection "),
            ];
        }
        if (endCymbals) {
            param.cymbalVerses = [...param.cymbalVerses, ...endCymbals];
        }
    }
    insertPrayersAdjacentToExistingElement(param.cymbalVerses, btnIncenseDawn.languages, {
        beforeOrAfter: param.position,
        el: cymbalsTitle,
    });
    if (param.remove) {
        selectElementsByDataRoot(param.container, cymbalsTitle.dataset.root, { equal: true })
            .forEach(el => el.remove());
    }
}
async function insertDoxologiesForFeastsAndSeasons(param) {
    if (!param.container)
        param.container = containerDiv;
    let containerChildren = Array.from(param.container.children);
    let doxology;
    doxology = DoxologiesPrayersArray.filter((d) => d[0][0]
        && splitTitle(d[0][0].split('&D=')[1])[0]
        && eval(String(splitTitle(d[0][0].split('&D=')[1])[0].replace('$', ''))) ===
            param.coptDate);
    //If we are during the Great Lent, we will select the doxologies according to whether the day is a Saturday or a Sunday, or an ordinary week day
    if (param.coptDate === Seasons.GreatLent) {
        if (todayDate.getDay() === 0 || todayDate.getDay() === 6) {
            //We are during the Great Lent and the day is a Saturday or a Sunday
            doxology = doxology.filter((d) => /GreatLentSundays\&D\=/.test(d[0][0]) === true);
        }
        else {
            doxology = doxology.filter((d) => /GreatLentWeek\d{1}\&D\=/.test(d[0][0]) === true);
        }
    }
    if (doxology) {
        insertPrayersAdjacentToExistingElement(doxology, btnIncenseDawn.languages, {
            beforeOrAfter: "beforebegin",
            el: selectElementsByDataRoot(param.container, Prefix.incenseDawn + 'DoxologyWatesStMary&D=$copticFeasts.AnyDay', { equal: true })[0],
        });
    }
}
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
function addExpandablePrayer(insertion, btnID, label, prayers, languages) {
    let btnDiv = document.createElement("div"); //Creating a div container in which the btn will be displayed
    btnDiv.classList.add("inlineBtns");
    insertion.insertAdjacentElement("beforebegin", btnDiv); //Inserting the div containing the button as 1st element of containerDiv
    let btn = new Button({
        btnID: btnID,
        label: label,
        cssClass: inlineBtnClass,
        languages: languages,
        onClick: () => {
            let prayersContainerDiv = containerDiv.querySelector('#' + btn.btnID + 'Expandable');
            if (!prayersContainerDiv)
                return console.log('no collapsable div was found');
            prayersContainerDiv.classList.toggle('collapsedTitle');
            //Array.from(prayersContainerDiv.children).forEach(child => child.classList.toggle('collapsedTitle'));
        },
    });
    let createdButton = createBtn(btn, btnDiv, btn.cssClass, true, btn.onClick); //creating the html element representing the button. Notice that we give it as 'click' event, the btn.onClick property, otherwise, the createBtn will set it to the default call back function which is showChildBtnsOrPrayers(btn, clear)
    //We will create a newDiv to which we will append all the elements in order to avoid the reflow as much as possible
    let prayersContainerDiv = document.createElement('div');
    prayersContainerDiv.id = btn.btnID + 'Expandable';
    prayersContainerDiv.classList.add('collapsedTitle');
    prayersContainerDiv.style.display = 'grid'; //This is important, otherwise the divs that will be add will not be aligned with the rest of the divs
    insertion.insertAdjacentElement('beforebegin', prayersContainerDiv);
    //We will create a div element for each row of each table in btn.prayersArray
    prayers.forEach(table => table.forEach(row => createHtmlElementForPrayer(row, btn.languages, undefined, prayersContainerDiv)));
    return [createdButton, prayersContainerDiv];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUJ1dHRvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL0RlY2xhcmVCdXR0b25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sTUFBTTtJQXNCVixZQUFZLEdBQWU7UUFkbkIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQWVsQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDO1FBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDNUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxRQUFRO1lBQ1YsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDO0lBQ3BDLENBQUM7SUFDRCxTQUFTO0lBQ1QsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUNELElBQUksZUFBZTtRQUNqQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUMvQixDQUFDO0lBQ0QsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQUksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBQ0QsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUNELElBQUksU0FBUztRQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0lBQ0QsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFDRCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUNELElBQUksZ0JBQWdCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLENBQUM7SUFDRCxJQUFJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUNELElBQUksTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBQ0QsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUNELElBQUksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBQ0QsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzNCLENBQUM7SUFDRCxJQUFJLEdBQUc7UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVELFNBQVM7SUFDVCxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ1YsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUNELElBQUksS0FBSyxDQUFDLEdBQWlCO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUFDRCxJQUFJLFNBQVMsQ0FBQyxTQUFpQjtRQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBSSxlQUFlLENBQUMsVUFBb0I7UUFDdEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztJQUNyQyxDQUFDO0lBQ0QsSUFBSSxTQUFTLENBQUMsU0FBUztRQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBSSxZQUFZLENBQUMsZUFBNkI7UUFDNUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxlQUFlLENBQUM7SUFDdkMsQ0FBQztJQUNELElBQUksV0FBVyxDQUFDLE1BQWtCO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO0lBQzdCLENBQUM7SUFDRCxJQUFJLFNBQVMsQ0FBQyxZQUFzQjtRQUNsQyxJQUFJLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQztJQUNqQyxDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsR0FBYTtRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBQ0QsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFhO1FBQ2hDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUM7SUFDL0IsQ0FBQztJQUNELElBQUksV0FBVyxDQUFDLFdBQW9CO1FBQ2xDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFlO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxRQUFrQjtRQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM1QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsUUFBZ0I7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQUksVUFBVSxDQUFDLElBQWM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUNELElBQUksV0FBVyxDQUFDLFdBQTZCO1FBQzNDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxJQUFJLEdBQUcsQ0FBQyxHQUFRO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7SUFDbEIsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLEdBQVcsSUFBSSxNQUFNLENBQUM7SUFDakMsS0FBSyxFQUFFLFNBQVM7SUFDaEIsS0FBSyxFQUFFO1FBQ0wsZUFBZSxFQUFFLDZCQUE2QjtRQUM5QyxlQUFlLEVBQUUsMEJBQTBCO1FBQzNDLGFBQWEsRUFBRSx1QkFBdUI7S0FDdkM7SUFDRCxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ1osT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDL0UsSUFBSSxNQUFNLEdBQWE7WUFDckIscUNBQXFDO1lBQ3JDLHFDQUFxQztZQUNyQyxxQ0FBcUM7WUFDckMscUNBQXFDO1lBQ3JDLHdDQUF3QztZQUN4Qyx5Q0FBeUM7WUFDekMsb0NBQW9DO1NBQ3JDLENBQUM7UUFDRixZQUFZLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUM1QixZQUFZLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpGLE9BQU8sQ0FBQyxRQUFRO2FBQ2IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1QsT0FBTyxTQUFTLENBQ2QsR0FBRyxFQUFFLFlBQVksRUFDakIsY0FBYyxFQUNkLElBQUksRUFDSixHQUFFLEVBQUUsQ0FBQSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FDNUIsQ0FBQztRQUNKLENBQUMsQ0FBQzthQUNELEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNiLG9IQUFvSDtZQUNwSCxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDN0YsQ0FBQyxDQUFDLENBQUM7UUFFTCxTQUFTLGtCQUFrQixDQUFDLEdBQVU7WUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRO2dCQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUEscVBBQXFQO1lBQy9TLElBQUksYUFBYSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQWdCLENBQUM7WUFDL0UsSUFBSSxlQUFlLENBQUM7WUFFcEIsSUFBSSxhQUFhO2dCQUFFLGVBQWUsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztZQUUzRSxZQUFZLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUU1QixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVE7bUJBQ1osR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQzttQkFDekIsQ0FDSCxHQUFHLENBQUMsZUFBZTt1QkFDZCxHQUFHLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBQztnQkFFckMseUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQSx3R0FBd0c7Z0JBQ3RJLE9BQU07YUFDUDtZQUFBLENBQUM7WUFDRixxQ0FBcUM7WUFDckMsR0FBRyxDQUFDLFFBQVE7Z0JBQ1YsOEJBQThCO2lCQUM3QixHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ2QseUxBQXlMO2dCQUN6TCxTQUFTLENBQ1AsUUFBUSxFQUNSLFlBQVksRUFDWixjQUFjLEVBQ2QsS0FBSyxFQUNMLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUNuQztxQkFDRSxLQUFLLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztZQUU3QyxDQUFDLENBQUMsQ0FBQztZQUVILFNBQVMsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsdUlBQXVJO1FBRTlOLENBQUM7UUFBQSxDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQztBQUVILE1BQU0sU0FBUyxHQUFXLElBQUksTUFBTSxDQUFDO0lBQ25DLEtBQUssRUFBRSxXQUFXO0lBQ2xCLEtBQUssRUFBRSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFO0lBQ3pGLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDWixXQUFXLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQztJQUNuRCxDQUFDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxPQUFPLEdBQVcsSUFBSSxNQUFNLENBQUM7SUFDakMsS0FBSyxFQUFFLFNBQVM7SUFDaEIsS0FBSyxFQUFFLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFO0lBQ2pFLE9BQU8sRUFBRSxDQUFDLE9BQWtDLEVBQUMsaUJBQWlCLEVBQUMsS0FBSyxFQUFDLEVBQUUsRUFBRTtRQUN2RSxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsY0FBYyxFQUFFLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3hFLElBQUksSUFBSSxDQUFDLGlCQUFpQjtZQUFFLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUN0RCxDQUFDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxnQkFBZ0IsR0FBVyxJQUFJLE1BQU0sQ0FBQztJQUMxQyxLQUFLLEVBQUUsa0JBQWtCO0lBQ3pCLEtBQUssRUFBRTtRQUNMLGVBQWUsRUFBRSx1QkFBdUI7UUFDeEMsZUFBZSxFQUFFLGtDQUFrQztLQUNwRDtJQUNELE9BQU8sRUFBRSxDQUFDLE9BQWtDLEVBQUMsaUJBQWlCLEVBQUMsS0FBSyxFQUFDLEVBQUUsRUFBRTtRQUN2RSx5SUFBeUk7UUFDekksZ0JBQWdCLENBQUMsUUFBUSxHQUFHLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDaEUsa0ZBQWtGO1FBQ2xGLElBQUksSUFBSSxDQUFDLGlCQUFpQjtZQUFFLE9BQU8sZ0JBQWdCLENBQUMsUUFBUSxDQUFDO1FBQzdELElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxTQUFTLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDaEUsd0xBQXdMO1lBQ3hMLElBQ0UsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7Z0JBQ3ZCLGtCQUFrQixJQUFJLFlBQVksQ0FBQyxZQUFZLEVBQy9DO2dCQUNBLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQzlCLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFDcEQsQ0FBQyxDQUNGLENBQUM7YUFDSDtZQUVELHlHQUF5RztZQUN6RyxJQUNFLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksbUVBQW1FO2dCQUN4SSxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLDJCQUEyQjtnQkFDdEQsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyw2QkFBNkI7Y0FDckQ7Z0JBQ0EsNFJBQTRSO2dCQUM1UixjQUFjLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsdUxBQXVMO2FBQ3BQO2lCQUFNLElBQ0wsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQy9ELENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSx1QkFBdUI7b0JBQ2xELFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyx5QkFBeUI7Y0FDckQ7Z0JBQ0Esc1FBQXNRO2dCQUN0USxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDNUIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsRUFDMUQsQ0FBQyxDQUNGLENBQUM7YUFDSDtZQUNELGlGQUFpRjtZQUNqRixJQUNFLGNBQWMsQ0FBQyxRQUFRO2dCQUN2QixTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztnQkFDdkIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDdkQ7Z0JBQ0EsdUdBQXVHO2dCQUN2RyxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDNUIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFDbEQsQ0FBQyxDQUNGLENBQUM7YUFDSDtpQkFBTSxJQUNMLGNBQWMsQ0FBQyxRQUFRO2dCQUN2QixTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztnQkFDeEIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDekQ7Z0JBQ0EsNEZBQTRGO2dCQUM1RixjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDNUIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsRUFDN0QsQ0FBQyxFQUNELGlCQUFpQixDQUNsQixDQUFDO2FBQ0g7U0FDRjtJQUNILENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLGNBQWMsR0FBVyxJQUFJLE1BQU0sQ0FBQztJQUN4QyxLQUFLLEVBQUUsZ0JBQWdCO0lBQ3ZCLE1BQU0sRUFBRSxhQUFhO0lBQ3JCLEtBQUssRUFBRTtRQUNMLGVBQWUsRUFBRSxXQUFXO1FBQzVCLGVBQWUsRUFBRSxhQUFhO0tBQy9CO0lBQ0QsV0FBVyxFQUFFLElBQUk7SUFDakIsUUFBUSxFQUFFLEVBQUU7SUFDWixTQUFTLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDO0lBQ2hDLFdBQVcsRUFBRSxJQUFJLGdCQUFnQixFQUFFO0lBQ25DLE9BQU8sRUFBRSxHQUFhLEVBQUU7UUFDdEIsY0FBYyxDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztRQUVqRSxDQUFDLFNBQVMsMEJBQTBCO1lBQ2xDLDhFQUE4RTtZQUM5RSxjQUFjLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBRTFILGdFQUFnRTtZQUNoRSxjQUFjLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FDcEMsS0FBSyxDQUFDLEVBQUU7Z0JBRU4sSUFBSSxjQUFjLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssY0FBYyxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3JLLGNBQWMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQzNGLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVELGNBQWMsQ0FBQyxZQUFZLEdBQUc7WUFDNUIsR0FBRyxrQkFBa0I7WUFDckIsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFBLEVBQUUsQ0FBQSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ3JGLENBQUMsQ0FBQSxzUEFBc1A7UUFHeFAsQ0FBQyxTQUFTLHdCQUF3QjtZQUNoQyx5Q0FBeUM7WUFDekMsY0FBYyxDQUFDLFFBQVEsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFDekQseURBQXlEO1lBQ3pELGNBQWMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUM7UUFDL0QsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVMLENBQUMsU0FBUyxpQkFBaUI7WUFDekIsSUFBSSxPQUFPLEdBQVcsTUFBTSxDQUFDLGFBQWEsQ0FBRTtZQUM1Qyx1RkFBdUY7WUFDdkYsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQixnRkFBZ0Y7Z0JBQ2hGLE9BQU8sSUFBSSx5Q0FBeUMsQ0FBQTthQUNyRDtpQkFBTTtnQkFDTCwyRUFBMkU7Z0JBQzNFLE9BQU8sSUFBSSwwQ0FBMEMsQ0FBQzthQUN2RDtZQUNELGNBQWMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxXQUFXLEVBQUUsQ0FBQztRQUNkLE9BQU8sY0FBYyxDQUFDLGVBQWUsQ0FBQztJQUN4QyxDQUFDO0lBQ0QsZ0JBQWdCLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDM0IsSUFBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQztRQUNoRCxDQUFDLEtBQUssVUFBVSxtQkFBbUI7WUFDakMsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLFNBQVMsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLFNBQVM7Z0JBQUUsT0FBTztZQUN6RSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDeEQseUZBQXlGO2dCQUN6RixDQUFDLFNBQVMscUJBQXFCO29CQUM3QixJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsU0FBUzt3QkFBRSxPQUFPO29CQUN6Qyx5R0FBeUc7b0JBQ3pHLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsR0FBQyxDQUFDO3dCQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQy9ILENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ0wsQ0FBQyxLQUFLLFVBQVUscUJBQXFCO29CQUNuQyxJQUFJLFlBQVksR0FDZCx3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLFlBQVksR0FBRyxxQ0FBcUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUU5SCxJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUEwQixDQUFDLENBQUMsb0NBQW9DO29CQUN0SCxTQUFTLENBQUMscUJBQXFCLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFnQixDQUFDLENBQUMsQ0FBQSwwQ0FBMEM7b0JBQ25JLElBQUksWUFBWSxHQUFpQixjQUFjLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQ0FBb0M7b0JBQ25MLElBQUksWUFBWSxHQUFjLGNBQWMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxZQUFZLEdBQUcsZ0RBQWdELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtvQkFDOUwsSUFBSSxNQUFNLEdBQWlCLEVBQUUsQ0FBQztvQkFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLHFDQUFxQztvQkFDbEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBQzt3QkFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDZIQUE2SDt3QkFDaEssSUFBRyxDQUFDLEdBQUMsQ0FBQzs0QkFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUEsd0hBQXdIO3dCQUNySyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2pDLElBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxDQUFDOzRCQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7cUJBQzNEO29CQUNELHNDQUFzQyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BILENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ0wsT0FBTTthQUNQO2lCQUFNO2dCQUNMLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNwSztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFTCxrREFBa0QsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFL0UsNEJBQTRCLENBQzFCLE1BQU0sQ0FBQyxVQUFVLEVBQ2pCLDRCQUE0QixDQUFDLFlBQVksRUFDekMsNEJBQTRCLENBQUMsU0FBUyxFQUN0QyxjQUFjLENBQUMsV0FBVyxDQUMzQixDQUFDO1FBQ0YsQ0FBQyxLQUFLLFVBQVUsNEJBQTRCO1lBQzFDLElBQUksY0FBYyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTztZQUU3RCxJQUFJLGFBQWEsR0FBa0IsbUJBQW1CLENBQ3BELGNBQWMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBZ0IsRUFDckQsZ0JBQWdCLEVBQ2hCO2dCQUNBLGVBQWUsRUFBRSxzQkFBc0I7Z0JBQ3ZDLGVBQWUsRUFBRSxzQkFBc0I7YUFDeEMsRUFDQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsQ0FBQyxFQUNsRyxjQUFjLENBQUMsU0FBUyxDQUN2QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUssOENBQThDO1lBQzlDLDRGQUE0RjtRQUN4RyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ1AsQ0FBQztDQUNGLENBQUMsQ0FBQztBQUVILE1BQU0saUJBQWlCLEdBQVcsSUFBSSxNQUFNLENBQUM7SUFDM0MsS0FBSyxFQUFFLG1CQUFtQjtJQUMxQixLQUFLLEVBQUU7UUFDTCxlQUFlLEVBQUUsV0FBVztRQUM1QixlQUFlLEVBQUUsaUJBQWlCO0tBQ25DO0lBQ0QsV0FBVyxFQUFFLElBQUk7SUFDakIsV0FBVyxFQUFFLElBQUksZ0JBQWdCLEVBQUU7SUFDbkMsU0FBUyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztJQUNoQyxPQUFPLEVBQUUsR0FBYSxFQUFFO1FBQ3RCLGlCQUFpQixDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztRQUNoRSxDQUFDLFNBQVMsd0JBQXdCO1lBQ2hDLDhFQUE4RTtZQUM5RSxpQkFBaUIsQ0FBQyxlQUFlLEdBQUcsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUU3SCxnRUFBZ0U7WUFDaEUsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FDdkMsS0FBSyxDQUFDLEVBQUU7Z0JBRU4sSUFBSSxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakwsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ2pHLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVMLGlCQUFpQixDQUFDLFlBQVksR0FBRztZQUMvQixHQUFHLGtCQUFrQjtZQUNyQixHQUFHLG1CQUFtQjtTQUN2QixDQUFDO1FBQ0YsQ0FBQyxTQUFTLDJCQUEyQjtZQUNuQywwQkFBMEI7WUFDMUIsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FDdEMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyw2Q0FBNkMsQ0FBQyxFQUN4RixDQUFDLENBQ0YsQ0FBQztZQUVGLDJEQUEyRDtZQUMzRCxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUN0QyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsNkNBQTZDLENBQUMsRUFDN0csQ0FBQyxDQUNGLENBQUM7WUFFRiwyREFBMkQ7WUFDM0QsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FDdEMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLDZDQUE2QyxDQUFDLEVBQzdHLENBQUMsQ0FDRixDQUFDO1lBQ0YseUNBQXlDO1lBQ3pDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQ3RDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyw0Q0FBNEMsQ0FBQyxFQUM1RyxDQUFDLENBQ0YsQ0FBQztZQUVGLDZCQUE2QjtZQUM3QixpQkFBaUIsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUN0QyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcscUNBQXFDLENBQUMsRUFDdEcsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO1FBRUwsQ0FBQyxTQUFTLGlCQUFpQjtZQUN6Qix1RkFBdUY7WUFDdkYsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQixnRkFBZ0Y7Z0JBQ2hGLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQ3RDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyx5Q0FBeUMsQ0FBQyxFQUMzRyxDQUFDLENBQ0YsQ0FBQzthQUNIO2lCQUFNO2dCQUNMLDJFQUEyRTtnQkFDM0UsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FDdEMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLDBDQUEwQyxDQUFDLEVBQzVHLENBQUMsQ0FDRixDQUFDO2FBQ0g7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRUwsQ0FBQyxTQUFTLG1CQUFtQjtZQUMzQixJQUNFLE1BQU0sS0FBSyxPQUFPLENBQUMsU0FBUztnQkFDNUIsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7Z0JBQ3ZCLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQ3ZCO2dCQUNBLG9HQUFvRztnQkFDcEcsQ0FBQyxTQUFTLHNCQUFzQjtvQkFDOUIsSUFBSSxLQUFLLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQ2hELE1BQU0sQ0FBQyxjQUFjLEdBQUcsb0RBQW9ELENBQzdFLENBQUM7b0JBQ0YsSUFBSSxVQUFVLEdBQWEsRUFBRSxDQUFDO29CQUM5QixzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUMvQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFCLENBQUMsQ0FBQyxZQUFZLENBQ2pCLENBQUM7b0JBQ0YsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ3RELGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFDO3FCQUNuRTt5QkFBTSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTt3QkFDMUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7cUJBQ3ZFO2dCQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDTjtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxXQUFXLEVBQUUsQ0FBQztRQUNkLE9BQU8saUJBQWlCLENBQUMsZUFBZSxDQUFDO0lBQzNDLENBQUM7SUFDRCxnQkFBZ0IsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMzQixrREFBa0QsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsRiw0QkFBNEIsQ0FDMUIsTUFBTSxDQUFDLGFBQWEsRUFDcEIsK0JBQStCLENBQUMsWUFBWSxFQUM1QywrQkFBK0IsQ0FBQyxTQUFTLEVBQ3pDLGlCQUFpQixDQUFDLFdBQVcsQ0FDOUIsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLGNBQWMsR0FBVyxJQUFJLE1BQU0sQ0FBQztJQUN4QyxLQUFLLEVBQUUsZ0JBQWdCO0lBQ3ZCLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLEtBQUssRUFBRSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFO0lBQy9GLFdBQVcsRUFBRSxJQUFJLGdCQUFnQixFQUFFO0lBQ25DLFdBQVcsRUFBRSxJQUFJO0lBQ2pCLFNBQVMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUM7SUFDaEMsT0FBTyxFQUFFLEdBQWEsRUFBRTtRQUN0QixjQUFjLENBQUMsWUFBWSxHQUFHO1lBQzVCLEdBQUcsa0JBQWtCO1lBQ3JCLEdBQUcsc0JBQXNCO1lBQ3pCLEdBQUcsdUJBQXVCO1NBQzNCLENBQUM7UUFDRixJQUFJLGNBQWMsQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO1lBQ3JDLDBOQUEwTjtZQUMxTix1RkFBdUY7WUFDdkYsT0FBTztTQUNSO1FBQ0QsNENBQTRDO1FBQzVDLGNBQWMsQ0FBQyxlQUFlLEdBQUc7WUFDL0IsR0FBRyxvQkFBb0IsQ0FBQyxlQUFlO1lBQ3ZDLEdBQUcsb0JBQW9CLENBQUMsV0FBVztZQUNuQyxHQUFHO2dCQUNELE1BQU0sQ0FBQyxVQUFVLEdBQUcsdURBQXVEO2dCQUMzRSxNQUFNLENBQUMsWUFBWSxHQUFHLHFDQUFxQztnQkFDM0QsTUFBTSxDQUFDLFlBQVksR0FBRyx3Q0FBd0M7Z0JBQzlELE1BQU0sQ0FBQyxVQUFVLEdBQUcsa0RBQWtEO2dCQUN0RSxNQUFNLENBQUMsWUFBWSxHQUFHLGdEQUFnRDtnQkFDdEUsTUFBTSxDQUFDLFVBQVUsR0FBRyxtQ0FBbUM7YUFDeEQ7WUFDRCxHQUFHLG9CQUFvQixDQUFDLFNBQVM7U0FDbEMsQ0FBQztRQUNGLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDN0YsY0FBYyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDaEMsT0FBTyxjQUFjLENBQUMsZUFBZSxDQUFDO0lBQ3hDLENBQUM7SUFDRCxnQkFBZ0IsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMzQixjQUFjLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDbEQsQ0FBQztDQUNGLENBQUMsQ0FBQztBQUVILE1BQU0sZ0JBQWdCLEdBQVcsSUFBSSxNQUFNLENBQUM7SUFDMUMsS0FBSyxFQUFFLGtCQUFrQjtJQUN6QixNQUFNLEVBQUUsV0FBVztJQUNuQixLQUFLLEVBQUUsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUU7SUFDdkUsV0FBVyxFQUFFLElBQUksZ0JBQWdCLEVBQUU7SUFDbkMsV0FBVyxFQUFFLElBQUk7SUFDakIsU0FBUyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztJQUNoQyxPQUFPLEVBQUUsR0FBYSxFQUFFO1FBQ3RCLGdCQUFnQixDQUFDLFlBQVksR0FBRztZQUM5QixHQUFHLGtCQUFrQjtZQUNyQixHQUFHLHNCQUFzQjtZQUN6QixHQUFHLHlCQUF5QjtTQUM3QixDQUFDO1FBQ0YsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO1lBQ3ZDLDBOQUEwTjtZQUMzTiwyRkFBMkY7WUFDMUYsT0FBTztTQUNSO1FBQ0QsNENBQTRDO1FBQzVDLGdCQUFnQixDQUFDLGVBQWUsR0FBRztZQUNqQyxHQUFHLG9CQUFvQixDQUFDLGVBQWU7WUFDdkMsR0FBRyxvQkFBb0IsQ0FBQyxhQUFhO1lBQ3JDLEdBQUcsb0JBQW9CLENBQUMsb0JBQW9CO1lBQzVDLEdBQUcsb0JBQW9CLENBQUMsWUFBWTtZQUNwQyxHQUFHLG9CQUFvQixDQUFDLFNBQVM7U0FDbEMsQ0FBQztRQUVGLDRDQUE0QztRQUM1QyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUNyQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUN0QyxNQUFNLENBQUMsVUFBVSxHQUFHLGlEQUFpRCxDQUN0RSxFQUNELENBQUMsQ0FDRixDQUFDO1FBQ0YsV0FBVyxFQUFFLENBQUM7UUFDZCxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNqRyxnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ2xDLE9BQU8sZ0JBQWdCLENBQUMsZUFBZSxDQUFDO0lBQzFDLENBQUM7SUFDRCxnQkFBZ0IsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMzQixjQUFjLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxjQUFjLEdBQVcsSUFBSSxNQUFNLENBQUM7SUFDeEMsS0FBSyxFQUFFLGdCQUFnQjtJQUN2QixNQUFNLEVBQUUsU0FBUztJQUNqQixLQUFLLEVBQUUsRUFBRSxlQUFlLEVBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRTtJQUM5RixXQUFXLEVBQUUsSUFBSSxnQkFBZ0IsRUFBRTtJQUNuQyxXQUFXLEVBQUUsSUFBSTtJQUNqQixTQUFTLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDO0lBQ2hDLE9BQU8sRUFBRSxHQUFhLEVBQUU7UUFDdEIsY0FBYyxDQUFDLFlBQVksR0FBRztZQUM1QixHQUFHLGtCQUFrQjtZQUNyQixHQUFHLHNCQUFzQjtZQUN6QixHQUFHLHVCQUF1QjtTQUMzQixDQUFDO1FBQ0YsSUFBSSxjQUFjLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTtZQUNyQywwTkFBME47WUFDMU4sc0ZBQXNGO1lBQ3RGLE9BQU87U0FDUjtRQUNELDRDQUE0QztRQUM1QyxjQUFjLENBQUMsZUFBZSxHQUFHO1lBQy9CLEdBQUcsb0JBQW9CLENBQUMsZUFBZTtZQUN2QyxHQUFHLG9CQUFvQixDQUFDLFdBQVc7WUFDbkMsR0FBRyxvQkFBb0IsQ0FBQyxvQkFBb0I7WUFDNUMsR0FBRyxvQkFBb0IsQ0FBQyxZQUFZO1lBQ3BDLEdBQUcsb0JBQW9CLENBQUMsU0FBUztTQUNsQyxDQUFDO1FBRUYsOEVBQThFO1FBQzlFLFdBQVcsRUFBRSxDQUFDO1FBQ2Qsb0JBQW9CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3RixjQUFjLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUNoQyxPQUFPLGNBQWMsQ0FBQyxlQUFlLENBQUM7SUFDeEMsQ0FBQztJQUNELGdCQUFnQixFQUFFLEtBQUssRUFBRSxNQUFjLGNBQWMsRUFBRSxFQUFFO1FBQ3ZELElBQUksV0FBVyxHQUNiLENBQUMsY0FBYyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNwRSxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEQsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTFELElBQUksY0FBYyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7UUFFckMsK0JBQStCLENBQzdCLEdBQUcsRUFDSCx3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLFVBQVUsR0FBRyxrREFBa0QsRUFBRSxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNqSSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLHlCQUF5QixFQUFFLEVBQy9FLG9CQUFvQixFQUN0QixxQkFBcUIsQ0FBQyxDQUFDO1FBRXZCLENBQUMsU0FBUyxxQkFBcUI7WUFDN0Isd0ZBQXdGO1lBQ3hGLHFCQUFxQixDQUNuQixDQUFDLEdBQUcsV0FBVyxDQUFDLEVBQ2hCO2dCQUNFLGFBQWEsRUFBRSxVQUFVO2dCQUN6QixFQUFFLEVBQUUsd0JBQXdCLENBQUMsY0FBYyxFQUFFLHVDQUF1QyxFQUFFLEVBQUMsUUFBUSxFQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFHLEVBQ0QsNkJBQTZCLENBQzlCLENBQUM7WUFFRixnSUFBZ0k7WUFDaEksSUFBSSxNQUFNLEdBQUcsd0JBQXdCLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsa0VBQWtFLEVBQUUsRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUMvSixxQkFBcUIsQ0FDbkIsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxFQUNoQjtnQkFDRSxhQUFhLEVBQUUsVUFBVTtnQkFDekIsRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzthQUM5QixFQUNELHVCQUF1QixDQUN4QixDQUFDO1lBRUYseUVBQXlFO1lBQ3pFLHFCQUFxQixDQUNuQixDQUFDLEdBQUcsV0FBVyxDQUFDLEVBQ2hCO2dCQUNFLGFBQWEsRUFBRSxhQUFhO2dCQUM1QixFQUFFLEVBQUUsd0JBQXdCLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsOEJBQThCLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbkgsRUFDRCxvQkFBb0IsQ0FDckIsQ0FBQTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxDQUFDLFNBQVMsdUJBQXVCO1lBQy9CLCtFQUErRTtZQUMvRSxJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxVQUFVLEdBQUcsaURBQWlELENBQUMsQ0FBQztZQUNsSSxJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFNO1lBQ3BCLElBQUksTUFBTSxHQUFHLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsVUFBVSxHQUFHLG9EQUFvRCxFQUFFLEVBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFakosbUJBQW1CLENBQ2pCLE1BQU0sRUFDTixtQkFBbUIsRUFDbkI7Z0JBQ0UsZUFBZSxFQUFFLGVBQWU7Z0JBQ2hDLGVBQWUsRUFBRSxtQkFBbUI7YUFDckMsRUFDRCxPQUFPLEVBQ1AsY0FBYyxDQUFDLFNBQVMsQ0FDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxDQUFDLFNBQVMscUJBQXFCO1lBQzdCLG9EQUFvRDtZQUNwRCxJQUFJLEtBQUssR0FBRyx3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLFVBQVUsR0FBRywwQ0FBMEMsRUFBRSxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBRW5JLElBQUksUUFBUSxHQUFpQixxQkFBcUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzlELHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsS0FBSyxJQUFJO3VCQUNwRCx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFBO1lBQzVELENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsUUFBUSxHQUFHLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7WUFHOUksK0JBQStCLENBQzdCLFFBQVEsRUFDUixHQUFHLEVBQ0g7Z0JBQ0UsZUFBZSxFQUFFLGVBQWU7Z0JBQ2hDLGVBQWUsRUFBRSx3QkFBd0I7YUFDMUMsRUFDRCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBZ0IsQ0FDckMsQ0FBQTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxDQUFDLFNBQVMscUJBQXFCO1lBQzdCLElBQUksR0FBRyxLQUFLLGNBQWM7Z0JBQUUsT0FBTyxDQUFDLDJDQUEyQztZQUUvRSxJQUFJLE9BQU8sR0FBaUIseUJBQXlCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLDBCQUEwQixDQUFDLENBQUMsQ0FBQztZQUU3SSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBRWpDLElBQUksV0FBVyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELE1BQU0sQ0FBQyxZQUFZLEdBQUcsZ0RBQWdELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU3RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUUsQ0FBQyxFQUFDO2dCQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDbkM7WUFJRCxJQUFJLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsWUFBWSxHQUFDLDBEQUEwRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFMUosT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFckIsSUFBSSxNQUFNLEdBQUcsd0JBQXdCLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEdBQUMsNkNBQTZDLEVBQUUsRUFBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4SSxJQUFJLENBQUMsTUFBTTtnQkFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakMsbUJBQW1CLENBQUMsTUFBTSxFQUN4QixvQkFBb0IsRUFDcEI7Z0JBQ0EsZUFBZSxFQUFFLGdDQUFnQztnQkFDakQsZUFBZSxFQUFFLCtDQUErQzthQUNqRSxFQUNDLE9BQU8sRUFDUCxHQUFHLENBQUMsU0FBUyxDQUNkLENBQUE7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ1AsQ0FBQztDQUNGLENBQUMsQ0FBQztBQUVILE1BQU0sYUFBYSxHQUFXLElBQUksTUFBTSxDQUFDO0lBQ3ZDLEtBQUssRUFBRSxlQUFlO0lBQ3RCLEtBQUssRUFBRSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRTtJQUN6RSxXQUFXLEVBQUUsSUFBSSxnQkFBZ0IsRUFBRTtJQUNuQyxXQUFXLEVBQUUsS0FBSztJQUNsQixlQUFlLEVBQUUsRUFBRTtJQUNuQixPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ1osS0FBSyxDQUFDLG1GQUFtRixDQUFDLENBQUE7UUFDMUYsT0FBTSxDQUFDLG9DQUFvQztRQUMzQyxhQUFhLENBQUMsWUFBWSxHQUFHO1lBQzNCLEdBQUcsa0JBQWtCO1lBQ3JCLEdBQUcsc0JBQXNCO1lBQ3pCLEdBQUcsc0JBQXNCO1NBQzFCLENBQUM7UUFFRixXQUFXLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQztRQUVqRCxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzNGLGFBQWEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE9BQU8sYUFBYSxDQUFDLGVBQWUsQ0FBQTtJQUN0QyxDQUFDO0lBQ0QsZ0JBQWdCLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDM0IsY0FBYyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLGVBQWUsR0FBYTtJQUNoQyxJQUFJLE1BQU0sQ0FBQztRQUNULEtBQUssRUFBRSw4QkFBOEI7UUFDckMsS0FBSyxFQUFFLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFO1FBQ3RFLFFBQVEsRUFBRSxjQUFjO1FBQ3hCLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDWix5QkFBeUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQ0YsQ0FBQztJQUNGLElBQUksTUFBTSxDQUFDO1FBQ1QsS0FBSyxFQUFFLGdDQUFnQztRQUN2QyxLQUFLLEVBQUUsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRTtRQUN4RSxRQUFRLEVBQUUsY0FBYztRQUN4QixPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ1oseUJBQXlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QyxDQUFDO0tBQ0YsQ0FBQztJQUNGLElBQUksTUFBTSxDQUFDO1FBQ1QsS0FBSyxFQUFFLDhCQUE4QjtRQUNyQyxLQUFLLEVBQUUsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUU7UUFDcEUsUUFBUSxFQUFFLGNBQWM7UUFDeEIsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUNaLHlCQUF5QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FDRixDQUFDO0lBQ0YsSUFBSSxNQUFNLENBQUM7UUFDVCxLQUFLLEVBQUUsNkJBQTZCO1FBQ3BDLEtBQUssRUFBRSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRTtRQUN6RSxRQUFRLEVBQUUsY0FBYztRQUN4QixNQUFNLEVBQUUsUUFBUTtRQUNoQixTQUFTLEVBQUUsT0FBTztRQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ1oseUJBQXlCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0MsQ0FBQztLQUNGLENBQUM7Q0FDSCxDQUFDO0FBRUYsTUFBTSxpQkFBaUIsR0FBVyxJQUFJLE1BQU0sQ0FBQztJQUMzQyxLQUFLLEVBQUUsbUJBQW1CO0lBQzFCLEtBQUssRUFBRTtRQUNMLGVBQWUsRUFBRSxnQkFBZ0I7UUFDakMsZUFBZSxFQUFFLHdCQUF3QjtRQUN6QyxhQUFhLEVBQUUsaUJBQWlCO0tBQ2pDO0lBQ0QsV0FBVyxFQUFFLElBQUksZ0JBQWdCLEVBQUU7SUFDbkMsV0FBVyxFQUFFLElBQUk7SUFDakIsWUFBWSxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUM7SUFDL0IsU0FBUyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztJQUNoQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ1osNkRBQTZEO1FBQzdELGlCQUFpQixDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDO1lBQzVFLDhDQUE4QztZQUM5QyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxRCxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4QyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBR3RFLHVCQUF1QjtRQUNyQixDQUFDLFNBQVMsUUFBUTtZQUNWLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRyx5Q0FBeUMsRUFBRSxNQUFNLENBQUMsWUFBWSxHQUFHLDhCQUE4QixDQUFDLENBQUE7UUFDeEssQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVYLGdEQUFnRDtRQUM1QyxDQUFDLFNBQVMsdUJBQXVCO1lBQy9CLElBQUksQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLFNBQVM7bUJBQzFCLE1BQU0sS0FBSyxPQUFPLENBQUMsU0FBUyxDQUFDO21CQUM3QixTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQzttQkFDeEIsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDN0IsMERBQTBEO2dCQUMxRCxpQkFBaUI7cUJBQ1osZUFBZTtxQkFDZixNQUFNLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLDBDQUEwQyxDQUFDLEVBQzdHLENBQUMsRUFDRCxNQUFNLENBQUMsVUFBVSxHQUFHLGlEQUFpRCxDQUFDLENBQUM7Z0JBQy9FLDJEQUEyRDtnQkFDM0QsaUJBQWlCO3FCQUNaLGVBQWU7cUJBQ2YsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzdIO2lCQUNJLElBQ0QsQ0FBQyxNQUFNO21CQUNBLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO21CQUN4QixTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO21CQUM3QixDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsUUFBUTt1QkFDeEIsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQzsyQkFDckIsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ25DO2dCQUNGLDhCQUE4QjtnQkFDOUIsaUJBQWlCO3FCQUNaLGVBQWU7cUJBQ2YsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxSCxtQkFBbUI7Z0JBQ25CLGlCQUFpQjtxQkFDWixlQUFlO3FCQUNmLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsa0NBQWtDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNySDtpQkFDSTtnQkFDRCxpQ0FBaUM7Z0JBQ2pDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLDBDQUEwQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzSixpQkFBaUI7Z0JBQ2pCLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLGlDQUFpQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDako7UUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ0QsV0FBVyxFQUFFLENBQUM7UUFDZCxPQUFPLGlCQUFpQixDQUFDLGVBQWUsQ0FBQztJQUMzQyxDQUFDO0lBQ1AsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO1FBQ3JCLElBQUksY0FBYyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQztRQUVuRCxDQUFDLFNBQVMsNEJBQTRCO1lBRXBDLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcseURBQXlELENBQUM7WUFFN0YsSUFBSSxnQkFBZ0IsR0FBRyx3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsUUFBUSxFQUFFLEVBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7WUFFeEYsSUFBSSxZQUFZLEdBQUcsaUJBQWlCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUM7WUFFakgsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQUUsT0FBTztZQUVwQyxJQUFJLFVBQVUsR0FBRyxtQkFBbUIsQ0FDbEMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFtQixFQUNyQyxjQUFjLEVBQ2Q7Z0JBQ0UsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZDLEVBQ0QsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMxQyxpQkFBaUIsQ0FBQyxTQUFTLENBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFTCxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMxRCxZQUFZO1lBQ1osVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFFBQVEsR0FBRyxhQUFhLENBQUM7WUFFL0QsZ0JBQWdCLENBQUMsT0FBTyxDQUN0QixDQUFDLEdBQW1CLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FDdEMsQ0FBQztRQUVKLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFTCxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsU0FBUztlQUMzQixNQUFNLEtBQUssT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUNqQyx1RkFBdUY7WUFDdkYsc0NBQXNDLENBQ3BDLGlCQUFpQixDQUFDLFlBQVk7aUJBQzNCLE1BQU0sQ0FDTCxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsVUFBVSxHQUFHLDhDQUE4QyxDQUFDLEVBQy9HLGlCQUFpQixDQUFDLFNBQVMsRUFDM0I7Z0JBQ0UsYUFBYSxFQUFFLGFBQWE7Z0JBQzVCLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLFVBQVUsR0FBQywrQ0FBK0MsRUFBRSxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqSSxDQUNGLENBQUE7U0FDRTtRQUNMLElBQUksTUFBTSxHQUFnQix3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLFlBQVksR0FBRyw0Q0FBNEMsRUFBRSxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMscUZBQXFGO1FBQzVPLElBQUksT0FBcUIsQ0FBQztRQUM1QixDQUFDLFNBQVMsbUJBQW1CO1lBQzNCLE9BQU8sR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO1lBRTVILE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyw4SkFBOEo7WUFFcE0sd0NBQXdDO1lBQ3hDLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLE9BQU87WUFFbkMsd0JBQXdCO1lBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBSSxlQUFlLEVBQUUscUJBQXFCLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkwsNkNBQTZDO1lBQzdDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDdEIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGlCQUFpQjtnQkFDbkQscUJBQXFCLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3BDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNwQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsRUFBRTthQUNyQyxDQUFDLENBQUMsQ0FBQSx1SEFBdUg7WUFFcEgsc0NBQXNDLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN6SCxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ0wsQ0FBQyxTQUFTLGdCQUFnQjtZQUN4QixPQUFPLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLFVBQVUsR0FBRyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsQ0FBQztZQUVwSSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBRWpDLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyw4SkFBOEo7WUFFdE0sc0RBQXNEO1lBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDWixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsZUFBZSxFQUFFLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsRUFBRTtpQkFDMUssQ0FBQyxDQUFDLENBQUM7WUFFSiw2Q0FBNkM7WUFDN0MsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNwQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLENBQUMsZUFBZSxDQUFDLEVBQUU7YUFDakwsQ0FBQyxDQUFDLENBQUEsdUhBQXVIO1lBRTVILHNDQUFzQyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbkgsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNMLENBQUMsU0FBUyxZQUFZO1lBQ3BCLE9BQU8sR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO1lBRTVILElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLE9BQU87WUFFakMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLDhKQUE4SjtZQUVwTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksZUFBZSxFQUFFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBRWxMLDZDQUE2QztZQUM3QyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLEVBQUUscUJBQXFCLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUEsdUhBQXVIO1lBRWxULHNDQUFzQyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFdkgsQ0FBQyxTQUFTLG9CQUFvQjtnQkFDNUIsSUFBSSxNQUFNLEdBQ1Isd0JBQXdCLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3JHLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUE7Z0JBRXpDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO29CQUFFLE9BQU87Z0JBRWhDLElBQUksUUFBUSxHQUFpQixZQUFZO3FCQUN0QyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDaEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO3VCQUMxQyxDQUNELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxVQUFVOzJCQUM3RSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUNoRixDQUFDLENBQUM7Z0JBQ0gsSUFBRyxRQUFRLENBQUMsTUFBTSxLQUFHLENBQUMsRUFBQztvQkFDckIsa0ZBQWtGO29CQUNsRixRQUFRLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUNyQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7MkJBQzFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQTtpQkFDM0k7Z0JBQ0gsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDNUMsZ0NBQWdDO29CQUNoQyxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsU0FBUyxFQUFFO3dCQUNoQyxrSUFBa0k7d0JBQ2xJLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7K0JBQ3ZCLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDOzRCQUMzQixRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzs7NEJBQ3JFLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3FCQUMzRTtvQkFBQSxDQUFDO29CQUNGLHNDQUFzQyxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3JIO2dCQUFBLENBQUM7Z0JBRUYsNEJBQTRCO2dCQUM1QixJQUFJLGdCQUFnQixHQUFrQix3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLGNBQWMsR0FBRyx1Q0FBdUMsRUFBRSxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO2dCQUU5SixJQUFHLENBQUMsZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFJLENBQUM7b0JBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBRS9HLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUUvRixDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNMLENBQUMsU0FBUyxnQkFBZ0I7WUFDeEIsT0FBTyxHQUFHLGNBQWMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBRWhJLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLE9BQU87WUFFakMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLDhKQUE4SjtZQUV0TSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3RCLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFDaEssWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFFckMscUJBQXFCLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFFbEoscUJBQXFCLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzthQUNuSixDQUFDLENBQUM7WUFFSCwyREFBMkQ7WUFDekQ7Ozs7Z0JBSUksQ0FBQyxtR0FBbUc7WUFFMUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNwQjtnQkFDRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVTtnQkFDNUMsV0FBVyxHQUFHLElBQUksR0FBSSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMvRixVQUFVLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7YUFDOUYsQ0FBQyxDQUFDO1lBRUwsSUFBSSxjQUFjLEdBQ2hCLHdCQUF3QixDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRXZHLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLE9BQU87WUFDeEMsSUFBSSxNQUFNLEdBQWtEO2dCQUMxRCxhQUFhLEVBQUUsYUFBYTtnQkFDNUIsRUFBRSxFQUFFLGNBQWMsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFpQzthQUM5RSxDQUFDO1lBRUYsT0FBTztpQkFDSixPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2YsS0FBSztxQkFDRixHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ1QsT0FBTywwQkFBMEIsQ0FDL0IsR0FBRyxFQUNILENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUNaLFNBQVMsRUFDVCxNQUFNLENBQUMsQ0FBQTtnQkFDWCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBRVAsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNMLENBQUMsU0FBUyxzQkFBc0I7WUFDOUIsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLGVBQWU7Z0JBQUUsT0FBTztZQUMvQyxJQUFJLEtBQUssR0FBaUIsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7WUFDaEksSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDcEIsc0NBQXNDLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTthQUM5RztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxDQUFDLFNBQVMsbUJBQW1CO1lBRWYsOEJBQThCO1lBQzlCLDRCQUE0QixDQUMxQixNQUFNLENBQUMsVUFBVSxFQUNqQixjQUFjLENBQUMsZUFBZSxFQUM5QixpQkFBaUIsRUFDakIsaUJBQWlCLENBQUMsV0FBVyxDQUM5QixDQUFDO1FBQ2hCLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxDQUFDLEtBQUssVUFBVSx1QkFBdUI7WUFDckMsSUFBSSxTQUFTLEdBQVksY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFDLE1BQU0sRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsNERBQTREO1lBRTVILElBQUksV0FBVyxHQUFpQixFQUFFLENBQUM7WUFDbkMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNoRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUV4QyxJQUFJLE9BQU8sR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1RCxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNwQyxPQUFPLENBQUMsRUFBRSxHQUFHLGlCQUFpQixDQUFDO1lBRS9CLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFL0MsSUFBSSxlQUE4QyxDQUFDO1lBQ25ELElBQUksZ0JBQWdDLENBQUM7WUFDckMsSUFBSSxhQUEwQixDQUFDO1lBRS9CLFNBQVM7aUJBQ1IsT0FBTyxFQUFFO2lCQUNQLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQ3JCLEdBQUcsQ0FBQyxZQUFZO29CQUNoQixHQUFHLENBQUMsWUFBWTt5QkFDWCxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRGLGVBQWUsR0FBRyxtQkFBbUIsQ0FDbkMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQW1CLEVBQUUsOEVBQThFO2dCQUMzSSxhQUFhLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFDekIsR0FBRyxDQUFDLEtBQUssRUFDVCxHQUFHLENBQUMsWUFBWSxFQUNoQixjQUFjLENBQUMsU0FBUyxDQUM3QixDQUFDO2dCQUNGLGFBQWEsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFBLDJEQUEyRDtnQkFFOUYsYUFBYSxDQUFDLGdCQUFnQixDQUM1QixPQUFPLEVBQ1AsR0FBRyxFQUFFO29CQUNILFlBQVk7eUJBQ1QsZ0JBQWdCLENBQUMsb0NBQW9DLENBQUM7eUJBQ3RELE9BQU8sQ0FDTixDQUFDLFFBQXdCLEVBQUUsRUFBRTt3QkFDM0IsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDOUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsZ0JBQWdCO3FCQUNiLGdCQUFnQixDQUFDLGNBQWMsQ0FBQztxQkFDaEMsT0FBTyxDQUFDLENBQUMsUUFBcUIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBRTlFLElBQUksWUFBWSxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2hELHNDQUFzQztvQkFDdEMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzt5QkFDckQsTUFBTSxDQUFDLENBQUMsR0FBZ0IsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO3lCQUNwSCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBLHFFQUFxRTtvQkFDckcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQzt5QkFDaEQsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7eUJBQzlCLE1BQU0sQ0FBQyxDQUFDLEdBQWdCLEVBQUUsRUFBRSxDQUFBLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQzt5QkFDbkgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQSwrQkFBK0I7aUJBQ2hFO2dCQUVLLDZGQUE2RjtnQkFDN0csSUFBSSxNQUFNLEdBQUcsTUFBTSx3QkFBd0IsQ0FDekMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUV2RSxNQUFNO3FCQUNDLE9BQU8sRUFBRTtxQkFDVCxPQUFPLENBQ04sQ0FBQyxLQUFxQixFQUFFLEVBQUU7b0JBQ3hCLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLGtCQUFrQixDQUFDO29CQUN6QyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7b0JBQzlCLFlBQVk7eUJBQ1QsYUFBYSxDQUFDLGNBQWMsQ0FBQzt5QkFDN0IsUUFBUSxDQUFDLENBQUMsQ0FBQzt5QkFDWCxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQy9DLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQSx3SUFBd0k7Z0JBQ2hMLENBQUMsQ0FBQyxDQUFDO1lBRVAsQ0FBQyxDQUNKLENBQUE7WUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDL0IsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQSxxQ0FBcUM7WUFDdEQsSUFBSSxDQUFDLEdBQUMsQ0FBQztnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BGLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFHTCwyQkFBMkI7UUFDM0IsaUJBQWlCLENBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFxQixDQUN2RSxDQUFDO1FBRUYsaUJBQWlCLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFBLHlDQUF5QztJQUU5SSxDQUFDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxlQUFlLEdBQVcsSUFBSSxNQUFNLENBQUM7SUFDekMsS0FBSyxFQUFFLGlCQUFpQjtJQUN4QixLQUFLLEVBQUU7UUFDTCxlQUFlLEVBQUUsZUFBZTtRQUNoQyxlQUFlLEVBQUUsb0JBQW9CO1FBQ3JDLGFBQWEsRUFBRSxlQUFlO0tBQy9CO0lBQ0QsU0FBUyxFQUFFLE9BQU87SUFDbEIsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLENBQUM7Q0FDNUUsQ0FBQyxDQUFDO0FBRUgsTUFBTSxjQUFjLEdBQVcsSUFBSSxNQUFNLENBQUM7SUFDeEMsS0FBSyxFQUFFLGdCQUFnQjtJQUN2QixRQUFRLEVBQUU7UUFDUixJQUFJLE1BQU0sQ0FBQztZQUNULEtBQUssRUFBRSxtQkFBbUI7WUFDMUIsS0FBSyxFQUFFO2dCQUNMLGVBQWUsRUFBRSxRQUFRO2dCQUN6QixlQUFlLEVBQUUsc0JBQXNCO2dCQUN2QyxhQUFhLEVBQUUsaUJBQWlCO2FBQ2pDO1lBQ0QsV0FBVyxFQUFFLElBQUk7WUFDakIsZUFBZSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxZQUFZLEVBQUUsY0FBYyxDQUFDLFdBQVc7WUFDeEMsU0FBUyxFQUFFLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztZQUNqQyxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUNaLFdBQVcsRUFBRSxDQUFDLENBQUMsa0NBQWtDO1lBQ25ELENBQUM7U0FDRixDQUFDO1FBQ0YsSUFBSSxNQUFNLENBQUM7WUFDVCxLQUFLLEVBQUUsdUJBQXVCO1lBQzlCLEtBQUssRUFBRTtnQkFDTCxlQUFlLEVBQUUsYUFBYTtnQkFDOUIsZUFBZSxFQUFFLFlBQVk7YUFDOUI7WUFDRCxXQUFXLEVBQUUsSUFBSTtZQUNqQixlQUFlLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBQ3BDLFlBQVksRUFBRSxjQUFjLENBQUMsZUFBZTtZQUM1QyxTQUFTLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO1lBQ2pDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0JBQ1osV0FBVyxFQUFFLENBQUMsQ0FBQyxrQ0FBa0M7WUFDbkQsQ0FBQztTQUNGLENBQUM7UUFDRixJQUFJLE1BQU0sQ0FBQztZQUNULEtBQUssRUFBRSxtQkFBbUI7WUFDMUIsS0FBSyxFQUFFO2dCQUNMLGVBQWUsRUFBRSxXQUFXO2dCQUM1QixlQUFlLEVBQUUsUUFBUTthQUMxQjtZQUNELFdBQVcsRUFBRSxJQUFJO1lBQ2pCLGVBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDaEMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxXQUFXO1lBQ3hDLFNBQVMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUM7WUFDakMsT0FBTyxFQUFFLEdBQUcsRUFBRTtnQkFDWixXQUFXLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQztZQUNuRCxDQUFDO1NBQ0YsQ0FBQztRQUNGLElBQUksTUFBTSxDQUFDO1lBQ1QsS0FBSyxFQUFFLHVCQUF1QjtZQUM5QixLQUFLLEVBQUU7Z0JBQ0wsZUFBZSxFQUFFLFVBQVU7Z0JBQzNCLGVBQWUsRUFBRSxZQUFZO2FBQzlCO1lBQ0QsV0FBVyxFQUFFLElBQUk7WUFDakIsWUFBWSxFQUFFLGNBQWMsQ0FBQyxlQUFlO1lBQzVDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7WUFDdkIsT0FBTyxFQUFFO2dCQUNQLGlFQUFpRTtnQkFDakUsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDO2dCQUM5RCxXQUFXLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQztZQUNyRCxDQUFDO1NBQ0YsQ0FBQztRQUNGLElBQUksTUFBTSxDQUFDO1lBQ1QsS0FBSyxFQUFFLHVCQUF1QjtZQUM5QixLQUFLLEVBQUU7Z0JBQ0wsZUFBZSxFQUFFLGNBQWM7Z0JBQy9CLGVBQWUsRUFBRSxZQUFZO2dCQUM3QixhQUFhLEVBQUUsUUFBUTthQUN4QjtZQUNELFdBQVcsRUFBRSxJQUFJO1lBQ2pCLGVBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsT0FBTyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO1lBQzVFLFlBQVksRUFBRSxjQUFjLENBQUMsZUFBZTtZQUM1QyxTQUFTLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO1lBQ2pDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0JBQ1osV0FBVyxFQUFFLENBQUMsQ0FBQyxrQ0FBa0M7WUFDbkQsQ0FBQztTQUNGLENBQUM7S0FBQztJQUNMLEtBQUssRUFBRTtRQUNMLGVBQWUsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLGtCQUFrQjtRQUNwRSxhQUFhLEVBQUUsZ0JBQWdCO0tBQ2hDO0lBQ0ssT0FBTyxFQUFFLENBQUMsT0FBa0MsRUFBQyxpQkFBaUIsRUFBQyxLQUFLLEVBQUMsRUFBRSxFQUFFO1FBQ3pFLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDakIseUVBQXlFO1lBQ3pFLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEMsR0FBRyxDQUFDLFNBQVMsR0FBRyx3RkFBd0YsQ0FBQTtZQUN4RyxZQUFZLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLE9BQU07U0FDbkI7UUFDUCwrQ0FBK0M7UUFDekMsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUM7WUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBRXJJLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsR0FBRyxDQUFDO1lBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUMzSSxJQUFJLElBQUksQ0FBQyxpQkFBaUI7WUFBRSxPQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUM7UUFDakUsSUFDRSxNQUFNLEtBQUssT0FBTyxDQUFDLFNBQVM7WUFDNUIsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7WUFDdkIsa0JBQWtCLEtBQUssWUFBWSxDQUFDLFlBQVksRUFDaEQ7WUFDQSx3REFBd0Q7WUFDeEQsSUFDRSxjQUFjLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNyRTtnQkFDQSxtRkFBbUY7Z0JBQ25GLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUM1QixjQUFjLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxFQUNoRSxDQUFDLENBQ0YsQ0FBQzthQUNIO1lBQ0Qsa0tBQWtLO1lBQ2xLLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDM0Isc0JBQXNCO2dCQUN0QixJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ3JFLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7aUJBQzVEO2dCQUNELDhFQUE4RTtnQkFDOUUsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUNoRSxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDNUIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsRUFDdkQsQ0FBQyxDQUNGLENBQUM7aUJBQ0g7YUFDRjtpQkFBTSxJQUNMLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO2dCQUN4QixrQkFBa0IsSUFBSSxZQUFZLENBQUMsWUFBWSxFQUMvQztnQkFDQSxzRkFBc0Y7Z0JBQ3RGLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDbEUsd0ZBQXdGO29CQUN4RixjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2lCQUN0RDthQUNGO1NBQ0Y7SUFDSCxDQUFDO0NBQ0YsQ0FBQyxDQUFDO0FBSUgsTUFBTSwrQkFBK0IsR0FBVyxJQUFJLE1BQU0sQ0FBQztJQUN6RCxLQUFLLEVBQUUsaUNBQWlDO0lBQ3hDLEtBQUssRUFBRTtRQUNMLGVBQWUsRUFBRSxZQUFZO1FBQzdCLGVBQWUsRUFBRSxrQkFBa0I7UUFDbkMsYUFBYSxFQUFFLGdCQUFnQjtLQUNoQztJQUNELFdBQVcsRUFBRSxJQUFJO0lBQ2pCLGVBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsT0FBTyxFQUFFLE1BQU0sQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDO0lBQ2xGLFlBQVksRUFBRSxjQUFjLENBQUMsa0JBQWtCO0lBQy9DLFNBQVMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUM7SUFDakMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNaLElBQUksS0FBSyxHQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLG9ZQUFvWTtRQUVwYzs7O2FBR0s7UUFFSixJQUFJLElBQUksR0FBVyw4QkFBOEIsQ0FDL0MsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzlDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQzthQUNULFVBQVUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQ3BCLEtBQUssQ0FDTixDQUFDO1FBQ0YsaUVBQWlFO1FBQ2pFLCtCQUErQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDNUYsK0JBQStCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQztRQUM3RixXQUFXLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQztJQUNuRCxDQUFDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSw0QkFBNEIsR0FBVyxJQUFJLE1BQU0sQ0FBQztJQUN0RCxLQUFLLEVBQUUsOEJBQThCO0lBQ3JDLEtBQUssRUFBRTtRQUNMLGVBQWUsRUFBRSxZQUFZO1FBQzdCLGVBQWUsRUFBRSxlQUFlO1FBQ2hDLGFBQWEsRUFBRSxhQUFhO0tBQzdCO0lBQ0QsV0FBVyxFQUFFLElBQUk7SUFDakIsZUFBZSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxPQUFPLEVBQUUsTUFBTSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7SUFDNUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxlQUFlO0lBQzVDLFNBQVMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUM7SUFDakMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNaLFdBQVcsRUFBRSxDQUFDLENBQUMsa0NBQWtDO0lBQ25ELENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLHNCQUFzQixHQUFXLElBQUksTUFBTSxDQUFDO0lBQ2hELEtBQUssRUFBRSx3QkFBd0I7SUFDL0IsS0FBSyxFQUFFO1FBQ0wsZUFBZSxFQUFFLGNBQWM7UUFDL0IsZUFBZSxFQUFFLGtCQUFrQjtRQUNuQyxhQUFhLEVBQUUsY0FBYztLQUM5QjtJQUNELFdBQVcsRUFBRSxJQUFJO0lBQ2pCLGVBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsT0FBTyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO0lBQzlFLFlBQVksRUFBRSxjQUFjLENBQUMsZ0JBQWdCO0lBQzdDLFNBQVMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUM7SUFDakMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNaLFdBQVcsRUFBRSxDQUFDLENBQUMsa0NBQWtDO0lBQ25ELENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLHlCQUF5QixHQUFXLElBQUksTUFBTSxDQUFDO0lBQ25ELEtBQUssRUFBRSwyQkFBMkI7SUFDbEMsS0FBSyxFQUFFO1FBQ0wsZUFBZSxFQUFFLFlBQVk7UUFDN0IsZUFBZSxFQUFFLGtCQUFrQjtLQUNwQztJQUNELFdBQVcsRUFBRSxJQUFJO0lBQ2pCLFNBQVMsRUFBRSxjQUFjO0lBQ3pCLGVBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7SUFDeEMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxtQkFBbUI7SUFDaEQsU0FBUyxFQUFFLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztJQUNqQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ1osV0FBVyxFQUFFLENBQUMsQ0FBQyxrQ0FBa0M7SUFDbkQsQ0FBQztDQUNGLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFXLElBQUksTUFBTSxDQUFDO0lBQ2xDLEtBQUssRUFBRSxnQkFBZ0I7SUFDdkIsS0FBSyxFQUFFLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUM7SUFDOUYsV0FBVyxFQUFDLElBQUksZ0JBQWdCLEVBQUU7SUFDbEMsV0FBVyxFQUFFLElBQUk7SUFDakIsU0FBUyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztJQUNoQyxRQUFRLEVBQUMsRUFBRTtJQUNqQixPQUFPLEVBQUUsQ0FBQyxPQUF1RCxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUMsRUFBRSxFQUFFO1FBQ2xGLElBQ0csS0FBSyxHQUNILE1BQU0sQ0FBQyxZQUFZLEdBQUcsNENBQTRDLEVBQ3BFLFVBQVUsR0FDUixNQUFNLENBQUMsWUFBWSxHQUFHLDJEQUEyRCxFQUNuRixTQUFTLEdBQ1AsTUFBTSxDQUFDLFdBQVcsR0FBRyxrQ0FBa0MsRUFDekQsdUJBQXVCLEdBQ3JCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsZ0RBQWdELEVBQ3hFLFVBQVUsR0FDUixNQUFNLENBQUMsWUFBWSxHQUFHLHlDQUF5QyxFQUNqRSxLQUFLLEdBQ0gsTUFBTSxDQUFDLFlBQVksR0FBRyx5QkFBeUIsRUFDakQsZ0JBQWdCLEdBQ2QsTUFBTSxDQUFDLFlBQVksR0FBRyxpREFBaUQsRUFDekUsS0FBSyxHQUNILE1BQU0sQ0FBQyxZQUFZLEdBQUcsOEJBQThCLEVBQ3RELFVBQVUsR0FDVixNQUFNLENBQUMsV0FBVyxHQUFHLGlDQUFpQyxFQUN0RCxTQUFTLEdBQWE7WUFDcEIsTUFBTSxDQUFDLFlBQVksR0FBRywwQ0FBMEM7WUFDaEUsTUFBTSxDQUFDLFlBQVksR0FBRywwQ0FBMEM7WUFDaEUsTUFBTSxDQUFDLFlBQVksR0FBRywwQ0FBMEM7WUFDaEUsTUFBTSxDQUFDLFlBQVksR0FBRywwQ0FBMEM7WUFDaEUsTUFBTSxDQUFDLFdBQVcsR0FBRyx1Q0FBdUM7U0FDN0QsRUFDRCxVQUFVLEdBQUc7WUFDWCxNQUFNLENBQUMsV0FBVyxHQUFHLHVDQUF1QztZQUM1RCxNQUFNLENBQUMsV0FBVyxHQUFHLHVDQUF1QztZQUM1RCxNQUFNLENBQUMsV0FBVyxHQUFHLHVDQUF1QztZQUM1RCxNQUFNLENBQUMsV0FBVyxHQUFHLHdDQUF3QztTQUM5RCxDQUFDO1FBRUosY0FBYyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDN0IsSUFBSSxhQUFhLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUV2QyxTQUFTLGdCQUFnQjtZQUN2QixJQUFJLGFBQWEsR0FDakI7Z0JBQ0csR0FBRyxrQkFBa0I7cUJBQ2xCLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUNaLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxVQUFVO3VCQUM1QyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSzt1QkFDcEMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLGdCQUFnQjt1QkFDL0MsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVU7dUJBQ3pDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLO3VCQUNwQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssdUJBQXVCO3VCQUN4RCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxHQUFHLHFEQUFxRCxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt1QkFDeEgsSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLHFDQUFxQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM5RjthQUFDLENBQUM7WUFFRixhQUFhLENBQUMsSUFBSSxDQUNoQixHQUFHLHVCQUF1QjtpQkFDdkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQ1osVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBLGtCQUFrQjttQkFDM0UsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVM7bUJBQ3RDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxVQUFVLENBQzdDLENBQUMsQ0FBQztZQUNQLE9BQU8sYUFBYSxDQUFBO1FBQ3BCLENBQUM7UUFBQSxDQUFDO1FBRUYsQ0FBQyxTQUFTLDRCQUE0QjtZQUNsQyxJQUFJLEdBQWUsQ0FBQztZQUVwQixLQUFLLElBQUksSUFBSSxJQUFJLFdBQVcsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO29CQUFFLFNBQVM7Z0JBQzdDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLEdBQUcsR0FBRztvQkFDSixLQUFLLEVBQUUsUUFBUTtvQkFDZixLQUFLLEVBQUU7d0JBQ0wsZUFBZSxFQUFFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDL0UsZUFBZSxFQUFFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtxQkFDaEY7b0JBQ0QsWUFBWSxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BDLGVBQWUsRUFBRSxFQUFFO29CQUNuQixTQUFTLEVBQUUsY0FBYyxDQUFDLFNBQVM7b0JBQ25DLFdBQVcsRUFBRSxJQUFJO2lCQUNsQixDQUFDO2dCQUNGLElBQUksVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQyw2Q0FBNkM7Z0JBQzdDLFVBQVUsQ0FBQyxPQUFPO29CQUNoQixDQUFDLElBQXNELEVBQUUsWUFBb0IsVUFBVSxFQUFFLEVBQUU7d0JBRTNGLENBQUMsU0FBUyx1QkFBdUI7NEJBQy9CLFNBQVMsQ0FBQyxlQUFlO2dDQUN2QixTQUFTLENBQUMsWUFBWTtxQ0FDbkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyw4Q0FBOEM7NEJBQzNGLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFBLHFGQUFxRjs0QkFFNUksSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFO2dDQUN2QixnR0FBZ0c7Z0NBQ2hHLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsd0NBQXdDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsQ0FBQTs2QkFDcko7NEJBQUEsQ0FBQzt3QkFDSixDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUVMLENBQUMsU0FBUyxnQkFBZ0I7NEJBQ3hCLFNBQVMsQ0FBQyxlQUFlO2lDQUN0QixNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lDQUMzQyxPQUFPLENBQ04sUUFBUSxDQUFDLEVBQUU7Z0NBQ1gsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzt1Q0FDN0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFDbkM7b0NBQ0ksU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQTtpQ0FDakc7cUNBQU0sSUFDUCxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGVBQWU7dUNBQzNDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsWUFBWTt1Q0FDM0MsQ0FDRCxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzsyQ0FDM0IsU0FBUyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0M7a0NBQ3hJO29DQUNHLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7aUNBQzlGOzRCQUNELENBQUMsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBRUwsQ0FBQyxTQUFTLHdCQUF3Qjs0QkFDaEMsU0FBUyxDQUFDLGVBQWU7aUNBQ3RCLE1BQU0sQ0FDTCxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO21DQUMzQixLQUFLLENBQUMsUUFBUSxDQUFDLCtCQUErQixDQUFDLENBQ3JEO2lDQUNBLE9BQU8sQ0FDTixRQUFRLENBQUMsRUFBRTtnQ0FDVCxJQUNFLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO3VDQUN4QixTQUFTLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLFNBQVMsRUFBRSwwQkFBMEI7aUNBQ3hIO29DQUNFLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7aUNBQ2hHO3FDQUFNLElBQ0wsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7dUNBQ3ZCLFNBQVMsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksVUFBVSxFQUFFO29DQUM3RixTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFBO2lDQUNqRztnQ0FBQSxDQUFDOzRCQUNKLENBQUMsQ0FBQyxDQUFDO3dCQUNMLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBRVQsQ0FBQyxTQUFTLGlCQUFpQjs0QkFDekIsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLENBQUMsQ0FBQzs0QkFDOUMsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFO2dDQUN2QixTQUFTLENBQUMsWUFBWTtxQ0FDbkIsSUFBSSxDQUNILEdBQUcsVUFBVTtxQ0FDVixHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDWCx1QkFBdUI7cUNBQ3BCLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxDQUFDOzZCQUNMOzRCQUFBLENBQUM7d0JBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDVCxDQUFDLENBQUM7Z0JBQ0YsY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDNUM7WUFBQSxDQUFDO1FBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVMLENBQUMsU0FBUyw2QkFBNkI7WUFDckMsSUFBRyxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTTtZQUNoRCxjQUFjLENBQUMsUUFBUTtpQkFDcEIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNsQixRQUFRLENBQUMsWUFBWTtxQkFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNiLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTs0QkFDbkUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDdkI7b0JBQ0wsQ0FBQyxDQUFDLENBQUE7Z0JBQ0osQ0FBQyxDQUFDLENBQUE7WUFDTixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFTCxJQUFJLElBQUksQ0FBQyxpQkFBaUI7WUFBRSxPQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsK05BQStOO1lBQy9OLElBQUksS0FBSyxHQUFHLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLHNDQUFzQztZQUN2SSxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUNoQywrRUFBK0U7Z0JBQy9FLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztvQkFDdEQsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUV0RTtpQkFBTSxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsZUFBZTttQkFDeEMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7bUJBQ3hCLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO21CQUN4QixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUN4QywyRkFBMkY7Z0JBQzNGLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBLHdCQUF3QjthQUN2QztZQUNELE9BQU8sS0FBSyxDQUFBO1NBQ2I7UUFBQSxDQUFDO1FBS0YsV0FBVyxFQUFFLENBQUM7UUFDZCxPQUFPLGNBQWMsQ0FBQyxlQUFlLENBQUM7SUFDdEMsQ0FBQztDQUNBLENBQ0osQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxTQUFTLGdCQUFnQixDQUFDLFFBQWdCO0lBQ3hDLDBGQUEwRjtJQUMxRixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcscUJBQXFCLENBQUMsRUFDdEMsSUFBWSxDQUFDO0lBRWYsSUFBSSxLQUFLLEdBQVcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQ3ZELE1BQU0sR0FBVyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUUxRCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyx3Q0FBd0M7SUFFM0cseUZBQXlGO0lBQ3pGLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3RSxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0Usd0NBQXdDO0lBQ3hDLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUN2QyxrTEFBa0w7UUFDbEwsSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7S0FDekI7U0FBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFO1dBQ2hDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzdDLHVMQUF1TDtRQUN2TCxJQUFJLEdBQUcsWUFBWSxDQUFDLDRCQUE0QixDQUFDO1FBQ2pELE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDdkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQztLQUN6QjtTQUFNLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxVQUFVLEVBQUU7UUFDeEMsbUdBQW1HO1FBQ25HLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUM3QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDL0Q7YUFBTTtZQUNMLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztTQUNsRTtRQUNELElBQUksR0FBRyxNQUFNLENBQUM7UUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7S0FDekI7U0FBTSxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ25DLG1JQUFtSTtRQUNuSSxJQUFJLEdBQUcsTUFBTSxDQUFDO1FBQ2QsSUFDRSxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsRUFDekU7WUFDQSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDMUQ7YUFBTTtZQUNMLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztTQUMxRDtRQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDekIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQztLQUN6QjtTQUFNLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDdkMscUNBQXFDO1FBQ3JDLElBQUksa0JBQWtCLEtBQUssWUFBWSxDQUFDLG9CQUFvQixFQUFFO1lBQzVELElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDN0IsMkNBQTJDO2dCQUMzQyxJQUFJLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQztnQkFDcEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQzthQUNyQztpQkFBTTtnQkFDTCx1QkFBdUI7Z0JBQ3ZCLElBQUksR0FBRyxZQUFZLENBQUMsb0JBQW9CLENBQUM7YUFDMUM7WUFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDO1NBQ3pCO2FBQ0ksSUFBSSxrQkFBa0IsS0FBSyxZQUFZLENBQUMsZUFBZSxFQUFFO1lBQzVELElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDN0IsdUJBQXVCO2dCQUN2QixJQUFJLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQzthQUNyQztpQkFBTTtnQkFDTCwwQ0FBMEM7Z0JBQzFDLElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO2dCQUMvQixPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDaEU7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7U0FDekI7YUFBTTtZQUNMLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1lBQ3pCLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO21CQUNuQixTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztnQkFDM0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQ3hDLEtBQUssRUFDTCxPQUFPLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FDakMsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FDeEMsS0FBSyxFQUNMLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUM5QixDQUFDLENBQUM7U0FDUjtRQUNHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDekIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQztLQUM3QjtTQUFNLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDdkMsSUFBSSxHQUFHLE1BQU0sQ0FBQztRQUNkLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUN2QyxLQUFLLEVBQ0wsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FDNUMsQ0FBQztRQUNGLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDekIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQztLQUN6QjtTQUFNLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxlQUFlLEVBQUU7UUFDN0MsSUFBSSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7UUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztRQUN2QixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDO0tBQ3pCO1NBQU0sSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLFFBQVEsRUFBRTtRQUN0QyxJQUFJLEdBQUcsTUFBTSxDQUFDO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztRQUN2QixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDO0tBQ3pCO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQUVELElBQUksb0JBQW9CLEdBQWMsRUFBRSxDQUFDO0FBQ3pDLElBQUksSUFBSSxHQUFhO0lBQ25CLGNBQWM7SUFDZCxpQkFBaUI7SUFDakIsY0FBYztJQUNkLGNBQWM7SUFDZCxnQkFBZ0I7Q0FDakIsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILEtBQUssVUFBVSxxQkFBcUIsQ0FDbEMsSUFBYyxFQUNkLFFBQTBELEVBQzFELGVBQXNCO0lBRWhCLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUFFLE9BQU87SUFFL0IsSUFBSSxVQUFVLEdBQWEsRUFBRSxDQUFDO0lBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNmLCtKQUErSjtRQUMvSixJQUFJLE1BQU0sR0FBVyxJQUFJLE1BQU0sQ0FBQztZQUM5QixLQUFLLEVBQUUsTUFBTSxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU07WUFDOUQsS0FBSyxFQUFFO2dCQUNMLGVBQWUsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWU7Z0JBQzFDLGVBQWUsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWU7YUFDM0M7WUFDRCxRQUFRLEVBQUUsY0FBYztZQUN4QixPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUNaLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsaUdBQWlHO2dCQUVqSSxtRkFBbUY7Z0JBQ25GLElBQUksWUFBWSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsZUFBZSxDQUFDO29CQUFFLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzNGLENBQUM7U0FDRixDQUFDLENBQUM7UUFDSCxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsd0JBQXdCLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBQ0Q7O0dBRUc7QUFDSCxLQUFLLFVBQVUsV0FBVztJQUN4Qiw4RUFBOEU7SUFDOUUsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLGdCQUFnQixDQUFDLE9BQWlCO0lBQ3pDLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUM3Qix1Q0FBdUM7UUFDdkMsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsMERBQTBEO1FBQ2xIOzswS0FFa0s7UUFFbEssSUFBSSxZQUFZLEdBQUcsOEJBQThCLENBQzdDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUMvQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNkLElBQUksQ0FBQyxHQUFHLENBQUM7YUFDVCxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUNyQixDQUFDLENBQUMsNkpBQTZKO1FBQ2hLLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLENBQUMsNEJBQTRCO1FBQ2hFLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO1NBQU07UUFDTCxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLGtCQUFrQixDQUFDO1FBQ3hDLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSw0QkFBNEIsQ0FDekMsT0FBZSxFQUNmLG1CQUFpQyxFQUNqQyxTQUFtQixFQUNuQixTQUEwQyxFQUMxQyxvQkFBa0M7SUFFbEMsSUFBSSxDQUFDLFNBQVM7UUFBRSxTQUFTLEdBQUcsWUFBWSxDQUFDO0lBRXpDLElBQUksQ0FBQyxvQkFBb0I7UUFBRSxvQkFBb0I7WUFDN0Msd0JBQXdCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxZQUFZLEdBQUcsZ0RBQWdELEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUdsSSxrREFBa0Q7SUFDbEQsQ0FBQyxTQUFTLGtCQUFrQjtRQUMxQixJQUFJLG9CQUFvQixHQUFHO1lBQ3pCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsMENBQTBDO1lBQ2hFLE1BQU0sQ0FBQyxZQUFZLEdBQUcscUNBQXFDO1lBQzNELE1BQU0sQ0FBQyxZQUFZLEdBQUcsMENBQTBDO1lBQ2hFLE1BQU0sQ0FBQyxZQUFZLEdBQUcsMENBQTBDO1lBQ2hFLE1BQU0sQ0FBQyxZQUFZLEdBQUcsZ0RBQWdEO1lBQ3RFLE1BQU0sQ0FBQyxZQUFZLEdBQUcscUNBQXFDO1lBQzNELE1BQU0sQ0FBQyxZQUFZLEdBQUcsMENBQTBDO1lBQ2hFLE1BQU0sQ0FBQyxZQUFZLEdBQUcsZ0RBQWdEO1NBQ3ZFLENBQUMsQ0FBQSxrRUFBa0U7UUFFcEUsSUFBSSxhQUFhLEdBQWlCLEVBQUUsQ0FBQztRQUNyQyxvQkFBb0IsQ0FBQyxPQUFPLENBQzFCLENBQUMsS0FBYSxFQUFFLEVBQUU7WUFDaEIsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQzdDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQ3JDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FDRixDQUFDO1FBRUYsc0NBQXNDLENBQ3BDLGFBQWEsRUFDYixnQkFBZ0IsRUFDaEI7WUFDRSxhQUFhLEVBQUUsYUFBYTtZQUM1QixFQUFFLEVBQUUsb0JBQW9CO1NBQ3pCLENBQ0YsQ0FBQztJQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTCxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssRUFBRTtRQUN4RSxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztRQUNyRSxPQUFPO0tBQ1IsQ0FBQyw4SEFBOEg7SUFFaEksSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLFlBQVksR0FBRywyQ0FBMkMsQ0FBQztJQUd2RixJQUFJLGtCQUFrQixHQUNwQix3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsY0FBYyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFFdkUsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBRTlHLElBQUksU0FBUyxHQUFhLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsNkZBQTZGO0lBRWxKLHlKQUF5SjtJQUN6SixJQUFJLE1BQU0sR0FBaUIsbUJBQW1CLENBQUMsTUFBTSxDQUNuRCxDQUFDLEtBQUssRUFBRSxFQUFFLENBQ1IsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyx5QkFBeUI7V0FDdkYsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQywyQkFBMkI7S0FDbEcsQ0FBQyxDQUFDLHdRQUF3UTtJQUUzUSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUUsa0ZBQWtGO0lBRXJKLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFnQixFQUFFLEVBQUU7UUFDbEMsSUFBSSxFQUFlLENBQUMsQ0FBQyx5RUFBeUU7UUFDOUYsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3BELG9FQUFvRTtZQUNwRSxFQUFFLEdBQUcsb0JBQW9CLENBQUM7U0FDM0I7YUFBTSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDMUQsRUFBRSxHQUFHLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQztTQUN0RDtRQUNELElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTztRQUNoQixzQ0FBc0MsQ0FDcEMsQ0FBQyxLQUFLLENBQUMsRUFDUCxTQUFTLEVBQ1Q7WUFDRSxhQUFhLEVBQUUsYUFBYTtZQUM1QixFQUFFLEVBQUUsRUFBRTtTQUNQLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQyxDQUFDO0lBRUQsb0NBQW9DO0lBQ3BDLENBQUMsU0FBUyxtQkFBbUI7UUFDM0IsSUFBSSxVQUFVLEdBQWlCLDBCQUEwQixDQUFDLE1BQU0sQ0FDOUQsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUN4SCxDQUFDLENBQUMsb05BQW9OO1FBQ3ZOLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBRyxDQUFDO1lBQUUsVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQ3pELENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQU0sTUFBTSxDQUFDLFlBQVksR0FBRyx1Q0FBdUMsQ0FDakcsQ0FBQyxDQUFBLG1GQUFtRjtRQUVyRixzQ0FBc0MsQ0FDcEMsVUFBVSxFQUNWLGdCQUFnQixFQUNoQjtZQUNFLGFBQWEsRUFBRSxhQUFhO1lBQzVCLEVBQUUsRUFBRSxvQkFBb0I7U0FDekIsQ0FDRixDQUFDO1FBRUMsdURBQXVEO1FBQ3BELG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3RDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDUCxtQ0FBbUM7SUFDbkMsQ0FBQyxTQUFTLG1CQUFtQjtRQUMzQixJQUFJLFlBQVksR0FBRyx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFlBQVksR0FBRyxxQ0FBcUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsOEVBQThFO1FBRXBOLElBQUksU0FBUyxHQUFpQiwwQkFBMEIsQ0FBQyxNQUFNLENBQzdELENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FDeEgsQ0FBQyxDQUFDLG9OQUFvTjtRQUV2TixJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsWUFBWTtZQUFFLE9BQU87UUFFeEMsc0NBQXNDLENBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUNoRTtZQUNBLGFBQWEsRUFBRSxhQUFhO1lBQzVCLEVBQUUsRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxrQkFBaUM7U0FDNUUsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUVQLENBQUM7QUFHRDs7Ozs7OztHQU9HO0FBQ0gsU0FBUywrQkFBK0IsQ0FBQyxHQUFXLEVBQUUsTUFBa0IsRUFBRSxLQUFrQixFQUFFLFdBQWtCLEVBQUUsWUFBeUI7SUFDekksSUFBSSxRQUFRLEdBQW9CLElBQUksR0FBRyxFQUFFLENBQUM7SUFFMUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBQ3ZELGtCQUFrQixDQUFDLFlBQVksQ0FBQyw0QkFBNEIsRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQSxxR0FBcUc7SUFDN0wseUNBQXlDO0lBRXpDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxtRkFBbUY7SUFFM0ksa0JBQWtCLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLDBFQUEwRTtJQUc5SCxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLGlFQUFpRTtJQUVsSSxTQUFTLGtCQUFrQixDQUFDLElBQVksRUFBRSxZQUF5QixFQUFFLFFBQXdCO1FBQzNGLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDdkIsSUFBSSx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQSxDQUFDO0lBQ0YsK0JBQStCLENBQzdCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQ3BCLEdBQUcsRUFDSCxLQUFLLEVBQ0wsV0FBVyxFQUNYLFNBQVMsRUFDVCxNQUFNLENBQ1AsQ0FBQztBQUNKLENBQUM7QUFDRDs7Ozs7R0FLRztBQUNILFNBQVMsd0JBQXdCLENBQUMsR0FBVyxFQUFFLGFBQWE7SUFDMUQsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ3RDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNwRCxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFDRDs7Ozs7R0FLRztBQUNILFNBQVMseUJBQXlCLENBQ2hDLFVBQWtCLEVBQ2xCLFdBQW1CLFVBQVU7SUFFN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDOUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkQsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxJQUNFLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDZixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU8sS0FBSyxDQUFBO1lBQ3ZCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkI7UUFBQSxDQUFDO1FBQ0osSUFBSSxJQUFJLEtBQUssUUFBUTtZQUFFLE9BQU8sSUFBSSxDQUFDOztZQUM5QixPQUFPLEtBQUssQ0FBQTtJQUNqQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ2pCLE9BQU8sSUFBSSxDQUFDOztRQUNULE9BQU8sS0FBSyxDQUFBO0FBQ25CLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxLQUFLLFVBQVUsa0RBQWtELENBQUMsU0FBd0M7SUFDeEcsSUFBSSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQXFCLENBQUM7SUFDM0UsSUFBSSxVQUFVLEtBQUssWUFBWSxDQUFDLE9BQU8sRUFBRTtRQUN2Qyx5QkFBeUI7UUFDekIscUNBQXFDLENBQUM7WUFDcEMsUUFBUSxFQUFFLFlBQVksQ0FBQyxPQUFPO1lBQzlCLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztRQUNILG1DQUFtQyxDQUFDO1lBQ2xDLFFBQVEsRUFBRSxZQUFZLENBQUMsT0FBTztZQUM5QixTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7S0FDSjtTQUFNLElBQUksVUFBVSxLQUFLLFlBQVksQ0FBQyxLQUFLLEVBQUU7UUFDNUMseUJBQXlCO1FBQ3pCLHFDQUFxQyxDQUFDO1lBQ3BDLFFBQVEsRUFBRSxZQUFZLENBQUMsS0FBSztZQUM1QixTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7UUFDSCxtQ0FBbUMsQ0FBQztZQUNsQyxRQUFRLEVBQUUsWUFBWSxDQUFDLEtBQUs7WUFDNUIsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO0tBQ0o7U0FBTSxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ25DLHlCQUF5QjtRQUN6QixxQ0FBcUMsQ0FBQztZQUNwQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDdkIsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO1FBQ0gsbUNBQW1DLENBQUM7WUFDbEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxLQUFLO1lBQ3ZCLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztLQUNKO1NBQU0sSUFBSSxVQUFVLEtBQUssWUFBWSxDQUFDLGdCQUFnQixFQUFFO1FBQ3ZELHlCQUF5QjtRQUN6QixxQ0FBcUMsQ0FBQztZQUNwQyxRQUFRLEVBQUUsWUFBWSxDQUFDLGdCQUFnQjtZQUN2QyxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7UUFDSCxtQ0FBbUMsQ0FBQztZQUNsQyxRQUFRLEVBQUUsWUFBWSxDQUFDLGdCQUFnQjtZQUN2QyxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7S0FDSjtTQUFNLElBQUksVUFBVSxLQUFLLFlBQVksQ0FBQyxZQUFZLEVBQUU7UUFDbkQseUJBQXlCO1FBQ3pCLHFDQUFxQyxDQUFDO1lBQ3BDLFFBQVEsRUFBRSxZQUFZLENBQUMsWUFBWTtZQUNuQyxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7UUFDSCxtQ0FBbUMsQ0FBQztZQUNsQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFlBQVk7WUFDbkMsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO0tBQ0o7U0FBTSxJQUFJLFVBQVUsS0FBSyxZQUFZLENBQUMsZUFBZSxFQUFFO1FBQ3RELHlCQUF5QjtRQUN6QixxQ0FBcUMsQ0FBQztZQUNwQyxRQUFRLEVBQUUsWUFBWSxDQUFDLGVBQWU7WUFDdEMsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO1FBQ0gsbUNBQW1DLENBQUM7WUFDbEMsUUFBUSxFQUFFLFlBQVksQ0FBQyxlQUFlO1lBQ3RDLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztLQUNKO1NBQU0sSUFBSSxVQUFVLEtBQUssWUFBWSxDQUFDLE9BQU8sRUFBRTtRQUM5Qyx5QkFBeUI7UUFDekIscUNBQXFDLENBQUM7WUFDcEMsUUFBUSxFQUFFLFlBQVksQ0FBQyxPQUFPO1lBQzlCLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztRQUNILG1DQUFtQyxDQUFDO1lBQ2xDLFFBQVEsRUFBRSxZQUFZLENBQUMsT0FBTztZQUM5QixTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7S0FDSjtTQUFNLElBQUksVUFBVSxLQUFLLFlBQVksQ0FBQyxXQUFXLEVBQUU7UUFDbEQseUJBQXlCO1FBQ3pCLHFDQUFxQyxDQUFDO1lBQ3BDLFFBQVEsRUFBRSxZQUFZLENBQUMsV0FBVztZQUNsQyxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7UUFDSCxtQ0FBbUMsQ0FBQztZQUNsQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFdBQVc7WUFDbEMsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO0tBQ0o7U0FBTSxJQUFJLFVBQVUsS0FBSyxZQUFZLENBQUMsYUFBYSxFQUFFO1FBQ3BELHlCQUF5QjtRQUN6QixxQ0FBcUMsQ0FBQztZQUNwQyxRQUFRLEVBQUUsWUFBWSxDQUFDLGFBQWE7WUFDcEMsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO1FBQ0gsbUNBQW1DLENBQUM7WUFDbEMsUUFBUSxFQUFFLFlBQVksQ0FBQyxhQUFhO1lBQ3BDLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztLQUNKO1NBQU0sSUFBSSxVQUFVLEtBQUssWUFBWSxDQUFDLFlBQVksRUFBRTtRQUNuRCx5QkFBeUI7UUFDekIscUNBQXFDLENBQUM7WUFDcEMsUUFBUSxFQUFFLFlBQVksQ0FBQyxZQUFZO1lBQ25DLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztRQUNILG1DQUFtQyxDQUFDO1lBQ2xDLFFBQVEsRUFBRSxZQUFZLENBQUMsWUFBWTtZQUNuQyxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7S0FDSjtTQUFNLElBQUksa0JBQWtCLEtBQUssWUFBWSxDQUFDLGVBQWUsRUFBRTtRQUM5RCx5QkFBeUI7UUFDekIscUNBQXFDLENBQUM7WUFDcEMsUUFBUSxFQUFFLFlBQVksQ0FBQyxlQUFlO1lBQ3RDLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztRQUNILG1DQUFtQyxDQUFDO1lBQ2xDLFFBQVEsRUFBRSxZQUFZLENBQUMsZUFBZTtZQUN0QyxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7S0FDSjtTQUFNLElBQUksa0JBQWtCLEtBQUssWUFBWSxDQUFDLFVBQVUsRUFBRTtRQUN6RCx5Q0FBeUM7UUFDekMseUJBQXlCO1FBQ3pCLHFDQUFxQyxDQUFDO1lBQ3BDLFFBQVEsRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNqQyxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7UUFDSCxtQ0FBbUMsQ0FBQztZQUNsQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFVBQVU7WUFDakMsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO0tBQ0o7U0FBTSxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsU0FBUyxFQUFFO1FBQ3ZDLHlCQUF5QjtRQUN6QixxQ0FBcUMsQ0FBQztZQUNwQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFNBQVM7WUFDM0IsU0FBUyxFQUFFLFNBQVM7WUFDcEIsTUFBTSxFQUFFLElBQUk7U0FDYixDQUFDLENBQUM7UUFDSCxtQ0FBbUMsQ0FBQztZQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFNBQVM7WUFDM0IsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO0tBRUo7U0FBSyxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsZUFBZSxFQUFFO1FBQzVDLGlHQUFpRztRQUNqRyxJQUFJLElBQUksR0FBWSx5QkFBeUIsQ0FBQyxDQUFBLHVEQUF1RDtRQUNyRyxJQUFJLGtCQUFrQixLQUFLLFlBQVksQ0FBQyxTQUFTO2VBQzVDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtZQUFFLElBQUksR0FBRyx3QkFBd0IsQ0FBQSxDQUFBLGtEQUFrRDtRQUN6SixJQUFJLGtCQUFrQixLQUFLLFlBQVksQ0FBQyxVQUFVO1lBQUUsSUFBSSxHQUFHLHlCQUF5QixDQUFDLENBQUEsK0NBQStDO1FBQ3BJLHlCQUF5QjtRQUN6QixxQ0FBcUMsQ0FBQztZQUNwQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNwQixTQUFTLEVBQUMsU0FBUztTQUNwQixDQUFDLENBQUM7UUFDSCwwQkFBMEI7UUFDMUIsbUNBQW1DLENBQUM7WUFDbEMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDcEIsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO1FBQ0QsQ0FBQyxTQUFTLG1CQUFtQjtZQUMzQiwyR0FBMkc7WUFDM0csSUFDRSxjQUFjLEdBQUcsd0JBQXdCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxhQUFhLEdBQUcsMkNBQTJDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxpREFBaUQ7WUFFOUwsbUJBQW1CLEdBQUcsd0JBQXdCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxZQUFZLEdBQUcsY0FBYyxHQUFHLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEseUNBQXlDO1lBRWxLLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUN2RSwyQkFBMkI7WUFDakMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRTVCLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxDQUFDLFNBQVMscUJBQXFCO1lBQzdCLDBFQUEwRTtZQUMxRSxJQUFJLEtBQUssR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLFlBQVksR0FBRyw4Q0FBOEMsQ0FBQyxFQUN4SSxZQUFZLEdBQUcsd0JBQXdCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxhQUFhLEdBQUcsMkNBQTJDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBLDRGQUE0RjtZQUN0TyxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxFQUFFO2dCQUMzQixZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDMUI7WUFDRCxzQ0FBc0MsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLFNBQVMsRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBaUMsRUFBRSxDQUFDLENBQUM7UUFDbkssQ0FBQyxDQUFDLEVBQUUsQ0FBQztLQUNOO1NBQUssSUFBSSxVQUFVLEtBQUssWUFBWSxDQUFDLFlBQVksRUFBRTtRQUNsRCx5QkFBeUI7UUFDekIscUNBQXFDLENBQUM7WUFDcEMsUUFBUSxFQUFFLFlBQVksQ0FBQyxZQUFZO1lBQ25DLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztRQUNILG1DQUFtQyxDQUFDO1lBQ2xDLFFBQVEsRUFBRSxZQUFZLENBQUMsWUFBWTtZQUNuQyxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7S0FDSjtTQUFNLElBQUksVUFBVSxLQUFLLFlBQVksQ0FBQyxRQUFRLEVBQUU7UUFDL0MseUJBQXlCO1FBQ3pCLHFDQUFxQyxDQUFDO1lBQ3BDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUTtZQUMvQixTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7UUFDSCxtQ0FBbUMsQ0FBQztZQUNsQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFFBQVE7WUFDL0IsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO0tBQ0o7U0FBTSxJQUFJLFVBQVUsS0FBSyxZQUFZLENBQUMsNEJBQTRCO1dBQzlELENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQy9DLHlCQUF5QjtRQUN6QixxQ0FBcUMsQ0FBQztZQUNwQyxRQUFRLEVBQUUsWUFBWSxDQUFDLDRCQUE0QjtZQUNuRCxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7UUFDSCxtQ0FBbUMsQ0FBQztZQUNsQyxRQUFRLEVBQUUsWUFBWSxDQUFDLDRCQUE0QjtZQUNuRCxTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7S0FDSjtBQUNILENBQUM7QUFBQSxDQUFDO0FBR0Y7Ozs7Ozs7R0FPRztBQUNILEtBQUssVUFBVSxxQ0FBcUMsQ0FBQyxLQU1wRDtJQUNDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtRQUFFLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO0lBQ2pELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtRQUFFLEtBQUssQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDO0lBQ3BELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztRQUFFLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0lBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtRQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRXZDLElBQUksWUFBWSxHQUFHLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLGFBQWEsR0FBRyxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLHNEQUFzRDtJQUU5SyxzREFBc0Q7SUFDdEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUU7UUFDdkIsS0FBSyxDQUFDLFlBQVksR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLENBQ2xELENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDTixJQUFJLENBQ0YsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUMxRDtZQUNELEtBQUssQ0FBQyxRQUFRLENBQ2pCLENBQUM7S0FDSDtJQUVELElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWTtRQUFFLE9BQU87SUFFakQsSUFBSSxLQUFLLENBQUMsUUFBUSxJQUFJLGVBQWUsRUFBRTtRQUNyQyx1REFBdUQ7UUFDdkQsSUFBSSxVQUFVLEdBQUcsd0JBQXdCLENBQUMsTUFBTSxDQUM5QyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQ1IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixNQUFNLENBQUMsWUFBWSxHQUFHLHNDQUFzQyxDQUMvRCxDQUFDO1FBQ0YsSUFDRSxLQUFLLENBQUMsUUFBUSxLQUFLLFlBQVksQ0FBQyxZQUFZO2VBQ3pDLEtBQUssQ0FBQyxRQUFRLEtBQUssWUFBWSxDQUFDLFNBQVM7ZUFDMUMsS0FBSyxDQUFDLFFBQVEsS0FBSyxZQUFZLENBQUMsVUFBVSxFQUM1QztZQUNBLG1EQUFtRDtZQUNuRCxLQUFLLENBQUMsWUFBWSxHQUFHO2dCQUNuQixHQUFHLEtBQUssQ0FBQyxZQUFZO2dCQUNyQixHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FDaEMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUNSLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsd0NBQXdDLENBQ2pFO2FBQ0YsQ0FBQztTQUNIO1FBQ0QsSUFBSSxVQUFVLEVBQUU7WUFDZCxLQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsWUFBWSxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUM7U0FDN0Q7S0FDRjtJQUNLLHNDQUFzQyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQ2pELGNBQWMsQ0FBQyxTQUFTLEVBQUU7UUFDdEMsYUFBYSxFQUFFLEtBQUssQ0FBQyxRQUFRO1FBQzdCLEVBQUUsRUFBRSxZQUEyQjtLQUNoQyxDQUFDLENBQUM7SUFFSCxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFDaEIsd0JBQXdCLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsQ0FBQzthQUMvRSxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztLQUMvQjtBQUNILENBQUM7QUFFRCxLQUFLLFVBQVUsbUNBQW1DLENBQUMsS0FHbEQ7SUFDQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7UUFBRSxLQUFLLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztJQUNyRCxJQUFJLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQXFCLENBQUM7SUFDakYsSUFBSSxRQUFzQixDQUFDO0lBQzNCLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQyxNQUFNLENBQ3RDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDSixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQ0wsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RSxLQUFLLENBQUMsUUFBUSxDQUNqQixDQUFDO0lBQ0YsZ0pBQWdKO0lBQ2hKLElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsU0FBUyxFQUFFO1FBQ3hDLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ3hELG9FQUFvRTtZQUNwRSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FDeEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQ3RELENBQUM7U0FDSDthQUFNO1lBQ0wsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQ3hCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUN4RCxDQUFDO1NBQ0g7S0FDRjtJQUNELElBQUksUUFBUSxFQUFFO1FBQ1osc0NBQXNDLENBQUMsUUFBUSxFQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUU7WUFDeEUsYUFBYSxFQUFFLGFBQWE7WUFDNUIsRUFBRSxFQUFFLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFdBQVcsR0FBRyw0Q0FBNEMsRUFBRSxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsSSxDQUFDLENBQUM7S0FDSjtBQUNILENBQUM7QUFDRCxLQUFLLFVBQVUsNkJBQTZCLENBQUMsU0FBUyxHQUFHLFlBQVksRUFBRSxRQUFnQjtJQUNyRix3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEVBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxDQUFDO1NBQ3hELE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFDRDs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxtQkFBbUIsQ0FBQyxTQUFzQixFQUFFLEtBQWEsRUFBRSxLQUFtQixFQUFFLE9BQXFCLEVBQUUsU0FBa0I7SUFFaEksSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLDZEQUE2RDtJQUN6RyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUVuQyxTQUFTLENBQUMscUJBQXFCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0VBQXdFO0lBRWhJLElBQUksR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDO1FBQ25CLEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxFQUFFLEtBQUs7UUFDWixRQUFRLEVBQUUsY0FBYztRQUN4QixTQUFTLEVBQUUsU0FBUztRQUNwQixPQUFPLEVBQUUsR0FBRSxFQUFFO1lBQ1gsSUFBSSxtQkFBbUIsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBZ0IsQ0FBQztZQUNwRyxJQUFJLENBQUMsbUJBQW1CO2dCQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQzdFLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN2RCxzR0FBc0c7UUFDeEcsQ0FBQztLQUNGLENBQUMsQ0FBQztJQUVILElBQUksYUFBYSxHQUFlLFNBQVMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLDBPQUEwTztJQUVuVSxtSEFBbUg7SUFDakgsSUFBSSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hELG1CQUFtQixDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztJQUNsRCxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDcEQsbUJBQW1CLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQyxzR0FBc0c7SUFDbEosU0FBUyxDQUFDLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBR2xFLDZFQUE2RTtJQUM3RSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQ3RCLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FDbEIsMEJBQTBCLENBQ3BCLEdBQUcsRUFDSCxHQUFHLENBQUMsU0FBUyxFQUNiLFNBQVMsRUFDVCxtQkFBbUIsQ0FDeEIsQ0FDRixDQUFDLENBQUM7SUFDRyxPQUFPLENBQUMsYUFBYSxFQUFFLG1CQUFtQixDQUFDLENBQUE7QUFDekQsQ0FBQyJ9