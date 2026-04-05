
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const rideCron = require("./cron/rideCron");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>res.send('API Running'));

app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/provider', require('./routes/providerRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));

// Start crons
rideCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server started on ${PORT}`));
