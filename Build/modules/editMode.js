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
    let languages = getLanguages(entry);
    if (!languages)
        languages = allLanguages;
    if (entry === select.options[1].innerText) {
        //select.options[1] = newTable
        containerDiv.dataset.arrayName = 'PrayersArray'; //!CAUTION: if we do not set the arrayName to an existing array, it will yeild to an error when the array name will be evaluated by eval(arraName), and the saveModifiedArray() will stop without exporting the text to file
        containerDiv.dataset.editedArray = 'PrayersArray'; //We delete the dataSet value in order to avoid adding the table to the same array
        languages = []; //We empty the languages array and will fill it according to what the user will provide
        let langs = prompt('Provide the sequence of the languages columns', 'COP, FR, EN, CA, AR');
        tablesArray = [[['NewTable&D=$copticFeasts.AnyDay&C=Title']]]; //We create a string[][][] with one table having only 1 row
        let tbl1 = tablesArray[0];
        langs.split(', ').forEach(lang => {
            tbl1[0].push(lang);
            languages.push(lang);
        });
        tbl1.push([...tbl1[0]]);
        tbl1[tbl1.length - 1][0] = tbl1[tbl1.length - 1][0].split('&C=')[0];
    }
    ;
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
    }
    ;
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
    setCSS(Array.from(containerDiv.querySelectorAll("div.Row")));
    //Showing the titles in the right side-bar
    //removing the minus sign at the begining of the title
    Array.from(containerDiv.querySelectorAll("div.Title, div.SubTitle"))
        .forEach(div => Array.from(div.getElementsByTagName('P'))
        .forEach((p) => p.innerText = p.innerText.replaceAll(String.fromCharCode(plusCharCode + 1), '')));
    showTitlesInRightSideBar(Array.from(containerDiv.querySelectorAll("div.Title, div.SubTitle")));
}
/**
 * Adds the editing buttons as an appeded div to each html div (row) displayed
 * @param {HTMLElement} el - the div representing a row in the table
 */
