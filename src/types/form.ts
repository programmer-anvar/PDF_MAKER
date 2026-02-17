/** Form data schema – matches the sample collection record (채취정보) PDF structure */
export interface SampleCollectionForm {
  /** Section: Header / Company */
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

  /** 1. 시료채취 (Sample collection) */
  sampleDate: string
  samplePoint: string
  sampleTime: string
  weather: string
  temperature: string
  humidity: string
  pressure: string
  windDirection: string
  windSpeed: string

  /** 2. 연도 (Stack/Duct) */
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

  /** 3. 입자상물질 (Particulate) – one row for simplicity, can extend */
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

  /** 4. 가스상물질 (Gas) / 기타 */
  equipmentLeakTest: string
  collectorOpinion: string

  /** 5. 시료의 접수 (Acceptance) */
  acceptanceDate: string
  collector1Name: string
  collector2Name: string
  technicalManager: string
  receptionNumber: string
}
