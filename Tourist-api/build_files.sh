#!/bin/bash
echo "BUILD START"
python3.9 -m pip install -r requirements.txt || echo "Pip install failed"
python3.9 manage.py migrate || echo "Migrate failed"
echo "BUILD END"