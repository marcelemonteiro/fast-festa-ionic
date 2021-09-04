import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCollection: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.cartCollection = this.afs.collection('Cart');
  }

  getCart() {
    return this.cartCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data }
        })
      })
    );
  }

  // incrementProduct(idCart: string, idProduto: string) {
  //   this.cartCollection.doc(idCart).update({
  //     [idProduto]: firebase.firestore.FieldValue.increment(1)
  //   });
    
  // }

  // decrementProduct(idCart: string, idProduto: string) {
  //   this.cartCollection.doc(idCart).update({
  //     [idProduto]: firebase.firestore.FieldValue.increment(-1)
  //   });

  // }

  addProductToCart(idProduto: string, quantidade: number) {
    return this.cartCollection.add({
      [idProduto]: quantidade
    });
  }

  updateCart(idCart: string, idProduto: string, quantidade: number) {
    return this.cartCollection.doc(idCart).update({
      [idProduto]: quantidade
    });
  }

  deleteProductFromCart(idCart: string) {
    return this.cartCollection.doc(idCart).delete();
  }

}
