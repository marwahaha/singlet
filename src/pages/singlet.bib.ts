import { citationBibtex } from '../data/citation.mjs';

export const GET = () => new Response(citationBibtex, {
  headers: { 'Content-Type': 'application/x-bibtex; charset=utf-8' },
});
