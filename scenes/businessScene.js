// scenes/businessScene.js – wraps the business_dashboard.html as a reusable scene

export async function setup(root) {
  // 1. Inject HTML markup from business dashboard
  const wrapper = document.createElement('div');
  wrapper.id = 'business-scene';
  wrapper.innerHTML = `
    <div id="container">
        <!-- Header (no animation) -->
        <div class="title">MODU.BUSINESS.INTELLIGENCE</div>
        <div class="subtitle">REALTIME.ECOMMERCE.MONITORING</div>
        <div class="mode-indicator">LIVE.OPERATIONS.STREAM</div>
        
        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Products Table -->
            <div class="table-container left-table">
                <div class="table-header">
                    <h3>PRODUCT.CATALOG</h3>
                    <div class="table-subtitle">LIVE.INVENTORY.FEED</div>
                </div>
                <div class="table-scroll" id="products-table">
                    <table>
                        <thead>
                            <tr>
                                <th>IMAGE</th>
                                <th>PRODUCT</th>
                                <th>PRICE</th>
                                <th>STOCK</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody id="products-tbody">
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Transactions Table -->
            <div class="table-container right-table">
                <div class="table-header">
                    <h3>TRANSACTION.LOG</h3>
                    <div class="table-subtitle">LIVE.SALES.STREAM</div>
                </div>
                <div class="table-scroll" id="transactions-table">
                    <table>
                        <thead>
                            <tr>
                                <th>TXN#</th>
                                <th>CUSTOMER</th>
                                <th>PRODUCT</th>
                                <th>AMOUNT</th>
                                <th>TIME</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-tbody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Bottom Metrics Bar -->
        <div class="metrics-bar">
            <div class="metric-item">
                <span class="metric-label">REVENUE:</span>
                <span class="metric-value" id="total-revenue">€0.00</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">ORDERS:</span>
                <span class="metric-value" id="total-orders">0</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">AVG:</span>
                <span class="metric-value" id="avg-order">€0.00</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">LOW.STOCK:</span>
                <span class="metric-value warning" id="low-stock">0</span>
            </div>
        </div>
        
        <!-- Controls -->
        <div class="controls">
            ← → : SWITCH.SCENES • SPACE: PAUSE.STREAMS<span class="cursor"></span>
        </div>
    </div>
  `;
  root.appendChild(wrapper);

  // 2. Inject the CSS styles for the business dashboard
  const style = document.createElement('style');
  style.textContent = `
    #business-scene {
      position: absolute;
      width: 100vw;
      height: 100vh;
      background: #000;
      font-family: 'Courier New', monospace;
      overflow: hidden;
      color: #fff;
    }
    
    #business-scene #container {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    /* Header */
    #business-scene .title {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 16px;
      color: #00ff41;
      letter-spacing: 4px;
      z-index: 20;
      animation: fadeInFromTop 0.6s forwards;
      opacity: 0;
      animation-delay: 0.1s;
    }
    
    #business-scene .subtitle {
      position: absolute;
      top: 32px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      color: #888;
      letter-spacing: 2px;
      z-index: 20;
      animation: fadeInFromTop 0.6s forwards;
      opacity: 0;
      animation-delay: 0.2s;
    }
    
    #business-scene .mode-indicator {
      position: absolute;
      top: 52px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 9px;
      color: #00ff41;
      z-index: 20;
      animation: fadeInFromTop 0.6s forwards;
      opacity: 0;
      animation-delay: 0.3s;
    }
    
    /* Main Content */
    #business-scene .main-content {
      display: flex;
      flex: 1;
      margin-top: 80px;
      margin-bottom: 60px;
      gap: 20px;
      padding: 0 20px;
    }
    
    #business-scene .table-container {
      flex: 1;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #333;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      opacity: 0;
    }
    
    #business-scene .left-table {
      animation: fadeInFromLeft 0.8s forwards;
      animation-delay: 0.3s;
    }
    
    #business-scene .right-table {
      animation: fadeInFromRight 0.8s forwards;
      animation-delay: 0.3s;
    }
    
    #business-scene .table-header {
      background: rgba(0, 0, 0, 0.9);
      padding: 12px 16px;
      border-bottom: 1px solid #333;
    }
    
    #business-scene .table-header h3 {
      margin: 0;
      font-size: 12px;
      color: #ffffff;
      letter-spacing: 2px;
    }
    
    #business-scene .table-subtitle {
      margin: 4px 0 0 0;
      font-size: 8px;
      color: #888;
      letter-spacing: 1px;
    }
    
    #business-scene .table-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    #business-scene table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    
    #business-scene th {
      background: rgba(0, 0, 0, 0.9);
      padding: 12px 8px;
      border-bottom: 1px solid #333;
      color: #ffffff;
      font-weight: bold;
      text-align: left;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    #business-scene td {
      padding: 10px 6px;
      border-bottom: 1px solid #222;
      vertical-align: middle;
      height: 64px;
    }
    
    #business-scene tr:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    #business-scene .product-img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border: 1px solid #333;
      border-radius: 2px;
    }
    
    #business-scene .product-name {
      color: #ffffff;
      font-weight: bold;
      font-size: 10px;
      max-width: 150px;
      word-wrap: break-word;
    }
    
    #business-scene .price {
      color: #ffffff;
      font-weight: bold;
    }
    
    #business-scene .stock {
      color: #888;
    }
    
    #business-scene .stock.low {
      color: #ff4444;
      animation: pulse 2s infinite;
    }
    
    #business-scene .status {
      font-size: 7px;
      padding: 2px 4px;
      border-radius: 2px;
      text-transform: uppercase;
    }
    
    #business-scene .status.ok {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    
    #business-scene .status.low {
      background: rgba(255, 68, 68, 0.2);
      color: #ff4444;
    }
    
    #business-scene .status.out {
      background: rgba(255, 170, 0, 0.2);
      color: #ffaa00;
    }
    
    #business-scene .txn-id {
      color: #888;
      font-family: monospace;
    }
    
    #business-scene .customer {
      color: #ffffff;
      font-size: 8px;
    }
    
    #business-scene .amount {
      color: #ff6b00;
      font-weight: bold;
    }
    
    #business-scene .time {
      color: #888;
      font-size: 7px;
    }
    
    /* Metrics Bar */
    #business-scene .metrics-bar {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 30px;
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid #333;
      padding: 8px 20px;
      border-radius: 4px;
      opacity: 0;
      animation: fadeInFromBottom 0.6s forwards;
      animation-delay: 0.5s;
    }
    
    #business-scene .metric-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    #business-scene .metric-label {
      color: #888;
      font-size: 8px;
    }
    
    #business-scene .metric-value {
      color: #ffffff;
      font-weight: bold;
      font-size: 9px;
    }
    
    #business-scene .metric-value.warning {
      color: #ff4444;
    }
    
    #business-scene .controls {
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 7px;
      color: #444;
      text-align: center;
      opacity: 0;
      animation: fadeIn 0.6s forwards;
      animation-delay: 0.7s;
    }
    
    #business-scene .cursor {
      display: inline-block;
      background: #00ff41;
      width: 6px;
      height: 10px;
      animation: blink 1s infinite;
      margin-left: 2px;
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }
    
    /* Scene transition animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInFromTop {
      from { 
        opacity: 0;
        transform: translateY(-20px) translateX(-50%);
      }
      to { 
        opacity: 1;
        transform: translateY(0) translateX(-50%);
      }
    }
    
    @keyframes fadeInFromBottom {
      from { 
        opacity: 0;
        transform: translateY(20px) translateX(-50%);
      }
      to { 
        opacity: 1;
        transform: translateY(0) translateX(-50%);
      }
    }
    
    @keyframes fadeInFromLeft {
      from { 
        opacity: 0;
        transform: translateX(-40px);
      }
      to { 
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInFromRight {
      from { 
        opacity: 0;
        transform: translateX(40px);
      }
      to { 
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    /* Scrollbar styling */
    #business-scene .table-scroll::-webkit-scrollbar {
      width: 6px;
    }
    
    #business-scene .table-scroll::-webkit-scrollbar-track {
      background: #222;
    }
    
    #business-scene .table-scroll::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }
    
    #business-scene .table-scroll::-webkit-scrollbar-thumb:hover {
      background: #aaa;
    }
    
    /* Even faster continuous scroll animations (no ping-pong) */
    #business-scene .left-table .table-scroll {
      animation: scroll-up 8s linear infinite;
    }
    
    #business-scene .right-table .table-scroll {
      animation: scroll-down 6s linear infinite;
    }
    
    @keyframes scroll-up {
      0% { 
        transform: translateY(0);
      }
      100% { 
        transform: translateY(-400px);
      }
    }
    
    @keyframes scroll-down {
      0% { 
        transform: translateY(-400px);
      }
      100% { 
        transform: translateY(0);
      }
    }
    
    /* Fade in animation for new rows */
    .fade-in-row {
      opacity: 0;
      transform: translateX(-20px);
      animation: fadeInSlide 0.8s ease-out forwards;
    }
    
    .fade-in-row-right {
      opacity: 0;
      transform: translateX(20px);
      animation: fadeInSlideRight 0.8s ease-out forwards;
    }
    
    @keyframes fadeInSlide {
      0% {
        opacity: 0;
        transform: translateX(-20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInSlideRight {
      0% {
        opacity: 0;
        transform: translateX(20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    /* Enhanced exit animations for scene transitions */
    .scene-exit .title,
    .scene-exit .subtitle,
    .scene-exit .mode-indicator {
      animation: fadeOutToTop 0.4s forwards;
    }
    
    .scene-exit .left-table {
      animation: fadeOutToLeft 0.4s forwards;
    }
    
    .scene-exit .right-table {
      animation: fadeOutToRight 0.4s forwards;
    }
    
    .scene-exit .metrics-bar {
      animation: fadeOutToBottom 0.4s forwards;
    }
    
    .scene-exit .controls {
      animation: fadeOut 0.3s forwards;
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    @keyframes fadeOutToTop {
      from { 
        opacity: 1;
        transform: translateY(0) translateX(-50%);
      }
      to { 
        opacity: 0;
        transform: translateY(-20px) translateX(-50%);
      }
    }
    
    @keyframes fadeOutToBottom {
      from { 
        opacity: 1;
        transform: translateY(0) translateX(-50%);
      }
      to { 
        opacity: 0;
        transform: translateY(20px) translateX(-50%);
      }
    }
    
    @keyframes fadeOutToLeft {
      from { 
        opacity: 1;
        transform: translateX(0);
      }
      to { 
        opacity: 0;
        transform: translateX(-40px);
      }
    }
    
    @keyframes fadeOutToRight {
      from { 
        opacity: 1;
        transform: translateX(0);
      }
      to { 
        opacity: 0;
        transform: translateX(40px);
      }
    }
  `;
  document.head.appendChild(style);

  // 3. Execute the business table logic
  const products = [
    {id: 101, name: "Modular Denim Jacket", price: 85.00, stock: 15, category: "Outerwear", image: "Items/Screenshot 2025-07-16 at 17.20.24.png"},
    {id: 102, name: "Convertible Cargo Pants", price: 69.00, stock: 20, category: "Bottoms", image: "Items/Screenshot 2025-07-16 at 17.20.31.png"},
    {id: 103, name: "Layered Cotton Tee", price: 35.00, stock: 30, category: "Tops", image: "Items/Screenshot 2025-07-16 at 17.20.49.png"},
    {id: 104, name: "Reversible Modular Skirt", price: 55.00, stock: 10, category: "Bottoms", image: "Items/Screenshot 2025-07-16 at 17.20.59.png"},
    {id: 105, name: "Adjustable Belt Bag", price: 45.00, stock: 25, category: "Accessories", image: "Items/Screenshot 2025-07-16 at 17.21.36.png"},
    {id: 106, name: "Essential Hoodie", price: 60.00, stock: 18, category: "Tops", image: "Items/Screenshot 2025-07-16 at 17.21.49.png"},
    {id: 107, name: "Chunky Knit Scarf", price: 28.00, stock: 22, category: "Accessories", image: "Items/Screenshot 2025-07-16 at 17.23.39.png"},
    {id: 108, name: "Packable Raincoat", price: 110.00, stock: 8, category: "Outerwear", image: "Items/Screenshot 2025-07-16 at 17.24.04.png"},
    {id: 109, name: "Mix & Match Sneakers", price: 95.00, stock: 12, category: "Shoes", image: "Items/Screenshot 2025-07-16 at 17.25.01.png"}
  ];

  // Business metrics
  let businessMetrics = {
    totalRevenue: 12847.50,
    ordersToday: 47,
    avgOrderValue: 73.25,
    lowStockItems: 0
  };

  // Generate mock customer names and locations
  const customerNames = [
    "Emma Laurent", "Sophie Martin", "Lucas Dubois", "Chloe Bernard", 
    "Antoine Moreau", "Lea Rousseau", "Thomas Petit", "Camille Robert",
    "Maxime Durand", "Julie Leroy", "Nicolas Simon", "Marion Michel",
    "Alexandre Muller", "Clara Lefebvre", "Gabriel Garcia", "Manon Roux"
  ];

  const cities = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", 
    "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Tours"
  ];

  let streamActive = true;
  let transactionCounter = 1000;
  let intervals = [];

  function generateTransaction() {
    const product = products[Math.floor(Math.random() * products.length)];
    const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const amount = product.price * quantity;
    
    // Update business metrics
    businessMetrics.totalRevenue += amount;
    businessMetrics.ordersToday++;
    businessMetrics.avgOrderValue = businessMetrics.totalRevenue / businessMetrics.ordersToday;
    
    // Reduce stock
    product.stock = Math.max(0, product.stock - quantity);
    
    return {
      id: ++transactionCounter,
      productName: product.name,
      customer: customer,
      location: city,
      amount: amount,
      quantity: quantity,
      timestamp: new Date().toLocaleTimeString()
    };
  }

  function addProductRow() {
    if (!streamActive) return;
    
    const product = products[Math.floor(Math.random() * products.length)];
    const tbody = wrapper.querySelector('#products-tbody');
    
    const row = document.createElement('tr');
    const stockStatus = product.stock === 0 ? 'out' : product.stock < 15 ? 'low' : 'ok';
    const stockClass = product.stock < 15 ? 'low' : '';
    
    // Add fade-in animation
    row.className = 'fade-in-row';
    
    row.innerHTML = 
      '<td><img src="' + product.image + '" alt="' + product.name + '" class="product-img" onerror="this.style.display=\'none\'"></td>' +
      '<td class="product-name">' + product.name + '</td>' +
      '<td class="price">€' + product.price.toFixed(2) + '</td>' +
      '<td class="stock ' + stockClass + '">' + product.stock + '</td>' +
      '<td><span class="status ' + stockStatus + '">' + stockStatus.toUpperCase() + '</span></td>';
    
    // Add to top of table
    tbody.insertBefore(row, tbody.firstChild);
    
    // Keep reasonable number of rows and loop back to bottom if needed
    if (tbody.children.length > 25) {
      // Move oldest row back to bottom with new data for continuous loop
      const oldestRow = tbody.lastChild;
      tbody.removeChild(oldestRow);
      
      // Update it with new random product data and place at top
      const loopProduct = products[Math.floor(Math.random() * products.length)];
      const loopStatus = loopProduct.stock === 0 ? 'out' : loopProduct.stock < 15 ? 'low' : 'ok';
      const loopClass = loopProduct.stock < 15 ? 'low' : '';
      
      oldestRow.innerHTML = 
        '<td><img src="' + loopProduct.image + '" alt="' + loopProduct.name + '" class="product-img square-animation" onerror="this.style.display=\'none\'"></td>' +
        '<td class="product-name square-animation">' + loopProduct.name + '</td>' +
        '<td class="price square-animation">€' + loopProduct.price.toFixed(2) + '</td>' +
        '<td class="stock ' + loopClass + ' square-animation">' + loopProduct.stock + '</td>' +
        '<td><span class="status ' + loopStatus + ' square-animation">' + loopStatus.toUpperCase() + '</span></td>';
      
      // Add it to top with animation
      oldestRow.className = 'fade-in-row';
      tbody.insertBefore(oldestRow, tbody.firstChild);
    }
    
    // Add subtle auto-scroll effect
    setTimeout(() => {
      const tableScroll = wrapper.querySelector('#products-table');
      if (tableScroll && Math.random() < 0.4) {
        tableScroll.scrollBy({ 
          top: 40, 
          behavior: 'smooth' 
        });
      }
    }, 500);
  }

  function addTransactionRow() {
    if (!streamActive) return;
    
    const transaction = generateTransaction();
    const tbody = wrapper.querySelector('#transactions-tbody');
    
    const row = document.createElement('tr');
    
    // Add fade-in animation from right
    row.className = 'fade-in-row-right';
    
    row.innerHTML = 
      '<td class="txn-id square-animation">TXN#' + transaction.id + '</td>' +
      '<td class="customer square-animation">' + transaction.customer + '<br><small style="color:#666">' + transaction.location + '</small></td>' +
      '<td class="product-name square-animation">' + transaction.productName + '</td>' +
      '<td class="amount square-animation">€' + transaction.amount.toFixed(2) + '</td>' +
      '<td class="time square-animation">' + transaction.timestamp + '</td>';
    
    // Add to top of table
    tbody.insertBefore(row, tbody.firstChild);
    
    // Keep reasonable number of rows and loop back to bottom if needed
    if (tbody.children.length > 18) {
      // Move oldest row back to bottom with new data for continuous loop
      const oldestRow = tbody.lastChild;
      tbody.removeChild(oldestRow);
      
      // Generate new transaction and update row
      const loopTransaction = generateTransaction();
      
      oldestRow.innerHTML = 
        '<td class="txn-id square-animation">TXN#' + loopTransaction.id + '</td>' +
        '<td class="customer square-animation">' + loopTransaction.customer + '<br><small style="color:#666">' + loopTransaction.location + '</small></td>' +
        '<td class="product-name square-animation">' + loopTransaction.productName + '</td>' +
        '<td class="amount square-animation">€' + loopTransaction.amount.toFixed(2) + '</td>' +
        '<td class="time square-animation">' + loopTransaction.timestamp + '</td>';
      
      // Add it to top with animation
      oldestRow.className = 'fade-in-row-right';
      tbody.insertBefore(oldestRow, tbody.firstChild);
    }
    
    // Add subtle auto-scroll effect (opposite direction)
    setTimeout(() => {
      const tableScroll = wrapper.querySelector('#transactions-table');
      if (tableScroll && Math.random() < 0.5) {
        tableScroll.scrollBy({ 
          top: -30, 
          behavior: 'smooth' 
        });
      }
    }, 300);
    
    updateMetrics();
  }

  function updateMetrics() {
    businessMetrics.lowStockItems = products.filter(p => p.stock < 15).length;
    
    const totalRevenue = wrapper.querySelector('#total-revenue');
    const totalOrders = wrapper.querySelector('#total-orders');
    const avgOrder = wrapper.querySelector('#avg-order');
    const lowStock = wrapper.querySelector('#low-stock');
    
    if (totalRevenue) totalRevenue.textContent = '€' + businessMetrics.totalRevenue.toFixed(2);
    if (totalOrders) totalOrders.textContent = businessMetrics.ordersToday;
    if (avgOrder) avgOrder.textContent = '€' + businessMetrics.avgOrderValue.toFixed(2);
    if (lowStock) lowStock.textContent = businessMetrics.lowStockItems;
  }

  function populateInitialData() {
    // Add more initial product rows
    for (let i = 0; i < 15; i++) {
      addProductRow();
    }
    
    // Add more initial transaction rows
    for (let i = 0; i < 12; i++) {
      addTransactionRow();
    }
  }

  // Event listeners
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && wrapper.contains(event.target)) {
      event.preventDefault();
      streamActive = !streamActive;
    }
  });

  // Initialize
  populateInitialData();
  updateMetrics();
  
  // Start intervals with faster timing for more dynamic activity
  intervals.push(setInterval(addProductRow, 1200));
  intervals.push(setInterval(addTransactionRow, 800));
  intervals.push(setInterval(updateMetrics, 2000));

  // Return teardown function
  return {
    teardown() {
      try {
        // Add exit animations before actual removal
        wrapper.classList.add('scene-exit');
        
        // Clear the intervals we created
        intervals.forEach(id => clearInterval(id));
        intervals = [];
        
        // Allow time for exit animations to complete
        setTimeout(() => {
          wrapper.remove();
          style.remove();
        }, 400);
      } catch(e) { 
        console.warn('Business scene teardown error:', e);
      }
    }
  };
}

export default { setup }; 