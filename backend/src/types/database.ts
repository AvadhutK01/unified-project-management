import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { db } from "../infrastructure/database/client.js";
import * as schema from "../infrastructure/database/schema/index.js";
import { directMessages } from "../infrastructure/database/schema/chat.js";

export type Database = typeof db;
export type Transaction = PgTransaction<
    PostgresJsQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
>;
export type DatabaseOrTransaction = Database | Transaction;

export type DirectMessageSelect = typeof directMessages.$inferSelect;
export type DirectMessageInsert = typeof directMessages.$inferInsert;

export type JsonPrimitive = string | number | boolean | Date | null | undefined;
export type JsonValue =
    | JsonPrimitive
    | { [key: string]: JsonValue }
    | JsonValue[];
