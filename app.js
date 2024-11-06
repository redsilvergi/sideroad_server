const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());

//--------------------------------------------------------------------------------------
const dbRequest = require('./lib/dbrequest');
const requestType = {
  getLength: async function (qry) {
    return await dbRequest.getLength(qry);
  },
  // getNFID: async function (qry) {
  //   return await dbRequest.getNFID(qry);
  // },
  getCsv: async function (qry) {
    return await dbRequest.getCsv(qry);
  },
  getCord: async function (item) {
    return await dbRequest.getCord(item);
  },
  getSrchId: async function (qry) {
    return await dbRequest.getSrchId(qry);
  },
  getTop5: async function (qry) {
    return await dbRequest.getTop5(qry);
  },
  getEcon: async function (params) {
    return await dbRequest.getEcon(params);
  },
  getReg: async function () {
    return await dbRequest.getReg();
  },
  getBar2sido: async function (params) {
    return await dbRequest.getBar2sido(params);
  },
  getBar2sgg: async function (params) {
    return await dbRequest.getBar2sgg(params);
  },
};
//--------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////

app.get('/getLength/:qry', async (req, res) => {
  const qry = req.params.qry === 'null' ? null : req.params.qry;
  try {
    const rtrvd = await requestType['getLength'](qry);
    // console.log("typeof getLength rtrvd at app: ", typeof rtrvd);
    // console.log("getLength rtrvd at app: ", rtrvd);
    res.send(rtrvd ? rtrvd.toString() : '0');
  } catch (err) {
    console.error(err);
    res.status(500).send('error getLength at app');
  }
});

app.get('/getCsv/:qry', async (req, res) => {
  const qry = req.params.qry === 'null' ? null : req.params.qry;
  try {
    const rtrvd = await requestType['getCsv'](qry);
    // console.log("typeof getCsv rtrvd at app: ", typeof rtrvd);
    // console.log("getCsv rtrvd at app: ", rtrvd);
    res.json(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send('error getCsv at app');
  }
});

app.get('/getCord/:item', async (req, res) => {
  const item = req.params.item === 'null' ? null : req.params.item;
  try {
    const rtrvd = await requestType['getCord'](item);
    // console.log("typeof getCord rtrvd at app: ", typeof rtrvd);
    // console.log("getCord rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send('error getCord at app');
  }
});

app.get('/getSrchId/:qry', async (req, res) => {
  const qry = req.params.qry === 'null' ? null : req.params.qry;
  try {
    const rtrvd = await requestType['getSrchId'](qry);
    // console.log("typeof getSrchId rtrvd at app: ", typeof rtrvd);
    // console.log("getSrchId rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send('error getSrchId at app');
  }
});

app.get('/getTop5/:qry', async (req, res) => {
  const qry = req.params.qry === 'null' ? null : req.params.qry;
  try {
    const rtrvd = await requestType['getTop5'](qry);
    // console.log("typeof getTop5 rtrvd at app: ", typeof rtrvd);
    // console.log("getTop5 rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send('error getTop5 at app');
  }
});

app.get('/getEcon/:citem/:ldc/:yr', async (req, res) => {
  // console.log('getEcon reqparams at app: ', req.params);
  const params = Object.fromEntries(
    Object.entries(req.params).map(([key, val]) => [
      key,
      val === 'null' ? null : val,
    ])
  );
  // console.log('getEcon params at app: ', params);

  try {
    const rtrvd = await requestType['getEcon'](params);
    // console.log('typeof getEcon rtrvd at app: ', typeof rtrvd);
    // console.log('getEcon rtrvd at app: ', rtrvd);
    res.send(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send('error getEcon at app');
  }
});

app.get('/getReg', async (req, res) => {
  try {
    const rtrvd = await requestType['getReg']();
    // console.log('typeof getEcon rtrvd at app: ', typeof rtrvd);
    // console.log('getEcon rtrvd at app: ', rtrvd);
    res.send(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send('error getReg at app');
  }
});

app.get('/getBar2sido/:tablenm/:yr', async (req, res) => {
  const params = Object.fromEntries(
    Object.entries(req.params).map(([key, val]) => [
      key,
      val === 'null' ? null : val,
    ])
  );
  try {
    // console.log('getbar2sido params at app', params);
    const rtrvd = await requestType['getBar2sido'](params);
    // console.log('typeof getBar2sido rtrvd at app: ', typeof rtrvd);
    // console.log('getBar2sido rtrvd at app: ', rtrvd);
    res.send(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send('error getBar2sido at app');
  }
});

app.get('/getBar2sgg/:tablenm/:sidotmp/:yr', async (req, res) => {
  const params = Object.fromEntries(
    Object.entries(req.params).map(([key, val]) => [
      key,
      val === 'null' ? null : val,
    ])
  );
  try {
    // console.log('getbar2sgg params at app', params);
    const rtrvd = await requestType['getBar2sgg'](params);
    // console.log("typeof getBar2sgg rtrvd at app: ", typeof rtrvd);
    // console.log("getBar2sgg rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send('error getBar2sgg at app');
  }
});

const _dirname = path.dirname('');
const buildPath = path.join(_dirname, './build');
app.use(express.static(buildPath));
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, './build/index.html'), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log('server started');
});
