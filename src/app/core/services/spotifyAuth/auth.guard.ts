import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { TokenService } from './token.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private tokenService: TokenService
    ) { }

  public canActivate(url: ActivatedRouteSnapshot): boolean {
    const access_token: string = url.queryParams['access_token'];
    if (access_token) {
      this.tokenService.setAccessToken(access_token);
    }
    return !!access_token;
  }
}
