const websocket = require('websocket');
const http = require('http');
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const Database = require(path.join(__dirname, 'database'));
const levenshtein = require(path.join(__dirname, 'levenshtein'));

// state variables represent the server current state.
let mode = 'tweet';
let questionId;
let message;

async function main() {
    try {

        // open the database
        const database = await Database(path.join(__dirname, 'albineSms.db'));

        // manage broadcast to clients
        const connections = new Set();
        let broadcastInhibited = false;
        let broadcastRequired = false;
        const generateState = async () => {
            const state = {mode: mode};
            if (state.mode == 'tweet') {
                state.tweets = await database.getMostRecentTweets(10);
                state.votes = await database.getVotes();
            } else if (mode == 'question') {
                state.question = await database.getQuestion(questionId);
                state.numberOfAnswers = await database.getNumberOfAnswers(questionId);
            } else if (mode == 'answer') {
                state.question = await database.getQuestion(questionId);
                state.answers = await database.getAnswers(questionId);
            } else if (mode == 'display') {
                state.message = message;
            } else {
                throw new Error('unknown mode');
            }
            return state;
        }
        const broadcastState = async () => {
            if (broadcastInhibited) {
                broadcastRequired = true;
            } else {
                broadcastInhibited = true;
                const stateAsJson = JSON.stringify(await generateState());
                for (let connection of connections) {
                    connection.sendUTF(stateAsJson);
                }
                setTimeout(async () => {
                    broadcastInhibited = false;
                    if (broadcastRequired) {
                        broadcastRequired = false;
                        await broadcastState();
                    }
                }, 40);
            }
        };

        // serve static files
        const parsePost = async request => await new Promise((resolve, reject) => {
            const body = {};
            const busboy = new Busboy({headers: request.headers});
            busboy.on('field', (fieldname, value) => {
                if (body.hasOwnProperty(fieldname)) {
                    if (body[fieldname].constructor === Array) {
                        body[fieldname].push(value);
                    } else {
                        body[fieldname] = [context.request.body[fieldname], value];
                    }
                } else {
                    body[fieldname] = value;
                }
            });
            busboy.on('finish', () => {
                resolve(body);
            });
            busboy.on('error', reject);
            request.pipe(busboy);
        });
        const server = http.createServer(async (request, response) => {
            if (request.method == 'POST') {
                if (request.url == '/sms') {
                    const data = await parsePost(request);
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end();
                    if (mode == 'tweet') {
                        if (levenshtein(data.Body.toLowerCase(), 'keur') < 3) {
                            database.addVote(new Date(), data.From, 0);
                        } else if (levenshtein(data.Body.toLowerCase(), 'love') < 3) {
                            database.addVote(new Date(), data.From, 1);
                        } else {
                            await database.addTweet(new Date(), data.From, data.Body);
                        }
                        await broadcastState();
                    } else if (mode == 'question') {
                        if (levenshtein(data.Body.toLowerCase(), 'albert') < 3) {
                            await database.addAnswer(new Date(), data.From, questionId, 0);
                        } else if (levenshtein(data.Body.toLowerCase(), 'pauline') < 3) {
                            await database.addAnswer(new Date(), data.From, questionId, 1);
                        }
                        await broadcastState();
                    }
                } else if (request.url == '/mode') {
                    const data = await parsePost(request);
                    if (data.mode == 'tweet') {
                        mode = 'tweet';
                        questionId = undefined;
                        message = undefined;
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end();
                        await broadcastState();
                    } else if (data.mode == 'question' || data.mode == 'answer') {
                        const questionIdCandidate = parseInt(data.id);
                        if (
                            Number.isInteger(questionIdCandidate)
                            && questionIdCandidate >= 0
                            && (await database.getQuestion(questionIdCandidate)) != null
                        ) {
                            questionId = questionIdCandidate;
                            message = undefined;
                            mode = data.mode;
                            response.writeHead(200, {'Content-Type': 'text/html'});
                            response.end();
                            await broadcastState();
                        } else {
                            response.writeHead(400);
                            response.end('error: unknown question id\n');
                        }
                    } else if (data.mode == 'display') {
                        mode = 'display';
                        questionId = undefined;
                        message = data.message;
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end();
                        await broadcastState();
                    } else {
                        response.writeHead(400);
                        response.end('error: unknown mode\n');
                    }
                } else {
                    response.writeHead(404);
                    response.end();
                }
            } else {
                if (request.url == '/' || request.url == '/index.html') {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    fs.createReadStream(path.join(__dirname, 'public','index.html')).pipe(response);
                } else if (request.url == '/styles.css') {
                    response.writeHead(200, {'Content-Type': 'text/css'});
                    fs.createReadStream(path.join(__dirname, 'public', 'styles.css')).pipe(response);
                } else if (request.url == '/client.js') {
                    response.writeHead(200, {'Content-Type': 'application/js'});
                    fs.createReadStream(path.join(__dirname, 'public', 'client.js')).pipe(response);
                } else if (request.url == '/albert.png') {
                    response.writeHead(200, {'Content-Type': 'image/png', 'Cache-Control': 'max-age=86400000'});
                    fs.createReadStream(path.join(__dirname, 'public', 'albert.png')).pipe(response);
                } else if (request.url == '/pauline.png') {
                    response.writeHead(200, {'Content-Type': 'image/png', 'Cache-Control': 'max-age=86400000'});
                    fs.createReadStream(path.join(__dirname, 'public', 'pauline.png')).pipe(response);
                } else if ([
                    '/Quicksand-Bold.ttf',
                    '/Quicksand-BoldItalic.ttf',
                    '/Quicksand-Italic.ttf',
                    '/Quicksand-Light.ttf',
                    '/Quicksand-LightItalic.ttf',
                    '/Quicksand-Regular.ttf',
                ].indexOf(request.url) >= 0) {
                    response.writeHead(200, {'Content-Type': 'application/font-sfnt'});
                    fs.createReadStream(path.join(__dirname, 'public', request.url)).pipe(response);
                } else if (request.url == '/mode') {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({mode: mode}));
                } else if (request.url == '/database.db') {
                    response.writeHead(200, {'Content-Type': 'application/octet-stream'});
                    fs.createReadStream(path.join(__dirname, 'albineSms.db')).pipe(response);
                } else {
                    response.writeHead(404);
                    response.end();
                }
            }
        });

        // start the server
        await new Promise((resolve, reject) => {
            server.listen(3000, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // create a websocket extension for the server
        websocketServer = new websocket.server({
            httpServer: server,
            autoAcceptConnections: false,
        });

        // manage client connections
        websocketServer.on('request', async request => {
            const connection = request.accept(null, request.origin);
            connection.sendUTF(JSON.stringify(await generateState()));
            connections.add(connection);
            connection.on('close', (reasonCode, description) => {
                connections.delete(connection);
            });
        });

        console.log('listening on port 3000');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
main();
