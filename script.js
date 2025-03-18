document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const linksContainer = document.querySelector('.links');
    const noLinksImage = document.getElementById('no-links-image');  // 👉 Nueva imagen

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

    // ✅ Función para cargar enlaces
    function loadLinks() {
        linksContainer.innerHTML = '';

        chrome.storage.sync.get('links', (data) => {
            const links = data.links || {};

            if (Object.keys(links).length === 0) {
                // 👉 Mostrar imagen si no hay categorías
                noLinksImage.style.display = 'block';
                return;
            }

            noLinksImage.style.display = 'none';  // Ocultar imagen si hay enlaces

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

    // ✅ Función para obtener imágenes de anime aleatorias
    function fetchRandomAnimeImage() {
        fetch('https://api.waifu.pics/sfw/waifu')
            .then(response => response.json())
            .then(data => {
                const animeImage = document.getElementById('anime-image');
                animeImage.src = data.url;
            })
            .catch(() => {
                const animeImage = document.getElementById('anime-image');
                animeImage.src = 'animegirl.jpg';  // Imagen local por defecto
            });
    }

    fetchRandomAnimeImage();
});
