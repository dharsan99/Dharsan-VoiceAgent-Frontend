#!/usr/bin/env python3
"""
Phase 2 Backend Integration Test Suite
Tests all backend services and measures performance metrics
"""

import asyncio
import aiohttp
import websockets
import json
import time
import statistics
from typing import Dict, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Phase2BackendTester:
    def __init__(self):
        self.results = {
            'services': {},
            'protocols': {},
            'performance': {},
            'errors': []
        }
        self.start_time = time.time()
        
    async def test_media_server_health(self) -> Dict[str, Any]:
        """Test Media Server health endpoint"""
        logger.info("Testing Media Server health...")
        start_time = time.time()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get('http://localhost:8080/health') as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"Media Server health: {data}")
                        
                        return {
                            'status': 'success',
                            'response_time_ms': response_time,
                            'data': data,
                            'phase_2_enabled': data.get('phase') == '2',
                            'ai_enabled': data.get('ai_enabled', False),
                            'kafka_connected': data.get('kafka') == 'connected'
                        }
                    else:
                        return {
                            'status': 'error',
                            'response_time_ms': response_time,
                            'error': f"HTTP {response.status}"
                        }
        except Exception as e:
            return {
                'status': 'error',
                'response_time_ms': (time.time() - start_time) * 1000,
                'error': str(e)
            }
    
    async def test_orchestrator_websocket(self) -> Dict[str, Any]:
        """Test Orchestrator WebSocket connection"""
        logger.info("Testing Orchestrator WebSocket...")
        start_time = time.time()
        
        try:
            uri = "ws://localhost:8001/ws"
            async with websockets.connect(uri) as websocket:
                connection_time = (time.time() - start_time) * 1000
                
                # Send test message
                test_message = {
                    "type": "test",
                    "session_id": "test_session",
                    "message": "Hello AI"
                }
                
                await websocket.send(json.dumps(test_message))
                
                # Wait for response (with timeout)
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    response_time = (time.time() - start_time) * 1000
                    
                    logger.info(f"WebSocket response: {response}")
                    
                    return {
                        'status': 'success',
                        'connection_time_ms': connection_time,
                        'response_time_ms': response_time,
                        'response': response
                    }
                except asyncio.TimeoutError:
                    return {
                        'status': 'warning',
                        'connection_time_ms': connection_time,
                        'error': 'No response received (timeout)'
                    }
                    
        except Exception as e:
            return {
                'status': 'error',
                'connection_time_ms': (time.time() - start_time) * 1000,
                'error': str(e)
            }
    
    async def test_whip_protocol(self) -> Dict[str, Any]:
        """Test WHIP protocol endpoint"""
        logger.info("Testing WHIP protocol...")
        start_time = time.time()
        
        # Simple SDP offer for testing
        sdp_offer = """v=0
o=- 0 2 IN IP4 127.0.0.1
s=-
t=0 0
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=mid:audio
a=sendonly
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'http://localhost:8080/whip',
                    headers={'Content-Type': 'application/sdp'},
                    data=sdp_offer
                ) as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status in [200, 201]:
                        logger.info(f"WHIP test successful: {response.status}")
                        return {
                            'status': 'success',
                            'response_time_ms': response_time,
                            'http_status': response.status
                        }
                    else:
                        return {
                            'status': 'error',
                            'response_time_ms': response_time,
                            'error': f"HTTP {response.status}"
                        }
        except Exception as e:
            return {
                'status': 'error',
                'response_time_ms': (time.time() - start_time) * 1000,
                'error': str(e)
            }
    
    async def test_kafka_connectivity(self) -> Dict[str, Any]:
        """Test Kafka connectivity via Media Server"""
        logger.info("Testing Kafka connectivity...")
        
        # Test via Media Server health endpoint
        health_result = await self.test_media_server_health()
        
        if health_result['status'] == 'success':
            kafka_status = health_result['data'].get('kafka', 'unknown')
            return {
                'status': 'success' if kafka_status == 'connected' else 'error',
                'kafka_status': kafka_status,
                'details': health_result['data']
            }
        else:
            return {
                'status': 'error',
                'error': 'Cannot test Kafka - Media Server unavailable'
            }
    
    async def test_ai_pipeline(self) -> Dict[str, Any]:
        """Test AI pipeline end-to-end"""
        logger.info("Testing AI pipeline...")
        start_time = time.time()
        
        try:
            uri = "ws://localhost:8001/ws"
            async with websockets.connect(uri) as websocket:
                # Send AI test message
                ai_test_message = {
                    "type": "ai_test",
                    "session_id": "test_ai_session",
                    "transcript": "Hello, how are you today?"
                }
                
                await websocket.send(json.dumps(ai_test_message))
                
                # Wait for AI response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    response_time = (time.time() - start_time) * 1000
                    
                    logger.info(f"AI pipeline response: {response}")
                    
                    return {
                        'status': 'success',
                        'response_time_ms': response_time,
                        'response': response
                    }
                except asyncio.TimeoutError:
                    return {
                        'status': 'warning',
                        'response_time_ms': (time.time() - start_time) * 1000,
                        'error': 'AI response timeout'
                    }
                    
        except Exception as e:
            return {
                'status': 'error',
                'response_time_ms': (time.time() - start_time) * 1000,
                'error': str(e)
            }
    
    async def measure_latency(self, test_func, iterations: int = 5) -> Dict[str, Any]:
        """Measure latency for a given test function"""
        logger.info(f"Measuring latency for {test_func.__name__}...")
        
        latencies = []
        results = []
        
        for i in range(iterations):
            start_time = time.time()
            result = await test_func()
            latency = (time.time() - start_time) * 1000
            
            latencies.append(latency)
            results.append(result)
            
            # Small delay between iterations
            await asyncio.sleep(0.1)
        
        return {
            'min_latency_ms': min(latencies),
            'max_latency_ms': max(latencies),
            'avg_latency_ms': statistics.mean(latencies),
            'median_latency_ms': statistics.median(latencies),
            'std_deviation_ms': statistics.stdev(latencies) if len(latencies) > 1 else 0,
            'success_rate': len([r for r in results if r['status'] == 'success']) / len(results),
            'results': results
        }
    
    async def run_comprehensive_tests(self) -> Dict[str, Any]:
        """Run all comprehensive tests"""
        logger.info("Starting comprehensive Phase 2 backend tests...")
        
        # Service health tests
        self.results['services']['media_server'] = await self.test_media_server_health()
        self.results['services']['orchestrator'] = await self.test_orchestrator_websocket()
        
        # Protocol tests
        self.results['protocols']['whip'] = await self.test_whip_protocol()
        self.results['protocols']['websocket'] = await self.test_orchestrator_websocket()
        self.results['protocols']['kafka'] = await self.test_kafka_connectivity()
        self.results['protocols']['ai_pipeline'] = await self.test_ai_pipeline()
        
        # Performance measurements
        self.results['performance']['media_server_latency'] = await self.measure_latency(
            self.test_media_server_health, 5
        )
        self.results['performance']['websocket_latency'] = await self.measure_latency(
            self.test_orchestrator_websocket, 3
        )
        self.results['performance']['ai_pipeline_latency'] = await self.measure_latency(
            self.test_ai_pipeline, 3
        )
        
        # Calculate overall metrics
        total_time = time.time() - self.start_time
        self.results['summary'] = {
            'total_test_time_seconds': total_time,
            'services_healthy': len([s for s in self.results['services'].values() if s['status'] == 'success']),
            'protocols_working': len([p for p in self.results['protocols'].values() if p['status'] == 'success']),
            'overall_success_rate': self._calculate_success_rate()
        }
        
        return self.results
    
    def _calculate_success_rate(self) -> float:
        """Calculate overall success rate"""
        all_results = list(self.results['services'].values()) + list(self.results['protocols'].values())
        if not all_results:
            return 0.0
        
        successful = len([r for r in all_results if r['status'] == 'success'])
        return successful / len(all_results)
    
    def print_results(self):
        """Print formatted test results"""
        print("\n" + "="*60)
        print("🎯 PHASE 2 BACKEND TEST RESULTS")
        print("="*60)
        
        # Service Status
        print("\n📊 SERVICE STATUS:")
        for service, result in self.results['services'].items():
            status_icon = "✅" if result['status'] == 'success' else "❌" if result['status'] == 'error' else "⚠️"
            print(f"  {status_icon} {service.replace('_', ' ').title()}: {result['status']}")
            if 'response_time_ms' in result:
                print(f"     Response Time: {result['response_time_ms']:.2f}ms")
        
        # Protocol Status
        print("\n🔗 PROTOCOL STATUS:")
        for protocol, result in self.results['protocols'].items():
            status_icon = "✅" if result['status'] == 'success' else "❌" if result['status'] == 'error' else "⚠️"
            print(f"  {status_icon} {protocol.replace('_', ' ').title()}: {result['status']}")
            if 'response_time_ms' in result:
                print(f"     Response Time: {result['response_time_ms']:.2f}ms")
        
        # Performance Metrics
        print("\n📈 PERFORMANCE METRICS:")
        for metric, data in self.results['performance'].items():
            print(f"  📊 {metric.replace('_', ' ').title()}:")
            print(f"     Average: {data['avg_latency_ms']:.2f}ms")
            print(f"     Min: {data['min_latency_ms']:.2f}ms")
            print(f"     Max: {data['max_latency_ms']:.2f}ms")
            print(f"     Success Rate: {data['success_rate']*100:.1f}%")
        
        # Summary
        summary = self.results['summary']
        print(f"\n🎯 SUMMARY:")
        print(f"  Total Test Time: {summary['total_test_time_seconds']:.2f}s")
        print(f"  Services Healthy: {summary['services_healthy']}")
        print(f"  Protocols Working: {summary['protocols_working']}")
        print(f"  Overall Success Rate: {summary['overall_success_rate']*100:.1f}%")
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS:")
        if summary['overall_success_rate'] >= 0.9:
            print("  🎉 Phase 2 backend is ready for production testing!")
        elif summary['overall_success_rate'] >= 0.7:
            print("  ⚠️  Phase 2 backend is mostly ready, some issues to address")
        else:
            print("  ❌ Phase 2 backend needs significant fixes before testing")
        
        print("="*60)

async def main():
    """Main test execution"""
    tester = Phase2BackendTester()
    
    try:
        results = await tester.run_comprehensive_tests()
        tester.print_results()
        
        # Save results to file
        with open('phase2-backend-test-results.json', 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\n📄 Results saved to: phase2-backend-test-results.json")
        
    except Exception as e:
        logger.error(f"Test execution failed: {e}")
        print(f"❌ Test execution failed: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 