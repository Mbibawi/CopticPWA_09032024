const copticReadingsDates: string[][] = getCopticReadingsDates();

/**
 * Adds or removes a language to the userLanguages Array
 * @param el {HTMLElement} - the html button on which the user clicked to add or remove the language. The language is retrieved from the element's dataset
 */
function addOrRemoveLanguage(el: HTMLElement) {
  let lang: string;
  lang = el.lang;
  //we check that the language that we need to add is included in the userLanguages array
  if (userLanguages.indexOf(lang) > -1) {
    //The language is included in the userLanguages
    if (lang === "CA" && userLanguages.indexOf("COP") === -1) {
      userLanguages.splice(userLanguages.indexOf(lang), 1, "COP");
    } else if (lang === "EN" && userLanguages.indexOf("FR") === -1) {
      userLanguages.splice(userLanguages.indexOf(lang), 1, "FR");
    } else {
      userLanguages.splice(userLanguages.indexOf(lang), 1);
    }
    el.innerText = el.innerText.replace("Remove", "Add");
  } else if (userLanguages.indexOf(lang) === -1) {
    //The language is not included in user languages, we will add it
    //if the user adds the Coptic in Arabic characters, we assume he doesn't need the Coptic text we do the same for English and French
    if (lang === "CA" && userLanguages.indexOf("COP") > -1) {
      userLanguages.splice(userLanguages.indexOf("COP"), 1, lang);
    } else if (lang === "EN" && userLanguages.indexOf("FR") > -1) {
      userLanguages.splice(userLanguages.indexOf("FR"), 1, lang);
      console.log(userLanguages);
    } else {
      userLanguages.push(lang);
    }
    el.innerText = el.innerText.replace("Add", "Remove");
  }
  localStorage.userLanguages = JSON.stringify(userLanguages);

  //in order to refresh the view after adding or removing a language, we call the showChildButtonsOrPrayers passing to it the lasClickedButton which is a variable storing the last clicked sideBar Button (its class is Button) that is displaying its prayers/children/inlineBtns, etc.,
  showChildButtonsOrPrayers(lastClickedButton);
}

/**
 * Removed (if included) or adds (if missing) a given language from/to userLanguages[]
 * @param {string} lang - the language that will be removed or added to userLanguages[]
 */
function modifyUserLanguages(lang: string) {
  if (userLanguages.indexOf(lang) > -1) {
    //lang is included, we will remove it
    userLanguages.splice(userLanguages.indexOf(lang), 1);
  } else if (userLanguages.indexOf(lang) < 0) {
    //lang is not included, we will add it
    userLanguages.splice(allLanguages.indexOf(lang), 0, lang);
  }
  localStorage.userLanguages = JSON.stringify(userLanguages);
}

document.addEventListener('DOMContentLoaded', autoRunOnLoad);

/**
 * Some functions that we run automatically when loading the app
 */
function autoRunOnLoad() {
  showChildButtonsOrPrayers(btnMain);
  DetectFingerSwipe();
  if (localStorage.selectedDate) {
    let selectedDate: Date = new Date();
    selectedDate.setTime(Number(localStorage.selectedDate));
    if (!checkIfDateIsToday(selectedDate)) setCopticDates(selectedDate);
  } else {
    setCopticDates()
  }
  screen.orientation.lock("portrait-secondary").catch(error=> alert(error));
  alert(screen.orientation.type.toString())
};

/**
 *
 * @param firstElement {string} - this is the id of the prayer in the prayersArray
 * @param {string[]} tblRow - an array of the text of the prayer which id matched the id in the idsArray. The first element in this array is the id of the prayer. The other elements are, each, the text in a given language. The prayers array is hence structured like this : ['prayerID', 'prayer text in Arabic', 'prayer text in French', 'prayer text in Coptic']
 * @param {string[]} languagesArray - the languages available for this prayer. The button itself provides this array from its "Languages" property
 * @param {string[]} userLanguages - a globally declared array of the languages that the user wants to show.
 * @param {string} actorClass - a CSS class that will be given to the html element (a div) in which the text of the table row. This class sets the background color of the div according to who is saying the prayer: is it the Priest, the Diacon, or the Assembly?
 */
function createHtmlElementForPrayer(
  tblRow: string[],
  languagesArray: string[],
  userLanguages: string[],
  position?:
    | HTMLElement
    | DocumentFragment
    | { beforeOrAfter: InsertPosition; el: HTMLElement },
    actorClass?:string
): HTMLDivElement {
    //@ts-ignore
    if (!tblRow) return console.log('No tblRow argument is provided to createHtmlElementForPrayer() ');
  if (!actorClass) actorClass = tblRow[0].split('&C=')[1];
  if (actorClass) {
    let parsed = JSON
      .parse(localStorage.showActors)
      .filter(el => el[0].EN === actorClass)
    if (parsed.length > 0 && parsed[0][1] === false) return; //If had hide an actor, we will stop and return
  };
  if (!userLanguages) userLanguages = JSON.parse(localStorage.userLanguages);
  if (!position) position = containerDiv;
  let htmlRow: HTMLDivElement, p: HTMLParagraphElement, lang: string, text: string, titleBase:string;
  
  titleBase = baseTitle(tblRow[0]);

  htmlRow = document.createElement("div");
  htmlRow.classList.add("Row"); //we add 'Row' class to this div
  htmlRow.classList.add("DisplayMode" + localStorage.displayMode); //we add the displayMode class to this div
  htmlRow.dataset.root = titleBase.replace(/Part\d+/, "");
  if (actorClass && !actorClass.includes('Title')) {
    // we don't add the actorClass if it is "Title", because in this case we add a specific class called "TitleRow" (see below)
    htmlRow.classList.add(actorClass);
  } else if (
    actorClass
    && actorClass.includes('Title')
  ) {
    htmlRow.addEventListener("click", (e) => {
      e.preventDefault;
      collapseText(htmlRow);
    }); //we also add a 'click' eventListener to the 'TitleRow' elements
  }
  //looping the elements containing the text of the prayer in different languages,  starting by 1 since 0 is the id/title of the table
  for (let x = 1; x < tblRow.length; x++) {
    //x starts from 1 because prayers[0] is the id
    if (!tblRow[x] || tblRow[x] === ' ') continue;//we escape the empty strings if the text is not available in all the button's languages
    if (
      actorClass &&
      (actorClass === "Comments" || actorClass === "CommentText")
    ) {
      //this means it is a comment
      x === 1 ? (lang = languagesArray[1]) : (lang = languagesArray[3]);
    } else {
      lang = languagesArray[x - 1]; //we select the language in the button's languagesArray, starting from 0 not from 1, that's why we start from x-1.
    } //we check that the language is included in the allLanguages array, i.e. if it has not been removed by the user, which means that he does not want this language to be displayed. If the language is not removed, we retrieve the text in this language. otherwise we will not retrieve its text.
    if (userLanguages.indexOf(lang) > -1) {  
      p = document.createElement("p"); //we create a new <p></p> element for the text of each language in the 'prayer' array (the 'prayer' array is constructed like ['prayer id', 'text in AR, 'text in FR', ' text in COP', 'text in Language', etc.])
      if (actorClass && actorClass === 'Title') {
        //this means that the 'prayer' array includes the titles of the prayer since its first element ends with '&C=Title'
        htmlRow.classList.add('TitleRow');
        htmlRow.id = tblRow[0];
      } else if (actorClass) {
        //if the prayer is a comment like the comments in the Mass
        htmlRow.classList.add(actorClass);
      } else {
        //The 'prayer' array includes a paragraph of ordinary core text of the array. We give it 'PrayerText' as class
        p.classList.add("PrayerText");
      }
      p.dataset.root = htmlRow.dataset.root; //we do this in order to be able later to retrieve all the divs containing the text of the prayers with similar id as the title
      text = tblRow[x];
      p.lang = lang.toLowerCase();
      p.classList.add(lang);
      p.innerText = text;
      p.addEventListener("dblclick", (ev:MouseEvent) => {
        ev.preventDefault();
        toggleAmplifyText(ev.target as HTMLElement, "amplifiedText");
      }); //adding a double click eventListner that amplifies the text size of the chosen language;
      htmlRow.appendChild(p); //the row which is a <div></div>, will encapsulate a <p></p> element for each language in the 'prayer' array (i.e., it will have as many <p></p> elements as the number of elements in the 'prayer' array)
    }
  }
  try{
  //@ts-ignore
  position.el
    ? //@ts-ignore
      position.el.insertAdjacentElement(position.beforeOrAfter, htmlRow)
    : //@ts-ignore
      position.appendChild(htmlRow);
      return htmlRow;
  } catch (error) {
    console.log('an error occured: position = ', position, ' and tblRow = ', tblRow);
    console.log(error);
  }
}


/**
 * Shows a bookmark link in the right side bar for each title in the currently displayed prayers
 * @param {NodeListOf<>Element} titlesCollection  - a Node list of all the divs containing the titles of the different sections. Each div will be passed to addTitle() in order to create a link in the right side bar pointing to the div
 * @param {HTMLElement} rightTitlesDiv - the right hand side bar div where the titles will be displayed
 * @param {boolean} clear - indicates whether the side bar where the links will be inserted, must be cleared before insertion
 */
