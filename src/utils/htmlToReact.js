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
            if (node.type === 'tag' && node.name === 'table') {
                node.attribs = {
                    ...node.attribs,
                    tabindex: '0',
                    'aria-label': node.attribs && node.attribs['aria-label'] ? node.attribs['aria-label'] : 'Scrollable data table'
                };
            }
        }
    });
};
