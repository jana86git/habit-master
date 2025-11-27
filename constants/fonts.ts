// Font family constants for easy usage throughout the app
export const fonts = {
    regular: 'SpaceMono-Regular',
    bold: 'SpaceMono-Bold',
    italic: 'SpaceMono-Italic',
    boldItalic: 'SpaceMono-BoldItalic',
};

// Helper function to get font family based on weight and style
export const getFontFamily = (weight: 'regular' | 'bold' = 'regular', italic: boolean = false): string => {
    if (weight === 'bold' && italic) return fonts.boldItalic;
    if (weight === 'bold') return fonts.bold;
    if (italic) return fonts.italic;
    return fonts.regular;
};
