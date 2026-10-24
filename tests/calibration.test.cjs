const {test}=require('node:test');
const assert=require('node:assert/strict');
const {probabilities,metrics,samples}=require('../site/calibration-core.js');
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
