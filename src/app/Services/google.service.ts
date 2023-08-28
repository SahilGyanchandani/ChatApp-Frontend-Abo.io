import { Injectable } from '@angular/core';
import { SocialUser, SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Observable, Subject } from 'rxjs';
import { ExternalAuthDto } from '../Models/GoogleLogin.model';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class GoogleService {
  private authChangeSub = new Subject<boolean>();
  private extAuthChangeSub = new Subject<SocialUser>();
  public authChanged = this.authChangeSub.asObservable();
  public extAuthChanged = this.extAuthChangeSub.asObservable();

  constructor(private externalAuthService: SocialAuthService, private http: HttpClient) {
    this.externalAuthService.authState.subscribe((user) => {
      // console.log(user)
      this.extAuthChangeSub.next(user);
    })
  }

  signInWithGoogle = () => {
    this.externalAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);

  }

  externalLogin(googleUser: ExternalAuthDto): Observable<any> {
    return this.http.post<any>(`https://localhost:7277/api/UserLogin/GoogleAuthenticate`, googleUser);
  }
}

