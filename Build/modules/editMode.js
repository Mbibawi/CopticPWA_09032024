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
        else
            args.tablesArray = editSpecificTable() || [];
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
        if (!args.tableTitle && //args.tableTitle was not already provided as argument
            confirm("Do you want to edit a single or specific table(s) in the array?"))
            args.tableTitle = prompt('Provide the name of the table you want to edit  (if more than one table, provide the titles separated by ", " ');
        if (!args.tableTitle && !args.arrayName)
            return; //If no tableTitle is provided, and no arrayName, we will return
        if (!args.tableTitle &&
            confirm("No tableTitle is provided, do you want to edit the entire tables array?"))
            return eval(arrayName); //If no tableTitle if provided, we will return the entire array
        let titles = args.tableTitle.split(", "); //if tableTitle is a comma separated string, it means there are multiple table titles provided
        if (!titles || titles.length < 1)
            return console.log("The provided tableTitle argument is not valid");
        containerDiv.dataset.specificTables = "true";
        return titles.map((title) => findTable(title, args.arrayName ? eval(args.arrayName) : undefined, args.operator || { includes: true }) || undefined);
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
            ? (arrayName = "PrayersArray")
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
    createEditingButton(() => addNewRow(document.getSelection().focusNode.parentElement, true), "Add PlaceHolder", btnsDiv);
    createEditingButton(() => addNewColumn(document.getSelection().focusNode.parentElement), "Add Column", btnsDiv);
    createEditingButton(() => deleteRow(document.getSelection().focusNode.parentElement), "Delete Row", btnsDiv);
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
            tablesArray = PrayersArray; //If the array is one of the arrays in PrayersArrays, the Array that need to be saved is Prayers Array not the sub array itself
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
            .replaceAll("\n", "\\n");
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
function convertCopticFontFromAPI(htmlElement) {
    const apiURL = "https://www.copticchurch.net/coptic_language/fonts/convert";
    let fontFrom = prompt("Provide the font", "Coptic1/CS Avva Shenouda");
    while (htmlElement.tagName !== "P" && htmlElement.parentElement)
        htmlElement = htmlElement.parentElement;
    let text = htmlElement.textContent;
    let request = new XMLHttpRequest();
    request.open("POST", apiURL);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("accept", "text");
    request.send("from=" +
        encodeURI(fontFrom) +
        "&encoding=unicode&action=translate&data=" +
        encodeURI(text));
    request.responseType = "text";
    request.onload = () => {
        if (request.status === 200) {
            let textArea = new DOMParser()
                .parseFromString(request.response, "text/html")
                .getElementsByTagName("textarea")[0];
            console.log("converted text = ", textArea.innerText);
            htmlElement.innerText = textArea.innerText;
            return textArea.innerText;
        }
        else {
            console.log("error status text = ", request.statusText);
            return request.statusText;
        }
    };
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
    for (let arrayName in ReadingsArrays) {
        ReadingsArrays[arrayName]
            .filter((table) => table[0][0].includes(date))
            .forEach((table) => {
            startEditingMode({
                tableTitle: table[0][0],
                clear: false,
            });
        });
    }
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
            if (btn.btnID != btnGoBack.btnID)
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
        btn.btnID !== btnGoBack.btnID &&
        !sideBarBtnsContainer.querySelector("#" + btnGoBack.btnID)) {
        //i.e., if the button passed to showChildButtonsOrPrayers() has a parentBtn property and it is not itself a btnGoback (which we check by its btnID property), we wil create a goBack button and append it to the sideBar
        //the goBack Button will only show the children of btn in the sideBar: it will not call showChildButonsOrPrayers() passing btn to it as a parameter. Instead, it will call a function that will show its children in the SideBar
        createGoBackBtn(btn.parentBtn, sideBarBtnsContainer, btn.cssClass);
        lastClickedButton = btn;
    }
    if (btn.btnID !== btnMain.btnID && //The button itself is not btnMain
        btn.btnID !== btnGoBack.btnID && //The button itself is not btnGoBack
        !sideBarBtnsContainer.querySelector("#" + "settings") &&
        !sideBarBtnsContainer.querySelector("#" + btnMain.btnID) //No btnMain is displayed in the sideBar
    ) {
        createBtn({
            btn: btnMain,
            btnsContainer: sideBarBtnsContainer,
            btnClass: btnMain.cssClass,
        });
    }
    if (btn.docFragment)
        containerDiv.appendChild(btn.docFragment);
    if (btn.btnID === btnMain.btnID)
        addSettingsButton();
}
function modifyAllSelectedText() {
    let paragraph = document.getSelection().focusNode.parentElement;
    if (!paragraph)
        return;
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
    array.forEach((table) => table.forEach((row) => {
        if (!row || !row[index] || !row[index].includes(text))
            return;
        row[index] = row[index].replaceAll(text, modified);
    }));
    Array.from(containerDiv.children).forEach((child) => (child.innerHTML = child.innerHTML.replaceAll(text, modified)) //! We must modify the text of the edited paragraph, othewise, when we will go to next or previous table, the text of the table will replace the modified text
    );
    saveOrExportArray(array, arrayName, false, true);
}
function getSelectedText() {
    return window.getSelection();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE1vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL2VkaXRNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUM1Qjs7Ozs7Ozs7R0FRRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsSUFXekI7SUFDQyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSztRQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQzVDLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUU5QyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDZix3TUFBd007UUFFeE0sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFMUQsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDckQsT0FBTyxDQUFDLHVDQUF1QzthQUM1QyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUFFLFdBQVcsRUFBRSxDQUFDO2FBQ3ZFLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzFELE9BQU8sV0FBVyxFQUFFLENBQUM7UUFDdkIsMEdBQTBHO2FBQ3JHLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzFELE9BQU8sZUFBZSxFQUFFLENBQUMsQ0FBQyxpREFBaUQ7O1lBQ3hFLElBQUksQ0FBQyxXQUFXLEdBQUcs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