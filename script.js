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

    [job1, job2].forEach(select => {
        for (const key in JOBS) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = JOBS[key].name;
            select.appendChild(option);
        }
        select.addEventListener('change', () => {
            updateDescription(select.id, `${select.id}-desc`);
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

// Initialize
initRaceDropdown();
initJobDropdowns();
initEquipmentListeners();
updateUI();

