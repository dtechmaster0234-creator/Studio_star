/* ============================================================
   Produção Criativa — Dashboard v2
   Conexões curvas · Popups · Calendário · Tema · Frases
   ============================================================ */

const STORAGE_KEY = 'producao_criativa_v2';

const QUOTES = [
  { text: 'Sua autenticidade atrai quem precisa de você.', author: 'Instagram' },
  { text: 'Construa presença, o sucesso vem depois.', author: 'Instagram' },
  { text: 'Cada post é um passo rumo ao seu sonho.', author: 'Instagram' },
  { text: 'Seu conteúdo muda a vida de alguém.', author: 'Instagram' },
  { text: 'Seja sua inspiração antes de tudo.', author: 'Instagram' },
  { text: 'Consistência transforma desejo em realidade.', author: 'Instagram' },
  { text: 'Sua voz única tem poder infinito.', author: 'Instagram' },
  { text: 'Poste com amor e veja só o alcance.', author: 'Instagram' },
  { text: 'O que você compartilha, o mundo abraça.', author: 'Instagram' },
  { text: 'Cresça a cada dia, celebrando cada vitória.', author: 'Instagram' },
  { text: 'Seu engajamento é construído com dedicação.', author: 'Instagram' },
  { text: 'Mostre sua essência, ela já inspira.', author: 'Instagram' },
  { text: 'Sua jornada ilumina o caminho de outros.', author: 'Instagram' },
  { text: 'Acredite no seu potencial, ele é enorme.', author: 'Instagram' },
  { text: 'Toda conquista começa com um sim.', author: 'Instagram' },
  { text: 'Sua energia positiva contagia sua audiência.', author: 'Instagram' },
  { text: 'Brilhe do seu jeito, isso encanta.', author: 'Instagram' },
  { text: 'Cada seguidor é uma oportunidade de crescer.', author: 'Instagram' },
  { text: 'Confie no processo e no seu talento.', author: 'Instagram' },
  { text: 'Faça o seu melhor e confie na jornada.', author: 'Instagram' },
  { text: 'Olhe para o sol, e as sombras ficam para trás.', author: 'Walt Whitman' },
  { text: 'Sonhe grande e acredite em si mesmo.', author: 'Nadia Comaneci' },
  { text: 'A vida é 10% o que acontece e 90% como reajo.', author: 'Charles Swindoll' },
  { text: 'Tudo que você deseja está do outro lado do medo.', author: 'George Addair' },
  { text: 'O futuro pertence a quem acredita nos sonhos.', author: 'Eleanor Roosevelt' },
  { text: 'Sua visão se tornará clara quando olhar para dentro.', author: 'Carl Jung' },
  { text: 'Acredite que você pode, e você já está no meio.', author: 'Theodore Roosevelt' },
  { text: 'Sonhe e acredite, eles se tornam sua verdade.', author: 'Michelangelo' },
  { text: 'A persistência é o caminho para a realização.', author: 'Napoleon Hill' },
  { text: 'Sua atitude determina a direção da sua vida.', author: 'Winston Churchill' },
  { text: 'Tudo que você imagina pode se tornar real.', author: 'Pablo Picasso' },
  { text: 'Coragem é começar, e o que começa tem futuro.', author: 'Sócrates' },
  { text: 'A felicidade depende de nós mesmos.', author: 'Aristóteles' },
  { text: 'O segredo do sucesso está em começar.', author: 'Mark Twain' },
  { text: 'A vida é o que fazemos dela, vamos fazê-la grande.', author: 'Helen Keller' },
  { text: 'Vá com confiança em direção aos seus sonhos.', author: 'Henry David Thoreau' },
  { text: 'Nada é impossível quando se acredita com coragem.', author: 'Winston Churchill' },
  { text: 'Tudo grande começa pequeno e cheio de fé.', author: 'Leonardo da Vinci' },
  { text: 'Seja a mudança que deseja ver no mundo.', author: 'Mahatma Gandhi' },
  { text: 'Sua maior glória é se levantar após cada queda.', author: 'Confúcio' }
];

const defaultState = {
  cronograma: [],
  objetivos: [],
  metas: [],
  etapas: [],
  tarefasPool: [],
  kanban: { tarefas: [], aFazer: [], fazendo: [], feito: [] },
  ideias: [],
  dados: [],
  tendencias: [],
  modelos: [],
  tarefasConcluidasCount: 0,
  selectedConexoes: { ideias: [], dados: [], tendencias: [] },
  connections: [], // { fromId, toId }
  currentImageBase64: null,
  theme: 'dark'
};

let state = loadState();
let quoteIndex = 0;
let quoteTimer = null;
let connectFrom = null; // { id, list, el }

/* ---------- Utils ---------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2800);
}
function diaSemana(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][d.getDay()];
}

/* ---------- Persistence ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed, connections: parsed.connections || [] };
    }
  } catch (e) {}
  return structuredClone(defaultState);
}
function saveState() {
  const toSave = { ...state };
  delete toSave.currentImageBase64;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  updateMetrics();
}

/* ---------- Theme ---------- */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.theme = theme;
  document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀' : '☾';
  saveState();
}
document.getElementById('btnTheme').addEventListener('click', () => {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
});
applyTheme(state.theme || 'dark');

