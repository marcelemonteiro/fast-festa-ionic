import { User } from './../interfaces/user';
import { Injectable, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnInit {
  currentUser: User;
  userId: string;
  private userCollection: AngularFirestoreCollection;
  private usersCollection: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.userCollection = this.afs.collection('Current User');
    this.usersCollection = this.afs.collection('Users');
  }

  ngOnInit() {}

  // Lista com todos os usuários
  addUser(user: User) {
    return this.usersCollection.add({
      email: user.email,
      nome: user.nome,
      cep: user.cep,
      telefone: user.telefone,
      cpf: user.cpf,
    });
  }

  // Usuário Logado
  addCurrentUser(user: User) {
    return this.userCollection.add({
      email: user.email,
    });
  }

  getUsers() {
    return this.usersCollection.valueChanges({ idField: 'id' });
  }

  getCurrentUser() {
    return this.userCollection.valueChanges({ idField: 'id' });
  }

  removeUserFromSession(id: string) {
    return this.userCollection.doc(id).delete();
  }
}
