import { ToastController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from './../../services/cart.service';
import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/interfaces/product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {

  public product = {};
  // private cart = [];
  private cartSubscription: Subscription;
  private productSubscription: Subscription;
  @Input('idProduto') idProduto: string;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private toastCtrl: ToastController
  ) { 
    // this.cartSubscription = this.cartService.getCart().subscribe(data => {
    //   this.cart = data;
    // });

    this.productSubscription = this.productService.getProduct(this.idProduto).subscribe(data => {
      this.product = data;
      console.log('produto: ', data);
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.productSubscription.unsubscribe();
    this.cartSubscription.unsubscribe();
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

  // addQuantidade(idCart: string, idProduto: string) {
  //   let quantidade = this.getQuantidade(idProduto);
  //   quantidade += 1;
  //   this.cartService.updateProductInCart(idCart, idProduto, quantidade);
  // }

  // removeQuantidade(idCart: string, idProduto: string) {
  //   let quantidade = this.getQuantidade(idProduto);
  //   quantidade -= 1;
  //   this.cartService.updateProductInCart(idCart, idProduto, quantidade);
  // }

  // getQuantidade(idProduto: string) {
  //   const [product] = this.cart.filter(c => c[idProduto]);
  //   const quantidade = product;
  //   return quantidade[idProduto];
  // }

}
