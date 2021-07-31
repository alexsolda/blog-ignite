import styles from './header.module.scss';

export default function Header() {
  return (
    <header>
      <div className={styles.container}>
        <img src='/assets/logo.svg' alt='logo' />
      </div>
    </header>
  )
}
