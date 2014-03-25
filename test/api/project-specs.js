var request = require('supertest');
var Sails = require('sails');

request = request('http://localhost:1337');
process.env.NODE_ENV = 'test';

describe('Test API suite: /api/project', function () {
    var app;

    var projectId;

    before(function (done) {
        Sails.lift({
            log : {
                level : 'error'
            }
        }, function (err, sails) {
            app = sails;
            done(err, sails);
        });
    });

    after(function (done) {
        Project.findOne({
            id : projectId
        }).done(function (err, project) {
            project.destroy(function () {
                app.lower(done);
            });
        });
    });

    it('Create project. ', function (done) {
        request
            .post('/project')
            .send({
                title : 'Domino-Test',
                description : 'Domino test project. ',
                type : 0,
                stagingServers : 'app150.hy01|app151.hy01',
                productionServers : 'test111.hy01',
                notificationList : 'wangye.zhao|miaojian',
                url : 'git@github.com:wandoulabs/Domino.git'
            })
            .expect(200)
            .expect(function (res) {
                projectId = res.body.body.id;
                if (res.body.body.title !== 'Domino-Test') {
                    return 'Create project failed. ';
                }
            })
            .end(done);
    });

    it('List projects. ', function (done) {
        request
            .get('/project')
            .expect(200)
            .end(done);
    });
});
