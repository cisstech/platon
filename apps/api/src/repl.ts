// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' })

import { repl } from '@nestjs/core'
import { AppModule } from './app/app.module'

async function startREPL() {
  console.log(process.env)
  await repl(AppModule)
}

startREPL().catch((err) => {
  console.error(`server failed to start repl`, err)
  process.exit(1)
})
