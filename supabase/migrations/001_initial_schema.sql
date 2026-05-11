-- Enums

CREATE TYPE admin_role AS ENUM ('super_admin', 'content_admin', 'payment_admin');
CREATE TYPE order_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE order_currency AS ENUM ('IQD', 'USD');

-- user_profile

CREATE TABLE user_profile (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"     text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "avatarUrl"  text,
  "createdAt"  timestamptz NOT NULL DEFAULT now()
);

-- admin_user

CREATE TABLE admin_user (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  email          text NOT NULL UNIQUE,
  "passwordHash" text NOT NULL,
  role           admin_role NOT NULL,
  "createdAt"    timestamptz NOT NULL DEFAULT now()
);

-- category

CREATE TABLE category (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nameEn"   text NOT NULL,
  "nameKu"   text NOT NULL,
  slug       text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- product

CREATE TABLE product (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nameEn"          text NOT NULL,
  "nameKu"          text NOT NULL,
  "descriptionEn"   text,
  "descriptionKu"   text,
  "categoryId"      uuid NOT NULL REFERENCES category(id),
  "priceIqd"        numeric(12, 2) NOT NULL,
  "priceUsd"        numeric(10, 2) NOT NULL,
  "fileUrl"         text,
  published         boolean NOT NULL DEFAULT false,
  "createdAt"       timestamptz NOT NULL DEFAULT now(),
  "updatedAt"       timestamptz NOT NULL DEFAULT now()
);

-- product_image

CREATE TABLE product_image (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" uuid NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  "imageUrl"  text NOT NULL,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- cart

CREATE TABLE cart (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"   text NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- cart_item

CREATE TABLE cart_item (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "cartId"    uuid NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  "productId" uuid NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  "addedAt"   timestamptz NOT NULL DEFAULT now()
);

-- order

CREATE TABLE "order" (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    text NOT NULL REFERENCES "user"(id),
  status      order_status NOT NULL DEFAULT 'pending',
  "totalIqd"  numeric(12, 2) NOT NULL,
  "totalUsd"  numeric(10, 2) NOT NULL,
  currency    order_currency NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- order_item

CREATE TABLE order_item (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId"   uuid NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  "productId" uuid NOT NULL REFERENCES product(id),
  "priceIqd"  numeric(12, 2) NOT NULL,
  "priceUsd"  numeric(10, 2) NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- payment_screenshot

CREATE TABLE payment_screenshot (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId"   uuid NOT NULL UNIQUE REFERENCES "order"(id) ON DELETE CASCADE,
  "fileUrl"   text NOT NULL,
  "uploadedAt" timestamptz NOT NULL DEFAULT now()
);

-- download

CREATE TABLE download (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderItemId" uuid NOT NULL REFERENCES order_item(id) ON DELETE CASCADE,
  "userId"      text NOT NULL REFERENCES "user"(id),
  token         text NOT NULL UNIQUE,
  "expiresAt"   timestamptz NOT NULL,
  "downloadedAt" timestamptz,
  "createdAt"   timestamptz NOT NULL DEFAULT now()
);
