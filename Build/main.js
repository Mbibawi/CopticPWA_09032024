const copticReadingsDates = getCopticReadingsDates();
/**
 * Adds or removes a language to the userLanguages Array
 * @param el {HTMLElement} - the html button on which the user clicked to add or remove the language. The language is retrieved from the element's dataset
 */
function addOrRemoveLanguage(el) {
    let lang;
    lang = el.lang;
    //we check that the language that we need to add is included in the userLanguages array
    if (userLanguages.indexOf(lang) > -1) {
        //The language is included in the userLanguages
        if (lang === "CA" && userLanguages.indexOf("COP") === -1) {
            userLanguages.splice(userLanguages.indexOf(lang), 1, "COP");
        }
        else if (lang === "EN" && userLanguages.indexOf("FR") === -1) {
            userLanguages.splice(userLanguages.indexOf(lang), 1, "FR");
        }
        else {
            userLanguages.splice(userLanguages.indexOf(lang), 1);
        }
        el.innerText = el.innerText.replace("Remove", "Add");
    }
    else if (userLanguages.indexOf(lang) === -1) {
        //The language is not included in user languages, we will add it
        //if the user adds the Coptic in Arabic characters, we assume he doesn't need the Coptic text we do the same for English and French
        if (lang === "CA" && userLanguages.indexOf("COP") > -1) {
            userLanguages.splice(userLanguages.indexOf("COP"), 1, lang);
        }
        else if (lang === "EN" && userLanguages.indexOf("FR") > -1) {
            userLanguages.splice(userLanguages.indexOf("FR"), 1, lang);
        }
        else {
            userLanguages.push(lang);
        }
        el.innerText = el.innerText.replace("Add", "Remove");
    }
    localStorage.userLanguages = JSON.stringify(userLanguages);
    //in order to refresh the view after adding or removing a language, we call the showChildButtonsOrPrayers passing to it the lasClickedButton which is a variable storing the last clicked sideBar Button (its class is Button) that is displaying its prayers/children/inlineBtns, etc.,
    showChildButtonsOrPrayers(lastClickedButton);
}
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
    localStorage.userLanguages = JSON.stringify(userLanguages);
}
function modifyDefaultAndForeignLanguages() {
}
document.addEventListener('DOMContentLoaded', autoRunOnLoad);
/**
 * Some functions that we run automatically when loading the app
 */
function autoRunOnLoad() {
    showChildButtonsOrPrayers(btnMain);
    DetectFingerSwipe();
    if (localStorage.selectedDate) {
        let newDate = new Date(), selectedDate;
        if (localStorage.selectedDate)
            selectedDate = new Date(Number(localStorage.selectedDate)); //We create a date from the date saved in th localStorage 
        //selectedDate.setTime();
        if (selectedDate && !checkIfDateIsToday(selectedDate)) {
            alert('WARNING ! The date is manually set by the user to ' + selectedDate.getDate().toString() + '/' + (selectedDate.getMonth() + 1).toString() + '/' + selectedDate.getFullYear().toString() + '. This choice will not kept. If you want the current date, you have to change the date manually');
            selectedDate.setHours(newDate.getHours(), newDate.getMinutes(), newDate.getSeconds(), newDate.getMilliseconds()); //We set its hours, minutes, and seconds to the current time
            setCopticDates(selectedDate);
        }
        ;
    }
    else {
        setCopticDates();
    }
    ;
    populatePrayersArrays();
}
;
/**
 * @param {string[]} tblRow - an array of the text of the prayer which id matched the id in the idsArray. The first element in this array is the id of the prayer. The other elements are, each, the text in a given language. The prayers array is hence structured like this : ['prayerID', 'prayer text in Arabic', 'prayer text in French', 'prayer text in Coptic']
 * @param {string[]} languagesArray - the languages available for this prayer. The button itself provides this array from its "Languages" property
 * @param {string[]} userLanguages - a globally declared array of the languages that the user wants to show.
 * @param {string} actorClass - a CSS class that will be given to the html element (a div) in which the text of the table row. This class sets the background color of the div according to who is saying the prayer: is it the Priest, the Diacon, or the Assembly?
 * @param {HTMLDivElement} container - this is the html div element to which the newly created row will be appended at the specified position. If omitted, its default value is containerDiv
 */
function createHtmlElementForPrayer(params) {
    //@ts-ignore
    if (!params.tblRow || params.tblRow.length === 0)
        return console.log('No valid tblRow[][] object is passed to createHtmlElementForPrayer() ');
    if (!params.actorClass)
        params.actorClass = splitTitle(params.tblRow[0])[1];
    if (params.actorClass) {
        let parsed = JSON
            .parse(localStorage.showActors)
            .filter(el => el[0].EN === params.actorClass);
        if (parsed.length > 0 && parsed[0][1] === false)
            return; //If had hide an actor, we will stop and return
    }
    ;
    if (!params.userLanguages)
        params.userLanguages = JSON.parse(localStorage.userLanguages);
    if (!params.position)
        params.position = containerDiv;
    let htmlRow, p, lang, text, titleBase;
    if (!params.container)
        params.container = containerDiv;
    titleBase = splitTitle(params.tblRow[0])[0];
    htmlRow = document.createElement("div");
    htmlRow.classList.add("Row"); //we add 'Row' class to this div
    htmlRow.classList.add("DisplayMode" + localStorage.displayMode); //we add the displayMode class to this div
    htmlRow.dataset.root = titleBase.replace(/Part\d+/, "");
    if (params.actorClass)
        htmlRow.classList.add(params.actorClass);
    if (params.actorClass && params.actorClass.includes('Title')) {
        htmlRow.addEventListener("click", (e) => {
            e.preventDefault;
            collapseOrExpandText({ titleRow: htmlRow });
        }); //we also add a 'click' eventListener to the 'Title' elements
        htmlRow.id = params.tblRow[0]; //we add an id to all the titles in order to be able to retrieve them for the sake of adding a title shortcut in the titles right side bar
    }
    ;
    //looping the elemparams.ents containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
    for (let x = 1; x < params.tblRow.length; x++) {
        //x starts from 1 because prayers[0] is the id
        if (!params.tblRow[x] || params.tblRow[x] === ' ')
            continue; //we escape the empty strings if the text is not available in all the button's languages
        if (params.actorClass &&
            (params.actorClass === "Comments" || params.actorClass === "CommentText")) {
            //this means it is a comment
            x === 1 ? (lang = params.languagesArray[1]) : (lang = params.languagesArray[3]);
        }
        else {
            lang = params.languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
        } //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
        if (userLanguages.indexOf(lang) > -1) {
            p = document.createElement("p"); //we create a new <p></p> element for the text of each language in the 'prayer' array (the 'prayer' array is constructed like ['prayer id', 'text in AR, 'text in FR', ' text in COP', 'text in Language', etc.])
            if (!params.actorClass)
                p.classList.add("PrayerText"); //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
            p.dataset.root = htmlRow.dataset.root; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
            text = params.tblRow[x];
            p.lang = lang.toLowerCase();
            p.classList.add(lang);
            p.innerText = text;
            p.addEventListener("dblclick", (ev) => {
                ev.preventDefault();
                toggleAmplifyText(ev.target, "amplifiedText");
            }); //adding a double click eventListner that amplifies the text size of the chosen language;
            htmlRow.appendChild(p); //the row which is a <div></div>, will encapsulate a <p></p> element for each language in the 'prayer' array (i.e., it will have as many <p></p> elements as the number of elements in the 'prayer' array)
        }
    }
    try {
        //@ts-ignore
        params.position.el
            ? //@ts-ignore
                params.position.el.insertAdjacentElement(params.position.beforeOrAfter, htmlRow)
            : //@ts-ignore
                params.position.appendChild(htmlRow);
        return htmlRow;
    }
    catch (error) {
        console.log('an error occured: position = ', params.position, ' and tblRow = ', params.tblRow);
        console.log(error);
    }
}
/**
 * Shows a bookmark link in the right side bar for each title in the currently displayed prayers
 * @param {NodeListOf<>Element} titlesCollection  - a Node list of all the divs containing the titles of the different sections. Each div will be passed to addTitle() in order to create a link in the right side bar pointing to the div
 * @param {HTMLElement} rightTitlesDiv - the right hand side bar div where the titles will be displayed
 * @param {boolean} clear - indicates whether the side bar where the links will be inserted, must be cleared before insertion
 */
