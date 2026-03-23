import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Resend } from 'resend';
import { getLocalDateString, getMonthBounds } from '@/lib/utils/dates';
import { MONTHS_ES } from '@/lib/constants';
import type { Database } from '@/lib/supabase/types';

function validateCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const today = getLocalDateString();
  const now = new Date(today + 'T07:00:00');
  // Get previous month
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = prevMonth.getFullYear();
  const month = prevMonth.getMonth() + 1;
  const { start, end } = getMonthBounds(year, month);
  const startStr = getLocalDateString(start);
  const endStr = getLocalDateString(end);
  const monthName = MONTHS_ES[month - 1];

  const supabase = createAdminClient();

  // Get all users with emails
  const { data: { users } } = await supabase.auth.admin.listUsers();

  let sent = 0;
  let errors = 0;

  for (const user of users) {
    if (!user.email) continue;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .single();

      // Get habit records for the month
      const { data: habits } = await supabase
        .from('habits')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_archived', false);

      const habitIds = (habits ?? []).map((h) => h.id);

      let completionRate = 0;
      if (habitIds.length > 0) {
        const { data: records } = await supabase
          .from('habit_records')
          .select('completed')
          .in('habit_id', habitIds)
          .gte('date', startStr)
          .lte('date', endStr);

        const total = (records ?? []).length;
        const completed = (records ?? []).filter((r) => r.completed).length;
        completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      }

      // Get avg rating
      const { data: ratings } = await supabase
        .from('day_ratings')
        .select('rating')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr);

      const avgRating = ratings && ratings.length > 0
        ? (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length).toFixed(1)
        : 'Sin datos';

      const displayName = profile?.display_name ?? profile?.username ?? user.email.split('@')[0];
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tu-app.vercel.app';

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
    h1 { color: #818cf8; font-size: 24px; margin-bottom: 8px; }
    .stat { background: #0f172a; border-radius: 12px; padding: 16px; margin: 12px 0; text-align: center; }
    .stat-value { font-size: 36px; font-weight: bold; color: #6366f1; }
    .stat-label { color: #94a3b8; font-size: 14px; margin-top: 4px; }
    .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
    .footer { color: #475569; font-size: 12px; margin-top: 24px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Tu reporte mensual</h1>
    <p style="color: #94a3b8;">Hola ${displayName}! Aquí está tu resumen de <strong style="color: #f1f5f9;">${monthName} ${year}</strong>.</p>

    <div class="stat">
      <div class="stat-value">${completionRate}%</div>
      <div class="stat-label">Tasa de completado de hábitos</div>
    </div>

    <div class="stat">
      <div class="stat-value">${avgRating} ⭐</div>
      <div class="stat-label">Promedio de valoración diaria</div>
    </div>

    <div class="stat">
      <div class="stat-value">${habits?.length ?? 0}</div>
      <div class="stat-label">Hábitos activos</div>
    </div>

    <div style="text-align: center;">
      <a href="${appUrl}/estadisticas" class="btn">Ver estadísticas completas</a>
    </div>

    <div class="footer">
      <p>StoaTrack &mdash; Tu desarrollo personal, cada día</p>
      <p>Recibís este email porque tenés una cuenta en StoaTrack</p>
    </div>
  </div>
</body>
</html>`;

      await resend.emails.send({
        from: 'StoaTrack <noreply@habitospro.com>',
        to: user.email,
        subject: `Tu reporte de ${monthName} ${year} - StoaTrack`,
        html: emailHtml,
      });

      // Log the email
      await supabase.from('email_report_logs').insert({
        user_id: user.id,
        report_type: 'monthly' as const,
        period_start: startStr,
        period_end: endStr,
        status: 'sent' as const,
      });

      sent++;
    } catch (err) {
      errors++;

      try {
        await supabase.from('email_report_logs').insert({
          user_id: user.id,
          report_type: 'monthly' as const,
          period_start: startStr,
          period_end: endStr,
          status: 'failed' as const,
          error_message: (err as Error).message,
        });
      } catch { /* ignore log errors */ }
    }
  }

  return NextResponse.json({
    message: `Reportes mensuales enviados`,
    month: `${monthName} ${year}`,
    sent,
    errors,
  });
}
