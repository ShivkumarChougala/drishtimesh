import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import BlogCard from "../components/blog/BlogCard";
import { blogPosts } from "../data/blogPosts";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Posts");

  const featuredPost = blogPosts.find((post) => post.featured) || blogPosts[0];
  const normalPosts = blogPosts.filter((post) => post.slug !== featuredPost.slug);

  const filteredPosts = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    let results = blogPosts;

    if (activeCategory !== "All Posts") {
      results = results.filter(
        (post) => post.category === activeCategory
      );
    }

    if (!value) {
      return results;
    }

    return results.filter((post) => {
      return [
        post.title,
        post.excerpt,
        post.category,
        post.coverLabel,
        ...(post.tags || [])
      ]
        .join(" ")
        .toLowerCase()
        .includes(value);
    });
  }, [searchTerm, activeCategory, featuredPost, normalPosts]);

  return (
    <>
      <Navbar />
      <AnnouncementBar />

      <main className="blog-page blog-index-page">
        <div className="blog-kicker">BLOG</div>

        {featuredPost && (
          <section className="blog-index-feature">
            <div className="blog-index-feature-copy">
              <span>{featuredPost.category}</span>
              <h1>{featuredPost.title}</h1>
              <p>{featuredPost.excerpt}</p>

              <div className="blog-index-meta">
                <span>{featuredPost.author}</span>
                <i></i>
                <span>{featuredPost.date}</span>
              </div>
            </div>

            <div className="blog-index-feature-art">
              <div>
                <strong>DRISHTIMESH</strong>
                <h2>{featuredPost.coverLabel}</h2>
                <p>{featuredPost.title}</p>
              </div>
            </div>
          </section>
        )}

        <section className="blog-index-toolbar">
          <div className="blog-categories">
            {["All Posts", "Threat Signals", "Research", "Insights", "Product"].map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "blog-pill active" : "blog-pill"}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="blog-search">
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </section>

        <section className="blog-index-grid">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))
          ) : (
            <div className="blog-empty">
              No articles found for “{searchTerm}”.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
