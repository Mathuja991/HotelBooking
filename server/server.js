import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controller/clerkWebhooks.js";
import bodyParser from 'body-parser'

connectDB()
const app = express()

app.use(cors()) // Enable Cross-Origin Resource Sharing

app.use(clerkMiddleware())

// Parse JSON body for all routes except the webhook
app.use(express.json())

// Add a raw body parser only for the webhook route
app.post('/api/webhook', express.raw({ type: 'application/json' }), clerkWebhooks);


app.get('/', (req, res) => res.send("API is working"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} `));
