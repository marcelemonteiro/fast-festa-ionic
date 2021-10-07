import { first } from 'rxjs/operators';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { DetailsPage } from '../details/details.page';
import { CartService } from 'src/app/services/cart.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit, OnDestroy {
  category: string;
  cartList: any[];
  productList: any[];
  currentUserUid: string;
  private cartSubscription: Subscription;
  private productSubscription: Subscription;

  constructor(
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private loadingController: LoadingController,
    private authService: AuthService
  ) {
    this.category = this.activatedRoute.snapshot.paramMap.get('category');
  }

  ngOnInit() {
    this.loadCart();
    this.dismissLoader();
    this.getCurrentUserUid();
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
    this.productSubscription.unsubscribe();
  }

  loadCart() {
    this.cartSubscription = this.cartService.getCart().subscribe((res) => {
      this.cartList = res;
    });
    this.loadProducts();
  }

  loadProducts() {
    this.productSubscription = this.productService
      .getProducts()
      .subscribe((res) => {
        const productOfCategory = (product) =>
          product.category === this.category;

        const addCartProps = (p: any) => {
          const [props] = this.cartList.filter((c) => c[p.id]);
          if (props) {
            return { ...p, quantidade: props[p.id], cartItemId: props.id };
          } else {
            return { ...p, quantidade: 1, cartItemId: 0 };
          }
        };

        this.productList = res.filter(productOfCategory).map(addCartProps);
      });
  }

  async presentLoading() {
    const loader = await this.loadingController.create({
      cssClass: 'my-custom-class',
    });
    await loader.present();
  }

  async dismissLoader() {
    let topLoader = await this.loadingController.getTop();
    while (topLoader) {
      if (!(await topLoader.dismiss())) {
        break;
      }
      topLoader = await this.loadingController.getTop();
    }
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
    const modal = await this.modalController.create({
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
