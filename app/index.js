// dependencies
const express       = require("express");
const compression   = require("compression");
const cookieParser  = require("cookie-parser");
const session       = require("express-session");
const FSStore  	    = require('./helper/session')({ session: session });
const bodyParser    = require("body-parser");
const nconf         = require("nconf");
const logger        = require("morgan");

//Load Enviroment file
require("./config/enviroment");

const app = express();

app.use(compression());  //compress all response object
app.use(cookieParser()); //parse request cookie

app.use(logger('dev'));

app.use(bodyParser.json({ limit: '20mb' })); //parse application/json

// Handle all unexpection errors
process.on('uncaughtException', (err)=> {
   console.error(err);
});

//database connection
const database = require("./helper/database");
app.use((req, res, callback)=> {
    database.connect()
        .then((db)=> {
            req.db = db;
            callback();
        })
        .catch((err)=> {
            res.status(500).send(err);
        });
});

//creating session
app.use(session({
    key: 'sessionid',
    secret: 'aersda@#$32sfas2342',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    store: new FSStore({ path: '/tmp/sessions', reapInterval: -1 })
}));
app.use((req, res, callback)=> {
    if (!req.session.user) req.session.user = { is_logged_in: false };
    callback();
});

// Sets various headers needed.
app.use(function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    // Following headers are needed for CORS
    res.setHeader('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept, ajax');
    res.setHeader('access-control-allow-methods', 'POST,HEAD,GET,PUT,DELETE,OPTIONS');
    res.setHeader('access-control-allow-origin', req.headers.origin);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', 1);
    res.setHeader('mode', 'block');
    res.removeHeader("X-Powered-By");
    next();
});

require("./config/routes")(app);


const port = nconf.get("port");
app.listen(port);
console.log(`Server is on port ${port}`);