import { Component, OnDestroy } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/interfaces/product';
import { DetailsPage } from '../details/details.page';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnDestroy {
  public products = [];
  public totalPrice: number;
  private cartSubscription: Subscription;
  private cart = [];
  private productsSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastCtrl: ToastController,
    private router: Router,
    private modalCtrl: ModalController
  ) {
    this.loadCart();
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
    this.productsSubscription.unsubscribe();
  }

  loadCart() {
    this.cartSubscription = this.cartService.getCart().subscribe((data) => {
      this.cart = data;
      console.log('cart: ', this.cart);

      this.loadProducts();
    });
  }

  loadProducts() {
    this.productsSubscription = this.productService
      .getProducts()
      .subscribe((allProducts) => {
        const addCartProps = (p: Product) => {
          const [props] = this.cart.filter((c) => c[p.id]);
          return { ...p, quantidade: props[p.id], cartItemId: props.id };
        };

        this.products = allProducts
          .filter((p) => this.isProductInCart(p.id))
          .map(addCartProps);

        console.log('produtos', this.products);

        this.getTotalPrice();
      });
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
    const toast = await this.toastCtrl.create({ message, duration: 2000 });
    toast.present();
  }

  async presentModal(idProduto: string) {
    const [product] = this.products.filter((p) => p.id === idProduto);

    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: {
        id: product.id,
        cartItemId: product.cartItemId,
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
