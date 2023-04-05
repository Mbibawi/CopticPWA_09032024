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
        btnMass.children = [btnIncenseDawn, btnMassOfferingOfTheLamb, btnMassRoshoumat, btnMassUnBaptised, btnMassBaptised];
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
            if (todayDate.getDay() != 6) {
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
    showPrayers: false,
    children: [],
    prayersArray: PrayersArray,
    languages: [...prayersLanguages],
    onClick: () => {
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
                btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf("PrayerCymbalVersesAdam&D=0000"), 1);
            }
            else {
                //we are Sunday, Monday, or Tuesday. We keep only the "Adam" Cymbal prayers
                btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf("PrayerCymbalVersesWates&D=0000"), 1);
            }
            ;
        })();
        (function removeNonRelevantLitanies() {
            //removing the Departed Litany from IncenseDawn prayers
            btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf('PrayerDepartedPrayerPart1&D=0000'), 5);
            //removing "Lord keep us this night without sin"
            btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf('PrayerLordKeepUsThisNightWithoutSin&D=0000'), 1);
        })();
        (function removeStMaryVespersDoxology() {
            //removing the Wates Vespers' Doxology for St. Mary
            btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf('PrayerDoxologyVespersWatesStMary'), 1);
        })();
        let index;
        (function removeEklonominTaghonata() {
            //We remove "Eklonomin Taghonata" from the prayers array
            if ((Season != Seasons.GreatLent && Season != Seasons.JonahFast) || (todayDate.getDay() == 0 || todayDate.getDay() == 6)) {
                btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf('PrayerGodHaveMercyOnUsRefrainComment&S=GL'), 36); //this is the comment, we remove 36 prayers including the comment
            }
            ;
        })();
        //We will then add other prayers according to the season or feast
        (function addGreatLentPrayers() {
            if (Season == Seasons.GreatLent && todayDate.getDay() != 0 && todayDate.getDay() != 6) {
                (function showPropheciesDawnBtn() {
                    //If we are during any day of the week, we will add the Prophecies readings to the children of the button
                    if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) == -1) {
                        btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
                    }
                    ;
                })();
                //we will also add the 'Eklonomin Taghonata' prayer to the Dawn Incense Office prayers, after the 'Efnoti Naynan' prayer       
                (function addEklonominTaghonata() {
                    index = btnIncenseDawn.prayers.indexOf('PrayerEfnotiNaynanPart4&D=0000') + 2;
                    let temp = [];
                    //we add the comment
                    temp.push('PrayerGodHaveMercyOnUsRefrainComment&S=GL');
                    let prayer = ['PrayerGodHaveMercyOnUsRefrain&S=GL', 'PrayerKyrieElieson&D=0000', 'PrayerKyrieEliesonThreeTimesWithoutAmen&D=0000'];
                    let id = ['PrayerGodHaveMercyOnUsPart', '&S=GL'];
                    let kyrielson = prayer[1], lastKyrie;
                    //then we add the refraint + each set of 3 prayers
                    for (let i = 1; i < 14; i += 3) {
                        i + 2 == 15 ? lastKyrie = prayer[2] : lastKyrie = kyrielson;
                        temp.push(prayer[0], id[0] + i.toString() + id[1], kyrielson, id[0] + (i + 1).toString() + id[1], kyrielson, id[0] + (i + 2).toString() + id[1], lastKyrie);
                    }
                    ;
                    btnIncenseDawn.prayers.splice(index, 0, ...temp);
                })();
                //We will then add the GreatLent      Doxologies to the Doxologies before the first Doxology of St. Mary
                (function addGreatLentDoxologies() {
                    index = btnIncenseDawn.prayers.indexOf('PrayerDoxologyArchangelMichaelWates&D=0000') - 1;
                    if (todayDate.getDay() != 0 && todayDate.getDay() != 6) {
                        btnIncenseDawn.prayers.splice(index, 0, ...['PrayerDoxology1&D=GLWeek', 'PrayerDoxology2&D=GLWeek', 'PrayerDoxology3&D=GLWeek', 'PrayerDoxology4&D=GLWeek', 'PrayerDoxology5&D=GLWeek']);
                    }
                    else if (todayDate.getDay() == (0 || 6)) {
                        btnIncenseDawn.prayers.splice(index, 0, 'PrayerDoxology1&D=GLSundays');
                    }
                    ;
                })();
            }
        })();
        (function addKiahkPrayers() {
            if (Number(copticMonth) == 4) {
                index = btnIncenseDawn.prayers.indexOf('PrayerDoxologyStMaryDate=0000') - 1;
                btnIncenseDawn.prayers.splice(index, 0, ...['PrayerDoxology1&D=0004', 'PrayerDoxology2&D=0004', 'PrayerDoxology3&D=0004', 'PrayerDoxology4&D=0004',
                    'PrayerDoxology5&D=0004',
                    'PrayerDoxology6&D=0004']);
            }
            ;
        })();
        (function addResurrectionPrayers() {
            if (Season == Seasons.Resurrection) {
            }
            ;
        })();
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
                prayers: [],
                prayersArray: btnIncenseDawn.prayersArray,
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
                    showPrayers(btn, false); //We show the prayers of btn (clearSideBar = false)
                    //We then create a goBack btn that we will display on top of containerDiv
                    let goBackDiv = document.createElement('div');
                    createBtn(goBack, goBackDiv, btn.cssClass, false);
                    goBackDiv.style.justifySelf = 'center';
                    goBackDiv.style.justifyContent = 'center';
                    goBackDiv.id = 'goBack';
                    containerDiv.children[0].insertAdjacentElement('beforebegin', goBackDiv);
                }
            });
            let newDiv = document.createElement('div'); //Creating a div container in which the btn will be displayed
            newDiv.classList.add('inlineBtns');
            createBtn(btn, newDiv, btn.cssClass, true); //creating the html div for the button (which is a div with an 'on click' event listener calling showChildButtonsOrPrayers(btn))
            btnIncenseDawn.prayers.map(prayer => {
                if (prayer.includes('DoxologiesAdam')) {
                    //adding the id of the prayer to the prayers of the inline button that we created
                    btn.prayers.push(prayer);
                    //then removing the prayer id from the btnIncenseDawn.prayers array in order to exclude them unless requested by the user by clicking on the inline button
                    btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf(prayer), 1);
                }
                ;
            });
            //We first show the prayers of btnIncenseDawn
            showPrayers(btnIncenseDawn, false);
            //We set showPrayers to false in order to prevent the prayers from being shown again by showChildButtonsOrPrayers()
            //then we append the newDiv
            containerDiv.children[0].insertAdjacentElement('beforebegin', newDiv); //Inserting the div containing the button as 1st element of containerDiv
        })();
        (function insertGospelReadings() {
            return __awaiter(this, void 0, void 0, function* () {
                let responses = setGospelPrayers(Readings.GospelDawn); //this gives us an array like ['PsalmResponse&D=####', 'RGID', 'GospelResponse&D=####']
                btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf('PrayerGospelPrayerPart2&D=0000') + 1, 0, responses[0]); //inserting Psalm Response id (which corresponds to responses[0])
                btnIncenseDawn.prayers.splice(btnIncenseDawn.prayers.indexOf('PrayerGospelResponse&D=0000'), 1, responses[2]); //inserting Psalm Response id (which corresponds to responses[0])
                //We create a fake button that we will pass to showPrayers() in order to retrieve the Gospel Text and append it to newDiv
                let fakeBtn = new Button({
                    btnID: 'fakeGospelReadingBtn',
                    label: { AR: '', FR: '' },
                    cssClass: inlineBtnClass,
                    prayers: [responses[1] + '&D=' + copticReadingsDate],
                    prayersArray: ReadingsArrays.GospelDawnArray,
                    languages: btnReadingsGospelIncenseDawn.languages,
                });
                //We create a new div to which we will append the Gospel
                let gospelDiv = document.createElement('div');
                gospelDiv.style.display = 'grid';
                gospelDiv.style.backgroundColor = 'white';
                findAndProcessPrayers(fakeBtn.prayers[0], fakeBtn, gospelDiv);
                //We will create another div in which we will put the Psalm text
                let psalmDiv = document.createElement('div');
                psalmDiv.style.backgroundColor = 'white';
                if (gospelDiv.children[0] && gospelDiv.children[0].classList.contains('TargetRowTitle')) {
                    //If the first child is a div with class 'TargetRowTitle', it means this is the title of the Psalm
                    psalmDiv.appendChild(gospelDiv.children[0]); //we append the title to the psalmDiv
                    for (let i = 0; i < gospelDiv.children.length; i += 0) {
                        //We then loop through the following children of newDiv. If they do not have the class 'TargetRowTitle' it means this is the core text of the Psalm, we append it to the psalmDiv and remove it from the newDiv.
                        if (!gospelDiv.children[i].classList.contains('TargetRowTitle')) {
                            psalmDiv.appendChild(gospelDiv.children[i]);
                        }
                        else {
                            //If we stumble upon another child div with the class 'TargetRowTitle', this is the title of the gospel itself, we break.
                            break;
                        }
                    }
                }
                ;
                containerDiv.querySelector('div[data-root=\"' + 'PrayerGospelIntroductionPsalmComment&D=0000' + '\"').insertAdjacentElement('afterend', psalmDiv);
                containerDiv.querySelector('div[data-root=\"' + 'PrayerGospelIntroductionGospelComment&D=0000' + '\"').insertAdjacentElement('afterend', gospelDiv);
                //Setting the number of columns and their widths for the each child of psalmDiv
                setCSSGridTemplate(psalmDiv);
                //Setting the number of columns and their widths for the each child of newDiv
                setCSSGridTemplate(gospelDiv);
            });
        })();
        (function removeEklonominTaghonataExcessiveTitles() {
            return __awaiter(this, void 0, void 0, function* () {
                let titles = containerDiv.querySelectorAll('div[data-root="PrayerGodHaveMercyOnUsRefrain&S=GL"]');
                if (titles) {
                    for (let i = 7; i < titles.length; i += 7) {
                        titles[i].remove();
                    }
                }
                ;
                let links = rightSideBar.querySelector('#sideBarBtns').querySelectorAll('a[href*="#PrayerGodHaveMercyOnUsRefrain"');
                for (let i = 1; i < links.length; i++) {
                    links[i].remove();
                }
                ;
            });
        })();
    })
});
const btnIncenseVespers = new Button({
    btnID: 'btnIncenseVespers',
    label: {
        AR: "بخور عشية",
        FR: 'Incense Vespers'
    },
    showPrayers: true,
    prayersArray: PrayersArray,
    languages: [...prayersLanguages],
    onClick: () => {
        (function setBtnChildrenAndPrayers() {
            btnIncenseVespers.children = [btnReadingsGospelIncenseVespers];
            btnIncenseVespers.prayers = [...IncensePrayers];
        })();
        (function removingNonRelevantLitanies() {
            //removing the Sick Litany
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('  PrayerSickPrayerPart1&D=0000'), 5);
            //removing the Travelers Litany from IncenseVespers prayers
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('PrayerTravelersPrayerPart1Date=0000'), 5);
            //removing the Oblations Litany from IncenseVespers paryers
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('PrayerOblationsPrayerPart1Date=0000'), 5);
            //removing the Dawn Doxology for St. Mary
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('PrayerDoxologyDawnWatesStMary'), 1);
            //removing the Angels' prayer
            btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('PrayerAngelsPrayer&D=0000'), 1);
        })();
        (function adaptCymbalVerses() {
            //removing the non-relevant Cymbal prayers according to the day of the week: Wates/Adam
            if (todayDate.getDay() > 2) {
                //we are between Wednesday and Saturday, we keep only the "Wates" Cymbal prayers
                btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf("PrayerCymbalVersesAdam&D=0000"), 1);
            }
            else {
                //we are Sunday, Monday, or Tuesday. We keep only the "Adam" Cymbal prayers
                btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf("PrayerCymbalVersesWates&D=0000"), 1);
            }
            ;
        })();
        (function removeEklonominTaghonata() {
            //We remove "Eklonomin Taghonata" from the prayers array
            if ((Season != Seasons.GreatLent && Season != Seasons.JonahFast) || (todayDate.getDay() == 0 || todayDate.getDay() == 6)) {
                btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('PrayerGodHaveMercyOnUsRefrainComment&S=GL'), 36); //this is the comment, we remove 36 prayers including the comment
            }
            ;
        })();
        return btnIncenseVespers.prayers;
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        (function insertGospelReadings() {
            return __awaiter(this, void 0, void 0, function* () {
                let responses = setGospelPrayers(Readings.GospelVespers); //this gives us an array like ['PsalmResponse&D=####', 'RGIV', 'GospelResponse&D=####']
                btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('PrayerGospelPrayerPart2&D=0000') + 1, 0, responses[0]); //inserting Psalm Response id (which corresponds to responses[0])
                btnIncenseVespers.prayers.splice(btnIncenseVespers.prayers.indexOf('PrayerGospelResponse&D=0000'), 1, responses[2]); //inserting Psalm Response id (which corresponds to responses[0])
                //We create a fake button that we will pass to showPrayers() in order to retrieve the Gospel Text and append it to newDiv
                let fakeBtn = new Button({
                    btnID: 'fakeGospelReadingBtn',
                    label: { AR: '', FR: '' },
                    cssClass: inlineBtnClass,
                    prayers: [responses[1] + '&D='],
                    prayersArray: ReadingsArrays.GospelVespersArray,
                    languages: btnReadingsGospelIncenseVespers.languages,
                });
                let today = new Date(todayDate.getTime() + calendarDay);
                let date = setSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today), today);
                fakeBtn.prayers[0] += date;
                //We create a new div to which we will append the Gospel
                let gospelDiv = document.createElement('div');
                gospelDiv.style.display = 'grid';
                gospelDiv.style.backgroundColor = 'white';
                findAndProcessPrayers(fakeBtn.prayers[0], fakeBtn, gospelDiv);
                //We will create another div in which we will put the Psalm text
                let psalmDiv = document.createElement('div');
                psalmDiv.style.backgroundColor = 'white';
                if (gospelDiv.children[0] && gospelDiv.children[0].classList.contains('TargetRowTitle')) {
                    //If the first child is a div with class 'TargetRowTitle', it means this is the title of the Psalm
                    psalmDiv.appendChild(gospelDiv.children[0]); //we append the title to the psalmDiv
                    for (let i = 0; i < gospelDiv.children.length; i += 0) {
                        //We then loop through the following children of newDiv. If they do not have the class 'TargetRowTitle' it means this is the core text of the Psalm, we append it to the psalmDiv and remove it from the newDiv.
                        if (!gospelDiv.children[i].classList.contains('TargetRowTitle')) {
                            psalmDiv.appendChild(gospelDiv.children[i]);
                        }
                        else {
                            //If we stumble upon another child div with the class 'TargetRowTitle', this is the title of the gospel itself, we break.
                            break;
                        }
                    }
                }
                ;
                containerDiv.querySelector('div[data-root=\"' + 'PrayerGospelIntroductionPsalmComment&D=0000' + '\"').insertAdjacentElement('afterend', psalmDiv);
                containerDiv.querySelector('div[data-root=\"' + 'PrayerGospelIntroductionGospelComment&D=0000' + '\"').insertAdjacentElement('afterend', gospelDiv);
                //Setting the number of columns and their widths for the each child of psalmDiv
                setCSSGridTemplate(psalmDiv);
                //Setting the number of columns and their widths for the each child of newDiv
                setCSSGridTemplate(gospelDiv);
            });
        })();
    })
});
const btnMassStCyril = new Button({
    btnID: 'btnMassStCyril',
    rootID: 'StCyril',
    label: { AR: "كيرلسي", FR: "Saint Cyril", EN: "St Cyril" },
    showPrayers: true,
    prayersArray: PrayersArray,
    languages: [...prayersLanguages],
    onClick: () => {
        if (btnsPrayers[btns.indexOf(btnMassStCyril)]) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
            btnMassStCyril.prayers = btnsPrayers[btns.indexOf(btnMassStCyril)];
            return;
        }
        ;
        //Setting the standard mass prayers sequence
        btnMassStCyril.prayers = [...MassPrayers.MassCommonIntro, ...MassPrayers.MassStCyril, ...["PMCTheHolyBodyAndTheHolyBlodPart3&D=0000",
                "PrayerKyrieElieson&D=0000",
                "PrayerBlockIriniPassi&D=0000",
                "PMCFractionPrayerPlaceholder&D=0000",
                "PrayerOurFatherWhoArtInHeaven&D=0000",
                "PMCConfession&D=0000",
                "PMCConfessionComment&D=0000"], ...MassPrayers.Communion];
        return btnMassStCyril.prayers;
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        //Adding 2 buttons to redirect to the St Basil or St Gregory Reconciliation prayer
        redirectToAnotherMass(containerDiv.children[4].getAttribute('data-root'), [btnMassStBasil, btnMassStGregory, btnMassStJohn], "beforebegin");
        //Adding 2 buttons to redirect to the St Basil or St Gregory Anaphora prayer
        redirectToAnotherMass('PMCAnaphoraComment1&D=0000', [btnMassStBasil, btnMassStGregory], "beforebegin");
        //Adding 2 buttons to redirect to the St Basil or St Gregory Masses After the Spasmos
        redirectToAnotherMass('PMCSpasmosComment&D=0000', [btnMassStBasil, btnMassStGregory], 'beforebegin');
        scrollToTop(); //scrolling to the top of the page
    })
});
const btnMassStGregory = new Button({
    btnID: 'btnMassStGregory',
    rootID: 'StGregory',
    label: { AR: "غريغوري", FR: "Saint Gregory" },
    showPrayers: true,
    prayersArray: PrayersArray,
    languages: [...prayersLanguages],
    onClick: () => {
        if (btnsPrayers[btns.indexOf(btnMassStGregory)]) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
            btnMassStGregory.prayers = btnsPrayers[btns.indexOf(btnMassStGregory)];
            return;
        }
        ;
        //Setting the standard mass prayers sequence
        btnMassStGregory.prayers = [...MassPrayers.MassCommonIntro, ...MassPrayers.MassStGregory, ...MassPrayers.MassCallOfHolySpirit, ...MassPrayers.MassLitanies, ...MassPrayers.Communion];
        //removing irrelevant prayers from the array
        btnMassStGregory.prayers.splice(btnMassStGregory.prayers.indexOf('PMCCallOfTheHolySpiritPart1Comment&D=0000'), 10);
        return btnMassStGregory.prayers;
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        //Adding 3 buttons to redirect to the St Basil or St Cyril Reconciliation prayer
        redirectToAnotherMass(containerDiv.children[4].getAttribute('data-root'), [btnMassStBasil, btnMassStCyril, btnMassStJohn], "beforebegin");
        //We add buttons to redirect to the other Reconciliation masses
        redirectToAnotherMass('PMCAgiosComment1&D=0000', [btnMassStBasil], "beforebegin");
        //We add buttons to redirect to St Basil After the Espasmos
        redirectToAnotherMass('PMCSpasmosComment&D=0000', [btnMassStBasil], "beforebegin");
        scrollToTop(); //scrolling to the top of the page                
    })
});
const btnMassStBasil = new Button({
    btnID: 'btnMassStBasil',
    rootID: 'StBasil',
    label: { AR: 'باسيلي', FR: 'Saint Basil', EN: 'St Basil' },
    showPrayers: true,
    prayersArray: PrayersArray,
    languages: [...prayersLanguages],
    onClick: () => {
        if (btnsPrayers[btns.indexOf(btnMassStBasil)]) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array 
            btnMassStBasil.prayers = btnsPrayers[btns.indexOf(btnMassStBasil)];
            return;
        }
        ;
        //Setting the standard mass prayers sequence
        btnMassStBasil.prayers = [...MassPrayers.MassCommonIntro, ...MassPrayers.MassStBasil, ...MassPrayers.MassCallOfHolySpirit, ...MassPrayers.MassLitanies, ...MassPrayers.Communion];
        return btnMassStBasil.prayers;
    },
    afterShowPrayers: () => __awaiter(this, void 0, void 0, function* () {
        //We add buttons to redirect to the other Reconciliation masses
        redirectToAnotherMass(containerDiv.children[4].getAttribute('data-root'), [btnMassStGregory, btnMassStCyril, btnMassStJohn], "beforebegin");
        //We scroll to the beginning of the page after the prayers have been displayed
        scrollToTop();
    })
});
const btnMassStJohn = new Button({
    btnID: 'btnMassStJohn',
    label: { AR: 'القديس يوحنا', FR: 'Saint Jean' },
    showPrayers: false,
    prayers: [],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
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
const btnMassOfferingOfTheLamb = new Button({
    btnID: 'btnMassOfferingOfTheLamb',
    label: { AR: 'تقديم الحمل', FR: "Présentation de l'Agneau" }
});
const btnMassRoshoumat = new Button({
    btnID: 'btnMassRoshoumat',
    label: { AR: 'رشومات الحمل', FR: "Roshoumat El Hamal" }
});
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
const btnMassReadings = new Button({
    btnID: 'btnMassReadings',
    label: {
        AR: 'القراءات',
        FR: 'Lectures'
    },
    prayers: [Readings.StPaul, Readings.Katholikon, Readings.Praxis, Readings.Synaxarium, Readings.GospelMass],
});
const btnDayReadings = new Button({
    btnID: 'btnDayReadings',
    label: { AR: "قراءات اليوم", FR: "Lectures du jour", EN: 'Day\'s Readings' },
    onClick: () => {
        //We set the btnDayReadings.children[] property
        btnDayReadings.children = [btnReadingsGospelIncenseVespers, btnReadingsGospelIncenseDawn, btnReadingsStPaul, btnReadingsKatholikon, btnReadingsPraxis, btnReadingsGospelMass];
        if (Season == Seasons.GreatLent && todayDate.getDay() != 6) {
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
            else if (todayDate.getDay() == 0) {
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
    prayers: [Readings.StPaul],
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
    prayers: [Readings.Katholikon],
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
    prayers: [Readings.Praxis],
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
    prayers: [Readings.Synaxarium],
    prayersArray: ReadingsArrays.SynaxariumArray,
    languages: [...readingsLanguages],
    onClick: () => {
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
    prayers: setGospelPrayers(Readings.GospelMass),
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
    prayers: [Readings.GospelVespers + '&D='],
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
    prayers: setGospelPrayers(Readings.GospelDawn),
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
    prayers: setGospelPrayers(Readings.GospelNight),
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
    prayers: [Readings.PropheciesDawn],
    prayersArray: ReadingsArrays.PropheciesDawnArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    }
});
const btnHeteneyat = new Button({
    btnID: 'btnHeteneyat',
    label: { AR: 'الهيتنيات', FR: 'Heteneyat' }
});
const btnPraxisResponse = new Button({
    btnID: 'btnPraxisResponse',
    label: { AR: 'مرد الإبركسيس', FR: 'Réponse Praxis' }
});
const btnMassGospelResponse = new Button({
    btnID: 'btnMassGospelResponse',
    label: { AR: 'مرد الإنجيل', FR: 'Réponse Evangile' }
});
/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayers(liturgie) {
    //this function sets the date or the season for the Psalm response and the gospel response
    let prayers = [...GospelPrayers], date = '0000';
    let psalm = prayers.indexOf('PrayerPsalmResponse&D='), gospel = prayers.indexOf('PrayerGospelResponse&D=');
    //we replace the word 'Mass' in 'ReadingsGospelMass' by the liturige, e.g.: 'IncenseDawn'
    prayers[psalm + 1] = prayers[psalm + 1].replace(Readings.GospelMass, liturgie);
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
        prayers[index] = prayers[index].replace('&D=', '&D=' + date);
    }
    ;
    return prayers;
}
;
let btnsPrayers = [];
let btns = [btnIncenseDawn, btnIncenseVespers, btnMassStCyril, btnMassStBasil, btnMassStGregory];
function redirectToAnotherMass(id, btns, position) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = 'div[data-root=\'';
        let dataset = query + id + '\']';
        let redirectTo = [];
        btns.map(btn => {
            let newBtn = new Button({
                btnID: 'GoTo' + id + btn.rootID,
                label: {
                    AR: btn.label.AR,
                    FR: btn.label.FR,
                },
                cssClass: inlineBtnClass,
                onClick: () => {
                    showChildButtonsOrPrayers(btn);
                    let target = containerDiv.querySelector(dataset);
                    if (target) {
                        target.id = id;
                        createFakeAnchor(target.id);
                    }
                    ;
                }
            });
            redirectTo.push(newBtn);
        });
        insertRedirectionButtons(dataset, redirectTo, position);
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
function getVespersGospel(prayers) {
    if (todayDate.getHours() > 15) {
        let date = new Date(todayDate.getTime() + calendarDay);
        let readingsDate = setSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(date));
        prayers[1] += '&D=' + readingsDate;
        return prayers;
    }
    else {
        return prayers;
    }
}
