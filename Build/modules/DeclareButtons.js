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
        foreignLanguage: "Office des Encens Aube et Vêpres",
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
                            rightSideBar.querySelectorAll('div[data-group="bookOfHoursTitle"]')
                                .forEach((title) => { title.style.display = 'block'; });
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
                        .forEach((table) => {
                        table
                            .forEach((row) => {
                            createHtmlElementForPrayer(row, btnBookOfHours.languages, undefined, div);
                        });
                    });
                    setCSSGridTemplate(Array.from(div.querySelectorAll('div.Row')));
                    applyAmplifiedText(Array.from(div.querySelectorAll('div.Row')));
                    div
                        .querySelectorAll('div.SubTitle')
                        .forEach((subTitle) => collapseText(subTitle, div));
                    if (localStorage.displayMode === displayModes[1]) {
                        //If we are in the 'Presentation Mode'
                        Array.from(div.querySelectorAll('div.Row'))
                            .filter((row) => row.dataset.root.includes('HourPsalm') || row.dataset.root.includes('EndOfHourPrayer'))
                            .forEach(row => row.remove()); //we remove all the psalms and keep only the Gospel and the Litanies,
                        Array.from(rightSideBar.querySelector('#sideBarBtns')
                            .querySelectorAll('div.Row'))
                            .filter((row) => row.dataset.root.includes('HourPsalm') || row.dataset.root.includes('EndOfHourPrayer'))
                            .forEach(row => row.remove()); //We do the same for the titles
                    }
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