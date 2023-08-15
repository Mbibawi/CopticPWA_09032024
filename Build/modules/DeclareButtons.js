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
                createdButton.addEventListener('click', () => showTitles('#bookOfHours' + btn.btnID + 'Expandable'));
                async function showTitles(id) {
                    //!CAUTION: we had to pass the id instead of the createdContainer itself, because the refrence to createdContainer is not maintained for each button. It keeps the reference to the last created button. Until we find a way to bind it, we use the id of the createdContainer in order to retrieve it later
                    let BOHContainer = containerDiv.querySelector(id);
                    console.log('BOHContainer', BOHContainer.id);
                    let sideBarChildren = Array.from(sideBarTitlesContainer.children);
                    //We remove the already existing title for this hour
                    sideBarChildren.filter(htmlDiv => htmlDiv.children[0]
                        //@ts-ignore
                        && htmlDiv.children[0].href.includes(Prefix.bookOfHours)).forEach(titleDiv => titleDiv.remove());
                    //Removing any other Book of Hours titles, if previously added when the button was clicked
                    let anchorsDivs = sideBarChildren.filter(htmlDiv => htmlDiv.dataset.group === 'bookOfHoursTitle');
                    anchorsDivs.forEach(anchor => anchor.remove());
                    let btnTitles = Array.from(BOHContainer.children)
                        .filter((htmlRow) => htmlRow.classList.contains('Title') || htmlRow.classList.contains('SubTitle'));
                    //Moving the newly created titles to the top of the sideBar menu, and giving each of them a data-group = 'bookOfHoursTitle'
                    let addedTitles = await showTitlesInRightSideBar(btnTitles, undefined, false);
                    addedTitles.reverse().forEach(titleDiv => {
                        sideBarTitlesContainer.prepend(titleDiv);
                        titleDiv.dataset.group = 'bookOfHoursTitle';
                    });
                    //hiding the expandable divs of the other buttons, if they were expanded before
                    hideOtherExpandables();
                    function hideOtherExpandables() {
                        let expandables = Array.from(containerDiv.children)
                            .filter((htmlRow) => htmlRow.id.endsWith('Expandable'));
                        console.log('expandables = ', expandables);
                        if (expandables.length === 0)
                            return;
                        expandables
                            .forEach(container => {
                            if (container.id === 'bookOfHours' + btn.btnID + 'Expandable')
                                return;
                            container.classList.add('collapsedTitle');
                        });
                    }
                    ;
                }
                ;
                (function hideAllOtherExpandableDivs() {
                    //if (!args.isMass) return; //This function only runs when the buttons are shown in a Mass context (i.e., when the prayers are hidden and shown upon clicking the button)
                })();
                createdContainer
                    .querySelectorAll('div.SubTitle')
                    .forEach((subTitle) => collapseText(subTitle, createdContainer));
                if (localStorage.displayMode === displayModes[1]) {
                    //If we are in the 'Presentation Mode'
                    Array.from(createdContainer.querySelectorAll('div.Row'))
                        .filter((row) => row.dataset.root.includes('HourPsalm') || row.dataset.root.includes('EndOfHourPrayer'))
                        .forEach(row => row.remove()); //we remove all the psalms and keep only the Gospel and the Litanies,
                    Array.from(sideBarTitlesContainer.children)
                        .filter((row) => row.dataset.root.includes('HourPsalm')
                        || row.dataset.root.includes('EndOfHourPrayer'))
                        .forEach(row => row.remove()); //We do the same for the titles
                }
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
        (function addAChildButtonForEachHour() {
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
        if (args.returnBtnChildren)
            return btnBookOfHours.children;
        (function removeActorsFromPrayersArrays() {
            //When showing just the Book of Prayers independant of any Mass context, we remove all the actors classes from the prayersArray of all the buttons
            if (args.returnBtnChildren || args.isMass)
                return;
            btnBookOfHours.children
                .forEach(childBtn => {
                childBtn.prayersArray
                    .forEach(tbl => {
                    tbl.forEach(row => {
                        if (row[0].endsWith('&C=Title') || row[0].endsWith('&C=SubTitle'))
                            return;
                        row[0] = splitTitle(row[0])[0];
                    });
                });
            });
        })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUJ1dHRvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL0RlY2xhcmVCdXR0b25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sTUFBTTtJQXNCVixZQUFZLEdBQWU7UUFkbkIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQWVsQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDO1FBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDNUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsWUFBWSxH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