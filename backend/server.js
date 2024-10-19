const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const { spawn } = require("child_process");
const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const options = [
  "-i",
  "-",
  "-c:v",
  "libx264",
  "-preset",
  "ultrafast",
  "-tune",
  "zerolatency",
  "-r",
  `${25}`,
  "-g",
  `${25 * 2}`,
  "-keyint_min",
  25,
  "-crf",
  "25",
  "-pix_fmt",
  "yuv420p",
  "-sc_threshold",
  "0",
  "-profile:v",
  "main",
  "-level",
  "3.1",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-ar",
  128000 / 4,
  "-f",
  "flv",
  `rtmp://a.rtmp.youtube.com/live2/1y3k-ywdu-tgmj-j7t1-7rq6`,
];

const ffmpegProcess = spawn("ffmpeg", options);

ffmpegProcess.stdout.on("data", (data) => {
  console.log(`ffmpeg stdout: ${data}`);
});

ffmpegProcess.stderr.on("data", (data) => {
  console.error(`ffmpeg stderr: ${data}`);
});

ffmpegProcess.on("close", (code) => {
  console.log(`ffmpeg process exited with code ${code}`);
});

ffmpegProcess.on("error", (err) => {
  console.error("Failed to start ffmpeg process:", err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let inputData = [];

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("binarystream", (data) => {
    console.log("Binary Stream Received");
    inputData.push(data);
  });

  socket.on("disconnect", () => {
    console.log("User  disconnected", socket.id);

    setTimeout(() => {
      if (inputData.length === 0) {
        ffmpegProcess.stdin.end();
      }
    }, 1000);
  });
});

setInterval(() => {
  if (inputData.length > 0 && ffmpegProcess.stdin.writable) {
    const data = inputData.shift();
    ffmpegProcess.stdin.write(data);
  }
}, 100);

server.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
