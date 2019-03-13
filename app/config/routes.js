module.exports = (app)=> {
    require("../routes/user")(app);

    app.use((err, req, res, callback)=> {
        const code = err.status || 500;
        res.status(code);
        res.json({ code: code, status: 'ERR', error: { error: err.message }})
    });

};