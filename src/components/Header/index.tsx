import styles from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  return (
    <header>
      <div className={styles.container}>
        <Link href='/'>
          <img src='/assets/logo.svg' alt='logo' />
        </Link>
      </div>
    </header>
  )
}
