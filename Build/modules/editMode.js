let sequence = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param {HTMLSelectElement}  select - the selection element from which we selet the options
 * @param {boolean} clear - whether or not we should remove all the children of the containerDiv content
 */
function editTablesArray(select, clear = true) {
    containerDiv.style.gridTemplateColumns = '100%';
    let entry = select.selectedOptions[0].innerText;
    if (!entry)
        return;
    if (entry === select.options[0].innerText)
        return; //entries[0] === 'Choose From the List'
    if (containerDiv.dataset.arrayName
        && entry === containerDiv.dataset.arrayName
        && !confirm('Warning !! you are about to reload the same array, you will loose all your modifications. Are you sure you want to reload the same array? '))
        return; //If the selected option is the same as the already loaded array, and the user does not confirm reloading the array, we return
    containerDiv.dataset.arrayName = entry;
    if (entry === select.options[2].innerText)
        entry = prompt('Provide the function and the parameters', entry); //under development
    if (entry.includes('Fun(')) {
        eval(entry);
        return;
    }
    let tablesArray;
    containerDiv.dataset.specificTables = 'false';
    if (entry === select.options[1].innerText)
        tablesArray =
            [[['NewTable&C=Title', 'New Table Added', 'New Table Added'], ['AR', 'FR', 'EN']]]; //entries[1] == newTable
    if (!tablesArray
        && entry !== select.options[1].innerText //i.e. if it is not 'new table'
        && confirm('Do you want to edit a single or specific table(s) in the array? (if more than one table, provide the titles separated by ", " ')) {
        containerDiv.dataset.specificTables = 'true';
    }
    ;
    if (!tablesArray)
        tablesArray = eval(entry);
    if (!tablesArray)
        return;
    if (containerDiv.dataset.specificTables === 'true') {
        let tableTitle = prompt('Provide the name of the table you want to edit');
        let filteredArray = [];
        console.log('splitted = ', tableTitle.split(', '));
        tableTitle.split(', ')
            .map(title => {
            filteredArray.push(tablesArray.filter(tbl => tbl[0][0] === eval(title))[0]);
            if (!filteredArray[filteredArray.length - 1])
                console.log('the filtering gave an invalid result : ', filteredArray[filteredArray.length - 1]);
        });
        tablesArray = filteredArray;
        //tablesArray = tablesArray.filter(tbl => tbl[0][0] === tableTitle);
        if (tablesArray.length < 1)
            return alert('There is no table in the array matching the title you provided');
        console.log('filteredArray = ', filteredArray);
    }
    ;
    let languages = getLanguages(entry);
    if (!languages)
        languages = allLanguages;
    localStorage.displayMode === displayModes[0];
    //@ts-ignore
    // if (!console.save) addConsoleSaveMethod(console); //We are adding a save method to the console object
    let el;
    if (clear)
        containerDiv.innerHTML = ""; //we empty the containerDiv
    showTables(tablesArray, languages);
}
/**
 * Takes a string[][][] (i.e., and array of tables, each being a string[][], where each string[] represents a rowh),  that we want to edit,and creates html div elements representing the text of each row of eah table in the tablesArray
 * @param {string[][][]} tablesArray - an array containing the tables that we need to show and start editing
 * @param {string[]} languages - the languages included in the tables
 */
function showTables(tablesArray, languages, clear = true) {
    if (clear)
        containerDiv.innerHTML = '';
    let el;
    //We create an html div element to display the text of each row of each table in tablesArray
    tablesArray.forEach(table => {
        if (!table)
            return;
        table.forEach(row => {
            if (!row)
                return;
            el = createHtmlElementForPrayerEditingMode(row, languages);
            //We make the paragraph children of each row, editable
            if (el)
                Array.from(el.children).forEach((c) => c.contentEditable = "true");
        });
    });
    //We add the editing buttons
    addEdintingButtons();
    //Setting the CSS of the newly added rows
    setCSSGridTemplate(Array.from(containerDiv.querySelectorAll("div.Row")));
    //Showing the titles in the right side-bar
    //removing the minus sign at the begining of the title
    Array.from(containerDiv.querySelectorAll("div.Title, div.SubTitle"))
        .forEach(div => Array.from(div.getElementsByTagName('P'))
        .forEach((p) => p.innerText = p.innerText.replaceAll(String.fromCharCode(plusCharCode + 1), '')));
    showTitlesInRightSideBar(containerDiv.querySelectorAll("div.Title, div.SubTitle"));
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
            goToTableByTitleBtn,
            editNextTableBtn,
            editPreviousTableBtn
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
    let newButton = createEditingButton(() => exportToJSFile(saveModifiedArray(), containerDiv.dataset.arrayName), "Export To JS");
    btnsDiv.appendChild(newButton);
}
/**
 * Generates a file name for the JS file, including the name of the array, the date on which it was modified, and the time
 * @param {string} arrayName - the name of the array for which we want to generate a file name
 */
