import { faculties, departments, instructors, courses, deptMap, courseMap } from './data.js';
const $=(s,p=document)=>p.querySelector(s); const $$=(s,p=document)=>Array.from(p.querySelectorAll(s));
(function(){const b=$('#navToggle'),m=$('#navMenu'); if(b&&m) b.addEventListener('click',()=>{const o=m.classList.toggle('open'); b.setAttribute('aria-expanded', String(o));});})();
const getBookmarks=()=>JSON.parse(localStorage.getItem('bookmarks')||'[]'); const setBookmarks=a=>localStorage.setItem('bookmarks',JSON.stringify(a));
const toggleBookmark=code=>{const s=new Set(getBookmarks()); s.has(code)?s.delete(code):s.add(code); setBookmarks([...s]); renderCourses();};
const drawer=$('#drawer'), t=$('#drawerTitle'), body=$('#drawerBody'); $('#drawerClose')?.addEventListener('click',()=>drawer.setAttribute('aria-hidden','true'));
function openDrawer(title,html){ if(!drawer) return; t.textContent=title; body.innerHTML=html; drawer.setAttribute('aria-hidden','false'); }
function renderHome(){ const f=$('#featuredCourses'); if(!f) return; f.innerHTML=courses.slice(0,4).map(c=>cardCourse(c)).join('');
  $$('.chip').forEach(ch=>ch.addEventListener('click',()=>{const kw=ch.dataset.filter.toLowerCase();
    const found=courses.filter(c=>c.title.toLowerCase().includes(kw)||c.code.toLowerCase().includes(kw));
    openDrawer(`نتائج "${ch.dataset.filter}"`, renderCourseTable(found)); }));
  const q=$('#globalSearch'); $('#searchBtn')?.addEventListener('click',()=>{const kw=(q.value||'').toLowerCase().trim();
    const foundC=courses.filter(c=>c.title.toLowerCase().includes(kw)||c.code.toLowerCase().includes(kw));
    const foundI=instructors.filter(i=>i.name.toLowerCase().includes(kw)||i.expertise.join(' ').toLowerCase().includes(kw));
    openDrawer('البحث العام', `<h3>المقررات</h3>${renderCourseTable(foundC)}<h3>المدرّسون</h3>${renderInstructorTable(foundI)}`); });}
function renderDepartments(){ const list=$('#departmentsList'),sel=$('#deptFilter'); if(!list||!sel) return;
  faculties.forEach(f=>{const o=document.createElement('option'); o.value=f.id; o.textContent=f.name; sel.appendChild(o);});
  function paint(){ const filter=sel.value; const arr=filter?departments.filter(d=>d.facultyId===filter):departments;
    list.innerHTML=arr.map(d=>cardDepartment(d)).join(''); $$('.card[data-dept-id]').forEach(card=>{
      card.addEventListener('click',()=>{const d=departments.find(x=>x.id===card.getAttribute('data-dept-id'));
        openDrawer(d.name, `<p><strong>التخصصات:</strong> ${d.majors.join(', ')}</p><p>${d.summary}</p><h4>مقررات القسم</h4>${renderCourseTable(courses.filter(c=>c.departmentId===d.id))}`);
      });}); } sel.addEventListener('change',paint); paint(); }
function renderCourses(){ const list=$('#coursesList'); if(!list) return; const q=$('#courseSearch'),deptSel=$('#deptSelect'),credSel=$('#creditSelect'),sortSel=$('#sortSelect');
  if(deptSel&&deptSel.options.length===1){departments.forEach(d=>{const o=document.createElement('option'); o.value=d.id; o.textContent=d.name; deptSel.appendChild(o);});}
  function apply(){ const kw=(q.value||'').toLowerCase().trim(); const dpt=deptSel.value,cre=credSel.value,sortBy=sortSel.value;
    let arr=courses.filter(c=>{const kwM=!kw||c.title.toLowerCase().includes(kw)||c.code.toLowerCase().includes(kw); const dM=!dpt||c.departmentId===dpt; const cM=!cre||String(c.credits)===cre; return kwM&&dM&&cM;});
    arr.sort((a,b)=>{if(sortBy==='title')return a.title.localeCompare(b.title,'ar'); if(sortBy==='credits')return a.credits-b.credits; return a.code.localeCompare(b.code);});
    list.innerHTML=arr.map(c=>cardCourse(c)).join(''); $$('.btn-details',list).forEach(btn=>btn.addEventListener('click',()=>{
      const c=courseMap[btn.getAttribute('data-code')]; const prereq=c.prereq.length?c.prereq.map(p=>`<code>${p}</code>`).join(', '):'لا يوجد'; const d=deptMap[c.departmentId];
      openDrawer(`${c.code} — ${c.title}`, `<p><strong>القسم:</strong> ${d?.name||''}</p><p><strong>الساعات:</strong> ${c.credits}</p><p><strong>المتطلبات:</strong> ${prereq}</p>`);}));
    $$('.btn-bookmark',list).forEach(btn=>btn.addEventListener('click',()=>toggleBookmark(btn.getAttribute('data-code')))); }
  [q,deptSel,credSel,sortSel].forEach(el=>el&&el.addEventListener('input',apply)); apply(); }
