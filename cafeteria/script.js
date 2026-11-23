// ===== Guía de Git y GitHub con IA =====

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenu();
  initProgressAndNav();
  initReveal();
  initTerminal();
  initFlow();
  renderCommands();
  initTabs();
  initCommitGenerator();
  renderPrompts();
  initQuiz();
  initCopyButtons();
});

/* ---------- Utilidades ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showToast(msg = "¡Copiado!") {
  const toast = $("#toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1600);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Alternativa para navegadores sin API de portapapeles
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  showToast();
}

/* ---------- Tema claro / oscuro ---------- */
function initTheme() {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("tema"); } catch {}
  if (saved) root.dataset.theme = saved;

  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("tema", next); } catch {}
  });
}

/* ---------- Menú móvil ---------- */
function initMenu() {
  const nav = $("#nav");
  $("#menuBtn").addEventListener("click", () => nav.classList.toggle("open"));
  $$("a", nav).forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}

/* ---------- Barra de progreso + enlace activo ---------- */
function initProgressAndNav() {
  const bar = $("#progress");
  const links = $$(".nav a");
  const sections = links.map(l => $(l.getAttribute("href")));

  const onScroll = () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = `${pct}%`;

    let current = -1;
    sections.forEach((s, i) => {
      if (s && s.getBoundingClientRect().top < 140) current = i;
    });
    links.forEach((l, i) => l.classList.toggle("active", i === current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Animación al hacer scroll ---------- */
function initReveal() {
  const items = $$(".section-head, .card, .ai-card, .flow, .tabs, .accordion, .commit-gen, .dos, .quiz, .cmd-tools");
  items.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

/* ---------- Terminal animada del hero ---------- */
function initTerminal() {
  const el = $("#typedTerminal");
  const lines = [
    { t: "$ git switch -c feature/login", c: "p" },
    { t: "Switched to a new branch 'feature/login'", c: "dim" },
    { t: "$ git add src/login.js", c: "p" },
    { t: "$ ia \"sugiere un mensaje de commit\"", c: "p" },
    { t: "🤖 feat(auth): agregar formulario de inicio de sesión", c: "ai" },
    { t: "   con validación de correo y contraseña", c: "ai" },
    { t: "$ git commit -m \"feat(auth): agregar formulario de login\"", c: "p" },
    { t: "[feature/login 3f2a9c1] 1 file changed, 48 insertions(+)", c: "dim" },
    { t: "$ git push -u origin feature/login", c: "p" },
    { t: "✔ Rama publicada. ¡Abre tu Pull Request!", c: "dim" },
  ];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    el.innerHTML = lines.map(l => `<span class="${l.c}">${escapeHTML(l.t)}</span>`).join("\n");
    return;
  }

  let li = 0, ci = 0, html = "";
  const cursor = '<span class="cursor">&nbsp;</span>';

  function step() {
    if (li >= lines.length) {
      el.innerHTML = html + cursor;
      setTimeout(() => { li = 0; ci = 0; html = ""; step(); }, 4000);
      return;
    }
    const line = lines[li];
    const isCommand = line.t.startsWith("$");
    if (isCommand && ci < line.t.length) {
      ci++;
      el.innerHTML = html + `<span class="${line.c}">${escapeHTML(line.t.slice(0, ci))}</span>` + cursor;
      setTimeout(step, 28 + Math.random() * 40);
    } else {
      html += `<span class="${line.c}">${escapeHTML(line.t)}</span>\n`;
      li++; ci = 0;
      el.innerHTML = html + cursor;
      setTimeout(step, isCommand ? 350 : 500);
    }
  }
  step();
}

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

/* ---------- Diagrama de las tres áreas ---------- */
function initFlow() {
  const hint = $("#flowHint");
  const steps = $$(".flow-step");
  const show = s => {
    steps.forEach(x => x.classList.remove("active"));
    s.classList.add("active");
    hint.textContent = s.dataset.tip;
  };
  steps.forEach(s => {
    s.addEventListener("mouseenter", () => show(s));
    s.addEventListener("click", () => show(s));
  });
}

/* ---------- Comandos ---------- */
const COMMANDS = [
  { cmd: "git init", desc: "Crea un repositorio nuevo en la carpeta actual.", cat: "básico" },
  { cmd: "git clone <url>", desc: "Descarga una copia completa de un repositorio remoto.", cat: "básico" },
  { cmd: "git status", desc: "Muestra qué archivos cambiaron y qué está en staging.", cat: "básico" },
  { cmd: "git add <archivo>", desc: "Prepara un archivo para el próximo commit. Usa '.' para todos.", cat: "básico" },
  { cmd: "git add -p", desc: "Prepara cambios por fragmentos; ideal para commits pequeños.", cat: "básico" },
  { cmd: "git commit -m \"mensaje\"", desc: "Guarda los cambios preparados con un mensaje descriptivo.", cat: "básico" },
  { cmd: "git diff", desc: "Muestra cambios sin preparar. Con --staged, los preparados.", cat: "historial" },
  { cmd: "git log --oneline --graph", desc: "Historial compacto con el dibujo de las ramas.", cat: "historial" },
  { cmd: "git blame <archivo>", desc: "Indica quién cambió cada línea y en qué commit.", cat: "historial" },
  { cmd: "git show <commit>", desc: "Muestra el detalle de un commit concreto.", cat: "historial" },
  { cmd: "git branch", desc: "Lista las ramas locales. Con -d <rama> borra una.", cat: "ramas" },
  { cmd: "git switch -c <rama>", desc: "Crea una rama nueva y te cambia a ella.", cat: "ramas" },
  { cmd: "git switch <rama>", desc: "Cambia a una rama existente.", cat: "ramas" },
  { cmd: "git merge <rama>", desc: "Fusiona la rama indicada en la rama actual.", cat: "ramas" },
  { cmd: "git rebase main", desc: "Reaplica tus commits encima de main (historial lineal).", cat: "ramas" },
  { cmd: "git stash", desc: "Guarda temporalmente cambios sin commit. Recupéralos con git stash pop.", cat: "ramas" },
  { cmd: "git remote -v", desc: "Muestra los repositorios remotos configurados.", cat: "remoto" },
  { cmd: "git fetch", desc: "Descarga cambios del remoto sin fusionarlos.", cat: "remoto" },
  { cmd: "git pull", desc: "Descarga y fusiona los cambios de la rama remota.", cat: "remoto" },
  { cmd: "git push -u origin <rama>", desc: "Sube tu rama y la vincula con el remoto.", cat: "remoto" },
  { cmd: "git restore <archivo>", desc: "Descarta cambios locales de un archivo sin preparar.", cat: "deshacer" },
  { cmd: "git restore --staged <archivo>", desc: "Saca un archivo del staging sin perder los cambios.", cat: "deshacer" },
  { cmd: "git commit --amend", desc: "Corrige el último commit (mensaje o archivos). Solo si no lo subiste.", cat: "deshacer" },
  { cmd: "git revert <commit>", desc: "Crea un commit que deshace otro. Seguro en ramas compartidas.", cat: "deshacer" },
  { cmd: "git reset --soft HEAD~1", desc: "Deshace el último commit conservando los cambios preparados.", cat: "deshacer" },
  { cmd: "git reflog", desc: "Historial de movimientos de HEAD: tu red de seguridad para recuperar trabajo.", cat: "deshacer" },
];

function renderCommands() {
  const grid = $("#cmdGrid");
  const search = $("#cmdSearch");
  const empty = $("#cmdEmpty");
  let category = "todos";

  const normalize = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function draw() {
    const q = normalize(search.value.trim());
    const list = COMMANDS.filter(c =>
      (category === "todos" || c.cat === category) &&
      (!q || normalize(c.cmd + " " + c.desc + " " + c.cat).includes(q))
    );
    grid.innerHTML = list.map(c => `
      <button class="cmd" data-copy="${escapeHTML(c.cmd)}" title="Clic para copiar">
        <span class="tag">${c.cat}</span>
        <code>${escapeHTML(c.cmd)}</code>
        <p>${c.desc}</p>
      </button>`).join("");
    empty.hidden = list.length > 0;
  }

  search.addEventListener("input", draw);
  $$("#cmdChips .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      $$("#cmdChips .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      category = chip.dataset.cat;
      draw();
    });
  });
  grid.addEventListener("click", e => {
    const card = e.target.closest(".cmd");
    if (card) copyText(card.dataset.copy);
  });
  draw();
}

