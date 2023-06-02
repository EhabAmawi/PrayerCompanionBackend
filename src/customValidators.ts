import {CustomValidator} from "express-validator/src/base";
import moment from "moment-timezone";

export const validateTimeZone: CustomValidator = async value => {
    if (moment.tz.zone(value) == null) {
        throw new Error('invalid value')
    }
}

export const isStringOrNull: CustomValidator = async value => {
    if (value !== undefined && typeof value !== 'string' && value !== null) {
        throw new Error('invalid value')
    }
}

/**
 * Check if country code is in ISO 3166-1 alpha-2 format
 */
export const countryCodeValidator: CustomValidator = async countryCode => {
    const regex = /^[A-Z]{2}$/;

    if (regex.test(countryCode)) return;

    throw 'invalid value, country code should use ISO 3166-1 alpha-2 format'

}

/**
 * Check if the countryCode is null/undefined/empty or if its valid
 */
export const countryCodeOrNullValidator: CustomValidator = async (countryCode, meta) => {
    if (countryCode == null) return

    if (typeof countryCode == 'string' && countryCode.length == 0) return

    await countryCodeValidator(countryCode, meta)
}