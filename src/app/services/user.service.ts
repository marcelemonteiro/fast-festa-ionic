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
    this.usersCollection = this.afs.collection('Users');
  }

  // Adiciona um novo usuáro à coleçãos
  addUser(user: User) {
    return this.usersCollection.add({
      email: user.email,
      nome: user.nome,
      cep: user.cep,
      telefone: user.telefone,
      cpf: user.cpf,
    });
  }

  // Atualiza os dados do usuário
  updateUser(user: User) {
    return this.usersCollection.doc(user.id).update(user);
  }

  // Traz um lista com todos os usuários registrados
  getUsers() {
    return this.usersCollection.valueChanges({ idField: 'id' });
  }
}
