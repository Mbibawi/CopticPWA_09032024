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
    onClick: () => {
        btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
    },
});
const btnIncenseOffice = new Button({
    btnID: "btnIncenseOffice",
    label: {
        defaultLanguage: "رفع بخور باكر أو عشية",
        foreignLanguage: "Office des Encens Aube et Soir",
    },
    onClick: () => {
        //setting the children of the btnIncenseOffice. This must be done by the onClick() in order to reset them each time the button is clicked
        btnIncenseOffice.children = [btnIncenseDawn, btnIncenseVespers];
        //show or hide the PropheciesDawn button if we are in the Great Lent or JonahFast:
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
                    let efnotiNaynan = btnIncenseDawn.docFragment.querySelectorAll(getDataRootSelector(Prefix.commonPrayer + 'EfnotiNaynan&D=$copticFeasts.AnyDay', true));
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
            let btnDiv = document.createElement("div"); //Creating a div container in which the btn will be displayed
            btnDiv.classList.add("inlineBtns");
            btnIncenseDawn.docFragment.children[0].insertAdjacentElement("beforebegin", btnDiv); //Inserting the div containing the button as 1st element of containerDiv
            //Adding an inline Button for showing the "Adam" Doxologies, and removing the id of the Adam Doxologies from the btn.prayers array
            let btn = new Button({
                btnID: "AdamDoxologies",
                label: {
                    defaultLanguage: "ذكصولوجيات باكر آدام",
                    foreignLanguage: "Doxologies Adam Aube",
                },
                cssClass: inlineBtnClass,
                prayersArray: [],
                languages: btnIncenseDawn.languages,
                onClick: () => {
                    let doxologyDiv = containerDiv.querySelector('#' + btn.btnID + 'New');
                    if (!doxologyDiv)
                        return;
                    if (doxologyDiv.style.display === 'none')
                        doxologyDiv.style.display = 'grid';
                    else if (doxologyDiv.style.display === 'grid')
                        doxologyDiv.style.display = 'none';
                },
            });
            createBtn(btn, btnDiv, btn.cssClass, true, btn.onClick); //creating the html element representing the button. Notice that we give it as 'click' event, the btn.onClick property, otherwise, the createBtn will set it to the default call back function which is showChildBtnsOrPrayers(btn, clear)
            //We will create a newDiv to which we will append all the elements in order to avoid the reflow as much as possible
            let doxologyDiv = document.createElement('div');
            doxologyDiv.id = btn.btnID + 'New';
            doxologyDiv.style.display = 'none';
            //Setting the btn prayersArray to a filtered array of the 'Adam' doxologies
            let adam = DoxologiesPrayersArray.filter(table => table[0][0].startsWith(Prefix.commonDoxologies + 'Adam'));
            //We will create a div element for each row of each table in btn.prayersArray
            adam.forEach(table => table.forEach(row => createHtmlElementForPrayer(row, btn.languages, undefined, doxologyDiv)));
            //finally we append the newDiv to containerDiv
            btnIncenseDawn.docFragment.children[1].insertAdjacentElement('beforebegin', doxologyDiv);
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
        if (btnsPrayers[btns.indexOf(btnMassStCyril)]) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
            btnMassStCyril.prayersSequence = btnsPrayers[btns.indexOf(btnMassStCyril)];
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
        return btnMassStCyril.prayersSequence;
    },
    afterShowPrayers: async () => {
        showFractionsMasterButton(btnMassStCyril, btnMassStCyril.docFragment);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Basil, St. Gregory or St. John)
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory, btnMassStJohn], {
                beforeOrAfter: "afterend",
                el: btnMassStCyril.docFragment.querySelector(getDataRootSelector('Reconciliation&D=$copticFeasts.AnyDay', true)),
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Basil or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = btnMassStCyril.docFragment.querySelectorAll(getDataRootSelector(Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=$copticFeasts.AnyDay', true));
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Basil or St Gregory before Agios
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory], {
                beforeOrAfter: "beforebegin",
                el: btnMassStCyril.docFragment.querySelector(getDataRootSelector(Prefix.massCommon + 'Agios&D=$copticFeasts.AnyDay'))
            }, 'RedirectionToAgios');
        })();
        scrollToTop(); //scrolling to the top of the page
        //Collapsing all the Titles
        //collapseAllTitles(btnMassStCyril.docFragment);
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
        if (btnsPrayers[btns.indexOf(btnMassStGregory)]) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
            btnMassStGregory.prayersSequence = btnsPrayers[btns.indexOf(btnMassStGregory)];
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
        //Collapsing all the Titles
        return btnMassStGregory.prayersSequence;
    },
    afterShowPrayers: async () => {
        showFractionsMasterButton(btnMassStGregory, btnMassStGregory.docFragment);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Basil, St. Cyril, or St. John)
            redirectToAnotherMass([btnMassStBasil, btnMassStCyril, btnMassStJohn], {
                beforeOrAfter: "afterend",
                el: btnMassStGregory.docFragment.querySelector(getDataRootSelector('Reconciliation&D=$copticFeasts.AnyDay', true)),
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Cyrill or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = btnMassStGregory.docFragment.querySelectorAll(getDataRootSelector(Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=$copticFeasts.AnyDay', true));
            redirectToAnotherMass([btnMassStBasil, btnMassStCyril,], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory before Agios
            redirectToAnotherMass([btnMassStBasil, btnMassStCyril], {
                beforeOrAfter: "beforebegin",
                el: btnMassStGregory.docFragment.querySelector(getDataRootSelector(Prefix.massCommon + 'Agios&D=$copticFeasts.AnyDay'))
            }, 'RedirectionToAgios');
        })();
        scrollToTop(); //scrolling to the top of the page
        //collapseAllTitles(btnMassStGregory.docFragment);
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
        return btnMassStBasil.prayersSequence;
    },
    afterShowPrayers: async () => {
        showFractionsMasterButton(btnMassStBasil, btnMassStBasil.docFragment);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Gregory, St. Cyril, or St. John)
            redirectToAnotherMass([btnMassStGregory, btnMassStCyril, btnMassStJohn], {
                beforeOrAfter: "afterend",
                el: btnMassStBasil.docFragment.querySelector(getDataRootSelector('Reconciliation&D=$copticFeasts.AnyDay', true)),
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Cyrill or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = btnMassStBasil.docFragment.querySelectorAll(getDataRootSelector(Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=$copticFeasts.AnyDay', true));
            redirectToAnotherMass([btnMassStGregory, btnMassStCyril,], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory before Agios
            redirectToAnotherMass([btnMassStGregory, btnMassStCyril], {
                beforeOrAfter: "beforebegin",
                el: btnMassStBasil.docFragment.querySelector(getDataRootSelector(Prefix.massCommon + 'Agios&D=$copticFeasts.AnyDay'))
            }, 'RedirectionToAgios');
        })();
        //Collapsing all the Titles
        //collapseAllTitles(btnMassStBasil.docFragment);
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
    },
    afterShowPrayers: async () => {
        return; //until we add the text of this mass
        showFractionsMasterButton(btnMassStJohn, btnMassStJohn.docFragment);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Basil, St. Gregory or St. Cyril)
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory, btnMassStCyril], {
                beforeOrAfter: "afterend",
                el: btnMassStJohn.docFragment.querySelector(getDataRootSelector('Reconciliation&D=$copticFeasts.AnyDay', true)),
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = btnMassStJohn.docFragment.querySelectorAll(getDataRootSelector(Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=$copticFeasts.AnyDay', true));
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory, btnMassStCyril], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory before Agios
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory, btnMassStCyril], {
                beforeOrAfter: "beforebegin",
                el: btnMassStJohn.docFragment.querySelector(getDataRootSelector(Prefix.massCommon + 'Agios&D=$copticFeasts.AnyDay'))
            }, 'RedirectionToAgios');
        })();
        //Collapsing all the Titles
        //collapseAllTitles(btnMassStJohn.docFragment);
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
            btnMassUnBaptised.children = [
                btnReadingsStPaul,
                btnReadingsKatholikon,
                btnReadingsPraxis,
                btnReadingsSynaxarium,
                btnReadingsGospelMass,
            ];
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
        if (Season === Seasons.GreatLent
            || Season === Seasons.JonahFast) {
            //Inserting psaume 'His Foundations In the Holy Montains' before the absolution prayers
            insertPrayersAdjacentToExistingElement(btnMassUnBaptised.prayersArray
                .filter(table => baseTitle(table[0][0]) === Prefix.massCommon + "HisFoundationsInTheHolyMountains&D=GreatLent"), btnMassUnBaptised.languages, {
                beforeOrAfter: 'beforebegin',
                el: containerDiv.querySelector(getDataRootSelector(Prefix.massCommon + "AbsolutionForTheFather&D=$copticFeasts.AnyDay"))
            });
        }
        let anchor = btnMassUnBaptised.docFragment.querySelectorAll(getDataRootSelector(Prefix.commonPrayer + 'HolyGodHolyPowerful&D=$copticFeasts.AnyDay'))[0]; //this is the html element before which we will insert all the readings and responses
        let reading;
        (function insertStPaulReading() {
            reading = btnReadingsStPaul.prayersArray.filter(tbl => baseTitle(tbl[0][0]) === btnReadingsStPaul.prayersSequence[0] + '&D=' + copticReadingsDate);
            //adding the  end of the St Paul reading
            if (reading.length === 0)
                return;
            reading = [
                [[reading[0][1][0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.stPaulIntro.AR, ReadingsIntrosAndEnds.stPaulIntro.FR, ReadingsIntrosAndEnds.stPaulIntro.EN]],
                ...reading,
                [[reading[0][1][0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.stPaulEnd.AR, ReadingsIntrosAndEnds.stPaulEnd.FR, ReadingsIntrosAndEnds.stPaulEnd.EN]]
            ];
            insertPrayersAdjacentToExistingElement(reading, btnReadingsStPaul.languages, { beforeOrAfter: 'beforebegin', el: anchor });
        })();
        (function insertKatholikon() {
            reading = btnReadingsKatholikon.prayersArray.filter(tbl => baseTitle(tbl[0][0]) === btnReadingsKatholikon.prayersSequence[0] + '&D=' + copticReadingsDate);
            if (reading.length === 0)
                return;
            //ading the introduction and the end of the Katholikon
            reading = [
                [[reading[0][1][0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.katholikonIntro.AR, ReadingsIntrosAndEnds.katholikonIntro.FR, ReadingsIntrosAndEnds.katholikonIntro.EN]],
                ...reading,
                [[reading[0][1][0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.katholikonEnd.AR, ReadingsIntrosAndEnds.katholikonEnd.FR, ReadingsIntrosAndEnds.katholikonEnd.EN]]
            ];
            insertPrayersAdjacentToExistingElement(reading, btnReadingsKatholikon.languages, { beforeOrAfter: 'beforebegin', el: anchor });
        })();
        (function insertPraxis() {
            reading = btnReadingsPraxis.prayersArray.filter(tbl => baseTitle(tbl[0][0]) === btnReadingsPraxis.prayersSequence[0] + '&D=' + copticReadingsDate);
            if (reading.length === 0)
                return;
            reading = [
                [[reading[0][1][0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.praxisIntro.AR, ReadingsIntrosAndEnds.praxisIntro.FR, ReadingsIntrosAndEnds.praxisIntro.EN]],
                ...reading,
                [[reading[0][1][0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.praxisEnd.AR, ReadingsIntrosAndEnds.praxisEnd.FR, ReadingsIntrosAndEnds.praxisEnd.EN]]
            ];
            insertPrayersAdjacentToExistingElement(reading, btnReadingsPraxis.languages, { beforeOrAfter: 'beforebegin', el: anchor });
            (function insertPraxisResponse() {
                let response = PrayersArray.filter(table => table[0][0].startsWith(Prefix.praxisResponse)
                    && (eval(baseTitle(table[0][0]).split('&D=')[1].replace('$', '')) === copticDate
                        || eval(baseTitle(table[0][0]).split('&D=')[1].replace('$', '')) === Season));
                if (response.length === 0) {
                    //If we are not on a a cotpic feast or a Season, We will look in the saints feasts
                    response = PrayersArray.filter(table => table[0][0].startsWith(Prefix.praxisResponse)
                        && Object.entries(saintsFeasts).filter(entry => entry[1] === eval(baseTitle(table[0][0]).split('&D=')[1].replace('$', ''))).length > 0);
                }
                if (response.length > 0) {
                    //If a Praxis response was found
                    if (Season === Seasons.GreatLent) {
                        // The query should yield to  2 tables ('Sundays', and 'Week') for this season. We will keep the relevant one accoding to the date
                        if (todayDate.getDay() === 0 || todayDate.getDay() === 6)
                            response = response.filter(table => table[0][0].includes('Sundays&D='));
                        if (todayDate.getDay() != 0 && todayDate.getDay() != 6)
                            response = response.filter(table => table[0][0].includes('Week&D='));
                    }
                    insertPrayersAdjacentToExistingElement(response, prayersLanguages, { beforeOrAfter: 'beforebegin', el: btnMassUnBaptised.docFragment.querySelectorAll(getDataRootSelector(Prefix.praxis, true))[0] });
                    //Moving the annual response
                    let annual = btnMassUnBaptised.docFragment.querySelectorAll(getDataRootSelector(Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay"));
                    if (!annual || annual.length === 0)
                        return console.log('error: annual = ', annual);
                    Array.from(annual).forEach((el) => {
                        btnMassUnBaptised.docFragment
                            .querySelectorAll(getDataRootSelector(Prefix.praxis, true))[0]
                            .insertAdjacentElement('beforebegin', el);
                    });
                }
            })();
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
            getGospelReadingAndResponses(Prefix.gospelMass, btnReadingsGospelMass.prayersArray, btnReadingsGospelMass.languages, btnMassUnBaptised.docFragment);
        })();
        (function insertBookOfHoursButton() {
            let div = document.createElement('div');
            div.style.display = 'grid';
            div.id = 'bookOfHours';
            btnMassUnBaptised.docFragment.children[0].insertAdjacentElement('beforebegin', div);
            let bookOfHoursBtn = new Button({
                btnID: btnGoBack.btnID,
                label: btnBookOfHours.label,
                showPrayers: true,
                onClick: async () => {
                    let bookOfHoursDiv = containerDiv.querySelector('#bookOfHours');
                    if (bookOfHoursDiv.children.length > 0) {
                        //it means the Book of Hours have been inserted before when the user clicked the button, we remove them and return
                        if (bookOfHoursDiv.style.display === 'grid') {
                            bookOfHoursDiv.style.display = 'none';
                            rightSideBar.querySelectorAll('div[data-group="bookOfHoursTitle"]')
                                .forEach((title) => {
                                title.style.display = 'none';
                            });
                        }
                        else {
                            bookOfHoursDiv.style.display = 'grid';
                            rightSideBar.querySelectorAll('div[data-group="bookOfHoursTitle"]').forEach((title) => { title.style.display = 'block'; });
                        }
                        ;
                        return;
                    }
                    ;
                    let hours = btnBookOfHours.onClick(true); //notice that we pass true as parameter to btnBookOfHours.onClick() in order to make the function return only the hours of the mass not all the hours of the bookOfPrayersArray
                    if (hours.length === 0)
                        return console.log('hours = 0');
                    //We will insert the text as divs after the div where the button is displayed
                    //We remove the thanks giving and the Psalm 50
                    hours
                        .filter((title) => title.includes('ThanksGiving') || title.includes('Psalm50'))
                        .map(title => hours.splice(hours.indexOf(title), 1));
                    let bookOfHours = [];
                    hours.map((title) => {
                        bookOfHours.push(...btnBookOfHours.prayersArray.filter(tbl => baseTitle(tbl[0][0]) === title));
                    });
                    bookOfHours
                        .forEach((table) => table
                        .forEach((row) => createHtmlElementForPrayer(row, btnBookOfHours.languages, undefined, div)));
                    setCSSGridTemplate(Array.from(div.children));
                    div
                        .querySelectorAll('div.SubTitle')
                        .forEach((subTitle) => collapseText(subTitle, div));
                    //We will append the titles of the Book of Hours to the right side Bar, with a display 'none'
                    let titles = await showTitlesInRightSideBar(div.querySelectorAll('div.TitleRow, div.SubTitle'), undefined, false);
                    titles
                        .reverse()
                        .forEach((title) => {
                        title.dataset.group = 'bookOfHoursTitle';
                        title.style.display = 'block';
                        rightSideBar
                            .querySelector('#sideBarBtns')
                            .children[0]
                            .insertAdjacentElement('beforebegin', title);
                    });
                },
            });
            createBtn(bookOfHoursBtn, containerDiv, inlineBtnClass, false, bookOfHoursBtn.onClick);
        })();
        //Collapsing all the Titles
        collapseAllTitles(btnMassUnBaptised.docFragment);
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
    label: { defaultLanguage: "قراءات اليوم", foreignLanguage: "Lectures du jour", otherLanguage: "Day's Readings" },
    onClick: () => {
        if (Season === Seasons.HolyWeek) {
            //We should put here child buttons for the Holy Week prayers and readings
            let div = document.createElement('div');
            div.innerText = 'We are during the Holy Week, there are no readings, please go to the Holy Week Prayers';
            containerDiv.appendChild(div);
            return;
        }
        //We set the btnDayReadings.children[] property
        btnDayReadings.children = [
            btnReadingsGospelIncenseDawn,
            btnReadingsStPaul,
            btnReadingsKatholikon,
            btnReadingsPraxis,
            btnReadingsSynaxarium,
            btnReadingsGospelMass,
            btnReadingsGospelIncenseVespers,
        ];
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
const btnReadingsStPaul = new Button({
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
});
const btnReadingsKatholikon = new Button({
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
});
const btnReadingsPraxis = new Button({
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
});
const btnReadingsSynaxarium = new Button({
    btnID: "btnReadingsSynaxarium",
    label: {
        defaultLanguage: "السنكسار",
        foreignLanguage: "Synaxarium",
    },
    showPrayers: true,
    prayersArray: ReadingsArrays.SynaxariumArray,
    languages: ["FR", "AR"],
    onClick: () => {
        (btnReadingsSynaxarium.prayersSequence = [Prefix.synaxarium + "&D=" + copticDate]),
            scrollToTop(); //scrolling to the top of the page
    },
});
const btnReadingsGospelMass = new Button({
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
});
const btnReadingsGospelIncenseVespers = new Button({
    btnID: "btnReadingsGospelIncenseVespers",
    label: {
        defaultLanguage: "إنجيل عشية",
        foreignLanguage: "Evangile  Vêpres",
        otherLanguage: "Vespers Gospel",
    },
    showPrayers: true,
    prayersSequence: ["", ""],
    prayersArray: ReadingsArrays.GospelVespersArray,
    languages: [...readingsLanguages],
    onClick: () => {
        let today = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).
        let date = setSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today), today);
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
        foreignLanguage: "Evangile Soir",
        otherLanguage: "Vespers Gospel",
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
    onClick: (mass = false) => {
        let Kenin = Prefix.commonPrayer + 'NowAlwaysAndForEver&D=$copticFeasts.AnyDay', ZoksaPatri = Prefix.commonPrayer + 'GloryToTheFatherTheSonAndTheSpirit&D=$copticFeasts.AnyDay', gospelEnd = Prefix.bookOfHours + 'GospelEnd&D=$copticFeasts.AnyDay', OurFatherWhoArtInHeaven = Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay', WeExaltYou = Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Agios = Prefix.commonPrayer + 'HolyGodHolyPowerfulPart', HolyLordOfSabaot = Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay', Creed = Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay', Hallelujah = Prefix.bookOfHours + '+PsalmEnd&D=$copticFeasts.AnyDay', HourIntro = [
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
        (function preparingButtonPrayers() {
            for (let hour in bookOfHours) {
                if (hour.endsWith('Array')) {
                    //We populate each hour prayers property of bookOfHours (see its definition) from the title of the hour prayersArray (this property was set when the page was loaded by the populatePrayersArrays() function)
                    bookOfHours[hour.replace('Array', 'Sequence')] = [...bookOfHours[hour].map(table => baseTitle(table[0][0]))];
                    //We insert the "Thanks Giving" and "Psalm 50" after the 1st element
                    bookOfHours[hour.replace('Array', 'Sequence')].splice(1, 0, ...HourIntro);
                }
            }
            //Adding the repeated psalms (psalms that are found in the 6ths and 9th hour), before pasalm 122
            bookOfHours.DawnPrayersSequence.splice(bookOfHours.DawnPrayersSequence.indexOf(Prefix.bookOfHours + '1stHourPsalm142&D=$copticFeasts.AnyDay'), 0, ...DawnPsalms);
            if (mass) {
                //mass is a boolean that tells whether the button prayersArray should include all the hours of the Book Of Hours, or only those pertaining to the mass according to the season and the day on which the mass is celebrated
                if (Season === Seasons.GreatLent) {
                    //We are during the Great Lent, we pray the 3rd, 6th, 9th, 11th, and 12th hours
                    btnBookOfHours.prayersSequence = [
                        ...bookOfHours.ThirdHourPrayersSequence,
                        ...bookOfHours.SixthHourPrayersSequence,
                        ...bookOfHours.NinethHourPrayersSequence,
                        ...bookOfHours.EleventhHourPrayersSequence,
                        ...PrayersArray,
                        ...bookOfHours.TwelvethHourPrayersSequence
                    ];
                }
                else if (Season === Seasons.PentecostalDays
                    || todayDate.getDay() === 0
                    || todayDate.getDay() === 6
                    || lordFeasts.indexOf(copticDate) > -1) {
                    //We are a Sunday or a Saturday, or during the 50 Pentecostal days, or on a Lord Feast day,
                    btnBookOfHours.prayersSequence = [
                        ...bookOfHours.ThirdHourPrayersSequence,
                        ...bookOfHours.SixthHourPrayersSequence
                    ];
                }
                else {
                    btnBookOfHours.prayersSequence = [
                        ...bookOfHours.ThirdHourPrayersSequence,
                        ...bookOfHours.SixthHourPrayersSequence,
                        ...bookOfHours.NinethHourPrayersSequence
                    ];
                }
            }
            else {
                //This is the case where the Book of Prayers is displayed entirely in order to be used as is outside of any mass or liturgy context
                btnBookOfHours.prayersSequence = [];
                for (let hour in bookOfHours) {
                    if (!hour.endsWith('Array')) {
                        btnBookOfHours.prayersSequence.push(...bookOfHours[hour]);
                    }
                }
            }
            //We will insert the 'Zoksa Patri' and 'kenin' responses after the litanies
            let btnPrayers = btnBookOfHours.prayersSequence, title;
            for (let i = 0; i < btnPrayers.length; i++) {
                title = btnPrayers[i];
                if (title.includes('Litanies1')
                    || title.includes('Litanies4')) {
                    btnPrayers.splice(btnPrayers.indexOf(title) + 1, 0, ZoksaPatri);
                }
                else if (title.includes('Litanies2') //second litany
                    || title.includes('Litanies5') //5th litany       
                    || (title.includes('Litanies3') && btnPrayers[btnPrayers.indexOf(title) + 1].includes('Litanies')) //3rd litany if litanies are > 3
                ) {
                    btnPrayers.splice(btnPrayers.indexOf(title) + 1, 0, Kenin);
                }
                else if (title.includes('Gospel&D=$copticFeasts.AnyDay')) {
                    //Inserting the Gosepl End
                    if (btnPrayers[btnPrayers.indexOf(title) + 1] != gospelEnd) {
                        btnPrayers.splice(btnPrayers.indexOf(title) + 1, 0, gospelEnd);
                    }
                    ;
                }
                else if (title.includes('Psalm')) {
                    if (btnPrayers[btnPrayers.indexOf(title) + 1] != Hallelujah) {
                        btnPrayers.splice(btnPrayers.indexOf(title) + 1, 0, Hallelujah);
                    }
                    ;
                }
            }
            btnBookOfHours.prayersSequence = btnPrayers;
        })();
        (function preparingButtonPrayersArray() {
            //initiating the prayersArray with all the tables in bookOfHoursArray
            btnBookOfHours.prayersArray = [...bookOfHoursPrayersArray];
            //Adding the "Zoksa Patri" and "Kenin" and "Hallelujah" tables to the button's prayers array
            btnBookOfHours.prayersArray.push(...CommonPrayersArray.filter(table => baseTitle(table[0][0]) === ZoksaPatri
                || new RegExp(Prefix.commonPrayer + 'ThanksGivingPart\\d{1}\\&D\\=\\$copticFeasts.AnyDay').test(baseTitle(table[0][0]))
                || baseTitle(table[0][0]) === Kenin
                || baseTitle(table[0][0]) === Hallelujah
                || new RegExp(Agios + '\\d{1}\\&D\\=\\$copticFeasts.AnyDay').test(baseTitle(table[0][0]))
                || baseTitle(table[0][0]) === HolyLordOfSabaot
                || baseTitle(table[0][0]) === WeExaltYou
                || baseTitle(table[0][0]) === OurFatherWhoArtInHeaven
                || baseTitle(table[0][0]) === Creed));
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
let btnsPrayers = [];
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
        let readingsDate = setSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(date)); //we get the coptic date corresponding to the date we created, and pass it to setSeaonAndCopticReadingsDate() to retrieve the reading date from this function
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
        gospelInsertionPoint = container.querySelectorAll(getDataRootSelector(Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay"))[0]; //This is the html element before which we will insert the gospel litany
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
            gospelPrayers.push(PrayersArray.filter(table => baseTitle(table[0][0]) === title)[0]);
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
    let gospelIntroduction = container.querySelectorAll(getDataRootSelector(anchorDataRoot));
    if (gospelIntroduction.length === 0)
        return console.log('gospelIntroduction.length = 0 ', gospelIntroduction);
    let responses = setGospelPrayers(liturgy); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']
    //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
    let gospel = goseplReadingsArray.filter((table) => baseTitle(table[0][0]) === responses[1] + copticReadingsDate //this is the pasalm text
        || baseTitle(table[0][0]) === responses[2] + copticReadingsDate //this is the gospel itself
    ); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####". We should get a string[][][] of 2 elements: a table for the Psalm, and a table for the Gospel
    if (gospel.length === 0)
        return console.log('gospel.length = 0'); //if no readings are returned from the filtering process, then we end the function
    gospel.forEach((table) => {
        let el; //this is the element before which we will insert the Psaml or the Gospel
        if (baseTitle(table[0][0]).includes("Gospel&D=")) {
            //This is the Gospel itself, we insert it before the gospel response
            el = gospelInsertionPoint;
        }
        else if (baseTitle(table[0][0]).includes("Psalm&D=")) {
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
            gospelResp = PrayersArray.filter((r) => baseTitle(r[0][0]) === Prefix.commonPrayer + 'GospelResponse&D=$copticFeasts.AnyDay'); //If no specific gospel response is found, we will get the 'annual' gospel response
        insertPrayersAdjacentToExistingElement(gospelResp, prayersLanguages, {
            beforeOrAfter: "beforebegin",
            el: gospelInsertionPoint,
        });
        //We will eventy remove the insertion point placeholder
        gospelInsertionPoint.remove();
    })();
    //We will insert the Psalm response
    (function insertPsalmResponse() {
        let gospelPrayer = container.querySelectorAll(getDataRootSelector(Prefix.commonPrayer + 'GospelPrayer&D=$copticFeasts.AnyDay')); //This is the 'Gospel Litany'. We will insert the Psalm response after its end
        let psalmResp = PsalmAndGospelPrayersArray.filter((r) => r[0][0].split('&D=')[0] + '&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) === responses[0]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (!psalmResp || !gospelPrayer)
            return;
        insertPrayersAdjacentToExistingElement(psalmResp, prayersLanguages, {
            beforeOrAfter: 'beforebegin',
            el: gospelPrayer[gospelPrayer.length - 2].nextElementSibling
        });
    })();
}
function showFractionsMasterButton(btn, container) {
    let selected = [], filtered;
    let insertion = container.querySelector('[data-root="' + Prefix.massCommon + 'FractionPrayerPlaceholder&D=$copticFeasts.AnyDay"]'); //this is the id of the html element after which we will insert the inline buttons for the fraction prayers
    let masterBtnDiv = document.createElement("div"); //a new element to which the inline buttons elements will be appended
    insertion.insertAdjacentElement("afterend", masterBtnDiv); //we insert the div after the insertion position
    for (let feast in copticFeasts) {
        //Looping the feasts and, if found adding them first
        filtered = filterFractions(copticFeasts[feast]);
        pushIfItNotExisting(filtered);
    }
    for (let season in Seasons) {
        //We also loop the seasons and add the fractions having the Season as date value in its title
        filtered = filterFractions(Seasons[season]);
        pushIfItNotExisting(filtered);
    }
    //We add the fraction of the 29th of each month
    //We finally also add all the so called "annual" fraction prayers
    filtered = FractionsPrayersArray.filter((fraction) => fraction[0][0].includes("&D=$copticFeasts.AnyDay") || fraction[0][0].includes("||0000"));
    pushIfItNotExisting(filtered);
    function pushIfItNotExisting(filtered) {
        if (filtered) {
            filtered.map((f) => {
                if (selected.indexOf(f) < 0) {
                    selected.push(f);
                }
            });
        }
    }
    function filterFractions(date) {
        if (date === copticDate || date === Season) {
            return FractionsPrayersArray.filter((f) => eval(baseTitle(f[0][0].split("&D=")[1]).replace("$", "")) ===
                date || //we use eval() for the case where the value of the date in the title starts with ($)
                baseTitle(f[0][0].split("&D=")[1]) === date || //this is the case where the date is not a variable
                (f[0][0].includes("||") && selectFromMultiDatedTitle(f, date))); //this is the case where there are more than one date
        }
        else {
            return undefined;
        }
    }
    showInlineButtonsForOptionalPrayers(selected, btn, masterBtnDiv, { defaultLanguage: "صلوات القسمة", foreignLanguage: "Oraisons de la Fraction" }, "btnFractionPrayers");
}
/**
 * Filters the array containing the gospel text for each liturgie (e.g., Incense Dawn, Vepspers, etc.) and returns the text of the gospel and the psaume. The fil
 * @param {Button} btn - the button of the liturgie within which we want to show the gospel text and the psaume text
 * @param {string[][][]} readingsArray - the array containing the text of the gospel and the psaume. Each element of this array repersents a table in the Word document from which the text was retrieved, and each element of each table[], represents a row of this table
 * @returns {string[][][]} - the result of the filtering operation. This normally returns an array of 2 tables: the first table represents the table of the psaume text, and the 2nd table represents the table of the gospel text
 */
function getBtnGospelPrayersArray(btn, readingsArray) {
    let gospel = readingsArray.filter((r) => {
        baseTitle(r[0][0][0]) === btn.prayersSequence[1] ||
            baseTitle(r[0][0][0]) === btn.prayersSequence[2];
    });
    return gospel;
}
function selectFromMultiDatedTitle(table, coptDate = copticDate) {
    let date, found = false;
    let dates = baseTitle(table[0][0].split("&D=")[1]).split("||");
    for (let i = 0; i < dates.length; i++) {
        date = dates[i];
        if (date.startsWith("$")) {
            date = eval(date.replace("$", ""));
        }
        if (date === coptDate) {
            found = true;
        }
    }
    return found;
}
/**
 * Inserts the Incense Office Doxologies And Cymbal Verses according to the Coptic feast or season
 * @param {HTMLElement | DocumentFragment} container - The HtmlElement in which the btn prayers are displayed and to which they are appended
 */
async function insertCymbalVersesAndDoxologiesForFeastsAndSeasons(container) {
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
            let stMaykelAnnual = container.querySelectorAll(getDataRootSelector(Prefix.commonIncense + 'CymablVersesCommon&D=$copticFeasts.AnyDay'))[3], //this is the 'annual' Cymbal verse  of container
            stMaykelPentecostal = container.querySelectorAll(getDataRootSelector(Prefix.cymbalVerses + 'StMaykel&D=$' + date))[0]; //this is the newly inserted Cymbal verse
            stMaykelAnnual.insertAdjacentElement('beforebegin', stMaykelPentecostal);
            //Removing the Annual verse
            stMaykelAnnual.remove();
        })();
        (function InsertLordsFeastFinal() {
            //Inserting the Final Cymbal verses for the joyfull days and Lord's Feasts
            let final = CymbalVersesPrayersArray.filter(table => table[0][0] === Prefix.cymbalVerses + 'LordFeastsEnd&D=$copticFeasts.AnyDay&C=Title'), annualVerses = container.querySelectorAll(getDataRootSelector(Prefix.commonIncense + 'CymablVersesCommon&D=$copticFeasts.AnyDay')); //annualVereses[8] is the St. Markos annual verse, we will delete the annual verses after it
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
    let dataRoot = getDataRootSelector(Prefix.commonIncense + 'CymbalVerses', true);
    //Retrieving the 1st Title in the Cymbal Verses section
    let cymbalsTitle = param.container.querySelector(dataRoot);
    //Retrieving the cymbal vereses of the feast or season
    if (!param.cymbalVerses) {
        param.cymbalVerses = CymbalVersesPrayersArray.filter((tbl) => eval(baseTitle(tbl[0][0]).split("&D=")[1].replace("$", "")) ===
            param.coptDate);
    }
    if (!cymbalsTitle || !param.cymbalVerses)
        return;
    if (param.coptDate in lordGreatFeasts) {
        //If we are on a Lord Feast, we add "Eb'oro" to the end
        let endCymbals = CymbalVersesPrayersArray.filter((tbl) => baseTitle(tbl[0][0]) ===
            Prefix.cymbalVerses + "LordFeastsEnd&D=$copticFeasts.AnyDay");
        if (param.coptDate === copticFeasts.Resurrection
            || param.coptDate === copticFeasts.Ascension
            || param.coptDate === copticFeasts.Pentecoste) {
            //Inserting the special Cymbal Verse for St. Maykel
            param.cymbalVerses = [
                ...param.cymbalVerses,
                ...CymbalVersesPrayersArray.filter((tbl) => baseTitle(tbl[0][0]) ==
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
        param.container
            .querySelectorAll(getDataRootSelector(cymbalsTitle.getAttribute("data-root")))
            .forEach((el) => el.remove());
    }
}
async function insertDoxologiesForFeastsAndSeasons(param) {
    if (!param.container)
        param.container = containerDiv;
    let doxology;
    doxology = DoxologiesPrayersArray.filter((d) => d[0][0]
        && baseTitle(d[0][0].split('&D=')[1])
        && eval(String(baseTitle(d[0][0].split('&D=')[1]).replace('$', ''))) ===
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
            el: param.container.querySelectorAll(getDataRootSelector(Prefix.incenseDawn + 'DoxologyWatesStMary&D=$copticFeasts.AnyDay'))[0],
        });
    }
}
async function removeElementsByTheirDataRoot(dataRoot) {
    containerDiv
        .querySelectorAll(getDataRootSelector(dataRoot))
        .forEach((el) => el.remove());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUJ1dHRvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL0RlY2xhcmVCdXR0b25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sTUFBTTtJQXNCVixZQUFZLEdBQWU7UUFkbkIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQWVsQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDO1FBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDNUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsWUFBWSxH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