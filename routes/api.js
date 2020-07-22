/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const expect = require('chai').expect;

const ObjectId = require('mongodb').ObjectID;
const { clientConnect, clientClose } = require('../db/dbConnect');
const schema = require('../validator');
const validator = require('../middleWare/validateMiddleware');
module.exports = function (app) {
  app
    .route('/api/issues/:project')
    .get(function (req, res) {
      const project = req.params.project;
      clientConnect().then((client) => {
        const db = client.db('my-database');
        db.collection(project)
          .find(req.query)
          .toArray()
          .then((items) => {
            clientClose(client);
            const objToSend = items.map((item) => {
              return {
                _id: item._id,
                issue_title: item.issue_title,
                issue_text: item.issue_text,
                created_by: item.created_by,
                status_text: item.status_text || '',
                assigned_to: item.assigned_to || '',
                created_on: item.created_on,
                updated_on: item.updated_on,
                open: item.open,
              };
            });
            res.json(objToSend);
          });
      });
    })

    .post(validator(schema.add), (req, res) => {
      var project = req.params.project;
      clientConnect().then((client) => {
        const db = client.db('my-database');
        const dateNow = new Date();
        db.collection(project)
          .insertOne({
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            status_text: req.body.status_text,
            assigned_to: req.body.assigned_to,
            created_on: dateNow,
            updated_on: dateNow,
            open: true,
          })
          .then((result) => {
            clientClose(client);
            const objToSend = {
              _id: result.ops[0]._id,
              issue_title: result.ops[0].issue_title,
              issue_text: result.ops[0].issue_text,
              created_by: result.ops[0].created_by,
              status_text: result.ops[0].status_text || '',
              assigned_to: result.ops[0].assigned_to || '',
              created_on: result.ops[0].created_on,
              updated_on: result.ops[0].updated_on,
              open: true,
            };
            res.json(objToSend);
          });
      });
    })

    .put((req, res, next) => {
      var project = req.params.project;

      const { _id: issueId, ...resFields } = req.body;
      let reqDb = {};

      for (const key in resFields) {
        if (req.body[key]) {
          reqDb[key] = req.body[key];
        }
        if (key === 'open') {
          reqDb[key] = false;
        }
      }

      if (Object.keys(reqDb).length > 0 && ObjectId.isValid(issueId)) {
        reqDb.updated_on = new Date();
        clientConnect().then((client) => {
          const db = client.db('my-database');
          db.collection(project)
            .findOneAndUpdate(
              { _id: ObjectId(issueId) },
              { $set: reqDb },
              { returnNewDocument: true }
            )
            .then((result) => {
              console.log(result.value._id);

              if (!!result.value) {
                res.send('successfully updated');
              } else {
                res.send('id Error');
              }
            })
            .catch((err) => {
              console.log(err);
              next(new Error('id Error'));
            });
        });
      } else {
        res.send('no updated field sent');
      }
    })

    .delete(function (req, res, next) {
      var project = req.params.project;
      const issueId = req.body._id;
      if (ObjectId.isValid(issueId)) {
        clientConnect().then((client) => {
          const db = client.db('my-database');
          db.collection(project)
            .deleteOne({ _id: ObjectId(issueId) })
            .then((result) => {
              if (result.deletedCount !== 0) {
                res.status(200).send(`deleted  ${issueId}`);
              } else {
                next(new Error('id Error'));
              }
            })
            .catch((err) => {
              next(new Error('id Error'));
            });
        });
      } else {
        next(new Error('id Error'));
      }
    });
};
