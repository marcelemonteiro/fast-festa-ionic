import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { User } from '../interfaces/user';
import { PasswordResetPage } from '../password-reset/password-reset.page';
import { RegisterPage } from '../register/register.page';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  userLogin: User = {};
  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  async login() {
    await this.presentLoading();
    try {
      await this.authService.login(this.userLogin);
      this.router.navigateByUrl('tabs/home');
      this.dismissLoader();
    } catch (error) {
      this.presentToast(error.message);
      console.log(error);
      this.dismissLoader();
    }
  }
  async presentRegister() {
    const modal = await this.modalController.create({
      component: RegisterPage,
    });
    await modal.present();
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

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'danger',
    });
    return toast.present();
  }

  async presentModalRegister() {
    const modal = await this.modalController.create({
      component: RegisterPage,
    });
    modal.present();
  }

  async presentModalPasswordReset() {
    const modal = await this.modalController.create({
      component: PasswordResetPage,
    });
    modal.present();
  }
}
