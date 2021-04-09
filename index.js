const express = require("express");
const port = 5000;
const app = express();
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require('dotenv').config();

const uri =
  `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.q83cw.mongodb.net/${process.env.DB_ProductDBName}?retryWrites=true&w=majority`;


app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send(" Working Env ");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const productCollection = client.db(`${process.env.DB_ProductDBName}`).collection("products");
  const orderCollection = client.db(`${process.env.DB_OrdersDBName}`).collection("orders");

  app.post("/allProduct", (req, res) => {
    const products = req.body;
    productCollection.insertMany(products).then((result) => {
      console.log(result.insertedCount);
    //   res.send(result.insertedCount);
    });
  });

//getting all products
  app.get('/product',(req,res) => {
    const search = req.query.search;
    productCollection.find({ name: {$regex: search } })
    .toArray((err, doc) => {
        res.send(doc)
    })
  })

//getting single product
  app.get('/product/:key',(req,res) => {
    productCollection.find({key: req.params.key})
    .toArray((err, doc) => {
        res.send(doc[0])
    })
  })

  app.post('/productsByKeys',(req, res)=>{
      const keys = req.body;
      productCollection.find( {key: {$in: keys}} )
      .toArray((err, doc)=>{
          res.send(doc)
      })
  })

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  console.log(" ======DATABASE CONNECTED ======");
});

app.listen(process.env.PORT || port);
