// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' })

import { CommandFactory } from 'nest-commander'
import { AppModule } from './app/app.module'

async function startCLI() {
  await CommandFactory.run(AppModule, ['warn', 'error', 'log', 'debug'])
}

startCLI()
  .then(async () => {
    console.info('command bootstrapped ...!')
    process.exit(0)
  })
  .catch((err) => {
    console.error(`server failed to start command`, err)
    process.exit(1)
  })
