const copticReadingsDates = getCopticReadingsDates();
document.addEventListener("DOMContentLoaded", startApp);
/**
 * This function starts the App by setting a number of global variables like the dates, displaying the home page/main menu buttons, etc.
 */
async function startApp() {
    if (localStorage.fontSize)
        setFontSize(localStorage.fontSize);
    DetectFingerSwipe();
    if (localStorage.selectedDate) {
        let newDate = new Date(), selectedDate = new Date(Number(localStorage.selectedDate)); //We create a date from the date saved in th localStorage
        //selectedDate.setTime();
        if (!checkIfDateIsToday(selectedDate)) {
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
    showChildButtonsOrPrayers(btnMainMenu); //!Caution: btnMain must be displayed after the dates and the Season have been set. Otherwise, btn Psalmody will not change its title
    (async function loadTextScripts() {
        //! We must load the text scripts after the dates were set and the 'giaki' variable was defined
        let textFiles = [
            "./Build/modules/DeclarePrayersArray.js",
            "./Build/modules/DeclarePrayersSequences.js",
            "./Build/modules/DeclareGospelVespersArray.js",
            "./Build/modules/DeclareGospelDawnArray.js",
            "./Build/modules/DeclareStPaulArray.js",
            "./Build/modules/DeclareKatholikonArray.js",
            "./Build/modules/DeclarePraxisArray.js",
            "./Build/modules/DeclareSynaxariumArray.js",
            "./Build/modules/DeclareGospelMassArray.js",
            "./Build/modules/DeclareGospelNightArray.js",
            "./Build/modules/DeclarePropheciesDawnArray.js",
        ];
        return textFiles.map((link) => {
            let script = document.createElement("script");
            script.src = link;
            script.id = link.split("/Declare")[1].split(".js")[0];
            script.type = "text/javascript";
            script.onload = () => console.log(script.id + " has been loaded");
            if (script.id === "PrayersArray")
                script.onload = () => populatePrayersArrays(); //! We must wait that the PrayersArray script is loaded before calling populatePrayersArrays
            return document.getElementsByTagName("body")[0].appendChild(script);
        });
    })();
    addKeyDownListnerToElement(document, "keydown", undefined);
    //  document.getElementById('homeImg').addEventListener('dblclick', createHtmlArray);
    alert(version);
}
/**
 * @param {string[]} tblRow - an array of the text of the prayer which id matched the id in the idsArray. The first element in this array is the id of the prayer. The other elements are, each, the text in a given language. The prayers array is hence structured like this : ['prayerID', 'prayer text in Arabic', 'prayer text in French', 'prayer text in Coptic']
 * @param {string[]} languagesArray - the languages available for this prayer. The button itself provides this array from its "Languages" property
 * @param {string[]} userLanguages - a globally declared array of the languages that the user wants to show.
 * @param {string} actorClass - a CSS class that will be given to the html element (a div) in which the text of the table row. This class sets the background color of the div according to who is saying the prayer: is it the Priest, the Diacon, or the Assembly?
 * @param {HTMLDivElement} container - this is the html div element to which the newly created row will be appended at the specified position. If omitted, its default value is containerDiv
 */
function createHtmlElementForPrayer(args) {
    if (!args.tblRow || args.tblRow.length === 0)
        return console.log("No valid tblRow[][] object is passed to createHtmlElementForPrayer() ");
    if (!args.actorClass)
        args.actorClass = splitTitle(args.tblRow[0])[1];
    if (args.actorClass) {
        let parsed = JSON.parse(localStorage.showActors).filter((el) => el[0].EN === args.actorClass); //localStorage.showActors is an array where each element is the actor object (i.e., a {AR:string, FR:string, EN:sstring}) and its status as boolean: i.e. an array of [[{actor}, boolean], [{actor}, boolean]]
        if (parsed.length > 0 && parsed[0][1] === false)
            return; //If the actor status is false, we will not process the row
    }
    if (!args.actorClass)
        args.actorClass = "NoActor";
    if (!args.userLanguages)
        args.userLanguages = JSON.parse(localStorage.userLanguages);
    if (!args.position)
        args.position = containerDiv;
    let htmlRow, p, lang, text;
    if (!args.container)
        args.container = containerDiv;
    htmlRow = document.createElement("div");
    htmlRow.classList.add("Row"); //we add 'Row' class to this div
    if (localStorage.displayMode === displayModes[1])
        htmlRow.classList.replace("Row", "SlideRow");
    if (args.dataGroup)
        htmlRow.dataset.group = args.dataGroup.replace(/Part\d+/, "");
    if (args.dataRoot)
        htmlRow.dataset.root = args.dataRoot.replace(/Part\d+/, "");
    if (args.actorClass)
        htmlRow.classList.add(args.actorClass);
    if (args.actorClass && args.actorClass.includes("Title")) {
        htmlRow.addEventListener("click", (e) => {
            e.preventDefault;
            collapseOrExpandText({ titleRow: htmlRow });
        }); //we also add a 'click' eventListener to the 'Title' elements
        htmlRow.id = splitTitle(args.tblRow[0])[0]; //we add an id to all the titles in order to be able to retrieve them for the sake of adding a title shortcut in the titles right side bar
    }
    //looping the elemparams.ents containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
    for (let x = 1; x < args.tblRow.length; x++) {
        //x starts from 1 because prayers[0] is the title of the row
        if (!args.tblRow[x] || args.tblRow[x] === " ")
            continue; //we escape the empty strings if the text is not available in all the button's languages
        if (args.actorClass && args.actorClass === "Comments")
            //this means it is a comment
            x === 1 ? lang = 'FR' : lang = "AR";
        else
            lang = args.languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, redrethat's why we start from x-1.
        //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
        if (!args.userLanguages.includes(lang))
            continue;
        p = document.createElement("p"); //we create a new <p></p> element for the text of each language in the 'prayer' array (the 'prayer' array is constructed like ['prayer id', 'text in AR, 'text in FR', ' text in COP', 'text in Language', etc.])
        if (!args.actorClass)
            p.classList.add("PrayerText"); //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
        p.dataset.root = htmlRow.dataset.root; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
        text = args.tblRow[x];
        if (lang)
            p.classList.add(lang);
        if (lang)
            p.lang = lang.toLowerCase();
        p.innerText = text;
        p.addEventListener("dblclick", (ev) => {
            ev.preventDefault();
            localStorage.fontSize !== "1.9" ? setFontSize("1.9") : setFontSize("1");
            //toggleAmplifyText(ev.target as HTMLElement, "amplifiedText");
        }); //adding a double click eventListner that amplifies the text size of the chosen language;
        p.addEventListener("contextmenu", (event) => {
            if (localStorage.editingMode != "true")
                return;
            event.preventDefault();
            if (!confirm("Do you want to edit the table?"))
                return;
            if (!htmlRow.dataset.root)
                return;
            startEditingMode({
                clear: true,
                arrayName: getArrayNameFromArray(getTablesArrayFromTitlePrefix(htmlRow.dataset.root)),
                tableTitle: htmlRow.dataset.root,
                operator: { equal: true }, //!We need to look for the table by the exact title beacause some titles like 'NativityParamoun' or 'BaptismParamoun' may be retrieved if the Season is 'Nativity' or 'Baptism'
            });
        });
        htmlRow.appendChild(p); //the row which is a <div></div>, will encapsulate a <p></p> element for each language in the 'prayer' array (i.e., it will have as many <p></p> elements as the number of elements in the 'prayer' array)
    }
    try {
        //@ts-ignore
        args.position.el
            ? //@ts-ignore
                args.position.el.insertAdjacentElement(
                //@ts-ignore
                args.position.beforeOrAfter, htmlRow)
            : //@ts-ignore
                args.position.appendChild(htmlRow);
        return htmlRow;
    }
    catch (error) {
        console.log("an error occured: position = ", args.position, " and tblRow = ", args.tblRow);
        console.log(error);
    }
}
/**
 * Shows a bookmark link in the right side bar for each title in the currently displayed prayers
 * @param {NodeListOf<>Element} titlesCollection  - a Node list of all the divs containing the titles of the different sections. Each div will be passed to addTitle() in order to create a link in the right side bar pointing to the div
 * @param {HTMLElement} rightTitlesDiv - the right hand side bar div where the titles will be displayed
 * @param {boolean} clear - indicates whether the side bar where the links will be inserted, must be cleared before insertion
 */
async function showTitlesInRightSideBar(titlesCollection, rightTitlesDiv, clear = true, dataGroup, append = true) {
    let titlesArray = [];
    //this function shows the titles in the right side Bar
    if (!rightTitlesDiv)
        rightTitlesDiv = sideBarTitlesContainer;
    if (clear)
        rightTitlesDiv.innerHTML = ""; //we empty the side bar
    let bookmark;
    titlesArray = titlesCollection.map((titleRow) => {
        titleRow.id += titlesCollection.indexOf(titleRow).toString();
        return addTitle(titleRow);
    });
    /**
     * Adds shortcuts to the diffrent sections by redirecting to the title of the section
     * @param {HTMLElement} titles - a div including paragraphs, each displaying the title of the section in a given language
     */
    function addTitle(titleRow) {
        let titleDiv = document.createElement("div"); //this is just a container
        titleDiv.role = "button";
        if (dataGroup)
            titleDiv.dataset.group = dataGroup;
        else
            titleDiv.dataset.group = titleRow.id;
        titleDiv.classList.add("sideTitle");
        if (titleRow.classList.contains(hidden))
            titleDiv.classList.add(hidden); //if the html element from which we will create the title is hidden, we hide the title as well
        if (append)
            rightTitlesDiv.appendChild(titleDiv);
        else
            rightTitlesDiv.prepend(titleDiv);
        bookmark = document.createElement("a");
        titleDiv.appendChild(bookmark);
        bookmark.href = "#" + titleRow.id; //we add a link to the element having as id, the id of the prayer
        titleDiv.addEventListener("click", () => {
            closeSideBar(rightSideBar); //when the user clicks on the div, the rightSideBar is closed
            collapseOrExpandText({ titleRow: titleRow, collapse: false }); //We pass the 'toggleHidden' paramater = false in order to always show/uncollapse the sibligns
        });
        let defaultLang = appendTitleTextParagraph(titleRow, defaultLanguage);
        let foreignLang = appendTitleTextParagraph(titleRow, foreingLanguage);
        if (defaultLang && foreignLang)
            foreignLang.innerText = "\n" + foreignLang.innerText;
        //If the container is an 'Expandable' container, we hide the title
        if (titleRow.parentElement &&
            titleRow.parentElement.classList.contains("Expandable"))
            titleDiv.classList.add(hidden);
        return titleDiv;
    }
    function appendTitleTextParagraph(titlesRow, className, limit = 50) {
        let parag = titlesRow.querySelector("." + className);
        if (!parag)
            return;
        let text = parag.innerText
            .split("\n")
            .join(" ")
            .replaceAll(String.fromCharCode(plusCharCode) + " ", "")
            .replaceAll(String.fromCharCode(plusCharCode + 1) + " ", "")
            .replaceAll("  ", " ");
        if (!text)
            return;
        if (text.length > limit)
            text = text.slice(0, limit - 1) + "..."; //We limit the number of characters of the title
        let titleParag = document.createElement("p");
        titleParag.innerText = text;
        titleParag.dir = "auto";
        titleParag.style.lineHeight = "8pt";
        titleParag.style.margin = "0px";
        if (className !== "AR")
            titleParag.style.textAlign = "left";
        else
            titleParag.style.textAlign = "right";
        bookmark.appendChild(titleParag);
        return titleParag;
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
async function showChildButtonsOrPrayers(btn, clear = true) {
    if (!btn)
        return;
    if (containerDiv.dataset.editingMode)
        return showBtnInEditingMode(btn);
    let container = containerDiv;
    if (btn.docFragment)
        container = btn.docFragment;
    hideExpandableButtonsPannel();
    if (clear) {
        expandableBtnsPannel.innerHTML = "";
        containerDiv.style.gridTemplateColumns = "100%";
    }
    if (btn.onClick)
        btn.onClick();
    (function processPrayersSequence() {
        if (!btn.prayersSequence || !btn.languages || !btn.showPrayers)
            return;
        showPrayers({
            prayersSequence: btn.prayersSequence,
            container: container,
            languages: btn.languages,
            clearContainerDiv: true,
            clearRightSideBar: true,
            position: container,
        });
    })();
    (async function processAfterShowPrayers() {
        if (!btn.afterShowPrayers)
            return;
        if (localStorage.displayMode === displayModes[1])
            return await btn.afterShowPrayers(); //!btn.afterShowPrayers() is an async function, that's why we don't call it here when in Presentation Mode because processPrayersSequence() would not have finished inserting the new elements when showPrayersInPresentationMode() is called
        btn.afterShowPrayers();
    })();
    setCSS(Array.from(container.querySelectorAll("div.Row"))); //!Important : setCSSGridTemplate() MUST be called after btn.afterShowPrayres() in order to set the CSS for all the elements that btn.afterShowPrayers() might insert
    applyAmplifiedText(Array.from(container.querySelectorAll("div.Row")));
    (function processBtnChildren() {
        //!CAUTION, this must come after btn.onClick() is called because some buttons are not initiated with children, but their children are added on the fly when their onClick() method  is called
        if (!btn.children || btn.children.length < 1)
            return;
        if (clear) {
            //We will not empty the left side bar unless the btn has children to be shown  in the side bar instead of the children of the btn's parent (btn being itself one of those children)
            sideBarBtnsContainer.innerHTML = "";
        }
        btn.children
            .forEach((childBtn) => {
            //for each child button that will be created, we set btn as its parent in case we need to use this property on the button
            if (btn !== btnGoToPreviousMenu)
                childBtn.parentBtn = btn;
            //We create the html element reprsenting the childBtn and append it to btnsDiv
            createBtn({
                btn: childBtn,
                btnsContainer: sideBarBtnsContainer,
                btnClass: childBtn.cssClass,
            });
        });
    })();
    showTitlesInRightSideBar(Array.from(container.children)
        .filter(div => isTitlesContainer(div)));
    appendGoBackAndGoToMainButtons(btn);
    if (btn.docFragment)
        containerDiv.appendChild(btn.docFragment);
    if (btn === btnMainMenu)
        addSettingsButton();
    if (localStorage.displayMode === displayModes[1])
        showSlidesInPresentationMode();
    (function showMainMenuButtonsInContainerDiv() {
        //If at the end no prayers are displayed in containerDiv, we will show the children of btnMain in containerDiv
        if (btn === btnMainMenu)
            return;
        if (!containerDiv.children || containerDiv.children.length < 1)
            return;
        if (!containerDiv.children[0].classList.contains("mainPageBtns"))
            return;
        btnMainMenu.onClick();
    });
    (function moveSettingsButtonToTheButton() {
        //If settingsBtn is included in the menu (which means it is the main menu), we will move it to the buttom of the menu
        let settingsBtn = sideBarBtnsContainer.querySelector("#settings");
        if (!settingsBtn)
            return;
        sideBarBtnsContainer.append(settingsBtn); //If the button is already there, we move it to the bottom of the list
    })();
}
async function appendGoBackAndGoToMainButtons(btn) {
    (function insertGoBackBtn() {
        //This function inserts an html button that navigates the user to the previous menu from which he had been directed when clicking on the button
        if (!btn.parentBtn)
            return; //If the btn doesn't have a parentBtn, we don't need to insert a GoBack btn.
        if (btn === btnGoToPreviousMenu)
            return; //If the btn is itself a GoBack btn, we will not insert it twice
        if (sideBarBtnsContainer.querySelector("#" + btnGoToPreviousMenu.btnID))
            return; //If the rightSideBar already includes a GoBack button, we will not insert it again
        //Notice that the GoBack Button that we will insert, will only show the children of btn in the sideBar: it will not call showChildButonsOrPrayers() passing btn to it as a parameter. Instead, it will call a function that will show its children in the SideBar
        let goBack = new Button({
            btnID: btnGoToPreviousMenu.btnID,
            label: btnGoToPreviousMenu.label,
            cssClass: btn.cssClass,
            onClick: () => { showChildButtonsOrPrayers(btn.parentBtn), false; },
        });
        createBtn({
            btn: goBack,
            btnsContainer: sideBarBtnsContainer,
            btnClass: goBack.cssClass,
        });
    })();
    (function insertGoToMainMenuButton() {
        //This function will insert a button by which the user will return back to the 'Main Menu' (i.e., the list of buttons displayed when the app starts)
        if (!btn.parentBtn)
            return; //We will insert a "Go To Main Menu" button only if btn has a parent btn (if the btn has a parentBtn it means that btn is a children of another button and is not one of the 'Main Menu' list of buttons. The user may need to return directly to the main menu instead to going to the previous menu)
        if (btn === btnMainMenu)
            return; //Obviously, we will not insert 'Go To Main Menu' Button if the btn is it self btnMain
        if (sideBarBtnsContainer.querySelector("#" + btnMainMenu.btnID))
            return; //If the rightSideBar already includes a 'Go To Main Menu' html button we will not insert it again
        if (btn === btnGoToPreviousMenu)
            return; //We do not insert 'Go To Main Menu' when the GoBack button is clicked
        /*     if (sideBarBtnsContainer.querySelector("#" + btnGoToPreviousMenu.btnID)) return; //If the rightSideBar already includes a GoBack button, we do not insert a 'Go To Main Menu' button */
        createBtn({
            btn: btnMainMenu,
            btnsContainer: sideBarBtnsContainer,
            btnClass: btnMainMenu.cssClass,
        });
    })();
}
;
async function showSlidesInPresentationMode() {
    if (containerDiv.children[0].classList.contains("mainPageBtns"))
        return;
    let children = Array.from(containerDiv.querySelectorAll(".Expandable, .SlideRow, ." + inlineBtnsContainerClass));
    children.forEach((child) => {
        child.classList.add(hidden);
        setSlidesCSS(child);
    }); //!We need to remove all the divs that are empty (some of which are inlineBtns divs that were emptied when the buttons were moved to anohter container). If we do not remove them, they may be given data-same-slide attributes that will interfere with the flow of the slides
    function setSlidesCSS(slideRow) {
        if (!slideRow.classList.contains("SlideRow"))
            return;
        slideRow.style.gridTemplateColumns = setGridColumnsOrRowsNumber(slideRow);
        slideRow.style.gridTemplateAreas = setGridAreas(slideRow);
    }
    createNewSlideGroup(children[0]);
    changeRightSideBarShortCutsOnClick();
    showTheFirstSlideInContainer();
    /**
     * Takes a slideRow and builds a slide from all its siblings subject to a maximum number of words. Each slide is marked by a data-sameSlide attribute added to the hidden HTML divs in containerDiv's children. We thus create groups of divs that will be retrieved each by its data-sameSlide attribute and retrieved as a same slide
     * @param {HTMLDivElement} slideRow - an div element representing a row in the slide that will be displayed
     */
    function createNewSlideGroup(slideRow) {
        if (!slideRow)
            return; //!CAUTION: WE MUST check that slideRow is not undefined. Otherwise, each time countWords(slideRow, sameSideGroup) will be called, it will return an empty array, which will lead to hasDataRoot being undefined, and createNewSlideGroup(nextSlideRow(slideRow)) be called with an undefined argument, and so on again and again, indefinetly
        let sameSlideGroup = [];
        countWords(slideRow, sameSlideGroup);
        sameSlideGroup = sameSlideGroup.filter((div) => div && !isCommentContainer(div)); //We remove any undefined elements as well as all the comments divs in case a comment would have been included
        let hasDataRoot = sameSlideGroup.find((div) => div.dataset.root); //We find the first element in toMerge[] having its data-root attribute set
        if (!hasDataRoot)
            createNewSlideGroup(nextSlideRow(slideRow)); //If there is no element in sameSlideGroup[] having the data-root attribute, it will be useless to continue. We will hence jumb to the next row since we will not be able to create a group of the rows included in sameSlideGroup
        while (sameSlideGroup.length >= 1 &&
            (isTitlesContainer(sameSlideGroup[sameSlideGroup.length - 1]) ||
                sameSlideGroup[sameSlideGroup.length - 1].classList.contains(inlineBtnsContainerClass)))
            sameSlideGroup.pop(); //If the last  div element in sameSlideGroup[] is a title row or an inlineBtns container, we remove it;
        sameSlideGroup.forEach((div) => (div.dataset.sameSlide =
            hasDataRoot.dataset.root + children.indexOf(hasDataRoot))); //We give each slideRow in toMerge[] a data-sameSlide attribute equal to the data-root attribute of the first element having a data-root attribute.
        if (sameSlideGroup.length >= 1)
            createNewSlideGroup(nextSlideRow(sameSlideGroup[sameSlideGroup.length - 1]));
        else
            createNewSlideGroup(nextSlideRow(slideRow));
    }
    /**
     * Cournts the letters in the innerHTML of a group of divs added to a the sameSlideGroup[] array. If the innerHTML does not exceed the countMax, it adds the next div to the sameSlideGroup[] array until the maxCount is reached or exceeded
     * @param {HTMLDivElement} slideRow
     * @param {HTMLDivElement[]} sameSlide
     */
    function countWords(slideRow, sameSlide) {
        if (!slideRow)
            return sameSlide; //We never count the words in an 'Expandable' element
        let countMax = 1850;
        /*     if(slideRow.innerHTML.length > countMax){
          //We are in presence of a sole element with text exceedin the limit, we need to split it;
          let slideClone = slideRow.cloneNode(true) as HTMLDivElement;
          let phrases: string[];
      
          Array.from(slideRow.children as HTMLCollectionOf<HTMLDivElement>)
            .forEach(child => {
              if (child.innerHTML.includes('span')) console.log('there are spans');
              phrases = child.innerHTML.split('. ');
              let parag = slideClone.children[Array.from(slideRow.children).indexOf(child)];
              parag.innerHTML = '';
              phrases
                .forEach(phrase => {
                  if (phrases.indexOf(phrase) > (phrases.length / 2))
                    parag.innerHTML += phrase + '. ';
                  child.innerHTML = child.innerHTML.replace(phrase, '');
                });
            });
          
          slideRow.insertAdjacentElement('afterend', slideClone)
        } */
        sameSlide.push(slideRow); //!CAUTION: we need the slideRow div to be pushed when the function is called, because when it is called for the first time, if the slide is not already in toMerge[], we will add its nextSibling but the first slide itself will never be added to toMerge. However, we never add an 'Expandable' div as an html element that can potentially be included in a Slide
        let inlineBtns = sameSlide.filter((div) => div.classList.contains(inlineBtnsContainerClass)).length; //We count all the inlineBtns elements in sameSlideGroup[]
        let maximum = countMax * (1 - (6 / 100) * inlineBtns); //We take into account the number of inlineBtns included in the sameSlideGroup because they take space in the slide, which reduces the number of words/letters that the slide can include
        if (countInnerHTML(sameSlide) > maximum) {
            sameSlide.pop(); //if the number of letters exceeds the maximum we remove the last slide  added to sameSlideGroup[]
            return;
        }
        countWords(nextSlideRow(slideRow), sameSlide);
    }
    function nextSlideRow(currentSlideRow) {
        if (!currentSlideRow)
            return;
        let next = currentSlideRow.nextElementSibling;
        if (next && (next.children.length < 1 || isCommentContainer(next)))
            return nextSlideRow(next); //We escape comments
        else if (next && next.classList.contains("Expandable"))
            createNewSlideGroup(next.children[0]);
        else if (!next &&
            currentSlideRow.parentElement &&
            currentSlideRow.parentElement.classList.contains("Expandable"))
            return currentSlideRow.parentElement.nextElementSibling;
        else
            return next;
    }
    function countInnerHTML(sameSlideGroup) {
        let count = 0;
        sameSlideGroup.forEach((child) => {
            if (!child.classList.contains(inlineBtnsContainerClass))
                count += child.innerHTML.length;
        });
        return count;
    }
    function changeRightSideBarShortCutsOnClick() {
        return;
        Array.from(sideBarTitlesContainer.children).forEach((btn) => {
            btn.classList.remove(hidden);
            btn.addEventListener("click", onClick);
            function onClick() {
                let target = Array.from(containerDiv.children).find((child) => child.classList.contains("SlideRow") &&
                    child.id === btn.dataset.group &&
                    child.dataset.sameSlide);
                console.log("target = ", target.dataset.root);
                if (!target)
                    return console.log("target was not found ");
                // let dataSameSlide = target.dataset.sameSlide;
                //let slide = buildSlideFromDataSameSlideGroup(dataSameSlide)
                // showOrHideSlide(true, slide.dataset.sameSlide);
                showOrHideSlide(true, target.dataset.sameSlide);
            }
        });
    }
    /**
     * Retrieves the first element of the container having a 'data-same-slide' attribute, and shows the slide containing all the elements with the same 'data-same-slide' attribute
     */
    function showTheFirstSlideInContainer() {
        let hasSameSlide = Array.from(containerDiv.children).find((child) => child.dataset.sameSlide);
        if (hasSameSlide)
            showOrHideSlide(true, hasSameSlide.dataset.sameSlide);
    }
}
/**
 * Shows or hides a slide in Display Presentation Mode
 * @param {boolean} show - tells whether the slide should be displayed or removed. If 'true' the silde will be displayed. Otherwise, it will be removed.
 * @param {string} datSameSlide - This agrument is the value of the data-same-slide attribute, by which we will retrieve the div elements that will be displayed in a new '.Slide' element if show = true.
 * If show = false, this argument can be omitted, however if provided, it means that we want a specific slide to be removed and we want it to be selected by its id (this is needed in some scenarios).
 * @param {boolean} show - a boolean that indicates whether the slide should be displayed or hidden (true = display, flase = hide)
 */
function showOrHideSlide(show, dataSameSlide) {
    let slide;
    if (show && dataSameSlide) {
        return buildSlideFromDataSameSlideGroup(dataSameSlide);
    }
    else if (!show) {
        if (dataSameSlide)
            slide = Array.from(containerDiv.children).find((child) => child.id === dataSameSlide);
        //!We could not perform a querySelector because the format of the id contains characters that are not allowed in querySelector.
        else
            slide = containerDiv.querySelector(".Slide");
        if (slide)
            slide.remove();
    }
    /**
     * Retrieves and returns the div elements having the same data-same-slide attribute
     * @param {string} dataSameSlide - the value of the data-same-slide attribute by which the divs will be filtered and retrieved
     * @param {HTMLElement} container - the html container that will be filtered while looking for the div elements with the same data-same-slide value
     * @return {HTMLDivElement[]} an array of the div elements retrieved
     */
    function buildSlideFromDataSameSlideGroup(dataSameSlide) {
        let sameSlide = Array.from(containerDiv.children).filter((div) => div.dataset.sameSlide &&
            div.dataset.sameSlide === dataSameSlide &&
            !isCommentContainer(div));
        if (!sameSlide || sameSlide.length < 1)
            return;
        let lastActor = getLastActor(); //This is the actor of the last element in the currently displayed slide (if any)
        let slide = document.createElement("div");
        slide.classList.add("Slide");
        slide.id = dataSameSlide;
        sameSlide.forEach((div) => {
            let clone = div.cloneNode(true);
            if (div.classList.contains(inlineBtnsContainerClass))
                //!The cloneNode() methods does not clone the event listners of an element. There is no way to retrieve these events by javascript. We will hence add a data-original-btn-id attribute in which we will store the id of the orignal button, in order to be able to retrieve it later and, if needed, mimic its 'onclick' action
                Array.from(clone.children).forEach((child) => (child.id = "Clone_" + child.id));
            slide.appendChild(clone);
        });
        let slideChildren = Array.from(slide.children);
        slideChildren.forEach((child) => {
            child.classList.remove(hidden);
            child.dataset.sameSlide = "Clone_" + child.dataset.sameSlide; //We remove this attribute in order to avoid getting the children selected if we perform a querySelector by the data-same-slide. In such case the result will be the original div elements not the clones that we appended to the slide.
            child.style.gridTemplateColumns = setGridColumnsOrRowsNumber(child);
            addActorToSlide(child, lastActor);
        });
        // slide.style.gridTemplateRows = setGridRowsTemplateForSlide();
        changeInlineBtnsOnClick();
        containerDiv.prepend(slide);
        return slide;
        /**
         * gets the actor of the last paragraph of the currently exposed slide
         */
        function getLastActor() {
            let oldSlide = containerDiv.querySelector(".Slide");
            if (!oldSlide)
                return;
            return getActor(oldSlide.children[oldSlide.children.length - 1]);
        }
        function addActorToSlide(slideChild, lastActor) {
            let actor = getActor(slideChild);
            if (!actor)
                return;
            if ((slideChildren.indexOf(slideChild) > 0 &&
                actor ===
                    getActor(slideChildren[slideChildren.indexOf(slideChild) - 1])) ||
                (lastActor &&
                    slideChildren.indexOf(slideChild) === 0 &&
                    actor === lastActor) ||
                (lastActor &&
                    slideChildren.indexOf(slideChild) === 1 &&
                    isTitlesContainer(slideChildren[0]) &&
                    actor === lastActor))
                return;
            Array.from(slideChild.children).forEach((parag) => {
                let label = actor[parag.lang.toUpperCase()];
                if (!label)
                    label = actor[defaultLanguage];
                if (!label)
                    return;
                parag.innerHTML =
                    '<span class="actorSpan">' +
                        label +
                        ": </span>" +
                        '<span class="textSpan">' +
                        parag.innerHTML +
                        "</span>";
            });
        }
        function getActor(child) {
            if (!child)
                return undefined;
            return actors.find((actor) => child.classList.contains(actor.EN));
        }
        function changeInlineBtnsOnClick() {
            let inlineBtns = slideChildren.filter((child) => child.classList.contains(inlineBtnsContainerClass));
            if (inlineBtns.length < 1)
                return console.log("inlineBtns is empty");
            (function expandables() {
                let expandBtnsContainer = inlineBtns.filter((container) => container.children.length > 0 &&
                    container.children[0].classList.contains("expand"));
                changeBtnOnClick(expandBtnsContainer, onClickFun);
                function onClickFun(btn) {
                    let container = containerDiv.querySelector("#" + btn.id.split("Clone_")[1] + "Expandable");
                    if (!container)
                        return console.log("could not find the expandable container");
                    let dataSameSlide = Array.from(container.children).find((child) => child.dataset.sameSlide).dataset.sameSlide;
                    let slide = showOrHideSlide(true, dataSameSlide);
                    if (slide)
                        slide.dataset.isExpandable = container.id;
                }
            })();
            (function redirectToAnotherMass() {
                let redirectToBtnsContainer = inlineBtns.filter((container) => container.children.length > 0 &&
                    container.children[0].id.startsWith("Clone_GoTo_"));
                console.log("redirectTo = ", redirectToBtnsContainer);
                changeBtnOnClick(redirectToBtnsContainer, onClickFun);
                function onClickFun(btn) {
                    let originalBtn = Array.from(containerDiv.querySelectorAll("." + inlineBtnClass)).find((childBtn) => childBtn.id === btn.id.split("Clone_")[1]);
                    if (!originalBtn)
                        return console.log("could not find the original button");
                    originalBtn.click();
                    let children = Array.from(containerDiv.children); //!children must be defined after orginalBtn.click() is called otherwise dataSameSlide will get is value from the children of containerDiv as they were before originalBtn.click() is called
                    let dataRoot = btn.id.split("From_")[1];
                    let dataSameSlide = children.find((child) => child.dataset.root &&
                        child.dataset.root === dataRoot &&
                        child.dataset.sameSlide).dataset.sameSlide;
                    showOrHideSlide(true, dataSameSlide);
                }
            })();
            (function MasterBtnMultipleChoices() {
                let masterBtnContainers = inlineBtns.filter((container) => container.children.length > 0 &&
                    container.classList.contains("masterBtnDiv"));
                console.log("masterBtnContainers = ", masterBtnContainers);
                changeBtnOnClick(masterBtnContainers, onClickFun);
                function onClickFun(btn) {
                    let originalBtn = Array.from(containerDiv.querySelectorAll("." + inlineBtnClass)).find((childBtn) => childBtn.id === btn.id.split("Clone_")[1]);
                    if (!originalBtn)
                        return console.log("could not find the original button");
                    originalBtn.click();
                    addEventListenersToPannelBtns();
                    function addEventListenersToPannelBtns() {
                        let pannelBtns = Array.from(expandableBtnsPannel.querySelectorAll(".multipleChoicePrayersBtn"));
                        if (pannelBtns.length < 1)
                            return console.log("No buttons in the pannel");
                        pannelBtns.forEach((childBtn) => childBtn.addEventListener("click", showOptionalPrayer));
                        let btnNext = expandableBtnsPannel.querySelector("#btnNext");
                        if (btnNext)
                            btnNext.addEventListener("click", () => addEventListenersToPannelBtns());
                    }
                    function showOptionalPrayer() {
                        let children = Array.from(containerDiv.querySelectorAll("div[data-optional-prayer]"));
                        children = children.filter((child) => child.dataset.optionalPrayer ===
                            originalBtn.dataset.displayedOptionalPrayer);
                        if (children.length < 1)
                            return console.log("no option prayer is displayed");
                        children.forEach((child) => (child.dataset.sameSlide =
                            child.dataset.root +
                                Array.from(containerDiv.children).indexOf(children[0])));
                        showOrHideSlide(true, children[0].dataset.sameSlide);
                    }
                }
            })();
            function changeBtnOnClick(containers, onClickFun) {
                if (containers.length < 1)
                    return console.log("Couldn't find any btns containers");
                containers.forEach((container) => {
                    let btns = Array.from(container.children);
                    btns.forEach((btn) => btn.addEventListener("click", () => onClickFun(btn)));
                });
            }
        }
    }
}
/**
 * Appends the settings button to the right side bar
 */
function addSettingsButton() {
    if (sideBarBtnsContainer.querySelector("#settings"))
        return; //If a settings button is already included in the rightSideBar menu, we will not add it again
    let settingsBtn;
    settingsBtn = document.createElement("div");
    settingsBtn.id = "settings";
    settingsBtn.classList.add("settings");
    settingsBtn.innerText = "Settings";
    settingsBtn.addEventListener("click", () => showSettingsPanel());
    sideBarBtnsContainer.appendChild(settingsBtn);
}
/**
 * returns a Button for entering the "Editing Mode" and start editings the text
 */
function getEditModeButton() {
    return new Button({
        btnID: "btnEditMode",
        label: {
            AR: "تعديل النص",
            FR: "Enter Editing Mode",
            EN: "Enter Editing Mode",
        },
        onClick: () => {
            if (document.getElementById("selectArray"))
                return; //If a select element is already appended, we return
            //@ts-ignore
            if (!console.save)
                addConsoleSaveMethod(console); //We are adding a save method to the console object
            containerDiv.innerHTML = "";
            containerDiv.dataset.editingMode = "true";
            let editable = [
                "Choose from the list",
                "NewTable",
                'Fun("arrayName", "Table\'s Title")',
                "Edit Day Readings",
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
            select.id = "selectArray";
            select.style.backgroundColor = "ivory";
            select.style.height = "30pt";
            editable.forEach((name) => {
                option = document.createElement("option");
                option.innerText = name;
                option.contentEditable = "true";
                select.add(option);
            });
            document;
            containerDiv.insertAdjacentElement("beforebegin", select);
            select.addEventListener("change", () => startEditingMode({ select: select }));
        },
    });
}
/**
 * Returns an html button element showing a 'Go Back' button. When clicked, this button passes the goTo button or inline button to showchildButtonsOrPrayers(), as if we had clicked on the goTo button
 * @param {Button} goTo - a button that, when the user clicks the 'Go Back' html button element generated by the function, calls showchildButtonsOrPrayers(goTo) thus simulating the action of clicking on the goTo button (its children, inlineBtns, prayers, etc., will be displayed)
 * @param {HTMLElement} btnsDiv - the html element to which the html element button created and returned by the function, will be appended
 * @returns {Promise<HTMLElement>} - when resolved, the function returns the html button element it has created and appended to div
 */
async function createGoBackBtn(goTo, //This is the parentBtn that the GoBack button will navigate to (by showing its children)
btnsDiv, cssClass) {
    //We will create a 'Go Back' and will append it to btnsDiv
    let goBak = new Button({
        btnID: btnGoToPreviousMenu.btnID,
        label: btnGoToPreviousMenu.label,
        cssClass: cssClass,
        onClick: () => {
            btnsDiv.innerHTML = "";
            if (goTo.children)
                goTo.children
                    .forEach((childBtn) => {
                    createBtn({
                        btn: childBtn,
                        btnsContainer: btnsDiv,
                        btnClass: childBtn.cssClass,
                        clear: true,
                    });
                });
            if (goTo.parentBtn)
                //If the parentBtn has itself a parentBtn, we will add to the menu a GoBack button that navigates to the parentBtn of goTo
                createGoBackBtn(goTo.parentBtn, btnsDiv, goTo.parentBtn.cssClass);
            if (btnsDiv === sideBarBtnsContainer)
                addSettingsButton();
        },
    });
    return createBtn({
        btn: goBak,
        btnsContainer: btnsDiv,
        btnClass: goBak.cssClass,
        clear: false,
        onClick: goBak.onClick,
    });
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
 * @param {HTMLElement} btnsContainer  - the div conainer to which the created html button will be appended
 * @param {string} btnClass  - the class that will be given to the button (it is usually the cssClass property of the button)
 * @param {boolean} clear - a boolean indicating whether or not the text already displayed (in containerDiv) should be cleared when the button is clicked. This parameter will only work (i.e., will be useful) if the onClick parameter is missing, because in this case the onClick parameter is set to showChildButtonsOrPrayers(), and clear is passed to it as a parameter. Otherwise, it is the function passed as the onClick paramater that will be called.
 * @param {Function} onClick - this is the function that will be attached to the 'click' eventListner of the button, and will be called when it is clicked
 * @returns {HTMLElement} - the html element created for the button
 */
function createBtn(args) {
    if (!args.btn || !args.btn.label) {
        console.log("The button is either undefined, or has no lable");
        return;
    }
    if (!args.clear)
        args.clear = true;
    let newBtn = document.createElement("button");
    args.btnClass
        ? newBtn.classList.add(args.btnClass)
        : newBtn.classList.add(args.btn.cssClass);
    newBtn.id = args.btn.btnID;
    //Adding the labels to the button
    if (args.btn.label[defaultLanguage])
        editBtnInnerText(args.btn.label[defaultLanguage], defaultLanguage);
    /*   if (args.btn.label[foreingLanguage])
        editBtnInnerText(args.btn.label[foreingLanguage], foreingLanguage); */
    args.btnsContainer.appendChild(newBtn);
    if (args.onClick)
        newBtn.onclick = (event) => {
            event.preventDefault;
            args.onClick();
        };
    else
        newBtn.onclick = (event) => {
            event.preventDefault;
            showChildButtonsOrPrayers(args.btn, args.clear);
        }; //If no onClick parameter/argument is passed to createBtn(), and the btn has any of the following properties: children/prayers/onClick or inlinBtns, we set the onClick parameter to a function passing the btn to showChildButtonsOrPrayers
    function editBtnInnerText(text, btnClass) {
        if (!text)
            return;
        let btnLable = document.createElement("p");
        btnLable.innerText = text;
        btnLable.classList.add("btnText");
        if (btnClass)
            btnLable.classList.add(btnClass);
        newBtn.appendChild(btnLable);
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
        ["1307", "1903", "2111", "0402", "0403", "0804", "1002"],
        [
            "1703",
            "1301",
            "3001",
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
            "0902",
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
            "2201",
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
            "2302",
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
            "2901",
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
            "2602",
        ],
        ["0109", "1612", "2105", "2110", "0304"],
        ["0206", "2504", "0704", "0711", "2002"],
        ["0210", "3006"],
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
            "0301",
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
            "1401",
        ],
        ["0313", "1310"],
        ["0405", "1608", "1609", "1611", "2404", "2906"],
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
            "1006",
        ],
        ["0605", "0604", "0806"],
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
            "2501",
        ],
        ["0903", "0106", "0303", "0407", "1201"],
        ["1009", "0812"],
        ["1202", "1509"],
        ["1203", "1210"],
        ["1312", "2107"],
        ["1402", "2507"],
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
            "0912",
        ],
        ["1601", "2807", "0909"],
        ["1610", "1104", "1506", "1603", "1705", "0204"],
        ["1701", "1007", "1212"],
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
            "2502",
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
            "1902",
        ],
        ["2101", "1107", "1407", "2301"],
        ["2202", "1804", "0406"],
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
            "2801",
        ],
        ["2204", "3007"],
        ["2205", "1309", "1710", "1909", "2310", "0510", "0904", "0908", "2402"],
        ["2308", "1910", "2312", "2711", "2712", "0609", "0710", "0809", "0703"],
        ["2409", "0810"],
        ["2503", "2509", "2511", "2808", "0505", "0802", "2802"],
        ["2601", "1103", "1304", "1606", "0712"],
        ["2605", "0512"],
        ["2702", "1411", "1809", "1912", "2707", "0506", "0811", "0905"],
        ["2703", "1604", "2311", "0503", "0607", "1012", "2902"],
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
            "1802",
        ],
        ["2905", "1810"],
        ["3008", "0211", "2003", "2309", "2710", "0111", "0911", "3002"],
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
    let direction;
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
        if (!expandableBtnsPannel.classList.contains(hidden))
            return; //If the expandable pannel is not hidden, it means we entered the settings pannel or we are choosing a prayer from a multiple choices screen. We do not associate any action to the figuer swipe
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
                direction = "left";
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
                direction = "right";
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
                direction = "down";
                if (localStorage.displayMode === displayModes[1])
                    goToNextOrPreviousSlide(undefined, direction);
            }
            else {
                /* up swipe */
                direction = "up";
                if (localStorage.displayMode === displayModes[1])
                    goToNextOrPreviousSlide(undefined, direction);
            }
        }
        /* reset values */
        xDown = null;
        yDown = null;
    }
    return direction;
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
    Array.from(containerDiv.querySelectorAll("P"))
        .filter((p) => p.lang === target.lang)
        .forEach((p) => {
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
 * If args.wordTable is omitted, this function creates div elements for each string[] (row) in each table (i.e., string[][]) referenced in the button's (i.e., args.btn) prayersSequence, which is a string[] containing an ordered list of the titles of the tables of prayers that will be shown when the button is clicked. If args.wordTable is provided, the function will create div elements for each row (i.e. string[]) of this table.
 * @param {Button} btn
 * @param {string[]} prayersSequence - if wordTable is missing, the function will retrieve the tables from the titles in the prayersSequence. If this argument is missing, it will be set to btn.prayersSequence.
 * @param {DocumentFragment | HTMLDivElement} container - the html element to which the created divs will be appended at the position provided by the "position" argument.
 * @param {boolean} clearContainer - tells wether the containerDiv content needs to be cleared. If ommitted, its default value is true.
 *  @param {Boolean} clearSideBar - tells wether the right sideBar needs to be cleared. If ommitted, its default value is true.
 * @param {HTMLElement|{beforeOrAfter:insertPosition, el:HtmlElement}} position - if it is an HTML Element, the newly created divs will be appended to this html element. If it is an object, the newly created divs will be placed in the position provided (the position is of type insertPosition) by the beforeOrAfter property, in relation to the html element provied in the el property
 * @param {string[][]} wordTable - If a table is passed as argument, the function will create and return div elements for each row (i.e., each string[]) in the table. If omitted, the function will retrieve all the tables referenced in the button's (i.e. args.btn) prayers' sequence (i.e. args.btn.prayersSequence) and will create html divs for each row (i.e. string[]) in each table.
 */
function showPrayers(args) {
    if (!args.prayersSequence && !args.table)
        return console.log("You must provide either a prayersSequence, or a table. None of those arguments is provided");
    (function setDefaults() {
        //Setting container, and the values for the missing arguments
        if (!args.container)
            args.container = containerDiv;
        if (!args.position)
            args.position = args.container;
        if (args.clearContainerDiv !== false)
            args.clearContainerDiv = true;
        if (args.clearContainerDiv === true)
            containerDiv.innerHTML = "";
        if (args.clearRightSideBar !== false)
            args.clearRightSideBar = true;
        if (args.clearRightSideBar === true)
            sideBarTitlesContainer.innerHTML = ""; //this is the right side bar where the titles are displayed for navigation purposes
    })();
    closeSideBar(leftSideBar);
    let date, tables = [];
    (function processPrayersSequence() {
        if (args.table)
            return;
        if (!args.prayersSequence)
            return console.log("The prayersSequences is missing, we cannot retrieve the tables");
        args.prayersSequence
            .forEach((tableTitle) => {
            //If no string[][] was passed in the arguments, we will retrieve the table from its title (prayer)
            if (!tableTitle)
                return console.log("No tableTitle");
            //If the date value is already set in the title of the table, we do not add it again
            if (tableTitle.includes("&D="))
                date = "";
            else
                date = "&D=" + copticReadingsDate; //this is the default case where the date is not set, and will hence be given the value of the copticReadingsDate.
            tableTitle += date; //we add the date to the title of the table
            tables.push(findTable(tableTitle, getTablesArrayFromTitlePrefix(tableTitle)));
        });
    })();
    if (args.table)
        tables.push(args.table);
    if (tables.length === 0)
        return;
    return processTables();
    function processTables() {
        //We will return an HTMLDivElement[] of all the divs that will be created from wordTable
        let htmlDivs = [];
        let entireTable, dataGroup, dataRoot;
        tables.forEach((table) => {
            if (!table)
                return;
            entireTable = unfoldPlaceHolders(table);
            dataGroup = splitTitle(entireTable[0][0])[0]; //This will not change and will serve to set the dataset.group property of all the div elements that will be created for the table
            entireTable.forEach((row) => htmlDivs.push(processRow(row)));
        });
        return htmlDivs;
        function processRow(row) {
            if (!row)
                return;
            if (!row[0].startsWith(Prefix.same))
                dataRoot = splitTitle(row[0])[0]; //Each time a row has its own title (which means the row is the first row in a table), we will set the dataset.root of this row and the following rows to the value of row[0]
            return createHtmlElementForPrayer({
                tblRow: row,
                dataGroup: dataGroup,
                dataRoot: dataRoot,
                languagesArray: args.languages,
                position: args.position,
                container: args.container,
            }) || undefined;
        }
        function unfoldPlaceHolders(table) {
            if (!table.find(row => row[0].startsWith(Prefix.placeHolder)))
                return table;
            let newTable = [...table], placeHolder, placeHolders = table.filter(row => row[0].startsWith(Prefix.placeHolder));
            placeHolders
                .forEach(row => {
                placeHolder = findTable(row[1], getTablesArrayFromTitlePrefix(row[1])) || undefined;
                if (!placeHolder)
                    return;
                if (placeHolder.find(row => row[0].startsWith(Prefix.placeHolder)))
                    //If the returned table also has placeHolders amongst its rows, we will unfold the placeHolders.
                    placeHolder = unfoldPlaceHolders(placeHolder);
                newTable.splice(newTable.indexOf(row), 1, ...placeHolder);
            });
            return newTable;
        }
        ;
    }
    ;
}
/**
 * returns the perfix according to the
 */
function getMassPrefix(btnID) {
    if (btnID === btnMassStBasil.btnID)
        return Prefix.massStBasil;
    if (btnID === btnMassStGregory.btnID)
        return Prefix.massStGregory;
    if (btnID === btnMassStCyril.btnID)
        return Prefix.massStCyril;
}
/**
 * Uses the prefix at the begining of the title of a table or a row (i.e. Prefi.something) to find the string[][][] array where a table which title starts with the same prefix, should be found.
 * @param {string} title: the title starting with a prefix, from which the string[][][] is retrived
 * @return {string[][][]} - the array in which a table which title starts with such prefix, should be found
 */
function getTablesArrayFromTitlePrefix(title) {
    if (!title)
        return;
    let array = PrayersArraysKeys.find((entry) => title.startsWith(entry[0]));
    if (array)
        return array[2]();
}
/**
 * Returns the name of the array passed to it as an argument
 * @param {string[][][]} array
 */
function getArrayNameFromArray(array) {
    let keys = PrayersArraysKeys.find((key) => key[2]() === array);
    if (keys)
        return keys[1];
}
/**
 * This function mainly sets the the CSS gridAreasTemplate, the number of grid columns, and the width of each column for the provided list of html elements. It also other CSS properties (inserts + or - signs for titles, encircules the beam note with a span, etc.)
 * @param {NodeListOf<Element>} Rows - The html elements for which we will set the css. These are usually the div children of containerDiv
 * @param {HTMLElement[]} - the html divs for which we want to set their CSS.
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
        .forEach((row) => {
        if (!row)
            return; //!Caution: in some scenarios, htmlRows might contain undefined rows. We need to check for this in order to avoid erros
        if (row.children.length === 0)
            row.classList.add(hidden); //If the row has no children, it means that it is a row created as a name of a table or as a placeholder. We will hide the html element
        //Setting the number of columns and their width for each element having the 'Row' class for each Display Mode
        row.style.gridTemplateColumns = setGridColumnsOrRowsNumber(row);
        //Defining grid areas for each language in order to be able to control the order in which the languages are displayed (Arabic always on the last column from left to right, and Coptic on the first column from left to right)
        row.style.gridTemplateAreas = setGridAreas(row);
        (function addRightBorders() {
            let rowChildren = Array.from(row.children);
            let gridAreas = row.style.gridTemplateAreas
                .replaceAll('"', "")
                .split(" ");
            if (gridAreas.length <= 1)
                return;
            gridAreas.forEach((area) => {
                if (gridAreas.indexOf(area) === gridAreas.length - 1)
                    return;
                rowChildren.find((child) => child.lang.toUpperCase() === area).style.borderRightStyle = "groove";
            });
        })();
        if (isTitlesContainer(row)) {
            //This is the div where the titles of the prayer are displayed. We will add an 'on click' listner that will collapse the prayers
            row.role = "button";
            /*  addDataGroupsToContainerChildren(
               row.classList[row.classList.length - 1],
               row,
               htmlRows
             ); */
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
        if (row.dataset.root
            &&
                [
                    Prefix.praxis,
                    Prefix.katholikon,
                    Prefix.stPaul,
                    Prefix.gospelDawn,
                    Prefix.gospelVespers,
                    Prefix.gospelNight,
                    Prefix.gospelMass,
                    Prefix.synaxarium,
                    Prefix.propheciesDawn,
                    Prefix.bookOfHours,
                ].find((prefix) => row.dataset.root.startsWith(prefix)))
            replaceQuotes(paragraphs); //If the text is one of the "Readings", we replace the quotes signs
    });
}
/**
 * Replaces the quotes ("") signs in the text by a span containing the relevant quotes sign acording the language
 * @param {HTMLPargraphElement[]} paragraphs  - the html pragraphs containing the quotes signs that need to be replaced
 */
