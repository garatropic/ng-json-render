import { type JrRegistry, defineRegistry } from '@ng-json-render/core';
import { JrBadge } from './content/jr-badge';
import { JrHeading } from './content/jr-heading';
import { JrStat } from './content/jr-stat';
import { JrText } from './content/jr-text';
import { JrBarChart } from './data/jr-bar-chart';
import { JrLineChart } from './data/jr-line-chart';
import { JrTable } from './data/jr-table';
import { JrAlert } from './feedback/jr-alert';
import { JrProgress } from './feedback/jr-progress';
import { JrButton } from './forms/jr-button';
import { JrCheckbox } from './forms/jr-checkbox';
import { JrInput } from './forms/jr-input';
import { JrSelect } from './forms/jr-select';
import { JrSwitch } from './forms/jr-switch';
import { JrTextarea } from './forms/jr-textarea';
import { JrCard } from './layout/jr-card';
import { JrContainer } from './layout/jr-container';
import { JrDivider } from './layout/jr-divider';
import { JrGrid } from './layout/jr-grid';
import { JrStack } from './layout/jr-stack';

/**
 * Registry of all built-in primitive components, keyed by catalog `type`.
 * Pass to `<jr-renderer [registry]="primitivesRegistry">` or
 * `provideJsonRender({ registry: primitivesRegistry })`.
 */
export const primitivesRegistry: JrRegistry = defineRegistry({
  // layout
  Container: JrContainer,
  Stack: JrStack,
  Grid: JrGrid,
  Card: JrCard,
  Divider: JrDivider,
  // content
  Heading: JrHeading,
  Text: JrText,
  Badge: JrBadge,
  Stat: JrStat,
  // feedback
  Alert: JrAlert,
  Progress: JrProgress,
  // data
  Table: JrTable,
  BarChart: JrBarChart,
  LineChart: JrLineChart,
  // forms
  Input: JrInput,
  Textarea: JrTextarea,
  Select: JrSelect,
  Checkbox: JrCheckbox,
  Switch: JrSwitch,
  Button: JrButton,
});
