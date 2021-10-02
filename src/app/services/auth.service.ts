import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { take } from 'rxjs/operators';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: AngularFireAuth) {}

  login(user: User) {
    return this.auth.signInWithEmailAndPassword(user.email, user.password);
  }

  register(user: User) {
    return this.auth.createUserWithEmailAndPassword(user.email, user.password);
  }

  logout() {
    return this.auth.signOut();
  }

  getAuth() {
    return this.auth;
  }

  passwordReset(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }
}
