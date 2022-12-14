import { AfterContentChecked, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { UserDataService } from 'src/app/core/services/userData.service';
import { TokenService, SpotifyAuthService } from 'src/app/core/services/spotifyAuth';
import { ActivatedRoute, Router } from '@angular/router';
import { achtergrond_1950, achtergrond_1960, achtergrond_1970, achtergrond_1980, achtergrond_1990, achtergrond_2000, achtergrond_2010, achtergrond_2020 } from 'src/assets/backgrounds';

import { Playlist, Track } from 'src/app/core/models';

let mainElement!: HTMLElement;
let timelineParts: NodeListOf<HTMLElement>;
@Component({
    selector: 'app-visualisation',
    templateUrl: './visualisation.component.html',
    styleUrls: ['./visualisation.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class VisualisationComponent implements OnInit, AfterContentChecked, OnDestroy {

    loading: boolean = true;
    hasPlaylist: boolean = false;
    popupOpen: boolean = false;

    playlist!: Playlist;

    playlistTracks: Track[] = [];
    playlistTrackIds: string[] = [];

    trackDates: {
        year: number,
        month: number,
        day: number,
    }[] = []
    yearRange: number[] = [];
    yearStep = 10;

    individualYears: number[] = [];

    selectedYear = new Date().getFullYear();

    randomSongsInRange: {
        range: number,
        year: number,
        name: string,
        artist: string,
        img: string,
        preview_url: string,
        album: string,
        date: string
    }[] = [];

    songsPerYear: any = {};

    songsInRange: any = {};

    allBackgrounds: {} = {
        achtergrond_1950: achtergrond_1950,
        achtergrond_1960: achtergrond_1960,
        achtergrond_1970: achtergrond_1970,
        achtergrond_1980: achtergrond_1980,
        achtergrond_1990: achtergrond_1990,
        achtergrond_2000: achtergrond_2000,
        achtergrond_2010: achtergrond_2010,
        achtergrond_2020: achtergrond_2020,
    };


    constructor(
        private tokenService: TokenService,
        private spotifyAuthService: SpotifyAuthService,
        private userDataSvc: UserDataService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        if (this.tokenService.getAccessToken == '') {
            this.tokenService.clearToken();
            this.spotifyAuthService.authorize();
            return;
        }
        //check of playlist uit route change wordt meegegeven zodat we die later niet hoeven requesten
        //history state is niet beschikbaar na reload
        if (history.state.data) {
            this.playlist = history.state.data;
            this.hasPlaylist = true;
        }
        const id: string = this.route.snapshot.queryParamMap.get('id')!;
        this.getPlaylistTracks(id);
    }

    albumSet: boolean = false;
    ngAfterContentChecked() {
        // zet 1 keer als de pagina laadt een random album cover, veel te ingewikkeld maar het werkt
        if (this.albumSet) return;
        const albums = document.querySelectorAll('.album');
        for (let i = 0; i < albums.length; i++) {
            if (albums[i]) {
                const year = albums[i].id.substring(5, 9);
                if (this.songsInRange[year]) {
                    const randomSong = this.songsInRange[year][Math.floor(Math.random() * this.songsInRange[year].length)];
                    albums[i].setAttribute('href', randomSong.img);
                    this.randomSongsInRange[i] = randomSong;
                    if (i == albums.length - 1) {
                        this.albumSet = true;
                        timelineParts = document.querySelectorAll('.timelinepart');
                    }
                }
            }
        }
    }

    ngOnDestroy(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    async getPlaylistTracks(id: string) {
        const playlistLength = parseInt(id.split(';')[1]);
        const loader: HTMLElement = document.querySelector("div.loader > div")!;
        // Laat alleen laad animatie zien als playlist langer is dan 100 tracks of laden langer duurt dan 500ms
        if(playlistLength > 200) {
            loader.classList.add('loader-long');
        } else {
            setTimeout(() => {
                loader.classList.add('loader-long');
            }, 500);
        }

        //hasplaylist boolean geeft aan of extra info playlist nog moet worden aangevraagd (name, img etc.)
        const data = await this.userDataSvc.getPlaylistTracks(id, this.hasPlaylist);
        //als hasplaylist false wordt meegegeven, wordt in data .playlist extra meegegeven
        if (data.playlist != null) this.playlist = data.playlist;
        this.playlistTracks = data.allTracks;
        this.playlistTrackIds = data.allTrackIds;

        // console.log(this.playlistTracks)

        this.generateTracksInRange();
        this.calcTimelineSize();
        this.generateIndividualYears();
    }

    generateTracksInRange() {
        this.playlistTracks.forEach(track => {
            const date = track.album.release_date;
            const year = +date.substring(0, 4);
            const yearDecennium = Math.floor(year / 10) * 10;

            if (this.songsInRange[yearDecennium] == null) {
                this.songsInRange[yearDecennium] = [];
            }
            if (this.songsPerYear[year] == null) {
                this.songsPerYear[year] = [];
            }
            this.songsInRange[yearDecennium].push({
                name: track.name,
                artist: track.artists[0].name,
                img: track.album.images[0].url,
                preview_url: track.preview_url,
                year: year,
                date: date,
                range: yearDecennium,
                album: track.album.name,
            });

            this.songsPerYear[year].push({
                name: track.name,
                artist: track.artists[0].name,
                img: track.album.images[0].url,
                preview_url: track.preview_url,
                year: year,
                date: date,
                range: yearDecennium,
                album: track.album.name,
            });

            this.randomSongsPreviewObj[yearDecennium] = this.songsInRange[yearDecennium].filter((track: any) => track.preview_url != null);
        });
    }

    multiply: number = 1;
    calcTimelineSize() {
        this.playlistTracks.forEach(track => {
            const date = track.album.release_date;
            this.trackDates.push({ year: +date.substring(0, 4), month: +date.substring(5, 7), day: +date.substring(8, 10) });
        });

        const startYear = Math.floor(this.trackDates[0].year / 10) * 10;
        const endYear = Math.ceil(this.trackDates[this.trackDates.length - 1].year / 10) * 10;

        for (let i = startYear; i + this.yearStep <= endYear; i += this.yearStep) {
            this.yearRange.push(i);
        }
        this.prevDecennium = this.yearRange[0];
        // als het laatste decennium niet het huidige decennium is, rond dan niet af naar dit jaar + 1
        if (this.yearRange[this.yearRange.length - 1] !== Math.floor(new Date().getFullYear() / 10) * 10) {
            this.yearRange[this.yearRange.length] = this.yearRange[this.yearRange.length - 1] + 10;
        } else {
            // berekent percentage van het laatste vak van de tijdlijn als deze eindigt in deze eeuw
            // krijgt het laatste nummer van het jaar (bv. 2023 -> 3) en deelt door 10 voor multiplier
            this.multiply = 10 / Number(String(new Date().getFullYear() + 1).slice(-1));
            this.yearRange[this.yearRange.length] = new Date().getFullYear() + 1;
        }

        this.loadScrollLogic();
    }

    generateIndividualYears() {
        // maakt een lijst van alle unieke jaren in de playlist
        this.trackDates.forEach(date => this.individualYears.push(date.year));
        this.individualYears = [...new Set(this.individualYears)];
        this.selectedYear = this.individualYears[0];
    }

    loadScrollLogic(): void {
        mainElement = document.querySelector("main")!;
        this.loading = false;
        mainElement.scrollLeft = 0;

        //timeout zodat event listener pas werkt na laad animatie
        setTimeout(() => {
            mainElement.addEventListener("wheel", (e) => {
                const scrollSize = mainElement.clientWidth;
                if (!this.popupOpen) {
                    e.preventDefault();
                }
                if (this.popupOpen) return;
                if (e.deltaY > 0) {
                    mainElement.scrollLeft += scrollSize;
                } else {
                    mainElement.scrollLeft -= scrollSize;
                }
                // timeout zodat functie wordt aangeroepen zodra scrollen klaar is
                setTimeout(() => this.checkViewport(), 500);
            });

            const evt = new WheelEvent('wheel', { deltaY: 0 });
            mainElement.dispatchEvent(evt);
        }, 6500);

        // setTimeout(() => {
        //     const evt = new WheelEvent('wheel', { deltaY: 0 });
        //     mainElement.dispatchEvent(evt);
        // }, 3500);
    }

    prevDecennium: number = 0;
    checkViewport() {
        timelineParts.forEach(part => {
            // check of element in viewport is
            const year = parseInt(part.id.substring(5, 9));
            const rect = part.getBoundingClientRect();
            if (rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth)) {
                const arr = Array.from(timelineParts);
                if (arr.indexOf(part) == arr.length - 1) return;
                clearInterval(this.interval);
                this.prevDecennium = Math.floor(year / 10) * 10;
                this.cycleRandomSong(part.id);
                this.playRandomSongInRange(Math.floor(year / 10) * 10);
            }
        });
    }

    loadBackground(year: number, isLast: boolean) {
        type key = keyof typeof this.allBackgrounds;
        if (isLast === true || this.allBackgrounds[`achtergrond_${year as key}`] == undefined) {
            return '';
        } else {
            return this.allBackgrounds[`achtergrond_${year as key}`];
        }
    }

    prevRandomSong: {}[] = [];
    interval!: ReturnType<typeof setInterval>;
    cycleRandomSong(id: string) {
        const year = parseInt(id.substring(5, 9));
        const index = this.yearRange.indexOf(year);
        if (this.songsInRange[year] == null) return;

        // cycled door alle songs in een decennium heen, als een playlist meer dan 1 nr uit een decennium bevat wordt er een random nr gekozen wat anders is dan de vorige
        const albumCover: SVGImageElement = document.querySelector(`#album${year}`)!;

        //heel messy maar interval doet lastig en ik heb hoofdpijn
        this.interval = setInterval(() => {
            if (this.prevDecennium == Math.floor(year / 10) * 10) {
                this.randomSongsInRange[index] = this.songsInRange[year][Math.floor(Math.random() * this.songsInRange[year].length)];
                if (albumCover != null && this.randomSongsInRange[index] != null) {
                    if (this.songsInRange[year].length > 1) {
                        while (this.prevRandomSong.includes(this.randomSongsInRange[index])) {
                            this.randomSongsInRange[index] = this.songsInRange[year][Math.floor(Math.random() * this.songsInRange[year].length)];
                        }
                        this.prevRandomSong[index] = this.randomSongsInRange[index];
                        albumCover.setAttribute('href', this.randomSongsInRange[index].img);
                    }
                }
            }
        }, 3500)
    }

    randomSongsPreviewObj: any = {};
    randomSongPreview: string = '';
    randomSongCurrentRange: number = 0;
    playRandomSongInRange(range: number | string, prev?: boolean) {
        if (typeof range === 'string') range = parseInt(range);
        const audio: HTMLAudioElement = document.querySelector('audio')!;
        this.randomSongCurrentRange = range;

        if (audio.id == range.toString() && !prev) {
            return;
        } else if (this.randomSongsPreviewObj[range] == null) {
            audio.pause();
        } else {
            //als decennium meer dan 1 nr heeft wordt altijd een ander nummer gekozen dan de vorige
            let randomSong = this.randomSongsPreviewObj[range][Math.floor(Math.random() * this.randomSongsPreviewObj[range].length)].preview_url;
            if (this.songsInRange[range].length > 1) {
                while (randomSong == this.randomSongPreview) {
                    randomSong = this.songsInRange[range][Math.floor(Math.random() * this.randomSongsPreviewObj[range].length)].preview_url;
                }
            }
            this.randomSongPreview = randomSong;
            audio.load();
            audio.play();
        }
    }

    currYear: string = '';
    // open popup met alle nrs uit gekozen jaar
    selectYear(target: HTMLElement, id?: string) {
        if (id != this.currYear && id != undefined) {
            this.selectedYear = parseInt(id.substring(4, 8))
            this.currYear = id;
            target.classList.add('active');
            this.popupOpen = true;
            return;
        }
        target.classList.toggle('active');
        if (target.classList.contains('active')) {
            this.popupOpen = true;
        } else {
            this.popupOpen = false;
        }
    }

    backPage() {
      this.router.navigateByUrl('/home');
    }

}
