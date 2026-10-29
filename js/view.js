class FamilyView {
    constructor() {
        this.treeContainer = document.getElementById('tree-container');
        this.treeContent = document.getElementById('tree-content');
        this.treeSvg = document.getElementById('tree-svg');
        this.noResults = document.getElementById('no-results');
        this.searchInput = document.getElementById('searchInput');
        this.roleFilter = document.getElementById('roleFilter');
        this.btnResetFilter = document.getElementById('btn-reset-filter');
        this.searchActiveBar = document.getElementById('search-active-bar');
        this.searchTermDisplay = document.getElementById('search-term-display');
        this.btnClearSearch = document.getElementById('btn-clear-search');
        this.modalOverlay = document.getElementById('modal-overlay');
        this.closeModalBtn = document.getElementById('close-modal');
        this.jsonModalOverlay = document.getElementById('json-modal-overlay');
        this.btnViewJson = document.getElementById('btn-view-json');
        this.closeJsonModalBtn = document.getElementById('close-json-modal');
        this.jsonTextarea = document.getElementById('json-textarea');
        this.btnCopyJson = document.getElementById('btn-copy-json');
        this.btnSaveJson = document.getElementById('btn-save-json');
        this.btnResetJson = document.getElementById('btn-reset-json');
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toast-message');
    }

    createPersonCardHTML(person, isHighlighted = false) {
        if (!person) return '';
        const initial = person.name.charAt(0).toUpperCase();
        const yearText = person.deathYear 
            ? `b. ${person.birthYear} – d. ${person.deathYear}` 
            : `b. ${person.birthYear}`;
        const highlightClass = isHighlighted ? 'ring-4 ring-emerald-400 bg-emerald-50/30' : '';

        return `
            <div class="person-card bg-white rounded-2xl card-shadow border-t-4 border-emerald-500 p-2 sm:p-2.5 flex flex-col items-center text-center w-24 sm:w-28 min-w-[90px] relative cursor-pointer hover:-translate-y-1 transition-all duration-200 select-none shrink-0 ${highlightClass}" data-person-id="${person.id}">
                <div class="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-xs rounded-full flex items-center justify-center shadow-inner mb-1">
                    ${initial}
                </div>
                <h3 class="font-bold text-slate-800 text-[10px] sm:text-[11px] mb-0.5 leading-snug break-words max-w-full">${person.name}</h3>
                <p class="text-[9px] font-semibold text-emerald-600 mb-0.5 leading-tight">${person.role}</p>
                <p class="text-[8px] sm:text-[9px] text-slate-400 font-medium">${yearText}</p>
            </div>
        `;
    }

    createPlusSeparatorHTML(coupleId) {
        return `<div data-couple-id="${coupleId}" class="plus-connector text-base sm:text-lg font-bold text-emerald-700 mx-1.5 sm:mx-2.5 flex items-center select-none shrink-0">+</div>`;
    }

    renderTree(allMembers, filteredMembers) {
        this.treeContent.innerHTML = '';
        this.treeSvg.innerHTML = '';

        if (filteredMembers.length === 0) {
            this.noResults.classList.remove('hidden');
            return;
        } else {
            this.noResults.classList.add('hidden');
        }

        const isFiltered = filteredMembers.length !== allMembers.length;
        if (isFiltered) {
            const searchGrid = document.createElement('div');
            searchGrid.className = 'w-full max-w-6xl flex flex-wrap justify-center gap-4 sm:gap-6 py-4';
            filteredMembers.forEach(person => {
                searchGrid.innerHTML += this.createPersonCardHTML(person);
            });
            this.treeContent.appendChild(searchGrid);
            return;
        }

        const wideGenBoxClass = 'w-full max-w-[1500px] bg-white/90 border border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-md relative z-0';

        // --- GENERATION 1 CONTAINER ---
        const gen1Container = document.createElement('div');
        gen1Container.id = 'gen-1';
        gen1Container.className = wideGenBoxClass;
        gen1Container.innerHTML = `
            <div class="flex justify-start w-full mb-6">
                <span class="tracking-widest font-bold text-xs text-emerald-700 uppercase bg-emerald-100/70 px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                    GENERATION 1
                </span>
            </div>
            <div class="flex items-center justify-around gap-8 sm:gap-16">
                <div class="flex items-center">
                    ${this.createPersonCardHTML(allMembers.find(m => m.id === 1))}
                    ${this.createPlusSeparatorHTML("1-2")}
                    ${this.createPersonCardHTML(allMembers.find(m => m.id === 2))}
                </div>
                <div class="flex items-center">
                    ${this.createPersonCardHTML(allMembers.find(m => m.id === 3))}
                    ${this.createPlusSeparatorHTML("3-4")}
                    ${this.createPersonCardHTML(allMembers.find(m => m.id === 4))}
                </div>
            </div>
        `;
        this.treeContent.appendChild(gen1Container);

        // --- GENERATION 2 CONTAINER ---
        const gen2Container = document.createElement('div');
        gen2Container.id = 'gen-2';
        gen2Container.className = wideGenBoxClass;

        const paternalIds = [101, 102, 5, 103, 104, 105, 106, 107, 108];
        const maternalIds = [201, 202, 6, 203, 204, 205, 206, 207, 208];

        const buildCompactZigZagHTML = (ids, highlightedId) => {
            const topGroupIds = [ids[0], ids[2], ids[4], ids[6], ids[8]]; 
            const botGroupIds = [ids[1], ids[3], ids[5], ids[7]];          

            const topHtml = topGroupIds.map(id => this.createPersonCardHTML(allMembers.find(m => m.id === id), id === highlightedId)).join('');
            const botHtml = botGroupIds.map(id => this.createPersonCardHTML(allMembers.find(m => m.id === id), id === highlightedId)).join('');

            return `
                <div class="flex flex-col gap-6 w-full items-center">
                    <div class="flex flex-nowrap justify-center w-full gap-3 px-2">
                        ${topHtml}
                    </div>
                    <div class="flex flex-nowrap justify-center w-full gap-3 px-2">
                        ${botHtml}
                    </div>
                </div>
            `;
        };

        gen2Container.innerHTML = `
            <div class="flex justify-start w-full mb-6">
                <span class="tracking-widest font-bold text-xs text-emerald-700 uppercase bg-emerald-100/70 px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                    GENERATION 2
                </span>
            </div>
            <div class="grid grid-cols-1 2xl:grid-cols-2 gap-12">
                <!-- Paternal 9 Beradik -->
                <div class="flex flex-col items-center">
                    ${buildCompactZigZagHTML(paternalIds, 5)}
                </div>
                <!-- Maternal 9 Beradik -->
                <div class="flex flex-col items-center">
                    ${buildCompactZigZagHTML(maternalIds, 6)}
                </div>
            </div>
        `;
        this.treeContent.appendChild(gen2Container);

        // --- GENERATION 3 CONTAINER ---
        const gen3Container = document.createElement('div');
        gen3Container.id = 'gen-3';
        gen3Container.className = wideGenBoxClass;

        const taufiq = allMembers.find(m => m.id === 7);
        const taufiqSpouse = allMembers.find(m => m.id === 9);
        const farhan = allMembers.find(m => m.id === 8);
        const farhanSpouse = allMembers.find(m => m.id === 10);
        const farahanis = allMembers.find(m => m.id === 11);
        const farahYasmin = allMembers.find(m => m.id === 12);

        gen3Container.innerHTML = `
            <div class="flex justify-start w-full mb-6">
                <span class="tracking-widest font-bold text-xs text-emerald-700 uppercase bg-emerald-100/70 px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                    GENERATION 3
                </span>
            </div>
            <div class="flex flex-col items-center gap-12 w-full">
                <div id="gen3-children-row" class="flex flex-nowrap items-start justify-center gap-6 sm:gap-10 px-2 w-full">
                    <div class="flex items-center">
                        ${taufiq ? this.createPersonCardHTML(taufiq) : ''}
                        ${taufiqSpouse ? this.createPlusSeparatorHTML("7-9") + this.createPersonCardHTML(taufiqSpouse) : ''}
                    </div>
                    <div class="flex items-center">
                        ${farhan ? this.createPersonCardHTML(farhan) : ''}
                        ${farhanSpouse ? this.createPlusSeparatorHTML("8-10") + this.createPersonCardHTML(farhanSpouse) : ''}
                    </div>
                    <div class="flex items-center">
                        ${farahanis ? this.createPersonCardHTML(farahanis) : ''}
                    </div>
                    <div class="flex items-center">
                        ${farahYasmin ? this.createPersonCardHTML(farahYasmin) : ''}
                    </div>
                </div>
            </div>
        `;
        this.treeContent.appendChild(gen3Container);

        setTimeout(() => this.drawTreeConnectors(), 50);
    }

    drawTreeConnectors() {
        this.treeSvg.innerHTML = '';
        const containerRect = this.treeContainer.getBoundingClientRect();

        const getTopCenter = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2 - containerRect.left, y: r.top - containerRect.top };
        };

        const getBottomCenter = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2 - containerRect.left, y: r.bottom - containerRect.top };
        };

        const addPath = (d) => {
            if (!d || !d.trim()) return;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            path.setAttribute("stroke", "#059669");
            path.setAttribute("stroke-width", "2.5");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");
            this.treeSvg.appendChild(path);
        };

        const drawCoupleToChildrenPath = (coupleId, childIds) => {
            const coupleEl = document.querySelector(`[data-couple-id="${coupleId}"]`);
            if (!coupleEl) return;
            const pCouple = getBottomCenter(coupleEl);

            const childTopCenters = childIds.map(id => {
                const card = document.querySelector(`[data-person-id="${id}"]`);
                return getTopCenter(card);
            }).filter(Boolean);

            if (childTopCenters.length > 0) {
                const firstX = childTopCenters[0].x;
                const lastX = childTopCenters[childTopCenters.length - 1].x;
                const branchY = pCouple.y + 185; 

                let pathString = `M ${pCouple.x} ${pCouple.y} L ${pCouple.x} ${branchY}`;
                pathString += ` M ${firstX} ${branchY} L ${lastX} ${branchY}`;

                childTopCenters.forEach(pt => {
                    pathString += ` M ${pt.x} ${branchY} L ${pt.x} ${pt.y}`;
                });

                addPath(pathString);
            }
        };

        // 1. Datuk/Nenek Paternal ke 9 Beradik
        const paternalChildIds = [101, 102, 5, 103, 104, 105, 106, 107, 108];
        drawCoupleToChildrenPath("1-2", paternalChildIds);

        // 2. Datuk/Nenek Maternal ke 9 Beradik
        const maternalChildIds = [201, 202, 6, 203, 204, 205, 206, 207, 208];
        drawCoupleToChildrenPath("3-4", maternalChildIds);

        // 3. Ayah & Mak ke Gen 3
        const gen2Box = document.querySelector('#gen-2');
        const fatherCard = document.querySelector('[data-person-id="5"]');
        const motherCard = document.querySelector('[data-person-id="6"]');
        const gen3ChildIds = [7, 8, 11, 12];

        if (gen2Box && fatherCard && motherCard) {
            const gen2Rect = gen2Box.getBoundingClientRect();
            const pFather = getBottomCenter(fatherCard);
            const pMother = getBottomCenter(motherCard);
            
            const childTopCenters = gen3ChildIds.map(id => {
                const card = document.querySelector(`[data-person-id="${id}"]`);
                return getTopCenter(card);
            }).filter(Boolean);

            if (childTopCenters.length > 0) {
                const firstX = childTopCenters[0].x;
                const lastX = childTopCenters[childTopCenters.length - 1].x;
                
                const dropY = (gen2Rect.bottom - containerRect.top) + 20; 
                const branchY = dropY + 30;

                let pathString = `M ${pFather.x} ${pFather.y} L ${pFather.x} ${dropY}`;
                pathString += ` M ${pMother.x} ${pMother.y} L ${pMother.x} ${dropY}`;
                pathString += ` M ${pFather.x} ${dropY} L ${pMother.x} ${dropY}`;
                
                const centerX = (pFather.x + pMother.x) / 2;
                pathString += ` M ${centerX} ${dropY} L ${centerX} ${branchY}`;
                pathString += ` M ${firstX} ${branchY} L ${lastX} ${branchY}`;

                childTopCenters.forEach(pt => {
                    pathString += ` M ${pt.x} ${branchY} L ${pt.x} ${pt.y}`;
                });

                addPath(pathString);
            }
        }
    }

    openPersonModal(person, relatives, onNavigate) {
        document.getElementById('modal-avatar').textContent = person.name.charAt(0).toUpperCase();
        document.getElementById('modal-name').textContent = person.name;
        document.getElementById('modal-role').textContent = person.role;
        document.getElementById('modal-gender').textContent = person.gender || 'N/A';
        
        const lifespanText = person.deathYear 
            ? `Born in ${person.birthYear} (Passed away: ${person.deathYear})` 
            : `Born in ${person.birthYear}`;
        document.getElementById('modal-year').textContent = lifespanText;
        
        document.getElementById('modal-bio').textContent = person.description || 'No biography details provided.';

        const renderBadges = (containerId, relativeList) => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            if (!relativeList || relativeList.length === 0) {
                container.innerHTML = `<span class="text-xs text-slate-400 italic">None listed</span>`;
            } else {
                relativeList.forEach(rel => {
                    const btn = document.createElement('button');
                    btn.className = 'bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all shadow-sm flex items-center gap-1';
                    btn.textContent = `${rel.name} (${rel.role})`;
                    btn.onclick = () => onNavigate(rel.id);
                    container.appendChild(btn);
                });
            }
        };

        renderBadges('modal-parents', relatives.parents);
        renderBadges('modal-spouses', relatives.spouses);
        renderBadges('modal-children', relatives.children);
        this.modalOverlay.classList.remove('hidden');
    }

    closePersonModal() { this.modalOverlay.classList.add('hidden'); }
    openJsonModal(jsonString) {
        this.jsonTextarea.value = jsonString;
        this.jsonModalOverlay.classList.remove('hidden');
    }
    closeJsonModal() { this.jsonModalOverlay.classList.add('hidden'); }
    showToast(msg) {
        this.toastMessage.textContent = msg;
        this.toast.classList.remove('translate-y-[-100px]', 'opacity-0');
        setTimeout(() => { this.toast.classList.add('translate-y-[-100px]', 'opacity-0'); }, 2500);
    }
}