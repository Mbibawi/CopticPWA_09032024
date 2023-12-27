const IncensePrayersSequence: string[] =[ 
    Prefix.commonIncense + "EleysonImas&D=$copticFeasts.AnyDay", 
    Prefix.commonIncense+"CymbalVersesPlaceHolder&D=$copticFeasts.AnyDay", 
    Prefix.commonIncense+"Comment1&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer + "BlockShlilIriniPassi&D=$copticFeasts.AnyDay",
    Prefix.incenseVespers + "PriestLitaniesComment&D=$copticFeasts.AnyDay", 
    Prefix.incenseDawn+"SickPrayer&D=$copticFeasts.AnyDay", 
    Prefix.incenseDawn + "TravelersPrayer&D=$copticFeasts.AnyDay", 
    Prefix.incenseDawn + "OblationsPrayer&D=$copticFeasts.AnyDay", 
    Prefix.incenseVespers + "DepartedPrayer&D=$copticFeasts.AnyDay", 
    Prefix.commonIncense+"DoxolgiesComment&D=$copticFeasts.AnyDay",
    Prefix.commonPrayer+"AngelsPrayer&D=$copticFeasts.AnyDay", 
    Prefix.incenseVespers+"LordKeepUsThisNightWithoutSin&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer + "HolyGodHolyPowerfull&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer+"OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer + "WeSaluteYouMary&D=$copticFeasts.AnyDay", 
    Prefix.commonIncense+"DoxologiesPlaceHolder&D=$copticFeasts.AnyDay",  
    Prefix.commonPrayer+"WeExaltYouStMary&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer+"Creed&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer + "EfnotiNaynan&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer+"GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer+"OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer+"GospelLitanyComment4&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer+"BlockInTheNameOfOurLord&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer+"GospelLitanyComment5&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer+"BlockIriniPassi&D=$copticFeasts.AnyDay", 
    Prefix.commonPrayer + "AbsolutionForTheSon&D=$copticFeasts.AnyDay", 
    Prefix.commonIncense+"LiturgyEnd&D=$copticFeasts.AnyDay"
]
; //    this is the generic sequence of all prayers for incense dawn and incense vespers. The onClick function triggered by btnIncenseDawn and btnIncenseVespers, will remove what is irrelevant and add what needs to be added according to whether it is a Dawn or Vespers office
    
    
const MassPrayersSequences = {
    //those are the sequences of the 'Baptized' mass prayers (starting from Reconciliation) for each mass
    MassUnbaptized: [
        Prefix.massCommon+"GloryAndHonor&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"HallelujahFayBiBi&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"HallelujahFayBiBiFast&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"BenedictionOfTheLambPart1&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer+"Amen&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"BenedictionOfTheLambPart2&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer+"Amen&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"BenedictionOfTheLambPart3&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer+"Amen&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"DiaconResponseOneIsTheHolyGodPart1&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"DiaconResponseOneIsTheHolyGodPart2&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"DiaconResponseOneIsTheHolyGodPart3&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer+"GloryToTheFatherTheSonAndTheSpirit&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer + "BlockShlilIriniPassi&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer + "ThanksGiving&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"AbsolutionForTheFather&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer+"WeHaveBeenSavedWithYou&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"Tayshoury&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"Tishoury&D=$copticFeasts.AnyDay", 
        Prefix.massCommon + "IntercessionsHymn&D=$copticFeasts.AnyDay", 
        Prefix.praxisResponse+"PraxisResponsePart1&D=$copticFeasts.AnyDay", 
        Prefix.praxisResponse+"PraxisResponsePart2&D=$copticFeasts.AnyDay", 
        Prefix.massCommon + 'ReadingsPlaceHolder&D=&D=$copticFeasts.AnyDay',
        Prefix.commonPrayer+"HolyGodHolyPowerfullPart1&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer + "GloryToTheFatherTheSonAndTheSpirit&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer+"HolyGodHolyPowerfullPart2&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer + "BlockShlilIriniPassi&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer+"GospelPrayerPlaceHolder&D=$copticFeasts.AnyDay",
        Prefix.commonPrayer+"Creed&D=$copticFeasts.AnyDay"
        ], //Those are the prayers of the 'Unbaptized Mass'
        MassCommonIntro:[
        Prefix.massCommon+"ReconciliationComment&D=$copticFeasts.AnyDay", 
        Prefix.commonPrayer + "BlockShlilIriniPassi&D=$copticFeasts.AnyDay",
        ], //the introduction of reconciliation for all masses
        MassStBasil: [
        Prefix.massStBasil+"Reconciliation&D=$copticFeasts.AnyDay", 
        Prefix.massStBasil  + "Anaphora&D=$copticFeasts.AnyDay", 
        Prefix.massStBasil + "Agios&D=$copticFeasts.AnyDay", 
        Prefix.massStBasil+"InstitutionNarrative&D=$copticFeasts.AnyDay",  
        Prefix.massCommon + "AsWeAlsoCommemorateHisHolyPassionPart1&D=$copticFeasts.AnyDay", 
        ], //The sequence of prayers of St Basil Mass (starting from Reconciliation)
        MassStGregory: [
        Prefix.massStGregory+"Reconciliation&D=$copticFeasts.AnyDay", 
        Prefix.massStGregory + "Anaphora&D=$copticFeasts.AnyDay", 
        Prefix.massStGregory+"Agios&D=$copticFeasts.AnyDay", 
        Prefix.massStGregory+"AsWeCommemorateYourHolyPassionPart1&D=$copticFeasts.AnyDay", 
        Prefix.massStGregory+"CallOfTheHolySpiritPart1&D=$copticFeasts.AnyDay", 
        Prefix.massStGregory + "LitaniesIntroduction&D=$copticFeasts.AnyDay",
        Prefix.massStGregory + "Litanies&D=$copticFeasts.AnyDay",
        Prefix.massStGregory + "FractionIntroduction&D=$copticFeasts.AnyDay"
        ], //The sequence of prayers of St Gregory Mass (starting from reconciliation)
        MassStCyril:[
        Prefix.massStCyril+"Reconciliation&D=$copticFeasts.AnyDay",  
        Prefix.massStCyril + "Anaphora&D=$copticFeasts.AnyDay", 
        Prefix.massStCyril+"InstitutionalNarrative&D=$copticFeasts.AnyDay", 
        

        Prefix.massStCyril+"Part8&D=$copticFeasts.AnyDay", 
   
        Prefix.massStCyril+"Part9&D=$copticFeasts.AnyDay", 
        Prefix.massStCyril+"Part10&D=$copticFeasts.AnyDay", 
        Prefix.massStCyril+"LitaniesIntroduction&D=$copticFeasts.AnyDay",
        ], // the sequence of prayers of St Cyril Mass (starting from Reconciliation)
        MassStJohn: [], // the sequence of prayers of St John Mass (tarting from Reconciliation)
        MassCallOfHolySpirit:[ 
            Prefix.massCommon + "CallOfTheHolySpiritPart1&D=$copticFeasts.AnyDay",
        ],
        MassLitanies: [ 
            Prefix.massCommon+"LitaniesIntroduction&D=$copticFeasts.AnyDay",  
            Prefix.massCommon + "SaintsCommemoration&D=$copticFeasts.AnyDay", 
            Prefix.massCommon+"CommemorationOfTheDeparted&D=$copticFeasts.AnyDay", 
            Prefix.massCommon+"FractionIntroduction&D=$copticFeasts.AnyDay", 
            Prefix.commonPrayer+"OurFatherWhoArtInHeaven&D=$copticFeasts.AnyDay", 
            Prefix.commonPrayer + "BlockInTheNameOfOurLord&D=$copticFeasts.AnyDay", 
            Prefix.massCommon+"PrayerForTheFather&D=$copticFeasts.AnyDay",
            Prefix.commonPrayer + "BlockIriniPassi&D=$copticFeasts.AnyDay", 
            Prefix.massCommon+"AbsolutionPrayerForTheFather&D=$copticFeasts.AnyDay",
            Prefix.massCommon + "ConfessionIntroduction&D=$copticFeasts.AnyDay", 
            Prefix.massCommon+"Confession&D=$copticFeasts.AnyDay", 
            Prefix.commonPrayer+"ZoksasiKyrie&D=$copticFeasts.AnyDay"
            ], //The litanies. They are common to all masses except 
        Communion: [
        Prefix.massCommon+"CommunionPsalm150&D=$copticFeasts.AnyDay", 
        Prefix.massCommon+"LiturgyEnd&D=$copticFeasts.AnyDay", 
    ], //the sequence of prayers from 'Confession' until the end of the mass, it is common to all masses 
}; 

