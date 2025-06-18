require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());
// Routes
const authRoutes = require('./routes/auth');
// const gem_apiRoutes = require('./routes/gem_api');
app.use('/auth', authRoutes);
// app.use('/gem_api', gem_apiRoutes);

//--------------------------------------------------------------------------------------
const dbRequest = require('./lib/dbrequest');
const requestType = {
  getMbkey: async function () {
    return await dbRequest.getMbkey();
  },
  getLength2: async function (body) {
    return await dbRequest.getLength2(body);
  },
  getLength4: async function (body) {
    return await dbRequest.getLength4(body);
  },
  getLength: async function (qry) {
    return await dbRequest.getLength(qry);
  },
  // getNFID: async function (qry) {
  //   return await dbRequest.getNFID(qry);
  // },
  getCsvPfr: async function (sggid) {
    return await dbRequest.getCsvPfr(sggid);
  },
  getCordOnly: async function (params) {
    return await dbRequest.getCordOnly(params);
  },
  getProp: async function (params) {
    return await dbRequest.getProp(params);
  },
  getShap: async function (params) {
    return await dbRequest.getShap(params);
  },
  getSrchId: async function (params) {
    return await dbRequest.getSrchId(params);
  },
  // getTop5: async function (params) {
  //   return await dbRequest.getTop5(params);
  // },
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
  getSidogjs: async function () {
    return await dbRequest.getSidogjs();
  },
  getSgggjs: async function () {
    return await dbRequest.getSgggjs();
  },
  getLdc: async function (ldc) {
    return await dbRequest.getLdc(ldc);
  },
  getSide1r: async function (params) {
    return await dbRequest.getSide1r(params);
  },
  getSidesmp: async function () {
    return await dbRequest.getSidesmp();
  },
  getPie1: async function (params) {
    return await dbRequest.getPie1(params);
  },
  postSrvy: async function (body) {
    return await dbRequest.postSrvy(body);
  },
  getSrvyhist: async function (body) {
    return await dbRequest.getSrvyhist(body);
  },
  getCsvSrvy: async function (body) {
    return await dbRequest.getCsvSrvy(body);
  },
  getSrvyItem: async function (body) {
    return await dbRequest.getSrvyItem(body);
  },
  delSrvyItem: async function (body) {
    return await dbRequest.delSrvyItem(body);
  },
  editSrvy: async function (body) {
    return await dbRequest.editSrvy(body);
  },
  getCsvGen1: async function (body) {
    return await dbRequest.getCsvGen1(body);
  },
  getRiskPrcnt: async function (body) {
    return await dbRequest.getRiskPrcnt(body);
  },

  ////////////////////////////////////////
  getPfrjs: async function () {
    return await dbRequest.getPfrjs();
  },
  getPfrParks: async function (sggid) {
    return await dbRequest.getPfrParks(sggid);
  },
  getPfrParksBuffer: async function (sggid) {
    return await dbRequest.getPfrParksBuffer(sggid);
  },
  getPfrSafezoneC: async function (sggid) {
    return await dbRequest.getPfrSafezoneC(sggid);
  },
  getPfrSafezoneS: async function (sggid) {
    return await dbRequest.getPfrSafezoneS(sggid);
  },
  getPfrMultfac: async function (sggid) {
    return await dbRequest.getPfrMultfac(sggid);
  },
  getPfrMultfacEntr: async function (sggid) {
    return await dbRequest.getPfrMultfacEntr(sggid);
  },
  getPfrSchoolBld: async function (sggid) {
    return await dbRequest.getPfrSchoolBld(sggid);
  },
  getPfrSchlBuffer: async function (sggid) {
    return await dbRequest.getPfrSchlBuffer(sggid);
  },
  getPfrSchlEntr: async function (sggid) {
    return await dbRequest.getPfrSchlEntr(sggid);
  },
  getTopPfr: async function (sggid) {
    return await dbRequest.getTopPfr(sggid);
  },
  submitTable: async function (data) {
    return await dbRequest.submitTable(data);
  },
  getSurveyBuffer: async function (ids) {
    return await dbRequest.getSurveyBuffer(ids);
  },
  getSurveyBufferMask: async function (ids) {
    return await dbRequest.getSurveyBufferMask(ids);
  },
  getSrvData: async function (ids) {
    return await dbRequest.getSrvData(ids);
  },
  getLstLength: async function (ids) {
    return await dbRequest.getLstLength(ids);
  },
  getPfrProps: async function (ids) {
    return await dbRequest.getPfrProps(ids);
  },
  getTouchedLinks: async function (nf_id) {
    return await dbRequest.getTouchedLinks(nf_id);
  },
};
//--------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////
app.get('/getMbkey', async (req, res) => {
  try {
    const rtrvd = await requestType['getMbkey']();
    // console.log('getMbkey rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getMbkey at app');
  }
});

