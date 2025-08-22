document.addEventListener('DOMContentLoaded', () => {
    const linksContainer = document.getElementById('links-container');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const resetButton = document.getElementById('reset-button');

    const defaultLinks = {
        "anime": [
            { name: "AnimeFLV", url: "https://www3.animeflv.net/" },
            { name: "Jkanime", url: "https://jkanime.net/" }
        ],
        "dev": [
            { name: "ChatGPT", url: "https://chatgpt.com/" },
            { name: "Gemini AI", url: "https://gemini.google.com/" },
            { name: "Github", url: "https://github.com/" },
            { name: "You AI", url: "https://you.com/" }
        ],
        "random": [
            { name: "Pinterest", url: "https://www.pinterest.com/" },
            { name: "YouTube", url: "https://www.youtube.com" }
        ],
        "redes sociales": [
            { name: "Facebook Marketplace", url: "https://www.facebook.com/marketplace/" },
            { name: "Instagram", url: "https://www.instagram.com/" },
            { name: "TikTok", url: "https://www.tiktok.com/" },
            { name: "Twitch", url: "https://www.twitch.tv/" },
            { name: "X", url: "https://x.com/" }
        ]
    };
    const defaultOrder = Object.keys(defaultLinks);

    loadInitialConfig();

    addCategoryBtn.addEventListener('click', addNewCategory);
    resetButton.addEventListener('click', resetToDefault);

    function loadInitialConfig() {
        chrome.storage.sync.get([
            'links',
            'categoryOrder'
        ], (data) => {
            let links = data.links || defaultLinks;
            let order = data.categoryOrder || Object.keys(links);
            Object.keys(links).forEach(cat => {
                if (!order.includes(cat)) order.push(cat);
            });
            loadLinks(links, order);
        });
    }

    function loadLinks(linksData, orderArr) {
        linksContainer.innerHTML = '';
        const links = linksData || {};
        const order = orderArr || Object.keys(links);
        order.forEach(category => {
            if (links[category]) {
                createCategoryElement(category, links[category], order);
            }
        });
    }

    function createCategoryElement(category, links, order) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-container';

        const categoryEditDiv = document.createElement('div');
        categoryEditDiv.className = 'category-edit';

        const categoryInput = document.createElement('input');
        categoryInput.type = 'text';
        categoryInput.value = category;
        categoryInput.className = 'category-name-input';

        const saveCategoryBtn = document.createElement('button');
        saveCategoryBtn.className = 'save-category';
        saveCategoryBtn.textContent = 'Guardar';

        const deleteCategoryBtn = document.createElement('button');
        deleteCategoryBtn.className = 'delete-category';
        deleteCategoryBtn.textContent = 'Eliminar';

        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.title = 'Subir categoría';
        upBtn.addEventListener('click', () => moveCategory(category, -1));

        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.title = 'Bajar categoría';
        downBtn.addEventListener('click', () => moveCategory(category, 1));

        categoryEditDiv.appendChild(upBtn);
        categoryEditDiv.appendChild(downBtn);
        categoryEditDiv.appendChild(categoryInput);
        categoryEditDiv.appendChild(saveCategoryBtn);
        categoryEditDiv.appendChild(deleteCategoryBtn);

        const ul = document.createElement('ul');
        links.forEach(link => {
            ul.appendChild(createLinkElement(link.name, link.url, ul));
        });

        const addLinkBtn = document.createElement('button');
        addLinkBtn.className = 'add-link-btn';
        addLinkBtn.textContent = '+ Añadir Enlace';
        addLinkBtn.addEventListener('click', () => {
            ul.appendChild(createLinkElement('', '', ul));
        });

        saveCategoryBtn.addEventListener('click', () => {
            const newCategoryName = categoryInput.value.trim();
            if (!newCategoryName) {
                alert('El nombre de la categoría no puede estar vacío');
                return;
            }
            const newLinks = [];
            ul.querySelectorAll('li').forEach(li => {
                const name = li.querySelector('.link-name').value.trim();
                let url = li.querySelector('.link-url').value.trim();
                if (name && url) {
                    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                    newLinks.push({ name, url });
                }
            });
            chrome.storage.sync.get(['links', 'categoryOrder'], (data) => {
                const links = data.links || {};
                let order = data.categoryOrder || Object.keys(links);
                if (newCategoryName !== category) {
                    if (links[newCategoryName]) {
                        alert('Ya existe una categoría con ese nombre');
                        return;
                    }
                    delete links[category];
                    order = order.map(cat => cat === category ? newCategoryName : cat);
                }
                links[newCategoryName] = newLinks;
                chrome.storage.sync.set({ links, categoryOrder: order }, () => {
                    chrome.storage.sync.get(['links', 'categoryOrder'], (fresh) => {
                        loadLinks(fresh.links, fresh.categoryOrder);
                    });
                });
            });
        });

        deleteCategoryBtn.addEventListener('click', () => {
            if (confirm(`¿Eliminar la categoría "${category}" y todos sus enlaces?`)) {
                chrome.storage.sync.get(['links', 'categoryOrder'], (data) => {
                    const links = data.links || {};
                    let order = data.categoryOrder || Object.keys(links);
                    delete links[category];
                    order = order.filter(cat => cat !== category);
                    chrome.storage.sync.set({ links, categoryOrder: order }, () => loadLinks(links, order));
                });
            }
        });

        categoryDiv.appendChild(categoryEditDiv);
        categoryDiv.appendChild(addLinkBtn);
        categoryDiv.appendChild(ul);
        linksContainer.appendChild(categoryDiv);
    }

    function createLinkElement(name, url, ul) {
        const li = document.createElement('li');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = name;
        nameInput.className = 'link-name';

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.value = url;
        urlInput.className = 'link-url';

        const saveLinkBtn = document.createElement('button');
        saveLinkBtn.className = 'save-link';
        saveLinkBtn.textContent = 'Guardar';

        const deleteLinkBtn = document.createElement('button');
        deleteLinkBtn.className = 'delete-link';
        deleteLinkBtn.textContent = 'Eliminar';

        saveLinkBtn.addEventListener('click', () => {
            const categoryDiv = li.closest('.category-container');
            const categoryInput = categoryDiv.querySelector('.category-name-input');
            const categoryName = categoryInput.value.trim();
            const newLinks = [];
            ul.querySelectorAll('li').forEach(l => {
                const n = l.querySelector('.link-name').value.trim();
                let u = l.querySelector('.link-url').value.trim();
                if (n && u) {
                    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
                    newLinks.push({ name: n, url: u });
                }
            });
            chrome.storage.sync.get(['links', 'categoryOrder'], (data) => {
                const links = data.links || {};
                links[categoryName] = newLinks;
                chrome.storage.sync.set({ links }, () => loadLinks(links, data.categoryOrder));
            });
        });

        deleteLinkBtn.addEventListener('click', () => {
            if (confirm('¿Eliminar este enlace?')) {
                // Primero elimina el li del DOM
                li.remove();
                // Luego guarda el nuevo estado
                const categoryDiv = ul.closest('.category-container');
                const categoryInput = categoryDiv.querySelector('.category-name-input');
                const categoryName = categoryInput.value.trim();
                const newLinks = [];
                ul.querySelectorAll('li').forEach(l => {
                    const n = l.querySelector('.link-name').value.trim();
                    let u = l.querySelector('.link-url').value.trim();
                    if (n && u) {
                        if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
                        newLinks.push({ name: n, url: u });
                    }
                });
                chrome.storage.sync.get(['links', 'categoryOrder'], (data) => {
                    const links = data.links || {};
                    links[categoryName] = newLinks;
                    chrome.storage.sync.set({ links }, () => {
                        loadLinks(links, data.categoryOrder);
                    });
                });
            }
        });

        li.appendChild(nameInput);
        li.appendChild(urlInput);
        li.appendChild(saveLinkBtn);
        li.appendChild(deleteLinkBtn);
        return li;
    }

    function addNewCategory() {
        const categoryName = prompt('Nombre de la nueva categoría:');
        if (categoryName && categoryName.trim()) {
            chrome.storage.sync.get(['links', 'categoryOrder'], (data) => {
                const links = data.links || {};
                let order = data.categoryOrder || Object.keys(links);
                if (links[categoryName]) {
                    alert('Ya existe una categoría con ese nombre');
                    return;
                }
                links[categoryName] = [];
                order.push(categoryName);
                chrome.storage.sync.set({ links, categoryOrder: order }, () => loadLinks(links, order));
            });
        }
    }

    function moveCategory(category, direction) {
        chrome.storage.sync.get(['links', 'categoryOrder'], (data) => {
            const links = data.links || {};
            let order = data.categoryOrder || Object.keys(links);
            const idx = order.indexOf(category);
            if (idx === -1) return;
            const newIdx = idx + direction;
            if (newIdx < 0 || newIdx >= order.length) return;
            [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
            chrome.storage.sync.set({ categoryOrder: order }, () => loadLinks(links, order));
        });
    }

    function resetToDefault() {
        if (confirm('¿Restablecer TODA la configuración a valores por defecto?')) {
            const defaultSettings = {
                links: defaultLinks,
                categoryOrder: defaultOrder
            };
            chrome.storage.sync.set(defaultSettings, () => {
                loadLinks(defaultLinks, defaultOrder);
                alert('Configuración restablecida completamente');
            });
        }
    }
});