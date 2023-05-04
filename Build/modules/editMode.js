let sequence = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param tblsArray
 */
async function editingMode(tblsArray) {
    let languages = prayersLanguages;
    if (tblsArray[0][0][0].startsWith(Prefix.stPaul)
        || tblsArray[0][0][0].startsWith(Prefix.katholikon)
        || tblsArray[0][0][0].startsWith(Prefix.praxis)
        || tblsArray[0][0][0].startsWith(Prefix.gospelDawn)
        || tblsArray[0][0][0].startsWith(Prefix.gospelVespers)
        || tblsArray[0][0][0].startsWith(Prefix.gospelMass)
        || tblsArray[0][0][0].startsWith(Prefix.gospelNight)
        || tblsArray[0][0][0].startsWith(Prefix.propheciesDawn))
        languages = readingsLanguages;
    if (tblsArray[0][0][0].startsWith(Prefix.synaxarium))
        languages = ['AR', 'FR'];
    //@ts-ignore
    if (!console.save)
        addConsoleSaveMethod(console); //We are adding a save method to the console object
    let el;
    containerDiv.innerHTML = ""; //we empty the containerDiv
    tblsArray.map(
    //We will create html elements (rows) for each element in each table in the tblsArray
    (table) => {
        for (let i = 0; i < table.length; i++) {
            el = createHtmlElementForPrayerEditingMode(table[i][0], table[i], languages, allLanguages, table[i][0].split("&C=")[1], containerDiv, i);
            if (el) {
                //We make the paragraph children of each row, editable
                Array.from(el.children).map((c) => (c.contentEditable = "true"));
            }
        }
    });
    //We add the editing buttons
    addEdintingButtons();
    //Setting the CSS of the newly added rows
    setCSSGridTemplate(containerDiv.querySelectorAll("div.TargetRow"));
    //Showing the titles in the right side-bar
    showTitlesInRightSideBar(containerDiv.querySelectorAll("div.TargetRowTitle"), rightSideBar.querySelector("#sideBarBtns"), btnBookOfHours, true);
}
/**
 * Adds the editing buttons as an appeded div to each html div (row) displayed
 * @param {HTMLElement} el - the div representing a row in the table
 */
function addEdintingButtons() {
    let btnsDiv = document.createElement("div");
    let newButton;
    btnsDiv.classList.add("btnsDiv");
    btnsDiv.style.display = "grid";
    btnsDiv.style.gridTemplateColumns = String("33%").repeat(3);
    btnsDiv.style.top = '10px';
    btnsDiv.style.width = '80%';
    btnsDiv.style.justifySelf = 'center !important';
    btnsDiv.style.justifyItems = 'stretch';
    btnsDiv.style.position = 'fixed';
    containerDiv.children[0].insertAdjacentElement('beforebegin', btnsDiv);
    //Add new row button
    newButton = createEditingButton(() => addNewRow(document.getSelection().focusNode.parentElement), "Add Row");
    btnsDiv.appendChild(newButton);
    //Save Modified Array to Local Storage
    newButton = createEditingButton(() => saveModifiedArray(), "Save");
    btnsDiv.appendChild(newButton);
    //Export Modified Array  to a JS file
    //@ts-ignore
    newButton = createEditingButton(() => console.save(saveModifiedArray(), 'ModifiedArray.js'), "Export");
    btnsDiv.appendChild(newButton);
    //Modify The Title
    newButton = createEditingButton(() => changeTitle(document.getSelection().focusNode.parentElement), "Ttile");
    btnsDiv.appendChild(newButton);
    //Modify The Css Class
    newButton = createEditingButton(() => changeCssClass(document.getSelection().focusNode.parentElement), "Class");
    btnsDiv.appendChild(newButton);
    //Delete row
    newButton = createEditingButton(() => deleteRow(document.getSelection().focusNode.parentElement), "Delete");
    btnsDiv.appendChild(newButton);
    //Add table to sequence
    newButton = createEditingButton(() => addTableToSequence(document.getSelection().focusNode.parentElement), "Add To Sequence");
    btnsDiv.appendChild(newButton);
    //Export Sequence
    newButton = createEditingButton(() => exportSequence(), "Export Sequence");
    btnsDiv.appendChild(newButton);
    newButton = createEditingButton(() => splitParagraphsToTheRowsBelow(), "Split Below");
    btnsDiv.appendChild(newButton);
}
/**
 * Deletes an html div (row) from the DOM
 * @param {HTMLElement} htmlRow - the html div (or any html element), we want to delete
 * @returns
 */