app.post('/getLength2', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app getLength2 triggered and body\n', body);
    const rtrvd = await requestType['getLength2'](body);
    // console.log('getLength2 rtrvd app:\n', rtrvd);
    res.send({ total_length: rtrvd });
  } catch (e) {
    console.error(e);
    res.status(500).send('error getLength2 at app');
  }
});

app.post('/getLength4', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app getLength4 triggered and body\n', body);
    const rtrvd = await requestType['getLength4'](body);
    // console.log('getLength4 rtrvd app:\n', rtrvd);
    res.send({ total_length: rtrvd ?? 0 });
  } catch (e) {
    console.error(e);
    res.status(500).send('error getLength4 at app');
  }
});

app.get('/getLength/:qry', async (req, res) => {
  const qry = req.params.qry === 'null' ? null : req.params.qry;
  // console.log('getlength qry at app\n', qry);

  try {
    const rtrvd = await requestType['getLength'](qry);
    // console.log("typeof getLength rtrvd at app: ", typeof rtrvd);
    // console.log("getLength rtrvd at app: ", rtrvd);
    res.send(rtrvd ? rtrvd.toString() : '0');
  } catch (e) {
    console.error(e);
    res.status(500).send('error getLength at app');
  }
});

app.get('/getLstLength', async (req, res) => {
  const { ids } = req.query;
  try {
    const rtrvd = await requestType['getLstLength'](ids);
    res.send({ total_length: rtrvd });
  } catch (e) {
    console.error(e);
    res.status(500).send('error getLstLength at app');
  }
});

app.get('/getCsvPfr/:sggid', async (req, res) => {
  const sggid = req.params.sggid === null ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getCsvPfr'](sggid);
    // console.log("typeof getCsvPfr rtrvd at app: ", typeof rtrvd);
    // console.log("getCsvPfr rtrvd at app: ", rtrvd);
    res.json(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getCsvPfr at app');
  }
});

app.get('/getCordOnly/:params', async (req, res) => {
  const params = req.params.params === 'null' ? null : req.params.params;
  try {
    const rtrvd = await requestType['getCordOnly'](params);
    // console.log("typeof getCordOnly rtrvd at app: ", typeof rtrvd);
    // console.log("getCordOnly rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getCordOnly at app');
  }
});

app.get('/getProp/:params', async (req, res) => {
  const params = req.params.params === 'null' ? null : req.params.params;
  try {
    const rtrvd = await requestType['getProp'](params);
    // console.log("typeof getProp rtrvd at app: ", typeof rtrvd);
    // console.log("getProp rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getProp at app');
  }
});

app.get('/getShap/:params', async (req, res) => {
  const params = req.params.params === 'null' ? null : req.params.params;
  try {
    const rtrvd = await requestType['getShap'](params);
    // console.log("typeof getShap rtrvd at app: ", typeof rtrvd);
    // console.log("getShap rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getShap at app');
  }
});

app.get('/getSrchId/:params', async (req, res) => {
  const params = req.params.params === 'null' ? null : req.params.params;
  try {
    const rtrvd = await requestType['getSrchId'](params);
    // console.log("typeof getSrchId rtrvd at app: ", typeof rtrvd);
    // console.log("getSrchId rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSrchId at app');
  }
});

// app.get('/getTop5/:ldc/:rsktype', async (req, res) => {
//   // console.log('getop5 reqparams\n', req.params);

