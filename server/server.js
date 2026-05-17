const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if ((username === 'Banker' || username === 'banker@bankpulse.com') && password === '1110') {
    res.json({
      success: true,
      token: 'demo-token',
      user: { username: 'Banker', role: 'admin' }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
