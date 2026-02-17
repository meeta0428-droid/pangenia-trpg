// Race Data
const RACES = {
    sun: {
        name: "陽の民",
        stats: {}, // No fixed stats
        anyCount: 2,
        description: "任意の能力値＋1×2"
    },
    rain: {
        name: "雨の民 (アメ)",
        stats: {},
        anyCount: 0,
        description: "初期チームプール＋４。開始時の獲得枚数４枚扱い。"
    },
    storm: {
        name: "嵐の民 (アラシ)",
        stats: { strength: 1 },
        anyCount: 0,
        description: "剛＋１。近接攻撃ダメージ＋1。"
    },
    hail: {
        name: "雹の民 (ヒョウ)",
        stats: {},
        anyCount: 0,
        description: "HP＋５。サブ武器を2つ道具欄に装備できる。"
    },
    dawn: {
        name: "暁の民 (ギョウ)",
        stats: { skill: 1 },
        anyCount: 0,
        description: "巧＋１。受けるダメージ-1。"
    },
    mist: {
        name: "霧の民 (キリ)",
        stats: { charm: 1 },
        anyCount: 0,
        description: "魅＋１。チームプールが5点以上ある時、【魅】判定に確定成功＋１。"
    },
    thunder: {
        name: "雷の民 (イカヅチ)",
        stats: { speed: 2 },
        anyCount: 0,
        description: "速＋２、HP−２。水中を自在に動け、ペナルティを受けない。また、溺れない。"
    },
    night: {
        name: "夜の民 (ヨル)",
        stats: { intellect: 1 },
        anyCount: 0,
        description: "知＋１。落下した時の高さを−10して扱う。"
    },
    shadow: {
        name: "陰の民 (カゲ)",
        stats: { speed: 1, charm: -1 },
        anyCount: 1,
        description: "速＋１、任意の能力＋１、魅−１。"
    },
    fallen: {
        name: "堕天の民 (ダテン)",
        stats: { intellect: 1, skill: 1 },
        anyCount: 0,
        description: "知、巧＋１。回復の効果−１。カンナギ取得不可。"
    }
};

const JOBS = {
    hajikiya: { name: "ハジキヤ", description: "古代技術に精通し、銃火器を扱うことを得意とする。アタッカー" },
    maite: { name: "マイテ", description: "支援を得意とする踊り手。バッファー・アタッカー" },
    kannagi: { name: "カンナギ", description: "先祖の力を呼び覚まし、力を与える。バッファー・ヒーラー" },
    majinai: { name: "マジナイ", description: "大地の力を操り、攻撃を行う。アタッカー" },
    kakure: { name: "カクレ", description: "影に忍び、特異な攻撃を行う。アタッカー・回避型タンク" },
    matagi: { name: "マタギ", description: "狩猟に特化した戦士。前衛アタッカー" },
    sakimori: { name: "サキモリ", description: "防御に特化した戦士。前衛タンク" },
    mawashi: { name: "マワシ", description: "使役獣を伴い、様々な方向に活躍できる。前衛アタッカー・タンク" },
    kusushi: { name: "クスシ", description: "道具を強化して使うことができる。後衛アタッカー・バッファー・ヒーラー" },
    kobushi: { name: "コブシ", description: "自らの拳を使い、格闘術で戦う。前衛アタッカー・タンク" },
    siren: { name: "サイレン", description: "自らの声を使い、様々な効果を及ぼす。後衛バッファー・デバッファー・ヒーラー" },
    matoi: { name: "マトイ", description: "特殊装備「機構」を纏い、戦う戦士。前衛アタッカー・タンク" },
    korogashi: { name: "コロガシ", description: "騎鋼獣を駆り、攻撃や防御を行う。前衛アタッカー・タンク" },
    touken: { name: "トウケン", description: "近接武器を用いて、速度に特化した攻撃を行う。前衛アタッカー・回避型タンク" }
};

// Initial state
const baseStats = {
    strength: 3,
    skill: 3,
    intellect: 3,
    speed: 3,
    charm: 3
};

// Mutable state
let currentGrowths = {
    strength: 0,
    skill: 0,
    intellect: 0,
    speed: 0,
    charm: 0
};

let currentRaceKey = null;
let raceChoices = []; // Array of selected stats for "Any" choices

// History of growths to allow undo (decreasing stats)
// Each item in history: { stat: string, cost: number }
let growthHistory = [];

/**
 * Calculates the cost for the Nth growth event.
 * @param {number} n - The growth sequence number (1-indexed).
 * @returns {number} The EC cost for this growth.
 */
