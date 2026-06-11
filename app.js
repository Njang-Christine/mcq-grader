// Simple CSV parser
function parseCSV(text){
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  return lines.map(line=>line.split(',').map(s=>s.trim()));
}

function loadFileInput(id){
  return new Promise(resolve=>{
    const inp = document.getElementById(id);
    inp.addEventListener('change', async ()=>{
      const file = inp.files[0];
      if(!file) return resolve(null);
      const text = await file.text();
      resolve({name:file.name, text});
    }, {once:true});
  });
}

async function readFileIfSelected(id){
  const inp = document.getElementById(id);
  const file = inp.files[0];
  if(!file) return null;
  return {name:file.name, text: await file.text()};
}

function buildAnswerKeyFromCSV(rows){
  const key = {};
  rows.forEach(r=>{
    if(r.length>=2){
      const q = r[0];
      const a = r[1].toUpperCase();
      key[q] = a;
    }
  });
  return key;
}

function buildSubmissionsFromCSV(rows){
  // accept headerless or with header
  const submissions = [];
  for(const r of rows){
    if(r.length<2) continue;
    const id = r[0];
    const answers = r.slice(1).map(x=>x.toUpperCase());
    submissions.push({id, answers});
  }
  return submissions;
}

function grade(submissions, key){
  const keys = Object.keys(key).sort((a,b)=>Number(a)-Number(b));
  const results = submissions.map(s=>{
    let correct=0;
    const per = [];
    for(let i=0;i<keys.length;i++){
      const q = keys[i];
      const ans = s.answers[i]||"";
      const expected = key[q]||"";
      const ok = ans===expected;
      if(ok) correct++;
      per.push({q, ans, expected, ok});
    }
    const score = Math.round((correct/keys.length)*100);
    return {...s, correct, total:keys.length, score, per};
  });
  return {results, keys};
}

function renderResults(grading){
  const sum = document.getElementById('summary');
  const table = document.getElementById('reportTable');
  table.innerHTML='';
  sum.innerHTML = `<strong>Graded:</strong> ${grading.results.length} submissions · <strong>Questions:</strong> ${grading.keys.length}`;
  // header
  const thead = document.createElement('thead');
  const hrow = document.createElement('tr');
  hrow.innerHTML = `<th>Student</th><th>Score</th><th>Correct</th><th>Details</th>`;
  thead.appendChild(hrow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  for(const r of grading.results){
    const tr = document.createElement('tr');
    const details = r.per.map(p=>`${p.q}: <span style="color:${p.ok?"var(--accent-2)":"#ff6b6b"}">${p.ans||'–'}</span>(${p.expected})`).join('<br>');
    tr.innerHTML = `<td>${r.id}</td><td>${r.score}%</td><td>${r.correct}/${r.total}</td><td>${details}</td>`;
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

function generateCSVReport(grading){
  const rows = [];
  const header = ['student_id','score','correct','total'];
  for(const k of grading.keys){ header.push('Q'+k); }
  rows.push(header.join(','));
  for(const r of grading.results){
    const row = [r.id, r.score, r.correct, r.total, ...r.per.map(p=>p.ans)];
    rows.push(row.join(','));
  }
  return rows.join('\n');
}

function downloadFile(filename, text){
  const a = document.getElementById('downloadReport');
  const blob = new Blob([text], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.classList.remove('hidden');
}

async function handleGrade(){
  const keyFile = await readFileIfSelected('keyFile');
  const subsFile = await readFileIfSelected('subsFile');
  if(!keyFile || !subsFile){
    alert('Please select both an answer key and a submissions file.');
    return;
  }
  let key = {};
  if(keyFile.name.endsWith('.json')){
    try{ key = JSON.parse(keyFile.text); }catch(e){alert('Invalid JSON key');return}
  } else {
    const rows = parseCSV(keyFile.text);
    key = buildAnswerKeyFromCSV(rows);
  }
  const srows = parseCSV(subsFile.text);
  const submissions = buildSubmissionsFromCSV(srows);
  const grading = grade(submissions, key);
  renderResults(grading);
  const csv = generateCSVReport(grading);
  downloadFile('mcq_report.csv', csv);
  return grading;
}

document.getElementById('gradeBtn').addEventListener('click', handleGrade);

// Optional: load demo data if available via fetch (for live preview)

// Step-by-step navigation
const steps = Array.from(document.querySelectorAll('.step'));
const indicators = Array.from(document.querySelectorAll('.step-ind'));
let currentStep = 0;

function showStep(i){
  if(i<0) i=0;
  if(i>=steps.length) i=steps.length-1;
  steps.forEach((s,idx)=> s.classList.toggle('active', idx===i));
  indicators.forEach((ind,idx)=> ind.classList.toggle('active', idx===i));
  currentStep = i;
  document.getElementById('prevBtn').classList.toggle('hidden', currentStep===0);
  const nextBtn = document.getElementById('nextBtn');
  if(currentStep === steps.length-1){
    nextBtn.classList.add('hidden');
  } else if(currentStep === steps.length-2){
    nextBtn.textContent = 'View Results';
  } else {
    nextBtn.textContent = 'Next';
  }
}

document.getElementById('prevBtn').addEventListener('click', ()=> showStep(currentStep-1));
document.getElementById('nextBtn').addEventListener('click', async ()=>{
  // If currently on the grading step (3rd visible step index 2), perform grading then advance
  if(steps[currentStep].dataset.step && Number(steps[currentStep].dataset.step)===3){
    await handleGrade();
    showStep(currentStep+1);
    return;
  }
  showStep(currentStep+1);
});

// initialize
showStep(0);
