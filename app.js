
import { faculties, departments, instructors, courses, deptMap, courseMap } from './data.js';

const $  = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => Array.from(p.querySelectorAll(s));

// Mobile nav
(function navToggle(){
  const btn = $('#navToggle'); const menu = $('#navMenu');
  if (btn && menu) btn.addEventListener('click', ()=>{
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
})();

// Bookmarks
const getBookmarks = () => JSON.parse(localStorage.getItem('bookmarks') || '[]');
const setBookmarks = (arr) => localStorage.setItem('bookmarks', JSON.stringify(arr));
const toggleBookmark = (code) => {
  const b = new Set(getBookmarks());
  b.has(code) ? b.delete(code) : b.add(code);
  setBookmarks([...b]);
  renderCourses();
};

// Drawer
const drawer = $('#drawer');
const drawerTitle = $('#drawerTitle');
const drawerBody = $('#drawerBody');
$('#drawerClose')?.addEventListener('click', () => drawer.setAttribute('aria-hidden', 'true'));
const openDrawer = (title, html) => {
  if (!drawer) return;
  drawerTitle.textContent = title;
  drawerBody.innerHTML = html;
  drawer.setAttribute('aria-hidden', 'false');
};

// Home
function renderHome(){
  const featured = $('#featuredCourses');
  if (!featured) return;
  featured.innerHTML = courses.slice(0,4).map(c => cardCourse(c)).join('');
  $$('.chip').forEach(ch => ch.addEventListener('click', ()=>{
    const kw = ch.dataset.filter.toLowerCase();
    const found = courses.filter(c => c.title.toLowerCase().includes(kw) || c.code.toLowerCase().includes(kw));
    openDrawer(`نتائج "${ch.dataset.filter}"`, renderCourseTable(found));
  }));
  const globalSearch = $('#globalSearch');
  $('#searchBtn')?.addEventListener('click', ()=>{
    const kw = (globalSearch.value||'').toLowerCase().trim();
    const foundC = courses.filter(c => c.title.toLowerCase().includes(kw) || c.code.toLowerCase().includes(kw));
    const foundI = instructors.filter(i => i.name.toLowerCase().includes(kw) || i.expertise.join(' ').toLowerCase().includes(kw));
    openDrawer('البحث العام', `<h3>المقررات</h3>${renderCourseTable(foundC)}<h3>المدرّسون</h3>${renderInstructorTable(foundI)}`);
  });
}

// Departments
function renderDepartments(){
  const list = $('#departmentsList'); const sel = $('#deptFilter');
  if (!list || !sel) return;
  faculties.forEach(f=>{ const o=document.createElement('option'); o.value=f.id; o.textContent=f.name; sel.appendChild(o); });
  const paint = ()=>{
    const filter = sel.value;
    const arr = filter ? departments.filter(d => d.facultyId===filter) : departments;
    list.innerHTML = arr.map(d => cardDepartment(d)).join('');
    $$('.card[data-dept-id]').forEach(card => {
      card.addEventListener('click', ()=>{
        const id = card.getAttribute('data-dept-id');
        const d = departments.find(x=>x.id===id);
        const html = `
          <p><strong>التخصصات:</strong> ${d.majors.join(', ')}</p>
          <p>${d.summary}</p>
          <h4>مقررات القسم</h4>
          ${renderCourseTable(courses.filter(c=>c.departmentId===d.id))}
        `;
        openDrawer(d.name, html);
      });
    });
  };
  sel.addEventListener('change', paint); paint();
}

// Courses
function renderCourses(){
  const list = $('#coursesList'); if (!list) return;
  const q = $('#courseSearch'); const deptSel = $('#deptSelect'); const creditSel = $('#creditSelect'); const sortSel = $('#sortSelect');
  if (deptSel && deptSel.options.length===1) departments.forEach(d=>{
    const o=document.createElement('option'); o.value=d.id; o.textContent=d.name; deptSel.appendChild(o);
  });
  const apply = ()=>{
    const kw = (q.value||'').toLowerCase().trim();
    const dpt = deptSel.value; const cre = creditSel.value; const sortBy = sortSel.value;
    let arr = courses.filter(c=>{
      const kwMatch = !kw || c.title.toLowerCase().includes(kw) || c.code.toLowerCase().includes(kw);
      const deptMatch = !dpt || c.departmentId===dpt;
      const credMatch = !cre || String(c.credits)===cre;
      return kwMatch && deptMatch && credMatch;
    });
    arr.sort((a,b)=>{
      if (sortBy==='title') return a.title.localeCompare(b.title,'ar');
      if (sortBy==='credits') return a.credits - b.credits;
      return a.code.localeCompare(b.code);
    });
    list.innerHTML = arr.map(c=>cardCourse(c)).join('');
    $$('.btn-details', list).forEach(btn=>btn.addEventListener('click', ()=>{
      const code = btn.getAttribute('data-code'); const c = courseMap[code]; const d = deptMap[c.departmentId];
      const prereq = c.prereq.length ? c.prereq.map(p=>`<code>${p}</code>`).join(', ') : 'لا يوجد';
      openDrawer(`${c.code} — ${c.title}`, `<p><strong>القسم:</strong> ${d?.name||''}</p><p><strong>الساعات:</strong> ${c.credits}</p><p><strong>المتطلبات:</strong> ${prereq}</p>`);
    }));
    $$('.btn-bookmark', list).forEach(btn=>btn.addEventListener('click', ()=>toggleBookmark(btn.getAttribute('data-code'))));
  };
  [q, deptSel, creditSel, sortSel].forEach(el=>el && el.addEventListener('input', apply));
  apply();
}

// Instructors
function renderInstructors(){
  const list = $('#instructorsList'); const q = $('#instructorSearch'); const exSel = $('#expertiseSelect'); if (!list) return;
  const exSet = new Set(instructors.flatMap(i=>i.expertise));
  if (exSel && exSel.options.length===1) Array.from(exSet).sort((a,b)=>a.localeCompare(b,'ar')).forEach(x=>{
    const o=document.createElement('option'); o.value=x; o.textContent=x; exSel.appendChild(o);
  });
  const apply = ()=>{
    const kw = (q.value||'').toLowerCase().trim(); const ex = exSel.value;
    const arr = instructors.filter(i=>{
      const kwMatch = !kw || i.name.toLowerCase().includes(kw) || i.expertise.join(' ').toLowerCase().includes(kw);
      const exMatch = !ex || i.expertise.includes(ex);
      return kwMatch && exMatch;
    });
    list.innerHTML = arr.map(i=>cardInstructor(i)).join('');
  };
  [q, exSel].forEach(el=>el && el.addEventListener('input', apply)); apply();
}

// Cards & tables
const cardCourse = (c)=>{
  const bm = new Set(getBookmarks()); const isB = bm.has(c.code);
  return `<article class="card" role="listitem">
    <h4>${c.code} — ${c.title}</h4>
    <p class="meta">الساعات: ${c.credits} • القسم: ${deptMap[c.departmentId]?.name||''}</p>
    <div class="actions">
      <button class="btn btn-details" data-code="${c.code}">التفاصيل</button>
      <button class="btn btn-bookmark" data-code="${c.code}" aria-pressed="${isB}">${isB ? '★ مفضّل' : '☆ أضف للمفضلة'}</button>
    </div>
  </article>`;
};
const cardDepartment = (d)=>`
  <article class="card" role="listitem" data-dept-id="${d.id}" tabindex="0">
    <h4>${d.name}</h4>
    <p class="meta">${faculties.find(f=>f.id===d.facultyId)?.name||''}</p>
    <p>${d.summary}</p>
    <p><strong>التخصصات:</strong> ${d.majors.join(', ')}</p>
  </article>
`;
const cardInstructor = (i)=>`
  <article class="card" role="listitem">
    <h4>${i.name}</h4>
    <p class="meta">القسم: ${deptMap[i.departmentId]?.name||''}</p>
    <p>الخبرات: ${i.expertise.join(', ')}</p>
  </article>
`;
const renderCourseTable = (arr)=> arr.length ? `
  <div class="table-scroll">
    <table>
      <thead><tr><th>الكود</th><th>العنوان</th><th>الساعات</th><th>القسم</th></tr></thead>
      <tbody>${arr.map(c=>`<tr><td>${c.code}</td><td>${c.title}</td><td>${c.credits}</td><td>${deptMap[c.departmentId]?.name||''}</td></tr>`).join('')}</tbody>
    </table>
  </div>` : '<p>لا توجد نتائج.</p>';

const renderInstructorTable = (arr)=> arr.length ? `
  <div class="table-scroll">
    <table>
      <thead><tr><th>الاسم</th><th>القسم</th><th>الخبرات</th></tr></thead>
      <tbody>${arr.map(i=>`<tr><td>${i.name}</td><td>${deptMap[i.departmentId]?.name||''}</td><td>${i.expertise.join(', ')}</td></tr>`).join('')}</tbody>
    </table>
  </div>` : '<p>لا توجد نتائج.</p>';

// Router
const page = window.__PAGE__;
if (page==='home') renderHome();
if (page==='departments') renderDepartments();
if (page==='courses') renderCourses();
if (page==='instructors') renderInstructors();
