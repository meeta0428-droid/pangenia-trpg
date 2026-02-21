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
    hajikiya: { name: "ハジキヤ", description: "巧＋２、知＋１｜古代技術に精通し、銃火器を扱うことを得意とする。アタッカー" },
    maite: { name: "マイテ", description: "巧＋２、魅＋１｜支援を得意とする踊り手。バッファー・アタッカー" },
    kannagi: { name: "カンナギ", description: "知＋２、魅＋１｜先祖の力を呼び覚まし、力を与える。バッファー・ヒーラー" },
    majinai: { name: "マジナイ", description: "知＋３｜大地の力を操り、攻撃を行う。アタッカー" },
    kakure: { name: "カクレ", description: "速＋２、魅＋１｜影に忍び、特異な攻撃を行う。アタッカー・回避型タンク" },
    matagi: { name: "マタギ", description: "剛＋２、巧＋１｜狩猟に特化した戦士。前衛アタッカー" },
    sakimori: { name: "サキモリ", description: "剛＋２、魅＋１｜防御に特化した戦士。前衛タンク" },
    mawashi: { name: "マワシ", description: "剛＋１、速＋１、魅＋１｜使役獣を伴い、様々な方向に活躍できる。前衛アタッカー・タンク" },
    kusushi: { name: "クスシ", description: "知＋２、巧＋１｜道具を強化して使うことができる。後衛アタッカー・バッファー・ヒーラー" },
    kobushi: { name: "コブシ", description: "剛＋２、速＋１｜自らの拳を使い、格闘術で戦う。前衛アタッカー・タンク" },
    siren: { name: "サイレン", description: "魅＋３｜自らの声を使い、様々な効果を及ぼす。後衛バッファー・デバッファー・ヒーラー" },
    matoi: { name: "マトイ", description: "巧＋２、剛＋１｜特殊装備「機構」を纏い、戦う戦士。前衛アタッカー・タンク" },
    korogashi: { name: "コロガシ", description: "巧＋２、速＋１｜騎鋼獣を駆り、攻撃や防御を行う。前衛アタッカー・タンク" },
    touken: { name: "トウケン", description: "速＋３｜近接武器を用いて、速度に特化した攻撃を行う。前衛アタッカー・回避型タンク" }
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

console.log("Script loaded. Initializing functions...");

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
 * RFランク表示を更新する
 * 1→ランク1, 4→ランク2, 10→ランク3
 */
/**
 * 現在のRFランクを取得する
 * @returns {number} 0〜3のランク値
 */
function getRfRank() {
    const val = parseInt(document.getElementById('rf-rank-value')?.value) || 0;
    if (val >= 10) return 3;
    if (val >= 4) return 2;
    if (val >= 1) return 1;
    return 0;
}

function updateRfRankDisplay() {
    const input = document.getElementById('rf-rank-value');
    const display = document.getElementById('rf-rank-display');
    if (!input || !display) return;

    const rank = getRfRank();

    display.textContent = rank > 0 ? `ランク ${rank}` : '—';
    // ランクに応じた色分け
    const colors = ['#999', '#27ae60', '#e67e22', '#e74c3c'];
    display.style.color = colors[rank] || '#999';
}

/**
 * Updates the UI based on current state.
 */
