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
            el = createHtmlElementForPrayerEditingMode(i, table[i][0], table[i], prayersLanguages, allLanguages, table[i][0].split('&C=')[1], containerDiv);
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
    createEditingButton(btnExport, () => exportShadowArray([...shadowArray]), 'Export');
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
}
function deleteRow(htmlRow) {
    htmlRow.dataset.deleted = 'deleted';
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
function exportShadowArray(shadowArray) {
    let htmlRows = containerDiv.querySelectorAll('.TargetRow'), htmlRow, rowIndex, table, updated, filtered, title;
    for (let i = 0; i < htmlRows.length; i++) {
        //for each div with class = TargetRow
        htmlRow = htmlRows[i];
        if (updated.indexOf(baseTitle(htmlRow.dataset.root)) < 0)
            continue; //if the title is in the updated[] array, it means that this table has already been updated, we move to the next html element
        title = htmlRow.dataset.root;
        filtered = shadowArray.filter(tbl => baseTitle(tbl[0][0]) == baseTitle(title)); //We search for a table in the shadowARray having the same title as the data-root of the htmlRow
        if (filtered.length == 1) {
            //we found a table having the same title, we will retrieve all the html div elements matching the table title
            table = filtered[0];
            let allRows = containerDiv.querySelectorAll(getDataRootSelector(baseTitle(title), true));
            for (let s = 0; s < allRows.length; s++) {
                if (allRows[s].dataset.isNewRow) {
                    //it means this is a row we have added, we ad a new row to the table at s 
                    table.splice(s, 0, [allRows[s].dataset.root]);
                    table[s] = editRow(allRows[s]);
                }
                else if (allRows[s].dataset.deleted) {
                    //it means this row need to be deleted, we remove the row from the table
                    table.splice(s, 1);
                }
                else {
                    //it means no rows added or deleted, we modify table[s]
                    table[s] = editRow(allRows[s]);
                }
                updated.push(title);
            }
        }
        else if (filtered.length == 0) {
            //We didin't find any table having the same title matching the data-root of the html div, we will hence need to insert a new table
            //@ts-ignore
            let previousTitle = htmlRow.previousSibling.dataset.root.split('&C=')[0]; //we are retrieving the root of the title of the preivous div
            //We search in shadowArray for a table which title matches the title of the previous div
            table = shadowArray.filter(t => t[0][0].startsWith(previousTitle))[0];
            //we insert a new table after the table matching the title of the previous div
            shadowArray.splice(shadowArray.indexOf(table) + 1, 0, [editRow(htmlRow)]); //we insert  an empty table
        }
        ;
        function editRow(htmlRow) {
            let row = [htmlRow.dataset.root], text;
            for (let x = 0; x < htmlRow.children.length; x++) {
                //for each child paragraph ('p' element) of the html div
                //@ts-ignore
                if (!htmlRow.children[x].dataset.lang)
                    continue; //this is to escape the div containig the editing buttons
                //@ts-ignore
                text = htmlRow.children[x].innerText;
                text = text.replaceAll('"', '\\"');
                text = text.replaceAll("'", "\\'");
                text = text.replaceAll(String.fromCharCode(10134) + ' ', '');
                text = text.replaceAll(String.fromCharCode(10133) + ' ', '');
                row[x + 1] = text; //we start at 1 because row[0] has been set to title (see above);
            }
            return row;
        }
    }
    console.log(getArrayAsText());
    function getArrayAsText() {
        let text = '[';
        shadowArray.map(table => {
            if (!table || table.length < 1)
                return;
            text += '\n[';
            table.map(row => {
                if (!row || row.length < 1)
                    return;
                text += '\n[';
                row.map(el => text += '"' + el + '", \n');
                text += '],';
            });
            text += '],';
        });
        text += ']';
        text = replacePrefixes(text);
        return text;
    }
    shadowArray = undefined;
}
function replacePrefixes(text) {
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
function createHtmlElementForPrayerEditingMode(rowIndex, firstElement, prayers, languagesArray, userLanguages, actorClass, position = containerDiv) {
    let row, p, lang, text;
    row = document.createElement("div");
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
