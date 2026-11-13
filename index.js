import cors from "cors";
import "dotenv/config";
import express from "express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

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

const db = client.db("careConnectDB");
    const eventCollection = db.collection("eventCollection");
    // const ordersCollection = db.collection("orders");

//create
app.post("/upcoming-event", async (req, res) => {
  const newEvent =req.body;
  console.log(newEvent);
  const result = await eventCollection.insertOne(newEvent);
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
          // bookName: updatedBook.bookName,
          // description: updatedBook.description,
          // writer: updatedBook.writer,
          // price: updatedBook.price,
        },
      };
      const options = { upsert: true };
      const result = await eventCollection.updateOne(
        filter,
        updatedDoc,
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
