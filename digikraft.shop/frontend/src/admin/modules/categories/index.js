// MODULE: CATEGORIES
export function render() {
  const { State, UI } = window.AdminCore;
  const cats = State.categories;
  return `
  <div class="page-header">
    <div><div class="page-title">Categories</div><div class="page-subtitle">${cats.length} categories</div></div>
    <div class="header-actions">
      <button class="btn btn-primary" onclick="window.AdminModules.categories.addCategory()"><i class="fas fa-plus"></i> Add Category</button>
    </div>
  </div>
  <div class="card">
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
      ${cats.map((cat,i)=>`
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;align-items:center;justify-content:space-between;transition:.2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
        <div>
          <div style="font-weight:700;font-size:15px">${cat}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:3px">${State.products.filter(p=>p.category===cat).length} products</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="window.AdminModules.categories.rename(${i},'${cat}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="window.AdminModules.categories.remove(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

export function addCategory() {
  const { State, UI } = window.AdminCore;
  const name = prompt('Category name:');
  if (!name || State.categories.includes(name)) return;
  const cats = State.categories; cats.push(name); State.categories = cats;
  UI.toast('Category added!'); window.AdminApp.render();
}

export function rename(i, old) {
  const { State, UI } = window.AdminCore;
  const name = prompt('Rename category:', old);
  if (!name || name === old) return;
  const cats = State.categories; cats[i] = name; State.categories = cats;
  UI.toast('Category renamed!'); window.AdminApp.render();
}

export function remove(i) {
  const { State, UI } = window.AdminCore;
  if (!confirm('Delete this category?')) return;
  const cats = State.categories; cats.splice(i,1); State.categories = cats;
  UI.toast('Category deleted','error'); window.AdminApp.render();
}
