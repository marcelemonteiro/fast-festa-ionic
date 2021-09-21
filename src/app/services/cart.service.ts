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

  constructor(private afs: AngularFirestore) {
    this.cartCollection = this.afs.collection('Cart');
  }

  getCart() {
    return this.cartCollection.valueChanges({ idField: 'id' });
  }

  addProductToCart(idProduto: string, quantidade: number, idUsuario: string) {
    return this.cartCollection.add({
      [idProduto]: quantidade,
      usuario: idUsuario,
    });
  }

  updateCart(
    idProduto: string,
    idCart: string,
    idUsuario: string,
    quantidade: number
  ) {
    return this.afs
      .collection('Cart')
      .doc(idCart)
      .update({
        [idProduto]: quantidade,
        usuario: idUsuario,
      });
  }

  deleteProductFromCart(idCart: string) {
    return this.cartCollection.doc(idCart).delete();
  }
}
