'use strict';
const shell = require('shelljs');

const {
    mongoUser,
    mongoPass,
    mongoIP,
    mongoPort,
    planetPort,
    planetIP } = require('../bin/www');

// change this
const db_name = 'drimpac';

// Connection URL
const MongoDbHelper = require('./MongoDbHelper');
let url = 'mongodb://' + mongoUser + ':' + mongoPass + '@' + mongoIP + ':' + mongoPort + '/' + db_name + '?authSource=admin';
let mongoDbHelper = new MongoDbHelper(url);
mongoDbHelper.start(() => {
    console.log('Units modifications now accessible...');
});

exports.addDevice = (req, res) => {
    let unitName = req.body.name;
    let find_param = {
        'name': unitName,
    };
    mongoDbHelper
        .collection('units')
        .count(find_param)
        .then(results => {
            return new Promise((resolve, reject) => {
                if (results !== 0) {
                    reject('Error: Unit already exist!');
                }
                resolve();
            });
        })
        .then(() => {

            let insert_params = req.body;

            // insert
            return mongoDbHelper.collection('units').insert(insert_params);
        })
        .then(results => {
        
            res.json({
                status: 'success',
            });
        })
        .catch(err => {
            res.json({ status: 'error', detail: err });
        });

};

exports.getDevices = (req, res) => {
    mongoDbHelper
    .collection('units')
    .find()
    .then(results => {
        res.send({ results: results }); 
    })
};

exports.editDevice = (req, res) => {
    mongoDbHelper
        .collection('units')
        .find({ 'name': req.body[0].name })
        .then(results => {
            if (results === null) {
                return Promise.reject('no such unit');
            }

            let upd_param = {
                $set: {
                    ['description']: req.body[0].description,
                    ['IP']: req.body[0].IP,
                    ['Port']: req.body[0].Port,
                    ['metadata']: req.body[0].metadata,
                },
            };

            return mongoDbHelper.collection('units').update({ 'name': req.body[0].name }, upd_param);
        })
        .then(() => {
            let results = JSON.parse(shell.exec('cat ' + `${__dirname}/../../../linksmart/conf/devices/mqtt-switch.json`).stdout);
            results['resources'] = results['resources'].map((val) => {
                if (val['name'] === req.body[0].name) {
                    val['description'] = req.body[0].description;
                    val['IP'] = req.body[0].IP;
                    val['Port'] = req.body[0].Port;
                    val['metadata'] = req.body[0].metadata;
                }
                return val;
            })
            shell.exec('mosquitto_pub -t "middleware_restart" -m "Start"');
            const status = shell.exec("mosquitto_pub -t \"middleware_restart\" -m \'" + JSON.stringify(results) + "\'");
            shell.exec('mosquitto_pub -t "middleware_restart" -m "End"');
            if (!status.stderr) {
                res.json({
                    status: 'success',
                    value: results['resources'],
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.json({ status: 'error', detail: err });
        });
}

exports.deleteDevice = (req, res) => {
    const name = req.body.name;
    mongoDbHelper
        .collection('units')
        .delete(name)
        .then(() => {
            mongoDbHelper
                .collection('units')
                .find()
                .then(results => {

                    if (results === null) {
                        return Promise.reject('no such unit');
                    }

                })
                .then(() => {
                    let results = JSON.parse(shell.exec('cat ' + `${__dirname}/../../../linksmart/conf/devices/mqtt-switch.json`).stdout);
                    results['resources'] = results['resources'].filter((val) => {
                        if (val['name'] !== req.body.name) {
                            return val;
                        }
                    });

                    shell.exec('mosquitto_pub -t "middleware_restart" -m "Start"');
                    const status = shell.exec("mosquitto_pub -t \"middleware_restart\" -m \'" + JSON.stringify(results) + "\'");
                    shell.exec('mosquitto_pub -t "middleware_restart" -m "End"');
                    res.json({ status: status });
                })
                .catch(err => {
                    res.json({ status: 'error', detail: err });
                });
        })
        .catch(err => {
            res.json({ status: 'error', detail: err });
        });

};


exports.dsoPremises = (req, res) => {
    var moment = require('moment');
    let insert_params = {
        payload: {
            ['message']: req.body.message,
            ['timestamp']: moment().format(),
        },
    };  
     mongoDbHelper.collection('dsoPremises').insert(insert_params);
    
        
        res.json({
            status: 'success',
        });
  

};


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

exports.getdsoPremises = (req, res) => {
    mongoDbHelper
    .collection('dsoPremises')
    .find()
    .then(payload => {
     
        console.log(payload);
        res.send({ results: payload });
   
    })};
    

exports.getDrmsCongestions = (req, res) => {
    mongoDbHelper
    .collection('der_systems')
    .find()
    .then(payload => {
        console.log(payload);
         res.send({ results: payload });
           
     })};
