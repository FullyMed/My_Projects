/* Apply the saved theme before first paint to avoid a flash. */
(function () {
  try {
    var raw = localStorage.getItem('journeyset:v1:theme') || '';
    var t = raw.replace(/"/g, '');
    if (['light', 'dark', 'sky', 'gold', 'forest'].indexOf(t) === -1) {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'dark' || t === 'forest') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
