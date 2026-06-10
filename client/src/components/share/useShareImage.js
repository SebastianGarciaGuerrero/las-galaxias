import { useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';

// Hook compartido: captura un nodo como PNG, lo copia al portapapeles
// y si no se puede, lo descarga como archivo.
export const useShareImage = (filename = 'las-galaxias') => {
    const cardRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle | working | copied | downloaded | error

    const captureOptions = {
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: '#0a0a0a',
    };

    const downloadBlob = (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename.toLowerCase().replace(/\s+/g, '-')}.png`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const share = async () => {
        if (!cardRef.current || status === 'working') return;
        setStatus('working');
        try {
            // Doble captura: la primera fuerza la carga de fuentes e imágenes,
            // la segunda sale limpia.
            await toPng(cardRef.current, captureOptions);
            const blob = await toBlob(cardRef.current, captureOptions);
            if (!blob) throw new Error('No se pudo generar la imagen');

            if (navigator.clipboard && window.ClipboardItem) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob }),
                ]);
                setStatus('copied');
            } else {
                downloadBlob(blob);
                setStatus('downloaded');
            }
        } catch (err) {
            console.error('Error generando la imagen:', err);
            try {
                const blob = await toBlob(cardRef.current, captureOptions);
                if (blob) {
                    downloadBlob(blob);
                    setStatus('downloaded');
                    return;
                }
            } catch { /* sin respaldo */ }
            setStatus('error');
        } finally {
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return { cardRef, status, share };
};
