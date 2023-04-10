var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const copticReadingsDates = getCopticReadingsDates();
/**
 * Adds or removes a language to the userLanguages Array
 * @param el {HTMLElement} - the html button on which the user clicked to add or remove the language. The language is retrieved from the element's dataset
 */
function addOrRemoveLanguage(el) {
    let lang;
    lang = el.dataset.lang;
    //we check that the language that we need to add is included in the userLanguages array
    if (userLanguages.indexOf(lang) > -1) {
        //The language is included in the userLanguages
        if (lang == 'CA' && userLanguages.indexOf('COP') == -1) {
            userLanguages.splice(userLanguages.indexOf(lang), 1, 'COP');
        }
        else if (lang == 'EN' && userLanguages.indexOf('FR') == -1) {
            userLanguages.splice(userLanguages.indexOf(lang), 1, 'FR');
        }
        else {
            userLanguages.splice(userLanguages.indexOf(lang), 1);
        }
        ;
        el.innerText = el.innerText.replace("Remove", "Add");
    }
    else if (userLanguages.indexOf(lang) == -1) {
        //The language is not included in user languages, we will add it
        //if the user adds the Coptic in Arabic characters, we assume he doesn't need the Coptic text we do the same for English and French
        if (lang == 'CA' && userLanguages.indexOf('COP') > -1) {
            userLanguages.splice(userLanguages.indexOf('COP'), 1, lang);
        }
        else if (lang == 'EN' && userLanguages.indexOf('FR') > -1) {
            userLanguages.splice(userLanguages.indexOf('FR'), 1, lang);
            console.log(userLanguages);
        }
        else {
            userLanguages.push(lang);
        }
        ;
        el.innerText = el.innerText.replace("Add", "Remove");
    }
    ;
    localStorage.userLanguages = JSON.stringify(userLanguages);
    //in order to refresh the view after adding or removing a language, we call the showChildButtonsOrPrayers passing to it the lasClickedButton which is a variable storing the last clicked sideBar Button (its class is Button) that is displaying its prayers/children/inlineBtns, etc.,
    showChildButtonsOrPrayers(lastClickedButton);
}
;
/**
 * Removed (if included) or adds (if missing) a given language from/to userLanguages[]
 * @param {string} lang - the language that will be removed or added to userLanguages[]
 */
function modifyUserLanguages(lang) {
    if (userLanguages.indexOf(lang) > -1) {
        //lang is included, we will remove it
        userLanguages.splice(userLanguages.indexOf(lang), 1);
    }
    else if (userLanguages.indexOf(lang) < 0) {
        //lang is not included, we will add it
        userLanguages.splice(allLanguages.indexOf(lang), 0, lang);
    }
    ;
    localStorage.userLanguages = JSON.stringify(userLanguages);
}
;
/**
 * Changes the current Gregorian date and adjusts the coptic date and the coptic readings date, etc.
 * @param {string} date  - allows the user to pass the Greogrian calendar day to which he wants the date to be set, as a string provided from an input box or by the date picker
 * @param {boolean} next  - used when the user wants to jumb forward or back by only one day
 * @param {number} days  - the number of days by which the user wants to jumb forward or back
 * @returns {Date} - the Gregorian date as set by the user
 */
function changeDay(date, next = true, days = 1) {
    let currentDate = todayDate.getTime();
    if (date) {
        currentDate = new Date(date).getTime();
        todayDate.setTime(currentDate);
        console.log(todayDate);
    }
    else {
        if (next) {
            todayDate.setTime(currentDate + (days * calendarDay));
        }
        else if (!next) {
            todayDate.setTime(currentDate - (days * calendarDay));
        }
    }
    setCopticDates(todayDate);
    return todayDate;
}
;
autoRunOnLoad();
/**
 * Some functions that we run automatically when loading the app
 */
function autoRunOnLoad() {
    showChildButtonsOrPrayers(btnMain);
    //appendRepeatable('Test');
    setCopticDates();
    //setButtonsPrayers();
    DetectFingerSwipe();
    //loadFonts();
    //registerServiceWorker()
    //PWA();
}
;
/**Was meant to load the fonts by a function not from CSS because the github pages do not allow for subfolders */
function loadFonts() {
    return __awaiter(this, void 0, void 0, function* () {
        const AvaShenouda = new FontFace('AvaShenouda', "url(Avva_Shenouda.ttf)");
        const ArialCoptic = new FontFace('ArialCoptic', "url(ArialCoptic.ttf)");
        // wait for font to be loaded
        yield AvaShenouda.load();
        yield ArialCoptic.load();
        // add font to document
        document.fonts.add(AvaShenouda);
        document.fonts.add(ArialCoptic);
        // enable font with CSS class
        document.body.classList.add("fonts-loaded");
    });
}
;
/**
 * gets a prayer id from an input box and passes it directly to showPrayers() to display it
 */
function getPrayerFromInputBox() {
    let input = document.getElementById("elID");
    showPrayers(new Button({ btnID: '', label: { AR: '', FR: '' }, prayers: [input.value] }));
}
;
/**
 *
 * @param firstElement {string} - this is the id of the prayer in the prayersArray
 * @param {string[]} prayers - an array of the text of the prayer which id matched the id in the idsArray. The first element in this array is the id of the prayer. The other elements are, each, the text in a given language. The prayers array is hence structured like this : ['prayerID', 'prayer text in Arabic', 'prayer text in French', 'prayer text in Coptic']
 * @param {string[]} languagesArray - the languages available for this prayer. The button itself provides this array from its "Languages" property
 * @param {string[]} userLanguages - a globally declared array of the languages that the user wants to show.
 * @param {string} actorClass - a class that will be given to the html element showing the prayer according to who is saying the prayer: is it the Priest, the Diacon, or the Assembly?
 */
function createHtmlElementForPrayer(firstElement, prayers, languagesArray, userLanguages, actorClass, position = containerDiv) {
    let row, p, lang, text;
    row = document.createElement("div");
    row.classList.add("TargetRow"); //we add 'TargetRow' class to this div
    let dataRoot = firstElement.replace(/Part\d+/, '');
    row.dataset.root = dataRoot;
    if (actorClass && actorClass !== 'Title') {
        // we don't add the actorClass if it is "Title", because in this case we add a specific class called "TargetRowTitle" (see below)
        row.classList.add(actorClass);
    }
    else if (actorClass && actorClass == 'Title') {
        row.addEventListener('click', (e) => { e.preventDefault; collapseText(row); }); //we also add a 'click' eventListener to the 'TargetRowTitle' elements
    }
    ;
    //looping the elements containing the text of the prayer in different languages,  starting by 1 since 0 is the id
    for (let x = 1; x < prayers.length; x++) {
        //x starts from 1 because prayers[0] is the id
        if (actorClass && (actorClass == 'Comment' || actorClass == 'CommentText')) {
            //this means it is a comment
            x == 1 ? lang = languagesArray[1] : lang = languagesArray[3];
        }
        else {
            lang = languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
        }
        ; //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
        if (userLanguages.indexOf(lang) > -1) {
            if (actorClass && new Map(JSON.parse(localStorage.showActors)).get(actorClass) == false) {
                //If had hide an actor, we will stop and return
                return;
            }
            ;
            p = document.createElement("p"); //we create a new <p></p> element for the text of each language in the 'prayer' array (the 'prayer' array is constructed like ['prayer id', 'text in AR, 'text in FR', ' text in COP', 'text in Language', etc.])
            if (actorClass == "Title") {
                //this means that the 'prayer' array includes the titles of the prayer since its first element ends with '&C=Title'.
                row.classList.add("TargetRowTitle");
                row.id = prayers[0];
                row.tabIndex = 0; //in order to make the div focusable by using the focus() method
            }
            else if (actorClass) {
                //if the prayer is a comment like the comments in the Mass
                p.classList.add(actorClass);
            }
            else {
                //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
                p.classList.add('PrayerText');
            }
            ;
            p.dataset.root = dataRoot; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
            text = prayers[x];
            p.dataset.lang = lang; //we are adding this in order to be able to retrieve all the paragraphs in a given language by its data attribute. We need to do this in order for example to amplify the font of a given language when the user double clicks
            p.textContent = text;
            p.addEventListener('dblclick', (event) => {
                toggleAmplifyText(event, 'amplifiedTextSize');
            }); //adding a double click eventListner that amplifies the text size of the chosen language;
            row.appendChild(p); //the row which is a <div></div>, will encapsulate a <p></p> element for each language in the 'prayer' array (i.e., it will have as many <p></p> elements as the number of elements in the 'prayer' array)
        }
        else {
        }
        ;
    }
    ;
    //@ts-ignore
    position.el ? position.el.insertAdjacentElement(position.beforeOrAfter, row) : position.appendChild(row);
    return row;
}
;
/**
 * Shows a bookmark link in the right side bar for each title in the currently displayed prayers
 * @param {NodeListOf<>Element} titlesCollection  - a Node list of all the divs containing the titles of the different sections. Each div will be passed to addTitle() in order to create a link in the right side bar pointing to the div
 * @param {HTMLElement} rightTitlesDiv - the right hand side bar div where the titles will be displayed
 * @param {boolean} clear - indicates whether the side bar where the links will be inserted, must be cleared before insertion
 */
