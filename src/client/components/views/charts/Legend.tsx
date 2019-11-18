import React from 'react'
import { stateColors } from './utils'
import { capitalize } from 'lodash'

const Legend = ({ style }) => {
	return (
		<div style={style}>
			{Object.keys(stateColors).map(state => (
				<span key={state}>
					<span
						style={{
							display: 'inline-block',
							borderRadius: '100%',
							background: stateColors[state],
							width: 10,
							height: 10,
							margin: '0 5px 0 10px'
						}}
					></span>
					<span>{capitalize(state)}</span>
				</span>
			))}
		</div>
	)
}

export default Legend
