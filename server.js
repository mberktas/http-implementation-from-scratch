const net = require('net')
const fs = require('fs').promises

const { parseRequest, createResponse } = require('./http.utils')
const { CONTENT_TYPES } = require('./http.constants')

const server = net.createServer((socket) => {
	socket.on('data', async (data) => {
		const request = parseRequest(data.toString('utf-8'))
		let response
		
		if (request.method == 'get') {
			const ext = request.path.split('.')[1]
			if (ext) {
				await fs
					.readFile(`./public${request.path}`, 'utf-8')
					.then((data) => {
						const content = data
						response = createResponse(200, { 'Content-Type': CONTENT_TYPES[ext] }, content)
					})
					.catch((err) => {
						if (err.code === 'ENOENT') {
							response = createResponse(
								404,
								{ 'Content-Type': CONTENT_TYPES['plain'] },
								'Not Found',
							)
						} else {
							response = createResponse(
								500,
								{ 'Content-Type': CONTENT_TYPES['plain'] },
								'Internal Server Error',
							)
						}
					})
			} else {
				response = createResponse(
					200,
					{ 'Content-Type': CONTENT_TYPES['json'] },
					'{"message": "Hello World"}',
				)
			}
		} else {
			response = createResponse(
				405,
				{ 'Content-Type': CONTENT_TYPES['plain'] },
				'Method Not Allowed',
			)
		}

		socket.write(response)
	})
})

server.addListener('connection', (socket) => {
	console.log(`client connected: ${socket.remoteAddress}:${socket.remotePort}`)
})

server.listen(8080, () => {
	console.log('server is listening')
})
