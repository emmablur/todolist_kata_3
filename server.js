const http = require('http');
const { v4: uuidv4 } = require('uuid')
const errorHandler = require('./errorHandler')
const todos = [];

returnWithData = (res, headers) => {
    res.writeHead(200, headers)
    res.write(JSON.stringify({
        data: todos,
        status: 'success'
    }))
    res.end()
}

requestListener = (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk;
    })

    if (req.url == '/todos' && req.method == 'GET') {
        returnWithData(res, headers)
    } else if (req.url == '/todos' && req.method == 'POST') {
        try {
            req.on('end', () => {
                const title = JSON.parse(body).title;
                if (title) {
                    todos.push({
                        title: title,
                        id: uuidv4()
                    })
                    returnWithData(res, headers)
                } else {
                    errorHandler(res)
                }
            })
        } catch (error) {
            errorHandler(res)
        }
    } else if (req.url.startsWith('/todos/') && req.method == 'PATCH') {
        try {
            req.on('end', () => {
                const title = JSON.parse(body).title;
                const id = req.url.split('/').pop()
                const index = todos.findIndex(todo => todo.id == id)
                
                if (title && index != -1) {
                    todos[index].title = title
                    returnWithData(res, headers)
                } else {
                    errorHandler(res)
                }
            })
        } catch (error) {
            errorHandler(res)
        }
    } else if (req.url == '/todos' && req.method == 'DELETE') {
        todos.length = 0
        returnWithData(res, headers)
    } else if (req.url.startsWith('/todos/') && req.method == 'DELETE') {
        const id = req.url.split('/').pop()
        const index = todos.findIndex(todo => todo.id == id)
        if (index != -1) {
            todos.splice(index, 1)
            returnWithData(res, headers)
        } else {
            errorHandler(res)
        }
    } else if (req.method == 'OPTION') {
        res.writeHead(200, headers)
        res.end()
    } else {
        res.writeHead(404, headers)
        res.write(JSON.stringify({
            message: '無此路由'
        }))
        res.end()
    }
}
const server = http.createServer(requestListener)
server.listen(process.env.PORT || 3005)