//   const params = Object.fromEntries(
//     Object.entries(req.params).map(([key, val]) => [
//       key,
//       val === 'null' ? null : val,
//     ])
//   );
//   try {
//     const rtrvd = await requestType['getTop5'](params);
//     // console.log("typeof getTop5 rtrvd at app: ", typeof rtrvd);
//     // console.log("getTop5 rtrvd at app: ", rtrvd);
//     res.send(rtrvd);
//   } catch (e) {
//     console.error(e);
//     res.status(500).send('error getTop5 at app');
//   }
// });

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
  } catch (e) {
    console.error(e);
    res.status(500).send('error getEcon at app');
  }
});

app.get('/getReg', async (req, res) => {
  try {
    const rtrvd = await requestType['getReg']();
    // console.log('typeof getEcon rtrvd at app: ', typeof rtrvd);
    // console.log('getEcon rtrvd at app: ', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
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
  } catch (e) {
    console.error(e);
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
  } catch (e) {
    console.error(e);
    res.status(500).send('error getBar2sgg at app');
  }
});

app.get('/getSidogjs', async (req, res) => {
  try {
    const rtrvd = await requestType['getSidogjs']();
    // console.log('getSidogjs rtrvd app:\n', rtrvd);
    res.json(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSiodgjs at app');
  }
});

app.get('/getSgggjs', async (req, res) => {
  try {
    // console.log('sgggjssgggjs triggered');
    const rtrvd = await requestType['getSgggjs']();
    // console.log('getSgggjs rtrvd app:\n', rtrvd);
    res.json(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSgggjs at app');
  }
});

app.get('/getLdc/:ldc', async (req, res) => {
  const ldc = req.params.ldc === 'null' ? null : req.params.ldc;
  try {
    // console.log('getldc triggered');
    const rtrvd = await requestType['getLdc'](ldc);
    // console.log('getLdc at app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getLdc at app');
  }
});

app.get('/getSide1r/:minx/:miny/:maxx/:maxy', async (req, res) => {
  const params = Object.fromEntries(
    Object.entries(req.params).map(([key, val]) => [
      key,
      val === 'null' ? null : val,
    ])
  );
  try {
    // console.log('getSide1r triggered app');
    const rtrvd = await requestType['getSide1r'](params);
    // console.log('getSide1r rtrvd app:\n', rtrvd);
    res.json(rtrvd);
    // console.log('appgetside1rreq\n', req.query);

    // res.send('heelow');
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSide1r at app');
  }
});

app.get('/getSidesmp', async (req, res) => {
  try {
    // console.log('SidesmpSidesmp triggered');
    const rtrvd = await requestType['getSidesmp']();
    // console.log('getSidesmp rtrvd app:\n', rtrvd);
    res.json(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSidesmp at app');
  }
});

app.get('/getPie1/:col/:ldc', async (req, res) => {
  const params = Object.fromEntries(
    Object.entries(req.params).map(([key, val]) => [
      key,
      val === 'null' ? null : val,
    ])
  );
  try {
    // console.log('getPie1 triggered');
    const rtrvd = await requestType['getPie1'](params);
    // console.log('getPie1 rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPie1 at app');
  }
});

app.post('/postSrvy', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app postSrvy triggered and body\n', body);
    const rtrvd = await requestType['postSrvy'](body);
    // console.log('postSrvy rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error postSrvy at app');
  }
});

app.post('/getSrvyhist', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app postSrvy triggered and body\n', body);
    const rtrvd = await requestType['getSrvyhist'](body);
    // console.log('getSrvyhist rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSrvyhist at app');
  }
});

app.post('/getCsvSrvy', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app postSrvy triggered and body\n', body);
    const rtrvd = await requestType['getCsvSrvy'](body);
    // console.log('getCsvSrvy rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getCsvSrvy at app');
  }
});

app.post('/getSrvyItem', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app postSrvy triggered and body\n', body);
    const rtrvd = await requestType['getSrvyItem'](body);
    // console.log('getSrvyItem rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSrvyItem at app');
  }
});

app.post('/delSrvyItem', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app postSrvy triggered and body\n', body);
    const rtrvd = await requestType['delSrvyItem'](body);
    // console.log('delSrvyItem rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error delSrvyItem at app');
  }
});

