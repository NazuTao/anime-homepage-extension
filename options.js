<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    const linksContainer = document.getElementById('links-container');
    const resetButton = document.getElementById('reset-button');
    const toggleGithub = document.getElementById('toggle-github');

    const defaultLinks = {
        "random": [
            { name: "YouTube", url: "https://www.youtube.com" },
            { name: "Pinterest", url: "https://www.pinterest.com/" }
        ],
        "dev": [
            { name: "You AI", url: "https://you.com/" },
            { name: "Gemini AI", url: "https://gemini.google.com/" },
            { name: "ChatGPT", url: "https://chatgpt.com/" },
            { name: "Github", url: "https://github.com/" }
        ],
        "redes sociales": [
            { name: "X", url: "https://x.com/" },
            { name: "Twitch", url: "https://www.twitch.tv/" },
            { name: "Instagram", url: "https://www.instagram.com/" },
            { name: "Facebook Marketplace", url: "https://www.facebook.com/marketplace/" },
            { name: "TikTok", url: "https://www.tiktok.com/" }
        ],
        "anime": [
            { name: "AnimeFLV", url: "https://www3.animeflv.net/" },
            { name: "Jkanime", url: "https://jkanime.net/" }
        ]
    };

    // ✅ Inicializar enlaces y estado del switch de GitHub
    function initializeLinks() {
        chrome.storage.sync.get(['links', 'hideGithub'], (data) => {
            if (!data.links) {
                chrome.storage.sync.set({ links: defaultLinks }, loadLinks);
            } else {
                loadLinks();
            }
            
            // ✅ Inicializar el estado del switch
            const isHidden = data.hideGithub ?? false;
            toggleGithub.checked = isHidden;
        });
    }
    const toggleAnimeFetch = document.getElementById('toggle-anime-fetch');

    // Inicializar el estado del switch
    chrome.storage.sync.get('disableAnimeFetch', (data) => {
        toggleAnimeFetch.checked = data.disableAnimeFetch ?? false;
    });
    
    // Guardar el estado del switch
    toggleAnimeFetch.addEventListener('change', () => {
        const isDisabled = toggleAnimeFetch.checked;
        chrome.storage.sync.set({ disableAnimeFetch: isDisabled });
    });
    initializeLinks();

    // ✅ Guardar el estado del switch de GitHub
    toggleGithub.addEventListener('change', () => {
        const isHidden = toggleGithub.checked;
        chrome.storage.sync.set({ hideGithub: isHidden }, loadLinks);
    });

    // ✅ Restablecer a valores predeterminados
    resetButton.addEventListener('click', () => {
        chrome.storage.sync.set({ links: defaultLinks }, loadLinks);
    });

    // ✅ Cargar enlaces
    function loadLinks() {
        linksContainer.innerHTML = '';

        chrome.storage.sync.get(['links', 'hideGithub'], (data) => {
            const links = data.links || {};
            const hideGithub = data.hideGithub ?? false;

            if (Object.keys(links).length === 0) {
                createAddCategoryButton();
                return;
            }

            for (const category in links) {
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
                saveCategoryBtn.setAttribute('data-category', category);
                saveCategoryBtn.innerHTML = '💾';

                const deleteCategoryBtn = document.createElement('button');
                deleteCategoryBtn.className = 'delete-category';
                deleteCategoryBtn.setAttribute('data-category', category);
                deleteCategoryBtn.textContent = '🗑️';

                categoryEditDiv.appendChild(categoryInput);
                categoryEditDiv.appendChild(saveCategoryBtn);
                categoryEditDiv.appendChild(deleteCategoryBtn);

                const addLinkBtn = document.createElement('button');
                addLinkBtn.textContent = 'Agregar Enlace';
                addLinkBtn.className = 'add-link-btn';

                if (links[category].length >= 5) {
                    addLinkBtn.disabled = true;
                }

                addLinkBtn.addEventListener('click', () => {
                    addNewLink(category);
                });

                const ul = document.createElement('ul');

                links[category].forEach((link, index) => {
                    // ✅ Ocultar el enlace de GitHub si el switch está activado
                    if (hideGithub && link.name.toLowerCase() === 'github') {
                        return; 
                    }

                    const li = document.createElement('li');
                    li.innerHTML = `
                        <input type="text" value="${link.name}" class="link-name" />
                        <input type="text" value="${link.url}" class="link-url" />
                        <button class="save-link" data-category="${category}" data-index="${index}">💾</button>
                        <button class="delete-link" data-category="${category}" data-index="${index}">🗑️</button>
                    `;
                    ul.appendChild(li);
                });

                categoryDiv.appendChild(categoryEditDiv);
                categoryDiv.appendChild(addLinkBtn);
                categoryDiv.appendChild(ul);
                linksContainer.appendChild(categoryDiv);
            }
        });
    }

    // ✅ Delegación de eventos para manejar clics dinámicos
    linksContainer.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('save-category')) {
            const category = target.getAttribute('data-category');
            const newName = target.parentElement.querySelector('.category-name-input').value;
            renameCategory(category, newName);
        }

        if (target.classList.contains('delete-category')) {
            const category = target.getAttribute('data-category');
            deleteCategory(category);
        }

        if (target.classList.contains('save-link')) {
            const category = target.getAttribute('data-category');
            const index = target.getAttribute('data-index');
            const li = target.closest('li');
            const newName = li.querySelector('.link-name').value;
            const newUrl = normalizeUrl(li.querySelector('.link-url').value);
            saveLink(category, index, newName, newUrl);
        }

        if (target.classList.contains('delete-link')) {
            const category = target.getAttribute('data-category');
            const index = target.getAttribute('data-index');
            deleteLink(category, index);
        }
    });

    // ✅ Agregar nuevo enlace con límite de 5
    function addNewLink(category) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};

            if (links[category].length >= 5) {
                alert('No puedes agregar más de 5 enlaces en esta categoría.');
                return;
            }

            const linkName = prompt('Nombre del nuevo enlace:');
            let linkUrl = prompt('URL del nuevo enlace:');

            if (linkName && linkUrl) {
                linkUrl = normalizeUrl(linkUrl);

                links[category].push({ name: linkName, url: linkUrl });

                chrome.storage.sync.set({ links }, loadLinks);
            }
        });
    }

    // ✅ Normalizar URL
    function normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    }

    // ✅ Renombrar categoría
    function renameCategory(oldName, newName) {
        if (!newName.trim()) return;

        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};

            if (links[newName]) {
                alert('Ya existe una categoría con ese nombre.');
                return;
            }

            links[newName] = links[oldName];
            delete links[oldName];

            chrome.storage.sync.set({ links }, loadLinks);
        });
    }

    // ✅ Eliminar categoría
    function deleteCategory(category) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};
            delete links[category];

            chrome.storage.sync.set({ links }, loadLinks);
        });
    }

    // ✅ Guardar enlace
    function saveLink(category, index, newName, newUrl) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};

            if (newName.trim() && newUrl.trim()) {
                links[category][index] = { name: newName, url: newUrl };

                chrome.storage.sync.set({ links }, loadLinks);
            }
        });
    }

    // ✅ Eliminar enlace
    function deleteLink(category, index) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};
            links[category].splice(index, 1);
            chrome.storage.sync.set({ links }, loadLinks);
        });
    }
});
=======
document.addEventListener('DOMContentLoaded', () => {
    const linksContainer = document.getElementById('links-container');
    const resetButton = document.getElementById('reset-button');
    const toggleGithub = document.getElementById('toggle-github');

    const defaultLinks = {
        "random": [
            { name: "YouTube", url: "https://www.youtube.com" },
            { name: "Pinterest", url: "https://www.pinterest.com/" }
        ],
        "dev": [
            { name: "You AI", url: "https://you.com/" },
            { name: "Gemini AI", url: "https://gemini.google.com/" },
            { name: "ChatGPT", url: "https://chatgpt.com/" },
            { name: "Github", url: "https://github.com/" }
        ],
        "redes sociales": [
            { name: "X", url: "https://x.com/" },
            { name: "Twitch", url: "https://www.twitch.tv/" },
            { name: "Instagram", url: "https://www.instagram.com/" },
            { name: "Facebook Marketplace", url: "https://www.facebook.com/marketplace/" },
            { name: "TikTok", url: "https://www.tiktok.com/" }
        ],
        "anime": [
            { name: "AnimeFLV", url: "https://www3.animeflv.net/" },
            { name: "Jkanime", url: "https://jkanime.net/" }
        ]
    };

    // ✅ Inicializar enlaces y estado del switch de GitHub
    function initializeLinks() {
        chrome.storage.sync.get(['links', 'hideGithub'], (data) => {
            if (!data.links) {
                chrome.storage.sync.set({ links: defaultLinks }, loadLinks);
            } else {
                loadLinks();
            }
            
            // ✅ Inicializar el estado del switch
            const isHidden = data.hideGithub ?? false;
            toggleGithub.checked = isHidden;
        });
    }
    const toggleAnimeFetch = document.getElementById('toggle-anime-fetch');

    // Inicializar el estado del switch
    chrome.storage.sync.get('disableAnimeFetch', (data) => {
        toggleAnimeFetch.checked = data.disableAnimeFetch ?? false;
    });
    
    // Guardar el estado del switch
    toggleAnimeFetch.addEventListener('change', () => {
        const isDisabled = toggleAnimeFetch.checked;
        chrome.storage.sync.set({ disableAnimeFetch: isDisabled });
    });
    initializeLinks();

    // ✅ Guardar el estado del switch de GitHub
    toggleGithub.addEventListener('change', () => {
        const isHidden = toggleGithub.checked;
        chrome.storage.sync.set({ hideGithub: isHidden }, loadLinks);
    });

    // ✅ Restablecer a valores predeterminados
    resetButton.addEventListener('click', () => {
        chrome.storage.sync.set({ links: defaultLinks }, loadLinks);
    });

    // ✅ Cargar enlaces
    function loadLinks() {
        linksContainer.innerHTML = '';

        chrome.storage.sync.get(['links', 'hideGithub'], (data) => {
            const links = data.links || {};
            const hideGithub = data.hideGithub ?? false;

            if (Object.keys(links).length === 0) {
                createAddCategoryButton();
                return;
            }

            for (const category in links) {
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
                saveCategoryBtn.setAttribute('data-category', category);
                saveCategoryBtn.innerHTML = '💾';

                const deleteCategoryBtn = document.createElement('button');
                deleteCategoryBtn.className = 'delete-category';
                deleteCategoryBtn.setAttribute('data-category', category);
                deleteCategoryBtn.textContent = '🗑️';

                categoryEditDiv.appendChild(categoryInput);
                categoryEditDiv.appendChild(saveCategoryBtn);
                categoryEditDiv.appendChild(deleteCategoryBtn);

                const addLinkBtn = document.createElement('button');
                addLinkBtn.textContent = 'Agregar Enlace';
                addLinkBtn.className = 'add-link-btn';

                if (links[category].length >= 5) {
                    addLinkBtn.disabled = true;
                }

                addLinkBtn.addEventListener('click', () => {
                    addNewLink(category);
                });

                const ul = document.createElement('ul');

                links[category].forEach((link, index) => {
                    // ✅ Ocultar el enlace de GitHub si el switch está activado
                    if (hideGithub && link.name.toLowerCase() === 'github') {
                        return; 
                    }

                    const li = document.createElement('li');
                    li.innerHTML = `
                        <input type="text" value="${link.name}" class="link-name" />
                        <input type="text" value="${link.url}" class="link-url" />
                        <button class="save-link" data-category="${category}" data-index="${index}">💾</button>
                        <button class="delete-link" data-category="${category}" data-index="${index}">🗑️</button>
                    `;
                    ul.appendChild(li);
                });

                categoryDiv.appendChild(categoryEditDiv);
                categoryDiv.appendChild(addLinkBtn);
                categoryDiv.appendChild(ul);
                linksContainer.appendChild(categoryDiv);
            }
        });
    }

    // ✅ Delegación de eventos para manejar clics dinámicos
    linksContainer.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('save-category')) {
            const category = target.getAttribute('data-category');
            const newName = target.parentElement.querySelector('.category-name-input').value;
            renameCategory(category, newName);
        }

        if (target.classList.contains('delete-category')) {
            const category = target.getAttribute('data-category');
            deleteCategory(category);
        }

        if (target.classList.contains('save-link')) {
            const category = target.getAttribute('data-category');
            const index = target.getAttribute('data-index');
            const li = target.closest('li');
            const newName = li.querySelector('.link-name').value;
            const newUrl = normalizeUrl(li.querySelector('.link-url').value);
            saveLink(category, index, newName, newUrl);
        }

        if (target.classList.contains('delete-link')) {
            const category = target.getAttribute('data-category');
            const index = target.getAttribute('data-index');
            deleteLink(category, index);
        }
    });

    // ✅ Agregar nuevo enlace con límite de 5
    function addNewLink(category) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};

            if (links[category].length >= 5) {
                alert('No puedes agregar más de 5 enlaces en esta categoría.');
                return;
            }

            const linkName = prompt('Nombre del nuevo enlace:');
            let linkUrl = prompt('URL del nuevo enlace:');

            if (linkName && linkUrl) {
                linkUrl = normalizeUrl(linkUrl);

                links[category].push({ name: linkName, url: linkUrl });

                chrome.storage.sync.set({ links }, loadLinks);
            }
        });
    }

    // ✅ Normalizar URL
    function normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    }

    // ✅ Renombrar categoría
    function renameCategory(oldName, newName) {
        if (!newName.trim()) return;

        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};

            if (links[newName]) {
                alert('Ya existe una categoría con ese nombre.');
                return;
            }

            links[newName] = links[oldName];
            delete links[oldName];

            chrome.storage.sync.set({ links }, loadLinks);
        });
    }

    // ✅ Eliminar categoría
    function deleteCategory(category) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};
            delete links[category];

            chrome.storage.sync.set({ links }, loadLinks);
        });
    }

    // ✅ Guardar enlace
    function saveLink(category, index, newName, newUrl) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};

            if (newName.trim() && newUrl.trim()) {
                links[category][index] = { name: newName, url: newUrl };

                chrome.storage.sync.set({ links }, loadLinks);
            }
        });
    }

    // ✅ Eliminar enlace
    function deleteLink(category, index) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};
            links[category].splice(index, 1);
            chrome.storage.sync.set({ links }, loadLinks);
        });
    }
});
>>>>>>> e83b390ccf7638c0ac8f46f0571506ea4599be8f
