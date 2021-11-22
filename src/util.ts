/**
 *
 * Converts a time string into one that can be stored in the database.
 *
 */
export const timekey = (key: string) => key.replace(/:/g, '-')
