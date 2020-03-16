'use strict';
const express = require('express');
const shell = require('shelljs');
const https = require('https');
var parser = require('xml2json');
const JDBC = require('@naxmefy/jdbc').JDBC
var parser = require('xml2json');
const yaml = require('js-yaml');
const fs   = require('fs');

require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
var njs = '';
exports.getEPE = (req, res) => {
    const epeData = shell.exec("python -V");
    if (epeData.stderr === '') {
        res.json({
            status: 'error'
        });
    } else {
        res.json({
            status: 'success',
            data: {
                epeData: epeData
            }
        });
    }

};

const myDatabase = new JDBC({
  className: 'org.h2.Driver',
  url: 'jdbc:h2:tcp://127.0.0.1//home/tsotakis/Desktop/ri.usef.energy-develop/usef-environment/nodes/localhost/data/dso1.miwenergia.com;CIPHER\=AES;MVCC\=true',
  username: 'usef',
  password: 'XdnszvvzubifRiP PrLqAlAymrHWRkW'
})



exports.sendmessage = (req, res) => {
    if(njs !== '')
    {
    res.json({
        status: 'success',
        data: njs
    }
    );}
    else{

        res.json({
            status: 'error'

    }
        )
    }
    njs = '';
}

exports.getmessage = (req, res) => {
    console.log('messge_resvv');
    console.log(req.body.data);
    njs = req.body.data;

    res.json({
        status: 'success',
        data: '1234'
    }
    )

}

exports.getCROs = (_req, _res) => {
console.log('getCROs');
const options = {
  hostname: 'dso1.miwenergia.com',
  port: 8443,
  path: '/dso1.miwenergia.com_DSO/rest/commonreferenceoperators',
  insecure: true
}

    https.get(options, (res) => {

        let str = '';
        res.on('data', (d) => {
            str+=d;
        });

        res.on('end',(en) => { 
            _res.json({
                status: 'success',
                body: JSON.parse(str).body
            })
            console.log(str);
          });

      }).on('error', (e) => {
        console.error(e);
      });
}

