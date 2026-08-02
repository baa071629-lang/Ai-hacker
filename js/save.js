class SaveManager {
    constructor() {
        this.saveKey = "ghost_protocol_save";
    }

    save(state) {
        try {
            const data = JSON.stringify(state);
            localStorage.setItem(this.saveKey, data);
            return true;
        } catch (e) {
            console.error("Erreur de sauvegarde:", e);
            return false;
        }
    }

    load() {
        try {
            const data = localStorage.getItem(this.saveKey);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error("Erreur de chargement:", e);
            return null;
        }
    }

    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    deleteSave() {
        localStorage.removeItem(this.saveKey);
    }
}
