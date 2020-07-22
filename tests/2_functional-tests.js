/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
const { assert } = require('chai');
var server = require('../server');

chai.use(chaiHttp);
let idToDelete;
suite('Functional Tests', function () {
  suite('POST /api/issues/{project} => object with issue data', function () {
    test('Every field filled in', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'object');
          assert.include(res.body, {
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA',
          });
          idToDelete = res.body._id;
          assert.containsAllKeys(res.body, [
            'issue_title',
            'issue_text',
            'created_by',
            'assigned_to',
            'status_text',
            '_id',
            'created_on',
            'updated_on',
            'open',
          ]);
          done();
        });
    });

    test('Required fields filled in', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'object');
          assert.include(res.body, {
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Required fields filled in',
            assigned_to: '',
            status_text: '',
          });
          assert.containsAllKeys(res.body, [
            'issue_title',
            'issue_text',
            'created_by',
            'assigned_to',
            'status_text',
            '_id',
            'created_on',
            'updated_on',
            'open',
          ]);
          done();
        });
    });

    test('Missing required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: '',
        })
        .end(function (err, res) {
          assert.equal(res.status, 400);
          assert.equal(res.text, 'BED_REQUEST');
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => text', function () {
    test('No body', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no updated field sent');
          done();
        });
    });

    test('One field to update', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({ _id: idToDelete, status_text: 'upFild' })
        .end(function (err, res) {
          console.log(res.text);

          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });

    test('Multiple fields to update', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({ _id: idToDelete, status_text: 'up once again', open: false })
        .end(function (err, res) {
          console.log(res.text);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });
  });

  suite(
    'GET /api/issues/{project} => Array of objects with issue data',
    function () {
      test('No filter', function (done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            done();
          });
      });

      test('One filter', function (done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({ created_by: 'Aleex' })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body.length, 0);
            done();
          });
      });

      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({ issue_text: 'text', status_text: 'In QA' })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtLeast(res.body.length, 1);
            done();
          });
      });
    }
  );

  suite('DELETE /api/issues/{project} => text', function () {
    test('No _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          _id: '',
        })
        .end(function (err, res) {
          assert.equal(res.status, 400);
          done();
        });
    });

    test('Valid _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          _id: idToDelete,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, `deleted  ${idToDelete}`);
          done();
        });
    });
    test('Not exist _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          _id: '5f12085942876d38ec8fe937',
        })
        .end(function (err, res) {
          assert.equal(res.status, 400);
          done();
        });
    });
  });
});
