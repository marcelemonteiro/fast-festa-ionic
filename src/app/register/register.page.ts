import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { User } from './../interfaces/user';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  userRegister: User = {};
  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {}

  async register() {
    console.log(this.userRegister);

    await this.presentLoading();
    try {
      await this.authService.register(this.userRegister);
      await this.userService.addUser(this.userRegister);
      await this.userService.addCurrentUser(this.userRegister);
      this.presentToast('Usuário cadastrado com sucesso', 'success');
      this.dismissLoader();
      this.modalController.dismiss();
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

  dismissModal() {
    this.modalController.dismiss();
  }
}