async function showTitlesInRightSideBar(
  titlesCollection: NodeListOf<HTMLElement>,
  rightTitlesDiv?: HTMLElement,
  clear: boolean = true
) {
  let titlesArray: HTMLDivElement[] = [];
  //this function shows the titles in the right side Bar
  if (!rightTitlesDiv) rightTitlesDiv = rightSideBar.querySelector("#sideBarBtns");
  
  if (clear) {
    rightTitlesDiv.innerHTML = "";
  } //we empty the side bar
  let bookmark: HTMLAnchorElement;
  for (let i = 0; i < titlesCollection.length; i++) {
    titlesCollection[i].id += i.toString(); //we do this in order to give each title a distinctive id in cases where all the titles have the same id
    titlesArray.push(addTitle(titlesCollection[i] as HTMLElement));
  }
  /**
   * Adds shortcuts to the diffrent sections by redirecting to the title of the section
   * @param {HTMLElement} titles - a div including paragraphs, each displaying the title of the section in a given langauge
   */
  function addTitle(titles: HTMLElement):HTMLDivElement {
    let text: string = "",
      div:HTMLDivElement = document.createElement("div"); //this is just a container
    div.role = "button";
    rightTitlesDiv.appendChild(div);
    bookmark = document.createElement("a");
    div.appendChild(bookmark);
    bookmark.href = "#" + titles.id; //we add a link to the element having as id, the id of the prayer
    div.classList.add("sideTitle");
    div.addEventListener("click", () => closeSideBar(rightSideBar)); //when the user clicks on the div, the rightSideBar is closed
    if (titles.querySelector('.' + defaultLanguage)) {
      //if the titles div has a paragraph child with class="AR", it means this is the paragraph containing the Arabic text of the title
      text += titles
        .querySelector('.' + defaultLanguage)
        //@ts-ignore
        .innerText.split('\n')[0];
    }
    if (titles.querySelector('.' + foreingLanguage)) {
      if (text !== '') {
        text += "\n" + titles.querySelector('.' + foreingLanguage)
          //@ts-ignore
          .innerText.split('\n')[0];
      } else {
        text += titles.querySelector('.' + foreingLanguage)
          //@ts-ignore
          .innerText.split('\n')[0];
      }
    };
    //we remove the plus(+) or minus(-) signs from the begining text of the Arabic paragraph;
    text = text
      .replaceAll(String.fromCharCode(plusCharCode) + ' ', '')
      .replaceAll(String.fromCharCode(plusCharCode + 1) + ' ', '');
    bookmark.innerText = text;
    return div
  }
  return titlesArray;
}

/**
 * Takes a Button and, depending on its properties will do the following: if the button has children[] buttons, it will create an html element in the left side bar for each child; if the button has inlineBtns[], it will create an html element in the main page for each inlineButton; if the button has prayers[] and prayersArray, and languages, it will look in the prayersArray for each prayer in the prayers[], and if found, will create an html element in the main page showing the text of this element. It will only do so for the languages included in the usersLanguages.
 * @param {Button} btn - the button that the function will process according to its properties (children[], inlineBtns[], prayers[], onClick(), etc.)
 * @param {boolean} clear - whether to clear or not the text already displayed in the main page
 * @param {boolean} click - if the button has its onClick property (which is a function) and if click = true, the onClick function will be called
 * @param {boolean} pursue - after the onClick function is called, if pursue = false, the showchildButtonsOrPrayers() will return, otherwise, it will continue processing the other properties of the button
 * @returns
 */
function showChildButtonsOrPrayers(
  btn: Button,
  clear: boolean = true,
  click: boolean = true
) {
  if (!btn) return;
  let container: HTMLElement | DocumentFragment = containerDiv;
  if (btn.docFragment) container = btn.docFragment;

  let btnsDiv: HTMLElement = leftSideBar.querySelector("#sideBarBtns");
  hideInlineButtonsDiv();
  if (clear) {
    btnsDiv.innerHTML = "";
    inlineBtnsDiv.innerHTML = "";
  }

  if (btn.onClick && click) {
    btn.onClick();
    if (btn.pursue === false) return;
  }
  if (btn.prayersSequence && btn.prayersArray && btn.languages && btn.showPrayers) showPrayers(btn, true, true, container);
  
  if (btn.afterShowPrayers) btn.afterShowPrayers();
  
  //Important ! : setCSSGridTemplate() MUST be called after btn.afterShowPrayres()
  setCSSGridTemplate(container.querySelectorAll(".Row")); //setting the number and width of the columns for each html element with class 'Row'
  applyAmplifiedText(container.querySelectorAll("p[lang]"));
  if (btn.inlineBtns) {
    let newDiv = document.createElement("div");
    newDiv.style.display = "grid";
    btn.inlineBtns.map((b) => {
      if (btn.btnID != btnGoBack.btnID) {
        // for each child button that will be created, we set btn as its parent in case we need to use this property on the button
        b.parentBtn = btn.parentBtn;
      }
      createBtn(b, newDiv, b.cssClass);
    });
    let s: string = (100 / newDiv.children.length).toString() + "% ";
    newDiv.style.gridTemplateColumns = s.repeat(newDiv.children.length);
    newDiv.classList.add("inlineBtns");
    inlineBtnsDiv.appendChild(newDiv);
  }
  if (btn.children) {
    btn.children.forEach((childBtn:Button) => {
      //for each child button that will be created, we set btn as its parent in case we need to use this property on the button
      if (btn.btnID != btnGoBack.btnID) childBtn.parentBtn = btn;
      //We create the html element reprsenting the childBtn and append it to btnsDiv
      createBtn(childBtn, btnsDiv, childBtn.cssClass); 
    });
  }

  showTitlesInRightSideBar(container.querySelectorAll("div.TitleRow")
  );

  if (btn.parentBtn && btn.btnID !== btnGoBack.btnID) {
    //i.e., if the button passed to showChildButtonsOrPrayers() has a parentBtn property and it is not itself a btnGoback (which we check by its btnID property), we wil create a goBack button and append it to the sideBar
    //the goBack Button will only show the children of btn in the sideBar: it will not call showChildButonsOrPrayers() passing btn to it as a parameter. Instead, it will call a function that will show its children in the SideBar
    createGoBackBtn(btn.parentBtn, btnsDiv, btn.cssClass);
    lastClickedButton = btn;
  }
  if (btn.btnID !== btnMain.btnID //The button itself is not btnMain
    && btn.btnID !== btnGoBack.btnID //The button itself is not btnGoBack
    && !btnsDiv.querySelector('#' + btnMain.btnID) //No btnMain is displayed in the sideBar
  ) {
    createBtn(btnMain, btnsDiv, btnMain.cssClass);
    let image = document.getElementById("homeImg");
    if (image) {
      document.getElementById("homeImg").style.width = "20vmax";
      document.getElementById("homeImg").style.height = "25vmax";
    }
  }
  if (btn.parentBtn && btn.btnID === btnGoBack.btnID) {
    //showChildButtonsOrPrayers(btn.parentBtn);
  }
  
    if (btn.docFragment) containerDiv.appendChild(btn.docFragment);
}

/**
 * Adds the data-group attribute to all all the divs children of the html element passed to it as an argument
 * @param {htmle}  container - the html element container for which we will  add the data-group attribute to each of its div children  
 */
async function addDataGroupsToContainerChildren(container: HTMLElement | DocumentFragment, titleClass: string = 'TitleRow', titleRow?: HTMLElement) {
  if (titleRow
      && titleRow.classList.contains(titleClass)) {
    let nextSibling = titleRow.nextElementSibling as HTMLElement;
    while (nextSibling
      && !nextSibling.classList.contains(titleClass)) {
      nextSibling.dataset.group =titleRow.dataset.root;
      nextSibling = nextSibling.nextElementSibling as HTMLElement;
    }
    return
  };

  if (!container || !container.children) return;
  Array.from(container.children)
    .forEach((child: HTMLElement) => {addDataGroupsToContainerChildren(undefined, undefined, child) })
}


/**
 * Returns an html button element showing a 'Go Back' button. When clicked, this button passes the goTo button or inline button to showchildButtonsOrPrayers(), as if we had clicked on the goTo button
 * @param {Button} goTo - a button that, when the user clicks the 'Go Back' html button element generated by the function, calls showchildButtonsOrPrayers(goTo) thus simulating the action of clicking on the goTo button (its children, inlineBtns, prayers, etc., will be displayed)
 * @param {HTMLElement} btnsDiv - the html element to which the html element button created and returned by the function, will be appended
 * @returns {Promise<HTMLElement>} - when resolved, the function returns the html button element it has created and appended to div
 */
async function createGoBackBtn(
  goTo: Button,
  btnsDiv: HTMLElement,
  cssClass: string,
  bookmarkID?: string
) {
  //We will create a 'Go Back' and will append it to btnsDiv
  let goBak = new Button({
                      btnID: btnGoBack.btnID,
                      label: btnGoBack.label,
                      cssClass: cssClass,
    onClick: () => {
                        //When the goBack button is clicked, it will show the children Buttons of goTo. It will not show its prayers or any other thing
                        btnsDiv.innerHTML = '';
      if (goTo.children) goTo.children.forEach(childBtn => {createBtn(childBtn, btnsDiv, childBtn.cssClass, true)});
      if (goTo.parentBtn) createGoBackBtn(goTo.parentBtn, btnsDiv, goTo.parentBtn.cssClass);
                        //showChildButtonsOrPrayers(goTo);
                      },
  });
  return createBtn(goBak, btnsDiv, goBak.cssClass, false, goBak.onClick);
}
/** 
 * Creates a an anchor html element and sets its href attribute to the id parameter, then clicks the anchor in order to scroll to it and, finally, removes the anchor
 * @param {string} id - the id of the html element to which the href attribute of the anchor will be set 
*/
function createFakeAnchor(id: string) {
  let a = document.createElement("a");
  a.href = "#" + id;
  a.click();
  a.remove();
}

/**
 * Creates an html element for the button and shows it in the relevant side bar. It also attaches an 'onclick' event listener to the html element which passes the button it self to showChildButtonsOrPrayers()
 * @param {Button} btn  - the button that will be displayed as an html element in the side bar
 * @param {HTMLElement} btnsBar  - the side bar where the button will be displayed
 * @param {string} btnClass  - the class that will be given to the button (it is usually the cssClass property of the button)
 * @param {boolean} clear - a boolean indicating whether or not the text already displayed (in containerDiv) should be cleared when the button is clicked. This parameter will only work (i.e., will be useful) if the onClick parameter is missing, because in this case the onClick parameter is set to showChildButtonsOrPrayers(), and clear is passed to it as a parameter. Otherwise, it is the function passed as the onClick paramater that will be called.
 * @param {Function} onClick - this is the function that will be attached to the 'click' eventListner of the button, and will be called when it is clicked
 * @returns {HTMLElement} - the html element created for the button
 */
