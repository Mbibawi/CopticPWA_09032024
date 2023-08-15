let sequence: string[] = [];
/**
 * This is the function that displayes the elements of the array that we want to edit
 * @param {HTMLSelectElement}  select - the selection element from which we selet the options
 * @param {boolean} clear - whether or not we should remove all the children of the containerDiv content
 */
function editTablesArray(select: HTMLSelectElement, clear: boolean = true) {
  containerDiv.style.gridTemplateColumns = '100%';
  let entry: string = select.selectedOptions[0].innerText;

  if (!entry) return;

  if (entry === select.options[0].innerText) return; //entries[0] === 'Choose From the List'

  if (
    containerDiv.dataset.arrayName
    && entry === containerDiv.dataset.arrayName
    && !confirm('Warning !! you are about to reload the same array, you will loose all your modifications. Are you sure you want to reload the same array? ')
  ) return; //If the selected option is the same as the already loaded array, and the user does not confirm reloading the array, we return

  containerDiv.dataset.arrayName = entry;

  if (entry === select.options[2].innerText) entry = prompt('Provide the function and the parameters', entry);//under development
  if (entry.includes('Fun(')) {
    eval(entry);
    return
  }

  let tablesArray: string[][][];
  containerDiv.dataset.specificTables = 'false';

  let languages = getLanguages(entry);
  if (!languages) languages = allLanguages;

  if (entry === select.options[1].innerText) {
    //select.options[1] = newTable
    containerDiv.dataset.arrayName = 'PrayersArray';//!CAUTION: if we do not set the arrayName to an existing array, it will yeild to an error when the array name will be evaluated by eval(arraName), and the saveModifiedArray() will stop without exporting the text to file
    containerDiv.dataset.editedArray = 'PrayersArray';//We delete the dataSet value in order to avoid adding the table to the same array

    languages = []; //We empty the languages array and will fill it according to what the user will provide
    let langs = prompt('Provide the sequence of the languages columns', 'COP, FR, EN, CA, AR');
    tablesArray = [[['NewTable&D=$copticFeasts.AnyDay&C=Title']]];//We create a string[][][] with one table having only 1 row
    let tbl1 = tablesArray[0]
    langs.split(', ').forEach(lang => {
      tbl1[0].push(lang);
      languages.push(lang);
    });
    tbl1.push([...tbl1[0]]);
    tbl1[tbl1.length - 1][0] = tbl1[tbl1.length - 1][0].split('&C=')[0];
  }; 

  if (!tablesArray
    &&entry !== select.options[1].innerText //i.e. if it is not 'new table'
    && confirm('Do you want to edit a single or specific table(s) in the array? (if more than one table, provide the titles separated by ", " '))
  { containerDiv.dataset.specificTables = 'true' };
  
  if (!tablesArray) tablesArray = eval(entry);
  if (!tablesArray) return;


  if (containerDiv.dataset.specificTables === 'true') {
    let tableTitle = prompt('Provide the name of the table you want to edit');
    let filteredArray:string[][][] = [];
    console.log('splitted = ', tableTitle.split(', '));
    tableTitle.split(', ')
        .map(title =>{
          filteredArray.push(
            tablesArray.filter(
              tbl => tbl[0][0] === eval(title)
            )[0]
            );
          
          if (!filteredArray[filteredArray.length - 1]) console.log('the filtering gave an invalid result : ',  filteredArray[filteredArray.length - 1]);
        }
    );
    tablesArray = filteredArray;
    //tablesArray = tablesArray.filter(tbl => tbl[0][0] === tableTitle);
    if (tablesArray.length < 1) return alert('There is no table in the array matching the title you provided');
    console.log('filteredArray = ', filteredArray)
  };

  localStorage.displayMode === displayModes[0];
  //@ts-ignore
 // if (!console.save) addConsoleSaveMethod(console); //We are adding a save method to the console object
  let el: HTMLElement;

  if (clear) containerDiv.innerHTML = ""; //we empty the containerDiv
  showTables(tablesArray, languages);

}
/**
 * Takes a string[][][] (i.e., and array of tables, each being a string[][], where each string[] represents a rowh),  that we want to edit,and creates html div elements representing the text of each row of eah table in the tablesArray
 * @param {string[][][]} tablesArray - an array containing the tables that we need to show and start editing
 * @param {string[]} languages - the languages included in the tables
 */
