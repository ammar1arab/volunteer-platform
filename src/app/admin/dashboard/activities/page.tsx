import styles from './page.module.scss';

const ActivitiesPage = () => {
  const activities = [
    { id: 1, title: 'Beach Cleanup', status: 'Active' },
    { id: 2, title: 'Food Drive', status: 'Completed' },
    { id: 3, title: 'Tree Planting', status: 'Upcoming' },
  ];

  return (
    <div className={styles.container}>
      <h2>Current Activities</h2>
      <div className={styles.list}>
        {activities.map(activity => (
          <div key={activity.id} className={styles.item}>
            <h3>{activity.title}</h3>
            <span className={styles.status}>{activity.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesPage;