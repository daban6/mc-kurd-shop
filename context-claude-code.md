# MC Kurd Shop — Claude Code Context File
*For agentic AI instances (Claude Code, Cursor, etc.)*

---

## CRITICAL RULES — READ FIRST

1. **NEVER search the web**
2. **NEVER read node_modules**
3. **NEVER read external URLs**
4. **Only touch files explicitly listed in the task**
5. **Always end with "No other changes"**
6. **No new packages unless explicitly stated**
7. **Server components are never `use client`**
8. **Never use localStorage or sessionStorage**

---

## Project: MC Kurd Shop

Next.js 16 full-stack Minecraft digital store. Kurdish/English bilingual (RTL/LTR). Manual P2P payment system with admin approval flow.

- **Repo:** `daban6/mc-kurd-shop`
- **Working dir:** `~/mc-kurd-shop`
- **Package manager:** npm
- **Node version:** v26.1.x
- **Next.js version:** 16.2.6 (uses `proxy.ts` NOT `middleware.ts`)

---

## Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
RESEND_API_KEY=
DISCORD_WEBHOOK_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## Tech Stack

- **Framework:** Next.js 16 App Router
- **Database:** Supabase (PostgreSQL)
- **Auth:** BetterAuth (`lib/auth.ts`, `lib/auth-client.ts`)
- **Storage:** Supabase Storage (buckets: `screenshots`, `downloads`)
- **Email:** Resend
- **i18n:** next-intl (`i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** lucide-react ONLY
- **Font:** Ping (configured in `app/globals.css`)

---

## Key Imports

```typescript
// Supabase clients
import { createAdminClient } from '@/lib/supabase/admin'    // server-only, service role
import { createServerClient } from '@/lib/supabase/server'  // server, cookie-based
import { createBrowserClient } from '@/lib/supabase/client' // client components

// Auth
import { auth } from '@/lib/auth'                // server-only
import { authClient } from '@/lib/auth-client'   // client components
import { headers } from 'next/headers'

// i18n navigation (use these instead of next/navigation)
import { Link, redirect, usePathname, useRouter } from '@/i18n/navigation'

// Cart
import { useCart } from '@/context/CartContext'

// Discord
import { sendDiscordWebhook } from '@/lib/discord'
```

---

## Route Structure

```
app/
├── [locale]/
│   ├── layout.tsx                    ← Shell + NextIntlClientProvider + CartProvider
│   ├── (main)/layout.tsx             ← Navbar + Footer
│   ├── (main)/page.tsx               ← Homepage
│   ├── (main)/shop/page.tsx          ← Shop listing
│   ├── (main)/shop/[slug]/page.tsx   ← Product detail
│   ├── (main)/account/page.tsx       ← User account
│   ├── auth/login/page.tsx           ← User login
│   ├── auth/register/page.tsx        ← User register
│   ├── checkout/page.tsx             ← Checkout
│   ├── order/[orderId]/page.tsx      ← Order instructions
│   └── dashboard/
│       ├── (auth)/login/page.tsx     ← Admin login
│       └── (main)/layout.tsx         ← Auth guard + sidebar
│       └── (main)/page.tsx           ← Dashboard overview
│       └── (main)/orders/page.tsx
│       └── (main)/products/page.tsx
│       └── (main)/products/new/page.tsx
│       └── (main)/users/page.tsx
│       └── (main)/admins/page.tsx
└── api/
    ├── auth/[...all]/route.ts
    ├── products/route.ts
    ├── products/[slug]/route.ts
    ├── products/[slug]/reviews/route.ts
    ├── categories/route.ts
    ├── cart/route.ts
    ├── cart/[itemId]/route.ts
    ├── orders/route.ts
    ├── orders/[orderId]/route.ts
    ├── orders/[orderId]/screenshot/route.ts
    └── dashboard/orders/route.ts
```

---

## Database Schema

### Important: BetterAuth user.id is TEXT not UUID

```sql
-- BetterAuth tables (never modify)
user: id(text), name, email, emailVerified(bool), image, createdAt(timestamptz), updatedAt(timestamptz), role(text), banned(bool), banReason, banExpires(timestamptz)
session, account, verification

-- Custom tables
user_profile: id(uuid), "userId"(text→user.id), "avatarUrl", "createdAt"
category: id(uuid), "nameEn", "nameKu", slug(unique), "createdAt"
product: id(uuid), "nameEn", "nameKu", "descriptionEn", "descriptionKu", "categoryId"(uuid→category.id), "priceIqd"(numeric), "priceUsd"(numeric), "fileUrl"(nullable), slug(unique), published(bool,default false), "createdAt", "updatedAt"
product_image: id(uuid), "productId"(uuid→product.id CASCADE), "imageUrl", "sortOrder"(int)
cart: id(uuid), "userId"(text,UNIQUE→user.id CASCADE), "createdAt"
cart_item: id(uuid), "cartId"(uuid→cart.id CASCADE), "productId"(uuid→product.id CASCADE), "addedAt"
order: id(uuid), "orderCode"(text,unique), "userId"(text→user.id), status(enum:pending/approved/rejected), "totalIqd"(numeric), "totalUsd"(numeric), currency(enum:IQD/USD), "paymentMethod"(text), "createdAt", "updatedAt"
order_item: id(uuid), "orderId"(uuid→order.id CASCADE), "productId"(uuid→product.id), "priceIqd"(numeric), "priceUsd"(numeric), "createdAt"
payment_screenshot: id(uuid), "orderId"(uuid,UNIQUE→order.id CASCADE), "fileUrl", "uploadedAt"
download: id(uuid), "orderItemId"(uuid→order_item.id CASCADE), "userId"(text→user.id), token(text,unique), "expiresAt"(timestamptz), "downloadedAt"(timestamptz,nullable), "createdAt"
review: id(uuid), "productId"(uuid→product.id CASCADE), "userId"(text→user.id CASCADE), rating(int,1-5), comment(text), "createdAt" — UNIQUE("productId","userId")
```

### Column naming: all camelCase columns are quoted in SQL
```sql
-- Correct
SELECT "nameEn", "priceIqd" FROM product WHERE published = true
-- Wrong
SELECT nameEn, priceIqd FROM product WHERE published = true
```

---

## Auth Pattern (Server Components)

```typescript
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect('/en/dashboard/login')

const ADMIN_ROLES = ['superAdmin', 'contentAdmin', 'paymentAdmin']
if (!ADMIN_ROLES.includes(session.user.role as string)) {
  redirect('/en/dashboard/login')
}
```

## Auth Pattern (Client Components)

```typescript
'use client'
import { authClient } from '@/lib/auth-client'

const { error } = await authClient.signIn.email({ email, password })
```

---

## Supabase Patterns

```typescript
// Admin client (server-only, bypasses RLS)
import { createAdminClient } from '@/lib/supabase/admin'
const supabase = createAdminClient()

// Query example
const { data, error } = await supabase
  .from('product')
  .select('*, category(*), product_image(*)')
  .eq('published', true)
  .order('"createdAt"', { ascending: false })

// Insert example
const { data, error } = await supabase
  .from('order')
  .insert({
    orderCode: 'MCK-20260512-XXXX',
    userId: 'user-id',
    status: 'pending',
    totalIqd: 15000,
    totalUsd: 11.5,
    currency: 'IQD',
    paymentMethod: 'fib'
  })
  .select()
  .single()

// Storage upload
const { data, error } = await supabase.storage
  .from('screenshots')
  .upload(`${orderId}/${timestamp}.jpg`, file, {
    contentType: file.type,
    upsert: false
  })
```

---

## Order ID Generation

```typescript
function generateOrderCode(): string {
  const date = new Date()
  const dateStr = date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  return `MCK-${dateStr}-${random}`
}
```

---

## Download Token Generation

```typescript
import { randomBytes } from 'crypto'
const token = randomBytes(16).toString('hex') // 32 char hex string
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
```

---

## Discord Webhook

```typescript
import { sendDiscordWebhook } from '@/lib/discord'

await sendDiscordWebhook({
  embeds: [{
    title: 'New Payment Screenshot',
    fields: [{ name: 'Order ID', value: orderCode }],
    color: 0x7c3aed
  }]
})
```

---

## API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    // ... query
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // validate
    if (!body.field) {
      return NextResponse.json({ error: 'Missing field' }, { status: 400 })
    }
    // ... logic
    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## i18n Patterns

```typescript
// Server component — get locale from params
const { locale } = await params
const isKurdish = locale === 'ku'
const name = isKurdish ? (product.nameKu || product.nameEn) : product.nameEn

// Client component — get locale from useParams
import { useParams } from 'next/navigation'
const params = useParams()
const locale = params.locale as string
```

---

## Cart Context

```typescript
import { useCart } from '@/context/CartContext'

const { items, itemCount, addToCart, removeFromCart, loading } = useCart()

// Add to cart
await addToCart(productId)

// Remove from cart
await removeFromCart(itemId)
```

---

## Styling Conventions

```typescript
// Always use these Tailwind classes for the design system
bg-background         // #0a0a0f
bg-surface            // #13131a  (use bg-[#13131a] if needed)
border-border         // #1e1e2e
text-primary          // #7c3aed
text-foreground       // #f4f4f5
text-muted            // #71717a

// Gradient placeholder for product images
className="bg-gradient-to-br from-violet-950/40 to-slate-900"

// Purple button
className="bg-violet-600 hover:bg-violet-700 text-white"

// Active state
className="bg-violet-600 text-white"  // active
className="text-muted hover:text-foreground"  // inactive
```

---

## RTL Support

```typescript
// In layout, dir is set based on locale
<html lang={locale} dir={locale === 'ku' ? 'rtl' : 'ltr'}>

// For RTL-aware flex layouts, avoid directional utilities
// Use logical properties or explicit flex-row
className="flex flex-row gap-6"  // works in both directions
```

---

## proxy.ts (Middleware)

The file is `proxy.ts` NOT `middleware.ts` (Next.js 16 renamed it).

```typescript
// Dashboard protection
const isDashboard = /^\/[^/]+\/dashboard(\/|$)/.test(pathname)
const isLoginPage = pathname.endsWith('/dashboard/login')

if (isLoginPage) return NextResponse.next()  // bypass everything

if (isDashboard) {
  const session = getSessionCookie(req)
  if (!session) return NextResponse.redirect(new URL('/en/dashboard/login', req.url))
}

return intlMiddleware(req)
```

---

## File Upload Pattern (Screenshots)

```typescript
// In API route
const formData = await req.formData()
const file = formData.get('file') as File

if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File too large' }, { status: 400 })
if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
}