function showTitlesInRightSideBar(titlesCollection, rightTitlesDiv, btn, clear = true) {
    return __awaiter(this, void 0, void 0, function* () {
        //this function shows the titles in the right side Bar
        if (clear) {
            rightTitlesDiv.innerHTML = '';
        }
        ; //we empty the side bar
        let bookmark, div;
        for (let i = 0; i < titlesCollection.length; i++) {
            titlesCollection[i].id += i.toString(); //we do this in order to give each title a distinctive id in cases where all the titles have the same id
            addTitle(titlesCollection[i]);
        }
        ;
        /**
         * Adds shortcuts to the diffrent sections by redirecting to the title of the section
         * @param {HTMLElement} titles - a div including paragraphs, each displaying the title of the section in a given langauge
         */
        function addTitle(titles) {
            let text = '';
            div = document.createElement('div'); //this is just a container
            div.role = 'button';
            rightTitlesDiv.appendChild(div);
            bookmark = document.createElement('a');
            div.appendChild(bookmark);
            bookmark.href = '#' + titles.id; //we add a link to the element having as id, the id of the prayer
            div.classList.add('sideTitle');
            div.addEventListener('click', () => closeSideBar(rightSideBar)); //when the user clicks on the div, the rightSideBar is closed	
            if (titles.querySelector('.AR')) {
                //if the titles div has a paragraph child with class="AR", it means this is the paragraph containing the Arabic text of the title
                text += titles.querySelector('.AR').textContent.replace(String.fromCharCode(10134), ''); //we remove the '-' sign from the text of the Arabic paragraph;
            }
            ;
            if (titles.querySelector('.FR')) {
                if (text != '') {
                    text += '\n' + titles.querySelector('.FR').textContent;
                }
                else {
                    text += titles.querySelector('.FR').textContent;
                }
                ;
            }
            ;
            bookmark.innerText = text;
        }
        ;
    });
}
;
/**
 * Takes a Button and, depending on its properties will do the following: if the button has children[] buttons, it will create an html element in the left side bar for each child; if the button has inlineBtns[], it will create an html element in the main page for each inlineButton; if the button has prayers[] and prayersArray, and languages, it will look in the prayersArray for each prayer in the prayers[], and if found, will create an html element in the main page showing the text of this element. It will only do so for the languages included in the usersLanguages.
 * @param {Button} btn - the button that the function will process according to its properties (children[], inlineBtns[], prayers[], onClick(), etc.)
 * @param {boolean} clear - whether to clear or not the text already displayed in the main page
 * @param {boolean} click - if the button has its onClick property (which is a function) and if click = true, the onClick function will be called
 * @param {boolean} pursue - after the onClick function is called, if pursue = false, the showchildButtonsOrPrayers() will return, otherwise, it will continue processing the other properties of the button
 * @returns
 */
function showChildButtonsOrPrayers(btn, clear = true, click = true) {
    if (!btn) {
        return;
    }
    ;
    let btnsDiv = leftSideBar.querySelector('#sideBarBtns');
    if (clear) {
        btnsDiv.innerHTML = '';
        inlineBtnsDiv.innerHTML = '';
    }
    ;
    if (btn.onClick && click) {
        btn.onClick();
        if (btn.pursue == false) {
            return;
        }
        ;
    }
    ;
    if (btn.inlineBtns) {
        let newDiv = document.createElement("div");
        newDiv.style.display = 'grid';
        btn.inlineBtns.map((b) => {
            if (btn.btnID != btnGoBack.btnID) {
                // for each child button that will be created, we set btn as its parent in case we need to use this property on the button
                b.parentBtn = btn.parentBtn;
            }
            ;
            createBtn(b, newDiv, b.cssClass);
        });
        let s = (100 / newDiv.children.length).toString() + "% ";
        newDiv.style.gridTemplateColumns = s.repeat(newDiv.children.length);
        newDiv.classList.add('inlineBtns');
        inlineBtnsDiv.appendChild(newDiv);
    }
    ;
    if (btn.children) {
        btn.children.map((c) => {
            if (btn.btnID != btnGoBack.btnID) {
                // for each child button that will be created, we set btn as its parent in case we need to use this property on the button
                c.parentBtn = btn;
            }
            ;
            createBtn(c, btnsDiv, c.cssClass); //creating and showing a new html button element for each child
        });
    }
    ;
    if (btn.prayers && btn.prayersArray && btn.languages && btn.showPrayers) {
        showPrayers(btn, true, true, containerDiv);
    }
    ;
    if (btn.afterShowPrayers) {
        btn.afterShowPrayers();
    }
    ;
    //Important ! : setCSSGridTemplate() MUST be called after btn.afterShowPrayres()
    setCSSGridTemplate(containerDiv.querySelectorAll('.TargetRow')); //setting the number and width of the columns for each html element with class 'TargetRow'
    applyAmplifiedText(containerDiv.querySelectorAll('p[data-lang]'));
    showTitlesInRightSideBar(containerDiv.querySelectorAll('div.TargetRowTitle'), rightSideBar.querySelector('#sideBarBtns'), btn);
    if (btn.parentBtn && btn.btnID !== btnGoBack.btnID) {
        createGoBackBtn(btn, btnsDiv, btn.cssClass)
            .then((b) => b.addEventListener("click", (e) => {
            e.preventDefault;
            showChildButtonsOrPrayers(btn.parentBtn);
        }));
        lastClickedButton = btn;
    }
    ;
    if (btn.btnID !== btnMain.btnID && btn.btnID !== btnGoBack.btnID) {
        createBtn(btnMain, btnsDiv, btnMain.cssClass);
        let image = document.getElementById('homeImg');
        if (image) {
            document.getElementById('homeImg').style.width = '20vmax';
            document.getElementById('homeImg').style.height = '25vmax';
        }
    }
    ;
    if (btn.parentBtn && btn.btnID == btnGoBack.btnID) {
        showChildButtonsOrPrayers(btn.parentBtn);
    }
    ;
}
;
/**
     * Returns an html button element showing a 'Go Back' button. When clicked, this button passes the goTo button or inline button to showchildButtonsOrPrayers(), as if we had clicked on the goTo button
     * @param {Button} goTo - a button that, when the user clicks the 'Go Back' html button element generated by the function, calls showchildButtonsOrPrayers(goTo) thus simulating the action of clicking on the goTo button (its children, inlineBtns, prayers, etc., will be displayed)
     * @param {HTMLElement} div - the html element to which the html element button created and returned by the function, will be appended
     * @returns {Promise<HTMLElement>} - when resolved, the function returns the html button element it has created and appended to div
     */
