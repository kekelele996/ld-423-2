import assert from 'node:assert/strict';
import { DataType, FilterOperator } from './frontend/src/types/enums';
import type { ColumnDefinition, DatasetRow, Filter } from './frontend/src/types';
import { applyFilters } from './frontend/src/utils/filterUtils';

const columns: ColumnDefinition[] = [
  { name: 'day', type: DataType.Number },
  { name: 'temperature', type: DataType.Number },
  { name: 'od600', type: DataType.Number },
  { name: 'yield', type: DataType.Number },
  { name: 'group', type: DataType.String },
];

const baseData: DatasetRow[] = [
  { day: 1, temperature: 30, od600: 0.21, yield: 1.8, group: 'A' },
  { day: 2, temperature: 30, od600: 0.48, yield: 3.6, group: 'A' },
  { day: 3, temperature: 30, od600: 0.91, yield: 6.4, group: 'A' },
  { day: 4, temperature: 30, od600: 1.28, yield: 8.1, group: 'A' },
  { day: 1, temperature: 37, od600: 0.26, yield: 1.4, group: 'B' },
  { day: 2, temperature: 37, od600: 0.69, yield: 4.8, group: 'B' },
  { day: 3, temperature: 37, od600: 1.18, yield: 7.2, group: 'B' },
  { day: 4, temperature: 37, od600: 1.47, yield: 7.9, group: 'B' },
  { day: 5, temperature: 37, od600: null, yield: null, group: '' },
];

const datasetId = 'dataset-demo-growth';

const mkFilter = (partial: Partial<Filter> & { fieldName: string }): Filter => ({
  id: crypto.randomUUID(),
  datasetId,
  operator: FilterOperator.Equals,
  value: '',
  active: true,
  ...partial,
});

interface TestCase {
  name: string;
  filters: Filter[];
  expectedCount: number;
  expectedGroupValues?: string[];
}

const cases: TestCase[] = [
  {
    name: '空过滤器列表 => 返回全量数据',
    filters: [],
    expectedCount: 9,
  },
  {
    name: '过滤器 active=false => 不生效，返回全量',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: 'A', active: false })],
    expectedCount: 9,
  },
  {
    name: '分组 Equals A => 4 条 group=A',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: 'A' })],
    expectedCount: 4,
    expectedGroupValues: ['A', 'A', 'A', 'A'],
  },
  {
    name: '分组 Equals 忽略大小写 (值小写 a) => 仍匹配 4 条 A',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: 'a' })],
    expectedCount: 4,
  },
  {
    name: '分组 Contains "A" => 4 条 group=A',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Contains, value: 'A' })],
    expectedCount: 4,
  },
  {
    name: '数值 GreaterThan day>3 => day=4,5 共 3 条 (day5 od600 为 null 但 day 有效)',
    filters: [mkFilter({ fieldName: 'day', operator: FilterOperator.GreaterThan, value: '3' })],
    expectedCount: 3,
  },
  {
    name: '数值 LessThan od600<0.5 => 3 条 (0.21, 0.48, 0.26)',
    filters: [mkFilter({ fieldName: 'od600', operator: FilterOperator.LessThan, value: '0.5' })],
    expectedCount: 3,
  },
  {
    name: '数值 Between od600 [0.5, 1.0] => 0.69, 0.91 共 2 条',
    filters: [mkFilter({ fieldName: 'od600', operator: FilterOperator.Between, value: '0.5,1.0' })],
    expectedCount: 2,
  },
  {
    name: '分组 In A,B => 8 条（排除最后一条空字符串 group）',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.In, value: 'A,B' })],
    expectedCount: 8,
  },
  {
    name: '数值 In day [1,3] => day=1 与 day=3 共 4 条',
    filters: [mkFilter({ fieldName: 'day', operator: FilterOperator.In, value: '1,3' })],
    expectedCount: 4,
  },
  {
    name: '组合 AND：group=A 且 day>=2（GreaterThan 1） => 2,3,4 共 3 条',
    filters: [
      mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: 'A' }),
      mkFilter({ fieldName: 'day', operator: FilterOperator.GreaterThan, value: '1' }),
    ],
    expectedCount: 3,
  },
  {
    name: '空单元格不匹配：yield 列 Equals 任意数值会排除最后一条 yield=null',
    filters: [mkFilter({ fieldName: 'yield', operator: FilterOperator.GreaterThan, value: '0' })],
    expectedCount: 8,
  },
  {
    name: '分组 Equals 空字符串不应匹配到任何行 (空值/空串直接返回 false)',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: '' })],
    expectedCount: 0,
  },
  {
    name: 'Between 数值数组格式 [0.2, 0.5] => 3 条',
    filters: [mkFilter({ fieldName: 'od600', operator: FilterOperator.Between, value: [0.2, 0.5] })],
    expectedCount: 3,
  },
  {
    name: '数值 Equals temperature=37 数字类型 value => 5 条',
    filters: [mkFilter({ fieldName: 'temperature', operator: FilterOperator.Equals, value: 37 })],
    expectedCount: 5,
  },
];

let passed = 0;
let failed = 0;

for (const tc of cases) {
  try {
    const result = applyFilters(baseData, tc.filters, columns);
    assert.equal(result.length, tc.expectedCount, `${tc.name} 行数不匹配`);
    if (tc.expectedGroupValues) {
      assert.deepEqual(
        result.map((row) => row.group),
        tc.expectedGroupValues,
        `${tc.name} group 值不匹配`,
      );
    }
    console.log(`  ✓ ${tc.name}  (${result.length} 行)`);
    passed += 1;
  } catch (err) {
    console.error(`  ✗ ${tc.name}`);
    console.error(`    ${(err as Error).message}`);
    failed += 1;
  }
}

console.log(`\n总计: ${passed} 通过, ${failed} 失败`);
if (failed > 0) process.exit(1);
