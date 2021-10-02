import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ModalController,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
// Services
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from '../services/user.service';
// Interfaces
import { Product } from 'src/app/interfaces/product';
import { User } from '../interfaces/user';
// Pages
import { DetailsPage } from '../details/details.page';
import { take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit, OnDestroy {
  productList: any[];
  cartList: any[];
  currentUserUid: string;
  totalPrice: number;
  isLoading: boolean;
  loader: any;
  cartSubscription: Subscription;
  productsSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private toastCtrl: ToastController,
    private router: Router,
    private modalCtrl: ModalController,
    private loadingController: LoadingController
  ) {
    this.isLoading = true;
  }

  ngOnInit() {
    // Recebe o uid do usuário logado
    this.getCurrentUserUid();

    // Carrega o carrinho
    this.loadCart();
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
    this.productsSubscription.unsubscribe();
  }

  getCurrentUserUid() {
    this.authService.getAuth().authState.subscribe((res) => {
      if (res) {
        this.currentUserUid = res.uid;
      }
    });
  }

  async loadCart() {
    await this.presentLoading();

    try {
      this.cartSubscription = this.cartService.getCart().subscribe((res) => {
        this.cartList = res.filter(
          (cart) => cart.usuario === this.currentUserUid
        );
        this.dismissLoader();
        this.loadProducts();
      });
    } catch (error) {
      console.log(error);
      this.dismissLoader();
    }
  }

  // Carrega os produtos que estão dentro do carrinho
  loadProducts() {
    this.productsSubscription = this.productService
      .getProducts()
      .subscribe((allProducts) => {
        const addCartProps = (p: Product) => {
          const [props] = this.cartList.filter((c) => c[p.id]);
          return { ...p, quantidade: props[p.id], cartItemId: props.id };
        };

        this.productList = allProducts
          .filter((p) => this.isProductInCart(p.id))
          .map(addCartProps);

        this.getTotalPrice();
      });

    if (this.cartList.length === 0) {
      this.isLoading = false;
    }
  }

  // Verifica se o produto está no carrinho
  isProductInCart(idProduto: string) {
    const filter = this.cartList.some((c) => c[idProduto]);
    return filter;
  }

  // Calcula o preço total da compra
  getTotalPrice() {
    const prices = this.productList.map((p) => p.price * p.quantidade);
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
    const [product] = this.productList.filter((p) => p.id === idProduto);
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: {
        idProduto: product.id,
        cartItemId: product.cartItemId,
        usuario: this.currentUserUid,
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

  doRefresh(event: any) {
    console.log('Begin async operation');

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }
}