function createBtn(
  btn: Button,
  btnsBar: HTMLElement,
  btnClass?: string,
  clear: boolean = true,
  onClick?:Function,
): HTMLElement {
  let newBtn: HTMLElement = document.createElement("button");
  btnClass
    ? newBtn.classList.add(btnClass)
    : newBtn.classList.add(btn.cssClass);
  newBtn.id = btn.btnID;
  //Adding the labels to the button
  for (let lang in btn.label) {
    if (!btn.label[lang]) continue;
    //for each language in btn.text, we create a new "p" element
      let btnLable = document.createElement("p");
      //we edit the p element by adding its innerText (=btn.text[lang], and its class)
      editBtnInnerText(btnLable, btn.label[lang], "btnLable" + lang);
      //we append the "p" element  to the newBtn button
      newBtn.appendChild(btnLable);
  }
  btnsBar.appendChild(newBtn);
//If no onClick parameter/argument is passed to createBtn(), and the btn has any of the following properties: children/prayers/onClick or inlinBtns, we set the onClick parameter to a function passing the btn to showChildButtonsOrPrayers
  if(!onClick && (btn.children || btn.prayersSequence || btn.onClick || btn.inlineBtns)) onClick = () => showChildButtonsOrPrayers(btn, clear);
//Else, it is the onClick parametr that will be attached to the eventListner
    newBtn.addEventListener("click", (e) => {
      e.preventDefault;
      onClick();
    });
  
  function editBtnInnerText(el: HTMLElement, text: string, btnClass?: string) {
    el.innerText = text;
    el.classList.add("btnText");
    if (btnClass) {
      el.classList.add(btnClass);
    }
  }
  return newBtn;
}

/** */
function PWA() {
  /** */
  function getPWADisplayMode() {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (document.referrer.startsWith("android-app://")) {
      return "twa";
      //@ts-ignore
    } else if (navigator.standalone || isStandalone) {
      return "standalone";
    }
    return "browser";
  }
}

function registerServiceWorker() {
  const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
        }
      } catch (error) {
        console.error(`Registration failed with ${error}`);
      }
    }
  };
}

/**
 * returns a string[][], each string[] element includes 2 elements: the current coptic date (as as string formatted like "DDMM") and the corresponding readings date if any (also formatted as "DDMM").
 * @returns {string[][]}
 */
function getCopticReadingsDates(): string[][] {
  return [
    ["1903", "1307"],
    ["1301", "1703"],
    ["1101", "2708"],
    ["0901", "2803"],
    ["0501", "3005"],
    ["1001", "3005"],
    ["1508", "0105"],
    ["1907", "0105"],
    ["2005", "0105"],
    ["2209", "0105"],
    ["2510", "0105"],
    ["2908", "0105"],
    ["0110", "0105"],
    ["0309", "0105"],
    ["0611", "0105"],
    ["1501", "0105"],
    ["2401", "0105"],
    ["2602", "0105"],
    ["1612", "0109"],
    ["2105", "0109"],
    ["2110", "0109"],
    ["0304", "0109"],
    ["2504", "0206"],
    ["0704", "0206"],
    ["0711", "0206"],
    ["2002", "0206"],
    ["3006", "0210"],
    ["1208", "0311"],
    ["1303", "0311"],
    ["1812", "0311"],
    ["2207", "0311"],
    ["2810", "0311"],
    ["3003", "0311"],
    ["3009", "0311"],
    ["0103", "0311"],
    ["0202", "0311"],
    ["0205", "0311"],
    ["0308", "0311"],
    ["0701", "0311"],
    ["0706", "0311"],
    ["0709", "0311"],
    ["0805", "0311"],
    ["1102", "0311"],
    ["1702", "0311"],
    ["1409", "0312"],
    ["1511", "0312"],
    ["1704", "0312"],
    ["2109", "0312"],
    ["2410", "0312"],
    ["2909", "0312"],
    ["0209", "0312"],
    ["0906", "0312"],
    ["1401", "0312"],
    ["1310", "0313"],
    ["1608", "0405"],
    ["1609", "0405"],
    ["1611", "0405"],
    ["2404", "0405"],
    ["2906", "0405"],
    ["1708", "0511"],
    ["1803", "0511"],
    ["1811", "0511"],
    ["2104", "0511"],
    ["2106", "0511"],
    ["2911", "0511"],
    ["0404", "0511"],
    ["0807", "0511"],
    ["1006", "0511"],
    ["0604", "0605"],
    ["0806", "0605"],
    ["1505", "0801"],
    ["2004", "0801"],
    ["2010", "0801"],
    ["2212", "0801"],
    ["2307", "0801"],
    ["2606", "0801"],
    ["2610", "0801"],
    ["2611", "0801"],
    ["0401", "0801"],
    ["0412", "0801"],
    ["0504", "0801"],
    ["0508", "0801"],
    ["0509", "0801"],
    ["0601", "0801"],
    ["0708", "0801"],
    ["0910", "0801"],
    ["2102", "0801"],
    ["2501", "0801"],
    ["0106", "0903"],
    ["0303", "0903"],
    ["0407", "0903"],
    ["1201", "0903"],
    ["0812", "1009"],
    ["1509", "1202"],
    ["1210", "1203"],
    ["2111", "1307"],
    ["0402", "1307"],
    ["0403", "1307"],
    ["0804", "1307"],
    ["1002", "1307"],
    ["2107", "1312"],
    ["2507", "1402"],
    ["1211", "1503"],
    ["1510", "1503"],
    ["2411", "1503"],
    ["2805", "1503"],
    ["0112", "1503"],
    ["0410", "1503"],
    ["0411", "1503"],
    ["0606", "1503"],
    ["0912", "1503"],
    ["2807", "1601"],
    ["0909", "1601"],
    ["1104", "1610"],
    ["1506", "1610"],
    ["1603", "1610"],
    ["1705", "1610"],
    ["0204", "1610"],
    ["1007", "1701"],
    ["1212", "1701"],
    ["1209", "1703"],
    ["1406", "1703"],
    ["1412", "1703"],
    ["1504", "1703"],
    ["1806", "1703"],
    ["2103", "1703"],
    ["2706", "1703"],
    ["2809", "1703"],
    ["0104", "1703"],
    ["0302", "1703"],
    ["0502", "1703"],
    ["0603", "1703"],
    ["0705", "1703"],
    ["0902", "1703"],
    ["3001", "1705"],
    ["1008", "2009"],
    ["1206", "2009"],
    ["1405", "2009"],
    ["1906", "2009"],
    ["2505", "2009"],
    ["2910", "2009"],
    ["0108", "2009"],
    ["0306", "2009"],
    ["0702", "2009"],
    ["0703", "2009"],
    ["0907", "2009"],
    ["1204", "2009"],
    ["1302", "2009"],
    ["2502", "2009"],
    ["1807", "2011"],
    ["2008", "2011"],
    ["2408", "2011"],
    ["2506", "2011"],
    ["2608", "2011"],
    ["2806", "2011"],
    ["0208", "2011"],
    ["0610", "2011"],
    ["1502", "2011"],
    ["1902", "2011"],
    ["1107", "2101"],
    ["1407", "2101"],
    ["2301", "2101"],
    ["1804", "2202"],
    ["0406", "2202"],
    ["1010", "2203"],
    ["1308", "2203"],
    ["1905", "2203"],
    ["1911", "2203"],
    ["2012", "2203"],
    ["2210", "2203"],
    ["2603", "2203"],
    ["3011", "2203"],
    ["0107", "2203"],
    ["0408", "2203"],
    ["0707", "2203"],
    ["2701", "2203"],
    ["2801", "2203"],
    ["3007", "2204"],
    ["1309", "2205"],
    ["1710", "2205"],
    ["1909", "2205"],
    ["2310", "2205"],
    ["0510", "2205"],
    ["0904", "2205"],
    ["0908", "2205"],
    ["2402", "2205"],
    ["1910", "2308"],
    ["2312", "2308"],
    ["2711", "2308"],
    ["2712", "2308"],
    ["0609", "2308"],
    ["0710", "2308"],
    ["0809", "2308"],
    ["0703", "2308"],
    ["0810", "2409"],
    ["2509", "2503"],
    ["2511", "2503"],
    ["2808", "2503"],
    ["0505", "2503"],
    ["0802", "2503"],
    ["2802", "2503"],
    ["1103", "2601"],
    ["1304", "2601"],
    ["1606", "2601"],
    ["0712", "2601"],
    ["0512", "2605"],
    ["1411", "2702"],
    ["1809", "2702"],
    ["1912", "2702"],
    ["2707", "2702"],
    ["0506", "2702"],
    ["0811", "2702"],
    ["0905", "2702"],
    ["1604", "2703"],
    ["2311", "2703"],
    ["0503", "2703"],
    ["0607", "2703"],
    ["1012", "2703"],
    ["2902", "2703"],
    ["1110", "2708"],
    ["1306", "2708"],
    ["1404", "2708"],
    ["1605", "2708"],
    ["1706", "2708"],
    ["1808", "2708"],
    ["2211", "2708"],
    ["2306", "2708"],
    ["2705", "2708"],
    ["1111", "2708"],
    ["2201", "2708"],
    ["1101", "2708"],
    ["2201", "2708"],
    ["1004", "2803"],
    ["1109", "2803"],
    ["1311", "2803"],
    ["1403", "2803"],
    ["1410", "2803"],
    ["1707", "2803"],
    ["1709", "2803"],
    ["1805", "2803"],
    ["1904", "2803"],
    ["1908", "2803"],
    ["2206", "2803"],
    ["2303", "2803"],
    ["2305", "2803"],
    ["2406", "2803"],
    ["2412", "2803"],
    ["2704", "2803"],
    ["2709", "2803"],
    ["0207", "2803"],
    ["0310", "2803"],
    ["0507", "2803"],
    ["0513", "2803"],
    ["1011", "2803"],
    ["1112", "2803"],
    ["2302", "2803"],
    ["1106", "2903"],
    ["1207", "2903"],
    ["1408", "2903"],
    ["1607", "2903"],
    ["2006", "2903"],
    ["2007", "2903"],
    ["2208", "2903"],
    ["2407", "2903"],
    ["0203", "2903"],
    ["0307", "2903"],
    ["0409", "2903"],
    ["1602", "2903"],
    ["1802", "2903"],
    ["1810", "2905"],
    ["1003", "3005"],
    ["1108", "3005"],
    ["1507", "3005"],
    ["1512", "3005"],
    ["1711", "3005"],
    ["2121", "3005"],
    ["2405", "3005"],
    ["2508", "3005"],
    ["2604", "3005"],
    ["2607", "3005"],
    ["2811", "3005"],
    ["2905", "3005"],
    ["0102", "3005"],
    ["0212", "3005"],
    ["0602", "3005"],
    ["0608", "3005"],
    ["0612", "3005"],
    ["0808", "3005"],
    ["2001", "3005"],
    ["2901", "3005"],
    ["0211", "3008"],
    ["2003", "3008"],
    ["2309", "3008"],
    ["2710", "3008"],
    ["0111", "3008"],
    ["0911", "3008"],
    ["3002", "3008"],
    ["0301", "0311"],
  ];
}