function getJSFileName(arrayName) {
    let today = new Date();
    return arrayName
        + '_[ModifiedOn'
        + String(today.getDate())
        + String(today.getMonth() + 1) //we add 1 because the months are counted from 0
        + String(today.getFullYear())
        + 'at'
        + String(today.getHours() + 1)
        + 'h'
        + String(today.getMinutes())
        + '].js';
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
 * Displays the next table in the array if we are in a single table editing mode
 * @param {HTMLElement} btnsDiv - the html  div in which the buttons are shown
 */
function editNextTableBtn(btnsDiv) {
    let newButton = createEditingButton(() => editNextOrPreviousTable(document.getSelection().focusNode.parentElement, true), "Next Table");
    btnsDiv.appendChild(newButton);
}
;
/**
 * Edits the previous table in the array if we are in a single table editing mode
 * @param {HTMLElement} btnsDiv - the html  div in which the buttons are shown
 */
function editPreviousTableBtn(btnsDiv) {
    let newButton = createEditingButton(() => editNextOrPreviousTable(document.getSelection().focusNode.parentElement, false), "Previous Table");
    btnsDiv.appendChild(newButton);
}
;
/**
 * Replaces each table in the array by the table in newTables[] having a title that matches the title of the target table in array[]
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
    //console.save(replacePrefixes(array), 'Modified' + containerDiv.dataset.arrayName+ '.js');
    createJSFile(replacePrefixes(array), 'Modified' + containerDiv.dataset.arrayName + '.js');
}
/**
 * Loops the divs in containerDiv, and builds a string[][][] from the elements with same data-root attribute (i.e., belonging to the sam table)
 * @returns a string[][][] of all the tables displayed in container div. Each element is a table; each div in containerDiv is a string[] of a table
 */
function getAnArrayOfTablesFromTheHtmlDivs(titles, container = containerDiv) {
    let arrayOfTables = [], table;
    if (!titles)
        titles = new Set(
        //We create an array of all the div elements with 'Row' class, and loop all the divs in this array
        Array.from(containerDiv.querySelectorAll('div.Row'))
            //We return an array of all the 'data-root' attributes of all the divs. We then create a Set of this array
            .map((div) => splitTitle(div.dataset.root)[0]));
    //We will now loop through the "titles" Set
    Array.from(titles)
        //For each title in the titles Set, 
        .forEach((title) => {
        //We create New array table
        table = [];
        //We loop the containerDiv for all the html rows having a "data-root" attribute matching this title
        container.querySelectorAll(getDataRootSelector(title, true))
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
    let className = splitTitle(htmlRow.dataset.root)[1];
    if (className === undefined)
        className = prompt("Provide The Title", splitTitle(htmlRow.dataset.root)[1]);
    if (!className)
        return;
    htmlRow.dataset.root = splitTitle(htmlRow.dataset.root)[0] + "&C=" + className;
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
            child.dataset.root = splitTitle(newTitle)[0];
            child.title = newTitle;
        }
    });
    if (newTitle.includes('&C='))
        htmlRow.classList.add(splitTitle(newTitle)[1]);
    //We will then go to each sibling and change its title if it has the same title as oldTitle
    htmlRow = htmlRow.nextElementSibling;
    while (htmlRow
        && htmlRow.tagName === 'DIV'
        && splitTitle(htmlRow.dataset.root)[0] === splitTitle(oldTitle)[0]) {
        let actorClass = splitTitle(htmlRow.dataset.root)[1];
        if (!actorClass)
            actorClass = '';
        if (actorClass !== '')
            actorClass = '&C=' + actorClass;
        changeTitle(htmlRow, splitTitle(newTitle)[0] + actorClass, oldTitle);
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
/**
 * Takes the text of a modified array, and exports it to a js file
 * @param {string} arrayText - The text of the modified array. It is a text where the prefixes and other special charachters are processed
 * @param {string} fileName -The name that will be given to the js file
 */
function exportToJSFile(arrayText, arrayName) {
    //@ts-ignore
    //console.save(arrayText, fileName);
    createJsFile(arrayText, getJSFileName(arrayName));
}
/**
 * Converts the provided array of all the html divs of a table into a string[][] representing the table rows
 * @param {HTMLDivElement[]} htmlRows - an array of html divs each reprsenting a row in a table
 * @returns {string[][]} an array representing the table
 */
function saveModifiedArray() {
    let editedArray = [], title, titles = new Set(), htmlTable, htmlRows = Array.from(containerDiv.querySelectorAll(".Row")); //we retriev all the divs with 'Row' class from the DOM
    Array.from(htmlRows)
        .forEach((htmlRow) => {
        //for each 'Row' div in containderDiv
        title = htmlRow.dataset.root; //this is the title without '&C='
        if (!titles.has(title))
            titles.add(title);
        processTableTitle(title);
    });
    function processTableTitle(tableTitle) {
        htmlTable = Array.from(containerDiv.querySelectorAll(getDataRootSelector(splitTitle(tableTitle)[0], true))); //notice that we pass the isLike = true in order to get a selector like "data-root*=" instead of 'data-root='
        if (containerDiv.dataset.specificTables === 'true') {
            //i.e. if we were editing a single or specific table(s) of the array
            editedArray = eval(containerDiv.dataset.arrayName);
            if (!editedArray) {
                alert('the array name provided could not be evaluated to a valid array: containerDiv.dataset.arrayName');
                return;
            }
            ;
            let editedTable = convertHtmlDivElementsIntoArrayTable(htmlTable);
            let oldTable = editedArray.filter(tbl => tbl[0][0] === editedTable[0][0])[0];
            if (oldTable)
                editedArray.splice(editedArray.indexOf(oldTable), 1, editedTable);
            else if (confirm('No table with the same title was found in the array, do you want to add the edited table as a new table '))
                editedArray.push(editedTable);
            return;
        }
        ;
        editedArray.push(convertHtmlDivElementsIntoArrayTable(htmlTable)); //we push the string[][] representing the table to editedArray
    }
    console.log("newArray = ", editedArray);
    let text = processArrayTextForJsFile(editedArray, containerDiv.dataset.arrayName);
    localStorage.editedText = text;
    console.log(localStorage.editedText);
    return text;
}
;
/**
 * Takes a table array, and process the strings in the array, in order to restore the prefixes and insert escape characters before the new lines, etc. in a format that suits a js file
 * @param {string[][][]} tablesArray - the string[][][] that will be processed and returned as a text the js file
 * @return {string} the text representing the array in a js file
 */
function processArrayTextForJsFile(tablesArray, arrayName) {
    //Open Array of Tables
    let text = "[";
    tablesArray.forEach((table) => { processTable(table); });
    function processTable(table) {
        if (!table || table.length < 1) {
            console.log('error with table in processTable() = ', table);
            return alert('Something went wrong');
        }
        ;
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
        if (!row || row.length < 1) {
            console.log('error with row in processTable() = ', row);
            return alert('Something went wrong');
        }
        ;
        //open row array
        text += "[\n";
        //loop row elements
        console.log(row);
        row.forEach((element) => processStringElement(element, row));
        //close row
        text += "], \n";
    }
    ;
    function processStringElement(element, row) {
        //for each string element in row[]
        element = element.replaceAll('"', '\\"'); //replacing '"" by '\"'
        element = element.replaceAll('\n', '\\n');
        if (splitTitle(row[0])[1] === 'Title')
            element = element
                .replaceAll(String.fromCharCode(plusCharCode) + ' ', '')
                .replaceAll(String.fromCharCode(plusCharCode + 1) + ' ', ''); //removing the plus(+) and minus(-à characters from the titles
        text += '"' + element + '", \n'; //adding the text of row[i](after being cleaned from the unwatted characters) to text
    }
    ;
    text = replacePrefixes(text);
    text = arrayName + "= " + text;
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
    newRow.classList.add(splitTitle(dataRoot)[1]);
    //newRow.contentEditable = 'true';
    for (let i = 0; i < htmlRow.children.length; i++) {
        child = htmlRow.children[i];
        if (!child || !child.lang || child.tagName !== 'P')
            continue;
        p = newRow.appendChild(document.createElement("p"));
        p.classList.add(child.lang.toUpperCase());
        p.classList.add(splitTitle(newRow.dataset.root)[1]);
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
    let actorClass = splitTitle(tblRow[0])[1];
    if (actorClass && !actorClass.includes("Title")) {
        // we don't add the actorClass if it is "Title", because in this case we add a specific class called "Title" (see below)
        row.classList.add(actorClass);
    }
    else if (actorClass && actorClass.includes("Title")) {
        row.addEventListener("click", (e) => {
            e.preventDefault;
            collapseText(row);
        }); //we also add a 'click' eventListener to the 'Title' elements
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
            row.classList.add(actorClass);
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
        if (lang)
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
    sequence.push(splitTitle(htmlRow.dataset.root)[0]);
    let result = prompt(sequence.join(", \n"), sequence.join(", \n"));
    sequence = result.split(", \n");
    if (document.getElementById("showSequence")) {
        let tableRows = Array.from(containerDiv.querySelectorAll(getDataRootSelector(splitTitle(htmlRow.dataset.root)[0], true)));
        tableRows.forEach((row) => {
            createHtmlElementForPrayerEditingMode(Array.from(row.querySelectorAll("p")).map((p) => p.innerText), allLanguages, document.getElementById("showSequence"));
        });
        setCSSGridTemplate(Array.from(document.getElementById("showSequence").querySelectorAll("div.Row")));
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
        setCSSGridTemplate(Array.from(newDiv.querySelectorAll(".Row")));
    });
}
/**
 * adds a 'save' method to console, which prints a data to a text or a json file
 */
function addConsoleSaveMethod(console) {
    if (console.save)
        return;
    console.save = createJsFile;
}
/**
 * Creates a downloadable JS file from the date passed as an argument, and downloads the file with the provided fileName
 * @param data
 * @param filename
 * @returns
 */
function createJsFile(data, filename) {
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
}
;
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
    let title = htmlParag.dataset.root, lang = htmlParag.lang, table = Array.from(containerDiv.querySelectorAll(getDataRootSelector(splitTitle(title)[0], true))), //Those are all the rows belonging to the same table, including the title
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
        return alert('Make sure your cursor is within the cell/paragraph where the text is to be found');
    while (!htmlParag.classList.contains('Row')
        && htmlParag.parentElement
        && htmlParag.parentElement !== containerDiv) {
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
    setCSSGridTemplate(Array.from(containerDiv.querySelectorAll("div.Row")));
    //Showing the titles in the right side-bar
    hideInlineButtonsDiv();
    showTitlesInRightSideBar(containerDiv.querySelectorAll("div.Title, div.SubTitle"));
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
        languages = ['AR', 'FR', "EN"];
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
function editNextOrPreviousTable(htmlParag, next = true) {
    if (containerDiv.dataset.specificTables !== 'true')
        return; //We don't run this function unless we are in the 'edinting specific table(s) mode'
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let title = htmlRow.dataset.root;
    let array = eval(containerDiv.dataset.arrayName);
    let table = array.filter(tbl => splitTitle(tbl[0][0])[0] === splitTitle(title)[0])[0];
    array = eval(containerDiv.dataset.arrayName); //!CAUTION we needed to do this in order to unfilter the array again after it had been filtered (P.S.: the spread operator did'nt work)
    if (!table || table.length < 1)
        return;
    if (next)
        table = array[array.indexOf(table) + 1];
    else
        table = array[array.indexOf(table) - 1];
    if (!table)
        return;
    showTables([table], getLanguages(containerDiv.dataset.arrayName));
}
;
function reArangeTablesColumns(tblTitle, arrayName) {
    //@ts-ignore
    // if (!console.save) addConsoleSaveMethod(console);
    let array = eval(arrayName);
    let table = array.filter(tbl => tbl[0][0] === tblTitle)[0];
    table.forEach(row => {
        row[row.length - 1] = row[1];
        row[1] = '';
        row.splice(1, 0, '');
        row.splice(1, 0, '');
    });
    exportToJSFile(processArrayTextForJsFile(array, arrayName), arrayName);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE1vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL2VkaXRNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUM1Qjs7OztHQUlHO0FBQ0gsU0FBUyxlQUFlLENBQUMsTUFBeUIsRUFBRSxRQUFpQixJQUFJO0lBQ3ZFLFlBQVksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO0lBQ2hELElBQUksS0FBSyxHQUFXLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBRXhELElBQUksQ0FBQyxLQUFLO1FBQUUsT0FBTztJQUVuQixJQUFJLEtBQUssS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFBRSxPQUFPLENBQUMsdUNBQXVDO0lBRTFGLElBQ0UsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTO1dBQzNCLEtBQUssS0FBSyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVM7V0FDeEMsQ0FBQyxPQUFPLENBQUMsNElBQTRJLENBQUM7UUFDekosT0FBTyxDQUFDLDhIQUE4SDtJQUV4SSxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFFdkMsSUFBSSxLQUFLLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQUUsS0FBSyxHQUFHLE1BQU0sQ0FBQyx5Q0FBeUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBLG1CQUFtQjtJQUMvSCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ1osT0FBTTtLQUNQO0lBRUQsSUFBSSxXQUF5QixDQUFDO0lBQzlCLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUU5QyxJQUFJ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