function showTables(tablesArray: string[][][], languages: string[], clear: boolean = true) {
  if (clear) containerDiv.innerHTML = '';
  let el: HTMLDivElement;
  //We create an html div element to display the text of each row of each table in tablesArray
tablesArray.forEach(table => {
  if (!table) return;
  table.forEach(row => {
    if (!row) return;
    el = createHtmlElementForPrayerEditingMode(row, languages);
    //We make the paragraph children of each row, editable
    if (el) Array.from(el.children).forEach((c: HTMLElement) => c.contentEditable = "true");
  });
});
  
   //We add the editing buttons
addEdintingButtons();
//Setting the CSS of the newly added rows
setCSSGridTemplate(Array.from(containerDiv.querySelectorAll("div.Row")));
//Showing the titles in the right side-bar

//removing the minus sign at the begining of the title
Array.from(containerDiv.querySelectorAll("div.Title, div.SubTitle"))
  .forEach(div =>
    Array.from(div.getElementsByTagName('P'))
    .forEach((p: HTMLElement) =>
      p.innerText = p.innerText.replaceAll(String.fromCharCode(plusCharCode + 1), '')
  ));

showTitlesInRightSideBar(Array.from(
  containerDiv.querySelectorAll("div.Title, div.SubTitle")) as HTMLDivElement[]);
}

/**
 * Adds the editing buttons as an appeded div to each html div (row) displayed
 * @param {HTMLElement} el - the div representing a row in the table
 */
