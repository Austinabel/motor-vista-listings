import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
// Must be an address on a domain verified in Resend (for example "Motorcars <noreply@motorcars.ng>").
// Resend's test sender only delivers to the Resend account owner.
const emailFrom = Deno.env.get('EMAIL_FROM') ?? 'Motorcars <onboarding@resend.dev>';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  email: string;
  name: string;
  subject: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'info';
}

const TYPES = new Set(['approval', 'rejection', 'info']);

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

// Every value inserted into the email is escaped, so callers cannot inject HTML or links
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

/** True only when the request carries a signed-in admin's session. */
const callerIsAdmin = async (req: Request) => {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return false;

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: isAdmin, error } = await supabase.rpc('is_admin', { user_id: user.id });
  return !error && isAdmin === true;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Only admins may send notification emails; the public key alone is not enough
    if (!(await callerIsAdmin(req))) {
      return json({ error: 'Not authorised' }, 403);
    }

    const { email, name, subject, title, message, type }: NotificationEmailRequest = await req.json();
    if (!email || !subject || !title || !message || !TYPES.has(type)) {
      return json({ error: 'email, subject, title, message and a valid type are required' }, 400);
    }

    const getEmailColor = (type: string) => {
      switch (type) {
        case 'approval': return '#0B5C2E'; // Motorcars green
        case 'rejection': return '#B42318'; // Red
        default: return '#C9A84C'; // Motorcars gold
      }
    };

    const getEmailIcon = (type: string) => {
      switch (type) {
        case 'approval': return '✅';
        case 'rejection': return '❌';
        default: return 'ℹ️';
      }
    };

    const safe = {
      subject: escapeHtml(subject),
      title: escapeHtml(title),
      name: escapeHtml(name || 'there'),
      message: escapeHtml(message),
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${safe.subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #17251C;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F0E3;">
            <div style="background: #FFFCF6; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">

              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background: ${getEmailColor(type)}; color: white; width: 60px; height: 60px; border-radius: 50%; line-height: 60px; font-size: 24px; margin-bottom: 20px;">
                  ${getEmailIcon(type)}
                </div>
                <h1 style="margin: 0; color: #17251C; font-size: 24px;">${safe.title}</h1>
              </div>

              <!-- Greeting -->
              <p style="font-size: 16px; margin-bottom: 20px;">Hello ${safe.name},</p>

              <!-- Message -->
              <div style="background: #F7F0E3; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${getEmailColor(type)};">
                <p style="margin: 0; font-size: 16px; white-space: pre-line;">${safe.message}</p>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E7DDCA;">
                <p style="margin: 0; color: #667168; font-size: 14px;">
                  Best regards,<br>
                  The Motorcars team
                </p>
                <div style="margin-top: 20px;">
                  <a href="https://motorcars.ng" style="color: #0B5C2E; text-decoration: none; font-weight: bold;">
                    motorcars.ng
                  </a>
                </div>
              </div>

            </div>

            <!-- Disclaimer -->
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #667168; font-size: 12px; margin: 0;">
                This email was sent from motorcars.ng. If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: emailFrom,
      to: [email],
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return json({ success: true }, 200);
  } catch (error: any) {
    console.error('Error in send-notification-email function:', error);
    return json({ error: 'Could not send the email' }, 500);
  }
};

serve(handler);
