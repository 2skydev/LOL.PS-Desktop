import 'reflect-metadata'

import { AppFactory } from '@main/core/factory'
import { AppModule } from '@main/modules/app/app.module'
import { ConfigModule } from '@main/modules/config/config.module'
import { DeveloperModule } from '@main/modules/developer/developer.module'
import { LeagueModule } from '@main/modules/league/league.module'
import { PSModule } from '@main/modules/ps/ps.module'
import { UpdateModule } from '@main/modules/update/update.module'

;(async () => {
  await AppFactory.create(AppModule, [
    ConfigModule,
    UpdateModule,
    DeveloperModule,
    LeagueModule,
    PSModule,
  ])
})()
