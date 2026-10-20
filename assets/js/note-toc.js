(function () {
  "use strict";

  function init() {
    var content = document.querySelector("[data-note-content]");
    if (!content || content.getAttribute("data-reading-ready") === "true") return;
    content.setAttribute("data-reading-ready", "true");
    var toc = document.querySelector("[data-note-toc]");
    var list = document.querySelector("[data-note-toc-list]");
    var sidebar = document.querySelector("[data-reading-sidebar]");
    var layout = content.closest(".reading-layout");
    var progress = document.querySelector("[data-reading-progress]");
    var bar = progress && progress.querySelector("span");
    var masthead = document.querySelector(".masthead");
    var desktop = window.matchMedia && window.matchMedia("(min-width: 1024px)");
    var print = window.matchMedia && window.matchMedia("print");
    var headings = Array.prototype.slice.call(content.querySelectorAll("h2, h3")).filter(function (heading) {
      return heading.textContent.trim() && !heading.classList.contains("no_toc");
    });
    var links = [];
    if (toc && list && headings.length >= 2) {
      var parentItem = null;
      headings.forEach(function (heading, index) {
        if (!heading.id) {
          var id = "note-section-" + (index + 1);
          while (document.getElementById(id)) id += "-section";
          heading.id = id;
        }
        var item = document.createElement("li");
        var link = document.createElement("a");
        link.href = "#" + encodeURIComponent(heading.id);
        link.textContent = heading.textContent.trim();
        item.appendChild(link);
        links.push(link);
        if (heading.tagName === "H3" && parentItem) {
          var nested = parentItem.querySelector("ol");
          if (!nested) {
            nested = document.createElement("ol");
            parentItem.appendChild(nested);
          }
          nested.appendChild(item);
        } else {
          list.appendChild(item);
          if (heading.tagName === "H2") parentItem = item;
        }
      });
      toc.hidden = false;
      if (sidebar) sidebar.hidden = false;
      if (layout) layout.classList.add("has-toc");
    }
    var nav = links.length && toc.querySelector("nav");
    var raf = 0;
    var dirty = true;
    var suspended = false;
    var printing = !!(print && print.matches);
    var active = -1;
    var headingTops = [];
    var linkBounds = [];
    var navHeight = 0;
    var contentTop = 0;
    var contentBottom = 0;
    var headerHeight = 0;
    var viewportHeight = 0;
    var lastProgress = -1;
    function scrollY() { return window.scrollY || window.pageYOffset || 0; }
    function isDesktop() { return desktop ? desktop.matches : window.innerWidth >= 1024; }
    function cancel() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }
    function measure() {
      var y = scrollY();
      var rect = content.getBoundingClientRect();
      contentTop = rect.top + y;
      contentBottom = rect.bottom + y;
      headerHeight = masthead ? masthead.getBoundingClientRect().height : 0;
      viewportHeight = window.innerHeight;
      headingTops = links.length ? headings.map(function (heading) {
        return heading.getBoundingClientRect().top + y;
      }) : [];
      if (nav && isDesktop() && toc.open) {
        var navRect = nav.getBoundingClientRect();
        var navTop = navRect.top;
        var navScroll = nav.scrollTop;
        navHeight = nav.clientHeight;
        linkBounds = links.map(function (link) {
          var bounds = link.getBoundingClientRect();
          return { top: bounds.top - navTop + navScroll, bottom: bounds.bottom - navTop + navScroll };
        });
      } else {
        linkBounds = [];
      }
      dirty = false;
    }
    function keepActiveVisible(index) {
      if (!nav || !isDesktop() || !toc.open || !linkBounds[index] || navHeight <= 0) return;
      var bounds = linkBounds[index];
      var top = nav.scrollTop;
      if (bounds.top < top + 8) nav.scrollTop = Math.max(0, bounds.top - 8);
      else if (bounds.bottom > top + navHeight - 8) nav.scrollTop = bounds.bottom - navHeight + 8;
    }
    function render() {
      raf = 0;
      if (suspended || printing || document.hidden) return;
      if (dirty) measure();
      var y = scrollY();
      if (bar) {
        var start = contentTop - headerHeight;
        var end = contentBottom - viewportHeight;
        // If the entire article fits, its end is already visible.
        var value = end <= start ? (y >= end ? 1 : 0) : Math.max(0, Math.min(1, (y - start) / (end - start)));
        if (value !== lastProgress) {
          bar.style.transform = "scaleX(" + value.toFixed(4) + ")";
          lastProgress = value;
        }
        progress.hidden = false;
      }
      if (!headingTops.length) return;
      // CSS uses the masthead height rounded up, plus a 24px anchor margin.
      // Native fragment scrolling can land a fraction of a pixel below that
      // line, so allow 1px without pinning the active item to the URL hash.
      var threshold = y + Math.ceil(headerHeight) + 24 + 1;
      var low = 0;
      var high = headingTops.length - 1;
      while (low < high) {
        var middle = Math.ceil((low + high) / 2);
        if (headingTops[middle] <= threshold) low = middle;
        else high = middle - 1;
      }
      if (low === active) return;
      if (active >= 0) links[active].removeAttribute("aria-current");
      active = low;
      links[active].setAttribute("aria-current", "location");
      keepActiveVisible(active);
    }
    function schedule(needsMeasure) {
      if (needsMeasure) dirty = true;
      if (suspended || printing || document.hidden || raf) return;
      if (window.requestAnimationFrame) raf = window.requestAnimationFrame(render);
      else render();
    }
    function resize() { schedule(true); }
    function breakpoint() {
      if (links.length) toc.open = isDesktop();
      resize();
    }
    function watchMedia(media, callback) {
      if (!media) return;
      if (media.addEventListener) media.addEventListener("change", callback);
      else if (media.addListener) media.addListener(callback);
    }
    breakpoint();
    watchMedia(desktop, breakpoint);
    watchMedia(print, function (event) {
      printing = event.matches;
      if (printing) cancel();
      else resize();
    });
    if (links.length) toc.addEventListener("toggle", resize);
    window.addEventListener("scroll", function () { schedule(false); }, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("hashchange", resize);
    window.addEventListener("pagehide", function () { suspended = true; cancel(); });
    window.addEventListener("pageshow", function () { suspended = false; resize(); });
    window.addEventListener("beforeprint", function () { printing = true; cancel(); });
    window.addEventListener("afterprint", function () { printing = false; resize(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancel();
      else resize();
    });
    // Images, math rendering and fonts can move sections long after DOMContentLoaded.
    content.addEventListener("load", resize, true);
    if (window.ResizeObserver) {
      var observer = new window.ResizeObserver(resize);
      observer.observe(content);
      if (masthead) observer.observe(masthead);
      if (nav) observer.observe(nav);
    }
    if (window.MutationObserver) {
      var mutations = new window.MutationObserver(resize);
      mutations.observe(content, { childList: true, subtree: true, characterData: true });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());
