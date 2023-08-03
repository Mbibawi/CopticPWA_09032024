let sequence = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param tblsArray
 */
async function editTablesArray(entry) {
    let tablesArray;
    if (entry === 'NewTable')
        tablesArray = [[['NewTable&C=Title', 'New Table Added', 'New Table Added']]];
    if (!tablesArray)
        tablesArray = eval(entry);
    if (!tablesArray)
        return;
    let languages = getLanguages(entry);
    if (!languages)
        languages = allLanguages;
    localStorage.displayMode === displayModes[0];
    //@ts-ignore
    if (!console.save)
        addConsoleSaveMethod(console); //We are adding a save method to the console object
    let el;
    containerDiv.innerHTML = ""; //we empty the containerDiv
    //We create an html div element to display the text of each row of each table in tablesArray
    tablesArray.forEach(table => {
        table.forEach(row => {
            el = createHtmlElementForPrayerEditingMode(row, languages);
            //We make the paragraph children of each row, editable
            if (el)
                Array.from(el.children).forEach((c) => c.contentEditable = "true");
        });
    });
    //We add the editing buttons
    addEdintingButtons();
    //Setting the CSS of the newly added rows
    setCSSGridTemplate(containerDiv.querySelectorAll("div.Row"));
    //Showing the titles in the right side-bar
    showTitlesInRightSideBar(containerDiv.querySelectorAll("div.TitleRow, div.SubTitle"));
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
            addColumnBtn,
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
;
function addColumnBtn(btnsDiv) {
    let newButton = createEditingButton(() => addNewColumn(document.getSelection().focusNode), "Add Column");
    btnsDiv.appendChild(newButton);
}
;
function saveToLocalStorageBtn(btnsDiv) {
    let newButton = createEditingButton(() => saveModifiedArray(), "Save");
    btnsDiv.appendChild(newButton);
}
/**
 * Creates a button for exporting the edited text as an string[][][] in a js file
 * @param {HTMLElement} btnsDiv - the html div in  which the buttons are displayed
 */
function exportToJSFileBtn(btnsDiv) {
    let today = new Date();
    let fileName = containerDiv.dataset.arrayName
        + '_[ModifiedOn'
        + String(today.getDate())
        + String(today.getMonth())
        + String(today.getFullYear())
        + 'at'
        + String(today.getHours())
        + 'h'
        + String(today.getMinutes())
        + '].js';
    //@ts-ignore
    let newButton = createEditingButton(() => console.save(saveModifiedArray(), fileName), "Export To JS");
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
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    if (confirm("Are you sure you want to delete this row?") === false)
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
    //We create an array of all the div elements with 'Row' class, and loop all the divs in this array
    Array.from(containerDiv.querySelectorAll('div.Row'))
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
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let className = htmlRow.dataset.root.split("&C=")[1];
    if (className === undefined)
        className = prompt("Provide The Title", htmlRow.dataset.root.split("&C=")[1]);
    if (!className)
        return;
    htmlRow.dataset.root = htmlRow.dataset.root.split("&C=")[0] + "&C=" + className;
    if (className === 'Title')
        className = 'TitleRow';
    if (!htmlRow.classList.contains(className))
        htmlRow.classList.add(className);
}
function toggleClass(element, className) {
    element.classList.toggle(className);
}
function changeTitle(htmlParag, newTitle, oldTitle) {
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    if (!oldTitle)
        oldTitle = htmlRow.dataset.root;
    if (!newTitle)
        newTitle = prompt("Provide The Title", oldTitle);
    if (!newTitle)
        return alert('You didn\'t provide a valide title');
    if (newTitle === oldTitle)
        return;
    htmlRow.dataset.root = newTitle;
    Array.from(htmlRow.children)
        .forEach((child) => {
        if (child.tagName === 'P' && child.dataset.root) {
            child.dataset.root = baseTitle(newTitle);
            child.title = newTitle;
        }
    });
    if (newTitle.includes('&C='))
        changeCssClass(htmlRow);
    //We will then go to each sibling and change its title if it has the same title as oldTitle
    htmlRow = htmlRow.nextElementSibling;
    while (htmlRow
        && htmlRow.tagName === 'DIV'
        && baseTitle(htmlRow.dataset.root) === baseTitle(oldTitle)) {
        let actorClass = htmlRow.dataset.root.split('&C=')[1];
        if (!actorClass)
            actorClass = '';
        if (actorClass !== '')
            actorClass = '&C=' + actorClass;
        changeTitle(htmlRow, baseTitle(newTitle) + actorClass, oldTitle);
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
    let htmlRows = containerDiv.querySelectorAll(".Row"), //we retriev all the divs with 'Row' class from the DOM
    table, updated = new Set(), newArray = [], title;
    Array.from(htmlRows).forEach(
    //for each 'Row' div in containderDiv
    (htmlRow) => {
        title = baseTitle(htmlRow.dataset.root); //this is the title without '&C='
        if (!updated.has(title))
            updated.add(title); //if the table has already been added, its title will be in the updated[], we will escape the row since it has already been processed
    });
    updated.forEach((tableTitle) => processTablesTitles(tableTitle)); //for each title in the set, we will retrieve the text in arrays each representing a row
    function processTablesTitles(tableTitle) {
        newArray.push([]); //this is an emepty array for the table
        table = newArray[newArray.length - 1];
        Array.from(containerDiv
            .querySelectorAll("div.Row"))
            .filter((div) => baseTitle(div.dataset.root) === baseTitle(tableTitle))
            .forEach((div) => {
            table
                .push(Array.from(div.querySelectorAll("p"))
                .map((p) => p.innerText) //we are pushing to table a new array containing the innerText of each 'p' html element child of the div (eg.: ['innertText paragraph1', 'innertText paragraph2', etc])
            );
            table[table.length - 1].unshift(div.dataset.root); //adding the title as 1st element to the row that we've just pushed to table
        });
    }
    console.log("newArray = ", newArray);
    let text = processTablesArray(newArray);
    localStorage.editedText = text;
    console.log(localStorage.editedText);
    return text;
}
function processTablesArray(tablesArray) {
    //Open Array of Tables
    let text = "[";
    tablesArray.forEach((table) => { processTable(table); });
    function processTable(table) {
        //open table array
        text += "[\n";
        table.forEach((row) => {
            processTableRow(row);
        });
        //close table
        text += "], \n";
    }
    ;
    function processTableRow(row) {
        //open row array
        text += "[\n";
        //loop row elements
        row.forEach((element) => processStringElement(element, row));
        //close row
        text += "], \n";
    }
    ;
    function processStringElement(element, row) {
        //for each string element in row[]
        element = element.replaceAll('"', '\\"'); //replacing '"" by '\"'
        element = element.replaceAll('\n', '\\n');
        if (row[0].endsWith("&C=Title"))
            element = element
                .replaceAll(String.fromCharCode(plusCharCode) + ' ', '')
                .replaceAll(String.fromCharCode(plusCharCode + 1) + ' ', ''); //removing the plus(+) and minus(-à characters from the titles
        text += '"' + element + '", \n'; //adding the text of row[i](after being cleaned from the unwatted characters) to text
    }
    ;
    text = replacePrefixes(text);
    text = containerDiv.dataset.arrayName + "= " + text;
    text += "];";
    return text;
}
function replacePrefixes(text) {
    text = text
        .replaceAll('"' + Prefix.bookOfHours, 'Prefix.bookOfHours+"')
        .replaceAll('"' + Prefix.commonDoxologies, 'Prefix.commonDoxologies+"')
        .replaceAll('"' + Prefix.commonIncense, 'Prefix.commonIncense+"')
        .replaceAll('"' + Prefix.commonPrayer, 'Prefix.commonPrayer+"')
        .replaceAll('"' + Prefix.communion, 'Prefix.communion+"')
        .replaceAll('"' + Prefix.cymbalVerses, 'Prefix.cymbalVerses+"')
        .replaceAll('"' + Prefix.fractionPrayer, 'Prefix.fractionPrayer+"')
        .replaceAll('"' + Prefix.gospelResponse, 'Prefix.gospelResponse+"')
        .replaceAll('"' + Prefix.incenseDawn, 'Prefix.incenseDawn+"')
        .replaceAll('"' + Prefix.incenseVespers, 'Prefix.incenseVespers+"')
        .replaceAll('"' + Prefix.massCommon, 'Prefix.massCommon+"')
        .replaceAll('"' + Prefix.massStBasil, 'Prefix.massStBasil+"')
        .replaceAll('"' + Prefix.massStCyril, 'Prefix.massStCyril+"')
        .replaceAll('"' + Prefix.massStGregory, 'Prefix.massStGregory+"')
        .replaceAll('"' + Prefix.massStJohn, 'Prefix.massStJohn+"')
        .replaceAll('"' + Prefix.psalmResponse, 'Prefix.psalmResponse+"')
        .replaceAll('"' + Prefix.praxisResponse, 'Prefix.praxisResponse+"')
        //Readings
        .replaceAll('"' + Prefix.synaxarium, 'Prefix.synaxarium+"')
        .replaceAll('"' + Prefix.stPaul, 'Prefix.stPaul+"')
        .replaceAll('"' + Prefix.katholikon, 'Prefix.katholikon+"')
        .replaceAll('"' + Prefix.praxis, 'Prefix.praxis+"')
        .replaceAll('"' + Prefix.propheciesDawn, 'Prefix.propheciesDawn+"')
        .replaceAll('"' + Prefix.gospelVespers, 'Prefix.gospelVespers+"')
        .replaceAll('"' + Prefix.gospelDawn, 'Prefix.gospelDawn+"')
        .replaceAll('"' + Prefix.gospelMass, 'Prefix.gospelMass+"')
        .replaceAll('"' + Prefix.gospelNight, 'Prefix.gospelNight+"')
        .replaceAll('"' + Prefix.gospelVespers, 'Prefix.gospelVespers+"')
        //Seasonal 
        .replaceAll(giaki.AR, '"+giaki.AR+"')
        .replaceAll(giaki.FR, '"+giaki.FR+"')
        .replaceAll(giaki.COP, '"+giaki.COP+"')
        .replaceAll(giaki.CA, '"+giaki.CA+"');
    return text;
}
/**
 * Adds a new div (row) below the div (row) passed to it as argument.
 * @param {HTMLElement} row - the div (row) below which we will add a row
 * @param {string} dataRoot - a string representing the data-root value that will be givent to the new div (row) added. If missing, the user will be prompted to provide the dataRoot, with, as default value, the data-root value of 'row'
 */
function addNewRow(htmlParag, dataRoot) {
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let newRow = document.createElement("div"), p, child;
    newRow.classList.add("Row");
    newRow.dataset.isNewRow = "isNewRow";
    newRow.style.display = htmlRow.style.display;
    newRow.style.gridTemplateColumns = htmlRow.style.gridTemplateColumns;
    newRow.style.gridTemplateAreas = htmlRow.style.gridTemplateAreas;
    if (!dataRoot)
        dataRoot = prompt("Provide the Title of the new Row", htmlRow.dataset.root);
    newRow.dataset.root = dataRoot;
    newRow.classList.add(dataRoot.split("&C=")[1]);
    //newRow.contentEditable = 'true';
    for (let i = 0; i < htmlRow.children.length; i++) {
        child = htmlRow.children[i];
        if (!child.lang || child.tagName !== 'P')
            continue;
        p = newRow.appendChild(document.createElement("p"));
        p.classList.add(child.lang.toUpperCase());
        p.classList.add(newRow.dataset.root.split("&C=")[1]);
        p.dataset.root = dataRoot;
        p.lang = child.lang;
        //p.innerText = "Insert Here Your Text "+p.lang;
        p.contentEditable = "true";
    }
    return htmlRow.insertAdjacentElement("afterend", newRow);
}
function addNewColumn(htmlParag) {
    if (htmlParag.tagName !== 'P')
        return alert('The html element passed to addNewColumn is not a paragraph');
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let langClass = prompt('You must proivde a language class (like "AR", "FR", etc. for the new column. It must not be more than 3 letters, and can be either uper case or lower case', 'AR').toUpperCase();
    if (!langClass || langClass.length > 3)
        return alert('You didn\'t provide a valid language class');
    let newColumn = document.createElement('p');
    newColumn.contentEditable = 'true';
    newColumn.classList.add(langClass);
    newColumn.lang = langClass;
    newColumn.innerText = 'New column added with class = ' + newColumn.lang;
    htmlRow.appendChild(newColumn);
    newColumn.dataset.isNew = "isNewColumn";
    htmlRow.style.gridTemplateColumns = ((100 / htmlRow.children.length).toString() + '% ').repeat(htmlRow.children.length);
    let languages = Array.from(htmlRow.children).map((p) => p.lang);
    let areas = languages.join(' ');
    areas = prompt('Do we want to rearrange the languages areas?', areas);
    areas
        .split(' ')
        .map((language) => {
        let parag = Array.from(htmlRow.children)
            .filter((p) => p.lang === language)[0];
        htmlRow.appendChild(parag); //we are arranging the html paragraphs elements in the same order as provided by the user when prompted
    });
    areas = areas.replaceAll(',', '');
    htmlRow.style.gridTemplateAreas = '"' + areas + '"';
    return htmlRow;
}
function createHtmlElementForPrayerEditingMode(tblRow, languagesArray, position = containerDiv) {
    let row, p, lang, text;
    row = document.createElement("div");
    row.classList.add("Row"); //we add 'Row' class to this div
    let dataRoot = tblRow[0];
    row.dataset.root = dataRoot;
    let actorClass = tblRow[0].split('&C=')[1];
    if (actorClass && !actorClass.includes("Title")) {
        // we don't add the actorClass if it is "Title", because in this case we add a specific class called "TitleRow" (see below)
        row.classList.add(actorClass);
    }
    else if (actorClass && actorClass.includes("Title")) {
        row.addEventListener("click", (e) => {
            e.preventDefault;
            collapseText(row);
        }); //we also add a 'click' eventListener to the 'TitleRow' elements
    }
    //looping the elements containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
    for (let x = 1; x < tblRow.length; x++) {
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
        if (actorClass === "Title" || actorClass === 'SubTitle') {
            //this means that the 'prayer' array includes the titles of the prayer since its first element ends with '&C=Title'.
            row.classList.add("TitleRow");
            if (actorClass === 'SubTitle')
                row.classList.replace('TitleRow', 'SubTitle');
            row.id = tblRow[0];
            row.tabIndex = 0; //in order to make the div focusable by using the focus() method
        }
        else if (actorClass) {
            //if the prayer is a comment like the comments in the Mass
            row.classList.add(actorClass);
        }
        else {
            //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
            p.classList.add("PrayerText");
        }
        p.dataset.root = dataRoot; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
        p.title = dataRoot;
        text = tblRow[x];
        p.classList.add(lang.toUpperCase());
        p.lang = lang; //we are adding this in order to be able to retrieve all the paragraphs in a given language by its data attribute. We need to do this in order for example to amplify the font of a given language when the user double clicks
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
    let allRows = containerDiv.querySelectorAll(".Row"), text = "[";
    allRows.forEach((row) => {
        //@ts-ignore
        text += row.dataset.root + ", \n";
    });
    text += "]";
    console.log(text);
}
function addTableToSequence(htmlParag) {
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    sequence.push(baseTitle(htmlRow.dataset.root));
    let result = prompt(sequence.join(", \n"), sequence.join(", \n"));
    sequence = result.split(", \n");
    if (document.getElementById("showSequence")) {
        let tableRows = Array.from(containerDiv.querySelectorAll(getDataRootSelector(baseTitle(htmlRow.dataset.root), true)));
        tableRows.forEach((row) => {
            createHtmlElementForPrayerEditingMode(Array.from(row.querySelectorAll("p")).map((p) => p.innerText), allLanguages, document.getElementById("showSequence"));
        });
        setCSSGridTemplate(document.getElementById("showSequence").querySelectorAll("div.Row"));
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
            createHtmlElementForPrayerEditingMode(Array.from(row.querySelectorAll("p")).map((p) => p.innerText), allLanguages, newDiv);
        });
        setCSSGridTemplate(newDiv.querySelectorAll(".Row"));
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
    let showAlert = () => alert('Make sure the cursuor is placed within the text of a paragraph/cell');
    let htmlParag = document.getSelection().focusNode.parentElement;
    if (!htmlParag)
        return showAlert(); //We check that we got a paragraph element
    while (htmlParag.tagName !== 'P' && htmlParag.parentElement)
        htmlParag = htmlParag.parentElement;
    if (htmlParag.tagName !== 'P')
        return showAlert();
    let title = htmlParag.dataset.root, lang = htmlParag.lang, table = Array.from(containerDiv.querySelectorAll(getDataRootSelector(baseTitle(title), true))), //Those are all the rows belonging to the same table, including the title
    rowIndex = table.indexOf(htmlParag.parentElement);
    //We retrieve the paragraph containing the text
    let text = htmlParag.innerText;
    let splitted = text.split("\n");
    let clean = splitted.filter((t) => t != "");
    for (let i = 0; i < clean.length; i++) {
        if (!table[i + rowIndex]) {
            //if tables rows are less than the number of paragraphs in 'clean', we add a new row to the table, and we push the new row to table
            table.push(addNewRow(table[table.length - 1].querySelector('p[lang="' + lang + '"]'), htmlParag.parentElement.dataset.root)); //we provide the data-root in order to avoid to be prompted when the addNewRow() is called
        }
        Array.from(table[i + rowIndex].children)
            .filter((p) => p.lang == lang)[0]
            //@ts-ignore
            .innerText = clean[i];
    }
}
/**
 * If htmlParag is not a Div, it checks each of its parents until it founds the DIV container. Otherwise, it triggers an alert message and returns 'undefined'
 * @param {HTMLElement} htmlParag - the html element within which hte cursor is placed
 * @returns {HTMLDivElement | undefined}
 */
function getHtmlRow(htmlParag) {
    if (!htmlParag)
        return alert('Make sure your cursor is within the cell/paragraph where the text to be splitted is found');
    while (htmlParag.tagName !== 'DIV'
        && !htmlParag.classList.contains('Row')
        && htmlParag.parentElement) {
        htmlParag = htmlParag.parentElement;
    }
    ;
    if (htmlParag.tagName !== 'DIV'
        || !htmlParag.classList.contains('Row'))
        return undefined;
    else
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
        el = createHtmlElementForPrayerEditingMode(row, allLanguages);
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
    setCSSGridTemplate(containerDiv.querySelectorAll("div.Row"));
    //Showing the titles in the right side-bar
    hideInlineButtonsDiv();
    showTitlesInRightSideBar(containerDiv.querySelectorAll("div.TitleRow, div.SubTitle"));
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
    if (arrayName === 'NewTable')
        languages = ['AR', 'FR'];
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
    let rows = Array.from(containerDiv.querySelectorAll('.Row'))
        .filter((row) => row.dataset.root.includes(title));
    if (rows.length === 0)
        return alert('Didn\'t find an element with the provided title');
    rows[0].id = rows[0].dataset.root + String(0);
    createFakeAnchor(rows[0].id);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE1vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL2VkaXRNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUM1Qjs7O0dBR0c7QUFDSCxLQUFLLFVBQVUsZUFBZSxDQUFDLEtBQWE7SUFDMUMsSUFBSSxXQUF5QixDQUFDO0lBQzlCLElBQUksS0FBSyxLQUFLLFVBQVU7UUFBRSxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkcsSUFBRyxDQUFDLFdBQVc7UUFBRSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxXQUFXO1FBQUUsT0FBTztJQUN6QixJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLFNBQVM7UUFBRSxTQUFTLEdBQUcsWUFBWSxDQUFDO0lBQ3pDLFlBQVksQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdDLFlBQVk7SUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7UUFBRSxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLG1EQUFtRDtJQUNyRyxJQUFJLEVBQWUsQ0FBQztJQUNwQixZQUFZLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUFDLDJCQUEyQjtJQUV4RCw0RkFBNEY7SUFDNUYsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMxQixLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLEVBQUUsR0FBRyxxQ0FBcUMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDM0Qsc0RBQXNEO1lBQ3RELElBQUksRUFBRTtnQkFBRSxLQUFLLENBQUMsSUFB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