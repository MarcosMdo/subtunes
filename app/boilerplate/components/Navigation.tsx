// components/Navigation.js
import Link from 'next/link';
import styles from './Navigation.module.css'

const Navigation = () => {
  return (
    <nav className={styles.navigation}>
        <div className={styles.leftSection}>
            {/* Logo */}
            <Link href="/boilerplate/home">
                {/* <a className={styles.logoContainer}> */}
                <img src="/subtunes.png" alt="subtunes Logo" className={styles.logo} />
                {/* <span className={styles.library}>Library</span>
                </a> */}
            </Link>
            

            {/* Library Dropdown */}
            <div className={styles.dropdown}>
                <Link className={styles.library} href="/boilerplate/home">Library</Link>
                <div className={styles.dropdownContent}>
                <Link href="/boilerplate/viewsubtunes">
                    Subtunes
                </Link>
                <Link href="/boilerplate/viewplaylists">
                    Playlists
                </Link>
                </div>
            </div>

            {/* Create Dropdown */}
            <div className={styles.dropdown}>
                <span className={styles.create}>Create</span>
                <div className={styles.dropdownContent}>
                <Link href="/boilerplate/createsubtune">
                    Subtune
                </Link>
                <Link href="/boilerplate/createplaylist">
                    Playlist
                </Link>
                </div>
            </div>
        </div>

      {/* User Info */}
      <div className={styles.userInfo}>
        <span className={styles.userName}>Adriel</span>
        {/* Placeholder for the user's profile picture */}
        <img src="/profile-picture-placeholder.png" alt="Profile Picture" className={styles.profilePicture} />
      </div>
    </nav>
  );
};

export default Navigation;
