export const colors = {
  primary: {
    50:  '#E1F5EE',
    100: '#9FE1CB',
    200: '#5DCAA5',
    400: '#1D9E75',
    600: '#0F6E56',
    800: '#085041',
    900: '#04342C',
  },
  purple: {
    50:  '#EEEDFE',
    100: '#CECBF6',
    400: '#7F77DD',
    600: '#534AB7',
    800: '#3C3489',
  },
  amber: {
    50:  '#FAEEDA',
    100: '#FAC775',
    400: '#BA7517',
    600: '#854F0B',
    800: '#633806',
  },
  red: {
    50:  '#FCEBEB',
    400: '#E24B4A',
    600: '#A32D2D',
    800: '#791F1F',
  },
  gray: {
    50:  '#F8F8F6',
    100: '#F1EFE8',
    200: '#D3D1C7',
    400: '#888780',
    600: '#5F5E5A',
    800: '#2C2C2A',
    900: '#1A1A18',
  },
}

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
}

export const shadow = {
  card: '0 1px 3px rgba(0,0,0,0.06)',
  modal: '0 8px 32px rgba(0,0,0,0.12)',
}

export const typography = {
  display: "'DM Serif Display', serif",
  body: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
}

export type ColorKey = keyof typeof colors
export type ColorShade = 50 | 100 | 200 | 400 | 600 | 800 | 900
