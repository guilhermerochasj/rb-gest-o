// netlify/functions/datajud.js
// Função serverless que consulta o DataJud pelo servidor (resolve CORS)

const DATAJUD_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

const TRIBUNAIS = {
  tjpi: 'api_publica_tjpi',
  trf1: 'api_publica_trf1',
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ erro: 'Método não permitido' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ erro: 'JSON inválido' }) }; }

  const { numero, tribunal } = body;
  if (!numero || !tribunal) {
    return { statusCode: 400, headers, body: JSON.stringify({ erro: 'Informe numero e tribunal' }) };
  }

  const alias = TRIBUNAIS[tribunal.toLowerCase()];
  if (!alias) {
    return { statusCode: 400, headers, body: JSON.stringify({ erro: `Tribunal inválido. Use: tjpi ou trf1` }) };
  }

  const url = `https://api-publica.datajud.cnj.jus.br/${alias}/_search`;

  // Aceita número com ou sem máscara — normaliza para o formato CNJ com máscara
  // Ex: 08009222120268180066 → 0800922-21.2026.8.18.0066
  let numeroNorm = numero.trim();
  const somenteDigitos = numeroNorm.replace(/\D/g, '');
  if (somenteDigitos.length === 20) {
    numeroNorm = `${somenteDigitos.slice(0,7)}-${somenteDigitos.slice(7,9)}.${somenteDigitos.slice(9,13)}.${somenteDigitos.slice(13,14)}.${somenteDigitos.slice(14,16)}.${somenteDigitos.slice(16,20)}`;
  }

  const query = {
    query: {
      bool: {
        should: [
          { match: { numeroProcesso: numeroNorm } },
          { match: { numeroProcesso: somenteDigitos } },
        ],
        minimum_should_match: 1
      }
    },
    sort: [{ dataHora: { order: 'desc' } }],
    size: 1
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `APIKey ${DATAJUD_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      const texto = await response.text();
      return { statusCode: response.status, headers, body: JSON.stringify({ erro: `Erro DataJud: ${response.status}`, detalhe: texto }) };
    }

    const data = await response.json();
    const hits = data?.hits?.hits || [];

    if (!hits.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ encontrado: false, mensagem: 'Processo não encontrado no DataJud.' }) };
    }

    const proc = hits[0]._source;

    const movimentacoes = (proc.movimentos || [])
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
      .slice(0, 15)
      .map(m => ({
        data: m.dataHora,
        descricao: m.nome || m.complementosTabelados?.[0]?.descricao || 'Movimentação',
        complemento: m.complemento || '',
      }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        encontrado: true,
        tribunal: proc.tribunal || tribunal.toUpperCase(),
        numero: proc.numeroProcesso,
        classe: proc.classe?.nome || '—',
        assunto: proc.assuntos?.[0]?.nome || '—',
        dataAjuizamento: proc.dataAjuizamento,
        grau: proc.grau || '—',
        orgaoJulgador: proc.orgaoJulgador?.nome || '—',
        movimentacoes,
      }),
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ erro: 'Erro interno', detalhe: err.message }) };
  }
};
