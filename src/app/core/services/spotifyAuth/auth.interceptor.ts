import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, NEVER } from 'rxjs';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

@Injectable()
export class SpotifyAuthInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) { }

  public intercept(req: HttpRequest<HttpEvent<Request>>, next: HttpHandler): Observable<HttpEvent<Response>> {
    // check of authorization bestaat, anders opnieuw inloggen
    if (Object.keys(this.tokenService.getAuthHeader).length === 0) {
      alert("Your session has expired, please login again");
      this.router.navigate(['login']);
      return NEVER;
    }

    const modifiedReq: HttpRequest<HttpEvent<Request>> = req.clone({ setHeaders: this.tokenService.getAuthHeader });
    return next.handle(modifiedReq);
  }

  //Bron: https://medium.com/angular-shots/shot-3-how-to-add-http-headers-to-every-request-in-angular-fab3d10edc26
}
