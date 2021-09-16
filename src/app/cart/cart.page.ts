import { Component, OnDestroy } from '@angular/core';
import {
  ModalController,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/interfaces/product';
import { DetailsPage } from '../details/details.page';
import { UserService } from '../services/user.service';
import { User } from '../interfaces/user';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnDestroy {
  public products = [];
  public totalPrice: number;
  public isLoading: boolean;
  public cart = [];
  public loader: any;
  public user: User = {};
  private cartSubscription: Subscription;
  private productsSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private cartService: CartService,
    private toastCtrl: ToastController,
    private router: Router,
    private modalCtrl: ModalController,
    private loadingController: LoadingController
  ) {
    this.loadCart();
    this.isLoading = true;
  }

  ngOnInit() {
    this.userService
      .getCurrentUser()
      .pipe(take(1))
      .subscribe((res) => {
        [this.user] = res;
        console.log(this.user);
      });
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

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
    this.productsSubscription.unsubscribe();
  }

  async loadCart() {
    await this.presentLoading();
    this.cartSubscription = await this.cartService
      .getCart()
      .subscribe((data) => {
        this.cart = data;
        console.log(this.cart);
        this.loadProducts();
        this.dismissLoader();
      });
  }

  loadProducts() {
    this.productsSubscription = this.productService
      .getProducts()
      .subscribe((allProducts) => {
        const addCartProps = (p: Product) => {
          const [props] = this.cart.filter((c) => c[p.id]);
          return {
            ...p,
            quantidade: props[p.id],
            cartItemId: props.id,
            usuario: props.usuario,
          };
        };

        this.products = allProducts
          .filter((p) => this.isProductInCart(p.id))
          .map(addCartProps);
        console.log(this.products);

        this.getTotalPrice();
      });

    if (this.cart.length === 0) {
      this.isLoading = false;
    }
  }

  isProductInCart(idProduto: string) {
    const filter = this.cart.some((c) => c[idProduto]);
    return filter;
  }

  getTotalPrice() {
    const prices = this.products.map((p) => p.price * p.quantidade);
    const total = prices.reduce((previuos, current) => previuos + current, 0);
    this.totalPrice = total;
  }

  async deleteProduct(idCart: string, event: Event) {
    event.stopPropagation();
    try {
      await this.cartService.deleteProductFromCart(idCart);
    } catch (error) {
      this.presentToast('Erro ao tentar deletar');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
    });
    toast.present();
  }

  async presentLoading() {
    this.loader = await this.loadingController.create({
      cssClass: 'my-custom-class',
    });
    await this.loader.present();
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

  async presentModal(idProduto: string) {
    const [product] = this.products.filter((p) => p.id === idProduto);

    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: {
        id: product.id,
        usuario: product.usuario,
        title: product.title,
        image: product.image,
        shop: product.shop,
        price: product.price,
        quantidade: product.quantidade,
        description: product.description,
      },
    });
    modal.present();
  }

  goToDetails(idProduto: string) {
    this.router.navigateByUrl(`/details/${idProduto}`);
  }
}