function createGoBackBtn(goTo, div, cssClass, bookmarkID) {
    return __awaiter(this, void 0, void 0, function* () {
        //We will create a 'Go Back' and will append it to newDiv
        let goBak = new Button({
            btnID: btnGoBack.btnID,
            label: btnGoBack.label,
            cssClass: inlineBtnClass,
            onClick: () => {
                //This should get us back to the fraction prayers section of the Mass. We will temporary set the action to re-displaying the mass
                showChildButtonsOrPrayers(goTo);
                if (bookmarkID) {
                    //We will create a fake HTMLAnchorElement, will set its href to the id of the element provided in the bookmark parameter, and will click it
                    createFakeAnchor(bookmarkID);
                }
                ;
            }
        });
        goBak.cssClass = cssClass;
        return createBtn(goBak, div, goBak.cssClass); //notice that we are appending goBak to inlineBtnsDiv (which is the fixed position div), not to the newDiv. We do this in order for the goBack button to appear in a separate div not in the same 'grid' displayed div as the fraction inline buttons
    });
}
;
/** */
function createFakeAnchor(id) {
    let a = document.createElement('a');
    a.href = '#' + id;
    a.click();
    a.remove();
}
;
/**
     * Creates an html element for the button and shows it in the relevant side bar. It also attaches an 'onclick' event listener to the html element which passes the button it self to showChildButtonsOrPrayers()
     * @param {Button} btn  - the button that will be displayed as an html element in the side bar
     * @param {HTMLElement} btnsBar  - the side bar where the button will be displayed
     * @param {string} btnClass  - the class that will be given to the button (it is usually the cssClass property of the button)
     * @returns {HTMLElement} - the html element created for the button
     */
function createBtn(btn, btnsBar, btnClass, clear = true) {
    let newBtn = document.createElement('button');
    btnClass ? newBtn.classList.add(btnClass) : newBtn.classList.add(btn.cssClass);
    newBtn.id = btn.btnID;
    for (let lang in btn.label) {
        //for each language in btn.text, we create a new "p" element
        if (btn.label[lang]) {
            let btnLable = document.createElement("p");
            //we edit the p element by adding its innerText (=btn.text[lang], and its class)
            editBtnInnerText(btnLable, btn.label[lang], "btnLable" + lang);
            //we append the "p" element  to the newBtn button
            newBtn.appendChild(btnLable);
        }
        ;
    }
    ;
    btnsBar.appendChild(newBtn);
    if (btn.children || btn.prayers || btn.onClick || btn.inlineBtns) {
        // if the btn object that we used to create the html button element, has children, we add an "onclick" event that passes the btn itself to the showChildButtonsOrPrayers. This will create html button elements for each child and show them
        newBtn.addEventListener('click', (e) => {
            e.preventDefault;
            showChildButtonsOrPrayers(btn, clear);
        });
    }
    ;
    function editBtnInnerText(el, text, btnClass) {
        el.innerText = text;
        el.classList.add("btnText");
        if (btnClass) {
            el.classList.add(btnClass);
        }
        ;
    }
    ;
    return newBtn;
}
;
/** */
function PWA() {
    /** */
    function getPWADisplayMode() {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        if (document.referrer.startsWith("android-app://")) {
            return "twa";
            //@ts-ignore
        }
        else if (navigator.standalone || isStandalone) {
            return "standalone";
        }
        return "browser";
    }
}
;
function registerServiceWorker() {
    const registerServiceWorker = () => __awaiter(this, void 0, void 0, function* () {
        if ("serviceWorker" in navigator) {
            try {
                const registration = yield navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                });
                if (registration.installing) {
                    console.log("Service worker installing");
                }
                else if (registration.waiting) {
                    console.log("Service worker installed");
                }
                else if (registration.active) {
                    console.log("Service worker active");
                }
            }
            catch (error) {
                console.error(`Registration failed with ${error}`);
            }
        }
    });
}
;
/**
 * returns a string[][], each string[] element includes 2 elements: the current coptic date (as as string formatted like "DDMM") and the corresponding readings date if any (also formatted as "DDMM").
 * @returns {string[][]}
 */
function getCopticReadingsDates() {
    return [
        ["1903", "1307"],
        ["1301", "1703"],
        ["1101", "2708"],
        ["0901", "2803"],
        ["0501", "3005"],
        ["1001", "3005"],
        ["1508", "0105"],
        ["1907", "0105"],
        ["2005", "0105"],
        ["2209", "0105"],
        ["2510", "0105"],
        ["2908", "0105"],
        ["0110", "0105"],
        ["0309", "0105"],
        ["0611", "0105"],
        ["1501", "0105"],
        ["2401", "0105"],
        ["2602", "0105"],
        ["1612", "0109"],
        ["2105", "0109"],
        ["2110", "0109"],
        ["0304", "0109"],
        ["2504", "0206"],
        ["0704", "0206"],
        ["0711", "0206"],
        ["2002", "0206"],
        ["3006", "0210"],
        ["1208", "0311"],
        ["1303", "0311"],
        ["1812", "0311"],
        ["2207", "0311"],
        ["2810", "0311"],
        ["3003", "0311"],
        ["3009", "0311"],
        ["0103", "0311"],
        ["0202", "0311"],
        ["0205", "0311"],
        ["0308", "0311"],
        ["0701", "0311"],
        ["0706", "0311"],
        ["0709", "0311"],
        ["0805", "0311"],
        ["1102", "0311"],
        ["1702", "0311"],
        ["1409", "0312"],
        ["1511", "0312"],
        ["1704", "0312"],
        ["2109", "0312"],
        ["2410", "0312"],
        ["2909", "0312"],
        ["0209", "0312"],
        ["0906", "0312"],
        ["1401", "0312"],
        ["1310", "0313"],
        ["1608", "0405"],
        ["1609", "0405"],
        ["1611", "0405"],
        ["2404", "0405"],
        ["2906", "0405"],
        ["1708", "0511"],
        ["1803", "0511"],
        ["1811", "0511"],
        ["2104", "0511"],
        ["2106", "0511"],
        ["2911", "0511"],
        ["0404", "0511"],
        ["0807", "0511"],
        ["1006", "0511"],
        ["0604", "0605"],
        ["0806", "0605"],
        ["1505", "0801"],
        ["2004", "0801"],
        ["2010", "0801"],
        ["2212", "0801"],
        ["2307", "0801"],
        ["2606", "0801"],
        ["2610", "0801"],
        ["2611", "0801"],
        ["0401", "0801"],
        ["0412", "0801"],
        ["0504", "0801"],
        ["0508", "0801"],
        ["0509", "0801"],
        ["0601", "0801"],
        ["0708", "0801"],
        ["0910", "0801"],
        ["2102", "0801"],
        ["2501", "0801"],
        ["0106", "0903"],
        ["0303", "0903"],
        ["0407", "0903"],
        ["1201", "0903"],
        ["0812", "1009"],
        ["1509", "1202"],
        ["1210", "1203"],
        ["2111", "1307"],
        ["0402", "1307"],
        ["0403", "1307"],
        ["0804", "1307"],
        ["1002", "1307"],
        ["2107", "1312"],
        ["2507", "1402"],
        ["1211", "1503"],
        ["1510", "1503"],
        ["2411", "1503"],
        ["2805", "1503"],
        ["0112", "1503"],
        ["0410", "1503"],
        ["0411", "1503"],
        ["0606", "1503"],
        ["0912", "1503"],
        ["2807", "1601"],
        ["0909", "1608"],
        ["1104", "1610"],
        ["1506", "1610"],
        ["1603", "1610"],
        ["1705", "1610"],
        ["0204", "1610"],
        ["1007", "1701"],
        ["1212", "1701"],
        ["1209", "1703"],
        ["1406", "1703"],
        ["1412", "1703"],
        ["1504", "1703"],
        ["1806", "1703"],
        ["2103", "1703"],
        ["2706", "1703"],
        ["2809", "1703"],
        ["0104", "1703"],
        ["0302", "1703"],
        ["0502", "1703"],
        ["0603", "1703"],
        ["0705", "1703"],
        ["0902", "1703"],
        ["3001", "1705"],
        ["1008", "2009"],
        ["1206", "2009"],
        ["1405", "2009"],
        ["1906", "2009"],
        ["2505", "2009"],
        ["2910", "2009"],
        ["0108", "2009"],
        ["0306", "2009"],
        ["0702", "2009"],
        ["0703", "2009"],
        ["0907", "2009"],
        ["1204", "2009"],
        ["1302", "2009"],
        ["2502", "2009"],
        ["1807", "2011"],
        ["2008", "2011"],
        ["2408", "2011"],
        ["2506", "2011"],
        ["2608", "2011"],
        ["2806", "2011"],
        ["0208", "2011"],
        ["0610", "2011"],
        ["1502", "2011"],
        ["1902", "2011"],
        ["1107", "2101"],
        ["1407", "2101"],
        ["2301", "2101"],
        ["1804", "2202"],
        ["0406", "2202"],
        ["1010", "2203"],
        ["1308", "2203"],
        ["1905", "2203"],
        ["1911", "2203"],
        ["2012", "2203"],
        ["2210", "2203"],
        ["2603", "2203"],
        ["3011", "2203"],
        ["0107", "2203"],
        ["0408", "2203"],
        ["0707", "2203"],
        ["2701", "2203"],
        ["2801", "2203"],
        ["3007", "2204"],
        ["1309", "2205"],
        ["1710", "2205"],
        ["1909", "2205"],
        ["2310", "2205"],
        ["0510", "2205"],
        ["0904", "2205"],
        ["0908", "2205"],
        ["2402", "2205"],
        ["1910", "2308"],
        ["2312", "2308"],
        ["2711", "2308"],
        ["2712", "2308"],
        ["0609", "2308"],
        ["0710", "2308"],
        ["0809", "2308"],
        ["0703", "2308"],
        ["0810", "2409"],
        ["2509", "2503"],
        ["2511", "2503"],
        ["2808", "2503"],
        ["0505", "2503"],
        ["0802", "2503"],
        ["2802", "2503"],
        ["1103", "2601"],
        ["1304", "2601"],
        ["1606", "2601"],
        ["0712", "2601"],
        ["0512", "2605"],
        ["1411", "2702"],
        ["1809", "2702"],
        ["1912", "2702"],
        ["2707", "2702"],
        ["0506", "2702"],
        ["0811", "2702"],
        ["0905", "2702"],
        ["1604", "2703"],
        ["2311", "2703"],
        ["0503", "2703"],
        ["0607", "2703"],
        ["1012", "2703"],
        ["2902", "2703"],
        ["1110", "2708"],
        ["1306", "2708"],
        ["1404", "2708"],
        ["1605", "2708"],
        ["1706", "2708"],
        ["1808", "2708"],
        ["2211", "2708"],
        ["2306", "2708"],
        ["2705", "2708"],
        ["1111", "2708"],
        ["2201", "2708"],
        ["1101", "2708"],
        ["2201", "2708"],
        ["1004", "2803"],
        ["1109", "2803"],
        ["1311", "2803"],
        ["1403", "2803"],
        ["1410", "2803"],
        ["1707", "2803"],
        ["1709", "2803"],
        ["1805", "2803"],
        ["1904", "2803"],
        ["1908", "2803"],
        ["2206", "2803"],
        ["2303", "2803"],
        ["2305", "2803"],
        ["2406", "2803"],
        ["2412", "2803"],
        ["2704", "2803"],
        ["2709", "2803"],
        ["0207", "2803"],
        ["0310", "2803"],
        ["0507", "2803"],
        ["0513", "2803"],
        ["1011", "2803"],
        ["1112", "2803"],
        ["2302", "2803"],
        ["1106", "2903"],
        ["1207", "2903"],
        ["1408", "2903"],
        ["1607", "2903"],
        ["2006", "2903"],
        ["2007", "2903"],
        ["2208", "2903"],
        ["2407", "2903"],
        ["0203", "2903"],
        ["0307", "2903"],
        ["0409", "2903"],
        ["1602", "2903"],
        ["1802", "2903"],
        ["1810", "2905"],
        ["1003", "3005"],
        ["1108", "3005"],
        ["1507", "3005"],
        ["1512", "3005"],
        ["1711", "3005"],
        ["2121", "3005"],
        ["2405", "3005"],
        ["2508", "3005"],
        ["2604", "3005"],
        ["2607", "3005"],
        ["2811", "3005"],
        ["2905", "3005"],
        ["0102", "3005"],
        ["0212", "3005"],
        ["0602", "3005"],
        ["0608", "3005"],
        ["0612", "3005"],
        ["0808", "3005"],
        ["2001", "3005"],
        ["2901", "3005"],
        ["0211", "3008"],
        ["2003", "3008"],
        ["2309", "3008"],
        ["2710", "3008"],
        ["0111", "3008"],
        ["0911", "3008"],
        ["3002", "3008"],
        ["0301", "0311"],
    ];
}
;
function toggleSideBars() {
    if (leftSideBar.classList.contains('extended') && rightSideBar.classList.contains('collapsed')) {
        closeSideBar(leftSideBar);
    }
    else if (rightSideBar.classList.contains('extended') && leftSideBar.classList.contains('collapsed')) {
        closeSideBar(rightSideBar);
    }
    else if (leftSideBar.classList.contains('collapsed') && leftSideBar.classList.contains('collapsed')) {
        openSideBar(leftSideBar);
    }
}
;
/**
 * Opens the temporary development area
 * @param btn
 */
