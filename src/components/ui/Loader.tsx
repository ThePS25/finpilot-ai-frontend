import styles from './Loader.module.scss';

export function Loader({ fullPage }: { fullPage?: boolean }) {
  return (
    <div className={fullPage ? styles.pageLoader : styles.loader}>
      <div className={styles.spinner} />
      <span>Loading...</span>
    </div>
  );
}
