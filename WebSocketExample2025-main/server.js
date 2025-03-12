require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const OpenAI = require("openai");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const users = new Set();
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});// Uses API key from .env file

app.use(express.static("public"));  // Serves static files from public folder

io.on("connection", (socket) => {
    console.log("A new user connected.");
    socket.on("chat message", async (msg) => {
        console.log(`Message received: ${msg}`);
        if (msg.toLowerCase().startsWith("@bot")) {
            const userMessage = msg.replace("@bot", "").trim(); // Removes "@bot" from message
            const aiResponse = await getBotResponse(userMessage);

            io.emit("chat message", `Bot: ${aiResponse}`);
        } else {
            io.emit("chat message", msg);
        }
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected."); // Logs when a user disconnect
    });
});

async function getBotResponse(message) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],// Sends user's message to AI
        });
        return response.choices[0].message.content;

    } catch (error) {
        console.error("OpenAI Error:", error);
        return "Sorry, I couldn't process that.";
    }
}

server.listen(3000, () => {console.log("Server running on http://localhost:3000");});