function updateUI() {
    const stats = ['strength', 'skill', 'intellect', 'speed', 'charm'];

    stats.forEach(stat => {
        const el = document.getElementById(`val-${stat}`);
        let displayVal = getStatValue(stat);
        // 速度ペナルティの反映
        if (stat === 'speed') {
            const penaltyInput = document.getElementById('equip-speed-penalty');
            const penalty = parseInt(penaltyInput?.value) || 0;
            displayVal -= penalty;
        }
        if (el) el.textContent = displayVal;
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
    const artsNameInputs = document.querySelectorAll('.arts-name');
    artsNameInputs.forEach(input => {
        if (input.value.trim() !== '') {
            const cost = parseInt(input.dataset.cost) || 0;
            totalCost += cost;
        }
    });

    // 使役獣の消費ECを加算
    const beastCost = parseInt(document.getElementById('beast-cost')?.value) || 0;
    const beast2Cost = parseInt(document.getElementById('beast2-cost')?.value) || 0;
    totalCost += beastCost + beast2Cost;

    // プレイ履歴の獲得ECを合計し、初期値100に加算する
    let totalGainedEC = 100;
    const playEcInputs = document.querySelectorAll('.play-ec');
    playEcInputs.forEach(input => {
        const val = parseInt(input.value) || 0;
        totalGainedEC += val;
    });

    const totalCostEl = document.getElementById('total-cost');
    if (totalCostEl) {
        totalCostEl.textContent = `${totalCost} / ${totalGainedEC}`;
        // 消費が総計を上回った場合に赤色にするなどの視覚効果（任意）
        if (totalCost > totalGainedEC) {
            totalCostEl.style.color = '#e74c3c';
        } else {
            totalCostEl.style.color = '';
        }
    }

    // Calculate next cost
    const nextGrowthIndex = growthHistory.length + 1;
    const nextCost = calculateCost(nextGrowthIndex);
    const nextCostEl = document.getElementById('next-cost');
    if (nextCostEl) nextCostEl.textContent = nextCost;

    // Update total growth count
    const totalGrowthEl = document.getElementById('total-growth-count');
    if (totalGrowthEl) totalGrowthEl.textContent = growthHistory.length;

    // --- HP Calculation ---
    calculateHP();

    // --- 使役獣HP表示更新 ---
    updateBeastHpDisplay();
}

/**
 * Calculates and updates Max HP
 * Formula: 10 + Strength + Body Equip HP + Other Mod
 */
/**
 * 使役獣のHP表示を更新する
 * 使役獣セクションのHP値をHP計算パネルに反映
 */
function updateBeastHpDisplay() {
    // 使役獣１
    const beastHp = parseInt(document.getElementById('beast-hp')?.value) || 0;
    const beastName = document.getElementById('beast-name')?.value || '';
    const beastPanel = document.getElementById('beast-hp-panel');
    const beastCurrentHpInput = document.getElementById('beast-current-hp');
    if (beastPanel) {
        if (beastHp > 0 || beastName) {
            beastPanel.style.display = 'block';
            // 最大HP変化時に現在HPも連動
            const prevMax = parseInt(beastPanel.dataset.prevMaxHp) || 0;
            if (prevMax !== beastHp && beastCurrentHpInput) {
                const diff = beastHp - prevMax;
                const currentVal = parseInt(beastCurrentHpInput.value) || 0;
                beastCurrentHpInput.value = Math.max(0, currentVal + diff);
            }
            beastPanel.dataset.prevMaxHp = beastHp;
            document.getElementById('beast-max-hp-display').textContent = beastHp;
            document.getElementById('beast-hp-label').textContent = beastName ? `「${beastName}」` : '';
        } else {
            beastPanel.style.display = 'none';
        }
    }

    // 使役獣２
    const beast2Hp = parseInt(document.getElementById('beast2-hp')?.value) || 0;
    const beast2Name = document.getElementById('beast2-name')?.value || '';
    const beast2Panel = document.getElementById('beast2-hp-panel');
    const beast2CurrentHpInput = document.getElementById('beast2-current-hp');
    if (beast2Panel) {
        if (beast2Hp > 0 || beast2Name) {
            beast2Panel.style.display = 'block';
            // 最大HP変化時に現在HPも連動
            const prevMax2 = parseInt(beast2Panel.dataset.prevMaxHp) || 0;
            if (prevMax2 !== beast2Hp && beast2CurrentHpInput) {
                const diff2 = beast2Hp - prevMax2;
                const currentVal2 = parseInt(beast2CurrentHpInput.value) || 0;
                beast2CurrentHpInput.value = Math.max(0, currentVal2 + diff2);
            }
            beast2Panel.dataset.prevMaxHp = beast2Hp;
            document.getElementById('beast2-max-hp-display').textContent = beast2Hp;
            document.getElementById('beast2-hp-label').textContent = beast2Name ? `「${beast2Name}」` : '';
        } else {
            beast2Panel.style.display = 'none';
        }
    }
}

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

    // 種族ボーナス（雹の民: HP+5, 雷の民: HP-2）
    const raceHpBonusMap = { hail: 5, thunder: -2 };
    const raceHpBonus = raceHpBonusMap[currentRaceKey] || 0;

    const maxHp = 10 + strength + bodyHp + otherMod + raceHpBonus;
    const maxHpEl = document.getElementById('val-max-hp');
    const currentHpInput = document.getElementById('val-current-hp');

    // 最大HP変化時に現在HPも連動
    if (maxHpEl && currentHpInput) {
        const prevMax = parseInt(maxHpEl.textContent) || 0;
        if (prevMax !== maxHp) {
            const diff = maxHp - prevMax;
            const currentVal = parseInt(currentHpInput.value) || 0;
            currentHpInput.value = Math.max(0, currentVal + diff);
        }
        maxHpEl.textContent = maxHp;
    }
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

function initPlayHistoryListeners() {
    const container = document.getElementById('play-history-container');
    const btnAdd = document.getElementById('btn-add-history');

    if (!container) return;

    // 「今日の日付」および「削除」ボタンのイベント委譲
    container.addEventListener('click', (e) => {
        const target = e.target;

        // 今日ボタン
        if (target.classList.contains('btn-today')) {
            const row = target.closest('.play-history-row');
            if (row) {
                const dateInput = row.querySelector('.play-date');
                if (dateInput) {
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    dateInput.value = `${yyyy}-${mm}-${dd}`;
                    updateUI();
                }
            }
        }

        // 削除ボタン
        if (target.classList.contains('btn-remove-history')) {
            const row = target.closest('.play-history-row');
            if (row) {
                row.remove();
                updateUI();
            }
        }
    });

    // 入力変更でUI（計算など）を更新するイベント委譲
    container.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            updateUI();
        }
    });

    // 「＋」ボタンで行を追加
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            const newRow = document.createElement('div');
            newRow.className = 'play-history-row';
            newRow.style.display = 'flex';
            newRow.style.gap = '15px';
            newRow.style.flexWrap = 'wrap';
            newRow.style.marginBottom = '15px';
            newRow.style.background = 'rgba(0,0,0,0.02)';
            newRow.style.padding = '10px';
            newRow.style.borderRadius = '8px';
            newRow.style.border = '1px solid var(--border-color)';

            newRow.innerHTML = `
                <div class="input-group" style="flex: 2; min-width: 150px;">
                    <label>シナリオ名</label>
                    <input type="text" class="play-scenario" placeholder="シナリオを入力">
                </div>
                <div class="input-group" style="flex: 1; min-width: 80px;">
                    <label>獲得EC</label>
                    <input type="number" class="play-ec" placeholder="0" min="0">
                </div>
                <div class="input-group" style="flex: 1; min-width: 140px;">
                    <label>プレイ日</label>
                    <div style="display: flex; gap: 5px;">
                        <input type="date" class="play-date" style="flex: 1;">
                        <button class="btn-today no-print" style="width: 40px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;" title="今日の日付を入力">📅</button>
                        <button class="btn-remove-history no-print" style="width: 40px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;" title="行を削除">×</button>
                    </div>
                </div>
            `;
            container.appendChild(newRow);
        });
    }
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
 * アーツの消費ボタン処理
 * RF消費に入力された値をチームプールから差し引く
 */