function addEdintingButtons(getButtons?:Function[]) {
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

  if (!getButtons) getButtons = [
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
function addRowBtn(btnsDiv:HTMLElement){
  let newButton= createEditingButton(
     () => addNewRow(document.getSelection().focusNode.parentElement),
     "Add Row"
     );
     btnsDiv.appendChild(newButton);
};

function addColumnBtn(btnsDiv:HTMLElement){
  let newButton= createEditingButton(
     () => addNewColumn(document.getSelection().focusNode as HTMLElement),
     "Add Column"
     );
     btnsDiv.appendChild(newButton);
};


  function saveToLocalStorageBtn(btnsDiv:HTMLElement){
    let newButton= createEditingButton(() => saveModifiedArray(), "Save");
      btnsDiv.appendChild(newButton);
}
/**
 * Creates a button for exporting the edited text as an string[][][] in a js file
 * @param {HTMLElement} btnsDiv - the html div in  which the buttons are displayed
 */
function exportToJSFileBtn(btnsDiv: HTMLElement) {
  let newButton = createEditingButton(() =>exportToJSFile(saveModifiedArray(), containerDiv.dataset.arrayName), "Export To JS");
  btnsDiv.appendChild(newButton);
}

/**
 * Generates a file name for the JS file, including the name of the array, the date on which it was modified, and the time
 * @param {string} arrayName - the name of the array for which we want to generate a file name
 */
function getJSFileName(arrayName: string): string {
  let today = new Date();
  return arrayName
  + '_[ModifiedOn'
  + String(today.getDate())
  + String(today.getMonth()+1)//we add 1 because the months are counted from 0
  + String(today.getFullYear())
  + 'at'
  + String(today.getHours() +1)
  +'h'
  + String(today.getMinutes())
  + '].js';

  
}

function changeTitleBtn(btnsDiv:HTMLElement){
  let newButton = createEditingButton(() => changeTitle(document.getSelection().focusNode.parentElement), "Change Ttile"
  );
    btnsDiv.appendChild(newButton);
}
  
function goToTableByTitleBtn(btnsDiv) {
  let newButton = createEditingButton(() => goToTableByTitle(), "Go To Table"
  );
    btnsDiv.appendChild(newButton);
}

  function changeClassBtn(btnsDiv:HTMLElement){
    let newButton = createEditingButton(
      () => changeCssClass(document.getSelection().focusNode.parentElement), "Class");
    btnsDiv.appendChild(newButton);
  }

function deleteRowBtn(btnsDiv: HTMLElement) {
    let newButton = createEditingButton(
      () => deleteRow(document.getSelection().focusNode.parentElement), "Delete Row");
      btnsDiv.appendChild(newButton);
}
  
function addTableToSequenceBtn(btnsDiv:HTMLElement){
  let newButton = createEditingButton(
    () => addTableToSequence(document.getSelection().focusNode.parentElement),
    "Add To Sequence"
    );
    btnsDiv.appendChild(newButton);
}
function convertCopticFontsFromAPIBtn(btnsDiv: HTMLElement) {
  let newButton = createEditingButton(
    () => convertCopticFontFromAPI(document.getSelection().focusNode.parentElement),
    "Convert Coptic Font"
    );
    btnsDiv.appendChild(newButton);
}

function splitBelowBtn(btnsDiv:HTMLElement){
  let newButton = createEditingButton(
  ()=>splitParagraphsToTheRowsBelow(),
  "Split Below"
);
  btnsDiv.appendChild(newButton);
}

function exportSequenceBtn(btnsDiv:HTMLElement){
  let newButton = createEditingButton(
    () => exportSequence(),
    "Export Sequence"
    );
    btnsDiv.appendChild(newButton);
    newButton = createEditingButton(
    ()=>splitParagraphsToTheRowsBelow(),
    "Split Below"
  );
    btnsDiv.appendChild(newButton);
  }
function modifyTablesInTheirArrayBtn(btnsDiv:HTMLElement){
  let newButton = createEditingButton(
    () => modifyTablesInTheirArray(),
    "Modify The Original Array"
  );
    btnsDiv.appendChild(newButton);
  }

/**
 * Deletes an html div (row) from the DOM
 * @param {HTMLElement} htmlRow - the html div (or any html element), we want to delete
 * @returns
 */
function deleteRow(htmlParag: HTMLElement) {
  let htmlRow = getHtmlRow(htmlParag) as HTMLElement;
  if (!htmlRow) return;
  if (confirm("Are you sure you want to delete this row?") === false) return;//We ask the user to confirm before deletion
  htmlRow.remove();
}

/**
 * Displays the next table in the array if we are in a single table editing mode
 * @param {HTMLElement} btnsDiv - the html  div in which the buttons are shown
 */
function editNextTableBtn(btnsDiv:HTMLElement){
  let newButton= createEditingButton(
     () => editNextOrPreviousTable(document.getSelection().focusNode.parentElement, true),
     "Next Table"
     );
     btnsDiv.appendChild(newButton);
};
/**
 * Edits the previous table in the array if we are in a single table editing mode
 * @param {HTMLElement} btnsDiv - the html  div in which the buttons are shown
 */
function editPreviousTableBtn(btnsDiv:HTMLElement){
  let newButton= createEditingButton(
     () => editNextOrPreviousTable(document.getSelection().focusNode.parentElement, false),
     "Previous Table"
     );
     btnsDiv.appendChild(newButton);
};

/**
 * Replaces each table in the array by the table in newTables[] having a title that matches the title of the target table in array[]
 */
function modifyTablesInTheirArray(container:HTMLElement = containerDiv) {
  let array = eval(containerDiv.dataset.arrayName), arrayOfTables:string[][][] =[], filtered: string[][][];

  if (!array || array.length === 0) { alert('The array was not found'); return };
  let titles: Set<string> = new Set();

  let containerChildren = Array.from(container.children) as HTMLDivElement[];
  let title: string;
  
    containerChildren
      .forEach(
        (htmlRow: HTMLDivElement) => {
          title = splitTitle(htmlRow.dataset.root)[0]
          if (titles.has(title)) return;

          titles.add(title)[0];

          arrayOfTables
            .push(
              convertHtmlDivElementsIntoArrayTable(
                containerChildren
                  .filter(row => splitTitle(row.dataset.root)[0] === title)
              )
            );

        });
        
  if (arrayOfTables.length === 0) return;

  arrayOfTables
    //Looping the tables in arrayOfTables
    .forEach(
      (table: string[][]) => {
        //We will filter the array by the title to get the element matching the title
        filtered = array.filter(t => t[0][0] === table[0][0]);
        //We will replace the original table with the table array created from the html divs 
        if (filtered && filtered.length === 1) array.splice(array.indexOf(filtered[0]), 1, table);
        if (filtered && filtered.length > 1) console.log('found more than 1 table when filtering the original array ', filtered);
    });
  //@ts-ignore
  createJSFile(replacePrefixes(array), 'Modified' + containerDiv.dataset.arrayName+ '.js');
}


/**
 * Changes the 'actor' css class of a row
 * @param {HTMLElement} htmlRow - the div (row) for which we want to change the css class
 */
function changeCssClass(htmlParag: HTMLElement) {
  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return alert('Did not find the parent Div');
  let currentClass = splitTitle(htmlRow.dataset.root)[1];
  let newClass: string = prompt("Provide The New Class", currentClass);
  if (!newClass || newClass === currentClass) return;
  htmlRow.dataset.root = splitTitle(htmlRow.dataset.root)[0] + "&C=" + newClass;
  if (currentClass) htmlRow.classList.replace(currentClass, newClass);
  else if(!htmlRow.classList.contains(newClass))htmlRow.classList.add(newClass);
}

function toggleClass(element: HTMLElement, className: string) {
  element.classList.toggle(className);
}
function changeTitle(htmlParag: HTMLElement, newTitle?: string, oldTitle?:string) {
  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return;
  if(!oldTitle) oldTitle = htmlRow.dataset.root;
  if (!newTitle) newTitle = prompt("Provide The Title", oldTitle);
  if (!newTitle) return alert('You didn\'t provide a valide title');
  if (newTitle === oldTitle) return;
    htmlRow.dataset.root = newTitle;
    Array.from(htmlRow.children)
      .forEach(
        (child: HTMLElement) => {
          if (child.tagName === 'P' && child.dataset.root) {
            child.dataset.root = splitTitle(newTitle)[0];
            child.title = newTitle;
          }
        });
  if(newTitle.includes('&C=')) htmlRow.classList.add(splitTitle(newTitle)[1]);
  //We will then go to each sibling and change its title if it has the same title as oldTitle
  htmlRow = htmlRow.nextElementSibling as HTMLDivElement;
  while (htmlRow
    && htmlRow.tagName === 'DIV'
    && splitTitle(htmlRow.dataset.root)[0] === splitTitle(oldTitle)[0]) {
    let actorClass: string = splitTitle(htmlRow.dataset.root)[1];
    if (!actorClass) actorClass = '';
    if (actorClass !== '') actorClass = '&C=' + actorClass;
    changeTitle(htmlRow, splitTitle(newTitle)[0] + actorClass, oldTitle)
  } 
}

/**
 * Creates an html button, and adds  
 * @param {Function} fun - the function that will be called when the button is clicked
 * @param {string} label - the label of the button
 * @returns {HTMLButtonElement} - the html button that was created
 */
function createEditingButton(
  fun: Function,
  label: string
):HTMLButtonElement {
  let btnHtml:HTMLButtonElement = document.createElement('button')
  btnHtml.classList.add(inlineBtnClass);
  btnHtml.classList.add("btnEditing");
  btnHtml.innerText = label;
  btnHtml.addEventListener("click", () => fun());
  return btnHtml
}

/**
 * Takes the text of a modified array, and exports it to a js file
 * @param {string} arrayText - The text of the modified array. It is a text where the prefixes and other special charachters are processed
 * @param {string} fileName -The name that will be given to the js file
 */
function exportToJSFile(arrayText: string, arrayName: string) {
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
function saveModifiedArray(arrayName:string=containerDiv.dataset.arrayName, exportToFile:boolean = true, exportToStorage:boolean=true): string {
  let title: string,
    titles: Set<string> = new Set(),
    tablesArray:string[][][] = eval(arrayName);
  
  if (!tablesArray) tablesArray = [];
    
    let htmlRows: HTMLDivElement[] = Array.from(containerDiv.querySelectorAll("div.Row")); //we retrieve all the divs with 'Row' class from the DOM
    
  //Adding the tables' titles as unique values to the titles set
  htmlRows
  .forEach(htmlRow => {
      //for each 'Row' div in containderDiv
        title = splitTitle(htmlRow.dataset.root)[0]; //this is the title without '&C='
    if (titles.has(title)) return;
          titles.add(title)
          processTableTitle(title, tablesArray);
      }
  );
  
  if (!exportToFile && !exportToStorage) return;

  console.log("modified array = ", tablesArray);
  
  let text:string = processArrayTextForJsFile(tablesArray, containerDiv.dataset.arrayName);
  
  if (exportToStorage) {
    localStorage.editedText = text;
    console.log(localStorage.editedText);
  };
   if(exportToFile ) return text
};

function processTableTitle(tableTitle: string, tablesArray: string[][][] = eval(containerDiv.dataset.arrayName)) {

  if (!tablesArray) {
    alert('tablesArray is missing')
    return
  };

  let htmlTable =
    Array.from(containerDiv.children)
      .filter((htmlRow: HTMLDivElement) => splitTitle(htmlRow.dataset.root)[0] === tableTitle) as HTMLDivElement[];

    if (htmlTable.length === 0) return;

    let editedTable: string[][] = convertHtmlDivElementsIntoArrayTable(htmlTable);

    let oldTable: string[][] = tablesArray.filter(tbl => tbl[0][0] === editedTable[0][0])[0];
    
  if (oldTable) tablesArray.splice(tablesArray.indexOf(oldTable), 1, editedTable);
      
  else if (confirm('No table with the same title was found in the array, do you want to add the edited table as a new table ')) tablesArray.push(editedTable);
}

/**
 * Takes a table array, and process the strings in the array, in order to restore the prefixes and insert escape characters before the new lines, etc. in a format that suits a js file
 * @param {string[][][]} tablesArray - the string[][][] that will be processed and returned as a text the js file
 * @return {string} the text representing the array in a js file
 */
function processArrayTextForJsFile(tablesArray: string[][][], arrayName:string): string {
  //Open Array of Tables
  let text: string = "[";
  tablesArray.forEach((table: string[][]) => processTable(table));

  function processTable(table: string[][]) {
    if (!table || table.length < 1){
      console.log('error with table in processTable() = ', table)
        return alert('Something went wrong')
      };
    //open table array
    text += "[\n";
    table.forEach((row: string[]) => {
      processTableRow(row);
    });
    //close table
    text += "], \n";
  };
  function processTableRow(row: string[]) {
    if (!row || row.length < 1){
    console.log('error with row in processTable() = ', row)
      return alert('Something went wrong')
    };
    
    //open row array
    text += "[\n";
    row.forEach((element:string)=>processStringElement(element, row))
    //close row
    text += "], \n";
  };

  function processStringElement(element: string, row: string[]) {
    //for each string element in row[]
    element = element.replaceAll('"', '\\"'); //replacing '"" by '\"'
    element = element.replaceAll('\n', '\\n');

    if (splitTitle(row[0])[1] === 'Title')
      element = element
        .replaceAll(String.fromCharCode(plusCharCode) + ' ', '')
        .replaceAll(String.fromCharCode(plusCharCode +1) + ' ', ''); //removing the plus(+) and minus(-à characters from the titles

    text += '"'+element+'", \n'; //adding the text of row[i](after being cleaned from the unwatted characters) to text
  };
  text = replacePrefixes(text);
  text = arrayName + "= " + text + "];";
  return  text
}

function replacePrefixes(text: string): string {
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
function addNewRow(htmlParag: HTMLElement, dataRoot?: string): HTMLElement {
  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return;
 
  let newRow = document.createElement("div"),
    p: HTMLParagraphElement,
    child: HTMLParagraphElement;
  newRow.classList.add("Row");
  newRow.dataset.isNewRow = "isNewRow";
  newRow.style.display = htmlRow.style.display;
  newRow.style.gridTemplateColumns = htmlRow.style.gridTemplateColumns;
  newRow.style.gridTemplateAreas = htmlRow.style.gridTemplateAreas;
  if (!dataRoot) dataRoot = prompt(
    "Provide the Title of the new Row",
    htmlRow.dataset.root
  );
  newRow.dataset.root = dataRoot;
  let cssClass = splitTitle(dataRoot)[1];
  if(cssClass) newRow.classList.add(cssClass);
  //newRow.contentEditable = 'true';
  for (let i = 0; i < htmlRow.children.length; i++) {
    child = htmlRow.children[i] as HTMLParagraphElement;
    if (!child || !child.lang || child.tagName !=='P') continue;
    p = newRow.appendChild(document.createElement("p"));
    p.classList.add(child.lang.toUpperCase());
    p.dataset.root = dataRoot;
    p.lang = child.lang;
    //p.innerText = "Insert Here Your Text "+p.lang;
    p.contentEditable = "true";
  }
  return htmlRow.insertAdjacentElement("afterend", newRow) as HTMLElement;
}
function addNewColumn(htmlParag: HTMLElement): HTMLElement | void {
  if (htmlParag.tagName !== 'P') return alert('The html element passed to addNewColumn is not a paragraph');
  let htmlRow = getHtmlRow(htmlParag) as HTMLElement;
  if (!htmlRow) return;
  let langClass = prompt('You must proivde a language class (like "AR", "FR", etc. for the new column. It must not be more than 3 letters, and can be either uper case or lower case', 'AR').toUpperCase();
  if (!langClass || langClass.length > 3) return alert('You didn\'t provide a valid language class');
  let newColumn:HTMLElement = document.createElement('p');
  newColumn.contentEditable = 'true';
  newColumn.classList.add(langClass);
  newColumn.lang = langClass;
  newColumn.innerText = 'New column added with class = ' + newColumn.lang;
  htmlRow.appendChild(newColumn);
  newColumn.dataset.isNew = "isNewColumn";
  htmlRow.style.gridTemplateColumns = ((100 / htmlRow.children.length).toString() + '% ').repeat(htmlRow.children.length);
  

  let languages = Array.from(htmlRow.children).map((p: HTMLElement) => p.lang);
  let areas:string = languages.join(' ');
  areas = prompt('Do we want to rearrange the languages areas?', areas);
  
    areas
      .split(' ')
      .map((language) => {
        let parag =
          Array.from(htmlRow.children)
            .filter((p: HTMLElement) => p.lang === language)[0] as HTMLElement;
        htmlRow.appendChild(parag); //we are arranging the html paragraphs elements in the same order as provided by the user when prompted
      });
    areas = areas.replaceAll(',', '');
    htmlRow.style.gridTemplateAreas = '"' + areas + '"';

  return htmlRow;
}

function createHtmlElementForPrayerEditingMode(
  tblRow: string[],
  languagesArray: string[],
  position:
    | HTMLElement
    | { beforeOrAfter: InsertPosition; el: HTMLElement } = containerDiv
): HTMLDivElement {
  let row: HTMLDivElement, p: HTMLParagraphElement, lang: string, text: string;

  row = document.createElement("div");
  row.classList.add("Row"); //we add 'Row' class to this div
  let dataRoot: string = tblRow[0];
  row.dataset.root = dataRoot;
  let actorClass = splitTitle(tblRow[0])[1];
  if (actorClass && !actorClass.includes("Title")) {
    // we don't add the actorClass if it is "Title", because in this case we add a specific class called "Title" (see below)
    row.classList.add(actorClass);
  } else if (actorClass && actorClass.includes("Title")) {
    row.addEventListener("click", (e) => {
      e.preventDefault;
      collapseText(row);
    }); //we also add a 'click' eventListener to the 'Title' elements
  }
  //looping the elements containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
  for (let x = 1; x < tblRow.length; x++) {
    //x starts from 1 because prayers[0] is the id
    if (
      actorClass &&
      (actorClass == "Comment" || actorClass == "CommentText")
    ) {
      //this means it is a comment
      x == 1 ? (lang = languagesArray[1]) : (lang = languagesArray[3]);
    } else {
      lang = languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
    } //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
    p = document.createElement("p"); //we create a new <p></p> element for the text of each language in the 'prayer' array (the 'prayer' array is constructed like ['prayer id', 'text in AR, 'text in FR', ' text in COP', 'text in Language', etc.])
    if (actorClass === "Title" || actorClass === 'SubTitle') {
      //this means that the 'prayer' array includes the titles of the prayer since its first element ends with '&C=Title'.
      row.classList.add(actorClass);
      row.id = tblRow[0];
      row.tabIndex = 0; //in order to make the div focusable by using the focus() method
    } else if (actorClass) {
      //if the prayer is a comment like the comments in the Mass
        row.classList.add(actorClass);
    } else {
      //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
        p.classList.add("PrayerText");
    }
    p.dataset.root = dataRoot; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
    p.title = dataRoot;
    text = tblRow[x];
    if (lang)
      p.classList.add(lang.toUpperCase())
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
  let allRows = containerDiv.querySelectorAll(".Row"),
    text: string = "[";
  allRows.forEach((row) => {
    //@ts-ignore
    text += row.dataset.root+", \n";
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
    let tableRows = Array.from(containerDiv.children).filter((htmlRow: HTMLDivElement) => htmlRow.dataset.root.startsWith(splitTitle(htmlRow.dataset.root)[0]));
    
    tableRows.forEach((row: HTMLDivElement) => {
      createHtmlElementForPrayerEditingMode(
        Array.from(row.querySelectorAll("p")).map((p) => p.innerText),
        allLanguages,
        document.getElementById("showSequence")
      );
    });
    setCSSGridTemplate(
      Array.from(document.getElementById("showSequence").querySelectorAll("div.Row"))
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
  let tableRows:HTMLDivElement[];
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
      .filter((htmlRow: HTMLDivElement) => htmlRow.dataset.root.startsWith(title)) as HTMLDivElement[];
    tableRows
      .forEach((row) => {
      createHtmlElementForPrayerEditingMode(
        Array.from(row.querySelectorAll("p")).map((p: HTMLElement) => p.innerText),
        allLanguages,
        newDiv
      );
    });
    setCSSGridTemplate(Array.from(newDiv.querySelectorAll(".Row")));
  });
}

/**
 * adds a 'save' method to console, which prints a data to a text or a json file
 */
function addConsoleSaveMethod(console) {
  if (console.save) return;
  console.save = createJsFile

}

/**
 * Creates a downloadable JS file from the date passed as an argument, and downloads the file with the provided fileName
 * @param data 
 * @param filename 
 * @returns 
 */
function createJsFile(data:Object | string, filename:string) {
  if (!data) {
    console.error("Console.save: No data");
    return;
  }
  if (!filename) filename = "PrayersArrayModifiedd";

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
};

function splitParagraphsToTheRowsBelow() {
  //Sometimes when copied, the text is inserted as a SPAN or a div, we will go up until we get the paragraph element itslef
  let showAlert = ()=> alert('Make sure the cursuor is placed within the text of a paragraph/cell');
  let htmlParag = document.getSelection().focusNode.parentElement;
  if(!htmlParag) return showAlert();//We check that we got a paragraph element
  while (htmlParag.tagName !== 'P' && htmlParag.parentElement) htmlParag = htmlParag.parentElement;

  if (htmlParag.tagName !== 'P') return showAlert();
  let title:string = htmlParag.dataset.root,
    lang:string = htmlParag.lang,
    table: HTMLElement[] =
      Array.from(containerDiv.children)
        .filter((htmlRow: HTMLDivElement) =>
          htmlRow.dataset.root
          && htmlRow.dataset.root.startsWith(splitTitle(title)[0])) as HTMLElement[],//Those are all the rows belonging to the same table, including the title
    rowIndex: number = table.indexOf(htmlParag.parentElement);
  //We retrieve the paragraph containing the text
 
  let text = Array.from(htmlParag.children).map(child => child.textContent).join('\n');
  
  let splitted = text.split("\n");
  let clean = splitted.filter((t) => t != "");
  for (let i = 0; i < clean.length; i++) {
    if (!table[i+rowIndex]) {
      //if tables rows are less than the number of paragraphs in 'clean', we add a new row to the table, and we push the new row to table
      table.push(addNewRow(table[table.length - 1].querySelector('p[lang="'+lang+'"]'), htmlParag.parentElement.dataset.root));//we provide the data-root in order to avoid to be prompted when the addNewRow() is called
    }
    Array.from(table[i+rowIndex].children)
    .filter((p: HTMLElement) => p.lang == lang)[0]
    //@ts-ignore
      .innerText = clean[i];
  }
}

/**
 * If htmlParag is not a Div, it checks each of its parents until it founds the DIV container. Otherwise, it triggers an alert message and returns 'undefined'
 * @param {HTMLElement} htmlParag - the html element within which hte cursor is placed
 * @returns {HTMLDivElement | undefined}
 */
function getHtmlRow(htmlParag: HTMLElement): HTMLDivElement | undefined | void {
  if (!htmlParag) return  alert('Make sure your cursor is within the cell/paragraph where the text is to be found');
  while (!htmlParag.classList.contains('Row')
    && htmlParag.parentElement
  && htmlParag.parentElement !== containerDiv) {
    htmlParag = htmlParag.parentElement};
  if (htmlParag.tagName !== 'DIV'
    || !htmlParag.classList.contains('Row'))
    return undefined;
  else return htmlParag as HTMLDivElement;
}

/**
 * Displays the text of a string[][][] which name is passed to the function as as sting
 * @param {string} arrayName - the name of the string[][][] array containing the text
 * @param {string} title 
 * @returns 
 */
function showTablesFun(arrayName: string, title: string) {
  let languages: string[] = getLanguages(arrayName),
        el: HTMLElement,
        sourceArray:string[][][] = eval(arrayName);
        
  if (!sourceArray || sourceArray.length === 0) { alert('No array was found with the name: ' + arrayName);  return}
  
  //We save the name of the array in a data attribute of containerDiv, in order to be able to retrieve it when exporting the text to a js file
  containerDiv.dataset.arrayName = arrayName;
  
  let tables: string[][][] = sourceArray.filter(table => table[0][0].includes(title));
  
  if (!tables || tables.length === 0) { alert('No tables were found in the ' + arrayName + ' with a title including ' + title); return }
  
  
  tables.forEach(
    (table: string[][]) =>
      table.forEach(
        (row:string[]) =>
    {
          el = createHtmlElementForPrayerEditingMode(
            row,
            allLanguages
          );
      
          if (el) Array.from(el.children).map((child: HTMLElement) =>{ if(child.tagName === 'P') child.contentEditable = "true"});
    }
    ));
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
    showTitlesInRightSideBar(
      Array.from(containerDiv.querySelectorAll("div.Title, div.SubTitle")) as HTMLDivElement[]);
}

/**
 * Returns an array of languages based on the name of the array passed to it (if it is a reading, it returns the languages for the readings, if it is the PrayersArray, it returns the prayersLanguages)
 * @param {string} arrayName - the name of a string[][][], for which we will return the languages corresponding to it
 * @returns {string[]} - an array of languages
 */
function getLanguages(arrayName):string[] {
  let languages:string[] = prayersLanguages;
  if (arrayName.startsWith('ReadingsArrays.')) languages = readingsLanguages;
  if (arrayName.startsWith('ReadingsArrays.SynaxariumArray')) languages = ['FR', 'AR'];
  if (arrayName === 'NewTable') languages = ['COP', 'FR', 'EN', 'CA', 'AR'];
  return languages
}

/**
 * Converts the coptic font of the text in the selected html element, to a unicode font
 * @param {HTMLElement} htmlElement - an editable html element in which the cursor is placed, containing coptic text in a non unicode font, that we need to convert
 */
function convertCopticFontFromAPI(htmlElement:HTMLElement) {
  const apiURL: string = 'https://www.copticchurch.net/coptic_language/fonts/convert';
  let fontFrom: string = prompt('Provide the font', 'Coptic1/CS Avva Shenouda');

while (htmlElement.tagName !== 'P' && htmlElement.parentElement) htmlElement = htmlElement.parentElement;
  let text: string = htmlElement.textContent;
  let request = new XMLHttpRequest();
  request.open('POST', apiURL);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  request.setRequestHeader( 'accept', 'text');
  request.send('from=' + encodeURI(fontFrom) + '&encoding=unicode&action=translate&data=' + encodeURI(text));
  request.responseType = 'text';
  request.onload = () => {
  if(request.status === 200){
    let textArea: HTMLElement = new DOMParser()
      .parseFromString(request.response, 'text/html')
      .getElementsByTagName('textarea')[0];
      console.log('converted text = ', textArea.innerText);
      htmlElement.innerText = textArea.innerText;
      return textArea.innerText;
  } else {
    console.log('error status text = ', request.statusText);
    return request.statusText;
  }
  }
}

function goToTableByTitle() {
  let title = prompt('Provide the title you want to go to');
  let rows:HTMLElement[] = Array.from(
    containerDiv.querySelectorAll('.Row') as NodeListOf<HTMLElement>)
    .filter((row: HTMLElement) => row.dataset.root.includes(title));
  if (rows.length === 0) return alert('Didn\'t find an element with the provided title');
  rows[0].id = rows[0].dataset.root + String(0);
  createFakeAnchor(rows[0].id);
}
function editNextOrPreviousTable(htmlParag: HTMLElement, next: boolean = true) {
  if (containerDiv.dataset.specificTables !== 'true') return;//We don't run this function unless we are in the 'edinting specific table(s) mode'

  let htmlRow = getHtmlRow(htmlParag);
  if (!htmlRow) return;
  let title:string = htmlRow.dataset.root;
  
  //We first save the changes to the array
  saveModifiedArray(containerDiv.dataset.arrayName, false, true);
  
  let array: string[][][] = eval(containerDiv.dataset.arrayName);

  let table = array.filter(tbl => splitTitle(tbl[0][0])[0] === splitTitle(title)[0])[0];
  
  if (!table || table.length < 1) return;

  array = eval(containerDiv.dataset.arrayName);//!CAUTION we needed to do this in order to unfilter the array again after it had been filtered (P.S.: the spread operator did'nt work)
  
  if (next) table = array[array.indexOf(table) + 1];
  else table = array[array.indexOf(table) - 1];

  showTables([table], getLanguages(containerDiv.dataset.arrayName))

};

function reArangeTablesColumns(tblTitle: string, arrayName: string) {
  //@ts-ignore
 // if (!console.save) addConsoleSaveMethod(console);
  let array:string[][][] = eval(arrayName);
  let table: string[][] = array.filter(tbl => tbl[0][0] === tblTitle)[0];
  table.forEach(row => {
    row[row.length - 1] = row[1];
    row[1] = '';
    row.splice(1, 0, '');
    row.splice(1, 0, '');
  });
  exportToJSFile(processArrayTextForJsFile(array, arrayName),arrayName);
}