function calculateCost(n) {
    if (n === 1) return 5;
    return 10 * Math.floor(n / 2);
}

/**
 * Calculates current total value for a stat.
 * Base (3) + Race Fixed + Race Choice + Growth
 */
function getStatValue(statKey) {
    let val = baseStats[statKey] + currentGrowths[statKey];

    if (currentRaceKey && RACES[currentRaceKey]) {
        const race = RACES[currentRaceKey];
        // Add fixed race stats
        if (race.stats[statKey]) {
            val += race.stats[statKey];
        }
        // Add choice race stats
        raceChoices.forEach(choice => {
            if (choice === statKey) {
                val += 1;
            }
        });
    }
    return val;
}

/**
 * Updates the UI based on current state.
 */
function updateUI() {
    const stats = ['strength', 'skill', 'intellect', 'speed', 'charm'];

    stats.forEach(stat => {
        document.getElementById(`val-${stat}`).textContent = getStatValue(stat);
    });

    // Calculate total cost from history
    let totalCost = growthHistory.reduce((sum, item) => sum + item.cost, 0);

    // Add Job 2 cost if selected
    const job2Select = document.getElementById('job-2');
    if (job2Select && job2Select.value) {
        totalCost += 10;
    }

    // Add Equipment costs
    const equipCosts = document.querySelectorAll('.equip-cost');
    equipCosts.forEach(input => {
        const val = parseInt(input.value) || 0;
        totalCost += val;
    });

    // Add Item costs
    const itemCosts = document.querySelectorAll('.item-cost');
    itemCosts.forEach(input => {
        const val = parseInt(input.value) || 0;
        totalCost += val;
    });

    // Add Arts Pack costs
    const artsInputs = document.querySelectorAll('.arts-input');
    artsInputs.forEach(input => {
        if (input.value.trim() !== '') {
            totalCost += parseInt(input.dataset.cost);
        }
    });

    document.getElementById('total-cost').textContent = totalCost;

    // Calculate next cost
    const nextGrowthIndex = growthHistory.length + 1;
    const nextCost = calculateCost(nextGrowthIndex);
    document.getElementById('next-cost').textContent = nextCost;

    // Update total growth count
    document.getElementById('total-growth-count').textContent = growthHistory.length;

    // --- HP Calculation ---
    calculateHP();
}

/**
 * Calculates and updates Max HP
 * Formula: 10 + Strength + Body Equip HP + Other Mod
 */
function calculateHP() {
    const strength = getStatValue('strength');

    // Get Body Equipment HP
    // The 3rd row in equipment section is Body Equip (index 2)
    const equipRows = document.querySelectorAll('.equipment-section .equip-row');
    let bodyHp = 0;
    if (equipRows[2]) {
        const hpInput = equipRows[2].querySelector('.equip-hp');
        if (hpInput) {
            bodyHp = parseInt(hpInput.value) || 0;
        }
    }

    // Get Other Mod
    const otherModInput = document.getElementById('hp-other-mod');
    const otherMod = parseInt(otherModInput.value) || 0;

    const maxHp = 10 + strength + bodyHp + otherMod;
    document.getElementById('val-max-hp').textContent = maxHp;
}

/**
 * Populate race dropdown
 */
function initRaceDropdown() {
    const select = document.getElementById('char-race');
    for (const key in RACES) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = RACES[key].name;
        select.appendChild(option);
    }

    select.addEventListener('change', (e) => {
        currentRaceKey = e.target.value;
        raceChoices = []; // Reset choices on race change
        renderRaceInfo();
        updateUI();
    });
}

function initJobDropdowns() {
    const job1 = document.getElementById('job-1');
    const job2 = document.getElementById('job-2');

    const updateDescription = (selectId, descId) => {
        const select = document.getElementById(selectId);
        const val = select.value;
        const descEl = document.getElementById(descId);
        if (val && JOBS[val]) {
            descEl.textContent = JOBS[val].description;
            descEl.style.display = 'block';
        } else {
            descEl.style.display = 'none';
            descEl.textContent = '';
        }
    };

    const updateJobOptions = () => {
        const val1 = job1.value;
        const val2 = job2.value;

        // Update Job 1 options
        Array.from(job1.options).forEach(opt => {
            if (opt.value && opt.value === val2) {
                opt.disabled = true;
            } else {
                opt.disabled = false;
            }
        });

        // Update Job 2 options
        Array.from(job2.options).forEach(opt => {
            if (opt.value && opt.value === val1) {
                opt.disabled = true;
            } else {
                opt.disabled = false;
            }
        });
    };

    [job1, job2].forEach(select => {
        for (const key in JOBS) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = JOBS[key].name;
            select.appendChild(option);
        }
        select.addEventListener('change', () => {
            updateDescription(select.id, `${select.id}-desc`);
            updateJobOptions();
            updateUI();
        });
    });
}

