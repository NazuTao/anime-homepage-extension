document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const linksContainer = document.querySelector('.links');
    const noLinksImage = document.getElementById('no-links-image');
    const githubButton = document.querySelector('.tooltip-container');
    const animeImage = document.getElementById('anime-image');

    // ✅ Cargar imágenes personalizadas o restaurar las predeterminadas
    function loadCustomImages(callback) {
        chrome.storage.local.get(['mainImage', 'noLinksImage'], (data) => {
            let hasCustomImage = false;

            // ✅ Imagen principal
            if (data.mainImage) {
                hasCustomImage = true;
                animeImage.src = data.mainImage;
            } else {
                animeImage.src = chrome.runtime.getURL('images/default-anime.jpg');
            }

            // ✅ Imagen "no links"
            const noLinksImgElement = noLinksImage.querySelector('img');

            if (data.noLinksImage) {
                hasCustomImage = true;
                noLinksImgElement.src = data.noLinksImage;  // ✅ Aplicar personalizada
                noLinksImage.style.display = 'block';
            } else {
                noLinksImgElement.src = chrome.runtime.getURL('images/default-anime.jpg');
                noLinksImage.style.display = 'block';  // ✅ Mostrar la predeterminada
            }

            if (callback) callback(hasCustomImage);
        });
    }

    // ✅ Verificar el estado del switch
    function loadImage() {
        chrome.storage.sync.get('disableAnimeFetch', (config) => {
            const isDisabled = config.disableAnimeFetch ?? false;

            loadCustomImages((hasCustomImage) => {
                if (!isDisabled && !hasCustomImage) {
                    // ✅ Solo cargar imagen aleatoria si no hay personalizada
                    fetchRandomAnimeImage();
                }
            });
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

    // ✅ Obtener imágenes de anime aleatorias
    function fetchRandomAnimeImage() {
        fetch('https://api.waifu.pics/sfw/waifu')
            .then(response => response.json())
            .then(data => {
                const img = new Image();
                img.src = data.url;
                img.onload = () => {
                    animeImage.src = data.url;
                };
            })
            .catch(() => {
                animeImage.src = '';  // Si falla, mantenerlo vacío
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
            loadImage();
        }
    });

    // ✅ Inicializar la imagen correctamente
    loadImage();
});
