class Button {
    constructor(btn) {
        this._retrieved = false;
        this._btnID = btn.btnID;
        this._label = btn.label;
        this._parentBtn = btn.parentBtn;
        this._children = btn.children;
        this._prayersSequence = btn.prayersSequence;
        this._retrieved = btn.retrieved;
        this._prayersArray = btn.prayersArray;
        this._languages = btn.languages;
        this._onClick = btn.onClick;
        this._afterShowPrayers = btn.afterShowPrayers;
        this._showPrayers = btn.showPrayers;
        this._docFragment = btn.docFragment;
        this._any = btn.any;
        btn.cssClass
            ? (this._cssClass = btn.cssClass)
            : (this._cssClass = btnClass);
    }
    //Getters
    get btnID() {
        return this._btnID;
    }
    get children() {
        return this._children;
    }
    get prayersSequence() {
        return this._prayersSequence;
    }
    get retrieved() {
        return this._retrieved;
    }
    get prayersArray() {
        return this._prayersArray;
    }
    get languages() {
        return this._languages;
    }
    get label() {
        return this._label;
    }
    get parentBtn() {
        return this._parentBtn;
    }
    get onClick() {
        return this._onClick;
    }
    get afterShowPrayers() {
        return this._afterShowPrayers;
    }
    get showPrayers() {
        return this._showPrayers;
    }
    get cssClass() {
        return this._cssClass;
    }
    get docFragment() {
        return this._docFragment;
    }
    get any() {
        return this._any;
    }
    //Setters
    set btnID(id) {
        this._btnID = id;
    }
    set label(lbl) {
        this._label = lbl;
    }
    set parentBtn(parentBtn) {
        this._parentBtn = parentBtn;
    }
    set prayersSequence(btnPrayers) {
        this._prayersSequence = btnPrayers;
    }
    set retrieved(retrieved) {
        this._retrieved = retrieved;
    }
    set prayersArray(btnPrayersArray) {
        this._prayersArray = btnPrayersArray;
    }
    set languages(btnLanguages) {
        this._languages = btnLanguages;
    }
    set onClick(fun) {
        this._onClick = fun;
    }
    set afterShowPrayers(fun) {
        this._afterShowPrayers = fun;
    }
    set showPrayers(showPrayers) {
        this._showPrayers = showPrayers;
    }
    set children(children) {
        this._children = children;
    }
    set cssClass(cssClass) {
        this._cssClass = cssClass;
    }
    set docFragment(docFragment) {
        this._docFragment = docFragment;
    }
    set any(any) {
        this._any = any;
    }
}
const btnMain = new Button({
    btnID: "btnMain",
    label: {
        defaultLanguage: "العودة إلى القائمة الرئيسية",
        foreignLanguage: "Retour au menu principal",
        otherLanguage: "Back to the main menu",
    },
    onClick: () => {
        btnMain.children = [btnMass, btnIncenseOffice, btnDayReadings, btnBookOfHours];
        (function showBtnsOnMainPage() {
            if (leftSideBar.classList.contains('extended'))
                return; //If the left side bar is not hidden, we do not show the buttons on the main page because it means that the user is using the buttons in the side bar and doesn't need to navigate using the btns in the main page
            let images = [
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnMassBackground.jpg)',
                'url(./assets/btnIncenseBackground.jpg)',
                'url(./assets/btnReadingsBackground.jpg)',
                'url(./assets/btnBOHBackground.jpg)',
            ];
            containerDiv.innerHTML = '';
            containerDiv.style.gridTemplateColumns = ((100 / 3).toString() + '% ').repeat(3);
            //We create html elemements representing each of btnMain children. The created buttons will be appended to containerDiv directly
            btnMain.children
                .map(btn => {
                return createBtn(btn, containerDiv, 'mainPageBtns', true, () => onClickBtnFunction(btn));
            })
                .map(htmlBtn => {
                //For each btn created from the children of btnMain, we give it an image background from the images[] array of links
                htmlBtn.style.backgroundImage = images[Array.from(containerDiv.children).indexOf(htmlBtn)];
            });
            function onClickBtnFunction(btn) {
                if (!btn.children || btn.children.length === 0)
                    btn.onClick({ returnBtnChildren: true }); //if btn doesn't have childre, we call its onClick() function beacuse the children of some btns are added when tis function is called. We pass 'true' as argument, because it makes the function return the children and do not execute until its end
                let parentHtmlBtn = containerDiv.querySelector('#' + btn.btnID);
                let backgroundImage;
                if (parentHtmlBtn)
                    backgroundImage = parentHtmlBtn.style.backgroundImage;
                containerDiv.innerHTML = "";
                if (!btn.children
                    || btn.children.length === 0
                    || (btn.prayersSequence
                        && btn.prayersSequence.length > 0)) {
                    showChildButtonsOrPrayers(btn); //If btn does not have children, it means that it shows prayers. We pass it to showChildButtonsOrPrayers
                    return;
                }
                ;
                //else, we will show the btn children
                btn.children
                    //for each child button of btn
                    .map(childBtn => {
                    //We create an html element representing this button and give it 'mainPageBtns', and append it to containerDiv. It will have as background, the same image as the background image of btn
                    createBtn(childBtn, containerDiv, 'mainPageBtns', false, () => onClickBtnFunction(childBtn))
                        .style.backgroundImage = backgroundImage;
                });
                createBtn(btnMain, containerDiv, 'mainPageBtns').style.backgroundImage = images[0]; //Finlay, we create and extra html button for btnMain, in order for the user to be able to navigate back to the btnMain menu of buttons
            }
            ;
        })();
    },
});
const btnGoBack = new Button({
    btnID: "btnGoBack",
    label: { defaultLanguage: "السابق", foreignLanguage: "Retour", otherLanguage: "Go Back" },
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnMass = new Button({
    btnID: "btnMass",
    label: { defaultLanguage: "القداسات", foreignLanguage: "Messes" },
    onClick: (args = { returnBtnChildren: false }) => {
        btnMass.children = [btnIncenseDawn, btnMassUnBaptised, btnMassBaptised];
        if (args.returnBtnChildren)
            return btnMass.children;
    },
});
const btnIncenseOffice = new Button({
    btnID: "btnIncenseOffice",
    label: {
        defaultLanguage: "رفع بخور باكر أو عشية",
        foreignLanguage: "Office des Encens Aube et Vêpres",
    },
    onClick: (args = { returnBtnChildren: false }) => {
        //setting the children of the btnIncenseOffice. This must be done by the onClick() in order to reset them each time the button is clicked
        btnIncenseOffice.children = [btnIncenseDawn, btnIncenseVespers];
        //show or hide the PropheciesDawn button if we are in the Great Lent or JonahFast:
        if (args.returnBtnChildren)
            return btnIncenseOffice.children;
        if (Season === Seasons.GreatLent || Season === Seasons.JonahFast) {
            //we will remove the btnIncenseVespers from the children of btnIncenseOffice for all the days of the Week except Saturday because there is no Vespers incense office except on Saturday:
            if (todayDate.getDay() != 6 &&
                copticReadingsDate != copticFeasts.Resurrection) {
                btnIncenseOffice.children.splice(btnIncenseOffice.children.indexOf(btnIncenseVespers), 1);
            }
            // we will remove or add the Prophecies Readings button as a child to btnDayReadings depending on the day
            if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) === -1 && //The Prophecies button is not among the children of btnDayReadings
                todayDate.getDay() != 0 && //i.e., we are not a Sunday
                todayDate.getDay() != 6 //i.e., we are not a Saturday
            ) {
                //it means btnReadingsPropheciesDawn does not appear in the Incense Dawn buttons list (i.e., =-1), and we are neither a Saturday or a Sunday, which means that there are prophecies lectures for these days and we need to add the button in all the Day Readings Menu, and the Incense Dawn
                btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn); //We add the Prophecies button at the beginning of the btnIncenseDawn children[], i.e., we add it as the first button in the list of Incense Dawn buttons, the second one is the Gospel
            }
            else if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1 &&
                (todayDate.getDay() === 0 || //i.e., we are a Sunday
                    todayDate.getDay() === 6) //i.e., we are a Saturday
            ) {
                //it means btnReadingsPropheciesDawn appears in the Incense Dawn buttons list, and we are either a Saturday or a Sunday, which means that there are no prophecies for these days and we need to remove the button from all the menus to which it had been added before
                btnIncenseDawn.children.splice(btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn), 1);
            }
            //removing the vespers prayers if we are not a Saturday, and adding it if we aree
            if (btnDayReadings.children &&
                todayDate.getDay() != 6 &&
                btnDayReadings.children.indexOf(btnIncenseVespers) > -1) {
                //it means we are not a Saturday. we need to remove the btnIncenseVespers because there are not vespers
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnIncenseVespers), 1);
            }
            else if (btnDayReadings.children &&
                todayDate.getDay() === 6 &&
                btnDayReadings.children.indexOf(btnIncenseVespers) === -1) {
                //it means we are  a Saturday. we need to add the btnReadingsGospelIncenseVespers if missing
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelIncenseDawn), 0, btnIncenseVespers);
            }
        }
    },
});
const btnIncenseDawn = new Button({
    btnID: "btnIncenseDawn",
    label: {
        defaultLanguage: "بخور باكر",
        foreignLanguage: "Encens Aube",
    },
    showPrayers: true,
    children: [],
    languages: [...prayersLanguages],
    docFragment: new DocumentFragment(),
    onClick: () => {
        btnIncenseDawn.prayersSequence = [...IncensePrayersSequence];
        (function removeIncenseVesperPrayers() {
            //We will remove all the Incense Vespers titles from the prayersSequence Array
            btnIncenseDawn.prayersSequence = btnIncenseDawn.prayersSequence.filter(title => !title.startsWith(Prefix.incenseVespers));
        })();
        btnIncenseDawn.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.IncensePrayersArray.filter(table => !table[0][0].startsWith(Prefix.incenseVespers)),
        ]; //We need this to be done when the button is clicked, not when it is declared, because when declared, CommonPrayersArray and IncensePrayersArray are empty (they are popultated by a function in "main.js", which is loaded after "DeclareButtons.js")
        (function setBtnChildrenAndPrayers() {
            //We will set the children of the button:
            btnIncenseDawn.children = [btnReadingsGospelIncenseDawn];
            //we will also set the prayers of the Incense Dawn button
            btnIncenseDawn.prayersSequence = [...IncensePrayersSequence];
        })();
        scrollToTop();
        return btnIncenseDawn.prayersSequence;
    },
    afterShowPrayers: async (btn = btnIncenseDawn, gospelButton = btnReadingsGospelIncenseDawn) => {
        let btndocFragment = btn.docFragment;
        insertCymbalVersesAndDoxologies(btn);
        getGospelReadingAndResponses(gospelButton.onClick({ returnPrefix: true }), gospelButton, btndocFragment);
        (async function addGreatLentPrayers() {
            if (btn.btnID !== btnIncenseDawn.btnID)
                return;
            if (Season !== Seasons.GreatLent || Season !== Seasons.JonahFast)
                return;
            if (todayDate.getDay() !== 0 && todayDate.getDay() !== 6) {
                //We are neither a Saturday nor a Sunday, we will hence display the Prophecies dawn buton
                (function showPropheciesDawnBtn() {
                    if (Season !== Seasons.GreatLent)
                        return;
                    //If we are during any day of the week, we will add the Prophecies readings to the children of the button
                    if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) < 0)
                        btnIncenseDawn.children.unshift(btnReadingsPropheciesDawn);
                })();
                (async function addEklonominTaghonata() {
                    let efnotiNaynan = selectElementsByDataRoot(btndocFragment, Prefix.commonPrayer + 'EfnotiNaynan&D=$copticFeasts.AnyDay', { startsWith: true });
                    let insertion = efnotiNaynan[efnotiNaynan.length - 1].nextSibling; //This is the "Kyrie Elison 3 times"
                    insertion.insertAdjacentElement('beforebegin', insertion.cloneNode(true)); //We duplicated the "Kyrie Elison 3 times"
                    let godHaveMercy = btnIncenseDawn.prayersArray.filter(table => table[0][0].startsWith(Prefix.incenseDawn + 'GodHaveMercyOnUs')); //This will give us all the prayers 
                    let KyrieElieson = btnIncenseDawn.prayersArray.filter(table => table[0][0] === Prefix.commonPrayer + 'KyrieElieson&D=$copticFeasts.AnyDay&C=Assembly')[0]; //This is "Kyrie Elison"
                    let blocks = [];
                    blocks.push(godHaveMercy[0]); //this is the comment at the begining
                    for (let i = 2; i < godHaveMercy.length; i += 3) {
                        blocks.push([...godHaveMercy[1]]); //This is the refrain repated every 3 parts.We are pushing a copy of it, to avoid affecting it by the splice in the next step
                        if (i > 4)
                            blocks[blocks.length - 1].splice(0, 1); //This will remove the title from the refrain if it is not the 1st refrain (it removes the 1st row in the refrain table)
                        blocks.push(godHaveMercy[i]);
                        blocks.push(KyrieElieson);
                        blocks.push(godHaveMercy[i + 1]);
                        blocks.push(KyrieElieson);
                        blocks.push(godHaveMercy[i + 2]);
                        if (i + 2 < (godHaveMercy.length - 1))
                            blocks.push(KyrieElieson);
                    }
                    insertPrayersAdjacentToExistingElement(blocks, prayersLanguages, { beforeOrAfter: 'beforebegin', el: insertion });
                })();
                return;
            }
            else {
                if (btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn) > -1)
                    btnIncenseDawn.children.splice(btnIncenseDawn.children.indexOf(btnReadingsPropheciesDawn), 1);
            }
        })();
        (async function addExpandableBtnForAdamDoxolgies() {
            if (btn.btnID !== btnIncenseDawn.btnID)
                return;
            if (btndocFragment.children.length === 0)
                return;
            addExpandablePrayer(btndocFragment.children[0], "AdamDoxologies", {
                defaultLanguage: "ذكصولوجيات باكر آدام",
                foreignLanguage: "Doxologies Adam Aube",
            }, PrayersArrays.DoxologiesPrayersArray.filter(table => table[0][0].startsWith(Prefix.doxologies + 'AdamDawn')), btnIncenseDawn.languages)[1];
            //finally we append the newDiv to containerDiv
            //btnIncenseDawn.docFragment.children[1].insertAdjacentElement('beforebegin', doxologiesDiv)
        })();
    },
});
const btnIncenseVespers = new Button({
    btnID: "btnIncenseVespers",
    label: {
        defaultLanguage: "بخور عشية",
        foreignLanguage: "Incense Vespers",
    },
    showPrayers: true,
    docFragment: new DocumentFragment(),
    languages: [...prayersLanguages],
    onClick: () => {
        btnIncenseVespers.prayersSequence = [...IncensePrayersSequence];
        btnIncenseVespers.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.IncensePrayersArray.filter(table => !table[0][0].startsWith(Prefix.incenseDawn)),
        ];
        (function removingNonRelevantPrayers() {
            //removing the Dawn Doxology for St. Mary
            btnIncenseVespers.prayersSequence = btnIncenseVespers.prayersSequence.filter(title => title !== Prefix.commonPrayer + "AngelsPrayer&D=$copticFeasts.AnyDay"
                && !title.startsWith(Prefix.incenseDawn));
        })();
        scrollToTop();
        return btnIncenseVespers.prayersSequence;
    },
    afterShowPrayers: async () => {
        btnIncenseDawn.afterShowPrayers(btnIncenseVespers, btnReadingsGospelIncenseVespers);
    },
});
const btnMassStCyril = new Button({
    btnID: "btnMassStCyril",
    label: { defaultLanguage: "كيرلسي", foreignLanguage: "Saint Cyril", otherLanguage: "St Cyril" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStCyril.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.MassCommonPrayersArray,
            ...PrayersArrays.MassStCyrilPrayersArray,
        ];
        if (btnMassStCyril.retrieved === true) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
            //sbtnMassStCyril.prayersSequence = btnsPrayersSequences[btns.indexOf(btnMassStCyril)];
            return;
        }
        //Setting the standard mass prayers sequence
        btnMassStCyril.prayersSequence = [
            ...MassPrayersSequences.MassCommonIntro,
            ...MassPrayersSequences.MassStCyril,
            ...[
                Prefix.massCommon + "TheHolyBodyAndTheHolyBlodPart3&D=$copticFeasts.AnyDay",
                Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay",
                Prefix.commonPrayer + "BlockIriniPassi&D=$copticFeasts.AnyDay",
                Prefix.massCommon + "FractionPrayerPlaceholder&D=$copticFeasts.AnyDay",
                Prefix.commonPrayer + "OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay",
                Prefix.massCommon + "Confession&D=$copticFeasts.AnyDay",
            ],
            ...MassPrayersSequences.Communion,
        ];
        btnsPrayersSequences.splice(btns.indexOf(btnMassStCyril), 1, btnMassStCyril.prayersSequence);
        btnMassStCyril.retrieved = true;
        return btnMassStCyril.prayersSequence;
    },
    afterShowPrayers: async () => {
        btnMassStBasil.afterShowPrayers(btnMassStCyril);
    },
});
const btnMassStGregory = new Button({
    btnID: "btnMassStGregory",
    label: { defaultLanguage: "غريغوري", foreignLanguage: "Saint Gregory" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStGregory.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.MassCommonPrayersArray,
            ...PrayersArrays.MassStGregoryPrayersArray,
        ];
        if (btnMassStGregory.retrieved === true) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
            // btnMassStGregory.prayersSequence = btnsPrayersSequences[btns.indexOf(btnMassStGregory)];
            return;
        }
        //Setting the standard mass prayers sequence
        btnMassStGregory.prayersSequence = [
            ...MassPrayersSequences.MassCommonIntro,
            ...MassPrayersSequences.MassStGregory,
            ...MassPrayersSequences.MassCallOfHolySpirit,
            ...MassPrayersSequences.MassLitanies,
            ...MassPrayersSequences.Communion,
        ];
        //removing irrelevant prayers from the array
        btnMassStGregory.prayersSequence.splice(btnMassStGregory.prayersSequence.indexOf(Prefix.massCommon + "CallOfTheHolySpiritPart1&D=$copticFeasts.AnyDay"), 9);
        scrollToTop();
        btnsPrayersSequences.splice(btns.indexOf(btnMassStGregory), 1, btnMassStGregory.prayersSequence);
        btnMassStGregory.retrieved = true;
        return btnMassStGregory.prayersSequence;
    },
    afterShowPrayers: async () => {
        btnMassStBasil.afterShowPrayers(btnMassStGregory);
    },
});
const btnMassStBasil = new Button({
    btnID: "btnMassStBasil",
    label: { defaultLanguage: "باسيلي", foreignLanguage: "Saint Basil", otherLanguage: "St Basil" },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: () => {
        btnMassStBasil.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.MassCommonPrayersArray,
            ...PrayersArrays.MassStBasilPrayersArray,
        ];
        if (btnMassStBasil.retrieved === true) {
            //if the prayers array of this button had already been set by the async function setButtonsPrayers(), which is called when the app is loaded, then we will not recalculate the paryers array and will use the preset array
            //btnMassStBasil.prayersSequence = btnsPrayersSequences[btns.indexOf(btnMassStBasil)];
            return;
        }
        //Setting the standard mass prayers sequence
        btnMassStBasil.prayersSequence = [
            ...MassPrayersSequences.MassCommonIntro,
            ...MassPrayersSequences.MassStBasil,
            ...MassPrayersSequences.MassCallOfHolySpirit,
            ...MassPrayersSequences.MassLitanies,
            ...MassPrayersSequences.Communion,
        ];
        //We scroll to the beginning of the page after the prayers have been displayed
        scrollToTop();
        btnsPrayersSequences.splice(btns.indexOf(btnMassStBasil), 1, btnMassStBasil.prayersSequence);
        btnMassStBasil.retrieved = true;
        return btnMassStBasil.prayersSequence;
    },
    afterShowPrayers: async (btn = btnMassStBasil) => {
        let massButtons = [btnMassStBasil, btnMassStGregory, btnMassStCyril, btnMassStJohn];
        massButtons.splice(massButtons.indexOf(btn), 1);
        massButtons.splice(massButtons.indexOf(btnMassStJohn), 1);
        let btndocFragment = btn.docFragment;
        showFractionPrayersMasterButton(btn, selectElementsByDataRoot(btndocFragment, Prefix.massCommon + 'FractionPrayerPlaceholder&D=$copticFeasts.AnyDay', { equal: true })[0], { defaultLanguage: "صلوات القسمة", foreignLanguage: "Oraisons de la Fraction" }, "btnFractionPrayers", PrayersArrays.FractionsPrayersArray);
        (function addRedirectionButtons() {
            //Adding 3 buttons to redirect to the other masses (St. Gregory, St. Cyril, or St. John)
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: selectElementsByDataRoot(btndocFragment, 'Reconciliation&D=$copticFeasts.AnyDay', { includes: true })[0],
            }, 'RedirectionToReconciliation');
            //Adding 2 buttons to redirect to the St Cyrill or St Gregory Anaphora prayer After "By the intercession of the Virgin St. Mary"
            let select = selectElementsByDataRoot(btndocFragment, Prefix.massCommon + 'AssemblyResponseByTheIntercessionOfStMary&D=$copticFeasts.AnyDay', { endsWith: true });
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "afterend",
                el: select[select.length - 1]
            }, 'RedirectionToAnaphora');
            //Adding 2 buttons to redirect to the St Cyril or St Gregory before Agios
            redirectToAnotherMass([...massButtons], {
                beforeOrAfter: "beforebegin",
                el: selectElementsByDataRoot(btndocFragment, Prefix.massCommon + 'Agios&D=$copticFeasts.AnyDay', { equal: true })[0],
            }, 'RedirectionToAgios');
        })();
        (function insertStMaryAdamSpasmos() {
            //We insert it during the Saint Mary Fast and on every 21th of the coptic month
            let spasmos = PrayersArray.filter(table => table[0][0] === Prefix.massCommon + "StMaryAdamSpasmos&D=$Seasons.StMaryFast&C=Title");
            if (!spasmos)
                return;
            let anchor = selectElementsByDataRoot(btndocFragment, Prefix.massCommon + "DiaconResponseKissEachOther&D=$copticFeasts.AnyDay", { equal: true })[0];
            addExpandablePrayer(anchor, 'StMaryAdamSpasmos', {
                defaultLanguage: "افرحي يا مريم",
                foreignLanguage: "Réjouis-toi Marie"
            }, spasmos, btnMassStBasil.languages)[1];
        })();
        (function insertCommunionChants() {
            //Inserting the Communion Chants after the Psalm 150
            let psalm = selectElementsByDataRoot(btndocFragment, Prefix.massCommon + "CommunionPsalm150&D=$copticFeasts.AnyDay", { equal: true });
            let filtered = PrayersArrays.CommunionPrayersArray.filter(tbl => {
                selectFromMultiDatedTitle(tbl[0][0], copticDate) === true
                    || selectFromMultiDatedTitle(tbl[0][0], Season) === true;
            });
            if (filtered.length === 0)
                filtered = PrayersArrays.CommunionPrayersArray.filter(tbl => selectFromMultiDatedTitle(tbl[0][0], copticFeasts.AnyDay) === true);
            showMultipleChoicePrayersButton(filtered, btn, {
                defaultLanguage: 'مدائح التوزيع',
                foreignLanguage: 'Chants de la communion'
            }, 'communionChants', undefined, psalm[psalm.length - 1]);
        })();
        (function insertIndeedWePrayYou() {
            if (btn !== btnMassStBasil)
                return; //This button appears only in St Basil Mass
            let prayers = PrayersArrays.MassStGregoryPrayersArray.filter(tbl => tbl[0][0].startsWith(Prefix.massStGregory + "LitaniesIntroductionPart"));
            if (prayers.length === 0)
                return;
            let kyrielieson = CommonPrayersArray.filter(tbl => tbl[0][0] ===
                Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay&C=Assembly")[0];
            for (let i = 1; i < prayers.length; i += 2) {
                prayers.splice(i, 0, kyrielieson);
            }
            let kyrielieson3Times = CommonPrayersArray.filter(tbl => tbl[0][0] === Prefix.commonPrayer + "KyrieEliesonThreeTimes&D=$copticFeasts.AnyDay&C=Assembly")[0];
            prayers.push(kyrielieson3Times);
            let anchor = selectElementsByDataRoot(btndocFragment, Prefix.massCommon + "LitaniesIntroduction&D=$copticFeasts.AnyDay", { equal: true })[0];
            if (!anchor)
                return console.log('no anchor');
            addExpandablePrayer(anchor, 'btnIndeedWePrayYou', {
                defaultLanguage: "...نعم نسألك أيها المسيح إلهنا",
                foreignLanguage: 'Oui, nous t\'implorons ô Christ notre Dieu...'
            }, prayers, btn.languages);
        })();
    },
});
const btnMassStJohn = new Button({
    btnID: "btnMassStJohn",
    label: { defaultLanguage: "القديس يوحنا", foreignLanguage: "Saint Jean" },
    docFragment: new DocumentFragment(),
    showPrayers: false,
    prayersSequence: [],
    onClick: () => {
        alert('The prayers of this mass have not yet been added. We hope they will be ready soon');
        return; //until we add the text of this mass
        btnMassStJohn.prayersArray = [
            ...PrayersArrays.CommonPrayersArray,
            ...PrayersArrays.MassCommonPrayersArray,
            ...PrayersArrays.MassStJohnPrayersArray,
        ];
        scrollToTop(); //scrolling to the top of the page
        btnsPrayersSequences.splice(btns.indexOf(btnMassStJohn), 1, btnMassStJohn.prayersSequence);
        btnMassStJohn.retrieved = true;
        return btnMassStJohn.prayersSequence;
    },
    afterShowPrayers: async () => {
        btnMassStBasil.afterShowPrayers(btnMassStJohn);
    },
});
const goToAnotherMass = [
    new Button({
        btnID: "btnGoToStBasilReconciliation",
        label: { defaultLanguage: " باسيلي", foreignLanguage: " Saint Basil" },
        cssClass: inlineBtnClass,
        onClick: () => {
            showChildButtonsOrPrayers(btnMassStBasil);
        },
    }),
    new Button({
        btnID: "btnGoToStGregoryReconciliation",
        label: { defaultLanguage: "غريغوري", foreignLanguage: " Saint Gregory" },
        cssClass: inlineBtnClass,
        onClick: () => {
            showChildButtonsOrPrayers(btnMassStGregory);
        },
    }),
    new Button({
        btnID: "btnGoToStCyrilReconciliation",
        label: { defaultLanguage: "كيرلسي", foreignLanguage: "Saint Cyril" },
        cssClass: inlineBtnClass,
        onClick: () => {
            showChildButtonsOrPrayers(btnMassStCyril);
        },
    }),
    new Button({
        btnID: "btnGoToStJeanReconciliation",
        label: { defaultLanguage: "القديس يوحنا", foreignLanguage: "Saint Jean" },
        cssClass: inlineBtnClass,
        parentBtn: btnMass,
        onClick: () => {
            showChildButtonsOrPrayers(btnMassStJohn);
        },
    }),
];
const btnMassUnBaptised = new Button({
    btnID: "btnMassUnBaptised",
    label: {
        defaultLanguage: "قداس الموعوظين",
        foreignLanguage: "Messe des non baptisés",
        otherLanguage: "Unbaptised Mass",
    },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    prayersArray: [...PrayersArray],
    languages: [...prayersLanguages],
    onClick: () => {
        //The prayers sequence must be set when the button is clicked
        btnMassUnBaptised.prayersSequence = [...MassPrayersSequences.MassUnbaptized],
            //Adding children buttons to btnMassUnBaptised
            btnMassUnBaptised.children = [...btnDayReadings.children];
        btnMassUnBaptised.children.splice(0, 1);
        btnMassUnBaptised.children.splice(btnMassUnBaptised.children.length - 1, 1);
        //Adding the creed and 
        (function addCreed() {
            return;
            btnMassUnBaptised.prayersSequence.unshift(Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay');
        })();
        //Replacing AllelujaFayBabi according to the day
        (function replaceAllelujahFayBabi() {
            if ((Season === Seasons.GreatLent
                || Season === Seasons.JonahFast)
                && todayDate.getDay() !== 0
                && todayDate.getDay() !== 6) {
                //Inserting "Alleluja E Ikhon" before "Allelujah Fay Bibi"
                btnMassUnBaptised
                    .prayersSequence
                    .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 2, Prefix.massCommon + "HallelujahFayBiBiGreatLent&D=$Seasons.GreatLent");
                //Removing "Allelujah Fay Bibi" and "Allelujha Ge Ef Mev'i"
                btnMassUnBaptised
                    .prayersSequence
                    .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 1);
            }
            else if ((isFast
                && todayDate.getDay() !== 0
                && todayDate.getDay() !== 6)
                || (Season === Seasons.NoSeason
                    && (todayDate.getDay() === 3
                        || todayDate.getDay() === 5))) {
                //Removing Hellelujah Fay Bibi
                btnMassUnBaptised
                    .prayersSequence
                    .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay"), 1);
                //Remove TayShouray
                btnMassUnBaptised
                    .prayersSequence
                    .splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "Tayshoury&D=$copticFeasts.AnyDay"), 1);
            }
            else {
                //Removing 'Hallelujah Ji Efmefi'
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "HallelujahFayBiBi&D=$copticFeasts.AnyDay") + 1, 1);
                //Remove Tishoury
                btnMassUnBaptised.prayersSequence.splice(btnMassUnBaptised.prayersSequence.indexOf(Prefix.massCommon + "Tishoury&D=$copticFeasts.AnyDay"), 1);
            }
        })();
        scrollToTop();
        return btnMassUnBaptised.prayersSequence;
    },
    afterShowPrayers: () => {
        let btndocFragment = btnMassUnBaptised.docFragment;
        (function hideGodHaveMercyOnUsIfBishop() {
            let dataRoot = Prefix.massCommon + "PrayThatGodHaveMercyOnUsIfBishop&D=$copticFeasts.AnyDay";
            let godHaveMercyHtml = selectElementsByDataRoot(btndocFragment, dataRoot, { equal: true });
            let godHaveMercy = btnMassUnBaptised.prayersArray.filter(tbl => tbl[1] && splitTitle(tbl[1][0])[0] === dataRoot); //We get the whole table not only the second row. Notice that the first row of the table is the row containing the title
            if (godHaveMercy.length < 1)
                return;
            addExpandablePrayer(godHaveMercyHtml[0], 'godHaveMercy', {
                defaultLanguage: godHaveMercy[0][1][4],
                foreignLanguage: godHaveMercy[0][1][2], //this is the French text of the label
            }, [[godHaveMercy[0][2]]], //We add only the second row, the 1st row is a comment from which we retrieved the text for the title
            btnMassUnBaptised.languages)[1];
            godHaveMercyHtml.forEach((row) => row.remove());
        })();
        if (Season === Seasons.GreatLent
            || Season === Seasons.JonahFast) {
            //Inserting psaume 'His Foundations In the Holy Montains' before the absolution prayers
            insertPrayersAdjacentToExistingElement(btnMassUnBaptised.prayersArray
                .filter(table => splitTitle(table[0][0])[0] === Prefix.massCommon + "HisFoundationsInTheHolyMountains&D=GreatLent"), btnMassUnBaptised.languages, {
                beforeOrAfter: 'beforebegin',
                el: selectElementsByDataRoot(btndocFragment, Prefix.massCommon + "AbsolutionForTheFather&D=$copticFeasts.AnyDay", { equal: true })[0]
            });
        }
        let anchor = selectElementsByDataRoot(btndocFragment, Prefix.commonPrayer + 'HolyGodHolyPowerfull&D=$copticFeasts.AnyDay', { equal: true })[0]; //this is the html element before which we will insert all the readings and responses
        let reading;
        (function insertStPaulReading() {
            reading = ReadingsArrays.StPaulArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.stPaul + '&D=' + copticReadingsDate);
            reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            //adding the  end of the St Paul reading
            if (reading.length === 0)
                return;
            //Adding the reading end
            reading.push([[splitTitle(reading[0][0][0])[0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.stPaulEnd.AR, ReadingsIntrosAndEnds.stPaulEnd.FR, ReadingsIntrosAndEnds.stPaulEnd.EN]]);
            //Inserting the reading intro after the title
            reading[0].splice(1, 0, [
                splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro',
                ReadingsIntrosAndEnds.stPaulIntro.AR,
                ReadingsIntrosAndEnds.stPaulIntro.FR,
                ReadingsIntrosAndEnds.stPaulIntro.EN
            ]); //We replace the first row in the first table of reading (which is the title of the Praxis, with the introduction table
            insertPrayersAdjacentToExistingElement(reading, readingsLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
        })();
        (function insertKatholikon() {
            reading = ReadingsArrays.KatholikonArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.katholikon + '&D=' + copticReadingsDate);
            if (reading.length === 0)
                return;
            reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            //ading the introduction and the end of the Katholikon
            reading.push([[
                    splitTitle(reading[0][0][0])[0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.katholikonEnd.AR, ReadingsIntrosAndEnds.katholikonEnd.FR, ReadingsIntrosAndEnds.katholikonEnd.EN
                ]]);
            //Inserting the reading intro after the title
            reading[0].splice(1, 0, [splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.katholikonIntro.AR, ReadingsIntrosAndEnds.katholikonIntro.FR, ReadingsIntrosAndEnds.katholikonIntro.EN
            ]); //We replace the second row in the table of reading (which is the title of the Katholikon, with the introduction table)
            insertPrayersAdjacentToExistingElement(reading, readingsLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
        })();
        (function insertPraxis() {
            reading = ReadingsArrays.PraxisArray.filter(tbl => splitTitle(tbl[0][0])[0] === Prefix.praxis + '&D=' + copticReadingsDate);
            if (reading.length === 0)
                return;
            reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            reading.push([[splitTitle(reading[0][0][0])[0] + '&C=ReadingEnd', ReadingsIntrosAndEnds.praxisEnd.AR, ReadingsIntrosAndEnds.praxisEnd.FR, ReadingsIntrosAndEnds.praxisEnd.EN]]);
            //Inserting the reading intro after the title
            reading[0].splice(1, 0, [splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.praxisIntro.AR, ReadingsIntrosAndEnds.praxisIntro.FR, ReadingsIntrosAndEnds.praxisIntro.EN]); //We replace the first row in the first table of reading (which is the title of the Praxis, with the introduction table
            insertPrayersAdjacentToExistingElement(reading, readingsLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
            (function insertPraxisResponse() {
                let praxis = selectElementsByDataRoot(btndocFragment, Prefix.praxis + '&D=', { startsWith: true });
                if (praxis.length === 0)
                    return;
                let response = PrayersArrays
                    .PraxisResponsesPrayersArray
                    .filter(table => selectFromMultiDatedTitle(table[0][0], copticDate)
                    || selectFromMultiDatedTitle(table[0][0], Season));
                (function insertSpecialResponse() {
                    if (response.length === 0)
                        return;
                    if (Season === Seasons.GreatLent) {
                        //If a Praxis response was found
                        // The query should yield to  2 tables ('Sundays', and 'Week') for this season. We will keep the relevant one accoding to the date
                        if (todayDate.getDay() === 0
                            || todayDate.getDay() === 6)
                            response = response.filter(table => table[0][0].includes('Sundays&D='));
                        else
                            response = response.filter(table => table[0][0].includes('Week&D='));
                        insertPrayersAdjacentToExistingElement(response, prayersLanguages, { beforeOrAfter: 'beforebegin', el: praxis[0] });
                    }
                    ;
                })();
                (function moveAnnualResponseBeforePraxis() {
                    //Moving the annual response
                    let annualResponse = selectElementsByDataRoot(btndocFragment, Prefix.praxisResponse + "PraxisResponse&D=$copticFeasts.AnyDay", { equal: true });
                    if (!annualResponse || annualResponse.length === 0)
                        return console.log('error: annual = ', annualResponse);
                    annualResponse
                        .forEach(htmlRow => praxis[0].insertAdjacentElement('beforebegin', htmlRow));
                })();
            })();
        })();
        (function insertSynaxarium() {
            reading = ReadingsArrays.SynaxariumArray.filter(table => splitTitle(table[0][0])[0] === Prefix.synaxarium + '&D=' + copticDate);
            if (reading.length === 0)
                return;
            reading = reading.map(tbl => [...tbl]); //We are doing this in order to clone the array, otherwise the original tables in the filtered array will be modified (P.S.: the spread operator did not work)
            reading[0].splice(1, 0, [
                splitTitle(reading[0][0][0])[0] + '&C=ReadingIntro', ReadingsIntrosAndEnds.synaxariumIntro.FR.replace('theday', Number(copticDay).toString()).replace('themonth', copticMonths[Number(copticMonth)].FR),
                ReadingsIntrosAndEnds.synaxariumIntro.AR.replace('theday', Number(copticDay).toString()).replace('themonth', copticMonths[Number(copticMonth)].AR),
                ReadingsIntrosAndEnds.synaxariumIntro.EN.replace('theday', Number(copticDay).toString()).replace('themonth', copticMonths[Number(copticMonth)].EN),
            ]);
            reading[0].splice(0, 1, [
                splitTitle(reading[0][0][0])[0] + '&C=Title',
                'Synixaire' + '\n' + Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].FR,
                'السنكسار' + '\n' + Number(copticDay).toString() + ' ' + copticMonths[Number(copticMonth)].AR,
            ]);
            let praxisElements = selectElementsByDataRoot(btndocFragment, Prefix.praxis + '&D=', { startsWith: true });
            if (praxisElements.length === 0)
                return;
            let anchor = {
                beforeOrAfter: 'beforebegin',
                el: praxisElements[praxisElements.length - 1].nextElementSibling,
            };
            reading
                .forEach(table => {
                table
                    .map(row => {
                    return createHtmlElementForPrayer({
                        tblRow: row,
                        languagesArray: ['FR', 'AR'],
                        position: anchor
                    });
                });
            });
        })();
        (function insertPentecostalHymns() {
            if (Season !== Seasons.PentecostalDays)
                return;
            let hymns = PrayersArray.filter((table) => table[0][0].startsWith("PentecostalHymns&D=$Seasons.PentecostalDays"));
            if (hymns.length > 0) {
                insertPrayersAdjacentToExistingElement(hymns, prayersLanguages, { beforeOrAfter: 'beforebegin', el: anchor });
            }
        })();
        (function insertGospelReading() {
            //Inserting the Gospel Reading
            getGospelReadingAndResponses(Prefix.gospelMass, {
                prayersArray: ReadingsArrays.GospelMassArray, languages: readingsLanguages
            }, btndocFragment);
        })();
        (async function insertBookOfHoursButton() {
            if (copticReadingsDate === copticFeasts.Resurrection
                || copticDate === copticFeasts.Nativity
                || copticDate === copticFeasts.Baptism)
                //In these feasts we don't pray any hour
                return;
            let hoursBtns = btnBookOfHours.onClick(true); //We get buttons for the relevant hours according to the day
            if (!hoursBtns)
                return;
            (function selectRelevantHoursAccordingToTheDay() {
                //args.mass is a boolean that tells whether the button prayersArray should include all the hours of the Book Of Hours, or only those pertaining to the mass according to the season and the day on which the mass is celebrated
                let hours = [hoursBtns[1], hoursBtns[2], hoursBtns[3]]; //Those are the 3rd, 6th and 9th hours
                if ((Season === Seasons.GreatLent
                    || Season === Seasons.JonahFast)
                    && todayDate.getDay() !== 0
                    && todayDate.getDay() !== 6)
                    //We are during the Great Lent, we pray the 3rd, 6th, 9th, 11th, and 12th hours
                    hours.push(hoursBtns[4], hoursBtns[5]);
                else if (todayDate.getDay() === 0
                    || todayDate.getDay() === 6 //Whatever the period, if we are a Saturday or a Sunday, we pray only the 3rd and 6th Hours
                    || lordFeasts.indexOf(copticDate) > -1
                    || !isFast)
                    //We are a Sunday or a Saturday, or during the 50 Pentecostal days, or on a Lord Feast day, or we are during a no fast period
                    hours.pop(); //we remove the 9th hour
                hoursBtns = hours;
            })();
            let masterBtnDiv = document.createElement('div'); //This is the div that will contain the master button which shows or hides the Book of Hours sub buttons
            masterBtnDiv.classList.add('inlineBtns');
            masterBtnDiv.id = 'masterBOHBtn';
            let btnsDiv = document.createElement('div'); //This is the div that contains the sub buttons for each Hour of the Book of Hours
            btnsDiv.classList.add('inlineBtns');
            btnsDiv.classList.add(hidden);
            let masterBtn = new Button({
                btnID: 'BOH_Master',
                label: {
                    defaultLanguage: 'الأجبية',
                    foreignLanguage: 'Agpia'
                },
                onClick: () => {
                    //We toggle the div containing the buttons for each hour
                    btnsDiv.classList.toggle(hidden);
                    if (btnsDiv.classList.contains(hidden)) {
                        btnsDiv.style.top = '';
                        btnsDiv.style.position = '';
                        createFakeAnchor(btnsDiv.id);
                    }
                    ;
                }
            });
            masterBtnDiv
                .prepend(createBtn(masterBtn, masterBtnDiv, 'inlineBtn', true, masterBtn.onClick)); //We add the master button to the bookOfHoursMasterDiv
            let createdElements;
            //We will create a button and an expandable div for each hour
            hoursBtns
                .reverse() //We reverse the buttons in order to get them arranged in the order from right to left (i.e: 3rdHour, 6thHour, etc.)
                .forEach(async (btn) => {
                btn.onClick(true); //We call the onClick() method of the btn in order to build its prayersSequence and prayersArray properties
                InsertHourFinalPrayers(btn); //Inserting Kyrielison 41 times, Agios, Holy God of Sabaot, etc.
                //We will filter the btn.prayersSequence in order to keep only those prayers tables (string[][]) matching the btn.prayersSequence order
                let filteredPrayers = btn.prayersSequence
                    .map(title => {
                    return btn.prayersArray
                        .filter(tbl => splitTitle(tbl[0][0])[0] === title)[0];
                });
                //We will create an 'expandable' html button and div for the hour button
                createdElements = addExpandablePrayer(btndocFragment.children[0], btn.btnID, btn.label, filteredPrayers, btnBookOfHours.languages);
                addOnClickToHourBtn(createdElements[0]);
                btnsDiv.appendChild(createdElements[0]); //We add all the buttons to the same div instead of 3 divs;
                collapseAllTitles(Array.from(createdElements[1].children)); //We collapse all the titles
                if (localStorage.displayMode === displayModes[1]) {
                    //If we are in the 'Presentation Mode'
                    Array.from(createdElements[1].querySelectorAll('div.Row'))
                        .filter((row) => row.dataset.root.includes('HourPsalm') || row.dataset.root.includes('EndOfHourPrayer'))
                        .forEach(row => row.remove()); //we remove all the psalms and keep only the Gospel and the Litanies,
                    Array.from(sideBarTitlesContainer.children)
                        .filter((row) => row.dataset.root.includes('HourPsalm')
                        || row.dataset.root.includes('EndOfHourPrayer'))
                        .forEach(row => row.remove()); //We do the same for the titles
                }
                ;
            });
            function addOnClickToHourBtn(hourBtn) {
                hourBtn
                    .addEventListener('click', async () => {
                    Array.from(containerDiv.children)
                        .filter(div => div.id.endsWith('Expandable'))
                        .forEach((expandableDiv) => {
                        if (!expandableDiv.id.startsWith(hourBtn.id)
                            && !expandableDiv.classList.contains(hidden)) {
                            //This is the container of another hour than the hour linked to the button (btn), we hidde any such container in ordr to keep only the prayers of the button's hour
                            expandableDiv.classList.add(hidden);
                            collapseAllTitles(Array.from(expandableDiv.children));
                            hideOrShowAllTitlesInAContainer(expandableDiv, true);
                        }
                        else if (expandableDiv.id.startsWith(hourBtn.id)) {
                            //this is the container of the prayers related to the button
                            if (!expandableDiv.classList.contains(hidden)) {
                                makeExpandableButtonContainerFloatOnTop(btnsDiv, '35px');
                                masterBtnDiv.classList.add(hidden);
                                createFakeAnchor(expandableDiv.id);
                            }
                            else {
                                btnsDiv.style.top = '';
                                btnsDiv.style.position = '';
                                masterBtnDiv.classList.remove(hidden);
                                createFakeAnchor(btnsDiv.id);
                            }
                            ;
                        }
                    });
                });
            }
            ;
            btndocFragment.prepend(btnsDiv);
            btndocFragment.prepend(masterBtnDiv);
            btnsDiv.style.display = 'grid';
            let x = hoursBtns.length;
            if (x > 3)
                x = 3; //we limit the number of columns to 3
            if (x > 1)
                btnsDiv.style.gridTemplateColumns = ((100 / x).toString() + '% ').repeat(x);
            function InsertHourFinalPrayers(hourBtn) {
                let Agios = Prefix.commonPrayer + 'HolyGodHolyPowerfullPart1&D=$copticFeasts.AnyDay', Kyrielison41Times = Prefix.commonPrayer + 'Kyrielison41Times&D=$copticFeasts.AnyDay', KyrielisonIntro = Kyrielison41Times.replace('&D=', 'NoMassIntro&D='), KyrielisonMassIntro = Kyrielison41Times.replace('&D=', 'MassIntro&D='), HolyLordOfSabaot = Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay', HailToYouMaria = Prefix.commonPrayer + 'WeSaluteYouMary&D=$copticFeasts.AnyDay', WeExaltYou = Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Creed = Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay', OurFatherWhoArtInHeaven = Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay';
                let litanies, lastLitany, sequence;
                litanies = hourBtn.prayersSequence.filter(title => title.includes('HourLitanies'));
                lastLitany = litanies[litanies.length - 1];
                //!CAUTION, the order of the buttons in hourBtn is reversed (eg.: [9th, 6th, 3rd] instead of [3rd, 6th, 9th])
                if (hoursBtns.indexOf(hourBtn) === 0) {
                    //This is the last hour
                    hourBtn.prayersArray.push(CommonPrayersArray
                        .filter(tbl => splitTitle(tbl[0][0])[0] === KyrielisonMassIntro)[0]);
                    sequence =
                        [
                            WeExaltYou,
                            Creed,
                            KyrielisonMassIntro,
                            Kyrielison41Times,
                            HolyLordOfSabaot,
                            OurFatherWhoArtInHeaven
                        ];
                }
                else if (hoursBtns.indexOf(hourBtn) === 1) {
                    //this is the before last
                    sequence =
                        [
                            KyrielisonIntro,
                            Kyrielison41Times,
                            Agios,
                            Agios.replace('Part1', 'Part2'),
                            OurFatherWhoArtInHeaven,
                            HailToYouMaria
                        ];
                }
                else {
                    //Any other hour before the 2 last
                    sequence =
                        [
                            KyrielisonIntro,
                            Kyrielison41Times,
                            HolyLordOfSabaot,
                            OurFatherWhoArtInHeaven
                        ];
                }
                ;
                insertCommonPrayer(hourBtn, sequence, lastLitany);
                function insertCommonPrayer(btn, titles, lastLitany) {
                    if (!titles || titles.length === 0)
                        return console.log('no sequence');
                    btn.prayersSequence.splice(btn.prayersSequence.indexOf(lastLitany) + 1, 0, ...titles);
                }
            }
            ;
            //Collapsing all the Titles
            collapseAllTitles(Array.from(btndocFragment.children));
            btndocFragment.getElementById('masterBOHBtn').classList.toggle(hidden); //We remove hidden from btnsDiv
        })();
    }
});
const btnMassBaptised = new Button({
    btnID: "btnMassBaptised",
    label: {
        defaultLanguage: "قداس المؤمنين",
        foreignLanguage: "Messe des Croyants",
        otherLanguage: "Baptized Mass",
    },
    parentBtn: btnMass,
    children: [btnMassStBasil, btnMassStCyril, btnMassStGregory, btnMassStJohn],
});
const btnDayReadings = new Button({
    btnID: "btnDayReadings",
    children: [
        new Button({
            btnID: "btnReadingsStPaul",
            label: {
                defaultLanguage: "البولس",
                foreignLanguage: "Epître de Saint Paul",
                otherLanguage: "Pauline Epistle",
            },
            showPrayers: true,
            prayersSequence: [Prefix.stPaul],
            prayersArray: ReadingsArrays.StPaulArray,
            languages: [...readingsLanguages],
            onClick: () => {
                scrollToTop(); //scrolling to the top of the page
            },
        }),
        new Button({
            btnID: "btnReadingsKatholikon",
            label: {
                defaultLanguage: "الكاثوليكون",
                foreignLanguage: "Katholikon",
            },
            showPrayers: true,
            prayersSequence: [Prefix.katholikon],
            prayersArray: ReadingsArrays.KatholikonArray,
            languages: [...readingsLanguages],
            onClick: () => {
                scrollToTop(); //scrolling to the top of the page
            },
        }),
        new Button({
            btnID: "btnReadingsPraxis",
            label: {
                defaultLanguage: "الإبركسيس",
                foreignLanguage: "Praxis",
            },
            showPrayers: true,
            prayersSequence: [Prefix.praxis],
            prayersArray: ReadingsArrays.PraxisArray,
            languages: [...readingsLanguages],
            onClick: () => {
                scrollToTop(); //scrolling to the top of the page
            },
        }),
        new Button({
            btnID: "btnReadingsSynaxarium",
            label: {
                defaultLanguage: "السنكسار",
                foreignLanguage: "Synaxarium",
            },
            showPrayers: true,
            prayersArray: ReadingsArrays.SynaxariumArray,
            languages: ['FR', "AR"],
            onClick: function () {
                //We can't use an arrow function here because we need to use this
                this.prayersSequence = [Prefix.synaxarium + '&D=' + copticDate];
                scrollToTop(); //scrolling to the top of the page
            },
        }),
        new Button({
            btnID: "btnReadingsGospelMass",
            label: {
                defaultLanguage: "إنجيل القداس",
                foreignLanguage: "l'Evangile",
                otherLanguage: "Gospel",
            },
            showPrayers: true,
            prayersSequence: [Prefix.gospelMass + "Psalm", Prefix.gospelMass + "Gospel"],
            prayersArray: ReadingsArrays.GospelMassArray,
            languages: [...readingsLanguages],
            onClick: () => {
                scrollToTop(); //scrolling to the top of the page
            },
        })
    ],
    label: {
        defaultLanguage: "قراءات اليوم", foreignLanguage: "Lectures du jour",
        otherLanguage: "Day's Readings"
    },
    onClick: (args = { returnBtnChildren: false }) => {
        if (Season === Seasons.HolyWeek) {
            //We should put here child buttons for the Holy Week prayers and readings
            let div = document.createElement('div');
            div.innerText = 'We are during the Holy Week, there are no readings, please go to the Holy Week Prayers';
            containerDiv.appendChild(div);
            return;
        }
        //We set the btnDayReadings.children[] property
        if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseDawn) < 0)
            btnDayReadings.children.unshift(btnReadingsGospelIncenseDawn);
        if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers) < 0)
            btnDayReadings.children.unshift(btnReadingsGospelIncenseVespers);
        if (args.returnBtnChildren)
            return btnDayReadings.children;
        if (Season === Seasons.GreatLent &&
            todayDate.getDay() != 6 &&
            copticReadingsDate !== copticFeasts.Resurrection) {
            //we are during the Great Lent and we are not a Saturday
            if (btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers) > -1) {
                //There is no Vespers office: we remove the Vespers Gospel from the list of buttons
                btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelIncenseVespers), 1);
            }
            //If, in additon, we are not a Sunday (i.e., we are during any week day other than Sunday and Saturday), we will  add the Prophecies button to the list of buttons
            if (todayDate.getDay() != 0) {
                //We are not a Sunday:
                if (btnDayReadings.children.indexOf(btnReadingsPropheciesDawn) === -1) {
                    btnDayReadings.children.unshift(btnReadingsPropheciesDawn);
                }
                //since we  are not a Sunday, we will also remove the Night Gospel if included
                if (btnDayReadings.children.indexOf(btnReadingsGospelNight) > -1) {
                    btnDayReadings.children.splice(btnDayReadings.children.indexOf(btnReadingsGospelNight), 1);
                }
            }
            else if (todayDate.getDay() === 0 &&
                copticReadingsDate != copticFeasts.Resurrection) {
                //However, if we are a Sunday, we add the Night Gospel to the readings list of buttons
                if (btnDayReadings.children.indexOf(btnReadingsGospelNight) === -1) {
                    // (we do not add it to the Unbaptized mass menu because it is not read during the mass)
                    btnDayReadings.children.push(btnReadingsGospelNight);
                }
            }
        }
    },
});
const btnReadingsGospelIncenseVespers = new Button({
    btnID: "btnReadingsGospelIncenseVespers",
    label: {
        defaultLanguage: "إنجيل عشية",
        foreignLanguage: "Evangile  Vêpres",
        otherLanguage: "Vespers Gospel",
    },
    showPrayers: true,
    prayersSequence: [Prefix.gospelVespers + "Psalm", Prefix.gospelVespers + "Gospel"],
    prayersArray: ReadingsArrays.GospelVespersArray,
    languages: [...readingsLanguages],
    onClick: (returnValues = { returnDate: false, returnPrefix: false }) => {
        if (returnValues.returnPrefix)
            return Prefix.gospelVespers;
        let date = getTomorowCopticReadingDate();
        function getTomorowCopticReadingDate() {
            let today = new Date(todayDate.getTime() + calendarDay); //We create a date corresponding to the  the next day. This is because in the PowerPoint presentations from which the gospel text was retrieved, the Vespers gospel of each day is linked to the day itself not to the day before it: i.e., if we are a Monday and want the gospel that will be read in the Vespers incense office, we should look for the Vespers gospel of the next day (Tuesday).
            return getSeasonAndCopticReadingsDate(convertGregorianDateToCopticDate(today.getTime(), false)[1], today);
        }
        ;
        console.log(date);
        if (returnValues.returnDate)
            return date;
        //We add the psalm reading to the begining of the prayersSequence
        btnReadingsGospelIncenseVespers.prayersSequence[0] = Prefix.gospelVespers + "Psalm&D=" + date;
        btnReadingsGospelIncenseVespers.prayersSequence[1] = Prefix.gospelVespers + "Gospel&D=" + date;
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnReadingsGospelIncenseDawn = new Button({
    btnID: "btnReadingsGospelIncenseDawn",
    label: {
        defaultLanguage: "إنجيل باكر",
        foreignLanguage: "Evangile Aube",
        otherLanguage: "Gospel Dawn",
    },
    showPrayers: true,
    prayersSequence: [Prefix.gospelDawn + "Psalm", Prefix.gospelDawn + "Gospel"],
    prayersArray: [ReadingsArrays.GospelDawnArray],
    languages: [...readingsLanguages],
    onClick: (returnPrefix = { returnPrefix: false }) => {
        scrollToTop(); //scrolling to the top of the page
        if (returnPrefix.returnPrefix)
            return Prefix.gospelDawn;
    },
});
const btnReadingsGospelNight = new Button({
    btnID: "btnReadingsGospelNight",
    label: {
        defaultLanguage: "إنجيل المساء",
        foreignLanguage: "Evangile du Soir",
        otherLanguage: "Night Gospel",
    },
    showPrayers: true,
    prayersSequence: [Prefix.gospelNight + "Psalm", Prefix.gospelNight + "Gospel"],
    prayersArray: ReadingsArrays.GospelNightArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnReadingsPropheciesDawn = new Button({
    btnID: "btnReadingsPropheciesDawn",
    label: {
        defaultLanguage: "نبوات باكر",
        foreignLanguage: "Propheties Matin",
    },
    showPrayers: true,
    parentBtn: btnIncenseDawn,
    prayersSequence: [Prefix.propheciesDawn],
    prayersArray: ReadingsArrays.PropheciesDawnArray,
    languages: [...readingsLanguages],
    onClick: () => {
        scrollToTop(); //scrolling to the top of the page
    },
});
const btnBookOfHours = new Button({
    btnID: 'btnBookOfHours',
    label: { defaultLanguage: 'الأجبية', foreignLanguage: 'Agpia', otherLanguage: 'Book of Hours' },
    docFragment: new DocumentFragment(),
    showPrayers: true,
    languages: [...prayersLanguages],
    onClick: (returnBtnChildren = false) => {
        let Kenin = Prefix.commonPrayer + 'NowAlwaysAndForEver&D=$copticFeasts.AnyDay', ZoksaPatri = Prefix.commonPrayer + 'GloryToTheFatherTheSonAndTheSpirit&D=$copticFeasts.AnyDay', gospelEnd = Prefix.bookOfHours + 'GospelEnd&D=$copticFeasts.AnyDay', OurFatherWhoArtInHeaven = Prefix.commonPrayer + 'OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay', AngelsPrayers = Prefix.commonPrayer + 'AngelsPrayer&D=$copticFeasts.AnyDay', HailToYouMaria = Prefix.commonPrayer + 'WeSaluteYouMary&D=$copticFeasts.AnyDay', WeExaltYou = Prefix.commonPrayer + 'WeExaltYouStMary&D=$copticFeasts.AnyDay', Agios = Prefix.commonPrayer + 'HolyGodHolyPowerfullPart1&D=$copticFeasts.AnyDay', Kyrielison41Times = Prefix.commonPrayer + 'Kyrielison41Times&D=$copticFeasts.AnyDay', KyrielisonIntro = Kyrielison41Times.replace('&D=', 'NoMassIntro&D='), HolyLordOfSabaot = Prefix.commonPrayer + 'HolyHolyHolyLordOfSabaot&D=$copticFeasts.AnyDay', Creed = Prefix.commonPrayer + 'Creed&D=$copticFeasts.AnyDay', Hallelujah = Prefix.bookOfHours + 'PsalmEnd&D=$copticFeasts.AnyDay', EndOfAllHours = Prefix.bookOfHours + '1stHourEndOfAllHoursPrayer&D=$copticFeasts.AnyDay', HourIntro = [
            Prefix.commonPrayer + 'ThanksGivingPart1&D=$copticFeasts.AnyDay',
            Prefix.commonPrayer + 'ThanksGivingPart2&D=$copticFeasts.AnyDay',
            Prefix.commonPrayer + 'ThanksGivingPart3&D=$copticFeasts.AnyDay',
            Prefix.commonPrayer + 'ThanksGivingPart4&D=$copticFeasts.AnyDay',
            Prefix.bookOfHours + 'AnyHourPsalm50&D=$copticFeasts.AnyDay'
        ], DawnPsalms = [
            Prefix.bookOfHours + '6thHourPsalm62&D=$copticFeasts.AnyDay',
            Prefix.bookOfHours + '6thHourPsalm66&D=$copticFeasts.AnyDay',
            Prefix.bookOfHours + '6thHourPsalm69&D=$copticFeasts.AnyDay',
            Prefix.bookOfHours + '9thHourPsalm112&D=$copticFeasts.AnyDay',
        ];
        btnBookOfHours.children = [];
        let commonPrayers = getCommonPrayers();
        function getCommonPrayers() {
            let commonPrayers = [
                ...CommonPrayersArray
                    .filter(table => splitTitle(table[0][0])[0] === ZoksaPatri
                    || splitTitle(table[0][0])[0] === Kenin
                    || splitTitle(table[0][0])[0] === HolyLordOfSabaot
                    || splitTitle(table[0][0])[0] === HailToYouMaria
                    || splitTitle(table[0][0])[0] === WeExaltYou
                    || splitTitle(table[0][0])[0] === Creed
                    || splitTitle(table[0][0])[0] === OurFatherWhoArtInHeaven
                    || splitTitle(table[0][0])[0] === AngelsPrayers
                    || splitTitle(table[0][0])[0] === Kyrielison41Times
                    || splitTitle(table[0][0])[0] === KyrielisonIntro
                    || splitTitle(table[0][0])[0] === Agios
                    || splitTitle(table[0][0])[0] === Agios.replace('Part1', 'Part2')
                    || new RegExp(Prefix.commonPrayer + 'ThanksGivingPart\\d{1}\\&D\\=\\$copticFeasts.AnyDay').test(splitTitle(table[0][0])[0]))
            ];
            commonPrayers.push(...PrayersArrays.bookOfHoursPrayersArray
                .filter(tbl => splitTitle(tbl[0][0])[0] === HourIntro[HourIntro.length - 1] //this is Psalm 50
                || splitTitle(tbl[0][0])[0] === gospelEnd
                || splitTitle(tbl[0][0])[0] === Hallelujah
                || splitTitle(tbl[0][0])[0] === EndOfAllHours));
            return commonPrayers;
        }
        ;
        (function addAChildButtonForEachHour() {
            for (let hour in bookOfHours) {
                if (!hour.endsWith('PrayersArray'))
                    continue;
                let hourName = hour.split('PrayersArray')[0];
                let hourBtn = new Button({
                    btnID: 'btn' + hourName,
                    label: {
                        defaultLanguage: bookOfHoursLabels.filter(label => label.id === hourName)[0].AR,
                        foreignLanguage: bookOfHoursLabels.filter(label => label.id === hourName)[0].FR
                    },
                    languages: btnBookOfHours.languages,
                    showPrayers: true,
                    onClick: (returnBtnChildren = false) => hourBtnOnClick(hourBtn, returnBtnChildren),
                });
                //Adding the onClick() property to the button
                function hourBtnOnClick(btn, returnBtnChildren = false) {
                    (function buildBtnPrayersSequence() {
                        //We will add the prayers sequence to btn.prayersSequence[]
                        let endOfPrayer = [AngelsPrayers, Agios, Agios.replace('Part1', 'Part2'), OurFatherWhoArtInHeaven, HailToYouMaria, WeExaltYou, Creed, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven];
                        btn.prayersSequence =
                            bookOfHours[hour]
                                .map(table => splitTitle(table[0][0])[0]); //we add all the titles to the prayersSequence
                        (function addCommonSequences() {
                            if (returnBtnChildren)
                                return;
                            btn.prayersSequence.splice(1, 0, ...HourIntro); //We also add the titles in HourIntro before the 1st element of btn.prayersSequence[]
                            if (btn.btnID !== Object.keys(bookOfHours)[0].split('PrayersArray')[0] && btn.btnID !== Object.keys(bookOfHours)[10].split('PrayersArray')[0]) {
                                //We don't add the End of All Hours Prayers to the 'Dawn' Prayer, because it is already attached to it by default (: its title includes '1stHour')
                                btn.prayersSequence
                                    .splice(btn.prayersSequence.length - 1, 0, Kyrielison41Times, HolyLordOfSabaot, OurFatherWhoArtInHeaven);
                                btn.prayersSequence.push(EndOfAllHours);
                            }
                            ;
                            if (btn.btnID === Object.keys(bookOfHours)[0].split('PrayersArray')[0]) {
                                //Adding the repeated psalms (psalms that are found in the 6ths and 9th hour), before pasalm 122
                                btn.prayersSequence
                                    .splice(btn.prayersSequence.indexOf(Prefix.bookOfHours + '1stHourPsalm142&D=$copticFeasts.AnyDay'), 0, ...DawnPsalms);
                                btn.prayersSequence
                                    .splice(btn.prayersSequence.indexOf(Prefix.bookOfHours + "1stHourEndOfHourPrayer1&D=$copticFeasts.AnyDay"), 0, ...endOfPrayer);
                            }
                            ;
                            if (btn.btnID === Object.keys(bookOfHours)[10].split('PrayersArray')[0]) {
                                btn.prayersSequence.push(EndOfAllHours); //We add the end of hours prayer that we hadn't added before
                                let copy = [...endOfPrayer];
                                copy.splice(0, 1);
                                //we remove the Angels Prayer
                                btn.prayersSequence.splice(btn.prayersSequence.indexOf(Prefix.bookOfHours + '12thHourEndOfHourPrayer&D=$copticFeasts.AnyDay'), 0, ...copy);
                            }
                        })();
                    })();
                    (function insertZoksaPatri() {
                        btn.prayersSequence
                            .filter(title => title.includes('Litanies'))
                            .forEach(tblTitle => {
                            if (tblTitle.includes('Litanies1')
                                || tblTitle.includes('Litanies4')) {
                                btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, ZoksaPatri);
                            }
                            else if (tblTitle.includes('Litanies2') //second litany
                                || tblTitle.includes('Litanies5') //5th litany
                                || (tblTitle.includes('Litanies3')
                                    && btn.prayersSequence[btn.prayersSequence.indexOf(tblTitle) + 1].includes('Litanies4')) //3rd litany if litanies are > 3
                            ) {
                                btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, Kenin);
                            }
                        });
                    })();
                    (function insertPsalmAndGospelEnds() {
                        btn.prayersSequence
                            .filter(title => title.includes('Psalm')
                            || title.includes('Gospel&D=$copticFeasts.AnyDay'))
                            .forEach(tblTitle => {
                            if (tblTitle.includes('Gospel')
                                && btn.prayersSequence[btn.prayersSequence.indexOf(tblTitle) + 1] !== gospelEnd) //Inserting the Gosepl End
                             {
                                btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, gospelEnd);
                            }
                            else if (tblTitle.includes('Psalm')
                                && btn.prayersSequence[btn.prayersSequence.indexOf(tblTitle) + 1] !== Hallelujah) {
                                btn.prayersSequence.splice(btn.prayersSequence.indexOf(tblTitle) + 1, 0, Hallelujah);
                            }
                            ;
                        });
                    })();
                    (function pushCommonPrayers() {
                        btn.prayersArray = [...bookOfHours[hour]].concat([...commonPrayers]);
                        if (btn.btnID === 'Dawn') {
                            btn.prayersArray
                                .push(...DawnPsalms
                                .map(psalm => PrayersArrays.bookOfHoursPrayersArray
                                .filter(tbl => splitTitle(tbl[0][0])[0] === psalm)[0]));
                        }
                        ;
                    })();
                    (function removeActorsFromPrayersArrays() {
                        //When showing just the Book of Prayers independant of any Mass context, we remove all the actors classes from the prayersArray of all the buttons
                        if (returnBtnChildren || !btn.prayersArray)
                            return;
                        console.log('no return');
                        btn.prayersArray = structuredClone(btn.prayersArray);
                        btn.prayersArray
                            .forEach(tbl => {
                            tbl
                                .forEach(row => {
                                console.log(row[0]);
                                if (!row[0].endsWith('&C=Title') && !row[0].endsWith('&C=SubTitle'))
                                    row[0] = splitTitle(row[0])[0];
                            });
                        });
                    })();
                }
                ;
                btnBookOfHours.children.push(hourBtn);
            }
            ;
        })();
        if (returnBtnChildren)
            return btnBookOfHours.children;
        scrollToTop();
        return btnBookOfHours.prayersSequence;
    }
});
/**
 * takes a liturgie name like "IncenseDawn" or "IncenseVespers" and replaces the word "Mass" in the buttons gospel readings prayers array by the name of the liturgie. It also sets the psalm and the gospel responses according to some sepcific occasions (e.g.: if we are the 29th day of a coptic month, etc.)
 * @param liturgie {string} - expressing the name of the liturigie that will replace the word "Mass" in the original gospel readings prayers array
 * @returns {string} - returns an array representing the sequence of the gospel reading prayers, i.e., an array like ['Psalm Response', 'Psalm', 'Gospel', 'Gospel Response']
 */
function setGospelPrayers(liturgie) {
    //this function sets the date or the season for the Psalm response and the gospel response
    let prayers = [...GospelPrayersSequence], date;
    let psalm = prayers.indexOf(Prefix.psalmResponse), gospel = prayers.indexOf(Prefix.gospelResponse);
    prayers.forEach((p) => (prayers[prayers.indexOf(p)] = p + "&D=")); //we add '&D=' to each element of prayer
    //we replace the word 'Mass' in 'ReadingsGospelMass' by the liturige, e.g.: 'IncenseDawn'
    prayers[psalm + 1] = prayers[psalm + 1].replace(Prefix.gospelMass, liturgie);
    prayers[psalm + 2] = prayers[psalm + 2].replace(Prefix.gospelMass, liturgie);
    //setting the psalm and gospel responses
    (function setPsalmAndGospelResponses() {
        if (lordFeasts.indexOf(copticDate) > -1) {
            //This means we are on a Lord Feast, there is always a specific gospel and psalm response for these feasts, even when it falls during the Great Lent (Annonciation does sometimes)
            date = copticDate;
            prayers[psalm] += date;
            prayers[gospel] += date;
        }
        else if (Number(copticDay) === 29
            && [4, 5, 6].indexOf(Number(copticMonth)) < 0) {
            //we are on the 29th of any coptic month except Kiahk (because the 29th of kiahk is the nativity feast), and Touba and Amshir (they are excluded because they precede the annonciation)
            date = copticFeasts.theTwentyNinethOfCopticMonth;
            prayers[psalm] += date;
            prayers[gospel] += date;
        }
        else if (Season === Seasons.StMaryFast) {
            //we are during the Saint Mary Fast. There are diffrent gospel responses for Incense Dawn & Vespers
            if (todayDate.getHours() < 15) {
                prayers[gospel] === prayers[gospel].replace("&D=", "Dawn&D=");
            }
            else {
                prayers[gospel] === prayers[gospel].replace("&D=", "Vespers&D=");
            }
            date = Season;
            prayers[psalm] += date;
            prayers[gospel] += date;
        }
        else if (Season === Seasons.Kiahk) {
            // we are during Kiahk month: the first 2 weeks have their own gospel response, and the second 2 weeks have another gospel response
            date = Season;
            if (checkWhichSundayWeAre(Number(copticDay), todayDate.getDay()) === ("1stSunday" || "2ndSunday")) {
                prayers[gospel] = prayers[gospel].replace("&D=", "1&D=");
            }
            else {
                prayers[gospel] = prayers[gospel].replace("&D=", "2&D=");
            }
            prayers[psalm] += "0000";
            prayers[gospel] += date;
        }
        else if (Season === Seasons.GreatLent) {
            //we are during the Great Lent period
            if (copticReadingsDate === copticFeasts.EndOfGreatLentFriday) {
                if (todayDate.getHours() > 15) {
                    //We are in the vespers of Lazarus Saturday
                    date = copticFeasts.LazarusSaturday;
                    prayers[gospel] = prayers[gospel].replace("&D=", "Vespers&D=");
                    date = copticFeasts.LazarusSaturday;
                }
                else {
                    //We are in the morning
                    date = copticFeasts.EndOfGreatLentFriday;
                }
                prayers[gospel] += date;
            }
            else if (copticReadingsDate === copticFeasts.LazarusSaturday) {
                if (todayDate.getHours() < 15) {
                    //We are in the morning
                    date = copticFeasts.LazarusSaturday;
                }
                else {
                    //We are in the Vespers of the Palm Sunday
                    date = copticFeasts.PalmSunday;
                    prayers[gospel] = prayers[gospel].replace("&D=", "Vespers&D=");
                }
                prayers[psalm] += date;
                prayers[gospel] += date;
            }
            else {
                date = Seasons.GreatLent;
                todayDate.getDay() === 0
                    || todayDate.getDay() === 6
                    ? (prayers[gospel] = prayers[gospel].replace("&D=", Seasons.GreatLent + "Sundays&D="))
                    : (prayers[gospel] = prayers[gospel].replace("&D=", Seasons.GreatLent + "Week&D="));
            }
            prayers[psalm] += copticFeasts.AnyDay;
            prayers[gospel] += date;
        }
        else if (Season === Seasons.JonahFast) {
            date = Season;
            prayers[gospel] = prayers[gospel].replace("&D=", copticReadingsDate.split(Season)[1] + "&D=");
            prayers[psalm] += "0000";
            prayers[gospel] += date;
        }
        else if (Season === Seasons.PentecostalDays) {
            date = Seasons.PentecostalDays;
            prayers[psalm] += date;
            prayers[gospel] += date;
        }
        else if (Season === Seasons.NoSeason) {
            date = "0000";
            prayers[psalm] += date;
            prayers[gospel] += date;
        }
    })();
    return prayers;
}
let btnsPrayersSequences = [];
let btns = [
    btnIncenseDawn,
    btnIncenseVespers,
    btnMassStCyril,
    btnMassStBasil,
    btnMassStGregory,
];
/**
 *
 * @param {HTMLDivElement} targetElement - the html child of containerDiv, in relation to which the newly created div containing the html buttons elements, will be placed according to a given position
 * @param {Button[]} btns - a list of Button for each we will create an inline redirection html button
 * @param {InsertPosition} position - an object providing the position where the newly created div containing the html elements, will be placed compared. The div is placed in a position (i.e., the beforeOrAfter property) in relation ton an html element in the containerDiv (el) which is the targetEelement
 *@param {string} btnsContainerID - the id of the div container to which the html buttons will be appended. This id may be needed to select the div after redirection
 */
async function redirectToAnotherMass(btns, position, btnsContainerID) {
    if (!position.el)
        return;
    let redirectTo = [];
    btns.map((btn) => {
        //for each button in the btns array, we will create a fake Button and will set its onClick property to a function that retrieves the text of the concerned mass
        let newBtn = new Button({
            btnID: "GoTo_" + btn.btnID.split('btn')[1] + "_From_" + position.el.dataset.root,
            label: {
                defaultLanguage: btn.label.defaultLanguage,
                foreignLanguage: btn.label.foreignLanguage,
            },
            cssClass: inlineBtnClass,
            onClick: () => {
                showChildButtonsOrPrayers(btn); //We simulated as if btn itself has been clicked, which will show all its prayers, children, etc.
                //if there is an element in containerDiv having the same data-root as targetElement
                if (containerDiv.querySelector('#' + btnsContainerID))
                    createFakeAnchor(btnsContainerID);
            }
        });
        redirectTo.push(newBtn);
    });
    insertRedirectionButtons(redirectTo, position, btnsContainerID);
}
/**
 * Scrolls to the top of containerDiv
 */
async function scrollToTop() {
    //We scroll to the beginning of the page after the prayers have been displayed
    createFakeAnchor('homeImg');
}
/**
 * Retrieves and adds html div elements representing the Gospel Litany, the Gospel and psalm introductions, and the Gospel and Psalm readings for a given liturgy
 * @param {string} liturgy - the prefix of the liturgie for which we want to retrieve the gospel reading
 * @param {Button | {prayersArray:string[][][], languages:string[]}} btn - the  button object or any object  having as property a string[][][] containing the the text of the gospel and the psalm, and a string[] containing the languages order of the gospel and psalm readings
 * @param {HTMLElement | DocumentFragment} container - the html element to which the html elements (i.e. div) containing the gospel will be appended after being created
 * @param {HTMLElement} gospelInsertionPoint - the html element in relation to which the created html elements will be inserted in the container
 * @returns
 */
async function getGospelReadingAndResponses(liturgy, btn, container, gospelInsertionPoint) {
    if (!container)
        container = containerDiv;
    if (!gospelInsertionPoint)
        gospelInsertionPoint =
            selectElementsByDataRoot(container, Prefix.commonPrayer + "GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay", { equal: true })[0];
    //We start by inserting the standard Gospel Litany
    (function insertGospelLitany() {
        let gospelLitanySequence = [
            Prefix.commonPrayer + "GospelPrayerPart1&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "KyrieElieson&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "GospelPrayerPart2&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "GospelPrayerPart3&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "GospelIntroductionPart1&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "ZoksasiKyrie&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "PsalmIntroduction&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "GospelIntroductionPart2&D=$copticFeasts.AnyDay"
        ]; //This is the sequence of the Gospel Prayer/Litany for any liturgy
        let gospelLitanyPrayers = gospelLitanySequence
            .map(title => findTableInPrayersArray(title, PrayersArray));
        if (!gospelLitanyPrayers || gospelLitanyPrayers.length === 0)
            return;
        insertPrayersAdjacentToExistingElement(gospelLitanyPrayers, prayersLanguages, {
            beforeOrAfter: 'beforebegin',
            el: gospelInsertionPoint
        });
    })();
    if (new Map(JSON.parse(localStorage.showActors)).get("Diacon") === false) {
        alert("Diacon Prayers are set to hidden, we cannot show the gospel");
        return;
    } //If the user wants to hide the Diacon prayers, we cannot add the gospel because it is anchored to one of the Diacon's prayers
    let anchorDataRoot = Prefix.commonPrayer + 'GospelIntroduction&D=$copticFeasts.AnyDay';
    let gospelIntroduction = selectElementsByDataRoot(container, anchorDataRoot, { equal: true });
    if (gospelIntroduction.length === 0)
        return console.log('gospelIntroduction.length = 0 ', gospelIntroduction);
    let responses = setGospelPrayers(liturgy); //this gives us an array like ['PR_&D=####', 'RGID_Psalm&D=', 'RGID_Gospel&D=', 'GR_&D=####']
    //We will retrieve the tables containing the text of the gospel and the psalm from the GospeldawnArray directly (instead of call findAndProcessPrayers())
    let date = copticReadingsDate;
    if (liturgy === Prefix.gospelVespers) {
        date = btnReadingsGospelIncenseVespers.onClick({ returnDate: true });
    }
    ;
    let gospel = btn.prayersArray.filter((table) => splitTitle(table[0][0])[0] === responses[1] + date //this is the pasalm text
        || splitTitle(table[0][0])[0] === responses[2] + date //this is the gospel itself
    ); //we filter the GospelDawnArray to retrieve the table having a title = to response[1] which is like "RGID_Psalm&D=####"  responses[2], which is like "RGID_Gospel&D=####". We should get a string[][][] of 2 elements: a table for the Psalm, and a table for the Gospel
    if (gospel.length === 0)
        return console.log('gospel.length = 0'); //if no readings are returned from the filtering process, then we end the function
    /**
     * Appends the gospel and psalm readings before gospelInsertionPoint(which is an html element)
     */
    (function insertPsalmAndGospel() {
        gospel
            .forEach((table) => {
            let el; //this is the element before which we will insert the Psaml or the Gospel
            if (splitTitle(table[0][0])[0].includes("Gospel&D="))
                //This is the Gospel itself, we insert it before the gospel response
                el = gospelInsertionPoint;
            else if (splitTitle(table[0][0])[0].includes("Psalm&D="))
                el = gospelIntroduction[gospelIntroduction.length - 1];
            if (!el)
                return;
            insertPrayersAdjacentToExistingElement([table], btn.languages, {
                beforeOrAfter: 'beforebegin',
                el: el
            });
        });
    })();
    /**
     * Appends the Gospel response before gospelInsertion point
     */
    (function insertGospeResponse() {
        let gospelResp = PrayersArrays.PsalmAndGospelPrayersArray.filter((r) => r[0][0].split('&D=')[0] + '&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) === responses[3]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (gospelResp.length === 0)
            gospelResp = PrayersArray.filter((r) => splitTitle(r[0][0])[0] === Prefix.commonPrayer + 'GospelResponse&D=$copticFeasts.AnyDay'); //If no specific gospel response is found, we will get the 'annual' gospel response
        insertPrayersAdjacentToExistingElement(gospelResp, prayersLanguages, {
            beforeOrAfter: "beforebegin",
            el: gospelInsertionPoint,
        });
        //We will eventy remove the insertion point placeholder
        gospelInsertionPoint.remove();
    })();
    /**
     * Inserts the Psalm response after the end of the Gospel Litany
     */
    (function insertPsalmResponse() {
        let gospelPrayer = selectElementsByDataRoot(container, Prefix.commonPrayer + 'GospelPrayer&D=$copticFeasts.AnyDay', { equal: true }); //This is the 'Gospel Litany'. We will insert the Psalm response after its end
        let psalmResp = PrayersArrays.PsalmAndGospelPrayersArray.filter((r) => r[0][0].split('&D=')[0] + '&D=' + eval(r[0][0].split('&D=')[1].split('&C=')[0].replace('$', '')) === responses[0]); //we filter the PsalmAndGospelPrayersArray to get the table which title is = to response[2] which is the id of the gospel response of the day: eg. during the Great lent, it ends with '&D=GLSundays' or '&D=GLWeek'
        if (!psalmResp || !gospelPrayer)
            return;
        insertPrayersAdjacentToExistingElement(psalmResp, prayersLanguages, {
            beforeOrAfter: 'beforebegin',
            el: gospelPrayer[gospelPrayer.length - 2].nextElementSibling
        });
    })();
}
/**
 * Filters the FractionsPrayersArray and Insert a button (a "Master Button") in the specified place (i.e. the anchor). This button when clicked, opens a panel displaying buttons. Each button represents a Fraction. User choises a prayer by clicking on the button.
 * @param {Button} - btn
 * @param {HTMLElement} anchor - the html element after which the "Master Button" will be inserted
 * @param {typeBtnLabel} lable - the lable of the "Master Button"
 * @param {string} masterBtnID - the id that will be given to the html element created for the "Master Button"
 * @param {string[][][]} prayersArray - the array that will be filtered in order to retrieve the prayers that will be displayed by the buttons
 */
function showFractionPrayersMasterButton(btn, anchor, label, masterBtnID, prayersArray) {
    let filtered = new Set();
    if (Number(copticDay) === 29 && Number(copticMonth) !== 4)
        filterPrayersArray(copticFeasts.theTwentyNinethOfCopticMonth, prayersArray, filtered); //We start by adding the fraction of the 29th of each coptic month if we are on the 29th of the month
    //console.log('filteredSet = ', filtered)
    filterPrayersArray(copticDate, prayersArray, filtered); //we then add the fractions (if any) having the same date as the current copticDate
    filterPrayersArray(Season, prayersArray, filtered); //We then add the fractions (if any) having a date = to the current Season
    filterPrayersArray(copticFeasts.AnyDay, prayersArray, filtered); //We finally add the fractions having as date copticFeasts.AnyDay
    function filterPrayersArray(date, prayersArray, filtered) {
        prayersArray.map(table => {
            if (selectFromMultiDatedTitle(table[0][0], date) === true && !filtered.has(table))
                filtered.add(table);
        });
    }
    ;
    showMultipleChoicePrayersButton(Array.from(filtered), btn, label, masterBtnID, undefined, anchor);
}
/**
 * Filters the array containing the gospel text for each liturgie (e.g., Incense Dawn, Vepspers, etc.) and returns the text of the gospel and the psaume. The fil
 * @param {Button} btn - the button of the liturgie within which we want to show the gospel text and the psaume text
 * @param {string[][][]} readingsArray - the array containing the text of the gospel and the psaume. Each element of this array repersents a table in the Word document from which the text was retrieved, and each element of each table[], represents a row of this table
 * @returns {string[][][]} - the result of the filtering operation. This normally returns an array of 2 tables: the first table represents the table of the psaume text, and the 2nd table represents the table of the gospel text
 */
function getBtnGospelPrayersArray(btn, readingsArray) {
    let gospel = readingsArray.filter((r) => {
        splitTitle(r[0][0][0])[0] === btn.prayersSequence[1] ||
            splitTitle(r[0][0][0])[0] === btn.prayersSequence[2];
    });
    return gospel;
}
/**
 * Takes a table title with muliple date values separated by '||', and checks if any of these dates include the date passed to it as coptDate
 * @param {string} tableTitle - a title of a table including multiple dates separated by '||'
 * @param {string} coptDate - the date that we want to check if it is included in the title. If omitted, it is given the value of the current copticDate
 * @returns {boolean} - return true if the date was found, and false otherwise
 */
function selectFromMultiDatedTitle(tableTitle, coptDate = copticDate) {
    if (!tableTitle.includes('&D='))
        return false;
    tableTitle = splitTitle(tableTitle)[0].split("&D=")[1];
    let dates = tableTitle.split("||");
    let parseDate = dates
        .map(date => {
        if (date.startsWith('$'))
            date = eval(date.replace('$', ''));
        if (!date)
            return false;
        if (date === coptDate)
            return true;
        else
            return false;
    });
    if (parseDate.includes(true))
        return true;
    else
        return false;
}
/**
 * Inserts the Incense Office Doxologies And Cymbal Verses according to the Coptic feast or season
 * @param {HTMLElement | DocumentFragment} container - The HtmlElement in which the btn prayers are displayed and to which they are appended
 */
async function insertCymbalVersesAndDoxologies(btn) {
    if (!btn.docFragment)
        return console.log('btn.docFragment = ', btn.docFragment);
    let containerChildren = Array.from(btn.docFragment.children);
    let cymbalsPlaceHolder = containerChildren.filter(htmlRow => htmlRow.dataset.root === Prefix.commonIncense + "CymbalVersesPlaceHolder&D=$copticFeasts.AnyDay")[0];
    if (!cymbalsPlaceHolder)
        return console.log('Didn\'t find cymbalsPlaceHolder');
    let doxologiesPlaceHolder = containerChildren.filter(htmlRow => htmlRow.dataset.root === Prefix.commonIncense + "DoxologiesPlaceHolder&D=$copticFeasts.AnyDay")[0];
    if (!doxologiesPlaceHolder)
        return console.log('Didn\'t find doxologiesPlaceholder');
    (async function InsertCommonCymbalVerses() {
        let sequence = [
            Prefix.cymbalVerses + "Wates&D=$copticFeasts.AnyDay",
            Prefix.cymbalVerses + "Common&D=$copticFeasts.AnyDay"
        ];
        if (todayDate.getDay() > 2)
            sequence[0] = sequence[0].replace('Wates&D', 'Adam&D');
        let cymbals = sequence
            .map(cymbalsTitle => {
            return PrayersArrays.CymbalVersesPrayersArray.filter(tbl => splitTitle(tbl[0][0])[0] === cymbalsTitle)[0];
        });
        if (!cymbals)
            return console.log('cymbals= ', cymbals);
        cymbals.reverse().forEach(tbl => tbl.reverse());
        insertPrayersAdjacentToExistingElement(cymbals, btn.languages, { beforeOrAfter: 'afterend', el: cymbalsPlaceHolder });
    })();
    (async function InsertCommonDoxologies() {
        let sequence = [
            Prefix.doxologies + "DawnWatesStMary&D=$copticFeasts.AnyDay",
            Prefix.doxologies + "ArchangelMichaelWates&D=$copticFeasts.AnyDay",
            Prefix.doxologies + "HeavenlyBeingsWates&D=$copticFeasts.AnyDay",
            Prefix.doxologies + "ApostlesWates&D=$copticFeasts.AnyDay",
            Prefix.doxologies + "StMarcWates&D=$copticFeasts.AnyDay",
            Prefix.doxologies + "StGeorgeWates&D=$copticFeasts.AnyDay",
            Prefix.doxologies + "StMinaWates&D=$copticFeasts.AnyDay",
            Prefix.doxologies + "EndOfDoxologiesWates&D=$copticFeasts.AnyDay"
        ];
        if (btn.btnID === btnIncenseVespers.btnID)
            sequence[0] = sequence[0].replace('Dawn', 'Vespers');
        let doxologies = sequence
            .map(doxologyTitle => {
            return PrayersArrays.DoxologiesPrayersArray
                .filter(tbl => splitTitle(tbl[0][0])[0] === doxologyTitle)[0];
        });
        if (doxologies.length === 0)
            return console.log('doxologies = ', doxologies);
        doxologies.reverse().forEach(tbl => tbl.reverse());
        insertPrayersAdjacentToExistingElement(doxologies, btn.languages, { beforeOrAfter: 'afterend', el: doxologiesPlaceHolder });
    })();
    (async function insertSeasonalCymbalVersesAndDoxologies() {
        if (Object.entries(copticFeasts)
            .filter(entry => entry[1] === copticDate)
            .length === 1) {
            if (copticDate === copticFeasts.theTwentyNinethOfCopticMonth
                && [4, 5, 6].indexOf(Number(copticMonth)) > 0)
                return; //The 29th of the Coptic month is not celebrated for Kiahk, Toubah and Amshir
            insertElements(copticDate);
        }
        else if (copticReadingsDate === copticFeasts.LazarusSaturday
            || copticReadingsDate === copticFeasts.PalmSunday) {
            insertElements(copticReadingsDate);
        }
        else if (Season === Seasons.Kiahk
            || Season === Seasons.GreatLent) {
            insertElements(Season);
        }
        else if (Season === Seasons.PentecostalDays) {
            //We will create a string variable that will hold the string expresion of the feast or the season
            let date = Seasons.PentecostalDays; //this is the initial value for the Pentescostal season
            if (copticReadingsDate === copticFeasts.Ascension
                || Number(copticReadingsDate.split(Seasons.PentecostalDays)[1]) > 39)
                date = copticFeasts.Ascension;
            insertElements(date);
            (function replaceStMaykeVerse() {
                //We will replace the 'annual' cymbal verse of St. Maykel by the Pentecostal verse, and will move the verse
                let propName, entries = Object.entries(copticFeasts).filter(prop => prop[1] === date);
                if (entries.length === 1)
                    propName = 'copticFeasts.' + entries[0][0]; //This should yield 'copticFeasts.Ascension'   
                else if (entries.length === 0)
                    entries = Object.entries(Seasons).filter(prop => prop[1] === date);
                if (entries.length === 1)
                    propName = 'Seasons.' + entries[0][0]; //This should yield 'Seasons.Pentecostal'
                console.log('propName = ', propName);
                let stMaykelAnnual = selectElementsByDataRoot(btn.docFragment, Prefix.cymbalVerses + 'Common&D=$copticFeasts.AnyDay', { equal: true })[3], //this is the 'annual' Cymbal verse  of container
                stMaykelPentecostal = selectElementsByDataRoot(btn.docFragment, Prefix.cymbalVerses + 'StMaykel&D=$' + propName, { equal: true })[0]; //this is the newly inserted Cymbal verse
                if (stMaykelAnnual && stMaykelPentecostal) {
                    console.log('found');
                    stMaykelAnnual.insertAdjacentElement('beforebegin', stMaykelPentecostal);
                    //Removing the Annual verse
                    stMaykelAnnual.remove();
                }
                ;
            })();
            (function InsertLordsFeastFinal() {
                //Inserting the Final Cymbal verses for the joyfull days and Lord's Feasts
                let final = PrayersArrays.CymbalVersesPrayersArray.filter(table => table[0][0] === Prefix.cymbalVerses + 'LordFeastsEnd&D=$copticFeasts.AnyDay&C=Title'), annualVerses = selectElementsByDataRoot(btn.docFragment, Prefix.cymbalVerses + 'Common&D=$copticFeasts.AnyDay', { equal: true }); //annualVereses[8] is the St. Markos annual verse, we will delete the annual verses after it
                for (let i = 13; i > 6; i--) {
                    annualVerses[i].remove();
                }
                insertPrayersAdjacentToExistingElement(final, btnIncenseDawn.languages, { beforeOrAfter: 'beforebegin', el: annualVerses[6].nextElementSibling });
            })();
        }
        ;
        function insertElements(date) {
            insertCymbalVersesForFeastsAndSeasons({
                coptDate: date,
                container: btn.docFragment,
                position: 'afterend',
                placeHolder: cymbalsPlaceHolder,
            });
            insertDoxologiesForFeastsAndSeasons({
                coptDate: date,
                container: btn.docFragment,
                position: 'afterend',
                placeHolder: doxologiesPlaceHolder
            });
        }
        ;
    })();
}
;
/**
 * Searchs for the cymbal verses of a coptDate, and if found, insert them adjacent to the first element retrieved by a given "data-root" attribute
 * @param {string[][][]} cymbalVerses -  an array of filtered cymbal verses that will be inserted, if not provided, the cymbalVersesArray will be filtered by the coptDate value
 * @param {string} coptDate - string representing the day and month of the coptic calendar: "ddmm"
 * @param {InsertPosition} position - the insertio position of the cymbal verses
 * @param {boolean} remove - indicates whether to delete or not all the elements having the same data-root
 * @returns
 */
async function insertCymbalVersesForFeastsAndSeasons(param) {
    if (!param.coptDate)
        param.coptDate = copticDate;
    if (!param.position)
        param.position = "afterend";
    if (!param.container)
        return console.log('param.container = ', param.container);
    if (!param.placeHolder)
        console.log('param.placeHolder = ', param.placeHolder);
    //Retrieving the cymbal vereses of the feast or season
    if (!param.cymbalVerses && param.coptDate) {
        param.cymbalVerses = PrayersArrays.CymbalVersesPrayersArray.filter((tbl) => eval(splitTitle(tbl[0][0])[0].split("&D=")[1].replace("$", "")) ===
            param.coptDate);
    }
    if (param.coptDate in lordGreatFeasts) {
        //If we are on a Lord Feast, we add "Eb'oro" to the end
        let endCymbals = PrayersArrays.CymbalVersesPrayersArray.filter((tbl) => splitTitle(tbl[0][0])[0] ===
            Prefix.cymbalVerses + "LordFeastsEnd&D=$copticFeasts.AnyDay");
        if (param.coptDate === copticFeasts.Resurrection
            || param.coptDate === copticFeasts.Ascension
            || param.coptDate === copticFeasts.Pentecoste) {
            //Inserting the special Cymbal Verse for St. Maykel
            param.cymbalVerses = [
                ...param.cymbalVerses,
                ...PrayersArrays.CymbalVersesPrayersArray.filter((tbl) => splitTitle(tbl[0][0])[0] ==
                    Prefix.cymbalVerses + "StMaykel&D=$copticFeasts.Resurrection "),
            ];
        }
        if (endCymbals) {
            param.cymbalVerses = [...param.cymbalVerses, ...endCymbals];
        }
    }
    param.cymbalVerses.reverse().forEach(tbl => tbl.reverse());
    insertPrayersAdjacentToExistingElement(param.cymbalVerses, btnIncenseDawn.languages, {
        beforeOrAfter: param.position,
        el: param.placeHolder,
    });
}
async function insertDoxologiesForFeastsAndSeasons(param) {
    if (!param.container)
        param.container = containerDiv;
    let doxology;
    doxology = PrayersArrays.DoxologiesPrayersArray.filter((d) => d[0][0]
        && splitTitle(d[0][0].split('&D=')[1])[0]
        && eval(String(splitTitle(d[0][0].split('&D=')[1])[0].replace('$', ''))) ===
            param.coptDate);
    //If we are during the Great Lent, we will select the doxologies according to whether the day is a Saturday or a Sunday, or an ordinary week day
    if (param.coptDate === Seasons.GreatLent) {
        if (todayDate.getDay() === 0 || todayDate.getDay() === 6) {
            //We are during the Great Lent and the day is a Saturday or a Sunday
            doxology = doxology.filter((d) => /GreatLentSundays\&D\=/.test(d[0][0]) === true);
        }
        else {
            doxology = doxology.filter((d) => /GreatLentWeek\d{1}\&D\=/.test(d[0][0]) === true);
        }
    }
    if (doxology) {
        doxology.reverse().forEach(tbl => tbl.reverse());
        insertPrayersAdjacentToExistingElement(doxology, btnIncenseDawn.languages, {
            beforeOrAfter: param.position,
            el: param.placeHolder,
        });
    }
}
async function removeElementsByTheirDataRoot(container = containerDiv, dataRoot) {
    selectElementsByDataRoot(container, dataRoot, { equal: true })
        .forEach(el => el.remove());
}
/**
 * Adds a button that when clicked shows or hides certain prayers from containerDiv
 * @param {HTMLElement} insertion - the html element before which the button will be inserted
 * @param {string} btnID - the id of the html element button that will be created
 * @param {typeBtnLabel} label - the label of the button that will be created
 * @param {string[][][]} prayers - the prayers that will shown or hidden or shown
 * @returns {HTMLDivElement} - the created div element that contains the prayers, and will be hidden or shown when the button is clicked
 */
function addExpandablePrayer(insertion, btnID, label, prayers, languages) {
    // if(!prayers || prayers.length ===0) return console.log(prayers);
    if (!insertion)
        return console.log('btnID = ', btnID);
    let btnDiv = document.createElement("div"); //Creating a div container in which the btn will be displayed
    btnDiv.classList.add("inlineBtns");
    insertion.insertAdjacentElement("beforebegin", btnDiv); //Inserting the div containing the button as 1st element of containerDiv
    let btnExpand = new Button({
        btnID: btnID,
        label: label,
        cssClass: inlineBtnClass,
        languages: languages,
        onClick: btnOnClick
    });
    async function btnOnClick() {
        let prayersContainerDiv = containerDiv.querySelector('#' + btnExpand.btnID + 'Expandable');
        if (!prayersContainerDiv)
            return console.log('no collapsable div was found');
        prayersContainerDiv.classList.toggle(hidden);
        //Making the children classList match prayersContainerDiv classList
        if (prayersContainerDiv.classList.contains(hidden))
            hideOrShowAllTitlesInAContainer(prayersContainerDiv, true);
        else
            hideOrShowAllTitlesInAContainer(prayersContainerDiv, false);
    }
    ;
    let createdButton = createBtn(btnExpand, btnDiv, btnExpand.cssClass, true, btnExpand.onClick); //creating the html element representing the button. Notice that we give it as 'click' event, the btn.onClick property, otherwise, the createBtn will set it to the default call back function which is showChildBtnsOrPrayers(btn, clear)
    //We will create a newDiv to which we will append all the elements in order to avoid the reflow as much as possible
    let prayersContainerDiv = document.createElement('div');
    prayersContainerDiv.id = btnExpand.btnID + 'Expandable';
    prayersContainerDiv.classList.add(hidden);
    prayersContainerDiv.classList.add('Expandable');
    prayersContainerDiv.style.display = 'grid'; //This is important, otherwise the divs that will be add will not be aligned with the rest of the divs
    insertion.insertAdjacentElement('beforebegin', prayersContainerDiv);
    //We will create a div element for each row of each table in btn.prayersArray
    let htmlRow;
    prayers
        .forEach(table => {
        table
            .forEach(row => {
            htmlRow = createHtmlElementForPrayer({
                tblRow: row,
                languagesArray: btnExpand.languages,
                position: prayersContainerDiv,
                container: prayersContainerDiv,
            });
        });
    });
    Array.from(prayersContainerDiv.children)
        .filter(child => checkIfTitle(child))
        .forEach(child => {
        addDataGroupsToContainerChildren(child.classList[child.classList.length - 1], prayersContainerDiv);
    });
    return [createdButton, prayersContainerDiv];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZUJ1dHRvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2R1bGVzL0RlY2xhcmVCdXR0b25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sTUFBTTtJQWlCVixZQUFZLEdBQWU7UUFYbkIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQVlsQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7UUFDNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDcEIsR0FBRyxDQUFDLFFBQVE7WUFDVixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNB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