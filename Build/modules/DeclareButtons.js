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
    get prayers() {
        return this._prayers;
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
    set prayers(btnPrayers) {
        this._prayers = btnPrayers;
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
    prayers: [...IncensePrayers],
    prayersArray: [...CommonPrayersArray, ...IncensePrayersArray],
    showPrayers: true,
    children: [],
    languages: [...prayersLanguages],
    onClick: () => {
        btnIncenseDawn.prayersArray = [
            ...CommonPrayersArray,
            ...IncensePrayersArray,
        ];
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
        })();
        (function removeNonRelevantLitanies() {
            //removing the Departed Litany from IncenseDawn prayers
            btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf("IV_DepartedPrayerPart1&D=0000"), 5);
            //removing "Lord keep us this night without sin"
            btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf("IV_LordKeepUsThisNightWithoutSin&D=0000"), 1);
        })();
        (function removeStMaryVespersDoxology() {
            //removing the Wates Vespers' Doxology for St. Mary
            btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf("IV_DoxologyVespersWatesStMary&D=0000"), 1);
        })();
        let index;
        (function removeEklonominTaghonata() {
            //We remove "Eklonomin Taghonata" from the prayers array
            if ((Season != Seasons.GreatLent && Season != Seasons.JonahFast) ||
                todayDate.getDay() == 0 ||
                todayDate.getDay() == 6) {
                btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf(Prefix.incenseDawn + "GodHaveMercyOnUsRefrainComment&D=GL"), 36); //this is the comment, we remove 36 prayers including the comment
            }
        })();
        //We will then add other prayers according to the season or feast
        (function addKiahkPrayers() {
            if (Number(copticMonth) == 4) {
                index =
                    btnIncenseDawn.prayers.indexOf("ID_DoxologyWatesStMary&D=0000") - 1;
                let doxologies = [];
                DoxologiesPrayersArray.map((p) => /DC_\d{1}\&D\=0004/.test(p[0][0])
                    ? doxologies.push(p[0][0])
                    : "do nothing");
                btnIncenseDawn.prayers.splice(index, 0, ...doxologies);
            }
        })();
        scrollToTop();
        return btnIncenseDawn.prayers;
    },
    afterShowPrayers: async () => {
        (function addInlineBtnForAdamDoxolgies() {
            let newDiv = document.createElement("div"); //Creating a div container in which the btn will be displayed
            newDiv.classList.add("inlineBtns");
            containerDiv.children[0].insertAdjacentElement("beforebegin", newDiv); //Inserting the div containing the button as 1st element of containerDiv
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
                    let Adam = containerDiv.querySelector('#' + btn.btnID + 'New');
                    if (Adam) {
                        // it means the btn had been clicked before and the adam doxologies are diplayed. We will remove them from the DOM
                        Adam.remove();
                        return;
                    }
                    //If not displayed, we will show
                    //We will create a newDiv to which we will append all the elements in order to avoid the reflow as much as possible
                    let newDiv = document.createElement('div');
                    newDiv.id = btn.btnID + 'New';
                    //We will create a div element for each row of each table in btn.prayersArray
                    btn.prayersArray.map(table => table.map(row => createHtmlElementForPrayer(baseTitle(row[0]), row, btn.languages, undefined, row[0].split('&C=')[1], newDiv)));
                    //We will apply the css on the newDiv children
                    setCSSGridTemplate(Array.from(newDiv.children));
                    //we replace the eight note
                    replaceEigthNote(undefined, Array.from(newDiv.querySelectorAll('p.Diacon')));
                    //finally we append the newDiv to containerDiv
                    containerDiv.children[1].insertAdjacentElement('beforebegin', newDiv);
                    return;
                },
            });
            //Setting the btn prayersArray to a filtered array of the 'Adam' doxologies
            btn.prayersArray = DoxologiesPrayersArray.filter(table => table[0][0].startsWith(Prefix.commonDoxologies + 'Adam'));
            createBtn(btn, newDiv, btn.cssClass, true, btn.onClick); //creating the html element representing the button. Notice that we give it as 'click' event, the btn.onClick property, otherwise, the createBtn will set it to the default call back function which is showChildBtnsOrPrayers(btn, clear)
            //then removing the prayer id from the btnIncenseDawn.prayers array in order to exclude them unless requested by the user by clicking on the inline button, otherwise they will show twice
            btn.prayersArray.map(table => btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf(table[0][0]), 1));
        })();
        (async function addGreatLentPrayers() {
            let doxologies;
            if (Season != Seasons.GreatLent ||
                copticReadingsDate == copticFeasts.Resurrection) {
                return;
            }
            else if (todayDate.getDay() != 0 && todayDate.getDay() != 6) {
                //We are neither a Saturday nor a Sunday, we will hence display the Prophecies dawn buton
                (function showPropheciesDawnBtn() {
                    //If we are during any day of the week, we will add the Prophecies readings to the children of the button
                    if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) == -1) {
                        btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
                    }
                })();
            }
            else if (todayDate.getDay() == 0 || todayDate.getDay() == 6) {
            }
            (async function removeEklonominTaghonataExcessiveTitles() {
                let titles = containerDiv.querySelectorAll(getDataRootSelector(Prefix.commonIncense + 'GodHaveMercyOnUsRefrain&D=$' + Seasons.GreatLent));
                if (titles) {
                    for (let i = 7; i < titles.length; i += 7) {
                        titles[i].remove();
                    }
                }
                let links = rightSideBar
                    .querySelector("#sideBarBtns")
                    .querySelectorAll('a[href*="#ID_GodHaveMercyOnUsRefrain"');
                for (let i = 1; i < links.length; i++) {
                    links[i].remove();
                }
            })();
        })();
        (async function insertCymbalVersesAndDoxologiesForFeastsAndSeasons() {
            if (copticDate == copticFeasts.Nayrouz) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.Nayrouz,
                });
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
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.NativityParamoun,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.NativityParamoun,
                });
            }
            else if (copticDate == copticFeasts.Circumcision) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.Circumcision,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.Circumcision,
                });
            }
            else if (copticDate == copticFeasts.BaptismParamoun) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.BaptismParamoun,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.BaptismParamoun,
                });
            }
            else if (copticDate == copticFeasts.Baptism) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.Baptism,
                });
                insertDoxologiesForFeastsAndSeasons({ coptDate: copticFeasts.Baptism });
            }
            else if (copticDate == copticFeasts.CanaWedding) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.CanaWedding,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.CanaWedding,
                });
            }
            else if (copticDate == copticFeasts.EntryToTemple) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.EntryToTemple,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.EntryToTemple,
                });
            }
            else if (copticDate == copticFeasts.Annonciation) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.Annonciation,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.Annonciation,
                });
            }
            else if (Season == Seasons.GreatLent) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: Seasons.GreatLent,
                    remove: true,
                });
                insertDoxologiesForFeastsAndSeasons({ coptDate: Seasons.GreatLent });
            }
            else if (copticReadingsDate == copticFeasts.LazarusSaturday) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.LazarusSaturday,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.LazarusSaturday,
                });
            }
            else if (copticReadingsDate == copticFeasts.PalmSunday) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.PalmSunday,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.PalmSunday,
                });
            }
            //The order during the pentecostal days is important. We start by the last event (Pentecoste), then the "Ascension", and finally the general case which is Seasons.PentecostalDays
            else if (copticReadingsDate == copticFeasts.Pentecoste) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.Pentecoste,
                    remove: true,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.Pentecoste,
                });
                let stMaykelRoot = Prefix.commonIncense + "ArchangelMichaelWates&D=0000";
                moveBlockOfRowsAdjacentToAnElement(stMaykelRoot, "beforebegin", containerDiv.querySelectorAll(getDataRootSelector(Prefix.commonDoxologies +
                    'Wates2&D=$' + Seasons.PentecostalDays)));
                //Removing Archange Maykel's Doxology (it is replaced by another one)
                removeElementsByTheirDataRoot(stMaykelRoot);
            }
            else if (copticReadingsDate == copticFeasts.Ascension ||
                Number(copticReadingsDate.split(Seasons.PentecostalDays)[1]) > 39) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.Ascension,
                    remove: true,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.Ascension,
                });
                let stMaykelRoot = Prefix.commonIncense + "ArchangelMichaelWates&D=0000";
                moveBlockOfRowsAdjacentToAnElement(stMaykelRoot, "beforebegin", containerDiv.querySelectorAll(getDataRootSelector(Prefix.commonDoxologies +
                    'Wates2&D=$' + Seasons.PentecostalDays)));
                //Removing Archange Maykel's Doxology (it is replaced by another one)
                removeElementsByTheirDataRoot(stMaykelRoot);
            }
            else if (Season == Seasons.PentecostalDays) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: Seasons.PentecostalDays,
                    remove: true,
                });
                //Inserting the doxologies
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: Seasons.PentecostalDays,
                });
                (function replaceStMaykeVerse() {
                    //We will replace the 'annual' cymbal verse of St. Maykel by the Pentecostal verse
                    let stMaykelAnnual = containerDiv.querySelectorAll(getDataRootSelector(Prefix.commonIncense + 'CymablVersesCommon&D=0000'))[3] //this is the 'annual' Cymbal verse  of St. Maykel
                    , stMaykelPentecostal = containerDiv.querySelectorAll(getDataRootSelector(Prefix.cymbalVerses + 'StMaykel&D=$Seasons.PentecostalDays'))[0]; //this is the newly inserted Cymbal verse               
                    stMaykelAnnual.insertAdjacentElement('beforebegin', stMaykelPentecostal);
                    //Removing the Annual verse
                    stMaykelAnnual.remove();
                })();
                (function InsertLordsFeastFinal() {
                    //Inserting the Final Cymbal verses for the joyfull days and Lord's Feasts
                    let final = PrayersArray.filter(table => table[0][0] == Prefix.cymbalVerses + 'LordFeastsEnd&D=0000&C=Title'), annualVerses = containerDiv.querySelectorAll(getDataRootSelector(Prefix.commonIncense + 'CymablVersesCommon&D=0000')); //annualVereses[8] is the St. Markos annual verse, we will delete the annual verses after it
                    for (let i = 13; i > 6; i--) {
                        annualVerses[i].remove();
                    }
                    insertPrayersAdjacentToExistingElement(final, btnIncenseDawn.languages, { beforeOrAfter: 'beforebegin', el: annualVerses[6].nextElementSibling });
                })();
            }
            else if (copticDate == copticFeasts.EntryToEgypt) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.EntryToEgypt,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.EntryToEgypt,
                });
            }
            else if (copticDate == copticFeasts.Epiphany) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.Epiphany,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.Epiphany,
                });
            }
            else if (copticDate == copticFeasts.theTwentyNinethOfCopticMonth) {
                //Inserting Cymbal Verses
                insertCymbalVersesForFeastsAndSeasons({
                    coptDate: copticFeasts.theTwentyNinethOfCopticMonth,
                });
                insertDoxologiesForFeastsAndSeasons({
                    coptDate: copticFeasts.theTwentyNinethOfCopticMonth,
                });
            }
        })();
        getGospelReadingAndResponses(Prefix.gospelDawn, btnReadingsGospelIncenseDawn.prayersArray, btnReadingsGospelIncenseDawn.languages);
    },
});
const btnIncenseVespers = new Button({
    btnID: "btnIncenseVespers",
    label: {
        AR: "بخور عشية",
        FR: "Incense Vespers",
    },
    prayers: [...IncensePrayers],
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnIncenseVespers.prayersArray = [
            ...CommonPrayersArray,
            ...IncensePrayersArray,
        ];
        (function removingNonRelevantLitanies() {
            //removing the Sick Litany
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf("  ID_SickPrayerPart1&D=0000"), 5);
            //removing the Travelers Litany from IncenseVespers prayers
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf("ID_TravelersPrayerPart1Date=0000"), 5);
            //removing the Oblations Litany from IncenseVespers paryers
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf("ID_OblationsPrayerPart1Date=0000"), 5);
            //removing the Dawn Doxology for St. Mary
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf("ID_DoxologyWatesStMary&D=0000"), 1);
            //removing the Angels' prayer
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf("PC_AngelsPrayer&D=0000"), 1);
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
        })();
        (function removeEklonominTaghonata() {
            //We remove "Eklonomin Taghonata" from the prayers array
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf(Prefix.incenseDawn +
                "GodHaveMercyOnUsRefrainComment&D=" +
                Seasons.GreatLent), 36); //this is the comment, we remove 36 prayers including the comment
        })();
        (function addGreatLentPrayers() {
            if (Season == Seasons.GreatLent &&
                todayDate.getDay() != 0 &&
                todayDate.getDay() != 6) {
                //We will then add the GreatLent  Doxologies to the Doxologies before the first Doxology of St. Mary
                (function addGreatLentDoxologies() {
                    let index = btnIncenseDawn.prayers.indexOf("IV_DoxologyVespersWatesStMary&D=0000");
                    let doxologies = [];
                    DoxologiesPrayersArray.map((p) => /DC_\d{1}\&D\=GLWeek/.test(p[0][0])
                        ? doxologies.push(p[0][0])
                        : "do nothing");
                    if (todayDate.getDay() != 0 && todayDate.getDay() != 6) {
                        btnIncenseVespers.prayers.splice(index, 0, ...doxologies);
                    }
                    else if (todayDate.getDay() == (0 || 6)) {
                        btnIncenseVespers.prayers.splice(index, 0, "DC_&D=GLSundays");
                    }
                })();
            }
        })();
        scrollToTop();
        return btnIncenseVespers.prayers;
    },
    afterShowPrayers: async () => {
        getGospelReadingAndResponses(Prefix.gospelVespers, btnReadingsGospelIncenseVespers.prayersArray, btnReadingsGospelIncenseVespers.languages);
    },
});
const btnMassStCyril = new Button({
    btnID: "btnMassStCyril",
    rootID: "StCyril",
    label: { AR: "كيرلسي", FR: "Saint Cyril", EN: "St Cyril" },
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
            btnMassStCyril.prayers = btnsPrayers[btns.indexOf(btnMassStCyril)];
            return;
        }
        //Setting the standard mass prayers sequence
        btnMassStCyril.prayers = [
            ...MassPrayers.MassCommonIntro,
            ...MassPrayers.MassStCyril,
            ...[
                "MC_TheHolyBodyAndTheHolyBlodPart3&D=0000",
                "PC_KyrieElieson&D=0000",
                "PC_BlockIriniPassi&D=0000",
                "MC_FractionPrayerPlaceholder&D=0000",
                "PC_OurFatherWhoArtInHeaven&D=0000",
                "MC_Confession&D=0000",
                "MC_ConfessionComment&D=0000",
            ],
            ...MassPrayers.Communion,
        ];
        return btnMassStCyril.prayers;
    },
    afterShowPrayers: async () => {
        showFractionsMasterButton(btnMassStCyril);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Basil, St. Gregory or St. John)
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory, btnMassStJohn], {
                beforeOrAfter: "afterend",
                el: containerDiv.querySelector(getDataRootSelector('Reconciliation&D=0000', true)),
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Basil or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = containerDiv.querySelectorAll(getDataRootSelector(Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=0000', true));
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Basil or St Gregory before Agios
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory], {
                beforeOrAfter: "beforebegin",
                el: containerDiv.querySelector(getDataRootSelector(Prefix.massCommon + 'Agios&D=0000'))
            }, 'RedirectionToAgios');
        })();
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnMassStGregory = new Button({
    btnID: "btnMassStGregory",
    rootID: "StGregory",
    label: { AR: "غريغوري", FR: "Saint Gregory" },
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
            btnMassStGregory.prayers = btnsPrayers[btns.indexOf(btnMassStGregory)];
            return;
        }
        //Setting the standard mass prayers sequence
        btnMassStGregory.prayers = [
            ...MassPrayers.MassCommonIntro,
            ...MassPrayers.MassStGregory,
            ...MassPrayers.MassCallOfHolySpirit,
            ...MassPrayers.MassLitanies,
            ...MassPrayers.Communion,
        ];
        //removing irrelevant prayers from the array
        btnMassStGregory.prayers.splice(btnMassStGregory.prayers.indexOf("MC_CallOfTheHolySpiritPart1Comment&D=0000"), 10);
        scrollToTop();
        return btnMassStGregory.prayers;
    },
    afterShowPrayers: async () => {
        showFractionsMasterButton(btnMassStGregory);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Basil, St. Cyril, or St. John)
            redirectToAnotherMass([btnMassStBasil, btnMassStCyril, btnMassStJohn], {
                beforeOrAfter: "afterend",
                el: containerDiv.querySelector(getDataRootSelector('Reconciliation&D=0000', true)),
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Cyrill or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = containerDiv.querySelectorAll(getDataRootSelector(Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=0000', true));
            redirectToAnotherMass([btnMassStBasil, btnMassStCyril,], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory before Agios
            redirectToAnotherMass([btnMassStBasil, btnMassStCyril], {
                beforeOrAfter: "beforebegin",
                el: containerDiv.querySelector(getDataRootSelector(Prefix.massCommon + 'Agios&D=0000'))
            }, 'RedirectionToAgios');
        })();
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnMassStBasil = new Button({
    btnID: "btnMassStBasil",
    rootID: "StBasil",
    label: { AR: "باسيلي", FR: "Saint Basil", EN: "St Basil" },
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStBasil.prayersArray = [
            ...CommonPrayersArray,
            ...MassCommonPrayersArray,
            ...MassStBasilPrayersArray,
        ];
        //Setting the standard mass prayers sequence
        btnMassStBasil.prayers = [
            ...MassPrayers.MassCommonIntro,
            ...MassPrayers.MassStBasil,
            ...MassPrayers.MassCallOfHolySpirit,
            ...MassPrayers.MassLitanies,
            ...MassPrayers.Communion,
        ];
        //We scroll to the beginning of the page after the prayers have been displayed
        scrollToTop();
        return btnMassStBasil.prayers;
    },
    afterShowPrayers: async () => {
        showFractionsMasterButton(btnMassStBasil);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Gregory, St. Cyril, or St. John)
            redirectToAnotherMass([btnMassStGregory, btnMassStCyril, btnMassStJohn], {
                beforeOrAfter: "afterend",
                el: containerDiv.querySelector(getDataRootSelector('Reconciliation&D=0000', true)),
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Cyrill or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = containerDiv.querySelectorAll(getDataRootSelector(Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=0000', true));
            redirectToAnotherMass([btnMassStGregory, btnMassStCyril,], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory before Agios
            redirectToAnotherMass([btnMassStGregory, btnMassStCyril], {
                beforeOrAfter: "beforebegin",
                el: containerDiv.querySelector(getDataRootSelector(Prefix.massCommon + 'Agios&D=0000'))
            }, 'RedirectionToAgios');
        })();
    },
});
const btnMassStJohn = new Button({
    btnID: "btnMassStJohn",
    label: { AR: "القديس يوحنا", FR: "Saint Jean" },
    showPrayers: false,
    prayers: [],
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
        showFractionsMasterButton(btnMassStJohn);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Basil, St. Gregory or St. Cyril)
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory, btnMassStCyril], {
                beforeOrAfter: "afterend",
                el: containerDiv.querySelector(getDataRootSelector('Reconciliation&D=0000', true)),
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = containerDiv.querySelectorAll(getDataRootSelector(Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=0000', true));
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory, btnMassStCyril], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory before Agios
            redirectToAnotherMass([btnMassStBasil, btnMassStGregory, btnMassStCyril], {
                beforeOrAfter: "beforebegin",
                el: containerDiv.querySelector(getDataRootSelector(Prefix.massCommon + 'Agios&D=0000'))
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
    showPrayers: true,
    prayers: MassPrayers.MassUnbaptized,
    prayersArray: PrayersArray,
    languages: [...prayersLanguages],
    onClick: () => {
        //Adding children buttons to btnMassUnBaptised
        btnMassUnBaptised.children = [
            btnBookOfHours,
            btnReadingsStPaul,
            btnReadingsKatholikon,
            btnReadingsPraxis,
            btnReadingsSynaxarium,
            btnReadingsGospelMass,
        ];
        //Adding the creed and 
        (function addCreed() {
            btnMassUnBaptised.prayers.unshift(Prefix.commonPrayer + 'WeExaltYouStMary&D=0000', Prefix.commonPrayer + 'Creed&D=0000');
        })();
        //Replacing AllelujaFayBabi according to the day
        (function replaceAllelujahFayBabi() {
            if (isFast) {
                //Replace Hellelujah Fay Bibi
                btnMassUnBaptised.prayers.splice(btnMassUnBaptised.prayers.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=0000"), 1);
                if (Season != Seasons.GreatLent && Season != Seasons.JonahFast) {
                    //Remove TayShouray
                    btnMassUnBaptised.prayers.splice(btnMassUnBaptised.prayers.indexOf(Prefix.massCommon + "Tayshoury&D=0000"), 1);
                }
            }
            else {
                //Remove 'Hallelujah Ji Efmefi'
                btnMassUnBaptised.prayers.splice(btnMassUnBaptised.prayers.indexOf(Prefix.massCommon + "HallelujahFayBiBiFast & D=0000"), 1);
                //Remove Tishoury
                btnMassUnBaptised.prayers.splice(btnMassUnBaptised.prayers.indexOf(Prefix.massCommon + "Tishoury&D=0000"), 1);
            }
        })();
        scrollToTop();
        return btnMassUnBaptised.prayers;
    },
    afterShowPrayers: () => {
        let anchor = containerDiv.querySelectorAll(getDataRootSelector(Prefix.massCommon + 'PraxisResponse&D=0000'))[0]; //this is the html element before which we will insert all the readings and responses
        let reading;
        (function insertStPaulReading() {
            reading = btnReadingsStPaul.prayersArray.filter(tbl => baseTitle(tbl[0][0]) == btnReadingsStPaul.prayers[0] + '&D=' + copticReadingsDate);
            //ading the  end of the St Paul reading
            reading = [
                [[reading[0][1][0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.stPaulIntro.AR, ReadingsIntrosAndEnds.stPaulIntro.FR, ReadingsIntrosAndEnds.stPaulIntro.EN]],
                ...reading,
                [[reading[0][1][0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.stPaulEnd.AR, ReadingsIntrosAndEnds.stPaulEnd.FR, ReadingsIntrosAndEnds.stPaulEnd.EN]]
            ];
            insertPrayersAdjacentToExistingElement(reading, btnReadingsStPaul.languages, { beforeOrAfter: 'beforebegin', el: anchor });
        })();
        (function insertKatholikon() {
            reading = btnReadingsKatholikon.prayersArray.filter(tbl => baseTitle(tbl[0][0]) == btnReadingsKatholikon.prayers[0] + '&D=' + copticReadingsDate);
            //ading the introduction and the end of the Katholikon
            reading = [
                [[reading[0][1][0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.katholikonIntro.AR, ReadingsIntrosAndEnds.katholikonIntro.FR, ReadingsIntrosAndEnds.katholikonIntro.EN]],
                ...reading,
                [[reading[0][1][0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.katholikonEnd.AR, ReadingsIntrosAndEnds.katholikonEnd.FR, ReadingsIntrosAndEnds.katholikonEnd.EN]]
            ];
            insertPrayersAdjacentToExistingElement(reading, btnReadingsKatholikon.languages, { beforeOrAfter: 'beforebegin', el: anchor });
        })();
        (function insertPraxis() {
            let response = function getPraxisResponse(coptDate) {
                PrayersArray.filter(p => baseTitle(p[0][0]) == Prefix.praxis + '&D=');
            };
            reading = btnReadingsPraxis.prayersArray.filter(tbl => baseTitle(tbl[0][0]) == btnReadingsPraxis.prayers[0] + '&D=' + copticReadingsDate);
            reading = [
                [[reading[0][1][0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.praxisIntro.AR, ReadingsIntrosAndEnds.praxisIntro.FR, ReadingsIntrosAndEnds.praxisIntro.EN]],
                ...reading,
                [[reading[0][1][0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.praxisEnd.AR, ReadingsIntrosAndEnds.praxisEnd.FR, ReadingsIntrosAndEnds.praxisEnd.EN]]
            ];
            insertPrayersAdjacentToExistingElement(reading, btnReadingsPraxis.languages, { beforeOrAfter: 'beforebegin', el: anchor });
        })();
        //Inserting the Gospel Reading
        getGospelReadingAndResponses(Prefix.gospelMass, btnReadingsGospelMass.prayersArray, btnReadingsGospelMass.languages);
        (function insertBookOfHoursButton() {
            let div = document.createElement('div');
            div.style.display = 'grid';
            div.id = 'btnAgbeya';
            let tempBtn = new Button({
                btnID: btnGoBack.btnID,
                label: btnBookOfHours.label,
                showPrayers: true,
                onClick: () => {
                    let prayers = containerDiv.querySelectorAll('div[data-group="' + 'BookOfHours' + '"]');
                    if (prayers.length > 0) {
                        //it means the Book of Hours have been inserted before when the user clicked the button, we remove them and return
                        prayers.forEach(el => el.remove());
                        return;
                    }
                    let hours = btnBookOfHours.onClick(true); //notice that we pass true as parameter to btnBookOfHours.onClick() in order to make the function return only the hours of the mass not all the hours of the bookOfPrayersArray
                    if (hours.length > 0) {
                        //We will insert the text as divs after the div where the button is displayed
                        //We remove the thanks giving and the Psalm 50
                        hours.filter(title => title.includes('ThanksGiving') || title.includes('Psalm50')).map(title => hours.splice(hours.indexOf(title), 1));
                        hours.reverse().map((title) => {
                            insertPrayersAdjacentToExistingElement(btnBookOfHours.prayersArray.filter(tbl => baseTitle(tbl[0][0]) == title), btnBookOfHours.languages, {
                                beforeOrAfter: 'beforebegin',
                                el: div.nextElementSibling
                            })
                                .forEach(created => created.dataset.group = 'BookOfHours'); //We add a data-group attribute for each created element in order to be able to retrieve them later
                        });
                    }
                }
            });
            createBtn(tempBtn, div, inlineBtnClass, false);
            containerDiv.children[0].insertAdjacentElement('beforebegin', div);
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
    prayers: [Prefix.stPaul],
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
    prayers: [Prefix.katholikon],
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
    prayers: [Prefix.praxis],
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
        (btnReadingsSynaxarium.prayers = [Prefix.synaxarium + "&D=" + copticDate]),
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
    prayers: [Prefix.gospelMass + "Psalm", Prefix.gospelMass + "Gospel"],
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
    prayers: [Prefix.gospelVespers + "Psalm", Prefix.gospelVespers + "Gospel"],
    prayersArray: ReadingsArrays.GospelVespersArray,
    languages: [...readingsLanguages],
    onClick: () => {
        let today = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).
        let date = setSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today), today);
        btnReadingsGospelIncenseVespers.prayers[0] += date;
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
    prayers: [Prefix.gospelDawn + "Psalm", Prefix.gospelDawn + "Gospel"],
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
    prayers: [Prefix.gospelNight + "Psalm", Prefix.gospelNight + "Gospel"],
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
    prayers: [Prefix.propheciesDawn],
    prayersArray: ReadingsArrays.PropheciesDawnArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnBookOfHours = new Button({
    btnID: 'btnBookOfHours',
    label: { AR: 'الأجبية', FR: 'Agpia' },
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: (mass = false) => {
        let Kenin = Prefix.commonPrayer + 'NowAlwaysAndForEver&D=0000', ZoksaPatri = Prefix.commonPrayer + 'GloryToTheFatherTheSonAndTheSpirit&D=0000', gospelEnd = Prefix.bookOfHours + 'GospelEnd&D=0000', OurFatherWhoArtInHeaven = Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=0000', WeExaltYou = Prefix.commonPrayer + 'WeExaltYouStMary&D=0000', Agios = Prefix.commonPrayer + 'HolyGodHolyPowerfulPart', HolyLordOfSabaot = Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=0000', Creed = Prefix.commonPrayer + 'Creed&D=0000', Hallelujah = Prefix.bookOfHours + '+PsalmEnd&D=0000';
        let HourIntro = [
            Prefix.commonPrayer + 'ThanksGivingPart1&D=0000',
            Prefix.commonPrayer + 'ThanksGivingPart2&D=0000',
            Prefix.commonPrayer + 'ThanksGivingPart3&D=0000',
            Prefix.commonPrayer + 'ThanksGivingPart4&D=0000',
            Prefix.bookOfHours + 'AnyHourPsalm50&D=0000'
        ];
        (function preparingButtonPrayers() {
            for (let hour in bookOfHours) {
                if (hour.endsWith('Array')) {
                    //We populate each hour prayers property of bookOfHours (see its definition) from the title of the hour prayersArray (this property was set when the page was loaded by the populatePrayersArrays() function)
                    bookOfHours[hour.split('Array')[0]] = [...bookOfHours[hour].map(table => baseTitle(table[0][0]))];
                    bookOfHours[hour.split('Array')[0]].splice(1, 0, ...HourIntro);
                }
            }
            if (mass) {
                //mass is a boolean that tells whether the button prayersArray should include all the hours of the Book Of Hours, or only those pertaining to the mass according to the season and the day on which the mass is celebrated
                if (Season == Seasons.GreatLent) {
                    //We are during the Great Lent, we pray the 3rd, 6th, 9th, 11th, and 12th hours
                    btnBookOfHours.prayers = [
                        ...bookOfHours.ThirdHourPrayers,
                        ...bookOfHours.SixthHourPrayers,
                        ...bookOfHours.NinethHourPrayers,
                        ...bookOfHours.EleventhHourPrayers,
                        ...PrayersArray,
                        ...bookOfHours.TwelvethHourPrayers
                    ];
                }
                else if (Season == Seasons.PentecostalDays
                    || todayDate.getDay() == 0
                    || todayDate.getDay() == 6
                    || lordFeasts.indexOf(copticDate) > -1) {
                    //We are a Sunday or a Saturday, or during the 50 Pentecostal days, or on a Lord Feast day,
                    btnBookOfHours.prayers = [
                        ...bookOfHours.ThirdHourPrayers,
                        ...bookOfHours.SixthHourPrayers
                    ];
                }
                else {
                    btnBookOfHours.prayers = [
                        ...bookOfHours.ThirdHourPrayers,
                        ...bookOfHours.SixthHourPrayers,
                        ...bookOfHours.NinethHourPrayers
                    ];
                }
            }
            else {
                //This is the case where the Book of Prayers is displayed entirely in order to be used as is outside of any mass or liturgy context
                btnBookOfHours.prayers = [];
                for (let hour in bookOfHours) {
                    if (!hour.endsWith('Array')) {
                        btnBookOfHours.prayers.push(...bookOfHours[hour]);
                    }
                }
            }
            //We will insert the 'Zoksa Patri' and 'kenin' responses after the litanies
            let btnPrayers = btnBookOfHours.prayers, title;
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
                else if (title.includes('Gospel&D=0000')) {
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
            btnBookOfHours.prayers = btnPrayers;
        })();
        (function preparingButtonPrayersArray() {
            //initiating the prayersArray with all the tables in bookOfHoursArray
            btnBookOfHours.prayersArray = [...bookOfHoursArray];
            //Adding the "Zoksa Patri" and "Kenin" and "Hallelujah" tables to the button's prayers array
            btnBookOfHours.prayersArray.push(...CommonPrayersArray.filter(table => baseTitle(table[0][0]) == ZoksaPatri
                || new RegExp(Prefix.commonPrayer + 'ThanksGivingPart\\d{1}\\&D\\=0000').test(baseTitle(table[0][0]))
                || baseTitle(table[0][0]) == Kenin
                || baseTitle(table[0][0]) == Hallelujah
                || new RegExp(Agios + '\\d{1}\\&D\\=0000').test(baseTitle(table[0][0]))
                || baseTitle(table[0][0]) == HolyLordOfSabaot
                || baseTitle(table[0][0]) == WeExaltYou
                || baseTitle(table[0][0]) == OurFatherWhoArtInHeaven
                || baseTitle(table[0][0]) == Creed));
        })();
        return btnBookOfHours.prayers;
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
    else if (Number(copticDay) == 29 && Number(copticMonth) != 4) {
        //we are on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast)
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
    createFakeAnchor(containerDiv.id);
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
async function getGospelReadingAndResponses(liturgy, goseplReadingsArray, languages) {
    let gospelInsertionPoint = containerDiv.querySelectorAll(getDataRootSelector(Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=0000"))[0]; //This is the html element before which we will insert the gospel litany
    // let fragment = new DocumentFragment();
    //We start by inserting the standard Gospel Litany
    (function insertGospelLitany() {
        let gospelLitanySequence = [
            Prefix.commonIncense + "GospelLitanyComment1&D=0000",
            Prefix.commonPrayer + "GospelPrayerPart1&D=0000",
            Prefix.commonPrayer + "KyrieElieson&D=0000",
            Prefix.commonPrayer + "GospelPrayerPart2&D=0000",
            Prefix.commonIncense + "GospelLitanyComment2&D=0000",
            Prefix.commonPrayer + "GospelLitanyComment3&D=0000",
            Prefix.commonPrayer + "GospelPrayerPart3&D=0000",
            Prefix.commonPrayer + "GospelIntroductionPart1&D=0000",
            Prefix.commonPrayer + "ZoksasiKyrie&D=0000",
            Prefix.commonPrayer + "PsalmIntroduction&D=0000",
            Prefix.commonPrayer + "GospelIntroductionPsalmComment&D=0000",
            Prefix.commonPrayer + "GospelIntroductionPart2&D=0000",
            Prefix.commonPrayer + "GospelIntroductionGospelComment&D=0000"
        ]; //This is the sequence of the Gospel Prayer/Litany for any liturgy
        let gospelPrayers = [];
        gospelLitanySequence.forEach((title) => {
            gospelPrayers.push(PrayersArray.filter(table => baseTitle(table[0][0]) == title)[0]);
        });
        insertPrayersAdjacentToExistingElement(gospelPrayers, prayersLanguages, {
            beforeOrAfter: 'beforebegin',
            el: gospelInsertionPoint
        });
    })();
    if (new Map(JSON.parse(localStorage.showActors)).get("Diacon") == false) {
        alert("Diacon Prayers are set to hidden, we cannot show the gospel");
        return;
    } //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers
    let anchorDataRoot = Prefix.commonPrayer + 'GospelIntroduction&D=0000';
    let gospelIntroduction = containerDiv.querySelectorAll(getDataRootSelector(anchorDataRoot));
    //let annualGospelResponse: NodeListOf<HTMLElement> = containerDiv.querySelectorAll(getDataRootSelector(Prefix.commonPrayer + 'GospelResponse&D=0000')) //This is the first row of the 'annual' gospel response, which is displayed by default
    if (!gospelIntroduction)
        return;
    let responses = setGospelPrayers(liturgy); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']
    //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
    let gospel = goseplReadingsArray.filter((table) => baseTitle(table[0][0]) == responses[1] + copticReadingsDate //this is the pasalm text
        || baseTitle(table[0][0]) == responses[2] + copticReadingsDate //this is the gospel itself
    ); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####". We should get a string[][][] of 2 elements: a table for the Psalm, and a table for the Gospel
    if (gospel.length < 1)
        return; //if no readings are returned from the filtering process, then we end the function
    gospel.forEach((table) => {
        let el; //this is the element before which we will insert the Psaml or the Gospel
        if (baseTitle(table[0][0]).includes("Gospel&D=")) {
            //This is the Gospel itself, we insert it before the gospel response
            el = gospelInsertionPoint;
        }
        else if (baseTitle(table[0][0]).includes("Psalm&D=")) {
            el = gospelIntroduction[gospelIntroduction.length - 1];
        }
        insertPrayersAdjacentToExistingElement([table], languages, {
            beforeOrAfter: 'beforebegin',
            el: el
        });
    });
    //We will inserte the Gospel response
    (function insertGospeResponse() {
        let gospelResp = PsalmAndGospelPrayersArray.filter((r) => r[0][0].split('&D=')[0] + '&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) == responses[3]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (gospelResp.length == 0)
            gospelResp = PrayersArray.filter((r) => baseTitle(r[0][0]) == Prefix.commonPrayer + 'GospelResponse&D=0000'); //If no specific gospel response is found, we will get the 'annual' gospel response
        insertPrayersAdjacentToExistingElement(gospelResp, prayersLanguages, {
            beforeOrAfter: "beforebegin",
            el: gospelInsertionPoint,
        });
        //We will eventy remove the insertion point placeholder
        gospelInsertionPoint.remove();
    })();
    //We will insert the Psalm response
    (function insertPsalmResponse() {
        let gospelPrayer = containerDiv.querySelectorAll(getDataRootSelector(Prefix.commonPrayer + 'GospelPrayer&D=0000')); //This is the 'Gospel Litany'. We will insert the Psalm response after its end
        let psalmResp = PsalmAndGospelPrayersArray.filter((r) => r[0][0].split('&D=')[0] + '&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) == responses[0]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (!psalmResp || !gospelPrayer)
            return;
        insertPrayersAdjacentToExistingElement(psalmResp, prayersLanguages, {
            beforeOrAfter: 'beforebegin',
            el: gospelPrayer[gospelPrayer.length - 2].nextElementSibling
        });
    })();
}
function showFractionsMasterButton(btn) {
    let selected = [], filtered;
    let insertion = containerDiv.querySelector('[data-root="' + Prefix.massCommon + 'FractionPrayerPlaceholder&D=0000"]'); //this is the id of the html element after which we will insert the inline buttons for the fraction prayers
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
    filtered = FractionsPrayersArray.filter((fraction) => fraction[0][0].includes("&D=0000") || fraction[0][0].includes("||0000"));
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
        baseTitle(r[0][0][0]) == btn.prayers[1] ||
            baseTitle(r[0][0][0]) == btn.prayers[2];
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
    if (!param.remove)
        param.remove = false;
    let dataRoot = getDataRootSelector(Prefix.commonIncense + 'CymbalVerses', true);
    //Retrieving the 1st Title in the Cymbal Verses section
    let cymbalsTitle = containerDiv.querySelectorAll(dataRoot)[0];
    //Retrieving the cymbal vereses of the feast or season
    if (!param.cymbalVerses) {
        param.cymbalVerses = cymbalVersesArray.filter((tbl) => eval(baseTitle(tbl[0][0]).split("&D=")[1].replace("$", "")) ==
            param.coptDate);
    }
    if (!cymbalsTitle || !param.cymbalVerses)
        return;
    if (param.coptDate in lordGreatFeasts) {
        let endCymbals = cymbalVersesArray.filter((tbl) => baseTitle(tbl[0][0]) ==
            Prefix.cymbalVerses + "LordFeastsEnd&D=0000");
        if (param.coptDate == copticFeasts.Resurrection
            || param.coptDate == copticFeasts.Ascension
            || param.coptDate == copticFeasts.Pentecoste) {
            //Inserting the special Cymbal Verse for St. Maykel
            param.cymbalVerses = [
                ...param.cymbalVerses,
                ...cymbalVersesArray.filter((tbl) => baseTitle(tbl[0][0]) ==
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
        containerDiv
            .querySelectorAll(getDataRootSelector(cymbalsTitle.getAttribute("data-root")))
            .forEach((el) => el.remove());
    }
}
async function insertDoxologiesForFeastsAndSeasons(param) {
    let doxology;
    doxology = DoxologiesPrayersArray.filter((d) => eval(baseTitle(d[0][0].split("&D=")[1]).replace("$", "")) ==
        param.coptDate);
    //If we are during the Great Lent, we will select the doxologies according to whether the day is a Saturday or a Sunday, or an ordinary week day
    if (param.coptDate == Seasons.GreatLent) {
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
            el: containerDiv.querySelectorAll(getDataRootSelector(Prefix.incenseDawn + 'DoxologyWatesStMary&D=0000'))[0],
        });
    }
}
async function removeElementsByTheirDataRoot(dataRoot) {
    containerDiv
        .querySelectorAll(getDataRootSelector(dataRoot))
        .forEach((el) => el.remove());
}
