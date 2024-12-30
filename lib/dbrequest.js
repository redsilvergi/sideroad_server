const myDB = require('../config/config');
const { Pool } = require('pg');

// CONNECTION -----------------------------------------------------
const dbconn = () => {
  const client = new Pool(myDB.dbConfig);
  return client;
};
const client = dbconn();
// HELPERS -----------------------------------------------------
// REQUEST METHODS -----------------------------------------------------------
const getLength2 = async (body) => {
  const { rnfo0, rnfo1, ldc } = body;
  console.log('dbreq getL2 rnfo0\n', rnfo0);
  console.log('dbreq getL2 rnfo1\n', rnfo1);
  console.log('dbreq getL2 ldc\n', ldc);

  //initiate qry
  var qry = `select sum(road_lt) as total_length from risk.side1r_length where `;

  //ldc check
  if (!ldc) {
    qry += '';
  } else if (ldc.slice(2) === '000') {
    qry += `sido = '${ldc.slice(0, 2)}' and `;
  } else if (ldc.slice(2) !== '000') {
    qry += `leglcd_se = '${ldc}' and `;
  } else {
    qry += '';
  }

  //filter based on rnfos
  if (rnfo0 && rnfo1) {
    const idx0 = [];
    for (let i = 0; i < rnfo0.length; i++) {
      if (rnfo0[i]) {
        idx0.push(4 - i);
      }
    }
    const idx1 = [];
    for (let i = 0; i < rnfo1.length; i++) {
      if (rnfo1[i]) {
        idx1.push(4 - i);
      }
    }
    qry += `pedac_rk = ${idx0[0]} and pred = ${idx1[0]}`;
  } else if (rnfo0) {
    const idxs = [];
    for (let i = 0; i < rnfo0.length; i++) {
      if (rnfo0[i]) {
        idxs.push(4 - i);
      }
    }
    if (idxs.length === 0) {
      qry = null;
    } else {
      qry += `pedac_rk in (${idxs.join(', ')})`;
    }
  } else if (rnfo1) {
    const idxs = [];
    for (let i = 0; i < rnfo1.length; i++) {
      if (rnfo1[i]) {
        idxs.push(4 - i);
      }
    }
    if (idxs.length === 0) {
      qry = null;
    } else {
      qry += `pred in (${idxs.join(', ')})`;
    }
  } else {
    qry = null;
  }

  //run the dbrequest using formulated qry
  try {
    console.log('dbreq getL2 qry\n', qry);
    if (qry) {
      const result = await client.query(qry);
      const total_length = result.rows[0].total_length;
      console.log('dbreq getL2 total_length\n', total_length);
      return total_length;
    } else {
      return 0;
    }
  } catch (err) {
    console.log(err);
  }
};

