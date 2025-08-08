document.addEventListener('DOMContentLoaded', () => {
  const DOM = {
    searchInput: document.getElementById('search-input'),
    linksContainer: document.querySelector('.links'),    
    toggleAnimeFetch: document.getElementById('toggle-anime-fetch'),
    toggleGithub: document.getElementById('toggle-github'),
    toggleBanner: document.getElementById('toggle-banner'),
    imageBanner: document.getElementById('image-banner'),
    githubButton: document.querySelector('.tooltip-container'),
    animeImage: document.getElementById('anime-image'),
    imageBannerElement: document.getElementById('image-banner')?.querySelector('img'),
    dateTimeElement: document.querySelector(".date-time"),
    categoryTextColor: document.getElementById('category-text-color'),
    linkTextColor: document.getElementById('link-text-color'),
    applyTextColors: document.getElementById('apply-text-colors'),
    resetButton: document.getElementById('reset-button'),
    mainImageUpload: document.getElementById('main-image-upload'),
    mainImageUploadBtn: document.getElementById('main-image-upload-btn'),
    imageBannerUpload: document.getElementById('image-banner-upload'),
    imageBannerUploadBtn: document.getElementById('image-banner-upload-btn'),
    clearImagesBtn: document.getElementById('clear-images-button'),
    colorPickerBody: document.getElementById('color-picker-body'),
    colorPickerContainer: document.getElementById('color-picker-container'),
    colorPickerSearchBar: document.getElementById('color-picker-searchbar'),
    applyColorsBtn: document.getElementById('apply-colors-btn'),
    resetColorsBtn: document.getElementById('reset-colors-btn'),
    menuIcon: document.querySelector('.menu-icon'),
    popupSettings: document.getElementById('popup-settings'),
    closePopup: document.getElementById('close-popup')
  };

  const DEFAULT_CONFIG = {
    links: {
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
    },
    colors: {
      body: '#1e1e2e',
      container: '#282a36',
      searchBar: '#44475a'
    },
    textColors: {
      category: '#c792ea',
      link: '#ffffff'
    },
    MAX_IMAGE_SIZE: 6 * 1024 * 1024
  };

  const ImageManager = {
    handleUpload: (input, key) => {
      const file = input.files[0];
      if (!file) return;
      if (file.size > DEFAULT_CONFIG.MAX_IMAGE_SIZE) return alert('Imagen demasiado grande');
      const reader = new FileReader();
      reader.onload = () => {
        file.type === 'image/gif'
          ? ImageManager.store(reader.result, key)
          : ImageManager.compress(reader.result, 0.8, key);
      };
      reader.readAsDataURL(file);
    },
    compress: (dataUrl, quality, key) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        ImageManager.store(canvas.toDataURL('image/jpeg', quality), key);
      };
    },
    store: (imageData, key) => {
      chrome.storage.local.set({ [key]: imageData }, () => {
        ImageManager.loadCustomImages();
      });
    },
    loadCustomImages: (callback) => {
      chrome.storage.sync.get('hideBanner', (config) => {
        const hideBanner = config.hideBanner ?? false;
        chrome.storage.local.get(['mainImage', 'imageBanner'], (data) => {
          if (data.mainImage) DOM.animeImage.src = data.mainImage;
          else DOM.animeImage.src = chrome.runtime.getURL('images/default-anime.jpg');
          if (DOM.imageBannerElement) {
            DOM.imageBannerElement.src = data.imageBanner || chrome.runtime.getURL('images/default-banner.jpg');
          }
          DOM.imageBanner.style.display = hideBanner ? 'none' : 'block';
          if (callback) callback(!!(data.mainImage || data.imageBanner));
        });
      });
    },
    loadImage: () => {
      chrome.storage.sync.get('disableAnimeFetch', (config) => {
        const isDisabled = config.disableAnimeFetch ?? false;
        if (!isDisabled) ImageManager.fetchRandomAnimeImage();
        ImageManager.loadCustomImages();
      });
    },
    fetchRandomAnimeImage: () => {
      fetch('https://api.waifu.pics/sfw/waifu')
        .then(res => res.json())
        .then(data => { DOM.animeImage.src = data.url })
        .catch(() => { DOM.animeImage.src = '' });
    },
    clear: () => {
      chrome.storage.local.remove(['mainImage', 'imageBanner'], () => {
        alert('Imágenes eliminadas.');
        ImageManager.loadCustomImages();
      });
    }
  };

  const LinkManager = {
    loadLinks: () => {
      DOM.linksContainer.innerHTML = '';
      chrome.storage.sync.get(['links', 'textColors', 'categoryOrder'], (data) => {
        const links = data.links || DEFAULT_CONFIG.links;
        const colors = data.textColors || DEFAULT_CONFIG.textColors;
        const order = data.categoryOrder || Object.keys(links);

        order.forEach(category => {
          if (!links[category]) return;
          const catDiv = document.createElement('div');
          catDiv.className = 'category';
          const title = document.createElement('h2');
          title.textContent = `~${category}`;
          title.style.color = colors.category;

          const ul = document.createElement('ul');
          links[category].forEach(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = link.name;
            a.href = link.url;
            a.target = '_self';
            a.style.textDecoration = 'none';
            a.style.color = colors.link;
            li.appendChild(a);
            ul.appendChild(li);
          });

          catDiv.appendChild(title);
          catDiv.appendChild(ul);
          DOM.linksContainer.appendChild(catDiv);
        });
      });
    },

    initializeLinks: () => {
      chrome.storage.sync.get(['links', 'textColors'], (data) => {
        if (!data.links) {
          chrome.storage.sync.set({ 
            links: DEFAULT_CONFIG.links,
            textColors: DEFAULT_CONFIG.textColors 
          }, LinkManager.loadLinks);
        } else {
          LinkManager.loadLinks();
        }
      });
    },

    openEditPopup: () => {
      if (DOM.popupSettings) DOM.popupSettings.style.display = 'none';
      DOM.editCategoriesPopup.style.display = 'flex';
      LinkManager.loadLinksForEditing();
    },

    loadLinksForEditing: () => {
      DOM.editableCategories.innerHTML = '';
      chrome.storage.sync.get('links', (data) => {
        const links = data.links || DEFAULT_CONFIG.links;
        
        for (const category in links) {
          LinkManager.createEditableCategory(category, links[category]);
        }
      });
    },

    createEditableCategory: (categoryName, links) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'editable-category';

      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'category-header';

      const categoryInput = document.createElement('input');
      categoryInput.value = categoryName;
      categoryInput.className = 'category-name-input';
      categoryInput.placeholder = 'Nombre de categoría';

      const deleteCategoryBtn = document.createElement('button');
      deleteCategoryBtn.textContent = '🗑️';
      deleteCategoryBtn.className = 'delete-category-btn';
      deleteCategoryBtn.addEventListener('click', () => {
        categoryDiv.remove();
      });

      categoryHeader.appendChild(categoryInput);
      categoryHeader.appendChild(deleteCategoryBtn);
      categoryDiv.appendChild(categoryHeader);

      const linksContainer = document.createElement('div');
      linksContainer.className = 'links-container';

      links.forEach(link => {
        LinkManager.addEditableLink(linksContainer, link.name, link.url);
      });

      const addLinkBtn = document.createElement('button');
      addLinkBtn.textContent = '+ Añadir enlace';
      addLinkBtn.className = 'add-link-btn';
      addLinkBtn.addEventListener('click', () => {
        LinkManager.addEditableLink(linksContainer, '', '');
      });

      categoryDiv.appendChild(linksContainer);
      categoryDiv.appendChild(addLinkBtn);
      DOM.editableCategories.appendChild(categoryDiv);
    },

    addEditableLink: (container, name, url) => {
      const linkRow = document.createElement('div');
      linkRow.className = 'link-row';

      const nameInput = document.createElement('input');
      nameInput.value = name;
      nameInput.className = 'link-name-input';
      nameInput.placeholder = 'Nombre del enlace';

      const urlInput = document.createElement('input');
      urlInput.value = url;
      urlInput.className = 'link-url-input';
      urlInput.placeholder = 'URL (https://...)';

      const deleteLinkBtn = document.createElement('button');
      deleteLinkBtn.textContent = '❌';
      deleteLinkBtn.className = 'delete-link-btn';
      deleteLinkBtn.addEventListener('click', () => {
        linkRow.remove();
      });

      linkRow.appendChild(nameInput);
      linkRow.appendChild(urlInput);
      linkRow.appendChild(deleteLinkBtn);
      container.appendChild(linkRow);
    },

    saveEditedCategories: () => {
      const newLinks = {};
      const categories = DOM.editableCategories.querySelectorAll('.editable-category');

      categories.forEach(cat => {
        const catName = cat.querySelector('.category-name-input').value.trim();
        if (!catName) return;
        
        newLinks[catName] = [];
        const linkRows = cat.querySelectorAll('.link-row');
        
        linkRows.forEach(row => {
          const name = row.querySelector('.link-name-input').value.trim();
          const url = row.querySelector('.link-url-input').value.trim();
          if (name && url) newLinks[catName].push({ name, url });
        });
      });

      chrome.storage.sync.set({ links: newLinks }, () => {
        DOM.editCategoriesPopup.style.display = 'none';
        LinkManager.loadLinks();
      });
    }
  };

  const UIManager = {
    updateCustomColors: () => {
      chrome.storage.sync.get('customColors', (data) => {
        const colors = data.customColors || DEFAULT_CONFIG.colors;
        document.body.style.backgroundColor = colors.body;
        document.querySelector('.container').style.backgroundColor = colors.container;
        document.querySelector('.search-bar').style.backgroundColor = colors.searchBar;
        if (DOM.colorPickerBody) DOM.colorPickerBody.value = colors.body;
        if (DOM.colorPickerContainer) DOM.colorPickerContainer.value = colors.container;
        if (DOM.colorPickerSearchBar) DOM.colorPickerSearchBar.value = colors.searchBar;
      });
    },

    updateGithubVisibility: () => {
      chrome.storage.sync.get('hideGithub', (data) => {
        const hideGithub = data.hideGithub ?? false;
        if (DOM.githubButton) DOM.githubButton.style.display = hideGithub ? 'none' : 'block';
        if (DOM.toggleGithub) DOM.toggleGithub.checked = hideGithub;
      });
    },

    updateBannerVisibility: () => {
      chrome.storage.sync.get('hideBanner', (data) => {
        const hideBanner = data.hideBanner ?? false;
        if (DOM.imageBanner) DOM.imageBanner.style.display = hideBanner ? 'none' : 'block';
        if (DOM.toggleBanner) DOM.toggleBanner.checked = hideBanner;
      });
    },

    updateAnimeFetchToggle: () => {
      chrome.storage.sync.get('disableAnimeFetch', (data) => {
        const disableAnimeFetch = data.disableAnimeFetch ?? false;
        if (DOM.toggleAnimeFetch) DOM.toggleAnimeFetch.checked = disableAnimeFetch;
      });
    },

    updateDateTime: () => {
      if (DOM.dateTimeElement) {
        const now = new Date();
        DOM.dateTimeElement.textContent = now.toLocaleString();
      }
    },

    updateTextColorPickers: () => {
      chrome.storage.sync.get('textColors', (data) => {
        const colors = data.textColors || DEFAULT_CONFIG.textColors;
        if (DOM.categoryTextColor) DOM.categoryTextColor.value = colors.category;
        if (DOM.linkTextColor) DOM.linkTextColor.value = colors.link;
      });
    }
  };

  const setupEventListeners = () => {
    DOM.searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = DOM.searchInput.value.trim();
        if (query) window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    });

    if (DOM.toggleAnimeFetch) {
      DOM.toggleAnimeFetch.addEventListener('change', () => {
        chrome.storage.sync.set({ disableAnimeFetch: DOM.toggleAnimeFetch.checked }, () => {
          ImageManager.loadImage();
        });
      });
    }

    if (DOM.toggleGithub) {
      DOM.toggleGithub.addEventListener('change', () => {
        chrome.storage.sync.set({ hideGithub: DOM.toggleGithub.checked }, () => {
          UIManager.updateGithubVisibility();
        });
      });
    }

    if (DOM.toggleBanner) {
      DOM.toggleBanner.addEventListener('change', () => {
        chrome.storage.sync.set({ hideBanner: DOM.toggleBanner.checked }, () => {
          UIManager.updateBannerVisibility();
          ImageManager.loadCustomImages();
        });
      });
    }

    if (DOM.editCategoriesBtn) {
      DOM.editCategoriesBtn.addEventListener('click', LinkManager.openEditPopup);
    }

    if (DOM.closeEditPopup) {
      DOM.closeEditPopup.addEventListener('click', () => {
        DOM.editCategoriesPopup.style.display = 'none';
      });
    }

    if (DOM.saveCategoriesButton) {
      DOM.saveCategoriesButton.addEventListener('click', LinkManager.saveEditedCategories);
    }

    if (DOM.cancelEditButton) {
      DOM.cancelEditButton.addEventListener('click', () => {
        DOM.editCategoriesPopup.style.display = 'none';
      });
    }

    if (DOM.addCategoryBtn) {
      DOM.addCategoryBtn.addEventListener('click', () => {
        LinkManager.createEditableCategory('', []);
        DOM.editableCategories.scrollTop = DOM.editableCategories.scrollHeight;
      });
    }

    if (DOM.applyTextColors) {
      DOM.applyTextColors.addEventListener('click', () => {
        const textColors = {
          category: DOM.categoryTextColor.value,
          link: DOM.linkTextColor.value
        };
        chrome.storage.sync.set({ textColors }, LinkManager.loadLinks);
      });
    }

    if (DOM.resetButton) {
      DOM.resetButton.addEventListener('click', () => {
        chrome.storage.sync.set({ 
          links: DEFAULT_CONFIG.links,
          textColors: DEFAULT_CONFIG.textColors 
        }, LinkManager.loadLinks);
      });
    }

    if (DOM.mainImageUpload) {
      DOM.mainImageUpload.addEventListener('change', function() {
        const nameSpan = document.getElementById('main-image-name');
        nameSpan.textContent = this.files.length ? this.files[0].name : 'Ningún archivo seleccionado';
        ImageManager.handleUpload(this, 'mainImage');
      });
    }

    if (DOM.imageBannerUpload) {
      DOM.imageBannerUpload.addEventListener('change', function() {
        const nameSpan = document.getElementById('image-banner-name');
        nameSpan.textContent = this.files.length ? this.files[0].name : 'Ningún archivo seleccionado';
        ImageManager.handleUpload(this, 'imageBanner');
      });
    }

    if (DOM.clearImagesBtn) {
      DOM.clearImagesBtn.addEventListener('click', ImageManager.clear);
    }

    if (DOM.applyColorsBtn) {
      DOM.applyColorsBtn.addEventListener('click', () => {
        chrome.storage.sync.set({
          customColors: {
            body: DOM.colorPickerBody.value,
            container: DOM.colorPickerContainer.value,
            searchBar: DOM.colorPickerSearchBar.value
          }
        }, UIManager.updateCustomColors);
      });
    }
    document.getElementById('edit-categories-btn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    });
    if (DOM.resetColorsBtn) {
      DOM.resetColorsBtn.addEventListener('click', () => {
        chrome.storage.sync.set({
          customColors: DEFAULT_CONFIG.colors
        }, UIManager.updateCustomColors);
      });
    }

    if (DOM.menuIcon && DOM.popupSettings) {
      DOM.menuIcon.addEventListener('click', () => {
        DOM.popupSettings.style.display = DOM.popupSettings.style.display === 'block' ? 'none' : 'block';
        if (DOM.popupSettings.style.display === 'block') {
          loadPopupTextSettings();
        }
      });
    }

    if (DOM.closePopup) {
      DOM.closePopup.addEventListener('click', () => {
        DOM.popupSettings.style.display = 'none';
      });
    }

    setInterval(UIManager.updateDateTime, 1000);

    chrome.storage.onChanged.addListener((changes) => {
      if (
        changes.links ||
        changes.textColors ||
        changes.categoryOrder ||
        changes.welcomeText ||
        changes.welcomeColor ||
        changes.timeColor
      ) {
        applyTextColorsAndWelcome();
        UIManager.updateTextColorPickers();
      }
      if (changes.mainImage || changes.imageBanner) ImageManager.loadCustomImages();
      if (changes.hideGithub) UIManager.updateGithubVisibility();
      if (changes.hideBanner) UIManager.updateBannerVisibility();
      if (changes.disableAnimeFetch) UIManager.updateAnimeFetchToggle();
      if (changes.customColors) UIManager.updateCustomColors();
    });
  };

  const init = () => {
    chrome.storage.sync.get(
      ['disableAnimeFetch', 'hideGithub', 'hideBanner', 'customColors', 'textColors'], 
      (data) => {
        if (DOM.toggleAnimeFetch) DOM.toggleAnimeFetch.checked = data.disableAnimeFetch ?? false;
        if (DOM.toggleGithub) DOM.toggleGithub.checked = data.hideGithub ?? false;
        if (DOM.toggleBanner) DOM.toggleBanner.checked = data.hideBanner ?? false;
        UIManager.updateCustomColors();
        UIManager.updateGithubVisibility();
        UIManager.updateBannerVisibility();
        UIManager.updateDateTime();
        UIManager.updateTextColorPickers();
        applyTextColorsAndWelcome();
      }
    );
    LinkManager.initializeLinks();
    ImageManager.loadImage();
    setupEventListeners();
  };

  init();

  function loadPopupTextSettings() {
    chrome.storage.sync.get(['textColors', 'welcomeText', 'welcomeColor', 'timeColor'], (data) => {
      const colors = data.textColors || { category: '#c792ea', link: '#ffffff', welcome: '#ffffff', time: '#ffffff' };
      const popupCategoryColor = document.getElementById('popup-category-color');
      const popupLinkColor = document.getElementById('popup-link-color');
      const popupWelcomeColor = document.getElementById('popup-welcome-color');
      const popupTimeColor = document.getElementById('popup-time-color');
      const popupWelcomeText = document.getElementById('popup-welcome-text');
      const popupApplyTextSettings = document.getElementById('popup-apply-text-settings');

      if (popupCategoryColor) popupCategoryColor.value = colors.category || '#c792ea';
      if (popupLinkColor) popupLinkColor.value = colors.link || '#ffffff';
      if (popupWelcomeColor) popupWelcomeColor.value = data.welcomeColor || colors.welcome || '#ffffff';
      if (popupTimeColor) popupTimeColor.value = data.timeColor || colors.time || '#ffffff';
      if (popupWelcomeText) popupWelcomeText.value = data.welcomeText || '¡Bienvenido de nuevo!';

      if (popupApplyTextSettings) {
        popupApplyTextSettings.addEventListener('click', () => {
          chrome.storage.sync.set({
            textColors: {
              category: popupCategoryColor.value,
              link: popupLinkColor.value,
              welcome: popupWelcomeColor.value,
              time: popupTimeColor.value
            },
            welcomeText: popupWelcomeText.value,
            welcomeColor: popupWelcomeColor.value,
            timeColor: popupTimeColor.value
          }, () => {
            applyTextColorsAndWelcome();
          });
        });
      }
    });
  }

  function applyTextColorsAndWelcome() {
    chrome.storage.sync.get(['textColors', 'welcomeText', 'welcomeColor', 'timeColor'], (data) => {
      const colors = data.textColors || { category: '#c792ea', link: '#ffffff', welcome: '#ffffff', time: '#ffffff' };
      const h1 = document.querySelector('.container h1');
      const dateTime = document.querySelector('.date-time');
      if (h1) {
        h1.textContent = data.welcomeText || '¡Bienvenido de nuevo!';
        h1.style.color = data.welcomeColor || colors.welcome || '#ffffff';
      }
      if (dateTime) {
        dateTime.style.color = data.timeColor || colors.time || '#ffffff';
      }
      chrome.storage.sync.get(['links', 'categoryOrder'], (linksData) => {
        const links = linksData.links || {};
        const order = linksData.categoryOrder || Object.keys(links);
        const linksContainer = document.querySelector('.links');
        if (linksContainer) {
          linksContainer.innerHTML = '';
          order.forEach(category => {
            if (!links[category]) return;
            const catDiv = document.createElement('div');
            catDiv.className = 'category';
            const title = document.createElement('h2');
            title.textContent = `~${category}`;
            title.style.color = colors.category;
            const ul = document.createElement('ul');
            links[category].forEach(link => {
              const li = document.createElement('li');
              const a = document.createElement('a');
              a.textContent = link.name;
              a.href = link.url;
              a.target = '_self';
              a.style.textDecoration = 'none';
              a.style.color = colors.link;
              li.appendChild(a);
              ul.appendChild(li);
            });
            catDiv.appendChild(title);
            catDiv.appendChild(ul);
            linksContainer.appendChild(catDiv);
          });
        }
      });
    });
  }
});