import assert from 'node:assert/strict';
import { DataType, FilterOperator } from './frontend/src/types/enums';
import type { ColumnDefinition, DatasetRow, Filter } from './frontend/src/types';
import { applyFilters, isFilterValid, normalizeFilterValue } from './frontend/src/utils/filterUtils';

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
    name: '分组 Equals 空字符串 => 条件无效被忽略，返回全量 (新行为：未填完整的条件不参与过滤)',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: '' })],
    expectedCount: 9,
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
  // ============== 新增筛选器 & 空值条件 相关用例 ==============
  {
    name: '新增筛选器默认状态 (active=false, value=\'\') => 全量数据',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: '', active: false })],
    expectedCount: 9,
  },
  {
    name: 'active=true 但 value 为空字符串 => 无效条件被忽略，返回全量',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: '', active: true })],
    expectedCount: 9,
  },
  {
    name: 'active=true 但 Between 只填了最小值 (缺最大值) => 无效，返回全量',
    filters: [mkFilter({ fieldName: 'od600', operator: FilterOperator.Between, value: '0.5', active: true })],
    expectedCount: 9,
  },
  {
    name: 'active=true 但 In 为空字符串 => 无效，返回全量',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.In, value: '', active: true })],
    expectedCount: 9,
  },
  {
    name: 'active=true 但 In 为空数组 => 无效，返回全量',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.In, value: [], active: true })],
    expectedCount: 9,
  },
  {
    name: 'active=true 且 value=null => 无效，返回全量',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: null as unknown as string, active: true })],
    expectedCount: 9,
  },
  {
    name: '组合场景：2 条 active，其中 1 条 value 为空（无效） => 只有有效条件生效',
    filters: [
      mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: 'A', active: true }),
      mkFilter({ fieldName: 'day', operator: FilterOperator.GreaterThan, value: '', active: true }),
    ],
    expectedCount: 4,
  },
  {
    name: '先空后填：模拟用户从空值输入 \'A\' => 填写值后条件生效，过滤到 4 条',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: 'A', active: true })],
    expectedCount: 4,
  },
  {
    name: '先有后清：模拟用户将 \'A\' 清空 => 条件变无效，返回全量',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: '', active: true })],
    expectedCount: 9,
  },
  {
    name: '勾选 active=false 手动取消 => 返回全量 (即使 value 已填)',
    filters: [mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: 'A', active: false })],
    expectedCount: 9,
  },
];

let passed = 0;
let failed = 0;

// ============== isFilterValid 单元测试 ==============
const validityCases: Array<{ name: string; filter: Filter; expected: boolean }> = [
  { name: '空字符串 value => 无效', filter: mkFilter({ fieldName: 'group', value: '' }), expected: false },
  { name: '全空格 value => 无效', filter: mkFilter({ fieldName: 'group', value: '   ' }), expected: false },
  { name: 'null value => 无效', filter: mkFilter({ fieldName: 'group', value: null as unknown as string }), expected: false },
  { name: '空数组 value => 无效', filter: mkFilter({ fieldName: 'group', operator: FilterOperator.In, value: [] }), expected: false },
  { name: 'Between 只填一个值 => 无效', filter: mkFilter({ fieldName: 'day', operator: FilterOperator.Between, value: '1' }), expected: false },
  { name: 'Between 两个有效值 => 有效', filter: mkFilter({ fieldName: 'day', operator: FilterOperator.Between, value: '1,3' }), expected: true },
  { name: 'In 逗号分隔有效值 => 有效', filter: mkFilter({ fieldName: 'group', operator: FilterOperator.In, value: 'A,B' }), expected: true },
  { name: '普通文本 Equals 有值 => 有效', filter: mkFilter({ fieldName: 'group', value: 'A' }), expected: true },
  { name: '数值 GreaterThan 有值 => 有效', filter: mkFilter({ fieldName: 'day', operator: FilterOperator.GreaterThan, value: '2' }), expected: true },
];

for (const vc of validityCases) {
  try {
    assert.equal(isFilterValid(vc.filter), vc.expected);
    console.log(`  ✓ [isFilterValid] ${vc.name}`);
    passed += 1;
  } catch (err) {
    console.error(`  ✗ [isFilterValid] ${vc.name}`);
    console.error(`    ${(err as Error).message}`);
    failed += 1;
  }
}

// ============== normalizeFilterValue 单元测试 ==============
const columnTypeMap = new Map(columns.map((c) => [c.name, c.type]));

interface NormalizeCase {
  name: string;
  filter: Filter;
  columnType: DataType | undefined;
  expectedValue: string;
  expectedActive: boolean;
}

