import Link from "next/link";
import styles from "./NavItems.module.scss";

export function NavItem({ item, active, href }: any) {
  return (
    <Link className={styles.navItem} href={href}>
      <div className={`${styles.icon} ${active ? styles.active : ""}`}>
        {item.icon}
      </div>
      <div className={`${styles.label} ${active ? styles.active : ""}`}>
        {item.label}
      </div>
    </Link>
  );
}