async function showTitlesInRightSideBar(titlesCollection, rightTitlesDiv, clear = true, dataGroup) {
    let titlesArray = [];
    //this function shows the titles in the right side Bar
    if (!rightTitlesDiv)
        rightTitlesDiv = sideBarTitlesContainer;
    if (clear) {
        rightTitlesDiv.innerHTML = "";
    } //we empty the side bar
    let bookmark;
    titlesArray =
        titlesCollection
            .map(titleRow => {
            titleRow.id += titlesCollection.indexOf(titleRow).toString();
            return addTitle(titleRow);
        });
    /**
     * Adds shortcuts to the diffrent sections by redirecting to the title of the section
     * @param {HTMLElement} titles - a div including paragraphs, each displaying the title of the section in a given language
     */
    function addTitle(titlesRow) {
        let text = "", titleDiv = document.createElement("div"); //this is just a container
        titleDiv.role = "button";
        if (dataGroup)
            titleDiv.dataset.group = dataGroup;
        else
            titleDiv.dataset.group = titlesRow.id;
        titleDiv.classList.add("sideTitle");
        if (titlesRow.classList.contains(hidden))
            titleDiv.classList.add(hidden); //if the html element from which we will create the title is hidden, we hide the title as well
        rightTitlesDiv.appendChild(titleDiv);
        bookmark = document.createElement("a");
        titleDiv.appendChild(bookmark);
        bookmark.href = "#" + titlesRow.id; //we add a link to the element having as id, the id of the prayer
        titleDiv.addEventListener("click", () => {
            closeSideBar(rightSideBar); //when the user clicks on the div, the rightSideBar is closed
            collapseOrExpandText({ titleRow: titlesRow, collapse: false }); //We pass the 'toggleHidden' paramater = false in order to always show/uncollapse the sibligns 
        });
        if (titlesRow.querySelector('.' + defaultLanguage)) {
            //if the titles div has a paragraph child with class="AR", it means this is the paragraph containing the Arabic text of the title
            text += titlesRow
                .querySelector('.' + defaultLanguage)
                //@ts-ignore
                .innerText.split('\n')[0];
        }
        if (titlesRow.querySelector('.' + foreingLanguage)) {
            if (text !== '') {
                text += "\n" + titlesRow.querySelector('.' + foreingLanguage)
                    //@ts-ignore
                    .innerText.split('\n')[0];
            }
            else {
                text += titlesRow.querySelector('.' + foreingLanguage)
                    //@ts-ignore
                    .innerText.split('\n')[0];
            }
        }
        ;
        //we remove the plus(+) or minus(-) signs from the begining text of the Arabic paragraph;
        text = text
            .replaceAll(String.fromCharCode(plusCharCode) + ' ', '')
            .replaceAll(String.fromCharCode(plusCharCode + 1) + ' ', '');
        bookmark.innerText = text;
        //If the container is an 'Expandable' container, we hide the title
        if (titlesRow.parentElement && titlesRow.parentElement.classList.contains('Expandable'))
            titleDiv.classList.add(hidden);
        return titleDiv;
    }
    return titlesArray;
}
/**
 * Takes a Button and, depending on its properties will do the following: if the button has children[] buttons, it will create an html element in the left side bar for each child; if the button has inlineBtns[], it will create an html element in the main page for each inlineButton; if the button has prayers[] and prayersArray, and languages, it will look in the prayersArray for each prayer in the prayers[], and if found, will create an html element in the main page showing the text of this element. It will only do so for the languages included in the usersLanguages.
 * @param {Button} btn - the button that the function will process according to its properties (children[], inlineBtns[], prayers[], onClick(), etc.)
 * @param {boolean} clear - whether to clear or not the text already displayed in the main page
 * @param {boolean} click - if the button has its onClick property (which is a function) and if click = true, the onClick function will be called
 * @param {boolean} pursue - after the onClick function is called, if pursue = false, the showchildButtonsOrPrayers() will return, otherwise, it will continue processing the other properties of the button
 * @returns
 */
function showChildButtonsOrPrayers(btn, clear = true) {
    if (!btn)
        return;
    let container = containerDiv;
    if (btn.docFragment)
        container = btn.docFragment;
    hideInlineButtonsDiv();
    if (clear) {
        inlineBtnsDiv.innerHTML = "";
        containerDiv.style.gridTemplateColumns = "100%";
    }
    if (btn.onClick)
        btn.onClick();
    if (btn.prayersSequence && btn.prayersArray && btn.languages && btn.showPrayers)
        showPrayers(btn, true, true, container);
    if (btn.afterShowPrayers)
        btn.afterShowPrayers();
    //Important ! : setCSSGridTemplate() MUST be called after btn.afterShowPrayres()
    setCSS(Array.from(container.querySelectorAll('div.Row'))); //setting the number and width of the columns for each html element with class 'Row'
    applyAmplifiedText(Array.from(container.querySelectorAll('div.Row')));
    if (btn.children && btn.children.length > 0) {
        if (clear) {
            //We will not empty the left side bar unless the btn has children to be shown  in the side bar instead of the children of the btn's parent (btn being itself one of those children)
            //!CAUTION, this must come after btn.onClick() is called because some buttons are not initiated with children, but their children are added  when their onClick()  is called
            sideBarBtnsContainer.innerHTML = "";
        }
        btn.children.forEach((childBtn) => {
            //for each child button that will be created, we set btn as its parent in case we need to use this property on the button
            if (btn.btnID != btnGoBack.btnID)
                childBtn.parentBtn = btn;
            //We create the html element reprsenting the childBtn and append it to btnsDiv
            createBtn(childBtn, sideBarBtnsContainer, childBtn.cssClass);
        });
    }
    showTitlesInRightSideBar(Array.from(container.querySelectorAll(".Title, .SubTitle")));
    if (btn.parentBtn
        && btn.btnID !== btnGoBack.btnID
        && !sideBarBtnsContainer.querySelector('#' + btnGoBack.btnID)) {
        //i.e., if the button passed to showChildButtonsOrPrayers() has a parentBtn property and it is not itself a btnGoback (which we check by its btnID property), we wil create a goBack button and append it to the sideBar
        //the goBack Button will only show the children of btn in the sideBar: it will not call showChildButonsOrPrayers() passing btn to it as a parameter. Instead, it will call a function that will show its children in the SideBar
        createGoBackBtn(btn.parentBtn, sideBarBtnsContainer, btn.cssClass);
        lastClickedButton = btn;
    }
    if (btn.btnID !== btnMain.btnID //The button itself is not btnMain
        && btn.btnID !== btnGoBack.btnID //The button itself is not btnGoBack
        && !sideBarBtnsContainer.querySelector('#' + btnMain.btnID) //No btnMain is displayed in the sideBar
    ) {
        createBtn(btnMain, sideBarBtnsContainer, btnMain.cssClass);
        /*let image = document.getElementById("homeImg");
        if (image) {
          document.getElementById("homeImg").style.width = "20vmax";
          document.getElementById("homeImg").style.height = "25vmax";
        }*/
    }
    if (btn.docFragment)
        containerDiv.appendChild(btn.docFragment);
    if (btn.btnID === btnMain.btnID)
        addSettingsButton();
    //If at the end no prayers are displayed in containerDiv, we will show the children of btnMain in containerDiv
    if (btn.btnID !== btnMain.btnID
        && containerDiv.children.length > 0
        && containerDiv.children[0].classList.contains('mainPageBtns'))
        btnMain.onClick();
}
/**
 * Appends the settings button to the right side bar
*/
function addSettingsButton() {
    let settingsBtn = sideBarBtnsContainer.querySelector('#settings');
    //We finally add the settings button to the right side Bar
    if (settingsBtn)
        return sideBarBtnsContainer.append(settingsBtn); //If the button is already there, we move it to the bottom of the list
    //Esle: we create a new Buton
    settingsBtn = document.createElement('div');
    settingsBtn.id = 'settings';
    settingsBtn.classList.add('settings');
    settingsBtn.innerText = 'Settings';
    settingsBtn.addEventListener('click', () => showSettingsPanel());
    sideBarBtnsContainer.appendChild(settingsBtn);
}
;
/**
 * This function adds the same data-group to all the divs that need to be hidden or shown when a div having the class 'Title' or 'SubTitle' is clicked (this div is passed to the function in the titleRow argument). The data-group that will be given to each div is same as the data-root of the titleRow div.
 * @param {string} titleClass - the type of name of the title class ('Title' or 'SubTitle'), of the main div. Its default value is 'Title'
 * @param {HTMLElement} titleRow - is a div element having as class either 'Title' or 'Subtitle'
 */
async function addDataGroupsToContainerChildren(titleClass = 'Title', titleRow) {
    if (!titleRow
        || !titleRow.classList.contains(titleClass))
        return;
    //If a titleRow div is passed, we will give all its siblings a data-group = the data-root of titleRow, and will then return
    let nextSibling = titleRow.nextElementSibling;
    while (nextSibling
        && !nextSibling.classList.contains(titleClass)) {
        nextSibling.dataset.group = titleRow.dataset.root;
        nextSibling = nextSibling.nextElementSibling;
    }
}
/**
 * Returns an html button element showing a 'Go Back' button. When clicked, this button passes the goTo button or inline button to showchildButtonsOrPrayers(), as if we had clicked on the goTo button
 * @param {Button} goTo - a button that, when the user clicks the 'Go Back' html button element generated by the function, calls showchildButtonsOrPrayers(goTo) thus simulating the action of clicking on the goTo button (its children, inlineBtns, prayers, etc., will be displayed)
 * @param {HTMLElement} btnsDiv - the html element to which the html element button created and returned by the function, will be appended
 * @returns {Promise<HTMLElement>} - when resolved, the function returns the html button element it has created and appended to div
 */
async function createGoBackBtn(goTo, btnsDiv, cssClass) {
    //We will create a 'Go Back' and will append it to btnsDiv
    let goBak = new Button({
        btnID: btnGoBack.btnID,
        label: btnGoBack.label,
        cssClass: cssClass,
        onClick: () => {
            btnsDiv.innerHTML = '';
            if (goTo.children)
                goTo.children
                    .forEach(childBtn => {
                    createBtn(childBtn, btnsDiv, childBtn.cssClass, true);
                });
            if (goTo.parentBtn)
                createGoBackBtn(goTo.parentBtn, btnsDiv, goTo.parentBtn.cssClass);
            if (btnsDiv === sideBarBtnsContainer)
                addSettingsButton();
        },
    });
    return createBtn(goBak, btnsDiv, goBak.cssClass, false, goBak.onClick);
}
/**
 * Creates a an anchor html element and sets its href attribute to the id parameter, then clicks the anchor in order to scroll to it and, finally, removes the anchor
 * @param {string} id - the id of the html element to which the href attribute of the anchor will be set
*/
function createFakeAnchor(id) {
    let a = document.createElement("a");
    a.href = "#" + id;
    a.click();
    a.remove();
}
/**
 * Creates an html element for the button and shows it in the relevant side bar. It also attaches an 'onclick' event listener to the html element which passes the button it self to showChildButtonsOrPrayers()
 * @param {Button} btn  - the button that will be displayed as an html element in the side bar
 * @param {HTMLElement} btnsBar  - the side bar where the button will be displayed
 * @param {string} btnClass  - the class that will be given to the button (it is usually the cssClass property of the button)
 * @param {boolean} clear - a boolean indicating whether or not the text already displayed (in containerDiv) should be cleared when the button is clicked. This parameter will only work (i.e., will be useful) if the onClick parameter is missing, because in this case the onClick parameter is set to showChildButtonsOrPrayers(), and clear is passed to it as a parameter. Otherwise, it is the function passed as the onClick paramater that will be called.
 * @param {Function} onClick - this is the function that will be attached to the 'click' eventListner of the button, and will be called when it is clicked
 * @returns {HTMLElement} - the html element created for the button
 */
