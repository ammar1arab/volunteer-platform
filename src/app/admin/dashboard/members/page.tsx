import styles from './page.module.scss';

const MembersPage = () => {
  const members = [
    { id: 1, name: 'Ahmad Ali', hours: 120 },
    { id: 2, name: 'Sara Omar', hours: 95 },
  ];

  return (
    <div className={styles.container}>
      <h2>Top Members</h2>
      <div className={styles.list}>
        {members.map(member => (
          <div key={member.id} className={styles.item}>
            <h3>{member.name}</h3>
            <span>{member.hours}h</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersPage;