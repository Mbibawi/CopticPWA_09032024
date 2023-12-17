let sequence = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param {HTMLSelectElement}  select - the selection element from which we selet the options
 * @param {boolean} clear - whether or not we should remove all the children of the containerDiv content
 */
function startEditingMode(args) {
    let tablesArray;
    if (args.clear !== false)
        args.clear = true;
    if (args.select && !args.arrayName && !args.tableTitle) {
        //We deal with all the cases where a select element is passed as argument to the function. We exclude the case where arrayName is provided as an argument and the case where the tableTitle is provided.
        args.arrayName = args.select.selectedOptions[0].innerText;
        if (args.arrayName === args.select.options[0].innerText)
            return; //entries[0] === 'Choose From the List'
        if (args.arrayName === args.select.options[1].innerText)
            addNewTable();
        if (args.arrayName === args.select.options[2].innerText) {
            //under development : the user will provide a function and the function will be called when he press enter
            args.arrayName = prompt('Provide the function and the parameters', args.arrayName);
            if (!args.arrayName)
                return;
            if (args.arrayName.includes('Fun('))
                eval(args.arrayName);
            return;
        }
        else
            editSpecificTable();
    }
    else if (!args.select && args.arrayName && args.tableTitle)
        tablesArray = editSpecificTable() || []; //If the arrayName and the tableTitle are provided, it means the user wants to edit a specific table
    if (!args.arrayName)
        return;
    if (containerDiv.dataset.arrayName
        && args.arrayName === containerDiv.dataset.arrayName
        && !confirm('Warning !! you are about to reload the same array, you will loose all your modifications. Are you sure you want to reload the same array? '))
        return; //If the selected option is the same as the already loaded array, and the user does not confirm reloading the array, we return
    containerDiv.dataset.arrayName = args.arrayName;
    containerDiv.style.gridTemplateColumns = '100%';
    containerDiv.dataset.specificTables = 'false';
    let languages = getLanguages(args.arrayName) || allLanguages;
    function addNewTable() {
        args.arrayName = 'PrayersArray'; //!CAUTION: if we do not set the arrayName to an existing array, it will yeild to an error when the array name will be evaluated by eval(arrayName), and the saveModifiedArray() will stop without exporting the text to file
        languages = prompt('Provide the sequence of the languages columns', 'COP, FR, CA, AR').split(', ') || getLanguages(args.arrayName);
        tablesArray = [
            [
                ['NewTable&D=$copticFeasts.AnyDay&C=Title']
            ]
        ]; //We create a string[][][] with one string[][] (i.e. table) having only 1 string[] (i.e. row)
        tablesArray[0][0].push(...languages); //We push the languages to the first row of the first table in tablesArray. This will give us a first row like  ['NewTable&D=$copticFeasts.AnyDay&C=Title', 'COP', 'FR', 'CA', etc.]
        let secondRow = tablesArray[0][tablesArray[0].push(...tablesArray[0]) - 1][0]; //We add a second row to the table. the push() method returns the new length of the  array  after the new row has been pushed, we use the new length  to reference the first element of the 2nd row in order to remove the '&C=' from its end
        secondRow = secondRow.split('&C=')[0]; //We remove the '&C=Title' from the second row
    }
    ;
    function editSpecificTable() {
        if (!args.tableTitle //args.tableTitle was not already provided as argument
            && confirm('Do you want to edit a single or specific table(s) in the array?'))
            args.tableTitle = prompt('Provide the name of the table you want to edit  (if more than one table, provide the titles separated by ", " ');
        if (!args.tableTitle)
            return; //If despite having confirmed that he wants to edit a specifc table, the tableTitle he provided is not valid, we assume he cancelled or changed his mind, and we return
        let titles = args.tableTitle
            .split(', '); //if tableTitle is a comma separated string, it means there are multiple table titles provided
        if (!titles || titles.length < 1)
            return console.log('The provided tableTitle argument is not valid');
        if (!tablesArray)
            tablesArray = eval(args.arrayName); //No need to check that arrayName is provided because editSpecificTable is called only when arrayName is provided
        let matchingTables = [];
        titles
            .forEach(title => {
            if (title.startsWith('Prefix.'))
                title = eval(title);
            if (!title)
                return;
            matchingTables.push(...tablesArray.filter(tbl => tbl[0][0].includes(title)));
        });
        if (matchingTables.length < 1)
            return alert('There is no table in the array matching the title you provided');
        //In all the cases, if matchingTables is not empty, we set the containerDiv attribute "data-specificTables" to true
        containerDiv.dataset.specificTables = 'true';
        return matchingTables;
    }
    ;
    (function editTables() {
        if (!tablesArray)
            tablesArray = eval(args.arrayName);
        if (!tablesArray)
            return console.log('tablesArray was not set');
        localStorage.displayMode === displayModes[0]; //We make sure that we are in the 'Normal' display mode before showing the text of the tables;
        showTables({
            tablesArray: tablesArray,
            arrayName: args.arrayName,
            languages: languages,
            position: containerDiv,
            container: containerDiv,
            clear: args.clear
        });
    })();
}
/**
 * Takes a string[][][] (i.e., and array of tables, each being a string[][], where each string[] represents a rowh),  that we want to edit,and creates html div elements representing the text of each row of eah table in the tablesArray
 * @param {string[][][]} tablesArray - an array containing the tables that we need to show and start editing
 * @param {string[]} languages - the languages included in the tables
 */
function showTables(args) {
    if (!args.arrayName)
        return;
    if (!args.container)
        args.container = containerDiv;
    if (!args.position)
        args.position = containerDiv;
    if (args.clear !== false)
        args.clear = true;
    if (args.isPlaceHolder !== true)
        args.isPlaceHolder = false;
    if (args.clear === true)
        containerDiv.innerHTML = '';
    //We create an html div element to display the text of each row of each table in tablesArray
    args.tablesArray
        .forEach(table => {
        if (!table)
            return;
        table
            .forEach(row => {
            if (!row)
                return;
            createHtmlElementForPrayerEditingMode({
                tblRow: row,
                languagesArray: args.languages,
                position: args.position,
                container: args.container,
                arrayName: args.arrayName,
                isPlaceHolder: args.isPlaceHolder
            });
        });
    });
    //We add the editing buttons
    addEdintingButtons();
    //Setting the CSS of the newly added rows
    setCSS(Array.from(args.container.querySelectorAll("div.Row")));
    //Showing the titles in the right side-bar
    let titles = Array.from(args.container.querySelectorAll("div.Title, div.SubTitle")) || [];
    //removing the minus sign at the begining of the title
    titles
        .forEach(div => Array.from(div.getElementsByTagName('P'))
        .forEach((p) => p.innerText = p.innerText.replaceAll(String.fromCharCode(plusCharCode + 1), '')));
    showTitlesInRightSideBar(titles);
}
/**
 * Adds the editing buttons as an appeded div to each html div (row) displayed
 * @param {HTMLElement} el - the div representing a row in the table
 */