function consumeArtsRf(button) {
    const row = button.closest('.arts-row');
    if (!row) return;

    const rfInput = row.querySelector('.arts-rf');
    const rfCost = parseInt(rfInput?.value) || 0;

    if (rfCost <= 0) {
        alert('RF消費が設定されていません');
        return;
    }

    const teamPoolInput = document.getElementById('team-pool-value');
    if (!teamPoolInput) return;

    const currentPool = parseInt(teamPoolInput.value) || 0;
    if (currentPool < rfCost) {
        alert(`チームプールが不足しています（現在: ${currentPool}、必要: ${rfCost}）`);
        return;
    }

    teamPoolInput.value = currentPool - rfCost;
    // Firebase同期を発火
    teamPoolInput.dispatchEvent(new Event('input'));
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

    // Listen for Speed Penalty changes
    const speedPenaltyInput = document.getElementById('equip-speed-penalty');
    if (speedPenaltyInput) {
        speedPenaltyInput.addEventListener('input', updateUI);
    }

    // Listen for Other Mod changes
    const otherModInput = document.getElementById('hp-other-mod');
    if (otherModInput) {
        otherModInput.addEventListener('input', updateUI);
    }

    const itemInputs = document.querySelectorAll('.item-cost');
    itemInputs.forEach(input => {
        input.addEventListener('input', updateUI);
    });

    const artsNameInputs = document.querySelectorAll('.arts-name');
    artsNameInputs.forEach(input => {
        input.addEventListener('input', updateUI);
    });

    // 使役獣の消費ECリスナー
    const beastCostInput = document.getElementById('beast-cost');
    if (beastCostInput) beastCostInput.addEventListener('input', updateUI);
    const beast2CostInput = document.getElementById('beast2-cost');
    if (beast2CostInput) beast2CostInput.addEventListener('input', updateUI);

    // 使役獣のHP・名前リスナー（HPパネル連動用）
    ['beast-hp', 'beast-name', 'beast2-hp', 'beast2-name'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateUI);
    });
}

// --- Save/Load System ---

// Expose save/load/delete globally for inline onclick handlers
window.doSave = function () {
    try {
        const selector = document.getElementById('save-slot-select');
        if (!selector || !selector.value) { alert('スロットを選択してください'); return; }
        const slot = selector.value;
        const data = collectData();
        localStorage.setItem(`pangaea_char_${slot}`, JSON.stringify(data));
        updateSlotStatus();
        alert(`Slot ${slot} に保存しました。`);
    } catch (e) {
        alert(`保存に失敗しました: ${e.message}`);
        console.error(e);
    }
};

