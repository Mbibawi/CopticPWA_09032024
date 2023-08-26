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
function modifyDefaultAndForeignLanguages() { }
document.addEventListener("DOMContentLoaded", autoRunOnLoad);
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
            alert("WARNING ! The date is manually set by the user to " +
                selectedDate.getDate().toString() +
                "/" +
                (selectedDate.getMonth() + 1).toString() +
                "/" +
                selectedDate.getFullYear().toString() +
                ". This choice will not kept. If you want the current date, you have to change the date manually");
            selectedDate.setHours(newDate.getHours(), newDate.getMinutes(), newDate.getSeconds(), newDate.getMilliseconds()); //We set its hours, minutes, and seconds to the current time
            setCopticDates(selectedDate);
        }
    }
    else {
        setCopticDates();
    }
    populatePrayersArrays();
}
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
        return console.log("No valid tblRow[][] object is passed to createHtmlElementForPrayer() ");
    if (!params.actorClass)
        params.actorClass = splitTitle(params.tblRow[0])[1];
    if (params.actorClass) {
        let parsed = JSON.parse(localStorage.showActors).filter((el) => el[0].EN === params.actorClass);
        if (parsed.length > 0 && parsed[0][1] === false)
            return; //If had hide an actor, we will stop and return
    }
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
    if (params.actorClass && params.actorClass.includes("Title")) {
        htmlRow.addEventListener("click", (e) => {
            e.preventDefault;
            collapseOrExpandText({ titleRow: htmlRow });
        }); //we also add a 'click' eventListener to the 'Title' elements
        htmlRow.id = params.tblRow[0]; //we add an id to all the titles in order to be able to retrieve them for the sake of adding a title shortcut in the titles right side bar
    }
    //looping the elemparams.ents containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
    for (let x = 1; x < params.tblRow.length; x++) {
        //x starts from 1 because prayers[0] is the id
        if (!params.tblRow[x] || params.tblRow[x] === " ")
            continue; //we escape the empty strings if the text is not available in all the button's languages
        if (params.actorClass &&
            (params.actorClass === "Comments" || params.actorClass === "CommentText")) {
            //this means it is a comment
            x === 1
                ? (lang = params.languagesArray[1])
                : (lang = params.languagesArray[3]);
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
                params.position.el.insertAdjacentElement(
                //@ts-ignore
                params.position.beforeOrAfter, htmlRow)
            : //@ts-ignore
                params.position.appendChild(htmlRow);
        return htmlRow;
    }
    catch (error) {
        console.log("an error occured: position = ", params.position, " and tblRow = ", params.tblRow);
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
    titlesArray = titlesCollection.map((titleRow) => {
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
        if (titlesRow.querySelector("." + defaultLanguage)) {
            //if the titles div has a paragraph child with class="AR", it means this is the paragraph containing the Arabic text of the title
            text += titlesRow
                .querySelector("." + defaultLanguage)
                //@ts-ignore
                .innerText.split("\n")[0];
        }
        if (titlesRow.querySelector("." + foreingLanguage)) {
            if (text !== "") {
                text +=
                    "\n" +
                        titlesRow
                            .querySelector("." + foreingLanguage)
                            //@ts-ignore
                            .innerText.split("\n")[0];
            }
            else {
                text += titlesRow
                    .querySelector("." + foreingLanguage)
                    //@ts-ignore
                    .innerText.split("\n")[0];
            }
        }
        //we remove the plus(+) or minus(-) signs from the begining text of the Arabic paragraph;
        text = text
            .replaceAll(String.fromCharCode(plusCharCode) + " ", "")
            .replaceAll(String.fromCharCode(plusCharCode + 1) + " ", "");
        bookmark.innerText = text;
        //If the container is an 'Expandable' container, we hide the title
        if (titlesRow.parentElement &&
            titlesRow.parentElement.classList.contains("Expandable"))
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
    if (btn.prayersSequence &&
        btn.prayersArray &&
        btn.languages &&
        btn.showPrayers)
        showPrayers(btn, true, true, container);
    if (btn.afterShowPrayers)
        btn.afterShowPrayers();
    //Important ! : setCSSGridTemplate() MUST be called after btn.afterShowPrayres()
    setCSS(Array.from(container.querySelectorAll("div.Row"))); //setting the number and width of the columns for each html element with class 'Row'
    applyAmplifiedText(Array.from(container.querySelectorAll("div.Row")));
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
    if (btn.parentBtn &&
        btn.btnID !== btnGoBack.btnID &&
        !sideBarBtnsContainer.querySelector("#" + btnGoBack.btnID)) {
        //i.e., if the button passed to showChildButtonsOrPrayers() has a parentBtn property and it is not itself a btnGoback (which we check by its btnID property), we wil create a goBack button and append it to the sideBar
        //the goBack Button will only show the children of btn in the sideBar: it will not call showChildButonsOrPrayers() passing btn to it as a parameter. Instead, it will call a function that will show its children in the SideBar
        createGoBackBtn(btn.parentBtn, sideBarBtnsContainer, btn.cssClass);
        lastClickedButton = btn;
    }
    if (btn.btnID !== btnMain.btnID && //The button itself is not btnMain
        btn.btnID !== btnGoBack.btnID && //The button itself is not btnGoBack
        !sideBarBtnsContainer.querySelector("#" + btnMain.btnID) //No btnMain is displayed in the sideBar
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
    if (btn.btnID !== btnMain.btnID &&
        containerDiv.children.length > 0 &&
        containerDiv.children[0].classList.contains("mainPageBtns"))
        btnMain.onClick();
}
/**
 * Appends the settings button to the right side bar
 */
function addSettingsButton() {
    let settingsBtn = sideBarBtnsContainer.querySelector("#settings");
    //We finally add the settings button to the right side Bar
    if (settingsBtn)
        return sideBarBtnsContainer.append(settingsBtn); //If the button is already there, we move it to the bottom of the list
    //Esle: we create a new Buton
    settingsBtn = document.createElement("div");
    settingsBtn.id = "settings";
    settingsBtn.classList.add("settings");
    settingsBtn.innerText = "Settings";
    settingsBtn.addEventListener("click", () => showSettingsPanel());
    sideBarBtnsContainer.appendChild(settingsBtn);
}
/**
 * This function adds the same data-group to all the divs that need to be hidden or shown when a div having the class 'Title' or 'SubTitle' is clicked (this div is passed to the function in the titleRow argument). The data-group that will be given to each div is same as the data-root of the titleRow div.
 * @param {string} titleClass - the type of name of the title class ('Title' or 'SubTitle'), of the main div. Its default value is 'Title'
 * @param {HTMLElement} titleRow - is a div element having as class either 'Title' or 'Subtitle'
 */
async function addDataGroupsToContainerChildren(titleClass = "Title", titleRow) {
    if (!titleRow || !titleRow.classList.contains(titleClass))
        return;
    //If a titleRow div is passed, we will give all its siblings a data-group = the data-root of titleRow, and will then return
    let nextSibling = titleRow.nextElementSibling;
    while (nextSibling && !nextSibling.classList.contains(titleClass)) {
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
            btnsDiv.innerHTML = "";
            if (goTo.children)
                goTo.children.forEach((childBtn) => {
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
        if (!btn.label[lang] ||
            (Object.keys(btn.label).indexOf(lang) !== 0 &&
                Object.keys(btn.label).indexOf(lang) !== 1))
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
        [
            "1307",
            "1903",
            "2111",
            "0402",
            "0403",
            "0804",
            "1002"
        ],
        [
            "1703",
            "1301",
            "1209",
            "1406",
            "1412",
            "1504",
            "1806",
            "2103",
            "2706",
            "2809",
            "0104",
            "0302",
            "0502",
            "0603",
            "0705",
            "0902"
        ],
        [
            "2708",
            "1101",
            "1110",
            "1306",
            "1404",
            "1605",
            "1706",
            "1808",
            "2211",
            "2306",
            "2705",
            "1111",
            "2201",
            "1101",
            "2201"
        ],
        [
            "2803",
            "0901",
            "1004",
            "1109",
            "1311",
            "1403",
            "1410",
            "1707",
            "1709",
            "1805",
            "1904",
            "1908",
            "2206",
            "2303",
            "2305",
            "2406",
            "2412",
            "2704",
            "2709",
            "0207",
            "0310",
            "0507",
            "0513",
            "1011",
            "1112",
            "2302"
        ],
        [
            "3005",
            "0501",
            "1001",
            "1003",
            "1108",
            "1507",
            "1512",
            "1711",
            "2121",
            "2405",
            "2508",
            "2604",
            "2607",
            "2811",
            "2905",
            "0102",
            "0212",
            "0602",
            "0608",
            "0612",
            "0808",
            "2001",
            "2901"
        ],
        [
            "0105",
            "1508",
            "1907",
            "2005",
            "2209",
            "2510",
            "2908",
            "0110",
            "0309",
            "0611",
            "1501",
            "2401",
            "2602"
        ],
        [
            "0109",
            "1612",
            "2105",
            "2110",
            "0304"
        ],
        [
            "0206",
            "2504",
            "0704",
            "0711",
            "2002"
        ],
        [
            "0210",
            "3006"
        ],
        [
            "0311",
            "1208",
            "1303",
            "1812",
            "2207",
            "2810",
            "3003",
            "3009",
            "0103",
            "0202",
            "0205",
            "0308",
            "0701",
            "0706",
            "0709",
            "0805",
            "1102",
            "1702",
            "0301"
        ],
        [
            "0312",
            "1409",
            "1511",
            "1704",
            "2109",
            "2410",
            "2909",
            "0209",
            "0906",
            "1401"
        ],
        [
            "0313",
            "1310"
        ],
        [
            "0405",
            "1608",
            "1609",
            "1611",
            "2404",
            "2906"
        ],
        [
            "0511",
            "1708",
            "1803",
            "1811",
            "2104",
            "2106",
            "2911",
            "0404",
            "0807",
            "1006"
        ],
        [
            "0605",
            "0604",
            "0806"
        ],
        [
            "0801",
            "1505",
            "2004",
            "2010",
            "2212",
            "2307",
            "2606",
            "2610",
            "2611",
            "0401",
            "0412",
            "0504",
            "0508",
            "0509",
            "0601",
            "0708",
            "0910",
            "2102",
            "2501"
        ],
        [
            "0903",
            "0106",
            "0303",
            "0407",
            "1201"
        ],
        [
            "1009",
            "0812"
        ],
        [
            "1202",
            "1509"
        ],
        [
            "1203",
            "1210"
        ],
        [
            "1312",
            "2107"
        ],
        [
            "1402",
            "2507"
        ],
        [
            "1503",
            "1211",
            "1510",
            "2411",
            "2805",
            "0112",
            "0410",
            "0411",
            "0606",
            "0912"
        ],
        [
            "1601",
            "2807",
            "0909"
        ],
        [
            "1610",
            "1104",
            "1506",
            "1603",
            "1705",
            "0204"
        ],
        [
            "1701",
            "1007",
            "1212"
        ],
        [
            "1705",
            "3001"
        ],
        [
            "2009",
            "1008",
            "1206",
            "1405",
            "1906",
            "2505",
            "2910",
            "0108",
            "0306",
            "0702",
            "0703",
            "0907",
            "1204",
            "1302",
            "2502"
        ],
        [
            "2011",
            "1807",
            "2008",
            "2408",
            "2506",
            "2608",
            "2806",
            "0208",
            "0610",
            "1502",
            "1902"
        ],
        [
            "2101",
            "1107",
            "1407",
            "2301"
        ],
        [
            "2202",
            "1804",
            "0406"
        ],
        [
            "2203",
            "1010",
            "1308",
            "1905",
            "1911",
            "2012",
            "2210",
            "2603",
            "3011",
            "0107",
            "0408",
            "0707",
            "2701",
            "2801"
        ],
        [
            "2204",
            "3007"
        ],
        [
            "2205",
            "1309",
            "1710",
            "1909",
            "2310",
            "0510",
            "0904",
            "0908",
            "2402"
        ],
        [
            "2308",
            "1910",
            "2312",
            "2711",
            "2712",
            "0609",
            "0710",
            "0809",
            "0703"
        ],
        [
            "2409",
            "0810"
        ],
        [
            "2503",
            "2509",
            "2511",
            "2808",
            "0505",
            "0802",
            "2802"
        ],
        [
            "2601",
            "1103",
            "1304",
            "1606",
            "0712"
        ],
        [
            "2605",
            "0512"
        ],
        [
            "2702",
            "1411",
            "1809",
            "1912",
            "2707",
            "0506",
            "0811",
            "0905"
        ],
        [
            "2703",
            "1604",
            "2311",
            "0503",
            "0607",
            "1012",
            "2902"
        ],
        [
            "2903",
            "1106",
            "1207",
            "1408",
            "1607",
            "2006",
            "2007",
            "2208",
            "2407",
            "0203",
            "0307",
            "0409",
            "1602",
            "1802"
        ],
        [
            "2905",
            "1810"
        ],
        [
            "3008",
            "0211",
            "2003",
            "2309",
            "2710",
            "0111",
            "0911",
            "3002"
        ]
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
    scriptIDs.forEach((id) => {
        old = document.getElementById(id);
        copy = document.createElement("script");
        copy.id = old.id;
        copy.src = old.src;
        copy.type = old.type;
        old.remove();
        document.getElementsByTagName("body")[0].appendChild(copy);
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
        Array.from(p.children).forEach((child) => child.classList.toggle(myClass));
    });
    if (target.classList.contains(myClass)) {
        //it means that the class was added (not removed) when the user dbl clicked
        amplified.filter((el) => el[0] === target.lang.toUpperCase())[0][1] = true;
    }
    else {
        amplified.filter((el) => el[0] === target.lang.toUpperCase())[0][1] = false;
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
    if (!btn || !btn.prayersSequence)
        return;
    if (btn.btnID != btnGoBack.btnID && btn.btnID != btnMain.btnID)
        closeSideBar(leftSideBar);
    if (clearContent)
        containerDiv.innerHTML = "";
    if (clearRightSideBar)
        sideBarTitlesContainer.innerHTML = ""; //this is the right side bar where the titles are displayed for navigation purposes
    let date;
    return btn.prayersSequence.map((prayer) => {
        if (!prayer)
            console.log("no prayer");
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
        return wordTable.map((row) => {
            return createHtmlElementForPrayer({
                tblRow: row,
                languagesArray: btn.languages,
                position: position,
                container: container,
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
    htmlRows.forEach((row) => {
        //Setting the number of columns and their width for each element having the 'Row' class for each Display Mode
        row.style.gridTemplateColumns = getColumnsNumberAndWidth(row);
        //Defining grid areas for each language in order to be able to control the order in which the languages are displayed (Arabic always on the last column from left to right, and Coptic on the first column from left to right)
        row.style.gridTemplateAreas = setGridAreas(row);
        (function addRightBorders() {
            let rowChildren = Array.from(row.children);
            rowChildren.forEach((parag) => {
                if (rowChildren.indexOf(parag) !== rowChildren.length - 1)
                    parag.style.borderRightStyle = "groove";
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
                    return console.log("no paragraph with lang= " + defaultLanguage);
                if (defLangParag.innerHTML.includes(plusSign + " "))
                    defLangParag.innerHTML = defLangParag.innerHTML.replace(plusSign + " ", ""); //We remove the + sign in the begining (if it exists)
                if (defLangParag.innerHTML.includes(minusSign + " "))
                    defLangParag.innerHTML = defLangParag.innerHTML.replace(minusSign + " ", ""); //!Caution: we need to work with the innerHTML in order to avoid losing the new line or any formatting to the title text when adding the + or - sing. So don't change the innerHTML to innerText or textContent
                if (row.dataset.isCollapsed)
                    defLangParag.innerHTML = plusSign + " " + defLangParag.innerHTML; //We add the plus (+) sign at the begining
                if (!row.dataset.isCollapsed)
                    defLangParag.innerHTML = minusSign + " " + defLangParag.innerHTML; //We add the minus (-) sig at the begining;
            })();
        }
        let paragraphs = Array.from(row.querySelectorAll("p"));
        if (row.classList.contains("Diacon"))
            replaceMusicalNoteSign(paragraphs);
        if (row.dataset.root.startsWith(Prefix.praxis) ||
            row.dataset.root.startsWith(Prefix.katholikon) ||
            row.dataset.root.startsWith(Prefix.stPaul) ||
            row.dataset.root.startsWith(Prefix.gospelDawn) ||
            row.dataset.root.startsWith(Prefix.gospelVespers) ||
            row.dataset.root.startsWith(Prefix.gospelNight) ||
            row.dataset.root.startsWith(Prefix.gospelMass) ||
            row.dataset.root.startsWith(Prefix.synaxarium) ||
            row.dataset.root.startsWith(Prefix.propheciesDawn))
            replaceQuotes(paragraphs);
        (function formatRow() {
            return;
            if (row.classList.contains("showDae")) {
                row.style.color = "#5270a3";
                row.style.fontWeight = "bold";
                row.style.padding = "7px";
            }
            if (row.classList.contains(displayModes[1])) {
                if (row.classList.contains("Comments") ||
                    row.classList.contains("CommentText"))
                    row.classList.add(hidden);
            }
        })();
        (function formatParagraphs() {
            return;
            let paragraphs = Array.from(row.children);
            paragraphs.forEach((p) => {
                if (p.tagName !== "P")
                    return;
                p.style.display = "block";
                p.style.gridArea = p.lang.toUpperCase();
                p.style.padding = "0px 7px 0px 7px";
                p.style.textAlign = "justify";
                if (paragraphs.indexOf(p) !== paragraphs.length - 1) {
                    p.style.borderRightStyle = "groove";
                }
                if (row.classList.contains(displayModes[1])) {
                    p.style.backgroundColor = "black";
                    p.style.color = "white";
                    p.style.borderRadius = "20px";
                }
                if (p.lang === "ar" || p.lang === "ca") {
                    p.style.direction = "rtl";
                    p.style.fontFamily = "GentiumBookPlus";
                    p.style.fontSize = "18.5pt";
                    p.style.fontWeight = "500";
                    p.style.lineHeight = "30px";
                    if (row.classList.contains(displayModes[1])) {
                        p.style.fontSize = "8vh";
                        p.style.lineHeight = "3rem";
                    }
                }
                else if (p.lang === "fr" || p.lang === "fr") {
                    p.style.fontFamily = "DCO";
                    p.style.fontSize = "13pt";
                    p.style.fontWeight = "normal";
                }
                else if (p.lang === "cop") {
                    p.style.fontFamily = "ArialCoptic";
                    p.style.lineHeight = "25px";
                }
                if (row.classList.contains("Title") ||
                    row.classList.contains("SubTitle")) {
                    p.style.textAlign = "center";
                }
                if (row.classList.contains("colorbtn")) {
                    p.style.margin = "1px 1px";
                }
                if (row.classList.contains("inlineBtn") ||
                    row.classList.contains("sideBarBtn")) {
                    p.style.fontSize = "12pt";
                    p.style.marginTop = "1px";
                    p.style.marginBottom = "1px";
                    p.style.lineHeight = "20px";
                }
            });
        })();
    });
}
function replaceQuotes(paragraphs) {
    let splitted;
    paragraphs
        .filter((paragraph) => !paragraph.classList.contains("COP") &&
        !paragraph.classList.contains("CA"))
        .forEach((paragraph) => {
        if (paragraph.classList.contains("FR")) {
            paragraph.innerHTML = paragraph.innerHTML
                .replaceAll("«", "<q>")
                .replaceAll("»", "</q>");
        }
        else if (paragraph.classList.contains("AR")) {
            splitted = paragraph.innerHTML.split('"');
            splitted.forEach((part) => {
                if (splitted.indexOf(part) % 2 !== 0)
                    splitted[splitted.indexOf(part)] = "<q>" + part + "</q>";
            });
            console.log(splitted.join(""));
            if (splitted.length > 0)
                paragraph.innerHTML = splitted.join("");
        }
    });
}
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
async function applyAmplifiedText(htmlRows) {
    if (!htmlRows)
        return;
    if (localStorage.displayMode === displayModes[1])
        return; //We don't amplify the text if we are in the 'Presentation Mode'
    let langs = JSON.parse(localStorage.textAmplified);
    langs = langs.filter((lang) => lang[1] === true);
    htmlRows.forEach((row) => {
        //looping the rows in the htmlRows []
        Array.from(row.children)
            //looping the children of each row (these children are supposedly paragraph elements)
            .forEach((child) => {
            if (!child.lang)
                return;
            //if the child has the lang attribute set, we will loop each language in langs, and if
            langs.forEach((lang) => {
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
        params.titleRow.dataset.isCollapsed = "true";
    }
    else if (params.collapse === false) {
        params.titleRow.dataset.isCollapsed = "";
    }
    else {
        //In this case we will toggle the isCollapsed status
        if (params.titleRow.dataset.isCollapsed)
            params.titleRow.dataset.isCollapsed = "";
        else if (!params.titleRow.dataset.isCollapsed)
            params.titleRow.dataset.isCollapsed = "true";
    }
    togglePlusAndMinusSignsForTitles(params.titleRow);
    //Hiding or showing the elements linked to the title (titleRow)
    Array.from(params.titleRow.parentElement.children)
        .filter((div) => div.dataset.group && div.dataset.group === params.titleRow.dataset.root)
        .forEach((div) => {
        if (div === params.titleRow)
            return;
        if (params.titleRow.dataset.isCollapsed &&
            !div.classList.contains(hidden))
            div.classList.add(hidden);
        else if (div.classList.contains(hidden) &&
            !div.classList.contains("Expandable"))
            div.classList.remove(hidden);
    });
}
/**
 * Toggels the minus and plus signs in the Title
 * @param {HTMLElement} titleRow - the html element (usually a div with class 'Title') that we wqnt to toggle the minus or plus signs according to whether the text is collapsed or not
 * @returns
 */
async function togglePlusAndMinusSignsForTitles(titleRow, plusCode = plusCharCode) {
    if (!titleRow.children)
        return;
    let parag;
    parag = Array.from(titleRow.children).filter((child) => child.innerHTML.startsWith(String.fromCharCode(plusCode)) ||
        child.innerHTML.startsWith(String.fromCharCode(plusCode + 1)))[0];
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
    htmlRows.forEach((row) => {
        if (!checkIfTitle(row) && !row.classList.contains(hidden))
            row.classList.add(hidden);
        else {
            row.dataset.isCollapsed = "true";
            togglePlusAndMinusSignsForTitles(row);
            if (hideSideBarTitle)
                hideOrShowTitle(row, true);
        }
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
        return children.filter((htmlRow) => htmlRow.tagName === "DIV" &&
            htmlRow.dataset.root &&
            htmlRow.dataset.root === dataRoot);
    }
    else if (options.includes) {
        return children.filter((htmlRow) => htmlRow.tagName === "DIV" &&
            htmlRow.dataset.root &&
            htmlRow.dataset.root.includes(dataRoot));
    }
    else if (options.startsWith) {
        return children.filter((htmlRow) => htmlRow.tagName === "DIV" &&
            htmlRow.dataset.root &&
            htmlRow.dataset.root.startsWith(dataRoot));
    }
    else if (options.endsWith) {
        return children.filter((htmlRow) => htmlRow.tagName === "DIV" &&
            htmlRow.dataset.root &&
            htmlRow.dataset.root.endsWith(dataRoot));
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
        console.log("anchor missing");
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
            newDiv.style.gridTemplateColumns = (String((100 / groupOfNumber) * 2) + "% ").repeat(groupOfNumber / 2);
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
        if (prayersMasterBtn.children.length > groupOfNumber &&
            prayersMasterBtn.children.length - startAt > groupOfNumber) {
            //We create the "next" Button only if there is more than 6 inlineBtns in the prayersBtn.inlineBtns[] property
            next = new Button({
                btnID: "btnNext",
                label: { defaultLanguage: "التالي", foreignLanguage: "Suivants" },
                cssClass: inlineBtnClass,
                onClick: () => {
                    //When next is clicked, we remove all the html buttons displayed in newDiv (we empty newDiv)
                    newDiv.innerHTML = "";
                    //We then remove the "next" html button itself (the "next" button is appended to inlineBtnsDiv directly not to newDiv)
                    inlineBtnsDiv.querySelector("#" + next.btnID).remove();
                    //We set the starting index for the next 6 inline buttons
                    startAt += groupOfNumber;
                    //We call showGroupOfSixPrayers() with the new startAt index
                    showGroupOfNumberOfPrayers(startAt, newDiv, groupOfNumber);
                },
            });
        }
        else {
            next = new Button({
                btnID: "btnNext",
                label: {
                    defaultLanguage: "العودة إلى القداس",
                    foreignLanguage: "Retour à la messe",
                },
                cssClass: inlineBtnClass,
                onClick: () => {
                    //When next is clicked, we remove all the html buttons displayed in newDiv (we empty newDiv)
                    hideInlineButtonsDiv();
                    createFakeAnchor(prayersMasterBtn.btnID);
                },
            });
        }
        createBtn(next, inlineBtnsDiv, next.cssClass, false, next.onClick); //notice that we are appending next to inlineBtnsDiv directly not to newDiv (because newDiv has a display = 'grid' of 2 columns. If we append to it, 'next' button will be placed in the 1st cell of the last row. It will not be centered). Notice also that we are setting the 'clear' argument of createBtn() to false in order to prevent removing the 'Go Back' button when 'next' is passed to showchildButtonsOrPrayers()
        for (let n = startAt; n < startAt + groupOfNumber && n < prayersMasterBtn.children.length; n++) {
            //We create html buttons for the 1st 6 inline buttons and append them to newDiv
            childBtn = prayersMasterBtn.children[n];
            createBtn(childBtn, newDiv, childBtn.cssClass, false, childBtn.onClick);
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
        btns = filteredPrayers.map((prayerTable) => {
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
                children: (() => {
                    if (btn.parentBtn && btn.parentBtn.children)
                        return [...btn.parentBtn.children];
                })(),
                onClick: () => {
                    //When the prayer button is clicked, we empty and hide the inlineBtnsDiv
                    hideInlineButtonsDiv();
                    if (masterBtnDiv.dataset.displayedOptionalPrayer) {
                        //If a fraction is already displayed, we will retrieve all its divs (or rows) by their data-root attribute, which  we had is stored as data-displayed-Fraction attribued of the masterBtnDiv
                        containerDiv
                            .querySelectorAll('div[data-root="' +
                            masterBtnDiv.dataset.displayedOptionalPrayer +
                            '"]')
                            .forEach((div) => div.remove());
                    }
                    //We call showPrayers and pass inlinBtn to it in order to display the fraction prayer
                    let createdElements = showPrayers(inlineBtn, false, false, {
                        el: masterBtnDiv,
                        beforeOrAfter: "afterend",
                    });
                    masterBtnDiv.dataset.displayedOptionalPrayer = splitTitle(prayerTable[0][0])[0]; //After the fraction is inserted, we add data-displayed-optional-Prayer to the masterBtnDiv in order to use it later to retrieve all the rows/divs of the optional prayer that was inserted, and remove them
                    createdElements.map((table) => {
                        if (table.length === 0)
                            return;
                        table.forEach((el) => 
                        //We will add to each created element a data-optional-prayer attribute, which we will use to retrieve these elements and delete them when another inline button is clicked
                        (el.dataset.optionalPrayer = el.dataset.root));
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
    let filtered = prayersArray.filter((table) => table[0][0] && splitTitle(table[0][0])[0] === tableTitle);
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
    inlineBtnsDiv.style.backgroundImage = "url(./assets/PageBackgroundCross.jpg)";
    inlineBtnsDiv.style.backgroundSize = "10%";
    inlineBtnsDiv.style.backgroundRepeat = "repeat";
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
        },
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
        params.langsOptions.map((lang) => {
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
    (async function showExcludeActorButon() {
        let actorsContainer = document.createElement("div");
        actorsContainer.style.display = "grid";
        actorsContainer.style.gridTemplateColumns = String("50%").repeat(2);
        inlineBtnsDiv.appendChild(actorsContainer);
        actors.map((actor) => {
            if (actor.EN === "CommentText")
                return; //we will not show a button for 'CommentText' class, it will be handled by the 'Comment' button
            let show = JSON.parse(localStorage.getItem("showActors")).filter((el) => el[0].AR === actor.AR)[0][1];
            btn = createBtn("button", "button", "settingsBtn", actor[foreingLanguage], actorsContainer, actor.EN, actor.EN, undefined, undefined, undefined, {
                event: "click",
                fun: () => {
                    show = !show;
                    showActors.filter((el) => el[0].EN === actor.EN)[0][1] = show;
                    btn.classList.toggle("langBtnAdd");
                    //changing the background color of the button to red by adding 'langBtnAdd' as a class
                    if (actor.EN === "Comments") {
                        showActors.filter((el) => el[0].EN === "CommentText")[0][1] =
                            show;
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
        displayModes.map((mode) => {
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
        if (localStorage.editingMode != "true")
            return;
        let displayContainer = document.createElement("div");
        displayContainer.style.display = "grid";
        displayContainer.style.gridTemplateColumns = String((100 / 3).toString() + "%").repeat(3);
        inlineBtnsDiv.appendChild(displayContainer);
        btn = createBtn("button", "button", "settingsBtn", "Editing Mode", displayContainer, "editingMode" + localStorage.editingMode.toString(), undefined, undefined, undefined, undefined, {
            event: "click",
            fun: () => {
                //@ts-ignore
                if (!console.save)
                    addConsoleSaveMethod(console); //We are adding a save method to the console object
                containerDiv.innerHTML = "";
                let editable = [
                    "Choose from the list",
                    "NewTable",
                    'Fun("arrayName", "Table\'s Title")',
                    "testEditingArray",
                    "PrayersArray",
                    "ReadingsArrays.GospelDawnArray",
                    "ReadingsArrays.GospelMassArray",
                    "ReadingsArrays.GospelNightArray",
                    "ReadingsArrays.GospelVespersArray",
                    "ReadingsArrays.KatholikonArray",
                    "ReadingsArrays.PraxisArray",
                    "ReadingsArrays.PropheciesDawnArray",
                    "ReadingsArrays.StPaulArray",
                    "ReadingsArrays.SynaxariumArray",
                ];
                let select = document.createElement("select"), option;
                select.style.backgroundColor = "ivory";
                select.style.height = "16pt";
                editable.forEach((name) => {
                    option = document.createElement("option");
                    option.innerText = name;
                    option.contentEditable = "true";
                    select.add(option);
                });
                document
                    .getElementById("homeImg")
                    .insertAdjacentElement("afterend", select);
                hideInlineButtonsDiv();
                select.addEventListener("change", () => editTablesArray({ select: select }));
            },
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
            let newBtn = createBtn("button", undefined, "colorbtn", undefined, container, actor.EN + "Color");
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
    return tables.map((table) => {
        if (!table || table.length === 0)
            return;
        table.map((row) => {
            return createHtmlElementForPrayer({
                tblRow: row,
                languagesArray: languages,
                position: position,
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
    PrayersArray.map((table) => {
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
            if (table[0][0].includes("1stHour")) {
                bookOfHours.DawnPrayersArray.push(table);
            }
            else if (table[0][0].includes("3rdHour")) {
                bookOfHours.ThirdHourPrayersArray.push(table);
            }
            else if (table[0][0].includes("6thHour")) {
                bookOfHours.SixthHourPrayersArray.push(table);
            }
            else if (table[0][0].includes("9thHour")) {
                bookOfHours.NinethHourPrayersArray.push(table);
            }
            else if (table[0][0].includes("11thHour")) {
                bookOfHours.EleventhHourPrayersArray.push(table);
            }
            else if (table[0][0].includes("12thHour")) {
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
    if (!title.includes("&C="))
        return [title, ""];
    return title.split("&C=");
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
function getDataRootSelector(root, isLike = false, htmlTag = "div") {
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
        container = Array.from(containerDiv.querySelectorAll("p.Diacon"));
    if (container.length === 0)
        return;
    let notes = [
        String.fromCharCode(eighthNoteCode),
        String.fromCharCode(beamedEighthNoteCode),
    ];
    notes.forEach((note) => {
        container.forEach((p) => {
            if (!p.innerText.includes(note))
                return;
            p.innerHTML = p.innerHTML.replaceAll(note, '<span class="musicalNote">' + note + "</span>");
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
    htmlRows.forEach((row) => {
        if (!row.title)
            return alert("the row dosen't have title");
        table.push(Array.from(row.children).map((p) => p.innerText));
        table[table.length - 1].unshift(row.title);
    });
    return table;
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
                    console.log("different rows: \n", sourceArray[i][row][text], "\n\n", editedArray[i][row][text], "\n\n");
                }
        }
        if (sourceArray[i][0][0] !== editedArray[i][0][0]) {
            console.log("Original = ", sourceArray[i], " and new = ", editedArray);
        }
        else {
            console.log("SameTitle");
        }
    }
    if (sourceArray.length !== editedArray.length) {
        console.log("sourceArray length = ", sourceArray.length, " editedArray length = ", editedArray.length);
    }
    else {
        console.log("source Array length = edited Array length = ", sourceArray.length);
    }
}
function removeDuplicates(array) {
    array.map((tbl) => {
        array.forEach((t) => {
            if (array.indexOf(t) !== array.indexOf(tbl) &&
                t[0][0] === tbl[0][0] &&
                t.length === tbl.length) {
                console.log("first table = ", tbl, " and duplicate = ", t);
            }
            else
                console.log(t[0][0]);
        });
    });
}
function makeExpandableButtonContainerFloatOnTop(btnContainer, top) {
    btnContainer.style.position = "fixed";
    btnContainer.style.top = top;
    btnContainer.style.justifySelf = "center";
}
function checkIfTitle(htmlRow) {
    if (htmlRow.classList.contains("Title") ||
        htmlRow.classList.contains("SubTitle"))
        return true;
    else
        return false;
}
/**
 * Hides all the titles shortcuts for the the html div elements included in the container, from the right side bar
 * @param {HTMLElement} container - the html element containing the title divs which we want to hide their titles shortcuts from the right side Bar
 */
function hideOrShowAllTitlesInAContainer(container, hide = true) {
    //We hide all the titles from the right side Bar
    Array.from(container.children)
        .filter((child) => checkIfTitle(child))
        .forEach((child) => hideOrShowTitle(child, hide));
}
/**
 * Hides a title shortcut from the right side bar based on the id of the html element passed to it
 * @param {HTMLElement} htmlTitle - the html element for which we want to hide the shortcut title in the side bar
 */
function hideOrShowTitle(htmlTitle, hide) {
    let titles = Array.from(sideBarTitlesContainer.children), title;
    title = titles.filter((title) => title.dataset.group === htmlTitle.id)[0];
    if (!title)
        return;
    if (hide && !title.classList.contains(hidden))
        title.classList.add(hidden);
    if (!hide && title.classList.contains(hidden))
        title.classList.remove(hidden);
}
async function callFetchKatamars() {
    for (let i = 5; i < 8; i++) {
        await fetchSynaxarium(i);
    }
    console.log(ReadingsArrays.SynaxariumArray);
}
async function fetchSynaxarium(month) {
    let tbl, daystring, monthstring;
    let apiRoot = 'http://katamars.avabishoy.com/api/Katamars/';
    monthstring = month.toString();
    if (month < 10)
        monthstring = '0' + monthstring;
    for (let day = 1; day < 31; day++) {
        daystring = day.toString();
        if (day < 10)
            daystring = '0' + daystring;
        tbl =
            ReadingsArrays.SynaxariumArray
                .filter(tbl => tbl[0][0].includes('&D=' + daystring + monthstring))[0];
        if (!tbl || tbl.length === 0)
            return;
        synaxariumIndex
            .filter(obj => obj.day === day && obj.month === month)
            .forEach(obj => {
            let response = sendHttpRequest(apiRoot + 'GetSynaxariumStory?id=' + String(obj.id) + '&synaxariumSourceId=1');
            if (!response)
                return;
            let divs = response.querySelectorAll('div');
            if (divs.length === 0)
                return;
            if (!tbl[1])
                return;
            tbl[1][tbl[1].length - 1] += divs[1].innerHTML + '\n';
            console.log('done ', tbl[0]);
        });
    }
    ;
    function sendHttpRequest(apiURL) {
        let request = new XMLHttpRequest();
        request.open('GET', apiURL);
        request.send();
        console.log(request.getAllResponseHeaders());
        request.onload = () => {
            if (request.status === 200) {
                let responseDoc = new DOMParser()
                    .parseFromString(request.response, 'text/html');
                if (!responseDoc)
                    return;
                return responseDoc;
            }
            else {
                console.log('error status text = ', request.statusText);
                return request.statusText;
            }
        };
    }
}
/*
async function fetchKatamars_() {
  let url1 =
      "http://katamars.avabishoy.com/api/Katamars/GetSynaxariumStory?id=",
    url2 = "&synaxariumSourceId=0";
  let response;
  let init: RequestInit = {
    referrerPolicy: "strict-origin-when-cross-origin",
  };

  for (let i = 1; i < 10; i++) {
    response = await fetch(url1 + i + url2, init);
    console.log(response);
  }
}*/
let synaxariumIndex = [
    {
        id: 1,
        title: "عيد النيروز رأس السنة القبطية. - 1 توت",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 1,
    },
    {
        id: 2,
        title: "تذكار شفاء أيوب الصدِّيق. - 1 توت",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 1,
    },
    {
        id: 3,
        title: "استشهاد القديس برثولماوس الرسول - 1 توت",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 1,
    },
    {
        id: 4,
        title: "نياحة البابا ميليوس البطريرك الثالث من بطاركة الكرازة المرقسية - 1 توت",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 1,
    },
    {
        id: 5,
        title: "نياحة البابا مرقس الخامس البطريرك الثامن والتسعين من بطاركة الكرازة المرقسية - 1 توت",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 1,
    },
    {
        id: 6,
        title: "استشهاد القديس يوحنا المعمدان - 2 توت",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 1,
    },
    {
        id: 7,
        title: "استشهاد القديس داسيه الجُندي - 2 توت",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 1,
    },
    {
        id: 8,
        title: "اجتماع مجمع بمدينة الإسكندرية في عهد البابا ديونيسيوس بشأن خلود النفس - 3 توت",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 1,
    },
    {
        id: 9,
        title: "نياحة القديسة ثيئودورة التائبة - 3 توت",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 1,
    },
    {
        id: 10,
        title: "تذكار يشوع بن نون - 4 توت",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 1,
    },
    {
        id: 11,
        title: "نياحة البابا مكاريوس الثاني البطريرك التاسع والستون من بطاركة الكرازة المرقسية - 4 توت",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 1,
    },
    {
        id: 12,
        title: "نياحة القديسة فيرينا - 4 توت",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 1,
    },
    {
        id: 13,
        title: "استشهاد القديسة صوفيا - 5 توت",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 1,
    },
    {
        id: 14,
        title: "استشهاد إشعياء النبي بن آموص - 6 توت",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 1,
    },
    {
        id: 15,
        title: "استشهاد القديسة باشيلية أو باسيليا - 6 توت",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 1,
    },
    {
        id: 16,
        title: "نياحة البابا ديوسقوروس البطريرك الخامس والعشرين من بطاركة الكرازة المرقسية - 7 توت",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 1,
    },
    {
        id: 17,
        title: "نياحة البابا يوأنس الثاني عشر البطريرك الثالث والتسعين من بطاركة الكرازة المرقسية - 7 توت",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 1,
    },
    {
        id: 18,
        title: "استشهاد القديسة رفقة وأولادها الخمسة أغاثون وبطرس ويوحنا وآمون وآمونة - 7 توت",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 1,
    },
    {
        id: 19,
        title: "نياحة القديس سوريانوس أسقف جبلة - 7 توت",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 1,
    },
    {
        id: 20,
        title: "نياحة موسى النبي - 8 توت",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 1,
    },
    {
        id: 21,
        title: "استشهاد زكريا الكاهن - 8 توت",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 1,
    },
    {
        id: 22,
        title: "استشهاد القديس ديميدس القس - 8 توت",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 1,
    },
    {
        id: 23,
        title: "استشهاد الأب القديس الأنبا بيسورة الأسقف - 9 توت",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 1,
    },
    {
        id: 24,
        title: "استشهاد الأسقفين الجليلين بيلوس ونيليوس - 9 توت",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 1,
    },
    {
        id: 25,
        title: "استشهاد القديسين يوأنس المصري وزملائه - 10 توت",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 1,
    },
    {
        id: 26,
        title: "استشهاد القديسة مطرونة - 10 توت",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 1,
    },
    {
        id: 27,
        title: "تذكار استشهاد القديسة باسين وأولادها الثلاثة - 10 توت",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 1,
    },
    {
        id: 28,
        title: "استشهاد القديس واسيليدس الوزير - 11 توت",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 1,
    },
    {
        id: 29,
        title: "استشهاد الثلاثة فلاحين بإسنا - 11 توت",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 1,
    },
    {
        id: 30,
        title: "تذكار رئيس الملائكة الجليل ميخائيل - 12 توت",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 1,
    },
    {
        id: 31,
        title: "تذكار انعقاد المجمع المسكوني بأفسس - 12 توت",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 1,
    },
    {
        id: 32,
        title: "نقل أعضاء القديسين إقليمس وأصحابه - 12 توت",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 1,
    },
    {
        id: 33,
        title: "تذكار الأعجوبة التي صنعها القديس باسيليوس الكبير أسقف قيصارية الكبادوك - 13 توت",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 1,
    },
    {
        id: 34,
        title: "نياحة البابا متاؤس الثاني البطريرك التسعين من بطاركة الكرازة المرقسية - 13 توت",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 1,
    },
    {
        id: 35,
        title: "نياحة القديس أغاثون العمودي - 14 توت",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 1,
    },
    {
        id: 36,
        title: "استشهاد القديس فيلكس وريجولا أخته والقديس أكسيوبرانتيوس - 14 توت",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 1,
    },
    {
        id: 37,
        title: "نقل جسد القديس إسطفانوس - 15 توت",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 1,
    },
    {
        id: 38,
        title: "نياحة الأنبا أثناسيوس القوصي - 15 توت",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 1,
    },
    {
        id: 39,
        title: " تكريس كنيسة القيامة بأورشليم - 16 توت",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 1,
    },
    {
        id: 40,
        title: "تذكار الاحتفال بالصليب المجيد في كنيسة القيامة - 17 توت",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 1,
    },
    {
        id: 41,
        title: "استشهاد القديس قسطور القس - 17 توت",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 1,
    },
    {
        id: 42,
        title: "نياحة القديسة ثاؤغنسطا - 17 توت",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 1,
    },
    {
        id: 43,
        title: "نياحة القديس المعلم جرجس الجوهري - 17 توت",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 1,
    },
    {
        id: 44,
        title: "ثاني يوم عيد الصليب - 18 توت",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 1,
    },
    {
        id: 45,
        title: "استشهاد القديس بروفوريوس - 18 توت",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 1,
    },
    {
        id: 46,
        title: "استشهاد القديس إسطفانوس القس والقديسة نيكيتي - 18 توت",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 1,
    },
    {
        id: 47,
        title: "اليوم الثالث من أيام عيد الصليب المجيد - 19 توت",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 1,
    },
    {
        id: 48,
        title: "تذكار إصعاد القديس غريغوريوس الأرمني من الجب - 19 توت",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 1,
    },
    {
        id: 49,
        title: "نياحة القديسة ثاؤبستى - 20 توت",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 1,
    },
    {
        id: 50,
        title: "نياحة البابا أثناسيوس الثاني البطريرك الثامن والعشرين من بطاركة الكرازة المرقسية - 20 توت",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 1,
    },
    {
        id: 51,
        title: "استشهاد القديسة ملاتينى العذراء - 20 توت",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 1,
    },
    {
        id: 52,
        title: "تذكار والدة الإله القديسة مريم - 21 توت",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 1,
    },
    {
        id: 53,
        title: "استشهاد القديس كبريانوس الأسقف والقديسة يوستينة - 21 توت",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 1,
    },
    {
        id: 54,
        title: "استشهاد القديسين كوتلاس وأكسوا أخته وتاتاس صديقه - 22 توت",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 1,
    },
    {
        id: 55,
        title: "استشهاد القديس يوليوس الأقفهصى كاتب سِيَر الشهداء ومن معه - 22 توت",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 1,
    },
    {
        id: 56,
        title: "استشهاد القديسين أونانيوس وأندراوس أخيه - 23 توت",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 1,
    },
    {
        id: 57,
        title: "تذكار القديسة الشهيدة تكلا - 23 توت",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 1,
    },
    {
        id: 58,
        title: "استشهاد القديس كودارتوس أحد السبعين رسولاً وتلميذاً - 24 توت",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 1,
    },
    {
        id: 59,
        title: "نياحة القديس غريغوريوس الثيئولوغوس - 24 توت",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 1,
    },
    {
        id: 60,
        title: "نياحة القديس غريغوريوس الراهب - 24 توت",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 1,
    },
    {
        id: 61,
        title: "تذكار نياحة يونان النبي - 25 توت",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 1,
    },
    {
        id: 62,
        title: "استشهاد القديس موريس قائد الفرقة الطيبية - 25 توت",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 1,
    },
    {
        id: 63,
        title: "بشارة زكريا الكاهن بميلاد يوحنا المعمدان - 26 توت",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 1,
    },
    {
        id: 64,
        title: "استشهاد القديس أسطاثيوس وولديه وزوجته - 27 توت",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 1,
    },
    {
        id: 65,
        title: "استشهاد القديسين أبادير وإيرائى ( بعض المصادر تذكر اسم إيرينى بدلاً من إيرائى) أخته - 28 توت",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 1,
    },
    {
        id: 66,
        title: "تذكار الأعياد الثلاثة السيدية الكبرى - 29 توت",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 1,
    },
    {
        id: 67,
        title: "استشهاد القديسة أربسيما ومن معها - 29 توت",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 1,
    },
    {
        id: 68,
        title: "استشهاد القديسة فبرونيا - 29 توت",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 1,
    },
    {
        id: 69,
        title: "تذكار المعجزة التي صنعها الرب مع القديس أثناسيوس الرسولي - 30 توت",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 1,
    },
    {
        id: 70,
        title: "استشهاد القديسة أنسطاسيه - 1 بابه",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 2,
    },
    {
        id: 71,
        title: "تذكار مجيء القديس ساويرس بطريرك أنطاكية إلى مصر - 2 بابه",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 2,
    },
    {
        id: 72,
        title: "نياحة البابا سيمون الثاني البطريرك الحادي والخمسون من بطاركة الكرازة المرقسية - 3 بابه",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 2,
    },
    {
        id: 73,
        title: "استشهاد القديسين أورسوس وبقطر من الفرقة الطيبية - 3 بابه",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 2,
    },
    {
        id: 74,
        title: "استشهاد القديس يوحنا الجُندي الأشروبي - 3 بابه",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 2,
    },
    {
        id: 75,
        title: "نياحة القديسة ثيئودورا الملكة - 3 بابه",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 2,
    },
    {
        id: 76,
        title: "استشهاد القديس واخس رفيق القديس سرجيوس - 4 بابه",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 2,
    },
    {
        id: 77,
        title: "استشهاد القديس بولس بطريرك القسطنطينية - 5 بابه",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 2,
    },
    {
        id: 78,
        title: "نياحة الأنبا بطرس أسقف البهنسا - 5 بابه",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 2,
    },
    {
        id: 79,
        title: "نياحة الصديقة حَنَّة أم صموئيل النبي - 6 بابه",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 2,
    },
    {
        id: 80,
        title: "نياحة القديس الأنبا بولا الطموهي - 7 بابه",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 2,
    },
    {
        id: 81,
        title: "استشهاد القديس مطرا - 8 بابه",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 2,
    },
    {
        id: 82,
        title: "استشهاد القديسين أباهور وطوسيا وأولادهما - 8 بابه",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 2,
    },
    {
        id: 83,
        title: "نياحة القديس الأنبا أغاثون المتوحد - 8 بابه",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 2,
    },
    {
        id: 84,
        title: "نياحة البابا أومانيوس البطريرك السابع من بطاركة الكرازة المرقسية - 9 بابه",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 2,
    },
    {
        id: 85,
        title: "تذكار استشهاد القديس سمعان الأسقف ورفقائه - 9 بابه",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 2,
    },
    {
        id: 86,
        title: "استشهاد القديس سرجيوس رفيق واخس - 10 بابه",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 2,
    },
    {
        id: 87,
        title: "نياحة الأنبا يعقوب بطريرك أنطاكية - 11 بابه",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 2,
    },
    {
        id: 88,
        title: "نياحة القديسة بيلاجية التائبة - 11 بابه",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 2,
    },
    {
        id: 89,
        title: "تذكار رئيس الملائكة الجليل ميخائيل - 12 بابه",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 2,
    },
    {
        id: 90,
        title: "استشهاد القديس متى الإنجيلي المبشر - 12 بابه",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 2,
    },
    {
        id: 91,
        title: "نياحة البابا القديس ديمتريوس الكرام البطريرك الثاني عشر من بطاركة الكرازة المرقسية - 12 بابه",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 2,
    },
    {
        id: 92,
        title: "نياحة القديس زكريا الراهب - 13 بابه",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 2,
    },
    {
        id: 93,
        title: "نياحة القديس فيلبس أحد الشمامسة السبعة - 14 بابه",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 2,
    },
    {
        id: 94,
        title: "استشهاد بندلائيمون الطبيب - 15 بابه",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 2,
    },
    {
        id: 95,
        title: "نياحة القديس البابا الأنبا أغاثون، البطريرك التاسع والثلاثون من بطاركة الكرازة المرقسية - 16 بابه",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 2,
    },
    {
        id: 96,
        title: "تذكار القديسين كاربوس وأبولوس وبطرس - 16 بابه",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 2,
    },
    {
        id: 97,
        title: "نياحة البابا الأنبا ديوسقوروس الثاني البطريرك الحادي والثلاثين من بطاركة الكرازة المرقسية - 17 بابه",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 2,
    },
    {
        id: 98,
        title: "نياحة البابا القديس ثاؤفيلس البطريرك الثالث والعشرين من بطاركة الكرازة المرقسية - 18 بابه",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 2,
    },
    {
        id: 99,
        title: "استشهاد القديس ثاؤفيلس وزوجته بالفيوم - 19 بابه",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 2,
    },
    {
        id: 100,
        title: "عقد مجمع بأنطاكية لمحاكمة بولس الساموساطي - 19 بابه",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 2,
    },
    {
        id: 101,
        title: "نياحة القديس يوحنا القصير - 20 بابه",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 2,
    },
    {
        id: 102,
        title: "التذكار الشهري لوالدة الإله القديسة العذراء مريم - 21 بابه",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 2,
    },
    {
        id: 103,
        title: "نياحة يوئيل النبي - 21 بابه",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 2,
    },
    {
        id: 104,
        title: "نقل جسد لعازر حبيب الرب - 21 بابه",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 2,
    },
    {
        id: 105,
        title: "نياحة القديس الأنبا رويس - 21 بابه",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 2,
    },
    {
        id: 106,
        title: "استشهاد القديس لوقا الإنجيلي - 22 بابه",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 2,
    },
    {
        id: 107,
        title: "استشهاد القديس ديونيسيوس أسقف كورنثوس - 23 بابه",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 2,
    },
    {
        id: 108,
        title: "نياحة البابا يوساب الأول البطريرك الثاني والخمسين من بطاركة الكرازة المرقسية - 23 بابه",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 2,
    },
    {
        id: 109,
        title: "نياحة القديس إيلاريون الكبير الراهب - 24 بابه",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 2,
    },
    {
        id: 110,
        title: "استشهاد القديسين بولس ولُونجينوس ودينة - 24 بابه",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 2,
    },
    {
        id: 111,
        title: "نياحة القديس أبيب صديق القديس أبوللو - 25 بابه",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 2,
    },
    {
        id: 112,
        title: "تكريس كنيسة الشهيد يوليوس الأقفهصي كاتب سير الشهداء - 25 بابه",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 2,
    },
    {
        id: 113,
        title: "استشهاد القديس تيمون الرسول، أحد السبعين، وأحد الشمامسة السبعة - 26 بابه",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 2,
    },
    {
        id: 114,
        title: "تذكار السبعة الشهداء بجبل أنطونيوس - 26 بابه",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 2,
    },
    {
        id: 115,
        title: "استشهاد القديس مكاريوس أسقف قاو - 27 بابه",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 2,
    },
    {
        id: 116,
        title: "استشهاد القديسين مركيانوس ومركوريوس - 28 بابه",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 2,
    },
    {
        id: 117,
        title: 'تذكار الأعياد الثلاثة السيدية " البشارة والميلاد والقيامة " - 29 بابه',
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 2,
    },
    {
        id: 118,
        title: "استشهاد القديس ديمتريوس التسالونيكي - 29 بابه",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 2,
    },
    {
        id: 119,
        title: "نياحة البابا القديس غبريال السابع البطريرك الخامس والتسعين من بطاركة الكرازة المرقسية - 29 بابه",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 2,
    },
    {
        id: 120,
        title: "ظهور رأس القديس مار مرقس الإنجيلي الرسول، وتكريس كنيسته - 30 بابه",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 2,
    },
    {
        id: 121,
        title: "نياحة القديس إبراهيم المنوفي المتوحد - 30 بابه",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 2,
    },
    {
        id: 122,
        title: "استشهاد القديس كليوباس الرسول أحد تلميذي عمواس - 1 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 3,
    },
    {
        id: 123,
        title: "استشهاد القديس كيرياكوس أسقف أورشليم ووالدته - 1 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 3,
    },
    {
        id: 124,
        title: "استشهاد القديسين مكسيموس ونوميتيوس وبقطر وفيلبس - 1 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 3,
    },
    {
        id: 125,
        title: "استشهاد القديسة أنسطاسية الكبيرة، والقديس كيرلس - 1 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 3,
    },
    {
        id: 126,
        title: "نياحة البابا بطرس الثالث البطريرك السابع والعشرين من بطاركة الكرازة المرقسية - 2 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 3,
    },
    {
        id: 127,
        title: "استشهاد القديس مقار الليـبي - 2 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 3,
    },
    {
        id: 128,
        title: "نياحة القديس أفراميوس الرهاوى - 2 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 3,
    },
    {
        id: 129,
        title: "استشهاد القديس أثناسيوس وأخته إيرينى - 3 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 3,
    },
    {
        id: 130,
        title: "استشهاد القديس أغاثون - 3 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 3,
    },
    {
        id: 131,
        title: "نياحة القديس كيرياكوس من أهل كورنثوس - 3 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 3,
    },
    {
        id: 132,
        title: "استشهاد القديسين يوحنا ويعقوب أسقفيّ فارس - 4 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 3,
    },
    {
        id: 133,
        title: "استشهاد الأنبا توماس الأسقف - 4 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 3,
    },
    {
        id: 134,
        title: "استشهاد القديسَيْن أبيماخوس وعزاريانوس - 4 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 3,
    },
    {
        id: 135,
        title: "ظهور رأس القديس لُونجينوس الجُندي - 5 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 3,
    },
    {
        id: 136,
        title: "استشهاد القديس تيموثاوس وزوجته مورا - 5 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 3,
    },
    {
        id: 137,
        title: "نقل جسد الأمير تادرس الشُطبى إلى بلدة شُطب - 5 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 3,
    },
    {
        id: 138,
        title: "نياحة القديس يوساب بجبل شامة - 5 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 3,
    },
    {
        id: 139,
        title: "تذكار تكريس كنيسة القديسة العذراء – الأثرية – بدير المحرق العامر بجبل قسقام - 6 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 3,
    },
    {
        id: 140,
        title: "نياحة القديس فيلكس بابا رومية - 6 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 3,
    },
    {
        id: 141,
        title: "تكريس كنيسة الشهيد العظيم مار جرجس الروماني باللدّ - 7 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 3,
    },
    {
        id: 142,
        title: "استشهاد القديس مار جرجس الإسكندري - 7 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 3,
    },
    {
        id: 143,
        title: "استشهاد الأنبا نهروه - 7 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 3,
    },
    {
        id: 144,
        title: "استشهاد القديسين أكبسيما وإيتالا ويوسف - 7 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 3,
    },
    {
        id: 145,
        title: "نياحة القديس الأنبا مينا أسقف تمي الأمديد - 7 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 3,
    },
    {
        id: 146,
        title: "تذكار الأربعة مخلوقات الحية غير المتجسدين - 8 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 3,
    },
    {
        id: 147,
        title: "استشهاد القديس نيكاندروس كاهن ميرا - 8 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 3,
    },
    {
        id: 148,
        title: "نياحة الأب بيريّوس مدير مدرسة الإسكندرية اللاهوتية - 8 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 3,
    },
    {
        id: 149,
        title: "اجتماع مجمع نيقية المسكونى الأول - 9 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 3,
    },
    {
        id: 150,
        title: "نياحة البابا إسحاق البطريرك الحادي والأربعين من بطاركة الكرازة المرقسية - 9 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 3,
    },
    {
        id: 151,
        title: "استشهاد العذارى الخمسين وأمهن - 10 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 3,
    },
    {
        id: 152,
        title: "اجتماع مجمع بروما بسبب عيد الغطاس المجيد والصوم الكبير - 10 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 3,
    },
    {
        id: 153,
        title: "نياحة القديسة حَنّة والدة القديسة العذراء مريم - 11 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 3,
    },
    {
        id: 154,
        title: "استشهاد القديس ميخائيل الراهب - 11 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 3,
    },
    {
        id: 155,
        title: "استشهاد القديسَيْن أرشيلاؤس وأليشع القمص - 11 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 3,
    },
    {
        id: 156,
        title: "تذكار رئيس الملائكة الجليل ميخائيل رئيس جند الرب - 12 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 3,
    },
    {
        id: 157,
        title: "نياحة القديس يوحنا السرياني - 12 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 3,
    },
    {
        id: 158,
        title: "تذكار رئيس الملائكة الجليل جبرائيل - 13 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 3,
    },
    {
        id: 159,
        title: "نياحة البابا الأنبا زخارياس البطريرك الرابع والستين من بطاركة الكرازة المرقسية - 13 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 3,
    },
    {
        id: 160,
        title: "استشهاد القديس تادرس تيرو - 13 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 3,
    },
    {
        id: 161,
        title: "نياحة الأنبا تيموثاوس أسقف أنصنا - 13 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 3,
    },
    {
        id: 162,
        title: "نياحة الأنبا يوساب بجبل الأساس - 13 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 3,
    },
    {
        id: 163,
        title: "نياحة القديس مرتينوس أسقف ثراكي - 14 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 3,
    },
    {
        id: 164,
        title: "استشهاد الضابط فاروس ومعلّميه - 14 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 3,
    },
    {
        id: 165,
        title: "استشهاد القديس مار مينا العجائبى - 15 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 3,
    },
    {
        id: 166,
        title: "نياحة القديس يوحنا الربان - 15 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 3,
    },
    {
        id: 167,
        title: " بدء صوم الميلاد في كنيستنا القبطية الأرثوذكسية ( كانت مدة هذا الصوم أربعين يوماً، وأُضيفت إليه الثلاثة أيام التي صامها الإكليروس والشعب عند حدوث معجزة نقل جبل المقطم في عهد البابا أبرآم بن زرعة في القرن العاشر الميلادي، فأصبحت مدة الصوم 43 يوماً). - 16 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 3,
    },
    {
        id: 168,
        title: "تكريس كنيسة القديس أبى نُفر السائح - 16 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 3,
    },
    {
        id: 169,
        title: "استشهاد القديس يسطس الأسقف - 16 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 3,
    },
    {
        id: 170,
        title: "نياحة البابا مينا الثاني البطريرك الحادي والستين من بطاركة الكرازة المرقسية - 16 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 3,
    },
    {
        id: 171,
        title: "نياحة القديس نيلس السينائى - 16 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 3,
    },
    {
        id: 172,
        title: "نياحة القديس يوحنا ذهبي الفم - 17 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 3,
    },
    {
        id: 173,
        title: "نياحة القديس بولس بجبل دنفيق - 17 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 3,
    },
    {
        id: 174,
        title: "استشهاد القديس فيلبس الرسول - 18 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 3,
    },
    {
        id: 175,
        title: "استشهاد القديستين أدروسيس ويوأنا - 18 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 3,
    },
    {
        id: 176,
        title: "تذكار معجزة نقل الجبل المقطم - 18 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 3,
    },
    {
        id: 177,
        title: "تكريس كنيسة سرجيوس وواخس – بالرصافة - 19 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 3,
    },
    {
        id: 178,
        title: "استشهاد القديس أبيبوس - 19 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 3,
    },
    {
        id: 179,
        title: "نياحة القديس إنيانوس البطريرك الثاني من بطاركة الكرازة المرقسية - 20 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 3,
    },
    {
        id: 180,
        title: "تكريس بيعتي الأمير تادرس الشُطبى والأمير تادرس المشرقي - 20 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 3,
    },
    {
        id: 181,
        title: "تذكار نياحة القديسة مريم العذراء والدة الإله - 21 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 3,
    },
    {
        id: 182,
        title: "نياحة القديس غريغوريوس العجائبى - 21 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 3,
    },
    {
        id: 183,
        title: "نياحة البابا قسما الثاني البطريرك الرابع والخمسين من بطاركة الكرازة المرقسية - 21 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 3,
    },
    {
        id: 184,
        title: "نياحة القديس يوحنا التبايسي بجبل أسيوط - 21 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 3,
    },
    {
        id: 185,
        title: "تذكار القديسين حلفا وزكا ورومانوس ويوحنا الشهداء. وتذكار القديسين توما وبقطر وإسحاق من الأشمونين - 21 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 3,
    },
    {
        id: 186,
        title: "نقل جسد القديس الأنبا يحنس كاما من ديره إلى دير السريان - 21 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 3,
    },
    {
        id: 187,
        title: "استشهاد القديسين قزمان ودميان وإخوتهما وأمهما - 22 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 3,
    },
    {
        id: 188,
        title: "نياحة القديس كرنيليوس قائد المائة - 23 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 3,
    },
    {
        id: 189,
        title: "تذكار تكريس كنيسة القديسة مارينا الشهيدة - 23 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 3,
    },
    {
        id: 190,
        title: "تذكار الأربعة والعشرين قسيساً غير الجسدانيين - 24 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 3,
    },
    {
        id: 191,
        title: "استشهاد الأسقف نارسيس والقديسة تكلا - 24 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 3,
    },
    {
        id: 192,
        title: "نياحة البابا بروكلس بطريرك القسطنطينية - 24 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 3,
    },
    {
        id: 193,
        title: "استشهاد القديس مرقوريوس الشهير بأبي سيفين - 25 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 3,
    },
    {
        id: 194,
        title: "استشهاد القديس بالاريانوس وأخيه تيبورينوس - 26 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 3,
    },
    {
        id: 195,
        title: "نياحة القديس غريغوريوس النيصي أسقف نيصص - 26 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 3,
    },
    {
        id: 196,
        title: "استشهاد القديس يعقوب الفارسي المقطع - 27 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 3,
    },
    {
        id: 197,
        title: "تكريس كنيسة الشهيد بقطر بن رومانوس - 27 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 3,
    },
    {
        id: 198,
        title: "استشهاد القديس صرابامون أسقف نيقيوس - 28 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 3,
    },
    {
        id: 199,
        title: 'تذكار الأعياد الثلاثة السيدية الكبرى " البشارة والميلاد والقيامة " - 29 هاتور',
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 3,
    },
    {
        id: 200,
        title: 'استشهاد البابا بطرس " خاتم الشهداء " البطريرك السابع عشر من بطاركة الكرسي المرقسي - 29 هاتور',
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 3,
    },
    {
        id: 201,
        title: "استشهاد القديس إكليمنضس الأول بابا روما - 29 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 3,
    },
    {
        id: 202,
        title: "استشهاد القديسة كاترين الإسكندرانية - 29 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 3,
    },
    {
        id: 203,
        title: "استشهاد القديس مكاريوس - 30 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 3,
    },
    {
        id: 204,
        title: "استشهاد الراهب القديس يوحنا القليوبي - 30 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 3,
    },
    {
        id: 205,
        title: "نياحة القديس أكاكيوس بطريرك القسطنطينية - 30 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 3,
    },
    {
        id: 206,
        title: "تكريس بيعة القديسين قزمان ودميان وإخوتهما وأمهم - 30 هاتور",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 3,
    },
    {
        id: 207,
        title: "نياحة البابا يوأنس الثالث البطريرك الأربعين من بطاركة الكرازة المرقسية - 1 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 4,
    },
    {
        id: 208,
        title: "نياحة البابا أثناسيوس الثالث البطريرك السادس والسبعين من بطاركة الكرازة المرقسية - 1 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 4,
    },
    {
        id: 209,
        title: "نياحة القديس بطرس الرهاوي ( أسقف غزة ) - 1 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 4,
    },
    {
        id: 210,
        title: "تكريس كنيسة الشهيد أبى فام الجُندي الطحاوي ببلدة أبنوب - 1 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 4,
    },
    {
        id: 211,
        title: "تكريس كنيسة القديس العظيم الأنبا شنودة رئيس المتوحدين - 1 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 4,
    },
    {
        id: 212,
        title: "نياحة القديس أباهور الراهب - 2 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 4,
    },
    {
        id: 213,
        title: "نياحة القديس الأنبا هورمينا السائح - 2 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 4,
    },
    {
        id: 214,
        title: "تذكار تقديم القديسة العذراء مريم إلى الهيكل بأورشليم - 3 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 4,
    },
    {
        id: 215,
        title: " استشهاد القديس بسطفروس ( صليب الجديد ) - 3 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 4,
    },
    {
        id: 216,
        title: "استشهاد القديس أندراوس أحد الاثنى عشر رسولاً - 4 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 4,
    },
    {
        id: 217,
        title: "تذكار تكريس كنيسة القديس مار يوحنا الهرقلي بأم القصور بمنفلوط - 4 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 4,
    },
    {
        id: 218,
        title: "تذكار نقل جسديّ القديسين الأنبا بيشوي والأنبا بولا - 4 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 4,
    },
    {
        id: 219,
        title: "نياحة ناحوم النبي - 5 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 4,
    },
    {
        id: 220,
        title: "استشهاد القديس بقطر الذي من أسيوط - 5 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 4,
    },
    {
        id: 221,
        title: "استشهاد القديس إيسوذوروس - 5 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 4,
    },
    {
        id: 222,
        title: "نياحة البابا أبرآم بن زرعة البطريرك الثاني والستين من بطاركة الكرازة المرقسية - 6 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 4,
    },
    {
        id: 223,
        title: "استشهاد القديس باطلس القس - 6 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 4,
    },
    {
        id: 224,
        title: "نياحة القديس متاؤس الفاخوري بجبل أصفون بإسنا - 7 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 4,
    },
    {
        id: 225,
        title: "استشهاد القديسين بانينا وباناوا - 7 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 4,
    },
    {
        id: 226,
        title: "تذكار تكريس كنيسة الشهيد أبسخيرون القليني - 7 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 4,
    },
    {
        id: 227,
        title: "نياحة القديس يوحنا أسقف أرمنت - 7 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 4,
    },
    {
        id: 228,
        title: "استشهاد المهندس القبطي النابغة سعيد بن كاتب الفرغاني - 7 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 4,
    },
    {
        id: 229,
        title: "استشهاد القديس إيسي وتكلا أخته - 8 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 4,
    },
    {
        id: 230,
        title: "استشهاد القديستين بربارة ويوليانة - 8 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 4,
    },
    {
        id: 231,
        title: "نياحة القديس الأنبا صموئيل المعترف - 8 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 4,
    },
    {
        id: 232,
        title: "نياحة البابا ياروكلاس البطريرك الثالث عشر من بطاركة الكرازة المرقسية - 8 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 4,
    },
    {
        id: 234,
        title: "نياحة القديس بيمن المعترف - 9 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 4,
    },
    {
        id: 235,
        title: "نياحة القديس نيقولاوس أسقف مورا - 10 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 4,
    },
    {
        id: 236,
        title: "استشهاد القديس شورة من أهل أخميم - 10 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 4,
    },
    {
        id: 237,
        title: "تذكار نقل جسد القديس ساويرس بطريرك أنطاكية - 10 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 4,
    },
    {
        id: 238,
        title: "نياحة القديس الأنبا بيجيمي السائح - 11 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 4,
    },
    {
        id: 239,
        title: "استشهاد القديس أبطلماوس من أهل دندرة - 11 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 4,
    },
    {
        id: 240,
        title: "تذكار تكريس كنيسة القديس إقلاديوس بناحية باقور أبو تيج - 11 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 4,
    },
    {
        id: 241,
        title: "تذكار رئيس الملائكة الطاهر ميخائيل - 12 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 4,
    },
    {
        id: 242,
        title: "نياحة القديس الأنبا هدرا الأسواني - 12 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 4,
    },
    {
        id: 243,
        title: "نياحة القديس يوحنا المعترف - 12 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 4,
    },
    {
        id: 244,
        title: "انعقاد مجمع برومية على نوباطس القس - 12 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 4,
    },
    {
        id: 245,
        title: "تذكار تكريس كنيسة رئيس الملائكة الجليل رافائيل بالقسطنطينية - 13 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 4,
    },
    {
        id: 246,
        title: "استشهاد القديس برشنوفيوس الراهب - 13 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 4,
    },
    {
        id: 247,
        title: "نياحة البابا مرقس الثامن البطريرك المائة وثمانية من بطاركة الكرسي المرقسي - 13 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 4,
    },
    {
        id: 248,
        title: "نياحة الأب إبراكيوس - 13 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 4,
    },
    {
        id: 249,
        title: "نياحة القديس إيليا السائح - 13 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 4,
    },
    {
        id: 250,
        title: "تكريس كنيسة القديس ميصائيل السائح - 13 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 4,
    },
    {
        id: 251,
        title: "استشهاد القديس بهنام وسارة أخته - 14 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 4,
    },
    {
        id: 252,
        title: "استشهاد القديس الأنبا أمونيوس أسقف إسنا - 14 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 4,
    },
    {
        id: 253,
        title: "استشهاد القديسين سمعان المنوفي وأباهور وأبا مينا الشيخ - 14 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 4,
    },
    {
        id: 254,
        title: "نياحة البابا خرستوذولوس البطريرك السادس والستين من بطاركة الكرازة المرقسية - 14 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 4,
    },
    {
        id: 255,
        title: "نياحة القديس خرستوذولوس السائح - 14 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 4,
    },
    {
        id: 256,
        title: "نياحة القديس غريغوريوس بطريرك الأرمن - 15 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 4,
    },
    {
        id: 257,
        title: "نياحة القديس لوكاس العمودي - 15 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 4,
    },
    {
        id: 258,
        title: "نياحة القديس الأنبا حزقيال من أرمنت - 15 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 4,
    },
    {
        id: 259,
        title: "نياحة البار جدعون أحد قضاة بنى إسرائيل - 16 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 4,
    },
    {
        id: 260,
        title: "استشهاد القديسين هرواج وحنانيا وخوزى الذين من أخميم  - 16 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 4,
    },
    {
        id: 261,
        title: "استشهاد القديسين أولوجيوس وأرسانيوس صاحبيّ دير الحديد بأخميم - 16 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 4,
    },
    {
        id: 262,
        title: "استشهاد القديس إمساح القفطي - 16 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 4,
    },
    {
        id: 263,
        title: "تكريس كنيسة القديس يعقوب الفارسي الشهير بالمقطع - 16 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 4,
    },
    {
        id: 264,
        title: "تذكار نقل جسد القديس لوكاس العمودي - 17 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 4,
    },
    {
        id: 265,
        title: "نياحة القديس إيلياس بجبل بِشْوَاو ( جبل بشْوَاو قريب من جبل الأساس الذي من نقادة حتى الجبل الغربي تجاه القصر، بمحافظة قنا) - 17 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 4,
    },
    {
        id: 266,
        title: "نقل جسد القديس تيطس أسقف كريت إلى القسطنطينية - 18 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 4,
    },
    {
        id: 267,
        title: "استشهاد القديسين ياروكلاس وفليمون - 18 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 4,
    },
    {
        id: 268,
        title: "نياحة البابا غبريال السادس البطريرك الحادي والتسعين من بطاركة الكرازة المرقسية - 19 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 4,
    },
    {
        id: 269,
        title: "نياحة الأنبا يوحنا أسقف البُرلُّس – جامع السنكسار - 19 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 4,
    },
    {
        id: 270,
        title: "نياحة حَجِّي النبي - 20 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 4,
    },
    {
        id: 271,
        title: "استشهاد الأنبا إيلياس أسقف دير المحرق والقوصية - 20 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 4,
    },
    {
        id: 272,
        title: "تذكار والدة الإله القديسة الطاهرة مريم العذراء - 21 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 4,
    },
    {
        id: 273,
        title: "استشهاد القديس برنابا أحد السبعين رسولاً - 21 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 4,
    },
    {
        id: 274,
        title: "تذكار الملاك الجليل غبريال المُبشر - 22 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 4,
    },
    {
        id: 275,
        title: "استشهاد القديس باخوم وضالوشام أخته - 22 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 4,
    },
    {
        id: 276,
        title: "نياحة البابا أنسطاسيوس البطريرك السادس والثلاثين من بطاركة الكرازة المرقسية - 22 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 4,
    },
    {
        id: 277,
        title: "نياحة داود النبي والملك - 23 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 4,
    },
    {
        id: 278,
        title: "نياحة القديس تيموثاوس السائح - 23 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 4,
    },
    {
        id: 279,
        title: "استشهاد القديس أغناطيوس الثيئوفوروس ( ثيئوفوروس: كلمة تعنى حامل الإله أو المتوشح بالإله) أسقف أنطاكية - 24 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 4,
    },
    {
        id: 280,
        title: "نياحة القديس الأنبا يحنس كاما القس - 25 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 4,
    },
    {
        id: 281,
        title: "نياحة القديس الأنبا بشاي بجبل الطود - 25 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 4,
    },
    {
        id: 282,
        title: "استشهاد القديسة أنسطاسيه - 26 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 4,
    },
    {
        id: 283,
        title: "تكريس كنيسة الشهيدين أنبا بشاي وأنبا بطرس - 26 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 4,
    },
    {
        id: 284,
        title: "استشهاد القديس الأنبا بساده أسقف أبصاي - 27 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 4,
    },
    {
        id: 285,
        title: "برمون عيد الميلاد المجيد - 28 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 4,
    },
    {
        id: 286,
        title: "استشهاد 150 رجلاً، و24 امرأة من مدينة أنصنا - 28 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 4,
    },
    {
        id: 287,
        title: "عيد الميلاد المجيد - 29 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 4,
    },
    {
        id: 288,
        title: "تذكار شهداء أخميم - 29 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 4,
    },
    {
        id: 289,
        title: "نياحة القديس يوأنس قمص شيهيت - 30 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 4,
    },
    {
        id: 290,
        title: "سجود المجوس للمخلص - 30 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 4,
    },
    {
        id: 291,
        title: "استشهاد القديس القمص ميخائيل الطوخي - 30 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 4,
    },
    {
        id: 292,
        title: "استشهاد الطفل زكريا ومن معه بأخميم - 30 كيهك",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 4,
    },
    {
        id: 293,
        title: "استشهاد القديس إسطفانوس رئيس الشمامسة - 1 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 5,
    },
    {
        id: 294,
        title: "استشهاد القديس لاونديانوس - 1 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 5,
    },
    {
        id: 295,
        title: "استشهاد القديسين ديوسقوروس وأخيه سكلابيوس - 1 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 5,
    },
    {
        id: 296,
        title: "نياحة الأنبا ثاؤناس البطريرك السادس عشر من بطاركة الكرازة المرقسية - 2 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 5,
    },
    {
        id: 297,
        title: "استشهاد القديس غللينيكوس أسقف أوسيم - 2 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 5,
    },
    {
        id: 298,
        title: "نياحة القديس الأنبا يونا - 2 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 5,
    },
    {
        id: 299,
        title: "استشهاد أطفال بيت لحم - 3 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 5,
    },
    {
        id: 300,
        title: "نياحة القديس يوحنا الإنجيلي - 4 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 5,
    },
    {
        id: 301,
        title: "استشهاد القديس أوساغنيوس الجُندي - 5 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 5,
    },
    {
        id: 302,
        title: "استشهاد القديس بانيكاروس - 5 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 5,
    },
    {
        id: 303,
        title: "نياحة البابا ثيئودوسيوس الثاني البطريرك التاسع والسبعين من بطاركة الكرازة المرقسية - 5 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 5,
    },
    {
        id: 304,
        title: "نياحة البابا متاؤس الأول البطريرك السابع والثمانين من بطاركة الكرازة المرقسية - 5 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 5,
    },
    {
        id: 305,
        title: "عيد الختان المجيد - 6 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 5,
    },
    {
        id: 306,
        title: "تذكار صعود إيليا النبي إلى السماء حياً - 6 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 5,
    },
    {
        id: 307,
        title: "استشهاد الأربعة أراخنة بإسنا - 6 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 5,
    },
    {
        id: 308,
        title: "نياحة البابا مركيانوس البطريرك الثامن من بطاركة الكرازة المرقسية - 6 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 5,
    },
    {
        id: 309,
        title: "نياحة البابا مرقس البطريرك الثالث والسبعين من بطاركة الكرازة المرقسية - 6 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 5,
    },
    {
        id: 310,
        title: "نياحة البابا غبريال الثالث البطريرك السابع والسبعين من بطاركة الكرازة المرقسية - 6 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 5,
    },
    {
        id: 311,
        title: "نياحة القديس باسيليوس الكبير رئيس أساقفة قيصرية الكبادوك - 6 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 5,
    },
    {
        id: 312,
        title: "تكريس كنيسة الشهيد إسحاق الدفراوي - 6 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 5,
    },
    {
        id: 313,
        title: "نياحة القديس سلفستروس بابا روما - 7 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 5,
    },
    {
        id: 314,
        title: "عودة رأس القديس مار مرقس الرسول - 8 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 5,
    },
    {
        id: 315,
        title: "نياحة البابا أندرونيقوس البطريرك السابع والثلاثين من بطاركة الكرازة المرقسية - 8 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 5,
    },
    {
        id: 316,
        title: "نياحة البابا بنيامين الأول البطريرك الثامن والثلاثين من بطاركة الكرازة المرقسية - 8 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 5,
    },
    {
        id: 317,
        title: "نياحة البابا غبريال الخامس البطريرك الثامن والثمانين من بطاركة الكرازة المرقسية - 8 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 5,
    },
    {
        id: 318,
        title: "تذكار تكريس كنيسة القديس مكاريوس الكبير - 8 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 5,
    },
    {
        id: 319,
        title: "نياحة القديس أبرآم رفيق الأنبا جاورجي - 9 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 5,
    },
    {
        id: 320,
        title: "نياحة القديس أنبا فيس - 9 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 5,
    },
    {
        id: 321,
        title: "برمون عيد الغطاس المجيد - 10 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 5,
    },
    {
        id: 322,
        title: "نياحة القديس يسطس تلميذ الأنبا صموئيل المعترف - 10 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 5,
    },
    {
        id: 323,
        title: "عيد الظهور الإلهي ( الغطاس المجيد ) - 11 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 5,
    },
    {
        id: 324,
        title: "نياحة البابا يوأنس السادس البطريرك الرابع والسبعين من بطاركة الكرازة المرقسية - 11 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 5,
    },
    {
        id: 325,
        title: "نياحة البابا بنيامين الثاني البطريرك الثاني والثمانين من بطاركة الكرازة المرقسية - 11 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 5,
    },
    {
        id: 326,
        title: "ثاني أيام عيد الغطاس المجيد - 12 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 5,
    },
    {
        id: 327,
        title: "تذكار رئيس الملائكة الجليل ميخائيل - 12 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 5,
    },
    {
        id: 328,
        title: "استشهاد القديس تادرس المشرقي - 12 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 5,
    },
    {
        id: 329,
        title: "استشهاد القديس أناطوليوس - 12 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 5,
    },
    {
        id: 330,
        title: "عيد عرس قانا الجليل - 13 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 5,
    },
    {
        id: 331,
        title: "استشهاد القديسة دميانة - 13 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 5,
    },
    {
        id: 332,
        title: "نياحة القديس ثاؤفيلس الراهب - 13 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 5,
    },
    {
        id: 333,
        title: "نياحة القديس أرشليدس الراهب - 14 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 5,
    },
    {
        id: 334,
        title: "استشهاد القديسة مُهْراتي ( مُهْراتي: كان للقديسة مهراتي اسم آخر هو مُهْرابيل) - 14 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 5,
    },
    {
        id: 335,
        title: "نياحة القديس مكسيموس أخى دوماديوس - 14 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 5,
    },
    {
        id: 336,
        title: "نياحة عوبديا النبي - 15 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 5,
    },
    {
        id: 337,
        title: "استشهاد القديس فيلوثيئوس - 16 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 5,
    },
    {
        id: 338,
        title: "نياحة البابا يوأنس الرابع البطريرك الثامن والأربعين من بطاركة الكرازة المرقسية - 16 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 5,
    },
    {
        id: 339,
        title: "نياحة القديس دوماديوس أخي القديس مكسيموس - 17 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 5,
    },
    {
        id: 340,
        title: "نياحة القديس الأنبا يوساب الأبحّ أسقف جرجا - 17 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 5,
    },
    {
        id: 341,
        title: "نياحة القديس يعقوب أسقف نصيبين - 18 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 5,
    },
    {
        id: 342,
        title: "تذكار مريم ومرثا أختيّ لعازر الحبيب - 18 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 5,
    },
    {
        id: 343,
        title: "نياحة الأنبا أندراس الشهير بـ ( أبو الليف ) - 18 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 5,
    },
    {
        id: 344,
        title: "اكتشاف أعضاء القديسين أباهور وبيسوري وأمبيرة أمهما - 19 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 5,
    },
    {
        id: 345,
        title: "نياحة القديس بروخورس أحد السبعين رسولاً - 20 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 5,
    },
    {
        id: 346,
        title: "استشهاد القديس أبا كلوج القس - 20 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 5,
    },
    {
        id: 347,
        title: "استشهاد القديس بهناو - 20 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 5,
    },
    {
        id: 348,
        title: "تذكار تكريس كنيسة القديس يوحنا صاحب الإنجيل الذهب - 20 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 5,
    },
    {
        id: 349,
        title: "نياحة والدة الإله القديسة مريم العذراء - 21 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 5,
    },
    {
        id: 350,
        title: "نياحة القديسة إيلارية ابنة الملك زينون - 21 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 5,
    },
    {
        id: 351,
        title: "نياحة القديس العظيم الأنبا أنطونيوس أب جميع الرهبان - 22 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 5,
    },
    {
        id: 352,
        title: "استشهاد القديس تيموثاوس تلميذ القديس بولس الرسول وأسقف أفسس - 23 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 5,
    },
    {
        id: 353,
        title: "نياحة البابا كيرلس الرابع أبى الإصلاح البطريرك المائة والعاشر من بطاركة الكرازة المرقسية - 23 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 5,
    },
    {
        id: 354,
        title: "نياحة القديسة مريم الحبيسة الناسكة - 24 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 5,
    },
    {
        id: 355,
        title: "استشهاد القديس بساده القس - 24 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 5,
    },
    {
        id: 356,
        title: "نياحة القديس بطرس العابد - 25 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 5,
    },
    {
        id: 357,
        title: "استشهاد القديس أسكلاس - 25 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 5,
    },
    {
        id: 358,
        title: "استشهاد التسعة والأربعين شهيداً شيوخ شيهيت - 26 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 5,
    },
    {
        id: 359,
        title: "استشهاد القديس بجوش - 26 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 5,
    },
    {
        id: 360,
        title: "نياحة القديسة أنسطاسية - 26 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 5,
    },
    {
        id: 361,
        title: "تذكار رئيس الملائكة الجليل سوريال - 27 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 5,
    },
    {
        id: 362,
        title: "استشهاد القديس أبى فام الجُندي الأوسيمي - 27 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 5,
    },
    {
        id: 363,
        title: "استشهاد القديس سيرابيون - 27 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 5,
    },
    {
        id: 364,
        title: "تذكار نقل جسد القديس تيموثاوس تلميذ معلمنا القديس بولس الرسول - 27 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 5,
    },
    {
        id: 365,
        title: "استشهاد القديس الأنبا كاؤو - 28 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 5,
    },
    {
        id: 366,
        title: "استشهاد القديس إكليمنضس أسقف أنقرة - 28 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 5,
    },
    {
        id: 367,
        title: "استشهاد القديس فيلياس أسقف تمي الأمديد - 28 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 5,
    },
    {
        id: 368,
        title: "نياحة القديسة أكساني - 29 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 5,
    },
    {
        id: 369,
        title: "نياحة القديس سرياكوس المجاهد - 29 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 5,
    },
    {
        id: 370,
        title: "استشهاد العذارى القديسات بيستيس وهلبيس وأغابى ونياحة أمهن صوفية - 30 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 5,
    },
    {
        id: 371,
        title: "نياحة البابا مينا الأول البطريرك السابع والأربعين من بطاركة الكرازة المرقسية - 30 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 5,
    },
    {
        id: 372,
        title: "نياحة القديس إبراهيم الرهاوي المتوحد - 30 طوبه",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 5,
    },
    {
        id: 373,
        title: "تذكار اجتماع المجمع المسكوني الثاني بمدينة القسطنطينية - 1 امشير",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 6,
    },
    {
        id: 374,
        title: "استشهاد القديس أباديون أسقف أنصنا - 1 امشير",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 6,
    },
    {
        id: 375,
        title: "تكريس كنيسة القديس بطرس خاتم الشهداء بمدينة الإسكندرية - 1 امشير",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 6,
    },
    {
        id: 376,
        title: "نياحة القديس العظيم الأنبا بولا أول السواح - 2 امشير",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 6,
    },
    {
        id: 377,
        title: "نياحة القديس لُونجينوس رئيس دير الزجاج - 2 امشير",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 6,
    },
    {
        id: 378,
        title: "نياحة القديس يعقوب الراهب - 3 امشير",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 6,
    },
    {
        id: 379,
        title: "نياحة القديس هدرا بحاجر بنهدب - 3 امشير",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 6,
    },
    {
        id: 380,
        title: "استشهاد القديس أغابوس أحد السبعين رسولاً - 4 امشير",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 6,
    },
    {
        id: 381,
        title: "تذكار نقل أعضاء التسعة والأربعين شهيداً شيوخ شيهيت - 5 امشير",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 6,
    },
    {
        id: 382,
        title: "نياحة البابا أغريبينوس البطريرك العاشر من بطاركة الكرازة المرقسية - 5 امشير",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 6,
    },
    {
        id: 383,
        title: "نياحة القديس الأنبا بشاي صاحب الدير الأحمر - 5 امشير",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 6,
    },
    {
        id: 384,
        title: "نياحة الأنبا أبوللو رفيق القديس الأنبا أبيب من قديسي القرن الرابع الميلادي - 5 امشير",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 6,
    },
    {
        id: 385,
        title: "استشهاد القديس أبوليدس بابا روما - 5 امشير",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 6,
    },
    {
        id: 386,
        title: "نياحة القديس أبانوب صاحب المروحة الذهب - 5 امشير",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 6,
    },
    {
        id: 387,
        title: "استشهاد القديسين أباكير ويوحنا والثلاث عذارى وأمهن - 6 امشير",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 6,
    },
    {
        id: 388,
        title: "نياحة البابا مرقس الرابع البطريرك الرابع والثمانين من بطاركة الكرازة المرقسية - 6 امشير",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 6,
    },
    {
        id: 389,
        title: "نياحة القديس زانوفيوس - 6 امشير",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 6,
    },
    {
        id: 390,
        title: "نياحة البابا القديس ألكسندروس الثاني البطريرك الثالث والأربعين من بطاركة الكرازة المرقسية - 7 امشير",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 6,
    },
    {
        id: 391,
        title: "نياحة البابا القديس ثيئودوروس الأول البطريرك الخامس والأربعين من بطاركة الكرازة المرقسية - 7 امشير",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 6,
    },
    {
        id: 392,
        title: "عيد دخول السيد المسيح إلى الهيكل - 8 امشير",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 6,
    },
    {
        id: 393,
        title: "نياحة القديس سمعان الشيخ - 8 امشير",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 6,
    },
    {
        id: 394,
        title: "نياحة القديس برسوما أب رهبان السريان - 9 امشير",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 6,
    },
    {
        id: 395,
        title: "استشهاد القديس بولس السرياني - 9 امشير",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 6,
    },
    {
        id: 396,
        title: "استشهاد القديس سمعان - 9 امشير",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 6,
    },
    {
        id: 397,
        title: "نياحة القديسة إفروسينا - 9 امشير",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 6,
    },
    {
        id: 398,
        title: "استشهاد القديس فيلو أسقف فارس - 10 امشير",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 6,
    },
    {
        id: 399,
        title: "استشهاد القديس يسطس ابن الملك نوماريوس - 10 امشير",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 6,
    },
    {
        id: 400,
        title: "نياحة القديس إيسوذوروس الفَرمِي - 10 امشير",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 6,
    },
    {
        id: 401,
        title: "نياحة البابا القديس يوأنس الثالث عشر البطريرك الرابع والتسعين من بطاركة الكرازة المرقسية - 11 امشير",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 6,
    },
    {
        id: 402,
        title: "استشهاد القديس فابيانوس بابا روما - 11 امشير",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 6,
    },
    {
        id: 403,
        title: "تذكار رئيس الملائكة الجليل ميخائيل - 12 امشير",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 6,
    },
    {
        id: 404,
        title: "نياحة القديس جلاسيوس الناسك - 12 امشير",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 6,
    },
    {
        id: 405,
        title: "استشهاد القديس سرجيوس الأتريبي وأبيه وأمه وأخته وكثيرين معهم - 13 امشير",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 6,
    },
    {
        id: 406,
        title: "نياحة البابا القديس تيموثاوس الثالث البطريرك الثاني والثلاثين من بطاركة الكرازة المرقسية - 13 امشير",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 6,
    },
    {
        id: 407,
        title: "نياحة القديس ساويرس بطريرك أنطاكية - 14 امشير",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 6,
    },
    {
        id: 408,
        title: "نياحة البابا القديس يعقوب البطريرك الخمسين من بطاركة الكرازة المرقسية - 14 امشير",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 6,
    },
    {
        id: 409,
        title: "نياحة القديس بفنوتيوس الراهب - 15 امشير",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 6,
    },
    {
        id: 410,
        title: "استشهاد الصديق زكريا النبي بن بَرَخِيَّا بن عِدُّو - 15 امشير",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 6,
    },
    {
        id: 411,
        title: "استشهاد القديس أنبا بيجول القس - 15 امشير",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 6,
    },
    {
        id: 412,
        title: "تكريس أول كنيسة للأربعين شهيداً الذين استشهدوا في سبسطية - 15 امشير",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 6,
    },
    {
        id: 413,
        title: "نياحة القديسة أليصابات أم القديس يوحنا المعمدان - 16 امشير",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 6,
    },
    {
        id: 414,
        title: "نياحة البابا القديس ميخائيل الثالث البطريرك الثاني والتسعين من بطاركة الكرازة المرقسية - 16 امشير",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 6,
    },
    {
        id: 415,
        title: "نياحة القديس القمص ميخائيل البحيري المحرقي - 16 امشير",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 6,
    },
    {
        id: 416,
        title: "استشهاد القديس مينا الراهب - 17 امشير",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 6,
    },
    {
        id: 417,
        title: "تكريس كنيسة القديس قسطور البردنوهي - 17 امشير",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 6,
    },
    {
        id: 418,
        title: "نياحة القديس ملاتيوس المعترف بطريرك أنطاكية - 18 امشير",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 6,
    },
    {
        id: 419,
        title: "تدشين كنيسة القديس بولس البسيط - 18 امشير",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 6,
    },
    {
        id: 420,
        title: "تذكار نقل أعضاء القديس مرتيانوس الراهب إلى أنطاكية - 19 امشير",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 6,
    },
    {
        id: 421,
        title: "نياحة البابا القديس بطرس الثاني البطريرك الحادي والعشرين من بطاركة الكرازة المرقسية - 20 امشير",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 6,
    },
    {
        id: 422,
        title: "استشهاد القديسين باسيليوس وثاؤدروس وتيموثاوس بالإسكندرية - 20 امشير",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 6,
    },
    {
        id: 423,
        title: "تذكار القديسة العذراء مريم والدة الإله - 21 امشير",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 6,
    },
    {
        id: 424,
        title: "استشهاد القديس أُنسيموس تلميذ القديس بولس الرسول - 21 امشير",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 6,
    },
    {
        id: 425,
        title: "نياحة البابا القديس غبريال الأول البطريرك السابع والخمسين من بطاركة الكرازة المرقسية - 21 امشير",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 6,
    },
    {
        id: 426,
        title: "نياحة القديس زخارياس أسقف سخا - 21 امشير",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 6,
    },
    {
        id: 427,
        title: "نياحة القديس ماروتا أسقف ميافرقين ( ميافرقين:من بلاد ما بين النهرين شمالي نصيبين) - 22 امشير",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 6,
    },
    {
        id: 428,
        title: "استشهاد القديس أوسابيوس ابن القديس واسيليدس الوزير - 23 امشير",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 6,
    },
    {
        id: 429,
        title: "نياحة القديس أغابيطوس الأسقف - 24 امشير",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 6,
    },
    {
        id: 430,
        title: "استشهاد القديسين تيموثاوس بمدينة غزة ومتياس بمدينة قوص - 24 امشير",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 6,
    },
    {
        id: 431,
        title: "استشهاد القديسين فليمون وأبفية وأرخِبُّس ابنهما - 25 امشير",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 6,
    },
    {
        id: 432,
        title: "استشهاد القديس قونا بمدينة روما. ( أو الشماس قزماس بروما ) - 25 امشير",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 6,
    },
    {
        id: 433,
        title: "استشهاد القديس مينا بمدينة قوص - 25 امشير",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 6,
    },
    {
        id: 434,
        title: "نياحة القديس أبو فانا بجبل دلجا - 25 امشير",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 6,
    },
    {
        id: 435,
        title: "نياحة الصِّدِّيق هوشع النبي - 26 امشير",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 6,
    },
    {
        id: 436,
        title: "استشهاد القديس صادوق والمائة والثمانية والعشرين الذين معه - 26 امشير",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 6,
    },
    {
        id: 437,
        title: "استشهاد الأسقفين تيرانيوس وسلوانس والكاهن زينوبيوس ورفاقهم في مدينة صور - 26 امشير",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 6,
    },
    {
        id: 438,
        title: "نياحة القديس أوسطاسيوس بطريرك أنطاكية - 27 امشير",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 6,
    },
    {
        id: 439,
        title: "استشهاد القديسة بِرْبِتْوَا ومَنْ معها - 27 امشير",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 6,
    },
    {
        id: 440,
        title: "نقل أعضاء القديس تاوضروس ( تادرس ) المشرقي الشهيد - 28 امشير",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 6,
    },
    {
        id: 441,
        title: "استشهاد القديس بوليكاربوس أسقف سميرنا - 29 امشير",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 6,
    },
    {
        id: 442,
        title: "وجود رأس القديس يوحنا المعمدان - 30 امشير",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 6,
    },
    {
        id: 443,
        title: "نياحة القديس البابا كيرلس السادس البطريرك المائة والسادس عشر من بطاركة الكرازة المرقسية - 30 امشير",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 6,
    },
    {
        id: 444,
        title: "استشهاد القديسين مقرونيوس وتكلا - 1 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 7,
    },
    {
        id: 445,
        title: "استشهاد القديس ألكسندروس الجندي - 1 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 7,
    },
    {
        id: 446,
        title: "نياحة القديس نركيسوس أسقف بيت المقدس - 1 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 7,
    },
    {
        id: 447,
        title: "نياحة القديس مرقورة الأسقف - 1 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 7,
    },
    {
        id: 448,
        title: "نياحة الراهب جرجس بن العميد الشهير بابن المكين - 1 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 7,
    },
    {
        id: 449,
        title: "استشهاد القديس الأنبا مكراوى الأسقف - 2 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 7,
    },
    {
        id: 450,
        title: "نياحة القديس الأنبا قسما البطريرك الثامن والخمسين من بطاركة الكرازة المرقسية - 3 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 7,
    },
    {
        id: 451,
        title: "استشهاد القديس برفونيوس - 3 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 7,
    },
    {
        id: 452,
        title: "نياحة القديس برفوريوس أسقف غزة  - 3 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 7,
    },
    {
        id: 453,
        title: "نياحة القديس الأنبا حديد القس - 3 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 7,
    },
    {
        id: 454,
        title: "انعقاد مجمع، بجزيرة بني عمر، على قوم يُطلق عليهم الأربعتعشرية، بخصوص القيامة المقدسة - 4 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 7,
    },
    {
        id: 455,
        title: "استشهاد القديس هانوليوس الأمير - 4 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 7,
    },
    {
        id: 456,
        title: "نياحة القديس الأنبا صرابامون قمص دير القديس الأنبا يحنس القصير (أحد الأديرة المندثرة ببرية شيهيت) - 5 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 7,
    },
    {
        id: 457,
        title: "استشهاد القديسة أوذوكسية - 5 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 7,
    },
    {
        id: 458,
        title: "استشهاد القديس ديوسقوروس في زمان العرب - 6 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 7,
    },
    {
        id: 459,
        title: "نياحة القديس ثاؤدوطس الأسقف المعترف - 6 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 7,
    },
    {
        id: 460,
        title: "استشهاد القديسين فليمون وأبلانيوس - 7 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 7,
    },
    {
        id: 461,
        title: "استشهاد القديسة مريم الإسرائيلية - 7 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 7,
    },
    {
        id: 462,
        title: "استشهاد القديس متياس الرسول - 8 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 7,
    },
    {
        id: 463,
        title: "نياحة القديس البابا يوليانوس البطريرك الحادي عشر من بطاركة الكرازة المرقسية - 8 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 7,
    },
    {
        id: 464,
        title: "استشهاد القديس أريانوس والي أنصنا - 8 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 7,
    },
    {
        id: 465,
        title: "نياحة القديس كونن المعترف - 9 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 7,
    },
    {
        id: 466,
        title: "استشهاد القديسين أندريانوس ومرثا زوجته وأوسابيوس وأرما وأربعين شهيداً - 9 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 7,
    },
    {
        id: 467,
        title: "تذكار ظهور الصليب المجيد - 10 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 7,
    },
    {
        id: 468,
        title: "استشهاد القديس ( باسيلاوس ) باسيليوس أسقف أورشليم - 11 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 7,
    },
    {
        id: 469,
        title: "نياحة القديس نرسيس أسقف أورشليم - 11 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 7,
    },
    {
        id: 470,
        title: "تذكار رئيس الملائكة الطاهر ميخائيل - 12 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 7,
    },
    {
        id: 471,
        title: "ظهور بتولية البابا ديمتريوس الكرَّام البطريرك الثاني عشر من بطاركة الكرازة المرقسية - 12 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 7,
    },
    {
        id: 472,
        title: "استشهاد القديس ملاخي بأرض فلسطين - 12 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 7,
    },
    {
        id: 473,
        title: "استشهاد القديس جلاذينوس في دمشق - 12 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 7,
    },
    {
        id: 474,
        title: "استشهاد الأربعين شهيداً بسبسطية - 13 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 7,
    },
    {
        id: 475,
        title: "نياحة القديس البابا ديونيسيوس البطريرك الرابع عشر من بطاركة الكرازة المرقسية - 13 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 7,
    },
    {
        id: 476,
        title: "تذكار عودة القديسين مكاريوس الكبير ومكاريوس الإسكندري من منفاهما - 13 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 7,
    },
    {
        id: 477,
        title: "استشهاد الأساقفة أوجانيوس وأغانورس ووالنديوس - 14 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 7,
    },
    {
        id: 478,
        title: "استشهاد القديس شنوده البهنساوي - 14 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 7,
    },
    {
        id: 479,
        title: "نياحة القديسة سارة الراهبة - 15 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 7,
    },
    {
        id: 480,
        title: "استشهاد القديس إيلياس الإهناسى - 15 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 7,
    },
    {
        id: 481,
        title: "ظهور القديسة العذراء مريم بكنيسة الشهيدة دميانة بحي بابا دوبلو بشبرا – القاهرة - 16 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 7,
    },
    {
        id: 482,
        title: "نياحة القديس البابا خائيل الأول البطريرك السادس والأربعين من بطاركة الكرازة المرقسية - 16 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 7,
    },
    {
        id: 483,
        title: "نياحة لعازر حبيب الرب - 17 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 7,
    },
    {
        id: 484,
        title: "استشهاد القديس سيدهم بشاي بدمياط - 17 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 7,
    },
    {
        id: 485,
        title: "نياحة القديس الأنبا باسيليوس مطران القدس - 17 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 7,
    },
    {
        id: 486,
        title: "تذكار القديسين جرجس العابد وبلاسيوس الشهيد والأنبا يوسف الأسقف - 17 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 7,
    },
    {
        id: 487,
        title: "استشهاد القديس إيسوذوروس رفيق سنا الجندي - 18 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 7,
    },
    {
        id: 488,
        title: "استشهاد القديس أرسطوبولس الرسول أحد السبعين رسولاً - 19 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 7,
    },
    {
        id: 489,
        title: "استشهاد القديسين ألكسندروس وأغابيوس ومن معهما - 19 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 7,
    },
    {
        id: 490,
        title: "نياحة القديس البابا خائيل الثالث البطريرك السادس والخمسين من بطاركة الكرازة المرقسية - 20 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 7,
    },
    {
        id: 491,
        title: "تذكار إقامة لعازر حبيب الرب من الموت - 20 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 7,
    },
    {
        id: 492,
        title: "تذكار والدة الإله القديسة الطاهرة مريم العذراء - 21 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 7,
    },
    {
        id: 493,
        title: "دخول المخلص بيت عنيا، وتشاور عظماء الكهنة على قتل لعازر الصديق الذي أقامه الرب - 21 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 7,
    },
    {
        id: 494,
        title: "استشهاد القديسين تاؤدوروس وتيموثاوس - 21 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 7,
    },
    {
        id: 495,
        title: "نياحة القديس كيرلس أسقف أورشليم - 22 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 7,
    },
    {
        id: 496,
        title: "نياحة البار يوسف الرامي - 22 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 7,
    },
    {
        id: 497,
        title: "نياحة القديس ميخائيل أسقف نقادة - 22 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 7,
    },
    {
        id: 498,
        title: "نياحة الصديق العظيم دانيال النبي - 23 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 7,
    },
    {
        id: 499,
        title: "تذكار ظهور القديسة العذراء مريم بكنيستها بالزيتون - 24 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 7,
    },
    {
        id: 500,
        title: "نياحة القديس البابا مكاريوس الأول البطريرك التاسع والخمسين من بطاركة الكرازة المرقسية - 24 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 7,
    },
    {
        id: 501,
        title: "نياحة القديس فريسكا أحد السبعين رسولاً - 25 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 7,
    },
    {
        id: 502,
        title: "استشهاد القديس أنيسيفورس أحد السبعين رسولاً - 25 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 7,
    },
    {
        id: 503,
        title: "نياحة القديس البابا متاؤس الثالث البطريرك المائة من بطاركة الكرازة المرقسية - 25 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 7,
    },
    {
        id: 504,
        title: "نياحة القديسة براكسيا العذراء - 26 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 7,
    },
    {
        id: 505,
        title: "نياحة القديس البابا بطرس السادس البطريرك المائة والرابع من بطاركة الكرازة المرقسية - 26 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 7,
    },
    {
        id: 506,
        title: "صلب ربنا يسوع المسيح بالجسد من أجل خلاص العالم - 27 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 7,
    },
    {
        id: 507,
        title: "نياحة القديس مكاريوس الكبير أب رهبان برية شيهيت - 27 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 7,
    },
    {
        id: 508,
        title: "استشهاد القديس دوميكيوس - 27 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 7,
    },
    {
        id: 509,
        title: "نياحة الإمبراطور قسطنطين الكبير - 28 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 7,
    },
    {
        id: 510,
        title: "نياحة القديس البابا بطرس السابع البطريرك المائة والتاسع من بطاركة الكرازة المرقسية - 28 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 7,
    },
    {
        id: 511,
        title: "نياحة القديس الأنبا صرابامون الشهير بأبي طرحة - 28 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 7,
    },
    {
        id: 512,
        title: "عيد البشارة المجيد - 29 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 7,
    },
    {
        id: 513,
        title: "تذكار قيامة السيد المسيح من الأموات - 29 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 7,
    },
    {
        id: 514,
        title: "تذكار رئيس الملائكة جبرائيل المبشر - 30 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 7,
    },
    {
        id: 515,
        title: "نياحة شمشون، أحد قضاة بني إسرائيل - 30 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 7,
    },
    {
        id: 516,
        title: "تذكار نقل أعضاء القديس يعقوب الفارسي الشهير بالمقطَّع - 30 برمهات",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 7,
    },
    {
        id: 517,
        title: "نياحة القديس سلوانس الراهب - 1 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 8,
    },
    {
        id: 518,
        title: "نياحة هارون الكاهن - 1 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 8,
    },
    {
        id: 519,
        title: "تذكار غارة عُربان الصعيد على برية شيهيت - 1 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 8,
    },
    {
        id: 520,
        title: "استشهاد القديس خرستوفورس - 2 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 8,
    },
    {
        id: 521,
        title: "نياحة القديس البابا يوأنس التاسع البطريرك الحادي والثمانين من بطاركة الكرازة المرقسية - 2 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 8,
    },
    {
        id: 522,
        title: "نياحة القديس البابا ميخائيل الثاني البطريرك الحادي والسبعين من بطاركة الكرازة المرقسية - 3 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 8,
    },
    {
        id: 523,
        title: "نياحة القديس يوحنا أسقف أورشليم - 3 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 8,
    },
    {
        id: 524,
        title: "شهادة القديسين بقطر وأكاكيوس وداكيوس وإيريني العذراء ومن معهم من رجال ونساء وعذارى - 4 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 8,
    },
    {
        id: 525,
        title: "نياحة القديس أوكين - 4 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 8,
    },
    {
        id: 526,
        title: "استشهاد النبي حزقيال بن بوزي - 5 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 8,
    },
    {
        id: 527,
        title: "استشهاد القديس هيباتيوس أسقف غنغرة - 5 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 8,
    },
    {
        id: 528,
        title: "تذكار نياحة القديسة مريم المصرية السائحة - 6 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 8,
    },
    {
        id: 529,
        title: "نياحة الصديق يواقيم والد القديسة العذراء مريم - 7 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 8,
    },
    {
        id: 530,
        title: "نياحة القديس مقروفيوس - 7 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 8,
    },
    {
        id: 531,
        title: "استشهاد القديسين أغابيوس وثيئودورة - 7 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 8,
    },
    {
        id: 532,
        title: "استشهاد العذارى القديسات أغابي وإيريني وشيونيه - 8 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 8,
    },
    {
        id: 533,
        title: "استشهاد المائة والخمسين مؤمناً على يد ملك الفرس - 8 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 8,
    },
    {
        id: 534,
        title: "نياحة القديس الأنبا زوسيما القس - 9 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 8,
    },
    {
        id: 535,
        title: "تذكار الأعجوبة التي صُنعَت على يد القديس البابا شنوده الأول البطريرك الخامس والخمسين - 9 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 8,
    },
    {
        id: 536,
        title: "نياحة الأنبا إيساك تلميذ الأنبا أبُلوس - 10 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 8,
    },
    {
        id: 537,
        title: "نياحة القديس البابا غبريال الثاني البطريرك السبعين الشهير بابن تريك - 10 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 8,
    },
    {
        id: 538,
        title: "نياحة القديسة ثيئودورا - 11 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 8,
    },
    {
        id: 539,
        title: "نياحة القديس يوحنا أسقف غزة - 11 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 8,
    },
    {
        id: 540,
        title: "تذكار رئيس الملائكة الجليل ميخائيل - 12 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 8,
    },
    {
        id: 541,
        title: "نياحة القديس ألكسندروس المعترف أسقف أورشليم - 12 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 8,
    },
    {
        id: 542,
        title: "نياحة القديس أنطونيوس أسقف طمويه - 12 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 8,
    },
    {
        id: 543,
        title: "استشهاد القديسين يشوع ويوسف - 13 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 8,
    },
    {
        id: 544,
        title: "نياحة القديس البابا يوأنس السابع عشر البطريرك الخامس بعد المائة من بطاركة الكرازة المرقسية - 13 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 8,
    },
    {
        id: 545,
        title: "نياحة القديسة ديونيسة - 13 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 8,
    },
    {
        id: 546,
        title: "استشهاد القديس ميديوس الشهيد - 13 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 8,
    },
    {
        id: 547,
        title: "نياحة القديس البابا مكسيموس البطريرك الخامس عشر من بطاركة الكرازة المرقسية - 14 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 8,
    },
    {
        id: 548,
        title: "نياحة القديس إهرون السرياني - 14 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 8,
    },
    {
        id: 549,
        title: "تكريس كنيسة القديس أغابوس أحد السبعين - 15 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 8,
    },
    {
        id: 550,
        title: "استشهاد القديسة ألكسندرة الملكة - 15 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 8,
    },
    {
        id: 551,
        title: "نياحة القديس البابا مرقس السادس البطريرك الأول بعد المائة من بطاركة الكرازة المرقسية - 15 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 8,
    },
    {
        id: 552,
        title: "استشهاد القديس أنتيباس أسقف برغامس تلميذ القديس يوحنا الرسول - 16 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 8,
    },
    {
        id: 553,
        title: "تذكار إصعاد أخنوخ البار حياً إلى السماء - 16 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 8,
    },
    {
        id: 554,
        title: "استشهاد القديس يعقوب الكبير أحد الاثني عشر رسولاً وشقيق يوحنا الحبيب - 17 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 8,
    },
    {
        id: 555,
        title: "نياحة القديس نيقوديموس - 17 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 8,
    },
    {
        id: 556,
        title: "استشهاد القديس أرسانيوس تلميذ القديس سوسنيوس - 18 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 8,
    },
    {
        id: 557,
        title: "نياحة القديس أبوللو تلميذ القديس الأنبا صموئيل المعترف - 18 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 8,
    },
    {
        id: 558,
        title: "استشهاد القديس سمعان الأرمني أسقف بلاد فارس - 19 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 8,
    },
    {
        id: 559,
        title: "استشهاد الشهداء يوحنا أبو نجاح الكبير والرئيس أبو العلا فهد بن إبراهيم وزملائهما - 19 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 8,
    },
    {
        id: 560,
        title: "استشهاد الراهب داود بن غبريال البرجي - 19 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 8,
    },
    {
        id: 561,
        title: "استشهاد القديس ببنوده الذي من دندرة (دندرة: قرية كبيرة تقع غرب مدينة قنا) - 20 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 8,
    },
    {
        id: 562,
        title: "تذكار القديسة العذراء مريم والدة الإله - 21 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 8,
    },
    {
        id: 563,
        title: "نياحة القديس بروتاؤس أسقف أثينا - 21 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 8,
    },
    {
        id: 564,
        title: "نياحة القديس البابا ألكسندروس الأول البطريرك التاسع عشر من بطاركة الكرازة المرقسية - 22 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 8,
    },
    {
        id: 565,
        title: "نياحة القديس البابا مرقس الثاني البطريرك التاسع والأربعين من بطاركة الكرازة المرقسية - 22 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 8,
    },
    {
        id: 566,
        title: "نياحة القديس البابا خائيل الثاني البطريرك الثالث والخمسين من بطاركة الكرازة المرقسية - 22 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 8,
    },
    {
        id: 567,
        title: "نياحة القديس إسحاق الهوريني - 22 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 8,
    },
    {
        id: 568,
        title: "شهادة القديس جورجيوس العظيم في الشهداء - 23 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 8,
    },
    {
        id: 569,
        title: "استشهاد القديس سنا الجندي رفيق القديس إيسوذوروس - 24 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 8,
    },
    {
        id: 570,
        title: "نياحة القديس البابا شنوده الأول البطريرك الخامس والخمسين من بطاركة الكرازة المرقسية - 24 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 8,
    },
    {
        id: 571,
        title: "استشهاد القديسة سارة وولديها - 25 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 8,
    },
    {
        id: 572,
        title: "استشهاد القديس تاوضروس العابد والمائة والعشرين شهيداً - 25 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 8,
    },
    {
        id: 573,
        title: "شهادة القديس سوسنيوس ومعه 1100 شخصاً - 26 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 8,
    },
    {
        id: 574,
        title: "نياحة القديس البابا يوأنس السابع البطريرك الثامن والسبعين من بطاركة الكرازة المرقسية - 26 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 8,
    },
    {
        id: 575,
        title: "شهادة القديس بقطر بن رومانوس - 27 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 8,
    },
    {
        id: 576,
        title: "استشهاد القديس ميليوس الناسك - 28 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 8,
    },
    {
        id: 577,
        title: "تذكار الأعياد السيدية البشارة والميلاد والقيامة - 29 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 8,
    },
    {
        id: 578,
        title: "نياحة القديس أرسطوس أحد السبعين - 29 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 8,
    },
    {
        id: 579,
        title: "نياحة القديس أكاكيوس أسقف أورشليم - 29 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 8,
    },
    {
        id: 580,
        title: "استشهاد القديس مار مرقس الرسول الإنجيلي كاروز الديار المصرية - 30 برمودة",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 8,
    },
    {
        id: 581,
        title: "ميلاد البتول العذراء مريم والدة الإله - 1 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 9,
    },
    {
        id: 582,
        title: "نياحة أيوب الصديق - 2 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 9,
    },
    {
        id: 583,
        title: "نياحة القديس تادرس الطبانيسي تلميذ القديس باخوميوس أب الشركة - 2 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 9,
    },
    {
        id: 584,
        title: "استشهاد القديس فيلوثاوس من درنكة - 2 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 9,
    },
    {
        id: 585,
        title: "نياحة القديس ياسون أحد السبعين رسولاً - 3 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 9,
    },
    {
        id: 586,
        title: "استشهاد القديس أوتيموس القس من فوه - 3 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 9,
    },
    {
        id: 587,
        title: "نياحة القديس البابا غبريال الرابع البطريرك السادس والثمانين من بطاركة الكرازة المرقسية - 3 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 9,
    },
    {
        id: 588,
        title: "نياحة القديس البابا يوأنس الأول البطريرك التاسع والعشرين من بطاركة الكرازة المرقسية - 4 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 9,
    },
    {
        id: 589,
        title: "نياحة القديس البابا يوأنس الخامس البطريرك الثاني والسبعين من بطاركة الكرازة المرقسية - 4 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 9,
    },
    {
        id: 590,
        title: "استشهاد إرميا النبي - 5 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 9,
    },
    {
        id: 591,
        title: "استشهاد القديس إسحاق الدفراوي - 6 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 9,
    },
    {
        id: 592,
        title: "استشهاد الأم دولاجي وأولادها الأربعة - 6 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 9,
    },
    {
        id: 593,
        title: "استشهاد الأنبا ببنوده من البندارة - 6 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 9,
    },
    {
        id: 594,
        title: "نياحة القديس مكاريوس الإسكندري - 6 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 9,
    },
    {
        id: 595,
        title: "نياحة القديس العظيم البابا أثناسيوس الرسولي البطريرك العشرين من بطاركة الكرازة المرقسية - 7 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 9,
    },
    {
        id: 596,
        title: "تذكار صعود ربنا يسوع المسيح إلى السماء - 8 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 9,
    },
    {
        id: 597,
        title: "استشهاد القديس يحنس السنهوتي - 8 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 9,
    },
    {
        id: 598,
        title: "نياحة القديس الأنبا دانيال قمص برية شيهيت - 8 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 9,
    },
    {
        id: 599,
        title: "نياحة القديسة هيلانة الملكة - 9 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 9,
    },
    {
        id: 600,
        title: "نياحة القديس البابا يوأنس الحادي عشر البطريرك التاسع والثمانين من بطاركة الكرازة المرقسية - 9 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 9,
    },
    {
        id: 601,
        title: "نياحة القديس البابا غبريال الثامن البطريرك السابع والتسعين من بطاركة الكرازة المرقسية - 9 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 9,
    },
    {
        id: 602,
        title: "إلقاء الثلاثة فتية القديسين حنانيا وعزاريا وميصائيل في أتون النار.(مخطوط 295 ميامر دير السريان وتذكر المصادر أن تاريخ نياحتهم 14 هاتور) - 10 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 9,
    },
    {
        id: 603,
        title: "تذكار نياحة القديس الأنبا بفنوتيوس الأسقف - 11 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 9,
    },
    {
        id: 604,
        title: "تذكار استشهاد القديسة ثاؤكليا زوجة القديس يسطس ابن الملك نوماريوس - 11 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 9,
    },
    {
        id: 605,
        title: "تذكار رئيس الملائكة الجليل ميخائيل - 12 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 9,
    },
    {
        id: 606,
        title: "تذكار نقل أعضاء القديس يوحنا ذهبي الفم - 12 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 9,
    },
    {
        id: 607,
        title: "تذكار ظهور صليب من نور فوق الجلجثة - 12 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 9,
    },
    {
        id: 608,
        title: "تذكار نياحة القديس البابا مرقس السابع البطريرك السادس بعد المائة من بطاركة الكرازة المرقسية - 12 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 9,
    },
    {
        id: 609,
        title: "تذكار استشهاد الْمُعَلِّم ملطي - 12 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 9,
    },
    {
        id: 610,
        title: "تذكار تكريس كنيسة الشهيدة دميانة - 12 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 9,
    },
    {
        id: 611,
        title: "نياحة القديس أرسانيوس معلم أولاد الملوك - 13 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 9,
    },
    {
        id: 612,
        title: "استشهاد القديس أبا بيجول الجندي - 13 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 9,
    },
    {
        id: 613,
        title: "نياحة القديس الأنبا باخوميوس أب الشركة الرهبانية - 14 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 9,
    },
    {
        id: 614,
        title: "استشهاد القديس أبيماخوس الفرمي - 14 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 9,
    },
    {
        id: 615,
        title: "استشهاد القديس سمعان الغيور القانوي أحد الاثنى عشر - 15 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 9,
    },
    {
        id: 616,
        title: "استشهاد أربعمائة شهيد بدندرة على اسم السيد المسيح - 15 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 9,
    },
    {
        id: 617,
        title: "تذكار الشماس مينا المتوحد - 15 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 9,
    },
    {
        id: 618,
        title: "نياحة الشيخ شمس الرئاسة أبي البركات الشهير بابن كبر - 15 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 9,
    },
    {
        id: 619,
        title: "تكريس كنيسة القديس يوحنا الإنجيلي بمدينة الإسكندرية - 16 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 9,
    },
    {
        id: 620,
        title: "تذكار نياحة القديس إبيفانيوس أسقف قبرص - 17 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 9,
    },
    {
        id: 621,
        title: "تذكار عيد العنصرة - 18 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 9,
    },
    {
        id: 622,
        title: "نياحة القديس جورجى رفيق القديس أبرآم - 18 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 9,
    },
    {
        id: 623,
        title: "نياحة القديس إسحاق قس القلالى - 19 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 9,
    },
    {
        id: 624,
        title: "استشهاد القديس إيسوذوروس الأنطاكي - 19 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 9,
    },
    {
        id: 625,
        title: "استشهاد الجنود الستة الذين رافقوا الأمير إقلاديوس الشهيد - 20 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 9,
    },
    {
        id: 626,
        title: "نياحة القديس الأنبا أمونيوس المتوحد بجبل تونة - 20 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 9,
    },
    {
        id: 627,
        title: "التذكار الشهري للقديسة العذراء مريم والدة الإله - 21 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 9,
    },
    {
        id: 628,
        title: "نياحة القديس مارتينيانوس - 21 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 9,
    },
    {
        id: 629,
        title: "نياحة القديس أندرونيقوس أحد السبعين - 22 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 9,
    },
    {
        id: 630,
        title: "استشهاد 142 صبياً، 28 سيدة - 22 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 9,
    },
    {
        id: 631,
        title: "نياحة القديس آمون مؤسس برية نتريا - 22 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 9,
    },
    {
        id: 632,
        title: "نياحة القديس يونياس أحد السبعين - 23 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 9,
    },
    {
        id: 633,
        title: "شهادة القديسة تكلا أثناء محاكمة الأمير إقلاديوس - 23 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 9,
    },
    {
        id: 634,
        title: "نياحة القديس بوتامون المعترف - 23 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 9,
    },
    {
        id: 635,
        title: "شهادة القديس يوليانوس وأمه بالإسكندرية - 23 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 9,
    },
    {
        id: 636,
        title: "تذكار مجيء السيد المسيح إلى أرض مصر - 24 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 9,
    },
    {
        id: 637,
        title: "نياحة حبقوق النبي - 24 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 9,
    },
    {
        id: 638,
        title: "استشهاد الراهب القديس شتوفا المقاري ( بشنونة ) - 24 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 9,
    },
    {
        id: 639,
        title: "استشهاد القديس قلتة الأنصناوي الطبيب - 25 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 9,
    },
    {
        id: 640,
        title: "نياحة الأرخن الكريم المعلم إبراهيم الجوهري - 25 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 9,
    },
    {
        id: 641,
        title: "استشهاد القديس توما أحد الاثني عشر رسولاً - 26 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 9,
    },
    {
        id: 642,
        title: "نياحة القديس لعازر حبيب الرب - 27 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 9,
    },
    {
        id: 643,
        title: "نياحة القديس الأنبا توماس السائح بجبل شنشيف - 27 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 9,
    },
    {
        id: 644,
        title: "نياحة القديس البابا يوأنس الثاني البطريرك الثلاثين من بطاركة الكرازة المرقسية - 27 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 9,
    },
    {
        id: 645,
        title: "تذكار نقل جسد القديس إبيفانيوس أسقف قبرص - 28 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 9,
    },
    {
        id: 646,
        title: "تذكار الأعياد السيدية البشارة والميلاد والقيامة - 29 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 9,
    },
    {
        id: 647,
        title: "نياحة القديس سمعان العمودي - 29 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 9,
    },
    {
        id: 648,
        title: "نياحة القديس فورس الرسول أحد السبعين - 30 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 9,
    },
    {
        id: 649,
        title: "نياحة القديس البابا ميخائيل الأول البطريرك الثامن والستين من بطاركة الكرازة المرقسية - 30 بشنس",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 9,
    },
    {
        id: 650,
        title: "نياحة القديس كاربوس أحد السبعين - 1 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 10,
    },
    {
        id: 651,
        title: "استشهاد القديس أبي فام الطحاوي الجُندي - 1 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 10,
    },
    {
        id: 652,
        title: "استشهاد القديس قزمان الطحاوي ورفقته - 1 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 10,
    },
    {
        id: 653,
        title: "تكريس كنيسة القديس لاونديوس الشامي - 1 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 10,
    },
    {
        id: 654,
        title: "ظهور جسديّ القديس يوحنا المعمدان وأليشع النبي - 2 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 10,
    },
    {
        id: 655,
        title: "نياحة القديس البابا يوأنس الثامن عشر البطريرك السابع بعد المائة من بطاركة الكرازة المرقسية - 2 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 10,
    },
    {
        id: 656,
        title: "استشهاد القديس اللاديوس الأسقف - 3 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 10,
    },
    {
        id: 657,
        title: "نياحة القديس الأنبا أبرآم أسقف الفيوم والجيزة - 3 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 10,
    },
    {
        id: 658,
        title: "نياحة القديسة مرثا المصرية الناسكة - 3 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 10,
    },
    {
        id: 659,
        title: "استشهاد القديس سينوسيوس - 4 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 10,
    },
    {
        id: 660,
        title: "استشهاد القديس يوحنا الهرقلي - 4 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 10,
    },
    {
        id: 661,
        title: "استشهاد القديس الأنبا آمون والبارة صوفية - 4 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 10,
    },
    {
        id: 662,
        title: "نياحة القديس أباهور - 4 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 10,
    },
    {
        id: 663,
        title: "نياحة القديس البابا يوأنس الثامن البطريرك الثمانين من بطاركة الكرازة المرقسية - 4 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 10,
    },
    {
        id: 664,
        title: "نياحة القديس يعقوب المشرقي المعترف - 5 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 10,
    },
    {
        id: 665,
        title: "استشهاد القديس بيفام - 5 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 10,
    },
    {
        id: 666,
        title: "استشهاد القديس بشاي وبطرس - 5 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 10,
    },
    {
        id: 667,
        title: "تكريس كنيسة القديس بقطر بناحية شو - 5 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 10,
    },
    {
        id: 668,
        title: "استشهاد القديس ثيئودوروس الراهب - 6 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 10,
    },
    {
        id: 669,
        title: "نياحة القديس ديديموس الضرير - 6 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 10,
    },
    {
        id: 670,
        title: "استشهاد القديس أبسخيرون الجندي القلينى - 7 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 10,
    },
    {
        id: 671,
        title: "نياحة القديس مويسيس بجبل أخميم - 7 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 10,
    },
    {
        id: 672,
        title: "تكريس كنيسة الأنبا متاؤس الفاخورى بجبل إسنا - 7 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 10,
    },
    {
        id: 673,
        title: "تذكار تكريس كنيسة السيدة العذراء المعروفة بالمحمَّة (المحمة: مسطرد حالياً، قرب القاهرة) - 8 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 10,
    },
    {
        id: 674,
        title: "استشهاد القديس جرجس الجديد - 8 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 10,
    },
    {
        id: 675,
        title: "تذكار القديسة تمادا وأولادها وأرمانوس وأمه - 8 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 10,
    },
    {
        id: 676,
        title: "نياحة القديس صموئيل النبي - 9 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 10,
    },
    {
        id: 677,
        title: "استشهاد القديس لوكيليانوس وأربعة آخرين معه - 9 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 10,
    },
    {
        id: 678,
        title: "استشهاد القديسين أبامون وسرنا - 9 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 10,
    },
    {
        id: 679,
        title: "نقل أعضاء الشهيد مرقوريوس أبى سيفين إلى مصر - 9 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 10,
    },
    {
        id: 680,
        title: "استشهاد القديس القس مكسي الشنراوي - 10 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 10,
    },
    {
        id: 681,
        title: "استشهاد القديسة دابامون وأختها بصطامون وأمهما صوفية - 10 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 10,
    },
    {
        id: 682,
        title: "تذكار فتح الكنائس - 10 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 10,
    },
    {
        id: 683,
        title: "نياحة القديس البابا يوأنس السادس عشر البطريرك 103 من بطاركة الكرازة المرقسية - 10 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 10,
    },
    {
        id: 684,
        title: "استشهاد القديس إقلاديوس - 11 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 10,
    },
    {
        id: 685,
        title: "تذكار تكريس هيكل الأربعين شهيداً بكنيسة إبسوتير ( المخلص ) بالإسكندرية - 11 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 10,
    },
    {
        id: 686,
        title: "تذكار رئيس الملائكة ميخائيل - 12 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 10,
    },
    {
        id: 687,
        title: "نياحة القديسة أوفيمية - 12 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 10,
    },
    {
        id: 688,
        title: "نياحة القديس البابا يسطس البطريرك السادس من بطاركة الكرازة المرقسية - 12 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 10,
    },
    {
        id: 689,
        title: "نياحة القديس البابا كيرلس الثاني البطريرك السابع والستين من بطاركة الكرازة المرقسية - 12 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 10,
    },
    {
        id: 690,
        title: "تذكار رئيس الملائكة جبرائيل المبشر - 13 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 10,
    },
    {
        id: 691,
        title: "نياحة القديس يوحنا أسقف أورشليم - 13 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 10,
    },
    {
        id: 692,
        title: "استشهاد القديسين أباكير وفيلبس ويوحنا وأبطلماوس - 14 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 10,
    },
    {
        id: 693,
        title: "نياحة القديس البابا يوأنس التاسع عشر البطريرك الثالث عشر بعد المائة من بطاركة الكرازة المرقسية - 14 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 10,
    },
    {
        id: 694,
        title: "تكريس كنيسة الشهيد مار مينا العجائبي بمريوط - 15 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 10,
    },
    {
        id: 695,
        title: "استلام جسد مار مرقس - 15 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 10,
    },
    {
        id: 696,
        title: "نياحة القديس أبى نوفر السائح - 16 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 10,
    },
    {
        id: 697,
        title: "نياحة القديس لاتصون البهنساوي - 17 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 10,
    },
    {
        id: 698,
        title: "عودة رفات القديس مار مرقس إلى الكاتدرائية المرقسية الجديدة - 17 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 10,
    },
    {
        id: 699,
        title: "نياحة القديس البابا داميانوس البطريرك الخامس والثلاثين من بطاركة الكرازة المرقسية - 18 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 10,
    },
    {
        id: 700,
        title: "افتتاح الكاتدرائية الجديدة بدير الأنبا رويس بالقاهرة - 18 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 10,
    },
    {
        id: 701,
        title: "استشهاد القديس جرجس المزاحم - 19 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 10,
    },
    {
        id: 702,
        title: "استشهاد القديس بشاي أنوب - 19 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 10,
    },
    {
        id: 703,
        title: "نياحة البابا أرشيلاؤس البطريرك الثامن عشر من بطاركة الكرازة المرقسية - 19 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 10,
    },
    {
        id: 704,
        title: "وضع جسد القديس مار مرقس الرسول بالمزار المخصص له بكنيسته بدير الأنبا رويس - 19 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 10,
    },
    {
        id: 705,
        title: "نياحة القديس أليشع النبي - 20 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 10,
    },
    {
        id: 706,
        title: "تكريس كنيسة القديس أباكلوج القس - 20 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 10,
    },
    {
        id: 707,
        title: "استشهاد القديس إقلاديوس - 21 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 10,
    },
    {
        id: 708,
        title: "تذكار تكريس هيكل الأربعين شهيداً بكنيسة إبسوتير ( المخلص ) بالإسكندرية - 21 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 10,
    },
    {
        id: 709,
        title: "تكريس كنيسة الشهيدين قزمان ودميان وإخوتهما وأمهما - 22 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 10,
    },
    {
        id: 710,
        title: "نياحة القديس أبانوب المعترف - 23 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 10,
    },
    {
        id: 711,
        title: "استشهاد القديس الأنبا موسى الأسود - 24 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 10,
    },
    {
        id: 712,
        title: "نياحة القديس إيسوذوروس قس الإسقيط - 24 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 10,
    },
    {
        id: 713,
        title: "نياحة القديس البابا بطرس الرابع البطريرك الرابع والثلاثين من بطاركة الكرازة المرقسية - 25 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 10,
    },
    {
        id: 714,
        title: "تكريس كنيسة الملاك غبريال بجبل النقلون بالفيوم - 26 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 10,
    },
    {
        id: 715,
        title: "استشهاد القديس حنانيا الرسول - 27 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 10,
    },
    {
        id: 716,
        title: "استشهاد القديس توماس الذي من شندلات - 27 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 10,
    },
    {
        id: 717,
        title: "نياحة القديس يوحنا بن الأبح - 27 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 10,
    },
    {
        id: 718,
        title: "نياحة القديس البابا ثاؤدوسيوس البطريرك الثالث والثلاثين من بطاركة الكرازة المرقسية - 28 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 10,
    },
    {
        id: 719,
        title: "تذكار تكريس كنيسة الأنبا صرابامون أسقف نيقيوس - 28 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 10,
    },
    {
        id: 720,
        title: "تذكار الأعياد السيدية البشارة والميلاد والقيامة - 29 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 10,
    },
    {
        id: 721,
        title: "استشهاد السبعة نساك بجبل تونة - 29 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 10,
    },
    {
        id: 722,
        title: "استشهاد القديسين أباهور وديودورة أمه - 29 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 10,
    },
    {
        id: 723,
        title: "ميلاد القديس يوحنا المعمدان - 30 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 10,
    },
    {
        id: 724,
        title: "نياحة القديس البابا قسما الأول البطريرك الرابع والأربعين من بطاركة الكرازة المرقسية - 30 بؤونة",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 10,
    },
    {
        id: 725,
        title: "استشهاد القديسة أفرونيا الناسكة - 1 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 11,
    },
    {
        id: 726,
        title: "نياحة القديسين بيوخا وتيابان القسيسين - 1 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 11,
    },
    {
        id: 727,
        title: "تكريس كنيسة الشهيد مار مينا بجبل أبنوب - 1 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 11,
    },
    {
        id: 728,
        title: "استشهاد القديس يهوذا الرسول ( لباوس الملقب تداوس ) - 2 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 11,
    },
    {
        id: 729,
        title: "نياحة القديس البابا كيرلس الأول البطريرك الرابع والعشرين من بطاركة الكرازة المرقسية - 3 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 11,
    },
    {
        id: 730,
        title: "نياحة القديس كلستينوس بابا روما - 3 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 11,
    },
    {
        id: 731,
        title: "تذكار نقل أعضاء الشهيدين أباكير ويوجنا - 4 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 11,
    },
    {
        id: 732,
        title: "استشهاد القديسين بطرس وبولس - 5 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 11,
    },
    {
        id: 733,
        title: "استشهاد القديس مرقس والي البرلس، والد القديسة دميانة - 5 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 11,
    },
    {
        id: 734,
        title: "استشهاد القديس أولمباس أحد السبعين تلميذاً - 6 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 11,
    },
    {
        id: 735,
        title: "استشهاد القديسة ثاؤدوسية ومن معها - 6 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 11,
    },
    {
        id: 736,
        title: "نياحة القديس العظيم الأنبا شنوده رئيس المتوحدين - 7 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 11,
    },
    {
        id: 737,
        title: "نياحة القديس الأنبا بيشوي - 8 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 11,
    },
    {
        id: 738,
        title: "استشهاد القديسين أبيرؤوه وأثوم - 8 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 11,
    },
    {
        id: 739,
        title: "استشهاد القديس بلانا القس - 8 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 11,
    },
    {
        id: 740,
        title: "استشهاد القديس بيمانون - 8 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 11,
    },
    {
        id: 741,
        title: "نياحة القديس الأنبا كاراس السائح - 8 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 11,
    },
    {
        id: 742,
        title: "نياحة القديس مرقس الأنطوني - 8 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 11,
    },
    {
        id: 743,
        title: "استشهاد القديس سمعان بن حلفي أسقف أورشليم - 9 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 11,
    },
    {
        id: 744,
        title: "نياحة القديس البابا كلاوديانوس البطريرك التاسع من بطاركة الكرازة المرقسية - 9 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 11,
    },
    {
        id: 745,
        title: "استشهاد القديس ثاؤدوروس أسقف الخمس مدن الغربية - 10 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 11,
    },
    {
        id: 746,
        title: "استشهاد القديس ثاؤدوروس أسقف كورنثوس ومن معه - 10 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 11,
    },
    {
        id: 747,
        title: "استشهاد القديسين يوحنا وسمعان ابن عمه - 11 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 11,
    },
    {
        id: 748,
        title: "نياحة القديس العظيم الأنبا إشعياء الإسقيطى - 11 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 11,
    },
    {
        id: 749,
        title: "تذكار رئيس الملائكة الجليل ميخائيل رئيس جند الرب - 12 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 11,
    },
    {
        id: 750,
        title: "استشهاد القديس أباهور السرياقوسي - 12 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 11,
    },
    {
        id: 751,
        title: "نياحة القديس الأنبا شيشوي الكبير - 12 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 11,
    },
    {
        id: 752,
        title: "نياحة القديس بسنتاؤس أسقف قفط - 13 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 11,
    },
    {
        id: 753,
        title: "استشهاد القديس أبامون الطوخى - 13 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 11,
    },
    {
        id: 754,
        title: "استشهاد القديس شنوده في أوائل حكم العرب - 13 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 11,
    },
    {
        id: 755,
        title: "استشهاد القديس بروكونيوس - 14 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 11,
    },
    {
        id: 756,
        title: "نياحة القديس البابا بطرس الخامس البطريرك الثالث والثمانين من بطاركة الكرازة المرقسية - 14 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 11,
    },
    {
        id: 757,
        title: "نياحة القديس مار أفرام السرياني - 15 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 11,
    },
    {
        id: 758,
        title: "استشهاد القديسين كيرياكوس ويوليطة أمه - 15 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 11,
    },
    {
        id: 759,
        title: "استشهاد القديس أوروسيوس - 15 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 11,
    },
    {
        id: 760,
        title: "نياحة القديس يوحنا صاحب الإنجيل الذهب - 16 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 11,
    },
    {
        id: 761,
        title: "وضع جسد الشهيد مار جرجس الروماني بكنيسته بمصر القديمة - 16 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 11,
    },
    {
        id: 762,
        title: "تكريس بيعة الشهيد فيلوثيئوس - 16 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 11,
    },
    {
        id: 763,
        title: "استشهاد القديسة أوفيمية - 17 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 11,
    },
    {
        id: 764,
        title: "استشهاد القديستين تكلا ومرثا من إسنا - 17 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 11,
    },
    {
        id: 765,
        title: "استشهاد القديس يعقوب الرسول أخي الرب - 18 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 11,
    },
    {
        id: 766,
        title: "استشهاد القديسين الأنبا بضابا أسقف قفط وأنبا أندراوس وأنبا خرستوذولوس - 19 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 11,
    },
    {
        id: 767,
        title: "استشهاد شهداء مذبحة إسنا - 19 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 11,
    },
    {
        id: 768,
        title: "استشهاد القديس بطلون الطبيب - 19 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 11,
    },
    {
        id: 769,
        title: "نياحة القديس البابا يوأنس العاشر البطريرك الخامس والثمانين من بطاركة الكرازة المر - 19 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 11,
    },
    {
        id: 770,
        title: "استشهاد القديس تادرس الشُطبي - 20 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 11,
    },
    {
        id: 771,
        title: "تذكار القديسة العذراء مريم - 21 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 11,
    },
    {
        id: 772,
        title: "نياحة القديس سوسنيوس الخصي - 21 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 11,
    },
    {
        id: 773,
        title: "استشهاد القديس مكاريوس بن واسيليدس الوزير - 22 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 11,
    },
    {
        id: 774,
        title: "استشهاد القديس لاونديوس - 22 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 11,
    },
    {
        id: 775,
        title: "استشهاد القديس لونجينوس القائد - 23 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 11,
    },
    {
        id: 776,
        title: "استشهاد القديسة مارينا - 23 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 11,
    },
    {
        id: 777,
        title: "استشهاد القديس أبانوب النهيسي - 24 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 11,
    },
    {
        id: 778,
        title: "نياحة القديس البابا سيماؤن الثاني البطريرك الثاني والأربعين من بطاركة الكرازة المرقسية - 24 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 11,
    },
    {
        id: 779,
        title: "تكريس كنيسة الشهيد مرقوريوس أبي سيفين - 25 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 11,
    },
    {
        id: 780,
        title: "استشهاد القديس إسحاق - 25 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 11,
    },
    {
        id: 781,
        title: "استشهاد القديسة ليارية - 25 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 11,
    },
    {
        id: 782,
        title: "استشهاد القديستين تكلة وموجي - 25 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 11,
    },
    {
        id: 783,
        title: "استشهاد القديس أنطونيوس البباوي - 25 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 11,
    },
    {
        id: 784,
        title: "استشهاد القديس أباكراجون - 25 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 11,
    },
    {
        id: 785,
        title: "استشهاد القديس دوماديوس السرياني - 25 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 11,
    },
    {
        id: 786,
        title: "نياحة القديس بلامون - 25 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 11,
    },
    {
        id: 787,
        title: "نياحة القديس يوسف البار خطيب القديسة مريم العذراء - 26 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 11,
    },
    {
        id: 788,
        title: "نياحة القديس البابا تيموثاوس الأول البطريرك الثاني والعشرين من بطاركة الكرازة المرقسية - 26 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 11,
    },
    {
        id: 789,
        title: "استشهاد القديس أبامون - 27 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 11,
    },
    {
        id: 790,
        title: "تكريس كنيسة القديس أبي فام الجندي الأوسيمي - 27 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 11,
    },
    {
        id: 791,
        title: "نياحة القديسة مريم المجدلية - 28 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 11,
    },
    {
        id: 792,
        title: "تذكار الأعياد السيدية البشارة والميلاد والقيامة - 29 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 11,
    },
    {
        id: 793,
        title: "تذكار نقل أعضاء القديس أندراوس الرسول - 29 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 11,
    },
    {
        id: 794,
        title: "استشهاد القديس ورشنوفيوس - 29 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 11,
    },
    {
        id: 795,
        title: "استشهاد القديس مرقوريوس وأفرام من أخميم - 30 ابيب",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 11,
    },
    {
        id: 796,
        title: "استشهاد القديس أبالي بن يسطس - 1 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 12,
    },
    {
        id: 797,
        title: "نياحة القديس البابا كيرلس الخامس البطريرك الثاني عشر بعد المائة من بطاركة الكرازة المرقسية - 1 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 12,
    },
    {
        id: 798,
        title: "نياحة القديسة بائيسة - 2 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 12,
    },
    {
        id: 799,
        title: "نقل جسد القديس سمعان العمودي إلى مدينة القسطنطينية - 3 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 12,
    },
    {
        id: 800,
        title: "نياحة القديس البابا إبريموس البطريرك الخامس من بطاركة الكرازة المرقسية - 3 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 12,
    },
    {
        id: 801,
        title: "نياحة حزقيا الملك البار - 4 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 12,
    },
    {
        id: 802,
        title: "تكريس كنيسة القديس العظيم الأنبا أنطونيوس - 4 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 12,
    },
    {
        id: 803,
        title: "نياحة القديس يوحنا الجُندي - 5 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 12,
    },
    {
        id: 804,
        title: "استشهاد القديسة يوليطة المجاهدة - 6 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 12,
    },
    {
        id: 805,
        title: "نياحة القديس يعقوب البرادعي - 6 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 12,
    },
    {
        id: 806,
        title: "نياحة القديس الأنبا ويصا تلميذ الأنبا شنوده رئيس المتوحدين - 6 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 12,
    },
    {
        id: 807,
        title: "بشارة الملاك للقديس يواقيم بميلاد القديسة العذراء مريم - 7 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 12,
    },
    {
        id: 808,
        title: "نياحة القديس البابا تيموثاوس الثاني البطريرك السادس والعشرين من بطاركة الكرازة المرقسية - 7 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 12,
    },
    {
        id: 809,
        title: "نياحة القديس بسنتاؤس الناسك بجبل الطود - 7 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 7,
        month: 12,
    },
    {
        id: 810,
        title: "استشهاد القديسين أليعازر وزوجته سالومى وأولادهما - 8 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 8,
        month: 12,
    },
    {
        id: 811,
        title: "استشهاد القديس آري الشطانوفي القس - 9 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 9,
        month: 12,
    },
    {
        id: 812,
        title: "استشهاد القديس بيخبيس - 10 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 12,
    },
    {
        id: 813,
        title: "استشهاد القديس مطرا - 10 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 10,
        month: 12,
    },
    {
        id: 814,
        title: "نياحة القديس مويسيس أسقف أوسيم - 11 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 11,
        month: 12,
    },
    {
        id: 815,
        title: "تذكار رئيس الملائكة الجليل ميخائيل - 12 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 12,
    },
    {
        id: 816,
        title: "تذكار تملك الإمبراطور قسطنطين على عرش روما - 12 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 12,
        month: 12,
    },
    {
        id: 817,
        title: "عيد التجلي المجيد - 13 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 13,
        month: 12,
    },
    {
        id: 818,
        title: "تذكار الآية العظيمة التي صنعها الله في عهد البابا ثاؤفيلس البطريرك الثالث والعشرين - 14 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 14,
        month: 12,
    },
    {
        id: 819,
        title: "نياحة القديسة مارينا الراهبة - 15 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 12,
    },
    {
        id: 820,
        title: "نياحة القديس الأرشيدياكون حبيب جرجس (اعترف المجمع المقدس بقداسته في جلسة 20 يونيو 2013م) - 15 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 15,
        month: 12,
    },
    {
        id: 821,
        title: "إعلان إصعاد جسد القديسة الطاهرة مريم إلى السماء - 16 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 12,
    },
    {
        id: 822,
        title: "نياحة القديس البابا متاؤس الرابع البطريرك الثاني بعد المائة من بطاركة الكرازة المرقسية - 16 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 16,
        month: 12,
    },
    {
        id: 823,
        title: "استشهاد القديس يعقوب الجُندي - 17 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 17,
        month: 12,
    },
    {
        id: 824,
        title: "نياحة البابا ألكسندروس بطريرك القسطنطينية - 18 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 12,
    },
    {
        id: 825,
        title: "استشهاد وادامون الأرمنتي - 18 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 18,
        month: 12,
    },
    {
        id: 826,
        title: "إعادة جسد القديس مكاريوس الكبير إلى ديره ببرية شيهيت - 19 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 19,
        month: 12,
    },
    {
        id: 827,
        title: "استشهاد الفتية السبعة الذين من أفسس - 20 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 20,
        month: 12,
    },
    {
        id: 828,
        title: "تذكار القديسة العذراء مريم والدة الإله - 21 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 12,
    },
    {
        id: 829,
        title: "نياحة القديسة إيريني - 21 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 21,
        month: 12,
    },
    {
        id: 830,
        title: "نياحة ميخا النبي - 22 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 12,
    },
    {
        id: 831,
        title: "نياحة القديس أوغسطينوس - 22 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 22,
        month: 12,
    },
    {
        id: 832,
        title: "استشهاد ثلاثين ألف مسيحي بمدينة الإسكندرية - 23 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 12,
    },
    {
        id: 833,
        title: "استشهاد القديس دميان بأنطاكية - 23 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 23,
        month: 12,
    },
    {
        id: 834,
        title: "نياحة القديس توما أسقف مرعش - 24 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 12,
    },
    {
        id: 835,
        title: "نياحة القديس تكلاهيمانوت الحبشي - 24 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 24,
        month: 12,
    },
    {
        id: 836,
        title: "نياحة القديس بيساريون الكبير - 25 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 12,
    },
    {
        id: 837,
        title: "نياحة القديس البابا مكاريوس الثالث البطريرك الرابع عشر بعد المائة من بطاركة الكرازة المرقسية - 25 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 25,
        month: 12,
    },
    {
        id: 838,
        title: "استشهاد القديس مويسيس والبارة سارة أخته - 26 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 12,
    },
    {
        id: 839,
        title: "استشهاد القديس أغابيوس الجندي والبارة تكلة أخته - 26 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 26,
        month: 12,
    },
    {
        id: 840,
        title: "استشهاد القديس بنيامين وأودكسية أخته - 27 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 12,
    },
    {
        id: 841,
        title: "استشهاد القديسة مريم الأرمنية - 27 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 27,
        month: 12,
    },
    {
        id: 842,
        title: "تذكار الآباء القديسين إبراهيم وإسحاق ويعقوب - 28 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 28,
        month: 12,
    },
    {
        id: 843,
        title: "تذكار الأعياد السيدية البشارة والميلاد والقيامة - 29 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 12,
    },
    {
        id: 844,
        title: "استشهاد القديس أثناسيوس الأسقف وغلاميه - 29 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 12,
    },
    {
        id: 845,
        title: "وصول جسد القديس يحنس القصير إلى برية شيهيت - 29 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 29,
        month: 12,
    },
    {
        id: 846,
        title: "نياحة ملاخي النبي - 30 مسرى",
        date: null,
        story: "",
        selected: false,
        day: 30,
        month: 12,
    },
    {
        id: 847,
        title: "نياحة القديس أفتيخوس - 1 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 13,
    },
    {
        id: 848,
        title: "استشهاد القديس بشاي أخي القديس أباهور - 1 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 1,
        month: 13,
    },
    {
        id: 849,
        title: "نياحة القديس تيطس الرسول - 2 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 2,
        month: 13,
    },
    {
        id: 850,
        title: "تذكار رئيس الملائكة الجليل روفائيل - 3 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 13,
    },
    {
        id: 851,
        title: "استشهاد القديسين أندريانوس ومن معه - 3 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 13,
    },
    {
        id: 852,
        title: "نياحة القديس البابا يوأنس الرابع عشر البطريرك السادس والتسعين من بطاركة الكرازة المرقسية - 3 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 3,
        month: 13,
    },
    {
        id: 853,
        title: "نياحة القديس بيمن المتوحد - 4 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 4,
        month: 13,
    },
    {
        id: 854,
        title: "نياحة عاموس النبي - 5 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 13,
    },
    {
        id: 855,
        title: "نياحة القديس يعقوب أسقف مصر - 5 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 13,
    },
    {
        id: 856,
        title: "نياحة القديس البابا يوأنس الخامس عشر البطريرك التاسع والتسعين من بطاركة الكرازة المرقسية - 5 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 13,
    },
    {
        id: 857,
        title: "نياحة القديس برسوم العريان - 5 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 5,
        month: 13,
    },
    {
        id: 858,
        title: "اليوم السادس من الشهر الصغير المبارك شكر إلى الله - 6 نسئ",
        date: null,
        story: "",
        selected: false,
        day: 6,
        month: 13,
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxtQkFBbUIsR0FBZSxzQkFBc0IsRUFBRSxDQUFDO0FBRWpFOzs7R0FHRztBQUNILFNBQVMsbUJBQW1CLENBQUMsRUFBZTtJQUMxQyxJQUFJLElBQVksQ0FBQztJQUNqQixJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztJQUNmLHVGQUF1RjtJQUN2RixJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDcEMsK0NBQStDO1FBQy9DLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDN0Q7YUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUM5RCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVEO2FBQU07WUFDTCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdEQ7UUFDRCxFQUFFLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0RDtTQUFNLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUM3Qyxn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QUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtL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QUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDeEQsYUFBYSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNqRDthQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDcEQsYUFBYSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsRDthQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDdkQsYUFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQzthQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDckQsYUFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQzthQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDeEQsYUFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQzthQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbkQsYUFBYSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNqRDthQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVB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QUUsMkNBQTJDO1FBQ2xELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEVBQUU7UUFDTixLQUFLLEVBQUUsOEJBQThCO1FBQ3JDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEVBQUU7UUFDTixLQUFLLEVBQUUsbUNBQW1DO1FBQzFDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEVBQUU7UUFDTixLQUFLLEVBQUUsdURBQXVEO1FBQzlELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEVBQUU7UUFDTixLQUFLLEVBQUUsaURBQWlEO1FBQ3hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEVBQUU7UUFDTixLQUFLLEVBQUUsdURBQXVEO1FBQzlELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFF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S0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscURBQXFEO1FBQzVELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsdUZBQXVGO1FBQ3pGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOERBQThEO1FBQ3JFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscURBQXFEO1FBQzVELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscURBQXFEO1FBQzVELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOERBQThEO1FBQ3JFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsbUZBQW1GO1FBQ3JGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbUVBQW1FO1FBQzFFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscURBQXFEO1FBQzVELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkRBQTZEO1FBQ3BFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsMkZBQTJGO1FBQzdGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkNBQTJDO1FBQ2xELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gscVFBQXFRO1FBQ3ZRLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsd0ZBQXdGO1FBQzFGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVB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O1FBQ2hFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0RBQW9EO1FBQzNELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFD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QUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsMkZBQTJGO1FBQzdGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaURBQWlEO1FBQ3hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaUVBQWlFO1FBQ3hFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0VBQWdFO1FBQ3ZFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscUNBQXFDO1FBQzVDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFD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QUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0VBQWtFO1FBQ3pFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVB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QUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0VBQWdFO1FBQ3ZFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsd0VBQXdFO1FBQzFFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsc0lBQXNJO1FBQ3hJLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseURBQXlEO1FBQ2hFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcs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QUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdURBQXVEO1FBQzlELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOEJBQThCO1FBQ3JDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkJBQTZCO1FBQ3BDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOEJBQThCO1FBQ3JDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0RBQW9EO1FBQzNELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsNkVBQTZFO1FBQy9FLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbUNBQW1DO1FBQzFDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkNBQTJDO1FBQ2xELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbUNBQW1DO1FBQzFDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0Us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O1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsdUZBQXVGO1FBQ3pGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsMEZBQTBGO1FBQzVGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsMEZBQTBGO1FBQzVGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztR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QUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0RBQW9EO1FBQzNELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdURBQXVEO1FBQzlELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOERBQThEO1FBQ3JFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkRBQTZEO1FBQ3BFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0RBQStEO1FBQ3RFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsdUVBQXVFO1FBQ3pFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsb0dBQW9HO1FBQ3RHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscUNBQXFDO1FBQzVDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaUNBQWlDO1FBQ3hDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0JBQStCO1FBQ3RDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbUNBQW1DO1FBQzFDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gseUVBQXlFO1FBQzNFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsMkVBQTJFO1FBQzdFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsd0ZBQXdGO1FBQzFGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0VBQWtFO1FBQ3pFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0VBQWtFO1FBQ3pFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscUNBQXFDO1FBQzVDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0RBQW9EO1FBQzNELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOERBQThEO1FBQ3JFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsNkVBQTZFO1FBQy9FLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsc0ZBQXNGO1FBQ3hGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOERBQThEO1FBQ3JFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gseUZBQXlGO1FBQzNGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaUNBQWlDO1FBQ3hDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gscUdBQXFHO1FBQ3ZHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsb0dBQW9HO1FBQ3RHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gscUdBQXFHO1FBQ3ZHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gseUVBQXlFO1FBQzNFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gscUdBQXFHO1FBQ3ZHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsa0ZBQWtGO1FBQ3BGLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0RBQStEO1FBQ3RFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkNBQTJDO1FBQ2xELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gscUVBQXFFO1FBQ3ZFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNERBQTREO1FBQ25FLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsbUdBQW1HO1FBQ3JHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdURBQXVEO1FBQzlELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0RBQXdEO1FBQy9ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkNBQTJDO1FBQ2xELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0RBQStEO1FBQ3RFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztR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QUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaURBQWlEO1FBQ3hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFF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QUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsNEVBQTRFO1FBQzlFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0VBQWdFO1FBQ3ZFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsa0dBQWtHO1FBQ3BHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtE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QUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsZ0dBQWdHO1FBQ2xHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaURBQWlEO1FBQ3hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbUVBQW1FO1FBQzFFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0JBQStCO1FBQ3RDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0RBQW9EO1FBQzNELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscUNBQXFDO1FBQzVDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsa0dBQWtHO1FBQ3BHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsbUdBQW1HO1FBQ3JHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsK0ZBQStGO1FBQ2pHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0JBQStCO1FBQ3RDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscURBQXFEO1FBQzVELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMERBQTBEO1FBQ2pFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNERBQTREO1FBQ25FLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsaUdBQWlHO1FBQ25HLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0RBQW9EO1FBQzNELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsaUZBQWlGO1FBQ25GLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseURBQXlEO1FBQ2hFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVB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QUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkNBQTJDO1FBQ2xELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNERBQTREO1FBQ25FLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOERBQThEO1FBQ3JFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkRBQTZEO1FBQ3BFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscUNBQXFDO1FBQzVDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0RBQStEO1FBQ3RFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0RBQStEO1FBQ3RFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkJBQTZCO1FBQ3BDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0VBQW9FO1FBQzNFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseURBQXlEO1FBQ2hFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkNBQTJDO1FBQ2xELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkJBQTZCO1FBQ3BDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMERBQTBEO1FBQ2pFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscURBQXFEO1FBQzVELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdURBQXVEO1FBQzlELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVB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QUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscUNBQXFDO1FBQzVDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdURBQXVEO1FBQzlELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFF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LEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJ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RUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsNkZBQTZGO1FBQy9GLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscURBQXFEO1FBQzVELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbUNBQW1DO1FBQzFDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsa0dBQWtHO1FBQ3BHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaURBQWlEO1FBQ3hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkNBQTJDO1FBQ2xELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0JBQStCO1FBQ3RDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkRBQTZEO1FBQ3BFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsa0dBQWtHO1FBQ3BHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaUNBQWlDO1FBQ3hDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaURBQWlEO1FBQ3hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gscUdBQXFHO1FBQ3ZHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0JBQStCO1FBQ3RDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkRBQTZEO1FBQ3BFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsaUZBQWlGO1FBQ25GLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0RBQW9EO1FBQzNELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscUNBQXFDO1FBQzVDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0NBQXNDO1FBQzdDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gscUVBQXFFO1FBQ3ZFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaUVBQWlFO1FBQ3hFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsa0dBQWtHO1FBQ3BHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaURBQWlEO1FBQ3hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNENBQTRDO1FBQ25ELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsaUNBQWlDO1FBQ3hDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0JBQStCO1FBQ3RDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMENBQTBDO1FBQ2pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsOENBQThDO1FBQ3JELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNkJBQTZCO1FBQ3BDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsOEZBQThGO1FBQ2hHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsb0dBQW9HO1FBQ3RHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsa0dBQWtHO1FBQ3BHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUscURBQXFEO1FBQzVELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0VBQWdFO1FBQ3ZFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsK0NBQStDO1FBQ3RELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0RBQWtEO1FBQ3pELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsNEJBQTRCO1FBQ25DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsc0RBQXNEO1FBQzdELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkNBQTJDO1FBQ2xELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsd0NBQXdDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQ0gsd0dBQXdHO1FBQzFHLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsZ0RBQWdEO1FBQ3ZELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUseUNBQXlDO1FBQ2hELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsdURBQXVEO1FBQzlELElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVBQUUsMkRBQTJEO1FBQ2xFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNEO1FBQ0UsRUFBRSxFQUFFLEdBQUc7UUFDUCxLQUFLLEVB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