import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class TokenService {

  constructor() { }

  private token = {
    access: '',
    ttl: 0
  };

  public get getAccessToken(): string {
    // kijk of token nog niet bestaat en of deze uit local storage gehaald kan worden
    if (this.token.access === '') {
      const access_ttl: string = sessionStorage.getItem('access_ttl')!;
      if (access_ttl) {
        const tokenObj: { access_token: string, ttl: number } = JSON.parse(access_ttl);
        const now = new Date();
        if (now.getTime() < tokenObj.ttl) {
          this.token.access = tokenObj.access_token;
          this.token.ttl = tokenObj.ttl;
        }
      }
    }
    return this.token.access;
  }

  public clearToken(): void {
    this.token.access = '';
    this.token.ttl = 0;
  }

  public get getAuthHeader(): { [Authorization: string]: string } {
    const now = new Date();
    if (this.token && now.getTime() < this.token.ttl) {
      return { Authorization: `Bearer ${this.token.access}` };
    } else {
      return {};
    }
  }

  public setAccessToken(access_token: string): boolean {
    if (!!access_token) {
      const now = new Date();
      this.token.access = access_token;
      this.token.ttl = now.getTime() + 3500 * 1000;

      const access_ttl = {
        access_token: access_token,
        // tijd in milliseconds voordat token expired
        ttl: now.getTime() + 3500 * 1000
      }
      sessionStorage.setItem('access_ttl', JSON.stringify(access_ttl))
    } else {
      this.clearToken();
    }
    return !!this.token;
  }

}
