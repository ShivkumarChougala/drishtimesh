import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import BlogCard from "../components/blog/BlogCard";
import { getPostBySlug, getRelatedPosts } from "../data/blogPosts";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const relatedPosts = getRelatedPosts(slug);

  if (!post) {
    return (
      <>
        <Navbar />
        <AnnouncementBar />
        <main className="blog-page blog-not-found">
          <h1>Article not found</h1>
          <p>This resource does not exist or may have moved.</p>
          <Link to="/blog">← Back to resources</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <AnnouncementBar />

      <main className="blog-post-page article-page">
        <div className="article-breadcrumb">
          <Link to="/blog">BLOG</Link>
          <span>›</span>
          <span>{post.category}</span>
        </div>

        <section className="article-hero-grid">
          <div className="article-hero-copy">
            <span className="article-badge">{post.category}</span>
            <h1>{post.title}</h1>

            <div className="blog-index-meta">
              <span>{post.author}</span>
              <i></i>
              <span>{post.date}</span>
            </div>

            <div className="article-share">
              <span>●</span>
              <span>◐</span>
              <span>𝕏</span>
              <span>in</span>
            </div>
          </div>

          <div className="article-cover">
            <strong>DRISHTIMESH</strong>
            <h2>{post.coverLabel}</h2>
            <p>{post.title}</p>
          </div>
        </section>

        <section className="blog-post-layout">
          <article className="blog-post-content">
            <p className="article-lead">{post.excerpt}</p>

            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </article>

          <aside className="blog-sidebar">
            <div className="sidebar-card newsletter-card">
              <h3>Get the latest threat notes delivered to your inbox.</h3>
              <input placeholder="Email address..." />
              <button>Subscribe</button>
            </div>

            <div className="sidebar-card">
              <span>Topic</span>
              <h3>{post.coverLabel}</h3>
              <p>
                Signals, context, and explainable intelligence from the
                DrishtiMesh network.
              </p>
            </div>
          </aside>
        </section>

        {relatedPosts.length > 0 && (
          <section className="related-posts">
            <div className="section-heading">
              <span>Related content</span>
              <h2>Keep reading</h2>
            </div>

            <div className="blog-grid">
              {relatedPosts.map((item) => (
                <BlogCard key={item.slug} post={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