function openDev(btn) {
    let dev = document.getElementById("Dev");
    dev.style.display = "block";
    btn.removeEventListener("click", () => openDev(btn));
    btn.addEventListener("click", () => closeDev(btn));
}
;
/**
 * Hides the temporary development area at the top
 * @param {HTMLElement} btn - the button which hides the area or shows it
 */
function closeDev(btn) {
    let dev = document.getElementById("Dev");
    dev.style.display = "none";
    btn.removeEventListener("click", () => closeDev(btn));
    btn.addEventListener("click", () => openDev(btn));
}
;
/**
 * Opens the side bar by setting its width to a given value
 * @param {HTMLElement} sideBar - the html element representing the side bar that needs to be opened
 */
function openSideBar(sideBar) {
    //containerDiv.appendChild(sideBar);
    let btnText = String.fromCharCode(9776) + "Close Sidebar";
    let width = "30%";
    sideBar.style.width = width;
    sideBar.classList.remove('collapsed');
    sideBar.classList.add('extended');
    //sideBar == leftSideBar? contentDiv.style.marginLeft = width: contentDiv.style.marginRight = width ;
    sideBarBtn.innerText = btnText;
    sideBarBtn.removeEventListener("click", () => openSideBar(sideBar));
    sideBarBtn.addEventListener("click", () => closeSideBar(sideBar));
}
;
/**
 * Closes the side bar passed to it by setting its width to 0px
 * @param {HTMLElement} sideBar - the html element representing the side bar to be closed
 */
function closeSideBar(sideBar) {
    let btnText = String.fromCharCode(9776) + "Open Sidebar";
    let width = '0px';
    sideBar.style.width = width;
    sideBar.classList.remove('extended');
    sideBar.classList.add('collapsed');
    //sideBar == leftSideBar? contentDiv.style.marginLeft = width: contentDiv.style.marginRight = width ;
    sideBarBtn.innerText = btnText;
    sideBarBtn.removeEventListener("click", () => closeSideBar(sideBar));
    sideBarBtn.addEventListener("click", () => openSideBar(sideBar));
}
;
/**
 * Detects whether the user swiped his fingers on the screen, and opens or closes teh right or left side bars accordingly
 */
function DetectFingerSwipe() {
    //Add finger swipe event
    document.addEventListener("touchstart", handleTouchStart, false);
    document.addEventListener("touchmove", handleTouchMove, false);
    let xDown = null;
    let yDown = null;
    function handleTouchStart(evt) {
        const firstTouch = evt.touches[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    }
    ;
    function handleTouchMove(evt) {
        if (!xDown || !yDown) {
            return;
        }
        ;
        let xUp = evt.touches[0].clientX;
        let yUp = evt.touches[0].clientY;
        let xDiff = xDown - xUp;
        let yDiff = yDown - yUp;
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            /*most significant*/
            if (xDiff > 0) {
                /* right to left swipe */
                if (leftSideBar.classList.contains('extended') && rightSideBar.classList.contains('collapsed')) {
                    closeSideBar(leftSideBar);
                }
                else if (rightSideBar.classList.contains('collapsed') && leftSideBar.classList.contains('collapsed')) {
                    openSideBar(rightSideBar);
                }
                ;
            }
            else {
                /* left to right swipe */
                if (leftSideBar.classList.contains('collapsed') && rightSideBar.classList.contains('collapsed')) {
                    openSideBar(leftSideBar);
                }
                else if (rightSideBar.classList.contains('extended') && leftSideBar.classList.contains('collapsed')) {
                    closeSideBar(rightSideBar);
                }
                ;
            }
        }
        else {
            if (yDiff > 0) {
                /* down swipe */
            }
            else {
                /* up swipe */
            }
        }
        /* reset values */
        xDown = null;
        yDown = null;
    }
    ;
}
;
function toggleAmplifyText(ev, myClass) {
    ev.preventDefault;
    let amplified = new Map(JSON.parse(localStorage.textAmplified));
    let el = ev.target;
    let dataset = 'p[data-lang="' + el.dataset.lang + '"]';
    let sameLang = containerDiv.querySelectorAll(dataset);
    sameLang.forEach((p) => {
        p.classList.toggle(myClass);
        //p.parentElement.style.gridTemplateColumns = We need a way to enlarge the cell containing the text 
    });
    if (el.classList.contains(myClass)) {
        //it means that the class was added when the user dbl clicked (not removed)
        amplified.set(el.dataset.lang, true);
    }
    else {
        amplified.set(el.dataset.lang, false);
    }
    ;
    localStorage.textAmplified = JSON.stringify(Array.from(amplified));
}
;
/**
 * This function is meant to create a side bar on the fly. we are not using it anymore. It will be deprecated.
 * @param id
 * @returns
 */
