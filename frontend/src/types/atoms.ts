export type IconEnum = {
    iconName: 'Menu' | 'Settings' | 'User' | 'Tasks' |
    'List' | 'History' | 'Home' | 'Plus' |
    'Edit' | 'Trash' | 'Execute' | 'Upload';
}

export type ActionsType = {
    title: string;
    onClick: (id: number) => void;
    className: string;
    size: number;
  } & IconEnum