function toggleSideBars() {
  if (
    leftSideBar.classList.contains("extended") &&
    rightSideBar.classList.contains("collapsed")
  ) {
    closeSideBar(leftSideBar);
  } else if (
    rightSideBar.classList.contains("extended") &&
    leftSideBar.classList.contains("collapsed")
  ) {
    closeSideBar(rightSideBar);
  } else if (
    leftSideBar.classList.contains("collapsed") &&
    leftSideBar.classList.contains("collapsed")
  ) {
    openSideBar(leftSideBar);
  }
}

/**
 * Opens the side bar by setting its width to a given value
 * @param {HTMLElement} sideBar - the html element representing the side bar that needs to be opened
 */
async function openSideBar(sideBar: HTMLElement) {
  let btnText: string = String.fromCharCode(9776) + "Close Sidebar";
  let closeBtn = sideBar.querySelector('.closebtn') as HTMLElement;
  let width: string = "40%";
  if (sideBar === rightSideBar)
    {closeBtn.style.left = '10px'; width = '50%'};

  sideBar.style.width = width;
  sideBar.classList.remove("collapsed");
  sideBar.classList.add("extended");
  sideBarBtn.innerText = btnText;
  sideBarBtn.removeEventListener("click", (ev) => {
    ev.preventDefault;
    openSideBar(sideBar);
  });
  sideBarBtn.addEventListener("click", (ev) => {
    ev.preventDefault;
    closeSideBar(sideBar);
  });
}

/**
 * Removes a script (found by its id), and reloads it by appending it to the body of the document
 *@param {string[]} scriptIDs - the ids if the scripts that will be removed and reloaded as child of the body
 */
function reloadScriptToBody(scriptIDs: string[]) {
  let old: HTMLScriptElement, copy: HTMLScriptElement;
  scriptIDs.forEach(id =>
  {
    old = document.getElementById(id) as HTMLScriptElement;
    copy = document.createElement('script');
    copy.id = old.id;
    copy.src = old.src;
    copy.type = old.type;
    old.remove();
    document.getElementsByTagName('body')[0].appendChild(copy);
  }
    )
}

/**
 * Closes the side bar passed to it by setting its width to 0px
 * @param {HTMLElement} sideBar - the html element representing the side bar to be closed
 */
async function closeSideBar(sideBar: HTMLElement) {
  //let btnText: string = String.fromCharCode(9776) + "Open Sidebar";
  let width: string = "0px";
  sideBar.style.width = width;
  sideBar.classList.remove("extended");
  sideBar.classList.add("collapsed");
  //sideBarBtn.innerText = btnText;
  sideBarBtn.removeEventListener("click", (ev) => {
    ev.preventDefault;
    closeSideBar(sideBar);
  });
  sideBarBtn.addEventListener("click", (ev) => {
    ev.preventDefault;
    openSideBar(sideBar);
  });
}
/**
 * Detects whether the user swiped his fingers on the screen, and opens or closes teh right or left side bars accordingly
 */
function DetectFingerSwipe() {
  //Add finger swipe event
  let xDown = null;
  let yDown = null;
  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchmove", handleTouchMove, false);


  function handleTouchStart(evt: TouchEvent) {
    const firstTouch: Touch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  }

  function handleTouchMove(evt: TouchEvent) {
    evt.preventDefault;
    if (!xDown || !yDown)  return;

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      console.log('xDiff = ', xDiff, 'yDiff = ', yDiff)
      /*most significant*/
      if (xDiff > 10) {
        /* right to left swipe */
        console.log('xDiff = ', xDiff)
        if (
          leftSideBar.classList.contains("extended") &&
          rightSideBar.classList.contains("collapsed")
        ) {
          closeSideBar(leftSideBar);
        } else if (
          rightSideBar.classList.contains("collapsed") &&
          leftSideBar.classList.contains("collapsed")
        ) {
          openSideBar(rightSideBar);
        }
      } else if (xDiff < -10) {
        /* left to right swipe */
        console.log('xDiff = ', xDiff)
        if (
          leftSideBar.classList.contains("collapsed") &&
          rightSideBar.classList.contains("collapsed")
        ) {
          openSideBar(leftSideBar);
        } else if (
          rightSideBar.classList.contains("extended") &&
          leftSideBar.classList.contains("collapsed")
        ) {
          closeSideBar(rightSideBar);
        }
      }
    } else {
      if (yDiff > 0) {
        /* down swipe */
      } else {
        /* up swipe */
      }
    }
    /* reset values */
    xDown = null;
    yDown = null;
  }
}
/**
 * Takes an Html Element and looks for all the other elements having the same "lang" attribute as the Html element passed to it, then it checks if the size of text is amplified or not: if already amplified, it reduces it, if not, it amplifies it
 * @param {HTMLElement} target - the Html element containing the text which we will be amplified together with all the text with the same language
 * @param {string} myClass - the name of the CSS class that will be applied to amplify the text
 */
function toggleAmplifyText(target:HTMLElement, myClass: string) {
  if (localStorage.displayMode === displayModes[1]) {
    //If we are in the "Presentation" Mode, we will not amplify or reduce the text, we will open or close the left side bar
    toggleSideBars();
    return
  }
  let amplified:[[string, boolean]] = JSON.parse(localStorage.textAmplified);
  let selector: string = 'p[lang="' + target.lang + '"]';
  let sameLang = containerDiv.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  sameLang.forEach((p) => {
    p.classList.toggle(myClass);
    Array.from(p.children).forEach(child => child.classList.toggle(myClass));
  });
  if (target.classList.contains(myClass)) {
    //it means that the class was added (not removed) when the user dbl clicked 
    amplified.filter(el => el[0] === target.lang.toUpperCase())[0][1] = true;
  } else {
    amplified.filter(el => el[0] === target.lang.toUpperCase())[0][1] = false;
  }
  localStorage.textAmplified = JSON.stringify(amplified);
}

/**
 * This function is meant to create a side bar on the fly. we are not using it anymore. It will be deprecated.
 * @param id
 * @returns
 */
function buildSideBar(id: string) {
  let sideBar: HTMLElement = document.createElement("div");
  let btnsDiv: HTMLElement = document.createElement("div");
  let a: HTMLElement = document.createElement("a");

  sideBar.id = id;
  sideBar.classList.add(id);
  sideBar.classList.add("sideBar");
  sideBar.classList.add("collapsed");

  a.innerText = "&times";
  a.setAttribute("href", "javascript:void(0)");
  a.classList.add("closebtn");
  a.addEventListener("click", (e) => {
    e.preventDefault;
    closeSideBar(sideBar);
  });
  sideBar.appendChild(a);
  btnsDiv.id = "sideBarBtns";
  sideBar.appendChild(btnsDiv);
  if (id === "leftSideBar") {
    //leftSideBar = sideBar
  } else if (id === "rightSideBar") {
    //rightSideBar = sideBar
  }
  return sideBar;
}
/**
 * This function takes an string[][] representing a Word table (where each each string[][] represents a row of the table, and has as a 1st string element the title of the Word table. Each next string element represents the text of the each cell of the row in a given language.
 * @param {Button} btn
 * @param {boolean} clearContent - tells wether the containerDiv content needs to be cleared
 *  @param {Boolean} clearSideBar - tells wether the right sideBar needs to be cleared
 * @param {HTMLElement|{beforeOrAfter:insertPosition, el:HtmlElement}} position - if it is an HTML Element, the newly created divs will be appended to this html element. If it is an object, the newly created divs will be placed in the position provided (the position is of type insertPosition) by the beforeOrAfter property, in relation to the html element provied in the el property
 */
async function showPrayers(
  btn: Button,
  clearContent = true,
  clearRightSideBar: boolean = true,
  position:
    { el: HTMLElement; beforeOrAfter: InsertPosition }
    | HTMLElement | DocumentFragment = containerDiv 
) {
  if (btn.btnID != btnGoBack.btnID && btn.btnID != btnMain.btnID) closeSideBar(leftSideBar);
  if (clearContent) containerDiv.innerHTML = "";
  if (clearRightSideBar) rightSideBar.querySelector("#sideBarBtns").innerHTML = "";
   //this is the right side bar where the titles are displayed for navigation purposes
  btn.prayersSequence.map((p) => {
    if (!p) return;
 
    let date: string;
    if (p.includes("&D=") || p.includes("&S=")) {
      //if the id of the prayer includes the value '&D=' this tells us that this prayer is either not linked to a specific day in the coptic calendar (&D=), or the date has been set by the button function (e.g.: PrayerGospelResponse&D=GLWeek). In this case, we will not add the copticReadingsDate to the prayerID
      //Similarly, if the id includes '&S=', it tells us that it is not linked to a specific date but to a given period of the year. We also keep the id as is without adding any date to it
      date = "";
    } else {
      date = "&D=" + copticReadingsDate; //this is the default case where the date equals the copticReadingsDate. This works for most of the occasions.
    }
    p += date;
    let wordTable = findPrayerInBtnPrayersArray(p, btn);
    if (wordTable) {
      wordTable.map((row) => {
        createHtmlElementForPrayer(
          row,
          btn.languages,
          JSON.parse(localStorage.userLanguages),
          position
        ); //row[0] is the title of the table modified as the case may be to reflect wether the row contains the titles of the prayer, or who chants the prayer (in such case the words 'Title' or '&C=' + 'Priest', 'Diacon', or 'Assembly' are added to the title)
      });
      return;
    }
  });
}

/**
 * Sets the number of columns and their widths for the provided list of html elements which style display property = 'grid'
 * @param {NodeListOf<Element>} Rows - The html elements for which we will set the css. These are usually the div children of containerDiv
 */
