document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const linksContainer = document.querySelector('.links');
    const imageBanner = document.getElementById('image-banner');
    const githubButton = document.querySelector('.tooltip-container');
    const animeImage = document.getElementById('anime-image');
    const imageBannerElement = imageBanner.querySelector('img');

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

    // ✅ Cargar imágenes personalizadas o restaurar las predeterminadas
    function loadCustomImages(callback) {
        chrome.storage.local.get(['mainImage', 'imageBanner'], (data) => {
            let hasCustomImage = false;

            // ✅ Imagen principal
            if (data.mainImage) {
                hasCustomImage = true;
                animeImage.src = data.mainImage;
            } else {
                animeImage.src = chrome.runtime.getURL('images/default-anime.jpg');
            }

            // ✅ Imagen "image banner"
            if (data.imageBanner) {
                hasCustomImage = true;
                imageBannerElement.src = data.imageBanner;  // ✅ Aplicar personalizada
                imageBanner.style.display = 'block';
            } else {
                imageBannerElement.src = chrome.runtime.getURL('images/default-anime.jpg');
                imageBanner.style.display = 'block';  // ✅ Mostrar la predeterminada
            }

            if (callback) callback(hasCustomImage);
        });
    }

    // ✅ Verificar el estado del switch
    function loadImage() {
        chrome.storage.sync.get('disableAnimeFetch', (config) => {
            const isDisabled = config.disableAnimeFetch ?? false;

            // ✅ Siempre cargar imagen aleatoria
            if (!isDisabled) {
                fetchRandomAnimeImage();
            }

            // ✅ Luego cargar imagen personalizada si existe
            loadCustomImages();
        });
    }

    // ✅ Búsqueda instantánea
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
        }
    });

    const dateTimeElement = document.querySelector(".date-time");

    function actualizarFechaHora() {
        const ahora = new Date();
        const diasDeLaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const dia = ahora.getDate().toString().padStart(2, '0');
        const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
        const año = ahora.getFullYear();

        let horas = ahora.getHours();
        const minutos = ahora.getMinutes().toString().padStart(2, '0');
        const segundos = ahora.getSeconds().toString().padStart(2, '0');

        const ampm = horas >= 12 ? 'PM' : 'AM';
        horas = horas % 12 || 12;

        dateTimeElement.textContent = `${diasDeLaSemana[ahora.getDay()]}, ${horas}:${minutos}:${segundos} ${ampm} | ${dia}/${mes}/${año}`;
    }

    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);

    // ✅ Cargar enlaces
    function loadLinks() {
        linksContainer.innerHTML = '';

        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};

            if (Object.keys(links).length === 0) {
                imageBanner.style.display = 'block';
                return;
            }

            imageBanner.style.display = 'none';

            for (const category in links) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category';

                const title = document.createElement('h2');
                title.textContent = `~${category}`;
                categoryDiv.appendChild(title);

                const ul = document.createElement('ul');

                links[category].slice(0, 5).forEach(link => {
                    const li = document.createElement('li');

                    const anchor = document.createElement('a');
                    anchor.textContent = link.name;
                    anchor.href = link.url;
                    anchor.style.textDecoration = 'none';
                    anchor.style.color = 'inherit';
                    anchor.target = '_self';

                    li.appendChild(anchor);
                    ul.appendChild(li);
                });

                categoryDiv.appendChild(ul);
                linksContainer.appendChild(categoryDiv);
            }
        });
    }

    // ✅ Inicializar categorías si no existen
    function initializeLinks() {
        chrome.storage.sync.get('links', (data) => {
            if (!data.links) {
                chrome.storage.sync.set({ links: defaultLinks }, loadLinks);
            } else {
                loadLinks();
            }
        });
    }

    initializeLinks();

    // ✅ Obtener imágenes de anime aleatorias
    function fetchRandomAnimeImage(forImageBanner = false) {
        fetch('https://api.waifu.pics/sfw/waifu')
            .then(response => response.json())
            .then(data => {
                const img = new Image();
                img.src = data.url;
                img.onload = () => {
                    if (!forImageBanner) {
                        animeImage.src = data.url;
                    }
                };
            })
            .catch(() => {
                if (!forImageBanner) {
                    animeImage.src = '';  // Si falla, mantenerlo vacío
                }
            });
    }

    // ✅ Mostrar/ocultar GitHub según la configuración
    function updateGithubVisibility() {
        chrome.storage.sync.get('hideGithub', (data) => {
            const hideGithub = data.hideGithub ?? false;
            githubButton.style.display = hideGithub ? 'none' : 'block';
        });
    }

    updateGithubVisibility();

    // ✅ Escuchar cambios dinámicos en el almacenamiento
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.mainImage || changes.imageBanner) {
            loadCustomImages();  // ✅ Actualizar imágenes personalizadas
        }

        if (changes.hideGithub) {
            updateGithubVisibility();
        }

        if (changes.disableAnimeFetch) {
            loadImage();  // ✅ Actualizar la imagen según el estado del switch
        }
    });

    // ✅ Escuchar mensajes desde `options.js`
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'updateImages') {
            loadCustomImages();  // ✅ Actualizar las imágenes cuando se suban
        }

        if (message.action === 'toggleAnime') {
            loadImage();
        }
    });

    // ✅ Inicializar la imagen correctamente
    loadImage();
});