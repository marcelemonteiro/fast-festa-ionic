import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnDestroy {
  @ViewChild('input', { static: true }) input: ElementRef;
  @Input() id: any;
  @Input() cartItemId: any;
  @Input() title: any;
  @Input() image: any;
  @Input() shop: any;
  @Input() price: any;
  @Input() quantidade: any;
  @Input() description: any;
  private cartSubscription: Subscription;
  private cart = [];

  constructor(
    private cartService: CartService,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.getCart();
  }

  getCart() {
    this.cartSubscription = this.cartService.getCart().subscribe((data) => {
      this.cart = data;
      console.log(this.cart);
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  async addToCart() {
    const isDuplicateId = this.cart.some((item) => item[this.id]);
    const quantidade = this.input.nativeElement.value;
    try {
      if (isDuplicateId) {
        await this.cartService.updateCart(this.cartItemId, this.id, quantidade);
        this.presentToast('Produto atualizado adicionado ao carrinho');
        this.modalController.dismiss();
      } else {
        await this.cartService.addProductToCart(this.id, quantidade);
        this.presentToast('Produto adicionado ao carrinho');
        this.modalController.dismiss();
      }
    } catch (error) {
      this.presentToast('Erro ao tentar salvar');
    }
  }

  presentToast(message: string) {
    this.toastController
      .create({ message, duration: 1000, position: 'top' })
      .then((toast) => toast.present());
  }

  addQuantidade() {
    ++this.input.nativeElement.value;
  }

  removeQuantidade() {
    if (this.input.nativeElement.value === '1') {
      return;
    }
    --this.input.nativeElement.value;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
