// DEPENDENCIES
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
const { default: authRoutes } = await import('./routes/auth.route.js');
const { default: profileRoutes } = await import('./routes/profile.route.js');
const { default: resourcesRoutes } = await import('./routes/resources.route.js');

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();
app.use(express.json());
app.use(cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))

app.get('/health-check', (req, res) => {
    res.send('Hello, World!');
});


app.use('/api/auth', authRoutes);

app.use('/api/profile', profileRoutes);

// resources (uploads, listing)
app.use('/api/resources', resourcesRoutes);

app.listen(PORT, () => {
    console.log(` listening on http://localhost:${PORT}`);
});