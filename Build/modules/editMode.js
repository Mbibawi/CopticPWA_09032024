let sequence = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param tblsArray
 */
async function editingMode(tblsArray, languages) {
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
    showTitlesInRightSideBar(containerDiv.querySelectorAll("div.TargetRowTitle"));
}
/**
 * Adds the editing buttons as an appeded div to each html div (row) displayed
 * @param {HTMLElement} el - the div representing a row in the table
 */
function addEdintingButtons(getButtons) {
    let btnsDiv = document.createElement("div");
    let newButton;
    btnsDiv.classList.add("btnsDiv");
    btnsDiv.style.display = "grid";
    btnsDiv.style.gridTemplateColumns = String("20%").repeat(5);
    btnsDiv.style.top = '10px';
    btnsDiv.style.width = '90%';
    btnsDiv.style.justifySelf = 'top !important';
    btnsDiv.style.justifyItems = 'stretch';
    btnsDiv.style.position = 'fixed';
    containerDiv.children[0].insertAdjacentElement('beforebegin', btnsDiv);
    if (!getButtons)
        getButtons = [
            changeTitleBtn,
            changeClassBtn,
            saveToLocalStorageBtn,
            exportToJSFileBtn,
            addTableToSequenceBtn,
            exportSequenceBtn,
            addRowBtn,
            deleteRowBtn,
            splitBelowBtn
        ];
    getButtons.forEach(fun => fun(btnsDiv));
}
function addRowBtn(btnsDiv) {
    let newButton = createEditingButton(() => addNewRow(document.getSelection().focusNode.parentElement), "Add Row");
    btnsDiv.appendChild(newButton);
}
function saveToLocalStorageBtn(btnsDiv) {
    let newButton = createEditingButton(() => saveModifiedArray(), "Save");
    btnsDiv.appendChild(newButton);
}
function exportToJSFileBtn(btnsDiv) {
    //@ts-ignore
    let newButton = createEditingButton(() => console.save(saveModifiedArray(), 'ModifiedArray.js'), "Export To JS");
    btnsDiv.appendChild(newButton);
}
function changeTitleBtn(btnsDiv) {
    let newButton = createEditingButton(() => changeTitle(document.getSelection().focusNode.parentElement), "Change Ttile");
    btnsDiv.appendChild(newButton);
}
function changeClassBtn(btnsDiv) {
    let newButton = createEditingButton(() => changeCssClass(document.getSelection().focusNode.parentElement), "Class");
    btnsDiv.appendChild(newButton);
}
function deleteRowBtn(btnsDiv) {
    let newButton = createEditingButton(() => deleteRow(document.getSelection().focusNode.parentElement), "Delete Row");
    btnsDiv.appendChild(newButton);
}
function addTableToSequenceBtn(btnsDiv) {
    let newButton = createEditingButton(() => addTableToSequence(document.getSelection().focusNode.parentElement), "Add To Sequence");
    btnsDiv.appendChild(newButton);
}
function splitBelowBtn(btnsDiv) {
    let newButton = createEditingButton(() => splitParagraphsToTheRowsBelow(), "Split Below");
    btnsDiv.appendChild(newButton);
}
function exportSequenceBtn(btnsDiv) {
    let newButton = createEditingButton(() => exportSequence(), "Export Sequence");
    btnsDiv.appendChild(newButton);
    newButton = createEditingButton(() => splitParagraphsToTheRowsBelow(), "Split Below");
    btnsDiv.appendChild(newButton);
}
function modifyTablesInTheirArrayBtn(btnsDiv) {
    let newButton = createEditingButton(() => modifyTablesInTheirArray(), "Modify The Original Array");
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
 * Replaces each table in the array by the table in newTables[] having a title that matches the title of the target table in array[]
 * @param {string[][]} newTables - the tables that will replace those in the array
 * @param {string[][][]} array - the arrary in which we will replace some tables with those in the newTables[] parameter
 */
function modifyTablesInTheirArray() {
    let array = eval(containerDiv.dataset.arrayName), arrayOfTables, filtered;
    if (!array || array.length === 0) {
        alert('The array was not found');
        return;
    }
    ;
    arrayOfTables = getAnArrayOfTablesFromTheHtmlDivs();
    arrayOfTables
        //Looping the tables in arrayOfTables
        .forEach((table) => {
        //We will filter the array by the title to get the element matching the title
        filtered = array.filter(t => t[0][0] === table[0][0]);
        //We will replace the original table with the table array created from the html divs 
        if (filtered && filtered.length === 1)
            array.splice(array.indexOf(filtered[0]), 1, table);
        if (filtered && filtered.length > 1)
            console.log('found more than 1 table when filtering the original array ', filtered);
    });
    //@ts-ignore
    console.save(replacePrefixes(array), 'Modified' + containerDiv.dataset.arrayName + '.js');
}
/**
 * Loops the divs in containerDiv, and builds a string[][][] from the elements with same data-root attribute (i.e., belonging to the sam table)
 * @returns a string[][][] of all the tables displayed in container div. Each element is a table; each div in containerDiv is a string[] of a table
 */
function getAnArrayOfTablesFromTheHtmlDivs() {
    let arrayOfTables = [], table, titles;
    titles = new Set(
    //We create an array of all the div elements with 'TargetRow' class, and loop all the divs in this array
    Array.from(containerDiv.querySelectorAll('div.TargetRow'))
        //We return an array of all the 'data-root' attributes of all the divs. We then create a Set of this array
        .map((div) => baseTitle(div.dataset.root)));
    //We will now loop through the "titles" Set
    Array.from(titles)
        //For each title in the titles Set, 
        .forEach((title) => {
        //We create New array table
        table = [];
        //We loop the containerDiv for all the html rows having a "data-root" attribute matching this title
        containerDiv.querySelectorAll(getDataRootSelector(title, true))
            //For each div matching the title
            .forEach((div) => {
            //We add an array to "table", and add the data-root attribute of the div as 1st element of this array
            table.push([div.dataset.root]);
            //We loop the html pragraphs children of the div
            div.querySelectorAll('p')
                //And add the textContent of the paragraph html child as elements to the array we just added to "table"
                .forEach(p => table[table.length - 1].push(p.textContent));
        });
        arrayOfTables.push([...table]);
    });
    return arrayOfTables;
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
        element = element.replaceAll('\n', '\\n');
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
        p.innerText = text;
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
function showTablesFun(arrayName, title) {
    //showTablesFun("ReadingsArrays.SynaxariumArray", "0101")
    let languages = getLanguages(arrayName), el, sourceArray = eval(arrayName);
    if (!sourceArray || sourceArray.length === 0) {
        alert('No array was found with the name: ' + arrayName);
        return;
    }
    containerDiv.dataset.arrayName = arrayName;
    let tables = sourceArray.filter(table => table[0][0].includes(title));
    if (!tables || tables.length === 0) {
        alert('No tables were found in the ' + arrayName + ' with a title including ' + title);
        return;
    }
    tables.forEach((table) => table.forEach((row) => {
        el = createHtmlElementForPrayerEditingMode(row[0], row, languages, allLanguages, row[0].split('&C=')[1]);
        if (el)
            Array.from(el.children).map((child) => { if (child.tagName === 'P')
                child.contentEditable = "true"; });
    }));
    //We add the editing buttons
    addEdintingButtons([
        addRowBtn,
        deleteRowBtn,
        splitBelowBtn,
        changeTitleBtn,
        changeClassBtn,
        modifyTablesInTheirArrayBtn,
    ]);
    //Setting the CSS of the newly added rows
    setCSSGridTemplate(containerDiv.querySelectorAll("div.TargetRow"));
    //Showing the titles in the right side-bar
    hideInlineButtonsDiv();
    showTitlesInRightSideBar(containerDiv.querySelectorAll("div.TargetRowTitle"));
}
function getLanguages(arrayName) {
    let languages = prayersLanguages;
    if (arrayName.startsWith('ReadingsArrays.'))
        languages = readingsLanguages;
    if (arrayName.startsWith('ReadingsArrays.SynaxariumArray'))
        languages = ['FR', 'AR'];
    return languages;
}
async function convertCopticFontFromAPI(fontFrom = 'Coptic1') {
    const 
    //parag: HTMLElement = document.getSelection().focusNode.parentElement,
    apiURL = 'https://www.copticchurch.net/coptic_language/fonts/convert';
    /*   const fetchParams: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accept': 'text',
          'origin': 'https://www.copticchurch.net',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.45',
          'Access-Control-Allow-Origin': 'https://www.copticchurch.net'
        },
        mode: 'cors',
        body: 'from=' + fontFrom + '&encoding=unicode&action=translate&data=' + 'Pinis] abba Antwni@ nem pi`;myi abba Paule@ nem pisomt =e=;=u Makarioc@ abba Iwannyc pikoloboc@ abba Piswi@ abba Paule@ nenio] =e=;=u `nrwmeoc Maximoc nem Dometioc@ abba Mwcy@ abba Iwannyc <amy@ abba Daniyl@ abba Icidwroc@ abba Paqwm@ abba Senou]@ ke abba Pavnou]@ abba Parcwma@ abba Teji. Ke pantwn twn or;odidaxantwn@ ton logon@ tyc `aly;iac@ Or;odoxwn@ `epickopwn `precbuterwn@ diakonwn `klyrikwn ky laikwn ke toutwn ke pantwn@ Or;odoxwn@ `amyn'
      }; */
    let request = new XMLHttpRequest();
    request.open('POST', apiURL);
    //request.setRequestHeader('mode', 'cors');
    //request.setRequestHeader('origin', 'https://www.copticchurch.net');
    //.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //request.setRequestHeader( 'accept', 'text');
    //request.setRequestHeader( 'User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.45');
    request.send('from=' + fontFrom + '&encoding=unicode&action=translate&data=' + 'Pinis] abba Antwni@ nem pi`;myi abba Paule@ nem pisomt =e=;=u Makarioc@ abba Iwannyc pikoloboc@ abba Piswi@ abba Paule@ nenio] =e=;=u `nrwmeoc Maximoc nem Dometioc@ abba Mwcy@ abba Iwannyc <amy@ abba Daniyl@ abba Icidwroc@ abba Paqwm@ abba Senou]@ ke abba Pavnou]@ abba Parcwma@ abba Teji. Ke pantwn twn or;odidaxantwn@ ton logon@ tyc `aly;iac@ Or;odoxwn@ `epickopwn `precbuterwn@ diakonwn `klyrikwn ky laikwn ke toutwn ke pantwn@ Or;odoxwn@ `amyn');
    console.log(request.getAllResponseHeaders());
    console.log(request.responseText);
    if (request.statusText === 'OK')
        parag.innerText = await request.responseText;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE1vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL2VkaXRNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUM1Qjs7O0dBR0c7QUFDSCxLQUFLLFVBQVUsV0FBVyxDQUFDLFNBQXVCLEVBQUUsU0FBa0I7SUFDcEUsWUFBWTtJQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsbURBQW1EO0lBQ3JHLElBQUksRUFBZSxDQUFDO0lBQ3BCLFlBQVksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsMkJBQTJCO0lBQ3hELFNBQVMsQ0FBQyxHQUFHO0lBQ2IscUZBQXFGO0lBQ25GLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDVixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxFQUFFLEdBQUcscUNBQXFDLENBQ3hDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ1IsU0FBUyxFQUNULFlBQVksRUFDWixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMzQixZQUFZLEVBQ1osQ0FBQyxDQUNGLENBQUM7WUFDRixJQUFJLEVBQUUsRUFBRTtnQkFDTixzREFBc0Q7Z0JBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FDekIsQ0FBQyxDQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsQ0FDakQsQ0FBQzthQUNIO1NBQ0Y7SUFDRCxDQUFDLENB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