const getLength4 = async (body) => {
  const { info, ldc } = body;
  // console.log('dbreq getLength4 info\n', info);
  // console.log('dbreq getLength4 ldc\n', ldc);
  const {
    rdbtOps,
    slopeOps,
    pmtrOps,
    rdnetOps,
    pubtrOps,
    pbuldOps,
    buldeOps,
    stairOps,
    sdwkOps,
  } = info;

  var qry = 'select sum(length) as total_length from srvy.side1r_length where ';
  const rdbtQry =
    rdbtOps.checkboxes &&
    rdbtOps.checkboxes
      .map((rdbtOp, index) => {
        if (rdbtOp) {
          switch (index) {
            case 0:
              return 'ROAD_BT < 3';
            case 1:
              return 'ROAD_BT >= 3 and ROAD_BT < 8';
            case 2:
              return 'ROAD_BT >= 8 and ROAD_BT < 9';
            case 3:
              return 'ROAD_BT >= 9 and ROAD_BT < 10';
            case 4:
              return 'ROAD_BT >= 10 and ROAD_BT < 12';
            default:
              return null;
          }
        } else {
          return null;
        }
      })
      .filter((item) => item !== null)
      .join(' or ');

  const slopeQry =
    slopeOps.checkboxes &&
    slopeOps.checkboxes
      .map((slopeOp, index) => {
        if (slopeOp) {
          switch (index) {
            case 0:
              return 'SLOPE_LG >= 10 ';
            case 1:
              return 'SLOPE_LG >= 6 and SLOPE_LG < 10';
            case 2:
              return 'SLOPE_LG >= 3 and SLOPE_LG < 6';
            case 3:
              return 'SLOPE_LG >= 1 and SLOPE_LG < 3';
            case 4:
              return 'SLOPE_LG >= 0 and SLOPE_LG < 1';
            default:
              return null;
          }
        } else {
          return null;
        }
      })
      .filter((item) => item !== null)
      .join(' or ');

  const pmtrQry =
    pmtrOps.checkboxes &&
    pmtrOps.checkboxes
      .map((pmtrOp, index) => {
        if (pmtrOp) {
          switch (index) {
            case 0:
              return 1;
            case 1:
              return 3;
            case 2:
              return 4;
            case 3:
              return 5;
            case 4:
              return 2, 6, 7, 99;
            default:
              return null;
          }
        } else {
          return null;
        }
      })
      .filter((item) => item !== null)
      .join("','");

  const rdnetQry =
    rdnetOps.checkboxes &&
    rdnetOps.checkboxes
      .map((rdnetOp, index) => {
        if (rdnetOp) {
          switch (index) {
            case 0:
              return 'RDNET_AC >= 1.35';
            case 1:
              return 'RDNET_AC >= 1.14 and RDNET_AC < 1.35';
            case 2:
              return 'RDNET_AC >= 0.98 and RDNET_AC < 1.14';
            case 3:
              return 'RDNET_AC >= 0.82 and RDNET_AC < 0.98';
            case 4:
              return 'RDNET_AC >= 0.0 and RDNET_AC < 0.82';
            default:
              return null;
          }
        } else {
          return null;
        }
      })
      .filter((item) => item !== null)
      .join(' or ');

  const pubtrQry =
    pubtrOps.checkboxes &&
    pubtrOps.checkboxes
      .map((pubtrOp, index) => {
        if (pubtrOp) {
          switch (index) {
            case 0:
              return 'PUBTR_AC >= 500';
            case 1:
              return 'PUBTR_AC >= 350 and PUBTR_AC < 500';
            case 2:
              return 'PUBTR_AC >= 200 and PUBTR_AC < 350';
            case 3:
              return 'PUBTR_AC >= 100 and PUBTR_AC < 200';
            case 4:
              return 'PUBTR_AC >= 0 and PUBTR_AC < 100';
            default:
              return null;
          }
        } else {
          return null;
        }
      })
      .filter((item) => item !== null)
      .join(' or ');

  const pbuldQry =
    pbuldOps.checkboxes &&
    pbuldOps.checkboxes
      .map((pbuldOp, index) => {
        if (pbuldOp) {
          switch (index) {
            case 0:
              return 'PBULD_FA >= 2000';
            case 1:
              return 'PBULD_FA >= 1000 and PBULD_FA < 2000';
            case 2:
              return 'PBULD_FA >= 500 and PBULD_FA < 1000';
            case 3:
              return 'PBULD_FA >= 100 and PBULD_FA < 500';
            case 4:
              return 'PBULD_FA >= 0 and PBULD_FA < 100';
            default:
              return null;
          }
        } else {
          return null;
        }
      })
      .filter((item) => item !== null)
      .join(' or ');

  const buldeQry =
    buldeOps.checkboxes &&
    buldeOps.checkboxes
      .map((buldeOp, index) => {
        if (buldeOp) {
          switch (index) {
            case 0:
              return 'BULDE_DE >= 20';
            case 1:
              return 'BULDE_DE >= 11 and BULDE_DE < 20';
            case 2:
              return 'BULDE_DE >= 6 and BULDE_DE < 11';
            case 3:
              return 'BULDE_DE >= 1 and BULDE_DE < 6';
            case 4:
              return 'BULDE_DE < 1';
            default:
              return null;
          }
        } else {
          return null;
        }
      })
      .filter((item) => item !== null)
      .join(' or ');

  const stairQry =
    stairOps.checkboxes &&
    stairOps.checkboxes
      .map((stairOp, index) => {
        if (stairOp) {
          switch (index) {
            case 0:
              return 1;
            case 1:
              return 0;
            default:
              return null;
          }
        } else {
          return null;
        }
      })
      .filter((item) => item !== null)
      .join("','");

  const sdwkQry =
    sdwkOps.checkboxes &&
    sdwkOps.checkboxes
      .map((sdwkOp, index) => {
        if (sdwkOp) {
          switch (index) {
            case 0:
              return 2;
            case 1:
              return 3;
            case 2:
              return 1;
            default:
              return null;
          }
        } else {
          return null;
        }
      })
      .filter((item) => item !== null)
      .join("','");

  ldc
    ? ldc.slice(2) === '000'
      ? (qry += `(sido = ${Number(ldc.slice(0, 2))}) and `)
      : (qry += `(LEGLCD_SE = '${ldc}') and `)
    : (qry += '');

  rdbtQry && (qry += `(${rdbtQry}) and `);
  slopeQry && (qry += `(${slopeQry}) and `);
  pmtrQry && (qry += `(PMTR_SE in ('${pmtrQry}')) and `);
  rdnetQry && (qry += `(${rdnetQry}) and `);
  pubtrQry && (qry += `(${pubtrQry}) and `);
  pbuldQry && (qry += `(${pbuldQry}) and `);
  buldeQry && (qry += `(${buldeQry}) and `);
  stairQry && (qry += `(STAIR_AT in ('${stairQry}')) and `);
  sdwkQry && (qry += `(SDWK_SE in ('${sdwkQry}')) and `);

  if (
    rdbtQry &&
    slopeQry &&
    pmtrQry &&
    rdnetQry &&
    pubtrQry &&
    pbuldQry &&
    buldeQry &&
    stairQry &&
    sdwkQry
  ) {
    qry = qry.slice(-6) === 'where ' ? qry.slice(0, -7) : qry.slice(0, -5);
    // console.log('dbreq getL4 qry\n', qry);
  } else {
    qry = null;
    // console.log('dbreq getL4 qry\n', qry);
  }

  try {
    console.log('dbreq getL4 qry\n', qry);
    const result = await client.query(qry);
    const total_length = result.rows[0].total_length;
    // console.log('dbrequest getlength4 result\n', total_length);

    // const length = result.rows[0].total_length;
    return total_length;
  } catch (err) {
    console.log(err);
  }
};

