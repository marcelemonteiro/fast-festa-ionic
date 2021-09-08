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
  public cart: any[];
  public productList: any[];
  public productListBackup: any[];
  public isProductsFiltered: boolean;
  private productsSubscription: Subscription;
  private cartSubscription: Subscription;

  constructor(
    private db: AngularFirestore,
    private loadingController: LoadingController,
    private modalCtrl: ModalController,
    private cartService: CartService,
    private productService: ProductService
  ) {
    this.isProductsFiltered = false;
  }

  async ngOnInit() {
    this.productList = await this.initializeItems();
  }

  async initializeItems(): Promise<any> {
    const productList = await this.db
      .collection('Products')
      .valueChanges()
      .pipe(first())
      .toPromise();
    this.productListBackup = productList;
    return productList;
  }

  async filterList(event: any) {
    this.productList = this.productListBackup;
    const searchTerm = event.srcElement.value;
    if (!searchTerm) {
      this.productList = [];
      return;
    }

    this.isProductsFiltered = true;

    this.productList = await this.productList.filter(currentProduct => {
      if (currentProduct.title && searchTerm) {
        return (
          currentProduct.title.toLowerCase().indexOf(searchTerm.toLowerCase()) >
          -1
        );
      }
    });
  }

  async presentModal(idProduto: string) {
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