window.doLoad = function () {
    try {
        const selector = document.getElementById('save-slot-select');
        if (!selector || !selector.value) { alert('スロットを選択してください'); return; }
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
};

window.doDelete = function () {
    try {
        const selector = document.getElementById('save-slot-select');
        if (!selector || !selector.value) return;
        const slot = selector.value;
        if (localStorage.getItem(`pangaea_char_${slot}`)) {
            if (confirm(`Slot ${slot} のデータを削除しますか？`)) {
                localStorage.removeItem(`pangaea_char_${slot}`);
                updateSlotStatus();
                alert(`Slot ${slot} を削除しました。`);
            }
        }
    } catch (e) {
        console.error(e);
    }
};

function initSaveSystem() {
    const selector = document.getElementById('save-slot-select');
    const statusDiv = document.getElementById('slot-status');

    if (!selector) return;

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
}

function updateSlotStatus() {
    const selector = document.getElementById('save-slot-select');
    const statusDiv = document.getElementById('slot-status');

    if (!selector) return;

    const slot = selector.value;
    const json = localStorage.getItem(`pangaea_char_${slot}`);

    // statusDivがHTMLに存在しない場合はスキップ
    if (!statusDiv) return;

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
        speedPenalty: document.getElementById('equip-speed-penalty') ? document.getElementById('equip-speed-penalty').value : 0,
        items: Array.from(document.querySelectorAll('.items-section .item-row')).map(row => ({
            name: row.querySelector('.item-name').value,
            effect: row.querySelector('.item-effect').value,
            count: row.querySelector('.item-count') ? row.querySelector('.item-count').value : 0,
            cost: row.querySelector('.item-cost').value
        })),
        arts: Array.from(document.querySelectorAll('.arts-row')).map(row => ({
            name: row.querySelector('.arts-name')?.value || '',
            effect: row.querySelector('.arts-effect')?.value || '',
            rf: row.querySelector('.arts-rf')?.value || ''
        })),
        background: {
            past: document.querySelectorAll('.background-section textarea')[0].value,
            reason: document.querySelectorAll('.background-section textarea')[1].value,
            social: document.querySelectorAll('.background-section textarea')[2].value,
            future: document.querySelectorAll('.background-section textarea')[3].value
        },
        hpOtherMod: document.getElementById('hp-other-mod').value,
        currentHp: document.getElementById('val-current-hp').value,
        teamPool: document.getElementById('team-pool-value').value,
        rfRank: document.getElementById('rf-rank-value').value,
        roundCount: document.getElementById('round-count-value') ? document.getElementById('round-count-value').value : 1,
        playHistory: Array.from(document.querySelectorAll('.play-history-row')).map(row => ({
            scenario: row.querySelector('.play-scenario')?.value || '',
            ec: row.querySelector('.play-ec')?.value || '',
            date: row.querySelector('.play-date')?.value || ''
        })),
        roletags: Array.from(document.querySelectorAll('.roletag-input')).map(input => input.value),
        beast: {
            name: document.getElementById('beast-name').value,
            type: document.getElementById('beast-type').value,
            dice: document.getElementById('beast-dice').value,
            hp: document.getElementById('beast-hp').value,
            rebellion: document.getElementById('beast-rebellion').value,
            cost: document.getElementById('beast-cost').value,
            ability: document.getElementById('beast-ability').value,
            currentHp: document.getElementById('beast-current-hp').value
        },
        beast2: {
            name: document.getElementById('beast2-name').value,
            type: document.getElementById('beast2-type').value,
            dice: document.getElementById('beast2-dice').value,
            hp: document.getElementById('beast2-hp').value,
            rebellion: document.getElementById('beast2-rebellion').value,
            cost: document.getElementById('beast2-cost').value,
            ability: document.getElementById('beast2-ability').value,
            currentHp: document.getElementById('beast2-current-hp').value
        }
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

    // 5.5. Speed Penalty
    if (data.speedPenalty !== undefined) {
        const penaltyInput = document.getElementById('equip-speed-penalty');
        if (penaltyInput) penaltyInput.value = data.speedPenalty;
    }

    // 6. Items
    if (data.items) {
        const rows = document.querySelectorAll('.items-section .item-row');
        data.items.forEach((it, idx) => {
            if (rows[idx]) {
                rows[idx].querySelector('.item-name').value = it.name;
                rows[idx].querySelector('.item-effect').value = it.effect;
                if (rows[idx].querySelector('.item-count')) rows[idx].querySelector('.item-count').value = it.count || 0;
                rows[idx].querySelector('.item-cost').value = it.cost;
            }
        });
    }

    // 7. Arts
    if (data.arts) {
        const rows = document.querySelectorAll('.arts-row');
        data.arts.forEach((art, idx) => {
            if (rows[idx]) {
                // 新形式（オブジェクト）の場合
                if (typeof art === 'object') {
                    const nameInput = rows[idx].querySelector('.arts-name');
                    const effectInput = rows[idx].querySelector('.arts-effect');
                    const rfInput = rows[idx].querySelector('.arts-rf');
                    if (nameInput) nameInput.value = art.name || '';
                    if (effectInput) effectInput.value = art.effect || '';
                    if (rfInput) rfInput.value = art.rf || '';
                } else {
                    // 旧形式（文字列のみ）との後方互換
                    const nameInput = rows[idx].querySelector('.arts-name');
                    if (nameInput) nameInput.value = art;
                }
            }
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

    // 8.5. Role Tags
    if (data.roletags) {
        const inputs = document.querySelectorAll('.roletag-input');
        data.roletags.forEach((val, idx) => {
            if (inputs[idx]) inputs[idx].value = val;
        });
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

    // 11.5. Servant Beast
    if (data.beast) {
        if (data.beast.name !== undefined) document.getElementById('beast-name').value = data.beast.name;
        if (data.beast.type !== undefined) document.getElementById('beast-type').value = data.beast.type;
        if (data.beast.dice !== undefined) document.getElementById('beast-dice').value = data.beast.dice;
        if (data.beast.hp !== undefined) document.getElementById('beast-hp').value = data.beast.hp;
        if (data.beast.rebellion !== undefined) document.getElementById('beast-rebellion').value = data.beast.rebellion;
        if (data.beast.cost !== undefined) document.getElementById('beast-cost').value = data.beast.cost;
        if (data.beast.ability !== undefined) document.getElementById('beast-ability').value = data.beast.ability;
        if (data.beast.currentHp !== undefined) document.getElementById('beast-current-hp').value = data.beast.currentHp;
    }

    // 11.6. Servant Beast 2
    if (data.beast2) {
        if (data.beast2.name !== undefined) document.getElementById('beast2-name').value = data.beast2.name;
        if (data.beast2.type !== undefined) document.getElementById('beast2-type').value = data.beast2.type;
        if (data.beast2.dice !== undefined) document.getElementById('beast2-dice').value = data.beast2.dice;
        if (data.beast2.hp !== undefined) document.getElementById('beast2-hp').value = data.beast2.hp;
        if (data.beast2.rebellion !== undefined) document.getElementById('beast2-rebellion').value = data.beast2.rebellion;
        if (data.beast2.cost !== undefined) document.getElementById('beast2-cost').value = data.beast2.cost;
        if (data.beast2.ability !== undefined) document.getElementById('beast2-ability').value = data.beast2.ability;
        if (data.beast2.currentHp !== undefined) document.getElementById('beast2-current-hp').value = data.beast2.currentHp;
    }

    // 12. RF Rank
    if (data.rfRank !== undefined) {
        document.getElementById('rf-rank-value').value = data.rfRank;
        updateRfRankDisplay();
    }

    // 13. Round Count
    if (data.roundCount !== undefined) {
        const roundCountInput = document.getElementById('round-count-value');
        if (roundCountInput) roundCountInput.value = data.roundCount;
    }

    // 14. Play History
    const historyContainer = document.getElementById('play-history-container');
    if (historyContainer && data.playHistory) {
        // 現在の行をクリア
        historyContainer.innerHTML = '';

        // 配列かどうかチェック（旧バージョンデータ互換性のため）
        const historyArray = Array.isArray(data.playHistory) ? data.playHistory : [data.playHistory];

        historyArray.forEach(hist => {
            const newRow = document.createElement('div');
            newRow.className = 'play-history-row';
            newRow.style.display = 'flex';
            newRow.style.gap = '15px';
            newRow.style.flexWrap = 'wrap';
            newRow.style.marginBottom = '15px';
            newRow.style.background = 'rgba(0,0,0,0.02)';
            newRow.style.padding = '10px';
            newRow.style.borderRadius = '8px';
            newRow.style.border = '1px solid var(--border-color)';

            newRow.innerHTML = `
                <div class="input-group" style="flex: 2; min-width: 150px;">
                    <label>シナリオ名</label>
                    <input type="text" class="play-scenario" placeholder="シナリオを入力" value="${hist.scenario || ''}">
                </div>
                <div class="input-group" style="flex: 1; min-width: 80px;">
                    <label>獲得EC</label>
                    <input type="number" class="play-ec" placeholder="0" min="0" value="${hist.ec || ''}">
                </div>
                <div class="input-group" style="flex: 1; min-width: 140px;">
                    <label>プレイ日</label>
                    <div style="display: flex; gap: 5px;">
                        <input type="date" class="play-date" style="flex: 1;" value="${hist.date || ''}">
                        <button class="btn-today no-print" style="width: 40px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;" title="今日の日付を入力">📅</button>
                        <button class="btn-remove-history no-print" style="width: 40px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;" title="行を削除">×</button>
                    </div>
                </div>
            `;
            historyContainer.appendChild(newRow);
        });

        // もし履歴が空になってしまったら1行だけデフォルト追加しておく
        if (historyArray.length === 0) {
            document.getElementById('btn-add-history')?.click();
        }
    }

    updateUI();
}

// --- Firebase Realtime Sync & Session Management ---

window.addEventListener('firebase-ready', () => {
    console.log('Firebase ready, initializing sync...');
    if (typeof window.firebaseDb === 'undefined') {
        console.warn("Firebase vars not ready yet");
        return;
    }
    const db = window.firebaseDb;
    const ref = window.firebaseRef;
    const set = window.firebaseSet;
    const onValue = window.firebaseOnValue;

    // 1. Session / Room ID Management
    let roomId = new URLSearchParams(window.location.search).get('room');
    if (!roomId) {
        roomId = Math.random().toString(36).substring(2, 10);
        const newUrl = `${window.location.pathname}?room=${roomId}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
    }

    // Display Room ID in Modal
    const roomDisplay = document.getElementById('room-id-display');
    if (roomDisplay) roomDisplay.textContent = `Room ID: ${roomId}`;

    // RFランク表示の更新ロジック
    const rfRankInput = document.getElementById('rf-rank-value');
    if (rfRankInput) {
        rfRankInput.addEventListener('input', updateRfRankDisplay);
        updateRfRankDisplay(); // 初回実行
    }

    // 2. Firebase Reference with Room ID
    const teamPoolRef = ref(db, `rooms/${roomId}/teamPool`);
    const input = document.getElementById('team-pool-value');

    // 3. UI -> Firebase
    if (input) {
        input.addEventListener('input', (e) => {
            const val = parseInt(e.target.value) || 0;
            set(teamPoolRef, val).catch(err => console.error(err));
            // RFランクも連動更新（上昇時のみ）
            if (rfRankInput && val > (parseInt(rfRankInput.value) || 0)) {
                rfRankInput.value = val;
                updateRfRankDisplay();
            }
        });

        // 4. Firebase -> UI
        onValue(teamPoolRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null && parseInt(input.value) !== val) {
                input.value = val;
            } else if (val === null) {
                // データ未設定時は0を表示
                input.value = 0;
            }
        }, (error) => {
            console.error(error);
        });
    }

    // 5. Round Count Sync (UI -> Firebase & Firebase -> UI)
    const roundCountRef = ref(db, `rooms/${roomId}/roundCount`);
    const roundCountInputSync = document.getElementById('round-count-value');

    if (roundCountInputSync) {
        // UI -> Firebase
        roundCountInputSync.addEventListener('input', (e) => {
            // isSyncEvent が true の場合は GM 側からの同期なので Firebase には送り返さない
            if (e.isSyncEvent) {
                // ローカルのUI更新等があればここで呼ぶ
                if (typeof window.updateUI === 'function') window.updateUI();
                return;
            }
            const val = parseInt(e.target.value) || 1;
            set(roundCountRef, val).catch(err => console.error(err));
        });

        // Firebase -> UI
        onValue(roundCountRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null && parseInt(roundCountInputSync.value) !== val) {
                roundCountInputSync.value = val;
            } else if (val === null) {
                // 初期値
                roundCountInputSync.value = 1;
            }
        }, (error) => {
            console.error(error);
        });
    }

    // --- QR Code & Modal Logic ---
    const modal = document.getElementById('qr-modal');
    // ... (rest of logic)
    const btn = document.getElementById('btn-share');
    const span = document.getElementById('close-qr-modal');
    const qrContainer = document.getElementById('qrcode');
    const urlInput = document.getElementById('share-url-input');
    const copyBtn = document.getElementById('btn-copy-url');
    let qrCodeObj = null;

    if (btn) {
        btn.onclick = function (e) {
            e.preventDefault();
            console.log("Share Button Clicked");
            if (modal) modal.style.display = "block";

            // Clear previous QR
            if (qrContainer) qrContainer.innerHTML = '';

            // Generate QR Code
            const currentUrl = window.location.href;

            // Set URL to input
            if (urlInput) urlInput.value = currentUrl;

            // Using global QRCode library (if available)
            if (typeof QRCode !== 'undefined' && qrContainer) {
                if (!qrCodeObj) {
                    try {
                        new QRCode(qrContainer, {
                            text: currentUrl,
                            width: 200,
                            height: 200,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    } catch (e) { console.error("QR Error", e); }
                } else {
                    try {
                        new QRCode(qrContainer, {
                            text: currentUrl,
                            width: 200,
                            height: 200
                        });
                    } catch (e) { console.error("QR Error", e); }
                }
            }
        }
    }

    if (copyBtn && urlInput) {
        copyBtn.onclick = function () {
            // iOS hack: remove readonly to allow selection
            const wasReadOnly = urlInput.readOnly;
            urlInput.readOnly = false;

            urlInput.focus();
            urlInput.select();
            urlInput.setSelectionRange(0, 99999); // For mobile devices

            // Try using the modern Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(urlInput.value).then(() => {
                    showCopySuccess();
                }).catch(err => {
                    console.warn('Clipboard API failed', err);
                    fallbackCopyText();
                }).finally(() => {
                    if (wasReadOnly) urlInput.readOnly = true;
                });
            } else {
                // Fallback
                fallbackCopyText();
                if (wasReadOnly) urlInput.readOnly = true;
            }
        };
    }

    function fallbackCopyText() {
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess();
            } else {
                throw new Error('execCommand returned false');
            }
        } catch (err) {
            console.error('Fallback copy failed', err);
            // If automatic copy fails, just keep it selected and ask user
            alert('コピーできませんでした。青く選択されているテキストを長押ししてコピーしてください。');
        }
    }

    function showCopySuccess() {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#2ecc71';
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#3498db';
        }, 2000);
    }

    // --- Cloud Save / Load Logic ---

    // オーナーIDの取得または生成
    function getOwnerId() {
        let ownerId = localStorage.getItem('pangaea-owner-id');
        if (!ownerId) {
            ownerId = 'owner-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('pangaea-owner-id', ownerId);
        }
        return ownerId;
    }

    const myOwnerId = getOwnerId();

    window.saveToCloud = function () {
        const data = collectData();
        if (!data.name) {
            alert('キャラクター名を入力してください');
            return;
        }

        const db = window.firebaseDb;
        const ref = window.firebaseRef;
        if (!db || !ref) { alert("Firebase not initialized"); return; }

        let roomId = new URLSearchParams(window.location.search).get('room');
        const charactersRef = ref(db, `rooms/${roomId}/characters`);

        // タイムスタンプとオーナーIDを付与
        data.lastModified = Date.now();
        data.ownerId = myOwnerId;

        // 同じ名前・同じオーナーの既存データを検索
        window.firebaseGet(charactersRef).then((snapshot) => {
            let existingKey = null;
            if (snapshot.exists()) {
                const chars = snapshot.val();
                for (const key in chars) {
                    if (chars[key].name === data.name && chars[key].ownerId === myOwnerId) {
                        existingKey = key;
                        break;
                    }
                }
            }

            let saveRef;
            let isUpdate = false;
            if (existingKey) {
                // 既存データを上書き
                saveRef = ref(db, `rooms/${roomId}/characters/${existingKey}`);
                isUpdate = true;
            } else {
                // 新規作成
                saveRef = window.firebasePush(charactersRef);
            }

            return window.firebaseSet(saveRef, data).then(() => {
                const msg = isUpdate
                    ? `「${data.name}」を上書き保存しました。`
                    : `「${data.name}」を新規保存しました。`;
                alert(msg + `\nRoom ID: ${roomId}`);
            });
        }).catch((error) => {
            console.error("Cloud Save Failed", error);
            alert('保存に失敗しました。権限がないか、ネットワークエラーです。');
        });
    };

    window.loadFromCloud = function () {
        const db = window.firebaseDb;
        const ref = window.firebaseRef;
        if (!db || !ref) { alert("Firebase not initialized"); return; }

        let roomId = new URLSearchParams(window.location.search).get('room');
        const charactersRef = ref(db, `rooms/${roomId}/characters`);

        const modal = document.getElementById('cloud-load-modal');
        const listContainer = document.getElementById('cloud-char-list');
        const closeBtn = document.getElementById('close-cloud-modal');

        if (modal) modal.style.display = 'block';
        if (listContainer) listContainer.innerHTML = '読み込み中...';

        window.firebaseGet(charactersRef).then((snapshot) => {
            if (listContainer) listContainer.innerHTML = ''; // Clear loading

            if (snapshot.exists()) {
                const chars = snapshot.val();
                if (!chars) {
                    listContainer.innerHTML = '<div>保存されたキャラクターがいません</div>';
                    return;
                }

                Object.keys(chars).forEach((key) => {
                    const charData = chars[key];
                    const dateStr = charData.lastModified ? new Date(charData.lastModified).toLocaleString() : '不明';
                    const isOwner = (charData.ownerId === myOwnerId);

                    const itemDiv = document.createElement('div');
                    itemDiv.style.borderBottom = '1px solid #eee';
                    itemDiv.style.padding = '10px';
                    itemDiv.style.display = 'flex';
                    itemDiv.style.justifyContent = 'space-between';
                    itemDiv.style.alignItems = 'center';

                    const infoDiv = document.createElement('div');
                    const ownerBadge = isOwner ? '<span style="font-size:0.7em; background:#27ae60; color:white; padding:1px 5px; border-radius:3px; margin-left:5px;">自分</span>' : '';
                    infoDiv.innerHTML = `<strong>${charData.name || '名称未設定'}</strong>${ownerBadge} <span style="font-size:0.8em; color:#666;">(${charData.race || '-'})</span><br><span style="font-size:0.7em; color:#999;">${dateStr}</span>`;

                    const btnGroup = document.createElement('div');
                    btnGroup.style.display = 'flex';
                    btnGroup.style.gap = '5px';

                    const loadBtn = document.createElement('button');
                    loadBtn.textContent = '読込';
                    loadBtn.onclick = function () {
                        if (confirm(`「${charData.name}」を読み込みますか？\n現在の入力内容は上書きされます。`)) {
                            applyData(charData);
                            if (modal) modal.style.display = 'none';
                            alert('読み込みました！');
                        }
                    };
                    btnGroup.appendChild(loadBtn);

                    // 削除ボタンは自分のデータのみ表示
                    if (isOwner) {
                        const delBtn = document.createElement('button');
                        delBtn.textContent = '削除';
                        delBtn.style.background = '#e74c3c';
                        delBtn.style.color = 'white';
                        delBtn.style.border = 'none';
                        delBtn.style.borderRadius = '3px';
                        delBtn.onclick = function () {
                            if (confirm(`本当に「${charData.name}」を削除しますか？\nこの操作は取り消せません。`)) {
                                const targetRef = ref(db, `rooms/${roomId}/characters/${key}`);
                                window.firebaseRemove(targetRef).then(() => {
                                    itemDiv.remove();
                                }).catch(err => alert("削除失敗: " + err));
                            }
                        };
                        btnGroup.appendChild(delBtn);
                    }

                    itemDiv.appendChild(infoDiv);
                    itemDiv.appendChild(btnGroup);

                    listContainer.appendChild(itemDiv);
                });

            } else {
                listContainer.innerHTML = '<div>保存されたキャラクターがいません</div>';
            }
        }).catch((error) => {
            console.error(error);
            listContainer.innerHTML = '<div style="color:red;">読み込みエラーが発生しました</div>';
        });

        if (closeBtn) {
            closeBtn.onclick = function () {
                modal.style.display = 'none';
            };
        }

        // Close on click outside
        window.onclick = function (event) {
            const qrModal = document.getElementById('qr-modal');
            const diceModal = document.getElementById('dice-modal');
            if (event.target === modal) {
                modal.style.display = "none";
            }
            if (qrModal && event.target == qrModal) {
                qrModal.style.display = "none";
            }
            if (diceModal && event.target == diceModal) {
                diceModal.style.display = "none";
            }
        }
    };

    if (span) {
        span.onclick = function () {
            if (modal) modal.style.display = "none";
        }
    }
});

// --- Dice Roller Integration ---

window.rollStatDice = function (statName) {
    const diceCountStr = document.getElementById(`val-${statName}`).innerText;
    const diceCount = parseInt(diceCountStr) || 1;
    const diceCountInput = document.getElementById('diceCount');
    if (diceCountInput) {
        diceCountInput.value = diceCount;
    }
    if (window.openDiceModal) {
        window.openDiceModal();
    }
};

// EXPOSE GLOBALLY for default button behavior
window.openDiceModal = function () {
    console.log("Global openDiceModal called");
    const diceModal = document.getElementById('dice-modal');
    if (diceModal) {
        diceModal.style.display = "block";
        // ファンブル無効数をRFランクから更新
        const rank = getRfRank();
        const immunityDisplay = document.getElementById('fumble-immunity-display');
        const immunityCount = document.getElementById('fumble-immunity-count');
        if (immunityDisplay && immunityCount) {
            if (rank > 0) {
                immunityDisplay.style.display = 'block';
                immunityCount.textContent = rank;
            } else {
                immunityDisplay.style.display = 'none';
            }
        }
    } else {
        alert("エラー: dice-modalが見つかりません");
    }
};

// Execute immediately to bind listeners if elements exist
function initDiceRoller() {
    console.log("Initializing Dice Roller Logic...");
    const diceModal = document.getElementById('dice-modal');
    const openDiceBtn = document.getElementById('btn-open-dice');
    const closeDiceBtn = document.getElementById('close-dice-modal');
    const rollBtn = document.getElementById('rollBtn');
    const diceCountInput = document.getElementById('diceCount');
    const diceContainer = document.getElementById('diceContainer');
    const statsPanel = document.getElementById('statsPanel');
    const statGrid = document.getElementById('statGrid');
    const historyPanel = document.getElementById('historyPanel');
    const historyList = document.getElementById('historyList');

    if (!diceModal) {
        console.warn("dice-modal not found, delaying init...");
        return;
    }

    console.log("Dice Roller Elements Found. Binding events.");

    // Consolidate Window Clicks
    window.addEventListener('click', (event) => {
        const qrModal = document.getElementById('qr-modal');
        if (diceModal && event.target == diceModal) {
            diceModal.style.display = "none";
        }
        if (qrModal && event.target == qrModal) {
            qrModal.style.display = "none";
        }
    });

    // Also bind event listener as backup
    if (openDiceBtn) {
        openDiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Open Dice Button Clicked");
            diceModal.style.display = "block";
        });
    }

    if (closeDiceBtn) {
        closeDiceBtn.onclick = function () {
            diceModal.style.display = "none";
        };
    }

    const MAX_HISTORY = 10;
    let history = [];

    if (rollBtn) {
        rollBtn.onclick = function () {
            console.log("Roll Button Clicked");
            const count = parseInt(diceCountInput.value);
            if (isNaN(count) || count < 1 || count > 99) {
                alert('1から99までの数字を入力してください。');
                return;
            }
            rollDice(count);
        };
    }

    function rollDice(count) {
        diceContainer.innerHTML = '';
        statGrid.innerHTML = '';

        const results = {};
        for (let i = 1; i <= 6; i++) {
            results[i] = 0;
        }

        for (let i = 0; i < count; i++) {
            const value = Math.floor(Math.random() * 6) + 1;
            results[value]++;
            createDieElement(value);
        }

        updateStats(results);
        statsPanel.classList.remove('hidden');
        statsPanel.style.display = 'block';

        // 1（ファンブル）が出た回数分、チームプールを加算
        const fumbleCount = results[1] || 0;
        if (fumbleCount > 0) {
            const teamPoolInput = document.getElementById('team-pool-value');
            if (teamPoolInput) {
                const currentPool = parseInt(teamPoolInput.value) || 0;
                teamPoolInput.value = currentPool + fumbleCount;
                // Firebase同期を発火させる
                teamPoolInput.dispatchEvent(new Event('input'));
            }
        }

        updateHistory(count, results);
    }

    function updateHistory(count, results) {
        const timestamp = new Date().toLocaleTimeString();
        let summaryText = `[${timestamp}] ${count}個: `;

        const details = [];
        for (let i = 1; i <= 6; i++) {
            if (results[i] > 0) {
                let status = '';
                if (i === 1) status = '(F)';
                else if (i <= 3) status = '(×)';
                else status = '(○)';

                details.push(`${i}${status}:${results[i]}`);
            }
        }

        summaryText += details.join(', ');

        history.unshift(summaryText);
        if (history.length > MAX_HISTORY) {
            history.pop();
        }

        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (history.length > 0) {
            historyPanel.classList.remove('hidden');
            history.forEach(itemText => {
                const li = document.createElement('li');
                li.className = 'history-item';
                li.style.borderBottom = "1px solid #eee";
                li.style.padding = "5px 0";
                li.textContent = itemText;
                historyList.appendChild(li);
            });
        }
    }

    function createDieElement(value) {
        const die = document.createElement('div');
        die.className = 'die';
        die.style.animation = 'none';
        void die.offsetWidth; // Trigger reflow
        die.style.animation = 'roll-in 0.5s ease-out';

        const face = document.createElement('div');
        face.className = 'die-face';
        face.setAttribute('data-value', value);

        const dotConfig = {
            1: ['g'],
            2: ['a', 'i'],
            3: ['a', 'g', 'i'],
            4: ['a', 'c', 'h', 'i'],
            5: ['a', 'c', 'g', 'h', 'i'],
            6: ['a', 'c', 'e', 'f', 'h', 'i']
        };

        const positions = dotConfig[value];
        positions.forEach(pos => {
            const dot = document.createElement('span');
            dot.className = `dot dot-${pos}`;
            face.appendChild(dot);
        });

        die.appendChild(face);
        diceContainer.appendChild(die);
    }

    function updateStats(results) {
        for (let i = 1; i <= 6; i++) {
            const count = results[i];

            const item = document.createElement('div');
            item.className = 'stat-item';
            item.style.border = '1px solid #ddd';
            item.style.borderRadius = '8px';
            item.style.padding = '5px';
            item.style.display = 'flex';
            item.style.flexDirection = 'column';
            item.style.alignItems = 'center';

            const label = document.createElement('div');
            label.className = 'stat-label';

            let labelText = `${i}`;
            if (i === 1) {
                labelText += '(F)';
                label.classList.add('fumble');
                label.style.color = 'red';
                label.style.fontWeight = 'bold';
            } else if (i <= 3) {
                labelText += '(×)';
            } else {
                labelText += '(○)';
            }

            label.textContent = labelText;

            const value = document.createElement('div');
            value.className = 'stat-value';
            value.textContent = `${count}`;
            value.style.fontSize = '1.2rem';
            value.style.fontWeight = 'bold';

            item.appendChild(label);
            item.appendChild(value);
            statGrid.appendChild(item);
        }
    }
}

// PDF Export Logic using html2pdf.js
function initPdfExport() {
    const btnPdf = document.getElementById('btn-download-pdf');
    if (!btnPdf) return;

    btnPdf.addEventListener('click', () => {
        // Find the main container
        const element = document.getElementById('character-sheet-container') || document.querySelector('.container');
        if (!element) return;

        // Hide elements not intended for print
        const noPrintElements = document.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.style.display = 'none');

        // Expand servant beast if collapsed
        const servantBeastDetails = document.querySelectorAll('.servant-beast-details');
        const closedDetails = [];
        servantBeastDetails.forEach(details => {
            if (!details.hasAttribute('open')) {
                details.setAttribute('open', '');
                closedDetails.push(details);
            }
        });

        const charName = document.getElementById('char-name')?.value || 'Character';

        // Options for html2pdf
        const opt = {
            margin: [5, 5, 5, 5],
            filename: `${charName}_Sheet.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css', before: '#nextpage1' } // adjust if needed, mostly default is fine 
        };

        // If you want to force 1 page continuous, you can adjust the jsPDF format
        // based on the calculated element height, but default A4 paginated is usually safer and cleaner 
        // with css page-breaks we added earlier in style.css. Let's try standard multi-page A4 first.
        // It's still a single file download.

        // Show loading state
        const originalText = btnPdf.innerHTML;
        btnPdf.innerHTML = '生成中...';
        btnPdf.style.background = '#95a5a6';
        btnPdf.disabled = true;

        html2pdf().set(opt).from(element).save().then(() => {
            // Restore hidden elements
            noPrintElements.forEach(el => el.style.display = '');
            // Restore details state
            closedDetails.forEach(details => details.removeAttribute('open'));

            // Restore button
            btnPdf.innerHTML = originalText;
            btnPdf.style.background = '#e67e22';
            btnPdf.disabled = false;
        }).catch(err => {
            console.error("PDF Export failed", err);
            // Restore hidden elements
            noPrintElements.forEach(el => el.style.display = '');
            closedDetails.forEach(details => details.removeAttribute('open'));
            btnPdf.innerHTML = originalText;
            btnPdf.style.background = '#e67e22';
            btnPdf.disabled = false;
            alert("PDFの生成に失敗しました。もう一度お試しください。");
        });
    });
}

// Global Initialization Logic
function runAllInit() {
    console.log("Starting initialization...");

    function safeInit(fn, name) {
        try {
            fn();
            console.log(name + " initialized OK");
        } catch (e) {
            console.error("Error in " + name + ":", e);
        }
    }

    safeInit(initRaceDropdown, "RaceDropdown");
    safeInit(initJobDropdowns, "JobDropdowns");
    safeInit(initEquipmentListeners, "EquipmentListeners");
    safeInit(initSaveSystem, "SaveSystem");
    safeInit(initPlayHistoryListeners, "PlayHistoryListeners");
    safeInit(initPdfExport, "PdfExport");
    safeInit(updateUI, "UpdateUI");
    safeInit(initDiceRoller, "DiceRoller");

    console.log("All initialization complete.");
}

// DOMContentLoaded may have already fired if script is at body end
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllInit);
} else {
    // DOM is already ready, run immediately
    runAllInit();
}

