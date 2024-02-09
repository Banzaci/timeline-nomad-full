import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import businessRoutes from './routes/business.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

app.use('/uploads', express.static('uploads'));

connectDB();

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/business', businessRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

