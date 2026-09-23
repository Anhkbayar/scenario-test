const express = require('express');
const app = express();
const port = 3000;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/delay', (req, res) => {
  setTimeout(() => {
    res.send('Response after 0.3 second');
  }, 300);
});


//lab3
app.post('/cart/add', (req, res) => {

  res.json({ ok: true, items: 1 })
});

app.get('/report', async (req, res) => {
  await sleep(200 + Math.random() * 200);
  res.send({ rows: 20000 });
})

app.post('/pay', (req, res) => {
  if (Math.random() < 0.05) return res.status(500).json({ error: 'gateway timeout' });
  res.json({ paid: true });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
