# Singlet

An interactive perspective and research agenda on **subsystem spin as a primitive for quantum computation**, by Kunal Marwaha.

[Read the website](https://marwahaha.github.io/singlet/).

The essay develops singlet–triplet computation, STP universality, Schur–Weyl duality, state resources, verification, and lower bounds. Five interactive experiments accompany 40 research questions and an annotated bibliography.

## Develop

Requires Node 22.12+ and npm.

```sh
npm ci
npm run dev
```

Astro prints the local URL. If the development process detaches, `npx astro dev stop` stops it.

```sh
npm test
npm run build
npm run preview
```

The output is a static `dist/` directory. No server, database, API key, analytics, or external font service is required. Mathematical notation is rendered during the build; the experiments run in the browser.

## Repository map

| Path | Contents |
| --- | --- |
| `src/pages/index.astro` | The research essay |
| `src/components/` | Exposition, mathematical exhibits, and controls |
| `src/data/questions.json` | Questions, assumptions, formal variants, and starting points |
| `src/data/references.json` | Bibliography and relevance notes |
| `src/lib/quantum.mjs` | Four-qubit state vectors, projectors, Schur dimensions, and phase annotations |
| `src/lib/preparation.mjs` | Density matrices and conditional measurement instruments |
| `src/lib/paths.mjs` | Spin-coupling paths |
| `src/scripts/` | Browser interactions |
| `src/styles/` | Typography and responsive layout |
| `tests/` | Analytic reference cases, catalog integrity, and LaTeX validation |
| `scripts/check-links.py` | Generated link and anchor checks |

## Experiments

1. **Recoupling:** select and measure pairs in a four-qubit register; compare singlet, triplet, and fully symmetric inputs.
2. **Schur–Weyl decomposition:** count spin and multiplicity coordinates for two to eight qubits.
3. **Coherence at fixed spin:** vary the relative phase of two total-spin-zero states and inspect their pair probabilities.
4. **Complexity transition:** vary a local singlet energy level, with cited complexity classifications for the corresponding many-body problem.
5. **Combining resources:** compose mixed qubits, singlets, and mixed triplets; inspect or sample cross-pair measurement outcomes and continue from the retained state.

The experiments use small systems with analytic checkpoints. Conditional inspection and Born-rule sampling are separate operations. The phase diagram distinguishes computed local energies from cited many-body complexity theorems.

## Contribute

Keep question IDs stable. Research questions, hypotheses, conjectures, and established results should be distinguished explicitly. Include model assumptions, error and resource conventions, and relevant primary references.

Question text supports `$...$` for inline LaTeX and `$$...$$` for displayed equations. Escape backslashes in JSON (`\\`). The build rejects malformed notation. Permanent question pages and the `/questions.json` export derive from the same catalog; the bibliography and `/references.bib` export derive from the same reference data.

## Hosting

The website is hosted at [marwahaha.github.io/singlet](https://marwahaha.github.io/singlet/). The included GitHub Pages workflow runs tests, builds the site, checks generated links, and deploys on pushes to `main`. It can also be run manually. In repository **Settings → Pages**, the build source is **GitHub Actions**.

For a manual project-path build:

```sh
SITE_URL=https://marwahaha.github.io BASE_PATH=/singlet/ npm run build
BASE_PATH=/singlet/ python3 scripts/check-links.py
```

For a root or custom-domain deployment, set `BASE_PATH=/` and `SITE_URL` to that origin. Navigation, scripts, styles, and downloads respect the base path.

## Citation

`CITATION.cff` supplies citation metadata. See [archiving a citable release](docs/CITABLE-RELEASE.md) for DOI registration. No DOI has been assigned.
