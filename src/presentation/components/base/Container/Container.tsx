'use client';

import { ReactNode } from 'react';
import styles from './Container.module.scss';

interface Props {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}

const Container = ({ children, className, flush = false }: Props) => {
  return (
    <div className={`${styles.container} ${flush ? styles.flush : ''} ${className || ''}`}>
      {children}
    </div>
  );
};

export default Container;
