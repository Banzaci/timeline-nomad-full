import express from 'express';
import cors from 'cors';
// import { Client } from '@elastic/elasticsearch';
// import esRoutes from './routes/es.js';
import bodyParser from 'body-parser';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import businessRoutes from './routes/business.js';
import { Server } from "socket.io";
import http from 'http';

const app = express();
const users = [];
const PORT = process.env.PORT || 3000;

app.use(cors())

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  }
});

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);
  socket.on('connected', (userId) => {
    users[userId] = socket.id;
    console.log(users)
  })
  socket.on("friend-request", async ({ senderId, receiverId }) => {
    console.log('data::', senderId, receiverId)
    io.to(users[receiverId]).emit('friend-request', senderId);
    // const friendRequest = new Friends({ senderId, receiverId, lastUpdated: new Date() })
    // await friendRequest.save();
  });
  // socket.emit("friend-request", { type: '' });
});

io.on("connection_error", (err) => {
  // the reason of the error, for example "xhr poll error"
  console.log(err.message);

  // some additional description, for example the status code of the initial HTTP response
  console.log(err.description);

  // some additional context, for example the XMLHttpRequest object
  console.log(err.context);
});

server.listen(PORT, () => {
  // server.listen(PORT)
  console.log('Connected to server')
})


// const esclient = new Client({
//   node: 'https://localhost:9200/',
//   //'https://[username]:[password]@[server]:[port]/'
//   auth: {
//     username: 'elastic',
//     password: 'changeme'
//   }
// });

// app.get('/health', (req, res) => {
//   console.log("I am here");
//   esclient.cluster.health({}, (err, resp, status) => {
//     if (err) {
//       console.log("-- Client Health ERROR--", err);
//       res.send({ err });
//     } else {
//       console.log("-- Client Health --", resp);
//       res.send({ resp });
//     }
//   });
// });

// console.log('Connected to Elasticsearch');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/uploads', express.static('uploads'));

connectDB();

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/business', businessRoutes);

// app.get('/health', esRoutes);

// app.get('/index', async (req, res) => {
//   try {
//     // const { body } = req;
//     const response = await req.app.locals.elasticClient.index({
//       index: 'users',
//       body: { "title": "Sample Document", "content": "This is a test document." },
//     });
//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get('/search', async (req, res) => {
//   try {
//     const { q } = req.query;
//     const response = await req.app.locals.elasticClient.search({
//       index: 'your_index_name',
//       body: {
//         query: {
//           match: { _all: q },
//         },
//       },
//     });
//     res.json(response.hits.hits);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server started on port -> ${PORT}`);
// });

