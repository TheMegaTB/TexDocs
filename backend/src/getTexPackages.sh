#!/usr/bin/env bash
find /usr -name '*.sty' 2>/dev/null | grep -oE '/([^/]+)/[^/]+\.sty$' | cut -f2 -d'/' | sort | uniq