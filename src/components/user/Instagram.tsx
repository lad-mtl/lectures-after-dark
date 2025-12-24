import { useNode, Element } from "@craftjs/core";
import styles from './Instagram.module.css';
import { Text } from './Text';
import { Image } from './Image';
import { ColorControl } from "../editor/ColorControl";
import { SpacingControl } from "../editor/SpacingControl";

export const Instagram = ({ background = "#120f0c", padding = "4rem 0", margin = "0px" }) => {
    const { connectors: { connect, drag } } = useNode();

    const defaultImages = [
        'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1551843073-4a9a5b6fcd5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
    ];

    return (
        <section
            ref={(ref: any) => connect(drag(ref))}
            className={styles.section}
            style={{ backgroundColor: background, padding, margin }}
        >
            <div className="container">
                <Element
                    id="title"
                    is={Text}
                    text="Follow us on Instagram"
                    tagName="h3"
                    className={styles.title}
                    fontFamily="var(--font-headline)"
                    fontSize="1.5rem"
                    color="var(--cream)"
                    margin="0 0 0.5rem 0"
                />
                <Element
                    id="handle"
                    is={Text}
                    text="@lecturesafterdark"
                    tagName="a"
                    className={styles.handle}
                    fontFamily="var(--font-body)"
                    fontSize="0.9rem"
                    color="var(--text-secondary)"
                    margin="0 0 2rem 0"
                />

                <div className={styles.grid}>
                    {defaultImages.map((src, index) => (
                        <div key={index} className={styles.imageWrapper}>
                            <Element
                                id={`instagram-image-${index}`}
                                is={Image}
                                src={src}
                                alt={`Instagram post ${index + 1}`}
                                width="100%"
                                height="100%"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const InstagramSettings = () => {
    const { actions: { setProp }, background, padding, margin } = useNode((node) => ({
        background: node.data.props.background,
        padding: node.data.props.padding,
        margin: node.data.props.margin,
    }));

    return (
        <div>
            <ColorControl
                label="Background"
                value={background}
                onChange={(color) => setProp((props: any) => props.background = color)}
            />
            <SpacingControl
                margin={margin}
                padding={padding}
                setProp={setProp}
            />
        </div>
    );
}

Instagram.craft = {
    displayName: "Instagram",
    props: {
        background: "#120f0c",
        padding: "4rem 0",
        margin: "0px",
    },
    related: {
        settings: InstagramSettings,
    },
    rules: {
        canDrag: () => true,
    },
};
