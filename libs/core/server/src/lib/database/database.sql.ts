const UUID = `'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`

/**
 * A text expression read as a uuid when it is one, else null: a join on it can use the primary key,
 * and another kind of identifier (a resource code) does not make the query fail.
 */
export const asUuid = (text: string) => `CASE WHEN ${text} ~* ${UUID} THEN (${text})::uuid END`
