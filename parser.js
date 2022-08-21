const fetch = require('node-fetch');
const jsdom = require('jsdom');

async function parseTracks(url) {
    var obj = {}
    var tracks = [];
    let res = await fetch(url)
    let body = await res.text()
    const dom = new jsdom.JSDOM(body);
    const document = dom.window.document;
    obj.title = document.getElementById('page-container__first-linked-element').textContent;
    const trackElements = document.getElementsByClassName("songs-list-row__song-name-wrapper");
    for (let i = 0; i < trackElements.length; i++) {
        let el = trackElements[i];
        tracks.push({
            title: el.getElementsByClassName("songs-list-row__song-name")[0].textContent,
            artist: el.getElementsByClassName("songs-list-row__link")[0].textContent
        })
    }
    obj.tracks = tracks;
    return obj;
}

module.exports = {
    parseTracks: parseTracks
};