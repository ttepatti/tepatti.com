module.exports = {
  createSchema: (pages, config) => {
    return `
	type Query {
        pageByIndex(index: Int!): Page
		    pageByTitle(title: String!): Page
        pages: [Page]
        posts: [Page]
    }
    type Page {
        html: String
		frontmatter: Frontmatter
        excerpt: String
        relativePath: String
        active: Boolean
    }
	type Frontmatter {
		title: String
		date: String
		layout: String
	}
	`
  } ,
  createRoot: (pages, config) => {
    return {
      // When we fetch pages, we want to return everything except blog posts
      pages: args => pages.filter(p => p.frontmatter.type !== 'blog'),
      // allPages will fetch ALL pages, including blog posts. Useful for a sitemap?
      allPages: () => pages,
      // Get page by index
      pageByIndex: args => pages[args.index],
      // Get page by title
      pageByTitle: args => pages.filter(p => p.frontmatter.tile === args.title),
      // Get blog posts by only getting pages with type === 'blog'
      posts: args => pages.filter(p => p.frontmatter.type === 'blog')
    }
  }
}