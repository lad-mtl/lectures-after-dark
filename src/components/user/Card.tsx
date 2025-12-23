import { Text } from "./Text";
import { Button } from "./Button";
import { Container } from "./Container";
import { Element, useNode } from "@craftjs/core";

export interface CardProps {
    background?: string;
    padding?: number;
}

export const Card = ({ background, padding = 20 }: CardProps) => {
    useNode();

    return (
        <Container background={background} padding={padding}>
            <Element id="text" is="div" canvas className="text-only">
                <Text text="Title" fontSize={20} />
                <Text text="Subtitle" fontSize={15} />
            </Element>
            <Element id="buttons" is="div" canvas className="buttons-only">
                <Button size="small" text="Learn more" variant="contained" color="primary" />
            </Element>
        </Container>
    );
};

Card.craft = {
    displayName: "Card",
    props: {
        background: "#ffffff",
        padding: 20
    },
    rules: {
        canDrag: () => true,
    }
}
