<template>
    <div class="root" v-if="access_token">
        <div class="h-stack">
            <div class="user-button" v-if="user" @click="openUserProfile">
                <img class="user-image" :src="user.images[0].url" v-if="user.images[0].url" />
                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" viewBox="0 0 16 16"
                    v-else>
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path fill-rule="evenodd"
                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                </svg>
                <span class="user-name">{{ user.display_name }}</span>
            </div>
            <input type="text" class="url-input" placeholder="URL to Apple Music Playlist" ref="url">
            <div class="button-base" @click="fetchAndParsePlaylist">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path
                        d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
                    <path
                        d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z" />
                </svg>
            </div>
            <div class="button-base" @click="postDataToSpotify" :disabled="posting">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                        d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
                    <path fill-rule="evenodd"
                        d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z" />
                </svg>
            </div>
            <div class="button-base" @click="toggleImageModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                    <path
                        d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
                </svg>
            </div>
        </div>
        <span v-if="fetching">Retrieving and parsing data</span>
        <div class="content-pane" v-if="playlist && playlist.title !== null && playlist.title !== undefined">
            <input type="text" class="playlist-title" v-model="playlist.title" placeholder="Playlist name">
            <div v-for="item in playlist.tracks">
                <input type="checkbox" v-model="item.check">
                {{ item.title }} by {{ item.artist }}
            </div>
        </div>
    </div>

    <div ref="image-modal" class="hidden" @click="toggleImageModal">
        <div class="modal-content" v-on:click.stop>
            <div class="top-bar">
                <h3>Select Playlist Image</h3>
                <div class="button-base" style="margin-left: auto" @click="toggleImageModal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                        viewBox="0 0 16 16">
                        <path
                            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                </div>
            </div>
            <div class="image-button-wrapper">
                <input type="file" ref="imageSelector" @change="selectedButton">
                <div class="button-base" @click="getRandomImage">Retrieve random image</div>
            </div>
            <div class="image-wrapper">
                <img class="cover-image" :src="imageBuffer" v-if="imageBuffer">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            access_token: null,
            playlist: null,
            fetching: false,
            posting: false,
            imageBuffer: null,
            user: null
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
                fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': 'Bearer ' + this.access_token
                    }
                }).then(res => {
                    console.log(res.status);
                    if (res.status !== 200) {
                        this.$cookies.remove('access_token')
                        location.href = "https://lumine.oryfox.de/"
                    } else {
                        res.json().then(data => {
                            this.user = data
                        })
                    }
                })
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
            this.playlist = {}
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
                const mimeType = this.imageBuffer.split(',')[0].split(':')[1].split(';')[0]
                console.log(mimeType);
                let res = await fetch(base + "/v1/playlists/" + playlist.id + "/images", {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer ' + this.access_token,
                        'Content-Type': mimeType
                    },
                    body: this.imageBuffer.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")
                })
                console.log(await res.text());
            }

            //Allow button to be clicked again
            this.posting = false
            //Reset playlist
            this.playlist = null
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
        },
        async toggleImageModal() {
            this.$refs["image-modal"].classList.toggle("imageModal");
        },
        async openUserProfile() {
            window.open("https://open.spotify.com/user/" + this.user.id, "_blank")
        },
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

input[type="file"]::-webkit-file-upload-button {
    border-radius: 0.5rem;
    transition-duration: 0.3s;
    padding: 0.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: var(--color-text);
    background: none;
    border: none;
}

input[type="file"]::-webkit-file-upload-button:hover {
    background: var(--color-background-soft);
    transition-duration: 0.3s;
}

.url-input {
    width: 200px;
    padding: 0.5rem;
    border: thin solid var(--color-border);
    border-radius: 0.5rem;
    background-color: var(--color-background-mute);
    color: var(--color-text);
    caret-color: var(--color-text);
    height: 45px;
    font-size: 0.9rem;
    flex: 1;
}

.playlist-title:focus,
.url-input:focus {
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

.image-wrapper {
    display: flex;
    overflow: hidden;
    border-radius: 0.5rem;
    width: 300px;
    height: 300px;
    justify-content: center;
    align-items: center;
    background-color: var(--color-background-soft);
}

.cover-image {
    height: 100%;
    border-radius: 0.5rem;
    border: solid thin var(--color-border);
}

.user-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
}

.user-image {
    height: 45px;
    width: auto;
    border-radius: 50%;
    transform: scale(1);
    transition-duration: 300ms;
}

.user-name {
    font-weight: 600;
}

.user-image:hover {
    transform: scale(1.1);
    transition-duration: 300ms;
}

.playlist-title {
    padding: 0.5rem;
    border: thin solid var(--color-border);
    border-radius: 0.5rem;
    background-color: var(--color-background-mute);
    color: var(--color-text);
    caret-color: var(--color-text);
    height: 45px;

    font-size: x-large;
    font-weight: 500;
    width: 100% !important;
}

.hidden {
    display: none;
}

.imageModal {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(10px) brightness(1.3);
    -webkit-backdrop-filter: blur(10px) brightness(1.3);

    justify-content: center;
    padding-top: 10%;
}

.modal-content {
    background-color: var(--color-background-mute);
    position: relative;
    width: 768px;
    border-radius: 0.5rem;
    border: solid thin var(--color-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 2rem;
    margin-bottom: auto;
}

.modal-content .top-bar {
    background-color: var(--color-background-soft);
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.5rem;
    border-bottom: solid thin var(--color-border);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    width: 100%;
}

.image-button-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    min-height: 3rem;
    padding: 0 1rem;
}

.image-button-wrapper .button-base:hover {
    background: var(--color-background-soft);
    transition-duration: 0.3s;
}

.image-button-wrapper input[type="file"] {
    flex: 1;
}
</style>