app.post('/editSrvy', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app editSrvy triggered and body\n', body);
    const rtrvd = await requestType['editSrvy'](body);
    // console.log('editSrvy rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error editSrvy at app');
  }
});

app.post('/getCsvGen1', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app postSrvy triggered and body\n', body);
    const rtrvd = await requestType['getCsvGen1'](body);
    // console.log('getCsvGen1 rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getCsvGen1 at app');
  }
});

app.post('/getRiskPrcnt', async (req, res) => {
  const body = req.body;
  try {
    // console.log('app postSrvy triggered and body\n', body);
    const rtrvd = await requestType['getRiskPrcnt'](body);
    // console.log('getRiskPrcnt rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getRiskPrcnt at app');
  }
});

/////////////////////////////////////////////////////////////////

app.get('/getPfrjs', async (req, res) => {
  try {
    const rtrvd = await requestType['getPfrjs']();
    res.json(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrjs at app');
  }
});

app.get('/getPfrdata/parks/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getPfrParks'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrParks at app');
  }
});

app.get('/getPfrdata/parks_buffer/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getPfrParksBuffer'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrParksBuffer at app');
  }
});

app.get('/getPfrdata/ch_safe_zone/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getPfrSafezoneC'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrSafezoneC at app');
  }
});

app.get('/getPfrdata/sn_safe_zone/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getPfrSafezoneS'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrSafezoneS at app');
  }
});

app.get('/getPfrdata/multfac/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getPfrMultfac'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrMultfac at app');
  }
});

app.get('/getPfrdata/multfac_entr/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getPfrMultfacEntr'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrMultfacEntr at app');
  }
});

app.get('/getPfrdata/schl_bld/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getPfrSchoolBld'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrSchoolBld at app');
  }
});

app.get('/getPfrdata/schl_buffer/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getPfrSchlBuffer'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrSchlBuffer at app');
  }
});

app.get('/getPfrdata/schl_entr/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getPfrSchlEntr'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrSchlEntr at app');
  }
});

app.get('/getTopPfr/:sggid', async (req, res) => {
  const sggid = req.params.sggid === 'null' ? null : req.params.sggid;
  try {
    const rtrvd = await requestType['getTopPfr'](sggid);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getTopPfr at app');
  }
});

app.post('/submit-table', async (req, res) => {
  const { data } = req.body;
  try {
    const sbmt = await requestType['submitTable'](data);
    res.send({ success: sbmt });
  } catch (err) {
    console.error(err);
    res.status(500).send('error inserting table');
  }
});

app.get('/getSurveyBuffer', async (req, res) => {
  try {
    const { ids } = req.query;
    const rtrvd = await requestType['getSurveyBuffer'](ids);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSurveyBuffer at app');
  }
});

app.get('/getSurveyBufferMask', async (req, res) => {
  try {
    const { ids } = req.query;
    const rtrvd = await requestType['getSurveyBufferMask'](ids);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSurveyBufferMask at app');
  }
});

app.get('/getSrvData', async (req, res) => {
  const { ids } = req.query;
  try {
    const rtrvd = await requestType['getSrvData'](ids);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getSrvData at app');
  }
});

app.get('/getLstLength', async (req, res) => {
  const { ids } = req.query;
  try {
    const rtrvd = await requestType['getLstLength'](ids);
    res.send({ total_length: rtrvd });
  } catch (e) {
    console.error(e);
    res.status(500).send('error getLstLength at app');
  }
});

app.get('/getPfrProps', async (req, res) => {
  const { ids } = req.query;
  try {
    const rtrvd = await requestType['getPfrProps'](ids);
    res.send({ data: rtrvd });
  } catch (e) {
    console.error(e);
    res.status(500).send('error getPfrProps at app');
  }
});

app.get('/getTouchedLinks/:nf_id', async (req, res) => {
  const nf_id = req.params?.nf_id;
  try {
    const rtrvd = await requestType['getTouchedLinks'](nf_id);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getTouchedLinks at app');
  }
});

app.get('/manual', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'public/files/Manual_2501.pdf');

    res.download(filePath, 'Manual_2501.pdf', (err) => {
      if (err) {
        console.error('Error downloading manual:', err);
        res.status(500).send('Error downloading manual');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching manual');
  }
});

// handling build
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
