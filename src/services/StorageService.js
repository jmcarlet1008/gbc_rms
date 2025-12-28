const KEYS = {
    MEMBERS: 'gbc_members',
    SERVICE_PREFIX: 'gbc_service_'
};

export const StorageService = {
    // Members
    getMembers: () => {
        const data = localStorage.getItem(KEYS.MEMBERS);
        return data ? JSON.parse(data) : [];
    },

    saveMembers: (members) => {
        localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    },

    // Service Records
    getServiceRecord: (serviceType, date) => {
        const key = `${KEYS.SERVICE_PREFIX}${date}_${serviceType}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    saveServiceRecord: (serviceType, date, data) => {
        const key = `${KEYS.SERVICE_PREFIX}${date}_${serviceType}`;
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Helper to clear mock data flag or check if init reference exists
    hasInitialized: () => {
        return !!localStorage.getItem(KEYS.MEMBERS);
    },

    getAllServiceRecords: () => {
        const records = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(KEYS.SERVICE_PREFIX)) {
                // key format: gbc_service_YYYY-MM-DD_ServiceType
                const parts = key.replace(KEYS.SERVICE_PREFIX, '').split('_');
                // parts[0] is date, parts[1] is Service Type (which might contain spaces/underscores? actually the stored key uses simple concat)
                // Actually the key construction is `${KEYS.SERVICE_PREFIX}${date}_${serviceType}`.
                // If serviceType has underscores, this split might be tricky. 
                // However, we just need the data.

                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data) {
                        // We also need the metadata which is in the key, but it might be easier to just return the data object
                        // and let the component sort it out, or enrich it here.
                        // Let's reconstruct the date and type from the key.
                        // The date is always 10 chars (YYYY-MM-DD).
                        const dateAndType = key.replace(KEYS.SERVICE_PREFIX, '');
                        const date = dateAndType.substring(0, 10);
                        const type = dateAndType.substring(11); // Skip the underscore after date

                        records.push({
                            date,
                            serviceType: type,
                            ...data
                        });
                    }
                } catch (e) {
                    console.error("Failed to parse record", key, e);
                }
            }
        }
        return records.sort((a, b) => b.date.localeCompare(a.date)); // Default sort desc
    }
};