/* ---------- Quotes ---------- */
function initQuotes() {
  const track = document.getElementById('quotesTrack');
  track.innerHTML = QUOTES.map(q =>
    `<div class="quote-item">"${q.text}" <strong>— ${q.author}</strong></div>`
  ).join('');
  showQuote(0);
  quoteTimer = setInterval(() => showQuote(quoteIndex + 1), 15000);
}
function showQuote(i) {
  quoteIndex = ((i % QUOTES.length) + QUOTES.length) % QUOTES.length;
  const track = document.getElementById('quotesTrack');
  track.style.transform = `translateX(-${quoteIndex * 100}%)`;
}
document.getElementById('quotePrev').addEventListener('click', () => {
  clearInterval(quoteTimer);
  showQuote(quoteIndex - 1);
  quoteTimer = setInterval(() => showQuote(quoteIndex + 1), 15000);
});
document.getElementById('quoteNext').addEventListener('click', () => {
  clearInterval(quoteTimer);
  showQuote(quoteIndex + 1);
  quoteTimer = setInterval(() => showQuote(quoteIndex + 1), 15000);
});

/* ---------- Modal system ---------- */
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalFooter = document.getElementById('modalFooter');

function openModal({ title, bodyHtml, footerHtml, onOpen }) {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  modalFooter.innerHTML = footerHtml || '';
  modalOverlay.hidden = false;
  if (onOpen) onOpen();
}
function closeModal() {
  modalOverlay.hidden = true;
}
document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

/* Capitalize inputs live */
document.addEventListener('input', e => {
  if (e.target.classList.contains('capitalize-input') && e.target.tagName !== 'TEXTAREA') {
    const pos = e.target.selectionStart;
    const val = e.target.value;
    if (val.length === 1) {
      e.target.value = capitalize(val);
      e.target.setSelectionRange(pos, pos);
    }
  }
});

/* ---------- Tabs ---------- */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'visao') renderCalendar();
    if (btn.dataset.tab === 'ideias') {
      renderSemanaSidebar();
      setTimeout(drawConnections, 50);
    }
    if (btn.dataset.tab === 'modelo') renderConexoesAtivas();
  });
});

/* ---------- Metrics & Indicators visual ---------- */
function collectAllTasks() {
  const map = new Map();
  ['objetivos', 'metas', 'etapas', 'tarefasPool'].forEach(k => {
    (state[k] || []).forEach(i => map.set(i.id, { ...i }));
  });
  Object.entries(state.kanban).forEach(([col, items]) => {
    items.forEach(i => {
      if (map.has(i.id)) {
        const existing = map.get(i.id);
        if (i.checked) existing.checked = true;
        if (col === 'feito') existing._inFeito = true;
      } else {
        map.set(i.id, { ...i, _inFeito: col === 'feito' });
      }
    });
  });
  return [...map.values()];
}

