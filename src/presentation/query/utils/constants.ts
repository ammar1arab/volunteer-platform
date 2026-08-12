/** Stable empty collections — avoid `?? []` creating new refs every render. */
export const EMPTY_ARRAY: readonly never[] = Object.freeze([]);
