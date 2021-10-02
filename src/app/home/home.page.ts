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
  cartList: any[];
  productList: any[];
  categoryList: any[];
  showTabs: boolean;
  currentUserUid: string;

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
    private modalCtrl: ModalController,
    private authService: AuthService
  ) {
    this.showTabs = true;
  }

  ngOnInit() {
    this.loadAll();
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

  // Carrega todos os dados da página
  async loadAll() {
    this.getCurrentUserUid();
    this.loadCart();
    this.loadProducts();
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
          return { ...p, quantidade: 1, cartItemId: 0, usuario: 'none' };
        }
      };

      this.productList = allProducts.map(addCartProps);
      console.log('products', this.productList);

      this.loadCategories();
    });
  }

  // Carrega o carrinho
  loadCart() {
    this.cartService.getCart().subscribe((res) => {
      this.cartList = res.filter(
        (cart) => cart.usuario === this.currentUserUid
      );
      console.log('cart', this.cartList);
    });
  }

  // Filtra e carrega as categorias
  loadCategories() {
    const categoryList = this.productList.map((p) => p.category);

    this.categoryList = categoryList.filter(
      (p, index) => categoryList.indexOf(p) === index
    );
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
  presentToast(message: string) {
    this.toastController
      .create({ message, duration: 2000, position: 'top' })
      .then((toast) => toast.present());
  }
}