function deleteRow(htmlParag) {
    htmlParag = checkSelection(htmlParag);
    if (!htmlParag)
        return;
    let htmlRow = htmlParag.parentElement;
    if (confirm("Are you sure you want to delete this row?") == false)
        return; //We ask the user to confirm before deletion
    htmlRow.remove();
}
/**
 * Changes the 'actor' css class of a row
 * @param {HTMLElement} htmlRow - the div (row) for which we want to change the css class
 */
function changeCssClass(htmlParag) {
    htmlParag = checkSelection(htmlParag);
    if (!htmlParag)
        return;
    let htmlRow = htmlParag.parentElement;
    let className = htmlRow.dataset.root.split("&C=")[1];
    toggleClass(htmlRow, className);
    Array.from(htmlRow.children).forEach((element) => {
        toggleClass(element, className);
    });
    className = prompt("Provide The Title", htmlRow.dataset.root.split("&C=")[1]);
    htmlRow.dataset.root =
        htmlRow.dataset.root.split("&C=")[0] + "&C=" + className;
    if (className == "Title") {
        toggleClass(htmlRow, "TargetRowTitle");
    }
    else {
        toggleClass(htmlRow, className);
        Array.from(htmlRow.children).forEach((element) => {
            toggleClass(element, className);
        });
    }
}
function toggleClass(element, className) {
    element.classList.toggle(className);
}
function changeTitle(htmlParag) {
    htmlParag = checkSelection(htmlParag);
    if (!htmlParag)
        return;
    let htmlRow = htmlParag.parentElement;
    let title = prompt("Provide The Title", htmlRow.dataset.root);
    htmlRow.dataset.root = title;
    Array.from(htmlRow.children).forEach((child) => { if (child.tagName === 'P' && child.dataset.root)
        child.dataset.root = title; });
}
/**
 * Creates an html button, and adds
 * @param {Function} fun - the function that will be called when the button is clicked
 * @param {string} label - the label of the button
 * @returns {HTMLButtonElement} - the html button that was created
 */
