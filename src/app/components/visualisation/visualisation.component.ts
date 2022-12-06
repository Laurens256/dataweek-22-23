import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, ViewEncapsulation } from '@angular/core';

import { UserDataService } from 'src/app/core/services/userData.service';
import { TokenService, SpotifyAuthService } from 'src/app/core/services/spotifyAuth';
import { TooltipService } from 'src/app/core/services/tooltip.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

import { Playlist, Track } from 'src/app/core/models';

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
    console.log(this.trackDates);

    const startYear = Math.floor(this.trackDates[0].year / 10) * 10;
    const endYear = Math.ceil(this.trackDates[this.trackDates.length - 1].year / 10) * 10;

    for (let i = startYear; i <= endYear; i += this.yearStep) {
      this.yearRange.push(i);
    }
    this.loading = false;
  }

  generateIndividualYears() {
    // maakt een lijst van alle unieke jaren in de playlist
    this.trackDates.forEach(date => this.individualYears.push(date.year));
    this.individualYears = [...new Set(this.individualYears)];
  }

}
