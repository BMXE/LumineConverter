async function startServer(state) {
    const express = require('express');
    const app = express();
    app.use(express.json());
    const path = require('path');

    app.get('/callback', (req, res) => {
        res.sendFile(path.join(__dirname, 'callback.html'));
    });

    app.post('/callback', async (req, res) => {
        const accessToken = req.body.access_token;
        if (state === req.body.state) {
            res.send('OK');
            await require('./index.js')(accessToken);
        } else {
            res.send('ERROR');
        }
    })

    app.listen(8888, () => console.log('Listening on 8888'));
}

module.exports = startServer;