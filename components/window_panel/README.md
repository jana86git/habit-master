# WindowPanel Component

A universal, reusable window-style panel component with a header bar and customizable action icons.

## Features

- Window-style UI with header bar
- Customizable title (auto-truncates at 16 characters)
- Flexible action icons with custom callbacks
- Optional onPress handler for the content area
- Consistent styling across the app

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `React.ReactNode` | Yes | - | Content to display in the panel |
| `title` | `string` | Yes | - | Title shown in the header bar |
| `actionIcons` | `ActionIcon[]` | No | `[]` | Array of action icons to display in the header |
| `style` | `ViewStyle` | No | - | Additional styles for the container |
| `onPress` | `() => void` | No | - | Optional press handler for the content area |
| `activeOpacity` | `number` | No | `0.7` | Opacity when content is pressed (if onPress is provided) |

## ActionIcon Interface

```typescript
interface ActionIcon {
    name: keyof typeof Ionicons.glyphMap;  // Ionicons icon name
    onPress: () => void;                    // Callback when icon is pressed
    color?: string;                         // Icon color (default: textOnPrimary)
    size?: number;                          // Icon size (default: 20)
}
```

## Usage Examples

### Basic Usage

```tsx
import WindowPanel from '@/components/window_panel/WindowPanel';

<WindowPanel title="My Panel">
    <Text>Panel content goes here</Text>
</WindowPanel>
```

### With Action Icons

```tsx
import WindowPanel, { ActionIcon } from '@/components/window_panel/WindowPanel';

const actionIcons: ActionIcon[] = [
    {
        name: 'create-outline',
        onPress: () => console.log('Edit pressed'),
        size: 20,
    },
    {
        name: 'trash-outline',
        onPress: () => console.log('Delete pressed'),
        size: 20,
    },
];

<WindowPanel title="Task Name" actionIcons={actionIcons}>
    <Text>Task details...</Text>
</WindowPanel>
```

### With Content Press Handler

```tsx
<WindowPanel 
    title="Clickable Panel"
    onPress={() => Alert.alert('Panel clicked!')}
    activeOpacity={0.8}
>
    <Text>Click anywhere on this content</Text>
</WindowPanel>
```

### With Custom Styling

```tsx
<WindowPanel 
    title="Custom Panel"
    style={{ marginBottom: 16 }}
    actionIcons={[
        {
            name: 'settings-outline',
            onPress: () => console.log('Settings'),
            color: colors.primary,
        }
    ]}
>
    <Text>Custom styled panel</Text>
</WindowPanel>
```

## Real-World Example (from tasks.tsx)

```tsx
const actionIcons: ActionIcon[] = [
    {
        name: 'create-outline',
        onPress: () => router.push({
            pathname: '/EditTask',
            params: { id: item.id }
        }),
        size: 20,
    },
    {
        name: 'trash-outline',
        onPress: () => handleDeleteTask(item.id),
        size: 20,
    },
];

<WindowPanel
    title={item.task_name}
    actionIcons={actionIcons}
    onPress={() => Alert.alert(item.task_name)}
>
    <Text style={styles.taskName}>{item.task_name}</Text>
    <Text style={styles.taskDetails}>
        Start: {new Date(item.start_date).toLocaleDateString()}
    </Text>
    {/* More content... */}
</WindowPanel>
```

## Styling

The component uses consistent styling from:
- `@/constants/colors` - Color palette
- `@/constants/fonts` - Typography

The window-style includes:
- 4px border with secondary color
- Shadow and elevation for depth
- 36px header bar with secondary background
- Responsive content area with 12px padding
