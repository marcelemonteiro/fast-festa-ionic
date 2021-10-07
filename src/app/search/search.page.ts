import { CartService } from 'src/app/services/cart.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { first } from 'rxjs/operators';
import { LoadingController, ModalController } from '@ionic/angular';
import { DetailsPage } from '../details/details.page';
import { Product } from 'src/app/interfaces/product';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {
  currentUserUid: string;
  loader: any;
  cartList: any[];
  productList: any[];
  productListBackup: any[];
  isProductsFiltered: boolean;

  constructor(
    private modalCtrl: ModalController,
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService
  ) {
    this.isProductsFiltered = false;
  }

  async ngOnInit() {
    this.getCurrentUserUid();
    this.cartList = await this.loadCart();
    this.productList = await this.loadProducts();
  }

  async loadProducts(): Promise<any> {
    const allProducts = await this.productService
      .getProducts()
      .pipe(first())
      .toPromise();

    const addCartProps = (p: Product) => {
      const [props] = this.cartList.filter((c) => c[p.id]);
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
    const cartList = await this.cartService.getCart().pipe(first()).toPromise();

    return cartList;
  }

  async filterList(event: any) {
    this.productList = await this.loadProducts();
    const searchTerm = event.srcElement.value;
    if (!searchTerm) {
      this.productList = [];
      return;
    }

    this.productList = this.productList.filter((currentProduct) => {
      if (currentProduct.title && searchTerm) {
        return (
          currentProduct.title.toLowerCase().indexOf(searchTerm.toLowerCase()) >
          -1
        );
      }
    });
    this.isProductsFiltered = true;
  }

  // Recebe o uid do usuário logado
  getCurrentUserUid() {
    this.authService.getAuth().authState.subscribe((res) => {
      if (res) {
        this.currentUserUid = res.uid;
      }
    });
  }

  async presentModalDetails(idProduto: string) {
    const [product] = this.productList.filter((p) => p.id === idProduto);

    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: {
        idProduto: product.id,
        cartItemId: product.cartItemId,
        usuario: this.currentUserUid,
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
}
