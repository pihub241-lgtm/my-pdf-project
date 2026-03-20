function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image.'));
    };

    image.src = url;
  });
}

function canvasToBlob(canvas, mimeType, quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate output file.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

function buildIcoBlobFromPng(pngBlob, size) {
  return pngBlob.arrayBuffer().then((arrayBuffer) => {
    const pngBytes = new Uint8Array(arrayBuffer);
    const headerSize = 6;
    const dirEntrySize = 16;
    const offset = headerSize + dirEntrySize;

    const buffer = new ArrayBuffer(offset + pngBytes.length);
    const view = new DataView(buffer);
    const out = new Uint8Array(buffer);

    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, 1, true);

    out[6] = size === 256 ? 0 : size;
    out[7] = size === 256 ? 0 : size;
    out[8] = 0;
    out[9] = 0;
    view.setUint16(10, 1, true);
    view.setUint16(12, 32, true);
    view.setUint32(14, pngBytes.length, true);
    view.setUint32(18, offset, true);

    out.set(pngBytes, offset);

    return new Blob([buffer], { type: 'image/x-icon' });
  });
}

export async function convertImageFile(file, toolId, options = {}) {
  const image = await fileToImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas not supported by browser.');
  }

  const baseName = file.name.replace(/\.[^.]+$/, '');

  if (toolId === 'png-to-jpg') {
    const quality = Number(options.quality ?? 0.92);
    const backgroundColor = options.backgroundColor || '#ffffff';

    canvas.width = image.width;
    canvas.height = image.height;

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    return { blob, filename: `${baseName}.jpg` };
  }

  if (toolId === 'jpg-to-png') {
    canvas.width = image.width;
    canvas.height = image.height;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const blob = await canvasToBlob(canvas, 'image/png', 1);
    return { blob, filename: `${baseName}.png` };
  }

  if (toolId === 'png-to-ico') {
    const size = Number(options.icoSize) === 32 ? 32 : 256;

    canvas.width = size;
    canvas.height = size;

    context.clearRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);

    const pngBlob = await canvasToBlob(canvas, 'image/png', 1);
    const icoBlob = await buildIcoBlobFromPng(pngBlob, size);

    return { blob: icoBlob, filename: `${baseName}.ico` };
  }

  throw new Error(`Unsupported tool: ${toolId}`);
}