function updateMetrics() {
  const allTasks = collectAllTasks();
  const inFeitoIds = new Set((state.kanban.feito || []).map(i => i.id));

  // Concluídas ao vivo: checkbox marcado OU está na coluna "Feito"
  const completedLive = allTasks.filter(i => i.checked || i._inFeito || inFeitoIds.has(i.id)).length;
  // Já salvas (removidas do quadro) + concluídas ao vivo
  const completedTotal = completedLive + state.tarefasConcluidasCount;
  // Total = tarefas ainda no sistema + as já salvas como concluídas
  const totalTasks = allTasks.length + state.tarefasConcluidasCount;

  const taxa = totalTasks > 0
    ? Math.round((completedTotal / totalTasks) * 100)
    : 0;

  const postsFeitos = state.cronograma.filter(r => (r.resultados || '').toLowerCase().includes('postado')).length;
  const postsAgend = state.cronograma.length;

  document.getElementById('metricTarefasConcluidas').textContent = completedTotal;
  document.getElementById('metricPostsFeitos').textContent = postsFeitos;
  document.getElementById('metricPostsAgendados').textContent = postsAgend;
  document.getElementById('metricTaxa').textContent = taxa + '%';
  document.getElementById('progressTaxa').style.width = taxa + '%';

  const maxVal = Math.max(
    state.kanban.aFazer.length,
    state.kanban.fazendo.length,
    completedTotal,
    state.ideias.length,
    state.modelos.length,
    1
  );

  const indicators = [
    { label: 'A fazer', value: state.kanban.aFazer.length, icon: '○' },
    { label: 'Fazendo', value: state.kanban.fazendo.length, icon: '◎' },
    { label: 'Feito', value: completedTotal, icon: '●' },
    { label: 'Ideias', value: state.ideias.length, icon: '✦' },
    { label: 'Modelos salvos', value: state.modelos.length, icon: '▦' }
  ];

  document.getElementById('indicatorsVisual').innerHTML = indicators.map(ind => {
    const pct = Math.round((ind.value / maxVal) * 100);
    return `
      <div class="ind-row">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span class="ind-icon">${ind.icon}</span>
          <span class="ind-label">${ind.label}</span>
        </div>
        <span class="ind-value">${ind.value}</span>
        <div class="ind-bar-wrap"><div class="ind-bar" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');

  // Gantt
  const gantt = document.getElementById('ganttResumo');
  const postsComData = state.cronograma.filter(r => r.data);
  if (postsComData.length === 0 && state.modelos.filter(m => m.data).length === 0) {
    gantt.innerHTML = '<p class="empty-state">Nenhuma postagem registrada ainda. Adicione no Cronograma ou Modelo de Post.</p>';
  } else {
    gantt.innerHTML = postsComData.map(r => `
      <div class="gantt-bar">
        <span style="min-width:90px">${r.data}</span>
        <div class="bar" style="width:${Math.min(40 + (r.tema||'').length * 4, 180)}px"></div>
        <span>${capitalize(r.tema || r.formato || 'Post')}</span>
      </div>
    `).join('') + state.modelos.filter(m => m.data).map(m => `
      <div class="gantt-bar">
        <span style="min-width:90px">${m.data}</span>
        <div class="bar" style="width:80px;opacity:0.6"></div>
        <span>${capitalize(m.titulo || 'Modelo')} (modelo)</span>
      </div>
    `).join('');
  }
}

/* ---------- Calendar ---------- */
let calYear, calMonth;
function initCalendar() {
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
}
function renderCalendar() {
  const label = document.getElementById('currentMonthLabel');
  const grid = document.getElementById('calendarGrid');
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  label.textContent = `${months[calMonth]} ${calYear}`;

  const first = new Date(calYear, calMonth, 1);
  const last = new Date(calYear, calMonth + 1, 0);
  const startDay = first.getDay();
  const daysInMonth = last.getDate();

  const postDates = new Set([
    ...state.cronograma.filter(r => r.data).map(r => r.data),
    ...state.modelos.filter(m => m.data).map(m => m.data)
  ]);
  const todayStr = new Date().toISOString().slice(0, 10);

  let html = ['D','S','T','Q','Q','S','S'].map(d => `<div class="cal-day-name">${d}</div>`).join('');
  for (let i = 0; i < startDay; i++) html += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const classes = ['cal-day'];
    if (postDates.has(dateStr)) classes.push('has-post');
    if (dateStr === todayStr) classes.push('today');
    html += `<div class="${classes.join(' ')}" data-date="${dateStr}">${d}</div>`;
  }
  grid.innerHTML = html;

  grid.querySelectorAll('.cal-day:not(.empty)').forEach(day => {
    day.addEventListener('click', () => openCalendarAddModal(day.dataset.date));
  });
}
document.getElementById('prevMonth').addEventListener('click', () => {
  calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

function openCalendarAddModal(dateStr) {
  openModal({
    title: `Adicionar — ${dateStr}`,
    bodyHtml: `
      <div class="type-btns">
        <button type="button" class="type-btn active" data-type="objetivos">Objetivo</button>
        <button type="button" class="type-btn" data-type="metas">Meta</button>
        <button type="button" class="type-btn" data-type="etapas">Etapa</button>
      </div>
      <div class="form-group">
        <label>Título</label>
        <input type="text" id="modalTitulo" class="capitalize-input" placeholder="Título" />
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <textarea id="modalDesc" rows="3" class="capitalize-input" placeholder="Descrição (opcional)"></textarea>
      </div>
    `,
    footerHtml: `
      <button class="btn btn-outline" id="modalCancel">Cancelar</button>
      <button class="btn btn-primary" id="modalConfirm">Adicionar ao Kanban</button>
    `,
    onOpen: () => {
      let selectedType = 'objetivos';
      modalBody.querySelectorAll('.type-btn').forEach(b => {
        b.addEventListener('click', () => {
          modalBody.querySelectorAll('.type-btn').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          selectedType = b.dataset.type;
        });
      });
      document.getElementById('modalCancel').onclick = closeModal;
      document.getElementById('modalConfirm').onclick = () => {
        const titulo = capitalize((document.getElementById('modalTitulo').value || '').trim());
        const desc = (document.getElementById('modalDesc').value || '').trim();
        if (!titulo) { toast('Informe um título.'); return; }
        const item = { id: uid(), text: titulo, desc, checked: false, date: dateStr };
        if (!state[selectedType]) state[selectedType] = [];
        state[selectedType].push(item);
        // also put in kanban "aFazer"
        state.kanban.aFazer.push({ ...item });
        saveState();
        renderSidebarLists();
        renderKanban();
        closeModal();
        toast(`${capitalize(selectedType.slice(0,-1))} adicionado e enviado para “A fazer”.`);
      };
    }
  });
}

/* ---------- Cronograma ---------- */
function renderCronograma() {
  const tbody = document.getElementById('tbodyCronograma');
  const empty = document.getElementById('cronogramaEmpty');
  if (state.cronograma.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  tbody.innerHTML = state.cronograma.map((row, i) => `
    <tr data-id="${row.id}">
      <td><input type="date" value="${row.data || ''}" data-field="data" /></td>
      <td><input type="text" value="${row.diaSemana || ''}" data-field="diaSemana" readonly /></td>
      <td><input type="time" value="${row.hora || ''}" data-field="hora" /></td>
      <td>
        <select data-field="formato">
          <option value="">—</option>
          ${['Feed','Stories','Reels','Carrossel','Outro'].map(o =>
            `<option value="${o}" ${row.formato===o?'selected':''}>${o}</option>`).join('')}
        </select>
      </td>
      <td><input type="text" value="${row.tema || ''}" data-field="tema" placeholder="Tema" class="capitalize-input" /></td>
      <td>
        <select data-field="resultados">
          <option value="">—</option>
          <option value="Agendado" ${row.resultados==='Agendado'?'selected':''}>Agendado</option>
          <option value="Postado" ${row.resultados==='Postado'?'selected':''}>Postado</option>
        </select>
      </td>
      <td><input type="text" value="${row.correcoes || ''}" data-field="correcoes" placeholder="Correções" ${row.resultados!=='Postado'?'disabled':''} /></td>
      <td><input type="text" value="${row.melhorias || ''}" data-field="melhorias" placeholder="Melhorias" ${row.resultados!=='Postado'?'disabled':''} /></td>
      <td><button class="btn-delete-row" data-i="${i}">×</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', e => {
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      const field = e.target.dataset.field;
      const row = state.cronograma.find(r => r.id === id);
      if (!row) return;
      let val = e.target.value;
      if (field === 'tema') val = capitalize(val);
      row[field] = val;
      if (field === 'data') {
        row.diaSemana = diaSemana(val);
        tr.querySelector('[data-field="diaSemana"]').value = row.diaSemana;
      }
      if (field === 'resultados') {
        const dis = val !== 'Postado';
        tr.querySelector('[data-field="correcoes"]').disabled = dis;
        tr.querySelector('[data-field="melhorias"]').disabled = dis;
      }
      saveState();
      renderSemanaSidebar();
      renderCalendar();
    });
  });
  tbody.querySelectorAll('.btn-delete-row').forEach(btn => {
    btn.addEventListener('click', () => {
      state.cronograma.splice(+btn.dataset.i, 1);
      saveState();
      renderCronograma();
      renderSemanaSidebar();
    });
  });
}
document.getElementById('btnAddRowCronograma').addEventListener('click', () => {
  state.cronograma.push({
    id: uid(), data: '', diaSemana: '', hora: '', formato: '',
    tema: '', resultados: '', correcoes: '', melhorias: ''
  });
  saveState();
  renderCronograma();
});

