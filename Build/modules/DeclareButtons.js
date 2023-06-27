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
        AR: "العودة إلى القائمة الرئيسية",
        FR: "Retour au menu principal",
        EN: "Back to the main menu",
    },
    onClick: () => {
        btnMain.children = [btnMass, btnIncenseOffice, btnDayReadings, btnBookOfHours];
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
    onClick: () => {
        btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
    },
});
const btnIncenseOffice = new Button({
    btnID: "btnIncenseOffice",
    label: {
        AR: "رفع بخور باكر أو عشية",
        FR: "Office des Encens Aube et Soir",
    },
    onClick: () => {
        //setting the children of the btnIncenseOffice. This must be done by the onClick() in order to reset them each time the button is clicked
        btnIncenseOffice.children = [btnIncenseDawn, btnIncenseVespers];
        //show or hide the PropheciesDawn button if we are in the Great Lent or JonahFast:
        if (Season == Seasons.GreatLent || Season == Seasons.JonahFast) {
            //we will remove the btnIncenseVespers from the children of btnIncenseOffice for all the days of the Week except Saturday because there is no Vespers incense office except on Saturday:
            if (todayDate.getDay() != 6 &&
                copticReadingsDate != copticFeasts.Resurrection) {
                btnIncenseOffice.children.splice(btnIncenseOffice.children.indexOf(btnIncenseVespers), 1);
            }
            // we will remove or add the Prophecies Readings button as a child to btnDayReadings depending on the day
            if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) == -1 && //The Prophecies button is not among the children of btnDayReadings
                todayDate.getDay() != 0 && //i.e., we are not a Sunday
                todayDate.getDay() != 6 //i.e., we are not a Saturday
            ) {
                //it means btnReadingsPropheciesDawn does not appear in the Incense Dawn buttons list (i.e., =-1), and we are neither a Saturday or a Sunday, which means that there are prophecies lectures for these days and we need to add the button in all the Day Readings Menu, and the Incense Dawn
                btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn); //We add the Prophecies button at the beginning of the btnIncenseDawn children[], i.e., we add it as the first button in the list of Incense Dawn buttons, the second one is the Gospel
            }
            else if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1 &&
                (todayDate.getDay() == 0 || //i.e., we are a Sunday
                    todayDate.getDay() == 6) //i.e., we are a Saturday
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
                todayDate.getDay() == 6 &&
                btnDayReadings.children.indexOf(btnIncenseVespers) == -1) {
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
        AR: "بخور باكر",
        FR: "Encens Aube",
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
                    AR: "ذكصولوجيات باكر آدام",
                    FR: "Doxologies Adam Aube",
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
        AR: "بخور عشية",
        FR: "Incense Vespers",
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
            if (Season == Seasons.GreatLent &&
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
                    else if (todayDate.getDay() == (0 || 6)) {
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
    label: { AR: "كيرلسي", FR: "Saint Cyril", EN: "St Cyril" },
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
    },
});
const btnMassStGregory = new Button({
    btnID: "btnMassStGregory",
    rootID: "StGregory",
    label: { AR: "غريغوري", FR: "Saint Gregory" },
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
    },
});
const btnMassStBasil = new Button({
    btnID: "btnMassStBasil",
    rootID: "StBasil",
    label: { AR: "باسيلي", FR: "Saint Basil", EN: "St Basil" },
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
        AR: "قداس الموعوظين",
        FR: "Messe des non baptisés",
        EN: "Unbaptised Mass",
    },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    prayersArray: [...PrayersArray],
    languages: [...prayersLanguages],
    onClick: () => {
        //The prayers sequence must be set when the button is clicked
        btnMassUnBaptised.prayersSequence = MassPrayersSequences.MassUnbaptized,
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
            if (isFast)
                //Replace Hellelujah Fay Bibi
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 1);
            if (isFast && Season != Seasons.GreatLent && Season != Seasons.JonahFast)
                //Remove TayShouray
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "Tayshoury&D=$copticFeasts.AnyDay"), 1);
            if (!isFast)
                //Remove 'Hallelujah Ji Efmefi'
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBiFast&D=$copticFeasts.AnyDay"), 1);
            //Remove Tishoury
            btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "Tishoury&D=$copticFeasts.AnyDay"), 1);
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
            reading = btnReadingsStPaul.prayersArray.filter(tbl => baseTitle(tbl[0][0]) == btnReadingsStPaul.prayersSequence[0] + '&D=' + copticReadingsDate);
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
            reading = btnReadingsKatholikon.prayersArray.filter(tbl => baseTitle(tbl[0][0]) == btnReadingsKatholikon.prayersSequence[0] + '&D=' + copticReadingsDate);
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
            reading = btnReadingsPraxis.prayersArray.filter(tbl => baseTitle(tbl[0][0]) == btnReadingsPraxis.prayersSequence[0] + '&D=' + copticReadingsDate);
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
        //Inserting the Gospel Reading
        getGospelReadingAndResponses(Prefix.gospelMass, btnReadingsGospelMass.prayersArray, btnReadingsGospelMass.languages, btnMassUnBaptised.docFragment);
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
                    bookOfHours.forEach((table) => table.forEach((row) => createHtmlElementForPrayer(row, btnBookOfHours.languages, undefined, div)));
                    setCSSGridTemplate(Array.from(div.children));
                    //We will append the titles of the Book of Hours to the right side Bar, with a display 'none'
                    let titles = await showTitlesInRightSideBar(div.querySelectorAll('div.TargetRowTitle'), undefined, false);
                    titles.reverse().forEach((title) => {
                        title.dataset.group = 'bookOfHoursTitle';
                        title.style.display = 'block';
                        rightSideBar.querySelector('#sideBarBtns').children[0].insertAdjacentElement('beforebegin', title);
                    });
                }
            });
            createBtn(bookOfHoursBtn, containerDiv, inlineBtnClass, false, bookOfHoursBtn.onClick);
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
    label: { AR: "قراءات اليوم", FR: "Lectures du jour", EN: "Day's Readings" },
    onClick: () => {
        if (Season == Seasons.HolyWeek) {
            //We should put here child buttons for the Holy Week prayers and readings
            let div = document.createElement('div');
            div.innerText = 'We are during the Holy Week, there are no readings, please go to the Holy Week Prayers';
            containerDiv.appendChild(div);
            return;
        }
        //We set the btnDayReadings.children[] property
        btnDayReadings.children = [
            btnReadingsGospelIncenseVespers,
            btnReadingsGospelIncenseDawn,
            btnReadingsStPaul,
            btnReadingsKatholikon,
            btnReadingsPraxis,
            btnReadingsSynaxarium,
            btnReadingsGospelMass,
        ];
        if (Season == Seasons.GreatLent &&
            todayDate.getDay() != 6 &&
            copticReadingsDate != copticFeasts.Resurrection) {
            //we are during the Great Lent and we are not a Saturday
            if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers) > -1) {
                //There is no Vespers office: we remove the Vespers Gospel from the list of buttons
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers), 1);
            }
            //If, in additon, we are not a Sunday (i.e., we are during any week day other than Sunday and Saturday), we will  add the Prophecies button to the list of buttons
            if (todayDate.getDay() != 0) {
                //We are not a Sunday:
                if (btnDayReadings.children.indexOf(btnReadingsPropheciesDawn) == -1) {
                    btnDayReadings.children.unshift(btnReadingsPropheciesDawn);
                }
                //since we  are not a Sunday, we will also remove the Night Gospel if included
                if (btnDayReadings.children.indexOf(btnReadingsGospelNight) > -1) {
                    btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelNight), 1);
                }
            }
            else if (todayDate.getDay() == 0 &&
                copticReadingsDate != copticFeasts.Resurrection) {
                //However, if we are a Sunday, we add the Night Gospel to the readings list of buttons
                if (btnDayReadings.children.indexOf(btnReadingsGospelNight) == -1) {
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
});
const btnReadingsKatholikon = new Button({
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
});
const btnReadingsPraxis = new Button({
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
});
const btnReadingsSynaxarium = new Button({
    btnID: "btnReadingsSynaxarium",
    label: {
        AR: "السنكسار",
        FR: "Synaxarium",
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
});
const btnReadingsGospelIncenseVespers = new Button({
    btnID: "btnReadingsGospelIncenseVespers",
    label: {
        AR: "إنجيل عشية",
        FR: "Evangile  Vêpres",
        EN: "Vespers Gospel",
    },
    showPrayers: true,
    prayersSequence: [Prefix.gospelVespers + "Psalm", Prefix.gospelVespers + "Gospel"],
    prayersArray: ReadingsArrays.GospelVespersArray,
    languages: [...readingsLanguages],
    onClick: () => {
        let today = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).
        let date = setSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today), today);
        btnReadingsGospelIncenseVespers.prayersSequence[0] += date;
        scrollToTop(); //scrolling to the top of the page
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
    prayersArray: ReadingsArrays.GospelDawnArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnReadingsGospelNight = new Button({
    btnID: "btnReadingsGospelNight",
    label: {
        AR: "إنجيل المساء",
        FR: "Evangile Soir",
        EN: "Vespers Gospel",
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
                if (Season == Seasons.GreatLent) {
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
                else if (Season == Seasons.PentecostalDays
                    || todayDate.getDay() == 0
                    || todayDate.getDay() == 6
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
    else if (Season == Seasons.StMaryFast) {
        //we are during the Saint Mary Fast. There are diffrent gospel responses for Incense Dawn & Vespers
        if (todayDate.getHours() < 15) {
            prayers[gospel] == prayers[gospel].replace("&D=", "Dawn&D=");
        }
        else {
            prayers[gospel] == prayers[gospel].replace("&D=", "Vespers&D=");
        }
        date = Season;
        prayers[psalm] += date;
        prayers[gospel] += date;
    }
    else if (Season == Seasons.Kiahk) {
        // we are during Kiahk month: the first 2 weeks have their own gospel response, and the second 2 weeks have another gospel response
        date = Season;
        if (checkWhichSundayWeAre(Number(copticDay)) == ("1stSunday" || "2ndSunday")) {
            prayers[gospel] = prayers[gospel].replace("&D=", "1&D=");
        }
        else {
            prayers[gospel] = prayers[gospel].replace("&D=", "2&D=");
        }
        prayers[psalm] += "0000";
        prayers[gospel] += date;
    }
    else if (Season == Seasons.GreatLent) {
        //we are during the Great Lent period
        if (copticReadingsDate == copticFeasts.EndOfGreatLentFriday) {
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
        else if (copticReadingsDate == copticFeasts.LazarusSaturday) {
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
            todayDate.getDay() == 0 || todayDate.getDay() == 6
                ? (prayers[gospel] = prayers[gospel].replace("&D=", Seasons.GreatLent + "Sundays&D="))
                : (prayers[gospel] = prayers[gospel].replace("&D=", Seasons.GreatLent + "Week&D="));
        }
        prayers[psalm] += "0000";
        prayers[gospel] += date;
    }
    else if (Season == Seasons.JonahFast) {
        date = Season;
        prayers[gospel] = prayers[gospel].replace("&D=", copticReadingsDate.split(Season)[1] + "&D=");
        prayers[psalm] += "0000";
        prayers[gospel] += date;
    }
    else if (Season == Seasons.PentecostalDays) {
        date = Seasons.PentecostalDays;
        prayers[psalm] += date;
        prayers[gospel] += date;
    }
    else if (Season == Seasons.NoSeason) {
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
    let gospel = goseplReadingsArray.filter((table) => baseTitle(table[0][0]) == responses[1] + copticReadingsDate //this is the pasalm text
        || baseTitle(table[0][0]) == responses[2] + copticReadingsDate //this is the gospel itself
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
            el = gospelIntroduction[gospelIntroduction.length - 2];
        }
        insertPrayersAdjacentToExistingElement([table], languages, {
            beforeOrAfter: 'beforebegin',
            el: el
        });
    });
    //We will insert the Gospel response
    (function insertGospeResponse() {
        let gospelResp = PsalmAndGospelPrayersArray.filter((r) => r[0][0].split('&D=')[0] + '&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) == responses[3]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (gospelResp.length == 0)
            gospelResp = PrayersArray.filter((r) => baseTitle(r[0][0]) == Prefix.commonPrayer + 'GospelResponse&D=$copticFeasts.AnyDay'); //If no specific gospel response is found, we will get the 'annual' gospel response
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
        let psalmResp = PsalmAndGospelPrayersArray.filter((r) => r[0][0].split('&D=')[0] + '&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) == responses[0]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
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
        if (date == copticDate || date == Season) {
            return FractionsPrayersArray.filter((f) => eval(baseTitle(f[0][0].split("&D=")[1]).replace("$", "")) ===
                date || //we use eval() for the case where the value of the date in the title starts with ($)
                baseTitle(f[0][0].split("&D=")[1]) === date || //this is the case where the date is not a variable
                (f[0][0].includes("||") && selectFromMultiDatedTitle(f, date))); //this is the case where there are more than one date
        }
        else {
            return undefined;
        }
    }
    showInlineButtonsForOptionalPrayers(selected, btn, masterBtnDiv, { AR: "صلوات القسمة", FR: "Oraisons de la Fraction" }, "btnFractionPrayers");
}
/**
 * Filters the array containing the gospel text for each liturgie (e.g., Incense Dawn, Vepspers, etc.) and returns the text of the gospel and the psaume. The fil
 * @param {Button} btn - the button of the liturgie within which we want to show the gospel text and the psaume text
 * @param {string[][][]} readingsArray - the array containing the text of the gospel and the psaume. Each element of this array repersents a table in the Word document from which the text was retrieved, and each element of each table[], represents a row of this table
 * @returns {string[][][]} - the result of the filtering operation. This normally returns an array of 2 tables: the first table represents the table of the psaume text, and the 2nd table represents the table of the gospel text
 */
function getBtnGospelPrayersArray(btn, readingsArray) {
    let gospel = readingsArray.filter((r) => {
        baseTitle(r[0][0][0]) == btn.prayersSequence[1] ||
            baseTitle(r[0][0][0]) == btn.prayersSequence[2];
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
        if (date == coptDate) {
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
    else if (Season == Seasons.GreatLent) {
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
        if (todayDate.getDay() == 0 || todayDate.getDay() == 6) {
            //We are during the Great Lent and the day is a Saturday or a Sunday
            doxology = doxology.filter((d) => /GreatLentSundays\&D\=/.test(d[0][0]) == true);
        }
        else {
            doxology = doxology.filter((d) => /GreatLentWeek\d{1}\&D\=/.test(d[0][0]) == true);
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