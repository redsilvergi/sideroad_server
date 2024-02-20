const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(express.json());

//--------------------------------------------------------------------------------------
const dbRequest = require("./lib/dbrequest");
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
  getCord: async function (qry) {
    return await dbRequest.getCord(qry);
  },
};
//--------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////

app.get("/getLength/:qry", async (req, res) => {
  const qry = req.params.qry === "null" ? null : req.params.qry;
  try {
    const rtrvd = await requestType["getLength"](qry);
    // console.log("typeof getLength rtrvd at app: ", typeof rtrvd);
    // console.log("getLength rtrvd at app: ", rtrvd);
    res.send(rtrvd ? rtrvd.toString() : "0");
  } catch (err) {
    console.error(err);
    res.status(500).send("error getLength at app");
  }
});

// app.get("/getNFID/:qry", async (req, res) => {
//   const qry = req.params.qry === "null" ? null : req.params.qry;
//   try {
//     const rtrvd = await requestType["getNFID"](qry);
//     // console.log("typeof getNFID rtrvd at app: ", typeof rtrvd);
//     // console.log("getNFID rtrvd at app: ", rtrvd);
//     res.send(rtrvd);
//   } catch (err) {
//     console.err(err);
//     res.status(500).send("error getNFID at app");
//   }
// });

app.get("/getCsv/:qry", async (req, res) => {
  const qry = req.params.qry === "null" ? null : req.params.qry;
  try {
    const rtrvd = await requestType["getCsv"](qry);
    // console.log("typeof getCsv rtrvd at app: ", typeof rtrvd);
    // console.log("getCsv rtrvd at app: ", rtrvd);
    res.json(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send("error getCsv at app");
  }
});

app.get("/getCord/:qry", async (req, res) => {
  const qry = req.params.qry === "null" ? null : req.params.qry;
  try {
    const rtrvd = await requestType["getCord"](qry);
    // console.log("typeof getCsv rtrvd at app: ", typeof rtrvd);
    // console.log("getCsv rtrvd at app: ", rtrvd);
    res.send(rtrvd);
  } catch (err) {
    console.err(err);
    res.status(500).send("error getCord at app");
  }
});

const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "./build");
app.use(express.static(buildPath));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "./build/index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("server started");
});