/* ---------- Item card HTML helper ---------- */
function itemCardHtml(item, extraAttrs = '') {
  return `
    <div class="item-card" draggable="true" data-id="${item.id}" ${extraAttrs}>
      <input type="checkbox" class="check" ${item.checked ? 'checked' : ''} data-id="${item.id}" />
      <div class="content">
        <div class="title">${capitalize(item.text)}</div>
        ${item.desc ? `<div class="desc">${item.desc}</div>` : ''}
      </div>
      <button class="item-delete" data-id="${item.id}">×</button>
    </div>
  `;
}

/* ---------- Sidebar lists ---------- */
function renderSidebarLists() {
  const map = {
    objetivos: 'listObjetivos',
    metas: 'listMetas',
    etapas: 'listEtapas',
    tarefasPool: 'listTarefasPool'
  };
  Object.entries(map).forEach(([key, id]) => {
    const ul = document.getElementById(id);
    ul.innerHTML = (state[key] || []).map(item =>
      itemCardHtml(item, `data-from="${key}"`)
    ).join('');
  });
  bindItemEvents('.sidebar-lists');
  setupDragFromSidebar();
}

function bindItemEvents(scope) {
  const root = document.querySelector(scope) || document;
  root.querySelectorAll('.item-card .check, .kanban-item .check').forEach(cb => {
    cb.addEventListener('click', e => e.stopPropagation());
    cb.addEventListener('change', e => {
      const id = cb.dataset.id;
      toggleChecked(id, cb.checked);
    });
  });
  root.querySelectorAll('.item-card, .kanban-item').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.classList.contains('check') || e.target.classList.contains('item-delete')) return;
      const id = card.dataset.id;
      openItemDetail(id);
    });
  });
  root.querySelectorAll('.item-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeItemEverywhere(btn.dataset.id);
      fullRenderLists();
    });
  });
}

function toggleChecked(id, checked) {
  ['objetivos','metas','etapas','tarefasPool'].forEach(k => {
    const item = (state[k] || []).find(i => i.id === id);
    if (item) item.checked = checked;
  });
  Object.keys(state.kanban).forEach(col => {
    const item = state.kanban[col].find(i => i.id === id);
    if (item) item.checked = checked;
  });
  saveState();
}

function findItem(id) {
  for (const k of ['objetivos','metas','etapas','tarefasPool']) {
    const item = (state[k] || []).find(i => i.id === id);
    if (item) return { item, list: k };
  }
  for (const col of Object.keys(state.kanban)) {
    const item = state.kanban[col].find(i => i.id === id);
    if (item) return { item, list: 'kanban:' + col };
  }
  return null;
}

function openItemDetail(id) {
  const found = findItem(id);
  if (!found) return;
  const { item } = found;
  openModal({
    title: capitalize(item.text),
    bodyHtml: `
      <div class="form-group">
        <label>Título</label>
        <input type="text" id="modalTitulo" class="capitalize-input" value="${item.text || ''}" />
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <textarea id="modalDesc" rows="4" class="capitalize-input">${item.desc || ''}</textarea>
      </div>
      <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;cursor:pointer">
        <input type="checkbox" id="modalCheck" ${item.checked ? 'checked' : ''} />
        Concluído
      </label>
    `,
    footerHtml: `
      <button class="btn btn-outline" id="modalCancel">Fechar</button>
      <button class="btn btn-primary" id="modalConfirm">Salvar</button>
    `,
    onOpen: () => {
      document.getElementById('modalCancel').onclick = closeModal;
      document.getElementById('modalConfirm').onclick = () => {
        const titulo = capitalize((document.getElementById('modalTitulo').value || '').trim());
        const desc = (document.getElementById('modalDesc').value || '').trim();
        const checked = document.getElementById('modalCheck').checked;
        if (!titulo) { toast('Título obrigatório.'); return; }
        item.text = titulo;
        item.desc = desc;
        item.checked = checked;
        // sync everywhere
        toggleChecked(id, checked);
        ['objetivos','metas','etapas','tarefasPool'].forEach(k => {
          const it = (state[k] || []).find(i => i.id === id);
          if (it) { it.text = titulo; it.desc = desc; }
        });
        Object.keys(state.kanban).forEach(col => {
          const it = state.kanban[col].find(i => i.id === id);
          if (it) { it.text = titulo; it.desc = desc; }
        });
        saveState();
        fullRenderLists();
        closeModal();
        toast('Atualizado.');
      };
    }
  });
}

function removeItemEverywhere(id) {
  ['objetivos','metas','etapas','tarefasPool'].forEach(k => {
    state[k] = (state[k] || []).filter(i => i.id !== id);
  });
  Object.keys(state.kanban).forEach(col => {
    state.kanban[col] = state.kanban[col].filter(i => i.id !== id);
  });
  state.connections = state.connections.filter(c => c.fromId !== id && c.toId !== id);
  saveState();
}

