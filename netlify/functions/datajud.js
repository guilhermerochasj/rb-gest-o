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

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ erro: 'Método não permitido' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ erro: 'JSON inválido' }) }; }

  const { numero, tribunal } = body;
  if (!numero || !tribunal) return { statusCode: 400, headers, body: JSON.stringify({ erro: 'Informe numero e tribunal' }) };

  const alias = TRIBUNAIS[tribunal.toLowerCase()];
  if (!alias) return { statusCode: 400, headers, body: JSON.stringify({ erro: 'Tribunal inválido. Use: tjpi ou trf1' }) };

  const url = `https://api-publica.datajud.cnj.jus.br/${alias}/_search`;

  let numeroNorm = numero.trim();
  const somenteDigitos = numeroNorm.replace(/\D/g, '');

  // Monta todas as variações possíveis do número
  const variacoes = [numeroNorm];
  if (somenteDigitos.length === 20) {
    const comMascara = `${somenteDigitos.slice(0,7)}-${somenteDigitos.slice(7,9)}.${somenteDigitos.slice(9,13)}.${somenteDigitos.slice(13,14)}.${somenteDigitos.slice(14,16)}.${somenteDigitos.slice(16,20)}`;
    variacoes.push(comMascara, somenteDigitos);
  } else if (somenteDigitos.length === 19) {
    // Tenta com zero à esquerda
    const com0 = '0' + somenteDigitos;
    const comMascara0 = `${com0.slice(0,7)}-${com0.slice(7,9)}.${com0.slice(9,13)}.${com0.slice(13,14)}.${com0.slice(14,16)}.${com0.slice(16,20)}`;
    variacoes.push(comMascara0, com0, somenteDigitos);
  } else {
    variacoes.push(somenteDigitos);
  }

  const query = {
    query: {
      bool: {
        should: variacoes.map(v => ({ match: { numeroProcesso: v } })),
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
      let detalheMsg = texto;
      try { const e = JSON.parse(texto); detalheMsg = e.error?.reason || e.error?.type || texto; } catch(e) {}
      return { statusCode: 200, headers, body: JSON.stringify({
        encontrado: false,
        mensagem: `DataJud retornou erro ${response.status}: ${detalheMsg}`
      })};
    }

    const data = await response.json();
    const hits = data?.hits?.hits || [];

    if (!hits.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ encontrado: false, mensagem: 'Processo não encontrado no DataJud. Pode ser sigiloso ou ainda não indexado.' }) };
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
