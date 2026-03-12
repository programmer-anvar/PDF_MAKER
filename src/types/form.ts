export interface SampleCollectionForm {
  title: string
  companyName: string
  address: string
  facilities: string
  mainProduct: string
  facilityType: string
  siteType: string
  representative: string
  envTechnician: string
  measurementPurpose: string
  measurementItems: string

  sampleDate: string
  samplePoint: string
  sampleTime: string
  weather: string
  temperature: string
  humidity: string
  pressure: string
  windDirection: string
  windSpeed: string

  gasMeterStart: string
  gasMeterEnd: string
  gasMeterTemp: string
  gasMeterGaugePressure: string
  moistureImpingerBefore: string
  moistureImpingerAfter: string
  moistureCalciumChloride: string
  dryGasVolume: string
  moisturePercent: string
  direction: string
  shape: string
  diameter: string
  crossSectionArea: string
  distanceFromPoint1: string
  distanceFromCenter1: string

  particulateRows: Array<{
    sampleTimeMin: string
    vacuumPressure: string
    gasTemp: string
    gasStaticPressure: string
    gasDynamicPressure: string
    orificePressure: string
    sampleVolume: string
    gasMeterTemp: string
    filterHolderTemp: string
    impingerOutTemp: string
  }>

  equipmentLeakTest: string
  collectorOpinion: string

  acceptanceDate: string
  collector1Name: string
  collector2Name: string
  technicalManager: string
  receptionNumber: string
}
