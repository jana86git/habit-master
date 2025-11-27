# Custom Fonts Setup

## Overview
This app uses **SpaceMono** fonts loaded from the `assets/fonts` directory. The fonts are loaded globally in `app/_layout.tsx` and are available throughout the entire application.

## Available Fonts
- **SpaceMono-Regular** - Regular weight, normal style
- **SpaceMono-Bold** - Bold weight, normal style
- **SpaceMono-Italic** - Regular weight, italic style
- **SpaceMono-BoldItalic** - Bold weight, italic style

## How to Use

### Method 1: Using the fonts constants (Recommended)
Import the fonts from `constants/fonts.ts`:

```typescript
import { fonts } from '@/constants/fonts';

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  boldText: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  italicText: {
    fontFamily: fonts.italic,
    fontSize: 16,
  },
});
```

### Method 2: Using the helper function
For dynamic font selection:

```typescript
import { getFontFamily } from '@/constants/fonts';

const styles = StyleSheet.create({
  dynamicText: {
    fontFamily: getFontFamily('bold', true), // Bold + Italic
    fontSize: 16,
  },
});
```

### Method 3: Direct string reference
You can also use the font family names directly:

```typescript
const styles = StyleSheet.create({
  text: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 16,
  },
});
```

## Example Component

```typescript
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { fonts } from '@/constants/fonts';

export default function MyComponent() {
  return (
    <>
      <Text style={styles.regular}>Regular Text</Text>
      <Text style={styles.bold}>Bold Text</Text>
      <Text style={styles.italic}>Italic Text</Text>
      <Text style={styles.boldItalic}>Bold Italic Text</Text>
    </>
  );
}

const styles = StyleSheet.create({
  regular: {
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  bold: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  italic: {
    fontFamily: fonts.italic,
    fontSize: 16,
  },
  boldItalic: {
    fontFamily: fonts.boldItalic,
    fontSize: 16,
  },
});
```

## Important Notes

1. **Font Loading**: Fonts are loaded asynchronously in `_layout.tsx`. A loading screen is shown while fonts are being loaded.

2. **No fontWeight with custom fonts**: When using custom fonts, avoid using the `fontWeight` style property. Instead, use the appropriate font family (e.g., `fonts.bold` instead of `fontWeight: 'bold'`).

3. **Adding new fonts**: To add new fonts:
   - Place the `.ttf` or `.otf` files in `assets/fonts/`
   - Add them to the `useFonts` hook in `app/_layout.tsx`
   - Update `constants/fonts.ts` with the new font names

## Files Modified
- `app/_layout.tsx` - Font loading logic
- `constants/fonts.ts` - Font constants and helper functions
- `components/home_page_components/styles.ts` - Example usage
