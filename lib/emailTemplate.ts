export interface ReservationEmailData {
  serialNumber: string;
  collectorName: string;
  collectorEmail: string;
  productName: string;
  ritual: string;
  destination: string;
  specification: string;
  status: string;
  expiresAt?: string;
}

export function generateReservationEmailHtml(data: ReservationEmailData): string {
  const isWaitlist = data.status === 'waitlist';
  const statusDisplay = isWaitlist
    ? 'Priority Waitlist Slot'
    : 'Allocated Serial Slot (Edition 01)';

  const formattedExpiry = data.expiresAt
    ? new Date(data.expiresAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : '48 hours from registration';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maison Glint — Allocation Archive Record [${data.serialNumber}]</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111111;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F7F4EE; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E5E5E3; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">
          
          <!-- Atelier Header Banner -->
          <tr>
            <td style="padding: 36px 40px 24px 40px; border-bottom: 1px solid #F0F0EE;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.28em; color: #111111; margin-bottom: 4px;">
                      MAISON GLINT
                    </div>
                    <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #C5A059; font-weight: 500;">
                      EDITION 01 ALLOCATION ARCHIVE
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-family: monospace; font-size: 12px; font-weight: 600; color: #111111; background-color: #F7F4EE; border: 1px solid #E5E5E3; padding: 5px 10px; letter-spacing: 0.08em;">
                      ${data.serialNumber}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 40px 28px 40px;">
              <!-- Title -->
              <h1 style="font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size: 30px; line-height: 1.25; font-weight: 300; color: #111111; margin: 0 0 16px 0;">
                Priority Allocation Record
              </h1>

              <p style="font-size: 13px; line-height: 1.65; color: #444748; font-weight: 300; margin: 0 0 20px 0;">
                Your provisional serial slot in Edition 01 has been registered in the Zurich archive for 
                <strong style="color: #111111; font-weight: 500;">${data.collectorName || 'Collector'}</strong>.
              </p>

              <!-- Polite Auto-Expiration Notice -->
              <div style="background-color: #FBFBFA; border: 1px solid #E5E5E3; border-left: 3px solid #C5A059; padding: 14px 18px; margin-bottom: 26px; font-size: 12px; line-height: 1.6; color: #111111;">
                This provisional allocation is reserved for <strong>48 hours</strong> (expiring <strong>${formattedExpiry}</strong>). To secure your serial piece before it is deallocated and returned to the atelier archive, please log into your Collector Account to complete your setting order.
              </div>

              <!-- Archive Specification Dossier Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBFBFA; border: 1px solid #E5E5E3; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #747878; width: 38%;">
                    Reserved Object
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 12px; font-weight: 500; color: #111111; text-align: right;">
                    ${data.productName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #747878;">
                    Application Ritual
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 12px; color: #111111; text-align: right;">
                    ${data.ritual}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #747878;">
                    Collector
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 12px; font-family: monospace; color: #111111; text-align: right;">
                    ${data.collectorEmail}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #747878;">
                    Destination
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 12px; color: #111111; text-align: right;">
                    ${data.destination}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #747878;">
                    Specification
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 12px; color: #444748; text-align: right;">
                    ${data.specification}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #747878;">
                    Validity Window
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #EFEFEF; font-size: 11px; font-weight: 600; color: #C5A059; text-align: right;">
                    48 Hours (Until ${formattedExpiry})
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #747878;">
                    Archive Status
                  </td>
                  <td style="padding: 12px 18px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #C5A059; text-align: right;">
                    ${statusDisplay}
                  </td>
                </tr>
              </table>

              <!-- Archival Notice (Strictly informational, no buttons) -->
              <p style="font-size: 12px; line-height: 1.6; color: #747878; font-weight: 300; margin: 0 0 24px 0;">
                Each exemplar is numbered chronologically according to verified atelier registration. When the private acquisition window opens, you will receive advance notice 48 hours prior to public release to complete your setting order.
              </p>

              <!-- Zero-Sign-Off Rule: Final substantive sentence followed by authentic hallmark -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E5E3;">
                <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16px; font-weight: 600; color: #111111; letter-spacing: 0.05em; line-height: 1.3;">
                  Maison Glint
                </div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #747878; margin-top: 3px;">
                  Atelier Zurich
                </div>
              </div>
            </td>
          </tr>

          <!-- Discreet Footer -->
          <tr>
            <td style="padding: 18px 40px; background-color: #F7F4EE; border-top: 1px solid #E5E5E3; font-size: 10px; color: #8E9192; line-height: 1.5;">
              Maison Glint &middot; Metallurgical Studio &middot; Zurich &middot; Milan<br>
              This is an automated allocation record generated for ${data.collectorEmail}.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateReservationEmailText(data: ReservationEmailData): string {
  const isWaitlist = data.status === 'waitlist';
  const statusDisplay = isWaitlist
    ? 'Priority Waitlist Slot'
    : 'Allocated Serial Slot (Edition 01)';

  const formattedExpiry = data.expiresAt
    ? new Date(data.expiresAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : '48 hours from registration';

  return `MAISON GLINT
EDITION 01 ALLOCATION ARCHIVE RECORD
Serial Reference: ${data.serialNumber}
--------------------------------------------------

Your provisional serial slot in Edition 01 has been registered in the Zurich archive for ${data.collectorName || 'Collector'}.

NOTICE:
This provisional allocation is reserved for 48 hours (expiring ${formattedExpiry}). To secure your serial piece before it is deallocated and returned to the atelier archive, please log into your Collector Account to complete your setting order.

ALLOCATION DOSSIER:
- Reserved Object: ${data.productName}
- Application Ritual: ${data.ritual}
- Collector: ${data.collectorEmail}
- Destination: ${data.destination}
- Specification: ${data.specification}
- Validity Window: 48 Hours (Until ${formattedExpiry})
- Status: ${statusDisplay}

Each exemplar is numbered chronologically according to verified atelier registration. When the private acquisition window opens, you will receive advance notice 48 hours prior to public release to complete your setting order.

Maison Glint
Atelier Zurich
--------------------------------------------------
Maison Glint · Metallurgical Studio · Zurich · Milan
Automated allocation record for ${data.collectorEmail}.
`;
}

export function generateNewsletterWelcomeEmailHtml(email: string, unsubscribeUrl?: string): string {
  const unsubLink = unsubscribeUrl || `https://maisonglint.com/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maison Glint — Welcome to the Atelier Correspondence</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111111;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F7F4EE; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #E5E5E3; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">
          
          <!-- Atelier Header -->
          <tr>
            <td style="padding: 36px 40px 24px 40px; border-bottom: 1px solid #F0F0EE;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.28em; color: #111111; margin-bottom: 4px;">
                      MAISON GLINT
                    </div>
                    <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #C5A059; font-weight: 500;">
                      MODERNIST CHROMEWARE · ATELIER JOURNAL
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.16em; color: #1C731C; background-color: #EEF8EE; border: 1px solid #BFE4BF; padding: 4px 8px;">
                      SUBSCRIBED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Greeting Body -->
          <tr>
            <td style="padding: 36px 40px 32px 40px;">
              <div style="font-family: Georgia, serif; font-size: 26px; font-weight: 300; line-height: 1.25; color: #111111; margin-bottom: 18px;">
                Welcome to the Atelier.
              </div>

              <p style="font-size: 13px; line-height: 1.8; color: #444748; font-weight: 300; margin: 0 0 16px 0;">
                Your address (<span style="font-family: monospace; font-size: 12px; color: #111111;">${email}</span>) has been added to our private correspondence circle.
              </p>

              <p style="font-size: 13px; line-height: 1.8; color: #444748; font-weight: 300; margin: 0 0 24px 0;">
                Maison Glint produces restricted serial editions of mirror-finished chromeware. Through this channel, you will receive quiet observations on material craft, seasonal tablescapes, and unreleased batch release announcements prior to public drops.
              </p>

              <div style="background-color: #F9F9F7; border-left: 2px solid #C5A059; padding: 14px 18px; margin-bottom: 28px;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #747878; margin-bottom: 4px; font-weight: 500;">
                  CORRESPONDENCE ETHOS
                </div>
                <div style="font-size: 12px; color: #111111; line-height: 1.6; font-style: italic;">
                  "A curve. A glint. The room, reflected. Objects crafted for considered daily ritual."
                </div>
              </div>

              <div style="text-align: left; padding-top: 8px;">
                <a href="https://maisonglint.com" style="display: inline-block; background-color: #111111; color: #F9F9F7; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 500; text-decoration: none; padding: 14px 28px; border: 1px solid #111111;">
                  Explore The Collection
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer & Unsubscribe -->
          <tr>
            <td style="padding: 24px 40px; background-color: #FAFAFA; border-top: 1px solid #F0F0EE; font-size: 10px; color: #8C8C8C; line-height: 1.6;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="color: #444748; font-weight: 500; margin-bottom: 2px;">Maison Glint Atelier</div>
                    <div>Zurich · Milan</div>
                  </td>
                  <td align="right">
                    <a href="${unsubLink}" style="color: #8C8C8C; text-decoration: underline; font-size: 10px;">
                      Unsubscribe
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateNewsletterWelcomeEmailText(email: string, unsubscribeUrl?: string): string {
  const unsubLink = unsubscribeUrl || `https://maisonglint.com/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  return `MAISON GLINT
MODERNIST CHROMEWARE · ATELIER JOURNAL
--------------------------------------------------

Welcome to the Atelier.

Your address (${email}) has been added to our private correspondence circle.

Maison Glint produces restricted serial editions of mirror-finished chromeware. Through this channel, you will receive quiet observations on material craft, seasonal tablescapes, and unreleased batch release announcements prior to public drops.

Explore the Collection: https://maisonglint.com

--------------------------------------------------
Maison Glint Atelier · Zurich · Milan
Unsubscribe: ${unsubLink}
`;
}

// ---------------------------------------------------------------------------
// Order Confirmation Email
// ---------------------------------------------------------------------------

export interface OrderConfirmationEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  taxEstimate: number;
  total: number;
  currency: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: {
    title: string;
    estimatedDelivery: string;
  };
  paymentMethod?: string;
  cashfreePaymentId?: string;
}

export function buildOrderConfirmationEmail(data: OrderConfirmationEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Maison Glint · Acquisition Confirmed — ${data.orderId}`;

  const itemRows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ee; font-family: Georgia, serif; font-size: 14px; color: #111111;">${item.name}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ee; text-align: center; font-size: 12px; color: #8c8c8c;">${item.quantity}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ee; text-align: right; font-family: 'Courier New', monospace; font-size: 13px; font-weight: 600; color: #111111;">$${(item.price * item.quantity).toLocaleString()} ${data.currency}</td>
        </tr>`
    )
    .join('');

  const addressLines = [
    data.shippingAddress.fullName,
    data.shippingAddress.line1,
    data.shippingAddress.line2,
    `${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}`,
    data.shippingAddress.country,
  ]
    .filter(Boolean)
    .join('<br />');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f3; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f3; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e5e5e3;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 48px 32px; border-bottom: 1px solid #e5e5e3;">
              <p style="margin: 0 0 6px; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #8c8c8c;">Authorized Allocation Ledger</p>
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 400; color: #111111; letter-spacing: 0.05em;">Maison Glint</h1>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 32px 48px; background-color: #111111; border-bottom: 1px solid #d4af37;">
              <p style="margin: 0 0 4px; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #8c8c8c;">Acquisition Confirmed</p>
              <p style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 22px; color: #f5f5f3; font-weight: 300;">${data.orderId}</p>
              <p style="margin: 0; font-size: 11px; color: #8c8c8c; letter-spacing: 0.1em;">Your object has been formally allocated to your atelier dossier.</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 48px 24px;">
              <p style="margin: 0; font-size: 14px; color: #111111; line-height: 1.7;">Dear ${data.customerName},</p>
              <p style="margin: 12px 0 0; font-size: 13px; color: #555555; line-height: 1.8;">Your payment has been confirmed and your acquisition is registered in the Maison Glint ledger. Each piece is produced to order — your allocation is now secured.</p>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 48px 24px;">
              <p style="margin: 0 0 16px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8c8c8c; border-bottom: 1px solid #e5e5e3; padding-bottom: 8px;">Secured Objects</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align: left; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #8c8c8c; padding-bottom: 8px; font-weight: 500;">Object</th>
                    <th style="text-align: center; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #8c8c8c; padding-bottom: 8px; font-weight: 500;">Qty</th>
                    <th style="text-align: right; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #8c8c8c; padding-bottom: 8px; font-weight: 500;">Value</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
            </td>
          </tr>

          <!-- Financial Summary -->
          <tr>
            <td style="padding: 0 48px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f7; border: 1px solid #e5e5e3; padding: 20px;">
                <tr>
                  <td style="padding: 4px 20px;"><p style="margin: 0; font-size: 11px; color: #8c8c8c;">Subtotal</p></td>
                  <td style="padding: 4px 20px; text-align: right;"><p style="margin: 0; font-family: 'Courier New', monospace; font-size: 12px; color: #111111;">$${data.subtotal.toLocaleString()} ${data.currency}</p></td>
                </tr>
                <tr>
                  <td style="padding: 4px 20px;"><p style="margin: 0; font-size: 11px; color: #8c8c8c;">Delivery</p></td>
                  <td style="padding: 4px 20px; text-align: right;"><p style="margin: 0; font-family: 'Courier New', monospace; font-size: 12px; color: #111111;">${data.shippingCost === 0 ? 'Complimentary' : `$${data.shippingCost} ${data.currency}`}</p></td>
                </tr>
                ${data.taxEstimate > 0 ? `
                <tr>
                  <td style="padding: 4px 20px;"><p style="margin: 0; font-size: 11px; color: #8c8c8c;">Tax</p></td>
                  <td style="padding: 4px 20px; text-align: right;"><p style="margin: 0; font-family: 'Courier New', monospace; font-size: 12px; color: #111111;">$${data.taxEstimate.toLocaleString()} ${data.currency}</p></td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 20px 4px; border-top: 1px solid #e5e5e3;"><p style="margin: 0; font-size: 12px; font-weight: 600; color: #111111; letter-spacing: 0.05em;">Total Investment</p></td>
                  <td style="padding: 12px 20px 4px; border-top: 1px solid #e5e5e3; text-align: right;"><p style="margin: 0; font-family: Georgia, serif; font-size: 18px; font-weight: 700; color: #111111;">$${data.total.toLocaleString()} ${data.currency}</p></td>
                </tr>
                ${data.paymentMethod ? `
                <tr>
                  <td style="padding: 4px 20px;"><p style="margin: 0; font-size: 11px; color: #8c8c8c;">Paid via</p></td>
                  <td style="padding: 4px 20px; text-align: right;"><p style="margin: 0; font-size: 11px; color: #555555;">${data.paymentMethod}</p></td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- Delivery Address -->
          <tr>
            <td style="padding: 0 48px 32px;">
              <p style="margin: 0 0 12px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8c8c8c; border-bottom: 1px solid #e5e5e3; padding-bottom: 8px;">Dispatch Destination</p>
              <p style="margin: 0; font-size: 13px; color: #111111; line-height: 1.8;">${addressLines}</p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #8c8c8c;">${data.shippingMethod.title}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #555555;">${data.shippingMethod.estimatedDelivery}</p>
            </td>
          </tr>

          <!-- What Happens Next -->
          <tr>
            <td style="padding: 24px 48px; background-color: #f9f9f7; border-top: 1px solid #e5e5e3; border-bottom: 1px solid #e5e5e3;">
              <p style="margin: 0 0 12px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8c8c8c;">What Happens Next</p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #555555; line-height: 1.7;">— Your object enters the Maison Glint production queue.</p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #555555; line-height: 1.7;">— You will receive a dispatch notification with tracking when your consignment is released.</p>
              <p style="margin: 0; font-size: 12px; color: #555555; line-height: 1.7;">— For enquiries, respond to this email or contact <a href="mailto:founder@maisonglint.com" style="color: #111111;">founder@maisonglint.com</a>.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; text-align: center;">
              <p style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 16px; letter-spacing: 0.15em; color: #111111;">Maison Glint</p>
              <p style="margin: 0; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8c8c8c;">Modernist Chromeware</p>
              ${data.cashfreePaymentId ? `<p style="margin: 16px 0 0; font-size: 9px; font-family: 'Courier New', monospace; color: #cccccc;">Payment Ref: ${data.cashfreePaymentId}</p>` : ''}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `MAISON GLINT — ACQUISITION CONFIRMED
Order: ${data.orderId}

Dear ${data.customerName},

Your payment has been confirmed. Your acquisition is registered in the Maison Glint ledger.

SECURED OBJECTS
${data.items.map((i) => `${i.name} × ${i.quantity} — $${(i.price * i.quantity).toLocaleString()} ${data.currency}`).join('\n')}

Subtotal: $${data.subtotal.toLocaleString()} ${data.currency}
Delivery: ${data.shippingCost === 0 ? 'Complimentary' : `$${data.shippingCost} ${data.currency}`}
${data.taxEstimate > 0 ? `Tax: $${data.taxEstimate.toLocaleString()} ${data.currency}\n` : ''}Total: $${data.total.toLocaleString()} ${data.currency}
${data.paymentMethod ? `Paid via: ${data.paymentMethod}` : ''}

DELIVERY ADDRESS
${[data.shippingAddress.fullName, data.shippingAddress.line1, data.shippingAddress.line2, `${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}`, data.shippingAddress.country].filter(Boolean).join('\n')}

Shipping: ${data.shippingMethod.title}
Estimated: ${data.shippingMethod.estimatedDelivery}

For enquiries: founder@maisonglint.com

--
Maison Glint · Modernist Chromeware
`;

  return { subject, html, text };
}
