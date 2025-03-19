document.addEventListener('DOMContentLoaded', () => {
    const linksContainer = document.getElementById('links-container');
    const resetButton = document.getElementById('reset-button');
    const toggleGithub = document.getElementById('toggle-github');
    const mainImageUpload = document.getElementById('main-image-upload');
    const mainImageUploadBtn = document.getElementById('main-image-upload-btn');
    const noLinksImageUpload = document.getElementById('no-links-image-upload');
    const noLinksImageUploadBtn = document.getElementById('no-links-image-upload-btn');
    const clearImagesBtn = document.getElementById('clear-images-button');

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

    function handleImageUpload(input, key) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const imageData = reader.result;  // Imagen en base64
            chrome.storage.local.set({ [key]: imageData }, () => {
                alert('Imagen subida con éxito.');

                // Enviar un mensaje a newtab.html para actualizar la imagen
                chrome.runtime.sendMessage({ action: 'updateImages' });
            });
        };
        reader.readAsDataURL(file);
    }

    mainImageUploadBtn.addEventListener('click', () => {
        handleImageUpload(mainImageUpload, 'mainImage');
    });

    noLinksImageUploadBtn.addEventListener('click', () => {
        handleImageUpload(noLinksImageUpload, 'noLinksImage');
    });

    clearImagesBtn.addEventListener('click', () => {
        chrome.storage.local.remove(['mainImage', 'noLinksImage'], () => {
            alert('Imágenes personalizadas eliminadas.');
            chrome.runtime.sendMessage({ action: 'updateImages' });
        });
    });

    function initializeLinks() {
        chrome.storage.sync.get(['links', 'hideGithub'], (data) => {
            if (!data.links) {
                chrome.storage.sync.set({ links: defaultLinks }, loadLinks);
            } else {
                loadLinks();
            }
            
            const isHidden = data.hideGithub ?? false;
            toggleGithub.checked = isHidden;
        });
    }

    const toggleAnimeFetch = document.getElementById('toggle-anime-fetch');

    chrome.storage.sync.get('disableAnimeFetch', (data) => {
        toggleAnimeFetch.checked = data.disableAnimeFetch ?? false;
    });
    
    toggleAnimeFetch.addEventListener('change', () => {
        const isDisabled = toggleAnimeFetch.checked;
        chrome.storage.sync.set({ disableAnimeFetch: isDisabled }, () => {
            // Enviar mensaje a script.js para actualizar la imagen
            chrome.runtime.sendMessage({ action: 'toggleAnime' });
        });
    });

    initializeLinks();

    toggleGithub.addEventListener('change', () => {
        const isHidden = toggleGithub.checked;
        chrome.storage.sync.set({ hideGithub: isHidden }, loadLinks);
    });

    resetButton.addEventListener('click', () => {
        chrome.storage.sync.set({ links: defaultLinks }, loadLinks);
    });

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

    function normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    }

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

    function deleteCategory(category) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};
            delete links[category];

            chrome.storage.sync.set({ links }, loadLinks);
        });
    }

    function saveLink(category, index, newName, newUrl) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};

            if (newName.trim() && newUrl.trim()) {
                links[category][index] = { name: newName, url: newUrl };

                chrome.storage.sync.set({ links }, loadLinks);
            }
        });
    }

    function deleteLink(category, index) {
        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};
            links[category].splice(index, 1);
            chrome.storage.sync.set({ links }, loadLinks);
        });
    }

    function createAddCategoryButton() {
        // Implement this function to create a button that allows adding new categories
    }
});