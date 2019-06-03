var http = require('http');
var fs = require("fs");
var path = require('path')
var MongoRepository = require("./repositories/MongoRepository.js").MongoRepository;
var mimeTypes = {
    "js": "text/javascript",
    "css": "text/css",
    "png": "image/png",
    "jpeg": "image/jpeg",
    "mp3": "audio/mpeg",
    "gif": "image/gif"
}

var readFile = (url) => {
    return new Promise(function (resolve, reject) {
        fs.readFile(url, function (error, data) {
            if (error) {
                reject(error)
            }
            else {
                resolve(data)
            }
        })
    })
}

var mongoRepository = new MongoRepository();

var getBody = (req) => {
    return new Promise((accept, reject) => {
        var allData = "";
        req.on("data", function (data) {
            allData += data;
        })
        req.on("end", function (data) {
            var value = JSON.parse(allData)
            accept(value)
        })
    })
}

var server = http.createServer(async (req, res) => {
    if (req.url == "/") {
        fs.readFile('static/index.html', (error, data) => {
            if (error) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.write("<h1>błąd 404 - nie ma pliku!<h1>");
                res.end();
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                res.end();
            }
        })
    }
    else if (req.url.includes("/api/connect/") && req.method == "GET") {
        var address = req.url.split("/").pop();
        mongoRepository.connect(address)
            .then(fulfilled => {
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.write(JSON.stringify({
                    server: address
                }))
                res.end();
            }, async rejected => {
                await mongoRepository.connect("localhost");
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.write(JSON.stringify({
                    server: "localhost"
                }))
                res.end();
            })
    }
    else if (req.url == "/api/databases" && req.method == "GET") {
        var databases = await mongoRepository.getDatabases();
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify(databases))
        res.end();
    }
    else if (req.url == "/api/databases" && req.method == "POST") {
        var body = await getBody(req);
        await mongoRepository.addDatabase(body.name);
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write("[]")
        res.end();
    }
    else if (req.url.includes("/api/databases") && req.method == "DELETE") {
        var databaseName = req.url.split("/").pop();
        await mongoRepository.deleteDatabase(databaseName)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write("[]")
        res.end();
    }
    else if (req.url.includes("/api/databases") && req.method == "GET") {
        var databaseName = req.url.split("/").pop();
        var collections = await mongoRepository.getDatabaseCollections(databaseName)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify(collections))
        res.end();
    }
    else if (req.url.includes("/api/collections") && req.method == "GET") {
        var name = req.url.split("/").pop();
        var collection = await mongoRepository.getCollection(name);
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify(collection))
        res.end();
    }
    else {
        readFile(path.join(__dirname, "static", decodeURI(req.url)))
            .then((data) => {
                var url = req.url.split(".")
                var extension = url[url.length - 1]
                var mimeType = mimeTypes[extension]
                res.writeHead(200, { 'Content-Type': mimeType })
                res.write(data)
                res.end();
            })
            .catch((error) => {
                res.writeHead(404, { 'Content-Type': "text/plain" });
                res.end("Eror 404: Page has not been found.")
                return;
            })
    }
})

server.listen(3000, () => {
    console.log("Server starts on port 3000.")
})