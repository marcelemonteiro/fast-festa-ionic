import { Component } from '@angular/core';
import { IonSlides, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/interfaces/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  products = new Array<Product>();
  categories = new Array();

  slideOpts = {
    slidesPerView: 1.2,
    spaceBetween: 15,
    loop: true
  }

  slideCategoryOpts = {
    slidesPerView: 3.5,
    spaceBetween: 15,
    loop: true
  }

  private cart = [];
  private productsSubscription: Subscription;
  private cartSubscription: Subscription;
  private categoriesSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.productsSubscription = this.productService.getProducts().subscribe(data => {
      this.products = data;
      console.log('p: ', this.products)
    });

    this.cartSubscription = this.cartService.getCart().subscribe(data => {
      this.cart = data;
      console.log('c: ', this.cart)
    });

    this.categoriesSubscription = this.productService.getCategories().subscribe(data => {
      this.categories = data;
      console.log('categorias', this.categories)
    })
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }

    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  async deleteProduct(id: string) {
    try {
      await this.productService.deleteProduct(id);
    } catch (error) {
      this.presentToast('Erro ao tentar deletar');
    }
  }

  // async addToCart(idProduto: string, quantidade = 1) {
  //   const isDuplicateId = this.cart.some(item => item[idProduto]);
  //   try {
  //     if (!isDuplicateId) {
  //       await this.cartService.addProductToCart(idProduto, quantidade);
  //       this.presentToast('Produto adicionado ao carrinho')
  //     } else if (isDuplicateId) {
  //       this.presentToast('Produto já adicionado ao carrinho')
  //     }

  //   } catch (error) {
  //     this.presentToast('Erro ao tentar salvar');
  //   }
  // }

  presentToast(message: string) {
    this.toastController.create({ message, duration: 2000, position: 'top' })
      .then(toast => toast.present());
  }

}
