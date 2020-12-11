import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
export default function Component() {
    const theme = useTheme();
    return (React.createElement(Container, null,
        React.createElement("div", { style: {
                backgroundColor: theme.palette.background.paper,
                padding: "2%",
                borderRadius: "15px",
            } },
            React.createElement("div", null, "VOICE PANEL 3"))));
}
//# sourceMappingURL=VoicePanel.js.map