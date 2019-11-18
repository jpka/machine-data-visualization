import moment from 'moment'

export const toDate = val => {
	if (val instanceof Date) return val
	//@ts-ignore
	if (typeof val === 'string' && !isNaN(val)) {
		val = parseInt(val)
	}
	return moment(val).toDate()
}
