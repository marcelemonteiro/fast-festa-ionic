import { first } from 'rxjs/operators';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { DetailsPage } from '../details/details.page';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit {
  public category: string;
  public cartList: any[];
  public productList: any[];
  public loader: any;

  constructor(
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private loadingController: LoadingController
  ) {
    this.category = activatedRoute.snapshot.paramMap.get('category');
  }

  async ngOnInit() {
    await this.presentLoading();

    try {
      this.cartList = await this.loadCart();
      this.productList = await this.loadProducts();
      this.dismissLoader();
    } catch (error) {
      console.log(error);
      this.dismissLoader();
    }
  }

  async loadProducts(): Promise<any> {
    const allProducts = await this.productService
      .getProducts()
      .pipe(first())
      .toPromise();

    const productOfCategory = allProducts.filter(
      (p) => p.category === this.category
    );

    const addCartProps = (p: any) => {
      const [props] = this.cartList.filter((c) => c[p.id]);
      if (props) {
        return { ...p, quantidade: props[p.id], cartItemId: props.id };
      } else {
        return { ...p, quantidade: 1, cartItemId: 0 };
      }
    };

    const productList = productOfCategory.map(addCartProps);
    return productList;
  }

  async loadCart(): Promise<any> {
    const cartList = await this.cartService.getCart().pipe(first()).toPromise();

    return cartList;
  }

  async presentLoading() {
    this.loader = await this.loadingController.create({
      cssClass: 'my-custom-class',
    });
    await this.loader.present();
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

  async presentModalDetails(idProduto: string) {
    const [product] = this.productList.filter((p) => p.id === idProduto);
    console.log(product);

    const modal = await this.modalController.create({
      component: DetailsPage,
      componentProps: {
        id: product.id,
        cartItemId: product.cartItemId,
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
