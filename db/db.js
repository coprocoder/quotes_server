const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = "mongodb://localhost:27017/";

module.exports.users_database = 'usersdb';
module.exports.users_collection = 'users';

const conversion = require('../db/data_conversion');


module.exports.getById = function(cur_db, cur_collection, cur_id) {
  return new Promise((resolve, reject) => {
    const id = new ObjectID(cur_id);
    MongoClient
      .connect(url, function(err, client) {
        if (err) {
            reject(err);
        }
        client
          .db(cur_db)
          .collection(cur_collection)
          .find({ _id: id })
          .toArray(function(err, results){
            if (err) {
                reject(err);
            }
            client.close();
            resolve(results);
          })
    });
  })
}


/* === Select from current logged user === */

// Get fields by path
module.exports.get = function(cur_db, cur_collection, filter, fields) {
  console.log('GET FILTER', filter)
  console.log('GET FIELDS', fields)
  return new Promise((resolve, reject) => {
    MongoClient
      .connect(url, function(err, client) {
        if (err) {
          reject(err);
        }
        client
          .db(cur_db)
          .collection(cur_collection)
          .find(
            filter,               // ex: {"email": "mail@mail.ru"}
            {projection:fields},  // ex: {projection:{"first":1, "second":0}},
          )
          .toArray(function(err, results){
            if (err) {
              reject(err)
            }
            client.close();
            resolve(results);
          })
      });
  })
}

// Update field by path
module.exports.update = function(cur_db, cur_collection, filter, fields) {
  console.log('UPDATE FILTER', filter)
  console.log('UPDATE FIELDS', fields)

  return new Promise((resolve, reject) => {
    MongoClient
      .connect(url, function(err, client) {
        if (err) {
          reject(err);
        }
        if(!!fields.password){
          reject({message:"Вы не можете изменять пароль"});
        }
        client
          .db(cur_db)
          .collection(cur_collection)
          .updateOne(
            filter,
            [
              { $set: fields },
            ],
            function(err, results){
              if (err) {
                reject(err);
              }
              client.close();
              resolve(results);
            }
          )
      });
  })
}

// Remove field by path
module.exports.remove = function(cur_db, cur_collection, filter, fields) {
  console.log('DELETE FILTER', filter)
  console.log('DELETE FIELDS', fields)
  return new Promise((resolve, reject) => {
    MongoClient
      .connect(url, function(err, client) {
        if (err) {
          reject(err);
        }
        client
          .db(cur_db)
          .collection(cur_collection)
          .update(
            filter,
            { $unset: fields},     // Remove fields
            function(err, results){
              if (err) {
                reject(err);
              }
              client.close();
              resolve(results);
            }
          )
      });
  })
}


/* === NEW ITEMS BLOCK === */

module.exports.create = function(cur_db, cur_collection, data) {
  console.log('CREATE DATA', data)
  return new Promise((resolve, reject) => {
    MongoClient
      .connect(url, function(err, client) {
        if (err) {
          reject(err);
        }
        client
          .db(cur_db)
          .collection(cur_collection)
          .insertOne(data,
            function(err, results){
              if (err) {
                reject(err);
              }
              client.close();
              resolve(results);
            }
          )
    });
  })
}

module.exports.delete = function(cur_db, cur_collection, data) {
  console.log('DELETE DATA', data)
  return new Promise((resolve, reject) => {
    MongoClient
      .connect(url, function(err, client) {
        if (err) {
          reject(err);
        }
        client
          .db(cur_db)
          .collection(cur_collection)
          .deleteMany(data,
            function(err, results){
              if (err) {
                reject(err);
              }
              client.close();
              resolve(results);
            }
          )
      });
  })
}