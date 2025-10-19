
// مفاتيح LocalStorage
const LSK_VISITS='luxP_visits';
const LSK_BOOKINGS='luxP_bookings'; // array
const LSK_DATE='luxP_last';
const fmt = n => Number(n||0).toLocaleString('ar-EG');

export function bootCounters(){
  const v = Number(localStorage.getItem(LSK_VISITS)||0)+1;
  localStorage.setItem(LSK_VISITS, String(v));
  const elV = document.querySelector('[data-kpi=visits] b');
  if (elV) elV.textContent = fmt(v);
  const arr = JSON.parse(localStorage.getItem(LSK_BOOKINGS)||'[]');
  const elB = document.querySelector('[data-kpi=bookings] b');
  if (elB) elB.textContent = fmt(arr.length);
  // Scroll reveal
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('reveal')), {threshold:.2});
  document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));
}

export function submitBooking(form){
  const data = Object.fromEntries(new FormData(form).entries());
  if(!data.name || !data.phone || !data.room || !data.checkin || !data.checkout) { alert('الرجاء تعبئة جميع الحقول'); return; }
  if (new Date(data.checkout) <= new Date(data.checkin)){ alert('تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول'); return; }
  const arr = JSON.parse(localStorage.getItem(LSK_BOOKINGS)||'[]');
  data.id = 'BK' + String(Date.now()).slice(-6);
  arr.push(data);
  localStorage.setItem(LSK_BOOKINGS, JSON.stringify(arr));
  localStorage.setItem(LSK_DATE, new Date().toISOString());
  alert('تم الحجز ✔\nرقم الحجز: ' + data.id);
  form.reset();
  const elB = document.querySelector('[data-kpi=bookings] b');
  if (elB) elB.textContent = fmt(arr.length);
}

export function loadAdmin(){
  const arr = JSON.parse(localStorage.getItem(LSK_BOOKINGS)||'[]');
  const tbody = document.querySelector('#adminRows'); if (!tbody) return;
  tbody.innerHTML = arr.map(b => `
    <tr>
      <td>${b.id}</td><td>${b.name}</td><td>${b.phone}</td><td>${b.room}</td><td>${b.checkin}</td><td>${b.checkout}</td>
    </tr>`).join('');
  document.querySelector('[data-kpi=bookings] b').textContent = fmt(arr.length);
  document.querySelector('[data-kpi=visits] b').textContent = fmt(localStorage.getItem(LSK_VISITS)||0);
  const d = localStorage.getItem(LSK_DATE);
  if (d) document.getElementById('lastUpd').textContent = new Date(d).toLocaleString('ar-EG');

  // Chart
  const ctx = document.getElementById('bookChart');
  if(ctx && window.Chart){
    const days = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
    const counts = new Array(7).fill(0);
    // وزّع الحجوزات على أيام الأسبوع وفق تواريخ الوصول
    arr.forEach(b=>{ const i=new Date(b.checkin).getDay(); counts[i]=(counts[i]||0)+1; });
    new Chart(ctx, {
      type:'bar',
      data:{ labels:days, datasets:[{ label:'الحجوزات/أسبوع', data:counts }] },
      options:{ plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true } } }
    });
  }

  document.querySelector('#exportBtn').addEventListener('click', ()=>{
    const csv = 'id,name,phone,room,checkin,checkout\n' + arr.map(b=>[b.id,b.name,b.phone,b.room,b.checkin,b.checkout].join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='bookings.csv'; a.click();
  });
  document.querySelector('#clearBtn').addEventListener('click', ()=>{
    if(confirm('مسح كل الحجوزات؟')){ localStorage.setItem(LSK_BOOKINGS, '[]'); location.reload(); }
  });
}

export function initSlider(){
  const imgs = ['hero1.jpg','hero2.jpg','hero3.jpg'];
  const el = document.querySelector('#galleryImg');
  const dots = Array.from(document.querySelectorAll('.dot'));
  let idx = 0;
  function paint(){ el.src = imgs[idx]; dots.forEach((d,i)=> d.classList.toggle('active', i===idx)); }
  paint();
  setInterval(()=>{ idx=(idx+1)%imgs.length; paint(); }, 3400);
}

export function wireBooking(){
  const form = document.querySelector('#bookingForm'); if(!form) return;
  form.addEventListener('submit', (e)=>{ e.preventDefault(); submitBooking(form); });
}
