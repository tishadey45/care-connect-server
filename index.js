import cors from "cors";
import "dotenv/config";
import express from "express";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://care-connect-green-one.vercel.app"],
    credentials: true,
  }),
);

// app.use(
//   cors({
//     origin: true,
//   }),
// );
app.use(express.json());

// MongoDB Configuration

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing!");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let clientPromise;

async function connectToMongoDB() {
  try {
    if (!clientPromise) {
      console.log("Connecting to MongoDB...");

      clientPromise = client.connect().catch((error) => {
        clientPromise = null;
        throw error;
      });
    }

    await clientPromise;

    console.log("MongoDB connected successfully!");

    return client;
  } catch (error) {
    console.error("MongoDB Connection Failed!");
    console.error(error.message);

    throw error;
  }
}

// Database
const db = client.db("care-Connect-db");
const eventCollection = db.collection("eventCollection");
const organizersCollection = db.collection("organizers");

// MongoDB Middleware
app.use(async (req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "MongoDB connection failed",
      error: error.message,
    });
  }
});

// Validate MongoDB ObjectId
const isValidObjectId = (id) =>
  ObjectId.isValid(id) && String(new ObjectId(id)) === id;

// ===============================
// EVENT ROUTES
// ===============================

// Create Event
app.post("/upcoming-event", async (req, res) => {
  try {
    const data = req.body;
    const result = await eventCollection.insertOne(data);

    res.send(result);
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).send({ message: "Failed to create event" });
  }
});

// Get All Events
app.get("/upcoming-events", async (req, res) => {
  try {
    const result = await eventCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).send({ message: "Failed to get events" });
  }
});

// Get Single Event
app.get("/upcoming-events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid event ID" });
    }

    const result = await eventCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).send({ message: "Event not found" });
    }

    res.send(result);
  } catch (error) {
    console.error("Get Single Event Error:", error);
    res.status(500).send({ message: "Failed to get event" });
  }
});

// Delete Event
app.delete("/event/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid event ID" });
    }

    const result = await eventCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).send({ message: "Failed to delete event" });
  }
});

// Update Event
app.put("/event/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid event ID" });
    }

    const filter = { _id: new ObjectId(id) };

    const updatedEvent = { ...req.body };
    delete updatedEvent._id;

    const updatedDoc = {
      $set: updatedEvent,
    };

    const result = await eventCollection.updateOne(filter, updatedDoc);

    res.send(result);
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).send({ message: "Failed to update event" });
  }
});

// Get Events By Organizer Email
app.get("/events/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const result = await eventCollection
      .find({
        "organizer.email": email,
      })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("Get Organizer Events Error:", error);
    res.status(500).send({ message: "Failed to get organizer events" });
  }
});

// ===============================
// ORGANIZER ROUTES
// ===============================

// Create Organizer
app.post("/organizer", async (req, res) => {
  try {
    const event = req.body;
    const result = await organizersCollection.insertOne(event);

    res.send(result);
  } catch (error) {
    console.error("Create Organizer Error:", error);
    res.status(500).send({ message: "Failed to create organizer" });
  }
});

// Get All Organizers
app.get("/organizers", async (req, res) => {
  try {
    const result = await organizersCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Get Organizers Error:", error);
    res.status(500).send({ message: "Failed to get organizers" });
  }
});

// Get Organizers By Participant Email
app.get("/organizer/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const result = await organizersCollection
      .find({
        "participant.email": email,
      })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("Get Participant Organizers Error:", error);
    res.status(500).send({ message: "Failed to get organizers" });
  }
});

// Get Organizer Requests By Organizer Email
app.get("/organizer-request/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const result = await organizersCollection
      .find({
        "organizer.email": email,
      })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("Get Organizer Requests Error:", error);
    res.status(500).send({ message: "Failed to get organizer requests" });
  }
});

// Update Organizer Status
app.patch("/organizer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid organizer ID" });
    }

    const filter = { _id: new ObjectId(id) };

    const updateDoc = {
      $set: {
        status: req.body.status,
      },
    };

    const result = await organizersCollection.updateOne(filter, updateDoc);

    res.send(result);
  } catch (error) {
    console.error("Update Organizer Error:", error);
    res.status(500).send({ message: "Failed to update organizer" });
  }
});

// ===============================
// DEFAULT ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send("CareConnect Server is Running!");
});

// Local Development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;

  connectToMongoDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`CareConnect Server running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error.message);
      process.exit(1);
    });
}

export default app;
