let sequence = [];
async function editingMode(tblsArray) {
    document.body.addEventListener('keydown', event => {
        if (event.ctrlKey && 'w'.indexOf(event.key) !== -1) {
            event.preventDefault();
        }
    });
    //alert('Editing mode is active: localStorage = ' + localStorage.editingMode);
    let el;
    containerDiv.innerHTML = '';
    tblsArray.map(table => {
        for (let i = 0; i < table.length; i++) {
            el = createHtmlElementForPrayerEditingMode(table[i][0], table[i], prayersLanguages, allLanguages, table[i][0].split('&C=')[1], containerDiv, i);
            if (el) {
                Array.from(el.children).map((c) => c.contentEditable = 'true');
                addEdintingButtons(el, tblsArray);
            }
        }
    });
    setCSSGridTemplate(containerDiv.querySelectorAll('div.TargetRow'));
    showTitlesInRightSideBar(containerDiv.querySelectorAll('div.TargetRowTitle'), rightSideBar.querySelector('#sideBarBtns'), btnBookOfHours, true);
}
function addEdintingButtons(el, shadowArray) {
    let btnsDiv = document.createElement('div');
    btnsDiv.classList.add('btnsDiv');
    btnsDiv.style.display = 'grid';
    btnsDiv.style.gridTemplateColumns = '100%';
    el.appendChild(btnsDiv);
    //Add new row button
    let btnNewRow = document.createElement('button');
    btnsDiv.appendChild(btnNewRow);
    createEditingButton(btnNewRow, () => addNewRow(btnNewRow.parentElement.parentElement, shadowArray), 'Add Row');
    //Export to ShadowArray button
    let btnExport = document.createElement('button');
    btnsDiv.appendChild(btnExport);
    //createEditingButton(btnExport, () => exportShadowArrayOld([...shadowArray]), 'Export')
    createEditingButton(btnExport, () => exportModifiedArray(), 'Export');
    //Modify The Title
    let btnTitle = document.createElement('button');
    btnsDiv.appendChild(btnTitle);
    createEditingButton(btnTitle, () => changeTitle(btnTitle.parentElement.parentElement), 'Ttile');
    //Modify The Css Class
    let btnClass = document.createElement('button');
    btnsDiv.appendChild(btnClass);
    createEditingButton(btnClass, () => changeCssClass(btnClass.parentElement.parentElement), 'Class');
    //Delete row
    let btnDelete = document.createElement('button');
    btnsDiv.appendChild(btnDelete);
    createEditingButton(btnDelete, () => deleteRow(btnDelete.parentElement.parentElement), 'Delete');
    //Add table to sequence
    let btnAddSequence = document.createElement('button');
    btnsDiv.appendChild(btnAddSequence);
    createEditingButton(btnAddSequence, () => addTableToSequence(btnAddSequence.parentElement.parentElement), 'Add To Sequence');
    //Export Sequence
    let btnExportSequence = document.createElement('button');
    btnsDiv.appendChild(btnExportSequence);
    createEditingButton(btnExportSequence, () => exportSequence(btnExportSequence.parentElement.parentElement), 'Export Sequence');
}
function deleteRow(htmlRow) {
    htmlRow.dataset.isDeleted = 'deleted';
    htmlRow.style.display = 'none';
}
function changeCssClass(htmlRow) {
    let className = htmlRow.dataset.root.split('&C=')[1];
    toggleClass(htmlRow, className);
    Array.from(htmlRow.children).forEach((element) => {
        toggleClass(element, className);
    });
    className = prompt('Provide The Title', htmlRow.dataset.root.split('&C=')[1]);
    htmlRow.dataset.root = htmlRow.dataset.root.split('&C=')[0] + '&C=' + className;
    if (className == 'Title') {
        toggleClass(htmlRow, 'TargetRowTitle');
    }
    else {
        toggleClass(htmlRow, className);
        Array.from(htmlRow.children).forEach((element) => {
            toggleClass(element, className);
        });
    }
    ;
}
function toggleClass(element, className) {
    element.classList.toggle(className);
}
function changeTitle(htmlRow) {
    let title = prompt('Provide The Title', htmlRow.dataset.root);
    htmlRow.dataset.root = title;
}
function createEditingButton(btnHtml, fun, label) {
    btnHtml.classList.add(inlineBtnClass);
    btnHtml.classList.add('btnEditing');
    btnHtml.innerText = label;
    btnHtml.addEventListener('click', () => fun());
}
function exportModifiedArray() {
    let htmlRows = containerDiv.querySelectorAll('.TargetRow'), tableHtmlRows, table, updated = [], newArray = [], title;
    Array.from(htmlRows).forEach(
    //for each 'TargetRow' div in containderDiv
    (htmlRow) => {
        title = baseTitle(htmlRow.dataset.root);
        if (updated.indexOf(title) > -1)
            return; //if the table has already been added, its title will be in the updated[], we will escape the row since it has already been processed
        tableHtmlRows = containerDiv.querySelectorAll(getDataRootSelector(title, true)); //we selecte all the rows matching the title
        newArray.push([]); //this is an emepty array for the table
        table = newArray[newArray.length - 1];
        for (let i = 0; i < tableHtmlRows.length; i++) {
            //for each row matching the title
            table.push(Array.from(tableHtmlRows[i].querySelectorAll('p')).map((p) => p.innerText));
            table[table.length - 1].unshift(tableHtmlRows[i].dataset.root); //adding the title
        }
        updated.push(title);
    });
    let text = replacePrefixes(newArray);
    localStorage.editedText = text;
    console.log(localStorage.editedText);
    exportToTextFile(console, text, 'PrayersArrayModified');
}
function replacePrefixes(array) {
    let text = '[';
    (function convertArrayToText() {
        array.forEach(table => {
            //open table
            text += '[\n';
            table.forEach(row => {
                //open row
                text += '[\n';
                for (let i = 0; i < row.length; i++) {
                    row[i] = row[i].replaceAll('"', '\\"');
                    if (row[0].endsWith('&C=Title'))
                        row[i] = row[i].replaceAll(String.fromCharCode(10134), '').replaceAll(String.fromCharCode(10133), '');
                    text += '"' + row[i] + '", \n';
                }
                //close row
                text += '], \n';
            });
            //close table
            text += '], \n';
        });
    })();
    return replaceText(text) + ']';
    function replaceText(text) {
        text = text.replaceAll('"' + Prefix.bookOfHours, 'Prefix.bookOfHours + "');
        text = text.replaceAll('"' + Prefix.commonDoxologies, 'Prefix.commonDoxologies + "');
        text = text.replaceAll('"' + Prefix.commonIncense, 'Prefix.commonIncense + "');
        text = text.replaceAll('"' + Prefix.commonPrayer, 'Prefix.commonPrayer + "');
        text = text.replaceAll('"' + Prefix.communion, 'Prefix.communion + "');
        text = text.replaceAll('"' + Prefix.cymbalVerses, 'Prefix.cymbalVerses + "');
        text = text.replaceAll('"' + Prefix.fractionPrayer, 'Prefix.fractionPrayer + "');
        text = text.replaceAll('"' + Prefix.gospelDawn, 'Prefix.gospelDawn + "');
        text = text.replaceAll('"' + Prefix.gospelMass, 'Prefix.gospelMass + "');
        text = text.replaceAll('"' + Prefix.gospelNight, 'Prefix.gospelNight + "');
        text = text.replaceAll('"' + Prefix.gospelResponse, 'Prefix.gospelResponse + "');
        text = text.replaceAll('"' + Prefix.gospelVespers, 'Prefix.gospelVespers + "');
        text = text.replaceAll('"' + Prefix.incenseDawn, 'Prefix.incenseDawn + "');
        text = text.replaceAll('"' + Prefix.incenseVespers, 'Prefix.incenseVespers + "');
        text = text.replaceAll('"' + Prefix.katholikon, 'Prefix.incenseVespers + "');
        text = text.replaceAll('"' + Prefix.massCommon, 'Prefix.massCommon + "');
        text = text.replaceAll('"' + Prefix.massStBasil, 'Prefix.massStBasil + "');
        text = text.replaceAll('"' + Prefix.massStCyril, 'Prefix.massStCyril + "');
        text = text.replaceAll('"' + Prefix.massStGregory, 'Prefix.massStGregory + "');
        text = text.replaceAll('"' + Prefix.massStJohn, 'Prefix.massStJohn + "');
        text = text.replaceAll('"' + Prefix.praxis, 'Prefix.praxis + "');
        text = text.replaceAll('"' + Prefix.propheciesDawn, 'Prefix.propheciesDawn + "');
        text = text.replaceAll('"' + Prefix.psalmResponse, 'Prefix.psalmResponse + "');
        text = text.replaceAll('"' + Prefix.stPaul, 'Prefix.stPaul + "');
        text = text.replaceAll(giaki.AR, '" + giaki.AR + "');
        text = text.replaceAll(giaki.FR, '" + giaki.FR + "');
        text = text.replaceAll(giaki.COP, '" + giaki.COP + "');
        text = text.replaceAll(giaki.CA, '" + giaki.CA + "');
        return text;
    }
}
function addNewRow(row, shadowArray) {
    let newRow = document.createElement('div'), p, child;
    newRow.classList.add('TargetRow');
    newRow.dataset.isNewRow = 'isNewRow';
    newRow.style.display = row.style.display;
    newRow.style.gridTemplateColumns = row.style.gridTemplateColumns;
    newRow.style.gridTemplateAreas = row.style.gridTemplateAreas;
    newRow.dataset.root = prompt('Provide the Title of the new Row', row.dataset.root);
    newRow.classList.add(newRow.dataset.root.split('&C=')[1]);
    //newRow.contentEditable = 'true';
    for (let i = 0; i < row.children.length - 1; i++) {
        //length - 1 because the last element is the div contiaining the buttons
        child = row.children[i];
        if (!child.dataset.lang)
            continue;
        p = newRow.appendChild(document.createElement('p'));
        p.classList.add(child.dataset.lang);
        p.classList.add(newRow.dataset.root.split('&C=')[1]);
        //child.classList.forEach(className => p.classList.add(className));
        p.dataset.root = child.dataset.root;
        p.dataset.lang = child.dataset.lang;
        p.innerText = 'Insert Here Your Text ' + p.dataset.lang;
        p.contentEditable = 'true';
    }
    addEdintingButtons(newRow, shadowArray);
    row.insertAdjacentElement('afterend', newRow);
}
function createHtmlElementForPrayerEditingMode(firstElement, prayers, languagesArray, userLanguages, actorClass, position = containerDiv, rowIndex) {
    let row, p, lang, text;
    row = document.createElement("div");
    if (rowIndex)
        row.dataset.index = rowIndex.toString();
    row.classList.add("TargetRow"); //we add 'TargetRow' class to this div
    let dataRoot = firstElement;
    row.dataset.root = dataRoot;
    if (actorClass && actorClass !== "Title") {
        // we don't add the actorClass if it is "Title", because in this case we add a specific class called "TargetRowTitle" (see below)
        row.classList.add(actorClass);
    }
    else if (actorClass && actorClass == "Title") {
        row.addEventListener("click", (e) => {
            e.preventDefault;
            collapseText(row);
        }); //we also add a 'click' eventListener to the 'TargetRowTitle' elements
    }
    //looping the elements containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
    for (let x = 1; x < prayers.length; x++) {
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
        if (actorClass == "Title") {
            //this means that the 'prayer' array includes the titles of the prayer since its first element ends with '&C=Title'.
            row.classList.add("TargetRowTitle");
            row.id = prayers[0];
            row.tabIndex = 0; //in order to make the div focusable by using the focus() method
        }
        else if (actorClass) {
            //if the prayer is a comment like the comments in the Mass
            p.classList.add(actorClass);
        }
        else {
            //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
            p.classList.add("PrayerText");
        }
        p.dataset.root = dataRoot; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
        text = prayers[x];
        p.dataset.lang = lang; //we are adding this in order to be able to retrieve all the paragraphs in a given language by its data attribute. We need to do this in order for example to amplify the font of a given language when the user double clicks
        p.textContent = text;
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
    let allRows = containerDiv.querySelectorAll('.TargetRow'), text = '[';
    allRows.forEach(row => {
        //@ts-ignore
        text += row.dataset.root + ', \n';
    });
    text += ']';
    console.log(text);
}
function addTableToSequence(htmlRow) {
    sequence.push(baseTitle(htmlRow.dataset.root));
    let result = prompt(sequence.join(', \n'), sequence.join(', \n'));
    sequence = result.split(', \n');
    if (document.getElementById('showSequence')) {
        let tableRows = Array.from(containerDiv.querySelectorAll(getDataRootSelector(baseTitle(htmlRow.dataset.root), true)));
        tableRows.forEach((row) => {
            createHtmlElementForPrayerEditingMode(row.dataset.root, Array.from(row.querySelectorAll('p')).map(p => p.innerText), ['AR', foreingLanguage], ['AR', foreingLanguage], row.dataset.root.split('&C=')[1], document.getElementById('showSequence'));
        });
        setCSSGridTemplate(document.getElementById('showSequence').querySelectorAll('.TargetRow'));
    }
}
function exportSequence(htmlRow) {
    console.log(sequence);
    let empty = confirm('Do you want to empty the sequence?');
    if (empty)
        sequence = [];
}
function showSequence(sequenceArray = sequence, container = containerDiv) {
    let tableRows;
    let newDiv = document.createElement('div');
    document.getElementById('content').insertAdjacentElement('beforebegin', newDiv);
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
    newDiv.id = 'showSequence';
    newDiv.style.backgroundColor = 'white !important';
    newDiv.style.height = '50%';
    newDiv.style.width = '100%';
    newDiv.style.position = 'fixed';
    newDiv.style.overflow = 'auto';
    newDiv.style.zIndex = '3';
    sequenceArray.forEach(title => {
        tableRows = container.querySelectorAll(getDataRootSelector(title, true));
        tableRows.forEach(row => {
            createHtmlElementForPrayerEditingMode(row.dataset.root, Array.from(row.querySelectorAll('p')).map((p) => p.innerText), ['AR', foreingLanguage], ['AR', foreingLanguage], row.dataset.root.split('&C=')[1], newDiv);
        });
        setCSSGridTemplate(newDiv.querySelectorAll('.TargetRow'));
    });
}
function exportToTextFile(console, text, fileName) {
    console.save = function (data, filename) {
        if (!text) {
            console.error('Console.save: No data');
            return;
        }
        if (!filename)
            filename = 'PrayersArrayModifiedd';
        if (typeof text === "object") {
            data = JSON.stringify(data, undefined, 4);
        }
        text = text.replace('\\\\', '\\');
        var blob = new Blob([data], { type: 'text/json' }), e = document.createEvent('MouseEvents'), a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    };
    console.save(text, fileName);
}
function splitParagraphsToTheRowsBelow(title, lang) {
    let allRows = containerDiv.querySelectorAll(getDataRootSelector(title));
    let firstParag = allRows[0].querySelectorAll('p[data-lang="' + lang + '"');
    let text = firstParag[0].innerText;
    let splitted = text.split('\n');
    let clean = splitted.filter(t => t != '');
    for (let i = 1; i < allRows.length; i++) {
        //@ts-ignore
        allRows[i].querySelectorAll('p[data-lang="' + lang + '"')[0].innerText = clean[i - 1];
    }
}
function cleanPrayersArray(title) {
    let repeated = PrayersArray.filter(table => baseTitle(table[0][0]) == title);
    if (repeated.length > 1)
        PrayersArray.splice(PrayersArray.indexOf(repeated[1]), 1);
    if (repeated.length == 1 && repeated[0].length > 1) {
        for (let i = 1; i < repeated[0].length; i++) {
            if (repeated[0][i][0].endsWith('Title')) {
                repeated[0].splice(i, repeated[0].length - 1);
                cleanPrayersArray(title);
                return;
            }
        }
    }
}
function cleanPrayersArrayAllFractionsAndCymbal() {
    process(Prefix.cymbalVerses);
    process(Prefix.fractionPrayer);
    function process(title) {
        let repeated = PrayersArray.filter(table => baseTitle(table[0][0]).startsWith(title));
        if (repeated.length > 1) {
            PrayersArray.splice(PrayersArray.indexOf(repeated[1]), 1);
        }
        ;
        if (repeated.length == 1 && repeated[0].length > 1) {
            for (let i = 1; i < repeated[0].length; i++) {
                if (repeated[0][i][0].endsWith('Title')) {
                    repeated[0].splice(i, repeated[0].length - 1);
                    cleanPrayersArray(title);
                    return;
                }
            }
        }
    }
}
