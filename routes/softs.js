/*jslint node: true, es6 */
"use strict";

var express = require('express');
var router = express.Router();


var CONFIG = require('config');

if (process.env.TOKENS) {
  CONFIG.auth.tokens = process.env.TOKENS.split(',')
}

var monk = require('monk');
var db = monk(CONFIG.mongo.host + ':' + CONFIG.mongo.port + '/' + CONFIG.mongo.db);
var softs_db = db.get('softs');
var versions_db = db.get('versions');

const softwareTemplate = {
  name: 'name [Mandatory]',
  uid: 'biotools id [Optional]' ,
  description: 'short description [optional]',
  info: 'general info [optional]'
};

const SoftwareVersionTemplate = {
  id: 'unique id made of name + version [Auto generated]',
  name: 'software name [Mandatory]',
  version: 'version [Mandatory]',
  location: 'installation directory [Mandatory]',
  env: 'environement to use software',
  info: 'general info',
  type: 'manual|conda|...'
};

function checkSoftware(soft) {
  if (! soft.name) { return [soft, false] };
  let checkedSoft = { name: soft.name, uid: '', info: '', description: '' }
  if (soft.uid) { checkedSoft.uid = soft.uid }
  if (soft.info) { checkedSoft.info = soft.info }
  if (soft.description) { checkedSoft.description = soft.description}
  return [checkedSoft, false]
};

function checkSoftwareVersion(soft) {
  if (! soft.name) { return [soft, false] };
  if (! soft.version) { return [soft, true] };
  soft.id = soft.name + '_' + soft.version;
  let checkedSoft = {
    id: soft.id,
    name: soft.name,
    version: soft.version,
    info: '',
    location: '',
    type: '',
    env: ''
  }
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
      console.log('Software list: ', results);
      results.sort(compare);
      res.send({'software': results});
      res.end()
    },
    err => {
      console.log('Failed to get software');
      res.status(500).send('Failed to get software');
    }
  )
});

/* GET selected software listing. */
router.get('/:id', function(req, res, next) {
  let softID = req.params.id;

  softs_db.findOne({'name': softID}).then(
    soft => {
      if (soft === null) {
        res.status(404).send(softID + ' not found');
        return
      }
      versions_db.find({'name': softID}).then(
        versions => {
          res.send({'software': soft, 'versions': versions});
          res.end()
        },
        err => {
          console.log('Failed to get software');
          res.status(500).send('Failed to get software');
        }
      )
    },
    err => {
      console.log('Failed to get software');
      res.status(500).send('Failed to get software');
    }
  )
});

/* GET selected software  and version. */
router.get('/:id/:version', function(req, res, next) {
  let softID = req.params.id;
  let softVersion = req.params.version;
  softs_db.findOne({'name': softId}).then(
    soft => {
      if (soft === null) {
        res.status(404).send(softID + ' not found');
        return
      }
      versions_db.findOne({'name': softID, 'version': softVersion}).then(
        version => {
          if (version === null) {
            res.status(404).send('version not found');
            return
          }
          res.send({'software': soft, 'version': version});
          res.end()
        },
        err => {
          console.log('Failed to get software');
          res.status(500).send('Failed to get software');
        }
      )
    },
    err => {
      console.log('Failed to get software');
      res.status(500).send('Failed to get software');
    }
  )
});

router.delete('/:id/:version', function(req, res, next) {
  if (! isAllowed(req)) {
    res.status(403).send('Not authorized');
    return
  }
  let softID = req.params.id;
  let softVersion = req.params.version;
  versions_db.remove({'name': softID, 'version': softVersion}).then(
    _ => {
      res.send({msg: softId + '.' + softVersion + ' deleted'});
      res.end()
    },
    _ => {
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
  let softID = req.params.id;
  softs_db.remove({'name': softID}).then(
    _ => {
      versions_db.remove({'name': softID}).then(
        res => {
          res.send({msg: softId + ' deleted'});
          res.end()
        },
        err => {
          console.log('Failed to delete software versions');
          res.status(500).send('Failed to delete software versions');
        }
      );
    },
    _ => {
      console.log('Failed to delete software');
      res.status(500).send('Failed to delete software');
    }
  )
});


/* POST create or update a software version.

  Expects a dict {software: SoftwareTemplate, version: SoftwareVersionTemplate}
  Dict can contain either or both (to update software info and add or update a version)
*/
router.post('/', function(req, res, next) {
  if (! isAllowed(req)) {
    res.status(403).send('Not authorized');
    return
  }

  let soft = req.body.software;
  let version = req.body.version;

  let checkedSoft = null;
  let err = false;

  if (soft) {
    [checkedSoft, err] = checkSoftware(soft);
  }
  if (err) {
    res.status(400).send('Invalid software data');
    return;
  }

  let checkedSoftVersion = null;
  let errVersion = false;

  if (version) {
    [checkedSoftVersion, errVersion] = checkSoftwareVersion(version);
  }
  if (errVersion) {
    res.status(400).send('Invalid software version data');
    return;
  }

  if (soft) {
    softs_db.update({'name': checkedSoft.name}, checkedSoft, {upsert: true}).then( result => {
      if (version) {
        versions_db.update({'id': checkedSoftVersion.id}, checkedSoftVersion, {upsert: true}).then( result => {
          res.send({software: checkedSoft, version: checkedSoftVersion});
          res.end();
        });
      } else {
        res.send({software: checkedSoft, version: null});
        res.end();
      }
    });
  } else if (version) {
    versions_db.update({'id': checkedSoftVersion.id}, checkedSoftVersion, {upsert: true}).then( result => {
      res.send({software: null, version: checkedSoftVersion});
        res.end();
    });
  }
});


module.exports = router;