function createBtn(btn, btnsBar, btnClass, clear = true, onClick) {
    let newBtn = document.createElement("button");
    btnClass
        ? newBtn.classList.add(btnClass)
        : newBtn.classList.add(btn.cssClass);
    newBtn.id = btn.btnID;
    //Adding the labels to the button
    for (let lang in btn.label) {
        if (!btn.label[lang]
            || (Object.keys(btn.label).indexOf(lang) !== 0
                && Object.keys(btn.label).indexOf(lang) !== 1))
            continue;
        //for each language in btn.text, we create a new "p" element
        let btnLable = document.createElement("p");
        //we edit the p element by adding its innerText (=btn.text[lang], and its class)
        editBtnInnerText(btnLable, btn.label[lang], userLanguages[Object.keys(btn.label).indexOf(lang)]);
        //we append the "p" element  to the newBtn button
        newBtn.appendChild(btnLable);
    }
    btnsBar.appendChild(newBtn);
    //If no onClick parameter/argument is passed to createBtn(), and the btn has any of the following properties: children/prayers/onClick or inlinBtns, we set the onClick parameter to a function passing the btn to showChildButtonsOrPrayers
    if (!onClick && (btn.children || btn.prayersSequence || btn.onClick))
        onClick = () => showChildButtonsOrPrayers(btn, clear);
    //Else, it is the onClick parametr that will be attached to the eventListner
    newBtn.addEventListener("click", (e) => {
        e.preventDefault;
        onClick();
    });
    function editBtnInnerText(el, text, btnClass) {
        el.innerText = text;
        el.classList.add("btnText");
        if (btnClass) {
            el.classList.add(btnClass);
        }
    }
    return newBtn;
}
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
function registerServiceWorker() {
    const registerServiceWorker = async () => {
        if ("serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.register("/sw.js", {
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
    };
}
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
        ["0909", "1601"],
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
function toggleSideBars() {
    if (!leftSideBar.classList.contains(hidden) &&
        rightSideBar.classList.contains(hidden)) {
        closeSideBar(leftSideBar);
    }
    else if (!rightSideBar.classList.contains(hidden) &&
        leftSideBar.classList.contains(hidden)) {
        closeSideBar(rightSideBar);
    }
    else if (leftSideBar.classList.contains(hidden) &&
        leftSideBar.classList.contains(hidden)) {
        openSideBar(leftSideBar);
    }
}
/**
 * Opens the side bar by setting its width to a given value
 * @param {HTMLElement} sideBar - the html element representing the side bar that needs to be opened
 */
async function openSideBar(sideBar) {
    sideBar.classList.remove(hidden);
}
/**
 * Removes a script (found by its id), and reloads it by appending it to the body of the document
 *@param {string[]} scriptIDs - the ids if the scripts that will be removed and reloaded as child of the body
 */
function reloadScriptToBody(scriptIDs) {
    let old, copy;
    scriptIDs.forEach(id => {
        old = document.getElementById(id);
        copy = document.createElement('script');
        copy.id = old.id;
        copy.src = old.src;
        copy.type = old.type;
        old.remove();
        document.getElementsByTagName('body')[0].appendChild(copy);
    });
}
/**
 * Closes the side bar passed to it by setting its width to 0px
 * @param {HTMLElement} sideBar - the html element representing the side bar to be closed
 */
async function closeSideBar(sideBar) {
    sideBar.classList.add(hidden);
}
/**
 * Detects whether the user swiped his fingers on the screen, and opens or closes teh right or left side bars accordingly
 */
function DetectFingerSwipe() {
    //Add finger swipe event
    let xDown = null;
    let yDown = null;
    document.addEventListener("touchstart", handleTouchStart, false);
    document.addEventListener("touchmove", handleTouchMove, false);
    function handleTouchStart(evt) {
        const firstTouch = evt.touches[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    }
    function handleTouchMove(evt) {
        evt.preventDefault;
        if (!xDown || !yDown)
            return;
        let xUp = evt.touches[0].clientX;
        let yUp = evt.touches[0].clientY;
        let xDiff = xDown - xUp;
        let yDiff = yDown - yUp;
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            /*most significant*/
            if (xDiff > 10) {
                /* right to left swipe */
                if (!leftSideBar.classList.contains(hidden) &&
                    rightSideBar.classList.contains(hidden)) {
                    closeSideBar(leftSideBar);
                }
                else if (rightSideBar.classList.contains(hidden) &&
                    leftSideBar.classList.contains(hidden)) {
                    openSideBar(rightSideBar);
                }
            }
            else if (xDiff < -10) {
                /* left to right swipe */
                if (leftSideBar.classList.contains(hidden) &&
                    rightSideBar.classList.contains(hidden)) {
                    openSideBar(leftSideBar);
                }
                else if (!rightSideBar.classList.contains(hidden) &&
                    leftSideBar.classList.contains(hidden)) {
                    closeSideBar(rightSideBar);
                }
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
}
/**
 * Takes an Html Element and looks for all the other elements having the same "lang" attribute as the Html element passed to it, then it checks if the size of text is amplified or not: if already amplified, it reduces it, if not, it amplifies it
 * @param {HTMLElement} target - the Html element containing the text which we will be amplified together with all the text with the same language
 * @param {string} myClass - the name of the CSS class that will be applied to amplify the text
 */
function toggleAmplifyText(target, myClass) {
    if (localStorage.displayMode === displayModes[1]) {
        //If we are in the "Presentation" Mode, we will not amplify or reduce the text, we will open or close the left side bar
        toggleSideBars();
        return;
    }
    let amplified = JSON.parse(localStorage.textAmplified);
    let selector = 'p[lang="' + target.lang + '"]';
    let sameLang = containerDiv.querySelectorAll(selector);
    sameLang.forEach((p) => {
        p.classList.toggle(myClass);
        Array.from(p.children).forEach(child => child.classList.toggle(myClass));
    });
    if (target.classList.contains(myClass)) {
        //it means that the class was added (not removed) when the user dbl clicked 
        amplified.filter(el => el[0] === target.lang.toUpperCase())[0][1] = true;
    }
    else {
        amplified.filter(el => el[0] === target.lang.toUpperCase())[0][1] = false;
    }
    localStorage.textAmplified = JSON.stringify(amplified);
}
/**
 * This function is meant to create a side bar on the fly. we are not using it anymore. It will be deprecated.
 * @param id
 * @returns
 */
function buildSideBar(id) {
    let sideBar = document.createElement("div");
    let btnsDiv = document.createElement("div");
    let a = document.createElement("a");
    sideBar.id = id;
    sideBar.classList.add(id);
    sideBar.classList.add("sideBar");
    sideBar.classList.add("collapsed");
    a.innerText = "&times";
    a.setAttribute("href", "javascript:void(0)");
    a.classList.add("closebtn");
    a.addEventListener("click", (e) => {
        e.preventDefault;
        closeSideBar(sideBar);
    });
    sideBar.appendChild(a);
    btnsDiv.id = "sideBarBtns";
    sideBar.appendChild(btnsDiv);
    if (id === "leftSideBar") {
        //leftSideBar = sideBar
    }
    else if (id === "rightSideBar") {
        //rightSideBar = sideBar
    }
    return sideBar;
}
/**
 * This function takes an string[][] representing a Word table (where each each string[][] represents a row of the table, and has as a 1st string element the title of the Word table. Each next string element represents the text of the each cell of the row in a given language.
 * @param {Button} btn
 * @param {boolean} clearContent - tells wether the containerDiv content needs to be cleared
 *  @param {Boolean} clearSideBar - tells wether the right sideBar needs to be cleared
 * @param {HTMLElement|{beforeOrAfter:insertPosition, el:HtmlElement}} position - if it is an HTML Element, the newly created divs will be appended to this html element. If it is an object, the newly created divs will be placed in the position provided (the position is of type insertPosition) by the beforeOrAfter property, in relation to the html element provied in the el property
 */
function showPrayers(btn, clearContent = true, clearRightSideBar = true, position = containerDiv) {
    let container;
    if (btn.docFragment) {
        container = btn.docFragment;
    }
    ;
    if (!btn || !btn.prayersSequence)
        return;
    if (btn.btnID != btnGoBack.btnID && btn.btnID != btnMain.btnID)
        closeSideBar(leftSideBar);
    if (clearContent)
        containerDiv.innerHTML = "";
    if (clearRightSideBar)
        sideBarTitlesContainer.innerHTML = ""; //this is the right side bar where the titles are displayed for navigation purposes
    let date;
    return btn.prayersSequence
        .map((prayer) => {
        if (!prayer)
            console.log('no prayer');
        if (!prayer)
            return;
        if (prayer.includes("&D="))
            date = "";
        else
            date = "&D=" + copticReadingsDate; //this is the default case where the date equals the copticReadingsDate. This works for most of the occasions.
        prayer += date;
        let wordTable = findTableInPrayersArray(prayer, btn.prayersArray);
        if (!wordTable)
            return;
        //We will return an HTMLDivElement[] of all the divs that will be created from wordTable
        return wordTable
            .map((row) => {
            return createHtmlElementForPrayer({
                tblRow: row,
                languagesArray: btn.languages,
                position: position,
                container: container
            });
        });
    });
}
/**
 * Sets the number of columns and their widths for the provided list of html elements which style display property = 'grid'
 * @param {NodeListOf<Element>} Rows - The html elements for which we will set the css. These are usually the div children of containerDiv
 */
async function setCSS(htmlRows) {
    if (!htmlRows)
        return;
    if (localStorage.displayMode === displayModes[1])
        return;
    if (!htmlRows)
        return;
    let plusSign = String.fromCharCode(plusCharCode), minusSign = String.fromCharCode(plusCharCode + 1);
    htmlRows
        .forEach(row => {
        //Setting the number of columns and their width for each element having the 'Row' class for each Display Mode
        row.style.gridTemplateColumns = getColumnsNumberAndWidth(row);
        //Defining grid areas for each language in order to be able to control the order in which the languages are displayed (Arabic always on the last column from left to right, and Coptic on the first column from left to right)
        row.style.gridTemplateAreas = setGridAreas(row);
        (function addRightBorders() {
            let rowChildren = Array.from(row.children);
            rowChildren
                .forEach(parag => {
                if (rowChildren.indexOf(parag) !== rowChildren.length - 1)
                    parag.style.borderRightStyle = 'groove';
            });
        })();
        if (checkIfTitle(row)) {
            //This is the div where the titles of the prayer are displayed. We will add an 'on click' listner that will collapse the prayers
            row.role = "button";
            addDataGroupsToContainerChildren(row.classList[row.classList.length - 1], row);
            (async function addPlusAndMinusSigns() {
                let defLangParag = row.querySelector('p[lang="' + defaultLanguage.toLowerCase() + '"]');
                if (!defLangParag)
                    defLangParag = row.lastElementChild;
                if (!defLangParag)
                    return console.log('no paragraph with lang= ' + defaultLanguage);
                if (defLangParag.innerHTML.includes(plusSign + ' '))
                    defLangParag.innerHTML = defLangParag.innerHTML.replace(plusSign + ' ', ''); //We remove the + sign in the begining (if it exists)
                if (defLangParag.innerHTML.includes(minusSign + ' '))
                    defLangParag.innerHTML = defLangParag.innerHTML.replace(minusSign + ' ', ''); //!Caution: we need to work with the innerHTML in order to avoid losing the new line or any formatting to the title text when adding the + or - sing. So don't change the innerHTML to innerText or textContent 
                if (row.dataset.isCollapsed)
                    defLangParag.innerHTML =
                        plusSign + " " + defLangParag.innerHTML; //We add the plus (+) sign at the begining
                if (!row.dataset.isCollapsed)
                    defLangParag.innerHTML =
                        minusSign + " " + defLangParag.innerHTML; //We add the minus (-) sig at the begining;
            })();
        }
        ;
        if (row.classList.contains('Diacon'))
            replaceMusicalNoteSign(Array.from(row.querySelectorAll('p')));
        (function formatRow() {
            return;
            if (row.classList.contains('showDae')) {
                row.style.color = '#5270a3';
                row.style.fontWeight = 'bold';
                row.style.padding = '7px';
            }
            if (row.classList.contains(displayModes[1])) {
                if (row.classList.contains('Comments') || row.classList.contains('CommentText'))
                    row.classList.add(hidden);
            }
            ;
        })();
        (function formatParagraphs() {
            return;
            let paragraphs = Array.from(row.children);
            paragraphs.forEach(p => {
                if (p.tagName !== 'P')
                    return;
                p.style.display = 'block';
                p.style.gridArea = p.lang.toUpperCase();
                p.style.padding = '0px 7px 0px 7px';
                p.style.textAlign = 'justify';
                if (paragraphs.indexOf(p) !== paragraphs.length - 1) {
                    p.style.borderRightStyle = 'groove';
                }
                if (row.classList.contains(displayModes[1])) {
                    p.style.backgroundColor = 'black';
                    p.style.color = 'white';
                    p.style.borderRadius = '20px';
                }
                if (p.lang === 'ar' || p.lang === 'ca') {
                    p.style.direction = 'rtl';
                    p.style.fontFamily = 'GentiumBookPlus';
                    p.style.fontSize = '18.5pt';
                    p.style.fontWeight = '500';
                    p.style.lineHeight = '30px';
                    if (row.classList.contains(displayModes[1])) {
                        p.style.fontSize = '8vh';
                        p.style.lineHeight = '3rem';
                    }
                }
                else if (p.lang === 'fr' || p.lang === 'fr') {
                    p.style.fontFamily = 'DCO';
                    p.style.fontSize = '13pt';
                    p.style.fontWeight = 'normal';
                }
                else if (p.lang === 'cop') {
                    p.style.fontFamily = 'ArialCoptic';
                    p.style.lineHeight = '25px';
                }
                if (row.classList.contains('Title') || row.classList.contains('SubTitle')) {
                    p.style.textAlign = 'center';
                }
                if (row.classList.contains('colorbtn')) {
                    p.style.margin = '1px 1px';
                }
                if (row.classList.contains('inlineBtn') || row.classList.contains('sideBarBtn')) {
                    p.style.fontSize = '12pt';
                    p.style.marginTop = '1px';
                    p.style.marginBottom = '1px';
                    p.style.lineHeight = '20px';
                }
            });
        })();
    });
}
;
/**
 * Returns a string indicating the number of columns and their widths
 * @param {HTMLElement} row - the html element created to show the text representing a row in the Word table from which the text of the prayer was taken (the text is provided as a string[] where the 1st element is the tabel's id and the other elements represent each the text in a given language)
 * @returns  {string} - a string represneting the value that will be given to the grid-template-columns of the row
 */
function getColumnsNumberAndWidth(row) {
    let width = (100 / row.children.length).toString() + "% ";
    return width.repeat(row.children.length);
}
/**
 * Returns a string representing the grid areas for an html element with a 'display:grid' property, based on the "lang" attribute of its children
 * @param {HTMLElement} row - an html element having children and each child has a "lang" attribute
 * @returns {string} representing the grid areas based on the "lang" attribute of the html element children
 */
function setGridAreas(row) {
    if (localStorage.displayMode === displayModes[1])
        return;
    let areas = [], child;
    for (let i = 0; i < row.children.length; i++) {
        child = row.children[i];
        areas.push(child.lang.toUpperCase());
    }
    if (areas.indexOf(defaultLanguage) === 0 &&
        !row.classList.contains("Comments") &&
        !row.classList.contains("CommentText")) {
        //if the 'AR' is the first language, it means it will be displayed in the first column from left to right. We need to reverse the array in order to have the Arabic language on the last column from left to right
        areas.reverse();
    }
    return '"' + areas.toString().split(",").join(" ") + '"'; //we should get a string like ' "AR COP FR" ' (notice that the string marks " in the beginning and the end must appear, otherwise the grid-template-areas value will not be valid)
}
;
async function applyAmplifiedText(htmlRows) {
    if (!htmlRows)
        return;
    if (localStorage.displayMode === displayModes[1])
        return; //We don't amplify the text if we are in the 'Presentation Mode'
    let langs = JSON.parse(localStorage.textAmplified);
    langs = langs.filter(lang => lang[1] === true);
    htmlRows
        .forEach(row => {
        //looping the rows in the htmlRows []
        Array.from(row.children)
            //looping the children of each row (these children are supposedly paragraph elements)
            .forEach((child) => {
            if (!child.lang)
                return;
            //if the child has the lang attribute set, we will loop each language in langs, and if 
            langs
                .forEach(lang => {
                if (child.lang === lang[0].toLowerCase())
                    child.classList.add("amplifiedText");
            });
        });
    });
}
async function setButtonsPrayers() {
    btns.map((btn) => {
        btnsPrayersSequences.push(btn.onClick());
        btn.retrieved = true;
    });
}
/**
 * Hides all the nextElementSiblings of a title html element (i.e., a div having the class 'Title' or 'SubsTitle') if the nextElementSibling has the same data-group attribute as the title html element
 * @param {HTMLElement} titleRow - the html element containing the title, which, when clicked, we will toggle the 'hidden' class from all its  nextElementSiblings
 * @param {HTMLElement} container - the html element containing the titleRow and its siblings. If ommitted, its default value is containerDiv
 * @param {boolean} toggleHidden - if set to 'true', the function will not toggle the 'hidden' class from the sibligings, but will instead always remove it if presnet. i.e., this option will make the function always show the siblings and never hide them. This was needed in some scenarios
 */
function collapseOrExpandText(params) {
    if (localStorage.displayMode === displayModes[1])
        return; //When we are in the 'Presentation' display mode, the titles sibligins are not hidden when we click the title div
    if (params.collapse === true) {
        params.titleRow.dataset.isCollapsed = 'true';
    }
    else if (params.collapse === false) {
        params.titleRow.dataset.isCollapsed = '';
    }
    else {
        //In this case we will toggle the isCollapsed status
        if (params.titleRow.dataset.isCollapsed)
            params.titleRow.dataset.isCollapsed = '';
        else if (!params.titleRow.dataset.isCollapsed)
            params.titleRow.dataset.isCollapsed = 'true';
    }
    togglePlusAndMinusSignsForTitles(params.titleRow);
    //Hiding or showing the elements linked to the title (titleRow)
    Array.from(params.titleRow.parentElement.children)
        .filter((div) => div.dataset.group
        && div.dataset.group === params.titleRow.dataset.root)
        .forEach(div => {
        if (div === params.titleRow)
            return;
        if (params.titleRow.dataset.isCollapsed && !div.classList.contains(hidden))
            div.classList.add(hidden);
        else if (div.classList.contains(hidden) && !div.classList.contains('Expandable'))
            div.classList.remove(hidden);
    });
}
;
/**
 * Toggels the minus and plus signs in the Title
 * @param {HTMLElement} titleRow - the html element (usually a div with class 'Title') that we wqnt to toggle the minus or plus signs according to whether the text is collapsed or not
 * @returns
 */
async function togglePlusAndMinusSignsForTitles(titleRow, plusCode = plusCharCode) {
    if (!titleRow.children)
        return;
    let parag;
    parag =
        Array.from(titleRow.children)
            .filter(child => child.innerHTML.startsWith(String.fromCharCode(plusCode))
            || child.innerHTML.startsWith(String.fromCharCode(plusCode + 1)))[0];
    if (!parag)
        return;
    if (!titleRow.dataset.isCollapsed) {
        parag.innerHTML = parag.innerHTML.replace(String.fromCharCode(plusCode), String.fromCharCode(plusCode + 1));
    }
    else if (titleRow.dataset.isCollapsed) {
        parag.innerHTML = parag.innerHTML.replace(String.fromCharCode(plusCode + 1), String.fromCharCode(plusCode));
    }
}
/**
 * Collapses all the tiltes (i.e. all the divs with class 'Title' or 'SubTitle') in the html element passed as argument
 * @param {HTMLElement} container - the html element in which we will collapse all the divs having as class 'Title' or 'SubTitle'
 */
function collapseAllTitles(htmlRows, hideSideBarTitle = false) {
    if (!htmlRows || htmlRows.length === 0)
        return;
    if (localStorage.displayMode === displayModes[1])
        return;
    htmlRows
        .forEach((row) => {
        if (!checkIfTitle(row) && !row.classList.contains(hidden))
            row.classList.add(hidden);
        else {
            row.dataset.isCollapsed = 'true';
            togglePlusAndMinusSignsForTitles(row);
            if (hideSideBarTitle)
                hideOrShowTitle(row, true);
        }
        ;
    });
}
/**
 * Creates an array from all the children of a given html element (container), and filteres the array based on the data-root attribute provided, and on the criteria provided in options
 * @param {HTMLElement | DocumentFragment} container - the html element containing the children that we want to filter based on their data-root attributed
 * @param {string} dataRoot - the data-root attribute based on which we want to filter the children of container
 * @param {{equal?:boolean, includes?:boolean, startsWith?:boolean, endsWith?:boolean}} options - the criteria according to which we want the data-root attribute of each child element to mach dataRoot: absolutely equal (===)? startsWith(dataRoot)?, etc.
 * @returns {HTMLDivElement[]} - the children of container filtered based on their data-root attributes
 */
function selectElementsByDataRoot(container, dataRoot, options) {
    let children = Array.from(container.children);
    if (options.equal) {
        return children.filter(htmlRow => htmlRow.tagName === 'DIV' && htmlRow.dataset.root && htmlRow.dataset.root === dataRoot);
    }
    else if (options.includes) {
        return children.filter(htmlRow => htmlRow.tagName === 'DIV' && htmlRow.dataset.root && htmlRow.dataset.root.includes(dataRoot));
    }
    else if (options.startsWith) {
        return children.filter(htmlRow => htmlRow.tagName === 'DIV' && htmlRow.dataset.root && htmlRow.dataset.root.startsWith(dataRoot));
    }
    else if (options.endsWith) {
        return children.filter(htmlRow => htmlRow.tagName === 'DIV' && htmlRow.dataset.root && htmlRow.dataset.root.endsWith(dataRoot));
    }
}
/**
 *
 * @param {string[][][]} selectedPrayers - An array containing the optional prayers for which we want to display html button elements in order for the user to choose which one to show
 * @param {Button} btn
 * @param {HTMLElement} btnsDiv - The html element in which each prayer will be displayed when the user clicks an inline button representing this prayer
 * @param {Object{AR:string, FR:'string'}} btnLabels - An object containing the labels of the master button that the user will click to show a list of buttons, each representing a prayer in selectedPrayers[]
 * @param {string} masterBtnID - The id of the master button
 */
async function showMultipleChoicePrayersButton(filteredPrayers, btn, btnLabels, masterBtnID, masterBtnDiv, anchor) {
    if (!anchor)
        console.log('anchor missing');
    if (!masterBtnDiv && anchor) {
        masterBtnDiv = document.createElement("div"); //a new element to which the inline buttons elements will be appended
        anchor.insertAdjacentElement("afterend", masterBtnDiv); //we insert the div after the insertion position
    }
    let prayersMasterBtn, next;
    //Creating a new Button to which we will attach as many inlineBtns as there are optional prayers suitable for the day (if it is a feast or if it falls during a Season)
    prayersMasterBtn = new Button({
        btnID: masterBtnID,
        label: btnLabels,
        children: await createInlineBtns(),
        pursue: false,
        cssClass: inlineBtnClass,
        onClick: () => {
            let groupOfNumber = 4;
            //We show the inlineBtnsDiv (bringing it in front of the containerDiv by giving it a zIndex = 3)
            showInlineBtnsDiv(masterBtnID, true);
            //When the prayersMasterBtn is clicked, it will create a new div element to which it will append html buttons element for each inlineBtn in its inlineBtns[] property
            let newDiv = document.createElement("div");
            newDiv.id = masterBtnID + "Container";
            //Customizing the style of newDiv
            newDiv.classList.add("inlineBtns");
            //We set the gridTemplateColumns of newDiv to a grid of 3 columns. The inline buttons will be displayed in rows of 3 inline buttons each
            newDiv.style.gridTemplateColumns = (String((100 / groupOfNumber) * 2) + '% ').repeat(groupOfNumber / 2);
            //We append newDiv  to inlineBtnsDiv before appending the 'next' button, in order for the "next" html button to appear at the buttom of the inlineBtnsDiv. Notice that inlineBtnsDiv is a div having a 'fixed' position, a z-index = 3 (set by the showInlineBtns() function that we called). It hence remains visible in front of, and hides the other page's html elements in the containerDiv
            inlineBtnsDiv.appendChild(newDiv);
            inlineBtnsDiv.style.borderRadius = "10px";
            let startAt = 0;
            //We call showGroupOfSisxPrayers() starting at inlineBtns[0]
            showGroupOfNumberOfPrayers(startAt, newDiv, groupOfNumber);
        },
    });
    function showGroupOfNumberOfPrayers(startAt, newDiv, groupOfNumber) {
        let childBtn;
        //We set next to undefined, in case it was created before
        next = undefined;
        //if the number of prayers is > than the groupOfNumber AND the remaining prayers are >0 then we show the next button
        if (prayersMasterBtn.children.length > groupOfNumber
            && prayersMasterBtn.children.length - startAt > groupOfNumber) {
            //We create the "next" Button only if there is more than 6 inlineBtns in the prayersBtn.inlineBtns[] property
            next = new Button({
                btnID: "btnNext",
                label: { defaultLanguage: "التالي", foreignLanguage: "Suivants" },
                cssClass: inlineBtnClass,
                onClick: () => {
                    //When next is clicked, we remove all the html buttons displayed in newDiv (we empty newDiv)
                    newDiv.innerHTML = "";
                    //We then remove the "next" html button itself (the "next" button is appended to inlineBtnsDiv directly not to newDiv)
                    inlineBtnsDiv.querySelector('#' + next.btnID).remove();
                    //We set the starting index for the next 6 inline buttons
                    startAt += groupOfNumber;
                    //We call showGroupOfSixPrayers() with the new startAt index
                    showGroupOfNumberOfPrayers(startAt, newDiv, groupOfNumber);
                }
            });
        }
        else {
            next = new Button({
                btnID: "btnNext",
                label: { defaultLanguage: "العودة إلى القداس", foreignLanguage: "Retour à la messe" },
                cssClass: inlineBtnClass,
                onClick: () => {
                    //When next is clicked, we remove all the html buttons displayed in newDiv (we empty newDiv)
                    hideInlineButtonsDiv();
                    createFakeAnchor(prayersMasterBtn.btnID);
                }
            });
        }
        ;
        createBtn(next, inlineBtnsDiv, next.cssClass, false, next.onClick); //notice that we are appending next to inlineBtnsDiv directly not to newDiv (because newDiv has a display = 'grid' of 2 columns. If we append to it, 'next' button will be placed in the 1st cell of the last row. It will not be centered). Notice also that we are setting the 'clear' argument of createBtn() to false in order to prevent removing the 'Go Back' button when 'next' is passed to showchildButtonsOrPrayers()
        for (let n = startAt; n < startAt + groupOfNumber && n < prayersMasterBtn.children.length; n++) {
            //We create html buttons for the 1st 6 inline buttons and append them to newDiv
            childBtn = prayersMasterBtn.children[n];
            createBtn(childBtn, newDiv, childBtn.cssClass, false, childBtn.onClick);
        }
    }
    ;
    //Creating an html button element for prayersMasterBtn and displaying it in btnsDiv (which is an html element passed to the function)
    createBtn(prayersMasterBtn, masterBtnDiv, prayersMasterBtn.cssClass, false, prayersMasterBtn.onClick);
    masterBtnDiv.classList.add("inlineBtns");
    masterBtnDiv.style.gridTemplateColumns = "100%";
    /**
     *Creates a new inlineBtn for each fraction and pushing it to fractionBtn.inlineBtns[]
     */
    async function createInlineBtns() {
        let btns = [];
        btns = filteredPrayers
            .map((prayerTable) => {
            //for each string[][][] representing a table in the Word document from which the text was extracted, we create an inlineButton to display the text of the table
            if (prayerTable.length === 0)
                return;
            let inlineBtn = new Button({
                btnID: splitTitle(prayerTable[0][0])[0],
                label: {
                    defaultLanguage: prayerTable[0][btn.languages.indexOf(defaultLanguage) + 1],
                    foreignLanguage: prayerTable[0][btn.languages.indexOf(foreingLanguage) + 1], //same logic and comment as above
                },
                prayersSequence: [splitTitle(prayerTable[0][0])[0]],
                prayersArray: [[...prayerTable].reverse()],
                languages: btn.languages,
                cssClass: "multipleChoicePrayersBtn",
                children: (() => { if (btn.parentBtn && btn.parentBtn.children)
                    return [...btn.parentBtn.children]; })(),
                onClick: () => {
                    //When the prayer button is clicked, we empty and hide the inlineBtnsDiv
                    hideInlineButtonsDiv();
                    if (masterBtnDiv.dataset.displayedOptionalPrayer) {
                        //If a fraction is already displayed, we will retrieve all its divs (or rows) by their data-root attribute, which  we had is stored as data-displayed-Fraction attribued of the masterBtnDiv
                        containerDiv
                            .querySelectorAll('div[data-root="' + masterBtnDiv.dataset.displayedOptionalPrayer + '"]')
                            .forEach(div => div.remove());
                    }
                    //We call showPrayers and pass inlinBtn to it in order to display the fraction prayer
                    let createdElements = showPrayers(inlineBtn, false, false, {
                        el: masterBtnDiv,
                        beforeOrAfter: "afterend",
                    });
                    masterBtnDiv.dataset.displayedOptionalPrayer = splitTitle(prayerTable[0][0])[0]; //After the fraction is inserted, we add data-displayed-optional-Prayer to the masterBtnDiv in order to use it later to retrieve all the rows/divs of the optional prayer that was inserted, and remove them
                    createdElements
                        .map((table) => {
                        if (table.length === 0)
                            return;
                        table.forEach(el => 
                        //We will add to each created element a data-optional-prayer attribute, which we will use to retrieve these elements and delete them when another inline button is clicked
                        el.dataset.optionalPrayer = el.dataset.root);
                        //We format the grid template of the newly added divs
                        setCSS(table);
                        //We apply the amplification of text
                        applyAmplifiedText(table);
                    });
                    //We scroll to the button
                    createFakeAnchor(masterBtnID);
                },
            });
            return inlineBtn;
        });
        return btns;
    }
}
/**
 * Takes the title of a Word Table, and loops the prayersArray[][][] to check wether an element[0][0] (which reflects a table in the Word document from which the text was retrieved) matches the provided title. If found, it returns the wordTable as a string[][](each array element being a row of the Word table). If dosen't find, it returns 'undefined'
 * @param {string} tableTitle - The title of the table that we need to find in the button's prayersArray[][][]. It corresponds to the element[0][0]
 * @param {string[][][]} prayersArray - the Button that we need to search its prayersArray[][][] property for an element[][] having its [0][0] value equal the title of the Word Table
 * @returns {string[][] | undefined} - an array representing the Word Table if found or 'undefined' if not found
 */
function findTableInPrayersArray(tableTitle, prayersArray) {
    let filtered = prayersArray.filter(table => table[0][0] && splitTitle(table[0][0])[0] === tableTitle);
    if (filtered.length === 1)
        return filtered[0];
    else
        return undefined;
}
/**
 * Shows the inlineBtnsDiv
 * @param {string} status - a string that is added as a dataset (data-status) to indicated the context in which the inlineBtns div is displayed (settings pannel, optional prayers, etc.)
 * @param {boolean} clear - indicates whether the content of the inlineBtns div should be cleared when shwoInlineBtns is called. Its value is set to 'false' by default
 */
function showInlineBtnsDiv(status, clear = false) {
    if (clear) {
        inlineBtnsDiv.innerHTML = "";
    }
    inlineBtnsDiv.style.backgroundImage = 'url(./assets/PageBackgroundCross.jpg)';
    inlineBtnsDiv.style.backgroundSize = '10%';
    inlineBtnsDiv.style.backgroundRepeat = 'repeat';
    /**
     * Appending an X button on the top right of inlineBtnsDiv
     */
    (function appendCloseBtn() {
        let close = document.createElement("a");
        close.innerText = String.fromCharCode(215);
        close.classList.add("closebtn");
        close.style.position = "fixed";
        close.style.top = "5px";
        close.style.right = "15px";
        close.addEventListener("click", (e) => {
            e.preventDefault;
            hideInlineButtonsDiv();
        });
        inlineBtnsDiv.appendChild(close);
    })();
    inlineBtnsDiv.dataset.status = status; //giving the inlineBtnsDiv a data-status attribute
    inlineBtnsDiv.classList.remove(hidden);
}
/**
 * hides the inlineBtnsDiv by setting its zIndex to -1
 */
function hideInlineButtonsDiv() {
    inlineBtnsDiv.dataset.status = "inlineButtons";
    inlineBtnsDiv.innerHTML = "";
    inlineBtnsDiv.classList.add(hidden);
}
function showSettingsPanel() {
    showInlineBtnsDiv("settingsPanel", true);
    let btn;
    //Show current version
    //Show InstallPWA button//We are not calling it any more
    function installPWA() {
        btn = createBtn("button", "button", "settingsBtn", "Install PWA", inlineBtnsDiv, "InstallPWA", undefined, undefined, undefined, undefined, {
            event: "click",
            fun: async () => {
                // Initialize deferredPrompt for use later to show browser install prompt.
                let deferredPrompt;
                window.addEventListener("beforeinstallprompt", (e) => {
                    // Prevent the mini-infobar from appearing on mobile
                    e.preventDefault();
                    // Stash the event so it can be triggered later.
                    deferredPrompt = e;
                });
                // Update UI notify the user they can install the PWA
                (async () => {
                    window.dispatchEvent(new Event("beforeinstallprompt"));
                    deferredPrompt.prompt;
                    // Optionally, send analytics event that PWA install promo was shown.
                    console.log(`'beforeinstallprompt' event was fired.`);
                    // Wait for the user to respond to the prompt
                    const { outcome } = await deferredPrompt.userChoice;
                    // Optionally, send analytics event with outcome of user choice
                    console.log(`User response to the install prompt: ${outcome}`);
                    // We've used the prompt, and can't use it again, throw it away
                    deferredPrompt = null;
                })();
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
            },
        });
    }
    ;
    //Appending date picker
    (function showDatePicker() {
        let datePicker = createBtn("input", undefined, undefined, undefined, inlineBtnsDiv, "datePicker", undefined, "date", undefined, undefined, {
            event: "change",
            fun: () => changeDate(new Date(datePicker.value.toString())),
        });
        datePicker.setAttribute("value", todayDate.toString());
        datePicker.setAttribute("min", "1900-01-01");
    })();
    //Appending 'Next Coptic Day' button
    (async function showNextCopticDayButton() {
        let container = document.createElement("div");
        (container.style.display = "grid"),
            (container.style.gridTemplateColumns = String("50%").repeat(2));
        inlineBtnsDiv.appendChild(container);
        btn = createBtn("button", "button", "settingsBtn", "Next Coptic Day", container, "nextDay", undefined, "submit", undefined, undefined, { event: "click", fun: () => changeDate(undefined, true, 1) });
        btn.style.backgroundColor = "saddlebrown";
        btn = createBtn("button", "button", "settingsBtn", "Previous Coptic Day", container, "previousDay", undefined, "submit", undefined, undefined, { event: "click", fun: () => changeDate(undefined, false, 1) });
        btn.style.backgroundColor = "saddlebrown";
    })();
    let langsContainer = document.createElement("div");
    langsContainer.id = "langsContainer";
    langsContainer.style.display = "grid";
    langsContainer.id = "langsContainer";
    langsContainer.style.justifyItems = "center";
    langsContainer.style.justifySelf = "center";
    inlineBtnsDiv.appendChild(langsContainer);
    /*showing the select languages buttons*/
    /* showAddOrRemoveLanguagesBtns({
       langsOptions: allLanguages.filter(lang => lang !== 'COP' && lang !== 'CA'),
       storagedLangs: localStorage.defaultLanguages,
       fun: () => {
         modifyDefaultAndForeignLanguages();
       }
     });*/
    /*adding the select defaultLanguage and defaultForeignLanguage buttons*/
    showAddOrRemoveLanguagesBtns({
        langsOptions: allLanguages,
        storagedLangs: localStorage.userLanguages,
        fun: (lang) => {
            modifyUserLanguages(lang);
        }
    });
    //Appending Add or Remove language Buttons
    async function showAddOrRemoveLanguagesBtns(params) {
        let parsedLanguages = JSON.parse(params.storagedLangs);
        let subContainer = document.createElement("div");
        subContainer.style.display = "grid";
        subContainer.style.gridTemplateColumns = String("30% ").repeat(3);
        subContainer.style.justifyItems = "center";
        langsContainer.appendChild(subContainer);
        let newBtn;
        params.langsOptions
            .map((lang) => {
            newBtn = createBtn("button", "button", "settingsBtn", lang, subContainer, "userLang", lang, undefined, undefined, undefined, {
                event: "click",
                fun: () => {
                    params.fun(lang);
                    newBtn.classList.toggle("langBtnAdd");
                    //We retrieve again the displayed text/prayers by recalling the last button clicked
                    if (containerDiv.children) {
                        //Only if a text is already displayed
                        showChildButtonsOrPrayers(lastClickedButton);
                        showSettingsPanel(); //we display the settings pannel again
                    }
                },
            });
            if (parsedLanguages.indexOf(lang) < 0) {
                //The language of the button is absent from userLanguages[], we will give the button the class 'langBtnAdd'
                newBtn.classList.add("langBtnAdd");
            }
        });
    }
    ;
    (async function showExcludeActorButon() {
        let actorsContainer = document.createElement("div");
        actorsContainer.style.display = "grid";
        actorsContainer.style.gridTemplateColumns = String("50%").repeat(2);
        inlineBtnsDiv.appendChild(actorsContainer);
        actors.map((actor) => {
            if (actor.EN === "CommentText")
                return; //we will not show a button for 'CommentText' class, it will be handled by the 'Comment' button
            let show = JSON.parse(localStorage.getItem("showActors")).filter(el => el[0].AR === actor.AR)[0][1];
            btn = createBtn("button", "button", "settingsBtn", actor[foreingLanguage], actorsContainer, actor.EN, actor.EN, undefined, undefined, undefined, {
                event: "click",
                fun: () => {
                    show = !show;
                    showActors.filter(el => el[0].EN === actor.EN)[0][1] = show;
                    btn.classList.toggle("langBtnAdd");
                    //changing the background color of the button to red by adding 'langBtnAdd' as a class
                    if (actor.EN === "Comments") {
                        showActors.filter(el => el[0].EN === "CommentText")[0][1] = show;
                    } //setting the value of 'CommentText' same as 'Comment'
                    localStorage.showActors = JSON.stringify(showActors); //adding the new values to local storage
                    if (containerDiv.children) {
                        //Only if some prayers text is already displayed
                        showChildButtonsOrPrayers(lastClickedButton); //we re-click the last button to refresh the displayed text by adding or removing the actor according to the new setings chice made by the user.
                        showSettingsPanel(); //we display the settings pannel again
                    }
                },
            });
            if (show === false) {
                btn.classList.add("langBtnAdd");
            }
        });
    })();
    (async function showDisplayModeBtns() {
        let displayContainer = document.createElement("div");
        displayContainer.style.display = "grid";
        displayContainer.style.gridTemplateColumns = String((100 / 3).toString() + "%").repeat(3);
        inlineBtnsDiv.appendChild(displayContainer);
        displayModes
            .map((mode) => {
            btn = createBtn("button", "button", "settingsBtn", mode + " Display Mode", displayContainer, mode, undefined, undefined, undefined, undefined, {
                event: "click",
                fun: () => {
                    if (localStorage.displayMode !== mode) {
                        localStorage.displayMode = mode;
                        Array.from(displayContainer.children).map((btn) => {
                            btn.id !== localStorage.displayMode
                                ? btn.classList.add("langBtnAdd")
                                : btn.classList.remove("langBtnAdd");
                        });
                    }
                },
            });
            if (mode !== localStorage.displayMode) {
                btn.classList.add("langBtnAdd");
            }
        });
    })();
    (async function showEditingModeBtn() {
        if (localStorage.editingMode != 'true')
            return;
        let displayContainer = document.createElement("div");
        displayContainer.style.display = "grid";
        displayContainer.style.gridTemplateColumns = String((100 / 3).toString() + "%").repeat(3);
        inlineBtnsDiv.appendChild(displayContainer);
        btn = createBtn("button", "button", "settingsBtn", "Editing Mode", displayContainer, 'editingMode' + localStorage.editingMode.toString(), undefined, undefined, undefined, undefined, {
            event: "click",
            fun: () => {
                //@ts-ignore
                if (!console.save)
                    addConsoleSaveMethod(console); //We are adding a save method to the console object
                containerDiv.innerHTML = '';
                let editable = [
                    'Choose from the list',
                    'NewTable',
                    'Fun("arrayName", "Table\'s Title")',
                    'testEditingArray',
                    'PrayersArray',
                    'ReadingsArrays.GospelDawnArray',
                    'ReadingsArrays.GospelMassArray',
                    'ReadingsArrays.GospelNightArray',
                    'ReadingsArrays.GospelVespersArray',
                    'ReadingsArrays.KatholikonArray',
                    'ReadingsArrays.PraxisArray',
                    'ReadingsArrays.PropheciesDawnArray',
                    'ReadingsArrays.StPaulArray',
                    'ReadingsArrays.SynaxariumArray'
                ];
                let select = document.createElement('select'), option;
                select.style.backgroundColor = 'ivory';
                select.style.height = "16pt";
                editable.forEach(name => {
                    option = document.createElement('option');
                    option.innerText = name;
                    option.contentEditable = 'true';
                    select.add(option);
                });
                document.getElementById('homeImg').insertAdjacentElement('afterend', select);
                hideInlineButtonsDiv();
                select.addEventListener('change', () => editTablesArray({ select: select }));
            }
        });
    })();
    function createBtn(tag, role = tag, btnClass, innerText, parent, id, lang, type, size, backgroundColor, onClick) {
        let btn = document.createElement(tag);
        if (role) {
            btn.role = role;
        }
        if (innerText) {
            btn.innerHTML = innerText;
        }
        if (btnClass) {
            btn.classList.add(btnClass);
        }
        if (id) {
            btn.id = id;
        }
        if (lang) {
            btn.lang = lang.toLowerCase();
        }
        if (type && btn.nodeType) {
            //@ts-ignore
            btn.type = type;
        }
        if (size) {
            //@ts-ignore
            btn.size = size;
        }
        if (backgroundColor) {
            btn.style.backgroundColor = backgroundColor;
        }
        if (onClick) {
            btn.addEventListener(onClick.event, (e) => {
                e.preventDefault;
                onClick.fun();
            });
        }
        if (parent) {
            parent.appendChild(btn);
        }
        return btn;
    }
    //Appending colors keys for actors
    (async function addActorsKeys() {
        let container = document.createElement("div");
        container.id = "actors";
        container.style.display = "grid";
        container.style.gridTemplateColumns = String("33% ").repeat(3);
        inlineBtnsDiv.appendChild(container);
        actors.map((actor) => {
            let newBtn = createBtn("button", undefined, "colorbtn", undefined, container, actor.EN + 'Color');
            for (let i = 1; i < 4; i++) {
                let p = document.createElement("p");
                p.innerText = actor[Object.keys(actor)[i]];
                newBtn.appendChild(p);
            }
        });
    })();
    closeSideBar(leftSideBar);
}
/**
 * Loops the tables (i.e., the string[][]) of a string[][][] and, for each row (string[]) of each table, it inserts a div adjacent to an html child element to containerDiv
 * @param {string[][][]} tables - an array of arrays, each array represents a table in the Word document from which the text was retrieved
 * @param {string[]} languages - the languages in which the text is available. This is usually the "languages" properety of the button who calls the function
 * @param {{beforeOrAfter:InsertPosition, el: HTMLElement}} position - the position at which the prayers will be inserted, adjacent to an html element (el) in the containerDiv
 * @returns {HTMLElement[]} - an array of all the html div elements created and appended to the containerDiv
 */
function insertPrayersAdjacentToExistingElement(tables, languages, position) {
    if (!tables)
        return;
    return tables
        .map(table => {
        if (!table || table.length === 0)
            return;
        table
            .map(row => {
            return createHtmlElementForPrayer({
                tblRow: row,
                languagesArray: languages,
                position: position
            });
        });
    });
}
/**
 * Inserts buttons each of which redirects to a specific part in a given mass

 * @param {Button[]} btns - an array of Button elements for each of which an html element will be created by createBtn() and appended to a newly created div. Each of the html buttons created will, when clicked
 * @param {InsertPosition} position - the position at which the div containing the created html elements for each button, will be inserted compared to the containerDiv child retrieved using the querySelector parameter
 * @param {string} btnsContainerID - the id of the div container to which the html buttons will be appended. This id may be needed to select the div after redirection
 */
async function insertRedirectionButtons(btns, position, btnsContainerID) {
    if (!position.beforeOrAfter)
        position.beforeOrAfter = "beforebegin";
    let div = document.createElement("div");
    div.id = btnsContainerID;
    div.classList.add("inlineBtns");
    div.style.gridTemplateColumns = ((100 / btns.length).toString() + "% ").repeat(btns.length);
    btns.map((b) => div.appendChild(createBtn(b, div, b.cssClass)));
    position.el.insertAdjacentElement(position.beforeOrAfter, div);
}
/**Was meant to fetch the Arabic Synaxarium text but didn't work for CORS issue on the api */
async function fetchSynaxarium() {
    let date = "1_9";
    let url = "https://www.copticchurch.net/synaxarium/" + `${date}` + ".html?lang=ar";
    let response = await fetch("http://katamars.avabishoy.com/api/Katamars/GetSynaxariumStory?id=1&synaxariumSourceId=1", {
        headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7",
            "cache-control": "no-cache",
            pragma: "no-cache",
        },
        referrer: "http://katamars.avabishoy.com/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "omit",
    });
    console.log(response);
}
/**
 * Just trying to figger out if there is a way to prompt the user for installing the app without waiting for the browser to spontaneously trigger the 'beforeinstallprompt' event
 */
function playingWithInstalation() {
    let beforeInstallFired;
    window.addEventListener("beforeinstallpromt", (e) => {
        e.preventDefault;
        beforeInstallFired = e;
        alert("beforeinstall fired");
    });
    //
    let btn = document.createElement("button");
    //@ts-ignore
    let before = new BeforeInstallPromptEvent("beforeInstallPrompt");
    btn.addEventListener("click", () => {
        before.trigger();
        before.prompt().then((r) => console.log("response = ", r));
        console.log(before.userChoice);
    });
    window.addEventListener(before, () => btn.click());
    //btn.click();
    alert("swipe right or click on the image to open the menu and start");
}
async function populatePrayersArrays() {
    //We are populating subset arrays of PrayersArray in order to speed up the parsing of the prayers when the button is clicked
    PrayersArray
        .map((table) => {
        //each element in PrayersArray represents a table in the Word document from which the text of the prayers was retrieved
        if (table[0][0].startsWith(Prefix.commonPrayer)) {
            PrayersArrays.CommonPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.massStBasil)) {
            PrayersArrays.MassStBasilPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.massCommon)) {
            PrayersArrays.MassCommonPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.massStGregory)) {
            PrayersArrays.MassStGregoryPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.massStCyril)) {
            PrayersArrays.MassStCyrilPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.massStJohn)) {
            PrayersArrays.MassStJohnPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.fractionPrayer)) {
            PrayersArrays.FractionsPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.doxologies)) {
            PrayersArrays.DoxologiesPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.commonIncense)) {
            PrayersArrays.IncensePrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.incenseDawn)) {
            PrayersArrays.IncensePrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.incenseVespers)) {
            PrayersArrays.IncensePrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.communion)) {
            PrayersArrays.CommunionPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.psalmResponse)) {
            PrayersArrays.PsalmAndGospelPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.gospelResponse)) {
            PrayersArrays.PsalmAndGospelPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.cymbalVerses)) {
            PrayersArrays.CymbalVersesPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.praxisResponse)) {
            PrayersArrays.PraxisResponsesPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.HolyWeek)) {
            PrayersArrays.holyWeekPrayersArray.push(table);
        }
        else if (table[0][0].startsWith(Prefix.bookOfHours)) {
            PrayersArrays.bookOfHoursPrayersArray.push(table);
            if (table[0][0].includes('1stHour')) {
                bookOfHours.DawnPrayersArray.push(table);
            }
            else if (table[0][0].includes('3rdHour')) {
                bookOfHours.ThirdHourPrayersArray.push(table);
            }
            else if (table[0][0].includes('6thHour')) {
                bookOfHours.SixthHourPrayersArray.push(table);
            }
            else if (table[0][0].includes('9thHour')) {
                bookOfHours.NinethHourPrayersArray.push(table);
            }
            else if (table[0][0].includes('11thHour')) {
                bookOfHours.EleventhHourPrayersArray.push(table);
            }
            else if (table[0][0].includes('12thHour')) {
                bookOfHours.TwelvethHourPrayersArray.push(table);
            }
        }
    });
}
/**
 * Returns the string[] resulting from title.split('&C=')
 * @param {string} title - the string that we need to split
 */
