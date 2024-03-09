let sequence: string[] = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param {HTMLSelectElement}  select - the selection element from which we selet the options
 * @param {boolean} clear - whether or not we should remove all the children of the containerDiv content
 * @param {string} arrayNam - the name of the array where the text of the prayer will be searched for
  *@param {string} tableTitle - the title of the table that we want to retrieve in order to edit
  @param {string[][][]} tablesArray - the array where the table we want to edit will be looked for
 * @param { {includes: boolean}|{equal:boolean } |{startsWith:boolean}} operator - This is the crieteria by which we will be looking for the table by the provides args.tableTitle. Its default value is {includes:true}
 */
function startEditingMode(args: {
  select?: HTMLSelectElement;
  clear?: boolean;
  arrayName?: string;
  tableTitle?: string;
  tablesArray?: string[][][];
  languages?: string[];
  operator?:
  | { includes: boolean }
  | { equal: boolean }
  | { startsWith: boolean };
}) {
  if (args.clear !== false) args.clear = true;
  containerDiv.dataset.specificTables = "false";

  if (args.select) {
    //We deal with all the cases where a select element is passed as argument to the function. We exclude the case where arrayName is provided as an argument and the case where the tableTitle is provided.

    args.arrayName = args.select.selectedOptions[0].innerText;

    if (args.arrayName === args.select.options[0].innerText)
      return; //entries[0] === 'Choose From the List'
    else if (args.arrayName === args.select.options[1].innerText) addNewTable();
    else if (args.arrayName === args.select.options[2].innerText)
      return runFunction();
    //under development : the user will provide a function and the function will be called when he press enter
    else if (args.arrayName === args.select.options[3].innerText)
      return editDayReadings(); //Editing all the readings of ta give Coptic Date
    else {
      args.arrayName === 'PrayersArray' ? args.arrayName = 'PrayersArrayFR' :  args.arrayName = 'ReadingsArrays.' + args.arrayName + 'FR';
      args.tablesArray = editSpecificTable() || []
    };

    args.select.selectedIndex = 0;
  } else if (!args.tablesArray) args.tablesArray = editSpecificTable() || []; //If the arrayName and the tableTitle are provided, it means the user wants to edit a specific table

  if (
    containerDiv.dataset.arrayName &&
    args.arrayName === containerDiv.dataset.arrayName &&
    !confirm(
      "Warning !! you are about to reload the same array, you will loose all your modifications. Are you sure you want to reload the same array? "
    )
  )
    return; //If the selected option is the same as the already loaded array, and the user does not confirm reloading the array, we return

  containerDiv.dataset.arrayName = args.arrayName;
  containerDiv.style.gridTemplateColumns = "100%";

  if (!args.languages)
    args.languages = getLanguages(args.arrayName) || allLanguages.map(lang => lang[0]);

  function addNewTable() {
    args.arrayName = "PrayersArray"; //!CAUTION: if we do not set the arrayName to an existing array, it will yeild to an error when the array name will be evaluated by eval(arrayName), and the saveModifiedArray() will stop without exporting the text to file
    args.languages =
      prompt(
        "Provide the sequence of the languages columns",
        "COP, FR, CA, AR"
      ).split(", ") || getLanguages(args.arrayName);
    let title =
      prompt(
        "Provide the title for the table",
        "NewTable&D=$copticFeasts.AnyDay"
      ) || "NewTable&D=$copticFeasts.AnyDay";
    args.tablesArray = [[[title]]]; //We create a string[][][] with one string[][] (i.e. table) having only 1 string[] (i.e. row)

    args.tablesArray[0][0].push(...args.languages); //We push the languages to the first row of the first table in tablesArray. This will give us a first row like  ['NewTable&D=$copticFeasts.AnyDay&C=Title', 'COP', 'FR', 'CA', etc.]

    args.tablesArray[0].push([...args.tablesArray[0][0]]); //!Caution, we need to deconstruct the elements of the row. Otherwise it will not be a true copy. We add a second row to the table.

    args.tablesArray[0][0][0] += "&C=Title"; //We remove the '&C=Title' from the second row
  }

  function editSpecificTable(
    arrayName: string = args.arrayName 
  ): string[][][] | void {
   
    alert(arrayName);
    if (
      !args.tableTitle && //args.tableTitle was not already provided as argument
      confirm("Do you want to edit a single or specific table(s) in the array?")
    )
    
      args.tableTitle = prompt(
        'Provide the name of the table you want to edit  (if more than one table, provide the titles separated by ", " '
      );

    if (!args.tableTitle && !args.arrayName) return; //If no tableTitle is provided, and no arrayName, we will return

    if (
      !args.tableTitle &&
      confirm(
        "No tableTitle is provided, do you want to edit the entire tables array?"
      )
    )
      return eval(arrayName); //If no tableTitle is provided, we will return the entire array

    let titles = args.tableTitle.split(", "); //if tableTitle is a comma separated string, it means there are multiple table titles provided

    if (!titles || titles.length < 1)
      return console.log("The provided tableTitle argument is not valid");

    containerDiv.dataset.specificTables = "true";
    return titles.map(
      (title) =>
        findTable(
          title,
          arrayName ? eval(arrayName) : undefined,
          args.operator || { includes: true }
        ) || undefined
    );
  }

  function runFunction() {
    args.arrayName = prompt(
      "Provide the function and the parameters",
      args.arrayName
    );
    if (args.arrayName && args.arrayName.includes("Fun(")) eval(args.arrayName);
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
function showTables(args: {
  tablesArray: string[][][];
  languages?: string[];
  position?:
  | HTMLElement
  | DocumentFragment
  | { el: HTMLElement; beforeOrAfter: InsertPosition };
  container?: HTMLElement | DocumentFragment;
  clear?: boolean;
}) {
  if (!args.container) args.container = containerDiv;
  if (!args.position) args.position = containerDiv;
  if (args.clear !== false) args.clear = true;

  if (args.clear === true) containerDiv.innerHTML = "";
  //We create an html div element to display the text of each row of each table in tablesArray

  let titleBase: string, arrayName: string, prayersArray: string[][][];

  args.tablesArray.forEach((table) => {
    if (!table) return;
    titleBase = splitTitle(table[0][0])[0] || "NoTitle";
    prayersArray = getTablesArrayFromTitlePrefix(titleBase);
    PrayersArrays.includes(prayersArray)
      ? (arrayName = "PrayersArrayFR")
      : (arrayName = getArrayNameFromArray(prayersArray)); //If the array of tables that includes the table is one of the arrays in the 'PrayersArrays' list, we set the arrayName to 'PrayersArray', or otherwise, we retrieve its name from the PrayersArraysKeys by calling getArrayNameFromArray(prayersArray)
    if (
      !arrayName &&
      confirm(
        'We could not infer the name of the array from the title of the table, do you want to set it to "PrayersArray?"'
      )
    )
      arrayName = "PrayersArray";
    if (!arrayName) return console.log("The name of the array is missing");

    table.forEach((row) => {
      if (!row) return;
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

  let titles =
    (Array.from(
      args.container.querySelectorAll("div.Title, div.SubTitle")
    ) as HTMLDivElement[]) || [];
  //removing the minus sign at the begining of the title
  titles.forEach((div) =>
    Array.from(div.getElementsByTagName("P")).forEach(
      (p: HTMLElement) =>
      (p.innerText = p.innerText.replaceAll(
        String.fromCharCode(plusCharCode + 1),
        ""
      ))
    )
  );

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

  createEditingButton(
    () => modifyAllSelectedText(),
    "Modify Selected Text",
    btnsDiv
  );

  createEditingButton(
    () => changeTitle(document.getSelection().focusNode.parentElement),
    "Change Title",
    btnsDiv
  );

  createEditingButton(
    () => changeCssClass(document.getSelection().focusNode.parentElement),
    "Change Class",
    btnsDiv
  );

  createEditingButton(
    () => saveModifiedArray({ exportToFile: false, exportToStorage: true }),
    "Save",
    btnsDiv
  );

  createEditingButton(
    () => saveModifiedArray({ exportToFile: true, exportToStorage: true }),
    "Export to JS file",
    btnsDiv
  );

  createEditingButton(
    () => addTableToSequence(document.getSelection().focusNode.parentElement),
    "Add Table to Sequence",
    btnsDiv
  );

  createEditingButton(() => exportSequence(), "Export Sequence", btnsDiv);

  createEditingButton(
    () => addNewRow(document.getSelection().focusNode.parentElement),
    "Add Row",
    btnsDiv
  );
  createEditingButton(
    () => addNewCell(document.getSelection().focusNode.parentElement),
    "Add Cell",
    btnsDiv
  );
  createEditingButton(
    () => addNewRow(document.getSelection().focusNode.parentElement, true),
    "Add PlaceHolder",
    btnsDiv
  );
  createEditingButton(
    () => addNewColumn(document.getSelection().focusNode.parentElement),
    "Add Column",
    btnsDiv
  );
  createEditingButton(
    () => deleteRow(document.getSelection().focusNode.parentElement),
    "Delete Row",
    btnsDiv
  );
  createEditingButton(
    () => deleteCell(document.getSelection().focusNode.parentElement),
    "Delete Cell",
    btnsDiv
  );
  createEditingButton(
    () =>
      splitParagraphsToTheRowsBelow(
        document.getSelection().focusNode.parentElement
      ),
    "Split Below",
    btnsDiv
  );

  createEditingButton(
    () =>
      convertCopticFontFromAPI(document.getSelection().focusNode.parentElement),
    "Convert Coptic Fonts",
    btnsDiv
  );

  createEditingButton(() => goToTableByTitle(), "Go to Table", btnsDiv);
  createEditingButton(
    () =>
      editNextOrPreviousTable(
        document.getSelection().focusNode.parentElement,
        true
      ),
    "Next  Table",
    btnsDiv
  );
  createEditingButton(
    () =>
      editNextOrPreviousTable(
        document.getSelection().focusNode.parentElement,
        false
      ),
    "Previous Table",
    btnsDiv
  );
}

/**
 * Generates a file name for the JS file, including the name of the array, the date on which it was modified, and the time
 * @param {string} arrayName - the name of the array for which we want to generate a file name
 */
function getJSFileName(arrayName: string): string {
  let today = new Date();
  return (
    arrayName +
    "_[ModifiedOn" +
    String(today.getDate()) +
    String(today.getMonth() + 1) + //we add 1 because the months are counted from 0
    String(today.getFullYear()) +
    "at" +
    String(today.getHours() + 1) +
    "h" +
    String(today.getMinutes()) +
    "].js"
  );
}

/**
 * Deletes an html div (row) from the DOM
 * @param {HTMLElement} htmlRow - the html div (or any html element), we want to delete
 * @returns
 */
function deleteRow(htmlParag: HTMLElement) {
  let htmlRow = getHtmlRow(htmlParag) as HTMLElement;
  if (!htmlRow) return;
  if (confirm("Are you sure you want to delete this row?") === false) return; //We ask the user to confirm before deletion
  htmlRow.remove();
}
/**
 * Deletes a cell in a row
 * @param {HTMLElement} htmlParag - the paragraph that we want to delete 
 * @returns
 */
function deleteCell(htmlParag: HTMLElement) {
  if (htmlParag.tagName !== 'P') return alert('The selection is not a paragraph');
  let htmlRow = getHtmlRow(htmlParag) as HTMLElement;
  if (!htmlRow) return;

  if (!confirm("Are you sure you want to delete this paragraph?")) return; //We ask the user to confirm before deletion
  htmlParag.remove();
  htmlRow.style.gridTemplateColumns = setGridColumnsOrRowsNumber(htmlRow);//We adapt the number of columns of the parent div 
  htmlRow.style.gridTemplateAreas = setGridAreas(htmlRow);//We adapt the grid areas of the parent div
}

/**
 * Changes the 'actor' css class of a row
 * @param {HTMLElement} htmlRow - the div (row) for which we want to change the css class
 */
function changeCssClass(htmlParag: HTMLElement, newClass?: string) {
  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return alert("Did not find the parent Div");
  let currentClass = splitTitle(htmlRow.title)[1];
  if (!newClass) newClass = prompt("Provide The New Class", currentClass);
  if (!newClass || newClass === currentClass) return;

  htmlRow.title = splitTitle(htmlRow.title)[0] + "&C=" + newClass;

  if (currentClass) htmlRow.classList.replace(currentClass, newClass);
  else if (!htmlRow.classList.contains(newClass))
    htmlRow.classList.add(newClass);
}

function toggleClass(element: HTMLElement, className: string) {
  element.classList.toggle(className);
}

function changeTitle(
  htmlParag: HTMLElement,
  newTitle?: string,
  oldTitle?: string
) {
  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return;
  if (!oldTitle) oldTitle = htmlRow.title;
  if (!newTitle) newTitle = prompt("Provide The Title", oldTitle);
  if (!newTitle) return alert("You didn't provide a valid title");
  if (newTitle === oldTitle) return;

  htmlRow.dataset.root = splitTitle(newTitle)[0];
  htmlRow.title = newTitle;

  changeParagraphsDataRoot();

  function changeParagraphsDataRoot(
    row: HTMLDivElement = htmlRow as HTMLDivElement,
    title: string = newTitle
  ) {
    Array.from(row.querySelectorAll("p"))
      .filter((child) => child.dataset.root && child.title)
      .forEach((child) => {
        child.dataset.root = splitTitle(title)[0];
        child.title = title;
      });
  }

  let actorClass: string = splitTitle(newTitle)[1];

  if (actorClass && !htmlRow.classList.contains(actorClass))
    htmlRow.classList.add(actorClass);

  (function changeSiblingsDataRoot() {
    Array.from(containerDiv.children)
      .filter(
        (sibling: HTMLElement) =>
          sibling.dataset.root === splitTitle(oldTitle)[0]
      )
      .forEach((sibling: HTMLElement) => {
        sibling.dataset.root = splitTitle(newTitle)[0];
        let cssClass = splitTitle(sibling.title)[1];
        sibling.title = sibling.dataset.root;
        if (cssClass) sibling.title += "&C=" + cssClass;
        changeParagraphsDataRoot(sibling as HTMLDivElement, sibling.title);
      });
  })();
}

/**
 * Creates an html button, and adds
 * @param {Function} fun - the function that will be called when the button is clicked
 * @param {string} label - the label of the button
 * @returns {HTMLButtonElement} - the html button that was created
 */
function createEditingButton(
  fun: Function,
  label: string,
  btnsDiv: HTMLElement
): HTMLButtonElement {
  let btnHtml: HTMLButtonElement = document.createElement("button");
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
function exportToJSFile(arrayText: string, arrayName: string) {
  if (!arrayText || !arrayName) return;
  createJsFile(arrayText, getJSFileName(arrayName));
}

/**
 * Replaces the tables of the array with either the modified verisions (if we were editing an already existing table) or with the new table(s) if we added new tabless
 * @param {string} arrayName - the name of the array that we were editing containing the tables that we modified or added . Its default value is containerDiv.dataset.arrayName
 * @param {boolean} exportToFile - If true, the text of the modified array will be returned. Its default value is "true".
 * @param {boolean} exportToStorage - If true, the text of the modified array will be saved to localStorage.editedText. Its default value is "true".
 * @returns {[string, string] | void} the text of the modified array
 */
function saveModifiedArray(args: {
  exportToFile: boolean;
  exportToStorage: boolean;
  dataRoot?: string;
  htmlRows?: HTMLDivElement[];
}): [string, string] | void {
  let title: string,
    titles: Set<string> = new Set(),
    savedArrays: Set<string> = new Set(),
    tablesArray: string[][][];

  if (!args.htmlRows)
    args.htmlRows = Array.from(
      containerDiv.querySelectorAll(
        "div.Row, div.PlaceHolder"
      ) as NodeListOf<HTMLDivElement>
    ).filter((div) => div.dataset.root); //we retrieve all the divs with 'Row' class from the DOM

  if (args.dataRoot)
    args.htmlRows = args.htmlRows.filter(
      (htmlRow) => htmlRow.dataset.root === args.dataRoot
    );

  //Adding the tables' titles as unique values to the titles set
  args.htmlRows.forEach((htmlRow) => {
    if (!htmlRow) return; //This will happen if the row was row of a table referrenced by a placeholder, that was later on hidden when the click() event of the placeholder row was triggered (see below)

    if (htmlRow.dataset.isPlaceHolder) {
      saveModifiedArray({
        exportToFile: false,
        exportToStorage: true,
        dataRoot: htmlRow.dataset.isPlaceHolder,
      });
      args.htmlRows
        .filter(
          (div) =>
            !div.dataset.isPlaceHolder &&
            div.dataset.root &&
            div.dataset.root === htmlRow.dataset.isPlaceHolder
        )
        .forEach((div) => div.remove()); //We remove all the html elements that were created to show the rows of the table referenced by the 'PlaceHolder' element.
      return;
    }

    title = htmlRow.dataset.root; //this is the title without '&C='
    if (titles.has(title)) return;

    titles.add(title);

    if (!htmlRow.dataset.arrayName)
      return console.log(
        "We encountered a problem with one of the rows : ",
        htmlRow
      );

    if (!savedArrays.has(htmlRow.dataset.arrayName))
      savedArrays.add(htmlRow.dataset.arrayName);

    tablesArray = eval(htmlRow.dataset.arrayName);

    if (PrayersArrays.includes(tablesArray)) tablesArray = PrayersArrayFR; //If the array is one of the arrays in PrayersArrays, the Array that need to be saved is Prayers Array not the sub array itself

    if (!tablesArray)
      return console.log(
        "We've got a problem while executing saveOrExportArray(): title = ",
        title,
        " and arrayName = ",
        htmlRow.dataset.arrayName
      );

    modifyEditedArray(title, tablesArray);
  });

  //We finally save or export each array in the savedArrays
  savedArrays.forEach((arrayName) =>
    saveOrExportArray(
      eval(arrayName),
      arrayName,
      args.exportToFile,
      args.exportToStorage
    )
  );
}

/**
 * Creates string[][] tables  from the html children of containerDiv,  as edited and modified. It does so by selecting all the div elements having the same data-set-root, and converting the text in each such div element into a string[], and adds all the created string[] to a string[][].
 * It then loops the tablesArray (i.e., the original array of tables that we were editing), and looks if it contains a table (i.e. a string[][])  with the same title as the table created from the div elements. If so, it replaces this string[][] in the tablesArray table with the string[][] created from the div elements. Otherwise, it prompts the user wheter he wants to add the created string[][] as a new table at the end of the tablesArray.
 * @param {string} tableTitle - The title of a table in the tablesArray (which is a string[][][])
 * @param {string[][][]} tablesArray - the array that we were editing.
 */
function modifyEditedArray(tableTitle: string, tablesArray: string[][][]) {
  //We select all the div elements having same data-set-root attribute as the title of the table (tabeTitle)
  if (!tablesArray || !tableTitle) return;
  let htmlTable = Array.from(
    containerDiv.querySelectorAll(
      "div.Row, div.PlaceHolder"
    ) as NodeListOf<HTMLDivElement>
  ).filter(
    (htmlRow) => htmlRow.dataset.root && htmlRow.dataset.root === tableTitle
  ) as HTMLDivElement[];

  if (htmlTable.length === 0) return;

  //We start by modifiying the array to which the table belongs
  modifyArray(htmlTable);

  function modifyArray(htmlTable: HTMLDivElement[]) {
    //We generate a string[][] array from the div elements we selected. Each div element is an elemet of the string[][], and each paragraph attached to such div is a string element.
    let editedTable: string[][] =
      convertHtmlDivElementsIntoArrayTable(htmlTable);

    if (!editedTable || editedTable.length < 1)
      return console.log(
        "convertHtmlDivElementsIntoArrayTable() returned undefined, or empty aray"
      );

    [
      tablesArray,
      getTablesArrayFromTitlePrefix(htmlTable[0].dataset.root),
    ].forEach((array) => modifyTheMainAndSubArrays(array)); //We will modify the tabl in its main Array (retrieved by the arrayName argument, and any other sub array in which th etable might be also included (like PrayersArrays.massCommon, PrayersArrays.IncenseDawn, etc.));

    function modifyTheMainAndSubArrays(targetTablesArray: string[][][]) {
      if (!targetTablesArray) return;
      let oldTable: string[][] = targetTablesArray.find(
        (tbl) => splitTitle(tbl[0][0])[0] === splitTitle(editedTable[0][0])[0]
      );

      if (oldTable)
        targetTablesArray.splice(
          targetTablesArray.indexOf(oldTable),
          1,
          editedTable
        );
      else if (
        confirm(
          "No table with the same title was found in the array, do you want to add the edited table as a new table "
        )
      )
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
function saveOrExportArray(
  tablesArray: string[][][],
  arrayName: string,
  exportToFile: boolean = true,
  exportToStorage: boolean = true
) {
  let text: string;

  if (!tablesArray)
    return console.log("tablesArray is undefined:  ", tablesArray);

  if (!arrayName) return console.log("No array nam is provided");
  console.log("modified array = ", arrayName);

  text = processArrayTextForJsFile(arrayName, tablesArray);

  if (!text)
    return console.log(
      "We've got a problem when we called processArrayTextForJsFile().  arrayName = ",
      arrayName
    );

  if (exportToStorage) {
    localStorage.editedText = text;
    console.log(localStorage.editedText);
  }

  if (exportToFile) exportToJSFile(text, arrayName);
}

/**
 * Takes a table array, and process the strings in the array, in order to restore the prefixes and insert escape characters before the new lines, etc. in a format that suits a js file
 * @param {string[][][]} tablesArray - the string[][][] that will be processed and returned as a text the js file
 * @return {string} the text representing the array in a js file
 */
function processArrayTextForJsFile(
  arrayName: string,
  tablesArray: string[][][]
): string {
  //Open Array of Tables
  if (!tablesArray) tablesArray = eval(arrayName);
  if (!tablesArray) return;
  let text: string = "[";
  tablesArray.forEach((table) => processTable(table));

  function processTable(table: string[][]) {
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
  function processTableRow(row: string[]) {
    if (!row || row.length < 1) {
      console.log("error with row in processTable() = ", row);
      return alert("Something went wrong");
    }

    //open row array
    text += "[\n";
    row.forEach((element: string) => processStringElement(element, row));
    //close row
    text += "],\n";
  }

  function processStringElement(element: string, row: string[]) {
    //for each string element in row[]
    element = element
      .replaceAll('"', '\\"') //replacing '"" by '\"'
      .replaceAll("\n", "\\n")
      .replaceAll("\r", "\\r") ;

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

function replacePrefixes(text: string, arrayName: string): string {
  let prefix: string;
  Object.entries(Prefix).forEach((entry) => {
    prefix = "Prefix." + entry[0];

    if (entry[1] === Prefix.placeHolder)
      text = text.replaceAll('"' + eval(prefix) + '"', prefix);
    else text = text.replaceAll('"' + eval(prefix), (prefix += '+"'));
  });

  if (arrayName !== "PrayersArray") return text;
  //Seasonal
  text = text
    .replaceAll(giaki.AR, '"+giaki.AR+"')
    .replaceAll(giaki.FR, '"+giaki.FR+"')
    .replaceAll(giaki.COP, '"+giaki.COP+"')
    .replaceAll(giaki.CA, '"+giaki.CA+"');
  return text;
}

function replaceHtmlQuotes(innerHtml: string, lang: string): string {
  if (!innerHtml.includes("<q>")) return innerHtml;
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
function addNewRow(htmlParag: HTMLElement, isPlaceHolder: boolean = false, title?: string): HTMLElement | void {
  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return;

  let newRow = document.createElement("div"),
    p: HTMLParagraphElement,
    rowClass: string = 'Row',
    gridColumns: string = htmlRow.style.gridTemplateColumns,
    gridAreas: string = htmlRow.style.gridTemplateAreas;

  if (isPlaceHolder) {
    rowClass = 'PlaceHolder';
    gridColumns = '1';
    gridAreas = 'FR';
    newRow.dataset.root = htmlRow.dataset.root;
    newRow.title = htmlRow.dataset.title;

    if (htmlRow.dataset.displayedPlaceHolder)
      //If htmlRow is a row in a table displayed from a PlaceHolder element, we will go up until we find the first row of the main table to which the PlaceHolder table is attached, and will retrieve its dataset.root
      Object.entries(getMainTableTitle(htmlRow))
        .forEach(entry =>
          entry[0] === 'title' ? newRow.title = entry[1] : newRow.dataset.arrayName = entry[1]);

    newRow.dataset.root = splitTitle(newRow.title)[0];
    newRow.dataset.group = newRow.dataset.root;

    function getMainTableTitle(div: HTMLDivElement): {
      title: string; arrayName: string
    } {
      let previous = div.previousElementSibling as HTMLDivElement;
      while (
        //We go up as long as the previous element has dataset.displayedPlaceHolder === div.dataset.displayedPlaceHolder
        previous.dataset.displayedPlaceHolder
        &&
        previous.dataset.displayedPlaceHolder === div.dataset.displayedPlaceHolder)
        getMainTableTitle(previous as HTMLDivElement);

      return { title: previous.title, arrayName: previous.dataset.arrayName };//This is the main div where the PlaceHolder is displayed before being extended when clicked on
    }
  }

  newRow.classList.add(rowClass);
  newRow.dataset.isNewRow = "isNewRow";
  newRow.style.display = htmlRow.style.display;
  newRow.style.gridTemplateColumns = gridColumns;
  newRow.style.gridTemplateAreas = gridAreas;

  if (!title) title = prompt("Provide the Title of the new Row", htmlRow.title);
  if (!title) return alert('You must provide a valide name for the table that will be put as PlaceHolder');

  if (isPlaceHolder) newRow.dataset.isPlaceHolder = title;


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
    .forEach((child: HTMLElement) => {
      if (isPlaceHolder && newRow.children.length > 0) return;
      if (!child.lang || child.tagName !== "P") return;
      p = newRow.appendChild(document.createElement("p"));
      if (isPlaceHolder) p.innerText = splitTitle(title)[0];
      p.title = newRow.title;
      p.dataset.root = newRow.dataset.root;
      isPlaceHolder ? p.lang = 'FR' : p.lang = child.lang;
      p.classList.add(p.lang.toUpperCase());
      p.contentEditable = "true";
    });

  return htmlRow.insertAdjacentElement("afterend", newRow) as HTMLElement;
}
function addNewCell(htmlParag: HTMLElement): HTMLElement | void {
  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return;
  let p = document.createElement("p"),
    lang: string = prompt('Provide the language of the paragraph') || 'FR';
  p.contentEditable = 'true';
  p.dataset.root = htmlParag.dataset.root;
  p.title = htmlParag.title;
  p.classList.add(lang);
  p.lang = lang;
  p.innerText = 'New paragraph added';
  htmlParag.insertAdjacentElement("afterend", p) as HTMLElement;
  htmlRow.style.gridTemplateAreas = setGridAreas(htmlRow);
  htmlRow.style.gridTemplateColumns = setGridColumnsOrRowsNumber(htmlRow);
}
function addNewColumn(htmlParag: HTMLElement): HTMLElement | void {
  if (htmlParag.tagName !== "P")
    return alert("The html element passed to addNewColumn is not a paragraph");
  let htmlRow = getHtmlRow(htmlParag) as HTMLElement;
  if (!htmlRow) return;
  let langClass = prompt(
    'You must proivde a language class (like "AR", "FR", etc. for the new column. It must not be more than 3 letters, and can be either uper case or lower case',
    "AR"
  ).toUpperCase();
  if (!langClass || langClass.length > 3)
    return alert("You didn't provide a valid language class");
  let newColumn: HTMLElement = document.createElement("p");
  newColumn.contentEditable = "true";
  newColumn.classList.add(langClass);
  newColumn.lang = langClass;
  newColumn.innerText = "New column added with class = " + newColumn.lang;
  htmlRow.appendChild(newColumn);
  newColumn.dataset.isNew = "isNewColumn";
  htmlRow.style.gridTemplateColumns = (
    (100 / htmlRow.children.length).toString() + "% "
  ).repeat(htmlRow.children.length);

  let languages = Array.from(htmlRow.children).map((p: HTMLElement) => p.lang);
  let areas: string = languages.join(" ");
  areas = prompt("Do we want to rearrange the languages areas?", areas);

  areas.split(" ").map((language) => {
    let parag = Array.from(htmlRow.children).filter(
      (p: HTMLElement) => p.lang === language
    )[0] as HTMLElement;
    htmlRow.appendChild(parag); //we are arranging the html paragraphs elements in the same order as provided by the user when prompted
  });
  areas = areas.replaceAll(",", "");
  htmlRow.style.gridTemplateAreas = '"' + areas + '"';

  return htmlRow;
}

function createHtmlElementForPrayerEditingMode(args: {
  tblRow: string[];
  titleBase: string;
  languagesArray: string[];
  position?:
  | HTMLElement
  | DocumentFragment
  | { beforeOrAfter: InsertPosition; el: HTMLElement };
  container?: HTMLElement | DocumentFragment;
  arrayName?: string;
  actorClass?: string;
}): HTMLDivElement {
  if (!args.position) args.position = containerDiv;
  if (!args.container) args.container = containerDiv;
  if (!args.arrayName)
    args.arrayName = getArrayNameFromArray(
      getTablesArrayFromTitlePrefix(args.titleBase)
    );
  if (!args.arrayName) return;

  if (args.titleBase.startsWith(Prefix.HolyWeek) && args.arrayName === 'ReadingsArrays.GospelNightArrayFR') args.languagesArray = getLanguages('PrayersArrayFR');


  let htmlRow: HTMLDivElement,
    p: HTMLParagraphElement,
    lang: string,
    text: string,
    actorClass: string,
    isPlaceHolder: boolean;

  args.tblRow[0].startsWith(Prefix.placeHolder)
    ? (isPlaceHolder = true)
    : (isPlaceHolder = false);

  actorClass = splitTitle(args.tblRow[0])[1] || "";

  htmlRow = document.createElement("div");
  if (args.arrayName) htmlRow.dataset.arrayName = args.arrayName;

  if (!isPlaceHolder) {
    htmlRow.classList.add("Row"); //we add 'Row' class to this div
    htmlRow.title = args.titleBase + "&C=" + actorClass; //We need to record the full title of each row (i.e. row[0]) in order to be able to add it when we convert the html element into an element in an Array
    htmlRow.dataset.root = args.titleBase;
    htmlRow.dataset.group = args.titleBase; //The data-group attribute aims at making the row part of the same of group of rows that will be shown or hidden when we click on the title
    if (args.tblRow[0].startsWith(Prefix.same)) htmlRow.dataset.isPrefixSame = 'true';//We need this in order to be able to determine whether when exporting the table, the row should be a row starting with Prefix.same, or should be given the full title as the 1st row of the table

    if (actorClass) htmlRow.classList.add(actorClass);
  } else if (isPlaceHolder) {
    args.tblRow = [...args.tblRow]; //We create a copy of the row
    let children = Array.from(args.container.children) as HTMLDivElement[];
    let lastChild = children[children.length - 1];
    htmlRow.classList.add("PlaceHolder");
    htmlRow.dataset.isPlaceHolder = args.tblRow[1]; //This is the title of the table referrenced by the placeHolder row
    htmlRow.dataset.root = lastChild.dataset.root; //We add as data-root the data-root of the previous element appended to the container. We do this because we want the placeHolder div to be part of the main table and be retrieved with the same data root and title
    htmlRow.title = lastChild.title; //We do the same for the data-title attribute as for the data-root.
    htmlRow.dataset.goup = lastChild.dataset.group; //Same as above
    htmlRow.style.backgroundColor = "grey";
    let copyLangs = [...args.languagesArray];

    htmlRow.addEventListener("click", () => {
      let referrencedTblTitle: string = htmlRow.dataset.isPlaceHolder; //When tblRow is a 'PlaceHoder', it has 2 elements: the first of which is  'Prefix.placeHolder' and the second (i.e., args.tblRow[1]) is the title of the table that is refrenced
      let shown = Array.from(containerDiv.querySelectorAll("div")).filter(
        (div) =>
          div.dataset.displayedPlaceHolder &&
          div.dataset.displayedPlaceHolder === referrencedTblTitle
      );

      if (shown.length > 0) {
        //This means that the table referrenced in tblRow[1] is displayed. We will save any changes made to it and remove it
        saveModifiedArray({
          exportToFile: false,
          exportToStorage: true,
          dataRoot: referrencedTblTitle,
        });

        shown.forEach((displayed) => {
          if (displayed.dataset.isPlaceHolder)
            Array.from(
              containerDiv.querySelectorAll(
                "div.Row"
              ) as NodeListOf<HTMLDivElement>
            )
              .filter(
                (div) =>
                  div.dataset.root &&
                  div.dataset.root === displayed.dataset.isPlaceHolder
              )
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
        return console.log(
          "We could not identifiy the array in which the referrenced table is to be retrieved"
        );

      let tableArrayName = getArrayNameFromArray(tblsArray);

      let table = [
        ...tblsArray.find(
          (tbl) => splitTitle(tbl[0][0])[0] === referrencedTblTitle
        ),
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
        Array.from(div.children).forEach((paragraph: HTMLParagraphElement) => {
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
    } else {
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
    if (lang) p.classList.add(lang.toUpperCase());
    p.lang = lang; //we are adding this in order to be able to retrieve all the paragraphs in a given language by its data attribute. We need to do this in order for example to amplify the font of a given language when the user double clicks
    p.innerText = text;
    p.contentEditable = "true";
    htmlRow.appendChild(p); //the row which is a <div></div>, will encapsulate a <p></p> element for each language in the 'prayer' array (i.e., it will have as many <p></p> elements as the number of elements in the 'prayer' array)
  }
  //@ts-ignore
  args.position.el
    ?
    //@ts-ignore
    args.position.el.insertAdjacentElement(args.position.beforeOrAfter,
      htmlRow
    )
    : //@ts-ignore
    args.position.appendChild(htmlRow);

  return htmlRow;
}

function getPrayersSequence() {
  let allRows = containerDiv.querySelectorAll(".Row"),
    text: string = "[";
  allRows.forEach((row) => {
    //@ts-ignore
    text += row.dataset.root + ", \n";
  });
  text += "]";
  console.log(text);
}

function addTableToSequence(htmlParag: HTMLElement) {
  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return;
  sequence.push(splitTitle(htmlRow.dataset.root)[0]);
  let result = prompt(sequence.join(", \n"), sequence.join(", \n"));
  sequence = result.split(", \n");
  if (document.getElementById("showSequence")) {
    let tableRows = Array.from(containerDiv.children).filter(
      (htmlRow: HTMLDivElement) => htmlRow.dataset.root
    );

    tableRows.forEach((row: HTMLDivElement) => {
      createHtmlElementForPrayerEditingMode({
        tblRow: Array.from(row.querySelectorAll("p")).map((p) => p.innerText),
        titleBase: row.dataset.root,
        languagesArray: allLanguages.map(lang => lang[0]),
        position: document.getElementById("showSequence") as HTMLElement,
      });
    });
    setCSS(
      Array.from(
        document.getElementById("showSequence").querySelectorAll("div.Row")
      )
    );
  }
}

function exportSequence() {
  console.log(sequence);
  let empty = confirm("Do you want to empty the sequence?");
  if (empty) sequence = [];
}

function showSequence(
  sequenceArray: string[] = sequence,
  container: HTMLDivElement = containerDiv
) {
  let tableRows: HTMLDivElement[];
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
    tableRows = Array.from(container.children).filter(
      (htmlRow: HTMLDivElement) => htmlRow.dataset.root.startsWith(title)
    ) as HTMLDivElement[];
    tableRows.forEach((row) => {
      createHtmlElementForPrayerEditingMode({
        tblRow: Array.from(row.querySelectorAll("p")).map(
          (p: HTMLElement) => p.innerText
        ),
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
  if (console.save) return;
  console.save = createJsFile;
}

/**
 * Creates a downloadable JS file from the date passed as an argument, and downloads the file with the provided fileName
 * @param data
 * @param filename
 * @returns
 */
function createJsFile(data: Object | string, filename: string) {
  if (!data) {
    console.error("Console.save: No data");
    return;
  }
  if (!filename) filename = "PrayersArrayModified";

  if (typeof data === "object") {
    data = JSON.stringify(data, undefined, 4);
  }
  if (typeof data === "string") {
    data = data.replace("\\\\", "\\");
  }

  var blob = new Blob([data as BlobPart], { type: "text/json" }),
    e = document.createEvent("MouseEvents"),
    a = document.createElement("a");

  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
  e.initMouseEvent(
    "click",
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  a.dispatchEvent(e);
}

function splitParagraphsToTheRowsBelow(htmlParag: HTMLElement) {
  //Sometimes when copied, the text is inserted as a SPAN or a div, we will go up until we get the paragraph element itslef
  let showAlert = () =>
    alert(
      "Make sure the cursuor is placed within the text of a paragraph/cell"
    );
  if (!htmlParag) return showAlert(); //We check that we got a paragraph element
  while (htmlParag.tagName !== "P" && htmlParag.parentElement)
    htmlParag = htmlParag.parentElement;

  if (htmlParag.tagName !== "P") return showAlert();
  let title: string =
    htmlParag.parentElement.dataset.title ||
    htmlParag.parentElement.dataset.root +
    "&C=" +
    Array.from(htmlParag.parentElement.classList).find((c) => c !== "Row"),
    lang: string = htmlParag.lang,
    table: HTMLElement[] = Array.from(containerDiv.children).filter(
      (htmlRow: HTMLDivElement) =>
        htmlRow.dataset.root && htmlRow.dataset.root === splitTitle(title)[0]
    ) as HTMLElement[]; //Those are all the rows belonging to the same table, including the title
  if (!table || table.length === 0)
    return alert(
      "We didn't find any elements having the same data-root as the selected paragraph: " +
      title
    );

  let rowIndex: number = table.indexOf(htmlParag.parentElement);
  //We retrieve the paragraph containing the text

  let splitted = htmlParag.innerText.split("\n");
  for (let i = 0; i < splitted.length; i++) {
    if (!splitted[i] || splitted[i] === "") continue;
    if (!table[i + rowIndex]) {
      //if tables rows are less than the number of paragraphs in 'clean', we add a new row to the table, and we push the new row to table
      table.push(
        addNewRow(
          table[table.length - 1].querySelector('p[lang="' + lang + '"]'),
          false,
          title
        ) || undefined
      );
    }
    let paragraph = Array.from(table[i + rowIndex].children).filter(
      (p: HTMLElement) => p.lang === lang
    )[0] as HTMLElement;
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
function getHtmlRow(htmlParag: HTMLElement): HTMLDivElement | undefined | void {
  if (!htmlParag)
    return alert(
      "Make sure your cursor is within the cell/paragraph where the text is to be found"
    );
  while (
    !htmlParag.classList.contains("Row") &&
    htmlParag.parentElement &&
    htmlParag.parentElement !== containerDiv
  ) {
    htmlParag = htmlParag.parentElement;
  }
  if (htmlParag.tagName !== "DIV" || !htmlParag.classList.contains("Row"))
    return undefined;
  else return htmlParag as HTMLDivElement;
}

/**
 * Returns an array of languages based on the name of the array passed to it (if it is a reading, it returns the languages for the readings, if it is the PrayersArray, it returns the prayersLanguages)
 * @param {string} arrayName - the name of a string[][][], for which we will return the languages corresponding to it
 * @returns {string[]} - an array of languages
 */
function getLanguages(arrayName?): string[] {
  let languages: string[] = prayersLanguages;
  if (!arrayName) return languages;
  if (arrayName.startsWith("ReadingsArrays."))
    languages = readingsLanguages;
  if (arrayName.startsWith("ReadingsArrays.SynaxariumArray"))
    languages = ["FR", "AR"];
  if (arrayName === "NewTable") languages = ["COP", "FR", "EN", "CA", "AR"];
  return languages;
}

/**
 * Converts the coptic font of the text in the selected html element, to a unicode font
 * @param {HTMLElement} htmlElement - an editable html element in which the cursor is placed, containing coptic text in a non unicode font, that we need to convert
 */
async function convertCopticFontFromAPI(htmlElement: HTMLElement, fontFrom?: string) {
  let text: string;
  const apiURL: string =
    "https://www.copticchurch.net/coptic_language/fonts/convert";
  if(!fontFrom) fontFrom = prompt("Provide the font", "Coptic1/CS Avva Shenouda");

  while (htmlElement.tagName !== "P" && htmlElement.parentElement)
    htmlElement = htmlElement.parentElement;
  text = htmlElement.textContent;
  let request = new XMLHttpRequest();
  request.open("POST", apiURL);
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  request.setRequestHeader("accept", "text");
  request.send(
    "from=" +
    encodeURI(fontFrom) +
    "&encoding=unicode&action=translate&data=" +
    encodeURI(text)
  );
  request.responseType = "text";
  request.onload = () => {return onLoad()};
  
    function onLoad() {
      if (request.status === 200) {
        let textArea: HTMLElement = new DOMParser()
          .parseFromString(request.response, "text/html")
          .getElementsByTagName("textarea")[0];
        console.log("converted text = ", textArea.innerText);
        htmlElement.innerText = textArea.innerText;
        text = textArea.innerText;
        return textArea.innerText;
      } else {
        console.log("error status text = ", request.statusText);
        text = 'Failed and got error : ' + request.statusText
        return request.statusText;
      }
  }
  return text
}

function goToTableByTitle() {
  saveModifiedArray({ exportToFile: false, exportToStorage: true });
  let title: string = "";
  //@ts-ignore
  if (containerDiv.children.length > 0 && containerDiv.children[0].dataset.root) title = containerDiv.children[0].dataset.root;

  title = prompt(
    'Provide the title you want to go to. If you want to show the readings of a given day, you provide the date of the readings in this format"ReadignsDate = [date]"',
    title
  );

  if (confirm("Do you want to edit the readings of a given date?")) {
    let date = prompt(
      "Provide the Coptic date as DDMM of the readings you want to edit"
    );
    if (!date) return;
    return editDayReadings(date);
  }

  let rows: HTMLElement[] = Array.from(
    containerDiv.querySelectorAll(".Row") as NodeListOf<HTMLElement>
  ).filter((row: HTMLElement) => row.dataset.root.includes(title));
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
function editNextOrPreviousTable(htmlParag: HTMLElement, next: boolean = true) {
  if (
    containerDiv.dataset.specificTables !== "true" ||
    !containerDiv.dataset.arrayName
  )
    return; //We don't run this function unless we are in the 'edinting specific table(s) mode'

  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return;
  let title: string = htmlRow.dataset.root;

  if (!title)
    return alert(
      "We couldn't retrieve the data-root of the current table. Make sure the cursor is placed within one of the table's cells"
    );

  //We first save the changes to the array
  saveModifiedArray({ exportToFile: false, exportToStorage: true });

  let arrayName = containerDiv.dataset.arrayName;

  let array: string[][][] = eval(arrayName);

  let table = array.filter(
    (tbl) => splitTitle(tbl[0][0])[0] === splitTitle(title)[0]
  )[0];

  if (!table || table.length < 1)
    return alert(
      "The current table could not be retrieved from the array by its title from the data-root attribute"
    );

  array = eval(arrayName); //!CAUTION we needed to do this in order to unfilter the array again after it had been filtered (P.S.: the spread operator did'nt work)

  if (next) table = array[array.indexOf(table) + 1];
  else table = array[array.indexOf(table) - 1];

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

function reArangeTablesColumns(tblTitle: string, arrayName: string) {
  //@ts-ignore
  // if (!console.save) addConsoleSaveMethod(console);
  let array: string[][][] = eval(arrayName);
  let table: string[][] = array.filter((tbl) => tbl[0][0] === tblTitle)[0];
  table.forEach((row) => {
    row[row.length - 1] = row[1];
    row[1] = "";
    row.splice(1, 0, "");
    row.splice(1, 0, "");
  });
  exportToJSFile(processArrayTextForJsFile(arrayName, array), arrayName);
}

function editDayReadings(date?: string) {
  if (date) saveModifiedArray({ exportToFile: true, exportToStorage: true });

  if (!date)
    date = prompt(
      "Provide the Coptic date as DDMM of the readings you want to edit"
    );

  if (!date) return;

  let readings: string[][][] = [];

  Object.entries(ReadingsArrays).forEach((readingArray) =>
    readingArray[1]
      .filter((tbl) => tbl[0][0].includes(date)) //!This must be a filter not a find operation because the Gospel Psalm and the Gospel itself for a given day are in 2 separate tables
      .forEach((tbl) => readings.push(tbl))
  );
  if (readings.length < 1) return;

  containerDiv.innerHTML = "";
  let tblTitle: string;
  readings.forEach((tbl) => {
    if (!tbl) return;
    tblTitle = splitTitle(tbl[0][0])[0];
    startEditingMode({
      tableTitle: tblTitle,
      arrayName: PrayersArraysKeys.find((array) =>
        tblTitle.startsWith(array[0])
      )[1],
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
          arrayName:'ReadingsArrays.' + readingArray[0],
          clear: false,
        });
      });
    });
}
function showBtnInEditingMode(btn: Button) {
  if (containerDiv.children.length > 0)
    saveModifiedArray({ exportToFile: true, exportToStorage: true });

  let container: HTMLElement | DocumentFragment = containerDiv;
  if (btn.docFragment) container = btn.docFragment;
  hideExpandableButtonsPannel();
  expandableBtnsPannel.innerHTML = "";
  containerDiv.style.gridTemplateColumns = "100%";
  if (btn.onClick) btn.onClick();

  if (btn.prayersSequence && btn.prayersArray && btn.languages)
    showPrayersFromSequence();

  closeSideBar(leftSideBar);

  function showPrayersFromSequence() {
    let array: string[][][];

    btn.prayersSequence.forEach((title) => {
      if (!title.includes("&D=")) return;
      array = getTablesArrayFromTitlePrefix(title);
      if (!array) return console.log("tablesArray is undefined");
      showTables({
        tablesArray: [findTable(title, array, { equal: true }) as string[][]],
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

    btn.children.forEach((childBtn: Button) => {
      //for each child button that will be created, we set btn as its parent in case we need to use this property on the button
      if (btn.btnID != btnGoToPreviousMenu.btnID) childBtn.parentBtn = btn;
      //We create the html element reprsenting the childBtn and append it to btnsDiv
      createBtn({
        btn: childBtn,
        btnsContainer: sideBarBtnsContainer,
        btnClass: childBtn.cssClass,
      });
    });
  }

  showTitlesInRightSideBar(
    Array.from(
      container.querySelectorAll(".Title, .SubTitle")
    ) as HTMLDivElement[]
  );

  if (
    btn.parentBtn &&
    btn.btnID !== btnGoToPreviousMenu.btnID &&
    !sideBarBtnsContainer.querySelector("#" + btnGoToPreviousMenu.btnID)
  ) {
    //i.e., if the button passed to showChildButtonsOrPrayers() has a parentBtn property and it is not itself a btnGoback (which we check by its btnID property), we wil create a goBack button and append it to the sideBar
    //the goBack Button will only show the children of btn in the sideBar: it will not call showChildButonsOrPrayers() passing btn to it as a parameter. Instead, it will call a function that will show its children in the SideBar
    createGoBackBtn(btn.parentBtn, sideBarBtnsContainer, btn.cssClass);
    lastClickedButton = btn;
  }
  if (
    btn.btnID !== btnMainMenu.btnID && //The button itself is not btnMain
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

  if (btn.docFragment) containerDiv.appendChild(btn.docFragment);

  if (btn.btnID === btnMainMenu.btnID) addSettingsButton();
}

function modifyAllSelectedText() {
  let paragraph = document.getSelection().focusNode.parentElement;
  while (paragraph.tagName !== 'P' && paragraph.parentElement) paragraph = paragraph.parentElement;//We go up until we reach the parent html paragraph element
  if (!paragraph) return alert('Could not select the paragraph');
  let selected = getSelectedText();
  if (!selected) return alert("You didn't select any text");
  let text = selected.toString();
  let modified = prompt("Provide the text to replace the selected text", text);
  if (!modified || modified === text)
    return alert(
      "Either you dindn't make any change or you provided an invalide string"
    );

  let htmlRow = getHtmlRow(paragraph) as HTMLDivElement;
  if (!htmlRow || !htmlRow.dataset.arrayName)
    return alert("Couldn't retrieve the arrayName");
  let arrayName = htmlRow.dataset.arrayName;
  let index: number = Array.from(htmlRow.children).indexOf(paragraph) + 1; //! Caution: we must add 1 because index 0 is the title
  let array: string[][][] = eval(arrayName);
  if (!array) return alert("Couldn't retrive the array");

  saveModifiedArray({ exportToFile: false, exportToStorage: true });//We update the array by including what has been edited and is still displayed but not saved yet

  array.forEach((table) =>
    table.forEach((row) => {
      if (!row || !row[index] || !row[index].includes(text)) return;
      row[index] = row[index].replaceAll(text, modified);
    })
  );

  (function reloadCurrentlyEditedTables() {
    //We will reload the currently displayed table(s)

    let titles = new Set(
      Array.from(containerDiv.children as HTMLCollectionOf<HTMLDivElement>)
        .filter((htmlRow) => htmlRow.title)
        .map((htmlRow) => splitTitle(htmlRow.title)[0]));//We retrieve the titles of the all the displayed tables

    containerDiv.dataset.arrayName = '';//We do this in order to avoid that startEditingMode() triggers the alert for the user to confirm that he wants to reload another table from the sama array

    startEditingMode({
      tableTitle: Array.from(titles).join(', '),
      arrayName: arrayName,
      languages: getLanguages(arrayName),
      clear: true
    });

  })();

}

function getSelectedText(): Selection {
  return window.getSelection();
}
