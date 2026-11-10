'use strict';

function filterPeriod(rows,start,end){return rows.filter(r=>r.month>=start&&r.month<=end);}

function bindStatisticsPeriod(el, rows, presets, render) {
 for (const id of ['start', 'end']) {
  for (const {month} of rows) {
   const option = document.createElement('option');
   option.value = month;
   option.textContent = month;
   el(id).append(option);
  }
  el(id).addEventListener('change', () => {
   el('preset').value = 'custom';
   render();
  });
 }
 const all = [rows[0].month, rows.at(-1).month];
 [el('start').value, el('end').value] = all;
 el('preset').addEventListener('change', () => {
  const preset = el('preset').value;
  if (preset === 'custom') return;
  const [start, end] = preset === 'all' ? all : presets[preset];
  const months = filterPeriod(rows, start, end);
  el('start').value = months[0]?.month ?? '';
  el('end').value = months.at(-1)?.month ?? '';
  render();
 });
}
