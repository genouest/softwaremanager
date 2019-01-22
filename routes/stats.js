/*jslint node: true, es6 */
"use strict";

var express = require('express');
var router = express.Router();


var CONFIG = require('config');

if(process.env.TOKENS) {
  CONFIG.auth.tokens = process.env.TOKENS.split(',')
}

const Influx = require('influx');
const influx = new Influx.InfluxDB({
 host: CONFIG.influx.host,
 database: CONFIG.influx.db,
 schema: [
   {
     measurement: 'stats',
     fields: {
       value: Influx.FieldType.INTEGER
     },
     tags: [
       'soft',
       'version'
     ]
   }
 ]
})

function isAllowed(req) {
  var token = req.headers['x-api-key'] || null;
  if (token && CONFIG.auth.tokens.indexOf(token) > -1) {
    return true;
  }
  return false;
}

router.put('/:id/:version', function( req, res, next) {
  if(!isAllowed(req)){
    res.status(403).send('unauthorized');
  }
  influx.writePoints([
    {
      measurement: 'stats',
      tags: { soft: req.params['id'], version: req.params['version'] },
      fields: { value: 1 },
    }
  ]).then(() => {
    res.status(200).send('done');
  })
});

router.put('/:id', function( req, res, next) {
  if(!isAllowed(req)){
    res.status(403).send('unauthorized');
  }
  influx.writePoints([
    {
      measurement: 'stats',
      tags: { soft: req.params['id'], version: 'none' },
      fields: { value: 1 },
    }
  ]).then(() => {
    res.status(200).send('done');
  })
});

module.exports = router;