exports.getSynchronisationCongestionpoints = (_req, _res) => {
    console.log('getCROs');
    const options = {
      hostname: 'dso1.miwenergia.com',
      port: 8443,
      path: '/dso1.miwenergia.com_DSO/rest/synchronisationcongestionpoints',
      insecure: true
    }
    
        https.get(options, (res) => {
    
            let str = '';
            res.on('data', (d) => {
                str+=d;
            });
    
            res.on('end',(en) => { 
                _res.json({
                    status: 'success',
                    body: JSON.parse(str).body
                })
                console.log(str);
              });
    
          }).on('error', (e) => {
            console.error(e);
          });
    }


    exports.xmlMessage = (req, res) => {
        try
        {
            const options = {
                method: "POST",
                hostname: 'agr1.usef-example.com',
                port: "8443",
                path: '/agr1.usef-example.com_AGR/rest/MessageService/sendMessage',         
                headers: {
                  "Content-Type": "text/xml",
                  "cache-control": "no-cache",
                },
                insecure: true,
              };
              
              var _req = https.request(options, function (_res) {
                var chunks = [];
              
                _res.on("data", function (chunk) {
                  chunks.push(chunk);
                });
              
                _res.on("end", function () {
                  var body = Buffer.concat(chunks);
                  console.log(body.toString());
                });
              });
              
              _req.write(req.body.parameters);
              _req.end();
        console.log(req.body.parameters);
        res.json({
            status: 'Success',
        });
        }
        catch (error) {
    
            res.json({
                status: 'Error:' + error,
            });
        }
    };


    exports.addCRO = (req, res) => {
        console.log('messge_resvv');
        console.log(req.body);
        try
        {
            const options = {
                method: "POST",
                hostname: 'dso1.miwenergia.com',
                port: "8443",
                path: '/dso1.miwenergia.com_DSO/rest/commonreferenceoperators',         
                headers: {
                  "Content-Type": "application/json",
                },
                insecure: true,
              };
              
              var _req = https.request(options, function (_res) {
                var chunks = [];
              
                _res.on("data", function (chunk) {
                  chunks.push(chunk);
                });
              
                _res.on("end", function () {
                  var body = Buffer.concat(chunks);
                  console.log(body.toString());
                });
              });
              
              _req.write(JSON.stringify(req.body));
              _req.end();
        //console.log(req.body.parameters);
        res.json({
            status: 'Success',
            data: '1234'
        });
        }
        catch (error) {
            console.log(error);
            res.json({
                status: 'Error:' + error,
            });
        }
    
    
    }

    exports.getCRO = (req, res) => {
        console.log('getCRO');
        
        try
        {
            const options = {
                method: "GET",
                hostname: 'dso1.miwenergia.com',
                port: "8443",
                path: '/dso1.miwenergia.com_DSO/rest/commonreferenceoperators',         
                headers: {
                  "Content-Type": "application/json",
                },
                insecure: true,
              };
              
              var _req = https.request(options, function (_res) {
                var chunks = [];
              
                _res.on("data", function (chunk) {
                  chunks.push(chunk);
                });
              
                _res.on("end", function () {
                  var body = Buffer.concat(chunks);
                  console.log(body.toString());
                });
              });
              
             // _req.write(JSON.stringify(req.body));
              _req.end();
        console.log(_req.body.parameters);
        res.json({
            status: 'Success',
            data: '1234'
        });
        }
        catch (error) {
            console.log(error);
            res.json({
                status: 'Error:' + error,
            });
        }
    
    
    }



    exports.addCongestion = (req, res) => {
      console.log('addcong');
      console.log(req.body);
      try
      {
          const options = {
              method: "POST",
              hostname: 'dso1.miwenergia.com',
              port: "8443",
              path: '/dso1.miwenergia.com_DSO/rest/synchronisationcongestionpoints',         
              headers: {
                "Content-Type": "application/json",
              },
              insecure: true,
            };
            
            var _req = https.request(options, function (_res) {
              var chunks = [];
            
              _res.on("data", function (chunk) {
                chunks.push(chunk);
              });
            
              _res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
              });
            });
            
            _req.write(JSON.stringify(req.body));
            _req.end();
      //console.log(req.body.parameters);
      res.json({
          status: 'Success',
          data: '1234'
      });
      }
      catch (error) {
          console.log(error);
          res.json({
              status: 'Error:' + error,
          });
      }
  
  
  }


  exports.getPrognoses = (req, res) => {
    try{
      let _result=[];
  myDatabase.createStatement()
  .then(statement => {
    return statement.executeQuery('SELECT XML FROM DSO1_MIWENERGIA_COM_DSO.MESSAGE WHERE XML LIKE \'%Prognosis %\'')
  })
  .then(resultSet => {
      const arrayOfResults = resultSet.fetchAllResults()
      arrayOfResults.forEach(result => {
        _result.push(JSON.parse(parser.toJson(result['XML'])));
      
          
        })
        res.json({
          status: 'success',
          body: _result,
          }
        )
      },
  
      )
 
  }
  
 
    catch (error) {
      console.log(error);
      res.json({
          status: 'Error:' + error,
      });}
  }


  exports.getFlexOffer = (req, res) => {
    try{
      let _result=[];
  myDatabase.createStatement()
  .then(statement => {
    return statement.executeQuery('SELECT XML FROM DSO1_MIWENERGIA_COM_DSO.MESSAGE WHERE XML LIKE \'%FlexOffer %\'')
  })
  .then(resultSet => {
      const arrayOfResults = resultSet.fetchAllResults()
      arrayOfResults.forEach(result => {
        _result.push(JSON.parse(parser.toJson(result['XML'])));
      
          
        })
        res.json({
          status: 'success',
          body: _result,
          }
        )
      },
  
      )
 
  }
  
 
    catch (error) {
      console.log(error);
      res.json({
          status: 'Error:' + error,
      });}
  }


  exports.getConfigFile = (req, res) => {
    try{
      var doc = yaml.safeLoad(fs.readFileSync('/home/tsotakis/Desktop/ri.usef.energy-develop/usef-environment/config/usef-environment.yaml', 'utf8'));
      console.log(doc);
      res.json({
        status: 'success',
        body: JSON.stringify(doc),
        }
      )
    }
    catch (error) {
      console.log(error);
      res.json({
          status: 'Error:' + error,
      });}
  }



  exports.commoneferenceupdate = (req, res) => {
    try
    {
        const options = {
            method: "GET",
            hostname: 'dso1.miwenergia.com',
            port: "8443",
            path: '/dso1.miwenergia.com_DSO/rest/Event/CommonReferenceUpdateEvent',         
            headers: {
              "Content-Type": "application/json",
            },
            insecure: true,
          };
          
          var _req = https.request(options, function (_res) {
            var chunks = [];
          
            _res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            _res.on("end", function () {
              var body = Buffer.concat(chunks);
              console.log(body.toString());
            });
          });
          
         // _req.write(JSON.stringify(req.body));
          _req.end();
   // console.log(_req.body.parameters);
    res.json({
        status: 'Success',
        data: '1234'
    });
    }
    catch (error) {
        console.log(error);
        res.json({
            status: 'Error:' + error,
        });
    }
  }


  exports.commoneferencequery = (req, res) => {
    try
    {
        const options = {
            method: "GET",
            hostname: 'dso1.miwenergia.com',
            port: "8443",
            path: '/dso1.miwenergia.com_DSO/rest/Event/CommonReferenceQueryEvent',         
            headers: {
              "Content-Type": "application/json",
            },
            insecure: true,
          };
          
          var _req = https.request(options, function (_res) {
            var chunks = [];
          
            _res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            _res.on("end", function () {
              var body = Buffer.concat(chunks);
              console.log(body.toString());
            });
          });
          
         // _req.write(JSON.stringify(req.body));
          _req.end();
    //console.log(_req.body.parameters);
    res.json({
        status: 'Success',
        data: '1234'
    });
    }
    catch (error) {
        console.log(error);
        res.json({
            status: 'Error:' + error,
        });
    }
  }


  exports.connectionforecast = (req, res) => {
    try
    {
        const options = {
            method: "GET",
            hostname: 'dso1.miwenergia.com',
            port: "8443",
            path: '/dso1.miwenergia.com_DSO/rest/Event/CreateConnectionForecastEvent',         
            headers: {
              "Content-Type": "application/json",
            },
            insecure: true,
          };
          
          var _req = https.request(options, function (_res) {
            var chunks = [];
          
            _res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            _res.on("end", function () {
              var body = Buffer.concat(chunks);
              console.log(body.toString());
            });
          });
          
         // _req.write(JSON.stringify(req.body));
          _req.end();
    //console.log(_req.body.parameters);
    res.json({
        status: 'Success',
        data: '1234'
    });
    }
    catch (error) {
        console.log(error);
        res.json({
            status: 'Error:' + error,
        });
    }
  }

  exports.flexorder = (req, res) => {
    try
    {
        const options = {
            method: "GET",
            hostname: 'dso1.miwenergia.com',
            port: "8443",
            path: '/dso1.miwenergia.com_DSO/rest/Event/FlexOrderEvent',         
            headers: {
              "Content-Type": "application/json",
            },
            insecure: true,
          };
          
          var _req = https.request(options, function (_res) {
            var chunks = [];
          
            _res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            _res.on("end", function () {
              var body = Buffer.concat(chunks);
              console.log(body.toString());
            });
          });
          
         // _req.write(JSON.stringify(req.body));
          _req.end();
    //console.log(_req.body.parameters);
    res.json({
        status: 'Success',
        data: '1234'
    });
    }
    catch (error) {
        console.log(error);
        res.json({
            status: 'Error:' + error,
        });
    }
  }
    exports.flexrequest = (req, res) => {
      
      let str = req.body[0].toString()+ '/'+ req.body[1].toString()+ '/'+ req.body[2].toString();
      console.log(str);
      try
      {
          const options = {
              method: "GET",
              hostname: 'dso1.miwenergia.com',
              port: "8443",
              path: '/dso1.miwenergia.com_DSO/rest/Event/CreateFlexRequestEvent' + '/'+str,         
              headers: {
                "Content-Type": "application/json",
              },
              insecure: true,
            };
            
            var _req = https.request(options, function (_res) {
              var chunks = [];
            
              _res.on("data", function (chunk) {
                chunks.push(chunk);
              });
            
              _res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
              });
            });
            
           // _req.write(JSON.stringify(req.body));
            _req.end();
      //console.log(_req.body.parameters);
      res.json({
          status: 'Success',
          data: '1234'
      });
      }
      catch (error) {
          console.log(error);
          res.json({
              status: 'Error:' + error,
          });
      }
    }
  