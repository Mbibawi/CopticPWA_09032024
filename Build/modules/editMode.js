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
    if (entry === select.options[1].innerText) {
        containerDiv.dataset.editedArray = ''; //We delete the dataSet value in order to avoid adding the table to the same array
        tablesArray =
            [[['NewTable&D=$copticFeasts.AnyDay&C=Title', 'COP', 'FR', 'CA', 'AR'], ['NewTable&D=$copticFeasts.AnyDay', 'COP', 'FR', 'CA', 'AR']]]; //select.options[1] = newTable
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
        title = splitTitle(htmlRow.dataset.root)[0]; //this is the title without '&C='
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
        .filter((htmlRow) => splitTitle(htmlRow.dataset.root)[0] === tableTitle);
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
        let tableRows = Array.from(containerDiv.children).filter((htmlRow) => htmlRow.dataset.root.startsWith(splitTitle(htmlRow.dataset.root)[0]));
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
        tableRows = Array.from(container.children)
            .filter((htmlRow) => htmlRow.dataset.root.startsWith(title));
        tableRows
            .forEach((row) => {
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
    let title = htmlParag.dataset.root, lang = htmlParag.lang, table = Array.from(containerDiv.children).filter((htmlRow) => htmlRow.dataset.root.startsWith(splitTitle(title)[0])), //Those are all the rows belonging to the same table, including the title
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