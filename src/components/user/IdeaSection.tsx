import { useNode, Element } from "@craftjs/core";
import { Check } from 'lucide-react';
import styles from '../IdeaSection.module.css';
import { Text } from './Text';
import { Image } from './Image';
import { ColorControl } from "../editor/ColorControl";
import { SpacingControl } from "../editor/SpacingControl";

export const IdeaSection = ({ background = "#1a1612", padding = "4rem 0", margin = "0px" }) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <section
            ref={(ref: any) => connect(drag(ref))}
            id="about"
            className={styles.section}
            style={{ backgroundColor: background, padding, margin }}
        >
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.content}>
                        <Element id="title" is={Text} text="The Idea" tagName="h2" />

                        <Element
                            id="desc1"
                            is={Text}
                            text="Lectures After Dark is a growing movement of intellectual social events that combine academic learning settings with the social experience of a bar."
                            tagName="p"
                        />

                        <Element
                            id="desc2"
                            is={Text}
                            text="Our events are designed to be accessible to everyone while still offering deep insights. Curiosity is the only requirement."
                            tagName="p"
                        />

                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <span className={styles.check}><Check size={14} /></span>
                                <Element id="item1" is={Text} text="Fun and Engaging Speakers" tagName="span" />
                            </li>
                            <li className={styles.listItem}>
                                <span className={styles.check}><Check size={14} /></span>
                                <Element id="item2" is={Text} text="Professors and Industry Leaders" tagName="span" />
                            </li>
                            <li className={styles.listItem}>
                                <span className={styles.check}><Check size={14} /></span>
                                <Element id="item3" is={Text} text="Education and Entertainment" tagName="span" />
                            </li>
                        </ul>
                    </div>

                    <div className={styles.imageWrapper}>
                        <Element
                            id="idea-image"
                            is={Image}
                            alt="Cocktails and Conversation"
                            width="100%"
                            height="auto"
                            className={styles.image}
                            boxShadow="20px 20px 0 rgba(26, 22, 18, 0.5)"
                            borderRadius="4px"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export const IdeaSectionSettings = () => {
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
};

IdeaSection.craft = {
    displayName: "Idea Section",
    props: {
        background: "#1a1612",
        padding: "4rem 0",
        margin: "0px",
    },
    related: {
        settings: IdeaSectionSettings,
    },
    rules: {
        canDrag: () => true,
    },
};