function fullRenderLists() {
  renderSidebarLists();
  renderKanban();
  renderConexoes();
  drawConnections();
}

/* Add via popup */
document.querySelectorAll('.btn-add-small[data-list]').forEach(btn => {
  btn.addEventListener('click', () => {
    const list = btn.dataset.list;
    const labels = {
      objetivos: 'Objetivo', metas: 'Meta', etapas: 'Etapa',
      tarefasPool: 'Tarefa', ideias: 'Ideia', dados: 'Dado', tendencias: 'Tendência'
    };
    openModal({
      title: `Novo ${labels[list] || 'item'}`,
      bodyHtml: `
        <div class="form-group">
          <label>Título</label>
          <input type="text" id="modalTitulo" class="capitalize-input" placeholder="Título" />
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <textarea id="modalDesc" rows="3" class="capitalize-input" placeholder="Descrição (opcional)"></textarea>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-outline" id="modalCancel">Cancelar</button>
        <button class="btn btn-primary" id="modalConfirm">Adicionar</button>
      `,
      onOpen: () => {
        document.getElementById('modalCancel').onclick = closeModal;
        document.getElementById('modalConfirm').onclick = () => {
          const titulo = capitalize((document.getElementById('modalTitulo').value || '').trim());
          const desc = (document.getElementById('modalDesc').value || '').trim();
          if (!titulo) { toast('Informe um título.'); return; }
          if (!state[list]) state[list] = [];
          state[list].push({ id: uid(), text: titulo, desc, checked: false });
          saveState();
          if (['ideias','dados','tendencias'].includes(list)) {
            renderConexoes();
            setTimeout(drawConnections, 40);
          } else {
            renderSidebarLists();
          }
          closeModal();
          toast('Adicionado.');
        };
      }
    });
  });
});

/* ---------- Kanban ---------- */
function renderKanban() {
  const colMap = { tarefas: 'colTarefas', aFazer: 'colAFazer', fazendo: 'colFazendo', feito: 'colFeito' };
  Object.entries(colMap).forEach(([key, id]) => {
    const body = document.getElementById(id);
    body.innerHTML = (state.kanban[key] || []).map(item => `
      <div class="kanban-item" draggable="true" data-id="${item.id}" data-col="${key}">
        <input type="checkbox" class="check" ${item.checked ? 'checked' : ''} data-id="${item.id}" />
        <div class="content">
          <div class="title">${capitalize(item.text)}</div>
          ${item.desc ? `<div class="desc">${item.desc}</div>` : ''}
        </div>
        <button class="item-delete" data-id="${item.id}">×</button>
      </div>
    `).join('');
  });
  bindItemEvents('.kanban-board');
  setupKanbanDnD();
}

function setupDragFromSidebar() {
  document.querySelectorAll('.sidebar-lists .item-card[draggable]').forEach(li => {
    li.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        id: li.dataset.id, from: li.dataset.from,
        text: li.querySelector('.title')?.textContent || ''
      }));
      li.classList.add('dragging');
    });
    li.addEventListener('dragend', () => li.classList.remove('dragging'));
  });
}

function setupKanbanDnD() {
  document.querySelectorAll('.kanban-item').forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        id: item.dataset.id, fromCol: item.dataset.col,
        text: item.querySelector('.title')?.textContent || ''
      }));
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
  });

  // Drop on kanban columns
  document.querySelectorAll('.col-body').forEach(body => {
    body.addEventListener('dragover', e => { e.preventDefault(); body.classList.add('drag-over'); });
    body.addEventListener('dragleave', () => body.classList.remove('drag-over'));
    body.addEventListener('drop', e => {
      e.preventDefault();
      body.classList.remove('drag-over');
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const targetCol = body.dataset.col;
      moveToKanban(data, targetCol);
    });
  });

  // Drop back to sidebar lists
  document.querySelectorAll('.draggable-list').forEach(ul => {
    ul.addEventListener('dragover', e => { e.preventDefault(); });
    ul.addEventListener('drop', e => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const targetList = ul.dataset.list;
      if (!targetList) return;
      // remove from kanban if came from there
      if (data.fromCol) {
        state.kanban[data.fromCol] = state.kanban[data.fromCol].filter(i => i.id !== data.id);
      }
      // ensure in target list
      const found = findItem(data.id);
      const itemData = found ? found.item : { id: data.id || uid(), text: data.text, desc: '', checked: false };
      ['objetivos','metas','etapas','tarefasPool'].forEach(k => {
        state[k] = (state[k] || []).filter(i => i.id !== itemData.id);
      });
      if (!state[targetList]) state[targetList] = [];
      if (!state[targetList].find(i => i.id === itemData.id)) {
        state[targetList].push(itemData);
      }
      saveState();
      fullRenderLists();
    });
  });
}

function moveToKanban(data, targetCol) {
  if (data.fromCol) {
    state.kanban[data.fromCol] = state.kanban[data.fromCol].filter(i => i.id !== data.id);
  }
  const found = findItem(data.id);
  const itemData = found
    ? { ...found.item }
    : { id: data.id || uid(), text: data.text, desc: '', checked: false };
  if (!state.kanban[targetCol].find(i => i.id === itemData.id)) {
    state.kanban[targetCol].push(itemData);
  }
  saveState();
  renderKanban();
  updateMetrics();
}

document.getElementById('btnSalvarFeitos').addEventListener('click', () => {
  const count = state.kanban.feito.length;
  if (count === 0) { toast('Nenhuma tarefa em “Feito” para salvar.'); return; }
  state.tarefasConcluidasCount += count;
  state.kanban.feito = [];
  saveState();
  renderKanban();
  toast(`${count} tarefa(s) salva(s) como concluída(s).`);
});

