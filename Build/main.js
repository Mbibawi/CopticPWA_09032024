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
            console.log(userLanguages);
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
        let selectedDate = new Date();
        selectedDate.setTime(Number(localStorage.selectedDate));
        if (!checkIfDateIsToday(selectedDate))
            setCopticDates(selectedDate);
    }
    else {
        setCopticDates();
    }
    /*document.getElementsByTagName('body')[0].requestFullscreen();
      screen.orientation.lock("portrait-secondary").catch(error => alert(error));*/
    //alert(screen.orientation.type.toString())
}
;
/**
 * @param {string[]} tblRow - an array of the text of the prayer which id matched the id in the idsArray. The first element in this array is the id of the prayer. The other elements are, each, the text in a given language. The prayers array is hence structured like this : ['prayerID', 'prayer text in Arabic', 'prayer text in French', 'prayer text in Coptic']
 * @param {string[]} languagesArray - the languages available for this prayer. The button itself provides this array from its "Languages" property
 * @param {string[]} userLanguages - a globally declared array of the languages that the user wants to show.
 * @param {string} actorClass - a CSS class that will be given to the html element (a div) in which the text of the table row. This class sets the background color of the div according to who is saying the prayer: is it the Priest, the Diacon, or the Assembly?
 */
function createHtmlElementForPrayer(tblRow, languagesArray, userLanguages, position, actorClass) {
    //@ts-ignore
    if (!tblRow)
        return console.log('No tblRow argument is provided to createHtmlElementForPrayer() ');
    if (!actorClass)
        actorClass = tblRow[0].split('&C=')[1];
    if (actorClass) {
        let parsed = JSON
            .parse(localStorage.showActors)
            .filter(el => el[0].EN === actorClass);
        if (parsed.length > 0 && parsed[0][1] === false)
            return; //If had hide an actor, we will stop and return
    }
    ;
    if (!userLanguages)
        userLanguages = JSON.parse(localStorage.userLanguages);
    if (!position)
        position = containerDiv;
    let htmlRow, p, lang, text, titleBase;
    titleBase = baseTitle(tblRow[0]);
    htmlRow = document.createElement("div");
    htmlRow.classList.add("Row"); //we add 'Row' class to this div
    htmlRow.classList.add("DisplayMode" + localStorage.displayMode); //we add the displayMode class to this div
    htmlRow.dataset.root = titleBase.replace(/Part\d+/, "");
    if (actorClass && !actorClass.includes('Title')) {
        // we don't add the actorClass if it is "Title", because in this case we add a specific class called "TitleRow" (see below)
        htmlRow.classList.add(actorClass);
    }
    else if (actorClass
        && actorClass.includes('Title')) {
        htmlRow.addEventListener("click", (e) => {
            e.preventDefault;
            collapseText(htmlRow);
        }); //we also add a 'click' eventListener to the 'TitleRow' elements
    }
    //looping the elements containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
    for (let x = 1; x < tblRow.length; x++) {
        //x starts from 1 because prayers[0] is the id
        if (!tblRow[x] || tblRow[x] === ' ')
            continue; //we escape the empty strings if the text is not available in all the button's languages
        if (actorClass &&
            (actorClass === "Comments" || actorClass === "CommentText")) {
            //this means it is a comment
            x === 1 ? (lang = languagesArray[1]) : (lang = languagesArray[3]);
        }
        else {
            lang = languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
        } //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
        if (userLanguages.indexOf(lang) > -1) {
            p = document.createElement("p"); //we create a new <p></p> element for the text of each language in the 'prayer' array (the 'prayer' array is constructed like ['prayer id', 'text in AR, 'text in FR', ' text in COP', 'text in Language', etc.])
            if (actorClass && actorClass === 'Title') {
                //this means that the 'prayer' array includes the titles of the prayer since its first element ends with '&C=Title'
                htmlRow.classList.add('TitleRow');
                htmlRow.id = tblRow[0];
            }
            else if (actorClass) {
                //if the prayer is a comment like the comments in the Mass
                htmlRow.classList.add(actorClass);
            }
            else {
                //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
                p.classList.add("PrayerText");
            }
            p.dataset.root = htmlRow.dataset.root; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
            text = tblRow[x];
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
        position.el
            ? //@ts-ignore
                position.el.insertAdjacentElement(position.beforeOrAfter, htmlRow)
            : //@ts-ignore
                position.appendChild(htmlRow);
        return htmlRow;
    }
    catch (error) {
        console.log('an error occured: position = ', position, ' and tblRow = ', tblRow);
        console.log(error);
    }
}
/**
 * Shows a bookmark link in the right side bar for each title in the currently displayed prayers
 * @param {NodeListOf<>Element} titlesCollection  - a Node list of all the divs containing the titles of the different sections. Each div will be passed to addTitle() in order to create a link in the right side bar pointing to the div
 * @param {HTMLElement} rightTitlesDiv - the right hand side bar div where the titles will be displayed
 * @param {boolean} clear - indicates whether the side bar where the links will be inserted, must be cleared before insertion
 */
async function showTitlesInRightSideBar(titlesCollection, rightTitlesDiv, clear = true) {
    let titlesArray = [];
    //this function shows the titles in the right side Bar
    if (!rightTitlesDiv)
        rightTitlesDiv = rightSideBar.querySelector("#sideBarBtns");
    if (clear) {
        rightTitlesDiv.innerHTML = "";
    } //we empty the side bar
    let bookmark;
    for (let i = 0; i < titlesCollection.length; i++) {
        titlesCollection[i].id += i.toString(); //we do this in order to give each title a distinctive id in cases where all the titles have the same id
        titlesArray.push(addTitle(titlesCollection[i]));
    }
    /**
     * Adds shortcuts to the diffrent sections by redirecting to the title of the section
     * @param {HTMLElement} titles - a div including paragraphs, each displaying the title of the section in a given langauge
     */
    function addTitle(titles) {
        let text = "", div = document.createElement("div"); //this is just a container
        div.role = "button";
        rightTitlesDiv.appendChild(div);
        bookmark = document.createElement("a");
        div.appendChild(bookmark);
        bookmark.href = "#" + titles.id; //we add a link to the element having as id, the id of the prayer
        div.classList.add("sideTitle");
        div.addEventListener("click", () => closeSideBar(rightSideBar)); //when the user clicks on the div, the rightSideBar is closed
        if (titles.querySelector('.' + defaultLanguage)) {
            //if the titles div has a paragraph child with class="AR", it means this is the paragraph containing the Arabic text of the title
            text += titles
                .querySelector('.' + defaultLanguage)
                //@ts-ignore
                .innerText.split('\n')[0];
        }
        if (titles.querySelector('.' + foreingLanguage)) {
            if (text !== '') {
                text += "\n" + titles.querySelector('.' + foreingLanguage)
                    //@ts-ignore
                    .innerText.split('\n')[0];
            }
            else {
                text += titles.querySelector('.' + foreingLanguage)
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
        return div;
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
function showChildButtonsOrPrayers(btn, clear = true, click = true) {
    if (!btn)
        return;
    let container = containerDiv;
    if (btn.docFragment)
        container = btn.docFragment;
    let btnsDiv = leftSideBar.querySelector("#sideBarBtns");
    hideInlineButtonsDiv();
    if (clear) {
        btnsDiv.innerHTML = "";
        inlineBtnsDiv.innerHTML = "";
    }
    if (btn.onClick && click) {
        btn.onClick();
        if (btn.pursue === false)
            return;
    }
    if (btn.prayersSequence && btn.prayersArray && btn.languages && btn.showPrayers)
        showPrayers(btn, true, true, container);
    if (btn.afterShowPrayers)
        btn.afterShowPrayers();
    //Important ! : setCSSGridTemplate() MUST be called after btn.afterShowPrayres()
    setCSSGridTemplate(container.querySelectorAll(".Row")); //setting the number and width of the columns for each html element with class 'Row'
    applyAmplifiedText(container.querySelectorAll("p[lang]"));
    if (btn.inlineBtns) {
        let newDiv = document.createElement("div");
        newDiv.style.display = "grid";
        btn.inlineBtns.map((b) => {
            if (btn.btnID != btnGoBack.btnID) {
                // for each child button that will be created, we set btn as its parent in case we need to use this property on the button
                b.parentBtn = btn.parentBtn;
            }
            createBtn(b, newDiv, b.cssClass);
        });
        let s = (100 / newDiv.children.length).toString() + "% ";
        newDiv.style.gridTemplateColumns = s.repeat(newDiv.children.length);
        newDiv.classList.add("inlineBtns");
        inlineBtnsDiv.appendChild(newDiv);
    }
    if (btn.children) {
        btn.children.forEach((childBtn) => {
            //for each child button that will be created, we set btn as its parent in case we need to use this property on the button
            if (btn.btnID != btnGoBack.btnID)
                childBtn.parentBtn = btn;
            //We create the html element reprsenting the childBtn and append it to btnsDiv
            createBtn(childBtn, btnsDiv, childBtn.cssClass);
        });
    }
    showTitlesInRightSideBar(container.querySelectorAll("div.TitleRow"));
    if (btn.parentBtn && btn.btnID !== btnGoBack.btnID) {
        //i.e., if the button passed to showChildButtonsOrPrayers() has a parentBtn property and it is not itself a btnGoback (which we check by its btnID property), we wil create a goBack button and append it to the sideBar
        //the goBack Button will only show the children of btn in the sideBar: it will not call showChildButonsOrPrayers() passing btn to it as a parameter. Instead, it will call a function that will show its children in the SideBar
        createGoBackBtn(btn.parentBtn, btnsDiv, btn.cssClass);
        lastClickedButton = btn;
    }
    if (btn.btnID !== btnMain.btnID //The button itself is not btnMain
        && btn.btnID !== btnGoBack.btnID //The button itself is not btnGoBack
        && !btnsDiv.querySelector('#' + btnMain.btnID) //No btnMain is displayed in the sideBar
    ) {
        createBtn(btnMain, btnsDiv, btnMain.cssClass);
        let image = document.getElementById("homeImg");
        if (image) {
            document.getElementById("homeImg").style.width = "20vmax";
            document.getElementById("homeImg").style.height = "25vmax";
        }
    }
    if (btn.parentBtn && btn.btnID === btnGoBack.btnID) {
        //showChildButtonsOrPrayers(btn.parentBtn);
    }
    if (btn.docFragment)
        containerDiv.appendChild(btn.docFragment);
}
/**
 * Adds the data-group attribute to all all the divs children of the html element passed to it as an argument
 * @param {htmle}  container - the html element container for which we will  add the data-group attribute to each of its div children
 */
async function addDataGroupsToContainerChildren(container, titleClass = 'TitleRow', titleRow) {
    if (titleRow
        && titleRow.classList.contains(titleClass)) {
        let nextSibling = titleRow.nextElementSibling;
        while (nextSibling
            && !nextSibling.classList.contains(titleClass)) {
            nextSibling.dataset.group = titleRow.dataset.root;
            nextSibling = nextSibling.nextElementSibling;
        }
        return;
    }
    ;
    if (!container || !container.children)
        return;
    Array.from(container.children)
        .forEach((child) => { addDataGroupsToContainerChildren(undefined, undefined, child); });
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
        if (!btn.label[lang])
            continue;
        //for each language in btn.text, we create a new "p" element
        let btnLable = document.createElement("p");
        //we edit the p element by adding its innerText (=btn.text[lang], and its class)
        editBtnInnerText(btnLable, btn.label[lang], "btnLable" + lang);
        //we append the "p" element  to the newBtn button
        newBtn.appendChild(btnLable);
    }
    btnsBar.appendChild(newBtn);
    //If no onClick parameter/argument is passed to createBtn(), and the btn has any of the following properties: children/prayers/onClick or inlinBtns, we set the onClick parameter to a function passing the btn to showChildButtonsOrPrayers
    if (!onClick && (btn.children || btn.prayersSequence || btn.onClick || btn.inlineBtns))
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
    if (leftSideBar.classList.contains("extended") &&
        rightSideBar.classList.contains("collapsed")) {
        closeSideBar(leftSideBar);
    }
    else if (rightSideBar.classList.contains("extended") &&
        leftSideBar.classList.contains("collapsed")) {
        closeSideBar(rightSideBar);
    }
    else if (leftSideBar.classList.contains("collapsed") &&
        leftSideBar.classList.contains("collapsed")) {
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
    let width = "40%";
    if (sideBar === rightSideBar) {
        closeBtn.style.left = '10px';
        width = '50%';
    }
    ;
    sideBar.style.width = width;
    sideBar.classList.remove("collapsed");
    sideBar.classList.add("extended");
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
    let width = "0px";
    sideBar.style.width = width;
    sideBar.classList.remove("extended");
    sideBar.classList.add("collapsed");
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
            console.log('xDiff = ', xDiff, 'yDiff = ', yDiff);
            /*most significant*/
            if (xDiff > 10) {
                /* right to left swipe */
                console.log('xDiff = ', xDiff);
                if (leftSideBar.classList.contains("extended") &&
                    rightSideBar.classList.contains("collapsed")) {
                    closeSideBar(leftSideBar);
                }
                else if (rightSideBar.classList.contains("collapsed") &&
                    leftSideBar.classList.contains("collapsed")) {
                    openSideBar(rightSideBar);
                }
            }
            else if (xDiff < -10) {
                /* left to right swipe */
                console.log('xDiff = ', xDiff);
                if (leftSideBar.classList.contains("collapsed") &&
                    rightSideBar.classList.contains("collapsed")) {
                    openSideBar(leftSideBar);
                }
                else if (rightSideBar.classList.contains("extended") &&
                    leftSideBar.classList.contains("collapsed")) {
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
async function showPrayers(btn, clearContent = true, clearRightSideBar = true, position = containerDiv) {
    if (btn.btnID != btnGoBack.btnID && btn.btnID != btnMain.btnID)
        closeSideBar(leftSideBar);
    if (clearContent)
        containerDiv.innerHTML = "";
    if (clearRightSideBar)
        rightSideBar.querySelector("#sideBarBtns").innerHTML = "";
    //this is the right side bar where the titles are displayed for navigation purposes
    btn.prayersSequence.map((p) => {
        if (!p)
            return;
        let date;
        if (p.includes("&D=") || p.includes("&S=")) {
            //if the id of the prayer includes the value '&D=' this tells us that this prayer is either not linked to a specific day in the coptic calendar (&D=), or the date has been set by the button function (e.g.: PrayerGospelResponse&D=GLWeek). In this case, we will not add the copticReadingsDate to the prayerID
            //Similarly, if the id includes '&S=', it tells us that it is not linked to a specific date but to a given period of the year. We also keep the id as is without adding any date to it
            date = "";
        }
        else {
            date = "&D=" + copticReadingsDate; //this is the default case where the date equals the copticReadingsDate. This works for most of the occasions.
        }
        p += date;
        let wordTable = findPrayerInBtnPrayersArray(p, btn);
        if (wordTable) {
            wordTable.map((row) => {
                createHtmlElementForPrayer(row, btn.languages, JSON.parse(localStorage.userLanguages), position); //row[0] is the title of the table modified as the case may be to reflect wether the row contains the titles of the prayer, or who chants the prayer (in such case the words 'Title' or '&C=' + 'Priest', 'Diacon', or 'Assembly' are added to the title)
            });
            return;
        }
    });
}
/**
 * Sets the number of columns and their widths for the provided list of html elements which style display property = 'grid'
 * @param {NodeListOf<Element>} Rows - The html elements for which we will set the css. These are usually the div children of containerDiv
 */
async function setCSSGridTemplate(Rows) {
    if (!Rows)
        return;
    let plusSign = String.fromCharCode(plusCharCode), minusSign = String.fromCharCode(plusCharCode + 1);
    Rows.forEach((row) => {
        //Setting the number of columns and their width for each element having the 'Row' class for each Display Mode
        if (localStorage.displayMode === displayModes[0]) {
            row.style.gridTemplateColumns = getColumnsNumberAndWidth(row);
            //Defining grid areas for each language in order to be able to control the order in which the languages are displayed (Arabic always on the last column from left to right, and Coptic on the first column from left to right)
            row.style.gridTemplateAreas = setGridAreas(row);
        }
        ;
        if (localStorage.displayMode === displayModes[1]) {
            return;
        }
        ;
        if (row.classList.contains('TitleRow')
            || row.classList.contains('SubTitle')) {
            //This is the div where the titles of the prayer are displayed. We will add an 'on click' listner that will collapse the prayers
            row.role = "button";
            let defLangParag = row.querySelector('p[lang="' + defaultLanguage.toLowerCase() + '"]');
            if (!defLangParag)
                defLangParag = row.lastElementChild;
            if (!defLangParag)
                return console.log('no paragraph with lang= ' + defaultLanguage);
            if (!row.dataset.isCollapsed)
                row.dataset.isCollapsed = 'false'; //If row doesn't have data-is-collapsed attribute, we add it and set it to 'false' which means that the title is not collapsed
            if (defLangParag.textContent.includes(plusSign + ' '))
                defLangParag.textContent = defLangParag.textContent.replace(plusSign + ' ', ''); //We remove the + sign in the begining (if it exists)
            if (defLangParag.textContent.includes(minusSign + ' '))
                defLangParag.textContent = defLangParag.textContent.replace(minusSign + ' ', ''); //We remove the minus (-) sign from the begining of the paragraph
            if (row.dataset.isCollapsed === 'true')
                defLangParag.innerText =
                    plusSign + " " + defLangParag.innerText; //We add the plus (+) sign at the begining
            if (row.dataset.isCollapsed === 'false')
                defLangParag.innerText =
                    minusSign + " " + defLangParag.innerText; //We add the minus (-) sig at the begining;
            if (row.classList.contains('TitleRow'))
                addDataGroupsToContainerChildren(undefined, 'TitleRow', row);
            if (row.classList.contains('SubTitle'))
                addDataGroupsToContainerChildren(undefined, 'SubTitle', row);
        }
        else {
            replaceEigthNote(undefined, Array.from(row.querySelectorAll('p')));
        }
        ;
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
async function applyAmplifiedText(container) {
    if (localStorage.displayMode === displayModes[1])
        return;
    new Map(JSON.parse(localStorage.textAmplified)).forEach((value, key) => {
        if (value == true) {
            Array.from(container)
                .filter((el) => el.getAttribute("lang") === String(key).toLowerCase())
                .forEach((el) => {
                el.classList.add("amplifiedText");
                Array.from(el.children)
                    .forEach(child => child.classList.add("amplifiedText"));
            });
        }
    });
}
async function setButtonsPrayers() {
    for (let i = 0; i < btns.length; i++) {
        btnsPrayers.push([btns[i].btnID, ...(await btns[i].onClick())]);
        btns[i].retrieved = true;
    }
    console.log("Buttons prayers were set");
    return btnsPrayers;
}
/**
 * Hides all the nextElementSiblings of the element, if the nextElementSibling classList does not include 'TitleRow'. It does this by toggeling the "display" property of the html elements
 * @param {HTMLElement} element - the html element which nextElementSiblings display property will be toggled between 'none' and 'grid'
 */
function collapseText(titleRow, container = containerDiv) {
    container.querySelectorAll('div[data-group="' + titleRow.dataset.root + '"]')
        .forEach((div) => {
        if (div !== titleRow)
            div.classList.toggle('collapsedTitle');
    });
    togglePlusAndMinusSignsForTitles(titleRow);
}
;
/**
 * Toggels the minus and plus signs in the Title
 * @param {HTMLElement} titleRow - the html element (usually a div with class 'TitleRow') that we wqnt to toggle the minus or plus signs according to whether the text is collapsed or not
 * @returns
 */
async function togglePlusAndMinusSignsForTitles(titleRow, plusCode = plusCharCode) {
    if (!titleRow.children)
        return;
    let parag;
    parag = Array.from(titleRow.children)
        .filter(child => child.textContent.startsWith(String.fromCharCode(plusCode))
        || child.textContent.startsWith(String.fromCharCode(plusCode + 1)))[0];
    if (!parag)
        return;
    if (parag.textContent.includes(String.fromCharCode(plusCode))) {
        titleRow.dataset.isCollapsed = 'false';
        parag.innerText = parag.innerText.replace(String.fromCharCode(plusCode), String.fromCharCode(plusCode + 1));
    }
    else if (parag.textContent.includes(String.fromCharCode(plusCode + 1))) {
        titleRow.dataset.isCollapsed = 'true';
        parag.innerText = parag.innerText.replace(String.fromCharCode(plusCode + 1), String.fromCharCode(plusCode));
    }
}
/**
 * Collapses all the tiltes (i.e. all the divs with class 'TitleRow' or 'SubTitle') in the html element passed as argument
 * @param {HTMLElement} container - the html element in which we will collapse all the divs having as class 'TitleRow' or 'SubTitle'
 */
function collapseAllTitles(container) {
    container.querySelectorAll('div')
        .forEach(row => {
        if (!row.classList.contains('TitleRow')
            && !row.classList.contains('SubTitle')) {
            row.classList.add('collapsedTitle');
        }
        else {
            row.dataset.isCollapsed = 'true';
            togglePlusAndMinusSignsForTitles(row);
        }
    });
}
/**
 *
 * @param {string[][][]} selectedPrayers - An array containing the optional prayers for which we want to display html button elements in order for the user to choose which one to show
 * @param {Button} btn
 * @param {HTMLElement} btnsDiv - The html element in which each prayer will be displayed when the user clicks an inline button representing this prayer
 * @param {Object{AR:string, FR:'string'}} btnLabels - An object containing the labels of the master button that the user will click to show a list of buttons, each representing a prayer in selectedPrayers[]
 * @param {string} masterBtnID - The id of the master button
 */
async function showInlineButtonsForOptionalPrayers(selectedPrayers, btn, masterBtnDiv, btnLabels, masterBtnID) {
    let prayersMasterBtn, next;
    //Creating a new Button to which we will attach as many inlineBtns as there are optional prayers suitable for the day (if it is a feast or if it falls during a Season)
    prayersMasterBtn = new Button({
        btnID: masterBtnID,
        label: btnLabels,
        inlineBtns: await createInlineBtns(),
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
        //We set next to undefined, in case it was created before
        next = undefined;
        //if the number of prayers is > than the groupOfNumber AND the remaining prayers are >0 then we show the next button
        if (prayersMasterBtn.inlineBtns.length > groupOfNumber
            && prayersMasterBtn.inlineBtns.length - startAt > groupOfNumber) {
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
            createBtn(next, inlineBtnsDiv, next.cssClass, false, next.onClick).classList.add("centeredBtn"); //notice that we are appending next to inlineBtnsDiv directly not to newDiv (because newDiv has a display = 'grid' of 3 columns. If we append to it, 'next' button will be placed in the 1st cell of the last row. It will not be centered). Notice also that we are setting the 'clear' argument of createBtn() to false in order to prevent removing the 'Go Back' button when 'next' is passed to showchildButtonsOrPrayers()
        }
        else {
            next = new Button({
                btnID: "btnNext",
                label: { defaultLanguage: "العودة إلى القداس", foreignLanguage: "Retour à la messe" },
                cssClass: inlineBtnClass,
                onClick: () => {
                    //When next is clicked, we remove all the html buttons displayed in newDiv (we empty newDiv)
                    hideInlineButtonsDiv();
                }
            });
            createBtn(next, inlineBtnsDiv, next.cssClass, false, next.onClick).classList.add("centeredBtn"); //notice that we are appending next to inlineBtnsDiv directly not to newDiv (because newDiv has a display = 'grid' of 3 columns. If we append to it, 'next' button will be placed in the 1st cell of the last row. It will not be centered). Notice also that we are setting the 'clear' argument of createBtn() to false in order to prevent removing the 'Go Back' button when 'next' is passed to showchildButtonsOrPrayers()
        }
        for (let n = startAt; n < startAt + groupOfNumber && n < prayersMasterBtn.inlineBtns.length; n++) {
            //We create html buttons for the 1st 6 inline buttons and append them to newDiv
            let b = prayersMasterBtn.inlineBtns[n];
            createBtn(b, newDiv, b.cssClass, false, b.onClick);
        }
    }
    //Creating an html button element for prayersMasterBtn and displaying it in btnsDiv (which is an html element passed to the function)
    createBtn(prayersMasterBtn, masterBtnDiv, prayersMasterBtn.cssClass, false, prayersMasterBtn.onClick);
    masterBtnDiv.classList.add("inlineBtns");
    masterBtnDiv.style.gridTemplateColumns = "100%";
    /**
     *Creates a new inlineBtn for each fraction and pushing it to fractionBtn.inlineBtns[]
     */
    async function createInlineBtns() {
        let btns = [];
        selectedPrayers.map((prayerTable) => {
            //for each string[][][] representing a table in the Word document from which the text was extracted, we create an inlineButton to display the text of the table
            let inlineBtn = new Button({
                btnID: baseTitle(prayerTable[0][0]),
                label: {
                    defaultLanguage: prayerTable[0][btn.languages.indexOf(defaultLanguage) + 1],
                    foreignLanguage: prayerTable[0][btn.languages.indexOf(foreingLanguage) + 1], //same logic and comment as above
                },
                prayersSequence: [baseTitle(prayerTable[0][0])],
                prayersArray: [[...prayerTable].reverse()],
                languages: btn.languages,
                cssClass: "fractionPrayersBtn",
                children: [...btn.parentBtn.children],
                onClick: () => {
                    //When the prayer button is clicked, we empty and hide the inlineBtnsDiv
                    hideInlineButtonsDiv();
                    let displayed = containerDiv
                        .querySelectorAll('div[data-group="optionalPrayer"]');
                    if (displayed.length > 0) {
                        displayed.forEach((el) => el.remove());
                    }
                    showPrayers(inlineBtn, false, false, {
                        beforeOrAfter: "afterend",
                        el: masterBtnDiv,
                    });
                    //We will append the newly created html elements after btnsDiv (notice that btnsDiv contains the prayersMasterBtn)
                    let createdElements = containerDiv.querySelectorAll(getDataRootSelector(inlineBtn.prayersSequence[0]));
                    //We will add to each created element a data-group attribute, which we will use to retrieve these elements and delete them when another inline button is clicked
                    createdElements.forEach((el) => el.setAttribute("data-group", "optionalPrayer"));
                    //We format the grid template of the newly added divs
                    setCSSGridTemplate(createdElements);
                    //We apply the amplification of text
                    applyAmplifiedText(createdElements);
                    //We scroll to the button
                    createFakeAnchor(masterBtnID);
                },
            });
            btns.push(inlineBtn);
        });
        return btns;
    }
}
/**
 * Takes the title of a Word Table, and loops the button.prayersArray[][][] to check wether an element[0][0] (which reflects a table in the Word document from which the text was retrieved) matches the provided title. If found, it returns the wordTable as a string[][](each array element being a row of the Word table). If dosen't find, it returns 'undefined'
 * @param {string} p - The title of the table that we need to find in the button's prayersArray[][][]. It corresponds to the element[0][0]
 * @param {Button} btn - the Button that we need to search its prayersArray[][][] property for an element[][] having its [0][0] value equal the title of the Word Table
 * @returns {string[][] | undefined} - an array representing the Word Table if found or 'undefined' if not found
 */
function findPrayerInBtnPrayersArray(p, btn) {
    let tblTitle;
    for (let i = 0; i < btn.prayersArray.length; i++) {
        tblTitle = baseTitle(btn.prayersArray[i][0][0]);
        if (btn.prayersArray[i][0] && //we check that btn.prayersArray[i] is not an empty array (it might happen as an error when the text is generated by VBA. Although I believe it has been fixed in my VBA code, but just in ase)
            baseTitle(btn.prayersArray[i][0][0]) === p //i.e., if the id of the table = the id of the prayer
        ) {
            return btn.prayersArray[i]; //we return the array representing the Word table (this array is a string[][], each of its elements is a string[] representing a row in the Word table)
        }
    }
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
        inlineBtnsDiv.appendChild(showDates().cloneNode());
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
            fun: () => changeDate(datePicker.value.toString()),
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
                editable.forEach(name => {
                    option = document.createElement('option');
                    option.innerText = name;
                    option.contentEditable = 'true';
                    select.add(option);
                });
                document.getElementById('homeImg').insertAdjacentElement('afterend', select);
                hideInlineButtonsDiv();
                select.addEventListener('change', processSelection);
                function processSelection() {
                    let entry = select.selectedOptions[0].innerText;
                    if (entry === select.options[0].innerText)
                        return; //if the selection is the 1st option (which is 'Choose from the list'), we return
                    if (entry === editable[2])
                        entry = prompt('Provide the function and the parameters', entry);
                    if (entry.includes('Fun(')) {
                        eval(entry);
                        return;
                    }
                    if (entry)
                        containerDiv.dataset.arrayName = entry;
                    editTablesArray(entry);
                }
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
    let createdElements = [], created;
    tables.map((table) => {
        if (!table || table.length === 0)
            return;
        table.map((row) => {
            created = createHtmlElementForPrayer(row, languages, undefined, position);
            if (created)
                createdElements.push(created);
        });
    });
    return createdElements;
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
populatePrayersArrays();
async function populatePrayersArrays() {
    //We are populating subset arrays of PrayersArray in order to speed up the parsing of the prayers when the button is clicked
    PrayersArray.map((wordTable) => {
        //each element in PrayersArray represents a table in the Word document from which the text of the prayers was retrieved
        if (wordTable[0][0].startsWith(Prefix.commonPrayer)) {
            CommonPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massStBasil)) {
            MassStBasilPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massCommon)) {
            MassCommonPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massStGregory)) {
            MassStGregoryPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massStCyril)) {
            MassStCyrilPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.massStJohn)) {
            MassStJohnPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.fractionPrayer)) {
            FractionsPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.commonDoxologies)) {
            DoxologiesPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.commonIncense)) {
            IncensePrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.incenseDawn)) {
            IncensePrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.incenseVespers)) {
            IncensePrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.communion)) {
            CommunionPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.psalmResponse)) {
            PsalmAndGospelPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.gospelResponse)) {
            PsalmAndGospelPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.cymbalVerses)) {
            CymbalVersesPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.praxis)) {
            PraxisResponsesPrayersArray.push(wordTable);
        }
        else if (wordTable[0][0].startsWith(Prefix.bookOfHours)) {
            bookOfHoursPrayersArray.push(wordTable);
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
 * Returns the title of the table without the '&C=' added at its end in order to indicate the class of each row. It returns the value of title.split('&C=')[0]
 * @param {string} title - the string that we need to split to get rid of the '&C=' string at its end
 */
function baseTitle(title) {
    if (!title) {
        console.log('title is = ', title);
        return;
    }
    ;
    return title.split('&C=')[0];
}
/**
 * This function generates a string[][][] from the string[][] generated by Word VBA for the readings
 */
//console.log(correctReading(btnReadingsKatholikon.prayersArray));
function generateFixedReadingArray(readingArray) {
    let unique = [], title, table, result = [];
    readingArray.forEach((row) => {
        title = baseTitle(row[0]);
        if (unique.indexOf(title) < 0) {
            unique.push(title);
        }
    });
    unique.forEach((title) => {
        table = [];
        readingArray.forEach((row) => {
            if (baseTitle(row[0]) === title) {
                table.push(row);
            }
        });
        result.push(table);
    });
    console.log(result);
    return result;
}
/**
 * Returns a string representing the query selector for a div element having a data-root attribute equal to root
 * @param {string} root - the data-root value we want to build a query selector for retrieving the elements with the same value
 * @param {boolean} isLike - if set to true, the function will return a query selector for an element having a data-root containing the root argument (as opposed to a root exactly matching the root argument)
 * @returns
 */
function getDataRootSelector(root, isLike = false) {
    if (isLike) {
        return 'div[data-root*="' + root + '"]';
    }
    else {
        return 'div[data-root="' + root + '"]';
    }
}
/**
 * Takes a collection of html elements and moves it adjacent to a given child html element to containerDiv
 * @param {string} targetElementRoot - the data-root value of the html element adjacent to which the block will be moved
 * @param {InsertPosition} position - the position at which the block of html elements will be moved in relation to the specified html element
 * @param {NodeListOf<Element>} block - a list of html elements that will be moved to the specified 'position' in relation to another html element in the containerDiv
 */
async function moveBlockOfRowsAdjacentToAnElement(targetElementRoot, position, block) {
    Array.from(block).map((r) => containerDiv
        .querySelector(getDataRootSelector(targetElementRoot))
        .insertAdjacentElement(position, r));
    contentDiv.querySelectorAll(".class");
}
/**
 * Replaces the css class class of all tables in an array of tables (i.e., a string[][][]). The css class is added as a suffix to the title of each table, preceded by '&C='
 * @param {string[][][]} prayersArray - the array of tables
 * @param {string} newClass - the new class that will replace the existing class
 */
function replaceClass(prayersArray, newClass) {
    prayersArray.map(table => {
        table.map(row => row[0] = baseTitle(row[0]) + '&C=' + newClass);
    });
}
/**
 * Replaces the musical eight note sign with a span that allows to give it a class and hence give it a color
 * @param {number} code - the Char code of the eigth note (or any other character that we want to replace with a span with the same css class)
 * @returns
 */
async function replaceEigthNote(code, container) {
    if (!code)
        code = 9834;
    if (!container)
        container = Array.from(containerDiv.querySelectorAll('p.Diacon'));
    if (container.length === 0)
        return;
    let note = String.fromCharCode(code), replaceWith = '<span class="eigthNote">' + note + '</span>';
    if (localStorage.displayMode === displayModes[1]) {
        replaceWith = '<span class="eigthNote">' + note + '</span><br>';
    }
    ;
    container.forEach((p) => {
        if (p && p.innerText.includes(note)) {
            p.innerHTML = p.innerHTML.replaceAll(note, replaceWith);
        }
    });
}
/**
 * Moves ah html element up or down in the DOM, before or after the specified number of siblings
 * @param {HTMLElement} element - the html element that we want to move
 * @param {number} by - the number of sibligns we want to move the element before or after (if number is <0, it moves element up, if >0 it moves it down)
 */
function moveElementBeforeOrAfterXSiblings(element, by) {
    let sibling, position;
    for (let i = 1; i <= by; i++) {
        if (by > 0)
            sibling = element.nextElementSibling;
        position = 'afterend';
        if (by < 0)
            sibling = element.previousSibling;
        position = 'beforebegin';
        if (i == by && sibling)
            sibling.insertAdjacentElement(position, element);
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxtQkFBbUIsR0FBZSxzQkFBc0IsRUFBRSxDQUFDO0FBRWpFOzs7R0FHRztBQUNILFNBQVMsbUJBQW1CLENBQUMsRUFBZTtJQUMxQyxJQUFJLElBQVksQ0FBQztJQUNqQixJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztJQUNmLHVGQUF1RjtJQUN2RixJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDcEMsK0NBQStDO1FBQy9DLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDN0Q7YUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUM5RCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVEO2FBQU07WUFDTCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdEQ7UUFDRCxFQUFFLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0RDtTQUFNLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUM3Qyxn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QUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7S0FDakIsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGNBQWM7SUFDckIsSUFDRSxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDMUMsWUFBWSxDQUFDLFNBQVMsQ0FB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