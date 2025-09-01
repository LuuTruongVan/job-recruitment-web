const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./db");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

// Routers
const usersRouter = require("./routes/users");
const candidatesRouter = require("./routes/candidates");
const employersRouter = require("./routes/employers");
const jobpostsRouter = require("./routes/jobposts");
const applicationsRouter = require("./routes/applications");
const categoriesRouter = require("./routes/categories");
const favoritesRoutes = require("./routes/favorites");
const uploadAvatarRoutes = require("./routes/uploadAvatar");
const conversationsRouter = require("./routes/conversations");
const messagesRouter = require("./routes/messages");
const notificationsRouter = require("./routes/notifications");

// Middleware
app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Static
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/favorites", favoritesRoutes);
app.use("/upload-avatar", uploadAvatarRoutes);
app.use("/users", usersRouter);
app.use("/candidates", candidatesRouter);
app.use("/employers", employersRouter);
app.use("/jobposts", jobpostsRouter);
app.use("/applications", applicationsRouter);
app.use("/categories", categoriesRouter);
app.use("/conversations", conversationsRouter);
app.use("/messages", messagesRouter);
app.use("/notifications", notificationsRouter);

// Server + Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

app.set("io", io);

// Socket.io Logic
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    if (!conversationId) return;
    socket.join(`conv_${conversationId}`);
    console.log(`💬 Socket ${socket.id} joined conv_${conversationId}`);
  });

  socket.on("joinUser", (userId) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    console.log(`🔔 User ${userId} joined room user:${userId}`);
  });

  socket.on("sendMessage", async (msg) => {
    try {
      const [result] = await pool.query(
        "INSERT INTO messages (conversation_id, sender_id, receiver_id, message, created_at, is_read) VALUES (?, ?, ?, ?, NOW(), 0)",
        [msg.conversation_id, msg.sender_id, msg.receiver_id, msg.message]
      );

      const [newMsg] = await pool.query("SELECT * FROM messages WHERE id = ?", [result.insertId]);
      io.to(`conv_${msg.conversation_id}`).emit("receiveMessage", newMsg[0]);
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});