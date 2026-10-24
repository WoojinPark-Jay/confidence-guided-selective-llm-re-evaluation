(() => {
  'use strict';
  const {samples:tinySamples,simulatedSamples,metrics}=window.calibration;
  const slider=document.getElementById('temperature'),sampleSelect=document.getElementById('sample');
  const sizeSelect=document.getElementById('sample-size'),binSelect=document.getElementById('bin-count'),modeSelect=document.getElementById('bin-mode');
  const names=['Depression','Neutral','Happy'];
  const simulated=simulatedSamples();
  let samples,baseline,sweep,optimum;
  let timer=null;
  const pct=value=>(value*100).toFixed(1)+'%';
  const set=(id,text)=>{const element=document.getElementById(id);if(element.textContent!==text)element.textContent=text;};
  const calculate=t=>metrics(samples,t,Number(binSelect.value),modeSelect.value);
  function prepare(){
    stop();
    samples=sizeSelect.value==='12'?tinySamples:simulated.slice(0,Number(sizeSelect.value));
    binSelect.querySelector('option[value="15"]').disabled=samples.length<15;
    if(Number(binSelect.value)>samples.length)binSelect.value='5';
    baseline=calculate(1);
    sweep=Array.from({length:251},(_,i)=>{const t=.5+i/100,m=calculate(t);return {t,nll:m.nll,brier:m.brier,ece:m.ece};});
    optimum=sweep.reduce((best,row)=>row.nll<best.nll?row:best);
    const correct=baseline.rows.map((r,i)=>({...r,i})).filter(r=>r.hit).sort((a,b)=>b.confidence-a.confidence);
    const wrong=baseline.rows.map((r,i)=>({...r,i})).filter(r=>!r.hit).sort((a,b)=>b.confidence-a.confidence);
    sampleSelect.replaceChildren();
    [[wrong[0],'Most confident error'],[correct[0],'Most confident correct'],[correct[correct.length-1],'Least confident correct']].forEach(([row,label])=>{
      if(!row)return;const option=document.createElement('option');option.value=row.i;option.textContent=label+' / #'+(row.i+1);sampleSelect.append(option);
    });
    set('data-description',samples.length===12?'12 hand-crafted examples: useful for inspecting individual losses, too sparse for a stable calibration estimate.':'Fixed-seed simulated predictions: '+samples.length+' examples. The 60-example set is the first 60 of the same 600 draws, not a separately selected sample. More examples improve occupancy, not real-world validity.');
    set('fit-summary','Compare 251 temperatures from 0.50 to 3.00 in steps of 0.01 on these same '+samples.length+' examples. The grid minimum is T = '+optimum.t.toFixed(2)+', NLL = '+optimum.nll.toFixed(3)+'. This is an in-sample demonstration, not held-out evidence.');
    const tbody=document.getElementById('fit-rows');tbody.replaceChildren();
    [['Sharper',.5],['Original',1],['Grid NLL minimum',optimum.t],['Softer',3]].forEach(([name,t])=>{
      const m=calculate(t),tr=document.createElement('tr');
      [name,t.toFixed(2),m.nll.toFixed(3),m.brier.toFixed(3),pct(m.ece)].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});tbody.append(tr);
    });
    render();
  }
  function curve(key,t,value){
    const max=Math.max(...sweep.map(r=>r[key]))*1.12;
    const x=t=>28+(t-.5)/2.5*226,y=v=>72-v/max*60;
    const points=sweep.map(r=>x(r.t)+','+y(r[key])).join(' ');
    document.getElementById(key+'-curve').innerHTML=`<line x1="28" y1="72" x2="254" y2="72" class="axis"/><line x1="${x(1)}" y1="8" x2="${x(1)}" y2="72" class="reference"/><polyline points="${points}" class="metric-line"/>${key==='nll'?`<circle cx="${x(optimum.t)}" cy="${y(optimum.nll)}" r="6" class="minimum-dot"><title>Grid minimum T=${optimum.t.toFixed(2)}</title></circle>`:''}<circle cx="${x(t)}" cy="${y(value)}" r="4" class="metric-dot"/><text x="28" y="94">0.5</text><text x="254" y="94" text-anchor="end">3.0 T</text><text x="23" y="75" text-anchor="end">0</text><text x="28" y="8">${key==='ece'?pct(max):max.toFixed(2)}</text>`;
  }
  function reliability(bins){
    const x=v=>48+v*320,y=v=>270-v*238;
    let svg='';
    for(const tick of [0,.2,.4,.6,.8,1]) svg+=`<line x1="48" y1="${y(tick)}" x2="368" y2="${y(tick)}" class="gridline"/><text x="39" y="${y(tick)+4}" text-anchor="end">${Math.round(tick*100)}</text><text x="${x(tick)}" y="290" text-anchor="middle">${Math.round(tick*100)}</text>`;
    svg+='<line x1="48" y1="270" x2="368" y2="32" class="reference"/><text x="208" y="315" text-anchor="middle">Mean confidence (%)</text><text transform="translate(13 150) rotate(-90)" text-anchor="middle">Observed accuracy (%)</text>';
    bins.filter(b=>b.n).forEach(b=>{svg+=`<line x1="${x(b.confidence)}" y1="${y(b.confidence)}" x2="${x(b.confidence)}" y2="${y(b.accuracy)}" class="gap-line"/><circle cx="${x(b.confidence)}" cy="${y(b.accuracy)}" r="5" class="metric-dot"><title>${b.n} samples: confidence ${pct(b.confidence)}, accuracy ${pct(b.accuracy)}</title></circle>`;});
    document.getElementById('reliability').innerHTML=svg;
  }
  function render(){
    const t=Number(slider.value),m=calculate(t),index=Number(sampleSelect.value),row=m.rows[index];
    set('temperature-value',t.toFixed(2));
    set('accuracy-note','Accuracy: '+pct(m.accuracy)+' at every T ('+m.rows.reduce((n,r)=>n+r.hit,0)+' / '+samples.length+' correct).');
    set('ece-title',modeSelect.value==='mass'?'Adaptive ECE':'ECE');
    const occupied=m.bins.filter(b=>b.n),smallest=Math.min(...occupied.map(b=>b.n));
    set('occupancy-note',occupied.length+' / '+m.bins.length+' bins occupied; smallest nonempty bin: '+smallest+' examples. '+(smallest<10?'Sparse bins: one changed outcome can strongly affect their accuracy.':'Bin size alone does not establish reliability or generalization.'));
    set('state-explanation',Math.abs(t-optimum.t)<.005?'Lowest NLL on the displayed grid. Brier and ECE need not be minimal here.':t<1?'Sharper than the original probabilities: confident mistakes receive larger NLL penalties.':t===1?'Original model scores, before temperature scaling. The dashed lines mark this reference.':'Softer than the original probabilities: wrong-class confidence falls, but correct predictions also lose confidence.');
    document.querySelectorAll('input[name="temperature-state"]').forEach(input=>{const value=input.value==='fit'?optimum.t:Number(input.value);input.checked=Math.abs(t-value)<.005;});
    for(const key of ['nll','brier','ece']){
      set(key+'-value',key==='ece'?pct(m[key]):m[key].toFixed(3));
      const difference=m[key]-baseline[key];
      set(key+'-change',(difference>=0?'+':'')+(key==='ece'?(difference*100).toFixed(1)+' pp':difference.toFixed(3))+' vs. T = 1');
      curve(key,t,m[key]);
    }
    set('logit-values','Logits: ['+row.z.map(v=>v.toFixed(2)).join(', ')+'] | Prediction: '+names[row.prediction]);
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
      [modeSelect.value==='mass'?'Group '+(i+1)+(b.n?' ('+pct(b.lower)+'–'+pct(b.upper)+')':''):(b.lower*100).toFixed(1)+'–'+(b.upper*100).toFixed(1)+'%'+(i===m.bins.length-1?' (inclusive)':''),b.n,b.n?pct(b.confidence):'—',b.n?pct(b.accuracy):'—',pct(b.contribution)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});tbody.append(tr);
    });
    set('bin-definition',modeSelect.value==='mass'?'Sort by maximum confidence, then partition into nearly equal-sized groups. Boundaries are the observed minimum and maximum in each group, not fixed intervals. Ties are split in input order. This is top-label adaptive ECE, not all-class ACE.':'Fixed-width bins are left-closed and right-open; the final bin includes 1. Empty bins contribute zero. ECE is the sum of weighted absolute gaps.');
  }
  function stop(){if(timer!==null)clearInterval(timer);timer=null;document.getElementById('animate').innerHTML='&#9654;';document.getElementById('animate').setAttribute('aria-label','Animate temperature');document.getElementById('animate').title='Animate temperature';}
  slider.addEventListener('input',()=>{stop();render();});sampleSelect.addEventListener('change',render);
  document.getElementById('reset').addEventListener('click',()=>{stop();slider.value='1';render();});
  [sizeSelect,binSelect,modeSelect].forEach(select=>select.addEventListener('change',prepare));
  document.querySelectorAll('input[name="temperature-state"]').forEach(input=>input.addEventListener('change',()=>{stop();slider.value=input.value==='fit'?optimum.t.toFixed(2):input.value;render();}));
  document.getElementById('animate').addEventListener('click',()=>{
    if(timer!==null){stop();return;}
    if(Number(slider.value)>=3)slider.value='.5';
    document.getElementById('animate').innerHTML='&#10074;&#10074;';document.getElementById('animate').setAttribute('aria-label','Pause animation');document.getElementById('animate').title='Pause animation';
    timer=setInterval(()=>{slider.value=Math.min(3,Number(slider.value)+.02).toFixed(2);render();if(Number(slider.value)>=3)stop();},80);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  prepare();
})();
