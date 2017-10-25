#!/bin/sh
SCRIPT=`realpath -s $0`
SCRIPTPATH=`dirname $SCRIPT`
PREFIX="$2"

TARGET_DIR="$1"
LINTOUT="${PREFIX}.lint"
LINTFMT="%k %n (%l;%c;%d) ||%m||%s||                   %b"

cd "${TARGET_DIR}"

# Run linter
chktex -q -o "${LINTOUT}" "${PREFIX}.tex" --format "${LINTFMT}"

# Generate PDF file
#pdflatex --shell-escape -interaction=batchmode "${PREFIX}.tex"
#latexmk -f -pdf -xelatex -interaction=nonstopmode "${PREFIX}.tex"
#latexmk -f -pdf -xelatex -interaction=nonstopmode "${PREFIX}.tex" | grep -e "\[[0-9]\+" | \
#    sed -e "s/\[/\n/gi" | sed -e "/^[0-9]\+/{s/\([0-9]\+\).*/\1/gi ; p } ; d"
latexmk -f -pdf -r "${SCRIPTPATH}/glossaries.latexmk" -xelatex -shell-escape -interaction=nonstopmode "${PREFIX}.tex" | sed -e "/^HELLO [0-9]\+/{s/HELLO \([0-9]\+\).*/\1/gi ; p } ; d"