/* ---------- Ideias / Dados / Tendências + curved connections ---------- */
function renderConexoes() {
  ['ideias','dados','tendencias'].forEach(key => {
    const el = document.getElementById('list' + key.charAt(0).toUpperCase() + key.slice(1));
    const selected = state.selectedConexoes[key] || [];
    el.innerHTML = (state[key] || []).map(item => `
      <div class="conexao-item ${selected.includes(item.id) ? 'selected' : ''}" data-id="${item.id}" data-list="${key}">
        <span class="dot"></span>
        <span style="flex:1">${capitalize(item.text)}</span>
        <button class="item-delete" data-id="${item.id}" data-list="${key}">×</button>
      </div>
    `).join('');
  });

  document.querySelectorAll('.conexao-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.classList.contains('item-delete')) return;
      handleConnectionClick(item);
    });
  });
  document.querySelectorAll('.conexao-item .item-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const list = btn.dataset.list;
      const id = btn.dataset.id;
      state[list] = state[list].filter(i => i.id !== id);
      state.selectedConexoes[list] = (state.selectedConexoes[list] || []).filter(x => x !== id);
      state.connections = state.connections.filter(c => c.fromId !== id && c.toId !== id);
      saveState();
      renderConexoes();
      drawConnections();
    });
  });
  drawConnections();
}

function handleConnectionClick(el) {
  const id = el.dataset.id;
  const list = el.dataset.list;

  // toggle selection for "unir"
  if (!state.selectedConexoes[list]) state.selectedConexoes[list] = [];
  const idx = state.selectedConexoes[list].indexOf(id);
  if (idx >= 0) state.selectedConexoes[list].splice(idx, 1);
  else state.selectedConexoes[list].push(id);
  el.classList.toggle('selected');

  // connection line logic
  if (!connectFrom) {
    connectFrom = { id, list, el };
    el.classList.add('connecting');
  } else {
    if (connectFrom.id !== id) {
      // create connection if not exists
      const exists = state.connections.find(c =>
        (c.fromId === connectFrom.id && c.toId === id) ||
        (c.fromId === id && c.toId === connectFrom.id)
      );
      if (!exists) {
        state.connections.push({ fromId: connectFrom.id, toId: id });
        saveState();
      }
    }
    document.querySelectorAll('.conexao-item.connecting').forEach(x => x.classList.remove('connecting'));
    connectFrom = null;
    drawConnections();
  }
  renderConexoesAtivas();
}

function drawConnections() {
  const svg = document.getElementById('conexoesSvg');
  if (!svg) return;
  const wrap = svg.parentElement;
  const rect = wrap.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  svg.style.width = rect.width + 'px';
  svg.style.height = rect.height + 'px';

  // arrow marker
  svg.innerHTML = `
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
      </marker>
    </defs>
  `;

  state.connections.forEach(conn => {
    const fromEl = document.querySelector(`.conexao-item[data-id="${conn.fromId}"]`);
    const toEl = document.querySelector(`.conexao-item[data-id="${conn.toId}"]`);
    if (!fromEl || !toEl) return;
    const r1 = fromEl.getBoundingClientRect();
    const r2 = toEl.getBoundingClientRect();
    const x1 = r1.left + r1.width / 2 - rect.left;
    const y1 = r1.top + r1.height / 2 - rect.top;
    const x2 = r2.left + r2.width / 2 - rect.left;
    const y2 = r2.top + r2.height / 2 - rect.top;
    // cubic bezier curve
    const dx = Math.abs(x2 - x1) * 0.45;
    const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);
    p.setAttribute('marker-end', 'url(#arrowhead)');
    svg.appendChild(p);
  });
}

window.addEventListener('resize', () => {
  if (document.getElementById('ideias').classList.contains('active')) drawConnections();
});

document.getElementById('btnLimparConexoes').addEventListener('click', () => {
  state.connections = [];
  connectFrom = null;
  saveState();
  drawConnections();
  toast('Linhas de conexão limpas.');
});

function renderSemanaSidebar() {
  const el = document.getElementById('semanaScroll');
  const items = state.cronograma.filter(r => r.data).sort((a,b) => a.data.localeCompare(b.data));
  if (items.length === 0) {
    el.innerHTML = '<p class="empty-state small">Nenhum item no cronograma ainda.</p>';
    return;
  }
  el.innerHTML = items.map(r => `
    <div class="semana-item">
      <div class="dia">${r.diaSemana || diaSemana(r.data)} · ${r.data} ${r.hora || ''}</div>
      <div>${capitalize(r.tema || r.formato || 'Post')}</div>
    </div>
  `).join('');
}

document.getElementById('btnConectarModelo').addEventListener('click', () => {
  const parts = [];
  ['ideias','dados','tendencias'].forEach(key => {
    (state.selectedConexoes[key] || []).forEach(id => {
      const item = (state[key] || []).find(i => i.id === id);
      if (item) parts.push(`[${capitalize(key)}] ${item.text}`);
    });
  });
  if (parts.length === 0) {
    toast('Selecione ao menos uma ideia, dado ou tendência.');
    return;
  }
  document.getElementById('modeloPreviewBox').innerHTML =
    parts.map(p => `<div class="conexao-tag">${p}</div>`).join('');
  document.querySelector('.tab[data-tab="modelo"]').click();
  const desc = document.getElementById('postDescricao');
  if (!desc.value) desc.value = parts.join('\n');
  renderConexoesAtivas();
  toast('Conexões enviadas para o Modelo de Post.');
});