/* ---------- Pestañas ---------- */
function initTabs() {
  $$("[data-tabs]").forEach(box => {
    const tabs = $$(".tab", box);
    const panels = $$(".tab-panel", box);
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.toggle("active", t === tab));
        panels.forEach(p => p.classList.toggle("active", p.dataset.panel === tab.dataset.tab));
      });
    });
  });
}

/* ---------- Generador de mensajes de commit ---------- */
function initCommitGenerator() {
  const type = $("#cType"), scope = $("#cScope"), desc = $("#cDesc"), breaking = $("#cBreaking");
  const out = $("#cOutput");

  function build() {
    let d = desc.value.trim() || "describe tu cambio";
    d = d.charAt(0).toLowerCase() + d.slice(1);   // convención: minúscula
    d = d.replace(/\.$/, "");                     // sin punto final
    const s = scope.value.trim().toLowerCase().replace(/\s+/g, "-");
    const head = `${type.value}${s ? `(${s})` : ""}${breaking.checked ? "!" : ""}: ${d}`;
    let msg = `git commit -m "${head}"`;
    if (breaking.checked) msg += `\n           -m "BREAKING CHANGE: explica qué deja de funcionar y cómo migrar"`;
    out.textContent = msg;
  }

  [type, scope, desc, breaking].forEach(el => el.addEventListener("input", build));
  build();
}

