import { Component, OnInit  } from '@angular/core';

import { UserDataService } from 'src/app/core/services/userData.service';
import { TokenService, SpotifyAuthService } from 'src/app/core/services/spotifyAuth';
import { TooltipService } from 'src/app/core/services/tooltip.service';
import { ActivatedRoute } from '@angular/router';

import { Playlist, Track } from 'src/app/core/models';

let mainElement!: HTMLElement;
@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.css'],
  // encapsulation: ViewEncapsulation.None,
})
export class VisualisationComponent implements OnInit {

  loading: boolean = true;
  hasPlaylist: boolean = false;
  visualisationOpen: boolean = false;

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


  constructor(
    private tokenService: TokenService,
    private spotifyAuthService: SpotifyAuthService,
    private tooltipSvc: TooltipService,
    private userDataSvc: UserDataService,
    private route: ActivatedRoute,
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

  async getPlaylistTracks(id: string) {
    //hasplaylist boolean geeft aan of extra info playlist nog moet worden aangevraagd (name, img etc.)
    const data = await this.userDataSvc.getPlaylistTracks(id, this.hasPlaylist);
    //als hasplaylist false wordt meegegeven, wordt in data .playlist extra meegegeven
    if (data.playlist != null) this.playlist = data.playlist;
    this.playlistTracks = data.allTracks;
    this.playlistTrackIds = data.allTrackIds;

    // this.getPlaylistColor(this.playlist.images[0].url);
    this.calcTimelineSize();
    this.generateIndividualYears();
  }

  calcTimelineSize() {
    this.playlistTracks.forEach(track => {
      const date = track.album.release_date;
      this.trackDates.push({ year: +date.substring(0, 4), month: +date.substring(5, 7), day: +date.substring(8, 10) });
    });

    const startYear = Math.floor(this.trackDates[0].year / 10) * 10;
    const endYear = Math.ceil(this.trackDates[this.trackDates.length - 1].year / 10) * 10;

    for (let i = startYear; i <= endYear; i += this.yearStep) {
      this.yearRange.push(i);
    }
    this.yearRange[this.yearRange.length - 1] = new Date().getFullYear() + 2;
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
    mainElement.style.backgroundImage = `url(../../../assets/achtergrond_${this.yearRange[0]}.svg)`;
    const scrollSize = mainElement.clientWidth;
    this.loading = false;
    mainElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        mainElement.scrollLeft += scrollSize;
      } else {
        mainElement.scrollLeft -= scrollSize;
      }
    });
  }

  selectYear(id: string) {
    this.selectedYear = parseInt(id.substring(4, 8));
  }

}
