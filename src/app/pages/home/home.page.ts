import { Component, OnDestroy } from '@angular/core';
import {
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/interfaces/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { DetailsPage } from '../details/details.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnDestroy {
  products = [];
  categories = [];

  slideOpts = {
    slidesPerView: 1.2,
    spaceBetween: 15,
    loop: true,
  };

  private cart = [];
  private productsSubscription: Subscription;
  private categoriesSubscription: Subscription;
  private cartSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public loadingController: LoadingController,
    private toastController: ToastController,
    private navController: NavController,
    private modalCtrl: ModalController
  ) {
    this.loadCart();
    this.loadCategories();
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
          if (props) {
            return { ...p, quantidade: props[p.id], cartItemId: props.id };
          } else {
            return { ...p, quantidade: 1, cartItemId: 0 };
          }
        };

        this.products = allProducts.map(addCartProps);
        console.log('products: ', this.products);
      });
  }

  loadCategories() {
    this.categoriesSubscription = this.productService
      .getCategories()
      .subscribe((data) => {
        this.categories = data;
        console.log('categorias', this.categories);
      });
  }

  ngOnDestroy() {
    this.productsSubscription.unsubscribe();
    this.categoriesSubscription.unsubscribe();
  }

  async deleteProduct(id: string) {
    try {
      await this.productService.deleteProduct(id);
    } catch (error) {
      this.presentToast('Erro ao tentar deletar');
    }
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

  presentToast(message: string) {
    this.toastController
      .create({ message, duration: 2000, position: 'top' })
      .then((toast) => toast.present());
  }

  navigateForward(id: string) {
    this.navController.navigateForward(`/details/${id}`);
  }
}
