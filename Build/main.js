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
    setCSSGridTemplate(Array.from(container.querySelectorAll('div.Row'))); //setting the number and width of the columns for each html element with class 'Row'
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
    if (btn.parentBtn && btn.btnID === btnGoBack.btnID) {
        //showChildButtonsOrPrayers(btn.parentBtn);
    }
    if (btn.docFragment)
        containerDiv.appendChild(btn.docFragment);
    //If at the end no prayers are displayed in containerDiv, we will show the children of btnMain in containerDiv
    if (btn.btnID !== btnMain.btnID
        && containerDiv.children.length > 0
        && containerDiv.children[0].classList.contains('mainPageBtns'))
        btnMain.onClick();
}
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
async function createGoBackBtn(goTo, btnsDiv, cssClass, bookmarkID) {
    //We will create a 'Go Back' and will append it to btnsDiv
    let goBak = new Button({
        btnID: btnGoBack.btnID,
        label: btnGoBack.label,
        cssClass: cssClass,
        onClick: () => {
            //When the goBack button is clicked, it will show the children Buttons of goTo. It will not show its prayers or any other thing
            btnsDiv.innerHTML = '';
            if (goTo.children)
                goTo.children.forEach(childBtn => { createBtn(childBtn, btnsDiv, childBtn.cssClass, true); });
            if (goTo.parentBtn)
                createGoBackBtn(goTo.parentBtn, btnsDiv, goTo.parentBtn.cssClass);
            //showChildButtonsOrPrayers(goTo);
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
    let btnText = String.fromCharCode(9776) + "Close Sidebar";
    let closeBtn = sideBar.querySelector('.closebtn');
    sideBar.classList.remove(hidden);
    sideBarBtn.innerText = btnText;
    sideBarBtn.removeEventListener("click", (ev) => {
        ev.preventDefault;
        openSideBar(sideBar);
    });
    sideBarBtn.addEventListener("click", (ev) => {
        ev.preventDefault;
        closeSideBar(sideBar);
    });
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
    //let btnText: string = String.fromCharCode(9776) + "Open Sidebar";
    //sideBar.classList.remove("extended");
    sideBar.classList.add(hidden);
    //sideBarBtn.innerText = btnText;
    sideBarBtn.removeEventListener("click", (ev) => {
        ev.preventDefault;
        closeSideBar(sideBar);
    });
    sideBarBtn.addEventListener("click", (ev) => {
        ev.preventDefault;
        openSideBar(sideBar);
    });
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
async function setCSSGridTemplate(htmlRows) {
    if (!htmlRows)
        return;
    if (localStorage.displayMode === displayModes[1])
        return;
    if (!htmlRows)
        return;
    let plusSign = String.fromCharCode(plusCharCode), minusSign = String.fromCharCode(plusCharCode + 1);
    htmlRows.forEach((row) => {
        //Setting the number of columns and their width for each element having the 'Row' class for each Display Mode
        row.style.gridTemplateColumns = getColumnsNumberAndWidth(row);
        //Defining grid areas for each language in order to be able to control the order in which the languages are displayed (Arabic always on the last column from left to right, and Coptic on the first column from left to right)
        row.style.gridTemplateAreas = setGridAreas(row);
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
            showInlineBtns(masterBtnID, true);
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
                        setCSSGridTemplate(table);
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
function showInlineBtns(status, clear = false) {
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
        close.style.fontSize = "30pt";
        close.style.fontWeight = "bold";
        close.addEventListener("click", (e) => {
            e.preventDefault;
            hideInlineButtonsDiv();
        });
        inlineBtnsDiv.appendChild(close);
    })();
    inlineBtnsDiv.dataset.status = status; //giving the inlineBtnsDiv a data-status attribute
    inlineBtnsDiv.style.display = 'grid';
}
/**
 * hides the inlineBtnsDiv by setting its zIndex to -1
 */
function hideInlineButtonsDiv() {
    inlineBtnsDiv.dataset.status = "inlineButtons";
    inlineBtnsDiv.innerHTML = "";
    inlineBtnsDiv.style.display = 'none';
}
function showSettingsPanel() {
    showInlineBtns("settingsPanel", true);
    let btn;
    //Show current version
    if (!inlineBtnsDiv.querySelector('#dateDiv'))
        //inlineBtnsDiv.appendChild(document.getElementById('#dateDiv').cloneNode()) as HTMLElement;
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
    //Appending Add or Remove language Buttons
    (async function showAddOrRemoveLanguagesBtns() {
        let parsedUserLanguages = JSON.parse(localStorage.userLanguages);
        let subContainer = document.createElement("div");
        subContainer.style.display = "grid";
        subContainer.style.gridTemplateColumns = String("30% ").repeat(3);
        subContainer.style.justifyItems = "center";
        langsContainer.appendChild(subContainer);
        allLanguages.map((lang) => {
            let newBtn = createBtn("button", "button", "settingsBtn", lang, subContainer, "userLang", lang, undefined, undefined, undefined, {
                event: "click",
                fun: () => {
                    modifyUserLanguages(lang);
                    newBtn.classList.toggle("langBtnAdd");
                    //We retrieve again the displayed text/prayers by recalling the last button clicked
                    if (containerDiv.children) {
                        //Only if a text is already displayed
                        showChildButtonsOrPrayers(lastClickedButton);
                        showSettingsPanel(); //we display the settings pannel again
                    }
                },
            });
            if (parsedUserLanguages.indexOf(lang) < 0) {
                //The language of the button is absent from userLanguages[], we will give the button the class 'langBtnAdd'
                newBtn.classList.add("langBtnAdd");
            }
        });
    })();
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
                select.addEventListener('change', () => editTablesArray(select));
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
        .map((wordTable) => {
        //each element in PrayersArray represents a table in the Word document from which the text of the prayers was retrieved
        if (wordTable[0][0].startsWith(Prefix.commonPrayer)) {
            PrayersArrays.CommonPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massStBasil)) {
            PrayersArrays.MassStBasilPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massCommon)) {
            PrayersArrays.MassCommonPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massStGregory)) {
            PrayersArrays.MassStGregoryPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massStCyril)) {
            PrayersArrays.MassStCyrilPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massStJohn)) {
            PrayersArrays.MassStJohnPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.fractionPrayer)) {
            PrayersArrays.FractionsPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.doxologies)) {
            PrayersArrays.DoxologiesPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.commonIncense)) {
            PrayersArrays.IncensePrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.incenseDawn)) {
            PrayersArrays.IncensePrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.incenseVespers)) {
            PrayersArrays.IncensePrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.communion)) {
            PrayersArrays.CommunionPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.psalmResponse)) {
            PrayersArrays.PsalmAndGospelPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.gospelResponse)) {
            PrayersArrays.PsalmAndGospelPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.cymbalVerses)) {
            PrayersArrays.CymbalVersesPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.praxisResponse)) {
            PrayersArrays.PraxisResponsesPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.bookOfHours)) {
            PrayersArrays.bookOfHoursPrayersArray.push(wordTable);
            if (wordTable[0][0].includes('1stHour')) {
                bookOfHours.DawnPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].includes('3rdHour')) {
                bookOfHours.ThirdHourPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].includes('6thHour')) {
                bookOfHours.SixthHourPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].includes('9thHour')) {
                bookOfHours.NinethHourPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].includes('11thHour')) {
                bookOfHours.EleventhHourPrayersArray.push(wordTable);
            }
            else if (wordTable[0][0].includes('12thHour')) {
                bookOfHours.TwelvethHourPrayersArray.push(wordTable);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxtQkFBbUIsR0FBZSxzQkFBc0IsRUFBRSxDQUFDO0FBR2pFOzs7R0FHRztBQUNILFNBQVMsbUJBQW1CLENBQUMsRUFBZTtJQUMxQyxJQUFJLElBQVksQ0FBQztJQUNqQixJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztJQUNmLHVGQUF1RjtJQUN2RixJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDcEMsK0NBQStDO1FBQy9DLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDN0Q7YUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUM5RCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVEO2FBQU07WUFDTCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdEQ7UUFDRCxFQUFFLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0RDtTQUFNLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUM3Qyxn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Q0FBQyxLQUFLLENBQUMsNEJBQTRCLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDcEQ7U0FDRjtJQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHNCQUFzQjtJQUM3QixPQUFPO1FBQ0wsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxF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QWEsQ0FBQyxFQUFFO1lBQzNELGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDekQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3pELGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdkQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdEQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQzVELGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDckQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdEQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzNELGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbkQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3pELGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbkQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQzVELGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbkQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZELGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDckQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzNELGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQzVELGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUQ7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzFELGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDeEQ7YUFBSyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQzNELGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0Q7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