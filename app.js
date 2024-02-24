import express from 'express';
import cors from 'cors';
// import { Client } from '@elastic/elasticsearch';
// import esRoutes from './routes/es.js';
import bodyParser from 'body-parser';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import jwt from 'jsonwebtoken';
import User from './models/user.js';
import notificationRoutes from './routes/friend-requests.js';
import countryRoutes from './routes/countries.js';
import { Server } from "socket.io";
import http from 'http';
import FriendRequests from './models/friend-requests.js';
import Messages from './models/messages.js';
import getFriendRequest from './utils/friend-requests.js';

const app = express();
let users = [];
const PORT = process.env.PORT || 3000;

app.use(cors())

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  }
});

// io.use((socket, next) => {
// https://socket.io/docs/v4/middlewares/
//   if (!token) {
//     return res.status(401).json({ message: 'Authentication required' });
//   }
//   const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
//   const user = await User.findById(decodedToken.userId);

//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
//   }
// });

// io.engine.use(async (req, res, next) => {
//   const header = req.headers["authorization"];
//   const decodedToken = jwt.verify(header?.split(' ')[1], process.env.SECRET_KEY);
//   const user = await User.findById(decodedToken.userId);
//   if (user) {
//     next();
//   }
// });

io.on('connection', (socket) => {
  socket.on('connected', (userId) => {
    users[userId] = socket.id;
  })

  socket.on('friend-request', async ({ senderId, receiverId }) => {
    const existRequest = await FriendRequests.exists({ senderId, receiverId });

    if (existRequest) {
      io.to(users[senderId]).emit('friend-request-response', { success: false, message: 'exist', receiverId, status: 'exist' });
      return;
    }

    const friendRequest = new FriendRequests({ senderId, receiverId, lastUpdated: new Date() })
    await friendRequest.save();
    const friendRequests = await getFriendRequest(receiverId);
    const user = await User.findById(senderId);

    // const friend = {
    //   friendId: user.id,
    //   friendFullname: user.fullname,
    //   status: 'pending',
    //   receiverId
    // };

    io.to(users[receiverId]).emit('friend-request', { success: true, message: 'received', friendRequests }); //TODO
    io.to(users[senderId]).emit('friend-request-response', { success: true, message: 'sent', receiverId, status: 'pending' });
  });


  socket.on('on-send-message', async ({ senderId, receiverId, message, token }) => {
    const newMessage = new Messages({ senderId, receiverId, message });
    await newMessage.save();
    io.to(users[receiverId]).emit('on-from-message', { message });
    io.to(users[senderId]).emit('on-from-message', { message });
  });

  socket.on('respond-to-friend-request', async ({ senderId, receiverId, status, token }) => {
    io.to(users[receiverId]).emit('on-respond-to-friend-request', { senderId, receiverId, status });
    io.to(users[senderId]).emit('on-respond-to-friend-request-sent', { senderId, receiverId, status });
  });

  // socket.on('accept-friend-request', async ({ senderId, receiverId }) => {
  //   console.log('accept-friend-request')
  //   const friendRequest = new FriendRequests({ senderId, receiverId, lastUpdated: new Date() })
  //   await friendRequest.save();
  //   const friendRequests = await getFriendRequest(receiverId);
  //   io.to(users[receiverId]).emit('friend-request', friendRequests);
  // });

  socket.on('disconnect', (reason) => {
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });

  socket.on('user-disconnect', (userId) => {
    const filteredUsers = Object.keys(users).filter((id) => id !== userId);
    users = filteredUsers;
  });
});

io.on("connection_error", (err) => {
  // the reason of the error, for example "xhr poll error"
  console.log(err.message);

  // some additional description, for example the status code of the initial HTTP response
  console.log(err.description);

  // some additional context, for example the XMLHttpRequest object
  console.log(err.context);
});

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
app.use('/notification', notificationRoutes);
app.use('/countries', countryRoutes);

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

server.listen(PORT, () => {
  // server.listen(PORT)
  console.log('Connected to server', PORT)
})
