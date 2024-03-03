const myDB = require("../config/config");
const { Pool } = require("pg");

// CONNECTION -----------------------------------------------------
const dbconn = () => {
  const client = new Pool(myDB.dbConfig);
  return client;
};
const client = dbconn();
// HELPERS -----------------------------------------------------
// REQUEST METHODS -----------------------------------------------------------
const getLength = async (qry) => {
  console.log("getLength qry from dbrequest:", qry);
  try {
    const result = await client.query(qry);
    const length = result.rows[0].total_length;
    return length;
  } catch (err) {
    console.log(err);
  }
};

const getCsv = async (qry) => {
  console.log("getCsv qry at dbrequest: ", qry);
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
const getCord = async (qry) => {
  console.log("getCord qry at dbrequest: ", qry);
  const query = `SELECT 
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
   side10 where NF_ID in ('${qry}');`;
  console.log("getCord query at dbreques: ", query);
  const { rows } = await client.query(query);
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
  console.log("getSrchId qry at dbrequest: ", qry);
  const { rows } = await client.query(qry);
  // console.log("getSrchId rows at dbrequest: ", rows);
  return rows;
};

const getTop5 = async (qry) => {
  console.log("getTop5 qry at dbrequest: ", qry);
  const { rows } = await client.query(qry);
  // console.log("getTop5 rows at dbrequest: ", rows);
  return rows;
};

module.exports = {
  getLength: getLength,
  getCsv: getCsv,
  getCord: getCord,
  getSrchId: getSrchId,
  getTop5: getTop5,
};
