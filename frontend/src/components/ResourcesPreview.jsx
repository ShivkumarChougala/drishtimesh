import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

export default function ResourcesPreview() {
  const featuredPost = blogPosts[0];

  return (
    <section className="resources-preview" id="resources">
      <div className="resources-header">
        <div>
          <span className="eyebrow">Resources</span>
          <h2>Research, intelligence, and community learnings.</h2>
        </div>

        <Link to="/blog" className="resources-link">
          View all articles →
        </Link>
      </div>

      <div className="resources-grid">
        <Link
          to={`/blog/${featuredPost.slug}`}
          className="resource-feature-card"
        >
          <div className="resource-visual">
            <span>{featuredPost.coverLabel}</span>
          </div>

          <div className="resource-content">
            <div className="resource-meta">
              <span>{featuredPost.category}</span>
              <span>{featuredPost.readTime}</span>
            </div>

            <h3>{featuredPost.title}</h3>

            <p>{featuredPost.excerpt}</p>

            <div className="resource-footer">
              <span>{featuredPost.date}</span>
              <span>Read article →</span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