const normalizeCases: NormalizeCase[] = [
  {
    name: '切换字段：文本值 "A" 切到数值列 day => 清空并禁用',
    filter: mkFilter({ fieldName: 'day', operator: FilterOperator.Equals, value: 'A', active: true }),
    columnType: DataType.Number,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '切换字段：数值 "3" 切到文本列 group => 保留（数值可当文本）',
    filter: mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: '3', active: true }),
    columnType: DataType.String,
    expectedValue: '3',
    expectedActive: true,
  },
  {
    name: '切换字段：文本值 "A" 切到数值列 + GreaterThan => 清空并禁用',
    filter: mkFilter({ fieldName: 'day', operator: FilterOperator.GreaterThan, value: 'A', active: true }),
    columnType: DataType.Number,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '切换字段：文本值 "A" 切到数值列 + Between => 清空并禁用',
    filter: mkFilter({ fieldName: 'od600', operator: FilterOperator.Between, value: 'A,B', active: true }),
    columnType: DataType.Number,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '切换字段：文本值 "A,B" 切到数值列 + In (含非数值项) => 清空并禁用',
    filter: mkFilter({ fieldName: 'day', operator: FilterOperator.In, value: 'A,B', active: true }),
    columnType: DataType.Number,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '切换操作符：Equals→Between，单值 "3" => 清空并禁用（Between 需两个值）',
    filter: mkFilter({ fieldName: 'day', operator: FilterOperator.Between, value: '3', active: true }),
    columnType: DataType.Number,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '切换操作符：Equals→Between，有效范围 "1,4" => 保留',
    filter: mkFilter({ fieldName: 'day', operator: FilterOperator.Between, value: '1,4', active: true }),
    columnType: DataType.Number,
    expectedValue: '1,4',
    expectedActive: true,
  },
  {
    name: '切换操作符：Equals→Contains（数值列）=> 清空并禁用（Contains 不适用于数值列）',
    filter: mkFilter({ fieldName: 'day', operator: FilterOperator.Contains, value: '3', active: true }),
    columnType: DataType.Number,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '切换操作符：Equals→GreaterThan（文本列）=> 清空并禁用',
    filter: mkFilter({ fieldName: 'group', operator: FilterOperator.GreaterThan, value: 'A', active: true }),
    columnType: DataType.String,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '切换操作符：Equals→LessThan（文本列）=> 清空并禁用',
    filter: mkFilter({ fieldName: 'group', operator: FilterOperator.LessThan, value: 'A', active: true }),
    columnType: DataType.String,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '切换操作符：Equals→Between（文本列）=> 清空并禁用',
    filter: mkFilter({ fieldName: 'group', operator: FilterOperator.Between, value: 'A', active: true }),
    columnType: DataType.String,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '兼容保留：数值列 Equals "3" 切到同列 GreaterThan => 保留（同类型数值兼容）',
    filter: mkFilter({ fieldName: 'day', operator: FilterOperator.GreaterThan, value: '3', active: true }),
    columnType: DataType.Number,
    expectedValue: '3',
    expectedActive: true,
  },
  {
    name: '兼容保留：文本列 Contains "A" 切到同列 Equals => 保留',
    filter: mkFilter({ fieldName: 'group', operator: FilterOperator.Equals, value: 'A', active: true }),
    columnType: DataType.String,
    expectedValue: 'A',
    expectedActive: true,
  },
  {
    name: '兼容保留：数值列 In "1,3" 切到同列 Equals => 清空（In 格式不兼容 Equals 单值）',
    filter: mkFilter({ fieldName: 'day', operator: FilterOperator.Equals, value: '1,3', active: true }),
    columnType: DataType.Number,
    expectedValue: '',
    expectedActive: false,
  },
  {
    name: '数值列 In 纯数值 "1,3" => 保留',
    filter: mkFilter({ fieldName: 'day', operator: FilterOperator.In, value: '1,3', active: true }),
    columnType: DataType.Number,
    expectedValue: '1,3',
    expectedActive: true,
  },
];

for (const nc of normalizeCases) {
  try {
    const result = normalizeFilterValue(nc.filter, nc.columnType);
    assert.equal(result.value, nc.expectedValue, `${nc.name} value 不匹配`);
    assert.equal(result.active, nc.expectedActive, `${nc.name} active 不匹配`);
    console.log(`  ✓ [normalizeFilterValue] ${nc.name}`);
    passed += 1;
  } catch (err) {
    console.error(`  ✗ [normalizeFilterValue] ${nc.name}`);
    console.error(`    ${(err as Error).message}`);
    failed += 1;
  }
}

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
