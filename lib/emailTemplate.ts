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

