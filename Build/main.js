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
document.addEventListener("DOMContentLoaded", startApp);
/**
 * This function starts the App by setting a number of global variables like the dates, displaying the home page/main menu buttons, etc.
 */
async function startApp() {
    if (localStorage.fontSize)
        setFontSize(localStorage.fontSize);
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
    ;
    await loadTextScripts();
    async function loadTextScripts() {
        //! We must load the text scripts after the dates were set and the giaki variable was defined
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
        textFiles
            .forEach(async (link) => {
            let script = document.createElement("script");
            script.src = link;
            script.id = link.split('/Declare')[1].split('.js')[0];
            script.type = "text/javascript";
            script.onload = () => console.log(script.id + ' has been loaded');
            if (script.id === 'PrayersArray')
                script.onload = () => populatePrayersArrays(); //! We must wait that the PrayersArray script is loaded before calling populatePrayersArrays 
            return await document.getElementsByTagName("body")[0].appendChild(script);
        });
    }
    ;
    addKeyDownListnerToElement(document, 'keydown', undefined);
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
        args.actorClass = 'NoActor';
    if (!args.userLanguages)
        args.userLanguages = JSON.parse(localStorage.userLanguages);
    if (!args.position)
        args.position = containerDiv;
    let htmlRow, p, lang, text, titleBase;
    if (!args.container)
        args.container = containerDiv;
    titleBase = splitTitle(args.tblRow[0])[0];
    htmlRow = document.createElement("div");
    htmlRow.classList.add("Row"); //we add 'Row' class to this div
    if (localStorage.displayMode === displayModes[1])
        htmlRow.classList.replace('Row', 'SlideRow'); //we add the displayMode class to this div
    if (localStorage.displayMode === displayModes[1])
        htmlRow.classList.add(hidden);
    htmlRow.dataset.root = titleBase.replace(/Part\d+/, "");
    if (args.actorClass)
        htmlRow.classList.add(args.actorClass);
    if (args.actorClass && args.actorClass.includes("Title")) {
        htmlRow.addEventListener("click", (e) => {
            e.preventDefault;
            collapseOrExpandText({ titleRow: htmlRow });
        }); //we also add a 'click' eventListener to the 'Title' elements
        htmlRow.id = args.tblRow[0]; //we add an id to all the titles in order to be able to retrieve them for the sake of adding a title shortcut in the titles right side bar
    }
    ;
    //looping the elemparams.ents containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
    for (let x = 1; x < args.tblRow.length; x++) {
        //x starts from 1 because prayers[0] is the id
        if (!args.tblRow[x] || args.tblRow[x] === " ")
            continue; //we escape the empty strings if the text is not available in all the button's languages
        if (args.actorClass &&
            (args.actorClass === "Comments")) {
            //this means it is a comment
            x === 1 ?
                lang = foreingLanguage
                : lang = defaultLanguage;
        }
        else {
            lang = args.languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
        } //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
        if (args.userLanguages.indexOf(lang) < 0)
            continue;
        p = document.createElement("p"); //we create a new <p></p> element for the text of each language in the 'prayer' array (the 'prayer' array is constructed like ['prayer id', 'text in AR, 'text in FR', ' text in COP', 'text in Language', etc.])
        if (!args.actorClass)
            p.classList.add("PrayerText"); //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
        p.dataset.root = htmlRow.dataset.root; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
        text = args.tblRow[x];
        p.lang = lang.toLowerCase();
        p.classList.add(lang);
        p.innerText = text;
        p.addEventListener("dblclick", (ev) => {
            ev.preventDefault();
            localStorage.fontSize !== '1.9' ? setFontSize('1.9') : setFontSize('1');
            //toggleAmplifyText(ev.target as HTMLElement, "amplifiedText");
        }); //adding a double click eventListner that amplifies the text size of the chosen language;
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
    if (containerDiv.dataset.editingMode)
        return showBtnInEditingMode(btn);
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
        btn.showPrayers) {
        showPrayers({ btn: btn, clearContainerDiv: true, clearRightSideBar: true, container: container, languages: btn.languages, prayersSequence: btn.prayersSequence, position: container });
    }
    ;
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
    if (btn.parentBtn
        && btn.btnID !== btnGoBack.btnID
        && !sideBarBtnsContainer.querySelector("#" + btnGoBack.btnID)) {
        //i.e., if the button passed to showChildButtonsOrPrayers() has a parentBtn property and it is not itself a btnGoback (which we check by its btnID property), we wil create a goBack button and append it to the sideBar
        //the goBack Button will only show the children of btn in the sideBar: it will not call showChildButonsOrPrayers() passing btn to it as a parameter. Instead, it will call a function that will show its children in the SideBar
        createGoBackBtn(btn.parentBtn, sideBarBtnsContainer, btn.cssClass);
        lastClickedButton = btn;
    }
    if (btn.btnID !== btnMain.btnID //The button itself is not btnMain
        && btn.btnID !== btnGoBack.btnID //The button itself is not btnGoBack
        && !sideBarBtnsContainer.querySelector("#" + 'settings')
        && !sideBarBtnsContainer.querySelector("#" + btnMain.btnID) //No btnMain is displayed in the sideBar
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
    if (localStorage.displayMode === displayModes[1])
        showSlidesInPresentationMode();
    //If at the end no prayers are displayed in containerDiv, we will show the children of btnMain in containerDiv
    if (btn.btnID !== btnMain.btnID
        && containerDiv.children.length > 0
        && containerDiv.children[0].classList.contains("mainPageBtns"))
        btnMain.onClick();
}
function showSlidesInPresentationMode() {
    let countMax = 2000, countMin = 2500;
    let toMerge = [];
    let children = Array.from(containerDiv.querySelectorAll('div'));
    (function setSlidesCSS() {
        let slides = children.filter(child => child.classList.contains('SlideRow'));
        slides.forEach(div => {
            setGridColumnsOrRowsNumber(div);
            div.style.gridTemplateAreas = setGridAreas(div);
        });
    })();
    mergeContainerSlidesIfTooSmall(containerDiv);
    function mergeContainerSlidesIfTooSmall(container) {
        //This function will count the number of words in each html div element with class 'DisplayedModePresentation'. If the number is below a certain number, it will add the text in the next html div. It will do so until we reach the maximum number. It will then append all the divs to a container (a div having the class 'Row'). 
        let slide = children[0];
        while (slide) {
            while (excludeSlide(slide))
                slide = selectNextSlide(slide);
            if (slide.classList.contains('Expandable')) {
                slide = slide.children[0];
                continue;
            }
            ;
            slide.dataset.sameSlide = slide.dataset.root + children.indexOf(slide);
            countWords(slide);
            if (toMerge.length > 1) {
                prepareSameSlideGroup();
                slide = toMerge[toMerge.length - 1];
            }
            ;
            toMerge = [];
            slide = selectNextSlide(slide);
        }
        ;
        function excludeSlide(slide) {
            if (checkIfCommentOrCommentText(slide)
                || slide.children.length < 1
                || (!slide.classList.contains('SlideRow')
                    && !slide.classList.contains('Expandable')))
                return true;
        }
        /**
         * Cournts the letters in the innerHTML of a group of divs added to a the toMerge[] array. If the innerHTML does not exceed the countMax, it adds the next div to the toMerge[] array until the maxCount is reached or exceeded
         */
        function countWords(slide) {
            let count = 0;
            toMerge.push(slide); //!CAUTION: we need the slide to be pushed when the function, because when it is called for the first time, if the slide is not already in toMerge[], we will add its nextSibling but the first slide itself will never be added to toMerge.
            //We start by counting the number of letters in toMerge[]
            toMerge.forEach(child => count += child.innerHTML.length);
            if (count > countMax) {
                toMerge.pop(); //if the number of letters exceeds the maximum we remove the last slide from toMerge[]
                return;
            }
            ;
            let nextSlide = selectNextSlide(slide);
            if (!nextSlide)
                return;
            if (count <= countMin)
                countWords(nextSlide);
        }
        ;
        function prepareSameSlideGroup() {
            console.log('ToMerge = ', toMerge);
            if (toMerge[toMerge.length - 1].classList.contains('Title')
                || toMerge[toMerge.length - 1].classList.contains('SubTitle'))
                toMerge.pop(); //If the last element of toMerge[] is a title slide, we remove it      
            if (toMerge.length < 2)
                return;
            toMerge
                .forEach(mergedSlide => {
                if (checkIfCommentOrCommentText(mergedSlide))
                    return console.log('mergedSlide contains comments !!!');
                mergedSlide.dataset.sameSlide = toMerge[0].dataset.sameSlide; //We will give all the slides the same data-same-slide value in order to retrieve them together later
            });
        }
        ;
    }
    ;
    (function moveExpandableBtns() {
        let btn;
        let expandables = Array.from(containerDiv.querySelectorAll('.Expandable'));
        if (expandables.length < 1)
            return console.log('Couldn\'t find any expandable');
        expandables
            .forEach(expandable => {
            btn = containerDiv.querySelector('#' + expandable.id.replace('Expandable', ''));
            if (!btn)
                return console.log('couldn\'t find btn');
            sideBarBtnsContainer.prepend(btn);
            btn.addEventListener('click', () => {
                showOrHideSlide(false); //We don't need to pass a value for dataSameSlide if the boolean is false, because in this case its the element 'Slide' that will be removed and the function does not need dataSameSlide
                let dataSameSlide = Array.from(expandable.children).find(child => child.dataset.sameSlide).dataset.sameSlide;
                showOrHideSlide(true, dataSameSlide);
                closeSideBar(leftSideBar);
            });
            console.log('expandable btn = ', btn);
        });
    })();
    let hasSameSlide = Array.from(containerDiv.children).find(div => div.dataset.sameSlide);
    if (hasSameSlide)
        showOrHideSlide(true, hasSameSlide.dataset.sameSlide);
    function selectNextSlide(currentSlide) {
        let next;
        if (currentSlide.nextElementSibling)
            next = currentSlide.nextElementSibling;
        else if (currentSlide.parentElement && currentSlide.parentElement.classList.contains('Expandable'))
            next = currentSlide.parentElement.nextElementSibling;
        return next;
    }
}
;
/**
 * Retrieves and returns the div elements having the same data-same-slide attribute
 * @param {string} dataSameSlide - the value of the data-same-slide attribute by which the divs will be filtered and retrieved
 * @param {HTMLElement} container - the html container that will be filtered while looking for the div elements with the same data-same-slide value
 * @return {HTMLDivElement[]} an array of the div elements retrieved
 */
function buildSlideFromDataSameSlideGroup(dataSameSlide) {
    let sameSlide = Array.from(containerDiv.querySelectorAll('div[data-same-slide]'))
        .filter(div => div.dataset.sameSlide === dataSameSlide && !checkIfCommentOrCommentText(div));
    if (!sameSlide || sameSlide.length < 1)
        return;
    let slide = document.createElement('div');
    slide.classList.add('Slide');
    slide.id = dataSameSlide;
    let child;
    sameSlide
        .forEach(div => {
        slide.appendChild(div.cloneNode(true));
        child = slide.lastChild;
        child.removeAttribute('data-same-slide');
        addActorToSlide(child);
        child.style.gridTemplateColumns = setGridColumnsOrRowsNumber(child);
    });
    slide.style.gridTemplateRows = setGridColumnsOrRowsNumber(slide);
    containerDiv.prepend(slide);
    return slide;
    function addActorToSlide(slide) {
        let actor = actors.find(actor => slide.classList.contains(actor.EN));
        if (!actor)
            return;
        Array.from(slide.children)
            .forEach(parag => {
            parag.innerHTML = '<span class="actorSpan">' + actor[parag.lang.toUpperCase()] + ': </span>' + '<span class="textSpan">' + parag.innerHTML + '</span>';
        });
    }
}
;
/**
 * Shows or hides a slide in Display Presentation Mode
 * @param {string} datSameSlide - If show = false, this argument can be undefined. This agrument is the value of the data-same-slide attribute, by which we will retrieve the div elements that will be displayed in a new '.Slide' element if show = true
 * @param {boolean} show - a boolean that indicates whether the slide should be displayed or hidden (true = display, flase = hide)
 */
function showOrHideSlide(show, dataSameSlide) {
    let slide;
    if (show) {
        if (!dataSameSlide)
            return console.log('You must provide the dataSameSlide argument');
        slide = buildSlideFromDataSameSlideGroup(dataSameSlide);
        if (!slide || slide.children.length < 1)
            return;
        let children = Array.from(slide.children);
        children
            .forEach(div => div.classList.remove(hidden));
    }
    else if (!show) {
        slide = containerDiv.querySelector('.Slide');
        if (!slide)
            return;
        slide.remove();
    }
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
    if (!btn || !btn.label) {
        console.log('The button is either undefined, or has no lable');
        return;
    }
    ;
    let newBtn = document.createElement("button");
    btnClass
        ? newBtn.classList.add(btnClass)
        : newBtn.classList.add(btn.cssClass);
    newBtn.id = btn.btnID;
    //Adding the labels to the button
    if (btn.label[defaultLanguage])
        editBtnInnerText(btn.label[defaultLanguage], defaultLanguage);
    if (btn.label[foreingLanguage])
        editBtnInnerText(btn.label[foreingLanguage], foreingLanguage);
    btnsBar.appendChild(newBtn);
    //If no onClick parameter/argument is passed to createBtn(), and the btn has any of the following properties: children/prayers/onClick or inlinBtns, we set the onClick parameter to a function passing the btn to showChildButtonsOrPrayers
    if (!onClick && (btn.children || btn.prayersSequence || btn.onClick))
        onClick = () => showChildButtonsOrPrayers(btn, clear);
    //Else, it is the onClick parameter that will be attached to the eventListner
    if (onClick)
        newBtn.addEventListener("click", (e) => {
            e.preventDefault;
            onClick();
        });
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
    ;
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
                direction = 'left';
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
                direction = 'right';
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
                direction = 'down';
                if (localStorage.displayMode === displayModes[1])
                    goToNextOrPreviousSlide(undefined, direction);
            }
            else {
                /* up swipe */
                direction = 'up';
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
    if (!args.btn && !args.wordTable) {
        console.log('You must provide either a button with prayersSequence and prayersArray, either a word table. None of those arguments is provided');
        return;
    }
    ;
    //Setting container, and the values for the missing arguments
    if (!args.container && args.btn && args.btn.docFragment)
        args.container = args.btn.docFragment;
    if (!args.container)
        args.container = containerDiv;
    if (!args.position)
        args.position = args.container;
    if (args.clearContainerDiv !== false)
        args.clearContainerDiv = true;
    if (args.clearRightSideBar !== false)
        args.clearRightSideBar = true;
    if (!args.languages && args.btn)
        args.languages = args.btn.languages;
    if (!args.languages) {
        console.log('the languages argument is missing or undefined');
        return;
    }
    ;
    if (args.btn && args.btn.btnID != btnGoBack.btnID && args.btn.btnID != btnMain.btnID)
        closeSideBar(leftSideBar);
    if (args.clearContainerDiv === true)
        containerDiv.innerHTML = "";
    if (args.clearRightSideBar === true)
        sideBarTitlesContainer.innerHTML = ""; //this is the right side bar where the titles are displayed for navigation purposes
    let date, tables = [];
    if (!args.wordTable) {
        if (!args.prayersSequence)
            args.prayersSequence = args.btn.prayersSequence;
        if (!args.prayersSequence) {
            console.log('The prayersSequenceis missing, we cannot retrieve the tables');
            return;
        }
        ;
        args.prayersSequence
            .forEach(tableTitle => {
            //If no string[][] was passed in the arguments, we will retrieve the table from its title (prayer)
            if (!tableTitle) {
                console.log("No tableTitle : ");
                return;
            }
            ;
            //If the date value is already set in the title of the table, we do not add it again
            if (tableTitle.includes("&D="))
                date = "";
            else
                date = "&D=" + copticReadingsDate; //this is the default case where the date is not set, and will hence be given the value of the copticReadingsDate.
            tableTitle += date; //we add the date to the title of the table
            tables.push(findTableInPrayersArray(tableTitle, getTablesArrayFromTitlePrefix(tableTitle)));
        });
    }
    else if (args.wordTable)
        tables.push(args.wordTable);
    if (tables.length === 0)
        return;
    //We will return an HTMLDivElement[] of all the divs that will be created from wordTable
    let tblHtmlDivs = [];
    tables
        .forEach(table => {
        if (!table) {
            console.log('tables = ', tables);
            return;
        }
        ;
        table
            .map(row => {
            let divs = processRow(row);
            if (!divs || divs.length === 0)
                return;
            tblHtmlDivs.push(...divs);
        });
    });
    return tblHtmlDivs;
    function processRow(row) {
        //We check if the row (string[]) is not a mere placeholder for another table
        if (row[0].startsWith(Prefix.placeHolder))
            return processPlaceHolder(row); //If the row is a placeholder, we retrieve the table refrenced in row[1]
        else
            return [createElement(row)]; //If it is not a placeholder, we created a div element with the text of the row
    }
    ;
    function processPlaceHolder(row) {
        if (!row[1]) {
            console.log(row);
            return;
        }
        ;
        //We retrieve the tables' array (which is a string[][][]) from the title of the table in row[1]
        //We retrieve the table itself
        let tbl = findTableInPrayersArray(row[1], getTablesArrayFromTitlePrefix(row[1]), { equal: true });
        if (!tbl) {
            console.log('Could\'t find the placeHolder table : row[2]  =', row[2]);
            return;
        }
        ;
        //We create html div elements representing each row (i.e., string[]) in the table
        return tbl.map(tblRow => createElement(tblRow));
    }
    ;
    function createElement(row) {
        if (!row)
            return;
        if (row[0] === Prefix.placeHolder) {
            processPlaceHolder(row);
            return;
        }
        ;
        return createHtmlElementForPrayer({
            tblRow: row,
            languagesArray: args.languages,
            position: args.position,
            container: args.container,
        });
    }
    ;
}
/**
 * Uses the prefix at the begining of the title of a table or a row (i.e. Prefi.something) to find the string[][][] array where a table which title starts with the same prefix, should be found.
 * @param {string} title: the title starting with a prefix, from which the string[][][] is retrived
 * @return {string[][][]} - the array in which a table which title starts with such prefix, should be found
 */
function getTablesArrayFromTitlePrefix(title) {
    let array = PrayersArraysKeys.find(entry => title.startsWith(entry[0]));
    if (array && array[1])
        return eval(array[1]);
}
;
/**
 * Returns the name of the array passed to it as an argument
 * @param {string[][][]} array
 */
function getArrayNameFromArray(array) {
    let arrayName = Object.entries(PrayersArrays).find(entry => entry[1] === array)[0];
    if (arrayName)
        return 'PrayersArray';
    else if (!arrayName)
        arrayName = Object.entries(ReadingsArrays).find(entry => entry[1] === array)[0];
    if (arrayName)
        return 'ReadingsArray.' + arrayName;
}
;
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
        row.style.gridTemplateColumns = setGridColumnsOrRowsNumber(row);
        //Defining grid areas for each language in order to be able to control the order in which the languages are displayed (Arabic always on the last column from left to right, and Coptic on the first column from left to right)
        row.style.gridTemplateAreas = setGridAreas(row);
        (function addRightBorders() {
            let rowChildren = Array.from(row.children);
            let gridAreas = row.style.gridTemplateAreas.replaceAll('"', '').split(' ');
            if (gridAreas.length <= 1)
                return;
            gridAreas
                .forEach(area => {
                if (gridAreas.indexOf(area) === gridAreas.length - 1)
                    return;
                rowChildren
                    .find(child => child.lang.toUpperCase() === area)
                    .style.borderRightStyle = "groove";
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
                .replaceAll(String.fromCharCode(171), "<q>")
                .replaceAll(String.fromCharCode(187), "</q>");
        }
        else if (paragraph.classList.contains("AR")) {
            splitted = paragraph.innerHTML.split('"');
            splitted.forEach((part) => {
                if (splitted.indexOf(part) % 2 !== 0)
                    splitted[splitted.indexOf(part)] = "<q>" + part + "</q>";
            });
            if (splitted.length > 0)
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
function selectElementsByDataRoot(container, dataRoot, options = { equal: true }) {
    let children = Array.from(container.querySelectorAll('div'));
    if (options.equal) {
        return children.filter((htmlRow) => htmlRow.dataset.root &&
            htmlRow.dataset.root === dataRoot);
    }
    else if (options.includes) {
        return children.filter((htmlRow) => htmlRow.dataset.root &&
            htmlRow.dataset.root.includes(dataRoot));
    }
    else if (options.startsWith) {
        return children.filter((htmlRow) => htmlRow.dataset.root &&
            htmlRow.dataset.root.startsWith(dataRoot));
    }
    else if (options.endsWith) {
        return children.filter((htmlRow) => htmlRow.dataset.root &&
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
            newDiv.style.gridTemplateColumns = setGridColumnsOrRowsNumber(newDiv, undefined, 2);
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
                label: { AR: "التالي", FR: "Suivants" },
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
                    AR: "العودة إلى القداس",
                    FR: "Retour à la messe",
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
                    AR: prayerTable[0][btn.languages.indexOf(defaultLanguage) + 1],
                    FR: prayerTable[0][btn.languages.indexOf(foreingLanguage) + 1], //same logic and comment as above
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
                        selectElementsByDataRoot(containerDiv, masterBtnDiv.dataset.displayedOptionalPrayer, { equal: true })
                            .forEach((div) => div.remove());
                    }
                    //We call showPrayers and pass inlinBtn to it in order to display the fraction prayer
                    let createdElements = showPrayers({
                        wordTable: inlineBtn.prayersArray[0],
                        languages: inlineBtn.languages,
                        clearContainerDiv: false,
                        clearRightSideBar: false,
                        position: { el: masterBtnDiv, beforeOrAfter: "afterend" }
                    });
                    masterBtnDiv.dataset.displayedOptionalPrayer = splitTitle(prayerTable[0][0])[0]; //After the fraction is inserted, we add data-displayed-optional-Prayer to the masterBtnDiv in order to use it later to retrieve all the rows/divs of the optional prayer that was inserted, and remove them
                    createdElements.forEach(htmlRow => {
                        //We will add to each created element a data-optional-prayer attribute, which we will use to retrieve these elements and delete them when another inline button is clicked
                        if (htmlRow)
                            htmlRow.dataset.optionalPrayer = htmlRow.dataset.root;
                    });
                    //We format the grid template of the newly added divs
                    setCSS(createdElements);
                    //We apply the amplification of text
                    applyAmplifiedText(createdElements);
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
 * @param {string} tableTitle - The title of the table (without '&C=', i.e., we search for splitTitle(tableTitle)[0])  that we need to find in the button's prayersArray[][][].
 * @param {string[][][]} prayersArray - the Button that we need to search its prayersArray[][][] property for an element[][] having its [0][0] value equal the title of the Word Table
 * @param {equal?:boolean, startsWith?:boolean, endsWith?:boolean, includes?:boolean} Options - the matching options by which the function will search for the table: equal means the title of table in the array mush be exactly matching tableTitle, startsWith, means it must start with tableTitle, etc.
 * @returns {string[][] | void} - an array representing the Word Table if found or 'undefined' if not found
 */
function findTableInPrayersArray(tableTitle, prayersArray, options = { equal: true }) {
    if (!prayersArray)
        prayersArray = getTablesArrayFromTitlePrefix(tableTitle);
    if (!prayersArray)
        return console.log('No prayers Array', tableTitle);
    let table;
    if (options.equal)
        table =
            prayersArray
                .find((tbl) => tbl[0][0] && splitTitle(tbl[0][0])[0] === tableTitle);
    else if (options.startsWith)
        table =
            prayersArray
                .find((tbl) => tbl[0][0] && splitTitle(tbl[0][0])[0].startsWith(tableTitle));
    else if (options.endsWith)
        table =
            prayersArray
                .find((tbl) => tbl[0][0] && splitTitle(tbl[0][0])[0].endsWith(tableTitle));
    else if (options.includes)
        table =
            prayersArray
                .find((tbl) => tbl[0][0] && splitTitle(tbl[0][0])[0].includes(tableTitle));
    if (table)
        return table;
    else
        console.log('no table with the provided title was found : ', tableTitle, ' prayersArray =', prayersArray);
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
    //Show InstallPWA button//We are not calling it any more
    function installPWA() {
        btn = createSettingBtn({
            tag: "button",
            role: "button",
            btnClass: "settingsBtn",
            innerText: "Install PWA",
            btnsContainer: inlineBtnsDiv,
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
            }
        });
    }
    ;
    //Appending date picker
    (function showDatePicker() {
        let datePicker = createSettingBtn({
            tag: "input",
            btnsContainer: inlineBtnsDiv,
            id: "datePicker",
            type: "date",
            onClick: {
                event: "change",
                fun: () => changeDate(new Date(datePicker.value.toString())),
            }
        });
        datePicker.setAttribute("value", todayDate.toString());
        datePicker.setAttribute("min", "1900-01-01");
    })();
    //Appending 'Next Coptic Day' button
    (async function showNextCopticDayButton() {
        let btnsContainer = createBtnsContainer('showNextCopticDate', { AR: 'انتقل إلى اليوم التالي أو السابق', FR: 'Aller au jour suivant ou précédant', EN: 'Move to the next or previous day' });
        btn = createSettingBtn({
            tag: "button",
            role: "button",
            btnClass: "settingsBtn",
            innerText: "Next Coptic Day",
            btnsContainer: btnsContainer,
            id: "nextDay",
            type: "submit",
            onClick: {
                event: "click",
                fun: () => changeDate(undefined, true, 1)
            }
        });
        setStyle(btn);
        btn = createSettingBtn({
            tag: "button",
            role: "button",
            btnClass: "settingsBtn",
            innerText: "Previous Coptic Day",
            btnsContainer: btnsContainer,
            id: "previousDay",
            type: "submit",
            onClick: {
                event: "click",
                fun: () => changeDate(undefined, false, 1)
            }
        });
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer, 3);
        setStyle(btn);
        function setStyle(htmlBtn) {
            htmlBtn.style.backgroundColor = "saddlebrown";
        }
        ;
    })();
    (function showChangeFontSizeBtn() {
        let btnsContainer = createBtnsContainer('changeFontSize', { AR: 'تكبير أو تصغير حجم الأحرف', FR: 'Changer la taille de police', EN: 'Increase or decrease the fonts size' });
        let input = createSettingBtn({
            tag: 'input',
            btnsContainer: btnsContainer,
            id: 'fontsSize',
        });
        let dataList = createDataList();
        if (!dataList)
            return console.log('dataList was not generated : ', dataList);
        input.type = 'range';
        input.setAttribute('list', dataList.id);
        input.id = 'inputFontSize';
        input.min = '0.3';
        input.max = '1.9';
        Number(localStorage.fontSize) ? input.defaultValue = localStorage.fontSize : input.defaultValue = '0.5';
        input.step = '0.1';
        input.onchange = () => {
            console.log('input.value = ' + input.value);
            setFontSize(input.value);
        };
        function createDataList() {
            let list = document.createElement('datalist');
            list.id = 'fontSizes';
            list.classList.add(hidden);
            btnsContainer.appendChild(list);
            for (let i = 0.3; i < 2; i += 0.1) {
                let option = document.createElement('option');
                option.value = i.toString();
                list.appendChild(option);
            }
            ;
            return list;
        }
    })();
    //Appending Add or Remove language Buttons
    (async function showAddOrRemoveLanguagesBtns() {
        ;
        let langs = [
            ['AR', 'العربية'],
            ['FR', 'Français'],
            ['EN', 'English'],
            ['COP', 'Coptic'],
            ['CA', 'قبطي مُعرب'],
        ];
        let defaultLangContainer = createBtnsContainer('defaultLanguage', { AR: 'اختر اللغة الأساسية (لغة الإعدادات)', FR: 'Sélectionner la langue par défaut', EN: 'Choose the default Language' });
        let foreignLangContainer = createBtnsContainer('foreignLanguage', { AR: 'اختر اللغة الأجنبية (اختياري)', FR: 'Sélectionner une langue étrangère (optionnel)', EN: 'Choose the foreign Language' });
        let copticLangContainer = createBtnsContainer('copticLanguage', { AR: 'اختر نسخة النص القبطي (أحرف قبطية أو قبطي معرب )', FR: 'Sélectionner les caractères d\'affichage de la version copte (si disponible)', EN: 'Choose the coptic language version' });
        addLangsBtns({
            btnsContainer: defaultLangContainer,
            fun: (lang) => setLanguage(lang, 0),
            langsOptions: [langs[0], langs[1], langs[2]],
            index: 0
        });
        addLangsBtns({
            btnsContainer: foreignLangContainer,
            fun: (lang) => setLanguage(lang, 1),
            langsOptions: [langs[0], langs[1], langs[2]],
            index: 1
        });
        addLangsBtns({
            btnsContainer: copticLangContainer,
            fun: (lang) => setLanguage(lang, 2),
            langsOptions: [langs[3], langs[4]],
            index: 2
        });
        /**
         * @param {string} lang - the language that the button changes when clicked
         * @param {number} index - the index of the language in the userLanguages array stored in the localStorage. This index indicated whether the language is the defaultLanguage (index=0) or the foreignLanguage (index=1), or the version of the Coptic text (index=2)
         */
        function setLanguage(lang, index) {
            let stored = JSON.parse(localStorage.userLanguages);
            if (index > 0 && stored.indexOf(lang) === index) {
                //If the language is already defined at the same index, we will set the element at the same index to undefined (i.e., we will desactivate the language and remove it from the list of userLanguages). We never set the default language (i.e. stored[0]) to undefined that's why we exclude the case where index = 0
                stored[index] = undefined;
            }
            else if (index === 0 && stored.indexOf(lang) === index) {
                return alert('You cannot not desactivate the default language. You can replace it by choosing another language');
            }
            else if (stored.indexOf(lang) === 0 && index === 1 && stored[index]) {
                //If the language is already set as defaultLanguage (it is set at index 0), and we want to make it the foreign language (index = 1), we check if the value of index 1 (the index of the foreign language) is not undefined. If so, we make the foreign language default language and we replace it with lang
                stored[0] = stored[index];
                stored[index] = lang;
            }
            else if (stored.indexOf(lang) === 0 && index === 1 && !stored[index]) {
                return alert('You must first replace the default langauge by another language before being able to set it as foreign language');
            }
            else if (stored.indexOf(lang) === 1 && index === 0) {
                //If the language is already set as foreignLanguage (it is set at index 1), and we want to make it the default language (index = 0). If so, we set the foreign language as undefined default language and we set the language as default language
                stored[1] = undefined;
                stored[index] = lang;
            }
            else if (stored.indexOf(lang) < 0) {
                //If the array does not contain the language at any of its indexes, we add it at the index passed as argument
                stored[index] = lang;
            }
            ;
            defaultLanguage = stored[0];
            foreingLanguage = stored[1];
            copticLanguage = stored[2];
            localStorage.userLanguages = JSON.stringify(stored);
            console.log(localStorage.userLanguages);
        }
        function addLangsBtns(args) {
            let newBtn;
            args.langsOptions
                .map((lang) => {
                newBtn = createSettingBtn({
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
                    }
                });
                if (JSON.parse(localStorage.userLanguages)[args.index] !== lang[0])
                    newBtn.classList.add("langBtnAdd"); //The language of the button is absent from userLanguages[], we will give the button the class 'langBtnAdd'
            });
            args.btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(args.btnsContainer, 3);
        }
    })();
    (async function showExcludeActorButon() {
        let btnsContainer = createBtnsContainer('showOrHideActor', { AR: 'إظهار أو إخفاء مردات الكاهن أو الشماس أو الشعب', FR: 'Afficher ou cacher un acteur', EN: 'Show or hide an actor' });
        actors
            .map((actor) => {
            if (actor.EN === "CommentText")
                return; //we will not show a button for 'CommentText' class, it will be handled by the 'Comment' button
            let show = JSON.parse(localStorage.getItem("showActors")).filter((el) => el[0].AR === actor.AR)[0][1];
            btn = createSettingBtn({ tag: "button",
                role: "button",
                btnClass: "settingsBtn",
                innerText: actor[foreingLanguage],
                btnsContainer: btnsContainer,
                id: actor.EN,
                lang: actor.EN,
                onClick: {
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
                }
            });
            if (show === false) {
                btn.classList.add("langBtnAdd");
            }
        });
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer, 5);
    })();
    (async function showDisplayModeBtns() {
        let btnsContainer = createBtnsContainer('changeDisplayMode', { AR: 'اختار نظام العرض', FR: 'Changer le mode d\'affichage', EN: 'Change the display mode' });
        inlineBtnsDiv.appendChild(btnsContainer);
        displayModes
            .map((mode) => {
            btn = createSettingBtn({ tag: "button",
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
                            Array.from(btnsContainer.children).map((btn) => {
                                btn.id !== localStorage.displayMode
                                    ? btn.classList.add("langBtnAdd")
                                    : btn.classList.remove("langBtnAdd");
                            });
                        }
                    },
                }
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
        let btnsContainer = createBtnsContainer('enterEditingMode', { AR: 'فعل تعديل النصوص', FR: 'Activer le mode édition', EN: '' });
        inlineBtnsDiv.appendChild(btnsContainer);
        btn = createSettingBtn({
            tag: "button",
            role: "button",
            btnClass: "settingsBtn",
            innerText: "Editing Mode",
            btnsContainer: btnsContainer,
            id: "editingMode" + localStorage.editingMode.toString(),
            onClick: {
                event: "click",
                fun: () => {
                    //@ts-ignore
                    if (!console.save)
                        addConsoleSaveMethod(console); //We are adding a save method to the console object
                    containerDiv.innerHTML = "";
                    containerDiv.dataset.editingMode = 'true';
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
                    select.addEventListener("change", () => startEditingMode({ select: select }));
                },
            }
        });
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer, 3);
    })();
    function createBtnsContainer(id, labelText) {
        let btnsContainer = document.createElement("div");
        btnsContainer.id = id;
        btnsContainer.style.display = "grid";
        //btnsContainer.classList.add('settingsBtnsContainer');
        btnsContainer.style.columnGap = "5px";
        btnsContainer.style.justifyItems = "center";
        btnsContainer.style.height = 'fit-content';
        btnsContainer.style.width = 'fit-content';
        inlineBtnsDiv.appendChild(btnsContainer);
        let labelsDiv = document.createElement('div');
        labelsDiv.classList.add('settingsLabel');
        btnsContainer.insertAdjacentElement('beforebegin', labelsDiv);
        let label = document.createElement('h3');
        label.innerText = labelText[defaultLanguage];
        labelsDiv.appendChild(label);
        if (foreingLanguage) {
            let foreignLabel = document.createElement('h3');
            foreignLabel.innerText = labelText[foreingLanguage];
            labelsDiv.appendChild(foreignLabel);
        }
        ;
        return btnsContainer;
    }
    ;
    function createSettingBtn(args) {
        let btn = document.createElement(args.tag);
        if (!args.role)
            args.role = args.tag;
        if (args.role) {
            btn.role = args.role;
        }
        if (args.innerText) {
            btn.innerHTML = args.innerText;
        }
        if (args.btnClass) {
            btn.classList.add(args.btnClass);
        }
        if (args.id) {
            btn.id = args.id;
        }
        if (args.lang) {
            btn.lang = args.lang.toLowerCase();
        }
        if (args.type && btn.nodeType) {
            //@ts-ignore
            btn.type = args.type;
        }
        if (args.size) {
            //@ts-ignore
            btn.size = args.size;
        }
        if (args.backgroundColor) {
            btn.style.backgroundColor = args.backgroundColor;
        }
        if (args.onClick) {
            btn.addEventListener(args.onClick.event, (e) => {
                e.preventDefault;
                args.onClick.fun();
            });
        }
        if (args.btnsContainer) {
            args.btnsContainer.appendChild(btn);
        }
        return btn;
    }
    //Appending colors keys for actors
    (async function addActorsKeys() {
        let btnsContainer = createBtnsContainer('actorsKeys', { AR: 'مفاتيح الألوان', FR: 'Clés des couleurs', EN: 'Colors keys' });
        btnsContainer.style.width = 'fit-content';
        actors
            .map((actor) => {
            if (actor.EN === 'CommentText')
                return;
            let newBtn = createSettingBtn({
                tag: "button",
                btnClass: "colorbtn",
                btnsContainer: btnsContainer,
                id: actor.EN + "Color"
            });
            for (let key in actor) {
                let p = document.createElement("p");
                if (actor[key])
                    p.innerText = actor[key];
                newBtn.appendChild(p);
            }
        });
        btnsContainer.style.gridTemplateColumns = setGridColumnsOrRowsNumber(btnsContainer, 5);
    })();
    closeSideBar(leftSideBar);
}
/**
 * Changes the value of the Css variable fSize on the '.Content' html element
 * @param {string} size - the size of the font
 */
function setFontSize(size) {
    if (!Number(size))
        return;
    let content = document.querySelector('.Content');
    content.style.setProperty('--fSize', size);
    localStorage.fontSize = size;
}
;
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
    return ((100 / units).toString() + '% ').repeat(units);
}
;
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
    return args.tables.map((table) => {
        if (!table || table.length === 0)
            return;
        return showPrayers({
            wordTable: table,
            position: args.position,
            languages: args.languages,
            clearRightSideBar: false,
            clearContainerDiv: false
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
    btns
        .map((btn) => div.appendChild(createBtn(btn, div, btn.cssClass)));
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
    if (PrayersArray.length === 0)
        return console.log('PrayersArray is empty = ', PrayersArray);
    else
        console.log('PrayersArray length = ', PrayersArray.length);
    PrayersArray.map((table) => {
        if (!table[0] || !table[0][0])
            return;
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
function consoleLogArrayTextInDefaultLanguage(title) {
    let Table = PrayersArray.filter(tbl => tbl[0][0].startsWith(title))[0];
    if (!Table)
        return console.log('Didn\'t find the table');
    Table.forEach(row => {
        if (row[0] === Prefix.placeHolder)
            return console.log('Placeholder & title =', row[row.length - 1]);
        return console.log(row[row.length - 1]);
    });
}
;
/**
 * Hides the current slide, and unhides the next or previous slide based on the value of 'next'
 * @param {boolean} next - If true, the next slide is displayed. If false, the previous one is displayed. Its default value is true.
 * @returns
 */
function showNextOrPreviousSildeInPresentationMode(next = true) {
    if (localStorage.displayMode !== displayModes[1])
        return;
    let children = Array.from(containerDiv.querySelectorAll('div[data-same-slide]'));
    let displayed = containerDiv.querySelector('.Slide');
    if (!displayed || displayed.children.length < 1)
        return showOrHideSlide(true, children[0].dataset.sameSlide);
    let sameSlide = children
        .filter(div => div.dataset.sameSlide === displayed.id);
    let nextSlide;
    selectNextSlide(sameSlide[sameSlide.length - 1]);
    function selectNextSlide(slide) {
        if (!slide)
            return console.log('slide is not defined');
        if (next && slide.nextElementSibling)
            nextSlide = slide.nextElementSibling;
        else if (next && slide.parentElement && slide.parentElement.classList.contains('Expandable'))
            nextSlide = slide.parentElement.nextElementSibling;
        else if (!next && slide.previousElementSibling)
            nextSlide = slide.previousElementSibling;
        else if (!next && slide.parentElement && slide.parentElement.classList.contains('Expandable'))
            nextSlide = slide.parentElement.previousElementSibling;
        else
            nextSlide = undefined; //!CAUTION: we must set nextSlide to undefined if none of the above cases applies. Otherwise the function will loop infintely
        if (nextSlide && exclude(nextSlide, slide.dataset.sameSlide))
            selectNextSlide(nextSlide);
    }
    if (!nextSlide)
        return;
    showOrHideSlide(false);
    showOrHideSlide(true, nextSlide.dataset.sameSlide);
    function exclude(div, dataSameSlide) {
        if (div.classList.contains('Slide')
            || !div.classList.contains('SlideRow')
            || div.dataset.sameSlide === dataSameSlide
            || checkIfCommentOrCommentText(div))
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
    console.log('entred');
    if (!event && !direction)
        return;
    let code;
    if (event)
        code = event.code;
    else if (direction === 'up')
        code = 'PageUp'; //next slide
    else if (direction === 'down')
        code = 'PageDown'; //previous slide
    console.log(code);
    if (code === 'ArrowDown'
        || code === 'PageDown'
        || code === 'ArrowRight')
        showNextOrPreviousSildeInPresentationMode(true); //next slide
    else if (code === 'ArrowUp'
        || code === 'PageUp'
        || code === 'ArrowLeft')
        showNextOrPreviousSildeInPresentationMode(false); //previous slide
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
    htmlRows
        .forEach(row => {
        if (!row.title)
            return alert("the row dosen't have title");
        table
            .push(Array.from(row.children)
            .map((p) => {
            //We replace the quotes in the innerHTML of the paragraph, but we will return the innerText of the paragraph in order to avoid getting <br> or any other html tags in the returned text
            p.innerHTML = replaceHtmlQuotes(p.innerHTML, p.lang);
            return p.innerText;
        }));
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
 * Checks if the html element passed to it as an argument has 'Comments' or 'CommentText' in its classList
 * @param {HTMLDivElement} htmlRow - the html element that we want to check if it has any of the classes related to comments
 */
function checkIfCommentOrCommentText(htmlRow) {
    if (!htmlRow)
        return undefined;
    else if (htmlRow.classList.contains('Comments') || htmlRow.classList.contains('CommentText'))
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
async function callFetchSynaxariumArabic() {
    for (let i = 5; i < 8; i++) {
        await fetchSynaxariumArabic(i);
    }
    console.log(ReadingsArrays.SynaxariumArray);
}
;
async function fetchSynaxariumArabic(month) {
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
async function fetchSynaxariumFrench(months) {
    if (!months)
        months = ['50-toubah', '51-amshir', '52-baramhat'];
    let table, apiInitial = 'https://coptipedia.com/index.php/livre-1-les-temoins-de-la-foi/le-synaxaire/', textContainer, text;
    months
        .forEach(async (query) => {
        let month = copticMonths.indexOf(copticMonths
            .filter(coptMonth => coptMonth.FR.toLowerCase() === query.split('-')[1])[0])
            .toString();
        if (Number(month) < 10)
            month = '0' + month;
        console.log('month =', month);
        await processMonth(query, month);
        // console.log(ReadingsArrays.SynaxariumArray);
    });
    async function processMonth(monthQuery, month) {
        if (!month)
            return console.log('month is undefined = ', month);
        let url = apiInitial + monthQuery + '.html'; //This will return an html page with links to all the days of the month. We will retrieve these links and fetch each of them in order to retrieve the text
        let bodyText = await fetchURL(url);
        if (!bodyText)
            return console.log('bodyText is undefined = ', bodyText);
        return await processResponse(new DOMParser().parseFromString(bodyText, 'text/html'), month, monthQuery, url);
    }
    ;
    async function processResponse(responseDoc, month, monthQuery, url) {
        if (!responseDoc)
            return console.log('responseDoc is undefined = ', responseDoc);
        let anchors = responseDoc.querySelectorAll('a');
        if (!anchors)
            return console.log('anchors is undefined = ', anchors);
        let unique = new Set();
        let i = 1;
        Array.from(anchors)
            .filter((link) => link.href.includes('/index.php/livre-1-les-temoins-de-la-foi/le-synaxaire/' + monthQuery + '/'))
            .forEach(async (link) => {
            if (unique.has(link.href))
                return;
            unique.add(link.href);
            console.log(link.href);
            let bodyText = await fetchURL(link.href);
            if (!bodyText)
                return console.log('bodyText is undefined = ', bodyText);
            let fetchedText = await (editTableCell(bodyText, i++, month));
            if (fetchedText)
                localStorage.fetchedText += fetchedText;
        });
    }
    ;
    async function fetchURL(url) {
        let response = await fetch(url);
        return await response.text();
    }
    ;
    async function editTableCell(bodyText, i, month) {
        let day = i.toString();
        if (i < 10)
            day = '0' + day;
        console.log('day=', day, ' and month =', month);
        table =
            ReadingsArrays.SynaxariumArray
                .filter(tbl => tbl[0][0].includes('&D=' + day + month))[0];
        console.log('table = ', table);
        if (!table || !table[1])
            return console.log('table is undefined', table);
        if (table.length === 2)
            table[1][1] = await getText(new DOMParser().parseFromString(bodyText, 'text/html'));
        else
            return await getText(new DOMParser().parseFromString(bodyText, 'text/html'));
    }
    async function getText(responseDoc) {
        textContainer = responseDoc.querySelector('.article-content');
        if (!textContainer || !textContainer.children || textContainer.children.length === 0)
            return console.log('no textContainer = ', textContainer);
        return textContainer.innerText;
    }
}
function sendHttpRequest(apiURL, responseDoc) {
    let request = new XMLHttpRequest();
    request.open('GET', apiURL);
    try {
        request.send();
    }
    catch (error) {
        console.log(error);
    }
    request.onload = async () => {
        if (request.status === 200) {
            responseDoc = new DOMParser()
                .parseFromString(request.response, 'text/html');
        }
        else {
            console.log('error status text = ', request.statusText);
            return request.statusText;
        }
    };
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxtQkFBbUIsR0FBZSxzQkFBc0IsRUFBRSxDQUFDO0FBRWpFOzs7R0FHRztBQUNILFNBQVMsbUJBQW1CLENBQUMsRUFBZTtJQUMxQyxJQUFJLElBQVksQ0FBQztJQUNqQixJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztJQUNmLHVGQUF1RjtJQUN2RixJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDcEMsK0NBQStDO1FBQy9DLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDN0Q7YUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUM5RCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVEO2FBQU07WUFDTCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdEQ7UUFDRCxFQUFFLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0RDtTQUFNLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUM3Qyxn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O1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07U0FDUDtRQUNEO1lBQ0UsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQO1FBQ0Q7WUFDRSxNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1NBQ1A7UUFDRDtZQUNFLE1BQU07WUFDTixNQUFN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QUFDLEtBQUs7UUFDZixLQUFLO1lBQ0gsWUFBWTtpQkFDVCxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUM7U0FDdEUsSUFBSSxPQUFPLENBQUMsVUFBVTtRQUMzQixLQUFLO1lBQ0wsWUFBWTtpQkFDVCxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDMUUsSUFBSSxPQUFPLENBQUMsUUFBUTtRQUN6QixLQUFLO1lBQ0wsWUFBWTtpQkFDVCxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDeEUsSUFBSSxPQUFPLENBQUMsUUFBUTtRQUN6QixLQUFLO1lBQ0wsWUFBWTtpQkFDVCxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFFN0UsSUFBSSxLQUFLO1FBQUUsT0FBTyxLQUFLLENBQUM7O1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ2pILENBQUM7QUFDRDs7OztHQUlHO0FBQ0gsU0FBUyxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsUUFBaUIsS0FBSztJQUMvRCxJQUFJLEtBQUssRUFBRTtRQUNULGFBQWEsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0tBQzlCO0lBRUQsYUFBYSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsdUNBQXVDLENBQUM7SUFDOUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0lBQzNDLGFBQWEsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO0lBRWhEOztPQUVHO0lBQ0gsQ0FBQyxTQUFTLGNBQWM7UUFDdEIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxLQUFLLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0MsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQy9CLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztRQUN4QixLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7UUFDM0IsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BDLENBQUMsQ0FBQyxjQUFjLENBQUM7WUFDakIsb0JBQW9CLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUNILGFBQWEsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNMLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLGtEQUFrRDtJQUN6RixhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBQ0Q7O0dBRUc7QUFDSCxTQUFTLG9CQUFvQjtJQUMzQixhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUM7SUFDL0MsYUFBYSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDN0IsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUVELFNBQVMsaUJBQWlCO0lBQ3hCLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6QyxJQUFJLEdBQWdCLENBQUM7SUFFckIsd0RBQXdEO0lBQ3hELFNBQVMsVUFBVTtRQUNqQixHQUFHLEdBQUcsZ0JBQWdCLENBQ3BCO1lBQ0EsR0FBRyxFQUFDLFFBQVE7WUFDWixJQUFJLEVBQUMsUUFBUTtZQUNiLFFBQVEsRUFBQyxhQUFhO1lBQ3RCLFNBQVMsRUFBQyxhQUFhO1lBQ3ZCLGFBQWEsRUFBQyxhQUFhO1lBQzNCLEVBQUUsRUFBRSxZQUFZO1lBQ2hCLE9BQU8sRUFBQztnQkFDTixLQUFLLEVBQUUsT0FBTztnQkFDZCxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQ2QsMEVBQTBFO29CQUMxRSxJQUFJLGNBQWMsQ0FBQztvQkFDbkIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7d0JBQ25ELG9EQUFvRDt3QkFDcEQsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUNuQixnREFBZ0Q7d0JBQ2hELGNBQWMsR0FBRyxDQUFDLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDO29CQUNILHFEQUFxRDtvQkFDckQsQ0FBQyxLQUFLLElBQUksRUFBRTt3QkFDVixNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQzt3QkFDdkQsY0FBYyxDQUFDLE1BQU0sQ0FBQzt3QkFDdEIscUVBQXFFO3dCQUNyRSxPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7d0JBQ3RELDZDQUE2Qzt3QkFDN0MsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sY0FBYyxDQUFDLFVBQVUsQ0FBQzt3QkFDcEQsK0RBQStEO3dCQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxPQUFPLEVBQUUsQ0FBQyxDQUFDO3dCQUMvRCwrREFBK0Q7d0JBQy9ELGNBQWMsR0FBRyxJQUFJLENBQUM7b0JBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ0wsU0FBUyxpQkFBaUI7d0JBQ3hCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQ3BDLDRCQUE0QixDQUM3QixDQUFDLE9BQU8sQ0FBQzt3QkFDVixJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7NEJBQ2xELE9BQU8sS0FBSyxDQUFDOzRCQUNiLFlBQVk7eUJBQ2I7NkJBQU0sSUFBSSxTQUFTLENBQUMsVUFBVSxJQUFJLFlBQVksRUFBRTs0QkFDL0MsT0FBTyxZQUFZLENBQUM7eUJBQ3JCO3dCQUNELE9BQU8sU0FBUyxDQUFDO29CQUNuQixDQUFDO2dCQUNILENBQUM7YUFDQTtTQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFBQSxDQUFDO0lBRUYsdUJBQXVCO0lBQ3ZCLENBQUMsU0FBUyxjQUFjO1FBQ3RCLElBQUksVUFBVSxHQUFxQixnQkFBZ0IsQ0FDakQ7WUFDQSxHQUFHLEVBQUMsT0FBTztZQUNYLGFBQWEsRUFBQyxhQUFhO1lBQzNCLEVBQUUsRUFBRSxZQUFZO1lBQ2hCLElBQUksRUFBQyxNQUFNO1lBQ1gsT0FBTyxFQUNMO2dCQUNBLEtBQUssRUFBRSxRQUFRO2dCQUNmLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQzNEO1NBQ0YsQ0FDa0IsQ0FBQztRQUN0QixVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2RCxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztJQUMvQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsb0NBQW9DO0lBQ3BDLENBQUMsS0FBSyxVQUFVLHVCQUF1QjtRQUNyQyxJQUFJLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxvQkFBb0IsRUFBRSxFQUFDLEVBQUUsRUFBQyxrQ0FBa0MsRUFBRSxFQUFFLEVBQUMsb0NBQW9DLEVBQUUsRUFBRSxFQUFDLGtDQUFrQyxFQUFDLENBQUMsQ0FBQztRQUN2TCxHQUFHLEdBQUcsZ0JBQWdCLENBQ3BCO1lBQ0EsR0FBRyxFQUFDLFFBQVE7WUFDWixJQUFJLEVBQUMsUUFBUTtZQUNiLFFBQVEsRUFBQyxhQUFhO1lBQ3RCLFNBQVMsRUFBQyxpQkFBaUI7WUFDM0IsYUFBYSxFQUFDLGFBQWE7WUFDM0IsRUFBRSxFQUFDLFNBQVM7WUFDWixJQUFJLEVBQUMsUUFBUTtZQUNiLE9BQU8sRUFDUDtnQkFDRSxLQUFLLEVBQUUsT0FBTztnQkFDZCxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzFDO1NBQ0YsQ0FDQSxDQUFDO1FBQ0YsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsR0FBRyxHQUFHLGdCQUFnQixDQUNwQjtZQUNBLEdBQUcsRUFBQyxRQUFRO1lBQ1osSUFBSSxFQUFDLFFBQVE7WUFDYixRQUFRLEVBQUMsYUFBYTtZQUN0QixTQUFTLEVBQUMscUJBQXFCO1lBQy9CLGFBQWEsRUFBQyxhQUFhO1lBQzNCLEVBQUUsRUFBQyxhQUFhO1lBQ2hCLElBQUksRUFBQyxRQUFRO1lBQ1gsT0FBTyxFQUNMO2dCQUNFLEtBQUssRUFBRSxPQUFPO2dCQUNoQixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQzNDO1NBQ0YsQ0FBQyxDQUFDO1FBQ0wsYUFBYSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRywwQkFBMEIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkYsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsU0FBUyxRQUFRLENBQUMsT0FBbUI7WUFDbkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsYUFBYSxDQUFDO1FBQ2hELENBQUM7UUFBQSxDQUFDO0lBRUosQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVMLENBQUMsU0FBUyxxQkFBcUI7UUFDN0IsSUFBSSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxFQUFFLEVBQUMsMkJBQTJCLEVBQUUsRUFBRSxFQUFFLDZCQUE2QixFQUFFLEVBQUUsRUFBRSxxQ0FBcUMsRUFBQyxDQUFFLENBQUM7UUFDM0ssSUFBSSxLQUFLLEdBQUcsZ0JBQWdCLENBQUM7WUFDM0IsR0FBRyxFQUFFLE9BQU87WUFDWixhQUFhLEVBQUMsYUFBYTtZQUMzQixFQUFFLEVBQUUsV0FBVztTQUNoQixDQUFxQixDQUFDO1FBQ3ZCLElBQUksUUFBUSxHQUF3QixjQUFjLEVBQUUsQ0FBQztRQUNyRCxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM3RSxLQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUNyQixLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsS0FBSyxDQUFDLEVBQUUsR0FBRyxlQUFlLENBQUM7UUFDM0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDbEIsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFFbEIsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUN4RyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNuQixLQUFLLENBQUMsUUFBUSxHQUFHLEdBQUcsRUFBRTtZQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQWUsQ0FBQyxDQUFBO1FBQ3BDLENBQUMsQ0FBQztRQUVGLFNBQVMsY0FBYztZQUN2QixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEMsS0FBSSxJQUFJLENBQUMsR0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLElBQUUsR0FBRyxFQUFDO2dCQUN6QixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQTthQUN6QjtZQUFBLENBQUM7WUFDRixPQUFPLElBQUksQ0FBQTtRQUNYLENBQUM7SUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBR0gsMENBQTBDO0lBQzFDLENBQUMsS0FBSyxVQUFVLDRCQUE0QjtRQUFJLENBQUM7UUFDL0MsSUFBSSxLQUFLLEdBQUc7WUFDVixDQUFDLElBQUksRUFBRSxTQUFTLENBQUM7WUFDakIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDO1lBQ2xCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQztZQUNqQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7WUFDakIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO1NBQ3JCLENBQUM7UUFFRixJQUFJLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLEVBQUMsRUFBRSxFQUFDLHFDQUFxQyxFQUFFLEVBQUUsRUFBRSxtQ0FBbUMsRUFBRSxFQUFFLEVBQUUsNkJBQTZCLEVBQUMsQ0FBQyxDQUFDO1FBRTFMLElBQUksb0JBQW9CLEdBQUUsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsRUFBQyxFQUFFLEVBQUMsK0JBQStCLEVBQUUsRUFBRSxFQUFFLCtDQUErQyxFQUFFLEVBQUUsRUFBRSw2QkFBNkIsRUFBQyxDQUFDLENBQUM7UUFFL0wsSUFBSSxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLEVBQUUsRUFBQyxrREFBa0QsRUFBRSxFQUFFLEVBQUUsOEVBQThFLEVBQUUsRUFBRSxFQUFFLG9DQUFvQyxFQUFDLENBQUMsQ0FBQztRQUV2UCxZQUFZLENBQUM7WUFDWCxhQUFhLEVBQUUsb0JBQW9CO1lBQ25DLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsS0FBSyxFQUFDLENBQUM7U0FDUixDQUFDLENBQUM7UUFFSCxZQUFZLENBQUM7WUFDWCxhQUFhLEVBQUUsb0JBQW9CO1lBQ25DLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsS0FBSyxFQUFDLENBQUM7U0FDUixDQUFDLENBQUM7UUFFSCxZQUFZLENBQUM7WUFDWCxhQUFhLEVBQUUsbUJBQW1CO1lBQ2xDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxLQUFLLEVBQUMsQ0FBQztTQUNSLENBQUMsQ0FBQztRQUdIOzs7V0FHRztRQUNILFNBQVMsV0FBVyxDQUFDLElBQVcsRUFBRSxLQUFZO1lBQzVDLElBQUksTUFBTSxHQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdELElBQUksS0FBSyxHQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBQztnQkFDNUMsb1RBQW9UO2dCQUNwVCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDO2FBQzNCO2lCQUNJLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBQztnQkFDckQsT0FBTyxLQUFLLENBQUMsa0dBQWtHLENBQUMsQ0FBQTthQUNqSDtpQkFDSSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNsRSw0U0FBNFM7Z0JBQzdTLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDdEI7aUJBQ0ksSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNuRSxPQUFPLEtBQUssQ0FBQyxpSEFBaUgsQ0FBRSxDQUFBO2FBQ2xJO2lCQUNJLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDakQsaVBBQWlQO2dCQUNsUCxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUN0QixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO2FBQ3RCO2lCQUNJLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2pDLDZHQUE2RztnQkFDN0csTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQzthQUN0QjtZQUFBLENBQUM7WUFFRixlQUFlLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLGVBQWUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsY0FBYyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUczQixZQUFZLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVELFNBQVMsWUFBWSxDQUFDLElBQzhEO1lBQ3BGLElBQUksTUFBbUIsQ0FBQztZQUN0QixJQUFJLENBQUMsWUFBWTtpQkFDaEIsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ2QsTUFBTSxHQUFHLGdCQUFnQixDQUN2QjtvQkFDQSxHQUFHLEVBQUMsUUFBUTtvQkFDWixJQUFJLEVBQUMsUUFBUTtvQkFDYixRQUFRLEVBQUMsYUFBYTtvQkFDdEIsU0FBUyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLGFBQWEsRUFBQyxJQUFJLENBQUMsYUFBYTtvQkFDaEMsRUFBRSxFQUFDLFVBQVU7b0JBQ1gsT0FBTyxFQUNQO3dCQUNBLEtBQUssRUFBRSxPQUFPO3dCQUNkLEdBQUcsRUFBRSxHQUFHLEVBQUU7NEJBQ1IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDbEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQ3RDLG1GQUFtRjs0QkFDbkYsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFO2dDQUN6QixxQ0FBcUM7Z0NBQ3JDLHlCQUF5QixDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0NBQzdDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxzQ0FBc0M7NkJBQzVEO3dCQUNILENBQUM7cUJBQ0Y7aUJBQ0YsQ0FDQSxDQUFDO2dCQUNGLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBRSwyR0FBMkc7WUFDcE4sQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25HLENBQUM7SUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRU4sQ0FBRSxLQUFLLFVBQVUscUJBQXFCO1FBQ25DLElBQUksYUFBYSxHQUFHLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLEVBQUMsRUFBRSxFQUFDLGdEQUFnRCxFQUFFLEVBQUUsRUFBRSw4QkFBOEIsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUMsQ0FBQyxDQUFDO1FBQ3BMLE1BQU07YUFDSCxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNkLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxhQUFhO2dCQUFFLE9BQU8sQ0FBQywrRkFBK0Y7WUFDdkksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUM5RCxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRSxDQUM5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBWSxDQUFDO1lBQ25CLEdBQUcsR0FBRyxnQkFBZ0IsQ0FDcEIsRUFBQyxHQUFHLEVBQUMsUUFBUTtnQkFDYixJQUFJLEVBQUMsUUFBUTtnQkFDYixRQUFRLEVBQUMsYUFBYTtnQkFDdEIsU0FBUyxFQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7Z0JBQ2hDLGFBQWEsRUFBQyxhQUFhO2dCQUMzQixFQUFFLEVBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ1gsSUFBSSxFQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNiLE9BQU8sRUFBQztvQkFDTixLQUFLLEVBQUUsT0FBTztvQkFDZCxHQUFHLEVBQUUsR0FBRyxFQUFFO3dCQUNSLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQzt3QkFDYixVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQzlELEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUNuQyxzRkFBc0Y7d0JBQ3RGLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxVQUFVLEVBQUU7NEJBQzNCLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN6RCxJQUFJLENBQUM7eUJBQ1IsQ0FBQyxzREFBc0Q7d0JBQ3hELFlBQVksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLHdDQUF3Qzt3QkFDOUYsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFOzRCQUN6QixnREFBZ0Q7NEJBQ2hELHlCQUF5QixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxnSkFBZ0o7NEJBQzlMLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxzQ0FBc0M7eUJBQzVEO29CQUNILENBQUM7aUJBQ0E7YUFDRixDQUNGLENBQUM7WUFDRixJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7Z0JBQ2xCLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ2pDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxhQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLDBCQUEwQixDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsQ0FBQyxLQUFLLFVBQVUsbUJBQW1CO1FBQ2pDLElBQUksYUFBYSxHQUFFLG1CQUFtQixDQUFDLG1CQUFtQixFQUFFLEVBQUMsRUFBRSxFQUFDLGtCQUFrQixFQUFFLEVBQUUsRUFBRSw4QkFBOEIsRUFBRSxFQUFFLEVBQUUseUJBQXlCLEVBQUMsQ0FBQyxDQUFDO1FBRXhKLGFBQWEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekMsWUFBWTthQUNULEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ2QsR0FBRyxHQUFHLGdCQUFnQixDQUNwQixFQUFDLEdBQUcsRUFBQyxRQUFRO2dCQUNiLElBQUksRUFBQyxRQUFRO2dCQUNiLFFBQVEsRUFBQyxhQUFhO2dCQUN0QixTQUFTLEVBQUMsSUFBSSxHQUFHLGVBQWU7Z0JBQ2hDLGFBQWEsRUFBQyxhQUFhO2dCQUMzQixFQUFFLEVBQUMsSUFBSTtnQkFDUCxPQUFPLEVBQUM7b0JBQ04sS0FBSyxFQUFFLE9BQU87b0JBQ2QsR0FBRyxFQUFFLEdBQUcsRUFBRTt3QkFDUixJQUFJLFlBQVksQ0FBQyxXQUFXLEtBQUssSUFBSSxFQUFFOzRCQUNyQyxZQUFZLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzs0QkFDaEMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0NBQzdDLEdBQUcsQ0FBQyxFQUFFLEtBQUssWUFBWSxDQUFDLFdBQVc7b0NBQ2pDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7b0NBQ2pDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQzs0QkFDekMsQ0FBQyxDQUFDLENBQUM7eUJBQ0o7b0JBQ0gsQ0FBQztpQkFDQTthQUNGLENBQ0YsQ0FBQztZQUNGLElBQUksSUFBSSxLQUFLLFlBQVksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ2pDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxhQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLDBCQUEwQixDQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsQ0FBQztJQUN4RixDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ0wsQ0FBQyxLQUFLLFVBQVUsa0JBQWtCO1FBQ2hDLElBQUksWUFBWSxDQUFDLFdBQVcsSUFBSSxNQUFNO1lBQUUsT0FBTztRQUMvQyxJQUFJLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxFQUFFLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFL0gsYUFBYSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN6QyxHQUFHLEdBQUcsZ0JBQWdCLENBQUM7WUFDckIsR0FBRyxFQUFDLFFBQVE7WUFDWixJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBQyxhQUFhO1lBQ3RCLFNBQVMsRUFBQyxjQUFjO1lBQ3hCLGFBQWEsRUFBRSxhQUFhO1lBQzVCLEVBQUUsRUFBRSxhQUFhLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUU7WUFDdkQsT0FBTyxFQUFDO2dCQUNOLEtBQUssRUFBRSxPQUFPO2dCQUNkLEdBQUcsRUFBRSxHQUFHLEVBQUU7b0JBQ1IsWUFBWTtvQkFDWixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7d0JBQUUsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxtREFBbUQ7b0JBQ3JHLFlBQVksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO29CQUM1QixZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7b0JBQzFDLElBQUksUUFBUSxHQUFHO3dCQUNiLHNCQUFzQjt3QkFDdEIsVUFBVTt3QkFDVixvQ0FBb0M7d0JBQ3BDLGtCQUFrQjt3QkFDbEIsY0FBYzt3QkFDZCxnQ0FBZ0M7d0JBQ2hDLGdDQUFnQzt3QkFDaEMsaUNBQWlDO3dCQUNqQyxtQ0FBbUM7d0JBQ25DLGdDQUFnQzt3QkFDaEMsNEJBQTRCO3dCQUM1QixvQ0FBb0M7d0JBQ3BDLDRCQUE0Qjt3QkFDNUIsZ0NBQWdDO3FCQUNqQyxDQUFDO29CQUNGLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQzNDLE1BQXlCLENBQUM7b0JBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztvQkFDdkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO29CQUM3QixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7d0JBQ3hCLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUMxQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzt3QkFDeEIsTUFBTSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7d0JBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDO29CQUNILFFBQVE7eUJBQ0wsY0FBYyxDQUFDLFNBQVMsQ0FBQzt5QkFDekIscUJBQXFCLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUM3QyxvQkFBb0IsRUFBRSxDQUFDO29CQUN2QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUNyQyxnQkFBZ0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUNyQyxDQUFDO2dCQUNKLENBQUM7YUFDRjtTQUFDLENBQ0gsQ0FBQztRQUNGLGFBQWEsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsMEJBQTBCLENBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTCxTQUFTLG1CQUFtQixDQUFDLEVBQVUsRUFBRSxTQUFpRDtRQUN4RixJQUFJLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELGFBQWEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUNyQyx1REFBdUQ7UUFDdkQsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3RDLGFBQWEsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztRQUM1QyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7UUFDM0MsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO1FBQzFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN6QyxhQUFhLENBQUMscUJBQXFCLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzlELElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDN0MsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUU1QixJQUFJLGVBQWUsRUFBRTtZQUNuQixJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hELFlBQVksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3BELFNBQVMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDckM7UUFBQSxDQUFDO1FBQ0YsT0FBTyxhQUFhLENBQUE7SUFDdEIsQ0FBQztJQUFBLENBQUM7SUFHRixTQUFTLGdCQUFnQixDQUFDLElBV21CO1FBRTNDLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNyQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDYixHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDdEI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQ2hDO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pCLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUNYLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUNsQjtRQUNELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNiLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNwQztRQUNELElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFO1lBQzdCLFlBQVk7WUFDWixHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDdEI7UUFDRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDYixZQUFZO1lBQ1osR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQ3RCO1FBQ0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3hCLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7U0FDbEQ7UUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLENBQUMsQ0FBQyxjQUFjLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUNELElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQztRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELGtDQUFrQztJQUNsQyxDQUFDLEtBQUssVUFBVSxhQUFhO1FBQzNCLElBQUksYUFBYSxHQUFHLG1CQUFtQixDQUFDLFlBQVksRUFBRSxFQUFDLEVBQUUsRUFBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUM7UUFDekgsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFBO1FBQ3pDLE1BQU07YUFDSCxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNiLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxhQUFhO2dCQUFFLE9BQU87WUFDekMsSUFBSSxNQUFNLEdBQUcsZ0JBQWdCLENBQzVCO2dCQUNDLEdBQUcsRUFBQyxRQUFRO2dCQUNaLFFBQVEsRUFBQyxVQUFVO2dCQUNuQixhQUFhLEVBQUMsYUFBYTtnQkFDM0IsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLEdBQUcsT0FBTzthQUNyQixDQUNGLENBQUM7WUFDRixLQUFLLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRTtnQkFDckIsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEMsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDO29CQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxhQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLDBCQUEwQixDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ0wsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLFdBQVcsQ0FBQyxJQUFXO0lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQUUsT0FBTztJQUMxQixJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBZ0IsQ0FBQztJQUNoRSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0MsWUFBWSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDL0IsQ0FBQztBQUFBLENBQUM7QUFFRjs7Ozs7R0FLRztBQUNILFNBQVMsMEJBQTBCLENBQUMsYUFBeUIsRUFBRSxHQUFXLEVBQUUsS0FBYTtJQUN2RixJQUFJLEtBQWEsQ0FBQztJQUNsQixLQUFLLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7SUFDdEMsSUFBSSxHQUFHLElBQUksS0FBSyxHQUFHLEdBQUc7UUFBRSxLQUFLLEdBQUcsR0FBRyxDQUFDO1NBQy9CLElBQUksS0FBSztRQUFFLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDOUIsT0FBTyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN4RCxDQUFDO0FBQUEsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILFNBQVMsc0NBQXNDLENBQUMsSUFJSjtJQUUxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07UUFBRSxPQUFPO0lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztRQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0lBRW5ELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUMvQixJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU87UUFDekMsT0FBTyxXQUFXLENBQUM7WUFDakIsU0FBUyxFQUFFLEtBQUs7WUFDaEIsUUFBUSxFQUFDLElBQUksQ0FBQyxRQUFRO1lBQ3RCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixpQkFBaUIsRUFBQyxLQUFLO1lBQ3ZCLGlCQUFpQixFQUFDLEtBQUs7U0FDeEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsS0FBSyxVQUFVLHdCQUF3QixDQUNyQyxJQUFjLEVBQ2QsUUFBNEQsRUFDNUQsZUFBdUI7SUFFdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhO1FBQUUsUUFBUSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDcEUsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxHQUFHLENBQUMsRUFBRSxHQUFHLGVBQWUsQ0FBQztJQUN6QixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoQyxJQUFJO1NBQ0QsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDWCxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEQsUUFBUSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9ELEdBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsMEJBQTBCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFHRDs7R0FFRztBQUNILFNBQVMsc0JBQXNCO0lBQzdCLElBQUksa0JBQWtCLENBQUM7SUFDdkIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDbEQsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUNqQixrQkFBa0IsR0FBRyxDQUFDLENBQUM7UUFDdkIsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFO0lBQ0YsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzQyxZQUFZO0lBQ1osSUFBSSxNQUFNLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2pFLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ2pDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNuRCxjQUFjO0lBQ2QsS0FBSyxDQUFDLDhEQUE4RCxDQUFDLENBQUM7QUFDeEUsQ0FBQztBQUVELEtBQUssVUFBVSxxQkFBcUI7SUFDbEMsNEhBQTRIO0lBQzVILElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLFlBQVksQ0FBQyxDQUFDOztRQUN2RixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUMvRCxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBRSxPQUFPO1FBQ3RDLHVIQUF1SDtRQUN2SCxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQy9DLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDOUM7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3JELGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbkQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3BELGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbEQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3ZELGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDckQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3JELGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbkQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3BELGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbEQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3BELGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbEQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3ZELGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0M7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3JELGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0M7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0M7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ25ELGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3ZELGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3RELGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3hELGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2xELGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3JELGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMs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d0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsQ0FBQztRQUNMLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsQ0FBQztRQUNMLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsQ0FBQztRQUNMLEtBQUssRUFDSCx3RUFBd0U7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsQ0FBQztRQUNMLEtBQUssRUFDSCxzRkFBc0Y7UUFDeEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsQ0FBQztRQUNMLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsQ0FBQztRQUNMLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsQ0FBQztRQUNMLEtBQUssRUFDSCwrRUFBK0U7UUFDakYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsQ0FBQztRQUNMLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwyQkFBMkI7UUFDbEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCxvRkFBb0Y7UUFDdEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCwyRkFBMkY7UUFDN0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCwrRUFBK0U7UUFDakYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxpQ0FBaUM7UUFDeEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCxpRkFBaUY7UUFDbkYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCxnRkFBZ0Y7UUFDbEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxrRUFBa0U7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxpQ0FBaUM7UUFDeEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCwyRkFBMkY7UUFDN0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxvRUFBb0U7UUFDM0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw4REFBOEQ7UUFDckUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCw4RkFBOEY7UUFDaEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxtRUFBbUU7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCwyRUFBMkU7UUFDN0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCw4RkFBOEY7UUFDaEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCxtR0FBbUc7UUFDckcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCxxR0FBcUc7UUFDdkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFDSCwyRkFBMkY7UUFDN0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsRUFBRTtRQUNOLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwwRUFBMEU7UUFDNUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RUFBdUU7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpR0FBaUc7UUFDbkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtRUFBbUU7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3REFBd0Q7UUFDL0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpQ0FBaUM7UUFDeEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RkFBdUY7UUFDekYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4REFBOEQ7UUFDckUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4REFBOEQ7UUFDckUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxtRkFBbUY7UUFDckYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtRUFBbUU7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwyRkFBMkY7UUFDN0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxxUUFBcVE7UUFDdlEsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw0RUFBNEU7UUFDOUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtRUFBbUU7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RkFBeUY7UUFDM0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw2R0FBNkc7UUFDL0csSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvRUFBb0U7UUFDM0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwrRUFBK0U7UUFDakYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw4RkFBOEY7UUFDaEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpRkFBaUY7UUFDbkYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwyRkFBMkY7UUFDN0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpRUFBaUU7UUFDeEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnRUFBZ0U7UUFDdkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RUFBd0U7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0QkFBNEI7UUFDbkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwrRUFBK0U7UUFDakYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrRUFBa0U7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RUFBdUU7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxxRkFBcUY7UUFDdkYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrRUFBa0U7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxzRkFBc0Y7UUFDeEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnRUFBZ0U7UUFDdkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RUFBd0U7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxzSUFBc0k7UUFDeEksSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwwRkFBMEY7UUFDNUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RkFBdUY7UUFDekYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpSEFBaUg7UUFDbkgsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw2RUFBNkU7UUFDL0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw2RkFBNkY7UUFDL0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0QkFBNEI7UUFDbkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwyRUFBMkU7UUFDN0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxnRkFBZ0Y7UUFDbEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RkFBeUY7UUFDM0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtRUFBbUU7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RkFBdUY7UUFDekYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwwRkFBMEY7UUFDNUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwwRkFBMEY7UUFDNUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RkFBeUY7UUFDM0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw0RkFBNEY7UUFDOUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RkFBeUY7UUFDM0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwwRkFBMEY7UUFDNUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4REFBOEQ7UUFDckUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RUFBdUU7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxvR0FBb0c7UUFDdEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpQ0FBaUM7UUFDeEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RUFBeUU7UUFDM0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwyRUFBMkU7UUFDN0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrRUFBa0U7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrRUFBa0U7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4REFBOEQ7UUFDckUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw2RUFBNkU7UUFDL0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxzRkFBc0Y7UUFDeEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4REFBOEQ7UUFDckUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RkFBeUY7UUFDM0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpQ0FBaUM7UUFDeEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxxR0FBcUc7UUFDdkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxvR0FBb0c7UUFDdEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxxR0FBcUc7UUFDdkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RUFBeUU7UUFDM0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxxR0FBcUc7UUFDdkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrRkFBa0Y7UUFDcEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxxRUFBcUU7UUFDdkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxtR0FBbUc7UUFDckcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3REFBd0Q7UUFDL0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxnR0FBZ0c7UUFDbEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxxRUFBcUU7UUFDdkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpR0FBaUc7UUFDbkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw4RkFBOEY7UUFDaEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtRUFBbUU7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RUFBdUU7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxzRUFBc0U7UUFDeEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxvRkFBb0Y7UUFDdEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4REFBOEQ7UUFDckUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxvR0FBb0c7UUFDdEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RkFBeUY7UUFDM0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpR0FBaUc7UUFDbkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw4R0FBOEc7UUFDaEgsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrRkFBa0Y7UUFDcEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpR0FBaUc7UUFDbkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwwRkFBMEY7UUFDNUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw4RUFBOEU7UUFDaEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw0RkFBNEY7UUFDOUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw0RUFBNEU7UUFDOUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnRUFBZ0U7UUFDdkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw0RkFBNEY7UUFDOUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxtR0FBbUc7UUFDckcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RkFBeUY7UUFDM0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxnR0FBZ0c7UUFDbEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxnR0FBZ0c7UUFDbEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtRUFBbUU7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxtR0FBbUc7UUFDckcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwrRkFBK0Y7UUFDakcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpR0FBaUc7UUFDbkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpRkFBaUY7UUFDbkYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3R0FBd0c7UUFDMUcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3RkFBd0Y7UUFDMUYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwwRUFBMEU7UUFDNUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrRkFBa0Y7UUFDcEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvRUFBb0U7UUFDM0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw4RkFBOEY7UUFDaEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RkFBdUY7UUFDekYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxnR0FBZ0c7UUFDbEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpR0FBaUc7UUFDbkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtRUFBbUU7UUFDMUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwwRUFBMEU7UUFDNUUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0QkFBNEI7UUFDbkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RUFBdUU7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpR0FBaUc7UUFDbkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw4RkFBOEY7UUFDaEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwrRkFBK0Y7UUFDakcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxvR0FBb0c7UUFDdEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxnR0FBZ0c7UUFDbEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxtSkFBbUo7UUFDckosSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw2RUFBNkU7UUFDL0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1R0FBdUc7UUFDekcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4REFBOEQ7UUFDckUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvRUFBb0U7UUFDM0UsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RkFBeUY7UUFDM0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxnR0FBZ0c7UUFDbEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxzR0FBc0c7UUFDeEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5REFBeUQ7UUFDaEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx5RkFBeUY7UUFDM0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxtR0FBbUc7UUFDckcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FB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QUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwyR0FBMkc7UUFDN0csSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3REFBd0Q7UUFDL0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx1RUFBdUU7UUFDekUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw4RkFBOEY7UUFDaEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpRUFBaUU7UUFDeEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpRkFBaUY7UUFDbkYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxzRkFBc0Y7UUFDeEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxtRkFBbUY7UUFDckYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4REFBOEQ7UUFDckUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpR0FBaUc7UUFDbkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCwrRkFBK0Y7UUFDakcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxnR0FBZ0c7UUFDbEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw4RkFBOEY7UUFDaEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrREFBK0Q7UUFDdEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpQ0FBaUM7UUFDeEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxvRkFBb0Y7UUFDdEYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwREFBMEQ7UUFDakUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3REFBd0Q7UUFDL0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0REFBNEQ7UUFDbkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxnR0FBZ0c7UUFDbEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpRUFBaUU7UUFDeEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpRkFBaUY7UUFDbkYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw2RkFBNkY7UUFDL0YsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpQ0FBaUM7UUFDeEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxxR0FBcUc7UUFDdkcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2REFBNkQ7UUFDcEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxpRkFBaUY7UUFDbkYsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvREFBb0Q7UUFDM0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxxRUFBcUU7UUFDdkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpRUFBaUU7UUFDeEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxpQ0FBaUM7UUFDeEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwwQ0FBMEM7UUFDakQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCw4RkFBOEY7UUFDaEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxvR0FBb0c7UUFDdEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxREFBcUQ7UUFDNUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnRUFBZ0U7UUFDdkUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0QkFBNEI7UUFDbkMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQ0FBMkM7UUFDbEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCx3R0FBd0c7UUFDMUcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtREFBbUQ7UUFDMUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxnREFBZ0Q7UUFDdkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx5Q0FBeUM7UUFDaEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrREFBa0Q7UUFDekQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxzREFBc0Q7UUFDN0QsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLEVBQUU7UUFDUCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwrQ0FBK0M7UUFDdEQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyQkFBMkI7UUFDbEMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxxQ0FBcUM7UUFDNUMsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFDSCxrR0FBa0c7UUFDcEcsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSxvQ0FBb0M7UUFDM0MsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLEtBQUssRUFBRSwyREFBMkQ7UUFDbEUsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsRUFBRTtRQUNULFFBQVEsRUFBRSxLQUFLO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixLQUFLLEVBQUUsRUFBRTtLQUNWO0NBQ0YsQ0FBQyJ9