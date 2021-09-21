import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  ModalController,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { first, take } from 'rxjs/operators';
// Services
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from '../services/user.service';
// Interfaces
import { Product } from 'src/app/interfaces/product';
import { User } from '../interfaces/user';
// Pages
import { DetailsPage } from '../details/details.page';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage {
  public productList: any[];
  public cartList: any[];
  public user: User;
  public totalPrice: number;
  public isLoading: boolean;
  public isCartEmpty: boolean;
  public loader: any;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private cartService: CartService,
    private toastCtrl: ToastController,
    private router: Router,
    private modalCtrl: ModalController,
    private loadingController: LoadingController
  ) {
    this.isLoading = true;
  }

  async ngOnInit() {
    // Recebe o usuário logado
    [this.user] = await this.getUser();
    console.log('USUARIO LOGADO', this.user);

    // Carrega o carrinho
    this.cartList = await this.loadCart();
    console.log('CARRINHO', this.cartList);

    // Carrega os itens do carrinho
    this.productList = await this.loadProducts();
    console.log('PRODUTOS', this.productList);

    // Calcula o valor total da compra
    this.getTotalPrice();
  }

  async getUser(): Promise<any> {
    const allUsers = await this.userService
      .getUsers()
      .pipe(first())
      .toPromise();

    const [currentUser] = await this.userService
      .getCurrentUser()
      .pipe(first())
      .toPromise();

    const currentUserInfo = allUsers.filter(
      (user) => user.email === currentUser.email
    );

    return currentUserInfo;
  }

  async loadCart(): Promise<any> {
    const cartList = await this.cartService.getCart().pipe(first()).toPromise();
    const cartListOfCurrentUser = cartList.filter(
      (cart) => cart.usuario === this.user.id
    );

    return cartListOfCurrentUser;
  }

  async loadProducts(): Promise<any> {
    const allProducts = await this.productService
      .getProducts()
      .pipe(first())
      .toPromise();

    const addCartProps = (p: Product) => {
      const [props] = this.cartList.filter((c) => c[p.id]);
      return {
        ...p,
        quantidade: props[p.id],
        cartItemId: props.id,
      };
    };

    const productsInCart = allProducts
      .filter((p) => this.isProductInCart(p.id))
      .map(addCartProps);

    return productsInCart;
  }

  isProductInCart(idProduto: string) {
    const filter = this.cartList.some((c) => c[idProduto]);
    return filter;
  }

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
