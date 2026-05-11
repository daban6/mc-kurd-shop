import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  products: ["create", "update", "delete", "publish"],
  orders: ["read", "approve", "reject"],
} as const;

export const ac = createAccessControl(statement);

export const superAdmin = ac.newRole({
  products: ["create", "update", "delete", "publish"],
  orders: ["read", "approve", "reject"],
});

export const contentAdmin = ac.newRole({
  products: ["create", "update", "delete", "publish"],
});

export const paymentAdmin = ac.newRole({
  orders: ["read", "approve", "reject"],
});
