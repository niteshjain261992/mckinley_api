// controller
const userCtrl = require('../controllers/user_controllers');

//helper
const helper  = require("../helper/application_helper");

module.exports = (router)=> {

    router.get('/api/v1/user/info', (req, res)=> {
        const user = req.session.user;
        console.log("user*****", user);
        res.status(200).json({ code: 200, payload: { data: user }});
    });

    router.post('/api/v1/user/register', (req, res)=> {
        userCtrl.register(req)
            .then((data)=> {
                res.json({ code: 200, payload: { data }});
            })
            .catch((err)=> {
                helper.sendErrorStatus(req, res, err);
            })
    });

    router.post('/api/v1/user/login', (req, res)=> {
        userCtrl.login(req)
            .then((data)=> {
                res.json({ code: 200, payload: { user: data }});
            })
            .catch((err)=> {
                helper.sendErrorStatus(req, res, err);
            })
    });
};