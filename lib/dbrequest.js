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
  console.log("qry from dbrequest.js:", qry);
  try {
    const result = await client.query(qry);
    const length = result.rows[0].total_length;
    return length;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getLength: getLength,
};
