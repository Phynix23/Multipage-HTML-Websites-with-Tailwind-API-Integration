// Store all countries globally for filtering
let allCountries = [];

// DOM Elements
const countriesGrid = document.getElementById('countriesGrid');
const searchInput = document.getElementById('searchInput');
const regionSelect = document.getElementById('regionSelect');
const statusDiv = document.getElementById('status');

// Fetch all countries on page load
async function loadCountries() {
    // Show loading state
    statusDiv.innerHTML = '<div class="bg-blue-100 text-blue-700 p-4 rounded-lg">📥 Loading countries...</div>';
    countriesGrid.innerHTML = '';
    
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital,cca3');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const countries = await response.json();
        allCountries = countries;
        
        // Clear status and render
        statusDiv.innerHTML = '';
        renderCountries(allCountries);
        
        // Update favourite buttons state
        updateAllSaveButtons();
        
    } catch (error) {
        statusDiv.innerHTML = `<div class="bg-red-100 text-red-700 p-4 rounded-lg">❌ Error loading countries: ${error.message}. Please refresh the page.</div>`;
        console.error('Fetch error:', error);
    }
}

// Render countries using createElement (no innerHTML with API data)
function renderCountries(countries) {
    if (countries.length === 0) {
        countriesGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 p-8">🔍 No countries match your search.</div>';
        return;
    }
    
    countriesGrid.innerHTML = '';
    
    countries.forEach(country => {
        const card = createCountryCard(country);
        countriesGrid.appendChild(card);
    });
}

// Create individual country card with createElement
function createCountryCard(country) {
    // Create anchor tag for navigation
    const link = document.createElement('a');
    link.href = `country.html?code=${country.cca3}`;
    link.className = 'block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';
    
    // Flag image
    const img = document.createElement('img');
    img.src = country.flags.svg;
    img.alt = `Flag of ${country.name.common}`;
    img.className = 'w-full h-40 object-cover';
    img.loading = 'lazy';
    
    // Content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'p-4';
    
    // Country name
    const name = document.createElement('h2');
    name.textContent = country.name.common;
    name.className = 'font-bold text-lg mb-2';
    
    // Population (formatted with commas)
    const population = document.createElement('p');
    population.textContent = `👥 Population: ${country.population.toLocaleString()}`;
    population.className = 'text-gray-600 text-sm mb-1';
    
    // Region
    const region = document.createElement('p');
    region.textContent = `🌍 Region: ${country.region}`;
    region.className = 'text-gray-600 text-sm mb-1';
    
    // Capital
    const capital = document.createElement('p');
    capital.textContent = `🏙️ Capital: ${country.capital?.[0] || 'N/A'}`;
    capital.className = 'text-gray-600 text-sm mb-3';
    
    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = isFavourite(country.cca3) ? '⭐ Saved' : '☆ Save';
    saveBtn.className = `w-full py-2 rounded-lg text-sm font-medium transition-colors ${
        isFavourite(country.cca3) 
            ? 'bg-green-500 text-white cursor-default' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
    }`;
    saveBtn.disabled = isFavourite(country.cca3);
    
    // Add save functionality
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();
        addToFavourites(country.cca3, saveBtn);
    });
    
    // Assemble card
    contentDiv.appendChild(name);
    contentDiv.appendChild(population);
    contentDiv.appendChild(region);
    contentDiv.appendChild(capital);
    contentDiv.appendChild(saveBtn);
    link.appendChild(img);
    link.appendChild(contentDiv);
    
    return link;
}

// Favourites functions
function getFavourites() {
    return JSON.parse(localStorage.getItem('favourites') || '[]');
}

function saveFavourites(list) {
    localStorage.setItem('favourites', JSON.stringify(list));
    updateFavouritesCount();
}

function isFavourite(cca3) {
    const favs = getFavourites();
    return favs.includes(cca3);
}

function addToFavourites(cca3, button) {
    const favs = getFavourites();
    
    if (!favs.includes(cca3)) {
        favs.push(cca3);
        saveFavourites(favs);
        
        // Update button appearance
        button.textContent = '⭐ Saved';
        button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        button.classList.add('bg-green-500');
        button.disabled = true;
    }
}

function updateAllSaveButtons() {
    const favs = getFavourites();
    const allSaveButtons = document.querySelectorAll('#countriesGrid button');
    
    allSaveButtons.forEach((btn, index) => {
        const card = btn.closest('a');
        if (card) {
            const img = card.querySelector('img');
            if (img && img.alt) {
                // Extract country code from href or use a data attribute
                const href = card.getAttribute('href');
                const match = href.match(/code=([A-Z]{3})/);
                if (match && favs.includes(match[1])) {
                    btn.textContent = '⭐ Saved';
                    btn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                    btn.classList.add('bg-green-500');
                    btn.disabled = true;
                }
            }
        }
    });
}

// Update favourites count in navigation
function updateFavouritesCount() {
    const count = getFavourites().length;
    const favLinks = document.querySelectorAll('.favourites-link');
    favLinks.forEach(link => {
        if (count > 0) {
            link.textContent = `Favourites (${count})`;
        } else {
            link.textContent = 'Favourites';
        }
    });
}

// Filter and render function (search + region together)
function filterAndRender() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const region = regionSelect.value;
    
    const filtered = allCountries.filter(country => {
        const name = country.name.common.toLowerCase();
        const matchesSearch = searchTerm === '' || name.includes(searchTerm);
        const matchesRegion = region === 'All' || country.region === region;
        return matchesSearch && matchesRegion;
    });
    
    renderCountries(filtered);
    
    // Update save buttons after rendering
    setTimeout(() => updateAllSaveButtons(), 0);
}

// Event listeners
searchInput.addEventListener('input', filterAndRender);
regionSelect.addEventListener('change', filterAndRender);

// Initialize
loadCountries();
updateFavouritesCount();