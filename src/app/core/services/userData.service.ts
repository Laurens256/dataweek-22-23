import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Track, AudioFeatures, Playlist, UserProfile } from '../models';

@Injectable()
export class UserDataService {

  userProfileUri = 'https://api.spotify.com/v1/me';
  userPlaylistsUri = 'https://api.spotify.com/v1/me/playlists'
  playlistTracksUri = 'https://api.spotify.com/v1/playlists'
  playlistTrackFeaturesUri = 'https://api.spotify.com/v1/audio-features?ids='


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

    //als playlist opnieuw was opgehaald, return die. Anders return die niet
    if(playlist != null) {
      return { playlist: playlist, allTracks: allTracks, allTrackIds: allTrackIds };
    } else {
      return { allTracks: allTracks, allTrackIds: allTrackIds };
    }
  }

  async getAudioFeatures(ids: string[] | string) {
    // haalt audio features van alle songs op, weer een loop vanwege de limit
    let allAudioFeatures: AudioFeatures[] = [];
    for (let i = 0; i < ids.length / 100; i++) {
      //sliced iedere keer 100 ids voor 1 http request
      let idsLimit: string[] | string | {}[] = ids.slice(i * 100, i * 100 + 100);
      if (typeof idsLimit !== 'string') {
        idsLimit = idsLimit.join(',');
      }

      const songs = await firstValueFrom(this.http.get<{ audio_features: AudioFeatures[] }>(`${this.playlistTrackFeaturesUri}${idsLimit}`));

      songs.audio_features.forEach((song) => allAudioFeatures.push(song));
    }
    return allAudioFeatures;
  }

}
