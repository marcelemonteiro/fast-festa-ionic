import { Product } from 'src/app/interfaces/product';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit, OnDestroy {
  orders: any;
  productList: any[];
  currentUserUid: string;
  private orderSubscription: Subscription;
  private userUidSubscription: Subscription;
  private productSubscription: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    // Recebe o uid do usuário logado
    this.getCurrentUserUid();
    // Recebe lista com todos os pedidos
    this.getOrders();
    // Recebe lista com as informações dos produtos que estão no pedido
    this.getProducts();
  }

  ngOnDestroy() {
    this.orderSubscription.unsubscribe();
    this.userUidSubscription.unsubscribe();
    this.productSubscription.unsubscribe();
  }

  getCurrentUserUid() {
    this.userUidSubscription = this.authService
      .getAuth()
      .authState.subscribe((res) => {
        if (res) {
          this.currentUserUid = res.uid;
        }
      });
  }

  getProducts() {
    this.productSubscription = this.productService
      .getProducts()
      .subscribe((allProducts) => {
        this.productList = allProducts.filter((produto) =>
          this.isProductInOrder(produto.id)
        );
      });
  }

  getOrders() {
    this.orderSubscription = this.cartService.getOrders().subscribe((res) => {
      const filterByUser = (order: any) => order.usuario == this.currentUserUid;
      this.orders = res.filter(filterByUser);
    });
  }

  isProductInOrder(idProduto: string) {
    const filter = this.orders.some((order) => order.produto == idProduto);
    return filter;
  }

  getProductTitle(idProduct: string) {
    if (this.productList) {
      const [filtered] = this.productList.filter(
        (product) => product.id == idProduct
      );

      if (filtered) {
        return filtered.title;
      }
    }
  }

  getShopName(idProduct: string) {
    if (this.productList) {
      const [filtered] = this.productList.filter(
        (product) => product.id == idProduct
      );

      if (filtered) {
        return filtered.shop;
      }
    }
  }

  getDate(idOrder: string) {
    const [filtered] = this.orders.filter((order) => order.idOrder == idOrder);

    console.log(filtered.data);
  }
}
