'use strict';

function readStatisticsSource(document) {
 return {
  url: document.getElementById('statistics-provider').getAttribute('href'),
  license: document.getElementById('statistics-license').textContent,
  target: document.getElementById('statistics-source').getAttribute('data-target'),
  retrievedOn: document.getElementById('statistics-retrieved').textContent
 };
}
