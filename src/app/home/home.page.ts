import { Component, OnInit } from '@angular/core';
import {
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { first } from 'rxjs/operators';
// Services
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
// Pages
import { CategoryPage } from '../category/category.page';
import { DetailsPage } from '../details/details.page';
// Interfaces
import { Product } from 'src/app/interfaces/product';
import { User } from './../interfaces/user';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public cartList: any[];
  public productList: any[];
  public categoryList: any[];
  public showTabs: boolean;
  public user: User;

  public slideOpts = {
    slidesPerView: 1.2,
    spaceBetween: 15,
    loop: true,
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public loadingController: LoadingController,
    private toastController: ToastController,
    private navController: NavController,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.showTabs = true;
  }

  async ngOnInit() {
    this.loadAll();
  }

  // Carrega todos os dados da página
  async loadAll() {
    this.cartList = await this.loadCart();
    this.productList = await this.loadProducts();
    this.categoryList = await this.loadCategories();
    [this.user] = await this.getUser();
  }

  // Atualiza todos os dados da página
  async doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(async () => {
      this.loadAll();
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  // Carrega todos os produtos
  async loadProducts(): Promise<any> {
    const allProducts = await this.productService
      .getProducts()
      .pipe(first())
      .toPromise();

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

    const productList = allProducts.map(addCartProps);
    return productList;
  }

  // Carrega o carrinho
  async loadCart(): Promise<any> {
    const cartList = await this.cartService.getCart().pipe(first()).toPromise();

    return cartList;
  }

  // Filtra e carrega as categorias
  async loadCategories(): Promise<any> {
    const allProducts = this.productList;
    const categoryList = allProducts.map((p) => p.category);

    const categoryListFiltered = categoryList.filter(
      (p, index) => categoryList.indexOf(p) === index
    );

    return categoryListFiltered;
  }

  // Recebe o usuário logado e seus dados
  async getUser(): Promise<any> {
    const allUsers = await this.userService
      .getUsers()
      .pipe(first())
      .toPromise();

    const [currentUser] = await this.userService
      .getCurrentUser()
      .pipe(first())
      .toPromise();

    const currentUserInfo = allUsers.filter(
      (user) => user.email === currentUser.email
    );

    return currentUserInfo;
  }

  // Deleta um produto
  async deleteProduct(id: string) {
    try {
      await this.productService.deleteProduct(id);
    } catch (error) {
      this.presentToast('Erro ao tentar deletar');
    }
  }

  // Cria modal para a página do produto
  async presentModalDetails(idProduto: string) {
    const [product] = this.productList.filter((p) => p.id === idProduto);
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      cssClass: 'my-custom-class',
      componentProps: {
        idProduto: product.id,
        cartItemId: product.cartItemId,
        usuario: this.user.id,
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
  presentToast(message: string) {
    this.toastController
      .create({ message, duration: 2000, position: 'top' })
      .then((toast) => toast.present());
  }
}
