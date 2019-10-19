import request from 'supertest'
import app from '../server'

test('/ should serve the app landing page', async () => {
	const res = await request(app).get('/')
	expect(res.statusCode).toEqual(200)
	expect(res.text).toMatch('You are home')
})
