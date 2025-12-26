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
    }
};
