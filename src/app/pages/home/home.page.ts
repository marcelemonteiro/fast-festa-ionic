import { Component, OnInit } from '@angular/core';
import {
  LoadingController,
  ModalController,
  NavController,
  ToastController
} from '@ionic/angular';
import { first } from 'rxjs/operators';
import { Product } from 'src/app/interfaces/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { CategoryPage } from '../category/category.page';
import { DetailsPage } from '../details/details.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  public cartList: any[];
  public productList: any[];
  public categoryList: any[];

  public slideOpts = {
    slidesPerView: 1.2,
    spaceBetween: 15,
    loop: true
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public loadingController: LoadingController,
    private toastController: ToastController,
    private navController: NavController,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    this.cartList = await this.loadCart();
    this.productList = await this.loadProducts();
    this.categoryList = await this.loadCategories();
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

  async loadCategories(): Promise<any> {
    const allProducts = this.productList;
    const categoryList = allProducts.map(p => p.category);

    const categoryListFiltered = categoryList.filter(
      (p, index) => categoryList.indexOf(p) === index
    );
    console.log(categoryListFiltered);

    return categoryListFiltered;
  }

  async deleteProduct(id: string) {
    try {
      await this.productService.deleteProduct(id);
    } catch (error) {
      this.presentToast('Erro ao tentar deletar');
    }
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

  presentToast(message: string) {
    this.toastController
      .create({ message, duration: 2000, position: 'top' })
      .then(toast => toast.present());
  }

  navigateForward(id: string) {
    this.navController.navigateForward(`/details/${id}`);
  }
}
