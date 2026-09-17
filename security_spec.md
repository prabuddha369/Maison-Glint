# Security Specification — Maison Glint Storefront

## 1. Data Invariants
- **Products**: Any public client can read the catalog (`products`). Only authenticated atelier administrators can create, update, or delete products.
- **Orders**:
  - Any user (authenticated or guest with valid structure) can create an order with initial status `"pending_payment"`.
  - An authenticated user can only list or read orders where `userId == request.auth.uid`.
  - Admins can read all orders and update status (e.g., transition from `"pending_payment"` to `"processing"` / `"shipped"`).
  - Unauthenticated guests can view their order if they possess the exact unique `orderId` during the confirmation flow.
- **Users**: Users can only read and write their own profile document (`/users/{userId}` where `userId == request.auth.uid`).
- **Admins**: Read-only lookup for determining administrative privileges, bootstrapped for atelier administrators.

## 2. Dirty Dozen Malicious Payloads Tested
1. **Payload 01 (Privilege Escalation in User Profile)**: Attempting to write `{ role: "admin" }` or `{ isAdmin: true }` inside `/users/{uid}`.
2. **Payload 02 (Cross-User Profile Hijacking)**: Attacker with `uid: "alice"` attempting to write or read `/users/bob`.
3. **Payload 03 (Order Status Tampering)**: Customer attempting to submit order directly with `status: "paid"` or `status: "shipped"` bypassing payment gateway.
4. **Payload 04 (Ghost Field Injection)**: Injecting arbitrary executable script or unauthorized fields into `orders` documents.
5. **Payload 05 (Negative Price Injection)**: Submitting a product or order with negative pricing (`price: -500`).
6. **Payload 06 (Order Hijacking via List Query)**: Non-admin user querying `orders` collection without a `userId == request.auth.uid` clause.
7. **Payload 07 (Product Modification by Customer)**: Non-admin attempting to update price or delete items from `/products/{productId}`.
8. **Payload 08 (Oversized Payload Denial of Wallet)**: Submitting descriptions > 2000 chars or ID > 128 chars.
9. **Payload 09 (Order Total Inconsistency)**: Attempting to set `total` to non-number or NaN.
10. **Payload 10 (Admin Directory Tampering)**: Regular user attempting to write to `/admins/{uid}`.
11. **Payload 11 (Customer Order Deletion)**: Customer attempting to delete an existing captured order.
12. **Payload 12 (Address Spoofing for Another User)**: Modifying another user's saved addresses array.