function addEdintingButtons() {
    let btnsDiv = document.createElement("div");
    btnsDiv.classList.add("btnsDiv");
    btnsDiv.style.display = "grid";
    btnsDiv.style.gridTemplateColumns = ((100 / 3).toString() + '% ').repeat(3);
    btnsDiv.style.top = '10px';
    btnsDiv.style.width = '90%';
    btnsDiv.style.justifySelf = 'top !important';
    btnsDiv.style.justifyItems = 'stretch';
    btnsDiv.style.position = 'fixed';
    containerDiv.insertAdjacentElement('beforebegin', btnsDiv);
    createEditingButton(() => changeTitle(document.getSelection().focusNode.parentElement), 'Change Title', btnsDiv);
    createEditingButton(() => changeCssClass(document.getSelection().focusNode.parentElement), 'Change Class', btnsDiv);
    createEditingButton(() => saveModifiedArray(false, true), 'Save', btnsDiv);
    createEditingButton(() => saveModifiedArray(true, true), 'Export to JS file', btnsDiv);
    createEditingButton(() => addTableToSequence(document.getSelection().focusNode.parentElement), 'Add Table to Sequence', btnsDiv);
    createEditingButton(() => exportSequence(), 'Export Sequence', btnsDiv);
    createEditingButton(() => addNewRow(document.getSelection().focusNode.parentElement), 'Add Row', btnsDiv);
    createEditingButton(() => addNewColumn(document.getSelection().focusNode.parentElement), 'Add Column', btnsDiv);
    createEditingButton(() => deleteRow(document.getSelection().focusNode.parentElement), 'Delete Row', btnsDiv);
    createEditingButton(() => splitParagraphsToTheRowsBelow(document.getSelection().focusNode.parentElement), 'Split Below', btnsDiv);
    createEditingButton(() => convertCopticFontFromAPI(document.getSelection().focusNode.parentElement), 'Convert Coptic Fonts', btnsDiv);
    createEditingButton(() => goToTableByTitle(), 'Go to Table', btnsDiv);
    createEditingButton(() => editNextOrPreviousTable(document.getSelection().focusNode.parentElement, true), 'Next  Table', btnsDiv);
    createEditingButton(() => editNextOrPreviousTable(document.getSelection().focusNode.parentElement, false), 'Previous Table', btnsDiv);
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
function createEditingButton(fun, label, btnsDiv) {
    let btnHtml = document.createElement('button');
    btnHtml.classList.add(inlineBtnClass);
    btnHtml.classList.add("btnEditing");
    btnHtml.innerText = label;
    btnHtml.addEventListener("click", () => fun());
    btnsDiv.appendChild(btnHtml);
    return btnHtml;
}
/**
 * Takes the text of a modified array, and exports it to a js file
 * @param {[string, string]} arrayText - the first element is the modified text of the array that we will export to a Js file. The second element is the name of the array
 */
function exportToJSFile(arrayText, arrayName) {
    if (!arrayText || !arrayName)
        return;
    createJsFile(arrayText, getJSFileName(arrayName));
}
/**
 * Replaces the tables of the array with either the modified verisions (if we were editing an already existing table) or with the new table(s) if we added new tabless
 * @param {string} arrayName - the name of the array that we were editing containing the tables that we modified or added . Its default value is containerDiv.dataset.arrayName
 * @param {boolean} exportToFile - If true, the text of the modified array will be returned. Its default value is "true".
 * @param {boolean} exportToStorage - If true, the text of the modified array will be saved to localStorage.editedText. Its default value is "true".
 * @returns {[string, string] | void} the text of the modified array
 */
function saveModifiedArray(exportToFile = true, exportToStorage = true, dataRoot) {
    if (!exportToFile && !exportToStorage)
        return;
    let title, titles = new Set(), savedArrays = new Set(), arrayName, tablesArray;
    let htmlRows = Array.from(containerDiv.querySelectorAll("div.Row, div.PlaceHolder")); //we retrieve all the divs with 'Row' class from the DOM
    if (dataRoot)
        htmlRows = htmlRows.filter(htmlRow => htmlRow.dataset.root === dataRoot);
    //Adding the tables' titles as unique values to the titles set
    htmlRows
        .forEach(htmlRow => {
        //for each 'Row' div in containderDiv
        title = htmlRow.dataset.root; //this is the title without '&C='
        if (titles.has(title))
            return;
        else
            titles.add(title);
        arrayName = htmlRow.dataset.arrayName;
        if (!arrayName)
            return console.log('We encountered a problem with one of the rows : ', htmlRow);
        else if (!savedArrays.has(arrayName))
            savedArrays.add(arrayName);
        tablesArray = eval(arrayName);
        if (!tablesArray)
            return console.log('We\'ve got a problem while executing saveOrExportArray(): title = ', title, ' and arrayName = ', arrayName);
        modifyEditedArray(title, tablesArray);
    });
    //We finally save or export each array in the savedArrays
    savedArrays
        .forEach(arrayName => saveOrExportArray(arrayName, exportToFile, exportToStorage));
}
;
/**
 * Creates string[][] tables  from the html children of containerDiv,  as edited and modified. It does so by selecting all the div elements having the same data-set-root, and converting the text in each such div element into a string[], and adds all the created string[] to a string[][].
 * It then loops the tablesArray (i.e., the original array of tables that we were editing), and looks if it contains a table (i.e. a string[][])  with the same title as the table created from the div elements. If so, it replaces this string[][] in the tablesArray table with the string[][] created from the div elements. Otherwise, it prompts the user wheter he wants to add the created string[][] as a new table at the end of the tablesArray.
 * @param {string} tableTitle - The title of a table in the tablesArray (which is a string[][][])
 * @param {string[][][]} tablesArray - the array that we were editing.
 */
function modifyEditedArray(tableTitle, tablesArray) {
    //We select all the div elements having same data-set-root attribute as the title of the table (tabeTitle)
    let htmlTable = Array.from(containerDiv.children)
        .filter(htmlRow => htmlRow.dataset.root === tableTitle);
    if (htmlTable.length === 0)
        return;
    //We start by modifiying the array to which the table belongs
    modifyArray(htmlTable);
    function modifyArray(htmlTable) {
        let editedTable = convertHtmlDivElementsIntoArrayTable(htmlTable);
        //If we have placeHolders rows that were not converted:
        editedTable.filter(row => row[1].startsWith(Prefix.placeHolder) && row.length === 1).forEach(row => { row[0] = Prefix.placeHolder; });
        let oldTable = tablesArray
            .filter(tbl => tbl[0][0] === editedTable[0][0])[0];
        if (oldTable)
            tablesArray.splice(tablesArray.indexOf(oldTable), 1, editedTable);
        else if (confirm('No table with the same title was found in the array, do you want to add the edited table as a new table '))
            tablesArray.push(editedTable);
    }
}
;
/**
 *
 * @param {string} arrayName - Name of the modified array that we want to save to local storage or export to a JS file
 * @param {boolean} exportToStorage - if true the array is saved in localStorage.editedText. Its default value is true
 * @param {boolean} exportToFile - if true the array text is export as a JS file. Its default value is true
 */
function saveOrExportArray(arrayName, exportToFile = true, exportToStorage = true) {
    let text;
    console.log("modified array = ", arrayName);
    text = processArrayTextForJsFile(eval(arrayName), arrayName);
    if (!text)
        return console.log('We\'ve got a problem when we called processArrayTextForJsFile().  arrayName = ', arrayName);
    if (exportToStorage) {
        localStorage.editedText = text;
        console.log(localStorage.editedText);
    }
    ;
    if (exportToFile)
        exportToJSFile(text, arrayName);
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
    text = replacePrefixes(text, arrayName);
    text = arrayName + "= " + text + "];";
    return text;
}
function replacePrefixes(text, arrayName) {
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
        .replaceAll('"' + Prefix.placeHolder + '"', 'Prefix.placeHolder')
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
        .replaceAll('"' + Prefix.gospelVespers, 'Prefix.gospelVespers+"');
    if (arrayName !== 'PrayersArray')
        return text;
    //Seasonal 
    text = text
        .replaceAll(giaki.AR, '"+giaki.AR+"')
        .replaceAll(giaki.FR, '"+giaki.FR+"')
        .replaceAll(giaki.COP, '"+giaki.COP+"')
        .replaceAll(giaki.CA, '"+giaki.CA+"');
    return text;
}
function replaceHtmlQuotes(innerHtml, lang) {
    if (!innerHtml.includes('<q>'))
        return innerHtml;
    if (lang === 'FR')
        return innerHtml
            .replaceAll('<q>', String.fromCharCode(171))
            .replaceAll('</q>', String.fromCharCode(187));
    else if (lang === 'AR' || lang === 'EN')
        return innerHtml
            .replaceAll('<q>', "\"")
            .replaceAll('</q>', "\"");
    return innerHtml;
}
;
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
    let arrayName = prompt('Provide the name of the array', htmlRow.dataset.arrayName);
    newRow.dataset.arrayName = arrayName;
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
function createHtmlElementForPrayerEditingMode(args) {
    if (!args.position)
        args.position = containerDiv;
    if (!args.container)
        args.container = containerDiv;
    if (args.isPlaceHolder !== true && args.tblRow[0].startsWith(Prefix.placeHolder))
        args.isPlaceHolder = true;
    let htmlRow, p, lang, text, dataRoot, actorClass;
    htmlRow = document.createElement('div');
    if (args.arrayName)
        htmlRow.dataset.arrayName = args.arrayName;
    if (!args.isPlaceHolder) {
        htmlRow.classList.add("Row"); //we add 'Row' class to this div
        htmlRow.title = args.tblRow[0];
        htmlRow.dataset.root = splitTitle(args.tblRow[0])[0];
        htmlRow.dataset.group = htmlRow.dataset.root;
        actorClass = splitTitle(args.tblRow[0])[1] || '';
        htmlRow.classList.add(actorClass);
    }
    else if (args.isPlaceHolder) {
        args.tblRow = [...args.tblRow]; //We create a copy of the row
        let children = Array.from(args.container.children);
        let lastChild = children[children.length - 1];
        htmlRow.classList.add('PlaceHolder');
        htmlRow.dataset.isPlaceHolder = args.tblRow[1]; //This is the title of the table referrenced by the placeHolder row
        htmlRow.dataset.root = lastChild.dataset.root; //We add as data-root the data-root of the previous element appended to the container. We do this because we want the placeHolder div to be part of the main table and be retrieved with the same data root and title
        htmlRow.title = lastChild.title; //We do the same for the data-title attribute as for the data-root. 
        htmlRow.dataset.goup = lastChild.dataset.group; //Same as above
        htmlRow.style.backgroundColor = 'grey';
        let copyLangs = [...args.languagesArray];
        htmlRow.addEventListener('click', () => {
            let referrencedTblTitle = args.tblRow[1]; //When tblRow is a 'PlaceHoder', it has 2 elements: the first of which is  'Prefix.placeHolder' and the second (i.e., args.tblRow[1]) is the title of the table that is refrenced
            let shown = Array.from(containerDiv.querySelectorAll('div'))
                .filter(div => div.dataset.isPlaceHolder === referrencedTblTitle);
            if (shown.length > 0) {
                saveModifiedArray(false, true, referrencedTblTitle);
                shown.forEach(div => div.remove());
                return;
            }
            ;
            let tblsArray = getTablesArrayFromTitlePrefix(referrencedTblTitle);
            let created = tblsArray
                .find(tbl => splitTitle(tbl[0][0])[0] === referrencedTblTitle)
                .reverse()
                .map(row => {
                return createHtmlElementForPrayerEditingMode({
                    tblRow: row,
                    languagesArray: copyLangs,
                    position: {
                        el: htmlRow,
                        beforeOrAfter: 'afterend'
                    },
                    container: args.container,
                    arrayName: getArrayNameFromArray(tblsArray) //This is the array name of the embeded table not for the table including the placeHolder referencing the embeded table
                });
            });
            setCSS(created);
            //Prefix.massStBasil + 'Reconciliation' 
            let arrayName = getArrayNameFromArray(getTablesArrayFromTitlePrefix(args.tblRow[1]));
            created
                .forEach(div => {
                div.dataset.isPlaceHolder = args.tblRow[1];
                div.dataset.arrayName = arrayName;
                Array.from(div.children)
                    .forEach((paragraph) => {
                    paragraph.contentEditable = "true";
                });
            });
        });
        args.languagesArray = ['FR', 'FR', 'FR']; //! The languagesArray must be changed after the addEventListner has been added to the placeHolder row
    }
    ;
    if (actorClass && actorClass.includes("Title")) {
        htmlRow.addEventListener("dblClick", (e) => {
            e.preventDefault;
            collapseOrExpandText({ titleRow: htmlRow });
            //--------->  htmlRow.id = row.title;
            htmlRow.tabIndex = 0; //in order to make the div focusable by using the focus() method
        });
    }
    //looping the elements containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
    for (let x = 1; x < args.tblRow.length; x++) {
        //x starts from 1 because prayers[0] is the id
        if (actorClass &&
            (actorClass === "Comment" || actorClass === "CommentText")) {
            //this means it is a comment
            x == 1 ? (lang = args.languagesArray[1]) : (lang = args.languagesArray[3]);
        }
        else {
            lang = args.languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
        } //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
        p = document.createElement("p"); //we create a new <p></p> element for the text of each language in the 'prayer' array (the 'prayer' array is constructed like ['prayer id', 'text in AR, 'text in FR', ' text in COP', 'text in Language', etc.])
        if (!actorClass) {
            //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
            p.classList.add("PrayerText");
        }
        p.dataset.root = dataRoot; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
        p.title = htmlRow.title;
        text = args.tblRow[x];
        if (lang)
            p.classList.add(lang.toUpperCase());
        p.lang = lang; //we are adding this in order to be able to retrieve all the paragraphs in a given language by its data attribute. We need to do this in order for example to amplify the font of a given language when the user double clicks
        p.innerText = text;
        p.contentEditable = 'true';
        htmlRow.appendChild(p); //the row which is a <div></div>, will encapsulate a <p></p> element for each language in the 'prayer' array (i.e., it will have as many <p></p> elements as the number of elements in the 'prayer' array)
    }
    //@ts-ignore
    args.position.el
        ? //@ts-ignore
            args.position.el.insertAdjacentElement(position.beforeOrAfter, htmlRow)
        : //@ts-ignore
            args.position.appendChild(htmlRow);
    return htmlRow;
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
            createHtmlElementForPrayerEditingMode({
                tblRow: Array.from(row.querySelectorAll("p")).map((p) => p.innerText),
                languagesArray: allLanguages,
                position: document.getElementById("showSequence")
            });
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
            createHtmlElementForPrayerEditingMode({
                tblRow: Array.from(row.querySelectorAll("p")).map((p) => p.innerText),
                languagesArray: allLanguages,
                position: newDiv
            });
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
function splitParagraphsToTheRowsBelow(htmlParag) {
    //Sometimes when copied, the text is inserted as a SPAN or a div, we will go up until we get the paragraph element itslef
    let showAlert = () => alert('Make sure the cursuor is placed within the text of a paragraph/cell');
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
    saveModifiedArray(false, true);
    let title = '';
    //@ts-ignore
    if (containerDiv.children.length > 0 && containerDiv.children[0].dataset.root)
        title = containerDiv.children[0].dataset.root;
    title = prompt('Provide the title you want to go to. If you want to show the readings of a given day, you provide the date of the readings in this format\"ReadignsDate = [date]\"', title);
    if (title.startsWith('ReadingsDate = ')) {
        editDayReadings(title.split('ReadingsDate = ')[1]);
        return;
    }
    ;
    let rows = Array.from(containerDiv.querySelectorAll('.Row'))
        .filter((row) => row.dataset.root.includes(title));
    if (rows.length === 0) {
        startEditingMode({
            tableTitle: title,
            clear: true
        });
        return;
    }
    if (rows.length === 0)
        return alert('Didn\'t find an element with the provided title');
    rows[0].id = rows[0].dataset.root + String(0);
    createFakeAnchor(rows[0].id);
}
function editNextOrPreviousTable(htmlParag, next = true) {
    if (containerDiv.dataset.specificTables !== 'true' || !containerDiv.dataset.arrayName)
        return; //We don't run this function unless we are in the 'edinting specific table(s) mode'
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let title = htmlRow.dataset.root;
    if (!title)
        return alert('We couldn\'t retrieve the data-root of the current table. Make sure the cursor is placed within one of the table\'s cells');
    //We first save the changes to the array
    saveModifiedArray(false, true);
    let arrayName = containerDiv.dataset.arrayName;
    let array = eval(arrayName);
    let table = array.filter(tbl => splitTitle(tbl[0][0])[0] === splitTitle(title)[0])[0];
    if (!table || table.length < 1)
        return;
    array = eval(arrayName); //!CAUTION we needed to do this in order to unfilter the array again after it had been filtered (P.S.: the spread operator did'nt work)
    if (next)
        table = array[array.indexOf(table) + 1];
    else
        table = array[array.indexOf(table) - 1];
    showTables({
        tablesArray: [table],
        arrayName: arrayName,
        languages: getLanguages(arrayName),
        position: containerDiv,
        container: containerDiv
    });
    scrollToTop();
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
function editDayReadings(date) {
    if (date)
        saveModifiedArray(true, true);
    if (!date)
        date = prompt('Provide the date as DDMM');
    if (!date)
        return;
    containerDiv.innerHTML = '';
    for (let arrayName in ReadingsArrays) {
        ReadingsArrays[arrayName]
            .filter(table => table[0][0].includes(date))
            .forEach(table => {
            startEditingMode({
                //    arrayName: 'ReadingsArrays.' + arrayName,
                tableTitle: table[0][0],
                clear: false
            });
        });
    }
    ;
}
function showBtnInEditingMode(btn) {
    if (containerDiv.children.length > 0)
        saveModifiedArray(true, true);
    let container = containerDiv;
    if (btn.docFragment)
        container = btn.docFragment;
    hideExpandableButtonsPannel();
    expandableBtnsPannel.innerHTML = "";
    containerDiv.style.gridTemplateColumns = "100%";
    if (btn.onClick)
        btn.onClick();
    if (btn.prayersSequence &&
        btn.prayersArray &&
        btn.languages)
        showPrayersFromSequence();
    closeSideBar(leftSideBar);
    function showPrayersFromSequence() {
        btn.prayersSequence
            .forEach(title => {
            if (!title.includes('&D='))
                return;
            let array = getTablesArrayFromTitlePrefix(title);
            let arrayName = getArrayNameFromArray(array);
            if (!arrayName)
                return;
            showTables({
                tablesArray: [array.find(tbl => splitTitle(tbl[0][0])[0] === title)],
                arrayName: arrayName,
                languages: getLanguages(arrayName),
                position: container,
                container: container,
                clear: false
            });
        });
    }
    ;
    /**
     *          .forEach(tbl => {
             tbl
               .forEach(row => {
                 createHtmlElementForPrayerEditingMode(row, btn.languages, container, container)
               })
           })
     */
    /*     showPrayers({ btn: btn, clearContainerDiv: true, clearRightSideBar: true, container: container, languages: btn.languages, prayersSequence: btn.prayersSequence, position: container });
        }; */
    //if (btn.afterShowPrayers) btn.afterShowPrayers();
    //Important ! : setCSSGridTemplate() MUST be called after btn.afterShowPrayres()
    //  setCSS(Array.from(container.querySelectorAll("div.Row"))); //setting the number and width of the columns for each html element with class 'Row'
    if (btn.children && btn.children.length > 0) {
        //We will not empty the left side bar unless the btn has children to be shown  in the side bar instead of the children of the btn's parent (btn being itself one of those children)
        //!CAUTION, this must come after btn.onClick() is called because some buttons are not initiated with children, but their children are added  when their onClick()  is called
        sideBarBtnsContainer.innerHTML = "";
        btn.children.forEach((childBtn) => {
            //for each child button that will be created, we set btn as its parent in case we need to use this property on the button
            if (btn.btnID != btnGoBack.btnID)
                childBtn.parentBtn = btn;
            //We create the html element reprsenting the childBtn and append it to btnsDiv
            createBtn({ btn: childBtn, btnsContainer: sideBarBtnsContainer, btnClass: childBtn.cssClass });
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
        createBtn({ btn: btnMain, btnsContainer: sideBarBtnsContainer, btnClass: btnMain.cssClass });
    }
    if (btn.docFragment)
        containerDiv.appendChild(btn.docFragment);
    if (btn.btnID === btnMain.btnID)
        addSettingsButton();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE1vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL2VkaXRNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUM1Qjs7OztHQUlHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxJQUt6QjtJQUVDLElBQUksV0FBeUIsQ0FBQztJQUU5QixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSztRQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBRTVDLElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDO1FBQ3BELHdNQUF3TTtRQUV4TSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUUxRCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUFFLE9BQU8sQ0FBQyx1Q0FBdUM7UUFFeEcsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFBRyxXQUFXLEVBQUUsQ0FBQztRQUV4RSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO1lBQ3ZELDBHQUEwRztZQUMxRyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyx5Q0FBeUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU87WUFDNUIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxRCxPQUFNO1NBQ1A7O1lBQ0ssaUJBQWlCLEVBQUUsQ0FBQztLQUMzQjtTQUVJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVU7UUFBRSxXQUFXLEdBQUcsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxvR0FBb0c7SUFFek0sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztJQUU3QixJQUNHLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUztXQUMzQixJQUFJLENBQUMsU0FBUyxLQUFLLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUztXQUNqRCxDQUFDLE9BQU8sQ0FBQyw0SUFBNEksQ0FBQztRQUN6SixPQUFPLENBQUMsOEhBQThIO0lBRXhJLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDaEQsWUFBWSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUM7SUFDaEQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRTlDLElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksWUFBWSxDQUFDO0lBRTdELFNBQVMsV0FBVztRQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxDQUFBLDZOQUE2TjtRQUMvUCxTQUFTLEdBQUcsTUFBTSxDQUFDLCtDQUErQyxFQUFFLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFakksV0FBVyxHQUFHO1lBQ1o7Z0JBQ0UsQ0FBQyx5Q0FBeUMsQ0FBQzthQUM1QztTQUNKLENBQUMsQ0FBQSw2RkFBNkY7UUFFL0YsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUEsb0xBQW9MO1FBR3ZOLElBQUksU0FBUyxHQUFVLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyw2T0FBNk87UUFFalUsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyw4Q0FBOEM7SUFDekYsQ0FBQztJQUFBLENBQUM7SUFHRixTQUFTLGlCQUFpQjtRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxzREFBc0Q7ZUFDdEUsT0FBTyxDQUFDLGlFQUFpRSxDQUFDO1lBQzdFLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLGdIQUFnSCxDQUFDLENBQUM7UUFFL0ksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTyxDQUFDLHVLQUF1SztRQUVyTSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVTthQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyw4RkFBOEY7UUFFOUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7WUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLENBQUMsQ0FBQztRQUV0RyxJQUFJLENBQUMsV0FBVztZQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsaUhBQWlIO1FBRXZLLElBQUksY0FBYyxHQUFpQixFQUFFLENBQUM7UUFFcEMsTUFBTTthQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNmLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7Z0JBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVyRCxJQUFJLENBQUMsS0FBSztnQkFBRSxPQUFPO1lBRW5CLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7UUFFUCxJQUFJLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDLGdFQUFnRSxDQUFDLENBQUM7UUFFOUcsbUhBQW1IO1FBQ25ILFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztRQUM3QyxPQUFPLGNBQWMsQ0FBQTtJQUN2QixDQUFDO0lBQUEsQ0FBQztJQUdGLENBQUMsU0FBUyxVQUFVO1FBQ2xCLElBQUksQ0FBQyxXQUFXO1lBQUUsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLFdBQVc7WUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUVoRSxZQUFZLENBQUMsV0FBVyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLDhGQUE4RjtRQUUzSSxVQUFVLENBQUM7WUFDVCxXQUFXLEVBQUUsV0FBVztZQUN4QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsU0FBUyxFQUFFLFNBQVM7WUFDcEIsUUFBUSxFQUFFLFlBQVk7WUFDdEIsU0FBUyxFQUFFLFlBQVk7WUFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDUCxDQUFDO0FBQ0Q7Ozs7R0FJRztBQUNILFNBQVMsVUFBVSxDQUFDLElBUW5CO0lBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztJQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7UUFBRSxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztJQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7UUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztJQUNqRCxJQUFHLElBQUksQ0FBQyxLQUFLLEtBQUksS0FBSztRQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQzFDLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxJQUFJO1FBQUUsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFFNUQsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUk7UUFBRSxZQUFZLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUNyRCw0RkFBNEY7SUFDNUYsSUFBSSxDQUFDLFdBQVc7U0FDYixPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbkIsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPO1FBQ2YsS0FBSzthQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNuQixJQUFJLENBQUMsR0FBRztnQkFBRSxPQUFPO1lBQ2pCLHFDQUFxQyxDQUFDO2dCQUNwQyxNQUFNLEVBQUMsR0FBRztnQkFDVixjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQzlCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDdkIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3pCLGFBQWEsRUFBQyxJQUFJLENBQUMsYUFBYTthQUFDLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUEsNEJBQTRCO0lBQy9CLGtCQUFrQixFQUFFLENBQUM7SUFDckIseUNBQXlDO0lBQ3pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELDBDQUEwQztJQUV4QyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUMsQ0FBcUIsSUFBSSxFQUFFLENBQUM7SUFDaEgsc0RBQXNEO0lBQ3RELE1BQU07U0FDSCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FDYixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN4QyxPQUFPLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRSxDQUMxQixDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNsRixDQUFDLENBQUM7SUFFTCx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxrQkFBa0I7SUFDekIsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNqQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7SUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLGdCQUFnQixDQUFDO0lBQzdDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztJQUN2QyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFFakMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUV6RCxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFbkgsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXBILG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFM0UsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXZGLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFakksbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFeEUsbUJBQW1CLENBQUMsR0FBRSxFQUFFLENBQUEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hHLG1CQUFtQixDQUFDLEdBQUUsRUFBRSxDQUFBLFlBQVksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RyxtQkFBbUIsQ0FBQyxHQUFFLEVBQUUsQ0FBQSxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0csbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsNkJBQTZCLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFbEksbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxzQkFBc0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUV0SSxtQkFBbUIsQ0FBQyxHQUFFLEVBQUUsQ0FBQSxnQkFBZ0IsRUFBRSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRSxtQkFBbUIsQ0FBQyxHQUFFLEVBQUUsQ0FBQSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEksbUJBQW1CLENBQUMsR0FBRSxFQUFFLENBQUEsdUJBQXVCLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFcEksQ0FBQztBQU9IOzs7R0FHRztBQUNILFNBQVMsYUFBYSxDQUFDLFNBQWlCO0lBQ3RDLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDdkIsT0FBTyxTQUFTO1VBQ2QsY0FBYztVQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7VUFDdkIsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQSxnREFBZ0Q7VUFDMUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztVQUMzQixJQUFJO1VBQ0osTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRSxDQUFDLENBQUM7VUFDNUIsR0FBRztVQUNGLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7VUFDMUIsTUFBTSxDQUFDO0FBR1gsQ0FBQztBQUdEOzs7O0dBSUc7QUFDSCxTQUFTLFNBQVMsQ0FBQyxTQUFzQjtJQUN2QyxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFnQixDQUFDO0lBQ25ELElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUNyQixJQUFJLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxLQUFLLEtBQUs7UUFBRSxPQUFPLENBQUEsNENBQTRDO0lBQ3ZILE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsU0FBc0IsRUFBRSxRQUFnQjtJQUM5RCxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQzFELElBQUksWUFBWSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEQsSUFBSSxDQUFDLFFBQVE7UUFBRSxRQUFRLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3hFLElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxLQUFLLFlBQVk7UUFBRSxPQUFPO0lBRW5ELE9BQU8sQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsUUFBUSxDQUFDO0lBRWhFLElBQUksWUFBWTtRQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMvRCxJQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1FBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEYsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLE9BQW9CLEVBQUUsU0FBaUI7SUFDMUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLFNBQXNCLEVBQUUsUUFBaUIsRUFBRSxRQUFnQjtJQUM5RSxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPO0lBQ3JCLElBQUcsQ0FBQyxRQUFRO1FBQUUsUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDdkMsSUFBSSxDQUFDLFFBQVE7UUFBRSxRQUFRLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hFLElBQUksQ0FBQyxRQUFRO1FBQUUsT0FBTyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUNqRSxJQUFJLFFBQVEsS0FBSyxRQUFRO1FBQUUsT0FBTztJQUVsQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0MsT0FBTyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7SUFFekIsd0JBQXdCLEVBQUUsQ0FBQztJQUUzQixTQUFTLHdCQUF3QixDQUFDLE1BQXNCLE9BQXlCLEVBQUUsUUFBZSxRQUFRO1FBQ3hHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2xDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUM7YUFDbEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2YsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBQ3JCLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUFBLENBQUM7SUFFRixJQUFJLFVBQVUsR0FBVyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHakQsSUFBRyxVQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUU1RixDQUFDLFNBQVMsc0JBQXNCO1FBQzlCLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQzthQUM5QixNQUFNLENBQUMsQ0FBQyxPQUFvQixFQUFFLEVBQUUsQ0FDL0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xELE9BQU8sQ0FBQyxDQUFDLE9BQW9CLEVBQUUsRUFBRTtZQUNoQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ3JDLElBQUcsUUFBUTtnQkFBRSxPQUFPLENBQUMsS0FBSyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUU7WUFDaEQsd0JBQXdCLENBQUMsT0FBeUIsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckUsQ0FBQyxDQUFDLENBQUE7SUFFSixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRVQsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxtQkFBbUIsQ0FDMUIsR0FBYSxFQUNiLEtBQWEsRUFDYixPQUFtQjtJQUVuQixJQUFJLE9BQU8sR0FBcUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNoRSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN0QyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwQyxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUMxQixPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDL0MsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QixPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsU0FBaUIsRUFBRSxTQUFnQjtJQUN6RCxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsU0FBUztRQUFFLE9BQU87SUFDckMsWUFBWSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBR0Q7Ozs7OztHQU1HO0FBQ0gsU0FBUyxpQkFBaUIsQ0FBQyxlQUF3QixJQUFJLEVBQUUsa0JBQTJCLElBQUksRUFBRSxRQUFnQjtJQUV4RyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsZUFBZTtRQUFFLE9BQU87SUFFOUMsSUFBSSxLQUFhLEVBQ2YsTUFBTSxHQUFnQixJQUFJLEdBQUcsRUFBRSxFQUMvQixXQUFXLEdBQWdCLElBQUksR0FBRyxFQUFFLEVBQ3BDLFNBQWdCLEVBQ2hCLFdBQXdCLENBQUM7SUFFM0IsSUFBSSxRQUFRLEdBQXFCLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLHdEQUF3RDtJQUVoSyxJQUFJLFFBQVE7UUFBRSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDO0lBRXZGLDhEQUE4RDtJQUM5RCxRQUFRO1NBQ0wsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ2pCLHFDQUFxQztRQUN2QyxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxpQ0FBaUM7UUFDN0QsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU87O1lBQ3pCLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdkIsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO1FBRXRDLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGtEQUFrRCxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQzNGLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztZQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFakUsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU5QixJQUFJLENBQUMsV0FBVztZQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxvRUFBb0UsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFbEosaUJBQWlCLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3hDLENBQUMsQ0FDRixDQUFDO0lBRUYseURBQXlEO0lBQ3pELFdBQVc7U0FDUixPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFFdkYsQ0FBQztBQUFBLENBQUM7QUFFRTs7Ozs7R0FLRztBQUNILFNBQVMsaUJBQWlCLENBQUMsVUFBa0IsRUFBRSxXQUF5QjtJQUN0RSwwR0FBMEc7SUFFMUcsSUFBSSxTQUFTLEdBQ1gsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBNEMsQ0FBQztTQUNsRSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FDaEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFxQixDQUFDO0lBRS9ELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTztJQUVuQyw2REFBNkQ7SUFDN0QsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTNCLFNBQVMsV0FBVyxDQUFDLFNBQTBCO1FBQzdDLElBQUksV0FBVyxHQUFlLG9DQUFvQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlFLHVEQUF1RDtRQUN2RCxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxJLElBQUksUUFBUSxHQUNWLFdBQVc7YUFDVixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckQsSUFBSSxRQUFRO1lBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUUzRSxJQUFJLE9BQU8sQ0FBQywwR0FBMEcsQ0FBQztZQUMzSCxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7QUFDSCxDQUFDO0FBQUEsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0gsU0FBUyxpQkFBaUIsQ0FBQyxTQUFpQixFQUFFLGVBQXVCLElBQUksRUFBRSxrQkFBeUIsSUFBSTtJQUN0RyxJQUFJLElBQVksQ0FBQztJQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRTdDLElBQUksR0FBRyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFN0QsSUFBSSxDQUFDLElBQUk7UUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0ZBQWdGLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFekgsSUFBSSxlQUFlLEVBQUU7UUFDZixZQUFZLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUMxQztJQUFBLENBQUM7SUFFRixJQUFHLFlBQVk7UUFBRSxjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFBQSxDQUFDO0FBR0Y7Ozs7R0FJRztBQUNILFNBQVMseUJBQXlCLENBQUMsV0FBeUIsRUFBRSxTQUFnQjtJQUM1RSxzQkFBc0I7SUFDdEIsSUFBSSxJQUFJLEdBQVcsR0FBRyxDQUFDO0lBQ3ZCLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFpQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUVoRSxTQUFTLFlBQVksQ0FBQyxLQUFpQjtRQUNyQyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDekQsT0FBTyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtTQUNyQztRQUFBLENBQUM7UUFDSixrQkFBa0I7UUFDbEIsSUFBSSxJQUFJLEtBQUssQ0FBQztRQUNkLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFhLEVBQUUsRUFBRTtZQUM5QixlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDSCxhQUFhO1FBQ2IsSUFBSSxJQUFJLE9BQU8sQ0FBQztJQUNsQixDQUFDO0lBQUEsQ0FBQztJQUNGLFNBQVMsZUFBZSxDQUFDLEdBQWE7UUFDcEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztZQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ3JELE9BQU8sS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUE7U0FDckM7UUFBQSxDQUFDO1FBRUYsZ0JBQWdCO1FBQ2hCLElBQUksSUFBSSxLQUFLLENBQUM7UUFDZCxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBYyxFQUFDLEVBQUUsQ0FBQSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNqRSxXQUFXO1FBQ1gsSUFBSSxJQUFJLE9BQU8sQ0FBQztJQUNsQixDQUFDO0lBQUEsQ0FBQztJQUVGLFNBQVMsb0JBQW9CLENBQUMsT0FBZSxFQUFFLEdBQWE7UUFDMUQsa0NBQWtDO1FBQ2xDLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLHVCQUF1QjtRQUNqRSxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFMUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTztZQUNuQyxPQUFPLEdBQUcsT0FBTztpQkFDZCxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDO2lCQUN2RCxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsOERBQThEO1FBRS9ILElBQUksSUFBSSxHQUFHLEdBQUMsT0FBTyxHQUFDLE9BQU8sQ0FBQyxDQUFDLHFGQUFxRjtJQUNwSCxDQUFDO0lBQUEsQ0FBQztJQUNGLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3hDLElBQUksR0FBRyxTQUFTLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7SUFDdEMsT0FBUSxJQUFJLENBQUE7QUFDZCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsSUFBWSxFQUFFLFNBQWdCO0lBQ3JELElBQUksR0FBRyxJQUFJO1NBQ1IsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLHNCQUFzQixDQUFDO1NBQzVELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQztTQUMxRCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsd0JBQXdCLENBQUM7U0FDaEUsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLHVCQUF1QixDQUFDO1NBQzlELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQztTQUN4RCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsdUJBQXVCLENBQUM7U0FDOUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDO1NBQ2xFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsQ0FBQztTQUNsRSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUM7U0FDNUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDO1NBQ2xFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQztTQUMxRCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUM7U0FDNUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLHNCQUFzQixDQUFDO1NBQzVELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSx3QkFBd0IsQ0FBQztTQUNoRSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUM7U0FDMUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDO1NBQ2hFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsQ0FBQztTQUNsRSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEdBQUcsR0FBRyxFQUFFLG9CQUFvQixDQUFDO1FBQ2pFLFVBQVU7U0FDVCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUM7U0FDMUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDO1NBQ2xELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQztTQUMxRCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUM7U0FDbEQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDO1NBQ2xFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSx3QkFBd0IsQ0FBQztTQUNoRSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUM7U0FDMUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLHFCQUFxQixDQUFDO1NBQzFELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxzQkFBc0IsQ0FBQztTQUM1RCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsd0JBQXdCLENBQUMsQ0FBQTtJQUNuRSxJQUFJLFNBQVMsS0FBSyxjQUFjO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDNUMsV0FBVztJQUNiLElBQUksR0FBRyxJQUFJO1NBQ1IsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDO1NBQ3BDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQztTQUNwQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUM7U0FDdEMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDeEMsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxTQUFpQixFQUFFLElBQVc7SUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQUUsT0FBTyxTQUFTLENBQUM7SUFDakQsSUFBSSxJQUFJLEtBQUssSUFBSTtRQUNmLE9BQU8sU0FBUzthQUNiLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMzQyxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUU3QyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUk7UUFDckMsT0FBTyxTQUFTO2FBQ2IsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7YUFDdkIsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5QixPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBQUEsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxTQUFTLFNBQVMsQ0FBQyxTQUFzQixFQUFFLEtBQWM7SUFDdkQsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUVyQixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUN4QyxDQUF1QixDQUFDO0lBRTFCLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztJQUNyQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUM3QyxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUM7SUFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO0lBRWpFLElBQUksQ0FBQyxLQUFLO1FBQUUsS0FBSyxHQUFHLE1BQU0sQ0FDeEIsa0NBQWtDLEVBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQ2QsQ0FBQztJQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQyxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsK0JBQStCLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRSxTQUFTLENBQUU7SUFDckMsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLElBQUksUUFBUTtRQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFBRSxNQUFNLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUVsRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7U0FDekIsT0FBTyxDQUFDLENBQUMsS0FBa0IsRUFBRSxFQUFFO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssR0FBRztZQUFFLE9BQU87UUFDakQsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7SUFDN0IsQ0FBQyxDQUNBLENBQUM7SUFFSixPQUFPLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFnQixDQUFDO0FBQzFFLENBQUM7QUFDRCxTQUFTLFlBQVksQ0FBQyxTQUFzQjtJQUMxQyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEtBQUssR0FBRztRQUFFLE9BQU8sS0FBSyxDQUFDLDREQUE0RCxDQUFDLENBQUM7SUFDMUcsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBZ0IsQ0FBQztJQUNuRCxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFDckIsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLDRKQUE0SixFQUFFLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pNLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQUUsT0FBTyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztJQUNuRyxJQUFJLFNBQVMsR0FBZSxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELFNBQVMsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO0lBQ25DLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO0lBQzNCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsZ0NBQWdDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztJQUN4RSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQztJQUN4QyxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUd4SCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3RSxJQUFJLEtBQUssR0FBVSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZDLEtBQUssR0FBRyxNQUFNLENBQUMsOENBQThDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFcEUsS0FBSztTQUNGLEtBQUssQ0FBQyxHQUFHLENBQUM7U0FDVixHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtRQUNoQixJQUFJLEtBQUssR0FDUCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7YUFDekIsTUFBTSxDQUFDLENBQUMsQ0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBZ0IsQ0FBQztRQUN2RSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsdUdBQXVHO0lBQ3JJLENBQUMsQ0FBQyxDQUFDO0lBQ0wsS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7SUFFdEQsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQUVELFNBQVMscUNBQXFDLENBQUMsSUFVOUM7SUFFQyxJQUFHLENBQUMsSUFBSSxDQUFDLFFBQVE7UUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztJQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7UUFBRSxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztJQUNuRCxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFBRSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztJQUU1RyxJQUFJLE9BQXVCLEVBQ3pCLENBQXVCLEVBQ3ZCLElBQVksRUFDWixJQUFZLEVBQ1osUUFBZ0IsRUFDaEIsVUFBa0IsQ0FBQztJQUVyQixPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxJQUFJLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUUvRCxJQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBQztRQUN2QixPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdDQUFnQztRQUM5RCxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztRQUM3QyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxFQUFFLENBQUM7UUFDbEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDakM7U0FDSSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNkJBQTZCO1FBQzdELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQXFCLENBQUM7UUFDdkUsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG1FQUFtRTtRQUNuSCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLHFOQUFxTjtRQUNwUSxPQUFPLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxvRUFBb0U7UUFDckcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxlQUFlO1FBQy9ELE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztRQUN2QyxJQUFJLFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRXpDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQzlCLEdBQUcsRUFBRTtZQUNILElBQUksbUJBQW1CLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlMQUFpTDtZQUNyTyxJQUFJLEtBQUssR0FDUCxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDL0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssbUJBQW1CLENBQUMsQ0FBQztZQUNsRSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNwQixpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixDQUFDLENBQUM7Z0JBQ3RELEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDbkMsT0FBTTthQUNMO1lBQUEsQ0FBQztZQUNGLElBQUksU0FBUyxHQUFHLDZCQUE2QixDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDckUsSUFBSSxPQUFPLEdBQ1QsU0FBUztpQkFDTixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssbUJBQW1CLENBQUM7aUJBQzdELE9BQU8sRUFBRTtpQkFDVCxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ1QsT0FBTyxxQ0FBcUMsQ0FBQztvQkFDM0MsTUFBTSxFQUFDLEdBQUc7b0JBQ1YsY0FBYyxFQUFFLFNBQVM7b0JBQ3pCLFFBQVEsRUFBQzt3QkFDUCxFQUFFLEVBQUUsT0FBTzt3QkFDWCxhQUFhLEVBQUUsVUFBVTtxQkFDMUI7b0JBQ0QsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO29CQUN6QixTQUFTLEVBQUUscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUMsdUhBQXVIO2lCQUNwSyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUMsQ0FBQTtZQUVOLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoQix3Q0FBd0M7WUFDeEMsSUFBSSxTQUFTLEdBQUcscUJBQXFCLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckYsT0FBTztpQkFDSixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2dCQUNsQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7cUJBQ3JCLE9BQU8sQ0FBQyxDQUFDLFNBQStCLEVBQUUsRUFBRTtvQkFDN0MsU0FBUyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7Z0JBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUEsc0dBQXNHO0tBQ2hKO0lBQUEsQ0FBQztJQUVGLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDOUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3pDLENBQUMsQ0FBQyxjQUFjLENBQUM7WUFDakIsb0JBQW9CLENBQUMsRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQztZQUMzQyxxQ0FBcUM7WUFDbkMsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxnRUFBZ0U7UUFDeEYsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELG9JQUFvSTtJQUNwSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDM0MsOENBQThDO1FBQzlDLElBQ0UsVUFBVTtZQUNWLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxVQUFVLEtBQUssYUFBYSxDQUFDLEVBQzFEO1lBQ0EsNEJBQTRCO1lBQzVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVFO2FBQU07WUFDTCxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrSEFBa0g7U0FDdEosQ0FBQyxpU0FBaVM7UUFDblMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxpTkFBaU47UUFFblAsSUFBSSxDQUFFLFVBQVUsRUFBRTtZQUNmLDhHQUE4RztZQUM1RyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztRQUNELENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLCtIQUErSDtRQUMxSixDQUFDLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsSUFBSSxJQUFJO1lBQ04sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7UUFDckMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyw4TkFBOE47UUFDN08sQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDbkIsQ0FBQyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7UUFDM0IsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBNQUEwTTtLQUNuTztJQUNELFlBQVk7SUFDWixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDZCxDQUFDLENBQUMsWUFBWTtZQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDO1FBQ3pFLENBQUMsQ0FBQyxZQUFZO1lBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFckMsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQUVELFNBQVMsa0JBQWtCO0lBQ3pCLElBQUksT0FBTyxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFDakQsSUFBSSxHQUFXLEdBQUcsQ0FBQztJQUNyQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDdEIsWUFBWTtRQUNaLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksR0FBQyxNQUFNLENBQUM7SUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLElBQUksR0FBRyxDQUFDO0lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxTQUFzQjtJQUNoRCxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPO0lBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDbEUsUUFBUSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1FBQzNDLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUosU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQW1CLEVBQUUsRUFBRTtZQUN4QyxxQ0FBcUMsQ0FBQztnQkFDcEMsTUFBTSxFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUNwRSxjQUFjLEVBQUMsWUFBWTtnQkFDM0IsUUFBUSxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFnQjthQUNqRSxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FDSixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FDaEYsQ0FBQztLQUVIO0FBQ0gsQ0FBQztBQUVELFNBQVMsY0FBYztJQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0lBQzFELElBQUksS0FBSztRQUFFLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUNuQixnQkFBMEIsUUFBUSxFQUNsQyxZQUE0QixZQUFZO0lBRXhDLElBQUksU0FBMEIsQ0FBQztJQUMvQixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNDLFFBQVE7U0FDTCxjQUFjLENBQUMsU0FBUyxDQUFDO1NBQ3pCLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNoRCxDQUFDLFNBQVMsY0FBYztRQUN0QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDL0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUMzQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDOUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNwQyxDQUFDLENBQUMsY0FBYyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNMLE1BQU0sQ0FBQyxFQUFFLEdBQUcsY0FBYyxDQUFDO0lBQzNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLGtCQUFrQixDQUFDO0lBQ2xELE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7SUFDNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztJQUMvQixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7SUFDMUIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQzlCLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7YUFDdkMsTUFBTSxDQUFDLENBQUMsT0FBdUIsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFxQixDQUFDO1FBQ25HLFNBQVM7YUFDTixPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNqQixxQ0FBcUMsQ0FBQztnQkFDcEMsTUFBTSxFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUNqRixjQUFjLEVBQUMsWUFBWTtnQkFDM0IsUUFBUSxFQUFFLE1BQU07YUFDakIsQ0FDQSxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxPQUFPO0lBQ25DLElBQUksT0FBTyxDQUFDLElBQUk7UUFBRSxPQUFPO0lBQ3pCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFBO0FBRTdCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsWUFBWSxDQUFDLElBQW9CLEVBQUUsUUFBZTtJQUN6RCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU87S0FDUjtJQUNELElBQUksQ0FBQyxRQUFRO1FBQUUsUUFBUSxHQUFHLHVCQUF1QixDQUFDO0lBRWxELElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQzVCLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0M7SUFDRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDbkM7SUFFRCxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQWdCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUM1RCxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsRUFDdkMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFbEMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDdEIsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEUsQ0FBQyxDQUFDLGNBQWMsQ0FDZCxPQUFPLEVBQ1AsSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sQ0FBQyxFQUNELENBQUMsRUFDRCxDQUFDLEVBQ0QsQ0FBQyxFQUNELENBQUMsRUFDRCxLQUFLLEVBQ0wsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsQ0FBQyxFQUNELElBQUksQ0FDTCxDQUFDO0lBQ0YsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDO0FBQUEsQ0FBQztBQUVGLFNBQVMsNkJBQTZCLENBQUMsU0FBcUI7SUFDMUQseUhBQXlIO0lBQ3pILElBQUksU0FBUyxHQUFHLEdBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxxRUFBcUUsQ0FBQyxDQUFDO0lBQ2xHLElBQUcsQ0FBQyxTQUFTO1FBQUUsT0FBTyxTQUFTLEVBQUUsQ0FBQyxDQUFBLDBDQUEwQztJQUM1RSxPQUFPLFNBQVMsQ0FBQyxPQUFPLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxhQUFhO1FBQUUsU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7SUFFakcsSUFBSSxTQUFTLENBQUMsT0FBTyxLQUFLLEdBQUc7UUFBRSxPQUFPLFNBQVMsRUFBRSxDQUFDO0lBQ2xELElBQUksUUFBUSxHQUFXLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUMzQyxJQUFJLEdBQVcsU0FBUyxDQUFDLElBQUksRUFDN0IsS0FBSyxHQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztTQUM5QixNQUFNLENBQUMsQ0FBQyxPQUF1QixFQUFFLEVBQUUsQ0FDbEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1dBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBa0IsQ0FBQyxDQUFBLHlFQUF5RTtJQUN2SixJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUFFLE9BQU8sS0FBSyxDQUFDLG9GQUFvRixHQUFHLFFBQVEsQ0FBQyxDQUFDO0lBRTlJLElBQUksUUFBUSxHQUFXLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2hFLCtDQUErQztJQUcvQyxJQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQUUsU0FBUztRQUNqRCxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsRUFBRTtZQUN0QixtSUFBbUk7WUFDbkksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFVBQVUsR0FBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUM5RjtRQUNELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUM7YUFDckQsTUFBTSxDQUFDLENBQUMsQ0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBZ0IsQ0FBQztRQUMvRCxTQUFTLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUMzQixTQUFTLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNyQztBQUNILENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxVQUFVLENBQUMsU0FBc0I7SUFDeEMsSUFBSSxDQUFDLFNBQVM7UUFBRSxPQUFRLEtBQUssQ0FBQyxrRkFBa0YsQ0FBQyxDQUFDO0lBQ2xILE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7V0FDdEMsU0FBUyxDQUFDLGFBQWE7V0FDekIsU0FBUyxDQUFDLGFBQWEsS0FBSyxZQUFZLEVBQUU7UUFDM0MsU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUE7S0FBQztJQUFBLENBQUM7SUFDdkMsSUFBSSxTQUFTLENBQUMsT0FBTyxLQUFLLEtBQUs7V0FDMUIsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDdkMsT0FBTyxTQUFTLENBQUM7O1FBQ2QsT0FBTyxTQUEyQixDQUFDO0FBQzFDLENBQUM7QUFHRDs7OztHQUlHO0FBQ0gsU0FBUyxZQUFZLENBQUMsU0FBUztJQUM3QixJQUFJLFNBQVMsR0FBWSxnQkFBZ0IsQ0FBQztJQUMxQyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUM7UUFBRSxTQUFTLEdBQUcsaUJBQWlCLENBQUM7SUFDM0UsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLGdDQUFnQyxDQUFDO1FBQUUsU0FBUyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JGLElBQUksU0FBUyxLQUFLLFVBQVU7UUFBRSxTQUFTLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUUsT0FBTyxTQUFTLENBQUE7QUFDbEIsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsd0JBQXdCLENBQUMsV0FBdUI7SUFDdkQsTUFBTSxNQUFNLEdBQVcsNERBQTRELENBQUM7SUFDcEYsSUFBSSxRQUFRLEdBQVcsTUFBTSxDQUFDLGtCQUFrQixFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFFaEYsT0FBTyxXQUFXLENBQUMsT0FBTyxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsYUFBYTtRQUFFLFdBQVcsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDO0lBQ3ZHLElBQUksSUFBSSxHQUFXLFdBQVcsQ0FBQyxXQUFXLENBQUM7SUFDM0MsSUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztJQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM3QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7SUFDOUUsT0FBTyxDQUFDLGdCQUFnQixDQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsMENBQTBDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0csT0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7SUFDOUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDdEIsSUFBRyxPQUFPLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBQztZQUN4QixJQUFJLFFBQVEsR0FBZ0IsSUFBSSxTQUFTLEVBQUU7aUJBQ3hDLGVBQWUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztpQkFDOUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckQsV0FBVyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO1lBQzNDLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQztTQUM3QjthQUFNO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEQsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDO1NBQzNCO0lBQ0QsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsZ0JBQWdCO0lBQ3ZCLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvQixJQUFJLEtBQUssR0FBVyxFQUFFLENBQUM7SUFDdkIsWUFBWTtJQUNaLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUk7UUFBRSxLQUFLLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBRTdILEtBQUssR0FBRyxNQUFNLENBQUMsb0tBQW9LLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFNUwsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7UUFDdkMsZUFBZSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE9BQU87S0FDUjtJQUFBLENBQUM7SUFFRixJQUFJLElBQUksR0FDTixLQUFLLENBQUMsSUFBSSxDQUNWLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQTRCLENBQUM7U0FDaEUsTUFBTSxDQUFDLENBQUMsR0FBZ0IsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEUsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBQztRQUNwQixnQkFBZ0IsQ0FBQztZQUNmLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBQ0gsT0FBTTtLQUNQO0lBRUQsSUFBRyxJQUFJLENBQUMsTUFBTSxLQUFJLENBQUM7UUFBRSxPQUFPLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO0lBQ3JGLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBQ0QsU0FBUyx1QkFBdUIsQ0FBQyxTQUFzQixFQUFFLE9BQWdCLElBQUk7SUFFM0UsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLGNBQWMsS0FBSyxNQUFNLElBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVM7UUFBRSxPQUFPLENBQUEsbUZBQW1GO0lBRWhMLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFDckIsSUFBSSxLQUFLLEdBQVcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFFekMsSUFBSSxDQUFDLEtBQUs7UUFBRSxPQUFPLEtBQUssQ0FBQywySEFBMkgsQ0FBQyxDQUFDO0lBRXRKLHdDQUF3QztJQUN4QyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFL0IsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUE7SUFFOUMsSUFBSSxLQUFLLEdBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUxQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXRGLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQUUsT0FBTztJQUV2QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUEsdUlBQXVJO0lBRS9KLElBQUksSUFBSTtRQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7UUFDN0MsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTdDLFVBQVUsQ0FBQztRQUNULFdBQVcsRUFBQyxDQUFDLEtBQUssQ0FBQztRQUNuQixTQUFTLEVBQUMsU0FBUztRQUNuQixTQUFTLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQztRQUNsQyxRQUFRLEVBQUUsWUFBWTtRQUN0QixTQUFTLEVBQUMsWUFBWTtLQUN2QixDQUFDLENBQUM7SUFDSCxXQUFXLEVBQUUsQ0FBQztBQUVoQixDQUFDO0FBQUEsQ0FBQztBQUVGLFNBQVMscUJBQXFCLENBQUMsUUFBZ0IsRUFBRSxTQUFpQjtJQUNoRSxZQUFZO0lBQ2Isb0RBQW9EO0lBQ25ELElBQUksS0FBSyxHQUFnQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekMsSUFBSSxLQUFLLEdBQWUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2xCLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1osR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztJQUNILGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUMsU0FBUyxDQUFDLENBQUM7QUFDeEUsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLElBQWE7SUFDcEMsSUFBSSxJQUFJO1FBQUUsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXhDLElBQUksQ0FBQyxJQUFJO1FBQUUsSUFBSSxHQUFHLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRXJELElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTztJQUVsQixZQUFZLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUM1QixLQUFLLElBQUksU0FBUyxJQUFJLGNBQWMsRUFBRTtRQUNwQyxjQUFjLENBQUMsU0FBUyxDQUFDO2FBQ3RCLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDM0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2YsZ0JBQWdCLENBQUM7Z0JBQ25CLCtDQUErQztnQkFDM0MsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLEtBQUssRUFBQyxLQUFLO2FBQ1osQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUFBLENBQUM7QUFDSixDQUFDO0FBQ0QsU0FBUyxvQkFBb0IsQ0FBQyxHQUFXO0lBRXhDLElBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUMsQ0FBQztRQUFFLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVoRSxJQUFJLFNBQVMsR0FBbUMsWUFBWSxDQUFDO0lBQzdELElBQUksR0FBRyxDQUFDLFdBQVc7UUFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztJQUMvQywyQkFBMkIsRUFBRSxDQUFDO0lBQzlCLG9CQUFvQixDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDcEMsWUFBWSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUM7SUFDbEQsSUFBSSxHQUFHLENBQUMsT0FBTztRQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUUvQixJQUNFLEdBQUcsQ0FBQyxlQUFlO1FBQ25CLEdBQUcsQ0FBQyxZQUFZO1FBQ2hCLEdBQUcsQ0FBQyxTQUFTO1FBQ2IsdUJBQXVCLEVBQUUsQ0FBQztJQUUxQixZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFN0IsU0FBUyx1QkFBdUI7UUFFNUIsR0FBRyxDQUFDLGVBQWU7YUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUFFLE9BQU87WUFDbkMsSUFBSSxLQUFLLEdBQWlCLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9ELElBQUksU0FBUyxHQUFXLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU87WUFDdkIsVUFBVSxDQUFDO2dCQUNWLFdBQVcsRUFBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7Z0JBQ25FLFNBQVMsRUFBQyxTQUFTO2dCQUNuQixTQUFTLEVBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQztnQkFDaEMsUUFBUSxFQUFFLFNBQVM7Z0JBQ25CLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixLQUFLLEVBQUMsS0FBSzthQUFDLENBQUMsQ0FBQTtRQUNuQixDQUFDLENBQUMsQ0FBQztJQUVOLENBQUM7SUFBQSxDQUFDO0lBRUY7Ozs7Ozs7T0FPRztJQUVMO2FBQ1M7SUFFUCxtREFBbUQ7SUFFbkQsZ0ZBQWdGO0lBQ2xGLG1KQUFtSjtJQUdqSixJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBRXpDLG1MQUFtTDtRQUNuTCw0S0FBNEs7UUFDNUssb0JBQW9CLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUd0QyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQWdCLEVBQUUsRUFBRTtZQUN4Qyx5SEFBeUg7WUFDekgsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxLQUFLO2dCQUFFLFFBQVEsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO1lBQzNELDhFQUE4RTtZQUM5RSxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUMsUUFBUSxFQUFFLGFBQWEsRUFBQyxvQkFBb0IsRUFBRSxRQUFRLEVBQUMsUUFBUSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFDNUYsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUVELHdCQUF3QixDQUN0QixLQUFLLENBQUMsSUFBSSxDQUNSLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUM1QixDQUN0QixDQUFDO0lBRUYsSUFDRSxHQUFHLENBQUMsU0FBUztXQUNWLEdBQUcsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLEtBQUs7V0FDN0IsQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFDN0Q7UUFDQSx3TkFBd047UUFDeE4sZ09BQWdPO1FBQ2hPLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRSxpQkFBaUIsR0FBRyxHQUFHLENBQUM7S0FDekI7SUFDRCxJQUNFLEdBQUcsQ0FBQyxLQUFLLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBRSxrQ0FBa0M7V0FDNUQsR0FBRyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsS0FBSyxDQUFDLG9DQUFvQztXQUNsRSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDO1dBQ3RELENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsd0NBQXdDO01BQ25HO1FBQ0EsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUMsb0JBQW9CLEVBQUUsUUFBUSxFQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO0tBQ3pGO0lBRUQsSUFBSSxHQUFHLENBQUMsV0FBVztRQUFFLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRS9ELElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsS0FBSztRQUFFLGlCQUFpQixFQUFFLENBQUM7QUFFdkQsQ0FBQyJ9