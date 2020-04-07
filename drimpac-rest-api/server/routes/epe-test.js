const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const shell = require('shelljs');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const request = require('request');


cron.schedule('* * * * *', () => {

    const {
        mongoUser,
        mongoPass,
        mongoIP,
        mongoPort } = require('../bin/www');

    // // change this
     const db_name = 'drimpac';
     let url = 'mongodb://' + mongoUser + ':' + mongoPass + '@' + mongoIP + ':' + mongoPort + '/' + db_name + '?authSource=admin';
    
   MongoClient.connect(url, function (error, client) {

    // 'mongodb://' + mongoUser + ':' + mongoPass + '@' + mongoIP + ':' + mongoPort + '/' + db_name + '?authSource=admin';
    if (error) {
        return console.log('Unable to connect to database!')
    }
    const db = client.db('drimpac')
    const user = new Array;

    db.collection('energy_services').find({serviceType: 'FlexibilityTimeShiftableProfile'}).toArray((error, users) => {
        
        db.collection('energy_services').find({serviceType: 'FlexibilityTimeShiftableProfile'}).count((error, count) => {

            for (var i = 0; i<count; i++){
            // console.log(users[i].customer)
            user.push(users[i].customer)

            shell.exec('python ' + __dirname + '/../pythonScripts/publisher.py --h 160.40.49.197 --list ' + user[i]);
            const subscriber = shell.exec('python ' + __dirname + '/../pythonScripts/subscriber.py');
            
          
            if (subscriber.stderr !== '') {
               console.log('error')
            } else {
               var data = JSON.parse(subscriber)
                

            }

        
            priceValues = new Array;
            var index = [];
            var b = [];
            
            

            for (var x in data[0].Day_Ahead_Prices) {
                index.push(x);
              }

            // sort the index
            index.sort(function (a, b) {    

            return a == b ? 0 : (a > b ? 1 : -1); 

            }); 

            

            for (let i = 0; i <24; i++) {
        
                priceValues[i] = data[0].Day_Ahead_Prices[index[i]];
                b[i] = {

                    "duration": "60",
                    "uid": i+1,
                    "signalPayload": priceValues[i]
                }
                
              };

             const jsonData = {

                "type": "event",
                "drprogram": "Program1",
                "event_start": "2020-01-30T02:15:42",
                "event_end": data[0].Date,
                "event_notification": "2020-01-30T02:14:12",
                "signalName": "ELECTRICITY_PRICE",
                "signalType": "price",
                "intervals" : b
        
             }
            
            
             const userJSON = JSON.stringify(jsonData, null, 4)
             fs.writeFileSync('msg.json', userJSON)
           
            request.post({
                 url: "http://160.40.49.244:8000/vtn_data_create",
                 method: "POST",
                 json: jsonData
             },
             (error, res, body) => {
                if (error) {
                    console.error("error")
                    return
                }
                console.log(`statusCode: ${res.statusCode}`)
                console.log(body)
                })
           
            }
         })
       
    }) 

})

});