const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());
// Routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

//--------------------------------------------------------------------------------------
const dbRequest = require('./lib/dbrequest');
const requestType = {
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
  getCsv: async function (qry) {
    return await dbRequest.getCsv(qry);
  },
  getCord: async function (params) {
    return await dbRequest.getCord(params);
  },
  getProp: async function (params) {
    return await dbRequest.getProp(params);
  },
  getShap: async function (params) {
    return await dbRequest.getShap(params);
  },
  getSrchId: async function (qry) {
    return await dbRequest.getSrchId(qry);
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
};
//--------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////
app.post('/getLength2', async (req, res) => {
  const body = req.body;
  try {
    console.log('app getLength2 triggered and body\n', body);
    const rtrvd = await requestType['getLength2'](body);
    console.log('getLength2 rtrvd app:\n', rtrvd);
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
    console.log('getLength4 rtrvd app:\n', rtrvd);
    res.send({ total_length: rtrvd });
  } catch (e) {
    console.error(e);
    res.status(500).send('error getLength4 at app');
  }
});

app.get('/getLength/:qry', async (req, res) => {
  const qry = req.params.qry === 'null' ? null : req.params.qry;
  console.log('getlength qry at app\n', qry);

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

app.get('/getCsv/:qry', async (req, res) => {
  const qry = req.params.qry === 'null' ? null : req.params.qry;
  try {
    const rtrvd = await requestType['getCsv'](qry);
    // console.log("typeof getCsv rtrvd at app: ", typeof rtrvd);
    // console.log("getCsv rtrvd at app: ", rtrvd);
    res.json(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getCsv at app');
  }
});

app.get('/getCord/:params', async (req, res) => {
  const params = req.params.params === 'null' ? null : req.params.params;
  try {
    const rtrvd = await requestType['getCord'](params);
    // console.log("typeof getCord rtrvd at app: ", typeof rtrvd);
    // console.log("getCord rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error getCord at app');
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

app.get('/getSrchId/:qry', async (req, res) => {
  const qry = req.params.qry === 'null' ? null : req.params.qry;
  try {
    const rtrvd = await requestType['getSrchId'](qry);
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
    console.log('postSrvy rtrvd app:\n', rtrvd);
    res.send(rtrvd);
  } catch (e) {
    console.error(e);
    res.status(500).send('error postSrvy at app');
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
