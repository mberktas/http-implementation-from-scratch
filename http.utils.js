const { STATUS } = require('./http.constants.js')

const parseRequest = (request) => {
	request = request.toLowerCase()
	const [header, body] = request.split('\r\n\r\n')
	const [requestLine, ...ls] = header.split('\r\n')
	const [method, path, version] = requestLine.split(' ')
	const headers = ls.reduce((acc, line) => {
		let [key, value] = line.split(': ')
		key = convertToJsonNamingConvention(key)
		acc[key] = value
		return acc
	}, {})

	return { method, path, version, headers, body }
}

const createResponse = (status, headers, body) => {
	let response = `HTTP/1.1 ${status} ${STATUS[status]}\r\n`

	headers['Content-Length'] = headers['Content-Length'] || body.length

	for (const [key, value] of Object.entries(headers)) {
		response += `${key}: ${value}\r\n`
	}
	response += `\r\n${body}`
	return response
}

const convertToJsonNamingConvention = (str) => {
	str = str.replace(/(?<=^|\W)(content|test)-(\w+)/gi, (match, p1, p2) => {
		return p1.toLowerCase() + p2.replace(/^\w/, (c) => c.toUpperCase())
	})
	str = str.replace(/[_\W]+(\w)/g, (match, p1) => {
		return p1.toUpperCase()
	})
	return str.charAt(0).toLowerCase() + str.slice(1)
}

module.exports = { parseRequest, createResponse }
