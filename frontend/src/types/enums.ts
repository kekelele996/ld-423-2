export enum ChartType {
  Line = 'Line',
  Bar = 'Bar',
  Pie = 'Pie',
  Scatter = 'Scatter',
  Heatmap = 'Heatmap',
  Boxplot = 'Boxplot',
  Radar = 'Radar',
}

export enum DataType {
  Number = 'Number',
  String = 'String',
  Date = 'Date',
  Boolean = 'Boolean',
}

export enum FilterOperator {
  Equals = 'Equals',
  Contains = 'Contains',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
  Between = 'Between',
  In = 'In',
}

export enum ColorScheme {
  Default = 'Default',
  Pastel = 'Pastel',
  Vivid = 'Vivid',
  Monochrome = 'Monochrome',
  Scientific = 'Scientific',
}

export type ThemeMode = 'light' | 'dark';