/* ---------- Biblioteca de prompts ---------- */
const PROMPTS = [
  {
    title: "Mensaje de commit",
    text: "Este es mi diff preparado (git diff --staged). Propón un mensaje de commit en formato Conventional Commits, con un título de máximo 72 caracteres y un cuerpo que explique el porqué del cambio:\n\n[pega el diff]",
  },
  {
    title: "Descripción de Pull Request",
    text: "Redacta la descripción de un Pull Request a partir de estos cambios. Incluye: resumen, motivo, lista de cambios principales, cómo probarlo y riesgos posibles:\n\n[pega git log main..HEAD y el diff]",
  },
  {
    title: "Revisión de código",
    text: "Actúa como revisor de código senior. Revisa este diff buscando errores, casos borde no cubiertos, problemas de seguridad y nombres poco claros. Ordena los hallazgos por gravedad y sugiere correcciones concretas:\n\n[pega el diff]",
  },
  {
    title: "Resolver un conflicto",
    text: "Tengo este conflicto de merge. Explica qué intenta lograr cada versión y propón una resolución que conserve la intención de ambas. No inventes funciones que no existan:\n\n[pega el bloque con <<<<<<< ======= >>>>>>>]",
  },
  {
    title: "Entender un error de Git",
    text: "Recibí este error al ejecutar un comando de Git. Explícame en palabras simples qué significa, por qué ocurrió y qué opciones tengo, indicando cuáles son seguras y cuáles pueden perder trabajo:\n\n[pega el comando y el error]",
  },
  {
    title: "Crear un workflow de GitHub Actions",
    text: "Crea un workflow de GitHub Actions para un proyecto [Node/Python/…] que en cada push y pull request instale dependencias, ejecute el linter y las pruebas. Explica cada paso con comentarios.",
  },
  {
    title: "Generar un .gitignore",
    text: "Genera un archivo .gitignore para un proyecto con [tecnologías]. Incluye archivos de sistema, dependencias, compilados, logs y variables de entorno (.env).",
  },
];

function renderPrompts() {
  const list = $("#promptList");
  list.innerHTML = PROMPTS.map((p, i) => `
    <article class="prompt">
      <div>
        <h4>${p.title}</h4>
        <p>${escapeHTML(p.text).replace(/\n/g, "<br>")}</p>
      </div>
      <button data-i="${i}">Copiar</button>
    </article>`).join("");
  list.addEventListener("click", e => {
    const btn = e.target.closest("button[data-i]");
    if (btn) copyText(PROMPTS[btn.dataset.i].text);
  });
}

