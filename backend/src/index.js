import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
res.json({ status: 'OK' });
});


const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));