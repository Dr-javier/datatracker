document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const dataBody = document.getElementById('dataBody');

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const steamData = data.Steamid;
            const sortedData = Object.keys(steamData).map(steamid => {
                return { steamid, ...steamData[steamid] };
            }).sort((a, b) => b.Points - a.Points);

            // Display data
            displayData(sortedData);

            // Add search functionality
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredData = sortedData.filter((item, index) => 
                    index.toString().includes(searchTerm) ||
                    item.Name.toLowerCase().includes(searchTerm) ||
                    item.steamid.includes(searchTerm) ||
                    levenshteinDistance(item.Name.toLowerCase(), searchTerm) <= 2 ||
                    levenshteinDistance(item.steamid, searchTerm) <= 2
                );
                displayData(filteredData);
            });
        })
        .catch(error => console.error('Error fetching data:', error));

    function displayData(data) {
        dataBody.innerHTML = '';
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${sanitizeString(item.Name)}</td>
                <td>${item.Points}</td>
                <td>${item.steamid}</td>
            `;
            dataBody.appendChild(row);
        });
    }

    function sanitizeString(str) {
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