const getLength = async (qry) => {
  // console.log('getLength qry from dbrequest:', qry);
  try {
    const result = await client.query(qry);
    const length = result.rows[0].total_length;
    return length;
  } catch (err) {
    console.log(err);
  }
};

const getCsv = async (qry) => {
  // console.log('getCsv qry at dbrequest: ', qry);
  try {
    const result = await client.query(qry);
    // console.log("result.rows of getCsv: ", result.rows);
    // console.log("result at dbrequest: ", result);
    const columns = Object.keys(result.rows[0]);
    const data = [columns, ...result.rows.map((row) => Object.values(row))];
    // console.log("data: ", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

//ST_X(ST_Centroid(wkb_geometry)) as long,
// ST_Y(ST_Centroid(wkb_geometry)) as lat,
const getCord = async (params) => {
  // console.log('getCord params at dbrequest: ', params);
  const qry = `SELECT 
    long, 
    lat
FROM 
   side10 where NF_ID in ('${params}');`;
  // console.log('getCord qry at dbreques: ', qry);
  const { rows } = await client.query(qry);
  // console.log("rows[0]: ", rows[0]);
  return rows[0];
  // try {
  //   const query = `SELECT json_build_object(
  //     'type', 'FeatureCollection',
  //     'features', json_agg(ST_AsGeoJSON(t.*)::json)
  //   ) as geojson
  //   FROM (SELECT * FROM side9 where NF_ID in ('${qry}')) as t;`;
  //   const { rows } = await client.query(query);
  //   // console.log("result.rows of getCsv: ", result.rows);
  //   // console.log("result at dbrequest: ", result);
  //   console.log("rows[0].geojson: ", rows[0].geojson);
  //   return rows[0].geojson;
  // } catch (err) {
  //   console.log(err);
  // }
};

const getProp = async (params) => {
  // console.log('getProp params at dbrequest: ', params);
  const qry = `SELECT 
    nf_id,
    road_nm,
    road_se,
    cartrk_co,
    road_bt,
    pmtr_se,
    osps_se,
    road_lt,
    slope_lg,
    sdwk_se,
    rdnet_ac,
    pbuld_fa,
    bulde_de,
    pubtr_ac,
    stair_at,
    edennc_at,
    pedac_rk,
    pred
FROM 
   side1r where NF_ID in ('${params}');`;
  // console.log('getProp qry at dbreques: ', qry);
  const { rows } = await client.query(qry);
  // console.log("rows[0]: ", rows[0]);
  return rows[0];
};

const getShap = async (params) => {
  // console.log('getShap params at dbrequest: ', params);
  const qry = `SELECT 
    aiw10kas,
    bus400s,
    mkden300s,
    pbulddens,
    rbulddens,
    roadbts,
    roadlts,
    school300s,
    slopelgs,
    subway400s
  FROM 
    risk.side1r_shap where nf_id = '${params}';`;
  // console.log('getShap qry at dbreques: ', qry);
  const { rows } = await client.query(qry);
  // console.log("rows[0]: ", rows[0]);
  return rows[0];
};

const getSrchId = async (qry) => {
  // console.log('getSrchId qry at dbrequest: ', qry);
  const { rows } = await client.query(qry);
  // console.log("getSrchId rows at dbrequest: ", rows);
  return rows;
};

const getTop5 = async (params) => {
  const { ldc, rsktype } = params;

  // console.log('getTop5 ldc, rsktype at dbrequest:\n', ldc, '\n', rsktype);

  var qry;
  if (ldc !== null) {
    if (ldc.slice(2) !== '000') {
      qry = `SELECT ROAD_NM, NF_ID FROM aclogdbf3 WHERE ${rsktype} IS NOT NULL AND LEGLCD_SE = '${ldc}00000' ORDER BY ${rsktype} DESC LIMIT 5`;
    } else if (ldc.slice(2) === '000') {
      qry = `SELECT ROAD_NM, NF_ID FROM aclogdbf3 WHERE ${rsktype} IS NOT NULL AND sido = ${Number(
        ldc.slice(0, 2)
      )} order by ${rsktype} desc limit 5`;
    } else {
      qry = `select count(*) from ${rsktype}`;
    }
  } else {
    qry = `SELECT ROAD_NM, NF_ID FROM aclogdbf3 WHERE ${rsktype} IS NOT NULL ORDER BY ${rsktype} DESC LIMIT 5`;
  }
  // console.log('gettop5 qry dbrequest\n', qry);

  const { rows } = await client.query(qry);
  // console.log("getTop5 rows at dbrequest: ", rows);
  return rows;
};

const getEcon = async (params) => {
  const { citem, ldc, yr } = params;
  // const yrint = parseInt(yr, 10);
  // const endyr = parseInt(yr, 10);
  // const startyr = yr - 6;
  const ldcval = parseInt(ldc, 10);

  try {
    const qry = `SELECT * FROM ${citem} WHERE ldc = $1 ORDER BY yr DESC`;
    // const qry = `SELECT * FROM ${citem} WHERE ldc = $1 AND yr BETWEEN $2 AND $3 ORDER BY yr DESC`;
    // console.log('getEcon qry at dbrequest: ', qry);
    const { rows } = await client.query(qry, [ldcval]);
    // const { rows } = await client.query(qry, [ldcval, startyr, endyr]);
    // console.log('getEcon rows at dbrequest: ', rows.slice(0, 3));
    return rows;
  } catch (e) {
    console.error('getEcon error at dbrequest: ', e);
  }
};

const getReg = async () => {
  try {
    const qry = `SELECT * FROM ldctable WHERE inuse = true`;
    const { rows } = await client.query(qry);
    // console.log('getReg rows at dbrequest: ', rows.slice(0, 3));
    return rows;
  } catch (e) {
    console.error('getReg error at dbrequest: ', e);
  }
};

const getBar2sido = async (params) => {
  const { tablenm, yr } = params;
  try {
    const qry = `SELECT tb1.*, ldctable.sigungu FROM ${tablenm} AS tb1 JOIN ldctable ON tb1.ldc = ldctable.ldc WHERE tb1.yr = $1 AND tb1.ldc % 1000 = 0;`;
    // const qry = `SELECT * FROM ${tablenm} WHERE MOD(ldc, 1000) = 0 AND yr = $1;`; //ldc ? ldcuid?
    const params = [Number(yr)];
    // console.log('getbar2sido params at dbrequest:', params);
    // console.log('getbar2sido qry at dbrequest:', qry);
    const { rows } = await client.query(qry, params);
    // console.log('getBar2sido rows at dbrequest: ', rows.slice(0, 3));
    return rows;
  } catch (e) {
    console.error('getBar2sido error at dbrequest: ', e);
  }
};

const getBar2sgg = async (params) => {
  const { tablenm, sidotmp, yr } = params;
  try {
    const qry = `SELECT tb1.*, ldctable.sigungu FROM ${tablenm} AS tb1 JOIN ldctable ON tb1.ldc = ldctable.ldc WHERE tb1.ldc::text LIKE $1 AND tb1.yr = $2 AND tb1.ldc % 1000 != 0;`;
    const params = [`${sidotmp}%`, Number(yr)];
    // console.log('getbar2sgg tablenm and qry at dbrequest', tablenm, qry);
    const { rows } = await client.query(qry, params);
    // console.log('getBar2sgg rows at dbrequest: ', rows.slice(0, 3));
    return rows;
  } catch (e) {
    console.error('getBar2sgg error at dbrequest: ', e);
  }
};

const getSidogjs = async () => {
  try {
    // const qry = `SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(ST_AsGeoJSON(t.*)::jsonb)) AS geojson FROM sidogj2 AS t`;
    // const qry = `SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(ST_AsGeoJSON(ST_Simplify(t.geom, 0.1))::jsonb)) AS geojson FROM sidogj2 AS t`;
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(ST_Simplify(geom, 0.005))::jsonb,
            'properties', jsonb_build_object(
              'ctprvn_cd', ctprvn_cd,
              'ctp_eng_nm', ctp_eng_nm
            )
          )
        )
      ) AS geojson
    FROM sidogj2;`;
    const result = await client.query(qry);
    const gjsdata = result.rows[0].geojson;
    // console.log('getSidogjs result at dbrequest:\n', gjsdata);
    return gjsdata;
  } catch (e) {
    console.error('getSidogjs error at dbrequest: ', e);
  }
};

const getSgggjs = async () => {
  try {
    console.log('sgggjs triggered');
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(ST_Simplify(geom, 0.001))::jsonb,
            'properties', jsonb_build_object(
              'sig_cd', sig_cd,
              'sig_eng_nm', sig_eng_nm
            )
          )
        )
      ) AS geojson
    FROM sgggj;`;
    const result = await client.query(qry);
    const gjsdata = result.rows[0].geojson;
    // console.log('sgggjsgjs done');
    // console.log('getSgggjs result at dbrequest:\n', gjsdata);
    return gjsdata;
  } catch (e) {
    console.error('getSgggjs error at dbrequest: ', e);
  }
};

