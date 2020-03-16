'use strict';
const mongodb = require('mongodb').MongoClient;
const uuid = require('uuid');

/*
 http://mongodb.github.io/node-mongodb-native/2.0/tutorials/crud_operations/
 */

module.exports = class MongoDbHelper {
  constructor(url) {
    this.url = url;
    this.mongoClient = mongodb;
    this.db = null;
  }

  start(callback) {
    this.mongoClient.connect(
      this.url,
      { useNewUrlParser: true },
      (err, db) => {
        if (err !== null) {
          console.log(err);
        }
        this.db = db;
        callback(db);
      }
    );
  }

  collection(collectionName) {
    let mongoDbCollection = this.db.db().collection(collectionName);
    let collection = {
      insert: model => {
        // TODO: insert many
        return new Promise((resolve, reject) => {
          model._id = uuid.v1();
          mongoDbCollection.insertOne(model, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(model);
          });
        });

      },

      update: (find_param, upd_param) => {
        // TODO: update many
        return new Promise((resolve, reject) => {
          mongoDbCollection.updateOne(find_param, upd_param, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
          });
        });
      },

      find: param => {
        // TODO: search
        return new Promise((resolve, reject) => {
          mongoDbCollection.find(param).toArray((err, docs) => {
            if (err) {
              reject(err);
            }
            resolve(docs);
          });
        });
      },

      findById: id => {
        return new Promise((resolve, reject) => {
          mongoDbCollection.findOne({ _id: id }, (err, doc) => {
            if (err) {
              reject(err);
            }
            resolve(doc);
          });
        });
      },

      delete: id => {
        // TODO: delete many
        return new Promise((resolve, reject) => {
          mongoDbCollection.removeOne({ name: id }, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
          });
        });
      },

      findOne: param => {
        return new Promise((resolve, reject) => {
          mongoDbCollection.findOne(param, (err, doc) => {
            if (err) {
              reject(err);
            }
            resolve(doc);
          });
        });
      },

      count: param => {
        return new Promise((resolve, reject) => {
          mongoDbCollection.countDocuments(param, (err, doc) => {
            if (err) {
              reject(err);
            }
            resolve(doc);
          });
        });
      },
    };

    return collection;
  }
};
