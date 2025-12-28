import { read, utils } from 'xlsx';

export const ImportService = {
    importMembersFromFile: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const wb = read(data, { type: 'array' });
                    // Continue with existing logic... ideally we refactor processing logic
                    // But for this patch we'll inline or call a helper.

                    const jsonData = processWorkbook(wb);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    },

    // Kept for reference but not used in UI anymore
    importMembersFromUrl: async (url) => {
        // ... (can be deprecated or removed)
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Fetch failed");
            const arrayBuffer = await response.arrayBuffer();
            const wb = read(arrayBuffer);
            return processWorkbook(wb);
        } catch (e) { throw e; }
    }
};

// Helper function to keep successful logic
function processWorkbook(wb) {
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(ws);

    // Transform Data
    // Expected Format in Excel: 'Name' or 'Member Name', 'Code' (optional)
    // Logic: Split Name into Last, First, MI

    let currentType = 'Member';

    const members = [];
    let memberCount = 1;

    jsonData.forEach((row, index) => {
        // Get the potential name value
        let rawName = row['Name'] || row['Member Name'] || row['Full Name'] || Object.values(row)[0];

        // Skip empty rows
        if (!rawName) return;

        rawName = String(rawName).trim();

        // Check for "Non Member" Header
        if (rawName.toLowerCase().includes('non member') || rawName.toLowerCase().includes('non-member')) {
            currentType = 'Non-Member';
            return; // Skip this header row
        }

        // Filtering: Remove "Adjustment" or "NoName"
        if (rawName.toLowerCase().includes('adjustment') || rawName.toLowerCase().includes('noname')) {
            return;
        }

        // DETERMINE PREFIX
        const prefix = currentType === 'Member' ? 'M' : 'N';

        // EXTRACT OR GENERATE NUMBER
        let numberPart;
        const existingCode = row['Code'] || row['Member Code'];

        if (existingCode) {
            // Try to preserve existing number: "M145" -> 145
            const extracted = parseInt(String(existingCode).replace(/\D/g, ''), 10);
            numberPart = isNaN(extracted) ? memberCount : extracted;
        } else {
            numberPart = memberCount;
            memberCount++;
        }

        // FORMAT: Prefix + 4 digits (e.g., M0145)
        const finalCode = `${prefix}${String(numberPart).padStart(4, '0')}`;

        // Name Splitting logic
        // If "Last, First MI" or "Last, First"
        let formattedName = rawName;

        // If name is "Last, First MI" check
        if (rawName && !rawName.includes(',')) {
            // Assume "First Last" or "First M. Last" -> Convert to "Last, First M."
            const parts = rawName.split(' ');
            if (parts.length > 1) {
                const last = parts.pop(); // Assume last word is Last Name
                const first = parts.join(' '); // Remainder is First (+ Middle)
                formattedName = `${last}, ${first}`;
            }
        }

        members.push({
            id: crypto.randomUUID(),
            name: formattedName,
            code: finalCode,
            type: currentType
        });
    });

    return members;
}