function createEditingButton(fun, label) {
    let btnHtml = document.createElement('button');
    btnHtml.classList.add(inlineBtnClass);
    btnHtml.classList.add("btnEditing");
    btnHtml.innerText = label;
    btnHtml.addEventListener("click", () => fun());
    return btnHtml;
}
function saveModifiedArray() {
    let htmlRows = containerDiv.querySelectorAll(".TargetRow"), //we retriev all the divs with 'TargetRow' class from the DOM
    tableHtmlRows, table, updated = new Set(), newArray = [], title;
    Array.from(htmlRows).forEach(
    //for each 'TargetRow' div in containderDiv
    (htmlRow) => {
        title = baseTitle(htmlRow.dataset.root); //this is the title without '&C='
        if (!updated.has(title))
            updated.add(title); //if the table has already been added, its title will be in the updated[], we will escape the row since it has already been processed
    });
    updated.forEach((t) => processTable(t)); //for each title in the set, we will retrieve the text in arrays each representing a row
    function processTable(title) {
        newArray.push([]); //this is an emepty array for the table
        table = newArray[newArray.length - 1];
        containerDiv
            .querySelectorAll("div.TargetRow")
            .forEach((div) => {
            if (div.dataset.root.split("&C=")[0] === title.split("&C=")[0]) {
                //if the data-root of the div matches exactly the the title
                table
                    .push(Array.from(div.querySelectorAll("p"))
                    .map((p) => p.innerText));
                table[table.length - 1].unshift(div.dataset.root); //adding the title as 1st element to the row that we've just pushed to table
            }
        });
    }
    console.log("newArray = ", newArray);
    let text = replacePrefixes(newArray);
    localStorage.editedText = text;
    console.log(localStorage.editedText);
    return text;
}
function replacePrefixes(array) {
    //Open Array of Tables
    let text = "[";
    (function convertArrayToText() {
        array.forEach((table) => {
            processTable(table);
        });
    })();
    function processTable(table) {
        //open table array
        text += "[\n";
        table.forEach((row) => {
            processRow(row);
        });
        //close table
        text += "], \n";
    }
    function processRow(row) {
        //open row array
        text += "[\n";
        //loop row elements
        for (let i = 0; i < row.length; i++) {
            processStringElement(row[i], row);
        }
        //close row
        text += "], \n";
    }
    function processStringElement(element, row) {
        //for each string element in row[]
        element = element.replaceAll('"', '\\"'); //replacing '"" by '\"'
        if (row[0].endsWith("&C=Title"))
            element = element
                .replaceAll(String.fromCharCode(10134), "")
                .replaceAll(String.fromCharCode(10133), ""); //removing the+and - characters from the titles
        element = element.replaceAll('\n', '<br>');
        text += '"' + element + '", \n'; //adding the text of row[i](after being cleaned from the unwatted characters) to text
    }
    return replaceText(text) + "]";
}
function replaceText(text) {
    text = text.replaceAll('"' + Prefix.bookOfHours, 'Prefix.bookOfHours+"');
    text = text.replaceAll('"' + Prefix.commonDoxologies, 'Prefix.commonDoxologies+"');
    text = text.replaceAll('"' + Prefix.commonIncense, 'Prefix.commonIncense+"');
    text = text.replaceAll('"' + Prefix.commonPrayer, 'Prefix.commonPrayer+"');
    text = text.replaceAll('"' + Prefix.communion, 'Prefix.communion+"');
    text = text.replaceAll('"' + Prefix.cymbalVerses, 'Prefix.cymbalVerses+"');
    text = text.replaceAll('"' + Prefix.fractionPrayer, 'Prefix.fractionPrayer+"');
    text = text.replaceAll('"' + Prefix.gospelResponse, 'Prefix.gospelResponse+"');
    text = text.replaceAll('"' + Prefix.gospelVespers, 'Prefix.gospelVespers+"');
    text = text.replaceAll('"' + Prefix.incenseDawn, 'Prefix.incenseDawn+"');
    text = text.replaceAll('"' + Prefix.incenseVespers, 'Prefix.incenseVespers+"');
    text = text.replaceAll('"' + Prefix.massCommon, 'Prefix.massCommon+"');
    text = text.replaceAll('"' + Prefix.massStBasil, 'Prefix.massStBasil+"');
    text = text.replaceAll('"' + Prefix.massStCyril, 'Prefix.massStCyril+"');
    text = text.replaceAll('"' + Prefix.massStGregory, 'Prefix.massStGregory+"');
    text = text.replaceAll('"' + Prefix.massStJohn, 'Prefix.massStJohn+"');
    text = text.replaceAll('"' + Prefix.psalmResponse, 'Prefix.psalmResponse+"');
    text = text.replaceAll('"' + Prefix.praxisResponse, 'Prefix.praxisResponse+"');
    //Readings
    text = text.replaceAll('"' + Prefix.synaxarium, 'Prefix.synaxarium+"');
    text = text.replaceAll('"' + Prefix.stPaul, 'Prefix.stPaul+"');
    text = text.replaceAll('"' + Prefix.katholikon, 'Prefix.katholikon+"');
    text = text.replaceAll('"' + Prefix.praxis, 'Prefix.praxis+"');
    text = text.replaceAll('"' + Prefix.propheciesDawn, 'Prefix.propheciesDawn+"');
    text = text.replaceAll('"' + Prefix.gospelDawn, 'Prefix.Prefix.gospelDawn+"');
    text = text.replaceAll('"' + Prefix.gospelMass, 'Prefix.Prefix.gospelMass+"');
    text = text.replaceAll('"' + Prefix.gospelNight, 'Prefix.Prefix.gospelNight+"');
    text = text.replaceAll('"' + Prefix.gospelVespers, 'Prefix.Prefix.gospelVespers+"');
    //Seasonal 
    text = text.replaceAll(giaki.AR, '"+giaki.AR+"');
    text = text.replaceAll(giaki.FR, '"+giaki.FR+"');
    text = text.replaceAll(giaki.COP, '"+giaki.COP+"');
    text = text.replaceAll(giaki.CA, '"+giaki.CA+"');
    return text;
}
/**
 * Adds a new div (row) below the div (row) passed to it as argument.
 * @param {HTMLElement} row - the div (row) below which we will add a row
 * @param {string} dataRoot - a string representing the data-root value that will be givent to the new div (row) added. If missing, the user will be prompted to provide the dataRoot, with, as default value, the data-root value of 'row'
 */
