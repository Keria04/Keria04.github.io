(function () {
  "use strict";

  function initReveals(main, reducedMotion) {
    var items = Array.prototype.slice.call(main.querySelectorAll("[data-home-reveal]"));
    var observer = null;

    function showAll() {
      if (observer) observer.disconnect();
      observer = null;
      main.classList.remove("is-motion-ready");
      items.forEach(function (item) { item.classList.add("is-revealed"); });
    }

    function update(reduced) {
      if (reduced || !window.IntersectionObserver || !items.length) {
        showAll();
        return;
      }
      if (observer) return;
      var pending = items.filter(function (item) {
        return !item.classList.contains("is-revealed");
      });
      if (!pending.length) return;
      try {
        observer = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-revealed");
            if (observer) observer.unobserve(entry.target);
          });
        }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });
        pending.forEach(function (item) { observer.observe(item); });
        // A missing or failed observer must never leave the content hidden.
        main.classList.add("is-motion-ready");
      } catch (_) {
        showAll();
      }
    }

    main.addEventListener("focusin", function (event) {
      var item = event.target.closest && event.target.closest("[data-home-reveal]");
      if (item) {
        item.classList.add("is-revealed");
        if (observer) observer.unobserve(item);
      }
    });
    update(reducedMotion);
    return update;
  }

  function initWind(main, reducedMotion) {
    var root = main.querySelector("[data-home-wind]");
    if (!root) return null;
    var canvas = root.querySelector("[data-wind-canvas]");
    var art = root.querySelector(".home-cover__art");
    var copy = root.querySelector("[data-wind-still]");
    var toggle = root.querySelector("[data-wind-toggle]");
    var label = toggle && toggle.querySelector("[data-wind-label]");
    var icon = toggle && toggle.querySelector(".home-cover__motion-icon");
    if (!canvas || !art || !copy || !toggle || !label) return null;
    var ctx;
    try { ctx = canvas.getContext("2d"); } catch (_) { return null; }
    if (!ctx) return null;

    var MAX_PETALS = 30;
    var colors = ["#b25d55", "#a64f4a", "#955450"];
    var interactive = "a, button, input, select, textarea, [role='button']";
    var canAnimate = !!(window.requestAnimationFrame && window.cancelAnimationFrame);
    var reduced = reducedMotion;
    var paused = false;
    var pageSuspended = false;
    var inView = false;
    var ready = false;
    var entered = false;
    var frame = 0;
    var lastTime = null;
    var width = 0;
    var height = 0;
    var pageLeft = 0;
    var pageTop = 0;
    var artPage = null;
    var field = null;
    var exclusions = [];
    var petals = [];
    var pointer = null;
    var touch = null;
    var wind = { x: 0, y: 0, cx: 0, cy: 0 };
    var viewObserver = null;

    function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
    function between(min, max) { return min + Math.random() * (max - min); }
    function scrollX() { return window.scrollX || window.pageXOffset || 0; }
    function scrollY() { return window.scrollY || window.pageYOffset || 0; }
    function blocked(x, y, margin) {
      return exclusions.some(function (rect) {
        return x > rect.left - margin && x < rect.right + margin &&
          y > rect.top - margin && y < rect.bottom + margin;
      });
    }
    function running() {
      return ready && canAnimate && inView && !paused && !reduced &&
        !document.hidden && !pageSuspended && root.isConnected !== false;
    }
    function stop() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = null;
      pointer = null;
      touch = null;
    }
    function updateToggle() {
      var text = paused ? "Resume petals" : "Pause petals";
      label.textContent = text;
      toggle.setAttribute("aria-label", text);
      // This button names its next action; it is not a constant-label toggle.
      toggle.removeAttribute("aria-pressed");
      if (icon) {
        icon.textContent = paused ? "▶" : "Ⅱ";
        icon.setAttribute("aria-hidden", "true");
      }
      toggle.hidden = !ready || !canAnimate || reduced;
    }
    function sync() {
      updateToggle();
      if (!running()) {
        stop();
        return;
      }
      if (!entered) {
        entered = true;
        wind.x = 32;
        wind.y = -10;
        wind.cx = field.left + field.width * 0.66;
        wind.cy = field.top + field.height * 0.7;
      }
      if (!frame) frame = window.requestAnimationFrame(tick);
    }

    function makePetal() {
      var petal = {
        x: 0, y: 0, vx: 0, vy: 0,
        size: between(2.2, 4.6),
        speed: between(7, 15),
        phase: between(0, Math.PI * 2),
        angle: between(0, Math.PI * 2),
        spin: between(-0.6, 0.6),
        opacity: between(0.3, 0.58),
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      for (var i = 0; i < 16; i += 1) {
        petal.x = between(field.left, field.right);
        petal.y = between(field.top + field.height * 0.2, field.bottom);
        if (!blocked(petal.x, petal.y, 12)) break;
      }
      return petal;
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      if (!ready) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(field.left, field.top, field.width, field.height);
      ctx.clip();
      petals.forEach(function (petal) {
        // The padded exclusion also covers a rotating petal's entire silhouette.
        if (blocked(petal.x, petal.y, petal.size * 2 + 12)) return;
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.angle);
        ctx.scale(0.68 + Math.sin(petal.phase) * 0.25, 1);
        ctx.globalAlpha = petal.opacity;
        ctx.fillStyle = petal.color;
        var r = petal.size;
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.bezierCurveTo(-r * 0.25, -r * 0.95, r * 0.85, -r * 0.6, r, 0);
        ctx.bezierCurveTo(r * 0.25, r * 0.8, -r * 0.65, r * 0.65, -r, 0);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }

    function tick(time) {
      frame = 0;
      if (!running()) {
        stop();
        return;
      }
      var dt = lastTime === null ? 1 / 60 : clamp((time - lastTime) / 1000, 0, 0.05);
      lastTime = time;
      var decay = Math.exp(-1.8 * dt);
      var ease = 1 - Math.exp(-2.3 * dt);
      wind.x *= decay;
      wind.y *= decay;
      var radius = Math.max(170, field.width * 0.4);
      petals.forEach(function (petal) {
        var dx = petal.x - wind.cx;
        var dy = petal.y - wind.cy;
        var influence = 0.2 + 0.8 * Math.exp(-(dx * dx + dy * dy) / (radius * radius));
        petal.vx += (petal.speed + wind.x * influence - petal.vx) * ease;
        petal.vy += (-2 + Math.sin(petal.phase) * 3 + wind.y * influence - petal.vy) * ease;
        petal.x += petal.vx * dt;
        petal.y += petal.vy * dt;
        petal.angle += (petal.spin + wind.x * 0.002) * dt;
        petal.phase += dt;
        if (petal.x > field.right + 12) petal.x = field.left - 12;
        if (petal.x < field.left - 14) petal.x = field.right + 10;
        if (petal.y < field.top - 12) petal.y = field.bottom + 10;
        if (petal.y > field.bottom + 12) petal.y = field.top - 10;
      });
      draw();
      frame = window.requestAnimationFrame(tick);
    }

    function checkVisibility() {
      if (!artPage) return;
      inView = artPage.bottom > scrollY() && artPage.top < scrollY() + window.innerHeight &&
        artPage.right > scrollX() && artPage.left < scrollX() + window.innerWidth;
      sync();
    }

    function measure() {
      var canvasRect = canvas.getBoundingClientRect();
      var artRect = art.getBoundingClientRect();
      var oldField = field;
      width = canvasRect.width;
      height = canvasRect.height;
      pageLeft = canvasRect.left + scrollX();
      pageTop = canvasRect.top + scrollY();
      artPage = {
        left: artRect.left + scrollX(), top: artRect.top + scrollY(),
        right: artRect.right + scrollX(), bottom: artRect.bottom + scrollY()
      };
      var left = Math.max(0, artRect.left - canvasRect.left);
      var top = Math.max(0, artRect.top - canvasRect.top);
      var right = Math.min(width, artRect.right - canvasRect.left);
      var bottom = Math.min(height, artRect.bottom - canvasRect.top);
      field = { left: left, top: top, right: right, bottom: bottom,
        width: right - left, height: bottom - top };
      ready = width > 0 && height > 0 && field.width > 0 && field.height > 0;
      updateToggle();
      var safeNodes = [copy, toggle].concat(
        Array.prototype.slice.call(root.querySelectorAll(interactive))
      );
      exclusions = safeNodes.map(function (node) {
        var rect = node.getBoundingClientRect();
        return { left: rect.left - canvasRect.left, top: rect.top - canvasRect.top,
          right: rect.right - canvasRect.left, bottom: rect.bottom - canvasRect.top,
          width: rect.width, height: rect.height };
      }).filter(function (rect) { return rect.width > 0 && rect.height > 0; });
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pixelWidth = Math.max(1, Math.round(width * dpr));
      var pixelHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (ready && (!oldField || oldField.width !== field.width ||
          oldField.height !== field.height || oldField.left !== field.left ||
          oldField.top !== field.top)) {
        var count = clamp(Math.round(field.width * field.height / 38000), 12, MAX_PETALS);
        petals = Array.from({ length: count }, makePetal);
        wind.x = 0;
        wind.y = 0;
        pointer = null;
      }
      draw();
      checkVisibility();
    }

    function eventPoint(event) {
      return { x: event.clientX + scrollX() - pageLeft,
        y: event.clientY + scrollY() - pageTop };
    }
    function usablePoint(event) {
      if (!running() || (event.target.closest && event.target.closest(interactive))) return null;
      var point = eventPoint(event);
      return point.x >= field.left && point.x <= field.right &&
        point.y >= field.top && point.y <= field.bottom &&
        !blocked(point.x, point.y, 8) ? point : null;
    }
    function move(event) {
      if (event.pointerType && event.pointerType !== "mouse") {
        if (touch && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 12) touch = null;
        return;
      }
      var point = usablePoint(event);
      if (!point) { pointer = null; return; }
      var time = event.timeStamp;
      var elapsed = pointer ? clamp((time - pointer.time) / 1000, 0.016, 0.08) : 0.016;
      var dx = pointer ? (point.x - pointer.x) / elapsed : 30;
      var dy = pointer ? (point.y - pointer.y) / elapsed : -8;
      wind.x = wind.x * 0.45 + clamp(dx * 0.28, -70, 100) * 0.55;
      wind.y = wind.y * 0.45 + clamp(dy * 0.16, -35, 35) * 0.55;
      wind.cx = point.x;
      wind.cy = point.y;
      pointer = { x: point.x, y: point.y, time: time };
    }
    function touchStart(event) {
      if (event.pointerType === "mouse" || !usablePoint(event)) return;
      touch = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    }
    function touchEnd(event) {
      if (!touch || event.timeStamp - touch.time > 500 ||
          Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 12) {
        touch = null;
        return;
      }
      var point = usablePoint(event);
      touch = null;
      if (!point) return;
      wind.x = 65;
      wind.y = -22;
      wind.cx = point.x;
      wind.cy = point.y;
    }

    canvas.setAttribute("aria-hidden", "true");
    canvas.style.pointerEvents = "none";
    toggle.type = "button";
    toggle.addEventListener("click", function () {
      if (reduced || !ready) return;
      paused = !paused;
      measure(); // The label changes width; refresh its protected rectangle once.
    });
    if (window.PointerEvent) {
      root.addEventListener("pointermove", move, { passive: true });
      root.addEventListener("pointerdown", touchStart, { passive: true });
      root.addEventListener("pointerup", touchEnd, { passive: true });
      root.addEventListener("pointercancel", function () { touch = null; }, { passive: true });
      root.addEventListener("pointerleave", function () { pointer = null; touch = null; }, { passive: true });
    } else {
      root.addEventListener("mousemove", move, { passive: true });
      root.addEventListener("mouseleave", function () { pointer = null; }, { passive: true });
      root.addEventListener("touchstart", function (event) {
        if (event.touches.length !== 1) { touch = null; return; }
        var point = event.touches[0];
        touchStart({ clientX: point.clientX, clientY: point.clientY,
          timeStamp: event.timeStamp, target: event.target });
      }, { passive: true });
      root.addEventListener("touchmove", function () { touch = null; }, { passive: true });
      root.addEventListener("touchend", function (event) {
        var point = event.changedTouches[0];
        if (point) touchEnd({ clientX: point.clientX, clientY: point.clientY,
          timeStamp: event.timeStamp, target: event.target });
      }, { passive: true });
      root.addEventListener("touchcancel", function () { touch = null; }, { passive: true });
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else measure();
    });
    window.addEventListener("pagehide", function () { pageSuspended = true; stop(); });
    window.addEventListener("pageshow", function () { pageSuspended = false; measure(); });
    window.addEventListener("resize", measure, { passive: true });
    if (window.ResizeObserver) {
      var resizeObserver = new window.ResizeObserver(measure);
      [root, art, copy].forEach(function (node) { resizeObserver.observe(node); });
    }
    if (window.IntersectionObserver) {
      try {
        viewObserver = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.target === art) {
              inView = entry.isIntersecting;
              sync();
            }
          });
        }, { threshold: 0 });
        viewObserver.observe(art);
      } catch (_) {
        if (viewObserver) viewObserver.disconnect();
        viewObserver = null;
      }
    }
    if (!viewObserver) window.addEventListener("scroll", checkVisibility, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
    return function (value) {
      reduced = value;
      measure();
    };
  }

  function init() {
    var main = document.querySelector("main.home--editorial");
    if (!main || main.getAttribute("data-home-motion-ready") === "true") return;
    main.setAttribute("data-home-motion-ready", "true");
    var preference = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    var reduced = !!(preference && preference.matches);
    var reveal = initReveals(main, reduced);
    var wind = initWind(main, reduced);
    if (preference) {
      var change = function (event) {
        reveal(event.matches);
        if (wind) wind(event.matches);
      };
      if (preference.addEventListener) preference.addEventListener("change", change);
      else if (preference.addListener) preference.addListener(change);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}());
