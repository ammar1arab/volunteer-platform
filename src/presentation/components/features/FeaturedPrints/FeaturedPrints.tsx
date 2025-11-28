'use client';

import styles from './FeaturedPrints.module.scss';

import { Container, SectionHeader } from '@/presentation/components';
import { useFeaturedPrints } from '@/presentation/hooks';

import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { FiShare2, FiUser } from 'react-icons/fi';

const FeaturedPrints = () => {
  const { prints, liked, toggleLike, getLikesCount } = useFeaturedPrints();

  return (
    <section className={styles.section}>
      <Container>
        <SectionHeader
          title="بصمات مميزة"
          subtitle="متطوعون تركوا أثراً ملموساً في المجتمع"
        />

        <div className={styles.grid}>
          {prints.map(m => (
            <div key={m.id} className={styles.card}>
              <img src={m.image} alt={m.name} className={styles.image} />

              <h3 className={styles.name}>{m.name}</h3>
              <p className={styles.title}>{m.title}</p>
              <p className={styles.desc}>{m.description}</p>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  aria-label="إعجاب"
                  title="إعجاب"
                  onClick={() => toggleLike(m.id)}
                >
                  {liked[m.id] ? <FaHeart /> : <FaRegHeart />}
                  <span className={styles.likesCount}>{getLikesCount(m)}</span>
                </button>

                <button
                  type="button"
                  className={styles.actionBtn}
                  aria-label="مشاركة"
                  title="مشاركة"
                >
                  <FiShare2 />
                </button>

                <button
                  type="button"
                  className={styles.actionBtn}
                  aria-label="عرض البروفايل"
                  title="عرض البروفايل"
                >
                  <FiUser />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeaturedPrints;
