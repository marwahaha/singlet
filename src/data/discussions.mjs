export const discussionRepository = 'marwahaha/singlet';
export const discussionRepositoryId = 'R_kgDOUffchQ';
export const discussionCategory = 'Announcements';
export const discussionCategoryId = 'DIC_kwDOUffchc4DF2N9';

export const embeddedCommentsEnabled = true;

// Discussion numbers remain stable across both hosts and page-title changes.
export const perspectiveDiscussion = 2;
export const questionDiscussions = { Q13: 1 };
export const discussionUrl = number => `https://github.com/${discussionRepository}/discussions/${number}`;
export const proposeQuestionUrl = `https://github.com/${discussionRepository}/discussions/new?category=ideas`;
export const discussionThemeUrl = 'https://marwahaha.github.io/singlet/giscus/theme.css';
