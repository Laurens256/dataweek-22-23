import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';

//services
import { SpotifyAuthService, AuthGuard, TokenService, SpotifyAuthInterceptor }
from './core/services/spotifyAuth/index';
import { TooltipService } from './core/services/tooltip.service';
import { UserDataService } from './core/services/userData.service';
import { YearTracksAmountPipe } from './core/pipes/year-tracks-amount.pipe';
import { SafePipe } from './core/pipes/safe.pipe';


@NgModule({
  declarations: [
    AppComponent,
    //alle routing components in 1 variabele
    routingComponents,
    YearTracksAmountPipe,
    SafePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    SpotifyAuthService,
    AuthGuard,
    TokenService,

    TooltipService,

    UserDataService,
    [{
      provide:  HTTP_INTERCEPTORS,
      useClass:  SpotifyAuthInterceptor,
      multi:  true
    }]],
  bootstrap: [AppComponent]
})
export class AppModule { }
