/** Device geometry in CSS px = iPhone 15/16 points (docs/03-prototype-shell.md §3). */
export const DEVICE = {
  width: 393,
  height: 852,
  bezel: 13,
  safeTop: 59,
  safeBottom: 34,
  keyboardHeight: 291,
  /** Gap kept around the device when scaling to fit the stage. */
  stageGap: 48,
} as const;

export const DEVICE_OUTER = {
  width: DEVICE.width + DEVICE.bezel * 2,
  height: DEVICE.height + DEVICE.bezel * 2,
} as const;