function splitTitle(title) {
    if (!title)
        return [];
    if (!title.includes('&C='))
        return [title, ''];
    return title.split('&C=');
}
/**
 * This function generates a string[][][] from the string[][] generated by Word VBA for the readings
 */
function generateFixedReadingArray(readingArray) {
    let unique = [], title, table, result = [];
    readingArray.forEach((row) => {
        title = splitTitle(row[0])[0];
        if (unique.indexOf(title) < 0) {
            unique.push(title);
        }
    });
    unique.forEach((title) => {
        table = [];
        readingArray.forEach((row) => {
            if (splitTitle(row[0])[0] === title) {
                table.push(row);
            }
        });
        result.push(table);
    });
    return result;
}
/**
 * Returns a string representing the query selector for a div element having a data-root attribute equal to root
 * @param {string} root - the data-root value we want to build a query selector for retrieving the elements with the same value
 * @param {boolean} isLike - if set to true, the function will return a query selector for an element having a data-root containing the root argument (as opposed to a root exactly matching the root argument)
 * @returns
 */
function getDataRootSelector(root, isLike = false, htmlTag = 'div') {
    if (isLike)
        return htmlTag + '[data-root*="' + root + '"]';
    else
        return htmlTag + '[data-root="' + root + '"]';
}
/**
 * Replaces the musical eight note sign with a span that allows to give it a class and hence give it a color
 * @param {number} code - the Char code of the eigth note (or any other character that we want to replace with a span with the same css class)
 * @returns
 */