function replaceQuotes(paragraphs) {
    let splitted;
    paragraphs
        .filter((paragraph) => !paragraph.classList.contains("COP") &&
        !paragraph.classList.contains("CA"))
        .forEach((paragraph) => {
        if (paragraph.classList.contains("FR")) {
            paragraph.innerHTML = paragraph.innerHTML
                .replaceAll(String.fromCharCode(171), "<q>")
                .replaceAll(String.fromCharCode(187), "</q>");
        }
        else if (paragraph.classList.contains("AR")) {
            splitted = paragraph.innerHTML.split('"');
            if (splitted.length < 2)
                return; //If splitted contains only one element, it means there are no quotes marks in the paragraph's text
            splitted
                .filter((part) => splitted.indexOf(part) % 2 !== 0) //This will give an array containing only parts 1, 3, 5, etc.
                .forEach((part) => (splitted[splitted.indexOf(part)] = "<q>" + part + "</q>"));
            paragraph.innerHTML = splitted.join("");
        }
    });
}
/**
 * Returns a string representing the grid areas for an html element with a 'display:grid' property, based on the "lang" attribute of its children
 * @param {HTMLElement} row - an html element having children and each child has a "lang" attribute
 * @returns {string} representing the grid areas based on the "lang" attribute of the html element children
 */
