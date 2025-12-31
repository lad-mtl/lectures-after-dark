
import { useNode } from '@craftjs/core';
import styles from './Instagram.module.css';
import { ImageUploadField } from './ImageUploadField';

interface InstagramPost {
    imageUrl: string;
    postUrl?: string;
}

interface InstagramProps {
    title?: string;
    handle?: string;
    posts?: InstagramPost[];
}

const defaultPosts: InstagramPost[] = [
    { imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', postUrl: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', postUrl: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', postUrl: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', postUrl: '' }
];

export const Instagram = ({
    title = "Follow us on Instagram",
    handle = "@lecturesafterdark",
    posts = defaultPosts
}: InstagramProps) => {
    const { connectors: { connect, drag } } = useNode();

    // Extract username from handle (remove @ if present) and create Instagram URL
    const username = handle.startsWith('@') ? handle.slice(1) : handle;
    const instagramUrl = `https://www.instagram.com/${username}`;

    return (
        <section
            ref={(ref: HTMLElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className={styles.section}
        >
            <div className="container">
                <h3 className={styles.title}>{title}</h3>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.handle}>{handle}</a>

                <div className={styles.grid}>
                    {posts.map((post, index) => (
                        <div key={index} className={styles.imageWrapper}>
                            {post.postUrl ? (
                                <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
                                    <img src={post.imageUrl} alt={`Instagram post ${index + 1}`} loading="lazy" decoding="async" />
                                </a>
                            ) : (
                                <img src={post.imageUrl} alt={`Instagram post ${index + 1}`} loading="lazy" decoding="async" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const InstagramSettings = () => {
    const { actions: { setProp }, title, handle, posts } = useNode((node) => ({
        title: node.data.props.title,
        handle: node.data.props.handle,
        posts: node.data.props.posts || defaultPosts,
    }));

    const updatePost = (index: number, field: 'imageUrl' | 'postUrl', value: string) => {
        setProp((props: InstagramProps) => {
            if (!props.posts) props.posts = [...defaultPosts];
            props.posts[index] = { ...props.posts[index], [field]: value };
        });
    };

    const addPost = () => {
        setProp((props: InstagramProps) => {
            if (!props.posts) props.posts = [...defaultPosts];
            props.posts.push({ imageUrl: '', postUrl: '' });
        });
    };

    const removePost = (index: number) => {
        setProp((props: InstagramProps) => {
            if (!props.posts) props.posts = [...defaultPosts];
            props.posts.splice(index, 1);
        });
    };

    const inputStyle = {
        width: '100%',
        padding: '8px 10px',
        fontSize: '14px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#475569',
    };

    const buttonStyle = {
        padding: '8px 12px',
        fontSize: '13px',
        fontWeight: 500,
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        background: '#3b82f6',
        color: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s',
    };

    const removeButtonStyle = {
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: 500,
        border: '1px solid #dc2626',
        borderRadius: '4px',
        background: '#fee2e2',
        color: '#dc2626',
        cursor: 'pointer',
        transition: 'all 0.2s',
    };

    return (
        <div>
            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: InstagramProps) => props.title = e.target.value)}
                    style={inputStyle}
                />
            </div>
            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Handle</label>
                <input
                    type="text"
                    value={handle || ''}
                    onChange={(e) => setProp((props: InstagramProps) => props.handle = e.target.value)}
                    style={inputStyle}
                    placeholder="@lecturesafterdark"
                />
            </div>

            <div style={{ marginBottom: '14px', borderTop: '1px solid #cbd5e1', paddingTop: '14px' }}>
                <label style={{ ...labelStyle, marginBottom: '10px' }}>Instagram Posts</label>

                {posts.map((post: InstagramPost, index: number) => (
                    <div key={index} style={{
                        marginBottom: '16px',
                        padding: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        background: '#f8fafc'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <strong style={{ fontSize: '13px', color: '#475569' }}>Post {index + 1}</strong>
                            {posts.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePost(index)}
                                    style={removeButtonStyle}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <ImageUploadField
                            label="Image"
                            value={post.imageUrl || ''}
                            onChange={(newUrl) => updatePost(index, 'imageUrl', newUrl)}
                        />

                        <div style={{ marginBottom: '0' }}>
                            <label style={labelStyle}>Instagram Post URL (optional)</label>
                            <input
                                type="text"
                                value={post.postUrl || ''}
                                onChange={(e) => updatePost(index, 'postUrl', e.target.value)}
                                style={inputStyle}
                                placeholder="https://www.instagram.com/p/..."
                            />
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addPost}
                    style={buttonStyle}
                >
                    + Add Post
                </button>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Instagram as any).craft = {
    props: {
        title: "Follow us on Instagram",
        handle: "@lecturesafterdark",
        posts: defaultPosts
    },
    related: {
        settings: InstagramSettings
    }
};

export default Instagram;