const getLdc = async (ldc) => {
  // console.log('getLdc ldc at dbrequest:\n', ldc);
  const ldcint = parseInt(ldc);
  const qry = `SELECT * FROM ldctable WHERE ldc = ${ldcint}`;
  const { rows } = await client.query(qry);
  // console.log('getLdc rows:\n', rows);
  return rows;
};

const getSide1r = async (params) => {
  const { minx, miny, maxx, maxy } = params;
  // const step_x = (maxx - minx) / 20;
  // const step_y = (maxy - miny) / 20;
  try {
    console.log('getSide1r triggered dbrequest');
    // gjslayer with grid ----------------------------------------------------------------------
    //     const qry = `
    //   WITH grid AS (
    //     SELECT
    //       ST_MakeEnvelope(xmin, ymin, xmin + ${step_x}, ymin + ${step_y}, 4326) AS cell,
    //       xmin, ymin
    //     FROM generate_series(${minx}, ${maxx}, ${step_x}) AS xmin,
    //          generate_series(${miny}, ${maxy}, ${step_y}) AS ymin
    //   ),
    //   sampled AS (
    //     SELECT DISTINCT ON (grid.cell)
    //       s.gid, s.geom
    //     FROM side1r s
    //     JOIN grid ON s.geom && grid.cell
    //     ORDER BY grid.cell, random() -- Randomly pick from each grid cell
    //   )
    //   SELECT
    //     jsonb_build_object(
    //       'type', 'FeatureCollection',
    //       'features', jsonb_agg(
    //         jsonb_build_object(
    //           'type', 'Feature',
    //           'geometry', ST_AsGeoJSON(geom)::jsonb,
    //           'properties', jsonb_build_object(
    //             'gid', gid
    //           )
    //         )
    //       )
    //     ) AS geojson
    //   FROM sampled;
    // `;

    // gjslayer as a whole ----------------------------------------------------------------------
    const qry = `
      SELECT
        jsonb_build_object(
          'type', 'FeatureCollection',
          'features', jsonb_agg(
            jsonb_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::jsonb,
              'properties', jsonb_build_object(
                'gid', gid
              )
            )
          )
        ) AS geojson
      FROM (
        SELECT gid, geom FROM side1r WHERE geom && ST_MakeEnvelope(${minx}, ${miny}, ${maxx}, ${maxy}, 4326) LIMIT 20000
      ) subquery;`;

    const result = await client.query(qry);
    // console.log('side1rgjs result at dbrequest:\n', result);
    const gjsdata = result.rows[0].geojson;
    // console.log('side1rgjs done');
    // console.log('side1rgjs result at dbrequest:\n', gjsdata);
    return gjsdata;

    // return 'dbrequest called';
  } catch (e) {
    console.error('error getside1r dbrequest', e);
  }
};