function setGridAreas(row) {
    if (!row || row.children.length < 1)
        return;
    let areas = Array.from(row.children).map(child => child.lang.toUpperCase());
    if (areas.indexOf('AR') === 0 &&
        !row.classList.contains("Comments") &&
        !row.classList.contains("CommentText"))
        areas.reverse(); //if the 'AR' is the first language, it means it will be displayed in the first column from left to right. We need to reverse the array in order to have the Arabic language on the last column from left to right
    return '"' + areas.join(" ") + '"'; //we should get a string like ' "AR COP FR" ' (notice that the string marks " in the beginning and the end must appear, otherwise the grid-template-areas value will not be valid)
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
    let children = Array.from(containerDiv.querySelectorAll('div'))
        .filter(div => div.dataset.group); //!We must use querySelectorAll because some elements are not direct children of containerDiv (e.g. they may be nested in an expandable element)
    let sameDataGroupTitles = children
        .filter((div) => isTitlesContainer(div)
        &&
            div.dataset.group === params.titleRow.dataset.group); //Those are the "Title" divs having the same data-group as params.titleRow
    if (sameDataGroupTitles.indexOf(params.titleRow) === 0) {
        //if params.titleRow is the first title having the same data-group, we will toggle the 'hidden' class for all the div elements with the same data-group.
        toggleHidden(children.filter(div => div !== params.titleRow && div.dataset.group === params.titleRow.dataset.group));
    }
    else {
        //we will toggle the 'hidden' class for all the div elements with the same data-root.
        toggleHidden(children.filter(div => div !== params.titleRow && div.dataset.root === params.titleRow.dataset.root));
    }
    function toggleHidden(htmlElements) {
        htmlElements
            .forEach(div => {
            if (params.titleRow.dataset.isCollapsed && !div.classList.contains(hidden))
                div.classList.add(hidden);
            else if (div.classList.contains(hidden))
                div.classList.remove(hidden);
        });
    }
    ;
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
function collapseAllTitles(htmlRows) {
    if (!htmlRows || htmlRows.length === 0)
        return;
    if (localStorage.displayMode === displayModes[1])
        return;
    htmlRows
        .forEach((row) => {
        if (!isTitlesContainer(row) && !row.classList.contains(hidden))
            row.classList.add(hidden);
        else {
            row.dataset.isCollapsed = "true";
            togglePlusAndMinusSignsForTitles(row);
        }
    });
}
/**
 * Creates an array from all the children of a given html element (container), and filteres the array based on the data-root attribute provided, and on the criteria provided in options
 * @param {HTMLElement | DocumentFragment} container - the html element containing the children that we want to filter based on their data-root attributed
 * @param {string} dataSet - the data-root attribute based on which we want to filter the children of container
 * @param {{equal?:boolean, includes?:boolean, startsWith?:boolean, endsWith?:boolean}} options - the criteria according to which we want the data-root attribute of each child element to mach dataRoot: absolutely equal (===)? startsWith(dataRoot)?, etc.
 * @returns {HTMLDivElement[]} - the children of container filtered based on their data-root attributes
 */
function selectElementsByDataSetValue(container, dataSet, options, dataSetName = 'root') {
    dataSetName = [["root", "data-root"], ["group", 'data-group']].find(el => el[0] === dataSetName)[1];
    let children = Array.from(container.querySelectorAll("div")).filter((div) => div.attributes[dataSetName]);
    if (!options)
        options = { equal: true };
    if (options.equal)
        return children.filter((div) => div.attributes[dataSetName].value === dataSet);
    else if (options.includes)
        return children.filter((div) => div.attributes[dataSetName].value.includes(dataSet));
    else if (options.startsWith)
        return children.filter((div) => div.attributes[dataSetName].value.startsWith(dataSet));
    else if (options.endsWith)
        return children.filter((div) => div.attributes[dataSetName].value.endsWith(dataSet));
}
/**
 *
 * @param {string[][][]} filteredPrayers - An array containing the optional prayers for which we want to display html button elements in order for the user to choose which one to show
 * @param {Button} btn
 * @param {HTMLElement} btnsDiv - The html element in which each prayer will be displayed when the user clicks an inline button representing this prayer
 * @param {Object{AR:string, FR:'string'}} btnLabels - An object containing the labels of the master button that the user will click to show a list of buttons, each representing a prayer in selectedPrayers[]
 * @param {string} masterBtnID - The id of the master button
 */
async function showMultipleChoicePrayersButton(args) {
    if (!args.anchor)
        console.log("anchor missing");
    if (!args.masterBtnDiv && args.anchor) {
        args.masterBtnDiv = document.createElement("div"); //a new element to which the inline buttons elements will be appended
        args.anchor.insertAdjacentElement("afterend", args.masterBtnDiv); //we insert the div after the insertion position
    }
    (async function createMasterBtn() {
        let btn = new Button({
            btnID: args.masterBtnID,
            label: args.btnLabels,
            children: await createBtnsForPrayers(),
            pursue: false,
            cssClass: inlineBtnClass,
            onClick: () => {
                let groupOfNumber = 4;
                //We show the inlineBtnsDiv (bringing it in front of the containerDiv by giving it a zIndex = 3)
                showExpandableBtnsPannel(args.masterBtnID, true);
                //When the prayersMasterBtn is clicked, it will create a new div element to which it will append html buttons element for each inlineBtn in its inlineBtns[] property
                let newDiv = document.createElement("div");
                newDiv.id = args.masterBtnID + "Container";
                //Customizing the style of newDiv
                newDiv.classList.add(inlineBtnsContainerClass);
                //We set the gridTemplateColumns of newDiv to a grid of 3 columns. The inline buttons will be displayed in rows of 3 inline buttons each
                newDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(newDiv, undefined, 2);
                //We append newDiv  to inlineBtnsDiv before appending the 'next' button, in order for the "next" html button to appear at the buttom of the inlineBtnsDiv. Notice that inlineBtnsDiv is a div having a 'fixed' position, a z-index = 3 (set by the showInlineBtns() function that we called). It hence remains visible in front of, and hides the other page's html elements in the containerDiv
                expandableBtnsPannel.appendChild(newDiv);
                expandableBtnsPannel.style.borderRadius = "10px";
                let startAt = 0;
                //We call showGroupOfSisxPrayers() starting at inlineBtns[0]
                showGroupOfNumberOfPrayers(btn, startAt, newDiv, groupOfNumber);
            },
        });
        (function createMasterBtnHtml() {
            createBtn({
                btn: btn,
                btnsContainer: args.masterBtnDiv,
                btnClass: btn.cssClass,
                clear: false,
                onClick: btn.onClick,
            });
            args.masterBtnDiv.classList.add(inlineBtnsContainerClass);
            args.masterBtnDiv.classList.add("masterBtnDiv");
            args.masterBtnDiv.style.gridTemplateColumns = "100%";
        })();
        return btn;
    })();
    /**
     * Shows a group of html buttons, each button shows a prayer. A button next permits to navigate through the list of html buttons
     */
    function showGroupOfNumberOfPrayers(masterBtn, startAt, btnsDiv, groupOfNumber) {
        let childBtn;
        (function createHtmlButtonNext() {
            if (masterBtn.children.length <= groupOfNumber)
                return; //We don't create next button if the nubmer of optional prayers is less or equal to the defined number of prayers to be displayed each time
            let next = new Button({
                btnID: "btnNext",
                label: { AR: "التالي", FR: "Suivants" },
                cssClass: inlineBtnClass,
            });
            //if the number of prayers is > than the groupOfNumber AND the remaining prayers are >0 then we show the next button
            if (masterBtn.children.length - startAt > groupOfNumber) {
                //We create the "next" Button only if there is more than 6 inlineBtns in the prayersBtn.inlineBtns[] property
                next.onClick = () => btnNextOnClick(true);
            }
            else if (masterBtn.children.length - startAt <= groupOfNumber) {
                next.label.AR = "عودة";
                next.label.FR = "Retour";
                next.onClick = () => btnNextOnClick(false);
            }
            if (!next.onClick)
                return; //If no onClick function was assigned to next, we do not create the next button
            createBtn({
                btn: next,
                btnsContainer: expandableBtnsPannel,
                btnClass: next.cssClass,
                clear: false,
                onClick: next.onClick,
            }); //notice that we are appending next to inlineBtnsDiv directly not to newDiv (because newDiv has a display = 'grid' of 2 columns. If we append to it, 'next' button will be placed in the 1st cell of the last row. It will not be centered). Notice also that we are setting the 'clear' argument of createBtn() to false in order to prevent removing the 'Go Back' button when 'next' is passed to showchildButtonsOrPrayers()
            function btnNextOnClick(forward = true) {
                //When next is clicked, we remove all the html buttons displayed in newDiv (we empty newDiv)
                btnsDiv.innerHTML = "";
                //We then remove the "next" html button itself (the "next" button is appended to inlineBtnsDiv directly not to newDiv)
                expandableBtnsPannel.querySelector("#" + next.btnID).remove();
                //We set the starting index for the next group of inline buttons
                if (forward)
                    startAt += groupOfNumber;
                else
                    startAt = 0;
                //We call showGroupOfSixPrayers() with the new startAt index
                showGroupOfNumberOfPrayers(masterBtn, startAt, btnsDiv, groupOfNumber);
            }
        })();
        (function createPrayersHtmlButtons() {
            for (let n = startAt; n < startAt + groupOfNumber && n < masterBtn.children.length; n++) {
                //We create html buttons for the 1st 6 inline buttons and append them to newDiv
                childBtn = masterBtn.children[n];
                if (!foreingLanguage && !childBtn.label[defaultLanguage])
                    return; //If no foreign language has been set by the user, and the prayer is not availble in the defaultLanguage (we check this by seeing if there is a label in this language), we will not create the btn
                if (!childBtn.label[defaultLanguage] && !childBtn.label[foreingLanguage])
                    return; //Also if a foreign language has been set by the user, but the prayer is not availble in neither the defaultLanguage  nor the default language (we check this by seeing if there is a label in each language), we will not create the btn
                createBtn({
                    btn: childBtn,
                    btnsContainer: btnsDiv,
                    btnClass: childBtn.cssClass,
                    clear: false,
                    onClick: childBtn.onClick,
                });
            }
        })();
    }
    ;
    /**
     *Creates a new Button for each optional prayer
     @return {Promise<Button[]>}
     */
    async function createBtnsForPrayers() {
        let btns;
        btns = args.filteredPrayers.map((table) => {
            //for each string[][][] representing a table in the Word document from which the text was extracted, we create an inlineButton to display the text of the table
            if (table.length === 0)
                return;
            let title = splitTitle(table[0][0])[0];
            let btn = new Button({
                btnID: title,
                label: {
                    AR: table[0][args.languages.indexOf('AR') + 1],
                    FR: table[0][args.languages.indexOf('FR') + 1], //same logic and comment as above
                },
                languages: args.languages,
                cssClass: "multipleChoicePrayersBtn",
                onClick: () => btnOnClick(btn, title),
            });
            return btn;
        });
        if (foreingLanguage)
            btns
                .filter(btn => !btn.label[defaultLanguage] && btn.label[foreingLanguage]) //For any button which prayer is not available in the defaultLanguage, but is available in the foreignLanguage, we will set its defaultLanguage label to be equal to its foreignLanguage lable. We do this, because any button that doesn't have a defaulLangauge label will be excluded from the btns array that the function will return
                .map(btn => {
                btn.label[defaultLanguage] = btn.label[foreingLanguage];
                btns.splice(btns.indexOf(btn), 1); //We remove the button from btns array, and will push it to the array later in order to move it to the end
                return btn;
            })
                .forEach(btn => btns.push(btn));
        return btns.filter(btn => btn.label[defaultLanguage]); //!We return only the btns having a lable in the defaultLanguage
        function btnOnClick(btn, title) {
            let table = findTable(title, getTablesArrayFromTitlePrefix(title)) || undefined;
            console.log(title);
            let container = document.createElement('div');
            if (!table)
                return;
            let masterBtn = Array.from(containerDiv.querySelectorAll("." + inlineBtnClass)).find((child) => child.id === args.masterBtnID);
            //When the prayer button is clicked, we empty and hide the inlineBtnsDiv
            hideExpandableButtonsPannel();
            let shown = Array.from(containerDiv.children)
                .find((div) => div.dataset.optionalPrayer &&
                div.dataset.optionalPrayer === masterBtn.dataset.shown);
            if (shown)
                shown.remove();
            //We call showPrayers and pass inlinBtn to it in order to display the fraction prayer
            let createdElements = showPrayers({
                table: table,
                languages: btn.languages,
                container: container,
                clearContainerDiv: false,
                clearRightSideBar: false,
            }) || undefined;
            if (!createdElements)
                return;
            container.dataset.optionalPrayer = title;
            masterBtn.dataset.shown = title;
            args.masterBtnDiv.insertAdjacentElement('afterend', container);
            //We format the grid template of the newly added divs
            setCSS(createdElements);
            //We apply the amplification of text
            applyAmplifiedText(createdElements);
            //We scroll to the button
            createFakeAnchor(args.masterBtnID);
        }
        ;
    }
}
let testArray = [
    [["OKTitle", "exclusive"], ["You are"]],
    [["NoTitle Yes", "admit"], ["You are In"]],
    [["OKTitle", "so on"], ["You are"]],
    [["NoTitle", "so on"], ["You are"]],
    [["OK We got Title", "you fit"], ["You are out"]],
];
function getUniqueValuesFromArray(array) {
    let tempSet = new Set();
    let tempArray = [];
    for (let i = 0; i < array.length; i++) {
        if (Array.isArray(array[i])) {
            //This is a table not a string. We will add the title of the table to the set
            if (!tempSet.has(array[i][0][0])) {
                tempSet.add(array[i][0][0]);
                tempArray.push(array[i]);
            }
        }
        else {
            if (!tempSet.has(array[i])) {
                tempSet.add(array[i]);
                tempArray.push(array[i]);
            }
        }
    }
    return tempArray;
}
/**
 * Takes the title of a Word Table, and loops the prayersArray[][][] to check wether an element[0][0] (which reflects a table in the Word document from which the text was retrieved) matches the provided title. If found, it returns the wordTable as a string[][](each array element being a row of the Word table). If dosen't find, it returns 'undefined'
 * @param {string} tableTitle - The title of the table (without '&C=', i.e., we search for splitTitle(tableTitle)[0])  that we need to find in the button's prayersArray[][][].
 * @param {string[][][]} prayersArray - the Button that we need to search its prayersArray[][][] property for an element[][] having its [0][0] value equal the title of the Word Table
 * @param {equal?:boolean, startsWith?:boolean, endsWith?:boolean, includes?:boolean} Options - the matching options by which the function will search for the table: equal means the title of table in the array mush be exactly matching tableTitle, startsWith, means it must start with tableTitle, etc.
 * @returns {string[][] | void} - an array representing the Word Table if found or 'undefined' if not found
 */
function findTable(tableTitle, prayersArray, options = { equal: true }) {
    if (!prayersArray)
        prayersArray = getTablesArrayFromTitlePrefix(tableTitle);
    if (!prayersArray)
        return console.log("No prayers Array", tableTitle);
    let table;
    if (options.equal)
        table = prayersArray.find((tbl) => tbl[0][0] && splitTitle(tbl[0][0])[0] === tableTitle);
    else if (options.startsWith)
        table = prayersArray.find((tbl) => tbl[0][0] && splitTitle(tbl[0][0])[0].startsWith(tableTitle));
    else if (options.endsWith)
        table = prayersArray.find((tbl) => tbl[0][0] && splitTitle(tbl[0][0])[0].endsWith(tableTitle));
    else if (options.includes)
        table = prayersArray.find((tbl) => tbl[0][0] && splitTitle(tbl[0][0])[0].includes(tableTitle));
    if (!table)
        return console.log("no table with the provided title was found : ", tableTitle, " prayersArray =", PrayersArraysKeys.find((array) => array[2]() === prayersArray)[1] ||
            undefined);
    return table;
}
/**
 * Shows the inlineBtnsDiv
 * @param {string} status - a string that is added as a dataset (data-status) to indicated the context in which the inlineBtns div is displayed (settings pannel, optional prayers, etc.)
 * @param {boolean} clear - indicates whether the content of the inlineBtns div should be cleared when shwoInlineBtns is called. Its value is set to 'false' by default
 */
function showExpandableBtnsPannel(status, clear = false) {
    if (clear)
        expandableBtnsPannel.innerHTML = "";
    status !== 'settingsPanel' ? expandableBtnsPannel.style.backgroundImage = "url(./assets/PageBackgroundCross.jpg)" : expandableBtnsPannel.style.backgroundColor = 'grey';
    expandableBtnsPannel.style.backgroundSize = "10%";
    expandableBtnsPannel.style.backgroundRepeat = "repeat";
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
            hideExpandableButtonsPannel();
        });
        expandableBtnsPannel.appendChild(close);
    })();
    expandableBtnsPannel.dataset.status = status; //giving the inlineBtnsDiv a data-status attribute
    expandableBtnsPannel.classList.remove(hidden);
}
/**
 * hides the inlineBtnsDiv by setting its zIndex to -1
 */
function hideExpandableButtonsPannel() {
    expandableBtnsPannel.dataset.status = "expandablePannel";
    expandableBtnsPannel.innerHTML = "";
    expandableBtnsPannel.classList.add(hidden);
}
function showSettingsPanel() {
    showExpandableBtnsPannel("settingsPanel", true);
    let btn;
    //Show InstallPWA button//We are not calling it any more
    function installPWA() {
        btn = createSettingsBtn({
            tag: "button",
            role: "button",
            btnClass: "settingsBtn",
            innerText: "Install PWA",
            btnsContainer: expandableBtnsPannel,
            id: "InstallPWA",
            onClick: {
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
            },
        });
    }
    //Appending date picker
    (function showDatePicker() {
        let datePicker = createSettingsBtn({
            innerText: '',
            tag: "input",
            btnsContainer: expandableBtnsPannel,
            id: "datePicker",
            type: "date",
            onClick: {
                event: "change",
                fun: () => changeDate(new Date(datePicker.value.toString())),
            },
        });
        if (!todayDate)
            return;
        datePicker.setAttribute("value", todayDate.toString());
        datePicker.setAttribute("min", "1900-01-01");
    })();
    (async function showNextAndPreviousCopticDayButtons() {
        let btnsContainer = createBtnsContainer("showNextCopticDate", {
            AR: "اليوم التالي أو السابق في التقويم القبطي",
            FR: "Aller au jour suivant ou précédant du calendrier copte",
            EN: "Move to the next or previous day of the Coptic calendar",
        });
        let btnLable = {
            AR: 'التالي',
            FR: 'Suivant',
            EN: 'Next',
        };
        createBtn(btnLable, 'nextDay', true);
        btnLable = {
            AR: 'السابق',
            FR: 'Précédent',
            EN: 'Previous',
        };
        createBtn(btnLable, 'previousDay', false);
        function createBtn(lable, id, next) {
            createSettingsBtn({
                tag: "button",
                role: "button",
                btnClass: "settingsBtn",
                innerText: lable[defaultLanguage],
                btnsContainer: btnsContainer,
                id: id,
                type: "submit",
                onClick: {
                    event: "click",
                    fun: () => changeDate(undefined, next, 1),
                },
            }).style.backgroundColor = "saddlebrown";
            ;
        }
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer);
    })();
    (function showChangeFontSizeBtn() {
        let btnsContainer = createBtnsContainer("changeFontSize", {
            AR: "تكبير أو تصغير حجم الأحرف",
            FR: "Changer la taille de police",
            EN: "Increase or decrease the fonts size",
        });
        let input = createSettingsBtn({
            innerText: '',
            tag: "input",
            btnsContainer: btnsContainer,
            id: "fontsSize",
        });
        let dataList = createDataList();
        if (!dataList)
            return console.log("dataList was not generated : ", dataList);
        input.type = "range";
        input.setAttribute("list", dataList.id);
        input.id = "inputFontSize";
        input.min = "0.3";
        input.max = "1.9";
        Number(localStorage.fontSize)
            ? (input.defaultValue = localStorage.fontSize)
            : (input.defaultValue = "0.5");
        input.step = "0.1";
        input.onchange = () => {
            console.log("input.value = " + input.value);
            setFontSize(input.value);
        };
        function createDataList() {
            let list = document.createElement("datalist");
            list.id = "fontSizes";
            list.classList.add(hidden);
            btnsContainer.appendChild(list);
            for (let i = 0.3; i < 2; i += 0.1) {
                let option = document.createElement("option");
                option.value = i.toString();
                list.appendChild(option);
            }
            return list;
        }
    })();
    //Appending Add or Remove language Buttons
    (async function showAddOrRemoveLanguagesBtns() {
        let langs = [
            ["AR", "العربية"],
            ["FR", "Français"],
            ["EN", "English"],
            ["COP", "Coptic"],
            ["CA", "قبطي مُعرب"],
        ];
        let defaultLangContainer = createBtnsContainer("defaultLanguage", {
            AR: "اختر اللغة الأساسية (لغة الإعدادات)",
            FR: "Sélectionner la langue par défaut",
            EN: "Choose the default Language",
        });
        let foreignLangContainer = createBtnsContainer("foreignLanguage", {
            AR: "اختر اللغة الأجنبية (اختياري)",
            FR: "Sélectionner une langue étrangère (optionnel)",
            EN: "Choose the foreign Language",
        });
        let copticLangContainer = createBtnsContainer("copticLanguage", {
            AR: "اختر نسخة النص القبطي (أحرف قبطية أو قبطي معرب )",
            FR: "Sélectionner les caractères d'affichage de la version copte (si disponible)",
            EN: "Choose the coptic language version",
        });
        addLangsBtns({
            btnsContainer: defaultLangContainer,
            fun: (lang) => setLanguage(lang, 0),
            langsOptions: [langs[0], langs[1], langs[2]],
            index: 0,
        });
        addLangsBtns({
            btnsContainer: foreignLangContainer,
            fun: (lang) => setLanguage(lang, 1),
            langsOptions: [langs[0], langs[1], langs[2]],
            index: 1,
        });
        addLangsBtns({
            btnsContainer: copticLangContainer,
            fun: (lang) => setLanguage(lang, 2),
            langsOptions: [langs[3], langs[4]],
            index: 2,
        });
        /**
         * @param {string} lang - the language that the button changes when clicked
         * @param {number} index - the index of the language in the userLanguages array stored in the localStorage. This index indicated whether the language is the defaultLanguage (index=0) or the foreignLanguage (index=1), or the version of the Coptic text (index=2)
         */
        function setLanguage(lang, index) {
            let userLanguages = JSON.parse(localStorage.userLanguages);
            if (!userLanguages)
                userLanguages = [];
            if (index > 0 && userLanguages.indexOf(lang) === index)
                //If the language is already defined at the same index, we will set the element at the same index to undefined (i.e., we will desactivate the language and remove it from the list of userLanguages). We never set the default language (i.e. stored[0]) to undefined that's why we exclude the case where index = 0
                userLanguages[index] = undefined;
            else if (index === 0 && userLanguages.indexOf(lang) === index)
                return alert("You cannot not desactivate the default language. You can replace it by choosing another language");
            else if (userLanguages.indexOf(lang) === 0 && index === 1 && userLanguages[index]) {
                //If the language is already set as defaultLanguage (it is set at index 0), and we want to make it the foreign language (index = 1), we check if the value of index 1 (the index of the foreign language) is not undefined. If so, we make the foreign language default language and we replace it with lang
                userLanguages[0] = userLanguages[index];
                userLanguages[index] = lang;
            }
            else if (userLanguages.indexOf(lang) === 0 && index === 1 && !userLanguages[index])
                return alert("You must first replace the default language by another language before being able to set it as foreign language");
            else if (userLanguages.indexOf(lang) === 1 && index === 0) {
                //If the language is already set as foreignLanguage (it is set at index 1), and we want to make it the default language (index = 0). If so, we set the foreign language as undefined default language and we set the language as default language
                userLanguages[1] = undefined;
                userLanguages[index] = lang;
            }
            else if (userLanguages.indexOf(lang) < 0)
                //If the array does not contain the language at any of its indexes, we add it at the index passed as argument
                userLanguages[index] = lang;
            defaultLanguage = userLanguages[0];
            foreingLanguage = userLanguages[1];
            copticLanguage = userLanguages[2];
            localStorage.userLanguages = JSON.stringify(userLanguages);
            console.log(localStorage.userLanguages);
        }
        function addLangsBtns(args) {
            let newBtn;
            args.langsOptions.map((lang) => {
                newBtn = createSettingsBtn({
                    tag: "button",
                    role: "button",
                    btnClass: "settingsBtn",
                    innerText: lang[1],
                    btnsContainer: args.btnsContainer,
                    id: "userLang",
                    onClick: {
                        event: "click",
                        fun: () => {
                            args.fun(lang[0]);
                            newBtn.classList.toggle("langBtnAdd");
                            //We retrieve again the displayed text/prayers by recalling the last button clicked
                            if (containerDiv.children) {
                                //Only if a text is already displayed
                                showChildButtonsOrPrayers(lastClickedButton);
                                showSettingsPanel(); //we display the settings pannel again
                            }
                        },
                    },
                });
                if (JSON.parse(localStorage.userLanguages)[args.index] !== lang[0])
                    newBtn.classList.add("langBtnAdd"); //The language of the button is absent from userLanguages[], we will give the button the class 'langBtnAdd'
            });
            args.btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(args.btnsContainer, 3);
        }
    })();
    (async function showExcludeActorButon() {
        let btnsContainer = createBtnsContainer("showOrHideActor", {
            AR: "إظهار أو إخفاء مردات الكاهن أو الشماس أو الشعب",
            FR: "Afficher ou cacher un acteur",
            EN: "Show or hide an actor",
        });
        let userActors = JSON.parse(localStorage.showActors);
        userActors.map((actor) => {
            if (['CommentText', 'NoActor'].includes(actor[0].EN))
                return; //CommentText will be handled at the same time by the button for 'Comments'
            btn = createSettingsBtn({
                tag: "button",
                role: "button",
                btnClass: "settingsBtn",
                innerText: actor[0][defaultLanguage],
                btnsContainer: btnsContainer,
                id: actor[0].EN,
                lang: actor[0].EN,
                onClick: {
                    event: "click",
                    fun: () => {
                        actor[1] = !actor[1]; //inversing the value of the boolean
                        btn.classList.toggle("langBtnAdd");
                        //changing the background color of the button to red by adding 'langBtnAdd' as a class
                        if (actor[0].EN === "Comments")
                            userActors.find((el) => el[0].EN === "CommentText")[1] = actor[1]; //setting the value of 'CommentText' same as 'Comment'
                        localStorage.showActors = JSON.stringify(userActors); //adding the new values to local storage
                        if (containerDiv.children) {
                            //Only if some prayers text is already displayed
                            showChildButtonsOrPrayers(lastClickedButton); //we re-click the last button to refresh the displayed text by adding or removing the actor according to the new setings chice made by the user.
                            showSettingsPanel(); //we display the settings pannel again
                        }
                    },
                },
            });
            if (!actor[1])
                btn.classList.add("langBtnAdd");
        });
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer, 5);
    })();
    (async function showDisplayModeBtns() {
        let btnsContainer = createBtnsContainer("changeDisplayMode", {
            AR: "اختر نظام العرض",
            FR: "Changer le mode d'affichage",
            EN: "Change the display mode",
        });
        expandableBtnsPannel.appendChild(btnsContainer);
        displayModes.map((mode) => {
            btn = createSettingsBtn({
                tag: "button",
                role: "button",
                btnClass: "settingsBtn",
                innerText: mode + " Display Mode",
                btnsContainer: btnsContainer,
                id: mode,
                onClick: {
                    event: "click",
                    fun: () => {
                        if (localStorage.displayMode !== mode) {
                            localStorage.displayMode = mode;
                            let userActors = JSON.parse(localStorage.showActors);
                            if (mode === displayModes[2] && localStorage.displayMode === mode)
                                //If mode = 'Priest Mode', we set the value of 'Diacon' in the 'showActors' localStorage to false in order to hide all the 'Diacon' response
                                userActors.find(actor => actor[0].EN === actors[1].EN)[1] = false;
                            else
                                userActors.find(actor => actor[0].EN === actors[1].EN)[1] = true;
                            localStorage.showActors = JSON.stringify(userActors);
                            Array.from(btnsContainer.children).map((btn) => {
                                btn.id !== localStorage.displayMode
                                    ? btn.classList.add("langBtnAdd")
                                    : btn.classList.remove("langBtnAdd");
                            });
                        }
                    },
                },
            });
            if (mode !== localStorage.displayMode) {
                btn.classList.add("langBtnAdd");
            }
        });
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer, 3);
    })();
    (async function showEditingModeBtn() {
        if (localStorage.editingMode != "true")
            return;
        let btnsContainer = createBtnsContainer("enterEditingMode", {
            AR: " تعديل النصوص",
            FR: "Activer le mode édition",
            EN: "Enter Editing Mode",
        });
        expandableBtnsPannel.appendChild(btnsContainer);
        let editingBtn = getEditModeButton();
        btn = createSettingsBtn({
            tag: "button",
            role: "button",
            btnClass: "settingsBtn",
            innerText: editingBtn.label[defaultLanguage],
            btnsContainer: btnsContainer,
            id: "editingMode" + localStorage.editingMode.toString(),
            onClick: {
                event: "click",
                fun: editingBtn.onClick,
            },
        });
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer, 3);
    })();
    //Appending colors keys for actors
    (async function addActorsKeys() {
        let btnsContainer = createBtnsContainer("actorsKeys", {
            AR: "مفاتيح الألوان",
            FR: "Clés des couleurs",
            EN: "Colors keys",
        });
        let userActors = JSON.parse(localStorage.showActors)
            .filter(actor => actor[1] === true && !['CommentText', 'NoActor'].includes(actor[0].EN)).map(actor => actor[0]);
        userActors.map((actor) => {
            let newBtn = createSettingsBtn({
                innerText: actor[defaultLanguage],
                tag: "button",
                btnClass: "colorbtn",
                btnsContainer: btnsContainer,
                id: actor.EN + "Color",
            });
        });
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer, 4);
    })();
    (async function addReloadPageBtn() {
        let btnsContainer = createBtnsContainer("enterEditingMode", {
            AR: "تحديث التطبيق",
            FR: "Mettre à jour l'application",
            EN: "Update App",
        });
        expandableBtnsPannel.appendChild(btnsContainer);
        let btnLable = {
            AR: 'تحديث',
            FR: 'Mettre à jour',
            EN: 'Update',
        };
        btn = createSettingsBtn({
            tag: "button",
            role: "button",
            btnClass: "updateBtn",
            innerText: btnLable[defaultLanguage],
            btnsContainer: btnsContainer,
            id: "updateApp",
            onClick: {
                event: "click",
                fun: () => location.reload(),
            },
        });
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer);
    })();
    closeSideBar(leftSideBar);
    function createBtnsContainer(id, labelText) {
        let btnsContainer = document.createElement("div");
        btnsContainer.id = id;
        btnsContainer.style.display = "grid";
        //btnsContainer.classList.add('settingsBtnsContainer');
        btnsContainer.style.columnGap = "5px";
        btnsContainer.style.justifyItems = "center";
        btnsContainer.style.height = "fit-content";
        btnsContainer.style.width = "fit-content";
        expandableBtnsPannel.appendChild(btnsContainer);
        let labelsDiv = document.createElement("div");
        labelsDiv.classList.add("settingsLabel");
        btnsContainer.insertAdjacentElement("beforebegin", labelsDiv);
        let label = document.createElement("h3");
        label.innerText = labelText[defaultLanguage];
        labelsDiv.appendChild(label);
        (function addForeignLanguage() {
            return; //Desactiviting it for the moment
            if (!foreingLanguage)
                return;
            let foreignLabel = document.createElement("h3");
            foreignLabel.innerText = labelText[foreingLanguage];
            labelsDiv.appendChild(foreignLabel);
        })();
        return btnsContainer;
    }
    function createSettingsBtn(args) {
        let btn = document.createElement(args.tag);
        if (!args.role)
            args.role = args.tag;
        if (args.role)
            btn.role = args.role;
        if (args.innerText)
            btn.innerHTML = args.innerText;
        if (args.btnClass)
            btn.classList.add(args.btnClass);
        if (args.id)
            btn.id = args.id;
        if (args.lang)
            btn.lang = args.lang.toLowerCase();
        //@ts-ignore
        if (args.type && btn.nodeType)
            btn.type = args.type;
        //@ts-ignore
        if (args.size)
            btn.size = args.size;
        if (args.backgroundColor)
            btn.style.backgroundColor = args.backgroundColor;
        if (args.onClick) {
            btn.addEventListener(args.onClick.event, (e) => {
                e.preventDefault;
                args.onClick.fun();
            });
        }
        if (args.btnsContainer)
            args.btnsContainer.appendChild(btn);
        return btn;
    }
}
/**
 * Changes the value of the Css variable fSize on the '.Content' html element
 * @param {string} size - the size of the font
 */
