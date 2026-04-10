import styles from './Instagram.module.css';
import { INSTAGRAM_HANDLE, INSTAGRAM_PROFILE_URL } from '../constants';
import { type InstagramPostData, useInstagramPosts } from '../hooks/useContent';

interface InstagramPost extends InstagramPostData {}

interface InstagramProps {
    title?: string;
    handle?: string;
    posts?: InstagramPost[];
}

export const Instagram = ({
    title = "Follow us on Instagram",
    handle = INSTAGRAM_HANDLE,
    posts,
}: InstagramProps) => {
    const { posts: livePosts, loading } = useInstagramPosts();
    const resolvedPosts = posts ?? livePosts;
    const hasPosts = resolvedPosts.length > 0;
    const username = handle.startsWith('@') ? handle.slice(1) : handle;
    const profileUrl = username === INSTAGRAM_HANDLE.slice(1)
        ? INSTAGRAM_PROFILE_URL
        : `https://www.instagram.com/${username}/`;

    const getPostBadge = (post: InstagramPost) => {
        if (post.mediaType === 'VIDEO') {
            return 'Video';
        }

        return 'Post';
    };

    return (
        <section
            className={styles.section}
        >
            <div className="container">
                <h3 className={styles.title}>{title}</h3>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={styles.handle}>{handle}</a>

                <div className={styles.grid}>
                    {loading && !hasPosts && Array.from({ length: 4 }).map((_, index) => (
                        <div key={`instagram-skeleton-${index}`} className={`${styles.imageWrapper} ${styles.skeleton}`} aria-hidden="true" />
                    ))}

                    {!loading && hasPosts && resolvedPosts.map((post, index) => (
                        <article key={post.id} className={styles.postCard}>
                            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className={styles.imageWrapper}>
                                <img
                                    src={post.imageUrl}
                                    alt={post.caption?.trim() || `Instagram post ${index + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                />
                                <span className={styles.postType}>{getPostBadge(post)}</span>
                                <div className={styles.captionOverlay}>
                                    <p className={styles.caption}>
                                        {post.caption?.trim() || 'No caption'}
                                    </p>
                                </div>
                            </a>
                        </article>
                    ))}

                    {!loading && !hasPosts && (
                        <div className={styles.emptyState}>
                            <p>Latest posts will appear here after the Instagram API token is configured.</p>
                            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                                Visit Instagram
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Instagram;
