// Centralized color palette for the project

const colors = {
  // Custom project colors
  headerBg: '#ff4e59',
  footerBg: '#f5f5f5',
  mainBg: '#f9f9f9',
  bannerBg: '#f2e3e3',

  // MUI default palette (v5)
  primary: {
    main: '#ff4e59',
    dark: '#87070f',
    light: '#ffa660',
    contrastText: '#fff',
    outlinedBorder: '#432a2c'
  },
  secondary: {
    main: '#ffa660',
    dark: '#e48236',
    light: '#fbc79f',
    contrastText: '#fff'
  },
  error: {
    main: '#d32f2f',
    contrastText: '#fff'
  },
  success: {
    main: '#2e7d32',
    contrastText: '#fff'
  },
  warning: {
    main: '#ed6c02',
    contrastText: '#fff'
  },
  info: {
    main: '#0288d1',
    contrastText: '#fff'
  },
  text: {
    primary: 'rgba(0,0,0,0.87)',
    secondary: 'rgba(0,0,0,0.6)',
    disabled: 'rgba(0,0,0,0.38)'
  },
  button: {
    // Primary button variants
    primaryContained: '#ff4e59',
    primaryContainedHover: '#e63f49',
    primaryOutlined: '#ff4e59',
    primaryOutlinedHover: 'rgba(255, 78, 89, 0.04)',
    primaryText: '#ff4e59',
    primaryTextHover: 'rgba(255, 78, 89, 0.04)',
    // Secondary button variants
    secondaryContained: '#9c27b0',
    secondaryContainedHover: '#7b1fa2',
    secondaryOutlined: '#9c27b0',
    secondaryOutlinedHover: 'rgba(156, 39, 176, 0.04)',
    // Disabled state
    disabled: 'rgba(0,0,0,0.12)',
    disabledText: 'rgba(0,0,0,0.26)'
  },
};

export default colors;
