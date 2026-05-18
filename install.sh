#!/bin/sh
set -e

REPO="${NAZARE_REPO:-https://github.com/fedorivanenko/nazare-registry.git}"
REF="${NAZARE_REF:-main}"

need() {
	command -v "$1" >/dev/null 2>&1 || {
		echo "$1 required"
		exit 1
	}
}

need node
need git

TMP="$(mktemp -d)"
cleanup() {
	rm -rf "$TMP"
}
trap cleanup EXIT INT TERM

git clone --depth 1 --branch "$REF" "$REPO" "$TMP/nazare-registry" >/dev/null 2>&1 || {
	echo "Failed to clone $REPO ($REF)"
	exit 1
}

NAZARE_SOURCE_DIR="$TMP/nazare-registry" node "$TMP/nazare-registry/bin/cli.js" self install
