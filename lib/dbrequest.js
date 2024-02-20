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

// const getNFID = async (qry) => {
//   console.log("getNFID qry at dbrequest: ", qry);
//   try {
//     const result = await client.query(qry);
//     // console.log("result at dbrequest: ", result);
//     const nfidlist5 = result.rows.map((item, id) => {
//       return item.nf_id;
//     });
//     // console.log("\nnfidlist5 at dbrequest: ", nfidlist5);
//     return nfidlist5;
//   } catch (err) {
//     console.log(err);
//   }
// };

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

const getCord = async (qry) => {
  console.log("getCord qry at dbrequest: ", qry);
  const query = `SELECT 
  ST_X(ST_Centroid(wkb_geometry)) as long, 
  ST_Y(ST_Centroid(wkb_geometry)) as lat
FROM 
  (SELECT * FROM side9 where NF_ID in ('${qry}')) as t;`;
  const { rows } = await client.query(query);
  console.log("rows[0]: ", rows[0]);
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

module.exports = {
  getLength: getLength,
  // getNFID: getNFID,
  getCsv: getCsv,
  getCord: getCord,
};
