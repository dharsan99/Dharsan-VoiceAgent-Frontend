// Quick Service Check for Phase 2
// Run this in browser console at http://localhost:5173/

console.log('🔍 Phase 2 Service Check Starting...');

async function checkService(url, name) {
    try {
        const response = await fetch(url);
        console.log(`✅ ${name}: ${response.status} - ${response.statusText}`);
        return true;
    } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        return false;
    }
}

async function checkWebSocket(url, name) {
    return new Promise((resolve) => {
        const ws = new WebSocket(url);
        let timeout = setTimeout(() => {
            console.log(`❌ ${name}: Timeout`);
            ws.close();
            resolve(false);
        }, 3000);

        ws.onopen = () => {
            clearTimeout(timeout);
            console.log(`✅ ${name}: Connected`);
            ws.close();
            resolve(true);
        };

        ws.onerror = (error) => {
            clearTimeout(timeout);
            console.log(`❌ ${name}: ${error}`);
            resolve(false);
        };
    });
}

async function runQuickCheck() {
    console.log('\n📊 Checking Services...');
    
    // HTTP Services
    await checkService('http://localhost:8080/health', 'Media Server');
    await checkService('http://localhost:5173/', 'Frontend Dev Server');
    
    console.log('\n🔌 Checking WebSocket...');
    await checkWebSocket('ws://localhost:8001/ws', 'Orchestrator WebSocket');
    
    console.log('\n🎯 Quick Check Complete!');
    console.log('💡 For detailed testing, use the comprehensive test interface');
}

// Auto-run when loaded
runQuickCheck(); 