function setFontSize(size) {
    if (!Number(size))
        return;
    let content = document.querySelector(".Content");
    content.style.setProperty("--fSize", size);
    localStorage.fontSize = size;
}
/**
 * Sets the number of columns of a "display-grid' html element based on the number of its children.
 * @param {HTMLElement} htmlContainer - the html element for which we want to set the number of columns based on the number of its children
 * @param {number} max - the maximum number of columns that if exceeded, the number will be automatically reduced to a value = reduce. Its default value is 3.
 * @param {number} reduce - the number of columns that will be retained if the number of columns resulting from the number of htmlContainer children is greater than "max"
 */
function setGridColumnsOrRowsNumber(htmlContainer, max, exact) {
    let units;
    units = htmlContainer.children.length;
    if (max && units > max)
        units = max;
    else if (exact)
        units = exact;
    return ((100 / units).toString() + "% ").repeat(units);
}
/**
 * Loops the tables (i.e., the string[][]) of a string[][][] and, for each row (string[]) of each table, it inserts a div adjacent to an html child element to containerDiv
 * @param {string[][][]} tables - an array of arrays, each array represents a table in the Word document from which the text was retrieved
 * @param {string[]} languages - the languages in which the text is available. This is usually the "languages" properety of the button who calls the function
 * @param {{beforeOrAfter:InsertPosition, el: HTMLElement}} position - the position at which the prayers will be inserted, adjacent to an html element (el) in the containerDiv
 * @returns {HTMLElement[]} - an array of all the html div elements created and appended to the containerDiv
 */
