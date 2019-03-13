const nconf = require("nconf");
const MongoClient = require("mongodb").MongoClient;
let database;

class Database {
    constructor() {

    }

    connect() {
        return new Promise((resolve, reject)=> {
            if (database) return resolve(database);
            const db = nconf.get('db');
            const url = `mongodb://${db.url}:${db.port}/${db.name}`;
            MongoClient.connect(url, db.options, (err, db)=> {
                if (err) return reject(err);
                database = db;
                resolve(db);
            })
        });
    }
}

module.exports = new Database();