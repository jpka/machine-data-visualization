import { MetricsOpts } from './types'
import axios from 'axios'
import { GetTimeRangeResponse } from '../server/models/machine-log.model'

export const getActiveMetrics = (metrics: MetricsOpts) =>
	Object.keys(metrics).filter(
		metric => metrics[metric].show || metrics[metric].graph
	)

export const fetchMetrics = ({
	metrics = [] as string[],
	...otherParams
}): Promise<GetTimeRangeResponse> =>
	axios
		.get('/api/machine-logs', {
			params: { metrics: metrics.join(','), ...otherParams }
		})
		.then(({ data }) => data)

export const queryParams: any =
	typeof window !== 'undefined'
		? new URLSearchParams(window.location.search)
		: { get: () => undefined }