function buildSideBar(id) {
    let sideBar = document.createElement('div');
    let btnsDiv = document.createElement('div');
    let a = document.createElement('a');
    sideBar.id = id;
    sideBar.classList.add(id);
    sideBar.classList.add('sideBar');
    sideBar.classList.add('collapsed');
    a.innerText = '&times';
    a.setAttribute('href', 'javascript:void(0)');
    a.classList.add('closebtn');
    a.addEventListener('click', (e) => { e.preventDefault; closeSideBar(sideBar); });
    sideBar.appendChild(a);
    btnsDiv.id = 'sideBarBtns';
    sideBar.appendChild(btnsDiv);
    if (id == 'leftSideBar') {
        //leftSideBar = sideBar
    }
    else if (id == 'rightSideBar') {
        //rightSideBar = sideBar
    }
    return sideBar;
}
;
/**
 * This function takes an string[][] representing a Word table (where each each string[][] represents a row of the table, and has as a 1st string element the title of the Word table. Each next string element represents the text of the each cell of the row in a given language.
 * @param {Button} btn
 * @param {boolean} clearContent - tells wether the containerDiv content needs to be cleared
 *  @param {Boolean} clearSideBar - tells wether the right sideBar needs to be cleared
 * @param {HTMLElement|{beforeOrAfter:insertPosition, el:HtmlElement}} position - if it is an HTML Element, the newly created divs will be appended to this html element. If it is an object, the newly created divs will be placed in the position provided (the position is of type insertPosition) by the beforeOrAfter property, in relation to the html element provied in the el property
 */
function showPrayers(btn, clearContent = true, clearRightSideBar = true, position = containerDiv) {
    return __awaiter(this, void 0, void 0, function* () {
        if (clearContent) {
            containerDiv.innerHTML = "";
        }
        ;
        if (clearRightSideBar) {
            rightSideBar.querySelector('#sideBarBtns').innerHTML = '';
        }
        ; //this is the right side bar where the titles are displayed for navigation purposes
        btn.prayers.map(p => {
            if (!p) {
                return;
            }
            ;
            let date;
            if (p.includes('&D=') || p.includes('&S=')) {
                //if the id of the prayer includes the value '&D=' this tells us that this prayer is either not linked to a specific day in the coptic calendar (&D=), or the date has been set by the button function (e.g.: PrayerGospelResponse&D=GLWeek). In this case, we will not add the copticReadingsDate to the prayerID
                //Similarly, if the id includes '&S=', it tells us that it is not linked to a specific date but to a given period of the year. We also keep the id as is without adding any date to it
                date = '';
            }
            else {
                date = '&D=' + copticReadingsDate; //this is the default case where the date equals the copticReadingsDate. This works for most of the occasions.
            }
            ;
            p += date;
            let wordTable = findAndProcessPrayers(p, btn);
            if (wordTable) {
                wordTable.map(row => {
                    createHtmlElementForPrayer(row[0].split('&C=')[0], row, btn.languages, JSON.parse(localStorage.userLanguages), row[0].split('&C=')[1], position); //row[0] is the title of the table modified as the case may be to reflect wether the row contains the titles of the prayer, or who chants the prayer (in such case the words 'Title' or '&C=' + 'Priest', 'Diacon', or 'Assembly' are added to the title)
                });
                return;
            }
            ;
        });
        if (btn.btnID != btnGoBack.btnID && btn.btnID != btnMain.btnID) {
            closeSideBar(leftSideBar);
        }
        ;
    });
}
;
/**
 * Sets the number of columns and their widths for an html container which style display property = 'grid'
 * @param {HTMLElement} container - The html element to which the text is appended. This is by default containerDiv
 */
function setCSSGridTemplate(Rows) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Rows) {
            return;
        }
        ;
        Rows.forEach((r) => {
            r.style.gridTemplateColumns = getColumnsNumberAndWidth(r); //Setting the number of columns and their width for each element having the 'TargetRow' class
            r.style.gridTemplateAreas = setGridAreas(r); //Defining grid areas for each language in order to be able to control the order in which the languages are displayed (Arabic always on the last column from left to right, and Coptic on the first column from left to right)
            if (r.classList.contains('TargetRowTitle')) {
                //This is the div where the titles of the prayer are displayed. We will add an 'on click' listner that will collapse the prayers 
                r.role = 'button';
                let arabic = r.querySelector('p[data-lang="AR"]');
                if (arabic && !arabic.textContent.startsWith(String.fromCharCode(10134))) {
                    arabic.textContent = String.fromCharCode(10134) + ' ' + r.querySelector('p[data-lang="AR"]').textContent; //we add the minus sign at the begining of the paragraph containing the Arabic text of the title (we retrieve it by its dataset.lang value)
                }
                else if (!r.lastElementChild.textContent.startsWith(String.fromCharCode(10134))) {
                    r.lastElementChild.textContent = String.fromCharCode(10134) + ' ' + r.lastElementChild.textContent;
                }
            }
            ;
        });
        /**
        * Returns a string indicating the number of columns and their widths
        * @param {HTMLElement} row - the html element created to show the text representing a row in the Word table from which the text of the prayer was taken (the text is provided as a string[] where the 1st element is the tabel's id and the other elements represent each the text in a given language)
        * @returns  {string} - a string represneting the value that will be given to the grid-template-columns of the row
        */
        function getColumnsNumberAndWidth(row) {
            let width = (100 / (row.children.length)).toString() + "% ";
            return width.repeat(row.children.length);
        }
        ;
        /**
             * Returns a string representing the grid areas for an html element with a 'display:grid' property, based on the dataset.lang of its children
             * @param {HTMLElement} row - an html element having children and each child has a dataset.lang
             * @returns {string} representing the grid areas based on the dataset.lang of the html element children
             */
        function setGridAreas(row) {
            let areas = [], child;
            for (let i = 0; i < row.children.length; i++) {
                child = row.children[i];
                areas.push(child.dataset.lang);
                child.classList.add(child.dataset.lang); //we profit from the loop to add the language as class to the element (we didn't add it earlier in order to lighten the display of the html element and reduce the delay/latency for the user)
            }
            ;
            if (areas.indexOf('AR') == 0 && !row.classList.contains('Comment') && !row.classList.contains('CommentText')) {
                //if the 'AR' is the first language, it means it will be displayed in the first column from left to right. We need to reverse the array in order to have the Arabic language on the last column from left to right
                areas.reverse();
            }
            ;
            return '"' + areas.toString().split(',').join(' ') + '"'; //we should get a string like ' "AR COP FR" ' (notice that the string marks " in the beginning and the end must appear, otherwise the grid-template-areas value will not be valid)
        }
        ;
    });
}
;
function applyAmplifiedText(container) {
    return __awaiter(this, void 0, void 0, function* () {
        new Map(JSON.parse(localStorage.textAmplified))
            .forEach((value, key) => {
            if (value == true) {
                Array.from(container)
                    .filter(el => el.getAttribute('data-lang') == key)
                    .map(el => {
                    if (!el.classList.contains('Comment') && !el.classList.contains('CommentText')) {
                        el.classList.add('amplifiedTextSize');
                    }
                });
                //containerDiv.querySelectorAll('p[data-lang="' + key  + '"]').forEach((el)=>el.classList.add('amplifiedTextSize'))
            }
            ;
        });
    });
}
;
function setButtonsPrayers() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < btns.length; i++) {
            btnsPrayers.push([btns[i].btnID, ...yield btns[i].onClick()]);
            btns[i].retrieved = true;
        }
        ;
        console.log('Buttons prayers were set');
        return btnsPrayers;
    });
}
;
/**
 * Toggles the dipslay property of all the nextElementSiblings of the element, if the nextElementSibling classList does not include 'TargetRowTitle'
 * @param {HTMLElement} element - the html element which nextElementSiblings display property will be toggled between 'none' and 'grid'
 */
