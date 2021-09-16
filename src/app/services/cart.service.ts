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
    return this.cartCollection.snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  addProductToCart(idProduto: string, quantidade: number, idUsuario: string) {
    return this.cartCollection.add({
      [idProduto]: quantidade,
      usuario: idUsuario,
    });
  }

  updateCart(idCart: string, idProduto: string, quantidade: number) {
    return this.cartCollection.doc(idCart).update({
      [idProduto]: quantidade,
    });
  }

  deleteProductFromCart(idCart: string) {
    return this.cartCollection.doc(idCart).delete();
  }
}
