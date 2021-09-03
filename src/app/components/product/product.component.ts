import { ToastController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from './../../services/cart.service';
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent {

  // product = {};
  private cart = [];
  private cartSubscription: Subscription;
  @Input() product;

  constructor(
    private cartService: CartService,
    private toastCtrl: ToastController
  ) { 
    // this.cartSubscription = this.cartService.getCart().pipe().subscribe(data => {
    //   this.cart = data;
    // });

  }

  ngOnDestroy() {
    // this.cartSubscription.unsubscribe();
  }

  async deleteProduct(idCart: string) {
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

  addQuantidade(idCart: string, idProduto: string) {
    this.cartService.incrementProduct(idCart, idProduto);
  }
  
  removeQuantidade(idCart: string, idProduto: string) {
    // this.getQuantidade(idProduto);
    this.cartService.decrementProduct(idCart, idProduto);
  }

  getQuantidade(idProduto: string) {
    const [product] = this.cart.filter(c => c[idProduto]);
    const quantidade = product[idProduto];
    
    if (quantidade == 0) {
      this.cartService.deleteProductFromCart(product.cartItemId);
    }
  }

}
