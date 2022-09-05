<template>
    <div class="root" v-if="access_token">
        <div class="h-stack">
            <input type="text" placeholder="URL to Apple Music Playlist" ref="url">
            <div class="button-base" @click="fetchAndParsePlaylist">Import playlist</div>
            <div class="button-base" @click="postDataToSpotify" :disabled="posting">Save</div>
            <input type="file" ref="imageSelector" @change="selectedButton">
            <img :src="imageBuffer" alt="" @click="this.$refs.imageSelector.click()" v-if="imageBuffer">
            <div class="button-base" @click="this.$refs.imageSelector.click()" v-else>Select playlist image</div>
            <div class="button-base" @click="getRandomImage">Random</div>
        </div>
        <span v-if="fetching">Retrieving and parsing data</span>
        <div class="content-pane">
            <input type="text" class="playlist-title" v-model="playlist.title" placeholder="Playlist name">
            <div v-for="item in playlist.tracks">
                <input type="checkbox" v-model="item.check">
                {{ item.title }} by {{ item.artist }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            access_token: null,
            playlist: {
                title: '',
                tracks: []
            },
            fetching: false,
            posting: false,
            imageBuffer: null
        }
    },
    created() {
        let client_id = 'd85da33f849c462b9249819b933e7723'
        let scope = 'ugc-image-upload playlist-modify-public playlist-read-private playlist-modify-private';
        let redirect_uri = 'https://lumine.oryfox.de'
        if (location.hash === '' && this.$cookies.get('access_token') === null) {
            let state = this.makeid(16)
            this.$cookies.set('state', state)
            location.href = `https://accounts.spotify.com/authorize?response_type=token&client_id=${encodeURIComponent(client_id)}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`
        } else {
            if (this.$cookies.get('access_token') !== null) {
                this.access_token = this.$cookies.get('access_token')
            } else {
                console.log(location.hash);
                const params = {}
                location.hash.substring(1).split('&').forEach(param => {
                    const [key, value] = param.split('=')
                    params[key] = value
                })
                if (params.state === this.$cookies.get('state')) {
                    this.access_token = params.access_token
                    this.$cookies.set('access_token', this.access_token)
                }
                this.$cookies.remove('state')
                console.log(params.state === this.$cookies.get('state'));
                console.log(params);
            }
        }
    },
    methods: {
        makeid(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() *
                    charactersLength));
            }
            return result;
        },
        async fetchAndParsePlaylist() {
            let url = this.$refs.url.value
            this.fetching = true
            var tracks = [];

            let res = await fetch(`https://lumine.oryfox.de/api?url=${encodeURIComponent(url)}`)
            let body = await res.text()
            const dom = new DOMParser();
            const document = dom.parseFromString(body, 'text/html');

            const replaceAllDanglingSpaces = (str) => {
                return str.replace(/(\s{2,})/g, ' ').trim()
            }

            this.playlist.title = replaceAllDanglingSpaces(document.getElementById('page-container__first-linked-element').innerText);
            const trackElements = document.getElementsByClassName("songs-list-row__song-name-wrapper");
            for (let i = 0; i < trackElements.length; i++) {
                let el = trackElements[i];
                tracks.push({
                    title: el.getElementsByClassName("songs-list-row__song-name")[0].textContent,
                    artist: el.getElementsByClassName("songs-list-row__link")[0].textContent,
                    check: true
                })
            }
            this.playlist.tracks = tracks;
            this.fetching = false
        },
        async postDataToSpotify() {
            this.posting = true
            let array = this.playlist.tracks.filter(track => track.check)
            let base = "https://api.spotify.com";

            //Get User ID
            let user = await fetch(base + "/v1/me", {
                headers: {
                    'Authorization': 'Bearer ' + this.access_token
                }
            })
            user = await user.json()
            let userId = user.id;
        
            //Search tracks
            let tracks = []
            for (let i = 1; i < array.length; i++) {
                let track = await fetch(base + "/v1/search?q=" + encodeURIComponent(array[i].title + " " + array[i].artist) + "&type=track&limit=1", {
                    headers: {
                        'Authorization': 'Bearer ' + this.access_token
                    }
                })
                track = await track.json()
                if (track.tracks && track.tracks.items && track.tracks.items.length > 0) {
                    tracks.push(track.tracks.items[0].uri)
                }
            }

            //Create playlist
            let playlist = await fetch(base + "/v1/users/" + userId + "/playlists", {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this.access_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.playlist.title,
                    public: false
                })
            })
            playlist = await playlist.json()
        
            //Add tracks to playlist
            while (tracks.length) {
                await fetch(base + "/v1/playlists/" + playlist.id + "/tracks", {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + this.access_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uris: tracks.splice(0, 100)
                    })
                })
            }

            if (this.imageBuffer) {
                await fetch(base + "/v1/playlists/" + playlist.id + "/images", {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer ' + this.access_token,
                        'Content-Type': 'image/jpeg'
                    },
                    body: this.imageBuffer.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")
                })
            }

            //Allow button to be clicked again
            this.posting = false
            //Reset playlist
            this.playlist = {
                title: '',
                tracks: []
            }
            this.imageBuffer = null
        },
        async selectedButton() {
            console.log("Image selected");
            let file = this.$refs.imageSelector.files[0]
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                this.imageBuffer = reader.result
            }
        },
        async getRandomImage() {
            let response = await fetch(`https://lumine.oryfox.de/api/random`)
            let url = await response.text()
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = async () => {
                const canvas = document.createElement("canvas");
                if (img.width > img.height) {
                    canvas.width = img.height;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, -((img.width - img.height) / 2), 0);
                } else if (img.width === img.height) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                } else {
                    canvas.height = img.width;
                    canvas.width = img.width;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, -((img.height - img.width) / 2));
                }
                const dataURL = canvas.toDataURL("image/jpeg");
                this.imageBuffer = dataURL
            }
            img.src = url;
        }
    }
}
</script>

<style scoped>
.root {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.h-stack {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    min-height: 120px;
}

.button-base {
    border-radius: 0.5rem;
    transition-duration: 0.3s;
    padding: 0.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.button-base:hover {
    background: var(--color-background-mute);
    transition-duration: 0.3s;
}

input[type="file"] {
    display: none;
}

input[type="text"] {
    width: 200px;
    padding: 0.5rem;
    border: thin solid var(--color-border);
    border-radius: 0.5rem;
    background-color: var(--color-background-mute);
    color: var(--color-text);
    caret-color: var(--color-text);
}

input[type="text"]:focus {
    outline: none !important;
    border: thin solid var(--color-border) !important;
    background-color: var(--color-background-mute) !important;
}

.content-pane {
    background-color: var(--color-background-soft);
    min-width: 80%;
    margin-top: 1rem;
    border-radius: 0.5rem;
    padding: 1rem;
    padding-top: 0.5rem;
    font-size: larger;
    font-weight: 400;

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

img {
    width: 100px;
    height: 100px;
    border-radius: 0.5rem;
    border: solid thin var(--color-border);
}

.playlist-title {
    font-size: x-large;
    font-weight: 500;
    width: 100% !important;
}
</style>