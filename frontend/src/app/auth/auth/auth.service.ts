import { Injectable } from  '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { switchMap, tap } from  'rxjs/operators';
import { Observable, BehaviorSubject, from } from  'rxjs';

import { Storage } from  '@ionic/storage';
import { User } from  '../../shared/user';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

const ACCESS_TOKEN_KEY = 'my-access-token';
const REFRESH_TOKEN_KEY = 'my-refresh-token';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  currentAccessToken = null;
  url = environment.api_url;
 
  constructor(private http: HttpClient, private router: Router,  private  storage:  Storage) {
    this.loadToken();
  }
 
  // Load accessToken on startup
  async loadToken() {
    const token = await this.storage.get("ACCESS_TOKEN_KEY");    
    if (token && token.value) {
      this.currentAccessToken = token.value;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }
 
  // Get our secret protected data
  getSecretData() {
    return this.http.get(`${this.url}/users/secret`);
  }
 
  // Create new user
  signUp(credentials: {email, password}): Observable<any> {
    return this.http.post(`${this.url}/users`, credentials);
  }
 
  // Sign in a user and store access and refres token
  login(credentials: {email, password}): Observable<any> {
    return this.http.post(`${this.url}/auth/login`, credentials).pipe(
      switchMap((tokens: {accessToken, refreshToken }) => {
        this.currentAccessToken = tokens.accessToken;
        const storeAccess = this.storage.set("ACCESS_TOKEN_KEY", tokens.accessToken);
        const storeRefresh = this.storage.set("REFRESH_TOKEN_KEY", tokens.refreshToken);
        return from(Promise.all([storeAccess, storeRefresh]));
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })
    )
  }

  logout() {
    return this.http.post(`${this.url}/auth/logout`, {}).pipe(
      switchMap(_ => {
        this.currentAccessToken = null;
        // Remove all stored tokens
        const deleteAccess = this.storage.remove("ACCESS_TOKEN_KEY");
        const deleteRefresh = this.storage.remove("REFRESH_TOKEN_KEY");
        return from(Promise.all([deleteAccess, deleteRefresh]));
      }),
      tap(_ => {
        this.isAuthenticated.next(false);
        this.router.navigateByUrl('/', { replaceUrl: true });
      })
    ).subscribe();
  }
  
  // Load the refresh token from storage
  // then attach it as the header for one specific API call
  getNewAccessToken() {
    const refreshToken = from(this.storage.get("REFRESH_TOKEN_KEY"));
    return refreshToken.pipe(
      switchMap(token => {
        if (token) {
          const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            })
          }
          return this.http.get(`${this.url}/auth/refresh`, httpOptions);
        } else {
          // No stored refresh token
          return null;
        }
      })
    );
  }
  
  // Store a new access token
  storeAccessToken(accessToken) {
    this.currentAccessToken = accessToken;
    return from(this.storage.set("ACCESS_TOKEN_KEY", accessToken));
  }

}