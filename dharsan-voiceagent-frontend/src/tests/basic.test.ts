describe('Basic Test Setup', () => {
  test('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should have WebSocket available', () => {
    expect(typeof WebSocket).toBe('function');
  });

  test('should have AudioContext available', () => {
    expect(typeof AudioContext).toBe('function');
  });

  test('should have AudioWorkletNode available', () => {
    expect(typeof AudioWorkletNode).toBe('function');
  });

  test('should have navigator.mediaDevices available', () => {
    expect(navigator.mediaDevices).toBeDefined();
    expect(typeof navigator.mediaDevices.getUserMedia).toBe('function');
  });
}); 