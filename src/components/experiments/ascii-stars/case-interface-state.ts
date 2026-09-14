export type CaseInterfacePose = { yaw: number; pitch: number }

export const caseInterfaceScale = (width: number, height: number) =>
  Math.min(width / 160, height / 94)

export const caseInterfaceFreezeEvent = 'vne:freeze-case-interface'
