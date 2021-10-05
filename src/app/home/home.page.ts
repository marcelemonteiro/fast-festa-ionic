import { Component, OnInit } from '@angular/core';
import {
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { first } from 'rxjs/operators';
// Services
import { AuthService } from '../services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
// Pages
import { DetailsPage } from '../details/details.page';
// Interfaces
import { Product } from 'src/app/interfaces/product';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  cartList: any[];
  productList: any[];
  categoryList: string[];
  slideImageList: any[];
  slideOpts = {
    slidesPerView: 1.2,
    spaceBetween: 15,
    loop: true,
  };
  private currentUserUid: string;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalCtrl: ModalController,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.getCurrentUserUid();

    this.loadCart();
  }

  // Recebe o uid do usuário logado
  getCurrentUserUid() {
    this.authService.getAuth().authState.subscribe((res) => {
      if (res) {
        this.currentUserUid = res.uid;
        console.log('usuario logado ->', this.currentUserUid);
      }
    });
  }

  // Carrega o carrinho
  loadCart() {
    this.cartService.getCart().subscribe((res) => {
      this.cartList = res.filter(
        (cart) => cart.usuario === this.currentUserUid
      );
      console.log('cart', this.cartList);
      this.loadProducts();
    });
    console.log('products', this.productList);
  }

  // Carrega todos os produtos
  loadProducts() {
    this.productService.getProducts().subscribe((allProducts) => {
      const addCartProps = (p: Product) => {
        const [props] = this.cartList.filter((c) => c[p.id]);
        if (props) {
          return {
            ...p,
            quantidade: props[p.id],
            cartItemId: props.id,
            usuario: props.usuario,
          };
        } else {
          return { ...p, quantidade: 1, cartItemId: 0 };
        }
      };

      this.productList = allProducts.map(addCartProps);

      this.slideImageList = this.productList.map((product) => {
        return { image: product.image, id: product.id };
      });

      console.log(this.slideImageList);

      this.loadCategories();
    });
  }

  // Filtra e carrega as categorias
  loadCategories() {
    const categoryList = this.productList.map((p) => p.category);

    this.categoryList = categoryList.filter(
      (p, index) => categoryList.indexOf(p) === index
    );
  }

  // Cria modal para a página do produto
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

  // Mostra o Toast
  presentToast(message: string, color: string) {
    this.toastController
      .create({ message, color, duration: 500, position: 'top' })
      .then((toast) => toast.present());
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
}
