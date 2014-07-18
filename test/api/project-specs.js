var assert = require('assert');

var Sails = require('sails');
var request = require('supertest');
var Q = require('q');

var StatusCode = require('../../utils/StatusCodeMapping');

request = request('http://localhost:1337');
process.env.NODE_ENV = 'test';

describe('Test API suite: /api/project', function () {
    var app;

    var projectId;

    before(function (done) {
        Sails.lift(require('rc')('sails'), function (err, sails) {
            if (err) {
                console.error(err);
            } else {
                console.info('Server lifted. ');
            }

            app = sails;
            done(err, sails);
        });
    });

    after(function (done) {
        Project.findOne({
            title : 'Domino-Test'
        }).then(function (project) {
            project.destroy(function () {
                app.lower(function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.info('Server lowered. ');
                    }

                    done(err);
                });
            });
        });
    });

    describe('Project actions. ', function () {
        it('Create project. ', function (done) {
            request
                .post('/project')
                .send({
                    title : 'Domino-Test',
                    description : 'Domino test project. ',
                    type : 0,
                    developers: ['miaojian'],
                    designers: ['miaojian'],
                    managers: ['miaojian'],
                    stagingServers : 'app150.hy01|app151.hy01',
                    productionServers : 'test111.hy01',
                    notificationList : 'wangye.zhao|miaojian',
                    url : 'git@github.com:wandoulabs/Domino.git'
                })
                .expect(200)
                .expect(function (res) {
                    projectId = res.body.body.id;
                    assert.equal(res.body.body.title, 'Domino-Test', 'Response Project attrs are not correct. ');
                })
                .end(done);
        });

        it('Create project with duplicated parameters. ', function (done) {
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
                .expect(StatusCode.RESOURCE_DUPLICATED)
                .end(done);
        });

        it('List projects. ', function (done) {
            request
                .get('/project')
                .expect(200)
                .expect(function (res) {
                    assert.equal(res.body.body instanceof Array, true, 'Response should be a list. ');
                })
                .end(done);
        });

        it('Query a project. ', function (done) {
            request
                .get('/project/Domino-Test')
                .expect(200)
                .expect(function (res) {
                    assert.equal(res.body.body.title, 'Domino-Test', 'Response Project attrs are not correct. ');
                })
                .end(done);
        });

        it('Query a project not exist. ', function (done) {
            request
                .get('/project/Domino-Test-xxx')
                .expect(404)
                .end(done);
        });

        it('Query hooks with project title. ', function (done) {
            request
                .get('/project/Domino-Test/hooks')
                .expect(200)
                .end(done);
        });

        it('Query hooks with project title not exist. ', function (done) {
            request
                .get('/project/Domino-Test-xxx/hooks')
                .expect(404)
                .end(done);
        });
    });

    describe('Task actions. ', function () {
        it('Trigger an event. ', function (done) {
            request
                .put('/project/Domino-Test/trigger/buildStaging')
                .expect(200)
                .end(done);
        });

        it('Fetch tasks list. ', function (done) {
            request
                .get('/task')
                .expect(200)
                .end(done);
        });

        it('Fetch tasks list with project title. ', function (done) {
            request
                .get('/task/Domino-Test')
                .expect(200)
                .end(done);
        });

    });
});
