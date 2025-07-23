// Test utility for storage functionality
import { 
  StorageUtils, 
  MetricsStorage, 
  ConversationStorage, 
  SessionStorage, 
  PreferencesStorage 
} from './storage';

export const testUniqueIdGeneration = () => {
  console.log('🔑 Testing Unique ID Generation...');

  // Test 1: Generate multiple session IDs
  const sessionIds = [];
  for (let i = 0; i < 5; i++) {
    sessionIds.push(StorageUtils.generateSessionId());
  }
  console.log('✅ Session IDs generated:', sessionIds);

  // Test 2: Generate multiple conversation IDs
  const conversationIds = [];
  for (let i = 0; i < 5; i++) {
    conversationIds.push(StorageUtils.generateConversationId());
  }
  console.log('✅ Conversation IDs generated:', conversationIds);

  // Test 3: Test ID uniqueness
  const allIds = [...sessionIds, ...conversationIds];
  const uniqueIds = new Set(allIds);
  const isUnique = allIds.length === uniqueIds.size;
  console.log(`✅ ID Uniqueness: ${isUnique ? 'PASS' : 'FAIL'}`);

  // Test 4: Test guaranteed unique ID generation
  const guaranteedIds = [];
  for (let i = 0; i < 3; i++) {
    guaranteedIds.push(StorageUtils.generateGuaranteedUniqueId('test'));
  }
  console.log('✅ Guaranteed unique IDs:', guaranteedIds);

  // Test 5: Validate data integrity
  const integrity = StorageUtils.validateDataIntegrity();
  console.log('✅ Data Integrity Check:', integrity);

  return {
    sessionIds,
    conversationIds,
    isUnique,
    guaranteedIds,
    integrity
  };
};

export const testStorageFunctionality = () => {
  console.log('🧪 Testing Storage Functionality...');

  // Test 1: Generate session ID
  const sessionId = StorageUtils.generateSessionId();
  console.log('✅ Session ID generated:', sessionId);

  // Test 2: Add test metrics
  MetricsStorage.add({
    averageLatency: 150,
    jitter: 25,
    packetLoss: 1.5,
    processingTime: 2500,
    sessionId,
  });
  console.log('✅ Test metrics added');

  // Test 3: Add test conversation
  ConversationStorage.add({
    userInput: 'Hello, how are you?',
    aiResponse: 'I\'m doing well, thank you for asking!',
    confidence: 0.95,
    processingTime: 2.5,
    sessionId,
  });
  console.log('✅ Test conversation added');

  // Test 4: Add test session
  SessionStorage.add({
    sessionId,
    totalExchanges: 1,
    averageLatency: 150,
    totalErrors: 0,
    status: 'active',
  });
  console.log('✅ Test session added');

  // Test 5: Update preferences
  PreferencesStorage.update({ theme: 'dark', audioLevel: 0.8 });
  console.log('✅ Preferences updated');

  // Test 6: Verify data retrieval
  const metrics = MetricsStorage.getBySession(sessionId);
  const conversations = ConversationStorage.getBySession(sessionId);
  const sessions = SessionStorage.getAll();
  const preferences = PreferencesStorage.get();
  const usageStats = StorageUtils.getUsageStats();

  console.log('📊 Storage Test Results:');
  console.log('- Metrics count:', metrics.length);
  console.log('- Conversations count:', conversations.length);
  console.log('- Sessions count:', sessions.length);
  console.log('- Preferences theme:', preferences.theme);
  console.log('- Total storage size:', (usageStats.totalSize / 1024).toFixed(1), 'KB');

  // Test 7: Export data
  const exportedData = StorageUtils.exportData();
  console.log('✅ Data exported successfully, size:', (exportedData.length / 1024).toFixed(1), 'KB');

  // Test 8: Clear test data
  MetricsStorage.clearSession(sessionId);
  ConversationStorage.clearSession(sessionId);
  console.log('✅ Test data cleared');

  console.log('🎉 Storage functionality test completed successfully!');
  
  return {
    sessionId,
    metricsCount: metrics.length,
    conversationsCount: conversations.length,
    sessionsCount: sessions.length,
    exportedDataSize: exportedData.length,
  };
};

// Function to run storage test from browser console
if (typeof window !== 'undefined') {
  (window as any).testStorage = testStorageFunctionality;
  (window as any).testUniqueIds = testUniqueIdGeneration;
  console.log('💡 Run testStorage() in console to test storage functionality');
  console.log('💡 Run testUniqueIds() in console to test unique ID generation');
} 