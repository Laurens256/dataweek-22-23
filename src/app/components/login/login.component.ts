import { Component, OnInit } from '@angular/core';
import { SpotifyAuthService } from 'src/app/core/services/spotifyAuth/index';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(
    private spotifyAuthService: SpotifyAuthService,
  ) { }

  ngOnInit(): void {}

  spotifyLogin(): void {
    // gebruik deze function ipv een url in de link omdat deze op andere plekken ook aangeroepen wordt
    this.spotifyAuthService.authorize();
  }
}
