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
        if (lang == "CA" && userLanguages.indexOf("COP") == -1) {
            userLanguages.splice(userLanguages.indexOf(lang), 1, "COP");
        }
        else if (lang == "EN" && userLanguages.indexOf("FR") == -1) {
            userLanguages.splice(userLanguages.indexOf(lang), 1, "FR");
        }
        else {
            userLanguages.splice(userLanguages.indexOf(lang), 1);
        }
        el.innerText = el.innerText.replace("Remove", "Add");
    }
    else if (userLanguages.indexOf(lang) == -1) {
        //The language is not included in user languages, we will add it
        //if the user adds the Coptic in Arabic characters, we assume he doesn't need the Coptic text we do the same for English and French
        if (lang == "CA" && userLanguages.indexOf("COP") > -1) {
            userLanguages.splice(userLanguages.indexOf("COP"), 1, lang);
        }
        else if (lang == "EN" && userLanguages.indexOf("FR") > -1) {
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
/**
 * Checks that the value of todayDate is the same as the current date, unless there is another value stored in the local storage, which means that the user had manually set the date
 */
function checkDate() {
    let newDate = new Date();
    if (localStorage.selectedDate) {
        newDate.setTime(localStorage.selectedDate);
    }
    setCopticDates(newDate);
}
/**
 * Some functions that we run automatically when loading the app
 */
(function autoRunOnLoad() {
    showChildButtonsOrPrayers(btnMain);
    setCopticDates();
    DetectFingerSwipe();
})();
/**
 *
 * @param firstElement {string} - this is the id of the prayer in the prayersArray
 * @param {string[]} prayers - an array of the text of the prayer which id matched the id in the idsArray. The first element in this array is the id of the prayer. The other elements are, each, the text in a given language. The prayers array is hence structured like this : ['prayerID', 'prayer text in Arabic', 'prayer text in French', 'prayer text in Coptic']
 * @param {string[]} languagesArray - the languages available for this prayer. The button itself provides this array from its "Languages" property
 * @param {string[]} userLanguages - a globally declared array of the languages that the user wants to show.
 * @param {string} actorClass - a class that will be given to the html element showing the prayer according to who is saying the prayer: is it the Priest, the Diacon, or the Assembly?
 */
function createHtmlElementForPrayer(firstElement, prayers, languagesArray, userLanguages, actorClass, position = containerDiv) {
    if (!userLanguages)
        userLanguages = JSON.parse(localStorage.userLanguages);
    let row, p, lang, text;
    row = document.createElement("div");
    row.classList.add("TargetRow"); //we add 'TargetRow' class to this div
    let dataRoot = firstElement.replace(/Part\d+/, "");
    row.dataset.root = dataRoot;
    if (actorClass && actorClass !== "Title") {
        // we don't add the actorClass if it is "Title", because in this case we add a specific class called "TargetRowTitle" (see below)
        row.classList.add(actorClass);
    }
    else if (actorClass && actorClass == "Title") {
        row.addEventListener("click", (e) => {
            e.preventDefault;
            collapseText(row);
        }); //we also add a 'click' eventListener to the 'TargetRowTitle' elements
    }
    //looping the elements containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
    for (let x = 1; x < prayers.length; x++) {
        //x starts from 1 because prayers[0] is the id
        if (!prayers[x] || prayers[x] === ' ')
            continue; //we escape the empty strings if the text is not available in all the button's languages
        if (actorClass &&
            (actorClass == "Comment" || actorClass == "CommentText")) {
            //this means it is a comment
            x == 1 ? (lang = languagesArray[1]) : (lang = languagesArray[3]);
        }
        else {
            lang = languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
        } //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
        if (userLanguages.indexOf(lang) > -1) {
            if (actorClass &&
                new Map(JSON.parse(localStorage.showActors)).get(actorClass) == false) {
                //If had hide an actor, we will stop and return
                return;
            }
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
                p.classList.add("PrayerText");
            }
            p.dataset.root = dataRoot; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
            text = prayers[x];
            p.dataset.lang = lang; //we are adding this in order to be able to retrieve all the paragraphs in a given language by its data attribute. We need to do this in order for example to amplify the font of a given language when the user double clicks
            p.textContent = text;
            p.addEventListener("dblclick", (event) => {
                toggleAmplifyText(event, "amplifiedText");
            }); //adding a double click eventListner that amplifies the text size of the chosen language;
            row.appendChild(p); //the row which is a <div></div>, will encapsulate a <p></p> element for each language in the 'prayer' array (i.e., it will have as many <p></p> elements as the number of elements in the 'prayer' array)
        }
        else {
        }
    }
    //@ts-ignore
    position.el
        ? //@ts-ignore
            position.el.insertAdjacentElement(position.beforeOrAfter, row)
        : //@ts-ignore
            position.appendChild(row);
    return row;
}
/**
 * Shows a bookmark link in the right side bar for each title in the currently displayed prayers
 * @param {NodeListOf<>Element} titlesCollection  - a Node list of all the divs containing the titles of the different sections. Each div will be passed to addTitle() in order to create a link in the right side bar pointing to the div
 * @param {HTMLElement} rightTitlesDiv - the right hand side bar div where the titles will be displayed
 * @param {boolean} clear - indicates whether the side bar where the links will be inserted, must be cleared before insertion
 */
async function showTitlesInRightSideBar(titlesCollection, rightTitlesDiv, btn, clear = true) {
    //this function shows the titles in the right side Bar
    if (clear) {
        rightTitlesDiv.innerHTML = "";
    } //we empty the side bar
    let bookmark, div;
    for (let i = 0; i < titlesCollection.length; i++) {
        titlesCollection[i].id += i.toString(); //we do this in order to give each title a distinctive id in cases where all the titles have the same id
        addTitle(titlesCollection[i]);
    }
    /**
     * Adds shortcuts to the diffrent sections by redirecting to the title of the section
     * @param {HTMLElement} titles - a div including paragraphs, each displaying the title of the section in a given langauge
     */
    function addTitle(titles) {
        let text = "";
        div = document.createElement("div"); //this is just a container
        div.role = "button";
        rightTitlesDiv.appendChild(div);
        bookmark = document.createElement("a");
        div.appendChild(bookmark);
        bookmark.href = "#" + titles.id; //we add a link to the element having as id, the id of the prayer
        div.classList.add("sideTitle");
        div.addEventListener("click", () => closeSideBar(rightSideBar)); //when the user clicks on the div, the rightSideBar is closed
        if (titles.querySelector(".AR")) {
            //if the titles div has a paragraph child with class="AR", it means this is the paragraph containing the Arabic text of the title
            text += titles
                .querySelector(".AR")
                .textContent.replace(String.fromCharCode(10134), ""); //we remove the '-' sign from the text of the Arabic paragraph;
        }
        if (titles.querySelector(".FR")) {
            if (text != "") {
                text += "\n" + titles.querySelector(".FR").textContent;
            }
            else {
                text += titles.querySelector(".FR").textContent;
            }
        }
        bookmark.innerText = text;
    }
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
    let btnsDiv = leftSideBar.querySelector("#sideBarBtns");
    hideInlineButtonsDiv();
    if (clear) {
        btnsDiv.innerHTML = "";
        inlineBtnsDiv.innerHTML = "";
    }
    if (btn.onClick && click) {
        btn.onClick();
        if (btn.pursue == false)
            return;
    }
    if (btn.prayers && btn.prayersArray && btn.languages && btn.showPrayers)
        showPrayers(btn, true, true, containerDiv);
    if (btn.afterShowPrayers)
        btn.afterShowPrayers();
    //Important ! : setCSSGridTemplate() MUST be called after btn.afterShowPrayres()
    setCSSGridTemplate(containerDiv.querySelectorAll(".TargetRow")); //setting the number and width of the columns for each html element with class 'TargetRow'
    applyAmplifiedText(containerDiv.querySelectorAll("p[data-lang]"));
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
    showTitlesInRightSideBar(containerDiv.querySelectorAll("div.TargetRowTitle"), rightSideBar.querySelector("#sideBarBtns"), btn);
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
/** */
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
        //for each language in btn.text, we create a new "p" element
        if (btn.label[lang]) {
            let btnLable = document.createElement("p");
            //we edit the p element by adding its innerText (=btn.text[lang], and its class)
            editBtnInnerText(btnLable, btn.label[lang], "btnLable" + lang);
            //we append the "p" element  to the newBtn button
            newBtn.appendChild(btnLable);
        }
    }
    btnsBar.appendChild(newBtn);
    //If no onClick parameter/argument is passed to createBtn(), and the btn has any of the following properties: children/prayers/onClick or inlinBtns, we set the onClick parameter to a function passing the btn to showChildButtonsOrPrayers
    if (!onClick && (btn.children || btn.prayers || btn.onClick || btn.inlineBtns))
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
    let width = "30%";
    sideBar.style.width = width;
    sideBar.classList.remove("collapsed");
    sideBar.classList.add("extended");
    //sideBar == leftSideBar? contentDiv.style.marginLeft = width: contentDiv.style.marginRight = width ;
    sideBarBtn.innerText = btnText;
    sideBarBtn.removeEventListener("click", () => openSideBar(sideBar));
    sideBarBtn.addEventListener("click", () => closeSideBar(sideBar));
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
    sideBarBtn.removeEventListener("click", () => closeSideBar(sideBar));
    sideBarBtn.addEventListener("click", () => openSideBar(sideBar));
}
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
    function handleTouchMove(evt) {
        if (!xDown || !yDown)
            return;
        let xUp = evt.touches[0].clientX;
        let yUp = evt.touches[0].clientY;
        let xDiff = xDown - xUp;
        let yDiff = yDown - yUp;
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            /*most significant*/
            if (xDiff > 0) {
                /* right to left swipe */
                if (leftSideBar.classList.contains("extended") &&
                    rightSideBar.classList.contains("collapsed")) {
                    closeSideBar(leftSideBar);
                }
                else if (rightSideBar.classList.contains("collapsed") &&
                    leftSideBar.classList.contains("collapsed")) {
                    openSideBar(rightSideBar);
                }
            }
            else {
                /* left to right swipe */
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
function toggleAmplifyText(ev, myClass) {
    ev.preventDefault;
    let amplified = new Map(JSON.parse(localStorage.textAmplified));
    let target = ev.target;
    let selector = 'p[data-lang="' + target.dataset.lang + '"]';
    let sameLang = containerDiv.querySelectorAll(selector);
    sameLang.forEach((p) => {
        p.classList.toggle(myClass);
    });
    if (target.classList.contains(myClass)) {
        //it means that the class was added when the user dbl clicked (not removed)
        amplified.set(target.dataset.lang, true);
    }
    else {
        amplified.set(target.dataset.lang, false);
    }
    localStorage.textAmplified = JSON.stringify(Array.from(amplified));
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
    if (id == "leftSideBar") {
        //leftSideBar = sideBar
    }
    else if (id == "rightSideBar") {
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
    btn.prayers.map((p) => {
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
                createHtmlElementForPrayer(baseTitle(row[0]), row, btn.languages, JSON.parse(localStorage.userLanguages), row[0].split("&C=")[1], position); //row[0] is the title of the table modified as the case may be to reflect wether the row contains the titles of the prayer, or who chants the prayer (in such case the words 'Title' or '&C=' + 'Priest', 'Diacon', or 'Assembly' are added to the title)
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
    Rows.forEach((r) => {
        r.style.gridTemplateColumns = getColumnsNumberAndWidth(r); //Setting the number of columns and their width for each element having the 'TargetRow' class
        r.style.gridTemplateAreas = setGridAreas(r); //Defining grid areas for each language in order to be able to control the order in which the languages are displayed (Arabic always on the last column from left to right, and Coptic on the first column from left to right)
        if (r.classList.contains("TargetRowTitle")) {
            //This is the div where the titles of the prayer are displayed. We will add an 'on click' listner that will collapse the prayers
            r.role = "button";
            let arabic = r.querySelector('p[data-lang="AR"]');
            if (arabic &&
                !arabic.textContent.startsWith(String.fromCharCode(10134))) {
                arabic.textContent =
                    String.fromCharCode(10134) +
                        " " +
                        r.querySelector('p[data-lang="AR"]').textContent; //we add the minus sign at the begining of the paragraph containing the Arabic text of the title (we retrieve it by its dataset.lang value)
            }
            else if (
            //If there is no arabic paragraph, we will add the sign to the last child
            !r.lastElementChild.textContent.startsWith(String.fromCharCode(10134))) {
                r.lastElementChild.textContent =
                    String.fromCharCode(10134) + " " + r.lastElementChild.textContent;
            }
        }
    });
    replaceEigthNote(undefined, undefined);
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
        if (areas.indexOf("AR") == 0 &&
            !row.classList.contains("Comment") &&
            !row.classList.contains("CommentText")) {
            //if the 'AR' is the first language, it means it will be displayed in the first column from left to right. We need to reverse the array in order to have the Arabic language on the last column from left to right
            areas.reverse();
        }
        return '"' + areas.toString().split(",").join(" ") + '"'; //we should get a string like ' "AR COP FR" ' (notice that the string marks " in the beginning and the end must appear, otherwise the grid-template-areas value will not be valid)
    }
}
async function applyAmplifiedText(container) {
    new Map(JSON.parse(localStorage.textAmplified)).forEach((value, key) => {
        if (value == true) {
            Array.from(container)
                .filter((el) => el.getAttribute("data-lang") == key)
                .map((el) => el.classList.add("amplifiedText"));
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
 * Toggles the dipslay property of all the nextElementSiblings of the element, if the nextElementSibling classList does not include 'TargetRowTitle'
 * @param {HTMLElement} element - the html element which nextElementSiblings display property will be toggled between 'none' and 'grid'
 */
function collapseText(element) {
    let siblings = [], next;
    next = element.nextElementSibling;
    while (next && !next.classList.contains("TargetRowTitle")) {
        siblings.push(next);
        next = next.nextElementSibling;
    }
    for (let i = 0; i < siblings.length; i++) {
        siblings[i].classList.toggle("collapsed");
        if (siblings[i].classList.contains("collapsed")) {
            siblings[i].style.display = "none";
        }
        else {
            siblings[i].style.display = "grid";
        }
    }
    let parag;
    parag = Array.from(element.children).filter((child) => child.textContent.startsWith(String.fromCharCode(10133)) ||
        child.textContent.startsWith(String.fromCharCode(10134)))[0];
    if (parag && parag.textContent.startsWith(String.fromCharCode(10133))) {
        //mbibawi.github.io/CopticPWA/#TargetDiv
        https: parag.textContent = parag.textContent.replace(String.fromCharCode(10133), String.fromCharCode(10134));
    }
    else if (parag &&
        parag.textContent.startsWith(String.fromCharCode(10134))) {
        parag.textContent = parag.textContent.replace(String.fromCharCode(10134), String.fromCharCode(10133));
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
                label: { AR: "التالي", FR: "Suivants" },
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
                label: { AR: "العودة إلى القداس", FR: "Retour à la messe" },
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
                    AR: prayerTable[0][btn.languages.indexOf("AR") + 1],
                    FR: prayerTable[0][btn.languages.indexOf("FR") + 1], //same logic and comment as above
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
                    let createdElements = containerDiv.querySelectorAll(getDataRootSelector(inlineBtn.prayers[0]));
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
            baseTitle(btn.prayersArray[i][0][0]) == p //i.e., if the id of the table = the id of the prayer
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
    (function showCurrentVersion() {
        let p = document.createElement("p");
        p.style.color = 'blue';
        p.style.fontSize = "15pt";
        p.style.fontWeight = "bold";
        p.innerText = version;
        inlineBtnsDiv.appendChild(p);
    })();
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
            if (actor == "CommentText") {
                return;
            } //we will not show a button for 'CommentText' class, it will be handled by the 'Comment' button
            let show = new Map(JSON.parse(localStorage.getItem("showActors")))
                .get(actor);
            btn = createBtn("button", "button", "settingsBtn", actor, actorsContainer, actor, actor, undefined, undefined, undefined, {
                event: "click",
                fun: () => {
                    show = !show; //inversing the value of "show"
                    showActors.set(actor, show);
                    btn.classList.toggle("langBtnAdd");
                    //changing the background color of the button to red by adding 'langBtnAdd' as a class
                    if (actor == "Comment") {
                        showActors.set("CommentText", show);
                    } //setting the value of 'CommentText' same as 'Comment'
                    localStorage.showActors = JSON.stringify(Array.from(showActors)); //adding the new values to local storage
                    if (containerDiv.children) {
                        //Only if some prayers text is already displayed
                        showChildButtonsOrPrayers(lastClickedButton); //we re-click the last button to refresh the displayed text by adding or removing the actor according to the new setings chice made by the user.
                        showSettingsPanel(); //we display the settings pannel again
                    }
                },
            });
            if (show == false) {
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
                    if (localStorage.displayMode != mode) {
                        localStorage.displayMode = mode;
                        Array.from(displayContainer.children).map((b) => {
                            b.id != localStorage.displayMode
                                ? b.classList.add("langBtnAdd")
                                : b.classList.remove("langBtnAdd");
                        });
                    }
                },
            });
            if (mode != localStorage.displayMode) {
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
                let tablesArray = eval(prompt('Provide the Name of the Array you Want to Edit', 'testEditingArray'));
                if (tablesArray) {
                    editingMode(tablesArray);
                    hideInlineButtonsDiv();
                }
                ;
            }
        });
    })();
    function createBtn(tag, role = tag, btnClass, innerText, parent, id, dataSet, type, size, backgroundColor, onClick) {
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
        if (dataSet) {
            btn.dataset.lang = dataSet;
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
        let actors = [
            {
                id: "PriestColor",
                AR: "الكاهن",
                FR: "Le Prêtre",
                EN: "The Priest",
            },
            {
                id: "AssemblyColor",
                AR: "الشعب",
                FR: "L'Assemblée",
                EN: "The Assembly",
            },
            {
                id: "DiaconColor",
                AR: "الشماس",
                FR: "Le Diacre",
                EN: "The Diacon",
            },
        ];
        actors.map((b) => {
            let newBtn = createBtn("button", undefined, "colorbtn", undefined, container, b.id);
            for (let i = 1; i < 4; i++) {
                let p = document.createElement("p");
                p.innerText = b[Object.keys(b)[i]];
                //Object.keys(b)[i] 0K;
                newBtn.appendChild(p);
            }
        });
    })();
    closeSideBar(leftSideBar);
}
/**
 * Loops the tables (i.e., the string[][]) of a string[][][] and, for each row (string[]) of each table, it inserts a div adjacent to an html child element to containerDiv
 * @param {string[][][]} prayers - an array of prayers, each representing a table in the Word document from which the text was retrieved
 * @param {string[]} languages - the languages in which the text is available. This is usually the "languages" properety of the button who calls the function
 * @param {{beforeOrAfter:InsertPosition, el: HTMLElement}} position - the position at which the prayers will be inserted, adjacent to an html element (el) in the containerDiv
 * @returns {HTMLElement[]} - an array of all the html div elements created and appended to the containerDiv
 */
function insertPrayersAdjacentToExistingElement(prayers, languages, position) {
    if (!prayers)
        return;
    let createdElements = [], created;
    prayers.map((p) => {
        p.map((row) => {
            created = createHtmlElementForPrayer(baseTitle(row[0]), row, languages, JSON.parse(localStorage.userLanguages), row[0].split("&C=")[1], position);
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
            if (baseTitle(row[0]) == title) {
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
let testEditingArray = [
    [
        [Prefix.commonIncense + "EleysonImasComment&D=0000&C=Comment",
            " ",
            "بعد صلاة التسبحة وتلاوة مزامير باكر وتحليل الكهنة، يصافح الكاهن اخوته الكهنة وطلب السماح من المصلين ويخضع أمام الهيكل، ويفتح ستر الهيكل من الشمال إلى اليمين قائلأ: "]
    ],
    [
        [Prefix.commonIncense + "EleysonImas&D=0000&C=Title",
            "Ⲉⲗⲉⲏⲥⲟⲛ ⲏ̀ⲙⲁⲥ ",
            "Aie pitié de nous ",
            "ارحمنا يا الله ",
            "ارحمنا يا الله "],
        [Prefix.commonIncense + "EleysonImas&D=0000&C=Priest",
            "Ⲉⲗⲉⲏⲥⲟⲛ ⲏ̀ⲙⲁⲥ ⲟ̀ Ⲑⲉⲟⲥ ⲟ̀ Ⲡⲁⲧⲏⲣ ⲟ̀ Ⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ: ⲡⲁⲛⲁ̀ⲅⲓⲁ ⲧ̀ⲣⲓⲁⲥ ⲉ̀ⲗⲉⲏ̀ⲥⲟⲛ ⲏ̀ⲙⲁⲥ: Ⲡϭⲟⲓⲥ ⲫⲛⲟⲩϯ ⲛ̀ⲧⲉ ⲛⲓϫⲟⲙ ϣⲱⲡⲓ ⲛⲉⲙⲁⲛ: ϫⲉ ⲙ̀ⲙⲟⲛ ⲛ̀ⲧⲁⲛ ⲛ̀ⲟⲩⲃⲟⲏ̀ⲑⲟⲥ ϧⲉⲛ ⲛⲉⲛⲑ̀ⲗⲓⲯⲓⲥ ⲛⲉⲙ ⲛⲉⲛϩⲟϫϩⲉϫ ⲉ̀ⲃⲏⲗ ⲉ̀ⲣⲟⲕ. ",
            "Aie pitié de nous ô Dieu le Père Pantocrator. Ô Seigneur Dieu des puissances, sois avec nous. Car nous n’avons d’autre secours que Toi dans nos difficultés et nos angoisses. ",
            "إلياسون إيماس أو ثيؤس أو باتير أو بانتوكراتور: بانآجيا اترياس إليسون إيماس بيخرستوس بننوتي إنتي نيجوم شوبي نيمان جي إممون إنتان إنوفوإيثوس خين نينإثليفيس نيم نينهوج هيج إيفيل إروك. ",
            "ارحمنا يا الله الآب ضابط الكل. أيها الثالوث القدوس ارحمنا. لأنه ليس  لنا معين في شدائدنا وضيقاتنا سواك. "],
        [Prefix.commonIncense + "EleysonImas&D=0000&C=Priest",
            "Ⲁⲣⲓⲧⲉⲛ ⲛ̀ⲉⲙⲡ̀ϯⲁ ⲛ̀ϫⲟⲥ ⲯⲉⲛ ⲟⲩϯⲉⲡⳣ̀ⲙⲟⲧ, ",
            "Rends nous dignes de dire en action de grâce: ",
            " آريتين إن أم إبشا إنجوس خين أو شبئهموت. ",
            "اجعلنا مستحقين أن نقول بشكر: "]
    ],
    [
        [Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=0000&C=Title",
            "Ϫⲉ Ⲡⲉⲛⲓⲱⲧ ",
            "Notre Père qui es aux cieux ",
            "جي بنيوت إتخين نيفيئوي ",
            "أبانا الذى في السموات "],
        [Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=0000&C=Assembly",
            "Ϫⲉ Ⲡⲉⲛⲓⲱⲧ ⲉⲧ ⲯⲉⲛ ⲛⲓⲫϩⲟⲩⲓ̀, ⲙⲁⲣⲉϥⲧⲟⲩⲃⲟ ⲛ̀ϫⲉ ⲡⲉⲕⲣⲁⲛ,  ⲙⲁⲣⲉⲥⲓ̀ ⲛ̀ϫⲉ ⲧⲉⲕⲙⲉⲧⲟⲩⲣⲟ, ⲡⲉⲧⲉⳣⲛⲁⲕ ⲙⲁⲣⲉϥϯⲱⲡⲓ ⲙ̀ⲫ̀ⲣϩ ̀ⲯⲉⲛ ⲧ̀ⲫⲉ ⲛⲉⲙ ⳣⲓϫⲉⲛ ⲡⲓⲕⲁⳣ, ",
            "Notre Père qui es aux cieux, Que Ton Nom soit sanctifié. Que Ton règne vienne. Que Ta volonté soit faite sur la terre comme au ciel. ",
            "جي بنيوت إتخين نيفيئوي ماريفطوفو أنجي بيكران. ماريسئي إنجي تيكميتؤرو. بيتهيناك ماريف شوبي إم إفريتي خين أتفي نيم هيجين بي كاهي.  ",
            "أبانا الذى في السموات، ليتقدس اسمك، ليأت ملكوتك. لتكن مشيئتك كما فى السماء كذلك على الأرض.  "],
        [Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=0000&C=Assembly",
            "ⲡⲉⲛⲱⲓⲕ ⲛ̀ⲧⲉ ⲣⲁⲥ ̀ⲙϩⲓϥ ⲛⲁⲛ ⲙ̀ⲫⲟⲟⲩ,  ⲟⲩⲟⳣ ⲝⲁ ⲛϩⲉ̀ⲧⲉⲣⲟⲛ ⲛⲁⲛ ⲉ̀ⲃⲟⲗ,  ⲙ̀ⲫ̀ⲣϩ ̀ⳣⲱⲛ ⲛ̀ⲧⲉⲛⲝⲱ ⲉ̀ⲃⲟⲗⲛ̀ⲛϩⲉ̀ⲧⲉ ⲟⲩⲟⲛ ⲛ̀ⲧⲁⲛ ⲉ̀ⲣⲱⲟⲩ,  ⲟⲩⲟⳣ ⲙ̀ⲡⲉⲣⲉⲛⲧⲉⲛ ⲉ̀ⲯⲟⲩⲛ ⲉ̀ⲡⲓⲣⲁⲥⲙⲟⲥ,  ⲁⲗⲗⲁ ⲛⲁⳣⲙⲉⲛ ⲉ̀ⲃⲟⲗⳣⲁ ⲡⲓⲡⲉⲧⳣⲱⲟⲩ, ⲯⲉⲛ Ⲡⲓⲝ̀ⲣⲓⲥⲧⲟⲥ Ⲓϩⲥⲟⲩⲥ Ⲡⲉⲛϣⲟⲓⲥ. ",
            "Donne-nous aujourd’hui notre pain de ce jour; pardonne-nous nos offenses, comme nous pardonnons aussi à ceux qui nous ont offensés; ne nous soumets pas à la tentation, mais délivre-nous du mal, par le Christ Jésus, Notre Seigneur, car c’est à Toi qu’appartiennent le règne, la puissance et la gloire dans les siècles des siècles. Amen. ",
            "بين أويك إنتي راستي ميف نان إمفوؤو أووه كانيئتيرون نان إيفول إم إفريتي هون إنتين كو إيفول إن نيئتي أوؤن إنتان إيرؤو. أووه إمبير إنتين إيخون إى بي راموس. أللا ناهمين إيفول هابي بيتهوؤو خين بي إخرستوس إيسوس بين شويس. ",
            "خبزنا الذى للغد أعطنا اليوم واغفر لنا ذنوبنا كما نغفر نحن أيضا للمذنبين إلينا. ولا تدخلنا فى تجربة لكن نجنا من الشرير بالمسيح يسوع ربنا. "]
    ],
    [
        [Prefix.commonPrayer + "InTheNameOfJesusOurLord&D=0000&C=Diacon",
            "Ϧⲉⲛ Ⲡⲭ̅ⲥ̅ Ⲓⲏ̅ⲥ̅ ⲡⲉⲛϭⲟⲓⲥ. ",
            "Par le Christ Jésus notre Seigneur. ",
            "خين باخريستوس بينشويس ",
            "بالمسيح يسوع ربنا. "]
    ],
    [
        [Prefix.commonIncense + "ThanksGivingPart1Comment&D=0000&C=Comment",
            " ",
            "ثم يسجد أمام باب الهيكل قائلأ: "]
    ],
    [
        [Prefix.commonPrayer + "BlockShlil&D=0000&C=Priest",
            "Ϣ̀ⲗⲏⲗ ",
            "Prions. ",
            "شليل ",
            "صلوا. "],
        [Prefix.commonPrayer + "BlockShlil&D=0000&C=Diacon",
            "Ⲉ̀ⲡⲓ ⲡ̀ⲣⲟⲥⲉⲩⲭⲏ ⲥ̀ⲧⲁⲑⲏⲧⲉ. ",
            "Pour la prière levons-nous. ",
            "إيبى إبروس إفشي إستاثيتى ",
            "للصلاة قفوا "]
    ],
    [
        [Prefix.commonPrayer + "BlockIriniPassi&D=0000&C=Priest",
            "Ⲓⲣⲏⲛⲏ ⲡⲁⲥⲓ. ",
            "La paix soit avec vous. ",
            "إيريني باسي ",
            "السلام لجميعكم.  "],
        [Prefix.commonPrayer + "BlockIriniPassi&D=0000&C=Assembly",
            "Ⲕⲉ ⲧⲟⲩ ⲡ̀ⲛⲉⲩⲙⲁⲧⲓ ⲥⲟⲩ. ",
            "Et avec vôtre esprit. ",
            "كيطو ابنفماتي سو ",
            "ولروحِكَ أيضاً. "]
    ],
    [
        [Prefix.commonPrayer + "ThanksGivingPart1&D=0000&C=Title",
            "Ⲙⲁⲣⲉⲛϣⲉⲡϩ̀ⲙⲟⲧ ⲛ̀ⲧⲟⲧϥ ",
            "Action de grâce ",
            "صلاة الشكر ",
            "صلاة الشكر "],
        [Prefix.commonPrayer + "ThanksGivingPart1&D=0000&C=Priest",
            "Ⲙⲁⲣⲉⲛϣⲉⲡϩ̀ⲙⲟⲧ ⲛ̀ⲧⲟⲧϥ ⲙ̀ⲡⲓⲣⲉϥ- ⲉⲣⲡⲉⲑⲛⲁⲛⲉϥ ⲟⲩⲟϩ ⲛ̀ⲛⲁⲏⲧ: Ⲫⲛⲟⲩϯ Ⲫⲓⲱⲧ ⲙ̀Ⲡⲉⲛϭⲟⲓⲥ ⲟⲩⲟϩ Ⲡⲉⲛⲛⲟⲩϯ ⲟⲩⲟϩ ⲡⲉⲛⲥⲱⲧⲏⲣ Ⲓⲏ̅ⲥ̅ Ⲡⲭ̅ⲥ̅: Ϫⲉ ⲁϥⲉⲣⲥ̀ⲕⲉⲡⲁⲍⲓⲛ ⲉ̀ϫⲱⲛ: ⲁϥⲉⲣⲃⲟⲏ̀ⲑⲓⲛ ⲉ̀ⲣⲟⲛ: ⲁϥⲁ̀ⲣⲉϩ ⲉ̀ⲣⲟⲛ: ",
            "Rendons grâce  à Dieu le bienfaiteur et miséricordieux, Père de notre Seigneur, Dieu et Sauveur Jésus Christ, parce qu’Il nous a  protégés, aidés, préservés,  reçus avec bonté, traités avec miséricorde, fortifiés et fait parvenir jusqu’à cette heure. ",
            "مارين شييهموت إنتوتك إنبي ريف إربي ثينانيف أووه إننايت افنوتي فيوت إمبينتشويس أووه بيننوتي أووه بينسوتير إيسوس بيخريستوس. جي آفير إسكيباذين إجون آف إرفو إثين إرون آف آريه إيرون آفشوبت إن إرون آفتياسو إيرون ",
            "فلنشكر صانع الخيرات، الرحوم الله، أبا ربَنَا وإلهَنَا ومُخَلصُنَا يسوع المسيح. لأنه سترنا وأعاننا وحفظنا وقبلنا إليه وأشفقَ علينا وعضدنا وأتى بنا إلى هذه الساعة. "],
        [Prefix.commonPrayer + "ThanksGivingPart1&D=0000&C=Priest",
            "ⲁϥϣⲟⲡⲧⲉⲛ ⲉ̀ⲣⲟϥ ⲁϥϯⲁ̀ⲥⲟ ⲉ̀ⲣⲟⲛ: ⲁϥϯⲧⲟⲧⲉⲛ ⲁϥⲉⲛⲧⲉⲛ ϣⲁ ⲉ̀ϩ̀ⲣⲏⲓ ⲉ̀ⲧⲁⲓⲟⲩⲛⲟⲩ ⲑⲁⲓ. Ⲛⲑⲟϥ ⲟⲛ ⲙⲁⲣⲉⲛϯϩⲟ ⲉ̀ⲣⲟϥ ϩⲟⲡⲱⲥ ⲛ̀ⲧⲉϥⲁ̀Ϯⲣⲉϩ ⲉ̀ⲣⲟⲛ: ϧⲉⲛ ⲡⲁⲓⲉ̀ϩⲟⲟⲩ ⲉⲑⲟⲩⲁⲃ ⲫⲁⲓ ⲛⲉⲙ ⲛⲓⲉ̀ϩⲟⲟⲩ ⲧⲏⲣⲟⲩ ⲛ̀ⲧⲉ ⲡⲉⲛⲱⲛϧ: ϧⲉⲛ ϩⲓⲣⲏⲛⲏ ⲛⲓⲃⲉⲛ: ⲛ̀ϫⲉ ⲡⲓⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ Ⲡϭⲟⲓⲥ Ⲡⲉⲛⲛⲟⲩϯ. ",
            "Supplions-Le encore de nous garder en ce saint jour et tous les jours de notre vie en toute paix; Lui qui est Tout-Puissant, le Seigneur notre Dieu. ",
            "آفتي توتين آف إنتين شا إي إهري إتآيونو ثاي ىثوف أون مارين تيهو إيروف هوبوس إنتيف آريه إيرون. خين باي إيهؤو إثؤواب خاي نيم ني إيهؤو تيروف إنتي بينؤنخ خين هيريني نيفين إنجي بي بانتوكراتور ابشويس بينوتي.  ",
            "هو أيضاً فلنسألهُ أن يحفظنا في هذا اليوم المقدس وكل أيام حياتنا بكل سلام، ضابط الكل الربُ إلهُنا.  "]
    ],
    [
        [Prefix.commonPrayer + "DiaconResponsePray&D=0000&C=Diacon",
            "Ⲡⲣⲟⲥⲉⲩⲝⲁⲥⲑⲉ. ",
            "Prions. ",
            "بروس إيفكساسي ",
            "صلوا. "]
    ],
    [
        [Prefix.commonPrayer + "ThanksGivingPart2&D=0000&C=Priest",
            "Ⲫⲛⲏⲃ Ⲡϭⲟⲓⲥ Ⲫⲛⲟⲩϯ ⲡⲓⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ: Ⲫⲓⲱⲧ ⲙ̀Ⲡⲉⲛϭⲟⲓⲥ ⲟⲩⲟϩ Ⲡⲉⲛⲛⲟⲩϯ ⲟⲩⲟϩ ⲡⲉⲛⲥⲱⲧⲏⲣ Ⲓⲏ̅ⲥ̅ Ⲡⲭ̅ⲥ̅: ",
            "Ô Maître Seigneur, Dieu Tout-Puissant, Père de  notre Seigneur, Dieu et Sauveur Jésus-Christ, nous Te rendons grâce, de  toute circonstance, pour toute circonstance et en toute circonstance. ",
            "فنيف بشويس بينوتي بيبانتوكراتور افيوت إمبينشويس أووه بيننوتي أووه بينسوتير إيسوس باخرستوس. تين شيبيهموت انتوتك ناتا هوف نيفين نيم إثفو هوف نيفين نيم خين هوف نيفين. ",
            "أيها السيدُ الربُ الإله ضابط الكل أبو ربَنَا وإلهَنَا ومُخَلصُنا يسوع المسيح، نشكرك على كل حالٍ ومن أجل كل حالٍ وفى كل حالٍ. "],
        [Prefix.commonPrayer + "ThanksGivingPart2&D=0000&C=Priest",
            "ⲧⲉⲛϣⲉⲡϩ̀ⲙⲟⲧ ⲛ̀ⲧⲟⲧⲕ ⲕⲁⲧⲁ ϩⲱⲃ ⲛⲓⲃⲉⲛ ⲛⲉⲙ ⲉⲑⲃⲉ ϩⲱⲃ ⲛⲓⲃⲉⲛ ⲛⲉⲙ ϧⲉⲛ ϩⲱⲃ ⲛⲓⲃⲉⲛ. Ϫⲉ ⲁⲕⲉⲣⲥ̀ⲕⲉⲡⲁⲍⲓⲛ ⲉ̀ϫⲱⲛ: ⲁⲕⲉⲣⲃⲟⲏ̀ⲑⲓⲛ ⲉ̀ⲣⲟⲛ: ⲁⲕⲁ̀ⲣⲉϩ ⲉ̀ⲣⲟⲛ: ⲁⲕϣⲟⲡⲧⲉⲛ ⲉ̀ⲣⲟⲕ: ⲁⲕϯⲁ̀ⲥⲟ ⲉ̀ⲣⲟⲛ: ⲁⲕϯⲧⲟⲧⲉⲛ: ⲁⲕⲉⲛⲧⲉⲛ ϣⲁ ⲉ̀ϩ̀ⲣⲏⲓ ⲉ̀ⲧⲁⲓⲟⲩⲛⲟⲩ ⲑⲁⲓ. ",
            "Parce que Tu nous as protégés, aidés, préservés,  reçus avec bonté, traités avec miséricorde, fortifiés et fait parvenir jusqu’à cette heure. ",
            "جي آك إر إسكيباذين إيجون آك إرفو إثين إرون آك آر إيه إرون آكشوبتين إروك آك تي آسو إرون آك تي توتين آكينتين شا إي إيري إتايونو ثاي. ",
            "لأنكَ سترتنا وأعنتنا وحفظتنا وقبلتنا إليكَ وأشفقتَ علينا وعضدتنا وأتيتَ بنا إلى هذه السـاعة. "]
    ],
    [
        [Prefix.commonIncense + "PrayThatGodHaveMercyOnUs&D=0000&C=Diacon",
            "Ⲧⲱⲃϩ ϩⲓⲛⲁ ⲛ̀ⲧⲉ Ⲫϯ ⲛⲁⲓ ⲛⲁⲛ: ⲛ̀ⲧⲉϥϣⲉⲛϩⲏⲧ ϧⲁⲣⲟⲛ ⲛ̀ⲧⲉϥⲥⲱⲧⲉⲙ ⲉ̀ⲣⲟⲛ: ⲛ̀ⲧⲉϥⲉⲣⲃⲟⲏⲑⲓⲛ ⲉ̀ⲣⲟⲛ: ⲛ̀ⲧⲉϥϭⲓ ⲛ̀ⲛⲓϯϩⲟ ⲛⲉⲙ ⲛⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲛⲏⲉⲑⲟⲩⲁⲃ ⲛ̀ⲧⲁϥ ⲛ̀ⲧⲟⲧⲟⲩ ⲉ̀ϩ̀ⲣⲏⲓ ⲉ̀ϫⲱⲛ ⲉ̀ⲡⲓⲁ̀ⲅⲁⲑⲟⲛ ⲛ̀ⲥⲏⲟⲩ ⲛⲓⲃⲉⲛ. ⲛ̀ⲧⲉϥⲭⲁ ⲛⲉⲛⲛⲟⲃⲓ ⲛⲁⲛ ⲉ̀ⲃⲟⲗ. ",
            "Implorez pour que Dieu ait pitié de nous, qu’Il soit compatissant envers nous, nous écoute et nous aide, qu’Il agrée les demandes et les supplications que ses saints Lui adressent continuellement en notre faveur, et qu’Il nous pardonne nos péchés. ",
            "طوفه هينا إنتي افنوتي ناي نان إنتيف شينهيت خارون إنتيف سوتيم إرون إنتيف إرفويثين إرون إنتيف اتشي إني تيهو نيم نيطوفه إنتيني إثؤواب إنتاف إنطوطو إي إهري إجون إبي آغاثون إنسيو نيفين إنتيفكا إننوفي نان إيفول. ",
            "اطلبوا لكى يرحمنا الله ويتراءف علينا ويَسمعنا ويُعيننا ويقبل سؤالات وطلبات قديسيه منهم بالصلاح عنا في كل حين ويَغفر لنا خطايانا.  "]
    ],
    [
        [Prefix.commonPrayer + "ThanksGivingPart3&D=0000&C=Priest",
            "Ⲉⲑⲃⲉ ⲫⲁⲓ ⲧⲉⲛϯϩⲟ ⲟⲩⲟϩ ⲧⲉⲛⲧⲱⲃϩ ⲛ̀ⲧⲉⲕ ⲙⲉⲧⲁ̀ⲅⲁⲑⲟⲥ ⲡⲓⲙⲁⲓⲣⲱⲙⲓ: ⲙⲏⲓⲥ ⲛⲁⲛ ⲉⲑⲣⲉⲛϫⲱⲕ ⲉ̀ⲃⲟⲗ ⲙ̀ⲡⲁⲓ ⲕⲉ ⲉ̀ϩⲟⲟⲩ ⲉⲑⲟⲩⲁⲃ ⲫⲁⲓ: ⲛⲉⲙ ⲛⲓⲉ̀ϩⲟⲟⲩ ⲏⲣⲟⲩ ⲛ̀ⲧⲉ ⲡⲉⲛⲱⲛϧ: ϧⲉⲛ ϩⲓⲣⲏⲛⲏ ⲛⲓⲃⲉⲛ ⲛⲉⲙ ⲧⲉⲕϩⲟϯ. Ⲫⲑⲟⲛⲟⲥ ⲛⲓⲃⲉⲛ: ⲡⲓⲣⲁⲥⲙⲟⲥ ⲛⲓⲃⲉⲛ: ⲉⲛⲉⲣⲅⲓⲁ̀ ⲛⲓⲃⲉⲛ ⲛ̀ⲧⲉ ⲡ̀ⲥⲁⲧⲁⲛⲁⲥ: ",
            "Pour cela, nous implorons Ta bonté, ô Ami du genre humain, donne nous d’achever ce saint jour et tous les jours de notre vie en toute paix dans Ta crainte. Toute envie, toute tentation, toute œuvre de Satan. ",
            "إثفي فاي تين تيهو أووه إنتيوفه إنتيك ميت أغاثوس، بي مايرومي ميس نان إثرينجوك إفول إمباي كي إيهو إثؤواب شاي، نيم نيهؤو إروف إنتي بينؤنخ، خين هيريني نيفين نيم تيكهوتي فثونوس نيفين، بيراسموس نيفين، إن إرجيا نيفين، إنتي إبساتاناس. ",
            "من أجل هذا نسأل ونطلب من صلاحِكَ يا مُحب البشر امنحنا أن نكمل هذا اليَوم المقدس وكل أيام حياتنا بكل سلام مع خَوفِك. كل حسدٍ وكل تجربةٍ وكل فعل الشيطان: "],
        [Prefix.commonPrayer + "ThanksGivingPart3&D=0000&C=Priest",
            "ⲡ̀ⲥⲟϭⲛⲓ ⲛ̀ⲧⲉ ϩⲁⲛⲣⲱⲙⲓ ⲉⲩϩⲱⲟⲩ: ⲛⲉⲙ ⲡ̀ⲧⲱⲛϥ ⲉ̀ⲡ̀ϣⲱⲓ ⲛ̀ⲧⲉ ϩⲁⲛϫⲁϫⲓ ⲛⲏⲉⲧϩⲏⲡ ⲛⲉⲙ ⲛⲏⲉⲑⲟⲩⲱⲛϩ ⲉ̀ⲃⲟⲗ. Ⲁⲗⲓⲧⲟⲩ ⲉ̀ⲃⲟⲗϩⲁⲣⲟⲛ. Ⲛⲉⲙ ⲉ̀ⲃⲟⲗϩⲁ ⲡⲉⲕⲗⲁⲟⲥ ⲧⲏⲣϥ Ⲛⲉⲙ ⲉ̀ⲃⲟⲗϩⲁ ⲡⲁⲓ ⲙⲁ ⲉⲑⲟⲩⲁⲃ ⲛ̀ⲧⲁⲕ ⲫⲁⲓ. Ⲛⲉⲙ ⲉ̀ⲃⲟⲗϩⲁ ⲧⲁⲓⲉⲕⲕ̀ⲗⲏⲥⲓⲁ ⲫⲁⲓ. ",
            "toute intrigue des hommes méchants, toute attaque des ennemis visibles et invisibles: éloigne-les de nous et de tout ton peuple et de ce lieu saint qui est à Toi et de cette église. ",
            "إبسوتشي ني إنتي هانرومي هينرومي إفهؤو نيم إبتونف إن إبشوي هانجاجي نيتهويب نيم ني إثؤ أونه إيفول آليتوف إفول هارون نيم إفول ها بيكلاؤس تيرف نيم إيفول ها بايما إثؤواب إنتاك شاي نيم إفول ها تاي إي إكليسيا شاي. ",
            "ومؤامرة الناس الأشرار وقيام الأعداء الخفيين والظاهرين، انزعها عنا، وعن سائر شعبك، و عن مَوضعِكَ المُقدس هذا (في بخور عشية) وعن هَذِه الكنيسة (في بخور باكر).  "],
        [Prefix.commonPrayer + "ThanksGivingPart3&D=0000&C=Priest",
            "Ⲛⲏ ⲇⲉ ⲉⲑⲛⲁⲛⲉⲩ ⲛⲉⲙ ⲛⲏⲉ̀ⲧⲉⲣⲛⲟϥⲣⲓ ⲥⲁϩⲛⲓ ⲙ̀ⲙⲱⲟⲩ ⲛⲁⲛ: ϫⲉ ⲛ̀ⲑⲟⲕ ⲡⲉ ⲉ̀ⲧⲁⲕϯ ⲙ̀ⲡⲓⲉⲣϣⲓϣⲓ ⲛⲁⲛ: ⲉ̀ϩⲱⲙⲓ ⲉ̀ϫⲉⲛ ⲛⲓϩⲟϥ ⲛⲉⲙ ⲛⲓϭⲗⲏ: ⲛⲉⲙ ⲉ̀ϫⲉⲛ ϯϫⲟⲙ ⲧⲏⲣⲥ ⲛ̀ⲧⲉ ⲡⲓϫⲁϫⲓ. ",
            "Comble-nous de tous les biens et de tous les dons convenables car c’est Toi qui nous as donné le pouvoir de fouler aux pieds les serpents, les scorpions et toute la puissance de l’ennemi. ",
            "ني جي إثنانيف نيم ني إيترنوفري ساهني إممؤو نان. جي إنثوك بي إتاكتي إمبي إيرشيشي نان. إيهومي إجين نيهوف نيم نيتش لا إجون تي جوم تيرس إنتي بيجاجي. ",
            "أما الصالحات والنافعات فارزقنا إياها لأنكَ أنتَ الذى أعطيتنا السلطان أن ندوس الحيات والعقارب وكل قوة العدو. "]
    ],
    [
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "ثم يكمل سراً: "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "ولا تدخلنا في تجربة لكن نجنا من الشرير بالنعمة والرأفات ومحبة البشر اللواتي لابنك الوحيد ربنا وإلهنا ومخلصنا يسوع المسيح. هذا الذي من قبله، المجد والكرامة والعز والسجود. تليق بك منع ومع الروح القدس المحيي المساوي لك الآن وكل أوان وإلى دهر الدهور كلها آمين. "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "وفي أثناء ذلك، يصعد الكاهن إلى الهيكل ويقدم له الشماس المجمرة فيضع خمس أياد بخور وهو يرشم درج البخور وفي كل مرة يجاوبه الشماس (آمين). ويرتل الشعب أرباع الناقوس. "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "وفي رفع بخور عشية يقول الكاهن هذه الأوشية للإبن سراً: "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "أيها المسيح إلهنا المخوف الحقيقي الابن الوحيد، وكلمة الآب، طيب مسكوب هو اسمك القدوس، في كل مكان يُقدم بخور لاسمك القدوس، وصعيدة طاهرة. "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "ويرد الشماس: "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "صلوا من أجل ذبيحتنا والذين قدموها. "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "ويكمل الكاهن:ـ "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "نسألك يا سيدنا اقبل إليك طلباتنا ولتستقم أمامك صلاتنا مثل بخور. رفع أيدينا ذبيحة مسائية. لأنك أنت هو ذبيحة المساء الحقيقية، الذي أصعدت ذاتك من أجل خطايانا على الصليب المكرم، كإرادة أبيك الصالح. هذا الذي أنت مبارك معه ومع الروح القدس المحي المساوي لك. الآن وكل أوان وإلى دهر الدهور آمين "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "ثم يبخر الكاهن حول المذبح ويطوف ثلاث دورات ويقول الأواشي الثلاث الصغار: "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "أوشية السلامة:ـ "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "ونسألك يا سيدنا، اذكر يا رب سلامة كنيستك الواحدة الوحيدة المقدسة الجامعة الرسولية. "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "أوشية الأباء:ـ  "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "اذكر يا رب بطريركنا الآب المكرم رئيس الكهنة البابا أنبا (....) أوشية الاجتماعات:ـ اذكر يا رب اجتماعتنا باركها. إجعلها أن تكون لنا بغير مانع ولا عائق لنصنعها كمشيئتك المقدسة الطوباوية، بيوت صلاة بيوت طهارة، بيوت بركة، أنعم بها علينا يا رب وعلى عبيدك الآتين بعدنا إلى الأبد. قم أيها الرب الإله وليتفرق جميع أعدائك وليهرب من قدام وجهك كل مبغضي اسمك القدوس. وأما شعبك فليكن بالبركة ألوف ألوف وربوات ربوات يصنعون إرادتك. بالنعمة والرآفات ومحبة البشر اللواتي لابنك الوحيد الجنس ربنا وإلاهنا ومخلصنا يسوع المسيح. هذا الذي من قبله المجد والكرامة والعزة والسجود تليق بك معه ومع الروح القدس المحيي المساوي لك الآن وكل أوان وإلى دهر الدهور آمين. "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "ثم ينزل أمام باب الهيكل ويعطي ثلاث أياد بخور شرقاً وفي كل مرة يخضع برأسه يقول في اليد الأولى:ـ  "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "نسجد لك أيها المسيح مع أبيك الصالح والروح القدس لأنك " + giaki.AR + " وخلصتنا؛ "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "في اليد الثانية:ـ  "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "وأنا مثل كثرة رحمتك أدخل بيتك وأسجد نحو هيكلك المقدس؛ "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "وفي اليد الثالثة: "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "ـ أمام الملائكة أرتل لك وأسجد نحو هيكلك المقدس. "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "ثم يبخر لجهة بحري لأجل السيدة العذراء قائلاً: "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "نعطيكي السلام مع جبرائيل الملاك قائلين: السلام لك يا ممتلئة نعمة الرب معك. "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "ثم يبخر إلى جهة الغرب ويقول: "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "السلام لمصاف الملائكة وسادتي الآباء الرسل وصفوف الشهداء وجميع القديسين. "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "ثم يبخر إلى جهة قبلي ويقول:ـ "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "السلام ليوحنا بن زكريا، السلام للكاهن ابن الكاهن؛ "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=Comment",
            " ",
            "ثم يبخر إلى جهة الشرق ويقول:ـ "],
        [Prefix.commonIncense + "ThanksGivingPart3Comment&D=0000&C=CommentText",
            " ",
            "فلنسجد لمخلصنا محب البشر الصالح لأنه تراءف علينا، أتى وخلصنا. "]
    ],
    [
        [Prefix.commonIncense + "CymbalVersesWates&D=0000&C=Title",
            "Ⲧⲉⲛⲟⲩⲱϣⲧ ⲙ̀Ⲫ̀ⲓⲱⲧ ",
            "Cymbals Verses Adam ",
            "أرباع الناقوس واطس ",
            "أرباع الناقوس واطس "],
        [Prefix.commonIncense + "CymbalVersesWates&D=0000&C=Diacon",
            "Ⲧⲉⲛⲟⲩⲱϣⲧ ⲙ̀Ⲫ̀ⲓⲱⲧ ⲛⲉⲙ Ⲡ̀ϣⲏⲣⲓ: ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ ⲉⲑⲟⲩⲁⲃ: Ϯⲧ̀ⲣⲓⲁⲥ ⲉⲑⲟⲩⲁⲃ: ⲛ̀ⲟ̀ⲙⲟⲟⲩⲥⲓⲟⲥ ",
            "Nous adorons le Père,♪ le Fils, et le Saint-Esprit♪, trinité Sainte, et consubstantielle. ",
            "تين أوؤشت إم افيوت نيم ابشيري♪ نيم ني ابنيفما اثؤواب♪ تيترياس اثؤواب إن أوموسيوس. ",
            "نسجد للآب والابن♪ والروح القدس♪ الثالوث، القدوس، المساوي في الجوهر. "],
        [Prefix.commonIncense + "CymbalVersesWates&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ϯⲉⲕⲕ̀ⲗⲏⲥⲓⲁ: ⲡ̀ⲏⲓ ⲛ̀ⲧⲉ ⲛⲓⲁⲅⲅⲉⲗⲟⲥ: ⲭⲉⲣⲉ ϯⲡⲁⲣⲑⲉⲛⲟⲥ: ⲉ̀ⲧⲁⲥⲙⲉⲥ Ⲡⲉⲛⲥⲱⲧⲏⲣ. ",
            "Salut à l’Église,♪ la maison des anges.♪ Salut à la vierge qui a enfanté notre Sauveur ",
            "شيري تي إكليسيا♪ بي إنتي ني آنجيلوس♪ شيري تي بارثينوس إيتاسميس بينسوتير. ",
            "السلام للكنيسة♪ بيت الملائكة♪ السلام، للعذراء، التي، ولدت، مخلصنا. "]
    ],
    [
        [Prefix.commonIncense + "CymbalVersesAdam&D=0000&C=Title",
            "Ⲁⲙⲱⲓⲛⲓ ⲙⲁⲣⲉⲛⲟ̀ⲩⲱϣⲧ ",
            "Cymbals Verses Adam ",
            "أرباع الناقوس آدام ",
            "أرباع الناقوس آدام "],
        [Prefix.commonIncense + "CymbalVersesAdam&D=0000&C=Diacon",
            "Ⲁⲙⲱⲓⲛⲓ ⲙⲁⲣⲉⲛⲟ̀ⲩⲱϣⲧ: ⲛ̀Ϯⲧ̀ⲣⲓⲁⲥ ⲉⲑⲟⲩⲁⲃ: ⲉ̀ⲧⲉ ⲫ̀Ϯⲓⲱⲧ ⲛⲉⲙ ⲡ̀ϣⲏⲣⲓ: ⲛⲉⲙ ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ ⲉⲑⲟⲩⲁⲃ. ",
            "Venez, prosternons-nous♪ Pour la Sainte Trinité♪ qui est le Père, Fils♪ et l’Esprit-Saint. ",
            "آمويني مارين أؤوشت♪ إن تي اترياس اثؤواب♪ إتي فيوتي نيم ابشيري نيم بي ابنيفما اثؤواب. ",
            "تعالوا فلنسجد♪ للثالوث القدوس♪ الذي هو الآب والابن♪ والروح القدس.  "],
        [Prefix.commonIncense + "CymbalVersesAdam&D=0000&C=Diacon",
            "Ⲁⲛⲟⲛ ϧⲁ ⲛⲓⲗⲁⲟⲥ: ⲛ̀ⲭ̀ⲣⲓⲥⲧⲓⲁⲛⲟⲥ: ⲫⲁⲓ ⲅⲁⲣ ⲡⲉ ⲡⲉⲛⲛⲟⲩϯ: ⲛ̀ⲁ̀ⲗⲏⲑⲓⲛⲟⲥ. ",
            "Nous les peoples Chrétiens♪ car il est notre♪ Dieu En vérité. ",
            "آنون خا ني لاؤس♪ إن اخرستيانوس♪ فاي غار بي بينوتي إن آليثينوس. ",
            "نحن الشعوب♪ المسيحيين♪ لأن هذا هو إلهنا♪ الحقيقي. "],
        [Prefix.commonIncense + "CymbalVersesAdam&D=0000&C=Diacon",
            "Ⲟⲩⲟⲛ ⲟⲩϩⲉⲗⲡⲓⲥ ⲛ̀ⲧⲁⲛ: ϧⲉⲛ ⲑⲏⲉ̀ⲑⲟⲩⲁⲃ Ⲙⲁⲣⲓⲁ: ⲉ̀ⲣⲉ ⲫ̀ⲛⲟⲩϯ ⲛⲁⲓ ⲛⲁⲛ: ϩⲓⲧⲉⲛ ⲛⲉⲥⲡ̀ⲣⲉⲥⲃⲓⲁ. ",
            "Nous espérons♪ en Sainte Marie♪ que Dieu aie pitié de nous par son intercession. ",
            "أو أون أو هلبيس إنتان♪ خين ثي إثؤواب ماريا♪ إري فنوتي ناي نان هيتين ني ابريسفيا. ",
            "لنا رجاء في♪ القديسة مريم♪ الله يرحمنا بشفاعاتها. "],
        [Prefix.commonIncense + "CymbalVersesAdam&D=0000&C=Diacon",
            "Ⲟⲩⲟⲛ ⲟⲩⲙⲉⲧⲥⲉⲙⲛⲟⲥ: ⲛ̀ϩ̀ⲣⲏⲓ ϧⲉⲛ ⲡⲓⲕⲟⲥⲙⲟⲥ: ⲉ̀ⲃⲟⲗϩⲓⲧⲉⲛ ⲡⲓϣ̀ⲗⲏⲗ: ⲛ̀ⲧⲉ ϯⲁⲅⲓⲁ Ⲙⲁⲣⲓⲁ̀ ϯⲡⲁⲣⲑⲉⲛⲟⲥ. ",
            "Tout calme dans le monde♪ est dû à la prière♪ de la sainte vierge Marie. ",
            "أو أون أوميت سيمنوس♪ إن إهري جين بي كوسموس♪ إفول هيتين بي إشلال إنتي تي آجيا ماريا تي بارثينوس. ",
            "كل هدوء في♪ العالم من قبل♪ صلاة القديسة♪ مريم العذراء. "]
    ],
    [
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Title",
            "Ⲭⲉⲣⲉ ⲛⲉ Ⲙⲁⲣⲓⲁ ",
            "Suite Versés du Cymbal ",
            "تابع أرباع الناقوس ",
            "تابع أرباع الناقوس "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ⲛⲉ Ⲙⲁⲣⲓⲁ: ϯϭ̀ⲣⲟⲙⲡⲓ ⲉⲑⲛⲉⲥⲱⲥ: ⲑⲏⲉ̀ⲧⲁⲥⲙⲓⲥⲓ ⲛⲁⲛ: ⲙ̀Ⲫ̀ⲛⲟⲩϯ ⲡⲓⲗⲟⲅⲟⲥ.  ",
            "Salut à toi Marie♪ la belle colombe♪ Celle qui a enfanté pour nous Dieu le Verbe ",
            "شيري ني ماريا♪ تي إتشرومبي إثنيسوس♪ ثي إيتاسميسي نان إم افنوتي بي لوغوس. ",
            "السلام لك يا مريم♪ الحمامة الحسنة♪ التي، ولدت لنا، الله الكلمة.  "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ⲛⲉ Ⲙⲁⲣⲓⲁ: ϧⲉⲛ ⲟⲩⲭⲉⲣⲉ ⲉϥⲟⲩⲁⲃ: ⲭⲉⲣⲉ ⲛⲉ Ⲙⲁⲣⲓⲁ: ⲑ̀ⲙⲁⲩ ⲙ̀ⲫⲏⲉⲑⲟⲩⲁⲃ. ",
            "Salut à toi Marie♪ un saint salut. Salut à toi Marie♪ La mère du Saint. ",
            "شيري ني ماريا♪ خين أوشيري افؤواب♪ شيري ني ماريا اثماف إمفي اثؤواب. ",
            "السلام لك يا مريم♪ سلام مقدس♪ السلام لك يا مريم، ام القدوس. "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ Ⲙⲓⲭⲁⲏⲗ: ⲡⲓⲛⲓϣϯ ⲛ̀ⲁⲣⲭⲓⲁⲅⲅⲉⲗⲟⲥ: ⲭⲉⲣⲉ Ⲅⲁⲃⲣⲓⲏⲗ: ⲡⲓⲥⲟⲧⲡ ⲙ̀ⲡⲓϥⲁⲓϣⲉⲛⲛⲟⲩϥⲓ ",
            "Salut à Michel♪ le grand archange♪ Salut à Gabriel, l’annonciateur élu. ",
            "شيري ميخائيل♪ بينيشتي إن أرشي أنجيلوس♪ شيري غابرييل بيسوتب إمبي فاي شينوفي. ",
            "السلام لميخائيل♪ رئيس الملائكة العظيم♪ السلام لغبريال، المبشر المختار. "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ⲛⲓⲭⲉⲣⲟⲩⲃⲓⲙ: ⲭⲉⲣⲉ ⲛⲓⲥⲉⲣⲁⲫⲓⲙ: ⲭⲉⲣⲉ ⲛⲓⲧⲁⲅⲙⲁ ⲧⲏⲣⲟⲩ: ⲛ̀ⲉ̀ⲡⲟⲩⲣⲁⲛⲓⲟⲛ. ",
            "Salut aux Chérubins♪ salut aux Séraphins♪ salut à tous les grades célestes. ",
            "شيري شيروبيم♪ شيري ني سيرافيم♪ شيري ني طاغما تيرو إن إيبورانيون. ",
            "السلام للشاروبيم♪ السلام للسيرافيم♪ السلام، لجميع، الطغمات، السمائية. "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ Ⲓⲱⲁⲛⲛⲏⲥ: ⲡⲓⲛⲓϣϯ ⲙ̀ⲡ̀ⲣⲟⲇⲣⲟⲙⲟⲥ: ⲭⲉⲣⲉ ⲡⲓⲟⲩⲏⲃ: ⲡ̀ⲥⲩⲅⲅⲉⲛⲏⲥ ⲛ̀Ⲉⲙⲙⲁⲛⲟⲩⲏⲗ ",
            "Salut à Jean♪ le grand précurseur♪ salut au prêtre, Parent d\'Emmanuel.  ",
            "شيري يوآنس♪ بي نيشتي إبروذروموس♪ شيري بيؤويف إبسنجنيس إن إمانوئيل. ",
            "السلام ليوحنا♪ السابق العظيم♪ السلام، للكاهن، نسيب، عمانوئيل.  "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ⲛⲁϭⲟⲓⲥ ⲛ̀ⲓⲟϯ: ⲛ̀ⲁ̀ⲡⲟⲥⲧⲟⲗⲟⲥ: ⲭⲉⲣⲉ ⲛⲓⲙⲁⲑⲏⲧⲏⲥ: ⲛ̀ⲧⲉ Ⲡⲉⲛϭⲟⲓⲥ Ⲓⲏ̅ⲥ̅ Ⲡⲭ̅ⲥ̅. ",
            "Salut à mes seigneurs♪ les pères apôtres♪ salut aux disciples de notre Seigneur Jésus-Christ. ",
            "شيري ناتشويس إنيوتي♪ إن آبوسطولوس♪ شيري ني ماثيتيس♪ إنتي بينتشويس إيسوس بيخريستوس. ",
            "السلام لساداتي♪ وآبائي الرسل♪ السلام، لتلاميذ، ربنا، يسوع المسيح. "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ⲛⲁⲕ ⲱ̀ ⲡⲓⲙⲁⲣⲧⲩⲣⲟⲥ: ⲭⲉⲣⲉ ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲥⲧⲏⲥ: ⲭⲉⲣⲉ ⲡⲓⲁ̀ⲡⲟⲥⲧⲟⲗⲟⲥ: Ⲙⲁⲣⲕⲟⲥ ⲡⲓⲑⲉⲱ̀ⲣⲓⲙⲟⲥ. ",
            "Salut à toi martyr♪ salut à l\'évangéliste♪ salut à l\'apôtre♪ Marc le contemplateur de Dieu. ",
            "شيري ناك أوبي مارتيروس♪ شيري بي إف آنجيليستيس♪ شيري بي أبوسطولوس♪ مارقوس بيثيؤريموس. ",
            "السلام لك أيها الشهيد، السلام♪ للإنجيلي♪ السلام، للرسول، مرقس ناظر الإله. "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ Ⲥⲧⲉⲫⲁⲛⲟⲥ: ⲡⲓϣⲟⲣⲡ ⲙ̀ⲙⲁⲣⲧⲩⲣⲟⲥ: ⲭⲉⲣⲉ ⲡⲓⲁⲣⲭⲓⲇⲓⲁⲕⲱⲛ: ⲟⲩⲟϩ ⲧ̀ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ. ",
            "Salut à Etienne♪ Le premier martyrs♪ salut à l’archidiacre béni. ",
            "شيري استيفانوس♪ بيشورب إممارتيروس♪ شيري بي أرشيذياكون♪ أووه إت إسماروؤت. ",
            "السلام لاسطفانوس♪ أول الشهداء♪ السلام لرئيس الشمامسة المبارك. "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ⲛⲁⲕ ⲱ̀ ⲡⲓⲙⲁⲣⲧⲩⲣⲟⲥ: ⲭⲉⲣⲉ ⲡⲓϣⲱⲓϫ ⲛ̀ⲅⲉⲛⲛⲉⲟⲥ: ⲭⲉⲣⲉ ⲡⲓⲁⲑⲗⲟⲫⲟⲣⲟⲥ: ⲡⲁϭⲟⲓⲥ ⲡ̀ⲟⲩⲣⲟ Ⲅⲉⲱ̀ⲣⲅⲓⲟⲥ. ",
            "Salut à toi ô martyr♪ salut au héros courageux♪ salut au persévérant♪ mon seigneur le roi Georges. ",
            "شيري ناك أوبي مارتيروس♪ شيري بيشويج إن جينيؤوس♪ شيري بي آثلوفوروس؛ باشويس ابؤورو جاؤرجيوس. ",
            "السلام لك أيها الشهيد، السلام♪ للشجاع البطل♪ السلام للابس الجهاد، سيدي الملك، جؤرجيوس.  "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ⲛⲁⲕ ⲱ̀ ⲡⲓⲙⲁⲣⲧⲩⲣⲟⲥ: ⲭⲉⲣⲉ ⲡⲓϣⲱⲓϫ ⲛ̀ⲅⲉⲛⲛⲉⲟⲥ: ⲭⲉⲣⲉ ⲡⲓⲁⲑⲗⲟⲫⲟⲣⲟⲥ: Ⲑⲉⲟ̀ⲇⲱⲣⲟⲥ ⲡⲓⲥ̀ⲧⲣⲁⲧⲓⲗⲁⲧⲏⲥ. ",
            "Salut à toi ô martyr♪ salut au héros courageux♪ salut au persévérant♪ Théodore le stratège. ",
            "شيري ناك أوبي مارتيروس♪ شيري بيشويج إن جينيؤوس♪ شيري بي آثلوفوروس؛ ثيؤدوروس بي استراتيلاتيس. ",
            "السلام لك أيها الشهيد، السلام♪ للشجاع البطل♪ السلام للابس الجهاد♪ ثيؤدوروس، الأسفهسلار. "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ⲛⲁⲕ ⲱ̀ ⲡⲓⲙⲁⲣⲧⲩⲣⲟⲥ: ⲭⲉⲣⲉ ⲡⲓϣⲱⲓϫ ⲛ̀ⲅⲉⲛⲛⲉⲟⲥ: ⲭⲉⲣⲉ ⲡⲓⲁⲑⲗⲟⲫⲟⲣⲟⲥ: ⲫⲓⲗⲟⲡⲁⲧⲏⲣ Ⲙⲉⲣⲕⲟⲩⲣⲓⲟⲥ. ",
            "Salut à toi ô martyr♪ salut au héros courageux♪ salut au persévérant, Philopatir Mercorios. ",
            "شيري ناك أوبي مارتيروس♪ شيري بيشويج إن جينيؤوس♪ شيري بي آثلوفوروس؛ فيلوباتير مارقوريوس. ",
            "السلام لك أيها الشهيد، السلام♪ للشجاع البطل♪ السلام للابس الجهاد، فيلوباتير مرقوريوس. "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲭⲉⲣⲉ ⲛⲁⲕ ⲱ̀ ⲡⲓⲙⲁⲣⲧⲩⲣⲟⲥ: ⲭⲉⲣⲉ ⲡⲓϣⲱⲓϫ ⲛ̀ⲅⲉⲛⲛⲉⲟⲥ: ⲭⲉⲣⲉ ⲡⲓⲁⲑⲗⲟⲫⲟⲣⲟⲥ: ⲡⲓⲁ̀ⲅⲓⲟⲥ ⲁⲃⲃⲁ Ⲙⲏⲛⲁ. ",
            "Salut à toi ô martyr♪ salut au héros courageux♪ salut au persévérant♪ abba Mina. ",
            "شيري ناك أوبي مارتيروس♪ شيري بيشويج إن جينيؤوس♪ شيري بي آثلوفوروس؛ بي آجيوس آبا مينا. ",
            "السلام لك أيها الشهيد، السلام♪ للشجاع البطل♪ السلام للابس الجهاد، القديس آبا مينا. "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ϩⲓⲧⲉⲛ ⲛⲓⲡ̀ⲣⲉⲥⲃⲓⲁ: ⲛ̀ⲧⲉ ϯⲑⲉⲟ̀ⲧⲟⲕⲟⲥ ⲉⲑⲟⲩⲁⲃ Ⲙⲁⲣⲓⲁ: Ⲡ̀ϭⲟⲓⲥ ⲁ̀ⲣⲓϩ̀ⲙⲟⲧ ⲛⲁⲛ ⲙ̀ⲡⲓⲭⲱ ⲉ̀ⲃⲟⲗ ⲛ̀ⲧⲉ ⲛⲉⲛⲛⲟⲃⲓ. ",
            "Par les intercessions de Sainte Marie♪ Mère de Dieu♪ Seigneur accorde nous la rémission de nos péchés. ",
            "هيتن ني ابريسفيا♪ انتي تي ثيؤطوكوس اثؤواب ماريا♪ ابشويس آري إهموت نان امبي كو إيفول انتي ني نوفي. ",
            "بشفاعات والدة الإله♪ القديسة مريم♪ يا رب أنعم لنا بمغفرة خطايانا.  "],
        [Prefix.commonIncense + "CymablVersesCommon&D=0000&C=Diacon",
            "Ⲉⲑⲣⲉⲛϩⲱⲥ ⲉ̀ⲣⲟⲕ: ⲛⲉⲙ Ⲡⲉⲕⲓⲱⲧ ⲛ̀ⲁ̀ⲅⲁⲑⲟⲥ: ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ ⲉⲑⲟⲩⲁⲃ: ϫⲉ " + giaki.COP + " ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ ⲛⲁⲓ ⲛⲁⲛ.  ",
            "Afin que nous Te louions  avec Ton Père très bon  et le Saint Esprit♪ car Tu " + giaki.FR + " et Tu nous as sauvés. ",
            "اثرين هوس♪ إروك♪ نيم بيكيوت إن أغاثوس♪ نيم بي إبنيفما إثؤواب جي " + giaki.CA + " آكسوتي إممون ناي نان. ",
            "لكى نسبحك مع، أبيك♪ الصالح والروح القدس♪ لأنك " + giaki.AR + " وخلصتنا أرحمنا. "]
    ],
    [
        [Prefix.commonIncense + "Comment1&D=0000&C=Comment",
            " ",
            "وعند فراغ الشعب من الترتيل، يلتفت الكاهن إلى الشرق والشماس واقف خلفه ويقول الكاهن:ـ "]
    ],
    [
        [Prefix.incenseVespers + "PriestLitaniesComment&D=0000&C=Comment",
            " ",
            "يبخر الكاهن حول المذبح ويطوف ثلاثة دورات ويقول الأواشي الصغار: أوشية السلامة، أوشية الآباء، أوشية الاجتماعات. ثم ينزل أمام باب الهيكل ويعطي ثلاثة أياد بخور شرقا قائلاً: [....]، ثم يبخر لجهة البحري (يساره) لأجل السيدة العذراء ويقول [...]، ثم يبخر إلى جهة الغرب (خلفه) ويقول [...]، ثم يبخر إلى جهة قبلي (يمينه) ويقول [...]. وعندما يفرغ الشعب من ترتيل أرباع الناقوس، يلتفت الكاهن إلى الشرق والشماس واقف خلفه ويقول الأواشي الكبار: المرضى، المسافرين في باكر، الراقدين (في عشية وفي باكر السبوت)، أو القرابين في الآحاد والأعياد والأيام التي ليس فيها صوم انقطاعي. "]
    ],
    [
        [Prefix.incenseDawn + "SickPrayerPart1&D=0000&C=Title",
            "Ⲡⲁⲗⲓⲛ ⲟⲛ ⲙⲁⲣⲉⲛϯϩⲟ ",
            "Oraison des maladies ",
            "أوشية المرضى ",
            "أوشية المرضى "],
        [Prefix.incenseDawn + "SickPrayerPart1&D=0000&C=Priest",
            "Ⲡⲁⲗⲓⲛ ⲟⲛ ⲙⲁⲣⲉⲛϯϩⲟ ⲉ̀ Ⲫⲛⲟⲩϯ ⲡⲓⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ: ⲫⲓⲱⲧ ⲙ̀Ⲡⲉⲛϭⲟⲓⲥ ⲟⲩⲟϩ ⲡⲉⲛⲛⲟⲩϯ ⲟⲩⲟϩ Ⲡⲉⲛⲥⲱⲧⲏⲣ Ⲓⲏⲥⲟⲩⲥ Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ.  Ⲧⲉⲛϯϩⲟ ⲟⲩⲟϩ ⲧⲉⲛⲧⲱⲃϩ  ⲛ̀ⲧⲉⲕⲙⲉⲧⲁ̀ⲅⲁⲑⲟⲥ ⲡⲓⲙⲁⲓⲣⲱⲙⲓ.  Ⲁⲣⲓϥ̀ⲙⲉⲩⲓ̀ Ⲡϭⲟⲓⲥ ⲛ̀ⲛⲏⲉⲧϣⲱⲛⲓ ⲛ̀ⲧⲉ ⲡⲉⲕⲗⲁⲟⲥ.  ",
            "Implorons encore Dieu Tout-Puissant, Père de notre Seigneur, Dieu et Sauveur Jésus-Christ. Nous invoquons et nous supplions Ta bonté ô Ami du genre humain, Souviens-Toi Seigneur, des malades de Ton peuple. ",
            "بالين اون مارين تيهو إى إفنوتى بى بانطوكراطور إفيوت إم بين شويس أووه بيننوتى أووه بين سوتير إيسوس بى إخرستوس، تين تيهو أووه تين طفه إنتيك ميت آغاثوس بى ماى رومى آرى إفميفئى إبشويس إن نيئتشونى إنتى بيك لاؤس. ",
            "وأيضاً فلنسأل الله ضابط الكل أبا ربنا وإلهنا ومخلصنا يسوع المسيح نسأل ونطلب من صلاحِكَ يا مُحب البشر، اذكر يا ربُ مرضى شعبك. "],
        [Prefix.incenseDawn + "SickPrayerPart1&D=0000&C=Diacon",
            "Ⲧⲱⲃϩ ⲉ̀ϫⲉⲛ ⲛⲉⲛⲓⲟϯ ⲛⲉⲙ ⲛⲉⲛⲥ̀ⲛⲏⲟⲩ ⲉⲧϣⲱⲛⲓ ϧⲉⲛ ϫⲓⲛϣⲱⲛⲓ ⲛⲓⲃⲉⲛ: ⲓ̀ⲧⲉ ϧⲉⲛ ⲡⲁⲓⲧⲟⲡⲟⲥ ⲓ̀ⲧⲉ ϧⲉⲛ ⲙⲁⲓ ⲛⲓⲃⲉⲛ ϩⲓⲛⲁ ⲛ̀ⲧⲉ Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ Ⲡⲉⲛⲛⲟⲩϯ ⲉⲣϩ̀ⲙⲟⲧ ⲛⲁⲛ ⲛⲉⲙⲱⲟⲩ ⲙ̀ⲡⲓⲟⲩϫⲁⲓ ⲛⲉⲙ ⲡⲓⲧⲁⲗϭⲟ: ⲛ̀ⲧⲉϥⲭⲁ ⲛⲉⲛⲛⲟⲃⲓ ⲛⲁⲛ ⲉⲃⲟⲗ. ",
            "Implorez pour nos pères, et nos frères les malades de toute maladie, ici ou ailleurs pour que Le Christ notre Dieu leur accorde ainsi qu’à nous la santé et la guérison, et nous pardonne nos péchés. ",
            "طفه إيجين نينوتى نيم نين إسنيو إتشونى خين جنشونى نيفين إيتى خين باى توبوس إيتى خين ماى نيفين هينا إنتى بى خرستوس بيننوتى إرإهموت نان نيمؤو إمبى أوجاى نيم بى طالتشو إنتيف كانين نوفى نان إيفول. ",
            "اطلبوا عن آبائنا وإخوتنا المرضى بكل مرضٍ إن كان فى هذا المسكن أو بكل مَوضع لكى المسيح إلهُنا يُنعم علينا وعليهم بالعافية والشفاء ويغفر لنا خطايانا. "]
    ],
    [
        [Prefix.commonPrayer + "KyrieElieson&D=0000&C=Assembly",
            "Ⲕⲩⲣⲓⲉ̀ ⲉ̀ⲗⲉⲏ̀ⲥⲟⲛ. ",
            "Pitié Seigneur. ",
            "كيرياليسون ",
            "يا ربُ ارحم. "]
    ],
    [
        [Prefix.incenseDawn + "SickPrayerPart2&D=0000&C=Priest",
            "Ⲉⲁⲕϫⲉⲙⲡⲟⲩϣⲓⲛⲓ ϧⲉⲛ ϩⲁⲛⲛⲁⲓ ⲛⲉⲙ ϩⲁⲛⲙⲉⲧϣⲉⲛϩⲏⲧ ⲙⲁⲧⲁ-ⲗϭⲱⲟⲩ. Ⲁⲗⲓⲟⲩⲓ̀ ⲉ̀ⲃⲟⲗ ϩⲁⲣⲱⲟⲩ ⲛⲉⲙ ⲉ̀ⲃⲟⲗ ϩⲁⲣⲟⲛ ⲛ̀ⲛⲓϣⲱⲛⲓ ⲛⲓⲃⲉⲛ ⲛⲉⲙ ⲓⲁⲃⲓ ⲛⲓⲃⲉⲛ: ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ ⲛ̀ⲧⲉ ⲛⲓϣⲱⲛⲓ ϭⲟϫⲓ ⲛ̀ⲥⲱϥ. Ⲛⲏⲉ̀ⲧⲁⲩⲱⲥⲕ ⲉⲩϣ̀ⲧⲏⲟⲩⲧ ϧⲉⲛ ⲛⲓⲓⲁⲃⲓ ⲙⲁⲧⲟⲩⲛⲟⲥⲟⲩ ⲟⲩⲟϩ ⲙⲁⲛⲟⲙϯ ⲛⲱⲟⲩ. Ⲛⲏⲉⲧⲧ̀ϩⲉⲙⲕⲏⲟⲩⲧ ⲛ̀ⲧⲟⲧⲟⲩ ⲛ̀ⲛⲓⲡ̀ⲛⲉⲩⲙⲁ ⲛ̀ⲁ̀ⲕⲁⲑⲁⲣⲧⲟⲛ ⲁ̀ⲣⲓⲧⲟⲩ ⲧⲏⲣⲟⲩ ⲛ̀ⲣⲉⲙϩⲉ.  ",
            "Comble-les de Ta miséricorde et de Ta compassion et guéris-les. Éloigne d’eux et de nous toute maladie et toute affliction. Chasse l’esprit du mal. Ceux qui demeurent longtemps frappés par la maladie, relève-les et console-les. Ceux que tourmentent les esprits impurs, délivre-les. ",
            "إى أكجيم بوشينى خين هان. ناى نيم هان متشينهيت ماطالتشو أليئوى إيفول هارؤونيم إيفول هارون إنشونى نيفين نيم يافى نيفين بى إبنيفما إنتى نى شونى إتشوجى إنسوف نيئتاف أوسك إيفئشتيوت خين نى يافى ماطونوسو أووه ما نومتى نؤو نيئت إتهمكيوت إنطوطو إن نى إبنيفما إن أكاثارطون أريتو تيرو إنريمهى. ",
            "تعهّدهم بالمراحم والرأفات. اشفهم. انزع عنهم وعنا كل مرضٍ وكل سقم وروح الأمراض اطرده. والذين أبطأوا مطروحين في الأمراض أقمهم وعزّهم والمُعذبون من الأرواح النجسة اعتقهم جميعاً.  "],
        [Prefix.incenseDawn + "SickPrayerPart2&D=0000&C=Priest",
            "Ⲛⲏⲉⲧ ϧⲉⲛ ⲛⲓϣ̀ⲧⲉⲕⲱⲟⲩ ⲓⲉ ⲛⲓⲙⲉⲧⲁ̀ⲗⲱⲥ: ⲓⲉ ⲛⲏⲉⲧⲭⲏ ϧⲉⲛ ⲛⲓⲉⲝⲟⲣⲓⲥⲧⲓⲁ̀: ⲓⲉ ⲛⲓⲉⲭⲙⲁⲗⲱⲥⲓⲁ̀: ⲓⲉ ⲛⲏⲉ̀ⲧⲟⲩⲁ̀ⲙⲟⲛⲓ ⲙ̀ⲙⲱⲟⲩ ϧⲉⲛ ⲟⲩⲙⲉⲧⲃⲱⲕ ⲉⲥⲉⲛϣⲁϣⲓ: Ⲡϭⲟⲓⲥ ⲁ̀ⲣⲓⲧⲟⲩ ⲧⲏⲣⲟⲩ ⲛ̀ⲣⲉⲙϩⲉ ⲟⲩⲟϩ ⲛⲁⲓ ⲛⲱⲟⲩ.  ",
            "Les détenus dans les prisons et les cachots souterrains, les exilés, les bannis et ceux qui sont maintenus dans une amère servitude, délivre-les, Seigneur, et aie pitié d’eux. ",
            "نيئت خين نى إشتيكؤو بى نى ميت آلوس يى نيئتكى خين نى أكسوريستيا يى نيخمالوسيا بى نيئيتو أمونى امؤو خين أو ميتفوك إيسى إنشاشى إبشويس أريتو تيرو إنريمهى أووه ناى نؤو. ",
            "الذينَ في السجون أو المطابق أو الذين في النفي أو السبي أو المقبوض عليهم فى عبودية مرّة، يا رب اعتقهم جميعهم وارحمهم.  "],
        [Prefix.incenseDawn + "SickPrayerPart2&D=0000&C=Priest",
            "Ϫⲉ ⲛ̀ⲑⲟⲕ ⲡⲉⲧⲃⲱⲗ ⲛ̀ⲛⲏⲉⲧⲥⲱⲛϩ ⲉ̀ⲃⲟⲗ: ⲟⲩⲟϩ ⲉⲧⲧⲁϩⲟ ⲉ̀ⲣⲁⲧⲟⲩ ⲛ̀ⲛⲏⲉ̀ⲧⲁⲩⲣⲁϧⲧⲟⲩ ⲉ̀ϧ̀ⲣⲏⲓ. Ϯϩⲉⲗⲡⲓⲥ ⲛ̀ⲧⲉ ⲛⲏⲉ̀ⲧⲉ ⲙ̀ⲙⲟⲛⲧⲟⲩ ϩⲉⲗⲡⲓⲥ: ϯⲃⲟⲏ̀ⲑⲓⲁ̀ ⲛ̀ⲧⲉ ⲛⲏⲉ̀ⲧⲉ ⲙ̀ⲙⲟⲛⲧⲟⲩ ⲃⲟⲏ̀ⲑⲟⲥ.  Ⲑⲛⲟⲙϯ ⲛ̀ⲧⲉ ⲛⲏⲉⲧⲟⲓ ⲛ̀ⲕⲟⲩϫⲓ ⲛ̀ϩⲏⲧ: ⲡⲓⲗⲩⲙⲏⲛ ⲛ̀ⲧⲉ ⲛⲏⲉⲧⲭⲏ ϧⲉⲛ ⲡⲓⲭⲓⲙⲱⲛ.   ",
            "Car c’est Toi qui délies ceux qui sont enchaînés, et relèves ceux qui sont tombés. Tu es l’espoir de ceux qui n’ont plus d’espérance, le secours de ceux qui n’ont plus d’assistance. Tu es la consolation de ceux qui ont le cœur serré, le port de ceux qui sont dans la tempête. ",
            "جى إنثوك بيتفول إن نيؤتسونه إيفول أووه إتكاهو إيراتو إن نيئتافراختوى إى إخرى. تى هيلبيس إنتى نيئتى إممون تو هيلبيس تى فوئيثيا إنتى نيئتى إممون توفوئيثوس إثنومتى إنتى نيتؤوى إنكوجى إنهيت بى ليمين إنتينى إتكى خين بى شيمون. ",
            "لأنكَ أنتَ الذى تحل المربوطين وتقيمُ الساقطين. رجاء من ليس له رجاء. ومُعين من ليس له مُعين. عزاء صغيري القلوب. ميناء الذين في العاصف. "],
        [Prefix.incenseDawn + "SickPrayerPart2&D=0000&C=Priest",
            "Ⲯⲩⲭⲏ ⲛⲓⲃⲉⲛ ⲉⲧϩⲉϫϩⲱϫ ⲟⲩⲟϩ ⲉⲧⲟⲩⲁ̀ⲙⲟⲛⲓ ⲉ̀ϫⲱⲟⲩ Ⲙⲟⲓ ⲛⲱⲟⲩ Ⲡⲟ̅ⲥ̅ ⲛ̀ⲟⲩⲛⲁⲓ: ⲙⲟⲓ ⲛⲱⲟⲩ ⲛ̀ⲟⲩⲙ̀ⲧⲟⲛ: ⲙⲟⲓ ⲛⲱⲟⲩ ⲛ̀ⲟⲩⲭ̀ⲃⲟⲃ:  ⲙⲟⲓ ⲛⲱⲟⲩ ⲛ̀ⲟⲩϩ̀ⲙⲟⲧ: ⲙⲟⲓ ⲛⲱⲟⲩ ⲛ̀ⲟⲩⲃⲟⲏ̀ⲑⲓⲁ̀: ⲙⲟⲓ ⲛⲱⲟⲩ ⲛ̀ⲥⲱⲧⲏⲣⲓⲁ̀: ⲙⲟⲓ ⲛⲱⲟⲩ ⲛ̀ⲟⲩⲙⲉⲧⲣⲉϥⲭⲱ ⲉ̀ⲃⲟⲗ ⲛ̀ⲧⲉ ⲛⲟⲩⲛⲟⲃⲓ ⲛⲉⲙ ⲛⲟⲩⲁ̀ⲛⲟⲙⲓⲁ̀. ",
            "Les âmes tourmentées et captives, Seigneur, aie pitié d’elles. Donne-leur le repos et la fraîcheur. Donne-leur la grâce. Secours-les, donne-leur le salut, accorde-leur le pardon de leurs péchés et de leurs iniquités. ",
            "إبسيشى نيفين إتهيجهوج أووه إيطو أمونى إيجؤو موى نوؤو إبشويس إن أوناى، موى نوؤو إن أو إمطون موى نوؤوإن أو إكفوف موى نوؤ إن أوإهموت موى نوؤوإن أوسوتيريا موى نوؤو إن أومتريفكوإيفول إنتى نونوفى نيم نو آنوميا. ",
            "كل الأنفس المتضايقة أو المقبوض عليها، أعطها يارب رحمة أعطها نياحا أعطها برودة أعطها نعمة أعطها معونة أعطها خلاصاً أعطها غفران خطاياها وآثامها. "],
        [Prefix.incenseDawn + "SickPrayerPart2&D=0000&C=Priest",
            "Ⲁⲛⲟⲛ ⲇⲉ ϩⲱⲛ Ⲡϭⲟⲓⲥ ⲛⲓϣⲱⲛⲓ ⲛ̀ⲧⲉ ⲛⲉⲛⲯⲩⲭⲏ ⲙⲁⲧⲁⲗϭⲱⲟⲩ: ⲟⲩⲟϩ ⲛⲁ ⲛⲉⲛⲕⲉⲥⲱⲙⲁ ⲁ̀ⲣⲓⲫⲁϧⲣⲓ ⲉⲣⲱⲟⲩ. Ⲡⲓⲥⲏⲓⲛⲓ ⲙ̀ⲙⲏⲓ ⲛ̀ⲧⲉ ⲛⲉⲛⲯⲩⲭⲏ ⲛⲉⲙ ⲛⲉⲛⲥⲱⲙⲁ: ⲡⲓⲉ̀ⲡⲓⲥⲕⲟⲡⲟⲥ ⲛ̀ⲧⲉ ⲥⲁⲣⲝ ⲛⲓⲃⲉⲛ:  ϫⲉⲙⲡⲉⲛϣⲓⲛⲓ ϧⲉⲛ ⲡⲉⲕⲟⲩϫⲁⲓ  ",
            "Quant à nous, Seigneur, guéris les maladies de nos âmes et soigne celles de nos corps, Ô Médecin véritable de nos âmes et de nos corps, Maître de toute chair, accorde-nous Ton Salut.  ",
            "انون ذى هون إبشويس نى شونى إنتى نين إبسيشى ماطالتشو أووه نان إن كى سوما أريف إخرىإيروؤو بى سينى إممى إنتى نين إبسيشى نيم نين سوما بى إبيكوبوس إنتى ساركس نيفين، جيمبينشينى خين بيك اوجاى. ",
            "ونحن أيضاً يا رب أمراض نفوسنا اشفها والتي لأجسادنا عافها. أيها الطبيب الحقيقي الذى لأنفسنا وأجسادنا يا مُدبر كل جسد تعهدنا بخلاصك.  "]
    ],
    [
        [Prefix.commonPrayer + "ThanksGivingPart4&D=0000&C=Priest",
            "Ϧⲉⲛ ⲡⲓϩ̀ⲙⲟⲧ ⲛⲉⲙ ⲛⲓⲙⲉⲧϣⲉⲛϩⲏⲧ ⲛⲉⲙ ϯⲙⲉⲧⲙⲁⲓⲣⲱⲙⲓ: ⲛ̀ⲧⲉ ⲡⲉⲕⲙⲟⲛⲟⲅⲉⲛⲏⲥ ⲛ̀Ϣⲏⲣⲓ: Ⲡⲉⲛⲟ̅ⲥ̅ ⲟⲩⲟϩ Ⲡⲉⲛⲛⲟⲩϯ: ⲟⲩⲟϩ Ⲡⲉⲛⲥⲱⲧⲏⲣ Ⲓⲏⲥⲟⲩⲥ Ⲡⲓⲭⲣⲓⲥⲧⲟⲥ. ",
            " ",
            " ",
            "بالنعمة والرآفات ومحبة البشر اللواتي لابنك الوحيد الجنس، ربنا وإلهنا ومخلصنا يسوع المسيح.  "],
        [Prefix.commonPrayer + "ThanksGivingPart4&D=0000&C=Priest",
            "Ⲫⲁⲓ ⲉ̀ⲧⲉ ⲉ̀ⲃⲟⲗϩⲓⲧⲟⲧϥ ⲉ̀ⲣⲉ ⲡⲓⲱ̀ⲟⲩ ⲛⲉⲙ ⲡⲓⲧⲁⲓⲟ̀ ⲛⲉⲙ ⲡⲓⲁ̀ⲙⲁϩⲓ ⲛⲉⲙ ϯⲡ̀ⲣⲟⲥⲕⲩⲛⲏⲥⲓⲥ: ⲉⲣⲡ̀ⲣⲉⲡⲓ ⲛⲁⲕ ⲛⲉⲙⲁϥ: ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ ⲉⲑⲟⲩⲁⲃ ⲛ̀ⲣⲉϥⲧⲁⲛϧⲟ ⲟⲩⲟϩ ⲛ̀ⲟ̀ⲙⲟⲟⲩⲥⲓⲟⲥ ⲛⲉⲙⲁⲕ. ",
            " ",
            " ",
            "هذا الذي من قبله المجد والكرامة والعزة والسجود. تليق بك معه ومع الروح القدس. المحيي المساوي لك. "],
        [Prefix.commonPrayer + "ThanksGivingPart4&D=0000&C=Priest",
            "Ϯⲛⲟⲩ ⲛⲉⲙ ⲛ̀ⲥⲏⲟⲩ ⲛⲓⲃⲉⲛ ⲛⲉⲙ ϣⲁ ⲉ̀ⲛⲉϩ ⲛ̀ⲧⲉ ⲛⲓⲉ̀ⲛⲉϩ ⲧⲏⲣⲟⲩ: ⲁ̀ⲙⲏⲛ. ",
            " ",
            " ",
            "الآن وكل أوان وإلى دهر الدهور. آمين. "]
    ]
];
function checkForDuplicates() {
    PrayersArray.forEach(table => {
        let filtered = PrayersArray.filter(t => baseTitle(t[0][0]) == baseTitle(table[0][0]));
        if (filtered.length > 1) {
            console.log('Found duplicated', filtered);
        }
    });
    console.log('ended');
}
