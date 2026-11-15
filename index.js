import cors from "cors";
import "dotenv/config";
import express from "express";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
connectToMongoDB();

const db = client.db("care-Connect-db");
const eventCollection = db.collection("eventCollection");
const organizersCollection = db.collection("organizers");

//create
app.post("/upcoming-event", async (req, res) => {
  const data = req.body;
  console.log(data);
  const result = await eventCollection.insertOne(data);
  res.send(result);
});

// for get all events
app.get("/events", async (req, res) => {
  const cursor = await eventCollection.find().toArray();
  res.send(cursor);
});

// for get a single events
app.get("/event/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const query = { _id: new ObjectId(id) };
  const result = await eventCollection.findOne(query);
  res.send(result);
});

//  for delete event
app.delete("/event/:id", async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  const query = { _id: new ObjectId(id) };
  const result = await eventCollection.deleteOne(query);
  res.send(result);
});

//  for update a event
app.put("/event/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedBook = req.body;
  console.log(updatedBook);
  const updatedDoc = {
    $set: {
      title: updatedDoc.title,
      description: updatedDoc.description,
      eventType: updatedDoc.eventType,
    },
  };
  const options = { upsert: true };
  const result = await eventCollection.updateOne(filter, updatedDoc, options);
  res.send(result);
});

//  get all event created by a specific organizer
app.get("/events/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email);
  const query = { "organizer.email": email };
  const event = await eventCollection.find(query).toArray();
  res.send(event);
});

app.post("/organizer", async (req, res) => {
  const event = req.body;
  console.log(event);
  const result = await organizersCollection.insertOne(event);
  res.send(result);
});

//get all organizer
app.get("/organizers", async (req, res) => {
  const cursor = await organizersCollection.find().toArray();
  res.send(cursor);
});

// get all organizer add by a specific participant
app.get("/organizer/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email);
  const query = { "participant.email": email };
  const event = await organizersCollection.find(query).toArray();
  res.send(event);
});

// get all organizers add by a specific participant
app.get("/organizer-request/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email);
  const query = { "organizer.email": email };
  const result = await organizersCollection.find(query).toArray();
  res.send(result);
});

// update a organizer
app.patch("/organizer/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedOrganizer = req.body;
  console.log(updatedOrganizer);
  const updateDoc = {
    $set: {
      status: updatedOrganizer.status,
    },
  };
  const options = { upsert: true };
  const result = await organizersCollection.updateOne(
    filter,
    updateDoc,
    options,
  );
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// organizer
// participant
