const fs = require('fs');
const path = require('path');
const { run } = require('../database/runner');
const bcrypt = require('bcrypt');

require('dotenv').config();

/*
      LEVELS.map(l => queryRunner.query(`INSERT INTO "Levels" (name) VALUES ($1)`, [l]))

 */

run(async (queryRunner, logger) => {
  const file = fs.readFileSync(path.join(__dirname, 'init.json'));

  const data = JSON.parse(file.toString());

  if (data.levels) {
    logger.info('GENERATING LEVELS');
    await Promise.all(
      data.levels.map((level) =>
        queryRunner.query(`INSERT INTO "Levels" (name) VALUES ($1) ON CONFLICT DO NOTHING`, [level])
      )
    );
  }

  if (data.topics) {
    logger.info('GENERATING TOPIC');
    await Promise.all(
      data.topics.map((level) =>
        queryRunner.query(`INSERT INTO "Topics" (name) VALUES ($1) ON CONFLICT DO NOTHING`, [level])
      )
    );
  }

  logger.info('GENERATING USERS');
  let users = []
  if (data.users) {
    logger.info('GENERATING USERS');
    users = await Promise.all(
      data.users.map((user) =>
        queryRunner.query(
          `INSERT INTO "Users" (username, first_name, last_name, email, role, password)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
          RETURNING *
        `,
          [
            user.username, user.first_name, user.last_name, user.email, user.role,
            bcrypt.hashSync(user.password, Number.parseInt(process.env.PASSWORD_SALT) || 10)
          ]
        )
      )
    );
  }

  if (data.lms) {
    logger.info('GENERATING LMSES');
    await Promise.all(
      data.lms.map((lms) =>
        queryRunner.query(
          `INSERT INTO "Lmses" (name, url, outcome_url, consumer_key, consumer_secret)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `,
          [
            lms.name, lms.url, lms.outcome_url, lms.consumer_key, lms.consumer_secret
          ]
        )
      )
    );
  }


  const admin = (await queryRunner.query(`SELECT * FROM "Users" WHERE "role"='admin'`)).rows[0]
  logger.info('GENERATING CIRCLES');
  const root = (await queryRunner.query(`
    INSERT INTO "Resources"
    (name, code, owner_id, "desc", type, status, visibility)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT DO NOTHING
    RETURNING *
  `, [
    'PLaTon',
    'platon',
    admin.id,
    `Le cercle principal de notre plateforme est un espace dédié aux utilisateurs pour partager, explorer et découvrir les meilleures ressources pour se former en utilisant notre plateforme.`,
    'CIRCLE',
    'READY',
    'PRIVATE',
  ])).rows[0]

});
