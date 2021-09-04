import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { ToastController, LoadingController, NavController } from '@ionic/angular';
import { Product } from 'src/app/interfaces/product';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  loading: any;
  public product = {};
  public quantidade = 1;
  private cart = [];
  private idCart: string;
  private cartSubscription: Subscription;
  private productSubscription: Subscription;
  private productId: string = null;

  @ViewChild('input', { static: true }) input: ElementRef;


  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private router: Router
  ) {
    this.productId = this.activatedRoute.snapshot.params['id'];

    this.cartSubscription = this.cartService.getCart().subscribe(data => {
      this.cart = data;
      const filtered = this.cart.filter(el => el[this.productId]);
  
      if (filtered.length != 0) {
        const [cartProps] = [...filtered];
        this.idCart = cartProps.id;
        this.quantidade = cartProps[this.productId];
      }
    });


    this.productSubscription = this.productService.getProduct(this.productId).subscribe(data => {
      this.product = { ...data };
    });

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
    this.productSubscription.unsubscribe();
  }

  async addToCart() {
    const isDuplicateId = this.cart.some(item => item[this.productId]);
    const quantidade = this.input.nativeElement.value;

    try {
      if (!isDuplicateId) {
        await this.cartService.addProductToCart(this.productId, quantidade);
        this.presentToast('Produto adicionado ao carrinho');
      } else if (isDuplicateId) {
        await this.cartService.updateCart(this.idCart, this.productId, quantidade)
        this.presentToast('Produto atualizado adicionado ao carrinho');
      }

      this.router.navigateByUrl('/cart');

    } catch (error) {
      this.presentToast('Erro ao tentar salvar');
    }
  }

  getQuantidade() {
    const filtered = this.cart.filter(el => el.id == this.idCart);
    console.log(filtered);

  }

  presentToast(message: string) {
    this.toastController.create({ message, duration: 1000, position: 'top' })
      .then(toast => toast.present());
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    return this.loading.present();
  }

  addQuantidade() {
    ++this.input.nativeElement.value;
  }

  removeQuantidade() {
    if (this.input.nativeElement.value == 1) {
      return;
    }
    --this.input.nativeElement.value;
  }

}
