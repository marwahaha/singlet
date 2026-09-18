# Validation

Run the mathematical and content checks:

```sh
npm test
npm run build
python3 scripts/check-links.py
```

The tests cover:

- SWAP involution, complete orthogonal projectors, and measurement repeatability.
- Four-qubit recoupling probabilities, normalization, and fixed-spin singlet-weight identities.
- Schur dimensions and spin-coupling multiplicities.
- Coherence that is visible or invisible to real STP projectors.
- Mixed-state preparation spectra, probabilities, entanglement, and symmetric-state filtering.
- Exact phase boundaries and distinctions between fully symmetric states and separate triplet pairs.
- Unique question IDs, resolved bibliography keys, complete formal variants, and valid LaTeX.

The link checker validates local destinations, fragment identifiers, assets, and the configured base path in the generated site.

For GitHub project hosting, build and check with the same base path:

```sh
SITE_URL=https://marwahaha.github.io BASE_PATH=/singlet/ npm run build
BASE_PATH=/singlet/ python3 scripts/check-links.py
```

Browser checks should exercise pair selection by mouse and keyboard, sampled and conditioned outcomes, reset and undo, zero-probability branches, the Schur and phase controls, question filters, and layouts at narrow and wide viewports. Displayed formulas may scroll within their containers; the page itself should not overflow horizontally.
