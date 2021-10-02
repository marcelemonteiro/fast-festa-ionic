import { User } from './../interfaces/user';
import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersCollection: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.usersCollection = this.afs.collection<User>('Users');
  }

  getUsers() {
    return this.usersCollection.valueChanges({ idField: 'id' });
  }

  addUser(user: User) {
    return this.usersCollection.add({
      email: user.email,
      nome: user.nome,
      cpf: user.cpf,
      cep: user.cep,
      logradouro: user.logradouro,
      complemento: user.complemento,
      bairro: user.bairro,
      telefone: user.telefone,
      nascimento: user.nascimento,
      genero: user.genero,
    });
  }

  updateUser(user: User) {
    return this.usersCollection.doc(user.id).update(user);
  }
}