function collapseText(element) {
    let siblings = [], next;
    next = element.nextElementSibling;
    while (next && !next.classList.contains('TargetRowTitle')) {
        siblings.push(next);
        next = next.nextElementSibling;
    }
    ;
    for (let i = 0; i < siblings.length; i++) {
        siblings[i].classList.toggle('collapsed');
        if (siblings[i].classList.contains('collapsed')) {
            siblings[i].style.display = 'none';
        }
        else {
            siblings[i].style.display = 'grid';
        }
        ;
    }
    ;
    let parag;
    parag = Array.from(element.children).filter(child => child.textContent.startsWith(String.fromCharCode(10133)) || child.textContent.startsWith(String.fromCharCode(10134)))[0];
    if (parag && parag.textContent.startsWith(String.fromCharCode(10133))) {
        https: //mbibawi.github.io/CopticPWA/#TargetDiv
         parag.textContent = parag.textContent.replace(String.fromCharCode(10133), String.fromCharCode(10134));
    }
    else if (parag && parag.textContent.startsWith(String.fromCharCode(10134))) {
        parag.textContent = parag.textContent.replace(String.fromCharCode(10134), String.fromCharCode(10133));
    }
    ;
}
;
/**
 *
 * @param {string[][][]} selectedPrayers - An array containing the optional prayers for which we want to display html button elements in order for the user to choose which one to show
 * @param {Button} btn
 * @param {HTMLElement} btnsDiv - The html element in which each prayer will be displayed when the user clicks an inline button representing this prayer
 * @param {Object{AR:string, FR:'string'}} btnLabels - An object containing the labels of the master button that the user will click to show a list of buttons, each representing a prayer in selectedPrayers[]
 * @param {string} masterBtnID - The id of the master button
 */
function showInlineButtonsForOptionalPrayers(selectedPrayers, btn, masterBtnDiv, btnLabels, masterBtnID) {
    return __awaiter(this, void 0, void 0, function* () {
        let prayersMasterBtn, next;
        ;
        //Creating a new Button to which we will attach as many inlineBtns as there are fraction prayers suitable for the day (if it is a feast or if it falls during a Season)
        prayersMasterBtn = new Button({
            btnID: masterBtnID,
            label: btnLabels,
            inlineBtns: yield createInlineBtns(),
            pursue: false,
            cssClass: inlineBtnClass,
            onClick: () => {
                //We show the inlineBtnsDiv (bringing it in front of the containerDiv by giving it a zIndex = 3)
                showInlineBtns(masterBtnID, true);
                //When the prayersBtn is clicked, it will create a new div element to which it will append html buttons element for each inlineBtn in its inlineBtns[] property
                let newDiv = document.createElement('div');
                newDiv.id = masterBtnID + 'Container';
                //Customizing the style of newDiv
                newDiv.classList.add('inlineBtns');
                //We set the gridTemplateColumns of newDiv to a grid of 3 columns. The inline buttons will be displayed in rows of 3 inline buttons each
                newDiv.style.gridTemplateColumns = '33% 33% 33%';
                inlineBtnsDiv.style.borderRadius = '10px';
                let startAt = 0;
                //We create a "next" Button that we will probably need if 
                if (prayersMasterBtn.inlineBtns.length > 6) {
                    //We create the "next" Button only if there is more than 6 inlineBtns in the prayersBtn.inlineBtns[] property
                    next = new Button({
                        btnID: 'btnNext',
                        label: { AR: 'التالي', FR: 'Suivants' },
                        cssClass: inlineBtnClass,
                    });
                }
                ;
                //We call showGroupOfSisxPrayers() starting at inlineBtns[0]
                showGroupOfSixPrayers(startAt, newDiv);
            }
        });
        function showGroupOfSixPrayers(startAt, newDiv) {
            for (let n = startAt; n < (startAt + 6); n++) {
                //We create html buttons for the 1st 6 inline buttons and append them to newDiv
                if (n < prayersMasterBtn.inlineBtns.length) {
                    let b = prayersMasterBtn.inlineBtns[n];
                    createBtn(b, newDiv, b.cssClass);
                }
            }
            ;
            if (next) {
                //If a "next" Button has been set (which means that there is more than 6 inlineBtns in prayersBtn.inlineBtns[] property), we will set its onClick() property to a function that clears newDiv, and advances the startAt index by 6
                next.onClick = () => {
                    //When next is clicked, we remove all the html buttons displayed in newDiv (we empty newDiv)
                    newDiv.innerHTML = '';
                    //We then remove the "next" html button itself (the "next" button is appended to inlineBtnsDiv directly not to newDiv)
                    inlineBtnsDiv.querySelector('#' + next.btnID).remove();
                    //We set the starting index for the next 6 inline buttons
                    startAt += 6;
                    //We call showGroupOfSixPrayers() with the new startAt index
                    showGroupOfSixPrayers(startAt, newDiv);
                };
            }
            ;
            //We append newDiv  to inlineBtnsDiv before appending the 'next' button, in order for the "next" html button to appear at the buttom of the inlineBtnsDiv. Notice that inlineBtnsDiv is a div having a 'fixed' position, a z-index = 3 (set by the showInlineBtns() function that we called). It hence remains visible in front of, and hides the other page's html elements in the containerDiv
            inlineBtnsDiv.appendChild(newDiv);
            //We finaly create an html element representing the "next" button and append it to inlineBtnsDiv directly. We do this only if there is another group of 6 prayers that need to be displayed. We check this before displaying the next button
            if (next && prayersMasterBtn.inlineBtns.length - startAt > 6) {
                createBtn(next, inlineBtnsDiv, next.cssClass, false).classList.add('centeredBtn'); //notice that we are appending next to inlineBtnsDiv directly not to newDiv (because newDiv has a display = 'grid' of 3 columns. If we append to it, 'next' button will be placed in the 1st cell of the last row. It will not be centered). Notice also that we are setting the 'clear' argument of createBtn() to false in order to prevent removing the 'Go Back' button when 'next' is passed to showchildButtonsOrPrayers()
            }
            ;
        }
        ;
        //Creating an html button element for prayersMasterBtn and displaying it in btnsDiv (which is an html element passed to the function)
        createBtn(prayersMasterBtn, masterBtnDiv, prayersMasterBtn.cssClass);
        masterBtnDiv.classList.add('inlineBtns');
        masterBtnDiv.style.gridTemplateColumns = '100%';
        /**
         *Creates a new inlineBtn for each fraction and pushing it to fractionBtn.inlineBtns[]
        * @param {Button} target - the button to which the inline buttons that will be created will be attached as members of its inlineBtns[] property
         */
        function createInlineBtns() {
            return __awaiter(this, void 0, void 0, function* () {
                let btns = [];
                selectedPrayers.map(prayerTable => {
                    //for each string[][][] representing a table in the Word document from which the text was extracted, we create an inlineButton to display the text of the table
                    let inlineBtn = new Button({
                        btnID: prayerTable[0][0].split('&C=')[0],
                        label: {
                            AR: prayerTable[0][btn.languages.indexOf('AR') + 1],
                            FR: prayerTable[0][btn.languages.indexOf('FR') + 1] //same logic and comment as above
                        },
                        prayers: [prayerTable[0][0].split('&C=')[0]],
                        prayersArray: [[...prayerTable].reverse()],
                        languages: btn.languages,
                        cssClass: 'fractionPrayersBtn',
                        children: [...btn.parentBtn.children],
                        onClick: () => {
                            //When the prayer button is clicked, we empty and hide the inlineBtnsDiv
                            hideInlineButtonsDiv();
                            containerDiv.querySelectorAll('div[data-group="optionalPrayer"]').forEach(el => el.remove());
                            showPrayers(inlineBtn, false, false, { beforeOrAfter: 'afterend', el: masterBtnDiv }); //We will append the newly created html elements after btnsDiv (notice that btnsDiv contains the prayersMasterBtn)
                            let createdElements = containerDiv.querySelectorAll('div[data-root="' + inlineBtn.prayers[0] + '"]');
                            //We will add to each created element a data-group attribute, which we will use to retrieve these elements and delete them when another inline button is clicked
                            createdElements.forEach(el => el.setAttribute('data-group', 'optionalPrayer'));
                            //We format the grid template of the newly added divs
                            setCSSGridTemplate(createdElements);
                            //We apply the amplification of text
                            applyAmplifiedText(createdElements);
                            //We scroll to the button
                            createFakeAnchor(masterBtnID);
                        }
                    });
                    btns.push(inlineBtn);
                });
                return btns;
            });
        }
        ;
    });
}
;
/**
 * Takes the title of a Word Table, and loops the button.prayersArray[][][] to check wether an element[0][0] (which reflects a table in the Word document from which the text was retrieved) matches the provided title. If found, it returns the wordTable as a string[][](each array element being a row of the Word table). If dosen't find, it returns 'undefined'
 * @param {string} p - The title of the table that we need to find in the button's prayersArray[][][]. It corresponds to the element[0][0]
 * @param {Button} btn - the Button that we need to search its prayersArray[][][] property for an element[][] having its [0][0] value equal the title of the Word Table
 * @returns {string[][] | undefined} - an array representing the Word Table if found or 'undefined' if not found
 */
