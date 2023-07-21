import { Database } from "bun:sqlite";
import { SchemaType, SchemaTypeInference } from "types";

import {
  CreateSqliteTableFactoryParams,
  createSqliteTableFactory,
} from "./create-sqlite-table-factory";

export type CreateSqliteFactory<Schema extends SchemaType> = {
  create: (item: SchemaTypeInference<Schema>) => Promise<void>;
  read: () => Promise<SchemaTypeInference<Schema>[]>;
  update: (
    id: number,
    item: Partial<SchemaTypeInference<Schema>>
  ) => Promise<void>;
  deleteById: (id: number) => Promise<void>;
};

type CreateSqliteFactoryType = {
  db: Database;
  debug?: boolean;
  enableForeignKeys?: boolean;
};

type DBTableFactoryType<Schema extends SchemaType> = Omit<
  CreateSqliteTableFactoryParams<Schema>,
  "db"
> & {
  debug: boolean;
};

export function createSqliteFactory({
  db,
  debug = false,
  // because foreign keys in sqlite are disabled by default
  // https://renenyffenegger.ch/notes/development/databases/SQLite/sql/pragma/foreign_keys#:~:text=pragma%20foreign_keys%20%3D%20on%20enforces%20foreign,does%20not%20enforce%20foreign%20keys.&text=Explicitly%20turning%20off%20the%20validation,dump%20'ed%20database.
  // turning off foreign keys may be using when importing a .dump'ed database
  enableForeignKeys = false,
}: CreateSqliteFactoryType) {
  if (enableForeignKeys) {
    // Enable foreign key constraints
    db.query("PRAGMA foreign_keys = ON;").run();
  }

  function dbTableFactory<Schema extends SchemaType>({
    debug: debugTable = debug || false,
    schema,
    tableName,
  }: DBTableFactoryType<Schema>) {
    return createSqliteTableFactory(
      {
        db,
        schema,
        tableName,
      },
      {
        debug: debugTable,
        enableForeignKeys: debug,
      }
    );
  }

  return { dbTableFactory };
}
