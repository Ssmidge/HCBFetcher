/*
@copyright: MiniSsmidge Discord bot, 4th of January 2023.
@author: Adrian T
*/

/**
 * Remove excess decimal places from a number
 * Default number of decimal places is 2
 * @param {number} number The original number
 * @param {number} places The number of decimal places
 * @returns {number} The number with the excess decimal places removed
 */
const toFixedNumber = (number: number, places: number = 2): number => {
    if (!number) return 0;
    const offset : number = Number(`1e${places}`);
    return Math.floor(number * offset) / offset;
};

/**
 * Convert a number to a string with commas
 * @param {number} number The original number
 * @returns {String} The number with commas
 * @example 1000 -> 1,000
 * @example 1000000 -> 1,000,000
 * @example 1000000000 -> 1,000,000,000
*/
const numberWithCommas = (number: number): string => {
    if (!number) return "0";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export {
    toFixedNumber,
    numberWithCommas,
};