import { read, utils } from 'xlsx';

export const ImportService = {
    importMembersFromUrl: async (url) => {
        try {
            console.log(`Fetching from: ${url}`);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Fetch failed with status: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            console.log(`File size: ${arrayBuffer.byteLength} bytes`);

            if (arrayBuffer.byteLength === 0) {
                throw new Error("File is empty");
            }

            const wb = read(arrayBuffer);

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

                // Generate Code if missing
                const code = row['Code'] || row['Member Code'] || `M${String(memberCount).padStart(3, '0')}`;
                memberCount++;

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
                    code: String(code),
                    type: currentType
                });
            });

            return members;
        } catch (error) {
            console.error("Import Error Details:", error);
            throw new Error(`Import Failed: ${error.message}`);
        }
    }
};