async function setCSSGridTemplate(Rows: NodeListOf<Element> | HTMLElement[]) {
  if (!Rows) return;

  let plusSign = String.fromCharCode(plusCharCode), minusSign = String.fromCharCode(plusCharCode + 1);

  Rows.forEach(
    (row: HTMLElement) => {
      //Setting the number of columns and their width for each element having the 'Row' class for each Display Mode
      if (localStorage.displayMode === displayModes[0]) {
        row.style.gridTemplateColumns = getColumnsNumberAndWidth(row);
        //Defining grid areas for each language in order to be able to control the order in which the languages are displayed (Arabic always on the last column from left to right, and Coptic on the first column from left to right)
        row.style.gridTemplateAreas = setGridAreas(row);
      };
    
      if (localStorage.displayMode === displayModes[1]) {
        return;
      };

      if (row.classList.contains('TitleRow')
        || row.classList.contains('SubTitle')) {
        //This is the div where the titles of the prayer are displayed. We will add an 'on click' listner that will collapse the prayers
        row.role = "button";
        let defLangParag = row.querySelector('p[lang="' + defaultLanguage.toLowerCase() + '"]') as HTMLElement;
        if (!defLangParag) defLangParag = row.lastElementChild as HTMLElement;
        if (!defLangParag) return console.log('no paragraph with lang= ' + defaultLanguage);
        if (!row.dataset.isCollapsed) row.dataset.isCollapsed = 'false'; //If row doesn't have data-is-collapsed attribute, we add it and set it to 'false' which means that the title is not collapsed
        if (defLangParag.textContent.includes(plusSign + ' ')) defLangParag.textContent = defLangParag.textContent.replace(plusSign + ' ', '');//We remove the + sign in the begining (if it exists)
        if (defLangParag.textContent.includes(minusSign + ' ')) defLangParag.textContent = defLangParag.textContent.replace(minusSign + ' ', ''); //We remove the minus (-) sign from the begining of the paragraph
        if (row.dataset.isCollapsed === 'true') defLangParag.innerText =
          plusSign + " " + defLangParag.innerText; //We add the plus (+) sign at the begining
        if (row.dataset.isCollapsed === 'false') defLangParag.innerText =
          minusSign + " " + defLangParag.innerText;//We add the minus (-) sig at the begining;
        if (row.classList.contains('TitleRow'))addDataGroupsToContainerChildren(undefined, 'TitleRow', row);
        if (row.classList.contains('SubTitle')) addDataGroupsToContainerChildren(undefined, 'SubTitle', row);
      } else {
        replaceEigthNote(undefined, Array.from(row.querySelectorAll('p')));
        };
    });
};

  /**
   * Returns a string indicating the number of columns and their widths
   * @param {HTMLElement} row - the html element created to show the text representing a row in the Word table from which the text of the prayer was taken (the text is provided as a string[] where the 1st element is the tabel's id and the other elements represent each the text in a given language)
   * @returns  {string} - a string represneting the value that will be given to the grid-template-columns of the row
   */
  function getColumnsNumberAndWidth(row: HTMLElement) {
    let width: string = (100 / row.children.length).toString() + "% ";
    return width.repeat(row.children.length);
  }

  /**
   * Returns a string representing the grid areas for an html element with a 'display:grid' property, based on the "lang" attribute of its children
   * @param {HTMLElement} row - an html element having children and each child has a "lang" attribute
   * @returns {string} representing the grid areas based on the "lang" attribute of the html element children
   */
  function setGridAreas(row: HTMLElement): string {
    if (localStorage.displayMode === displayModes[1]) return;
    let areas: string[] = [],
      child: HTMLElement;
    for (let i = 0; i < row.children.length; i++) {
      child = row.children[i] as HTMLElement;
      areas.push(child.lang.toUpperCase());
    }
    if (
      areas.indexOf(defaultLanguage) === 0 &&
      !row.classList.contains("Comments") &&
      !row.classList.contains("CommentText")
    ) {
      //if the 'AR' is the first language, it means it will be displayed in the first column from left to right. We need to reverse the array in order to have the Arabic language on the last column from left to right
      areas.reverse();
    }
    return '"' + areas.toString().split(",").join(" ") + '"'; //we should get a string like ' "AR COP FR" ' (notice that the string marks " in the beginning and the end must appear, otherwise the grid-template-areas value will not be valid)
};

async function applyAmplifiedText(container: NodeListOf<Element>) {
  if (localStorage.displayMode === displayModes[1]) return;
  new Map(JSON.parse(localStorage.textAmplified)).forEach((value, key) => {
    if (value == true) {
      Array.from(container)
        .filter((el) => el.getAttribute("lang") === String(key).toLowerCase())
        .forEach((el) => {
          el.classList.add("amplifiedText");
          Array.from(el.children)
            .forEach(child => child.classList.add("amplifiedText"))
        });
    }
  });
}
async function setButtonsPrayers() {
  for (let i = 0; i < btns.length; i++) {
    btnsPrayers.push([btns[i].btnID, ...(await btns[i].onClick())]);
    btns[i].retrieved = true;
  }
  console.log("Buttons prayers were set");
  return btnsPrayers;
}
/**
 * Hides all the nextElementSiblings of the element, if the nextElementSibling classList does not include 'TitleRow'. It does this by toggeling the "display" property of the html elements
 * @param {HTMLElement} element - the html element which nextElementSiblings display property will be toggled between 'none' and 'grid'
 */
function collapseText(titleRow: HTMLElement, container:HTMLElement=containerDiv) {
  container.querySelectorAll('div[data-group="' + titleRow.dataset.root + '"]')
    .forEach((div: HTMLDivElement) => {
      if(div !== titleRow) div.classList.toggle('collapsedTitle')
    });
  togglePlusAndMinusSignsForTitles(titleRow);
};

/**
 * Toggels the minus and plus signs in the Title 
 * @param {HTMLElement} titleRow - the html element (usually a div with class 'TitleRow') that we wqnt to toggle the minus or plus signs according to whether the text is collapsed or not
 * @returns 
 */
async function togglePlusAndMinusSignsForTitles(titleRow: HTMLElement, plusCode:number = plusCharCode) {
  if (!titleRow.children) return;
  let parag: HTMLElement;
  parag = Array.from(titleRow.children)
    .filter(child=>
            child.textContent.startsWith(String.fromCharCode(plusCode))
      || child.textContent.startsWith(String.fromCharCode(plusCode+1))
  )[0] as HTMLElement;
  if (!parag) return;
  if (parag.textContent.includes(String.fromCharCode(plusCode))) {
    titleRow.dataset.isCollapsed = 'false';
    parag.innerText = parag.innerText.replace(
      String.fromCharCode(plusCode),
      String.fromCharCode(plusCode+1)
    );
  } else if (parag.textContent.includes(String.fromCharCode(plusCode+1))
  ) {
    titleRow.dataset.isCollapsed = 'true';
    parag.innerText = parag.innerText.replace(
      String.fromCharCode(plusCode+1),
      String.fromCharCode(plusCode)
    );
   }
 }

/**
 * Collapses all the tiltes (i.e. all the divs with class 'TitleRow' or 'SubTitle') in the html element passed as argument
 * @param {HTMLElement} container - the html element in which we will collapse all the divs having as class 'TitleRow' or 'SubTitle'
 */
 function collapseAllTitles(container:HTMLElement | DocumentFragment){
  container.querySelectorAll('div')
    .forEach(row => {
      if (!row.classList.contains('TitleRow')
        && !row.classList.contains('SubTitle')){
        row.classList.add('collapsedTitle');
      } else {
        row.dataset.isCollapsed = 'true';
        togglePlusAndMinusSignsForTitles(row);
      }
    });
  }

/**
 *
 * @param {string[][][]} selectedPrayers - An array containing the optional prayers for which we want to display html button elements in order for the user to choose which one to show
 * @param {Button} btn
 * @param {HTMLElement} btnsDiv - The html element in which each prayer will be displayed when the user clicks an inline button representing this prayer
 * @param {Object{AR:string, FR:'string'}} btnLabels - An object containing the labels of the master button that the user will click to show a list of buttons, each representing a prayer in selectedPrayers[]
 * @param {string} masterBtnID - The id of the master button
 */
