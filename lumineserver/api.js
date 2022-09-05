import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 8080;

let access_key = process.env.ACCESS_KEY;
let secret_key = process.env.SECRET_KEY;

app.use(cors({
    origin: 'https://lumine.oryfox.de',
    optionsSuccessStatus: 200
}))

app.get('/', (req, res) => {
    let url = req.query.url
    fetch(url)
        .then(res => res.text())
        .then(body => {
            res.send(body)
        })
})

app.get('/random', async (req, res) => {
    //Get random image from unsplash
    let response = await fetch(`https://api.unsplash.com/photos/random?client_id=${access_key}`)
    let data = await response.json()
    res.send(data.urls.regular)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))