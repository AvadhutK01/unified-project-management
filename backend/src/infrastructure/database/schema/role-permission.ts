import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";

export const rolePermissions = pgTable(
    "role_permissions",
    {
        roleId: uuid("role_id").notNull(),
        permissionId: uuid("permission_id").notNull(),
    },
    (table) => ({
        pk: primaryKey({
            columns: [table.roleId, table.permissionId],
        }),
    }),
);
