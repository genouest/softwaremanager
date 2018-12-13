/*jslint node: true, es6 */
"use strict";

var express = require('express');
var router = express.Router();


var CONFIG = require('config');

if(process.env.TOKENS) {
  CONFIG.auth.tokens = process.env.TOKENS.split(',')
}

var monk = require('monk');
var db = monk(CONFIG.mongo.host + ':' + CONFIG.mongo.port + '/' + CONFIG.mongo.db);
var softs_db = db.get('softs');
var stats_db = db.get('stats');

const softwareTemplate = {
  id: 'unique id made of name + version',
  uid: 'biotools id',
  name: 'name [Mandatory]',
  version: 'version [Mandatory]',
  location: 'installation directory [Mandatory]',
  env: 'environement to use software',
  info: 'general info',
  type: 'manual|conda|...'
};

function checkSoftware(soft){
  if (! soft.name) { return [soft, false] };
  if (! soft.version) { return [soft, true] };
  soft.id = soft.name + '_' + soft.version;
  let checkedSoft = { id: soft.id, name: soft.name, version: soft.version }
  if (soft.uid) { checkedSoft.uid = soft.uid }
  if (soft.location) { checkedSoft.location = soft.location }
  if (soft.info) { checkedSoft.info = soft.info }
  if (soft.type) { checkedSoft.type = soft.type }
  if (soft.env) { checkedSoft.env = soft.env }
  return [checkedSoft, false]
};

function isAllowed(req) {
  var token = req.headers['x-api-key'] || null;
  if (token && CONFIG.auth.tokens.indexOf(token) > -1) {
    return true;
  }
  return false;
}

function compare(a,b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}


/* GET software listing. */
router.get('/', function (req, res, next) {
  softs_db.find({}).then(
    results => {
      console.log('softwares', results);
      results.sort(compare);
      let softwares = [];
      let prevSoftware = '';
      for(let i=0;i<results.length;i++) {
        let software = results[i];
        if(software.name == prevSoftware) {
          continue;
        }
        prevSoftware = software.name;
        softwares.push(software)
      }
      res.send({'softwares': softwares});
      res.end()
    },
    err => {
      console.log('Failed to get softwares');
      res.status(500).send('Failed to get softwares');
    }
  )
});

/* GET selected software listing. */
router.get('/:id', function(req, res, next) {
  let softID = req.param('id');
  softs_db.find({'name': softID}).then(
    result => {
      if (result === null || result.length == 0) {
        res.status(404).send(softID + ' not found');
        return
      }
      console.log('software', softID, result);
      res.send({'software': result});
      res.end()
    },
    err => {
      console.log('Failed to get softwares');
      res.status(500).send('Failed to get softwares');
    }
  )
});

/* GET selected software  and version. */
router.get('/:id/:version', function(req, res, next) {
  let softID = req.param('id');
  let softVersion = req.param('version');
  softs_db.findOne({'name': softID, 'version': softVersion}).then(
    result => {
      if (result === null) {
        res.status(404).send(softID + ' not found');
        return
      }
      console.log('software', softID, result);
      res.send({'software': result});
      res.end()
    },
    err => {
      console.log('Failed to get softwares');
      res.status(500).send('Failed to get softwares');
    }
  )
});

router.delete('/:id/:version', function(req, res, next) {
  if (! isAllowed(req)) {
    res.status(403).send('Not authorized');
    return
  }
  let softID = req.param('id');
  let softVersion = req.param('version');
  softs_db.remove({'name': softID, 'version': softVersion}).then(
    result => {
      if (result === null) {
        res.status(404).send(softID + ' not found');
        return
      }
      res.send({msg: softId + '.' + softVersion + ' deleted'});
      res.end()
    },
    err => {
      console.log('Failed to delete software version');
      res.status(500).send('Failed to delete software version');
    }
  )
});

router.delete('/:id', function(req, res, next) {
  if (! isAllowed(req)) {
    res.status(403).send('Not authorized');
    return
  }
  let softID = req.param('id');
  softs_db.remove({'name': softID}).then(
    result => {
      if (result === null) {
        res.status(404).send(softID + ' not found');
        return
      }
      res.send({msg: softId + ' deleted'});
      res.end()
    },
    err => {
      console.log('Failed to delete software');
      res.status(500).send('Failed to delete software');
    }
  )
});


/* POST create or update a software version. */
router.post('/', function(req, res, next) {
  if (! isAllowed(req)) {
    res.status(403).send('Not authorized');
    return
  }
  let soft = req.param('software');
  
  if (! soft) {
    res.status(400).send('Invalid software data');
  }
  let [checkedSoft, err] = checkSoftware(soft);
  if (err) {
    res.status(400).send('Invalid software data');
    return;
  }
  softs_db.update({'id': checkedSoft.id}, checkedSoft, {upsert: true}).then( result => {
    res.send({'software': checkedSoft});
      res.end();
  });
});


module.exports = router;
