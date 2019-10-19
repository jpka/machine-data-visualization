import request from 'supertest'
import app from './index'

test('/ should serve the base html', async () => {
	const res = await request(app).get('/')
	expect(res.statusCode).toEqual(200)
	expect(res.text).toMatch(`<div id="root">`)
})
