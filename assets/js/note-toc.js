(() => {
  const content = document.querySelector('[data-note-content]');
  const toc = document.querySelector('[data-note-toc]');
  const list = document.querySelector('[data-note-toc-list]');
  if (!content || !toc || !list) return;

  const headings = Array.from(content.querySelectorAll('h2, h3')).filter(
    heading => heading.textContent.trim() && !heading.classList.contains('no_toc')
  );
  if (headings.length < 2) return;

  let parentItem = null;
  headings.forEach((heading, index) => {
    if (!heading.id) {
      let id = `note-section-${index + 1}`;
      while (document.getElementById(id)) id += '-section';
      heading.id = id;
    }

    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${encodeURIComponent(heading.id)}`;
    link.textContent = heading.textContent.trim();
    item.append(link);

    if (heading.tagName === 'H3' && parentItem) {
      let nestedList = parentItem.querySelector('ol');
      if (!nestedList) {
        nestedList = document.createElement('ol');
        parentItem.append(nestedList);
      }
      nestedList.append(item);
    } else {
      list.append(item);
      if (heading.tagName === 'H2') parentItem = item;
    }
  });

  toc.hidden = false;
})();