function renderConexoesAtivas() {
  const el = document.getElementById('conexoesAtivas');
  const tags = [];
  ['ideias','dados','tendencias'].forEach(key => {
    (state.selectedConexoes[key] || []).forEach(id => {
      const item = (state[key] || []).find(i => i.id === id);
      if (item) tags.push(`<span class="conexao-tag">${capitalize(key)}: ${item.text}</span>`);
    });
  });
  el.innerHTML = tags.length ? tags.join('') : '<p class="empty-state small">Nenhuma conexão selecionada na aba Ideias.</p>';
}

/* ---------- Modelo de Post + format buttons + image ---------- */
document.querySelectorAll('.format-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('postTipo').value = btn.dataset.tipo;
  });
});

function compressImage(file, maxWidth = 1200, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', quality);
      URL.revokeObjectURL(url);
      resolve(base64);
    };
    img.onerror = reject;
    img.src = url;
  });
}

const uploadZone = document.getElementById('uploadZone');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');

uploadZone.addEventListener('click', () => imageInput.click());
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  if (e.dataTransfer.files[0]) handleImage(e.dataTransfer.files[0]);
});
imageInput.addEventListener('change', () => {
  if (imageInput.files[0]) handleImage(imageInput.files[0]);
});

async function handleImage(file) {
  if (!file.type.startsWith('image/')) { toast('Selecione um arquivo de imagem.'); return; }
  toast('Comprimindo imagem...');
  try {
    const base64 = await compressImage(file);
    state.currentImageBase64 = base64;
    previewImage.src = base64;
    previewImage.hidden = false;
    uploadPlaceholder.hidden = true;
    toast('Imagem pronta (Base64 comprimido).');
  } catch (err) {
    toast('Erro ao processar imagem.');
  }
}

function clearModeloForm() {
  document.getElementById('postTitulo').value = '';
  document.getElementById('postDescricao').value = '';
  document.getElementById('postData').value = '';
  document.getElementById('postHora').value = '';
  document.getElementById('postTipo').value = '';
  document.getElementById('postObjetivos').value = '';
  document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
  state.currentImageBase64 = null;
  previewImage.hidden = true;
  previewImage.src = '';
  uploadPlaceholder.hidden = false;
  imageInput.value = '';
}
document.getElementById('btnCancelarModelo').addEventListener('click', clearModeloForm);

document.getElementById('btnSalvarModelo').addEventListener('click', () => {
  const titulo = capitalize(document.getElementById('postTitulo').value.trim());
  if (!titulo && !state.currentImageBase64) {
    toast('Informe ao menos um título ou uma imagem.');
    return;
  }
  state.modelos.unshift({
    id: uid(),
    titulo,
    descricao: document.getElementById('postDescricao').value.trim(),
    data: document.getElementById('postData').value,
    hora: document.getElementById('postHora').value,
    tipo: document.getElementById('postTipo').value,
    objetivos: document.getElementById('postObjetivos').value.trim(),
    image: state.currentImageBase64,
    agendado: false,
    conexoes: { ...state.selectedConexoes },
    createdAt: new Date().toISOString()
  });
  saveState();
  renderModelosSalvos();
  clearModeloForm();
  toast('Modelo salvo!');
});

document.getElementById('btnAgendarPost').addEventListener('click', () => {
  const titulo = capitalize(document.getElementById('postTitulo').value.trim());
  const data = document.getElementById('postData').value;
  const hora = document.getElementById('postHora').value;
  const tipo = document.getElementById('postTipo').value;
  if (!data) { toast('Informe a data para agendar.'); return; }

  state.modelos.unshift({
    id: uid(),
    titulo: titulo || 'Post agendado',
    descricao: document.getElementById('postDescricao').value.trim(),
    data, hora, tipo,
    objetivos: document.getElementById('postObjetivos').value.trim(),
    image: state.currentImageBase64,
    agendado: true,
    conexoes: { ...state.selectedConexoes },
    createdAt: new Date().toISOString()
  });
  state.cronograma.push({
    id: uid(), data, diaSemana: diaSemana(data), hora,
    formato: tipo, tema: titulo || 'Post',
    resultados: 'Agendado', correcoes: '', melhorias: ''
  });
  saveState();
  renderModelosSalvos();
  renderCronograma();
  renderSemanaSidebar();
  renderCalendar();
  clearModeloForm();
  toast('Postagem agendada e adicionada ao Cronograma!');
});

function renderModelosSalvos() {
  const el = document.getElementById('listaModelosSalvos');
  if (state.modelos.length === 0) {
    el.innerHTML = '<p class="empty-state small">Nenhum modelo salvo ainda.</p>';
    return;
  }
  el.innerHTML = state.modelos.map(m => `
    <div class="modelo-card" data-id="${m.id}">
      ${m.image ? `<img src="${m.image}" alt="" />` : ''}
      <div class="titulo">${capitalize(m.titulo || 'Sem título')}</div>
      <div style="font-size:0.7rem;color:var(--text-muted)">${m.data || ''} ${m.agendado ? '· Agendado' : ''}</div>
    </div>
  `).join('');
  el.querySelectorAll('.modelo-card').forEach(card => {
    card.addEventListener('click', () => {
      const m = state.modelos.find(x => x.id === card.dataset.id);
      if (!m) return;
      document.getElementById('postTitulo').value = m.titulo || '';
      document.getElementById('postDescricao').value = m.descricao || '';
      document.getElementById('postData').value = m.data || '';
      document.getElementById('postHora').value = m.hora || '';
      document.getElementById('postTipo').value = m.tipo || '';
      document.getElementById('postObjetivos').value = m.objetivos || '';
      document.querySelectorAll('.format-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tipo === m.tipo);
      });
      if (m.image) {
        state.currentImageBase64 = m.image;
        previewImage.src = m.image;
        previewImage.hidden = false;
        uploadPlaceholder.hidden = true;
      }
      toast('Modelo carregado.');
    });
  });
}

