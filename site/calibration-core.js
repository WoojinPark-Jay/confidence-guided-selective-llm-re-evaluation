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
  function metrics(data,t,binCount=5) {
    if (!data.length) throw new Error('Empty sample');
    const bins=Array.from({length:binCount},(_,i)=>({lower:i/binCount,upper:(i+1)/binCount,n:0,confidence:0,accuracy:0}));
    let nll=0,brier=0,correct=0;
    const rows=data.map(sample=>{
      const q=probabilities(sample.z,t),confidence=Math.max(...q),prediction=q.indexOf(confidence);
      const hit=Number(prediction===sample.y);
      const loss=-Math.log(q[sample.y]);
      const score=q.reduce((sum,p,k)=>sum+(p-Number(k===sample.y))**2,0);
      const bin=bins[Math.min(binCount-1,Math.floor(confidence*binCount))];
      bin.n++;bin.confidence+=confidence;bin.accuracy+=hit;
      nll+=loss;brier+=score;correct+=hit;
      return {...sample,q,confidence,prediction,hit,loss,score};
    });
    let ece=0;
    bins.forEach(bin=>{
      if(bin.n){bin.confidence/=bin.n;bin.accuracy/=bin.n;}
      bin.contribution=bin.n/data.length*Math.abs(bin.accuracy-bin.confidence);
      ece+=bin.contribution;
    });
    return {nll:nll/data.length,brier:brier/data.length,ece,accuracy:correct/data.length,bins,rows};
  }
  const api={samples,probabilities,metrics};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.calibration=api;
})(typeof window!=='undefined'?window:globalThis);
