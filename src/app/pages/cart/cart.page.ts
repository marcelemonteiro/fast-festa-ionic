import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take, first, distinct, last } from 'rxjs/operators';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { newArray } from '@angular/compiler/src/util';
import { Product } from 'src/app/interfaces/product';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage {
  loading;
  public products = [];
  private cart = [];
  // private productsSubscription: Subscription;
  private cartSubscription: Subscription;


  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.cartSubscription = this.cartService.getCart().subscribe(data => {
      this.cart = data;
      console.log('cart: ', this.cart)

      let productsRef = [];
      this.productService.getProducts().subscribe(allProducts => {
        for (let item of this.cart) {
          const filtered = allProducts.filter(p => item[p.id]).map(p => {
            return { ...p, quantidade: item[p.id], cartItemId: item.id };
          })

          productsRef.push(...filtered);
        }

        this.products = productsRef;
        console.log('products: ', this.products);
      });
    });

  }
}