function findAndProcessPrayers(p, btn) {
    //@ts-ignore
    let tblTitle;
    for (let i = 0; i < btn.prayersArray.length; i++) {
        tblTitle = btn.prayersArray[i][0][0].split('&C=')[0];
        if (btn.prayersArray[i][0] && btn.prayersArray[i][0][0].split('&C=')[0] == p) {
            return btn.prayersArray[i];
        }
        else if (RegExp(/\&D=\(\d{4}\|\|\d{4}\)/).test(tblTitle)) {
            return;
            if (RegExp(tblTitle.split('&D=')[0]).test(p.split('&D=')[0])) { }
        }
    }
    ;
}
;
function showInlineBtns(status, clear = false) {
    if (clear) {
        inlineBtnsDiv.innerHTML = '';
    }
    ;
    //Appending close button
    (function appendCloseBtn() {
        let close = document.createElement('a');
        close.innerText = String.fromCharCode(215);
        close.classList.add('closebtn');
        close.style.position = 'fixed';
        close.style.top = '5px';
        close.style.right = '15px';
        close.style.fontSize = '30pt';
        close.style.fontWeight = 'bold';
        close.addEventListener('click', (e) => { e.preventDefault; hideInlineButtonsDiv(); });
        inlineBtnsDiv.appendChild(close);
    })();
    inlineBtnsDiv.dataset.status = status;
    inlineBtnsDiv.style.zIndex = '3';
}
function hideInlineButtonsDiv() {
    inlineBtnsDiv.dataset.status = 'inlineButtons';
    inlineBtnsDiv.innerHTML = '';
    inlineBtnsDiv.style.zIndex = '-1';
}
;
function showSettingsPanel() {
    showInlineBtns('settingsPanel');
    let btn;
    //Show current version
    (function showCurrentVersion() {
        let version = 'v1.6 (manifest modified)';
        let p = document.createElement('p');
        p.style.color = 'red';
        p.style.fontSize = '15pt';
        p.style.fontWeight = "bold";
        p.innerText = version;
        inlineBtnsDiv.appendChild(p);
    })();
    //Show InstallPWA button
    (function installPWA() {
        btn = createBtn('button', 'button', 'settingsBtn', 'Install PWA', inlineBtnsDiv, 'InstallPWA', undefined, undefined, undefined, undefined, {
            event: 'click',
            fun: () => __awaiter(this, void 0, void 0, function* () {
                // Initialize deferredPrompt for use later to show browser install prompt.
                let deferredPrompt;
                window.addEventListener("beforeinstallprompt", (e) => {
                    // Prevent the mini-infobar from appearing on mobile
                    e.preventDefault();
                    // Stash the event so it can be triggered later.
                    deferredPrompt = e;
                });
                // Update UI notify the user they can install the PWA
                (() => __awaiter(this, void 0, void 0, function* () {
                    window.dispatchEvent(new Event('beforeinstallprompt'));
                    deferredPrompt.prompt;
                    // Optionally, send analytics event that PWA install promo was shown.
                    console.log(`'beforeinstallprompt' event was fired.`);
                    // Wait for the user to respond to the prompt
                    const { outcome } = yield deferredPrompt.userChoice;
                    // Optionally, send analytics event with outcome of user choice
                    console.log(`User response to the install prompt: ${outcome}`);
                    // We've used the prompt, and can't use it again, throw it away
                    deferredPrompt = null;
                }))();
                function getPWADisplayMode() {
                    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
                    if (document.referrer.startsWith("android-app://")) {
                        return "twa";
                        //@ts-ignore
                    }
                    else if (navigator.standalone || isStandalone) {
                        return "standalone";
                    }
                    return "browser";
                }
                ;
            })
        });
    })();
    //Appending date picker
    (function showDatePicker() {
        let datePicker = createBtn('input', undefined, undefined, undefined, inlineBtnsDiv, 'datePicker', undefined, 'date', undefined, undefined, {
            event: 'change',
            fun: () => changeDay(datePicker.value.toString())
        });
        datePicker.setAttribute('value', todayDate.toString());
        datePicker.setAttribute('min', '1900-01-01');
    })();
    //Appending 'Next Coptic Day' button
    (function showNextCopticDayButton() {
        return __awaiter(this, void 0, void 0, function* () {
            let container = document.createElement('div');
            container.style.display = 'grid',
                container.style.gridTemplateColumns = String('50%').repeat(2);
            inlineBtnsDiv.appendChild(container);
            btn = createBtn('button', 'button', 'settingsBtn', 'Next Coptic Day', container, 'nextDay', undefined, 'submit', undefined, undefined, { event: 'click', fun: () => changeDay(undefined, true, 1) });
            btn.style.backgroundColor = 'saddlebrown';
            btn = createBtn('button', 'button', 'settingsBtn', 'Previous Coptic Day', container, 'previousDay', undefined, 'submit', undefined, undefined, { event: 'click', fun: () => changeDay(undefined, false, 1) });
            btn.style.backgroundColor = 'saddlebrown';
        });
    })();
    let langsContainer = document.createElement('div');
    langsContainer.id = 'langsContainer';
    langsContainer.style.display = 'grid';
    langsContainer.id = 'langsContainer';
    langsContainer.style.justifyItems = 'center';
    langsContainer.style.justifySelf = 'center';
    inlineBtnsDiv.appendChild(langsContainer);
    function addLanguage(id, dataSet, innerText) {
        btn = createBtn('button', undefined, 'addLang', innerText, inlineBtnsDiv.querySelector('#langsContainer'), id, dataSet, 'submit', undefined, 'red', {
            event: 'click',
            fun: () => addOrRemoveLanguage(btn)
        });
    }
    ;
    //Appending 'Add Coptic in Arabic Characters' button
    //addLanguage('addCA', 'CA', 'Add Coptic In Arabic Characters');
    //Appending 'Add English or French' button
    //addLanguage('addEN', 'EN', 'Add English or French');
    //Appending Add or Remove language Buttons
    (function showAddOrRemoveLanguagesBtns() {
        return __awaiter(this, void 0, void 0, function* () {
            let parsedUserLanguages = JSON.parse(localStorage.userLanguages);
            let subContainer = document.createElement('div');
            subContainer.style.display = 'grid';
            subContainer.style.gridTemplateColumns = String('30% ').repeat(3);
            subContainer.style.justifyItems = 'center';
            langsContainer.appendChild(subContainer);
            allLanguages.map(lang => {
                let newBtn = createBtn('button', 'button', 'settingsBtn', lang, subContainer, 'userLang', lang, undefined, undefined, undefined, {
                    event: 'click',
                    fun: () => {
                        modifyUserLanguages(lang);
                        newBtn.classList.toggle('langBtnAdd');
                        //We retrieve again the displayed text/prayers by recalling the last button clicked
                        if (containerDiv.children) {
                            //Only if a text is already displayed
                            showChildButtonsOrPrayers(lastClickedButton);
                            showSettingsPanel(); //we display the settings pannel again
                        }
                        ;
                    }
                });
                if (parsedUserLanguages.indexOf(lang) < 0) {
                    //The language of the button is absent from userLanguages[], we will give the button the class 'langBtnAdd'
                    newBtn.classList.add('langBtnAdd');
                }
                ;
            });
        });
    })();
    (function showExcludeActorButon() {
        return __awaiter(this, void 0, void 0, function* () {
            let container = document.createElement('div');
            container.style.display = 'grid';
            container.style.gridTemplateColumns = String('50%').repeat(2);
            inlineBtnsDiv.appendChild(container);
            actors.map(actor => {
                if (actor == 'CommentText') {
                    return;
                }
                ; //we will not show a button for 'CommentText' class, it will be handled by the 'Comment' button
                let show = new Map(JSON.parse(localStorage.getItem('showActors'))).get(actor);
                btn = createBtn('button', 'button', 'settingsBtn', 'remove ' + actor, container, actor, actor, undefined, undefined, undefined, {
                    event: 'click',
                    fun: () => {
                        show = !show; //inversing the value of "show"
                        showActors.set(actor, show);
                        if (show == false) {
                            btn.classList.add('langBtnAdd');
                        }
                        ; //changing the background color of the button to red by adding 'langBtnAdd' as a class
                        if (actor == 'Comment') {
                            showActors.set('CommentText', show);
                        }
                        ; //setting the value of 'CommentText' same as 'Comment'
                        localStorage.showActors = JSON.stringify(Array.from(showActors)); //adding the new values to local storage
                        if (containerDiv.children) {
                            //Only if some prayers text is already displayed
                            showChildButtonsOrPrayers(lastClickedButton); //we re-click the last button to refresh the displayed text by adding or removing the actor according to the new setings chice made by the user.
                            showSettingsPanel(); //we display the settings pannel again
                        }
                        ;
                    }
                });
                if (show == false) {
                    btn.classList.toggle('langBtnAdd');
                }
                ;
            });
        });
    })();
    function createBtn(tag, role = tag, btnClass, innerText, parent, id, dataSet, type, size, backgroundColor, onClick) {
        let btn = document.createElement(tag);
        if (role) {
            btn.role = role;
        }
        ;
        if (innerText) {
            btn.innerHTML = innerText;
        }
        ;
        if (btnClass) {
            btn.classList.add(btnClass);
        }
        ;
        if (id) {
            btn.id = id;
        }
        ;
        if (dataSet) {
            btn.dataset.lang = dataSet;
        }
        ;
        if (type && btn.nodeType) {
            //@ts-ignore
            btn.type = type;
        }
        ;
        if (size) {
            //@ts-ignore
            btn.size = size;
        }
        ;
        if (backgroundColor) {
            btn.style.backgroundColor = backgroundColor;
        }
        ;
        if (onClick) {
            btn.addEventListener(onClick.event, (e) => { e.preventDefault; onClick.fun(); });
        }
        ;
        if (parent) {
            parent.appendChild(btn);
        }
        ;
        return btn;
    }
    ;
    //Appending colors keys for actors
    (function addActorsKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            let container = document.createElement('div');
            container.id = 'actors';
            container.style.display = 'grid';
            container.style.gridTemplateColumns = String('33% ').repeat(3);
            inlineBtnsDiv.appendChild(container);
            let actors = [
                {
                    id: 'PriestColor',
                    AR: 'الكاهن',
                    FR: 'Le Prêtre',
                    EN: 'The Priest',
                },
                {
                    id: 'AssemblyColor',
                    AR: "الشعب",
                    FR: 'L\'Assemblée',
                    EN: 'The Assembly',
                },
                {
                    id: 'DiaconColor',
                    AR: 'الشماس',
                    FR: 'Le Diacre',
                    EN: 'The Diacon',
                }
            ];
            actors.map(b => {
                let newBtn = createBtn('button', undefined, 'colorbtn', undefined, container, b.id);
                for (let i = 1; i < 4; i++) {
                    let p = document.createElement('p');
                    p.innerText = b[Object.keys(b)[i]];
                    //Object.keys(b)[i] 0K;
                    newBtn.appendChild(p);
                }
                ;
            });
        });
    })();
    closeSideBar(leftSideBar);
}
;
/**
 * Inserts buttons each of which redirects to a specific part in a given mass
 * @param {HTMLElement} targetElement - an child of containerDiv, before or after which the div containing the created html button elements will be appended (the position is provided by the position argument)
 * @param {Button[]} btns - an array of Button elements for each of which an html element will be created by createBtn() and appended to a newly created div. Each of the html buttons created will, when clicked
 * @param {InsertPosition} position - the position where the div containing the created html elements for each button, will be inserted compared to the containerDiv child retrieved using the querySelector parameter
 */
