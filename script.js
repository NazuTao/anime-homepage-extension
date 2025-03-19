<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const linksContainer = document.querySelector('.links');
    const noLinksImage = document.getElementById('no-links-image');  
    const githubButton = document.querySelector('.tooltip-container');  
    const animeImage = document.getElementById('anime-image');  

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

    // ✅ Cargar solo la imagen local si la búsqueda está desactivada
    function loadImage() {
        chrome.storage.local.get(['customMainImage'], (data) => {
            const customImage = data.customMainImage || 'animegirl.jpg';
    
            // Verificar si la búsqueda automática está desactivada
            chrome.storage.sync.get('disableAnimeFetch', (syncData) => {
                if (syncData.disableAnimeFetch) {
                    animeImage.src = customImage;  // Mostrar imagen local si la búsqueda está desactivada
                } else {
                    fetchRandomAnimeImage();
                }
            });
        });
    }

    // ✅ Obtener imágenes de anime aleatorias
    function fetchRandomAnimeImage() {
        fetch('https://api.waifu.pics/sfw/waifu')
            .then(response => response.json())
            .then(data => {
                animeImage.src = data.url;
                chrome.storage.local.set({ lastAnimeImage: data.url });
            })
            .catch(() => {
                animeImage.src = 'animegirl.jpg';
            });
    }

    // ✅ Mostrar/ocultar GitHub según la configuración correcta
    function updateGithubVisibility() {
        chrome.storage.sync.get('hideGithub', (data) => {
            const hideGithub = data.hideGithub ?? false;

            // ✅ Si `hideGithub` es `true`, oculta el ícono
            githubButton.style.display = hideGithub ? 'none' : 'block';
        });
    }

    // ✅ Llamar a la función inicial para mostrar/ocultar el ícono de GitHub
    updateGithubVisibility();

    // ✅ Escuchar cambios dinámicos en el almacenamiento
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.hideGithub) {
            updateGithubVisibility();
        }
    });

    // ✅ Inicializar la imagen cargada
    loadImage();
});
=======
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const linksContainer = document.querySelector('.links');
    const noLinksImage = document.getElementById('no-links-image');  
    const githubButton = document.querySelector('.tooltip-container');  
    const animeImage = document.getElementById('anime-image');  

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

    // ✅ Cargar solo la imagen local si la búsqueda está desactivada
    function loadImage() {
        chrome.storage.local.get(['customMainImage'], (data) => {
            const customImage = data.customMainImage || 'animegirl.jpg';
    
            // Verificar si la búsqueda automática está desactivada
            chrome.storage.sync.get('disableAnimeFetch', (syncData) => {
                if (syncData.disableAnimeFetch) {
                    animeImage.src = customImage;  // Mostrar imagen local si la búsqueda está desactivada
                } else {
                    fetchRandomAnimeImage();
                }
            });
        });
    }

    // ✅ Obtener imágenes de anime aleatorias
    function fetchRandomAnimeImage() {
        fetch('https://api.waifu.pics/sfw/waifu')
            .then(response => response.json())
            .then(data => {
                animeImage.src = data.url;
                chrome.storage.local.set({ lastAnimeImage: data.url });
            })
            .catch(() => {
                animeImage.src = 'animegirl.jpg';
            });
    }

    // ✅ Mostrar/ocultar GitHub según la configuración correcta
    function updateGithubVisibility() {
        chrome.storage.sync.get('hideGithub', (data) => {
            const hideGithub = data.hideGithub ?? false;

            // ✅ Si `hideGithub` es `true`, oculta el ícono
            githubButton.style.display = hideGithub ? 'none' : 'block';
        });
    }

    // ✅ Llamar a la función inicial para mostrar/ocultar el ícono de GitHub
    updateGithubVisibility();

    // ✅ Escuchar cambios dinámicos en el almacenamiento
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.hideGithub) {
            updateGithubVisibility();
        }
    });

    // ✅ Inicializar la imagen cargada
    loadImage();
});
>>>>>>> e83b390ccf7638c0ac8f46f0571506ea4599be8f
