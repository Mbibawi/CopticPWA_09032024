let sequence = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param {HTMLSelectElement}  select - the selection element from which we selet the options
 * @param {boolean} clear - whether or not we should remove all the children of the containerDiv content
 * @param {string} arrayNam - the name of the array where the text of the prayer will be searched for
  *@param {string} tableTitle - the title of the table that we want to retrieve in order to edit
  @param {string[][][]} tablesArray - the array where the table we want to edit will be looked for
 * @param { {includes: boolean}|{equal:boolean } |{startsWith:boolean}} operator - This is the crieteria by which we will be looking for the table by the provides args.tableTitle. Its default value is {includes:true}
 */
function startEditingMode(args) {
    if (args.clear !== false)
        args.clear = true;
    containerDiv.dataset.specificTables = "false";
    if (args.select) {
        //We deal with all the cases where a select element is passed as argument to the function. We exclude the case where arrayName is provided as an argument and the case where the tableTitle is provided.
        args.arrayName = args.select.selectedOptions[0].innerText;
        if (args.arrayName === args.select.options[0].innerText)
            return; //entries[0] === 'Choose From the List'
        else if (args.arrayName === args.select.options[1].innerText)
            addNewTable();
        else if (args.arrayName === args.select.options[2].innerText)
            return runFunction();
        //under development : the user will provide a function and the function will be called when he press enter
        else if (args.arrayName === args.select.options[3].innerText)
            return editDayReadings(); //Editing all the readings of ta give Coptic Date
        else {
            args.arrayName === 'PrayersArray' ? args.arrayName = 'PrayersArrayFR' : args.arrayName = 'ReadingsArrays.' + args.arrayName + 'FR';
            args.tablesArray = editSpecificTable() || [];
        }
        ;
        args.select.selectedIndex = 0;
    }
    else if (!args.tablesArray)
        args.tablesArray = editSpecificTable() || []; //If the arrayName and the tableTitle are provided, it means the user wants to edit a specific table
    if (containerDiv.dataset.arrayName &&
        args.arrayName === containerDiv.dataset.arrayName &&
        !confirm("Warning !! you are about to reload the same array, you will loose all your modifications. Are you sure you want to reload the same array? "))
        return; //If the selected option is the same as the already loaded array, and the user does not confirm reloading the array, we return
    containerDiv.dataset.arrayName = args.arrayName;
    containerDiv.style.gridTemplateColumns = "100%";
    if (!args.languages)
        args.languages = getLanguages(args.arrayName) || allLanguages.map(lang => lang[0]);
    function addNewTable() {
        args.arrayName = "PrayersArray"; //!CAUTION: if we do not set the arrayName to an existing array, it will yeild to an error when the array name will be evaluated by eval(arrayName), and the saveModifiedArray() will stop without exporting the text to file
        args.languages =
            prompt("Provide the sequence of the languages columns", "COP, FR, CA, AR").split(", ") || getLanguages(args.arrayName);
        let title = prompt("Provide the title for the table", "NewTable&D=$copticFeasts.AnyDay") || "NewTable&D=$copticFeasts.AnyDay";
        args.tablesArray = [[[title]]]; //We create a string[][][] with one string[][] (i.e. table) having only 1 string[] (i.e. row)
        args.tablesArray[0][0].push(...args.languages); //We push the languages to the first row of the first table in tablesArray. This will give us a first row like  ['NewTable&D=$copticFeasts.AnyDay&C=Title', 'COP', 'FR', 'CA', etc.]
        args.tablesArray[0].push([...args.tablesArray[0][0]]); //!Caution, we need to deconstruct the elements of the row. Otherwise it will not be a true copy. We add a second row to the table.
        args.tablesArray[0][0][0] += "&C=Title"; //We remove the '&C=Title' from the second row
    }
    function editSpecificTable(arrayName = args.arrayName) {
        alert(arrayName);
        if (!args.tableTitle && //args.tableTitle was not already provided as argument
            confirm("Do you want to edit a single or specific table(s) in the array?"))
            args.tableTitle = prompt('Provide the name of the table you want to edit  (if more than one table, provide the titles separated by ", " ');
        if (!args.tableTitle && !args.arrayName)
            return; //If no tableTitle is provided, and no arrayName, we will return
        if (!args.tableTitle &&
            confirm("No tableTitle is provided, do you want to edit the entire tables array?"))
            return eval(arrayName); //If no tableTitle is provided, we will return the entire array
        let titles = args.tableTitle.split(", "); //if tableTitle is a comma separated string, it means there are multiple table titles provided
        if (!titles || titles.length < 1)
            return console.log("The provided tableTitle argument is not valid");
        containerDiv.dataset.specificTables = "true";
        return titles.map((title) => findTable(title, arrayName ? eval(arrayName) : undefined, args.operator || { includes: true }) || undefined);
    }
    function runFunction() {
        args.arrayName = prompt("Provide the function and the parameters", args.arrayName);
        if (args.arrayName && args.arrayName.includes("Fun("))
            eval(args.arrayName);
    }
    if (!args.tablesArray || args.tablesArray.length < 1)
        return console.log("tablesArray was not set");
    (function editTables() {
        localStorage.displayMode === displayModes[0]; //We make sure that we are in the 'Normal' display mode before showing the text of the tables;
        showTables({
            tablesArray: args.tablesArray,
            languages: args.languages,
            position: containerDiv,
            container: containerDiv,
            clear: args.clear,
        });
    })();
}
/**
 * Takes a string[][][] (i.e., and array of tables, each being a string[][], where each string[] represents a rowh),  that we want to edit,and creates html div elements representing the text of each row of eah table in the tablesArray
 * @param {string[][][]} tablesArray - an array containing the tables that we need to show and start editing
 * @param {string[]} languages - the languages included in the tables
 */
