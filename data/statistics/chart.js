'use strict';

function chartDomain(values) {
 const rawMin = Math.min(...values);
 const rawMax = Math.max(...values);
 const span = rawMax - rawMin;
 const pad = span === 0 ? Math.max(Math.abs(rawMin) * 0.05, 10) : span * 0.12;
 let floor = rawMin - pad;
 let ceiling = rawMax + pad;
 if (rawMin >= 0) floor = Math.max(0, floor);
 if (ceiling <= floor) ceiling = floor + (Math.abs(floor) || 10);
 const rawStep = (ceiling - floor) / 4;
 const power = Math.pow(10, Math.floor(Math.log10(rawStep) || 0));
 const nice = rawStep / power <= 1 ? 1 : rawStep / power <= 2 ? 2 : rawStep / power <= 5 ? 5 : 10;
 const step = nice * power;
 floor = Math.floor(floor / step) * step;
 ceiling = Math.ceil(ceiling / step) * step;
 if (ceiling <= floor) ceiling = floor + step;
 return {floor, ceiling};
}

function chartModel(rows, key) {
 const values = rows.map(row => row[key]).filter(value => value !== null);
 if (!values.length) return {count: 0, max: 0, min: 0, floor: 0, ceiling: 0};
 const max = values.reduce((current, value) => Math.max(current, value));
 const min = values.reduce((current, value) => Math.min(current, value));
 return {count: values.length, max, min, ...chartDomain(values)};
}

function svgNode(tag, attrs, text) {
 const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
 for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
 if (text !== undefined) node.textContent = text;
 return node;
}

function drawStatisticsChart(svg, rows, {key, label, unit}, period) {
 svg.replaceChildren(svgNode('title', {}, `${label}（${unit}）：${period}`));
 const {count, floor, ceiling} = chartModel(rows, key);
 if (!count) {
  svg.append(svgNode('text', {x: 60, y: 100}, '表示できる値がありません'));
  return;
 }
 const range = ceiling - floor;
 if (floor > 0) {
  svg.append(svgNode('text', {x: 90, y: 16, 'text-anchor': 'start'}, '縦軸は0から始まっていません'));
 }
 for (let i = 0; i <= 4; i++) {
  const y = 190 - i * 40;
  svg.append(
   svgNode('line', {x1: 85, x2: 690, y1: y, y2: y, stroke: '#d7dfd8'}),
   svgNode('text', {x: 78, y: y + 5, 'text-anchor': 'end'},
    Math.round(floor + range * i / 4).toLocaleString() + ' ' + unit)
  );
 }
 let segment = [];
 function flush() {
  if (segment.length > 1) {
   svg.append(svgNode('polyline', {points: segment.join(' '), fill: 'none', stroke: '#234d43', 'stroke-width': 3}));
  }
  segment = [];
 }
 const tickCount = Math.min(6, rows.length);
 const ticks = new Set(Array.from({length: tickCount}, (_, i) =>
  tickCount === 1 ? 0 : Math.round(i * (rows.length - 1) / (tickCount - 1))));
 rows.forEach((row, i) => {
  const x = rows.length === 1 ? 390 : 90 + i * 590 / (rows.length - 1);
  if (ticks.has(i)) {
   svg.append(svgNode('text', {x, y: 215, 'text-anchor': 'middle'}, row.month));
  }
  const value = row[key];
  if (value === null) {
   flush();
   return;
  }
  const y = 190 - (value - floor) / range * 160;
  segment.push(`${x},${y}`);
  const dot = svgNode('circle', {cx: x, cy: y, r: 4, fill: '#234d43'});
  dot.append(svgNode('title', {}, `${row.date}：${value.toLocaleString()}${unit}`));
  svg.append(dot);
 });
 flush();
}