/**
 * Render race description and choices
 */
function renderRaceInfo() {
    const infoSection = document.getElementById('race-info-section');
    const descEl = document.getElementById('race-description');
    const choicesContainer = document.getElementById('race-choice-container');

    if (!currentRaceKey) {
        infoSection.style.display = 'none';
        return;
    }

    const race = RACES[currentRaceKey];
    infoSection.style.display = 'block';
    descEl.textContent = race.description;
    choicesContainer.innerHTML = '';

    // Create dropdowns for "Any" choices
    const selects = [];
    for (let i = 0; i < race.anyCount; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'choice-wrapper';

        const label = document.createElement('span');
        label.textContent = `任意上昇 ${i + 1}: `;

        const select = document.createElement('select');
        select.innerHTML = `<option value="" disabled selected>選択してください</option>`;
        select.dataset.index = i; // Store index for reference

        const stats = [
            { key: 'strength', label: '剛 (Strength)' },
            { key: 'skill', label: '巧 (Skill)' },
            { key: 'intellect', label: '知 (Intellect)' },
            { key: 'speed', label: '速 (Speed)' },
            { key: 'charm', label: '魅 (Charm)' }
        ];

        stats.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.key;
            opt.textContent = s.label;
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            raceChoices[i] = e.target.value;
            updateUI();
            updateRaceChoiceOptions(selects);
        });

        selects.push(select);
        wrapper.appendChild(label);
        wrapper.appendChild(select);
        choicesContainer.appendChild(wrapper);
    }
}

/**
 * Updates option availability in race choice dropdowns to prevent duplicates.
 * @param {HTMLSelectElement[]} selects - Array of select elements.
 */
function updateRaceChoiceOptions(selects) {
    const currentSelections = selects.map(s => s.value).filter(v => v);

    selects.forEach(select => {
        const output = select.value;
        Array.from(select.options).forEach(opt => {
            if (!opt.value) return; // Skip default/disabled option
            // Disable if selected elsewhere (but not if selected by self)
            if (currentSelections.includes(opt.value) && opt.value !== output) {
                opt.disabled = true;
            } else {
                opt.disabled = false;
            }
        });
    });
}

/**
 * Handles button clicks to increase or decrease stats.
 */
function updateStat(stat, change) {
    if (change === 1) {
        // Increase
        const growthIndex = growthHistory.length + 1;
        const cost = calculateCost(growthIndex);

        currentGrowths[stat]++;
        growthHistory.push({ stat: stat, cost: cost });

    } else if (change === -1) {
        // Decrease
        if (currentGrowths[stat] <= 0) return; // Can only decrease added growths

        // Remove the last growth action (LIFO for cost fairness in this simple model)
        // Note: In a real complex app we might want to ensure we remove *this specific stat's* growth
        // but for now we follow the previous logic of popping history + reducing count.
        // Wait, if I have Growth: Str, Int.
        // If I reduce Str, I am effectively undoing "A growth".
        // To be precise: If I reduce Str, I should verify I HAVE Str growth.

        if (currentGrowths[stat] > 0) {
            currentGrowths[stat]--;
            growthHistory.pop();
        }
    }

    updateUI();
}

function initEquipmentListeners() {
    const inputs = document.querySelectorAll('.equip-cost');
    inputs.forEach(input => {
        input.addEventListener('input', updateUI);
    });

    // Listen for Body Equip HP changes
    const hpInputs = document.querySelectorAll('.equip-hp');
    hpInputs.forEach(input => {
        input.addEventListener('input', updateUI);
    });

    // Listen for Other Mod changes
    const otherModInput = document.getElementById('hp-other-mod');
    if (otherModInput) {
        otherModInput.addEventListener('input', updateUI);
    }

    const itemInputs = document.querySelectorAll('.item-cost');
    itemInputs.forEach(input => {
        input.addEventListener('input', updateUI);
    });

    const artsInputs = document.querySelectorAll('.arts-input');
    artsInputs.forEach(input => {
        // Use 'input' event to update instantly on typing
        input.addEventListener('input', updateUI);
    });
}

// --- Save/Load System ---

