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

  products = []
  categories = []

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

  private productsSubscription: Subscription;
  private categoriesSubscription: Subscription;

  constructor(
    private productService: ProductService,
    public loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.productsSubscription = this.productService.getProducts().subscribe(data => {
      this.products = data;
      console.log('p: ', this.products)
    });

    this.categoriesSubscription = this.productService.getCategories().subscribe(data => {
      this.categories = data;
      console.log('categorias', this.categories)
    })
  }

  ngOnInit() { }

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

  presentToast(message: string) {
    this.toastController.create({ message, duration: 2000, position: 'top' })
      .then(toast => toast.present());
  }

}
