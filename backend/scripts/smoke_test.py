#!/usr/bin/env python3
"""Smoke test script for ORBITAL DELTA FastAPI backend.

Calls the running API with all sample pairs and prints a formatted summary table:
Sample, Regions found, Changed %, Avg confidence, Latency, and Classifier used.
"""

import argparse
import sys
import time
from pathlib import Path
import httpx

SAMPLE_PAIRS = [
    ("forest", "Deforestation", "forest_t1.jpg", "forest_t2.jpg"),
    ("urban", "Urban construction", "urban_t1.jpg", "urban_t2.jpg"),
    ("coast", "Coastal erosion", "coast_t1.jpg", "coast_t2.jpg"),
    ("flood", "Flood damage", "flood_t1.jpg", "flood_t2.jpg"),
]


def run_smoke_test(base_url: str):
    """Execute smoke test against the live backend."""
    base_url = base_url.rstrip("/")
    samples_dir = Path(__file__).resolve().parent.parent / "samples"

    print(f"\n========================================================")
    print(f" ORBITAL DELTA :: Mission Control Smoke Test Suite")
    print(f" Target API: {base_url}")
    print(f" Samples:    {samples_dir}")
    print(f"========================================================\n")

    client = httpx.Client(timeout=35.0)

    # 1. Health check
    try:
        health_resp = client.get(f"{base_url}/api/health")
        health_resp.raise_for_status()
        health_data = health_resp.json()
        gemini_active = health_data.get("gemini", False)
        print(f"[+] Health check OK: status={health_data.get('status')}, gemini_active={gemini_active}\n")
    except Exception as e:
        print(f"[-] Health check failed: {e}")
        print("    Ensure the backend server is running on the target port.")
        return False

    # 2. Benchmark Samples
    try:
        samples_resp = client.get(f"{base_url}/api/samples")
        samples_resp.raise_for_status()
        sample_list = samples_resp.json()
        print(f"[+] /api/samples returned {len(sample_list)} datasets.")
    except Exception as e:
        print(f"[-] /api/samples check failed: {e}")
        return False

    print("\nRunning change detection pipeline across all 4 sample pairs...\n")

    results = []
    all_passed = True

    for sample_id, name, t1_filename, t2_filename in SAMPLE_PAIRS:
        t1_path = samples_dir / t1_filename
        t2_path = samples_dir / t2_filename

        if not t1_path.exists() or not t2_path.exists():
            print(f"[-] Missing files for {sample_id}: {t1_path} or {t2_path}")
            all_passed = False
            continue

        try:
            with open(t1_path, "rb") as f1, open(t2_path, "rb") as f2:
                files = {
                    "before": (t1_filename, f1.read(), "image/jpeg"),
                    "after": (t2_filename, f2.read(), "image/jpeg"),
                }

            start_t = time.perf_counter()
            resp = client.post(f"{base_url}/api/analyze", files=files)
            latency_ms = (time.perf_counter() - start_t) * 1000

            if resp.status_code != 200:
                print(f"[-] {sample_id} failed with HTTP {resp.status_code}: {resp.text}")
                results.append({
                    "sample": sample_id,
                    "regions": "ERR",
                    "changed_pct": "ERR",
                    "avg_conf": "ERR",
                    "latency": f"{latency_ms:.0f}ms",
                    "classifier": "FAILED",
                    "status": "FAIL",
                })
                all_passed = False
                continue

            data = resp.json()
            num_regions = len(data.get("regions", []))
            changed_pct = f"{data.get('changed_area_percent', 0.0):.1f}%"
            avg_conf = f"{data.get('avg_confidence', 0.0):.2f}"
            
            # Determine classifier
            # Fallback uses lower confidences in 0.55-0.75 range or generic heuristic text
            # Gemini produces richer sentences or gemini is flagged active
            classifier = "gemini" if gemini_active else "fallback"

            results.append({
                "sample": sample_id,
                "regions": str(num_regions),
                "changed_pct": changed_pct,
                "avg_conf": avg_conf,
                "latency": f"{latency_ms:.0f}ms",
                "classifier": classifier,
                "status": "PASS",
            })

        except Exception as e:
            print(f"[-] Exception processing {sample_id}: {e}")
            all_passed = False

    # Print formatted table
    print("\n" + "-" * 78)
    print(f"{'Sample':<10} | {'Regions':<8} | {'Changed Area':<14} | {'Avg Conf':<9} | {'Latency':<10} | {'Classifier':<10} | {'Status':<6}")
    print("-" * 78)
    for r in results:
        print(f"{r['sample']:<10} | {r['regions']:<8} | {r['changed_pct']:<14} | {r['avg_conf']:<9} | {r['latency']:<10} | {r['classifier']:<10} | {r['status']:<6}")
    print("-" * 78)

    if all_passed:
        print("\n>>> ALL SMOKE TESTS PASSED SUCCESSFULLY! <<<\n")
        return True
    else:
        print("\n>>> ONE OR MORE SAMPLES FAILED! <<<\n")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ORBITAL DELTA API Smoke Test")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL of backend server")
    args = parser.parse_args()

    success = run_smoke_test(args.url)
    sys.exit(0 if success else 1)
