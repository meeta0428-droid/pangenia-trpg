document.addEventListener('DOMContentLoaded', () => {
    const rollBtn = document.getElementById('rollBtn');
    const diceCountInput = document.getElementById('diceCount');
    const diceContainer = document.getElementById('diceContainer');
    const statsPanel = document.getElementById('statsPanel');
    const statGrid = document.getElementById('statGrid');
    const historyPanel = document.getElementById('historyPanel');
    const historyList = document.getElementById('historyList');

    const MAX_HISTORY = 10;
    let history = [];

    rollBtn.addEventListener('click', () => {
        const count = parseInt(diceCountInput.value);

        if (isNaN(count) || count < 1 || count > 99) {
            alert('1から99までの数字を入力してください。');
            return;
        }

        rollDice(count);
    });

    function rollDice(count) {
        // Clear previous results
        diceContainer.innerHTML = '';
        statGrid.innerHTML = '';

        const results = {};
        // Initialize counts
        for (let i = 1; i <= 6; i++) {
            results[i] = 0;
        }

        // Roll logic
        for (let i = 0; i < count; i++) {
            const value = Math.floor(Math.random() * 6) + 1;
            results[value]++;
            createDieElement(value);
        }

        // Update stats
        updateStats(results);
        statsPanel.classList.remove('hidden');

        // Update history
        updateHistory(count, results);
    }

    function updateHistory(count, results) {
        const timestamp = new Date().toLocaleTimeString();
        let summaryText = `[${timestamp}] ${count}個: `;

        const parts = [];
        for (let i = 1; i <= 6; i++) {
            if (results[i] > 0) {
                let label = `${i}の目:${results[i]}`;
                if (i === 1) label += '(ﾌｧﾝﾌﾞﾙ)';
                else if (i <= 3) label += '(失敗)';
                else label += '(成功)';

                // Shorten for history to prevent too long text? 
                // User didn't specify format, but compact is good.
                // Actually, let's keep it simple: "1:2, 2:0..." 
                // But user wanted history.

                // Let's format nicely: "1(F): 1, 2(fail): 3..." might be too long.
                // Simple: "1: 2(F), 2: 1(fail)..."

                // Let's stick to the previous plan: just counts?
                // User wants to see "results". 
                // Let's do: "1の目:1, 2の目:0 ..."
                // Maybe just list the ones that appeared? 

                parts.push(`${i}:${results[i]}`);
            }
        }
        // summaryText += parts.join(', ');
        // Let's include the result judgment in summary actually.
        // Example: "Sum: XX" ? No, user asked for counts.

        // Let's try a compact format:
        // [10:00:00] 3個 -> 1:1(F), 4:2(S) ...
        // F=Fumble, S=Success, X=Failure

        // Detailed format:
        // 1(Funble):1, 2(Fail):0 ...

        // Let's just use the parts logic I started with but cleaned up.
        // I will list all non-zero counts.

        const details = [];
        for (let i = 1; i <= 6; i++) {
            if (results[i] > 0) {
                let status = '';
                if (i === 1) status = '(F)';
                else if (i <= 3) status = '(×)'; // Failure
                else status = '(○)'; // Success

                details.push(`${i}${status}:${results[i]}`);
            }
        }

        summaryText += details.join(', ');

        // Add to history array
        history.unshift(summaryText);
        if (history.length > MAX_HISTORY) {
            history.pop();
        }

        // Render history
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (history.length > 0) {
            historyPanel.classList.remove('hidden');
            history.forEach(itemText => {
                const li = document.createElement('li');
                li.className = 'history-item';
                li.textContent = itemText;
                historyList.appendChild(li);
            });
        }
    }

    function createDieElement(value) {
        const die = document.createElement('div');
        die.className = 'die';

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
        let successCount = 0;
        let fumbleCount = 0;
        const rfRank = parseInt(document.getElementById('rfRank').value) || 0;

        for (let i = 1; i <= 6; i++) {
            if (i >= 4) successCount += results[i];
            if (i === 1) fumbleCount += results[i];

            const count = results[i];

            const item = document.createElement('div');
            item.className = 'stat-item';

            const label = document.createElement('div');
            label.className = 'stat-label';

            let labelText = `${i}の目`;
            if (i === 1) {
                labelText += ' (ファンブル)';
                label.classList.add('fumble');
            } else if (i <= 3) {
                labelText += ' (失敗)';
            } else {
                labelText += ' (成功)';
            }

            label.textContent = labelText;

            const value = document.createElement('div');
            value.className = 'stat-value';
            value.textContent = `${count}回`;

            item.appendChild(label);
            item.appendChild(value);
            statGrid.appendChild(item);
        }

        // Apply RF Rank (Negate Fumbles)
        let negatedFumbles = 0;
        if (rfRank > 0 && fumbleCount > 0) {
            negatedFumbles = Math.min(fumbleCount, rfRank);
            fumbleCount -= negatedFumbles;
        }

        // Display Total Success Result
        const totalSuccess = successCount - fumbleCount;
        const resultDiv = document.createElement('div');
        resultDiv.className = 'stat-item total-result';
        resultDiv.style.gridColumn = '1 / -1';
        resultDiv.style.marginTop = '15px';
        resultDiv.style.background = 'rgba(255, 255, 255, 0.5)';
        resultDiv.style.padding = '10px';
        resultDiv.style.borderRadius = '8px';

        let resultHTML = `<div class="stat-label" style="font-size: 1.2em; font-weight: bold;">判定結果 (Total Result)</div>`;

        if (negatedFumbles > 0) {
            resultHTML += `<div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">RFランクによりファンブルを ${negatedFumbles}回 無効化</div>`;
        }

        resultHTML += `<div class="stat-value" style="font-size: 1.5em; color: var(--primary-color);">${totalSuccess} 成功</div>`;

        resultDiv.innerHTML = resultHTML;
        statGrid.appendChild(resultDiv);
    }


});