const PsalmodyPrayersSequences = {
    PsalmodyYear: [
        Prefix.psalmody + "WakeUpSonsOfLight&D=$Seasons.KiahkWeek1||$Seasons.KiahkWeek2",
   
        Prefix.psalmody + "PsalyOnFirstHos&D=$Seasons.KiahkWeek1||$Seasons.KiahkWeek2||$copticFeasts.AnyDay"
    ],
    
    PsalmodyKiahk: [ 
        Prefix.psalmody+"WakeUpSonsOfLight&D=$Seasons.KiahkWeek1||$Seasons.KiahkWeek2",
              
        Prefix.psalmody+"KiahkHos&D=$Seasons.KiahkWeek1||Seasons.KiahkWeek2",
    
        Prefix.psalmody + "ChantAgiosOsiOs&D=$Seasons.KiahkWeek1||Seasons.KiahkWeek2",
        
        Prefix.psalmody+"EpsalyOnFirstHos&D=$Seasons.KiahkWeek1||$Seasons.KiahkWeek2||$copticFeasts.AnyDay",
          
        Prefix.psalmody+"FirstHos&D=$copticFeasts.AnyDay||$Seasons.KiahkWeek1||$Seasons.KiahkWeek2",
    
        Prefix.psalmody+"LobshFirstHos&D=$copticFeasts.AnyDay||$Seasons.KiahkWeek1||$Seasons.KiahkWeek2",
          
        Prefix.psalmody + "ChantGodSaidToMoses&D=$copticFeasts.AnyDay||$Seasons.KiahkWeek1||$Seasons.KiahkWeek2",

        Prefix.psalmody + "CommentaryOnHos1&D=$copticFeasts.AnyDay||$Seasons.KiahkWeek1||Seasons.KiahkWeek2",

        Prefix.psalmody + "PsalyOnSecondHos&D=$Seasons.KiahkWeek1||$Seasons.KiahkWeek2||$copticFeasts.AnyDay",
    ],
}   

