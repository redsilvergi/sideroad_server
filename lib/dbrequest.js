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
  console.log("qry from dbrequest:", qry);
  try {
    const result = await client.query(qry);
    const length = result.rows[0].total_length;
    return length;
  } catch (err) {
    console.log(err);
  }
};

const getNFID = async (qry) => {
  console.log("qry at dbrequest: ", qry);
  try {
    const result = await client.query(qry);
    // console.log("result at dbrequest: ", result);
    const nfidlist5 = result.rows.map((item, id) => {
      return item.nf_id;
    });
    console.log("\nnfidlist5 at dbrequest: ", nfidlist5);
    return nfidlist5;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getLength: getLength,
  getNFID: getNFID,
};
