import React from 'react';
import ReactHtmlParser from 'react-html-parser';

export default function(html) {
    if (!html) {
        return null;
    }
    return ReactHtmlParser(html, {
        transform: (node, index) => {
            if (node.type === 'script') {
                return <React.Fragment key={index}/>;
            }
        }
    });
};
