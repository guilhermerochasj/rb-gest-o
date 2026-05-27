// checklist-patch.js — RB Advogados
// Checklist de documentos por tipo de ação no modal de Docs
// v1.0

(function () {
  'use strict';

  function injectStyles() {
    if (document.getElementById('checklist-styles')) return;
    var s = document.createElement('style');
    s.id = 'checklist-styles';
    s.textContent =
      '#doc-checklist-section{margin:16px 0;border:1px solid rgba(212,175,55,.3);border-radius:10px;overflow:hidden;background:rgba(212,175,55,.04)}' +
      '#doc-checklist-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;background:rgba(212,175,55,.1);user-select:none}' +
      '#doc-checklist-header:hover{background:rgba(212,175,55,.18)}' +
      '#doc-checklist-header h4{margin:0;font-size:13px;color:#d4af37;font-weight:600;display:flex;align-items:center;gap:6px}' +
      '#doc-checklist-header .checklist-progress-text{font-size:11px;color:rgba(212,175,55,.7);font-weight:normal;margin-left:4px}' +
      '#doc-checklist-toggle-icon{font-size:12px;color:#d4af37;transition:transform .2s}' +
      '#doc-checklist-toggle-icon.open{transform:rotate(180deg)}' +
      '#doc-checklist-body{padding:12px 14px;display:none}' +
      '#doc-checklist-body.open{display:block}' +
      '.checklist-progress-bar-wrap{height:4px;background:rgba(212,175,55,.15);border-radius:2px;margin-bottom:12px;overflow:hidden}' +
      '.checklist-progress-bar-fill{height:100%;background:#d4af37;border-radius:2px;transition:width .3s}' +
      '.checklist-item{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer}' +
      '.checklist-item:last-child{border-bottom:none}' +
      '.checklist-item input[type=checkbox]{appearance:none;-webkit-appearance:none;width:16px;height:16px;min-width:16px;border:2px solid rgba(212,175,55,.5);border-radius:4px;background:transparent;cursor:pointer;position:relative;margin-top:2px;transition:all .2s}' +
      '.checklist-item input[type=checkbox]:checked{background:#d4af37;border-color:#d4af37}' +
      '.checklist-item input[type=checkbox]:checked::after{content:"✓";position:absolute;top:-2px;left:1px;font-size:11px;color:#1a1a1a;font-weight:bold}' +
      '.checklist-item label{font-size:12.5px;color:rgba(255,255,255,.8);cursor:pointer;line-height:1.4;transition:color .2s}' +
      '.checklist-item.checked label{color:rgba(255,255,255,.35);text-decoration:line-through}' +
      '.checklist-no-tipo{font-size:12px;color:rgba(255,255,255,.4);font-style:italic;text-align:center;padding:8px 0}' +
      '.checklist-all-done{text-align:center;padding:8px;color:#d4af37;font-size:12px;font-weight:600}';
    document.head.appendChild(s);
  }

  window.CHECKLIST_DOCS = {
    'Salário-Maternidade':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Certidão de nascimento do filho','Comprovante de residência','Extrato CNIS atualizado','Declaração de segurada do INSS','Cartão do INSS / NIT / PIS'],
    'Auxílio-Doença':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','Extrato CNIS atualizado','Laudos e relatórios médicos recentes','Exames complementares relacionados à doença','Receitas e prescrições médicas','Histórico de internações (se houver)','Cartão do INSS / NIT / PIS'],
    'Auxílio-Acidente':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','Extrato CNIS atualizado','Boletim de Ocorrência do acidente (se houver)','Laudos médicos pós-acidente','CAT – Comunicação de Acidente de Trabalho','Exames comprovando sequelas','Cartão do INSS / NIT / PIS'],
    'Aposentadoria por Invalidez':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','Extrato CNIS atualizado','Laudos médicos comprovando invalidez','Exames de imagem e laboratoriais','Relatório do médico especialista','Histórico de tratamentos','Cartão do INSS / NIT / PIS'],
    'Aposentadoria por Idade':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','Extrato CNIS atualizado','Certidão de nascimento ou casamento','Comprovante de atividade rural (se aplicável)','Declaração do sindicato (trabalhador rural)','Carnês de contribuição avulsa (se houver)','Cartão do INSS / NIT / PIS'],
    'Aposentadoria por Tempo de Contribuição':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','Extrato CNIS atualizado','Certidão de nascimento ou casamento','Carnês de contribuição avulsa (se houver)','Contratos de trabalho autônomo','Cartão do INSS / NIT / PIS'],
    'Aposentadoria Especial':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','Extrato CNIS atualizado','PPP – Perfil Profissiográfico Previdenciário','LTCAT – Laudo Técnico das Condições Ambientais do Trabalho','Certificado de EPI/EPC','Cartão do INSS / NIT / PIS'],
    'Pensão por Morte':['RG ou CNH','CPF do requerente','Certidão de óbito do segurado','Comprovante de residência','Extrato CNIS do falecido','Certidão de casamento ou união estável','Certidão de nascimento (dependente filho)','Comprovante de dependência econômica','Cartão do INSS / NIT / PIS do falecido'],
    'Auxílio-Reclusão':['RG ou CNH','CPF do requerente','Certidão de nascimento ou casamento','Comprovante de residência','Guia de recolhimento prisional','Extrato CNIS do preso','Comprovante de dependência econômica','Cartão do INSS / NIT / PIS do preso'],
    'BPC/LOAS — Pessoa com Deficiência':['RG ou CNH','CPF','Comprovante de residência','Certidão de nascimento','Laudos médicos comprovando deficiência','Relatório de avaliação social (CRAS)','Comprovante de renda familiar','Extrato CNIS de todos os membros da família','Declaração de composição familiar'],
    'BPC/LOAS — Idoso':['RG ou CNH','CPF','Comprovante de residência','Certidão de nascimento ou RG com data de nascimento','Comprovante de renda familiar','Extrato CNIS','Declaração de composição familiar','Relatório de avaliação social (CRAS)'],
    'Revisão de Benefício':['RG ou CNH','CPF','Comprovante de residência','Extrato CNIS atualizado','Carta de concessão do benefício','Extratos de pagamento do benefício','Documentos originais da concessão','Carteira de Trabalho (CTPS)'],
    'Restabelecimento de Benefício':['RG ou CNH','CPF','Comprovante de residência','Extrato CNIS atualizado','Carta de concessão do benefício anterior','Carta de cessação do benefício','Laudos médicos atuais (se por incapacidade)','Cartão do INSS / NIT / PIS'],
    'Reconhecimento de Tempo de Contribuição':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','Extrato CNIS atualizado','Contratos de trabalho (se não constar no CNIS)','Declaração de ex-empregadores','Recibos de pagamento / holerites antigos','Carnês de contribuição avulsa'],
    'Habeas Corpus':['RG ou CNH do paciente','CPF do paciente','Cópia do auto de prisão em flagrante (se houver)','Mandado de prisão ou decisão judicial','Boletim de Ocorrência relacionado','Procuração com poderes para HC','Documentos do processo criminal (se já em andamento)'],
    'Defesa Criminal — Tráfico de Drogas':['RG ou CNH','CPF','Comprovante de residência','Auto de prisão em flagrante','Laudo pericial da substância apreendida','Ficha criminal / antecedentes','Comprovante de trabalho ou atividade lícita','Testemunhas e contatos','Documentos do inquérito policial'],
    'Defesa Criminal — Furto/Roubo':['RG ou CNH','CPF','Comprovante de residência','Auto de prisão em flagrante (se houver)','Boletim de Ocorrência','Ficha criminal / antecedentes','Documentos do inquérito policial','Comprovante de trabalho ou atividade lícita','Testemunhas e contatos'],
    'Defesa Criminal — Homicídio':['RG ou CNH','CPF','Comprovante de residência','Auto de prisão em flagrante (se houver)','Laudo do IML / cadavérico','Boletim de Ocorrência','Ficha criminal / antecedentes','Documentos do inquérito policial','Laudo pericial do local do crime','Testemunhas e contatos'],
    'Defesa Criminal — Violência Doméstica':['RG ou CNH','CPF','Comprovante de residência','Boletim de Ocorrência','Medida protetiva (cópia, se existir)','Laudo médico de lesões (se houver)','Ficha criminal / antecedentes','Documentos do processo (se já em andamento)','Testemunhas e contatos'],
    'Execução Penal / Progressão de Regime':['RG ou CNH','CPF','Guia de execução penal','Certidão de antecedentes criminais','Atestado de comportamento carcerário','Comprovante de trabalho ou estudo no presídio','Laudo criminológico (se exigido)','Certidão de tempo de pena cumprido'],
    'Revisão Criminal':['RG ou CNH','CPF','Cópia da sentença condenatória','Acórdão(s) dos recursos anteriores','Documentos novos ou provas novas','Laudo pericial (se pertinente)','Documentos do processo original'],
    'Indenização por Danos Morais':['RG ou CNH','CPF','Comprovante de residência','Documentos comprovando o fato gerador do dano','Prints, e-mails ou registros do evento','Boletim de Ocorrência (se houver)','Laudos médicos ou psicológicos','Testemunhas','Comprovantes de prejuízo financeiro (se houver)'],
    'Indenização por Danos Materiais':['RG ou CNH','CPF','Comprovante de residência','Notas fiscais dos bens danificados','Orçamentos de conserto ou substituição','Fotos dos danos','Boletim de Ocorrência (se houver)','Contrato ou documento que originou a obrigação','Comprovantes de pagamentos não reembolsados'],
    'Revisão de Contrato / Superendividamento':['RG ou CNH','CPF','Comprovante de residência','Contratos bancários ou de financiamento','Extratos bancários dos últimos 6 meses','Comprovante de renda','Relação de todos os débitos','Boletos e correspondências dos credores','Comprovantes de pagamentos já efetuados'],
    'Ação de Alimentos':['RG ou CNH do requerente','CPF do requerente','Certidão de nascimento dos filhos','Certidão de casamento ou união estável (se houver)','Comprovante de residência','Comprovante de renda do requerido (se disponível)','Comprovante de despesas dos filhos (escola, saúde, etc.)','Comprovante de renda do requerente'],
    'Divórcio / Dissolução de União Estável':['RG ou CNH de ambas as partes','CPF de ambas as partes','Certidão de casamento ou escritura de união estável','Certidão de nascimento dos filhos (se houver)','Comprovante de residência','Documentos de bens a partilhar (imóveis, veículos, contas)','Extrato bancário e patrimonial','Certidão de nascimento das partes','Procuração específica para divórcio'],
    'Inventário / Herança':['RG ou CNH de todos os herdeiros','CPF de todos os herdeiros','Certidão de óbito do falecido','Certidão de nascimento do falecido','Certidão de casamento do falecido (se houver)','Certidão de nascimento dos herdeiros','Documentos de todos os bens (imóveis, veículos, contas bancárias)','Matrícula atualizada dos imóveis','Extrato bancário do falecido','CND (Certidão Negativa de Débitos) do falecido','Testamento (se houver)'],
    'Direito do Consumidor':['RG ou CNH','CPF','Comprovante de residência','Nota fiscal ou comprovante de compra','Contrato de prestação de serviços (se houver)','Fotos do produto com defeito','Prints ou registros de comunicações com a empresa','Boletim de Ocorrência (se houver)','Documentos de reclamações anteriores (Procon, etc.)'],
    'Reclamação Trabalhista — Verbas Rescisórias':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','Termo de rescisão do contrato de trabalho (TRCT)','Holerites / contracheques','Comprovante de depósito do FGTS','Extrato do FGTS','Guias de recolhimento do INSS','Comprovante de seguro-desemprego (se houver)'],
    'Reclamação Trabalhista — Horas Extras':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','Holerites / contracheques','Cartão de ponto ou registros de jornada','E-mails ou mensagens comprovando jornada extra','Contrato de trabalho','Testemunhas'],
    'Acidente de Trabalho':['RG ou CNH','CPF','Carteira de Trabalho (CTPS)','Comprovante de residência','CAT – Comunicação de Acidente de Trabalho','Laudos médicos do acidente','Relatório de atendimento de pronto-socorro','Fotos do local do acidente (se disponível)','Extrato CNIS','Holerites / contracheques','Boletim de Ocorrência (se houver)'],
    'Reconhecimento de Vínculo Empregatício':['RG ou CNH','CPF','Comprovante de residência','Contratos ou acordos (mesmo informais)','Recibos de pagamento ou depósitos bancários','E-mails, mensagens ou registros de ordens do empregador','Testemunhas','Fotos do local de trabalho','Extrato CNIS','Carteira de Trabalho sem anotação'],
    'Guarda e Tutela':['RG ou CNH do requerente','CPF do requerente','Certidão de nascimento da criança/adolescente','Certidão de casamento ou dissolução (se houver)','Comprovante de residência','Comprovante de renda','Comprovante de escolaridade da criança','Relatório do Conselho Tutelar (se houver)','Documentos demonstrando relação afetiva com a criança'],
    'Outro':['RG ou CNH (documento de identidade)','CPF','Comprovante de residência','Documentos específicos do caso (a definir com o advogado)']
  };

  window.toggleChecklist = function () {
    document.getElementById('doc-checklist-body').classList.toggle('open');
    document.getElementById('doc-checklist-toggle-icon').classList.toggle('open');
  };

  window.updateChecklistProgress = function () {
    var items = document.querySelectorAll('#checklist-items-container .checklist-item input[type="checkbox"]');
    if (!items.length) return;
    var checked = Array.from(items).filter(function (i) { return i.checked; }).length;
    var total = items.length;
    var pct = total > 0 ? Math.round((checked / total) * 100) : 0;
    document.getElementById('checklist-bar').style.width = pct + '%';
    document.getElementById('checklist-progress-text').textContent = '(' + checked + '/' + total + ')';
    var id = document.getElementById('doc-cliente-id').value;
    var tipo = document.getElementById('doc-tipo').value;
    var key = 'chk_' + id + '_' + tipo.replace(/[^a-zA-Z0-9]/g, '_');
    localStorage.setItem(key, JSON.stringify(Array.from(items).map(function (i) { return i.checked; })));
    var c = document.getElementById('checklist-items-container');
    var done = c.querySelector('.checklist-all-done');
    if (pct === 100 && !done) c.insertAdjacentHTML('beforeend', '<div class="checklist-all-done">✅ Todos os documentos foram coletados!</div>');
    else if (pct < 100 && done) done.remove();
  };

  window.renderChecklist = function (tipo, clienteId) {
    var c = document.getElementById('checklist-items-container');
    var docs = window.CHECKLIST_DOCS[tipo];
    if (!tipo || !docs) {
      c.innerHTML = '<div class="checklist-no-tipo">' + (tipo ? 'Checklist não disponível para este tipo de ação.' : 'Nenhum tipo de ação definido para este cliente.') + '</div>';
      document.getElementById('checklist-progress-text').textContent = '';
      document.getElementById('checklist-bar').style.width = '0%';
      return;
    }
    var key = 'chk_' + clienteId + '_' + tipo.replace(/[^a-zA-Z0-9]/g, '_');
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(key)) || []; } catch (e) {}
    c.innerHTML = docs.map(function (doc, i) {
      var chk = saved[i] === true;
      return '<div class="checklist-item' + (chk ? ' checked' : '') + '" onclick="window.toggleCheckItem(this)">' +
        '<input type="checkbox" id="chk_' + i + '"' + (chk ? ' checked' : '') + ' onchange="window.updateChecklistProgress()" onclick="event.stopPropagation()">' +
        '<label for="chk_' + i + '">' + doc + '</label></div>';
    }).join('');
    var cnt = saved.filter(Boolean).length;
    var pct = docs.length > 0 ? Math.round((cnt / docs.length) * 100) : 0;
    document.getElementById('checklist-bar').style.width = pct + '%';
    document.getElementById('checklist-progress-text').textContent = '(' + cnt + '/' + docs.length + ')';
    if (pct === 100) c.insertAdjacentHTML('beforeend', '<div class="checklist-all-done">✅ Todos os documentos foram coletados!</div>');
  };

  window.toggleCheckItem = function (el) {
    var cb = el.querySelector('input[type="checkbox"]');
    cb.checked = !cb.checked;
    el.classList.toggle('checked', cb.checked);
    window.updateChecklistProgress();
  };

  function setupModal() {
    var modal = document.getElementById('modal-docs');
    if (!modal) return false;
    if (!document.getElementById('doc-tipo')) {
      var inp = document.createElement('input');
      inp.type = 'hidden'; inp.id = 'doc-tipo';
      modal.querySelector('div.modal').prepend(inp);
    }
    if (!document.getElementById('doc-checklist-section')) {
      var h3 = modal.querySelector('h3');
      if (h3) h3.insertAdjacentHTML('afterend',
        '<div id="doc-checklist-section">' +
          '<div id="doc-checklist-header" onclick="window.toggleChecklist()">' +
            '<h4>📋 Checklist de Documentos <span id="checklist-progress-text" class="checklist-progress-text"></span></h4>' +
            '<span id="doc-checklist-toggle-icon">▼</span>' +
          '</div>' +
          '<div id="doc-checklist-body">' +
            '<div class="checklist-progress-bar-wrap"><div class="checklist-progress-bar-fill" id="checklist-bar" style="width:0%"></div></div>' +
            '<div id="checklist-items-container"></div>' +
          '</div>' +
        '</div>'
      );
    }
    return true;
  }

  function patchAbrirDocs() {
    if (window._checklistPatched || typeof window.abrirDocs !== 'function') return false;
    var orig = window.abrirDocs;
    window.abrirDocs = function (id, nome, processo, tipo) {
      orig(id, nome, processo);
      var t = document.getElementById('doc-tipo');
      if (t) t.value = tipo || '';
      setTimeout(function () {
        if (typeof window.renderChecklist === 'function') window.renderChecklist(tipo || '', id);
        var body = document.getElementById('doc-checklist-body');
        var icon = document.getElementById('doc-checklist-toggle-icon');
        if (body && icon) {
          var has = tipo && window.CHECKLIST_DOCS && window.CHECKLIST_DOCS[tipo];
          body.classList.toggle('open', !!has);
          icon.classList.toggle('open', !!has);
        }
      }, 80);
    };
    window._checklistPatched = true;
    return true;
  }

  function patchDocsButtons() {
    var rows = document.querySelectorAll('tbody tr');
    rows.forEach(function (row) {
      var cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 6) return;
      var tipo = cells[3].textContent.trim();
      var btn = row.querySelector('[onclick*="abrirDocs"]');
      if (!btn) return;
      var oc = btn.getAttribute('onclick');
      if (oc.match(/abrirDocs\([^,]+,[^,]+,[^,]+,[^)]+\)/)) return;
      btn.setAttribute('onclick', oc.replace(
        /abrirDocs\(('[^']*'),('[^']*'),('[^']*')\)/,
        function (m, a, b, c) { return "abrirDocs(" + a + "," + b + "," + c + ",'" + tipo.replace(/'/g, "\\'") + "')"; }
      ));
    });
  }

  function init() {
    injectStyles();
    setupModal();
    patchAbrirDocs();
    patchDocsButtons();
    if (!window._checklistObserver) {
      window._checklistObserver = new MutationObserver(function (muts) {
        var changed = muts.some(function (m) {
          return Array.from(m.addedNodes).some(function (n) {
            return n.tagName === 'TR' || (n.querySelectorAll && n.querySelectorAll('[onclick*="abrirDocs"]').length > 0);
          });
        });
        if (changed) setTimeout(patchDocsButtons, 100);
      });
      window._checklistObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 300);
})();
