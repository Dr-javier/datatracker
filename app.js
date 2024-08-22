document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const dataBody = document.getElementById('dataBody');

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const steamData = data.Steamid || [];

            // Handle multiple steamids within each entry
            const sortedData = steamData.flatMap(entry => {
                return Object.keys(entry).map(steamid => {
                    const entryData = entry[steamid] || {};
                    if (!entryData.Name) {
                        console.warn(`Missing Name for steamid: ${steamid}`);
                    }
                    return {
                        steamid: steamid || 'Unknown',
                        Name: entryData.Name || 'Unknown',
                        Points: entryData.Points || 0,
                        Lives: entryData.Lives || 0,
                        Weight: entryData.Weight || 0,
                        Playtime: entryData.Playtime || 0,
                        originalIndex: steamData.indexOf(entry)
                    };
                });
            }).sort((a, b) => b.Points - a.Points);

            // Display data
            displayData(sortedData);

            // Enhanced search functionality
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                let filteredData;

                if (searchTerm.startsWith('steamid:')) {
                    const steamidSearch = searchTerm.split('steamid:')[1].trim();
                    filteredData = sortedData.filter(item => item.steamid === steamidSearch);
                } else if (searchTerm.startsWith('#')) {
                    const placementSearch = parseInt(searchTerm.split('#')[1].trim(), 10);
                    filteredData = sortedData.filter((_, index) => index + 1 === placementSearch);
                } else {
                    filteredData = sortedData.filter((item, index) =>
                        item.Name.toLowerCase().includes(searchTerm) ||
                        item.steamid.includes(searchTerm) ||
                        levenshteinDistance(item.Name.toLowerCase(), searchTerm) <= 2 ||
                        levenshteinDistance(item.steamid, searchTerm) <= 2
                    );
                }

                displayData(filteredData);
            });
        })
        .catch(error => console.error('Error fetching data:', error));

    function displayData(data) {
        dataBody.innerHTML = '';
        data.forEach((item) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.originalIndex + 1}</td>
                <td>${sanitizeString(item.Name)}</td>
                <td>${item.Points}</td>
                <td>${item.steamid}</td>
            `;
            dataBody.appendChild(row);
        });
    }

    function sanitizeString(str) {
        if (typeof str !== 'string') {
            return ''; // Return an empty string if str is not a valid string
        }
        return str.replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII characters
    }

    function levenshteinDistance(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }
});
