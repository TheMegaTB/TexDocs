#!/bin/sh
FILENAME="$1"
FILEOUT="out/"
LINTOUT="$1.lint"

LINTFMT="%k %n (%l;%c;%d) ||%m||%s||                   %b"

# Run linter
chktex -q -o "${LINTOUT}" "${FILENAME}.tex" --format "${LINTFMT}"


# Generate PDF file and convert to HTML
pdflatex --shell-escape -interaction=batchmode "${FILENAME}.tex"
/usr/bin/pdf2htmlEX --zoom 1.3 --dest-dir "${FILEOUT}" --embed-css 0 --process-annotation 1 "${FILENAME}.pdf"
