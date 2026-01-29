#!/usr/bin/env python3
"""
StayMate Load Test Performance Analysis Script
Analyzes JMeter results and provides detailed performance insights
"""

import csv
import json
import sys
import os
import argparse
from datetime import datetime
from collections import defaultdict, Counter
import statistics

class JMeterResultAnalyzer:
    def __init__(self, jtl_file):
        self.jtl_file = jtl_file
        self.results = []
        self.metrics = {}

    def parse_jtl_file(self):
        """Parse JMeter JTL file and extract results"""
        try:
            with open(self.jtl_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                self.results = list(reader)
            print(f"✅ Parsed {len(self.results)} results from {self.jtl_file}")
            return True
        except Exception as e:
            print(f"❌ Error parsing JTL file: {e}")
            return False

    def calculate_basic_metrics(self):
        """Calculate basic performance metrics"""
        if not self.results:
            return

        # Extract numeric values
        response_times = []
        latencies = []
        bytes_sent = []
        bytes_received = []
        success_count = 0
        error_count = 0

        for result in self.results:
            try:
                rt = int(result.get('elapsed', 0))
                latency = int(result.get('latency', 0))
                sent = int(result.get('sentBytes', 0))
                received = int(result.get('bytes', 0))

                response_times.append(rt)
                latencies.append(latency)
                bytes_sent.append(sent)
                bytes_received.append(received)

                if result.get('success', 'false').lower() == 'true':
                    success_count += 1
                else:
                    error_count += 1

            except (ValueError, TypeError):
                continue

        total_requests = len(self.results)

        # Calculate metrics
        self.metrics = {
            'total_requests': total_requests,
            'successful_requests': success_count,
            'failed_requests': error_count,
            'error_rate': (error_count / total_requests * 100) if total_requests > 0 else 0,
            'response_time': {
                'min': min(response_times) if response_times else 0,
                'max': max(response_times) if response_times else 0,
                'mean': statistics.mean(response_times) if response_times else 0,
                'median': statistics.median(response_times) if response_times else 0,
                'p90': statistics.quantiles(response_times, n=10)[8] if len(response_times) >= 10 else 0,
                'p95': statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else 0,
                'p99': statistics.quantiles(response_times, n=100)[98] if len(response_times) >= 100 else 0,
            },
            'latency': {
                'min': min(latencies) if latencies else 0,
                'max': max(latencies) if latencies else 0,
                'mean': statistics.mean(latencies) if latencies else 0,
                'median': statistics.median(latencies) if latencies else 0,
            },
            'throughput': {
                'requests_per_second': total_requests / (max(response_times) / 1000) if response_times else 0,
                'bytes_per_second': sum(bytes_received) / (max(response_times) / 1000) if response_times else 0,
            },
            'data_volume': {
                'total_bytes_sent': sum(bytes_sent),
                'total_bytes_received': sum(bytes_received),
            }
        }

    def analyze_by_endpoint(self):
        """Analyze performance by API endpoint"""
        endpoint_stats = defaultdict(lambda: {
            'requests': 0,
            'successes': 0,
            'errors': 0,
            'response_times': [],
            'bytes': []
        })

        for result in self.results:
            label = result.get('label', 'Unknown')
            endpoint_stats[label]['requests'] += 1

            try:
                rt = int(result.get('elapsed', 0))
                bytes_received = int(result.get('bytes', 0))
                endpoint_stats[label]['response_times'].append(rt)
                endpoint_stats[label]['bytes'].append(bytes_received)

                if result.get('success', 'false').lower() == 'true':
                    endpoint_stats[label]['successes'] += 1
                else:
                    endpoint_stats[label]['errors'] += 1
            except (ValueError, TypeError):
                continue

        # Calculate statistics for each endpoint
        for endpoint, stats in endpoint_stats.items():
            if stats['response_times']:
                stats['avg_response_time'] = statistics.mean(stats['response_times'])
                stats['p95_response_time'] = statistics.quantiles(stats['response_times'], n=20)[18] if len(stats['response_times']) >= 20 else max(stats['response_times'])
                stats['error_rate'] = (stats['errors'] / stats['requests'] * 100) if stats['requests'] > 0 else 0

        return dict(endpoint_stats)

    def analyze_by_thread_group(self):
        """Analyze performance by thread group"""
        thread_stats = defaultdict(lambda: {
            'requests': 0,
            'successes': 0,
            'errors': [],
            'response_times': []
        })

        for result in self.results:
            thread_name = result.get('threadName', 'Unknown')
            thread_stats[thread_name]['requests'] += 1

            try:
                rt = int(result.get('elapsed', 0))
                thread_stats[thread_name]['response_times'].append(rt)

                if result.get('success', 'false').lower() == 'true':
                    thread_stats[thread_name]['successes'] += 1
                else:
                    thread_stats[thread_name]['errors'].append(result.get('responseMessage', 'Unknown error'))
            except (ValueError, TypeError):
                continue

        return dict(thread_stats)

    def identify_bottlenecks(self):
        """Identify potential performance bottlenecks"""
        bottlenecks = []

        # High response times
        if self.metrics.get('response_time', {}).get('p95', 0) > 1000:
            bottlenecks.append({
                'type': 'HIGH_RESPONSE_TIME',
                'severity': 'HIGH',
                'description': f"P95 response time is {self.metrics['response_time']['p95']:.0f}ms (>1000ms threshold)",
                'recommendation': 'Investigate slow endpoints, database queries, or external service calls'
            })

        # High error rate
        if self.metrics.get('error_rate', 0) > 5:
            bottlenecks.append({
                'type': 'HIGH_ERROR_RATE',
                'severity': 'HIGH',
                'description': f"Error rate is {self.metrics['error_rate']:.2f}% (>5% threshold)",
                'recommendation': 'Check application logs for errors, investigate failing endpoints'
            })

        # Low throughput
        if self.metrics.get('throughput', {}).get('requests_per_second', 0) < 50:
            bottlenecks.append({
                'type': 'LOW_THROUGHPUT',
                'severity': 'MEDIUM',
                'description': f"Throughput is {self.metrics['throughput']['requests_per_second']:.2f} req/s (<50 threshold)",
                'recommendation': 'Consider scaling up resources or optimizing application performance'
            })

        return bottlenecks

    def generate_report(self, output_file=None):
        """Generate comprehensive performance report"""
        if not self.metrics:
            self.calculate_basic_metrics()

        endpoint_analysis = self.analyze_by_endpoint()
        thread_analysis = self.analyze_by_thread_group()
        bottlenecks = self.identify_bottlenecks()

        report = {
            'generated_at': datetime.now().isoformat(),
            'test_file': self.jtl_file,
            'summary': self.metrics,
            'endpoint_analysis': endpoint_analysis,
            'thread_analysis': thread_analysis,
            'bottlenecks': bottlenecks,
            'recommendations': self._generate_recommendations(bottlenecks)
        }

        if output_file:
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            print(f"📊 Detailed report saved to: {output_file}")

        return report

    def _generate_recommendations(self, bottlenecks):
        """Generate performance recommendations based on bottlenecks"""
        recommendations = []

        bottleneck_types = [b['type'] for b in bottlenecks]

        if 'HIGH_RESPONSE_TIME' in bottleneck_types:
            recommendations.extend([
                "Add database indexes for frequently queried columns",
                "Implement caching for frequently accessed data",
                "Optimize slow database queries",
                "Consider using connection pooling",
                "Implement asynchronous processing for long-running operations"
            ])

        if 'HIGH_ERROR_RATE' in bottleneck_types:
            recommendations.extend([
                "Implement proper error handling and logging",
                "Add circuit breakers for external service calls",
                "Implement retry mechanisms for transient failures",
                "Add input validation to prevent invalid requests",
                "Monitor application logs for error patterns"
            ])

        if 'LOW_THROUGHPUT' in bottleneck_types:
            recommendations.extend([
                "Scale up server resources (CPU, memory)",
                "Implement horizontal scaling with load balancer",
                "Optimize application code for better performance",
                "Use CDN for static content",
                "Implement database read replicas"
            ])

        # General recommendations
        recommendations.extend([
            "Set up continuous performance monitoring",
            "Implement performance testing in CI/CD pipeline",
            "Establish performance budgets and SLAs",
            "Regular performance regression testing"
        ])

        return list(set(recommendations))  # Remove duplicates

    def print_summary(self):
        """Print a summary of the analysis"""
        if not self.metrics:
            self.calculate_basic_metrics()

        print("\n" + "="*60)
        print("📊 PERFORMANCE ANALYSIS SUMMARY")
        print("="*60)

        print(f"\n📈 Overall Metrics:")
        print(f"  Total Requests: {self.metrics['total_requests']:,}")
        print(f"  Successful: {self.metrics['successful_requests']:,}")
        print(f"  Failed: {self.metrics['failed_requests']:,}")
        print(f"  Error Rate: {self.metrics['error_rate']:.2f}%")

        print(f"\n⏱️  Response Times (ms):")
        print(f"  Average: {self.metrics['response_time']['mean']:.0f}")
        print(f"  Median: {self.metrics['response_time']['median']:.0f}")
        print(f"  P95: {self.metrics['response_time']['p95']:.0f}")
        print(f"  P99: {self.metrics['response_time']['p99']:.0f}")
        print(f"  Min: {self.metrics['response_time']['min']:.0f}")
        print(f"  Max: {self.metrics['response_time']['max']:.0f}")

        print(f"\n🚀 Throughput:")
        print(f"  Requests/sec: {self.metrics['throughput']['requests_per_second']:.2f}")
        print(f"  Bytes/sec: {self.metrics['throughput']['bytes_per_second']:.0f}")

        # Top 5 slowest endpoints
        endpoint_analysis = self.analyze_by_endpoint()
        if endpoint_analysis:
            print(f"\n🐌 Top 5 Slowest Endpoints:")
            sorted_endpoints = sorted(
                endpoint_analysis.items(),
                key=lambda x: x[1].get('avg_response_time', 0),
                reverse=True
            )[:5]

            for endpoint, stats in sorted_endpoints:
                print(f"  {endpoint}: {stats.get('avg_response_time', 0):.0f}ms avg, {stats.get('error_rate', 0):.1f}% errors")

        # Bottlenecks
        bottlenecks = self.identify_bottlenecks()
        if bottlenecks:
            print(f"\n🚨 Performance Bottlenecks:")
            for bottleneck in bottlenecks:
                print(f"  [{bottleneck['severity']}] {bottleneck['description']}")

        print("\n" + "="*60)

def main():
    parser = argparse.ArgumentParser(description='Analyze JMeter load test results')
    parser.add_argument('jtl_file', help='Path to JMeter JTL results file')
    parser.add_argument('--output', '-o', help='Output JSON report file')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')

    args = parser.parse_args()

    if not os.path.exists(args.jtl_file):
        print(f"❌ JTL file not found: {args.jtl_file}")
        sys.exit(1)

    # Analyze results
    analyzer = JMeterResultAnalyzer(args.jtl_file)

    if not analyzer.parse_jtl_file():
        sys.exit(1)

    # Generate report
    report = analyzer.generate_report(args.output)

    # Print summary
    analyzer.print_summary()

    # Performance thresholds check
    exit_code = 0

    if report['summary']['error_rate'] > 5:
        print(f"❌ FAIL: Error rate {report['summary']['error_rate']:.2f}% exceeds 5% threshold")
        exit_code = 1

    if report['summary']['response_time']['p95'] > 1000:
        print(f"❌ FAIL: P95 response time {report['summary']['response_time']['p95']:.0f}ms exceeds 1000ms threshold")
        exit_code = 1

    if exit_code == 0:
        print("✅ PASS: All performance thresholds met")

    sys.exit(exit_code)

if __name__ == '__main__':
    main()
