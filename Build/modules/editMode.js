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
                Array.from(el.children).map((c) => c.contentEditable = "true");
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
            splitBelowBtn,
            convertCopticFontsFromAPIBtn,
            goToTableByTitleBtn
        ];
    getButtons.forEach(fun => fun(btnsDiv));
}
/**
 * Creates a button for adding a new html element div representing a new row in a table
 * @param {HTMLElement} btnsDiv - the html  div in which the buttons are shown
 */
function addRowBtn(btnsDiv) {
    let newButton = createEditingButton(() => addNewRow(document.getSelection().focusNode.parentElement), "Add Row");
    btnsDiv.appendChild(newButton);
}
function saveToLocalStorageBtn(btnsDiv) {
    let newButton = createEditingButton(() => saveModifiedArray(), "Save");
    btnsDiv.appendChild(newButton);
}
/**
 * Creates a button for exporting the edited text as an string[][][] in a js file
 * @param {HTMLElement} btnsDiv - the html div in  which the buttons are displayed
 */
function exportToJSFileBtn(btnsDiv) {
    //@ts-ignore
    let newButton = createEditingButton(() => console.save(saveModifiedArray(), 'ModifiedArray.js'), "Export To JS");
    btnsDiv.appendChild(newButton);
}
function changeTitleBtn(btnsDiv) {
    let newButton = createEditingButton(() => changeTitle(document.getSelection().focusNode.parentElement), "Change Ttile");
    btnsDiv.appendChild(newButton);
}
function goToTableByTitleBtn(btnsDiv) {
    let newButton = createEditingButton(() => goToTableByTitle(), "Go To Table");
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
function convertCopticFontsFromAPIBtn(btnsDiv) {
    let newButton = createEditingButton(() => convertCopticFontFromAPI(document.getSelection().focusNode.parentElement), "Convert Coptic Font");
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
function changeTitle(htmlParag, newTitle) {
    htmlParag = checkSelection(htmlParag);
    if (!htmlParag)
        return;
    let htmlRow = htmlParag.parentElement;
    let oldTitle = htmlRow.dataset.root;
    if (!newTitle)
        newTitle = prompt("Provide The Title", oldTitle);
    if (!newTitle)
        return alert('You didn\'t provide a valide title');
    htmlRow.dataset.root = newTitle;
    Array.from(htmlRow.children)
        .forEach((child) => {
        if (child.tagName === 'P' && child.dataset.root)
            child.dataset.root = newTitle;
    });
    //We will then go to each sibling and change its title if it has the same title as oldTitle
    htmlRow = htmlRow.nextElementSibling;
    while (htmlRow
        && htmlRow.tagName === 'DIV'
        && baseTitle(htmlRow.dataset.root) === baseTitle(oldTitle)) {
        let actorClass = htmlRow.dataset.root.split('&C=')[1];
        if (!actorClass)
            actorClass = '';
        actorClass += '&C=';
        changeTitle(htmlRow, baseTitle(newTitle) + actorClass);
    }
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
        p.title = dataRoot;
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
/**
 * Checks whether the cursor is placed within a paragraph html element. If not, it triggers an alert message and returns 'undefined'
 * @param {HTMLElement} htmlParag - the html element within which hte cursor is placed
 * @returns {HTMLElement | undefined}
 */
function checkSelection(htmlParag) {
    while (htmlParag.tagName !== 'P' && htmlParag.parentElement)
        htmlParag = htmlParag.parentElement;
    if (!htmlParag || htmlParag.tagName !== 'P') {
        alert('Make sure your cursor is within the cell/paragraph where the text to be splitted is found');
        return undefined;
    }
    return htmlParag;
}
/**
 * Displays the text of a string[][][] which name is passed to the function as as sting
 * @param {string} arrayName - the name of the string[][][] array containing the text
 * @param {string} title
 * @returns
 */
function showTablesFun(arrayName, title) {
    let languages = getLanguages(arrayName), el, sourceArray = eval(arrayName);
    if (!sourceArray || sourceArray.length === 0) {
        alert('No array was found with the name: ' + arrayName);
        return;
    }
    //We save the name of the array in a data attribute of containerDiv, in order to be able to retrieve it when exporting the text to a js file
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
/**
 * Returns an array of languages based on the name of the array passed to it (if it is a reading, it returns the languages for the readings, if it is the PrayersArray, it returns the prayersLanguages)
 * @param {string} arrayName - the name of a string[][][], for which we will return the languages corresponding to it
 * @returns {string[]} - an array of languages
 */
function getLanguages(arrayName) {
    let languages = prayersLanguages;
    if (arrayName.startsWith('ReadingsArrays.'))
        languages = readingsLanguages;
    if (arrayName.startsWith('ReadingsArrays.SynaxariumArray'))
        languages = ['FR', 'AR'];
    return languages;
}
/**
 * Converts the coptic font of the text in the selected html element, to a unicode font
 * @param {HTMLElement} htmlElement - an editable html element in which the cursor is placed, containing coptic text in a non unicode font, that we need to convert
 */
function convertCopticFontFromAPI(htmlElement) {
    const apiURL = 'https://www.copticchurch.net/coptic_language/fonts/convert';
    let fontFrom = prompt('Provide the font', 'Coptic1/CS Avva Shenouda');
    let text = htmlElement.innerText;
    let request = new XMLHttpRequest();
    request.open('POST', apiURL);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.setRequestHeader('accept', 'text');
    request.send('from=' + encodeURI(fontFrom) + '&encoding=unicode&action=translate&data=' + encodeURI(text));
    request.responseType = 'text';
    request.onload = () => {
        if (request.status === 200) {
            let textArea = new DOMParser()
                .parseFromString(request.response, 'text/html')
                .getElementsByTagName('textarea')[0];
            console.log('converted text = ', textArea.innerText);
            htmlElement.innerText = textArea.innerText;
            return textArea.innerText;
        }
        else {
            console.log('error status text = ', request.statusText);
            return request.statusText;
        }
    };
}
function goToTableByTitle() {
    let title = prompt('Provide the title you want to go to');
    let rows = Array.from(containerDiv.querySelectorAll('.TargetRow'))
        .filter((row) => row.dataset.root.includes(title));
    if (rows.length === 0)
        return alert('Didn\'t find an element with the provided title');
    rows[0].id = rows[0].dataset.root + String(0);
    createFakeAnchor(rows[0].id);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE1vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL2VkaXRNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUM1Qjs7O0dBR0c7QUFDSCxLQUFLLFVBQVUsV0FBVyxDQUFDLFNBQXVCLEVBQUUsU0FBa0I7SUFDcEUsWUFBWTtJQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsbURBQW1EO0lBQ3JHLElBQUksRUFBZSxDQUFDO0lBQ3BCLFlBQVksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsMkJBQTJCO0lBQ3hELFNBQVMsQ0FBQyxHQUFHO0lBQ2IscUZBQXFGO0lBQ25GLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDVixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxFQUFFLEdBQUcscUNBQXFDLENBQ3hDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ1IsU0FBUyxFQUNULFlBQVksRUFDWixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMzQixZQUFZLEVBQ1osQ0FBQyxDQUNGLENBQUM7WUFDRixJQUFJLEVBQUUsRUFBRTtnQkFDTixzREFBc0Q7Z0JBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FDekIsQ0FBQyxDQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUMvQyxDQUFDO2FBQ0g7U0FDRjtJQUNELENBQUMsQ0FBQyxDQUFDO0lBQ0wsNEJBQTRCO0lBQzVCLGtCQUFrQixFQUFFLENBQUM7SUFDckIseUNBQXlDO0lBQ3pDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0lBQ25FLDBDQUEwQztJQUMxQyx3QkFBd0IsQ0FDdEIsWUFBWSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxrQkFBa0IsQ0FBQyxVQUFzQjtJQUNoRCxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQztJQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7SUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBRWpDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXZFLElBQUksQ0FBQyxVQUFVO1FBQUUsVUFBVSxHQUFHO1lBQzVCLGNBQWM7WUFDZCxjQUFjO1lBQ2QscUJBQXFCO1lBQ3JCLGlCQUFpQjtZQUNqQixxQkFBcUI7WUFDckIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1osYUFBYTtZQUNiLDRCQUE0QjtZQUM1QixtQkFBbUI7U0FDcEIsQ0FBQztJQUVGLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUUxQyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxTQUFTLENBQUMsT0FBbUI7SUFDcEMsSUFBSSxTQUFTLEdBQUUsbUJBQW1CLENBQy9CLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUNoRSxTQUFTLENBQ1IsQ0FBQztJQUNGLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUVDLFNBQVMscUJBQXFCLENBQUMsT0FBbUI7SUFDaEQsSUFBSSxTQUFTLEdBQUUsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFDRDs7O0dBR0c7QUFDSCxTQUFTLGlCQUFpQixDQUFDLE9BQW9CO0lBQzdDLFlBQVk7SUFDWixJQUFJLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNqSCxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxPQUFtQjtJQUN6QyxJQUFJLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxjQUFjLENBQ3JILENBQUM7SUFDQSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLE9BQU87SUFDbEMsSUFBSSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxhQUFhLENBQzFFLENBQUM7SUFDQSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFFQyxTQUFTLGNBQWMsQ0FBQyxPQUFtQjtJQUN6QyxJQUFJLFNBQVMsR0FBRyxtQkFBbUIsQ0FDakMsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEYsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUgsU0FBUyxZQUFZLENBQUMsT0FBb0I7SUFDdEMsSUFBSSxTQUFTLEdBQUcsbUJBQW1CLENBQ2pDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ2hGLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsT0FBbUI7SUFDaEQsSUFBSSxTQUFTLEdBQUcsbUJBQW1CLENBQ2pDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQ3pFLGlCQUFpQixDQUNoQixDQUFDO0lBQ0YsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBQ0QsU0FBUyw0QkFBNEIsQ0FBQyxPQUFvQjtJQUN4RCxJQUFJLFNBQVMsR0FBRyxtQkFBbUIsQ0FDakMsR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFDL0UscUJBQXFCLENBQ3BCLENBQUM7SUFDRixPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxPQUFtQjtJQUN4QyxJQUFJLFNBQVMsR0FBRyxtQkFBbUIsQ0FDbkMsR0FBRSxFQUFFLENBQUEsNkJBQTZCLEVBQUUsRUFDbkMsYUFBYSxDQUNkLENBQUM7SUFDQSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLE9BQW1CO0lBQzVDLElBQUksU0FBUyxHQUFHLG1CQUFtQixDQUNqQyxHQUFHLEVBQUUsQ0FBQyxjQUFjLEVBQUUsRUFDdEIsaUJBQWlCLENBQ2hCLENBQUM7SUFDRixPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLFNBQVMsR0FBRyxtQkFBbUIsQ0FDL0IsR0FBRSxFQUFFLENBQUEsNkJBQTZCLEVBQUUsRUFDbkMsYUFBYSxDQUNkLENBQUM7SUFDQSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFDSCxTQUFTLDJCQUEyQixDQUFDLE9BQW1CO0lBQ3RELElBQUksU0FBUyxHQUFHLG1CQUFtQixDQUNqQyxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxFQUNoQywyQkFBMkIsQ0FDNUIsQ0FBQztJQUNBLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUVIOzs7O0dBSUc7QUFDSCxTQUFTLFNBQVMsQ0FBQyxTQUFzQjtJQUN2QyxTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztJQUN2QixJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsYUFBNEIsQ0FBQztJQUNyRCxJQUFJLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxJQUFJLEtBQUs7UUFBRSxPQUFPLENBQUEsNENBQTRDO0lBQ3RILE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsd0JBQXdCO0lBQy9CLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLGFBQTBCLEVBQUUsUUFBc0IsQ0FBQztJQUVyRyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQUUsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFBRSxPQUFNO0tBQUM7SUFBQSxDQUFDO0lBQy9FLGFBQWEsR0FBRyxpQ0FBaUMsRUFBRSxDQUFDO0lBRXBELGFBQWE7UUFDWCxxQ0FBcUM7U0FDcEMsT0FBTyxDQUNOLENBQUMsS0FBaUIsRUFBRSxFQUFFO1FBQ3BCLDZFQUE2RTtRQUM3RSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxxRkFBcUY7UUFDckYsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRixJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7WUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDREQUE0RCxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdILENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBWTtJQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRSxLQUFLLENBQUMsQ0FBQztBQUMzRixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxpQ0FBaUM7SUFDeEMsSUFBSSxhQUFhLEdBQWdCLEVBQUksRUFDakMsS0FBaUIsRUFDakIsTUFBbUIsQ0FBQztJQUUxQixNQUFNLEdBQUcsSUFBSSxHQUFHO0lBQ2Qsd0dBQXdHO0lBQ3hHLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3hELDBHQUEwRztTQUN6RyxHQUFHLENBQUMsQ0FBQyxHQUFnQixFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHekQsMkNBQTJDO0lBQzdDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ2hCLG9DQUFvQztTQUNuQyxPQUFPLENBQ04sQ0FBQyxLQUFhLEVBQUUsRUFBRTtRQUNoQiwyQkFBMkI7UUFDM0IsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNYLG1HQUFtRztRQUNuRyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELGlDQUFpQzthQUNoQyxPQUFPLENBQ04sQ0FBQyxHQUFtQixFQUFFLEVBQUU7WUFDeEIscUdBQXFHO1lBQ3JHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0IsZ0RBQWdEO1lBQ2hELEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7Z0JBQ3ZCLHVHQUF1RztpQkFDdEcsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO1FBQzVELENBQUMsQ0FDRixDQUFDO1FBQ0YsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sYUFBYSxDQUFBO0FBQ3hCLENBQUM7QUFFSDs7O0dBR0c7QUFDSCxTQUFTLGNBQWMsQ0FBQyxTQUFzQjtJQUM1QyxTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztJQUN2QixJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsYUFBNEIsQ0FBQTtJQUNwRCxJQUFJLFNBQVMsR0FBVyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0QsV0FBVyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNoQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFvQixFQUFFLEVBQUU7UUFDNUQsV0FBVyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1FBQ2xCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxLQUFLLEdBQUMsU0FBUyxDQUFDO0lBQ3ZELElBQUksU0FBUyxJQUFJLE9BQU8sRUFBRTtRQUN4QixXQUFXLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7S0FDeEM7U0FBTTtRQUNMLFdBQVcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDaEMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBb0IsRUFBRSxFQUFFO1lBQzVELFdBQVcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7S0FDSjtBQUNILENBQUM7QUFDRCxTQUFTLFdBQVcsQ0FBQyxPQUFvQixFQUFFLFNBQWlCO0lBQzFELE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFDRCxTQUFTLFdBQVcsQ0FBQyxTQUFzQixFQUFFLFFBQWdCO0lBQzNELFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDLFNBQVM7UUFBRSxPQUFPO0lBQ3ZCLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxhQUE0QixDQUFDO0lBQ3JELElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3BDLElBQUksQ0FBQyxRQUFRO1FBQUUsUUFBUSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNoRSxJQUFJLENBQUMsUUFBUTtRQUFFLE9BQU8sS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDaEUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO0lBQ2hDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUN6QixPQUFPLENBQ04sQ0FBQyxLQUFrQixFQUFFLEVBQUU7UUFDckIsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7WUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUE7SUFDaEYsQ0FBQyxDQUFDLENBQUM7SUFDVCwyRkFBMkY7SUFDM0YsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBaUMsQ0FBQztJQUNwRCxPQUFPLE9BQU87V0FDVCxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUs7V0FDekIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzVELElBQUksVUFBVSxHQUFXLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsVUFBVTtZQUFFLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDakMsVUFBVSxJQUFJLEtBQUssQ0FBQztRQUNwQixXQUFXLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQTtLQUN2RDtBQUNILENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsbUJBQW1CLENBQzFCLEdBQWEsRUFDYixLQUFhO0lBRWIsSUFBSSxPQUFPLEdBQXFCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDaEUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEMsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDMUIsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sT0FBTyxDQUFBO0FBQ2hCLENBQUM7QUFFRCxTQUFTLGlCQUFpQjtJQUN4QixJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEVBQUUsNkRBQTZEO0lBQ3ZILGFBQXlDLEVBQ3pDLEtBQWlCLEVBQ2pCLE9BQU8sR0FBZ0IsSUFBSSxHQUFHLEVBQUUsRUFDaEMsUUFBUSxHQUFpQixFQUFFLEVBQzNCLEtBQWEsQ0FBQztJQUNoQixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU87SUFDMUIsMkNBQTJDO0lBQzNDLENBQUMsT0FBdUIsRUFBRSxFQUFFO1FBQzFCLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlDQUFpQztRQUMxRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMscUlBQXFJO0lBQ3BMLENBQUMsQ0FDRixDQUFDO0lBRUYsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx3RkFBd0Y7SUFFakksU0FBUyxZQUFZLENBQUMsS0FBYTtRQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsdUNBQXVDO1FBQzFELEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QyxZQUFZO2FBQ1QsZ0JBQWdCLENBQUMsZUFBZSxDQUFDO2FBQ2pDLE9BQU8sQ0FBQyxDQUFDLEdBQWdCLEVBQUUsRUFBRTtZQUM1QixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM5RCwyREFBMkQ7Z0JBQ3pELEtBQUs7cUJBQ0EsSUFBSSxDQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FDbEQsQ0FBQztnQkFDRixLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDRFQUE0RTthQUNoSTtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLElBQUksSUFBSSxHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyQyxZQUFZLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyQyxPQUFPLElBQUksQ0FBQTtBQUNiLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxLQUFtQjtJQUMxQyxzQkFBc0I7SUFDdEIsSUFBSSxJQUFJLEdBQVcsR0FBRyxDQUFDO0lBQ3ZCLENBQUMsU0FBUyxrQkFBa0I7UUFDMUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQWlCLEVBQUUsRUFBRTtZQUNsQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsU0FBUyxZQUFZLENBQUMsS0FBaUI7UUFDckMsa0JBQWtCO1FBQ2xCLElBQUksSUFBSSxLQUFLLENBQUM7UUFDZCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBYSxFQUFFLEVBQUU7WUFDOUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsYUFBYTtRQUNiLElBQUksSUFBSSxPQUFPLENBQUM7SUFDbEIsQ0FBQztJQUNELFNBQVMsVUFBVSxDQUFDLEdBQWE7UUFDL0IsZ0JBQWdCO1FBQ2hCLElBQUksSUFBSSxLQUFLLENBQUM7UUFDZCxtQkFBbUI7UUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbkMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsV0FBVztRQUNYLElBQUksSUFBSSxPQUFPLENBQUM7SUFDbEIsQ0FBQztJQUVELFNBQVMsb0JBQW9CLENBQUMsT0FBZSxFQUFFLEdBQWE7UUFDMUQsa0NBQWtDO1FBQ2xDLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLHVCQUF1QjtRQUVqRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQzdCLE9BQU8sR0FBRyxPQUFPO2lCQUNkLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztpQkFDMUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQywrQ0FBK0M7UUFDaEcsT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFDLElBQUksSUFBSSxHQUFHLEdBQUMsT0FBTyxHQUFDLE9BQU8sQ0FBQyxDQUFDLHFGQUFxRjtJQUNwSCxDQUFDO0lBQ0QsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUMsR0FBRyxDQUFDO0FBQy9CLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFZO0lBQy9CLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDdkUsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0lBQ2pGLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDM0UsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUN6RSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0lBQ25FLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDekUsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUseUJBQXlCLENBQUMsQ0FBQztJQUM3RSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0lBQzdFLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDM0UsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztJQUN2RSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0lBQzdFLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDckUsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztJQUN2RSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3ZFLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDM0UsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUNyRSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQzNFLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDLENBQUM7SUFDL0UsVUFBVTtJQUNSLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDckUsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUM3RCxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3JFLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDN0QsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUseUJBQXlCLENBQUMsQ0FBQztJQUM3RSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0lBQzVFLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLDRCQUE0QixDQUFDLENBQUM7SUFDNUUsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztJQUM5RSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO0lBQ3BGLFdBQVc7SUFDVCxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ2pELElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDakQsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNuRCxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ2pELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLFNBQVMsQ0FBQyxTQUFzQixFQUFFLFFBQWlCO0lBQzFELFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDLFNBQVM7UUFBRSxPQUFPO0lBQ3ZCLElBQUksR0FBRyxHQUFnQixTQUFTLENBQUMsYUFBNEIsQ0FBQztJQUU5RCxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUN4QyxDQUF1QixFQUN2QixLQUEyQixDQUFDO0lBQzlCLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztJQUNyQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUN6QyxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUM7SUFDakUsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO0lBQzdELElBQUksQ0FBQyxRQUFRO1FBQUUsUUFBUSxHQUFHLE1BQU0sQ0FDOUIsa0NBQWtDLEVBQ2xDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNqQixDQUFDO0lBQ0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO0lBRS9CLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQyxrQ0FBa0M7SUFDbEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzVDLEtBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBeUIsQ0FBQztRQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1lBQUUsU0FBUztRQUNsQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxtRUFBbUU7UUFDbkUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQ3BDLHdEQUF3RDtRQUN4RCxDQUFDLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztLQUM1QjtJQUNELE9BQU8sR0FBRyxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQWdCLENBQUM7QUFDdEUsQ0FBQztBQUVELFNBQVMscUNBQXFDLENBQzVDLFlBQW9CLEVBQ3BCLE9BQWlCLEVBQ2pCLGNBQXdCLEVBQ3hCLGFBQXVCLEVBQ3ZCLFVBQWtCLEVBQ2xCLFdBRXlELFlBQVksRUFDckUsUUFBaUI7SUFFakIsSUFBSSxHQUFtQixFQUFFLENBQXVCLEVBQUUsSUFBWSxFQUFFLElBQVksQ0FBQztJQUU3RSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxJQUFJLFFBQVE7UUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxzQ0FBc0M7SUFDdEUsSUFBSSxRQUFRLEdBQVcsWUFBWSxDQUFDO0lBQ3BDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztJQUM1QixJQUFJLFVBQVUsSUFBSSxVQUFVLEtBQUssT0FBTyxFQUFFO1FBQ3hDLGlJQUFpSTtRQUNqSSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUMvQjtTQUFNLElBQUksVUFBVSxJQUFJLFVBQVUsSUFBSSxPQUFPLEVBQUU7UUFDOUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2xDLENBQUMsQ0FBQyxjQUFjLENBQUM7WUFDakIsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUMsc0VBQXNFO0tBQzNFO0lBQ0Qsb0lBQW9JO0lBQ3BJLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3ZDLDhDQUE4QztRQUM5QyxJQUNFLFVBQVU7WUFDVixDQUFDLFVBQVUsSUFBSSxTQUFTLElBQUksVUFBVSxJQUFJLGFBQWEsQ0FBQyxFQUN4RDtZQUNBLDRCQUE0QjtZQUM1QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEU7YUFBTTtZQUNMLElBQUksR0FBRyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsa0hBQWtIO1NBQ2pKLENBQUMsaVNBQWlTO1FBQ25TLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsaU5BQWlOO1FBQ2xQLElBQUksVUFBVSxJQUFJLE9BQU8sRUFBRTtZQUN6QixvSEFBb0g7WUFDcEgsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwQyxHQUFHLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLGdFQUFnRTtTQUNuRjthQUFNLElBQUksVUFBVSxFQUFFO1lBQ3JCLDBEQUEwRDtZQUMxRCxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM3QjthQUFNO1lBQ0wsOEdBQThHO1lBQzlHLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsK0hBQStIO1FBQzFKLENBQUMsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO1FBQ25CLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsOE5BQThOO1FBQ3JQLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQywwTUFBME07S0FDL047SUFDRCxZQUFZO0lBQ1osUUFBUSxDQUFDLEVBQUU7UUFDVCxDQUFDLENBQUMsWUFBWTtZQUNaLFFBQVEsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUM7UUFDaEUsQ0FBQyxDQUFDLFlBQVk7WUFDWixRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsa0JBQWtCO0lBQ3pCLElBQUksT0FBTyxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsRUFDdkQsSUFBSSxHQUFXLEdBQUcsQ0FBQztJQUNyQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDdEIsWUFBWTtRQUNaLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksR0FBQyxNQUFNLENBQUM7SUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLElBQUksR0FBRyxDQUFDO0lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxTQUFzQjtJQUNoRCxTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztJQUN2QixJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsYUFBNEIsQ0FBQztJQUNyRCxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0MsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsRUFBRTtRQUMzQyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUN4QixZQUFZLENBQUMsZ0JBQWdCLENBQzNCLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUMzRCxDQUNGLENBQUM7UUFDRixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBbUIsRUFBRSxFQUFFO1lBQ3hDLHFDQUFxQyxDQUNuQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFDaEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLEVBQ3ZCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxFQUN2QixHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2hDLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQ3hDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUNILGtCQUFrQixDQUNoQixRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUN2RSxDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBRUQsU0FBUyxjQUFjO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDMUQsSUFBSSxLQUFLO1FBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQ25CLGdCQUEwQixRQUFRLEVBQ2xDLFlBQTRCLFlBQVk7SUFFeEMsSUFBSSxTQUFTLENBQUM7SUFDZCxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNDLFFBQVE7U0FDTCxjQUFjLENBQUMsU0FBUyxDQUFDO1NBQ3pCLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNoRCxDQUFDLFNBQVMsY0FBYztRQUN0QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDL0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUMzQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDOUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNwQyxDQUFDLENBQUMsY0FBYyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNMLE1BQU0sQ0FBQyxFQUFFLEdBQUcsY0FBYyxDQUFDO0lBQzNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLGtCQUFrQixDQUFDO0lBQ2xELE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7SUFDNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztJQUMvQixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7SUFDMUIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQzlCLFNBQVMsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3hCLHFDQUFxQyxDQUNuQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFDaEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQ3ZDLENBQUMsQ0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUNoQyxFQUNELENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxFQUN2QixDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsRUFDdkIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNoQyxNQUFNLENBQ1AsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0gsa0JBQWtCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLG9CQUFvQixDQUFDLE9BQU87SUFDbkMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLElBQUksRUFBRSxRQUFRO1FBQ3JDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDdkMsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLFFBQVE7WUFBRSxRQUFRLEdBQUcsdUJBQXVCLENBQUM7UUFFbEQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDNUIsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMzQztRQUNELElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQzVCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNuQztRQUVELElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFDaEQsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQ3ZDLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWxDLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BFLENBQUMsQ0FBQyxjQUFjLENBQ2QsT0FBTyxFQUNQLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLENBQUMsRUFDRCxDQUFDLEVBQ0QsQ0FBQyxFQUNELENBQUMsRUFDRCxDQUFDLEVBQ0QsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLENBQUMsRUFDRCxJQUFJLENBQ0wsQ0FBQztRQUNGLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsNkJBQTZCO0lBQ3BDLHlIQUF5SDtJQUN6SCxJQUFJLFNBQVMsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoRixJQUFHLENBQUMsU0FBUztRQUFFLE9BQU8sQ0FBQSwwQ0FBMEM7SUFFaEUsSUFBSSxLQUFLLEdBQVUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQ3ZDLElBQUksR0FBVSxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFDcEMsS0FBSyxHQUFrQixLQUFLLENBQUMsSUFBSSxDQUMvQixZQUFZLENBQUMsZ0JBQWdCLENBQzNCLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBNEIsQ0FBQyxFQUFDLHlFQUF5RTtJQUN0SixRQUFRLEdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDNUQsK0NBQStDO0lBRS9DLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFFL0IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdEIsbUlBQW1JO1lBQ25JLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxlQUFlLEdBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSwwRkFBMEY7U0FDek47UUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDO2FBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RELFlBQVk7YUFDVCxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3pCO0FBQ0gsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLGNBQWMsQ0FBQyxTQUFzQjtJQUM1QyxPQUFPLFNBQVMsQ0FBQyxPQUFPLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxhQUFhO1FBQUUsU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7SUFDakcsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsT0FBTyxLQUFLLEdBQUcsRUFBRTtRQUMzQyxLQUFLLENBQUMsMkZBQTJGLENBQUMsQ0FBQztRQUNuRyxPQUFPLFNBQVMsQ0FBQztLQUNsQjtJQUNELE9BQU8sU0FBaUMsQ0FBQTtBQUMxQyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLGFBQWEsQ0FBQyxTQUFpQixFQUFFLEtBQWE7SUFDckQsSUFBSSxTQUFTLEdBQWEsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUMzQyxFQUFlLEVBQ2YsV0FBVyxHQUFnQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFakQsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUFFLEtBQUssQ0FBQyxvQ0FBb0MsR0FBRyxTQUFTLENBQUMsQ0FBQztRQUFFLE9BQU07S0FBQztJQUVqSCw0SUFBNEk7SUFDNUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBRTNDLElBQUksTUFBTSxHQUFpQixXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRXBGLElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFBRSxLQUFLLENBQUMsOEJBQThCLEdBQUcsU0FBUyxHQUFHLDBCQUEwQixHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQUMsT0FBTTtLQUFFO0lBR3RJLE1BQU0sQ0FBQyxPQUFPLENBQ1osQ0FBQyxLQUFpQixFQUFFLEVBQUUsQ0FDcEIsS0FBSyxDQUFDLE9BQU8sQ0FDWCxDQUFDLEdBQVksRUFBRSxFQUFFO1FBRWYsRUFBRSxHQUFHLHFDQUFxQyxDQUN4QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ04sR0FBRyxFQUNILFNBQVMsRUFDVCxZQUFZLEVBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDdkIsQ0FBQztRQUVGLElBQUksRUFBRTtZQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQWtCLEVBQUUsRUFBRSxHQUFFLElBQUcsS0FBSyxDQUFDLE9BQU8sS0FBSyxHQUFHO2dCQUFFLEtBQUssQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFBLENBQUEsQ0FBQyxDQUFDLENBQUM7SUFDOUgsQ0FBQyxDQUNBLENBQUMsQ0FBQztJQUNILDRCQUE0QjtJQUM5QixrQkFBa0IsQ0FBQztRQUNqQixTQUFTO1FBQ1QsWUFBWTtRQUNaLGFBQWE7UUFDYixjQUFjO1FBQ2QsY0FBYztRQUNkLDJCQUEyQjtLQUM1QixDQUFDLENBQUM7SUFDSCx5Q0FBeUM7SUFDdkMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDbkUsMENBQTBDO0lBQzFDLG9CQUFvQixFQUFFLENBQUM7SUFDdkIsd0JBQXdCLENBQ3RCLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLFlBQVksQ0FBQyxTQUFTO0lBQzdCLElBQUksU0FBUyxHQUFZLGdCQUFnQixDQUFDO0lBQzFDLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztRQUFFLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztJQUMzRSxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsZ0NBQWdDLENBQUM7UUFBRSxTQUFTLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckYsT0FBTyxTQUFTLENBQUE7QUFDbEIsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsd0JBQXdCLENBQUMsV0FBdUI7SUFDdkQsTUFBTSxNQUFNLEdBQVcsNERBQTRELENBQUM7SUFDcEYsSUFBSSxRQUFRLEdBQVcsTUFBTSxDQUFDLGtCQUFrQixFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFDOUUsSUFBSSxJQUFJLEdBQVcsV0FBVyxDQUFDLFNBQVMsQ0FBQztJQUN6QyxJQUFJLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0lBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzdCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztJQUM5RSxPQUFPLENBQUMsZ0JBQWdCLENBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRywwQ0FBMEMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRyxPQUFPLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztJQUM5QixPQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtRQUN0QixJQUFHLE9BQU8sQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFDO1lBQ3hCLElBQUksUUFBUSxHQUFnQixJQUFJLFNBQVMsRUFBRTtpQkFDeEMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO2lCQUM5QyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyRCxXQUFXLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUM7WUFDM0MsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDO1NBQzdCO2FBQU07WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4RCxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUM7U0FDM0I7SUFDRCxDQUFDLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0I7SUFDdkIsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7SUFDMUQsSUFBSSxJQUFJLEdBQWlCLEtBQUssQ0FBQyxJQUFJLENBQ2pDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQTRCLENBQUM7U0FDdEUsTUFBTSxDQUFDLENBQUMsR0FBZ0IsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEUsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxPQUFPLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO0lBQ3ZGLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMvQixDQUFDIn0=