const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(express.json());

//--------------------------------------------------------------------------------------
const dbRequest = require("./lib/dbrequest");
const requestType = {
  getLength: async function (query) {
    return await dbRequest.getLength(query);
  },
};
//--------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////

app.get("/getLength/:query", async (req, res) => {
  const query = req.params.query === "null" ? null : req.params.query;
  try {
    const rtrvd = await requestType["getLength"](query);
    console.log("Length fetched");
    res.send(rtrvd.toString());
  } catch (err) {
    console.error(err);
    res.status(500).send("error fetching nationalroad");
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
