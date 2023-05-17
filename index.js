const express = require('express');
var cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Heroic Toys Running 🏃🏻')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
