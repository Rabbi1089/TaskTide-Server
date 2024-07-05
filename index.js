const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
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

    const jobcollection = client.db('TaskTide').collection('Jobs');

    app.get('/jobs', async (req, res) => {
        const result = await jobcollection.find().toArray()
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