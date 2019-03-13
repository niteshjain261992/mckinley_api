const _        = require("underscore");
const bcrypt   = require("bcrypt");
const ObjectID = require('mongodb').ObjectID;

function isValidateRegisterData(data) {
    if (!data.email || !data.phone || !data.password || !data.name) {
        return false;
    } else return true;
}

function ListUserByEmail(req, email) {
    return new Promise((resolve, reject)=> {
        req.db.collection("users").findOne({ email }, (err, response)=> {
            if (err) return reject({ message: "Error in getting user from database" });
            resolve(response);
        });
    });
}

function encrypt(password) {
    return new Promise((resolve, reject)=> {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return reject({ message: 'Issue in encryption' });
            }
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    return reject({ message: 'Issue in encryption' });
                }
                resolve(salt);
            });
        });
    });
}

function InsertUser(req, data) {
    return new Promise((resolve, reject)=> {
        data.created_on = new Date();
        data._id = ObjectID();
        req.db.collection("users").insert(data, (err, response)=> {
            if (err) return reject({ message: "Error in database" });
            resolve(data._id);
        })
    });
}

function verifyPassword(plainPassword, hash) {
    return new Promise((resolve, reject)=> {
        bcrypt.compare(plainPassword, hash, function (err, isMatch) {
            if (err) return reject({ message: "Error in comparing password" });

            resolve(isMatch);
        });
    })
}

class UserController {

    register(req) {
        return new Promise(async (resolve, reject)=> {
            const body = req.body;
            const data = _.pick(body, 'email', 'phone', 'password', 'name');

            const isValid = isValidateRegisterData(data);

            if (!isValid) return reject({ message: "Mandatory Parameters Missing" });

            try {
                const userExists = await ListUserByEmail(req, data.email);
                if (userExists) return reject({ message: "User already exists" });
                data.password = await encrypt(data.password);

                data._id = await InsertUser(req, data);

                resolve("Register Successfully");
            } catch (err) {
                return reject(err);
            }
        });
    }

    login(req) {
        return new Promise(async (resolve, reject)=> {
            const body = req.body;
            const data = _.pick(body, 'email', 'password');

            if (!data.email || !data.password) return reject({ message: "Mandatory Parameters Missing" });

            try {
                const user = await ListUserByEmail(req, data.email);
                if (!user) return reject({ message: "User Not Registered" });

                const isVerified = await verifyPassword(data.password, user.password);

                if (!isVerified) return reject({ message: "Incorrect Password" });

                delete user.password;
                user.is_logged_in = true;

                req.session.user = user;
                resolve("Logged In Successfully");
            } catch (e) {
                return reject(e);
            }
        })
    }
}

module.exports = new UserController();