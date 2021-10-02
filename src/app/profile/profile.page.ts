import { User } from './../interfaces/user';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonInput,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content: IonContent;
  user: User = {};
  isEditing: boolean;
  private userId: string;
  private currentUserUid: string;
  private userUidSubscription: Subscription;
  private userInfoSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingController: LoadingController
  ) {
    this.isEditing = false;
  }

  ngOnInit() {
    this.getCurrentUserUid();
    this.getUserInfo();
  }

  ngOnDestroy() {
    this.userUidSubscription.unsubscribe();
    this.userInfoSubscription.unsubscribe();
  }

  // Recebe o uid do usuário logado
  getCurrentUserUid() {
    this.userUidSubscription = this.authService
      .getAuth()
      .authState.subscribe((res) => {
        if (res) {
          this.currentUserUid = res.uid;
          console.log('usuario logado ->', this.currentUserUid);
        }
      });
  }

  //
  getUserInfo() {
    this.userInfoSubscription = this.userService.getUsers().subscribe((res) => {
      const filtered = res.filter((user) => {
        if (user.uid === this.currentUserUid) {
          return user;
        }
      });
      [this.user] = filtered;
      console.log(this.user);
    });
  }

  async updateUser() {
    await this.presentLoading();

    try {
      await this.userService.updateUser(this.user);
      this.dismissLoader();
      this.cancelEditing();
    } catch (error) {
      console.log(error);
      this.presentToast(error.message, 'danger');
      this.dismissLoader();
    }
  }

  async logout() {
    await this.presentLoading();
    try {
      await this.authService.logout();
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

  setIsEditing() {
    this.isEditing = true;
    this.scrollToTop();
  }

  cancelEditing() {
    this.isEditing = false;
    this.scrollToTop();
  }

  scrollToTop() {
    this.content.scrollToTop();
  }

  changeUserGender(gender) {
    this.user.genero = gender;
    console.log(this.user.genero);
  }
}
