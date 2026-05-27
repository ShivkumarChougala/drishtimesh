import { Link } from "react-router-dom";

export default function BlogCard({ post, large = false }) {
  return (
    <Link to={`/blog/${post.slug}`} className={large ? "blog-card blog-card-large" : "blog-card"}>
      <div className="blog-card-visual">
        <span>{post.coverLabel}</span>
      </div>

      <div className="blog-card-body">
        <div className="blog-card-meta">
          <span>{post.category}</span>
          <span>{post.readTime}</span>
        </div>

        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>

        <div className="blog-card-footer">
          <span>{post.date}</span>
          <span>Read article →</span>
        </div>
      </div>
    </Link>
  );
}
