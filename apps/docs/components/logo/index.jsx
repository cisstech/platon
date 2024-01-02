import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LogoImg from '../../public/platon.svg';
import styles from './style.module.css';

export const Logo = () => {
  const [origin, setOrigin] = useState('/');
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className={styles.container}>
      <Link href={origin.includes('github') ? `${origin}/platon` : origin}>
        <Image className={styles.logo} src={LogoImg} alt="Logo" width={48} height={48} />
      </Link>
      Documentation PLaTon
    </div>
  );
}
