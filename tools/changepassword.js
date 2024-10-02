const { run } = require('./database/runner')
const bcrypt = require('bcrypt')

run(async (queryRunner, logger) => {
  const username = process.argv[2]
  const password = process.argv[3]

  if (!username || !password) {
    logger.error('Please provide a username and password')
    process.exit(1)
  }

  logger.info('CHANGING PASSWORD')
  await queryRunner.query(`UPDATE "Users" SET password = $1 WHERE username = $2`, [
    bcrypt.hashSync(password, Number.parseInt(process.env.PASSWORD_SALT) || 10),
    username,
  ])

  logger.info('PASSWORD CHANGED')
})
