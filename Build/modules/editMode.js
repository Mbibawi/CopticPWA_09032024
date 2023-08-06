let sequence = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param tblsArray
 */
async function editTablesArray(entry, clear = true) {
    let tablesArray;
    containerDiv.dataset.specificTables = 'false';
    if (entry === 'NewTable')
        tablesArray = [[['NewTable&C=Title', 'New Table Added', 'New Table Added']]];
    if (!tablesArray && confirm('Do you want to edit a single or specific table(s) in the array? (if more than one table, provide the titles separated by ", " '))
        containerDiv.dataset.specificTables = 'true';
    if (!tablesArray)
        tablesArray = eval(entry);
    if (!tablesArray)
        return;
    if (containerDiv.dataset.specificTables = 'true') {
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
    if (!console.save)
        addConsoleSaveMethod(console); //We are adding a save method to the console object
    let el;
    if (clear)
        containerDiv.innerHTML = ""; //we empty the containerDiv
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
    Array.from(containerDiv.querySelectorAll("div.TitleRow, div.SubTitle"))
        .forEach(div => Array.from(div.getElementsByTagName('P'))
        .forEach((p) => p.innerText = p.innerText.replaceAll(String.fromCharCode(plusCharCode + 1), '')));
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
        + String(today.getMonth() + 1) //we add 1 because the months are counted from 0
        + String(today.getFullYear())
        + 'at'
        + String(today.getHours() + 1)
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
        htmlTable = Array.from(containerDiv.querySelectorAll(getDataRootSelector(baseTitle(tableTitle), true))); //notice that we pass the isLike = true in order to get a selector like "data-root*=" instead of 'data-root='
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
    let text = processTablesArray(editedArray);
    localStorage.editedText = text;
    console.log(localStorage.editedText);
    return text;
}
;
/**
 * Converts the provided array of all the html divs of a table into a string[][] representing the table rows
 * @param {HTMLDivElement[]} htmlRows - an array of html divs each reprsenting a row in a table
 * @returns {string[][]} an array representing the table
 */
function processTablesArray(tablesArray) {
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
        if (!child || !child.lang || child.tagName !== 'P')
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
    sequence.push(baseTitle(htmlRow.dataset.root));
    let result = prompt(sequence.join(", \n"), sequence.join(", \n"));
    sequence = result.split(", \n");
    if (document.getElementById("showSequence")) {
        let tableRows = Array.from(containerDiv.querySelectorAll(getDataRootSelector(baseTitle(htmlRow.dataset.root), true)));
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
    setCSSGridTemplate(Array.from(containerDiv.querySelectorAll("div.Row")));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE1vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL2VkaXRNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUM1Qjs7O0dBR0c7QUFDSCxLQUFLLFVBQVUsZUFBZSxDQUFDLEtBQWEsRUFBRSxRQUFnQixJQUFJO0lBQ2hFLElBQUksV0FBeUIsQ0FBQztJQUM5QixZQUFZLENBQUMsT0FBTyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFDOUMsSUFBSSxLQUFLLEtBQUssVUFBVTtRQUFFLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RyxJQUFJLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxnSUFBZ0ksQ0FBQztRQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztJQUM1TSxJQUFJLENBQUMsV0FBVztRQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUMsSUFBSSxDQUFDLFdBQVc7UUFBRSxPQUFPO0lBR3pCLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEdBQUcsTUFBTSxFQUFFO1FBQ2hELElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1FBQzFFLElBQUksYUFBYSxHQUFnQixFQUFFLENBQUM7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25ELFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ2pCLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNYLGFBQWEsQ0FBQyxJQUFJLENBQ2hCLFdBQVcsQ0FBQyxNQUFNLENBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FDakMsQ0FBQyxDQUFDLENBQUMsQ0FDSCxDQUFDO1lBRUosSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxFQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakosQ0FBQyxDQUNKLENBQUM7UUFDRixXQUFXLEdBQUcsYUFBYSxDQUFDO1FBQzVCLG9FQUFvRTtRQUNwRSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDLGdFQUFnRSxDQUFDLENBQUM7UUFDM0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxhQUFhLENBQUMsQ0FBQTtLQUMvQztJQUFBLENBQUM7SUFDRixJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLFNBQVM7UUFBRSxTQUFTLEdBQUcsWUFBWSxDQUFDO0lBQ3pDLFlBQVksQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdDLFlBQVk7SUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7UUFBRSxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLG1EQUFtRDtJQUNyRyxJQUFJLEVBQWUsQ0FBQztJQUVyQixJQUFHLEtBQUs7UUFBRSxZQUFZLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUFDLDJCQUEyQjtJQUVqRSw0RkFBNEY7SUFDNUYsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMxQixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU87UUFDbkIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNsQixJQUFJLENBQUMsR0FBRztnQkFBRSxPQUFPO1lBQ2pCLEVBQUUsR0FBRyxxQ0FBcUMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDM0Qsc0RBQXNEO1lBQ3RELElBQUksRUFBRTtnQkFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDMUYsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILDRCQUE0QjtJQUM1QixrQkFBa0IsRUFBRSxDQUFDO0lBQ3JCLHlDQUF5QztJQUN6QyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekUsMENBQTBDO0lBRTFDLHNEQUFzRDtJQUN0RCxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQ3BFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUNiLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDLE9BQU8sQ0FBQyxDQUFDLENBQWMsRUFBRSxFQUFFLENBQzFCLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ2xGLENBQUMsQ0FBQztJQUVMLHdCQUF3QixDQUN0QixZQUFZLENBQUMsZ0JBQWdCLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGtCQUFrQixDQUFDLFVBQXNCO0lBQ2hELElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7SUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLGdCQUFnQixDQUFDO0lBQzdDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztJQUN2QyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFFakMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFdkUsSUFBSSxDQUFDLFVBQVU7UUFBRSxVQUFVLEdBQUc7WUFDNUIsY0FBYztZQUNkLGNBQWM7WUFDZCxxQkFBcUI7WUFDckIsaUJBQWlCO1lBQ2pCLHFCQUFxQjtZQUNyQixpQkFBaUI7WUFDakIsU0FBUztZQUNULFlBQVk7WUFDWixZQUFZO1lBQ1osYUFBYTtZQUNiLDRCQUE0QjtZQUM1QixtQkFBbUI7U0FDcEIsQ0FBQztJQUVGLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUUxQyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxTQUFTLENBQUMsT0FBbUI7SUFDcEMsSUFBSSxTQUFTLEdBQUUsbUJBQW1CLENBQy9CLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUNoRSxTQUFTLENBQ1IsQ0FBQztJQUNGLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUFBLENBQUM7QUFFRixTQUFTLFlBQVksQ0FBQyxPQUFtQjtJQUN2QyxJQUFJLFNBQVMsR0FBRSxtQkFBbUIsQ0FDL0IsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUF3QixDQUFDLEVBQ3BFLFlBQVksQ0FDWCxDQUFDO0lBQ0YsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBQUEsQ0FBQztBQUdBLFNBQVMscUJBQXFCLENBQUMsT0FBbUI7SUFDaEQsSUFBSSxTQUFTLEdBQUUsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFDRDs7O0dBR0c7QUFDSCxTQUFTLGlCQUFpQixDQUFDLE9BQW9CO0lBQzdDLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDdkIsSUFBSSxRQUFRLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTO1VBQ3pDLGNBQWM7VUFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1VBQ3ZCLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUEsZ0RBQWdEO1VBQzFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7VUFDM0IsSUFBSTtVQUNKLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUUsQ0FBQyxDQUFDO1VBQzVCLEdBQUc7VUFDRixNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1VBQzFCLE1BQU0sQ0FBQztJQUVYLFlBQVk7SUFDWixJQUFJLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDdkcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsT0FBbUI7SUFDekMsSUFBSSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsY0FBYyxDQUNySCxDQUFDO0lBQ0EsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxPQUFPO0lBQ2xDLElBQUksU0FBUyxHQUFHLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsYUFBYSxDQUMxRSxDQUFDO0lBQ0EsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUMsU0FBUyxjQUFjLENBQUMsT0FBbUI7SUFDekMsSUFBSSxTQUFTLEdBQUcsbUJBQW1CLENBQ2pDLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xGLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUVILFNBQVMsWUFBWSxDQUFDLE9BQW9CO0lBQ3RDLElBQUksU0FBUyxHQUFHLG1CQUFtQixDQUNqQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNoRixPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLE9BQW1CO0lBQ2hELElBQUksU0FBUyxHQUFHLG1CQUFtQixDQUNqQyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUN6RSxpQkFBaUIsQ0FDaEIsQ0FBQztJQUNGLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUNELFNBQVMsNEJBQTRCLENBQUMsT0FBb0I7SUFDeEQsSUFBSSxTQUFTLEdBQUcsbUJBQW1CLENBQ2pDLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQy9FLHFCQUFxQixDQUNwQixDQUFDO0lBQ0YsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsT0FBbUI7SUFDeEMsSUFBSSxTQUFTLEdBQUcsbUJBQW1CLENBQ25DLEdBQUUsRUFBRSxDQUFBLDZCQUE2QixFQUFFLEVBQ25DLGFBQWEsQ0FDZCxDQUFDO0lBQ0EsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxPQUFtQjtJQUM1QyxJQUFJLFNBQVMsR0FBRyxtQkFBbUIsQ0FDakMsR0FBRyxFQUFFLENBQUMsY0FBYyxFQUFFLEVBQ3RCLGlCQUFpQixDQUNoQixDQUFDO0lBQ0YsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixTQUFTLEdBQUcsbUJBQW1CLENBQy9CLEdBQUUsRUFBRSxDQUFBLDZCQUE2QixFQUFFLEVBQ25DLGFBQWEsQ0FDZCxDQUFDO0lBQ0EsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBQ0gsU0FBUywyQkFBMkIsQ0FBQyxPQUFtQjtJQUN0RCxJQUFJLFNBQVMsR0FBRyxtQkFBbUIsQ0FDakMsR0FBRyxFQUFFLENBQUMsd0JBQXdCLEVBQUUsRUFDaEMsMkJBQTJCLENBQzVCLENBQUM7SUFDQSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFFSDs7OztHQUlHO0FBQ0gsU0FBUyxTQUFTLENBQUMsU0FBc0I7SUFDdkMsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBZ0IsQ0FBQztJQUNuRCxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFDckIsSUFBSSxPQUFPLENBQUMsMkNBQTJDLENBQUMsS0FBSyxLQUFLO1FBQUUsT0FBTyxDQUFBLDRDQUE0QztJQUN2SCxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyx3QkFBd0I7SUFDL0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsYUFBMEIsRUFBRSxRQUFzQixDQUFDO0lBRXJHLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFBRSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUFFLE9BQU07S0FBQztJQUFBLENBQUM7SUFDL0UsYUFBYSxHQUFHLGlDQUFpQyxFQUFFLENBQUM7SUFFcEQsYUFBYTtRQUNYLHFDQUFxQztTQUNwQyxPQUFPLENBQ04sQ0FBQyxLQUFpQixFQUFFLEVBQUU7UUFDcEIsNkVBQTZFO1FBQzdFLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RELHFGQUFxRjtRQUNyRixJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFGLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNERBQTRELEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFZO0lBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNGLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGlDQUFpQztJQUN4QyxJQUFJLGFBQWEsR0FBZ0IsRUFBSSxFQUNqQyxLQUFpQixFQUNqQixNQUFtQixDQUFDO0lBRTFCLE1BQU0sR0FBRyxJQUFJLEdBQUc7SUFDZCxrR0FBa0c7SUFDbEcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbEQsMEdBQTBHO1NBQ3pHLEdBQUcsQ0FBQyxDQUFDLEdBQWdCLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUd6RCwyQ0FBMkM7SUFDN0MsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDaEIsb0NBQW9DO1NBQ25DLE9BQU8sQ0FDTixDQUFDLEtBQWEsRUFBRSxFQUFFO1FBQ2hCLDJCQUEyQjtRQUMzQixLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ1gsbUdBQW1HO1FBQ25HLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsaUNBQWlDO2FBQ2hDLE9BQU8sQ0FDTixDQUFDLEdBQW1CLEVBQUUsRUFBRTtZQUN4QixxR0FBcUc7WUFDckcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvQixnREFBZ0Q7WUFDaEQsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztnQkFDdkIsdUdBQXVHO2lCQUN0RyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7UUFDNUQsQ0FBQyxDQUNGLENBQUM7UUFDRixhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxhQUFhLENBQUE7QUFDeEIsQ0FBQztBQUVIOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFNBQXNCO0lBQzVDLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFDckIsSUFBSSxTQUFTLEdBQVcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdELElBQUksU0FBUyxLQUFLLFNBQVM7UUFBRSxTQUFTLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNHLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztJQUN2QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxHQUFDLFNBQVMsQ0FBQztJQUM1RSxJQUFJLFNBQVMsS0FBSyxPQUFPO1FBQUUsU0FBUyxHQUFHLFVBQVUsQ0FBQztJQUNsRCxJQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUU7QUFDOUUsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLE9BQW9CLEVBQUUsU0FBaUI7SUFDMUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUNELFNBQVMsV0FBVyxDQUFDLFNBQXNCLEVBQUUsUUFBaUIsRUFBRSxRQUFnQjtJQUM5RSxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPO0lBQ3JCLElBQUcsQ0FBQyxRQUFRO1FBQUUsUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzlDLElBQUksQ0FBQyxRQUFRO1FBQUUsUUFBUSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNoRSxJQUFJLENBQUMsUUFBUTtRQUFFLE9BQU8sS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDbEUsSUFBSSxRQUFRLEtBQUssUUFBUTtRQUFFLE9BQU87SUFDaEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO0lBQ2hDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUN6QixPQUFPLENBQ04sQ0FBQyxLQUFrQixFQUFFLEVBQUU7UUFDckIsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtZQUMvQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekMsS0FBSyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7U0FDeEI7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNULElBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckQsMkZBQTJGO0lBQzNGLE9BQU8sR0FBRyxPQUFPLENBQUMsa0JBQW9DLENBQUM7SUFDdkQsT0FBTyxPQUFPO1dBQ1QsT0FBTyxDQUFDLE9BQU8sS0FBSyxLQUFLO1dBQ3pCLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUM1RCxJQUFJLFVBQVUsR0FBVyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLFVBQVU7WUFBRSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2pDLElBQUksVUFBVSxLQUFLLEVBQUU7WUFBRSxVQUFVLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQztRQUN2RCxXQUFXLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDakU7QUFDSCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLG1CQUFtQixDQUMxQixHQUFhLEVBQ2IsS0FBYTtJQUViLElBQUksT0FBTyxHQUFxQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ2hFLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQzFCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMvQyxPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDO0FBRUQsU0FBUyxpQkFBaUI7SUFDdEIsSUFBSyxXQUFXLEdBQWlCLEVBQUUsRUFDbkMsS0FBYSxFQUNiLE1BQU0sR0FBZ0IsSUFBSSxHQUFHLEVBQUUsRUFDL0IsU0FBMEIsRUFDMUIsUUFBUSxHQUFxQixLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsdURBQXVEO0lBRXpJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ25CLE9BQU8sQ0FBQyxDQUFDLE9BQXVCLEVBQUUsRUFBRTtRQUNqQyxxQ0FBcUM7UUFDbkMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsaUNBQWlDO1FBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUNwQixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2pCLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FDSixDQUFDO0lBRUYsU0FBUyxpQkFBaUIsQ0FBQyxVQUFrQjtRQUMzQyxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUUsbUJBQW1CLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLDZHQUE2RztRQUV0TixJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxLQUFLLE1BQU0sRUFBRTtZQUNsRCxvRUFBb0U7WUFDcEUsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBaUIsQ0FBQztZQUVuRSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNoQixLQUFLLENBQUMsaUdBQWlHLENBQUMsQ0FBQTtnQkFDeEcsT0FBTTthQUNQO1lBQUEsQ0FBQztZQUVGLElBQUksV0FBVyxHQUFlLG9DQUFvQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTlFLElBQUksUUFBUSxHQUFlLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFekYsSUFBSSxRQUFRO2dCQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQzNFLElBQUksT0FBTyxDQUFDLDBHQUEwRyxDQUFDO2dCQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFNUosT0FBTTtTQUNQO1FBQUEsQ0FBQztRQUVGLFdBQVcsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLDhEQUE4RDtJQUVuSSxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDeEMsSUFBSSxJQUFJLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDM0MsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckMsT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDO0FBQUEsQ0FBQztBQUNGOzs7O0dBSUc7QUFHSCxTQUFTLGtCQUFrQixDQUFDLFdBQXlCO0lBQ25ELHNCQUFzQjtJQUN0QixJQUFJLElBQUksR0FBVyxHQUFHLENBQUM7SUFDdkIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQWlCLEVBQUUsRUFBRSxHQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQSxDQUFBLENBQUMsQ0FBQyxDQUFDO0lBRWxFLFNBQVMsWUFBWSxDQUFDLEtBQWlCO1FBQ3JDLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7WUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUN6RCxPQUFPLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1NBQ3JDO1FBQUEsQ0FBQztRQUNKLGtCQUFrQjtRQUNsQixJQUFJLElBQUksS0FBSyxDQUFDO1FBQ2QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQWEsRUFBRSxFQUFFO1lBQzlCLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUNILGFBQWE7UUFDYixJQUFJLElBQUksT0FBTyxDQUFDO0lBQ2xCLENBQUM7SUFBQSxDQUFDO0lBQ0YsU0FBUyxlQUFlLENBQUMsR0FBYTtRQUNwQyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO1lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDckQsT0FBTyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtTQUNyQztRQUFBLENBQUM7UUFFRixnQkFBZ0I7UUFDaEIsSUFBSSxJQUFJLEtBQUssQ0FBQztRQUNkLG1CQUFtQjtRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFjLEVBQUMsRUFBRSxDQUFBLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ2pFLFdBQVc7UUFDWCxJQUFJLElBQUksT0FBTyxDQUFDO0lBQ2xCLENBQUM7SUFBQSxDQUFDO0lBRUYsU0FBUyxvQkFBb0IsQ0FBQyxPQUFlLEVBQUUsR0FBYTtRQUMxRCxrQ0FBa0M7UUFDbEMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsdUJBQXVCO1FBQ2pFLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUxQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQzdCLE9BQU8sR0FBRyxPQUFPO2lCQUNkLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUM7aUJBQ3ZELFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQVksR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyw4REFBOEQ7UUFFL0gsSUFBSSxJQUFJLEdBQUcsR0FBQyxPQUFPLEdBQUMsT0FBTyxDQUFDLENBQUMscUZBQXFGO0lBQ3BILENBQUM7SUFBQSxDQUFDO0lBQ0YsSUFBSSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixJQUFJLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNwRCxJQUFJLElBQUksSUFBSSxDQUFDO0lBQ2IsT0FBUSxJQUFJLENBQUE7QUFDZCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsSUFBWTtJQUNuQyxJQUFJLEdBQUcsSUFBSTtTQUNSLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxzQkFBc0IsQ0FBQztTQUM1RCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSwyQkFBMkIsQ0FBQztTQUN0RSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsd0JBQXdCLENBQUM7U0FDaEUsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLHVCQUF1QixDQUFDO1NBQzlELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQztTQUN4RCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsdUJBQXVCLENBQUM7U0FDOUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDO1NBQ2xFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsQ0FBQztTQUNsRSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUM7U0FDNUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDO1NBQ2xFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQztTQUMxRCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUM7U0FDNUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLHNCQUFzQixDQUFDO1NBQzVELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSx3QkFBd0IsQ0FBQztTQUNoRSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUM7U0FDMUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDO1NBQ2hFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsQ0FBQztRQUNuRSxVQUFVO1NBQ1QsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLHFCQUFxQixDQUFDO1NBQzFELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQztTQUNsRCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUM7U0FDMUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDO1NBQ2xELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsQ0FBQztTQUNsRSxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsd0JBQXdCLENBQUM7U0FDaEUsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLHFCQUFxQixDQUFDO1NBQzFELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQztTQUMxRCxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUM7U0FDNUQsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLHdCQUF3QixDQUFDO1FBQ2pFLFdBQVc7U0FDVixVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUM7U0FDcEMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDO1NBQ3BDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQztTQUN0QyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUN4QyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxTQUFTLENBQUMsU0FBc0IsRUFBRSxRQUFpQjtJQUMxRCxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPO0lBRXJCLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQ3hDLENBQXVCLEVBQ3ZCLEtBQTJCLENBQUM7SUFDOUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO0lBQ3JDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQzdDLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztJQUNyRSxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7SUFDakUsSUFBSSxDQUFDLFFBQVE7UUFBRSxRQUFRLEdBQUcsTUFBTSxDQUM5QixrQ0FBa0MsRUFDbEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ3JCLENBQUM7SUFDRixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7SUFFL0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9DLGtDQUFrQztJQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDaEQsS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUF5QixDQUFDO1FBQ3BELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUksR0FBRztZQUFFLFNBQVM7UUFDNUQsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7UUFDMUIsQ0FBQyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3BCLGdEQUFnRDtRQUNoRCxDQUFDLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztLQUM1QjtJQUNELE9BQU8sT0FBTyxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQWdCLENBQUM7QUFDMUUsQ0FBQztBQUNELFNBQVMsWUFBWSxDQUFDLFNBQXNCO0lBQzFDLElBQUksU0FBUyxDQUFDLE9BQU8sS0FBSyxHQUFHO1FBQUUsT0FBTyxLQUFLLENBQUMsNERBQTRELENBQUMsQ0FBQztJQUMxRyxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFnQixDQUFDO0lBQ25ELElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUNyQixJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsNEpBQTRKLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDek0sSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUM7UUFBRSxPQUFPLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0lBQ25HLElBQUksU0FBUyxHQUFlLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEQsU0FBUyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7SUFDbkMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7SUFDM0IsU0FBUyxDQUFDLFNBQVMsR0FBRyxnQ0FBZ0MsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO0lBQ3hFLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBR3hILElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdFLElBQUksS0FBSyxHQUFVLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkMsS0FBSyxHQUFHLE1BQU0sQ0FBQyw4Q0FBOEMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVwRSxLQUFLO1NBQ0YsS0FBSyxDQUFDLEdBQUcsQ0FBQztTQUNWLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1FBQ2hCLElBQUksS0FBSyxHQUNQLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzthQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFnQixDQUFDO1FBQ3ZFLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyx1R0FBdUc7SUFDckksQ0FBQyxDQUFDLENBQUM7SUFDTCxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUV0RCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsU0FBUyxxQ0FBcUMsQ0FDNUMsTUFBZ0IsRUFDaEIsY0FBd0IsRUFDeEIsV0FFeUQsWUFBWTtJQUVyRSxJQUFJLEdBQW1CLEVBQUUsQ0FBdUIsRUFBRSxJQUFZLEVBQUUsSUFBWSxDQUFDO0lBRTdFLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0NBQWdDO0lBQzFELElBQUksUUFBUSxHQUFXLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7SUFDNUIsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQyxJQUFJLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDL0MsMkhBQTJIO1FBQzNILEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQy9CO1NBQU0sSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNyRCxHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUNqQixZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnRUFBZ0U7S0FDckU7SUFDRCxvSUFBb0k7SUFDcEksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdEMsOENBQThDO1FBQzlDLElBQ0UsVUFBVTtZQUNWLENBQUMsVUFBVSxJQUFJLFNBQVMsSUFBSSxVQUFVLElBQUksYUFBYSxDQUFDLEVBQ3hEO1lBQ0EsNEJBQTRCO1lBQzVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsRTthQUFNO1lBQ0wsSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrSEFBa0g7U0FDakosQ0FBQyxpU0FBaVM7UUFDblMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxpTkFBaU47UUFDbFAsSUFBSSxVQUFVLEtBQUssT0FBTyxJQUFJLFVBQVUsS0FBSyxVQUFVLEVBQUU7WUFDdkQsb0hBQW9IO1lBQ3BILEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlCLElBQUksVUFBVSxLQUFLLFVBQVU7Z0JBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzdFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsZ0VBQWdFO1NBQ25GO2FBQU0sSUFBSSxVQUFVLEVBQUU7WUFDckIsMERBQTBEO1lBQ3hELEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2pDO2FBQU07WUFDTCw4R0FBOEc7WUFDNUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDakM7UUFDRCxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQywrSEFBK0g7UUFDMUosQ0FBQyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7UUFDbkIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLElBQUk7WUFDTixDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtRQUNyQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLDhOQUE4TjtRQUM3TyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUNuQixHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsME1BQTBNO0tBQy9OO0lBQ0QsWUFBWTtJQUNaLFFBQVEsQ0FBQyxFQUFFO1FBQ1QsQ0FBQyxDQUFDLFlBQVk7WUFDWixRQUFRLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxZQUFZO1lBQ1osUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QixPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLGtCQUFrQjtJQUN6QixJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQ2pELElBQUksR0FBVyxHQUFHLENBQUM7SUFDckIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ3RCLFlBQVk7UUFDWixJQUFJLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUMsTUFBTSxDQUFDO0lBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxJQUFJLEdBQUcsQ0FBQztJQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsU0FBc0I7SUFDaEQsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUNyQixRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0MsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsRUFBRTtRQUMzQyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUN4QixZQUFZLENBQUMsZ0JBQWdCLENBQzNCLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUMzRCxDQUNGLENBQUM7UUFDRixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBbUIsRUFBRSxFQUFFO1lBQ3hDLHFDQUFxQyxDQUNuQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUM3RCxZQUFZLEVBQ1osUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FDeEMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0gsa0JBQWtCLENBQ2hCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUNoRixDQUFDO0tBRUg7QUFDSCxDQUFDO0FBRUQsU0FBUyxjQUFjO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDMUQsSUFBSSxLQUFLO1FBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQ25CLGdCQUEwQixRQUFRLEVBQ2xDLFlBQTRCLFlBQVk7SUFFeEMsSUFBSSxTQUFTLENBQUM7SUFDZCxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNDLFFBQVE7U0FDTCxjQUFjLENBQUMsU0FBUyxDQUFDO1NBQ3pCLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNoRCxDQUFDLFNBQVMsY0FBYztRQUN0QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDL0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUMzQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDOUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNwQyxDQUFDLENBQUMsY0FBYyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNMLE1BQU0sQ0FBQyxFQUFFLEdBQUcsY0FBYyxDQUFDO0lBQzNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLGtCQUFrQixDQUFDO0lBQ2xELE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7SUFDNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztJQUMvQixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7SUFDMUIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQzlCLFNBQVMsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3hCLHFDQUFxQyxDQUNuQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUMxRSxZQUFZLEVBQ1osTUFBTSxDQUNQLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUNILGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRSxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsb0JBQW9CLENBQUMsT0FBTztJQUNuQyxJQUFJLE9BQU8sQ0FBQyxJQUFJO1FBQUUsT0FBTztJQUN6QixPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsSUFBSSxFQUFFLFFBQVE7UUFDckMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUN2QyxPQUFPO1NBQ1I7UUFDRCxJQUFJLENBQUMsUUFBUTtZQUFFLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQztRQUVsRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzNDO1FBQ0QsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDNUIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ25DO1FBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUNoRCxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsRUFDdkMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbEMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDdEIsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDLGNBQWMsQ0FDZCxPQUFPLEVBQ1AsSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sQ0FBQyxFQUNELENBQUMsRUFDRCxDQUFDLEVBQ0QsQ0FBQyxFQUNELENBQUMsRUFDRCxLQUFLLEVBQ0wsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsQ0FBQyxFQUNELElBQUksQ0FDTCxDQUFDO1FBQ0YsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyw2QkFBNkI7SUFDcEMseUhBQXlIO0lBQ3pILElBQUksU0FBUyxHQUFHLEdBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxxRUFBcUUsQ0FBQyxDQUFDO0lBQ2xHLElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO0lBQ2hFLElBQUcsQ0FBQyxTQUFTO1FBQUUsT0FBTyxTQUFTLEVBQUUsQ0FBQyxDQUFBLDBDQUEwQztJQUM1RSxPQUFPLFNBQVMsQ0FBQyxPQUFPLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxhQUFhO1FBQUUsU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7SUFFakcsSUFBSSxTQUFTLENBQUMsT0FBTyxLQUFLLEdBQUc7UUFBRSxPQUFPLFNBQVMsRUFBRSxDQUFDO0lBQ2xELElBQUksS0FBSyxHQUFVLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUN2QyxJQUFJLEdBQVUsU0FBUyxDQUFDLElBQUksRUFDNUIsS0FBSyxHQUFrQixLQUFLLENBQUMsSUFBSSxDQUMvQixZQUFZLENBQUMsZ0JBQWdCLENBQzNCLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBNEIsQ0FBQyxFQUFDLHlFQUF5RTtJQUN0SixRQUFRLEdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDNUQsK0NBQStDO0lBRS9DLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFFL0IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdEIsbUlBQW1JO1lBQ25JLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEdBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSwwRkFBMEY7U0FDcE47UUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDO2FBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsWUFBWTthQUNULFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDekI7QUFDSCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsVUFBVSxDQUFDLFNBQXNCO0lBQ3hDLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBUSxLQUFLLENBQUMsMkZBQTJGLENBQUMsQ0FBQztJQUMzSCxPQUFPLFNBQVMsQ0FBQyxPQUFPLEtBQUssS0FBSztXQUM3QixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztXQUNwQyxTQUFTLENBQUMsYUFBYSxFQUFDO1FBQzNCLFNBQVMsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFBO0tBQUM7SUFBQSxDQUFDO0lBQ3ZDLElBQUksU0FBUyxDQUFDLE9BQU8sS0FBSyxLQUFLO1dBQzFCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLE9BQU8sU0FBUyxDQUFDOztRQUNkLE9BQU8sU0FBMkIsQ0FBQztBQUMxQyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLGFBQWEsQ0FBQyxTQUFpQixFQUFFLEtBQWE7SUFDckQsSUFBSSxTQUFTLEdBQWEsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUMzQyxFQUFlLEVBQ2YsV0FBVyxHQUFnQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFakQsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUFFLEtBQUssQ0FBQyxvQ0FBb0MsR0FBRyxTQUFTLENBQUMsQ0FBQztRQUFFLE9BQU07S0FBQztJQUVqSCw0SUFBNEk7SUFDNUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBRTNDLElBQUksTUFBTSxHQUFpQixXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRXBGLElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFBRSxLQUFLLENBQUMsOEJBQThCLEdBQUcsU0FBUyxHQUFHLDBCQUEwQixHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQUMsT0FBTTtLQUFFO0lBR3RJLE1BQU0sQ0FBQyxPQUFPLENBQ1osQ0FBQyxLQUFpQixFQUFFLEVBQUUsQ0FDcEIsS0FBSyxDQUFDLE9BQU8sQ0FDWCxDQUFDLEdBQVksRUFBRSxFQUFFO1FBRWYsRUFBRSxHQUFHLHFDQUFxQyxDQUN4QyxHQUFHLEVBQ0gsWUFBWSxDQUNiLENBQUM7UUFFRixJQUFJLEVBQUU7WUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFrQixFQUFFLEVBQUUsR0FBRSxJQUFHLEtBQUssQ0FBQyxPQUFPLEtBQUssR0FBRztnQkFBRSxLQUFLLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQSxDQUFBLENBQUMsQ0FBQyxDQUFDO0lBQzlILENBQUMsQ0FDQSxDQUFDLENBQUM7SUFDSCw0QkFBNEI7SUFDOUIsa0JBQWtCLENBQUM7UUFDakIsU0FBUztRQUNULFlBQVk7UUFDWixhQUFhO1FBQ2IsY0FBYztRQUNkLGNBQWM7UUFDZCwyQkFBMkI7S0FDNUIsQ0FBQyxDQUFDO0lBQ0gseUNBQXlDO0lBQ3ZDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RSwwQ0FBMEM7SUFDMUMsb0JBQW9CLEVBQUUsQ0FBQztJQUN2Qix3QkFBd0IsQ0FDdEIsWUFBWSxDQUFDLGdCQUFnQixDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsWUFBWSxDQUFDLFNBQVM7SUFDN0IsSUFBSSxTQUFTLEdBQVksZ0JBQWdCLENBQUM7SUFDMUMsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDO1FBQUUsU0FBUyxHQUFHLGlCQUFpQixDQUFDO0lBQzNFLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUFFLFNBQVMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRixJQUFJLFNBQVMsS0FBSyxVQUFVO1FBQUUsU0FBUyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sU0FBUyxDQUFBO0FBQ2xCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHdCQUF3QixDQUFDLFdBQXVCO0lBQ3ZELE1BQU0sTUFBTSxHQUFXLDREQUE0RCxDQUFDO0lBQ3BGLElBQUksUUFBUSxHQUFXLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQzlFLElBQUksSUFBSSxHQUFXLFdBQVcsQ0FBQyxTQUFTLENBQUM7SUFDekMsSUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztJQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM3QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7SUFDOUUsT0FBTyxDQUFDLGdCQUFnQixDQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsMENBQTBDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0csT0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7SUFDOUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDdEIsSUFBRyxPQUFPLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBQztZQUN4QixJQUFJLFFBQVEsR0FBZ0IsSUFBSSxTQUFTLEVBQUU7aUJBQ3hDLGVBQWUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztpQkFDOUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckQsV0FBVyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO1lBQzNDLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQztTQUM3QjthQUFNO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEQsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDO1NBQzNCO0lBQ0QsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsZ0JBQWdCO0lBQ3ZCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQzFELElBQUksSUFBSSxHQUFpQixLQUFLLENBQUMsSUFBSSxDQUNqQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUE0QixDQUFDO1NBQ2hFLE1BQU0sQ0FBQyxDQUFDLEdBQWdCLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTyxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUN2RixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5QyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDL0IsQ0FBQyJ9