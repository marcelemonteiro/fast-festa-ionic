import { Component} from '@angular/core';
import { ToastController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage {
  public products = [];
  public totalPrice: number;
  private cart = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.cartService.getCart().subscribe(data => {
      this.cart = data;
      console.log('cart: ', this.cart)

      let productsRef = [];
      this.productService.getProducts().pipe(take(1)).subscribe(allProducts => {
        for (let item of this.cart) {
          const filtered = allProducts.filter(p => item[p.id]).map(p => {
            return { ...p, quantidade: item[p.id], cartItemId: item.id };
          })

          productsRef.push(...filtered);
        }

        this.products = productsRef;
        const prices = this.products.map(p => p.price);
        const total = prices.reduce((previuos, current) => previuos + current, 0);
        this.totalPrice = total;

        console.log('products: ', this.products);
      });
    });

  }

  async deleteProduct(idCart: string, event) {
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

  goToDetails(id) {
    this.router.navigateByUrl(`/details/${id}`);
  }


  getTotal() {
    const prices = this.products.map(p => p.price as number);
    const total = prices.reduce((previuos, current) => previuos + current, 0);
    this.totalPrice = total;
  }

  // addQuantidade(idCart: string, idProduto: string) {
  //   this.cartService.incrementProduct(idCart, idProduto);
  // }
  
  // removeQuantidade(idCart: string, idProduto: string) {
  //   // this.getQuantidade(idProduto);
  //   this.cartService.decrementProduct(idCart, idProduto);
  // }
}