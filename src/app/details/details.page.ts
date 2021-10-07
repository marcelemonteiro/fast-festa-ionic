import { User } from './../interfaces/user';
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ModalController,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnDestroy, OnInit {
  @ViewChild('input', { static: true }) input: ElementRef;
  @Input() idProduto: any;
  @Input() cartItemId: any;
  @Input() title: any;
  @Input() image: any;
  @Input() shop: any;
  @Input() price: any;
  @Input() quantidade: any;
  @Input() description: any;
  @Input() usuario: any;
  private cartSubscription: Subscription;
  private cart = [];
  private loading: any;

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private toastController: ToastController,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.getCart();
  }

  async getCart() {
    this.cartSubscription = this.cartService
      .getCart()
      .pipe(take(1))
      .subscribe((data) => {
        this.cart = data.filter((c) => c.usuario === this.usuario);
      });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  async addToCart() {
    const isDuplicateId = this.cart.some((item) => item[this.idProduto]);
    const quantidade = this.input.nativeElement.value;
    this.presentLoading();
    try {
      if (isDuplicateId) {
        await this.cartService.updateCart(
          this.idProduto,
          this.cartItemId,
          this.usuario,
          quantidade
        );
        this.presentToast('Produto atualizado adicionado ao carrinho');
        this.modalController.dismiss();
        this.dismissLoader();
      } else {
        await this.cartService.addProductToCart(
          this.idProduto,
          quantidade,
          this.usuario
        );
        this.presentToast('Produto adicionado ao carrinho');
        this.modalController.dismiss();
        this.dismissLoader();
      }
    } catch (error) {
      this.presentToast('Não foi possível adicionar ao carrinho');
      console.log(error);
      this.modalController.dismiss();
    }
    this.dismissLoader();
  }

  presentToast(message: string) {
    this.toastController
      .create({ message, duration: 1000, position: 'top', color: 'dark' })
      .then((toast) => toast.present());
  }

  presentLoading() {
    this.loadingController.create().then((res) => {
      res.present();
    });
  }

  dismissLoader() {
    this.loadingController
      .dismiss()
      .then((response) => {
        console.log('Loader closed!', response);
      })
      .catch((err) => {
        console.log('Error occured : ', err);
      });
  }

  addQuantidade() {
    ++this.input.nativeElement.value;
  }

  removeQuantidade() {
    if (this.input.nativeElement.value === '1') {
      return;
    }
    --this.input.nativeElement.value;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
