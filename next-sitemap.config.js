/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.youthprints.online',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/signin',
    '/signup',
    '/volunteer/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/signin', '/signup', '/volunteer'],
      },
    ],
    additionalSitemaps: [
      'https://www.youthprints.online/sitemap.xml',
    ],
  },
  additionalPaths: async () => {
    try {
      const [postsRes, activitiesRes] = await Promise.all([
        fetch('https://www.youthprints.online/api/featured-posts?limit=1000'),
        fetch('https://www.youthprints.online/api/activities?limit=1000'),
      ]);

      const posts = postsRes.ok ? await postsRes.json() : [];
      const activities = activitiesRes.ok ? await activitiesRes.json() : [];

      const postPaths = (posts?.data ?? posts ?? []).map((post) => ({
        loc: `/posts/${post.id}`,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: post.updatedAt ?? new Date().toISOString(),
      }));

      const activityPaths = (activities?.data ?? activities ?? []).map((activity) => ({
        loc: `/activities/${activity.id}`,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: activity.updatedAt ?? new Date().toISOString(),
      }));

      return [...postPaths, ...activityPaths];
    } catch {
      return [];
    }
  },
};