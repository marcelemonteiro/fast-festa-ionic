import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RegisterPage } from '../register/register.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  async presentModalRegister() {
    const modal = await this.modalController.create({
      component: RegisterPage
    });
    modal.present();
  }
}
