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
// Interfaces
import { Product } from 'src/app/interfaces/product';
// Pages
import { DetailsPage } from '../details/details.page';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit, OnDestroy {
  productList: Product[];
  cartList: any[];
  totalPrice: number;
  isLoading: boolean;
  private currentUserUid: string;
  private cartSubscription: Subscription;
  private productsSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private toastCtrl: ToastController,
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
        const filterByUser = (cart: any) =>
          cart.usuario === this.currentUserUid;
        this.cartList = res.filter(filterByUser);
        this.dismissLoader();
        this.loadProducts();
      });
    } catch (error) {
      this.presentToast(error, 'danger');
      this.dismissLoader();
    }
  }

  // Carrega os produtos que estão dentro do carrinho
  loadProducts() {
    this.productsSubscription = this.productService
      .getProducts()
      .subscribe((allProducts) => {
        const addCartProps = (p: Product) => {
          const [props] = this.cartList.filter((c) => c.produto == p.id);
          return { ...p, quantidade: props.quantidade, cartItemId: props.id };
        };

        this.productList = allProducts
          .filter((p) => this.isProductInCart(p.id))
          .map(addCartProps);

        // Calcula o preço total da compra
        this.getTotalPrice();
      });

    if (this.cartList.length === 0) {
      this.isLoading = false;
    }
  }

  // Verifica se o produto está no carrinho
  isProductInCart(idProduto: string) {
    const filter = this.cartList.some((c) => c.produto == idProduto);
    return filter;
  }

  // Calcula o preço total da compra
  getTotalPrice() {
    const prices = this.productList.map((p) => p.price * p.quantidade);
    const total = prices.reduce((previuos, current) => previuos + current, 0);
    this.totalPrice = total;
  }

  async removeProduct(idCart: string, event: Event) {
    event.stopPropagation();
    try {
      this.presentToast('Produto removido', 'success');
      await this.cartService.deleteProductFromCart(idCart);
    } catch (error) {
      this.presentToast('Erro ao tentar deletar', 'danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      position: 'bottom',
      duration: 100,
    });
    toast.present();
  }

  async presentLoading() {
    const loader = await this.loadingController.create({
      cssClass: 'my-custom-class',
    });
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

  async checkout() {
    await this.presentLoading();
    try {
      if (this.cartList.length > 0) {
        this.cartList.forEach((item) => {
          this.cartService.deleteProductFromCart(item.idCart);
          this.cartService.checkout(item);
        });
        this.presentToast('Pedido realizado', 'success');
      }
      this.dismissLoader();
    } catch (error) {
      this.presentToast(error, 'danger');
      this.dismissLoader();
    }
  }
}
