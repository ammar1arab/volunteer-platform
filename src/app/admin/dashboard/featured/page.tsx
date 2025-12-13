import styles from './page.module.scss';

const FeaturedPage = () => {
  const posts = [
    { id: 1, title: 'Summer Camp Success', date: '2024-12-01' },
    { id: 2, title: 'Community Garden', date: '2024-11-15' },
  ];

  return (
    <div className={styles.container}>
      <h2>Featured Posts</h2>
      <div className={styles.list}>
        {posts.map(post => (
          <div key={post.id} className={styles.item}>
            <h3>{post.title}</h3>
            <span>{post.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedPage;