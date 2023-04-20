var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Button {
    constructor(btn) {
        this._retrieved = false;
        this._btnID = btn.btnID;
        this._label = btn.label;
        this._rootID = btn.rootID;
        this._parentBtn = btn.parentBtn;
        this._children = btn.children;
        this._prayers = btn.prayers;
        this._retrieved = btn.retrieved;
        this._prayersArray = btn.prayersArray;
        this._titlesArray = btn.titlesArray;
        this._languages = btn.languages;
        this._onClick = btn.onClick;
        this._afterShowPrayers = btn.afterShowPrayers;
        this._showPrayers = btn.showPrayers;
        this._pursue = btn.pursue;
        this._value = btn.value;
        btn.cssClass ? this._cssClass = btn.cssClass : this._cssClass = btnClass;
        this._inlineBtns = btn.inlineBtns;
    }
    ;
    //Getters
    get btnID() { return this._btnID; }
    ;
    get children() { return this._children; }
    ;
    get prayers() { return this._prayers; }
    ;
    get retrieved() { return this._retrieved; }
    ;
    get prayersArray() { return this._prayersArray; }
    ;
    get titlesArray() { return this._titlesArray; }
    ;
    get languages() { return this._languages; }
    ;
    get label() { return this._label; }
    ;
    get parentBtn() { return this._parentBtn; }
    ;
    get rootID() { return this._rootID; }
    ;
    get onClick() { return this._onClick; }
    ;
    get afterShowPrayers() { return this._afterShowPrayers; }
    ;
    get showPrayers() { return this._showPrayers; }
    ;
    get pursue() { return this._pursue; }
    ;
    get value() { return this._value; }
    ;
    get cssClass() { return this._cssClass; }
    ;
    get inlineBtns() { return this._inlineBtns; }
    ;
    //Setters
    set btnID(id) { this._btnID = id; }
    ;
    set label(lbl) { this._label = lbl; }
    ;
    set parentBtn(parentBtn) { this._parentBtn = parentBtn; }
    ;
    set prayers(btnPrayers) { this._prayers = btnPrayers; }
    ;
    set retrieved(retrieved) { this._retrieved = retrieved; }
    ;
    set prayersArray(btnPrayersArray) { this._prayersArray = btnPrayersArray; }
    ;
    set titlesArray(titles) { this._titlesArray = titles; }
    ;
    set languages(btnLanguages) { this._languages = btnLanguages; }
    ;
    set onClick(fun) { this._onClick = fun; }
    ;
    set afterShowPrayers(fun) { this._afterShowPrayers = fun; }
    ;
    set showPrayers(showPrayers) { this._showPrayers = showPrayers; }
    ;
    set pursue(pursue) { this._pursue = pursue; }
    ;
    set children(children) { this._children = children; }
    ;
    set cssClass(cssClass) { this._cssClass = cssClass; }
    ;
    set inlineBtns(btns) { this._inlineBtns = btns; }
}
;
const btnMain = new Button({
    btnID: 'btnMain',
    label: { AR: "العودة إلى القائمة الرئيسية", FR: "Retour au menu principal", EN: "Back to the main menu" },
    onClick: () => {
        btnMain.children = [btnMass, btnIncenseOffice, btnDayReadings];
    }
});
const btnGoBack = new Button({
    btnID: 'btnGoBack',
    label: { AR: "السابق", FR: "Retour", EN: "Go Back" },
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
});
const btnMass = new Button({
    btnID: 'btnMass',
    label: { AR: "القداسات", FR: "Messes" },
    onClick: () => {
        btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
    }
});
const btnIncenseOffice = new Button({
    btnID: 'btnIncenseOffice',
    label: {
        AR: "رفع بخور باكر أو عشية",
        FR: "Office des Encens Aube et Soir"
    },
    onClick: () => {
        //setting the children of the btnIncenseOffice. This must be done by the onClick() in order to reset them each time the button is clicked 
        btnIncenseOffice.children = [btnIncenseDawn, btnIncenseVespers];
        //show or hide the PropheciesDawn button if we are in the Great Lent or JonahFast:
        if (Season == Seasons.GreatLent || Season == Seasons.JonahFast) {
            //we will remove the btnIncenseVespers from the children of btnIncenseOffice for all the days of the Week except Saturday because there is no Vespers incense office except on Saturday:
            if (todayDate.getDay() != 6 && copticReadingsDate != copticFeasts.Resurrection) {
                btnIncenseOffice.children.splice(btnIncenseOffice.children.indexOf(btnIncenseVespers), 1);
            }
            ;
            // we will remove or add the Prophecies Readings button as a child to btnDayReadings depending on the day
            if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) == -1 //The Prophecies button is not among the children of btnDayReadings
                && todayDate.getDay() != 0 //i.e., we are not a Sunday
                && todayDate.getDay() != 6 //i.e., we are not a Saturday
            ) {
                //it means btnReadingsPropheciesDawn does not appear in the Incense Dawn buttons list (i.e., =-1), and we are neither a Saturday or a Sunday, which means that there are prophecies lectures for these days and we need to add the button in all the Day Readings Menu, and the Incense Dawn
                btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn); //We add the Prophecies button at the beginning of the btnIncenseDawn children[], i.e., we add it as the first button in the list of Incense Dawn buttons, the second one is the Gospel
            }
            else if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1
                && (todayDate.getDay() == 0 //i.e., we are a Sunday
                    || todayDate.getDay() == 6 //i.e., we are a Saturday
                )) {
                //it means btnReadingsPropheciesDawn appears in the Incense Dawn buttons list, and we are either a Saturday or a Sunday, which means that there are no prophecies for these days and we need to remove the button from all the menus to which it had been added before
                btnIncenseDawn.children.splice(btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn), 1);
            }
            ;
            //removing the vespers prayers if we are not a Saturday, and adding it if we aree
            if (btnDayReadings.children && todayDate.getDay() != 6 && btnDayReadings.children.indexOf(btnIncenseVespers) > -1) {
                //it means we are not a Saturday. we need to remove the btnIncenseVespers because there are not vespers
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnIncenseVespers), 1);
            }
            else if (btnDayReadings.children && todayDate.getDay() == 6 && btnDayReadings.children.indexOf(btnIncenseVespers) == -1) {
                //it means we are  a Saturday. we need to add the btnReadingsGospelIncenseVespers if missing
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelIncenseDawn), 0, btnIncenseVespers);
            }
            ;
        }
        ;
    }
});
const btnIncenseDawn = new Button({
    btnID: 'btnIncenseDawn',
    rootID: 'IncenseDawn',
    label: {
        AR: 'بخور باكر',
        FR: 'Encens Aube'
    },
    prayers: [...IncensePrayers],
    prayersArray: [...CommonPrayersArray, ...IncensePrayersArray],
    showPrayers: true,
    children: [],
    languages: [...prayersLanguages],
    onClick: () => {
        btnIncenseDawn.prayersArray = [...CommonPrayersArray, ...IncensePrayersArray];
        (function setBtnChildrenAndPrayers() {
            //We will set the children of the button:
            btnIncenseDawn.children = [btnReadingsGospelIncenseDawn];
            //we will also set the prayers of the Incense Dawn button
            btnIncenseDawn.prayers = [...IncensePrayers];
        })();
        (function adaptCymbalVerses() {
            //removing the non-relevant Cymbal prayers according to the day of the week: Wates/Adam
            if (todayDate.getDay() > 2) {
                //we are between Wednesday and Saturday, we keep only the "Wates" Cymbal prayers
                btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf("IC_CymbalVersesAdam&D=0000"), 1);
            }
            else {
                //we are Sunday, Monday, or Tuesday. We keep only the "Adam" Cymbal prayers
                btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf("IC_CymbalVersesWates&D=0000"), 1);
            }
            ;
        })();
        (function removeNonRelevantLitanies() {
            //removing the Departed Litany from IncenseDawn prayers
            btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf('IV_DepartedPrayerPart1&D=0000'), 5);
            //removing "Lord keep us this night without sin"
            btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf('IV_LordKeepUsThisNightWithoutSin&D=0000'), 1);
        })();
        (function removeStMaryVespersDoxology() {
            //removing the Wates Vespers' Doxology for St. Mary
            btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf('IV_DoxologyVespersWatesStMary&D=0000'), 1);
        })();
        let index;
        (function removeEklonominTaghonata() {
            //We remove "Eklonomin Taghonata" from the prayers array
            if ((Season != Seasons.GreatLent && Season != Seasons.JonahFast) || (todayDate.getDay() == 0 || todayDate.getDay() == 6)) {
                btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf(Prefix.incenseDawn + 'GodHaveMercyOnUsRefrainComment&D=GL'), 36); //this is the comment, we remove 36 prayers including the comment
            }
            ;
        })();
        //We will then add other prayers according to the season or feast
        (function addKiahkPrayers() {
            if (Number(copticMonth) == 4) {
                index = btnIncenseDawn.prayers.indexOf('ID_DoxologyWatesStMary&D=0000') - 1;
                let doxologies = [];
                DoxologiesPrayersArray.map(p => /DC_\d{1}\&D\=0004/.test(p[0][0]) ? doxologies.push(p[0][0]) : 'do nothing');
                btnIncenseDawn.prayers.splice(index, 0, ...doxologies);
            }
            ;
        })();
        scrollToTop();
        return btnIncenseDawn.prayers;
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        (function addInlineBtnForAdamDoxolgies() {
            //Adding an inline Button for showing the "Adam" Doxologies, and removing the id of the Adam Doxologies from the btn.prayers array
            let btn = new Button({
                btnID: 'AdamDoxologies',
                label: {
                    AR: 'ذكصولوجيات باكر آدام',
                    FR: 'Doxologies Adam Aube'
                },
                cssClass: inlineBtnClass,
                prayers: ['DC_AdamIntorduction&D=0000'],
                prayersArray: DoxologiesPrayersArray,
                languages: btnIncenseDawn.languages,
                inlineBtns: [],
                showPrayers: false,
                onClick: () => {
                    let goBack = new Button({
                        btnID: btnGoBack.btnID,
                        label: btnGoBack.label,
                        cssClass: inlineBtnClass,
                        parentBtn: btnIncenseDawn,
                        onClick: () => newDiv.remove()
                    });
                    showPrayers(btn, true, false); //We show the prayers of btn (clearSideBar = false)
                    //We then create a goBack btn that we will display on top of containerDiv
                    let goBackDiv = document.createElement('div');
                    createBtn(goBack, goBackDiv, btn.cssClass, false);
                    goBackDiv.style.display = 'grid';
                    goBackDiv.id = 'goBack';
                    containerDiv.children[0].insertAdjacentElement('beforebegin', goBackDiv);
                }
            });
            let newDiv = document.createElement('div'); //Creating a div container in which the btn will be displayed
            newDiv.classList.add('inlineBtns');
            createBtn(btn, newDiv, btn.cssClass, true); //creating the html div for the button (which is a div with an 'on click' event listener calling showChildButtonsOrPrayers(btn))
            DoxologiesPrayersArray.map(prayer => {
                if (prayer[0][0].startsWith('DC_Adam')) {
                    //adding the id of the prayer to the prayers of the inline button that we created
                    btn.prayers.push(prayer[0][0]);
                    //then removing the prayer id from the btnIncenseDawn.prayers array in order to exclude them unless requested by the user by clicking on the inline button
                    btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf(prayer[0][0]), 1);
                }
                ;
            });
            containerDiv.children[0].insertAdjacentElement('beforebegin', newDiv); //Inserting the div containing the button as 1st element of containerDiv
        })();
        (function addGreatLentPrayers() {
            return __awaiter(this, void 0, void 0, function* () {
                let doxologies;
                if (Season != Seasons.GreatLent || copticReadingsDate == copticFeasts.Resurrection) {
                    return;
                }
                else if (todayDate.getDay() != 0 && todayDate.getDay() != 6) {
                    //We are neither a Saturday nor a Sunday, we will hence display the Prophecies dawn buton
                    (function showPropheciesDawnBtn() {
                        //If we are during any day of the week, we will add the Prophecies readings to the children of the button
                        if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) == -1) {
                            btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
                        }
                        ;
                    })();
                }
                else if (todayDate.getDay() == 0 || todayDate.getDay() == 6) {
                }
                ;
                (function removeEklonominTaghonataExcessiveTitles() {
                    return __awaiter(this, void 0, void 0, function* () {
                        let titles = containerDiv.querySelectorAll('div[data-root="ID_GodHaveMercyOnUsRefrain&D=GL"]');
                        if (titles) {
                            for (let i = 7; i < titles.length; i += 7) {
                                titles[i].remove();
                            }
                        }
                        ;
                        let links = rightSideBar.querySelector('#sideBarBtns').querySelectorAll('a[href*="#ID_GodHaveMercyOnUsRefrain"');
                        for (let i = 1; i < links.length; i++) {
                            links[i].remove();
                        }
                        ;
                    });
                })();
            });
        })();
        (function insertCymbalVersesAndDoxologiesForFeastsAndSeasons() {
            return __awaiter(this, void 0, void 0, function* () {
                if (copticDate == copticFeasts.Nayrouz) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.Nayrouz });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.Nayrouz });
                }
                else if (copticDate == copticFeasts.Cross) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.Cross });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.Cross });
                }
                else if (Season == Seasons.Kiahk) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: Seasons.Kiahk });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: Seasons.Kiahk });
                }
                else if (copticDate == copticFeasts.NativityParamoun) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.NativityParamoun });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.NativityParamoun });
                }
                else if (copticDate == copticFeasts.Circumcision) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.Circumcision });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.Circumcision });
                }
                else if (copticDate == copticFeasts.BaptismParamoun) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.BaptismParamoun });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.BaptismParamoun });
                }
                else if (copticDate == copticFeasts.Baptism) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.Baptism });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.Baptism });
                }
                else if (copticDate == copticFeasts.CanaWedding) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.CanaWedding });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.CanaWedding });
                }
                else if (copticDate == copticFeasts.EntryToTemple) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.EntryToTemple });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.EntryToTemple });
                }
                else if (copticDate == copticFeasts.Annonciation) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.Annonciation });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.Annonciation });
                }
                else if (Season == Seasons.GreatLent) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: Seasons.GreatLent, remove: true });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: Seasons.GreatLent });
                }
                else if (copticReadingsDate == copticFeasts.LazarusSaturday) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.LazarusSaturday });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.LazarusSaturday });
                }
                else if (copticReadingsDate == copticFeasts.PalmSunday) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.PalmSunday });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.PalmSunday });
                }
                //The order during the pentecostal days is important. We start by the last event (Pentecoste), then the "Ascension", and finally the general case which is Seasons.PentecostalDays
                else if (copticReadingsDate == copticFeasts.Pentecoste) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.Pentecoste, remove: true });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.Pentecoste });
                    let stMaykelRoot = Prefix.commonIncense + 'ArchangelMichaelWates&D=0000';
                    moveBlockOfRowsAdjacentToAnElement(stMaykelRoot, 'beforebegin', containerDiv.querySelectorAll('div[data-root="' + Prefix.commonDoxologies + 'Wates2&D=$Seasons.PentecostalDays' + '"]'));
                    //Removing Archange Maykel's Doxology (it is replaced by another one)
                    removeElementsByTheirDataRoot(stMaykelRoot);
                }
                else if (copticReadingsDate == copticFeasts.Ascension || Number(copticReadingsDate.split(Seasons.PentecostalDays)[1]) > 39) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.Ascension, remove: true });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.Ascension });
                    let stMaykelRoot = Prefix.commonIncense + 'ArchangelMichaelWates&D=0000';
                    moveBlockOfRowsAdjacentToAnElement(stMaykelRoot, 'beforebegin', containerDiv.querySelectorAll('div[data-root="' + Prefix.commonDoxologies + 'Wates2&D=$Seasons.PentecostalDays' + '"]'));
                    //Removing Archange Maykel's Doxology (it is replaced by another one)
                    removeElementsByTheirDataRoot(stMaykelRoot);
                }
                else if (Season == Seasons.PentecostalDays) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: Seasons.PentecostalDays, remove: true });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: Seasons.PentecostalDays });
                    let stMaykelRoot = Prefix.commonIncense + 'ArchangelMichaelWates&D=0000';
                    moveBlockOfRowsAdjacentToAnElement(stMaykelRoot, 'beforebegin', containerDiv.querySelectorAll('div[data-root="' + Prefix.commonDoxologies + 'Wates2&D=$Seasons.PentecostalDays' + '"]'));
                    //Removing Archange Maykel's Doxology (it is replaced by another one)
                    removeElementsByTheirDataRoot(stMaykelRoot);
                }
                else if (copticDate == copticFeasts.EntryToEgypt) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.EntryToEgypt });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.EntryToEgypt });
                }
                else if (copticDate == copticFeasts.Epiphany) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.Epiphany });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.Epiphany });
                }
                else if (copticDate == copticFeasts.theTwentyNinethOfCopticMonth) {
                    //Inserting Cymbal Verses
                    insertCymbalVersesForFeastsAndSeasons({ coptDate: copticFeasts.theTwentyNinethOfCopticMonth });
                    insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.theTwentyNinethOfCopticMonth });
                }
            });
        })();
        insertGospelReadings(Prefix.gospelDawn, btnReadingsGospelIncenseDawn.prayersArray, btnReadingsGospelIncenseDawn.languages);
    })
});
const btnIncenseVespers = new Button({
    btnID: 'btnIncenseVespers',
    label: {
        AR: "بخور عشية",
        FR: 'Incense Vespers'
    },
    prayers: [...IncensePrayers],
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnIncenseVespers.prayersArray = [...CommonPrayersArray, ...IncensePrayersArray];
        (function removingNonRelevantLitanies() {
            //removing the Sick Litany
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('  ID_SickPrayerPart1&D=0000'), 5);
            //removing the Travelers Litany from IncenseVespers prayers
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('ID_TravelersPrayerPart1Date=0000'), 5);
            //removing the Oblations Litany from IncenseVespers paryers
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('ID_OblationsPrayerPart1Date=0000'), 5);
            //removing the Dawn Doxology for St. Mary
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('ID_DoxologyWatesStMary&D=0000'), 1);
            //removing the Angels' prayer
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('PC_AngelsPrayer&D=0000'), 1);
        })();
        (function adaptCymbalVerses() {
            //removing the non-relevant Cymbal prayers according to the day of the week: Wates/Adam
            if (todayDate.getDay() > 2) {
                //we are between Wednesday and Saturday, we keep only the "Wates" Cymbal prayers
                btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf("IC_CymbalVersesAdam&D=0000"), 1);
            }
            else {
                //we are Sunday, Monday, or Tuesday. We keep only the "Adam" Cymbal prayers
                btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf("IC_CymbalVersesWates&D=0000"), 1);
            }
            ;
        })();
        (function removeEklonominTaghonata() {
            //We remove "Eklonomin Taghonata" from the prayers array                           
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf(Prefix.incenseDawn + 'GodHaveMercyOnUsRefrainComment&D=' + Seasons.GreatLent), 36); //this is the comment, we remove 36 prayers including the comment
        })();
        (function addGreatLentPrayers() {
            if (Season == Seasons.GreatLent && todayDate.getDay() != 0 && todayDate.getDay() != 6) {
                //We will then add the GreatLent  Doxologies to the Doxologies before the first Doxology of St. Mary
                (function addGreatLentDoxologies() {
                    let index = btnIncenseDawn.prayers.indexOf('IV_DoxologyVespersWatesStMary&D=0000');
                    let doxologies = [];
                    DoxologiesPrayersArray.map(p => /DC_\d{1}\&D\=GLWeek/.test(p[0][0]) ? doxologies.push(p[0][0]) : 'do nothing');
                    if (todayDate.getDay() != 0 && todayDate.getDay() != 6) {
                        btnIncenseVespers.prayers.splice(index, 0, ...doxologies);
                    }
                    else if (todayDate.getDay() == (0 || 6)) {
                        btnIncenseVespers.prayers.splice(index, 0, 'DC_&D=GLSundays');
                    }
                    ;
                })();
            }
        })();
        scrollToTop();
        return btnIncenseVespers.prayers;
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        insertGospelReadings(Prefix.gospelVespers, btnReadingsGospelIncenseVespers.prayersArray, btnReadingsGospelIncenseVespers.languages);
    })
});
const btnMassStCyril = new Button({
    btnID: 'btnMassStCyril',
    rootID: 'StCyril',
    label: { AR: "كيرلسي", FR: "Saint Cyril", EN: "St Cyril" },
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStCyril.prayersArray = [...CommonPrayersArray, ...MassCommonPrayersArray, ...MassStCyrilPrayersArray];
        if (btnsPrayers[btns.indexOf(btnMassStCyril)]) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
            btnMassStCyril.prayers = btnsPrayers[btns.indexOf(btnMassStCyril)];
            return;
        }
        ;
        //Setting the standard mass prayers sequence
        btnMassStCyril.prayers = [...MassPrayers.MassCommonIntro, ...MassPrayers.MassStCyril, ...["MC_TheHolyBodyAndTheHolyBlodPart3&D=0000",
                "PC_KyrieElieson&D=0000",
                "PC_BlockIriniPassi&D=0000",
                "MC_FractionPrayerPlaceholder&D=0000",
                "PC_OurFatherWhoArtInHeaven&D=0000",
                "MC_Confession&D=0000",
                "MC_ConfessionComment&D=0000"], ...MassPrayers.Communion];
        return btnMassStCyril.prayers;
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        showFractionsMasterButton(btnMassStCyril);
        //Adding 2 buttons to redirect to the St Basil or St Gregory Reconciliation prayer
        redirectToAnotherMass(containerDiv.querySelector('div[data-root*="Reconciliation&D=0000"]'), [btnMassStBasil, btnMassStGregory, btnMassStJohn], "afterend");
        //Adding 2 buttons to redirect to the St Basil or St Gregory Anaphora prayer
        //After "By the intercession of the Virgin St. Mary"
        redirectToAnotherMass(containerDiv.querySelector('div[data-root*="Anaphora&D=0000"]'), [btnMassStBasil, btnMassStGregory], "afterend");
        //Before Agios
        let Agios = containerDiv.querySelector('div[data-root="' + Prefix.massCommon + 'Agios&D=0000' + '"]'); //this will give the 1st "Agios"
        redirectToAnotherMass(Agios, [btnMassStBasil, btnMassStGregory], "beforebegin");
        scrollToTop(); //scrolling to the top of the page
    })
});
const btnMassStGregory = new Button({
    btnID: 'btnMassStGregory',
    rootID: 'StGregory',
    label: { AR: "غريغوري", FR: "Saint Gregory" },
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStGregory.prayersArray = [...CommonPrayersArray, ...MassCommonPrayersArray, ...MassStGregoryPrayersArray];
        if (btnsPrayers[btns.indexOf(btnMassStGregory)]) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
            btnMassStGregory.prayers = btnsPrayers[btns.indexOf(btnMassStGregory)];
            return;
        }
        ;
        //Setting the standard mass prayers sequence
        btnMassStGregory.prayers = [...MassPrayers.MassCommonIntro, ...MassPrayers.MassStGregory, ...MassPrayers.MassCallOfHolySpirit, ...MassPrayers.MassLitanies, ...MassPrayers.Communion];
        //removing irrelevant prayers from the array
        btnMassStGregory.prayers.splice(btnMassStGregory.prayers.indexOf('MC_CallOfTheHolySpiritPart1Comment&D=0000'), 10);
        scrollToTop();
        return btnMassStGregory.prayers;
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        showFractionsMasterButton(btnMassStGregory);
        //Adding 3 buttons to redirect to the St Basil or St Cyril Reconciliation prayer
        redirectToAnotherMass(containerDiv.querySelector('div[data-root*="Reconciliation&D=0000"]'), [btnMassStBasil, btnMassStCyril, btnMassStJohn], "afterend");
        //Adding 2 buttons to redirect to the St Basil or St Gregory Anaphora prayer
        //After "By the intercession of the Virgin St. Mary"
        redirectToAnotherMass(containerDiv.querySelector('div[data-root*="Anaphora&D=0000"]'), [btnMassStBasil, btnMassStCyril], "afterend");
        //Before Agios
        let Agios = containerDiv.querySelector('div[data-root="' + Prefix.massCommon + 'Agios&D=0000' + '"]'); //this will give the 1st "Agios"
        redirectToAnotherMass(Agios, [btnMassStBasil, btnMassStCyril], "beforebegin");
        scrollToTop(); //scrolling to the top of the page                
    })
});
const btnMassStBasil = new Button({
    btnID: 'btnMassStBasil',
    rootID: 'StBasil',
    label: { AR: 'باسيلي', FR: 'Saint Basil', EN: 'St Basil' },
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStBasil.prayersArray = [...CommonPrayersArray, ...MassCommonPrayersArray, ...MassStBasilPrayersArray];
        //Setting the standard mass prayers sequence
        btnMassStBasil.prayers = [...MassPrayers.MassCommonIntro, ...MassPrayers.MassStBasil, ...MassPrayers.MassCallOfHolySpirit, ...MassPrayers.MassLitanies, ...MassPrayers.Communion];
        //We scroll to the beginning of the page after the prayers have been displayed
        scrollToTop();
        return btnMassStBasil.prayers;
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        showFractionsMasterButton(btnMassStBasil);
        //We add buttons to redirect to the other Reconciliation masses
        redirectToAnotherMass(containerDiv.querySelector('div[data-root*="Reconciliation&D=0000"]'), [btnMassStGregory, btnMassStCyril, btnMassStJohn], "afterend");
        //After "By the intercession of the Virgin St. Mary"
        redirectToAnotherMass(containerDiv.querySelector('div[data-root*="Anaphora&D=0000"]'), [btnMassStGregory, btnMassStCyril], "afterend");
        //Before Agios
        let Agios = containerDiv.querySelector('div[data-root="' + Prefix.massCommon + 'Agios&D=0000' + '"]'); //this will give the 1st "Agios"
        redirectToAnotherMass(Agios, [btnMassStGregory, btnMassStCyril], "beforebegin");
    })
});
const btnMassStJohn = new Button({
    btnID: 'btnMassStJohn',
    label: { AR: 'القديس يوحنا', FR: 'Saint Jean' },
    showPrayers: false,
    prayers: [],
    onClick: () => {
        btnMassStJohn.prayersArray = [...CommonPrayersArray, ...MassCommonPrayersArray, ...MassStJohnPrayersArray];
        scrollToTop(); //scrolling to the top of the page
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        showFractionsMasterButton(btnMassStJohn);
    })
});
const goToAnotherMass = [
    new Button({
        btnID: 'btnGoToStBasilReconciliation',
        label: { AR: ' باسيلي', FR: ' Saint Basil' },
        cssClass: inlineBtnClass,
        onClick: () => {
            showChildButtonsOrPrayers(btnMassStBasil);
        }
    }),
    new Button({
        btnID: 'btnGoToStGregoryReconciliation',
        label: { AR: 'غريغوري', FR: ' Saint Gregory' },
        cssClass: inlineBtnClass,
        onClick: () => {
            showChildButtonsOrPrayers(btnMassStGregory);
        }
    }),
    new Button({
        btnID: 'btnGoToStCyrilReconciliation',
        label: { AR: 'كيرلسي', FR: 'Saint Cyril' },
        cssClass: inlineBtnClass,
        onClick: () => {
            showChildButtonsOrPrayers(btnMassStCyril);
        }
    }),
    new Button({
        btnID: 'btnGoToStJeanReconciliation',
        label: { AR: 'القديس يوحنا', FR: 'Saint Jean' },
        cssClass: inlineBtnClass,
        rootID: 'StJohn',
        parentBtn: btnMass,
        onClick: () => {
            showChildButtonsOrPrayers(btnMassStJohn);
        }
    })
];
const btnMassUnBaptised = new Button({
    btnID: 'btnMassUnBaptised',
    label: { AR: 'قداس الموعوظين', FR: 'Messe des non baptisés', EN: 'Unbaptised Mass' },
    prayers: MassPrayers.MassUnbaptized,
    prayersArray: PrayersArray,
    languages: [...prayersLanguages],
    onClick: () => {
        //Adding children buttons to btnMassUnBaptised
        btnMassUnBaptised.children = [btnReadingsStPaul, btnReadingsKatholikon, btnReadingsPraxis, btnReadingsSynaxarium, btnReadingsGospelMass];
        //Replacing AllelujaFayBabi according to the day
        (function replaceAllelujahFayBabi() {
            if (isFast) {
                //Replace Hellelujah Fay Bibi
                btnMassUnBaptised.prayers.splice(btnMassUnBaptised.prayers.indexOf('PMCHallelujahFayBiBi&D=0000'), 1);
                if (Season != Seasons.GreatLent && Season != Seasons.JonahFast) {
                    //Remove TayShouray
                    btnMassUnBaptised.prayers.splice(btnMassUnBaptised.prayers.indexOf('PMCTayshoury&D=0000'), 1);
                }
            }
            else {
                //Remove 'Hallelujah Ji Efmefi'
                btnMassUnBaptised.prayers.splice(btnMassUnBaptised.prayers.indexOf('PMCHallelujahFayBiBiFast&D=0000'), 1);
                //Remove Tishoury
                btnMassUnBaptised.prayers.splice(btnMassUnBaptised.prayers.indexOf('PMCTishoury&D=0000'), 1);
            }
            ;
        })();
        scrollToTop();
        return btnMassUnBaptised.prayers;
    }
});
const btnMassBaptised = new Button({
    btnID: 'btnMassBaptised',
    label: {
        AR: 'قداس المؤمنين',
        FR: 'Messe des Croyants',
        EN: 'Baptized Mass'
    },
    parentBtn: btnMass,
    children: [btnMassStBasil, btnMassStCyril, btnMassStGregory, btnMassStJohn]
});
const btnDayReadings = new Button({
    btnID: 'btnDayReadings',
    label: { AR: "قراءات اليوم", FR: "Lectures du jour", EN: 'Day\'s Readings' },
    onClick: () => {
        //We set the btnDayReadings.children[] property
        btnDayReadings.children = [btnReadingsGospelIncenseVespers, btnReadingsGospelIncenseDawn, btnReadingsStPaul, btnReadingsKatholikon, btnReadingsPraxis, btnReadingsSynaxarium, btnReadingsGospelMass];
        if (Season == Seasons.GreatLent && todayDate.getDay() != 6 && copticReadingsDate != copticFeasts.Resurrection) {
            //we are during the Great Lent and we are not a Saturday
            if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers) > -1) {
                //There is no Vespers office: we remove the Vespers Gospel from the list of buttons
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers), 1);
            }
            ;
            //If, in additon, we are not a Sunday (i.e., we are during any week day other than Sunday and Saturday), we will  add the Prophecies button to the list of buttons
            if (todayDate.getDay() != 0) {
                //We are not a Sunday:
                if (btnDayReadings.children.indexOf(btnReadingsPropheciesDawn) == -1) {
                    btnDayReadings.children.unshift(btnReadingsPropheciesDawn);
                }
                ;
                //since we  are not a Sunday, we will also remove the Night Gospel if included
                if (btnDayReadings.children.indexOf(btnReadingsGospelNight) > -1) {
                    btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelNight), 1);
                }
                ;
            }
            else if (todayDate.getDay() == 0 && copticReadingsDate != copticFeasts.Resurrection) {
                //However, if we are a Sunday, we add the Night Gospel to the readings list of buttons
                if (btnDayReadings.children.indexOf(btnReadingsGospelNight) == -1) {
                    // (we do not add it to the Unbaptized mass menu because it is not read during the mass)
                    btnDayReadings.children.push(btnReadingsGospelNight);
                }
                ;
            }
            ;
        }
        ;
    }
});
const btnReadingsStPaul = new Button({
    btnID: 'btnReadingsStPaul',
    label: {
        AR: 'البولس',
        FR: 'Epître de Saint Paul',
        EN: 'Pauline Epistle'
    },
    showPrayers: true,
    prayers: [Prefix.stPaul],
    prayersArray: ReadingsArrays.StPaulArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
});
const btnReadingsKatholikon = new Button({
    btnID: 'btnReadingsKatholikon',
    label: {
        AR: 'الكاثوليكون',
        FR: 'Katholikon'
    },
    showPrayers: true,
    prayers: [Prefix.katholikon],
    prayersArray: ReadingsArrays.KatholikonArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
});
const btnReadingsPraxis = new Button({
    btnID: 'btnReadingsPraxis',
    label: {
        AR: 'الإبركسيس',
        FR: 'Praxis'
    },
    showPrayers: true,
    prayers: [Prefix.praxis],
    prayersArray: ReadingsArrays.PraxisArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
});
const btnReadingsSynaxarium = new Button({
    btnID: 'btnReadingsSynaxarium',
    label: {
        AR: 'السنكسار',
        FR: 'Synaxarium'
    },
    showPrayers: true,
    prayersArray: ReadingsArrays.SynaxariumArray,
    languages: ['FR', 'AR'],
    onClick: () => {
        btnReadingsSynaxarium.prayers = [Prefix.synaxarium + '&D=' + copticDate],
            scrollToTop(); //scrolling to the top of the page
    }
});
const btnReadingsGospelMass = new Button({
    btnID: 'btnReadingsGospelMass',
    label: {
        AR: 'إنجيل القداس',
        FR: 'l\'Evangile',
        EN: 'Gospel'
    },
    showPrayers: true,
    prayers: [Prefix.gospelMass + 'Psalm', Prefix.gospelMass + 'Gospel'],
    prayersArray: ReadingsArrays.GospelMassArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
});
const btnReadingsGospelIncenseVespers = new Button({
    btnID: 'btnReadingsGospelIncenseVespers',
    label: {
        AR: 'إنجيل عشية',
        FR: 'Evangile  Vêpres',
        EN: 'Vespers Gospel'
    },
    showPrayers: true,
    prayers: [Prefix.gospelVespers + 'Psalm', Prefix.gospelVespers + 'Gospel'],
    prayersArray: ReadingsArrays.GospelVespersArray,
    languages: [...readingsLanguages],
    onClick: () => {
        let today = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday). 
        let date = setSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today), today);
        btnReadingsGospelIncenseVespers.prayers[0] += date;
        scrollToTop(); //scrolling to the top of the page
    }
});
const btnReadingsGospelIncenseDawn = new Button({
    btnID: 'btnReadingsGospelIncenseDawn',
    label: {
        AR: 'إنجيل باكر',
        FR: 'Evangile Aube',
        EN: 'Gospel Dawn'
    },
    showPrayers: true,
    prayers: [Prefix.gospelDawn + 'Psalm', Prefix.gospelDawn + 'Gospel'],
    prayersArray: ReadingsArrays.GospelDawnArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
});
const btnReadingsGospelNight = new Button({
    btnID: 'btnReadingsGospelNight',
    label: {
        AR: 'إنجيل المساء',
        FR: 'Evangile Soir',
        EN: 'Vespers Gospel'
    },
    showPrayers: true,
    prayers: [Prefix.gospelNight + 'Psalm', Prefix.gospelNight + 'Gospel'],
    prayersArray: ReadingsArrays.GospelNightArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
});
const btnReadingsPropheciesDawn = new Button({
    btnID: 'btnReadingsPropheciesDawn',
    label: {
        AR: "نبوات باكر",
        FR: 'Propheties Matin'
    },
    showPrayers: true,
    parentBtn: btnIncenseDawn,
    prayers: [Prefix.propheciesDawn],
    prayersArray: ReadingsArrays.PropheciesDawnArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
});
/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayers(liturgie) {
    //this function sets the date or the season for the Psalm response and the gospel response
    let prayers = [...GospelPrayers], date;
    let psalm = prayers.indexOf(Prefix.psalmResponse), gospel = prayers.indexOf(Prefix.gospelResponse);
    prayers.forEach(p => prayers[prayers.indexOf(p)] = p + '&D='); //we add '&D=' to each element of prayer
    //we replace the word 'Mass' in 'ReadingsGospelMass' by the liturige, e.g.: 'IncenseDawn'
    prayers[psalm + 1] = prayers[psalm + 1].replace(Prefix.gospelMass, liturgie);
    prayers[psalm + 2] = prayers[psalm + 2].replace(Prefix.gospelMass, liturgie);
    //setting the psalm and gospel responses
    if (Number(copticDay) == 29 && Number(copticMonth) != 4) {
        //we on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast)
        date = '2900';
        setResponse(psalm, date);
        setResponse(gospel, date);
    }
    else if (Season == Seasons.StMaryFast) {
        //we are during the Saint Mary Fast. There are diffrent gospel responses for Incense Dawn & Vespers
        if (todayDate.getHours() < 15) {
            prayers[gospel] == prayers[gospel].replace('&D=', 'Dawn&D=');
        }
        else {
            prayers[gospel] == prayers[gospel].replace('&D=', 'Vespers&D=');
        }
        ;
        date = Season;
        setResponse(gospel, date);
        setResponse(psalm, '0000');
    }
    else if (Number(copticMonth) == 4) {
        // we are during Kiahk month: the first 2 weeks have their own gospel response, and the second 2 weeks have another gospel response
        checkWhichSundayWeAre(Number(copticDay)) == ('1stSunday' || '2ndSunday') ? date = '&D=041stSunday' : date = '&D=043rdSunday';
        setResponse(psalm, date);
        setResponse(gospel, '0000');
    }
    else if (Season == Seasons.GreatLent) {
        //we are during the Great Lent period
        if (copticReadingsDate == copticFeasts.LazarusSaturday) {
            if (todayDate.getHours() < 15) {
                //We are in the morning
                date = copticFeasts.LazarusSaturday;
            }
            else {
                //We are in the Vespers of the Palm Sunday
                date = copticFeasts.PalmSunday;
                prayers[gospel] = prayers[gospel].replace('&D=', 'Vespers&D=');
            }
            ;
        }
        else if (copticReadingsDate == copticFeasts.EndOfGreatLentFriday && todayDate.getHours() > 15) {
            //we are in the Vespers of Lazarus Saturday
            prayers[gospel] = prayers[gospel].replace('&D=', 'Vespers&D=');
            date = copticFeasts.LazarusSaturday;
        }
        else {
            todayDate.getDay() == 0 || todayDate.getDay() == 6 ? date = Season + 'Sundays' : date = Season + 'Week';
        }
        ;
        setResponse(gospel, date);
        setResponse(psalm, '0000');
    }
    else if ((() => {
        let x = 0;
        Object.keys(copticFeasts).map(k => {
            if (copticDate == copticFeasts[k]) {
                x = 1;
            }
            ;
        });
        return x;
    })() == 1
        || //we check if copticDate = the value of any of the feasts dates in copticFeasts object
            [Seasons.JonahFast + '1', Seasons.JonahFast + '2', Seasons.JonahFast + '3', Seasons.JonahFast + '4'].indexOf(copticDate) > -1 //those are the 4 days of the Jonah fast
    ) {
        //if coptiDate equals one of the coptic feasts in the copticFeasts object, we set the psalm and gospel prayers to the copticDate
        date = copticDate;
        setResponse(psalm, date);
        setResponse(gospel, date);
    }
    else if (Season == Seasons.NoSeason) {
        date = '0000';
        setResponse(psalm, date);
        setResponse(gospel, date);
    }
    ;
    function setResponse(index, date) {
        prayers[index] += date;
    }
    ;
    // prayers[1] += copticReadingsDate; //We add the date to the psalm reading, which should give an element like "RGMPsalm&D=[copticReadingsDate]"
    // prayers[2] += copticReadingsDate; //We add the date to the gospem reading, which should give an element like "RGMGospel&D=[copticReadingsDate]"
    return prayers;
}
;
let btnsPrayers = [];
let btns = [btnIncenseDawn, btnIncenseVespers, btnMassStCyril, btnMassStBasil, btnMassStGregory];
/**
 *
 * @param {HTMLDivElement} targetElement - the html child of containerDiv, to which the newly created div containing the html button elements, will be placed according to a given position
 * @param {Button[]} btns - a list of Button for each we will create an inline redirection html button
 * @param {InsertPosition} position - the position where the newly created div containing the html elements, will be placed compared to targetEelement
 */
