import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartCollection: AngularFirestoreCollection;
  private orderCollection: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.cartCollection = this.afs.collection('Cart');
    this.orderCollection = this.afs.collection('Orders');
  }

  getCart() {
    return this.cartCollection.valueChanges({ idField: 'idCart' });
  }

  addProductToCart(idProduto: string, quantidade: number, usuario: string) {
    return this.cartCollection.add({
      produto: idProduto,
      quantidade,
      usuario,
    });
  }

  updateCart(
    idProduto: string,
    idCart: string,
    idUsuario: string,
    quantidade: number
  ) {
    return this.cartCollection.doc(idCart).update({
      [idProduto]: quantidade,
      usuario: idUsuario,
    });
  }

  deleteProductFromCart(idCart: string) {
    return this.cartCollection.doc(idCart).delete();
  }

  checkout(cart: any) {
    const data = `${new Date().getUTCDate()}/${
      new Date().getUTCMonth() + 1
    }/${new Date().getUTCFullYear()}`;

    return this.orderCollection.add({
      ...cart,
      data,
    });
  }

  getOrders() {
    return this.orderCollection.valueChanges({ idField: 'idOrder' });
  }
}
