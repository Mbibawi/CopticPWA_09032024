let sequence = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param {HTMLSelectElement}  select - the selection element from which we selet the options
 * @param {boolean} clear - whether or not we should remove all the children of the containerDiv content
 */
function startEditingMode(args) {
    if (args.clear !== false)
        args.clear = true;
    if (!args.arrayName && args.select)
        args.arrayName = args.select.selectedOptions[0].innerText;
    if (!args.arrayName)
        return;
    if (args.select && args.arrayName === args.select.options[0].innerText)
        return; //entries[0] === 'Choose From the List'
    containerDiv.style.gridTemplateColumns = '100%';
    if (containerDiv.dataset.arrayName
        && args.arrayName === containerDiv.dataset.arrayName
        && !confirm('Warning !! you are about to reload the same array, you will loose all your modifications. Are you sure you want to reload the same array? '))
        return; //If the selected option is the same as the already loaded array, and the user does not confirm reloading the array, we return
    containerDiv.dataset.arrayName = args.arrayName;
    if (args.select && args.arrayName === args.select.options[2].innerText)
        args.arrayName = prompt('Provide the function and the parameters', args.arrayName); //under development
    if (args.arrayName.includes('Fun(')) {
        eval(args.arrayName);
        return;
    }
    let tablesArray;
    containerDiv.dataset.specificTables = 'false';
    let languages = getLanguages(args.arrayName);
    if (!languages)
        languages = allLanguages;
    if (args.select && args.arrayName === args.select.options[1].innerText) {
        //This is the add new table case
        args.arrayName = 'PrayersArray';
        containerDiv.dataset.arrayName = args.arrayName; //!CAUTION: if we do not set the arrayName to an existing array, it will yeild to an error when the array name will be evaluated by eval(arraName), and the saveModifiedArray() will stop without exporting the text to file
        languages = []; //We empty the languages array and will fill it according to what the user will provide
        let langs = prompt('Provide the sequence of the languages columns', 'COP, FR, EN, CA, AR');
        tablesArray = [
            [
                ['NewTable&D=$copticFeasts.AnyDay&C=Title']
            ]
        ]; //We create a string[][][] with one string[][] (i.e. table) having only 1 string[] (i.e. row)
        let tbl1 = tablesArray[0];
        langs
            .split(', ')
            .forEach(lang => {
            tbl1[0] //this is the 1st row of the table, we add the languages as elements to this row, which gives us a row like ['NewTable&D=$copticFeasts.AnyDay&C=Title', 'AR', 'FR', etc.]
                .push(lang);
            languages
                .push(lang); //We add the languages to the 'languages'
        });
        tbl1
            .push([...tbl1[0]]); //We add a second row to the table
        tbl1[tbl1.length - 1][0] = tbl1[tbl1.length - 1][0].split('&C=')[0]; //We remove the '&C=Title' from the second row
    }
    ;
    if (!tablesArray
        && args.select
        && args.arrayName
        && confirm('Do you want to edit a single or specific table(s) in the array? (if more than one table, provide the titles separated by ", " ')) {
        containerDiv.dataset.specificTables = 'true';
    }
    ;
    if (!tablesArray && !args.select && args.arrayName && args.tableTitle)
        containerDiv.dataset.specificTables = 'true'; //If we ware calling the function givint it the name of the array (entry) and the title of a table (tableTitle) without passing any select element, we will be editing a specific table not the whole tables in the array
    if (!tablesArray)
        tablesArray = eval(args.arrayName);
    if (!tablesArray)
        return;
    if (containerDiv.dataset.specificTables === 'true') {
        if (!args.tableTitle)
            args.tableTitle = prompt('Provide the name of the table you want to edit');
        let filteredArray = [];
        args.tableTitle
            .split(', ')
            .map(title => {
            if (title.startsWith('Prefix.'))
                title = eval(title);
            filteredArray.push(tablesArray
                .find(tbl => tbl[0][0].includes(title)));
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
    showTables(tablesArray, args.arrayName, languages, args.clear);
}
/**
 * Takes a string[][][] (i.e., and array of tables, each being a string[][], where each string[] represents a rowh),  that we want to edit,and creates html div elements representing the text of each row of eah table in the tablesArray
 * @param {string[][][]} tablesArray - an array containing the tables that we need to show and start editing
 * @param {string[]} languages - the languages included in the tables
 */
function showTables(tablesArray, arrayName, languages, clear = true) {
    if (!arrayName)
        return;
    if (clear === true)
        containerDiv.innerHTML = '';
    let htmlRow;
    //We create an html div element to display the text of each row of each table in tablesArray
    tablesArray
        .forEach(table => {
        if (!table)
            return;
        table
            .forEach(row => {
            if (!row)
                return;
            htmlRow = createHtmlElementForPrayerEditingMode(row, languages);
            //We make the paragraph children of each row, editable
            if (htmlRow) {
                htmlRow.dataset.arrayName = arrayName;
                Array.from(htmlRow.children)
                    .forEach((paragraph) => {
                    paragraph.contentEditable = "true";
                });
            }
            ;
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
function saveModifiedArray(exportToFile = true, exportToStorage = true) {
    if (!exportToFile && !exportToStorage)
        return;
    let title, titles = new Set(), savedArrays = new Set(), arrayName, tablesArray;
    let htmlRows = Array.from(containerDiv.querySelectorAll("div.Row, div.PlaceHolder")); //we retrieve all the divs with 'Row' class from the DOM
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
        .filter((htmlRow) => htmlRow.dataset.root === tableTitle);
    if (htmlTable.length === 0)
        return;
    //We generate a string[][] array from the div elements we selected. Each div element is an elemet of the string[][], and each paragraph attached to such div is a string element.
    let editedTable = convertHtmlDivElementsIntoArrayTable(htmlTable);
    editedTable.filter(row => row[1].startsWith(Prefix.placeHolder) && row.length === 3).forEach(row => { row.splice(0, 1); row[0] = Prefix.placeHolder; });
    let oldTable = tablesArray
        .filter(tbl => tbl[0][0] === editedTable[0][0])[0];
    if (oldTable)
        tablesArray.splice(tablesArray.indexOf(oldTable), 1, editedTable);
    else if (confirm('No table with the same title was found in the array, do you want to add the edited table as a new table '))
        tablesArray.push(editedTable);
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
    let languages = getLanguages(arrayName);
    console.log('tablesArray.toString() = ', tablesArray.toString());
    let stringified = replacePrefixes(JSON.stringify(tablesArray));
    console.log(stringified);
    return stringified;
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
        row
            .forEach((stringElement) => processStringElement(stringElement, row));
        //close row
        text += "], \n";
    }
    ;
    function processStringElement(stringElement, row) {
        //for each string element in row[]
        stringElement = stringElement.replaceAll('"', '\\"'); //replacing '"" by '\"'
        stringElement = stringElement.replaceAll('\n', '\\n');
        if (splitTitle(row[0])[1].includes('Title'))
            stringElement =
                stringElement
                    .replaceAll(String.fromCharCode(plusCharCode) + ' ', '')
                    .replaceAll(String.fromCharCode(plusCharCode + 1) + ' ', ''); //removing the plus(+) and minus(-à characters from the titles
        text += '"' + stringElement + '", \n'; //adding the text of row[i](after being cleaned from the unwatted characters) to text
    }
    ;
    text = replacePrefixes(text);
    text = arrayName + "= " + text + "];";
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
        .replaceAll('"' + Prefix.HolyWeek, 'Prefix.HolyWeek+"')
        .replaceAll('"' + Prefix.incenseDawn, 'Prefix.incenseDawn+"')
        .replaceAll('"' + Prefix.incenseVespers, 'Prefix.incenseVespers+"')
        .replaceAll('"' + Prefix.massCommon, 'Prefix.massCommon+"')
        .replaceAll('"' + Prefix.massStBasil, 'Prefix.massStBasil+"')
        .replaceAll('"' + Prefix.massStCyril, 'Prefix.massStCyril+"')
        .replaceAll('"' + Prefix.massStGregory, 'Prefix.massStGregory+"')
        .replaceAll('"' + Prefix.massStJohn, 'Prefix.massStJohn+"')
        .replaceAll('"' + Prefix.psalmResponse, 'Prefix.psalmResponse+"')
        .replaceAll('"' + Prefix.praxisResponse, 'Prefix.praxisResponse+"')
        .replaceAll('"' + Prefix.placeHolder, 'Prefix.placeHolder')
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
    //Seasonal 
    return text;
    text =
        text
            .replaceAll(giaki.AR, '"+giaki.AR+"')
            .replaceAll(giaki.FR, '"+giaki.FR+"');
    return text;
    // .replaceAll(giaki.COP, '"+giaki.COP+"')
    //  .replaceAll(giaki.CA, '"+giaki.CA+"');
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
function createHtmlElementForPrayerEditingMode(tblRow, languagesArray, position = containerDiv) {
    let isPlaceHolder = false;
    if (tblRow[0].startsWith(Prefix.placeHolder))
        isPlaceHolder = true;
    let row, p, lang, text;
    row = document.createElement("div");
    let dataRoot, actorClass;
    if (!isPlaceHolder) {
        row.classList.add("Row"); //we add 'Row' class to this div
        row.title = tblRow[0];
        dataRoot = splitTitle(tblRow[0])[0];
        row.dataset.root = splitTitle(dataRoot)[0];
        actorClass = splitTitle(row.title)[1];
        if (actorClass)
            row.classList.add(actorClass);
    }
    else if (isPlaceHolder) {
        tblRow = [...tblRow];
        tblRow.unshift(tblRow[0]);
        let children = Array.from(containerDiv.children);
        row.classList.add('PlaceHolder');
        row.dataset.isPlaceHolder = Prefix.placeHolder;
        row.dataset.root = children[children.length - 1].dataset.root;
        row.title = children[children.length - 1].title;
        row.style.backgroundColor = 'grey';
        languagesArray = ['FR', 'FR', 'FR'];
    }
    ;
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
            arrayName: containerDiv.dataset.arrayName,
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
    showTables([table], arrayName, getLanguages(arrayName));
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
                arrayName: 'ReadingsArrays.' + arrayName,
                tableTitle: table[0][0],
                clear: false
            });
        });
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE1vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL2VkaXRNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUM1Qjs7OztHQUlHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxJQUE4RjtJQUV0SCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUksS0FBSztRQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQzNDLElBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNO1FBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFFN0YsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztJQUU1QixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQUUsT0FBTyxDQUFDLHVDQUF1QztJQUV2SCxZQUFZLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQztJQUVoRCxJQUNFLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUztXQUMzQixJQUFJLENBQUMsU0FBUyxLQUFLLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUztXQUNqRCxDQUFDLE9BQU8sQ0FBQyw0SUFBNEksQ0FBQztRQUN6SixPQUFPLENBQUMsOEhBQThIO0lBRXhJLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7SUFFaEQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztRQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLHlDQUF5QyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBLG1CQUFtQjtJQUM5SyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckIsT0FBTTtLQUNQO0lBRUQsSUFBSSxXQUF5QixDQUFDO0lBQzlCLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUU5QyxJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdDLElBQUksQ0FBQyxTQUFTO1FBQUUsU0FBUyxHQUFHLFlBQVksQ0FBQztJQUV6QyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7UUFDdEUsZ0NBQWdDO1FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDO1FBQ2hDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQSw0TkFBNE47UUFFNVEsU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUFDLHVGQUF1RjtRQUN2RyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsK0NBQStDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUMzRixXQUFXLEdBQUc7WUFDWjtnQkFDRSxDQUFDLHlDQUF5QyxDQUFDO2FBQzVDO1NBQ0YsQ0FBQyxDQUFBLDZGQUE2RjtRQUMvRixJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsS0FBSzthQUNGLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDZCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMseUtBQXlLO2lCQUM5SyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZCxTQUFTO2lCQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBLHlDQUF5QztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUVMLElBQUk7YUFDRCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQ0FBa0M7UUFFekQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsOENBQThDO0tBQ3BIO0lBQUEsQ0FBQztJQUVGLElBQUksQ0FBQyxXQUFXO1dBQ1gsSUFBSSxDQUFDLE1BQU07V0FDWCxJQUFJLENBQUMsU0FBUztXQUNkLE9BQU8sQ0FBQyxnSUFBZ0ksQ0FBQyxFQUM5STtRQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQTtLQUFFO0lBQUEsQ0FBQztJQUVqRCxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVO1FBQ3JFLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxDQUFBLHlOQUF5TjtJQUV0USxJQUFJLENBQUMsV0FBVztRQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JELElBQUksQ0FBQyxXQUFXO1FBQUUsT0FBTztJQUd6QixJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxLQUFLLE1BQU0sRUFBRTtRQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7WUFBRSxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1FBQ2pHLElBQUksYUFBYSxHQUFnQixFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLFVBQVU7YUFDWixLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ1QsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ1gsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztnQkFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JELGFBQWEsQ0FBQyxJQUFJLENBQ2hCLFdBQVc7aUJBQ1IsSUFBSSxDQUNMLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FDakMsQ0FDQSxDQUFDO1lBRUosSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxFQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakosQ0FBQyxDQUNKLENBQUM7UUFDRixXQUFXLEdBQUcsYUFBYSxDQUFDO1FBQzVCLG9FQUFvRTtRQUNwRSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDLGdFQUFnRSxDQUFDLENBQUM7S0FDNUc7SUFBQSxDQUFDO0lBRUYsWUFBWSxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsWUFBWTtJQUVaLFVBQVUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBR2pFLENBQUM7QUFDRDs7OztHQUlHO0FBQ0gsU0FBUyxVQUFVLENBQUMsV0FBeUIsRUFBRSxTQUFnQixFQUFFLFNBQW1CLEVBQUUsUUFBaUIsSUFBSTtJQUN6RyxJQUFJLENBQUMsU0FBUztRQUFFLE9BQU87SUFDdkIsSUFBSSxLQUFLLEtBQUssSUFBSTtRQUFFLFlBQVksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ2hELElBQUksT0FBdUIsQ0FBQztJQUM1Qiw0RkFBNEY7SUFDNUYsV0FBVztTQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNuQixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU87UUFDZixLQUFLO2FBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLElBQUksQ0FBQyxHQUFHO2dCQUFFLE9BQU87WUFDakIsT0FBTyxHQUFHLHFDQUFxQyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNoRSxzREFBc0Q7WUFDaEQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2dCQUN0QyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7cUJBQ3pCLE9BQU8sQ0FBQyxDQUFDLFNBQStCLEVBQUUsRUFBRTtvQkFDN0MsU0FBUyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7Z0JBQ3JDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFBQSxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVBLDRCQUE0QjtJQUMvQixrQkFBa0IsRUFBRSxDQUFDO0lBQ3JCLHlDQUF5QztJQUN6QyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdELDBDQUEwQztJQUUxQyxzREFBc0Q7SUFDdEQsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUNqRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FDYixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN4QyxPQUFPLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRSxDQUMxQixDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNsRixDQUFDLENBQUM7SUFFTCx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUNqQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUMsQ0FBcUIsQ0FBQyxDQUFDO0FBQ2pGLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGtCQUFrQjtJQUN6QixJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUUsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztJQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUM7SUFDN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO0lBQ3ZDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztJQUVqQyxZQUFZLENBQUMscUJBQXFCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXpELG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVuSCxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFcEgsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUUzRSxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFdkYsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSx1QkFBdUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVqSSxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxjQUFjLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUV4RSxtQkFBbUIsQ0FBQyxHQUFFLEVBQUUsQ0FBQSxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEcsbUJBQW1CLENBQUMsR0FBRSxFQUFFLENBQUEsWUFBWSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlHLG1CQUFtQixDQUFDLEdBQUUsRUFBRSxDQUFBLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVsSSxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXRJLG1CQUFtQixDQUFDLEdBQUUsRUFBRSxDQUFBLGdCQUFnQixFQUFFLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BFLG1CQUFtQixDQUFDLEdBQUUsRUFBRSxDQUFBLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoSSxtQkFBbUIsQ0FBQyxHQUFFLEVBQUUsQ0FBQSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUVwSSxDQUFDO0FBT0g7OztHQUdHO0FBQ0gsU0FBUyxhQUFhLENBQUMsU0FBaUI7SUFDdEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN2QixPQUFPLFNBQVM7VUFDZCxjQUFjO1VBQ2QsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztVQUN2QixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFBLGdEQUFnRDtVQUMxRSxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1VBQzNCLElBQUk7VUFDSixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFFLENBQUMsQ0FBQztVQUM1QixHQUFHO1VBQ0YsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztVQUMxQixNQUFNLENBQUM7QUFHWCxDQUFDO0FBR0Q7Ozs7R0FJRztBQUNILFNBQVMsU0FBUyxDQUFDLFNBQXNCO0lBQ3ZDLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQWdCLENBQUM7SUFDbkQsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPO0lBQ3JCLElBQUksT0FBTyxDQUFDLDJDQUEyQyxDQUFDLEtBQUssS0FBSztRQUFFLE9BQU8sQ0FBQSw0Q0FBNEM7SUFDdkgsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGNBQWMsQ0FBQyxTQUFzQixFQUFFLFFBQWdCO0lBQzlELElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU8sS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDMUQsSUFBSSxZQUFZLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRCxJQUFJLENBQUMsUUFBUTtRQUFFLFFBQVEsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDeEUsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLEtBQUssWUFBWTtRQUFFLE9BQU87SUFFbkQsT0FBTyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxRQUFRLENBQUM7SUFFaEUsSUFBSSxZQUFZO1FBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQy9ELElBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoRixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsT0FBb0IsRUFBRSxTQUFpQjtJQUMxRCxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsU0FBc0IsRUFBRSxRQUFpQixFQUFFLFFBQWdCO0lBQzlFLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFDckIsSUFBRyxDQUFDLFFBQVE7UUFBRSxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUN2QyxJQUFJLENBQUMsUUFBUTtRQUFFLFFBQVEsR0FBRyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDaEUsSUFBSSxDQUFDLFFBQVE7UUFBRSxPQUFPLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ2pFLElBQUksUUFBUSxLQUFLLFFBQVE7UUFBRSxPQUFPO0lBRWxDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQyxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztJQUV6Qix3QkFBd0IsRUFBRSxDQUFDO0lBRTNCLFNBQVMsd0JBQXdCLENBQUMsTUFBc0IsT0FBeUIsRUFBRSxRQUFlLFFBQVE7UUFDeEcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDbEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQzthQUNsRCxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDZixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksR0FBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7UUFDckIsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBQUEsQ0FBQztJQUVGLElBQUksVUFBVSxHQUFXLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUdqRCxJQUFHLFVBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRTVGLENBQUMsU0FBUyxzQkFBc0I7UUFDOUIsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO2FBQzlCLE1BQU0sQ0FBQyxDQUFDLE9BQW9CLEVBQUUsRUFBRSxDQUMvQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEQsT0FBTyxDQUFDLENBQUMsT0FBb0IsRUFBRSxFQUFFO1lBQ2hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDckMsSUFBRyxRQUFRO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBRTtZQUNoRCx3QkFBd0IsQ0FBQyxPQUF5QixFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyRSxDQUFDLENBQUMsQ0FBQTtJQUVKLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFVCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLG1CQUFtQixDQUMxQixHQUFhLEVBQ2IsS0FBYSxFQUNiLE9BQW1CO0lBRW5CLElBQUksT0FBTyxHQUFxQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ2hFLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQzFCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMvQyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLE9BQU8sT0FBTyxDQUFBO0FBQ2hCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGNBQWMsQ0FBQyxTQUFpQixFQUFFLFNBQWdCO0lBQ3pELElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztJQUNyQyxZQUFZLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFHRDs7Ozs7O0dBTUc7QUFDSCxTQUFTLGlCQUFpQixDQUFDLGVBQXdCLElBQUksRUFBRSxrQkFBMkIsSUFBSTtJQUV0RixJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsZUFBZTtRQUFFLE9BQU87SUFFOUMsSUFBSSxLQUFhLEVBQ2YsTUFBTSxHQUFnQixJQUFJLEdBQUcsRUFBRSxFQUMvQixXQUFXLEdBQWdCLElBQUksR0FBRyxFQUFFLEVBQ3BDLFNBQWlCLEVBQ2pCLFdBQXdCLENBQUM7SUFFekIsSUFBSSxRQUFRLEdBQXFCLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLHdEQUF3RDtJQUVsSyw4REFBOEQ7SUFDOUQsUUFBUTtTQUNMLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNqQixxQ0FBcUM7UUFDdkMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsaUNBQWlDO1FBQzdELElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPOztZQUN6QixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZCLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQTtRQUVyQyxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxrREFBa0QsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUMzRixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWpFLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFOUIsSUFBSSxDQUFDLFdBQVc7WUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0VBQW9FLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRWxKLGlCQUFpQixDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQ0YsQ0FBQztJQUVGLHlEQUF5RDtJQUN6RCxXQUFXO1NBQ1IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBRXZGLENBQUM7QUFBQSxDQUFDO0FBRUU7Ozs7O0dBS0c7QUFDSCxTQUFTLGlCQUFpQixDQUFDLFVBQWtCLEVBQUUsV0FBeUI7SUFDdEUsMEdBQTBHO0lBQzFHLElBQUksU0FBUyxHQUNYLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztTQUM5QixNQUFNLENBQUMsQ0FBQyxPQUF1QixFQUFFLEVBQUUsQ0FDbEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFxQixDQUFDO0lBRS9ELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTztJQUduQyxpTEFBaUw7SUFDakwsSUFBSSxXQUFXLEdBQWUsb0NBQW9DLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFOUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQSxDQUFBLENBQUMsQ0FBQyxDQUFDO0lBRXBKLElBQUksUUFBUSxHQUNWLFdBQVc7U0FDVixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckQsSUFBSSxRQUFRO1FBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztTQUUzRSxJQUFJLE9BQU8sQ0FBQywwR0FBMEcsQ0FBQztRQUMzSCxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFBQSxDQUFDO0FBRU47Ozs7O0dBS0c7QUFDSCxTQUFTLGlCQUFpQixDQUFDLFNBQWlCLEVBQUUsZUFBdUIsSUFBSSxFQUFFLGtCQUF5QixJQUFJO0lBQ3RHLElBQUksSUFBWSxDQUFDO0lBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFN0MsSUFBSSxHQUFHLHlCQUF5QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUU3RCxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnRkFBZ0YsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUV6SCxJQUFJLGVBQWUsRUFBRTtRQUNmLFlBQVksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQzFDO0lBQUEsQ0FBQztJQUVGLElBQUcsWUFBWTtRQUFFLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbkQsQ0FBQztBQUFBLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsU0FBUyx5QkFBeUIsQ0FBQyxXQUF5QixFQUFFLFNBQWlCO0lBQzdFLElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2pFLElBQUksV0FBVyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDL0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6QixPQUFPLFdBQVcsQ0FBQztJQUNuQixzQkFBc0I7SUFDdEIsSUFBSSxJQUFJLEdBQVcsR0FBRyxDQUFDO0lBQ3ZCLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFpQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNoRSxTQUFTLFlBQVksQ0FBQyxLQUFpQjtRQUNyQyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDekQsT0FBTyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtTQUNyQztRQUFBLENBQUM7UUFDSixrQkFBa0I7UUFDbEIsSUFBSSxJQUFJLEtBQUssQ0FBQztRQUNkLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFhLEVBQUUsRUFBRTtZQUM5QixlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDSCxhQUFhO1FBQ2IsSUFBSSxJQUFJLE9BQU8sQ0FBQztJQUNsQixDQUFDO0lBQUEsQ0FBQztJQUNGLFNBQVMsZUFBZSxDQUFDLEdBQWE7UUFDcEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztZQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ3JELE9BQU8sS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUE7U0FDckM7UUFBQSxDQUFDO1FBRUYsZ0JBQWdCO1FBQ2hCLElBQUksSUFBSSxLQUFLLENBQUM7UUFDZCxHQUFHO2FBQ0EsT0FBTyxDQUFDLENBQUMsYUFBcUIsRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDL0UsV0FBVztRQUNYLElBQUksSUFBSSxPQUFPLENBQUM7SUFDbEIsQ0FBQztJQUFBLENBQUM7SUFFRixTQUFTLG9CQUFvQixDQUFDLGFBQXFCLEVBQUUsR0FBYTtRQUNoRSxrQ0FBa0M7UUFDbEMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsdUJBQXVCO1FBQzdFLGFBQWEsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV0RCxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ3pDLGFBQWE7Z0JBQ1gsYUFBYTtxQkFDVixVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDO3FCQUN2RCxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsOERBQThEO1FBRWxJLElBQUksSUFBSSxHQUFHLEdBQUMsYUFBYSxHQUFDLE9BQU8sQ0FBQyxDQUFDLHFGQUFxRjtJQUMxSCxDQUFDO0lBQUEsQ0FBQztJQUdGLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsSUFBSSxHQUFHLFNBQVMsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztJQUN0QyxPQUFRLElBQUksQ0FBQTtBQUNkLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLFNBQWlCLEVBQUUsSUFBVztJQUN2RCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLFNBQVMsQ0FBQztJQUNqRCxJQUFJLElBQUksS0FBSyxJQUFJO1FBQ2YsT0FBTyxTQUFTO2FBQ2IsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzNDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBRTdDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSTtRQUNyQyxPQUFPLFNBQVM7YUFDYixVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzthQUN2QixVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFBQSxDQUFDO0FBRUYsU0FBUyxlQUFlLENBQUMsSUFBWTtJQUNuQyxJQUFJLEdBQUcsSUFBSTtTQUNSLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxzQkFBc0IsQ0FBQztTQUM1RCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUM7U0FDMUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDO1NBQ2hFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSx1QkFBdUIsQ0FBQztTQUM5RCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUM7U0FDeEQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLHVCQUF1QixDQUFDO1NBQzlELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsQ0FBQztTQUNsRSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxjQUFjLEVBQUUseUJBQXlCLENBQUM7U0FDbEUsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDO1NBQ3RELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxzQkFBc0IsQ0FBQztTQUM1RCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxjQUFjLEVBQUUseUJBQXlCLENBQUM7U0FDbEUsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLHFCQUFxQixDQUFDO1NBQzFELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxzQkFBc0IsQ0FBQztTQUM1RCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUM7U0FDNUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDO1NBQ2hFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQztTQUMxRCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsd0JBQXdCLENBQUM7U0FDaEUsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDO1NBQ2xFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQztRQUMzRCxVQUFVO1NBQ1QsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLHFCQUFxQixDQUFDO1NBQzFELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQztTQUNsRCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUM7U0FDMUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDO1NBQ2xELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsQ0FBQztTQUNsRSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsd0JBQXdCLENBQUM7U0FDaEUsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLHFCQUFxQixDQUFDO1NBQzFELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQztTQUMxRCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUM7U0FDNUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDLENBQUE7SUFDakUsV0FBVztJQUNiLE9BQU8sSUFBSSxDQUFDO0lBQ1osSUFBSTtRQUNGLElBQUk7YUFDSCxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUM7YUFDcEMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUE7SUFDdkMsT0FBTyxJQUFJLENBQUM7SUFDWCwwQ0FBMEM7SUFDM0MsMENBQTBDO0lBQzFDLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLFNBQVMsQ0FBQyxTQUFzQixFQUFFLEtBQWM7SUFDdkQsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUVyQixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUN4QyxDQUF1QixDQUFDO0lBRTFCLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztJQUNyQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUM3QyxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUM7SUFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO0lBRWpFLElBQUksQ0FBQyxLQUFLO1FBQUUsS0FBSyxHQUFHLE1BQU0sQ0FDeEIsa0NBQWtDLEVBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQ2QsQ0FBQztJQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQyxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsK0JBQStCLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRSxTQUFTLENBQUU7SUFDckMsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLElBQUksUUFBUTtRQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFBRSxNQUFNLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUVsRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7U0FDekIsT0FBTyxDQUFDLENBQUMsS0FBa0IsRUFBRSxFQUFFO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssR0FBRztZQUFFLE9BQU87UUFDakQsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7SUFDN0IsQ0FBQyxDQUNBLENBQUM7SUFFSixPQUFPLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFnQixDQUFDO0FBQzFFLENBQUM7QUFDRCxTQUFTLFlBQVksQ0FBQyxTQUFzQjtJQUMxQyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEtBQUssR0FBRztRQUFFLE9BQU8sS0FBSyxDQUFDLDREQUE0RCxDQUFDLENBQUM7SUFDMUcsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBZ0IsQ0FBQztJQUNuRCxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFDckIsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLDRKQUE0SixFQUFFLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pNLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQUUsT0FBTyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztJQUNuRyxJQUFJLFNBQVMsR0FBZSxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELFNBQVMsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO0lBQ25DLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO0lBQzNCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsZ0NBQWdDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztJQUN4RSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQztJQUN4QyxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUd4SCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3RSxJQUFJLEtBQUssR0FBVSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZDLEtBQUssR0FBRyxNQUFNLENBQUMsOENBQThDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFcEUsS0FBSztTQUNGLEtBQUssQ0FBQyxHQUFHLENBQUM7U0FDVixHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtRQUNoQixJQUFJLEtBQUssR0FDUCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7YUFDekIsTUFBTSxDQUFDLENBQUMsQ0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBZ0IsQ0FBQztRQUN2RSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsdUdBQXVHO0lBQ3JJLENBQUMsQ0FBQyxDQUFDO0lBQ0wsS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7SUFFdEQsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQUVELFNBQVMscUNBQXFDLENBQzVDLE1BQWdCLEVBQ2hCLGNBQXdCLEVBQ3hCLFdBRXlELFlBQVk7SUFFckUsSUFBSSxhQUFhLEdBQVksS0FBSyxDQUFDO0lBQ25DLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQUUsYUFBYSxHQUFHLElBQUksQ0FBQztJQUNuRSxJQUFJLEdBQW1CLEVBQUUsQ0FBdUIsRUFBRSxJQUFZLEVBQUUsSUFBWSxDQUFDO0lBRTdFLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLElBQUksUUFBZ0IsRUFBRSxVQUFrQixDQUFDO0lBQ3pDLElBQUcsQ0FBQyxhQUFhLEVBQUM7UUFDbEIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0M7UUFDMUQsR0FBRyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsUUFBUSxHQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkMsSUFBSSxVQUFVO1lBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDN0M7U0FBTSxJQUFJLGFBQWEsRUFBRTtRQUN4QixNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFxQixDQUFDO1FBQ3JFLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDL0MsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztRQUM5RCxHQUFHLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNoRCxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7UUFDbkMsY0FBYyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNyQztJQUFBLENBQUM7SUFFRixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQzlDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNyQyxDQUFDLENBQUMsY0FBYyxDQUFDO1lBQ2pCLG9CQUFvQixDQUFDLEVBQUMsUUFBUSxFQUFDLEdBQUcsRUFBQyxDQUFDLENBQUM7WUFDckMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQ25CLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsZ0VBQWdFO1FBQ3BGLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxvSUFBb0k7SUFDcEksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdEMsOENBQThDO1FBQzlDLElBQ0UsVUFBVTtZQUNWLENBQUMsVUFBVSxJQUFJLFNBQVMsSUFBSSxVQUFVLElBQUksYUFBYSxDQUFDLEVBQ3hEO1lBQ0EsNEJBQTRCO1lBQzVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsRTthQUFNO1lBQ0wsSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrSEFBa0g7U0FDakosQ0FBQyxpU0FBaVM7UUFDblMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxpTkFBaU47UUFFblAsSUFBSSxDQUFFLFVBQVUsRUFBRTtZQUNmLDhHQUE4RztZQUM1RyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztRQUNELENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLCtIQUErSDtRQUMxSixDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDcEIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLElBQUk7WUFDTixDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtRQUNyQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLDhOQUE4TjtRQUM3TyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUNuQixHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsME1BQTBNO0tBQy9OO0lBQ0QsWUFBWTtJQUNaLFFBQVEsQ0FBQyxFQUFFO1FBQ1QsQ0FBQyxDQUFDLFlBQVk7WUFDWixRQUFRLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxZQUFZO1lBQ1osUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QixPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLGtCQUFrQjtJQUN6QixJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQ2pELElBQUksR0FBVyxHQUFHLENBQUM7SUFDckIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ3RCLFlBQVk7UUFDWixJQUFJLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUMsTUFBTSxDQUFDO0lBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxJQUFJLEdBQUcsQ0FBQztJQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsU0FBc0I7SUFDaEQsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUNyQixRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkQsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsRUFBRTtRQUMzQyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUF1QixFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVKLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFtQixFQUFFLEVBQUU7WUFDeEMscUNBQXFDLENBQ25DLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQzdELFlBQVksRUFDWixRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUN4QyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQ0osS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQ2hGLENBQUM7S0FFSDtBQUNILENBQUM7QUFFRCxTQUFTLGNBQWM7SUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0QixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQztJQUMxRCxJQUFJLEtBQUs7UUFBRSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FDbkIsZ0JBQTBCLFFBQVEsRUFDbEMsWUFBNEIsWUFBWTtJQUV4QyxJQUFJLFNBQTBCLENBQUM7SUFDL0IsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQyxRQUFRO1NBQ0wsY0FBYyxDQUFDLFNBQVMsQ0FBQztTQUN6QixxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQyxTQUFTLGNBQWM7UUFDdEIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxLQUFLLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0MsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQy9CLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztRQUN4QixLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7UUFDM0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQzlCLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUNoQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUNqQixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDTCxNQUFNLENBQUMsRUFBRSxHQUFHLGNBQWMsQ0FBQztJQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQztJQUNsRCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO0lBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztJQUNoQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7SUFDL0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0lBQzFCLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUM5QixTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO2FBQ3ZDLE1BQU0sQ0FBQyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBcUIsQ0FBQztRQUNuRyxTQUFTO2FBQ04sT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDakIscUNBQXFDLENBQ25DLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQzFFLFlBQVksRUFDWixNQUFNLENBQ1AsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsb0JBQW9CLENBQUMsT0FBTztJQUNuQyxJQUFJLE9BQU8sQ0FBQyxJQUFJO1FBQUUsT0FBTztJQUN6QixPQUFPLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQTtBQUU3QixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLFlBQVksQ0FBQyxJQUFvQixFQUFFLFFBQWU7SUFDekQsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN2QyxPQUFPO0tBQ1I7SUFDRCxJQUFJLENBQUMsUUFBUTtRQUFFLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQztJQUVsRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0lBQ0QsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7UUFDNUIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ25DO0lBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFnQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFDNUQsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQ3ZDLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWxDLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BFLENBQUMsQ0FBQyxjQUFjLENBQ2QsT0FBTyxFQUNQLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLENBQUMsRUFDRCxDQUFDLEVBQ0QsQ0FBQyxFQUNELENBQUMsRUFDRCxDQUFDLEVBQ0QsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLENBQUMsRUFDRCxJQUFJLENBQ0wsQ0FBQztJQUNGLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsQ0FBQztBQUFBLENBQUM7QUFFRixTQUFTLDZCQUE2QixDQUFDLFNBQXFCO0lBQzFELHlIQUF5SDtJQUN6SCxJQUFJLFNBQVMsR0FBRyxHQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMscUVBQXFFLENBQUMsQ0FBQztJQUNsRyxJQUFHLENBQUMsU0FBUztRQUFFLE9BQU8sU0FBUyxFQUFFLENBQUMsQ0FBQSwwQ0FBMEM7SUFDNUUsT0FBTyxTQUFTLENBQUMsT0FBTyxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsYUFBYTtRQUFFLFNBQVMsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDO0lBRWpHLElBQUksU0FBUyxDQUFDLE9BQU8sS0FBSyxHQUFHO1FBQUUsT0FBTyxTQUFTLEVBQUUsQ0FBQztJQUNsRCxJQUFJLFFBQVEsR0FBVyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFDM0MsSUFBSSxHQUFXLFNBQVMsQ0FBQyxJQUFJLEVBQzdCLEtBQUssR0FDSCxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7U0FDOUIsTUFBTSxDQUFDLENBQUMsT0FBdUIsRUFBRSxFQUFFLENBQ2xDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSTtXQUNqQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQWtCLENBQUMsQ0FBQSx5RUFBeUU7SUFDdkosSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxPQUFPLEtBQUssQ0FBQyxvRkFBb0YsR0FBRyxRQUFRLENBQUMsQ0FBQztJQUU5SSxJQUFJLFFBQVEsR0FBVyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoRSwrQ0FBK0M7SUFHL0MsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUFFLFNBQVM7UUFDakQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdEIsbUlBQW1JO1lBQ25JLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEdBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDOUY7UUFDRCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDO2FBQ3JELE1BQU0sQ0FBQyxDQUFDLENBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQWdCLENBQUM7UUFDL0QsU0FBUyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDM0IsU0FBUyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckM7QUFDSCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsVUFBVSxDQUFDLFNBQXNCO0lBQ3hDLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBUSxLQUFLLENBQUMsa0ZBQWtGLENBQUMsQ0FBQztJQUNsSCxPQUFPLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1dBQ3RDLFNBQVMsQ0FBQyxhQUFhO1dBQ3pCLFNBQVMsQ0FBQyxhQUFhLEtBQUssWUFBWSxFQUFFO1FBQzNDLFNBQVMsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFBO0tBQUM7SUFBQSxDQUFDO0lBQ3ZDLElBQUksU0FBUyxDQUFDLE9BQU8sS0FBSyxLQUFLO1dBQzFCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLE9BQU8sU0FBUyxDQUFDOztRQUNkLE9BQU8sU0FBMkIsQ0FBQztBQUMxQyxDQUFDO0FBR0Q7Ozs7R0FJRztBQUNILFNBQVMsWUFBWSxDQUFDLFNBQVM7SUFDN0IsSUFBSSxTQUFTLEdBQVksZ0JBQWdCLENBQUM7SUFDMUMsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDO1FBQUUsU0FBUyxHQUFHLGlCQUFpQixDQUFDO0lBQzNFLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUFFLFNBQVMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRixJQUFJLFNBQVMsS0FBSyxVQUFVO1FBQUUsU0FBUyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFFLE9BQU8sU0FBUyxDQUFBO0FBQ2xCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHdCQUF3QixDQUFDLFdBQXVCO0lBQ3ZELE1BQU0sTUFBTSxHQUFXLDREQUE0RCxDQUFDO0lBQ3BGLElBQUksUUFBUSxHQUFXLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBRWhGLE9BQU8sV0FBVyxDQUFDLE9BQU8sS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDLGFBQWE7UUFBRSxXQUFXLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQztJQUN2RyxJQUFJLElBQUksR0FBVyxXQUFXLENBQUMsV0FBVyxDQUFDO0lBQzNDLElBQUksT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7SUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDN0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO0lBQzlFLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLDBDQUEwQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNHLE9BQU8sQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1FBQ3RCLElBQUcsT0FBTyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUM7WUFDeEIsSUFBSSxRQUFRLEdBQWdCLElBQUksU0FBUyxFQUFFO2lCQUN4QyxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7aUJBQzlDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JELFdBQVcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUMzQyxPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUM7U0FDN0I7YUFBTTtZQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQztTQUMzQjtJQUNELENBQUMsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGdCQUFnQjtJQUN2QixpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0IsSUFBSSxLQUFLLEdBQVcsRUFBRSxDQUFDO0lBQ3ZCLFlBQVk7SUFDWixJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1FBQUUsS0FBSyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUU3SCxLQUFLLEdBQUcsTUFBTSxDQUFDLG9LQUFvSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTVMLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQ3ZDLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxPQUFPO0tBQ1I7SUFBQSxDQUFDO0lBRUYsSUFBSSxJQUFJLEdBQ04sS0FBSyxDQUFDLElBQUksQ0FDVixZQUFZLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUE0QixDQUFDO1NBQ2hFLE1BQU0sQ0FBQyxDQUFDLEdBQWdCLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUM7UUFDcEIsZ0JBQWdCLENBQUM7WUFDZixTQUFTLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTO1lBQ3pDLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBQ0gsT0FBTTtLQUNQO0lBRUQsSUFBRyxJQUFJLENBQUMsTUFBTSxLQUFJLENBQUM7UUFBRSxPQUFPLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO0lBQ3JGLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBQ0QsU0FBUyx1QkFBdUIsQ0FBQyxTQUFzQixFQUFFLE9BQWdCLElBQUk7SUFFM0UsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLGNBQWMsS0FBSyxNQUFNLElBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVM7UUFBRSxPQUFPLENBQUEsbUZBQW1GO0lBRWhMLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFDckIsSUFBSSxLQUFLLEdBQVcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFFekMsSUFBSSxDQUFDLEtBQUs7UUFBRSxPQUFPLEtBQUssQ0FBQywySEFBMkgsQ0FBQyxDQUFDO0lBRXRKLHdDQUF3QztJQUN4QyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFL0IsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUE7SUFFOUMsSUFBSSxLQUFLLEdBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUxQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXRGLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQUUsT0FBTztJQUV2QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUEsdUlBQXVJO0lBRS9KLElBQUksSUFBSTtRQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7UUFDN0MsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTdDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUN4RCxXQUFXLEVBQUUsQ0FBQztBQUVoQixDQUFDO0FBQUEsQ0FBQztBQUVGLFNBQVMscUJBQXFCLENBQUMsUUFBZ0IsRUFBRSxTQUFpQjtJQUNoRSxZQUFZO0lBQ2Isb0RBQW9EO0lBQ25ELElBQUksS0FBSyxHQUFnQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekMsSUFBSSxLQUFLLEdBQWUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2xCLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1osR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztJQUNILGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUMsU0FBUyxDQUFDLENBQUM7QUFDeEUsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLElBQWE7SUFDcEMsSUFBSSxJQUFJO1FBQUUsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXhDLElBQUksQ0FBQyxJQUFJO1FBQUUsSUFBSSxHQUFHLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRXJELElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTztJQUVsQixZQUFZLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUM1QixLQUFLLElBQUksU0FBUyxJQUFJLGNBQWMsRUFBRTtRQUNwQyxjQUFjLENBQUMsU0FBUyxDQUFDO2FBQ3RCLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDM0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2YsZ0JBQWdCLENBQUM7Z0JBQ2YsU0FBUyxFQUFFLGlCQUFpQixHQUFHLFNBQVM7Z0JBQ3hDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixLQUFLLEVBQUMsS0FBSzthQUNaLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFBQSxDQUFDO0FBQ0osQ0FBQyJ9