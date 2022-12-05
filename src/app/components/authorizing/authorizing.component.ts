import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyAuthService } from 'src/app/core/services/spotifyAuth';

@Component({
  selector: 'app-authorizing',
  templateUrl: './authorizing.component.html',
  styleUrls: ['./authorizing.component.css']
})
export class AuthorizingComponent implements AfterViewInit {

  constructor(
    private router: Router,
    private spotifyAuthService: SpotifyAuthService
  ) { }

  ngAfterViewInit(): void {
    this.spotifyAuthService.authorized();
  }

}