function redirectToAnotherMass(targetElement, btns, position) {
    return __awaiter(this, void 0, void 0, function* () {
        let redirectTo = [];
        btns.map(btn => {
            let newBtn = new Button({
                btnID: 'GoTo' + targetElement.dataset.root + 'From' + btn.rootID,
                label: {
                    AR: btn.label.AR,
                    FR: btn.label.FR,
                },
                cssClass: inlineBtnClass,
                onClick: () => {
                    if (targetElement) {
                        showChildButtonsOrPrayers(btn); //We simulated as if btn itself has been clicked, which will show all its prayers, children, etc.
                        if (containerDiv.querySelector('div[data-root="' + targetElement.dataset.root + '"')) {
                            //if there is an element in containerDiv having the same data-root as targetElement
                            let target = containerDiv.querySelector('div[data-root="' + targetElement.dataset.root + '"');
                            if (!target.id) {
                                //if it hasn't an id, we will give it one
                                target.id = 'redirectedFrom' + btn.btnID;
                            }
                            ;
                            createFakeAnchor(target.id);
                        }
                    }
                }
            });
            redirectTo.push(newBtn);
        });
        insertRedirectionButtons(targetElement, redirectTo, position);
    });
}
;
function scrollToTop() {
    return __awaiter(this, void 0, void 0, function* () {
        //We scroll to the beginning of the page after the prayers have been displayed
        createFakeAnchor(containerDiv.id);
    });
}
;
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
        prayers[1] += '&D=' + readingsDate; //we add the reading date to 
        return prayers;
    }
    else {
        prayers[1] + "&D=" + copticReadingsDate;
        return prayers;
    }
}
;
function insertGospelReadings(liturgy, goseplReadingsArray, languages) {
    return __awaiter(this, void 0, void 0, function* () {
        if (new Map(JSON.parse(localStorage.showActors)).get('Diacon') == false) {
            alert("Diacon Prayers are set to hidden, we cannot show the gospel");
            return;
        }
        ; //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers
        let gospelRespHtml = containerDiv.querySelectorAll('div[data-root="' + Prefix.commonPrayer + 'GospelResponse&D=0000"]'); //This is the html element where the so called 'annual' gospel response is displayed, we will insert the retrieved gospel text and gospel response before it, and will delete it afterwards
        let psalmReadingHtml = containerDiv.querySelectorAll('div[data-root="' + Prefix.commonPrayer + "GospelIntroductionPart2&D=0000".replace(/Part\d+/, '') + '"]')[4]; //This is the html element after which we will insert the psalm
        let responses = setGospelPrayers(liturgy); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']
        let root;
        //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
        let g = goseplReadingsArray.filter(table => table[0][0].split('&C=')[0] == responses[1] + copticReadingsDate ||
            table[0][0].split('&C=')[0] == responses[2] + copticReadingsDate); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####"
        if (g.length < 1) {
            return;
        }
        ; //if no readings are returned from the filtering process, then we end the function
        let position = {
            beforeOrAfter: 'beforebegin',
            el: psalmReadingHtml
        };
        g.map(table => {
            root = table[0][0].split('&C=')[0]; //this is the title of the table without any '&C=*' at its end
            table.map(row => {
                if (row[0].includes('Gospel&D=')) {
                    position.beforeOrAfter = 'beforebegin';
                    position.el = gospelRespHtml[0];
                }
                //For each row in the Gospel table, we will create and html element, and will insert it before the element representing the introduction to the gospel
                createHtmlElementForPrayer(root, row, languages, JSON.parse(localStorage.userLanguages), row[0].split('&C=')[1], position);
            });
        });
        //We will insert the Psalm response
        (function insertPsalmResponse() {
            let gospelPrayer = containerDiv.querySelectorAll('div[data-root="' + Prefix.commonPrayer + 'GospelPrayer&D=0000"]');
            let psalmResp = PsalmAndGospelPrayersArray.filter(r => r[0][0].split('&C=')[0] == responses[0]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
            insertResponse(psalmResp, { beforeOrAfter: 'afterend', el: gospelPrayer[gospelPrayer.length - 1] });
        })();
        //We will now insert the Gospel response
        (function insertGospeResponse() {
            let gospelResp = PsalmAndGospelPrayersArray.filter(r => r[0][0].split('&C=')[0] == responses[3]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
            if (!gospelResp) {
                return;
            }
            ;
            insertResponse(gospelResp, {
                beforeOrAfter: 'beforebegin',
                el: gospelRespHtml[0]
            });
            gospelRespHtml.forEach(html => html.remove()); //we finally delete all the elements having the same data-root value as responseHtml, in order to keep only  the more adapted gospel reponse
        })();
        function insertResponse(filteredResp, position) {
            if (filteredResp.length > 0) {
                //if a gospel response is found
                root = filteredResp[0][0][0].split('&C=')[0];
                filteredResp.map(table => {
                    table.map(row => {
                        //for each row in the gospel response table that we retrieved, we wil create an html element and will insert it before responseHtml
                        createHtmlElementForPrayer(root, row, prayersLanguages, JSON.parse(localStorage.userLanguages), row[0].split('&C=')[1], position);
                    });
                });
            }
            ;
        }
        ;
    });
}
;
function showFractionsMasterButton(btn) {
    let selected = [], filtered;
    let insertion = containerDiv.querySelector('[data-root="' + Prefix.massCommon + 'FractionPrayerPlaceholder&D=0000"]'); //this is the id of the html element after which we will insert the inline buttons for the fraction prayers
    let masterBtnDiv = document.createElement('div'); //a new element to which the inline buttons elements will be appended
    insertion.insertAdjacentElement('afterend', masterBtnDiv); //we insert the div after the insertion position 
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
    filtered = FractionsPrayersArray.filter(fraction => fraction[0][0].includes('&D=0000') || fraction[0][0].includes('||0000'));
    pushIfItNotExisting(filtered);
    function pushIfItNotExisting(filtered) {
        if (filtered) {
            filtered.map(f => {
                if (selected.indexOf(f) < 0) {
                    selected.push(f);
                }
            });
        }
    }
    function filterFractions(date) {
        if (date == copticDate || date == Season) {
            return FractionsPrayersArray.filter(f => eval(f[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) === date //we use eval() for the case where the value of the date in the title starts with ($)
                || f[0][0].split('&D=')[1].split('&C=')[0] === date //this is the case where the date is not a variable
                || (f[0][0].includes('||') && selectFromMultiDatedTitle(f, date))); //this is the case where there are more than one date
        }
        else {
            return undefined;
        }
    }
    showInlineButtonsForOptionalPrayers(selected, btn, masterBtnDiv, { AR: 'صلوات القسمة', FR: 'Oraisons de la Fraction' }, 'btnFractionPrayers');
}
;
function getBtnGospelPrayersArray(btn, readingsArray) {
    let gospel = readingsArray.filter(r => {
        r[0][0][0].split('&C=')[0] == btn.prayers[1] || r[0][0][0].split('&C=')[0] == btn.prayers[2];
    });
    return gospel;
}
function selectFromMultiDatedTitle(table, coptDate = copticDate) {
    let date, found = false;
    let dates = table[0][0].split('&D=')[1].split('&C=')[0].split('||');
    for (let i = 0; i < dates.length; i++) {
        date = dates[i];
        if (date.startsWith('$')) {
            date = eval(date.replace('$', ''));
        }
        if (date == coptDate) {
            found = true;
        }
    }
    return found;
}
;
/**
 * Inserts prayers adjacent to an html child element to containerDiv
 * @param {string[][][]} prayers - an array of prayers, each representing a table in the Word document from which the text was retrieved
 * @param {{beforeOrAfter:InsertPosition, el: HTMLElement}} position - the position at which the prayers will be inserted, adjacent to an html element (el) in the containerDiv
 */
function insertPrayersAdjacentToExistingElement(prayers, position) {
    if (!prayers) {
        return;
    }
    ;
    prayers.map(p => {
        p.map(row => {
            createHtmlElementForPrayer(row[0].split('&C=')[0], row, btnIncenseDawn.languages, JSON.parse(localStorage.userLanguages), row[0].split('&C=')[1], position);
        });
    });
}
/**
 * Searchs for the cymbal verses of a coptDate, and if found, insert them adjacent to the first element retrieved by a given "data-root" attribute
 * @param {string[][][]} cymbalVerses -  an array of filtered cymbal verses that will be inserted, if not provided, the cymbalVersesArray will be filtered by the coptDate value
 * @param {string} coptDate - string representing the day and month of the coptic calendar: "ddmm"
 * @param {InsertPosition} position - the insertio position of the cymbal verses
 * @param {boolean} remove - indicates whether to delete or not all the elements having the same data-root
 * @returns
 */
function insertCymbalVersesForFeastsAndSeasons(param) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!param.coptDate) {
            param.coptDate = copticDate;
        }
        if (!param.position) {
            param.position = 'beforebegin';
        }
        if (!param.remove) {
            param.remove = false;
        }
        let dataRoot = 'div[data-root*="' + Prefix.commonIncense + 'CymbalVerses"]';
        //Retrieving the 1st Title in the Cymbal Verses section
        let cymbalsTitle = containerDiv.querySelectorAll(dataRoot)[0];
        //Retrieving the cymbal vereses of the feast or season
        if (!param.cymbalVerses) {
            param.cymbalVerses = cymbalVersesArray.filter(tbl => eval(tbl[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) == param.coptDate);
        }
        ;
        if (!cymbalsTitle || !param.cymbalVerses) {
            return;
        }
        if (param.coptDate in lordGreatFeasts) {
            let endCymbals = cymbalVersesArray.filter(tbl => tbl[0][0].split('&C=')[0] == Prefix.cymbalVerses + 'LordFeastsEnd&D=0000');
            if (param.coptDate == copticFeasts.Resurrection
                || param.coptDate == copticFeasts.Ascension
                || param.coptDate == copticFeasts.Pentecoste) {
                //Inserting the special Cymbal Verse for St. Maykel
                param.cymbalVerses = [...param.cymbalVerses, ...cymbalVersesArray.filter(tbl => tbl[0][0].split('&C=')[0] == Prefix.cymbalVerses + 'StMaykel&D=$copticFeasts.Resurrection ')];
            }
            if (endCymbals) {
                param.cymbalVerses = [...param.cymbalVerses, ...endCymbals];
            }
        }
        insertPrayersAdjacentToExistingElement(param.cymbalVerses, { beforeOrAfter: param.position, el: cymbalsTitle });
        if (param.remove) {
            containerDiv.querySelectorAll('div[data-root="' + cymbalsTitle.getAttribute('data-root') + '"]').forEach(el => el.remove());
        }
    });
}
function insertDoxologiesForFeastsAndSeasons(param) {
    return __awaiter(this, void 0, void 0, function* () {
        let doxology;
        doxology = DoxologiesPrayersArray.filter(d => eval(d[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) == param.coptDate);
        //If we are during the Great Lent, we will select the doxologies according to whether the day is a Saturday or a Sunday, or an ordinary week day
        if (param.coptDate == Seasons.GreatLent) {
            if (todayDate.getDay() == 0 || todayDate.getDay() == 6) {
                //We are during the Great Lent and the day is a Saturday or a Sunday
                doxology = doxology.filter(d => /GreatLentSundays\&D\=/.test(d[0][0]) == true);
            }
            else {
                doxology = doxology.filter(d => /GreatLentWeek\d{1}\&D\=/.test(d[0][0]) == true);
            }
        }
        if (doxology) {
            insertPrayersAdjacentToExistingElement(doxology, {
                beforeOrAfter: 'beforebegin',
                el: containerDiv.querySelectorAll('div[data-root="' + Prefix.incenseDawn + 'DoxologyWatesStMary&D=0000"]')[0]
            });
        }
        ;
    });
}
;
function removeElementsByTheirDataRoot(dataRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        containerDiv.querySelectorAll('div[data-root="' + dataRoot + '"]').forEach(el => el.remove());
    });
}
