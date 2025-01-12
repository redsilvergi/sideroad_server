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
  // console.log('dbreq getL2 rnfo0\n', rnfo0);
  // console.log('dbreq getL2 rnfo1\n', rnfo1);
  // console.log('dbreq getL2 ldc\n', ldc);

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
    // console.log('dbreq getL2 qry\n', qry);
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
    // console.log('dbreq getL4 qry\n', qry);
    const result = await client.query(qry);
    const total_length = result.rows[0].total_length;
    // console.log('dbrequest getlength4 result\n', total_length);

    // const length = result.rows[0].total_length;
    return total_length;
  } catch (err) {
    console.log(err);
  }
};

// const getLength = async (qry) => {
//   // console.log('getLength qry from dbrequest:', qry);
//   try {
//     const result = await client.query(qry);
//     const length = result.rows[0].total_length;
//     return length;
//   } catch (err) {
//     console.log(err);
//   }
// };

const getCsv = async (qry) => {
  // console.log('getCsv qry at dbrequest: ', qry);
  try {
    const result = await client.query(qry);
    // console.log("result.rows of getCsv: ", result.rows);
    // console.log("result at dbrequest: ", result);
    const columns = Object.keys(result.rows[0]);
    const data = [columns, ...result.rows.map((row) => Object.values(row))];
    // console.log('getCSv dbreq csvdata\n', data);
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
   public.side10 where NF_ID in ('${params}');`;
  // console.log('getCord qry at dbreques: ', qry);
  const { rows } = await client.query(qry);
  // console.log('getCord dbreq \n', rows[0]);
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
   srvy.side1r where NF_ID in ('${params}');`;
  // console.log('getProp qry at dbreques: ', qry);
  const { rows } = await client.query(qry);
  // console.log('getProp dbreq rows[0]: ', rows[0]);
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
  // console.log('getShap dbreq rows\n', rows[0]);
  return rows[0];
};

const getSrchId = async (qry) => {
  // console.log('getSrchId qry at dbrequest: ', qry);
  const { rows } = await client.query(qry);
  // console.log("getSrchId rows at dbrequest: ", rows);
  return rows;
};

// const getTop5 = async (params) => {
//   const { ldc, rsktype } = params;

//   // console.log('getTop5 ldc, rsktype at dbrequest:\n', ldc, '\n', rsktype);

//   var qry;
//   if (ldc !== null) {
//     if (ldc.slice(2) !== '000') {
//       qry = `SELECT ROAD_NM, NF_ID FROM aclogdbf3 WHERE ${rsktype} IS NOT NULL AND LEGLCD_SE = '${ldc}00000' ORDER BY ${rsktype} DESC LIMIT 5`;
//     } else if (ldc.slice(2) === '000') {
//       qry = `SELECT ROAD_NM, NF_ID FROM aclogdbf3 WHERE ${rsktype} IS NOT NULL AND sido = ${Number(
//         ldc.slice(0, 2)
//       )} order by ${rsktype} desc limit 5`;
//     } else {
//       qry = `select count(*) from ${rsktype}`;
//     }
//   } else {
//     qry = `SELECT ROAD_NM, NF_ID FROM aclogdbf3 WHERE ${rsktype} IS NOT NULL ORDER BY ${rsktype} DESC LIMIT 5`;
//   }
//   // console.log('gettop5 qry dbrequest\n', qry);

//   const { rows } = await client.query(qry);
//   // console.log("getTop5 rows at dbrequest: ", rows);
//   return rows;
// };

const getEcon = async (params) => {
  const { citem, ldc, yr } = params;
  // const yrint = parseInt(yr, 10);
  // const endyr = parseInt(yr, 10);
  // const startyr = yr - 6;
  const ldcval = parseInt(ldc, 10);

  try {
    const qry = `SELECT * FROM gen.${citem} WHERE ldc = $1 ORDER BY yr DESC`;
    // const qry = `SELECT * FROM ${citem} WHERE ldc = $1 AND yr BETWEEN $2 AND $3 ORDER BY yr DESC`;
    // console.log('getEcon qry at dbrequest: ', qry);
    const { rows } = await client.query(qry, [ldcval]);
    // const { rows } = await client.query(qry, [ldcval, startyr, endyr]);
    // console.log('getEcon rows at dbrequest: ', rows);
    return rows;
  } catch (e) {
    console.error('getEcon error at dbrequest: ', e);
  }
};

const getReg = async () => {
  try {
    const qry = `SELECT * FROM public.ldctable WHERE inuse = true`;
    const { rows } = await client.query(qry);
    // console.log('getReg rows at dbrequest: ', rows);
    return rows;
  } catch (e) {
    console.error('getReg error at dbrequest: ', e);
  }
};

const getBar2sido = async (params) => {
  const { tablenm, yr } = params;
  try {
    const qry = `SELECT tb1.*, ldctable.sigungu FROM gen.${tablenm} AS tb1 JOIN ldctable ON tb1.ldc = ldctable.ldc WHERE tb1.yr = $1 AND tb1.ldc % 1000 = 0;`;
    // const qry = `SELECT * FROM ${tablenm} WHERE MOD(ldc, 1000) = 0 AND yr = $1;`; //ldc ? ldcuid?
    const params = [Number(yr)];
    // console.log('getbar2sido params at dbrequest:', params);
    // console.log('getbar2sido qry at dbrequest:', qry);
    const { rows } = await client.query(qry, params);
    // console.log('getBar2sido rows at dbrequest: ', rows);
    return rows;
  } catch (e) {
    console.error('getBar2sido error at dbrequest: ', e);
  }
};

const getBar2sgg = async (params) => {
  const { tablenm, sidotmp, yr } = params;
  try {
    const qry = `SELECT tb1.*, ldctable.sigungu FROM gen.${tablenm} AS tb1 JOIN ldctable ON tb1.ldc = ldctable.ldc WHERE tb1.ldc::text LIKE $1 AND tb1.yr = $2 AND tb1.ldc % 1000 != 0;`;
    const params = [`${sidotmp}%`, Number(yr)];
    // console.log('getbar2sgg tablenm and qry at dbrequest', tablenm, qry);
    const { rows } = await client.query(qry, params);
    // console.log('getBar2sgg rows at dbrequest: ', rows);
    return rows;
  } catch (e) {
    console.error('getBar2sgg error at dbrequest: ', e);
  }
};

const getSidogjs = async () => {
  try {
    // const qry = `SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(ST_AsGeoJSON(t.*)::jsonb)) AS geojson FROM public.sidogj2 AS t`;
    // const qry = `SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(ST_AsGeoJSON(ST_Simplify(t.geom, 0.1))::jsonb)) AS geojson FROM public.sidogj2 AS t`;
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
    FROM public.sidogj2;`;
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
    // console.log('sgggjs triggered');
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
    FROM public.sgggj;`;
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
  const qry = `SELECT * FROM public.ldctable WHERE ldc = ${ldcint}`;
  const { rows } = await client.query(qry);
  // console.log('getLdc rows:\n', rows);
  return rows;
};

const getSide1r = async (params) => {
  const { minx, miny, maxx, maxy } = params;
  // const step_x = (maxx - minx) / 20;
  // const step_y = (maxy - miny) / 20;
  try {
    // console.log('getSide1r triggered dbrequest');
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
    //     FROM public.side1r s
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
        SELECT gid, geom FROM public.side1r WHERE geom && ST_MakeEnvelope(${minx}, ${miny}, ${maxx}, ${maxy}, 4326) LIMIT 20000
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

// const getSidesmp = async () => {
//   try {
//     console.log('Sidesmp triggered');
//     const qry = `SELECT geomgjs FROM side1r_agg;`;
//     // const qry = `
//     // SELECT
//     //   jsonb_build_object(
//     //     'type', 'FeatureCollection',
//     //     'features', jsonb_agg(
//     //       jsonb_build_object(
//     //         'type', 'Feature',
//     //         'geometry', ST_AsGeoJSON(ST_Simplify(geom, 0.01),6)::jsonb,
//     //         'properties', jsonb_build_object(
//     //           'gid', gid
//     //         )
//     //       )
//     //     )
//     //   ) AS geojson
//     // FROM (
//     //     SELECT *
//     //     FROM side1r
//     //     LIMIT 10000
//     // ) subquery;;`;
//     const result = await client.query(qry);
//     const gjsdata = result.rows[0].geomgjs;
//     // console.log('Sidesmpgjs done');
//     // console.log('getSidesmp gjsdata at dbrequest:\n', gjsdata);
//     return gjsdata;
//   } catch (e) {
//     console.error('getSidesmp error at dbrequest: ', e);
//   }
// };

const getPie1 = async (params) => {
  const { col, ldc } = params;
  var qry;
  // qry = col;
  // console.log('ldc, qry\n', ldc, qry);

  if (ldc === null) {
    qry = `SELECT * FROM srvy.${col}_prcnt`;
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
                    WHERE leglcd_se = '${ldc}'
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
                    WHERE leglcd_se = '${ldc}'
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
            WHERE leglcd_se = '${ldc}'
        ) ag
        CROSS JOIN LATERAL UNNEST(
            ARRAY['2','3','1'], 
            ARRAY[ag.x1, ag.x2, ag.x3]
        ) AS t(val, cnt);`;
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

const postSrvy = async (body) => {
  const {
    userid,
    nfidlst,
    researchDate,
    researcher,
    roadName,
    buildingStartNo,
    buildingEndNo,
    roadLength,
    roadWidth,
    pedSeparation,
    slope,
    accTotal,
    accDeath,
    accSerious,
    accMinor,
    accReport,
    trafficVolume,
    parking,
    pedestrianVolume,
    cctv,
    cctvCount,
    securityLight,
    securityLightCountGood,
    securityLightCountBad,
    packageState,
    speedReductionFacil,
    pedSign,
    light,
    bench,
    plant,
    obstacle,
    illegalParking,
  } = body;

  var qry = `INSERT INTO srvy.srvy (
        nfidlst, timestamp, researchDate, researcher, roadName, buildingStartNo, buildingEndNo, roadLength, roadWidth, pedSeparation, slope, accTotal, accDeath, accSerious, accMinor, accReport, trafficVolume, parking, pedestrianVolume, cctv, cctvCount, securityLight, securityLightCountGood, securityLightCountBad, packageState, speedReductionFacil, pedSign, light, bench, plant, obstacle, illegalParking
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) RETURNING *`;
  try {
    const timestamp = new Date().toISOString();
    const result = await client.query(qry, [
      nfidlst,
      timestamp,
      researchDate,
      researcher,
      roadName,
      buildingStartNo,
      buildingEndNo,
      roadLength,
      roadWidth,
      pedSeparation,
      slope,
      accTotal,
      accDeath,
      accSerious,
      accMinor,
      accReport,
      trafficVolume,
      parking,
      pedestrianVolume,
      cctv,
      cctvCount,
      securityLight,
      securityLightCountGood,
      securityLightCountBad,
      packageState,
      speedReductionFacil,
      pedSign,
      light,
      bench,
      plant,
      obstacle,
      illegalParking,
    ]);
    // console.log('dbreq result', result);
    const newRow = result.rows[0];

    const qry2 = `INSERT INTO srvy.srvy_user_ref (
        srvyid, userid
      ) VALUES ($1, $2) RETURNING *`;
    const result2 = await client.query(qry2, [newRow.srvyid, userid]);
    console.log('dpreq result2.rows[0]/n', result2.rows[0]);

    return 'upload successful';
  } catch (err) {
    console.log(err);
  }
};

const getSrvyhist = async (body) => {
  const { userid } = body;

  var qry = `SELECT s.srvyid, s.roadName, s.timestamp FROM srvy.srvy s JOIN srvy.srvy_user_ref ur ON s.srvyid = ur.srvyid WHERE ur.userid = $1 ORDER BY s.timestamp desc;`;
  try {
    const result = await client.query(qry, [userid]);
    // console.log('dbreq result', result);
    const newRow = result.rows;

    // console.log('dpreq getSrvyhist newRow/n', newRow);

    return newRow;
  } catch (err) {
    console.log(err);
  }
};

const getCsvSrvy = async (body) => {
  const { srvyid } = body;

  var qry = `SELECT * FROM srvy.srvy WHERE srvyid = $1;`;
  try {
    const result = await client.query(qry, [srvyid]);
    // console.log('dbreq result', result);
    const newRow = result.rows[0];

    // console.log('dpreq getCsvSrvy newRow/n', newRow);

    return newRow;
  } catch (err) {
    console.log(err);
  }
};

const getSrvyItem = async (body) => {
  const { srvyid } = body;
  const qry = `select * from srvy.srvy WHERE srvyid = $1;`;

  try {
    const result = await client.query(qry, [srvyid]);
    const newRow = result.rows[0];
    return newRow;
  } catch (err) {
    console.log(err);
  }
};

const delSrvyItem = async (body) => {
  const { srvyid } = body;

  const qry1 = `DELETE FROM srvy.srvy_user_ref WHERE srvyid = $1;`;
  const qry2 = `DELETE FROM srvy.srvy WHERE srvyid = $1;`;

  try {
    await client.query('BEGIN');
    await client.query(qry1, [srvyid]);
    await client.query(qry2, [srvyid]);
    await client.query('COMMIT');
    return 'delete successful';
  } catch (err) {
    await client.query('ROLLBACK');
    console.log(err);
    throw err;
  }
};

const editSrvy = async (body) => {
  const {
    srvyid,
    nfidlst,
    researchdate,
    researcher,
    roadname,
    buildingstartno,
    buildingendno,
    roadlength,
    roadwidth,
    pedseparation,
    slope,
    acctotal,
    accdeath,
    accserious,
    accminor,
    accreport,
    trafficvolume,
    parking,
    pedestrianvolume,
    cctv,
    cctvcount,
    securitylight,
    securitylightcountgood,
    securitylightcountbad,
    packagestate,
    speedreductionfacil,
    pedsign,
    light,
    bench,
    plant,
    obstacle,
    illegalparking,
  } = body;

  var qry = `UPDATE srvy.srvy SET
        nfidlst = $1, researchDate = $2, researcher = $3, roadName = $4, buildingStartNo = $5, buildingEndNo = $6, roadLength = $7, roadWidth = $8, pedSeparation = $9, slope = $10, accTotal = $11, accDeath = $12, accSerious = $13, accMinor = $14, accReport = $15, trafficVolume = $16, parking = $17, pedestrianVolume = $18, cctv = $19, cctvCount = $20, securityLight = $21, securityLightCountGood = $22, securityLightCountBad = $23, packageState = $24, speedReductionFacil = $25, pedSign = $26, light = $27, bench = $28, plant = $29, obstacle = $30, illegalParking = $31, timestamp = $33
      WHERE srvyid = $32 RETURNING *`;

  try {
    const timestamp = new Date().toISOString();
    await client.query(qry, [
      nfidlst,
      researchdate,
      researcher,
      roadname,
      buildingstartno,
      buildingendno,
      roadlength,
      roadwidth,
      pedseparation,
      slope,
      acctotal,
      accdeath,
      accserious,
      accminor,
      accreport,
      trafficvolume,
      parking,
      pedestrianvolume,
      cctv,
      cctvcount,
      securitylight,
      securitylightcountgood,
      securitylightcountbad,
      packagestate,
      speedreductionfacil,
      pedsign,
      light,
      bench,
      plant,
      obstacle,
      illegalparking,
      srvyid,
      timestamp,
    ]);
    // console.log('dbreq result', result);
    // const newRow = result.rows[0];

    return 'upload successful';
  } catch (err) {
    console.log(err);
  }
};

const getCordOnly = async (body) => {
  const { nfid } = body;
  const qry = `SELECT long, lat FROM public.side10 where NF_ID = $1;`;
  try {
    const result = await client.query(qry, [nfid]);
    const newRow = result.rows[0];
    return newRow;
  } catch (err) {
    console.log(err);
  }
};

const getCsvGen1 = async (body) => {
  const { yr, ldc, tablename } = body;
  const ldcint = Number(ldc);
  const yrint = Number(yr);
  const qry = `SELECT * FROM gen.${tablename} WHERE ldc = $1 and yr in ($2, $3, $4, $5, $6);`;

  try {
    console.log('getCsvGen1 triggered');
    console.log(
      'getCsvGen1 yrint, ldcint, tablename\n',
      yrint,
      ldcint,
      tablename
    );

    const result = await client.query(qry, [
      ldcint,
      yrint,
      yrint - 1,
      yrint - 2,
      yrint - 3,
      yrint - 4,
    ]);
    // console.log('dbreq result', result);

    const newRow = result.rows;

    // console.log('dpreq getCsvGen1 newRow/n', newRow);

    return newRow;
  } catch (err) {
    console.log(err);
  }
};

/////////////////////////////////////////////////////////////////////
const getPfrjs = async () => {
  try {
    // console.log('pfr triggered');
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
    FROM pfr.pfr;`;
    const result = await client.query(qry);
    const gjsdata = result.rows[0].geojson;
    // console.log('pfrjs done');
    // console.log('getPfrjs result at dbrequest:\n', gjsdata);
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
    FROM pfr.parks_pfr p
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
    FROM pfr.parks_buffer_pfr p
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
    FROM pfr.child_safezone_pfr p
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
    FROM pfr.senior_safezone_pfr p
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
    FROM pfr.multi_building_pfr p
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
    FROM pfr.multi_building_entrances_pfr p
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
    FROM pfr.school_bld_pfr p
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
    FROM pfr.school_buffer_pfr p
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
    FROM pfr.school_entrances_pfr p
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
      FROM public.side1r
      WHERE leglcd_se = $1
      AND road_bt >= 5
      AND ped_fit >= 0.5
      AND pedx IS NULL
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

///////////////////////////////////////////////////////////////////////
const submitTable = async (data) => {
  try {
    await client.query('BEGIN');

    //update mod_temp
    const insertQuery = `
      INSERT INTO gen.mod_temp (tbl_name, ldc, yr, mod_date, mod_field, mod_value, og_value, user_id)
      VALUES 
      ${data
        .map(
          (row, idx) =>
            `($${idx * 7 + 1}, $${idx * 7 + 2}, $${
              idx * 7 + 3
            }, TO_CHAR(NOW() AT TIME ZONE 'Asia/Seoul', 'YYYYMMDD HH24MISS'), $${
              idx * 7 + 4
            }, $${idx * 7 + 5}, $${idx * 7 + 6}, $${idx * 7 + 7})`
        )
        .join(', ')}
      RETURNING id, tbl_name, ldc, yr, mod_field, mod_value;
    `;

    const params = data.flatMap((row) => [
      row.tbl_name,
      row.ldc,
      row.yr,
      row.mod_field,
      row.mod_value,
      row.og_value,
      row.username,
    ]);

    const insertResult = await client.query(insertQuery, params);

    // // update actual table
    const insertedRows = insertResult.rows;
    // console.log(insertedRows);

    for (const row of insertedRows) {
      const updateQuery = `
        UPDATE gen.${row.tbl_name}
        SET ${row.mod_field} = $1, mod_id = $2
        WHERE ldc = $3 AND yr = $4;
      `;

      const updateParams = [row.mod_value, row.id, row.ldc, row.yr];

      await client.query(updateQuery, updateParams);
    }

    await client.query('COMMIT');
    return true;
  } catch (err) {
    console.error('Error inserting data:', err);
    await client.query('ROLLBACK');
    return false;
  }
};

const getSurveyBuffer = async (ids) => {
  try {
    const placeholders = ids.map((_, idx) => `$${idx + 1}`).join(', ');

    const qry = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb
          )
        )
      ) AS geojson
      FROM (
        SELECT ST_Union(ST_Buffer(geom::geography, 120)::geometry) AS geom
        FROM public.side1r
        WHERE nf_id IN (${placeholders})
      ) subquery;
    `;

    const result = await client.query(qry, ids);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('Error in getSurveyBuffer at dbrequest: ', e);
    throw e;
  }
};

const getSurveyBufferMask = async (ids) => {
  try {
    const placeholders = ids.map((_, idx) => `$${idx + 1}`).join(', ');

    const qry = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb
          )
        )
      ) AS geojson
      FROM (
        SELECT ST_Difference(
                ST_Buffer(
                  ST_Union(ST_Buffer(geom::geography, 1000)::geometry),
                  0
                ),
                ST_Buffer(
                  ST_Union(ST_Buffer(geom::geography, 120)::geometry),
                  0
                )
              ) AS geom
        FROM public.side1r
        WHERE nf_id IN (${placeholders})
      ) subquery;
    `;

    const result = await client.query(qry, ids);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('Error in getSurveyBufferMask at dbrequest: ', e);
    throw e;
  }
};

const getSrvData = async (ids) => {
  try {
    const placeholders = ids.map((_, idx) => `$${idx + 1}`).join(', ');

    const qry = `
      WITH buffer_polygon AS (
        SELECT ST_Union(ST_Buffer(geom::geography, 100, 'quad_segs=16')::geometry) AS geom
        FROM public.side1r
        WHERE nf_id IN (${placeholders})
      )
      SELECT jsonb_build_object(
        'bld', (
          SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(
              jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(b.geom)::jsonb,
                'properties', jsonb_build_object(
                  'id', b.uid,
                  'bdtyp_cd', b.bdtyp_cd,
                  'bd_nb_full', b.bd_nb_full
                )
              )
            )
          )
          FROM srvy.buld_srvy b, buffer_polygon
          WHERE ST_Within(b.geom, buffer_polygon.geom)
        ),
        'rodway', (
          SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(
              jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(r.geom)::jsonb,
                'properties', jsonb_build_object(
                  'id', r.uid
                )
              )
            )
          )
          FROM srvy.rodway_srvy r, buffer_polygon
          WHERE ST_Within(r.geom, buffer_polygon.geom)
        ),
        'pedpath', (
          SELECT jsonb_build_object(
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
          )
          FROM srvy.pedpath_srv p, buffer_polygon
          WHERE ST_Within(p.geom, buffer_polygon.geom)
        ),
        'cctv', (
          SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(
              jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(c.geom)::jsonb,
                'properties', jsonb_build_object(
                  'id', c.uid
                )
              )
            )
          )
          FROM srvy.cctv_srv c, buffer_polygon
          WHERE ST_Within(c.geom, buffer_polygon.geom)
        ),
        'crosswalk', (
          SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(
              jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(cr.geom)::jsonb,
                'properties', jsonb_build_object(
                  'id', cr.uid
                )
              )
            )
          )
          FROM srvy.crosswalk_srv cr, buffer_polygon
          WHERE ST_Within(cr.geom, buffer_polygon.geom)
        )
      ) AS geojson;
    `;

    const result = await client.query(qry, ids);
    const gjsdata = result.rows[0].geojson;

    return gjsdata;
  } catch (e) {
    console.error('Error in getSrvData at dbrequest: ', e);
    throw e;
  }
};

const getLstLength = async (ids) => {
  try {
    if (!ids || ids.length === 0) {
      return 0;
    }

    const qry = `
      SELECT SUM(road_lt) AS total_length
      FROM risk.side1r_length
      WHERE nf_id = ANY ($1);
    `;

    const result = await client.query(qry, [ids]);
    const total_length = result.rows[0]?.total_length || 0;
    return total_length;
  } catch (e) {
    console.error('Error in getLstLength at dbrequest: ', e);
    throw e;
  }
};

const getPfrProps = async (ids) => {
  if (!ids || ids.length === 0) {
    return 0;
  }
  try {
    const qry = `
      SELECT 
        cartrk_co,
        road_bt,
        sdwk_se,
        rdnet_ac,
        pbuld_fa,
        bulde_de,
        pubtr_ac,
        stair_at
      FROM 
        srvy.side1r 
      WHERE nf_id = ANY ($1);
    `;

    const { rows } = await client.query(qry, [ids]);

    if (rows.length === 0) {
      return {
        cartrk_co: null,
        road_bt: null,
        sdwk_se: null,
        rdnet_ac: null,
        pbuld_fa: null,
        bulde_de: null,
        pubtr_ac: null,
        stair_at: null,
      };
    }

    const totals = rows.reduce(
      (acc, curr) => {
        return {
          cartrk_co: acc.cartrk_co + curr.cartrk_co,
          road_bt: acc.road_bt + curr.road_bt,
          sdwk_se: acc.sdwk_se + curr.sdwk_se,
          rdnet_ac: acc.rdnet_ac + curr.rdnet_ac,
          pbuld_fa: acc.pbuld_fa + curr.pbuld_fa,
          bulde_de: acc.bulde_de + curr.bulde_de,
          pubtr_ac: acc.pubtr_ac + curr.pubtr_ac,
          stair_at: acc.stair_at + curr.stair_at,
        };
      },
      {
        cartrk_co: 0,
        road_bt: 0,
        sdwk_se: 0,
        rdnet_ac: 0,
        pbuld_fa: 0,
        bulde_de: 0,
        pubtr_ac: 0,
        stair_at: 0,
      }
    );

    const avg = {
      cartrk_co: totals.cartrk_co / rows.length,
      road_bt: totals.road_bt / rows.length,
      sdwk_se: totals.sdwk_se / rows.length,
      rdnet_ac: totals.rdnet_ac / rows.length,
      pbuld_fa: totals.pbuld_fa / rows.length,
      bulde_de: totals.bulde_de / rows.length,
      pubtr_ac: totals.pubtr_ac / rows.length,
      stair_at: totals.stair_at / rows.length,
    };

    return avg;
  } catch (err) {
    console.error('Error in getProp at dbrequest: ', err);
    throw err;
  }
};

module.exports = {
  getLength2: getLength2,
  getLength4: getLength4,
  // getLength: getLength,
  getCsv: getCsv,
  getCord: getCord,
  getProp: getProp,
  getShap: getShap,
  getSrchId: getSrchId,
  // getTop5: getTop5,
  getEcon: getEcon,
  getReg: getReg,
  getBar2sido: getBar2sido,
  getBar2sgg: getBar2sgg,
  getSidogjs: getSidogjs,
  getSgggjs: getSgggjs,
  getLdc: getLdc,
  getSide1r: getSide1r,
  // getSidesmp: getSidesmp,
  getPie1: getPie1,
  postSrvy: postSrvy,
  getSrvyhist: getSrvyhist,
  getCsvSrvy: getCsvSrvy,
  getSrvyItem: getSrvyItem,
  delSrvyItem: delSrvyItem,
  editSrvy: editSrvy,
  getCordOnly: getCordOnly,
  getCsvGen1: getCsvGen1,
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
  submitTable: submitTable,
  getSurveyBuffer: getSurveyBuffer,
  getSurveyBufferMask: getSurveyBufferMask,
  getSrvData: getSrvData,
  getLstLength: getLstLength,
  getPfrProps: getPfrProps,
};