const getSidesmp = async () => {
  try {
    console.log('Sidesmp triggered');
    const qry = `SELECT geomgjs FROM side1r_agg;`;
    // const qry = `
    // SELECT
    //   jsonb_build_object(
    //     'type', 'FeatureCollection',
    //     'features', jsonb_agg(
    //       jsonb_build_object(
    //         'type', 'Feature',
    //         'geometry', ST_AsGeoJSON(ST_Simplify(geom, 0.01),6)::jsonb,
    //         'properties', jsonb_build_object(
    //           'gid', gid
    //         )
    //       )
    //     )
    //   ) AS geojson
    // FROM (
    //     SELECT *
    //     FROM side1r
    //     LIMIT 10000
    // ) subquery;;`;
    const result = await client.query(qry);
    const gjsdata = result.rows[0].geomgjs;
    // console.log('Sidesmpgjs done');
    // console.log('getSidesmp gjsdata at dbrequest:\n', gjsdata);
    return gjsdata;
  } catch (e) {
    console.error('getSidesmp error at dbrequest: ', e);
  }
};

const getPie1 = async (params) => {
  const { col, ldc } = params;
  var qry;
  // qry = col;
  // console.log('ldc, qry\n', ldc, qry);

  if (ldc === null) {
    qry = `SELECT * FROM ${col}_prcnt`;
    // console.log('getpie1 case1\n', ldc, qry);
  } else if (ldc.slice(2) === '000') {
    switch (col) {
      case 'road_bt':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE road_bt < 3) AS x1,
                      COUNT(*) FILTER (WHERE road_bt >= 3 AND road_bt < 8) AS x2,
                      COUNT(*) FILTER (WHERE road_bt >= 8 AND road_bt < 9) AS x3,
                      COUNT(*) FILTER (WHERE road_bt >= 9 AND road_bt < 10) AS x4,
                      COUNT(*) FILTER (WHERE road_bt >= 10 AND road_bt < 12) AS x5
                  FROM srvy.side1r
                  WHERE sido = ${ldc.slice(0, 2)}
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['0_3','3_8','8_9','9_10','10_12'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'slope_lg':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE slope_lg >= 10) AS x1,
                      COUNT(*) FILTER (WHERE slope_lg >= 6 and slope_lg < 10) AS x2,
                      COUNT(*) FILTER (WHERE slope_lg >= 3 and slope_lg < 6) AS x3,
                      COUNT(*) FILTER (WHERE slope_lg >= 1 and slope_lg < 3) AS x4,
                      COUNT(*) FILTER (WHERE slope_lg >= 0 and slope_lg < 1) AS x5
                  FROM srvy.side1r
                  WHERE sido = ${ldc.slice(0, 2)}
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['10_','6_10','3_6','1_3','0_1'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'rdnet_ac':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 1.35) AS x1,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 1.14 and rdnet_ac < 1.35) AS x2,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 0.98 and rdnet_ac < 1.14) AS x3,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 0.82 and rdnet_ac < 0.98) AS x4,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 0.0 and rdnet_ac < 0.82) AS x5
                  FROM srvy.side1r
                  WHERE sido = ${ldc.slice(0, 2)}
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['1.35_','1.14_1.35','0.98_1.14','0.82_0.98','0_0.82'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'pubtr_ac':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 500) AS x1,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 350 and pubtr_ac < 500) AS x2,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 200 and pubtr_ac < 350) AS x3,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 100 and pubtr_ac < 200) AS x4,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 0 and pubtr_ac < 100) AS x5
                  FROM srvy.side1r
                  WHERE sido = ${ldc.slice(0, 2)}
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['500_','350_500','200_350','100_200','0_100'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'pbuld_fa':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 2000) AS x1,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 1000 and pbuld_fa < 2000) AS x2,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 500 and pbuld_fa < 1000) AS x3,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 100 and pbuld_fa < 500) AS x4,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 0 and pbuld_fa < 100) AS x5
                  FROM srvy.side1r
                  WHERE sido = ${ldc.slice(0, 2)}
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['2000_','1000_2000','500_1000','100_500','0_100'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'bulde_de':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE bulde_de >= 20) AS x1,
                      COUNT(*) FILTER (WHERE bulde_de >= 11 and bulde_de < 20) AS x2,
                      COUNT(*) FILTER (WHERE bulde_de >= 6 and bulde_de < 11) AS x3,
                      COUNT(*) FILTER (WHERE bulde_de >= 1 and bulde_de < 6) AS x4,
                      COUNT(*) FILTER (WHERE bulde_de < 1) AS x5
                  FROM srvy.side1r
                  WHERE sido = ${ldc.slice(0, 2)}
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['20_','11_20','6_11','1_6','_1'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'pmtr_se':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE pmtr_se = 1) AS x1,
                      COUNT(*) FILTER (WHERE pmtr_se = 3) AS x2,
                      COUNT(*) FILTER (WHERE pmtr_se = 4) AS x3,
                      COUNT(*) FILTER (WHERE pmtr_se = 5) AS x4,
                      COUNT(*) FILTER (WHERE pmtr_se NOT IN (1, 3, 4, 5)) AS x5
                  FROM srvy.side1r
                  WHERE sido = ${ldc.slice(0, 2)}
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['1','3','4','5','rest'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'stair_at':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE stair_at = '1') AS x1,
                      COUNT(*) FILTER (WHERE stair_at = '0') AS x2
                  FROM srvy.side1r
                  WHERE sido = ${ldc.slice(0, 2)}
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['1','0'], 
                  ARRAY[ag.x1, ag.x2]
              ) AS t(val, cnt);`;
        break;
      case 'sdwk_se':
        qry = `SELECT 
          val,
          cnt
      FROM (
          SELECT 
              COUNT(*)::INT AS total_count,
              COUNT(*) FILTER (WHERE sdwk_se = 2) AS x1,
              COUNT(*) FILTER (WHERE sdwk_se = 3) AS x2,
              COUNT(*) FILTER (WHERE sdwk_se = 1) AS x3
          FROM srvy.side1r
          WHERE sido = ${ldc.slice(0, 2)}
      ) ag
      CROSS JOIN LATERAL UNNEST(
          ARRAY['2','3','1'], 
          ARRAY[ag.x1, ag.x2, ag.x3]
      ) AS t(val, cnt);`;
        break;
      // case 'sdwk_se':
      //   qry = `select ${col} as val, count(*) as cnt from srvy.side1r where sido = ${ldc.slice(
      //     0,
      //     2
      //   )} group by ${col};`;
      //   break;
      default:
        break;
    }
    // console.log('getpie1 case2\n', ldc, qry);
  } else {
    switch (col) {
      case 'road_bt':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE road_bt < 3) AS x1,
                      COUNT(*) FILTER (WHERE road_bt >= 3 AND road_bt < 8) AS x2,
                      COUNT(*) FILTER (WHERE road_bt >= 8 AND road_bt < 9) AS x3,
                      COUNT(*) FILTER (WHERE road_bt >= 9 AND road_bt < 10) AS x4,
                      COUNT(*) FILTER (WHERE road_bt >= 10 AND road_bt < 12) AS x5
                  FROM srvy.side1r
                  WHERE leglcd_se = '${ldc}'
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['0_3','3_8','8_9','9_10','10_12'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'slope_lg':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE slope_lg >= 10) AS x1,
                      COUNT(*) FILTER (WHERE slope_lg >= 6 and slope_lg < 10) AS x2,
                      COUNT(*) FILTER (WHERE slope_lg >= 3 and slope_lg < 6) AS x3,
                      COUNT(*) FILTER (WHERE slope_lg >= 1 and slope_lg < 3) AS x4,
                      COUNT(*) FILTER (WHERE slope_lg >= 0 and slope_lg < 1) AS x5
                  FROM srvy.side1r
                  WHERE leglcd_se = '${ldc}'
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['10_','6_10','3_6','1_3','0_1'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'rdnet_ac':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 1.35) AS x1,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 1.14 and rdnet_ac < 1.35) AS x2,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 0.98 and rdnet_ac < 1.14) AS x3,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 0.82 and rdnet_ac < 0.98) AS x4,
                      COUNT(*) FILTER (WHERE rdnet_ac >= 0.0 and rdnet_ac < 0.82) AS x5
                  FROM srvy.side1r
                  WHERE leglcd_se = '${ldc}'
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['1.35_','1.14_1.35','0.98_1.14','0.82_0.98','0_0.82'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'pubtr_ac':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 500) AS x1,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 350 and pubtr_ac < 500) AS x2,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 200 and pubtr_ac < 350) AS x3,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 100 and pubtr_ac < 200) AS x4,
                      COUNT(*) FILTER (WHERE pubtr_ac >= 0 and pubtr_ac < 100) AS x5
                  FROM srvy.side1r
                  WHERE leglcd_se = '${ldc}'
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['500_','350_500','200_350','100_200','0_100'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'pbuld_fa':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 2000) AS x1,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 1000 and pbuld_fa < 2000) AS x2,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 500 and pbuld_fa < 1000) AS x3,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 100 and pbuld_fa < 500) AS x4,
                      COUNT(*) FILTER (WHERE pbuld_fa >= 0 and pbuld_fa < 100) AS x5
                  FROM srvy.side1r
                  WHERE leglcd_se = '${ldc}'
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['2000_','1000_2000','500_1000','100_500','0_100'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'bulde_de':
        qry = `SELECT 
                  val,
                  cnt
              FROM (
                  SELECT 
                      COUNT(*)::INT AS total_count,
                      COUNT(*) FILTER (WHERE bulde_de >= 20) AS x1,
                      COUNT(*) FILTER (WHERE bulde_de >= 11 and bulde_de < 20) AS x2,
                      COUNT(*) FILTER (WHERE bulde_de >= 6 and bulde_de < 11) AS x3,
                      COUNT(*) FILTER (WHERE bulde_de >= 1 and bulde_de < 6) AS x4,
                      COUNT(*) FILTER (WHERE bulde_de < 1) AS x5
                  FROM srvy.side1r
                  WHERE leglcd_se = '${ldc}'
              ) ag
              CROSS JOIN LATERAL UNNEST(
                  ARRAY['20_','11_20','6_11','1_6','_1'], 
                  ARRAY[ag.x1, ag.x2, ag.x3, ag.x4, ag.x5]
              ) AS t(val, cnt);`;
        break;
      case 'pmtr_se':
      case 'stair_at':
      case 'sdwk_se':
        qry = `select ${col} as val, count(*) as cnt from srvy.side1r where leglcd_se = '${ldc}' group by ${col};`;
        break;
      default:
        break;
    }
    // console.log('getpie1 case3\n', typeof ldc, ldc, qry);
  }
  try {
    // console.log('getPie1 triggered');
    // const qry2 = `SELECT * FROM road_bt_prcnt`;
    const { rows } = await client.query(qry);
    // console.log('getPie1 rows:\n', rows);
    return rows;
  } catch (e) {
    console.error('getpie1 error at dbrequest: ', e);
  }
};

