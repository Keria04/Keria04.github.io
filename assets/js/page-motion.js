(function () {
  "use strict";

  function watchMedia(media, callback) {
    if (!media) return;
    if (media.addEventListener) media.addEventListener("change", callback);
    else if (media.addListener) media.addListener(callback);
  }

  function initReveals(body, staticMode) {
    var items = Array.prototype.slice.call(body.querySelectorAll("[data-page-reveal]"));
    var observer = null;
    function showAll() {
      if (observer) observer.disconnect();
      observer = null;
      body.classList.remove("page-motion-ready");
      items.forEach(function (item) { item.classList.add("is-revealed"); });
    }
    function update(isStatic) {
      if (isStatic || !window.IntersectionObserver) { showAll(); return; }
      if (observer) return;
      var pending = items.filter(function (item) { return !item.classList.contains("is-revealed"); });
      if (!pending.length) return;
      try {
        observer = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-revealed");
            if (observer) observer.unobserve(entry.target);
          });
        }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
        pending.forEach(function (item) { observer.observe(item); });
        // Content stays visible unless every observer registration succeeded.
        body.classList.add("page-motion-ready");
      } catch (_) { showAll(); }
    }
    body.addEventListener("focusin", function (event) {
      var item = event.target.closest && event.target.closest("[data-page-reveal]");
      if (!item) return;
      item.classList.add("is-revealed");
      if (observer) observer.unobserve(item);
    });
    update(staticMode);
    return update;
  }

  function initInterest(root, staticMode) {
    var art = root.querySelector("[data-interest-art]");
    var frameElement = art && art.querySelector(".interest-art__frame");
    var canvas = art && art.querySelector("[data-interest-canvas]");
    var toggle = art && art.querySelector("[data-interest-toggle]");
    var label = toggle && toggle.querySelector("[data-interest-label]");
    var icon = toggle && toggle.querySelector("[data-interest-icon]");
    if (!frameElement || !canvas || !toggle || !label) return null;
    var ctx;
    try { ctx = canvas.getContext("2d"); } catch (_) { return null; }
    if (!ctx) return null;
    var interactive = "a, button, input, select, textarea, [role='button']";
    var canAnimate = !!(window.requestAnimationFrame && window.cancelAnimationFrame);
    var isStatic = staticMode;
    var paused = false;
    var suspended = false;
    var inView = false;
    var ready = false;
    var entered = false;
    var raf = 0;
    var lastTime = null;
    var width = 0;
    var height = 0;
    var pageLeft = 0;
    var pageTop = 0;
    var exclusion = null;
    var particles = [];
    var pointer = null;
    var touch = null;
    var viewObserver = null;
    var wind = { x: 0, y: 0, cx: 0, cy: 0 };
    var offset = { x: 0, y: 0, tx: 0, ty: 0 };
    function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
    function between(min, max) { return min + Math.random() * (max - min); }
    function scrollX() { return window.scrollX || window.pageXOffset || 0; }
    function scrollY() { return window.scrollY || window.pageYOffset || 0; }
    function running() {
      return ready && canAnimate && inView && !paused && !isStatic &&
        !suspended && !document.hidden && root.isConnected !== false;
    }
    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      lastTime = null;
      pointer = null;
      touch = null;
      offset.tx = 0;
      offset.ty = 0;
    }
    function setOffset() {
      frameElement.style.setProperty("--interest-x", offset.x.toFixed(3) + "px");
      frameElement.style.setProperty("--interest-y", offset.y.toFixed(3) + "px");
      frameElement.style.setProperty("--interest-scale", isStatic || !canAnimate ? "1" : "1.025");
    }
    function updateToggle() {
      var text = paused ? "Resume motion" : "Pause motion";
      label.textContent = text;
      toggle.setAttribute("aria-label", text);
      toggle.removeAttribute("aria-pressed");
      if (icon) {
        icon.textContent = paused ? "▶" : "Ⅱ";
        icon.setAttribute("aria-hidden", "true");
      }
      toggle.hidden = !ready || !canAnimate || isStatic;
    }
    function sync() {
      updateToggle();
      if (!running()) { stop(); return; }
      if (!entered) {
        entered = true;
        wind.x = 24;
        wind.y = -9;
        wind.cx = width * 0.65;
        wind.cy = height * 0.7;
      }
      if (!raf) raf = window.requestAnimationFrame(tick);
    }
    function blocked(x, y, padding) {
      return exclusion && x > exclusion.left - padding && x < exclusion.right + padding &&
        y > exclusion.top - padding && y < exclusion.bottom + padding;
    }
    function makeParticle() {
      return {
        x: between(0, width), y: between(height * 0.18, height),
        vx: 0, vy: 0, size: between(2, 3.9), speed: between(5, 11),
        phase: between(0, Math.PI * 2), angle: between(0, Math.PI * 2),
        spin: between(-0.5, 0.5), opacity: between(0.25, 0.5)
      };
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      if (!ready) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.clip();
      particles.forEach(function (particle) {
        if (blocked(particle.x, particle.y, particle.size * 2 + 8)) return;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        ctx.scale(0.7 + Math.sin(particle.phase) * 0.2, 1);
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = "#ab5650";
        var r = particle.size;
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.bezierCurveTo(-r * 0.25, -r, r * 0.85, -r * 0.6, r, 0);
        ctx.bezierCurveTo(r * 0.25, r * 0.8, -r * 0.65, r * 0.65, -r, 0);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }
    function tick(time) {
      raf = 0;
      if (!running()) { stop(); return; }
      var dt = lastTime === null ? 1 / 60 : clamp((time - lastTime) / 1000, 0, 0.05);
      lastTime = time;
      var ease = 1 - Math.exp(-2.4 * dt);
      wind.x *= Math.exp(-1.9 * dt);
      wind.y *= Math.exp(-1.9 * dt);
      offset.x += (offset.tx - offset.x) * (1 - Math.exp(-5 * dt));
      offset.y += (offset.ty - offset.y) * (1 - Math.exp(-5 * dt));
      setOffset();
      var radius = Math.max(120, width * 0.4);
      particles.forEach(function (particle) {
        var dx = particle.x - wind.cx;
        var dy = particle.y - wind.cy;
        var influence = 0.2 + 0.8 * Math.exp(-(dx * dx + dy * dy) / (radius * radius));
        particle.vx += (particle.speed + wind.x * influence - particle.vx) * ease;
        particle.vy += (-2 + Math.sin(particle.phase) * 3 + wind.y * influence - particle.vy) * ease;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.angle += (particle.spin + wind.x * 0.002) * dt;
        particle.phase += dt;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.x < -12) particle.x = width + 8;
        if (particle.y < -10) particle.y = height + 8;
        if (particle.y > height + 10) particle.y = -8;
      });
      draw();
      raf = window.requestAnimationFrame(tick);
    }
    function checkVisibility() {
      inView = pageTop + height > scrollY() && pageTop < scrollY() + window.innerHeight &&
        pageLeft + width > scrollX() && pageLeft < scrollX() + window.innerWidth;
      sync();
    }
    function measure() {
      var rect = frameElement.getBoundingClientRect();
      var changed = width !== rect.width || height !== rect.height;
      width = rect.width;
      height = rect.height;
      pageLeft = rect.left + scrollX();
      pageTop = rect.top + scrollY();
      ready = width > 0 && height > 0;
      updateToggle();
      var buttonRect = toggle.getBoundingClientRect();
      exclusion = buttonRect.width > 0 ? {
        left: buttonRect.left - rect.left, right: buttonRect.right - rect.left,
        top: buttonRect.top - rect.top, bottom: buttonRect.bottom - rect.top
      } : null;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pixelWidth = Math.max(1, Math.round(width * dpr));
      var pixelHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (changed && ready) {
        var count = clamp(Math.round(width * height / 26000), 10, 24);
        particles = Array.from({ length: count }, makeParticle);
        pointer = null;
      }
      setOffset();
      draw();
      checkVisibility();
    }
    function usablePoint(event) {
      if (!running() || (event.target.closest && event.target.closest(interactive))) return null;
      var point = { x: event.clientX + scrollX() - pageLeft, y: event.clientY + scrollY() - pageTop };
      return point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height &&
        !blocked(point.x, point.y, 8) ? point : null;
    }
    function move(event) {
      if (event.pointerType && event.pointerType !== "mouse") {
        if (touch && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 12) touch = null;
        return;
      }
      var point = usablePoint(event);
      if (!point) { pointer = null; offset.tx = 0; offset.ty = 0; return; }
      var elapsed = pointer ? clamp((event.timeStamp - pointer.time) / 1000, 0.016, 0.08) : 0.016;
      var dx = pointer ? (point.x - pointer.x) / elapsed : 20;
      var dy = pointer ? (point.y - pointer.y) / elapsed : -5;
      wind.x = wind.x * 0.5 + clamp(dx * 0.22, -55, 75) * 0.5;
      wind.y = wind.y * 0.5 + clamp(dy * 0.14, -28, 28) * 0.5;
      wind.cx = point.x;
      wind.cy = point.y;
      offset.tx = (point.x / width * 2 - 1) * Math.min(6, width * 0.008);
      offset.ty = (point.y / height * 2 - 1) * Math.min(6, height * 0.008);
      pointer = { x: point.x, y: point.y, time: event.timeStamp };
    }
    function touchStart(event) {
      if (event.pointerType === "mouse" || !usablePoint(event)) return;
      touch = { x: event.clientX, y: event.clientY, time: event.timeStamp, id: event.pointerId };
    }
    function touchEnd(event) {
      var tap = touch;
      touch = null;
      if (!tap || tap.id !== event.pointerId || event.timeStamp - tap.time > 500 ||
          Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 12) return;
      var point = usablePoint(event);
      if (!point) return;
      wind.x = 50;
      wind.y = -18;
      wind.cx = point.x;
      wind.cy = point.y;
    }
    function leave() { pointer = null; touch = null; offset.tx = 0; offset.ty = 0; }
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.pointerEvents = "none";
    toggle.type = "button";
    toggle.addEventListener("click", function () {
      if (isStatic || !ready) return;
      paused = !paused;
      measure();
    });
    if (window.PointerEvent) {
      frameElement.addEventListener("pointerenter", measure, { passive: true });
      frameElement.addEventListener("pointermove", move, { passive: true });
      frameElement.addEventListener("pointerdown", touchStart, { passive: true });
      frameElement.addEventListener("pointerup", touchEnd, { passive: true });
      frameElement.addEventListener("pointerleave", leave, { passive: true });
      frameElement.addEventListener("pointercancel", leave, { passive: true });
    } else {
      frameElement.addEventListener("mouseenter", measure, { passive: true });
      frameElement.addEventListener("mousemove", move, { passive: true });
      frameElement.addEventListener("mouseleave", leave, { passive: true });
      frameElement.addEventListener("touchstart", function (event) {
        if (event.touches.length !== 1) { touch = null; return; }
        var p = event.touches[0];
        touchStart({ clientX: p.clientX, clientY: p.clientY, target: event.target, timeStamp: event.timeStamp });
      }, { passive: true });
      frameElement.addEventListener("touchmove", leave, { passive: true });
      frameElement.addEventListener("touchend", function (event) {
        var p = event.changedTouches[0];
        if (p) touchEnd({ clientX: p.clientX, clientY: p.clientY, target: event.target, timeStamp: event.timeStamp });
      }, { passive: true });
      frameElement.addEventListener("touchcancel", leave, { passive: true });
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else measure(); });
    window.addEventListener("pagehide", function () { suspended = true; stop(); });
    window.addEventListener("pageshow", function () { suspended = false; measure(); });
    window.addEventListener("resize", measure, { passive: true });
    root.addEventListener("transitionend", function (event) { if (event.target === root) measure(); });
    var image = frameElement.querySelector("img");
    if (image) image.addEventListener("load", measure);
    if (window.ResizeObserver) {
      var resizeObserver = new window.ResizeObserver(measure);
      resizeObserver.observe(frameElement);
    }
    if (window.IntersectionObserver) {
      try {
        viewObserver = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.target !== frameElement) return;
            inView = entry.isIntersecting;
            sync();
          });
        }, { threshold: 0 });
        viewObserver.observe(frameElement);
      } catch (_) {
        if (viewObserver) viewObserver.disconnect();
        viewObserver = null;
      }
    }
    if (!viewObserver) window.addEventListener("scroll", checkVisibility, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
    return function (value) {
      isStatic = value;
      if (value) {
        offset.x = offset.y = offset.tx = offset.ty = 0;
        wind.x = wind.y = 0;
      }
      measure();
    };
  }

  function init() {
    var body = document.body;
    if (!body || !body.classList.contains("editorial-page") ||
        body.getAttribute("data-page-motion-ready") === "true") return;
    body.setAttribute("data-page-motion-ready", "true");
    var preference = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    var print = window.matchMedia && window.matchMedia("print");
    var printing = !!(print && print.matches);
    function staticMode() { return printing || !!(preference && preference.matches); }
    var reveal = initReveals(body, staticMode());
    var interests = Array.prototype.map.call(body.querySelectorAll("[data-interest-motion]"), function (root) {
      return initInterest(root, staticMode());
    }).filter(Boolean);
    function update() {
      reveal(staticMode());
      interests.forEach(function (interest) { interest(staticMode()); });
    }
    watchMedia(preference, update);
    watchMedia(print, function (event) { printing = event.matches; update(); });
    window.addEventListener("beforeprint", function () { printing = true; update(); });
    window.addEventListener("afterprint", function () { printing = false; update(); });
    var masthead = document.querySelector(".masthead");
    if (masthead) {
      var lastHeight = -1;
      var measureMasthead = function () {
        var height = Math.ceil(masthead.getBoundingClientRect().height);
        if (height === lastHeight) return;
        lastHeight = height;
        body.style.setProperty("--page-masthead-height", height + "px");
      };
      measureMasthead();
      window.addEventListener("resize", measureMasthead, { passive: true });
      if (window.ResizeObserver) {
        var mastheadObserver = new window.ResizeObserver(measureMasthead);
        mastheadObserver.observe(masthead);
      }
    }
    Array.prototype.forEach.call(body.querySelectorAll("[data-theme-keyboard]"), function (button) {
      button.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
        event.preventDefault();
        if (!event.repeat) button.click();
      });
    });
    var menu = body.querySelector('[aria-controls="nav-hidden-links"]');
    var links = document.getElementById("nav-hidden-links");
    if (menu && links) {
      var syncMenu = function () {
        menu.setAttribute("aria-expanded", String(!links.hidden && !links.classList.contains("hidden")));
      };
      syncMenu();
      if (window.MutationObserver) {
        var menuObserver = new window.MutationObserver(syncMenu);
        menuObserver.observe(links, { attributes: true, attributeFilter: ["class", "hidden"] });
      }
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());
