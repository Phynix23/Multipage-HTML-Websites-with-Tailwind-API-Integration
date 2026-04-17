// Get country code from URL
const urlParams = new URLSearchParams(window.location.search);
const countryCode = urlParams.get('code');

const contentDiv = document.getElementById('content');
const bordersModal = document.getElementById('bordersModal');
const bordersList = document.getElementById('bordersList');
const closeModalBtn = document.getElementById('closeModalBtn');

// Validate country code (must be 3 uppercase letters)
function isValidCountryCode(code) {
    return code && /^[A-Z]{3}$/.test(code) && code.length === 3;
}

// Fetch and display country details
async function loadCountryDetails() {
    // Validate URL parameter
    if (!isValidCountryCode(countryCode)) {
        contentDiv.innerHTML = `
            <div class="bg-red-100 text-red-700 p-6 rounded-lg text-center">
                <h2 class="text-xl font-bold mb-2">❌ Invalid Country Code</h2>
                <p>The country code "${countryCode}" is not valid.</p>
                <a href="index.html" class="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    ← Back to Home
                </a>
            </div>
        `;
        return;
    }
    
    // Show loading
    contentDiv.innerHTML = '<div class="bg-blue-100 text-blue-700 p-4 rounded-lg">📥 Loading country details...</div>';
    
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        
        if (!response.ok) {
            throw new Error(`Country not found (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        const country = data[0];
        
        // Update page title
        document.title = `${country.name.common} - Country Details`;
        
        // Render country profile
        renderCountryProfile(country);
        
        // Setup border modal
        setupBorderModal(country);
        
    } catch (error) {
        contentDiv.innerHTML = `
            <div class="bg-red-100 text-red-700 p-6 rounded-lg text-center">
                <h2 class="text-xl font-bold mb-2">❌ Error Loading Country</h2>
                <p>${error.message}</p>
                <a href="index.html" class="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    ← Back to Home
                </a>
            </div>
        `;
        console.error('Fetch error:', error);
    }
}

// Render country profile using createElement
function renderCountryProfile(country) {
    contentDiv.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'bg-white rounded-lg shadow-md overflow-hidden';
    
    // Flag section
    const flagContainer = document.createElement('div');
    flagContainer.className = 'bg-gray-100 p-6 text-center';
    
    const flagImg = document.createElement('img');
    flagImg.src = country.flags.svg;
    flagImg.alt = `Flag of ${country.name.common}`;
    flagImg.className = 'max-w-full h-48 object-contain mx-auto';
    
    flagContainer.appendChild(flagImg);
    
    // Info section
    const infoDiv = document.createElement('div');
    infoDiv.className = 'p-6';
    
    // Common name
    const commonName = document.createElement('h1');
    commonName.textContent = country.name.common;
    commonName.className = 'text-3xl font-bold text-gray-800 mb-2';
    
    // Official name
    const officialName = document.createElement('p');
    officialName.textContent = `Official: ${country.name.official}`;
    officialName.className = 'text-gray-500 mb-6 pb-4 border-b';
    
    // Info grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6';
    
    // Helper function to create info rows
    function addInfoRow(parent, label, value) {
        const div = document.createElement('div');
        div.className = 'py-2';
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = `${label}: `;
        labelSpan.className = 'font-semibold text-gray-700';
        
        const valueSpan = document.createElement('span');
        valueSpan.textContent = value || 'N/A';
        valueSpan.className = 'text-gray-600';
        
        div.appendChild(labelSpan);
        div.appendChild(valueSpan);
        parent.appendChild(div);
    }
    
    // Capital
    addInfoRow(grid, '🏙️ Capital', country.capital?.[0] || 'N/A');
    
    // Region and Subregion
    addInfoRow(grid, '🌍 Region', country.region);
    addInfoRow(grid, '📍 Subregion', country.subregion || 'N/A');
    
    // Population (formatted)
    addInfoRow(grid, '👥 Population', country.population.toLocaleString());
    
    // Area (formatted with km²)
    addInfoRow(grid, '📏 Area', `${country.area?.toLocaleString() || 'N/A'} km²`);
    
    // Languages (object to string)
    const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
    addInfoRow(grid, '🗣️ Languages', languages);
    
    // Currencies (object to string)
    let currencies = 'N/A';
    if (country.currencies) {
        currencies = Object.values(country.currencies)
            .map(c => `${c.name} (${c.symbol || 'N/A'})`)
            .join(', ');
    }
    addInfoRow(grid, '💰 Currencies', currencies);
    
    // Border countries button
    const borderBtn = document.createElement('button');
    borderBtn.textContent = '🌍 View Border Countries';
    borderBtn.className = 'w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors';
    
    if (!country.borders || country.borders.length === 0) {
        borderBtn.disabled = true;
        borderBtn.className = 'w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed';
    }
    
    borderBtn.addEventListener('click', () => {
        bordersModal.showModal();
    });
    
    // Back link
    const backLink = document.createElement('a');
    backLink.href = 'index.html';
    backLink.textContent = '← Back to all countries';
    backLink.className = 'inline-block mt-6 text-blue-600 hover:text-blue-800';
    
    // Assemble
    infoDiv.appendChild(commonName);
    infoDiv.appendChild(officialName);
    infoDiv.appendChild(grid);
    infoDiv.appendChild(borderBtn);
    infoDiv.appendChild(backLink);
    
    container.appendChild(flagContainer);
    container.appendChild(infoDiv);
    contentDiv.appendChild(container);
}

// Setup border modal
function setupBorderModal(country) {
    bordersList.innerHTML = '';
    
    if (!country.borders || country.borders.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'This country has no land borders';
        message.className = 'text-gray-500';
        bordersList.appendChild(message);
        return;
    }
    
    country.borders.forEach(borderCode => {
        const link = document.createElement('a');
        link.href = `country.html?code=${borderCode}`;
        link.textContent = borderCode;
        link.className = 'bg-gray-100 px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition-colors';
        bordersList.appendChild(link);
    });
}

// Modal close handlers
function setupModalHandlers() {
    // Close button
    closeModalBtn.addEventListener('click', () => {
        bordersModal.close();
    });
    
    // Backdrop click
    bordersModal.addEventListener('click', (e) => {
        if (e.target === bordersModal) {
            bordersModal.close();
        }
    });
    
    // Escape key is automatic with <dialog>
}

// Update favourites count
function updateFavouritesCount() {
    const count = JSON.parse(localStorage.getItem('favourites') || '[]').length;
    const favLinks = document.querySelectorAll('.favourites-link');
    favLinks.forEach(link => {
        if (count > 0) {
            link.textContent = `Favourites (${count})`;
        } else {
            link.textContent = 'Favourites';
        }
    });
}

// Initialize
loadCountryDetails();
setupModalHandlers();
updateFavouritesCount();