async function showInlineButtonsForOptionalPrayers(
  selectedPrayers: string[][][],
  btn: Button,
  masterBtnDiv: HTMLElement,
  btnLabels: { defaultLanguage: string, foreignLanguage: string },
  masterBtnID: string
) {
  let prayersMasterBtn: Button, next: Button;

  //Creating a new Button to which we will attach as many inlineBtns as there are optional prayers suitable for the day (if it is a feast or if it falls during a Season)
  prayersMasterBtn = new Button({
    btnID: masterBtnID,
    label: btnLabels,
    inlineBtns: await createInlineBtns(), //The inlineBtns are not added immediately, they are added later by createInlineBtns() below
    pursue: false, //Important! we must keep it false in order to stop the showChildButtonsOrPrayers() from continuing the execution after calling the onClick() property of the master button. Otherwise, this will show again the inlineButtons of the master button
    cssClass: inlineBtnClass,
    onClick: () => {
      let groupOfNumber: number = 4;
      //We show the inlineBtnsDiv (bringing it in front of the containerDiv by giving it a zIndex = 3)
      showInlineBtns(masterBtnID, true);
      //When the prayersMasterBtn is clicked, it will create a new div element to which it will append html buttons element for each inlineBtn in its inlineBtns[] property
      let newDiv = document.createElement("div");
      newDiv.id = masterBtnID + "Container";
      //Customizing the style of newDiv
      newDiv.classList.add("inlineBtns");
      //We set the gridTemplateColumns of newDiv to a grid of 3 columns. The inline buttons will be displayed in rows of 3 inline buttons each
      newDiv.style.gridTemplateColumns = (String((100/groupOfNumber)*2) + '% ').repeat(groupOfNumber/2) ;
      //We append newDiv  to inlineBtnsDiv before appending the 'next' button, in order for the "next" html button to appear at the buttom of the inlineBtnsDiv. Notice that inlineBtnsDiv is a div having a 'fixed' position, a z-index = 3 (set by the showInlineBtns() function that we called). It hence remains visible in front of, and hides the other page's html elements in the containerDiv
      inlineBtnsDiv.appendChild(newDiv);

      inlineBtnsDiv.style.borderRadius = "10px";
      let startAt: number = 0;
      //We call showGroupOfSisxPrayers() starting at inlineBtns[0]
      showGroupOfNumberOfPrayers(startAt, newDiv, groupOfNumber);
    },
  });
  function showGroupOfNumberOfPrayers(startAt: number, newDiv: HTMLDivElement, groupOfNumber: number) {
    //We set next to undefined, in case it was created before
    next = undefined;
          //if the number of prayers is > than the groupOfNumber AND the remaining prayers are >0 then we show the next button
    if (prayersMasterBtn.inlineBtns.length > groupOfNumber
      && prayersMasterBtn.inlineBtns.length - startAt > groupOfNumber) {
            //We create the "next" Button only if there is more than 6 inlineBtns in the prayersBtn.inlineBtns[] property
            next = new Button({
              btnID: "btnNext",
              label: { defaultLanguage: "التالي", foreignLanguage: "Suivants" },
              cssClass: inlineBtnClass,
              onClick: () => {
                //When next is clicked, we remove all the html buttons displayed in newDiv (we empty newDiv)
                newDiv.innerHTML = "";
                //We then remove the "next" html button itself (the "next" button is appended to inlineBtnsDiv directly not to newDiv)
                inlineBtnsDiv.querySelector('#' + next.btnID).remove();
                //We set the starting index for the next 6 inline buttons
                startAt += groupOfNumber;
                //We call showGroupOfSixPrayers() with the new startAt index
                showGroupOfNumberOfPrayers(startAt, newDiv, groupOfNumber);
              }
            });
              createBtn(next, inlineBtnsDiv, next.cssClass, false, next.onClick).classList.add("centeredBtn") //notice that we are appending next to inlineBtnsDiv directly not to newDiv (because newDiv has a display = 'grid' of 3 columns. If we append to it, 'next' button will be placed in the 1st cell of the last row. It will not be centered). Notice also that we are setting the 'clear' argument of createBtn() to false in order to prevent removing the 'Go Back' button when 'next' is passed to showchildButtonsOrPrayers()
    } else {
      next = new Button({
        btnID: "btnNext",
        label: { defaultLanguage: "العودة إلى القداس", foreignLanguage: "Retour à la messe" },
        cssClass: inlineBtnClass,
        onClick: () => {
          //When next is clicked, we remove all the html buttons displayed in newDiv (we empty newDiv)
          hideInlineButtonsDiv();
        }
      });
        createBtn(next, inlineBtnsDiv, next.cssClass, false, next.onClick).classList.add("centeredBtn") //notice that we are appending next to inlineBtnsDiv directly not to newDiv (because newDiv has a display = 'grid' of 3 columns. If we append to it, 'next' button will be placed in the 1st cell of the last row. It will not be centered). Notice also that we are setting the 'clear' argument of createBtn() to false in order to prevent removing the 'Go Back' button when 'next' is passed to showchildButtonsOrPrayers()
      
    }
    
    for (
      let n = startAt;
      n < startAt + groupOfNumber && n < prayersMasterBtn.inlineBtns.length;
      n++
    ) {
      //We create html buttons for the 1st 6 inline buttons and append them to newDiv
      let b = prayersMasterBtn.inlineBtns[n];
      createBtn(b, newDiv, b.cssClass, false, b.onClick);
    }
  }
  //Creating an html button element for prayersMasterBtn and displaying it in btnsDiv (which is an html element passed to the function)
  createBtn(prayersMasterBtn, masterBtnDiv, prayersMasterBtn.cssClass, false, prayersMasterBtn.onClick);
  masterBtnDiv.classList.add("inlineBtns");
  masterBtnDiv.style.gridTemplateColumns = "100%";

  /**
   *Creates a new inlineBtn for each fraction and pushing it to fractionBtn.inlineBtns[]
   */
  async function createInlineBtns() {
    let btns: Button[] = [];
    selectedPrayers.map((prayerTable) => {
      //for each string[][][] representing a table in the Word document from which the text was extracted, we create an inlineButton to display the text of the table
      let inlineBtn: Button = new Button({
        btnID: baseTitle(prayerTable[0][0]), //prayerTable[0] is the 1st row, and prayerTable[0][0] is the 1st element, which represents the title of the table + the cssClass preceded by "&C="
        label: {
          defaultLanguage: prayerTable[0][btn.languages.indexOf(defaultLanguage) + 1], //prayerTable[0] is the first row of the Word table from which the text of the prayer was retrieved. The 1st element of each row contains  the title of the prayer (i.e. the title of the table) + the CSS class of the row, preceded by "&C=". We look for the Arabic title by the index of 'AR' in the btn.languages property. We add 1 to the index because the prayerTable[0][0] is the title of the table as mentioned before
          foreignLanguage: prayerTable[0][btn.languages.indexOf(foreingLanguage) + 1], //same logic and comment as above
        },
        prayersSequence: [baseTitle(prayerTable[0][0])], //this gives the title of the table without '&C=*'
        prayersArray: [[...prayerTable].reverse()], //Notice that we are reversing the order of the array. This is because we are appending the created html element after btnsDiv, we need to start by the last element of prayerTable
        languages: btn.languages, //we keep the languages of the btn since the fraction prayers are retrieved from a table having the same number of columns and same order for the languages
        cssClass: "fractionPrayersBtn",
        children: [...btn.parentBtn.children], //we give it btn as a child in order to show the buttons tree of btn in the leftSideBar menu
        onClick: () => {
          //When the prayer button is clicked, we empty and hide the inlineBtnsDiv
          hideInlineButtonsDiv();
          let displayed =  containerDiv
            .querySelectorAll('div[data-group="optionalPrayer"]')
          if (displayed.length > 0) {              
            displayed.forEach((el) => el.remove());
            }

          showPrayers(inlineBtn, false, false, {
            beforeOrAfter: "afterend",
            el: masterBtnDiv,
          });
          //We will append the newly created html elements after btnsDiv (notice that btnsDiv contains the prayersMasterBtn)
          let createdElements: NodeListOf<Element> =
            containerDiv.querySelectorAll(getDataRootSelector(inlineBtn.prayersSequence[0])
            );
          //We will add to each created element a data-group attribute, which we will use to retrieve these elements and delete them when another inline button is clicked
          createdElements.forEach((el) =>
            el.setAttribute("data-group", "optionalPrayer")
          );
          //We format the grid template of the newly added divs
          setCSSGridTemplate(createdElements);
          //We apply the amplification of text
          applyAmplifiedText(createdElements);
          //We scroll to the button
          createFakeAnchor(masterBtnID);
        },
      });
      btns.push(inlineBtn);
    });
    return btns;
  }
}

/**
 * Takes the title of a Word Table, and loops the button.prayersArray[][][] to check wether an element[0][0] (which reflects a table in the Word document from which the text was retrieved) matches the provided title. If found, it returns the wordTable as a string[][](each array element being a row of the Word table). If dosen't find, it returns 'undefined'
 * @param {string} p - The title of the table that we need to find in the button's prayersArray[][][]. It corresponds to the element[0][0]
 * @param {Button} btn - the Button that we need to search its prayersArray[][][] property for an element[][] having its [0][0] value equal the title of the Word Table
 * @returns {string[][] | undefined} - an array representing the Word Table if found or 'undefined' if not found
 */
function findPrayerInBtnPrayersArray(p: string, btn: Button): string[][] | undefined {
  let tblTitle: string;
  for (let i = 0; i < btn.prayersArray.length; i++) {
    tblTitle = baseTitle(btn.prayersArray[i][0][0]);
    if (
      btn.prayersArray[i][0] && //we check that btn.prayersArray[i] is not an empty array (it might happen as an error when the text is generated by VBA. Although I believe it has been fixed in my VBA code, but just in ase)
      baseTitle(btn.prayersArray[i][0][0]) === p //i.e., if the id of the table = the id of the prayer
    ) {
      return btn.prayersArray[i]; //we return the array representing the Word table (this array is a string[][], each of its elements is a string[] representing a row in the Word table)
    }
  }
}
/**
 * Shows the inlineBtnsDiv
 * @param {string} status - a string that is added as a dataset (data-status) to indicated the context in which the inlineBtns div is displayed (settings pannel, optional prayers, etc.)
 * @param {boolean} clear - indicates whether the content of the inlineBtns div should be cleared when shwoInlineBtns is called. Its value is set to 'false' by default
 */
function showInlineBtns(status: string, clear: boolean = false) {
  if (clear) {
    inlineBtnsDiv.innerHTML = "";
  }

  inlineBtnsDiv.style.backgroundImage = 'url(./assets/PageBackgroundCross.jpg)';
  inlineBtnsDiv.style.backgroundSize = '10%';
  inlineBtnsDiv.style.backgroundRepeat = 'repeat';

  /**
   * Appending an X button on the top right of inlineBtnsDiv
   */
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
      hideInlineButtonsDiv();
    });
    inlineBtnsDiv.appendChild(close);
  })();
  inlineBtnsDiv.dataset.status = status; //giving the inlineBtnsDiv a data-status attribute
  inlineBtnsDiv.style.display = 'grid';
}
/**
 * hides the inlineBtnsDiv by setting its zIndex to -1
 */
function hideInlineButtonsDiv() {
  inlineBtnsDiv.dataset.status = "inlineButtons";
  inlineBtnsDiv.innerHTML = "";
  inlineBtnsDiv.style.display = 'none';
}

