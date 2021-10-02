import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit {
  email: string;

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  sendPasswordReset() {
    try {
      this.authService.passwordReset(this.email);
      this.presentToast(
        'Se existe uma conta com esse e-mail será enviado um link para redefinir a senha',
        'success'
      );
      this.dismissModal();
    } catch (error) {
      this.presentToast(error, 'danger');
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000,
    });
    return toast.present();
  }
}
