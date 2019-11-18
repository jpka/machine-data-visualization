import { MetricsOpts } from './types'
import axios from 'axios'
import { GetTimeRangeResponse } from '../server/models/machine-log.model'

export const getActiveMetrics = (metrics: MetricsOpts) =>
	Object.keys(metrics).filter(
		metric => metrics[metric].show || metrics[metric].graph
	)

export const queryParams: any =
	typeof window !== 'undefined'
		? new URLSearchParams(window.location.search)
		: { get: () => undefined }

export const fetchMetrics = ({
	metrics = [] as string[],
	...otherParams
}): Promise<GetTimeRangeResponse> => {
	const params = { metrics: metrics.join(',') }
	queryParams.forEach((value, key) => {
		params[key] = value
	})

	return axios
		.get('/api/machine-logs', {
			params: { ...params, ...otherParams }
		})
		.then(({ data }) => data)
}
