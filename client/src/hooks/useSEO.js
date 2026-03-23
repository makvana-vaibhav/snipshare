import { useEffect } from 'react';

export default function useSEO(title, description) {
    useEffect(() => {
        document.title = title;
        // Dynamically locate and patch the meta description element naturally mounted in index.html
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = description;
    }, [title, description]);
}
