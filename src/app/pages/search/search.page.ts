import { CartService } from 'src/app/services/cart.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { first } from 'rxjs/operators';
import { LoadingController, ModalController } from '@ionic/angular';
import { DetailsPage } from '../details/details.page';
import { Product } from 'src/app/interfaces/product';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage {
  public loader: any;
  public cartList: any[];
  public productList: any[];
  public productListBackup: any[];
  public isProductsFiltered: boolean;

  constructor(
    private modalCtrl: ModalController,
    private cartService: CartService,
    private productService: ProductService
  ) {
    this.isProductsFiltered = false;
  }

  async ngOnInit() {
    this.cartList = await this.loadCart();
    this.productList = await this.loadProducts();
  }

  async loadProducts(): Promise<any> {
    const allProducts = await this.productService
      .getProducts()
      .pipe(first())
      .toPromise();

    const addCartProps = (p: Product) => {
      const [props] = this.cartList.filter(c => c[p.id]);
      if (props) {
        return { ...p, quantidade: props[p.id], cartItemId: props.id };
      } else {
        return { ...p, quantidade: 1, cartItemId: 0 };
      }
    };

    const productList = allProducts.map(addCartProps);
    return productList;
  }

  async loadCart(): Promise<any> {
    const cartList = await this.cartService
      .getCart()
      .pipe(first())
      .toPromise();

    return cartList;
  }

  async filterList(event: any) {
    this.productList = await this.loadProducts();
    const searchTerm = event.srcElement.value;
    if (!searchTerm) {
      this.productList = [];
      return;
    }

    this.productList = this.productList.filter(currentProduct => {
      if (currentProduct.title && searchTerm) {
        return (
          currentProduct.title.toLowerCase().indexOf(searchTerm.toLowerCase()) >
          -1
        );
      }
    });
    this.isProductsFiltered = true;
  }

  async presentModalDetails(idProduto: string) {
    const [product] = this.productList.filter(p => p.id === idProduto);

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
        description: product.description
      }
    });
    modal.present();
  }
}
