// Matrix rain effect
const canvas = document.getElementById('matrixRain');
const ctx = canvas.getContext('2d');
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
const awsTerms=['Lambda','S3','API Gateway','DynamoDB','CloudFront','Route 53','GitHub Actions','Terraform'];
let fontSize=16;
let columns=Math.floor(canvas.width/fontSize);
let drops=Array(columns).fill(1);
let terminalMode='professional';
function drawMatrixRain(){
  ctx.fillStyle='rgba(0,0,0,0.25)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.font=fontSize+'px monospace';
  const gradient=ctx.createLinearGradient(0,0,0,canvas.height);
  if(terminalMode==='joker'){
    gradient.addColorStop(0,'#00ffff');
    gradient.addColorStop(0.5,'#ff00ff');
    gradient.addColorStop(1,'#00ff66');
  }else{
    gradient.addColorStop(0,'#00c3ff');
    gradient.addColorStop(1,'#001b44');
  }
  ctx.fillStyle=gradient;
  for(let i=0;i<drops.length;i++){
    const text=awsTerms[Math.floor(Math.random()*awsTerms.length)];
    ctx.globalAlpha=terminalMode==='joker'?0.9+Math.random()*0.1:0.7+Math.random()*0.2;
    ctx.fillText(text,i*fontSize,drops[i]*fontSize);
    ctx.globalAlpha=1.0;
    if(drops[i]*fontSize>canvas.height && Math.random()>0.985){
      drops[i]=0;
    }
    drops[i]+=0.8+Math.random()*0.5;
  }
}
let frameDelay=80;
if(window.matchMedia('(max-width: 600px)').matches) frameDelay=150;
let matrixInterval=setInterval(drawMatrixRain,frameDelay);
function startMatrixRain(){
  clearInterval(matrixInterval);
  matrixInterval=setInterval(drawMatrixRain,frameDelay);
}
function activateJokerMode(){
  terminalMode='joker';
  fontSize=20;
  document.getElementById('matrixRain').style.opacity='0.3';
  frameDelay=40;
  columns=Math.floor(canvas.width/fontSize);
  drops=Array(columns).fill(1);
  startMatrixRain();
  terminalWrapper.classList.add('joker-active');
  const msg=document.createElement('div');
  msg.textContent='Wake up, Neo...';
  msg.style.color='#ff66ff';
  terminalContent.appendChild(msg);
  scrollToBottom();
}
function activateProfessionalMode(){
  terminalMode='professional';
  fontSize=16;
  document.getElementById('matrixRain').style.opacity='0.12';
  frameDelay=window.matchMedia('(max-width: 600px)').matches?150:80;
  columns=Math.floor(canvas.width/fontSize);
  drops=Array(columns).fill(1);
  startMatrixRain();
  terminalWrapper.classList.remove('joker-active');
  const msg=document.createElement('div');
  msg.textContent='Professional mode activated';
  msg.style.color='#33ff33';
  terminalContent.appendChild(msg);
  scrollToBottom();
}
window.addEventListener('resize',()=>{
  columns=Math.floor(canvas.width/fontSize);
  drops=Array(columns).fill(1);
});

