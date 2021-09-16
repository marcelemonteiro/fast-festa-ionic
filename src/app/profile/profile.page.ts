import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { filter, take } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: User = {};
  private userId: string;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.userService
      .getCurrentUser()
      .pipe(take(1))
      .subscribe((res) => {
        [this.user] = res;
        if (this.user) {
          this.userId = this.user.id;
        }
      });

    this.getUserInfo();
  }

  getUserInfo() {
    this.userService
      .getUsers()
      .pipe(take(1))
      .subscribe((res) => {
        const filtered = res.filter((u) => {
          if (u.email === this.user.email) {
            return u;
          }
        });
        [this.user] = filtered;
        console.log(this.user);
      });
  }

  async logout() {
    await this.presentLoading();
    try {
      await this.authService.logout();
      await this.userService.removeUserFromSession(this.userId);
      this.router.navigateByUrl('login');
      this.dismissLoader();
    } catch (error) {
      this.presentToast(error.message, 'danger');
      console.log(error);
      this.dismissLoader();
    }
  }

  async presentLoading() {
    const loader = await this.loadingController.create();
    await loader.present();
  }

  async dismissLoader() {
    let topLoader = await this.loadingController.getTop();
    while (topLoader) {
      if (!(await topLoader.dismiss())) {
        break;
      }
      topLoader = await this.loadingController.getTop();
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    return toast.present();
  }
}
