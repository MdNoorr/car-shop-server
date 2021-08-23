const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjved.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const admin = require("firebase-admin");

var serviceAccount = require("./configs/car-shop-a3965-firebase-adminsdk-720d0-68b3e559ad.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://car-shop-a3965-default-rtdb.firebaseio.com",
});

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello !!! I am Student Collection");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const StudentCollection = client.db("car").collection("shop");
  const BuyNowCollection = client.db("car").collection("buy");

  console.log(process.env.DB_PASS);

  app.post("/addCarDetails", (req, res) => {
    const newTask = req.body;
    StudentCollection.insertOne(newTask).then((result) => {
      console.log(result, "Task Inserted");
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/CarDetails", (req, res) => {
    StudentCollection.find().toArray((err, events) => {
      res.send(events);
      // console.log(events);
    });
  });

  app.get("/CarDetails/:id", (req, res) => {
    //   console.log(req.params.id)
    StudentCollection.findOne({ _id: ObjectId(req.params.id) }).then(
      (result) => {
        // console.log(result, "Finded");
        res.send(result);
      }
    );
  });

  app.delete("/deleteTask/:id", (req, res) => {
    console.log(req.params.id);
    StudentCollection.deleteOne({ _id: ObjectId(req.params.id) }).then(
      (result) => {
        // console.log(result, "Deleted");
        res.send(result.deletedCount > 0);
      }
    );
  });

  app.post("/order", (req, res) => {
    const newTask = req.body;
    BuyNowCollection.insertOne(newTask).then((result) => {
      // console.log(result, "Task Inserted");
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/recieve", (req, res) => {
    BuyNowCollection.find({email : req.query.email}).toArray((err, events) => {
      res.send(events);
      // console.log(events);
    });
  });

  // app.get("/recieve", (req, res) => {
  //   const bearer = req.headers.authorization;

  //   if (bearer && bearer.startsWith("Bearer ")) {
  //     const idToken = bearer.split(" ")[1];
  //     console.log({ idToken });

  //     // idToken comes from the client app
  //     admin
  //       .auth()
  //       .verifyIdToken(idToken)
  //       .then((decodedToken) => {
  //         let uid = decodedToken.uid;
  //         let email = decodedToken.email;
  //         const queryEmail = req.query.email;
  //         // console.log(queryEmail, uid, email);
  //         if (uid && email) {
  //           BuyNowCollection.find({ email: req.query.email }).toArray(
  //             (err, events) => {
  //               res.status(200).send(events);
  //               // console.log(events);
  //             }
  //           );
  //         } else {
  //           res.status(401).send("Unauthorized access");
  //         }
  //         // console.log({ uid });
  //       })
  //       .catch((error) => {
  //         res.status(401).send("Unauthorized access");
  //       });
  //   } else {
  //     res.status(401).send("Unauthorized access");
  //   }
  // });
});

app.listen(process.env.PORT || port);
