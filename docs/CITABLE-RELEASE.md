# A citable release

The website is a living document. A DOI should identify a preserved release of the essay, question catalog, references, and interactive source. `CITATION.cff` supplies author and title metadata; it intentionally contains no invented DOI or release date.

The current source can run on GitHub Pages without a server. `.github/workflows/pages.yml` builds the static site, including the correct repository base path. The Sites address can remain available independently.

## Archive with Zenodo

1. Choose the repository audience and reuse license for the code and authored text. No new reuse license has been assumed here.
2. Connect the public GitHub repository to the author's Zenodo account and enable that repository before creating its first archival release.
3. Tag and publish the reviewed release. Zenodo archives that release and issues a version DOI and an overarching concept DOI.
4. Add the assigned DOI to `CITATION.cff` and the site's citation section. Cite the version DOI when reproducing a particular state of the experiments or research questions, and the concept DOI for the evolving work.

A normal Git commit or deployed web URL does not issue a DOI. Publishing the Zenodo record requires an authenticated archive account.

Primary instructions: [Zenodo GitHub integration](https://help.zenodo.org/docs/github/), [enable a repository](https://help.zenodo.org/docs/github/enable-repository/), [archive a release](https://help.zenodo.org/docs/github/archive-software/github-upload/), [GitHub citation metadata](https://docs.github.com/en/repositories/archiving-a-github-repository/referencing-and-citing-content).