async function replaceMusicalNoteSign(container) {
    if (!container)
        container = Array.from(containerDiv.querySelectorAll('p.Diacon'));
    if (container.length === 0)
        return;
    let notes = [String.fromCharCode(eighthNoteCode), String.fromCharCode(beamedEighthNoteCode)];
    notes
        .forEach(note => {
        container
            .forEach((p) => {
            if (!p.innerText.includes(note))
                return;
            p.innerHTML = p.innerHTML.replaceAll(note, '<span class="musicalNote">' + note + '</span>');
        });
    });
}
/**
 * Converts an group of html div elements each representing a row in the same table (i.e., the group of divs reprsents the entire table), into a string[][] each element represents a row of the table, and each element of each row, represents the text in a given cell of this row
 * @param {HTMLDivElement} htmlRows - the group of html div elements displayed as children of containerDiv, each representing a row of a table, and collectively representing the entire table
 *@returns {string[][]} - an array representing the entire table where each element represents a row of the table (i.e., corresponding to a div element)
 */
function convertHtmlDivElementsIntoArrayTable(htmlRows) {
    let table = [];
    htmlRows
        .forEach((row) => {
        if (!row.title)
            return alert('the row dosen\'t have title');
        table
            .push(Array.from(row.children)
            .map((p) => p.innerText));
        table[table.length - 1].unshift(row.title);
    });
    return table;
}
;
//compareArrays(ReadingsArrays.SynaxariumArray, SynaxariumArray2);
function compareArrays(sourceArray, editedArray) {
    let table, tblRow;
    for (let i = 0; i < sourceArray.length; i++) {
        table = sourceArray[i];
        for (let row = 0; row < table.length; row++) {
            tblRow = table[row];
            for (let text = 0; text < tblRow.length; text++)
                if (tblRow[text] !== editedArray[i][row][text]) {
                    console.log('different rows: \n', sourceArray[i][row][text], '\n\n', editedArray[i][row][text], '\n\n');
                }
        }
        ;
        if (sourceArray[i][0][0] !== editedArray[i][0][0]) {
            console.log('Original = ', sourceArray[i], ' and new = ', editedArray);
        }
        else {
            console.log('SameTitle');
        }
    }
    if (sourceArray.length !== editedArray.length) {
        console.log('sourceArray length = ', sourceArray.length, ' editedArray length = ', editedArray.length);
    }
    else {
        console.log('source Array length = edited Array length = ', sourceArray.length);
    }
    ;
}
function removeDuplicates(array) {
    array
        .map(tbl => {
        array
            .forEach(t => {
            if (array.indexOf(t) !== array.indexOf(tbl)
                && t[0][0] === tbl[0][0]
                && t.length === tbl.length) {
                console.log('first table = ', tbl, ' and duplicate = ', t);
            }
            else
                console.log(t[0][0]);
        });
    });
}
function makeExpandableButtonContainerFloatOnTop(btnContainer, top) {
    btnContainer.style.position = 'fixed';
    btnContainer.style.top = top;
    btnContainer.style.justifySelf = 'center';
}
;
function checkIfTitle(htmlRow) {
    if (htmlRow.classList.contains('Title')
        || htmlRow.classList.contains('SubTitle'))
        return true;
    else
        return false;
}
;
/**
 * Hides all the titles shortcuts for the the html div elements included in the container, from the right side bar
 * @param {HTMLElement} container - the html element containing the title divs which we want to hide their titles shortcuts from the right side Bar
 */