function addNewRow(htmlParag, dataRoot) {
    htmlParag = checkSelection(htmlParag);
    if (!htmlParag)
        return;
    let row = htmlParag.parentElement;
    let newRow = document.createElement("div"), p, child;
    newRow.classList.add("TargetRow");
    newRow.dataset.isNewRow = "isNewRow";
    newRow.style.display = row.style.display;
    newRow.style.gridTemplateColumns = row.style.gridTemplateColumns;
    newRow.style.gridTemplateAreas = row.style.gridTemplateAreas;
    if (!dataRoot)
        dataRoot = prompt("Provide the Title of the new Row", row.dataset.root);
    newRow.dataset.root = dataRoot;
    newRow.classList.add(dataRoot.split("&C=")[1]);
    //newRow.contentEditable = 'true';
    for (let i = 0; i < row.children.length; i++) {
        child = row.children[i];
        if (!child.dataset.lang)
            continue;
        p = newRow.appendChild(document.createElement("p"));
        p.classList.add(child.dataset.lang);
        p.classList.add(newRow.dataset.root.split("&C=")[1]);
        //child.classList.forEach(className => p.classList.add(className));
        p.dataset.root = dataRoot;
        p.dataset.lang = child.dataset.lang;
        //p.innerText = "Insert Here Your Text "+p.dataset.lang;
        p.contentEditable = "true";
    }
    return row.insertAdjacentElement("afterend", newRow);
}
function createHtmlElementForPrayerEditingMode(firstElement, prayers, languagesArray, userLanguages, actorClass, position = containerDiv, rowIndex) {
    let row, p, lang, text;
    row = document.createElement("div");
    if (rowIndex)
        row.dataset.index = rowIndex.toString();
    row.classList.add("TargetRow"); //we add 'TargetRow' class to this div
    let dataRoot = firstElement;
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
        if (actorClass &&
            (actorClass == "Comment" || actorClass == "CommentText")) {
            //this means it is a comment
            x == 1 ? (lang = languagesArray[1]) : (lang = languagesArray[3]);
        }
        else {
            lang = languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
        } //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
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
        row.appendChild(p); //the row which is a <div></div>, will encapsulate a <p></p> element for each language in the 'prayer' array (i.e., it will have as many <p></p> elements as the number of elements in the 'prayer' array)
    }
    //@ts-ignore
    position.el
        ? //@ts-ignore
            position.el.insertAdjacentElement(position.beforeOrAfter, row)
        : //@ts-ignore
            position.appendChild(row);
    return row;
}
function getPrayersSequence() {
    let allRows = containerDiv.querySelectorAll(".TargetRow"), text = "[";
    allRows.forEach((row) => {
        //@ts-ignore
        text += row.dataset.root + ", \n";
    });
    text += "]";
    console.log(text);
}
function addTableToSequence(htmlParag) {
    htmlParag = checkSelection(htmlParag);
    if (!htmlParag)
        return;
    let htmlRow = htmlParag.parentElement;
    sequence.push(baseTitle(htmlRow.dataset.root));
    let result = prompt(sequence.join(", \n"), sequence.join(", \n"));
    sequence = result.split(", \n");
    if (document.getElementById("showSequence")) {
        let tableRows = Array.from(containerDiv.querySelectorAll(getDataRootSelector(baseTitle(htmlRow.dataset.root), true)));
        tableRows.forEach((row) => {
            createHtmlElementForPrayerEditingMode(row.dataset.root, Array.from(row.querySelectorAll("p")).map((p) => p.innerText), ["AR", foreingLanguage], ["AR", foreingLanguage], row.dataset.root.split("&C=")[1], document.getElementById("showSequence"));
        });
        setCSSGridTemplate(document.getElementById("showSequence").querySelectorAll(".TargetRow"));
    }
}
function exportSequence() {
    console.log(sequence);
    let empty = confirm("Do you want to empty the sequence?");
    if (empty)
        sequence = [];
}
function showSequence(sequenceArray = sequence, container = containerDiv) {
    let tableRows;
    let newDiv = document.createElement("div");
    document
        .getElementById("content")
        .insertAdjacentElement("beforebegin", newDiv);
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
            newDiv.remove();
        });
        newDiv.appendChild(close);
    })();
    newDiv.id = "showSequence";
    newDiv.style.backgroundColor = "white !important";
    newDiv.style.height = "50%";
    newDiv.style.width = "100%";
    newDiv.style.position = "fixed";
    newDiv.style.overflow = "auto";
    newDiv.style.zIndex = "3";
    sequenceArray.forEach((title) => {
        tableRows = container.querySelectorAll(getDataRootSelector(title, true));
        tableRows.forEach((row) => {
            createHtmlElementForPrayerEditingMode(row.dataset.root, Array.from(row.querySelectorAll("p")).map((p) => p.innerText), ["AR", foreingLanguage], ["AR", foreingLanguage], row.dataset.root.split("&C=")[1], newDiv);
        });
        setCSSGridTemplate(newDiv.querySelectorAll(".TargetRow"));
    });
}
/**
 * adds a 'save' method to console, which prints a data to a text or a json file
 */
