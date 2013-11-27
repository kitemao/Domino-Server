module.exports = {
    login : function  (req, res) {
        console.log(req.cookies.dominoAuth);
        if (req.cookies.dominoAuth) {
            res.send({
                status : 200
            });
        } else {
            var username = req.param('username');
            var password = req.param('password');

            // TODO Implement LDAP auth below
            if (username !== 'wangye.zhao') {
                res.send({
                    status : 404
                });
            } else {
                res.cookie('dominoAuth', new Date().getTime(), {
                    maxAge : 1000 * 60 * 1,
                    httpOnly : true
                });

                res.send({
                    status : 200
                });
            }
        }
    },
    logout : function (req, res) {
        res.clearCookie('dominoAuth');
        res.send({
            status : 200
        });
    }
};
