export type IctDeviceMetric = {
  id: "desktop" | "laptop"
  label: string
  value: number
  detail: string
}

export type IctEquipmentAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  totalDesktop: IctDeviceMetric
  totalLaptop: IctDeviceMetric
}
