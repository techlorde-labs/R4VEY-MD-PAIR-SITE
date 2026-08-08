const genBtn = document.getElementById('genBtn')
const pairCard = document.getElementById('pairCard')
let timerInterval

genBtn.onclick = async () => {
  const number = document.getElementById('number').value
  showToast('Generating code...', 'blue')
  const res = await fetch('/api/pair', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({number})})
  const data = await res.json()
  if(data.code){
    document.getElementById('code').innerText = data.code
    pairCard.classList.remove('hidden')
    startTimer(58)
    showToast('Pairing code generated', 'green')
  } else showToast(data.error, 'red')
}

function startTimer(s){
  clearInterval(timerInterval)
  document.getElementById('timer').innerText = s
  timerInterval = setInterval(()=>{ s--; document.getElementById('timer').innerText = s; if(s<=0) clearInterval(timerInterval) },1000)
}

async function updateStatus(){
  const res = await fetch('/api/status')
  const data = await res.json()
  document.getElementById('dash').innerHTML = `
    🟢 Connection: ${data.connection}<br>
    📱 Phone: ${data.phone}<br>
    🔐 Session: R4VEY-••••••••<br>
    ⏱ Uptime: ${Math.floor(data.uptime/3600)}h ${Math.floor(data.uptime%3600/60)}m<br>
    ⚡ Latency: ${data.latency} ms
  `
  document.getElementById('activityLog').innerHTML = data.activity.map(a=>`<div>● ${a.time}<br> ${a.msg}</div>`).join('')
}
setInterval(updateStatus, 2000)

function showToast(msg, color){
  const t = document.getElementById('toast')
  t.innerText = msg; t.style.borderLeftColor = color==='green'?'#00ff88':color==='red'?'#ff0055':'#00f5ff'
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000)
}

function copyCode(){ navigator.clipboard.writeText(document.getElementById('code').innerText); showToast('Code copied', 'green') }
function refreshCode(){ genBtn.click() }

const bgm = document.getElementById('bgm')
function toggleMusic(){ bgm.paused? bgm.play() : bgm.pause() }
