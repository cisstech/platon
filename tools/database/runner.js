const { Client } = require('pg')

const { createLogger, transports, format } = require('winston')

const logger = createLogger({
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
  ),
})

const DB_URL = process.env.DB_URL || 'localhost'
const DB_USERNAME = process.env.DB_USERNAME || 'platon'
const DB_PASSWORD = process.env.DB_PASSWORD || 'test'
const DB_NAME = process.env.DB_NAME || 'platon_db'
const DATABASE_PORT = process.env.DATABASE_PORT || 5432

const queryRunner = new Client({
  host: DB_URL,
  port: DATABASE_PORT,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
})


exports.run = async (consumer) => {
  const start = new Date()
  const hrstart = process.hrtime()

  const logtime = () => {
    const end = new Date() - start
    const hrend = process.hrtime(hrstart)
    logger.info(`execution time: ${end}ms`, end)
    logger.info(`execution time (hr): ${hrend[0]}s ${hrend[1] / 1000000}ms`)
  }

  const savepoint = 'savepoint_' + Date.now()

  try {
    const oldQuery = queryRunner.query
    let firstError = true
    queryRunner.query = async (...args) => {
      logger.info(args)
      try {
        return await oldQuery.apply(queryRunner, args)
      } catch (error) {
        if (firstError) {
          console.log('FAILED', args, error)
          firstError = false
        }
        throw error
      }
    }

    await queryRunner.connect()
    await queryRunner.query(`BEGIN TRANSACTION`)
    await queryRunner.query(`SAVEPOINT ${savepoint}`)
    logger.info(`savepoint transaction: ${savepoint}`)

    await consumer(queryRunner, logger)

    await queryRunner.query(`COMMIT`)
    logger.info(`commit transaction: $${savepoint}`)
    await queryRunner.query(`END`)
  } catch (err) {
    console.error(err)
    await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepoint}`)
    logtime()
    process.exit(1)
  } finally {
    logger.info('close connection')
    queryRunner.end()
    logtime()
    process.exit(0)
  }
}