function hideOrShowAllTitlesInAContainer(container, hide = true) {
    //We hide all the titles from the right side Bar
    Array.from(container.children)
        .filter((child) => checkIfTitle(child))
        .forEach(child => hideOrShowTitle(child, hide));
}
;
/**
 * Hides a title shortcut from the right side bar based on the id of the html element passed to it
 * @param {HTMLElement} htmlTitle - the html element for which we want to hide the shortcut title in the side bar
 */
function hideOrShowTitle(htmlTitle, hide) {
    let titles = Array.from(sideBarTitlesContainer.children), title;
    title =
        titles
            .filter((title) => title.dataset.group === htmlTitle.id)[0];
    if (!title)
        return;
    if (hide && !title.classList.contains(hidden))
        title.classList.add(hidden);
    if (!hide && title.classList.contains(hidden))
        title.classList.remove(hidden);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxtQkFBbUIsR0FBZSxzQkFBc0IsRUFBRSxDQUFDO0FBR2pFOzs7R0FHRztBQUNILFNBQVMsbUJBQW1CLENBQUMsRUFBZTtJQUMxQyxJQUFJLElBQVksQ0FBQztJQUNqQixJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztJQUNmLHVGQUF1RjtJQUN2RixJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDcEMsK0NBQStDO1FBQy9DLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDN0Q7YUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUM5RCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVEO2FBQU07WUFDTCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdEQ7UUFDRCxFQUFFLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0RDtTQUFNLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUM3Qyxn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QUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztLQUNqQixDQUFDO0FBQ0osQ0FBQztB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LENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNwRCxhQUFhLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xEO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN2RCxhQUFhLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3JEO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNyRCxhQUFhLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ25EO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNwRCxhQUFhLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xEO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN4RCxhQUFhLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pEO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNwRCxhQUFhLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xEO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN2RCxhQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9DO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNyRCxhQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9DO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN4RCxhQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9DO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNuRCxhQUFhLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pEO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN2RCxhQUFhLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3REO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN4RCxhQUFhLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3REO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN0RCxhQUFhLENBQUMs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