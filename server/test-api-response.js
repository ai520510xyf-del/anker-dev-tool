/**
 * 测试脚本：校验后端 API 返回数据格式
 * 用于验证返回数据结构是否与参考项目一致
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';
const TEST_INSTANCE_ID = '447F8A25-3C7F-4B18-8F44-7242680D9477'; // 示例 ID，实际测试时需要替换

async function testAPIResponse() {
  console.log('🔍 开始校验后端 API 返回数据格式...\n');

  try {
    // 1. 测试健康检查端点
    console.log('1️⃣ 测试健康检查端点...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 健康检查通过:', JSON.stringify(healthResponse.data, null, 2));
    console.log('');

    // 2. 测试根端点
    console.log('2️⃣ 测试根端点...');
    const rootResponse = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ 根端点响应:', JSON.stringify(rootResponse.data, null, 2));
    console.log('');

    // 3. 测试审批详情端点（需要有效的 instanceId）
    console.log('3️⃣ 测试审批详情端点...');
    console.log(`   使用实例 ID: ${TEST_INSTANCE_ID}`);

    try {
      const approvalResponse = await axios.get(
        `${API_BASE_URL}/api/approval/${TEST_INSTANCE_ID}`,
        {
          headers: {
            'x-system-name': 'demo',
            'x-system-key': 'demo_secret_key_000'
          }
        }
      );

      const data = approvalResponse.data;

      // 验证响应结构
      console.log('✅ API 调用成功');
      console.log('\n📋 响应数据结构验证:');

      // 验证顶层结构
      if (data.success !== undefined) {
        console.log('  ✓ success 字段存在:', data.success);
      } else {
        console.log('  ✗ success 字段缺失');
      }

      if (data.data) {
        console.log('  ✓ data 字段存在');

        // 验证 header 结构
        if (data.data.header) {
          console.log('  ✓ data.header 存在');
          const header = data.data.header;

          const requiredHeaderFields = [
            'instanceId',
            'approvalName',
            'applicant',
            'applyTime',
            'status'
          ];

          console.log('\n  📝 Header 字段验证:');
          requiredHeaderFields.forEach(field => {
            if (header[field] !== undefined) {
              console.log(`    ✓ ${field}: ${typeof header[field]} = ${JSON.stringify(header[field]).substring(0, 50)}`);
            } else {
              console.log(`    ✗ ${field} 缺失`);
            }
          });

          // 验证状态值
          const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED', 'DELETED'];
          if (validStatuses.includes(header.status)) {
            console.log(`    ✓ status 值有效: ${header.status}`);
          } else {
            console.log(`    ✗ status 值无效: ${header.status}`);
          }
        } else {
          console.log('  ✗ data.header 缺失');
        }

        // 验证 timeline 结构
        if (data.data.timeline) {
          console.log('\n  📝 Timeline 结构验证:');
          const timeline = data.data.timeline;

          if (Array.isArray(timeline.completed)) {
            console.log(`    ✓ timeline.completed 是数组，长度: ${timeline.completed.length}`);
            if (timeline.completed.length > 0) {
              const firstNode = timeline.completed[0];
              console.log('      示例节点字段:', Object.keys(firstNode).join(', '));

              // 验证节点必需字段
              const requiredNodeFields = ['id', 'nodeName', 'nodeType', 'approverName', 'time', 'status'];
              requiredNodeFields.forEach(field => {
                if (firstNode[field] !== undefined) {
                  console.log(`        ✓ ${field}: ${JSON.stringify(firstNode[field]).substring(0, 30)}`);
                } else {
                  console.log(`        ✗ ${field} 缺失`);
                }
              });
            }
          } else {
            console.log('    ✗ timeline.completed 不是数组');
          }

          if (Array.isArray(timeline.pending)) {
            console.log(`    ✓ timeline.pending 是数组，长度: ${timeline.pending.length}`);
          } else {
            console.log('    ✗ timeline.pending 不是数组');
          }

          if (Array.isArray(timeline.cc)) {
            console.log(`    ✓ timeline.cc 是数组，长度: ${timeline.cc.length}`);
            if (timeline.cc.length > 0) {
              const firstCC = timeline.cc[0];
              console.log('      示例 CC 节点字段:', Object.keys(firstCC).join(', '));

              // 验证 CC 节点字段
              if (firstCC.ccNodeName !== undefined) {
                console.log(`        ✓ ccNodeName: ${firstCC.ccNodeName}`);
              } else {
                console.log('        ⚠ ccNodeName 缺失（可选字段）');
              }

              if (firstCC.ccPersonName !== undefined) {
                console.log(`        ✓ ccPersonName: ${firstCC.ccPersonName}`);
              } else {
                console.log('        ✗ ccPersonName 缺失');
              }
            }
          } else {
            console.log('    ✗ timeline.cc 不是数组');
          }
        } else {
          console.log('  ✗ data.timeline 缺失');
        }

        // 输出完整响应（格式化）
        console.log('\n📄 完整响应数据:');
        console.log(JSON.stringify(data, null, 2).substring(0, 2000) + '...');

      } else {
        console.log('  ✗ data 字段缺失');
      }

      if (data.timestamp !== undefined) {
        console.log('  ✓ timestamp 字段存在:', data.timestamp);
      } else {
        console.log('  ⚠ timestamp 字段缺失（可选字段）');
      }

    } catch (error) {
      if (error.response) {
        console.log('❌ API 调用失败:');
        console.log('  状态码:', error.response.status);
        console.log('  错误信息:', JSON.stringify(error.response.data, null, 2));

        // 验证错误响应格式
        if (error.response.data.success === false) {
          console.log('  ✓ 错误响应格式正确（包含 success: false）');
        }
        if (error.response.data.error) {
          console.log('  ✓ 错误响应包含 error 字段');
        }
      } else {
        console.log('❌ 网络错误:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
testAPIResponse()
  .then(() => {
    console.log('\n✅ 测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试异常:', error);
    process.exit(1);
  });



