/**
 * Character Data
 * Berisi semua data karakter yang tersedia dalam game
 */

export const characters = {
    gatotkaca: {
        name: "Gatotkaca",
        title: "Otot Kawat Tulang Besi",
        description: "Ksatria dengan pertahanan luar biasa",
        svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#A5B4FC" d="M48.2,-64.2C62.2,-55.4,73.1,-41.8,77.5,-26.6C81.9,-11.4,79.8,5.4,72.9,20.1C66,34.8,54.4,47.3,41.4,57.1C28.4,66.9,14.2,74,-1.3,75.9C-16.8,77.8,-33.7,74.5,-47,65.8C-60.4,57.2,-70.3,43.2,-75.6,27.9C-80.9,12.6,-81.6,-3.9,-75.9,-17.8C-70.2,-31.7,-58.1,-42.9,-45.3,-51.2C-32.5,-59.5,-16.2,-64.8,-0.7,-64.1C14.8,-63.4,29.6,-56.6,41.4,-47.8L48.2,-64.2Z" transform="translate(100 100) scale(1.2)" />
        </svg>`,
        stats: {
            kekuatan: 8,
            pertahanan: 10,
            kelincahan: 4,
            sihir: 2
        }
    },
    srikandi: {
        name: "Srikandi",
        title: "Pemanah Titisan Dewi",
        description: "Pemanah legendaris dengan kelincahan maksimal",
        svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#F472B6" d="M51.9,-63.9C64.9,-54.6,71.5,-37.2,74.1,-20.1C76.7,-3,75.3,13.7,67.8,26.5C60.3,39.3,46.8,48.2,33.1,55.3C19.4,62.4,5.6,67.7,-8.9,69.5C-23.4,71.2,-38.6,69.4,-51.2,61.7C-63.8,54,-73.8,40.4,-77.9,25.4C-82.1,10.4,-80.4,-6,-72.6,-18.9C-64.8,-31.8,-51,-41.2,-38.2,-50.7C-25.4,-60.1,-12.7,-69.6,2.5,-73.5C17.7,-77.4,35.4,-75.5,51.9,-63.9Z" transform="translate(100 100) scale(1.2)" />
        </svg>`,
        stats: {
            kekuatan: 5,
            pertahanan: 5,
            kelincahan: 10,
            sihir: 6
        }
    },
    hanoman: {
        name: "Hanoman",
        title: "Kera Putih Sakti",
        description: "Prajurit tangguh dengan kekuatan luar biasa",
        svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FBBF24" d="M47.7,-51.1C60.4,-37.7,68.2,-20.5,67,-4.9C65.8,10.6,55.5,24.4,43.8,36.5C32.1,48.5,18.9,58.8,3.2,62.1C-12.6,65.4,-30.9,61.8,-42.6,51.9C-54.3,41.9,-59.5,25.6,-61.4,8.8C-63.4,-8.1,-62.1,-25.5,-52.8,-39C-43.5,-52.5,-26.2,-62.1,-9,-63.7C8.2,-65.3,21.5,-58.5,31.8,-53.8L47.7,-51.1Z" transform="translate(100 100) scale(1.2)" />
        </svg>`,
        stats: {
            kekuatan: 10,
            pertahanan: 7,
            kelincahan: 8,
            sihir: 1
        }
    }
};

/**
 * Get character data by ID
 * @param {string} characterId - ID karakter
 * @returns {object|null} Data karakter atau null jika tidak ditemukan
 */
export const getCharacter = (characterId) => {
    return characters[characterId] || null;
};

/**
 * Get all character IDs
 * @returns {array} Array of character IDs
 */
export const getCharacterIds = () => {
    return Object.keys(characters);
};

/**
 * Get all characters
 * @returns {object} All characters data
 */
export const getAllCharacters = () => {
    return characters;
};

/**
 * Validate if character ID exists
 * @param {string} characterId - ID karakter untuk divalidasi
 * @returns {boolean} True jika karakter ada
 */
export const isValidCharacter = (characterId) => {
    return characters.hasOwnProperty(characterId);
};

/**
 * Get total stats for a character
 * @param {string} characterId - ID karakter
 * @returns {number} Total semua stats
 */
export const getTotalStats = (characterId) => {
    const char = getCharacter(characterId);
    if (!char) return 0;
    
    return Object.values(char.stats).reduce((sum, val) => sum + val, 0);
};

/**
 * Get character count
 * @returns {number} Jumlah karakter yang tersedia
 */
export const getCharacterCount = () => {
    return Object.keys(characters).length;
};