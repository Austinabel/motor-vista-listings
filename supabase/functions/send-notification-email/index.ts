import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, name, subject, title, message, type }: NotificationEmailRequest = await req.json();

    console.log('Sending notification email to:', email, 'Type:', type);

    const getEmailColor = (type: string) => {
      switch (type) {
        case 'approval': return '#10B981'; // Green
        case 'rejection': return '#EF4444'; // Red
        default: return '#3B82F6'; // Blue
      }
    };

    const getEmailIcon = (type: string) => {
      switch (type) {
        case 'approval': return '✅';
        case 'rejection': return '❌';
        default: return 'ℹ️';
      }
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background: ${getEmailColor(type)}; color: white; width: 60px; height: 60px; border-radius: 50%; line-height: 60px; font-size: 24px; margin-bottom: 20px;">
                  ${getEmailIcon(type)}
                </div>
                <h1 style="margin: 0; color: #1a1a1a; font-size: 24px;">${title}</h1>
              </div>
              
              <!-- Greeting -->
              <p style="font-size: 16px; margin-bottom: 20px;">Hello ${name},</p>
              
              <!-- Message -->
              <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${getEmailColor(type)};">
                <p style="margin: 0; font-size: 16px; white-space: pre-line;">${message}</p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Best regards,<br>
                  The Motorcars.ng Team
                </p>
                <div style="margin-top: 20px;">
                  <a href="https://motorcars.ng" style="color: #dc2626; text-decoration: none; font-weight: bold;">
                    🚗 motorcars.ng
                  </a>
                </div>
              </div>
              
            </div>
            
            <!-- Disclaimer -->
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This email was sent from motorcars.ng. If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: 'motorcars.ng <onboarding@resend.dev>',
      to: [email],
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully to:', email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error in send-notification-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);