function insertPrayersAdjacentToExistingElement(args) {
    if (!args.tables)
        return;
    if (!args.container)
        args.container = containerDiv;
    return args.tables
        .map((table) => {
        if (!table || table.length === 0)
            return;
        return showPrayers({
            table: table,
            position: args.position,
            languages: args.languages || getLanguages(PrayersArraysKeys.find(array => table[0][0].startsWith(array[0]))[1]) || prayersLanguages,
            container: args.container,
            clearRightSideBar: false,
            clearContainerDiv: false,
        }) || undefined;
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
    div.classList.add(inlineBtnsContainerClass);
    btns.map((btn) => div.appendChild(createBtn({ btn: btn, btnsContainer: div, btnClass: btn.cssClass })));
    position.el.insertAdjacentElement(position.beforeOrAfter, div);
    div.style.gridTemplateColumns = setGridColumnsOrRowsNumber(div, 3);
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
    if (PrayersArrayFR.length < 1)
        return console.log("PrayersArray is empty = ", PrayersArrayFR);
    let array, BOH;
    PrayersArrayFR.forEach((table) => {
        if (table.length < 1 || table[0].length < 1)
            return;
        array = PrayersArraysKeys.find((array) => table[0][0].startsWith(array[0]));
        if (array)
            array[2]().push(table);
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
 * Hides the current slide, and unhides the next or previous slide based on the value of 'next'
 * @param {boolean} next - If true, the next slide is displayed. If false, the previous one is displayed. Its default value is true.
 * @returns
 */
function showNextOrPreviousSildeInPresentationMode(next = true) {
    if (localStorage.displayMode !== displayModes[1])
        return;
    let children = Array.from(containerDiv.querySelectorAll("div[data-same-slide]"));
    let currentSlide = containerDiv.querySelector(".Slide");
    if (!currentSlide)
        return showOrHideSlide(true, children[0].dataset.sameSlide); //If not slide is already displayed, we display the slide built from the 1st data-same-slide child of containerDiv, and return
    let sameSlide = children.filter((div) => div.dataset.sameSlide === currentSlide.id); //If a slide is already diplayed, we retrieve all the containerDiv children having the same data-same-slide attribute as the data-same-slide value stored in the currentSlide.id.
    if (sameSlide.length < 1)
        return console.log("We could not find divs having as data-same-slide the id of the currently displayed Slide"); //Noramly, this should not occur
    let nextDiv;
    if (next)
        selectNextDiv(sameSlide[sameSlide.length - 1]); //We set nextSlide by passing the last element of sameSlide as argument
    if (!next)
        selectNextDiv(sameSlide[0]); //We set nextSlide by passing the 1st element of sameSlide as argument
    function selectNextDiv(div) {
        if (!div)
            return console.log("slide is not defined"); //This would occur if nextSlide was set to undefined
        if (next && div.nextElementSibling)
            nextDiv = div.nextElementSibling;
        else if (next &&
            div.parentElement &&
            div.parentElement.classList.contains("Expandable"))
            nextDiv = div.parentElement.nextElementSibling;
        else if (!next && div.previousElementSibling)
            nextDiv = div.previousElementSibling;
        else if (!next &&
            div.parentElement &&
            div.parentElement.classList.contains("Expandable"))
            nextDiv = div.parentElement.previousElementSibling;
        else
            nextDiv = undefined; //!CAUTION: we must set nextSlide to undefined if none of the above cases applies. Otherwise the function will loop infintely
        if (nextDiv && exclude(nextDiv, currentSlide.id))
            selectNextDiv(nextDiv);
    }
    if (!nextDiv)
        return;
    showOrHideSlide(false); //We remove the currently displayed slide
    showOrHideSlide(true, nextDiv.dataset.sameSlide); //We show the new slide
    function exclude(div, currentDataSameSlide) {
        if (!div.dataset.sameSlide ||
            div.dataset.sameSlide === currentDataSameSlide)
            return true;
    }
}
function addKeyDownListnerToElement(htmlRow, eventName, direction) {
    if (localStorage.displayMode !== displayModes[1])
        return;
    if (!direction)
        htmlRow.addEventListener(eventName, (event) => goToNextOrPreviousSlide(event, direction));
}
function goToNextOrPreviousSlide(event, direction) {
    if (!event && !direction)
        return;
    let code;
    if (event)
        code = event.code;
    else if (direction === "up")
        code = "PageUp"; //next slide
    else if (direction === "down")
        code = "PageDown"; //previous slide
    if (code === "ArrowDown" || code === "PageDown" || code === "ArrowRight")
        showNextOrPreviousSildeInPresentationMode(true); //next slide
    else if (code === "ArrowUp" || code === "PageUp" || code === "ArrowLeft")
        showNextOrPreviousSildeInPresentationMode(false); //previous slide
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
        if (!row.title || !row.dataset.root)
            return alert("the row dosen't have title");
        table.push(Array.from(row.children).map((p) => {
            //We replace the quotes in the innerHTML of the paragraph, but we will return the innerText of the paragraph in order to avoid getting <br> or any other html tags in the returned text
            p.innerHTML = replaceHtmlQuotes(p.innerHTML, p.lang); //When the text is displayed, the <quote> elment is replaced with the quotes symbol of the relevant language. We replace the quotes with the html <quote> element
            return p.innerText;
        }));
        let first;
        if (row.dataset.isPlaceHolder)
            first = Prefix.placeHolder;
        else if (row.dataset.isPrefixSame)
            first = Prefix.same + row.title.split(row.dataset.root)[1];
        else
            first = row.title;
        table[table.length - 1].unshift(first);
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
/**
 * This function was created in a doc review project to transform captial letters in names into smal letters. It is not used in the app. Will remove it later elsewhere
 */
async function firstLetter() {
    if (!document.getElementById('btnFirstLetter'))
        await createBtn();
    let st = prompt('Provide the names of the lawyers');
    if (!st)
        return;
    st =
        st
            .replaceAll(',', ';')
            .replaceAll(' ;', ';')
            .replaceAll(' and ', '; ');
    let names = st.split('; ');
    if (!names || names.length < 1)
        return alert('We could not retrive the names from the string');
    alert(lowerNames());
    firstLetter();
    function lowerNames() {
        return names
            .map(name => name.split(' ')
            .map(word => returnWord(word)))
            .map(array => array.join(' '))
            .join('; ');
    }
    ;
    function returnWord(w) {
        if (!w)
            return;
        return w[0].toUpperCase()
            + w.toLowerCase().slice(1, w.length);
    }
    async function createBtn() {
        let btn = document.createElement('div');
        btn.id = 'btnFirstLetter';
        btn.addEventListener('click', firstLetter);
        btn.style.backgroundColor = 'red';
        btn.style.height = '20px';
        btn.style.width = '200px';
        btn.innerText = 'Get Small Characters';
        document.body.prepend(btn);
    }
    ;
}
/**
 * Checks whether the html element passed as argument, has either the class 'Title', or 'SubTitle' and returns true if this is the case
 * @param {HTMLElement} htmlRow - the hmtl element that we want to check whether it has 'Title' or 'SubTitle' in its classList
 * @return {boolean} returns true if the html element has any of the titel classes
 */
function isTitlesContainer(htmlRow) {
    return hasClass(htmlRow, ["Title", "SubTitle"]);
}
/**
 * Checks whether the html element passed as argument, has any of the classes passed in the classList[] array. It returns true if this is the case
 * @param {HTMLElement} htmlRow - the hmtl element that we want to check whether it has 'Title' or 'SubTitle' in its classList
 * @param {string[]} classList - a list of the classes that we want to check if the html element includes in its classList
 * @return {boolean} returns true if the html element has any of the titel classes
 */
function hasClass(htmlRow, classList) {
    if (!htmlRow)
        return;
    return (classList.filter((className) => htmlRow.classList.contains(className))
        .length > 0);
}
function isInlineBtnsContainer(htmlRow) {
    if (htmlRow && htmlRow.classList.contains(inlineBtnsContainerClass))
        return true;
    else
        return false;
}
/**
 * Checks if the html element passed to it as an argument has 'Comments' or 'CommentText' in its classList
 * @param {HTMLDivElement} htmlRow - the html element that we want to check if it has any of the classes related to comments
 */
function isCommentContainer(htmlRow) {
    return hasClass(htmlRow, ["Comments", "CommentText"]);
}
/**
 * Hides all the titles shortcuts for the the html div elements included in the container, from the right side bar
 * @param {HTMLElement} container - the html element containing the title divs which we want to hide their titles shortcuts from the right side Bar
 */
function hideOrShowAllTitlesInAContainer(container, hide = true) {
    //We hide all the titles from the right side Bar
    Array.from(container.children)
        .filter((child) => isTitlesContainer(child))
        .forEach((child) => hideOrShowTitle(child.dataset.group, hide));
}
/**
 * Hides a title shortcut from the right side bar based on the id of the html element passed to it
 * @param {strig} titleGroup - the data-group of the title/titles we want to show or hide
 * @param {boolean} hide - If true, the title will be hidden. If false, the title will be displayed
 */
function hideOrShowTitle(titleGroup, hide) {
    let titles = Array.from(sideBarTitlesContainer.children)
        .filter((title) => title.dataset.group === titleGroup);
    if (titles.length < 1)
        return;
    titles
        .forEach(title => {
        if (hide && !title.classList.contains(hidden))
            title.classList.add(hidden);
        if (!hide && title.classList.contains(hidden))
            title.classList.remove(hidden);
    });
}
async function callFetchSynaxariumArabic() {
    for (let i = 5; i < 8; i++) {
        await fetchSynaxariumArabic(i);
    }
    console.log(ReadingsArrays.SynaxariumArrayFR);
}
/**
 * Fetches the Synaxarium text from http://katamars.avabishoy.com/api/katamars/
 */
async function fetchSynaxariumArabic(month) {
    let tbl, daystring, monthstring;
    let apiRoot = "http://katamars.avabishoy.com/api/Katamars/";
    monthstring = month.toString();
    if (month < 10)
        monthstring = "0" + monthstring;
    for (let day = 1; day < 31; day++) {
        daystring = day.toString();
        if (day < 10)
            daystring = "0" + daystring;
        tbl = ReadingsArrays.SynaxariumArrayFR.filter((tbl) => tbl[0][0].includes("&D=" + daystring + monthstring))[0];
        if (!tbl || tbl.length === 0)
            return;
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
        synaxariumIndex
            .filter((obj) => obj.day === day && obj.month === month)
            .forEach((obj) => {
            let response = sendHttpRequest(apiRoot +
                "GetSynaxariumStory?id=" +
                String(obj.id) +
                "&synaxariumSourceId=1");
            if (!response)
                return;
            let divs = response.querySelectorAll("div");
            if (divs.length === 0)
                return;
            if (!tbl[1])
                return;
            tbl[1][tbl[1].length - 1] += divs[1].innerHTML + "\n";
            console.log("done ", tbl[0]);
        });
    }
    function sendHttpRequest(apiURL) {
        let request = new XMLHttpRequest();
        request.open("GET", apiURL);
        request.send();
        console.log(request.getAllResponseHeaders());
        request.onload = () => {
            if (request.status === 200) {
                let responseDoc = new DOMParser().parseFromString(request.response, "text/html");
                if (!responseDoc)
                    return;
                return responseDoc;
            }
            else {
                console.log("error status text = ", request.statusText);
                return request.statusText;
            }
        };
    }
}
/**
 * Fetches the Synaxarium text in French from https://coptipedia.com
 */
async function fetchSynaxariumFrench(months) {
    if (!months)
        months = ["50-toubah", "51-amshir", "52-baramhat"];
    let table, apiInitial = "https://coptipedia.com/index.php/livre-1-les-temoins-de-la-foi/le-synaxaire/", textContainer, text;
    months.forEach(async (query) => {
        let month = copticMonths
            .indexOf(copticMonths.filter((coptMonth) => coptMonth.FR.toLowerCase() === query.split("-")[1])[0])
            .toString();
        if (Number(month) < 10)
            month = "0" + month;
        console.log("month =", month);
        await processMonth(query, month);
    });
    async function processMonth(monthQuery, month) {
        if (!month)
            return console.log("month is undefined = ", month);
        let url = apiInitial + monthQuery + ".html"; //This will return an html page with links to all the days of the month. We will retrieve these links and fetch each of them in order to retrieve the text
        let bodyText = await fetchURL(url);
        if (!bodyText)
            return console.log("bodyText is undefined = ", bodyText);
        return await processResponse(new DOMParser().parseFromString(bodyText, "text/html"), month, monthQuery, url);
    }
    async function processResponse(responseDoc, month, monthQuery, url) {
        if (!responseDoc)
            return console.log("responseDoc is undefined = ", responseDoc);
        let anchors = responseDoc.querySelectorAll("a");
        if (!anchors)
            return console.log("anchors is undefined = ", anchors);
        let unique = new Set();
        let i = 1;
        Array.from(anchors)
            .filter((link) => link.href.includes("/index.php/livre-1-les-temoins-de-la-foi/le-synaxaire/" +
            monthQuery +
            "/"))
            .forEach(async (link) => {
            if (unique.has(link.href))
                return;
            unique.add(link.href);
            console.log(link.href);
            let bodyText = await fetchURL(link.href);
            if (!bodyText)
                return console.log("bodyText is undefined = ", bodyText);
            let fetchedText = await editTableCell(bodyText, i++, month);
            if (fetchedText)
                localStorage.fetchedText += fetchedText;
        });
    }
    async function fetchURL(url) {
        let response = await fetch(url);
        return await response.text();
    }
    async function editTableCell(bodyText, i, month) {
        let day = i.toString();
        if (i < 10)
            day = "0" + day;
        console.log("day=", day, " and month =", month);
        table = ReadingsArrays.SynaxariumArrayFR.filter((tbl) => tbl[0][0].includes("&D=" + day + month))[0];
        console.log("table = ", table);
        if (!table || !table[1])
            return console.log("table is undefined", table);
        if (table.length === 2)
            table[1][1] = (await getText(new DOMParser().parseFromString(bodyText, "text/html")));
        else
            return await getText(new DOMParser().parseFromString(bodyText, "text/html"));
    }
    async function getText(responseDoc) {
        textContainer = responseDoc.querySelector(".article-content");
        if (!textContainer ||
            !textContainer.children ||
            textContainer.children.length === 0)
            return console.log("no textContainer = ", textContainer);
        return textContainer.innerText;
    }
}
/**
 * Sends an XMLHttpRequest
 * @param  {string} apiURL - the API adress to which the request will be sent
 * @param responseDoc
 * @param {string} method - the request method ('GET', 'PUT', 'POST' etc., ) its default value is 'GET'
 */
function sendHttpRequest(apiURL, method = "GET") {
    let request = new XMLHttpRequest();
    request.open(method, apiURL);
    try {
        request.send();
    }
    catch (error) {
        console.log(error);
    }
    request.onload = async () => {
        if (request.status === 200) {
            return new DOMParser().parseFromString(request.response, "text/html");
        }
        else {
            console.log("error status text = ", request.statusText);
            return request.statusText;
        }
    };
}
function ReduceArrays(args) {
    let array = eval(args.arrayName);
    loopTables(array, args.rowFun, args.tblFun);
    console.log(array);
    exportToJSFile(processArrayTextForJsFile(args.arrayName, array), args.arrayName);
    function loopTables(array, rowFun, tblFun) {
        array.forEach((tbl) => {
            if (tblFun)
                tblFun(tbl);
            loopRows(tbl, rowFun, splitTitle(tbl[0][0])[0]);
        });
    }
    function loopRows(tbl, rowFun, tblTitle) {
        tbl.forEach((row) => rowFun(tbl, row, tblTitle));
    }
}
function shortenRowsTitles(tbl, row, tblTitle) {
    //return;
    if (tbl.indexOf(row) === 0)
        return;
    let rowTitle = splitTitle(row[0])[0];
    if (!rowTitle.startsWith(Prefix.placeHolder) && rowTitle !== tblTitle)
        console.log("row[0] = ", rowTitle, "tblTitle = ", tblTitle);
    else if (rowTitle === tblTitle)
        row[0] = (Prefix.same + "&" + splitTitle(row[0])[1]).replace("&", "&C=");
}
function HelperPrepareArabicChant() {
    //temporary function
    let text = prompt("Enter text");
    if (!text)
        return;
    let splitted = text.split("_&_"), array = [];
    for (let i = 0; i < splitted.length; i += 20) {
        preparePart(splitted.slice(i, i + 20));
    }
    function preparePart(part) {
        if (part.length % 2 > 0)
            return console.log("splitted is not even");
        for (let i = 0; i < part.length / 2; i++) {
            array.push(part[i]);
            array.push(" " +
                String.fromCharCode(beamedEighthNoteCode).repeat(2) +
                " " +
                part[i + part.length / 2] +
                "_&&_");
        }
    }
    text = array.toString();
    console.log(text);
    localStorage.temp = text;
}
function cleanReadingArray(readingArray) {
    let date, titles, similar = new Set();
    readingArray
        .forEach(table => {
        if (table.length < 1)
            return;
        date = removeSpaces(table[0][3]);
        if (!date)
            return;
        titles =
            readingArray
                .filter(table => removeSpaces(table[0][3]) === date)
                .map(table => table[0][0]);
        if (titles.length < 2)
            return;
        if (!similar.has(titles)
            && !Array.from(similar).find(array => array.includes(titles[0]))) {
            titles.push(date);
            similar.add(titles);
        }
        ;
    });
    console.log(Array.from(similar));
    function removeSpaces(text) {
        return text.replaceAll(' ', '');
    }
}
/**
 * This is a function that tests the scenario of replacing the text of a given language in all the arrays with the corresponding text in another language. It aims at testing the extendablitiy of the project to other languages
 */
async function testReplaceLanguageText() {
    let en = 'Lorem ipsum dolor sit amet. Est itaque incidunt ex adipisci consequatur est libero eius eos laboriosam odit. Quo quas facere cum illum dolorem ut voluptate provident ea minima exercitationem ad aspernatur explicabo est internos quia vel pariatur voluptatem? Qui atque aliquam qui numquam voluptatem et recusandae architecto qui sequi exercitationem et enim ipsam. Ea enim omnis non itaque exercitationem sit alias ullam et internos quod? Eos aperiam laboriosam ut dolorum voluptatem nam velit provident.';
    let prefixes = [
        Prefix.prayersArray,
        Prefix.gospelDawn,
        Prefix.gospelMass,
        Prefix.gospelNight,
        Prefix.gospelVespers,
        Prefix.katholikon,
        Prefix.praxis,
        Prefix.propheciesDawn,
        Prefix.stPaul,
        Prefix.synaxarium
    ];
    let languages, array, keys, newArray, index;
    let lorem; //This is the array that contains the english version of our text
    prefixes.forEach(prefix => {
        keys = PrayersArraysKeys.find(array => array[0] === prefix);
        languages = getLanguages(keys[1]); //The languages[] of the array
        array = keys[2]();
        lorem = [];
        array.forEach(table => {
            lorem.push([[table[0][0]]]);
            table.forEach(row => lorem[lorem.length - 1].push([en]));
        }); //For each table in array, we add a table in lorem having as its first element a string[] row containing the title of the table. We then add a new row for each row in the table and push the English text to it.
        newArray = structuredClone(array); //This is a copy to work with
        newArray.forEach(table => {
            table
                .filter(row => row[0] !== Prefix.placeHolder)
                .forEach(row => {
                row[0].endsWith('&C=Comments')
                    ? index = 1
                    : index = languages.indexOf('FR') + 1;
                row[index] = lorem[newArray.indexOf(table)][table.indexOf(row) + 1][0];
            });
        });
        console.log(newArray);
    });
}
/**
 * This function is part of an alternative idea consisting of working with an array of html elements instead of an array of text. The idea is to accelerate the lodding of the page by avoiding the creation of divs and paragraphs. The function retruns a string containg the a paragraph element for each text element in each row. This function is par
 */
async function createHtmlArray() {
    if (!confirm('Do you want to create an html elements array?'))
        return;
    var PrayersArrayHtml = await buildArray();
    console.log('PrayersArrayHtml = ', PrayersArrayHtml);
    testRetrieveTables();
    async function buildArray() {
        let arrayName = 'PrayersArrayFR';
        let array = eval(arrayName);
        let newArray = [];
        let newTable;
        let newRow;
        let languages = getLanguages(arrayName);
        let langs, className, dataRoot;
        array.forEach(table => {
            newArray.push([]); //Adding a table array
            newTable = newArray[newArray.length - 1];
            dataRoot = splitTitle(table[0][0])[0];
            newTable.push([dataRoot]); //Adding a row to the table array including the table title
            table.forEach(row => {
                langs = languages;
                newTable.push([]); //Adding a row to the table array
                newRow = newTable[newTable.length - 1];
                className = splitTitle(row[0])[1]; //Retrieving the class of the row
                if (row[0] === Prefix.placeHolder)
                    className = 'PlaceHolder';
                if (!className)
                    className = 'NoActor';
                if (['Comments'].includes(className))
                    langs = ['FR', 'AR'];
                let div = getDivInnerHtml(); //Builiding a div container for the row
                let index = 0;
                newRow[0] =
                    div + processElements(row).join(' ') +
                        '</div>';
            });
            function processElements(row) {
                let text = [];
                for (let i = 1; i < row.length; i++) {
                    text.push(getParagraphInnerHtml(row[i], langs[i - 1]) || '');
                }
                return text;
            }
            function getParagraphInnerHtml(element, lang) {
                let p = '<p class="' + lang + '" ' +
                    'data-root="' + dataRoot + '" ' +
                    'lang="' + lang.toLowerCase() + '" >' +
                    element + "</p>";
                return p;
            }
            function getDivInnerHtml() {
                let div = '<div class="Row ' + className + '" ' +
                    'data-root="' + dataRoot + '" ' +
                    'role="button">';
                return div;
            }
        });
        return newArray;
    }
    async function testRetrieveTables() {
        if (!confirm('Do you want to test the array?'))
            return;
        let now = new Date().getTime();
        let docFrag = new DocumentFragment();
        let tablesTitles = [];
        [Prefix.psalmody, Prefix.communion, Prefix.bookOfHours, Prefix.massCommon, Prefix.massStBasil]
            .forEach(prefix => {
            PrayersArrayFR.filter(table => splitTitle(table[0][0])[0].startsWith(prefix))
                .forEach(tbl => tablesTitles.push(splitTitle(tbl[0][0])[0]));
        });
        if (confirm('Do you want to test as BUTTON')) {
            let btn = new Button({
                btnID: 'TestBtn',
                docFragment: docFrag,
                prayersSequence: tablesTitles,
                languages: prayersLanguages,
                label: { AR: '', FR: '' },
                showPrayers: true,
            });
            await showChildButtonsOrPrayers(btn, true);
            return alert((new Date().getTime() - now).toString());
        }
        (async function testHtml() {
            let div = document.createElement('div');
            docFrag.appendChild(div);
            containerDiv.innerHTML = '';
            let title, tbl, userLangs = JSON.parse(localStorage.userLanguages), actors = JSON.parse(localStorage.showActors).filter(el => el[1] === true).map(el => el[0].EN);
            let innerHTML = tablesTitles.map(title => PrayersArrayHtml.find(table => splitTitle(table[0][0])[0] === title))
                .map(table => retrieveRowsHTML(table)).join(' ');
            div.innerHTML = innerHTML;
            actors.push('Row', 'Title', 'SubTitle');
            Array.from(div.querySelectorAll('div'))
                .forEach(div => {
                if (Array.from(div.classList)
                    .map(c => actors.includes(c))
                    .includes(false))
                    div.remove();
            });
            Array.from(div.querySelectorAll('p')).forEach(parag => {
                if (!userLangs.includes(parag.lang.toUpperCase()) || !parag.innerText)
                    parag.remove();
            });
            await setCSS(Array.from(div.children));
            containerDiv.appendChild(docFrag);
            return alert((new Date().getTime() - now).toString());
            function retrieveRowsHTML(table) {
                if (!table)
                    return '';
                let html = table
                    .filter(row => table.indexOf(row) > 0)
                    .map(row => {
                    if (!row[0].includes('PlaceHolder'))
                        return row[0];
                    title = row[0].split('>')[2];
                    title = title.split('</')[0];
                    tbl = PrayersArrayHtml.find(table => table[0][0].includes(title));
                    return retrieveRowsHTML(tbl);
                })
                    .join(' ');
                return html;
            }
            ;
        })();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxtQkFBbUIsR0FBZSxzQkFBc0IsRUFBRSxDQUFDO0FBRWpFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUd4RDs7R0FFRztBQUNILEtBQUssVUFBVSxRQUFRO0lBQ3JCLElBQUksWUFBWSxDQUFDLFFBQVE7UUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTlELGlCQUFpQixFQUFFLENBQUM7SUFDcEIsSUFBSSxZQUFZLENBQUMsWUFBWSxFQUFFO1FBQzdCLElBQUksT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLEVBQ3RCLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyx5REFBeUQ7UUFDdkgseUJBQXlCO1FBQ3pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNyQyxLQUFLLENBQ0gsb0RBQW9EO2dCQUNwRCxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFO2dCQUNqQyxHQUFHO2dCQUNILENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtnQkFDeEMsR0FBRztnQkFDSCxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFO2dCQUNyQyxpR0FBaUcsQ0FDbEcsQ0FBQztZQUNGLFlBQVksQ0FBQyxRQUFRLENBQ25CLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFDbEIsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUNwQixPQUFPLENBQUMsVUFBVSxFQUFFLEVBQ3BCLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLDREQUE0RDtZQUMvRCxjQUFjLENBQUMsWUFBWSxD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O1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0QsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ3hDLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUN4QyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEI7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNELENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0QsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUN4QjtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNELENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUN4QyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0QsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUN4QixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hELENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDeEI7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNELENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hDLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDeEI7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0QsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDeEUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUN4RSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDeEQsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ3hDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNoQixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDaEUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDeEQ7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0QsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztLQUNqRSxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsY0FBYztJQUNyQixJQUNFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQ3ZDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUN2QztRQUNBLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMzQjtTQUFNLElBQ0wsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDeEMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQ3RDO1FBQ0EsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQzVCO1NBQU0sSUFDTCxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDdEMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQ3RDO1FBQ0EsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzFCO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILEtBQUssVUFBVSxXQUFXLENBQUMsT0FBb0I7SUFDN0MsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsa0JBQWtCLENBQUMsU0FBbUI7SUFDN0MsSUFBSSxHQUFzQixFQUFFLElBQXVCLENBQUM7SUFDcEQsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFO1FBQ3ZCLEdBQUcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBc0IsQ0FBQztRQUN2RCxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNyQixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDYixRQUFRLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7R0FHRztBQUNILEtBQUssVUFBVSxZQUFZLENBQUMsT0FBb0I7SUFDOUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUNEOztHQUVHO0FBQ0gsU0FBUyxpQkFBaUI7SUFDeEIsSUFBSSxTQUFpQixDQUFDO0lBQ3RCLHdCQUF3QjtJQUN4QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDakIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2pCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFL0QsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFlO1FBQ3ZDLE1BQU0sVUFBVSxHQUFVLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDM0IsS0FBSyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7SUFDN0IsQ0FBQztJQUVELFNBQVMsZUFBZSxDQUFDLEdBQWU7UUFDdEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQUUsT0FBTyxDQUFDLGdNQUFnTTtRQUM5UCxHQUFHLENBQUMsY0FBYyxDQUFDO1FBQ25CLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTztRQUU3QixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNqQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUVqQyxJQUFJLEtBQUssR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO1FBQ3hCLElBQUksS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7UUFFeEIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDckMsb0JBQW9CO1lBQ3BCLElBQUksS0FBSyxHQUFHLEVBQUUsRUFBRTtnQkFDZCx5QkFBeUI7Z0JBQ3pCLFNBQVMsR0FBRyxNQUFNLENBQUM7Z0JBQ25CLElBQ0UsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0JBQ3ZDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUN2QztvQkFDQSxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQzNCO3FCQUFNLElBQ0wsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO29CQUN2QyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFDdEM7b0JBQ0EsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUMzQjthQUNGO2lCQUFNLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFO2dCQUN0Qix5QkFBeUI7Z0JBQ3pCLFNBQVMsR0FBRyxPQUFPLENBQUM7Z0JBQ3BCLElBQ0UsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO29CQUN0QyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFDdkM7b0JBQ0EsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUMxQjtxQkFBTSxJQUNMLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO29CQUN4QyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFDdEM7b0JBQ0EsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUM1QjthQUNGO1NBQ0Y7YUFBTTtZQUNMLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtnQkFDYixnQkFBZ0I7Z0JBQ2hCLFNBQVMsR0FBRyxNQUFNLENBQUM7Z0JBQ25CLElBQUksWUFBWSxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUM5Qyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDakQ7aUJBQU07Z0JBQ0wsY0FBYztnQkFDZCxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixJQUFJLFlBQVksQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDOUMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQ2pEO1NBQ0Y7UUFDRCxrQkFBa0I7UUFDbEIsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNiLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDZixDQUFDO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUNEOzs7O0dBSUc7QUFDSCxTQUFTLGlCQUFpQixDQUFDLE1BQW1CLEVBQUUsT0FBZTtJQUM3RCxJQUFJLFlBQVksQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ2hELHVIQUF1SDtRQUN2SCxjQUFjLEVBQUUsQ0FBQztRQUNqQixPQUFPO0tBQ1I7SUFDRCxJQUFJLFNBQVMsR0FBd0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFNUUsS0FBSyxDQUFDLElBQUksQ0FDUixZQUFZLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFxQyxDQUN2RTtTQUNFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ3JDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ2IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDdkMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQ2hDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDdEMsMkVBQTJFO1FBQzNFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQzVFO1NBQU07UUFDTCxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztLQUM3RTtJQUNELFlBQVksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsWUFBWSxDQUFDLEVBQVU7SUFDOUIsSUFBSSxPQUFPLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekQsSUFBSSxPQUFPLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekQsSUFBSSxDQUFDLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFakQsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDaEIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFbkMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDdkIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUM3QyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1QixDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDaEMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUNqQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxFQUFFLEdBQUcsYUFBYSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsSUFBSSxFQUFFLEtBQUssYUFBYSxFQUFFO1FBQ3hCLHVCQUF1QjtLQUN4QjtTQUFNLElBQUksRUFBRSxLQUFLLGNBQWMsRUFBRTtRQUNoQyx3QkFBd0I7S0FDekI7SUFDRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBQ0Q7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBUyxXQUFXLENBQUMsSUFjcEI7SUFFQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLO1FBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLDRGQUE0RixDQUFDLENBQUM7SUFFM0osQ0FBQyxTQUFTLFdBQVc7UUFDbkIsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO1FBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtZQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNuRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxLQUFLO1lBQUUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztRQUNwRSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxJQUFJO1lBQUUsWUFBWSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDakUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssS0FBSztZQUFFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7UUFDcEUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssSUFBSTtZQUFFLHNCQUFzQixDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsQ0FBQyxtRkFBbUY7SUFDakssQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVMLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUUxQixJQUFJLElBQVksRUFDZCxNQUFNLEdBQWlCLEVBQUUsQ0FBQztJQUU1QixDQUFDLFNBQVMsc0JBQXNCO1FBQzlCLElBQUksSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZTtZQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDO1FBQ2hILElBQUksQ0FBQyxlQUFlO2FBQ2pCLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3RCLGtHQUFrRztZQUNsRyxJQUFJLENBQUMsVUFBVTtnQkFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFckQsb0ZBQW9GO1lBQ3BGLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7Z0JBQ3JDLElBQUksR0FBRyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxrSEFBa0g7WUFDMUosVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDLDJDQUEyQztZQUMvRCxNQUFNLENBQUMsSUFBSSxDQUNULFNBQVMsQ0FDUCxVQUFVLEVBQ1YsNkJBQTZCLENBQUMsVUFBVSxDQUFDLENBQzVCLENBQ2hCLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTCxJQUFJLElBQUksQ0FBQyxLQUFLO1FBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFeEMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxPQUFPO0lBRWhDLE9BQU8sYUFBYSxFQUFFLENBQUM7SUFFdkIsU0FBUyxhQUFhO1FBQ3BCLHdGQUF3RjtRQUN4RixJQUFJLFFBQVEsR0FBcUIsRUFBRSxDQUFDO1FBQ3BDLElBQUksV0FBdUIsRUFDekIsU0FBaUIsRUFDakIsUUFBZ0IsQ0FBQztRQUVuQixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDdkIsSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTztZQUNuQixXQUFXLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLGtJQUFrSTtZQUMvSyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0QsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztRQUVoQixTQUFTLFVBQVUsQ0FBQyxHQUFhO1lBQy9CLElBQUksQ0FBQyxHQUFHO2dCQUFFLE9BQU87WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFBRSxRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsNktBQTZLO1lBQ25QLE9BQU8sMEJBQTBCLENBQUM7Z0JBQ2hDLE1BQU0sRUFBRSxHQUFHO2dCQUNYLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixRQUFRLEVBQUUsUUFBUTtnQkFDbEIsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUM5QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUzthQUMxQixDQUFDLElBQUksU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxTQUFTLGtCQUFrQixDQUFDLEtBQWlCO1lBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFNUUsSUFBSSxRQUFRLEdBQWUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUNuQyxXQUF1QixFQUN2QixZQUFZLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFFNUUsWUFBWTtpQkFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2IsV0FBVyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsNkJBQTZCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUM7Z0JBRXBGLElBQUksQ0FBQyxXQUFXO29CQUFFLE9BQU87Z0JBRXpCLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUNoRSxnR0FBZ0c7b0JBQ2hHLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFaEQsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBRTVELENBQUMsQ0FBQyxDQUFDO1lBRUwsT0FBTyxRQUFRLENBQUE7UUFFakIsQ0FBQztRQUFBLENBQUM7SUFDSixDQUFDO0lBQUEsQ0FBQztBQUVKLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsYUFBYSxDQUFDLEtBQWE7SUFDbEMsSUFBSSxLQUFLLEtBQUssY0FBYyxDQUFDLEtBQUs7UUFBRSxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDOUQsSUFBSSxLQUFLLEtBQUssZ0JBQWdCLENBQUMsS0FBSztRQUFFLE9BQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUNsRSxJQUFJLEtBQUssS0FBSyxjQUFjLENBQUMsS0FBSztRQUFFLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUNoRSxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsNkJBQTZCLENBQUMsS0FBYTtJQUNsRCxJQUFJLENBQUMsS0FBSztRQUFFLE9BQU87SUFDbkIsSUFBSSxLQUFLLEdBQStCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQ3ZFLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzNCLENBQUM7SUFDRixJQUFJLEtBQUs7UUFBRSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQy9CLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHFCQUFxQixDQUFDLEtBQW1CO0lBQ2hELElBQUksSUFBSSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUM7SUFDL0QsSUFBSSxJQUFJO1FBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxLQUFLLFVBQVUsTUFBTSxDQUFDLFFBQXVCO0lBQzNDLElBQUksQ0FBQyxRQUFRO1FBQUUsT0FBTztJQUN0QixJQUFJLFlBQVksQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztRQUFFLE9BQU87SUFDekQsSUFBSSxDQUFDLFFBQVE7UUFBRSxPQUFPO0lBQ3RCLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQzlDLFNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVwRCxRQUFRO1NBQ0wsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDZixJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sQ0FBQSx1SEFBdUg7UUFDeEksSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx1SUFBdUk7UUFDak0sNkdBQTZHO1FBQzdHLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsMEJBQTBCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEUsOE5BQThOO1FBQzlOLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWhELENBQUMsU0FBUyxlQUFlO1lBQ3ZCLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBMkIsQ0FBQztZQUNyRSxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGlCQUFpQjtpQkFDeEMsVUFBVSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7aUJBQ25CLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLE9BQU87WUFDbEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUN6QixJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDO29CQUFFLE9BQU87Z0JBQzdELFdBQVcsQ0FBQyxJQUFJLENBQ2QsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxDQUM3QyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRUwsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMxQixnSUFBZ0k7WUFDaEksR0FBRyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7WUFFcEI7Ozs7a0JBSU07WUFFTixDQUFDLEtBQUssVUFBVSxvQkFBb0I7Z0JBQ2xDLElBQUksWUFBWSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQ2xDLFVBQVUsR0FBRyxlQUFlLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUNuQyxDQUFDO2dCQUNqQixJQUFJLENBQUMsWUFBWTtvQkFBRSxZQUFZLEdBQUcsR0FBRyxDQUFDLGdCQUErQixDQUFDO2dCQUN0RSxJQUFJLENBQUMsWUFBWTtvQkFDZixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEdBQUcsZUFBZSxDQUFDLENBQUM7Z0JBRW5FLElBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztvQkFDakQsWUFBWSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FDckQsUUFBUSxHQUFHLEdBQUcsRUFDZCxFQUFFLENBQ0gsQ0FBQyxDQUFDLHFEQUFxRDtnQkFFMUQsSUFBSSxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO29CQUNsRCxZQUFZLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUNyRCxTQUFTLEdBQUcsR0FBRyxFQUNmLEVBQUUsQ0FDSCxDQUFDLENBQUMsK01BQStNO2dCQUVwTixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVztvQkFDekIsWUFBWSxDQUFDLFNBQVMsR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQywwQ0FBMEM7Z0JBRTlHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVc7b0JBQzFCLFlBQVksQ0FBQyxTQUFTLEdBQUcsU0FBUyxHQUFHLEdBQUcsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsMkNBQTJDO1lBQ2xILENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDTjtRQUNELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFdkQsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFBRSxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV6RSxJQUNFLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSTs7Z0JBRWhCO29CQUNFLE1BQU0sQ0FBQyxNQUFNO29CQUNiLE1BQU0sQ0FBQyxVQUFVO29CQUNqQixNQUFNLENBQUMsTUFBTTtvQkFDYixNQUFNLENBQUMsVUFBVTtvQkFDakIsTUFBTSxDQUFDLGFBQWE7b0JBQ3BCLE1BQU0sQ0FBQyxXQUFXO29CQUNsQixNQUFNLENBQUMsVUFBVTtvQkFDakIsTUFBTSxDQUFDLFVBQVU7b0JBQ2pCLE1BQU0sQ0FBQyxjQUFjO29CQUNyQixNQUFNLENBQUMsV0FBVztpQkFDbkIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV2RCxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxtRUFBbUU7SUFDbEcsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBQ0Q7OztHQUdHO0FBQ0gsU0FBUyxhQUFhLENBQUMsVUFBa0M7SUFDdkQsSUFBSSxRQUFrQixDQUFDO0lBQ3ZCLFVBQVU7U0FDUCxNQUFNLENBQ0wsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUNaLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ3BDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQ3RDO1NBQ0EsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7UUFDckIsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTO2lCQUN0QyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUM7aUJBQzNDLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2pEO2FBQU0sSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM3QyxRQUFRLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQUUsT0FBTyxDQUFDLG1HQUFtRztZQUNwSSxRQUFRO2lCQUNMLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsNkRBQTZEO2lCQUNoSCxPQUFPLENBQ04sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUNyRSxDQUFDO1lBQ0osU0FBUyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3pDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsWUFBWSxDQUFDLEdBQWdCO0lBQ3BDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUFFLE9BQU87SUFFNUMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBa0QsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUV0SCxJQUNFLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN6QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztRQUN0QyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBRSxrTkFBa047SUFHdE8sT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxrTEFBa0w7QUFDeE4sQ0FBQztBQUVELEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxRQUEwQjtJQUMxRCxJQUFJLENBQUMsUUFBUTtRQUFFLE9BQU87SUFDdEIsSUFBSSxZQUFZLENBQUMsV0FBVyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFBRSxPQUFPLENBQUMsZ0VBQWdFO0lBRTFILElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBd0IsQ0FBQztJQUMxRSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBRWpELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUN2QixxQ0FBcUM7UUFDckMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQ3RCLHFGQUFxRjthQUNwRixPQUFPLENBQUMsQ0FBQyxLQUFrQixFQUFFLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJO2dCQUFFLE9BQU87WUFDeEIsc0ZBQXNGO1lBQ3RGLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDckIsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7b0JBQ3RDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsb0JBQW9CLENBQUMsTUFHN0I7SUFDQyxJQUFJLFlBQVksQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztRQUFFLE9BQU8sQ0FBQyxpSEFBaUg7SUFFM0ssSUFBSSxNQUFNLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtRQUM1QixNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0tBQzlDO1NBQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxLQUFLLEtBQUssRUFBRTtRQUNwQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0tBQzFDO1NBQU07UUFDTCxvREFBb0Q7UUFDcEQsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ3JDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7YUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDM0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztLQUNoRDtJQUNELGdDQUFnQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVsRCxJQUFJLFFBQVEsR0FDVixLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQTRCLENBQUM7U0FDeEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdKQUFnSjtJQUV2TCxJQUFJLG1CQUFtQixHQUNyQixRQUFRO1NBQ0wsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDZCxpQkFBaUIsQ0FBQyxHQUFHLENBQUM7O1lBRXRCLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FDcEQsQ0FBQyxDQUFBLDBFQUEwRTtJQUVoRixJQUFJLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3RELHdKQUF3SjtRQUN4SixZQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxNQUFNLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDdEg7U0FBTTtRQUNMLHFGQUFxRjtRQUNyRixZQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxNQUFNLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDcEg7SUFHRCxTQUFTLFlBQVksQ0FBQyxZQUEyQjtRQUMvQyxZQUFZO2FBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2IsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ3hFLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN2QixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDckMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDaEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQUEsQ0FBQztBQUNKLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsS0FBSyxVQUFVLGdDQUFnQyxDQUM3QyxRQUFxQixFQUNyQixXQUFtQixZQUFZO0lBRS9CLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUTtRQUFFLE9BQU87SUFDL0IsSUFBSSxLQUFrQixDQUFDO0lBQ3ZCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQzFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDUixLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQ2hFLENBQUMsQ0FBQyxDQUFnQixDQUFDO0lBQ3BCLElBQUksQ0FBQyxLQUFLO1FBQUUsT0FBTztJQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7UUFDakMsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FDdkMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFDN0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQ2xDLENBQUM7S0FDSDtTQUFNLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7UUFDdkMsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FDdkMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQ2pDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQzlCLENBQUM7S0FDSDtBQUNILENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGlCQUFpQixDQUN4QixRQUEwQjtJQUUxQixJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUFFLE9BQU87SUFDL0MsSUFBSSxZQUFZLENBQUMsV0FBVyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFBRSxPQUFPO0lBQ3pELFFBQVE7U0FDTCxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNmLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUM1RCxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN2QjtZQUNILEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztZQUNqQyxnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2QztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUNEOzs7Ozs7R0FNRztBQUNILFNBQVMsNEJBQTRCLENBQ25DLFNBQXlDLEVBQ3pDLE9BQWUsRUFDZixPQUtDLEVBQ0QsY0FBc0IsTUFBTTtJQUU1QixXQUFXLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVwRyxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FDakUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQ2pCLENBQUM7SUFDdEIsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDeEMsSUFBSSxPQUFPLENBQUMsS0FBSztRQUNmLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxDQUFDLENBQUM7U0FDNUUsSUFBSSxPQUFPLENBQUMsUUFBUTtRQUN2QixPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2xGLElBQUksT0FBTyxDQUFDLFVBQVU7UUFDekIsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNwRixJQUFJLE9BQU8sQ0FBQyxRQUFRO1FBQ3ZCLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDekYsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxLQUFLLFVBQVUsK0JBQStCLENBQUMsSUFPOUM7SUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07UUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxxRUFBcUU7UUFDeEgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsZ0RBQWdEO0tBQ25IO0lBRUQsQ0FBQyxLQUFLLFVBQVUsZUFBZTtRQUM3QixJQUFJLEdBQUcsR0FBVyxJQUFJLE1BQU0sQ0FBQztZQUMzQixLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3JCLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixFQUFFO1lBQ3RDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsUUFBUSxFQUFFLGNBQWM7WUFDeEIsT0FBTyxFQUFFLEdBQUcsRUFBRTtnQkFDWixJQUFJLGFBQWEsR0FBVyxDQUFDLENBQUM7Z0JBQzlCLGdHQUFnRztnQkFDaEcsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDakQscUtBQXFLO2dCQUNySyxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUMzQyxpQ0FBaUM7Z0JBQ2pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7Z0JBQy9DLHdJQUF3STtnQkFDeEksTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRywwQkFBMEIsQ0FDM0QsTUFBTSxFQUNOLFNBQVMsRUFDVCxDQUFDLENBQ0YsQ0FBQztnQkFFRixnWUFBZ1k7Z0JBQ2hZLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFekMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7Z0JBQ2pELElBQUksT0FBTyxHQUFXLENBQUMsQ0FBQztnQkFDeEIsNERBQTREO2dCQUM1RCwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNsRSxDQUFDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsQ0FBQyxTQUFTLG1CQUFtQjtZQUMzQixTQUFTLENBQUM7Z0JBQ1IsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsYUFBYSxFQUFFLElBQUksQ0FBQyxZQUFZO2dCQUNoQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7Z0JBQ3RCLEtBQUssRUFBRSxLQUFLO2dCQUNaLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTzthQUNyQixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUNqRDtRQUNMLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxPQUFPLEdBQUcsQ0FBQTtJQUNaLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTDs7T0FFRztJQUNILFNBQVMsMEJBQTBCLENBQ2pDLFNBQWlCLEVBQ2pCLE9BQWUsRUFDZixPQUF1QixFQUN2QixhQUFxQjtRQUVyQixJQUFJLFFBQWdCLENBQUM7UUFFckIsQ0FBQyxTQUFTLG9CQUFvQjtZQUM1QixJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLGFBQWE7Z0JBQUUsT0FBTyxDQUFDLDJJQUEySTtZQUNuTSxJQUFJLElBQUksR0FBVyxJQUFJLE1BQU0sQ0FBQztnQkFDNUIsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRTtnQkFDdkMsUUFBUSxFQUFFLGNBQWM7YUFDekIsQ0FBQyxDQUFDO1lBRUgsb0hBQW9IO1lBQ3BILElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsT0FBTyxHQUFHLGFBQWEsRUFBRTtnQkFDdkQsNkdBQTZHO2dCQUM3RyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLE9BQU8sSUFBSSxhQUFhLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztnQkFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO2dCQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM1QztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFPLENBQUMsK0VBQStFO1lBQzFHLFNBQVMsQ0FBQztnQkFDUixHQUFHLEVBQUUsSUFBSTtnQkFDVCxhQUFhLEVBQUUsb0JBQW9CO2dCQUNuQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLEtBQUssRUFBRSxLQUFLO2dCQUNaLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTzthQUN0QixDQUFDLENBQUMsQ0FBQyxnYUFBZ2E7WUFFcGEsU0FBUyxjQUFjLENBQUMsVUFBbUIsSUFBSTtnQkFDN0MsNEZBQTRGO2dCQUM1RixPQUFPLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztnQkFDdkIsc0hBQXNIO2dCQUN0SCxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDOUQsZ0VBQWdFO2dCQUNoRSxJQUFJLE9BQU87b0JBQUUsT0FBTyxJQUFJLGFBQWEsQ0FBQzs7b0JBQ2pDLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBRWpCLDREQUE0RDtnQkFDNUQsMEJBQTBCLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDekUsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFTCxDQUFDLFNBQVMsd0JBQXdCO1lBQ2hDLEtBQ0UsSUFBSSxDQUFDLEdBQUcsT0FBTyxFQUNmLENBQUMsR0FBRyxPQUFPLEdBQUcsYUFBYSxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFDNUQsQ0FBQyxFQUFFLEVBQ0g7Z0JBQ0EsK0VBQStFO2dCQUMvRSxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO29CQUFFLE9BQU8sQ0FBQSxtTUFBbU07Z0JBQ3BRLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7b0JBQUUsT0FBTyxDQUFDLHlPQUF5TztnQkFDM1QsU0FBUyxDQUFDO29CQUNSLEdBQUcsRUFBRSxRQUFRO29CQUNiLGFBQWEsRUFBRSxPQUFPO29CQUN0QixRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7b0JBQzNCLEtBQUssRUFBRSxLQUFLO29CQUNaLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTztpQkFDMUIsQ0FBQyxDQUFDO2FBQ0o7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUFBLENBQUM7SUFHRjs7O09BR0c7SUFDSCxLQUFLLFVBQVUsb0JBQW9CO1FBQ2pDLElBQUksSUFBYyxDQUFDO1FBQ25CLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3hDLCtKQUErSjtZQUMvSixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBQy9CLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxJQUFJLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQztnQkFDbkIsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFO29CQUNMLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM5QyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGlDQUFpQztpQkFDbEY7Z0JBQ0QsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6QixRQUFRLEVBQUUsMEJBQTBCO2dCQUNwQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7YUFDdEMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksZUFBZTtZQUNqQixJQUFJO2lCQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUEsMFVBQTBVO2lCQUNsWixHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ1QsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQSwwR0FBMEc7Z0JBQzVJLE9BQU8sR0FBRyxDQUFBO1lBQ1osQ0FBQyxDQUFDO2lCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVwQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQSxnRUFBZ0U7UUFFdEgsU0FBUyxVQUFVLENBQUMsR0FBVyxFQUFFLEtBQWE7WUFDNUMsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQTtZQUMvRSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTztZQUNuQixJQUFJLFNBQVMsR0FDWCxLQUFLLENBQUMsSUFBSSxDQUNSLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEdBQUcsY0FBYyxDQUFDLENBRXRELENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNqRCx3RUFBd0U7WUFDeEUsMkJBQTJCLEVBQUUsQ0FBQztZQUU5QixJQUFJLEtBQUssR0FDUCxLQUFLLENBQUMsSUFBSSxDQUNSLFlBQVksQ0FBQyxRQUE0QyxDQUMxRDtpQkFDRSxJQUFJLENBQ0gsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUNOLEdBQUcsQ0FBQyxPQUFPLENBQUMsY0FBYztnQkFDMUIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEtBQUssU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQ3pELENBQUE7WUFFTCxJQUFJLEtBQUs7Z0JBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRTFCLHFGQUFxRjtZQUNyRixJQUFJLGVBQWUsR0FBRyxXQUFXLENBQUM7Z0JBQ2hDLEtBQUssRUFBRSxLQUFLO2dCQUNaLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztnQkFDeEIsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLGlCQUFpQixFQUFFLEtBQUs7Z0JBQ3hCLGlCQUFpQixFQUFFLEtBQUs7YUFDekIsQ0FBQyxJQUFJLFNBQVMsQ0FBQztZQUVoQixJQUFJLENBQUMsZUFBZTtnQkFBRSxPQUFPO1lBRTdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztZQUN6QyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFHL0QscURBQXFEO1lBQ3JELE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN4QixvQ0FBb0M7WUFDcEMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFHcEMseUJBQXlCO1lBQ3pCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBQUEsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQsSUFBSSxTQUFTLEdBQUc7SUFDZCxDQUFDLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7Q0FDbEQsQ0FBQztBQUVGLFNBQVMsd0JBQXdCLENBQy9CLEtBQThCO0lBRTlCLElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO0lBQzdDLElBQUksU0FBUyxHQUE0QixFQUFFLENBQUM7SUFDNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDckMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzNCLDZFQUE2RTtZQUM3RSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQjtTQUNGO2FBQU07WUFDTCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQjtTQUNGO0tBQ0Y7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBUyxTQUFTLENBQ2hCLFVBQWtCLEVBQ2xCLFlBQTBCLEVBQzFCLFVBS0ksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBRW5CLElBQUksQ0FBQyxZQUFZO1FBQUUsWUFBWSxHQUFHLDZCQUE2QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzVFLElBQUksQ0FBQyxZQUFZO1FBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RFLElBQUksS0FBaUIsQ0FBQztJQUN0QixJQUFJLE9BQU8sQ0FBQyxLQUFLO1FBQ2YsS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQ3ZCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FDOUQsQ0FBQztTQUNDLElBQUksT0FBTyxDQUFDLFVBQVU7UUFDekIsS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQ3ZCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FDdEUsQ0FBQztTQUNDLElBQUksT0FBTyxDQUFDLFFBQVE7UUFDdkIsS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQ3ZCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FDcEUsQ0FBQztTQUNDLElBQUksT0FBTyxDQUFDLFFBQVE7UUFDdkIsS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQ3ZCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FDcEUsQ0FBQztJQUVKLElBQUksQ0FBQyxLQUFLO1FBQ1IsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUNoQiwrQ0FBK0MsRUFDL0MsVUFBVSxFQUNWLGlCQUFpQixFQUNqQixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRSxTQUFTLENBQ1YsQ0FBQztJQUVKLE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUNEOzs7O0dBSUc7QUFDSCxTQUFTLHdCQUF3QixDQUFDLE1BQWMsRUFBRSxRQUFpQixLQUFLO0lBQ3RFLElBQUksS0FBSztRQUFFLG9CQUFvQixDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFHL0MsTUFBTSxLQUFLLGVBQWUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7SUFFeEssb0JBQW9CLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7SUFDbEQsb0JBQW9CLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztJQUV2RDs7T0FFRztJQUNILENBQUMsU0FBUyxjQUFjO1FBQ3RCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsS0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUMvQixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDeEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1FBQzNCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNwQyxDQUFDLENBQUMsY0FBYyxDQUFDO1lBQ2pCLDJCQUEyQixFQUFFLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNMLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsa0RBQWtEO0lBQ2hHLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUNEOztHQUVHO0FBQ0gsU0FBUywyQkFBMkI7SUFDbEMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQztJQUN6RCxvQkFBb0IsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELFNBQVMsaUJBQWlCO0lBQ3hCLHdCQUF3QixDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRCxJQUFJLEdBQWdCLENBQUM7SUFFckIsd0RBQXdEO0lBQ3hELFNBQVMsVUFBVTtRQUNqQixHQUFHLEdBQUcsaUJBQWlCLENBQUM7WUFDdEIsR0FBRyxFQUFFLFFBQVE7WUFDYixJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBRSxhQUFhO1lBQ3ZCLFNBQVMsRUFBRSxhQUFhO1lBQ3hCLGFBQWEsRUFBRSxvQkFBb0I7WUFDbkMsRUFBRSxFQUFFLFlBQVk7WUFDaEIsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRSxPQUFPO2dCQUNkLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDZCwwRUFBMEU7b0JBQzFFLElBQUksY0FBYyxDQUFDO29CQUNuQixNQUFNLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTt3QkFDbkQsb0RBQW9EO3dCQUNwRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQ25CLGdEQUFnRDt3QkFDaEQsY0FBYyxHQUFHLENBQUMsQ0FBQztvQkFDckIsQ0FBQyxDQUFDLENBQUM7b0JBQ0gscURBQXFEO29CQUNyRCxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUNWLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO3dCQUN2RCxjQUFjLENBQUMsTUFBTSxDQUFDO3dCQUN0QixxRUFBcUU7d0JBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQzt3QkFDdEQsNkNBQTZDO3dCQUM3QyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxjQUFjLENBQUMsVUFBVSxDQUFDO3dCQUNwRCwrREFBK0Q7d0JBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLE9BQU8sRUFBRSxDQUFDLENBQUM7d0JBQy9ELCtEQUErRDt3QkFDL0QsY0FBYyxHQUFHLElBQUksQ0FBQztvQkFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDTCxTQUFTLGlCQUFpQjt3QkFDeEIsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FDcEMsNEJBQTRCLENBQzdCLENBQUMsT0FBTyxDQUFDO3dCQUNWLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTs0QkFDbEQsT0FBTyxLQUFLLENBQUM7NEJBQ2IsWUFBWTt5QkFDYjs2QkFBTSxJQUFJLFNBQVMsQ0FBQyxVQUFVLElBQUksWUFBWSxFQUFFOzRCQUMvQyxPQUFPLFlBQVksQ0FBQzt5QkFDckI7d0JBQ0QsT0FBTyxTQUFTLENBQUM7b0JBQ25CLENBQUM7Z0JBQ0gsQ0FBQzthQUNGO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHVCQUF1QjtJQUN2QixDQUFDLFNBQVMsY0FBYztRQUN0QixJQUFJLFVBQVUsR0FBcUIsaUJBQWlCLENBQUM7WUFDbkQsU0FBUyxFQUFFLEVBQUU7WUFDYixHQUFHLEVBQUUsT0FBTztZQUNaLGFBQWEsRUFBRSxvQkFBb0I7WUFDbkMsRUFBRSxFQUFFLFlBQVk7WUFDaEIsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDN0Q7U0FDRixDQUFxQixDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUN2QixVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2RCxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztJQUMvQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsQ0FBQyxLQUFLLFVBQVUsbUNBQW1DO1FBQ2pELElBQUksYUFBYSxHQUFHLG1CQUFtQixDQUFDLG9CQUFvQixFQUFFO1lBQzVELEVBQUUsRUFBRSwwQ0FBMEM7WUFDOUMsRUFBRSxFQUFFLHdEQUF3RDtZQUM1RCxFQUFFLEVBQUUseURBQXlEO1NBQzlELENBQUMsQ0FBQztRQUVILElBQUksUUFBUSxHQUFpQjtZQUMzQixFQUFFLEVBQUUsUUFBUTtZQUNaLEVBQUUsRUFBRSxTQUFTO1lBQ2IsRUFBRSxFQUFFLE1BQU07U0FDWCxDQUFBO1FBRUQsU0FBUyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFckMsUUFBUSxHQUFHO1lBQ1QsRUFBRSxFQUFFLFFBQVE7WUFDWixFQUFFLEVBQUUsV0FBVztZQUNmLEVBQUUsRUFBRSxVQUFVO1NBQ2YsQ0FBQTtRQUVELFNBQVMsQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTFDLFNBQVMsU0FBUyxDQUFDLEtBQW1CLEVBQUUsRUFBVSxFQUFFLElBQWE7WUFDL0QsaUJBQWlCLENBQUM7Z0JBQ2hCLEdBQUcsRUFBRSxRQUFRO2dCQUNiLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxhQUFhO2dCQUN2QixTQUFTLEVBQUUsS0FBSyxDQUFDLGVBQWUsQ0FBQztnQkFDakMsYUFBYSxFQUFFLGFBQWE7Z0JBQzVCLEVBQUUsRUFBRSxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRTtvQkFDUCxLQUFLLEVBQUUsT0FBTztvQkFDZCxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUMxQzthQUNGLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQztZQUFBLENBQUM7UUFDNUMsQ0FBQztRQUVELGFBQWEsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsMEJBQTBCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFdEYsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVMLENBQUMsU0FBUyxxQkFBcUI7UUFDN0IsSUFBSSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUU7WUFDeEQsRUFBRSxFQUFFLDJCQUEyQjtZQUMvQixFQUFFLEVBQUUsNkJBQTZCO1lBQ2pDLEVBQUUsRUFBRSxxQ0FBcUM7U0FDMUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxLQUFLLEdBQUcsaUJBQWlCLENBQUM7WUFDNUIsU0FBUyxFQUFFLEVBQUU7WUFDYixHQUFHLEVBQUUsT0FBTztZQUNaLGFBQWEsRUFBRSxhQUFhO1lBQzVCLEVBQUUsRUFBRSxXQUFXO1NBQ2hCLENBQXFCLENBQUM7UUFDdkIsSUFBSSxRQUFRLEdBQXdCLGNBQWMsRUFBRSxDQUFDO1FBQ3JELElBQUksQ0FBQyxRQUFRO1lBQ1gsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hFLEtBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBQ3JCLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4QyxLQUFLLENBQUMsRUFBRSxHQUFHLGVBQWUsQ0FBQztRQUMzQixLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztRQUNsQixLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztRQUVsQixNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNqQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNuQixLQUFLLENBQUMsUUFBUSxHQUFHLEdBQUcsRUFBRTtZQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQWUsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQztRQUVGLFNBQVMsY0FBYztZQUNyQixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxFQUFFO2dCQUNqQyxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUMxQjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTCwwQ0FBMEM7SUFDMUMsQ0FBQyxLQUFLLFVBQVUsNEJBQTRCO1FBQzFDLElBQUksS0FBSyxHQUFHO1lBQ1YsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDO1lBQ2pCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQztZQUNsQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUM7WUFDakIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDO1lBQ2pCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQztTQUNyQixDQUFDO1FBRUYsSUFBSSxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRTtZQUNoRSxFQUFFLEVBQUUscUNBQXFDO1lBQ3pDLEVBQUUsRUFBRSxtQ0FBbUM7WUFDdkMsRUFBRSxFQUFFLDZCQUE2QjtTQUNsQyxDQUFDLENBQUM7UUFFSCxJQUFJLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFO1lBQ2hFLEVBQUUsRUFBRSwrQkFBK0I7WUFDbkMsRUFBRSxFQUFFLCtDQUErQztZQUNuRCxFQUFFLEVBQUUsNkJBQTZCO1NBQ2xDLENBQUMsQ0FBQztRQUVILElBQUksbUJBQW1CLEdBQUcsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUU7WUFDOUQsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxFQUFFLEVBQUUsNkVBQTZFO1lBQ2pGLEVBQUUsRUFBRSxvQ0FBb0M7U0FDekMsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDO1lBQ1gsYUFBYSxFQUFFLG9CQUFvQjtZQUNuQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLEtBQUssRUFBRSxDQUFDO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDO1lBQ1gsYUFBYSxFQUFFLG9CQUFvQjtZQUNuQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLEtBQUssRUFBRSxDQUFDO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDO1lBQ1gsYUFBYSxFQUFFLG1CQUFtQjtZQUNsQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsS0FBSyxFQUFFLENBQUM7U0FDVCxDQUFDLENBQUM7UUFFSDs7O1dBR0c7UUFDSCxTQUFTLFdBQVcsQ0FBQyxJQUFZLEVBQUUsS0FBYTtZQUM5QyxJQUFJLGFBQWEsR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsYUFBYTtnQkFBRSxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUs7Z0JBQ3BELG9UQUFvVDtnQkFDcFQsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQztpQkFFOUIsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSztnQkFDM0QsT0FBTyxLQUFLLENBQ1Ysa0dBQWtHLENBQ25HLENBQUM7aUJBRUMsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakYsNFNBQTRTO2dCQUM1UyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4QyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFBO2FBQzVCO2lCQUVJLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hGLE9BQU8sS0FBSyxDQUNWLGlIQUFpSCxDQUNsSCxDQUFDO2lCQUVDLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDekQsaVBBQWlQO2dCQUNqUCxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUM3QixhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO2FBQzdCO2lCQUNJLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUN0Qyw2R0FBNkc7Z0JBQzdHLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7WUFHOUIsZUFBZSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxlQUFlLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLGNBQWMsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbEMsWUFBWSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzNELE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFRCxTQUFTLFlBQVksQ0FBQyxJQUtyQjtZQUNDLElBQUksTUFBbUIsQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUM3QixNQUFNLEdBQUcsaUJBQWlCLENBQUM7b0JBQ3pCLEdBQUcsRUFBRSxRQUFRO29CQUNiLElBQUksRUFBRSxRQUFRO29CQUNkLFFBQVEsRUFBRSxhQUFhO29CQUN2QixTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDbEIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO29CQUNqQyxFQUFFLEVBQUUsVUFBVTtvQkFDZCxPQUFPLEVBQUU7d0JBQ1AsS0FBSyxFQUFFLE9BQU87d0JBQ2QsR0FBRyxFQUFFLEdBQUcsRUFBRTs0QkFDUixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNsQixNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQzs0QkFDdEMsbUZBQW1GOzRCQUNuRixJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUU7Z0NBQ3pCLHFDQUFxQztnQ0FDckMseUJBQXlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQ0FDN0MsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLHNDQUFzQzs2QkFDNUQ7d0JBQ0gsQ0FBQztxQkFDRjtpQkFDRixDQUFDLENBQUM7Z0JBQ0gsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDaEUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQywyR0FBMkc7WUFDbkosQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRywwQkFBMEIsQ0FDdkUsSUFBSSxDQUFDLGFBQWEsRUFDbEIsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVMLENBQUMsS0FBSyxVQUFVLHFCQUFxQjtRQUNuQyxJQUFJLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRTtZQUN6RCxFQUFFLEVBQUUsZ0RBQWdEO1lBQ3BELEVBQUUsRUFBRSw4QkFBOEI7WUFDbEMsRUFBRSxFQUFFLHVCQUF1QjtTQUM1QixDQUFDLENBQUM7UUFDSCxJQUFJLFVBQVUsR0FBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFekUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQUUsT0FBTyxDQUFBLDJFQUEyRTtZQUV4SSxHQUFHLEdBQUcsaUJBQWlCLENBQUM7Z0JBQ3RCLEdBQUcsRUFBRSxRQUFRO2dCQUNiLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxhQUFhO2dCQUN2QixTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztnQkFDcEMsYUFBYSxFQUFFLGFBQWE7Z0JBQzVCLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDZixJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pCLE9BQU8sRUFBRTtvQkFDUCxLQUFLLEVBQUUsT0FBTztvQkFDZCxHQUFHLEVBQUUsR0FBRyxFQUFFO3dCQUNSLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG9DQUFvQzt3QkFDMUQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQ25DLHNGQUFzRjt3QkFDdEYsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFVBQVU7NEJBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsc0RBQXNEO3dCQUMzSCxZQUFZLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyx3Q0FBd0M7d0JBQzlGLElBQUksWUFBWSxDQUFDLFFBQVEsRUFBRTs0QkFDekIsZ0RBQWdEOzRCQUNoRCx5QkFBeUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsZ0pBQWdKOzRCQUM5TCxpQkFBaUIsRUFBRSxDQUFDLENBQUMsc0NBQXNDO3lCQUM1RDtvQkFDSCxDQUFDO2lCQUNGO2FBQ0YsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7UUFDSCxhQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLDBCQUEwQixDQUNsRSxhQUFhLEVBQ2IsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsQ0FBQyxLQUFLLFVBQVUsbUJBQW1CO1FBQ2pDLElBQUksYUFBYSxHQUFHLG1CQUFtQixDQUFDLG1CQUFtQixFQUFFO1lBQzNELEVBQUUsRUFBRSxpQkFBaUI7WUFDckIsRUFBRSxFQUFFLDZCQUE2QjtZQUNqQyxFQUFFLEVBQUUseUJBQXlCO1NBQzlCLENBQUMsQ0FBQztRQUdILG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoRCxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDeEIsR0FBRyxHQUFHLGlCQUFpQixDQUFDO2dCQUN0QixHQUFHLEVBQUUsUUFBUTtnQkFDYixJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsU0FBUyxFQUFFLElBQUksR0FBRyxlQUFlO2dCQUNqQyxhQUFhLEVBQUUsYUFBYTtnQkFDNUIsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLEtBQUssRUFBRSxPQUFPO29CQUNkLEdBQUcsRUFBRSxHQUFHLEVBQUU7d0JBQ1IsSUFBSSxZQUFZLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRTs0QkFDckMsWUFBWSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7NEJBRWhDLElBQUksVUFBVSxHQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQzs0QkFFekUsSUFBSSxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxXQUFXLEtBQUssSUFBSTtnQ0FDL0QsNElBQTRJO2dDQUM1SSxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDOztnQ0FFL0QsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs0QkFFdEUsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUVyRCxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQ0FDN0MsR0FBRyxDQUFDLEVBQUUsS0FBSyxZQUFZLENBQUMsV0FBVztvQ0FDakMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztvQ0FDakMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUN6QyxDQUFDLENBQUMsQ0FBQzt5QkFDSjtvQkFDSCxDQUFDO2lCQUNGO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxJQUFJLEtBQUssWUFBWSxDQUFDLFdBQVcsRUFBRTtnQkFDckMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDakM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILGFBQWEsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsMEJBQTBCLENBQ2xFLGFBQWEsRUFDYixDQUFDLENBQ0YsQ0FBQztJQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTCxDQUFDLEtBQUssVUFBVSxrQkFBa0I7UUFDaEMsSUFBSSxZQUFZLENBQUMsV0FBVyxJQUFJLE1BQU07WUFBRSxPQUFPO1FBQy9DLElBQUksYUFBYSxHQUFHLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFO1lBQzFELEVBQUUsRUFBRSxlQUFlO1lBQ25CLEVBQUUsRUFBRSx5QkFBeUI7WUFDN0IsRUFBRSxFQUFFLG9CQUFvQjtTQUN6QixDQUFDLENBQUM7UUFDSCxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFaEQsSUFBSSxVQUFVLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztRQUVyQyxHQUFHLEdBQUcsaUJBQWlCLENBQUM7WUFDdEIsR0FBRyxFQUFFLFFBQVE7WUFDYixJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBRSxhQUFhO1lBQ3ZCLFNBQVMsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztZQUM1QyxhQUFhLEVBQUUsYUFBYTtZQUM1QixFQUFFLEVBQUUsYUFBYSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFO1lBQ3ZELE9BQU8sRUFBRTtnQkFDUCxLQUFLLEVBQUUsT0FBTztnQkFDZCxHQUFHLEVBQUUsVUFBVSxDQUFDLE9BQU87YUFDeEI7U0FDRixDQUFDLENBQUM7UUFDSCxhQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLDBCQUEwQixDQUNsRSxhQUFhLEVBQ2IsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsa0NBQWtDO0lBQ2xDLENBQUMsS0FBSyxVQUFVLGFBQWE7UUFDM0IsSUFBSSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsWUFBWSxFQUFFO1lBQ3BELEVBQUUsRUFBRSxnQkFBZ0I7WUFDcEIsRUFBRSxFQUFFLG1CQUFtQjtZQUN2QixFQUFFLEVBQUUsYUFBYTtTQUNsQixDQUFDLENBQUM7UUFFSCxJQUFJLFVBQVUsR0FDWixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUM7YUFDaEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwSCxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDdkIsSUFBSSxNQUFNLEdBQUcsaUJBQWlCLENBQUM7Z0JBQzdCLFNBQVMsRUFBRSxLQUFLLENBQUMsZUFBZSxDQUFDO2dCQUNqQyxHQUFHLEVBQUUsUUFBUTtnQkFDYixRQUFRLEVBQUUsVUFBVTtnQkFDcEIsYUFBYSxFQUFFLGFBQWE7Z0JBQzVCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLE9BQU87YUFDdkIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxhQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLDBCQUEwQixDQUNsRSxhQUFhLEVBQ2IsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsQ0FBQyxLQUFLLFVBQVUsZ0JBQWdCO1FBQzlCLElBQUksYUFBYSxHQUFHLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFO1lBQzFELEVBQUUsRUFBRSxlQUFlO1lBQ25CLEVBQUUsRUFBRSw2QkFBNkI7WUFDakMsRUFBRSxFQUFFLFlBQVk7U0FDakIsQ0FBQyxDQUFDO1FBQ0gsb0JBQW9CLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWhELElBQUksUUFBUSxHQUFpQjtZQUMzQixFQUFFLEVBQUUsT0FBTztZQUNYLEVBQUUsRUFBRSxlQUFlO1lBQ25CLEVBQUUsRUFBRSxRQUFRO1NBQ2IsQ0FBQTtRQUVELEdBQUcsR0FBRyxpQkFBaUIsQ0FBQztZQUN0QixHQUFHLEVBQUUsUUFBUTtZQUNiLElBQUksRUFBRSxRQUFRO1lBQ2QsUUFBUSxFQUFFLFdBQVc7WUFDckIsU0FBUyxFQUFFLFFBQVEsQ0FBQyxlQUFlLENBQUM7WUFDcEMsYUFBYSxFQUFFLGFBQWE7WUFDNUIsRUFBRSxFQUFFLFdBQVc7WUFDZixPQUFPLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7YUFDN0I7U0FDRixDQUFDLENBQUM7UUFFSCxhQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLDBCQUEwQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RGLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTCxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFMUIsU0FBUyxtQkFBbUIsQ0FDMUIsRUFBVSxFQUNWLFNBQW9EO1FBRXBELElBQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEQsYUFBYSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDdEIsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3JDLHVEQUF1RDtRQUN2RCxhQUFhLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdEMsYUFBYSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO1FBQzVDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztRQUMzQyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUM7UUFDMUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDekMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM5RCxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFN0IsQ0FBQyxTQUFTLGtCQUFrQjtZQUMxQixPQUFNLENBQUMsaUNBQWlDO1lBQ3hDLElBQUksQ0FBQyxlQUFlO2dCQUFFLE9BQU87WUFDN0IsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRCxZQUFZLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNwRCxTQUFTLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFTCxPQUFPLGFBQWEsQ0FBQztJQUN2QixDQUFDO0lBRUQsU0FBUyxpQkFBaUIsQ0FBQyxJQVkxQjtRQUVDLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUVyQyxJQUFJLElBQUksQ0FBQyxJQUFJO1lBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRXBDLElBQUksSUFBSSxDQUFDLFNBQVM7WUFBRSxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFbkQsSUFBSSxJQUFJLENBQUMsUUFBUTtZQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwRCxJQUFJLElBQUksQ0FBQyxFQUFFO1lBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBRTlCLElBQUksSUFBSSxDQUFDLElBQUk7WUFBRSxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbEQsWUFBWTtRQUNaLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsUUFBUTtZQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUVwRCxZQUFZO1FBQ1osSUFBSSxJQUFJLENBQUMsSUFBSTtZQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUVwQyxJQUFJLElBQUksQ0FBQyxlQUFlO1lBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUUzRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLENBQUMsQ0FBQyxjQUFjLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELElBQUksSUFBSSxDQUFDLGFBQWE7WUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU1RCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxXQUFXLENBQUMsSUFBWTtJQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUFFLE9BQU87SUFDMUIsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQWdCLENBQUM7SUFDaEUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNDLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQy9CLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsMEJBQTBCLENBQ2pDLGFBQTBCLEVBQzFCLEdBQVksRUFDWixLQUFjO0lBRWQsSUFBSSxLQUFhLENBQUM7SUFDbEIsS0FBSyxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQ3RDLElBQUksR0FBRyxJQUFJLEtBQUssR0FBRyxHQUFHO1FBQUUsS0FBSyxHQUFHLEdBQUcsQ0FBQztTQUMvQixJQUFJLEtBQUs7UUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQVMsc0NBQXNDLENBQUMsSUFLL0M7SUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07UUFBRSxPQUFPO0lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztRQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0lBRW5ELE9BQU8sSUFBSSxDQUFDLE1BQU07U0FDZixHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNiLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTztRQUN6QyxPQUFPLFdBQVcsQ0FBQztZQUNqQixLQUFLLEVBQUUsS0FBSztZQUNaLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksZ0JBQWdCO1lBQ25JLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLGlCQUFpQixFQUFFLEtBQUs7U0FDekIsQ0FBQyxJQUFJLFNBQVMsQ0FBQztJQUNsQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxLQUFLLFVBQVUsd0JBQXdCLENBQ3JDLElBQWMsRUFDZCxRQUE0RCxFQUM1RCxlQUF1QjtJQUV2QixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWE7UUFBRSxRQUFRLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUNwRSxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsZUFBZSxDQUFDO0lBQ3pCLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDNUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQ2YsR0FBRyxDQUFDLFdBQVcsQ0FDYixTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNwRSxDQUNGLENBQUM7SUFDRixRQUFRLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRywwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxzQkFBc0I7SUFDN0IsSUFBSSxrQkFBa0IsQ0FBQztJQUN2QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNsRCxDQUFDLENBQUMsY0FBYyxDQUFDO1FBQ2pCLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUN2QixLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztJQUNILEVBQUU7SUFDRixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLFlBQVk7SUFDWixJQUFJLE1BQU0sR0FBRyxJQUFJLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDakUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDakMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELGNBQWM7SUFDZCxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQztBQUN4RSxDQUFDO0FBRUQsS0FBSyxVQUFVLHFCQUFxQjtJQUNsQyw0SEFBNEg7SUFDNUgsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUM7UUFDM0IsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRWpFLElBQUksS0FBaUMsRUFBRSxHQUFHLENBQUM7SUFFM0MsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQy9CLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQUUsT0FBTztRQUVwRCxLQUFLLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUUsSUFBSSxLQUFLO1lBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUNEOzs7R0FHRztBQUNILFNBQVMsVUFBVSxDQUFDLEtBQUs7SUFDdkIsSUFBSSxDQUFDLEtBQUs7UUFBRSxPQUFPLEVBQUUsQ0FBQztJQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMseUNBQXlDLENBQUMsT0FBZ0IsSUFBSTtJQUNyRSxJQUFJLFlBQVksQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztRQUFFLE9BQU87SUFFekQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FDdkIsWUFBWSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQ2xDLENBQUM7SUFFdEIsSUFBSSxZQUFZLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQW1CLENBQUM7SUFFMUUsSUFBSSxDQUFDLFlBQVk7UUFDZixPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhIQUE4SDtJQUU3TCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUM3QixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEtBQUssWUFBWSxDQUFDLEVBQUUsQ0FDbkQsQ0FBQyxDQUFDLGlMQUFpTDtJQUVwTCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUN0QixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQ2hCLDBGQUEwRixDQUMzRixDQUFDLENBQUMsZ0NBQWdDO0lBRXJDLElBQUksT0FBdUIsQ0FBQztJQUU1QixJQUFJLElBQUk7UUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHVFQUF1RTtJQUNqSSxJQUFJLENBQUMsSUFBSTtRQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHNFQUFzRTtJQUU5RyxTQUFTLGFBQWEsQ0FBQyxHQUFtQjtRQUN4QyxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsb0RBQW9EO1FBQzFHLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxrQkFBa0I7WUFDaEMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxrQkFBb0MsQ0FBQzthQUNoRCxJQUNILElBQUk7WUFDSixHQUFHLENBQUMsYUFBYTtZQUNqQixHQUFHLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDO1lBRWxELE9BQU8sR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLGtCQUFvQyxDQUFDO2FBQzlELElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLHNCQUFzQjtZQUMxQyxPQUFPLEdBQUcsR0FBRyxDQUFDLHNCQUF3QyxDQUFDO2FBQ3BELElBQ0gsQ0FBQyxJQUFJO1lBQ0wsR0FBRyxDQUFDLGFBQWE7WUFDakIsR0FBRyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQztZQUVsRCxPQUFPLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxzQkFBd0MsQ0FBQzs7WUFDbEUsT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLDZIQUE2SDtRQUV2SixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUNELElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUNyQixlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyx5Q0FBeUM7SUFDakUsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCO0lBRXpFLFNBQVMsT0FBTyxDQUFDLEdBQW1CLEVBQUUsb0JBQTRCO1FBQ2hFLElBQ0UsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVM7WUFDdEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEtBQUssb0JBQW9CO1lBRTlDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUywwQkFBMEIsQ0FDakMsT0FBaUIsRUFDakIsU0FBaUIsRUFDakIsU0FBaUI7SUFFakIsSUFBSSxZQUFZLENBQUMsV0FBVyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFBRSxPQUFPO0lBQ3pELElBQUksQ0FBQyxTQUFTO1FBQ1osT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQW9CLEVBQUUsRUFBRSxDQUMzRCx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQzFDLENBQUM7QUFDTixDQUFDO0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxLQUFxQixFQUFFLFNBQWtCO0lBQ3hFLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztJQUNqQyxJQUFJLElBQVksQ0FBQztJQUNqQixJQUFJLEtBQUs7UUFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztTQUN4QixJQUFJLFNBQVMsS0FBSyxJQUFJO1FBQUUsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLFlBQVk7U0FDckQsSUFBSSxTQUFTLEtBQUssTUFBTTtRQUFFLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxnQkFBZ0I7SUFFbEUsSUFBSSxJQUFJLEtBQUssV0FBVyxJQUFJLElBQUksS0FBSyxVQUFVLElBQUksSUFBSSxLQUFLLFlBQVk7UUFDdEUseUNBQXlDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZO1NBQzFELElBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksS0FBSyxXQUFXO1FBQ3RFLHlDQUF5QyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdCO0FBQ3RFLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsbUJBQW1CLENBQzFCLElBQVksRUFDWixTQUFrQixLQUFLLEVBQ3ZCLFVBQWtCLEtBQUs7SUFFdkIsSUFBSSxNQUFNO1FBQUUsT0FBTyxPQUFPLEdBQUcsZUFBZSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7O1FBQ3RELE9BQU8sT0FBTyxHQUFHLGNBQWMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3JELENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsS0FBSyxVQUFVLHNCQUFzQixDQUFDLFNBQXdCO0lBQzVELElBQUksQ0FBQyxTQUFTO1FBQ1osU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQ3BCLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FDekIsQ0FBQztJQUNyQixJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUFFLE9BQU87SUFFbkMsSUFBSSxLQUFLLEdBQWE7UUFDcEIsTUFBTSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUM7UUFDbkMsTUFBTSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQztLQUMxQyxDQUFDO0lBRUYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3JCLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRTtZQUNuQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUFFLE9BQU87WUFDeEMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FDbEMsSUFBSSxFQUNKLDRCQUE0QixHQUFHLElBQUksR0FBRyxTQUFTLENBQ2hELENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLG9DQUFvQyxDQUMzQyxRQUEwQjtJQUUxQixJQUFJLEtBQUssR0FBZSxFQUFFLENBQUM7SUFDM0IsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1lBQ2pDLE9BQU8sS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDN0MsS0FBSyxDQUFDLElBQUksQ0FDUixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRTtZQUM5Qyx1TEFBdUw7WUFDdkwsQ0FBQyxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlLQUFpSztZQUN2TixPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUNGLElBQUksS0FBYSxDQUFDO1FBQ2xCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhO1lBQzNCLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO2FBQ3hCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZO1lBQy9CLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O1lBQ3hELEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBRXZCLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELGtFQUFrRTtBQUNsRSxTQUFTLGFBQWEsQ0FBQyxXQUF5QixFQUFFLFdBQXlCO0lBQ3pFLElBQUksS0FBaUIsRUFBRSxNQUFnQixDQUFDO0lBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzNDLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDM0MsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQixLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBQzdDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FDVCxvQkFBb0IsRUFDcEIsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUN6QixNQUFNLEVBQ04sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUN6QixNQUFNLENBQ1AsQ0FBQztpQkFDSDtTQUNKO1FBQ0QsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDeEU7YUFBTTtZQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDMUI7S0FDRjtJQUNELElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFO1FBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQ1QsdUJBQXVCLEVBQ3ZCLFdBQVcsQ0FBQyxNQUFNLEVBQ2xCLHdCQUF3QixFQUN4QixXQUFXLENBQUMsTUFBTSxDQUNuQixDQUFDO0tBQ0g7U0FBTTtRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQ1QsOENBQThDLEVBQzlDLFdBQVcsQ0FBQyxNQUFNLENBQ25CLENBQUM7S0FDSDtBQUNILENBQUM7QUFDRCxTQUFTLGdCQUFnQixDQUFDLEtBQW1CO0lBQzNDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNoQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDbEIsSUFDRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUN2QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckIsQ0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxFQUN2QjtnQkFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM1RDs7Z0JBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLFdBQVc7SUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUM7UUFBRSxNQUFNLFNBQVMsRUFBRSxDQUFDO0lBRWxFLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0lBRXBELElBQUksQ0FBQyxFQUFFO1FBQUUsT0FBTztJQUVoQixFQUFFO1FBQ0EsRUFBRTthQUNDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2FBQ3BCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDO2FBQ3JCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFL0IsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUUzQixJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUFFLE9BQU8sS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFFL0YsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFFcEIsV0FBVyxFQUFFLENBQUM7SUFFZCxTQUFTLFVBQVU7UUFDakIsT0FBTyxLQUFLO2FBQ1QsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7YUFDWixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNsQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBQUEsQ0FBQztJQUNGLFNBQVMsVUFBVSxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLENBQUM7WUFBRSxPQUFPO1FBQ2YsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO2NBQ3JCLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0lBRUQsS0FBSyxVQUFVLFNBQVM7UUFDdEIsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxHQUFHLENBQUMsRUFBRSxHQUFHLGdCQUFnQixDQUFDO1FBQzFCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDM0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUMxQixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7UUFDMUIsR0FBRyxDQUFDLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQztRQUN2QyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQUEsQ0FBQztBQUVKLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxpQkFBaUIsQ0FBQyxPQUFvQjtJQUM3QyxPQUFPLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUNsRCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLFFBQVEsQ0FBQyxPQUE4QixFQUFFLFNBQW1CO0lBQ25FLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUNyQixPQUFPLENBQ0wsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbkUsTUFBTSxHQUFHLENBQUMsQ0FDZCxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsT0FBb0I7SUFDakQsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUM7UUFDakUsT0FBTyxJQUFJLENBQUM7O1FBQ1QsT0FBTyxLQUFLLENBQUM7QUFDcEIsQ0FBQztBQUNEOzs7R0FHRztBQUNILFNBQVMsa0JBQWtCLENBQUMsT0FBaUM7SUFDM0QsT0FBTyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDeEQsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsK0JBQStCLENBQ3RDLFNBQXNCLEVBQ3RCLE9BQWdCLElBQUk7SUFFcEIsZ0RBQWdEO0lBRWhELEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQTRDLENBQUM7U0FDL0QsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMzQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFDRDs7OztHQUlHO0FBQ0gsU0FBUyxlQUFlLENBQUMsVUFBa0IsRUFBRSxJQUFhO0lBQ3hELElBQUksTUFBTSxHQUNSLEtBQUssQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDO1NBQ3hDLE1BQU0sQ0FBQyxDQUFDLEtBQWtCLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQyxDQUFDO0lBRXhFLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQUUsT0FBTztJQUU5QixNQUFNO1NBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDM0MsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDM0MsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbEMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsS0FBSyxVQUFVLHlCQUF5QjtJQUN0QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFCLE1BQU0scUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEM7SUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFDRDs7R0FFRztBQUNILEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxLQUFhO0lBQ2hELElBQUksR0FBZSxFQUFFLFNBQWlCLEVBQUUsV0FBbUIsQ0FBQztJQUM1RCxJQUFJLE9BQU8sR0FBRyw2Q0FBNkMsQ0FBQztJQUM1RCxXQUFXLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQy9CLElBQUksS0FBSyxHQUFHLEVBQUU7UUFBRSxXQUFXLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQztJQUVoRCxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ2pDLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0IsSUFBSSxHQUFHLEdBQUcsRUFBRTtZQUFFLFNBQVMsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUFDO1FBRTFDLEdBQUcsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDcEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLFdBQVcsQ0FBQyxDQUNwRCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUwsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxPQUFPO1FBRXJDLElBQUksZUFBZSxHQUFHO1lBQ3BCO2dCQUNFLEVBQUUsRUFBRSxDQUFDO2dCQUNMLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsQ0FBQztnQkFDTCxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLENBQUM7Z0JBQ0wsS0FBSyxFQUFFLHlDQUF5QztnQkFDaEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxDQUFDO2dCQUNMLEtBQUssRUFDSCx3RUFBd0U7Z0JBQzFFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsQ0FBQztnQkFDTCxLQUFLLEVBQ0gsc0ZBQXNGO2dCQUN4RixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLENBQUM7Z0JBQ0wsS0FBSyxFQUFFLHVDQUF1QztnQkFDOUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxDQUFDO2dCQUNMLEtBQUssRUFBRSxzQ0FBc0M7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsQ0FBQztnQkFDTCxLQUFLLEVBQ0gsK0VBQStFO2dCQUNqRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLENBQUM7Z0JBQ0wsS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSwyQkFBMkI7Z0JBQ2xDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQ0gsd0ZBQXdGO2dCQUMxRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLDhCQUE4QjtnQkFDckMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSwrQkFBK0I7Z0JBQ3RDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsc0NBQXNDO2dCQUM3QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFDSCxvRkFBb0Y7Z0JBQ3RGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQ0gsMkZBQTJGO2dCQUM3RixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUNILCtFQUErRTtnQkFDakYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsMEJBQTBCO2dCQUNqQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLDhCQUE4QjtnQkFDckMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLGlEQUFpRDtnQkFDeEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsaUNBQWlDO2dCQUN4QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLHVEQUF1RDtnQkFDOUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUNILGlGQUFpRjtnQkFDbkYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFDSCxnRkFBZ0Y7Z0JBQ2xGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsc0NBQXNDO2dCQUM3QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUNILGtFQUFrRTtnQkFDcEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxrQ0FBa0M7Z0JBQ3pDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSx5REFBeUQ7Z0JBQ2hFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsb0NBQW9DO2dCQUMzQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLGlDQUFpQztnQkFDeEMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsOEJBQThCO2dCQUNyQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLG1DQUFtQztnQkFDMUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSx1REFBdUQ7Z0JBQzlELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsaURBQWlEO2dCQUN4RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLHVEQUF1RDtnQkFDOUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxnQ0FBZ0M7Z0JBQ3ZDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQ0gsMkZBQTJGO2dCQUM3RixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsMERBQTBEO2dCQUNqRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLDJEQUEyRDtnQkFDbEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFDSCxvRUFBb0U7Z0JBQ3RFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLHFDQUFxQztnQkFDNUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSw4REFBOEQ7Z0JBQ3JFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsNkNBQTZDO2dCQUNwRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxrQ0FBa0M7Z0JBQ3pDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsbURBQW1EO2dCQUMxRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLG1EQUFtRDtnQkFDMUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQ0gsOEZBQThGO2dCQUNoRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLCtDQUErQztnQkFDdEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsa0NBQWtDO2dCQUN6QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUNILG1FQUFtRTtnQkFDckUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxtQ0FBbUM7Z0JBQzFDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsMERBQTBEO2dCQUNqRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUNILHdGQUF3RjtnQkFDMUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSwwREFBMEQ7Z0JBQ2pFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxpREFBaUQ7Z0JBQ3hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsaURBQWlEO2dCQUN4RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLHlDQUF5QztnQkFDaEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsMkNBQTJDO2dCQUNsRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLDhCQUE4QjtnQkFDckMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxtREFBbUQ7Z0JBQzFELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsNkNBQTZDO2dCQUNwRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUNILDJFQUEyRTtnQkFDN0UsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxvREFBb0Q7Z0JBQzNELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsMkNBQTJDO2dCQUNsRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFDSCw4RkFBOEY7Z0JBQ2hHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLGtEQUFrRDtnQkFDekQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFBRSxxQ0FBcUM7Z0JBQzVDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQ0gsbUdBQW1HO2dCQUNyRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLCtDQUErQztnQkFDdEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxFQUFFO2dCQUNOLEtBQUssRUFDSCxxR0FBcUc7Z0JBQ3ZHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsRUFBRTtnQkFDTixLQUFLLEVBQ0gsMkZBQTJGO2dCQUM3RixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLGlEQUFpRDtnQkFDeEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxxREFBcUQ7Z0JBQzVELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDREQUE0RDtnQkFDbkUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2QkFBNkI7Z0JBQ3BDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9DQUFvQztnQkFDM0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsaURBQWlEO2dCQUN4RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHdGQUF3RjtnQkFDMUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdEQUFnRDtnQkFDdkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrREFBK0Q7Z0JBQ3RFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsMEVBQTBFO2dCQUM1RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHVFQUF1RTtnQkFDekUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsaUdBQWlHO2dCQUNuRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG1FQUFtRTtnQkFDckUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMERBQTBEO2dCQUNqRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdEQUF3RDtnQkFDL0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyREFBMkQ7Z0JBQ2xFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkRBQTJEO2dCQUNsRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHdGQUF3RjtnQkFDMUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdEQUFnRDtnQkFDdkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpQ0FBaUM7Z0JBQ3hDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFEQUFxRDtnQkFDNUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0RBQXNEO2dCQUM3RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCx1RkFBdUY7Z0JBQ3pGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhEQUE4RDtnQkFDckUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0NBQWdDO2dCQUN2QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGtEQUFrRDtnQkFDekQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxxREFBcUQ7Z0JBQzVELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscURBQXFEO2dCQUM1RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4REFBOEQ7Z0JBQ3JFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG1GQUFtRjtnQkFDckYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsbUVBQW1FO2dCQUNyRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJEQUEyRDtnQkFDbEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscURBQXFEO2dCQUM1RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZEQUE2RDtnQkFDcEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDJGQUEyRjtnQkFDN0YsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzQ0FBc0M7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkNBQTZDO2dCQUNwRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJDQUEyQztnQkFDbEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0Q0FBNEM7Z0JBQ25ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMENBQTBDO2dCQUNqRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzQ0FBc0M7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gscVFBQXFRO2dCQUN2USxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLCtDQUErQztnQkFDdEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsd0ZBQXdGO2dCQUMxRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVDQUF1QztnQkFDOUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdEQUFnRDtnQkFDdkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrQ0FBa0M7Z0JBQ3pDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsNEVBQTRFO2dCQUM5RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG1FQUFtRTtnQkFDckUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5REFBeUQ7Z0JBQ2hFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHlGQUF5RjtnQkFDM0YsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxtREFBbUQ7Z0JBQzFELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsNkdBQTZHO2dCQUMvRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG9FQUFvRTtnQkFDdEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwREFBMEQ7Z0JBQ2pFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFEQUFxRDtnQkFDNUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5REFBeUQ7Z0JBQ2hFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG1EQUFtRDtnQkFDMUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzREFBc0Q7Z0JBQzdELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0RBQXNEO2dCQUM3RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9EQUFvRDtnQkFDM0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdEQUFnRDtnQkFDdkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCwrRUFBK0U7Z0JBQ2pGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsOEZBQThGO2dCQUNoRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9EQUFvRDtnQkFDM0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGlEQUFpRDtnQkFDeEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvREFBb0Q7Z0JBQzNELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNERBQTREO2dCQUNuRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGlGQUFpRjtnQkFDbkYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCwyRkFBMkY7Z0JBQzdGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsaURBQWlEO2dCQUN4RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGlFQUFpRTtnQkFDbkUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnRUFBZ0U7Z0JBQ3ZFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrREFBK0Q7Z0JBQ3RFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVEQUF1RDtnQkFDOUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCx3RUFBd0U7Z0JBQzFFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkRBQTZEO2dCQUNwRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRCQUE0QjtnQkFDbkMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0Q0FBNEM7Z0JBQ25ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHdGQUF3RjtnQkFDMUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsdURBQXVEO2dCQUM5RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvREFBb0Q7Z0JBQzNELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLCtEQUErRDtnQkFDdEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCwrRUFBK0U7Z0JBQ2pGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0NBQW9DO2dCQUMzQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJDQUEyQztnQkFDbEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0Q0FBNEM7Z0JBQ25ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0RBQXNEO2dCQUM3RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsa0VBQWtFO2dCQUNwRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0NBQXNDO2dCQUM3QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCx1RUFBdUU7Z0JBQ3pFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkNBQTJDO2dCQUNsRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHFGQUFxRjtnQkFDdkYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQkFBK0I7Z0JBQ3RDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbURBQW1EO2dCQUMxRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtFQUFrRTtnQkFDcEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxzRkFBc0Y7Z0JBQ3hGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMENBQTBDO2dCQUNqRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdEQUFnRDtnQkFDdkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzQ0FBc0M7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGtEQUFrRDtnQkFDekQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnRUFBZ0U7Z0JBQ3ZFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsd0VBQXdFO2dCQUMxRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVDQUF1QztnQkFDOUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyREFBMkQ7Z0JBQ2xFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHNJQUFzSTtnQkFDeEksSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5REFBeUQ7Z0JBQ2hFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkNBQTZDO2dCQUNwRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDBGQUEwRjtnQkFDNUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2REFBNkQ7Z0JBQ3BFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOEJBQThCO2dCQUNyQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBEQUEwRDtnQkFDakUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwREFBMEQ7Z0JBQ2pFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0RBQW9EO2dCQUMzRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4Q0FBOEM7Z0JBQ3JELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsdUZBQXVGO2dCQUN6RixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG1DQUFtQztnQkFDMUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsaUhBQWlIO2dCQUNuSCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0NBQW9DO2dCQUMzQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFEQUFxRDtnQkFDNUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrREFBa0Q7Z0JBQ3pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0NBQW9DO2dCQUMzQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVEQUF1RDtnQkFDOUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4QkFBOEI7Z0JBQ3JDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkJBQTZCO2dCQUNwQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4QkFBOEI7Z0JBQ3JDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0NBQW9DO2dCQUMzQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9EQUFvRDtnQkFDM0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCw2RUFBNkU7Z0JBQy9FLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG1DQUFtQztnQkFDMUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnQ0FBZ0M7Z0JBQ3ZDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0NBQXNDO2dCQUM3QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJDQUEyQztnQkFDbEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxtQ0FBbUM7Z0JBQzFDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsNkZBQTZGO2dCQUMvRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHdGQUF3RjtnQkFDMUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0QkFBNEI7Z0JBQ25DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsaURBQWlEO2dCQUN4RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVDQUF1QztnQkFDOUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCwyRUFBMkU7Z0JBQzdFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsZ0ZBQWdGO2dCQUNsRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHlGQUF5RjtnQkFDM0YsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxtRUFBbUU7Z0JBQ3JFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsdUZBQXVGO2dCQUN6RixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDBGQUEwRjtnQkFDNUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCwwRkFBMEY7Z0JBQzVGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdEQUFnRDtnQkFDdkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnQ0FBZ0M7Z0JBQ3ZDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHlEQUF5RDtnQkFDaEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gseUZBQXlGO2dCQUMzRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDRGQUE0RjtnQkFDOUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0JBQStCO2dCQUN0QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGtDQUFrQztnQkFDekMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHlGQUF5RjtnQkFDM0YsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOEJBQThCO2dCQUNyQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9DQUFvQztnQkFDM0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCwwRkFBMEY7Z0JBQzVGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0RBQW9EO2dCQUMzRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNEQUFzRDtnQkFDN0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVEQUF1RDtnQkFDOUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4REFBOEQ7Z0JBQ3JFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbURBQW1EO2dCQUMxRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnQ0FBZ0M7Z0JBQ3ZDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkRBQTZEO2dCQUNwRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGtEQUFrRDtnQkFDekQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrREFBa0Q7Z0JBQ3pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0RBQStEO2dCQUN0RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHVFQUF1RTtnQkFDekUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxvR0FBb0c7Z0JBQ3RHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFDQUFxQztnQkFDNUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsaUNBQWlDO2dCQUN4QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNEQUFzRDtnQkFDN0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQkFBK0I7Z0JBQ3RDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0NBQWtDO2dCQUN6QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxtREFBbUQ7Z0JBQzFELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHlFQUF5RTtnQkFDM0UsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzQ0FBc0M7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGtEQUFrRDtnQkFDekQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnQ0FBZ0M7Z0JBQ3ZDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDJFQUEyRTtnQkFDN0UsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCx3RkFBd0Y7Z0JBQzFGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtFQUFrRTtnQkFDcEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsa0VBQWtFO2dCQUNwRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNEQUFzRDtnQkFDN0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrREFBa0Q7Z0JBQ3pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHlDQUF5QztnQkFDaEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvREFBb0Q7Z0JBQzNELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOERBQThEO2dCQUNyRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDZFQUE2RTtnQkFDL0UsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzREFBc0Q7Z0JBQzdELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsc0ZBQXNGO2dCQUN4RixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrREFBa0Q7Z0JBQ3pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOERBQThEO2dCQUNyRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHlGQUF5RjtnQkFDM0YsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpQ0FBaUM7Z0JBQ3hDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gscUdBQXFHO2dCQUN2RyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG9HQUFvRztnQkFDdEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0Q0FBNEM7Z0JBQ25ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0NBQW9DO2dCQUMzQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdEQUFnRDtnQkFDdkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0NBQWdDO2dCQUN2QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGtDQUFrQztnQkFDekMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbURBQW1EO2dCQUMxRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxxR0FBcUc7Z0JBQ3ZHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLCtDQUErQztnQkFDdEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gseUVBQXlFO2dCQUMzRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHFHQUFxRztnQkFDdkcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsa0ZBQWtGO2dCQUNwRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHlDQUF5QztnQkFDaEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrREFBK0Q7Z0JBQ3RFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkNBQTJDO2dCQUNsRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHFFQUFxRTtnQkFDdkUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0REFBNEQ7Z0JBQ25FLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsbUdBQW1HO2dCQUNyRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVEQUF1RDtnQkFDOUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdEQUF3RDtnQkFDL0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0RBQStEO2dCQUN0RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGdHQUFnRztnQkFDbEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxxRUFBcUU7Z0JBQ3ZFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbURBQW1EO2dCQUMxRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZEQUE2RDtnQkFDcEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxpR0FBaUc7Z0JBQ25HLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMENBQTBDO2dCQUNqRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDhGQUE4RjtnQkFDaEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrREFBK0Q7Z0JBQ3RFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG1FQUFtRTtnQkFDckUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0REFBNEQ7Z0JBQ25FLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsdUVBQXVFO2dCQUN6RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJDQUEyQztnQkFDbEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0Q0FBNEM7Z0JBQ25ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHNFQUFzRTtnQkFDeEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxvRkFBb0Y7Z0JBQ3RGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG1EQUFtRDtnQkFDMUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4REFBOEQ7Z0JBQ3JFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJDQUEyQztnQkFDbEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxvR0FBb0c7Z0JBQ3RHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpREFBaUQ7Z0JBQ3hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJEQUEyRDtnQkFDbEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gseUZBQXlGO2dCQUMzRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9DQUFvQztnQkFDM0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0Q0FBNEM7Z0JBQ25ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMENBQTBDO2dCQUNqRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGlHQUFpRztnQkFDbkcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsOEdBQThHO2dCQUNoSCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFDQUFxQztnQkFDNUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxtREFBbUQ7Z0JBQzFELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHdGQUF3RjtnQkFDMUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4Q0FBOEM7Z0JBQ3JELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0NBQXNDO2dCQUM3QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtGQUFrRjtnQkFDcEYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzQ0FBc0M7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0RBQStEO2dCQUN0RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsaUdBQWlHO2dCQUNuRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkNBQTZDO2dCQUNwRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDBGQUEwRjtnQkFDNUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCw4RUFBOEU7Z0JBQ2hGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMERBQTBEO2dCQUNqRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDRGQUE0RjtnQkFDOUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxrR0FBa0c7Z0JBQ3BHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzREFBc0Q7Z0JBQzdELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsNEVBQTRFO2dCQUM5RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNEQUFzRDtnQkFDN0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnRUFBZ0U7Z0JBQ3ZFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkRBQTJEO2dCQUNsRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtHQUFrRztnQkFDcEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrREFBa0Q7Z0JBQ3pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNERBQTREO2dCQUNuRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDRGQUE0RjtnQkFDOUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpREFBaUQ7Z0JBQ3hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkNBQTZDO2dCQUNwRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFDQUFxQztnQkFDNUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLCtEQUErRDtnQkFDdEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxtR0FBbUc7Z0JBQ3JHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0RBQW9EO2dCQUMzRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHlEQUF5RDtnQkFDaEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCx5RkFBeUY7Z0JBQzNGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkNBQTJDO2dCQUNsRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGdHQUFnRztnQkFDbEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0REFBNEQ7Z0JBQ25FLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkRBQTZEO2dCQUNwRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFDQUFxQztnQkFDNUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsZ0dBQWdHO2dCQUNsRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJEQUEyRDtnQkFDbEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnQ0FBZ0M7Z0JBQ3ZDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsaURBQWlEO2dCQUN4RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdEQUFnRDtnQkFDdkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsbUVBQW1FO2dCQUNyRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVDQUF1QztnQkFDOUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQkFBK0I7Z0JBQ3RDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0RBQW9EO2dCQUMzRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFDQUFxQztnQkFDNUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxrR0FBa0c7Z0JBQ3BHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsbUdBQW1HO2dCQUNyRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCwrRkFBK0Y7Z0JBQ2pHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0JBQStCO2dCQUN0QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHlDQUF5QztnQkFDaEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscURBQXFEO2dCQUM1RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBEQUEwRDtnQkFDakUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrQ0FBa0M7Z0JBQ3pDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJEQUEyRDtnQkFDbEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0REFBNEQ7Z0JBQ25FLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGlHQUFpRztnQkFDbkcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvREFBb0Q7Z0JBQzNELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsaUZBQWlGO2dCQUNuRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9DQUFvQztnQkFDM0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHlEQUF5RDtnQkFDaEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4Q0FBOEM7Z0JBQ3JELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHdHQUF3RztnQkFDMUcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxtQ0FBbUM7Z0JBQzFDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMENBQTBDO2dCQUNqRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHdGQUF3RjtnQkFDMUYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbURBQW1EO2dCQUMxRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxrR0FBa0c7Z0JBQ3BHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsMEVBQTBFO2dCQUM1RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFEQUFxRDtnQkFDNUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxrRkFBa0Y7Z0JBQ3BGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0NBQW9DO2dCQUMzQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBEQUEwRDtnQkFDakUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxvRUFBb0U7Z0JBQ3RFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseURBQXlEO2dCQUNoRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDhGQUE4RjtnQkFDaEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrREFBa0Q7Z0JBQ3pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsdUZBQXVGO2dCQUN6RixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9EQUFvRDtnQkFDM0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsZ0dBQWdHO2dCQUNsRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtHQUFrRztnQkFDcEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxrR0FBa0c7Z0JBQ3BHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9EQUFvRDtnQkFDM0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2REFBNkQ7Z0JBQ3BFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsaUdBQWlHO2dCQUNuRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxtRUFBbUU7Z0JBQ3JFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtHQUFrRztnQkFDcEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMENBQTBDO2dCQUNqRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZEQUE2RDtnQkFDcEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2Q0FBNkM7Z0JBQ3BELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDBFQUEwRTtnQkFDNUUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNEJBQTRCO2dCQUNuQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHVFQUF1RTtnQkFDekUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxpR0FBaUc7Z0JBQ25HLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsOEZBQThGO2dCQUNoRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILCtGQUErRjtnQkFDakcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4QkFBOEI7Z0JBQ3JDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLCtDQUErQztnQkFDdEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0Q0FBNEM7Z0JBQ25ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtHQUFrRztnQkFDcEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpREFBaUQ7Z0JBQ3hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9EQUFvRDtnQkFDM0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzQ0FBc0M7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsb0dBQW9HO2dCQUN0RyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGdHQUFnRztnQkFDbEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxtSkFBbUo7Z0JBQ3JKLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscURBQXFEO2dCQUM1RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDZFQUE2RTtnQkFDL0UsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4Q0FBOEM7Z0JBQ3JELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCx1R0FBdUc7Z0JBQ3pHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMENBQTBDO2dCQUNqRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxtREFBbUQ7Z0JBQzFELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkNBQTJDO2dCQUNsRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDREQUE0RDtnQkFDbkUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOERBQThEO2dCQUNyRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZEQUE2RDtnQkFDcEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxxQ0FBcUM7Z0JBQzVDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0RBQStEO2dCQUN0RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLCtEQUErRDtnQkFDdEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrREFBa0Q7Z0JBQ3pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkJBQTZCO2dCQUNwQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdEQUFnRDtnQkFDdkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkNBQTZDO2dCQUNwRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG9FQUFvRTtnQkFDdEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5REFBeUQ7Z0JBQ2hFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkRBQTJEO2dCQUNsRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9DQUFvQztnQkFDM0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0NBQXNDO2dCQUM3QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkRBQTJEO2dCQUNsRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrREFBa0Q7Z0JBQ3pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZCQUE2QjtnQkFDcEMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwREFBMEQ7Z0JBQ2pFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNEQUFzRDtnQkFDN0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxxREFBcUQ7Z0JBQzVELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVEQUF1RDtnQkFDOUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCx5RkFBeUY7Z0JBQzNGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0RBQW9EO2dCQUMzRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJEQUEyRDtnQkFDbEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzQ0FBc0M7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGdHQUFnRztnQkFDbEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLCtDQUErQztnQkFDdEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4Q0FBOEM7Z0JBQ3JELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseURBQXlEO2dCQUNoRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILHNHQUFzRztnQkFDeEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseURBQXlEO2dCQUNoRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxtQ0FBbUM7Z0JBQzFDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9EQUFvRDtnQkFDM0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQkFBK0I7Z0JBQ3RDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gseUZBQXlGO2dCQUMzRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnQ0FBZ0M7Z0JBQ3ZDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGtEQUFrRDtnQkFDekQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsdURBQXVEO2dCQUM5RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG1HQUFtRztnQkFDckcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzQ0FBc0M7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0RBQXNEO2dCQUM3RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFDQUFxQztnQkFDNUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzREFBc0Q7Z0JBQzdELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVEQUF1RDtnQkFDOUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4Q0FBOEM7Z0JBQ3JELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0VBQWdFO2dCQUN2RSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhCQUE4QjtnQkFDckMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCx5RkFBeUY7Z0JBQzNGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0NBQW9DO2dCQUMzQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG1GQUFtRjtnQkFDckYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0NBQWtDO2dCQUN6QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGdGQUFnRjtnQkFDbEYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxnR0FBZ0c7Z0JBQ2xHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0REFBNEQ7Z0JBQ25FLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsMkdBQTJHO2dCQUM3RyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdEQUF3RDtnQkFDL0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnQ0FBZ0M7Z0JBQ3ZDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCx1RUFBdUU7Z0JBQ3pFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsOEZBQThGO2dCQUNoRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGlFQUFpRTtnQkFDbkUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGlGQUFpRjtnQkFDbkYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxzRkFBc0Y7Z0JBQ3hGLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsbUZBQW1GO2dCQUNyRixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhEQUE4RDtnQkFDckUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhDQUE4QztnQkFDckQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxpR0FBaUc7Z0JBQ25HLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkRBQTJEO2dCQUNsRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHlDQUF5QztnQkFDaEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILCtGQUErRjtnQkFDakcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwREFBMEQ7Z0JBQ2pFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNERBQTREO2dCQUNuRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpREFBaUQ7Z0JBQ3hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGdHQUFnRztnQkFDbEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGlEQUFpRDtnQkFDeEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw2REFBNkQ7Z0JBQ3BFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsOEZBQThGO2dCQUNoRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpREFBaUQ7Z0JBQ3hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0NBQXNDO2dCQUM3QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLCtEQUErRDtnQkFDdEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxxREFBcUQ7Z0JBQzVELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBEQUEwRDtnQkFDakUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9DQUFvQztnQkFDM0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpQ0FBaUM7Z0JBQ3hDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkNBQTJDO2dCQUNsRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHFDQUFxQztnQkFDNUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvREFBb0Q7Z0JBQzNELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsb0ZBQW9GO2dCQUN0RixJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBEQUEwRDtnQkFDakUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3REFBd0Q7Z0JBQy9ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsaURBQWlEO2dCQUN4RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNEQUFzRDtnQkFDN0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0REFBNEQ7Z0JBQ25FLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNENBQTRDO2dCQUNuRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG1EQUFtRDtnQkFDMUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsZ0dBQWdHO2dCQUNsRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJDQUEyQztnQkFDbEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpREFBaUQ7Z0JBQ3hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGlEQUFpRDtnQkFDeEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxpRUFBaUU7Z0JBQ25FLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG1DQUFtQztnQkFDMUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxnREFBZ0Q7Z0JBQ3ZELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGlGQUFpRjtnQkFDbkYsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILDZGQUE2RjtnQkFDL0YsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0NBQXNDO2dCQUM3QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNDQUFzQztnQkFDN0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxxREFBcUQ7Z0JBQzVELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxrQ0FBa0M7Z0JBQ3pDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtHQUFrRztnQkFDcEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpREFBaUQ7Z0JBQ3hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0NBQWdDO2dCQUN2QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGtDQUFrQztnQkFDekMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkNBQTJDO2dCQUNsRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9DQUFvQztnQkFDM0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0Q0FBNEM7Z0JBQ25ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0JBQStCO2dCQUN0QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZEQUE2RDtnQkFDcEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxrR0FBa0c7Z0JBQ3BHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsaUNBQWlDO2dCQUN4QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNEQUFzRDtnQkFDN0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkRBQTJEO2dCQUNsRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGlEQUFpRDtnQkFDeEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsbURBQW1EO2dCQUMxRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHVDQUF1QztnQkFDOUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxxR0FBcUc7Z0JBQ3ZHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0JBQStCO2dCQUN0QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZEQUE2RDtnQkFDcEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxpRkFBaUY7Z0JBQ25GLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0NBQWtDO2dCQUN6QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG9EQUFvRDtnQkFDM0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxxQ0FBcUM7Z0JBQzVDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMENBQTBDO2dCQUNqRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNDQUFzQztnQkFDN0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCxxRUFBcUU7Z0JBQ3ZFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsaUVBQWlFO2dCQUNuRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtHQUFrRztnQkFDcEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpREFBaUQ7Z0JBQ3hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkRBQTJEO2dCQUNsRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxpQ0FBaUM7Z0JBQ3hDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsK0JBQStCO2dCQUN0QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw4Q0FBOEM7Z0JBQ3JELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsc0RBQXNEO2dCQUM3RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDZCQUE2QjtnQkFDcEMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFDSCw4RkFBOEY7Z0JBQ2hHLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsd0NBQXdDO2dCQUMvQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILG9HQUFvRztnQkFDdEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyREFBMkQ7Z0JBQ2xFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsa0dBQWtHO2dCQUNwRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHdDQUF3QztnQkFDL0MsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxxREFBcUQ7Z0JBQzVELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsb0NBQW9DO2dCQUMzQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdFQUFnRTtnQkFDdkUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0RBQWtEO2dCQUN6RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGdDQUFnQztnQkFDdkMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0QkFBNEI7Z0JBQ25DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0NBQWtDO2dCQUN6QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHNEQUFzRDtnQkFDN0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDJDQUEyQztnQkFDbEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsd0dBQXdHO2dCQUMxRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG1EQUFtRDtnQkFDMUQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyREFBMkQ7Z0JBQ2xFLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsZ0RBQWdEO2dCQUN2RCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLHlDQUF5QztnQkFDaEQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSx1REFBdUQ7Z0JBQzlELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkRBQTJEO2dCQUNsRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLGtEQUFrRDtnQkFDekQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxzREFBc0Q7Z0JBQzdELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsNkJBQTZCO2dCQUNwQyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDhCQUE4QjtnQkFDckMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsa0NBQWtDO2dCQUN6QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSw0Q0FBNEM7Z0JBQ25ELElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQ0gsa0dBQWtHO2dCQUNwRyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUFFLG1DQUFtQztnQkFDMUMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSwyQkFBMkI7Z0JBQ2xDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7Z0JBQ1AsS0FBSyxFQUNILGtHQUFrRztnQkFDcEcsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFFLENBQUM7Z0JBQ04sS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2dCQUNQLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkRBQTJEO2dCQUNsRSxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixHQUFHLEVBQUUsQ0FBQztnQkFDTixLQUFLLEVBQUUsRUFBRTthQUNWO1NBQ0YsQ0FBQztRQUVGLGVBQWU7YUFDWixNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDO2FBQ3ZELE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2YsSUFBSSxRQUFRLEdBQUcsZUFBZSxDQUM1QixPQUFPO2dCQUNQLHdCQUF3QjtnQkFDeEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2QsdUJBQXVCLENBQ3hCLENBQUM7WUFDRixJQUFJLENBQUMsUUFBUTtnQkFBRSxPQUFPO1lBRXRCLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUFFLE9BQU87WUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7S0FDTjtJQUVELFNBQVMsZUFBZSxDQUFDLE1BQWM7UUFDckMsSUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU1QixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7UUFFN0MsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7WUFDcEIsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtnQkFDMUIsSUFBSSxXQUFXLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQyxlQUFlLENBQy9DLE9BQU8sQ0FBQyxRQUFRLEVBQ2hCLFdBQVcsQ0FDWixDQUFDO2dCQUNGLElBQUksQ0FBQyxXQUFXO29CQUFFLE9BQU87Z0JBQ3pCLE9BQU8sV0FBVyxDQUFDO2FBQ3BCO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN4RCxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUM7YUFDM0I7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLHFCQUFxQixDQUFDLE1BQWdCO0lBQ25ELElBQUksQ0FBQyxNQUFNO1FBQUUsTUFBTSxHQUFHLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUVoRSxJQUFJLEtBQWlCLEVBQ25CLFVBQVUsR0FDUiw4RUFBOEUsRUFDaEYsYUFBMEIsRUFDMUIsSUFBWSxDQUFDO0lBRWYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDN0IsSUFBSSxLQUFLLEdBQUcsWUFBWTthQUNyQixPQUFPLENBQ04sWUFBWSxDQUFDLE1BQU0sQ0FDakIsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLEtBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDbEUsQ0FBQyxDQUFDLENBQUMsQ0FDTDthQUNBLFFBQVEsRUFBRSxDQUFDO1FBQ2QsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUFFLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDO1FBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlCLE1BQU0sWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssVUFBVSxZQUFZLENBQUMsVUFBa0IsRUFBRSxLQUFLO1FBQ25ELElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRS9ELElBQUksR0FBRyxHQUFHLFVBQVUsR0FBRyxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsMEpBQTBKO1FBQ3ZNLElBQUksUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sTUFBTSxlQUFlLENBQzFCLElBQUksU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDdEQsS0FBSyxFQUNMLFVBQVUsRUFDVixHQUFHLENBQ0osQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLFVBQVUsZUFBZSxDQUM1QixXQUFxQixFQUNyQixLQUFhLEVBQ2IsVUFBa0IsRUFDbEIsR0FBVztRQUVYLElBQUksQ0FBQyxXQUFXO1lBQ2QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2pFLElBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRSxJQUFJLE1BQU0sR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsR0FBVyxDQUFDLENBQUM7UUFFbEIsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDaEIsTUFBTSxDQUFDLENBQUMsSUFBdUIsRUFBRSxFQUFFLENBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUNoQix3REFBd0Q7WUFDeEQsVUFBVTtZQUNWLEdBQUcsQ0FDSixDQUNGO2FBQ0EsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUN0QixJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFBRSxPQUFPO1lBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLElBQUksUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsUUFBUTtnQkFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEUsSUFBSSxXQUFXLEdBQUcsTUFBTSxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVELElBQUksV0FBVztnQkFBRSxZQUFZLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQztRQUMzRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLFVBQVUsUUFBUSxDQUFDLEdBQVc7UUFDakMsSUFBSSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEMsT0FBTyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBQ0QsS0FBSyxVQUFVLGFBQWEsQ0FDMUIsUUFBZ0IsRUFDaEIsQ0FBUyxFQUNULEtBQWE7UUFFYixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEQsS0FBSyxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUN0RCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUNwQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FDMUIsSUFBSSxTQUFTLEVBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUN2RCxDQUFXLENBQUM7O1lBRWIsT0FBTyxNQUFNLE9BQU8sQ0FDbEIsSUFBSSxTQUFTLEVBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUN2RCxDQUFDO0lBQ04sQ0FBQztJQUVELEtBQUssVUFBVSxPQUFPLENBQUMsV0FBcUI7UUFDMUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM5RCxJQUNFLENBQUMsYUFBYTtZQUNkLENBQUMsYUFBYSxDQUFDLFFBQVE7WUFDdkIsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUVuQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDM0QsT0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDO0lBQ2pDLENBQUM7QUFDSCxDQUFDO0FBQ0Q7Ozs7O0dBS0c7QUFDSCxTQUFTLGVBQWUsQ0FDdEIsTUFBYyxFQUNkLFNBQWlCLEtBQUs7SUFFdEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztJQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUU3QixJQUFJO1FBQ0YsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2hCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0lBQ0QsT0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFLLElBQUksRUFBRTtRQUMxQixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO1lBQzFCLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztTQUN2RTthQUFNO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEQsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDO1NBQzNCO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLElBSXJCO0lBQ0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQWlCLENBQUM7SUFDakQsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLGNBQWMsQ0FDWix5QkFBeUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUNoRCxJQUFJLENBQUMsU0FBUyxDQUNmLENBQUM7SUFFRixTQUFTLFVBQVUsQ0FDakIsS0FBbUIsRUFDbkIsTUFBZ0IsRUFDaEIsTUFBaUI7UUFFakIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3BCLElBQUksTUFBTTtnQkFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsU0FBUyxRQUFRLENBQUMsR0FBZSxFQUFFLE1BQWdCLEVBQUUsUUFBZ0I7UUFDbkUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNuRCxDQUFDO0FBQ0gsQ0FBQztBQUNELFNBQVMsaUJBQWlCLENBQUMsR0FBZSxFQUFFLEdBQWEsRUFBRSxRQUFnQjtJQUN6RSxTQUFTO0lBQ1QsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPO0lBQ25DLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxLQUFLLFFBQVE7UUFDbkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUN6RCxJQUFJLFFBQVEsS0FBSyxRQUFRO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDN0UsQ0FBQztBQUVELFNBQVMsd0JBQXdCO0lBQy9CLG9CQUFvQjtJQUNwQixJQUFJLElBQUksR0FBVyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDeEMsSUFBSSxDQUFDLElBQUk7UUFBRSxPQUFPO0lBQ2xCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQzlCLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUM1QyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDeEM7SUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFjO1FBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3BFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLEtBQUssQ0FBQyxJQUFJLENBQ1IsR0FBRztnQkFDSCxNQUFNLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDbkQsR0FBRztnQkFDSCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QixNQUFNLENBQ1AsQ0FBQztTQUNIO0lBQ0gsQ0FBQztJQUNELElBQUksR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQixZQUFZLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUMzQixDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxZQUEwQjtJQUNuRCxJQUFJLElBQVksRUFDZCxNQUFnQixFQUNoQixPQUFPLEdBQWtCLElBQUksR0FBRyxFQUFFLENBQUM7SUFFckMsWUFBWTtTQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQUUsT0FBTztRQUM3QixJQUFJLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTztRQUVsQixNQUFNO1lBQ0osWUFBWTtpQkFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDO2lCQUNuRCxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLE9BQU87UUFHOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2VBQ25CLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2hFO1lBQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ3BCO1FBQUEsQ0FBQztJQUVKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFFakMsU0FBUyxZQUFZLENBQUMsSUFBWTtRQUNoQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ2pDLENBQUM7QUFFSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxLQUFLLFVBQVUsdUJBQXVCO0lBQ3BDLElBQUksRUFBRSxHQUFXLHlmQUF5ZixDQUFDO0lBQzNnQixJQUFJLFFBQVEsR0FBRztRQUNiLE1BQU0sQ0FBQyxZQUFZO1FBQ25CLE1BQU0sQ0FBQyxVQUFVO1FBQ2pCLE1BQU0sQ0FBQyxVQUFVO1FBQ2pCLE1BQU0sQ0FBQyxXQUFXO1FBQ2xCLE1BQU0sQ0FBQyxhQUFhO1FBQ3BCLE1BQU0sQ0FBQyxVQUFVO1FBQ2pCLE1BQU0sQ0FBQyxNQUFNO1FBQ2IsTUFBTSxDQUFDLGNBQWM7UUFDckIsTUFBTSxDQUFDLE1BQU07UUFDYixNQUFNLENBQUMsVUFBVTtLQUFDLENBQUM7SUFFckIsSUFBSSxTQUFtQixFQUFFLEtBQW1CLEVBQUUsSUFBZ0MsRUFBRSxRQUFzQixFQUFFLEtBQWEsQ0FBQztJQUN0SCxJQUFJLEtBQW1CLENBQUMsQ0FBQSxpRUFBaUU7SUFFekYsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUN4QixJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDO1FBQzVELFNBQVMsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSw4QkFBOEI7UUFFaEUsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2xCLEtBQUssR0FBRyxFQUFFLENBQUM7UUFFWCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELENBQUMsQ0FBQyxDQUFDLENBQUEsaU5BQWlOO1FBRXBOLFFBQVEsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQSw2QkFBNkI7UUFFL0QsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN2QixLQUFLO2lCQUNGLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsV0FBVyxDQUFDO2lCQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7b0JBQzVCLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQztvQkFDWCxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXhCLENBQUMsQ0FBQyxDQUFBO0FBRUosQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLGVBQWU7SUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQywrQ0FBK0MsQ0FBQztRQUFFLE9BQU87SUFDdEUsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLFVBQVUsRUFBRSxDQUFDO0lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUNyRCxrQkFBa0IsRUFBRSxDQUFDO0lBRXJCLEtBQUssVUFBVSxVQUFVO1FBQ3ZCLElBQUksU0FBUyxHQUFHLGdCQUFnQixDQUFBO1FBQ2hDLElBQUksS0FBSyxHQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxJQUFJLFFBQW9CLENBQUM7UUFDekIsSUFBSSxNQUFnQixDQUFDO1FBQ3JCLElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4QyxJQUFJLEtBQWUsRUFBRSxTQUFpQixFQUFFLFFBQWdCLENBQUM7UUFDekQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNwQixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUEsc0JBQXNCO1lBQ3hDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6QyxRQUFRLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUEsMkRBQTJEO1lBRXJGLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xCLEtBQUssR0FBRyxTQUFTLENBQUM7Z0JBQ2xCLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQSxpQ0FBaUM7Z0JBQ25ELE1BQU0sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLGlDQUFpQztnQkFDbkUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLFdBQVc7b0JBQUUsU0FBUyxHQUFHLGFBQWEsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLFNBQVM7b0JBQUUsU0FBUyxHQUFHLFNBQVMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7b0JBQUUsS0FBSyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLEdBQUcsR0FBRyxlQUFlLEVBQUUsQ0FBQyxDQUFBLHVDQUF1QztnQkFDbkUsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUVkLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ1AsR0FBRyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO3dCQUNwQyxRQUFRLENBQUM7WUFFYixDQUFDLENBQUMsQ0FBQTtZQUVGLFNBQVMsZUFBZSxDQUFDLEdBQWE7Z0JBQ3BDLElBQUksSUFBSSxHQUFhLEVBQUUsQ0FBQztnQkFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtpQkFDN0Q7Z0JBQ0QsT0FBTyxJQUFJLENBQUE7WUFDYixDQUFDO1lBR0QsU0FBUyxxQkFBcUIsQ0FBQyxPQUFlLEVBQUUsSUFBWTtnQkFFMUQsSUFBSSxDQUFDLEdBQ0gsWUFBWSxHQUFHLElBQUksR0FBRyxJQUFJO29CQUMxQixhQUFhLEdBQUcsUUFBUSxHQUFHLElBQUk7b0JBQy9CLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsS0FBSztvQkFDckMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtnQkFFbEIsT0FBTyxDQUFDLENBQUE7WUFFVixDQUFDO1lBRUQsU0FBUyxlQUFlO2dCQUN0QixJQUFJLEdBQUcsR0FDTCxrQkFBa0IsR0FBRyxTQUFTLEdBQUcsSUFBSTtvQkFDckMsYUFBYSxHQUFHLFFBQVEsR0FBRyxJQUFJO29CQUMvQixnQkFBZ0IsQ0FBQTtnQkFFbEIsT0FBTyxHQUFHLENBQUE7WUFDWixDQUFDO1FBRUgsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsS0FBSyxVQUFVLGtCQUFrQjtRQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLGdDQUFnQyxDQUFDO1lBQUUsT0FBTztRQUN2RCxJQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQy9CLElBQUksT0FBTyxHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztRQUNyQyxJQUFJLFlBQVksR0FBYSxFQUFFLENBQUM7UUFFaEMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUM7YUFDM0YsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hCLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEUsQ0FBQyxDQUFDLENBQUM7UUFFTCxJQUFJLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxFQUFFO1lBQzVDLElBQUksR0FBRyxHQUFXLElBQUksTUFBTSxDQUFDO2dCQUMzQixLQUFLLEVBQUUsU0FBUztnQkFDaEIsV0FBVyxFQUFFLE9BQU87Z0JBQ3BCLGVBQWUsRUFBRSxZQUFZO2dCQUM3QixTQUFTLEVBQUUsZ0JBQWdCO2dCQUMzQixLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7Z0JBQ3pCLFdBQVcsRUFBRSxJQUFJO2FBQ2xCLENBQUMsQ0FBQztZQUNILE1BQU0seUJBQXlCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTNDLE9BQU8sS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsQ0FBQyxLQUFLLFVBQVUsUUFBUTtZQUN0QixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsWUFBWSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDNUIsSUFBSSxLQUFhLEVBQ2YsR0FBZSxFQUNmLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsRUFDbEQsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFaEcsSUFBSSxTQUFTLEdBQ1gsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztpQkFDNUYsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFHckQsR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3hDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2IsSUFDRSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7cUJBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzVCLFFBQVEsQ0FBQyxLQUFLLENBQUM7b0JBQ2xCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQTtZQUNKLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNwRCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztvQkFDbkUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBR0gsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBNEMsQ0FBQyxDQUFDLENBQUM7WUFDM0UsWUFBWSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVsQyxPQUFPLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUV0RCxTQUFTLGdCQUFnQixDQUFDLEtBQWlCO2dCQUN6QyxJQUFJLENBQUMsS0FBSztvQkFBRSxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxJQUFJLEdBQ04sS0FBSztxQkFDRixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDckMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNULElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQzt3QkFBRSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkQsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixHQUFHLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNsRSxPQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQixDQUFDLENBQUM7cUJBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLE9BQU8sSUFBSSxDQUFBO1lBQ2IsQ0FBQztZQUFBLENBQUM7UUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO0lBR1AsQ0FBQztJQUFBLENBQUM7QUFDSixDQUFDIn0=