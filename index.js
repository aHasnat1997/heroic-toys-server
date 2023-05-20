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


    const indexKeys = { name: 1, category: 1 };
    const indexOptions = { name: "nameCategory" };
    const result = await productCollection.createIndex(indexKeys, indexOptions);
    console.log(result);
    app.get("/searchText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await productCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },
            { category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });


    app.get('/all-products/:featured', async (req, res) => {
      const filter = req.params.featured;
      const query = { featuredAs: filter };
      if (filter === "hot-product" || filter === "best-sellers" || filter === "new-arrival") {
        const result = await productCollection.find(query).project(
          { name: 1, image: 1, price: 1, rating: 1, featuredAs: 1, category: 1, seller: 1, availableQuantity: 1 }
        ).toArray();
        return res.send(result);
      }
      const result = await productCollection.find().project(
        { name: 1, image: 1, price: 1, rating: 1, featuredAs: 1, category: 1, seller: 1, availableQuantity: 1 }
      ).toArray();
      res.send(result);
    });

    app.get('/categories', async (req, res) => {
      const result = await productCollection.find().project({ category: 1 }).toArray();
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

    app.get('/my-toys', async (req, res) => {
      const email = req.query.email;
      const query = { "seller.email": email }
      const result = await productCollection.find(query).project(
        { name: 1, image: 1, price: 1, category: 1, availableQuantity: 1, featuredAs: 1, details: 1, rating: 1 }
      ).toArray();
      res.send(result);
    });

    app.post('/all-products', async (req, res) => {
      const doc = req.body;
      const result = await productCollection.insertOne(doc);
      res.send(result);
    });

    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })

    app.patch('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = req.body;
      const newProduct = {
        $set: {
          name: updateProduct.name,
          image: updateProduct.image,
          price: updateProduct.price,
          rating: updateProduct.rating,
          details: updateProduct.details,
          category: updateProduct.category,
          availableQuantity: updateProduct.availableQuantity,
          featuredAs: updateProduct.availableQuantity,
          id: updateProduct._id
        },
      };

      const result = await productCollection.updateOne(query, newProduct, options);
      res.send(result);
    })






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