// Terminal logic
const terminalContent=document.getElementById('terminal-content');
const terminalInput=document.getElementById('terminal-input');
const terminalWrapper=document.getElementById('terminal');
const terminalPrompt=document.getElementById('terminal-prompt');
const terminalSuggestion=document.getElementById('terminal-suggestion');
function scrollToBottom(){
  terminalWrapper.scrollTo({top:terminalWrapper.scrollHeight,behavior:'smooth'});
}
const startupMsg=document.createElement('div');
startupMsg.style.whiteSpace='pre-line';
startupMsg.style.color='#b2eaff';
startupMsg.textContent='Connecting to josephaleto.io...\nIdentity confirmed.\nType "help" to begin.';
terminalContent.appendChild(startupMsg);
scrollToBottom();
const API_URL='https://4wmuu5rp71.execute-api.us-east-1.amazonaws.com/';
const commandList=['help','aws s3 ls','view counter','terraform apply','motd','whoami','bio','resume','linkedin','github','email','projects','projects cloud-terminal','projects cloud-resume','projects terraform','stack','architecture','quote','offer','clear','exit','source code','joker mode','professional mode','story','whyhire','status','view classic','random'];
const openCommands={
  'resume':'https://josephaletoresume.s3.amazonaws.com/joseph-leto-soultions-architect.pdf',
  'linkedin':'https://www.linkedin.com/in/joseph-leto/',
  'github':'https://github.com/serversorcerer',
  'email':'mailto:joe@josephaleto.io',
  'source code':'https://github.com/serversorcerer/cloud-resume-challenge',
  'view classic':'classic.html'
};
async function executeCommand(cmd){
  try{
    const res=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command:cmd})});
    return await res.text();
  }catch(e){
    console.error(e);return 'Error processing command';
  }
}
let commandHistory=[];let historyIndex=-1;let offerState=null;let offerName='';
let terminalExpanded=false;
terminalInput.addEventListener('keydown',e=>{
  if(!terminalExpanded){
    terminalExpanded=true;terminalWrapper.classList.remove('collapsed');terminalWrapper.style.maxHeight='60vh';terminalWrapper.style.height='60vh';setTimeout(scrollToBottom,200);
  }
},{once:true});
terminalInput.addEventListener('input',()=>{
  const val=terminalInput.value.trim().toLowerCase();
  if(!val){terminalSuggestion.style.display='none';return;}
  let matches=commandList.filter(c=>c.startsWith(val));
  if(!matches.length) matches=commandList.filter(c=>c.includes(val));
  if(matches.length && matches[0].toLowerCase()!==val){
    terminalSuggestion.style.display='block';terminalSuggestion.textContent=matches[0];
  }else{terminalSuggestion.style.display='none';}
});
terminalInput.addEventListener('keydown',e=>{
  if(e.key==='Tab'){
    e.preventDefault();
    const val=terminalInput.value.trim().toLowerCase();
    let matches=commandList.filter(c=>c.startsWith(val));
    if(!matches.length) matches=commandList.filter(c=>c.includes(val));
    if(matches.length){terminalInput.value=matches[0];terminalSuggestion.style.display='none';}
  }
});
terminalInput.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp' || e.key==='ArrowDown'){
    if(!commandHistory.length) return;
    if(e.key==='ArrowUp') historyIndex=(historyIndex<=0)?commandHistory.length-1:historyIndex-1; else historyIndex=(historyIndex>=commandHistory.length-1)?0:historyIndex+1;
    terminalInput.value=commandHistory[historyIndex];
    const val=terminalInput.value.trim().toLowerCase();
    let matches=commandList.filter(c=>c.startsWith(val));
    if(!matches.length) matches=commandList.filter(c=>c.includes(val));
    if(matches.length && matches[0].toLowerCase()!==val){terminalSuggestion.style.display='block';terminalSuggestion.textContent=matches[0];}else{terminalSuggestion.style.display='none';}
    e.preventDefault();
  }
});
terminalInput.addEventListener('keydown',async e=>{
  if(e.key==='Enter'){
    const input=terminalInput.value.trim();
    if(!input) return;
    commandHistory.push(input);historyIndex=commandHistory.length;
    const out=document.createElement('div');
    out.innerHTML=`<span style="color:#00ffff;">$</span> <span style="color:#e0f7ff;">${input}</span>`;
    terminalContent.appendChild(out);
    terminalSuggestion.style.display='none';
    const cmdLower=input.toLowerCase();
    if(offerState){
      if(cmdLower==='clear' || cmdLower==='exit'){
        offerState=null;offerName='';
        const resp=await executeCommand(cmdLower);
        if(resp==='__CLEAR__'){terminalContent.classList.add('terminal-fade');setTimeout(()=>{terminalContent.innerHTML='';terminalContent.classList.remove('terminal-fade');},500);}else{const r=document.createElement('div');r.innerHTML=`<span style="color:#33ff33;">${resp}</span>`;terminalContent.appendChild(r);}terminalInput.value='';scrollToBottom();return;
      }
      if(offerState==='name'){
        offerName=input;offerState='email';const p=document.createElement('div');p.textContent='Enter your email:';p.style.color='#33ff33';terminalContent.appendChild(p);terminalInput.value='';scrollToBottom();return;
      }else if(offerState==='email'){
        const email=input;const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);if(!valid){const err=document.createElement('div');err.textContent='Invalid email. Try again:';err.style.color='#ff6666';terminalContent.appendChild(err);terminalInput.value='';scrollToBottom();return;}
        offerState=null;
        try{const res=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command:'offer',name:offerName,email})});const text=await res.text();const msg=document.createElement('div');msg.textContent=res.ok?'✅ Offer sent!':text;msg.style.color='#33ff33';terminalContent.appendChild(msg);}catch(err){const errDiv=document.createElement('div');errDiv.textContent='Error sending offer';errDiv.style.color='#ff6666';terminalContent.appendChild(errDiv);}terminalInput.value='';scrollToBottom();return;
      }
    }
    if(cmdLower==='offer'){
      offerState='name';offerName='';const p=document.createElement('div');p.textContent='Enter your name:';p.style.color='#33ff33';terminalContent.appendChild(p);terminalInput.value='';scrollToBottom();return;
    }
    if(openCommands[cmdLower]){
      const url=openCommands[cmdLower];window.open(url,'_blank');const r=document.createElement('div');r.textContent=`Opening ${cmdLower}...`;r.style.color='#33ff33';terminalContent.appendChild(r);terminalInput.value='';scrollToBottom();return;
    }
    if(cmdLower==='view counter'){
      const count=document.querySelector('.counter-number')?.textContent.trim()||'Unknown';const r=document.createElement('div');r.textContent=`Total views: ${count}`;r.style.color='#33ff33';terminalContent.appendChild(r);terminalInput.value='';scrollToBottom();return;
    }
    if(cmdLower==='joker mode'){activateJokerMode();terminalInput.value='';return;}
    if(cmdLower==='professional mode'){activateProfessionalMode();terminalInput.value='';return;}
    const resp=await executeCommand(input);
    if(resp==='__CLEAR__'){terminalContent.classList.add('terminal-fade');setTimeout(()=>{terminalContent.innerHTML='';terminalContent.classList.remove('terminal-fade');},500);}else{const response=document.createElement('div');response.innerHTML=resp.includes('<img')?resp:`<span style="color:#33ff33;">${resp}</span>`;setTimeout(()=>{[...response.querySelectorAll('a')].forEach(a=>{a.target='_blank';a.style.color='#00ffff';a.style.textShadow='0 0 6px #00eaff,0 0 10px #00ffff';});},0);terminalContent.appendChild(response);}
    terminalInput.value='';scrollToBottom();
  }
});
terminalInput.addEventListener('focus',scrollToBottom);
terminalWrapper.addEventListener('click',e=>{if(e.target!==terminalInput)terminalInput.focus();});
terminalContent.style.fontFamily='monospace';
terminalInput.style.fontFamily='monospace';
window.onload=function(){const rect=terminalWrapper.getBoundingClientRect();if(rect.top>window.innerHeight||rect.bottom<0){terminalWrapper.scrollIntoView({behavior:'smooth'});}};
const style=document.createElement('style');style.innerHTML=`#terminal::-webkit-scrollbar-thumb{background:linear-gradient(90deg,#00ffff 30%,#00bfff 100%);box-shadow:0 0 8px #00eaff,0 0 16px #00ffff;border-radius:6px;}#terminal::-webkit-scrollbar-track{background:#0a0a0a;}#terminal::-webkit-scrollbar{width:10px;}`;document.head.appendChild(style);
