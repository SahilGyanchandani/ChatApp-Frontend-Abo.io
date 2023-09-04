import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { LoginServiceService } from 'src/app/Services/login-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { GoogleService } from 'src/app/Services/google.service';
import { ExternalAuthDto } from 'src/app/Models/GoogleLogin.model';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  faLock = faLock;
  tittle = 'Login Form';
  regisform!: FormGroup
  submitted = false;
  errorMessage: string | null = null;
  loggedIn: any;
  user?: SocialUser;
  showError: boolean | undefined;
  body: ExternalAuthDto[] = [];
  isLogging: boolean | undefined;



  constructor(private logService: LoginServiceService, private route: Router, private formBuilder: FormBuilder,
    private authService: SocialAuthService, private googleService: GoogleService) { }

  ngOnInit() {
    this.regisform = this.formBuilder.group({

      userNameOrEmailAddress: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(5)]],

      //validations
    })

    this.authService.authState.subscribe((user: SocialUser) => {
      this.user = user;
      console.log(this.user);

    })

    this.externalLogin();
  }


  onSubmit() {
    this.submitted = true

    if (this.regisform.invalid) {
      throw new Error("Please Enter Valid Values");
    }
    console.log(this.regisform.value);

    this.logService.onSubmit(this.regisform.value).subscribe(res => {
      console.log('res', res);
      console.log(this.regisform.value);

      localStorage.setItem('token', res.access_token);
      this.route.navigateByUrl('/userlist');
    },
      (error: HttpErrorResponse) => {
        console.log(error); // Log the error response to the console

        if (error.error.error_description) {
          this.errorMessage = error.error.error_description;
        } else if (error.error) {
          // Display the error message to the user
          this.errorMessage = error.error;
        } else {
          this.errorMessage = 'An error occurred: ' + error.message;
        }
      }
    );
  }

  externalLogin = () => {
    this.showError = false;
    this.googleService.signInWithGoogle();
    this.googleService.extAuthChanged.subscribe(user => {
      const externalAuth: ExternalAuthDto = {
        idToken: user.idToken
      }
      this.validateExternalAuth(externalAuth);
    })
  }


  private validateExternalAuth(externalAuth: ExternalAuthDto) {
    this.googleService.externalLogin(externalAuth).subscribe({
      next: (res) => {
        // localStorage.setItem("token", res.token);
        // // console.log('res', res.token);
        this.route.navigateByUrl('/userlist');
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message;
        this.showError = true;
      }
    });
  }


}
