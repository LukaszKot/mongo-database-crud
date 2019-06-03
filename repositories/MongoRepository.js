var mongoClient = require('mongodb').MongoClient;

class MongoRepository {
    constructor() {
        this.bannedDatabases = ["admin", "config", "local"]
    }

    connect(address) {
        return new Promise((resolve, reject) => {
            mongoClient.connect("mongodb://" + address + "/admin", (err, db) => {
                if (err) reject(false);
                this.db = db;
                this.address = address;
                resolve(true)
            })
        })
    }

    addDatabase(name) {
        return new Promise((resolve, reject) => {
            mongoClient.connect("mongodb://" + this.address + "/" + name, (err, db) => {
                if (err) reject(err);
                this.db = db;
                this.db.createCollection("default", () => {
                    resolve(true)
                })

            })
        })
    }

    deleteDatabase(name) {
        return new Promise((resolve, reject) => {
            mongoClient.connect("mongodb://" + this.address + "/" + name, (err, db) => {
                if (err) reject(err);
                this.db = db;
                this.db.dropDatabase(() => {
                    this.db.close();
                    mongoClient.connect("mongodb://" + this.address + "/admin", (err, db) => {
                        if (err) resolve(err);
                        this.db = db;
                        resolve(true)
                    })
                })
            })
        })
    }

    getCollection(name) {
        return new Promise((resolve, reject) => {
            this.db.collection(name).find({}).toArray((err, items) => {
                if (err) reject(err)
                resolve(items);
            })
        })
    }

    getDatabaseCollections(databaseName) {
        return new Promise((resolve, reject) => {
            mongoClient.connect("mongodb://" + this.address + "/" + databaseName, (err, db) => {
                if (err) reject(err);
                this.db = db;
                this.db.listCollections().toArray(function (err, collInfos) {
                    var collections = [];
                    collInfos.forEach(element => {
                        collections.push(element.name);
                    });
                    resolve(collections);
                });

            })
        })
    }

    getDatabases() {
        return new Promise((resolve, reject) => {
            this.db.admin().listDatabases((err, dbs) => {
                if (err) reject(err);
                var databases = [];
                dbs.databases.forEach(element => {
                    if (!this.bannedDatabases.includes(element.name)) {
                        databases.push(element.name);
                    }
                });
                resolve(databases)
            })
        })
    }
}

module.exports = { MongoRepository }