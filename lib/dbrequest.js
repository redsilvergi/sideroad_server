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
const getLength = async (qry) => {
  console.log('getLength qry from dbrequest:', qry);
  try {
    const result = await client.query(qry);
    const length = result.rows[0].total_length;
    return length;
  } catch (err) {
    console.log(err);
  }
};

const getCsv = async (qry) => {
  console.log('getCsv qry at dbrequest: ', qry);
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
const getCord = async (param) => {
  console.log('getCord param at dbrequest: ', param);
  const qry = `SELECT 
    long, 
    lat,
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
    crime_rk,
    flood_rk,
    crwdac_rk,
    fallac_rk
FROM 
   side10 where NF_ID in ('${param}');`;
  console.log('getCord qry at dbreques: ', qry);
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

const getSrchId = async (qry) => {
  console.log('getSrchId qry at dbrequest: ', qry);
  const { rows } = await client.query(qry);
  // console.log("getSrchId rows at dbrequest: ", rows);
  return rows;
};

const getTop5 = async (params) => {
  const { ldc, rsktype } = params;

  console.log('getTop5 ldc, rsktype at dbrequest:\n', ldc, '\n', rsktype);

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
  console.log('gettop5 qry dbrequest\n', qry);

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
    console.log('getEcon rows at dbrequest: ', rows.slice(0, 3));
    return rows;
  } catch (e) {
    console.error('getEcon error at dbrequest: ', e);
  }
};

const getReg = async () => {
  try {
    const qry = `SELECT * FROM ldctable WHERE inuse = true`;
    const { rows } = await client.query(qry);
    console.log('getReg rows at dbrequest: ', rows.slice(0, 3));
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
    console.log('getBar2sido rows at dbrequest: ', rows.slice(0, 3));
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
    console.log('getBar2sgg rows at dbrequest: ', rows.slice(0, 3));
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
    console.log('getSidogjs result at dbrequest:\n', gjsdata);
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
    console.log('sgggjsgjs done');
    console.log('getSgggjs result at dbrequest:\n', gjsdata);
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
  console.log('getLdc rows:\n', rows);
  return rows;
};

module.exports = {
  getLength: getLength,
  getCsv: getCsv,
  getCord: getCord,
  getSrchId: getSrchId,
  getTop5: getTop5,
  getEcon: getEcon,
  getReg: getReg,
  getBar2sido: getBar2sido,
  getBar2sgg: getBar2sgg,
  getSidogjs: getSidogjs,
  getSgggjs: getSgggjs,
  getLdc: getLdc,
};
