import {Request, Response, Router} from 'express';
import {query, validationResult} from 'express-validator';
import {CalculationMethod, Coordinates, PrayerTimes} from 'adhan';
import {ParamsDictionary} from 'express-serve-static-core';
import {StatusCodes} from 'http-status-codes';
import moment from 'moment-timezone';
import {validateTimeZone} from "../customValidators";

export const prayerTimesRouter = Router()

const dateFormat = 'DD/MM/YYYY'
const timeFormat = 'HH:mm'

prayerTimesRouter.get('/prayerTimes',
    query('timeZone').custom(validateTimeZone),
    query('latitude').isNumeric(),
    query('longitude').isNumeric(),
    query('longitude').isNumeric(),
    query('monthOfYear').isString().matches("^(0[1-9]|1[0-2])\\/\\d{4}$"),
    (req: PrayerTimesRequest, res: PrayerTimesResponse) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()})
        }

        const query = req.query
        const coordinates = new Coordinates(query.latitude, query.longitude);
        const params = CalculationMethod.MoonsightingCommittee();


        const date = moment(`01/${query.monthOfYear}`, dateFormat)

        const monthLastDay = date.clone().endOf('month').date()

        const result: DailyPrayers[] = []

        for (let currentDay = 1; currentDay <= monthLastDay; currentDay++) {
            const currentDate = date.clone().date(currentDay)

            const prayerTimes = new PrayerTimes(coordinates, currentDate.toDate(), params);

            result.push({
                'date': currentDate.format(dateFormat),
                'fajr': moment(prayerTimes.fajr).tz(query.timeZone).format(timeFormat),
                'sunrise': moment(prayerTimes.sunrise).tz(query.timeZone).format(timeFormat),
                'dhuhr': moment(prayerTimes.dhuhr).tz(query.timeZone).format(timeFormat),
                'asr': moment(prayerTimes.asr).tz(query.timeZone).format(timeFormat),
                // 'sunset': moment(prayerTimes.sunrise).tz(query.timeZone).format(timeFormat),
                'maghrib': moment(prayerTimes.maghrib).tz(query.timeZone).format(timeFormat),
                'isha': moment(prayerTimes.isha).tz(query.timeZone).format(timeFormat),
            })
        }

        res.json(result)
    })

type PrayerTimesRequest = Request<ParamsDictionary, any, any, Query>
type PrayerTimesResponse = Response

interface Query {
    timeZone: string,
    latitude: number,
    longitude: number,
    monthOfYear: string;
}

interface DailyPrayers {
    date: string
    'fajr': string,
    'sunrise': string
    'dhuhr': string,
    'asr': string,
    'maghrib': string,
    'isha': string
}