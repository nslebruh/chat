// Modules
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const dbUri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.zrsr5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const dbClient = new MongoClient(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

dbClient.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to MongoDB");
});

// Use body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Access static files
const staticFiles = express.static(path.join(__dirname, "../client/build"));
app.use(staticFiles);

// Start router
const router = express.Router();

//! Test
router.get("/api/test", (req, res) => {
  res.send("Bruh");
});

// Database stuff
router.get("/api/log/get", (req, res) => {
  // res.json({message: "Bruh"});
  // return;

  var { channel } = req.query;
  console.log(channel);

  const collection = dbClient.db(channel).collection("messages");
  collection.find({}).toArray(function (err, result) {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

router.get("/api/log/post", (req, res) => {
  var { channel, content } = req.query;
  console.log(channel, content);

  const collection = dbClient.db(channel).collection("messages");
  collection
    .insertOne({
      channel,
      content,
      time: Date.now(),
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
});

// Use router
app.use(router);

// any routes not picked up by the server api will be handled by the react router
app.use("/*", staticFiles);

// Start server
app.set("port", process.env.PORT || 3001);
app.listen(app.get("port"), () => {
  console.log(`Listening on ${app.get("port")}`);
});
