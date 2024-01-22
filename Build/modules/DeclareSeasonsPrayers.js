const giakiAll = [
    {
        Season: Seasons.NoSeason,
        AR: 'لأنَّكَ أتيْتَ وخَلصْتَنا',
        CA: 'جي آك إي أكسوتي إمّون',
        FR: 'car Tu es venu et nous as sauvés',
        EN: 'for You\'ve come and saved us',
        COP: 'ϫⲉ ⲁⲕ̀\' ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.Nativity,
        AR: 'لأنَّكَ ولِدتَ وخَلصْتَنا',
        CA: 'جي آك ماسف أكسوتي إمّون',
        FR: 'car Tu es né et nous as sauvés',
        EN: 'for You\'ve born and saved us',
        COP: 'ϫⲉ ⲁⲩⲙⲁⲥⲕ ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.Baptism,
        AR: 'لأنَّكَ اعتمدت وخَلصْتَنا',
        CA: 'جي آك أومس أكسوتي إمّون',
        FR: 'car Tu es baptisé et nous as sauvés',
        EN: 'for You\'ve been baptized and saved us',
        COP: 'ϫⲉ ⲁⲕϭⲓⲱⲙⲥ ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.PentecostalDays,
        AR: 'لأنَّكَ قُمتَ وخَلصْتَنا',
        CA: 'جي آك تونك أكسوتي إمّون',
        FR: 'car Tu es ressuscité et nous as sauvés',
        EN: 'for You\'ve raised and saved us',
        COP: 'ϫⲉ ⲁⲕⲧⲱⲛⲕ ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
    {
        Season: Seasons.CrossFeast,
        AR: 'لأنكَ صُلبتَ وخَلصْتَنا',
        CA: 'جي آك آشك أكسوتي إمّون',
        FR: 'car Tu as été crucifié et nous as sauvés',
        EN: 'for You\'ve been crucified and saved us',
        COP: 'ϫⲉ ⲁⲕ̀\' ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ'
    },
];
const closingHymnAll = [
    //This is the variable part of 'Amin Alleluia Zoksa Patri...' closing hymn
    {
        Season: 'River',
        AR: 'بارك مياه الأنهار',
        CA: 'اسمو إنيمؤو إمبيف يارو',
        FR: 'bénis les eaux des fleuves',
        EN: '',
        COP: 'Ⲥ̀ⲙⲟⲩ ⲉ̀ⲛⲓⲙⲱⲟⲩ ⲙ̀ⲫⲓⲁⲣⲟⲩ'
    },
    {
        Season: 'Plants',
        AR: 'بارك الزروع والعشب',
        CA: 'اسمو إينيسيتي نيم نيسيم',
        FR: 'Bénis les semences et les fourrages',
        EN: '',
        COP: 'Ⲥ̀ⲙⲟⲩ ⲉ̀ⲛⲓⲥⲓϯ ⲛⲉⲙ ⲛⲓⲥⲓⲙ'
    },
    {
        Season: 'Harvest',
        AR: 'بارك أهوية السماء',
        CA: 'اسمو إي إنيائير إنتي إتفي',
        FR: 'Bénis les pluies',
        EN: '',
        COP: 'Ⲥ̀ⲙⲟⲩ ⲉ̀ⲛⲓⲁⲏⲣ ⲛ̀ⲧⲉ ⲧ̀ⲫⲉ'
    },
    {
        Season: 'Resurrection',
        AR: 'ملك المجد قام من بين الأموات',
        CA: 'إبؤورو إنتي إبؤ أو آفطونف إيفول خين نيئثموؤت',
        FR: 'le roi de gloire est résuscité le troisième jour',
        EN: '',
        COP: 'Ⲁϥⲧⲱⲛϥ ⲉ̀ⲃⲟⲗ ϧⲉⲛ ⲛⲏⲉⲑⲙⲱⲟⲩⲧ ϧⲉⲛ ⲡⲓⲉ̀ϩⲟⲟⲩ'
    }
];
var giaki = {}, closingHymn = {};
let allSeasonalPrayers = [[giaki, giakiAll]];
async function setSeasonalTextForAll(season) {
    allSeasonalPrayers
        .forEach(seasonal => {
        Object.assign(seasonal[0], setSeasonalText(seasonal[1], season));
    });
    setClosingHymn();
}
;
function setSeasonalText(arrayAll, season) {
    if (!arrayAll)
        return;
    let found;
    //If we are a Sunday, giAki will be ge aktonk as during the Pentecostal Days
    if (todayDate.getDay() === 0)
        return arrayAll.find(resp => resp.Season === Seasons.PentecostalDays);
    //If we it is the Circumcision Feast, giAki will be 'ge ak masf'
    if (copticDate === copticFeasts.Circumcision)
        return arrayAll.find(resp => resp.Season === Seasons.Nativity);
    found = arrayAll.find(resp => resp.Season === season);
    if (!found
        && (copticReadingsDate === copticFeasts.PalmSunday && todayDate.getHours() > 15)
        || HolyWeek.indexOf(copticReadingsDate) > -1)
        found = arrayAll.find(resp => resp.Season === Seasons.CrossFeast);
    if (!found)
        found = arrayAll.find(resp => resp.Season === Seasons.NoSeason);
    if (found)
        return found;
}
function setClosingHymn(day, month) {
    let index;
    if (checkIf29thOfCopticMonth || Season === Seasons.PentecostalDays)
        index = closingHymnAll.indexOf(closingHymnAll.find(hymn => hymn.Season === 'Resurrection'));
    else
        index = getAgricultureSeason(day, month);
    Object.assign(closingHymn, closingHymnAll[index]);
}
;
function getAgricultureSeason(day, month) {
    if (!day)
        day = Number(copticDay) - 1;
    if (!month)
        month = Number(copticMonth);
    let daysNumber = day + ((month - 1) * 30);
    console.log(daysNumber);
    if (daysNumber < 38 || daysNumber >= 282) {
        console.log('we are between 12/10 and 09/02');
        return 0; //River litany
    }
    else if (daysNumber >= 38 && daysNumber < 129) {
        console.log('we are between 10/02 and 10/05');
        return 1; //Plants litany
    }
    else if (daysNumber >= 129) {
        console.log('we are between 11/05 and 11/10');
        return 2; //Harvest litany
    }
}
function checkIf29thOfCopticMonth() {
    if (Number(copticDay) !== 29
        || (Number(copticMonth) > 3 && Number(copticMonth) < 8))
        return false;
    else
        return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjbGFyZVNlYXNvbnNQcmF5ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbW9kdWxlcy9EZWNsYXJlU2Vhc29uc1ByYXllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsTUFBTSxRQUFRLEdBQXNCO0lBQ2hDO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSwyQkFBMkI7UUFDL0IsRUFBRSxFQUFFLHVCQUF1QjtRQUMzQixFQUFFLEVBQUUsa0NBQWtDO1FBQ3RDLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQ3hCLEVBQUUsRUFBRSwyQkFBMkI7UUFDL0IsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUsZ0NBQWdDO1FBQ3BDLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsR0FBRyxFQUFFLHVCQUF1QjtLQUMvQjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBQ3ZCLEVBQUUsRUFBRSwyQkFBMkI7UUFDL0IsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUscUNBQXFDO1FBQ3pDLEVBQUUsRUFBRSx3Q0FBd0M7UUFDNUMsR0FBRyxFQUFFLHdCQUF3QjtLQUNoQztJQUNEO1FBRUksTUFBTSxFQUFFLE9BQU8sQ0FBQyxlQUFlO1FBQy9CLEVBQUUsRUFBRSwwQkFBMEI7UUFDOUIsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUsd0NBQXdDO1FBQzVDLEVBQUUsRUFBRSxpQ0FBaUM7UUFDckMsR0FBRyxFQUFFLHVCQUF1QjtLQUMvQjtJQUNEO1FBQ0ksTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVO1FBQzFCLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLHdCQUF3QjtRQUM1QixFQUFFLEVBQUUsMENBQTBDO1FBQzlDLEVBQUUsRUFBRSx5Q0FBeUM7UUFDN0MsR0FBRyxFQUFFLHNCQUFzQjtLQUM5QjtDQUNKLENBQUM7QUFDRixNQUFNLGNBQWMsR0FBc0I7SUFDdEMsMEVBQTBFO0lBQzFFO1FBQ0ksTUFBTSxFQUFFLE9BQU87UUFDZixFQUFFLEVBQUUsbUJBQW1CO1FBQ3ZCLEVBQUUsRUFBRSx3QkFBd0I7UUFDNUIsRUFBRSxFQUFFLDRCQUE0QjtRQUNoQyxFQUFFLEVBQUUsRUFBRTtRQUNOLEdBQUcsRUFBRSx5QkFBeUI7S0FDakM7SUFDRDtRQUNJLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLEVBQUUsRUFBRSxvQkFBb0I7UUFDeEIsRUFBRSxFQUFFLHlCQUF5QjtRQUM3QixFQUFFLEVBQUUscUNBQXFDO1FBQ3pDLEVBQUUsRUFBRSxFQUFFO1FBQ04sR0FBRyxFQUFFLHlCQUF5QjtLQUNqQztJQUNEO1FBQ0ksTUFBTSxFQUFFLFNBQVM7UUFDakIsRUFBRSxFQUFFLG1CQUFtQjtRQUN2QixFQUFFLEVBQUUsMkJBQTJCO1FBQy9CLEVBQUUsRUFBRSxrQkFBa0I7UUFDdEIsRUFBRSxFQUFFLEVBQUU7UUFDTixHQUFHLEVBQUUseUJBQXlCO0tBQ2pDO0lBQ0Q7UUFDSSxNQUFNLEVBQUUsY0FBYztRQUN0QixFQUFFLEVBQUUsOEJBQThCO1FBQ2xDLEVBQUUsRUFBRSw4Q0FBOEM7UUFDbEQsRUFBRSxFQUFFLGtEQUFrRDtRQUN0RCxFQUFFLEVBQUUsRUFBRTtRQUNOLEdBQUcsRUFBRSx5Q0FBeUM7S0FDakQ7Q0FDSixDQUFDO0FBR0YsSUFBSSxLQUFLLEdBQUUsRUFBcUIsRUFDaEMsV0FBVyxHQUFFLEVBQXFCLENBQUM7QUFFbkMsSUFBSSxrQkFBa0IsR0FBMEMsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBRXBGLEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxNQUFhO0lBQ2xELGtCQUFrQjtTQUNiLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQyxDQUFDLENBQUM7SUFDSCxjQUFjLEVBQUUsQ0FBQztBQUVyQixDQUFDO0FBQUEsQ0FBQztBQUVGLFNBQVMsZUFBZSxDQUFDLFFBQTJCLEVBQUUsTUFBYztJQUNoRSxJQUFJLENBQUMsUUFBUTtRQUFFLE9BQU87SUFDdEIsSUFBSSxLQUFzQixDQUFDO0lBQzNCLDRFQUE0RTtJQUM1RSxJQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSSxDQUFDO1FBQUUsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7SUFFbEcsZ0VBQWdFO0lBQ2hFLElBQUcsVUFBVSxLQUFJLFlBQVksQ0FBQyxZQUFZO1FBQUUsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFM0csS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDO0lBRXRELElBQUksQ0FBQyxLQUFLO1dBQ0gsQ0FBQyxrQkFBa0IsS0FBSyxZQUFZLENBQUMsVUFBVSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUM7V0FDN0UsUUFBUSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU1QyxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRXRFLElBQUksQ0FBQyxLQUFLO1FBQ04sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVwRSxJQUFJLEtBQUs7UUFBRSxPQUFPLEtBQUssQ0FBQztBQUM1QixDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsR0FBWSxFQUFFLEtBQWM7SUFDaEQsSUFBSSxLQUFhLENBQUM7SUFDbEIsSUFBSSx3QkFBd0IsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLGVBQWU7UUFBRSxLQUFLLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDOztRQUUzSixLQUFLLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTlDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBRXRELENBQUM7QUFBQSxDQUFDO0FBRUYsU0FBUyxvQkFBb0IsQ0FBQyxHQUFXLEVBQUUsS0FBYTtJQUNwRCxJQUFJLENBQUMsR0FBRztRQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxLQUFLO1FBQUUsS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN4QyxJQUFJLFVBQVUsR0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BCLElBQUksVUFBVSxHQUFHLEVBQUUsSUFBSSxVQUFVLElBQUksR0FBRyxFQUFFO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsQ0FBQyxDQUFDLGNBQWM7S0FDM0I7U0FBTSxJQUFJLFVBQVUsSUFBSSxFQUFFLElBQUksVUFBVSxHQUFHLEdBQUcsRUFBRTtRQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlO0tBQzVCO1NBQU0sSUFBSSxVQUFVLElBQUksR0FBRyxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsQ0FBQyxDQUFBLGdCQUFnQjtLQUM1QjtBQUNULENBQUM7QUFFRCxTQUFTLHdCQUF3QjtJQUM3QixJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFO1dBQ3JCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sS0FBSyxDQUFDOztRQUNWLE9BQU8sSUFBSSxDQUFBO0FBQ3BCLENBQUMifQ==