/**
 * Privacy-friendly analytics for josephaleto.io.
 *
 * Captures UTM attribution (persisted for the session) and sends page views
 * plus conversion events (CV download, email, terminal usage) to the
 * site-analytics Lambda. No cookies, no PII. Fire-and-forget via sendBeacon.
 *
 * Other scripts can record custom events with: window.siteTrack('event', {...}).
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://4zmbfn6cdc3tav6vimzmljbk6a0obhfv.lambda-url.us-east-1.on.aws/';

  var store;
  try {
    store = window.sessionStorage;
  } catch (e) {
    store = null;
  }

  // Persist UTM params so attribution survives in-session navigation.
  try {
    var qs = new URLSearchParams(window.location.search);
    ['source', 'medium', 'campaign'].forEach(function (k) {
      var v = qs.get('utm_' + k);
      if (v && store) store.setItem('utm_' + k, v.slice(0, 80));
    });
  } catch (e) { /* no-op */ }

  function attr(k) {
    try {
      return (store && store.getItem('utm_' + k)) || '';
    } catch (e) {
      return '';
    }
  }

  function track(event, extra) {
    var body = {
      event: event,
      path: window.location.pathname,
      ref: document.referrer || '',
      utm_source: attr('source'),
      utm_medium: attr('medium'),
      utm_campaign: attr('campaign'),
    };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) body[k] = extra[k];
      }
    }
    var json = JSON.stringify(body);
    // text/plain keeps this a CORS "simple request" (no preflight), which is
    // the most reliable transport for beacons, including during page unload.
    // The Lambda parses the JSON body regardless of content-type.
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([json], { type: 'text/plain;charset=UTF-8' });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
    } catch (e) { /* fall through to fetch */ }
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        body: json,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        keepalive: true,
        mode: 'cors',
      }).catch(function () {});
    } catch (e) { /* no-op */ }
  }

  window.siteTrack = track;

  // Page view on load.
  track('page_view');

  // Conversion events via delegated click handler (capture phase).
  document.addEventListener(
    'click',
    function (e) {
      var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
      if (!el) return;
      var href = el.getAttribute('href') || '';
      if (el.id === 'copyEmail') {
        track('email_copy');
      } else if (href.indexOf('mailto:') === 0) {
        track('email_click');
      } else if (/\.pdf(\?|$)/i.test(href)) {
        track('cv_download');
      } else if (href.indexOf('linkedin.com') > -1) {
        track('out_linkedin');
      } else if (href.indexOf('github.com') > -1) {
        track('out_github');
      }
    },
    true
  );
})();