function initSaveSystem() {
    const selector = document.getElementById('save-slot-select');
    const statusDiv = document.getElementById('slot-status');

    // Generate 50 slots
    for (let i = 1; i <= 50; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Slot ${i}`;
        selector.appendChild(opt);
    }

    // Load initial status
    updateSlotStatus();

    selector.addEventListener('change', updateSlotStatus);

    document.getElementById('btn-save').addEventListener('click', () => {
        try {
            const slot = selector.value;
            const data = collectData();
            localStorage.setItem(`pangaea_char_${slot}`, JSON.stringify(data));
            updateSlotStatus();
            alert(`Slot ${slot} に保存しました。`);
        } catch (e) {
            alert(`保存に失敗しました: ${e.message}`);
            console.error(e);
        }
    });

    document.getElementById('btn-load').addEventListener('click', () => {
        try {
            const slot = selector.value;
            const json = localStorage.getItem(`pangaea_char_${slot}`);
            if (json) {
                if (confirm(`Slot ${slot} を読み込みますか？現在の入力内容は失われます。`)) {
                    applyData(JSON.parse(json));
                    alert(`Slot ${slot} を読み込みました。`);
                }
            } else {
                alert('保存データがありません。');
            }
        } catch (e) {
            alert(`読み込みに失敗しました: ${e.message}`);
            console.error(e);
        }
    });

    document.getElementById('btn-delete').addEventListener('click', () => {
        const slot = selector.value;
        if (localStorage.getItem(`pangaea_char_${slot}`)) {
            if (confirm(`Slot ${slot} のデータを削除しますか？`)) {
                localStorage.removeItem(`pangaea_char_${slot}`);
                updateSlotStatus();
                alert(`Slot ${slot} を削除しました。`);
            }
        }
    });
}

function updateSlotStatus() {
    const selector = document.getElementById('save-slot-select');
    const statusDiv = document.getElementById('slot-status');
    const slot = selector.value;
    const json = localStorage.getItem(`pangaea_char_${slot}`);

    if (json) {
        const data = JSON.parse(json);
        statusDiv.textContent = `データあり: ${data.name || '名称未設定'} (${data.race || '種族未設定'})`;
        statusDiv.style.color = 'var(--secondary-accent)';
    } else {
        statusDiv.textContent = 'データなし (Empty)';
        statusDiv.style.color = '#888';
    }
}

function collectData() {
    return {
        name: document.getElementById('char-name').value,
        race: document.getElementById('char-race').value,
        raceChoices: raceChoices,
        job1: document.getElementById('job-1').value,
        job2: document.getElementById('job-2').value,
        growths: currentGrowths,
        growthHistory: growthHistory,
        equipment: Array.from(document.querySelectorAll('.equipment-section .equip-row')).map(row => ({
            name: row.querySelector('.equip-name').value,
            effect: row.querySelector('.equip-effect') ? row.querySelector('.equip-effect').value : '',
            cost: row.querySelector('.equip-cost').value,
            hp: row.querySelector('.equip-hp') ? row.querySelector('.equip-hp').value : 0
        })),
        items: Array.from(document.querySelectorAll('.items-section .item-row')).map(row => ({
            name: row.querySelector('.item-name').value,
            effect: row.querySelector('.item-effect').value,
            cost: row.querySelector('.item-cost').value
        })),
        arts: Array.from(document.querySelectorAll('.arts-input')).map(input => input.value),
        background: {
            past: document.querySelectorAll('.background-section textarea')[0].value,
            reason: document.querySelectorAll('.background-section textarea')[1].value,
            social: document.querySelectorAll('.background-section textarea')[2].value,
            future: document.querySelectorAll('.background-section textarea')[3].value
        },
        hpOtherMod: document.getElementById('hp-other-mod').value,
        currentHp: document.getElementById('val-current-hp').value,
        teamPool: document.getElementById('team-pool-value').value
    };
}

function applyData(data) {
    // 1. Basic Info
    document.getElementById('char-name').value = data.name || '';

    // 2. Race
    const raceSelect = document.getElementById('char-race');
    raceSelect.value = data.race || '';
    // Trigger change to update UI and "Any" selectors
    raceSelect.dispatchEvent(new Event('change'));

    // Restore Race Choices (Any stats)
    if (data.raceChoices && Array.from(document.querySelectorAll('#race-choice-container select')).length > 0) {
        raceChoices = data.raceChoices;
        const choiceSelects = document.querySelectorAll('#race-choice-container select');
        choiceSelects.forEach((sel, idx) => {
            if (raceChoices[idx]) sel.value = raceChoices[idx];
        });
    }

    // 3. Stats & History
    // Reset to base first (handled by race change), then apply stats
    // But simply setting values isn't enough because of history tracking.
    // To restore correctly, we need to set the internal state.
    currentGrowths = data.growths || { strength: 0, skill: 0, intellect: 0, speed: 0, charm: 0 };
    growthHistory = data.growthHistory || [];

    // 4. Jobs
    document.getElementById('job-1').value = data.job1 || '';
    document.getElementById('job-1').dispatchEvent(new Event('change'));
    document.getElementById('job-2').value = data.job2 || '';
    document.getElementById('job-2').dispatchEvent(new Event('change'));

    // 5. Equipment
    if (data.equipment) {
        const rows = document.querySelectorAll('.equipment-section .equip-row');
        data.equipment.forEach((eq, idx) => {
            if (rows[idx]) {
                rows[idx].querySelector('.equip-name').value = eq.name;
                rows[idx].querySelector('.equip-cost').value = eq.cost;
                const effectInput = rows[idx].querySelector('.equip-effect');
                if (effectInput) {
                    effectInput.value = eq.effect || '';
                }
                const hpInput = rows[idx].querySelector('.equip-hp');
                if (hpInput && eq.hp !== undefined) {
                    hpInput.value = eq.hp;
                }
            }
        });
    }

    // 6. Items
    if (data.items) {
        const rows = document.querySelectorAll('.items-section .item-row');
        data.items.forEach((it, idx) => {
            if (rows[idx]) {
                rows[idx].querySelector('.item-name').value = it.name;
                rows[idx].querySelector('.item-effect').value = it.effect;
                rows[idx].querySelector('.item-cost').value = it.cost;
            }
        });
    }

    // 7. Arts
    if (data.arts) {
        const inputs = document.querySelectorAll('.arts-input');
        data.arts.forEach((val, idx) => {
            if (inputs[idx]) inputs[idx].value = val;
        });
    }

    // 8. Background
    if (data.background) {
        const textareas = document.querySelectorAll('.background-section textarea');
        textareas[0].value = data.background.past || '';
        textareas[1].value = data.background.reason || '';
        textareas[2].value = data.background.social || '';
        textareas[3].value = data.background.future || '';
    }

    // 9. HP Other Mod
    if (data.hpOtherMod !== undefined) {
        document.getElementById('hp-other-mod').value = data.hpOtherMod;
    }

    // 10. Current HP
    if (data.currentHp !== undefined) {
        document.getElementById('val-current-hp').value = data.currentHp;
    }

    // 11. Team Pool
    if (data.teamPool !== undefined) {
        document.getElementById('team-pool-value').value = data.teamPool;
    }

    updateUI();
}

// Initialize
initRaceDropdown();
initJobDropdowns();
initEquipmentListeners();
initSaveSystem();
updateUI();

// --- Firebase Realtime Sync ---

window.addEventListener('firebase-ready', () => {
    console.log('Firebase ready, initializing sync...');
    const statusEl = document.getElementById('firebase-status');
    statusEl.textContent = 'Connecting to Firebase...';
    statusEl.style.color = 'orange';

    const db = window.firebaseDb;
    const ref = window.firebaseRef;
    const set = window.firebaseSet;
    const onValue = window.firebaseOnValue;

    // Use a shared path for the team pool. 
    // In a real app, you might generate a unique session ID.
    const teamPoolRef = ref(db, 'pangea_session/teamPool');
    const input = document.getElementById('team-pool-value');

    // 1. UI -> Firebase
    input.addEventListener('input', (e) => {
        statusEl.textContent = 'Syncing...';
        const val = parseInt(e.target.value) || 0;
        set(teamPoolRef, val)
            .then(() => {
                statusEl.textContent = 'Synced';
                statusEl.style.color = 'green';
                setTimeout(() => statusEl.textContent = 'Online', 2000);
            })
            .catch(err => {
                console.error('Firebase write failed:', err);
                statusEl.textContent = 'Error: Write Failed';
                statusEl.style.color = 'red';
                alert('同期エラー: ' + err.message);
            });
    });

    // 2. Firebase -> UI
    onValue(teamPoolRef, (snapshot) => {
        statusEl.textContent = 'Online';
        statusEl.style.color = 'green';

        const val = snapshot.val();
        // Only update if value exists and is different to avoid cursor jumping if focused
        if (val !== null && parseInt(input.value) !== val) {
            input.value = val;
            console.log('Synced Team Pool from Firebase:', val);
        }
    }, (error) => {
        console.error('Firebase read failed:', error);
        statusEl.textContent = 'Error: Read Failed';
        statusEl.style.color = 'red';
        alert('読み込みエラー: ' + error.message);
    });
});