function showSettingsPanel() {
  showInlineBtns("settingsPanel", true);
  let btn: HTMLElement;
  //Show current version



  

    if (!inlineBtnsDiv.querySelector('#dateDiv'))
    inlineBtnsDiv.appendChild(showDates().cloneNode()) as HTMLElement;


  //Show InstallPWA button//We are not calling it any more
  function installPWA() {
    btn = createBtn(
      "button",
      "button",
      "settingsBtn",
      "Install PWA",
      inlineBtnsDiv,
      "InstallPWA",
      undefined,
      undefined,
      undefined,
      undefined,
      {
        event: "click",
        fun: async () => {
          // Initialize deferredPrompt for use later to show browser install prompt.
          let deferredPrompt;
          window.addEventListener("beforeinstallprompt", (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = e;
          });
          // Update UI notify the user they can install the PWA
          (async () => {
            window.dispatchEvent(new Event("beforeinstallprompt"));
            deferredPrompt.prompt;
            // Optionally, send analytics event that PWA install promo was shown.
            console.log(`'beforeinstallprompt' event was fired.`);
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            // Optionally, send analytics event with outcome of user choice
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again, throw it away
            deferredPrompt = null;
          })();
          function getPWADisplayMode() {
            const isStandalone = window.matchMedia(
              "(display-mode: standalone)"
            ).matches;
            if (document.referrer.startsWith("android-app://")) {
              return "twa";
              //@ts-ignore
            } else if (navigator.standalone || isStandalone) {
              return "standalone";
            }
            return "browser";
          }
        },
      }
    );
  };

  //Appending date picker
  (function showDatePicker() {
    let datePicker: HTMLInputElement = createBtn(
      "input",
      undefined,
      undefined,
      undefined,
      inlineBtnsDiv,
      "datePicker",
      undefined,
      "date",
      undefined,
      undefined,
      {
        event: "change",
        fun: () => changeDate(datePicker.value.toString()),
      }
    ) as HTMLInputElement;
    datePicker.setAttribute("value", todayDate.toString());
    datePicker.setAttribute("min", "1900-01-01");
  })();

  //Appending 'Next Coptic Day' button
  (async function showNextCopticDayButton() {
    let container = document.createElement("div");
    (container.style.display = "grid"),
      (container.style.gridTemplateColumns = String("50%").repeat(2));
    inlineBtnsDiv.appendChild(container);
    btn = createBtn(
      "button",
      "button",
      "settingsBtn",
      "Next Coptic Day",
      container,
      "nextDay",
      undefined,
      "submit",
      undefined,
      undefined,
      { event: "click", fun: () => changeDate(undefined, true, 1) }
    );
    btn.style.backgroundColor = "saddlebrown";
    btn = createBtn(
      "button",
      "button",
      "settingsBtn",
      "Previous Coptic Day",
      container,
      "previousDay",
      undefined,
      "submit",
      undefined,
      undefined,
      { event: "click", fun: () => changeDate(undefined, false, 1) }
    );
    btn.style.backgroundColor = "saddlebrown";
  })();

  let langsContainer = document.createElement("div");
  langsContainer.id = "langsContainer";
  langsContainer.style.display = "grid";
  langsContainer.id = "langsContainer";
  langsContainer.style.justifyItems = "center";
  langsContainer.style.justifySelf = "center";
  inlineBtnsDiv.appendChild(langsContainer);

  //Appending Add or Remove language Buttons
  (async function showAddOrRemoveLanguagesBtns() {
    let parsedUserLanguages: string[] = JSON.parse(localStorage.userLanguages);
    let subContainer = document.createElement("div");
    subContainer.style.display = "grid";
    subContainer.style.gridTemplateColumns = String("30% ").repeat(3);
    subContainer.style.justifyItems = "center";
    langsContainer.appendChild(subContainer);
    allLanguages.map((lang) => {
      let newBtn = createBtn(
        "button",
        "button",
        "settingsBtn",
        lang,
        subContainer,
        "userLang",
        lang,
        undefined,
        undefined,
        undefined,
        {
          event: "click",
          fun: () => {
            modifyUserLanguages(lang);
            newBtn.classList.toggle("langBtnAdd");
            //We retrieve again the displayed text/prayers by recalling the last button clicked
            if (containerDiv.children) {
              //Only if a text is already displayed
              showChildButtonsOrPrayers(lastClickedButton);
              showSettingsPanel(); //we display the settings pannel again
            }
          },
        }
      );
      if (parsedUserLanguages.indexOf(lang) < 0) {
        //The language of the button is absent from userLanguages[], we will give the button the class 'langBtnAdd'
        newBtn.classList.add("langBtnAdd");
      }
    });
  })();

  (async function showExcludeActorButon() {
    let actorsContainer = document.createElement("div");
    actorsContainer.style.display = "grid";
    actorsContainer.style.gridTemplateColumns = String("50%").repeat(2);

    inlineBtnsDiv.appendChild(actorsContainer);
    actors.map((actor) => {
      if (actor.EN === "CommentText") return; //we will not show a button for 'CommentText' class, it will be handled by the 'Comment' button
      let show =  JSON.parse(localStorage.getItem("showActors")).filter(el => el[0].AR === actor.AR)[0][1] as boolean;
      btn = createBtn(
        "button",
        "button",
        "settingsBtn",
        actor[foreingLanguage],
        actorsContainer,
        actor.EN,
        actor.EN,
        undefined,
        undefined,
        undefined,
        {
          event: "click",
          fun: () => {
            show = !show;
            showActors.filter(el=>el[0].EN === actor.EN)[0][1] = show;
            btn.classList.toggle("langBtnAdd");
            //changing the background color of the button to red by adding 'langBtnAdd' as a class
            if (actor.EN === "Comments") {
              showActors.filter(el=>el[0].EN === "CommentText")[0][1] = show;
            } //setting the value of 'CommentText' same as 'Comment'
            localStorage.showActors = JSON.stringify(showActors); //adding the new values to local storage
            if (containerDiv.children) {
              //Only if some prayers text is already displayed
              showChildButtonsOrPrayers(lastClickedButton); //we re-click the last button to refresh the displayed text by adding or removing the actor according to the new setings chice made by the user.
              showSettingsPanel(); //we display the settings pannel again
            }
          },
        }
      );
      if (show === false) {
        btn.classList.add("langBtnAdd");
      }
    });
  })();

  (async function showDisplayModeBtns() {
    let displayContainer = document.createElement("div");
    displayContainer.style.display = "grid";
    displayContainer.style.gridTemplateColumns = String(
      (100 / 3).toString() + "%"
    ).repeat(3);

    inlineBtnsDiv.appendChild(displayContainer);
    displayModes
      .map((mode) => {
        btn = createBtn(
          "button",
          "button",
          "settingsBtn",
          mode + " Display Mode",
          displayContainer,
          mode,
          undefined,
          undefined,
          undefined,
          undefined,
          {
            event: "click",
            fun: () => {
              if (localStorage.displayMode !== mode) {
                localStorage.displayMode = mode;
                Array.from(displayContainer.children).map((btn) => {
                  btn.id !== localStorage.displayMode
                    ? btn.classList.add("langBtnAdd")
                    : btn.classList.remove("langBtnAdd");
                });
              }
            },
          }
        );
        if (mode !== localStorage.displayMode) {
          btn.classList.add("langBtnAdd");
        }
      });
  })();
  (async function showEditingModeBtn() {
    if (localStorage.editingMode != 'true') return
    let displayContainer = document.createElement("div");
    displayContainer.style.display = "grid";
    displayContainer.style.gridTemplateColumns = String(
      (100 / 3).toString() + "%"
    ).repeat(3);

    inlineBtnsDiv.appendChild(displayContainer);
    btn = createBtn(
      "button",
      "button",
      "settingsBtn",
      "Editing Mode",
      displayContainer,
      'editingMode' + localStorage.editingMode.toString(),
      undefined,
      undefined,
      undefined,
      undefined,
      {
        event: "click",
        fun: () => {
          //@ts-ignore
          if (!console.save) addConsoleSaveMethod(console); //We are adding a save method to the console object
          containerDiv.innerHTML = '';
          let editable = [
            'Choose from the list',
            'NewTable',
            'Fun("arrayName", "Table\'s Title")',
            'testEditingArray',
            'PrayersArray',
            'ReadingsArrays.GospelDawnArray',
            'ReadingsArrays.GospelMassArray',
            'ReadingsArrays.GospelNightArray',
            'ReadingsArrays.GospelVespersArray',
            'ReadingsArrays.KatholikonArray',
            'ReadingsArrays.PraxisArray',
            'ReadingsArrays.PropheciesDawnArray',
            'ReadingsArrays.StPaulArray',
            'ReadingsArrays.SynaxariumArray'
          ]
          let select = document.createElement('select'), option: HTMLOptionElement;
          select.style.backgroundColor = 'ivory';
          editable.forEach(name => {
            option = document.createElement('option');
            option.innerText = name;
            option.contentEditable = 'true';
            select.add(option);
          })
          document.getElementById('homeImg').insertAdjacentElement('afterend', select);
          hideInlineButtonsDiv();
          select.addEventListener('change', processSelection)
          function processSelection() {
            let entry = select.selectedOptions[0].innerText;
            if (entry === select.options[0].innerText) return;
            if (entry === 'Fun("arrayName", "Table\'s Title")') entry = prompt('Provide the function and the parameters', entry);
          if (entry.includes('Fun(')) {
            eval(entry);
            return
          }
          
          if (entry) containerDiv.dataset.arrayName = entry;
            let tablesArray: string[][][];
            if (entry === 'NewTable') tablesArray = [[['NewTable&C=Title']]];
            if(!tablesArray) tablesArray = eval(entry);
            if (!tablesArray) return;
          editingMode(tablesArray, getLanguages(entry));
     
          }
        }
      });
  })();

  function createBtn(
    tag: string,
    role: string = tag,
    btnClass: string,
    innerText: string,
    parent: HTMLElement,
    id?: string,
    lang?: string,
    type?: string,
    size?: string,
    backgroundColor?: string,
    onClick?: { event: string; fun: Function }
  ): HTMLElement {
    let btn = document.createElement(tag);
    if (role) {
      btn.role = role;
    }
    if (innerText) {
      btn.innerHTML = innerText;
    }
    if (btnClass) {
      btn.classList.add(btnClass);
    }
    if (id) {
      btn.id = id;
    }
    if (lang) {
      btn.lang = lang.toLowerCase();
    }
    if (type && btn.nodeType) {
      //@ts-ignore
      btn.type = type;
    }
    if (size) {
      //@ts-ignore
      btn.size = size;
    }
    if (backgroundColor) {
      btn.style.backgroundColor = backgroundColor;
    }
    if (onClick) {
      btn.addEventListener(onClick.event, (e) => {
        e.preventDefault;
        onClick.fun();
      });
    }
    if (parent) {
      parent.appendChild(btn);
    }
    return btn;
  }
  //Appending colors keys for actors
  (async function addActorsKeys() {
    let container = document.createElement("div");
    container.id = "actors";
    container.style.display = "grid";
    container.style.gridTemplateColumns = String("33% ").repeat(3);
    inlineBtnsDiv.appendChild(container);
    actors.map((actor) => {
      let newBtn = createBtn(
        "button",
        undefined,
        "colorbtn",
        undefined,
        container,
        actor.EN + 'Color'
      );
      for (let i = 1; i < 4; i++) {
        let p = document.createElement("p");
        p.innerText = actor[Object.keys(actor)[i]];
        newBtn.appendChild(p);
      }
    });
  })();
  closeSideBar(leftSideBar);
}

