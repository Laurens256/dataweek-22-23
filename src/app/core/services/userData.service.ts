import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Track, Playlist, UserProfile } from '../models';

@Injectable()
export class UserDataService {

  userProfileUri = 'https://api.spotify.com/v1/me';
  userPlaylistsUri = 'https://api.spotify.com/v1/me/playlists'
  playlistTracksUri = 'https://api.spotify.com/v1/playlists';


  constructor(
    private http: HttpClient,
  ) { }

  getUserInfo() {
    // get user profile
    return this.http.get<UserProfile>(this.userProfileUri)
  }

  getPlaylists() {
    // get user playlists
    return this.http.get<{ items: Playlist[] }>(this.userPlaylistsUri)
  }

  async getPlaylistTracks(button_id: string, hasPlaylist?: boolean) {
    const playlist_id = button_id.split(';')[0];
    const playlist_total = parseInt(button_id.split(';')[1]);
    let allTracks: Track[] = [];
    let allTrackIds: string[] = [];

    let playlist;
    if (!hasPlaylist) {
      //if playlist wasn't passed via route change (on reload), fetch playlist data
      playlist = await firstValueFrom(this.http.get<Playlist>(`${this.playlistTracksUri}/${playlist_id}`));
    }

    //loop omdat request limit 100 is, daarom maken we meerdere requests wanneer playlist > 100
    for (let i = 0; i < playlist_total / 100; i++) {
      const songs = await firstValueFrom(this.http.get<{ items: { track: Track, is_local: boolean }[] }>(`${this.playlistTracksUri}/${playlist_id}/tracks?offset=${i * 100}`));
      songs.items.forEach(song => {
        //check of song geen lokaal bestand is of een podcast
        if (song.is_local === false && song.track != null && song.track.type === 'track') {
          allTracks.push(song.track);
          allTrackIds.push(song.track.id);
        }
      })
    }

    // sorteer op release date
    allTracks.sort((a, b) => +new Date(a.album.release_date) - +new Date(b.album.release_date))

    //als playlist opnieuw was opgehaald, return die. Anders return die niet
    if(playlist != null) {
      return { playlist: playlist, allTracks: allTracks, allTrackIds: allTrackIds };
    } else {
      return { allTracks: allTracks, allTrackIds: allTrackIds };
    }
  }

}
