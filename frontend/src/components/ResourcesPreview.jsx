import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

export default function ResourcesPreview() {
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <section className="resources-preview" id="resources">
      <div className="resources-preview-bg"></div>

      <div className="resources-header centered">
        <div>
          <h2>Resources</h2>
        </div>
      </div>

      <div className="resources-cards-grid">
        {latestPosts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="resource-mini-card"
          >
            <span className="resource-mini-badge">
              {post.category}
            </span>

            <h3>{post.title}</h3>

            <div className="resource-mini-footer">
              <span>Read more</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
