import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { SpotifyAuthService, TokenService } from 'src/app/core/services/spotifyAuth/index';

import { forkJoin } from 'rxjs';

import { Playlist, UserProfile } from 'src/app/core/models';

import { UserDataService } from 'src/app/core/services/userData.service';

@Component({
  selector: 'app-user-playlists',
  templateUrl: './user-playlists.component.html',
  styleUrls: ['./user-playlists.component.css']
})
export class UserPlaylistsComponent implements OnInit {

  constructor(
    private router: Router,
    private spotifyAuthService: SpotifyAuthService,
    private tokenService: TokenService,
    private userDataService: UserDataService,
  ) { }

  userProfile!: UserProfile
  playlists!: Playlist[];

  loading: boolean = true;

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth() {
    if (this.tokenService.getAccessToken !== '') {
      this.spotifyAuthService.authorized();
      this.requestUserData();
    } else {
      this.tokenService.clearToken();
      this.spotifyAuthService.authorize();
    }
  }

  requestUserData() {
    forkJoin({
      userProfile: this.userDataService.getUserInfo(),
      userPlaylists: this.userDataService.getPlaylists()
    }).subscribe(data => {
      this.userProfile = data.userProfile
      this.playlists = data.userPlaylists.items;
      this.loading = false;
    })
  }

  choosePlaylist(e: HTMLButtonElement) {
    // haal playlist id op uit id van html button
    const playListId = e.id.split(';')[0];

    // zoek playlist met id en pass die via route state data mee zodat data niet opnieuw gefetched hoeft te worden
    const clickedPlaylist = this.playlists.filter(playlist => playlist.id === playListId)[0];

    this.router.navigateByUrl(`visualize?id=${e.id}`, { state: { data: clickedPlaylist } });
  }
}
