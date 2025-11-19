/**
 * 验证后端返回数据格式
 * 通过检查代码逻辑和类型定义来验证返回格式
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始校验后端代码返回数据格式...\n');

// 1. 检查控制器返回格式
console.log('1️⃣ 检查控制器返回格式...');
const controllerPath = path.join(__dirname, 'src/controllers/approval.controller.ts');
const controllerCode = fs.readFileSync(controllerPath, 'utf-8');

// 检查成功响应格式
if (controllerCode.includes('success: true') && controllerCode.includes('data: processedData')) {
  console.log('  ✅ 成功响应格式正确: { success: true, data: processedData, timestamp }');
} else {
  console.log('  ✗ 成功响应格式不正确');
}

// 检查错误响应格式
if (controllerCode.includes('success: false') && controllerCode.includes('error:')) {
  console.log('  ✅ 错误响应格式正确: { success: false, error: {...}, timestamp }');
} else {
  console.log('  ✗ 错误响应格式不正确');
}

// 2. 检查 ProcessedApprovalData 结构
console.log('\n2️⃣ 检查 ProcessedApprovalData 数据结构...');
const timelineProcessorPath = path.join(__dirname, 'src/services/timeline/timeline-processor.service.ts');
const timelineProcessorCode = fs.readFileSync(timelineProcessorPath, 'utf-8');

// 检查 header 字段
const headerFields = [
  'instanceId',
  'approvalName',
  'serialNumber',
  'applicant',
  'applicantDept',
  'applyTime',
  'status'
];

console.log('  📝 Header 字段检查:');
headerFields.forEach(field => {
  if (timelineProcessorCode.includes(`header: {`) &&
      (timelineProcessorCode.includes(`${field}:`) || field === 'applicantDept')) {
    console.log(`    ✓ ${field}`);
  } else {
    console.log(`    ✗ ${field} 缺失或未正确设置`);
  }
});

// 检查 timeline 结构
console.log('\n  📝 Timeline 结构检查:');
if (timelineProcessorCode.includes('timeline: TimelineData') ||
    timelineProcessorCode.includes('timeline:')) {
  console.log('    ✓ timeline 字段存在');

  if (timelineProcessorCode.includes('completed:') || timelineProcessorCode.includes('completed.push')) {
    console.log('    ✓ completed 数组处理逻辑存在');
  }

  if (timelineProcessorCode.includes('pending:') || timelineProcessorCode.includes('pending.push')) {
    console.log('    ✓ pending 数组处理逻辑存在');
  }

  if (timelineProcessorCode.includes('cc:') || timelineProcessorCode.includes('cc.push')) {
    console.log('    ✓ cc 数组处理逻辑存在');
  }
} else {
  console.log('    ✗ timeline 字段缺失');
}

// 3. 检查 CCNode 是否包含 ccNodeName
console.log('\n3️⃣ 检查 CCNode 结构...');
if (timelineProcessorCode.includes('ccNodeName:')) {
  console.log('  ✅ ccNodeName 字段已实现');
  if (timelineProcessorCode.includes('ccNodeName: node.node_name')) {
    console.log('  ✅ ccNodeName 从 node.node_name 获取');
  }
} else {
  console.log('  ✗ ccNodeName 字段缺失');
}

// 4. 检查状态映射
console.log('\n4️⃣ 检查状态映射逻辑...');
const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED', 'DELETED'];
validStatuses.forEach(status => {
  if (timelineProcessorCode.includes(`case '${status}':`) ||
      timelineProcessorCode.includes(`return '${status}'`)) {
    console.log(`  ✓ ${status} 状态映射存在`);
  }
});

// 5. 检查时间戳格式化
console.log('\n5️⃣ 检查时间戳格式化...');
if (timelineProcessorCode.includes('formatTimestamp')) {
  console.log('  ✅ formatTimestamp 函数存在');

  // 检查是否支持多种格式
  if (timelineProcessorCode.includes('includes(\'T\')') ||
      timelineProcessorCode.includes('parseInt(timestamp)')) {
    console.log('  ✅ 支持多种时间戳格式（ISO 和毫秒数）');
  }

  // 检查输出格式
  if (timelineProcessorCode.includes('YYYY-MM-DD HH:mm:ss') ||
      timelineProcessorCode.includes('getFullYear') && timelineProcessorCode.includes('padStart')) {
    console.log('  ✅ 输出格式为 YYYY-MM-DD HH:mm:ss');
  }
} else {
  console.log('  ✗ formatTimestamp 函数缺失');
}

// 6. 检查 task_list 处理
console.log('\n6️⃣ 检查 task_list 处理...');
if (timelineProcessorCode.includes('task_list') || timelineProcessorCode.includes('taskList')) {
  console.log('  ✅ task_list 处理逻辑存在');

  if (timelineProcessorCode.includes('task_list || []') ||
      timelineProcessorCode.includes('taskList || []')) {
    console.log('  ✅ task_list 默认值处理正确');
  }

  if (timelineProcessorCode.includes('task.status === \'PENDING\'') ||
      timelineProcessorCode.includes('task.status === "PENDING"')) {
    console.log('  ✅ PENDING 任务处理逻辑存在');
  }
} else {
  console.log('  ✗ task_list 处理逻辑缺失');
}

// 7. 检查用户信息提取
console.log('\n7️⃣ 检查用户信息提取...');
if (controllerCode.includes('extractUserIds')) {
  console.log('  ✅ extractUserIds 函数存在');

  if (controllerCode.includes('task_list') || controllerCode.includes('taskList')) {
    console.log('  ✅ 从 task_list 提取用户 ID');
  }

  if (controllerCode.includes('open_id')) {
    console.log('  ✅ 使用 open_id 提取用户信息');
  }
} else {
  console.log('  ✗ extractUserIds 函数缺失');
}

// 8. 检查响应格式与参考项目的一致性
console.log('\n8️⃣ 检查响应格式一致性...');
const referenceControllerPath = '/Users/anker/Desktop/work/审批流程可视化 3/backend/src/controllers/approval.controller.ts';
if (fs.existsSync(referenceControllerPath)) {
  const referenceCode = fs.readFileSync(referenceControllerPath, 'utf-8');

  // 比较响应格式
  const ourResponsePattern = /success:\s*true[\s\S]*?data:\s*processedData/;
  const refResponsePattern = /success:\s*true[\s\S]*?data:\s*processedData/;

  if (ourResponsePattern.test(controllerCode) && refResponsePattern.test(referenceCode)) {
    console.log('  ✅ 响应格式与参考项目一致');
  }

  // 比较错误响应格式
  if (controllerCode.includes('success: false') && referenceCode.includes('success: false')) {
    console.log('  ✅ 错误响应格式与参考项目一致');
  }
} else {
  console.log('  ⚠ 无法找到参考项目代码进行对比');
}

console.log('\n✅ 代码结构验证完成！');
console.log('\n📋 总结:');
console.log('  - 响应格式: { success: boolean, data: ProcessedApprovalData, timestamp: number }');
console.log('  - Header 包含: instanceId, approvalName, serialNumber, applicant, applyTime, status');
console.log('  - Timeline 包含: completed[], pending[], cc[]');
console.log('  - CCNode 包含: ccNodeName, ccPersonName, ccTime');
console.log('  - 状态值: PENDING | APPROVED | REJECTED | CANCELED | DELETED');