/* ---------- Quiz ---------- */
const QUIZ = [
  {
    q: "¿Qué comando mueve cambios del directorio de trabajo al área de staging?",
    options: ["git commit", "git add", "git push", "git stash"],
    a: 1,
    exp: "git add prepara los cambios; git commit los guarda en el historial.",
  },
  {
    q: "Necesitas deshacer un commit que ya está en una rama compartida. ¿Qué es lo más seguro?",
    options: ["git reset --hard", "git push --force", "git revert <commit>", "Borrar la rama"],
    a: 2,
    exp: "git revert crea un commit nuevo que deshace el anterior sin reescribir el historial de los demás.",
  },
  {
    q: "¿Cuál es la diferencia principal entre Git y GitHub?",
    options: [
      "Son lo mismo con distinto nombre",
      "Git es el sistema de versiones; GitHub es una plataforma que aloja repositorios",
      "GitHub funciona sin internet y Git no",
      "Git solo sirve para JavaScript",
    ],
    a: 1,
    exp: "Git funciona localmente; GitHub añade alojamiento remoto y colaboración.",
  },
  {
    q: "Una IA te sugiere ejecutar git push --force en main. ¿Qué haces?",
    options: [
      "Lo ejecuto, la IA sabe lo que hace",
      "Entiendo primero qué hace y por qué; normalmente evito forzar en ramas compartidas",
      "Lo ejecuto dos veces para asegurar",
      "Borro el repositorio",
    ],
    a: 1,
    exp: "Forzar el push puede sobrescribir el trabajo de otros. Revisa siempre los comandos destructivos.",
  },
  {
    q: "¿Qué información NUNCA deberías pegar en un asistente de IA?",
    options: ["Un mensaje de error", "Un diff de código", "Tokens de acceso o contraseñas", "Un comando de Git"],
    a: 2,
    exp: "Los secretos deben quedarse fuera de chats, commits y repositorios. Si se filtran, revócalos.",
  },
];

function initQuiz() {
  let i = 0, score = 0;
  const qEl = $("#quizQuestion"), opts = $("#quizOptions"), fb = $("#quizFeedback");
  const next = $("#quizNext"), count = $("#quizCount"), scoreEl = $("#quizScore");

  function render() {
    const item = QUIZ[i];
    count.textContent = `Pregunta ${i + 1} de ${QUIZ.length}`;
    scoreEl.textContent = `Puntos: ${score}`;
    qEl.textContent = item.q;
    fb.textContent = "";
    next.hidden = true;
    opts.innerHTML = item.options.map((o, k) => `<button class="quiz-opt" data-k="${k}">${escapeHTML(o)}</button>`).join("");
  }

  opts.addEventListener("click", e => {
    const btn = e.target.closest(".quiz-opt");
    if (!btn || btn.disabled) return;
    const item = QUIZ[i];
    const k = Number(btn.dataset.k);
    $$(".quiz-opt", opts).forEach(b => (b.disabled = true));
    opts.children[item.a].classList.add("correct");
    if (k === item.a) {
      score++;
      fb.innerHTML = `✅ <strong>¡Correcto!</strong> ${item.exp}`;
    } else {
      btn.classList.add("wrong");
      fb.innerHTML = `❌ <strong>No exactamente.</strong> ${item.exp}`;
    }
    scoreEl.textContent = `Puntos: ${score}`;
    next.textContent = i === QUIZ.length - 1 ? "Ver resultado" : "Siguiente";
    next.hidden = false;
  });

  next.addEventListener("click", () => {
    if (next.dataset.restart) {
      delete next.dataset.restart;
      i = 0; score = 0; render();
      return;
    }
    i++;
    if (i < QUIZ.length) return render();

    const msgs = ["¡Sigue practicando!", "¡Vas por buen camino!", "¡Excelente, dominas lo básico!"];
    const level = score === QUIZ.length ? 2 : score >= 3 ? 1 : 0;
    count.textContent = "Resultado final";
    qEl.textContent = `Obtuviste ${score} de ${QUIZ.length}. ${msgs[level]}`;
    opts.innerHTML = "";
    fb.textContent = "";
    next.textContent = "Reintentar";
    next.dataset.restart = "1";
  });

  render();
}

/* ---------- Botones "Copiar" de los bloques de código ---------- */
function initCopyButtons() {
  document.addEventListener("click", e => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const code = btn.parentElement.querySelector("code");
    copyText(code.innerText);
    btn.textContent = "¡Listo!";
    setTimeout(() => (btn.textContent = "Copiar"), 1400);
  });
}