function addConsoleSaveMethod(console) {
    console.save = function (data, filename) {
        if (!data) {
            console.error("Console.save: No data");
            return;
        }
        if (!filename)
            filename = "PrayersArrayModifiedd";
        if (typeof data === "object") {
            data = JSON.stringify(data, undefined, 4);
        }
        if (typeof data === "string") {
            data = data.replace("\\\\", "\\");
        }
        var blob = new Blob([data], { type: "text/json" }), e = document.createEvent("MouseEvents"), a = document.createElement("a");
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
        e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    };
}
function splitParagraphsToTheRowsBelow() {
    //Sometimes when copied, the text is inserted as a SPAN or a div, we will go up until we get the paragraph element itslef
    let htmlParag = checkSelection(document.getSelection().focusNode.parentElement);
    if (!htmlParag)
        return; //We check that we got a paragraph element
    let title = htmlParag.dataset.root, lang = htmlParag.dataset.lang, table = Array.from(containerDiv.querySelectorAll(getDataRootSelector(baseTitle(title), true))), //Those are all the rows belonging to the same table, including the title
    rowIndex = table.indexOf(htmlParag.parentElement);
    //We retrieve the paragraph containing the text
    let text = htmlParag.innerText;
    let splitted = text.split("\n");
    let clean = splitted.filter((t) => t != "");
    for (let i = 0; i < clean.length; i++) {
        if (!table[i + rowIndex]) {
            //if tables rows are less than the number of paragraphs in 'clean', we add a new row to the table, and we push the new row to table
            table.push(addNewRow(table[table.length - 1].querySelector('p[data-lang="' + lang + '"]'), htmlParag.parentElement.dataset.root)); //we provide the data-root in order to avoid to be prompted when the addNewRow() is called
        }
        Array.from(table[i + rowIndex].children)
            .filter((p) => p.dataset.lang == lang)[0]
            //@ts-ignore
            .innerText = clean[i];
    }
}
function checkSelection(htmlParag) {
    while (htmlParag.tagName !== 'P' && htmlParag.parentElement)
        htmlParag = htmlParag.parentElement;
    if (!htmlParag || htmlParag.tagName !== 'P') {
        alert('Make sure your cursor is within the cell/paragraph where the text to be splitted is found');
        return undefined;
    }
    return htmlParag;
}