function addEdintingButtons(getButtons) {
    let btnsDiv = document.createElement("div");
    btnsDiv.classList.add("btnsDiv");
    btnsDiv.style.display = "grid";
    btnsDiv.style.gridTemplateColumns = ((100 / 3).toString() + '% ').repeat(3);
    btnsDiv.style.top = '10px';
    btnsDiv.style.width = '90%';
    btnsDiv.style.justifySelf = 'top !important';
    btnsDiv.style.justifyItems = 'stretch';
    btnsDiv.style.position = 'fixed';
    containerDiv.prepend(btnsDiv);
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
function modifyTablesInTheirArray(container = containerDiv) {
    let array = eval(containerDiv.dataset.arrayName), arrayOfTables = [], filtered;
    if (!array || array.length === 0) {
        alert('The array was not found');
        return;
    }
    ;
    let titles = new Set();
    let containerChildren = Array.from(container.children);
    let title;
    containerChildren
        .forEach((htmlRow) => {
        title = splitTitle(htmlRow.dataset.root)[0];
        if (titles.has(title))
            return;
        titles.add(title)[0];
        arrayOfTables
            .push(convertHtmlDivElementsIntoArrayTable(containerChildren
            .filter(row => splitTitle(row.dataset.root)[0] === title)));
    });
    if (arrayOfTables.length === 0)
        return;
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
    createJSFile(replacePrefixes(array), 'Modified' + containerDiv.dataset.arrayName + '.js');
}
/**
 * Changes the 'actor' css class of a row
 * @param {HTMLElement} htmlRow - the div (row) for which we want to change the css class
 */
function changeCssClass(htmlParag, newClass) {
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return alert('Did not find the parent Div');
    let currentClass = splitTitle(htmlRow.title)[1];
    if (!newClass)
        newClass = prompt("Provide The New Class", currentClass);
    if (!newClass || newClass === currentClass)
        return;
    htmlRow.title = splitTitle(htmlRow.title)[0] + "&C=" + newClass;
    if (currentClass)
        htmlRow.classList.replace(currentClass, newClass);
    else if (!htmlRow.classList.contains(newClass))
        htmlRow.classList.add(newClass);
}
function toggleClass(element, className) {
    element.classList.toggle(className);
}
function changeTitle(htmlParag, newTitle, oldTitle) {
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    if (!oldTitle)
        oldTitle = htmlRow.title;
    if (!newTitle)
        newTitle = prompt("Provide The Title", oldTitle);
    if (!newTitle)
        return alert('You didn\'t provide a valid title');
    if (newTitle === oldTitle)
        return;
    htmlRow.dataset.root = splitTitle(newTitle)[0];
    htmlRow.title = newTitle;
    changeParagraphsDataRoot();
    function changeParagraphsDataRoot(row = htmlRow, title = newTitle) {
        Array.from(row.querySelectorAll('p'))
            .filter(child => child.dataset.root && child.title)
            .forEach(child => {
            child.dataset.root = splitTitle(title)[0];
            child.title = title;
        });
    }
    ;
    let actorClass = splitTitle(newTitle)[1];
    if (actorClass && !htmlRow.classList.contains(actorClass))
        htmlRow.classList.add(actorClass);
    (function changeSiblingsDataRoot() {
        Array.from(containerDiv.children)
            .filter((sibling) => sibling.dataset.root === splitTitle(oldTitle)[0])
            .forEach((sibling) => {
            sibling.dataset.root = splitTitle(newTitle)[0];
            let cssClass = splitTitle(sibling.title)[1];
            sibling.title = sibling.dataset.root;
            if (cssClass)
                sibling.title += '&C=' + cssClass;
            changeParagraphsDataRoot(sibling, sibling.title);
        });
    })();
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
 * Replaces the tables of the array with either the modified verisions (if we were editing an already existing table) or with the new table(s) if we added new tabless
 * @param {string} arrayName - the name of the array that we were editing containing the tables that we modified or added . Its default value is containerDiv.dataset.arrayName
 * @param {boolean} exportToFile - If true, the text of the modified array will be returned. Its default value is "true".
 * @param {boolean} exportToStorage - If true, the text of the modified array will be saved to localStorage.editedText. Its default value is "true".
 * @returns {string} the text of the modified array
 */
function saveModifiedArray(arrayName = containerDiv.dataset.arrayName, exportToFile = true, exportToStorage = true) {
    let title, titles = new Set(), tablesArray = eval(arrayName);
    if (!tablesArray)
        tablesArray = [];
    let htmlRows = Array.from(containerDiv.querySelectorAll("div.Row")); //we retrieve all the divs with 'Row' class from the DOM
    //Adding the tables' titles as unique values to the titles set
    htmlRows
        .forEach(htmlRow => {
        //for each 'Row' div in containderDiv
        title = htmlRow.dataset.root; //this is the title without '&C='
        if (titles.has(title))
            return;
        titles.add(title);
        processTableTitle(title, tablesArray);
    });
    if (!exportToFile && !exportToStorage)
        return;
    console.log("modified array = ", tablesArray);
    let text = processArrayTextForJsFile(tablesArray, containerDiv.dataset.arrayName);
    if (exportToStorage) {
        localStorage.editedText = text;
        console.log(localStorage.editedText);
    }
    ;
    if (exportToFile)
        return text;
}
;
function processTableTitle(tableTitle, tablesArray = eval(containerDiv.dataset.arrayName)) {
    if (!tablesArray) {
        alert('tablesArray is missing');
        return;
    }
    ;
    let htmlTable = Array.from(containerDiv.children)
        .filter((htmlRow) => htmlRow.dataset.root === tableTitle);
    if (htmlTable.length === 0)
        return;
    let editedTable = convertHtmlDivElementsIntoArrayTable(htmlTable);
    let oldTable = tablesArray.filter(tbl => tbl[0][0] === editedTable[0][0])[0];
    if (oldTable)
        tablesArray.splice(tablesArray.indexOf(oldTable), 1, editedTable);
    else if (confirm('No table with the same title was found in the array, do you want to add the edited table as a new table '))
        tablesArray.push(editedTable);
}
/**
 * Takes a table array, and process the strings in the array, in order to restore the prefixes and insert escape characters before the new lines, etc. in a format that suits a js file
 * @param {string[][][]} tablesArray - the string[][][] that will be processed and returned as a text the js file
 * @return {string} the text representing the array in a js file
 */
function processArrayTextForJsFile(tablesArray, arrayName) {
    //Open Array of Tables
    let text = "[";
    tablesArray.forEach((table) => processTable(table));
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
    text = arrayName + "= " + text + "];";
    return text;
}
function replacePrefixes(text) {
    text = text
        .replaceAll('"' + Prefix.bookOfHours, 'Prefix.bookOfHours+"')
        .replaceAll('"' + Prefix.doxologies, 'Prefix.doxologies+"')
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
function addNewRow(htmlParag, title) {
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let newRow = document.createElement("div"), p;
    newRow.classList.add("Row");
    newRow.dataset.isNewRow = "isNewRow";
    newRow.style.display = htmlRow.style.display;
    newRow.style.gridTemplateColumns = htmlRow.style.gridTemplateColumns;
    newRow.style.gridTemplateAreas = htmlRow.style.gridTemplateAreas;
    if (!title)
        title = prompt("Provide the Title of the new Row", htmlRow.title);
    newRow.dataset.root = splitTitle(title)[0];
    newRow.title = title;
    let cssClass = splitTitle(title)[1];
    if (cssClass)
        newRow.classList.add(cssClass);
    if (cssClass.includes('Title'))
        newRow.id = title;
    Array.from(htmlRow.children)
        .forEach((child) => {
        if (!child.lang || child.tagName !== 'P')
            return;
        p = newRow.appendChild(document.createElement("p"));
        p.title = title;
        p.dataset.root = newRow.dataset.root;
        p.lang = child.lang;
        p.classList.add(p.lang.toUpperCase());
        p.contentEditable = "true";
    });
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
    row.title = tblRow[0];
    let dataRoot = splitTitle(tblRow[0])[0];
    row.dataset.root = splitTitle(dataRoot)[0];
    let actorClass = splitTitle(row.title)[1];
    if (actorClass)
        row.classList.add(actorClass);
    if (actorClass && actorClass.includes("Title")) {
        row.addEventListener("dblClick", (e) => {
            e.preventDefault;
            collapseOrExpandText({ titleRow: row });
            row.id = row.title;
            row.tabIndex = 0; //in order to make the div focusable by using the focus() method
        });
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
        if (!actorClass) {
            //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
            p.classList.add("PrayerText");
        }
        p.dataset.root = dataRoot; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
        p.title = row.title;
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
        let tableRows = Array.from(containerDiv.children).filter((htmlRow) => htmlRow.dataset.root.startsWith(splitTitle(htmlRow.dataset.root)[0]));
        tableRows.forEach((row) => {
            createHtmlElementForPrayerEditingMode(Array.from(row.querySelectorAll("p")).map((p) => p.innerText), allLanguages, document.getElementById("showSequence"));
        });
        setCSS(Array.from(document.getElementById("showSequence").querySelectorAll("div.Row")));
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
        tableRows = Array.from(container.children)
            .filter((htmlRow) => htmlRow.dataset.root.startsWith(title));
        tableRows
            .forEach((row) => {
            createHtmlElementForPrayerEditingMode(Array.from(row.querySelectorAll("p")).map((p) => p.innerText), allLanguages, newDiv);
        });
        setCSS(Array.from(newDiv.querySelectorAll(".Row")));
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
    let dataRoot = htmlParag.dataset.root, lang = htmlParag.lang, table = Array.from(containerDiv.children)
        .filter((htmlRow) => htmlRow.dataset.root
        && htmlRow.dataset.root === splitTitle(dataRoot)[0]); //Those are all the rows belonging to the same table, including the title
    if (!table || table.length === 0)
        return alert('We didn\'t find any elements having the same data-root as the selected paragraph: ' + dataRoot);
    let rowIndex = table.indexOf(htmlParag.parentElement);
    //We retrieve the paragraph containing the text
    let splitted = htmlParag.innerText.split('\n');
    for (let i = 0; i < splitted.length; i++) {
        if (!splitted[i] || splitted[i] === '')
            continue;
        if (!table[i + rowIndex]) {
            //if tables rows are less than the number of paragraphs in 'clean', we add a new row to the table, and we push the new row to table
            table.push(addNewRow(table[table.length - 1].querySelector('p[lang="' + lang + '"]'), dataRoot));
        }
        let paragraph = Array.from(table[i + rowIndex].children)
            .filter((p) => p.lang === lang)[0];
        paragraph.textContent = '';
        paragraph.innerText = splitted[i];
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
    setCSS(Array.from(containerDiv.querySelectorAll("div.Row")));
    //Showing the titles in the right side-bar
    hideInlineButtonsDiv();
    showTitlesInRightSideBar(Array.from(containerDiv.querySelectorAll("div.Title, div.SubTitle")));
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
        languages = ['COP', 'FR', 'EN', 'CA', 'AR'];
    return languages;
}
/**
 * Converts the coptic font of the text in the selected html element, to a unicode font
 * @param {HTMLElement} htmlElement - an editable html element in which the cursor is placed, containing coptic text in a non unicode font, that we need to convert
 */
function convertCopticFontFromAPI(htmlElement) {
    const apiURL = 'https://www.copticchurch.net/coptic_language/fonts/convert';
    let fontFrom = prompt('Provide the font', 'Coptic1/CS Avva Shenouda');
    while (htmlElement.tagName !== 'P' && htmlElement.parentElement)
        htmlElement = htmlElement.parentElement;
    let text = htmlElement.textContent;
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
    if (!title)
        return alert('We couldn\'t retrieve the data-root of the current table. Make sure the cursor is placed within one of the table\'s cells');
    //We first save the changes to the array
    saveModifiedArray(containerDiv.dataset.arrayName, false, true);
    let array = eval(containerDiv.dataset.arrayName);
    let table = array.filter(tbl => splitTitle(tbl[0][0])[0] === splitTitle(title)[0])[0];
    if (!table || table.length < 1)
        return;
    array = eval(containerDiv.dataset.arrayName); //!CAUTION we needed to do this in order to unfilter the array again after it had been filtered (P.S.: the spread operator did'nt work)
    if (next)
        table = array[array.indexOf(table) + 1];
    else
        table = array[array.indexOf(table) - 1];
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