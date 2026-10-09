/* JavaScriptが無効でも全ての本文とナビゲーションを利用できます。 */
(function () {
  'use strict';

  var button = document.querySelector('.menu-toggle');
  var navigation = document.getElementById('site-nav');
  if (!button || !navigation || !window.matchMedia) return;

  var mobile = window.matchMedia('(max-width: 760px)');

  function closeMenu() {
    navigation.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'メニュー';
  }

  function updateLayout() {
    // 幅が変わった際、非表示になる要素にキーボードフォーカスを残さない。
    var active = document.activeElement;
    if (mobile.matches) button.hidden = false;
    else document.documentElement.classList.remove('menu-ready');
    if (mobile.matches && navigation.contains(active)) button.focus();
    if (!mobile.matches && active === button) navigation.querySelector('a').focus();
    closeMenu();
    button.hidden = !mobile.matches;
    document.documentElement.classList.toggle('menu-ready', mobile.matches);
  }

  button.addEventListener('click', function () {
    var open = button.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? '閉じる' : 'メニュー';
  });

  navigation.addEventListener('click', function (event) {
    var link = event.target;
    if (link.tagName !== 'A' || !mobile.matches) return;
    var section = document.getElementById(link.hash.slice(1));
    if (section) {
      section.setAttribute('tabindex', '-1');
      section.focus();
    }
    closeMenu();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      button.focus();
    }
  });

  // 古いSafariでも表示切り替えが可能なフォールバック。
  if (mobile.addEventListener) mobile.addEventListener('change', updateLayout);
  else if (mobile.addListener) mobile.addListener(updateLayout);
  updateLayout();
}());
