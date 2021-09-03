import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { ToastController, LoadingController, NavController } from '@ionic/angular';
import { Product } from 'src/app/interfaces/product';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  loading: any;
  public product: Product = {};
  private cart = [];
  private cartSubscription: Subscription;
  private productSubscription: Subscription;
  private productId: string = null;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private navCtrl: NavController
  ) { 
    this.productId = this.activatedRoute.snapshot.params['id'];

    this.cartSubscription = this.cartService.getCart().subscribe(data => {
      this.cart = data;
    });

    this.productSubscription = this.productService.getProduct(this.productId).subscribe(data => {
      this.product = data;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.productSubscription.unsubscribe();
    this.cartSubscription.unsubscribe();
  }

  async addToCart() {
    const isDuplicateId = this.cart.some(item => item[this.productId]);
    const isEmpty = this.cart.filter(item => item[this.productId] == 0);
    const [isEmptyIdCart] = [...isEmpty];

    if (isEmpty) {
      await this.cartService.deleteProductFromCart(isEmptyIdCart.id);
     }

    try {
      if (!isDuplicateId) {
        await this.cartService.addProductToCart(this.productId, 1);
        this.presentToast('Produto adicionado ao carrinho');
      } else if (isDuplicateId) {
        this.presentToast('Produto já adicionado ao carrinho');
      }

    } catch (error) {
      this.presentToast('Erro ao tentar salvar');
    }
  }

  presentToast(message: string) {
    this.toastController.create({ message, duration: 2000, position: 'top' })
      .then(toast => toast.present());
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    return this.loading.present();
  }

}
