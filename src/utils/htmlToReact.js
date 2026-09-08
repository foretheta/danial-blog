import React from 'react';
import parse from 'html-react-parser';

export default function(html) {
    if (!html) {
        return null;
    }
    return parse(html, {
        replace: (node) => {
            if (node.type === 'script') {
                return <React.Fragment/>;
            }
        }
    });
};