/////////////////////////////////////////////////////////////////////
const getPfrjs = async () => {
  try {
    console.log('pfr triggered');
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object(
              'id', id,
              'sig_cd', sig_cd,
              'h_road_bt', h_road_bt,
              'h_len', h_len,
              'purpose', purpose,
              'safe_zone', safe_zone,
              'spd_lmt', spd_lmt,
              'one_way', one_way,
              'h_ped_nm', h_ped_nm,
              'reg_dt', reg_dt
            )
          )
        )
      ) AS geojson
    FROM pfr;`;
    const result = await client.query(qry);
    const gjsdata = result.rows[0].geojson;
    console.log('pfrjs done');
    console.log('getPfrjs result at dbrequest:\n', gjsdata);
    return gjsdata;
  } catch (e) {
    console.error('getPfrjs error at dbrequest: ', e);
  }
};

const getPfrParks = async (sggid) => {
  try {
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
              'id', p.uid,
              'park_se', p.park_se
            )
          )
        )
      ) AS geojson
    FROM parks_pfr p
    JOIN sgggj s ON ST_Intersects(p.geom, s.geom)
    WHERE s.sig_cd = $1;`;

    const result = await client.query(qry, [sggid]);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('getPfrParks error at dbrequest: ', e);
  }
};

const getPfrParksBuffer = async (sggid) => {
  try {
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
              'id', p.uid
            )
          )
        )
      ) AS geojson
    FROM parks_buffer_pfr p
    JOIN sgggj s ON ST_Intersects(p.geom, s.geom)
    WHERE s.sig_cd = $1;`;

    const result = await client.query(qry, [sggid]);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('getPfrParksBuffer error at dbrequest: ', e);
  }
};

const getPfrSafezoneC = async (sggid) => {
  try {
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
              'id', p.uid,
              'arrfc_nm', p.arrfc_nm
            )
          )
        )
      ) AS geojson
    FROM child_safezone_pfr p
    JOIN sgggj s ON ST_Intersects(p.geom, s.geom)
    WHERE s.sig_cd = $1;`;

    const result = await client.query(qry, [sggid]);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('getPfrSafezoneC error at dbrequest: ', e);
  }
};

