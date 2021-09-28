import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { NgxMaskModule, IConfig} from 'ngx-mask';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;
const maskConfig: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    NgxMaskModule.forRoot(maskConfig),
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