function insertRedirectionButtons(targetElement, btns, position = 'beforebegin') {
    return __awaiter(this, void 0, void 0, function* () {
        let div = document.createElement('div');
        div.classList.add('inlineBtns');
        div.style.gridTemplateColumns = ((100 / btns.length).toString() + '% ').repeat(btns.length);
        btns.map(b => div.appendChild(createBtn(b, div, b.cssClass)));
        targetElement.insertAdjacentElement(position, div);
    });
}
;
/**Was meant to fetch the Arabic Synaxarium text but didn't work for CORS issue on the api */
function fetchSynaxarium() {
    return __awaiter(this, void 0, void 0, function* () {
        let date = '1_9';
        let url = 'https://www.copticchurch.net/synaxarium/' + `${date}` + '.html?lang=ar';
        let response = yield fetch("http://katamars.avabishoy.com/api/Katamars/GetSynaxariumStory?id=1&synaxariumSourceId=1", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7",
                "cache-control": "no-cache",
                "pragma": "no-cache"
            },
            "referrer": "http://katamars.avabishoy.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        });
        console.log(response);
    });
}
;
/**
 * Just trying to figger out if there is a way to prompt the user for installing the app without waiting for the browser to spontaneously trigger the 'beforeinstallprompt' event
 */
function playingWithInstalation() {
    let beforeInstallFired;
    window.addEventListener('beforeinstallpromt', (e) => {
        e.preventDefault;
        beforeInstallFired = e;
        alert('beforeinstall fired');
    });
    //
    let btn = document.createElement('button');
    //@ts-ignore
    let before = new BeforeInstallPromptEvent('beforeInstallPrompt');
    btn.addEventListener('click', () => {
        before.trigger();
        before.prompt().then(r => console.log('response = ', r));
        console.log(before.userChoice);
    });
    window.addEventListener(before, () => btn.click());
    //btn.click();
    alert('swipe right or click on the image to open the menu and start');
}
populatePrayersArrays();
function populatePrayersArrays() {
    return __awaiter(this, void 0, void 0, function* () {
        //We are populating subset arrays of PrayersArray in order to speed up the parsing of the prayers when the button is clicked
        PrayersArray.map(wordTable => {
            //each element in PrayersArray represents a table in the Word document from which the text of the prayers was retrieved
            if (wordTable[0][0].startsWith(commonPrayerPrefix)) {
                //wordTable[0] is the 1st row of the Word table. WordTable[0][0] contains the title of the table + "&C=" + the class that will be added to the html element that will be created to display the text of the row
                CommonPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(massStBasilPrefix)) {
                MassStBasilPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(massCommonPrefix)) {
                MassCommonPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(massStGregoryPrefix)) {
                MassStGregoryPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(massStCyrilPrefix)) {
                MassStCyrilPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(massStJohnPrefix)) {
                MassStJohnPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(fractionPrayerPrefix)) {
                FractionsPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(commonDoxologiesPrefix)) {
                DoxologiesPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(commonIncensePrefix)) {
                IncensePrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(incenseDawnPrefix)) {
                IncensePrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(incenseVespersPrefix)) {
                IncensePrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(communionPrefix)) {
                CommunionPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(psalmResponsePrefix)) {
                PsalmAndGospelPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].startsWith(gospelResponsePrefix)) {
                PsalmAndGospelPrayersArray.push(wordTable);
            }
        });
    });
}
