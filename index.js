const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 9000;

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  Credential: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.t241ufd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // get data from jobcollection

    const jobCollection = client.db("TaskTide").collection("Jobs");
    const bidCollection = client.db("TaskTide").collection("bids");

    // Get all jobs data from db
    app.get("/jobs", async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    });

    // Get a single job data from db using job id
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    //save a bid in db
    app.post("/bid", async (req, res) => {
      const bidData = req.body;
      const result = await bidCollection.insertOne(bidData);
      res.send(result);
    });

    //save a job in db
    app.post("/job", async (req, res) => {
      const jobData = req.body;
      const result = await jobCollection.insertOne(jobData);
      res.send(result);
    });

    // get all jobs posted by a specific user
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "buyer.email": email };
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    //===== get all jobs from my bids =======//

    app.get('/my-bids/:email' , async (req , res ) => {
      const email = req.params.email;
      const query = {'email' : email }
      const result = await bidCollection.find(query).toArray();
      res.send(result)
    })


    //Get all bid requests from db for job owner
    app.get('/bid-requests/:email', async (req, res) => {
      const email = req.params.email
      const query = { email }
      const result = await bidCollection.find(query).toArray()
      res.send(result)
    })


    app.get("/bid-requests", async (req, res) => {
      const result = await bidCollection.find().toArray();
      res.send(result);
    });

    //update bid status

    app.patch('/bid/:id', async(req , res ) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id : new ObjectId(id)}
      const updateDoc = {
        $set : status
      }
      const result = await bidCollection.updateOne(query , updateDoc)
    res.send(result)
    })

    // delete a job data from db
    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    //== delete a bid data from db
    app.delete('/bid/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // update a job in db
    app.put('/job/:id',  async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...jobData,
        },
      };
      const result = await jobCollection.updateOne(query, updateDoc, options);
      res.send(result)
    });

    //await deleted
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //await deleted
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`server running on ${port}`));

app.get("/", (req, res) => {
  res.send("TAsktide is running");
});