const getPfrSafezoneS = async (sggid) => {
  try {
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
              'id', p.uid,
              'arrfc_nm', p.arrfc_nm
            )
          )
        )
      ) AS geojson
    FROM senior_safezone_pfr p
    JOIN sgggj s ON ST_Intersects(p.geom, s.geom)
    WHERE s.sig_cd = $1;`;

    const result = await client.query(qry, [sggid]);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('getPfrSafezoneS error at dbrequest: ', e);
  }
};

const getPfrMultfac = async (sggid) => {
  try {
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
              'id', p.uid,
              'bdtyp_cd', p.bdtyp_cd
            )
          )
        )
      ) AS geojson
    FROM multi_building_pfr p
    JOIN sgggj s ON ST_Intersects(p.geom, s.geom)
    WHERE s.sig_cd = $1;`;

    const result = await client.query(qry, [sggid]);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('getPfrMultfac error at dbrequest: ', e);
  }
};

const getPfrMultfacEntr = async (sggid) => {
  try {
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
              'id', p.uid
            )
          )
        )
      ) AS geojson
    FROM multi_building_entrances_pfr p
    JOIN sgggj s ON ST_Intersects(p.geom, s.geom)
    WHERE s.sig_cd = $1;`;

    const result = await client.query(qry, [sggid]);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('getPfrMultfacEntr error at dbrequest: ', e);
  }
};

const getPfrSchoolBld = async (sggid) => {
  try {
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
              'id', p.uid,
              'bdtyp_cd', p.bdtyp_cd,
              'bul_nm', p.bul_nm
            )
          )
        )
      ) AS geojson
    FROM school_bld_pfr p
    JOIN sgggj s ON ST_Intersects(p.geom, s.geom)
    WHERE s.sig_cd = $1;`;

    const result = await client.query(qry, [sggid]);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('getPfrSchoolBld error at dbrequest: ', e);
  }
};

