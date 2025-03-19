document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const linksContainer = document.querySelector('.links');
    const noLinksImage = document.getElementById('no-links-image');
    const githubButton = document.querySelector('.tooltip-container');
    const animeImage = document.getElementById('anime-image');

    // ✅ Cargar las imágenes personalizadas desde `chrome.storage.local`
    function loadCustomImages() {
        chrome.storage.local.get(['mainImage', 'noLinksImage'], (data) => {
            if (data.mainImage) {
                animeImage.src = data.mainImage;  // ✅ Imagen personalizada principal
            } else {
                animeImage.src = chrome.runtime.getURL('images/default-anime.jpg');  // Imagen por defecto
            }

            if (data.noLinksImage) {
                noLinksImage.src = data.noLinksImage;  // ✅ Imagen personalizada sin enlaces
            } else {
                noLinksImage.src = chrome.runtime.getURL('images/default-anime.jpg');  // Imagen por defecto
            }
        });
    }

    // ✅ Verificar el estado del switch al cargar la página
    chrome.storage.sync.get('disableAnimeFetch', (data) => {
        const isDisabled = data.disableAnimeFetch ?? false;

        if (isDisabled) {
            loadCustomImages();  // ✅ Cargar imágenes locales si el switch está activado
        } else {
            loadImage();  // ✅ Imagen aleatoria si el switch está apagado
        }
    });

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
                noLinksImage.style.display = 'block';
                return;
            }

            noLinksImage.style.display = 'none';

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

    loadLinks();

    // ✅ Mostrar imagen local o aleatoria según el estado del switch
    function loadImage() {
        chrome.storage.sync.get('disableAnimeFetch', (config) => {
            const isDisabled = config.disableAnimeFetch ?? false;

            if (isDisabled) {
                loadCustomImages();  // ✅ Cargar imágenes locales
            } else {
                fetchRandomAnimeImage();  // ✅ Imagen aleatoria
            }
        });
    }

    // ✅ Obtener imágenes de anime aleatorias
    function fetchRandomAnimeImage() {
        fetch('https://api.waifu.pics/sfw/waifu')
            .then(response => response.json())
            .then(data => {
                animeImage.src = data.url;
            })
            .catch(() => {
                animeImage.src = chrome.runtime.getURL('images/default-anime.jpg');
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
        if (changes.mainImage || changes.noLinksImage) {
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
            const isDisabled = message.disabled;

            if (isDisabled) {
                loadCustomImages();  // ✅ Imagen local si el switch está activado
            } else {
                loadImage();  // ✅ Buscar aleatoria si está desactivado
            }
        }
    });

    // ✅ Inicializar la imagen correctamente
    loadImage();
});
