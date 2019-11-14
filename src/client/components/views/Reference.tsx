import React, { FC } from 'react'
import { MetricsOpts } from '../App'

const metricList = [
	'Iavg_A',
	'PF3',
	'PF2',
	'PF1',
	'S3',
	'S2',
	'S1',
	'Q3',
	'Q2',
	'Q1',
	'P3',
	'P2',
	'P1',
	'I3',
	'I2',
	'I1',
	'V31',
	'V23',
	'V12',
	'V3',
	'V2',
	'V1',
	'AI4',
	'AI3',
	'AI2',
	'AI1',
	'DI16',
	'DI15',
	'DI14',
	'DI13',
	'DI12',
	'DI11',
	'ETHD_Ic',
	'OTHD_Ic',
	'ETHD_Ib',
	'OTHD_Ib',
	'ETHD_Ia',
	'Vnavg_V',
	'VIavg_V',
	'OTHD_Ia',
	'ETHD_Vc',
	'OTHD_Vc',
	'ETHD_Vb',
	'OTHD_Vb',
	'ETHD_Va',
	'OTHD_Va',
	'THD_Iavg',
	'THD_Ic',
	'THD_Ib',
	'THD_Ia',
	'THD_Vavg',
	'THD_Vc',
	'THD_Vb',
	'THD_Va',
	'DMD_I3_A',
	'DMD_I2_A',
	'DMD_I1_A',
	'DMD_S_kVA',
	'DMD_Q_kvar',
	'DMD_P_kW',
	'ES_kVAh',
	'EQ_NET_kvarh',
	'EQ_TOTAL_kvarh',
	'EQ_EXP_kvarh',
	'EQ_IMP_kvarh',
	'EP_NET_kWh',
	'EP_TOTAL_kWh',
	'EP_EXP_kWh',
	'EP_IMP_kWh',
	'Freq_Hz',
	'PF',
	'Ssum_kVA',
	'Qsum_kvar',
	'Psum_kW'
]

const Reference: FC<{
	metrics: MetricsOpts
	setMetricsState: (any) => any
}> = ({ metrics, setMetricsState }) => {
	return (
		<div style={{ border: '3px solid black', padding: '5px' }}>
			{/* <p>{time.toLocaleString()}</p> */}
			<ul style={{ marginBlockStart: 0, padding: 0 }}>
				{metricList.map(metric => (
					<li key={metric} style={{ display: 'flex' }}>
						<span>
							<span style={{ fontWeight: 'bold', margin: '0 5px' }}>
								{metric}
							</span>
							{/* <input
								type="checkbox"
								checked={metrics[metric] && metrics[metric].show}
								onChange={e =>
									setMetricsState({
										...metrics,
										[metric]: { ...metrics[metric], show: e.target.checked }
									})
								}
							></input> */}
							<input
								type="checkbox"
								checked={metrics[metric] && metrics[metric].graph}
								onChange={e =>
									setMetricsState({
										...metrics,
										[metric]: { ...metrics[metric], graph: e.target.checked }
									})
								}
							></input>
						</span>

						{/* <span>{metrics[metric].toFixed(3)}</span> */}
					</li>
				))}
			</ul>
		</div>
	)
}

export default Reference