/**
 * Loops the tables (i.e., the string[][]) of a string[][][] and, for each row (string[]) of each table, it inserts a div adjacent to an html child element to containerDiv
 * @param {string[][][]} tables - an array of arrays, each array represents a table in the Word document from which the text was retrieved
 * @param {string[]} languages - the languages in which the text is available. This is usually the "languages" properety of the button who calls the function
 * @param {{beforeOrAfter:InsertPosition, el: HTMLElement}} position - the position at which the prayers will be inserted, adjacent to an html element (el) in the containerDiv
 * @returns {HTMLElement[]} - an array of all the html div elements created and appended to the containerDiv
 */
function insertPrayersAdjacentToExistingElement(
  tables: string[][][],
  languages: string[],
position: { beforeOrAfter: InsertPosition; el: HTMLElement }
):HTMLElement[]{
  if (!tables) return;
 
  let createdElements: HTMLElement[] = [],
    created: HTMLDivElement
tables.map((table) => {
  if (!table || table.length === 0) return;
table.map((row) => {
created = createHtmlElementForPrayer(
  row, languages, undefined, position);
      if(created) createdElements.push(created)
});
});
  return createdElements
}

/**
 * Inserts buttons each of which redirects to a specific part in a given mass

 * @param {Button[]} btns - an array of Button elements for each of which an html element will be created by createBtn() and appended to a newly created div. Each of the html buttons created will, when clicked
 * @param {InsertPosition} position - the position at which the div containing the created html elements for each button, will be inserted compared to the containerDiv child retrieved using the querySelector parameter
 * @param {string} btnsContainerID - the id of the div container to which the html buttons will be appended. This id may be needed to select the div after redirection
 */
async function insertRedirectionButtons(
  btns: Button[],
  position: { beforeOrAfter: InsertPosition, el: HTMLElement },
  btnsContainerID:string
) {
  if (!position.beforeOrAfter) position.beforeOrAfter = "beforebegin";
  let div = document.createElement("div");
  div.id = btnsContainerID;
  div.classList.add("inlineBtns");
  div.style.gridTemplateColumns = (
    (100 / btns.length).toString() + "% "
  ).repeat(btns.length);
  btns.map((b) => div.appendChild(createBtn(b, div, b.cssClass)));
  position.el.insertAdjacentElement(position.beforeOrAfter, div);
}
/**Was meant to fetch the Arabic Synaxarium text but didn't work for CORS issue on the api */
async function fetchSynaxarium() {
  let date: string = "1_9";
  let url: string =
    "https://www.copticchurch.net/synaxarium/" + `${date}` + ".html?lang=ar";

  let response = await fetch(
    "http://katamars.avabishoy.com/api/Katamars/GetSynaxariumStory?id=1&synaxariumSourceId=1",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      referrer: "http://katamars.avabishoy.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "omit",
    }
  );

  console.log(response);
}

/**
 * Just trying to figger out if there is a way to prompt the user for installing the app without waiting for the browser to spontaneously trigger the 'beforeinstallprompt' event
 */
function playingWithInstalation() {
  let beforeInstallFired;
  window.addEventListener("beforeinstallpromt", (e) => {
    e.preventDefault;
    beforeInstallFired = e;
    alert("beforeinstall fired");
  });
  //
  let btn = document.createElement("button");
  //@ts-ignore
  let before = new BeforeInstallPromptEvent("beforeInstallPrompt");
  btn.addEventListener("click", () => {
    before.trigger();
    before.prompt().then((r) => console.log("response = ", r));
    console.log(before.userChoice);
  });
  window.addEventListener(before, () => btn.click());
  //btn.click();
  alert("swipe right or click on the image to open the menu and start");
}

populatePrayersArrays();
async function populatePrayersArrays() {
  //We are populating subset arrays of PrayersArray in order to speed up the parsing of the prayers when the button is clicked
  PrayersArray.map((wordTable) => {
    //each element in PrayersArray represents a table in the Word document from which the text of the prayers was retrieved
    if (wordTable[0][0].startsWith(Prefix.commonPrayer)) {
      CommonPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.massStBasil)) {
      MassStBasilPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.massCommon)) {
      MassCommonPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.massStGregory)) {
      MassStGregoryPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.massStCyril)) {
      MassStCyrilPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.massStJohn)) {
      MassStJohnPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.fractionPrayer)) {
      FractionsPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.commonDoxologies)) {
      DoxologiesPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.commonIncense)) {
      IncensePrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.incenseDawn)) {
      IncensePrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.incenseVespers)) {
      IncensePrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.communion)) {
      CommunionPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.psalmResponse)) {
      PsalmAndGospelPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.gospelResponse)) {
      PsalmAndGospelPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.cymbalVerses)) {
      CymbalVersesPrayersArray.push(wordTable);
    }else if (wordTable[0][0].startsWith(Prefix.praxis)) {
      PraxisResponsesPrayersArray.push(wordTable);
    } else if (wordTable[0][0].startsWith(Prefix.bookOfHours)) {
      bookOfHoursPrayersArray.push(wordTable);
      if (wordTable[0][0].includes('1stHour')) {
        bookOfHours.DawnPrayersArray.push(wordTable);
      } else if (wordTable[0][0].includes('3rdHour')) {
        bookOfHours.ThirdHourPrayersArray.push(wordTable);
      }else if (wordTable[0][0].includes('6thHour')) {
        bookOfHours.SixthHourPrayersArray.push(wordTable);
      }else if (wordTable[0][0].includes('9thHour')) {
        bookOfHours.NinethHourPrayersArray.push(wordTable);
      }else if (wordTable[0][0].includes('11thHour')) {
        bookOfHours.EleventhHourPrayersArray.push(wordTable);
      }else if (wordTable[0][0].includes('12thHour')) {
        bookOfHours.TwelvethHourPrayersArray.push(wordTable);
      }
    }
  });
}
/**
 * Returns the title of the table without the '&C=' added at its end in order to indicate the class of each row. It returns the value of title.split('&C=')[0]
 * @param {string} title - the string that we need to split to get rid of the '&C=' string at its end
 */
function baseTitle(title): string{
  if (!title) {console.log('title is = ', title); return};
  return title.split('&C=')[0];
}

/**
 * This function generates a string[][][] from the string[][] generated by Word VBA for the readings
 */
//console.log(correctReading(btnReadingsKatholikon.prayersArray));
function generateFixedReadingArray(readingArray): string[][][] {
  let unique: string[] = [],
    title: string,
    table: string[][],
    result: string[][][] = [];
  readingArray.forEach((row) => {
    title = baseTitle(row[0]);
    if (unique.indexOf(title) < 0) {
      unique.push(title);
    }
  });

  unique.forEach((title) => {
    table = [];
    readingArray.forEach((row) => {
      if (baseTitle(row[0]) === title) {
        table.push(row);
      }
    });
    result.push(table);
  });
  console.log(result);
  return result;
}
/**
 * Returns a string representing the query selector for a div element having a data-root attribute equal to root
 * @param {string} root - the data-root value we want to build a query selector for retrieving the elements with the same value
 * @param {boolean} isLike - if set to true, the function will return a query selector for an element having a data-root containing the root argument (as opposed to a root exactly matching the root argument)
 * @returns
 */
function getDataRootSelector(root: string, isLike: boolean = false):string {
  if (isLike) {
    return 'div[data-root*="' + root + '"]';
  } else {
    return 'div[data-root="' + root + '"]';
  }
}
/**
 * Takes a collection of html elements and moves it adjacent to a given child html element to containerDiv
 * @param {string} targetElementRoot - the data-root value of the html element adjacent to which the block will be moved
 * @param {InsertPosition} position - the position at which the block of html elements will be moved in relation to the specified html element
 * @param {NodeListOf<Element>} block - a list of html elements that will be moved to the specified 'position' in relation to another html element in the containerDiv
 */
async function moveBlockOfRowsAdjacentToAnElement(
  targetElementRoot: string,
  position: InsertPosition,
  block: NodeListOf<Element>
) {
  Array.from(block).map((r) =>
    containerDiv
      .querySelector(getDataRootSelector(targetElementRoot))
      .insertAdjacentElement(position, r as HTMLElement)
  );
  contentDiv.querySelectorAll(".class");
}
/**
 * Replaces the css class class of all tables in an array of tables (i.e., a string[][][]). The css class is added as a suffix to the title of each table, preceded by '&C='
 * @param {string[][][]} prayersArray - the array of tables 
 * @param {string} newClass - the new class that will replace the existing class
 */
function replaceClass(prayersArray: string[][][], newClass:string) {
  prayersArray.map(
          table => {
                  table.map(
                          row => row[0] = baseTitle(row[0]) + '&C=' + newClass)
          })
}
/**
 * Replaces the musical eight note sign with a span that allows to give it a class and hence give it a color
 * @param {number} code - the Char code of the eigth note (or any other character that we want to replace with a span with the same css class)
 * @returns 
 */
async function replaceEigthNote(code: number, container: HTMLElement[]) {
  if (!code) code = 9834;
  if (!container) container = Array.from(containerDiv.querySelectorAll('p.Diacon')) as HTMLElement[];
  if (container.length === 0) return;
  let note = String.fromCharCode(code),
        replaceWith: string = '<span class="eigthNote">' + note + '</span>';
  if (localStorage.displayMode === displayModes[1]) {
    replaceWith = '<span class="eigthNote">' + note + '</span><br>'
  };
  
  container.forEach((p:HTMLElement) => {
    if (p && p.innerText.includes(note)){
      p.innerHTML = p.innerHTML.replaceAll(note, replaceWith);
    }
  }
    )
}

/**
 * Moves ah html element up or down in the DOM, before or after the specified number of siblings
 * @param {HTMLElement} element - the html element that we want to move
 * @param {number} by - the number of sibligns we want to move the element before or after (if number is <0, it moves element up, if >0 it moves it down)
 */
function moveElementBeforeOrAfterXSiblings(element: HTMLElement,
  by: number) {
    let sibling:HTMLElement, position:InsertPosition
  for (let i = 1; i <= by; i++){
    if (by > 0) sibling = element.nextElementSibling as HTMLElement; position = 'afterend'
    if (by < 0) sibling = element.previousSibling as HTMLElement; position = 'beforebegin'
    if(i==by && sibling) sibling.insertAdjacentElement(position, element)
  }

}

