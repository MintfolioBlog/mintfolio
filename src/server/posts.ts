import { getCollection, type CollectionEntry } from 'astro:content';
import type { PublicSite } from '@mintfolio/theme-api';
import { previewDrafts, publishedBefore } from 'virtual:mintfolio/runtime';
import { selectPublishedPosts, toPostSummary } from './postModel';
import { getPublicSite } from './site';
import { resolveAsset } from './routing';
import { contentText, readingStats } from './contentText';
export { UNCATEGORIZED, PROTECTED_POST_DESCRIPTION, isProtectedPost, getPostDescription, toPostSummary, collectTaxonomy, collectArchives, selectPublishedPosts, relatedPosts } from './postModel';
export type InternalPost = CollectionEntry<'blog'>;
/** Production, feeds and public search always use this reader. */
export async function getPublishedPosts():Promise<InternalPost[]> { return selectPublishedPosts(await getCollection('blog'),{now:import.meta.env.DEV?new Date():new Date(publishedBefore)}); }
/** Only an explicit dev command can expose drafts; build never sets the virtual flag. */
export async function getVisiblePosts():Promise<InternalPost[]> { return selectPublishedPosts(await getCollection('blog'),{preview:import.meta.env.DEV&&previewDrafts,now:import.meta.env.DEV?new Date():new Date(publishedBefore)}); }
// Cache only derived prose, keyed by identity and the exact current source. Metadata
// is always projected afresh; edits invalidate the entry during a running dev session.
const proseCache=new Map<string,{source:string;text:string;wordCount:number;readingMinutes:number}>();
/** Reuse public prose extraction without parsing every article once per generated page. */
export function getPostProse(post:InternalPost):{text:string;wordCount:number;readingMinutes:number} {
  if(post.data.password!==undefined) return {text:'',wordCount:0,readingMinutes:0};
  const source=post.body??'';
  const cached=proseCache.get(post.id);
  if(cached?.source===source) return cached;
  const text=contentText(source);
  const next={source,text,...readingStats(text)};
  proseCache.set(post.id,next);
  return next;
}
/**
 * Enrich safe metadata without exposing protected prose.
 * @param post Current validated collection entry.
 * @param site Optional batch-scoped author projection; defaults to the current site.
 * @returns A fresh public summary, with reading statistics only for unprotected content.
 */
export function summarizePost(post:InternalPost, site:Pick<PublicSite,'authors'>=getPublicSite()) {
  const summary=toPostSummary(post,{authors:site.authors,preview:import.meta.env.DEV&&previewDrafts,now:import.meta.env.DEV?new Date():new Date(publishedBefore)});
  if(typeof summary.cover==='string') summary.cover=resolveAsset(summary.cover);
  if(summary.protected) return summary;
  const {wordCount,readingMinutes}=getPostProse(post);
  return {...summary,wordCount,readingMinutes};
}

/**
 * @param posts Current validated entries; neither entries nor their order are mutated.
 * @returns Fresh summaries sharing only one configuration read for this call.
 * No configuration or summary cache survives this batch, so dev edits remain visible.
 */
export function summarizePosts(posts:readonly InternalPost[]) {
  if(!posts.length) return [];
  const site=getPublicSite();
  return posts.map(post=>summarizePost(post,site));
}
