// netlify/functions/enviar-email.js
// Envia notificações de movimentação processual via Resend

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const EMAILS = {
  remetente: 'RB Advogados <onboarding@resend.dev>', // Resend free tier usa esse domínio
  socio1: 'guilhermerochasj@gmail.com',
  socio2: 'rubensfilho5@hotmail.com',
  colaboradora: 'advaparecidasl@gmail.com',
};

// Todos recebem notificações
const DESTINATARIOS = [EMAILS.socio1, EMAILS.socio2, EMAILS.colaboradora];

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ erro: 'Método não permitido' }) };

  if (!RESEND_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ erro: 'RESEND_API_KEY não configurada' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ erro: 'JSON inválido' }) }; }

  const { tipo, cliente, processo, responsavel, movimentacao, area, dataHora } = body;
  // tipo: 'movimentacao' | 'resumo_diario'
  // responsavel: nome do responsável pelo processo

  let assunto, html;

  if (tipo === 'movimentacao') {
    assunto = `📋 Nova Movimentação — ${cliente} (${processo || 'Sem processo'})`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:10px;overflow:hidden">
        <div style="background:#0A0A0A;padding:24px 28px;text-align:center">
          <h1 style="color:#C9A84C;font-size:22px;margin:0;letter-spacing:1px">RB Advogados</h1>
          <p style="color:#666;font-size:12px;margin:4px 0 0">Sistema de Gestão — Notificação Processual</p>
        </div>
        <div style="padding:28px">
          <div style="background:#fff;border-radius:8px;padding:20px;border-left:4px solid #C9A84C;margin-bottom:16px">
            <h2 style="color:#333;font-size:16px;margin:0 0 12px">Nova Movimentação Registrada</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#888;width:140px">Cliente</td><td style="padding:6px 0;color:#333;font-weight:bold">${cliente || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Processo</td><td style="padding:6px 0;color:#333">${processo || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Área</td><td style="padding:6px 0;color:#333">${area || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Responsável</td><td style="padding:6px 0;color:#333">${responsavel || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Data/Hora</td><td style="padding:6px 0;color:#333">${dataHora || new Date().toLocaleString('pt-BR')}</td></tr>
            </table>
          </div>
          <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:16px">
            <h3 style="color:#333;font-size:14px;margin:0 0 10px">Movimentação</h3>
            <p style="color:#555;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap">${movimentacao || '—'}</p>
          </div>
          <div style="text-align:center;padding:12px 0">
            <p style="color:#aaa;font-size:12px;margin:0">Este e-mail foi enviado automaticamente pelo sistema RB Advogados.</p>
          </div>
        </div>
      </div>`;

  } else if (tipo === 'resumo_diario') {
    const { processos } = body; // array de processos com movimentações do dia
    const hoje = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

    const linhasProcessos = (processos || []).map(p => `
      <tr style="border-bottom:1px solid #f0f0f0">
        <td style="padding:10px 8px;font-size:13px;color:#333;font-weight:bold">${p.cliente}</td>
        <td style="padding:10px 8px;font-size:13px;color:#555">${p.processo || '—'}</td>
        <td style="padding:10px 8px;font-size:13px;color:#555">${p.responsavel || '—'}</td>
        <td style="padding:10px 8px;font-size:13px;color:#555">${p.movimentacao}</td>
      </tr>`).join('');

    assunto = `📅 Resumo Diário de Movimentações — ${new Date().toLocaleDateString('pt-BR')}`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#f9f9f9;border-radius:10px;overflow:hidden">
        <div style="background:#0A0A0A;padding:24px 28px;text-align:center">
          <h1 style="color:#C9A84C;font-size:22px;margin:0;letter-spacing:1px">RB Advogados</h1>
          <p style="color:#666;font-size:12px;margin:4px 0 0">Resumo Diário — ${hoje}</p>
        </div>
        <div style="padding:28px">
          ${!(processos || []).length ? `
            <div style="background:#fff;border-radius:8px;padding:24px;text-align:center">
              <p style="color:#888;font-size:14px;margin:0">Nenhuma movimentação registrada hoje.</p>
            </div>` : `
            <div style="background:#fff;border-radius:8px;overflow:hidden;margin-bottom:16px">
              <table style="width:100%;border-collapse:collapse">
                <thead>
                  <tr style="background:#C9A84C">
                    <th style="padding:12px 8px;text-align:left;font-size:12px;color:#000;text-transform:uppercase">Cliente</th>
                    <th style="padding:12px 8px;text-align:left;font-size:12px;color:#000;text-transform:uppercase">Processo</th>
                    <th style="padding:12px 8px;text-align:left;font-size:12px;color:#000;text-transform:uppercase">Responsável</th>
                    <th style="padding:12px 8px;text-align:left;font-size:12px;color:#000;text-transform:uppercase">Movimentação</th>
                  </tr>
                </thead>
                <tbody>${linhasProcessos}</tbody>
              </table>
            </div>
            <p style="color:#888;font-size:12px;text-align:center">Total: ${(processos||[]).length} movimentação(ões) registrada(s) hoje.</p>`}
          <div style="text-align:center;padding:12px 0">
            <p style="color:#aaa;font-size:12px;margin:0">Resumo automático diário — RB Advogados Sistema de Gestão</p>
          </div>
        </div>
      </div>`;
  } else {
    return { statusCode: 400, headers, body: JSON.stringify({ erro: 'Tipo inválido. Use: movimentacao ou resumo_diario' }) };
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAILS.remetente,
        to: DESTINATARIOS,
        subject: assunto,
        html,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status, headers, body: JSON.stringify({ erro: 'Erro Resend', detalhe: data }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: data.id }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ erro: 'Erro interno', detalhe: err.message }) };
  }
};
