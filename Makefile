.PHONY: verify checksums

verify:
	python3 scripts/reproduce_results.py
	python3 scripts/reproduce_statistics.py
	python3 scripts/validate_release.py
	python3 -m unittest discover -s tests -v

checksums:
	python3 scripts/generate_checksums.py
