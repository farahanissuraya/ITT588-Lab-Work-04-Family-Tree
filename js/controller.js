class FamilyController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init();
    }

    async init() {
        await this.model.loadInitialData();
        this.updateView();
        this.bindSearchAndFilter();
        this.bindCardClicks();
        this.bindModalEvents();
        this.bindJsonEvents();
        this.bindResize();
    }

    updateView() {
        const query = this.view.searchInput.value;
        const role = this.view.roleFilter.value;
        const filtered = this.model.filterMembers(query, role);
        const all = this.model.getAllMembers();

        this.view.renderTree(all, filtered);

        if (query || role !== 'ALL') {
            this.view.btnResetFilter.classList.remove('hidden');
            this.view.searchActiveBar.classList.remove('hidden');
            this.view.searchTermDisplay.textContent = `"${query}" [Role: ${role}]`;
        } else {
            this.view.btnResetFilter.classList.add('hidden');
            this.view.searchActiveBar.classList.add('hidden');
        }
    }

    bindSearchAndFilter() {
        const handleInput = () => this.updateView();
        this.view.searchInput.addEventListener('input', handleInput);
        this.view.roleFilter.addEventListener('change', handleInput);
        const clearAllFilters = () => {
            this.view.searchInput.value = '';
            this.view.roleFilter.value = 'ALL';
            this.updateView();
        };
        this.view.btnResetFilter.addEventListener('click', clearAllFilters);
        this.view.btnClearSearch.addEventListener('click', clearAllFilters);
    }

    bindCardClicks() {
        this.view.treeContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.person-card');
            if (card) {
                const id = parseInt(card.dataset.personId);
                this.openPersonDetail(id);
            }
        });
    }

    openPersonDetail(id) {
        const person = this.model.getPersonById(id);
        if (person) {
            const relatives = this.model.getRelativesInfo(person);
            this.view.openPersonModal(person, relatives, (targetId) => { this.openPersonDetail(targetId); });
        }
    }

    bindModalEvents() {
        this.view.closeModalBtn.addEventListener('click', () => this.view.closePersonModal());
        this.view.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.view.modalOverlay) this.view.closePersonModal();
        });
    }

    bindJsonEvents() {
        this.view.btnViewJson.addEventListener('click', () => {
            this.view.openJsonModal(this.model.getRawJSONString());
        });
        this.view.closeJsonModalBtn.addEventListener('click', () => this.view.closeJsonModal());
        this.view.jsonModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.view.jsonModalOverlay) this.view.closeJsonModal();
        });
        this.view.btnCopyJson.addEventListener('click', () => {
            this.view.jsonTextarea.select();
            try {
                document.execCommand('copy');
                this.view.showToast("JSON copied to clipboard!");
            } catch (err) {
                this.view.showToast("Failed to copy JSON text.");
            }
        });
        this.view.btnSaveJson.addEventListener('click', () => {
            const rawVal = this.view.jsonTextarea.value;
            const res = this.model.setRawJSONString(rawVal);
            if (res.success) {
                this.updateView();
                this.view.closeJsonModal();
                this.view.showToast("Dataset updated successfully!");
            } else {
                this.view.showToast("Invalid JSON: " + res.error);
            }
        });
        this.view.btnResetJson.addEventListener('click', () => {
            this.model.resetToDefault();
            this.view.jsonTextarea.value = this.model.getRawJSONString();
            this.updateView();
            this.view.showToast("Reset to default dataset.");
        });
    }

    bindResize() {
        window.addEventListener('resize', () => { this.view.drawTreeConnectors(); });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new FamilyController(new FamilyModel(), new FamilyView());
});