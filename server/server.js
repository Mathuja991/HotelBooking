import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from "./controller/clerkWebhooks.js";
import bodyParser from 'body-parser';

connectDB();
const app = express();

app.use(cors());

app.use(clerkMiddleware());

// Regular JSON parsing for all routes except the webhook
app.use(express.json());

// Webhook route gets raw body
app.post(
  '/api/clerk',
  bodyParser.raw({ type: 'application/json' }), // Only parse JSON content type as raw
  clerkWebhooks
);

app.get('/', (req, res) => res.send("API is working"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));