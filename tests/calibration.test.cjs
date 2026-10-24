const {test}=require('node:test');
const assert=require('node:assert/strict');
const {probabilities,metrics,samples,simulatedSamples}=require('../site/calibration-core.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('uniform logits give exact NLL, multiclass Brier and ECE',()=>{
  const m=metrics([{z:[0,0,0],y:0},{z:[0,0,0],y:1},{z:[0,0,0],y:2}],1);
  near(m.nll,Math.log(3));near(m.brier,2/3);near(m.ece,0);near(m.accuracy,1/3);
});
test('positive temperatures preserve labels and probability sums',()=>{
  for(const t of [.5,1,1.48,2,3]){
    const m=metrics(samples,t);near(m.accuracy,.75);
    for(const row of m.rows){near(row.q.reduce((a,b)=>a+b),1);assert.equal(row.prediction,row.z.indexOf(Math.max(...row.z)));}
    assert.equal(m.bins.reduce((n,b)=>n+b.n,0),samples.length);
    near(m.ece,m.bins.reduce((s,b)=>s+b.contribution,0));
    assert.ok(m.brier>=0&&m.brier<=2);
  }
});
test('temperature softens overconfidence but metrics are not forced downward',()=>{
  assert.ok(probabilities([4,1,0],3)[0]<probabilities([4,1,0],.5)[0]);
  assert.notEqual(metrics(samples,.5).nll,metrics(samples,3).nll);
  assert.throws(()=>probabilities([1,2,3],0));
});
test('simulation is deterministic, nested and has contrasting outcomes',()=>{
  const data=simulatedSamples();
  assert.equal(data.length,600);
  assert.deepEqual(data,simulatedSamples());
  assert.deepEqual(data.slice(0,60),simulatedSamples(60));
  const m=metrics(data,1);
  assert.ok(m.rows.some(r=>r.hit)&&m.rows.some(r=>!r.hit));
  near(m.accuracy,metrics(data,3).accuracy);
});
test('adaptive bins balance counts, preserve all samples, and do not change other metrics',()=>{
  for(const data of [samples,simulatedSamples(60),simulatedSamples()]){
    for(const count of [5,10,15]){
      const width=metrics(data,1,count),mass=metrics(data,1,count,'mass');
      assert.equal(mass.bins.reduce((s,b)=>s+b.n,0),data.length);
      const sizes=mass.bins.map(b=>b.n);
      assert.ok(Math.max(...sizes)-Math.min(...sizes)<=1);
      near(width.nll,mass.nll);near(width.brier,mass.brier);near(width.accuracy,mass.accuracy);
      near(mass.ece,mass.bins.reduce((s,b)=>s+b.contribution,0));
    }
  }
});
test('adaptive hand-calculation and tied confidences use stable rank groups',()=>{
  const data=[.4,.6,.8,.9].map((p,i)=>({z:[Math.log(p),Math.log((1-p)/2),Math.log((1-p)/2)],y:i%2?0:1}));
  const m=metrics(data,1,2,'mass');
  near(m.ece,.175);near(m.bins[0].confidence,.5);near(m.bins[1].confidence,.85);
  const ties=metrics([{z:[0,0,0],y:0},{z:[0,0,0],y:1},{z:[0,0,0],y:2}],1,2,'mass');
  assert.deepEqual(ties.bins.map(b=>b.n),[2,1]);
});
test('NLL remains finite for extreme scores and grid minimum is no worse than T=1',()=>{
  near(metrics([{z:[1000,0,-1000],y:2}],1).nll,2000);
  for(const data of [samples,simulatedSamples(60),simulatedSamples()]){
    const losses=Array.from({length:251},(_,i)=>metrics(data,.5+i/100).nll);
    assert.ok(Math.min(...losses)<=metrics(data,1).nll);
  }
  assert.throws(()=>metrics(samples,1,0));assert.throws(()=>metrics(samples,1,5,'other'));
});