/* ---------- CSV ---------- */
document.getElementById('btnExportCSV').addEventListener('click', () => {
  const lines = [];
  lines.push('=== TAREFAS CONCLUIDAS ===');
  lines.push(`Tarefas concluida do total,${state.tarefasConcluidasCount + state.kanban.feito.length}`);
  lines.push(`postagens feitas / postagens agendadas,${state.cronograma.filter(r => (r.resultados||'').toLowerCase().includes('postado')).length} / ${state.cronograma.length}`);
  lines.push('');
  lines.push('=== CALENDARIO / CRONOGRAMA ===');
  lines.push('data,dia da semana,hora,formato,tema do conteudo,resultados,correcoes,melhorias');
  state.cronograma.forEach(r => {
    lines.push([r.data, r.diaSemana, r.hora, r.formato, r.tema, r.resultados, r.correcoes, r.melhorias]
      .map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','));
  });
  lines.push('');
  lines.push('=== KANBAN ===');
  lines.push('coluna,texto,descricao');
  Object.entries(state.kanban).forEach(([col, items]) => {
    items.forEach(i => lines.push(`"${col}","${(i.text||'').replace(/"/g,'""')}","${(i.desc||'').replace(/"/g,'""')}"`));
  });
  lines.push('');
  lines.push('=== OBJETIVOS / METAS / ETAPAS / POOL ===');
  ['objetivos','metas','etapas','tarefasPool'].forEach(k => {
    (state[k]||[]).forEach(i => lines.push(`"${k}","${(i.text||'').replace(/"/g,'""')}","${(i.desc||'').replace(/"/g,'""')}"`));
  });
  lines.push('');
  lines.push('=== IDEIAS / DADOS / TENDENCIAS ===');
  ['ideias','dados','tendencias'].forEach(k => {
    (state[k]||[]).forEach(i => lines.push(`"${k}","${(i.text||'').replace(/"/g,'""')}"`));
  });
  lines.push('');
  lines.push('=== MODELOS DE POST ===');
  lines.push('titulo,descricao,data,hora,tipo,objetivos,agendado');
  state.modelos.forEach(m => {
    lines.push([m.titulo, m.descricao, m.data, m.hora, m.tipo, m.objetivos, m.agendado ? 'sim' : 'nao']
      .map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `producao-criativa-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  toast('CSV exportado.');
});

document.getElementById('btnImportCSV').addEventListener('click', () => document.getElementById('csvInput').click());
document.getElementById('csvInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    parseAndImportCSV(await file.text());
    toast('CSV importado com sucesso.');
    fullRender();
  } catch (err) {
    console.error(err);
    toast('Erro ao importar CSV.');
  }
  e.target.value = '';
});

function parseAndImportCSV(text) {
  const lines = text.split(/\r?\n/);
  let section = null;
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('===')) {
      if (trimmed.includes('CRONOGRAMA') || trimmed.includes('CALENDARIO')) section = 'cronograma';
      else if (trimmed.includes('KANBAN')) section = 'kanban';
      else if (trimmed.includes('OBJETIVOS') || trimmed.includes('METAS')) section = 'listas';
      else if (trimmed.includes('IDEIAS')) section = 'conexoes';
      else if (trimmed.includes('MODELOS')) section = 'modelos';
      else if (trimmed.includes('TAREFAS CONCLUIDAS')) section = 'meta';
      else section = null;
      return;
    }
    if (/^(data|coluna|titulo),/i.test(trimmed)) return;
    const cols = parseCSVLine(trimmed);
    if (section === 'cronograma' && cols.length >= 5) {
      state.cronograma.push({
        id: uid(), data: cols[0]||'', diaSemana: cols[1]||diaSemana(cols[0]),
        hora: cols[2]||'', formato: cols[3]||'', tema: cols[4]||'',
        resultados: cols[5]||'', correcoes: cols[6]||'', melhorias: cols[7]||''
      });
    } else if (section === 'kanban' && cols.length >= 2) {
      const col = cols[0];
      if (state.kanban[col]) state.kanban[col].push({ id: uid(), text: cols[1], desc: cols[2]||'', checked: false });
    } else if (section === 'listas' && cols.length >= 2) {
      const key = cols[0];
      if (state[key]) state[key].push({ id: uid(), text: cols[1], desc: cols[2]||'', checked: false });
    } else if (section === 'conexoes' && cols.length >= 2) {
      const key = cols[0];
      if (state[key]) state[key].push({ id: uid(), text: cols[1], desc: '', checked: false });
    } else if (section === 'modelos' && cols.length >= 1) {
      state.modelos.push({
        id: uid(), titulo: cols[0]||'', descricao: cols[1]||'', data: cols[2]||'',
        hora: cols[3]||'', tipo: cols[4]||'', objetivos: cols[5]||'',
        agendado: (cols[6]||'').toLowerCase() === 'sim', image: null, conexoes: {},
        createdAt: new Date().toISOString()
      });
    } else if (section === 'meta' && cols[0] && cols[0].includes('concluida')) {
      const n = parseInt(cols[1], 10);
      if (!isNaN(n)) state.tarefasConcluidasCount = n;
    }
  });
  saveState();
}
function parseCSVLine(line) {
  const result = []; let current = ''; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) { result.push(current); current = ''; }
    else current += c;
  }
  result.push(current);
  return result;
}

/* ---------- Full render ---------- */
function fullRender() {
  renderCronograma();
  renderSidebarLists();
  renderKanban();
  renderConexoes();
  renderModelosSalvos();
  renderSemanaSidebar();
  updateMetrics();
  renderCalendar();
  renderConexoesAtivas();
}

initQuotes();
initCalendar();
fullRender();
