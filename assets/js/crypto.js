// Crypto page JS: utility panel + live market + Chart.js integration

document.addEventListener('DOMContentLoaded', function () {
    // --- Shared page UI (same as other dashboards) ---
    const loginPage = '../auth/login/login.html';
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        window.location.href = loginPage;
        return;
    }

    const overlay = document.getElementById('sidePanelOverlay');
    const panel = document.getElementById('utilityPanel');
    const panelTitle = document.getElementById('panelTitle');
    const tabs = Array.from(document.querySelectorAll('.panel-tab'));
    const views = Array.from(document.querySelectorAll('.panel-view'));
    const triggers = Array.from(document.querySelectorAll('.utility-trigger'));
    const closeBtn = document.querySelector('.close-panel-btn');
    const utilityFolder = document.getElementById('utilityFolder');
    const utilityFolderToggle = document.querySelector('.utility-folder-toggle');

    function setPanel(panelName) {
        const titleMap = {
            notifications: 'Notifications',
            favorites: 'Favorites',
            account: 'Account'
        };

        if (panelTitle) panelTitle.textContent = titleMap[panelName] || 'Quick access';
        tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.panel === panelName));
        views.forEach((view) => view.classList.toggle('is-active', view.dataset.panelContent === panelName));
    }

    function openPanel(panelName) {
        setPanel(panelName);
        if (panel) panel.classList.add('is-open');
        if (overlay) overlay.classList.add('is-open');
        if (panel) panel.setAttribute('aria-hidden', 'false');
    }

    function closePanel() {
        if (panel) panel.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-open');
        if (panel) panel.setAttribute('aria-hidden', 'true');
        if (utilityFolder) utilityFolder.classList.remove('is-open');
        const utilityMenu = utilityFolder ? utilityFolder.querySelector('.utility-menu') : null;
        if (utilityMenu) utilityMenu.setAttribute('aria-hidden', 'true');
        if (utilityFolderToggle) utilityFolderToggle.setAttribute('aria-expanded', 'false');
    }

    if (utilityFolderToggle) {
        const utilityMenu = utilityFolder ? utilityFolder.querySelector('.utility-menu') : null;
        utilityFolderToggle.setAttribute('aria-expanded', (utilityFolder && utilityFolder.classList.contains('is-open')) ? 'true' : 'false');
        if (utilityMenu) utilityMenu.setAttribute('aria-hidden', (utilityFolder && utilityFolder.classList.contains('is-open')) ? 'false' : 'true');
        utilityFolderToggle.addEventListener('click', function () {
            if (utilityFolder) {
                const isOpen = utilityFolder.classList.toggle('is-open');
                utilityFolderToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                if (utilityMenu) utilityMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
                if (isOpen && panel && panel.classList.contains('is-open')) {
                    panel.classList.remove('is-open');
                    overlay.classList.remove('is-open');
                    panel.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', function () {
            openPanel(this.dataset.panel);
            if (utilityFolder) utilityFolder.classList.remove('is-open');
            if (utilityFolderToggle) utilityFolderToggle.setAttribute('aria-expanded', 'false');
        });
    });

    tabs.forEach((tab) => {
        tab.addEventListener('click', function () {
            setPanel(this.dataset.panel);
        });
    });

    if (overlay) overlay.addEventListener('click', closePanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && panel && panel.classList.contains('is-open')) {
            closePanel();
        }
    });

    // --- Live crypto market logic with chart ---
    let page = 1;
    let perPage = 50;
    const vs_currency = 'usd';
    const intervalMs = 15000; // 15s

    const tableBody = document.getElementById('cryptoTableBody');
    const lastUpdatedEl = document.getElementById('cryptoLastUpdated');
    const perPageEl = document.getElementById('perPage');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const searchEl = document.getElementById('coinSearch');

    let lastData = [];
    let isLastPage = false;

    // Chart.js instance for the top coin
    let marketChart = null;
    const ctx = document.getElementById('marketChart') ? document.getElementById('marketChart').getContext('2d') : null;

    function ensureChart() {
        if (!ctx) return;
        if (marketChart) return;
        marketChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price (USD)',
                    data: [],
                    borderColor: '#ff9f1c',
                                        backgroundColor: 'rgba(255,159,28,0.08)',
                    tension: 0.2,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { autoSkip: true, maxTicksLimit: 6 } },
                    y: { beginAtZero: false }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    if (perPageEl) {
        perPageEl.addEventListener('change', () => {
            perPage = parseInt(perPageEl.value, 10) || 50;
            page = 1;
            fetchAndRender();
        });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { if (page > 1) { page--; fetchAndRender(); } });
    if (nextBtn) nextBtn.addEventListener('click', () => { if (!isLastPage) { page++; fetchAndRender(); } });
    if (searchEl) searchEl.addEventListener('input', () => { renderTable(lastData); });

    async function fetchPrices() {
        try {
            const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response was not ok: ' + res.status);
            const data = await res.json();
            lastData = data;
            isLastPage = data.length < perPage;
            if (lastUpdatedEl) lastUpdatedEl.textContent = new Date().toLocaleTimeString();
            renderTable(data);
            updateChart(data);
        } catch (err) {
            console.error('Failed to fetch crypto prices', err);
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="4">Failed to load live data.</td></tr>';
        }
    }

    function renderTable(data) {
        if (!tableBody) return;
        const q = (searchEl && searchEl.value || '').trim().toLowerCase();
        const filtered = q ? data.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)) : data;
        tableBody.innerHTML = '';
        if (!filtered || filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No results.</td></tr>';
            if (pageInfo) pageInfo.textContent = `Page ${page}`;
            return;
        }
        filtered.forEach(c => {
            const tr = document.createElement('tr');
            tr.dataset.coinId = c.id || '';
            const pct = (c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0);
            const pctClass = (pct >= 0) ? 'positive' : 'negative';
            tr.innerHTML = `
                <td data-label="Coin"><img src="${c.image}" alt="${c.name}" width="20" height="20"> ${c.name} <small>(${c.symbol.toUpperCase()})</small></td>
                <td data-label="Price (USD)">$${Number(c.current_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                <td data-label="24h" class="${pctClass}">${pct ? pct.toFixed(2) + '%' : '-'}</td>
                <td data-label="Market Cap">$${c.market_cap ? Number(c.market_cap).toLocaleString() : '-'}</td>
            `;
            // open coin detail layer when row clicked
            tr.addEventListener('click', () => {
                if (tr.dataset.coinId) openCoinLayer(tr.dataset.coinId);
            });
            tableBody.appendChild(tr);
        });
        if (pageInfo) pageInfo.textContent = `Page ${page}`;
        if (prevBtn) prevBtn.disabled = page <= 1;
        if (nextBtn) nextBtn.disabled = isLastPage;
    }

    function updateChart(data) {
        if (!ctx) return;
        ensureChart();
        if (!marketChart) return;
        // Use the top coin (first in list) as the charted coin
        const coin = data && data[0];
        if (!coin) return;
        const t = new Date();
        const label = t.toLocaleTimeString();
        const price = Number(coin.current_price);

        // push label/price to chart, keep last 30 points
        marketChart.data.labels.push(label);
        marketChart.data.datasets[0].data.push(price);
        if (marketChart.data.labels.length > 30) {
            marketChart.data.labels.shift();
            marketChart.data.datasets[0].data.shift();
        }
        marketChart.update('none');
    }

    // --- Coin detail layer functionality ---
    const coinLayer = document.getElementById('coinLayer');
    const coinLayerClose = document.getElementById('coinLayerClose');
    const coinIcon = document.getElementById('coinIcon');
    const coinName = document.getElementById('coinName');
    const coinSymbol = document.getElementById('coinSymbol');
    const coinPrice = document.getElementById('coinPrice');
    const coinChange = document.getElementById('coinChange');
    const coinMarketCap = document.getElementById('coinMarketCap');
    const coinDesc = document.getElementById('coinDesc');
    const coinChartCanvas = document.getElementById('coinChart');
    let coinChart = null;

    async function openCoinLayer(coinId) {
        if (!coinLayer) return;
        coinLayer.setAttribute('aria-hidden', 'false');
        coinLayer.classList.add('is-open');
        // fetch details
        try {
            await fetchAndShowCoin(coinId);
        } catch (err) {
            console.error('Failed to load coin details', err);
        }
    }

    function closeCoinLayer() {
        if (!coinLayer) return;
        coinLayer.setAttribute('aria-hidden', 'true');
        coinLayer.classList.remove('is-open');
        // destroy chart
        try { if (coinChart) { coinChart.destroy(); coinChart = null; } } catch (e) {}
    }

    if (coinLayerClose) coinLayerClose.addEventListener('click', closeCoinLayer);

    async function fetchAndShowCoin(coinId) {
        // fetch coin basic info
        const infoUrl = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        const res = await fetch(infoUrl);
        if (!res.ok) throw new Error('Coin info fetch failed: ' + res.status);
        const info = await res.json();
        // populate fields
        if (coinIcon) coinIcon.src = info.image ? info.image.small : '';
        if (coinName) coinName.textContent = info.name || '';
        if (coinSymbol) coinSymbol.textContent = (info.symbol || '').toUpperCase();
        const m = info.market_data || {};
        if (coinPrice) coinPrice.textContent = `Price: $${m.current_price && m.current_price.usd ? Number(m.current_price.usd).toLocaleString(undefined, {maximumFractionDigits:2}) : '-'}`;
        if (coinChange) coinChange.textContent = `24h: ${m.price_change_percentage_24h_in_currency && m.price_change_percentage_24h_in_currency.usd ? m.price_change_percentage_24h_in_currency.usd.toFixed(2) + '%' : '-'}`;
        if (coinMarketCap) coinMarketCap.textContent = `Market Cap: $${m.market_cap && m.market_cap.usd ? Number(m.market_cap.usd).toLocaleString() : '-'}`;
        if (coinDesc) coinDesc.innerHTML = info.description && info.description.en ? (info.description.en.split('\n')[0] || '') : '';

        // fetch market chart for 1 day
        await fetchCoinMarketChart(coinId);
    }

    async function fetchCoinMarketChart(coinId) {
        try {
            const chartUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vs_currency}&days=1&interval=hourly`;
            const r = await fetch(chartUrl);
            if (!r.ok) throw new Error('Chart fetch failed: ' + r.status);
            const chartData = await r.json();
            const prices = chartData.prices || [];
            const labels = prices.map(p => new Date(p[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            const values = prices.map(p => p[1]);
            // render chart
            if (coinChart) { coinChart.destroy(); coinChart = null; }
            if (!coinChartCanvas) return;
            const ctxCoin = coinChartCanvas.getContext('2d');
            coinChart = new Chart(ctxCoin, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{ label: 'Price (USD)', data: values, borderColor: '#ff9f1c', backgroundColor: 'rgba(255,159,28,0.06)', tension:0.2, pointRadius:0 }]
                },
                options: { responsive:true, maintainAspectRatio:false, scales: { x:{ ticks:{ autoSkip:true, maxTicksLimit:6 } }, y:{ beginAtZero:false } }, plugins:{ legend:{ display:false } } }
            });
        } catch (err) {
            console.error('Failed to fetch coin market chart', err);
        }
    }

    async function fetchAndRender() {
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
        await fetchPrices();
    }

    // Initial setup
    ensureChart();
    fetchAndRender();
    setInterval(fetchAndRender, intervalMs);
});
