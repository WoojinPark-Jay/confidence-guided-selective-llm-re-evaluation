"""Export verified synthetic case records; never accept Reddit source text."""
import argparse
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA256 = '77fdf9430614fb48d0af4f47aee108944b64bc4736925d8923ccb4747e98cb15'
SELECTION = [('MEV2_DEP_046', 'Correction'), ('MEV2_HAP_003', 'Introduced error'),
             ('MEV2_NEU_004', 'Parsing fallback'), ('MEV2_DEP_001', 'Not routed')]


def rows(path):
    return {r['example_id']: r for r in csv.DictReader(path.open())}


def export(raw_path=None):
    destination = ROOT / 'data/mixed_emotion/site_case_records.json'
    if raw_path:
        source = Path(raw_path)
        assert hashlib.sha256(source.read_bytes()).hexdigest() == SOURCE_SHA256
        raw = rows(source)
        data = rows(ROOT / 'data/mixed_emotion/mixed_emotion_stress_test_300.csv')
        phase1 = rows(ROOT / 'data/mixed_emotion/mixed_emotion_phase1_outputs.csv')
        final = rows(ROOT / 'results/predictions/mixed_emotion__llama3__self_discover.csv')
        plan = (ROOT / 'plans/llama3_plan.txt').read_text().strip()
        assert len(raw) == 86
        for key, record in raw.items():
            assert record['phase2_original_text'] == data[key]['text']
            assert record['sd_reasoning_structure'].strip() == plan
            assert record['phase1_label'] == phase1[key]['phase1_label']
            assert abs(float(record['phase1_confidence']) - float(phase1[key]['phase1_confidence'])) < 1e-7
            assert (record['final_label'] or record['phase1_label']) == final[key]['final_label']
        cases = []
        for key, outcome in SELECTION:
            r = raw.get(key)
            cases.append(dict(example_id=key, outcome=outcome, text=data[key]['text'],
                              target_label=data[key]['target_label'], phase1_label=phase1[key]['phase1_label'],
                              confidence=float(phase1[key]['phase1_confidence']), routed=key in raw,
                              final_label=final[key]['final_label'],
                              parsed_label=r['final_label'] if r else None,
                              response=r['sd_final_answer'] if r else None))
        payload = dict(source_filename=source.name, source_sha256=SOURCE_SHA256,
                       model=next(iter(raw.values()))['model_name'],
                       model_revision=next(iter(raw.values()))['model_revision'],
                       prompt_version=next(iter(raw.values()))['prompt_version'],
                       selection='First correction in source order, the sole introduced error, the sole parsing fallback, and the first dataset row (an accepted error). Qualitative examples, not a representative sample.',
                       cases=cases)
        destination.write_text(json.dumps(payload, ensure_ascii=True, indent=2) + '\n')
    payload = json.loads(destination.read_text())
    (ROOT / 'site/case-data.js').write_text('window.CASE_DATA = ' + json.dumps(payload, ensure_ascii=True) + ';\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--raw', help='Original, hash-verified Mixed Emotion v6c CSV (optional after initial import)')
    export(parser.parse_args().raw)
