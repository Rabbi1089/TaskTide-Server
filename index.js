const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 9000;

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://solosphere.web.app',
  ],
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

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


        // jwt generate
        app.post('/jwt', async (req, res) => {
          const user = req.body
          const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '365d',
          })
          res
            .cookie('token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            })
            .send({ success: true })
        })

        // verify token
      const verifyToken = (req, res , next) =>{
        const token = req.cookies.token;
        if (!token) {
          return res.status(401).send("unauthorized access")
        }
        console.log(token);
        if (token) {
          jwt.verify(token , process.env.ACCESS_TOKEN_SECRET , (err , decoded) => {
              if (err) {
                return res.status(401).send("unauthorized access")
              }
              console.log(decoded);
              req.user = decoded;
              next()
          })
        }
        
      }

    // Clear token on logout
    app.get('/logout', (req, res) => {
      res
        .clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          maxAge: 0,
        })
        .send({ success: true })
    })

    // Get all jobs data from db
    app.get("/jobs", async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    });

    // Get a single job data from db using job id
    app.get("/job/:id",verifyToken, async (req, res) => {
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
    app.post("/job",verifyToken, async (req, res) => {
      const jobData = req.body;
      const result = await jobCollection.insertOne(jobData);
      res.send(result);
    });

    // get all jobs posted by a specific user
    app.get("/jobs/:email",verifyToken, async (req, res) => {
      const tokenEmail = req.user.email;
      console.log('token email ' , tokenEmail)
      const email = req.params.email;
      if (tokenEmail !== email) {
        return res.status(403).send("forbidden access")
      }
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

app.listen(port, () => console.log(`server running on ${port}`))

app.get("/", (req, res) => {
  res.send("TAsktide is running");
});
