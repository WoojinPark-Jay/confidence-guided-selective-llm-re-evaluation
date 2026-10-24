(() => {
  'use strict';
  const {samples,metrics}=window.calibration;
  const slider=document.getElementById('temperature'),sampleSelect=document.getElementById('sample');
  const names=['Depression','Neutral','Happy'];
  const baseline=metrics(samples,1);
  const sweep=Array.from({length:251},(_,i)=>({t:.5+i/100,...metrics(samples,.5+i/100)}));
  const optimum=sweep.reduce((best,row)=>row.nll<best.nll?row:best);
  let timer=null;
  const pct=value=>(value*100).toFixed(1)+'%';
  const set=(id,text)=>{document.getElementById(id).textContent=text;};
  samples.forEach((sample,i)=>{const option=document.createElement('option');option.value=i;option.textContent=(i+1)+' / reference: '+names[sample.y];sampleSelect.append(option);});
  function curve(key,t,value){
    const max=Math.max(...sweep.map(r=>r[key]))*1.12;
    const x=t=>28+(t-.5)/2.5*226,y=v=>72-v/max*60;
    const points=sweep.map(r=>x(r.t)+','+y(r[key])).join(' ');
    document.getElementById(key+'-curve').innerHTML=`<line x1="28" y1="72" x2="254" y2="72" class="axis"/><line x1="${x(1)}" y1="8" x2="${x(1)}" y2="72" class="reference"/><polyline points="${points}" class="metric-line"/><circle cx="${x(t)}" cy="${y(value)}" r="4" class="metric-dot"/><text x="28" y="94">0.5</text><text x="254" y="94" text-anchor="end">3.0 T</text><text x="23" y="75" text-anchor="end">0</text>`;
  }
  function reliability(bins){
    const x=v=>48+v*320,y=v=>270-v*238;
    let svg='';
    for(const tick of [0,.2,.4,.6,.8,1]) svg+=`<line x1="48" y1="${y(tick)}" x2="368" y2="${y(tick)}" class="gridline"/><text x="39" y="${y(tick)+4}" text-anchor="end">${Math.round(tick*100)}</text><text x="${x(tick)}" y="290" text-anchor="middle">${Math.round(tick*100)}</text>`;
    svg+='<line x1="48" y1="270" x2="368" y2="32" class="reference"/><text x="208" y="315" text-anchor="middle">Mean confidence (%)</text><text transform="translate(13 150) rotate(-90)" text-anchor="middle">Observed accuracy (%)</text>';
    bins.filter(b=>b.n).forEach(b=>{svg+=`<line x1="${x(b.confidence)}" y1="${y(b.confidence)}" x2="${x(b.confidence)}" y2="${y(b.accuracy)}" class="gap-line"/><circle cx="${x(b.confidence)}" cy="${y(b.accuracy)}" r="5" class="metric-dot"><title>${b.n} samples: confidence ${pct(b.confidence)}, accuracy ${pct(b.accuracy)}</title></circle><text x="${x(b.confidence)}" y="${y(b.accuracy)-10}" text-anchor="middle">n=${b.n}</text>`;});
    document.getElementById('reliability').innerHTML=svg;
  }
  function render(){
    const t=Number(slider.value),m=metrics(samples,t),index=Number(sampleSelect.value),row=m.rows[index];
    set('temperature-value',t.toFixed(2));
    set('accuracy-note','Accuracy: '+pct(m.accuracy)+' at every T (9 / 12 correct).');
    for(const key of ['nll','brier','ece']){
      set(key+'-value',key==='ece'?pct(m[key]):m[key].toFixed(3));
      const difference=m[key]-baseline[key];
      set(key+'-change',(difference>=0?'+':'')+(key==='ece'?(difference*100).toFixed(1)+' pp':difference.toFixed(3))+' vs. T = 1');
      curve(key,t,m[key]);
    }
    set('logit-values','Logits: ['+row.z.join(', ')+'] | Prediction: '+names[row.prediction]);
    const bars=document.getElementById('probability-bars');
    if(!bars.children.length) names.forEach((name,k)=>{
      const line=document.createElement('div');line.className='probability-row';
      const label=document.createElement('span');label.textContent=name;
      const track=document.createElement('div');track.className='probability-track';
      const bar=document.createElement('span');bar.className='probability-fill';track.append(bar);
      const value=document.createElement('span');line.append(label,track,value);bars.append(line);
    });
    [...bars.children].forEach((line,k)=>{
      line.classList.toggle('reference-class',k===row.y);
      line.firstChild.textContent=names[k]+(k===row.y?' (target)':'');
      line.querySelector('.probability-fill').style.width=(row.q[k]*100)+'%';
      line.lastChild.textContent=pct(row.q[k]);
    });
    set('sample-loss','This example: target probability '+pct(row.q[row.y])+'; NLL '+row.loss.toFixed(3)+'; Brier '+row.score.toFixed(3)+'.');
    reliability(m.bins);
    const tbody=document.getElementById('bin-rows');tbody.replaceChildren();
    m.bins.forEach((b,i)=>{
      const tr=document.createElement('tr');
      [Math.round(b.lower*100)+'–'+Math.round(b.upper*100)+'%'+(i===4?' (inclusive)':''),b.n,b.n?pct(b.confidence):'—',b.n?pct(b.accuracy):'—',pct(b.contribution)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});tbody.append(tr);
    });
  }
  function stop(){if(timer!==null)clearInterval(timer);timer=null;document.getElementById('animate').innerHTML='&#9654;';document.getElementById('animate').setAttribute('aria-label','Animate temperature');document.getElementById('animate').title='Animate temperature';}
  slider.addEventListener('input',()=>{stop();render();});sampleSelect.addEventListener('change',render);
  document.getElementById('reset').addEventListener('click',()=>{stop();slider.value='1';render();});
  document.getElementById('fit').addEventListener('click',()=>{stop();slider.value=optimum.t.toFixed(2);render();});
  document.getElementById('animate').addEventListener('click',()=>{
    if(timer!==null){stop();return;}
    if(Number(slider.value)>=3)slider.value='.5';
    document.getElementById('animate').innerHTML='&#10074;&#10074;';document.getElementById('animate').setAttribute('aria-label','Pause animation');document.getElementById('animate').title='Pause animation';
    timer=setInterval(()=>{slider.value=Math.min(3,Number(slider.value)+.02).toFixed(2);render();if(Number(slider.value)>=3)stop();},80);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  render();
})();
