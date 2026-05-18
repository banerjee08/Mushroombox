"use client";
import './Blog.css';

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: 'The Health Benefits of Oyster Mushrooms',
      excerpt: 'Discover why Oyster mushrooms are packed with vitamins, antioxidants, and a unique umami flavor.',
      date: 'April 20, 2026',
      image: '/images/oyster-mushroom.png',
    },
    {
      id: 2,
      title: 'How to Store Fresh Mushrooms',
      excerpt: 'Keep your mushrooms fresh for longer with these simple storage hacks from our farm.',
      date: 'April 15, 2026',
      image: '/images/pink-oyster-mushroom.png',
    },
    {
      id: 3,
      title: 'Our Journey: From Farm to Delhi NCR',
      excerpt: 'A look into how Mushroombox was built out of a passion for fresh, organic local food.',
      date: 'April 10, 2026',
      image: '/images/shiitake-mushroom.png',
    }
  ];

  return (
    <div className="blog-page container">
      <div className="blog-header">
        <h1 className="blog-title">Mushroombox Blog</h1>
        <p className="blog-description">Stories, recipes, and tips from the farm.</p>
      </div>

      <div className="blog-grid">
        {posts.map(post => (
          <article key={post.id} className="blog-card">
            <img src={post.image} alt={post.title} className="blog-image" />
            <div className="blog-content">
              <span className="blog-date">{post.date}</span>
              <h3 className="blog-post-title">{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <button className="btn btn-outline read-more-btn">Read More</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
