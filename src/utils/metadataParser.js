import ExifReader from 'exifreader';

const EDITING_SOFTWARE_KEYWORDS = [
  'photoshop',
  'picsart',
  'canva',
  'snapseed',
  'pixelmator',
  'gimp',
  'lightroom',
  'inshot',
  'kinemaster',
  'faceapp',
  'pixlr',
  'afterlight',
  'vsco'
];

export const parseImageMetadata = async (file) => {
  if (!file) {
    return {
      success: false,
      hasMetadata: false,
      findings: ['No file buffer provided.'],
      metadataRiskScore: 0,
      tags: {}
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    // ExifReader.load supports ArrayBuffer
    const tags = ExifReader.load(arrayBuffer, { expanded: true });

    const extracted = {
      software: null,
      deviceMake: null,
      deviceModel: null,
      dateTime: null,
      modifyDate: null,
      colorSpace: null,
      imageWidth: null,
      imageHeight: null,
      fileType: file.type || 'image/jpeg',
      fileSize: file.size,
      allTagsCount: 0
    };

    let totalTags = 0;
    const rawTags = {};

    if (tags.exif) {
      totalTags += Object.keys(tags.exif).length;
      Object.assign(rawTags, tags.exif);
      if (tags.exif.Software) extracted.software = tags.exif.Software.description;
      if (tags.exif.Make) extracted.deviceMake = tags.exif.Make.description;
      if (tags.exif.Model) extracted.deviceModel = tags.exif.Model.description;
      if (tags.exif.DateTimeOriginal) extracted.dateTime = tags.exif.DateTimeOriginal.description;
      if (tags.exif.ColorSpace) extracted.colorSpace = tags.exif.ColorSpace.description;
    }

    if (tags.xmp) {
      totalTags += Object.keys(tags.xmp).length;
      Object.assign(rawTags, tags.xmp);
      if (!extracted.software && tags.xmp.CreatorTool) {
        extracted.software = tags.xmp.CreatorTool.description;
      }
      if (!extracted.modifyDate && tags.xmp.ModifyDate) {
        extracted.modifyDate = tags.xmp.ModifyDate.description;
      }
    }

    if (tags.file) {
      if (tags.file['Image Width']) extracted.imageWidth = tags.file['Image Width'].description;
      if (tags.file['Image Height']) extracted.imageHeight = tags.file['Image Height'].description;
      if (tags.file['Color Space']) extracted.colorSpace = tags.file['Color Space'].description;
    }

    extracted.allTagsCount = totalTags;

    // Analyze metadata for risk indicators
    let metadataRiskScore = 0;
    const findings = [];
    let isEditingSoftwareDetected = false;

    if (extracted.software) {
      const lowerSoft = extracted.software.toLowerCase();
      const detectedEditor = EDITING_SOFTWARE_KEYWORDS.find(keyword => lowerSoft.includes(keyword));

      if (detectedEditor) {
        isEditingSoftwareDetected = true;
        metadataRiskScore += 65;
        findings.push(`Editing software signature detected in metadata: "${extracted.software}".`);
      } else {
        findings.push(`Creator tool reported: "${extracted.software}".`);
      }
    }

    if (totalTags === 0) {
      findings.push('Metadata is absent or stripped. Note: Messaging platforms (WhatsApp, Telegram) routinely strip metadata.');
    } else {
      findings.push(`Identified ${totalTags} embedded metadata tags.`);
      if (extracted.deviceModel) {
        findings.push(`Device model signature: ${extracted.deviceMake || ''} ${extracted.deviceModel}.`.trim());
      }
    }

    return {
      success: true,
      hasMetadata: totalTags > 0,
      metadataRiskScore: Math.min(100, metadataRiskScore),
      isEditingSoftwareDetected,
      software: extracted.software || 'Not specified',
      device: extracted.deviceModel ? `${extracted.deviceMake || ''} ${extracted.deviceModel}`.trim() : 'Unknown device',
      dateTime: extracted.dateTime || extracted.modifyDate || 'Unavailable',
      colorSpace: extracted.colorSpace || 'Standard sRGB',
      dimensions: extracted.imageWidth && extracted.imageHeight ? `${extracted.imageWidth} × ${extracted.imageHeight} px` : null,
      findings,
      rawTagCount: totalTags
    };
  } catch (err) {
    // ExifReader throws if no EXIF/metadata header is present (standard for many screenshots and PNGs)
    return {
      success: true,
      hasMetadata: false,
      metadataRiskScore: 0,
      isEditingSoftwareDetected: false,
      software: 'None detected',
      device: 'Unknown',
      dateTime: 'Unavailable',
      colorSpace: 'Standard sRGB',
      dimensions: null,
      findings: [
        'No EXIF metadata found in image container.',
        'Note: Missing metadata alone is not evidence of manipulation.'
      ],
      rawTagCount: 0
    };
  }
};