const ext = file.type.split('/')[1]
const path = `${orderId}/${Date.now()}.${ext}`
const buffer = await file.arrayBuffer()

const { error } = await supabase.storage
  .from('screenshots')
  .upload(path, buffer, { contentType: file.type })
```

---

## Dashboard Auth Check

```typescript
const ADMIN_ROLES = ['superAdmin', 'contentAdmin', 'paymentAdmin']

// In dashboard layout or page
const session = await auth.api.getSession({ headers: await headers() })
if (!session || !ADMIN_ROLES.includes(session.user.role as string)) {
  redirect(`/${locale}/dashboard/login`)
}

// Role-specific check
if (session.user.role !== 'superAdmin') {
  redirect(`/${locale}/dashboard`)
}
```

---

## Current Hardcoded Values (Fix in Phase 9)

```typescript
// Temporary hardcoded userId — replace with real session
const TEMP_USER_ID = '8LUaQsVuXEqvMUnZIqL5Wl5KkVaEycMX'
```

---

## Test Data in DB
- Test user: `admin@mckurdshop.com` / `Admin123!` / role: `superAdmin`
- Test category: Shaders (slug: `shaders`)
- Test product: `df816a8d-f707-4a0c-a3a7-51703fec49b5` (slug: `test-product`, price: 15000 IQD)

---

## Common Mistakes To Avoid

1. **Don't use `middleware.ts`** — it's `proxy.ts` in this project (Next.js 16)
2. **Don't forget to quote camelCase columns in SQL** — `"nameEn"` not `nameEn`
3. **Don't use `user.id` as UUID** — BetterAuth uses text IDs
4. **Don't use `import 'server-only'` when running BetterAuth CLI** — remove temporarily, add back after
5. **Don't touch BetterAuth tables** — `user`, `session`, `account`, `verification`
6. **Don't use `localStorage`** — not supported in Claude.ai artifacts or this project
7. **Don't create files in `(main)` that should be standalone** — checkout and order pages are outside `(main)` intentionally (no navbar)
8. **Don't forget `"use client"` on components that use hooks**
9. **Always use `@/i18n/navigation` imports not `next/navigation`** for Link, redirect, useRouter, usePathname
10. **Don't run `npx better-auth migrate` with `server-only` import** — remove it first
