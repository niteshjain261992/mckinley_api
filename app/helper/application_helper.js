class ApplicationHelper {

    sendErrorStatus(req, res, err, code=404) {
        const status = err.status || code;
        res.status(status).json({ code: status, error: err.message })
    }

}

module.exports = new ApplicationHelper();