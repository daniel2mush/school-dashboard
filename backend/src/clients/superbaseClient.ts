// supabaseClient.js (or inside your route file)
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

// Initialize the client using the SERVICE ROLE key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase keys not found.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