const getPfrSchlBuffer = async (sggid) => {
  try {
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
              'id', p.uid
            )
          )
        )
      ) AS geojson
    FROM school_buffer_pfr p
    JOIN sgggj s ON ST_Intersects(p.geom, s.geom)
    WHERE s.sig_cd = $1;`;

    const result = await client.query(qry, [sggid]);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('getPfrSchlBuffer error at dbrequest: ', e);
  }
};

const getPfrSchlEntr = async (sggid) => {
  try {
    const qry = `
    SELECT 
      jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
              'id', p.uid,
              'entrc_se', p.entrc_se
            )
          )
        )
      ) AS geojson
    FROM school_entrances_pfr p
    JOIN sgggj s ON ST_Intersects(p.geom, s.geom)
    WHERE s.sig_cd = $1;`;

    const result = await client.query(qry, [sggid]);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('getPfrSchlEntr error at dbrequest: ', e);
  }
};

const getTopPfr = async (sggid) => {
  try {
    const qry = `
    WITH ranked_results AS (
      SELECT
      nf_id,
      road_bt,
      road_lt,
      leglcd_se,
      road_nm,
      ped_fit,
      ped_fitr,
      ped_fitr_rank,
      ROW_NUMBER() OVER (PARTITION BY ped_fitr_rank ORDER BY ped_fitr DESC) AS row_num
      FROM side1r
      WHERE leglcd_se = $1
      AND road_bt >= 5
      AND ped_fit >= 0.5
    ),
    unique_ranks AS (
      SELECT DISTINCT ped_fitr_rank, MAX(ped_fitr) AS max_ped_fitr
      FROM ranked_results
      WHERE row_num = 1
      GROUP BY ped_fitr_rank
      ORDER BY max_ped_fitr DESC
      LIMIT 10
    ),
    filtered_rows AS (
      SELECT rr.*
      FROM ranked_results rr
      JOIN unique_ranks ur ON rr.ped_fitr_rank = ur.ped_fitr_rank
    )
    SELECT *
    FROM filtered_rows
    ORDER BY ped_fitr DESC;`;

    const { rows } = await client.query(qry, [sggid]);
    console.log('getTopPfr rows at dbrequest: ', sggid, rows);
    return rows;
  } catch (e) {
    console.error('getTopPfr error at dbrequest: ', e);
  }
};

module.exports = {
  getLength2: getLength2,
  getLength4: getLength4,
  getLength: getLength,
  getCsv: getCsv,
  getCord: getCord,
  getProp: getProp,
  getShap: getShap,
  getSrchId: getSrchId,
  getTop5: getTop5,
  getEcon: getEcon,
  getReg: getReg,
  getBar2sido: getBar2sido,
  getBar2sgg: getBar2sgg,
  getSidogjs: getSidogjs,
  getSgggjs: getSgggjs,
  getLdc: getLdc,
  getSide1r: getSide1r,
  getSidesmp: getSidesmp,
  getPie1: getPie1,
  ///////////////////////
  getPfrjs: getPfrjs,
  getPfrParks: getPfrParks,
  getPfrParksBuffer: getPfrParksBuffer,
  getPfrSafezoneC: getPfrSafezoneC,
  getPfrSafezoneS: getPfrSafezoneS,
  getPfrMultfac: getPfrMultfac,
  getPfrMultfacEntr: getPfrMultfacEntr,
  getTopPfr: getTopPfr,
  getPfrSchoolBld: getPfrSchoolBld,
  getPfrSchlBuffer: getPfrSchlBuffer,
  getPfrSchlEntr: getPfrSchlEntr,
};
