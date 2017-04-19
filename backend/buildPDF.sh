#!/bin/sh
PREFIX="$2"

TARGET_DIR="$1"
LINTOUT="${PREFIX}.lint"
LINTFMT="%k %n (%l;%c;%d) ||%m||%s||                   %b"

cd "${TARGET_DIR}"

# Run linter
chktex -q -o "${LINTOUT}" "${PREFIX}.tex" --format "${LINTFMT}"

# Generate PDF file
#pdflatex --shell-escape -interaction=batchmode "${PREFIX}.tex"
latexmk -f -pdf -xelatex -interaction=nonstopmode "${PREFIX}.tex"
