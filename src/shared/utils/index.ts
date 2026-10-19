/** shared/utils — ids, dates, text, sleep. */
export { cx } from './cx';
export { uid } from './ids';
export { nowFrom, addDays, dayPart, formatShortDate, dayKey, daysBetween, formatTime, formatDayDate } from './dates';
export type { Clock, DayPart } from './dates';
export { interpolate } from './text';
export { sleep } from './sleep';
export { validateDocument, documentFormatOf, isFutureDocumentDate } from './validateDocument';
export type { DocumentCheck, PickedFile } from './validateDocument';
