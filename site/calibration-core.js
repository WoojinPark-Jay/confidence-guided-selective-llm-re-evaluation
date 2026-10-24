(function (root) {
  'use strict';
  const samples = [
    {z:[4.2,1,.2],y:1}, {z:[3.4,.8,.1],y:0}, {z:[.2,3.8,.5],y:1},
    {z:[.1,.6,3.1],y:2}, {z:[2.8,.9,.3],y:2}, {z:[.2,2.6,.7],y:1},
    {z:[.4,.8,2.4],y:2}, {z:[2.2,1,.3],y:0}, {z:[.3,2.1,.9],y:0},
    {z:[.6,.9,1.8],y:2}, {z:[1.7,1,.4],y:0}, {z:[.5,1.6,1],y:1}
  ];
  function probabilities(z,t) {
    if (!(t>0) || !Number.isFinite(t)) throw new Error('Temperature must be positive and finite');
    const maximum=Math.max(...z);
    const e=z.map(x=>Math.exp((x-maximum)/t));
    const sum=e.reduce((a,b)=>a+b,0);
    return e.map(x=>x/sum);
  }
  function simulatedSamples(n=600,seed=20261024) {
    // Fixed-seed simulation: sample labels from softer probabilities, not a real model.
    let state=seed>>>0;
    const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
    return Array.from({length:n},()=>{
      const z=Array.from({length:3},()=>random()*5);
      const p=probabilities(z,1.8),u=random();
      const y=u<p[0]?0:u<p[0]+p[1]?1:2;
      return {z,y};
    });
  }
  function metrics(data,t,binCount=5,mode='width') {
    if (!data.length) throw new Error('Empty sample');
    if(!Number.isInteger(binCount)||binCount<1) throw new Error('Invalid bin count');
    if(!['width','mass'].includes(mode)) throw new Error('Invalid bin mode');
    const bins=Array.from({length:binCount},(_,i)=>({lower:i/binCount,upper:(i+1)/binCount,n:0,confidence:0,accuracy:0}));
    let nll=0,brier=0,correct=0;
    const rows=data.map(sample=>{
      const q=probabilities(sample.z,t),confidence=Math.max(...q),prediction=q.indexOf(confidence);
      const hit=Number(prediction===sample.y);
      const scaled=sample.z.map(v=>v/t),maximum=Math.max(...scaled);
      const loss=maximum+Math.log(scaled.reduce((s,v)=>s+Math.exp(v-maximum),0))-scaled[sample.y];
      const score=q.reduce((sum,p,k)=>sum+(p-Number(k===sample.y))**2,0);
      nll+=loss;brier+=score;correct+=hit;
      return {...sample,q,confidence,prediction,hit,loss,score};
    });
    const add=(bin,row)=>{bin.n++;bin.confidence+=row.confidence;bin.accuracy+=row.hit;};
    if(mode==='width') rows.forEach(row=>add(bins[Math.min(binCount-1,Math.floor(row.confidence*binCount))],row));
    else {
      const sorted=[...rows].sort((a,b)=>a.confidence-b.confidence);
      let offset=0;
      bins.forEach((bin,i)=>{
        const size=Math.floor(data.length/binCount)+Number(i<data.length%binCount);
        const group=sorted.slice(offset,offset+size);offset+=size;
        bin.lower=group.length?group[0].confidence:null;
        bin.upper=group.length?group[group.length-1].confidence:null;
        group.forEach(row=>add(bin,row));
      });
    }
    let ece=0;
    bins.forEach(bin=>{
      if(bin.n){bin.confidence/=bin.n;bin.accuracy/=bin.n;}
      bin.contribution=bin.n/data.length*Math.abs(bin.accuracy-bin.confidence);
      ece+=bin.contribution;
    });
    return {nll:nll/data.length,brier:brier/data.length,ece,accuracy:correct/data.length,bins,rows};
  }
  const api={samples,simulatedSamples,probabilities,metrics};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.calibration=api;
})(typeof window!=='undefined'?window:globalThis);