function showTables(args) {
    if (!args.container)
        args.container = containerDiv;
    if (!args.position)
        args.position = containerDiv;
    if (args.clear !== false)
        args.clear = true;
    if (args.clear === true)
        containerDiv.innerHTML = "";
    //We create an html div element to display the text of each row of each table in tablesArray
    let titleBase, arrayName, prayersArray;
    args.tablesArray.forEach((table) => {
        if (!table)
            return;
        titleBase = splitTitle(table[0][0])[0] || "NoTitle";
        prayersArray = getTablesArrayFromTitlePrefix(titleBase);
        PrayersArrays.includes(prayersArray)
            ? (arrayName = "PrayersArrayFR")
            : (arrayName = getArrayNameFromArray(prayersArray)); //If the array of tables that includes the table is one of the arrays in the 'PrayersArrays' list, we set the arrayName to 'PrayersArray', or otherwise, we retrieve its name from the PrayersArraysKeys by calling getArrayNameFromArray(prayersArray)
        if (!arrayName &&
            confirm('We could not infer the name of the array from the title of the table, do you want to set it to "PrayersArray?"'))
            arrayName = "PrayersArray";
        if (!arrayName)
            return console.log("The name of the array is missing");
        table.forEach((row) => {
            if (!row)
                return;
            createHtmlElementForPrayerEditingMode({
                tblRow: row,
                titleBase: titleBase,
                languagesArray: args.languages || getLanguages(arrayName),
                position: args.position,
                container: args.container,
                arrayName: arrayName,
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
    titles.forEach((div) => Array.from(div.getElementsByTagName("P")).forEach((p) => (p.innerText = p.innerText.replaceAll(String.fromCharCode(plusCharCode + 1), ""))));
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
    btnsDiv.style.gridTemplateColumns = ((100 / 3).toString() + "% ").repeat(3);
    btnsDiv.style.top = "10px";
    btnsDiv.style.width = "90%";
    btnsDiv.style.justifySelf = "top !important";
    btnsDiv.style.justifyItems = "stretch";
    btnsDiv.style.position = "fixed";
    containerDiv.insertAdjacentElement("beforebegin", btnsDiv);
    createEditingButton(() => modifyAllSelectedText(), "Modify Selected Text", btnsDiv);
    createEditingButton(() => changeTitle(document.getSelection().focusNode.parentElement), "Change Title", btnsDiv);
    createEditingButton(() => changeCssClass(document.getSelection().focusNode.parentElement), "Change Class", btnsDiv);
    createEditingButton(() => saveModifiedArray({ exportToFile: false, exportToStorage: true }), "Save", btnsDiv);
    createEditingButton(() => saveModifiedArray({ exportToFile: true, exportToStorage: true }), "Export to JS file", btnsDiv);
    createEditingButton(() => addTableToSequence(document.getSelection().focusNode.parentElement), "Add Table to Sequence", btnsDiv);
    createEditingButton(() => exportSequence(), "Export Sequence", btnsDiv);
    createEditingButton(() => addNewRow(document.getSelection().focusNode.parentElement), "Add Row", btnsDiv);
    createEditingButton(() => addNewCell(document.getSelection().focusNode.parentElement), "Add Cell", btnsDiv);
    createEditingButton(() => addNewRow(document.getSelection().focusNode.parentElement, true), "Add PlaceHolder", btnsDiv);
    createEditingButton(() => addNewColumn(document.getSelection().focusNode.parentElement), "Add Column", btnsDiv);
    createEditingButton(() => deleteRow(document.getSelection().focusNode.parentElement), "Delete Row", btnsDiv);
    createEditingButton(() => deleteCell(document.getSelection().focusNode.parentElement), "Delete Cell", btnsDiv);
    createEditingButton(() => splitParagraphsToTheRowsBelow(document.getSelection().focusNode.parentElement), "Split Below", btnsDiv);
    createEditingButton(() => convertCopticFontFromAPI(document.getSelection().focusNode.parentElement), "Convert Coptic Fonts", btnsDiv);
    createEditingButton(() => goToTableByTitle(), "Go to Table", btnsDiv);
    createEditingButton(() => editNextOrPreviousTable(document.getSelection().focusNode.parentElement, true), "Next  Table", btnsDiv);
    createEditingButton(() => editNextOrPreviousTable(document.getSelection().focusNode.parentElement, false), "Previous Table", btnsDiv);
}
/**
 * Generates a file name for the JS file, including the name of the array, the date on which it was modified, and the time
 * @param {string} arrayName - the name of the array for which we want to generate a file name
 */
function getJSFileName(arrayName) {
    let today = new Date();
    return (arrayName +
        "_[ModifiedOn" +
        String(today.getDate()) +
        String(today.getMonth() + 1) + //we add 1 because the months are counted from 0
        String(today.getFullYear()) +
        "at" +
        String(today.getHours() + 1) +
        "h" +
        String(today.getMinutes()) +
        "].js");
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
 * Deletes a cell in a row
 * @param {HTMLElement} htmlParag - the paragraph that we want to delete
 * @returns
 */
function deleteCell(htmlParag) {
    if (htmlParag.tagName !== 'P')
        return alert('The selection is not a paragraph');
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    if (!confirm("Are you sure you want to delete this paragraph?"))
        return; //We ask the user to confirm before deletion
    htmlParag.remove();
    htmlRow.style.gridTemplateColumns = setGridColumnsOrRowsNumber(htmlRow); //We adapt the number of columns of the parent div 
    htmlRow.style.gridTemplateAreas = setGridAreas(htmlRow); //We adapt the grid areas of the parent div
}
/**
 * Changes the 'actor' css class of a row
 * @param {HTMLElement} htmlRow - the div (row) for which we want to change the css class
 */
function changeCssClass(htmlParag, newClass) {
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return alert("Did not find the parent Div");
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
        return alert("You didn't provide a valid title");
    if (newTitle === oldTitle)
        return;
    htmlRow.dataset.root = splitTitle(newTitle)[0];
    htmlRow.title = newTitle;
    changeParagraphsDataRoot();
    function changeParagraphsDataRoot(row = htmlRow, title = newTitle) {
        Array.from(row.querySelectorAll("p"))
            .filter((child) => child.dataset.root && child.title)
            .forEach((child) => {
            child.dataset.root = splitTitle(title)[0];
            child.title = title;
        });
    }
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
                sibling.title += "&C=" + cssClass;
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
    let btnHtml = document.createElement("button");
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
function saveModifiedArray(args) {
    let title, titles = new Set(), savedArrays = new Set(), tablesArray;
    if (!args.htmlRows)
        args.htmlRows = Array.from(containerDiv.querySelectorAll("div.Row, div.PlaceHolder")).filter((div) => div.dataset.root); //we retrieve all the divs with 'Row' class from the DOM
    if (args.dataRoot)
        args.htmlRows = args.htmlRows.filter((htmlRow) => htmlRow.dataset.root === args.dataRoot);
    //Adding the tables' titles as unique values to the titles set
    args.htmlRows.forEach((htmlRow) => {
        if (!htmlRow)
            return; //This will happen if the row was row of a table referrenced by a placeholder, that was later on hidden when the click() event of the placeholder row was triggered (see below)
        if (htmlRow.dataset.isPlaceHolder) {
            saveModifiedArray({
                exportToFile: false,
                exportToStorage: true,
                dataRoot: htmlRow.dataset.isPlaceHolder,
            });
            args.htmlRows
                .filter((div) => !div.dataset.isPlaceHolder &&
                div.dataset.root &&
                div.dataset.root === htmlRow.dataset.isPlaceHolder)
                .forEach((div) => div.remove()); //We remove all the html elements that were created to show the rows of the table referenced by the 'PlaceHolder' element.
            return;
        }
        title = htmlRow.dataset.root; //this is the title without '&C='
        if (titles.has(title))
            return;
        titles.add(title);
        if (!htmlRow.dataset.arrayName)
            return console.log("We encountered a problem with one of the rows : ", htmlRow);
        if (!savedArrays.has(htmlRow.dataset.arrayName))
            savedArrays.add(htmlRow.dataset.arrayName);
        tablesArray = eval(htmlRow.dataset.arrayName);
        if (PrayersArrays.includes(tablesArray))
            tablesArray = PrayersArrayFR; //If the array is one of the arrays in PrayersArrays, the Array that need to be saved is Prayers Array not the sub array itself
        if (!tablesArray)
            return console.log("We've got a problem while executing saveOrExportArray(): title = ", title, " and arrayName = ", htmlRow.dataset.arrayName);
        modifyEditedArray(title, tablesArray);
    });
    //We finally save or export each array in the savedArrays
    savedArrays.forEach((arrayName) => saveOrExportArray(eval(arrayName), arrayName, args.exportToFile, args.exportToStorage));
}
/**
 * Creates string[][] tables  from the html children of containerDiv,  as edited and modified. It does so by selecting all the div elements having the same data-set-root, and converting the text in each such div element into a string[], and adds all the created string[] to a string[][].
 * It then loops the tablesArray (i.e., the original array of tables that we were editing), and looks if it contains a table (i.e. a string[][])  with the same title as the table created from the div elements. If so, it replaces this string[][] in the tablesArray table with the string[][] created from the div elements. Otherwise, it prompts the user wheter he wants to add the created string[][] as a new table at the end of the tablesArray.
 * @param {string} tableTitle - The title of a table in the tablesArray (which is a string[][][])
 * @param {string[][][]} tablesArray - the array that we were editing.
 */
function modifyEditedArray(tableTitle, tablesArray) {
    //We select all the div elements having same data-set-root attribute as the title of the table (tabeTitle)
    if (!tablesArray || !tableTitle)
        return;
    let htmlTable = Array.from(containerDiv.querySelectorAll("div.Row, div.PlaceHolder")).filter((htmlRow) => htmlRow.dataset.root && htmlRow.dataset.root === tableTitle);
    if (htmlTable.length === 0)
        return;
    //We start by modifiying the array to which the table belongs
    modifyArray(htmlTable);
    function modifyArray(htmlTable) {
        //We generate a string[][] array from the div elements we selected. Each div element is an elemet of the string[][], and each paragraph attached to such div is a string element.
        let editedTable = convertHtmlDivElementsIntoArrayTable(htmlTable);
        if (!editedTable || editedTable.length < 1)
            return console.log("convertHtmlDivElementsIntoArrayTable() returned undefined, or empty aray");
        [
            tablesArray,
            getTablesArrayFromTitlePrefix(htmlTable[0].dataset.root),
        ].forEach((array) => modifyTheMainAndSubArrays(array)); //We will modify the tabl in its main Array (retrieved by the arrayName argument, and any other sub array in which th etable might be also included (like PrayersArrays.massCommon, PrayersArrays.IncenseDawn, etc.));
        function modifyTheMainAndSubArrays(targetTablesArray) {
            if (!targetTablesArray)
                return;
            let oldTable = targetTablesArray.find((tbl) => splitTitle(tbl[0][0])[0] === splitTitle(editedTable[0][0])[0]);
            if (oldTable)
                targetTablesArray.splice(targetTablesArray.indexOf(oldTable), 1, editedTable);
            else if (confirm("No table with the same title was found in the array, do you want to add the edited table as a new table "))
                targetTablesArray.push(editedTable);
        }
    }
}
/**
 *
 * @param {string} arrayName - Name of the modified array that we want to save to local storage or export to a JS file
 * @param {boolean} exportToStorage - if true the array is saved in localStorage.editedText. Its default value is true
 * @param {boolean} exportToFile - if true the array text is export as a JS file. Its default value is true
 */
function saveOrExportArray(tablesArray, arrayName, exportToFile = true, exportToStorage = true) {
    let text;
    if (!tablesArray)
        return console.log("tablesArray is undefined:  ", tablesArray);
    if (!arrayName)
        return console.log("No array nam is provided");
    console.log("modified array = ", arrayName);
    text = processArrayTextForJsFile(arrayName, tablesArray);
    if (!text)
        return console.log("We've got a problem when we called processArrayTextForJsFile().  arrayName = ", arrayName);
    if (exportToStorage) {
        localStorage.editedText = text;
        console.log(localStorage.editedText);
    }
    if (exportToFile)
        exportToJSFile(text, arrayName);
}
/**
 * Takes a table array, and process the strings in the array, in order to restore the prefixes and insert escape characters before the new lines, etc. in a format that suits a js file
 * @param {string[][][]} tablesArray - the string[][][] that will be processed and returned as a text the js file
 * @return {string} the text representing the array in a js file
 */
function processArrayTextForJsFile(arrayName, tablesArray) {
    //Open Array of Tables
    if (!tablesArray)
        tablesArray = eval(arrayName);
    if (!tablesArray)
        return;
    let text = "[";
    tablesArray.forEach((table) => processTable(table));
    function processTable(table) {
        if (!table || table.length < 1) {
            console.log("error with table in processTable() = ", table);
            return alert("Something went wrong");
        }
        //open table array
        text += "[\n";
        table.forEach((row) => {
            processTableRow(row);
        });
        //close table
        text += "],\n";
    }
    function processTableRow(row) {
        if (!row || row.length < 1) {
            console.log("error with row in processTable() = ", row);
            return alert("Something went wrong");
        }
        //open row array
        text += "[\n";
        row.forEach((element) => processStringElement(element, row));
        //close row
        text += "],\n";
    }
    function processStringElement(element, row) {
        //for each string element in row[]
        element = element
            .replaceAll('"', '\\"') //replacing '"" by '\"'
            .replaceAll("\n", "\\n")
            .replaceAll("\r", "\\r");
        if (splitTitle(row[0])[1] === "Title")
            element = element
                .replaceAll(String.fromCharCode(plusCharCode) + " ", "")
                .replaceAll(String.fromCharCode(plusCharCode + 1) + " ", ""); //removing the plus(+) and minus(-à characters from the titles
        text += '"' + element + '", \n'; //adding the text of row[i](after being cleaned from the unwatted characters) to text
    }
    text = replacePrefixes(text, arrayName);
    text = arrayName + "= " + text + "];";
    return text;
}
function replacePrefixes(text, arrayName) {
    let prefix;
    Object.entries(Prefix).forEach((entry) => {
        prefix = "Prefix." + entry[0];
        if (entry[1] === Prefix.placeHolder)
            text = text.replaceAll('"' + eval(prefix) + '"', prefix);
        else
            text = text.replaceAll('"' + eval(prefix), (prefix += '+"'));
    });
    if (arrayName !== "PrayersArray")
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
    if (!innerHtml.includes("<q>"))
        return innerHtml;
    if (lang === "FR")
        return innerHtml
            .replaceAll("<q>", String.fromCharCode(171))
            .replaceAll("</q>", String.fromCharCode(187));
    else if (lang === "AR" || lang === "EN")
        return innerHtml.replaceAll("<q>", '"').replaceAll("</q>", '"');
    return innerHtml;
}
/**
 * Adds a new div (row) below the div (row) passed to it as argument.
 * @param {HTMLElement} row - the div (row) below which we will add a row
 * @param {string} dataRoot - a string representing the data-root value that will be givent to the new div (row) added. If missing, the user will be prompted to provide the dataRoot, with, as default value, the data-root value of 'row'
 */
function addNewRow(htmlParag, isPlaceHolder = false, title) {
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let newRow = document.createElement("div"), p, rowClass = 'Row', gridColumns = htmlRow.style.gridTemplateColumns, gridAreas = htmlRow.style.gridTemplateAreas;
    if (isPlaceHolder) {
        rowClass = 'PlaceHolder';
        gridColumns = '1';
        gridAreas = 'FR';
        newRow.dataset.root = htmlRow.dataset.root;
        newRow.title = htmlRow.dataset.title;
        if (htmlRow.dataset.displayedPlaceHolder)
            //If htmlRow is a row in a table displayed from a PlaceHolder element, we will go up until we find the first row of the main table to which the PlaceHolder table is attached, and will retrieve its dataset.root
            Object.entries(getMainTableTitle(htmlRow))
                .forEach(entry => entry[0] === 'title' ? newRow.title = entry[1] : newRow.dataset.arrayName = entry[1]);
        newRow.dataset.root = splitTitle(newRow.title)[0];
        newRow.dataset.group = newRow.dataset.root;
        function getMainTableTitle(div) {
            let previous = div.previousElementSibling;
            while (
            //We go up as long as the previous element has dataset.displayedPlaceHolder === div.dataset.displayedPlaceHolder
            previous.dataset.displayedPlaceHolder
                &&
                    previous.dataset.displayedPlaceHolder === div.dataset.displayedPlaceHolder)
                getMainTableTitle(previous);
            return { title: previous.title, arrayName: previous.dataset.arrayName }; //This is the main div where the PlaceHolder is displayed before being extended when clicked on
        }
    }
    newRow.classList.add(rowClass);
    newRow.dataset.isNewRow = "isNewRow";
    newRow.style.display = htmlRow.style.display;
    newRow.style.gridTemplateColumns = gridColumns;
    newRow.style.gridTemplateAreas = gridAreas;
    if (!title)
        title = prompt("Provide the Title of the new Row", htmlRow.title);
    if (!title)
        return alert('You must provide a valide name for the table that will be put as PlaceHolder');
    if (isPlaceHolder)
        newRow.dataset.isPlaceHolder = title;
    if (!newRow.dataset.root) //If not already set because it is a new PlaceHolder row
        newRow.dataset.root = splitTitle(title)[0];
    if (!newRow.title) //If not already set because it is a new PlaceHolder row
        newRow.title = title;
    if (!newRow.dataset.arrayName) //If not already set because it is a new PlaceHolder row
        newRow.dataset.arrayName = prompt("Provide the name of the array", htmlRow.dataset.arrayName);
    if (!isPlaceHolder && splitTitle(title)[1])
        newRow.classList.add(splitTitle(title)[1]);
    let children = Array.from(htmlRow.children);
    children
        .forEach((child) => {
        if (isPlaceHolder && newRow.children.length > 0)
            return;
        if (!child.lang || child.tagName !== "P")
            return;
        p = newRow.appendChild(document.createElement("p"));
        if (isPlaceHolder)
            p.innerText = splitTitle(title)[0];
        p.title = newRow.title;
        p.dataset.root = newRow.dataset.root;
        isPlaceHolder ? p.lang = 'FR' : p.lang = child.lang;
        p.classList.add(p.lang.toUpperCase());
        p.contentEditable = "true";
    });
    return htmlRow.insertAdjacentElement("afterend", newRow);
}
function addNewCell(htmlParag) {
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let p = document.createElement("p"), lang = prompt('Provide the language of the paragraph') || 'FR';
    p.contentEditable = 'true';
    p.dataset.root = htmlParag.dataset.root;
    p.title = htmlParag.title;
    p.classList.add(lang);
    p.lang = lang;
    p.innerText = 'New paragraph added';
    htmlParag.insertAdjacentElement("afterend", p);
    htmlRow.style.gridTemplateAreas = setGridAreas(htmlRow);
    htmlRow.style.gridTemplateColumns = setGridColumnsOrRowsNumber(htmlRow);
}
function addNewColumn(htmlParag) {
    if (htmlParag.tagName !== "P")
        return alert("The html element passed to addNewColumn is not a paragraph");
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let langClass = prompt('You must proivde a language class (like "AR", "FR", etc. for the new column. It must not be more than 3 letters, and can be either uper case or lower case', "AR").toUpperCase();
    if (!langClass || langClass.length > 3)
        return alert("You didn't provide a valid language class");
    let newColumn = document.createElement("p");
    newColumn.contentEditable = "true";
    newColumn.classList.add(langClass);
    newColumn.lang = langClass;
    newColumn.innerText = "New column added with class = " + newColumn.lang;
    htmlRow.appendChild(newColumn);
    newColumn.dataset.isNew = "isNewColumn";
    htmlRow.style.gridTemplateColumns = ((100 / htmlRow.children.length).toString() + "% ").repeat(htmlRow.children.length);
    let languages = Array.from(htmlRow.children).map((p) => p.lang);
    let areas = languages.join(" ");
    areas = prompt("Do we want to rearrange the languages areas?", areas);
    areas.split(" ").map((language) => {
        let parag = Array.from(htmlRow.children).filter((p) => p.lang === language)[0];
        htmlRow.appendChild(parag); //we are arranging the html paragraphs elements in the same order as provided by the user when prompted
    });
    areas = areas.replaceAll(",", "");
    htmlRow.style.gridTemplateAreas = '"' + areas + '"';
    return htmlRow;
}
function createHtmlElementForPrayerEditingMode(args) {
    if (!args.position)
        args.position = containerDiv;
    if (!args.container)
        args.container = containerDiv;
    if (!args.arrayName)
        args.arrayName = getArrayNameFromArray(getTablesArrayFromTitlePrefix(args.titleBase));
    if (!args.arrayName)
        return;
    if (args.titleBase.startsWith(Prefix.HolyWeek) && args.arrayName === 'ReadingsArrays.GospelNightArrayFR')
        args.languagesArray = getLanguages('PrayersArrayFR');
    let htmlRow, p, lang, text, actorClass, isPlaceHolder;
    args.tblRow[0].startsWith(Prefix.placeHolder)
        ? (isPlaceHolder = true)
        : (isPlaceHolder = false);
    actorClass = splitTitle(args.tblRow[0])[1] || "";
    htmlRow = document.createElement("div");
    if (args.arrayName)
        htmlRow.dataset.arrayName = args.arrayName;
    if (!isPlaceHolder) {
        htmlRow.classList.add("Row"); //we add 'Row' class to this div
        htmlRow.title = args.titleBase + "&C=" + actorClass; //We need to record the full title of each row (i.e. row[0]) in order to be able to add it when we convert the html element into an element in an Array
        htmlRow.dataset.root = args.titleBase;
        htmlRow.dataset.group = args.titleBase; //The data-group attribute aims at making the row part of the same of group of rows that will be shown or hidden when we click on the title
        if (args.tblRow[0].startsWith(Prefix.same))
            htmlRow.dataset.isPrefixSame = 'true'; //We need this in order to be able to determine whether when exporting the table, the row should be a row starting with Prefix.same, or should be given the full title as the 1st row of the table
        if (actorClass)
            htmlRow.classList.add(actorClass);
    }
    else if (isPlaceHolder) {
        args.tblRow = [...args.tblRow]; //We create a copy of the row
        let children = Array.from(args.container.children);
        let lastChild = children[children.length - 1];
        htmlRow.classList.add("PlaceHolder");
        htmlRow.dataset.isPlaceHolder = args.tblRow[1]; //This is the title of the table referrenced by the placeHolder row
        htmlRow.dataset.root = lastChild.dataset.root; //We add as data-root the data-root of the previous element appended to the container. We do this because we want the placeHolder div to be part of the main table and be retrieved with the same data root and title
        htmlRow.title = lastChild.title; //We do the same for the data-title attribute as for the data-root.
        htmlRow.dataset.goup = lastChild.dataset.group; //Same as above
        htmlRow.style.backgroundColor = "grey";
        let copyLangs = [...args.languagesArray];
        htmlRow.addEventListener("click", () => {
            let referrencedTblTitle = htmlRow.dataset.isPlaceHolder; //When tblRow is a 'PlaceHoder', it has 2 elements: the first of which is  'Prefix.placeHolder' and the second (i.e., args.tblRow[1]) is the title of the table that is refrenced
            let shown = Array.from(containerDiv.querySelectorAll("div")).filter((div) => div.dataset.displayedPlaceHolder &&
                div.dataset.displayedPlaceHolder === referrencedTblTitle);
            if (shown.length > 0) {
                //This means that the table referrenced in tblRow[1] is displayed. We will save any changes made to it and remove it
                saveModifiedArray({
                    exportToFile: false,
                    exportToStorage: true,
                    dataRoot: referrencedTblTitle,
                });
                shown.forEach((displayed) => {
                    if (displayed.dataset.isPlaceHolder)
                        Array.from(containerDiv.querySelectorAll("div.Row"))
                            .filter((div) => div.dataset.root &&
                            div.dataset.root === displayed.dataset.isPlaceHolder)
                            .forEach((div) => {
                            saveModifiedArray({
                                exportToFile: false,
                                exportToStorage: true,
                                dataRoot: displayed.dataset.isPlaceHolder,
                            });
                            div.remove();
                        });
                    displayed.remove();
                });
                return;
            }
            let tblsArray = getTablesArrayFromTitlePrefix(referrencedTblTitle);
            if (!tblsArray)
                return console.log("We could not identifiy the array in which the referrenced table is to be retrieved");
            let tableArrayName = getArrayNameFromArray(tblsArray);
            let table = [
                ...tblsArray.find((tbl) => splitTitle(tbl[0][0])[0] === referrencedTblTitle),
            ] //!Caution, we must create a copy of the table otherwise the original table may be reversed in it its array
                .reverse();
            let created = table.map((row) => {
                return createHtmlElementForPrayerEditingMode({
                    tblRow: row,
                    titleBase: splitTitle(table[0][0])[0],
                    languagesArray: copyLangs,
                    position: {
                        el: htmlRow,
                        beforeOrAfter: "afterend",
                    },
                    container: args.container,
                    arrayName: tableArrayName, //This is the array name of the embeded table not for the table including the placeHolder referencing the embeded table
                });
            });
            setCSS(created);
            //Prefix.massStBasil + 'Reconciliation'
            created.forEach((div) => {
                div.dataset.displayedPlaceHolder = referrencedTblTitle;
                Array.from(div.children).forEach((paragraph) => {
                    paragraph.contentEditable = "true";
                });
            });
        });
        args.languagesArray = ["FR", "FR", "FR"]; //! The languagesArray must be changed after the addEventListner has been added to the placeHolder row
    }
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
        if (actorClass && actorClass === "Comments") {
            //this means it is a comment
            x == 1
                ? (lang = args.languagesArray[1])
                : (lang = args.languagesArray[3]);
        }
        else {
            lang = args.languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
        } //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
        p = document.createElement("p"); //we create a new <p></p> element for the text of each language in the 'prayer' array (the 'prayer' array is constructed like ['prayer id', 'text in AR, 'text in FR', ' text in COP', 'text in Language', etc.])
        if (!actorClass) {
            //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
            p.classList.add("PrayerText");
        }
        p.dataset.root = htmlRow.dataset.root; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
        p.title = htmlRow.title;
        text = args.tblRow[x];
        if (lang)
            p.classList.add(lang.toUpperCase());
        p.lang = lang; //we are adding this in order to be able to retrieve all the paragraphs in a given language by its data attribute. We need to do this in order for example to amplify the font of a given language when the user double clicks
        p.innerText = text;
        p.contentEditable = "true";
        htmlRow.appendChild(p); //the row which is a <div></div>, will encapsulate a <p></p> element for each language in the 'prayer' array (i.e., it will have as many <p></p> elements as the number of elements in the 'prayer' array)
    }
    //@ts-ignore
    args.position.el
        ?
            //@ts-ignore
            args.position.el.insertAdjacentElement(args.position.beforeOrAfter, htmlRow)
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
        let tableRows = Array.from(containerDiv.children).filter((htmlRow) => htmlRow.dataset.root);
        tableRows.forEach((row) => {
            createHtmlElementForPrayerEditingMode({
                tblRow: Array.from(row.querySelectorAll("p")).map((p) => p.innerText),
                titleBase: row.dataset.root,
                languagesArray: allLanguages.map(lang => lang[0]),
                position: document.getElementById("showSequence"),
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
        tableRows = Array.from(container.children).filter((htmlRow) => htmlRow.dataset.root.startsWith(title));
        tableRows.forEach((row) => {
            createHtmlElementForPrayerEditingMode({
                tblRow: Array.from(row.querySelectorAll("p")).map((p) => p.innerText),
                titleBase: title,
                languagesArray: allLanguages.map(lang => lang[0]),
                position: newDiv,
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
        filename = "PrayersArrayModified";
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
function splitParagraphsToTheRowsBelow(htmlParag) {
    //Sometimes when copied, the text is inserted as a SPAN or a div, we will go up until we get the paragraph element itslef
    let showAlert = () => alert("Make sure the cursuor is placed within the text of a paragraph/cell");
    if (!htmlParag)
        return showAlert(); //We check that we got a paragraph element
    while (htmlParag.tagName !== "P" && htmlParag.parentElement)
        htmlParag = htmlParag.parentElement;
    if (htmlParag.tagName !== "P")
        return showAlert();
    let title = htmlParag.parentElement.dataset.title ||
        htmlParag.parentElement.dataset.root +
            "&C=" +
            Array.from(htmlParag.parentElement.classList).find((c) => c !== "Row"), lang = htmlParag.lang, table = Array.from(containerDiv.children).filter((htmlRow) => htmlRow.dataset.root && htmlRow.dataset.root === splitTitle(title)[0]); //Those are all the rows belonging to the same table, including the title
    if (!table || table.length === 0)
        return alert("We didn't find any elements having the same data-root as the selected paragraph: " +
            title);
    let rowIndex = table.indexOf(htmlParag.parentElement);
    //We retrieve the paragraph containing the text
    let splitted = htmlParag.innerText.split("\n");
    for (let i = 0; i < splitted.length; i++) {
        if (!splitted[i] || splitted[i] === "")
            continue;
        if (!table[i + rowIndex]) {
            //if tables rows are less than the number of paragraphs in 'clean', we add a new row to the table, and we push the new row to table
            table.push(addNewRow(table[table.length - 1].querySelector('p[lang="' + lang + '"]'), false, title) || undefined);
        }
        let paragraph = Array.from(table[i + rowIndex].children).filter((p) => p.lang === lang)[0];
        paragraph.textContent = "";
        paragraph.innerText = splitted[i];
    }
    htmlParag.id = "splittedParagraph"; //We give the htmlParag an id in order to be able to jumb again to the paragraph after we finish splitting the text
    createFakeAnchor(htmlParag.id); //We go to the paragraph after we finished editing the text
    htmlParag.id = "finishedEditing";
}
/**
 * If htmlParag is not a Div, it checks each of its parents until it founds the DIV container. Otherwise, it triggers an alert message and returns 'undefined'
 * @param {HTMLElement} htmlParag - the html element within which hte cursor is placed
 * @returns {HTMLDivElement | undefined}
 */
function getHtmlRow(htmlParag) {
    if (!htmlParag)
        return alert("Make sure your cursor is within the cell/paragraph where the text is to be found");
    while (!htmlParag.classList.contains("Row") &&
        htmlParag.parentElement &&
        htmlParag.parentElement !== containerDiv) {
        htmlParag = htmlParag.parentElement;
    }
    if (htmlParag.tagName !== "DIV" || !htmlParag.classList.contains("Row"))
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
    if (!arrayName)
        return languages;
    if (arrayName.startsWith("ReadingsArrays."))
        languages = readingsLanguages;
    if (arrayName.startsWith("ReadingsArrays.SynaxariumArray"))
        languages = ["FR", "AR"];
    if (arrayName === "NewTable")
        languages = ["COP", "FR", "EN", "CA", "AR"];
    return languages;
}
/**
 * Converts the coptic font of the text in the selected html element, to a unicode font
 * @param {HTMLElement} htmlElement - an editable html element in which the cursor is placed, containing coptic text in a non unicode font, that we need to convert
 */
async function convertCopticFontFromAPI(htmlElement, fontFrom) {
    let text;
    const apiURL = "https://www.copticchurch.net/coptic_language/fonts/convert";
    if (!fontFrom)
        fontFrom = prompt("Provide the font", "Coptic1/CS Avva Shenouda");
    while (htmlElement.tagName !== "P" && htmlElement.parentElement)
        htmlElement = htmlElement.parentElement;
    text = htmlElement.textContent;
    let request = new XMLHttpRequest();
    request.open("POST", apiURL);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("accept", "text");
    request.send("from=" +
        encodeURI(fontFrom) +
        "&encoding=unicode&action=translate&data=" +
        encodeURI(text));
    request.responseType = "text";
    request.onload = () => { return onLoad(); };
    function onLoad() {
        if (request.status === 200) {
            let textArea = new DOMParser()
                .parseFromString(request.response, "text/html")
                .getElementsByTagName("textarea")[0];
            console.log("converted text = ", textArea.innerText);
            htmlElement.innerText = textArea.innerText;
            text = textArea.innerText;
            return textArea.innerText;
        }
        else {
            console.log("error status text = ", request.statusText);
            text = 'Failed and got error : ' + request.statusText;
            return request.statusText;
        }
    }
    return text;
}
function goToTableByTitle() {
    saveModifiedArray({ exportToFile: false, exportToStorage: true });
    let title = "";
    //@ts-ignore
    if (containerDiv.children.length > 0 && containerDiv.children[0].dataset.root)
        title = containerDiv.children[0].dataset.root;
    title = prompt('Provide the title you want to go to. If you want to show the readings of a given day, you provide the date of the readings in this format"ReadignsDate = [date]"', title);
    if (confirm("Do you want to edit the readings of a given date?")) {
        let date = prompt("Provide the Coptic date as DDMM of the readings you want to edit");
        if (!date)
            return;
        return editDayReadings(date);
    }
    let rows = Array.from(containerDiv.querySelectorAll(".Row")).filter((row) => row.dataset.root.includes(title));
    if (rows.length === 0) {
        startEditingMode({
            tableTitle: title,
            clear: true,
        });
        return;
    }
    if (rows.length === 0)
        return alert("Didn't find an element with the provided title");
    rows[0].id = rows[0].dataset.root + String(0);
    createFakeAnchor(rows[0].id);
}
function editNextOrPreviousTable(htmlParag, next = true) {
    if (containerDiv.dataset.specificTables !== "true" ||
        !containerDiv.dataset.arrayName)
        return; //We don't run this function unless we are in the 'edinting specific table(s) mode'
    let htmlRow = getHtmlRow(htmlParag);
    if (!htmlRow)
        return;
    let title = htmlRow.dataset.root;
    if (!title)
        return alert("We couldn't retrieve the data-root of the current table. Make sure the cursor is placed within one of the table's cells");
    //We first save the changes to the array
    saveModifiedArray({ exportToFile: false, exportToStorage: true });
    let arrayName = containerDiv.dataset.arrayName;
    let array = eval(arrayName);
    let table = array.filter((tbl) => splitTitle(tbl[0][0])[0] === splitTitle(title)[0])[0];
    if (!table || table.length < 1)
        return alert("The current table could not be retrieved from the array by its title from the data-root attribute");
    array = eval(arrayName); //!CAUTION we needed to do this in order to unfilter the array again after it had been filtered (P.S.: the spread operator did'nt work)
    if (next)
        table = array[array.indexOf(table) + 1];
    else
        table = array[array.indexOf(table) - 1];
    if (!table || table.length < 1)
        return alert("The next or previous table could not be found");
    showTables({
        tablesArray: [table],
        languages: getLanguages(arrayName),
        position: containerDiv,
        container: containerDiv,
    });
    scrollToTop();
}
function reArangeTablesColumns(tblTitle, arrayName) {
    //@ts-ignore
    // if (!console.save) addConsoleSaveMethod(console);
    let array = eval(arrayName);
    let table = array.filter((tbl) => tbl[0][0] === tblTitle)[0];
    table.forEach((row) => {
        row[row.length - 1] = row[1];
        row[1] = "";
        row.splice(1, 0, "");
        row.splice(1, 0, "");
    });
    exportToJSFile(processArrayTextForJsFile(arrayName, array), arrayName);
}
function editDayReadings(date) {
    if (date)
        saveModifiedArray({ exportToFile: true, exportToStorage: true });
    if (!date)
        date = prompt("Provide the Coptic date as DDMM of the readings you want to edit");
    if (!date)
        return;
    let readings = [];
    Object.entries(ReadingsArrays).forEach((readingArray) => readingArray[1]
        .filter((tbl) => tbl[0][0].includes(date)) //!This must be a filter not a find operation because the Gospel Psalm and the Gospel itself for a given day are in 2 separate tables
        .forEach((tbl) => readings.push(tbl)));
    if (readings.length < 1)
        return;
    containerDiv.innerHTML = "";
    let tblTitle;
    readings.forEach((tbl) => {
        if (!tbl)
            return;
        tblTitle = splitTitle(tbl[0][0])[0];
        startEditingMode({
            tableTitle: tblTitle,
            arrayName: PrayersArraysKeys.find((array) => tblTitle.startsWith(array[0]))[1],
            clear: false,
            operator: { equal: true },
        });
    });
    Object.entries(ReadingsArrays)
        .forEach(readingArray => {
        readingArray[1].filter((table) => table[0][0].includes(date))
            .forEach((table) => {
            startEditingMode({
                tableTitle: splitTitle(table[0][0])[0],
                arrayName: 'ReadingsArrays.' + readingArray[0],
                clear: false,
            });
        });
    });
}
function showBtnInEditingMode(btn) {
    if (containerDiv.children.length > 0)
        saveModifiedArray({ exportToFile: true, exportToStorage: true });
    let container = containerDiv;
    if (btn.docFragment)
        container = btn.docFragment;
    hideExpandableButtonsPannel();
    expandableBtnsPannel.innerHTML = "";
    containerDiv.style.gridTemplateColumns = "100%";
    if (btn.onClick)
        btn.onClick();
    if (btn.prayersSequence && btn.prayersArray && btn.languages)
        showPrayersFromSequence();
    closeSideBar(leftSideBar);
    function showPrayersFromSequence() {
        let array;
        btn.prayersSequence.forEach((title) => {
            if (!title.includes("&D="))
                return;
            array = getTablesArrayFromTitlePrefix(title);
            if (!array)
                return console.log("tablesArray is undefined");
            showTables({
                tablesArray: [findTable(title, array, { equal: true })],
                languages: getLanguages(getArrayNameFromArray(array)),
                position: container,
                container: container,
                clear: false,
            });
        });
    }
    if (btn.children && btn.children.length > 0) {
        //We will not empty the left side bar unless the btn has children to be shown  in the side bar instead of the children of the btn's parent (btn being itself one of those children)
        //!CAUTION, this must come after btn.onClick() is called because some buttons are not initiated with children, but their children are added  when their onClick()  is called
        sideBarBtnsContainer.innerHTML = "";
        btn.children.forEach((childBtn) => {
            //for each child button that will be created, we set btn as its parent in case we need to use this property on the button
            if (btn.btnID != btnGoToPreviousMenu.btnID)
                childBtn.parentBtn = btn;
            //We create the html element reprsenting the childBtn and append it to btnsDiv
            createBtn({
                btn: childBtn,
                btnsContainer: sideBarBtnsContainer,
                btnClass: childBtn.cssClass,
            });
        });
    }
    showTitlesInRightSideBar(Array.from(container.querySelectorAll(".Title, .SubTitle")));
    if (btn.parentBtn &&
        btn.btnID !== btnGoToPreviousMenu.btnID &&
        !sideBarBtnsContainer.querySelector("#" + btnGoToPreviousMenu.btnID)) {
        //i.e., if the button passed to showChildButtonsOrPrayers() has a parentBtn property and it is not itself a btnGoback (which we check by its btnID property), we wil create a goBack button and append it to the sideBar
        //the goBack Button will only show the children of btn in the sideBar: it will not call showChildButonsOrPrayers() passing btn to it as a parameter. Instead, it will call a function that will show its children in the SideBar
        createGoBackBtn(btn.parentBtn, sideBarBtnsContainer, btn.cssClass);
        lastClickedButton = btn;
    }
    if (btn.btnID !== btnMainMenu.btnID && //The button itself is not btnMain
        btn.btnID !== btnGoToPreviousMenu.btnID && //The button itself is not btnGoBack
        !sideBarBtnsContainer.querySelector("#" + "settings") &&
        !sideBarBtnsContainer.querySelector("#" + btnMainMenu.btnID) //No btnMain is displayed in the sideBar
    ) {
        createBtn({
            btn: btnMainMenu,
            btnsContainer: sideBarBtnsContainer,
            btnClass: btnMainMenu.cssClass,
        });
    }
    if (btn.docFragment)
        containerDiv.appendChild(btn.docFragment);
    if (btn.btnID === btnMainMenu.btnID)
        addSettingsButton();
}
function modifyAllSelectedText() {
    let paragraph = document.getSelection().focusNode.parentElement;
    while (paragraph.tagName !== 'P' && paragraph.parentElement)
        paragraph = paragraph.parentElement; //We go up until we reach the parent html paragraph element
    if (!paragraph)
        return alert('Could not select the paragraph');
    let selected = getSelectedText();
    if (!selected)
        return alert("You didn't select any text");
    let text = selected.toString();
    let modified = prompt("Provide the text to replace the selected text", text);
    if (!modified || modified === text)
        return alert("Either you dindn't make any change or you provided an invalide string");
    let htmlRow = getHtmlRow(paragraph);
    if (!htmlRow || !htmlRow.dataset.arrayName)
        return alert("Couldn't retrieve the arrayName");
    let arrayName = htmlRow.dataset.arrayName;
    let index = Array.from(htmlRow.children).indexOf(paragraph) + 1; //! Caution: we must add 1 because index 0 is the title
    let array = eval(arrayName);
    if (!array)
        return alert("Couldn't retrive the array");
    saveModifiedArray({ exportToFile: false, exportToStorage: true }); //We update the array by including what has been edited and is still displayed but not saved yet
    array.forEach((table) => table.forEach((row) => {
        if (!row || !row[index] || !row[index].includes(text))
            return;
        row[index] = row[index].replaceAll(text, modified);
    }));
    (function reloadCurrentlyEditedTables() {
        //We will reload the currently displayed table(s)
        let titles = new Set(Array.from(containerDiv.children)
            .filter((htmlRow) => htmlRow.title)
            .map((htmlRow) => splitTitle(htmlRow.title)[0])); //We retrieve the titles of the all the displayed tables
        containerDiv.dataset.arrayName = ''; //We do this in order to avoid that startEditingMode() triggers the alert for the user to confirm that he wants to reload another table from the sama array
        startEditingMode({
            tableTitle: Array.from(titles).join(', '),
            arrayName: arrayName,
            languages: getLanguages(arrayName),
            clear: true
        });
    })();
}
function getSelectedText() {
    return window.getSelection();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE1vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL2VkaXRNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUM1Qjs7Ozs7Ozs7R0FRRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsSUFXekI7SUFDQyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSztRQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQzVDLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUU5QyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDZix3TUFBd007UUFFeE0sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFMUQsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDckQsT0FBTyxDQUFDLHVDQUF1QzthQUM1QyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUFFLFdBQVcsRUFBRSxDQUFDO2FBQ3ZFLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzFELE9BQU8sV0FBVyxFQUFFLENBQUM7UUFDdkIsMEdBQTBHO2FBQ3JHLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzFELE9BQU8sZUFBZSxFQUFFLENBQUMsQ0FBQyxpREFBaUQ7YUFDeEU7WUFDSCxJQUFJLENBQUMsU0FBUyxL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