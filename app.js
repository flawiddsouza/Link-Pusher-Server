const http = require('http')
const WebSocketServer = require('ws').Server
const express = require('express')
const bodyParser = require('body-parser')
const WebSocket = require('ws')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

const ws = new WebSocket('ws://:9882')

// POST /push
app.post('/push', function(req, res) {
    if(req.body.link) {
        ws.send(req.body.link)
        res.send("Link Pushed")
    } else {
        res.send("No Link Provided")
    }
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

let clientsArr = []

wss.on('connection', ws => {
    clientsArr.push(ws)
    ws.on('message', pushedLink => {
        if(pushedLink) {
            sendToAllExceptSender(pushedLink, ws)
        }
    })
    ws.on('close', () => {
        clientsArr = clientsArr.filter(client => client !== ws)
    })
})

function sendToAllExceptSender(message, sender) {
    for(var i=0; i < clientsArr.length; i++) {
        if(clientsArr[i] !== sender) {
            clientsArr[i].send(message)
        }
    }
}

server.listen(9882)