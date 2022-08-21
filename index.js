const fs = require('fs');
const path = require('path');
const open = require('open');
const startServer = require('./callback_server.js');
const fetch = require('node-fetch');

const file = fs.readFileSync(process.argv[2], 'utf8');
const lines = file.split('\n')
var array = [];
lines.forEach(line => {
    if (line != "") {
        const l = line.split('	')
        array.push({ title: l[0], artist: l[1] })
    }
})
let playlistname = path.basename(process.argv[2], '.txt')

let client_id = 'd85da33f849c462b9249819b933e7723'
let scope = 'playlist-modify-public playlist-read-private playlist-modify-private';
let state = makeid(16)
let redirect_uri = 'http://localhost:8888/callback'

startServer(state)

open(`https://accounts.spotify.com/authorize?response_type=token&client_id=${encodeURIComponent(client_id)}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`);

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

async function convert(token) {
    let base = "https://api.spotify.com";

    //Get user id
    let user = await fetch(base + "/v1/me", {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    user = await user.json()
    let userId = user.id;

    //Search tracks
    let tracks = []
    for (let i = 1; i < array.length; i++) {
        let track = await fetch(base + "/v1/search?q=" + encodeURIComponent(array[i].title + " " + array[i].artist) + "&type=track&limit=1", {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        console.log(track.status + ": " + array[i].title + " - " + array[i].artist);
        track = await track.json()
        if (track.tracks && track.tracks.items && track.tracks.items.length > 0) {
            tracks.push(track.tracks.items[0].uri)
        }
    }

    //Create playlist
    let playlist = await fetch(base + "/v1/users/" + userId + "/playlists", {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: playlistname,
            public: false
        })
    })
    playlist = await playlist.json()

    //Add tracks to playlist
    while (tracks.length) {
        let add = await fetch(base + "/v1/playlists/" + playlist.id + "/tracks", {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: tracks.splice(0, 100)
            })
        })
        console.log(add.status);
    }

    process.exit(0);
}

module.exports = convert;