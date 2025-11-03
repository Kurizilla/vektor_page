export type Tokens = {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    muted: string;
  };
  fontFamily: {
    sans: string;
  };
  radius: {
    base: string;
  };
};

export type CssVars = Record<`--${string}`, string>;

export function tokensToCssVars(tokens: Tokens): CssVars {
  const vars: CssVars = {
    '--color-background': tokens.colors.background,
    '--color-foreground': tokens.colors.foreground,
    '--color-primary': tokens.colors.primary,
    '--color-secondary': tokens.colors.secondary,
    '--color-muted': tokens.colors.muted,
    '--font-sans': tokens.fontFamily.sans,
    '--radius-base': tokens.radius.base
  };
  return vars;
}

export type SiteThemeOverrides = {
  siteName?: string;
  logoUrl?: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  background?: string | null;
  foreground?: string | null;
};

export function applyOverridesToVars(baseVars: CssVars, overrides: SiteThemeOverrides): CssVars {
  const vars: CssVars = { ...baseVars };
  if (overrides.primaryColor) vars['--color-primary'] = overrides.primaryColor;
  if (overrides.secondaryColor) vars['--color-secondary'] = overrides.secondaryColor;
  if (overrides.background) vars['--color-background'] = overrides.background;
  if (overrides.foreground) vars['--color-foreground'] = overrides.foreground;
  return vars;
}


