const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')
const e = require('express')
require('dotenv').config()

app.use(express.json())
app.use(cors());

// username: umakarthikray
// password: Ze8FyvxQfPguyRBA


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@job-portal.tz9l9kr.mongodb.net/?retryWrites=true&w=majority&appName=Job-portal`;

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
    await client.connect();

    const db = client.db("mernJobPortal");
    const jobCollections = db.collection("demoJobs");

    app.post("/post-job", async (req, res) => {
      const body = req.body;
      body.createAt = new Date();
      // console.log(body)
      const result = await jobCollections.insertOne(body);
      if (result.insertedId) {
        return res.status(200).send(result);
      }
      else {
        return res.status(404).send({
          message: "can not insert",
          status: false
        })
      }
    })

    app.get("/all-jobs", async (req, res) => {
      const jobs = await jobCollections.find().toArray();
      res.send(jobs);
    })

    app.get("/my-jobs/:email", async (req, res) => {
      const job = await jobCollections.find({ postedBy: req.params.email }).toArray();
      res.send(job);
    })

    app.get("/all-jobs/:id",async(req,res) => {
      const id = req.params.id;
      const job = await jobCollections.findOne({
        _id: new ObjectId(id)
      })
      res.send(job)
    })

    app.patch("/update-job/:id",async(req,res) =>{
      const id = req.params.id;
      const jobData = req.body;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updateDoc = {
        $set:{
          ...jobData
        },
      };

      const result = await jobCollections.updateOne(filter,updateDoc,options);
      res.send(result)
    })

    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
  
      try {
          const result = await jobCollections.deleteOne(filter);
          if (result.deletedCount > 0) {
              res.json({ acknowledged: true });
          } else {
              res.json({ acknowledged: false });
          }
      } catch (error) {
          res.status(500).json({ acknowledged: false, error: 'An error occurred' });
      }
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


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})