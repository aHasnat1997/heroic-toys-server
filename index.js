const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Heroic Toys Running 🏃🏻')
});


// mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@heroic-toys-db.fvxtohq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const productCollection = client.db('heroic-toys').collection('products');
    const feedbackCollection = client.db('heroic-toys').collection('customer-feedback');

    app.get('/all-products', async (req, res) => {
      const result = await productCollection.find().project(
        { name: 1, image: 1, price: 1, rating: 1, featuredAs: 1 }
      ).toArray();
      res.send(result);
    });

    app.get('/customer-feedback', async (req, res) => {
      const result = await feedbackCollection.find().toArray();
      res.send(result);
    });

    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.post('/all-products', async (req, res) => {
      const doc = req.body;
      const result = await productCollection.insertOne(doc);
      res.send(result);
    });







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
