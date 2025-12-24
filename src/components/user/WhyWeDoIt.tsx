import { useNode, Element } from "@craftjs/core";
import styles from '../WhyWeDoIt.module.css';
import { Text } from './Text';
import { SpacingControl } from "../editor/SpacingControl";
import { ColorControl } from "../editor/ColorControl";

export interface WhyWeDoItProps {
    padding?: string;
    margin?: string;
    background?: string;
}

export const WhyWeDoIt = ({ padding = "8rem 0", margin = "0px", background = "#1a1612" }: WhyWeDoItProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <section
            ref={(ref: any) => connect(drag(ref))}
            className={styles.section}
            style={{ padding, margin, backgroundColor: background }}
        >
            <div className="container">
                <div className={styles.content}>
                    <Element id="kicker" is={Text} text="Why We Do It" className={styles.kicker} tagName="span" />
                    <Element id="title" is={Text} text="Make learning a night out." className={styles.title} tagName="h2" />
                    <div className={styles.bodyText}>
                        <Element
                            id="body1"
                            is={Text}
                            text="A lot of us miss that campus vibe — hearing a great idea, debating it after, and leaving with something that sticks. Lectures After Dark brings that back, just in a bar: relaxed, social, and actually fun."
                            tagName="p"
                        />
                        <Element
                            id="body2"
                            is={Text}
                            text="It’s for people who want to keep learning without going back to school. For anyone who loves real conversation more than just another drink."
                            tagName="p"
                        />
                        <Element
                            id="body3"
                            is={Text}
                            text="And honestly? It’s a break from endless scrolling and fake “facts.” Real ideas, real speakers, real people — all in one room, and it’s a vibe."
                            tagName="p"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export const WhyWeDoItSettings = () => {
    const { actions: { setProp }, padding, margin, background } = useNode((node) => ({
        padding: node.data.props.padding,
        margin: node.data.props.margin,
        background: node.data.props.background,
    }));

    return (
        <div style={{ marginBottom: "10px" }}>
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

WhyWeDoIt.craft = {
    displayName: "Why We Do It",
    props: {
        padding: "8rem 0",
        margin: "0px",
        background: "#1a1612",
    },
    related: {
        settings: WhyWeDoItSettings,
    },
    rules: {
        canDrag: () => true,
    },
};
