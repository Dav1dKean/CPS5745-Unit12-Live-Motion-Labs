import {test} from 'node:test';
import assert from 'node:assert/strict';
import {numeric,normalizeEarthquakes,normalizeWorldBank,normalizeForecast,normalizeEvents,recentYears,firstHours} from '../shared/sources.js';
test('missing data is never coerced to zero',()=>{
 for(const n of [null,undefined,'',false,NaN,Infinity])assert.equal(numeric(n),false);
 for(const n of [0,-2,'3.4'])assert.equal(numeric(n),true);
});
test('USGS requires complete coordinates and preserves depth/magnitude',()=>{
 const raw={features:[{id:'a',properties:{mag:0,time:1},geometry:{coordinates:[10,20,30]}},{properties:{mag:3},geometry:{coordinates:[]}}]};
 const before=JSON.stringify(raw),rows=normalizeEarthquakes(raw);
 assert.equal(rows.length,1);assert.equal(rows[0].y,30);assert.equal(rows[0].x,0);assert.equal(JSON.stringify(raw),before);
});
test('annual selection keeps all countries, drops missing and rejects incomplete pagination',()=>{
 const row=(country,date,value)=>({country:{id:country,value:country},date,value});
 const rows=normalizeWorldBank([{pages:1},[row('A','2024',1),row('B','2024',0),row('A','2023',2),row('B','2023',null)]]);
 assert.equal(rows.length,3);assert.equal(recentYears({rows},1).length,2);
 assert.throws(()=>normalizeWorldBank([{pages:2},[]]),/pages/);
});
test('multi-city hourly forecasts preserve zero and select hours for each city',()=>{
 const city={hourly_units:{time:'unixtime'},hourly:{time:[100,3700,7300],precipitation:[0,1,2]}};
 const rows=normalizeForecast([city,city],'precipitation');
 assert.equal(rows.length,6);assert.equal(firstHours({rows},1).length,2);assert.equal(rows[0].value,0);
});

test('missing wind readings remain unreported while valid zero is preserved', () => {
  const raw = { hourly_units: { time: 'unixtime' }, hourly: {
    time: [100, 3700], temperature_2m: [0, 5], wind_speed_10m: [null, 0],
    wind_direction_10m: [0, null], relative_humidity_2m: [null, 60],
  } };
  const [a, b] = normalizeForecast(raw, 'temperature_2m');
  assert.equal(a.wind, undefined);
  assert.equal(a.direction, 0);
  assert.equal(a.humidity, undefined);
  assert.equal(b.wind, 0);
  assert.equal(b.direction, undefined);
  assert.equal(b.humidity, 60);
});

test('EONET first-category counts use only the first distinct title', () => {
  const categories = (...titles) => titles.map((title) => ({ title }));
  const raw = { events: [
    { categories: categories('Storms', 'Wildfires', 'Storms') },
    { categories: categories('Wildfires') },
    { categories: [] },
  ] };
  const count = (mode) => Object.fromEntries(normalizeEvents(raw, mode)
    .map(({ label, value }) => [label, value]));
  assert.deepEqual(count('all'), { Storms: 1, Wildfires: 2, Other: 1 });
  assert.deepEqual(count('first'), { Storms: 1, Wildfires: 1, Other: 1 });
});
