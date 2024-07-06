const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 9000;

const app = express()

const corsOptions = {
    origin : ['http://localhost:5173' , 'http://localhost:5174'],
    Credential : true,
    optionSuccessStatus : 200
}

app.use(cors(corsOptions));

app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.t241ufd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    //await deleted
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // get data from jobcollection

    const jobCollection = client.db('TaskTide').collection('Jobs');
    const bidCollection = client.db('TaskTide').collection('bids');

    app.get('/jobs', async (req, res) => {
        const result = await jobCollection.find().toArray()
        res.send(result)
    })
    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.findOne(query);
      res.send(result)
    })

    //save a bid in db
    app.post('/bid', async (req, res) => {
        const bidData = req.body;
        const result = await  bidCollection.insertOne(bidData);
        res.send(result)
    })

    //save a job in db
    app.post('/job' , async(req, res) => {
      const jobData = req.body;
     const result = await jobCollection.insertOne(jobData);
     res.send(result)
    })

    // get all jobs posted by a specific user
    app.get('/job/:email' , async (req, res) => {
      const email = req.params.email
      const query = { 'buyer.email' : email}
      const result = await jobCollection.find(query).toArray()
      res.send(result)
    })


  } finally {
//await deleted
  }
}
run().catch(console.dir);


app.listen(port,() => console.log(`server running on ${port}`))

app.get('/' , (req , res) => {
    res.send('TAsktide is running')
})