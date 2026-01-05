/**
 * Universal Cleanup Script for Artifacts ($, £, €, ¥)
 * Removes common currency symbols that are often programming artifacts 
 * from text content across any website.
 */
(function() {
    // Define all common currency symbols you want to strip out
    const artifactsRegex = /[\$£€¥]/g;

    const sanitizeNode = (node) => {
        // Only modify actual text nodes to avoid corrupting HTML structure or attributes
        if (node.nodeType === Node.TEXT_NODE) {
            // Check if any artifact symbols are present before replacement
            if (artifactsRegex.test(node.textContent)) {
                node.textContent = node.textContent.replace(artifactsRegex, '');
            }
        } else {
            // Recursively check all child nodes for text content
            for (let child of node.childNodes) {
                sanitizeNode(child);
            }
        }
    };

    // 1. Perform an immediate cleanup of the currently loaded page content
    sanitizeNode(document.body);

    // 2. Set up a MutationObserver to automatically clean up content added dynamically
    // (e.g., from an API call that loads the translation after the page loads)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => sanitizeNode(node));
        });
    });

    // Start observing the body for any new child elements or changes in the subtree
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