function renderInstructors(){ const list=$('#instructorsList'),q=$('#instructorSearch'),exSel=$('#expertiseSelect'); if(!list) return;
  const exSet=new Set(instructors.flatMap(i=>i.expertise)); if(exSel&&exSel.options.length===1){Array.from(exSet).sort((a,b)=>a.localeCompare(b,'ar')).forEach(x=>{const o=document.createElement('option'); o.value=x; o.textContent=x; exSel.appendChild(o);});}
  function apply(){ const kw=(q.value||'').toLowerCase().trim(),ex=exSel.value; const arr=instructors.filter(i=>{const kwM=!kw||i.name.toLowerCase().includes(kw)||i.expertise.join(' ').toLowerCase().includes(kw); const exM=!ex||i.expertise.includes(ex); return kwM&&exM;});
    list.innerHTML=arr.map(i=>cardInstructor(i)).join(''); } [q,exSel].forEach(el=>el&&el.addEventListener('input',apply)); apply(); }
function cardCourse(c){ const bm=new Set(getBookmarks()); const marked=bm.has(c.code);
  return `<article class="card" role="listitem"><h4>${c.code} — ${c.title}</h4><p class="meta">الساعات: ${c.credits} • القسم: ${deptMap[c.departmentId]?.name||''}</p>
    <div class="actions"><button class="btn btn-details" data-code="${c.code}">التفاصيل</button><button class="btn btn-bookmark" data-code="${c.code}" aria-pressed="${marked}">${marked?'★ مفضّل':'☆ أضف للمفضلة'}</button></div></article>`; }
function cardDepartment(d){ return `<article class="card" role="listitem" data-dept-id="${d.id}" tabindex="0"><h4>${d.name}</h4><p class="meta">${faculties.find(f=>f.id===d.facultyId)?.name||''}</p><p>${d.summary}</p><p><strong>التخصصات:</strong> ${d.majors.join(', ')}</p></article>`; }
function cardInstructor(i){ return `<article class="card" role="listitem"><h4>${i.name}</h4><p class="meta">القسم: ${deptMap[i.departmentId]?.name||''}</p><p>الخبرات: ${i.expertise.join(', ')}</p></article>`; }
function renderCourseTable(arr){ if(!arr.length) return '<p>لا توجد نتائج.</p>'; return `<div class="table-scroll"><table><thead><tr><th>الكود</th><th>العنوان</th><th>الساعات</th><th>القسم</th></tr></thead><tbody>${arr.map(c=>`<tr><td>${c.code}</td><td>${c.title}</td><td>${c.credits}</td><td>${deptMap[c.departmentId]?.name||''}</td></tr>`).join('')}</tbody></table></div>`; }
function renderInstructorTable(arr){ if(!arr.length) return '<p>لا توجد نتائج.</p>'; return `<div class="table-scroll"><table><thead><tr><th>الاسم</th><th>القسم</th><th>الخبرات</th></tr></thead><tbody>${arr.map(i=>`<tr><td>${i.name}</td><td>${deptMap[i.departmentId]?.name||''}</td><td>${i.expertise.join(', ')}</td></tr>`).join('')}</tbody></table></div>`; }
const page=window.__PAGE__; if(page==='home')renderHome(); if(page==='departments')renderDepartments(); if(page==='courses')renderCourses(); if(page==='instructors')renderInstructors();
